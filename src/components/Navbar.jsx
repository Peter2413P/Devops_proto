import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { PlaySquare, BarChart3, Sliders, Layers, RotateCcw, GraduationCap, Radio, Server } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function Navbar() {
  const {
    backendStatus,
    backendDiagnostics,
    systemStatus,
    serverInstances,
    presentationMode,
    togglePresentationMode,
    resetSimulation
  } = useSimulation();

  const getStatusClass = () => {
    switch (systemStatus) {
      case 'WARNING': return 'warning';
      case 'OVERLOADED': return 'danger';
      case 'AVAILABLE': return 'available';
      default: return 'healthy';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="logo-badge">
            <Radio size={16} />
            <span>OPS</span>
          </div>
          <span className="brand-text">STREAMOPS</span>
          <span className="brand-tag">Academic Prototype</span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/watch" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlaySquare size={15} />
            <span>Watch</span>
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={15} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/simulation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Sliders size={15} />
            <span>Simulation</span>
          </NavLink>
          <NavLink to="/architecture" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Layers size={15} />
            <span>Architecture</span>
          </NavLink>
        </nav>

        {/* System Status Pill & Action Buttons */}
        <div className="nav-actions">
          {/* Real Backend API Status Pill */}
          <div
            className="status-pill"
            title={
              backendStatus === 'healthy'
                ? `FastAPI Backend Online (${backendDiagnostics?.video_count || 0} media files discovered)`
                : backendStatus === 'degraded'
                ? `FastAPI Backend Degraded: Media directory empty or unavailable`
                : backendStatus === 'offline'
                ? `FastAPI Backend Offline at port 8000`
                : `Checking FastAPI Backend...`
            }
          >
            <div
              className={`status-dot ${
                backendStatus === 'healthy'
                  ? 'healthy'
                  : backendStatus === 'degraded'
                  ? 'warning'
                  : backendStatus === 'offline'
                  ? 'danger'
                  : 'starting'
              }`}
            />
            <span style={{ color: 'var(--text-secondary)' }}>API:</span>
            <span
              style={{
                color:
                  backendStatus === 'healthy'
                    ? 'var(--color-green)'
                    : backendStatus === 'degraded'
                    ? 'var(--color-amber)'
                    : 'var(--color-red)',
                fontWeight: 600
              }}
            >
              {backendStatus === 'healthy'
                ? 'Online'
                : backendStatus === 'degraded'
                ? 'Degraded'
                : backendStatus === 'offline'
                ? 'Offline'
                : 'Checking'}
            </span>
          </div>

          {/* Cluster Status Indicator Pill */}
          <div className="status-pill" title={`System Status: ${systemStatus}`}>
            <div className={`status-dot ${getStatusClass()}`} />
            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <span style={{
              color: systemStatus === 'OVERLOADED' ? 'var(--color-red)' :
                     systemStatus === 'WARNING' ? 'var(--color-amber)' :
                     systemStatus === 'AVAILABLE' ? 'var(--color-blue)' : 'var(--color-green)'
            }}>
              {systemStatus}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              ({serverInstances.length} {serverInstances.length === 1 ? 'Pod' : 'Pods'})
            </span>
          </div>

          {/* Academic Presentation Mode Button */}
          <button
            onClick={togglePresentationMode}
            className={`btn-presentation ${presentationMode ? 'active' : ''}`}
            title="Toggle Examiner Presentation Guidance Mode"
          >
            <GraduationCap size={15} />
            <span>{presentationMode ? 'Presentation Active' : 'Presentation Mode'}</span>
          </button>

          {/* Quick Reset */}
          <button
            onClick={resetSimulation}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
            title="Reset Simulation to Initial Baseline"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
