"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { UserSettings } from "@prisma/client";
import { differenceInDays, startOfMonth, format } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import StatsCards from "./StatsCards";
import CategoriesStats from "./CategoriesStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { TrendingUp, TrendingDown, CalendarDays, AlertTriangle, PiggyBank, Target, CheckCircle2, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DateToUTCDate } from "@/lib/helpers";
import dynamic from "next/dynamic";

const PieChartComponent = dynamic(() => import('./PieChart'), { ssr: false });

// Ana özet bileşeni
function Overview({ userSettings }: { userSettings: UserSettings }) {
    const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date()
    });
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    // Para birimine göre formatlayıcı
    const formatter = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: userSettings?.currency || 'TRY'
    });

    // Pasta grafik için renk paleti
    const chartColors = [
        "#ef4444", // kırmızı
        "#10b981", // yeşil
        "#3b82f6", // mavi
        "#f59e42", // turuncu
        "#a855f7", // mor
        "#fbbf24", // sarı
        "#6366f1", // indigo
        "#14b8a6", // teal
        "#eab308", // amber
        "#f472b6", // pembe
    ];

    // Tarih aralığı değiştiğinde kategori verisini API'den çek
    useEffect(() => {
        setIsLoadingCategories(true);
        const fetchCategoryData = async () => {
            try {
                const response = await fetch(`/api/stats/categories?from=${DateToUTCDate(dateRange.from)}&to=${DateToUTCDate(dateRange.to)}`);
                if (!response.ok) {
                    setCategoryData([]);
                    return;
                }
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    // Geçerli ve sıfırdan büyük tutarlı kategorileri filtrele
                    const validData = data.filter(item =>
                        item &&
                        item.category &&
                        typeof item._sum?.amount === 'number' &&
                        !isNaN(item._sum.amount) &&
                        Math.abs(item._sum.amount) > 0
                    );
                    // Her kategoriye farklı renk ata
                    const transformedData = validData.map((item, idx) => ({
                        name: item.category,
                        value: Math.abs(item._sum.amount),
                        color: chartColors[idx % chartColors.length],
                        icon: item.categoryIcon,
                        type: item.type // gelir/gider
                    }));
                    // En yüksek 5 kategoriyi sırala ve al
                    const sortedData = transformedData.sort((a, b) => b.value - a.value).slice(0, 5);
                    setCategoryData(sortedData);
                } else {
                    setCategoryData([]);
                }
            } catch (error) {
                setCategoryData([]);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategoryData();
    }, [dateRange.from, dateRange.to]);

    // Kategori tipi için tooltip metni
    const getTooltip = (category: any) => {
        if (!category) return "";
        return category.type === "expense" ? "Gider" : "Gelir";
    };

    return (
        <>
            {/* Başlık ve tarih aralığı seçici */}
            <div className="flex flex-wrap items-end container justify-between gap-2 py-6">
                <h2 className="text-3xl font-bold">Genel Bakış</h2>
                <div className="flex items-center gap-3">
                    <DateRangePicker
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        showCompare={false}
                        onUpdate={(values) => {
                            const { from, to } = values.range;

                            if (!from || !to) {
                                return;
                            }

                            // Maksimum tarih aralığı kontrolü
                            if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                                toast.error(`Seçilen tarih aralığı çok büyük. İzin verilen maksimum aralık ${MAX_DATE_RANGE_DAYS} gündür!`);
                                return;
                            }

                            setDateRange({ from, to });
                        }}
                    />
                </div>
            </div>
            <div className="container flex w-full flex-col gap-6">
                {/* Genel istatistik kartları */}
                <StatsCards
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Kategori Dağılımı</h3>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard/reports">Detaylı Raporlar</Link>
                        </Button>
                    </div>

                    {/* Kategori dağılımı pasta grafik ve liste */}
                    <SkeletonWrapper isLoading={isLoadingCategories}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Kategoriler Arası Dağılım
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col md:flex-row items-center justify-between">
                                <div className="h-60 w-full md:w-1/2">
                                    {categoryData.length > 0 ? (
                                        // Pasta grafik gösterimi
                                        <PieChartComponent 
                                            data={categoryData}
                                            currency={userSettings.currency}
                                            getTooltip={getTooltip}
                                        />
                                    ) : (
                                        // Veri yoksa bilgilendirme
                                        <div className="flex h-full flex-col items-center justify-center">
                                            <PieChart className="h-12 w-12 text-muted-foreground mb-2" />
                                            <p className="text-center text-muted-foreground">
                                                Bu dönem için kategori verisi bulunamadı
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {/* Kategori isim ve tutar listesi */}
                                <div className="w-full md:w-1/2 space-y-2 mt-4 md:mt-0">
                                    {categoryData.map((category, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                    title={getTooltip(category)}
                                                />
                                                <span>{category.name}</span>
                                            </div>
                                            <span className="font-medium">{formatter.format(category.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </SkeletonWrapper>
                </div>

                {/* Kategori bazlı detaylı istatistikler */}
                <CategoriesStats
                    userSettings={userSettings}
                    from={dateRange.from}
                    to={dateRange.to}
                />
            </div>
        </>
    );
}

export default Overview;