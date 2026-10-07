<div align="center">

<picture>
  <source srcset="public/logos/logo-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="public/logos/logo-light.png" media="(prefers-color-scheme: light)">
  <img src="public/logos/logo-light.png" alt="Fincare" width="220">
</picture>

### Yapay zekâ destekli kişisel finans takibi

[English](README.md) · **Türkçe**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-green.svg)](LICENSE)

</div>

Fincare, kişisel gelir ve giderlerinizi takip etmeniz için geliştirilmiş bir web uygulamasıdır. İşlemlerinizi kendi oluşturduğunuz kategorilerle kaydeder, düzenli fatura ve aboneliklerinizi izler, birikim hedefleri koyar; günlük ve aylık raporlarınızı grafiklerle görüp PDF veya CSV olarak dışa aktarırsınız. Raporlar sayfasındaki Google Gemini tabanlı asistan, harcamalarınızı inceleyip nerede tasarruf edebileceğinizi önerir.

> [!NOTE]
> Fincare bir üniversite bitirme projesi olarak başladı ve artık bir ürüne dönüştürülmek üzere geliştiriliyor. Arayüz şu an **Türkçe**; İngilizce desteği [yol haritasında](#yol-haritası).

<picture>
  <source srcset="docs/screenshots/dashboard-dark.png" media="(prefers-color-scheme: dark)">
  <img src="docs/screenshots/dashboard.png" alt="Fincare kontrol paneli">
</picture>

## İçindekiler

- [Özellikler](#özellikler)
- [Ekran görüntüleri](#ekran-görüntüleri)
- [Teknolojiler](#teknolojiler)
- [Mimari](#mimari)
- [Veri modeli](#veri-modeli)
- [Kurulum](#kurulum)
- [Proje yapısı](#proje-yapısı)
- [Yol haritası](#yol-haritası)
- [Lisans](#lisans)

## Özellikler

| | Özellik | Ne işe yarar |
|---|---|---|
| 📝 | **Gelir ve gider takibi** | Tutar, tarih, açıklama ve kendi oluşturduğunuz emojili bir kategoriyle işlem ekleyin. |
| 📊 | **Kontrol paneli** | En fazla 90 günlük herhangi bir tarih aralığı için gelir, gider ve bakiye kartları, kategori dağılımları ve pasta grafik. |
| 📈 | **Geçmiş** | Gelir ve giderlerin aylık ve yıllık sütun grafikleri. |
| 🔎 | **İşlem tablosu** | Kategoriye ve türe göre sıralama ve filtreleme, kolon seçimi, CSV'ye aktarma. |
| 🔁 | **Fatura ve abonelikler** | Haftalık, aylık veya yıllık tekrarlayan kalemler; yaklaşan ve gecikmiş görünümleri. |
| 🎯 | **Hedefler** | Aylık, yıllık ve birikim hedefleri; ilerlemenizi güncelleyip hedefe ne kadar kaldığını görün. |
| 🧾 | **Raporlar** | Sütun, çizgi ve pasta grafikli günlük ve aylık raporlar; grafikleriyle birlikte PDF'e veya CSV'ye aktarma. |
| 🤖 | **Yapay zekâ önerileri** | Gemini, rapor dönemini analiz edip tasarruf önerileri sunar. Yapay zekâ servisine ulaşılamazsa kural tabanlı öneriler gösterilir. |
| 💱 | **Para birimi** | Kurulum sihirbazında USD, EUR, GBP, JPY, INR veya TRY seçin; sonradan Ayarlar'dan değiştirin. |
| 🌗 | **Açık ve koyu tema** | Açık, koyu ve sistem teması arasında geçiş yapın. |
| 🔐 | **Kimlik doğrulama** | Kayıt, giriş ve oturum yönetimi Clerk ile. |

## Ekran görüntüleri

| Karşılama sayfası | İşlemler |
|---|---|
| ![Karşılama sayfası](docs/screenshots/home-page.png) | ![İşlemler](docs/screenshots/transaction.png) |
| **Fatura ve abonelikler** | **Hedefler** |
| ![Faturalar](docs/screenshots/bills.png) | ![Hedefler](docs/screenshots/goals-1.png) |
| **Raporlar** | **Kategoriler ve ayarlar** |
| ![Raporlar](docs/screenshots/reports.png) | ![Ayarlar](docs/screenshots/manage.png) |

Koyu tema dahil diğer ekran görüntüleri [`docs/screenshots`](docs/screenshots) klasöründe. [Örnek bir aylık PDF raporu](docs/samples/monthly-report-sample.pdf) da inceleyebilirsiniz.

## Teknolojiler

| Katman | Teknoloji |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router), [React 18](https://react.dev/), TypeScript |
| Arayüz | [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/) üzerine [shadcn/ui](https://ui.shadcn.com/), [Lucide](https://lucide.dev/) ikonları, [Emoji Mart](https://github.com/missive/emoji-mart) |
| Grafikler | [Recharts](https://recharts.org/) |
| Form ve doğrulama | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| Veri | [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/) |
| Kimlik doğrulama | [Clerk](https://clerk.com/) |
| Yapay zekâ | [Google Gemini](https://ai.google.dev/) (`@google/generative-ai`) |
| Dışa aktarma | [pdfmake](http://pdfmake.org/), [html2canvas](https://html2canvas.hertzen.com/), [export-to-csv](https://github.com/alexcaza/export-to-csv) |

## Mimari

```mermaid
flowchart LR
    U[Tarayıcı] -->|sayfalar| SC[Server Components<br/>app/**/page.tsx]
    U -->|fetch| RH[Route handler'lar<br/>app/api/*]
    U -->|Server Actions| SA[Action'lar<br/>app/**/_actions]
    MW[Clerk middleware] -.->|/dashboard'u korur| SC
    SC --> P[(Prisma Client)]
    RH --> P
    SA --> P
    P --> DB[(PostgreSQL)]
    RH -->|AI önerileri| G[Google Gemini API]
```

- **Okumalar** `app/api` altındaki route handler'lardan (istatistik, geçmiş, kategoriler, tekrarlayan işlemler, AI önerileri) ve Server Component'lerden geçer.
- **Yazmalar** Server Action'larla (işlemler, kategoriler, hedefler, para birimi) ve `recurring-transactions` route handler'ı ile yapılır.
- **Özet tablolar**: her işlem, aynı veritabanı transaction'ı içinde günlük (`MonthHistory`) ve aylık (`YearHistory`) özet tablolarını da günceller; böylece geçmiş grafikleri tüm işlem listesini taramaz.
- **Yetkilendirme**: Clerk middleware `/dashboard`'u korur; her handler ve action oturumdaki kullanıcıyı kontrol eder ve sorguları `userId` ile filtreler.

## Veri modeli

Veritabanı PostgreSQL, yönetim Prisma ile. Şema [`prisma/schema.prisma`](prisma/schema.prisma) dosyasında.

| Tablo | Amacı |
|---|---|
| `UserSettings` | Her kullanıcının para birimi tercihi. |
| `Category` | Kullanıcının tanımladığı, emoji ikonlu gelir ve gider kategorileri. |
| `Transaction` | Tek tek gelir ve gider kayıtları. |
| `MonthHistory` | Kullanıcı bazında günlük gelir ve gider toplamları (aylık grafikler için). |
| `YearHistory` | Kullanıcı bazında aylık gelir ve gider toplamları (yıllık grafikler için). |
| `RecurringTransaction` | Tekrarlayan fatura, abonelik ve gelirler: sıklık, bir sonraki ödeme tarihi ve isteğe bağlı bitiş tarihi. |
| `Goal` | Hedef tutarı, mevcut ilerlemesi ve hedef tarihi olan finansal hedefler. |

## Kurulum

### Gereksinimler

- [Node.js](https://nodejs.org/) 20 LTS veya üzeri
- PostgreSQL 14 veya üzeri (yerel kurulum, Docker ya da Neon, Supabase, Vercel Postgres gibi bir servis)
- Ücretsiz bir [Clerk](https://clerk.com/) uygulaması
- *(İsteğe bağlı)* Gemini için bir [Google AI Studio](https://aistudio.google.com/app/apikey) API anahtarı

### 1. Klonlayın ve bağımlılıkları yükleyin

```bash
git clone https://github.com/erenemrearik/fincare.git
cd fincare
npm install
```

`npm install`, `postinstall` betiği üzerinden `prisma generate` komutunu da çalıştırır.

### 2. Ortam değişkenlerini ayarlayın

```bash
cp .env.example .env
```

`.env` dosyasını doldurun:

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `POSTGRES_PRISMA_URL` | ✅ | Uygulamanın çalışırken kullandığı bağlantı adresi (pooled olabilir). |
| `POSTGRES_URL_NON_POOLING` | ✅ | Prisma Migrate'in kullandığı doğrudan bağlantı adresi. Yerel veritabanında yukarıdakiyle aynı değeri verin. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk paneli → API Keys. |
| `CLERK_SECRET_KEY` | ✅ | Clerk paneli → API Keys. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | `/sign-up` |
| `GEMINI_API_KEY` | ➖ | AI önerileri için Gemini API anahtarı. Verilmezse kural tabanlı öneriler gösterilir. |
| `GEMINI_MODEL` | ➖ | Kullanılacak Gemini modeli. Varsayılan: `gemini-3.6-flash`. |

Docker ile yerel bir PostgreSQL başlatmak için:

```bash
docker run --name fincare-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fincare -p 5432:5432 -d postgres:16
```

Bu kurulumun bağlantı adresi: `postgresql://postgres:postgres@localhost:5432/fincare?schema=public`.

### 3. Veritabanı şemasını oluşturun

```bash
npx prisma migrate deploy
```

### 4. Uygulamayı çalıştırın

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini açın, bir hesap oluşturun ve kurulum sihirbazında para biriminizi seçin.

### Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır. |
| `npm run build` | Production build'i oluşturur. |
| `npm run start` | Production build'i çalıştırır. |
| `npm run lint` | ESLint'i çalıştırır. |
| `npx prisma studio` | Veritabanını tarayıcıda görüntüleyip düzenlemenizi sağlar (port 5555). |

## Proje yapısı

```text
fincare/
├── app/
│   ├── (auth)/          # Clerk giriş ve kayıt sayfaları
│   ├── api/             # Route handler'lar: istatistik, geçmiş, kategoriler, tekrarlayan işlemler, AI
│   ├── dashboard/       # Oturum açmış kullanıcı alanı: özet, işlemler, faturalar, hedefler, raporlar, ayarlar
│   ├── wizard/          # İlk girişteki para birimi kurulumu
│   ├── layout.tsx       # Kök layout ve provider'lar
│   └── page.tsx         # Karşılama sayfası
├── components/          # Ortak bileşenler (components/ui: shadcn/ui bileşenleri)
├── hooks/               # İstemci hook'ları
├── lib/                 # Prisma istemcisi, yardımcılar, para birimleri, ortak tipler
├── schema/              # Zod doğrulama şemaları
├── prisma/              # Prisma şeması ve migration'lar
├── public/              # Statik dosyalar (logolar, mockup)
├── docs/                # Ekran görüntüleri, örnek rapor, README görselleri
└── middleware.ts        # Clerk ile rota koruması
```

## Yol haritası

- [ ] Tekrarlayan fatura ve gelirlerin vadesi gelince otomatik kaydedilmesi
- [ ] Mevcut işlemleri düzenleme
- [ ] Kategori bazında aylık bütçe ve uyarılar
- [ ] Birden fazla para biriminde işlem ve döviz kuru desteği
- [ ] Banka ekstresini CSV'den içe aktarma
- [ ] İngilizce arayüz (i18n)
- [ ] Otomatik testler ve CI
- [ ] Telefona kurulabilen uygulama (PWA)

## Lisans

[MIT Lisansı](LICENSE) ile yayımlanmıştır.

## Geliştirici

**Eren Emre Arık** · [GitHub](https://github.com/erenemrearik)

Fincare'i faydalı bulduysanız repoya bir ⭐ bırakmanız çok makbule geçer.
