import React from 'react';
import { GitBranch, Rocket, CheckCircle2, RefreshCw, Clock, ShieldCheck, Box } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function DeploymentPanel() {
  const {
    deploymentStatus,
    deploymentProgress,
    isDeploying,
    applicationVersion,
    deployNewVersion
  } = useSimulation();

  const pipelineSteps = [
    { key: 'preparing', label: 'Step 1: Preparing release', sub: 'Git commit & manifest check' },
    { key: 'testing', label: 'Step 2: Running tests', sub: 'Unit, integration & lint tests' },
    { key: 'building', label: 'Step 3: Building application', sub: 'Docker multi-stage container build' },
    { key: 'deploying', label: 'Step 4: Deploying new version', sub: 'Rolling blue/green container rollout' },
    { key: 'healthcheck', label: 'Step 5: Health check', sub: 'HTTP 200 probe & streaming verification' },
    { key: 'complete', label: 'Step 6: Deployment successful', sub: 'Traffic cutover with zero downtime' }
  ];

  const getStepState = (stepKey) => {
    if (deploymentStatus === 'idle') return 'idle';
    const order = ['preparing', 'testing', 'building', 'deploying', 'healthcheck', 'complete'];
    const curIdx = order.indexOf(deploymentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (stepIdx < curIdx) return 'done';
    if (stepIdx === curIdx) return isDeploying ? 'running' : 'done';
    return 'idle';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Rocket size={20} style={{ color: 'var(--color-cyan)' }} />
          <span>CI/CD Automated Deployment Simulation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Version:</span>
          <span className="font-mono" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', padding: '0.2rem 0.6rem', borderRadius: '4px', color: '#c084fc', fontWeight: 700, fontSize: '0.85rem' }}>
            {applicationVersion}
          </span>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Automated CI/CD pipelines replace risky manual deployments with automated testing, container packaging, and zero-downtime rolling updates.
      </p>

      {/* Deploy Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={deployNewVersion}
          disabled={isDeploying || applicationVersion === 'v1.1.0'}
          className="btn btn-primary"
        >
          {isDeploying ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Deploying v1.1.0 in progress...</span>
            </>
          ) : applicationVersion === 'v1.1.0' ? (
            <>
              <CheckCircle2 size={16} />
              <span>v1.1.0 Already Deployed</span>
            </>
          ) : (
            <>
              <Rocket size={16} />
              <span>Deploy New Version (v1.1.0)</span>
            </>
          )}
        </button>

        {/* Status badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Deployment Status:</span>
          <span className={`badge ${deploymentStatus === 'complete' ? 'badge-healthy' : isDeploying ? 'badge-starting' : 'badge-available'}`}>
            {deploymentStatus === 'complete' ? 'SUCCESS' : isDeploying ? 'DEPLOYING' : 'IDLE'}
          </span>
          {deploymentStatus === 'complete' && (
            <span style={{ color: 'var(--color-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> Downtime: 0 seconds
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          <span>Pipeline Progress</span>
          <span className="font-mono">{deploymentProgress}%</span>
        </div>
        <div className="progress-bar-bg" style={{ height: '10px' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${deploymentProgress}%`,
              background: 'linear-gradient(90deg, #06b6d4 0%, #6366f1 50%, #10b981 100%)'
            }}
          />
        </div>
      </div>

      {/* Pipeline Steps Grid */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        border: '1px solid var(--border-color)',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Automated Pipeline Stages
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {pipelineSteps.map((step) => {
            const state = getStepState(step.key);
            return (
              <div
                key={step.key}
                style={{
                  background: state === 'running' ? 'rgba(99,102,241,0.18)' : state === 'done' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${state === 'running' ? 'var(--color-purple)' : state === 'done' ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: state === 'running' ? '#c084fc' : state === 'done' ? '#34d399' : 'var(--text-muted)' }}>
                    {step.label}
                  </span>
                  {state === 'running' && <RefreshCw size={13} className="animate-spin" style={{ color: '#c084fc' }} />}
                  {state === 'done' && <CheckCircle2 size={13} style={{ color: '#34d399' }} />}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {step.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {deploymentStatus === 'complete' && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '0.875rem' }}>
          🎉 <strong>Application update completed successfully.</strong> Video streaming users continued uninterrupted while instances updated sequentially.
        </div>
      )}
    </div>
  );
}
