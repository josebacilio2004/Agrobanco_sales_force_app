import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
import models
import auth_utils

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)

class LoginRequest(BaseModel):
    username: str # DNI (for clients) or Employee Code (for advisors)
    password: str

class LoginResponse(BaseModel):
    token: str
    role: str
    username: str
    fullName: str
    code: str

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # Look up security user
    user = db.query(models.UsuarioSeguridad).filter(models.UsuarioSeguridad.username == req.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # Check if locked
    now = datetime.datetime.utcnow()
    if user.lock_until and user.lock_until > now:
        remaining = int((user.lock_until - now).total_seconds())
        minutes = remaining // 60
        seconds = remaining % 60
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cuenta bloqueada por seguridad. Reintente en {minutes:02d}:{seconds:02d}."
        )

    # Verify password
    if auth_utils.verify_password(req.password, user.password_hash):
        # Reset failed attempts on success
        user.failed_attempts = 0
        user.lock_until = None
        db.commit()
        
        # Determine Full Name
        full_name = "Cliente Banco Andino"
        code = user.username
        
        if user.role == "cliente":
            client = db.query(models.Cliente).filter(models.Cliente.numero_documento == user.username).first()
            if client:
                full_name = f"{client.nombres} {client.apellidos}"
        else:
            advisor = db.query(models.AsesorNegocio).filter(models.AsesorNegocio.codigo_empleado == user.username).first()
            if advisor:
                full_name = f"{advisor.nombres} {advisor.apellidos}"
                code = advisor.codigo_empleado

        # Create JWT token
        token_data = {
            "sub": user.username,
            "role": user.role,
            "id": user.id
        }
        token = auth_utils.create_access_token(token_data)
        
        return LoginResponse(
            token=token,
            role=user.role,
            username=user.username,
            fullName=full_name,
            code=code
        )
    else:
        # Increment failed attempts
        user.failed_attempts += 1
        if user.failed_attempts >= 5:
            user.lock_until = now + datetime.timedelta(minutes=30)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cuenta bloqueada por seguridad. 5 intentos fallidos superados. Bloqueado por 30 minutos."
            )
        else:
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Credenciales incorrectas. Intento {user.failed_attempts} de 5."
            )
