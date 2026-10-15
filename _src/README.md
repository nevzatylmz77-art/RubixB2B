# RubixB2 sitesi — kaynak ve build

Bu klasör (`_src/`) yayınlanmaz; GitHub Pages (Jekyll) `_` ile başlayan klasörleri atlar.

- `index.html` — Türkçe ana şablon. Metin değişiklikleri burada yapılır.
- `../assets/js/i18n.js` — EN, FR, NL, DE, ES çevirileri.
- `build.js` / `build.html` — şablon + çevirilerden `tr/ en/ fr/ nl/ de/ es/` sayfalarını ve `sitemap.xml` dosyasını üretir.
- `serve.ps1` — yerel sunucu; build çıktısını kaydetmeye de izin verir.

## Değişiklikten sonra

1. Sunucuyu başlatın: `powershell -ExecutionPolicy Bypass -File _src/serve.ps1`
2. Tarayıcıda açın: `http://localhost:8765/_src/build.html` → "Build tamamlandı" yazmalı.
3. CSS/JS değiştiyse `_src/index.html` içindeki `?v=` sürümünü artırın ve tekrar build alın.
4. Değişiklikleri commit edip gönderin.

Alan adı değişirse `build.js` içindeki `BASE`, `robots.txt` ve kök `index.html` içindeki adresleri güncelleyin.
