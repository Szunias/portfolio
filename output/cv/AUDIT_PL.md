# Audyt CV względem portfolio

Audyt wykonany 28 lipca 2026 na podstawie opublikowanej strony, aktualnych plików `src/pages` oraz starszego CV dostępnego na stronie.

## Najważniejszy wniosek

Treść projektów w nowych CV jest zgodna z portfolio, ale opublikowana strona nie jest jeszcze zgodna z aktualnymi datami. Publiczna strona główna i publiczne case study XR Labs nadal pokazują tę pracę jako obecną. Aktualne źródło strony i nowe CV podają okres od lutego do czerwca 2026.

Starszy PDF dostępny na stronie podaje `XR Labs, Brussels`, dlatego lokalizacja wróciła do wszystkich nowych wersji jako `Brussels, Belgium`.

## Ocena twierdzeń

| Obszar | Ocena | Zmiana w nowych CV |
| --- | --- | --- |
| XR Labs - stanowisko i zakres | Trafne | Zachowano `Technical Sound Designer`, Unity, Steam Audio, Perforce oraz wyłącznie wybrane symulacje VR i AR. |
| XR Labs - lokalizacja | Brakowała | Dodano `Brussels, Belgium`; `Based in Kortrijk, Belgium` jasno oznacza miejsce zamieszkania. |
| XR Labs - daty | Trafne w aktualnym źródle, sprzeczne z live site | Zachowano `February 2026 - June 2026`. Publiczną stronę trzeba ponownie wdrożyć. |
| XR Labs - systemy | Trafne | Doprecyzowano direction, occlusion, indirect paths oraz near/far weapon layers bez sugerowania nieujawnionych projektów klienta. |
| Shadow Frames | Jedno zdanie było za szerokie | Zamiast sugerować stworzenie każdego assetu zapisano, że Igor stworzył cues zmian, a następnie zaimplementował i zmiksował całe audio. |
| SIDAR NULL | Trafne po podaniu ograniczeń | Scanner i geometry reveal są działające, ale projekt pominięto w skróconych wersjach wizualnych, ponieważ pursuit, level, final visuals i audio pozostają w produkcji. |
| Not Today, Darling! | Wcześniej za słabo | Dodano, że gra została wydana, oraz zachowano konkretne dowody: około 450 plików, reactive engines i limit 32 źródeł. |
| Wwise Implementation Exercises | Brakowały w wersji technical | Dodano przekroczenie limitu 256 głosów, 6,5-sekundowe przejście ambience/reverb i około 80% mniej pamięci zajmowanej przez silent-gap assets. |
| AI Audio Research | Data była zbyt ogólna | Rozdzielono `Research 2024 - 2025` od `thesis 2026`. Liczby są opisane jako 95th percentile i pełna droga od eventu do pierwszej słyszalnej próbki. |
| Transientica | Trafne po rozdzieleniu wersji | 92% i 45 ms dotyczą wyłącznie wycofanego prototypu Python/SVM. Aktualny system C#/KNN nadal nie ma porównywalnego benchmarku. |
| AudioQ | Trafne | Wyraźnie rozdzielono własne efekty od filtrów i kompresora JUCE oraz Windows VST3 od standalone budowanego ze źródła. |
| AutoTrim Exporter | `public tool` było nieprecyzyjne | Zapisano, że narzędzie ma publiczne wydania, bez sugerowania publicznego repozytorium deweloperskiego. |
| Mówik | Brakował w wersji programistycznej | Dodano go jako dowód wydania aplikacji Python/Windows z lokalną transkrypcją i świadomie ograniczonymi komendami. |
| Wykształcenie | Trafne | Użyto pełnej nazwy bachelor oraz pełnego tytułu pracy dyplomowej. Poprawiono pisownię `Kołobrzeg`. |
| Zdjęcie i zainteresowania | Przywrócone w wersjach wizualnych | Technical i Audio Programmer zawierają zdjęcie oraz `Javelin throw, swimming, gym and fitness`; wersja ATS pozostaje bez nich. |

Wersje Technical i Audio Programmer są celowo krótkie i wizualne: doświadczenie XR Labs ma po dwa punkty, a projekty są ograniczone do jednego rezultatu lub mierzalnego dowodu. Wersja ATS pozostaje pełniejsza, ponieważ służy do formularzy rekrutacyjnych i automatycznego parsowania, a nie jako główny dokument do wysyłki bezpośredniej.

## Świadomie pominięte lub złagodzone

- `200+ Wwise events` - brak tego wyniku w aktualnym publicznym case study.
- konkretny model TASER oraz szczegóły materiałowych odbić - nie występują w aktualnym portfolio.
- `all ML from scratch` lub `KNN from scratch` - zbyt szerokie względem opisanej implementacji.
- wyniki `92% / 45 ms` bez informacji, że dotyczą starszego prototypu.
- `created all audio` w Shadow Frames - portfolio potwierdza stworzenie cues zmian oraz implementację i miks całego audio, ale nie stworzenie każdego assetu.

## Co trzeba jeszcze zsynchronizować na stronie

1. Wdrożyć aktualny build, aby publiczne `/` i `/xrlabs.html` przestały pokazywać `Present` i `Current`.
2. Dodać `Brussels, Belgium` do nagłówka case study XR Labs, jeżeli lokalizacja ma być widoczna również w portfolio.
3. Zastąpić stary plik `Igor_Szuniewicz_CV.pdf` na stronie wybraną nową wersją. Obecny publiczny PDF nadal ma stare daty, starszy tytuł pracy oraz kilka zbyt szerokich stwierdzeń.

## Sprawdzone strony

- https://igorszuniewicz.com/
- https://igorszuniewicz.com/xrlabs.html
- https://igorszuniewicz.com/shadowframes.html
- https://igorszuniewicz.com/sidar.html
- https://igorszuniewicz.com/nottoday.html
- https://igorszuniewicz.com/ai-audio-research.html
- https://igorszuniewicz.com/transientica.html
- https://igorszuniewicz.com/audioq.html
- https://igorszuniewicz.com/autotrim.html
- https://igorszuniewicz.com/mowik.html
- https://igorszuniewicz.com/Igor_Szuniewicz_CV.pdf
