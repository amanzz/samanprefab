"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Product, ProductStatus, ProductFaq, ProductFeature, ProductApplication, ProductCustomButton, ProductFeatureIcon } from "@/types/product.types";
import FeatureIconPicker, { type FeatureIconValue } from "@/components/products/FeatureIconPicker";
import { ICON_MAP } from "@/lib/feature-icons";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useActiveAttributes } from "@/hooks/useAttributes";
import MediaLibrary from "@/components/media/MediaLibrary";
import AIPanel, { type AIApplyPayload } from "@/components/products/AIPanel";
import { API_CONFIG } from "@/lib/api";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] w-full rounded-xl border border-gray-200 bg-gray-50 animate-pulse dark:border-gray-800 dark:bg-gray-900/50" />
    ),
  }
);

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = 'basic' | 'description' | 'pricing' | 'media' | 'specs' | 'features' | 'applications' | 'faq' | 'seo' | 'actions';
type SaveState = 'idle' | 'loading' | 'success' | 'error';

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  faq: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  basic: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  description: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  pricing: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  media: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  specs: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  ),
  features: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  applications: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  ),
  seo: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  actions: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3" />
    </svg>
  ),
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'basic',        label: 'Basic Info'    },
  { id: 'description',  label: 'Description'   },
  { id: 'pricing',      label: 'Pricing'       },
  { id: 'media',        label: 'Media'         },
  { id: 'specs',        label: 'Specs'         },
  { id: 'features',     label: 'Features'      },
  { id: 'applications', label: 'Use Cases'     },
  { id: 'faq',          label: 'FAQ'           },
  { id: 'seo',          label: 'SEO'           },
  { id: 'actions',      label: 'Custom Actions' },
];

