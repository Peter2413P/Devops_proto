/**
 * StreamOps API Client
 * Connects the React frontend to the real FastAPI video backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Fetch backend health and operational status.
 */
export async function getHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    const data = await res.json();
    return { data, error: null, isOnline: true };
  } catch (err) {
    return {
      data: null,
      error: err.message || 'Backend connection failed',
      isOnline: false
    };
  }
}

/**
 * Discover and list videos discovered by the backend media catalogue.
 */
export async function getVideoCatalog() {
  try {
    const res = await fetch(`${API_BASE}/api/videos`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.detail || `Failed to fetch catalogue (HTTP ${res.status})`);
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Error connecting to video service' };
  }
}

/**
 * Retrieve metadata for a single video by ID.
 */
export async function getVideoDetails(videoId) {
  try {
    const res = await fetch(`${API_BASE}/api/videos/${encodeURIComponent(videoId)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.detail || `Video not found (HTTP ${res.status})`);
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Error fetching video metadata' };
  }
}

/**
 * Get direct streaming endpoint URL for an HTML5 video player.
 */
export function getVideoStreamUrl(videoId) {
  if (!videoId) return '';
  return `${API_BASE}/api/videos/${encodeURIComponent(videoId)}/stream`;
}
