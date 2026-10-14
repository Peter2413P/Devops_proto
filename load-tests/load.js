import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { CONFIG, JSON_HEADERS, getRangeHeaders } from './config.js';

// Custom metric counters to measure real traffic distribution across backend replicas
const backend1Counter = new Counter('backend1_requests');
const backend2Counter = new Counter('backend2_requests');
const otherBackendCounter = new Counter('other_backend_requests');

export const options = {
  stages: [
    { duration: '15s', target: 1 },  // Warm-up
    { duration: '30s', target: 5 },  // Ramp to 5 VUs
    { duration: '30s', target: 10 }, // Ramp to 10 VUs
    { duration: '60s', target: 10 }, // Sustained load
    { duration: '15s', target: 0 },  // Cool down
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],    // Error rate must stay below 2%
    http_req_duration: ['p(95)<1000'], // p95 latency under 1000ms
  },
};

export default function () {
  // Query health and inspect routing instance
  const healthRes = http.get(`${CONFIG.baseUrl}/api/health`, JSON_HEADERS);
  const instance = healthRes.headers['X-Backend-Instance'];

  if (instance === 'backend1') {
    backend1Counter.add(1);
  } else if (instance === 'backend2') {
    backend2Counter.add(1);
  } else {
    otherBackendCounter.add(1);
  }

  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'backend instance header attached': () => instance !== undefined,
  });

  // Query catalogue
  const catalogRes = http.get(`${CONFIG.baseUrl}/api/videos`, JSON_HEADERS);
  check(catalogRes, {
    'catalog returns 200': (r) => r.status === 200,
  });

  // HTTP Range request for media chunk (1024 bytes)
  const rangeRes = http.get(
    `${CONFIG.baseUrl}/api/videos/${CONFIG.defaultVideoId}/stream`,
    getRangeHeaders(0, 1023)
  );

  check(rangeRes, {
    'range request returns 206': (r) => r.status === 206,
    'content-range present': (r) => r.headers['Content-Range'] !== undefined,
  });

  sleep(0.5);
}
