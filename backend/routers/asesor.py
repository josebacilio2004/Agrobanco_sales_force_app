import os
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
import models
import auth_utils
from cases_data import CASES_METADATA

router = APIRouter(
    prefix="/fv",
    tags=["Fuerza de Ventas"]
)

security = HTTPBearer()

def get_current_advisor(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = auth_utils.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de sesión inválido o expirado"
        )
    if payload.get("role") not in ["operador", "supervisor", "administrador"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido. Solo asesores autorizados."
        )
    username = payload.get("sub")
    advisor = db.query(models.AsesorNegocio).filter(models.AsesorNegocio.codigo_empleado == username).first()
    if not advisor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de asesor no encontrado"
        )
    return advisor

@router.get("/cartera")
def get_cartera(advisor: models.AsesorNegocio = Depends(get_current_advisor), db: Session = Depends(get_db)):
    # Fetch all clients
    clients = db.query(models.Cliente).all()
    
    cartera_items = []
    for client in clients:
        # Check if client has a pending or active credit application assigned to this advisor
        # (or unassigned because registered by client)
        active_req = db.query(models.SolicitudCredito).filter(
            models.SolicitudCredito.cliente_id == client.id,
            models.SolicitudCredito.estado.in_(["enviado", "recibido_comite", "en_evaluacion"])
        ).first()
        
        # Check if they have overdue credits for recovery
        overdue_credit = db.query(models.Credito).filter(
            models.Credito.cliente_id == client.id,
            models.Credito.estado == "vencido"
        ).first()
        
        # Default status/priorities based on cases metadata
        meta = CASES_METADATA.get(client.numero_documento, {})
        
        status_fv = "SEGUIMIENTO"
        priority = "NORMAL"
        is_visited = False
        
        if active_req:
            status_fv = "NUEVA_SOLICITUD"
            priority = "ALTA" if meta.get("monto_solicitado", 0.0) >= 10000.0 else "NORMAL"
            is_visited = active_req.lat_visita is not None
        elif overdue_credit:
            status_fv = "RECUPERACIÓN MORA"
            priority = "ALTA"
        elif meta.get("decision") == "APROBADO":
            status_fv = "RENOVACIÓN"
            priority = "MEDIA"
            
        cartera_items.append({
            "id": client.id,
            "name": f"{client.nombres} {client.apellidos}",
            "dni": client.numero_documento,
            "status": status_fv,
            "loanAmount": meta.get("monto_solicitado", 5000.0),
            "dueDate": (datetime.datetime.now() + datetime.timedelta(days=15)).strftime("%Y-%m-%dT%H:%M:%S"),
            "location": client.direccion,
            "priority": priority,
            "isVisited": is_visited
        })
        
    return cartera_items

@router.get("/cliente/{dni_or_id}")
def get_client_details(dni_or_id: str, advisor: models.AsesorNegocio = Depends(get_current_advisor), db: Session = Depends(get_db)):
    client = db.query(models.Cliente).filter(
        (models.Cliente.numero_documento == dni_or_id) | (models.Cliente.id == dni_or_id)
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    meta = CASES_METADATA.get(client.numero_documento, {})
    
    # Check if there is an active solicitud
    active_req = db.query(models.SolicitudCredito).filter(
        models.SolicitudCredito.cliente_id == client.id,
        models.SolicitudCredito.estado.in_(["enviado", "recibido_comite", "en_evaluacion"])
    ).first()
    
    # Calculate pre-evaluation result dynamically or read from case metadata
    # Income/Expenses checking
    disposable_income = client.ingresos_estimados - client.gasto_mensual
    # Basic capacity to pay: is disposable income positive and enough for 30% payment?
    scoring_status = "APTO"
    score_points = 85
    
    if meta.get("pre_evaluacion") == "NO_PROCEDE" or disposable_income <= 500:
        scoring_status = "NO_PROCEDE"
        score_points = 60
        
    return {
        "id": client.id,
        "nombres": client.nombres,
        "apellidos": client.apellidos,
        "dni": client.numero_documento,
        "telefono": client.telefono,
        "direccion": client.direccion,
        "antiguedad_meses": client.antiguedad_negocio_meses,
        "nombre_negocio": client.nombre_negocio,
        "ingresos": client.ingresos_estimados,
        "gastos": client.gasto_mensual,
        "calificacion_sbs": client.calificacion_sbs,
        "scoring_apto": scoring_status,
        "scoring_confianza": score_points,
        "solicitud_id": active_req.id if active_req else None,
        "solicitud_estado": active_req.estado if active_req else None,
        "solicitud_monto": active_req.monto_solicitado if active_req else None,
        "solicitud_plazo": active_req.plazo_meses if active_req else None
    }

@router.post("/buro/consultar")
def consultar_buro(req: dict, advisor: models.AsesorNegocio = Depends(get_current_advisor), db: Session = Depends(get_db)):
    dni = req.get("dni")
    if not dni:
        raise HTTPException(status_code=400, detail="DNI requerido")
        
    client = db.query(models.Cliente).filter(models.Cliente.numero_documento == dni).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no registrado en el sistema")
        
    meta = CASES_METADATA.get(dni, {})
    
    # Rule check for blocked users (e.g. Aquiles Mamani, Caso 28)
    if meta.get("inhabilitado", False):
        # Log failed check due to blacklist
        buro_log = models.ConsultaBuro(
            cliente_id=client.id,
            asesor_id=advisor.id,
            score=350,
            calificacion_sbs="PERDIDA",
            inhabilitado=True
        )
        db.add(buro_log)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RECHAZADO. Cliente se encuentra registrado en la lista de inhabilitados del sistema financiero."
        )

    # Save bureau log
    score = 850 if meta.get("sbs_rating") == "NORMAL" else (650 if meta.get("sbs_rating") == "CPP" else 450)
    buro_log = models.ConsultaBuro(
        cliente_id=client.id,
        asesor_id=advisor.id,
        score=score,
        calificacion_sbs=meta.get("sbs_rating", "NORMAL"),
        inhabilitado=False
    )
    db.add(buro_log)
    db.commit()
    
    return {
        "dni": dni,
        "score": score,
        "sbs_rating": meta.get("sbs_rating", "NORMAL"),
        "entidades_deuda": meta.get("entidades_deuda", 1),
        "deuda_total": meta.get("deuda_total", 3000.0),
        "mora_max": meta.get("mora_max", 0),
        "recomendacion": "RECOMENDADO" if score >= 650 else "NO PROCEDE"
    }

