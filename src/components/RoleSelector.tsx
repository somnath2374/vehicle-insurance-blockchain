
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Participant } from '@/types/blockchain';
import { Car, Shield, AlertTriangle, Wrench, User, Wallet, UserCog, CheckCircle } from 'lucide-react';
import MetaMaskLogin from './MetaMaskLogin';
import AdminLogin from './AdminLogin';

const RoleSelector = () => {
  const { participants, setCurrentUser } = useBlockchain();
  const [activeTab, setActiveTab] = useState('metamask');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'VehicleOwner': return <Car className="w-6 h-6" />;
      case 'Police': return <Shield className="w-6 h-6" />;
      case 'Insurer': return <AlertTriangle className="w-6 h-6" />;
      case 'InsuranceAdjuster': return <AlertTriangle className="w-6 h-6" />;
      case 'RepairShop': return <Wrench className="w-6 h-6" />;
      case 'ClaimChecker': return <CheckCircle className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'VehicleOwner': return 'bg-blue-500 hover:bg-blue-600';
      case 'Police': return 'bg-red-500 hover:bg-red-600';
      case 'Insurer': return 'bg-green-500 hover:bg-green-600';
      case 'InsuranceAdjuster': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'RepairShop': return 'bg-purple-500 hover:bg-purple-600';
      case 'ClaimChecker': return 'bg-orange-500 hover:bg-orange-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Blockchain Vehicle Insurance System
          </CardTitle>
          <p className="text-gray-600">
            Connect your wallet or login to access the system
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metamask" className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>MetaMask Login</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center space-x-2">
                <UserCog className="w-4 h-4" />
                <span>Admin Login</span>
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Demo Users</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metamask" className="mt-6 flex justify-center">
              <MetaMaskLogin />
            </TabsContent>

            <TabsContent value="admin" className="mt-6 flex justify-center">
              <AdminLogin />
            </TabsContent>

            <TabsContent value="demo" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.filter(p => p.id !== 'admin').map((participant) => (
                  <Button
                    key={participant.id}
                    onClick={() => setCurrentUser(participant)}
                    className={`h-24 flex flex-col items-center justify-center space-y-2 text-white ${getRoleColor(participant.role)}`}
                  >
                    {getRoleIcon(participant.role)}
                    <div className="text-center">
                      <div className="font-semibold">{participant.name}</div>
                      <div className="text-sm opacity-90">{participant.role}</div>
                      <div className="text-xs opacity-75">{participant.organization}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">System Features:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• MetaMask wallet integration for decentralized identity</li>
              <li>• Blockchain-based vehicle and insurance registration</li>
              <li>• Smart contract validation with real gas costs</li>
              <li>• Secure accident reporting with document hashing</li>
              <li>• Multi-signature claim approvals and checking</li>
              <li>• Immutable repair records and tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelector;
