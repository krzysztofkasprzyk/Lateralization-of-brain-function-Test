$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "test_web_psychojs_playwright.mjs"

if (-not (Test-Path $scriptPath)) {
    throw "Nie znaleziono skryptu Playwright: $scriptPath"
}

& node $scriptPath

if ($LASTEXITCODE -ne 0) {
    throw "Test WEB-psychoJS zakonczyl sie bledem."
}
