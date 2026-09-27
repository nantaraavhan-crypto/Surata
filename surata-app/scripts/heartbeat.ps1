<#
.SYNOPSIS
  Keeps Surata's data fresh by continuously exercising the live site.

.DESCRIPTION
  Every request that lands on an endpoint whose shared snapshot is older than
  five minutes forces a fresh scrape server-side. So a machine parked on this
  loop keeps the data perpetually near-current *and* keeps the instances warm,
  which is why real visitors stop paying the cold-start cost.

  This does NOT write to Vercel's cache directly - nothing outside can. It
  simply keeps asking, which is what triggers the refresh.

  Data therefore stays at most ~5 minutes old while this runs. Stop it and the
  site still works: Vercel's own crons (06/12/18 UTC) remain the safety net.

.PARAMETER IntervalMinutes
  How long to wait between rounds. 4 is the sweet spot - just under the
  server's 5-minute snapshot window, so nearly every round triggers a real
  refresh without wasting requests.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\heartbeat.ps1

.EXAMPLE
  .\scripts\heartbeat.ps1 -IntervalMinutes 10
#>
[CmdletBinding()]
param(
  [string]$BaseUrl = "https://surata.vercel.app",
  [int]$IntervalMinutes = 4,
  # Resolved below: $PSScriptRoot is not yet populated while parameter
  # defaults are being evaluated.
  [string]$LogPath = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($LogPath)) {
  $scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
  $LogPath = Join-Path $scriptDir "heartbeat.log"
}

# A zero interval would turn this into a tight loop hammering the site.
if ($IntervalMinutes -lt 1) {
  Write-Warning "IntervalMinutes must be at least 1; using 1."
  $IntervalMinutes = 1
}

# Same set the deploy warmer exercises - hitting these is what drives refresh.
$Endpoints = @(
  "/api/jobs",
  "/api/live",
  "/api/liveInternships",
  "/api/liveScholarships",
  "/api/liveHackathons",
  "/api/livePrivateJobs",
  "/api/allJobs",
  "/api/sarkari",
  "/api/updates",
  "/api/iits-iims",
  "/api/official",
  "/api/search?q=engineer"
)

function Write-Log([string]$Message, [string]$Colour = "Gray") {
  $stamp = (Get-Date).ToString("HH:mm:ss")
  Write-Host "[$stamp] $Message" -ForegroundColor $Colour
  Add-Content -Path $LogPath -Value "[$stamp] $Message" -Encoding UTF8
}

# Catches Ctrl+C so the log gets a clean shutdown line instead of dying
# mid-write. Guarded because there is no console when run from a non-interactive
# host (CI, a scheduled task, or a harness like this one).
$script:Stop = $false
try {
  [Console]::TreatControlCAsInput = $false
} catch {
  # No console available; Ctrl+C will terminate the process as usual.
}
try {
  $null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { $script:Stop = $true }
} catch {
  # Cannot trap exit here; harmless.
}

function Get-Counts {
  try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/health" -TimeoutSec 90
    return @{
      Status   = $health.status
      Sections = $health.sections
      Slowest  = $health.slowestMs
    }
  } catch {
    return $null
  }
}

# Fires one full round of requests in parallel - sequential would take minutes.
function Invoke-Round {
  $jobs = foreach ($path in $Endpoints) {
    Start-Job -ScriptBlock {
      param($url, $path)
      $started = Get-Date
      try {
        $res = Invoke-WebRequest -Uri "$url$path" -TimeoutSec 90 -UseBasicParsing
        [pscustomobject]@{
          Path   = $path
          Status = $res.StatusCode
          Ms     = [int]((Get-Date) - $started).TotalMilliseconds
          Ok     = $true
        }
      } catch {
        [pscustomobject]@{
          Path   = $path
          Status = 0
          Ms     = [int]((Get-Date) - $started).TotalMilliseconds
          Ok     = $false
        }
      }
    } -ArgumentList $BaseUrl, $path
  }

  $results = $jobs | Wait-Job | Receive-Job
  $jobs | Remove-Job -Force
  return $results
}

Write-Host ""
Write-Host "  Surata heartbeat" -ForegroundColor Cyan
Write-Host "  Site      : $BaseUrl"
Write-Host "  Interval  : every $IntervalMinutes minutes"
Write-Host "  Log       : $LogPath"
Write-Host "  Stop      : Ctrl+C"
Write-Host ""

Write-Log "Heartbeat started (target $BaseUrl, every $IntervalMinutes min)" "Green"

$round = 0
$previous = @{}

while (-not $script:Stop) {
  $round++
  $startedAt = Get-Date

  # --- Refresh driver: these requests force server-side re-scrapes ---------
  try {
    $results = Invoke-Round
    $failed = @($results | Where-Object { -not $_.Ok })
    $slowest = ($results | Measure-Object -Property Ms -Maximum).Maximum

    if ($failed.Count -eq 0) {
      Write-Log "Round $round : all $($results.Count) endpoints OK, slowest ${slowest}ms" "Green"
    } else {
      $names = ($failed | ForEach-Object { $_.Path }) -join ", "
      Write-Log "Round $round : $($failed.Count) failed - $names" "Yellow"
    }
  } catch {
    Write-Log "Round $round : request loop failed ($($_.Exception.Message))" "Red"
  }

  # --- Report: show what is actually being served right now ---------------
  $health = Get-Counts
  if ($null -eq $health) {
    Write-Log "Health check unreachable" "Red"
  } else {
    $colour = if ($health.Status -eq "ok") { "Green" } else { "Red" }
    Write-Log "Health: $($health.Status)" $colour

    foreach ($s in $health.Sections) {
      $delta = ""
      if ($previous.ContainsKey($s.key)) {
        $diff = $s.count - $previous[$s.key]
        if ($diff -gt 0) { $delta = "  (+$diff)" }
        elseif ($diff -lt 0) { $delta = "  ($diff)" }
      }
      $previous[$s.key] = $s.count

      $barColour = if ($s.status -eq "ok") { "DarkGreen" } else { "Red" }
      $bar = "$($s.count)".PadLeft(5)
      Write-Host "    $($s.label.PadRight(42)) $bar  $delta" -ForegroundColor $barColour
    }
  }

  # --- Sleep until the next round -----------------------------------------
  $elapsed = (Get-Date) - $startedAt
  $waitSeconds = [Math]::Max(0, ($IntervalMinutes * 60) - [int]$elapsed.TotalSeconds)

  $deadline = (Get-Date).AddSeconds($waitSeconds)
  while ((Get-Date) -lt $deadline -and -not $script:Stop) {
    Start-Sleep -Seconds 5
  }
}

Write-Log "Heartbeat stopped by operator after $round rounds" "Yellow"
