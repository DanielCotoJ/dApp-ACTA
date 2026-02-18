'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { CredentialTemplate, TemplateField } from '@/@types/templates';

const STORAGE_KEY = 'acta-custom-templates';
const EMPTY: CredentialTemplate[] = [];

let listeners: Array<() => void> = [];
let cachedRaw: string | null = null;
let cachedValue: CredentialTemplate[] = EMPTY;

function readFromStorage(): CredentialTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as CredentialTemplate[]) : EMPTY;
    return cachedValue;
  } catch {
    return EMPTY;
  }
}

function emitChange() {
  readFromStorage();
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners = [...listeners, cb];
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function getSnapshot(): CredentialTemplate[] {
  return readFromStorage();
}

function getServerSnapshot(): CredentialTemplate[] {
  return EMPTY;
}

function persist(templates: CredentialTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  emitChange();
}

const BASE_FIELDS: TemplateField[] = [
  {
    key: 'subject',
    label: 'Subject DID',
    type: 'did',
    required: true,
    placeholder: 'Wallet (G...) – we derive DID',
  },
  { key: 'issueDate', label: 'Issue Date', type: 'date', required: true },
  { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
];

export function useCustomTemplates() {
  const customTemplates = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveTemplate = useCallback(
    (draft: { title: string; description: string; vcType: string; fields: TemplateField[] }) => {
      const id = `custom-${Date.now().toString(36)}`;
      const merged: TemplateField[] = [
        ...BASE_FIELDS,
        ...draft.fields.filter((f) => !BASE_FIELDS.some((b) => b.key === f.key)),
      ];
      const tpl: CredentialTemplate = { id, ...draft, fields: merged };
      persist([...getSnapshot(), tpl]);
      return tpl;
    },
    []
  );

  const deleteTemplate = useCallback((id: string) => {
    persist(getSnapshot().filter((t) => t.id !== id));
  }, []);

  return { customTemplates, saveTemplate, deleteTemplate, BASE_FIELDS };
}
