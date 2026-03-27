# Workspace meta bootstrap dla BONZO Media HUB

## Cel
Dodać `.workspace_meta` z template do media app, zsynchronizować `.gitignore` i ustawić podstawową specyfikację workspace.

## Wynik
Zadanie ukończone 2026-03-27.

## Zmiany
- skopiowano `C:\WORKSPACE_META_TEMPLATE\.workspace_meta` do `U:\www_BONZO_madia_HUB_inc`
- zaktualizowano `.workspace_meta/workspace.spec.json` pod projekt `BONZO_media_HUB`
- dopisano `.workspace_meta/secrets/` i `.workspace_meta/awesome-copilot/` do `.gitignore`
- uruchomiono bootstrap i dodano `@github/copilot-sdk` do `package.json`
- zaktualizowano `pnpm-lock.yaml` po instalacji SDK
- uporządkowano `.workspace_meta/notes/project-notes.md`, aby opisywał realny projekt zamiast samego template

## Zmodyfikowane pliki
- `.gitignore`
- `package.json`
- `pnpm-lock.yaml`
- `.workspace_meta/workspace.spec.json`
- `.workspace_meta/notes/project-notes.md`

## Weryfikacja
- template `.workspace_meta` istnieje w repo ✅
- `@github/copilot-sdk` jest dodany do zależności ✅
- `.gitignore` chroni sekrety i lokalne meta-zasoby ✅
