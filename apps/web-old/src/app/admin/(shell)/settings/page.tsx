'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/ToastProvider';
import type { Setting } from '@/lib/types/admin';
import { Card, CardHeader, CardDivider } from '@/components/admin/ui/Card';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';

const GROUPS: { title: string; description: string; fields: { key: string; label: string; placeholder: string }[] }[] = [
  {
    title: 'Site Information',
    description: 'Basic site identity and contact details',
    fields: [
      { key: 'site_name', label: 'Site Name', placeholder: 'Saman Prefab' },
      { key: 'site_url', label: 'Site URL', placeholder: 'https://samanprefab.com' },
      { key: 'site_phone', label: 'Contact Phone', placeholder: '+91 98765 43210' },
      { key: 'site_email', label: 'Contact Email', placeholder: 'info@samanprefab.com' },
    ],
  },
  {
    title: 'Integrations',
    description: 'Third-party service configuration',
    fields: [
      { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: '919876543210' },
      { key: 'gtm_id', label: 'Google Tag Manager ID', placeholder: 'GTM-XXXXXXX' },
    ],
  },
];

export default function SettingsPage() {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Setting[]>('/settings')
      .then((r) => {
        const map: Record<string, string> = {};
        r.data.forEach((s) => { map[s.key] = s.value; });
        setValues(map);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(groupKeys: string[]) {
    setSaving(true);
    try {
      const updates = groupKeys.map((key) => ({ key, value: values[key] ?? '' }));
      await api.patch('/settings/bulk', { settings: updates });
      toast.success('Settings saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform configuration and integrations</p>
      </div>

      {GROUPS.map((group) => (
        <Card key={group.title}>
          <CardHeader title={group.title} description={group.description} />
          <CardDivider />
          <div className="space-y-4">
            {group.fields.map((field) => (
              <Input key={field.key} label={field.label} placeholder={field.placeholder}
                value={values[field.key] ?? ''}
                disabled={loading}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button loading={saving} disabled={loading}
              onClick={() => handleSave(group.fields.map((f) => f.key))}>
              Save Changes
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
