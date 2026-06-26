import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, Base, SessionLocal, get_db
from routers import auth, asesor, cliente, comite
from seeder import seed_all_data
import models

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Dynamic schema migration: ensure 'dias_mora' column exists in 'creditos' table (brute-force approach)
try:
    from sqlalchemy import text
    with engine.begin() as conn:
        if engine.name == "sqlite":
            try:
                conn.execute(text("ALTER TABLE creditos ADD COLUMN dias_mora INTEGER DEFAULT 0"))
                print("Migration: added column dias_mora to creditos (SQLite)")
            except Exception:
                pass
        elif engine.name == "postgresql":
            try:
                conn.execute(text("ALTER TABLE creditos ADD COLUMN dias_mora INTEGER DEFAULT 0"))
                print("Migration: added column dias_mora to creditos (PostgreSQL)")
            except Exception as e:
                print(f"PostgreSQL Migration warning (expected if column already exists): {e}")
except Exception as e:
    print(f"Schema migration error: {e}")

app = FastAPI(
    title="Banco Andino Core Mobile & Transactional API",
    description="Backend unificado para conectar Fuerza de Ventas y Homebanking Móvil.",
    version="1.0.0"
)

# Enable CORS for emulator and web connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve upload files (signatures and photos)
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Auto-seed if database is empty (no users seeded yet)
db = SessionLocal()
try:
    user_count = db.query(models.UsuarioSeguridad).count()
    if user_count == 0:
        seed_all_data(db)
finally:
    db.close()

# Register Routers
app.include_router(auth.router)
app.include_router(asesor.router)
app.include_router(cliente.router)
app.include_router(comite.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "api": "Banco Andino Core API",
        "port": 8003,
        "database": engine.name,
        "version": "1.0.2 - brute_force_migration",
        "message": "Bienvenido al núcleo transaccional integrado de Banco Andino."
    }

@app.post("/seed", tags=["Utilidades"])
def trigger_seed(db: Session = Depends(get_db)):
    """Forzar reinicio y siembra limpia de la base de datos (Útil para corregir o reiniciar pruebas)."""
    seed_all_data(db)
    return {"status": "success", "message": "Base de datos restablecida y sembrada con éxito."}

if __name__ == "__main__":
    import uvicorn
    # Run server on port 8003 as required by the proposed architecture
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
