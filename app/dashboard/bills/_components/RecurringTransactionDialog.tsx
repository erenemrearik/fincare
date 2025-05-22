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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Category } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DAYS_OF_WEEK = [
  { name: "Pazar", value: 0 },
  { name: "Pazartesi", value: 1 },
  { name: "Salı", value: 2 },
  { name: "Çarşamba", value: 3 },
  { name: "Perşembe", value: 4 },
  { name: "Cuma", value: 5 },
  { name: "Cumartesi", value: 6 },
];

interface RecurringTransaction {
  id?: string;
  title: string;
  amount: number;
  description?: string;
  type: string;
  category: string;
  categoryIcon: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  nextDueDate?: Date;
}

interface Props {
  trigger: ReactNode;
  successCallback: () => void;
  categories: Category[];
  transaction?: RecurringTransaction;
  isEditing?: boolean;
}

export default function RecurringTransactionDialog({
  trigger,
  successCallback,
  categories,
  transaction,
  isEditing = false,
}: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState(transaction?.title || "");
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [type, setType] = useState(transaction?.type || "expense");
  const [category, setCategory] = useState(transaction?.category || "");
  const [categoryIcon, setCategoryIcon] = useState(transaction?.categoryIcon || "");
  const [frequency, setFrequency] = useState(transaction?.frequency || "monthly");
  const [startDate, setStartDate] = useState<Date | undefined>(transaction?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(transaction?.endDate);
  const [dayOfMonth, setDayOfMonth] = useState<number | null | undefined>(transaction?.dayOfMonth);
  const [dayOfWeek, setDayOfWeek] = useState<number | null | undefined>(transaction?.dayOfWeek);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const selectedCategory = categories.find((c) => c.name === value && c.type === type);
    if (selectedCategory) {
      setCategoryIcon(selectedCategory.icon);
    }
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    if (value === "monthly") {
      setDayOfWeek(undefined);
      setDayOfMonth(startDate ? startDate.getDate() : new Date().getDate());
    } else if (value === "weekly") {
      setDayOfMonth(undefined);
      setDayOfWeek(startDate ? startDate.getDay() : new Date().getDay());
    } else {
      setDayOfMonth(undefined);
      setDayOfWeek(undefined);
    }
  };

  const handleStartDateChange = (date?: Date) => {
    if (date) {
      setStartDate(date);
      if (frequency === "monthly") {
        setDayOfMonth(date.getDate());
      } else if (frequency === "weekly") {
        setDayOfWeek(date.getDay());
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDescription("");
    setType("expense");
    setCategory("");
    setCategoryIcon("");
    setFrequency("monthly");
    setStartDate(new Date());
    setEndDate(undefined);
    setDayOfMonth(new Date().getDate());
    setDayOfWeek(undefined);
  };

  const handleSubmit = async () => {
    if (!title || !amount || !category || !startDate) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    if (frequency === "monthly" && !dayOfMonth) {
      toast({
        title: "Eksik Bilgi",
        description: "Aylık tekrar için ay günü seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    if (frequency === "weekly" && dayOfWeek === undefined) {
      toast({
        title: "Eksik Bilgi",
        description: "Haftalık tekrar için haftanın gününü seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    const data: RecurringTransaction = {
      title,
      amount: parseFloat(amount),
      description,
      type,
      category,
      categoryIcon,
      frequency,
      startDate,
      endDate,
      // Eğer aylık ise ayın günü, haftalık ise haftanın günü eklenir
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
    };

    // Düzenleme modundaysa id eklenir
    if (isEditing && transaction?.id) {
      data.id = transaction.id;
    }

    setIsLoading(true);
    try {
      // API endpoint ve HTTP metodu belirlenir
      const endpoint = '/api/recurring-transactions';
      const method = isEditing ? 'PATCH' : 'POST';
      
      // API'ye istek atılır
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Hatalı cevap kontrolü
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bir hata oluştu');
      }

      // Başarılı işlem bildirimi
      toast({
        title: isEditing ? "İşlem Güncellendi" : "İşlem Oluşturuldu",
        description: isEditing 
          ? "Tekrarlayan işlem başarıyla güncellendi." 
          : "Yeni tekrarlayan işlem başarıyla oluşturuldu.",
      });

      // Form sıfırlanır ve diyalog kapatılır
      resetForm();
      setOpen(false);
      successCallback();
    } catch (error) {
      // Hata bildirimi
      toast({
        title: "Hata Oluştu",
        description: error instanceof Error ? error.message : "Tekrarlayan işlem kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Tekrarlayan İşlemi Düzenle" : "Yeni Tekrarlayan İşlem"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Tekrarlayan işlem detaylarını düzenleyin." 
              : "Periyodik olarak eklenmesini istediğiniz düzenli gelir veya gideri tanımlayın."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Başlık
            </Label>
            <Input
              id="title"
              placeholder="Örn: Kira Ödemesi"
              className="col-span-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tür
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Tür Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Gider</SelectItem>
                <SelectItem value="income">Gelir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Tutar
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="col-span-3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Kategori
            </Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Kategori Seçin" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center gap-2">
                        <span role="img" aria-label={category.name}>
                          {category.icon}
                        </span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Kategori bulunamadı. Önce bir kategori oluşturun.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Tekrar Sıklığı
            </Label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Tekrar Sıklığı Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Haftalık</SelectItem>
                <SelectItem value="monthly">Aylık</SelectItem>
                <SelectItem value="yearly">Yıllık</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {frequency === "monthly" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dayOfMonth" className="text-right">
                Ayın Günü
              </Label>
              <Select 
                value={dayOfMonth?.toString() || ""} 
                onValueChange={(value) => setDayOfMonth(parseInt(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Ayın Gününü Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {frequency === "weekly" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dayOfWeek" className="text-right">
                Haftanın Günü
              </Label>
              <Select 
                value={dayOfWeek?.toString() || ""} 
                onValueChange={(value) => setDayOfWeek(parseInt(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Haftanın Gününü Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Başlangıç Tarihi
            </Label>
            <div className="col-span-3">
              <DatePicker
                date={startDate}
                onSelect={handleStartDateChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Bitiş Tarihi (Opsiyonel)
            </Label>
            <div className="col-span-3">
              <DatePicker
                date={endDate}
                onSelect={setEndDate}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Açıklama
            </Label>
            <Textarea
              id="description"
              placeholder="İşlem ile ilgili ek bilgi"
              className="col-span-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}