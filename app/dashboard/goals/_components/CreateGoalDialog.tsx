"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useForm, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { createGoal } from "../_actions/goal-actions";
import { Textarea } from "@/components/ui/textarea";

export default function CreateGoalDialog({ currency }: { currency: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      targetAmount: "",
      currentAmount: "0",
      description: "",
      type: "monthly",
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createGoal({
        name: data.name,
        description: data.description,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount) || 0,
        type: data.type,
        targetDate: date || new Date(),
      });

      setOpen(false);
      reset();
      setDate(undefined);
      router.refresh();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Yeni Hedef Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Hedef Ekle</DialogTitle>
          <DialogDescription>
            Finansal hedeflerinizi takip etmek için yeni bir hedef oluşturun.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="name">Hedef Adı</Label>
            <Input 
              id="name" 
              placeholder="Örn: Yeni Araba" 
              {...register("name", { required: "Hedef adı gerekli" })} 
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message?.toString()}</p>}
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea 
              id="description" 
              placeholder="Hedefinizin detayları..." 
              className="resize-none" 
              {...register("description")} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid items-center gap-2">
              <Label htmlFor="targetAmount">Hedef Miktar ({currency})</Label>
              <Input 
                id="targetAmount" 
                type="number" 
                step="0.01" 
                min="0" 
                placeholder="1000" 
                {...register("targetAmount", { 
                  required: "Hedef miktar gerekli",
                  min: { value: 0, message: "Hedef miktar 0'dan büyük olmalı" }
                })} 
              />
              {errors.targetAmount && <p className="text-sm text-red-500">{errors.targetAmount.message?.toString()}</p>}
            </div>

            <div className="grid items-center gap-2">
              <Label htmlFor="currentAmount">Mevcut Miktar ({currency})</Label>
              <Input 
                id="currentAmount" 
                type="number" 
                step="0.01" 
                min="0" 
                placeholder="0" 
                {...register("currentAmount", { 
                  min: { value: 0, message: "Mevcut miktar 0'dan büyük olmalı" }
                })} 
              />
              {errors.currentAmount && <p className="text-sm text-red-500">{errors.currentAmount.message?.toString()}</p>}
            </div>
          </div>

          <div className="grid items-center gap-2">
            <Label htmlFor="type">Hedef Tipi</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Hedef tipi gerekli" }}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Hedef tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Aylık Hedef</SelectItem>
                    <SelectItem value="yearly">Yıllık Hedef</SelectItem>
                    <SelectItem value="savings">Para Biriktirme</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message?.toString()}</p>}
          </div>

          <div className="grid items-center gap-2">
            <Label>Hedef Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}