"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RefreshCw, MoreHorizontal, X, Loader2, Bot, Send, CheckCircle2, XCircle } from 'lucide-react';

interface WecomBot {
  id: string;
  name: string;
  webhookUrl: string;
  isActive: boolean;
  description: string | null;
  createdAt: string;
}

const emptyForm = { name: '', webhookUrl: '', description: '' };

function maskUrl(url: string) {
  try {
    const u = new URL(url);
    const key = u.searchParams.get('key') ?? '';
    return `${u.origin}/...?key=${key.slice(0, 8)}***`;
  } catch {
    return url.slice(0, 30) + '***';
  }
}

export default function WecomBotsPage() {
  const [bots, setBots] = useState<WecomBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<WecomBot | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, 'ok' | 'fail'>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wecom/bots');
      const data = await res.json();
      setBots(Array.isArray(data) ? data : []);
    } catch {
      showToast('加载失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const openAdd = () => { setEditingBot(null); setForm(emptyForm); setIsSheetOpen(true); };
  const openEdit = (bot: WecomBot) => {
    setEditingBot(bot);
    setForm({ name: bot.name, webhookUrl: bot.webhookUrl, description: bot.description ?? '' });
    setOpenMenuId(null);
    setIsSheetOpen(true);
  };
  const closeSheet = () => { setIsSheetOpen(false); setEditingBot(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return showToast('请填写机器人名称', 'error');
    if (!form.webhookUrl.startsWith('https://qyapi.weixin.qq.com/')) return showToast('Webhook 地址格式不正确', 'error');
    setSaving(true);
    try {
      const method = editingBot ? 'PUT' : 'POST';
      const body = editingBot ? { id: editingBot.id, ...form } : form;
      const res = await fetch('/api/wecom/bots', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      showToast(editingBot ? '更新成功' : '新增成功');
      closeSheet();
      fetchBots();
    } catch {
      showToast('保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (bot: WecomBot) => {
    setOpenMenuId(null);
    try {
      await fetch('/api/wecom/bots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bot.id, name: bot.name, webhookUrl: bot.webhookUrl, description: bot.description, isActive: !bot.isActive }),
      });
      fetchBots();
    } catch { showToast('操作失败', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该机器人？')) return;
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/wecom/bots', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error();
      showToast('已删除');
      fetchBots();
    } catch { showToast('删除失败', 'error'); }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(r => { const n = { ...r }; delete n[id]; return n; });
    try {
      const res = await fetch('/api/wecom/bots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'test', id }) });
      const data = await res.json();
      if (data.ok) { setTestResult(r => ({ ...r, [id]: 'ok' })); showToast('测试推送成功'); }
      else { setTestResult(r => ({ ...r, [id]: 'fail' })); showToast(`推送失败：${data.error}`, 'error'); }
    } catch {
      setTestResult(r => ({ ...r, [id]: 'fail' }));
      showToast('推送失败', 'error');
    } finally { setTestingId(null); }
  };

  const filtered = bots.filter(b =>
    !search ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="flex flex-col h-full text-[12px] bg-slate-50 p-4 space-y-3 overflow-hidden relative"
      onClick={() => setOpenMenuId(null)}
    >
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2 rounded-lg shadow-lg text-white text-[12px] font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索机器人名称、备注..."
              className="w-full h-8 pl-8 pr-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px]"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchBots} className="flex items-center h-8 px-3 text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors font-medium shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <button onClick={openAdd} className="flex items-center h-8 px-3 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors font-medium shadow-sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            新增机器人
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2 px-3 font-medium text-slate-500 min-w-[180px]">机器人名称</th>
                <th className="py-2 px-3 font-medium text-slate-500 min-w-[260px]">Webhook 地址</th>
                <th className="py-2 px-3 font-medium text-slate-500 min-w-[180px]">备注</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-20">状态</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-28">创建时间</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-24 text-center">测试推送</th>
                <th className="py-2 px-3 font-medium text-slate-500 w-12 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  加载中...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  {search ? '未找到匹配的机器人' : '暂无机器人，点击右上角新增'}
                </td></tr>
              ) : filtered.map(bot => (
                <tr key={bot.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="font-medium text-slate-900">{bot.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{maskUrl(bot.webhookUrl)}</td>
                  <td className="py-2 px-3 text-slate-500">{bot.description || <span className="text-slate-300">—</span>}</td>
                  <td className="py-2 px-3">
                    {bot.isActive
                      ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">启用</span>
                      : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200/60">停用</span>
                    }
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-[11px] font-mono">
                    {new Date(bot.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => handleTest(bot.id)}
                      disabled={testingId === bot.id || !bot.isActive}
                      className="inline-flex items-center h-6 px-2 rounded text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-200/60 hover:bg-blue-100 transition-colors disabled:opacity-40"
                    >
                      {testingId === bot.id ? <Loader2 className="w-3 h-3 animate-spin" />
                        : testResult[bot.id] === 'ok' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        : testResult[bot.id] === 'fail' ? <XCircle className="w-3 h-3 text-red-500" />
                        : <Send className="w-3 h-3" />}
                      <span className="ml-1">测试</span>
                    </button>
                  </td>
                  <td className="py-2 px-3 text-center relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === bot.id ? null : bot.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors focus:outline-none"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {openMenuId === bot.id && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 bg-white border border-slate-200 shadow-lg rounded-md py-1 z-40">
                        <button onClick={() => openEdit(bot)} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">编辑</button>
                        <button onClick={() => handleToggle(bot)} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors">
                          {bot.isActive ? '停用' : '启用'}
                        </button>
                        <div className="h-px bg-slate-100 my-0.5 mx-2" />
                        <button onClick={() => handleDelete(bot.id)} className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 transition-colors">删除</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && (
          <div className="px-3 py-2 border-t border-slate-100 text-[11px] text-slate-400 flex-shrink-0">
            共 {filtered.length} 个机器人{search ? `（已筛选，共 ${bots.length} 个）` : ''}
          </div>
        )}
      </div>

      {/* Sheet */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={closeSheet} />
          <div className="relative w-full sm:max-w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{editingBot ? '编辑机器人' : '新增机器人'}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{editingBot ? `编辑：${editingBot.name}` : '配置企业微信 Webhook 机器人'}</p>
              </div>
              <button onClick={closeSheet} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5">机器人名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="例如：销售线索提醒助手"
                  className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Webhook 地址 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.webhookUrl}
                  onChange={e => setForm(f => ({ ...f, webhookUrl: e.target.value }))}
                  placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                  className="w-full h-8 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[12px] font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">在企业微信群聊 → 群机器人 → 添加机器人 中获取</p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5">备注</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="说明该机器人用于哪个群或场景..."
                  className="w-full h-20 p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[12px] resize-none custom-scrollbar"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end space-x-2">
              <button onClick={closeSheet} className="h-8 px-4 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium">
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-8 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-60 flex items-center"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {editingBot ? '保存修改' : '保存机器人'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
