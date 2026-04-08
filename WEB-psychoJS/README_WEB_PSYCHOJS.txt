WERSJA WEB-PSYCHOJS V1

To jest przeglądarkowa wersja testu lateralizacji przygotowana pod Google Chrome na Windows i macOS,
z wykorzystaniem lokalnej biblioteki PsychoJS do prezentacji bodźców, obsługi klawiatury i pomiaru czasu.

Najważniejsze:

- działa bez instalowania bibliotek Python
- działa jako statyczne pliki HTML/CSS/JS
- uruchamia się bezpośrednio w Chrome
- wykorzystuje lokalne pliki PsychoJS do przebiegu prób
- zachowuje menu, instrukcje i główne opcje znane z wersji desktopowej
- obsługuje test klawiatury, kalibrację ekranu, edytor bodźców, trening, 256 prób głównych i pauzę pod Backspace
- zapisuje CSV do wskazanego pliku w Chrome albo tworzy kopię awaryjną w pamięci przeglądarki
- loguje błędy i pozwala pobrać plik log po awarii

Jak uruchomić:

Windows:
- otwórz folder APP
- kliknij URUCHOM_W_CHROME.bat

macOS:
- otwórz folder APP
- kliknij URUCHOM_W_CHROME.command

Pliki:

- APP/index.html
  główna aplikacja

- APP/app.js
  logika eksperymentu, zapisu CSV, kopii awaryjnej, testów i integracji z PsychoJS

- APP/styles.css
  wygląd interfejsu

- APP/lib
  lokalne biblioteki PsychoJS i zależności wymagane do działania offline

Ważne:

- przed startem potwierdź szerokość monitora w centymetrach według specyfikacji producenta
- w Chrome można wybrać plik CSV przed startem
- jeśli plik nie zostanie wybrany, dane nadal zapiszą się w kopii awaryjnej przeglądarki i będą do pobrania po badaniu
- menu pauzy w trakcie prób otwiera klawisz Backspace
