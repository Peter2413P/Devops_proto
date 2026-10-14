import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG, JSON_HEADERS, getRangeHeaders } from './config.js';

// Guard: Stress testing is explicitly opt-in to protect system stability
const isStressEnabled = __ENV.ENABLE_STRESS === 'true';

if (!isStressEnabled) {
  console.warn(
    '\n============================================================\n' +
    '  STRESS TEST ABORTED: ENABLE_STRESS=true is not set.\n' +
    '  To run this stress test against local StreamOps gateway, set:\n' +
    '  $env:ENABLE_STRESS="true"; k6 run load-tests/stress.js\n' +
    '============================================================\n'
  );
}

export const options = isStressEnabled
  ? {
      stages: [
        { duration: '30s', target: 15 }, // Ramp to 15 VUs
        { duration: '30s', target: 25 }, // Ramp to 25 VUs
        { duration: '45s', target: 25 }, // Peak saturation
        { duration: '15s', target: 0 },  // Recovery ramp-down
      ],
      thresholds: {
        http_req_failed: ['rate<0.05'],    // Max 5% errors during stress peak
        http_req_duration: ['p(95)<2000'], // p95 latency under 2000ms
      },
    }
  : {
      // Safe no-op single check if not opted in
      vus: 1,
      iterations: 1,
    };

export default function () {
  if (!isStressEnabled) {
    // Quick safety verification only
    const res = http.get(`${CONFIG.baseUrl}/healthz`);
    check(res, { 'gateway responsive (stress dry-run)': (r) => r.status === 200 });
    return;
  }

  // 1. Health probe
  const healthRes = http.get(`${CONFIG.baseUrl}/api/health`, JSON_HEADERS);
  check(healthRes, {
    'health responds under load': (r) => r.status === 200,
  });

  // 2. Range video stream request under stress (4 KB chunk)
  const rangeRes = http.get(
    `${CONFIG.baseUrl}/api/videos/${CONFIG.defaultVideoId}/stream`,
    getRangeHeaders(0, 4095)
  );

  check(rangeRes, {
    'streaming partial content under load': (r) => r.status === 206 || r.status === 200,
  });

  sleep(0.2);
}
