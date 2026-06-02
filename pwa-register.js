// ============================================================
// WORD BLASTER — PWA Registration & Install Prompt Handler
// Include this script in ALL HTML pages for full PWA support.
// ============================================================

(function () {
  'use strict';

  // ─── SERVICE WORKER REGISTRATION ──────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered. Scope:', registration.scope);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[PWA] New Service Worker installing...');

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // Optionally show a "New version available" toast
                if (typeof showToast === 'function') {
                  showToast('App updated! Refresh for the latest version.');
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    });
  }

  // ─── INSTALL PROMPT HANDLING ──────────────────────────────
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the browser's default mini-infobar
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Install prompt captured');

    // Show custom install button if it exists on this page
    const installBtn = document.getElementById('pwa-install-btn');
    const installBanner = document.getElementById('pwa-install-banner');

    if (installBtn) {
      installBtn.style.display = '';
      installBtn.addEventListener('click', triggerInstall, { once: true });
    }
    if (installBanner) {
      installBanner.style.display = '';
    }
  });

  function triggerInstall() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      console.log('[PWA] User install choice:', choice.outcome);

      if (choice.outcome === 'accepted') {
        if (typeof showToast === 'function') {
          showToast('Word Blaster installed! 🎮');
        }
      }

      // Hide install UI
      const installBtn = document.getElementById('pwa-install-btn');
      const installBanner = document.getElementById('pwa-install-banner');
      if (installBtn) installBtn.style.display = 'none';
      if (installBanner) installBanner.style.display = 'none';

      deferredPrompt = null;
    });
  }

  // Hide install UI if app is already installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Word Blaster was installed');
    deferredPrompt = null;

    const installBtn = document.getElementById('pwa-install-btn');
    const installBanner = document.getElementById('pwa-install-banner');
    if (installBtn) installBtn.style.display = 'none';
    if (installBanner) installBanner.style.display = 'none';
  });

  // Expose globally so pages can trigger install manually
  window.triggerPWAInstall = triggerInstall;
})();
