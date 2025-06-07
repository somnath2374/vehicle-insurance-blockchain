
import React from 'react';
import { BlockchainProvider, useBlockchain } from '@/contexts/BlockchainContext';
import { Web3Provider } from '@/contexts/Web3Context';
import RoleSelector from '@/components/RoleSelector';
import Dashboard from '@/components/Dashboard';

const AppContent = () => {
  const { currentUser } = useBlockchain();
  
  return currentUser ? <Dashboard /> : <RoleSelector />;
};

const Index = () => {
  return (
    <Web3Provider>
      <BlockchainProvider>
        <AppContent />
      </BlockchainProvider>
    </Web3Provider>
  );
};

export default Index;
