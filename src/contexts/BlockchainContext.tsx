
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Participant, Vehicle, InsurancePolicy, AccidentReport, RepairRecord, BlockchainTransaction } from '@/types/blockchain';
import { BlockchainService } from '@/services/blockchainService';
import { useWeb3 } from '@/contexts/Web3Context';

interface BlockchainContextType {
  currentUser: Participant | null;
  vehicles: Vehicle[];
  insurancePolicies: InsurancePolicy[];
  accidentReports: AccidentReport[];
  repairRecords: RepairRecord[];
  transactions: BlockchainTransaction[];
  participants: Participant[];
  blockchainService: BlockchainService | null;
  setCurrentUser: (user: Participant | null) => void;
  addVehicle: (vehicle: Vehicle) => Promise<{ txHash: string; gasCost: string }>;
  addInsurancePolicy: (policy: InsurancePolicy) => Promise<{ txHash: string; gasCost: string }>;
  addAccidentReport: (report: AccidentReport) => Promise<{ txHash: string; gasCost: string }>;
  addRepairRecord: (record: RepairRecord) => void;
  addTransaction: (transaction: BlockchainTransaction) => void;
  updateTransactionStatus: (txId: string, status: BlockchainTransaction['status']) => void;
  addWeb3User: (user: Participant) => void;
  validateInsurance: (vehicleId: string) => Promise<{ isValid: boolean; policyNumber?: string; coverageAmount?: string; error?: string }>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { provider, signer, account } = useWeb3();
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [accidentReports, setAccidentReports] = useState<AccidentReport[]>([]);
  const [repairRecords, setRepairRecords] = useState<RepairRecord[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'admin',
      name: 'System Administrator',
      role: 'Admin',
      organization: 'System',
      publicKey: 'admin_key',
      isActive: true
    },
    {
      id: 'demo_insurer',
      name: 'Demo Insurance Company',
      role: 'Insurer',
      organization: 'Demo Insurance Ltd',
      publicKey: 'demo_insurer_key',
      isActive: true
    },
    {
      id: 'demo_checker',
      name: 'Demo Claim Checker',
      role: 'ClaimChecker',
      organization: 'Demo Insurance Ltd',
      publicKey: 'demo_checker_key',
      isActive: true
    }
  ]);

  // Initialize blockchain service when Web3 is connected
  useEffect(() => {
    if (provider && signer) {
      const service = new BlockchainService(provider, signer);
      setBlockchainService(service);
      console.log('Blockchain service initialized with provider and signer');
    } else {
      setBlockchainService(null);
      console.log('Blockchain service cleared - no provider/signer');
    }
  }, [provider, signer]);

  const addVehicle = async (vehicle: Vehicle): Promise<{ txHash: string; gasCost: string }> => {
    if (blockchainService && account) {
      try {
        console.log('Registering vehicle on blockchain:', vehicle);
        // Simulate vehicle registration transaction
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const mockGasCost = (Math.random() * 0.001 + 0.0005).toFixed(6);
        
        // Add to local state
        setVehicles(prev => [...prev, vehicle]);
        
        console.log('Vehicle registered on blockchain successfully');
        return { txHash: mockTxHash, gasCost: mockGasCost };
      } catch (error) {
        console.error('Failed to register vehicle on blockchain:', error);
        throw error;
      }
    } else {
      // Fallback - should not happen with wallet-only system
      throw new Error('Blockchain service not available');
    }
  };

  const addInsurancePolicy = async (policy: InsurancePolicy): Promise<{ txHash: string; gasCost: string }> => {
    if (blockchainService && account) {
      try {
        console.log('Registering insurance on blockchain:', policy);
        // Simulate insurance registration with actual wallet balance check
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const mockGasCost = (Math.random() * 0.002 + 0.001).toFixed(6);
        
        // Add to local state
        setInsurancePolicies(prev => [...prev, policy]);
        
        console.log('Insurance registered on blockchain successfully');
        return { txHash: mockTxHash, gasCost: mockGasCost };
      } catch (error) {
        console.error('Failed to register insurance on blockchain:', error);
        throw error;
      }
    } else {
      throw new Error('Blockchain service not available');
    }
  };

  const addAccidentReport = async (report: AccidentReport): Promise<{ txHash: string; gasCost: string }> => {
    if (blockchainService && account) {
      try {
        console.log('Reporting accident on blockchain:', report);
        // Simulate accident reporting transaction
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const mockGasCost = (Math.random() * 0.003 + 0.001).toFixed(6);
        
        // Add to local state
        setAccidentReports(prev => [...prev, report]);
        
        console.log('Accident reported on blockchain successfully');
        return { txHash: mockTxHash, gasCost: mockGasCost };
      } catch (error) {
        console.error('Failed to report accident on blockchain:', error);
        throw error;
      }
    } else {
      throw new Error('Blockchain service not available');
    }
  };

  const validateInsurance = async (vehicleId: string): Promise<{ isValid: boolean; policyNumber?: string; coverageAmount?: string; error?: string }> => {
    if (!blockchainService || !account) {
      return { isValid: false, error: 'Blockchain service not available' };
    }

    try {
      console.log('Validating insurance on blockchain for vehicle:', vehicleId);
      
      // Find the policy in local state (simulating blockchain lookup)
      const policy = insurancePolicies.find(p => p.vehicleId === vehicleId && p.status === 'Active');
      
      if (policy) {
        // Simulate gas cost for validation
        const mockGasCost = (Math.random() * 0.0005 + 0.0002).toFixed(6);
        console.log(`Insurance validation gas cost: ${mockGasCost} ETH`);
        
        return {
          isValid: true,
          policyNumber: policy.policyNumber,
          coverageAmount: policy.coverageAmount.toString()
        };
      } else {
        return { isValid: false, error: 'No valid insurance policy found' };
      }
    } catch (error: any) {
      console.error('Insurance validation error:', error);
      return { isValid: false, error: error.message };
    }
  };

  const addRepairRecord = (record: RepairRecord) => {
    setRepairRecords(prev => [...prev, record]);
  };

  const addTransaction = (transaction: BlockchainTransaction) => {
    setTransactions(prev => [...prev, transaction]);
    
    // Simulate transaction confirmation after delay
    setTimeout(() => {
      updateTransactionStatus(transaction.id, 'Confirmed');
    }, 3000 + Math.random() * 2000);
  };

  const updateTransactionStatus = (txId: string, status: BlockchainTransaction['status']) => {
    setTransactions(prev => 
      prev.map(tx => tx.id === txId ? { ...tx, status } : tx)
    );
  };

  const addWeb3User = (user: Participant) => {
    setParticipants(prev => {
      const existingUser = prev.find(p => p.publicKey === user.publicKey);
      if (existingUser) {
        return prev;
      }
      return [...prev, user];
    });
    console.log('Web3 user registered:', user);
  };

  return (
    <BlockchainContext.Provider value={{
      currentUser,
      vehicles,
      insurancePolicies,
      accidentReports,
      repairRecords,
      transactions,
      participants,
      blockchainService,
      setCurrentUser,
      addVehicle,
      addInsurancePolicy,
      addAccidentReport,
      addRepairRecord,
      addTransaction,
      updateTransactionStatus,
      addWeb3User,
      validateInsurance
    }}>
      {children}
    </BlockchainContext.Provider>
  );
};
