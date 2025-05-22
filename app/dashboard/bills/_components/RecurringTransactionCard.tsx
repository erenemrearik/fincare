"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, isBefore } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, EditIcon, TrashIcon } from "lucide-react";
import DeleteRecurringTransactionDialog from "./DeleteRecurringTransactionDialog";
import RecurringTransactionDialog from "./RecurringTransactionDialog";
import { Category } from "@prisma/client";
import { cn } from "@/lib/utils";

// Frekans değerini Türkçe metne çevirir
function getFrequencyText(frequency: string): string {
  switch (frequency) {
    case "weekly":
      return "Haftalık";
    case "monthly":
      return "Aylık";
    case "yearly":
      return "Yıllık";
    default:
      return "";
  }
}

// Haftanın gününü Türkçe olarak döndürür
function getDayOfWeekName(dayOfWeek: number): string {
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return days[dayOfWeek];
}

// Tekrarlayan işlem arayüzü
interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  description?: string;
  type: string;
  category: string;
  categoryIcon: string;
  frequency: string;
  startDate: Date;
  nextDueDate: Date;
  endDate?: Date | null;
  isActive: boolean;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
}

// Bileşen prop'ları arayüzü
interface Props {
  transaction: RecurringTransaction;
  onDelete: () => void;
  onUpdate: () => void;
  categories: Category[];
  formattedAmount: string;
}

// Tekrarlayan işlem kartı bileşeni
export default function RecurringTransactionCard({
  transaction,
  onDelete,
  onUpdate,
  categories,
  formattedAmount,
}: Props) {
  // Sonraki ödeme tarihi formatlanır
  const formattedNextDueDate = format(new Date(transaction.nextDueDate), "d MMMM yyyy", { locale: tr });
  // Gecikmiş mi kontrolü yapılır
  const isOverdue = isBefore(new Date(transaction.nextDueDate), new Date()) && transaction.isActive;
  
  // Detay metni oluşturulur
  let detailsText = "";
  if (transaction.frequency === "monthly" && transaction.dayOfMonth) {
    detailsText = `Her ayın ${transaction.dayOfMonth}. günü`;
  } else if (transaction.frequency === "weekly" && transaction.dayOfWeek !== null && transaction.dayOfWeek !== undefined) {
    detailsText = `Her hafta ${getDayOfWeekName(transaction.dayOfWeek)}`;
  } else if (transaction.frequency === "yearly") {
    detailsText = `Her yıl ${format(new Date(transaction.startDate), "d MMMM", { locale: tr })}`;
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      isOverdue ? "border-red-500" : "",
      !transaction.isActive ? "opacity-70" : ""
    )}>
      {/* Kartın üst kısmındaki renkli şerit */}
      <div className={cn(
        "flex h-2",
        transaction.type === "expense" ? "bg-red-500" : "bg-emerald-500"
      )} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Kategori ikonu */}
            <div 
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                transaction.type === "expense" ? "bg-red-100 text-red-500" : "bg-emerald-100 text-emerald-500"
              )}
            >
              <span className="text-xl">{transaction.categoryIcon}</span>
            </div>
            <div>
              <h3 className="font-medium">{transaction.title}</h3>
              <p className="text-sm text-muted-foreground">{transaction.category}</p>
            </div>
          </div>
          <div className="text-right">
            {/* Tutar */}
            <p className={cn(
              "font-semibold",
              transaction.type === "expense" ? "text-red-500" : "text-emerald-500"
            )}>
              {transaction.type === "expense" ? "-" : "+"}{formattedAmount}
            </p>
            <p className="text-xs text-muted-foreground">{getFrequencyText(transaction.frequency)}</p>
          </div>
        </div>

        {/* Açıklama varsa gösterilir */}
        {transaction.description && (
          <p className="mt-2 text-sm text-muted-foreground">{transaction.description}</p>
        )}

        {/* Detay metni */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{detailsText}</span>
        </div>

        {/* Sonraki/g gecikmiş ödeme tarihi */}
        <div className={cn(
          "mt-3 flex items-center gap-1.5 text-xs",
          isOverdue ? "text-red-500" : "text-muted-foreground"
        )}>
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>
            {isOverdue ? "Gecikmiş: " : "Sonraki: "}
            {formattedNextDueDate}
          </span>
        </div>

        {/* Düzenle ve sil butonları */}
        <div className="mt-4 flex justify-end gap-2">
          <RecurringTransactionDialog
            transaction={{
              ...transaction,
              startDate: new Date(transaction.startDate),
              endDate: transaction.endDate ? new Date(transaction.endDate) : undefined,
              nextDueDate: new Date(transaction.nextDueDate),
            }}
            categories={categories}
            successCallback={onUpdate}
            isEditing={true}
            trigger={
              <Button size="sm" variant="outline" className="gap-1">
                <EditIcon className="h-3.5 w-3.5" />
                Düzenle
              </Button>
            }
          />
          <DeleteRecurringTransactionDialog
            transactionId={transaction.id}
            transactionTitle={transaction.title}
            onSuccess={onDelete}
            trigger={
              <Button size="sm" variant="outline" className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-500">
                <TrashIcon className="h-3.5 w-3.5" />
                Sil
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}