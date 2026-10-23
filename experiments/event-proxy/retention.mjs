// Separate follow-up for immediate post-dispose residuals. Never pooled with timing.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
const dir=path.dirname(fileURLToPath(import.meta.url));
const out=path.resolve(process.argv[2]);
assert(!fs.existsSync(path.join(out,'retention.json')));
const hash=data=>createHash('sha256').update(data).digest('hex');
const inputs=[path.join(dir,'fixture.mjs'),path.join(dir,'retention.mjs'),'/usr/lib/chromium/chromium'];
for(const v of ['baseline','candidate'])inputs.push(path.join(out,v,'production/lithent.mjs'));
const frozen=Object.fromEntries(inputs.map(p=>[p,hash(fs.readFileSync(p))]));
const raw={startedAt:new Date().toISOString(),protocol:{contextsPerVariantWorkload:3,updates:100,churn:10,gc:2,settleFrames:2,settleMs:100,official:false},frozen,rows:[],failures:[]};
const save=()=>fs.writeFileSync(path.join(out,'retention.json'),JSON.stringify(raw,null,2));
const server=http.createServer((req,res)=>{
 try{
 const [,v,name]=new URL(req.url,'http://localhost').pathname.split('/');assert(['baseline','candidate'].includes(v));
 if(name==='index.html') {res.setHeader('content-type','text/html');res.end(`<!doctype html><div id="host"></div><script type="module">import{setup}from'./fixture.mjs';window.setup=setup;window.ready=true</script>`);}
 else{assert(['fixture.mjs','core.mjs'].includes(name));res.setHeader('content-type','text/javascript');res.end(fs.readFileSync(name==='fixture.mjs'?path.join(dir,name):path.join(out,v,'production/lithent.mjs')));}
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
raw.browser=browser.version();
const snap=async session=>{
 await session.send('HeapProfiler.collectGarbage');await session.send('HeapProfiler.collectGarbage');
 const m=await session.send('Performance.getMetrics');return {heap:m.metrics.find(x=>x.name==='JSHeapUsedSize').value,...await session.send('Memory.getDOMCounters')};
};
try{
 for(const kind of ['inline-only','inline-text','stable-text','noevent-text'])for(let round=0;round<3;round++)for(const variant of round%2?['candidate','baseline']:['baseline','candidate']){
 const context=await browser.newContext({viewport:{width:1280,height:720}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/${variant}/index.html`);await page.waitForFunction(()=>window.ready);
 const session=await context.newCDPSession(page);await session.send('Performance.enable');const empty=await snap(session);
 await page.evaluate(async kind=>{window.app=window.setup(kind,2000);await window.app.update(100);window.app.dispatch(2000);await window.app.churn(10);window.app.validate();},kind);
 const active=await snap(session);
 await page.evaluate(()=>{window.app.dispose();window.app=null;});const immediate=await snap(session);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(resolve,100)))));
 const settled=await snap(session);
 assert.equal(errors.length,0,errors.join('\n'));
 raw.rows.push({kind,variant,round,empty,active,immediate,settled});save();await context.close();
 console.log(`retention ${kind} ${variant} ${round}: immediate ${immediate.nodes-empty.nodes}/${immediate.jsEventListeners-empty.jsEventListeners}, settled ${settled.nodes-empty.nodes}/${settled.jsEventListeners-empty.jsEventListeners}`);
 }
 for(const [file,expected]of Object.entries(frozen))assert.equal(hash(fs.readFileSync(file)),expected,file);
 raw.finishedAt=new Date().toISOString();save();
 console.log('PASS:24 fresh retention contexts, original bytes unchanged');
}catch(e){raw.failures.push({message:e.stack});save();throw e;}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
