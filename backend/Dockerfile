# Dockerfile for backend deployment
FROM python:3.11-slim

# Debug: Print files in root
RUN echo "=== Root files ===" && ls -la /

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \
    fastapi>=0.115.0 \
    uvicorn[standard]>=0.32.0 \
    sqlmodel>=0.0.22 \
    psycopg2-binary>=2.9.9 \
    pyjwt>=2.9.0 \
    python-dotenv>=1.0.1 \
    alembic>=1.13.3

# Copy files
COPY . .

# Debug: Show what we copied
RUN echo "=== /app contents ===" && ls -la /app
RUN echo "=== main.py exists? ===" && test -f /app/main.py && echo "YES" || echo "NO"

# Run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
