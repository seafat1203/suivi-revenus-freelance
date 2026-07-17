"use client";

import { defaultIncomeSettings } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase";
import type { IncomeSettings, MonthlyIncome } from "@/types/income";

type MonthlyIncomeRow = {
  id: string;
  user_id: string;
  month: string;
  work_days: number;
  tjm: number;
  french_salary: number | null;
  uk_bonus: number | null;
  other_reimbursement: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type IncomeSettingsRow = {
  user_id: string;
  default_tjm: number;
  management_fee_rate: number;
  meal_card_daily_amount: number;
  created_at?: string;
  updated_at?: string;
};

function toMonthlyIncome(row: MonthlyIncomeRow): MonthlyIncome {
  return {
    id: row.id,
    month: row.month,
    workDays: Number(row.work_days),
    tjm: Number(row.tjm),
    frenchSalary:
      row.french_salary === null ? null : Number(row.french_salary),
    ukBonus: row.uk_bonus === null ? null : Number(row.uk_bonus),
    otherReimbursement:
      row.other_reimbursement === null
        ? null
        : Number(row.other_reimbursement),
    note: row.note ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toMonthlyIncomeRow(
  record: MonthlyIncome,
  userId: string
): MonthlyIncomeRow {
  return {
    id: record.id,
    user_id: userId,
    month: record.month,
    work_days: record.workDays,
    tjm: record.tjm,
    french_salary: record.frenchSalary,
    uk_bonus: record.ukBonus,
    other_reimbursement: record.otherReimbursement,
    note: record.note,
    created_at: record.createdAt,
    updated_at: record.updatedAt
  };
}

function toIncomeSettings(row: IncomeSettingsRow): IncomeSettings {
  return {
    defaultTjm: Number(row.default_tjm),
    managementFeeRate: Number(row.management_fee_rate),
    mealCardDailyAmount: Number(row.meal_card_daily_amount)
  };
}

function toIncomeSettingsRow(
  settings: IncomeSettings,
  userId: string
): IncomeSettingsRow {
  return {
    user_id: userId,
    default_tjm: settings.defaultTjm,
    management_fee_rate: settings.managementFeeRate,
    meal_card_daily_amount: settings.mealCardDailyAmount
  };
}

export async function signInWithEmailAndPassword(
  email: string,
  password: string
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signUpWithEmailAndPassword(
  email: string,
  password: string
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signOutFromCloud() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function loadCloudIncomeRecords(userId: string) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("monthly_income_records")
    .select("*")
    .eq("user_id", userId)
    .order("month", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as MonthlyIncomeRow[]).map(toMonthlyIncome);
}

export async function loadCloudIncomeSettings(userId: string) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("income_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    await saveCloudIncomeSettings(userId, defaultIncomeSettings);
    return defaultIncomeSettings;
  }

  return toIncomeSettings(data as IncomeSettingsRow);
}

export async function saveCloudIncomeSettings(
  userId: string,
  settings: IncomeSettings
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("income_settings").upsert({
    ...toIncomeSettingsRow(settings, userId),
    updated_at: new Date().toISOString()
  });

  if (error) {
    throw error;
  }
}

export async function upsertCloudIncomeRecord(
  userId: string,
  record: MonthlyIncome
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("monthly_income_records")
    .upsert(toMonthlyIncomeRow(record, userId));

  if (error) {
    throw error;
  }
}

export async function deleteCloudIncomeRecord(userId: string, recordId: string) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("monthly_income_records")
    .delete()
    .eq("user_id", userId)
    .eq("id", recordId);

  if (error) {
    throw error;
  }
}
