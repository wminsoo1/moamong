export interface Spending {
  id: number;
  type: "EXPENSE" | "INCOME";
  categoryName: string;
  categoryGroup: string;
  categoryGroupLabel: string;
  amount: number;
  date: string;
  memo: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface WeekEntry {
  week: number;
  startDate: string;
  endDate: string;
  amount: number;
}

export interface WeeklyStats {
  year: number;
  month: number;
  totalAmount: number;
  weeks: WeekEntry[];
}

export interface CategoryEntry {
  categoryGroup: string;
  categoryGroupLabel: string;
  amount: number;
  count: number;
  percentage: number;
  lastMonthAmount: number;
}

export interface CategoryStats {
  year: number;
  month: number;
  totalAmount: number;
  lastMonthTotalAmount: number;
  categories: CategoryEntry[];
}

export interface ChartWeekItem {
  name: string;
  amount: number;
  date: string;
  startDate: string;
  endDate: string;
  week: number;
}

export interface SpendingInput {
  type: "EXPENSE" | "INCOME";
  categoryId?: number | null;
  categoryGroupKey?: string | null;
  amount: number;
  date: string;
  memo: string | null;
  imageUrl?: string | null;
}

export interface RecurringSpending {
  id: number;
  type: "EXPENSE" | "INCOME";
  categoryName: string;
  categoryGroup: string;
  categoryGroupLabel: string;
  amount: number;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
  memo: string | null;
  createdAt: string;
}

export interface RecurringSpendingInput {
  type: "EXPENSE" | "INCOME";
  categoryId?: number | null;
  categoryGroupKey?: string | null;
  amount: number;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
  memo: string | null;
}
