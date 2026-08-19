import { supabase } from './supabaseClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * authFetch
 * ---------
 * Wraps fetch() and automatically attaches the current Supabase
 * session's access token as a Bearer token.
 */
async function authFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json;
}

export const api = {
  getMe: () => authFetch('/students/me'),
  onboard: (academicId, fullName) =>
    authFetch('/students/onboard', {
      method: 'POST',
      body: JSON.stringify({ academicId, fullName }),
    }),
  getCourses: () => authFetch('/courses'),
  getFiles: () => authFetch('/files'),
  deleteFile: (id) => authFetch(`/files/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  sendChat: (question, courseId) =>
    authFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ question, courseId: courseId || null }),
    }),
  uploadFile: (file, courseId, adminSecret) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    return authFetch('/upload', {
      method: 'POST',
      headers: { 'X-Upload-Secret': adminSecret },
      body: formData,
    });
  },
};
