"use client";

import React, { useState, useEffect } from "react";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { Setting } from "@/types/settings.types";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { authFetch } from "@/lib/auth-fetch";

const TABS = [
  { key: "general", label: "General" },
  { key: "seo", label: "SEO" },
  { key: "email", label: "Email / SMTP" },
  { key: "api", label: "API Keys" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ─── Cache Clear ──────────────────────────────────────────────────────────────

function ClearCacheButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleClear = async () => {
    setStatus('loading');
    setMsg('');
    try {
      const res = await authFetch('/api/admin/cache/clear', { method: 'POST', cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setStatus('done');
        setMsg(`Cleared ${json.data.clearedPaths.length} paths + ${json.data.clearedTags.length} tags`);
      } else {
        throw new Error(json.error || 'Failed');
      }
    } catch (err: any) {
      setStatus('error');
      setMsg(err?.message || 'Cache clear failed');
    } finally {
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleClear}
        disabled={status === 'loading'}
        variant="outline"
        className="flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.78" />
        </svg>
        {status === 'loading' ? 'Clearing…' : 'Clear Website Cache'}
      </Button>
      {msg && (
        <p className={`text-sm font-medium ${
          status === 'done' ? 'text-success-600' : 'text-error-500'
        }`}>
          {status === 'done' ? '✓ ' : '✗ '}{msg}
        </p>
      )}
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: settings, isLoading, error, refetch } = useSettings();
  const updateMutation = useUpdateSetting();

  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const settingsList = settings ?? [];

  // Initialize local values from settings when settings load
  useEffect(() => {
    const values: Record<string, string> = {};
    settingsList.forEach((s: Setting) => {
      values[s.key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
    });
    setLocalValues(values);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [settings]);

  // Merge local edits with base values (local takes precedence for edited keys)
  const editValues = React.useMemo(() => {
    const base: Record<string, string> = {};
    settingsList.forEach((s: Setting) => {
      base[s.key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
    });
    return { ...base, ...localValues };
  }, [settingsList, localValues]);

  const filteredSettings = settingsList.filter(
    (s: Setting) => (s.category || "general") === activeTab
  );

  const handleSave = (key: string) => {
    updateMutation.mutate(
      { key, value: editValues[key] },
      {
        onSuccess: () => {
          refetch(); // Reload settings
          setSavedKey(key);
          setTimeout(() => setSavedKey(null), 2000);
        },
      }
    );
  };

  const handleChange = (key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase());
  };

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Loading settings...</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-error-500 font-medium">Error loading settings.</div>
      <p className="mt-2 text-xs text-gray-400">{(error as any)?.message}</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">System Settings</h2>
        <p className="text-sm text-gray-500">Configure global settings for your application.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {filteredSettings.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No settings in this category</p>
            <p className="text-sm text-gray-400 mt-1">Settings will appear here once configured via the API.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredSettings.map((setting: Setting) => {
              const isPassword = setting.key.toLowerCase().includes("password") || setting.key.toLowerCase().includes("secret") || setting.key.toLowerCase().includes("api_key");
              const hasChanged = editValues[setting.key] !== (typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value));

              return (
                <div key={setting.key} className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-shrink-0 sm:w-1/3">
                    <Label className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {setting.label || formatLabel(setting.key)}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
                    )}
                    <span className="inline-flex mt-1 text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded dark:bg-gray-800">
                      {setting.key}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center gap-3">
                    <Input
                      type={isPassword ? "password" : "text"}
                      value={editValues[setting.key] || ""}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant={hasChanged ? "primary" : "outline"}
                      onClick={() => handleSave(setting.key)}
                      disabled={updateMutation.isPending && updateMutation.variables?.key === setting.key}
                    >
                      {savedKey === setting.key ? "Saved!" :
                       updateMutation.isPending && updateMutation.variables?.key === setting.key ? "Saving..." :
                       "Save"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cache management */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">Website Cache</h3>
        <p className="mb-4 text-sm text-gray-500">
          Clear the ISR cache for all public pages. Use this after publishing products, categories, or settings changes.
        </p>
        <ClearCacheButton />
      </div>

      {/* Helpful footer */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <span className="font-semibold">Tip:</span> Settings are organized by category. Changes are saved individually per field. Password and API key fields are masked for security.
        </p>
      </div>
    </div>
  );
}
