import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

# Utility function to generate string UUIDs compatible with both SQLite and PostgreSQL
def generate_uuid():
    return str(uuid.uuid4())

class UsuarioSeguridad(Base):
    __tablename__ = "usuarios_seguridad"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    # DNI for clients, Employee Code for advisors
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    # roles: operador, supervisor, administrador, cliente
    role = Column(String(20), nullable=False, default="cliente")
    failed_attempts = Column(Integer, default=0)
    lock_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Agencia(Base):
    __tablename__ = "agencias"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    nombre = Column(String(100), nullable=False)
    region = Column(String(50), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AsesorNegocio(Base):
    __tablename__ = "asesores_negocio"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("usuarios_seguridad.id"), unique=True)
    codigo_empleado = Column(String(10), unique=True, nullable=False, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    agencia_id = Column(String(36), ForeignKey("agencias.id"))
    perfil = Column(String(20), default="operador")
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    agencia = relationship("Agencia")
    user = relationship("UsuarioSeguridad")

class Cliente(Base):
    __tablename__ = "clientes"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    numero_documento = Column(String(15), unique=True, nullable=False, index=True)
    tipo_documento = Column(String(5), default="DNI")
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    fecha_nacimiento = Column(Date, nullable=True)
    estado_civil = Column(String(15), default="Soltero")
    telefono = Column(String(15), nullable=True)
    email = Column(String(100), nullable=True)
    direccion = Column(String(255), nullable=True)
    tipo_negocio = Column(String(50), nullable=True)
    nombre_negocio = Column(String(100), nullable=True)
    antiguedad_negocio_meses = Column(Integer, default=0)
    ingresos_estimados = Column(Float, default=0.0)
    gasto_mensual = Column(Float, default=0.0)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    calificacion_sbs = Column(String(15), default="NORMAL") # NORMAL, CPP, CON PROBLEMAS, etc.
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class CreditoPreaprobado(Base):
    __tablename__ = "creditos_preaprobados"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cliente_id = Column(String(36), ForeignKey("clientes.id"))
    asesor_id = Column(String(36), ForeignKey("asesores_negocio.id"))
    monto_maximo = Column(Float, nullable=False)
    plazo_sugerido_meses = Column(Integer, default=12)
    tea_referencial = Column(Float, default=40.92)
    score_confianza = Column(Integer, default=85)
    vigente = Column(Boolean, default=True)
    fecha_calculo = Column(Date, default=datetime.date.today)
    fecha_vencimiento = Column(Date, nullable=True)

    cliente = relationship("Cliente")
    asesor = relationship("AsesorNegocio")

class SolicitudCredito(Base):
    __tablename__ = "solicitudes_credito"
    id = Column(String(36), primary_key=True, default=generate_uuid) # Expediente: e.g. EXP-2026-XXX or UUID
    expediente = Column(String(20), unique=True, nullable=False, index=True)
    cliente_id = Column(String(36), ForeignKey("clientes.id"))
    asesor_id = Column(String(36), ForeignKey("asesores_negocio.id"), nullable=True)
    monto_solicitado = Column(Float, nullable=False)
    plazo_meses = Column(Integer, nullable=False)
    tea = Column(Float, nullable=False)
    seguro_desgravamen = Column(Boolean, default=True)
    garantia_tipo = Column(String(50), default="sin garantia")
    destino = Column(String(255), nullable=True)
    # borrador -> enviado -> recibido_comite -> en_evaluacion -> aprobado / condicionado / rechazado -> desembolsado
    estado = Column(String(20), default="enviado")
    canal = Column(String(20), default="cliente") # cliente, asesor
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)
    observacion_visita = Column(String(255), nullable=True)
    lat_visita = Column(Float, nullable=True)
    lng_visita = Column(Float, nullable=True)
    fecha_visita = Column(DateTime, nullable=True)
    firma_path = Column(String(255), nullable=True)
    rechazado_motivo = Column(String(255), nullable=True)

    cliente = relationship("Cliente")
    asesor = relationship("AsesorNegocio")
    documentos = relationship("SolicitudDocumento", back_populates="solicitud")

