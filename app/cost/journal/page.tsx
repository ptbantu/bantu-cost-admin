"use client";

import React, { useState } from 'react';
import {
  ArrowUpRight, ArrowDownRight, Wallet, Calendar, ChevronDown,
  Search, Download, Plus, Receipt, MoreHorizontal
} from 'lucide-react';
import { formatIDR } from '@/lib/utils';

// Mock Data
const journalEntries = [
  { id: 'TRX-260316-001', time: '2026-03-16 10:23', type: 'income', category: '客户付款', oppId: 'OPP-8921', entityName: 'PT. Tech Innovators', amount: 150000000, status: 'paid', hasReceipt: true },
  { id: 'TRX-260316-002', time: '2026-03-16 11:05', type: 'expense', category: 'PNBP (政府规费)', oppId: 'OPP-8921', entityName: 'Immigration Office', amount: 15000000, status: 'paid', hasReceipt: true },
  { id: 'TRX-260315-003', time: '2026-03-15 14:30', type: 'expense', category: '渠道返佣', oppId: 'OPP-8915', entityName: 'Agent John Doe', amount: 2500000, status: 'pending', hasReceipt: false },
  { id: 'TRX-260314-004', time: '2026-03-14 09:15', type: 'income', category: '客户付款', oppId: 'OPP-8930', entityName: 'Global Corp Ltd.', amount: 45000000, status: 'paid', hasReceipt: true },
  { id: 'TRX-260314-005', time: '2026-03-14 16:45', type: 'expense', category: '签证代办费', oppId: 'OPP-8901', entityName: 'Visa Agency Bali', amount: 8000000, status: 'paid', hasReceipt: true },
  { id: 'TRX-260313-006', time: '2026-03-13 10:00', type: 'expense', category: '办公杂费', oppId: '-', entityName: 'Office Supplies Co.', amount: 1200000, status: 'paid', hasReceipt: true },
];

export default function JournalPage() {
  const [hoveredReceipt, setHoveredReceipt] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full text-[12px] bg-slate-50 p-4 space-y-3 overflow-hidden">
      {/* 1. Top Stats: Financial Metrics */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        {/* Total Income */}
        <div className="bg-white h-16 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between px-4">
          <div>
            <p className="text-slate-500 mb-0.5">本月总收入 (Total Income)</p>
            <p className="font-mono text-[16px] font-semibold text-slate-800">{formatIDR(195000000)}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          </div>
        </div>
        {/* Total Expense */}
        <div className="bg-white h-16 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between px-4">
          <div>
            <p className="text-slate-500 mb-0.5">本月总支出 (Total Expense)</p>
            <p className="font-mono text-[16px] font-semibold text-slate-800">{formatIDR(26700000)}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          </div>
        </div>
        {/* Net Cashflow */}
        <div className="bg-white h-16 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between px-4">
          <div>
            <p className="text-slate-500 mb-0.5">净现金流 (Net Cashflow)</p>
            <p className="font-mono text-[16px] font-semibold text-slate-800">{formatIDR(168300000)}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* 2. Middle: High-density Action Bar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-2">
          {/* Date Range Picker Mock */}
          <button className="flex items-center h-8 px-2.5 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            2026-03-01 ~ 2026-03-16
          </button>
          
          {/* Selects Mock */}
          <button className="flex items-center justify-between h-8 px-2.5 w-24 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            全部收支
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button className="flex items-center justify-between h-8 px-2.5 w-28 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            全部分类
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索流水号或商机 ID..." 
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            导出 Excel
          </button>
          <button className="flex items-center h-8 px-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            记一笔
          </button>
        </div>
      </div>

      {/* 3. Bottom: Journal Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2 px-3 font-medium text-slate-500 w-32">交易时间</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-36">流水号</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-16">收/支</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-32">科目分类</th>
                <th className="py-2 px-3 font-medium text-slate-500">关联业务</th>
                <th className="py-2 px-3 font-medium text-slate-500 text-right w-36">金额 (IDR)</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-28">状态</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-12 text-center">凭证</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{entry.time}</td>
                  <td className="py-2 px-3">
                    <span className="text-blue-600 font-mono cursor-pointer hover:underline">{entry.id}</span>
                  </td>
                  <td className="py-2 px-3">
                    {entry.type === 'income' ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-200/60">收入</span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200/60">支出</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-700">{entry.category}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center">
                      {entry.oppId !== '-' && <span className="text-slate-500 mr-1.5">{entry.oppId}</span>}
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">{entry.entityName}</span>
                    </div>
                  </td>
                  <td className={`py-2 px-3 text-right font-mono text-[13px] font-medium ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.type === 'income' ? '+' : '-'}{formatIDR(entry.amount)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${entry.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className={`text-[11px] font-medium ${entry.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {entry.status === 'paid' ? '已核销/PAID' : '待处理/PENDING'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center relative">
                    {entry.hasReceipt ? (
                      <div 
                        className="inline-flex items-center justify-center text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredReceipt(entry.id)}
                        onMouseLeave={() => setHoveredReceipt(null)}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        
                        {/* HoverCard Popover */}
                        {hoveredReceipt === entry.id && (
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-2 pointer-events-none">
                            <div className="text-[10px] text-slate-500 mb-1 text-left">凭证缩略图</div>
                            <div className="w-full h-32 bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                              <img src={`https://picsum.photos/seed/${entry.id}/200/150`} alt="Receipt Thumbnail" className="w-full h-full object-cover opacity-90" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center relative">
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors focus:outline-none">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Hover Action Menu */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-28 bg-white border border-slate-200 shadow-lg rounded-md py-1 hidden group-hover:block z-40">
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">查看详情</button>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">关联发票</button>
                      <div className="h-px bg-slate-100 my-0.5 mx-2" />
                      <button className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 transition-colors">撤销</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
