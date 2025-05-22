"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { DeleteCategory } from "../_actions/deleteCategory";
import { Category } from "@prisma/client";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type DeleteCategoryDialogProps = {
    category: Category;
    onDeleted?: () => void;
    trigger?: React.ReactNode;
}

function DeleteCategoryDialog({ category, onDeleted, trigger }: DeleteCategoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleDelete = useCallback(async () => {
        setIsPending(true);
        toast.loading("Kategori siliniyor...", {
            id: "delete-category"
        });

        try {
            await DeleteCategory({
                name: category.name,
                type: category.type as "income" | "expense"
            });
            
            toast.success("Kategori başarıyla silindi", {
                id: "delete-category"
            });
            
            if (onDeleted) {
                onDeleted();
            }
            
            setOpen(false);
        } catch (error) {
            toast.error("Kategori silinirken bir hata oluştu", {
                id: "delete-category"
            });
        } finally {
            setIsPending(false);
        }
    }, [category.name, category.type, onDeleted]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Kategoriyi Sil</DialogTitle>
                    <DialogDescription>
                        <p>
                            <span className="font-medium">{category.name} ({category.icon})</span> kategorisini silmek istediğinizden emin misiniz?
                        </p>
                        <p className="text-destructive mt-2">
                            Bu işlem geri alınamaz. Bu kategorideki işlemler silinen kategori olarak işaretlenecektir.
                        </p>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        İptal
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Kategoriyi Sil
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteCategoryDialog;