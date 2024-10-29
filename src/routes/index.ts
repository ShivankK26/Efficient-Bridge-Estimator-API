import { BridgeController } from "../controllers/BridgeController";
import { RequestValidation } from "../middlewares/RequestValidation";
import { CachingMiddleware } from "../middlewares/CachingMiddleware";
import { Elysia, t } from "elysia";


export default (app: Elysia) => {
  app.get("/api/bridge-route", BridgeController.getBestRoute, {
    query: t.Object({
      targetChain: t.Number(), 
      amount: t.Number(),
      tokenAddress: t.String(),
      userAddress: t.String()
    })
  });
};
