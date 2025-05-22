"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import { useCallback, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { CreateTransaction } from "../_actions/transaction";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import { mutate as globalMutate } from "swr";

interface Props {
    trigger: React.ReactNode;
    type: TransactionType
}

// Ana diyalog bileşeni
function CreateTransactionDialog({ trigger, type }: Props) {

    // Form ayarları
    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            type,
            date: new Date(),
        }
    })

    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    // Kategori değişimini yönetir
    const handleCategoryChange = useCallback((value: string) => {
        form.setValue("category", value);
    }, [form]);

    // Form gönderim işlemi
    const onSubmit = useCallback(async (values: CreateTransactionSchemaType) => {
        setIsPending(true);
        toast.loading("işlem oluşturuluyor...", {
            id: "create-transaction"
        });

        try {
            await CreateTransaction({ ...values, date: DateToUTCDate(values.date) });
            
            toast.success("işlem başarıyla oluşturuldu 🎉", {
                id: "create-transaction"
            });

            form.reset({
                type,
                description: "",
                amount: 0,
                date: new Date(),
                category: undefined
            });

            setOpen(prev => !prev);

            // SWR ile global veriyi güncelle
            globalMutate(key => typeof key === "string" && key.startsWith("/api/stats"));
        } catch (error) {
            toast.error("Bir hata oluştu", {
                id: "create-transaction"
            });
        } finally {
            setIsPending(false);
        }
    }, [form, type]);

    // Dialog ve formun render edilmesi
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Yeni bir
                        <span className={cn("m-1",
                            type === "income" ? "text-emerald-500" : "text-red-500"
                        )}>
                            {type === "income" ? "gelir" : "gider"}
                        </span>
                        işlemi oluştur
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-4">
                        {/* Açıklama alanı */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Açıklama</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        İşlem açıklaması (isteğe bağlı)
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        {/* Tutar alanı */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tutar</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? 0}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        İşlem tutarı (zorunlu)
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-center gap-2">
                            {/* Kategori seçici */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mr-2">Kategori</FormLabel>
                                        <FormControl>
                                            <CategoryPicker
                                                type={type}
                                                onChange={handleCategoryChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Bu işlem için bir kategori seçin
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            {/* Tarih seçici */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mr-2">
                                            İşlem Tarihi
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[200px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {
                                                            field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (<span>Bir tarih seçin</span>)
                                                        }
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    className="rounded-md border"
                                                    initialFocus
                                                    onSelect={(value) => {
                                                        if (!value) return;
                                                        field.onChange(value)
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Bu işlem için bir tarih seçin
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </form>
                </Form>
                <DialogFooter>
                    {/* İptal ve Oluştur butonları */}
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant={"secondary"}
                            onClick={() => {
                                form.reset();
                            }}
                        >
                            İptal
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending}>
                        {!isPending && "Oluştur"}
                        {isPending && <Loader2 className=" animate-spin" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTransactionDialog;