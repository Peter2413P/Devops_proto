import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Activity, Users, Zap, Server } from 'lucide-react';

export default function MonitoringChart() {
  const { metricsHistory, cpuUsage, activeUsers, requestsPerSecond, serverInstances } = useSimulation();

  // Helper to render an SVG area/line chart
  const renderChart = (title, dataKey, color, unit, icon, maxRange) => {
    const height = 110;
    const width = 300;
    const padding = 15;

    const values = metricsHistory.map(m => m[dataKey] ?? 0);
    const maxVal = maxRange || Math.max(...values, 10);
    const minVal = 0;

    const points = values.map((val, idx) => {
      const x = padding + (idx / Math.max(values.length - 1, 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return `${x},${y}`;
    });

    const pathD = points.length > 0 ? `M ${points.join(' L ')}` : '';
    const areaD = points.length > 0
      ? `M ${points[0]} L ${points.join(' L ')} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`
      : '';

    const currentValue = values[values.length - 1] ?? 0;

    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            {icon}
            <span>{title}</span>
          </div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: color }}>
            {currentValue.toLocaleString()} {unit}
          </div>
        </div>

        {/* SVG Sparkline / Area Chart */}
        <div style={{ width: '100%', height: `${height}px`, overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />

            {/* Shaded Area */}
            {areaD && <path d={areaD} fill={`url(#grad-${dataKey})`} />}

            {/* Main Trend Line */}
            {pathD && <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Current point highlight */}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].split(',')[0]}
                cy={points[points.length - 1].split(',')[1]}
                r="4.5"
                fill={color}
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
          </svg>
        </div>

        {/* Time X-Axis */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          <span>{metricsHistory[0]?.time || 'T-0'}</span>
          <span>Live Metrics (3s interval)</span>
          <span>{metricsHistory[metricsHistory.length - 1]?.time || 'Now'}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
      {renderChart(
        'CPU Utilization',
        'cpu',
        cpuUsage > 80 ? 'var(--color-red)' : cpuUsage > 65 ? 'var(--color-amber)' : 'var(--color-green)',
        '%',
        <Activity size={16} style={{ color: 'var(--color-cyan)' }} />,
        100
      )}

      {renderChart(
        'Active Viewers',
        'users',
        'var(--color-blue)',
        'users',
        <Users size={16} style={{ color: 'var(--color-blue)' }} />,
        3000
      )}

      {renderChart(
        'Request Rate',
        'requests',
        'var(--color-purple)',
        'req/s',
        <Zap size={16} style={{ color: 'var(--color-purple)' }} />,
        400
      )}

      {renderChart(
        'Backend Instances',
        'instances',
        'var(--color-cyan)',
        'nodes',
        <Server size={16} style={{ color: 'var(--color-cyan)' }} />,
        5
      )}
    </div>
  );
}
