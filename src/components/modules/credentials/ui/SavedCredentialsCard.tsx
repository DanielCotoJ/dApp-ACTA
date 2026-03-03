'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { BorderBeam } from '@/components/ui/border-beam';
import type { CredentialCardProps } from '@/@types/credentials';
import { motion } from 'motion/react';

interface ExpandableCredentialCardProps extends CredentialCardProps {
  layoutId?: string;
  onClick?: () => void;
}

export function CredentialCard({
  name,
  category,
  wallet,
  url,
  onShare,
  status,
  onRevoke,
  layoutId,
  onClick,
}: ExpandableCredentialCardProps) {
  const logoInfo = (() => {
    const c = String(category || '').toLowerCase();
    const logoSrc = c.includes('escrow')
      ? '/tw-x-acta.png'
      : c.includes('contributions')
        ? '/gf-x-acta.png'
        : '/acta.png';
    const translateClass = logoSrc === '/acta.png' ? '-translate-x-2' : '-translate-x-1';
    return { logoSrc, translateClass };
  })();

  return (
    <motion.div
      layoutId={layoutId ? `card-${layoutId}` : undefined}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card className="relative overflow-hidden bg-zinc-900/80 border border-zinc-800/60 min-h-[260px] w-full p-0 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.35),0_8px_16px_rgba(0,0,0,0.3),0_16px_48px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all duration-300 ease-out">
        <div className="relative flex flex-col pr-6 pl-6 pb-8 pt-2 text-white h-full justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                layoutId={layoutId ? `logo-${layoutId}` : undefined}
                className="shrink-0 h-20 [filter:drop-shadow(0_0_12px_rgba(237,238,209,0.35))]"
              >
                <Image
                  src={logoInfo.logoSrc}
                  alt="Logo"
                  width={360}
                  height={108}
                  className={`h-20 w-auto object-contain object-left transform ${logoInfo.translateClass}`}
                />
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                layoutId={layoutId ? `badge-${layoutId}` : undefined}
                className="relative inline-flex items-center px-3 py-1 rounded-full bg-[#edeed1]/10 backdrop-blur-sm border border-[#edeed1]/30 text-xs font-medium whitespace-nowrap text-white overflow-hidden"
              >
                <span className="relative z-10">{category}</span>
                <BorderBeam
                  size={28}
                  duration={8}
                  initialOffset={0}
                  borderWidth={2}
                  colorFrom="#FFD36B"
                  colorTo="#FFF1C2"
                />
              </motion.div>
              {status === 'revoked' && (
                <span className="px-2 py-1 rounded-full bg-red-900/30 border border-red-700/40 text-xs font-semibold text-red-300">
                  Revoked
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1 mb-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Wallet Address</p>
            <motion.p
              layoutId={layoutId ? `wallet-${layoutId}` : undefined}
              className="font-mono text-xs font-medium break-all leading-relaxed"
            >
              {wallet}
            </motion.p>
          </div>

          <div className="flex items-end justify-between gap-3 mt-2">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Credential Name</p>
              <motion.p
                layoutId={layoutId ? `name-${layoutId}` : undefined}
                className="text-sm font-medium truncate"
              >
                {name}
              </motion.p>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline block truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {new URL(url).hostname}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onRevoke && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevoke();
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
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
    </motion.div>
  );
}
