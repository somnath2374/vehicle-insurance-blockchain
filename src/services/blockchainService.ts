
import { ethers } from 'ethers';
import { INSURANCE_CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI, VEHICLE_REGISTRY_ABI } from '@/contracts/InsuranceContract';

export class BlockchainService {
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner;
  private insuranceContract: ethers.Contract;

  constructor(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    this.insuranceContract = new ethers.Contract(
      INSURANCE_CONTRACT_ADDRESS,
      INSURANCE_CONTRACT_ABI,
      signer
    );
  }

  async registerInsurance(
    vehicleId: string,
    policyNumber: string,
    coverageAmount: number,
    premium: number,
    endDate: string
  ): Promise<{ txHash: string; gasCost: string }> {
    try {
      // Convert end date to timestamp
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      
      // Estimate gas
      const gasEstimate = await this.insuranceContract.registerInsurance.estimateGas(
        vehicleId,
        policyNumber,
        ethers.parseEther(coverageAmount.toString()),
        ethers.parseEther(premium.toString()),
        endTimestamp
      );

      const gasPrice = (await this.provider.getFeeData()).gasPrice;
      const gasCost = ethers.formatEther(gasEstimate * (gasPrice || BigInt(0)));

      // Send transaction
      const tx = await this.insuranceContract.registerInsurance(
        vehicleId,
        policyNumber,
        ethers.parseEther(coverageAmount.toString()),
        ethers.parseEther(premium.toString()),
        endTimestamp,
        { gasLimit: gasEstimate }
      );

      await tx.wait();
      console.log('Insurance registered on blockchain:', tx.hash);

      return { txHash: tx.hash, gasCost };
    } catch (error) {
      console.error('Error registering insurance:', error);
      throw error;
    }
  }

  async validateInsurance(vehicleId: string): Promise<{
    isValid: boolean;
    policyNumber: string;
    coverageAmount: string;
  }> {
    try {
      const result = await this.insuranceContract.validateInsurance(vehicleId);
      return {
        isValid: result[0],
        policyNumber: result[1],
        coverageAmount: ethers.formatEther(result[2])
      };
    } catch (error) {
      console.error('Error validating insurance:', error);
      throw error;
    }
  }

  async reportAccident(
    vehicleId: string,
    location: string,
    description: string,
    severity: number
  ): Promise<{ txHash: string; gasCost: string }> {
    try {
      // Estimate gas
      const gasEstimate = await this.insuranceContract.reportAccident.estimateGas(
        vehicleId,
        location,
        description,
        severity
      );

      const gasPrice = (await this.provider.getFeeData()).gasPrice;
      const gasCost = ethers.formatEther(gasEstimate * (gasPrice || BigInt(0)));

      // Send transaction
      const tx = await this.insuranceContract.reportAccident(
        vehicleId,
        location,
        description,
        severity,
        { gasLimit: gasEstimate }
      );

      await tx.wait();
      console.log('Accident reported on blockchain:', tx.hash);

      return { txHash: tx.hash, gasCost };
    } catch (error) {
      console.error('Error reporting accident:', error);
      throw error;
    }
  }

  async getInsurancePolicy(vehicleId: string): Promise<{
    policyNumber: string;
    coverageAmount: string;
    isActive: boolean;
    endDate: Date;
  }> {
    try {
      const result = await this.insuranceContract.getInsurancePolicy(vehicleId);
      return {
        policyNumber: result[0],
        coverageAmount: ethers.formatEther(result[1]),
        isActive: result[2],
        endDate: new Date(Number(result[3]) * 1000)
      };
    } catch (error) {
      console.error('Error getting insurance policy:', error);
      throw error;
    }
  }

  async getGasEstimate(functionName: string, args: any[]): Promise<string> {
    try {
      const gasEstimate = await this.insuranceContract[functionName].estimateGas(...args);
      const gasPrice = (await this.provider.getFeeData()).gasPrice;
      const gasCost = gasEstimate * (gasPrice || BigInt(0));
      return ethers.formatEther(gasCost);
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '0.001'; // Fallback
    }
  }
}
