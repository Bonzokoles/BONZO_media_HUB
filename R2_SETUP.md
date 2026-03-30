# Cloudflare R2 Setup - BONZO Media Hub Catalogs

Przewodnik konfiguracji Cloudflare R2 dla przechowywania dużych katalogów filmowych i muzycznych.

## 🎯 Po co R2?

### Problemy z current setup:
- ❌ Duże pliki HTML (~96KB) osadzone w build
- ❌ Wolniejsze buildy i deploymenty
- ❌ Trudniejsze cache'owanie
- ❌ Limity wielkości w Pages

### Zalety R2:
- ✅ Nieograniczona pojemność
- ✅ Szybkie CDN Cloudflare
- ✅ Darmowy egress (wychodzący transfer)
- ✅ Łatwe aktualizacje bez rebuild
- ✅ Lepsze cache'owanie

---

## 📦 Krok 1: Utwórz R2 Bucket

### 1.1 W Cloudflare Dashboard:

1. Zaloguj się do https://dash.cloudflare.com
2. Wybierz **R2** z menu bocznego
3. Kliknij **Create bucket**
4. Nazwa: `bonzo-media-hub`
5. Location: **Automatic** (lub wybierz region)
6. Kliknij **Create bucket**

### 1.2 Ustaw publiczny dostęp:

1. Otwórz bucket `bonzo-media-hub`
2. Przejdź do **Settings** tab
3. W sekcji **Public access**:
   - Kliknij **Allow Access**
   - Zapisz **Public R2.dev Subdomain** URL (np. `pub-xxxxxxxxxxxxx.r2.dev`)

> ⚠️ **Uwaga**: Publiczny dostęp pozwala na pobieranie plików bez autentykacji. Nie przechowuj wrażliwych danych!

---

## 🔑 Krok 2: Wygeneruj R2 API Token

### 2.1 Utwórz API Token:

1. W Cloudflare Dashboard → **R2**
2. Kliknij **Manage R2 API Tokens**
3. Kliknij **Create API Token**
4. Konfiguracja:
   - **Token name**: `bonzo-media-hub-upload`
   - **Permissions**: 
     - ✅ Object Read & Write
     - ✅ (opcjonalnie) Bucket List
   - **Bucket**: `bonzo-media-hub` (lub "Apply to all buckets")
5. Kliknij **Create API Token**

### 2.2 Zapisz credentials:

Po utworzeniu otrzymasz:
- **Access Key ID** (np. `abc123...`)
- **Secret Access Key** (np. `xyz789...`)
- **Account ID** (np. `a1b2c3d4e5f6...`)

> ⚠️ **Ważne**: Zapisz Secret Access Key - nie będzie ponownie pokazany!

---

## ⚙️ Krok 3: Konfiguracja lokalna

### 3.1 Utwórz plik `.env.local`:

W głównym katalogu projektu:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=twoj_account_id_tutaj
R2_ACCESS_KEY_ID=twoj_access_key_id_tutaj
R2_SECRET_ACCESS_KEY=twoj_secret_access_key_tutaj
R2_BUCKET_NAME=bonzo-media-hub
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

> 💡 Zastąp `xxxxxxxxxxxxx` swoim subdomain z kroku 1.2

### 3.2 Dodaj do `.gitignore`:

Upewnij się, że `.env.local` jest w `.gitignore`:

```gitignore
# Environment variables
.env.local
.env.*.local
```

---

## 📦 Krok 4: Instalacja zależności

```bash
npm install @aws-sdk/client-s3
```

---

## 🚀 Krok 5: Upload katalogów do R2

### 5.1 Najpierw wygeneruj katalog filmowy:

```bash
node scripts/generate-catalog-with-trailers.mjs
```

### 5.2 Upload do R2:

```bash
# Upload wszystkich katalogów
node scripts/upload-to-r2.mjs

# Lub tylko katalog filmowy
node scripts/upload-to-r2.mjs --film-catalog

# Lub tylko katalog muzyczny
node scripts/upload-to-r2.mjs --music-catalog
```

### 5.3 Weryfikacja:

Po udanym uploadzie zobaczysz:

```
✅ Uploaded in 234ms
🌐 URL: https://pub-xxxxxxxxxxxxx.r2.dev/catalogs/film-catalog.html
```

Otwórz URL w przeglądarce aby zweryfikować.

---

## 🔧 Krok 6: Konfiguracja w Cloudflare Workers

### 6.1 Dodaj zmienne środowiskowe w Workers:

1. Cloudflare Dashboard → **Workers & Pages**
2. Wybierz projekt `bonzo-media-hub`
3. **Settings** → **Environment variables**
4. **Production**:
   - Dodaj `R2_PUBLIC_URL` = `https://pub-xxxxxxxxxxxxx.r2.dev`
5. Kliknij **Save**

### 6.2 (Opcjonalnie) Bind R2 bucket do Worker:

Jeśli chcesz dostępu do R2 z Worker:

1. **Settings** → **Bindings**
2. **Add binding**
3. Type: **R2 Bucket**
4. Variable name: `R2_CATALOG_BUCKET`
5. R2 bucket: `bonzo-media-hub`
6. **Save**

---

## 💻 Krok 7: Aktualizacja aplikacji Next.js

### 7.1 Użyj wygenerowanego hooka:

Po uruchomieniu `upload-to-r2.mjs`, plik `lib/r2-catalog-urls.ts` jest automatycznie generowany:

```typescript
import { R2_CATALOG_URLS } from '@/lib/r2-catalog-urls';

// W komponencie
export default function FilmCatalog() {
  const catalogUrl = R2_CATALOG_URLS.filmCatalog.html;
  
  return (
    <iframe 
      src={catalogUrl}
      style={{ width: '100%', height: '100vh' }}
      title="Film Catalog"
    />
  );
}
```