@router.post("/solicitud/visita")
def registrar_visita(req: dict, advisor: models.AsesorNegocio = Depends(get_current_advisor), db: Session = Depends(get_db)):
    solicitud_id = req.get("solicitud_id")
    lat = req.get("lat")
    lng = req.get("lng")
    observacion = req.get("observacion")
    
    solicitud = db.query(models.SolicitudCredito).filter(models.SolicitudCredito.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
    solicitud.lat_visita = lat
    solicitud.lng_visita = lng
    solicitud.observacion_visita = observacion
    solicitud.fecha_visita = datetime.datetime.utcnow()
    solicitud.asesor_id = advisor.id
    solicitud.estado = "en_evaluacion"
    
    db.commit()
    return {"status": "Visita registrada correctamente", "estado": solicitud.estado}

@router.post("/solicitud/documentos")
def subir_documento(
    solicitud_id: str = Form(...),
    tipo_documento: str = Form(...),
    file: UploadFile = File(...),
    advisor: models.AsesorNegocio = Depends(get_current_advisor),
    db: Session = Depends(get_db)
):
    solicitud = db.query(models.SolicitudCredito).filter(models.SolicitudCredito.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
    # Save file locally
    os.makedirs("uploads", exist_ok=True)
    filename = f"{solicitud_id}_{tipo_documento}_{file.filename}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
        
    # Register document
    doc = models.SolicitudDocumento(
        solicitud_id=solicitud_id,
        tipo_documento=tipo_documento,
        file_path=file_path
    )
    db.add(doc)
    
    # If it is a signature, update the request signature path
    if tipo_documento == "FIRMA":
        solicitud.firma_path = file_path
        
    db.commit()
    return {"status": "Documento guardado", "file_path": file_path}

@router.post("/solicitud/promover")
def promover_solicitud(req: dict, advisor: models.AsesorNegocio = Depends(get_current_advisor), db: Session = Depends(get_db)):
    solicitud_id = req.get("solicitud_id")
    solicitud = db.query(models.SolicitudCredito).filter(models.SolicitudCredito.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
    # Check if they completed visit and signature
    if not solicitud.firma_path:
        raise HTTPException(status_code=400, detail="Debe adjuntar la firma del cliente antes de promover al comité.")
        
    solicitud.estado = "recibido_comite"
    db.commit()
    
    return {"status": "Expediente promovido al comité de evaluación", "estado": solicitud.estado}

@router.get("/solicitudes")
def get_solicitudes(advisor: models.AsesorNegocio = Depends(get_current_advisor), db: Session = Depends(get_db)):
    solicitudes = db.query(models.SolicitudCredito).all()
    
    status_mapping = {
        "enviado": "Enviadas",
        "en_evaluacion": "En Comité",
        "recibido_comite": "En Comité",
        "aprobado": "Aprobadas",
        "condicionado": "Aprobadas",
        "desembolsado": "Desembolsadas",
        "rechazado": "Rechazadas"
    }
    
    color_mapping = {
        "Enviadas": 0xFF00B0FF,     # Blue
        "En Comité": 0xFFFFD600,    # Yellow
        "Aprobadas": 0xFF00C853,    # Green
        "Desembolsadas": 0xFF00E676, # Green/Primary
        "Rechazadas": 0xFFFF1744    # Red
    }
    
    progress_mapping = {
        "Enviadas": 0.2,
        "En Comité": 0.5,
        "Aprobadas": 0.8,
        "Desembolsadas": 1.0,
        "Rechazadas": 0.0
    }
    
    res_list = []
    for sol in solicitudes:
        status_name = status_mapping.get(sol.estado, "Enviadas")
        
        if sol.estado == "desembolsado":
            date_str = f"Completado {sol.fecha_creacion.strftime('%d/%m/%Y')}"
        elif sol.estado == "rechazado":
            date_str = f"Rechado: {sol.rechazado_motivo or 'No califica'}"
        else:
            date_str = f"Enviado el {sol.fecha_creacion.strftime('%d/%m/%Y')}"
            
        analyst_name = f"Ing. {sol.asesor.nombres} {sol.asesor.apellidos}" if sol.asesor else "Sin asignar"
        
        notes = []
        if sol.observacion_visita:
            notes.append(sol.observacion_visita)
        if sol.firma_path:
            notes.append("Firma digital validada.")
        if sol.estado == "rechazado" and sol.rechazado_motivo:
            notes.append(sol.rechazado_motivo)
            
        res_list.append({
            "id": sol.expediente,
            "name": f"{sol.cliente.nombres} {sol.cliente.apellidos}".upper(),
            "amount": f"S/ {sol.monto_solicitado:,.2f}",
            "status": status_name,
            "date": date_str,
            "colorValue": color_mapping.get(status_name, 0xFF00B0FF),
            "progress": progress_mapping.get(status_name, 0.2),
            "analyst": analyst_name,
            "notes": notes
        })
        
    return res_list

