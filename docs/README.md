# Test Lateralizacji - Web PsychoJS V3

To jest przeglądarkowa wersja testu lateralizacji TLDT / LDT przygotowana do uruchamiania w Google Chrome na Windows i macOS.

## Co to jest

Aplikacja korzysta z lokalnych bibliotek `PsychoJS`, czyli internetowej biblioteki z ekosystemu PsychoPy, do:

- prezentacji bodźców po lewej i prawej stronie punktu fiksacji,
- zbierania odpowiedzi klawiszami `F`, `J` i `Spacja`,
- prowadzenia treningu oraz części głównej `256` prób,
- zapisu danych do `CSV`,
- pobierania tych samych danych także jako `XLSX`,
- tworzenia kopii awaryjnej sesji w pamięci przeglądarki,
- zmiany bodźców, parametrów monitora i ustawień debugowych.

## Jak uruchomić

1. Rozpakuj paczkę ZIP.
2. Otwórz plik `Test lateralizacji.html` w Google Chrome.
3. W konfiguracji wpisz `ID uczestnika`, sprawdź parametry monitora i rozpocznij badanie.

Najbezpieczniej:

- nie otwierać pliku bezpośrednio z podglądu ZIP,
- używać Google Chrome,
- pozwolić aplikacji wejść w tryb pełnoekranowy przed badaniem.

## Jak przebiega badanie

1. Operator ustawia dane uczestnika, czasy ekspozycji i parametry monitora.
2. Badany przechodzi przez ekrany instrukcji.
3. Uruchamia się trening.
4. Po treningu rozpoczyna się część główna `256` prób z przerwą po `128`.
5. Na końcu można pobrać wyniki jako `CSV` lub `XLSX`.

## Zapis danych

- Każdy badany może mieć osobny plik wynikowy.
- Domyślna nazwa pliku korzysta z `ID uczestnika` oraz czasu uruchomienia, żeby ograniczyć ryzyko nadpisania.
- Jeśli użytkownik nie wskaże bezpośredniego pliku zapisu CSV, aplikacja nadal zachowa kopię awaryjną w przeglądarce.
- Po badaniu dane można pobrać jako:
  - `CSV` do dalszej analizy,
  - `XLSX` do wygodnego przeglądu w arkuszu.

## Dodatkowe pola analityczne

W wersji `V3` dane zostały rozszerzone m.in. o:

- `phase`
- `trial_id`
- `block_type`
- `word_side`

Do tego `trial_type` rozróżnia teraz wszystkie główne rodzaje prób:

- `word_nonword`
- `nonword_word`
- `nonword_nonword_ab`
- `nonword_nonword_ba`

## Uwaga metodologiczna

Przed badaniem trzeba potwierdzić:

- szerokość monitora w centymetrach,
- rozdzielczość monitora,
- refresh rate monitora.

Przeglądarka część z tych danych wykrywa automatycznie, ale wartości można też poprawić ręcznie w konfiguracji testu.
