
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeb3 } from '@/contexts/Web3Context';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Wallet, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MetaMaskLogin = () => {
  const { account, isConnected, isConnecting, connect, balance, networkId } = useWeb3();
  const { setCurrentUser, participants, addWeb3User } = useBlockchain();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 5: return 'Goerli Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Polygon Mumbai';
      default: return 'Unknown Network';
    }
  };

  const getNetworkColor = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'bg-green-100 text-green-800';
      case 11155111: 
      case 5: return 'bg-yellow-100 text-yellow-800';
      case 137: return 'bg-purple-100 text-purple-800';
      case 80001: return 'bg-blue-100 text-blue-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const handleMetaMaskLogin = async () => {
    if (!isConnected || !account) {
      await connect();
      return;
    }
    
    setIsLoggingIn(true);
    try {
      // Check if user already exists or create new one
      let user = participants.find(p => p.publicKey === account);
      
      if (!user) {
        // Auto-register new MetaMask user as VehicleOwner
        user = {
          id: `metamask_${account.slice(-8)}`,
          name: `User ${account.slice(0, 6)}...${account.slice(-4)}`,
          role: 'VehicleOwner' as const,
          organization: 'MetaMask User',
          publicKey: account,
          isActive: true
        };
        addWeb3User(user);
      }
      
      setCurrentUser(user);
      console.log('MetaMask user logged in:', user);
      console.log('Wallet Balance:', balance, 'ETH');
      console.log('Network:', getNetworkName(networkId));
    } catch (error) {
      console.error('Error during MetaMask login:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isConnected && account) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-green-700 flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>MetaMask Connected</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Wallet Address:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all border">
                {account}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <p className="text-sm text-gray-600">Balance</p>
                <p className="font-semibold text-lg text-blue-600">
                  {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Network</p>
                <Badge className={getNetworkColor(networkId)}>
                  {getNetworkName(networkId)}
                </Badge>
              </div>
            </div>
            
            {networkId && ![1, 11155111, 5, 137, 80001].includes(networkId) && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-xs text-yellow-800">
                  You're on an unsupported network. Switch to Ethereum or Polygon for full functionality.
                </p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleMetaMaskLogin}
            disabled={isLoggingIn}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Continue as MetaMask User
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            You'll be able to interact with smart contracts and pay gas fees using this wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-blue-700">
          Connect MetaMask Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={connect}
          disabled={isConnecting}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting to MetaMask...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect MetaMask Wallet
            </>
          )}
        </Button>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Real Blockchain Features:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Real ETH transactions with gas costs</li>
            <li>• Smart contract interactions</li>
            <li>• Automatic insurance validation</li>
            <li>• Immutable accident records</li>
            <li>• Decentralized identity management</li>
          </ul>
        </div>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Make sure you have MetaMask installed and some ETH for transaction fees
        </p>
      </CardContent>
    </Card>
  );
};

export default MetaMaskLogin;
