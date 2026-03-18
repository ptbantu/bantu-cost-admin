"use client";

import React, { useState } from 'react';
import { 
  Bot, Settings, Activity, MessageSquare, Users, ShieldAlert, 
  Plus, X, Clock, Workflow, Zap, MoreHorizontal, CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Mock Data
const ROBOTS = [
  {
    id: 'visa',
    name: 'Bantu 签证助手',
    status: 'online',
    stats: { label: '今日推送', value: 128 },
    duties: '到期提醒 / 查询',
    icon: <Bot className="w-5 h-5 text-blue-500" />,
    bg: 'bg-blue-50',
    border: 'border-blue-100'
  },
  {
    id: 'delivery',
    name: 'Bantu 交付助手',
    status: 'online',
    stats: { label: '今日建群', value: 45 },
    duties: 'P1-P8进度 / 自动拉群',
    icon: <Users className="w-5 h-5 text-emerald-500" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  },
  {
    id: 'internal',
    name: 'Bantu 内部管家',
    status: 'warning',
    stats: { label: '今日预警', value: 12 },
    duties: '审计 / 回收 / 风控',
    icon: <ShieldAlert className="w-5 h-5 text-orange-500" />,
    bg: 'bg-orange-50',
    border: 'border-orange-100'
  }
];

const RULES = [
  {
    id: 'rule-1',
    enabled: true,
    trigger: '新线索录入 (New Lead)',
    actor: 'Bantu 内部管家',
    actorIcon: <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />,
    action: '分配负责人（执行算法）',
    algorithm: '专家匹配 (模糊)',
    lastTriggered: '2026-03-16 14:23:05'
  },
  {
    id: 'rule-2',
    enabled: true,
    trigger: '商机转入 P6 阶段',
    actor: 'Bantu 交付助手',
    actorIcon: <Users className="w-3.5 h-3.5 text-emerald-500" />,
    action: '一键拉起企微群',
    algorithm: '-',
    lastTriggered: '2026-03-16 13:15:22'
  },
  {
    id: 'rule-3',
    enabled: false,
    trigger: '签证即将到期 (< 30天)',
    actor: 'Bantu 签证助手',
    actorIcon: <Bot className="w-3.5 h-3.5 text-blue-500" />,
    action: '发送 Markdown 消息',
    algorithm: '-',
    lastTriggered: '2026-03-15 09:00:00'
  },
  {
    id: 'rule-4',
    enabled: true,
    trigger: '线索停滞 > 7天',
    actor: 'Bantu 内部管家',
    actorIcon: <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />,
    action: '退回公海并通知主管',
    algorithm: '负载均衡',
    lastTriggered: '2026-03-16 10:05:11'
  }
];

export default function AutomationCenterPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);

  const openDrawer = (rule: any) => {
    setSelectedRule(rule);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-full text-[12px] bg-slate-50 p-4 overflow-hidden relative">
      {/* 1. Robot Status Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4 flex-shrink-0">
        {ROBOTS.map(robot => (
          <div key={robot.id} className={`bg-white rounded-lg border ${robot.border} shadow-sm p-3 relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-md ${robot.bg} flex items-center justify-center`}>
                  {robot.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{robot.name}</h3>
                  <div className="flex items-center mt-0.5">
                    {robot.status === 'online' ? (
                      <span className="flex items-center text-[10px] text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> 在线
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] text-orange-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1"></span> 预警
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-500 mb-0.5">{robot.stats.label}</p>
                <p className="font-mono text-sm font-semibold text-slate-800">{robot.stats.value}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-0.5">主要职责</p>
                <p className="text-[11px] text-slate-700 truncate" title={robot.duties}>{robot.duties}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Automation Rules Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Workflow className="w-4 h-4 text-slate-700" />
            <h2 className="font-semibold text-slate-800">自动化触发规则 (Automation Rules)</h2>
          </div>
          <button 
            onClick={() => openDrawer({ trigger: '', actor: 'Bantu 签证助手', action: '', algorithm: '-' })}
            className="flex items-center h-7 px-3 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            新建规则
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-sm">
              <tr>
                <th className="py-2.5 px-4 font-medium text-slate-500 border-b border-slate-200 w-16">状态</th>
                <th className="py-2.5 px-4 font-medium text-slate-500 border-b border-slate-200">触发事件 (Trigger)</th>
                <th className="py-2.5 px-4 font-medium text-slate-500 border-b border-slate-200">执行机器人 (Actor)</th>
                <th className="py-2.5 px-4 font-medium text-slate-500 border-b border-slate-200">执行动作 (Action)</th>
                <th className="py-2.5 px-4 font-medium text-slate-500 border-b border-slate-200">配置的算法</th>
                <th className="py-2.5 px-4 font-medium text-slate-500 border-b border-slate-200 text-right">最后触发</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RULES.map((rule) => (
                <tr 
                  key={rule.id} 
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => openDrawer(rule)}
                >
                  <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={rule.enabled} />
                      <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">
                    {rule.trigger}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center space-x-1.5">
                      {rule.actorIcon}
                      <span className="text-slate-600">{rule.actor}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">
                    {rule.action}
                  </td>
                  <td className="py-2.5 px-4">
                    {rule.algorithm !== '-' ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[11px]">
                        <Zap className="w-3 h-3 mr-1" />
                        {rule.algorithm}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-500">
                    {rule.lastTriggered}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Workflow Editor Drawer (Sheet) */}
      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200
        ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-slate-700" />
            <h2 className="font-semibold text-slate-800">配置自动化工作流</h2>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* 事件设定 */}
          <div className="space-y-3">
            <h3 className="font-medium text-slate-800 flex items-center">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] mr-2">1</span>
              事件设定 (Trigger)
            </h3>
            <div className="grid gap-3 pl-7">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">监听数据表</label>
                <select className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] bg-white text-slate-700">
                  <option>Leads (线索表)</option>
                  <option>Opportunities (商机表)</option>
                  <option>Customers (客户表)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">变更条件</label>
                <select className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] bg-white text-slate-700">
                  <option>新增记录时 (On Create)</option>
                  <option>字段更新时 (On Update)</option>
                  <option>满足特定条件时 (Condition Match)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 ml-7" />

          {/* 算法接入 */}
          <div className="space-y-3">
            <h3 className="font-medium text-slate-800 flex items-center">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] mr-2">2</span>
              算法接入 (Algorithm)
            </h3>
            <div className="pl-7">
              <label className="block text-[11px] text-slate-500 mb-1">调用派单规则引擎</label>
              <select className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] bg-white text-slate-700">
                <option>不使用算法 (None)</option>
                <option>专家匹配算法 (Expert Match)</option>
                <option>负载均衡算法 (Load Balancing)</option>
                <option>熔断降级策略 (Fallback)</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-slate-100 ml-7" />

          {/* 消息模板 */}
          <div className="space-y-3">
            <h3 className="font-medium text-slate-800 flex items-center">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] mr-2">3</span>
              执行动作与消息模板 (Action)
            </h3>
            <div className="space-y-3 pl-7">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">执行机器人</label>
                <select className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] bg-white text-slate-700">
                  <option>Bantu 签证助手</option>
                  <option>Bantu 交付助手</option>
                  <option>Bantu 内部管家</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] text-slate-500">Markdown 消息模板</label>
                  <div className="flex space-x-1">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] cursor-pointer hover:bg-slate-200">{'{customer_name}'}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] cursor-pointer hover:bg-slate-200">{'{lead_id}'}</span>
                  </div>
                </div>
                <textarea 
                  className="w-full h-32 p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] bg-white text-slate-700 font-mono resize-none"
                  placeholder="输入 Markdown 格式的消息内容..."
                  defaultValue={`**新线索提醒**\n客户姓名: {customer_name}\n线索ID: {lead_id}\n\n请及时跟进处理。`}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-2">
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="h-8 px-4 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium"
          >
            取消
          </button>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="h-8 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            保存工作流
          </button>
        </div>
      </div>
    </div>
  );
}
