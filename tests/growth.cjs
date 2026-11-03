const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const ready=()=>page.waitForFunction(()=>document.querySelector('#petCamera').onclick);
  await ready();
  await page.evaluate(()=>{
   s.family.petSolved=s.solved=4;s.coins=200;streak=4;
   q=questions.find(w=>w.rare);typed='';remaining=q.romaji;pos=0;draw();
  });
  const word=await page.evaluate(()=>q.romaji);
  await page.keyboard.type(word);
  const dialog=page.locator('#celebration');
  for(const kind of ['level','evolution','jackpot']){
   if(kind==='evolution')await page.locator('.page-evolution').waitFor();else assert.equal(await dialog.getAttribute('data-kind'),kind);
   await page.keyboard.type(word);
   assert.deepEqual(await page.evaluate(()=>[s.solved,s.coins,stage()]),[5,260,1]);
   if(kind==='evolution')await page.getByText('しんか おめでとう！',{exact:true}).waitFor();
   if(kind==='jackpot')assert.equal(await page.locator('#eventDetail').innerText(),'＋60 コイン');
   if(kind==='evolution')await page.locator('.page-evolution button').click();else await page.click('#skipEvent');
  }
  await page.waitForFunction(()=>!pending&&typed==='');
  const trace=await page.evaluate(()=>{
   const trace=[];
   for(let i=1;i<=12;i++){
    s.coins+=100;cooldown=0;care(i%3);
    const events=[];
    while($('celebration').open||document.querySelector('.page-evolution')){if(document.querySelector('.page-evolution')){events.push('evolution');document.querySelector('.page-evolution button').click()}else{events.push($('celebration').dataset.kind);$('skipEvent').click()}}
    trace.push([stage(),parseFloat($('xpBar').style.width),events,$('adopt').hidden]);
   }
   return trace;
  });
  for(let care=1;care<=12;care++){
   const [stage,width,events,hidden]=trace[care-1];
   assert.equal(stage,care<4?2:care<12?3:4);
   assert.equal(hidden,care<12);
   assert(Math.abs(width-(care<4?(care-1)/3*100:care<12?(care-4)/8*100:100))<.001);
   assert.deepEqual(events,care===1?['evolution']:[4,12].includes(care)?['level','evolution']:[]);
  }
  await page.evaluate(()=>{
   s.family.maxLevel=5;
   playEventQueue(growthEvents(2,stage()));
  });
  for(const level of [2,3,4]){
   assert.equal(await page.locator('#eventDetail').innerText(),'レベル '+level+' → '+(level+1));
   if(level<4)await page.keyboard.press('Escape');
  }
  await dialog.waitFor({state:'hidden',timeout:3500});
  await page.evaluate(()=>{
   const legacy={...s,version:5};
   legacy.family.discovered=[0,4,7];legacy.family.petSolved=8;
   localStorage.setItem(KEY,JSON.stringify(legacy));
  });
  await page.reload();await ready();
  assert.deepEqual(await page.evaluate(()=>[s.family.petSolved,s.family.discovered,stage()]),[8,[0,4,7],4]);
  await page.evaluate(()=>localStorage.setItem(KEY,JSON.stringify({version:3,stage:2,care:4,coins:17})));
  await page.reload();await ready();
  assert.deepEqual(await page.evaluate(()=>[stage(),s.coins]),[4,17]);
  assert.deepEqual(errors,[]);
  console.log('PASS: keyboard jackpot + hatch + unlock, skip, single reward, 12 care actions, gauges and legacy adult');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
