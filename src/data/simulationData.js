export const INITIAL_STATE = {
  trafficLevel: 'normal', // 'normal' | 'high' | 'extreme'
  activeUsers: 100,
  requestsPerSecond: 20,
  cpuUsage: 30,
  memoryUsage: 40,
  responseTime: 42, // in ms
  serverInstances: [
    {
      id: 1,
      name: 'Backend Instance 1',
      status: 'healthy', // 'healthy' | 'warning' | 'failed' | 'starting'
      cpu: 30,
      memory: 40,
      requests: 20,
      trafficShare: 100,
      port: 8081,
      zone: 'us-east-1a'
    }
  ],
  autoScalingEnabled: false,
  autoScalingStep: null, // 'detecting' | 'scaling' | 'creating_2' | 'creating_3' | 'balancing' | 'complete'
  isScalingInProgress: false,
  deploymentStatus: 'idle', // 'idle' | 'preparing' | 'testing' | 'building' | 'deploying' | 'healthcheck' | 'complete'
  deploymentProgress: 0,
  isDeploying: false,
  applicationVersion: 'v1.0.0',
  systemStatus: 'HEALTHY', // 'HEALTHY' | 'WARNING' | 'OVERLOADED' | 'AVAILABLE'
  presentationMode: false,
  activityLogs: [
    {
      id: 1,
      timestamp: '10:40:00',
      message: 'System initialized. 1 backend instance active.',
      type: 'info'
    },
    {
      id: 2,
      timestamp: '10:40:05',
      message: 'Initial health check passed. Status: HEALTHY',
      type: 'success'
    }
  ],
  metricsHistory: [
    { time: '10:35', cpu: 28, users: 95, requests: 19, instances: 1 },
    { time: '10:36', cpu: 32, users: 102, requests: 21, instances: 1 },
    { time: '10:37', cpu: 29, users: 98, requests: 20, instances: 1 },
    { time: '10:38', cpu: 31, users: 104, requests: 20, instances: 1 },
    { time: '10:39', cpu: 30, users: 100, requests: 20, instances: 1 }
  ]
};

export const DEVOPS_CONCEPTS = [
  {
    id: 'containerization',
    title: 'Containerization',
    subtitle: 'Docker / OCI Standard',
    tag: 'Portability & Isolation',
    description: 'Applications can be packaged into portable containers so that they behave consistently across environments.',
    bullets: [
      'Eliminates "works on my machine" issues',
      'Enables rapid spin-up and teardown in seconds',
      'Provides isolated resource quotas (CPU, memory)'
    ],
    prototypeMapping: 'Each simulated backend instance acts like an isolated container containerized with identical streaming microservice code.'
  },
  {
    id: 'cicd',
    title: 'Automated CI/CD',
    subtitle: 'Pipelines & Blue/Green Deployments',
    tag: 'Zero-Downtime Releases',
    description: 'Automated testing and deployment allow application updates to be delivered quickly and safely.',
    bullets: [
      'Continuous Integration runs automated unit & integration tests',
      'Continuous Delivery triggers rolling deployments without downtime',
      'Automated rollbacks prevent bad releases from causing outages'
    ],
    prototypeMapping: 'Simulated 6-stage pipeline (Preparing, Testing, Building, Deploying, Health Check, Success) upgrading from v1.0.0 to v1.1.0 with 0 downtime.'
  },
  {
    id: 'monitoring',
    title: 'Real-Time Monitoring',
    subtitle: 'Telemetry & Observability',
    tag: 'Proactive Alerting',
    description: 'System metrics help identify performance issues before they become service outages.',
    bullets: [
      'Scrapes metrics (CPU, Memory, Request Rate, Latency)',
      'Threshold alarms trigger automated scale-out triggers',
      'Live dashboards give engineering visibility into user experience'
    ],
    prototypeMapping: 'Live animated metric cards, real-time charts (CPU, users, req/s), and real-time structured activity logs.'
  },
  {
    id: 'autoscaling',
    title: 'Auto-Scaling',
    subtitle: 'Horizontal Pod Autoscaler (HPA)',
    tag: 'Elastic Capacity',
    description: 'Additional application instances can be created when traffic increases.',
    bullets: [
      'Automatically responds to sudden streaming surges',
      'Distributes incoming HTTP/HLS video chunk requests across multiple backends',
      'Reduces server utilization back to healthy thresholds'
    ],
    prototypeMapping: 'Detects high load (75-95% CPU), dynamically spawns instances 2 and 3, and normalizes CPU to ~55%.'
  },
  {
    id: 'highavailability',
    title: 'High Availability & Failover',
    subtitle: 'Redundancy & Load Balancing',
    tag: 'Fault Tolerance',
    description: 'Multiple application instances reduce the impact of individual server failures.',
    bullets: [
      'Load balancer performs active health checks on endpoints',
      'Traffic automatically reroutes around failed or dead instances',
      'Users continue viewing streams without interruption'
    ],
    prototypeMapping: 'Simulating failure of Instance 2 triggers instant traffic redistribution to Instances 1 & 3, keeping system status AVAILABLE.'
  }
];

export const PRESENTATION_SCENARIOS = [
  {
    step: 1,
    title: 'Baseline Operation',
    problem: 'Baseline video streaming: 100 users, low load.',
    solution: 'Single backend instance handles light load comfortably (30% CPU).',
    actionText: 'Set Normal Traffic',
    action: 'normal'
  },
  {
    step: 2,
    title: 'Traffic Surge & Overload',
    problem: 'Viral video or live event triggers traffic surge (2500 users, 350 req/s). CPU spikes to 95%.',
    solution: 'DevOps monitoring detects warning & overload states before crash occurs.',
    actionText: 'Simulate Extreme Traffic',
    action: 'extreme'
  },
  {
    step: 3,
    title: 'Elastic Auto-Scaling',
    problem: 'A single server cannot sustain 95% CPU without lagging and dropping video packets.',
    solution: 'Auto-scaling horizontally provisions Backend 2 and 3; load balancer redistributes traffic, lowering CPU to ~55%.',
    actionText: 'Enable Auto-Scaling',
    action: 'autoscale'
  },
  {
    step: 4,
    title: 'Hardware/Process Failure & Fault Tolerance',
    problem: 'Backend Instance 2 crashes unexpectedly due to a hardware or process fault.',
    solution: 'High Availability load balancer reroutes 100% of traffic to healthy instances (1 & 3). Service remains 100% AVAILABLE.',
    actionText: 'Simulate Server Failure',
    action: 'fail'
  },
  {
    step: 5,
    title: 'Zero-Downtime Deployment',
    problem: 'Engineering releases a critical video codec update or feature update.',
    solution: 'Automated CI/CD pipeline tests, builds, and deploys v1.1.0 with 0 downtime.',
    actionText: 'Deploy New Version',
    action: 'deploy'
  }
];
