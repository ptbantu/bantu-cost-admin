import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 印尼盾格式化：100万 = 1jt，如 Rp 15jt
export function formatIDR(val: number | null | undefined): string {
  if (val == null) return '—';
  if (val === 0) return 'Rp 0';
  const jt = val / 1_000_000;
  if (Number.isInteger(jt)) return `Rp ${jt}jt`;
  return `Rp ${parseFloat(jt.toFixed(2))}jt`;
}

export function formatCNY(val: number | null | undefined): string {
  if (val == null) return '—';
  return `¥${Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 0 })}`;
}
