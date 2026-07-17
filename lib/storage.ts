"use client";

import {
  defaultIncomeSettings,
  initialMonthlyIncome,
  SETTINGS_STORAGE_KEY,
  STORAGE_KEY
} from "@/lib/constants";
import type { IncomeSettings, MonthlyIncome } from "@/types/income";

function isMonthlyIncome(value: unknown): value is MonthlyIncome {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  const nullableNumber = (field: unknown) =>
    field === null || typeof field === "number";

  return (
    typeof record.id === "string" &&
    typeof record.month === "string" &&
    typeof record.workDays === "number" &&
    typeof record.tjm === "number" &&
    nullableNumber(record.frenchSalary) &&
    nullableNumber(record.ukBonus) &&
    nullableNumber(record.otherReimbursement) &&
    (typeof record.note === "string" || typeof record.note === "undefined") &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

function normalizeMonthlyIncome(record: MonthlyIncome): MonthlyIncome {
  return {
    ...record,
    note: record.note ?? ""
  };
}

function isIncomeSettings(value: unknown): value is Partial<IncomeSettings> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const settings = value as Record<string, unknown>;

  return (
    (typeof settings.defaultTjm === "number" ||
      typeof settings.defaultTjm === "undefined") &&
    (typeof settings.managementFeeRate === "number" ||
      typeof settings.managementFeeRate === "undefined") &&
    (typeof settings.mealCardDailyAmount === "number" ||
      typeof settings.mealCardDailyAmount === "undefined")
  );
}

function normalizeIncomeSettings(settings: Partial<IncomeSettings>) {
  return {
    defaultTjm:
      typeof settings.defaultTjm === "number" && settings.defaultTjm > 0
        ? settings.defaultTjm
        : defaultIncomeSettings.defaultTjm,
    managementFeeRate:
      typeof settings.managementFeeRate === "number" &&
      settings.managementFeeRate >= 0
        ? settings.managementFeeRate
        : defaultIncomeSettings.managementFeeRate,
    mealCardDailyAmount:
      typeof settings.mealCardDailyAmount === "number" &&
      settings.mealCardDailyAmount >= 0
        ? settings.mealCardDailyAmount
        : defaultIncomeSettings.mealCardDailyAmount
  };
}

export function loadIncomeRecords() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMonthlyIncome));
      return initialMonthlyIncome;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue) || !parsedValue.every(isMonthlyIncome)) {
      throw new Error("Invalid localStorage payload");
    }

    const normalizedRecords = parsedValue.map(normalizeMonthlyIncome);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedRecords));

    return normalizedRecords;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMonthlyIncome));
    return initialMonthlyIncome;
  }
}

export function saveIncomeRecords(records: MonthlyIncome[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function loadIncomeSettings() {
  try {
    const storedValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!storedValue) {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(defaultIncomeSettings)
      );
      return defaultIncomeSettings;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isIncomeSettings(parsedValue)) {
      throw new Error("Invalid settings localStorage payload");
    }

    const normalizedSettings = normalizeIncomeSettings(parsedValue);
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizedSettings)
    );

    return normalizedSettings;
  } catch {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(defaultIncomeSettings)
    );
    return defaultIncomeSettings;
  }
}

export function saveIncomeSettings(settings: IncomeSettings) {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
