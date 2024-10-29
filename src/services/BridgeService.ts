import { FeeService } from "./FeeService";
import { BalanceService } from "./BalanceService";

export class BridgeService {
  static async findBestRoute(targetChain: number, amount: number, tokenAddress: string, userAddress: string) {
    const { result: balances } = await BalanceService.fetchUserBalances("0x02023e8f8D0aa65562af1183DF7f76d79D6f7248");
  
    // Calculate the shortfall amount required on the target chain
    let shortfall = amount;

    // Filter out USDC balances on the target chain
    const targetChainUSDCBalance = balances.find(
      (balance: any) => 
        balance.chainId === targetChain && 
        balance.address.toLowerCase() === tokenAddress.toLowerCase()
    );

    // Check if the user has USDC on the target chain
    if (targetChainUSDCBalance) {
      shortfall -= targetChainUSDCBalance.amount * Math.pow(10, targetChainUSDCBalance.decimals); // Convert to smallest unit if needed
    }

    shortfall = 50;

    // If no shortfall, no need to bridge
    if (shortfall <= 0) {
      return {
        bestRoute: [],
        totalFee: 0,
        message: "No bridging required",
      };
    }

    // Identify all USDC balances on other chains
    const sourceBalances = balances.filter(
      (balance: any) => 
        balance.chainId !== targetChain && 
        balance.chainAgnosticId === "USDC" // Match based on chain-agnostic USDC identifier
    );
    

    // Initialize an array to hold possible routes
    const possibleRoutes = [];

    // Loop through each balance and calculate the fees to bridge it to the target chain
    for (const balance of sourceBalances) {
      const fromChainId = balance.chainId;
      const fromAmount = Math.min(balance.amount * Math.pow(10, balance.decimals), shortfall); // Convert to smallest unit if needed

      // Call FeeService to get the bridging fee and details
      const bridgeData = await FeeService.getAllFees(
        fromChainId,
        targetChain,
        balance.address,
        tokenAddress,
        fromAmount,
        userAddress
      );
        
      // If successful response and fees available, calculate the effective cost
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
        console.log(possibleRoutes);
      }
    }

    // Sort the possible routes by total gas fees (or any other cost metric)
    possibleRoutes.sort((a, b) => a.totalGasFeesInUsd - b.totalGasFeesInUsd);

    // Select routes that cover the shortfall
    const selectedRoutes = [];
    let totalBridged = 0;
    let totalFee = 0;

    for (const route of possibleRoutes) {
      if (totalBridged >= shortfall / Math.pow(10, targetChainUSDCBalance.decimals)) break;
      selectedRoutes.push(route);
      totalBridged += route.toAmount;
      totalFee += route.totalGasFeesInUsd;
    }

    return {
      bestRoute: selectedRoutes,
      totalFee,
      totalBridged,
    };
  }
}