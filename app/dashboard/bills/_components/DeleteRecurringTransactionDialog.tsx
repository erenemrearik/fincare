"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  transactionId: string;
  transactionTitle: string;
  trigger: ReactNode;
  onSuccess: () => void;
}

export default function DeleteRecurringTransactionDialog({
  transactionId,
  transactionTitle,
  trigger,
  onSuccess,
}: Props) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!transactionId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recurring-transactions?id=${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bir hata oluştu");
      }

      toast({
        title: "İşlem Silindi",
        description: "Tekrarlayan işlem başarıyla silindi.",
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Hata Oluştu",
        description: error instanceof Error ? error.message : "Tekrarlayan işlem silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bu tekrarlayan işlemi silmek istediğinize emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold">{transactionTitle}</span> başlıklı tekrarlayan işlemi silmek üzeresiniz.
            <br />
            Bu işlem geri alınamaz. Bu işlemi sildiğinizde, bundan sonraki tüm otomatik işlemler oluşturulmayacaktır.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}