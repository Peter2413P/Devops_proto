/**
 * StreamOps Load Testing Configuration & Shared Helpers (k6)
 */
export const CONFIG = {
  baseUrl: __ENV.BASE_URL || 'http://localhost:8080',
  defaultVideoId: __ENV.VIDEO_ID || 'sample',
};

/**
 * Standard HTTP headers for API requests
 */
export const JSON_HEADERS = {
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'k6-streamops-tester/1.0',
  },
};

/**
 * HTTP Range header for streaming requests
 */
export function getRangeHeaders(startByte, endByte) {
  const rangeHeader = endByte !== undefined 
    ? `bytes=${startByte}-${endByte}` 
    : `bytes=${startByte}-`;
  return {
    headers: {
      'Range': rangeHeader,
      'User-Agent': 'k6-streamops-streaming-tester/1.0',
    },
  };
}
