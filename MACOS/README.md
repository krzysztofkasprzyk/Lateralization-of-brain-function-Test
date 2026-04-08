# Wersja macOS

Ten branch zawiera pakiet projektu przygotowany do uruchomienia lub zbudowania instalatora na macOS.

## Co pobrac

- `MACOS/PAKIET-MAC-FINAL.zip`

## Co zrobic na Macu

1. Pobierz `PAKIET-MAC-FINAL.zip`.
2. Rozpakuj archiwum.
3. Otworz folder `PAKIET-MAC-FINAL`.

Masz dwie glowne opcje:

1. Kliknij `URUCHOM_NA_MAC.command`
To przygotuje srodowisko i uruchomi program.

2. Kliknij `ZBUDUJ_INSTALATOR_NA_MAC.command`
To zbuduje natywny pakiet macOS `.pkg` albo paczke `.zip` z aplikacja.

## Wymagania

- macOS na Apple Silicon
- uprawnienia administratora moga byc potrzebne przy instalacji dolaczonego Python 3.11
- polaczenie z internetem nadal moze byc potrzebne do dogrania czesci zaleznosci, jesli lokalna paczka nie wystarczy

## Co jest juz w paczce

- lokalny instalator `Python 3.11.9` dla macOS
- lokalny wheel `psychopy-2026.1.3`
- skrypty z logowaniem i obsluga bledow

## Gdy pojawi sie blad

- wykonaj zrzut ekranu
- zachowaj log z folderu `logi-macos`
- przeslij zrzut ekranu i log autorowi programu

## Dodatkowa dokumentacja

Po rozpakowaniu pakietu znajdziesz tez:

- `README_NA_MAC.txt`
- `DOKUMENTACJA/macos_build_guide.md`
- `DOKUMENTACJA/Instrukcja Test Lateralizacji v1.2026.pdf`
