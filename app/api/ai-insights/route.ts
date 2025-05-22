import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "*";
const MODEL_NAME = "gemini-2.0-flash"; 

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const { data, transactionData, type, currency } = await request.json();

    if (!Array.isArray(data) || !Array.isArray(transactionData)) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı" },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      const fallbackInsights = generateSmartDummyInsights(type, currency, data, transactionData);
      return NextResponse.json({ insights: fallbackInsights });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    
    try {
      const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const models = await result.json();
    } catch (listError) {
    }
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Prompt hazırlama
    let prompt = "";
    if (type === 'monthly') {
      // Aylık rapor için prompt
      prompt = `Sen bir finans ve bütçe danışmanısın. Aşağıdaki aylık finansal verileri analiz et ve kullanıcıya özel tavsiyeler sun.
      
      Aylık Özet Verileri:
      ${JSON.stringify(data, null, 2)}
      
      İşlem Detayları:
      ${JSON.stringify(transactionData, null, 2)}
      
      Para Birimi: ${currency}
      
      Lütfen aşağıdaki formatta bir analiz yap:
      1. Harcama ve gelir trendlerini analiz et
      2. En yüksek harcama kategorilerini belirle
      3. Tasarruf fırsatlarını belirle
      4. Kullanıcıya özel tavsiyeler sun
      
      Cevabını markdown formatında ## ve ### başlıklar kullanarak düzenle. Her madde için "-" işareti kullan.`;
    } else {
      // Günlük rapor için prompt
      prompt = `Sen bir finans ve bütçe danışmanısın. Aşağıdaki günlük finansal verileri analiz et ve kullanıcıya özel tavsiyeler sun.
      
      Günlük Özet Verileri:
      ${JSON.stringify(data, null, 2)}
      
      İşlem Detayları:
      ${JSON.stringify(transactionData, null, 2)}
      
      Para Birimi: ${currency}
      
      Lütfen aşağıdaki formatta bir analiz yap:
      1. Günlük harcamaları analiz et
      2. Gelir gider dengesini kontrol et
      3. Günün finansal alışkanlıklarını değerlendir
      4. Kullanıcıya özel günlük bütçeleme tavsiyeleri sun
      
      Cevabını markdown formatında ## ve ### başlıklar kullanarak düzenle. Her madde için "-" işareti kullan.`;
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const insights = text;
      
      return NextResponse.json({ insights });
    } catch (apiError) {
      const fallbackInsights = generateSmartDummyInsights(type, currency, data, transactionData);
      return NextResponse.json({ insights: fallbackInsights });
    }
  } catch (error) {
    
    try {
      const { data, transactionData, type, currency } = await request.json();
      const fallbackInsights = generateSmartDummyInsights(type, currency, data, transactionData);
      return NextResponse.json({ insights: fallbackInsights });
    } catch (fallbackError) {
      return NextResponse.json({ error: "AI önerileri oluşturulurken bir hata oluştu" }, { status: 500 });
    }
  }
}

