// services/chatService.js
// Talks to /api/chat (the community group chat). Every call needs a logged-in user.
import { getToken } from '../utils/auth';

export class ChatApiError extends Error {
  constructor(message, status = 0, code = '', fieldErrors = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

// The room ids must match ROOMS in server/routes/chat.js.
export const CHAT_ROOMS = [
  { id: 'general', label: 'General', blurb: 'Say hello and talk about anything philately.' },
  { id: 'buy-sell', label: 'Buy & Sell', blurb: 'Swap and trade talk. Deal safely: never share bank details.' },
  { id: 'beginners', label: 'Beginners', blurb: 'New to stamps? Ask anything, no question is silly.' },
  { id: 'india', label: 'Indian Stamps', blurb: 'Indian issues, history and heritage.' },
];

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`/api/chat${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
  } catch {
    throw new ChatApiError('Cannot reach the server. Is it running?');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* not JSON */
  }
  if (!res.ok) {
    throw new ChatApiError(data?.message || 'Something went wrong. Please try again.', res.status, data?.code || '', data?.errors || null);
  }
  return data;
}

export const fetchMyNickname = () => request('/me');
export const saveNickname = (nickname) => request('/nickname', { method: 'POST', body: JSON.stringify({ nickname }) });
export const fetchMessages = (room) => request(`/rooms/${encodeURIComponent(room)}/messages`);
export const sendMessage = (room, body) => request(`/rooms/${encodeURIComponent(room)}/messages`, { method: 'POST', body: JSON.stringify({ body }) });
export const deleteMessage = (id) => request(`/messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const reportMessage = (id) => request(`/messages/${encodeURIComponent(id)}/report`, { method: 'POST' });
