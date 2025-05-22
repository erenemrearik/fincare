"use client";

import { Button } from "@/components/ui/button";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { Category } from "@prisma/client";
import { format, isBefore, isEqual, startOfMonth, parseISO, isAfter, isSameMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { AlertTriangle, CalendarDays, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import RecurringTransactionCard from "./_components/RecurringTransactionCard";
import RecurringTransactionDialog from "./_components/RecurringTransactionDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UserSettings } from "@/lib/types";

interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  description?: string;
  type: string;
  category: string;
  categoryIcon: string;
  frequency: string;
  startDate: Date | string;
  nextDueDate: Date | string;
  endDate?: Date | string | null;
  isActive: boolean;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
}

export default function BillsPage() {
  // State tanımlamaları ve yardımcı değişkenler
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Para birimi formatlayıcı
  const formatter = userSettings ? GetFormatterForCurrency(userSettings.currency) : new Intl.NumberFormat();

  useEffect(() => {
    // Kullanıcı ayarlarını ve kategorileri çek
    fetch("/api/user-settings")
      .then((res) => res.json())
      .then((data) => {
        setUserSettings(data);
      })
      .catch((error) => {
      });

    const fetchCategories = async () => {
      try {
        const incomeResponse = await fetch("/api/categories?type=income");
        const expenseResponse = await fetch("/api/categories?type=expense");
        
        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();
        
        setCategories([...incomeData, ...expenseData]);
      } catch (error) {
      }
    };
    
    fetchCategories();
    
    fetchTransactions();
  }, []);
  
  // Düzenli işlemleri API'dan çek
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recurring-transactions");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        if (data.length > 0) {
          const sample = data[0];
        }
        
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tarihleri Date objesine dönüştür
  const transactionsArray = Array.isArray(transactions) ? transactions.map(t => {
    const nextDueDate = typeof t.nextDueDate === 'string' ? parseISO(t.nextDueDate) : new Date(t.nextDueDate);
    const startDate = typeof t.startDate === 'string' ? parseISO(t.startDate) : new Date(t.startDate);
    const endDate = t.endDate ? (typeof t.endDate === 'string' ? parseISO(t.endDate) : new Date(t.endDate)) : null;
    
    return {
      ...t,
      startDate,
      nextDueDate,
      endDate
    };
  }) : [];

  // Bugünün tarihi
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filtreleme işlemleri (tab ve tür bazında)
  const filteredTransactions = transactionsArray.filter((transaction) => {
    const isUpcoming = !isBefore(transaction.nextDueDate, today);
    const isDue = isBefore(transaction.nextDueDate, today);
    
    let tabCondition = true;
    if (activeTab === "upcoming") {
      tabCondition = isUpcoming;
    } else if (activeTab === "due") {
      tabCondition = isDue;
    }
    
    let typeCondition = true;
    if (filterType === "expense") {
      typeCondition = transaction.type === "expense";
    } else if (filterType === "income") {
      typeCondition = transaction.type === "income";
    }
    
    return tabCondition && typeCondition;
  });

  // İşlemleri ay ve yıla göre grupla
  const groupedTransactions = filteredTransactions.reduce<Record<string, RecurringTransaction[]>>((groups, transaction) => {
    const nextDueDate = transaction.nextDueDate;
    const monthYear = format(nextDueDate, "MMMM yyyy", { locale: tr });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(transaction);
    return groups;
  }, {});

  // Gecikmiş giderlerin toplamı
  const dueExpenses = transactionsArray
    .filter(t => {
      const isDue = t.type === "expense" && isBefore(t.nextDueDate, today) && t.isActive;
      return isDue;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Cari ayın başı
  const currentMonth = startOfMonth(new Date());
  
  // Cari ay gider ve gelir toplamları
  const currentMonthExpenses = transactionsArray
    .filter(t => {
      const isCurrentMonth = t.type === "expense" && 
                            isSameMonth(t.nextDueDate, currentMonth) && 
                            t.isActive;

      const isMonthlyRecurring = t.type === "expense" && 
                                t.frequency === "monthly" && 
                                t.isActive;
      
      const shouldInclude = isCurrentMonth || isMonthlyRecurring;
      
      return shouldInclude;
    })
    .reduce((sum, t) => sum + t.amount, 0);
    
  const currentMonthIncome = transactionsArray
    .filter(t => {
      const isCurrentMonth = t.type === "income" && 
                            isSameMonth(t.nextDueDate, currentMonth) && 
                            t.isActive;
      
      const isMonthlyRecurring = t.type === "income" && 
                                t.frequency === "monthly" && 
                                t.isActive;
      
      const shouldInclude = isCurrentMonth || isMonthlyRecurring;
      
      return shouldInclude;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      {/* Sayfa başlığı ve yeni işlem ekleme butonu */}
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">
              Düzenli İşlemler
            </p>
            <p className="text-muted-foreground">
              Faturalar, abonelikler ve düzenli ödemelerinizi yönetin
            </p>
          </div>
          
          <RecurringTransactionDialog
            categories={categories}
            successCallback={fetchTransactions}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Yeni Düzenli İşlem
              </Button>
            }
          />
        </div>
      </div>
      
      <div className="container py-6">
        {/* Özet kartlar */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aylık Düzenli Giderler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-2xl font-bold text-red-500">
                  {formatter.format(currentMonthExpenses)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aylık Düzenli Gelirler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" />
                <span className="text-2xl font-bold text-emerald-500">
                  {formatter.format(currentMonthIncome)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aylık Net Fark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {currentMonthIncome - currentMonthExpenses >= 0 ? (
                  <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                )}
                <span className={`text-2xl font-bold ${
                  currentMonthIncome - currentMonthExpenses >= 0 
                    ? "text-emerald-500" 
                    : "text-red-500"
                }`}>
                  {formatter.format(currentMonthIncome - currentMonthExpenses)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className={dueExpenses > 0 ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${dueExpenses > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                {dueExpenses > 0 ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Gecikmiş Ödemeler</span>
                  </div>
                ) : (
                  "Gecikmiş Ödemeler"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${dueExpenses > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                  {formatter.format(dueExpenses)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tab ve filtre alanı */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">Tümü</TabsTrigger>
              <TabsTrigger value="upcoming">Yaklaşan</TabsTrigger>
              <TabsTrigger value="due">Gecikmiş</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Tür filtresi */}
          <div className="w-full sm:w-64">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tür Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İşlemler</SelectItem>
                <SelectItem value="expense">Giderler</SelectItem>
                <SelectItem value="income">Gelirler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* İşlem listesi veya boş durum kartı */}
        <SkeletonWrapper isLoading={isLoading}>
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Düzenli işlem bulunamadı</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Faturalar, kira, abonelikler gibi düzenli işlemleri ekleyerek bütçenizi daha iyi yönetin.
                </p>
                <RecurringTransactionDialog
                  categories={categories}
                  successCallback={fetchTransactions}
                  trigger={
                    <Button className="mt-6 gap-2">
                      <Plus className="h-4 w-4" />
                      Yeni Düzenli İşlem Ekle
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            // İşlemler gruplandırılmış şekilde listelenir
            <div className="space-y-8">
              {Object.entries(groupedTransactions).map(([monthYear, txns]) => (
                <div key={monthYear}>
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold capitalize">{monthYear}</h2>
                    <Separator className="flex-1" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {txns.map((transaction) => (
                      <RecurringTransactionCard
                        key={transaction.id}
                        transaction={{
                          ...transaction,
                          startDate: typeof transaction.startDate === "string" ? new Date(transaction.startDate) : transaction.startDate,
                          endDate: transaction.endDate ? (typeof transaction.endDate === "string" ? new Date(transaction.endDate) : transaction.endDate) : undefined,
                          nextDueDate: typeof transaction.nextDueDate === "string" ? new Date(transaction.nextDueDate) : transaction.nextDueDate,
                        }}
                        formattedAmount={formatter.format(transaction.amount)}
                        categories={categories}
                        onDelete={fetchTransactions}
                        onUpdate={fetchTransactions}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SkeletonWrapper>
      </div>
    </>
  );
}