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
    const { result: balances } = await BalanceService.fetchUserBalances(userAddress);

    // Filter out balances that are relevant for bridging.
    const sourceAmount = balances.filter(
      (balance: any) =>
        balance.chainId !== fromChainId && balance.chainAgnosticId === 'USDC'
    );

    // Fetch all bridge quotes once for each chain to minimize repeated API calls.
    const bridgeQuotes = await Promise.all(
      sourceAmount.map(async (balance: any) => {
        const bridgeData = await FeeService.getAllFees(
          balance.chainId,
          fromChainId,
          balance.address,
          fromTokenAddress,
          fromAmount,
          userAddress
        );
        return bridgeData.result.routes.map((route: any) => ({
          ...route,
          fromChainId: balance.chainId,
          fromAmount: balance.amount * Math.pow(10, balance.decimals),
          toAmount: route.toAmount / Math.pow(10, balance.decimals),
          bridgeName: route.usedBridgeNames.join(', '),
          totalGasFeesInUsd: route.totalGasFeesInUsd,
        }));
      })
    );

    // Each balance might have multiple possible bridge routes, flat() is used to get a single-level array of all routes.
    const flatQuotes = bridgeQuotes.flat();

    // To find the optimal combination of routes that achieve the target bridged amount.
    const bestComb = this.findOptimiztedComb(flatQuotes, amount);

    return {
      bestRoute: bestComb.selectedRoutes,
      totalFee: bestComb.totalFee,
      totalBridged: bestComb.totalBridged,
    };
  }

  /**
   * Recursively calculates the optimal combination of routes to cover the shortfall using a backtracking approach.
   * @param {Array} quotes         - Array of available bridge quotes.
   * @param {number} targetAmount  - The target amount to bridge.
   * @returns {object}             - Returns the best combination of routes that covers the target amount at minimal cost.
   */
  static findOptimiztedComb(quotes: any[], targetAmount: number) {
    // It starts with a bestResult object to keep track of the currently optimal selection of routes.
    let bestResult = { selectedRoutes: [], totalFee: Infinity, totalBridged: 0 };

    /**
     * Helper function for recursive backtracking.
     * @param {Array} currentRoutes   - Array of currently selected routes in this path.
     * @param {number} currentBridged - Total amount bridged so far.
     * @param {number} currentFee     - Total fee for the current path.
     * @param {number} startIndex     - Starting index for current recursion level.
     */
    function backtracking(
      currentRoutes: any[],
      currentBridged: number,
      currentFee: number,
      startIndex: number
    ) {
      // If the currentBridged amount (the accumulated tokens from selected routes) >= targetAmount and has a currentFee lower than the bestResult, it updates bestResult.
      if (currentBridged >= targetAmount && currentFee < bestResult.totalFee) {
        bestResult = {
          selectedRoutes: [...currentRoutes],
          totalFee: currentFee,
          totalBridged: currentBridged,
        };
        return;
      }

      // For each route, it checks if adding the route to the current path would exceed targetAmount. If not, it adds the route to currentRoutes, updates currentBridged and currentFee, and recursively calls backtracking with the updated parameters.
      for (let i = startIndex; i < quotes.length; i++) {
        const quote = quotes[i];
        if (currentBridged + quote.toAmount > targetAmount) continue; 

        // Add current quote to path.
        currentRoutes.push(quote); 
        backtracking(
          currentRoutes,
          currentBridged + quote.toAmount,
          currentFee + quote.totalGasFeesInUsd,
          i + 1
        );
        currentRoutes.pop(); 
      }
    }

    // Initializing backtracking from starting of the quotes array.
    backtracking([], 0, 0, 0);

    return bestResult;
  }
}
