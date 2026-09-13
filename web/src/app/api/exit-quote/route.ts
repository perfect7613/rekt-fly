import { createPublicClient, fallback, http, formatUnits, zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { QUOTER, FACTORY, WETH, USDC, quoterAbi, factoryAbi, parseQuoteAmount } from '@/lib/uniswap';
export const maxDuration = 30;
const client = createPublicClient({chain:mainnet, transport:fallback([
  http('https://ethereum-rpc.publicnode.com',{timeout:7000,retryCount:0}),
  http('https://eth.drpc.org',{timeout:7000,retryCount:0}),
],{retryCount:0})});
export async function GET(request: Request) {
  const amount=new URL(request.url).searchParams.get('amount')??'0.5';
  let amountIn:bigint;
  try{amountIn=parseQuoteAmount(amount);}catch(e){return Response.json({error:(e as Error).message},{status:400});}
  try{
    const block=await client.getBlock();
    const results=await Promise.allSettled([500,3000].map(async fee=>{
      const [pool,quote]=await Promise.all([
        client.readContract({address:FACTORY,abi:factoryAbi,functionName:'getPool',args:[WETH,USDC,fee],blockNumber:block.number}),
        client.simulateContract({address:QUOTER,abi:quoterAbi,functionName:'quoteExactInputSingle',args:[{tokenIn:WETH,tokenOut:USDC,amountIn,fee,sqrtPriceLimitX96:0n}],blockNumber:block.number,account:zeroAddress}),
      ]);
      if(pool===zeroAddress||quote.result[0]<=0n)throw new Error('Pool unavailable');
      return {fee,pool,usdc:formatUnits(quote.result[0],6),ticks:quote.result[2]};
    }));
    const routes=results.flatMap(r=>r.status==='fulfilled'?[r.value]:[]).sort((a,b)=>Number(b.usdc)-Number(a.usdc));
    if(!routes.length)throw new Error('Quotes unavailable');
    return Response.json({amount,block:block.number.toString(),timestamp:Number(block.timestamp),routes},{headers:{'Cache-Control':'public, s-maxage=10, stale-while-revalidate=0'}});
  }catch{return Response.json({error:'Live Uniswap quotes are unavailable. Please retry; no estimate has been substituted.'},{status:503});}
}
