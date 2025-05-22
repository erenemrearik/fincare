"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TransactionType } from "@/lib/types";
import { CreateCategorySchema, CreateCategorySchemaType } from "@/schema/categories";
import { Button } from "@/components/ui/button";
import { CircleOff, Loader2, PlusSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { DialogClose } from "@radix-ui/react-dialog";
import { CreateCategory } from "../_actions/createCategory";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";

function CreateCategoryDialog(
    {
        type,
        successCallback,
        trigger
    }: {
        type: TransactionType;
        successCallback: (category: Category) => void; // Başarılı olunca çağrılır
        trigger?: React.ReactNode
    }) {

    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    // Form yönetimi için react-hook-form kullanımı
    const form = useForm<CreateCategorySchemaType>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            type
        }
    })

    // Tema bilgisini al (açık/koyu)
    const theme = useTheme();

    // Form gönderildiğinde çalışacak fonksiyon
    const onSubmit = useCallback(
        async (values: CreateCategorySchemaType) => {
            setIsPending(true);
            toast.loading("Kategori oluşturuluyor...", {
                id: "create-category"
            });
            
            try {
                // API ile kategori oluştur
                const data = await CreateCategory(values);
                
                // Formu sıfırla
                form.reset({
                    name: "",
                    icon: "",
                    type
                });

                // Başarı bildirimi göster
                toast.success(`${data.name} kategorisi başarıyla oluşturuldu 🎉`, {
                    id: "create-category"
                });

                // Üst bileşene yeni kategoriyi bildir
                successCallback(data);
                // Dialogu kapat
                setOpen(prev => !prev);
            } catch (error) {
                // Hata bildirimi göster
                toast.error("Bir şeyler yanlış gitti", {
                    id: "create-category"
                });
            } finally {
                setIsPending(false);
            }
        },
        [form, successCallback, type]
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Diyaloğu açan buton */}
            <DialogTrigger asChild>
                {trigger ? trigger : <Button
                    variant={"ghost"}
                    className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground">
                    <PlusSquareIcon className="mr-2 h-4 w-4" />Yeni kategori oluştur...
                </Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Yeni
                        <span className={cn("m-1",
                            type === "income" ? "text-emerald-500" :
                                "text-red-600"
                        )}>
                            {type === "income" ? "gelir" : "gider"}
                        </span>
                        kategorisi oluştur
                    </DialogTitle>
                    <DialogDescription>
                        Kategoriler işlemlerinizi gruplandırmak için kullanılır
                    </DialogDescription>
                </DialogHeader>
                {/* Form alanları */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Kategori adı alanı */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>İsim</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Kategori"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Bu, kategorinizin uygulamada görüneceği şekildir.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        {/* Kategori ikon alanı */}
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>İkon</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"}
                                                    className="h-[100px] w-full"
                                                >
                                                    {/* Seçili ikon varsa göster */}
                                                    {form.watch("icon") ? (
                                                        <div
                                                            className="flex flex-col items-center gap-2"
                                                        >
                                                            <span className="text-5xl" role="img">
                                                                {field.value}
                                                            </span>
                                                            <p className="text-xs text-muted-foreground">
                                                                Değiştirmek için tıklayın
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        // İkon seçilmemişse göster
                                                        <div
                                                            className="flex flex-col items-center gap-2"
                                                        >
                                                            <CircleOff className=" h-[48px] w-[48px] " />
                                                            <p className="text-xs text-muted-foreground">
                                                                Seçmek için tıklayın
                                                            </p>
                                                        </div>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            {/* Emoji seçici */}
                                            <PopoverContent className="w-full">
                                                <Picker
                                                    data={data}
                                                    theme={theme.resolvedTheme}
                                                    onEmojiSelect={(emoji: { native: string }) => {
                                                        field.onChange(emoji.native)
                                                    }} />
                                            </PopoverContent>

                                        </Popover>
                                    </FormControl>
                                    <FormDescription>
                                        Bu, kategorinizin uygulamada görüneceği şeklidir
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <DialogFooter>
                    {/* İptal butonu */}
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
                    {/* Oluştur butonu */}
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending}>
                        {!isPending && "Oluştur"}
                        {isPending && <Loader2 className=" animate-spin" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}

export default CreateCategoryDialog