"use client";

import React, { useState } from 'react';
import { Search, RefreshCw, Plus, X, Check } from 'lucide-react';

// Mock Data
const products = [
  { id: 'SKU-1001', name: '工作签证 (KITAS)', category: 'VISA', price: 15000000, cycle: '30个工作日' },
  { id: 'SKU-1002', name: '外资公司注册 (PT PMA)', category: 'LEGAL', price: 25000000, cycle: '45个工作日' },
  { id: 'SKU-1003', name: '月度税务申报', category: 'TAX', price: 3000000, cycle: '5个工作日' },
  { id: 'SKU-1004', name: '商标注册', category: 'IP', price: 8000000, cycle: '180个工作日' },
  { id: 'SKU-1005', name: '商务签证 (B211A)', category: 'VISA', price: 4500000, cycle: '7个工作日' },
];

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [difficulty, setDifficulty] = useState(3);
  const [skills, setSkills] = useState(['TAX', 'LEGAL']);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      if (!skills.includes(newSkill.trim().toUpperCase())) {
        setSkills([...skills, newSkill.trim().toUpperCase()]);
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="flex flex-col h-full text-[12px]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索 SKU 或产品名称..." 
            className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            同步原始数据
          </button>
          <button className="flex items-center h-8 px-3 text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            新增 SKU
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Product List */}
        <div className="w-3/5 border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2 px-4 font-medium text-slate-500 w-24">SKU 编号</th>
                <th className="py-2 px-4 font-medium text-slate-500">产品名称</th>
                <th className="py-2 px-4 font-medium text-slate-500 w-20">分类</th>
                <th className="py-2 px-4 font-medium text-slate-500 text-right w-32">标准售价 (IDR)</th>
                <th className="py-2 px-4 font-medium text-slate-500 w-28">办理周期</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedProduct(p)}
                  className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedProduct.id === p.id ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="py-1.5 px-4 font-mono text-slate-600">{p.id}</td>
                  <td className="py-1.5 px-4 font-medium text-slate-800">{p.name}</td>
                  <td className="py-1.5 px-4">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-1.5 px-4 text-right font-medium text-slate-700">{formatIDR(p.price)}</td>
                  <td className="py-1.5 px-4 text-slate-500">{p.cycle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Details Panel */}
        <div className="w-2/5 bg-slate-50 overflow-y-auto custom-scrollbar p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 text-sm">专家派单与规则配置</h3>
              <p className="text-slate-500 mt-0.5">{selectedProduct.name} ({selectedProduct.id})</p>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Price Snapshot */}
              <div>
                <h4 className="font-medium text-slate-700 mb-2">价格快照</h4>
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-3 font-medium text-slate-500">生效日期</th>
                        <th className="py-1.5 px-3 font-medium text-slate-500 text-right">金额 (IDR)</th>
                        <th className="py-1.5 px-3 font-medium text-slate-500">操作人</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-1.5 px-3 text-slate-600">2026-03-01</td>
                        <td className="py-1.5 px-3 text-right font-medium text-slate-800">{formatIDR(selectedProduct.price)}</td>
                        <td className="py-1.5 px-3 text-slate-500">System</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 text-slate-400">2025-11-15</td>
                        <td className="py-1.5 px-3 text-right text-slate-400 line-through">{formatIDR(selectedProduct.price * 0.9)}</td>
                        <td className="py-1.5 px-3 text-slate-400">Admin</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Algorithm Params */}
              <div>
                <h4 className="font-medium text-slate-700 mb-3">算法参数</h4>
                
                <div className="space-y-4">
                  {/* Difficulty */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-slate-600">办理难度 (1-5)</label>
                      <span className="font-medium text-slate-800">Lv.{difficulty}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={difficulty}
                      onChange={(e) => setDifficulty(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">权重: {(difficulty * 0.2).toFixed(1)}x - 影响派单优先级与 SLA 预警阈值</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="text-slate-600 block mb-1.5">专家技能要求</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {skills.map(skill => (
                        <span key={skill} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="ml-1 text-slate-400 hover:text-slate-600">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="输入技能标签后按回车..." 
                      className="w-full h-8 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Material Rules */}
              <div>
                <h4 className="font-medium text-slate-700 mb-2">材料依赖规则 (P6 阶段必传)</h4>
                <div className="border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
                  {['护照首页扫描件', '客户签署的授权书 (POA)', '公司章程 (AKTA)', '税务登记证 (NPWP)'].map((item, idx) => (
                    <label key={idx} className="flex items-center p-1.5 hover:bg-slate-100 rounded cursor-pointer transition-colors">
                      <div className="relative flex items-center justify-center w-3.5 h-3.5 mr-2 border border-slate-300 rounded bg-white">
                        <input type="checkbox" className="peer sr-only" defaultChecked={idx < 2} />
                        <Check className="w-2.5 h-2.5 text-white peer-checked:text-blue-600 opacity-0 peer-checked:opacity-100 absolute" />
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
