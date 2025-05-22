"use client";

import { getHistoryPeriodResponseType } from "@/app/api/history-periods/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Period, Timeframe } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react";


interface Props {
    period: Period;
    setPeriod: (period: Period) => void;
    timeframe: Timeframe;
    setTimeframe: (timeframe: Timeframe) => void;
}

function HistoryPeriodSelector({ period, setPeriod, timeframe, setTimeframe }: Props) {
    const [historyPeriods, setHistoryPeriods] = useState<getHistoryPeriodResponseType>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistoryPeriods = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/history-periods");
            const data = await response.json();
            setHistoryPeriods(data);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryPeriods();
    }, []);

    return (
        <div className="flex flex-wrap items-center gap-4">
            <SkeletonWrapper
                isLoading={isLoading}
                fullWidth={false}
            >
                <Tabs
                    value={timeframe}
                    onValueChange={(value) => setTimeframe(value as Timeframe)}
                >
                    <TabsList>
                        <TabsTrigger value="year">Yıl</TabsTrigger>
                        <TabsTrigger value="month">Ay</TabsTrigger>
                    </TabsList>
                </Tabs>
            </SkeletonWrapper>
            <div className="flex flex-wrap items-center gap-2">
                <SkeletonWrapper isLoading={isLoading} fullWidth={false}>
                    <YearSelector
                        period={period}
                        setPeriod={setPeriod}
                        years={historyPeriods}
                    />
                </SkeletonWrapper>


                {timeframe === "month" && (
                    <SkeletonWrapper isLoading={isLoading} fullWidth={false}>
                        <MonthSelector
                            period={period}
                            setPeriod={setPeriod}
                        />
                    </SkeletonWrapper>
                )}

            </div>
        </div>
    )
}

export default HistoryPeriodSelector;

function YearSelector({ period, setPeriod, years }: {
    period: Period;
    setPeriod: (period: Period) => void;
    years: getHistoryPeriodResponseType;
}) {
    return (
        <Select
            value={period.year.toString()}
            onValueChange={(value) => {
                setPeriod({
                    month: period.month,
                    year: parseInt(value)
                })
            }}>
            <SelectTrigger className="w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {
                    years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}
                        </SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
    )
}

function MonthSelector({ period, setPeriod }: {
    period: Period;
    setPeriod: (period: Period) => void;
}) {
    return (
        <Select
            value={period.month.toString()}
            onValueChange={(value) => {
                setPeriod({
                    month: parseInt(value),
                    year: period.year
                })
            }}>
            <SelectTrigger className="w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => {
                        const monthString = new Date(period.year, month, 1).toLocaleString("tr-TR", { month: "long" })
                        return (
                            <SelectItem key={month} value={month.toString()}>
                                {monthString}
                            </SelectItem>
                        )
                    })
                }
            </SelectContent>
        </Select>
    )
}