/* O·COMPLEX — концепт-демо. Минимум JS: темы, меню, фильтр каталога, фолбэк фото. */
(function () {
  'use strict';

  var THEME_KEY = 'ocomplex.theme';
  var THEMES = ['a', 'b', 'c'];
  var root = document.documentElement;

  /* ---------------------------------------------------------------- темы */
  var themeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-theme-option]'));

  function syncThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    var bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (bg) meta.setAttribute('content', bg);
  }

  function setTheme(theme, persist) {
    if (THEMES.indexOf(theme) === -1) theme = 'b';
    root.setAttribute('data-theme', theme);
    themeButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-option') === theme));
    });
    var caption = document.querySelector('[data-theme-current]');
    if (caption) caption.textContent = theme.toUpperCase();
    syncThemeColor();
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* приватный режим */ }
    }
  }

  themeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(btn.getAttribute('data-theme-option'), true);
    });
  });

  /* --------------------------------------------------- панель переключателя */
  var switcher = document.querySelector('.theme-switch');
  var switcherToggle = document.getElementById('theme-toggle');

  function setSwitcher(open) {
    if (!switcher || !switcherToggle) return;
    switcher.classList.toggle('is-open', open);
    switcherToggle.setAttribute('aria-expanded', String(open));
  }

  if (switcher && switcherToggle) {
    switcherToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      setSwitcher(!switcher.classList.contains('is-open'));
    });
    document.addEventListener('click', function (event) {
      if (!switcher.contains(event.target)) setSwitcher(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && switcher.classList.contains('is-open')) {
        setSwitcher(false);
        switcherToggle.focus();
      }
    });
    themeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (window.innerWidth <= 560) setSwitcher(false);
      });
    });
  }

  var initialTheme = 'b';
  try {
    initialTheme = localStorage.getItem(THEME_KEY) || root.getAttribute('data-theme') || 'b';
  } catch (e) {
    initialTheme = root.getAttribute('data-theme') || 'b';
  }
  var urlTheme = new URLSearchParams(location.search).get('theme');
  if (THEMES.indexOf(urlTheme) !== -1) initialTheme = urlTheme;
  setTheme(initialTheme, false);

  /* --------------------------------------------------------- шапка/скролл */
  var header = document.querySelector('.header');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------- мобильное меню */
  var burger = document.getElementById('burger');
  var navLinks = document.querySelectorAll('.nav a');

  function closeMenu() {
    if (!header || !burger) return;
    header.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('nav-open');
  }

  function openMenu() {
    if (!header || !burger) return;
    header.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    document.body.classList.add('nav-open');
    var firstLink = document.querySelector('.nav__list a');
    if (firstLink) {
      try { firstLink.focus({ preventScroll: true }); } catch (e) { firstLink.focus(); }
    }
  }

  if (burger && header) {
    burger.addEventListener('click', function () {
      if (header.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    Array.prototype.forEach.call(navLinks, function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('is-open')) {
        closeMenu();
        burger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  /* ------------------------------------------------------ фильтр каталога */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card[data-cat]'));

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');
      filterButtons.forEach(function (other) {
        other.setAttribute('aria-pressed', String(other === btn));
      });
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(/\s+/);
        card.hidden = filter !== 'all' && cats.indexOf(filter) === -1;
      });
    });
  });

  /* ------------------------------------- фолбэк, если фото ещё не сгенерировано */
  function markEmptyMedia(img) {
    var media = img.closest ? img.closest('.media') : null;
    if (media) media.classList.add('is-empty');
  }

  Array.prototype.forEach.call(document.images, function (img) {
    if (img.complete && img.naturalWidth === 0) markEmptyMedia(img);
    img.addEventListener('error', function () { markEmptyMedia(img); });
    img.addEventListener('load', function () {
      var media = img.closest ? img.closest('.media') : null;
      if (media) media.classList.remove('is-empty');
    });
  });
})();
