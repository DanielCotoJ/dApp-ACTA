import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';
import { Home, User, ShieldCheck, FilePlus, Lock, KeyRound, Compass } from 'lucide-react';

export function AppSidebar() {
  const router = useRouter();
  const links = [
    {
      label: 'ACTA',
      href: '/dashboard',
      icon: (
        <Image
          src="/logo.png"
          alt="ACTA"
          className="h-6 w-6 shrink-0 rounded"
          width={24}
          height={24}
          priority
        />
      ),
    },
    {
      label: 'Home',
      href: '/dashboard',
      icon: <Home className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: 'API Keys',
      href: '/dashboard/api-keys',
      icon: <KeyRound className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: 'Issue',
      href: '/dashboard/issue',
      icon: <FilePlus className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: 'Authorize',
      href: '/dashboard/authorize',
      icon: <ShieldCheck className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: 'Vault',
      href: '/dashboard/credentials',
      icon: <Lock className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
  ];
  return (
    <Sidebar animate={true}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="mt-2 flex flex-col gap-2">
            {links.map((link) => (
              <SidebarLink key={link.label} link={link} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <SidebarLink
            link={{
              label: 'Guided Tour',
              href: '#',
              icon: <Compass className="h-5 w-5 shrink-0 text-neutral-200" />,
              onClick: () => {
                window.dispatchEvent(new CustomEvent('open-guided-tour'));
              },
            }}
          />
          <SidebarLink
            link={{
              label: 'Settings',
              href: '#',
              icon: <User className="h-5 w-5 shrink-0 text-neutral-200" />,
              onClick: () => {
                try {
                  window.dispatchEvent(new CustomEvent('open-settings'));
                } catch {
                  router.push('/settings');
                }
              },
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
