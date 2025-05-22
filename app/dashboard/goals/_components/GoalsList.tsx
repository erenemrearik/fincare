"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, PiggyBankIcon, Target, Trash2Icon, Edit2Icon, CheckCircle2Icon, BadgeCheckIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { deleteGoal, updateGoalProgress } from "../_actions/goal-actions";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EditGoalDialog from "./EditGoalDialog";
import UpdateProgressDialog from "./UpdateProgressDialog";
import { cn } from "@/lib/utils";

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

interface GoalsListProps {
  goals: Goal[];
  currency: string;
  type: "monthly" | "yearly" | "savings" | "completed";
}

export default function GoalsList({ goals, currency, type }: GoalsListProps) {
  const router = useRouter();

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      router.refresh();
    } catch (error) {
    }
  };

  const getIcon = (goalType: string) => {
    switch (goalType) {
      case "monthly":
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case "yearly":
        return <Target className="h-5 w-5 text-green-500" />;
      case "savings":
        return <PiggyBankIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getEmptyTitle = (goalType: string) => {
    switch (goalType) {
      case "monthly":
        return "Henüz Aylık Hedef Eklemediniz";
      case "yearly":
        return "Henüz Yıllık Hedef Eklemediniz";
      case "savings":
        return "Henüz Para Biriktirme Hedefi Eklemediniz";
      case "completed":
        return "Henüz Tamamlanan Hedefiniz Yok";
      default:
        return "Henüz Hedef Eklemediniz";
    }
  };

  const getEmptyDescription = (goalType: string) => {
    switch (goalType) {
      case "monthly":
        return "Aylık finansal hedeflerinizi takip etmek için yeni bir hedef ekleyin.";
      case "yearly":
        return "Uzun vadeli yıllık hedeflerinizi belirlemek için yeni bir hedef ekleyin.";
      case "savings":
        return "Para biriktirme hedeflerinizi takip etmek için yeni bir hedef ekleyin.";
      case "completed":
        return "Hedeflerinizi %100 tamamladığınızda burada listelenecektir.";
      default:
        return "Yeni bir hedef ekleyin.";
    }
  };

  if (goals.length === 0) {
    return (
      <Card className="col-span-full flex flex-col items-center justify-center p-8">
        <CardHeader className="items-center text-center">
          {type === "completed" ? 
            <CheckCircle2Icon className="h-12 w-12 text-muted-foreground" /> : 
            getIcon(type)
          }
          <CardTitle className="mt-4">{getEmptyTitle(type)}</CardTitle>
          <CardDescription>
            {getEmptyDescription(type)}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      {goals.map((goal) => {
        const progressPercentage = Math.min(
          Math.round((goal.currentAmount / goal.targetAmount) * 100),
          100
        );
        
        const isCompleted = progressPercentage >= 100;
        
        return (
          <Card 
            key={goal.id} 
            className={cn(
              "overflow-hidden",
              isCompleted && "border-green-500 bg-green-50 dark:bg-green-950/20"
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {isCompleted ? 
                    <BadgeCheckIcon className="h-5 w-5 text-green-500" /> : 
                    getIcon(goal.type)
                  }
                  <CardTitle className="text-lg">
                    {goal.name}
                    {isCompleted && <span className="ml-2 text-xs font-medium text-green-600">(Tamamlandı)</span>}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  {!isCompleted && (
                    <UpdateProgressDialog 
                      goal={goal} 
                      currency={currency} 
                    />
                  )}
                  {type !== "completed" && (
                    <EditGoalDialog 
                      goal={goal} 
                      currency={currency} 
                    />
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bu hedefi silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. Bu hedef kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(goal.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {goal.description && (
                <CardDescription className="mt-1">{goal.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>İlerleme</span>
                  <span className={cn(
                    "font-medium",
                    isCompleted && "text-green-600"
                  )}>
                    {progressPercentage}%
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className={cn("h-2", isCompleted && "bg-green-100")}
                />
                <div className="flex items-center justify-between text-sm">
                  <span>Mevcut Miktar</span>
                  <span className={cn(
                    "font-medium",
                    isCompleted && "text-green-600"
                  )}>
                    {goal.currentAmount.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Hedef Miktar</span>
                  <span className="font-medium">
                    {goal.targetAmount.toLocaleString()} {currency}
                  </span>
                </div>
                {isCompleted && (
                  <div className="flex items-center justify-center mt-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle2Icon className="mr-1 h-3 w-3" />
                      Hedef Tamamlandı
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <span>Hedef Tarihi: {format(new Date(goal.targetDate), "d MMMM yyyy", { locale: tr })}</span>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </>
  );
}