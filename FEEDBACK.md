# Uniswap developer feedback — ETHOnline 2026

REKT FLY integrates the official Uniswap V3 AMM through QuoterV2 to teach how exit liquidity affects debt repayment. Live demo: https://rekt-fly.vercel.app/#exit-liquidity.

## What worked

The deployment table identifies Factory, QuoterV2, and chain-specific addresses. The IQuoterV2 interface clearly defines tuple order and output fields. We integrated using the existing viem dependency and eth_call, without an API key, wallet signature, or additional SDK. Same-block quotes make the 0.05% versus 0.3% comparison meaningful.

## Friction and suggestions

QuoterV2 is non-view despite being intended for offchain quoting. A copyable viem `simulateContract` example with `blockNumber` beside the interface would help beginners avoid sending a transaction. A minimal recipe should explicitly distinguish pool fee, price impact, slippage tolerance, and gas: these are often conflated in educational apps. Include how to handle partial pool failures and explain that comparing two fee tiers is not global best routing.

## Verification

On September 13, 2026, a live request for 0.5 WETH at Ethereum block 25969444 returned 1243.831372 USDC from the 0.05% pool and 1239.863433 USDC from the 0.3% pool. These are historical observations, not fixed expected values. The app shows the block timestamp and pool explorer links, invalidates displayed results when the input changes, and never substitutes a mock quote on RPC failure. Tests cover input bounds and integer rounding for minimum output.

## Support used and scope

We used official technical documentation and code examples, with OpenAI Codex implementation assistance. We did not use office hours or direct mentor support. This integration performs read-only quote simulation; no swap transaction or mainnet fund management is claimed. Developer-feedback form: https://developers.uniswap.org/hackathon-feedback.
