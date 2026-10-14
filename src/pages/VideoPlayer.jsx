import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  AlertCircle,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Activity,
  BarChart3,
  Sliders,
  Film,
  HardDrive,
  Clock,
  Layers,
  Server,
  RefreshCw
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { getVideoStreamUrl, getVideoDetails } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function VideoPlayer() {
  const { videoId: routeVideoId } = useParams();
  const navigate = useNavigate();

  const {
    activeUsers,
    systemStatus,
    cpuUsage,
    serverInstances,
    backendStatus,
    backendDiagnostics,
    catalogVideos,
    catalogLoading,
    refreshCatalog
  } = useSimulation();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef(null);

  // Determine active video based on route or catalogue
  useEffect(() => {
    let isMounted = true;

    async function resolveActiveVideo() {
      setLoadingVideo(true);
      setVideoError(false);
      setErrorMessage('');

      // 1. If routeVideoId provided, find in catalog or fetch details
      if (routeVideoId) {
        const found = catalogVideos.find(v => v.id === routeVideoId);
        if (found) {
          if (isMounted) {
            setCurrentVideo(found);
            setLoadingVideo(false);
          }
          return;
        }

        // Fetch from API directly
        const { data, error } = await getVideoDetails(routeVideoId);
        if (isMounted) {
          if (data) {
            setCurrentVideo(data);
          } else {
            setVideoError(true);
            setErrorMessage(error || `Video '${routeVideoId}' not found.`);
          }
          setLoadingVideo(false);
        }
        return;
      }

      // 2. If no routeVideoId, select first from catalogue if available
      if (catalogVideos.length > 0) {
        if (isMounted) {
          setCurrentVideo(catalogVideos[0]);
          setLoadingVideo(false);
        }
      } else if (!catalogLoading) {
        // Fallback default
        if (isMounted) {
          setCurrentVideo({
            id: 'sample',
            filename: 'sample.mp4',
            title: 'Sample Video Demo',
            file_size_bytes: 788493,
            file_size_formatted: '770.0 KB',
            format: 'MP4',
            content_type: 'video/mp4',
            modified_at: new Date().toISOString(),
            stream_url: '/api/videos/sample/stream'
          });
          setLoadingVideo(false);
        }
      }
    }

    resolveActiveVideo();

    return () => {
      isMounted = false;
    };
  }, [routeVideoId, catalogVideos, catalogLoading]);

  const streamSrc = currentVideo
    ? getVideoStreamUrl(currentVideo.id)
    : '/api/videos/sample/stream';

  const isServerStrained = systemStatus === 'OVERLOADED';

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Above the video: Title & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link> / Watch {currentVideo && ` / ${currentVideo.title}`}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {currentVideo?.title || 'DevOps Streaming Demo'}
          </h1>
        </div>

        {/* Live System Indicator pill */}
        <div style={{
          background: backendStatus === 'healthy' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${backendStatus === 'healthy' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Streaming Backend:</span>
            <strong style={{ fontSize: '0.9rem', color: backendStatus === 'healthy' ? '#34d399' : '#f87171' }}>
              {backendStatus === 'healthy' ? 'FastAPI Connected (Port 8000)' : 'Offline / Checking'}
            </strong>
          </div>
          <StatusBadge status={backendStatus === 'healthy' ? (isServerStrained ? 'OVERLOADED' : 'HEALTHY') : 'FAILED'} size="sm" />
        </div>
      </div>

      {/* Video Container */}
      <div className="video-container" style={{ position: 'relative', background: '#000', marginBottom: '1.5rem' }}>
        {/* Live overlay badges */}
        <div className="video-overlay-badge">
          <div className="live-indicator" />
          <span>HTTP RANGE STREAM</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ color: 'var(--color-cyan)', fontSize: '0.7rem' }}>
            {currentVideo?.format || 'MP4'} • {currentVideo?.file_size_formatted || '1080p'}
          </span>
        </div>

        {videoError ? (
          /* Graceful error fallback */
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            background: 'linear-gradient(135deg, #090d16 0%, #171727 100%)',
            width: '100%',
            height: '100%'
          }}>
            <AlertCircle size={48} style={{ color: 'var(--color-amber)' }} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Video stream playback error.
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '500px' }}>
                {errorMessage || 'Unable to establish streaming connection to backend. Confirm that backend is running and sample.mp4 exists in backend/media/.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setVideoError(false);
                  refreshCatalog();
                  if (videoRef.current) videoRef.current.load();
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} /> Retry Stream
              </button>
              <Link to="/" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* Real HTML5 Video Player with HTTP Range seeking support */
          <video
            ref={videoRef}
            key={streamSrc}
            src={streamSrc}
            controls
            autoPlay
            loop
            muted
            playsInline
            onError={() => {
              setVideoError(true);
              setErrorMessage('Failed to load video stream from ' + streamSrc + '. Ensure backend server is active.');
            }}
            className="video-element"
            style={{ width: '100%', height: '100%', maxHeight: '560px', objectFit: 'contain', background: '#000' }}
          >
            Your browser does not support HTML5 video streaming.
          </video>
        )}
      </div>

      {/* Discovered Media Playlist Switcher */}
      {catalogVideos.length > 1 && (
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-cyan)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Film size={14} />
            <span>Discovered Media Files in backend/media/ ({catalogVideos.length})</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {catalogVideos.map(video => {
              const isSelected = currentVideo?.id === video.id;
              return (
                <button
                  key={video.id}
                  onClick={() => navigate(`/watch/${video.id}`)}
                  style={{
                    background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'var(--color-purple)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem 1rem',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minWidth: '220px',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? '#c084fc' : 'var(--text-primary)' }}>
                    {video.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {video.filename} • {video.file_size_formatted}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Below the video metrics & info strip */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Views / Viewers</div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} style={{ color: 'var(--color-blue)' }} />
              <span>{activeUsers.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Streaming Status</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <div className="live-indicator" />
              <span>LIVE DEMO</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>File Size</div>
            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: '0.1rem' }}>
              {currentVideo?.file_size_formatted || '770 KB'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Streaming Server</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: backendStatus === 'healthy' ? 'var(--color-green)' : 'var(--color-red)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
              <CheckCircle2 size={18} />
              <span>{backendStatus === 'healthy' ? 'Healthy' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Real File & Streaming Protocol Details */}
        <div style={{ paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Discovered File</div>
            <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {currentVideo?.filename || 'sample.mp4'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Content-Type & Seeking</div>
            <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--color-cyan)' }}>
              {currentVideo?.content_type || 'video/mp4'} (HTTP 206 Range Seeking)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Streaming Endpoint</div>
            <div className="font-mono" style={{ fontSize: '0.8rem', color: '#c084fc' }}>
              {currentVideo ? getVideoStreamUrl(currentVideo.id) : '/api/videos/sample/stream'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Backend Node</div>
            <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-green)' }}></span>
              {backendDiagnostics?.instance_name || 'backend-standalone'}
            </div>
          </div>
        </div>

        {/* Video explanation and live connection to DevOps simulator */}
        <div style={{ paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Real FastAPI Video Streaming Pipeline
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '620px' }}>
              This video stream is served with byte-range requests handled directly by FastAPI. Seeking backwards or forwards requests specific byte segments (<code>Range: bytes=X-Y</code>), minimizing buffering and conserving memory.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              <BarChart3 size={15} /> Open Dashboard
            </Link>
            <Link to="/simulation" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              <Sliders size={15} /> Trigger Traffic Surge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
