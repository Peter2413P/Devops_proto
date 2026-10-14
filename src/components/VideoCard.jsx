import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, HardDrive, Clock, Film } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import StatusBadge from './StatusBadge';

export default function VideoCard({ video }) {
  const { activeUsers, systemStatus, backendStatus } = useSimulation();

  const videoId = video?.id || 'sample';
  const videoTitle = video?.title || 'DevOps Streaming Demo';
  const videoFilename = video?.filename || 'sample.mp4';
  const videoFormat = video?.format || 'MP4';
  const videoSize = video?.file_size_formatted || '770 KB';
  const watchLink = `/watch/${videoId}`;

  return (
    <div className="card" style={{ maxWidth: '640px', width: '100%', overflow: 'hidden', padding: 0 }}>
      {/* Video Thumbnail with overlay play button */}
      <Link to={watchLink} style={{ position: 'relative', display: 'block', textDecoration: 'none' }}>
        <div style={{
          height: '240px',
          background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Grid Pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.6
          }} />

          {/* Badges on top */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 2, display: 'flex', gap: '0.5rem' }}>
            <span style={{
              background: 'rgba(239, 68, 68, 0.9)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              LIVE STREAM
            </span>
            <span style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              color: 'var(--color-cyan)',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}>
              {videoFormat} • {videoSize}
            </span>
          </div>

          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 2 }}>
            <StatusBadge status={backendStatus === 'healthy' ? systemStatus : 'WARNING'} size="sm" />
          </div>

          {/* Center Play Icon Circle */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--gradient-devops)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
            transform: 'scale(1)',
            transition: 'transform 0.2s ease',
            zIndex: 2
          }}>
            <Play size={28} fill="#ffffff" style={{ marginLeft: '4px' }} />
          </div>

          {/* Duration Badge */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Film size={12} />
            <span>HTTP Range Stream</span>
          </div>
        </div>
      </Link>

      {/* Card Body */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {videoTitle}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Eye size={14} /> {activeUsers.toLocaleString()} Viewers
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Live media file <code>{videoFilename}</code> served from backend media directory with HTTP Range seeking support.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Streaming Backend: <strong style={{ color: backendStatus === 'healthy' ? 'var(--color-green)' : 'var(--color-amber)' }}>
              {backendStatus === 'healthy' ? 'FastAPI Connected' : 'Offline / Checking'}
            </strong>
          </div>

          <Link to={watchLink} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <Play size={15} fill="#fff" /> Watch Video
          </Link>
        </div>
      </div>
    </div>
  );
}
