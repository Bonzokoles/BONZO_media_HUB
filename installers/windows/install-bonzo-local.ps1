param(
    [string]$BasePath = "$env:USERPROFILE\\BONZO_media_HUB_Local"
)

$ErrorActionPreference = 'Stop'

Write-Host "== BONZO_media_HUB Local Installer ==" -ForegroundColor Cyan
Write-Host "Tworzenie struktury folderów w: $BasePath" -ForegroundColor Yellow

$folders = @(
    "Music\\Albums",
    "Music\\Artists",
    "Music\\Playlists",
    "Music\\Downloads",
    "Movies\\Library",
    "Movies\\Watched",
    "Movies\\ToWatch",
    "Movies\\Downloads"
)

foreach ($folder in $folders) {
    $target = Join-Path $BasePath $folder
    New-Item -ItemType Directory -Force -Path $target | Out-Null
}

$configDir = Join-Path $env:APPDATA "BONZO_media_HUB"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null

$configPath = Join-Path $configDir "local-media-config.json"
$config = [ordered]@{
    createdAt   = (Get-Date).ToString("o")
    platform    = "windows"
    basePath    = $BasePath
    musicFolder = (Join-Path $BasePath "Music")
    videoFolder = (Join-Path $BasePath "Movies")
    notes       = "Konfiguracja lokalnych folderów BONZO_media_HUB"
}

$config | ConvertTo-Json -Depth 5 | Set-Content -Path $configPath -Encoding UTF8

Write-Host "✅ Foldery utworzone" -ForegroundColor Green
Write-Host "✅ Konfiguracja zapisana: $configPath" -ForegroundColor Green
Write-Host "Możesz teraz uruchomić BONZO_media_HUB i użyć [ADD_FOLDER] w AUDIO/VIDEO." -ForegroundColor Cyan
