$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $projectRoot "APP\index.html"

$chromeCandidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
)

$chromeExe = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chromeExe) {
    throw "Nie znaleziono Google Chrome."
}

$uri = "file:///" + ($indexPath -replace "\\", "/") + "?self_test=1"
$output = & $chromeExe --headless=new --disable-gpu --allow-file-access-from-files --virtual-time-budget=4000 --dump-dom $uri 2>&1

if ($output -notmatch "WEB_SELF_TEST_OK") {
    throw "Self-test wersji webowej nie przeszedl.`n$output"
}

$e2eUri = "file:///" + ($indexPath -replace "\\", "/") + "?e2e_test=1"
$e2eOutput = & $chromeExe --headless=new --disable-gpu --allow-file-access-from-files --virtual-time-budget=4000 --dump-dom $e2eUri 2>&1

if ($e2eOutput -notmatch "WEB_E2E_TEST_OK") {
    throw "Test end-to-end wersji webowej nie przeszedl.`n$e2eOutput"
}

Write-Host "WEB_VERSION_TEST_OK"
