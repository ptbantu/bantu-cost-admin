'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Upload, Trash2, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  bankName: string;
  currency: string;
  accountName: string | null;
  transactionDate: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  balance: number | null;
  reference: string | null;
  importBatchId: string | null;
  uploader: { name: string } | null;
}

interface ImportBatch {
  id: string;
  bankName: string;
  currency: string;
  fileName: string;
  rowCount: number;
  createdAt: string;
  uploader: { name: string } | null;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  incomeCount: number;
  expenseCount: number;
}

interface ApiResponse {
  total: number;
  rows: Transaction[];
  batches: ImportBatch[];
  page: number;
  pageSize: number;
  summary: Summary;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtAmount(amount: number, currency: string) {
  if (currency === 'CNY') return `¥ ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function fmtAmountShort(amount: number, currency: string) {
  const prefix = currency === 'CNY' ? '¥' : 'Rp';
  if (amount >= 1_000_000_000) return `${prefix} ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${prefix} ${(amount / 1_000_000).toFixed(1)}M`;
  return `${prefix} ${amount.toLocaleString()}`;
}

// ── Summary Cards ──────────────────────────────────────────────────────────
function SummaryCards({ summary, currency }: { summary: Summary; currency: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-3 flex-shrink-0">
      <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] text-slate-400">总收入</p>
          <p className="text-sm font-semibold text-emerald-600 font-mono">{fmtAmountShort(summary.totalIncome, currency)}</p>
          <p className="text-[10px] text-slate-400">{summary.incomeCount} 笔</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <TrendingDown className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <p className="text-[10px] text-slate-400">总支出</p>
          <p className="text-sm font-semibold text-slate-800 font-mono">{fmtAmountShort(summary.totalExpense, currency)}</p>
          <p className="text-[10px] text-slate-400">{summary.expenseCount} 笔</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${summary.netFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <ArrowLeftRight className={`w-4 h-4 ${summary.netFlow >= 0 ? 'text-blue-600' : 'text-orange-500'}`} />
        </div>
        <div>
          <p className="text-[10px] text-slate-400">净流入</p>
          <p className={`text-sm font-semibold font-mono ${summary.netFlow >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
            {summary.netFlow >= 0 ? '+' : ''}{fmtAmountShort(summary.netFlow, currency)}
          </p>
          <p className="text-[10px] text-slate-400">共 {summary.incomeCount + summary.expenseCount} 笔</p>
        </div>
      </div>
    </div>
  );
}

// ── Import Modal ───────────────────────────────────────────────────────────
function ImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [bankName, setBankName] = useState('BCA');
  const [currency, setCurrency] = useState('IDR');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError('请选择文件'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bankName', bankName);
      fd.append('currency', currency);
      if (accountName) fd.append('accountName', accountName);
      if (accountNumber) fd.append('accountNumber', accountNumber);
      const res = await fetch('/api/reconciliation/import', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) { setError(json.error || '导入失败'); return; }
      onSuccess();
      onClose();
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-slate-800">导入银行流水</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">银行</label>
              <select value={bankName} onChange={e => setBankName(e.target.value)}
                className="w-full h-8 px-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="BCA">BCA</option>
                <option value="ICBC">ICBC</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BNI">BNI</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">币种</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full h-8 px-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="IDR">IDR</option>
                <option value="CNY">CNY</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">账户名（可选）</label>
              <input value={accountName} onChange={e => setAccountName(e.target.value)}
                placeholder="如 BANTU BUSINESS..."
                className="w-full h-8 px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">账号（可选）</label>
              <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                placeholder="如 5335251285"
                className="w-full h-8 px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-500 mb-1">CSV 文件</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
              {file
                ? <p className="text-slate-700 font-medium">{file.name}</p>
                : <><Upload className="w-5 h-5 text-slate-300 mx-auto mb-1" /><p className="text-slate-400">点击选择 CSV 文件</p></>}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="h-8 px-4 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50">取消</button>
            <button type="submit" disabled={loading}
              className="h-8 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? '导入中...' : '确认导入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ReconciliationPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankTab, setBankTab] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState<string | null>(null);
  const [showBatches, setShowBatches] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (bankTab !== 'all') params.set('bankName', bankTab);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const res = await fetch(`/api/reconciliation?${params}`);
      const json = await res.json();
      if (!json.error) setData(json);
    } finally {
      setLoading(false);
    }
  }, [bankTab, typeFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [bankTab, typeFilter]);

  async function deleteBatch(batchId: string) {
    if (!confirm('确认删除该批次所有流水？此操作不可撤销。')) return;
    setDeletingBatch(batchId);
    try {
      await fetch('/api/reconciliation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      });
      fetchData();
    } finally {
      setDeletingBatch(null);
    }
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;
  const banks = data ? [...new Set(data.batches.map(b => b.bankName))] : [];
  const activeCurrency = bankTab === 'all' ? 'IDR' : (data?.batches.find(b => b.bankName === bankTab)?.currency ?? 'IDR');

  return (
    <div className="flex flex-col h-full text-[12px] bg-slate-50 p-4 overflow-hidden">
      {showImport && <ImportModal onClose={() => setShowImport(false)} onSuccess={fetchData} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-800">银行流水对账</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">导入并管理 BCA / ICBC 银行流水</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBatches(v => !v)}
            className="h-8 px-3 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100 transition-colors">
            导入记录
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="h-8 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" /> 导入流水
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.summary && <SummaryCards summary={data.summary} currency={activeCurrency} />}

      {/* Import Batches Panel */}
      {showBatches && (
        <div className="mb-3 bg-white rounded-lg border border-slate-200 p-3 flex-shrink-0">
          <p className="text-[11px] font-medium text-slate-600 mb-2">最近导入记录</p>
          {!data?.batches.length
            ? <p className="text-slate-400 text-center py-3">暂无导入记录</p>
            : <div className="space-y-1">
                {data.batches.map(b => (
                  <div key={b.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-700">{b.bankName}</span>
                      <span className="text-slate-400">{b.currency}</span>
                      <span className="text-slate-500 truncate max-w-[200px]">{b.fileName}</span>
                      <span className="text-slate-400">{b.rowCount} 条</span>
                      <span className="text-slate-400">{fmtDate(b.createdAt)}</span>
                      {b.uploader && <span className="text-slate-400">by {b.uploader.name}</span>}
                    </div>
                    <button
                      onClick={() => deleteBatch(b.id)}
                      disabled={deletingBatch === b.id}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden h-8">
          {['all', ...banks].map(b => (
            <button key={b}
              onClick={() => setBankTab(b)}
              className={`px-3 h-full text-[11px] font-medium transition-colors border-r border-slate-100 last:border-0 ${
                bankTab === b ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {b === 'all' ? '全部账户' : b}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden h-8">
          {[['all', '全部'], ['INCOME', '收入'], ['EXPENSE', '支出']].map(([v, label]) => (
            <button key={v}
              onClick={() => setTypeFilter(v)}
              className={`px-3 h-full text-[11px] font-medium transition-colors border-r border-slate-100 last:border-0 ${
                typeFilter === v ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <span className="text-slate-400 ml-auto">共 {data?.total ?? 0} 条</span>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2 px-3 font-medium text-slate-500">日期</th>
                <th className="py-2 px-3 font-medium text-slate-500">银行 / 账户</th>
                <th className="py-2 px-3 font-medium text-slate-500 max-w-[280px]">描述</th>
                <th className="py-2 px-3 font-medium text-slate-500">参考号</th>
                <th className="py-2 px-3 font-medium text-slate-500 text-right">金额</th>
                <th className="py-2 px-3 font-medium text-slate-500 text-right">余额</th>
                <th className="py-2 px-3 font-medium text-slate-500">上传人</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-2 px-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
                      ))}
                    </tr>
                  ))
                : !data?.rows.length
                  ? <tr><td colSpan={7} className="py-16 text-center text-slate-400">暂无流水数据，请先导入</td></tr>
                  : data.rows.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-1.5 px-3 font-mono text-slate-600">{fmtDate(row.transactionDate)}</td>
                        <td className="py-1.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{row.bankName}</span>
                            {row.accountName && <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{row.accountName}</span>}
                          </div>
                        </td>
                        <td className="py-1.5 px-3 max-w-[280px]">
                          <p className="truncate text-slate-600" title={row.description}>{row.description}</p>
                        </td>
                        <td className="py-1.5 px-3 font-mono text-[11px] text-slate-400">
                          {row.reference
                            ? <span className="truncate max-w-[100px] block" title={row.reference}>{row.reference}</span>
                            : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <span className={`font-mono font-medium ${row.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {row.type === 'INCOME' ? '+' : '-'}{fmtAmount(row.amount, row.currency)}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-slate-400">
                          {row.balance != null ? fmtAmount(row.balance, row.currency) : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-slate-400">
                          {row.uploader?.name ?? '—'}
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="h-10 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-4 flex-shrink-0">
          <span className="text-slate-500">
            第 {((page - 1) * (data?.pageSize ?? 50)) + 1} – {Math.min(page * (data?.pageSize ?? 50), data?.total ?? 0)} 条，共 {data?.total ?? 0} 条
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-slate-600">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
