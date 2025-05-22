"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import TransactionTable from "./_components/TransactionTable";

function TransactionPage() {
    const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
        from: startOfMonth(new Date),
        to: new Date()
    })
    return (
        <>
            <div className=" border-b bg-card">
                <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
                    <div>
                        <p className=" text-3xl font-bold">İşlem Geçmişi</p>
                    </div>
                    <DateRangePicker
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        showCompare={false}
                        onUpdate={(values) => {
                            const { from, to } = values.range;

                            //her iki tarih de seçili değilse tarih aralığını güncelleme
                            if (!from || !to) {
                                return;
                            }

                            //tarih aralığını doğrula
                            if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                                toast.error(`Seçilen tarih aralığı çok büyük. İzin verilen maksimum aralık ${MAX_DATE_RANGE_DAYS} gündür!`);
                                return;
                            }

                            setDateRange({ from, to });
                        }}
                    />
                </div>
            </div>

            <div className=" container">
                <TransactionTable from={dateRange.from} to={dateRange.to} />
            </div>
        </>
    )
}

export default TransactionPage;