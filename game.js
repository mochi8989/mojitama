'use strict';
const $=id=>document.getElementById(id), KEY='mojitama-save-v1';
const defaults={version:6,puffMix:false,fun:0,lower:false,caseMode:'upper',hatched:false,petType:0,poop:false,sound:"classic",best:0,coins:0,solved:0,score:0,care:0,hunger:70,mood:70,clean:70,level:1,volume:35,sfxVolume:35,bgm:"off",bgmVolume:20,muted:false,lastCareAt:Date.now()};
let s={...defaults}, loaded=null;
try{let d=JSON.parse(localStorage.getItem(KEY));if(d && (!d.version||[1,2,3,4,5,6].includes(d.version))){loaded=d;s.puffMix=d.puffMix===true;s.fun=[0,25,70,100].includes(d.fun)?d.fun:d.fun===true?25:0;s.caseMode=['upper','lower','initial'].includes(d.caseMode)?d.caseMode:d.lower===true?'lower':'upper';s.lower=s.caseMode==='lower';s.petType=Number.isInteger(d.petType)?Math.max(0,Math.min(petArt.types.length-1,d.petType)):0;s.poop=d.poop===true;for(let k of ['best','coins','solved','score','care','hunger','mood','clean','level','volume','sfxVolume','bgmVolume','lastCareAt'])if(Number.isSafeInteger(d[k]))s[k]=Math.max(0,Math.min(['hunger','mood','clean','volume'].includes(k)?100:Number.MAX_SAFE_INTEGER,d[k]));s.lastCareAt=Number.isSafeInteger(d.lastCareAt)?d.lastCareAt:Date.now();s.sfxVolume=Number.isInteger(d.sfxVolume)?Math.max(0,Math.min(100,d.sfxVolume)):s.volume;s.bgmVolume=Number.isInteger(d.bgmVolume)?Math.max(0,Math.min(100,d.bgmVolume)):20;s.bgm=['off','pico','nyan','slow','fast','sleep'].includes(d.bgm)?d.bgm:'off';s.hatched=[5,6].includes(d.version)?d.hatched===true:s.solved>=5||([2,3].includes(d.version)&&s.care>=1)||(d.version===4&&d.hatched===true);s.sound=["classic","puff","sparkle","meow","drum","bubble"].includes(d.sound)?d.sound:"classic";s.muted=d.muted===true}}catch{}
// Three-stage saves used index 2 for the adult.
if(loaded && (loaded.version||1)<=3 && loaded.stage===2){
  s.hatched=true;
  s.care=Math.max(12,s.care);
}
// Calendar days follow the device clock, including month and year boundaries.
function recentDates(now = new Date()) {
  return [0, 1, 2].map(offset => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    return [day.getFullYear(), String(day.getMonth()+1).padStart(2,'0'), String(day.getDate()).padStart(2,'0')].join('-');
  });
}
s.daily = {};
for (const date of recentDates()) {
  const row = loaded?.daily?.[date];
  if (row && [row.solved,row.care].every(n=>Number.isSafeInteger(n)&&n>=0)) s.daily[date]=row;
}
function recordPlay(field) {
  const dates = recentDates();
  for (const key of Object.keys(s.daily)) if (!dates.includes(key)) delete s.daily[key];
  const today = s.daily[dates[0]] ??= {solved:0,care:0};
  today[field]++;
}
function drawDailyLog() {
  const labels=['きょう','きのう','おととい'];
  $('dailyRows').replaceChildren(...recentDates().map((date,i)=>{
    const cell=document.createElement('div'), title=document.createElement('b'), value=document.createElement('span');
    title.textContent=labels[i];
    const row=s.daily[date];
    value.textContent=row ? 'せいかい '+row.solved+'もん ・ おせわ '+row.care+'かい' : 'きろくなし';
    cell.append(title,value);
    return cell;
  }));
}
window.addEventListener('focus',drawDailyLog);
function refreshAtMidnight() {
  const now=new Date(), next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  setTimeout(()=>{drawDailyLog();refreshAtMidnight()},next-now+50);
}
refreshAtMidnight();
s.family=Family.initial(loaded);
if(s.hatched&&!s.family.discovered.includes(s.petType))s.family.discovered.push(s.petType);
const stages=['たまご','あかちゃん','こども','せいちょう期','おとな'];
const stage=()=>!s.hatched?0:s.care>=12?4:s.care>=4?3:s.care>=1?2:1;
const unlocked=()=>Math.min(5,Math.max(s.family.maxLevel||1,1+[5,15,30,50].filter(n=>s.solved>=n).length,[1,2,2,3,4][stage()]));
s.family.maxLevel=unlocked();
s.level=Math.max(1,Math.min(unlocked(),s.level));
const serialize=()=>JSON.stringify({...s,xp:s.care*10,stage:stage(),unlocked:unlocked()});
function save(){try{s.family.maxLevel=unlocked();localStorage.setItem(KEY,serialize());return true}catch{$('status').textContent='このブラウザでは ほぞんできないよ';return false}}
const groups=['QAZ','WSX','EDC','RTFGVB',' ','','YUHJNM','IK,','OL.','P;/-'], names=['こゆび','くすりゆび','なかゆび','ひとさしゆび','おやゆび'];
for(let i=0;i<10;i++){let f=document.createElement('span');f.className='finger';f.id='finger'+i;$(i<5?'leftHand':'rightHand').append(f)}
for(let row of ['QWERTYUIOP-','ASDFGHJKL;','ZXCVBNM,./',' ']){let r=document.createElement('div');r.className='keyrow';for(let k of row){let b=document.createElement('button');b.className='key'+('ASDFJKL;'.includes(k)?' home':'')+(k===' '?' space':'');b.textContent=k===' '?'スペース':k;b.dataset.key=k;b.onclick=()=>press(k);r.append(b)}$('keyboard').append(r)}
let audio;
const puffClips = ['001','003','015','038','047','053'].map(id => new Audio('./assets/audio/onara_'+id+'.mp3'));
let puffSound = puffClips[0];
let puffBag = [];
function nextPuff(){
  if (!s.puffMix) return puffClips[0];
  if (!puffBag.length) {
    puffBag = [...puffClips];
    for (let i=puffBag.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [puffBag[i],puffBag[j]]=[puffBag[j],puffBag[i]];
    }
    const last=puffBag.length-1;
    if (puffBag[last]===puffSound) [puffBag[0],puffBag[last]]=[puffBag[last],puffBag[0]];
  }
  return puffBag.pop();
}
function tone(hz,t=.09,delay=0,wave="sine",end=hz,level=1,channel="sfx"){if(s.muted||!s.sfxVolume)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});let o=audio.createOscillator(),g=audio.createGain(),a=audio.currentTime+delay;o.type=wave;o.frequency.setValueAtTime(hz,a);o.frequency.exponentialRampToValueAtTime(end,a+t);g.gain.setValueAtTime(.0001,a);g.gain.exponentialRampToValueAtTime((channel==="bgm"?s.bgmVolume:s.sfxVolume)*.001*level,a+.008);g.gain.exponentialRampToValueAtTime(.0001,a+t);o.connect(g);g.connect(audio.destination);o.start(a);o.stop(a+t);return o}catch{}}
const questions=window.wordCatalog.map(w=>({...w,jp:w.display,parts:Roman.segments(w.reading)}));
const deck=makeDeck(questions,{getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)},KEY+'-bags-v3');
const letter=(k,index=0)=>s.caseMode==='lower'?k.toLowerCase():s.caseMode==='initial'&&index>0?k.toLowerCase():k.toUpperCase();
let typed='', remaining='';
function refreshSettings(){
  $('fun').value=String(s.fun);
  $('letterCase').value=s.caseMode;
  for(const key of document.querySelectorAll('[data-key]'))if(key.dataset.key!==' ')key.textContent=s.caseMode==='lower'?key.dataset.key.toLowerCase():key.dataset.key.toUpperCase();
}
$('fun').onchange=e=>{s.fun=Number(e.target.value);save();refreshSettings();e.target.blur()};
$('letterCase').onchange=e=>{s.caseMode=e.target.value;s.lower=s.caseMode==='lower';save();refreshSettings();draw();e.target.blur()};
refreshSettings();
function jackpot(){if(s.muted||!s.sfxVolume)return;try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume().catch(()=>{});
  const voices=[];
  for(let [delay,start,end,len] of [[0,410,830,.17],[.19,480,1120,.42]]){
    let o=audio.createOscillator(),g=audio.createGain(),a=audio.currentTime+delay;
    o.type='sine';o.frequency.setValueAtTime(start,a);o.frequency.exponentialRampToValueAtTime(end,a+len*.72);
    g.gain.setValueAtTime(.0001,a);g.gain.exponentialRampToValueAtTime(s.sfxVolume*.00075,a+.022);
    g.gain.exponentialRampToValueAtTime(.0001,a+len);o.connect(g);g.connect(audio.destination);o.start(a);o.stop(a+len);voices.push(o);
  }
  return voices;
}catch{}}
let q,pos,streak=0,miss=false,pending=0,on=true,flash=0;
function pick(){clearTimeout(pending);pending=0;q=deck.draw(s.level,s.fun);memeRain(q);typed='';remaining=q.romaji;$('card').classList.toggle('rare',!!q.rare);$('rareLabel').textContent=q.rare?'✦ レアもんだい！ ✦':'';$('scene').classList.remove('won','hatch');pos=0;miss=false;$('feedback').textContent='';draw()}
function coinReward(rare){const base=[10,15,20,25,30][s.level-1]||10;return base*(rare?5:1)}
function bonus(){return miss?0:(streak+1)%10===0?20:(streak+1)%5===0?10:0}
function draw(){let word=typed+remaining,next=remaining[0];$('card').classList.toggle('long-prompt',q.difficulty===5||word.length>12||q.jp.length>8);$('jpword').textContent=q.jp;$('romaji').replaceChildren(...[...word].map((c,i)=>{let a=document.createElement('span');a.className=i<pos?'done':i===pos?'next':'';a.textContent=letter(c,i);return a}));document.querySelectorAll('.target').forEach(x=>x.classList.remove('target'));if(next){document.querySelector('[data-key="'+next+'"]').classList.add('target');let i=groups.findIndex(x=>x.includes(next));$('finger'+i).classList.add('target');$('guide').textContent='「'+letter(next,pos)+'」　'+(i<5?'ひだり':'みぎ')+'の '+names[i<5?i:9-i];$('reward').textContent='🪙 このもんだい ＋'+(coinReward(!!q.rare)+bonus())}else $('guide').textContent='できたね！'}
function press(k){if(!on||pending||!remaining||$('celebration').open||celebrationBusy)return;k=k.toUpperCase();const suffix=Roman.guide(q.parts,typed+k);if(suffix===null){miss=true;streak=0;draw();let x=document.querySelector('.next');x.classList.add('wrong');clearTimeout(flash);flash=setTimeout(()=>x.classList.remove('wrong'),320);$('feedback').textContent='だいじょうぶ。きいろい キーを おそう！';tone(210);return}typed+=k;pos=typed.length;remaining=suffix;draw();if(!q.rare||remaining.length)typingSound();if(remaining.length){$('feedback').textContent='いいね！';return}
 const previousLevel=unlocked(), previousStage=stage();
 const rare=!!q.rare, gain=coinReward(rare)+bonus();
 streak=miss?0:streak+1;
 s.best=Math.max(s.best,streak);s.family.bestByLevel??={};s.family.bestByLevel[s.level]=Math.max(s.family.bestByLevel[s.level]||0,streak);
 s.solved++;
 s.family.totalSolved=s.solved;
 s.score=(s.solved%10||10)*100;
 recordPlay('solved');
 if(s.family.active){
   s.family.petSolved++;
   if(s.family.petSolved%5===0)for(const key of Object.keys(statNames))s[key]=Math.max(0,s[key]-5);
   s.hatched||=s.family.petSolved>=5;
 }
 if(s.hatched&&!s.family.discovered.includes(s.petType))s.family.discovered.push(s.petType);
 s.coins+=gain;
 save();
 update();
 $('feedback').textContent=(rare?'だいあたり！ ＋':'せいかい！ ＋')+gain+' コイン'+(streak===10?'　パーフェクト！':streak>0&&streak%5===0?'　すごい！':'');if(streak===5||streak===10)tone(streak===10?1046:784,.3,0,'triangle',streak===10?1568:1175,.8);if(s.solved%10===0){$('feedback').textContent+='　🏅 きんメダル！';tone(1318,.35,.1,'triangle',1760,.9);s.family.medals??=[];const medal='ステージ '+Math.ceil(s.solved/10)+' の きんメダル';if(!s.family.medals.includes(medal))s.family.medals.push(medal)}
 const events=growthEvents(previousLevel,previousStage);
 if(rare)events.push(['jackpot',gain,gain]);
 else if(!events.length)victorySound(streak,false);
 memeRain(q);
 playEventQueue(events,()=>{pending=setTimeout(pick,rare?600:450)});
}
window.addEventListener('keydown',e=>{if($('typingPanel').hidden||document.querySelector('dialog[open]')||!on||e.repeat||e.isComposing||e.altKey||e.metaKey||e.ctrlKey||e.target.closest('select,input,details'))return;if(/^[a-z,.;/-]$/i.test(e.key)||(e.code==='Space'&&!e.target.closest('button'))){e.preventDefault();press(e.key.toUpperCase())}});
const items=[['🍙','ごはん',20,{hunger:20}],['⚽','あそぶ',30,{mood:30}],['🛁','おふろ',20,{clean:40}],['🧹','おそうじ',0,{clean:20}],['🌟','せいちょうキャンディ',80,{hunger:0}]];
const statNames={hunger:'おなか',mood:'きげん',clean:'きれい'};
const wishes={hunger:'おなかがすいたよ',mood:'いっしょにあそぼ！',clean:'あわあわしたいな'};
const primary={0:'ごはん',1:'あそぶ',2:'おふろ',3:'おそうじ'};
const buttons=[];
let cooldown=0,anim=0,petFrame=0,reactionTimer=0,reaction='',adultTick=0;
function care(i){
  const [icon,name,price,effects]=items[i];
  if(!s.family.active||$('celebration').open||celebrationBusy||performance.now()<cooldown)return;
  const card=$('card');
  if(!$('typingPanel').hidden)card.focus({preventScroll:true});
  if(s.coins<price){
    $('careNotice').textContent='あと '+(price-s.coins)+' コイン。タイピングでコインをあつめよう！';
    card.classList.remove('invite');void card.offsetWidth;card.classList.add('invite');return;
  }
  cooldown=performance.now()+650;
  const old=stage(),previousLevel=unlocked();recordPlay('care');s.lastCareAt=Date.now();s.coins-=price;if(i!==3){s.care++;if(i===0)s.hatched||=s.family.petSolved>=5}if(i===3)s.poop=false;
  for(const [key,value] of Object.entries(effects)){
    const amount=Math.min(100-s[key],value);s[key]+=amount;
    const number=$(key+'Num');number.dataset.gain='+'+amount;
    number.classList.remove('gain');void number.offsetWidth;number.classList.add('gain');
  }
  if(s.hatched&&!s.family.discovered.includes(s.petType))s.family.discovered.push(s.petType);
  save();update();
  const evo=stage()>old;
  $('careNotice').textContent=['😋 おいしい！ ❤️','⭐ たのしい！ ♪','🫧 さっぱり！ ✨','✨ ぴかぴか！'][i]||(i===4&&evo?'🌟 キャンディを つかったよ！':icon+' '+name+'、ありがとう！');
  playReaction(i);tone([660,740,420,300][i]||660,.2);
  if(evo)playEventQueue(growthEvents(previousLevel,old));
}
for(const i of items.keys()){
  const [icon,name,price,effects]=items[i],b=document.createElement('button');
  b.className=Object.keys(effects)[0];
  b.innerHTML='<span class="emoji">'+icon+'</span>'+(primary[i]||name)+'<span class="effects">'+Object.entries(effects).map(([k,v])=>statNames[k]+' +'+v).join('・')+'</span><b>🪙 '+price+'</b><small></small>';b.setAttribute('aria-label',(primary[i]||name)+'。'+Object.entries(effects).map(([k,v])=>statNames[k]+' '+v+'アップ').join('、')+'。'+price+'コイン');
  b.onclick=()=>care(i);$('basic').append(b);buttons[i]=b;
}
function updateGrowth(st){
 const lower=[0,0,1,4,12][st], target=[5,1,4,12,12][st];
 const current=st===0?s.family.petSolved:s.care;
 const left=Math.max(0,target-current);
 $('xp').textContent=s.care*10+' XP';
  $('growthHint').textContent=st===4?'おとなの くらしを たのしもう！':st===0?'ふかまで あと '+left+'もん':stages[st+1]+'まで おせわ あと '+left+'かい';
 $('xpBar').style.width=(st===4?100:100*(current-lower)/(target-lower))+'%';
}
function update(){drawDailyLog();let st=stage();$('lastResult').hidden=!s.solved;$('resultCaption').textContent='🌟 せいかい '+s.solved+'もん ・ スコア '+s.score+'/1000 ・ ベスト '+s.best+'れんぞく';$('coins').textContent=s.coins;$('solved').textContent=s.solved+'　🏅 '+(s.solved%10||10)+'/10　'+s.score+'/1000';for(let k of ['hunger','mood','clean']){$(k+'Bar').style.width=s[k]+'%';$(k+'Num').textContent=s[k]}updateGrowth(st);$('growth').textContent=stages[st];$('petName').textContent=!s.hatched&&s.family.origin!=='starter'?'たまご':petArt.types[s.petType].name;drawCharacter(petFrame);$('level').replaceChildren(...['あいうえお','ローマじ','ことば','ながい ことば','ぶん'].map((n,i)=>{let o=new Option((i+1)+'　'+n+(i+1>unlocked()?' 🔒':''),i+1);o.disabled=i+1>unlocked();return o}));$('level').value=s.level;$('wish').textContent=s.poop?(Date.now()-s.lastCareAt>=3*86400000?'うんちっちで たいへん！ おそうじしよう！':'うんちっちしちゃった！'):Object.keys(wishes).filter(k=>s[k]<=40).sort((a,b)=>s[a]-s[b]).map(k=>wishes[k])[0]||'きょうも いっしょに あそぼう！';buttons.forEach((b,i)=>{let [,,p]=items[i];b.classList.toggle('needed',i===3?s.poop:i<3&&s[Object.keys(items[i][3])[0]]<=40);b.disabled=!s.family.active;b.querySelector('small').textContent=i===3?'いつでも 0コイン':s.coins<p?'あと '+(p-s.coins)+' コイン':'おせわする'});$('petWish').textContent=s.poop?(Date.now()-s.lastCareAt>=3*86400000?'うんちっちで たいへん！':'うんちっちしちゃった！'):s.hunger<=35?'おなかがすいたよ〜':s.mood<=35?'いっしょにあそぼ！':s.clean<=35?'おふろにはいりたい！':'';familyStatus()}
$('level').onchange=e=>{s.level=+e.target.value;save();pick();e.target.blur();if($('card').getBoundingClientRect().top<0)$('card').scrollIntoView({block:'start'})};$('mute').checked=s.muted;$('mute').onchange=e=>{s.muted=e.target.checked;puffSound.muted=s.muted;save();playBgm()};$('vol').value=s.bgmVolume;$('vol').oninput=e=>{s.bgmVolume=+e.target.value;save();playBgm()};$('sfxVol').value=s.sfxVolume;$('sfxVol').oninput=e=>{s.sfxVolume=+e.target.value;save();tone(520)};$('bgm').value=s.bgm;$('bgm').onchange=e=>{s.bgm=e.target.value;save();playBgm()};initFamily();update();drawCharacter(0);pick();

