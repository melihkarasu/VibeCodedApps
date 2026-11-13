/**
 * VibeRuntime — Monorepo & Standalone Ortam Adaptörü
 *
 * Tek kaynaklı (Single Source of Truth) mikro uygulamaların hem VibeCodedApps monoreposunda
 * (Supabase OAuth + PostgreSQL /api/user-data) hem de tamamen bağımsız GitHub Pages / lokal
 * standalone sürümlerinde (sıfır-backend, sıfır-login, yalnızca localStorage) çalışmasını sağlar.
 */
(function (global) {
  'use strict';

  function detectStandalone() {
    if (global.__VIBE_STANDALONE__ === true) return true;
    if (global.__VIBE_STANDALONE__ === false) return false;
    try {
      var host = (global.location && global.location.hostname) || '';
      var proto = (global.location && global.location.protocol) || '';
      if (proto === 'file:' || host.endsWith('.github.io')) return true;
    } catch (_) {}
    return false;
  }

  var isStandalone = detectStandalone();

  function isLoggedIn() {
    if (isStandalone) return false;
    if (typeof global.isLoggedIn === 'function') {
      try { return Boolean(global.isLoggedIn()); } catch (_) {}
    }
    try { return Boolean(global.localStorage && global.localStorage.getItem('vibe_token')); } catch (_) {}
    return false;
  }

  function getUser() {
    if (isStandalone) return null;
    if (typeof global.getCurrentUser === 'function') {
      try { return global.getCurrentUser(); } catch (_) {}
    }
    try {
      var raw = global.localStorage && global.localStorage.getItem('vibe_user');
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function getAuthHeader() {
    if (isStandalone) return {};
    try {
      var token = global.localStorage && global.localStorage.getItem('vibe_token');
      return token ? { Authorization: 'Bearer ' + token } : {};
    } catch (_) {
      return {};
    }
  }

  function nsKey(appId, key) {
    return 'vibe_sa:' + (appId || 'app') + ':' + key;
  }

  var storage = {
    get: function (appId, key, fallback) {
      var storageKey = isStandalone ? nsKey(appId, key) : key;
      try {
        var raw = global.localStorage ? global.localStorage.getItem(storageKey) : null;
        if (raw === null || raw === undefined) return fallback !== undefined ? fallback : null;
        try { return JSON.parse(raw); } catch (_) { return raw; }
      } catch (_) {
        return fallback !== undefined ? fallback : null;
      }
    },

    set: async function (appId, key, value) {
      var storageKey = isStandalone ? nsKey(appId, key) : key;
      if (!isStandalone && typeof global.saveAppUserData === 'function') {
        await global.saveAppUserData(appId, key, value);
        return true;
      }
      try {
        if (global.localStorage) {
          global.localStorage.setItem(storageKey, typeof value === 'string' ? value : JSON.stringify(value));
        }
        return true;
      } catch (_) {
        return false;
      }
    },

    remove: async function (appId, key) {
      var storageKey = isStandalone ? nsKey(appId, key) : key;
      try {
        if (global.localStorage) global.localStorage.removeItem(storageKey);
      } catch (_) {}
      if (!isStandalone && isLoggedIn() && appId) {
        try {
          await fetch('/api/user-data/' + encodeURIComponent(appId) + '/' + encodeURIComponent(key), {
            method: 'DELETE',
            headers: getAuthHeader(),
            credentials: 'include'
          });
        } catch (_) {}
      }
      return true;
    },

    sync: async function (appId) {
      if (isStandalone) return null;
      if (typeof global.syncAppUserData === 'function') {
        return global.syncAppUserData(appId);
      }
      return null;
    }
  };

  global.VibeRuntime = {
    version: '1.1.0',
    mode: isStandalone ? 'standalone' : 'monorepo',
    isStandalone: isStandalone,
    isMonorepo: !isStandalone,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    getAuthHeader: getAuthHeader,
    storage: storage
  };
})(typeof window !== 'undefined' ? window : globalThis);
