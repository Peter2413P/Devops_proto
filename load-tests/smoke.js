import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG, JSON_HEADERS, getRangeHeaders } from './config.js';

export const options = {
  vus: 1,
  duration: '15s',
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% errors
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
  },
};

export default function () {
  // 1. Gateway health check
  const healthzRes = http.get(`${CONFIG.baseUrl}/healthz`);
  check(healthzRes, {
    'gateway responds 200': (r) => r.status === 200,
  });

  // 2. Real backend health check
  const healthRes = http.get(`${CONFIG.baseUrl}/api/health`, JSON_HEADERS);
  check(healthRes, {
    'backend status is 200': (r) => r.status === 200,
    'backend reports healthy': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch (e) {
        return false;
      }
    },
    'backend instance header present': (r) => r.headers['X-Backend-Instance'] !== undefined,
  });

  // 3. Catalogue discovery
  const catalogRes = http.get(`${CONFIG.baseUrl}/api/videos`, JSON_HEADERS);
  let targetVideoId = CONFIG.defaultVideoId;

  check(catalogRes, {
    'catalogue status is 200': (r) => r.status === 200,
    'discovered at least 1 video': (r) => {
      try {
        const body = JSON.parse(r.body);
        if (body.videos && body.videos.length > 0) {
          targetVideoId = body.videos[0].id;
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    },
  });

  // 4. Video metadata retrieval
  const metaRes = http.get(`${CONFIG.baseUrl}/api/videos/${targetVideoId}`, JSON_HEADERS);
  check(metaRes, {
    'video metadata status is 200': (r) => r.status === 200,
  });

  // 5. HTTP Range stream check (exact 1024 bytes)
  const rangeRes = http.get(`${CONFIG.baseUrl}/api/videos/${targetVideoId}/stream`, getRangeHeaders(0, 1023));
  check(rangeRes, {
    'range streaming returns 206': (r) => r.status === 206,
    'content-range header present': (r) => r.headers['Content-Range'] !== undefined,
    'body length is exactly 1024 bytes': (r) => r.body && r.body.length === 1024,
  });

  sleep(1);
}
