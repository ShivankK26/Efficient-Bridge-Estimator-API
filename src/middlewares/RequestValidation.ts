/**
 * @file RequestValidation.ts
 * @description Middleware function for validating request query parameters.
 * Ensures that required parameters are present in the incoming API requests.
 */

import type { Context } from 'elysia';

/**
 * Middleware function for validating query parameters in API requests.
 * @param {Context} context - The context object provided by Elysia, containing the query parameters.
 * @returns {object | undefined} Returns an error response object if validation fails, otherwise proceeds.
 */
export const RequestValidation = ({ query }: Context) => {
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

  // Check if any of the required parameters are missing or invalid.
  if (
    !fromChainId ||
    !fromTokenAddress ||
    !toChainId ||
    !toTokenAddress ||
    !fromAmount ||
    !userAddress ||
    !amount
  ) {
    // Return a 400 status with an error message if validation fails.
    return {
      status: 400,
      body: { error: 'Missing required parameters' },
    };
  }

  // Ensure that required parameters are of the correct type.
  if (
    isNaN(Number(fromChainId)) ||
    isNaN(Number(toChainId)) ||
    isNaN(Number(fromAmount)) ||
    isNaN(Number(amount))
  ) {
    return {
      status: 400,
      body: { error: 'Invalid parameter types' },
    };
  }
};