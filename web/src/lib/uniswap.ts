import { parseAbi, parseUnits } from 'viem';
// Official Ethereum mainnet V3 deployments; see README's integration map.
export const QUOTER = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' as const;
export const FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984' as const;
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const;
export const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const;
export const quoterAbi = parseAbi(['function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96) params) returns (uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate)']);
export const factoryAbi = parseAbi(['function getPool(address,address,uint24) view returns (address)']);
export function parseQuoteAmount(input: string) {
  if (!/^(?:0|[1-9]\d{0,3})(?:\.\d{1,6})?$/.test(input)) throw new Error('Enter 0.001–100 WETH, with at most 6 decimal places.');
  const amount = parseUnits(input,18);
  if(amount < parseUnits('0.001',18) || amount > parseUnits('100',18)) throw new Error('Enter an amount between 0.001 and 100 WETH.');
  return amount;
}
export function minimumOutput(amount: bigint, slippageBps: number) {
  if(!Number.isInteger(slippageBps)||slippageBps<0||slippageBps>1000)throw new Error('Invalid slippage');
  return amount*BigInt(10000-slippageBps)/10000n;
}
export type ExitQuote = {amount: string; block: string; timestamp: number; routes: {fee: number; pool: string; usdc: string; ticks: number}[]};
