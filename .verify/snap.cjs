/* Render each built screen to static HTML so CollabCrawl's verify_fidelity.py can
   score it against the crawled DOM. This is the gate that was missing. */
const puppeteer=require('/home/yashang/web-crawl-kit/node_modules/puppeteer-core');
const fs=require('fs'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SCREENS=[['attendance_self','/attendance'],['attendance_team','/attendance?tab=Team'],
  ['attendance_organization','/attendance?tab=Organization'],
  ['operational_config_business_unit','/operational-config']];
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',
    args:['--no-sandbox','--disable-setuid-sandbox'],defaultViewport:{width:1680,height:1600}});
  const p=await b.newPage();
  for(const [name,url] of SCREENS){
    await p.goto('http://localhost:5180'+url,{waitUntil:'networkidle2',timeout:30000}).catch(()=>{});
    await sleep(2500);
    fs.writeFileSync(`.verify/${name}.html`, await p.content());
    console.log('snapped', name);
  }
  await b.close();
})();
