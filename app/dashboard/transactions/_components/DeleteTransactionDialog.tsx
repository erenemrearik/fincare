"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteTransaction } from "../_actions/DeleteTransaction";


interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    transactionId: string
}

function DeleteTransactionDialog({ open, setOpen, transactionId }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        toast.loading("İşlem siliniyor...", {
            id: transactionId
        });

        try {
            await DeleteTransaction(transactionId);
            toast.success("İşlem başarıyla silindi 🎉", {
                id: transactionId
            });
            
            setOpen(false);
            
            window.location.reload();
        } catch (error) {
            toast.error("Bir şeyler yanlış gitti", {
                id: transactionId
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Kesinlikle emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu işlem geri alınamaz. Bu işleminizi kalıcı olarak silecektir.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        Devam Et
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteTransactionDialog