(function () {
  "use strict";

  // English lives in index.html; this table only holds the Turkish strings.
  var tr = {
    "skip": "İçeriğe geç",
    "nav.tour": "Tur",
    "nav.run": "Kurulum",
    "nav.github": "GitHub",
    "hero.title": "Paranın nereye gittiğini gör.",
    "hero.lede": "Fincare açık kaynaklı bir kişisel finans takip uygulaması. Gelir ve giderlerini kendi belirlediğin kategorilerle kaydet, faturalarını ve birikim hedeflerini takip et, Gemini'nin önerileriyle aylık raporlar al.",
    "hero.cta": "GitHub'da incele",
    "hero.cta2": "Bilgisayarında çalıştır",
    "hero.note": "Ücretsiz ve MIT lisanslı. Arayüz şimdilik Türkçe.",
    "tour.title": "Uygulamada bir tur",
    "tour.lede": "Bunlar örnek verilerle çalışan uygulamanın ekran görüntüleri.",
    "t1.title": "Her işlem, kendi kategorilerinde",
    "t1.body": "Gelir ya da gider eklerken tutarı, tarihi, bir notu ve kendi oluşturduğun emojili kategoriyi seç. Tablo kategoriye ve türe göre sıralanıp filtrelenebilir, CSV olarak dışa aktarılabilir.",
    "t2.title": "Fatura ve abonelikler, vadesi gelmeden",
    "t2.body": "Haftalık, aylık ya da yıllık faturaları, abonelikleri ve düzenli gelirleri takip et. Ayrı görünümler yaklaşan ve gecikmiş ödemeleri gösterir.",
    "t3.title": "Takip edebileceğin hedefler",
    "t3.body": "Hedef tutarı ve tarihi olan aylık, yıllık ya da birikim hedefleri koy, ilerlemeni güncelle ve ne kadar kaldığını gör.",
    "t4.title": "Raporlar ve ikinci bir görüş",
    "t4.body": "Sütun, çizgi ve pasta grafikli günlük ve aylık raporlar. Grafikleriyle birlikte PDF'e ya da CSV'ye aktar. Gemini dönemi inceler ve nerede tasarruf edebileceğini gösterir.",
    "t4.link": "Örnek PDF raporu aç",
    "t5.title": "Senin para birimin, senin kategorilerin",
    "t5.body": "USD, EUR, GBP, JPY, INR ya da TRY seç, gelir ve gider kategorilerini yönet, açık ve koyu tema arasında geçiş yap.",
    "run.title": "Kendi bilgisayarında çalıştır",
    "run.lede": "Node.js 20 veya üzeri, bir PostgreSQL veritabanı ve ücretsiz bir Clerk uygulaması gerekiyor. Gemini anahtarı isteğe bağlı.",
    "run.copy": "Kopyala",
    "run.copied": "Kopyalandı",
    "stack.app": "Uygulama",
    "stack.ui": "Arayüz",
    "stack.data": "Veri",
    "stack.auth": "Giriş",
    "stack.ai": "Yapay zekâ",
    "close.title": "Bir bitirme projesi olarak başladı. Bir ürüne dönüşüyor.",
    "close.body": "Fincare açık olarak geliştiriliyor. İşine yaradıysa GitHub'da bir yıldız, başkalarının da onu bulmasına yardım eder. Issue ve pull request'lere açığız.",
    "close.cta": "Fincare'e GitHub'da yıldız ver",
    "close.cta2": "Issue aç",
    "footer.license": "MIT Lisansı",
    "footer.by": "Geliştiren:",
    "title": "Fincare: kişisel finans takibi"
  };

  var nodes = document.querySelectorAll("[data-i18n]");
  var en = { title: document.title, "run.copied": "Copied" };
  nodes.forEach(function (el) { en[el.getAttribute("data-i18n")] = el.textContent; });
  var strings = { en: en, tr: tr };
  var current = "en";

  function apply(lang) {
    current = lang;
    var table = strings[lang];
    nodes.forEach(function (el) {
      var value = table[el.getAttribute("data-i18n")];
      if (value) el.textContent = value;
    });
    document.title = table.title;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-lang") === lang));
    });
    try { localStorage.setItem("fincare-lang", lang); } catch (e) { /* storage unavailable */ }
  }

  var saved = null;
  try { saved = localStorage.getItem("fincare-lang"); } catch (e) { /* storage unavailable */ }
  var fromUrl = new URLSearchParams(location.search).get("lang");
  var initial = fromUrl === "tr" || fromUrl === "en" ? fromUrl : saved;
  if (initial === "tr") apply("tr");

  document.querySelectorAll("[data-lang]").forEach(function (button) {
    button.addEventListener("click", function () { apply(button.getAttribute("data-lang")); });
  });

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    var timer;
    button.addEventListener("click", function () {
      var text = document.getElementById(button.getAttribute("data-copy")).textContent;
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        button.textContent = strings[current]["run.copied"];
        clearTimeout(timer);
        timer = setTimeout(function () { button.textContent = strings[current]["run.copy"]; }, 1600);
      });
    });
  });
})();
