# Efficient-Bridge-Estimator-API

**Problem Statement:** A user wants X USDC on lets say polygon. He has funds spread across many other chains. Now the API is to be designed to return the most efficient route/s to source X USDC from other chains. This can be done by bridging from one or more chains.

## Tech Stack

The Tech Stack for Building this Project is - 

- TypeScript
- Elysia and BunJS (for building the backend server)
- axios (for API fetching)
- ioredis (for caching using redis)

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

To do caching using redis:

```bash
redis-server
```

This project was created using `bun init` in bun v1.1.33. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## `localhost` API URL

Below is the Link for the localhost API URL which anyone can try in their Machine. The average response time of the Socket Protocol APIs is around 5-7 secs, so this is the time which is being used.

```
http://localhost:3000/api/bridge-route?amount=100&fromChainId=1&fromTokenAddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&toChainId=56&toTokenAddress=0x7F5c764cBc14f9669B88837ca1490cCa17c31607&fromAmount=100000000&userAddress=0xC50A08633e285C096828532701E2Ba24A9AeF30E&uniqueRoutesPerBridge=true&sort=output
```

## Bridge Service Function



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


