// ================================================================
// LUCENOR — main.js
// ================================================================

// ── 1. Theme: apply saved preference before first paint (no flash) ──
(function () {
  var saved       = localStorage.getItem('lucenor-theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));
}());

// ── 2. Resolve root-relative base path ───────────────────────────
// Works for any page depth: root (0 segments), one level deep (/services/), etc.
// e.g. /index.html        → basePath = ''
//      /services/         → basePath = '../'
//      /services/foo.html → basePath = '../'
(function () {
  var parts = window.location.pathname
    .replace(/\/[^/]*$/, '')  // strip filename / trailing segment
    .split('/')
    .filter(Boolean);          // remove empty strings
  window.__basePath = parts.length ? parts.map(function () { return '..'; }).join('/') + '/' : '';
}());

// ── 3. Helpers ───────────────────────────────────────────────────

/**
 * Fetch an HTML partial and inject it in place of `placeholder`.
 * filePath is relative to the site root (e.g. 'assets/includes/header.html').
 * Returns a Promise that resolves when the HTML is in the DOM.
 */
function injectPartial(placeholderId, filePath) {
  return new Promise(function (resolve) {
    var el = document.getElementById(placeholderId);
    if (!el) { resolve(); return; }

    fetch(window.__basePath + filePath)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + filePath);
        return res.text();
      })
      .then(function (html) {
        el.insertAdjacentHTML('beforebegin', html);
        el.remove();
        resolve();
      })
      .catch(function (err) {
        console.warn('[LUCENOR] Could not load partial:', filePath, err);
        resolve(); // never block Promise.all
      });
  });
}

// ── 4. Mark the active nav link ──────────────────────────────────
function markActiveNavLink() {
  var path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-nav__links a').forEach(function (a) {
    var href = a.getAttribute('href');
    // resolve href against basePath to get an absolute-like path for comparison
    var absHref = '/' + (window.__basePath + href).replace(/^\//, '').replace(/\/+/g, '/');
    var isActive = path === absHref || path.replace(/\/$/, '') === absHref.replace(/\/$/, '').replace(/\/index\.html$/, '');
    a.classList.toggle('active', isActive);
    if (isActive) { a.setAttribute('aria-current', 'page'); }
    else          { a.removeAttribute('aria-current'); }
  });
}

// ── 5. Theme toggle ──────────────────────────────────────────────
function initThemeToggle() {
  var toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  function updateIcon(theme) {
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }

  var root = document.documentElement;
  updateIcon(root.getAttribute('data-theme'));

  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('lucenor-theme', next);
    updateIcon(next);
  });
}

// ── 6. Mobile nav ────────────────────────────────────────────────
function initMobileNav() {
  var btn    = document.getElementById('nav-toggle');
  var header = document.getElementById('site-header');
  var panel  = document.getElementById('mobile-nav');
  if (!btn || !header || !panel) return;

  function openNav() {
    header.classList.add('nav-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close navigation menu');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closeNav() {
    header.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open navigation menu');
    panel.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', function () {
    header.classList.contains('nav-open') ? closeNav() : openNav();
  });

  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

  document.addEventListener('click', function (e) {
    if (!header.contains(e.target) && header.classList.contains('nav-open')) closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      closeNav();
      btn.focus();
    }
  });
}

// ── 7. Boot ──────────────────────────────────────────────────────
// Fetch both partials in parallel; init UI only once BOTH are in the DOM.
Promise.all([
  injectPartial('header-placeholder', 'assets/includes/header.html'),
  injectPartial('footer-placeholder', 'assets/includes/footer.html')
]).then(function () {
  initThemeToggle();
  initMobileNav();
  markActiveNavLink();
});
