// ================================================================
// LUCENOR — main.js
// ================================================================

// ── 1. Inject header & footer via fetch() ───────────────────────
function injectPartial(placeholderId, filePath, callback) {
  var el = document.getElementById(placeholderId);
  if (!el) return;

  fetch(filePath)
    .then(function(res) { return res.text(); })
    .then(function(html) {
      // Insert the partial BEFORE the placeholder, then remove placeholder
      el.insertAdjacentHTML('beforebegin', html);
      el.remove();
      // Now the real DOM nodes exist — init UI
      if (callback) callback();
    })
    .catch(function(err) {
      console.warn('Could not load partial:', filePath, err);
    });
}

// ── 2. Mark the current page link as active in the nav ───────────
function markActiveNavLink() {
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav__links a').forEach(function(link) {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

// ── 3. Theme toggle (dark / light) ──────────────────────────────
function initThemeToggle() {
  var toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  updateToggleIcon(toggle, document.documentElement.getAttribute('data-theme'));

  toggle.addEventListener('click', function() {
    var root = document.documentElement;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    toggle.setAttribute('aria-label', 'Switch to ' + (next === 'dark' ? 'light' : 'dark') + ' mode');
    updateToggleIcon(toggle, next);
  });
}

function updateToggleIcon(toggle, theme) {
  if (!toggle) return;
  toggle.innerHTML = theme === 'dark'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

// ── 4. Mobile nav — open / close ────────────────────────────────
function initMobileNav() {
  var btn    = document.getElementById('nav-toggle');
  var header = document.getElementById('site-header');
  var panel  = document.getElementById('mobile-nav');
  if (!btn || !header || !panel) return;

  btn.addEventListener('click', function() {
    if (header.classList.contains('nav-open')) {
      closeNav(btn, header, panel);
    } else {
      openNav(btn, header, panel);
    }
  });

  panel.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      closeNav(btn, header, panel);
    });
  });

  document.addEventListener('click', function(e) {
    if (!header.contains(e.target) && header.classList.contains('nav-open')) {
      closeNav(btn, header, panel);
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      closeNav(btn, header, panel);
      btn.focus();
    }
  });
}

function openNav(btn, header, panel) {
  header.classList.add('nav-open');
  btn.setAttribute('aria-expanded', 'true');
  btn.setAttribute('aria-label', 'Close navigation menu');
  panel.setAttribute('aria-hidden', 'false');
}

function closeNav(btn, header, panel) {
  header.classList.remove('nav-open');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Open navigation menu');
  panel.setAttribute('aria-hidden', 'true');
}

// ── 5. Set theme before first render (avoids flash) ──────────────
(function() {
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
})();

// ── 6. Boot ──────────────────────────────────────────────────────
function initAll() {
  initThemeToggle();
  initMobileNav();
  markActiveNavLink();
}

injectPartial('header-placeholder', 'assets/includes/header.html', initAll);
injectPartial('footer-placeholder', 'assets/includes/footer.html');