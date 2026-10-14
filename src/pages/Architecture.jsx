import React from 'react';
import { Layers, Box, GitBranch, Activity, Cpu, Shield, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import { DEVOPS_CONCEPTS } from '../data/simulationData';

export default function Architecture() {
  const getConceptIcon = (id) => {
    switch (id) {
      case 'containerization': return <Box size={22} style={{ color: 'var(--color-blue)' }} />;
      case 'cicd': return <GitBranch size={22} style={{ color: 'var(--color-purple)' }} />;
      case 'monitoring': return <Activity size={22} style={{ color: 'var(--color-amber)' }} />;
      case 'autoscaling': return <Cpu size={22} style={{ color: 'var(--color-cyan)' }} />;
      case 'highavailability': return <Shield size={22} style={{ color: 'var(--color-green)' }} />;
      default: return <Layers size={22} />;
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          System Design & Academic Specification
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Architecture & DevOps Principles
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px', marginTop: '0.5rem' }}>
          How DevOps methodologies (container orchestration, automated CI/CD pipelines, elastic scaling, and health monitoring) solve the challenges of scalable video streaming.
        </p>
      </div>

      {/* Visual Architecture Diagram Component */}
      <ArchitectureDiagram />

      {/* DevOps Concept Cards Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Core DevOps Engineering Concepts
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Theoretical foundations and their corresponding simulation mapping in StreamOps
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {DEVOPS_CONCEPTS.map((concept) => (
            <div key={concept.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getConceptIcon(concept.id)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {concept.title}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {concept.subtitle}
                    </div>
                  </div>
                </div>

                <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                  {concept.tag}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                "{concept.description}"
              </p>

              {/* Core Benefits */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Key DevOps Advantages
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: 0 }}>
                  {concept.bullets.map((b, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <CheckCircle2 size={13} style={{ color: 'var(--color-green)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prototype Mapping note */}
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--color-cyan)' }}>
                <strong>Prototype Implementation:</strong> {concept.prototypeMapping}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem vs Solution Summary Table for Academic Defense */}
      <section className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Problem vs. Proposed DevOps Solution Matrix
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Challenge Area</th>
                <th style={{ padding: '0.75rem 1rem' }}>Traditional Problem</th>
                <th style={{ padding: '0.75rem 1rem' }}>DevOps Engineering Solution</th>
                <th style={{ padding: '0.75rem 1rem' }}>Simulated Metric Outcome</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Traffic Surges</td>
                <td style={{ padding: '0.85rem 1rem', color: '#f87171' }}>Single server CPU spikes to 95%, video buffering, packet drops</td>
                <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>Horizontal Pod Autoscaling (HPA) adds replicas elastically</td>
                <td style={{ padding: '0.85rem 1rem', color: '#34d399', fontWeight: 600 }}>CPU drops from 95% to 58% across 3 pods</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Hardware/Process Failure</td>
                <td style={{ padding: '0.85rem 1rem', color: '#f87171' }}>Single point of failure crashes stream for all 2,500 viewers</td>
                <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>Multi-zone redundancy & health-checked load balancer failover</td>
                <td style={{ padding: '0.85rem 1rem', color: '#34d399', fontWeight: 600 }}>Status remains AVAILABLE (50% traffic per healthy pod)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Software Upgrades</td>
                <td style={{ padding: '0.85rem 1rem', color: '#f87171' }}>Manual server deployment requires maintenance downtime window</td>
                <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>Automated CI/CD with unit testing & rolling container rollout</td>
                <td style={{ padding: '0.85rem 1rem', color: '#34d399', fontWeight: 600 }}>Upgraded to v1.1.0 with 0 seconds downtime</td>
              </tr>
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Observability</td>
                <td style={{ padding: '0.85rem 1rem', color: '#f87171' }}>Late discovery of outages after users complain on social media</td>
                <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>Real-time telemetry (Prometheus/Grafana) and instant alarm logs</td>
                <td style={{ padding: '0.85rem 1rem', color: '#34d399', fontWeight: 600 }}>Live sub-second telemetry dashboards and event logging</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
