'use client';
import { useRef, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { minimumOutput, type ExitQuote } from '@/lib/uniswap';
export default function ExitLiquidity(){
 const [amount,setAmount]=useState('0.5'),[slippage,setSlippage]=useState(50),[quote,setQuote]=useState<ExitQuote|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const version=useRef(0);
 async function load(){const id=++version.current;setBusy(true);setError('');setQuote(null);try{const response=await fetch(`/api/exit-quote?amount=${encodeURIComponent(amount)}`);const data=await response.json();if(!response.ok)throw new Error(data.error);if(id===version.current)setQuote(data);}catch(e){if(id===version.current)setError((e as Error).message);}finally{if(id===version.current)setBusy(false);}}
 const best=quote?.routes[0];
 const min=best?Number(formatUnits(minimumOutput(parseUnits(best.usdc,6),slippage),6)):0;
 return <section id="exit-liquidity" className="exit-lab">
 <div className="exit-eyebrow">05 / EXIT LIQUIDITY · POWERED BY UNISWAP V3</div>
 <h2>Can your exit actually cover the debt?</h2>
 <p>Selling an asset does not always return its displayed price. Compare real WETH → USDC quotes, then see how much could remain for repayment after a slippage buffer.</p>
 <div className="exit-controls"><label>WETH to sell<input aria-label="WETH to quote" type="number" min="0.001" max="100" step="0.001" value={amount} onChange={e=>{version.current++;setAmount(e.target.value);setQuote(null);setError('');setBusy(false);}}/></label><label>Slippage tolerance<select value={slippage} onChange={e=>setSlippage(Number(e.target.value))}><option value={10}>0.1%</option><option value={50}>0.5%</option><option value={100}>1%</option><option value={300}>3%</option></select></label><button className="primary" disabled={busy} onClick={load}>{busy?'Reading live pools…':'Compare live exit quotes'}</button></div>
 <p className="exit-note">Ethereum mainnet data · Read-only simulation · No wallet or gas needed. WETH is wrapped ETH. USDC is separate from the game’s virtual dollars and Sepolia tokens.</p>
 {error&&<p role="alert">{error}</p>}
 {quote&&best&&<div aria-live="polite"><div className="exit-routes">{quote.routes.map((r,i)=><article key={r.fee}><span>{r.fee/10000}% pool fee {i===0?'· Higher output of these pools':''}</span><strong>{Number(r.usdc).toLocaleString(undefined,{maximumFractionDigits:2})} USDC</strong><a href={`https://etherscan.io/address/${r.pool}`} target="_blank" rel="noreferrer">Verify pool ↗</a></article>)}</div>
 <div className="exit-lesson"><strong>{min.toLocaleString(undefined,{maximumFractionDigits:2})} USDC minimum-output example</strong><p>At {slippage/100}% tolerance, a swap using this minimum would revert if it returned less. It is not a guaranteed payment. Against a hypothetical 7,000 USDC debt, this covers {Math.min(100,min/7000*100).toFixed(1)}% and leaves {Math.max(0,7000-min).toLocaleString(undefined,{maximumFractionDigits:2})} USDC unpaid.</p><p>Quotes include pool fees and price impact, but exclude gas and wrapping costs. Only the 0.05% and 0.3% direct pools are compared; this is not a best-route aggregator. Increasing tolerance permits a worse outcome—it does not improve the quote.</p></div>
 <p className="exit-note">Block {quote.block} · {new Date(quote.timestamp*1000).toISOString()} · Refresh before using a quote; market state changes. {quote.routes.length<2?'One pool is unavailable.':''}</p></div>}
 </section>;
}
