import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
from cases_data import CASES_METADATA

router = APIRouter(
    prefix="/comite",
    tags=["Comité de Crédito & Desembolso"]
)

# Amortization calculation helper (French System)
def calculate_cronograma(amount: float, term_months: int, tea: float, start_date: datetime.date):
    tem = (1 + tea / 100.0) ** (1.0 / 12.0) - 1.0
    cuota = amount * (tem * (1 + tem) ** term_months) / ((1 + tem) ** term_months - 1)
    
    installments = []
    outstanding_balance = amount
    current_date = start_date
    
    for i in range(1, term_months + 1):
        # Calculate interest for this month
        interest = outstanding_balance * tem
        # Capital payment
        capital = cuota - interest
        # New outstanding balance
        outstanding_balance = outstanding_balance - capital
        
        # Advance date by 1 month
        # Simplistic date calculation: add 30 days or advance month
        # Let's advance month:
        year = current_date.year
        month = current_date.month + 1
        if month > 12:
            month = 1
            year += 1
        day = min(current_date.day, 28) # Keep it safe
        current_date = datetime.date(year, month, day)
        
        installments.append({
            "numero_cuota": i,
            "fecha_pago": current_date,
            "monto_cuota": round(cuota, 2),
            "capital": round(capital, 2),
            "interes": round(interest, 2),
            "saldo_pendiente": round(max(0.0, outstanding_balance), 2)
        })
        
    # Adjustment for the last installment due to float rounding
    diff = amount - sum(inst["capital"] for inst in installments)
    if abs(diff) > 0.01:
        installments[-1]["capital"] = round(installments[-1]["capital"] + diff, 2)
        installments[-1]["interes"] = round(installments[-1]["monto_cuota"] - installments[-1]["capital"], 2)
        installments[-1]["saldo_pendiente"] = 0.0
        
    return installments

@router.post("/procesar/{solicitud_id}")
def procesar_decision_comite(solicitud_id: str, db: Session = Depends(get_db)):
    solicitud = db.query(models.SolicitudCredito).filter(models.SolicitudCredito.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
    if solicitud.estado in ["aprobado", "condicionado", "rechazado", "desembolsado"]:
        raise HTTPException(status_code=400, detail="Esta solicitud ya fue procesada por el comité")
        
    client = db.query(models.Cliente).filter(models.Cliente.id == solicitud.cliente_id).first()
    meta = CASES_METADATA.get(client.numero_documento, {})
    
    decision = meta.get("decision", "APROBADO")
    monto_aprobado = meta.get("monto_aprobado", solicitud.monto_solicitado)
    motivo_rechazo = meta.get("rechazo_motivo", "No cumple con las políticas internas de crédito.")
    
    if decision == "RECHAZADO":
        solicitud.estado = "rechazado"
        solicitud.rechazado_motivo = motivo_rechazo
        db.commit()
        return {
            "expediente": solicitud.expediente,
            "decision": "RECHAZADO",
            "motivo": motivo_rechazo,
            "monto_aprobado": 0.0
        }
        
    elif decision == "CONDICIONADO":
        solicitud.estado = "condicionado"
        db.commit()
        # Fall through to disbursement of the reduced amount
        
    elif decision == "APROBADO":
        solicitud.estado = "aprobado"
        db.commit()

    # --- DESEMBOLSO PROCESS ---
    # 1. Fetch client savings account
    account = db.query(models.CuentaAhorro).filter(models.CuentaAhorro.cliente_id == client.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta de ahorros del cliente no encontrada")

    # 2. Update status to disbursed
    solicitud.estado = "desembolsado"
    
    # 3. Create active Credit
    desembolso_fecha = datetime.date.today()
    # Credit expires in 'plazo_meses' months
    vencimiento_fecha = desembolso_fecha + datetime.timedelta(days=30 * solicitud.plazo_meses)
    
    credito = models.Credito(
        solicitud_id=solicitud.id,
        cliente_id=client.id,
        asesor_id=solicitud.asesor_id or db.query(models.AsesorNegocio).first().id, # Fallback to first advisor
        monto_desembolsado=monto_aprobado,
        plazo_meses=solicitud.plazo_meses,
        tea=solicitud.tea,
        estado="vigente",
        fecha_desembolso=desembolso_fecha,
        fecha_vencimiento=vencimiento_fecha,
        saldo_actual=monto_aprobado,
        cuotas_total=solicitud.plazo_meses,
        cuotas_pagadas=0
    )
    db.add(credito)
    db.commit()
    db.refresh(credito)

    # 4. Generate payment schedule (Cronograma)
    installments_data = calculate_cronograma(
        amount=monto_aprobado,
        term_months=solicitud.plazo_meses,
        tea=solicitud.tea,
        start_date=desembolso_fecha
    )
    
    for inst in installments_data:
        cron_row = models.Cronograma(
            credito_id=credito.id,
            numero_cuota=inst["numero_cuota"],
            fecha_pago=inst["fecha_pago"],
            monto_cuota=inst["monto_cuota"],
            capital=inst["capital"],
            interes=inst["interes"],
            saldo_pendiente=inst["saldo_pendiente"],
            estado="pendiente"
        )
        db.add(cron_row)

    # 5. Deposit into savings account
    account.saldo += monto_aprobado
    
    # 6. Log transaction movement
    mov = models.Movimiento(
        cuenta_id=account.id,
        credito_id=credito.id,
        tipo="DESEMBOLSO",
        monto=monto_aprobado,
        descripcion=f"Desembolso de Crédito Empresarial - Expediente {solicitud.expediente}"
    )
    db.add(mov)
    db.commit()

    return {
        "expediente": solicitud.expediente,
        "decision": decision,
        "monto_solicitado": solicitud.monto_solicitado,
        "monto_aprobado": monto_aprobado,
        "estado": solicitud.estado,
        "nuevo_saldo_cuenta": account.saldo,
        "plazo": solicitud.plazo_meses,
        "tea": solicitud.tea
    }
