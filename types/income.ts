export type MonthlyIncome = {
  id: string;
  month: string;
  workDays: number;
  tjm: number;
  frenchSalary: number | null;
  ukBonus: number | null;
  otherReimbursement: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type IncomeFormValues = {
  month: string;
  workDays: string;
  tjm: string;
  frenchSalary: string;
  ukBonus: string;
  otherReimbursement: string;
  note: string;
};

export type IncomeSettings = {
  defaultTjm: number;
  managementFeeRate: number;
  mealCardDailyAmount: number;
};

export type IncomeSettingsFormValues = {
  defaultTjm: string;
  managementFeePercent: string;
  mealCardDailyAmount: string;
};

export type ActualReceivedResult =
  | {
      complete: true;
      amount: number;
    }
  | {
      complete: false;
      amount: null;
    };
