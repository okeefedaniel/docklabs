/**
 * DockLabs Base JS — Shared across all products
 *
 * Features:
 * - Button loading states (prevents double-submit, shows spinner)
 * - Form submit protection
 * - CSRF token helper
 */

(function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Button Loading State
    // -----------------------------------------------------------------------
    // Usage: <button class="dl-btn dl-btn-primary" data-dl-loading-text="Saving...">
    //            <span class="dl-spinner"></span>
    //            <span class="dl-btn-text">Save</span>
    //        </button>
    //
    // On form submit or click, the button enters a loading state:
    // - Disabled to prevent double-clicks
    // - Shows a spinner
    // - Optionally changes text to data-dl-loading-text
    // - Re-enables after 8 seconds (safety timeout)

    function setButtonLoading(btn) {
        if (btn.classList.contains('dl-loading')) return;

        btn.classList.add('dl-loading');
        btn.disabled = true;

        const textEl = btn.querySelector('.dl-btn-text');
        const loadingText = btn.getAttribute('data-dl-loading-text');
        if (textEl && loadingText) {
            btn._originalText = textEl.textContent;
            textEl.textContent = loadingText;
        }

        // Safety: re-enable after 8 seconds in case of network issues
        btn._loadingTimeout = setTimeout(function () {
            resetButton(btn);
        }, 8000);
    }

    function resetButton(btn) {
        btn.classList.remove('dl-loading');
        btn.disabled = false;

        const textEl = btn.querySelector('.dl-btn-text');
        if (textEl && btn._originalText) {
            textEl.textContent = btn._originalText;
            delete btn._originalText;
        }

        if (btn._loadingTimeout) {
            clearTimeout(btn._loadingTimeout);
            delete btn._loadingTimeout;
        }
    }

    // Auto-bind: any form with a .dl-btn submit button
    document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!form || form.tagName !== 'FORM') return;

        var btn = form.querySelector('button[type="submit"].dl-btn, input[type="submit"].dl-btn');
        if (!btn) {
            // Also check for the clicked button
            btn = document.activeElement;
            if (!btn || !btn.classList.contains('dl-btn')) return;
        }

        // Use requestAnimationFrame to set loading AFTER form submission starts
        requestAnimationFrame(function () {
            setButtonLoading(btn);
        });
    });

    // Also handle standalone buttons (not in forms) — e.g., AJAX buttons
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.dl-btn[data-dl-ajax]');
        if (btn) {
            setButtonLoading(btn);
        }
    });

    // Expose globally for manual control
    window.DockLabs = window.DockLabs || {};
    window.DockLabs.setButtonLoading = setButtonLoading;
    window.DockLabs.resetButton = resetButton;


    // -----------------------------------------------------------------------
    // CSRF Token Helper
    // -----------------------------------------------------------------------
    window.DockLabs.getCsrfToken = function () {
        var cookie = document.cookie.split(';')
            .map(function (c) { return c.trim(); })
            .find(function (c) { return c.startsWith('csrftoken='); });
        return cookie ? cookie.split('=')[1] : '';
    };


    // -----------------------------------------------------------------------
    // Auto-dismiss alerts after 5 seconds
    // -----------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        var alerts = document.querySelectorAll('.alert-dismissible[data-dl-auto-dismiss]');
        alerts.forEach(function (alert) {
            var delay = parseInt(alert.getAttribute('data-dl-auto-dismiss')) || 5000;
            setTimeout(function () {
                var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
                if (bsAlert) bsAlert.close();
            }, delay);
        });
    });

})();
