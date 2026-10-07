import { endOfDay, startOfDay } from "date-fns"
import { Currencies } from "./currencies"


export function DateToUTCDate(date: Date) {
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds(),
        )
    )
}

// Tarih aralığını API sorgusu için hazırlar: aralık tam günleri kapsar ve
// tarihler ISO formatında gönderilir (Date.toString() içindeki "+" URL'de boşluğa dönüşüyordu)
export function DateRangeToQuery(from: Date, to: Date) {
    return new URLSearchParams({
        from: DateToUTCDate(startOfDay(from)).toISOString(),
        to: DateToUTCDate(endOfDay(to)).toISOString(),
    }).toString()
}


export function GetFormatterForCurrency(currency: string) {
    const locale = Currencies.find(c => c.value === currency)?.locale;

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency
    })
}