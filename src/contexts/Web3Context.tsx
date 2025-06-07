
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  balance: string | null;
  networkId: number | null;
  estimateGas: (transaction: any) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(accounts[0].address);
          
          setAccount(accounts[0].address);
          setIsConnected(true);
          setProvider(provider);
          setSigner(signer);
          setBalance(ethers.formatEther(balance));
          setNetworkId(Number(network.chainId));
        }
      } catch (error) {
        console.error('Error checking MetaMask connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          updateBalance(accounts[0]);
        } else {
          disconnect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  };

  const updateBalance = async (address: string) => {
    if (provider) {
      try {
        const balance = await provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);
      
      setAccount(address);
      setIsConnected(true);
      setProvider(provider);
      setSigner(signer);
      setBalance(ethers.formatEther(balance));
      setNetworkId(Number(network.chainId));
      
      console.log('MetaMask connected:', address);
      console.log('Network:', network.name, 'Chain ID:', network.chainId);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const estimateGas = async (transaction: any): Promise<string> => {
    if (!provider || !signer) {
      throw new Error('Provider not connected');
    }

    try {
      const gasEstimate = await provider.estimateGas(transaction);
      const gasPrice = (await provider.getFeeData()).gasPrice;
      const gasCost = gasEstimate * (gasPrice || BigInt(0));
      return ethers.formatEther(gasCost);
    } catch (error) {
      console.error('Gas estimation error:', error);
      return '0.001'; // Fallback estimate
    }
  };

  const sendTransaction = async (transaction: any): Promise<string> => {
    if (!signer) {
      throw new Error('Signer not available');
    }

    try {
      const tx = await signer.sendTransaction(transaction);
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed:', tx.hash);
      
      // Update balance after transaction
      if (account) {
        await updateBalance(account);
      }
      
      return tx.hash;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setBalance(null);
    setNetworkId(null);
  };

  return (
    <Web3Context.Provider value={{
      account,
      isConnected,
      isConnecting,
      connect,
      disconnect,
      provider,
      signer,
      balance,
      networkId,
      estimateGas,
      sendTransaction
    }}>
      {children}
    </Web3Context.Provider>
  );
};
