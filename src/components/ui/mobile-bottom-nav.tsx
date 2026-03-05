'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FilePlus, IdCard, User } from 'lucide-react';
import type { ComponentType } from 'react';

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      aria-label={label}
      className={
        'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors ' +
        (active
          ? 'bg-zinc-800/60 text-white'
          : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40')
      }
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] leading-none">{label}</span>
    </Link>
  );
}

export default function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/70 bg-zinc-900/85 backdrop-blur-md">
      <div
        className="mx-auto max-w-7xl px-2 py-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-4 gap-1">
          <NavItem href="/dashboard" label="Home" icon={Home} />
          <NavItem href="/dashboard/issue" label="Issue" icon={FilePlus} />
          <NavItem href="/dashboard/credentials" label="Creds" icon={IdCard} />
          <button
            type="button"
            aria-label="Profile"
            onClick={() => {
              try {
                window.dispatchEvent(new CustomEvent('open-settings'));
              } catch {}
            }}
            className={
              'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors text-zinc-300 hover:text-white hover:bg-zinc-800/40'
            }
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] leading-none">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
