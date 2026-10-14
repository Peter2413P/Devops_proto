import React from 'react';
import { Users, Gauge, AlertTriangle, Flame, ShieldCheck } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function TrafficControl() {
  const {
    trafficLevel,
    activeUsers,
    requestsPerSecond,
    cpuUsage,
    systemStatus,
    setNormalTraffic,
    increaseTraffic,
    increaseExtremeTraffic
  } = useSimulation();

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Users size={20} style={{ color: 'var(--color-blue)' }} />
          <span>Traffic Load Simulation</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Incoming Viewer Simulation
        </span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Simulate video stream traffic spikes to test backend capacity, CPU saturation, and auto-scaling triggers.
      </p>

      {/* Button controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <button
          onClick={setNormalTraffic}
          className={`btn ${trafficLevel === 'normal' ? 'btn-success' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
        >
          <ShieldCheck size={18} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Normal Traffic</div>
            <div style={{ fontSize: '0.725rem', opacity: 0.8 }}>100 users • 20 req/s</div>
          </div>
        </button>

        <button
          onClick={increaseTraffic}
          className={`btn ${trafficLevel === 'high' ? 'btn-warning' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
        >
          <AlertTriangle size={18} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Increase Traffic</div>
            <div style={{ fontSize: '0.725rem', opacity: 0.8 }}>1,000 users • 180 req/s</div>
          </div>
        </button>

        <button
          onClick={increaseExtremeTraffic}
          className={`btn ${trafficLevel === 'extreme' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
        >
          <Flame size={18} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Extreme Traffic</div>
            <div style={{ fontSize: '0.725rem', opacity: 0.8 }}>2,500 users • 350 req/s</div>
          </div>
        </button>
      </div>

      {/* Live impact summary strip */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Gauge size={18} style={{ color: 'var(--color-cyan)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Stream Impact</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeUsers.toLocaleString()} Viewers generating {requestsPerSecond} HTTP video chunk req/sec
            </div>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Impact State:</span>
          <span className={`badge ${
            systemStatus === 'OVERLOADED' ? 'badge-danger' :
            systemStatus === 'WARNING' ? 'badge-warning' :
            systemStatus === 'AVAILABLE' ? 'badge-available' : 'badge-healthy'
          }`}>
            {systemStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
