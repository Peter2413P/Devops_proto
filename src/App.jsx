import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import Navbar from './components/Navbar';
import PresentationBanner from './components/PresentationBanner';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Architecture from './pages/Architecture';

function AppContent() {
  return (
    <div className="app-container">
      <Navbar />
      <PresentationBanner />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch" element={<VideoPlayer />} />
          <Route path="/watch/:videoId" element={<VideoPlayer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        background: 'rgba(8, 12, 20, 0.95)',
        marginTop: 'auto',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
              StreamOps • DevOps-Based Video Streaming Platform
            </div>
            <div>
              Academic Prototype Demonstration for DevOps Coursework (Sem 5)
            </div>
            <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
              Simulating Containerization, Auto-Scaling, Observability, High Availability, and CI/CD.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
            <Link to="/watch" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Watch Demo</Link>
            <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Telemetry Dashboard</Link>
            <Link to="/simulation" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Control Center</Link>
            <Link to="/architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SimulationProvider>
  );
}
