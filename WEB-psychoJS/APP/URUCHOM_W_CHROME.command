#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INDEX_FILE="$SCRIPT_DIR/index.html"

if [[ ! -f "$INDEX_FILE" ]]; then
  echo "Nie znaleziono pliku index.html."
  echo "Sprawdz, czy folder zostal poprawnie rozpakowany."
  read -r -p "Nacisnij Enter, aby zamknac..."
  exit 1
fi

CHROME_BIN=""
for candidate in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
do
  if [[ -x "$candidate" ]]; then
    CHROME_BIN="$candidate"
    break
  fi
done

if [[ -z "$CHROME_BIN" ]]; then
  echo "Nie znaleziono Google Chrome na tym Macu."
  echo "Zainstaluj Chrome i uruchom ten plik ponownie."
  read -r -p "Nacisnij Enter, aby zamknac..."
  exit 1
fi

echo "Uruchamiam wersje webowa w Google Chrome..."
"$CHROME_BIN" --new-window --allow-file-access-from-files "$INDEX_FILE" >/dev/null 2>&1 &
exit 0
