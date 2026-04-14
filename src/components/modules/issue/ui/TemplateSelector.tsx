'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CredentialTemplate } from '@/@types/templates';
import { LayoutTemplate, Plus, Trash2, ChevronDown } from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const isCustom = (id: string) => id.startsWith('custom-');
  const selectedIsCustom = selectedId ? isCustom(selectedId) : false;
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? null,
    [templates, selectedId]
  );
  const builtInTemplates = useMemo(
    () => templates.filter((template) => !isCustom(template.id)),
    [templates]
  );
  const customTemplates = useMemo(
    () => templates.filter((template) => isCustom(template.id)),
    [templates]
  );

  useEffect(() => {
    const onPointerDownOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDownOutside);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onPointerDownOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  return (
    <section
      className={`relative rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6 ${open ? 'z-50' : ''}`}
    >
      <header className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
          <LayoutTemplate className="h-5 w-5 text-[#edeed1]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-white">Choose a template</h2>
          <p className="text-sm text-zinc-400">
            Start from a built-in credential or create your own template.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div ref={wrapperRef} className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-left text-white transition-all hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#edeed1]/40"
          >
            <span className="min-w-0 flex-1 truncate text-sm">
              {selectedTemplate ? (
                <span className="text-white">{selectedTemplate.title}</span>
              ) : (
                <span className="text-zinc-500">Choose a template…</span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {open && (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-sm">
              <div className="max-h-72 overflow-y-auto py-2 pretty-scrollbar" role="listbox">
                {builtInTemplates.length > 0 && (
                  <>
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Built-in
                    </p>
                    {builtInTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        role="option"
                        aria-selected={selectedId === template.id}
                        onClick={() => {
                          onSelect(template);
                          setOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left transition-colors hover:bg-zinc-800/70 ${
                          selectedId === template.id ? 'bg-zinc-800/80' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-white">{template.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">
                          {template.description}
                        </p>
                      </button>
                    ))}
                  </>
                )}

                {customTemplates.length > 0 && (
                  <>
                    <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Custom
                    </p>
                    {customTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        role="option"
                        aria-selected={selectedId === template.id}
                        onClick={() => {
                          onSelect(template);
                          setOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left transition-colors hover:bg-zinc-800/70 ${
                          selectedId === template.id ? 'bg-zinc-800/80' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-white">{template.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">
                          {template.description}
                        </p>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {onCreateCustom && (
          <button
            type="button"
            onClick={onCreateCustom}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#edeed1]/30 bg-[#edeed1]/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#edeed1]/20"
          >
            <Plus className="h-4 w-4" />
            Custom
          </button>
        )}
      </div>

      {templates.length === 0 && (
        <p className="mt-3 text-xs text-zinc-500">
          No templates available yet. Create one with{' '}
          {onCreateCustom ? <span className="text-zinc-300">+ Custom</span> : 'template builder'}.
        </p>
      )}

      {selectedIsCustom && onDeleteCustom && selectedId && (
        <button
          type="button"
          onClick={() => onDeleteCustom(selectedId)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-400 transition-colors hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete this custom template
        </button>
      )}
    </section>
  );
}
