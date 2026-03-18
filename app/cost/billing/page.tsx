"use client";

import React, { useState } from 'react';
import {
  Search, Download, Plus, Printer, Mail, DollarSign,
  FileText, TrendingUp, AlertCircle, CheckCircle2, Clock,
  MoreHorizontal, ChevronDown, FileSpreadsheet, File
} from 'lucide-react';
import { formatIDR } from '@/lib/utils';

// --- Mock Data ---
const METRICS = {
  outstanding: 450000000,
  overdue: 125000000,
  dso: 18.5,
  issued: {
    total: 142,
    visa: 80,
    consulting: 42,
    legal: 20
  }
};

const INVOICES = [
  {
    id: 'INV-2603-088',
    oppId: 'OPP-452',
    customer: 'PT. Tech Solutions',
    npwp: '01.234.567.8-901.000',
    entity: 'Bantu Consulting',
    amount: 150000000,
    tax: 16500000, // 11% VAT
    issueDate: '2026-03-01',
    dueDate: '2026-03-15',
    status: 'overdue',
    paidAmount: 50000000,
  },
  {
    id: 'INV-2603-089',
    oppId: 'OPP-489',
    customer: 'Global Trade Ltd',
    npwp: '02.345.678.9-012.000',
    entity: 'Bantu Visa',
    amount: 25000000,
    tax: 0,
    issueDate: '2026-03-10',
    dueDate: '2026-03-24',
    status: 'pending',
    paidAmount: 0,
  },
  {
    id: 'INV-2603-090',
    oppId: 'OPP-412',
    customer: 'John Doe',
    npwp: '-',
    entity: 'Bantu Visa',
    amount: 8500000,
    tax: 0,
    issueDate: '2026-03-12',
    dueDate: '2026-03-12',
    status: 'paid',
    paidAmount: 8500000,
  },
  {
    id: 'INV-2603-091',
    oppId: 'OPP-501',
    customer: 'PT. Maju Jaya',
    npwp: '03.456.789.0-123.000',
    entity: 'Bantu Legal',
    amount: 75000000,
    tax: 8250000,
    issueDate: '2026-03-14',
    dueDate: '2026-03-28',
    status: 'pending',
    paidAmount: 25000000,
  },
  {
    id: 'INV-2603-092',
    oppId: 'OPP-398',
    customer: 'Jane Smith',
    npwp: '-',
    entity: 'Bantu Visa',
    amount: 12000000,
    tax: 0,
    issueDate: '2026-02-15',
    dueDate: '2026-02-15',
    status: 'void',
    paidAmount: 0,
  },
  {
    id: 'INV-2603-093',
    oppId: 'OPP-510',
    customer: 'PT. Inovasi Digital',
    npwp: '04.567.890.1-234.000',
    entity: 'Bantu Consulting',
    amount: 320000000,
    tax: 35200000,
    issueDate: '2026-03-15',
    dueDate: '2026-04-14',
    status: 'pending',
    paidAmount: 0,
  },
  {
    id: 'INV-2603-094',
    oppId: 'OPP-445',
    customer: 'Michael Wong',
    npwp: '-',
    entity: 'Bantu Legal',
    amount: 45000000,
    tax: 4950000,
    issueDate: '2026-03-05',
    dueDate: '2026-03-19',
    status: 'paid',
    paidAmount: 49950000, // Amount + Tax
  }
];

