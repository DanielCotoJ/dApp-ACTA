'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  AlbedoModule,
} from '@creit.tech/stellar-wallets-kit';
import {
  WalletConnectModule,
  WalletConnectAllowedMethods,
} from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';
import { useNetwork } from '@/providers/network.provider';

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  authMethod: 'wallet' | null;
  setWalletInfo: (address: string, name: string) => Promise<void>;
  clearWalletInfo: () => void;
  signTransaction:
    | ((xdr: string, options: { networkPassphrase: string }) => Promise<string>)
    | null;
  walletKit: StellarWalletsKit | null;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  // Initialize to null so SSR and the first client render match; hydrate from
  // localStorage in useEffect after mount to avoid hydration mismatches.
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'wallet' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedAddr = localStorage.getItem('walletAddress');
    const storedName = localStorage.getItem('walletName');
    if (storedAddr) {
      // Hydrating from external storage (localStorage); setting state here is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWalletAddress(storedAddr);
      setWalletName(storedName);
      setAuthMethod('wallet');
    }
  }, []);
  const { network } = useNetwork();
  const walletKit = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const net = network === 'mainnet' ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET;
      return new StellarWalletsKit({
        network: net,
        selectedWalletId: FREIGHTER_ID,
        modules: [
          new FreighterModule(),
          new AlbedoModule(),
          new WalletConnectModule({
            url: 'https://dapp.acta.build',
            projectId: '3a91e3876dc1b53df126947b152c4e16',
            method: WalletConnectAllowedMethods.SIGN,
            description: 'ACTA dApp',
            name: 'ACTA dApp',
            icons: ['https://dapp.acta.build/logo.png'],
            network: net,
          }),
        ],
      });
    } catch {
      return null;
    }
  }, [network]);

  const setWalletInfo = async (address: string, name: string) => {
    setWalletAddress(address);
    setWalletName(name);
    setAuthMethod('wallet');
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('walletName', name);
    }
  };

  const clearWalletInfo = () => {
    setWalletAddress(null);
    setWalletName(null);
    setAuthMethod(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('walletName');
    }
  };

  const signTransaction = async (xdr: string, options: { networkPassphrase: string }) => {
    if (!walletKit) throw new Error('WalletKit unavailable');
    const { signedTxXdr } = await walletKit.signTransaction(xdr, {
      address: walletAddress || undefined,
      networkPassphrase: options.networkPassphrase,
    });
    return signedTxXdr;
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName,
        authMethod,
        setWalletInfo,
        clearWalletInfo,
        signTransaction: walletAddress && walletKit ? signTransaction : null,
        walletKit,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
};
