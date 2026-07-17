import { defaultIncomeSettings } from "@/lib/constants";
import type { ActualReceivedResult, MonthlyIncome } from "@/types/income";

export function calculateTurnover(workDays: number, tjm: number) {
  return workDays * tjm;
}

export function calculateManagementFee(
  turnover: number,
  managementFeeRate = defaultIncomeSettings.managementFeeRate
) {
  return turnover * managementFeeRate;
}

export function getPreviousMonth(month: string) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);

  if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
    return "";
  }

  const previousMonth = monthNumber === 1 ? 12 : monthNumber - 1;
  const previousYear = monthNumber === 1 ? year - 1 : year;

  return `${previousYear}-${String(previousMonth).padStart(2, "0")}`;
}

export function calculateMealCard(
  month: string,
  records: MonthlyIncome[],
  mealCardDailyAmount = defaultIncomeSettings.mealCardDailyAmount
) {
  const previousMonth = getPreviousMonth(month);
  const previousRecord = records.find((record) => record.month === previousMonth);
  const previousWorkDays = previousRecord?.workDays ?? null;
  const hasEarlierRecord = records.some((record) => record.month < month);

  return {
    amount: previousWorkDays === null ? 0 : previousWorkDays * mealCardDailyAmount,
    missingPreviousMonth: previousWorkDays === null && hasEarlierRecord,
    previousMonth,
    previousWorkDays
  };
}

export function calculateSalaryIncome(
  frenchSalary: number | null,
  ukBonus: number | null
) {
  if (frenchSalary === null && ukBonus === null) {
    return null;
  }

  return (frenchSalary ?? 0) + (ukBonus ?? 0);
}

export function calculateActualReceived(
  frenchSalary: number | null,
  ukBonus: number | null,
  mealCard: number,
  otherReimbursement: number | null
): ActualReceivedResult {
  if (
    frenchSalary === null ||
    ukBonus === null ||
    otherReimbursement === null
  ) {
    return {
      complete: false,
      amount: null
    };
  }

  return {
    complete: true,
    amount: frenchSalary + ukBonus + mealCard + otherReimbursement
  };
}

export function formatCurrency(value: number) {
  const hasCents = !Number.isInteger(value);
  const formattedValue = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  }).format(value);

  return `${formattedValue} €`;
}

export function formatOptionalCurrency(value: number | null) {
  return value === null ? "—" : formatCurrency(value);
}

export function sortRecordsDesc(records: MonthlyIncome[]) {
  return [...records].sort((a, b) => b.month.localeCompare(a.month));
}

export function sumRecordedValues(
  records: MonthlyIncome[],
  selector: (record: MonthlyIncome) => number | null
) {
  return records.reduce((total, record) => total + (selector(record) ?? 0), 0);
}
