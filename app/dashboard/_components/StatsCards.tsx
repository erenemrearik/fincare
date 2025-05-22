"use client";

import { GetBalanceStatsResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { UserSettings } from "@prisma/client";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CountUp from 'react-countup';

interface Props {
    userSettings: UserSettings
    from: Date
    to: Date
}

function StatsCards({ userSettings, from, to }: Props) {
    const [stats, setStats] = useState<GetBalanceStatsResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [from, to]);

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency);
    }, [userSettings.currency]);

    const income = stats?.income || 0;
    const expense = stats?.expense || 0;

    const balance = income - expense;

    return (
        <div className="relative flex flex-wrap w-full md:flex-nowrap gap-2">
            <SkeletonWrapper isLoading={isLoading}>
                <StatsCard
                    formatter={formatter}
                    value={income}
                    title={"Gelir"}
                    icon={<TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />}
                />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={isLoading}>
                <StatsCard
                    formatter={formatter}
                    value={expense}
                    title={"Gider"}
                    icon={<TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />}
                />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={isLoading}>
                <StatsCard
                    formatter={formatter}
                    value={balance}
                    title={"Bakiye"}
                    icon={<Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />}
                />
            </SkeletonWrapper>
        </div>
    )
}

export default StatsCards;

function StatsCard({ formatter, value, title, icon }: {
    formatter: Intl.NumberFormat
    value: number
    title: string
    icon: React.ReactNode
}) {
    const formatFn = useCallback((value: number) => {
        return formatter.format(value);
    }, [formatter])

    return (
        <Card className="flex h-24 w-full items-center gap-2 p-4">
            {icon}
            <div className="flex flex-col items-start gap-0">
                <p className=" text-muted-foreground">{title}</p>
                <CountUp
                    preserveValue
                    redraw={false}
                    end={value}
                    decimals={2}
                    formattingFn={formatFn}
                    className="text-2xl"
                />
            </div>
        </Card>
    )
}