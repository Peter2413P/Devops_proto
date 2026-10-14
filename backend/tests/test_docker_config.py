from pathlib import Path
import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

def test_docker_compose_structure():
    """Verify docker-compose.yml defines all 4 required services and shared configuration."""
    compose_path = REPO_ROOT / "docker-compose.yml"
    assert compose_path.exists(), "docker-compose.yml must exist"

    with open(compose_path, "r", encoding="utf-8") as f:
        compose = yaml.safe_load(f)

    assert "services" in compose, "Compose must define services"
    services = compose["services"]

    # Verify all 4 required services
    assert "nginx" in services, "Must define 'nginx' gateway service"
    assert "frontend" in services, "Must define 'frontend' service"
    assert "backend1" in services, "Must define 'backend1' service"
    assert "backend2" in services, "Must define 'backend2' service"

    # Verify NGINX entrypoint port 8080
    nginx_ports = services["nginx"].get("ports", [])
    assert any("8080:80" in str(p) for p in nginx_ports), "NGINX gateway must publish port 8080:80"

    # Verify shared media volume mounts
    b1_vols = services["backend1"].get("volumes", [])
    b2_vols = services["backend2"].get("volumes", [])
    assert any("/app/media" in str(v) for v in b1_vols), "backend1 must mount shared media volume"
    assert any("/app/media" in str(v) for v in b2_vols), "backend2 must mount shared media volume"

    # Verify instance identification environment variables
    b1_env = str(services["backend1"].get("environment", []))
    b2_env = str(services["backend2"].get("environment", []))
    assert "INSTANCE_NAME=backend1" in b1_env, "backend1 must specify INSTANCE_NAME=backend1"
    assert "INSTANCE_NAME=backend2" in b2_env, "backend2 must specify INSTANCE_NAME=backend2"

def test_nginx_gateway_configuration():
    """Verify NGINX gateway configuration contains load balancing and Range stream support."""
    nginx_conf_path = REPO_ROOT / "nginx" / "nginx.conf"
    assert nginx_conf_path.exists(), "nginx/nginx.conf must exist"

    content = nginx_conf_path.read_text(encoding="utf-8")

    # Upstream load balancing
    assert "upstream backend_servers" in content, "Must define upstream backend_servers"
    assert "server backend1:8000" in content, "Upstream must contain backend1:8000"
    assert "server backend2:8000" in content, "Upstream must contain backend2:8000"

    # HTTP Range streaming support
    assert "proxy_set_header Range $http_range" in content, "Must preserve HTTP Range header"
    assert "proxy_set_header If-Range $http_if_range" in content, "Must preserve If-Range header"
    assert "proxy_buffering off" in content, "Must disable proxy buffering for streaming"
    assert "add_header X-Upstream-Addr" in content, "Must expose X-Upstream-Addr header for verification"

def test_frontend_nginx_spa_routing():
    """Verify frontend NGINX configuration supports client-side SPA routing."""
    frontend_conf_path = REPO_ROOT / "frontend" / "nginx.conf"
    assert frontend_conf_path.exists(), "frontend/nginx.conf must exist"

    content = frontend_conf_path.read_text(encoding="utf-8")
    assert "try_files $uri $uri/ /index.html" in content, "Frontend NGINX must support SPA fallback"
    assert "location /healthz" in content, "Frontend NGINX must support healthcheck"
