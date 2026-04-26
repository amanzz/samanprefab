'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Phone,
  Mail,
  User,
  Building,
  MapPin,
  Package,
  Hash,
  MessageSquare,
  Loader2
} from 'lucide-react';

const STEPS = ['Personal Info', 'Product Details', 'Requirements', 'Review'];

interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  city?: string;
  productInterest?: string;
  quantity?: number;
  budget?: number;
  requirements?: string;
}

const INITIAL_DATA: QuoteFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  productInterest: '',
  quantity: undefined,
  budget: undefined,
  requirements: '',
};

// Generic product UUID for quote submissions (since we submit by name)

export default function GetQuotePage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<QuoteFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [error, setError] = useState('');

  // Pre-fill from URL params
  useEffect(() => {
    const product = searchParams.get('product');
    const city = searchParams.get('city');
    setFormData(prev => ({
      ...prev,
      productInterest: product || '',
      city: city || '',
    }));
  }, [searchParams]);

  const updateField = (field: keyof QuoteFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        return formData.name && formData.email && formData.phone;
      case 1:
        return formData.productInterest;
      case 2:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Format phone: remove non-digits, ensure 10 digits starting with 6-9
      const phoneDigits = formData.phone.replace(/\D/g, '');
      const formattedPhone = phoneDigits.slice(-10); // Take last 10 digits
      
      if (!/^[6-9]\d{9}$/.test(formattedPhone)) {
        throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      }

      const res = await api.post<{ refId: string }>('/quotes', {
        contact: {
          name: formData.name,
          email: formData.email,
          phone: formattedPhone,
          companyName: formData.company || undefined,
        },
        location: {
          cityName: formData.city || 'Not specified',
          pincode: '411001',
          deliveryAddress: '',
        },
        items: [{
          quantity: formData.quantity || 1,
          unit: 'unit',
        }],
        specs: {
          timeline: 'flexible',
          installationRequired: true,
          notes: `${formData.productInterest || 'General Inquiry'}${formData.requirements ? ` - ${formData.requirements}` : ''}`,
        },
        sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        utmSource: 'website',
      });
      setRefId(res.data.refId);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit quote request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <SuccessScreen refId={refId} formData={formData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get a Free Quote</h1>
          <p className="text-gray-600">
            Tell us your requirements and we&apos;ll send you a customized quote within 24 hours.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={[
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                    i < step ? 'bg-green-500 text-white' :
                    i === step ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  ].join(' ')}
                >
                  {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                </div>
                <span className={[
                  'ml-2 text-sm hidden sm:block',
                  i <= step ? 'text-gray-900 font-medium' : 'text-gray-500'
                ].join(' ')}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={[
                    'w-12 sm:w-16 h-1 mx-2 sm:mx-4 rounded',
                    i < step ? 'bg-green-500' : 'bg-gray-200'
                  ].join(' ')} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
              <InputField
                label="Full Name *"
                icon={<User className="h-4 w-4" />}
                value={formData.name}
                onChange={(v) => updateField('name', v)}
                placeholder="John Smith"
                required
              />
              <InputField
                label="Email Address *"
                icon={<Mail className="h-4 w-4" />}
                type="email"
                value={formData.email}
                onChange={(v) => updateField('email', v)}
                placeholder="john@company.com"
                required
              />
              <InputField
                label="Phone Number *"
                icon={<Phone className="h-4 w-4" />}
                type="tel"
                value={formData.phone}
                onChange={(v) => updateField('phone', v)}
                placeholder="+91 98765 43210"
                required
              />
              <InputField
                label="Company (Optional)"
                icon={<Building className="h-4 w-4" />}
                value={formData.company || ''}
                onChange={(v) => updateField('company', v)}
                placeholder="Your Company"
              />
              <InputField
                label="City *"
                icon={<MapPin className="h-4 w-4" />}
                value={formData.city || ''}
                onChange={(v) => updateField('city', v)}
                placeholder="Mumbai, Pune, Delhi..."
                required
              />
            </div>
          )}

          {/* Step 2: Product Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Interest</h2>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Portable Cabin',
                    'Site Office',
                    'Prefab House',
                    'Warehouse',
                    'Labour Camp',
                    'Security Cabin',
                    'Toilet Block',
                    'Other',
                  ].map((product) => (
                    <button
                      key={product}
                      type="button"
                      onClick={() => updateField('productInterest', product)}
                      className={[
                        'p-3 rounded-lg border text-left transition-colors',
                        formData.productInterest === product
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      ].join(' ')}
                    >
                      <Package className="h-4 w-4 mb-1" />
                      <span className="text-sm font-medium">{product}</span>
                    </button>
                  ))}
                </div>
              </div>
              <InputField
                label="Quantity Needed"
                icon={<Hash className="h-4 w-4" />}
                type="number"
                value={formData.quantity?.toString() || ''}
                onChange={(v) => updateField('quantity', parseInt(v) || 0)}
                placeholder="1"
              />
              <InputField
                label="Estimated Budget (INR)"
                icon={<span className="text-sm">₹</span>}
                type="number"
                value={formData.budget?.toString() || ''}
                onChange={(v) => updateField('budget', parseInt(v) || 0)}
                placeholder="50000"
              />
            </div>
          )}

          {/* Step 3: Requirements */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Requirements
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={formData.requirements || ''}
                    onChange={(e) => updateField('requirements', e.target.value)}
                    placeholder="Tell us about your specific requirements: size, specifications, delivery timeline, special features needed..."
                    rows={5}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  The more details you provide, the more accurate your quote will be.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Request</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <ReviewItem label="Name" value={formData.name} />
                <ReviewItem label="Email" value={formData.email} />
                <ReviewItem label="Phone" value={formData.phone} />
                <ReviewItem label="Company" value={formData.company} />
                <ReviewItem label="City" value={formData.city} />
                <ReviewItem label="Product Interest" value={formData.productInterest} />
                <ReviewItem label="Quantity" value={formData.quantity?.toString()} />
                <ReviewItem label="Budget" value={formData.budget ? `₹${formData.budget.toLocaleString()}` : undefined} />
                <ReviewItem label="Requirements" value={formData.requirements} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Link>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!validateStep()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Quote Request
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="text-sm text-gray-600">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            Free Quote
          </div>
          <div className="text-sm text-gray-600">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            24hr Response
          </div>
          <div className="text-sm text-gray-600">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            No Obligation
          </div>
          <div className="text-sm text-gray-600">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            Best Prices
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function SuccessScreen({ refId, formData }: { refId: string; formData: QuoteFormData }) {
  const whatsappMessage = encodeURIComponent(
    `Hi Saman Prefab, I just submitted a quote request (Ref: ${refId}). I'm interested in ${formData.productInterest} for ${formData.city}. Looking forward to your response!`
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Request Submitted!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your interest. Our team will review your requirements and 
            send you a customized quote within 24 hours.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Your Reference ID:</p>
            <p className="text-lg font-bold text-blue-700">{refId}</p>
          </div>
          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="inline h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat on WhatsApp
            </a>
            <Link
              href="/products"
              className="block w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse More Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
