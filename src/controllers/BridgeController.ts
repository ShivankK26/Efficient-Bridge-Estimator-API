/**
 * @file BridgeController.ts
 * @description Controller for handling requests related to finding the best bridge route.
 */

import { BridgeService } from '../services/BridgeService';
import type { Context } from 'elysia';

/**
 * Controller for handling bridge-related operations.
 * @class BridgeController
 */
export const BridgeController = {
  /**
   * Handles the request to get the best route for bridging tokens between blockchains.
   * @async
   * @function getBestRoute
   * @param {Context} context - The context object containing the query parameters.
   * @returns {Promise<any>}  - Returns the result from the BridgeService with the best route information.
   */
  async getBestRoute({ query }: Context): Promise<any> {
    // Extract parameters from query.
    const {
      fromChainId,
      fromTokenAddress,
      toChainId,
      toTokenAddress,
      fromAmount,
      userAddress,
      uniqueRoutesPerBridge,
      sort,
      amount,
    } = query;

    // Convert and validate the amount to a number.
    const parsedAmount = amount ? Number(amount) : 0;

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Invalid or missing amount');
    }

    const result = await BridgeService.findBestRoute(
      Number(fromChainId),
      fromTokenAddress as string,
      Number(toChainId),
      toTokenAddress as string,
      Number(fromAmount),
      userAddress as string,
      uniqueRoutesPerBridge === 'true',
      sort as string,
      parsedAmount
    );

    return result;
  },
};