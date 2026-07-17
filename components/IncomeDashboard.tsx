"use client";

import {
  BarChart3,
  CalendarDays,
  ChartPie,
  CircleDollarSign,
  Edit3,
  FilePenLine,
  Landmark,
  Plus,
  ReceiptText,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
  WalletCards,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  calculateActualReceived,
  calculateManagementFee,
  calculateMealCard,
  calculateSalaryIncome,
  calculateTurnover,
  formatCurrency,
  formatOptionalCurrency,
  sortRecordsDesc
} from "@/lib/calculations";
import { defaultIncomeSettings } from "@/lib/constants";
import {
  loadIncomeRecords,
  loadIncomeSettings,
  saveIncomeRecords,
  saveIncomeSettings
} from "@/lib/storage";
import type {
  IncomeFormValues,
  IncomeSettings,
  IncomeSettingsFormValues,
  MonthlyIncome
} from "@/types/income";

const summaryYear = "2026";

function getDefaultFormValues(defaultTjm: number): IncomeFormValues {
  return {
    month: "",
    workDays: "",
    tjm: String(defaultTjm),
    frenchSalary: "",
    ukBonus: "",
    otherReimbursement: "",
    note: ""
  };
}

function formatNumberForInput(value: number) {
  return String(Number(value.toFixed(4)));
}

function settingsToForm(settings: IncomeSettings): IncomeSettingsFormValues {
  return {
    defaultTjm: formatNumberForInput(settings.defaultTjm),
    managementFeePercent: formatNumberForInput(settings.managementFeeRate * 100),
    mealCardDailyAmount: formatNumberForInput(settings.mealCardDailyAmount)
  };
}

function formatPercent(rate: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2
  }).format(rate * 100)}%`;
}

function formatShare(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1
  }).format((value / total) * 100)}%`;
}

type ParsedForm = {
  month: string;
  workDays: number;
  tjm: number;
  frenchSalary: number | null;
  ukBonus: number | null;
  otherReimbursement: number | null;
  note: string;
};

type ParsedSettingsForm = {
  defaultTjm: number;
  managementFeeRate: number;
  mealCardDailyAmount: number;
};

function parseRequiredNumber(value: string) {
  const normalizedValue = value.trim();

  if (normalizedValue === "") {
    return Number.NaN;
  }

  return Number(normalizedValue);
}

function parseOptionalNumber(value: string) {
  const normalizedValue = value.trim();

  if (normalizedValue === "") {
    return null;
  }

  return Number(normalizedValue);
}

function isMonthValue(value: string) {
  return /^\d{4}-\d{2}$/.test(value);
}

function recordToForm(record: MonthlyIncome): IncomeFormValues {
  return {
    month: record.month,
    workDays: String(record.workDays),
    tjm: String(record.tjm),
    frenchSalary: record.frenchSalary === null ? "" : String(record.frenchSalary),
    ukBonus: record.ukBonus === null ? "" : String(record.ukBonus),
    otherReimbursement:
      record.otherReimbursement === null ? "" : String(record.otherReimbursement),
    note: record.note
  };
}

function parseForm(values: IncomeFormValues): ParsedForm {
  return {
    month: values.month,
    workDays: parseRequiredNumber(values.workDays),
    tjm: parseRequiredNumber(values.tjm),
    frenchSalary: parseOptionalNumber(values.frenchSalary),
    ukBonus: parseOptionalNumber(values.ukBonus),
    otherReimbursement: parseOptionalNumber(values.otherReimbursement),
    note: values.note.trim()
  };
}

function parseSettingsForm(values: IncomeSettingsFormValues): ParsedSettingsForm {
  return {
    defaultTjm: parseRequiredNumber(values.defaultTjm),
    managementFeeRate: parseRequiredNumber(values.managementFeePercent) / 100,
    mealCardDailyAmount: parseRequiredNumber(values.mealCardDailyAmount)
  };
}

function isValidOptionalAmount(value: number | null) {
  return value === null || (Number.isFinite(value) && value >= 0);
}

function EmptyValue() {
  return <span className="text-ink/35">—</span>;
}

function ActualReceivedValue({
  complete,
  amount
}: {
  complete: boolean;
  amount: number | null;
}) {
  if (!complete || amount === null) {
    return <span className="font-medium text-clay">Données incomplètes</span>;
  }

  return <span className="font-bold text-moss">{formatCurrency(amount)}</span>;
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric"
  }).format(new Date(Number(year), Number(monthNumber) - 1, 1));
}

