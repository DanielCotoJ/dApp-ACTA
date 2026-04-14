'use client';

import { useRouter } from 'next/navigation';

export function useQuickStart() {
  const router = useRouter();

  function onStepClick(step: string) {
    if (step === '01') {
      router.push('/dashboard/settings');
      return;
    }
    if (step === '02') {
      router.push('/dashboard/credentials');
      return;
    }
    if (step === '03') {
      router.push('/dashboard/authorize');
      return;
    }
    if (step === '04') {
      router.push('/dashboard/issue');
      return;
    }
  }

  const steps = [
    {
      number: '01',
      title: 'Connect your wallet and choose a network',
      description: 'Link your Web3 wallet to get started',
    },
    {
      number: '02',
      title: 'Create your personal vault',
      description: 'Secure storage for your credentials',
    },
    {
      number: '03',
      title: 'Authorize wallets to issue credentials',
      description: 'Grant permissions to trusted wallets',
    },
    {
      number: '04',
      title: 'Start issuing and managing credentials',
      description: 'Full control over your digital identity',
    },
  ];

  return { steps, onStepClick };
}

export default useQuickStart;
