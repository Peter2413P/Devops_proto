import React from 'react';

export default function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  variant = 'blue',
  subtitle,
  change,
  badge
}) {
  return (
    <div className={`metric-card ${variant}`}>
      <div className="metric-header">
        <span style={{ fontWeight: 600 }}>{title}</span>
        {Icon && <Icon size={18} style={{ opacity: 0.8 }} />}
      </div>
      <div className="metric-value">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      <div className="metric-footer">
        {subtitle && <span>{subtitle}</span>}
        {change && <span style={{ color: change.startsWith('+') ? 'var(--color-amber)' : 'var(--color-green)' }}>{change}</span>}
        {badge}
      </div>
    </div>
  );
}
