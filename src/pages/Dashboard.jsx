import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Zap, 
  Cpu, 
  HardDrive, 
  Server, 
  Activity, 
  Sliders, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Clock,
  ExternalLink,
  BarChart3,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ServerCard from '../components/ServerCard';
import MonitoringChart from '../components/MonitoringChart';
import ActivityLog from '../components/ActivityLog';
import StatusBadge from '../components/StatusBadge';
import { useSimulation } from '../context/SimulationContext';

export default function Dashboard() {
  const {
    backendStatus,
    backendDiagnostics,
    lastHealthCheckTime,
    refreshHealth,
    activeUsers,
    requestsPerSecond,
    cpuUsage,
    memoryUsage,
    serverInstances,
    systemStatus,
    trafficLevel,
    responseTime,
    simulateServerFailure,
    recoverServer
  } = useSimulation();

  const getStatusVariant = () => {
    switch (systemStatus) {
      case 'WARNING': return 'warning';
      case 'OVERLOADED': return 'danger';
      case 'AVAILABLE': return 'blue';
      default: return 'healthy';
    }
  };

  const getCpuVariant = () => {
    if (cpuUsage > 80) return 'danger';
    if (cpuUsage > 65) return 'warning';
    return 'healthy';
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Phase 3: Real-Time Monitoring & Observability Stack
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Infrastructure Monitoring & Observability
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="http://localhost:3000/d/streamops-overview/streamops-overview"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(249, 115, 22, 0.4)', color: '#fb923c' }}
          >
            <BarChart3 size={15} />
            <span>Open Grafana</span>
            <ExternalLink size={13} />
          </a>

          <a
            href="http://localhost:9090/targets"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171' }}
          >
            <Database size={15} />
            <span>Prometheus Targets</span>
            <ExternalLink size={13} />
          </a>

          <Link to="/simulation" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <Sliders size={16} />
            <span>Simulation Controls</span>
          </Link>
        </div>
      </div>

      {/* Live Production Infrastructure Overview Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: backendStatus === 'healthy' ? 'var(--color-green)' : 'var(--color-red)' }}></span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Live Containerized Cluster State (FastAPI & NGINX)
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Last probe: <strong className="font-mono" style={{ color: 'var(--text-secondary)' }}>{lastHealthCheckTime || 'Polling...'}</strong>
            </span>
            <button
              onClick={refreshHealth}
              className="btn btn-secondary"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={12} />
              <span>Probe Now</span>
            </button>
          </div>
        </div>

        {/* 4 Node & Target Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* NGINX Gateway */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Reverse Proxy Gateway</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--color-green)' }} />
              <span>NGINX (Port 8080)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Round-Robin Load Balancer
            </div>
          </div>

          {/* Active Serving Node */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Active Probed Instance</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Server size={15} style={{ color: 'var(--color-purple)' }} />
              <span className="font-mono">{backendDiagnostics?.instance_name || 'backend-local'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Status: <span style={{ color: backendStatus === 'healthy' ? 'var(--color-green)' : 'var(--color-red)', fontWeight: 600 }}>{backendStatus.toUpperCase()}</span>
            </div>
          </div>

          {/* Metrics Endpoint */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Prometheus Scrape Endpoint</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={15} />
              <span className="font-mono">/metrics</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Exposition: text/plain; v0.0.4
            </div>
          </div>

          {/* Media Catalogue Diagnostics */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Shared Video Storage</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <HardDrive size={15} style={{ color: 'var(--color-cyan)' }} />
              <span>{backendDiagnostics ? `${backendDiagnostics.video_count} Media Files` : 'Connecting...'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Uptime: {backendDiagnostics ? `${backendDiagnostics.uptime_seconds}s` : '0s'}
            </div>
          </div>
        </div>

        {/* Informational Guidance Notice */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(2, 6, 23, 0.5)', padding: '0.6rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid var(--color-cyan)' }}>
          <strong style={{ color: 'var(--color-cyan)' }}>DevOps Architecture Notice: </strong>
          Real HTTP request latency histograms, status codes, container CPU/RAM, and traffic rates are scraped by Prometheus (<code className="font-mono" style={{ color: '#f87171' }}>:9090</code>) and visualized on the provisioned Grafana Dashboard (<code className="font-mono" style={{ color: '#fb923c' }}>:3000</code>). The controls below drive the educational simulation sandbox.
        </div>
      </div>

      {/* Educational Simulation Sandbox Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Educational DevOps Simulation Sandbox
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Classroom demonstration model showing traffic surge response, simulated auto-scaling, and node fault recovery
          </p>
        </div>
        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
          Interactive Simulator
        </span>
      </div>

      {/* Metric Cards Grid (6 KPI cards) */}
      <div className="metrics-grid">
        <MetricCard
          title="Simulated Users"
          value={activeUsers}
          icon={Users}
          variant="blue"
          subtitle="Concurrent Viewers (Demo)"
          change={trafficLevel === 'extreme' ? '+2400% surge' : trafficLevel === 'high' ? '+900%' : 'Normal'}
        />

        <MetricCard
          title="Requests / sec"
          value={requestsPerSecond}
          unit="req/s"
          icon={Zap}
          variant="purple"
          subtitle="HLS Video Chunks"
          change={`avg ${Math.round(requestsPerSecond / serverInstances.length)}/node`}
        />

        <MetricCard
          title="CPU Usage"
          value={cpuUsage}
          unit="%"
          icon={Cpu}
          variant={getCpuVariant()}
          subtitle="Cluster Average"
          change={cpuUsage > 80 ? 'CRITICAL SATURATION' : cpuUsage > 65 ? 'Elevated load' : 'Optimal threshold'}
        />

        <MetricCard
          title="Memory Usage"
          value={memoryUsage}
          unit="%"
          icon={HardDrive}
          variant="blue"
          subtitle="RAM Allocated"
          change="Buffer cache healthy"
        />

        <MetricCard
          title="Backend Instances"
          value={serverInstances.length}
          unit="pods"
          icon={Server}
          variant="cyan"
          subtitle="Kubernetes Replicas"
          change={`${serverInstances.filter(s => s.status === 'healthy').length} healthy nodes`}
        />

        <MetricCard
          title="System Status"
          value={systemStatus}
          icon={Activity}
          variant={getStatusVariant()}
          subtitle={`Latency: ${responseTime} ms`}
          badge={<StatusBadge status={systemStatus} size="sm" />}
        />
      </div>

      {/* Monitoring Charts Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Real-Time Telemetry & Trends
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live metrics streaming from Prometheus/Grafana simulation agent
            </p>
          </div>
        </div>

        <MonitoringChart />
      </div>

      {/* Server Instances Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Backend Instances Pool
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Containerized video stream serving nodes managed by Docker & Kubernetes
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Target Group:</span>
            <span className="badge badge-available">
              {serverInstances.filter(s => s.status !== 'failed').length} / {serverInstances.length} Online
            </span>
          </div>
        </div>

        <div className="servers-grid">
          {serverInstances.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onFail={simulateServerFailure}
              onRecover={recoverServer}
            />
          ))}
        </div>
      </div>

      {/* Telemetry Activity Log Section */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            System Audit & Activity Logs
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Time-stamped audit events capturing scaling decisions, container state changes, and traffic shifts
          </p>
        </div>

        <ActivityLog />
      </div>
    </div>
  );
}
