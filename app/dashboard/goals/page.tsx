import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, PiggyBankIcon, LineChart, Target, CalendarDaysIcon, CheckCircle2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import CreateGoalDialog from "./_components/CreateGoalDialog";
import GoalsList from "./_components/GoalsList";

async function GoalsPage() {
  // Kullanıcı doğrulaması ve yönlendirme
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Kullanıcı ayarlarını getir, yoksa kurulum sihirbazına yönlendir
  const userSettings = await prisma.userSettings.findFirst({
    where: {
      userId: user.id
    }
  });

  if (!userSettings) {
    redirect("/wizard");
  }

  // Kullanıcının tüm hedeflerini getir
  const goals = await prisma.goal.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      targetDate: 'asc'
    }
  });

  // Aktif ve tamamlanan hedefleri ayır
  const activeGoals = goals.filter(goal => (goal.currentAmount / goal.targetAmount) < 1);
  const completedGoals = goals.filter(goal => (goal.currentAmount / goal.targetAmount) >= 1);

  // Aktif hedefleri türlerine göre ayır
  const monthlyGoals = activeGoals.filter(goal => goal.type === "monthly");
  const yearlyGoals = activeGoals.filter(goal => goal.type === "yearly");
  const savingsGoals = activeGoals.filter(goal => goal.type === "savings");

  return (
    // Sayfa başlığı ve yeni hedef ekleme butonu
    <div className="container py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hedefler</h1>
        <CreateGoalDialog currency={userSettings.currency} />
      </div>

      {/* Hedefler sekmeli arayüz */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {/* Aylık hedefler sekmesi */}
          <TabsTrigger value="monthly">
            <CalendarDaysIcon className="mr-2 h-4 w-4" />
            Aylık Hedefler
          </TabsTrigger>
          {/* Yıllık hedefler sekmesi */}
          <TabsTrigger value="yearly">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Yıllık Hedefler
          </TabsTrigger>
          {/* Para biriktirme sekmesi */}
          <TabsTrigger value="savings">
            <PiggyBankIcon className="mr-2 h-4 w-4" />
            Para Biriktirme
          </TabsTrigger>
          {/* Tamamlanan hedefler sekmesi, rozet ile */}
          <TabsTrigger value="completed">
            <CheckCircle2Icon className="mr-2 h-4 w-4" />
            Tamamlanan Hedefler
            {completedGoals.length > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {completedGoals.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Her sekmede ilgili hedefler listelenir */}
        <TabsContent value="monthly">
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <GoalsList goals={monthlyGoals} currency={userSettings.currency} type="monthly" />
          </div>
        </TabsContent>

        <TabsContent value="yearly">
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <GoalsList goals={yearlyGoals} currency={userSettings.currency} type="yearly" />
          </div>
        </TabsContent>

        <TabsContent value="savings">
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <GoalsList goals={savingsGoals} currency={userSettings.currency} type="savings" />
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <GoalsList goals={completedGoals} currency={userSettings.currency} type="completed" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GoalsPage;