const STATUS_CONFIG: Record<ProductStatus, { label: string; badge: string }> = {
  [ProductStatus.ACTIVE]:   { label: 'Published', badge: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400' },
  [ProductStatus.DRAFT]:    { label: 'Draft',     badge: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400' },
  [ProductStatus.ARCHIVED]: { label: 'Archived',  badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function mapBackendToForm(data: any): Partial<Product> {
  const rawStatus = String(data.status || '').toLowerCase();
  const status =
    rawStatus === 'published' ? ProductStatus.ACTIVE :
    rawStatus === 'archived'  ? ProductStatus.ARCHIVED :
    ProductStatus.DRAFT;

  const features: ProductFeature[] = Array.isArray(data.features)
    ? data.features.map((f: any, i: number) => ({
        ...f,
        id: f.id || `feat-${i}`,
        icon: typeof f.icon === 'string'
          ? (f.icon ? { type: 'icon' as const, value: f.icon } : undefined)
          : f.icon ?? undefined,
      }))
    : [];

  const applications: ProductApplication[] = Array.isArray(data.applications)
    ? data.applications.map((a: any, i: number) => ({ ...a, id: a.id || `app-${i}` }))
    : [];

  const customButtons: ProductCustomButton[] = Array.isArray(data.customButtons)
    ? data.customButtons.map((b: any, i: number) => ({ ...b, id: b.id || `btn-${i}` }))
    : [];

  return {
    ...data,
    sku:            data.sku              || '',
    gallery:        data.images           || data.gallery        || [],
    mainImage:      data.featuredImage    || (data.images || data.gallery || [])[0] || '',
    featuredImage:  data.featuredImage    || (data.images || data.gallery || [])[0] || '',
    seoTitle:       data.metaTitle        || data.seoTitle        || '',
    seoDescription: data.metaDescription  || data.seoDescription || '',
    priceText:      data.priceText        || data.priceDisplay    || '',
    priceDisplay:   data.priceText        || data.priceDisplay    || '',
    attributes: data.specifications
      ? Object.entries(data.specifications as Record<string, unknown>).map(
          ([label, value], idx) => ({ id: `attr-${idx}`, label, value: String(value) })
        )
      : Array.isArray(data.attributes) ? data.attributes : [],
    features,
    applications,
    customButtons,
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
    showFeatures:     data.showFeatures     ?? data.show_features     ?? true,
    showApplications: data.showApplications ?? data.show_applications ?? true,
    showFaq:          data.showFaq          ?? data.show_faq          ?? true,
    sectionOrder:     Array.isArray(data.sectionOrder) ? data.sectionOrder : (data.section_order || ['features', 'applications', 'faq']),
    deliveryTime:     data.deliveryTime     || data.delivery_time     || '',
    warranty:         data.warranty         || '',
    installationTime: data.installationTime || data.installation_time || '',
    seoKeywords: data.focusKeyword || data.seoKeywords || '',
    status,
  };
}

function mapFormToBackend(data: Partial<Product>): Record<string, unknown> {
  const statusMap: Record<string, string> = {
    [ProductStatus.ACTIVE]:   'published',
    [ProductStatus.DRAFT]:    'draft',
    [ProductStatus.ARCHIVED]: 'archived',
  };
  const backendStatus = statusMap[data.status as string] ?? 'draft';

  // Fix slug: lowercase, replace spaces with hyphens, remove invalid chars
  const rawSlug = data.slug || data.name || '';
  const normalizedSlug = rawSlug
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Fix prices: must be positive integers per schema
  const priceMin = Math.max(1, Math.round(data.priceMin || 0));
  const priceMax = Math.max(priceMin, Math.round(data.priceMax || priceMin));

  const categoryId = data.categoryId || '';

  // Clean features/applications/customButtons — strip temporary id
  const features = (data.features || []).map(({ id: _id, ...rest }: any) => rest);
  const applications = (data.applications || []).map(({ id: _id, ...rest }: any) => rest);
  const customButtons = ((data as any).customButtons || []).map(({ id: _id, ...rest }: any) => rest);

  console.debug('[ProductForm] Payload mapping:', {
    status: `${data.status} → ${backendStatus}`,
    sku: data.sku || '(not set)',
    slug: `${data.slug} → ${normalizedSlug}`,
    priceMin, priceMax,
    categoryId: categoryId || '(missing!)',
    imagesCount: (data.gallery || []).length,
    featuresCount: features.length,
    applicationsCount: applications.length,
  });

  return {
    name:             data.name,
    slug:             normalizedSlug || undefined,
    sku:              data.sku       || undefined,
    categoryId,
    shortDescription: data.shortDescription || '',
    description:      data.description      || '',
    images:           data.gallery          || [],
    featuredImage:    (data as any).featuredImage || (data.gallery || [])[0] || undefined,
    metaTitle:        data.seoTitle         || '',
    metaDescription:  data.seoDescription   || '',
    focusKeyword:     data.seoKeywords      || '',
    faqs:             (data.faqs || []).map((f: any) => ({ question: f.question || '', answer: f.answer || '' })),
    features,
    applications,
    customButtons,
    showFeatures:     (data as any).showFeatures     ?? true,
    showApplications: (data as any).showApplications ?? true,
    showFaq:          (data as any).showFaq          ?? true,
    sectionOrder:     data.sectionOrder || ['features', 'applications', 'faq'],
    deliveryTime:     data.deliveryTime || undefined,
    warranty:         data.warranty || undefined,
    installationTime: data.installationTime || undefined,
    priceMin,
    priceMax,
    priceText:        (data as any).priceText || (data as any).priceDisplay || undefined,
    priceUnit: 'unit',
    status:    backendStatus,
    specifications: (data.attributes || []).reduce(
      (acc: Record<string, string>, attr: any) => {
        if (attr.label && attr.value) acc[attr.label] = attr.value;
        return acc;
      }, {}
    ),
  };
}

/** SEO score 0–100 with actionable suggestions */
function calcSeoScore(
  seoTitle: string, seoDescription: string, slug: string,
  name: string, description: string, gallery: string[], focusKeyword: string
): { score: number; color: string; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;
  const kw = focusKeyword.trim().toLowerCase();
  const title = (seoTitle || name || '').trim();

  // Title length (20 pts)
  const tLen = title.length;
  if (tLen >= 50 && tLen <= 60)       score += 20;
  else if (tLen >= 30 && tLen < 50)   score += 10;
  else if (tLen === 0)                suggestions.push('Add a meta title (50–60 characters ideal)');
  else if (tLen > 60)                 suggestions.push('Meta title is too long — keep it under 60 characters');
  else                                suggestions.push('Meta title is too short — aim for 50–60 characters');

  // Meta description length (20 pts)
  const dLen = seoDescription.length;
  if (dLen >= 150 && dLen <= 160)     score += 20;
  else if (dLen >= 100 && dLen < 150) score += 10;
  else if (dLen === 0)                suggestions.push('Add a meta description (150–160 characters ideal)');
  else if (dLen > 160)                suggestions.push('Meta description is too long — keep it under 160 characters');
  else                                suggestions.push('Meta description is too short — aim for 150–160 characters');

  // Focus keyword checks (40 pts total) — only if keyword set
  if (kw) {
    if (title.toLowerCase().includes(kw))            score += 15;
    else suggestions.push(`Add focus keyword "${focusKeyword}" to the meta title`);
    if (seoDescription.toLowerCase().includes(kw))  score += 15;
    else suggestions.push(`Add focus keyword "${focusKeyword}" to the meta description`);
    if (slug.toLowerCase().includes(kw.replace(/ /g, '-'))) score += 10;
    else suggestions.push('Consider including the focus keyword in the URL slug');
  } else {
    score += 10;
    suggestions.push('Set a focus keyword to unlock keyword-specific SEO analysis');
  }

  // Content length (10 pts)
  const plain = (description || '').replace(/<[^>]+>/g, '').trim();
  if (plain.length >= 300)      score += 10;
  else if (plain.length > 0)  { score += 5; suggestions.push('Description is short — aim for 300+ characters for better ranking'); }
  else                           suggestions.push('Add a full product description');

  // Has images (10 pts)
  if (gallery.length > 0) score += 10;
  else                     suggestions.push('Add at least one product image');

  const color = score >= 70 ? 'text-success-600' : score >= 40 ? 'text-warning-600' : 'text-error-600';
  return { score: Math.min(score, 100), color, suggestions };
}

const DEFAULT_FORM: Partial<Product> = {
  name: '', slug: '', sku: '', description: '', shortDescription: '',
  priceMin: 0, priceMax: 0, priceDisplay: '', priceText: '',
  status: ProductStatus.DRAFT,
  categoryId: '', gallery: [], mainImage: '', featuredImage: '', seoTitle: '', seoDescription: '', seoKeywords: '',
  attributes: [], faqs: [], features: [], applications: [],
  showFeatures: true, showApplications: true, showFaq: true,
  sectionOrder: ['features', 'applications', 'faq'],
  deliveryTime: '', warranty: '', installationTime: '',
};

// Debug mode flag - can be enabled via localStorage
const DEBUG_MODE = typeof window !== 'undefined' && localStorage.getItem('productFormDebug') === 'true';

// Field to tab mapping for error navigation
const FIELD_TO_TAB: Record<string, Tab> = {
  name: 'basic',
  slug: 'basic',
  categoryId: 'basic',
  shortDescription: 'basic',
  description: 'description',
  images: 'media',
  gallery: 'media',
  featuredImage: 'media',
  priceMin: 'pricing',
  priceMax: 'pricing',
  priceText: 'pricing',
  priceUnit: 'pricing',
  metaTitle: 'seo',
  metaDescription: 'seo',
  focusKeyword: 'seo',
  faqs: 'faq',
  specifications: 'specs',
  status: 'basic',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFormHandle {
  submit: () => void;
}

export interface ProductFormProps {
  initialData?: Product;
  onSuccess?:         (product?: Product) => void;
  onCancel?:          () => void;
  hideFooterButtons?: boolean;
  onSaveStateChange?: (state: SaveState) => void;
}

// ─── SpecsTab ─────────────────────────────────────────────────────────────────

interface SpecsTabProps {
  attributes: any[];
  onAdd: () => void;
  onChange: (id: string, field: 'label' | 'value', value: string) => void;
  onRemove: (id: string) => void;
}

function SpecsTab({ attributes, onAdd, onChange, onRemove }: SpecsTabProps) {
  const { data: predefined = [], isLoading } = useActiveAttributes();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Technical Specifications</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Select from predefined attributes or type a custom label.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onAdd} type="button">+ Add Row</Button>
      </div>

      <div className="space-y-2.5">
        {Array.isArray(attributes) && attributes.map((attr: any) => {
          const predAttr = predefined.find((p) => p.name === attr.label);
          const inputType = predAttr?.type === 'number' ? 'number' : 'text';
          const placeholder = predAttr?.unit ? `Value (${predAttr.unit})` : 'Value';

          return (
            <div key={attr.id} className="flex items-center gap-3">
              <div className="relative flex-1">
                <select
                  value={predefined.some((p) => p.name === attr.label) ? attr.label : '__custom__'}
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') {
                      onChange(attr.id, 'label', e.target.value);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                >
                  {isLoading && <option disabled>Loading…</option>}
                  {predefined.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}{p.unit ? ` (${p.unit})` : ''}</option>
                  ))}
                  <option value="__custom__">Custom…</option>
                </select>
                {(!predefined.some((p) => p.name === attr.label) || attr.label === '') && (
                  <Input
                    className="mt-1.5"
                    placeholder="Custom label"
                    value={attr.label}
                    onChange={(e) => onChange(attr.id, 'label', e.target.value)}
                  />
                )}
              </div>
              <div className="flex-1">
                {predAttr?.type === 'select' && predAttr.options && predAttr.options.length > 0 ? (
                  <select
                    value={attr.value}
                    onChange={(e) => onChange(attr.id, 'value', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select…</option>
                    {predAttr.options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder={placeholder}
                    type={inputType}
                    value={attr.value}
                    onChange={(e) => onChange(attr.id, 'value', e.target.value)}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(attr.id)}
                className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-500"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          );
        })}

        {(!attributes || attributes.length === 0) && (
          <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 dark:border-gray-800">
            No specifications added yet — click "Add Row" to start
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProductForm = forwardRef<ProductFormHandle, ProductFormProps>(
  function ProductForm(
    { initialData, onSuccess, onCancel, hideFooterButtons = false, onSaveStateChange },
    ref
  ) {
    const formRef = useRef<HTMLFormElement>(null);

    const [formData, setFormData] = useState<Partial<Product>>(() =>
      initialData ? mapBackendToForm(initialData) : { ...DEFAULT_FORM }
    );
    const [activeTab, setActiveTab]         = useState<Tab>('basic');
    const [isMediaOpen, setIsMediaOpen]     = useState(false);
    const [mediaTarget, setMediaTarget]     = useState<'editor' | 'gallery'>('gallery');
    const [isAIPanelOpen, setAIPanelOpen]   = useState(false);
    const [saveState, _setSaveState]        = useState<SaveState>('idle');
    const [saveMsg, setSaveMsg]             = useState('');
    const [focusKeyword, setFocusKw]        = useState('');
    const [fieldErrors, setFieldErrors]     = useState<Record<string, string>>({});
    const [apiErrors, setApiErrors]         = useState<Array<{field: string; message: string}>>([]);
    const [showDebugPanel, setShowDebugPanel] = useState(DEBUG_MODE);
    const [isDirty, setIsDirty]             = useState(false);
    const [mediaTargetFeatureId, setMediaTargetFeatureId] = useState<string | null>(null);
    const [mediaTargetAppId, setMediaTargetAppId]         = useState<string | null>(null);
    const [iconPickerFeatureId, setIconPickerFeatureId]   = useState<string | null>(null);

    const setSaveState = useCallback((s: SaveState) => {
      _setSaveState(s);
      onSaveStateChange?.(s);
      if (s === 'success') {
        setIsDirty(false);
      }
    }, [onSaveStateChange]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        console.debug('[ProductForm] External submit triggered');
        formRef.current?.requestSubmit();
      },
    }));

    const createMutation  = useCreateProduct();
    const updateMutation  = useUpdateProduct();
    const { data: catData } = useCategories({ limit: 100 });
    const categories = catData?.items || [];

    const isEditing     = !!initialData;
    const isPending     = createMutation.isPending || updateMutation.isPending;
    const currentStatus = (formData.status as ProductStatus) || ProductStatus.DRAFT;
    const statusCfg     = STATUS_CONFIG[currentStatus];

    // ── Memoised derived values ───────────────────────────────────────────────

    const tabErrors = useMemo(() => {
      // Check for API errors per tab
      const hasApiErrorOnTab = (tab: Tab) => apiErrors.some(e => FIELD_TO_TAB[e.field] === tab);

      return {
        basic:        !formData.name || formData.name.length < 3 || !formData.categoryId || (formData.shortDescription || '').length < 20 || hasApiErrorOnTab('basic'),
        description:  (formData.description || '').replace(/<[^>]+>/g, '').trim().length < 50 || hasApiErrorOnTab('description'),
        pricing:      hasApiErrorOnTab('pricing'),
        media:        (formData.gallery || []).length === 0 || hasApiErrorOnTab('media'),
        specs:        hasApiErrorOnTab('specs'),
        features:     hasApiErrorOnTab('features'),
        applications: hasApiErrorOnTab('applications'),
        faq:          hasApiErrorOnTab('faq'),
        seo:          hasApiErrorOnTab('seo'),
        actions:      hasApiErrorOnTab('actions'),
      };
    }, [formData, apiErrors]);

    const seo = useMemo(() => calcSeoScore(
      formData.seoTitle     || '',
      formData.seoDescription || '',
      formData.slug         || '',
      formData.name         || '',
      formData.description  || '',
      formData.gallery      || [],
      focusKeyword
    ), [formData.seoTitle, formData.seoDescription, formData.slug, formData.name, formData.description, formData.gallery, focusKeyword]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((p) => ({ ...p, [name]: value }));
      setIsDirty(true);
    }, []);

    const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value as ProductStatus;
      console.debug('[ProductForm] Status changed:', next);
      setFormData((prev) => ({ ...prev, status: next }));
      setIsDirty(true);
    }, []);

    const handleDescriptionChange = useCallback((v: string) => {
      setFormData((prev) => ({ ...prev, description: v }));
      setIsDirty(true);
    }, []);

    const handleAddAttr = useCallback(() => {
      setFormData((prev) => ({
        ...prev,
        attributes: [...(Array.isArray(prev.attributes) ? prev.attributes : []), { id: Date.now().toString(), label: '', value: '' }],
      }));
      setIsDirty(true);
    }, []);

    const handleAttrChange = useCallback((id: string, field: 'label' | 'value', value: string) => {
      setFormData((prev) => ({
        ...prev,
        attributes: prev.attributes?.map((a: any) => a.id === id ? { ...a, [field]: value } : a),
      }));
      setIsDirty(true);
    }, []);

    const handleRemoveAttr = useCallback((id: string) => {
      setFormData((prev) => ({ ...prev, attributes: prev.attributes?.filter((a: any) => a.id !== id) }));
      setIsDirty(true);
    }, []);

    // ── Features handlers ─────────────────────────────────────────────────────

    const handleAddFeature = useCallback(() => {
      const newFeat = { id: `feat-${Date.now()}`, title: '', description: '' };
      setFormData((p) => ({ ...p, features: [...((p.features as any[]) || []), newFeat] }));
      setIsDirty(true);
    }, []);

    const handleFeatureChange = useCallback((id: string, field: 'title' | 'description', value: string) => {
      setFormData((prev) => ({
        ...prev,
        features: ((prev.features as any[]) || []).map((f: any) => f.id === id ? { ...f, [field]: value } : f),
      }));
      setIsDirty(true);
    }, []);

    const handleRemoveFeature = useCallback((id: string) => {
      setFormData((prev) => ({ ...prev, features: ((prev.features as any[]) || []).filter((f: any) => f.id !== id) }));
      setIsDirty(true);
    }, []);

    // ── Applications handlers ─────────────────────────────────────────────────

    const handleAddApplication = useCallback(() => {
      setFormData((prev) => ({
        ...prev,
        applications: [...((prev.applications as any[]) || []), { id: Date.now().toString(), title: '', description: '' }],
      }));
      setIsDirty(true);
    }, []);

    const handleApplicationChange = useCallback((id: string, field: 'title' | 'description' | 'image', value: string) => {
      setFormData((prev) => ({
        ...prev,
        applications: ((prev.applications as any[]) || []).map((a: any) => a.id === id ? { ...a, [field]: value } : a),
      }));
      setIsDirty(true);
    }, []);

    const handleRemoveApplication = useCallback((id: string) => {
      setFormData((prev) => ({ ...prev, applications: ((prev.applications as any[]) || []).filter((a: any) => a.id !== id) }));
      setIsDirty(true);
    }, []);

    // ── FAQ handlers ──────────────────────────────────────────────────────────

    const handleAddFaq = useCallback(() => {
      setFormData((prev) => ({
        ...prev,
        faqs: [...(Array.isArray(prev.faqs) ? prev.faqs : []), { id: Date.now().toString(), question: '', answer: '' }],
      }));
      setIsDirty(true);
    }, []);

    const handleFaqChange = useCallback((id: string, field: 'question' | 'answer', value: string) => {
      setFormData((prev) => ({
        ...prev,
        faqs: (prev.faqs || []).map((f: any) => f.id === id ? { ...f, [field]: value } : f),
      }));
      setIsDirty(true);
    }, []);

    const handleRemoveFaq = useCallback((id: string) => {
      setFormData((prev) => ({ ...prev, faqs: (prev.faqs || []).filter((f: any) => f.id !== id) }));
      setIsDirty(true);
    }, []);

    // ── Custom Buttons handlers ───────────────────────────────────────────────

    const handleAddCustomButton = useCallback(() => {
      const newBtn: ProductCustomButton = { id: `btn-${Date.now()}`, label: '', url: '', type: 'link', style: 'primary' };
      setFormData((prev) => ({ ...prev, customButtons: [...((prev as any).customButtons || []), newBtn] }));
      setIsDirty(true);
    }, []);

    const handleCustomButtonChange = useCallback((id: string, field: keyof ProductCustomButton, value: string) => {
      setFormData((prev) => ({
        ...prev,
        customButtons: ((prev as any).customButtons || []).map((b: any) => b.id === id ? { ...b, [field]: value } : b),
      }));
      setIsDirty(true);
    }, []);

    const handleRemoveCustomButton = useCallback((id: string) => {
      setFormData((prev) => ({ ...prev, customButtons: ((prev as any).customButtons || []).filter((b: any) => b.id !== id) }));
      setIsDirty(true);
    }, []);

    // ── Feature icon / Application image pickers ──────────────────────────────

    const handleOpenIconPicker = useCallback((featureId: string) => {
      setIconPickerFeatureId(featureId);
    }, []);

    const handleSelectFeatureIcon = useCallback((icon: FeatureIconValue) => {
      if (!iconPickerFeatureId) return;
      const resolved: ProductFeatureIcon | undefined = icon.value ? { type: icon.type, value: icon.value } : undefined;
      setFormData((prev) => ({
        ...prev,
        features: ((prev.features as any[]) || []).map((f: any) =>
          f.id === iconPickerFeatureId ? { ...f, icon: resolved } : f
        ),
      }));
      setIconPickerFeatureId(null);
      setIsDirty(true);
    }, [iconPickerFeatureId]);

    const handleFeatureIconPick = useCallback((featureId: string) => {
      setMediaTargetFeatureId(featureId);
      setMediaTargetAppId(null);
      setMediaTarget('gallery');
      setIsMediaOpen(true);
    }, []);

    const handleAppImagePick = useCallback((appId: string) => {
      setMediaTargetAppId(appId);
      setMediaTargetFeatureId(null);
      setMediaTarget('gallery');
      setIsMediaOpen(true);
    }, []);

    // ── Gallery reorder + featured ────────────────────────────────────────────

    const handleSetFeaturedImage = useCallback((url: string) => {
      setFormData((prev) => ({ ...prev, featuredImage: url, mainImage: url }));
      setIsDirty(true);
    }, []);

    const handleMoveImage = useCallback((url: string, direction: 'up' | 'down') => {
      const current = (formData.gallery || []) as string[];
      const idx = current.indexOf(url);
      if (idx === -1) return;
      const next = [...current];
      if (direction === 'up' && idx > 0) {
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      } else if (direction === 'down' && idx < current.length - 1) {
        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      }
      setFormData((p) => ({ ...p, gallery: next }));
      setIsDirty(true);
    }, [formData.gallery]);

    const handleGalleryConfirm = useCallback((urls: string[]) => {
      const url = urls[0];
      if (mediaTarget === 'editor' && (window as any).__tinymceImageCb) {
        if (url) (window as any).__tinymceImageCb(API_CONFIG.assetUrl(url));
        (window as any).__tinymceImageCb = null;
      } else if (mediaTargetFeatureId && url) {
        // Feature icon image pick — store as structured object
        setFormData((prev) => ({
          ...prev,
          features: ((prev.features as any[]) || []).map((f: any) =>
            f.id === mediaTargetFeatureId ? { ...f, icon: { type: 'image', value: url } } : f
          ),
        }));
        setMediaTargetFeatureId(null);
        setIsDirty(true);
      } else if (mediaTargetAppId && url) {
        // Application image pick
        setFormData((prev) => ({
          ...prev,
          applications: ((prev.applications as any[]) || []).map((a: any) =>
            a.id === mediaTargetAppId ? { ...a, image: url } : a
          ),
        }));
        setMediaTargetAppId(null);
        setIsDirty(true);
      } else {
        // Gallery images: update product gallery
        setFormData((prev) => {
          const nextFeatured =
            prev.featuredImage && urls.includes(prev.featuredImage)
              ? prev.featuredImage
              : urls[0] || '';
          return { ...prev, gallery: urls, featuredImage: nextFeatured, mainImage: nextFeatured };
        });
        setIsDirty(true);
      }
      setIsMediaOpen(false);
    }, [mediaTarget, mediaTargetFeatureId, mediaTargetAppId]);


    // ── AI Apply ──────────────────────────────────────────────────────────────

    const handleAIApply = useCallback((result: Record<string, any>) => {
      if (result.title) setFormData((p) => ({ ...p, name: result.title }));
      if (result.shortDescription) setFormData((p) => ({ ...p, shortDescription: result.shortDescription }));
      if (result.description) setFormData((p) => ({ ...p, description: result.description }));
      if (result.seoTitle) setFormData((p) => ({ ...p, seoTitle: result.seoTitle }));
      if (result.seoDescription) setFormData((p) => ({ ...p, seoDescription: result.seoDescription }));
      if (result.metaTitle) setFormData((p) => ({ ...p, seoTitle: result.metaTitle }));
      if (result.metaDescription) setFormData((p) => ({ ...p, seoDescription: result.metaDescription }));
      if (Array.isArray(result.features) && result.features.length > 0) {
        setFormData((p) => ({ ...p, features: result.features }));
      }
      if (Array.isArray(result.faqs) && result.faqs.length > 0) {
        setFormData((p) => ({ ...p, faqs: result.faqs }));
      }
      if (Array.isArray(result.applications) && result.applications.length > 0) {
        setFormData((p) => ({ ...p, applications: result.applications }));
      }
      setIsDirty(true);
    }, []);

    // ── Validation ────────────────────────────────────────────────────────────

    const validate = useCallback((): string | null => {
      const errs: Record<string, string> = {};
      if (!formData.name || formData.name.length < 3)
        errs.name = 'At least 3 characters required';
      if (!formData.categoryId)
        errs.categoryId = 'Please select a category';
      if ((formData.shortDescription || '').length < 20)
        errs.shortDescription = 'At least 20 characters required';
      const plain = (formData.description || '').replace(/<[^>]+>/g, '').trim();
      if (plain.length < 50)
        errs.description = 'Full description must be at least 50 characters';
      if ((formData.gallery || []).length === 0)
        errs.gallery = 'Please select at least one image';

      setFieldErrors(errs);
      if (Object.keys(errs).length === 0) return null;

      // Switch to first failing tab
      if (errs.name || errs.categoryId || errs.shortDescription) setActiveTab('basic');
      else if (errs.description) setActiveTab('description');
      else if (errs.gallery) setActiveTab('media');

      return Object.values(errs)[0];
    }, [formData]);

    // Map API validation errors to field errors and switch to relevant tab
    const handleApiValidationErrors = useCallback((error: any) => {
      console.log('[ProductForm] Processing API error:', error);

      const details = error?.details || [];
      const fieldErrs: Record<string, string> = {};
      const apiErrList: Array<{field: string; message: string}> = [];

      // Handle Zod-style validation errors from backend
      if (Array.isArray(details) && details.length > 0) {
        details.forEach((err: any) => {
          const field = err.field || err.path?.join('.') || 'general';
          const message = err.message || 'Invalid value';
          fieldErrs[field] = message;
          apiErrList.push({ field, message });
          console.log(`[ProductForm] API Error: ${field} → ${message}`);
        });
      }

      // Handle single error message without details
      if (details.length === 0 && error?.message) {
        apiErrList.push({ field: 'general', message: error.message });
      }

      setFieldErrors(fieldErrs);
      setApiErrors(apiErrList);

      // Auto-switch to first error tab
      if (apiErrList.length > 0) {
        const firstErrorField = apiErrList[0].field;
        const targetTab = FIELD_TO_TAB[firstErrorField];
        if (targetTab) {
          console.log(`[ProductForm] Auto-switching to tab: ${targetTab} (field: ${firstErrorField})`);
          setActiveTab(targetTab);
        }
      }

      return apiErrList;
    }, []);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
      e.preventDefault();

      // Clear previous API errors
      setApiErrors([]);

      const err = validate();
      if (err) { setSaveState('error'); setSaveMsg(err); return; }

      setSaveState('loading');
      setSaveMsg('');
      const apiData = mapFormToBackend(formData);

      // === TASK 1: LOG FULL PAYLOAD ===
      console.group('[ProductForm] 📤 SUBMIT PAYLOAD DEBUG');
      console.log('isEditing:', isEditing);
      console.log('productId:', (initialData as any)?.id);
      console.log('--- Form Data ---');
      console.table({
        title: formData.name || '(empty)',
        slug: formData.slug || '(empty)',
        categoryId: formData.categoryId || '(empty)',
        status: formData.status || '(empty)',
      });
      console.log('--- Gallery Images ---');
      console.table(formData.gallery || []);
      console.log('--- Specs ---');
      console.table((formData.attributes || []).map((a: any) => ({ label: a.label, value: a.value })));
      console.log('--- FAQs ---');
      console.table((formData.faqs || []).map((f: any) => ({ question: f.question?.substring(0, 50), answer: f.answer?.substring(0, 50) })));
      console.log('--- MAPPED API DATA ---');
      console.table({
        name: apiData.name,
        slug: apiData.slug,
        categoryId: apiData.categoryId,
        images: (apiData.images as string[])?.length + ' items',
        priceMin: apiData.priceMin,
        priceMax: apiData.priceMax,
        status: apiData.status,
      });
      console.log('Full apiData object:', apiData);
      console.groupEnd();

      const handlers = {
        onSuccess: (saved: Product) => {
          console.log('[ProductForm] API success — status:', (saved as any)?.status);
          if (saved) setFormData(mapBackendToForm(saved));
          setSaveState('success');
          setSaveMsg(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
          setApiErrors([]);
          setTimeout(() => { setSaveState('idle'); setSaveMsg(''); onSuccess?.(saved); }, 1500);
        },
        onError: (error: any) => {
          // === TASK 2: LOG BACKEND ERROR ===
          console.group('[ProductForm] ❌ API ERROR DEBUG');
          console.log('Error object:', error);
          console.log('Error message:', error?.message);
          console.log('Error code:', error?.code);
          console.log('Error details:', error?.details);
          console.groupEnd();

          // === TASK 3: MAP ERROR TO FIELD ===
          const mappedErrors = handleApiValidationErrors(error);

          // === TASK 5: SHOW EXACT ERROR MESSAGE ===
          let errorMsg = error?.message || 'Failed to save. Please try again.';

          // If we have specific field errors, show the first one with field name
          if (mappedErrors.length > 0) {
            const firstErr = mappedErrors[0];
            errorMsg = `${firstErr.field}: ${firstErr.message}`;
          }

          setSaveState('error');
          setSaveMsg(errorMsg);
        },
      };

      if (isEditing) {
        updateMutation.mutate({ id: (initialData as Product).id, data: apiData }, handlers);
      } else {
        createMutation.mutate(apiData, handlers);
      }
    }, [formData, initialData, isEditing, validate, onSuccess, setSaveState, createMutation, updateMutation, handleApiValidationErrors]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
      <div className="space-y-0">
        {/* Save state banner */}
        {saveState !== 'idle' && (
          <div className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            saveState === 'success' ? 'border-success-100 bg-success-50 text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400'
            : saveState === 'error' ? 'border-error-100 bg-error-50 text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400'
            : 'border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-400'
          }`}>
            {saveState === 'loading' && <svg className="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle className="opacity-25" cx="12" cy="12" r="10" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
            {saveState === 'success' && <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
            {saveState === 'error'   && <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
            <span>{saveMsg}</span>
          </div>
        )}

        {/* === TASK 6: VALIDATION DEBUG PANEL === */}
        {(showDebugPanel || apiErrors.length > 0) && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                Validation Debug Mode
              </span>
              <button
                type="button"
                onClick={() => setShowDebugPanel(false)}
                className="text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Hide
              </button>
            </div>
            {apiErrors.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">No validation errors. Enable with: localStorage.setItem('productFormDebug', 'true')</p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">API Validation Errors ({apiErrors.length}):</p>
                {apiErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">{err.field}</span>
                    <span className="text-amber-600 dark:text-amber-400">{err.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab navigation + AI button */}
        <div className="mb-6 flex items-center gap-2">
        <div className="flex flex-1 gap-0 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900/40">
          {TABS.map((tab) => {
            const hasErr = tabErrors[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="shrink-0 opacity-60">{TAB_ICONS[tab.id]}</span>
                <span>{tab.label}</span>
                {hasErr && (
                  <span className="h-2 w-2 rounded-full bg-error-500 shrink-0 shadow-sm" title="Requires attention" />
                )}
              </button>
            );
          })}
        </div>
        {/* AI button */}
        <button
          type="button"
          onClick={() => setAIPanelOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 px-3 py-2 text-xs font-bold text-violet-700 transition-all hover:from-violet-100 hover:to-blue-100 hover:shadow-sm dark:border-violet-500/30 dark:from-violet-500/10 dark:to-blue-500/10 dark:text-violet-300"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.09 6.26L20 9.27l-4.33 4.2L16.91 20 12 16.9 7.09 20l1.24-6.53L4 9.27l5.91-1.01z"/>
          </svg>
          AI
        </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>

          {/* ── TAB: Basic Info ──────────────────────────────────────────────── */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h3>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Product Name <span className="text-error-500">*</span></Label>
                    <Input
                      name="name"
                      value={formData.name || ''}
                      onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, name: '' })); }}
                      required
                      placeholder="e.g. Prefab Office Cabin"
                      className={fieldErrors.name ? 'border-error-400 ring-1 ring-error-400/40' : ''}
                    />
                    {fieldErrors.name && <p className="mt-1 text-xs font-medium text-error-500">{fieldErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>URL Slug <span className="text-error-500">*</span></Label>
                    <Input
                      name="slug"
                      value={formData.slug || ''}
                      onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, slug: '' })); }}
                      required
                      placeholder="office-cabin-v1"
                      className={fieldErrors.slug ? 'border-error-400 ring-1 ring-error-400/40' : ''}
                    />
                    {fieldErrors.slug && <p className="mt-1 text-xs font-medium text-error-500">{fieldErrors.slug}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Category <span className="text-error-500">*</span></Label>
                    <select
                      value={formData.categoryId || ''}
                      onChange={(e) => { setFormData((p) => ({ ...p, categoryId: e.target.value })); setFieldErrors((p) => ({ ...p, categoryId: '' })); }}
                      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900 ${
                        fieldErrors.categoryId ? 'border-error-400 ring-1 ring-error-400/40 dark:border-error-500' : 'border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <option value="">Select a category...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {fieldErrors.categoryId && <p className="mt-1 text-xs font-medium text-error-500">{fieldErrors.categoryId}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>SKU (Internal)</Label>
                    <Input name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="SKU-XXX-001" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Product Status</h3>
                <div className="flex items-center gap-4">
                  <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    {([
                      { value: ProductStatus.DRAFT,    label: 'Draft',     active: 'bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-500/10 dark:text-warning-400' },
                      { value: ProductStatus.ACTIVE,   label: 'Published', active: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-500/10 dark:text-success-400' },
                      { value: ProductStatus.ARCHIVED, label: 'Archived',  active: 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300' },
                    ] as const).map(({ value, label, active }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, status: value }))}
                        className={`px-4 py-2 text-sm font-medium transition-all ${
                          currentStatus === value
                            ? active
                            : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-500 dark:hover:bg-gray-800'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusCfg.badge}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />{statusCfg.label}
                  </span>
                </div>
              </div>

              {/* Short Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Short Description</h3>
                <div className="mb-2 flex justify-between">
                  <Label>Short Description <span className="text-error-500">*</span></Label>
                  <span className={`text-xs ${(formData.shortDescription || '').length >= 20 ? 'text-success-500' : 'text-gray-400'}`}>
                    {(formData.shortDescription || '').length}/20 min
                  </span>
                </div>
                <Input
                  name="shortDescription"
                  value={formData.shortDescription || ''}
                  onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, shortDescription: '' })); }}
                  placeholder="One-line summary for list views…"
                  className={fieldErrors.shortDescription ? 'border-error-400 ring-1 ring-error-400/40' : ''}
                />
                {fieldErrors.shortDescription && <p className="mt-1 text-xs font-medium text-error-500">{fieldErrors.shortDescription}</p>}
              </div>

              {/* Trust & Logistics Block */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Trust & Logistics</h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Delivery Time</Label>
                    <Input name="deliveryTime" value={formData.deliveryTime || ''} onChange={handleChange} placeholder="e.g. 10–15 days" />
                  </div>
                  <div className="space-y-2">
                    <Label>Warranty</Label>
                    <Input name="warranty" value={formData.warranty || ''} onChange={handleChange} placeholder="e.g. 5 years" />
                  </div>
                  <div className="space-y-2">
                    <Label>Installation Time</Label>
                    <Input name="installationTime" value={formData.installationTime || ''} onChange={handleChange} placeholder="e.g. 2–4 days" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Description (CSS show/hide keeps TinyMCE mounted) ──────── */}
          <div className={activeTab === 'description' ? 'block' : 'hidden'}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Full Description</h3>
              <div className="mb-2 flex items-center justify-between">
                <Label>Full Description <span className="text-error-500">*</span></Label>
                <span className={`text-xs ${(formData.description || '').replace(/<[^>]+>/g, '').trim().length >= 50 ? 'text-success-500' : 'text-gray-400'}`}>
                  {(formData.description || '').replace(/<[^>]+>/g, '').trim().length}/50 min chars
                </span>
              </div>
              {fieldErrors.description && (
                <p className="mb-2 text-xs font-medium text-error-500">{fieldErrors.description}</p>
              )}
              <RichTextEditor
                value={formData.description || ''}
                onChange={handleDescriptionChange}
                placeholder="Detailed product description (min 50 characters)…"
                minHeight={450}
                onImagePick={(type) => {
                  setMediaTarget(type as 'editor' | 'gallery');
                  setIsMediaOpen(true);
                }}
              />
            </div>
          </div>

          {/* ── TAB: Pricing ─────────────────────────────────────────────────── */}
          {activeTab === 'pricing' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pricing</h3>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Min Price (₹)</Label>
                    <Input type="number" name="priceMin" value={formData.priceMin || 0} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Price (₹)</Label>
                    <Input type="number" name="priceMax" value={formData.priceMax || 0} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    <Label>Custom Price Text</Label>
                    <Input name="priceText" value={(formData as any).priceText || ''} onChange={handleChange} placeholder="e.g. Starting from ₹5.5L or Get Quote" />
                    <p className="text-xs text-gray-400">Overrides numeric pricing for PDP and related product cards when set.</p>
                  </div>
                </div>
                {(formData.priceMin || 0) > 0 && (
                  <div className="mt-5 rounded-lg border border-brand-100 bg-brand-50 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
                    <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                      Price range: ₹{Number(formData.priceMin).toLocaleString('en-IN')}
                      {(formData.priceMax || 0) > (formData.priceMin || 0) && ` – ₹${Number(formData.priceMax).toLocaleString('en-IN')}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: Media ───────────────────────────────────────────────────── */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gallery Images</h3>
                  <Button variant="outline" size="sm" onClick={() => setIsMediaOpen(true)} type="button">
                    Open Media Library
                    {(formData.gallery || []).length > 0 && (
                      <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                        {(formData.gallery || []).length}
                      </span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mb-4">First image is the main thumbnail. At least 1 required.</p>
                {fieldErrors.gallery && (
                  <p className="text-xs font-medium text-error-500 mb-4">{fieldErrors.gallery}</p>
                )}
                <div className="grid grid-cols-3 gap-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {(formData.gallery || []).length === 0 ? (
                    <button
                      type="button"
                      className={`col-span-full flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed text-gray-400 transition-colors hover:border-brand-300 dark:border-gray-800 ${fieldErrors.gallery ? 'border-error-300 dark:border-error-500/50' : 'border-gray-200'}`}
                      onClick={() => setIsMediaOpen(true)}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <span className="text-sm">Click to select images from media library</span>
                    </button>
                  ) : (
                    (formData.gallery || []).map((url, index) => (
                      <GalleryImage
                        key={url}
                        url={url}
                        isMain={((formData as any).featuredImage || '') === url || (index === 0 && !(formData as any).featuredImage)}
                        index={index}
                        total={(formData.gallery || []).length}
                        onRemove={() => {
                          const next = (formData.gallery || []).filter((u) => u !== url);
                          setFormData((p) => {
                            const nextFeatured =
                              p.featuredImage && next.includes(p.featuredImage)
                                ? p.featuredImage
                                : next[0] || '';
                            return { ...p, gallery: next, featuredImage: nextFeatured, mainImage: nextFeatured };
                          });
                        }}
                        onSetFeatured={() => handleSetFeaturedImage(url)}
                        onMoveUp={() => handleMoveImage(url, 'up')}
                        onMoveDown={() => handleMoveImage(url, 'down')}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Specs ───────────────────────────────────────────────────── */}
          {activeTab === 'specs' && (
            <SpecsTab
              attributes={formData.attributes ?? []}
              onAdd={handleAddAttr}
              onChange={handleAttrChange}
              onRemove={handleRemoveAttr}
            />
          )}

          {/* ── TAB: Features ────────────────────────────────────────────────── */}
          {activeTab === 'features' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Features</h3>
                  <Button variant="outline" size="sm" onClick={handleAddFeature} type="button">+ Add Feature</Button>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Displayed as feature cards on the product page. Toggle visibility below.
                </p>

                {/* Visibility toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer w-fit mb-5">
                  <input
                    type="checkbox"
                    checked={(formData as any).showFeatures ?? true}
                    onChange={(e) => setFormData((prev) => ({ ...prev, showFeatures: e.target.checked } as any))}
                    className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Features section on product page
                  </span>
                </label>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {((formData.features as any[]) || []).map((feat: any, i: number) => (
                    <div key={feat.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Feature {i + 1}</span>
                        <button type="button" onClick={() => handleRemoveFeature(feat.id)}
                          className="rounded-lg p-1 text-gray-400 hover:bg-error-50 hover:text-error-500 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                      {/* Icon row */}
                      <div className="mb-3 flex items-center gap-3">
                        {/* Preview */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                          {feat.icon?.type === 'image' ? (
                            <img src={API_CONFIG.assetUrl(feat.icon.value)} alt="" className="h-full w-full object-cover" />
                          ) : feat.icon?.type === 'icon' && ICON_MAP.get(feat.icon.value) ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3654c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              dangerouslySetInnerHTML={{ __html: ICON_MAP.get(feat.icon.value)!.innerHTML }} />
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                          )}
                        </div>
                        {/* Controls */}
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Icon</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenIconPicker(feat.id)}
                              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors dark:border-gray-700 dark:bg-gray-800 text-left"
                            >
                              {feat.icon?.type === 'icon' && ICON_MAP.get(feat.icon.value)
                                ? `✓ ${ICON_MAP.get(feat.icon.value)!.label}`
                                : feat.icon?.type === 'image'
                                ? '✓ Custom image'
                                : 'Choose icon…'}
                            </button>
                            {feat.icon?.value && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    features: ((prev.features as any[]) || []).map((f: any) =>
                                      f.id === feat.id ? { ...f, icon: undefined } : f
                                    ),
                                  }));
                                  setIsDirty(true);
                                }}
                                className="shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-400 hover:text-error-500 transition-colors dark:border-gray-700 dark:bg-gray-800"
                              >✕</button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Feature title (e.g. Weather Resistant)"
                          value={feat.title}
                          onChange={(e) => handleFeatureChange(feat.id, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="Short description (optional)"
                          value={feat.description || ''}
                          onChange={(e) => handleFeatureChange(feat.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {(!(formData.features as any[]) || ((formData.features as any[]) || []).length === 0) && (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                    <p className="text-sm">No features yet — click "+ Add Feature" to start</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: Applications (Use Cases) ─────────────────────────────────── */}
          {activeTab === 'applications' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-World Applications</h3>
                  <Button variant="outline" size="sm" onClick={handleAddApplication} type="button">+ Add Use Case</Button>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Industry use-case scenarios displayed on the product page. Unique per product for SEO.
                </p>

                {/* Visibility toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer w-fit mb-5">
                  <input
                    type="checkbox"
                    checked={(formData as any).showApplications ?? true}
                    onChange={(e) => setFormData((prev) => ({ ...prev, showApplications: e.target.checked } as any))}
                    className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Applications section on product page
                  </span>
                </label>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {((formData.applications as any[]) || []).map((app: any, i: number) => (
                    <div key={app.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Use Case {i + 1}</span>
                        <button type="button" onClick={() => handleRemoveApplication(app.id)}
                          className="rounded-lg p-1 text-gray-400 hover:bg-error-50 hover:text-error-500 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                      {/* Image row */}
                      <div className="mb-3">
                        {app.image ? (
                          <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                            <img src={API_CONFIG.assetUrl(app.image)} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                              <button type="button" onClick={() => handleAppImagePick(app.id)}
                                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-800">Change</button>
                              <button type="button" onClick={() => handleApplicationChange(app.id, 'image', '')}
                                className="rounded-lg bg-error-500 px-3 py-1.5 text-xs font-semibold text-white">Remove</button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => handleAppImagePick(app.id)}
                            className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors dark:border-gray-700">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            Add image
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Use case title (e.g. Construction Site Office)"
                          value={app.title}
                          onChange={(e) => handleApplicationChange(app.id, 'title', e.target.value)}
                        />
                        <textarea
                          rows={2}
                          placeholder="Describe the specific scenario and benefit..."
                          value={app.description || ''}
                          onChange={(e) => handleApplicationChange(app.id, 'description', e.target.value)}
                          className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {(!(formData.applications as any[]) || ((formData.applications as any[]) || []).length === 0) && (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                    <p className="text-sm">No use cases yet — click "+ Add Use Case" to start</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: FAQ ─────────────────────────────────────────────────────── */}
          {activeTab === 'faq' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                  <Button variant="outline" size="sm" onClick={handleAddFaq} type="button">+ Add FAQ</Button>
                </div>
                <p className="text-xs text-gray-400 mb-4">Improves SEO via FAQ schema markup. Answers customer questions directly in search results.</p>

                {/* Visibility toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer w-fit mb-5">
                  <input
                    type="checkbox"
                    checked={(formData as any).showFaq ?? true}
                    onChange={(e) => setFormData((prev) => ({ ...prev, showFaq: e.target.checked } as any))}
                    className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show FAQ section on product page
                  </span>
                </label>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {Array.isArray(formData.faqs) && formData.faqs.map((faq: any, i: number) => (
                    <div key={faq.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Question {i + 1}</span>
                        <button type="button" onClick={() => handleRemoveFaq(faq.id)}
                          className="rounded-lg p-1 text-gray-400 hover:bg-error-50 hover:text-error-500 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Q: What are the standard dimensions?"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)}
                        />
                        <textarea
                          rows={3}
                          placeholder="A: Our standard cabins are available in 10ft, 20ft, and 40ft lengths..."
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(faq.id, 'answer', e.target.value)}
                          className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {(!formData.faqs || (formData.faqs as any[]).length === 0) && (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    <p className="text-sm">No FAQs yet — click "Add FAQ" to start</p>
                  </div>
                )}

                {/* FAQ JSON-LD Preview */}
                {Array.isArray(formData.faqs) && (formData.faqs as any[]).some((f: any) => f.question && f.answer) && (
                  <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">Generated FAQ Schema (JSON-LD)</p>
                    <pre className="overflow-x-auto text-[10px] text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-all">{JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      "mainEntity": (formData.faqs as any[]).filter((f: any) => f.question && f.answer).map((f: any) => ({
                        "@type": "Question",
                        "name": f.question,
                        "acceptedAnswer": { "@type": "Answer", "text": f.answer }
                      }))
                    }, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: SEO ─────────────────────────────────────────────────────── */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              {/* SEO Score Card - Full width */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">SEO Score</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">SEO Score</span>
                  <span className={`text-2xl font-black tabular-nums ${seo.color}`}>{seo.score}<span className="text-sm font-normal text-gray-400">/100</span></span>
                </div>
                {/* Score bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${seo.score >= 70 ? 'bg-success-500' : seo.score >= 40 ? 'bg-warning-500' : 'bg-error-500'}`}
                    style={{ width: `${seo.score}%` }}
                  />
                </div>
                {/* Suggestions */}
                {seo.suggestions.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {seo.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
                        <span className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-500">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                {seo.suggestions.length === 0 && (
                  <p className="mt-2 text-xs text-success-600">All SEO checks passed!</p>
                )}
              </div>

              {/* SEO Meta Fields */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">SEO Meta Tags</h3>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Focus Keyword */}
                  <div className="space-y-2">
                    <Label>Focus Keyword</Label>
                    <Input
                      value={focusKeyword}
                      onChange={(e) => setFocusKw(e.target.value)}
                      placeholder="e.g. prefab office cabin"
                    />
                    <p className="text-xs text-gray-400">Used for keyword analysis only — not saved to database.</p>
                  </div>

                  {/* Meta Title with progress bar */}
                  <div className="space-y-2">
                    <div className="mb-1 flex justify-between">
                      <Label>Meta Title</Label>
                      <span className={`text-xs tabular-nums ${
                        (formData.seoTitle||'').length >= 50 && (formData.seoTitle||'').length <= 60
                          ? 'text-success-500' : (formData.seoTitle||'').length > 60 ? 'text-error-500' : 'text-gray-400'
                      }`}>{(formData.seoTitle || '').length} / 60</span>
                    </div>
                    <Input name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} placeholder="SEO optimized title (50–60 chars)" />
                    <SeoCharBar current={(formData.seoTitle||'').length} ideal={[50,60]} max={70} />
                  </div>

                  {/* Meta Description with progress bar - Full width */}
                  <div className="lg:col-span-2 space-y-2">
                    <div className="mb-1 flex justify-between">
                      <Label>Meta Description</Label>
                      <span className={`text-xs tabular-nums ${
                        (formData.seoDescription||'').length >= 150 && (formData.seoDescription||'').length <= 160
                          ? 'text-success-500' : (formData.seoDescription||'').length > 160 ? 'text-error-500' : 'text-gray-400'
                      }`}>{(formData.seoDescription || '').length} / 160</span>
                    </div>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription || ''}
                      onChange={handleChange}
                      placeholder="Brief summary for search snippets (150–160 chars)..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900"
                    />
                    <SeoCharBar current={(formData.seoDescription||'').length} ideal={[150,160]} max={180} />
                  </div>
                </div>
              </div>

              {/* Google Search Preview */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Google Search Preview</h3>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="space-y-1">
                    <div className="line-clamp-1 text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer">
                      {formData.seoTitle || formData.name || 'Untitled Product'}
                    </div>
                    <div className="text-[13px] text-[#006621]">
                      https://samanprefab.com › product › {formData.slug || '...'}
                    </div>
                    <div className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {formData.seoDescription || 'Add a meta description to see how your product appears in search results.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Custom Actions ──────────────────────────────────────────── */}
          {activeTab === 'actions' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Action Buttons</h3>
                    <p className="text-xs text-gray-400 mt-1">Displayed in the product hero alongside default CTAs.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddCustomButton} type="button">+ Add Button</Button>
                </div>

                <div className="space-y-4">
                  {((formData as any).customButtons || []).map((btn: any, i: number) => (
                    <div key={btn.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Button {i + 1}</span>
                        <button type="button" onClick={() => handleRemoveCustomButton(btn.id)}
                          className="rounded-lg p-1 text-gray-400 hover:bg-error-50 hover:text-error-500 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Label</Label>
                          <Input
                            placeholder="e.g. Download Brochure"
                            value={btn.label}
                            onChange={(e) => handleCustomButtonChange(btn.id, 'label', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>URL / Phone</Label>
                          <Input
                            placeholder="https://... or 91XXXXXXXXXX"
                            value={btn.url}
                            onChange={(e) => handleCustomButtonChange(btn.id, 'url', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Type</Label>
                          <select
                            value={btn.type}
                            onChange={(e) => handleCustomButtonChange(btn.id, 'type', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="link">Link</option>
                            <option value="file">File / PDF</option>
                            <option value="whatsapp">WhatsApp</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Style</Label>
                          <select
                            value={btn.style}
                            onChange={(e) => handleCustomButtonChange(btn.id, 'style', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="primary">Primary (filled)</option>
                            <option value="secondary">Secondary (outline)</option>
                          </select>
                        </div>
                      </div>
                      {/* Preview */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Preview:</span>
                        {btn.style === 'primary' ? (
                          <span className="inline-flex items-center rounded-2xl bg-[#3654c7] px-4 py-1.5 text-xs font-bold text-white">
                            {btn.label || 'Button Label'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-2xl border border-[#dfe8f6] bg-white px-4 py-1.5 text-xs font-semibold text-[#3654c7]">
                            {btn.label || 'Button Label'}
                          </span>
                        )}
                        {btn.type === 'whatsapp' && <span className="text-[10px] text-success-600">WhatsApp</span>}
                        {btn.type === 'file' && <span className="text-[10px] text-gray-400">PDF/File</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {((formData as any).customButtons || []).length === 0 && (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                    <p className="text-sm">No buttons yet — click "+ Add Button" to start</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer (shown only when not using sticky header) */}
          {!hideFooterButtons && (
            <div className="mt-10 flex justify-end gap-4 border-t border-gray-100 pt-6 dark:border-gray-800">
              {onCancel && <Button variant="outline" onClick={onCancel} type="button">Discard Changes</Button>}
              <FormSaveButton isPending={isPending} saveState={saveState} isEditing={isEditing} isDirty={isDirty} />
            </div>
          )}
        </form>

        {/* Feature Icon Picker */}
        <FeatureIconPicker
          isOpen={iconPickerFeatureId !== null}
          current={((formData.features as any[]) || []).find((f: any) => f.id === iconPickerFeatureId)?.icon}
          onSelect={handleSelectFeatureIcon}
          onUseImage={() => { if (iconPickerFeatureId) handleFeatureIconPick(iconPickerFeatureId); }}
          onClose={() => setIconPickerFeatureId(null)}
        />

        {/* Gallery media library */}
        <MediaLibrary
          isOpen={isMediaOpen}
          onClose={() => { setIsMediaOpen(false); setMediaTargetFeatureId(null); setMediaTargetAppId(null); }}
          onConfirm={handleGalleryConfirm}
          preselectedUrls={mediaTargetFeatureId || mediaTargetAppId ? [] : (formData.gallery || [])}
          mode={mediaTargetFeatureId || mediaTargetAppId ? 'single' : 'multiple'}
          title={mediaTargetFeatureId ? 'Select Feature Icon Image' : mediaTargetAppId ? 'Select Application Image' : 'Select Product Images'}
        />
        {/* AI Panel */}
        <AIPanel
          isOpen={isAIPanelOpen}
          onClose={() => setAIPanelOpen(false)}
          context="product"
          productName={formData.name}
          shortDescription={formData.shortDescription || undefined}
          onApply={handleAIApply}
        />
      </div>
    );
  }
);

export default ProductForm;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface GalleryImageProps {
  url: string;
  isMain: boolean;
  index: number;
  total: number;
  onRemove: () => void;
  onSetFeatured: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function GalleryImage({ url, isMain, index, total, onRemove, onSetFeatured, onMoveUp, onMoveDown }: GalleryImageProps) {
  const [errored, setErrored] = useState(false);
  return (
    <div className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-gray-100 dark:bg-gray-900 transition-all ${isMain ? 'border-brand-500 shadow-[0_0_0_3px_rgba(99,102,241,0.2)]' : 'border-gray-200 dark:border-gray-800'}`}>
      {errored ? (
        <div className="flex h-full w-full items-center justify-center text-gray-300">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        </div>
      ) : (
        <img src={url} alt="Product" className="h-full w-full object-cover" onError={() => setErrored(true)} />
      )}
      {/* Hover overlay with controls */}
      <div className="absolute inset-0 flex flex-col justify-between bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Top row: reorder */}
        <div className="flex items-center justify-between p-1">
          <div className="flex gap-0.5">
            <button type="button" onClick={onMoveUp} disabled={index === 0}
              className="rounded bg-white/20 p-1 text-white disabled:opacity-30 hover:bg-white/40 transition-colors" title="Move left">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button type="button" onClick={onMoveDown} disabled={index === total - 1}
              className="rounded bg-white/20 p-1 text-white disabled:opacity-30 hover:bg-white/40 transition-colors" title="Move right">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <button type="button" onClick={onRemove}
            className="rounded-full bg-error-500/90 p-1 text-white hover:bg-error-600 transition-colors" title="Remove">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {/* Bottom: Set as Featured */}
        {!isMain && (
          <button type="button" onClick={onSetFeatured}
            className="w-full bg-brand-500/90 py-1 text-[9px] font-bold uppercase text-white hover:bg-brand-600 transition-colors">
            Set as Featured
          </button>
        )}
      </div>
      {/* Position badge */}
      <div className={`absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${isMain ? 'bg-brand-500 text-white' : 'bg-black/40 text-white'}`}>
        {isMain ? '★' : index + 1}
      </div>
      {isMain && (
        <div className="absolute inset-x-0 bottom-0 bg-brand-500 py-0.5 text-center text-[8px] font-bold uppercase tracking-widest text-white">Featured</div>
      )}
    </div>
  );
}

function SeoCharBar({ current, ideal, max }: { current: number; ideal: [number, number]; max: number }) {
  const pct     = Math.min((current / max) * 100, 100);
  const isIdeal = current >= ideal[0] && current <= ideal[1];
  const isOver  = current > ideal[1];
  const barColor = isOver ? 'bg-error-500' : isIdeal ? 'bg-success-500' : 'bg-warning-400';
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function FormSaveButton({ isPending, saveState, isEditing, isDirty }: { isPending: boolean; saveState: SaveState; isEditing: boolean; isDirty: boolean }) {
  const label =
    saveState === 'loading' ? 'Saving...' :
    saveState === 'success' ? '✓ Saved!' :
    saveState === 'error'   ? 'Try Again' :
    isEditing ? 'Update Product' : 'Publish Product';
  
  const buttonVariant = saveState === 'success' ? 'default' : saveState === 'error' ? 'destructive' : 'default';
  const buttonColor = saveState === 'success' ? 'bg-success-600 hover:bg-success-700' : saveState === 'error' ? 'bg-error-600 hover:bg-error-700' : '';
  
  return (
    <Button 
      type="submit" 
      disabled={isPending || saveState === 'loading'} 
      className={`min-w-[160px] ${buttonColor}`}
      variant={buttonVariant as any}
    >
      <span className="flex items-center gap-2">
        {saveState === 'loading' && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle className="opacity-25" cx="12" cy="12" r="10" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
        {saveState === 'success' && <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>}
        {saveState === 'error' && <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>}
        {label}
        {isDirty && saveState === 'idle' && <span className="h-2 w-2 rounded-full bg-warning-500" />}
      </span>
    </Button>
  );
}
