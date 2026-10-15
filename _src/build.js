/* =========================================================
   RubixB2 — Statik dil sayfalarını üreten build aracı
   _src/index.html (Türkçe şablon) + assets/js/i18n.js
     → tr/ en/ fr/ nl/ de/ es/ index.html, sitemap.xml
   Çalıştırma: yerel sunucuyu (_src/serve.ps1) başlatıp
   http://localhost:8765/_src/build.html adresini açın.
   Alan adı değişirse yalnızca BASE değerini güncelleyip yeniden build alın.
   ========================================================= */
(async function () {
  'use strict';

  var BASE = 'https://nevzatylmz77-art.github.io/RubixB2B/';
  var LANGS = ['tr', 'en', 'fr', 'nl', 'de', 'es'];
  var HREFLANG = { tr: 'tr', en: 'en', fr: 'fr', nl: 'nl-BE', de: 'de', es: 'es' };
  var OG_LOCALE = { tr: 'tr_TR', en: 'en_GB', fr: 'fr_BE', nl: 'nl_BE', de: 'de_DE', es: 'es_ES' };
  var ODOO_IMG = '<img class="odoo-logo" src="assets/img/odoo-logo.svg" alt="Odoo" width="621" height="196">';
  var OG_IMAGE = BASE + 'assets/img/og-image.png';

  var out = document.getElementById('log');
  function log(m) { out.textContent += m + '\n'; }

  async function save(path, content) {
    var res = await fetch('/__save?path=' + encodeURIComponent(path), { method: 'POST', body: content });
    if (!res.ok) throw new Error(path + ' kaydedilemedi: ' + res.status);
    log('✓ ' + path + ' (' + content.length + ' bayt)');
  }

  function el(doc, tag, attrs) {
    var e = doc.createElement(tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  var template = await (await fetch('index.html?' + Date.now())).text();
  var DICT = window.I18N;

  for (var li = 0; li < LANGS.length; li++) {
    var lang = LANGS[li];
    var D = DICT[lang] || {};
    var doc = new DOMParser().parseFromString(template, 'text/html');
    var pageUrl = BASE + lang + '/';
    var val = function (key, orig) { return lang === 'tr' ? orig : (D[key] != null ? D[key] : orig); };
    var meta = function (key) { return D[key] || DICT.tr[key]; };

    // 1) Metinler ve öznitelikler
    doc.querySelectorAll('[data-i18n]').forEach(function (n) {
      n.innerHTML = val(n.getAttribute('data-i18n'), n.innerHTML).replace(/\{odoo\}/g, ODOO_IMG);
    });
    doc.querySelectorAll('[data-i18n-attr]').forEach(function (n) {
      n.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length !== 2) return;
        var attr = p[0].trim(), key = p[1].trim();
        var v = val(key, n.getAttribute(attr) || '').replace(/\{odoo\}/g, 'Odoo').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
        n.setAttribute(attr, v);
      });
    });

    // 2) Dil, başlık, açıklama
    var title = meta('meta.title'), desc = meta('meta.desc');
    doc.documentElement.setAttribute('lang', HREFLANG[lang]);
    doc.documentElement.setAttribute('data-page-lang', lang);
    doc.title = title;
    doc.querySelector('meta[name="description"]').setAttribute('content', desc);
    doc.querySelector('[name="language"]').setAttribute('value', lang.toUpperCase());

    // 3) Dil algılama betiği yerine sabit dil (sayfa gizleme yok → daha hızlı ilk görüntü)
    doc.head.querySelectorAll('script').forEach(function (s) {
      if (/__LANG/.test(s.textContent)) s.textContent = "window.__LANG = '" + lang + "';";
    });

    // 4) SEO etiketleri
    var anchor = doc.querySelector('meta[name="author"]');
    var add = function (node) { anchor.parentNode.insertBefore(node, anchor.nextSibling); anchor = node; };
    add(el(doc, 'meta', { name: 'robots', content: 'index, follow, max-image-preview:large' }));
    add(el(doc, 'link', { rel: 'canonical', href: pageUrl }));
    LANGS.forEach(function (l) { add(el(doc, 'link', { rel: 'alternate', hreflang: HREFLANG[l], href: BASE + l + '/' })); });
    add(el(doc, 'link', { rel: 'alternate', hreflang: 'x-default', href: BASE }));
    add(el(doc, 'meta', { property: 'og:type', content: 'website' }));
    add(el(doc, 'meta', { property: 'og:site_name', content: 'RubixB2' }));
    add(el(doc, 'meta', { property: 'og:title', content: title }));
    add(el(doc, 'meta', { property: 'og:description', content: desc }));
    add(el(doc, 'meta', { property: 'og:url', content: pageUrl }));
    add(el(doc, 'meta', { property: 'og:image', content: OG_IMAGE }));
    add(el(doc, 'meta', { property: 'og:image:width', content: '1200' }));
    add(el(doc, 'meta', { property: 'og:image:height', content: '630' }));
    add(el(doc, 'meta', { property: 'og:image:alt', content: 'RubixB2 — NameTech Solutions BV' }));
    add(el(doc, 'meta', { property: 'og:locale', content: OG_LOCALE[lang] }));
    LANGS.filter(function (l) { return l !== lang; }).forEach(function (l) {
      add(el(doc, 'meta', { property: 'og:locale:alternate', content: OG_LOCALE[l] }));
    });
    add(el(doc, 'meta', { name: 'twitter:card', content: 'summary_large_image' }));
    add(el(doc, 'meta', { name: 'twitter:title', content: title }));
    add(el(doc, 'meta', { name: 'twitter:description', content: desc }));
    add(el(doc, 'meta', { name: 'twitter:image', content: OG_IMAGE }));

    // 5) Yapılandırılmış veri (schema.org JSON-LD)
    var ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization', '@id': BASE + '#organization',
          name: 'NameTech Solutions BV', url: BASE, email: 'info@nametech.be',
          logo: BASE + 'assets/img/nametech-logo.png',
          address: { '@type': 'PostalAddress', streetAddress: 'Excelsiorlaan 44', postalCode: '1930', addressLocality: 'Zaventem', addressCountry: 'BE' }
        },
        {
          '@type': 'WebSite', '@id': BASE + '#website', url: BASE, name: 'RubixB2',
          publisher: { '@id': BASE + '#organization' }, inLanguage: LANGS.map(function (l) { return HREFLANG[l]; })
        },
        {
          '@type': 'WebPage', '@id': pageUrl + '#webpage', url: pageUrl, name: title, description: desc,
          inLanguage: HREFLANG[lang], isPartOf: { '@id': BASE + '#website' }, about: { '@id': BASE + '#software' },
          primaryImageOfPage: OG_IMAGE
        },
        {
          '@type': 'SoftwareApplication', '@id': BASE + '#software', name: 'RubixB2',
          applicationCategory: 'BusinessApplication', operatingSystem: 'Web',
          description: desc, url: pageUrl, image: BASE + 'assets/img/rubixb2-logo-stacked.png',
          publisher: { '@id': BASE + '#organization' }
        }
      ]
    };
    var ldScript = el(doc, 'script', { type: 'application/ld+json' });
    ldScript.textContent = JSON.stringify(ld);
    add(ldScript);

    // 6) Yolları bir üst klasöre göre düzelt (sayfa /xx/ altında)
    doc.querySelectorAll('[src^="assets/"], [href^="assets/"]').forEach(function (n) {
      ['src', 'href'].forEach(function (a) {
        var v = n.getAttribute(a);
        if (v && v.indexOf('assets/') === 0) n.setAttribute(a, '../' + v);
      });
    });
    doc.querySelectorAll('.footer__langs a').forEach(function (a) {
      var l = a.getAttribute('href').replace('/', '');
      a.setAttribute('href', '../' + l + '/');
      if (l === lang) a.setAttribute('aria-current', 'page');
    });
    doc.querySelector('.footer__langs').setAttribute('aria-label', val('a.lang', 'Diller'));

    await save(lang + '/index.html', '<!doctype html>\n' + doc.documentElement.outerHTML + '\n');
  }

  // Site haritası (hreflang alternatifleriyle)
  var today = new Date().toISOString().slice(0, 10);
  var alts = LANGS.map(function (l) { return '    <xhtml:link rel="alternate" hreflang="' + HREFLANG[l] + '" href="' + BASE + l + '/"/>'; })
    .concat(['    <xhtml:link rel="alternate" hreflang="x-default" href="' + BASE + '"/>']).join('\n');
  var urls = LANGS.map(function (l) {
    return '  <url>\n    <loc>' + BASE + l + '/</loc>\n    <lastmod>' + today + '</lastmod>\n' + alts + '\n  </url>';
  }).join('\n');
  await save('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls + '\n</urlset>\n');

  log('\nBuild tamamlandı.');
  document.title = 'BUILD OK';
})().catch(function (e) {
  document.getElementById('log').textContent += '\nHATA: ' + e.message;
  document.title = 'BUILD FAILED';
});
