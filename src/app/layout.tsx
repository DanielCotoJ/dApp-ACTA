import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { WalletProvider } from '@/providers/wallet.provider';
import { NetworkProvider } from '@/providers/network.provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query.provider';

export const metadata: Metadata = {
  title: 'ACTA',
  description: 'ACTA dApp - Decentralized Application for ACTA',
  icons: {
    icon: [
      { url: '/black.png', media: '(prefers-color-scheme: light)' },
      { url: '/logo.png', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: ['/black.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(()=>{try{const s=localStorage.getItem("theme");const isDark = s ? s === "dark" : true;document.documentElement.classList.toggle("dark", isDark);}catch(e){document.documentElement.classList.add("dark");}})();`}
        </Script>
      </head>
      <body className={`antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <NetworkProvider>
            <WalletProvider>
              {children}
              <Toaster />
            </WalletProvider>
          </NetworkProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
