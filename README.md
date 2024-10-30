# Efficient-Bridge-Estimator-API

**Problem Statement:** A user wants X USDC on lets say polygon. He has funds spread across many other chains. Now the API is to be designed to return the most efficient route/s to source X USDC from other chains. This can be done by bridging from one or more chains.

## Tech Stack

The Tech Stack for Building this Project is - 

- TypeScript
- Elysia and BunJS (for building the backend server)
- axios (for API fetching)

I used the APIs of Socket Protocol (Bungee Exchange) for Building this Project and the Link for the same is as follows - 

- [Balance across all Chains](https://docs.bungee.exchange/socket-api-reference/balances-controller-get-balances)
- [Bridge Fess across all Chains](https://docs.bungee.exchange/socket-api-reference/quote-controller-get-quote/)

## Basics of Bun

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.1.33. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## `localhost` API URL

Below is the Link for the localhost API URL which anyone can try in their Machine. The average response time of the Socket Protocol APIs is around 5-7 secs, so this is the time which is being used.

```
http://localhost:3000/api/bridge-route?targetChain=137&amount=100&tokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&userAddress=0x3e8cB4bd04d81498aB4b94a392c334F5328b237b
```

## Bridge Service Function

A Simple breakdown of `BridgeService.findBestRoute` Method and its Implementations -

`BridgeService.findBestRoute`

This function identifies the most efficient bridging route for transferring a target amount of USDC to a specified chain. Here’s how it works:

### 1. Fetching User Balances
   The function first fetches the user’s balances across chains to determine if they already have USDC on the target chain. If not, it calculates the shortfall to cover.

   ```typescript
   const { result: balances } = await BalanceService.fetchUserBalances("0x02023e8f8D0aa65562af1183DF7f76d79D6f7248");
   ```

### 2. Calculating Shortfall
   It then checks if there’s enough USDC on the target chain. If not, the `shortfall` variable is set to the required amount. If there is sufficient USDC, the shortfall is reduced or set to zero.

   ```typescript
   let shortfall = amount;
   
   const targetChainUSDCBalance = balances.find(
     (balance) => balance.chainId === targetChain && balance.address.toLowerCase() === tokenAddress.toLowerCase()
   );
   
   if (targetChainUSDCBalance) {
     shortfall -= targetChainUSDCBalance.amount * Math.pow(10, targetChainUSDCBalance.decimals); 
   }
   ```

### 3. Filtering Source Balances
   Next, it identifies USDC balances on other chains that can be used to bridge the shortfall amount.

   ```typescript
   const sourceBalances = balances.filter(
     (balance) => balance.chainId !== targetChain && balance.chainAgnosticId === "USDC"
   );
   ```

### 4. Estimating Bridging Fees
   For each balance on other chains, the function uses `getAllFees` to get the bridging fee data and route options. Each route is then added to `possibleRoutes` for further processing.

   ```javascript
   const possibleRoutes = [];

   for (const balance of sourceBalances) {
     const fromChainId = balance.chainId;
     const fromAmount = Math.min(balance.amount * Math.pow(10, balance.decimals), shortfall);

     const bridgeData = await FeeService.getAllFees(
       fromChainId,
       targetChain,
       balance.address,
       tokenAddress,
       fromAmount,
       userAddress
     );

     if (bridgeData && bridgeData.result) {
       const { routes } = bridgeData.result;
       for (const route of routes) {
         possibleRoutes.push({
           fromChainId,
           toChainId: targetChain,
           routeId: route.routeId,
           fromAmount: parseFloat(route.fromAmount) / Math.pow(10, balance.decimals),
           toAmount: parseFloat(route.toAmount) / Math.pow(10, balance.decimals),
           bridgeName: route.usedBridgeNames.join(", "),
           totalGasFeesInUsd: route.totalGasFeesInUsd,
         });
       }
     }
   }
   ```

### 5. Selecting the Best Route
   The function then sorts the routes based on gas fees to identify the most cost-effective option and selects routes that cover the shortfall amount.

   ```javascript
   possibleRoutes.sort((a, b) => a.totalGasFeesInUsd - b.totalGasFeesInUsd);

   const selectedRoutes = [];
   let totalBridged = 0;
   let totalFee = 0;

   for (const route of possibleRoutes) {
     if (totalBridged >= shortfall / Math.pow(10, targetChainUSDCBalance.decimals)) break;
     selectedRoutes.push(route);
     totalBridged += route.toAmount;
     totalFee += route.totalGasFeesInUsd;
   }
   ```

### 6. Returning the Result
   Finally, the function returns the selected routes, total fees, and the total bridged amount.

   ```javascript
   return {
     bestRoute: selectedRoutes,
     totalFee,
     totalBridged,
   };
   ```

## API Response Example

```
{
    "bestRoute": [
        {
            "fromChainId": 1,
            "toChainId": 137,
            "routeId": "f43a689f-225a-44ab-9193-41aba57653b0",
            "fromAmount": 0.00005,
            "toAmount": 148509521.112748,
            "bridgeName": "polygon-bridge",
            "totalGasFeesInUsd": 8.960276516779464
        }
    ],
    "totalFee": 8.960276516779464,
    "totalBridged": 148509521.112748
}
```


