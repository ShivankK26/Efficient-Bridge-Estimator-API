import { ApiUtil } from "../utils/ApiUtil";
import { CONFIG } from "../config";

export class BalanceService {
  static async fetchUserBalances(userAddress: string) {
    return await ApiUtil.fetch(`${CONFIG.API_URL}/balances?userAddress=${userAddress}`);
  }
}
