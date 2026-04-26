'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, ProductCategory } from '@/lib/types/admin';
import Input from '@/components/admin/ui/Input';
import Textarea from '@/components/admin/ui/Textarea';
import Select from '@/components/admin/ui/Select';
import Button from '@/components/admin/ui/Button';
import { Card, CardHeader, CardDivider } from '@/components/admin/ui/Card';
import RichTextEditor from '@/components/admin/ui/RichTextEditor';
import SeoPreview from '@/components/admin/ui/SeoPreview';
import { useToast } from '@/components/admin/ToastProvider';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

interface SpecRow { key: string; value: string }

interface ProductFormProps {
  product?: Product;
}

const STATUS_OPTS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const UNIT_OPTS = [
  { value: 'unit', label: 'Per Unit' },
  { value: 'sqft', label: 'Per sqft' },
  { value: 'piece', label: 'Per Piece' },
];

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!product;

  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugManual, setSlugManual] = useState(isEdit);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [status, setStatus] = useState<string>(product?.status ?? 'draft');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [priceMin, setPriceMin] = useState(product?.priceMin?.toString() ?? '');
  const [priceMax, setPriceMax] = useState(product?.priceMax?.toString() ?? '');
  const [priceUnit, setPriceUnit] = useState(product?.priceUnit ?? 'unit');
  const [leadMin, setLeadMin] = useState(product?.leadTimeDays?.min?.toString() ?? '');
  const [leadMax, setLeadMax] = useState(product?.leadTimeDays?.max?.toString() ?? '');
  const [specs, setSpecs] = useState<SpecRow[]>(
    product?.specifications ? Object.entries(product.specifications).map(([key, value]) => ({ key, value })) : []
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? '');
  const [metaDesc, setMetaDesc] = useState(product?.metaDescription ?? '');
  const [focusKw, setFocusKw] = useState(product?.focusKeyword ?? '');
  const [canonicalUrl, setCanonicalUrl] = useState(product?.canonicalUrl ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    api.get<ProductCategory[]>('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugManual) setSlug(slugify(name));
  }, [name, slugManual]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!slug.trim()) e.slug = 'Slug is required';
    if (!categoryId) e.categoryId = 'Category is required';
    if (priceMin && isNaN(Number(priceMin))) e.priceMin = 'Must be a number';
    if (priceMax && isNaN(Number(priceMax))) e.priceMax = 'Must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    setSaveError('');
    const specsObj = specs.filter((s) => s.key.trim()).reduce<Record<string, string>>((acc, s) => { acc[s.key] = s.value; return acc; }, {});
    const body = {
      name: name.trim(),
      slug: slug.trim(),
      categoryId: categoryId || undefined,
      status,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      priceUnit: priceUnit || undefined,
      leadTimeDays: leadMin && leadMax ? { min: Number(leadMin), max: Number(leadMax) } : undefined,
      specifications: Object.keys(specsObj).length ? specsObj : undefined,
      images: images.filter(Boolean).length ? images.filter(Boolean) : undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDesc.trim() || undefined,
      focusKeyword: focusKw.trim() || undefined,
      canonicalUrl: canonicalUrl.trim() || undefined,
    };
    try {
      if (isEdit) {
        await api.put(`/products/${product.id}`, body);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', body);
        toast.success('Product created successfully');
      }
      router.push('/admin/products');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const catOpts = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/products')} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isEdit ? `Editing: ${product.name}` : 'Fill in details to create a new product'}</p>
        </div>
      </div>

      {saveError && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-slide-in-top">
          <span className="shrink-0">⚠</span> {saveError}
        </div>
      )}

      <Card>
        <CardHeader title="Basic Information" />
        <CardDivider />
        <div className="space-y-4">
          <Input label="Product Name" required value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g. Portable Cabin 10×10 ft" />
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input label="Slug" required value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                error={errors.slug} placeholder="auto-generated-from-name" />
            </div>
            {slugManual && (
              <Button variant="ghost" size="sm" onClick={() => { setSlugManual(false); setSlug(slugify(name)); }}>Reset</Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" required options={catOpts} placeholder="Select category" value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)} error={errors.categoryId} />
            <Select label="Status" options={STATUS_OPTS} value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Content" />
        <CardDivider />
        <div className="space-y-4">
          <Textarea label="Short Description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)}
            rows={2} placeholder="100–200 chars. Used in catalog cards." hint={`${shortDescription.length}/200`} />
          <RichTextEditor
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Full product description — supports headings, lists, bold, italic…"
            hint="Rich text. Supports headings, lists, images, bold, italic."
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Pricing & Lead Time" />
        <CardDivider />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Min Price (₹)" type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} error={errors.priceMin} placeholder="85000" />
          <Input label="Max Price (₹)" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} error={errors.priceMax} placeholder="120000" />
          <Select label="Price Unit" options={UNIT_OPTS} value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Lead Min (days)" type="number" value={leadMin} onChange={(e) => setLeadMin(e.target.value)} placeholder="14" />
            <Input label="Lead Max (days)" type="number" value={leadMax} onChange={(e) => setLeadMax(e.target.value)} placeholder="28" />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Specifications" description="Key-value attributes (Frame, Size, Material…)"
          action={<Button variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setSpecs([...specs, { key: '', value: '' }])}>Add Row</Button>} />
        <CardDivider />
        {specs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No specifications yet. Click "Add Row".</p>
        ) : (
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input placeholder="Key (e.g. Frame)" value={s.key} onChange={(e) => setSpecs(specs.map((r, j) => j === i ? { ...r, key: e.target.value } : r))} />
                <Input placeholder="Value (e.g. MS Steel)" value={s.value} onChange={(e) => setSpecs(specs.map((r, j) => j === i ? { ...r, value: e.target.value } : r))} />
                <button onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="mt-1.5 p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Images" description="Product image URLs (from Media Library)"
          action={<Button variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setImages([...images, ''])}>Add Image URL</Button>} />
        <CardDivider />
        {images.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No images. Add URLs from the Media Library.</p>
        ) : (
          <div className="space-y-2">
            {images.map((url, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input placeholder="https://…" value={url} onChange={(e) => setImages(images.map((u, j) => j === i ? e.target.value : u))} />
                {url && <div className="h-10 w-10 rounded-lg border border-gray-200 overflow-hidden shrink-0"><img src={url} alt="" className="h-full w-full object-cover" /></div>}
                <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="mt-1.5 p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="SEO" description="Controls how this product appears in Google search results" />
        <CardDivider />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input label="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="65 chars max" />
            <Textarea label="Meta Description" value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)}
              rows={3} placeholder="160 chars max" />
            <Input label="Focus Keyword" value={focusKw} onChange={(e) => setFocusKw(e.target.value)} placeholder="portable cabin" />
            <Input label="Canonical URL" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="/products/your-slug" />
          </div>
          <SeoPreview
            title={metaTitle || name}
            description={metaDesc}
            url={`https://samanprefab.com/products/${slug || 'your-product'}`}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-3 pb-6">
        <Button variant="secondary" onClick={() => router.push('/admin/products')}>Cancel</Button>
        <Button loading={saving} onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Create Product'}</Button>
      </div>
    </div>
  );
}
