
import React, { useState } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InsurancePolicy } from '@/types/blockchain';
import { Plus, Shield, Calendar, DollarSign, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { generateHash, createTransaction } from '@/utils/blockchain';
import { toast } from 'sonner';
import { useWeb3 } from '@/contexts/Web3Context';

const InsuranceManagement = () => {
  const { currentUser, vehicles, insurancePolicies, addInsurancePolicy, addTransaction, blockchainService, validateInsurance } = useBlockchain();
  const { isConnected, balance, account } = useWeb3();
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [gasEstimate, setGasEstimate] = useState<string>('');
  const [validatingVehicleId, setValidatingVehicleId] = useState<string>('');
  const [formData, setFormData] = useState({
    vehicleId: '',
    coverageAmount: '',
    premium: '',
    coverageType: [] as string[]
  });

  if (!currentUser) return null;

  const availableVehicles = currentUser.role === 'VehicleOwner' 
    ? vehicles.filter(v => v.ownerId === currentUser.id && !v.currentInsurancePolicyId)
    : vehicles;

  const relevantPolicies = currentUser.role === 'VehicleOwner'
    ? insurancePolicies.filter(p => p.ownerId === currentUser.id)
    : currentUser.role === 'ClaimChecker' 
    ? insurancePolicies
    : insurancePolicies.filter(p => p.insurerId === currentUser.id);

  const handleValidateInsurance = async (vehicleId: string) => {
    if (!isConnected || !account) {
      toast.error('Please connect your MetaMask wallet first');
      return;
    }

    setIsValidating(true);
    setValidatingVehicleId(vehicleId);
    setValidationResult(null);
    
    try {
      console.log('Validating insurance for vehicle:', vehicleId);
      const result = await validateInsurance(vehicleId);
      console.log('Validation result:', result);
      
      setValidationResult({ ...result, vehicleId });
      
      if (result.isValid) {
        toast.success(`✅ Valid insurance found!\nPolicy: ${result.policyNumber}\nCoverage: $${result.coverageAmount}`);
      } else {
        toast.error(`❌ ${result.error || 'No valid insurance found'}`);
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      setValidationResult({ isValid: false, error: error.message, vehicleId });
      toast.error(`Validation failed: ${error.message}`);
    } finally {
      setIsValidating(false);
      setValidatingVehicleId('');
    }
  };

  const estimateGasForPolicy = async () => {
    if (formData.vehicleId && formData.coverageAmount && formData.premium) {
      // Simulate gas estimation based on transaction complexity
      const baseGas = 0.002;
      const complexityFactor = parseInt(formData.coverageAmount) / 100000;
      const estimatedGas = (baseGas + complexityFactor * 0.001).toFixed(6);
      setGasEstimate(estimatedGas);
    }
  };

  const handleCreatePolicy = async () => {
    if (!formData.vehicleId || !formData.coverageAmount || !formData.premium) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isConnected || !account) {
      toast.error('Please connect your MetaMask wallet to proceed');
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    if (!selectedVehicle) {
      toast.error('Selected vehicle not found');
      return;
    }

    const newPolicy: InsurancePolicy = {
      id: `policy_${generateHash(formData.vehicleId + Date.now())}`,
      vehicleId: formData.vehicleId,
      ownerId: selectedVehicle.ownerId,
      insurerId: currentUser.id,
      policyNumber: `POL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      coverageAmount: parseInt(formData.coverageAmount),
      premium: parseInt(formData.premium),
      status: 'Active',
      coverageType: formData.coverageType.length > 0 ? formData.coverageType : ['Liability']
    };

    try {
      toast.loading('Creating insurance policy on blockchain...');
      
      const result = await addInsurancePolicy(newPolicy);
      
      const transaction = createTransaction(
        'RegisterInsurance',
        currentUser.id,
        { ...newPolicy, txHash: result.txHash, gasCost: result.gasCost },
        [selectedVehicle.ownerId]
      );

      addTransaction(transaction);
      
      setFormData({
        vehicleId: '',
        coverageAmount: '',
        premium: '',
        coverageType: []
      });
      setIsCreatingPolicy(false);
      setGasEstimate('');
      
      toast.success(`Insurance policy created! TX: ${result.txHash.slice(0, 10)}... Gas: ${result.gasCost} ETH`);
    } catch (error: any) {
      toast.error(`Failed to create insurance policy: ${error.message}`);
      console.error('Error creating policy:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Insurance Management</h2>
        <div className="flex space-x-3">
          {(currentUser.role === 'Insurer' || currentUser.role === 'InsuranceAdjuster') && (
            <Dialog open={isCreatingPolicy} onOpenChange={setIsCreatingPolicy}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Policy</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Insurance Policy on Blockchain</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {!isConnected && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">Connect MetaMask to interact with blockchain</p>
                    </div>
                  )}
                  
                  {isConnected && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        Wallet: {account?.slice(0, 6)}...{account?.slice(-4)}
                      </p>
                      <p className="text-sm text-blue-800">
                        Balance: <span className="font-semibold">{balance} ETH</span>
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="vehicle">Select Vehicle</Label>
                    <Select onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, vehicleId: value }));
                      estimateGasForPolicy();
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} - {vehicle.registrationNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coverage">Coverage Amount ($)</Label>
                      <Input
                        id="coverage"
                        type="number"
                        value={formData.coverageAmount}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, coverageAmount: e.target.value }));
                          estimateGasForPolicy();
                        }}
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="premium">Annual Premium ($)</Label>
                      <Input
                        id="premium"
                        type="number"
                        value={formData.premium}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, premium: e.target.value }));
                          estimateGasForPolicy();
                        }}
                        placeholder="1200"
                      />
                    </div>
                  </div>

                  {gasEstimate && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-800">
                        Estimated Gas Cost: <span className="font-semibold">{gasEstimate} ETH</span>
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleCreatePolicy} 
                    className="w-full"
                    disabled={!isConnected || !formData.vehicleId || !formData.coverageAmount || !formData.premium}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Create Policy on Blockchain
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {validationResult && (
        <Card className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {validationResult.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <h3 className={`font-semibold ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                Blockchain Validation Result for Vehicle {validationResult.vehicleId}
              </h3>
            </div>
            <div className={`mt-2 text-sm ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
              <p><strong>Valid:</strong> {validationResult.isValid ? 'Yes' : 'No'}</p>
              {validationResult.isValid ? (
                <>
                  <p><strong>Policy Number:</strong> {validationResult.policyNumber}</p>
                  <p><strong>Coverage:</strong> ${validationResult.coverageAmount}</p>
                </>
              ) : (
                <p><strong>Reason:</strong> {validationResult.error || 'No valid insurance policy found on blockchain'}</p>
              )}
            </div>
            <Button 
              onClick={() => setValidationResult(null)}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              Clear Result
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relevantPolicies.map((policy) => {
          const vehicle = vehicles.find(v => v.id === policy.vehicleId);
          const isExpiringSoon = new Date(policy.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          
          return (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>{policy.policyNumber}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(policy.status)}>
                      {policy.status}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600">
                      On-Chain
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vehicle && (
                    <div className="text-sm">
                      <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                      <div className="text-gray-500">{vehicle.registrationNumber}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Coverage: ${policy.coverageAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Premium: ${policy.premium.toLocaleString()}/year
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Valid: {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}
                  </div>
                  
                  {isExpiringSoon && policy.status === 'Active' && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      ⚠️ Expires within 30 days
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {policy.coverageType.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>

                  {(currentUser.role === 'ClaimChecker' || currentUser.role === 'Insurer') && (
                    <Button 
                      onClick={() => handleValidateInsurance(policy.vehicleId)}
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      disabled={isValidating && validatingVehicleId === policy.vehicleId || !isConnected}
                    >
                      {isValidating && validatingVehicleId === policy.vehicleId ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full mr-1"></div>
                          Validating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Validate on Blockchain
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {relevantPolicies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insurance policies</h3>
            <p className="text-gray-500 mb-4">
              {currentUser.role === 'VehicleOwner' 
                ? 'You don\'t have any insurance policies yet.'
                : currentUser.role === 'ClaimChecker'
                ? 'No policies available for checking.'
                : 'No policies have been created yet.'
              }
            </p>
            {(currentUser.role === 'Insurer' || currentUser.role === 'InsuranceAdjuster') && (
              <Button onClick={() => setIsCreatingPolicy(true)}>
                Create Policy
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsuranceManagement;
