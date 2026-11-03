const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined});
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.GAME_URL||require('url').pathToFileURL(path.resolve(__dirname,'../index.html')).href;
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#petCamera').onclick);
 const key='mojitama-save-v1';
 await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({version:4,coins:1000,solved:50,care:12,petType:2,best:14,muted:true,hatched:true})),key);
 await page.reload();await page.waitForFunction(()=>document.querySelector('#petCamera').onclick);
 const result=await page.evaluate(()=>{
  function ok(x,t){if(!x)throw Error(t)}
  const report=[];ok(stage()===4&&s.coins===1000&&s.best===14&&!s.fun&&!s.lower,'migration');
  const skip=()=>{while($('celebration').open||document.querySelector('.page-evolution')){if(document.querySelector('.page-evolution'))document.querySelector('.page-evolution button').click();else $('skipEvent').click()}};
  const force=w=>{skip();clearTimeout(pending);pending=0;q=w;typed='';remaining=w.romaji;miss=false;pos=0;draw()};
  q=questions.find(w=>w.reading==='しゃつ');force(q);press('s');
  $('letterCase').value='lower';$('letterCase').dispatchEvent(new Event('change'));
  ok(typed==='S'&&$('romaji').textContent==='shatsu'&&document.querySelector('[data-key="S"]').textContent==='s','lower midword');
  press('h');ok($('guide').textContent.includes('「a」')&&$('finger3').classList.contains('target')===false&&$('finger0').classList.contains('target'),'alternate guide');
  const before=s.coins;for(const k of 'aTsu')press(k);ok(s.coins===before+10,'mixed case reward');
  for(const spelling of ['KOUCHA','KOUTYA']){
   force(questions.find(w=>w.reading==='こうちゃ'));streak=0;const coins=s.coins;for(const c of spelling){press(c);if(c==='T')ok($('guide').textContent.includes('「y」')&&document.querySelector('[data-key="Y"]').classList.contains('target'),'TYA guide')}
   ok(!miss&&s.coins===coins+10&&streak===1,'equal reward');
  }
  const same=q;$('fun').value='70';$('fun').dispatchEvent(new Event('change'));ok(s.fun&&q===same,'next question only');report.push('case, guide, toggle');
  for(const w of questions){force(w);const n=s.solved;for(const c of w.romaji)press(c);ok(s.solved===n+1,w.id)}
  skip();report.push('all inputs');clearTimeout(pending);pending=0;
  for(let type=0;type<petArt.types.length;type++){
    const appearances=new Set();
    for(let st=0;st<=4;st++){
      appearances.add(AdultArt.frame(type,'idle',0,st).join(''));
      const poses=new Set();
    for(const pose of ['idle','walk','blink','sleep','eat','play','bath','joy']){
      const frames=[0,1,2].map(i=>AdultArt.frame(type,pose,i,st).join(''));ok(new Set(frames).size>=2,pose);poses.add(frames.join(':'));
    }
    if(st)ok(poses.size===8,'distinct poses '+type+' stage '+st);
    }
    ok(appearances.size===5,'five silhouettes '+type);
  }
  for(const [i,pose] of [[0,'eat'],[1,'play'],[2,'bath']]){cooldown=0;care(i);ok($('pet').dataset.pose===pose,'reaction')}
  $('pet').onclick();ok($('pet').dataset.pose==='joy','pet click');report.push('adult animations');
  $('adopt').click();$('familyBody').querySelector('button').click();ok(stage()===4,'cancel');
  const first=s.family.active,coins=s.coins;
  $('eggShop').click();$('familyBody').querySelector('button').click();ok(s.coins===coins-300&&stage()===0&&s.family.stored[0].id===first,'buy safely');
  const second=s.family.active;
  for(let i=0;i<5;i++){force(questions[0]);press(q.romaji)}
  ok(s.family.petSolved===5&&stage()===1,'hatch on own fifth word');
  skip();const solved=s.solved;changeFamily(()=>Family.swap(s,first));ok(stage()===4&&s.solved===solved,'swap');
  const bonus=s.coins;$('adopt').click();const endButtons=$('familyBody').querySelectorAll('button');ok(endButtons.length>1,'graduation buttons missing stage='+stage()+' body='+$('familyBody').textContent);endButtons[1].click();
  ok(s.coins===bonus+500&&s.family.album.length===1&&!s.family.active&&!Family.graduate(s,first),'graduate once');
  ok($('familyBody').textContent.includes('つぎの たまごを えらぶ'),'next egg offered');[...$('familyBody').querySelectorAll('button')].find(b=>b.textContent.includes('アルバム')).click();ok($('familyBody').querySelector('canvas').toDataURL().startsWith('data:image/png'),'album png');
  $('familyDialog').close();changeFamily(()=>Family.swap(s,second));ok(stage()===1,'restore stored');
  const price=s.coins;changeFamily(()=>Family.purchase(s,'rare',()=>0));ok(s.petType===6&&s.coins===price-1000,'rare egg');
  report.push('purchase, hatch, swap, graduation and album');save();return report;
 });
 await page.reload();await page.waitForFunction(()=>document.querySelector('#petCamera').onclick);
 assert(await page.evaluate(()=>s.lower&&s.fun&&stage()===0&&s.family.petSolved===0&&s.family.stored.length===1&&s.family.album.length===1&&s.family.claimed.length===1&&s.family.purchases.length===2&&$('letterCase').value==='lower'&&$('fun').value==='70'));
 await page.click('#album');const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:/PNGほぞん/}).click()]);assert.match(download.suggestedFilename(),/\.png$/);
 await page.click('#familyClose');await page.click('#recordCamera');assert(await page.locator('#studio').evaluate(e=>e.open));
 await page.evaluate(()=>{document.getElementById('studio').close();s.hatched=true;s.care=12;s.coins=0;update()});
 await page.click('#adopt');await page.getByRole('button',{name:'旅に出す',exact:true}).click();
 assert(await page.getByRole('button',{name:/レアなたまご.*あと 500/}).isDisabled());
 await page.getByRole('button',{name:/ふつうのたまご.*300/}).click();
 await page.reload();await page.waitForFunction(()=>document.querySelector('#petCamera').onclick);
 assert(await page.evaluate(()=>s.family.origin==='normal'&&stage()===0&&s.coins===200&&s.family.album.length===2));
 assert.deepEqual(errors,[]);console.log('PASS browser:',result,'reload, album download, record card');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
