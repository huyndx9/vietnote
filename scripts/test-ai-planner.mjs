import fs from 'node:fs';
import assert from 'node:assert/strict';
const worker=(await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(new URL('../worker/index.js', import.meta.url),'utf8')).toString('base64'))).default;
let sent;globalThis.fetch=async(url,opts)=>{sent=JSON.parse(opts.body);return Response.json({choices:[{finish_reason:'stop',message:{content:'1일차\n하노이 산책'}}]})};
const call=(body)=>worker.fetch(new Request('https://test/',{method:'POST',headers:{Origin:'http://localhost:8000','Content-Type':'application/json'},body:JSON.stringify(body)}),{ALLOWED_ORIGINS:'http://localhost:8000',DEEPSEEK_API_KEY:'test-only'});
let r=await call({task:'itinerary',days:4,pace:'balanced',places:[{title:'하노이',transport:'x'.repeat(900)},{title:'닌빈',desc:'y'.repeat(600)}]});assert.equal(r.status,200);assert.equal(sent.max_tokens,6000);assert(sent.messages[1].content.length>1000);assert(sent.messages[1].content.includes('닌빈'));assert.equal(sent.stream,false);
for(const body of [{task:'itinerary',days:0,pace:'balanced',places:[]},{task:'itinerary',days:4,pace:'bad',places:[{title:'x'}]},{task:'itinerary',days:4,pace:'balanced',places:[null]}])assert.equal((await call(body)).status,400);
r=await call({messages:[{role:'user',content:'hello'}]});assert.equal(r.status,200);assert.equal(sent.max_tokens,2500);
console.log('Worker itinerary validation, complete context, reply and existing chat passed');
