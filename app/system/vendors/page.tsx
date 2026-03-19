"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronDown, Plus, RefreshCw, MoreHorizontal, X, Loader2, Download
} from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import * as XLSX from 'xlsx';

type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';

interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  category: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  wechat: string | null;
  bankName: string | null;
  bankAccount: string | null;
  accountHolder: string | null;
  taxId: string | null;
  status: VendorStatus;
  notes: string | null;
  createdAt: string;
  totalPaid: number;
}

const CATEGORIES = ['GOVERNMENT', 'AGENT', 'EXPERT', 'TRANSLATOR', 'OTHER'];

const categoryLabel: Record<string, string> = {
  GOVERNMENT: '政府机构',
  AGENT: '第三方代理',
  EXPERT: '个人专家',
  TRANSLATOR: '翻译公司',
  OTHER: '其他',
};

const categoryStyle: Record<string, string> = {
  GOVERNMENT: 'bg-slate-100 text-slate-600 border-slate-200/60',
  AGENT: 'bg-blue-50 text-blue-700 border-blue-200/60',
  EXPERT: 'bg-purple-50 text-purple-700 border-purple-200/60',
  TRANSLATOR: 'bg-amber-50 text-amber-700 border-amber-200/60',
  OTHER: 'bg-slate-50 text-slate-500 border-slate-200/60',
};

const statusStyle: Record<VendorStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200/60',
  BLACKLISTED: 'bg-red-50 text-red-600 border-red-200/60',
};

const statusLabel: Record<VendorStatus, string> = {
  ACTIVE: '正常',
  INACTIVE: '暂停',
  BLACKLISTED: '黑名单',
};

