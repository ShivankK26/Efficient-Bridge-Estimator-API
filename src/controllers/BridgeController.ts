import { BridgeService } from "../services/BridgeService";
import type { Context } from "elysia";

export const BridgeController = {
  async getBestRoute({ query }: Context) {
    const { targetChain, amount, tokenAddress, userAddress } = query;

    const result = await BridgeService.findBestRoute(
      Number(targetChain), 
      Number(amount), 
      tokenAddress as string, 
      userAddress as string
    );

    return result;
  },
};
