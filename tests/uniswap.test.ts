import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQuoteAmount, minimumOutput } from '../web/src/lib/uniswap';
test('exit quote validates amounts before public RPC calls',()=>{
 assert.equal(parseQuoteAmount('0.5'),500000000000000000n);
 for(const value of ['0','-1','101','1e2','NaN','0.000001','1.0000001'])assert.throws(()=>parseQuoteAmount(value));
});
test('minimum output rounds down in USDC units and cannot exceed quote',()=>{
 assert.equal(minimumOutput(123456789n,50),122839505n);
 assert.equal(minimumOutput(1n,50),0n);
 assert.equal(minimumOutput(100n,0),100n);
 assert.throws(()=>minimumOutput(100n,-1));
});
