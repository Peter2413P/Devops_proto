import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { CONFIG, getRangeHeaders } from './config.js';

const bytesTransferredCounter = new Counter('stream_bytes_transferred');

export const options = {
  stages: [
    { duration: '10s', target: 2 },
    { duration: '30s', target: 6 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const videoId = CONFIG.defaultVideoId;

  // 1. Initial chunk (First 1 KB)
  const initialRange = getRangeHeaders(0, 1023);
  const res1 = http.get(`${CONFIG.baseUrl}/api/videos/${videoId}/stream`, initialRange);

  check(res1, {
    'initial range is 206 Partial Content': (r) => r.status === 206,
    'content-range starts at bytes 0-1023': (r) => {
      const cr = r.headers['Content-Range'] || '';
      return cr.startsWith('bytes 0-1023/');
    },
    'body byte length is exactly 1024': (r) => r.body && r.body.length === 1024,
    'backend instance header attached': (r) => r.headers['X-Backend-Instance'] !== undefined,
  });

  if (res1.body) {
    bytesTransferredCounter.add(res1.body.length);
  }

  // 2. Mid-stream seeking chunk (16 KB seek simulation)
  const seekRange = getRangeHeaders(40960, 57343);
  const res2 = http.get(`${CONFIG.baseUrl}/api/videos/${videoId}/stream`, seekRange);

  check(res2, {
    'seeking range is 206 Partial Content': (r) => r.status === 206,
    'content-range starts at bytes 40960-57343': (r) => {
      const cr = r.headers['Content-Range'] || '';
      return cr.startsWith('bytes 40960-57343/');
    },
    'body byte length is exactly 16384 bytes': (r) => r.body && r.body.length === 16384,
  });

  if (res2.body) {
    bytesTransferredCounter.add(res2.body.length);
  }

  // 3. Out-of-bounds invalid range request (Must safely return 416)
  const invalidRange = getRangeHeaders(999999999, 999999999 + 1024);
  const res3 = http.get(`${CONFIG.baseUrl}/api/videos/${videoId}/stream`, invalidRange);

  check(res3, {
    'out of bounds range returns 416': (r) => r.status === 416,
    '416 response has content-range bytes */': (r) => {
      const cr = r.headers['Content-Range'] || '';
      return cr.startsWith('bytes */');
    },
  });

  sleep(0.5);
}
