"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { Period, Timeframe } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { GetHistoryDataReturnType } from "@/app/api/history-data/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";

// Geçmiş verileri gösteren ana bileşen
function History({ userSettings }: { userSettings: UserSettings }) {

    // Dönem ve zaman aralığı state'leri
    const [timeframe, setTimeframe] = useState<Timeframe>("month");
    const [period, setPeriod] = useState<Period>({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });
    const [historyData, setHistoryData] = useState<GetHistoryDataReturnType>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Para birimine göre formatlayıcı
    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency)
    }, [userSettings.currency]);

    // Seçilen dönem değiştiğinde verileri API'den çek
    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`)
            .then(res => res.json())
            .then(data => {
                setHistoryData(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                setHistoryData([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [timeframe, period]);

    // Veri olup olmadığını kontrol et
    const dataAvailable = historyData && historyData.length > 0;

    return (
        <div className="container">
            <h2 className="mt-12 text-3xl font-bold">
                Geçmiş
            </h2>
            <Card className=" col-span-12 mt-2 w-full">
                <CardHeader className="gap-2">
                    <CardTitle className="grid grid-flow-row justify-between md:grid-flow-col gap-2">
                        {/* Dönem seçici bileşeni */}
                        <HistoryPeriodSelector
                            period={period}
                            setPeriod={setPeriod}
                            timeframe={timeframe}
                            setTimeframe={setTimeframe}
                        />

                        {/* Gelir ve gider için renkli badge'ler */}
                        <div className="flex h-10 gap-2">
                            <Badge className="flex items-center gap-2 text-sm" variant={"outline"}>
                                <div className="h-4 w-4 rounded-full bg-emerald-500">
                                </div>
                                Gelir
                            </Badge>
                            <Badge className="flex items-center gap-2 text-sm" variant={"outline"}>
                                <div className="h-4 w-4 rounded-full bg-red-500">
                                </div>
                                Gider
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Yükleniyor ise iskelet ekranı göster */}
                    <SkeletonWrapper isLoading={isLoading}>
                        {
                            !dataAvailable && (
                                // Veri yoksa kullanıcıya bilgi ver
                                <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                                    Seçilen dönem için veri yok.
                                    <p className="text-sm text-muted-foreground">
                                        Farklı bir dönem seçmeyi veya yeni işlemler eklemeyi deneyin.
                                    </p>
                                </Card>
                            )
                        }

                        {
                            dataAvailable && (
                                // Grafik gösterimi
                                <ResponsiveContainer
                                    width={"100%"}
                                    height={300}
                                >
                                    <BarChart
                                        height={300}
                                        data={historyData}
                                        barCategoryGap={5}
                                    >
                                        {/* Bar renkleri için gradient tanımları */}
                                        <defs>
                                            <linearGradient
                                                id="incomeBar"
                                                x1={"0"}
                                                y1={"0"}
                                                x2={"0"}
                                                y2={"1"}
                                            >
                                                <stop
                                                    offset={"0"}
                                                    stopColor="#10b981"
                                                    stopOpacity={"1"}
                                                />
                                                <stop
                                                    offset={"1"}
                                                    stopColor="#10b981"
                                                    stopOpacity={"0"}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="expenseBar"
                                                x1={"0"}
                                                y1={"0"}
                                                x2={"0"}
                                                y2={"1"}
                                            >
                                                <stop
                                                    offset={"0"}
                                                    stopColor="#ef4444"
                                                    stopOpacity={"1"}
                                                />
                                                <stop
                                                    offset={"1"}
                                                    stopColor="#ef4444"
                                                    stopOpacity={"0"}
                                                />
                                            </linearGradient>
                                        </defs>

                                        {/* Grafik grid çizgileri */}
                                        <CartesianGrid
                                            strokeDasharray={"5 5"}
                                            strokeOpacity={"0.2"}
                                            vertical={false}
                                        />

                                        {/* X ekseni: gün veya ay ismi */}
                                        <XAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            padding={{ left: 5, right: 5 }}
                                            dataKey={(data) => {
                                                const { year, month, day } = data;
                                                const date = new Date(year, month, day || 1);
                                                if (timeframe === "year") {
                                                    return date.toLocaleString("tr-TR", {
                                                        month: "long"
                                                    });
                                                }

                                                return date.toLocaleString("tr-TR", {
                                                    day: "2-digit"
                                                });
                                            }}
                                        />

                                        {/* Y ekseni: tutar */}
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        {/* Gelir barı */}
                                        <Bar
                                            dataKey={"income"}
                                            label="Gelir"
                                            fill="url(#incomeBar)"
                                            radius={4}
                                            className=" cursor-pointer"
                                        />

                                        {/* Gider barı */}
                                        <Bar
                                            dataKey={"expense"}
                                            label="Gider"
                                            fill="url(#expenseBar)"
                                            radius={4}
                                            className=" cursor-pointer"
                                        />

                                        {/* Özelleştirilmiş tooltip */}
                                        <Tooltip
                                            cursor={{ opacity: 0.1 }}
                                            content={props => (
                                                <CustomToolTip
                                                    formatter={formatter}
                                                    {...props}
                                                />
                                            )}
                                        />

                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        }

                    </SkeletonWrapper>
                </CardContent>
            </Card>
        </div>
    )
}

export default History;

// Grafik üzerindeki tooltip içeriği
function CustomToolTip({ active, payload, formatter }: any) {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const { expense, income } = data;
    return (
        <div className=" min-w-[300px] rounded border bg-background p-4">
            {/* Gider satırı */}
            <TooltipRow
                formatter={formatter}
                label="Gider"
                value={expense}
                bgColor="bg-red-500"
                textColor="text-red-500"
            />

            {/* Gelir satırı */}
            <TooltipRow
                formatter={formatter}
                label="Gelir"
                value={income}
                bgColor="bg-emerald-500"
                textColor="text-emerald-500"
            />

            {/* Bakiye satırı */}
            <TooltipRow
                formatter={formatter}
                label="Bakiye"
                value={income - expense}
                bgColor="bg-gray-100"
                textColor="text-foreground"
            />

        </div>
    )
}

// Tooltip'te gösterilen satır bileşeni
function TooltipRow({
    label, value, bgColor, textColor, formatter
}: {
    label: string;
    value: number;
    bgColor: string;
    textColor: string;
    formatter: Intl.NumberFormat;
}) {

    // Sayı formatlama fonksiyonu
    const forattingFn = useCallback((value: number) => {
        return formatter.format(value)
    }, [formatter])

    return (
        <div className="flex items-center gap-2">
            {/* Renkli nokta */}
            <div className={cn("h-4 w-4 rounded-full", bgColor)} />
            <div className="flex w-full justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className={cn("text-sm font-bold", textColor)}>
                    <CountUp
                        duration={0.5}
                        preserveValue
                        end={value}
                        decimals={0}
                        formattingFn={forattingFn}
                        className="text-sm"
                    />
                </div>
            </div>
        </div>
    )
}