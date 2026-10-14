import React from 'react';
import { GraduationCap, ArrowRight, Play, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function PresentationBanner() {
  const {
    presentationMode,
    togglePresentationMode,
    trafficLevel,
    cpuUsage,
    serverInstances,
    failedServerId,
    applicationVersion,
    setNormalTraffic,
    increaseExtremeTraffic,
    enableAutoScaling,
    simulateServerFailure,
    deployNewVersion,
    resetSimulation
  } = useSimulation();

  if (!presentationMode) return null;

  return (
    <aside aria-label="Academic Presentation Mode" className="presentation-banner">
      <div className="presentation-inner">
        <div className="presentation-left">
          <div className="presentation-badge">
            <GraduationCap size={15} />
            <span>Academic Presentation Mode</span>
          </div>
          <div className="presentation-text">
            <strong>Demonstration Guide:</strong> Use the sequential scenario triggers below to present the problem-and-solution workflow to the examiner.
          </div>
        </div>

        {/* Quick Scenario Steps */}
        <div className="presentation-actions">
          <button
            onClick={setNormalTraffic}
            className={`btn ${trafficLevel === 'normal' && serverInstances.length === 1 ? 'btn-success' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            title="Step 1: Baseline normal load (100 users, 1 instance, 30% CPU)"
          >
            1. Normal Load
          </button>

          <button
            onClick={increaseExtremeTraffic}
            className={`btn ${trafficLevel === 'extreme' && cpuUsage > 80 ? 'btn-danger' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            title="Step 2: Show Problem (2,500 users, 95% CPU, Overloaded)"
          >
            2. Surge (Problem)
          </button>

          <button
            onClick={enableAutoScaling}
            className={`btn ${serverInstances.length >= 3 && !failedServerId ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            title="Step 3: Show Solution (Auto-Scale to 3 nodes, CPU drops to 58%)"
          >
            3. Auto-Scale (Solution)
          </button>

          <button
            onClick={() => simulateServerFailure(2)}
            className={`btn ${failedServerId ? 'btn-warning' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            title="Step 4: Show High Availability (Instance 2 crashes, service remains Available)"
          >
            4. Failover (HA)
          </button>

          <button
            onClick={deployNewVersion}
            className={`btn ${applicationVersion === 'v1.1.0' ? 'btn-success' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            title="Step 5: Zero-Downtime Deployment (CI/CD pipeline deploys v1.1.0)"
          >
            5. CI/CD Deploy
          </button>

          <button
            onClick={resetSimulation}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: 'var(--text-muted)' }}
            title="Reset simulation to initial state"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Problem vs Solution Comparison Cards for Examiner */}
      <div style={{ maxWidth: '1400px', margin: '0.75rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
          <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.15rem' }}>❌ PROBLEM: High Traffic Overload</div>
          <div style={{ color: '#94a3b8' }}>Surge traffic causes 95% CPU, packet loss & video buffering.</div>
          <div style={{ color: '#34d399', fontWeight: 700, marginTop: '0.25rem' }}>✅ SOLUTION: Auto-Scaling</div>
          <div style={{ color: '#cbd5e1' }}>Horizontal Pod Autoscaler adds nodes to distribute traffic.</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
          <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.15rem' }}>❌ PROBLEM: Single Server Failure</div>
          <div style={{ color: '#94a3b8' }}>A crashed node causes total streaming downtime for viewers.</div>
          <div style={{ color: '#34d399', fontWeight: 700, marginTop: '0.25rem' }}>✅ SOLUTION: High Availability</div>
          <div style={{ color: '#cbd5e1' }}>Redundant instances & load balancer reroute traffic seamlessly.</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
          <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.15rem' }}>❌ PROBLEM: Risky Manual Deployments</div>
          <div style={{ color: '#94a3b8' }}>Manual updates introduce config errors and maintenance downtime.</div>
          <div style={{ color: '#34d399', fontWeight: 700, marginTop: '0.25rem' }}>✅ SOLUTION: Automated CI/CD</div>
          <div style={{ color: '#cbd5e1' }}>Automated tests and rolling container release give 0s downtime.</div>
        </div>
      </div>
    </aside>
  );
}
