import { TransactionType } from "@/lib/types"
import { Category } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Kategori seçici bileşeni
function CategoryPicker(
    {
        type,
        onChange
    }: {
        type: TransactionType, // Gelir/gider tipi
        onChange: (value: string) => void // Seçim değiştiğinde çağrılır
    }) {

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Kategorileri API'den çek
    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/categories?type=${type}`)
            .then(res => res.json())
            .then(data => {
                setCategories(data);
            })
            .catch(error => {
                setCategories([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [type]);

    // Seçili kategori değişince üst bileşene bildir
    useEffect(() => {
        if (!value) return;
        onChange(value)
    }, [onChange, value])

    // Seçili kategori nesnesi
    const selectedCategory = categories?.find(
        (category: Category) => category.name === value
    )

    // Yeni kategori oluşturulunca çağrılır
    const successCallback = useCallback(
        (category: Category) => {
            setValue(category.name);
            setOpen(prev => !prev);
            setCategories(prev => [...prev, category]);
        },
        [setOpen, setValue]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant={"outline"} role="combobox"
                    aria-expanded={open} className="w-[200px] justify-between">
                    {
                        selectedCategory ? (
                            <CategoryRow category={selectedCategory} />
                        ) : (
                            "Kategori seçin"
                        )
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command onSubmit={(e) => { e.preventDefault() }}>
                    <CommandInput placeholder="Kategori ara..." />
                    {/* Yeni kategori oluşturma */}
                    <CreateCategoryDialog
                        type={type}
                        successCallback={successCallback} />
                    <CommandList>
                        <CommandEmpty>
                            <p>Kategori bulunamadı</p>
                            <p className="text-xs text-muted-foreground">
                                İpucu: Yeni bir kategori oluşturun
                            </p>
                        </CommandEmpty>
                        <CommandGroup heading="Öneriler">
                            {
                                isLoading ? (
                                    <CommandItem disabled>Kategoriler yükleniyor...</CommandItem>
                                ) : categories && categories.map((category: Category) => (
                                    <CommandItem
                                        key={category.name}
                                        onSelect={() => {
                                            setValue(category.name);
                                            setOpen(prev => !prev);
                                        }}>
                                        <CategoryRow category={category} />
                                        <Check className={cn(
                                            "ml-2 w-4 h-4",
                                            value === category.name ? "opacity-100" : "opacity-0"
                                        )} />
                                    </CommandItem>
                                ))
                            }
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover >
    )
}

// Kategori satırı: ikon ve isim
function CategoryRow({ category }: { category: Category }) {
    return (
        <div className="flex items-center gap-2">
            <span role="img">{category.icon}</span>
            <span>{category.name}</span>
        </div>
    )
}

export default CategoryPicker