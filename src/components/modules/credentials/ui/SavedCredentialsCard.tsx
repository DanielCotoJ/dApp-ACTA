'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import { BorderBeam } from '@/components/ui/border-beam';
import type { CredentialCardProps } from '@/@types/credentials';

export function CredentialCard({
  name,
  category,
  wallet,
  url,
  onCopy,
  onShare,
  status,
  onRevoke,
  onView,
}: CredentialCardProps) {
  return (
    <Card className="relative overflow-hidden bg-black border-[#edeed1]/40 min-h-[200px] w-full p-0">
      <div className="relative flex flex-col pr-6 pl-6 pb-6 pt-2 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(() => {
              const c = String(category || '').toLowerCase();
              const logoSrc = c.includes('escrow')
                ? '/tw-x-acta.png'
                : c.includes('contributions')
                  ? '/gf-x-acta.png'
                  : '/acta.png';
              const translateClass = logoSrc === '/acta.png' ? '-translate-x-2' : '-translate-x-1';
              return (
                <div className={'shrink-0 h-20'}>
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={360}
                    height={108}
                    className={`h-20 w-auto object-contain object-left transform ${translateClass}`}
                  />
                </div>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center px-3 py-1 rounded-full bg-[#edeed1]/10 backdrop-blur-sm border border-[#edeed1]/30 text-xs font-medium whitespace-nowrap text-white overflow-hidden">
              <span className="relative z-10">{category}</span>
              <BorderBeam
                size={28}
                duration={8}
                initialOffset={0}
                borderWidth={2}
                colorFrom="#FFD36B"
                colorTo="#FFF1C2"
              />
            </div>
            {status === 'revoked' && (
              <span className="px-2 py-1 rounded-full bg-red-900/30 border border-red-700/40 text-xs font-semibold text-red-300">
                Revoked
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1 mb-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Wallet Address</p>
          <div className="flex items-start gap-2">
            <p className="font-mono text-xs font-medium break-all flex-1 leading-relaxed">
              {wallet}
            </p>
            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(wallet, 'Wallet')}
                className="h-8 w-8 p-0 hover:bg-[#edeed1]/10 text-white shrink-0 border border-[#edeed1]/30 rounded-lg"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 mt-2">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Credential Name</p>
            <p className="text-sm font-medium truncate">{name}</p>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline block truncate"
              >
                {new URL(url).hostname}
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onView}
                title="View"
                aria-label="View"
                className="h-11 w-11 rounded-xl bg-zinc-900/40 border border-zinc-700/40 hover:bg-zinc-800/40 text-white shrink-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {onRevoke && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRevoke}
                title="Revoke"
                aria-label="Revoke"
                className="h-11 w-11 rounded-xl bg-red-900/20 border border-red-700/40 hover:bg-red-800/30 text-red-400 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            {onShare && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                title="Share"
                aria-label="Share"
                className="h-11 w-11 rounded-xl bg-[#edeed1]/10 border border-[#edeed1]/30 hover:bg-[#edeed1]/20 text-white shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
