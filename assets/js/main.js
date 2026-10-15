(function () {
  'use strict';

  // Formun gönderileceği e-posta adresi
  var CONTACT_EMAIL = 'info@nametech.be';

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
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  }
  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 920) setMenu(false);
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

  // Demo formu: sunucu olmadığı için e-posta istemcisini açar
  var form = document.getElementById('demo-form');
  var note = document.getElementById('form-note');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      var ok = input.value.trim() !== '' && (input.type !== 'email' || /^\S+@\S+\.\S+$/.test(input.value));
      input.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      note.textContent = 'Lütfen zorunlu alanları doğru doldurun.';
      note.classList.add('is-error');
      return;
    }
    var d = new FormData(form);
    var body = [
      'Ad Soyad: ' + d.get('name'),
      'Firma: ' + d.get('company'),
      'E-posta: ' + d.get('email'),
      'Telefon: ' + d.get('phone'),
      'Ekip büyüklüğü: ' + d.get('team'),
      '',
      d.get('message')
    ].join('\n');
    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent('RubixB2B Demo Talebi - ' + d.get('company')) +
      '&body=' + encodeURIComponent(body);
    note.classList.remove('is-error');
    note.textContent = 'Teşekkürler! E-posta uygulamanız açılıyor.';
  });

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

    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    slider.querySelectorAll('.slider__arrow').forEach(function (btn) {
      btn.addEventListener('click', function () { go(current + Number(btn.dataset.dir)); });
    });

    pauseBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Otomatik geçişi başlat' : 'Otomatik geçişi durdur');
      if (userPaused) schedule(); else go(current);
    });
    if (userPaused) {
      pauseBtn.setAttribute('aria-pressed', 'true');
      pauseBtn.setAttribute('aria-label', 'Otomatik geçişi başlat');
    }

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
})();
