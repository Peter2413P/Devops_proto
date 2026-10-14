import React, { useState } from 'react';
import { Users, Globe, Network, Server, Database, GitBranch, Terminal, ShieldCheck, Activity, Cpu, ArrowDown, ArrowRight, Layers } from 'lucide-react';

export default function ArchitectureDiagram() {
  const [activeLayer, setActiveLayer] = useState('runtime'); // 'runtime' | 'devops'

  return (
    <div className="card" style={{ marginBottom: '2.5rem' }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="card-title">
            <Layers size={22} style={{ color: 'var(--color-cyan)' }} />
            <span>Proposed Production Architecture</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            High-Level Design & Infrastructure Blueprint for Resilient Video Streaming
          </div>
        </div>

        {/* Layer toggle tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveLayer('runtime')}
            className={`btn ${activeLayer === 'runtime' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
          >
            Runtime Serving Architecture
          </button>
          <button
            onClick={() => setActiveLayer('devops')}
            className={`btn ${activeLayer === 'devops' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
          >
            DevOps & CI/CD Lifecycle
          </button>
        </div>
      </div>

      {/* Prominent Educational Prototype Disclaimer */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ background: '#4f46e5', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
          NOTICE
        </div>
        <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
          <strong>Academic Prototype Notice:</strong> This diagram illustrates the <em>Proposed Production Architecture</em>. The current StreamOps web application simulates these components (load balancing, container orchestration, telemetry, zero-downtime deployment) via interactive client-side logic for project evaluation and defense.
        </div>
      </div>

      {activeLayer === 'runtime' ? (
        /* Layer 1: Runtime Serving Architecture */
        <div className="arch-flow">
          {/* Step 1: Users */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.15))',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '380px',
              justifyContent: 'center'
            }}>
              <Users size={22} style={{ color: 'var(--color-cyan)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Active Viewers & Clients</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Web Browsers, Smart TVs, Mobile Apps</div>
              </div>
            </div>

            <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
              <ArrowDown size={20} />
            </div>

            {/* Step 2: Edge CDN & Frontend */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '380px',
              justifyContent: 'center'
            }}>
              <Globe size={22} style={{ color: 'var(--color-blue)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>React Streaming Frontend & CDN</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cloudflare / AWS CloudFront Edge Caching</div>
              </div>
            </div>

            <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
              <ArrowDown size={20} />
            </div>

            {/* Step 3: Load Balancer */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.15))',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '380px',
              justifyContent: 'center'
            }}>
              <Network size={22} style={{ color: 'var(--color-purple)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>NGINX / HAProxy Load Balancer</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health Checks, SSL Termination, Round-Robin</div>
              </div>
            </div>

            <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
              <ArrowDown size={20} />
            </div>

            {/* Step 4: Horizontally Scaled Backend Instances */}
            <div style={{
              width: '100%',
              background: 'rgba(0,0,0,0.25)',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginTop: '0.25rem'
            }}>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
                KUBERNETES POD CLUSTER / ELASTIC CONTAINER SERVICE
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                  <Server size={22} style={{ color: 'var(--color-green)', margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Backend Instance 1</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port 8081 • Docker Container</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-cyan)' }}>HLS Segmenter Service</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                  <Server size={22} style={{ color: 'var(--color-green)', margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Backend Instance 2</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port 8082 • Docker Container</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-cyan)' }}>HLS Segmenter Service</div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                  <Server size={22} style={{ color: 'var(--color-green)', margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Backend Instance 3</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port 8083 • Docker Container</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-cyan)' }}>HLS Segmenter Service</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
              <ArrowDown size={20} />
            </div>

            {/* Step 5: Video Storage */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '380px',
              justifyContent: 'center'
            }}>
              <Database size={22} style={{ color: 'var(--color-green)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Distributed Video Object Storage</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AWS S3 / MinIO Distributed Chunk Store</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Layer 2: DevOps CI/CD & Observability Pipeline */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#c084fc', fontWeight: 700 }}>
              <GitBranch size={18} />
              <span>1. Version Control</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Engineers commit code and video delivery logic to GitHub. Webhooks trigger CI pipeline on pull requests.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#60a5fa', fontWeight: 700 }}>
              <Terminal size={18} />
              <span>2. CI Test & Build</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              GitHub Actions / Jenkins executes unit tests, video codec validation, and packages immutable Docker container images.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#34d399', fontWeight: 700 }}>
              <ShieldCheck size={18} />
              <span>3. Zero-Downtime CD</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Kubernetes performs rolling or Blue/Green container upgrades. Traffic cutover happens with 0 seconds of service interruption.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#f59e0b', fontWeight: 700 }}>
              <Activity size={18} />
              <span>4. Monitoring & Telemetry</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Prometheus continuously collects metrics (CPU %, request latency, stream quality) and Grafana provides live dashboards.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#06b6d4', fontWeight: 700 }}>
              <Cpu size={18} />
              <span>5. Elastic Auto-Scaling (HPA)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Horizontal Pod Autoscaler monitors CPU metric alarms. When load exceeds 70%, new container pods are automatically spawned in seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
