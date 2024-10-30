/**
 * @file BridgeService.ts
 * @description Service class for handling the calculation of the best routes for bridging tokens between blockchains.
 */

import { FeeService } from './FeeService';
import { BalanceService } from './BalanceService';

/**
 * @class BridgeService
 * @description Service class for handling the calculation of the best routes for bridging tokens between blockchains.
 */
export class BridgeService {
  /**
   * Finds the best route for bridging tokens between blockchains based on the provided parameters.
   * @async
   * @param {number} fromChainId            - The source blockchain ID.
   * @param {string} fromTokenAddress       - The token address on the source blockchain.
   * @param {number} toChainId              - The destination blockchain ID.
   * @param {string} toTokenAddress         - The token address on the destination blockchain.
   * @param {number} fromAmount             - The amount of tokens to bridge from the source blockchain.
   * @param {string} userAddress            - The blockchain address of the user initiating the bridge.
   * @param {boolean} uniqueRoutesPerBridge - Indicates if unique routes should be provided for each bridge.
   * @param {string} sort                   - The sorting preference for the bridge route results (e.g., 'output').
   * @param {number} amount                 - The total amount of tokens required on the target chain.
   * @returns {Promise<object>} - Returns an object containing the best route information, total fee, and total bridged amount.
   */
  static async findBestRoute(
    fromChainId: number,
    fromTokenAddress: string,
    toChainId: number,
    toTokenAddress: string,
    fromAmount: number,
    userAddress: string,
    uniqueRoutesPerBridge: boolean,
    sort: string,
    amount: number
  ): Promise<any> {
    // Fetch user balances (assuming the service and API exist).
    const { result: balances } =
      await BalanceService.fetchUserBalances(userAddress);

    // Calculate the shortfall amount required on the target chain.
    let shortfall = amount;

    // Filter out USDC balances on the target chain
    const targetChainUSDCBalance = balances.find(
      (balance: any) =>
        balance.chainId === fromChainId &&
        balance.address.toLowerCase() === fromTokenAddress.toLowerCase()
    );

    // Check if the user has USDC on the target chain.
    if (targetChainUSDCBalance) {
      shortfall -=
        targetChainUSDCBalance.amount *
        Math.pow(10, targetChainUSDCBalance.decimals); // Convert to smallest unit if needed.
    }

    // If no shortfall, no need to bridge.
    if (shortfall <= 0) {
      return {
        bestRoute: [],
        totalFee: 0,
        message: 'No bridging required',
      };
    }

    // Identify all USDC balances on other chains.
    const sourceBalances = balances.filter(
      (balance: any) =>
        balance.chainId !== fromChainId && balance.chainAgnosticId === 'USDC' // Match based on chain-agnostic USDC identifier.
    );

    // Calculate the best possible routes.
    const { selectedRoutes, totalFee, totalBridged } =
      await this.calculateBestRoutes(
        sourceBalances,
        fromChainId,
        fromTokenAddress,
        userAddress,
        shortfall,
        targetChainUSDCBalance.decimals
      );

    return {
      bestRoute: selectedRoutes,
      totalFee,
      totalBridged,
    };
  }

  /**
   * Calculates the best routes for bridging tokens from source balances to the target chain.
   * @async
   * @param {Array} sourceBalances    - The user's balances on various chains excluding the target chain.
   * @param {number} fromChainId      - The ID of the target chain.
   * @param {string} fromTokenAddress - The token address on the target chain.
   * @param {string} userAddress      - The user's blockchain address.
   * @param {number} shortfall        - The total amount of tokens needed on the target chain.
   * @param {number} targetDecimals   - The number of decimals for the target chain token.
   * @returns {Promise<object>} - Returns an object containing selected routes, total fees, and total bridged amount.
   */
  static async calculateBestRoutes(
    sourceBalances: any[],
    fromChainId: number,
    fromTokenAddress: string,
    userAddress: string,
    shortfall: number,
    targetDecimals: number
  ): Promise<any> {
    const possibleRoutes = [];

    // Loop through each balance and calculate the fees to bridge it to the target chain.
    for (const balance of sourceBalances) {
      const fromChainId = balance.chainId;
      const fromAmount = Math.min(
        balance.amount * Math.pow(10, balance.decimals),
        shortfall
      ); 

      // Call FeeService to get the bridging fee and details.
      const bridgeData = await FeeService.getAllFees(
        fromChainId,
        fromChainId,
        balance.address,
        fromTokenAddress,
        fromAmount,
        userAddress
      );

      // If successful response and fees available, calculate the effective cost.
      if (bridgeData && bridgeData.result) {
        const { routes } = bridgeData.result;
        for (const route of routes) {
          possibleRoutes.push({
            fromChainId,
            toChainId: fromChainId,
            routeId: route.routeId,
            fromAmount:
              parseFloat(route.fromAmount) / Math.pow(10, balance.decimals),
            toAmount:
              parseFloat(route.toAmount) / Math.pow(10, balance.decimals),
            bridgeName: route.usedBridgeNames.join(', '),
            totalGasFeesInUsd: route.totalGasFeesInUsd,
          });
        }
      }
    }

    // Sort the possible routes by total gas fees (or any other cost metric).
    possibleRoutes.sort((a, b) => a.totalGasFeesInUsd - b.totalGasFeesInUsd);

    // Select routes that cover the shortfall efficiently.
    const selectedRoutes = [];
    let totalBridged = 0;
    let totalFee = 0;

    for (const route of possibleRoutes) {
      if (totalBridged >= shortfall / Math.pow(10, targetDecimals)) break;

      const shortfallThreshold =
        Number(process.env.SHORTFALL_THRESHOLD) || 0.01;
      if (route.fromAmount > shortfallThreshold) {
        selectedRoutes.push(route);
        totalBridged += route.toAmount;
        totalFee += route.totalGasFeesInUsd;
      }
    }

    return {
      selectedRoutes,
      totalFee,
      totalBridged,
    };
  }
}