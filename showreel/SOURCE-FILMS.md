# Materiały źródłowe showreelu

Filmy leżą w `showreel/source-films/`; duże pliki z `assets/source/` są tam
podlinkowane na twardo.

## Jak wybrano punkty cięć

Skrypty w `showreel/_an/` mierzą trzy rzeczy wokół każdego cięcia:

1. **energia ruchu** — średnia różnica między kolejnymi klatkami w skali
   szarości 160×90; cięcie na klatce o wysokim ruchu czyta się jako przypadkowe,
2. **obwiednia RMS** dźwięku — żeby nie ucinać w szczycie brzmienia,
3. **energia mowy** w pasmie 300–3400 Hz w oknach 10 ms — bo pierwsze dwie
   miary nie widzą, czy cięcie wypada w środku słowa.

Trzecia miara powstała po tym, jak Not Today wchodziło w połowie wyrazu
(„brella" zamiast „umbrella"). Wejście i wyjście tego bloku siedzą teraz
w przerwach między słowami.

Do wyboru materiału z Pause & Deserve doszedł jeszcze skan jasności całego
nagrania. Poprzednie ujęcia miały jasność 5,4 i 6,5 na 255 — praktycznie czerń.
Jedyny czytelny fragment to 44–66 s, stąd korytarz i ognisko.

## Co reel bierze z czego

### Shadow Frames

- plik: `showreel/source-films/shadow-frames-gameplay.webm`
- źródło: https://www.youtube.com/watch?v=TIP4mAYpuMo

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `shadow-anomaly` | 3:03.07 – 3:08.70 | 5.63 s | 0:02.70 |
| `shadow-level` | 5:12.77 – 5:17.74 | 4.97 s | 0:08.05 |
| `shadow-capture` | 9:56.00 – 10:00.90 | 4.90 s | 0:12.74 |

### Pause & Deserve

- plik: `showreel/source-films/pause-deserve-gameplay.mkv`
- źródło: https://www.youtube.com/watch?v=bBuhTHrN81k

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `pause-corridor` | 0:51.50 – 0:55.50 | 4.00 s | 0:17.36 |
| `pause-fire` | 0:58.50 – 1:02.00 | 3.50 s | 0:21.08 |

### XR Labs — publiczny materiał klienta

- plik: `showreel/source-films/xrlabs-training-dsu.mp4`
- źródło: https://www.youtube.com/watch?v=VWOk_6-lF2I

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `xr-labs-hall` | 0:17.60 – 0:21.20 | 3.60 s | 0:24.30 |
| `xr-labs-sim` | 0:21.40 – 0:25.00 | 3.60 s | 0:27.62 |

### Not Today, Darling! — twoje nagranie 2026-04-02, min. 2:43–3:45

- plik: `showreel/source-films/not-today-gameplay-round2.mp4`

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `not-today-sprint` | 0:13.96 – 0:19.01 | 5.05 s | 0:30.94 |
| `not-today-impacts` | 0:36.21 – 0:40.01 | 3.80 s | 0:35.71 |

### Transientica

- plik: `showreel/source-films/transientica-gameplay.webm`
- źródło: https://www.youtube.com/watch?v=r9IC7t0GPOU

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `transientica` | 0:30.07 – 0:35.97 | 5.90 s | 0:39.23 |

### AudioQ

- plik: `showreel/source-films/audioq-demo.webm`
- źródło: https://www.youtube.com/watch?v=Q2hwWfisU4A

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `audioq` | 0:56.20 – 1:02.40 | 6.20 s | 0:44.85 |

### AI Audio Research

- plik: `showreel/source-films/UnrealEngineDemo.mp4`

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `ai-unreal` | 0:24.67 – 0:29.77 | 5.10 s | 0:50.77 |

### Akantilado

- plik: `showreel/source-films/akantilado-film.mp4`
- źródło: https://www.youtube.com/watch?v=ALQy5r7B1Bw

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `akantilado-a` | 0:10.33 – 0:13.13 | 2.80 s | 0:55.59 |
| `akantilado-b` | 0:16.37 – 0:19.17 | 2.80 s | 0:58.11 |
| `akantilado-c` | 0:20.50 – 0:23.90 | 3.40 s | 1:00.63 |

### Ray

- plik: `showreel/source-films/ray-animation-h264.mp4`

| segment | w źródle | długość | na osi reelu |
| --- | --- | --- | --- |
| `ray` | 1:14.00 – 1:19.20 | 5.20 s | 1:03.75 |

## Uwagi

- Wszystkie przejścia to rozjaśnienia 0,28 s. Cięcia wewnątrz projektu zostały
  usunięte — reel ma jedną gramatykę przejść od początku do końca.
- XR Labs używa oryginalnego dźwięku, sprowadzonego z −10,4 dBFS do poziomu
  reszty. Tag na ekranie mówi, że to publiczny materiał klienta.
- `UnrealEngineDemo.mp4` ma średnio −35 dBFS i ciszę w sekundach 0–6, 10, 44,
  56, 60–62, 65. Najdłuższy ciągły odcinek to 11–44 s.
