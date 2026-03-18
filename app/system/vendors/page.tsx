"use client";

import React, { useState } from 'react';
import { 
  Search, ChevronDown, Plus, MessageCircle, MoreHorizontal, X 
} from 'lucide-react';

// Formatting helper
const formatIDR = (amount: number) => {
  return `Rp ${new Intl.NumberFormat('en-US').format(amount)}`;
};

// Mock Data
const vendors = [
  { id: 'SUP-2603-001', name: '印尼雅加达移民局', category: 'GOVERNMENT', contact: 'Bpk. Budi', wecom: false, activeOpps: 12, totalPaid: 450000000 },
  { id: 'SUP-2603-002', name: 'Fadih (Notaris公证师)', category: 'EXPERT', contact: 'Fadih', wecom: true, activeOpps: 5, totalPaid: 120500000 },
  { id: 'SUP-2603-003', name: 'Global Visa Agency', category: 'AGENT', contact: 'Alice Wang', wecom: true, activeOpps: 28, totalPaid: 850000000 },
  { id: 'SUP-2603-004', name: 'BKPM 投资协调委员会', category: 'GOVERNMENT', contact: 'Ibu Siti', wecom: false, activeOpps: 8, totalPaid: 0 },
  { id: 'SUP-2603-005', name: 'Tax Consultant Partners', category: 'AGENT', contact: 'David Chen', wecom: true, activeOpps: 15, totalPaid: 340000000 },
  { id: 'SUP-2603-006', name: 'Legal Translator Inc.', category: 'EXPERT', contact: 'Sarah Lee', wecom: true, activeOpps: 3, totalPaid: 15000000 },
];

export default function VendorsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col h-full text-[12px] bg-slate-50 p-4 space-y-3 overflow-hidden relative">
      
      {/* 1. Toolbar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索供应商名称、联系人..." 
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px]"
            />
          </div>
          
          {/* Category Dropdown */}
          <button className="flex items-center justify-between h-8 px-2.5 w-32 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            全部分类
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* WeCom Sync Button */}
          <button className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors font-medium shadow-sm">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
            企微群同步
          </button>
          
          {/* Add Vendor Button */}
          <button 
            onClick={() => setIsSheetOpen(true)}
            className="flex items-center h-8 px-3 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            新增供应商
          </button>
        </div>
      </div>

      {/* 2. Vendor Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2 px-3 font-medium text-slate-500 w-32">供应商编号</th>
                <th className="py-2 px-3 font-medium text-slate-500">供应商名称</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-28">分类</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-40">联系人与企微</th>
                <th className="py-2 px-3 font-medium text-slate-500 text-right w-32">合作中商机数</th>
                <th className="py-2 px-3 font-medium text-slate-500 text-right w-40">累计已支付</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-12 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{vendor.id}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{vendor.name}</td>
                  <td className="py-2 px-3">
                    {vendor.category === 'GOVERNMENT' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">GOVERNMENT</span>
                    )}
                    {vendor.category === 'AGENT' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">AGENT</span>
                    )}
                    {vendor.category === 'EXPERT' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60">EXPERT</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex flex-col space-y-1">
                      <span className="text-slate-700">{vendor.contact}</span>
                      {vendor.wecom ? (
                        <span className="inline-flex items-center px-1.5 py-[1px] rounded-[4px] text-[9px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60 w-fit">
                          已建群
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-[1px] rounded-[4px] text-[9px] font-medium bg-slate-50 text-slate-500 border border-slate-200/60 w-fit">
                          未拉群
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="font-mono text-blue-600 cursor-pointer hover:underline font-medium">
                      {vendor.activeOpps}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                    {formatIDR(vendor.totalPaid)}
                  </td>
                  <td className="py-2 px-3 text-center relative">
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors focus:outline-none">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Hover Action Menu */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 bg-white border border-slate-200 shadow-lg rounded-md py-1 hidden group-hover:block z-40">
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">编辑资料</button>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">查看对账单</button>
                      <div className="h-px bg-slate-100 my-0.5 mx-2" />
                      <button className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-600 transition-colors">发起企微群聊</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Slide-out Sheet (Add/Edit Vendor) */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSheetOpen(false)}
          />
          
          {/* Sheet Panel */}
          <div className="relative w-full sm:max-w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">新增供应商</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">录入新的供应商或政府机构信息</p>
              </div>
              <button 
                onClick={() => setIsSheetOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Body (Grid Form) */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {/* Name - Full Width */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">供应商名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="例如：印尼雅加达移民局"
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px]"
                  />
                </div>

                {/* Category */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">分类 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="w-full h-8 pl-2.5 pr-8 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] appearance-none bg-white">
                      <option value="">请选择分类</option>
                      <option value="GOVERNMENT">政府机构 (GOVERNMENT)</option>
                      <option value="AGENT">第三方代理 (AGENT)</option>
                      <option value="EXPERT">个人专家 (EXPERT)</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">对接人电话</label>
                  <input 
                    type="text" 
                    placeholder="+62 812-XXXX-XXXX"
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] font-mono"
                  />
                </div>

                {/* Bank Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">收款银行</label>
                  <input 
                    type="text" 
                    placeholder="例如：BCA"
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px]"
                  />
                </div>

                {/* Bank Account */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">账号</label>
                  <input 
                    type="text" 
                    placeholder="银行账号"
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] font-mono"
                  />
                </div>
                
                {/* Notes - Full Width */}
                <div className="col-span-2 mt-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1.5">备注信息</label>
                  <textarea 
                    placeholder="输入供应商的其他补充信息..."
                    className="w-full h-20 p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] resize-none custom-scrollbar"
                  />
                </div>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end space-x-2">
              <button 
                onClick={() => setIsSheetOpen(false)}
                className="h-8 px-4 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium"
              >
                取消
              </button>
              <button 
                onClick={() => setIsSheetOpen(false)}
                className="h-8 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                保存供应商
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
