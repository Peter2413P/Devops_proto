# Production-grade Python backend container for StreamOps
FROM python:3.11-slim AS runtime

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8000 \
    VIDEO_DIR=/app/media

WORKDIR /app

# Install dependencies in a separate layer for efficient caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-privileged system user and persistent media directory
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser \
    && mkdir -p /app/media \
    && chown -R appuser:appuser /app

# Copy application source code (media is deliberately excluded and mounted at runtime)
COPY app/ ./app/

# Switch to non-root user for security
USER appuser

EXPOSE 8000

# Health check using python urllib
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health')" || exit 1

# Launch ASGI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
