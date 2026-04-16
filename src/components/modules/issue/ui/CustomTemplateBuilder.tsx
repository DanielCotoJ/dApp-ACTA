'use client';

import { useState } from 'react';
import type { CredentialTemplate, TemplateField } from '@/@types/templates';
import { credentialTemplateSchema } from '@/lib/schemas/templates';

type DraftField = Omit<TemplateField, 'key'> & { key?: string };

const FIELD_TYPES: TemplateField['type'][] = ['text', 'number', 'date', 'email', 'did'];

function toKey(label: string) {
  return label
    .trim()
    .replace(/\s+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

export default function CustomTemplateBuilder({
  onSave,
  onCancel,
}: {
  onSave: (draft: {
    title: string;
    description: string;
    vcType: string;
    fields: TemplateField[];
  }) => CredentialTemplate;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vcType, setVcType] = useState('');
  const [fields, setFields] = useState<DraftField[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addField = () => {
    setFields((prev) => [...prev, { label: '', type: 'text', required: false, placeholder: '' }]);
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, patch: Partial<DraftField>) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const handleSave = () => {
    setError(null);
    if (!title.trim()) {
      setError('Template name is required');
      return;
    }
    if (!vcType.trim()) {
      setError('VC Type is required (e.g. CustomCredential)');
      return;
    }
    for (const f of fields) {
      if (!f.label.trim()) {
        setError('All custom fields must have a label');
        return;
      }
    }

    const resolved: TemplateField[] = fields.map((f) => ({
      ...f,
      key: f.key || toKey(f.label),
      label: f.label.trim(),
    }));

    const seen = new Set<string>();
    for (const f of resolved) {
      if (seen.has(f.key)) {
        setError(`Duplicate field key "${f.key}"`);
        return;
      }
      seen.add(f.key);
    }

    const draft = {
      title: title.trim(),
      description: description.trim() || `Custom template: ${title.trim()}`,
      vcType: vcType.trim(),
      fields: resolved,
    };

    // Validate shape before handing off to the parent — catches unexpected
    // field types or malformed keys that slipped past the UI.
    const validation = credentialTemplateSchema.omit({ id: true, iconSrc: true }).safeParse(draft);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Invalid template');
      return;
    }

    onSave(draft);
  };

  const inputClass =
    'w-full rounded-xl border border-zinc-800 bg-zinc-950/50 text-white placeholder:text-zinc-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all';

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-5">
      <h3 className="text-xl font-semibold text-white">Create Custom Template</h3>
      <p className="text-sm text-zinc-400">
        Subject DID, Issue Date and Expiration Date are always included automatically.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Template Name *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Certification Badge"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this template"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">VC Type *</label>
          <input
            value={vcType}
            onChange={(e) => setVcType(e.target.value)}
            placeholder="e.g. CertificationCredential"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Used in the VC <code>type</code> array alongside &quot;VerifiableCredential&quot;.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-white">Custom Fields</label>
          <button
            type="button"
            onClick={addField}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 transition-colors"
          >
            + Add Field
          </button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-zinc-500 py-2">
            No custom fields yet. Click &quot;+ Add Field&quot; to add one.
          </p>
        )}

        {fields.map((f, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Field {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeField(idx)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Label *</label>
                <input
                  value={f.label}
                  onChange={(e) => updateField(idx, { label: e.target.value })}
                  placeholder="e.g. Organization"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Type</label>
                <select
                  value={f.type}
                  onChange={(e) =>
                    updateField(idx, { type: e.target.value as TemplateField['type'] })
                  }
                  className={inputClass}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Placeholder</label>
                <input
                  value={f.placeholder || ''}
                  onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                  placeholder="Optional hint"
                  className={inputClass}
                />
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.required || false}
                    onChange={(e) => updateField(idx, { required: e.target.checked })}
                    className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950/50 text-blue-600 focus:ring-blue-600"
                  />
                  Required
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-xl bg-white text-black px-6 py-3 font-medium hover:bg-gray-100 transition-all"
        >
          Save Template
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 text-white px-6 py-3 font-medium hover:bg-zinc-700 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
