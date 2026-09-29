"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** The ranges the API accepts, matching `?days` bounds of 1-365. */
export const PERIOD_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 365, label: "12 months" },
] as const;

export const DEFAULT_PERIOD = 30;

/** "last 30 days" / "last 12 months" — for card sublabels. */
export function periodLabel(days: number): string {
  return `last ${PERIOD_OPTIONS.find((option) => option.value === days)?.label ?? `${days} days`}`;
}

export function PeriodSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: number) => void;
}) {
  return (
    <Select
      value={String(value)}
      onValueChange={(next) => onChange(Number(next))}
    >
      <SelectTrigger size="sm" className="w-32" aria-label="Reporting period">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Period state for a stats-backed page. */
export function usePeriod() {
  const [days, setDays] = useState<number>(DEFAULT_PERIOD);
  return { days, setDays };
}
