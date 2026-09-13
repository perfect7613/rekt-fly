import { parseAbi } from "viem";

// Official ETHOnline 2026 Chainlink challenge. Both tokens use TWO decimals.
export const LENDING = "0x88574e7Cc0027afd04951daa09B64d4441931ba1" as const;
export const VETH = "0x5dED1a40c3D56dA42E7f932f781c0432556c9814" as const;
export const VUSD = "0x6Fe92Ead5299040f50F095860b5A0A7A2D4041A2" as const;
export const lendingAbi = parseAbi([
  "function challengeOpen() view returns (bool)",
  "function scenarioStartTime() view returns (uint256)",
  "function scenarioEndTime() view returns (uint256)",
  "function isUser(address) view returns (bool)",
  "function vETHPrice() view returns (uint256)",
  "function vETH() view returns (address)",
  "function vUSD() view returns (address)",
  "function positions(address) view returns (uint256 collateral, uint256 debt, uint256 hf, uint256 numOperations, uint256 lastUpdateTime, uint256 cumulativeDebtTime)",
  "function join()",
  "function deposit(uint256 amount)",
  "function repay(uint256 amount)",
]);
export const tokenAbi = parseAbi([
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
]);
export function health(collateral: bigint, debt: bigint, price: bigint) {
  return debt === 0n
    ? Infinity
    : Number((collateral * price * 78n) / (100n * debt)) / 100;
}
export function protection(collateral: bigint, debt: bigint, price: bigint) {
  // Minimum token units to reach HF >= 1.20, rounded towards safety.
  if (price <= 0n || debt === 0n) return { deposit: 0n, repay: 0n };
  const required = (12000n * debt + price * 78n - 1n) / (price * 78n);
  const safeDebt = (collateral * price * 78n) / 12000n;
  return {
    deposit: required > collateral ? required - collateral : 0n,
    repay: debt > safeDebt ? debt - safeDebt : 0n,
  };
}