function SummaryCard({
  label,
  value,
  note,
  tone = "paper",
  icon: Icon
}: {
  label: string;
  value: string;
  note: string;
  tone?: "paper" | "ink" | "clay";
  icon: typeof CalendarDays;
}) {
  const toneClass = {
    paper: "border-ink/15 bg-[#f8f5ec] text-ink",
    ink: "border-ink bg-ink text-paper",
    clay: "border-clay/35 bg-[#f2dfcf] text-ink"
  }[tone];

  return (
    <article className={`border p-4 ${toneClass}`} style={{ borderRadius: 7 }}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium opacity-75">{label}</p>
        <Icon className="h-5 w-5 opacity-70" />
      </div>
      <p className="text-2xl font-semibold leading-none md:text-3xl">{value}</p>
      <p className="mt-2 text-xs leading-relaxed opacity-65">{note}</p>
    </article>
  );
}

function SettingsPanel({
  values,
  error,
  onChange,
  onSubmit
}: {
  values: IncomeSettingsFormValues;
  error: string;
  onChange: (field: keyof IncomeSettingsFormValues, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="border border-ink/15 bg-[#ebe4d7] p-4 text-sm text-ink md:min-w-80"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <SlidersHorizontal className="h-4 w-4 text-clay" />
        Paramètres
      </div>
      <div className="grid gap-3">
        <label className="grid grid-cols-[1fr_116px] items-center gap-3">
          <span className="text-ink/65">TJM par défaut</span>
          <input
            className="field-input px-2 py-1.5 text-right text-sm font-semibold"
            min="0.01"
            onChange={(event) => onChange("defaultTjm", event.target.value)}
            step="0.01"
            type="number"
            value={values.defaultTjm}
          />
        </label>
        <label className="grid grid-cols-[1fr_116px] items-center gap-3">
          <span className="text-ink/65">Frais de gestion %</span>
          <input
            className="field-input px-2 py-1.5 text-right text-sm font-semibold"
            min="0"
            onChange={(event) =>
              onChange("managementFeePercent", event.target.value)
            }
            step="0.01"
            type="number"
            value={values.managementFeePercent}
          />
        </label>
        <label className="grid grid-cols-[1fr_116px] items-center gap-3">
          <span className="text-ink/65">Titre resto €/jour</span>
          <input
            className="field-input px-2 py-1.5 text-right text-sm font-semibold"
            min="0"
            onChange={(event) =>
              onChange("mealCardDailyAmount", event.target.value)
            }
            step="0.01"
            type="number"
            value={values.mealCardDailyAmount}
          />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-clay">{error}</p> : null}
      <button
        className="mt-4 inline-flex items-center gap-2 bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-moss"
        style={{ borderRadius: 6 }}
        type="submit"
      >
        <Save className="h-4 w-4" />
        Enregistrer
      </button>
    </form>
  );
}

function IncomeCompositionChart({
  records,
  settings
}: {
  records: MonthlyIncome[];
  settings: IncomeSettings;
}) {
  const sortedRecords = [...records].sort((a, b) => a.month.localeCompare(b.month));
  const chartRows = sortedRecords.map((record) => {
    const mealCard = calculateMealCard(
      record.month,
      records,
      settings.mealCardDailyAmount
    ).amount;
    const categories = [
      {
        key: "frenchSalary",
        label: "Salaire France",
        amount: record.frenchSalary,
        valueForBar: record.frenchSalary ?? 0,
        barClass: "bg-[#1f70cf]",
        textClass: "text-[#1f70cf]"
      },
      {
        key: "ukBonus",
        label: "Bonus UK",
        amount: record.ukBonus,
        valueForBar: record.ukBonus ?? 0,
        barClass: "bg-[#0f8a5f]",
        textClass: "text-[#0f8a5f]"
      },
      {
        key: "otherReimbursement",
        label: "Remb.",
        amount: record.otherReimbursement,
        valueForBar: record.otherReimbursement ?? 0,
        barClass: "bg-[#f97316]",
        textClass: "text-[#f97316]"
      },
      {
        key: "mealCard",
        label: "Titres resto",
        amount: mealCard,
        valueForBar: mealCard,
        barClass: "bg-[#8b3fa0]",
        textClass: "text-[#8b3fa0]"
      }
    ];
    const actualReceived = calculateActualReceived(
      record.frenchSalary,
      record.ukBonus,
      mealCard,
      record.otherReimbursement
    );

    return {
      record,
      categories,
      turnover: calculateTurnover(record.workDays, record.tjm),
      actualReceived
    };
  });
  const maxAmount = Math.max(
    1,
    ...chartRows.flatMap((row) =>
      row.categories.map((category) => category.valueForBar)
    )
  );
  const legend = chartRows[0]?.categories ?? [];

  if (chartRows.length === 0) {
    return null;
  }

  return (
    <section className="ledger-panel overflow-hidden">
      <div className="border-b border-ink/15 px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-clay" />
            <h2 className="text-xl font-semibold text-ink">
              Composition mensuelle du revenu net
            </h2>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-ink/65">
            {legend.map((item) => (
              <span className="inline-flex items-center gap-1.5" key={item.key}>
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 ${item.barClass}`}
                  style={{ borderRadius: 3 }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        {chartRows.map((row) => (
          <article
            className="border border-ink/12 bg-[#fbf8f0] p-4"
            key={row.record.id}
            style={{ borderRadius: 7 }}
          >
            <div className="mb-4 text-center">
              <h3 className="text-lg font-semibold text-ink">
                {formatMonthLabel(row.record.month)}
              </h3>
              <p className="mt-1 text-sm font-medium text-ink/65">
                {row.record.workDays} j | CA {formatCurrency(row.turnover)}
              </p>
            </div>

            <div className="space-y-3">
              {row.categories.map((category) => {
                const width =
                  category.valueForBar === 0
                    ? 0
                    : Math.max((category.valueForBar / maxAmount) * 100, 3);

                return (
                  <div
                    className="grid grid-cols-[76px_1fr_72px] items-center gap-2"
                    key={category.key}
                  >
                    <span
                      className={`text-sm font-semibold ${category.textClass}`}
                    >
                      {category.label}
                    </span>
                    <div className="h-5 border-l border-ink/15 bg-ink/5">
                      <div
                        aria-label={`${category.label} ${
                          category.amount === null
                            ? "Non renseigné"
                            : formatCurrency(category.amount)
                        }`}
                        className={`h-full ${category.barClass}`}
                        style={{
                          borderRadius: "0 4px 4px 0",
                          width: `${width}%`
                        }}
                      />
                    </div>
                    <span
                      className={`text-right text-sm font-semibold ${category.textClass}`}
                    >
                      {category.amount === null
                        ? "—"
                        : formatCurrency(category.amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-dashed border-ink/20 pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">
                  Net reçu
                </span>
                <ActualReceivedValue
                  amount={row.actualReceived.amount}
                  complete={row.actualReceived.complete}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SummarySection({
  records,
  settings
}: {
  records: MonthlyIncome[];
  settings: IncomeSettings;
}) {
  const summary = useMemo(() => {
    const annualRecords = records.filter((record) =>
      record.month.startsWith(`${summaryYear}-`)
    );

    return annualRecords.reduce(
      (total, record) => {
        const turnover = calculateTurnover(record.workDays, record.tjm);
        const mealCard = calculateMealCard(
          record.month,
          records,
          settings.mealCardDailyAmount
        ).amount;
        const actualReceived = calculateActualReceived(
          record.frenchSalary,
          record.ukBonus,
          mealCard,
          record.otherReimbursement
        );

        total.workDays += record.workDays;
        total.turnover += turnover;
        total.managementFee += calculateManagementFee(
          turnover,
          settings.managementFeeRate
        );
        total.recordedSalary += (record.frenchSalary ?? 0) + (record.ukBonus ?? 0);
        total.recordedReimbursement += record.otherReimbursement ?? 0;

        if (actualReceived.complete) {
          total.completeReceived += actualReceived.amount;
        }

        return total;
      },
      {
        workDays: 0,
        turnover: 0,
        managementFee: 0,
        recordedSalary: 0,
        recordedReimbursement: 0,
        completeReceived: 0
      }
    );
  }, [records, settings.managementFeeRate, settings.mealCardDailyAmount]);

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        icon={CalendarDays}
        label={`${summaryYear} jours travaillés`}
        note="Total des jours travaillés saisis"
        value={`${summary.workDays} j`}
      />
      <SummaryCard
        icon={Landmark}
        label="Chiffre d'affaires cumulé"
        note="Jours travaillés × TJM du mois"
        tone="ink"
        value={formatCurrency(summary.turnover)}
      />
      <SummaryCard
        icon={ReceiptText}
        label="Frais de gestion cumulés"
        note={`${formatPercent(settings.managementFeeRate)} calculé automatiquement`}
        value={formatCurrency(summary.managementFee)}
      />
      <SummaryCard
        icon={CircleDollarSign}
        label="Revenus salariaux saisis"
        note="Salaire France et bonus UK renseignés"
        value={formatCurrency(summary.recordedSalary)}
      />
      <SummaryCard
        icon={WalletCards}
        label="Remboursements saisis"
        note="Remboursements hors titres resto renseignés"
        value={formatCurrency(summary.recordedReimbursement)}
      />
      <SummaryCard
        icon={Save}
        label="Net reçu complet"
        note="Mois où salaire, bonus et remboursements sont complets"
        tone="clay"
        value={formatCurrency(summary.completeReceived)}
      />
    </section>
  );
}

function AnnualIncomeDistributionChart({
  records,
  settings
}: {
  records: MonthlyIncome[];
  settings: IncomeSettings;
}) {
  const annualRecords = records.filter((record) =>
    record.month.startsWith(`${summaryYear}-`)
  );
  const categories = [
    {
      key: "frenchSalary",
      label: "Salaire France",
      amount: annualRecords.reduce(
        (total, record) => total + (record.frenchSalary ?? 0),
        0
      ),
      color: "#1f70cf"
    },
    {
      key: "ukBonus",
      label: "Bonus UK",
      amount: annualRecords.reduce(
        (total, record) => total + (record.ukBonus ?? 0),
        0
      ),
      color: "#0f8a5f"
    },
    {
      key: "otherReimbursement",
      label: "Remboursements",
      amount: annualRecords.reduce(
        (total, record) => total + (record.otherReimbursement ?? 0),
        0
      ),
      color: "#f97316"
    },
    {
      key: "mealCard",
      label: "Titres resto",
      amount: annualRecords.reduce(
        (total, record) =>
          total +
          calculateMealCard(
            record.month,
            records,
            settings.mealCardDailyAmount
          ).amount,
        0
      ),
      color: "#8b3fa0"
    }
  ];
  const total = categories.reduce((sum, category) => sum + category.amount, 0);
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="ledger-panel overflow-hidden">
      <div className="border-b border-ink/15 px-5 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <ChartPie className="h-5 w-5 text-clay" />
          <h2 className="text-xl font-semibold text-ink">
            Répartition des revenus {summaryYear}
          </h2>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-[300px_1fr] md:items-center md:p-6">
        <div className="mx-auto w-full max-w-72">
          <div className="relative aspect-square">
            <svg
              aria-labelledby="annual-income-distribution-title annual-income-distribution-desc"
              className="h-full w-full"
              role="img"
              viewBox="0 0 220 220"
            >
              <title id="annual-income-distribution-title">
                Répartition des revenus {summaryYear}
              </title>
              <desc id="annual-income-distribution-desc">
                Répartition annuelle par salaire France, bonus UK, remboursements et titres resto.
              </desc>
              <circle
                cx="110"
                cy="110"
                fill="none"
                r={radius}
                stroke="rgba(38, 53, 47, 0.08)"
                strokeWidth="34"
              />
              {categories.map((category) => {
                const length =
                  total > 0 ? (category.amount / total) * circumference : 0;
                const segment = (
                  <circle
                    cx="110"
                    cy="110"
                    fill="none"
                    key={category.key}
                    r={radius}
                    stroke={category.color}
                    strokeDasharray={`${length} ${circumference}`}
                    strokeDashoffset={-offset}
                    strokeWidth="34"
                    transform="rotate(-90 110 110)"
                  />
                );

                offset += length;

                return segment;
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-ink/55">Total</span>
              <strong className="mt-1 text-2xl font-semibold text-ink">
                {formatCurrency(total)}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              className="border border-ink/12 bg-[#fbf8f0] p-4"
              key={category.key}
              style={{ borderRadius: 7 }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3"
                    style={{
                      backgroundColor: category.color,
                      borderRadius: 3
                    }}
                  />
                  {category.label}
                </span>
                <span className="text-sm font-semibold text-ink/60">
                  {formatShare(category.amount, total)}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <strong className="text-2xl font-semibold text-ink">
                  {formatCurrency(category.amount)}
                </strong>
                <div className="h-2 w-24 bg-ink/8">
                  <div
                    className="h-full"
                    style={{
                      backgroundColor: category.color,
                      borderRadius: 999,
                      width: total > 0 ? `${(category.amount / total) * 100}%` : 0
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CalculationPreview({
  values,
  records,
  settings
}: {
  values: IncomeFormValues;
  records: MonthlyIncome[];
  settings: IncomeSettings;
}) {
  const parsed = parseForm(values);
  const safeWorkDays = Number.isFinite(parsed.workDays) ? parsed.workDays : 0;
  const safeTjm = Number.isFinite(parsed.tjm) ? parsed.tjm : settings.defaultTjm;
  const turnover = calculateTurnover(safeWorkDays, safeTjm);
  const managementFee = calculateManagementFee(
    turnover,
    settings.managementFeeRate
  );
  const mealCard = parsed.month
    ? calculateMealCard(
        parsed.month,
        records,
        settings.mealCardDailyAmount
      )
    : {
        amount: 0,
        missingPreviousMonth: true,
        previousMonth: "",
        previousWorkDays: null
      };
  const salaryIncome = calculateSalaryIncome(parsed.frenchSalary, parsed.ukBonus);
  const actualReceived = calculateActualReceived(
    parsed.frenchSalary,
    parsed.ukBonus,
    mealCard.amount,
    parsed.otherReimbursement
  );

  const rows = [
    {
      label: "Jours travaillés le mois précédent",
      value:
        mealCard.previousWorkDays === null ? (
          <span className="text-clay">Mois précédent manquant</span>
        ) : (
          `${mealCard.previousWorkDays} j`
        )
    },
    { label: "Chiffre d'affaires", value: formatCurrency(turnover) },
    { label: "Frais de gestion", value: formatCurrency(managementFee) },
    { label: "Titres resto", value: formatCurrency(mealCard.amount) },
    {
      label: "Revenus salariaux",
      value: salaryIncome === null ? <EmptyValue /> : formatCurrency(salaryIncome)
    },
    {
      label: "Net reçu",
      value: (
        <ActualReceivedValue
          amount={actualReceived.amount}
          complete={actualReceived.complete}
        />
      )
    }
  ];

  return (
    <aside className="border-l-4 border-moss bg-[#edf0e4] p-5">
      <div className="mb-5 flex items-center gap-2">
        <FilePenLine className="h-5 w-5 text-moss" />
        <h3 className="text-lg font-semibold text-ink">Calcul en temps réel</h3>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            className="flex items-center justify-between gap-4 border-b border-ink/10 pb-2 last:border-0 last:pb-0"
            key={row.label}
          >
            <span className="text-sm text-ink/65">{row.label}</span>
            <span className="text-right text-sm font-semibold text-ink">
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {mealCard.missingPreviousMonth && parsed.month ? (
        <p className="mt-4 border border-clay/25 bg-[#fbf1e7] px-3 py-2 text-sm text-clay">
          Aucun enregistrement trouvé pour {mealCard.previousMonth}. Les titres resto sont calculés à 0.
        </p>
      ) : null}
    </aside>
  );
}

function IncomeForm({
  values,
  records,
  settings,
  editingId,
  error,
  onChange,
  onCancel,
  onReset,
  onSubmit
}: {
  values: IncomeFormValues;
  records: MonthlyIncome[];
  settings: IncomeSettings;
  editingId: string | null;
  error: string;
  onChange: (field: keyof IncomeFormValues, value: string) => void;
  onCancel: () => void;
  onReset: () => void;
  onSubmit: () => void;
}) {
  const title = editingId ? "Modifier le mois" : "Ajouter un mois";

  return (
    <section className="ledger-panel grid overflow-hidden lg:grid-cols-[1fr_340px]">
      <form
        className="p-5 md:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-clay">
              {editingId ? "Modification en cours" : "Nouvel enregistrement"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">{title}</h2>
          </div>
          {editingId ? (
            <button
              className="inline-flex items-center gap-2 border border-ink/20 px-3 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-paper"
              onClick={onCancel}
              style={{ borderRadius: 6 }}
              type="button"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="field-label">Mois</span>
            <input
              className="field-input"
              onChange={(event) => onChange("month", event.target.value)}
              type="month"
              value={values.month}
            />
          </label>
          <label className="space-y-2">
            <span className="field-label">Jours travaillés</span>
            <input
              className="field-input"
              min="0"
              onChange={(event) => onChange("workDays", event.target.value)}
              placeholder="Ex. 21"
              step="1"
              type="number"
              value={values.workDays}
            />
          </label>
          <label className="space-y-2">
            <span className="field-label">TJM</span>
            <input
              className="field-input"
              min="0.01"
              onChange={(event) => onChange("tjm", event.target.value)}
              step="0.01"
              type="number"
              value={values.tjm}
            />
          </label>
          <label className="space-y-2">
            <span className="field-label">Salaire France</span>
            <input
              className="field-input"
              min="0"
              onChange={(event) => onChange("frenchSalary", event.target.value)}
              placeholder="Vide si non renseigné"
              step="0.01"
              type="number"
              value={values.frenchSalary}
            />
          </label>
          <label className="space-y-2">
            <span className="field-label">Bonus UK</span>
            <input
              className="field-input"
              min="0"
              onChange={(event) => onChange("ukBonus", event.target.value)}
              placeholder="Vide si non renseigné"
              step="0.01"
              type="number"
              value={values.ukBonus}
            />
          </label>
          <label className="space-y-2">
            <span className="field-label">Remboursements</span>
            <input
              className="field-input"
              min="0"
              onChange={(event) =>
                onChange("otherReimbursement", event.target.value)
              }
              placeholder="Hors titres resto"
              step="0.01"
              type="number"
              value={values.otherReimbursement}
            />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="field-label">Note</span>
            <textarea
              className="field-input min-h-24 resize-y"
              onChange={(event) => onChange("note", event.target.value)}
              placeholder="Ex. beaucoup de jours fériés, congés, aucun congé"
              value={values.note}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 border border-clay/30 bg-[#fbf1e7] px-3 py-2 text-sm font-medium text-clay">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-moss"
            style={{ borderRadius: 6 }}
            type="submit"
          >
            <Save className="h-4 w-4" />
            Enregistrer
          </button>
          <button
            className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
            onClick={onReset}
            style={{ borderRadius: 6 }}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </button>
        </div>
      </form>
      <CalculationPreview records={records} settings={settings} values={values} />
    </section>
  );
}

function IncomeTable({
  records,
  settings,
  onEdit,
  onDelete
}: {
  records: MonthlyIncome[];
  settings: IncomeSettings;
  onEdit: (record: MonthlyIncome) => void;
  onDelete: (record: MonthlyIncome) => void;
}) {
  return (
    <section className="ledger-panel overflow-hidden">
      <div className="border-b border-ink/15 px-5 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-5 w-5 text-clay" />
          <h2 className="text-xl font-semibold text-ink">Enregistrements mensuels</h2>
        </div>
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#e8dfce] text-xs uppercase text-ink/65">
            <tr>
              <th className="px-4 py-3">Mois</th>
              <th className="px-4 py-3">Jours</th>
              <th className="px-4 py-3">TJM</th>
              <th className="px-4 py-3">CA</th>
              <th className="px-4 py-3">Frais</th>
              <th className="px-4 py-3">Salaire FR</th>
              <th className="px-4 py-3">Bonus UK</th>
              <th className="px-4 py-3">Titres resto</th>
              <th className="px-4 py-3">Remb.</th>
              <th className="px-4 py-3">Net reçu</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortRecordsDesc(records).map((record) => {
              const turnover = calculateTurnover(record.workDays, record.tjm);
              const mealCard = calculateMealCard(
                record.month,
                records,
                settings.mealCardDailyAmount
              );
              const actualReceived = calculateActualReceived(
                record.frenchSalary,
                record.ukBonus,
                mealCard.amount,
                record.otherReimbursement
              );

              return (
                <tr
                  className="border-t border-ink/10 bg-[#fbf8f0] align-top transition hover:bg-[#f6eddc]"
                  key={record.id}
                >
                  <td className="whitespace-nowrap px-4 py-4 font-semibold">
                    {record.month}
                  </td>
                  <td className="px-4 py-4">{record.workDays} j</td>
                  <td className="px-4 py-4">{formatCurrency(record.tjm)}</td>
                  <td className="px-4 py-4 font-medium">
                    {formatCurrency(turnover)}
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(
                      calculateManagementFee(turnover, settings.managementFeeRate)
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {formatOptionalCurrency(record.frenchSalary)}
                  </td>
                  <td className="px-4 py-4">
                    {formatOptionalCurrency(record.ukBonus)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">{formatCurrency(mealCard.amount)}</div>
                    {mealCard.missingPreviousMonth ? (
                      <div className="mt-1 text-xs text-clay">
                        Mois précédent manquant
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    {formatOptionalCurrency(record.otherReimbursement)}
                  </td>
                  <td className="px-4 py-4">
                    <ActualReceivedValue
                      amount={actualReceived.amount}
                      complete={actualReceived.complete}
                    />
                  </td>
                  <td className="max-w-56 px-4 py-4 text-sm leading-6 text-ink/72">
                    {record.note ? record.note : <EmptyValue />}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        aria-label={`Modifier ${record.month}`}
                        className="inline-flex h-9 w-9 items-center justify-center border border-ink/20 text-ink transition hover:border-moss hover:bg-moss hover:text-paper"
                        onClick={() => onEdit(record)}
                        style={{ borderRadius: 6 }}
                        type="button"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Supprimer ${record.month}`}
                        className="inline-flex h-9 w-9 items-center justify-center border border-clay/35 text-clay transition hover:bg-clay hover:text-paper"
                        onClick={() => onDelete(record)}
                        style={{ borderRadius: 6 }}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 lg:hidden">
        {sortRecordsDesc(records).map((record) => (
          <IncomeMobileCard
            key={record.id}
            onDelete={onDelete}
            onEdit={onEdit}
            record={record}
            records={records}
            settings={settings}
          />
        ))}
      </div>
    </section>
  );
}

function MobileMetric({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-ink/10 pt-2">
      <p className="text-xs text-ink/55">{label}</p>
      <div className="mt-1 text-sm font-semibold text-ink">{children}</div>
    </div>
  );
}

function IncomeMobileCard({
  record,
  records,
  settings,
  onEdit,
  onDelete
}: {
  record: MonthlyIncome;
  records: MonthlyIncome[];
  settings: IncomeSettings;
  onEdit: (record: MonthlyIncome) => void;
  onDelete: (record: MonthlyIncome) => void;
}) {
  const turnover = calculateTurnover(record.workDays, record.tjm);
  const mealCard = calculateMealCard(
    record.month,
    records,
    settings.mealCardDailyAmount
  );
  const actualReceived = calculateActualReceived(
    record.frenchSalary,
    record.ukBonus,
    mealCard.amount,
    record.otherReimbursement
  );

  return (
    <article
      className="border border-ink/15 bg-[#fbf8f0] p-4"
      style={{ borderRadius: 7 }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-clay">Mois</p>
          <h3 className="text-xl font-semibold text-ink">{record.month}</h3>
        </div>
        <div className="flex gap-2">
          <button
            aria-label={`Modifier ${record.month}`}
            className="inline-flex h-9 w-9 items-center justify-center border border-ink/20 text-ink"
            onClick={() => onEdit(record)}
            style={{ borderRadius: 6 }}
            type="button"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            aria-label={`Supprimer ${record.month}`}
            className="inline-flex h-9 w-9 items-center justify-center border border-clay/35 text-clay"
            onClick={() => onDelete(record)}
            style={{ borderRadius: 6 }}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MobileMetric label="Jours travaillés">{record.workDays} j</MobileMetric>
        <MobileMetric label="TJM">{formatCurrency(record.tjm)}</MobileMetric>
        <MobileMetric label="Chiffre d'affaires">{formatCurrency(turnover)}</MobileMetric>
        <MobileMetric label="Frais de gestion">
          {formatCurrency(
            calculateManagementFee(turnover, settings.managementFeeRate)
          )}
        </MobileMetric>
        <MobileMetric label="Salaire France">
          {formatOptionalCurrency(record.frenchSalary)}
        </MobileMetric>
        <MobileMetric label="Bonus UK">
          {formatOptionalCurrency(record.ukBonus)}
        </MobileMetric>
        <MobileMetric label="Titres resto">
          {formatCurrency(mealCard.amount)}
          {mealCard.missingPreviousMonth ? (
            <span className="mt-1 block text-xs font-medium text-clay">
              Mois précédent manquant
            </span>
          ) : null}
        </MobileMetric>
        <MobileMetric label="Remboursements">
          {formatOptionalCurrency(record.otherReimbursement)}
        </MobileMetric>
        <div className="col-span-2">
          <MobileMetric label="Note">
            {record.note ? (
              <span className="font-medium text-ink/75">{record.note}</span>
            ) : (
              <EmptyValue />
            )}
          </MobileMetric>
        </div>
        <div className="col-span-2">
          <MobileMetric label="Net reçu">
            <ActualReceivedValue
              amount={actualReceived.amount}
              complete={actualReceived.complete}
            />
          </MobileMetric>
        </div>
      </div>
    </article>
  );
}

export function IncomeDashboard() {
  const [records, setRecords] = useState<MonthlyIncome[]>([]);
  const [settings, setSettings] =
    useState<IncomeSettings>(defaultIncomeSettings);
  const [settingsFormValues, setSettingsFormValues] =
    useState<IncomeSettingsFormValues>(
      settingsToForm(defaultIncomeSettings)
    );
  const [formValues, setFormValues] = useState<IncomeFormValues>(
    getDefaultFormValues(defaultIncomeSettings.defaultTjm)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadedSettings = loadIncomeSettings();

    setSettings(loadedSettings);
    setSettingsFormValues(settingsToForm(loadedSettings));
    setFormValues(getDefaultFormValues(loadedSettings.defaultTjm));
    setRecords(loadIncomeRecords());
    setIsReady(true);
  }, []);

  function commitRecords(nextRecords: MonthlyIncome[]) {
    setRecords(nextRecords);
    saveIncomeRecords(nextRecords);
  }

  function updateFormValue(field: keyof IncomeFormValues, value: string) {
    setError("");
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));
  }

  function updateSettingsFormValue(
    field: keyof IncomeSettingsFormValues,
    value: string
  ) {
    setSettingsError("");
    setSettingsFormValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));
  }

  function resetForm() {
    setFormValues(getDefaultFormValues(settings.defaultTjm));
    setEditingId(null);
    setError("");
  }

  function validateSettingsForm(parsed: ParsedSettingsForm) {
    if (!Number.isFinite(parsed.defaultTjm) || parsed.defaultTjm <= 0) {
      return "Le TJM par défaut doit être supérieur à 0.";
    }

    if (
      !Number.isFinite(parsed.managementFeeRate) ||
      parsed.managementFeeRate < 0
    ) {
      return "Le taux des frais de gestion ne peut pas être négatif.";
    }

    if (
      !Number.isFinite(parsed.mealCardDailyAmount) ||
      parsed.mealCardDailyAmount < 0
    ) {
      return "Le montant des titres resto ne peut pas être négatif.";
    }

    return "";
  }

  function saveSettingsForm() {
    const parsed = parseSettingsForm(settingsFormValues);
    const validationError = validateSettingsForm(parsed);

    if (validationError) {
      setSettingsError(validationError);
      return;
    }

    const nextSettings: IncomeSettings = {
      defaultTjm: parsed.defaultTjm,
      managementFeeRate: parsed.managementFeeRate,
      mealCardDailyAmount: parsed.mealCardDailyAmount
    };
    const previousDefaultTjm = settings.defaultTjm;

    setSettings(nextSettings);
    setSettingsFormValues(settingsToForm(nextSettings));
    saveIncomeSettings(nextSettings);
    setSettingsError("");

    if (!editingId) {
      setFormValues((currentValues) => ({
        ...currentValues,
        tjm:
          currentValues.tjm === "" || currentValues.tjm === String(previousDefaultTjm)
            ? String(nextSettings.defaultTjm)
            : currentValues.tjm
      }));
    }
  }

  function validateForm(parsed: ParsedForm) {
    if (!isMonthValue(parsed.month)) {
      return "Le mois est obligatoire. Utilisez le format YYYY-MM.";
    }

    if (!Number.isFinite(parsed.workDays) || parsed.workDays < 0) {
      return "Le nombre de jours travaillés doit être supérieur ou égal à 0.";
    }

    if (!Number.isInteger(parsed.workDays)) {
      return "Le nombre de jours travaillés doit être un entier.";
    }

    if (!Number.isFinite(parsed.tjm) || parsed.tjm <= 0) {
      return "Le TJM doit être supérieur à 0.";
    }

    if (
      !isValidOptionalAmount(parsed.frenchSalary) ||
      !isValidOptionalAmount(parsed.ukBonus) ||
      !isValidOptionalAmount(parsed.otherReimbursement)
    ) {
      return "Le salaire, le bonus et les remboursements ne peuvent pas être négatifs.";
    }

    const duplicateRecord = records.find(
      (record) => record.month === parsed.month && record.id !== editingId
    );

    if (duplicateRecord) {
      return "Ce mois existe déjà. Utilisez le bouton modifier sur l'enregistrement existant.";
    }

    return "";
  }

  function saveForm() {
    const parsed = parseForm(formValues);
    const validationError = validateForm(parsed);

    if (validationError) {
      setError(validationError);
      return;
    }

    const now = new Date().toISOString();
    const nextRecord: MonthlyIncome = {
      id: editingId ?? `income-${parsed.month}-${Date.now()}`,
      month: parsed.month,
      workDays: parsed.workDays,
      tjm: parsed.tjm,
      frenchSalary: parsed.frenchSalary,
      ukBonus: parsed.ukBonus,
      otherReimbursement: parsed.otherReimbursement,
      note: parsed.note,
      createdAt:
        records.find((record) => record.id === editingId)?.createdAt ?? now,
      updatedAt: now
    };

    const nextRecords = editingId
      ? records.map((record) => (record.id === editingId ? nextRecord : record))
      : [...records, nextRecord];

    commitRecords(nextRecords);
    resetForm();
  }

  function editRecord(record: MonthlyIncome) {
    setEditingId(record.id);
    setFormValues(recordToForm(record));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteRecord(record: MonthlyIncome) {
    const confirmed = window.confirm(`Supprimer l'enregistrement ${record.month} ?`);

    if (!confirmed) {
      return;
    }

    const nextRecords = records.filter((item) => item.id !== record.id);
    commitRecords(nextRecords);

    if (editingId === record.id) {
      resetForm();
    }
  }

  if (!isReady) {
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 text-ink">
        <p className="border border-ink/15 bg-[#fbf8f0] px-5 py-3 text-sm font-medium">
          Chargement des données locales…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-7 grid gap-5 border-b border-ink/15 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 border border-clay/30 bg-[#f2dfcf] px-3 py-1 text-sm font-semibold text-clay">
            <WalletCards className="h-4 w-4" />
            Carnet personnel de portage
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl">
            Suivi des revenus en portage
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/68 md:text-lg">
            Suivez les jours travaillés, le chiffre d&apos;affaires et le net reçu chaque mois.
          </p>
        </div>
        <SettingsPanel
          error={settingsError}
          onChange={updateSettingsFormValue}
          onSubmit={saveSettingsForm}
          values={settingsFormValues}
        />
      </header>

      <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-ink/55">
        <Plus className="h-4 w-4" />
        Vue annuelle
      </div>
      <SummarySection records={records} settings={settings} />

      <div className="mt-8">
        <AnnualIncomeDistributionChart records={records} settings={settings} />
      </div>

      <div className="mt-8">
        <IncomeCompositionChart records={records} settings={settings} />
      </div>

      <div className="mt-8">
        <IncomeForm
          editingId={editingId}
          error={error}
          onCancel={resetForm}
          onChange={updateFormValue}
          onReset={resetForm}
          onSubmit={saveForm}
          records={records}
          settings={settings}
          values={formValues}
        />
      </div>

      <div className="mt-8">
        <IncomeTable
          onDelete={deleteRecord}
          onEdit={editRecord}
          records={records}
          settings={settings}
        />
      </div>
    </main>
  );
}
