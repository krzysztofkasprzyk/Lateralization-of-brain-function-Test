# Raport wdrożenia - PsychoJS ver.3

Ten dokument zbiera odpowiedzi na pytania promotora oraz listę zmian wdrożonych w wersji `Web PsychoJS ver.3`.

## 1. Weryfikacja pliku CSV

Plik CSV został ponownie sprawdzony pod kątem przydatności do późniejszej analizy. W wersji `ver.3` zapis obejmuje teraz zarówno podstawowe pola wynikowe, jak i dodatkowe pola analityczne.

Najważniejsze pola:

- `participant_ID`
- `phase`
- `trial_number`
- `trial_id`
- `block_number`
- `block_type`
- `trial_type`
- `word_side`
- `LVF_stimulus`
- `RVF_stimulus`
- `correct_response`
- `participant_response`
- `accuracy`
- `reaction_time_ms`
- `response_time_from_stimulus`
- `no_response`
- pola techniczne: `date`, `time`, `refresh_rate`, `monitor_resolution`, `fullscreen`, `viewing_distance_cm`, `fixation_duration`, `stimulus_duration`, `response_window`, `experiment_version`, `random_seed`

## 2. trial_type

Wersja `ver.3` rozróżnia wszystkie główne rodzaje prób:

- `word_nonword`
- `nonword_word`
- `nonword_nonword_ab`
- `nonword_nonword_ba`

Próby treningowe są dodatkowo odróżnione przez pole `phase = practice`.

## 3. block_type

Dodano pole `block_type`.

W praktyce bloki części głównej nie są różnymi warunkami eksperymentalnymi, tylko dwiema zbalansowanymi połowami tej samej procedury, dlatego:

- trening ma `block_type = practice`
- część główna ma `block_type = balanced_mixed`

## 4. word_side

Dodano pole `word_side`, które jednoznacznie wskazuje stronę prezentacji słowa:

- `left`
- `right`
- `none`

To upraszcza późniejszą analizę i eliminuje konieczność odtwarzania tej informacji pośrednio z `trial_type`.

## 5. Randomizacja prób

W wersji `ver.3` randomizacja została przebudowana.

Obecne zasady:

- dla każdej osoby generowany jest osobny `random_seed`
- na tej podstawie powstaje inna kolejność prób
- pełna część główna zawiera `64` unikalne kombinacje powtórzone `4` razy
- każda kombinacja jest rozdzielana po `2` wystąpienia do bloku 1 i po `2` wystąpienia do bloku 2
- każdy blok ma `128` prób
- każdy blok zawiera po `32` próby każdego typu
- próby w każdym bloku są losowo mieszane
- procedura pilnuje, aby ta sama para bodźców nie pojawiła się w dwóch poprzednich próbach

## 6. trial_number

W wersji `ver.3` znaczenie `trial_number` zostało ujednolicone.

`trial_number` oznacza teraz:

- rzeczywistą kolejność prezentacji próby na ekranie

Osobno dodano:

- `trial_id` jako stabilny identyfikator danej próby / pary bodźców

Dzięki temu rozdzielono:

- kolejność wyświetlenia
- identyfikator materiału

## 7. Kontrola powtórzeń bodźców

Dodano dodatkową kontrolę losowania:

- jeśli ta sama para bodźców wystąpiła w jednej z dwóch poprzednich prób, algorytm nie dopuszcza jej w kolejnym kroku i losuje dalej

To nie jest rozwiązanie „matematycznie doskonałe” w sensie pełnego przeszukiwania wszystkich permutacji, ale praktycznie ogranicza niepożądane lokalne powtórzenia.

## 8. Timing, PsychoJS i przeglądarka

Wersja webowa nie używa desktopowego PsychoPy uruchamianego w Pythonie. Używa `PsychoJS`, czyli internetowej biblioteki z ekosystemu PsychoPy.

W praktyce oznacza to:

- renderowanie bodźców przez `PsychoJS`
- wykorzystanie `requestAnimationFrame()` i lokalnego zegara przeglądarki
- lokalne znakowanie czasów odpowiedzi

Ważna uwaga metodologiczna:

- zgodnie z dokumentacją PsychoPy / PsychoJS badania online mogą mieć dobrą precyzję czasową,
- ale autorzy dokumentacji podkreślają też, że timing webowy należy traktować ostrożniej niż lokalne badanie uruchamiane bezpośrednio na komputerze,
- dlatego końcową pewność należy zawsze potwierdzić testem na docelowym sprzęcie.

## 9. Uruchamianie przez przeglądarkę

Uruchamianie przez przeglądarkę oznacza, że procedura działa w środowisku Chrome, a nie jako osobna aplikacja systemowa.

Wersja `ver.3` minimalizuje to ryzyko przez:

- lokalne biblioteki `PsychoJS`
- pełny ekran podczas badania
- lokalne zbieranie odpowiedzi
- testy sekwencji prób i czasu ekspozycji

Mimo tego wersja webowa nadal powinna być traktowana jako rozwiązanie bardziej zależne od środowiska niż klasyczna wersja desktopowa.

## 10. Kod źródłowy

Kod źródłowy może zostać udostępniony do wglądu.

Najważniejszy plik kontrolujący przebieg ekspozycji, zbieranie odpowiedzi i zapis danych:

- `WEB-psychoJS/APP/app.js`

To właśnie ten plik pozwala sprawdzić:

- strukturę prób
- randomizację
- timing
- obsługę pełnego ekranu
- zapis CSV / XLSX

## 11. Dodatkowa poprawka użytkowa

W wersji `ver.3` dodano także możliwość pobrania wyników jako `XLSX`, przy zachowaniu standardowego eksportu `CSV`.

## 12. Testy wykonane po poprawkach

Po wdrożeniu zmian uruchomiono:

- test pełnego przebiegu `WEB_PSYCHOJS_TEST_OK`
- test sekwencji próby `TRIAL_SEQUENCE_OK`

Sprawdzano m.in.:

- strukturę `10 + 256`
- podział `128 / 128`
- kompletność `64` kombinacji
- zbalansowanie bloków
- brak lokalnych powtórzeń tej samej pary w dwóch poprzednich próbach
- dodatnie czasy reakcji
- przygotowanie eksportu `CSV` i `XLSX`
