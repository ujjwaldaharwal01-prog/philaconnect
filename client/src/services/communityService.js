// services/communityService.js
// Talks to /api/community. Errors come back as CommunityApiError with a readable message.
import { getToken } from '../utils/auth';

export class CommunityApiError extends Error {
  constructor(message, status = 0, fieldErrors = null) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`/api/community${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new CommunityApiError('Cannot reach the server. Is it running?');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* not JSON */
  }
  if (!res.ok) {
    throw new CommunityApiError(data?.message || 'Something went wrong. Please try again.', res.status, data?.errors || null);
  }
  return data;
}

export const TOPICS = ['General', 'Identification', 'Buy & Sell', 'Collecting Tips', 'Show & Tell'];

export function fetchPosts({ topic = '', q = '', page = 1 } = {}) {
  const params = new URLSearchParams();
  if (topic) params.set('topic', topic);
  if (q) params.set('q', q);
  params.set('page', String(page));
  return request(`/posts?${params}`);
}
export const fetchPost = (id) => request(`/posts/${encodeURIComponent(id)}`);
export const createPost = (payload) => request('/posts', { method: 'POST', body: JSON.stringify(payload) });
export const deletePost = (id) => request(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const addComment = (id, body) => request(`/posts/${encodeURIComponent(id)}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
export const deleteComment = (id) => request(`/comments/${encodeURIComponent(id)}`, { method: 'DELETE' });
