import type { IncomeSettings } from "@/types/income";

export const DEFAULT_TJM = 510;
export const MANAGEMENT_FEE_RATE = 0.07;
export const MEAL_CARD_PER_PREVIOUS_WORKDAY = 13;

export const defaultIncomeSettings: IncomeSettings = {
  defaultTjm: DEFAULT_TJM,
  managementFeeRate: MANAGEMENT_FEE_RATE,
  mealCardDailyAmount: MEAL_CARD_PER_PREVIOUS_WORKDAY
};
