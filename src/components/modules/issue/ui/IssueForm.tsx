'use client';

import type React from 'react';

import { useState } from 'react';
import type { MockCredential } from '@/@types/credentials';
import { buildMockCredential } from '../hooks/useIssueCredential';

export default function IssueForm() {
  const [issuer, setIssuer] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('UniversityDegree');
  const [attributes, setAttributes] = useState(
    '{\n  "degreeName": "Bachelor of Engineering",\n  "issueDate": "2025-01-01"\n}'
  );
  const [expires, setExpires] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [preview, setPreview] = useState<MockCredential | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mockCredential = buildMockCredential({
        issuer,
        subject,
        type,
        attributesJson: attributes,
        expires: hasExpiration ? expires : '',
      });
      setPreview(mockCredential);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Attributes JSON is not valid';
      alert(msg);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-2">Create Credential</h3>
          <div className="mb-4 flex items-center gap-3">
            <input
              id="hasExpiration"
              type="checkbox"
              checked={hasExpiration}
              onChange={(e) => setHasExpiration(e.target.checked)}
              className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950/50 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="hasExpiration" className="text-sm font-medium text-white">
              Does the credential have an expiration date?
            </label>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            Complete the fields to create a new credential
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Issuer</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="did:example:issuer123 or an address"
                className="w-full rounded-xl border border-[#edeed1]/20 bg-zinc-950/50 text-white placeholder:text-zinc-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="did:example:user456 or email"
                className="w-full rounded-xl border border-[#edeed1]/20 bg-zinc-950/50 text-white placeholder:text-zinc-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Credential type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-[#edeed1]/20 bg-zinc-950/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="Escrow">Escrow</option>
                <option value="Contributions">Contributions</option>
                <option value="Membership">Membership</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Attributes (JSON)</label>
              <textarea
                value={attributes}
                onChange={(e) => setAttributes(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-[#edeed1]/20 bg-zinc-950/50 text-white placeholder:text-zinc-500 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            {hasExpiration && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Expiration Date</label>
                <input
                  type="date"
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                  className="w-full rounded-xl border border-[#edeed1]/20 bg-zinc-950/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition-all"
            >
              Generate credential (mock)
            </button>
          </div>
        </div>
      </form>

      {/* Preview */}
      <div className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Preview</h3>
          <span className="text-xs text-zinc-500 font-mono">ACTA</span>
        </div>

        {!preview && (
          <div className="py-8 text-center text-sm text-zinc-500">
            Fill the form and press "Generate".
          </div>
        )}
        {preview && (
          <div className="space-y-4">
            <div className="rounded-xl bg-zinc-950/80 p-4 border border-[#edeed1]/20">
              <pre className="text-xs text-zinc-300 overflow-auto">
                {JSON.stringify(preview, null, 2)}
              </pre>
            </div>
            <div className="rounded-xl border border-[#edeed1]/20 bg-zinc-950/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Credential</span>
                <span className="text-xs text-zinc-500 font-mono">ACTA</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Issuer</span>
                  <span className="font-mono text-zinc-300 text-xs truncate max-w-[200px]">
                    {preview.issuer}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subject</span>
                  <span className="font-mono text-zinc-300 text-xs truncate max-w-[200px]">
                    {preview.credentialSubject?.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Type</span>
                  <span className="font-medium text-white">{preview.type?.[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Issued</span>
                  <span className="text-zinc-300 text-xs">
                    {new Date(preview.issuanceDate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
