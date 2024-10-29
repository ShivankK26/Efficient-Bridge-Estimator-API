export interface Route {
  fromChainId: number;     
  toChainId: number;       
  amount: number;          
  fee: number;             
  tokenAddress: string;    
}

export interface BridgeResponse {
  bestRoute: Route[];      
  totalFee: number;        
}