class SolicitudDocumento(Base):
    __tablename__ = "solicitudes_documentos"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    solicitud_id = Column(String(36), ForeignKey("solicitudes_credito.id"))
    tipo_documento = Column(String(30)) # DNI_FRONT, DNI_BACK, NEGOCIO_FOTO, VISITA_FOTO, FIRMA
    file_path = Column(String(255))
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    solicitud = relationship("SolicitudCredito", back_populates="documentos")

class CuentaAhorro(Base):
    __tablename__ = "cuentas_ahorro"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cliente_id = Column(String(36), ForeignKey("clientes.id"))
    numero_cuenta = Column(String(20), unique=True, nullable=False, index=True)
    saldo = Column(Float, default=0.0)
    moneda = Column(String(3), default="PEN")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cliente = relationship("Cliente")

class Credito(Base):
    __tablename__ = "creditos"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    solicitud_id = Column(String(36), ForeignKey("solicitudes_credito.id"), unique=True)
    cliente_id = Column(String(36), ForeignKey("clientes.id"))
    asesor_id = Column(String(36), ForeignKey("asesores_negocio.id"))
    producto = Column(String(50), default="Crédito Empresarial - Microempresa")
    monto_desembolsado = Column(Float, nullable=False)
    plazo_meses = Column(Integer, nullable=False)
    tea = Column(Float, nullable=False)
    # vigente, pagado, vencido, castigado
    estado = Column(String(20), default="vigente")
    fecha_desembolso = Column(Date, nullable=False)
    fecha_vencimiento = Column(Date, nullable=False)
    saldo_actual = Column(Float, nullable=False)
    cuotas_total = Column(Integer, nullable=False)
    cuotas_pagadas = Column(Integer, default=0)
    dias_mora = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cliente = relationship("Cliente")
    asesor = relationship("AsesorNegocio")
    solicitud = relationship("SolicitudCredito")

class Cronograma(Base):
    __tablename__ = "cronogramas"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    credito_id = Column(String(36), ForeignKey("creditos.id"))
    numero_cuota = Column(Integer, nullable=False)
    fecha_pago = Column(Date, nullable=False)
    monto_cuota = Column(Float, nullable=False)
    capital = Column(Float, nullable=False)
    interes = Column(Float, nullable=False)
    saldo_pendiente = Column(Float, nullable=False) # Saldo despues de pagar esta cuota
    # pendiente, pagado, vencido
    estado = Column(String(20), default="pendiente")
    fecha_pagada = Column(Date, nullable=True)

    credito = relationship("Credito")

class Movimiento(Base):
    __tablename__ = "movimientos"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cuenta_id = Column(String(36), ForeignKey("cuentas_ahorro.id"))
    credito_id = Column(String(36), ForeignKey("creditos.id"), nullable=True)
    # DESEMBOLSO, PAGO_CUOTA, TRANSFERENCIA_SALIDA, TRANSFERENCIA_ENTRADA
    tipo = Column(String(30), nullable=False)
    monto = Column(Float, nullable=False)
    descripcion = Column(String(255), nullable=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cuenta = relationship("CuentaAhorro")
    credito = relationship("Credito")

class ConsultaBuro(Base):
    __tablename__ = "consultas_buro"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cliente_id = Column(String(36), ForeignKey("clientes.id"))
    asesor_id = Column(String(36), ForeignKey("asesores_negocio.id"))
    score = Column(Integer, nullable=False)
    calificacion_sbs = Column(String(15), nullable=False)
    inhabilitado = Column(Boolean, default=False)
    fecha_consulta = Column(DateTime, default=datetime.datetime.utcnow)

    cliente = relationship("Cliente")
    asesor = relationship("AsesorNegocio")

class AlertaCartera(Base):
    __tablename__ = "alertas_cartera"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cliente_id = Column(String(36), ForeignKey("clientes.id"))
    asesor_id = Column(String(36), ForeignKey("asesores_negocio.id"))
    tipo_alerta = Column(String(30)) # MORA, NUEVA_SOLICITUD, ETC
    descripcion = Column(String(255))
    leida = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cliente = relationship("Cliente")
    asesor = relationship("AsesorNegocio")
