const API = '/api';

function currentUser() {
  return JSON.parse(sessionStorage.getItem('currentUser') || 'null');
}

function isAdmin() {
  return sessionStorage.getItem('isAdmin') === 'true';
}

function requireAuth() {
  if (!currentUser()) location.href = 'login.html';
}

function requireAdmin() {
  if (!isAdmin()) location.href = 'index.html';
}

function initNav() {
  const user = currentUser();
  const authBtn = document.getElementById('authBtn');
  if (!authBtn) return;
  if (user) {
    authBtn.textContent = 'Sign out';
    authBtn.classList.add('nav-btn--danger');
    authBtn.onclick = async () => {
      try { await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' }); } catch (e) {}
      sessionStorage.clear();
      location.href = 'index.html';
    };
  } else {
    authBtn.onclick = () => location.href = 'login.html';
  }
}

async function apiFetch(path, options = {}) {
  const opts = { credentials: 'include', ...options };
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof URLSearchParams)) {
    opts.body = JSON.stringify(opts.body);
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  }
  const res = await fetch(API + path, opts);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function formatDuration(minutes) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatAgeLimit(age) {
  return age === 0 ? 'All' : `${age}+`;
}

function getParams() {
  return new URLSearchParams(location.search);
}
