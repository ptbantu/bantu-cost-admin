"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { formatIDR, formatCNY } from '@/lib/utils';

type ProductPrice = {
  id: string;
  costPriceIdr: number;
  costPriceCny: number;
  partnerPriceIdr: number | null;
  partnerPriceCny: number | null;
  retailPriceIdr: number;
  retailPriceCny: number | null;
  isCurrent: boolean;
  effectiveDate: string;
};

type Product = {
  id: string;
  productCode: string;
  name: string;
  category: string;
  prices: ProductPrice[];
};

const pctChange = (cur: number, prev: number | undefined) => {
  if (!prev || prev === 0) return null;
  const pct = ((cur - prev) / prev) * 100;
  return pct;
};

type EditState = {
  costPriceIdr: string;
  costPriceCny: string;
  partnerPriceIdr: string;
  partnerPriceCny: string;
  retailPriceIdr: string;
  retailPriceCny: string;
};

const CATEGORIES: Record<string, string> = {
  VisaService: '签证',
  CompanyService: '公司',
  TaxService: '税务',
  LicenseService: '资质',
  'Jemput&AntarService': '接送关',
};

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [editing, setEditing] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products/pricing');
      setProducts(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const startEdit = (p: Product) => {
    const cur = p.prices[0];
    setEditing(p.id);
    setEditState({
      costPriceIdr: String(cur?.costPriceIdr ?? ''),
      costPriceCny: String(cur?.costPriceCny ?? ''),
      partnerPriceIdr: String(cur?.partnerPriceIdr ?? ''),
      partnerPriceCny: String(cur?.partnerPriceCny ?? ''),
      retailPriceIdr: String(cur?.retailPriceIdr ?? ''),
      retailPriceCny: String(cur?.retailPriceCny ?? ''),
    });
  };

  const saveEdit = async (productId: string) => {
    if (!editState) return;
    setSaving(true);
    try {
      await fetch('/api/products/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          costPriceIdr: parseFloat(editState.costPriceIdr) || 0,
          costPriceCny: parseFloat(editState.costPriceCny) || 0,
          partnerPriceIdr: editState.partnerPriceIdr ? parseFloat(editState.partnerPriceIdr) : null,
          partnerPriceCny: editState.partnerPriceCny ? parseFloat(editState.partnerPriceCny) : null,
          retailPriceIdr: parseFloat(editState.retailPriceIdr) || 0,
          retailPriceCny: editState.retailPriceCny ? parseFloat(editState.retailPriceCny) : null,
        }),
      });
      setEditing(null);
      await fetchProducts();
    } finally {
      setSaving(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'ALL' || p.category === catFilter;
    const matchSearch = p.productCode.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // 搜索或分类变化时重置页码
  useEffect(() => { setPage(1); }, [search, catFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col h-full text-[12px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white flex-shrink-0 gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索产品..."
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`h-7 px-2.5 rounded text-[11px] transition-colors ${catFilter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {cat === 'ALL' ? '全部' : (CATEGORIES[cat] ?? cat)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={fetchProducts} className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          刷新
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">加载中...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2 px-4 font-medium text-slate-500 w-28">编码</th>
                <th className="py-2 px-4 font-medium text-slate-500">产品名称</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-right w-32">成本价 (IDR)</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-right w-32">渠道价 (IDR)</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-right w-32">直客价 (IDR)</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-right w-28">直客价 (CNY)</th>
                <th className="py-2 px-4 font-medium text-slate-500 w-24">生效日期</th>
                <th className="py-2 px-4 font-medium text-slate-500 w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => {
                const cur = p.prices[0];
                const prev = p.prices[1];
                const isEditing = editing === p.id;
                const pct = cur && prev ? pctChange(cur.retailPriceIdr, prev.retailPriceIdr) : null;

                return (
                  <React.Fragment key={p.id}>
                    <tr className={`border-b border-slate-100 transition-colors ${isEditing ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                      <td className="py-1.5 px-4 font-mono text-slate-500 text-[11px]">{p.productCode}</td>
                      <td className="py-1.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{p.name}</span>
                          {pct !== null && (
                            <span className={`text-[10px] font-medium ${pct > 0 ? 'text-red-500' : 'text-green-600'}`}>
                              {pct > 0 ? '↑' : '↓'}{Math.abs(pct).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cost IDR */}
                      <td className="py-1.5 px-4 text-right text-slate-500">
                        {isEditing ? (
                          <input type="number" value={editState!.costPriceIdr}
                            onChange={e => setEditState(s => ({ ...s!, costPriceIdr: e.target.value }))}
                            className="w-28 h-6 px-2 border border-blue-400 rounded text-right focus:outline-none text-[11px]" />
                        ) : formatIDR(cur?.costPriceIdr ?? null)}
                      </td>

                      {/* Partner IDR */}
                      <td className="py-1.5 px-4 text-right text-slate-700">
                        {isEditing ? (
                          <input type="number" value={editState!.partnerPriceIdr}
                            onChange={e => setEditState(s => ({ ...s!, partnerPriceIdr: e.target.value }))}
                            className="w-28 h-6 px-2 border border-blue-400 rounded text-right focus:outline-none text-[11px]" />
                        ) : formatIDR(cur?.partnerPriceIdr ?? null)}
                      </td>

                      {/* Retail IDR */}
                      <td className="py-1.5 px-4 text-right font-medium text-slate-800">
                        {isEditing ? (
                          <input type="number" value={editState!.retailPriceIdr}
                            onChange={e => setEditState(s => ({ ...s!, retailPriceIdr: e.target.value }))}
                            className="w-28 h-6 px-2 border border-blue-400 rounded text-right focus:outline-none text-[11px]" />
                        ) : formatIDR(cur?.retailPriceIdr ?? null)}
                      </td>

                      {/* Retail CNY */}
                      <td className="py-1.5 px-4 text-right text-slate-600">
                        {isEditing ? (
                          <input type="number" value={editState!.retailPriceCny}
                            onChange={e => setEditState(s => ({ ...s!, retailPriceCny: e.target.value }))}
                            className="w-24 h-6 px-2 border border-blue-400 rounded text-right focus:outline-none text-[11px]" />
                        ) : formatCNY(cur?.retailPriceCny ?? null)}
                      </td>

                      <td className="py-1.5 px-4 text-slate-400 text-[11px]">
                        {cur ? new Date(cur.effectiveDate).toLocaleDateString('zh-CN') : '—'}
                      </td>

                      <td className="py-1.5 px-4">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(p.id)} disabled={saving}
                                className="p-1 text-green-600 hover:text-green-700">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditing(null)}
                                className="p-1 text-slate-400 hover:text-slate-600">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(p)}
                                className="text-blue-600 hover:underline">
                                编辑
                              </button>
                              {p.prices.length > 1 && (
                                <button onClick={() => setExpandedHistory(expandedHistory === p.id ? null : p.id)}
                                  className="p-0.5 text-slate-400 hover:text-slate-600">
                                  {expandedHistory === p.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* History row */}
                    {expandedHistory === p.id && prev && (
                      <tr className="bg-slate-50/60 border-b border-slate-100">
                        <td className="py-1 px-4 text-slate-400 text-[10px]" colSpan={2}>
                          上次价格 · {new Date(prev.effectiveDate).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="py-1 px-4 text-right text-slate-400 text-[11px] line-through">{formatIDR(prev.costPriceIdr)}</td>
                        <td className="py-1 px-4 text-right text-slate-400 text-[11px] line-through">{formatIDR(prev.partnerPriceIdr ?? null)}</td>
                        <td className="py-1 px-4 text-right text-slate-400 text-[11px] line-through">{formatIDR(prev.retailPriceIdr)}</td>
                        <td className="py-1 px-4 text-right text-slate-400 text-[11px] line-through">{formatCNY(prev.retailPriceCny ?? null)}</td>
                        <td colSpan={2} />
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-white flex-shrink-0">
          <span className="text-slate-400">
            共 {filtered.length} 条，第 {page} / {totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="h-7 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >«</button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | '...')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className="h-7 px-2 text-slate-400">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`h-7 px-2.5 rounded border text-[11px] transition-colors ${page === n ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >{n}</button>
                )
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-7 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >›</button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="h-7 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >»</button>
          </div>
        </div>
      )}
    </div>
  );
}
