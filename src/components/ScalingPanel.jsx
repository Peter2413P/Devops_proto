import React from 'react';
import { Layers, ArrowRight, Cpu, Server, Activity, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function ScalingPanel() {
  const {
    serverInstances,
    autoScalingEnabled,
    autoScalingStep,
    isScalingInProgress,
    cpuUsage,
    systemStatus,
    enableAutoScaling
  } = useSimulation();

  const steps = [
    { key: 'detecting', label: '1. Detecting High Load', desc: 'Threshold > 70% CPU violated' },
    { key: 'scaling', label: '2. Scaling Backend', desc: 'HPA triggers replica scale-out' },
    { key: 'creating_2', label: '3. Creating Instance 2', desc: 'Booting container in us-east-1b' },
    { key: 'creating_3', label: '4. Creating Instance 3', desc: 'Booting container in us-east-1c' },
    { key: 'balancing', label: '5. Load Balancing', desc: 'Distributing chunk requests evenly' },
    { key: 'complete', label: '6. Healthy State', desc: 'CPU normalized to 58%' }
  ];

  const getStepStatus = (stepKey) => {
    if (!autoScalingEnabled) return 'pending';
    const order = ['detecting', 'scaling', 'creating_2', 'creating_3', 'balancing', 'complete'];
    const currentIndex = order.indexOf(autoScalingStep);
    const thisIndex = order.indexOf(stepKey);

    if (thisIndex < currentIndex) return 'completed';
    if (thisIndex === currentIndex) return isScalingInProgress ? 'active' : 'completed';
    return 'pending';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Layers size={20} style={{ color: 'var(--color-purple)' }} />
          <span>Horizontal Auto-Scaling Engine</span>
        </div>
        <span className="badge badge-available">
          Instances: {serverInstances.length} / 5 Max
        </span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        When traffic spikes cause CPU saturation, Kubernetes Horizontal Pod Autoscaler (HPA) automatically deploys additional streaming containers to share the load.
      </p>

      {/* Action Trigger */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={enableAutoScaling}
          disabled={isScalingInProgress || (autoScalingEnabled && serverInstances.length >= 3)}
          className="btn btn-primary"
          style={{ minWidth: '220px' }}
        >
          {isScalingInProgress ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Scaling in progress...</span>
            </>
          ) : autoScalingEnabled && serverInstances.length >= 3 ? (
            <>
              <CheckCircle2 size={16} />
              <span>Auto-Scaling Active (3 Nodes)</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span>Enable Auto-Scaling</span>
            </>
          )}
        </button>

        {autoScalingEnabled && (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-green)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={15} /> Auto-scaler monitoring active (Target: ≤ 60% CPU)
          </span>
        )}
      </div>

      {/* Auto-scaling progression steps */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Auto-Scaling Lifecycle Simulation
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
          {steps.map((st) => {
            const status = getStepStatus(st.key);
            return (
              <div
                key={st.key}
                style={{
                  background: status === 'active' ? 'rgba(99,102,241,0.2)' : status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${status === 'active' ? 'var(--color-purple)' : status === 'completed' ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.75rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: status === 'active' ? '#c084fc' : status === 'completed' ? '#34d399' : 'var(--text-muted)' }}>
                    {st.label}
                  </span>
                  {status === 'active' && <RefreshCw size={12} className="animate-spin" style={{ color: '#c084fc' }} />}
                  {status === 'completed' && <CheckCircle2 size={12} style={{ color: '#34d399' }} />}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {st.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Flow Diagram */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Visual Flow Diagram: Elastic Scalability
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ textAlign: 'center', padding: '0.6rem 0.8rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', minWidth: '100px' }}>
            <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>High Traffic</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2,500 Viewers</div>
          </div>

          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

          <div style={{ textAlign: 'center', padding: '0.6rem 0.8rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', minWidth: '100px' }}>
            <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>High CPU</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Spikes to 95%</div>
          </div>

          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

          <div style={{ textAlign: 'center', padding: '0.6rem 0.8rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 'var(--radius-sm)', minWidth: '100px' }}>
            <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700 }}>Auto Scaling</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>HPA Policy</div>
          </div>

          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

          <div style={{ textAlign: 'center', padding: '0.6rem 0.8rem', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-sm)', minWidth: '100px' }}>
            <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>Add Instances</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>1 → 3 Pods</div>
          </div>

          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

          <div style={{ textAlign: 'center', padding: '0.6rem 0.8rem', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 'var(--radius-sm)', minWidth: '100px' }}>
            <div style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 700 }}>Load Balancing</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>33% per Node</div>
          </div>

          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

          <div style={{ textAlign: 'center', padding: '0.6rem 0.8rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-sm)', minWidth: '100px' }}>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>Healthy System</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CPU: 58%</div>
          </div>
        </div>

        {autoScalingEnabled && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', color: '#a7f3d0', fontSize: '0.85rem' }}>
            💡 <strong>Key Takeaway:</strong> Auto-scaling reduced server load by distributing traffic across multiple backend instances.
          </div>
        )}
      </div>
    </div>
  );
}
