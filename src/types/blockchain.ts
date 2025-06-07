export interface Participant {
  id: string;
  name: string;
  role: 'VehicleOwner' | 'Police' | 'Insurer' | 'Witness' | 'InsuranceAdjuster' | 'RepairShop' | 'Admin' | 'ClaimChecker';
  organization: string;
  publicKey: string;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  ownerId: string;
  registrationNumber: string;
  currentInsurancePolicyId?: string;
}

export interface InsurancePolicy {
  id: string;
  vehicleId: string;
  ownerId: string;
  insurerId: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  coverageAmount: number;
  premium: number;
  status: 'Active' | 'Expired' | 'Cancelled';
  coverageType: string[];
}

export interface AccidentReport {
  id: string;
  vehicleId: string;
  reporterId: string;
  reporterRole: string;
  location: string;
  dateTime: string;
  description: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  witnesses: string[];
  documents: DocumentHash[];
  status: 'Reported' | 'Under Investigation' | 'Verified' | 'Closed';
  claimId?: string;
}

export interface RepairRecord {
  id: string;
  vehicleId: string;
  accidentReportId: string;
  repairShopId: string;
  estimatedCost: number;
  actualCost?: number;
  startDate: string;
  completionDate?: string;
  status: 'Estimated' | 'Approved' | 'In Progress' | 'Completed';
  approvals: Approval[];
  documents: DocumentHash[];
}

export interface DocumentHash {
  id: string;
  fileName: string;
  hash: string;
  uploadDate: string;
  uploaderId: string;
  documentType: string;
}

export interface Approval {
  approverId: string;
  approverRole: string;
  timestamp: string;
  signature: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
}

export interface BlockchainTransaction {
  id: string;
  type: 'RegisterInsurance' | 'ReportAccident' | 'ValidateInsurance' | 'RepairVehicle' | 'ApproveClaim' | 'RegisterVehicle';
  timestamp: string;
  initiatorId: string;
  participants: string[];
  payload: any;
  hash: string;
  blockNumber: number;
  status: 'Pending' | 'Confirmed' | 'Failed';
}
