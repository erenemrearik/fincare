'use server';

import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Yeni hedef oluşturma fonksiyonu
export async function createGoal(data: {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  type: string;
  targetDate: Date;
}) {
  // Kullanıcıyı al
  const user = await currentUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Hedefi veritabanına kaydet
  const goal = await prisma.goal.create({
    data: {
      name: data.name,
      description: data.description || "",
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      type: data.type,
      targetDate: data.targetDate,
      userId: user.id,
    },
  });

  // Hedefler sayfasını yeniden doğrula
  revalidatePath('/goals');
  return goal;
}

// Hedef güncelleme fonksiyonu
export async function updateGoal(data: {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  type: string;
  targetDate: Date;
}) {
  // Kullanıcıyı al
  const user = await currentUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Güncellenecek hedefi bul
  const existingGoal = await prisma.goal.findUnique({
    where: {
      id: data.id,
    },
  });
  
  if (!existingGoal || existingGoal.userId !== user.id) {
    throw new Error("Goal not found or not authorized");
  }
  
  // Hedefi güncelle
  const goal = await prisma.goal.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name,
      description: data.description,
      targetAmount: data.targetAmount,
      type: data.type,
      targetDate: data.targetDate,
    },
  });

  // Hedefler sayfasını yeniden doğrula
  revalidatePath('/goals');
  return goal;
}

// Hedef ilerlemesini güncelleme fonksiyonu
export async function updateGoalProgress(data: {
  id: string;
  currentAmount: number;
}) {
  // Kullanıcıyı al
  const user = await currentUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Güncellenecek hedefi bul
  const existingGoal = await prisma.goal.findUnique({
    where: {
      id: data.id,
    },
  });
  
  if (!existingGoal || existingGoal.userId !== user.id) {
    throw new Error("Goal not found or not authorized");
  }
  
  // Hedefin mevcut miktarını güncelle
  const goal = await prisma.goal.update({
    where: {
      id: data.id,
    },
    data: {
      currentAmount: data.currentAmount,
    },
  });

  // Hedefler sayfasını yeniden doğrula
  revalidatePath('/goals');
  return goal;
}

// Hedef silme fonksiyonu
export async function deleteGoal(goalId: string) {
  // Kullanıcıyı al
  const user = await currentUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Silinecek hedefi bul
  const existingGoal = await prisma.goal.findUnique({
    where: {
      id: goalId,
    },
  });
  
  if (!existingGoal || existingGoal.userId !== user.id) {
    throw new Error("Goal not found or not authorized");
  }
  
  // Hedefi sil
  await prisma.goal.delete({
    where: {
      id: goalId,
    },
  });

  // Hedefler sayfasını yeniden doğrula
  revalidatePath('/goals');
  return { success: true };
}