let bgmTimer=0,bgmStep=0;const tunes={pico:[523,659,784,659],nyan:[659,784,880,784],slow:[392,523,440,349],fast:[784,988,1175,988],sleep:[330,392,330,262]};function playBgm(){clearInterval(bgmTimer);if(s.muted||!s.bgmVolume||s.bgm==='off')return;const notes=tunes[s.bgm];bgmTimer=setInterval(()=>{if(!s.muted&&s.bgmVolume)tone(notes[bgmStep++%notes.length],.16,0,'sine',notes[bgmStep%notes.length],.3,'bgm')},s.bgm==='fast'?220:520)}
function typingSound(){
  if(s.sound==='puff'){
    if (s.muted || !s.sfxVolume) return;
    puffSound.pause();
    puffSound=nextPuff();
    puffSound.muted=false;
    puffSound.volume = s.sfxVolume / 100;
    puffSound.currentTime = 0;
    puffSound.play().catch(() => {});
  }else if(s.sound==='sparkle'){
    tone(740,.09,0,'sine',790,.65);
    tone(990,.12,.045,'sine',1120,.50);
  }else if(s.sound==='meow'){
    tone(550,.065,0,'triangle',810,.65);tone(810,.11,.055,'triangle',470,.5);
  }else if(s.sound==='drum'){
    tone(240,.11,0,'sine',70,.95);tone(720,.025,0,'triangle',190,.35);
  }else if(s.sound==='bubble'){
    tone(400,.08,0,'sine',1100,.7);
  }else tone(530);
}
$('keySound').value=s.sound;$('sfxVol').value=s.sfxVolume;$('bgm').value=s.bgm;$('vol').value=s.bgmVolume;
$('puffMix').checked=!!s.puffMix;
$('puffOption').hidden=s.sound!=='puff';
$('puffMix').onchange=e=>{s.puffMix=e.target.checked;puffBag=[];save();typingSound()};
$('keySound').onchange=e=>{puffSound.pause();s.sound=e.target.value;$('puffOption').hidden=s.sound!=='puff';save();typingSound()};
$('listen').onclick=typingSound;

