"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, PlusCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { updateGoalProgress } from "../_actions/goal-actions";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type Goal = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  type: string;
  targetDate: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function UpdateProgressDialog({ goal, currency }: { goal: Goal; currency: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const progressPercentage = Math.min(
    Math.round((goal.currentAmount / goal.targetAmount) * 100),
    100
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      amount: "",
      operation: "add"
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const amount = parseFloat(data.amount);
      const operation = data.operation;
      let newAmount = goal.currentAmount;
      if (operation === "add") {
        newAmount = goal.currentAmount + amount;
        await updateGoalProgress({
          id: goal.id,
          currentAmount: newAmount
        });
      } else {
        newAmount = Math.max(0, goal.currentAmount - amount);
        await updateGoalProgress({
          id: goal.id,
          currentAmount: newAmount
        });
      }

      // Bildirim: Hedefin %80 veya fazlası tamamlandıysa kullanıcıya toast göster
      const progress = (newAmount / goal.targetAmount) * 100;
      if (progress >= 80 && progress < 100) {
        toast.info(`Tebrikler! '${goal.name}' hedefinizin %${Math.round(progress)}'ine ulaştınız. Hedefinize çok az kaldı! 🎯`);
      } else if (progress >= 100) {
        toast.success(`Harika! '${goal.name}' hedefinizi tamamladınız! 🎉`);
      }

      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <LineChart className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>İlerleme Güncelle</DialogTitle>
          <DialogDescription>
            {goal.name} hedefinde ilerlemenizi güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="my-2 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Mevcut Durum</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Mevcut miktar:</span>
              <p className="font-medium">{goal.currentAmount.toLocaleString()} {currency}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Hedef miktar:</span>
              <p className="font-medium">{goal.targetAmount.toLocaleString()} {currency}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="amount">Miktar ({currency})</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              min="0" 
              placeholder="100" 
              {...register("amount", { 
                required: "Miktar gerekli",
                min: { value: 0, message: "Miktar 0'dan büyük olmalı" },
                validate: value => parseFloat(value) > 0 || "Miktar 0'dan büyük olmalı"
              })} 
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message?.toString()}</p>}
          </div>

          <div className="grid w-full grid-cols-2 gap-2">
            <Label className="col-span-2">İşlem</Label>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="add"
                value="add"
                className="h-4 w-4 text-primary border-primary"
                {...register("operation")}
                defaultChecked
              />
              <Label htmlFor="add" className="cursor-pointer">Para ekle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="subtract"
                value="subtract"
                className="h-4 w-4 text-primary border-primary"
                {...register("operation")}
              />
              <Label htmlFor="subtract" className="cursor-pointer">Para çıkar</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}