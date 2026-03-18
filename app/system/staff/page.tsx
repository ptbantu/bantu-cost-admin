"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RefreshCw, MoreHorizontal, FolderTree, Users, Building2, UserCheck, UserX } from 'lucide-react';

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
  createdAt: string;
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
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDepartments = useCallback(async () => {
    const res = await fetch('/api/departments');
    if (res.ok) setDepartments(await res.json());
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

  const handleToggleActive = async (emp: Employee) => {
    setTogglingId(emp.id);
    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: emp.id, isActive: !emp.isActive }),
      });
      if (!res.ok) throw new Error('操作失败');
      setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, isActive: !e.isActive } : e));
      showToast('success', `已${!emp.isActive ? '启用' : '禁用'} ${emp.name}`);
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : '操作失败');
    } finally {
      setTogglingId(null);
    }
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

  const visibleEmployees = useMemo(() => {
    let list = activeDept ? employees.filter(e => e.departmentId === activeDept) : employees;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.wecomUserId ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [employees, activeDept, search]);

  const activeDeptInfo = departments.find(d => d.id === activeDept);

  return (
    <div className="flex h-full text-[12px] bg-slate-50 p-4 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-[13px] ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
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
              <button onClick={() => { setSetPwdTarget(null); setNewPassword(''); }} className="h-8 px-4 text-xs text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
              <button onClick={handleSetPassword} disabled={pwdLoading || newPassword.length < 6} className="h-8 px-4 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                {pwdLoading ? '保存中...' : '确认设置'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">

        {/* Left: Dept Tree (20%) */}
        <div className="w-1/5 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-3 border-b border-slate-200 bg-white flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="搜索部门..." className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-[11px]" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {/* All */}
            <div
              onClick={() => setActiveDept(null)}
              className={`flex items-center justify-between h-8 px-3 mx-2 my-0.5 rounded-md cursor-pointer transition-colors ${!activeDept ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <div className="flex items-center">
                <Users className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${!activeDept ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>全部成员</span>
              </div>
              <span className={`text-[10px] ${!activeDept ? 'text-blue-500' : 'text-slate-400'}`}>{employees.length}</span>
            </div>

            {departments.map((dept) => (
              <div
                key={dept.id}
                onClick={() => setActiveDept(dept.id === activeDept ? null : dept.id)}
                className={`flex items-center justify-between h-8 mx-2 my-0.5 rounded-md cursor-pointer transition-colors ${activeDept === dept.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-100'}`}
                style={{ paddingLeft: `${(dept.level * 10) + 12}px`, paddingRight: '12px' }}
              >
                <div className="flex items-center overflow-hidden">
                  {dept.level === 0
                    ? <Building2 className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${activeDept === dept.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    : <FolderTree className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${activeDept === dept.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  }
                  <span className="truncate text-[11px]">{dept.name}</span>
                </div>
                <span className={`text-[10px] ml-1 flex-shrink-0 ${activeDept === dept.id ? 'text-blue-500' : 'text-slate-400'}`}>{dept.count}</span>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
            <button onClick={handleSync} disabled={syncing} className="w-full flex items-center justify-center h-8 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50 text-[11px]">
              <RefreshCw className={`w-3 h-3 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
              同步部门架构
            </button>
          </div>
        </div>

        {/* Right: Table (80%) */}
        <div className="w-4/5 flex flex-col bg-white">
          {/* Toolbar */}
          <div className="h-12 px-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center text-slate-800 font-medium text-[13px]">
              <Users className="w-4 h-4 mr-2 text-slate-400" />
              {activeDeptInfo?.name ?? '全部成员'}
              <span className="ml-2 text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{visibleEmployees.length} 人</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索姓名、邮箱、企微..."
                  className="w-52 h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[11px]"
                />
              </div>
              <button onClick={handleSync} disabled={syncing} className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 text-[11px]">
                <RefreshCw className={`w-3 h-3 mr-1.5 text-blue-600 ${syncing ? 'animate-spin' : ''}`} />
                企微同步
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="py-2 px-3 font-medium text-slate-500 text-[11px] w-8">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="py-2 px-3 font-medium text-slate-500 text-[11px]">姓名</th>
                  <th className="py-2 px-3 font-medium text-slate-500 text-[11px]">邮箱</th>
                  <th className="py-2 px-3 font-medium text-slate-500 text-[11px]">部门</th>
                  <th className="py-2 px-3 font-medium text-slate-500 text-[11px]">角色</th>
                  <th className="py-2 px-3 font-medium text-slate-500 text-[11px]">加入时间</th>
                  <th className="py-2 px-3 font-medium text-slate-500 text-[11px] text-center">状态</th>
                  <th className="py-2 px-3 font-medium text-slate-500 text-[11px] w-10 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {visibleEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
                    <td className="py-2 px-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-[12px] leading-tight">{emp.name}</div>
                          {emp.wecomUserId && (
                            <div className="text-[10px] text-emerald-600 leading-tight">企微已绑定</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{emp.email}</td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{emp.department?.name ?? '—'}</td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {emp.user_organizations.map((uo, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                            {uo.roles?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(emp)}
                        disabled={togglingId === emp.id}
                        title={emp.isActive ? '点击禁用' : '点击启用'}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors disabled:opacity-50 ${
                          emp.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {emp.isActive
                          ? <><UserCheck className="w-3 h-3" />启用</>
                          : <><UserX className="w-3 h-3" />禁用</>
                        }
                      </button>
                    </td>
                    <td className="py-2 px-3 text-center relative">
                      <button className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-28 bg-white border border-slate-200 shadow-lg rounded-md py-1 hidden group-hover:block z-50">
                        <button onClick={() => setSetPwdTarget({ id: emp.id, name: emp.name })} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors text-[11px]">设置密码</button>
                        <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors text-[11px]">调整角色</button>
                        <div className="h-px bg-slate-100 my-0.5 mx-2" />
                        <button className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 transition-colors text-[11px]">重置权限</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleEmployees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 text-[12px]">暂无成员数据</td>
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
