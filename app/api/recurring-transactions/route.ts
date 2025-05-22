import { PrismaClient } from '@prisma/client';
import { DateToUTCDate } from "@/lib/helpers";
import { currentUser } from "@clerk/nextjs/server";
import { addMonths, addWeeks, addYears, endOfMonth, format, getDate, getDay, setDate } from "date-fns";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const RecurringTransactionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık zorunludur"),
  amount: z.number().positive("Tutar pozitif olmalıdır"),
  description: z.string().optional(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Kategori zorunludur"),
  categoryIcon: z.string().min(1, "Kategori ikonu zorunludur"),
  frequency: z.enum(["weekly", "monthly", "yearly"]),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dayOfMonth: z.number().min(1).max(31).optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        nextDueDate: "asc",
      },
    });

    const formattedTransactions = recurringTransactions.map(transaction => ({
      ...transaction,
      startDate: transaction.startDate.toISOString(),
      nextDueDate: transaction.nextDueDate.toISOString(),
      endDate: transaction.endDate ? transaction.endDate.toISOString() : null,
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    return NextResponse.json(
      { error: "Tekrarlayan işlemleri alırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

function calculateNextDueDate(
  startDate: Date,
  frequency: string,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null
): Date {{ 
    startDate: startDate.toISOString(), 
    frequency, 
    dayOfMonth, 
    dayOfWeek 
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let nextDueDate = new Date(startDate);
  nextDueDate.setHours(0, 0, 0, 0);

  if (nextDueDate < today) {
    if (frequency === "monthly" && dayOfMonth) {
      let currentMonth = today.getMonth();
      let currentYear = today.getFullYear();
      
      if (today.getDate() >= dayOfMonth) {
        currentMonth += 1;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear += 1;
        }
      }
      
      nextDueDate = new Date(currentYear, currentMonth, dayOfMonth);
      
      if (dayOfMonth > 28) {
        const lastDayOfMonth = endOfMonth(new Date(currentYear, currentMonth));
        if (getDate(lastDayOfMonth) < dayOfMonth) {
          nextDueDate = lastDayOfMonth;
        }
      }
    } else if (frequency === "weekly" && dayOfWeek !== undefined && dayOfWeek !== null) {
      const currentDayOfWeek = today.getDay();
      let daysToAdd = dayOfWeek - currentDayOfWeek;
      
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      
      nextDueDate = new Date(today);
      nextDueDate.setDate(today.getDate() + daysToAdd);
    } else if (frequency === "yearly") {
      nextDueDate = new Date(startDate);
      nextDueDate.setFullYear(today.getFullYear());
      
      if (nextDueDate < today) {
        nextDueDate.setFullYear(today.getFullYear() + 1);
      }
    }
  }

  return nextDueDate;
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const body = await request.json();    
    const validatedData = RecurringTransactionSchema.parse(body);

    const nextDueDate = calculateNextDueDate(
      validatedData.startDate,
      validatedData.frequency,
      validatedData.dayOfMonth,
      validatedData.dayOfWeek
    );

    const recurringTransaction = await prisma.recurringTransaction.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        amount: validatedData.amount,
        description: validatedData.description || "",
        type: validatedData.type,
        category: validatedData.category,
        categoryIcon: validatedData.categoryIcon,
        frequency: validatedData.frequency,
        startDate: validatedData.startDate,
        nextDueDate,
        endDate: validatedData.endDate,
        dayOfMonth: validatedData.dayOfMonth,
        dayOfWeek: validatedData.dayOfWeek,
      },
    });

    return NextResponse.json(recurringTransaction);
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Tekrarlayan işlem oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const body = await request.json();
    const validatedData = RecurringTransactionSchema.parse(body);

    if (!validatedData.id) {
      return NextResponse.json(
        { error: "İşlem ID'si gerekli" },
        { status: 400 }
      );
    }

    const existingTransaction = await prisma.recurringTransaction.findUnique({
      where: {
        id: validatedData.id,
      },
    });

    if (!existingTransaction || existingTransaction.userId !== user.id) {
      return NextResponse.json(
        { error: "İşlem bulunamadı veya erişim izniniz yok" },
        { status: 404 }
      );
    }

    const nextDueDate = calculateNextDueDate(
      validatedData.startDate,
      validatedData.frequency,
      validatedData.dayOfMonth,
      validatedData.dayOfWeek
    );

    const updatedTransaction = await prisma.recurringTransaction.update({
      where: {
        id: validatedData.id,
      },
      data: {
        title: validatedData.title,
        amount: validatedData.amount,
        description: validatedData.description || "",
        type: validatedData.type,
        category: validatedData.category,
        categoryIcon: validatedData.categoryIcon,
        frequency: validatedData.frequency,
        startDate: validatedData.startDate,
        nextDueDate,
        endDate: validatedData.endDate,
        dayOfMonth: validatedData.dayOfMonth,
        dayOfWeek: validatedData.dayOfWeek,
      },
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Tekrarlayan işlem güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "İşlem ID'si gerekli" },
        { status: 400 }
      );
    }

    const existingTransaction = await prisma.recurringTransaction.findUnique({
      where: {
        id,
      },
    });

    if (!existingTransaction || existingTransaction.userId !== user.id) {
      return NextResponse.json(
        { error: "İşlem bulunamadı veya erişim izniniz yok" },
        { status: 404 }
      );
    }

    await prisma.recurringTransaction.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Tekrarlayan işlem silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}