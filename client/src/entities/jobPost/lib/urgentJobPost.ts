/** 서버 Boolean(nullable) → 급구 활성 여부 */
export const isUrgentEnabled = (value?: boolean | null): boolean => Boolean(value);

/** 급구 인상액 표기 — 예: (+3,000원) */
export const formatUrgentWageIncrease = (amount: number): string =>
  `(+${amount.toLocaleString()}원)`;

export const hasUrgentWageIncrease = (
  urgentEnabled?: boolean | null,
  urgentWageIncrease?: number | null,
): urgentWageIncrease is number =>
  isUrgentEnabled(urgentEnabled) &&
  urgentWageIncrease != null &&
  urgentWageIncrease > 0;
