'use client';

import { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ── Types ──────────────────────────────────────────────────────────────────
interface Metrics {
  totalLeads: number;
  convertedLeads: number;
  wonAmount: number;
  wonCount: number;
  activeDeliveries: number;
  activeOpps: number;
  lostOpps: number;
}

interface FunnelStep {
  label: string;
  value: number;
}

interface RecentLead {
  id: string;
  leadCode: string;
  wechatName: string;
  urgency: string;
  status: string;
  category: string | null;
  createdAt: string;
  users_auth: { name: string } | null;
}

interface TopOpp {
  id: string;
  opportunityCode: string;
  estimatedAmount: number;
  currency: string;
  serviceTypeLabel: string;
  stageId: string;
  status: string;
  customers: { customerName: string };
  users_auth: { name: string };
}

interface Staff {
  id: string;
  name: string;
}

interface DashboardData {
  metrics: Metrics;
  funnel: FunnelStep[];
  recentLeads: RecentLead[];
  topOpps: TopOpp[];
  staffList: Staff[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtAmount(amount: number, currency: string) {
  if (currency === 'IDR') return `Rp ${(amount / 1000000).toFixed(1)}M`;
  if (currency === 'CNY') return `¥${amount.toLocaleString()}`;
  return `${currency} ${amount.toLocaleString()}`;
}

const STAGE_COLORS: Record<string, string> = {
  P1: 'bg-slate-100 text-slate-600',
  P2: 'bg-blue-100 text-blue-700',
  P3: 'bg-indigo-100 text-indigo-700',
  P4: 'bg-violet-100 text-violet-700',
  P5: 'bg-amber-100 text-amber-700',
  P6: 'bg-orange-100 text-orange-700',
  P7: 'bg-emerald-100 text-emerald-700',
  P8: 'bg-green-100 text-green-700',
};

const URGENCY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-slate-100 text-slate-500',
};

const STATUS_LABELS: Record<string, string> = {
  new: '新线索',
  contacted: '已联系',
  ready_for_opportunity: '待转化',
  converted: '已转化',
  discarded: '已丢弃',
  public_pool: '公海',
  no_interest: '无意向',
};

// ── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Funnel Bar ─────────────────────────────────────────────────────────────
function FunnelBar({ steps }: { steps: FunnelStep[] }) {
  const max = steps[0]?.value || 1;
  const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500'];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-700 mb-4">转化漏斗</p>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const pct = max > 0 ? (step.value / max) * 100 : 0;
          const convRate = i > 0 && steps[i - 1].value > 0
            ? ((step.value / steps[i - 1].value) * 100).toFixed(0)
            : null;
          return (
            <div key={step.label}>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{step.label}</span>
                <span className="font-medium text-slate-700">
                  {step.value}
                  {convRate && <span className="ml-2 text-slate-400">({convRate}%)</span>}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors[i]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigneeId, setAssigneeId] = useState('all');
  const [period, setPeriod] = useState('month');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (assigneeId !== 'all') params.set('assigneeId', assigneeId);
      const res = await fetch(`/api/dashboard?${params}`);
      const json = await res.json();
      if (!json.error) setData(json);
    } finally {
      setLoading(false);
    }
  }, [assigneeId, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const m = data?.metrics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">线索商机交付看板</h1>
          <p className="text-sm text-slate-500 mt-0.5">全链路销售与交付数据概览</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="全部人员" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部人员</SelectItem>
              {data?.staffList.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="新线索数"
            value={m?.totalLeads ?? 0}
            sub={`已转化 ${m?.convertedLeads ?? 0} 条`}
            color="text-blue-600"
          />
          <MetricCard
            label="活跃商机"
            value={m?.activeOpps ?? 0}
            sub={`已丢失 ${m?.lostOpps ?? 0} 个`}
            color="text-indigo-600"
          />
          <MetricCard
            label="成交总额"
            value={m ? fmtAmount(m.wonAmount, 'IDR') : '—'}
            sub={`共 ${m?.wonCount ?? 0} 单`}
            color="text-emerald-600"
          />
          <MetricCard
            label="交付进行中"
            value={m?.activeDeliveries ?? 0}
            sub="运输中订单"
            color="text-amber-600"
          />
        </div>
      )}

      {/* Funnel + Top Opps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data && <FunnelBar steps={data.funnel} />}

        {/* Top Opportunities */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-700 mb-4">大额活跃商机</p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : data?.topOpps.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">暂无活跃商机</p>
          ) : (
            <div className="space-y-2">
              {data?.topOpps.map(op => (
                <div key={op.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{op.customers.customerName}</p>
                    <p className="text-xs text-slate-400">{op.opportunityCode} · {op.serviceTypeLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STAGE_COLORS[op.stageId] ?? 'bg-slate-100 text-slate-600'}`}>
                      {op.stageId}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {fmtAmount(op.estimatedAmount, op.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Urgent Leads */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm font-medium text-slate-700 mb-4">紧急线索</p>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : data?.recentLeads.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">暂无紧急线索</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="text-left pb-2 font-medium">线索编号</th>
                  <th className="text-left pb-2 font-medium">微信名</th>
                  <th className="text-left pb-2 font-medium">分类</th>
                  <th className="text-left pb-2 font-medium">状态</th>
                  <th className="text-left pb-2 font-medium">紧急度</th>
                  <th className="text-left pb-2 font-medium">负责人</th>
                  <th className="text-left pb-2 font-medium">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 font-mono text-slate-500">{lead.leadCode}</td>
                    <td className="py-2 font-medium text-slate-700">{lead.wechatName}</td>
                    <td className="py-2 text-slate-500">{lead.category ?? '—'}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-xs">
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${URGENCY_COLORS[lead.urgency]}`}>
                        {lead.urgency}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500">{lead.users_auth?.name ?? '未分配'}</td>
                    <td className="py-2 text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
