// Kullanıcı ayarları ve kategori yönetimi sayfası
// Kullanıcı burada varsayılan para birimini ve gelir/gider kategorilerini yönetebilir

import CurrencyComboBox from "@/components/CurrencyComboBox";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionType } from "@/lib/types";
import { PlusSquareIcon, TrashIcon, TrendingDown, TrendingUp } from "lucide-react";
import CreateCategoryDialog from "../_components/CreateCategoryDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import DeleteCategoryDialog from "../_components/DeleteCategoryDialog";
import { useEffect, useState } from "react";

function ManagePage() {
    // Sayfa başlığı ve açıklaması
    return (
        <>
            <div className=" border-b bg-card">
                <div className=" container flex flex-wrap items-center justify-between gap-6 py-8">
                    <div>
                        <p className=" text-3xl font-bold">
                            Ayarlar
                        </p>
                        <p className=" text-muted-foreground">
                            Hesap ayarlarınızı ve kategorilerinizi yönetin.
                        </p>
                    </div>
                </div>
            </div>

            {/* Para birimi ve kategori listeleri */}
            <div className="container flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Para Birimi</CardTitle>
                        <CardDescription>
                            İşlemler için varsayılan para biriminizi ayarlayın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CurrencyComboBox />
                    </CardContent>
                </Card>

                {/* Gelir ve gider kategorileri */}
                <CategoryList type="income" />
                <CategoryList type="expense" />
            </div>
        </>
    )
}
export default ManagePage;

// Kategori listesini gösteren bileşen
function CategoryList({ type }: { type: TransactionType }) {
    // Kategoriler ve yüklenme durumu state'leri
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Kategorileri API'den çek
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/categories?type=${type}`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [type]);

    const dataAvailable = categories && categories.length > 0;

    return (
        <SkeletonWrapper isLoading={isLoading}>
            <Card>
                <CardHeader>
                    <CardTitle className=" flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {/* Kategori türüne göre ikon */}
                            {
                                type === "expense" ? (
                                    <TrendingDown className=" h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
                                ) : (
                                    <TrendingUp className=" h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
                                )
                            }
                            <div>
                                {type === "income" ? "Gelir" : "Gider"} kategorileri
                                <div className=" text-sm text-muted-foreground">
                                    İsme göre sıralanmış.
                                </div>
                            </div>
                        </div>

                        {/* Kategori oluşturma diyaloğu */}
                        <CreateCategoryDialog
                            type={type}
                            successCallback={() => {
                                fetchCategories();
                            }}
                            trigger={
                                <Button className=" gap-2 text-sm">
                                    <PlusSquareIcon className="h-4 w-4" />
                                    Kategori Oluştur
                                </Button>
                            }
                        />
                    </CardTitle>
                </CardHeader>

                <Separator />

                {/* Kategori yoksa bilgilendirme */}
                {
                    !dataAvailable && (
                        <div className="flex h-40 w-full flex-col items-center justify-center">
                            <p>
                                Henüz
                                <span
                                    className={cn("m-1", type === "income" ? "text-emerald-500" : "text-red-500")}>{type === "income" ? "gelir" : "gider"}
                                </span>
                                kategoriniz yok.
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Başlamak için bir tane oluşturun
                            </p>
                        </div>
                    )
                }

                {/* Kategoriler varsa listele */}
                {
                    dataAvailable && (
                        <div className=" grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {
                                categories.map((category: Category) => {
                                    return (
                                        <CategoryCard
                                            category={category}
                                            key={category.name}
                                        />
                                    )
                                })
                            }
                        </div>
                    )
                }

            </Card>
        </SkeletonWrapper>
    )
}

// Tek bir kategori kartı ve silme diyaloğu
function CategoryCard({ category }: { category: Category }) {
    return (
        <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1] ">
            <div className="flex flex-col items-center gap-2 p-4">
                <span className=" text-3xl" role="img">{category.icon}</span>
                <span>{category.name}</span>
            </div>
            <DeleteCategoryDialog
                category={category}
                trigger={
                    <Button
                        className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20"
                        variant={"secondary"}
                    >
                        <TrashIcon className=" h-4 w-4" />
                        Kaldır
                    </Button>
                }
            />
        </div>
    )
}