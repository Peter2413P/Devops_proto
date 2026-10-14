import React from 'react';
import { Link } from 'react-router-dom';
import { Play, BarChart3, Sliders, Shield, Zap, Activity, Rocket, ArrowRight, CheckCircle2, RefreshCw, AlertCircle, Film } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { useSimulation } from '../context/SimulationContext';

export default function Home() {
  const {
    systemStatus,
    serverInstances,
    activeUsers,
    cpuUsage,
    catalogVideos,
    catalogLoading,
    catalogError,
    refreshCatalog,
    backendStatus
  } = useSimulation();

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 3rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          color: '#c084fc',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Zap size={14} />
          <span>Interactive Academic DevOps Simulation</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Reliable Video Streaming with DevOps
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          margin: '0 auto 2.25rem',
          lineHeight: 1.6
        }}>
          An interactive prototype demonstrating scalability, monitoring, high availability and automated deployment.
        </p>

        {/* Hero CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/watch" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <Play size={18} fill="#fff" />
            <span>Watch Demo Video</span>
          </Link>

          <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <BarChart3 size={18} />
            <span>Open DevOps Dashboard</span>
          </Link>

          <Link to="/simulation" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <Sliders size={18} />
            <span>Control Center</span>
          </Link>
        </div>

        {/* Live system telemetry badge in hero */}
        <div style={{
          marginTop: '2.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '0.75rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <span>Live Viewers: <strong style={{ color: 'var(--text-primary)' }}>{activeUsers.toLocaleString()}</strong></span>
          <span>•</span>
          <span>Cluster CPU: <strong style={{ color: cpuUsage > 80 ? 'var(--color-red)' : 'var(--color-green)' }}>{cpuUsage}%</strong></span>
          <span>•</span>
          <span>Active Pods: <strong style={{ color: 'var(--color-cyan)' }}>{serverInstances.length}</strong></span>
          <span>•</span>
          <span>Status: <strong style={{ color: systemStatus === 'OVERLOADED' ? 'var(--color-red)' : 'var(--color-green)' }}>{systemStatus}</strong></span>
        </div>
      </section>

      {/* Real Video Catalogue Section */}
      <section style={{ margin: '2rem 0 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-cyan)', fontWeight: 600, marginBottom: '0.4rem' }}>
            <Film size={14} />
            <span>DISCOVERED VIDEO CATALOGUE</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Available Streaming Media
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real media files discovered from the backend storage directory with HTTP Range seeking.
          </p>
        </div>

        {catalogLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--color-purple)' }} />
            <div>Scanning media directory for video files...</div>
          </div>
        ) : catalogError || backendStatus === 'offline' ? (
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <AlertCircle size={36} style={{ color: 'var(--color-red)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>
              Backend Media Service Unreachable
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {catalogError || 'FastAPI backend service is offline. Start uvicorn server at port 8000.'}
            </p>
            <button onClick={refreshCatalog} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        ) : catalogVideos.length === 0 ? (
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
            <Film size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No Video Files Discovered
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              The configured media directory is currently empty. Place <code>.mp4</code> or <code>.webm</code> files into <code>backend/media/</code> to stream.
            </p>
            <button onClick={refreshCatalog} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={14} /> Rescan Media Directory
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {catalogVideos.map((video) => (
              <div key={video.id} style={{ display: 'flex', justifyContent: 'center' }}>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why DevOps? Section */}
      <section style={{ margin: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Why DevOps?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Traditional video streaming infrastructures fail under sudden load spikes. DevOps engineering provides architectural resiliency.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {/* Card 1: Scalability */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-blue)'
            }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. Scalability
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Handle sudden increases in traffic. Automatically scale from 1 to multiple containerized backend instances when viewer demand surges.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Link to="/simulation" style={{ color: 'var(--color-blue)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Test auto-scaling <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: Reliability */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-green)'
            }}>
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              2. Reliability
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Keep services available during failures. High availability and automated load balancers reroute streaming requests away from crashed servers.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Link to="/simulation" style={{ color: 'var(--color-green)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Test failover <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 3: Monitoring */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-amber)'
            }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              3. Monitoring
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Track system health and performance. Continuous metrics observability catches CPU bottlenecks, latency spikes, and server errors early.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Link to="/dashboard" style={{ color: 'var(--color-amber)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                View telemetry <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 4: Automated Deployment */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-purple)'
            }}>
              <Rocket size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              4. Automated Deployment
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Release application updates safely. Continuous Integration and Continuous Deployment (CI/CD) pipelines push updates with zero downtime.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <Link to="/simulation" style={{ color: 'var(--color-purple)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Simulate rollout <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
