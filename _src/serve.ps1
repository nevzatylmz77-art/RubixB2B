# RubixB2 yerel geliştirme sunucusu
# Siteyi http://localhost:8765/ adresinde sunar ve build aracının ürettiği
# dil sayfalarını (POST /__save) yalnızca izin verilen yollara kaydeder.
param([string]$Root = (Split-Path $PSScriptRoot -Parent), [int]$Port = 8765)

$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.ico' = 'image/x-icon'
  '.xml' = 'application/xml; charset=utf-8'; '.txt' = 'text/plain; charset=utf-8'
}
$allowedSave = '^((tr|en|fr|nl|de|es)/index\.html|sitemap\.xml)$'
$Root = [IO.Path]::GetFullPath($Root)

$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $Root on http://localhost:$Port/"

while ($l.IsListening) {
  $ctx = $l.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  try {
    if ($req.HttpMethod -eq 'POST' -and $req.Url.AbsolutePath -eq '/__save') {
      $rel = $req.QueryString['path']
      if ($rel -notmatch $allowedSave) { $res.StatusCode = 403; continue }
      $reader = New-Object IO.StreamReader($req.InputStream, [Text.Encoding]::UTF8)
      $body = $reader.ReadToEnd(); $reader.Close()
      $dest = Join-Path $Root $rel
      New-Item -ItemType Directory -Force (Split-Path $dest -Parent) | Out-Null
      [IO.File]::WriteAllText($dest, $body, (New-Object Text.UTF8Encoding $false))
      $res.StatusCode = 200
      continue
    }
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
    if ($path -eq '' -or $path.EndsWith('/')) { $path += 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $Root $path))
    if ($file.StartsWith($Root) -and (Test-Path $file -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($file)
      $ext = [IO.Path]::GetExtension($file).ToLower()
      if ($types.ContainsKey($ext)) { $res.ContentType = $types[$ext] }
      $res.Headers.Add('Cache-Control', 'no-store')
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $res.StatusCode = 404 }
  } finally { $res.Close() }
}
