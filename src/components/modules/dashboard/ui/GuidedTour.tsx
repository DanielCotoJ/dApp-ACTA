'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Layout,
  Lock,
  ShieldCheck,
  FilePlus,
  Share2,
  KeyRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { TourStep } from '@/@types/guided-tour';

function StepCard({
  label,
  detail,
  href,
  onClick,
}: {
  label: string;
  detail: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/40 p-4 hover:border-[#edeed1]/40 transition-colors cursor-pointer h-full">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="text-xs text-zinc-400 mt-1">{detail}</p>
    </div>
  );

  if (href)
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className="text-left w-full">
        {inner}
      </button>
    );
  return inner;
}

function StepBullet({ bold, text }: { bold: string; text: string }) {
  return (
    <p className="text-sm text-zinc-300">
      <span className="font-semibold text-white">{bold}</span>: {text}
    </p>
  );
}

function StepAction({ label, href }: { label: string; href: string }) {
  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/40 p-4 flex items-center justify-center hover:border-[#edeed1]/40 transition-colors">
      <Link
        href={href}
        className="text-sm font-medium text-[#edeed1] flex items-center gap-2 hover:underline"
      >
        <ChevronRight className="w-4 h-4" />
        {label}
      </Link>
    </div>
  );
}

function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-14 h-14 rounded-2xl bg-[#edeed1]/10 border border-[#edeed1]/20 flex items-center justify-center mb-4">
      {children}
    </div>
  );
}

function buildSteps(onClose: () => void): TourStep[] {
  return [
    {
      icon: <Image src="/logo.png" alt="ACTA" width={32} height={32} className="w-8 h-8" />,
      title: 'Welcome to ACTA',
      description:
        'ACTA is a decentralized credential management platform built on Stellar. This guide will walk you through how to use each section of the app.',
      content: (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <StepCard
            label="Dashboard"
            detail="Your hub for quick actions and getting started."
            href="/dashboard"
            onClick={onClose}
          />
          <StepCard label="Sidebar" detail="Navigate between all pages from the left sidebar." />
        </div>
      ),
    },
    {
      icon: <Layout className="w-7 h-7 text-[#edeed1]" />,
      title: 'Navigating the App',
      description:
        'Use the sidebar on the left to switch between pages. The header at the top lets you toggle between Testnet and Mainnet.',
      content: (
        <div className="space-y-3 mt-2">
          <StepBullet bold="Sidebar" text="access Home, Issue, Authorize, Vault, and API Keys." />
          <StepBullet
            bold="Settings"
            text="click your profile icon at the bottom of the sidebar to connect your wallet."
          />
          <StepBullet
            bold="Network toggle"
            text="switch between Testnet and Mainnet from the top-right header."
          />
        </div>
      ),
    },
    {
      icon: <Lock className="w-7 h-7 text-[#edeed1]" />,
      title: 'Your Vault',
      description:
        'Your vault is your on-chain credential storage. Create it once, then all credentials issued to you are stored here.',
      content: (
        <div className="space-y-3 mt-2">
          <StepBullet
            bold="Create vault"
            text="go to the Vault page and create your personal vault."
          />
          <StepBullet bold="Search" text="find specific credentials using the search bar." />
          <StepBullet bold="Manage" text="expand, view JSON, share, or revoke any credential." />
          <StepAction label="Go to Vault" href="/dashboard/credentials" />
        </div>
      ),
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-[#edeed1]" />,
      title: 'Authorize Issuers',
      description:
        'Before anyone can issue credentials to your vault, you need to authorize their wallet address.',
      content: (
        <div className="space-y-3 mt-2">
          <StepBullet
            bold="Add issuer"
            text="enter a wallet address to grant issuing permissions."
          />
          <StepBullet bold="Manage list" text="view and remove authorized issuers at any time." />
          <StepAction label="Go to Authorize" href="/dashboard/authorize" />
        </div>
      ),
    },
    {
      icon: <FilePlus className="w-7 h-7 text-[#edeed1]" />,
      title: 'Issue Credentials',
      description:
        'Create and issue credentials using built-in or custom templates. Fill in the details and issue to any authorized vault.',
      content: (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <StepCard label="Built-in Templates" detail="Pre-made templates ready to use." />
          <StepCard label="Custom Templates" detail="Build your own credential structure." />
        </div>
      ),
    },
    {
      icon: <Share2 className="w-7 h-7 text-[#edeed1]" />,
      title: 'Share & Verify',
      description:
        'Share credentials with anyone via a unique link. Recipients can verify authenticity on-chain.',
      content: (
        <div className="space-y-3 mt-2">
          <StepBullet
            bold="Share"
            text="open any credential in your vault and click Share to generate a link."
          />
          <StepBullet
            bold="ZK Proofs"
            text="choose which fields to reveal using zero-knowledge predicates."
          />
          <StepBullet
            bold="Verify"
            text="anyone with the link can verify the credential without needing a wallet."
          />
        </div>
      ),
    },
    {
      icon: <KeyRound className="w-7 h-7 text-[#edeed1]" />,
      title: 'API Keys',
      description:
        'Request an API key to access ACTA services programmatically. You can generate one from the API Keys page.',
      content: (
        <div className="mt-2">
          <StepAction label="Go to API Keys" href="/dashboard/api-keys" />
        </div>
      ),
    },
  ];
}

export default function GuidedTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const steps = buildSteps(onClose);
  const total = steps.length;
  const step = steps[current];

  if (!open) return null;

  const progress = ((current + 1) / total) * 100;

  const handleClose = () => {
    setCurrent(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      <div className="relative z-9999 w-full max-w-lg mx-4 rounded-2xl border border-zinc-800/60 bg-zinc-950 shadow-2xl overflow-hidden">
        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-[#edeed1] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-6 bg-[#edeed1]'
                      : i < current
                        ? 'w-2 bg-[#edeed1]/60'
                        : 'w-2 bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <div className="text-center mb-2">
            <IconWrapper>{step.icon}</IconWrapper>
            <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
              {step.description}
            </p>
          </div>

          {step.content && <div className="mt-4">{step.content}</div>}

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrent((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="text-zinc-400 hover:text-white disabled:opacity-30 gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <span className="text-xs text-zinc-500 tabular-nums">
              {current + 1} / {total}
            </span>

            {current < total - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrent((p) => Math.min(total - 1, p + 1))}
                className="bg-[#edeed1] hover:bg-[#edeed1]/90 text-black font-medium gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleClose}
                className="bg-[#edeed1] hover:bg-[#edeed1]/90 text-black font-medium"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
