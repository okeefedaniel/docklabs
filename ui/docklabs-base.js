/* ============================================================
   DockLabs — Shared JavaScript
   Button loading states, alerts, CSRF, and utilities.
   Used by: Harbor, Beacon, SignStreamer
   ============================================================ */

(function () {
  'use strict';

  // ----- Auto-dismiss alerts after 5 seconds -----
  document.addEventListener('DOMContentLoaded', function () {
    var alerts = document.querySelectorAll('.alert.alert-dismissible');
    alerts.forEach(function (el) {
      setTimeout(function () {
        try {
          var bsAlert = bootstrap.Alert.getOrCreateInstance(el);
          bsAlert.close();
        } catch (e) { /* bootstrap not loaded yet — ignore */ }
      }, 5000);
    });
  });

  // ----- Button Loading States (DockLabs standard) -----
  // Matches ct.one pattern: disable + opacity + spinner + text change.
  // Uses requestAnimationFrame to defer disable so the form POST isn't cancelled.
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') return;

    var buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
    buttons.forEach(function (btn) {
      if (btn.disabled || btn.hasAttribute('data-no-loading')) return;

      btn.setAttribute('data-original-html', btn.innerHTML);

      // Defer disable so the browser completes the form submission first
      requestAnimationFrame(function () {
        btn.disabled = true;
        btn.classList.add('btn-loading');
        var loadingText = btn.getAttribute('data-loading-text') || 'Processing\u2026';
        btn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' +
          loadingText;
      });
    });
  });

  // ----- Standalone btnLoading helper (for JS-driven actions) -----
  // Usage: var restore = btnLoading(btn, 'Saving...'); await doWork(); restore();
  window.btnLoading = function (btn, text) {
    var original = btn.innerHTML;
    var loadingText = text || btn.getAttribute('data-loading-text') || 'Loading\u2026';
    btn.disabled = true;
    btn.classList.add('btn-loading');
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>' +
      loadingText;
    return function restore() {
      btn.disabled = false;
      btn.classList.remove('btn-loading');
      btn.innerHTML = original;
    };
  };

  // ----- HTMX CSRF Configuration -----
  document.addEventListener('htmx:configRequest', function (event) {
    var csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      event.detail.headers['X-CSRFToken'] = csrfToken;
    }
  });

  /**
   * Read a cookie value by name.
   */
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

})();
