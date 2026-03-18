"use client";

import React, { useState } from 'react';
import { 
  BrainCircuit, Scale, ShieldAlert, ArrowDown, Save, Settings2, ChevronDown, Info
} from 'lucide-react';

export default function DispatchEnginePage() {
  const [activeScenario, setActiveScenario] = useState('all');
  const [maxLoad, setMaxLoad] = useState(15);
  const [timeoutHours, setTimeoutHours] = useState(2);

  const scenarios = [
    { id: 'all', name: '全部通用规则' },
    { id: 'visa', name: '签证服务线' },
    { id: 'tax', name: '财税审计线' },
    { id: 'pma', name: 'PMA公司注册' },
  ];

  return (
    <div className="flex flex-col h-full text-[12px] bg-slate-50 p-4 overflow-hidden">
      {/* 1. Top Console */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-shrink-0 mb-4">
        <div>
          <div className="flex items-center">
            <Settings2 className="w-4 h-4 mr-2 text-slate-700" />
            <h1 className="text-sm font-semibold text-slate-800">派单与路由规则引擎</h1>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">配置商机在 Pipeline 中流转时的自动分配策略</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-slate-600 font-medium">全局自动派单 (Global Auto-Dispatch)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <button className="flex items-center h-8 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            保存配置
          </button>
        </div>
      </div>

      {/* 2. Main Layout */}
      <div className="flex flex-1 overflow-hidden space-x-4">
        
        {/* Left: Scenario Selector */}
        <div className="w-64 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-3 border-b border-slate-200 bg-slate-50/50">
            <h2 className="font-medium text-slate-700">业务场景 (Scenarios)</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {scenarios.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeScenario === s.id 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Algorithm Pipeline Config */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
          <div className="max-w-3xl mx-auto space-y-0 flex flex-col items-center">
            
            {/* Layer 1: Expert Skill Algorithm */}
            <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center mr-2.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-slate-800">Layer 1: 专家匹配算法 (Expert Skill Algorithm)</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-slate-500 mb-2">技能匹配度要求</label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="matchType" className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500" defaultChecked />
                      <span className="text-slate-700 font-medium">绝对匹配 <span className="text-slate-400 font-normal">(必须100%满足所需技能)</span></span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer relative group">
                      <input type="radio" name="matchType" className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500" />
                      <span className="text-slate-700 font-medium flex items-center">
                        模糊匹配 
                        <span className="text-slate-400 font-normal ml-1">(技能匹配度 &gt; 70% 即可)</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 ml-1.5 hover:text-slate-600 transition-colors" />
                      </span>
                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2.5 bg-slate-800 text-white text-[11px] rounded-md shadow-xl font-normal leading-relaxed text-center pointer-events-none">
                        当技能匹配度超过70%时，系统将自动选择该专家。
                        {/* Tooltip Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-slate-800"></div>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-2 cursor-pointer mt-2">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" defaultChecked />
                    <span className="text-slate-700 font-medium">启用等级压制 <span className="text-slate-400 font-normal">(商机难度 L3 只能派给 L3 及以上专家)</span></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="h-8 flex flex-col items-center justify-center text-slate-300">
              <div className="w-px h-4 bg-slate-300"></div>
              <ArrowDown className="w-3.5 h-3.5 -mt-1" />
            </div>

            {/* Layer 2: Load Balancing Algorithm */}
            <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center mr-2.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h3 className="font-medium text-slate-800">Layer 2: 负载均衡算法 (Load Balancing Algorithm)</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="p-4 space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-500 mb-2">核心分配策略</label>
                    <div className="relative">
                      <select className="w-full h-8 pl-2.5 pr-8 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] appearance-none bg-white text-slate-700 font-medium">
                        <option>最少活跃任务优先 (Least Active Tasks)</option>
                        <option>轮询 (Round Robin)</option>
                        <option>历史成功率最高 (Highest Conversion)</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-slate-500">个人最大并发负载限制</label>
                      <span className="font-mono text-blue-600 font-medium">{maxLoad} 单/人</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={maxLoad}
                        onChange={(e) => setMaxLoad(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <input 
                        type="number" 
                        value={maxLoad}
                        onChange={(e) => setMaxLoad(parseInt(e.target.value))}
                        className="w-14 h-8 px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="h-8 flex flex-col items-center justify-center text-slate-300">
              <div className="w-px h-4 bg-slate-300"></div>
              <ArrowDown className="w-3.5 h-3.5 -mt-1" />
            </div>

            {/* Layer 3: Fallback & Escalation */}
            <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center p-3 border-b border-slate-200 bg-slate-50/50">
                <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center mr-2.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <h3 className="font-medium text-slate-800">Layer 3: 熔断与降级策略 (Fallback & Escalation)</h3>
              </div>
              <div className="p-4 space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-500 mb-2">无匹配专家或全部满载时</label>
                    <div className="relative">
                      <select className="w-full h-8 pl-2.5 pr-8 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] appearance-none bg-white text-slate-700 font-medium">
                        <option>退回公海 (Public Pool)</option>
                        <option>转交部门主管手动分配</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-slate-500 mb-2">接单超时重派</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600">如果分配后</span>
                      <input 
                        type="number" 
                        value={timeoutHours}
                        onChange={(e) => setTimeoutHours(parseInt(e.target.value))}
                        className="w-12 h-8 px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] font-mono text-center"
                      />
                      <span className="text-slate-600">小时未接单，自动重新派单</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
