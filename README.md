<picture>
  <source srcset="https://github.com/erenemrearik/fincare/blob/main/public/logos/logo-dark.png?raw=true" media="(prefers-color-scheme: dark)">
  <source srcset="https://github.com/erenemrearik/fincare/blob/main/public/logos/logo-light.png?raw=true" media="(prefers-color-scheme: light)">
  <img src="https://github.com/erenemrearik/fincare/blob/main/public/logos/logo-light.png?raw=true" alt="Fincare Logo" width="200">
</picture>

---

[![Next.js](https://img.shields.io/badge/Next.js-15-blue?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](https://clerk.dev/)
[![AI Powered](https://img.shields.io/badge/AI-Gemini-FFB300?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**FINCARE**, kullanıcıların kişisel finans yönetimini kolaylaştıran, kullanıcı dostu ve modern
bir gider takip uygulamasıdır. Uygulama sayesinde kullanıcılar, günlük gelir ve giderlerini
hızlı ve pratik bir şekilde kaydedebilirler.

Projede, Gemini AI API'si kullanılarak bağlanan gelişmiş yapay zekâ algoritmalarıyla
desteklenen bir finans danışmanına sahiptir. Bu akıllı asistan, kullanıcıların finansal verilerini
analiz ederek kişiselleştirilmiş önerilerde bulunur ve potansiyel tasarruf alanlarını işaret eder.
Kullanıcılar, harcama alışkanlıklarını daha iyi anlayarak, finansal hedeflerine ulaşma
konusunda daha bilinçli ve stratejik kararlar alabilirler.

[![FINCARE Ekran Görüntüleri](https://img.shields.io/badge/FINCARE%20Ekran%20G%C3%B6r%C3%BCnt%C3%BCleri-blue?style=for-the-badge)](https://github.com/erenemrearik/fincare/tree/main/fincare-images)

## Veritabanı
**FINCARE** projesinde veritabanı olarak *PostgreSQL* tercih edilmiş ve *Prisma ORM* ile yönetilmiştir.

| Tablo Adı              | Açıklama                                                                 |
|------------------------|--------------------------------------------------------------------------|
| **Category**           | Gelir ve giderler için kullanıcıya özel kategori tanımlarını tutar.      |
| **Goal**               | Kullanıcıların finansal hedeflerini ve bu hedeflere ulaşma sürecini takip eder. |
| **MonthHistory**       | Kullanıcının günlük ve aylık bazda gelir/gider özetlerini tutar.         |
| **YearHistory**        | Kullanıcının aylık ve yıllık bazda gelir/gider özetlerini tutar.         |
| **RecurringTransaction** | Otomatik olarak yinelenen gelir ve gider işlemlerini tutar.             |
| **Transaction**        | Kullanıcıların yaptığı tüm gelir ve gider işlemlerini takip eder.        |
| **UserSettings**       | Kullanıcıya özel ayarları (para birimi) saklar.                          |

## Temel Özellikler
**FINCARE**, kullanıcı dostu arayüzü ve güçlü altyapısıyla finansal yönetimi kolaylaştırır.

| Özellik              | Açıklama                                                                                     |
|----------------------|-----------------------------------------------------------------------------------------------|
| 📝 **Gelir/Gider Takibi**     | Gelir ve giderlerinizi hızlıca kaydedin, kategorilere ayırarak bütçenizi etkili şekilde yönetin.     |
| 📊 **Gelişmiş Raporlar**      | Günlük, aylık analizler; grafik destekli görselleştirme ve PDF/CSV formatlarında dışa aktarım.      |
| 🎯 **Hedef Belirleme**        | Kısa ve uzun vadeli finansal hedefler oluşturun, ilerlemenizi takip ederek motivasyonunuzu artırın.  |
| 🔁 **Düzenli İşlemler**       | Abonelikler, faturalar ve tekrarlayan işlemler için otomatik kayıt ve hatırlatma sistemi.            |
| 🤖 **AI Destekli Analiz**     | Yapay zeka ile harcama alışkanlıklarını analiz edin, tasarruf ve yatırım önerileri alın.              |
| 🌙 **Karanlık Mod**           | Hem karanlık hem aydınlık tema seçenekleriyle konforlu kullanıcı deneyimi.                           |
| 🔒 **Güvenli Giriş**          | Clerk altyapısıyla şifreleme destekli, güvenli ve modern kimlik doğrulama sistemi.                    |

## Kullanılan Teknolojiler
**FINCARE**, modern web teknolojileriyle inşa edilmiştir. Performans, güvenlik ve kullanıcı deneyimi ön planda tutularak geliştirilen bu yapıda; frontend, backend ve veri işleme katmanları için güçlü çözümler kullanılmıştır.

| Teknoloji                      | Açıklama                                                                                     |
|-------------------------------|----------------------------------------------------------------------------------------------|
| **Next.js 15 & React 18**     | Sunucu tarafı ve istemci tarafı rendering desteğiyle hızlı ve SEO-dostu web uygulaması.     |
| **Prisma ORM & PostgreSQL**   | Tip güvenli veri işlemleri ve güçlü ilişkisel veritabanı altyapısıyla yüksek veri tutarlılığı. |
| **Clerk**                     | Modern, güvenli ve özelleştirilebilir kullanıcı kimlik doğrulama ve oturum yönetimi.         |
| **Tailwind CSS**              | Bileşen tabanlı, duyarlı ve sade arayüzler için düşük kod maliyetli CSS framework'ü.         |
| **Recharts**                  | Etkileşimli, özelleştirilebilir grafik bileşenleriyle dinamik veri görselleştirme.           |
| **pdfmake & PapaParse**       | PDF ve CSV formatlarında dışa aktarım işlemleri için güçlü ve esnek JavaScript kütüphaneleri. |
| **Google Gemini AI**          | Harcama analizleri ve öneriler için entegre edilmiş yapay zeka destekli veri işleme.        |
| **Radix UI & Lucide Icons**   | Erişilebilirlik öncelikli bileşenler ve modern, hafif ikon setleriyle kullanıcı deneyimi.   |
| **Emoji Mart**                | Kategoriler için özelleştirilebilir, kullanıcı dostu emoji seçim arayüzü.                   |

## Kurulum

### 1. Depoyu Klonlayın
Projenin GitHub reposunu klonlayarak yerel makinenize alın:
```
git clone https://github.com/kullaniciadi/fincare.git
cd fincare
```
> kullaniciadi kısmını kendi GitHub kullanıcı adınızla değiştirin (örnek: erenemrearik).

### 2. Gerekli Bağımlılıkları Yükleyin
Proje dizininde aşağıdaki komutu çalıştırarak tüm paketleri yükleyin:
```
npm install
```

### 3. Ortam Değişkenlerini Tanımlayın
Proje kök dizinine ``.env.local`` veya ``.env`` adında bir dosya oluşturun ve aşağıdaki gibi ortam değişkenlerini girin:
```
DATABASE_URL="postgresql://demo_user:demo_pass@localhost:5432/fincaredb"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_demoClerkPublicKey123"
CLERK_SECRET_KEY="sk_test_demoClerkSecretKey456"

NEXT_PUBLIC_CLERK_SIGN_IN_URL="https://demo.clerk.dev/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="https://demo.clerk.dev/sign-up"

POSTGRES_PRISMA_URL="postgresql://demo_user:demo_pass@localhost:5432/fincaredb?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://demo_user:demo_pass@localhost:5432/fincaredb?connection_limit=1"

GEMINI_API_KEY="demo-gemini-api-key-789xyz"
```
> Not: Clerk ve veritabanı sistemine ait bilgileri almak için ilgili hizmetlerde hesap oluşturmanız gereklidir.

### 4. Veritabanını Kurun ve Migrasyonları Uygulayın
Prisma ile veritabanı şemasını oluşturmak ve migrasyonları uygulamak için şu komutu çalıştırın:
```
npx prisma migrate dev
```
> İlk çalıştırmada Prisma size bir migration adı soracaktır, örnek: init.

### 5. Debug Sunucusunu Başlatın

Projeyi başlatmak için aşağıdaki komutu kullanın:
```
npm run dev
```
> Bu komut Next.js sunucusunu çalıştırır ve projeniz genellikle http://localhost:3000 adresinde erişilebilir olur.

### 6. Veritabanını Görselleştirin (Opsiyonel)

Veritabanınızı grafiksel olarak görüntülemek ve düzenlemek için Prisma Studio'yu başlatabilirsiniz:
```
npx prisma studio
```
> Bu komut, tarayıcıda interaktif bir arayüz açar (genellikle http://localhost:5555).

