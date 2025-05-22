"use server";

import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


export async function DeleteTransaction(transactionId: string) {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    //işlem detaylarını al
    const txn = await prisma.transaction.findUnique({
        where: {
            userId: user.id,
            id: transactionId
        }
    });
    if (!txn) {
        throw new Error("geçersiz istek");
    }

    //veritabanı işlemini başlat
    await prisma.$transaction([
        //işlemi veritabanından sil
        prisma.transaction.delete({
            where: {
                userId: user.id,
                id: transactionId
            }
        }),

        //aylık geçmişi güncelle
        prisma.monthHistory.update({
            where: {
                day_month_year_userId: {
                    userId: user.id,
                    day: txn.date.getUTCDate(),
                    month: txn.date.getUTCMonth(),
                    year: txn.date.getUTCFullYear()
                }
            },
            data: {
                ...(txn.type === "expense" && {
                    expense: {
                        decrement: txn.amount
                    }
                }),
                ...(txn.type === "income" && {
                    income: {
                        decrement: txn.amount
                    }
                }),
            }
        }),

        //yıllık geçmişi güncelle
        prisma.yearHistory.update({
            where: {
                month_year_userId: {
                    userId: user.id,
                    month: txn.date.getUTCMonth(),
                    year: txn.date.getUTCFullYear()
                }
            },
            data: {
                ...(txn.type === "expense" && {
                    expense: {
                        decrement: txn.amount
                    }
                }),
                ...(txn.type === "income" && {
                    income: {
                        decrement: txn.amount
                    }
                }),
            }
        })

    ]);

}