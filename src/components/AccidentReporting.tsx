
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
import { AccidentReport } from '@/types/blockchain';
import { Plus, AlertTriangle, MapPin, Clock, FileText } from 'lucide-react';
import { generateHash, createTransaction, uploadDocument } from '@/utils/blockchain';
import { toast } from 'sonner';

const AccidentReporting = () => {
  const { currentUser, vehicles, accidentReports, addAccidentReport, addTransaction, participants } = useBlockchain();
  const [isReporting, setIsReporting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    location: '',
    description: '',
    severity: 'Minor' as 'Minor' | 'Moderate' | 'Severe',
    witnesses: [] as string[]
  });
  const [documents, setDocuments] = useState<File[]>([]);

  if (!currentUser) return null;

  const canReport = currentUser.role === 'Police' || currentUser.role === 'VehicleOwner';
  const relevantReports = currentUser.role === 'Police' 
    ? accidentReports.filter(r => r.reporterId === currentUser.id)
    : currentUser.role === 'VehicleOwner'
    ? accidentReports.filter(r => {
        const vehicle = vehicles.find(v => v.id === r.vehicleId);
        return vehicle?.ownerId === currentUser.id;
      })
    : accidentReports;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setDocuments(prev => [...prev, ...files]);
  };

  const handleReportAccident = async () => {
    if (!formData.vehicleId || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Upload documents and generate hashes
      const documentHashes = await Promise.all(
        documents.map(file => uploadDocument(file, currentUser.id, 'accident_evidence'))
      );

      const newReport: AccidentReport = {
        id: `accident_${generateHash(formData.vehicleId + Date.now())}`,
        vehicleId: formData.vehicleId,
        reporterId: currentUser.id,
        reporterRole: currentUser.role,
        location: formData.location,
        dateTime: new Date().toISOString(),
        description: formData.description,
        severity: formData.severity,
        witnesses: formData.witnesses,
        documents: documentHashes,
        status: 'Reported'
      };

      const transaction = createTransaction(
        'ReportAccident',
        currentUser.id,
        newReport,
        formData.witnesses
      );

      addAccidentReport(newReport);
      addTransaction(transaction);
      
      setFormData({
        vehicleId: '',
        location: '',
        description: '',
        severity: 'Minor',
        witnesses: []
      });
      setDocuments([]);
      setIsReporting(false);
      
      toast.success('Accident reported successfully on blockchain');
    } catch (error) {
      toast.error('Failed to report accident');
      console.error('Error reporting accident:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reported': return 'bg-yellow-100 text-yellow-800';
      case 'Under Investigation': return 'bg-blue-100 text-blue-800';
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minor': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Accident Reports</h2>
        {canReport && (
          <Dialog open={isReporting} onOpenChange={setIsReporting}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Report Accident</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report Vehicle Accident</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="vehicle">Vehicle Involved</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} - {vehicle.registrationNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Accident Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Street address or intersection"
                  />
                </div>
                
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select onValueChange={(value: 'Minor' | 'Moderate' | 'Severe') => setFormData(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minor">Minor</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the accident..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="documents">Evidence Documents</Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  {documents.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected files:</p>
                      <ul className="text-xs text-gray-500">
                        {documents.map((file, index) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <Button onClick={handleReportAccident} className="w-full">
                  Submit Accident Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relevantReports.map((report) => {
          const vehicle = vehicles.find(v => v.id === report.vehicleId);
          const reporter = participants.find(p => p.id === report.reporterId);
          
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">Accident Report</span>
                  </CardTitle>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
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
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{report.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {new Date(report.dateTime).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getSeverityColor(report.severity)}>
                      {report.severity}
                    </Badge>
                    {report.documents.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <FileText className="w-3 h-3" />
                        <span>{report.documents.length} docs</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="line-clamp-2">{report.description}</p>
                  </div>
                  
                  {reporter && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Reported by: {reporter.name} ({reporter.role})
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {relevantReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accident reports</h3>
            <p className="text-gray-500 mb-4">
              {canReport 
                ? 'No accidents have been reported yet.'
                : 'You don\'t have permission to view accident reports.'
              }
            </p>
            {canReport && (
              <Button onClick={() => setIsReporting(true)}>
                Report Accident
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccidentReporting;
