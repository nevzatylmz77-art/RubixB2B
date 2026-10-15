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

  document.getElementById('year').textContent = new Date().getFullYear();
})();
