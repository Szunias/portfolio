# Shadow Frames - Rzeczywiste Red Flagi (Niespójności, Błędy Logiczne, Kłamstwa)

## 🔴 KRYTYCZNE NIESPÓJNOŚCI

### 1. **NIESPÓJNOŚĆ: Opis vs Kod - "named" vs "tag"**
- **Problem**: W HTML (linia 1907) opis mówi: "Finds AkAmbientSound actor **named** 'AmbientProgressive'"
- **Rzeczywistość**: Kod używa **TAG** (ActorHasTag), nie name search
- **Gdzie**: 
  - HTML: `projects/shadow-frames.html:1907` - opis mówi "named"
  - Kod: `projects/shadow-frames.html:1923` - używa `ActorHasTag("AmbientProgressive")`
  - JSON: `locales/shadow-frames.json:202` - poprawnie mówi "by tag"
- **Dlaczego to problem**: Recruiter sprawdzający kod zobaczy, że opis nie odpowiada implementacji. To wygląda na brak dbałości o szczegóły lub copy-paste z innego projektu.
- **Rozwiązanie**: Popraw opis w HTML/translations żeby mówił "by tag" zamiast "named"

### 2. **KOD NIE PRODUCTION-READY - Komentarz w kodzie**
- **Problem**: Komentarz w kodzie mówi: "In production, this would be cached to avoid GetAllActorsOfClass every call"
- **Gdzie**: `projects/shadow-frames.html:1917` - tooltip dla kodu RTPC
- **Dlaczego to problem**: 
  - Sugeruje, że kod nie jest production-ready
  - Jeśli to portfolio, pokazujesz kod z założeniem, że trzeba go jeszcze poprawić
  - Recruiter może pomyśleć, że nie kończysz rzeczy, które zaczynasz
- **Rozwiązanie**: 
  - Albo zaimplementuj cache
  - Albo usuń komentarz o cache (zostaw tylko o tag vs name)
  - Albo dodaj notatkę, że to prototyp/demo, a production używa cache

## 🟡 ŚREDNIE PROBLEMY (Potencjalne Niespójności)

### 3. **NIESPÓJNOŚĆ: "Sound Lead" vs "Lead Audio Designer"**
- **Problem**: Używasz obu terminów zamiennie:
  - Badge: "Sound Lead"
  - Subtitle: "Lead Audio Designer"
  - Opis roli: "As Sound Lead"
- **Gdzie**: Wszędzie w projekcie
- **Dlaczego to problem**: To nie jest faktyczna niespójność (oba są poprawne), ale może być mylące. W branży "Lead Audio Designer" jest bardziej formalne.
- **Rozwiązanie**: Ujednolicić na "Lead Audio Designer" wszędzie (bardziej profesjonalne)

### 4. **PRZESADNE TWIERDZENIA - "will be significantly more advanced"**
- **Problem**: Powtarzasz to 2 razy:
  - "The full system will be significantly more advanced"
  - "The full system will be significantly more advanced with additional layers and complexity"
- **Gdzie**: 
  - `projects/shadow-frames.html:1632` - opis roli
  - `projects/shadow-frames.html:1965` - Wwise Architecture result
- **Dlaczego to problem**: 
  - Brzmi jak wymówka "to co pokazuję to tylko mała część"
  - Recruiter chce widzieć faktyczne osiągnięcia, nie obietnice
  - Powtórzenie sugeruje, że nie masz konkretów do pokazania
- **Rozwiązanie**: 
  - Zmień na coś bardziej konkretnego: "Additional features planned: [lista]" 
  - LUB usuń i skup się na tym, co faktycznie zrobiłeś

## 🟢 DROBNE NIESPÓJNOŚCI

### 5. **Komentarz w kodzie vs Opis - Tag Search**
- **Problem**: Komentarz w kodzie (linia 1916) mówi "Find actor by tag (more efficient and reliable than name search)", ale tooltip (linia 1917) mówi o cache, nie o tag vs name.
- **Dlaczego to problem**: Nie jest to faktyczna niespójność, ale pokazuje, że komentarze nie są zsynchronizowane z opisami.
- **Rozwiązanie**: Upewnij się, że wszystkie opisy są spójne

## ✅ CO JEST OK

1. ✅ Deadline Q2 2025 jest spójny z "Ongoing Project" i Sprint 3/5
2. ✅ Unreal Engine 5.5 jest ujednolicony wszędzie
3. ✅ Timeline jest logiczny (Sprint 3/5 aktywny)
4. ✅ Opisy techniczne są poprawne (delegates, RTPC, switches)
5. ✅ Kod jest poprawny technicznie (tylko komentarze mogą wprowadzać w błąd)

## 📋 PRIORYTETOWA LISTA NAPRAW

### Natychmiast (krytyczne):
1. ✅ **Popraw opis RTPC** - zmień "named" na "by tag" w tłumaczeniach/HTML
2. ✅ **Usuń lub zmień komentarz o cache** - albo zaimplementuj, albo usuń, albo zaznacz że to prototyp

### Wkrótce:
3. ✅ Ujednolic "Sound Lead" vs "Lead Audio Designer" (opcjonalne, ale lepsze)
4. ✅ Zmień "will be significantly more advanced" na coś bardziej konkretnego

## 🎯 PODSUMOWANIE DLA RECRUITERA

**Rzeczywiste red flagi:**
- ❌ Opis nie odpowiada kodowi (named vs tag) - **FAKTYCZNA NIESPÓJNOŚĆ**
- ❌ Kod z komentarzem "this would be cached in production" - **SUGERUJE NIE-PRODUCTION-READY**

**Nie są red flagi (ale można poprawić):**
- ⚠️ Użycie "Sound Lead" i "Lead Audio Designer" zamiennie (oba poprawne, ale może być mylące)
- ⚠️ Powtarzanie "will be significantly more advanced" (brzmi jak wymówka)

**Co działa dobrze:**
- ✅ Kod jest poprawny technicznie
- ✅ Timeline i deadline są spójne
- ✅ Techniczne opisy są dokładne (poza jednym błędem)