// --- Helpers ---
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> 已结清</span>;
    case 'pending':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200"><Clock className="w-3 h-3 mr-1" /> 待付款</span>;
    case 'overdue':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200"><AlertCircle className="w-3 h-3 mr-1" /> 逾期</span>;
    case 'void':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">已作废</span>;
    default:
      return null;
  }
};

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full text-[12px] bg-slate-50 p-4 overflow-hidden">
      
      {/* 1. Top: Invoicing Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4 flex-shrink-0">
        {/* Metric 1: Total Outstanding */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-medium flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1" /> 本月待收总额
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-mono font-semibold text-slate-800">
              {formatIDR(METRICS.outstanding)}
            </span>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">其中逾期</span>
              <span className="text-[11px] font-mono font-medium text-red-600">
                {formatIDR(METRICS.overdue)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: DSO */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-medium flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> 平均回款周期 (DSO)
            </span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-mono font-semibold text-slate-800">{METRICS.dso}</span>
            <span className="text-slate-500">天</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-2">
            <div className="bg-blue-500 h-1 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        {/* Metric 3: Invoices Issued */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-medium flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1" /> 本月已开票数
            </span>
            <span className="font-mono font-semibold text-slate-800">{METRICS.issued.total}</span>
          </div>
          <div className="flex h-2 w-full rounded-sm overflow-hidden mt-1">
            <div className="bg-blue-500" style={{ width: `${(METRICS.issued.visa / METRICS.issued.total) * 100}%` }} title={`Visa: ${METRICS.issued.visa}`}></div>
            <div className="bg-emerald-500" style={{ width: `${(METRICS.issued.consulting / METRICS.issued.total) * 100}%` }} title={`Consulting: ${METRICS.issued.consulting}`}></div>
            <div className="bg-indigo-500" style={{ width: `${(METRICS.issued.legal / METRICS.issued.total) * 100}%` }} title={`Legal: ${METRICS.issued.legal}`}></div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1"></span>Visa ({METRICS.issued.visa})</span>
            <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>Consulting ({METRICS.issued.consulting})</span>
            <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1"></span>Legal ({METRICS.issued.legal})</span>
          </div>
        </div>
      </div>

      {/* 2. Middle: Filtering Toolbar */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2 flex-1">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索发票号 / 商机ID / 客户名..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-slate-400"
            />
          </div>
          
          {/* Micro Selects */}
          <select className="h-8 px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-700 w-32">
            <option>所有开票主体</option>
            <option>Bantu Visa</option>
            <option>Bantu Consulting</option>
            <option>Bantu Legal</option>
          </select>

          <select className="h-8 px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-700 w-28">
            <option>所有状态</option>
            <option>待付款</option>
            <option>已结清</option>
            <option>逾期</option>
            <option>已作废</option>
          </select>

          <select className="h-8 px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-700 w-28">
            <option>所有业务类型</option>
            <option>工作签证</option>
            <option>公司注册</option>
            <option>财税代理</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Group */}
          <div className="flex items-center bg-white border border-slate-300 rounded-md overflow-hidden h-8">
            <button className="px-2.5 h-full flex items-center text-slate-600 hover:bg-slate-50 border-r border-slate-300 transition-colors" title="导出 PDF">
              <File className="w-3.5 h-3.5 mr-1" /> PDF
            </button>
            <button className="px-2.5 h-full flex items-center text-slate-600 hover:bg-slate-50 transition-colors" title="导出 Excel">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Excel
            </button>
          </div>

          {/* Primary Action */}
          <button className="flex items-center h-8 px-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            创建开票申请
          </button>
        </div>
      </div>

      {/* 3. Bottom: High-density Invoice Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2 px-3 font-medium text-slate-500 w-8">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-2 px-3 font-medium text-slate-500">发票编号 / 状态</th>
                <th className="py-2 px-3 font-medium text-slate-500">关联商机</th>
                <th className="py-2 px-3 font-medium text-slate-500">客户信息 (NPWP)</th>
                <th className="py-2 px-3 font-medium text-slate-500">开票主体</th>
                <th className="py-2 px-3 font-medium text-slate-500 text-right">金额 (含税)</th>
                <th className="py-2 px-3 font-medium text-slate-500">开票日 / 到期日</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-32">回款进度</th>
                <th className="py-2 px-3 font-medium text-slate-500 text-center w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INVOICES.map((invoice) => {
                const totalAmount = invoice.amount + invoice.tax;
                const progress = totalAmount > 0 ? Math.min(100, (invoice.paidAmount / totalAmount) * 100) : 0;
                
                return (
                  <tr key={invoice.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-1.5 px-3">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-[12.5px] text-blue-600 cursor-pointer hover:underline">
                          {invoice.id}
                        </span>
                        <div className="mt-0.5">
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                        {invoice.oppId}
                      </span>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{invoice.customer}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">NPWP: {invoice.npwp}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="text-slate-700">{invoice.entity}</span>
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[13px] font-medium text-slate-800">
                          {formatIDR(totalAmount)}
                        </span>
                        {invoice.tax > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5" title="包含税额">
                            + Tax: {formatIDR(invoice.tax)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex flex-col font-mono text-[11px]">
                        <span className="text-slate-700">{invoice.issueDate}</span>
                        <span className={`mt-0.5 ${invoice.status === 'overdue' ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                          {invoice.dueDate}
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex flex-col justify-center w-full">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-500">{progress.toFixed(0)}%</span>
                          <span className="text-slate-400 font-mono">{formatIDR(invoice.paidAmount)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200/50 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-blue-500' : 'bg-transparent'}`} 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors" title="打印/预览">
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors" title="发送邮件给客户">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors" title="登记回款">
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors" title="更多">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Static for mock) */}
        <div className="h-10 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-4 flex-shrink-0">
          <span className="text-slate-500">显示 1 - 7 条，共 142 条</span>
          <div className="flex space-x-1">
            <button className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-400 cursor-not-allowed">上一页</button>
            <button className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-50">1</button>
            <button className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-50">2</button>
            <button className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-50">3</button>
            <button className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-50">下一页</button>
          </div>
        </div>
      </div>

    </div>
  );
}
