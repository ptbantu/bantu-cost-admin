"use client";

import React, { useState } from 'react';
import { Search, RefreshCw, MoreHorizontal, ChevronDown, FolderTree, Users, Building2 } from 'lucide-react';

// Mock Data
const departments = [
  { id: 1, name: 'Bantu 集团', count: 128, level: 0 },
  { id: 2, name: '销售中心', count: 45, level: 1 },
  { id: 3, name: '交付中心', count: 52, level: 1 },
  { id: 4, name: '签证交付组', count: 20, level: 2 },
  { id: 5, name: '法务注册组', count: 18, level: 2 },
  { id: 6, name: '财税服务组', count: 14, level: 2 },
  { id: 7, name: '财务部', count: 8, level: 1 },
  { id: 8, name: '技术部', count: 23, level: 1 },
];

const employees = [
  { id: 'EMP-001', name: 'Alice Wang', avatar: 'https://picsum.photos/seed/alice/100/100', active: true, roles: ['Delivery Manager', 'System Admin'], skills: ['签证 L3', 'VIP 客服'], load: 12 },
  { id: 'EMP-002', name: 'Bob Chen', avatar: 'https://picsum.photos/seed/bob/100/100', active: true, roles: ['Delivery Specialist'], skills: ['公司注册 L2', '法务合规'], load: 28 },
  { id: 'EMP-003', name: 'Charlie Lin', avatar: 'https://picsum.photos/seed/charlie/100/100', active: false, roles: ['Sales'], skills: ['B2B 销售', '大客户跟进'], load: 0 },
  { id: 'EMP-004', name: 'Diana Peng', avatar: 'https://picsum.photos/seed/diana/100/100', active: true, roles: ['Cost Admin', 'Tax Specialist'], skills: ['财税专家', '审计 L2'], load: 5 },
  { id: 'EMP-005', name: 'Ethan Zhang', avatar: 'https://picsum.photos/seed/ethan/100/100', active: true, roles: ['Delivery Specialist'], skills: ['签证 L1'], load: 45 },
  { id: 'EMP-006', name: 'Fiona Li', avatar: 'https://picsum.photos/seed/fiona/100/100', active: true, roles: ['Delivery Specialist'], skills: ['签证 L2', '加急处理'], load: 18 },
  { id: 'EMP-007', name: 'George Wu', avatar: 'https://picsum.photos/seed/george/100/100', active: true, roles: ['Legal Advisor'], skills: ['公司注册 L3', '牌照申请'], load: 8 },
];

export default function StaffPage() {
  const [activeDept, setActiveDept] = useState(3); // Default to 交付中心

  return (
    <div className="flex h-full text-[12px] bg-slate-50 p-4 overflow-hidden">
      <div className="flex w-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Left Column: Organization Tree (25%) */}
        <div className="w-1/4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search Header */}
          <div className="p-3 border-b border-slate-200 bg-white flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索部门..." 
                className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Tree List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {departments.map((dept) => (
              <div 
                key={dept.id}
                onClick={() => setActiveDept(dept.id)}
                className={`flex items-center justify-between h-8 px-3 mx-2 my-0.5 rounded-md cursor-pointer transition-colors ${
                  activeDept === dept.id 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                style={{ paddingLeft: `${(dept.level * 12) + 12}px` }}
              >
                <div className="flex items-center overflow-hidden">
                  {dept.level === 0 ? (
                    <Building2 className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${activeDept === dept.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  ) : (
                    <FolderTree className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${activeDept === dept.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  )}
                  <span className="truncate">{dept.name}</span>
                </div>
                <span className={`text-[10px] ml-2 flex-shrink-0 ${activeDept === dept.id ? 'text-blue-500' : 'text-slate-400'}`}>
                  {dept.count}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Sync Button */}
          <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
            <button className="w-full flex items-center justify-center h-8 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              同步部门架构
            </button>
          </div>
        </div>

        {/* Right Column: Employee Table (75%) */}
        <div className="w-3/4 flex flex-col bg-white">
          {/* Top Toolbar */}
          <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center text-slate-800 font-medium text-sm">
              <Users className="w-4 h-4 mr-2 text-slate-500" />
              {departments.find(d => d.id === activeDept)?.name || '未知部门'}
              <span className="ml-2 text-[12px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {departments.find(d => d.id === activeDept)?.count || 0} 人
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索姓名、企微..." 
                  className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button className="flex items-center justify-between h-8 px-3 w-28 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                批量操作
                <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
              </button>
              
              <button className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                从企业微信同步成员
              </button>
            </div>
          </div>

          {/* High Density Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="py-2 px-4 font-medium text-slate-500 w-8">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="py-2 px-4 font-medium text-slate-500">基本信息</th>
                  <th className="py-2 px-4 font-medium text-slate-500">系统权限</th>
                  <th className="py-2 px-4 font-medium text-slate-500">专家技能标签</th>
                  <th className="py-2 px-4 font-medium text-slate-500 text-right">负载指标</th>
                  <th className="py-2 px-4 font-medium text-slate-500 w-12 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                    <td className="py-1.5 px-4">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="py-1.5 px-4">
                      <div className="flex items-center">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2 border border-slate-200 flex-shrink-0">
                          <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-slate-800 mr-2">{emp.name}</span>
                        {/* WeCom Status Dot */}
                        <div 
                          className={`w-1.5 h-1.5 rounded-full ${emp.active ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                          title={emp.active ? '企微已激活' : '未激活'}
                        />
                      </div>
                    </td>
                    <td className="py-1.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.roles.map(role => (
                          <span key={role} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.skills.map(skill => (
                          <span key={skill} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 px-4 text-right">
                      <span className={`font-mono ${emp.load > 20 ? 'text-orange-600 font-semibold' : 'text-slate-600'}`}>
                        {emp.load}
                      </span>
                    </td>
                    <td className="py-1.5 px-4 text-center relative">
                      <button className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors focus:outline-none">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Hover Action Menu (Simulated Dropdown) */}
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 w-28 bg-white border border-slate-200 shadow-lg rounded-md py-1 hidden group-hover:block z-50">
                        <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">编辑技能</button>
                        <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">调整角色</button>
                        <div className="h-px bg-slate-100 my-0.5 mx-2" />
                        <button className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 transition-colors">重置权限</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
