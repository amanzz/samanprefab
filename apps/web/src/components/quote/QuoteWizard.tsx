"use client";

import React, { useEffect, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCreateQuote } from "@/hooks/useQuotes";
import { ProductStatus } from "@/types/product.types";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";

const STEPS = [
  { id: 1, title: "Select Product" },
  { id: 2, title: "Requirements" },
  { id: 3, title: "Contact Details" },
  { id: 4, title: "Review" },
];

interface QuoteWizardProps {
  presetProduct?: {
    id?: string | null;
    name?: string | null;
    title?: string | null;
  };
  whatsappNumber?: string | null;
}

export default function QuoteWizard({ presetProduct, whatsappNumber }: QuoteWizardProps) {
  const [step, setStep] = useState(1);
  // Use ACTIVE (uppercase enum)
  const { data: productsData, isLoading: productsLoading } = useProducts({ status: ProductStatus.ACTIVE });
  const products = productsData?.items || [];
  const createQuoteMutation = useCreateQuote();
  const resolvedWhatsappNumber = whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";

  const [formData, setFormData] = useState({
    productId: presetProduct?.id || "",
    productName: presetProduct?.title || presetProduct?.name || "",
    notes: "",
    size: "",
    quantity: "1",
    name: "",
    email: "",
    phone: "",
    location: "",
    companyName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!presetProduct?.id && !presetProduct?.title && !presetProduct?.name) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      productId: presetProduct.id || prev.productId,
      productName: presetProduct.title || presetProduct.name || prev.productName,
    }));
  }, [presetProduct?.id, presetProduct?.name, presetProduct?.title]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1 && !formData.productId) newErrors.product = "Please select a product to continue.";
    if (step === 2) {
      if (!formData.size) newErrors.size = "Please specify the required size.";
    }
    if (step === 3) {
      if (!formData.name) newErrors.name = "Full name is required.";
      if (!formData.email) newErrors.email = "Email address is required.";
      if (!formData.phone) newErrors.phone = "Phone number is required.";
      else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    const payload = {
      items: [
        {
          productId: formData.productId,
          quantity: parseInt(formData.quantity) || 1,
          unit: 'unit',
        }
      ],
      location: {
        cityName: formData.location || 'Not provided',
      },
      specs: {
        timeline: 'flexible',
        installationRequired: false,
        notes: `Size: ${formData.size}\nNotes: ${formData.notes}`,
      },
      contact: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        companyName: formData.companyName || undefined,
      },
      sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    createQuoteMutation.mutate(payload as any, {
      onSuccess: () => {
        setStep(5);
      },
      onError: (error: any) => {
        console.error('[QuoteWizard] Quote submission error:', error);
        alert(`Failed to submit quote: ${error.message || 'Unknown error'}`);
      }
    });
  };

  const handleWhatsApp = () => {
    const message = `Hello Saman Prefab, I've just submitted a quote request for *${formData.productName}*.%0A%0A*Project Specs:*%0A- Size: ${formData.size}%0A- Quantity: ${formData.quantity}%0A- Notes: ${formData.notes || 'N/A'}%0A%0A*Contact:*%0A- Location: ${formData.location || 'N/A'}%0A- Name: ${formData.name}%0A%0APlease provide the best price.`;
    window.open(`https://wa.me/${resolvedWhatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="w-full transition-all duration-500">
      {/* Progress Indicator - Enhanced with better active state visibility */}
      {step < 5 && (
        <div className="mb-10">
          <div className="flex items-center justify-between px-2 relative">
            {STEPS.map((s) => (
              <div key={s.id} className="relative flex flex-col items-center gap-2">
                <div className={`z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500 ${
                  step === s.id 
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' 
                    : step > s.id 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : 'border-gray-200 bg-white text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                }`}>
                  {step > s.id ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : s.id}
                </div>
                <span className={`hidden text-[10px] font-bold uppercase tracking-wider md:block ${
                  step === s.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : step > s.id 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
            {/* Background line */}
            <div className="absolute left-[10%] right-[10%] top-5 md:top-6 h-[2px] bg-gray-200 dark:bg-gray-700" />
            {/* Active progress line */}
            <div 
              className="absolute left-[10%] top-5 md:top-6 h-[2px] bg-blue-600 transition-all duration-700 ease-in-out" 
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 80}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[380px]">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Choose your solution</h2>
              <p className="text-gray-500 mt-2">Select the prefab structure you're interested in.</p>
            </div>
            
            {productsLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-50 animate-pulse dark:bg-gray-800" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {products.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => setFormData(prev => ({ ...prev, productId: p.id, productName: p.name }))}
                    className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${
                      formData.productId === p.id 
                        ? 'border-brand-500 bg-brand-50/30 ring-8 ring-brand-500/5 dark:bg-brand-500/5' 
                        : 'border-gray-100 hover:border-brand-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold uppercase tracking-wider mb-1 ${formData.productId === p.id ? 'text-brand-600' : 'text-gray-400'}`}>Product</span>
                      <span className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-brand-600 transition-colors">{p.name}</span>
                      <span className="text-xs text-gray-500 mt-2 font-medium">{p.priceText || p.priceDisplay || `Starting at ₹${((p.priceMin || 0)/1000).toFixed(0)}k`}</span>
                    </div>
                    {formData.productId === p.id && (
                      <div className="absolute top-4 right-4 text-brand-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {presetProduct?.id && (
              <p className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs font-semibold text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                This quote form is preloaded for {presetProduct.title || presetProduct.name}.
              </p>
            )}
            {errors.product && <div className="rounded-lg bg-error-50 p-3 text-xs text-error-600 font-bold dark:bg-error-500/10">{errors.product}</div>}
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Define Requirements</h2>
              <p className="text-gray-500 mt-2 text-sm">Tell us more about your specific needs and project details.</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Required Size / Dimensions</Label>
                  <Input 
                    placeholder="e.g. 20x10 ft" 
                    value={formData.size} 
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    error={!!errors.size}
                  />
                  {errors.size && <p className="text-[10px] text-error-600 font-bold px-1">{errors.size}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input 
                    type="number" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Additional Notes</Label>
                <TextArea 
                  placeholder="Describe material preference, site location, or custom modifications..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="rounded-2xl border-gray-200 focus:ring-brand-500/10 dark:border-gray-800"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Get in Touch</h2>
              <p className="text-gray-500 mt-2">Where should we send your custom quotation?</p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="John Doe" error={!!errors.name} />
                {errors.name && <p className="text-[10px] text-error-600 font-bold px-1">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="9876543210" error={!!errors.phone} />
                {errors.phone && <p className="text-[10px] text-error-600 font-bold px-1">{errors.phone}</p>}
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Work Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="john@company.com" error={!!errors.email} />
                {errors.email && <p className="text-[10px] text-error-600 font-bold px-1">{errors.email}</p>}
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Installation Location / City</Label>
                <Input value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="City, State" />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Review & Confirm</h2>
              <p className="text-gray-500 mt-2">Please verify your details before final submission.</p>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-800/30 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-1">Selected Product</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{formData.productName}</span>
                </div>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-brand-500 hover:underline">Change</button>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Project Scope</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">"{formData.notes || 'Standard configuration requested.'}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <div>
                  <span className="text-gray-400 block mb-1 uppercase text-[10px] font-bold">Specs</span>
                  <p className="font-medium text-gray-800 dark:text-white">{formData.size}</p>
                  <p className="text-gray-500">Qty: {formData.quantity}</p>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1 uppercase text-[10px] font-bold">Location</span>
                  <p className="font-medium text-gray-800 dark:text-white">{formData.location || 'Consultation required'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Details</span>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{formData.name}</p>
                  <p className="text-xs text-gray-500">{formData.phone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Location</span>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{formData.location || 'Consultation required'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in zoom-in-95 duration-1000 text-center py-8 space-y-6">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/30">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Request Received!</h2>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">Thank you for choosing Saman Prefab. Our engineers will analyze your requirements and send a custom quote shortly.</p>
            </div>
            <div className="pt-4 flex flex-col gap-3 max-w-sm mx-auto">
              <Button onClick={handleWhatsApp} className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] border-none text-base shadow-xl shadow-green-500/20">
                <span className="flex items-center justify-center gap-2">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Continue on WhatsApp
                </span>
              </Button>
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors py-2"
              >
                Back to Website
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation - Enhanced with full-width mobile support */}
      {step < 5 && (
        <div className="mt-8 flex items-center justify-between pt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`${step === 1 ? 'invisible' : ''} px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50`}
          >
            ← Back
          </button>
          <button
            onClick={step === 4 ? handleSubmit : nextStep}
            disabled={createQuoteMutation.isPending}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {createQuoteMutation.isPending ? 'Sending...' : step === 4 ? 'Submit Request' : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  );
}
