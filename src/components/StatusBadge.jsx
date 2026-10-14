import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Activity, RefreshCw } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const norm = (status || '').toLowerCase();

  let badgeClass = 'badge-healthy';
  let Icon = CheckCircle2;
  let label = status || 'HEALTHY';

  if (norm.includes('warn')) {
    badgeClass = 'badge-warning';
    Icon = AlertTriangle;
    label = 'WARNING';
  } else if (norm.includes('overload') || norm.includes('fail') || norm.includes('down')) {
    badgeClass = 'badge-danger';
    Icon = XCircle;
    label = norm.includes('fail') ? 'FAILED' : 'OVERLOADED';
  } else if (norm.includes('avail')) {
    badgeClass = 'badge-available';
    Icon = Activity;
    label = 'AVAILABLE';
  } else if (norm.includes('start')) {
    badgeClass = 'badge-starting';
    Icon = RefreshCw;
    label = 'PROVISIONING';
  }

  return (
    <span className={`badge ${badgeClass} ${size === 'sm' ? 'text-xs' : ''}`}>
      <Icon size={size === 'sm' ? 12 : 14} className={norm.includes('start') ? 'animate-spin' : ''} />
      <span>{label}</span>
    </span>
  );
}
