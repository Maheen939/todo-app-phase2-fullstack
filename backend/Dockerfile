# Dockerfile for backend deployment
FROM python:3.11-slim

WORKDIR /app

# Install dependencies directly
RUN pip install --no-cache-dir \
    fastapi>=0.115.0 \
    uvicorn[standard]>=0.32.0 \
    sqlmodel>=0.0.22 \
    psycopg2-binary>=2.9.9 \
    pyjwt>=2.9.0 \
    python-dotenv>=1.0.1 \
    alembic>=1.13.3

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
