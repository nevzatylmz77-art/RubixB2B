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

  // Demo formu: FormSubmit AJAX uç noktasına JSON olarak gönderilir
  var form = document.getElementById('demo-form');
  var note = document.getElementById('form-note');
  var submitBtn = form.querySelector('[type="submit"]');
  var interestSelect = form.querySelector('[name="interest"]');
  var subjectField = form.querySelector('[name="_subject"]');
  var formContext = document.getElementById('form-context');
  var FALLBACK_MSG = 'Mesajınız gönderilemedi. Lütfen doğrudan ' + CONTACT_EMAIL + ' adresine yazın.';

  function showStatus(message, state) {
    note.textContent = message;
    note.classList.toggle('is-error', state === 'error');
    note.classList.toggle('is-pending', state === 'pending');
  }

  function updateContext() {
    var interest = interestSelect.value;
    var general = interest === 'Genel bilgi';
    formContext.textContent = general
      ? 'Ekibimiz size en uygun çözümü bulmanıza yardımcı olur.'
      : interest + ' ihtiyaçlarınızdan bahsedin, sizi doğru ekiple buluşturalım.';
    subjectField.value = general ? 'Yeni demo talebi — RubixB2' : interest + ' talebi — RubixB2';
  }
  interestSelect.addEventListener('change', updateContext);

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
      showStatus('Lütfen zorunlu (*) alanları doğru doldurun.', 'error');
      return;
    }

    var payload = {};
    new FormData(form).forEach(function (value, key) { payload[key] = value; });
    if (payload._honey) { showStatus(FALLBACK_MSG, 'error'); return; }
    payload._replyto = payload.email;

    var label = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Gönderiliyor…';
    form.setAttribute('aria-busy', 'true');
    showStatus('Mesajınız gönderiliyor…', 'pending');

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
        showStatus('Teşekkürler! Mesajınız bize ulaştı, en kısa sürede dönüş yapacağız.', 'success');
      })
      .catch(function () { showStatus(FALLBACK_MSG, 'error'); })
      .then(function () {
        clearTimeout(timeout);
        submitBtn.disabled = false;
        submitBtn.textContent = label;
        form.removeAttribute('aria-busy');
      });
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
