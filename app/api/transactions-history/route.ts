import prisma from "@/lib/db";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// Tarih doğrulama şeması
const TransactionsHistorySchema = z.object({
  from: z.string().transform(val => new Date(val)),
  to: z.string().transform(val => new Date(val)),
});

export async function GET(request: Request) {
    let user;
    try {
        user = await currentUser();
    } catch (err: any) {
        if (err?.status === 429 || err?.clerkError) {
            return Response.json({ error: "Çok fazla istek yaptınız. Lütfen birkaç saniye sonra tekrar deneyin." }, { status: 429 });
        }
        return Response.json({ error: "Kimlik doğrulama hatası." }, { status: 401 });
    }
    if (!user) {
        redirect("/sign-in");
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // API isteklerinde tarihleri doğrulama
    const validationResult = TransactionsHistorySchema.safeParse({ from, to });
    
    if (!validationResult.success) {
        return Response.json(validationResult.error.errors, {
            status: 400
        });
    }

    const { from: fromDate, to: toDate } = validationResult.data;

    try {
        const transactions = await getTransactionHistory(user.id, fromDate, toDate);
        return Response.json(transactions);
    } catch (error) {
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}


export type GetTransactionHistoryResponseType = Awaited<ReturnType<typeof getTransactionHistory>>

async function getTransactionHistory(userId: string, from: Date, to: Date) {
    const userSettings = await prisma.userSettings.findUnique({
        where: {
            userId
        }
    });

    if (!userSettings) {
        throw new Error("Kullanıcı ayarları bulunamadı");
    }

    const formatter = GetFormatterForCurrency(userSettings.currency);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: {
                gte: from,
                lte: to
            }
        },
        orderBy: {
            date: "desc"
        }
    });

    return transactions.map((transaction) => ({
        ...transaction,
        formattedAmount: formatter.format(transaction.amount)
    }));
}