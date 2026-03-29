# Sprawdzenie działania aplikacji

**Data:** 2026-03-29
**Cel:** Zweryfikować czy aplikacja BONZO_media_HUB uruchamia się poprawnie i przechodzi podstawowe kontrole jakości.

## Zakres

- Sprawdzenie komend projektu i menedżera pakietów
- Uruchomienie kontroli statycznej (lint)
- Uruchomienie buildu produkcyjnego
- Uruchomienie serwera developerskiego i test odpowiedzi HTTP

## Oczekiwane pliki do ruszenia

- Brak zmian funkcjonalnych (diagnostyka)

## Skills / Agent

- Skills: brak dedykowanego skilla z listy dostępnych dla tego typu zadania
- Agent: brak (zadanie diagnostyczne, lokalne)

---

## Zakończenie zadania

**Data ukończenia:** 2026-03-29  
**Status:** completed

### Podsumowanie

- `npm run build` przechodzi poprawnie (Next.js 16 + webpack).
- `npm run lint` nie działało, ponieważ brakowało paczki `eslint` w zależnościach deweloperskich.
- Zdiagnozowano przyczynę efektu „ciągłego uruchamiania” jako aktywny Service Worker/PWA także w trybie developerskim.
- Wdrożono poprawkę: PWA wyłączone w `development` oraz czyszczenie starych rejestracji SW/cache w dev.
- Test HTTP po poprawce: `GET /` zwraca `200`, a logi pokazują stabilny start bez pętli odświeżania.

### Zmienione pliki

- `next.config.mjs` — wyłączenie PWA w `development`.
- `components/service-worker-register.tsx` — brak rejestracji SW w dev + usuwanie starych rejestracji/cache.
