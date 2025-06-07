
export const INSURANCE_CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b8D332c3AB8CB890d3"; // Example address

export const INSURANCE_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "vehicleId", "type": "string"},
      {"name": "policyNumber", "type": "string"},
      {"name": "coverageAmount", "type": "uint256"},
      {"name": "premium", "type": "uint256"},
      {"name": "endDate", "type": "uint256"}
    ],
    "name": "registerInsurance",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "vehicleId", "type": "string"}],
    "name": "validateInsurance",
    "outputs": [
      {"name": "isValid", "type": "bool"},
      {"name": "policyNumber", "type": "string"},
      {"name": "coverageAmount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "vehicleId", "type": "string"},
      {"name": "location", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "severity", "type": "uint8"}
    ],
    "name": "reportAccident",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "vehicleId", "type": "string"}],
    "name": "getInsurancePolicy",
    "outputs": [
      {"name": "policyNumber", "type": "string"},
      {"name": "coverageAmount", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "endDate", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "reportId", "type": "string"}],
    "name": "getAccidentReport",
    "outputs": [
      {"name": "vehicleId", "type": "string"},
      {"name": "reporterAddress", "type": "address"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "isVerified", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const VEHICLE_REGISTRY_ABI = [
  {
    "inputs": [
      {"name": "vehicleId", "type": "string"},
      {"name": "vin", "type": "string"},
      {"name": "make", "type": "string"},
      {"name": "model", "type": "string"},
      {"name": "year", "type": "uint16"}
    ],
    "name": "registerVehicle",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "vehicleId", "type": "string"}],
    "name": "getVehicle",
    "outputs": [
      {"name": "vin", "type": "string"},
      {"name": "owner", "type": "address"},
      {"name": "isRegistered", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
