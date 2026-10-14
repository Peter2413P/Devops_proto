import React from 'react';
import { Sliders, RotateCcw, AlertTriangle, ShieldCheck, Zap, Activity } from 'lucide-react';
import TrafficControl from '../components/TrafficControl';
import ScalingPanel from '../components/ScalingPanel';
import FailureSimulation from '../components/FailureSimulation';
import DeploymentPanel from '../components/DeploymentPanel';
import ActivityLog from '../components/ActivityLog';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { useSimulation } from '../context/SimulationContext';

export default function Simulation() {
  const {
    activeUsers,
    requestsPerSecond,
    cpuUsage,
    memoryUsage,
    responseTime,
    serverInstances,
    systemStatus,
    applicationVersion,
    resetSimulation
  } = useSimulation();

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Interactive Scenario Engine
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            DevOps Simulation Control Center
          </h1>
        </div>

        <button
          onClick={resetSimulation}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RotateCcw size={16} />
          <span>Reset Entire Simulation</span>
        </button>
      </div>

      {/* Quick Live Telemetry Strip */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.65)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cluster State</div>
            <div style={{ marginTop: '0.25rem' }}>
              <StatusBadge status={systemStatus} size="sm" />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Viewers</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {activeUsers.toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Throughput</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-purple)' }}>
              {requestsPerSecond} req/s
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg CPU</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: cpuUsage > 80 ? 'var(--color-red)' : cpuUsage > 65 ? 'var(--color-amber)' : 'var(--color-green)' }}>
              {cpuUsage}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latency</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {responseTime} ms
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Replicas</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-cyan)' }}>
              {serverInstances.length} Pods
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Version</div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc' }}>
              {applicationVersion}
            </div>
          </div>
        </div>
      </div>

      {/* Main Simulation Modules Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Module 1: Traffic Control */}
        <TrafficControl />

        {/* Module 2: Auto Scaling Panel */}
        <ScalingPanel />

        {/* Module 3: Server Failure & High Availability */}
        <FailureSimulation />

        {/* Module 4: CI/CD Deployment Panel */}
        <DeploymentPanel />

        {/* Module 5: Activity Audit Log */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Simulation Audit Trail & Logs
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Verifiable event timestamps recorded during simulation tests
            </p>
          </div>
          <ActivityLog />
        </div>
      </div>
    </div>
  );
}