function drawCharacter(frame=0){
 const entry=petArt.types[s.petType], pose=reaction||['idle','idle','idle','idle','blink','idle','idle','idle','idle','look'][Math.floor(adultTick/3)%10], rows=AdultArt.frame(s.petType,pose,frame,stage());$('pet').dataset.pose=pose;
 const colors=AdultArt.colors;
 $('pet').innerHTML=rows.map((row,y)=>[...row].map((cell,x)=>cell==='.'?'':`<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[cell]}"/>`).join('')).join('')+(s.poop?'<rect x="27" y="27" width="3" height="2" fill="#72503e"/>':'');
 if(pose!=='sleep'&&pose!=='eat'&&pose!=='play'&&pose!=='joy')$('pet').style.setProperty('--pet-x','50%');$('pet').dataset.frame=frame;
}
function playReaction(kind){
 reaction=['eat','play','bath','joy'][kind]||'joy';const pet=$('pet'),fx=$('careFx');clearTimeout(reactionTimer);pet.classList.remove('eat','bounce','wash','clean');
 fx.textContent=['🍙　❤️　❤️','⭐　♪　⭐','🫧　💦　✨','🧹　✨'][kind]||'✨';fx.className='carefx fx'+kind;
 pet.classList.add(['eat','bounce','wash','clean'][kind]||'bounce');petFrame=[1,2,1,0][kind]||0;drawCharacter(petFrame);
 reactionTimer=setTimeout(()=>{pet.classList.remove('eat','bounce','wash','clean');fx.textContent='';reaction='';petFrame=0;drawCharacter(0)},1500);
}
setInterval(()=>{if(!document.hidden&&!$('studio').open&&!$('book').open){adultTick++;petFrame=(petFrame+1)%3;drawCharacter(petFrame)}},420);
$('pet').onclick=()=>{if(s.family.active){playReaction(1);reaction='joy';drawCharacter(petFrame)}};
$('petBook').onclick=()=>{$('bookGrid').replaceChildren(...petArt.types.map((pet,i)=>{let b=document.createElement('button');b.className='bookPet';b.textContent=pet.name+(s.family.discovered.includes(i)?' ★':'');b.disabled=!s.family.active||s.family.origin!=='starter';b.onclick=()=>{if(b.disabled)return;s.petType=i;if(s.hatched&&!s.family.discovered.includes(i))s.family.discovered.push(i);save();update();$('book').close()};let icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 32 32');icon.setAttribute('shape-rendering','crispEdges');let rr=AdultArt.frame(i,'idle',0),cc=AdultArt.colors;icon.innerHTML=rr.map((row,y)=>[...row].map((cell,x)=>cell==='.'?'':`<rect x="${x}" y="${y}" width="1" height="1" fill="${cc[cell]}"/>`).join('')).join('');b.prepend(icon);return b}));$('book').showModal()};
$('closeBook').onclick=()=>$('book').close();
$('careFx')||(()=>{let fx=document.createElement('div');fx.id='careFx';fx.className='carefx';$('scene').append(fx)})();
$('petWish')||(()=>{let n=document.createElement('span');n.id='petWish';$('scene').append(n)})();
$('scene').append($('petWish'));
setInterval(()=>{if(!s.family.active)return;for(const k of ['hunger','mood','clean'])s[k]=Math.max(0,s[k]-1);save();update()},120000);
setInterval(()=>{if(!s.family.active)return;s.poop=true;save();update()},240000);
