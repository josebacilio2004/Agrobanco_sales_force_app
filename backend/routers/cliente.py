import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
import models
import auth_utils
from cases_data import CASES_METADATA

router = APIRouter(
    prefix="/cliente",
    tags=["Home Banking Clientes"]
)

security = HTTPBearer()

def get_current_client(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = auth_utils.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de sesión inválido o expirado"
        )
    if payload.get("role") != "cliente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido a clientes."
        )
    username = payload.get("sub")
    client = db.query(models.Cliente).filter(models.Cliente.numero_documento == username).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de cliente no encontrado"
        )
    return client

class SolicitudCreateRequest(BaseModel):
    monto: float
    plazo: int
    tea: float
    seguro: bool
    garantia: str
    destino: str

@router.get("/resumen")
def get_resumen(client: models.Cliente = Depends(get_current_client), db: Session = Depends(get_db)):
    # 1. Accounts
    accounts = db.query(models.CuentaAhorro).filter(models.CuentaAhorro.cliente_id == client.id).all()
    
    # 2. Active Credits
    credits_list = db.query(models.Credito).filter(models.Credito.cliente_id == client.id).all()
    
    # 3. Solicitudes de Crédito en Trámite
    solicitudes = db.query(models.SolicitudCredito).filter(
        models.SolicitudCredito.cliente_id == client.id
    ).order_by(models.SolicitudCredito.fecha_creacion.desc()).all()
    
    # 4. Recent Movements
    movements = []
    for acc in accounts:
        acc_movs = db.query(models.Movimiento).filter(models.Movimiento.cuenta_id == acc.id).order_by(models.Movimiento.fecha.desc()).limit(10).all()
        for mov in acc_movs:
            movements.append({
                "id": mov.id,
                "cuenta_numero": acc.numero_cuenta,
                "tipo": mov.tipo,
                "monto": mov.monto,
                "descripcion": mov.descripcion,
                "fecha": mov.fecha.strftime("%Y-%m-%d %H:%M:%S")
            })
            
    # Sort movements globally by date
    movements.sort(key=lambda x: x["fecha"], reverse=True)
    
    return {
        "cliente": {
            "nombres": client.nombres,
            "apellidos": client.apellidos,
            "dni": client.numero_documento,
            "calificacion_sbs": client.calificacion_sbs
        },
        "cuentas": [
            {
                "id": acc.id,
                "numero_cuenta": acc.numero_cuenta,
                "saldo": acc.saldo,
                "moneda": acc.moneda
            } for acc in accounts
        ],
        "creditos": [
            {
                "id": cred.id,
                "producto": cred.producto,
                "monto": cred.monto_desembolsado,
                "saldo_actual": cred.saldo_actual,
                "plazo": cred.plazo_meses,
                "cuotas_total": cred.cuotas_total,
                "cuotas_pagadas": cred.cuotas_pagadas,
                "tea": cred.tea,
                "fecha_vencimiento": cred.fecha_vencimiento.strftime("%Y-%m-%d"),
                "estado": cred.estado
            } for cred in credits_list
        ],
        "solicitudes": [
            {
                "id": sol.id,
                "expediente": sol.expediente,
                "monto": sol.monto_solicitado,
                "plazo": sol.plazo_meses,
                "tea": sol.tea,
                "estado": sol.estado,
                "fecha": sol.fecha_creacion.strftime("%Y-%m-%d"),
                "observacion": sol.observacion_visita
            } for sol in solicitudes
        ],
        "movimientos": movements[:10]
    }

@router.post("/solicitud/crear")
def crear_solicitud(req: SolicitudCreateRequest, client: models.Cliente = Depends(get_current_client), db: Session = Depends(get_db)):
    # Check if there is already a pending credit request
    pending = db.query(models.SolicitudCredito).filter(
        models.SolicitudCredito.cliente_id == client.id,
        models.SolicitudCredito.estado.in_(["enviado", "recibido_comite", "en_evaluacion"])
    ).first()
    
    if pending:
        raise HTTPException(
            status_code=400,
            detail="Ya tiene una solicitud de crédito en trámite bajo el expediente " + pending.expediente
        )
        
    # Generate expediente number
    count = db.query(models.SolicitudCredito).count()
    expediente_code = f"EXP-2026-{count + 1:03d}"
    
    new_sol = models.SolicitudCredito(
        expediente=expediente_code,
        cliente_id=client.id,
        monto_solicitado=req.monto,
        plazo_meses=req.plazo,
        tea=req.tea,
        seguro_desgravamen=req.seguro,
        garantia_tipo=req.garantia,
        destino=req.destino,
        estado="enviado",
        canal="cliente"
    )
    db.add(new_sol)
    db.commit()
    db.refresh(new_sol)
    
    return {
        "status": "Solicitud registrada correctamente",
        "expediente": new_sol.expediente,
        "solicitud_id": new_sol.id
    }

