
import React, { useState } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RepairRecord } from '@/types/blockchain';
import { Plus, Wrench, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { generateHash, createTransaction, generateECCSignature } from '@/utils/blockchain';
import { toast } from 'sonner';

const RepairManagement = () => {
  const { 
    currentUser, 
    vehicles, 
    accidentReports, 
    repairRecords, 
    addRepairRecord, 
    addTransaction,
    participants 
  } = useBlockchain();
  
  const [isCreatingRepair, setIsCreatingRepair] = useState(false);
  const [formData, setFormData] = useState({
    accidentReportId: '',
    estimatedCost: '',
    description: ''
  });

  if (!currentUser) return null;

  const canCreateRepair = currentUser.role === 'RepairShop';
  const relevantRepairs = currentUser.role === 'RepairShop'
    ? repairRecords.filter(r => r.repairShopId === currentUser.id)
    : repairRecords.filter(r => {
        const accident = accidentReports.find(a => a.id === r.accidentReportId);
        if (!accident) return false;
        const vehicle = vehicles.find(v => v.id === accident.vehicleId);
        return vehicle?.ownerId === currentUser.id;
      });

  const verifiedAccidents = accidentReports.filter(r => r.status === 'Verified');

  const handleCreateRepair = async () => {
    if (!formData.accidentReportId || !formData.estimatedCost) {
      toast.error('Please fill in all required fields');
      return;
    }

    const accident = accidentReports.find(a => a.id === formData.accidentReportId);
    if (!accident) {
      toast.error('Selected accident report not found');
      return;
    }

    try {
      const newRepair: RepairRecord = {
        id: `repair_${generateHash(formData.accidentReportId + Date.now())}`,
        vehicleId: accident.vehicleId,
        accidentReportId: formData.accidentReportId,
        repairShopId: currentUser.id,
        estimatedCost: parseInt(formData.estimatedCost),
        startDate: new Date().toISOString(),
        status: 'Estimated',
        approvals: [{
          approverId: currentUser.id,
          approverRole: currentUser.role,
          timestamp: new Date().toISOString(),
          signature: generateECCSignature(formData.accidentReportId + formData.estimatedCost, 'repair_shop_key'),
          status: 'Approved',
          comments: 'Initial repair estimate created'
        }],
        documents: []
      };

      const transaction = createTransaction(
        'RepairVehicle',
        currentUser.id,
        newRepair,
        [accident.reporterId]
      );

      addRepairRecord(newRepair);
      addTransaction(transaction);
      
      setFormData({
        accidentReportId: '',
        estimatedCost: '',
        description: ''
      });
      setIsCreatingRepair(false);
      
      toast.success('Repair estimate created successfully');
    } catch (error) {
      toast.error('Failed to create repair estimate');
      console.error('Error creating repair:', error);
    }
  };

  const handleApproveRepair = async (repairId: string) => {
    try {
      const transaction = createTransaction(
        'ApproveClaim',
        currentUser.id,
        { repairId, action: 'approve' }
      );

      addTransaction(transaction);
      toast.success('Repair approved successfully');
    } catch (error) {
      toast.error('Failed to approve repair');
      console.error('Error approving repair:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Estimated': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Repair Management</h2>
        {canCreateRepair && (
          <Dialog open={isCreatingRepair} onOpenChange={setIsCreatingRepair}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Repair Estimate</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Repair Estimate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accident">Select Accident Report</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, accidentReportId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose accident report" />
                    </SelectTrigger>
                    <SelectContent>
                      {verifiedAccidents.map((accident) => {
                        const vehicle = vehicles.find(v => v.id === accident.vehicleId);
                        return (
                          <SelectItem key={accident.id} value={accident.id}>
                            {vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.registrationNumber}` : 'Unknown Vehicle'} ({accident.severity})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cost">Estimated Repair Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder="5000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Repair Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of repairs needed..."
                    rows={4}
                  />
                </div>
                
                <Button onClick={handleCreateRepair} className="w-full">
                  Create Repair Estimate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relevantRepairs.map((repair) => {
          const accident = accidentReports.find(a => a.id === repair.accidentReportId);
          const vehicle = vehicles.find(v => v.id === repair.vehicleId);
          const repairShop = participants.find(p => p.id === repair.repairShopId);
          
          return (
            <Card key={repair.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Wrench className="w-5 h-5" />
                    <span className="text-sm">Repair Job</span>
                  </CardTitle>
                  <Badge className={getStatusColor(repair.status)}>
                    {repair.status}
                  </Badge>
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
                      Estimate: ${repair.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                  
                  {repair.actualCost && (
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">
                        Actual: ${repair.actualCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Started: {new Date(repair.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {repair.completionDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">
                        Completed: {new Date(repair.completionDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {accident && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Related to {accident.severity.toLowerCase()} accident at {accident.location}
                    </div>
                  )}
                  
                  {repairShop && currentUser.role !== 'RepairShop' && (
                    <div className="text-xs text-gray-500">
                      Repair Shop: {repairShop.name}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Approvals: {repair.approvals.filter(a => a.status === 'Approved').length}/{repair.approvals.length}
                  </div>
                  
                  {repair.status === 'Estimated' && currentUser.role === 'VehicleOwner' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveRepair(repair.id)}
                      className="w-full mt-2"
                    >
                      Approve Repair
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {relevantRepairs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repair records</h3>
            <p className="text-gray-500 mb-4">
              {canCreateRepair 
                ? 'No repair estimates have been created yet.'
                : 'No repairs have been requested for your vehicles.'
              }
            </p>
            {canCreateRepair && verifiedAccidents.length > 0 && (
              <Button onClick={() => setIsCreatingRepair(true)}>
                Create Repair Estimate
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RepairManagement;
