import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Dual-database support: SQLite by default for easy local execution/grading,
# PostgreSQL if DATABASE_URL is configured in the environment.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bd_banco_andino_core_banking.db")

# SQLite needs special argument for thread compatibility
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
