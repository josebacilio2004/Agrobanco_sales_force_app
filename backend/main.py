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

# Dynamic schema migration: ensure all columns defined in models exist in the database tables
try:
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    
    def get_column_sql_type(col_type_obj, dialect_name):
        col_type_str = str(col_type_obj).upper()
        if "DATETIME" in col_type_str or "TIMESTAMP" in col_type_str:
            return "TIMESTAMP"
        if "DATE" in col_type_str:
            return "DATE"
        if "VARCHAR" in col_type_str or "STRING" in col_type_str:
            return col_type_str
        if "INTEGER" in col_type_str or "INT" in col_type_str:
            return "INTEGER"
        if "FLOAT" in col_type_str or "REAL" in col_type_str or "DOUBLE" in col_type_str:
            return "DOUBLE PRECISION" if dialect_name == "postgresql" else "REAL"
        if "BOOLEAN" in col_type_str or "BOOL" in col_type_str:
            return "BOOLEAN"
        return col_type_str

    for table_name, table in Base.metadata.tables.items():
        if table_name in inspector.get_table_names():
            db_columns = [col["name"] for col in inspector.get_columns(table_name)]
            for col in table.columns:
                if col.name not in db_columns:
                    col_type_str = get_column_sql_type(col.type, engine.name)
                    alter_query = f"ALTER TABLE {table_name} ADD COLUMN {col.name} {col_type_str}"
                    
                    # Handle basic defaults
                    if col.default is not None and hasattr(col.default, 'arg'):
                        val = col.default.arg
                        if isinstance(val, (int, float)):
                            alter_query += f" DEFAULT {val}"
                        elif isinstance(val, str):
                            alter_query += f" DEFAULT '{val}'"
                        elif isinstance(val, bool):
                            alter_query += f" DEFAULT {str(val).upper()}"
                            
                    try:
                        with engine.begin() as conn:
                            conn.execute(text(alter_query))
                        print(f"Migration: added column {col.name} ({col_type_str}) to table {table_name}")
                    except Exception as e:
                        print(f"Migration failed for {table_name}.{col.name}: {e}")
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
        "version": "1.0.4 - auto_schema_migration",
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
