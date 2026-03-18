"use client";

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const products = [
  { id: 'SKU-1001', name: '工作签证 (KITAS)' },
  { id: 'SKU-1002', name: '外资公司注册 (PT PMA)' },
  { id: 'SKU-1003', name: '月度税务申报' },
  { id: 'SKU-1004', name: '商标注册' },
  { id: 'SKU-1005', name: '商务签证 (B211A)' },
];

const materials = ['护照首页扫描件', '客户签署的授权书 (POA)', '公司章程 (AKTA)', '税务登记证 (NPWP)'];

export default function RulesPage() {
  const [selected, setSelected] = useState(products[0]);
  const [difficulty, setDifficulty] = useState(3);
  const [skills, setSkills] = useState(['TAX', 'LEGAL']);
  const [newSkill, setNewSkill] = useState('');
  const [checkedMaterials, setCheckedMaterials] = useState([0, 1]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      const tag = newSkill.trim().toUpperCase();
      if (!skills.includes(tag)) setSkills([...skills, tag]);
      setNewSkill('');
    }
  };

  const toggleMaterial = (idx: number) => {
    setCheckedMaterials(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="flex flex-col h-full text-[12px]">
      <div className="flex flex-1 overflow-hidden">
        {/* Product selector */}
        <div className="w-56 border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar flex-shrink-0">
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left px-4 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selected.id === p.id ? 'bg-blue-50/60 text-blue-700 font-medium' : 'text-slate-700'}`}
            >
              <div className="font-mono text-[10px] text-slate-400">{p.id}</div>
              <div className="mt-0.5 leading-snug">{p.name}</div>
            </button>
          ))}
        </div>

        {/* Rules panel */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 custom-scrollbar">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm max-w-xl">
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 text-sm">专家派单与规则配置</h3>
              <p className="text-slate-500 mt-0.5">{selected.name} ({selected.id})</p>
            </div>

            <div className="p-4 space-y-6">
              {/* Difficulty */}
              <div>
                <h4 className="font-medium text-slate-700 mb-3">算法参数</h4>
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
                    onChange={e => setDifficulty(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">权重: {(difficulty * 0.2).toFixed(1)}x - 影响派单优先级与 SLA 预警阈值</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-slate-600 block mb-1.5">专家技能要求</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map(skill => (
                    <span key={skill} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {skill}
                      <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="ml-1 text-slate-400 hover:text-slate-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="输入技能标签后按回车..."
                  className="w-full h-8 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Material Rules */}
              <div>
                <h4 className="font-medium text-slate-700 mb-2">材料依赖规则 (P6 阶段必传)</h4>
                <div className="border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50/50">
                  {materials.map((item, idx) => (
                    <label key={idx} className="flex items-center p-1.5 hover:bg-slate-100 rounded cursor-pointer transition-colors">
                      <div className="relative flex items-center justify-center w-3.5 h-3.5 mr-2 border border-slate-300 rounded bg-white flex-shrink-0">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={checkedMaterials.includes(idx)}
                          onChange={() => toggleMaterial(idx)}
                        />
                        <Check className={`w-2.5 h-2.5 absolute ${checkedMaterials.includes(idx) ? 'text-blue-600' : 'text-transparent'}`} />
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button className="h-8 px-4 text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
                  保存配置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
