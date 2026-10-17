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

  // Ana sayfa (/xx/) ve SSS sayfası (/xx/faq/) aynı şablondan üretilir
  var PAGES = [
    { path: '', root: '../' },
    { path: 'faq/', root: '../../' },
    { path: 'field-route-management/', root: '../../', product: 'field-route-management', productName: 'RubixB2 Saha ve Rota Yönetim Sistemi', interest: 'Rut Yönetim Sistemi' },
    { path: 'mobile-sales/', root: '../../', product: 'mobile-sales', prefix: 'RubixB2 Plus', interest: 'Mobil Plasiyer Satış Sistemi' },
    { path: 'warehouse/', root: '../../', product: 'warehouse', prefix: 'RubixB2 WMS', interest: 'Mobil Depo ve Stok Yönetim Sistemi' }
  ];
  var PRODUCT_HTML = {};
  for (var pp = 0; pp < PAGES.length; pp++) {
    if (PAGES[pp].product) PRODUCT_HTML[PAGES[pp].product] = await (await fetch('products/' + PAGES[pp].product + '.html?' + Date.now())).text();
  }
  var PDICT = window.PRODUCT_I18N || {};

  for (var li = 0; li < LANGS.length; li++) {
    for (var pgi = 0; pgi < PAGES.length; pgi++) {
    var PG = PAGES[pgi];
    var isFaq = PG.path === 'faq/';
    var isProduct = !!PG.product;
    var isSub = PG.path !== '';
    var lang = LANGS[li];
    var PD = isProduct ? (PDICT[PG.product] || {}) : {};
    var D = Object.assign({}, DICT[lang] || {}, PD[lang] || {});
    var doc = new DOMParser().parseFromString(template, 'text/html');
    var pageUrl = BASE + lang + '/' + PG.path;
    var val = function (key, orig) { return lang === 'tr' ? orig : (D[key] != null ? D[key] : orig); };
    var meta = function (key) { return D[key] || (PD.tr && PD.tr[key]) || DICT.tr[key]; };

    // 0) Sayfaya göre bölümler: ana sayfada SSS yok; SSS sayfasında yalnızca SSS + iletişim;
    //    ürün sayfasında ürün bölümleri + iletişim
    if (isFaq) {
      doc.querySelectorAll('main > section').forEach(function (s) {
        if (s.id !== 'sss' && s.id !== 'iletisim') s.remove();
      });
    } else if (isProduct) {
      var contact = doc.getElementById('iletisim');
      doc.querySelectorAll('main > section').forEach(function (s) { if (s !== contact) s.remove(); });
      var pdoc = new DOMParser().parseFromString(PRODUCT_HTML[PG.product], 'text/html');
      pdoc.querySelectorAll('main > section').forEach(function (s) {
        contact.parentNode.insertBefore(doc.importNode(s, true), contact);
      });
      // İletişim bölümünü ürüne göre uyarla (çalışma anında değişmesin diye çeviri anahtarı kaldırılır)
      var ctaH = contact.querySelector('.cta__text h2'), ctaP = contact.querySelector('.cta__text > p');
      ctaH.innerHTML = meta('p.ctaTitle'); ctaH.removeAttribute('data-i18n');
      ctaP.textContent = meta('p.ctaLead'); ctaP.removeAttribute('data-i18n');
      var opt = contact.querySelector('select[name="interest"] option[value="' + PG.interest + '"]');
      if (opt) opt.setAttribute('selected', '');
    } else {
      var faqSec = doc.getElementById('sss');
      if (faqSec) faqSec.remove();
    }

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
    var title = isFaq ? meta('meta.faqTitle') : meta('meta.title');
    var desc = isFaq ? meta('meta.faqDesc') : meta('meta.desc');
    if (isProduct) { title = (PD[lang] && PD[lang]['meta.title']) || PD.tr['meta.title']; desc = (PD[lang] && PD[lang]['meta.desc']) || PD.tr['meta.desc']; }
    doc.documentElement.setAttribute('lang', HREFLANG[lang]);
    doc.documentElement.setAttribute('data-page-lang', lang);
    doc.documentElement.setAttribute('data-page-path', PG.path);
    doc.documentElement.setAttribute('data-root', PG.root);
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
    LANGS.forEach(function (l) { add(el(doc, 'link', { rel: 'alternate', hreflang: HREFLANG[l], href: BASE + l + '/' + PG.path })); });
    add(el(doc, 'link', { rel: 'alternate', hreflang: 'x-default', href: isSub ? BASE + 'en/' + PG.path : BASE }));
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
    var graph = [
      {
        '@type': 'Organization', '@id': BASE + '#organization',
        name: 'NameTech Solutions BV', legalName: 'NameTech Solutions BV', url: BASE, email: 'info@nametech.be',
        vatID: 'BE1032351303',
        identifier: { '@type': 'PropertyValue', propertyID: 'KBO/BCE', value: '1032.351.303' },
        logo: BASE + 'assets/img/nametech-logo.png',
        address: { '@type': 'PostalAddress', streetAddress: 'Excelsiorlaan 44', postalCode: '1930', addressLocality: 'Zaventem', addressCountry: 'BE' }
      },
      {
        '@type': 'WebSite', '@id': BASE + '#website', url: BASE, name: 'RubixB2',
        publisher: { '@id': BASE + '#organization' }, inLanguage: LANGS.map(function (l) { return HREFLANG[l]; })
      }
    ];
    if (isFaq) {
      var faqItems = [];
      doc.querySelectorAll('#sss details').forEach(function (d) {
        faqItems.push({
          '@type': 'Question', name: d.querySelector('summary').textContent.trim(),
          acceptedAnswer: { '@type': 'Answer', text: d.querySelector('p').textContent.trim() }
        });
      });
      graph.push({
        '@type': 'FAQPage', '@id': pageUrl + '#webpage', url: pageUrl, name: title, description: desc,
        inLanguage: HREFLANG[lang], isPartOf: { '@id': BASE + '#website' }, mainEntity: faqItems
      });
      graph.push({
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'RubixB2', item: BASE + lang + '/' },
          { '@type': 'ListItem', position: 2, name: val('faq.title', doc.querySelector('#sss h2, #sss h1').textContent), item: pageUrl }
        ]
      });
    } else if (isProduct) {
      var prodName = (PG.prefix || 'RubixB2') + ' ' + doc.querySelector('.p-hero h1').textContent.replace(/­/g, '').trim();
      graph.push({
        '@type': 'WebPage', '@id': pageUrl + '#webpage', url: pageUrl, name: title, description: desc,
        inLanguage: HREFLANG[lang], isPartOf: { '@id': BASE + '#website' }, about: { '@id': BASE + '#' + PG.product },
        primaryImageOfPage: OG_IMAGE
      });
      graph.push({
        '@type': 'SoftwareApplication', '@id': BASE + '#' + PG.product, name: prodName,
        applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: desc, url: pageUrl,
        image: BASE + 'assets/img/rubixb2-logo-stacked.png', publisher: { '@id': BASE + '#organization' },
        isPartOf: { '@id': BASE + '#software' }
      });
      graph.push({
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'RubixB2', item: BASE + lang + '/' },
          { '@type': 'ListItem', position: 2, name: val('nav.solutions', 'Çözümler'), item: BASE + lang + '/#cozumler' },
          { '@type': 'ListItem', position: 3, name: prodName, item: pageUrl }
        ]
      });
    } else {
      graph.push({
        '@type': 'WebPage', '@id': pageUrl + '#webpage', url: pageUrl, name: title, description: desc,
        inLanguage: HREFLANG[lang], isPartOf: { '@id': BASE + '#website' }, about: { '@id': BASE + '#software' },
        primaryImageOfPage: OG_IMAGE
      });
      graph.push({
        '@type': 'SoftwareApplication', '@id': BASE + '#software', name: 'RubixB2',
        applicationCategory: 'BusinessApplication', operatingSystem: 'Web',
        description: desc, url: pageUrl, image: BASE + 'assets/img/rubixb2-logo-stacked.png',
        publisher: { '@id': BASE + '#organization' }
      });
    }
    var ldScript = el(doc, 'script', { type: 'application/ld+json' });
    ldScript.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    add(ldScript);

    // 6) SSS sayfasına özel düzen: başlık H1 olur, sayfa içi bağlantılar ana sayfaya gider
    if (isFaq) {
      var faqHead = doc.querySelector('#sss .section__head h2');
      var h1 = doc.createElement('h1');
      h1.innerHTML = faqHead.innerHTML;
      Array.prototype.forEach.call(faqHead.attributes, function (a) { h1.setAttribute(a.name, a.value); });
      faqHead.replaceWith(h1);
      doc.getElementById('sss').classList.add('faq-page');
    }
    // Alt sayfalarda: sayfada olmayan bölümlere giden bağlantılar ana sayfaya, diğer sayfa bağlantıları bir üst klasöre
    if (isSub) {
      doc.querySelectorAll('a[href^="#"]').forEach(function (a) {
        var h = a.getAttribute('href');
        if (h === '#top') { a.setAttribute('href', '../'); return; }
        if (!doc.getElementById(h.slice(1))) a.setAttribute('href', '../' + h);
      });
      // Site içi sayfa bağlantıları (faq/, ürün sayfaları, privacy/, cookies/)
      var SITE_PATHS = PAGES.map(function (x) { return x.path; }).filter(Boolean).concat(['privacy/', 'cookies/']);
      doc.querySelectorAll('a[href]').forEach(function (a) {
        var h = a.getAttribute('href');
        if (SITE_PATHS.indexOf(h) === -1) return;
        if (h === PG.path) { a.setAttribute('href', './'); a.setAttribute('aria-current', 'page'); }
        else a.setAttribute('href', '../' + h);
      });
    }

    // 7) Yolları sayfa derinliğine göre düzelt
    doc.querySelectorAll('[src^="assets/"], [href^="assets/"]').forEach(function (n) {
      ['src', 'href'].forEach(function (a) {
        var v = n.getAttribute(a);
        if (v && v.indexOf('assets/') === 0) n.setAttribute(a, PG.root + v);
      });
    });
    doc.querySelectorAll('.footer__langs a').forEach(function (a) {
      var l = a.getAttribute('href').replace('/', '');
      a.setAttribute('href', PG.root + l + '/' + PG.path);
      if (l === lang) a.setAttribute('aria-current', 'page');
    });
    doc.querySelector('.footer__langs').setAttribute('aria-label', val('a.lang', 'Diller'));

    await save(lang + '/' + PG.path + 'index.html', '<!doctype html>\n' + doc.documentElement.outerHTML + '\n');
    }
  }

  // Yasal sayfalar: /xx/privacy/ ve /xx/cookies/
  var LEGAL = window.LEGAL;
  var tplDoc = new DOMParser().parseFromString(template, 'text/html');
  var sprite = tplDoc.body.querySelector('svg').outerHTML; // bayrak sembolleri
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var cssVer = (template.match(/style\.css\?v=([\w]+)/) || [])[1] || '1';
  var FLAG_LABEL = { tr: 'Türkçe', en: 'English', fr: 'Français', nl: 'Nederlands (Vlaams)', de: 'Deutsch', es: 'Español' };

  for (var pi = 0; pi < LANGS.length; pi++) {
    var pl = LANGS[pi];
    var L = LEGAL[pl];
    for (var kind of ['privacy', 'cookies']) {
      var P = L[kind];
      var url = BASE + pl + '/' + kind + '/';
      var head = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<title>' + esc(P.title) + ' | RubixB2 — NameTech Solutions BV</title>',
        '<meta name="description" content="' + esc(P.desc) + '">',
        '<meta name="theme-color" content="#f5f2ec">',
        '<meta name="robots" content="index, follow">',
        '<link rel="canonical" href="' + url + '">'
      ].concat(LANGS.map(function (l) { return '<link rel="alternate" hreflang="' + HREFLANG[l] + '" href="' + BASE + l + '/' + kind + '/">'; }))
       .concat([
        '<link rel="alternate" hreflang="x-default" href="' + BASE + 'en/' + kind + '/">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="RubixB2">',
        '<meta property="og:title" content="' + esc(P.title) + ' | RubixB2">',
        '<meta property="og:description" content="' + esc(P.desc) + '">',
        '<meta property="og:url" content="' + url + '">',
        '<meta property="og:image" content="' + OG_IMAGE + '">',
        '<meta property="og:locale" content="' + OG_LOCALE[pl] + '">',
        '<link rel="icon" type="image/png" href="../../assets/img/favicon.png">',
        '<link rel="preload" href="../../assets/fonts/plusjakartasans-latin.woff2" as="font" type="font/woff2" crossorigin>',
        '<link rel="stylesheet" href="../../assets/css/style.css?v=' + cssVer + '">',
        '<script type="application/ld+json">' + JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage', url: url, name: P.title, description: P.desc,
          inLanguage: HREFLANG[pl], isPartOf: { '@id': BASE + '#website' }, publisher: { '@id': BASE + '#organization' }
        }) + '</script>'
      ]);

      var langLinks = LANGS.map(function (l) {
        return '<a href="../../' + l + '/' + kind + '/" hreflang="' + HREFLANG[l] + '" lang="' + l + '"' + (l === pl ? ' aria-current="page"' : '') +
          '><svg class="flag" aria-hidden="true"><use href="#flag-' + l + '"/></svg>' + FLAG_LABEL[l] + '</a>';
      }).join('\n      ');
      var other = kind === 'privacy' ? 'cookies' : 'privacy';

      var html = '<!doctype html>\n<html lang="' + HREFLANG[pl] + '" data-page-lang="' + pl + '">\n<head>\n  ' + head.join('\n  ') + '\n</head>\n<body class="legal-page">\n' +
        '  ' + sprite + '\n' +
        '  <header class="header is-scrolled legal-header">\n    <div class="container header__inner">\n' +
        '      <a href="../" class="logo" aria-label="RubixB2"><img src="../../assets/img/rubixb2-icon.png" alt="" width="256" height="290"><span class="logo__text">Rubix<b>B2</b></span></a>\n' +
        '      <a href="../" class="btn btn--ghost btn--sm">← ' + esc(L.ui.back) + '</a>\n' +
        '    </div>\n  </header>\n' +
        '  <main class="section legal">\n    <div class="container container--narrow">\n' +
        '      <h1>' + esc(P.title) + '</h1>\n      <p class="legal__updated">' + esc(L.ui.updated) + '</p>\n' +
        '      <article class="legal__body">' + P.body + '\n      </article>\n' +
        '      <p class="legal__other"><a href="../' + other + '/">' + esc(L.ui[other]) + ' →</a></p>\n' +
        '    </div>\n  </main>\n' +
        '  <footer class="footer">\n' +
        '    <nav class="container footer__langs" aria-label="' + esc(L.ui.langs) + '">\n      ' + langLinks + '\n    </nav>\n' +
        '    <div class="container footer__bottom">\n' +
        '      <span>© ' + new Date().getFullYear() + ' NameTech Solutions BV · Excelsiorlaan 44, 1930 Zaventem, Belgium · BE1032.351.303 · <a href="mailto:info@nametech.be">info@nametech.be</a></span>\n' +
        '      <span class="footer__legal"><a href="../privacy/">' + esc(L.ui.privacy) + '</a> · <a href="../cookies/">' + esc(L.ui.cookies) + '</a></span>\n' +
        '    </div>\n  </footer>\n' +
        '  <script>document.querySelectorAll(".footer__langs a").forEach(function(a){a.addEventListener("click",function(){try{localStorage.setItem("rubix-lang",a.getAttribute("lang"))}catch(e){}})});</script>\n' +
        '</body>\n</html>\n';
      await save(pl + '/' + kind + '/index.html', html);
    }
  }

  // Site haritası (hreflang alternatifleriyle)
  var today = new Date().toISOString().slice(0, 10);
  var sitemapEntry = function (path, xdefault) {
    var alts = LANGS.map(function (l) { return '    <xhtml:link rel="alternate" hreflang="' + HREFLANG[l] + '" href="' + BASE + l + '/' + path + '"/>'; })
      .concat(['    <xhtml:link rel="alternate" hreflang="x-default" href="' + xdefault + '"/>']).join('\n');
    return LANGS.map(function (l) {
      return '  <url>\n    <loc>' + BASE + l + '/' + path + '</loc>\n    <lastmod>' + today + '</lastmod>\n' + alts + '\n  </url>';
    }).join('\n');
  };
  var urls = [sitemapEntry('', BASE), sitemapEntry('field-route-management/', BASE + 'en/field-route-management/'), sitemapEntry('mobile-sales/', BASE + 'en/mobile-sales/'), sitemapEntry('warehouse/', BASE + 'en/warehouse/'), sitemapEntry('faq/', BASE + 'en/faq/'), sitemapEntry('privacy/', BASE + 'en/privacy/'), sitemapEntry('cookies/', BASE + 'en/cookies/')].join('\n');
  await save('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls + '\n</urlset>\n');

  log('\nBuild tamamlandı.');
  document.title = 'BUILD OK';
})().catch(function (e) {
  document.getElementById('log').textContent += '\nHATA: ' + e.message;
  document.title = 'BUILD FAILED';
});
