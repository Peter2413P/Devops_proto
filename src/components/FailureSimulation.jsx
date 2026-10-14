import React from 'react';
import { ShieldAlert, Server, ArrowRight, RefreshCw, CheckCircle2, AlertOctagon, HeartHandshake } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function FailureSimulation() {
  const {
    serverInstances,
    failedServerId,
    systemStatus,
    simulateServerFailure,
    recoverServer
  } = useSimulation();

  const isFailed = failedServerId !== null;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <ShieldAlert size={20} style={{ color: 'var(--color-red)' }} />
          <span>Server Failure & High Availability Simulation</span>
        </div>
        <span className={`badge ${isFailed ? 'badge-available' : 'badge-healthy'}`}>
          System: {systemStatus}
        </span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        In production, physical nodes crash and software crashes occur. High Availability (HA) ensures that when one node fails, the load balancer reroutes traffic so streaming users experience zero downtime.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {!isFailed ? (
          <button
            onClick={() => simulateServerFailure(2)}
            className="btn btn-danger"
          >
            <AlertOctagon size={16} />
            <span>Simulate Server Failure (Crash Instance 2)</span>
          </button>
        ) : (
          <button
            onClick={() => recoverServer(2)}
            className="btn btn-success"
          >
            <RefreshCw size={16} />
            <span>Self-Heal / Restart Server 2</span>
          </button>
        )}

        {isFailed && (
          <div style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertOctagon size={15} /> Server 2 is unavailable.
          </div>
        )}
      </div>

      {/* High Availability Status Banner */}
      {isFailed && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.95rem' }}>
              <HeartHandshake size={18} />
              <span>High Availability Maintained</span>
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Traffic has been automatically redirected to healthy instances. Active video viewers experience continuous playback!
            </div>
          </div>

          <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd', display: 'block' }}>Platform Availability</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>100.0% Available</span>
          </div>
        </div>
      )}

      {/* Visual Traffic Redistribution Breakdown */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Traffic Redistribution Breakdown
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {serverInstances.map((server) => {
            const isServerFailed = server.status === 'failed';
            return (
              <div
                key={server.id}
                style={{
                  background: isServerFailed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isServerFailed ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isServerFailed ? '#f87171' : 'var(--text-primary)' }}>
                    {server.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isServerFailed ? '#ef4444' : '#10b981' }}>
                    {isServerFailed ? '🔴 Failed' : '🟢 Healthy'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <span>Assigned Traffic:</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: isServerFailed ? '#ef4444' : 'var(--color-cyan)' }}>
                    {server.trafficShare}%
                  </span>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className={`progress-bar-fill ${isServerFailed ? 'danger' : 'blue'}`}
                    style={{ width: `${server.trafficShare}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
