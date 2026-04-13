# Test Lateralizacji - Web PsychoJS V2

To jest finalna, przeglądarkowa wersja testu lateralizacji TLDT / LDT przygotowana do uruchamiania w Google Chrome na Windows i macOS.

## Co znajduje się w branchu

- `PAKIET/Test Lateralizacji - Web PsychoJS V2.zip`
- `DOKUMENTACJA/Instrukcja Test Lateralizacji - Web PsychoJS V1.docx`

## Czym jest ta wersja

To wersja webowa oparta o lokalne biblioteki `PsychoJS`, czyli webową bibliotekę z ekosystemu PsychoPy. Po rozpakowaniu działa bez instalowania Pythona i bez dodatkowych skryptów uruchomieniowych.

Program:

- prowadzi instrukcje, trening i część główną 256 prób,
- działa w pełnym ekranie podczas badania,
- zapisuje dane do CSV,
- tworzy kopię awaryjną sesji w przeglądarce,
- pozwala zmieniać bodźce i parametry monitora,
- ma opcjonalne przełączniki `[DEBUG/TEST INFO]`.

## Jak uruchomić

1. Pobierz plik `Test Lateralizacji - Web PsychoJS V2.zip`.
2. Rozpakuj paczkę ZIP.
3. Otwórz rozpakowany folder.
4. Uruchom plik `Test lateralizacji.html` w Google Chrome.

Najlepiej:

- nie uruchamiać pliku bezpośrednio z podglądu ZIP,
- używać Google Chrome,
- pozwolić aplikacji wejść w tryb pełnoekranowy przed badaniem.

## Jak działa zapis danych

- każdy badany może mieć osobny plik CSV,
- domyślna nazwa pliku korzysta z `ID uczestnika` i czasu uruchomienia,
- można wskazać bezpośredni plik zapisu CSV w Chrome,
- niezależnie od tego aplikacja utrzymuje kopię awaryjną w pamięci przeglądarki.

## Dokumentacja

W folderze `DOKUMENTACJA` znajduje się instrukcja `.docx` przygotowana do dalszego uzupełnienia o aktualne screeny programu.
