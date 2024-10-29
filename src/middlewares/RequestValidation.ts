import { t, Elysia } from "elysia";
import type { Context } from "elysia";

export const RequestValidation = ({ query }: Context) => {
  const { targetChain, amount, tokenAddress, userAddress } = query;

  if (!targetChain || !amount || !tokenAddress || !userAddress) {
    return {
      status: 400,
      body: { error: "Missing required parameters" },
    };
  }
};
