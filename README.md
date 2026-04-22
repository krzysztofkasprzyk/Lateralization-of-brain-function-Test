# Test Lateralizacji - Web PsychoJS V3

To jest aktualna, przeglądarkowa wersja testu lateralizacji TLDT / LDT przygotowana do uruchamiania w Google Chrome na Windows i macOS.

## Co znajduje się w branchu

- `PAKIET/Test Lateralizacji - Web PsychoJS V3.zip`
- `DOKUMENTACJA/Dokumentacja - Test Lateralizacji V2.pdf`
- `DOKUMENTACJA/Raport wdrożenia - PsychoJS ver.3.md`

## Co zmieniło się w ver.3

W tej rewizji dopracowano przede wszystkim warstwę analityczną i eksport wyników:

- dodano eksport `XLSX` obok `CSV`,
- rozszerzono dane o pola `phase`, `trial_id`, `block_type` i `word_side`,
- uporządkowano znaczenie `trial_number`,
- rozróżniono wszystkie główne typy prób w `trial_type`,
- zbalansowano bloki `128 / 128`,
- dodano kontrolę, aby ta sama para bodźców nie pojawiała się w dwóch poprzednich próbach,
- utrzymano kopię awaryjną w pamięci przeglądarki.

## Jak uruchomić

1. Pobierz plik `Test Lateralizacji - Web PsychoJS V3.zip`.
2. Rozpakuj paczkę ZIP.
3. Otwórz rozpakowany folder.
4. Uruchom plik `Test lateralizacji.html` w Google Chrome.

Najlepiej:

- nie uruchamiać pliku bezpośrednio z podglądu ZIP,
- używać Google Chrome,
- pozwolić aplikacji wejść w tryb pełnoekranowy przed badaniem.

## Jak działa zapis danych

- każdy badany może mieć osobny plik wynikowy,
- można wskazać bezpośredni plik zapisu `CSV` w Chrome,
- po zakończeniu badania wyniki można pobrać jako `CSV` lub `XLSX`,
- niezależnie od tego aplikacja utrzymuje kopię awaryjną w pamięci przeglądarki.

## Dokumentacja

- `Dokumentacja - Test Lateralizacji V2.pdf` zawiera instrukcję użytkową dla operatora,
- `Raport wdrożenia - PsychoJS ver.3.md` zawiera odpowiedzi techniczne i metodologiczne dotyczące danych, randomizacji i timingu.

## Kod źródłowy

W folderze KOD_ZRODLOWY znajduje się główny kod sterujący wersji webowej:

- index.html`r
- pp.js`r
- styles.css`r

