"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from "recharts";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { GetTransactionHistoryResponseType } from "@/app/api/transactions-history/route";
import { GetHistoryDataReturnType } from "@/app/api/history-data/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Calendar, Download, FileSpreadsheet, Lightbulb, LineChart as LineChartIcon, Scan, TrendingDown, TrendingUp } from "lucide-react";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { mkConfig, generateCsv, download } from "export-to-csv";
import AIInsights from "./_components/AIInsights";
import { UserSettings } from "@prisma/client";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";

function MonthlyReport({ userSettings }: { userSettings: UserSettings }) {
  // Ayın ilk ve son günü ile tarih aralığı başlatılır
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // State'ler: tarih aralığı, veri, yüklenme ve hata durumu
  const [dateRange, setDateRange] = useState({ from: firstDay, to: lastDay });
  const formatter = GetFormatterForCurrency(userSettings.currency);
  const [historyData, setHistoryData] = useState<GetHistoryDataReturnType>([]);
  const [transactionData, setTransactionData] = useState<GetTransactionHistoryResponseType>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Ay ve işlem verilerini API'den çek
  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);
    
    fetch(`/api/history-data?timeframe=month&year=${dateRange.from.getFullYear()}&month=${dateRange.from.getMonth()}`)
      .then(res => res.json())
      .then(data => {
        setHistoryData(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        setFetchError("Geçmiş veri alınamadı: " + (error?.message || error));
        setHistoryData([]);
      });
      
    fetch(`/api/transactions-history?from=${DateToUTCDate(dateRange.from)}&to=${DateToUTCDate(dateRange.to)}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            const msg = err?.error || 'API hatası';
            setFetchError(msg);
            return [];
          });
        }
        return res.json();
      })
      .then(data => {
        setTransactionData(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        setFetchError("İşlem verisi alınamadı: " + (error?.message || error));
        setTransactionData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dateRange]);

  // Grafik ve özet verileri hesapla
  const chartData = historyData.map(item => ({
    name: `Gün ${item.day || 0}`,
    gelir: item.income,
    gider: item.expense,
    bakiye: item.income - item.expense
  }));
  const totalIncome = chartData.reduce((sum, item) => sum + (item.gelir || 0), 0);
  const totalExpense = chartData.reduce((sum, item) => sum + (item.gider || 0), 0);
  const netBalance = totalIncome - totalExpense;

  // CSV dışa aktarma ayarları
  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
    filename: `Aylık_Rapor_${dateRange.from.toLocaleDateString('tr-TR')}`,
    fieldSeparator: ",",
  });

  // PDF dışa aktarma fonksiyonu
  const handleExportPDF = async (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (transactionData.length === 0 || fetchError) return;
    const pdfMake = await getPdfMake();
    const barChartImg = await getChartImage("#monthly-bar-chart");
    const lineChartImg = await getChartImage("#monthly-line-chart");
    const incomePieImg = await getChartImage("#monthly-income-pie");
    const expensePieImg = await getChartImage("#monthly-expense-pie");
    const logoBase64 = await getBase64ImageFromUrl(FINCARE_LOGO_URL);
    const body = [
      ["Tarih", "Tür", "Kategori", "Açıklama", "Tutar", "Para Birimi"],
      ...transactionData.map(row => [
        new Date(row.date).toLocaleDateString("tr-TR"),
        row.type === "income" ? "Gelir" : "Gider",
        row.category,
        row.description || "",
        row.amount,
        userSettings.currency
      ])
    ];
    const docDefinition = {
      content: [
        { image: logoBase64, width: 120, alignment: "center", margin: [0, 0, 0, 10] },
        { text: `Fincare - Aylık Finansal Rapor\n${dateRange.from.toLocaleDateString("tr-TR")}`, style: "header", alignment: "center" },
        { text: "\n" },
        {
          columns: [
            { width: "*", text: `Toplam Gelir: ${formatter.format(totalIncome)}` },
            { width: "*", text: `Toplam Gider: ${formatter.format(totalExpense)}` },
            { width: "*", text: `Net Bakiye: ${formatter.format(netBalance)}` },
          ],
          margin: [0, 0, 0, 10]
        },
        { text: "Aylık Gelir ve Gider Grafiği", style: "subheader" },
        barChartImg ? { image: barChartImg, width: 450, alignment: "center", margin: [0, 10, 0, 10] } : {},
        { text: "Net Bakiye Zaman Serisi", style: "subheader" },
        lineChartImg ? { image: lineChartImg, width: 350, alignment: "center", margin: [0, 10, 0, 10] } : {},
        { text: "Kategori Bazlı Gelir Dağılımı", style: "subheader" },
        incomePieImg ? { image: incomePieImg, width: 200, alignment: "center", margin: [0, 10, 0, 10] } : {},
        { text: "Kategori Bazlı Gider Dağılımı", style: "subheader" },
        expensePieImg ? { image: expensePieImg, width: 200, alignment: "center", margin: [0, 10, 0, 10] } : {},
        { text: "\nİşlem Listesi", style: "subheader" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "*", "auto", "auto"],
            body
          },
          layout: "lightHorizontalLines"
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, color: '#1e293b' },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 4], color: '#2563eb' }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };
    pdfMake.createPdf(docDefinition).download(`Fincare_Aylik_Rapor_${dateRange.from.toLocaleDateString("tr-TR")}.pdf`);
  };

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <b>Veri alınırken hata oluştu:</b> {fetchError}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Card className="w-full sm:w-auto">
          <CardHeader className="pb-2">
            <CardTitle>Tarih Aralığı</CardTitle>
            <CardDescription>Rapor için ay seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <DatePicker
                date={dateRange.from}
                onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                captionLayout="dropdown-buttons"
                fromYear={2020}
                toYear={2030}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full sm:w-auto flex-grow">
          <CardHeader className="pb-2">
            <CardTitle>Rapor Özeti</CardTitle>
            <CardDescription>Aylık finansal özet</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-md text-muted-foreground">Toplam Gelir</span>
              <span className="text-2xl font-bold text-emerald-500">{formatter.format(totalIncome)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-md text-muted-foreground">Toplam Gider</span>
              <span className="text-2xl font-bold text-red-500">{formatter.format(totalExpense)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-md text-muted-foreground">Net Bakiye</span>
              <span className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatter.format(netBalance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Aylık Gelir ve Gider Grafiği</CardTitle>
            <CardDescription>Günlük gelir ve gider dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <div id="monthly-bar-chart" style={{ width: '100%', height: '100%' }}>
              <SkeletonWrapper isLoading={isLoading}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatter.format(Number(value))} />
                      <Legend />
                      <Bar dataKey="gelir" name="Gelir" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="gider" name="Gider" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Bu aya ait veri bulunmuyor.</p>
                  </div>
                )}
              </SkeletonWrapper>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {/* PDF butonunda handleExportPDF fonksiyonunu çağırırken event parametresi gelirse engelle */}
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              disabled={transactionData.length === 0 || !!fetchError}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF olarak indir
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Net Bakiye Zaman Serisi</CardTitle>
            <CardDescription>Günlük net bakiye değişimi</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div id="monthly-line-chart" style={{ width: '100%', height: '100%' }}>
              <SkeletonWrapper isLoading={isLoading}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatter.format(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="bakiye" name="Net Bakiye" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Veri yok</p>
                  </div>
                )}
              </SkeletonWrapper>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Kategori Bazlı Gelir Dağılımı</CardTitle>
            <CardDescription>Bu ayki gelirlerin kategoriye göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div id="monthly-income-pie" style={{ width: '100%', height: '100%' }}>
              <SkeletonWrapper isLoading={isLoading}>
                {transactionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(transactionData.filter(t => t.type === 'income').reduce((acc: Record<string, number>, t) => {
                          acc[t.category] = (acc[t.category] || 0) + t.amount;
                          return acc;
                        }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#34d399"
                        label
                      />
                      <Tooltip formatter={(value) => formatter.format(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Gelir verisi yok</p>
                  </div>
                )}
              </SkeletonWrapper>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Kategori Bazlı Gider Dağılımı</CardTitle>
            <CardDescription>Bu ayki giderlerin kategoriye göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div id="monthly-expense-pie" style={{ width: '100%', height: '100%' }}>
              <SkeletonWrapper isLoading={isLoading}>
                {transactionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(transactionData.filter(t => t.type === 'expense').reduce((acc: Record<string, number>, t) => {
                          acc[t.category] = (acc[t.category] || 0) + t.amount;
                          return acc;
                        }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#f87171"
                        label
                      />
                      <Tooltip formatter={(value) => formatter.format(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Gider verisi yok</p>
                  </div>
                )}
              </SkeletonWrapper>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>AI Finansal Öneriler</CardTitle>
          </CardHeader>
          <CardContent>
            <AIInsights 
              data={chartData} 
              transactionData={transactionData} 
              type="monthly" 
              currency={userSettings.currency} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DailyReport({ userSettings }: { userSettings: UserSettings }) {
  // Seçili gün ve veri state'leri
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const formatter = GetFormatterForCurrency(userSettings.currency);
  const [transactionData, setTransactionData] = useState<GetTransactionHistoryResponseType>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Seçili günün başlangıç ve bitiş saatleri
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Günlük işlem verisini API'den çek
  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);
    const fromDate = startOfDay.toISOString();
    const toDate = endOfDay.toISOString();
    fetch(`/api/transactions-history?from=${fromDate}&to=${toDate}`)
      .then(res => res.json())
      .then(data => {
        setTransactionData(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        setFetchError("İşlem verisi alınamadı: " + (error?.message || error));
        setTransactionData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedDate]);

  // Günlük özet ve grafik verileri hesapla
  const income = transactionData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactionData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = income - expense;

  // Bar chart data: kategori bazlı gelir ve gider aynı objede
  const categories = Array.from(new Set(transactionData.map(t => t.category)));
  const barChartData = categories.map(category => ({
    name: category,
    Gelir: transactionData.filter(t => t.type === 'income' && t.category === category).reduce((sum, t) => sum + t.amount, 0),
    Gider: transactionData.filter(t => t.type === 'expense' && t.category === category).reduce((sum, t) => sum + t.amount, 0)
  }));

  // Pie chart data
  const incomePieData = Object.entries(
    transactionData.filter(t => t.type === 'income').reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  const expensePieData = Object.entries(
    transactionData.filter(t => t.type === 'expense').reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Net balance line chart
  let runningBalance = 0;
  const lineChartData = transactionData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t, i) => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount;
      return {
        name: `${new Date(t.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
        Bakiye: runningBalance
      };
    });

  // PDF dışa aktarma fonksiyonu
  const handleExportPDF = async () => {
    if (transactionData.length === 0 || fetchError) return;
    const pdfMake = await getPdfMake();
    const barChartImg = await getChartImage("#daily-bar-chart");
    const lineChartImg = await getChartImage("#daily-line-chart");
    const incomePieImg = await getChartImage("#daily-income-pie");
    const expensePieImg = await getChartImage("#daily-expense-pie");
    const logoBase64 = await getBase64ImageFromUrl(FINCARE_LOGO_URL);
    const body = [
      ["Tarih", "Tür", "Kategori", "Açıklama", "Tutar", "Para Birimi"],
      ...transactionData.map(row => [
        new Date(row.date).toLocaleDateString("tr-TR"),
        row.type === "income" ? "Gelir" : "Gider",
        row.category,
        row.description || "",
        row.amount,
        userSettings.currency
      ])
    ];
    const docDefinition = {
      content: [
        { image: logoBase64, width: 120, alignment: "center", margin: [0, 0, 0, 10] },
        { text: `Fincare - Günlük Finansal Rapor\n${selectedDate.toLocaleDateString("tr-TR")}`, style: "header", alignment: "center" },
        { text: "\n" },
        {
          columns: [
            { width: "*", text: `Toplam Gelir: ${formatter.format(income)}` },
            { width: "*", text: `Toplam Gider: ${formatter.format(expense)}` },
            { width: "*", text: `Net Bakiye: ${formatter.format(netBalance)}` },
          ],
          margin: [0, 0, 0, 10]
        },
        { text: "Günlük Gelir/Gider Dağılımı", style: "subheader" },
        barChartImg ? { image: barChartImg, width: 450, alignment: "center", margin: [0, 10, 0, 10] } : {},
        { text: "Net Bakiye Zaman Serisi", style: "subheader" },
        lineChartImg ? { image: lineChartImg, width: 350, alignment: "center", margin: [0, 10, 0, 10] } : {},
        { text: "Kategori Bazlı Gelir Dağılımı", style: "subheader" },
        incomePieImg ? { image: incomePieImg, width: 200, alignment: "center", margin: [0, 10, 0, 10] } : {},
        { text: "Kategori Bazlı Gider Dağılımı", style: "subheader" },
        expensePieImg ? { image: expensePieImg, width: 200, alignment: "center", margin: [0, 10, 0, 10] } : {},
        { text: "\nİşlem Listesi", style: "subheader" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "*", "auto", "auto"],
            body
          },
          layout: "lightHorizontalLines"
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, color: '#1e293b' },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 4], color: '#2563eb' }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };
    pdfMake.createPdf(docDefinition).download(`Fincare_Gunluk_Rapor_${selectedDate.toLocaleDateString("tr-TR")}.pdf`);
  };

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <b>Veri alınırken hata oluştu:</b> {fetchError}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Card className="w-full sm:w-auto">
          <CardHeader className="pb-2">
            <CardTitle>Tarih Seçimi</CardTitle>
            <CardDescription>Günlük rapor için tarih seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <DatePicker
              date={selectedDate}
              onSelect={date => date && setSelectedDate(date)}
              captionLayout="dropdown-buttons"
              fromYear={2020}
              toYear={2030}
            />
          </CardContent>
        </Card>
        <Card className="w-full sm:w-auto flex-grow">
          <CardHeader className="pb-2">
            <CardTitle>Günlük Özet</CardTitle>
            <CardDescription>Seçili günün finansal özeti</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-md text-muted-foreground">Toplam Gelir</span>
              <span className="text-2xl font-bold text-emerald-500">{formatter.format(income)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-md text-muted-foreground">Toplam Gider</span>
              <span className="text-2xl font-bold text-red-500">{formatter.format(expense)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-md text-muted-foreground">Net Bakiye</span>
              <span className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatter.format(netBalance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Günlük Gelir/Gider Dağılımı</CardTitle>
            <CardDescription>Kategori bazında gelir ve giderler</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <div id="daily-bar-chart" style={{ width: '100%', height: '100%' }}>
              <SkeletonWrapper isLoading={isLoading}>
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={value => formatter.format(Number(value))} />
                      <Legend />
                      <Bar dataKey="Gelir" fill="#34d399" />
                      <Bar dataKey="Gider" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Veri yok</p>
                  </div>
                )}
              </SkeletonWrapper>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={e => { e.preventDefault?.(); e.stopPropagation?.(); handleExportPDF(); }}
              disabled={transactionData.length === 0 || !!fetchError}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF olarak indir
            </Button>
          </CardFooter>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Net Bakiye Zaman Serisi</CardTitle>
            <CardDescription>Gün içi bakiye değişimi</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <div id="daily-line-chart" style={{ width: '100%', height: '100%' }}>
              <SkeletonWrapper isLoading={isLoading}>
                {lineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={value => formatter.format(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="Bakiye" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Veri yok</p>
                  </div>
                )}
              </SkeletonWrapper>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Kategori Bazlı Gelir Dağılımı</CardTitle>
            <CardDescription>Gelirlerin kategoriye göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <div id="daily-income-pie" style={{ width: '100%', height: '100%' }}>
              <SkeletonWrapper isLoading={isLoading}>
                {incomePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={incomePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#34d399" label />
                      <Tooltip formatter={value => formatter.format(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Gelir verisi yok</p>
                  </div>
                )}
              </SkeletonWrapper>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Kategori Bazlı Gider Dağılımı</CardTitle>
            <CardDescription>Giderlerin kategoriye göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <div id="daily-expense-pie" style={{ width: '100%', height: '100%' }}>
              <SkeletonWrapper isLoading={isLoading}>
                {expensePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expensePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#f87171" label />
                      <Tooltip formatter={value => formatter.format(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Gider verisi yok</p>
                  </div>
                )}
              </SkeletonWrapper>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>AI Finansal Öneriler</CardTitle>
          </CardHeader>
          <CardContent>
            <AIInsights
              data={lineChartData}
              transactionData={transactionData}
              type="daily"
              currency={userSettings.currency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  // Kullanıcı ayarları ve sekme state'leri
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("monthly");

  // Kullanıcı ayarlarını API'den çek
  useEffect(() => {
    async function fetchUserSettings() {
      try {
        const response = await fetch('/api/user-settings');
        const data = await response.json();
        setUserSettings(data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Raporlar</h1>
        <SkeletonWrapper isLoading={true}>
          <div className="h-96"></div>
        </SkeletonWrapper>
      </div>
    );
  }

  if (!userSettings) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Raporlar</h1>
        <Alert variant="destructive">
          <AlertTitle>Oturum hatası</AlertTitle>
          <AlertDescription>
            Kullanıcı bilgilerinize erişilemedi. Lütfen tekrar giriş yapın veya daha sonra tekrar deneyin.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Raporlar</h1>
      <p className="text-muted-foreground mb-8">
        Günlük ve aylık finansal raporlarınızı görüntüleyin, analiz edin ve dışa aktarın.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="monthly">
            <Calendar className="mr-2 h-4 w-4" />
            Aylık Rapor
          </TabsTrigger>
          <TabsTrigger value="daily">
            <Calendar className="mr-2 h-4 w-4" />
            Günlük Rapor
          </TabsTrigger>
        </TabsList>        <TabsContent value="monthly">
          <MonthlyReport userSettings={userSettings} />
        </TabsContent>
        <TabsContent value="daily">
          <DailyReport userSettings={userSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// PDF oluşturmak için pdfmake'i dinamik olarak yükler
const getPdfMake = async () => {
  if (typeof window === "undefined") throw new Error("pdfmake sadece client tarafında kullanılabilir");
  try {
    const pdfMakeModule = await import("pdfmake/build/pdfmake.js");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts.js");
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule;
    pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;
    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };
    return pdfMake;
  } catch (err) {
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule;
    pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;
    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };
    return pdfMake;
  }
};

const FINCARE_LOGO_URL = "/logos/logo-light.png";

// Logo görselini base64 olarak çeker
function getBase64ImageFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context alınamadı"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = function (event) {
      // event parametresi bazen string olabiliyor, güvenli kontrol ekle
      let errorType = '';
      if (event && typeof event === 'object' && 'type' in event) {
        errorType = (event as Event).type;
      } else if (typeof event === 'string') {
        errorType = event;
      }
      reject(new Error(`Görsel yüklenemedi: ${url}. Hata türü: ${errorType}`));
    };
    img.src = url;
  });
}

// Grafik görselini base64 olarak döndürür
async function getChartImage(selector: string): Promise<string> {
  const chart = document.querySelector(selector) as HTMLElement;
  if (!chart) throw new Error("Grafik bulunamadı: " + selector);
  const canvas = await html2canvas(chart, { background: "white" });
  return canvas.toDataURL("image/png");
}