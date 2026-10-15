(function () {
  'use strict';

  // Formun gönderileceği e-posta adresi
  var CONTACT_EMAIL = 'info@nametech.be';

  /* =========================================================
     Dil desteği
     Türkçe metinler HTML'den okunur; diğer diller assets/js/i18n.js içinde.
     ========================================================= */
  var LANGS = ['tr', 'en', 'fr', 'nl', 'de', 'es'];
  var HTML_LANG = { tr: 'tr', en: 'en', fr: 'fr', nl: 'nl-BE', de: 'de', es: 'es' };
  var DICT = window.I18N || {};
  var ODOO_IMG = '<img class="odoo-logo" src="assets/img/odoo-logo.svg" alt="Odoo" width="621" height="196">';
  var lang = LANGS.indexOf(window.__LANG) > -1 ? window.__LANG : 'tr';
  var langListeners = [];

  var textNodes = Array.prototype.map.call(document.querySelectorAll('[data-i18n]'), function (el) {
    return { el: el, key: el.getAttribute('data-i18n'), tr: el.innerHTML };
  });
  var attrNodes = [];
  Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-attr]'), function (el) {
    el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
      var p = pair.split(':');
      if (p.length === 2) attrNodes.push({ el: el, attr: p[0].trim(), key: p[1].trim(), tr: el.getAttribute(p[0].trim()) || '' });
    });
  });

  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || (DICT.tr && DICT.tr[key]) || '';
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  function translated(key, original) {
    if (lang === 'tr') return original;
    var v = DICT[lang] && DICT[lang][key];
    return v == null ? original : v;
  }

  function applyLang(next, remember) {
    lang = LANGS.indexOf(next) > -1 ? next : 'tr';
    textNodes.forEach(function (n) { n.el.innerHTML = translated(n.key, n.tr).replace(/\{odoo\}/g, ODOO_IMG); });
    attrNodes.forEach(function (n) {
      var v = translated(n.key, n.tr).replace(/\{odoo\}/g, 'Odoo').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
      n.el.setAttribute(n.attr, v);
    });
    document.documentElement.lang = HTML_LANG[lang];
    document.title = t('meta.title');
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.desc'));
    langCode.textContent = lang.toUpperCase();
    langMenu.querySelectorAll('[data-lang]').forEach(function (li) {
      li.setAttribute('aria-selected', String(li.dataset.lang === lang));
    });
    if (remember) { try { localStorage.setItem('rubix-lang', lang); } catch (e) {} }
    langListeners.forEach(function (fn) { fn(); });
    document.documentElement.classList.remove('i18n-loading');
  }

  // Dil seçici
  var langBox = document.getElementById('lang');
  var langBtn = document.getElementById('lang-btn');
  var langMenu = document.getElementById('lang-menu');
  var langCode = document.getElementById('lang-code');
  var langItems = Array.prototype.slice.call(langMenu.querySelectorAll('[data-lang]'));
  langItems.forEach(function (li) { li.tabIndex = -1; });

  function setLangMenu(open, focusCurrent) {
    langMenu.hidden = !open;
    langBtn.setAttribute('aria-expanded', String(open));
    if (open && focusCurrent) {
      var cur = langMenu.querySelector('[data-lang="' + lang + '"]') || langItems[0];
      cur.focus();
    }
  }
  langBtn.addEventListener('click', function () { setLangMenu(langMenu.hidden, true); });
  langItems.forEach(function (li, i) {
    li.addEventListener('click', function () { applyLang(li.dataset.lang, true); setLangMenu(false); langBtn.focus(); });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); langItems[(i + 1) % langItems.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); langItems[(i - 1 + langItems.length) % langItems.length].focus(); }
      if (e.key === 'Escape' || e.key === 'Tab') { setLangMenu(false); if (e.key === 'Escape') langBtn.focus(); }
    });
  });
  document.addEventListener('click', function (e) { if (!langBox.contains(e.target)) setLangMenu(false); });

  var header = document.querySelector('.header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  // Kaydırınca header arka planı
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobil menü
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('nav-active', open);
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', t(open ? 'js.menuClose' : 'js.menuOpen'));
  }
  langListeners.push(function () { setMenu(nav.classList.contains('is-open')); });
  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); setLangMenu(false); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1100) setMenu(false);
  });

  // Çözüm sekmeleri
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function activate(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); activate(next); next.focus(); }
    });
  });

  // Kaydırınca beliren öğeler
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Özellik kartlarında imleci takip eden ışık
  document.querySelectorAll('.feature').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Demo formu: FormSubmit AJAX uç noktasına JSON olarak gönderilir
  var form = document.getElementById('demo-form');
  var note = document.getElementById('form-note');
  var submitBtn = form.querySelector('[type="submit"]');
  var interestSelect = form.querySelector('[name="interest"]');
  var subjectField = form.querySelector('[name="_subject"]');
  var langField = form.querySelector('[name="language"]');
  var formContext = document.getElementById('form-context');

  function showStatus(message, state) {
    note.textContent = message;
    note.classList.toggle('is-error', state === 'error');
    note.classList.toggle('is-pending', state === 'pending');
  }

  // Konu satırı ve değerler e-postada Türkçe kalır; ziyaretçinin dili ayrıca belirtilir
  function updateContext() {
    var interest = interestSelect.value;
    var general = interest === 'Genel bilgi';
    var topic = interestSelect.options[interestSelect.selectedIndex].text;
    formContext.textContent = general ? t('js.ctxGeneral') : t('js.ctxTopic', { topic: topic });
    subjectField.value = (general ? 'Yeni demo talebi — RubixB2' : interest + ' talebi — RubixB2') + ' [' + lang.toUpperCase() + ']';
    langField.value = lang.toUpperCase();
  }
  interestSelect.addEventListener('change', updateContext);
  langListeners.push(function () { updateContext(); showStatus('', ''); });

  function validate() {
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      var ok = input.value.trim() !== '' && (input.type !== 'email' || /^\S+@\S+\.\S+$/.test(input.value));
      input.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitBtn.disabled) return;
    if (!validate()) {
      showStatus(t('js.required'), 'error');
      return;
    }

    var fallback = t('js.fallback', { email: CONTACT_EMAIL });
    var payload = {};
    new FormData(form).forEach(function (value, key) { payload[key] = value; });
    if (payload._honey) { showStatus(fallback, 'error'); return; }
    payload._replyto = payload.email;

    var label = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = t('js.sendingBtn');
    form.setAttribute('aria-busy', 'true');
    showStatus(t('js.sending'), 'pending');

    var controller = 'AbortController' in window ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 20000);

    fetch(form.dataset.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        var msg = (r.data && r.data.message) || '';
        // FormSubmit ilk gönderimde adresin onaylanmasını ister
        if (!r.ok || String(r.data.success) !== 'true' || /activat|confirm|check.*email/i.test(msg)) {
          throw new Error(msg || 'send failed');
        }
        form.reset();
        updateContext();
        showStatus(t('js.success'), 'success');
      })
      .catch(function () { showStatus(fallback, 'error'); })
      .then(function () {
        clearTimeout(timeout);
        submitBtn.disabled = false;
        submitBtn.innerHTML = label;
        form.removeAttribute('aria-busy');
      });
  });

  // Ofis haritası: Google Maps yalnızca ziyaretçi butona basınca yüklenir (GDPR)
  var officeMap = document.getElementById('office-map');
  var officeMapBtn = document.getElementById('office-map-load');
  if (officeMap && officeMapBtn) {
    officeMapBtn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = officeMap.dataset.embed + '&hl=' + lang;
      iframe.title = 'NameTech Solutions BV – Google Maps';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      officeMap.appendChild(iframe);
      officeMap.classList.add('is-loaded');
      iframe.focus();
    });
  }

  // Hero slider
  var slider = document.getElementById('hero-slider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.slider__dot'));
    var pauseBtn = document.getElementById('slider-pause');
    var DURATION = 7000;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0, timer = null, userPaused = reduceMotion, hoverPaused = false;

    slider.style.setProperty('--slide-ms', DURATION + 'ms');

    function go(index) {
      var prev = current;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === current;
        s.classList.toggle('is-active', on);
        s.classList.toggle('is-leaving', i === prev && !on);
        s.setAttribute('aria-hidden', String(!on));
      });
      dots.forEach(function (d, i) {
        var on = i === current;
        d.classList.remove('is-active');
        d.setAttribute('aria-selected', String(on));
      });
      void dots[current].offsetWidth; // ilerleme çubuğunu yeniden başlat
      dots[current].classList.add('is-active');
      schedule();
    }

    function schedule() {
      clearTimeout(timer);
      var paused = userPaused || hoverPaused;
      slider.classList.toggle('is-paused', paused);
      if (!paused) timer = setTimeout(function () { go(current + 1); }, DURATION);
    }

    function updatePauseLabel() {
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', t(userPaused ? 'js.play' : 'js.pause'));
    }
    langListeners.push(updatePauseLabel);

    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    slider.querySelectorAll('.slider__arrow').forEach(function (btn) {
      btn.addEventListener('click', function () { go(current + Number(btn.dataset.dir)); });
    });

    pauseBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      updatePauseLabel();
      if (userPaused) schedule(); else go(current);
    });

    slider.addEventListener('mouseenter', function () { hoverPaused = true; schedule(); });
    slider.addEventListener('mouseleave', function () { hoverPaused = false; if (!userPaused) go(current); });

    slider.addEventListener('keydown', function (e) {
      if (e.target.closest('.slider__dot, .slider__arrow')) {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
      }
    });

    // Dokunmatik kaydırma
    var startX = null, startY = null;
    slider.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });

    // Sekme görünmezken durdur
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimeout(timer); else schedule();
    });

    go(0);
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  // Açılış dilini uygula (tarayıcı dili veya kayıtlı tercih)
  applyLang(lang, false);
})();
