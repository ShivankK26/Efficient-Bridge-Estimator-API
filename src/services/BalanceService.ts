/**
 * @file BalanceService.ts
 * @description Service class for fetching user balances from an external API.
 */

import { ApiUtil } from '../utils/ApiUtil';
import { CONFIG } from '../config';

/**
 * A service class for retrieving user balances.
 * @class BalanceService
 */
export class BalanceService {
  /**
   * Fetches the token balances for a given user address.
   * Constructs a URL using the provided user address and retrieves balances from an external API.
   * @param {string} userAddress - The blockchain address of the user to retrieve balances for.
   * @returns {Promise<any>}     - The result containing all token balances for the given user address.
   * @throws {Error} Throws an error if the API request fails.
   */
  static async fetchUserBalances(userAddress: string): Promise<any> {
    return await ApiUtil.fetch(
      `${CONFIG.API_URL}/balances?userAddress=${userAddress}`
    );
  }
}