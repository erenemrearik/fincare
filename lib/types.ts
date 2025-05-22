export type TransactionType = "income" | "expense";

export type Timeframe = "month" | "year";

export type Period = { year: number, month: number };

export interface UserSettings {
  userId: string;
  currency: string;
}