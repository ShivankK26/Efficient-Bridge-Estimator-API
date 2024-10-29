import { ApiUtil } from "../utils/ApiUtil";
import { CONFIG } from "../config";

export class FeeService {
  static async getAllFees(fromChainId: number, toChainId: number, fromTokenAddress: string, toTokenAddress: string, fromAmount: number, userAddress: string) {
    // Convert amount to the format accepted by the API if needed (e.g., to smallest unit like wei)
    const formattedAmount = fromAmount; 

    const url = `${CONFIG.API_URL}/quote?fromChainId=${fromChainId}&fromTokenAddress=${fromTokenAddress}&toChainId=${toChainId}&toTokenAddress=${toTokenAddress}&fromAmount=${formattedAmount}&userAddress=${userAddress}&uniqueRoutesPerBridge=true&sort=output`;

    const result = await ApiUtil.fetch(url);

    return result; 
  }
}
