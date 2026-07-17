import type { IncomeSettings, MonthlyIncome } from "@/types/income";

export const STORAGE_KEY = "portage-income-records";
export const SETTINGS_STORAGE_KEY = "portage-income-settings";
export const DEFAULT_TJM = 510;
export const MANAGEMENT_FEE_RATE = 0.07;
export const MEAL_CARD_PER_PREVIOUS_WORKDAY = 13;

export const defaultIncomeSettings: IncomeSettings = {
  defaultTjm: DEFAULT_TJM,
  managementFeeRate: MANAGEMENT_FEE_RATE,
  mealCardDailyAmount: MEAL_CARD_PER_PREVIOUS_WORKDAY
};

export const initialMonthlyIncome: MonthlyIncome[] = [
  {
    id: "income-2026-03",
    month: "2026-03",
    workDays: 6,
    tjm: DEFAULT_TJM,
    frenchSalary: null,
    ukBonus: null,
    otherReimbursement: null,
    note: "",
    createdAt: "2026-03-31T12:00:00.000Z",
    updatedAt: "2026-03-31T12:00:00.000Z"
  },
  {
    id: "income-2026-04",
    month: "2026-04",
    workDays: 21,
    tjm: DEFAULT_TJM,
    frenchSalary: null,
    ukBonus: null,
    otherReimbursement: null,
    note: "",
    createdAt: "2026-04-30T12:00:00.000Z",
    updatedAt: "2026-04-30T12:00:00.000Z"
  },
  {
    id: "income-2026-05",
    month: "2026-05",
    workDays: 16,
    tjm: DEFAULT_TJM,
    frenchSalary: 1657,
    ukBonus: 2600,
    otherReimbursement: 385,
    note: "",
    createdAt: "2026-05-31T12:00:00.000Z",
    updatedAt: "2026-05-31T12:00:00.000Z"
  },
  {
    id: "income-2026-06",
    month: "2026-06",
    workDays: 22,
    tjm: DEFAULT_TJM,
    frenchSalary: null,
    ukBonus: null,
    otherReimbursement: 700,
    note: "",
    createdAt: "2026-06-30T12:00:00.000Z",
    updatedAt: "2026-06-30T12:00:00.000Z"
  }
];
