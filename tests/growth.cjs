const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH});
 try{
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const ready=()=>page.waitForFunction(()=>document.querySelector('#petCamera').onclick);
  await ready();
  const settings=page.locator('.play-board > details');
  assert.equal(await page.locator('header .credits').count(),0);
  assert.equal(await settings.locator('.credits').count(),1);
  assert.equal(await settings.locator('.credits a').getAttribute('href'),'https://onara-mp3.com/?lang=ja');
  assert.equal(await settings.getAttribute('open'),null);
  await settings.evaluate(el=>el.open=true);
  assert(await settings.locator('.credits').innerText().then(text=>text.includes('Onara Sound MP3')));
  await page.evaluate(()=>document.querySelector('#closeSettings').click());
  assert.equal(await page.locator('#level').evaluate(el=>el.parentElement.firstChild.textContent.trim()),'れんしゅうコース');
  assert.deepEqual(await page.locator('#level option').evaluateAll(options=>options.map(o=>[o.textContent,o.disabled])),[
   ['あいうえお',false],['ローマじ',false],['ことば',false],['ながい ことば',false],['ぶん',false]
  ]);
  await page.selectOption('#level','5');
  assert.deepEqual(await page.evaluate(()=>[s.level,s.family.maxLevel,coinReward(false)]),[5,5,30]);
  await page.selectOption('#level','1');
  await page.evaluate(()=>{
   s.family.petSolved=s.solved=4;s.coins=200;streak=4;
   q=questions.find(w=>w.rare);typed='';remaining=q.romaji;pos=0;draw();
  });
  const word=await page.evaluate(()=>q.romaji);
  await page.keyboard.type(word);
  const dialog=page.locator('#celebration');
  await page.locator('.page-evolution').waitFor();
  assert.deepEqual(await page.evaluate(()=>[s.solved,s.coins,stage()]),[5,260,1]);
  const evo=page.locator('.page-evolution');
  await page.waitForFunction(()=>document.querySelector('.page-evolution h2')?.textContent==='しんか おめでとう！');
  assert.equal(await evo.locator('.cracker-rain span').count(),28);
  assert.equal(await evo.locator('button').count(),0);
  assert(await evo.locator('.evolution-flow-text span').count()>1);
  assert(await evo.locator('.evolution-flow-detail span').count()>1);
  await page.waitForFunction(()=>!document.querySelector('.page-evolution'),null,{timeout:3000});
  assert.equal(await dialog.getAttribute('data-kind'),'jackpot');
  assert.equal(await page.locator('#eventDetail').innerText(),'＋60 コイン');
  await page.click('#skipEvent');
  await page.waitForFunction(()=>!pending&&typed==='');
  const trace=[];
  for(let care=1;care<=12;care++){
   await page.evaluate(i=>{s.coins+=100;cooldown=0;care(i%3)},care);
   const events=[];
   if([1,4,12].includes(care)){
    await page.locator('.page-evolution').waitFor();
    events.push('evolution');
    assert.equal(await page.locator('.page-evolution button').count(),0);
    assert.equal(await page.locator('.page-evolution .cracker-rain span').count(),28);
    await page.waitForFunction(()=>!document.querySelector('.page-evolution'),null,{timeout:3000});
   }
   const row=await page.evaluate(events=>[stage(),parseFloat($('xpBar').style.width),events,$('adopt').hidden,$('growthHint').textContent,$('careNotice').textContent],events);
   trace.push(row);
   const [petStage,width,reportedEvents,hidden]=row;
   assert.equal(petStage,care<4?2:care<12?3:4);
   assert.equal(hidden,care<12);
   assert(Math.abs(width-(care<4?(care-1)/3*100:care<12?(care-4)/8*100:100))<.001);
   assert.deepEqual(reportedEvents,[1,4,12].includes(care)?['evolution']:[]);
  }
  assert.equal(trace[11][4],'おとなの くらしを たのしもう！');
  assert(!trace[11][5].includes('そだったよ'));
  await page.evaluate(()=>{
   const legacy={...s,version:5,level:5};
   legacy.family.discovered=[0,4,7];legacy.family.petSolved=8;legacy.family.maxLevel=1;
   localStorage.setItem(KEY,JSON.stringify(legacy));
  });
  await page.reload();await ready();
  assert.deepEqual(await page.evaluate(()=>[s.family.petSolved,s.family.discovered,stage(),s.level,s.family.maxLevel]),[8,[0,4,7],4,5,5]);
  assert.deepEqual(await page.locator('#level option').evaluateAll(options=>options.map(o=>o.disabled)),[false,false,false,false,false]);
  await page.evaluate(()=>localStorage.setItem(KEY,JSON.stringify({version:3,stage:2,care:4,coins:17})));
  await page.reload();await ready();
  assert.deepEqual(await page.evaluate(()=>[stage(),s.coins,s.family.maxLevel]),[4,17,5]);
  assert.deepEqual(await page.locator('#level option').evaluateAll(options=>options.map(o=>o.disabled)),[false,false,false,false,false]);
  assert.deepEqual(errors,[]);
  console.log('PASS: five courses always open, course rewards, evolution, care progress and legacy saves');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
