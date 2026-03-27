# Architecture Decision Records

> Dokumentuj tu każdą ważną decyzję techniczną.  
> Format: data → kontekst → decyzja → konsekwencje

---

## Template

### ADR-001: [Tytuł decyzji]
**Data:** YYYY-MM-DD  
**Status:** proposed | accepted | deprecated | superseded  
**Kontekst:** Dlaczego ta decyzja jest potrzebna?  
**Decyzja:** Co zostało zdecydowane?  
**Konsekwencje:** Jakie są skutki tej decyzji?  
**Alternatywy:** Co jeszcze było rozważane?

---

<!-- Dodawaj nowe decyzje poniżej -->

---

### ADR-001: Struktura .workspace_meta jako uniwersalny template
**Data:** 2026-03-19  
**Status:** accepted  
**Kontekst:** Każdy nowy workspace wymagał ręcznego ustawiania struktury dokumentacji, konfiguracji MCP, skilli Copilot i systemu todo. Powtarzalna praca bez standaryzacji.  
**Decyzja:** Utworzony `C:\WORKSPACE_META_TEMPLATE\.workspace_meta` jako referencyjny folder kopiowany do każdego nowego workspace. Zawiera: workspace.spec.json (template), Definition_of_done.html (dashboard), notes/ (ADR + snapshots), ToDo/History (filesystem-based), mcp/ (konfiguracja), secrets/ (lokalne klucze), awesome-copilot/ (1371 plików).  
**Konsekwencje:** Każdy workspace startuje z tą samą bazą. Po skopiowaniu użytkownik wypełnia metadata w workspace.spec.json i dodaje swoje MCP serwery. Dashboard działa od razu (standalone HTML).  
**Alternatywy:** (1) Yeoman generator — zbyt skomplikowane dla prostego kopiowania. (2) Git submodule — problemy z zagnieżdżeniem w istniejących repo. (3) npm init template — zależność od Node.js.

---

### ADR-002: Integracja awesome-copilot jako lokalna kopia
**Data:** 2026-03-19  
**Status:** accepted  
**Kontekst:** GitHub awesome-copilot zawiera 1371 plików (skille, agenty, instrukcje, pluginy, hooki) przydatnych w każdym projekcie. Online wymaga internetu, submodule komplikuje setup.  
**Decyzja:** Pełna kopia awesome-copilot w `.workspace_meta/awesome-copilot/` — 14 kategorii: agents (177), skills (456), instructions (176), plugins (343), hooks (13), cookbook (71), workflows (7), docs (7), eng (18), website (72), scripts (1), .github (21), .schemas (3), .vscode (3).  
**Konsekwencje:** Działa offline. Wymaga ręcznej aktualizacji gdy upstream się zmieni. Duży rozmiar folderu (~1400 plików), ale .gitignore powinien to wykluczać z commitów.  
**Alternatywy:** (1) Submodule git — automatyczne update, ale komplikuje `Copy-Item`. (2) Symlink — szybki, ale nie przenośny między maszynami.

---

### ADR-003: Definition_of_done.html jako standalone dashboard
**Data:** 2026-03-19  
**Status:** accepted  
**Kontekst:** Potrzebna wizualna kontrolka postępów projektu — DoD checklist, todo, skills overview — bez zależności od Node/npm.  
**Decyzja:** Standalone HTML z localStorage + opcjonalnym File System Access API. 90+ skilli w 16 kategoriach. Zero zależności — otwiera się w przeglądarce.  
**Konsekwencje:** Działa na każdej maszynie bez instalacji. Dane w localStorage (per-browser). File System Access API (Chrome/Edge) pozwala na zapis plików do ToDo/ i History/.  
**Alternatywy:** (1) Electron app — overkill. (2) Markdown-only — brak interaktywności. (3) VS Code extension — tied do jednego editora.
