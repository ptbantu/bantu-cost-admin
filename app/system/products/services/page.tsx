"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, X } from 'lucide-react';

type ProductPrice = {
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
  description: string | null;
  difficulty: number;
  isExpertMode: boolean;
  expertTag: string[];
  sla: number | null;
  prices: ProductPrice[];
  createdAt: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  VisaService: '签证服务',
  CompanyService: '公司服务',
  TaxService: '税务服务',
  LicenseService: '资质服务',
  'Jemput&AntarService': '接送关',
};

const CATEGORY_COLORS: Record<string, string> = {
  VisaService: 'bg-blue-50 text-blue-700',
  CompanyService: 'bg-purple-50 text-purple-700',
  TaxService: 'bg-green-50 text-green-700',
  LicenseService: 'bg-orange-50 text-orange-700',
  'Jemput&AntarService': 'bg-slate-100 text-slate-700',
};

const formatIDR = (v: number | null) =>
  v == null ? '—' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const formatCNY = (v: number | null) =>
  v == null ? '—' : `¥${Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 0 })}`;

const difficultyLabel = (d: number) => '★'.repeat(d) + '☆'.repeat(Math.max(0, 5 - d));

const PAGE_SIZE = 15;

export default function ServicesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('请求失败');
      setProducts(await res.json());
    } catch {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { setPage(1); }, [search, activeTab]);

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchTab = activeTab === 'ALL' || p.category === activeTab;
    const matchSearch = p.productCode.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col h-full text-[12px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索编码或产品名称..."
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {!loading && <span className="text-slate-400">{filtered.length} 个产品</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />刷新
          </button>
          <button className="flex items-center h-8 px-3 text-white bg-slate-900 rounded-md hover:bg-slate-800">
            <Plus className="w-3.5 h-3.5 mr-1.5" />新增产品
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-0 border-b border-slate-200 bg-white px-4 flex-shrink-0">
        {categories.map(cat => {
          const count = cat === 'ALL' ? products.length : products.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`h-9 px-4 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === cat
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {cat === 'ALL' ? '全部' : (CATEGORY_LABELS[cat] ?? cat)}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-slate-400">加载中...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-40 text-red-500">{error}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr>
                    <th className="py-2 px-4 font-medium text-slate-500 w-28">产品编码</th>
                    <th className="py-2 px-4 font-medium text-slate-500">产品名称</th>
                    {activeTab === 'ALL' && <th className="py-2 px-4 font-medium text-slate-500 w-24">分类</th>}
                    <th className="py-2 px-4 font-medium text-slate-500 text-right w-36">直客价 (IDR)</th>
                    <th className="py-2 px-4 font-medium text-slate-500 text-right w-28">直客价 (CNY)</th>
                    <th className="py-2 px-4 font-medium text-slate-500 w-20">难度</th>
                    <th className="py-2 px-4 font-medium text-slate-500 w-16">SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="py-10 text-center text-slate-400">暂无数据</td></tr>
                  ) : paginated.map(p => {
                    const price = p.prices[0] ?? null;
                    const isSelected = selected?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelected(isSelected ? null : p)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-1.5 px-4 font-mono text-slate-500 text-[11px]">{p.productCode}</td>
                        <td className="py-1.5 px-4 font-medium text-slate-800">{p.name}</td>
                        {activeTab === 'ALL' && (
                          <td className="py-1.5 px-4">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_COLORS[p.category] ?? 'bg-slate-100 text-slate-700'}`}>
                              {CATEGORY_LABELS[p.category] ?? p.category}
                            </span>
                          </td>
                        )}
                        <td className="py-1.5 px-4 text-right font-medium text-slate-800">{formatIDR(price?.retailPriceIdr ?? null)}</td>
                        <td className="py-1.5 px-4 text-right text-slate-600">{formatCNY(price?.retailPriceCny ?? null)}</td>
                        <td className="py-1.5 px-4 text-amber-400 text-[10px]">{difficultyLabel(p.difficulty)}</td>
                        <td className="py-1.5 px-4 text-slate-500">{p.sla ? `${p.sla}天` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-white flex-shrink-0">
              <span className="text-slate-400">共 {filtered.length} 条，第 {page} / {totalPages} 页</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className="h-7 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">«</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-7 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | '...')[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) => n === '...' ? (
                    <span key={`e${i}`} className="h-7 px-1 text-slate-400">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n as number)}
                      className={`h-7 px-2.5 rounded border text-[11px] ${page === n ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {n}
                    </button>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-7 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">›</button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="h-7 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">»</button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-72 border-l border-slate-200 bg-white flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="font-semibold text-slate-800 text-sm">产品详情</span>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Basic info */}
              <div>
                <div className="font-mono text-[10px] text-slate-400 mb-1">{selected.productCode}</div>
                <div className="font-semibold text-slate-800 text-sm leading-snug">{selected.name}</div>
                {selected.description && (
                  <div className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">{selected.description}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-400 text-[10px] mb-0.5">分类</div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_COLORS[selected.category] ?? 'bg-slate-100 text-slate-700'}`}>
                    {CATEGORY_LABELS[selected.category] ?? selected.category}
                  </span>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-400 text-[10px] mb-0.5">SLA</div>
                  <div className="font-medium text-slate-700">{selected.sla ? `${selected.sla} 天` : '—'}</div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-400 text-[10px] mb-0.5">难度</div>
                  <div className="text-amber-400 text-[11px]">{difficultyLabel(selected.difficulty)}</div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-400 text-[10px] mb-0.5">专家模式</div>
                  <div className={`text-[11px] font-medium ${selected.isExpertMode ? 'text-blue-600' : 'text-slate-400'}`}>
                    {selected.isExpertMode ? '是' : '否'}
                  </div>
                </div>
              </div>

              {selected.expertTag?.length > 0 && (
                <div>
                  <div className="text-slate-400 text-[10px] mb-1.5">专家标签</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.expertTag.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              {selected.prices[0] && (
                <div>
                  <div className="text-slate-400 text-[10px] mb-1.5">当前价格</div>
                  <div className="space-y-1.5">
                    {[
                      { label: '成本价', idr: selected.prices[0].costPriceIdr, cny: selected.prices[0].costPriceCny },
                      { label: '渠道价', idr: selected.prices[0].partnerPriceIdr, cny: selected.prices[0].partnerPriceCny },
                      { label: '直客价', idr: selected.prices[0].retailPriceIdr, cny: selected.prices[0].retailPriceCny },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">{row.label}</span>
                        <div className="text-right">
                          <div className="font-medium text-slate-800">{formatIDR(row.idr)}</div>
                          <div className="text-slate-400 text-[10px]">{formatCNY(row.cny)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-1.5">
                    生效：{new Date(selected.prices[0].effectiveDate).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
