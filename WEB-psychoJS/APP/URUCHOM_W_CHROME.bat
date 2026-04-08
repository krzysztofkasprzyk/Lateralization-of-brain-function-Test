@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "INDEX_FILE=%SCRIPT_DIR%index.html"

if not exist "%INDEX_FILE%" (
  echo Nie znaleziono pliku index.html.
  echo Sprawdz, czy folder zostal poprawnie rozpakowany.
  pause
  exit /b 1
)

set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if not defined CHROME_EXE (
  echo Nie znaleziono Google Chrome na tym komputerze.
  echo Zainstaluj Chrome i uruchom ten plik ponownie.
  pause
  exit /b 1
)

echo Uruchamiam wersje webowa w Google Chrome...
start "" "%CHROME_EXE%" --new-window --allow-file-access-from-files "%INDEX_FILE%"
exit /b 0
