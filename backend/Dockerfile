FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar paquetes
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir uvicorn requests

# Copiar el código del backend
COPY . .

# Crear carpeta para firmas/documentos subidos
RUN mkdir -p uploads

# Exponer puerto dinámico (Koyeb asigna la variable de entorno PORT)
ENV PORT=8003
EXPOSE 8003

# Comando para arrancar el servidor
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
