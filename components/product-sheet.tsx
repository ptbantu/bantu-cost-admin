"use client";

import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const CATEGORIES = [
  { value: 'VisaService', label: '签证服务' },
  { value: 'CompanyService', label: '公司服务' },
  { value: 'TaxService', label: '税务服务' },
  { value: 'LicenseService', label: '资质服务' },
  { value: 'Jemput&AntarService', label: '接送关' },
];

type ProductPrice = {
  costPriceIdr: number;
  costPriceCny: number;
  partnerPriceIdr: number | null;
  partnerPriceCny: number | null;
  retailPriceIdr: number;
  retailPriceCny: number | null;
};

type Product = {
  id: string;
  productCode: string;
  name: string;
  category: string;
  description: string | null;
  difficulty: number;
  isExpertMode: boolean;
  expertTag: string[];
  sla: number | null;
  prices: ProductPrice[];
};

type FormState = {
  productCode: string;
  name: string;
  category: string;
  description: string;
  sla: string;
  difficulty: string;
  isExpertMode: boolean;
  expertTag: string[];
  costPriceIdr: string;
  costPriceCny: string;
  partnerPriceIdr: string;
  partnerPriceCny: string;
  retailPriceIdr: string;
  retailPriceCny: string;
};

const emptyForm = (): FormState => ({
  productCode: '', name: '', category: 'VisaService', description: '',
  sla: '', difficulty: '1', isExpertMode: false, expertTag: [],
  costPriceIdr: '', costPriceCny: '', partnerPriceIdr: '', partnerPriceCny: '',
  retailPriceIdr: '', retailPriceCny: '',
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
};

export function ProductSheet({ open, onOpenChange, product, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!product;

  useEffect(() => {
    if (open) {
      if (product) {
        const p = product.prices[0];
        setForm({
          productCode: product.productCode,
          name: product.name,
          category: product.category,
          description: product.description ?? '',
          sla: product.sla ? String(product.sla) : '',
          difficulty: String(product.difficulty),
          isExpertMode: product.isExpertMode,
          expertTag: product.expertTag ?? [],
          costPriceIdr: p ? String(p.costPriceIdr) : '',
          costPriceCny: p ? String(p.costPriceCny) : '',
          partnerPriceIdr: p?.partnerPriceIdr != null ? String(p.partnerPriceIdr) : '',
          partnerPriceCny: p?.partnerPriceCny != null ? String(p.partnerPriceCny) : '',
          retailPriceIdr: p ? String(p.retailPriceIdr) : '',
          retailPriceCny: p?.retailPriceCny != null ? String(p.retailPriceCny) : '',
        });
      } else {
        setForm(emptyForm());
      }
      setError(null);
    }
  }, [open, product]);

  const set = (key: keyof FormState, value: string | boolean | string[]) =>
    setForm(f => ({ ...f, [key]: value }));

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const tag = tagInput.trim().toUpperCase();
      if (!form.expertTag.includes(tag)) set('expertTag', [...form.expertTag, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) =>
    set('expertTag', form.expertTag.filter(t => t !== tag));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.productCode.trim()) {
      setError('产品编码和名称为必填项');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/products/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product?.id,
          productCode: form.productCode,
          name: form.name,
          category: form.category,
          description: form.description || null,
          sla: form.sla ? parseInt(form.sla) : null,
          difficulty: parseInt(form.difficulty) || 1,
          isExpertMode: form.isExpertMode,
          expertTag: form.expertTag,
          costPriceIdr: parseFloat(form.costPriceIdr) || 0,
          costPriceCny: parseFloat(form.costPriceCny) || 0,
          partnerPriceIdr: form.partnerPriceIdr ? parseFloat(form.partnerPriceIdr) : null,
          partnerPriceCny: form.partnerPriceCny ? parseFloat(form.partnerPriceCny) : null,
          retailPriceIdr: parseFloat(form.retailPriceIdr) || 0,
          retailPriceCny: form.retailPriceCny ? parseFloat(form.retailPriceCny) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '保存失败');
      }
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto text-[12px]">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-sm">{isEdit ? '编辑产品' : '新增产品'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {/* 基本信息 */}
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">基本信息</div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="productCode" className="text-[11px]">产品编码 *</Label>
              <Input id="productCode" value={form.productCode} onChange={e => set('productCode', e.target.value)}
                disabled={isEdit} placeholder="如 C312" className="h-8 text-[12px]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category" className="text-[11px]">分类 *</Label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="h-8 px-2 border border-input rounded-md text-[12px] bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-[11px]">产品名称 *</Label>
            <Input id="name" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="如 工作签 C312（35工作日）" className="h-8 text-[12px]" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-[11px]">备注说明</Label>
            <Input id="description" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="可选" className="h-8 text-[12px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sla" className="text-[11px]">SLA（天）</Label>
              <Input id="sla" type="number" value={form.sla} onChange={e => set('sla', e.target.value)}
                placeholder="如 7" className="h-8 text-[12px]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px]">难度（1-5）</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onClick={() => set('difficulty', String(n))}
                    className={`flex-1 h-8 rounded border text-[11px] transition-colors ${parseInt(form.difficulty) >= n ? 'bg-amber-400 border-amber-400 text-white' : 'border-input text-muted-foreground hover:bg-muted'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 专家模式 */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="expertMode" checked={form.isExpertMode}
              onChange={e => set('isExpertMode', e.target.checked)}
              className="w-3.5 h-3.5 accent-slate-900" />
            <Label htmlFor="expertMode" className="text-[11px] cursor-pointer">专家模式</Label>
          </div>

          {form.isExpertMode && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px]">专家标签</Label>
              <div className="flex flex-wrap gap-1 mb-1">
                {form.expertTag.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px] gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)}><X className="size-2.5" /></button>
                  </Badge>
                ))}
              </div>
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag} placeholder="输入标签后按回车，如 TAX" className="h-8 text-[12px]" />
            </div>
          )}

          {/* 价格 */}
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-2">价格信息</div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'costPriceIdr', label: '成本价 (IDR)' },
              { key: 'costPriceCny', label: '成本价 (CNY)' },
              { key: 'partnerPriceIdr', label: '渠道价 (IDR)' },
              { key: 'partnerPriceCny', label: '渠道价 (CNY)' },
              { key: 'retailPriceIdr', label: '直客价 (IDR)' },
              { key: 'retailPriceCny', label: '直客价 (CNY)' },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label className="text-[11px]">{label}</Label>
                <Input type="number" value={form[key as keyof FormState] as string}
                  onChange={e => set(key as keyof FormState, e.target.value)}
                  placeholder="0" className="h-8 text-[12px]" />
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-[11px]">{error}</p>}
        </div>

        <SheetFooter className="px-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-8 text-[12px]">取消</Button>
          <Button onClick={handleSubmit} disabled={saving} className="flex-1 h-8 text-[12px]">
            {saving ? '保存中...' : '保存'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
