/**
 * @file FeeService.ts
 * @description Service class for fetching fees across different blockchain networks and tokens.
 * Uses an external API to retrieve fees based on user inputs like chain IDs, token addresses, and amounts.
 */

import { ApiUtil } from '../utils/ApiUtil';
import { CONFIG } from '../config';

/**
 * A service class for retrieving fees across different blockchains and token pairs.
 * @class FeeService
 */
export class FeeService {
  /**
   * Fetches the fees for transferring tokens between chains.
   * @param {number} fromChainId      - The source blockchain ID.
   * @param {number} toChainId        - The destination blockchain ID.
   * @param {string} fromTokenAddress - The token address on the source chain.
   * @param {string} toTokenAddress   - The token address on the destination chain.
   * @param {number} fromAmount       - The amount of tokens to be transferred (in smallest units if necessary).
   * @param {string} userAddress      - The address of the user initiating the transfer.
   * @returns {Promise<any>}          - The result containing all route information and associated fees.
   * @throws {Error} Throws an error if the API request fails.
   */
  static async getAllFees(
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    fromAmount: number,
    userAddress: string
  ): Promise<any> {
    // Convert amount to the format accepted by the API if needed (e.g., to smallest unit like wei).
    const formattedAmount = fromAmount;

    // Construct the URL using the provided parameters.
    const url = `${CONFIG.API_URL}/quote?fromChainId=${fromChainId}&fromTokenAddress=${fromTokenAddress}&toChainId=${toChainId}&toTokenAddress=${toTokenAddress}&fromAmount=${formattedAmount}&userAddress=${userAddress}&uniqueRoutesPerBridge=true&sort=output`;

    const result = await ApiUtil.fetch(url);
    return result;
  }
}