/**
 * @file routes/index.ts
 * @description Defines routes for handling API requests using Elysia framework.
 */

import { BridgeController } from '../controllers/BridgeController';
import { RequestValidation } from '../middlewares/RequestValidation';
import { CachingMiddleware } from '../middlewares/CachingMiddleware';
import { Elysia, t } from 'elysia';

/**
 * Registers all routes for the application.
 * @param {Elysia} app - The Elysia application instance.
 */
export default (app: Elysia) => {
  app.get('/api/bridge-route', BridgeController.getBestRoute, {
    query: t.Object({
      fromChainId: t.Number(),                           // Source blockchain ID.
      fromTokenAddress: t.String(),                      // Token address on the source chain.
      toChainId: t.Number(),                             // Destination blockchain ID.
      toTokenAddress: t.String(),                        // Token address on the destination chain.
      fromAmount: t.Number(),                            // Amount of tokens to be bridged.
      userAddress: t.String(),                           // User's blockchain address.
      uniqueRoutesPerBridge: t.Boolean(),                // Flag indicating unique routes per bridge (default: true).
      sort: t.String(),                                  // Sort preference for the results.
      amount: t.Number(),                                // Amount of tokens to be bridged.
    }),
    middleware: [RequestValidation, CachingMiddleware],
  });
};