function generateSmartDummyInsights(type: string, currency: string, data: any[], transactionData: any[]) {
  if (type === 'monthly') {
    // Veri analizi
    const totalIncome = data.reduce((sum, item) => sum + (item.gelir || 0), 0);
    const totalExpense = data.reduce((sum, item) => sum + (item.gider || 0), 0);
    const netBalance = totalIncome - totalExpense;
    const savingRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    
    // Kategori analizi
    const categoryExpenses = new Map();
    transactionData.forEach(transaction => {
      if (transaction.type === 'expense') {
        const current = categoryExpenses.get(transaction.category) || 0;
        categoryExpenses.set(transaction.category, current + transaction.amount);
      }
    });
    
    const topCategories = Array.from(categoryExpenses.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    const topCategoriesList = topCategories.map(([category, amount]) => 
      `- ${category}: ${parseFloat(amount.toString()).toFixed(2)} ${currency} (${((amount / totalExpense) * 100).toFixed(0)}%)`
    ).join('\n');
    
    // İçerik oluşturma
    return `## Aylık Finansal Analiz

Finansal verilerinizi analiz ettim ve şu önemli noktaları tespit ettim:

### Gelir-Gider Dengesi
- Toplam gelir: ${parseFloat(totalIncome.toString()).toFixed(2)} ${currency}
- Toplam gider: ${parseFloat(totalExpense.toString()).toFixed(2)} ${currency}
- Net bakiye: ${parseFloat(netBalance.toString()).toFixed(2)} ${currency}
- Tasarruf oranı: %${parseFloat(savingRate.toString()).toFixed(1)}

### En Yüksek Harcama Kategorileri
${topCategoriesList || "- Henüz kategori analizi için yeterli veri yok."}

### Finansal Öneriler
${netBalance >= 0 ? 
  `- Bu ayki pozitif bakiyenizi acil durum fonuna aktarabilirsiniz.
- Uzun vadeli finansal hedefleriniz için düzenli yatırım planı oluşturun.
- Gelirinizin %20'sini tasarruf, %50'sini temel ihtiyaçlar, %30'unu keyfi harcamalar için ayırmayı hedefleyin.` :
  `- En yüksek harcama kategorinizi gözden geçirerek tasarruf fırsatları arayın.
- Gereksiz aboneliklerinizi iptal ederek aylık sabit giderlerinizi azaltın.
- Gelecek ay için günlük harcama limiti belirleyerek bütçe açığınızı kapatmayı hedefleyin.`
}

### Gelecek Ay İçin Aksiyon Planı
- Harcamalarınızı kategorilere göre izleyin ve her kategori için bir bütçe limiti belirleyin.
- Beklenmedik harcamalar için küçük bir acil durum fonu oluşturun (yaklaşık ${parseFloat((totalIncome * 0.1).toString()).toFixed(0)} ${currency}).
- Parasal hedeflerinizi somut ve ölçülebilir hale getirin.`;
  } else {
    // Günlük rapor
    const totalDailyIncome = transactionData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalDailyExpense = transactionData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const dailyBalance = totalDailyIncome - totalDailyExpense;
    
    // Harcama kategorileri
    const expenseCategories = transactionData
      .filter(t => t.type === 'expense')
      .map(t => t.category);
    
    const uniqueCategories = [...new Set(expenseCategories)];
    
    // Kategori bazlı harcama
    const categoryExpenses = new Map();
    transactionData.filter(t => t.type === 'expense').forEach(transaction => {
      const current = categoryExpenses.get(transaction.category) || 0;
      categoryExpenses.set(transaction.category, current + transaction.amount);
    });
    
    const topDailyExpense = Array.from(categoryExpenses.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
      
    return `## Günlük Finansal Analiz

Bugünkü finansal hareketlerinizi analiz ettim:

### Bugünün Özeti
- Toplam gelir: ${parseFloat(totalDailyIncome.toString()).toFixed(2)} ${currency}
- Toplam gider: ${parseFloat(totalDailyExpense.toString()).toFixed(2)} ${currency}
- Net bakiye: ${parseFloat(dailyBalance.toString()).toFixed(2)} ${currency}

${totalDailyExpense > 0 ? 
  `### Harcama Dağılımı
${topDailyExpense.map(([category, amount]) => 
  `- ${category}: ${parseFloat(amount.toString()).toFixed(2)} ${currency} (${((amount / totalDailyExpense) * 100).toFixed(0)}%)`
).join('\n')}` : 
  "### Harcama Dağılımı\n- Bugün herhangi bir harcama kaydı bulunmuyor."}

### Günlük Finansal Tavsiyeler
${transactionData.length === 0 ? 
  "- Henüz bugün için işlem kaydı bulunmuyor. Finansal durumunuzu takip etmek için tüm gelir ve giderlerinizi kaydedin." :
  totalDailyExpense === 0 ? 
    "- Bugün herhangi bir harcama yapmadınız, bu finansal disiplininiz için olumlu bir gösterge!" :
    dailyBalance >= 0 ? 
      `- Bugün pozitif bir nakit akışı sağladınız, tebrikler!
- Bugünkü tasarrufunuzu aylık tasarruf hedefinize ekleyin.
- En yüksek harcama kaleminiz ${topDailyExpense[0]?.[0] || "bilinmiyor"} kategorisinde olmuş.` :
      `- Bugün harcamalarınız gelirinizi aşmış, günü negatif bakiye ile kapatıyorsunuz.
- Yarın için daha sıkı bir harcama planı yapmanızı öneririm.
- Acil olmayan alışverişleri ertelemeyi düşünün.`
}

### Finansal Alışkanlık İpuçları
- Harcama yapmadan önce "Bu gerçekten ihtiyacım mı yoksa anlık bir istek mi?" diye kendinize sorun.
- Küçük günlük harcamaları takip edin, bunlar zamanla büyük tutarlara ulaşabilir.
- Nakit yerine kart kullanmak harcamalarınızı daha kolay takip etmenizi sağlar.`;
  }
}