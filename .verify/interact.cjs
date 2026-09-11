/* Interaction smoke test. Fidelity scoring compares markup; it cannot tell that a click
   handler sets state nothing renders. Both modals were silently dead for two commits
   because only the markup was checked. */
const puppeteer=require('/home/yashang/web-crawl-kit/node_modules/puppeteer-core');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const B='http://localhost:5180';
let fail=0;
const ok=(name,pass)=>{ console.log(`  ${pass?'PASS':'FAIL'}  ${name}`); if(!pass) fail++; };
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',
    args:['--no-sandbox','--disable-setuid-sandbox'],defaultViewport:{width:1680,height:1100}});
  const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));

  await p.goto(B+'/attendance',{waitUntil:'networkidle2'}); await sleep(2200);
  const bar=await p.evaluate(()=>{const tr=[...document.querySelectorAll('tbody tr')].find(r=>r.textContent.includes('Sat 06, Sep'));
    const r=tr.children[3].getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.move(bar.x,bar.y); await sleep(900);
  ok('hover card opens', await p.evaluate(()=>[...document.querySelectorAll('span')].some(x=>x.textContent.trim()==='STD4')));

  for (const tab of ['STC2','All']) {
    const t=await p.evaluate(l=>{const s=[...document.querySelectorAll('span')].find(x=>x.textContent.trim()===l&&x.className.includes('cursor-pointer'));
      if(!s)return null; const r=s.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};},tab);
    if(!t){ ok(`tab ${tab} present`,false); continue }
    await p.mouse.move(t.x,t.y); await sleep(150); await p.mouse.click(t.x,t.y); await sleep(400);
    ok(`tab ${tab} keeps the card open`, await p.evaluate(()=>[...document.querySelectorAll('span')].some(x=>x.textContent.trim()==='STD4')));
  }

  const pin=await p.evaluate(()=>{const el=document.querySelector('.icon-marker-pin-01');
    if(!el)return null; const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  if(pin){ await p.mouse.move(pin.x,pin.y); await sleep(200); await p.mouse.click(pin.x,pin.y); await sleep(2200); }
  ok('location pin opens the map', await p.evaluate(()=>document.body.innerText.includes('Attendance Locations')));
  ok('map draws the site boundary', await p.evaluate(()=>document.body.innerText.includes('Site boundary')));
  await p.keyboard.press('Escape'); await sleep(500);


  await p.goto(B+'/work-locations/add',{waitUntil:'networkidle2'}); await sleep(2200);
  await p.click('input[placeholder="Bopal Site — Phase 2"]');
  await p.keyboard.type('Focus Test',{delay:35});
  ok('typing keeps focus', await p.$eval('input[placeholder="Bopal Site — Phase 2"]',el=>el.value)==='Focus Test');
  await p.evaluate(()=>{const l=[...document.querySelectorAll('label')].find(x=>x.textContent.trim()==='Designation');
    l.scrollIntoView({block:'center'});});
  await sleep(500);
  const trig=await p.evaluate(()=>{const l=[...document.querySelectorAll('label')].find(x=>x.textContent.trim()==='Designation');
    const t=l.parentElement.querySelector('[class*="min-h-9"]'); const r=t.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.click(trig.x,trig.y); await sleep(400);
  const before=await p.evaluate(()=>[...document.querySelectorAll('label')].some(x=>x.textContent.trim()==='Recruiter'));
  const opt=await p.evaluate(()=>{const l=[...document.querySelectorAll('label')].find(x=>x.textContent.trim()==='Site Engineer');
    if(!l)return null; const r=l.getBoundingClientRect(); return {x:r.x+25,y:r.y+r.height/2};});
  if(opt){ await p.mouse.click(opt.x,opt.y); await sleep(300); }
  ok('multi-select stays open while ticking',
     before && await p.evaluate(()=>[...document.querySelectorAll('label')].some(x=>x.textContent.trim()==='Recruiter')));

  for (const [name,url] of [['Team','/attendance?tab=Team'],['Organization','/attendance?tab=Organization'],
                            ['Operational Config','/operational-config'],['Requests','/attendance/ar-requests'],
                            ['Site Visit Report','/reports/site-visit'],['Work Locations','/work-locations']]) {
    await p.goto(B+url,{waitUntil:'networkidle2'}); await sleep(1500);
    ok(`${name} renders`, await p.evaluate(()=>document.body.innerText.length>400));
  }

  ok('no page errors', errs.length===0);
  if(errs.length) console.log('   ', errs.slice(0,3));
  console.log(fail? `\n${fail} FAILING` : '\nAll interactions pass.');
  await b.close(); process.exit(fail?1:0);
})();
