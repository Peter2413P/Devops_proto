import React from 'react';
import { Server, Cpu, HardDrive, Zap, Radio, AlertOctagon, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ServerCard({ server, onFail, onRecover }) {
  const isFailed = server.status === 'failed';
  const isStarting = server.status === 'starting';

  const getCpuFillClass = (cpu) => {
    if (isFailed) return 'danger';
    if (cpu > 80) return 'danger';
    if (cpu > 65) return 'warning';
    return 'healthy';
  };

  return (
    <div className={`server-card ${server.status}`}>
      <div className="server-header">
        <div className="server-info">
          <h4>
            <Server size={18} style={{ color: isFailed ? 'var(--color-red)' : 'var(--color-blue)' }} />
            {server.name}
          </h4>
          <div className="server-meta">
            Port :{server.port} • Zone: {server.zone}
          </div>
        </div>
        <StatusBadge status={server.status} size="sm" />
      </div>

      <div className="server-metrics">
        {/* CPU Bar */}
        <div className="metric-bar-group">
          <div className="metric-bar-labels">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Cpu size={14} style={{ color: 'var(--text-muted)' }} /> CPU Usage
            </span>
            <span style={{ color: isFailed ? 'var(--color-red)' : server.cpu > 75 ? 'var(--color-amber)' : 'var(--text-primary)' }}>
              {isFailed ? '0%' : `${server.cpu}%`}
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className={`progress-bar-fill ${getCpuFillClass(server.cpu)}`}
              style={{ width: `${isFailed ? 0 : server.cpu}%` }}
            />
          </div>
        </div>

        {/* Memory Bar */}
        <div className="metric-bar-group">
          <div className="metric-bar-labels">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <HardDrive size={14} style={{ color: 'var(--text-muted)' }} /> Memory Usage
            </span>
            <span>{isFailed ? '0%' : `${server.memory}%`}</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill blue"
              style={{ width: `${isFailed ? 0 : server.memory}%` }}
            />
          </div>
        </div>

        {/* Requests & Traffic Share */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Throughput</span>
            <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {isFailed ? '0' : server.requests} req/s
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', textAlign: 'right' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Traffic Share</span>
            <span className="font-mono" style={{ fontWeight: 600, color: isFailed ? 'var(--color-red)' : 'var(--color-cyan)' }}>
              {isFailed ? '0%' : `${server.trafficShare}%`}
            </span>
          </div>
        </div>

        {/* Card Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          {isFailed ? (
            <button
              onClick={() => onRecover && onRecover(server.id)}
              className="btn btn-success"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              title="Restart backend container pod"
            >
              <CheckCircle2 size={13} /> Restart Pod
            </button>
          ) : (
            <button
              onClick={() => onFail && onFail(server.id)}
              className="btn btn-danger"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              title="Simulate crash or network cut"
            >
              <AlertOctagon size={13} /> Simulate Crash
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