@router.get("/credito/{credito_id}/cronograma")
def get_cronograma(credito_id: str, client: models.Cliente = Depends(get_current_client), db: Session = Depends(get_db)):
    # Verify ownership
    credito = db.query(models.Credito).filter(models.Credito.id == credito_id, models.Credito.cliente_id == client.id).first()
    if not credito:
        raise HTTPException(status_code=404, detail="Crédito no encontrado o no pertenece a este usuario.")
        
    cronograma_list = db.query(models.Cronograma).filter(models.Cronograma.credito_id == credito_id).order_by(models.Cronograma.numero_cuota.asc()).all()
    
    return [
        {
            "id": cuota.id,
            "numero_cuota": cuota.numero_cuota,
            "fecha_pago": cuota.fecha_pago.strftime("%Y-%m-%d"),
            "monto_cuota": cuota.monto_cuota,
            "capital": cuota.capital,
            "interes": cuota.interes,
            "saldo_pendiente": cuota.saldo_pendiente,
            "estado": cuota.estado,
            "fecha_pagada": cuota.fecha_pagada.strftime("%Y-%m-%d") if cuota.fecha_pagada else None
        } for cuota in cronograma_list
    ]

@router.post("/operaciones/pagar")
def pagar_cuota(req: dict, client: models.Cliente = Depends(get_current_client), db: Session = Depends(get_db)):
    credito_id = req.get("credito_id")
    cuota_id = req.get("cuota_id")
    
    # 1. Fetch details
    credito = db.query(models.Credito).filter(models.Credito.id == credito_id, models.Credito.cliente_id == client.id).first()
    cuota = db.query(models.Cronograma).filter(models.Cronograma.id == cuota_id, models.Cronograma.credito_id == credito_id).first()
    
    if not credito or not cuota:
        raise HTTPException(status_code=404, detail="Crédito o Cuota no encontrados")
        
    if cuota.estado == "pagado":
        raise HTTPException(status_code=400, detail="Esta cuota ya ha sido cancelada")

    # 2. Verify account balance
    account = db.query(models.CuentaAhorro).filter(models.CuentaAhorro.cliente_id == client.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta de ahorros para el débito no encontrada")
        
    if account.saldo < cuota.monto_cuota:
        raise HTTPException(
            status_code=400,
            detail=f"Saldo insuficiente. Saldo disponible: S/ {account.saldo:.2f}. Monto de cuota: S/ {cuota.monto_cuota:.2f}"
        )
        
    # 3. Perform Transaction
    account.saldo -= cuota.monto_cuota
    cuota.estado = "pagado"
    cuota.fecha_pagada = datetime.date.today()
    
    # Update credit counters
    credito.cuotas_pagadas += 1
    credito.saldo_actual = max(0.0, cuota.saldo_pendiente) # Update outstanding balance
    
    if credito.cuotas_pagadas >= credito.cuotas_total:
        credito.estado = "pagado"
        
    # Create Movement Log
    mov = models.Movimiento(
        cuenta_id=account.id,
        credito_id=credito.id,
        tipo="PAGO_CUOTA",
        monto=cuota.monto_cuota,
        descripcion=f"Pago Cuota N° {cuota.numero_cuota} de Crédito - Expediente {credito.solicitud.expediente}"
    )
    db.add(mov)
    db.commit()
    
    return {
        "status": "Pago exitoso",
        "nuevo_saldo_ahorros": account.saldo,
        "saldo_pendiente_credito": credito.saldo_actual,
        "cuotas_restantes": credito.cuotas_total - credito.cuotas_pagadas
    }

@router.post("/operaciones/transferir")
def transferir(req: dict, client: models.Cliente = Depends(get_current_client), db: Session = Depends(get_db)):
    cuenta_origen_id = req.get("cuenta_origen_id")
    cuenta_destino_numero = req.get("cuenta_destino_numero")
    monto = req.get("monto")
    
    if not monto or monto <= 0:
        raise HTTPException(status_code=400, detail="Monto inválido")
        
    # Find source
    src_acc = db.query(models.CuentaAhorro).filter(
        models.CuentaAhorro.id == cuenta_origen_id,
        models.CuentaAhorro.cliente_id == client.id
    ).first()
    
    # Find destination
    dest_acc = db.query(models.CuentaAhorro).filter(
        models.CuentaAhorro.numero_cuenta == cuenta_destino_numero
    ).first()
    
    if not src_acc:
        raise HTTPException(status_code=404, detail="Cuenta de origen no válida")
    if not dest_acc:
        raise HTTPException(status_code=404, detail="Cuenta de destino no encontrada")
        
    if src_acc.id == dest_acc.id:
        raise HTTPException(status_code=400, detail="No se permiten transferencias a la misma cuenta")
        
    if src_acc.saldo < monto:
        raise HTTPException(status_code=400, detail="Saldo insuficiente en la cuenta de origen")
        
    # Execute Transfer
    src_acc.saldo -= monto
    dest_acc.saldo += monto
    
    # Create Movements
    mov_out = models.Movimiento(
        cuenta_id=src_acc.id,
        tipo="TRANSFERENCIA_SALIDA",
        monto=monto,
        descripcion=f"Transferencia enviada a cta {dest_acc.numero_cuenta} de {dest_acc.cliente.nombres}"
    )
    mov_in = models.Movimiento(
        cuenta_id=dest_acc.id,
        tipo="TRANSFERENCIA_ENTRADA",
        monto=monto,
        descripcion=f"Transferencia recibida de cta {src_acc.numero_cuenta} de {client.nombres}"
    )
    db.add(mov_out)
    db.add(mov_in)
    db.commit()
    
    return {
        "status": "Transferencia realizada con éxito",
        "nuevo_saldo": src_acc.saldo
    }
