'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────
interface Metrics {
  totalLeads: number;
  totalLeadsMom: number | null;
  convertedLeads: number;
  conversionRate: number;
  wonAmount: number;
  wonAmountMom: number | null;
  wonCount: number;
  activeDeliveries: number;
  avgDeliveryCycle: number;
  activeOpps: number;
  lostOpps: number;
}

interface FunnelStep { label: string; value: number; }
interface MonthlyTrend { month: string; amount: number; count: number; }
interface Staff { id: string; name: string; departmentId: string | null; }
interface Department { id: string; name: string; }

interface DeliveryDetail {
  id: string;
  deliveryStatus: string;
  deliveredAt: string | null;
  completedAt: string | null;
  opportunities: {
    opportunityCode: string;
    createdAt: string;
    users_auth: { name: string };
    customers: { customerName: string };
  };
  progress_points: { id: string; status: string }[];
}

interface RecentLead {
  id: string; leadCode: string; wechatName: string;
  urgency: string; status: string; category: string | null;
  createdAt: string; users_auth: { name: string } | null;
}

interface TopOpp {
  id: string; opportunityCode: string; estimatedAmount: number;
  currency: string; serviceTypeLabel: string; stageId: string;
  customers: { customerName: string }; users_auth: { name: string };
}

interface DashboardData {
  metrics: Metrics;
  funnel: FunnelStep[];
  deliveryStatus: { in_transit: number; delivered: number; completed: number };
  deliveryDetails: DeliveryDetail[];
  monthlyTrend: MonthlyTrend[];
  recentLeads: RecentLead[];
  topOpps: TopOpp[];
  staffList: Staff[];
  departments: Department[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtAmount(amount: number) {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  return `Rp ${amount.toLocaleString()}`;
}

function MomBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span className={`text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? '↑' : '↓'}{Math.abs(value)}% 较上期
    </span>
  );
}

const STAGE_COLORS: Record<string, string> = {
  P1: 'bg-slate-100 text-slate-600', P2: 'bg-blue-100 text-blue-700',
  P3: 'bg-indigo-100 text-indigo-700', P4: 'bg-violet-100 text-violet-700',
  P5: 'bg-amber-100 text-amber-700', P6: 'bg-orange-100 text-orange-700',
  P7: 'bg-emerald-100 text-emerald-700', P8: 'bg-green-100 text-green-700',
};

const URGENCY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-slate-100 text-slate-500',
};

const STATUS_LABELS: Record<string, string> = {
  new: '新线索', contacted: '已联系', ready_for_opportunity: '待转化',
  converted: '已转化', discarded: '已丢弃', public_pool: '公海', no_interest: '无意向',
};

const DELIVERY_COLORS = ['#3b82f6', '#10b981', '#6366f1'];

// ── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, mom, color }: {
  label: string; value: string | number; sub?: string;
  mom?: number | null; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
        <MomBadge value={mom ?? null} />
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return <div className="bg-white rounded-xl border border-slate-200 p-4"><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-8 w-16" /></div>;
}

// ── Funnel ─────────────────────────────────────────────────────────────────
function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const max = steps[0]?.value || 1;
  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#10b981'];
  return (
    <div className="space-y-2.5">
      {steps.map((step, i) => {
        const pct = max > 0 ? (step.value / max) * 100 : 0;
        const rate = i > 0 && steps[i - 1].value > 0
          ? ((step.value / steps[i - 1].value) * 100).toFixed(0) : null;
        return (
          <div key={step.label}>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{step.label}</span>
              <span className="font-medium text-slate-700">
                {step.value}
                {rate && <span className="ml-1.5 text-slate-400">({rate}%)</span>}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Delivery Donut ─────────────────────────────────────────────────────────
function DeliveryDonut({ data }: { data: { in_transit: number; delivered: number; completed: number } }) {
  const chartData = [
    { name: '运输中', value: data.in_transit },
    { name: '已送达', value: data.delivered },
    { name: '已完成', value: data.completed },
  ].filter(d => d.value > 0);

  if (chartData.length === 0) return <p className="text-xs text-slate-400 text-center py-8">暂无交付数据</p>;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
          dataKey="value" paddingAngle={3}>
          {chartData.map((_, i) => <Cell key={i} fill={DELIVERY_COLORS[i]} />)}
        </Pie>
        <Tooltip formatter={(v) => [`${v} 单`, '']} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Trend Chart ────────────────────────────────────────────────────────────
function TrendChart({ data }: { data: MonthlyTrend[] }) {
  if (data.length === 0) return <p className="text-xs text-slate-400 text-center py-8">暂无趋势数据</p>;
  const formatted = data.map(d => ({
    ...d,
    month: d.month.slice(5), // MM
    amountM: +(d.amount / 1_000_000).toFixed(1),
  }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} barSize={20}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="M" />
        <Tooltip
          formatter={(v) => [`Rp ${v}M`, '成交额']}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Bar dataKey="amountM" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Delivery Table ─────────────────────────────────────────────────────────
function DeliveryTable({ rows }: { rows: DeliveryDetail[] }) {
  const now = Date.now();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-400 border-b border-slate-100">
            <th className="text-left pb-2 font-medium">订单编号</th>
            <th className="text-left pb-2 font-medium">客户</th>
            <th className="text-left pb-2 font-medium">负责人</th>
            <th className="text-left pb-2 font-medium">状态</th>
            <th className="text-left pb-2 font-medium">进度节点</th>
            <th className="text-left pb-2 font-medium">创建时间</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const pts = row.progress_points;
            const done = pts.filter(p => p.status === 'completed').length;
            const total = pts.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const createdMs = new Date(row.opportunities.createdAt).getTime();
            const daysSince = Math.floor((now - createdMs) / 86400000);
            const overdue = row.deliveryStatus === 'in_transit' && daysSince > 30;
            return (
              <tr key={row.id}
                className={`border-b border-slate-50 ${overdue ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                <td className="py-2 font-mono text-slate-600">{row.opportunities.opportunityCode}</td>
                <td className="py-2 text-slate-700">{row.opportunities.customers.customerName}</td>
                <td className="py-2 text-slate-500">{row.opportunities.users_auth.name}</td>
                <td className="py-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    row.deliveryStatus === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                    row.deliveryStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {row.deliveryStatus === 'in_transit' ? '运输中' :
                     row.deliveryStatus === 'delivered' ? '已送达' : '已完成'}
                  </span>
                  {overdue && <span className="ml-1 text-red-500 font-medium">⚠ 逾期</span>}
                </td>
                <td className="py-2">
                  {total > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-slate-400">{done}/{total}</span>
                    </div>
                  ) : <span className="text-slate-300">—</span>}
                </td>
                <td className="py-2 text-slate-400">
                  {new Date(row.opportunities.createdAt).toLocaleDateString('zh-CN')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigneeId, setAssigneeId] = useState(searchParams.get('assigneeId') || 'all');
  const [deptId, setDeptId] = useState(searchParams.get('deptId') || 'all');
  const [period, setPeriod] = useState(searchParams.get('period') || 'month');

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (period !== 'month') params.set('period', period);
    if (assigneeId !== 'all') params.set('assigneeId', assigneeId);
    if (deptId !== 'all') params.set('deptId', deptId);
    router.replace(`/system/dashboard${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }, [period, assigneeId, deptId, router]);

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

  // Filter staff by dept
  const filteredStaff = data?.staffList.filter(s =>
    deptId === 'all' || s.departmentId === deptId
  ) ?? [];

  const m = data?.metrics;

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      {/* Header + Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">线索商机交付看板</h1>
          <p className="text-xs text-slate-400 mt-0.5">全链路销售与交付数据概览</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptId} onValueChange={(v) => { if (v) { setDeptId(v); setAssigneeId('all'); } }}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="全部部门" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部部门</SelectItem>
              {data?.departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="全部人员" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部人员</SelectItem>
              {filteredStaff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />) : <>
          <KpiCard label="新线索数" value={m?.totalLeads ?? 0}
            sub={`转化 ${m?.convertedLeads ?? 0} 条`} mom={m?.totalLeadsMom} color="text-blue-600" />
          <KpiCard label="商机转化率" value={`${m?.conversionRate ?? 0}%`}
            sub={`活跃商机 ${m?.activeOpps ?? 0}`} color="text-indigo-600" />
          <KpiCard label="成交金额" value={m ? fmtAmount(m.wonAmount) : '—'}
            sub={`共 ${m?.wonCount ?? 0} 单`} mom={m?.wonAmountMom} color="text-emerald-600" />
          <KpiCard label="平均交付周期" value={m?.avgDeliveryCycle ? `${m.avgDeliveryCycle} 天` : '—'}
            sub={`进行中 ${m?.activeDeliveries ?? 0} 单`} color="text-amber-600" />
        </>}
      </div>

      {/* Funnel + Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-700 mb-4">销售转化漏斗</p>
          {loading
            ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
            : data && <FunnelChart steps={data.funnel} />}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-700 mb-4">近6个月成交趋势</p>
          {loading
            ? <Skeleton className="h-44 w-full" />
            : data && <TrendChart data={data.monthlyTrend} />}
        </div>
      </div>

      {/* Delivery Status + Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-700 mb-2">交付状态分布</p>
          {loading
            ? <Skeleton className="h-44 w-full" />
            : data && <DeliveryDonut data={data.deliveryStatus} />}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 md:col-span-2">
          <p className="text-sm font-medium text-slate-700 mb-4">交付进度明细</p>
          {loading
            ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            : !data || data.deliveryDetails.length === 0
              ? <p className="text-xs text-slate-400 text-center py-8">暂无交付数据</p>
              : <DeliveryTable rows={data.deliveryDetails} />}
        </div>
      </div>

      {/* Top Opps + Urgent Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-700 mb-4">大额活跃商机</p>
          {loading
            ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            : data?.topOpps.length === 0
              ? <p className="text-xs text-slate-400 text-center py-8">暂无活跃商机</p>
              : <div className="space-y-1.5">
                  {data?.topOpps.map(op => (
                    <div key={op.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{op.customers.customerName}</p>
                        <p className="text-xs text-slate-400">{op.opportunityCode} · {op.serviceTypeLabel} · {op.users_auth.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STAGE_COLORS[op.stageId] ?? 'bg-slate-100 text-slate-600'}`}>{op.stageId}</span>
                        <span className="text-xs font-semibold text-emerald-700">{fmtAmount(op.estimatedAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-700 mb-4">紧急线索</p>
          {loading
            ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            : data?.recentLeads.length === 0
              ? <p className="text-xs text-slate-400 text-center py-8">暂无紧急线索</p>
              : <div className="space-y-1.5">
                  {data?.recentLeads.map(lead => (
                    <div key={lead.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700">{lead.wechatName}</p>
                        <p className="text-xs text-slate-400">{lead.leadCode} · {lead.users_auth?.name ?? '未分配'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Badge variant="outline" className="text-xs">{STATUS_LABELS[lead.status] ?? lead.status}</Badge>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${URGENCY_COLORS[lead.urgency]}`}>{lead.urgency}</span>
                      </div>
                    </div>
                  ))}
                </div>}
        </div>
      </div>
    </div>
  );
}
