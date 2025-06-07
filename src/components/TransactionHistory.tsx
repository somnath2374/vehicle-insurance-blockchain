
import React from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlockchainTransaction } from '@/types/blockchain';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Hash, 
  Users, 
  FileText,
  Shield,
  Car,
  AlertTriangle,
  Wrench
} from 'lucide-react';

const TransactionHistory = () => {
  const { currentUser, transactions, participants } = useBlockchain();

  if (!currentUser) return null;

  const userTransactions = transactions.filter(tx => 
    tx.participants.includes(currentUser.id)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'RegisterInsurance': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'ReportAccident': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'ValidateInsurance': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'RepairVehicle': return <Wrench className="w-5 h-5 text-purple-500" />;
      case 'ApproveClaim': return <FileText className="w-5 h-5 text-orange-500" />;
      default: return <Hash className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getParticipantName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant ? participant.name : 'Unknown';
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'RegisterInsurance': return 'Insurance Registration';
      case 'ReportAccident': return 'Accident Report';
      case 'ValidateInsurance': return 'Insurance Validation';
      case 'RepairVehicle': return 'Vehicle Repair';
      case 'ApproveClaim': return 'Claim Approval';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blockchain Transaction History</h2>
        <div className="text-sm text-gray-500">
          Total Transactions: {userTransactions.length}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {userTransactions.filter(tx => tx.status === 'Confirmed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {userTransactions.filter(tx => tx.status === 'Pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {userTransactions.filter(tx => tx.status === 'Failed').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {userTransactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {formatTransactionType(transaction.type)}
                      </h3>
                      <Badge className={getStatusColor(transaction.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(transaction.status)}
                          <span>{transaction.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Hash className="w-3 h-3" />
                          <span>Block #{transaction.blockNumber}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>Participants: </span>
                        <span>{transaction.participants.map(getParticipantName).join(', ')}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500 font-mono break-all">
                        TX Hash: {transaction.hash}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
              
              {/* Transaction Payload Preview */}
              {transaction.payload && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Transaction Data:</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {JSON.stringify(transaction.payload, null, 2).substring(0, 200)}
                    {JSON.stringify(transaction.payload).length > 200 && '...'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {userTransactions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500">
              Your blockchain transactions will appear here once you start using the system.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionHistory;
