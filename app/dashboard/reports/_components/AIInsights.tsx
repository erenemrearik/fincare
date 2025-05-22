"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AIInsightsProps {
  data: any[];
  transactionData: any[];
  type: "daily" | "monthly";
  currency: string;
}

export default function AIInsights({ data, transactionData, type, currency }: AIInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Rate limit ayarları: günlük, 6 saatlik ve 24 saatlik sınırlar
  const RATE_LIMITS = {
    perDay: 3,
    per6Hours: 1,
    per24Hours: 4,
    interval6Hours: 6 * 60 * 60 * 1000,
    interval24Hours: 24 * 60 * 60 * 1000,
  };
  const STORAGE_KEY = `aiinsights-rate-${type}`;

  // Kullanıcı AI önerisi alabilir mi kontrolü
  function canCallAI() {
    if (typeof window === 'undefined') return true;
    const now = Date.now();
    let calls: number[] = [];
    try {
      calls = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {}
    calls = calls.filter(ts => now - ts < RATE_LIMITS.interval24Hours);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const callsToday = calls.filter(ts => new Date(ts).toISOString().slice(0, 10) === todayStr);
    if (callsToday.length >= RATE_LIMITS.perDay) {
      setRateLimitError('Günlük AI önerisi limiti aşıldı (3/3). Lütfen yarın tekrar deneyin.');
      return false;
    }
    const lastCall = calls.length > 0 ? Math.max(...calls) : 0;
    if (now - lastCall < RATE_LIMITS.interval6Hours) {
      setRateLimitError('AI önerisi en fazla 6 saatte bir alınabilir. Lütfen daha sonra tekrar deneyin.');
      return false;
    }
    if (calls.length >= RATE_LIMITS.per24Hours) {
      setRateLimitError('24 saatlik AI önerisi limiti aşıldı (4/4). Lütfen daha sonra tekrar deneyin.');
      return false;
    }
    setRateLimitError(null);
    return true;
  }

  // AI çağrısı kaydını localStorage'a ekle
  function recordAICall() {
    if (typeof window === 'undefined') return;
    let calls: number[] = [];
    try {
      calls = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {}
    calls.push(Date.now());
    calls = calls.slice(-10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
  }

  // AI önerisi oluşturma fonksiyonu (API'den veya fallback ile)
  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (transactionData.length === 0 && data.length === 0) {
        setInsights("Yeterli veri yok. AI önerileri için daha fazla işlem kaydı ekleyin.");
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          transactionData,
          type,
          currency
        }),
      });

      if (!response.ok) {
        throw new Error('API endpoint error');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setInsights(result.insights);
    } catch (err) {
      
      generateFallbackInsights();
    } finally {
      setIsLoading(false);
    }
  };

  // API başarısız olursa fallback öneri üretici
  const generateFallbackInsights = () => {
    try {
      let aiResponse = '';
      
      if (type === "monthly") {
        const totalIncome = data.reduce((sum, item) => sum + (item.gelir || 0), 0);
        const totalExpense = data.reduce((sum, item) => sum + (item.gider || 0), 0);
        const netBalance = totalIncome - totalExpense;
        
        const expenseByCategory = new Map();
        transactionData.forEach(transaction => {
          if (transaction.type === 'expense') {
            const current = expenseByCategory.get(transaction.category) || 0;
            expenseByCategory.set(transaction.category, current + transaction.amount);
          }
        });
        
        const sortedExpenses = Array.from(expenseByCategory.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        aiResponse = `## Aylık Finansal Analiz\n\n`;
        
        if (netBalance >= 0) {
          aiResponse += `Bu ay ${netBalance.toFixed(2)} ${currency} net kazanç sağladınız. Bu olumlu bir finansal durumdur! 👍\n\n`;
        } else {
          aiResponse += `Bu ay ${Math.abs(netBalance).toFixed(2)} ${currency} kadar harcamalarınız gelirlerinizi aştı. Bütçenizi gözden geçirmeniz önerilir. ⚠️\n\n`;
        }
        
        if (sortedExpenses.length > 0) {
          aiResponse += `### En Çok Harcama Yapılan Kategoriler:\n`;
          sortedExpenses.forEach(([category, amount], index) => {
            aiResponse += `${index + 1}. ${category}: ${amount.toFixed(2)} ${currency}\n`;
          });
          
          aiResponse += `\n### Öneriler:\n`;
          
          if (netBalance < 0) {
            aiResponse += `- En yüksek harcama kategoriniz olan "${sortedExpenses[0][0]}" için bir bütçe limiti belirlemeyi düşünün.\n`;
            aiResponse += `- Gereksiz aboneliklerinizi gözden geçirin ve ihtiyaç duymadıklarınızı iptal edin.\n`;
            aiResponse += `- Gelecek ay için bir tasarruf hedefi belirleyin.\n`;
          } else {
            aiResponse += `- Tasarruf oranınızı artırmak için aylık gelirinizin %20'sini bir tasarruf hesabına aktarmayı düşünün.\n`;
            aiResponse += `- Acil durum fonunuz için düzenli birikim yapın.\n`;
            aiResponse += `- Uzun vadeli yatırım fırsatlarını değerlendirin.\n`;
          }
        } else {
          aiResponse += `Bu ay için yeterli veri bulunmuyor. Daha detaylı öneriler için işlemlerinizi düzenli olarak kaydedin.`;
        }
      } else {
        const totalIncome = transactionData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactionData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        aiResponse = `## Günlük Finansal Analiz\n\n`;
        
        if (transactionData.length === 0) {
          aiResponse += `Bugün için işlem kaydı bulunmuyor. Finansal hareketlerinizi takip etmek için gün içinde yaptığınız tüm işlemleri kaydetmenizi öneririz.`;
        } else {
          if (totalExpense > 0) {
            const expenseCategories = transactionData
              .filter(t => t.type === 'expense')
              .map(t => t.category);
            
            const uniqueCategories = [...new Set(expenseCategories)];
            
            aiResponse += `Bugün toplam ${totalExpense.toFixed(2)} ${currency} harcama yaptınız`;
            
            if (uniqueCategories.length > 0) {
              aiResponse += ` ve bu harcamalar ${uniqueCategories.join(', ')} kategorilerinde gerçekleşti.\n\n`;
            } else {
              aiResponse += `.\n\n`;
            }
            
            if (totalIncome > 0) {
              const ratio = (totalExpense / totalIncome) * 100;
              aiResponse += `Günlük gelir-gider oranınız: %${ratio.toFixed(0)}. `;
              
              if (ratio > 100) {
                aiResponse += `Bugün harcamalarınız gelirinizi aştı. Gününüzü bütçe açığı ile kapatmamak için harcamalarınızı gözden geçirin.\n\n`;
              } else if (ratio > 75) {
                aiResponse += `Bugün gelirlerinizin büyük bir kısmını harcadınız. Gününüzü biraz daha tasarruflu geçirmeyi düşünebilirsiniz.\n\n`;
              } else {
                aiResponse += `Tebrikler! Bugün dengeli bir finansal gün geçirdiniz.\n\n`;
              }
            }
            
            aiResponse += `### Günlük Finansal İpuçları:\n`;
            aiResponse += `- Küçük günlük harcamaları takip edin, zamanla büyük tutarlara ulaşabilirler.\n`;
            aiResponse += `- İhtiyaç ve istek arasındaki farkı düşünün - her alışveriş öncesi kendinize "Buna gerçekten ihtiyacım var mı?" diye sorun.\n`;
            aiResponse += `- Nakit yerine kart kullanmak harcamalarınızı daha kolay takip etmenizi sağlar.\n`;
          } else {
            aiResponse += `Bugün herhangi bir harcama kaydınız bulunmuyor. Tüm harcamalarınızı kaydettiğinizden emin olun. Günlük nakit akışınızı takip etmek finansal sağlığınız için önemlidir.`;
          }
        }
      }
      
      setInsights(aiResponse);
    } catch (err) {
      setError("AI önerileri oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  };

  // AI öneri metnini biçimlendirip render eden yardımcı fonksiyon
  const renderInsights = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let bulletBuffer: React.ReactNode[] = [];
    const flushBullets = () => {
      if (bulletBuffer.length > 0) {
        elements.push(
          <ul className="list-disc pl-6 mb-2" key={elements.length}>
            {bulletBuffer.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        );
        bulletBuffer = [];
      }
    };
    lines.forEach((line, index) => {
      if (/^\*\*? /.test(line)) {
        const isBold = line.startsWith("**");
        const content = line.replace(/^\*\*?\s*/, "");
        bulletBuffer.push(isBold ? <b>{content}</b> : content);
      } else {
        flushBullets();
        if (line.startsWith('## ')) {
          elements.push(<h2 key={index} className="text-xl font-bold mb-3">{line.replace('## ', '')}</h2>);
        } else if (line.startsWith('### ')) {
          elements.push(<h3 key={index} className="text-lg font-semibold mt-3 mb-2">{line.replace('### ', '')}</h3>);
        } else if (line.startsWith('- ')) {
          elements.push(
            <div key={index} className="flex items-start gap-2 mb-1">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
              <p>{line.replace('- ', '')}</p>
            </div>
          );
        } else if (line.trim() === '') {
          elements.push(<div key={index} className="h-2" />);
        } else {
          elements.push(<p key={index} className="mb-2">{line}</p>);
        }
      }
    });
    flushBullets();
    return elements;
  };

  // Hata varsa uyarı göster
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // AI önerisi oluşturma butonu handler'ı
  const handleGenerateInsights = () => {
    if (!canCallAI()) return;
    recordAICall();
    generateInsights();
  };

  // Günlük kullanım ve kalan hak hesaplama
  let dailyUsed = 0;
  if (typeof window !== 'undefined') {
    try {
      const calls = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      dailyUsed = calls.filter((ts: number) => new Date(ts).toISOString().slice(0, 10) === todayStr).length;
    } catch {}
  }
  const dailyLimit = RATE_LIMITS.perDay;
  const dailyLeft = Math.max(0, dailyLimit - dailyUsed);
  const progressValue = (dailyUsed / dailyLimit) * 100;

  // Bileşen arayüzü: limit uyarısı, kalan hak, öneriler ve buton
  return (
    <div className="space-y-4">
      <Alert variant="default">
        <AlertDescription>
          <b>AI önerisi limiti:</b> Günlük <b>3</b> hakkınız var. Her <b>6 saatte bir</b> yeni hak kazanırsınız.
        </AlertDescription>
      </Alert>
      <div className="flex flex-col gap-2 items-center mb-2">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>Kalan günlük kullanım</span>
          <span>{dailyLeft} / {dailyLimit}</span>
        </div>
        <Progress value={100 - progressValue} indicator="bg-gradient-to-r from-emerald-400 to-emerald-600" className="h-2 rounded-full w-full" />
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="w-full h-6" />
          <Skeleton className="w-full h-20" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-full h-16" />
        </div>
      ) : (
        <>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {insights ? renderInsights(insights) : <p>Henüz AI önerisi alınmadı.</p>}
          </div>
          {rateLimitError && (
            <Alert variant="destructive">
              <AlertDescription>{rateLimitError}</AlertDescription>
            </Alert>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={handleGenerateInsights}
            disabled={isLoading || !!rateLimitError}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {insights ? 'Önerileri Yenile' : 'AI Önerilerini Getir'}
          </Button>
        </>
      )}
    </div>
  );
}