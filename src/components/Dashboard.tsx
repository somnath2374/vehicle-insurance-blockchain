
import React, { useState } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Shield, 
  AlertTriangle, 
  Wrench, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  LogOut
} from 'lucide-react';
import VehicleManagement from './VehicleManagement';
import InsuranceManagement from './InsuranceManagement';
import AccidentReporting from './AccidentReporting';
import RepairManagement from './RepairManagement';
import TransactionHistory from './TransactionHistory';

const Dashboard = () => {
  const { currentUser, setCurrentUser, vehicles, insurancePolicies, accidentReports, repairRecords, transactions } = useBlockchain();
  const [activeTab, setActiveTab] = useState('overview');

  if (!currentUser) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': case 'confirmed': case 'completed': case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'expired': case 'failed': case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableTabs = () => {
    const baseTabs = ['overview', 'transactions'];
    
    switch (currentUser.role) {
      case 'VehicleOwner':
        return [...baseTabs, 'vehicles', 'insurance'];
      case 'Police':
        return [...baseTabs, 'accidents'];
      case 'Insurer':
      case 'InsuranceAdjuster':
        return [...baseTabs, 'insurance', 'accidents'];
      case 'RepairShop':
        return [...baseTabs, 'repairs'];
      default:
        return baseTabs;
    }
  };

  const renderOverviewStats = () => {
    const userVehicles = vehicles.filter(v => v.ownerId === currentUser.id);
    const userPolicies = insurancePolicies.filter(p => p.ownerId === currentUser.id || p.insurerId === currentUser.id);
    const userReports = accidentReports.filter(r => r.reporterId === currentUser.id);
    const userRepairs = repairRecords.filter(r => r.repairShopId === currentUser.id);
    const userTransactions = transactions.filter(t => t.participants.includes(currentUser.id));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {currentUser.role === 'VehicleOwner' && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Vehicles</p>
                    <p className="text-2xl font-bold">{userVehicles.length}</p>
                  </div>
                  <Car className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Policies</p>
                    <p className="text-2xl font-bold">{userPolicies.filter(p => p.status === 'Active').length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
        
        {(currentUser.role === 'Police' || currentUser.role === 'Insurer') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accident Reports</p>
                  <p className="text-2xl font-bold">{userReports.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        )}
        
        {currentUser.role === 'RepairShop' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Repair Jobs</p>
                  <p className="text-2xl font-bold">{userRepairs.length}</p>
                </div>
                <Wrench className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Transactions</p>
                <p className="text-2xl font-bold">{userTransactions.length}</p>
              </div>
              <FileText className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Insurance System Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {currentUser.name} ({currentUser.role})
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setCurrentUser(null)}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Role</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {getAvailableTabs().includes('vehicles') && (
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            )}
            {getAvailableTabs().includes('insurance') && (
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
            )}
            {getAvailableTabs().includes('accidents') && (
              <TabsTrigger value="accidents">Accidents</TabsTrigger>
            )}
            {getAvailableTabs().includes('repairs') && (
              <TabsTrigger value="repairs">Repairs</TabsTrigger>
            )}
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {renderOverviewStats()}
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          {tx.status === 'Confirmed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : tx.status === 'Failed' ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {getAvailableTabs().includes('vehicles') && (
            <TabsContent value="vehicles" className="mt-6">
              <VehicleManagement />
            </TabsContent>
          )}

          {getAvailableTabs().includes('insurance') && (
            <TabsContent value="insurance" className="mt-6">
              <InsuranceManagement />
            </TabsContent>
          )}

          {getAvailableTabs().includes('accidents') && (
            <TabsContent value="accidents" className="mt-6">
              <AccidentReporting />
            </TabsContent>
          )}

          {getAvailableTabs().includes('repairs') && (
            <TabsContent value="repairs" className="mt-6">
              <RepairManagement />
            </TabsContent>
          )}

          <TabsContent value="transactions" className="mt-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