### 7.2 Lub fetch JSON data:

```typescript
import { R2_CATALOG_URLS } from '@/lib/r2-catalog-urls';

export default async function FilmPage() {
  const response = await fetch(R2_CATALOG_URLS.filmCatalog.json);
  const catalog = await response.json();
  
  return (
    <div>
      <h1>{catalog.totalFilms} filmów</h1>
      {/* Render catalog data */}
    </div>
  );
}
```

### 7.3 Usuń duże pliki z public:

```bash
# Usuń stary katalog z public (teraz jest w R2)
rm public/katalog-filmowy.html
```

---

## 🔄 Krok 8: Workflow aktualizacji katalogów

### Typowy workflow:

```bash
# 1. Edytuj dane katalogu
nano components/features/films/data/catalog/catalog_with_tmdb.json

# 2. Regeneruj HTML
node scripts/generate-catalog-with-trailers.mjs

# 3. Upload do R2
node scripts/upload-to-r2.mjs --film-catalog

# 4. Rebuild i deploy (opcjonalnie, jeśli zmieniłeś kod)
npm run build
npx wrangler pages deploy .open-next/cloudflare --project-name=bonzo-media-hub
```

> 💡 **Bonus**: Aktualizacja katalogu w R2 **nie wymaga** rebuild aplikacji!

---

## 🌐 Custom Domain (opcjonalnie)

### Dodaj custom domain do R2 bucket:

1. R2 bucket → **Settings**
2. **Custom Domains**
3. **Connect Domain**
4. Wpisz: `catalogs.bonzo-media-hub.pages.dev` (lub własną domenę)
5. Cloudflare automatycznie skonfiguruje DNS

Teraz katalogi dostępne pod:
```
https://catalogs.bonzo-media-hub.pages.dev/catalogs/film-catalog.html
```

---

## 📊 Monitoring i zarządzanie

### Sprawdź storage usage:

1. Cloudflare Dashboard → **R2**
2. Bucket `bonzo-media-hub`
3. Zobacz **Storage** i **Requests** metrics

### Zarządzanie plikami:

```bash
# Lista plików w bucket
npx wrangler r2 object list bonzo-media-hub

# Pobierz plik
npx wrangler r2 object get bonzo-media-hub/catalogs/film-catalog.html

# Usuń plik
npx wrangler r2 object delete bonzo-media-hub/catalogs/film-catalog.html
```

---

## 🎨 Cache Configuration

### Headers ustawiane przez upload script:

```
Cache-Control: public, max-age=3600, s-maxage=86400
```

- **Browser cache**: 1 godzina
- **CDN cache**: 24 godziny

### Invalidate cache po update:

```bash
# Po upload nowej wersji, cache się odświeży automatycznie po 24h
# Lub użyj Cloudflare Purge Cache w Dashboard
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Użyj oddzielnych API tokenów dla dev/prod
- Rotuj API keys regularnie
- Ustaw TTL na tokenach (jeśli możliwe)
- Monitoruj request metrics

### ❌ DON'T:
- Nie commituj credentials do Git
- Nie udostępniaj Secret Access Key
- Nie przechowuj wrażliwych danych w publicznym bucket

---

## 🐛 Troubleshooting

### Problem: "Access Denied" przy upload

**Rozwiązanie**:
1. Sprawdź czy API token ma uprawnienia **Object Read & Write**
2. Sprawdź czy bucket name jest poprawny
3. Zweryfikuj Account ID

### Problem: Bucket nie istnieje

**Rozwiązanie**:
```bash
# Stwórz bucket przez CLI
npx wrangler r2 bucket create bonzo-media-hub
```

### Problem: 403 Forbidden przy dostępie do URL

**Rozwiązanie**:
1. Sprawdź czy public access jest włączony (Krok 1.2)
2. Sprawdź czy plik został poprawnie upload'owany
3. Sprawdź URL w przeglądarce incognito

### Problem: CORS errors

**Rozwiązanie**:
1. R2 bucket → **Settings** → **CORS policy**
2. Dodaj policy:
```json
[
  {
    "AllowedOrigins": ["https://bonzo-media-hub.pages.dev"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 💰 Pricing (ważne!)

### R2 Free Tier:
- ✅ **10 GB** storage (darmowe)
- ✅ **Unlimited** egress (wychodzący transfer)
- ✅ **1M** Class A operations/month (write, list)
- ✅ **10M** Class B operations/month (read)

### Twój usage (estymacja):
- **Film catalog HTML**: ~100 KB
- **Film catalog JSON**: ~500 KB
- **Music catalog JSON**: ~200 KB
- **Total**: ~800 KB (<<< 10 GB)

### Wniosek:
**🎉 R2 będzie całkowicie DARMOWE dla Twoich katalogów!**

---

## 📚 Dodatkowe zasoby

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/s3/)
- [Wrangler R2 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#r2)
- [AWS S3 SDK (R2 compatible)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

---

## ✅ Checklist

- [ ] Utworzono R2 bucket `bonzo-media-hub`
- [ ] Włączono public access
- [ ] Wygenerowano R2 API token
- [ ] Dodano credentials do `.env.local`
- [ ] Zainstalowano `@aws-sdk/client-s3`
- [ ] Wygenerowano katalog filmowy
- [ ] Upload'owano katalogi do R2
- [ ] Zaktualizowano aplikację do używania R2 URLs
- [ ] Usunięto duże pliki z `/public`
- [ ] Zrebuilowano i wdrożono aplikację
- [ ] Przetestowano dostęp do katalogów

---

**Ostatnia aktualizacja**: 2026-03-30  
**Status**: Ready for production 🚀