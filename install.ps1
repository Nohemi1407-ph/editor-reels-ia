# =============================================================================
#  editor-reels-ia — instalador para Windows (PowerShell). Menos probado que install.sh:
#  si puedes, usa WSL (Ubuntu) y corre install.sh ahí.
#
#  Uso:  powershell -ExecutionPolicy Bypass -File install.ps1  [-ConWinget] [-SinNpm] [-SinSetup]
#   -ConWinget  instala con winget lo que falte (git, ffmpeg, Node LTS, Python 3.12)
# =============================================================================
param([switch]$ConWinget, [switch]$SinNpm, [switch]$SinSetup)
$ErrorActionPreference = 'Continue'

$Repo   = Split-Path -Parent $MyInvocation.MyCommand.Path
$Skills = Join-Path $env:USERPROFILE '.claude\skills'
$VE     = Join-Path $Skills 'video-edit'
$VP     = Join-Path $Skills 'video-pizarra'
$VEUrl  = 'https://github.com/tenfoldmarc/video-edit-skill'
$VPUrl  = 'https://github.com/santmun/video-pizarra'
$VECommit = '410c46eeb9d19f173650697bd581745235363038'
$VPCommit = 'dc6adc4198027f26c60f5980c956e0a678e05aed'
$Falta = $false

function Ok($m)   { Write-Host "  OK  $m" -ForegroundColor Green }
function Warn($m) { Write-Host "  !   $m" -ForegroundColor Yellow }
function Step($m) { Write-Host "`n$m" -ForegroundColor White }
function Have($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Need($name, $wingetId) {
  if ($ConWinget -and (Have 'winget')) { winget install --id $wingetId -e; Warn "Instalado ${name}: cierra y abre PowerShell y vuelve a correr el instalador"; }
  else { Warn "Falta $name. Instálalo con:  winget install --id $wingetId -e   (luego cierra y abre PowerShell)" }
  $script:Falta = $true
}

Step '1/6  Revisando programas'
if (Have 'git') { Ok 'git' } else { Need 'git' 'Git.Git' }
if ((Have 'ffmpeg') -and (Have 'ffprobe')) { Ok 'ffmpeg' } else { Need 'ffmpeg' 'Gyan.FFmpeg' }
$NodeOk = $false
if (Have 'node') {
  $nv = [int]((node -v).TrimStart('v').Split('.')[0])
  if ($nv -ge 22) { Ok "Node $(node -v)"; $NodeOk = $true } else { Need 'Node 22+' 'OpenJS.NodeJS.LTS' }
} else { Need 'Node 22+' 'OpenJS.NodeJS.LTS' }
$Py = $null
foreach ($c in @('python', 'py')) {
  if (Have $c) {
    & $c -c "import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)" 2>$null
    if ($LASTEXITCODE -eq 0) { $Py = $c; break }
  }
}
if ($Py) { Ok "Python ($Py)" } else { Need 'Python 3.10+' 'Python.Python.3.12' }
if (-not (Have 'git') -or -not $Py) { Write-Host "`nInstala lo que falta y vuelve a correr el instalador." -ForegroundColor Red; exit 1 }

Step '2/6  Skills de terceros'
New-Item -ItemType Directory -Force -Path $Skills | Out-Null
if (Test-Path (Join-Path $VE '.git')) { Ok 'video-edit ya estaba' }
else {
  git clone --quiet $VEUrl $VE; if ($LASTEXITCODE -ne 0) { Write-Host "No pude clonar $VEUrl" -ForegroundColor Red; exit 1 }
  git -C $VE -c advice.detachedHead=false checkout --quiet $VECommit; Ok 'video-edit instalado'
}
if ((Test-Path (Join-Path $VP '.git')) -or (Test-Path (Join-Path $VP 'SKILL.md'))) { Ok 'video-pizarra ya estaba' }
else { git clone --quiet $VPUrl $VP; if ($LASTEXITCODE -eq 0) { git -C $VP -c advice.detachedHead=false checkout --quiet $VPCommit; Ok 'video-pizarra instalado' } else { Warn "No pude clonar $VPUrl" } }

Step '3/6  Mejoras a video-edit'
$Patch = Join-Path $Repo 'patches\video-edit.patch'
git -C $VE apply --reverse --check $Patch 2>$null
if ($LASTEXITCODE -eq 0) { Ok 'El parche ya estaba aplicado' }
else {
  git -C $VE apply --check $Patch 2>$null
  if ($LASTEXITCODE -eq 0) { git -C $VE apply $Patch; Ok 'Parche aplicado' }
  else { Warn "El parche no aplica limpio. Para dejarlo como se probó: git -C `"$VE`" stash; git -C `"$VE`" checkout $VECommit"; $Falta = $true }
}
Copy-Item -Recurse -Force (Join-Path $Repo 'overlay\video-edit\*') $VE
Ok 'Copiados find_errors.py, track_crop.py y estilos'

Step '4/6  Setup de video-edit (tarda la primera vez)'
if ($SinSetup) { Warn 'Saltado (-SinSetup)' }
else { & $Py (Join-Path $VE 'scripts\setup.py'); if ($LASTEXITCODE -eq 0) { Ok 'video-edit listo' } else { Warn 'video-edit dijo NOT READY: revisa arriba'; $Falta = $true } }

Step '5/6  Efectos de sonido'
$SfxSrc = Join-Path $VE 'assets\template\assets\sfx'
if (Get-ChildItem -Path $SfxSrc -Filter *.mp3 -ErrorAction SilentlyContinue) {
  foreach ($d in @('remotion\public\sfx', 'cartoon\nina\assets\sfx', 'cartoon\caricatura-retro\assets\sfx')) {
    $t = Join-Path $Repo $d; New-Item -ItemType Directory -Force -Path $t | Out-Null
    Copy-Item -Force (Join-Path $SfxSrc '*.mp3') $t
  }
  Ok 'Copiados'
} else { Warn 'Todavía no hay efectos (los baja el paso 4). Vuelve a correr el instalador.' }

Step '6/6  Remotion'
if ($SinNpm) { Warn 'Saltado (-SinNpm)' }
elseif ($NodeOk) {
  Push-Location (Join-Path $Repo 'remotion'); npm install --no-fund --no-audit; $r = $LASTEXITCODE; Pop-Location
  if ($r -eq 0) { Ok 'Remotion instalado' } else { Warn 'npm install falló'; $Falta = $true }
} else { Warn 'Sin Node 22+ no se instala Remotion' }

if (-not $Falta) { Write-Host "`nTODO LISTO. Abre Claude Code en esta carpeta y pide tu video." -ForegroundColor Green }
else { Write-Host "`nCASI LISTO. Arregla los avisos (!) y vuelve a correr el instalador." -ForegroundColor Yellow }
