"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, GripVertical, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type DocType = 'IMAGE' | 'PDF' | 'FILETEXT';

type MaterialItem = {
  id?: string;
  name: string;
  nameId: string;
  isRequired: boolean;
  docType: DocType;
  description: string;
  sortOrder: number;
};

type Product = {
  id: string;
  productCode: string;
  name: string;
  category: string;
  difficulty: number;
  isExpertMode: boolean;
  expertTag: string[];
  sla: number | null;
  materials: MaterialItem[];
};

type ProductSummary = {
  id: string;
  productCode: string;
  name: string;
  category: string;
  difficulty: number;
  isExpertMode: boolean;
  expertTag: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  VisaService: '签证',
  CompanyService: '公司',
  TaxService: '税务',
  LicenseService: '资质',
  'Jemput&AntarService': '接送关',
};

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'IMAGE', label: '图片' },
  { value: 'PDF', label: 'PDF' },
  { value: 'FILETEXT', label: '文本' },
];

const emptyMaterial = (): MaterialItem => ({
  name: '', nameId: '', isRequired: true, docType: 'IMAGE', description: '', sortOrder: 0,
});

function SortableMaterialItem({
  item, idx, onUpdate, onRemove,
}: {
  item: MaterialItem;
  idx: number;
  onUpdate: (idx: number, key: keyof MaterialItem, value: string | boolean) => void;
  onRemove: (idx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idx });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 p-2.5 border border-slate-200 rounded-md bg-slate-50/50">
      <button {...attributes} {...listeners} className="text-slate-300 hover:text-slate-500 mt-1.5 flex-shrink-0 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400">材料名称（中文）*</label>
          <input value={item.name} onChange={e => onUpdate(idx, 'name', e.target.value)}
            placeholder="如：护照首页扫描件"
            className="h-7 px-2 border border-slate-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400">材料名称（印尼文）</label>
          <input value={item.nameId} onChange={e => onUpdate(idx, 'nameId', e.target.value)}
            placeholder="如：Halaman depan paspor"
            className="h-7 px-2 border border-slate-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400">文件类型</label>
          <select value={item.docType} onChange={e => onUpdate(idx, 'docType', e.target.value)}
            className="h-7 px-2 border border-slate-300 rounded text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
            {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input type="checkbox" id={`req-${idx}`} checked={item.isRequired}
            onChange={e => onUpdate(idx, 'isRequired', e.target.checked)}
            className="w-3.5 h-3.5 accent-slate-900" />
          <label htmlFor={`req-${idx}`} className="text-[11px] text-slate-600 cursor-pointer">必填</label>
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[10px] text-slate-400">说明</label>
          <input value={item.description} onChange={e => onUpdate(idx, 'description', e.target.value)}
            placeholder="如：护照有效期不低于18个月"
            className="h-7 px-2 border border-slate-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>
      <button onClick={() => onRemove(idx)} className="text-slate-300 hover:text-red-500 mt-1 flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function RulesPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [tagInput, setTagInput] = useState('');

  // editable state
  const [difficulty, setDifficulty] = useState(1);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [expertTag, setExpertTag] = useState<string[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMaterials(m => arrayMove(m, active.id as number, over.id as number));
    }
  };

  useEffect(() => {
    fetch('/api/products/rules')
      .then(r => r.json())
      .then(setProducts);
  }, []);

  const loadProduct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/rules?productId=${id}`);
      const data: Product = await res.json();
      setProduct(data);
      setDifficulty(data.difficulty);
      setIsExpertMode(data.isExpertMode);
      setExpertTag(data.expertTag ?? []);
      setMaterials(data.materials ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadProduct(selectedId);
  }, [selectedId, loadProduct]);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await fetch('/api/products/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedId, difficulty, isExpertMode, expertTag, materials }),
      });
      // refresh product list
      const res = await fetch('/api/products/rules');
      setProducts(await res.json());
    } finally {
      setSaving(false);
    }
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const tag = tagInput.trim().toUpperCase();
      if (!expertTag.includes(tag)) setExpertTag(t => [...t, tag]);
      setTagInput('');
    }
  };

  const addMaterial = () => setMaterials(m => [...m, { ...emptyMaterial(), sortOrder: m.length }]);

  const updateMaterial = (idx: number, key: keyof MaterialItem, value: string | boolean) =>
    setMaterials(m => m.map((item, i) => i === idx ? { ...item, [key]: value } : item));

  const removeMaterial = (idx: number) =>
    setMaterials(m => m.filter((_, i) => i !== idx));

  const filtered = products.filter(p =>
    (catFilter === 'ALL' || p.category === catFilter) &&
    (p.productCode.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-full text-[12px] overflow-hidden">
      {/* Left: product list */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-2 border-b border-slate-200">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索产品..."
            className="w-full h-7 px-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[11px]"
          />
        </div>
        {/* Category tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {['ALL', ...Object.keys(CATEGORY_LABELS)].map(cat => {
            const count = cat === 'ALL' ? products.length : products.filter(p => p.category === cat).length;
            if (count === 0 && cat !== 'ALL') return null;
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-[11px] border-b-2 transition-colors whitespace-nowrap ${catFilter === cat ? 'border-slate-900 text-slate-900 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {cat === 'ALL' ? '全部' : CATEGORY_LABELS[cat]}
                <span className={`text-[10px] px-1 py-0.5 rounded-full ${catFilter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left px-3 py-2 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedId === p.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] text-slate-400">{p.productCode}</span>
                <span className="text-[10px] text-slate-400">{CATEGORY_LABELS[p.category] ?? p.category}</span>
              </div>
              <div className="mt-0.5 leading-snug text-[11px] truncate">{p.name}</div>
              {p.isExpertMode && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.expertTag.slice(0, 3).map(t => (
                    <span key={t} className="px-1 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px]">{t}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: rules panel */}
      <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
        {!selectedId ? (
          <div className="flex items-center justify-center h-full text-slate-400">← 选择左侧产品开始配置</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">加载中...</div>
        ) : product ? (
          <div className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <div className="font-semibold text-slate-800 text-sm">{product.name}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{product.productCode} · {CATEGORY_LABELS[product.category] ?? product.category}</div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center h-8 px-4 text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? '保存中...' : '保存配置'}
              </button>
            </div>

            {/* Two-column layout */}
            <div className="flex gap-4 flex-1 min-h-0">
              {/* Left col: 算法参数 + 专家模式 */}
              <div className="w-72 flex-shrink-0 flex flex-col gap-3">
                {/* 算法参数 */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="text-[11px] uppercase tracking-wide text-slate-400 mb-3">算法参数</h4>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-600">办理难度</label>
                    <span className="font-medium text-slate-800">Lv.{difficulty}</span>
                  </div>
                  <input
                    type="range" min="1" max="5" value={difficulty}
                    onChange={e => setDifficulty(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">权重: {(difficulty * 0.2).toFixed(1)}x · 影响派单优先级与 SLA 预警阈值</p>
                </div>

                {/* 专家模式 */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] uppercase tracking-wide text-slate-400">专家模式</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isExpertMode} onChange={e => setIsExpertMode(e.target.checked)}
                        className="w-3.5 h-3.5 accent-slate-900" />
                      <span className="text-slate-600">{isExpertMode ? '已启用' : '未启用'}</span>
                    </label>
                  </div>
                  {isExpertMode && (
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {expertTag.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] gap-1">
                            {tag}
                            <button onClick={() => setExpertTag(t => t.filter(x => x !== tag))}>
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <input
                        type="text" value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="输入标签后按回车，如 TAX..."
                        className="w-full h-8 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {!isExpertMode && (
                    <p className="text-[11px] text-slate-400">启用后可配置专家技能标签，用于智能派单匹配。</p>
                  )}
                </div>

                {/* 产品信息摘要 */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="text-[11px] uppercase tracking-wide text-slate-400 mb-3">产品信息</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'SLA', value: product.sla ? `${product.sla} 天` : '未设置' },
                      { label: '分类', value: CATEGORY_LABELS[product.category] ?? product.category },
                      { label: '材料数', value: `${materials.length} 项` },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                        <span className="text-slate-400">{row.label}</span>
                        <span className="font-medium text-slate-700">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col: 材料清单 */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="bg-white border border-slate-200 rounded-lg flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
                    <h4 className="text-[11px] uppercase tracking-wide text-slate-400">
                      材料清单模板
                      <span className="ml-2 text-slate-300 normal-case">拖拽可排序</span>
                    </h4>
                    <button onClick={addMaterial}
                      className="flex items-center gap-1 h-7 px-2.5 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 text-[11px]">
                      <Plus className="w-3 h-3" />新增材料
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {materials.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-slate-400">暂无材料规则，点击新增</div>
                    ) : (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={materials.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-2">
                            {materials.map((m, idx) => (
                              <SortableMaterialItem
                                key={idx}
                                item={m}
                                idx={idx}
                                onUpdate={updateMaterial}
                                onRemove={removeMaterial}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