const emptyForm = {
  vendorName: '',
  category: '',
  contactName: '',
  phone: '',
  email: '',
  wechat: '',
  bankName: '',
  bankAccount: '',
  accountHolder: '',
  taxId: '',
  notes: '',
  status: 'ACTIVE' as VendorStatus,
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    const rows = filtered.map(v => ({
      '供应商编号': v.vendorCode,
      '供应商名称': v.vendorName,
      '分类': v.category ? (categoryLabel[v.category] ?? v.category) : '',
      '状态': statusLabel[v.status],
      '联系人': v.contactName ?? '',
      '电话': v.phone ?? '',
      '微信': v.wechat ?? '',
      '邮箱': v.email ?? '',
      '开户行': v.bankName ?? '',
      '银行账号': v.bankAccount ?? '',
      '账户户名': v.accountHolder ?? '',
      '税号(NPWP)': v.taxId ?? '',
      '入库时间': new Date(v.createdAt).toLocaleDateString('zh-CN'),
      '累计已支付(IDR)': v.totalPaid,
      '备注': v.notes ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '供应商列表');
    XLSX.writeFile(wb, `供应商列表_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      showToast('加载失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const openAdd = () => {
    setEditingVendor(null);
    setForm(emptyForm);
    setIsSheetOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditingVendor(v);
    setForm({
      vendorName: v.vendorName,
      category: v.category ?? '',
      contactName: v.contactName ?? '',
      phone: v.phone ?? '',
      email: v.email ?? '',
      wechat: v.wechat ?? '',
      bankName: v.bankName ?? '',
      bankAccount: v.bankAccount ?? '',
      accountHolder: v.accountHolder ?? '',
      taxId: v.taxId ?? '',
      notes: v.notes ?? '',
      status: v.status,
    });
    setOpenMenuId(null);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingVendor(null);
  };

  const handleSave = async () => {
    if (!form.vendorName.trim()) return showToast('请填写供应商名称', 'error');
    setSaving(true);
    try {
      const method = editingVendor ? 'PUT' : 'POST';
      const body = editingVendor ? { id: editingVendor.id, ...form } : form;
      const res = await fetch('/api/vendors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showToast(editingVendor ? '更新成功' : '新增成功');
      closeSheet();
      fetchVendors();
    } catch {
      showToast('保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该供应商？')) return;
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/vendors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      showToast('已删除');
      fetchVendors();
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const filtered = vendors.filter(v => {
    const matchSearch = !search ||
      v.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      (v.contactName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || v.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div
      className="flex flex-col h-full text-[12px] bg-slate-50 p-4 space-y-3 overflow-hidden relative"
      onClick={() => { setOpenMenuId(null); setCategoryDropdownOpen(false); }}
    >
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2 rounded-lg shadow-lg text-white text-[12px] font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索供应商名称、编号、联系人..."
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px]"
            />
          </div>

          {/* Category filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setCategoryDropdownOpen(o => !o)}
              className="flex items-center justify-between h-8 px-2.5 w-36 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {categoryFilter ? (categoryLabel[categoryFilter] ?? categoryFilter) : '全部分类'}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute top-9 left-0 w-40 bg-white border border-slate-200 shadow-lg rounded-md py-1 z-40">
                <button
                  onClick={() => { setCategoryFilter(''); setCategoryDropdownOpen(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                >全部分类</button>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCategoryFilter(c); setCategoryDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                  >{categoryLabel[c] ?? c}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchVendors}
            className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors font-medium shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <button
            onClick={handleExport}
            disabled={loading || filtered.length === 0}
            className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors font-medium shadow-sm disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            导出 Excel
          </button>
          <button
            onClick={openAdd}
            className="flex items-center h-8 px-3 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            新增供应商
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2 px-3 font-medium text-slate-500 w-32">供应商编号</th>
                <th className="py-2 px-3 font-medium text-slate-500 min-w-[140px]">供应商名称</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-28">分类</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-36">联系人 / 电话</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-36">微信 / 邮箱</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-44">收款银行 / 账号</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-36">账户户名 / 税号</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-24">状态</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-28">入库时间</th>
                <th className="py-2 px-3 font-medium text-slate-500 text-right w-40">累计已支付</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-12 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    加载中...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400">暂无供应商数据</td>
                </tr>
              ) : filtered.map(vendor => (
                <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{vendor.vendorCode}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{vendor.vendorName}</td>
                  <td className="py-2 px-3">
                    {vendor.category && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${categoryStyle[vendor.category] ?? 'bg-slate-50 text-slate-500 border-slate-200/60'}`}>
                        {categoryLabel[vendor.category] ?? vendor.category}
                      </span>
                    )}
                  </td>
                  {/* 联系人 / 电话 */}
                  <td className="py-2 px-3">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-slate-700">{vendor.contactName ?? '—'}</span>
                      {vendor.phone && <span className="text-slate-400 font-mono text-[10px]">{vendor.phone}</span>}
                    </div>
                  </td>
                  {/* 微信 / 邮箱 */}
                  <td className="py-2 px-3">
                    <div className="flex flex-col space-y-0.5">
                      {vendor.wechat ? <span className="text-slate-700">{vendor.wechat}</span> : <span className="text-slate-300">—</span>}
                      {vendor.email && <span className="text-slate-400 text-[10px] truncate max-w-[130px]">{vendor.email}</span>}
                    </div>
                  </td>
                  {/* 收款银行 / 账号 */}
                  <td className="py-2 px-3">
                    {vendor.bankName ? (
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-slate-700">{vendor.bankName}</span>
                        {vendor.bankAccount && <span className="text-slate-400 font-mono text-[10px]">{vendor.bankAccount}</span>}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  {/* 账户户名 / 税号 */}
                  <td className="py-2 px-3">
                    <div className="flex flex-col space-y-0.5">
                      {vendor.accountHolder ? <span className="text-slate-700">{vendor.accountHolder}</span> : <span className="text-slate-300">—</span>}
                      {vendor.taxId && <span className="text-slate-400 font-mono text-[10px]">{vendor.taxId}</span>}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusStyle[vendor.status]}`}>
                      {statusLabel[vendor.status]}
                    </span>
                  </td>
                  {/* 入库时间 */}
                  <td className="py-2 px-3 text-slate-500 text-[11px] font-mono">
                    {new Date(vendor.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                    {formatIDR(vendor.totalPaid)}
                  </td>
                  <td className="py-2 px-3 text-center relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === vendor.id ? null : vendor.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors focus:outline-none"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {openMenuId === vendor.id && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 bg-white border border-slate-200 shadow-lg rounded-md py-1 z-40">
                        <button onClick={() => openEdit(vendor)} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">编辑资料</button>
                        <div className="h-px bg-slate-100 my-0.5 mx-2" />
                        <button onClick={() => handleDelete(vendor.id)} className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 transition-colors">删除</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && (
          <div className="px-3 py-2 border-t border-slate-100 text-[11px] text-slate-400 flex-shrink-0">
            共 {filtered.length} 家供应商{categoryFilter || search ? `（已筛选，共 ${vendors.length} 家）` : ''}
          </div>
        )}
      </div>

      {/* Slide-out Sheet */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={closeSheet} />
          <div className="relative w-full sm:max-w-[420px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{editingVendor ? '编辑供应商' : '新增供应商'}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{editingVendor ? `编号：${editingVendor.vendorCode}` : '录入新的供应商或政府机构信息'}</p>
              </div>
              <button onClick={closeSheet} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {/* Vendor Name */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">供应商名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.vendorName}
                    onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))}
                    placeholder="例如：印尼雅加达移民局"
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">分类</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full h-8 pl-2.5 pr-8 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] appearance-none bg-white"
                    >
                      <option value="">请选择</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel[c]}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status (edit only) */}
                {editingVendor && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5">状态</label>
                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as VendorStatus }))}
                        className="w-full h-8 pl-2.5 pr-8 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] appearance-none bg-white"
                      >
                        <option value="ACTIVE">正常合作</option>
                        <option value="INACTIVE">暂停合作</option>
                        <option value="BLACKLISTED">黑名单</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Section: Contact */}
                <div className="col-span-2 pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">联系信息</p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">对接人姓名</label>
                  <input type="text" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="联系人" className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px]" />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">电话</label>
                  <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+62 812-XXXX-XXXX" className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px] font-mono" />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">邮箱</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px]" />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">微信</label>
                  <input type="text" value={form.wechat} onChange={e => setForm(f => ({ ...f, wechat: e.target.value }))} placeholder="微信号" className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px]" />
                </div>

                {/* Section: Bank */}
                <div className="col-span-2 pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">收款信息</p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">开户行</label>
                  <input type="text" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="例如：BCA" className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px]" />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">银行账号</label>
                  <input type="text" value={form.bankAccount} onChange={e => setForm(f => ({ ...f, bankAccount: e.target.value }))} placeholder="账号" className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px] font-mono" />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">账户户名</label>
                  <input type="text" value={form.accountHolder} onChange={e => setForm(f => ({ ...f, accountHolder: e.target.value }))} placeholder="户名" className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px]" />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">税号 (NPWP)</label>
                  <input type="text" value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} placeholder="税号" className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px] font-mono" />
                </div>

                {/* Notes */}
                <div className="col-span-2 mt-1">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">备注信息</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="输入供应商的其他补充信息..."
                    className="w-full h-20 p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px] resize-none custom-scrollbar"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end space-x-2">
              <button onClick={closeSheet} className="h-8 px-4 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium">
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-8 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-60 flex items-center"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {editingVendor ? '保存修改' : '保存供应商'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
