/**
 * VibeRuntime — Monorepo & Standalone Ortam Adaptörü (v1.2.0)
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

  // Standalone & Monorepo ortak <wa-icon> Custom Element desteği
  try {
    if (typeof customElements !== 'undefined' && !customElements.get('wa-icon')) {
      customElements.define('wa-icon', class extends HTMLElement {
        connectedCallback() {
          var name = this.getAttribute('name');
          this.style.display = 'inline-flex';
          this.style.alignItems = 'center';
          this.style.justifyContent = 'center';
          this.style.lineHeight = '1';
          if (!this.innerHTML.trim() && name && /^[a-z0-9-]+$/i.test(name)) {
            this.innerHTML = '<i class="fa-solid fa-' + name + '"></i>';
          }
        }
      });
    }
  } catch (_) {}

  // Global Toast & Clipboard yardımcıları (Standalone modda core.js yüklü olmadığında devreye girer)
  function showToastFallback(msg, duration) {
    var ms = typeof duration === 'number' ? duration : 3200;
    if (typeof document === 'undefined') return;
    var toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-mistral-orange text-white font-bold text-xs shadow-lg transition-all duration-300 z-50 opacity-0 pointer-events-none translate-y-2';
      document.body.appendChild(toast);
    }
    toast.textContent = String(msg == null ? '' : msg);
    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');

    if (global.__vibeToastTimer) clearTimeout(global.__vibeToastTimer);
    global.__vibeToastTimer = setTimeout(function () {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
    }, ms);
  }

  function fallbackExecCopy(text, successMsg) {
    if (typeof document === 'undefined') return;
    var ta = document.createElement('textarea');
    ta.value = String(text == null ? '' : text);
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (typeof global.showToast === 'function') global.showToast(successMsg || 'Panoya kopyalandı!');
    } catch (_) {
      if (typeof global.showToast === 'function') global.showToast('Kopyalama başarısız oldu.');
    }
    document.body.removeChild(ta);
  }

  function safeCopyFallback(text, successMsg) {
    var msg = successMsg || 'Panoya kopyalandı!';
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(String(text == null ? '' : text)).then(function () {
        if (typeof global.showToast === 'function') global.showToast(msg);
      }).catch(function () {
        fallbackExecCopy(text, msg);
      });
    } else {
      fallbackExecCopy(text, msg);
    }
  }

  if (typeof global.showToast !== 'function') {
    global.showToast = showToastFallback;
  }
  if (typeof global.copyToClipboard !== 'function') {
    global.copyToClipboard = safeCopyFallback;
  }
  if (typeof global.safeCopyToClipboard !== 'function') {
    global.safeCopyToClipboard = safeCopyFallback;
  }

  function isLoggedIn() {
    if (isStandalone) return false;
    if (typeof global.isLoggedIn === 'function' && global.isLoggedIn !== isLoggedIn) {
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


  // -------------------------------------------------------------
  // 4. Native Sanitizer API (setHTML) & Safe DOM Helpers
  // -------------------------------------------------------------
  if (typeof global.vibeEscapeHTML !== 'function') {
    global.vibeEscapeHTML = function (str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
  }

  function sanitizeFragment(htmlString, options) {
    var opts = options || {};
    var raw = String(htmlString == null ? '' : htmlString);
    var tpl = document.createElement('template');
    tpl.innerHTML = raw;
    tpl.content.querySelectorAll('script, iframe, object, embed').forEach(function (n) { n.remove(); });
    var allowUIHandlers = opts.allowUIHandlers === true;
    var safeHandlerPattern = /^[a-zA-Z0-9_$.]+\([^<>]*\);?$/;
    tpl.content.querySelectorAll('*').forEach(function (node) {
      var attrs = Array.prototype.slice.call(node.attributes || []);
      for (var i = 0; i < attrs.length; i += 1) {
        var name = attrs[i].name.toLowerCase();
        var val = (attrs[i].value || '').trim();
        var valLower = val.toLowerCase();
        if ((name === 'href' || name === 'src' || name === 'xlink:href' || name === 'action' || name === 'formaction') && (valLower.indexOf('javascript:') === 0 || valLower.indexOf('data:text/html') === 0)) {
          node.removeAttribute(attrs[i].name);
        } else if (name.indexOf('on') === 0) {
          if (!allowUIHandlers || !safeHandlerPattern.test(val) || /alert\s*\(|eval\s*\(|Function\s*\(|document\.cookie|fetch\s*\(/i.test(val)) {
            node.removeAttribute(attrs[i].name);
          }
        }
      }
    });
    return tpl.content;
  }

  if (typeof global.vibeSetHTML !== 'function') {
    global.vibeSetHTML = function (el, htmlString, options) {
      if (!el) return;
      var opts = options || {};
      var raw = String(htmlString == null ? '' : htmlString);
      if (!opts.allowUIHandlers && typeof el.setHTML === 'function') {
        el.setHTML(raw);
        return;
      }
      el.replaceChildren(sanitizeFragment(raw, opts));
    };
  }

  if (typeof global.vibeAppendHTML !== 'function') {
    global.vibeAppendHTML = function (el, htmlString, options) {
      if (!el) return;
      el.appendChild(sanitizeFragment(htmlString, options));
    };
  }


  // -------------------------------------------------------------
  // 4.5. Runtime DOM XSS Sink Guard (Element.prototype.innerHTML & Trusted Types)
  // -------------------------------------------------------------
  (function installDomXssSinkGuard() {
    if (global.__VIBE_DOM_SINK_GUARD__) return;
    global.__VIBE_DOM_SINK_GUARD__ = true;
    try {
      var proto = typeof Element !== 'undefined' ? Element.prototype : null;
      var desc = proto ? Object.getOwnPropertyDescriptor(proto, 'innerHTML') : null;
      if (desc && typeof desc.set === 'function' && typeof desc.get === 'function') {
        var nativeSet = desc.set;
        var nativeGet = desc.get;
        global.vibeSanitizeHTML = function (htmlString) {
          var raw = String(htmlString == null ? '' : htmlString);
          if (!raw || raw.indexOf('<') === -1) return raw;
          if (!/<\s*(?:script|iframe|object|embed)\b|on[a-z]+\s*=|javascript\s*:|data\s*:\s*text\/html/i.test(raw)) {
            return raw;
          }
          var tpl = document.createElement('template');
          nativeSet.call(tpl, raw);
          tpl.content.querySelectorAll('script, iframe, object, embed').forEach(function (n) { n.remove(); });
          var safeHandler = /^[a-zA-Z0-9_$.]+\([^<>]*\);?$/;
          tpl.content.querySelectorAll('*').forEach(function (node) {
            var attrs = Array.prototype.slice.call(node.attributes || []);
            for (var i = 0; i < attrs.length; i += 1) {
              var name = attrs[i].name.toLowerCase();
              var val = (attrs[i].value || '').trim();
              var valLower = val.toLowerCase();
              if ((name === 'href' || name === 'src' || name === 'xlink:href' || name === 'action' || name === 'formaction') && (valLower.indexOf('javascript:') === 0 || valLower.indexOf('data:text/html') === 0)) {
                node.removeAttribute(attrs[i].name);
              } else if (name.indexOf('on') === 0) {
                if (!safeHandler.test(val) || /alert\s*\(|eval\s*\(|Function\s*\(|document\.cookie|fetch\s*\(|XMLHttpRequest/i.test(val)) {
                  node.removeAttribute(attrs[i].name);
                }
              }
            }
          });
          return nativeGet.call(tpl);
        };
        Object.defineProperty(proto, 'innerHTML', {
          configurable: true,
          enumerable: desc.enumerable,
          get: function () {
            return nativeGet.call(this);
          },
          set: function (val) {
            if (this && this.tagName === 'TEMPLATE') {
              nativeSet.call(this, val);
              return;
            }
            nativeSet.call(this, global.vibeSanitizeHTML(val));
          }
        });
      }
    } catch (_) {}
  })();

  global.VibeRuntime = {
    version: '1.2.0',
    mode: isStandalone ? 'standalone' : 'monorepo',
    isStandalone: isStandalone,
    isMonorepo: !isStandalone,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    getAuthHeader: getAuthHeader,
    showToast: function (m, d) { return global.showToast(m, d); },
    copyToClipboard: function (t, m) { return global.safeCopyToClipboard(t, m); },
    setHTML: function (el, h) { return global.vibeSetHTML(el, h); },
    appendHTML: function (el, h) { return global.vibeAppendHTML(el, h); },
    storage: storage
  };
})(typeof window !== 'undefined' ? window : globalThis);
