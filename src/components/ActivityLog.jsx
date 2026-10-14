import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function ActivityLog() {
  const { activityLogs, resetSimulation } = useSimulation();
  const logContainerRef = useRef(null);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={13} style={{ color: 'var(--color-green)' }} />;
      case 'warning':
        return <AlertTriangle size={13} style={{ color: 'var(--color-amber)' }} />;
      case 'danger':
        return <AlertCircle size={13} style={{ color: 'var(--color-red)' }} />;
      default:
        return <Info size={13} style={{ color: 'var(--color-blue)' }} />;
    }
  };

  return (
    <div className="activity-log">
      <div className="log-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          <Terminal size={16} style={{ color: 'var(--color-cyan)' }} />
          <span>DevOps System Telemetry Log</span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
            {activityLogs.length} events
          </span>
        </div>
      </div>

      <div className="log-content" ref={logContainerRef}>
        {activityLogs.map((log) => (
          <div key={log.id} className={`log-item ${log.type}`}>
            <span className="log-time">{log.timestamp}</span>
            <span style={{ display: 'inline-flex', marginTop: '2px' }}>{getIcon(log.type)}</span>
            <span className="log-text">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
