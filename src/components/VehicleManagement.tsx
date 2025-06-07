
import React, { useState } from 'react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Vehicle } from '@/types/blockchain';
import { Plus, Car, Calendar, Hash } from 'lucide-react';
import { generateHash, createTransaction } from '@/utils/blockchain';
import { toast } from 'sonner';

const VehicleManagement = () => {
  const { currentUser, vehicles, addVehicle, addTransaction, insurancePolicies } = useBlockchain();
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    registrationNumber: ''
  });

  if (!currentUser) return null;

  const userVehicles = vehicles.filter(v => v.ownerId === currentUser.id);

  const handleAddVehicle = async () => {
    if (!formData.vin || !formData.make || !formData.model || !formData.year || !formData.registrationNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    const newVehicle: Vehicle = {
      id: `vehicle_${generateHash(formData.vin + Date.now())}`,
      vin: formData.vin,
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
      ownerId: currentUser.id,
      registrationNumber: formData.registrationNumber
    };

    // Create blockchain transaction
    const transaction = createTransaction(
      'RegisterInsurance', // Using for vehicle registration
      currentUser.id,
      newVehicle
    );

    try {
      addVehicle(newVehicle);
      addTransaction(transaction);
      
      setFormData({
        vin: '',
        make: '',
        model: '',
        year: '',
        registrationNumber: ''
      });
      setIsAddingVehicle(false);
      
      toast.success('Vehicle registered successfully on blockchain');
    } catch (error) {
      toast.error('Failed to register vehicle');
      console.error('Error registering vehicle:', error);
    }
  };

  const getVehicleInsurance = (vehicleId: string) => {
    return insurancePolicies.find(p => p.vehicleId === vehicleId && p.status === 'Active');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vehicle Management</h2>
        {currentUser.role === 'VehicleOwner' && (
          <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Register Vehicle</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vin">VIN Number</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                    placeholder="Enter VIN number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={formData.make}
                      onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="Honda, Toyota, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Civic, Camry, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registration">Registration Number</Label>
                    <Input
                      id="registration"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      placeholder="ABC123"
                    />
                  </div>
                </div>
                <Button onClick={handleAddVehicle} className="w-full">
                  Register Vehicle on Blockchain
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userVehicles.map((vehicle) => {
          const insurance = getVehicleInsurance(vehicle.id);
          
          return (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="w-5 h-5" />
                    <span>{vehicle.make} {vehicle.model}</span>
                  </CardTitle>
                  <Badge variant={insurance ? 'default' : 'destructive'}>
                    {insurance ? 'Insured' : 'Uninsured'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Year: {vehicle.year}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Reg: {vehicle.registrationNumber}</span>
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    VIN: {vehicle.vin}
                  </div>
                  
                  {insurance && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Policy: {insurance.policyNumber}
                      </p>
                      <p className="text-xs text-green-600">
                        Valid until: {new Date(insurance.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-green-600">
                        Coverage: ${insurance.coverageAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userVehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles registered</h3>
            <p className="text-gray-500 mb-4">
              Register your first vehicle to get started with the insurance system.
            </p>
            {currentUser.role === 'VehicleOwner' && (
              <Button onClick={() => setIsAddingVehicle(true)}>
                Register Vehicle
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleManagement;
