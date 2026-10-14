import json
from pathlib import Path
import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def test_prometheus_configuration_structure():
    """Verify Prometheus scrape configuration defines all required targets and intervals."""
    prom_path = REPO_ROOT / "monitoring" / "prometheus" / "prometheus.yml"
    assert prom_path.exists(), "Prometheus configuration file must exist"

    with open(prom_path, "r", encoding="utf-8") as f:
        prom_config = yaml.safe_load(f)

    assert "global" in prom_config, "Prometheus config must define global settings"
    assert prom_config["global"]["scrape_interval"] == "10s"

    scrape_jobs = {job["job_name"]: job for job in prom_config.get("scrape_configs", [])}
    
    # Must scrape backend1 and backend2
    assert "streamops-backend" in scrape_jobs
    backend_targets = scrape_jobs["streamops-backend"]["static_configs"][0]["targets"]
    assert "backend1:8000" in backend_targets
    assert "backend2:8000" in backend_targets
    assert scrape_jobs["streamops-backend"]["metrics_path"] == "/metrics"

    # Must scrape cAdvisor container metrics
    assert "streamops-containers" in scrape_jobs
    assert "cadvisor:8080" in scrape_jobs["streamops-containers"]["static_configs"][0]["targets"]

    # Must scrape NGINX exporter
    assert "streamops-nginx" in scrape_jobs
    assert "nginx-exporter:9113" in scrape_jobs["streamops-nginx"]["static_configs"][0]["targets"]


def test_grafana_provisioning_and_datasource():
    """Verify Grafana automatic datasource provisioning config points to Prometheus service."""
    ds_path = REPO_ROOT / "monitoring" / "grafana" / "provisioning" / "datasources" / "prometheus.yml"
    assert ds_path.exists(), "Grafana datasource provisioning file must exist"

    with open(ds_path, "r", encoding="utf-8") as f:
        ds_config = yaml.safe_load(f)

    assert "datasources" in ds_config
    prom_ds = ds_config["datasources"][0]
    assert prom_ds["name"] == "Prometheus"
    assert prom_ds["type"] == "prometheus"
    assert prom_ds["url"] == "http://prometheus:9090"
    assert prom_ds["isDefault"] is True


def test_grafana_dashboard_json_schema():
    """Verify Grafana dashboard JSON contains valid schema and all required panels."""
    dash_path = REPO_ROOT / "monitoring" / "grafana" / "dashboards" / "streamops-overview.json"
    assert dash_path.exists(), "Grafana dashboard JSON must exist"

    with open(dash_path, "r", encoding="utf-8") as f:
        dashboard = json.load(f)

    assert dashboard.get("uid") == "streamops-overview"
    assert dashboard.get("refresh") == "5s"
    panels = dashboard.get("panels", [])
    assert len(panels) >= 11, f"Dashboard must have at least 11 operational panels, found {len(panels)}"

    panel_titles = [p.get("title", "") for p in panels]
    # Check key panels exist
    assert any("Backend Availability" in t for t in panel_titles)
    assert any("Total HTTP Request Rate" in t for t in panel_titles)
    assert any("Request Rate by Backend Node" in t for t in panel_titles)
    assert any("5xx Error Rate" in t for t in panel_titles)
    assert any("Latency" in t for t in panel_titles)
    assert any("Container CPU" in t for t in panel_titles)
    assert any("Container Memory" in t for t in panel_titles)
    assert any("Container Network" in t for t in panel_titles)
    assert any("NGINX Gateway" in t for t in panel_titles)


def test_compose_monitoring_services_and_ports():
    """Verify docker-compose.yml contains Prometheus, Grafana, cAdvisor, and NGINX exporter."""
    compose_path = REPO_ROOT / "docker-compose.yml"
    with open(compose_path, "r", encoding="utf-8") as f:
        compose = yaml.safe_load(f)

    services = compose["services"]
    assert "prometheus" in services
    assert "grafana" in services
    assert "cadvisor" in services
    assert "nginx-exporter" in services

    # Verify ports
    prom_ports = [str(p) for p in services["prometheus"].get("ports", [])]
    assert any("9090:9090" in p for p in prom_ports)

    grafana_ports = [str(p) for p in services["grafana"].get("ports", [])]
    assert any("3000:3000" in p for p in grafana_ports)

    # Verify volumes
    assert "volumes" in compose
    assert "prometheus-data" in compose["volumes"]
    assert "grafana-data" in compose["volumes"]


def test_nginx_stub_status_restricted():
    """Verify NGINX stub_status is defined and restricted to private networks."""
    nginx_conf_path = REPO_ROOT / "nginx" / "nginx.conf"
    content = nginx_conf_path.read_text(encoding="utf-8")
    assert "stub_status" in content
    assert "deny all" in content, "stub_status must not be open to the public internet"
