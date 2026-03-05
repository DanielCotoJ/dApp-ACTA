'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
    <div className="space-y-3">
      <label className="mt-4 block text-sm font-medium text-white">Select Template</label>

      <div className="flex gap-3">
        <div ref={wrapperRef} className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-left text-white transition-all hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <span className={selectedTemplate ? 'text-white' : 'text-zinc-500'}>
              {selectedTemplate ? selectedTemplate.title : 'Choose a template...'}
            </span>
            <svg
              className={`h-4 w-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white transition-colors hover:bg-zinc-700"
          >
            + Custom
          </button>
        )}
      </div>

      {templates.length === 0 && (
        <p className="text-xs text-zinc-500">
          No templates available yet. Create one with{' '}
          {onCreateCustom ? <span className="text-zinc-300">+ Custom</span> : 'template builder'}.
        </p>
      )}

      {selectedIsCustom && onDeleteCustom && selectedId && (
        <button
          type="button"
          onClick={() => onDeleteCustom(selectedId)}
          className="text-xs text-red-400 transition-colors hover:text-red-300"
        >
          Delete this custom template
        </button>
      )}
    </div>
  );
}
