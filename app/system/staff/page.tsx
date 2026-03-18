"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, MoreHorizontal, ChevronDown, FolderTree, Users, Building2 } from 'lucide-react';

type Department = {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  count: number;
  wecomDeptId: number | null;
  sortOrder: number;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  wecomUserId: string | null;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  user_organizations: { roles: { name: string } }[];
};

type Toast = { type: 'success' | 'error'; message: string };
type SetPwdTarget = { id: string; name: string } | null;

export default function StaffPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [setPwdTarget, setSetPwdTarget] = useState<SetPwdTarget>(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetPassword = async () => {
    if (!setPwdTarget) return;
    setPwdLoading(true);
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: setPwdTarget.id, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '设置失败');
      showToast('success', `已为 ${setPwdTarget.name} 设置密码`);
      setSetPwdTarget(null);
      setNewPassword('');
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : '设置失败');
    } finally {
      setPwdLoading(false);
    }
  };

  const fetchDepartments = useCallback(async () => {
    const res = await fetch('/api/departments');
    if (res.ok) {
      const data = await res.json();
      setDepartments(data);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    const res = await fetch('/api/staff');
    if (res.ok) {
      const data = await res.json();
      setEmployees(data.users);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [fetchDepartments, fetchEmployees]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/wecom/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '同步失败');
      await Promise.all([fetchDepartments(), fetchEmployees()]);
      showToast('success', `同步成功：${data.synced.departments} 个部门，${data.synced.users} 名成员`);
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : '同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const visibleEmployees = activeDept
    ? employees.filter(e => e.departmentId === activeDept)
    : employees;

  const activeDeptInfo = departments.find(d => d.id === activeDept);

  return (
    <div className="flex h-full text-[12px] bg-slate-50 p-4 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-[13px] transition-all ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.message}</span>
        </div>
      )}
      {/* Set Password Modal */}
      {setPwdTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-80 p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">设置密码</h2>
            <p className="text-xs text-slate-500 mb-4">{setPwdTarget.name}</p>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="至少6位"
              className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setSetPwdTarget(null); setNewPassword(''); }}
                className="h-8 px-4 text-xs text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSetPassword}
                disabled={pwdLoading || newPassword.length < 6}
                className="h-8 px-4 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {pwdLoading ? '保存中...' : '确认设置'}
              </button>
            </div>
          </div>
        </div>
      )}
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
                onClick={() => setActiveDept(dept.id === activeDept ? null : dept.id)}
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
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center h-8 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
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
              {activeDeptInfo?.name ?? '全部成员'}
              <span className="ml-2 text-[12px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {visibleEmployees.length} 人
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

              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-blue-600 ${syncing ? 'animate-spin' : ''}`} />
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
                  <th className="py-2 px-4 font-medium text-slate-500">部门</th>
                  <th className="py-2 px-4 font-medium text-slate-500 w-12 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {visibleEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                    <td className="py-1.5 px-4">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="py-1.5 px-4">
                      <div className="flex items-center">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2 border border-slate-200 flex-shrink-0 bg-slate-200 flex items-center justify-center text-slate-500 font-medium">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800 mr-2">{emp.name}</span>
                        {/* WeCom Status Dot */}
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${emp.wecomUserId ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          title={emp.wecomUserId ? '企微已激活' : '未激活'}
                        />
                      </div>
                    </td>
                    <td className="py-1.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.user_organizations.map((uo, i) => (
                          <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                            {uo.roles?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 px-4 text-slate-500">
                      {emp.department?.name ?? '—'}
                    </td>
                    <td className="py-1.5 px-4 text-center relative">
                      <button className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors focus:outline-none">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {/* Hover Action Menu */}
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 w-28 bg-white border border-slate-200 shadow-lg rounded-md py-1 hidden group-hover:block z-50">
                        <button
                          onClick={() => { setSetPwdTarget({ id: emp.id, name: emp.name }); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          设置密码
                        </button>
                        <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">调整角色</button>
                        <div className="h-px bg-slate-100 my-0.5 mx-2" />
                        <button className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 transition-colors">重置权限</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">暂无成员数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
