import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
import models
import auth_utils
from cases_data import CASES_METADATA

def seed_all_data(db: Session):
    print("Iniciando la siembra (seeding) de la base de datos...")
    
    # 1. Clean existing tables (in order of dependencies)
    db.query(models.AlertaCartera).delete()
    db.query(models.ConsultaBuro).delete()
    db.query(models.Movimiento).delete()
    db.query(models.Cronograma).delete()
    db.query(models.Credito).delete()
    db.query(models.SolicitudDocumento).delete()
    db.query(models.SolicitudCredito).delete()
    db.query(models.CuentaAhorro).delete()
    db.query(models.CreditoPreaprobado).delete()
    db.query(models.Cliente).delete()
    db.query(models.AsesorNegocio).delete()
    db.query(models.Agencia).delete()
    db.query(models.UsuarioSeguridad).delete()
    db.commit()

    # 2. Seed default Agency
    agencia_huancayo = models.Agencia(
        nombre="Agencia Huancayo Central",
        region="Junín",
        lat=-12.0678,
        lng=-75.2100,
        activa=True
    )
    db.add(agencia_huancayo)
    db.commit()
    db.refresh(agencia_huancayo)
    print("Agencia sembrada correctamente.")

    # 3. Seed default Advisor Users
    advisors_to_create = [
        {"username": "1001", "role": "operador", "nombres": "José", "apellidos": "Bacilio"},
        {"username": "2002", "role": "supervisor", "nombres": "Guillermo", "apellidos": "Peña"},
        {"username": "3003", "role": "administrador", "nombres": "Admin", "apellidos": "Agrobanco"}
    ]
    
    asesor_negocio_db = None
    for adv in advisors_to_create:
        user_sec = models.UsuarioSeguridad(
            username=adv["username"],
            password_hash=auth_utils.get_password_hash("agrobanco"),
            role=adv["role"]
        )
        db.add(user_sec)
        db.commit()
        db.refresh(user_sec)
        
        # Create AsesorNegocio record (profile)
        asesor_prof = models.AsesorNegocio(
            user_id=user_sec.id,
            codigo_empleado=adv["username"],
            nombres=adv["nombres"],
            apellidos=adv["apellidos"],
            agencia_id=agencia_huancayo.id,
            perfil=adv["role"],
            activo=True
        )
        db.add(asesor_prof)
        db.commit()
        db.refresh(asesor_prof)
        if adv["username"] == "1001":
            asesor_negocio_db = asesor_prof
            
    print("Asesores de negocio sembrados.")

    # 4. Seed Clientes, Cuentas de Ahorro y Usuarios de Seguridad Clientes
    for dni, meta in CASES_METADATA.items():
        # Create client security user (login with DNI)
        client_user = models.UsuarioSeguridad(
            username=dni,
            password_hash=auth_utils.get_password_hash("agrobanco"),
            role="cliente"
        )
        db.add(client_user)
        db.commit()
        db.refresh(client_user)

        # Split name into names and lastnames
        name_parts = meta["nombre"].split(" ", 1)
        nombres = name_parts[0]
        apellidos = name_parts[1] if len(name_parts) > 1 else "Quispe"

        # Create Client record
        client_db = models.Cliente(
            numero_documento=dni,
            tipo_documento="DNI",
            nombres=nombres,
            apellidos=apellidos,
            telefono=meta.get("telefono", "964110200"),
            direccion=meta.get("direccion", "Huancayo"),
            tipo_negocio="Microempresa",
            nombre_negocio=meta.get("negocio", "Negocio Personal"),
            antiguedad_negocio_meses=meta.get("antiguedad", 24),
            ingresos_estimados=meta.get("ingresos", 2000.0),
            gasto_mensual=meta.get("gastos", 1000.0),
            calificacion_sbs=meta.get("sbs_rating", "NORMAL"),
            lat=-12.0650,
            lng=-75.2050
        )
        db.add(client_db)
        db.commit()
        db.refresh(client_db)

        # Create Savings Account for the client
        savings_acc = models.CuentaAhorro(
            cliente_id=client_db.id,
            numero_cuenta=f"100-001-{dni}",
            saldo=500.0,  # S/ 500 initial deposit
            moneda="PEN"
        )
        db.add(savings_acc)
        db.commit()
        db.refresh(savings_acc)

        # Create a preapproved offer matching their requested amount
        preapproved = models.CreditoPreaprobado(
            cliente_id=client_db.id,
            asesor_id=asesor_negocio_db.id,
            monto_maximo=meta.get("monto_solicitado", 5000.0) * 1.2, # Preapprove 20% more
            plazo_sugerido_meses=meta.get("plazo", 12),
            tea_referencial=meta.get("tea", 40.92),
            score_confianza=meta.get("score_pre", 85),
            vigente=True,
            fecha_vencimiento=datetime.date.today() + datetime.timedelta(days=90)
        )
        db.add(preapproved)
        db.commit()

    print("Se completó la siembra de los 30 clientes de prueba, sus cuentas y ofertas.")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        seed_all_data(session)
    finally:
        session.close()
