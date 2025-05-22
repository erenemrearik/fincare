"use client";

// Gerekli modüller ve tipler içe aktarılıyor
import { GetCategoriesStatsType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEffect, useMemo, useState } from "react";

interface Props {
    from: Date;
    to: Date;
    userSettings: UserSettings;
}

// Kategori bazlı gelir/gider istatistiklerini gösteren ana bileşen
function CategoriesStats({ from, to, userSettings }: Props) {
    // API'den çekilen veriler ve yüklenme durumu için state
    const [data, setData] = useState<GetCategoriesStatsType>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Tarih aralığı değiştiğinde verileri tekrar çek
    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
            .then(res => res.json())
            .then(responseData => {
                setData(responseData);
            })
            .catch(error => {
                setData([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [from, to]);

    // Kullanıcının para birimine göre formatlayıcı oluştur
    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency])

    // Gelir ve gider kartlarını göster
    return (
        <div className="flex flex-wrap w-full gap-2 md:flex-nowrap">
            <SkeletonWrapper isLoading={isLoading}>
                <CategoriesCard
                    formatter={formatter}
                    type="income"
                    data={data || []}
                />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={isLoading}>
                <CategoriesCard
                    formatter={formatter}
                    type="expense"
                    data={data || []}
                />
            </SkeletonWrapper>
        </div>
    )
}

export default CategoriesStats;

// Tek bir gelir veya gider kartı
function CategoriesCard({ formatter, type, data }: {
    formatter: Intl.NumberFormat
    type: TransactionType
    data: GetCategoriesStatsType
}) {
    // Sadece ilgili tipteki (gelir/gider) verileri filtrele
    const filteredData = data.filter(el => el.type === type);

    // Toplam tutarı hesapla
    const total = filteredData.reduce(
        (acc, el) => acc += el._sum?.amount || 0, 0);

    return (
        <Card className="h-80 w-full col-span-6">
            <CardHeader>
                <CardTitle
                    className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
                    {type === "income" ? "Gelirler" : "Giderler"} kategoriye göre
                </CardTitle>

                <div className="flex items-center justify-between gap-2">
                    {/* Veri yoksa kullanıcıya bilgi ver */}
                    {filteredData.length === 0 && (
                        <div className="flex flex-col justify-center items-center h-60 w-full">
                            Seçilen dönem için veri yok.
                            <p className="text-sm text-muted-foreground">
                                Farklı bir dönem seçmeyi veya yeni bir {type === "income" ? "gelir" : "gider"} eklemeyi deneyin
                            </p>
                        </div>
                    )}

                    {/* Veri varsa kategorileri listele */}
                    {filteredData.length > 0 && (
                        <ScrollArea className="h-60 w-full px-4">
                            <div className="flex flex-col w-full gap-4 p-4">
                                {filteredData.map(item => {
                                    const amount = item._sum.amount || 0;
                                    // Kategoriye göre yüzde hesapla
                                    const percentage = (amount * 100) / (total || amount);
                                    return (
                                        <div
                                            className="flex flex-col gap-2"
                                            key={item.category}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center text-gray-400">
                                                    {item.categoryIcon} {item.category}
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        (%{percentage.toFixed(0)})
                                                    </span>
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    {formatter.format(amount)}
                                                </span>
                                            </div>
                                            <Progress
                                                value={percentage}
                                                indicator={type === "income" ? "bg-emerald-500" : "bg-red-500"}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </CardHeader>
        </Card>
    )
}