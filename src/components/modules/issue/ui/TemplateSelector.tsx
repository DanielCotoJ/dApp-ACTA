'use client';

import type { CredentialTemplate } from '@/@types/templates';

export default function TemplateSelector({
  templates,
  selectedId,
  onSelect,
  onCreateCustom,
  onDeleteCustom,
}: {
  templates: CredentialTemplate[];
  selectedId: string | null;
  onSelect: (tpl: CredentialTemplate) => void;
  onCreateCustom?: () => void;
  onDeleteCustom?: (id: string) => void;
}) {
  const isCustom = (id: string) => id.startsWith('custom-');
  const selectedIsCustom = selectedId ? isCustom(selectedId) : false;

  return (
    <div className="space-y-3">
      <label className="block mt-4 text-sm font-medium text-white">Select Template</label>

      <div className="flex gap-3">
        <select
          value={selectedId || ''}
          onChange={(e) => {
            const tpl = templates.find((t) => t.id === e.target.value);
            if (tpl) onSelect(tpl);
          }}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
        >
          <option value="" disabled>
            Choose a template...
          </option>

          {templates.filter((t) => !isCustom(t.id)).length > 0 && (
            <optgroup label="Built-in">
              {templates
                .filter((t) => !isCustom(t.id))
                .map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title} – {tpl.description}
                  </option>
                ))}
            </optgroup>
          )}

          {templates.filter((t) => isCustom(t.id)).length > 0 && (
            <optgroup label="Custom">
              {templates
                .filter((t) => isCustom(t.id))
                .map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title} – {tpl.description}
                  </option>
                ))}
            </optgroup>
          )}
        </select>

        {onCreateCustom && (
          <button
            type="button"
            onClick={onCreateCustom}
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white hover:bg-zinc-700 transition-colors"
          >
            + Custom
          </button>
        )}
      </div>

      {selectedIsCustom && onDeleteCustom && selectedId && (
        <button
          type="button"
          onClick={() => onDeleteCustom(selectedId)}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Delete this custom template
        </button>
      )}
    </div>
  );
}
