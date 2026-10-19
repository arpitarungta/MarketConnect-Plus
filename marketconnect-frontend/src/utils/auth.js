// src/utils/auth.js
// Single place for token + user persistence
const TOKEN_KEY = 'mc_token';
const USER_KEY = 'mc_user';

// Legacy keys some parts of the app still use
const LEGACY_TOKEN_KEY = 'token';
const LEGACY_USER_KEY = 'user';

export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    // keep legacy key in sync for other code that reads 'token'
    try { localStorage.setItem(LEGACY_TOKEN_KEY, token); } catch (e) {}
  } catch (e) {
    console.error('saveToken error', e);
  }
}

export function getToken() {
  try {
    // prefer the new namespaced key
    let t = localStorage.getItem(TOKEN_KEY);
    if (t) return t;
    // fallback to legacy key
    return localStorage.getItem(LEGACY_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function saveUser(user) {
  try {
    // if it's an object, stringify it
    if (typeof user === 'object') {
      const raw = JSON.stringify(user);
      localStorage.setItem(USER_KEY, raw);
      // keep legacy key in sync
      try { localStorage.setItem(LEGACY_USER_KEY, raw); } catch (e) {}
    } else {
      localStorage.setItem(USER_KEY, String(user));
      try { localStorage.setItem(LEGACY_USER_KEY, String(user)); } catch (e) {}
    }
  } catch (e) {
    console.error('saveUser error', e);
  }
}

export function getUser() {
  try {
    // prefer the namespaced key first
    let raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      // fallback to legacy key
      raw = localStorage.getItem(LEGACY_USER_KEY);
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (e) {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // legacy keys
    try { localStorage.removeItem(LEGACY_TOKEN_KEY); } catch(e){}
    try { localStorage.removeItem(LEGACY_USER_KEY); } catch(e){}

    // also clear sessionStorage in case something got saved there
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(LEGACY_TOKEN_KEY);
      sessionStorage.removeItem(LEGACY_USER_KEY);
    } catch (e) {}
  } catch (e) {
    console.error('clearToken error', e);
  }
}

// helper to test if logged in
export function isLoggedIn() {
  return !!getToken();
}
