'use strict';
const $=id=>document.getElementById(id), KEY='mojitama-save-v1';
const defaults={version:3,hatched:false,coins:0,solved:0,care:0,hunger:70,mood:70,clean:70,level:1,volume:35,muted:false};
let s={...defaults}, storageOK=true;
try{let d=JSON.parse(localStorage.getItem(KEY));if(d && (!d.version||[2,3].includes(d.version))){for(let k of ['coins','solved','care','hunger','mood','clean','level','volume'])if(Number.isSafeInteger(d[k]))s[k]=Math.max(0,Math.min(['hunger','mood','clean','volume'].includes(k)?100:Number.MAX_SAFE_INTEGER,d[k]));s.hatched=s.solved>=3||(d.version===3?d.hatched===true:s.care>=1);s.muted=d.muted===true}}catch{}
const limits=[0,1,4,12], stages=['たまご','あかちゃん','こども','おとな'],stage=()=>s.hatched?(s.care>=12?3:s.care>=4?2:1):0;
const unlocked=()=>Math.min(5,Math.max(1+[5,15,30,50].filter(n=>s.solved>=n).length,stage()+1));
s.level=Math.max(1,Math.min(unlocked(),s.level));
const serialize=()=>JSON.stringify({...s,xp:s.care*10,stage:stage(),unlocked:unlocked()});
function save(){try{localStorage.setItem(KEY,serialize())}catch{$('status').textContent='このブラウザでは ほぞんできないよ'}}
const lessons=['あ:a い:i う:u え:e お:o','か:ka き:ki く:ku け:ke こ:ko さ:sa し:si す:su せ:se そ:so た:ta ち:ti つ:tu て:te と:to な:na に:ni ぬ:nu ね:ne の:no','ねこ:neko いぬ:inu くま:kuma そら:sora はな:hana すし:susi かさ:kasa たこ:tako','りんご:ringo うさぎ:usagi たまご:tamago くるま:kuruma','ねこがすき:nekogasuki きょうははれ:kyouhahare おはよう:ohayou'].map(row=>row.split(' ').map(pair=>{let [jp,r]=pair.split(':');return {jp,forms:[r.toUpperCase()]}}));
const groups=['QAZ','WSX','EDC','RTFGVB',' ','','YUHJNM','IK,','OL.','P;/'], names=['こゆび','くすりゆび','なかゆび','ひとさしゆび','おやゆび'];
for(let i=0;i<10;i++){let f=document.createElement('span');f.className='finger';f.id='finger'+i;$(i<5?'leftHand':'rightHand').append(f)}
for(let row of ['QWERTYUIOP','ASDFGHJKL;','ZXCVBNM,./',' ']){let r=document.createElement('div');r.className='keyrow';for(let k of row){let b=document.createElement('button');b.className='key'+('ASDFJKL;'.includes(k)?' home':'')+(k===' '?' space':'');b.textContent=k===' '?'スペース':k;b.dataset.key=k;b.onclick=()=>press(k);r.append(b)}$('keyboard').append(r)}
let audio;
function tone(hz,t=.09,delay=0){if(s.muted||!s.volume)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});let o=audio.createOscillator(),g=audio.createGain(),a=audio.currentTime+delay;o.frequency.value=hz;g.gain.setValueAtTime(s.volume*.001,a);g.gain.exponentialRampToValueAtTime(.0001,a+t);o.connect(g);g.connect(audio.destination);o.start(a);o.stop(a+t)}catch{}}
const rareWords=[['うんこ 💩','UNKO'],['おなら 💨','ONARA'],['おしり 🍑','OSIRI'],['ぷりぷり','PURIPURI'],['へっぷー','HEPPU']].map(([jp,r])=>({jp,forms:[r],rare:true}));
function choose(level,previous,rand=Math.random){
  let normal=lessons[level-1],lens=normal.map(x=>x.forms[0].length);
  let rare=rareWords.filter(x=>x.forms[0].length>=Math.min(...lens)&&x.forms[0].length<=Math.max(...lens));
  let pool=rare.length&&rand()<.03?rare:normal,others=pool.filter(x=>x!==previous);
  if(others.length)pool=others;
  return pool[Math.floor(rand()*pool.length)];
}
function jackpot(){if(s.muted||!s.volume)return;try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume().catch(()=>{});
  for(let [delay,start,end,len] of [[0,410,830,.17],[.19,480,1120,.42]]){
    let o=audio.createOscillator(),g=audio.createGain(),a=audio.currentTime+delay;
    o.type='sine';o.frequency.setValueAtTime(start,a);o.frequency.exponentialRampToValueAtTime(end,a+len*.72);
    g.gain.setValueAtTime(.0001,a);g.gain.exponentialRampToValueAtTime(s.volume*.00075,a+.022);
    g.gain.exponentialRampToValueAtTime(.0001,a+len);o.connect(g);g.connect(audio.destination);o.start(a);o.stop(a+len);
  }
}catch{}}
let q,pos,streak=0,miss=false,pending=0,on=true,flash=0;
function pick(){clearTimeout(pending);pending=0;q=choose(s.level,q);$('card').classList.toggle('rare',!!q.rare);$('rareLabel').textContent=q.rare?'✦ レアもんだい！ ✦':'';$('scene').classList.remove('won','hatch');pos=0;miss=false;$('feedback').textContent='';draw()}
function bonus(){return miss?0:(streak+1)%10===0?20:(streak+1)%5===0?10:0}
function draw(){let word=q.forms[0],next=word[pos];$('jpword').textContent=q.jp;$('romaji').replaceChildren(...[...word].map((c,i)=>{let a=document.createElement('span');a.className=i<pos?'done':i===pos?'next':'';a.textContent=c;return a}));document.querySelectorAll('.target').forEach(x=>x.classList.remove('target'));if(next){document.querySelector('[data-key="'+next+'"]').classList.add('target');let i=groups.findIndex(x=>x.includes(next));$('finger'+i).classList.add('target');$('guide').textContent='「'+next+'」　'+(i<5?'ひだり':'みぎ')+'の '+names[i<5?i:9-i];$('reward').textContent='🪙 このもんだい ＋'+((q.rare?50:10)+bonus())}else $('guide').textContent='できたね！'}
function press(k){if(!on||pending)return;if(k!==q.forms[0][pos]){miss=true;streak=0;draw();let x=document.querySelector('.next');x.classList.add('wrong');clearTimeout(flash);flash=setTimeout(()=>x.classList.remove('wrong'),320);$('feedback').textContent='だいじょうぶ。きいろい キーを おそう！';tone(210);return}pos++;draw();if(!q.rare||pos<q.forms[0].length)tone(530);if(pos<q.forms[0].length){$('feedback').textContent='いいね！';return}let gain=(q.rare?50:10)+bonus(),old=unlocked(),egg=!s.hatched;streak=miss?0:streak+1;s.solved++;s.hatched||=s.solved>=3;s.coins+=gain;save();update();$('feedback').textContent=(q.rare?'だいあたり！ ＋':'せいかい！ ＋')+gain+' コイン'+(unlocked()>old?'　あたらしい レベル！':'');if(egg&&s.hatched){$('scene').classList.add('hatch');$('feedback').textContent+='　たまごが かえったよ！'}if(q.rare){$('scene').classList.add('won');jackpot()}else tone(830,.18,.1);pending=setTimeout(pick,q.rare||egg&&s.hatched?1500:750)}
window.addEventListener('keydown',e=>{if(!on||e.repeat||e.isComposing||e.altKey||e.metaKey||e.ctrlKey||e.target.closest('select,input,details'))return;if(/^[a-z,.;/]$/i.test(e.key)||(e.code==='Space'&&!e.target.closest('button'))){e.preventDefault();press(e.key.toUpperCase())}});
const items=[['🍙','おにぎり',20,{hunger:20}],['🍎','りんご',30,{hunger:30}],['🍰','ケーキ',50,{hunger:40,mood:10}],['🛁','おふろ',20,{clean:40}],['⚽','ボールあそび',30,{mood:30}],['🎀','プレゼント',50,{mood:45},1],['🎉','おたのしみ',70,{hunger:25,mood:25,clean:25},2]];
let cooldown=0,anim=0;function care(i){let [icon,name,price,effects,gate=0]=items[i];if(on||performance.now()<cooldown||stage()<gate||s.coins<price)return;cooldown=performance.now()+650;let old=stage();s.coins-=price;s.care++;for(let k in effects)s[k]=Math.min(100,s[k]+effects[k]);save();update();let evo=stage()>old;$('careNotice').textContent=evo?'✨ '+stages[stage()]+'に そだったよ！':icon+' '+name+'！ よろこんでいるよ';let pet=$('pet');clearTimeout(anim);pet.classList.remove('evolve','bounce','wash');void pet.getBoundingClientRect();pet.classList.add(evo?'evolve':'bounce');if(i===3)pet.classList.add('wash');anim=setTimeout(()=>pet.classList.remove('evolve','bounce','wash'),1100);tone(evo?880:660,.2)}
for(let [i,[icon,name,price,eff]] of items.entries()){let b=document.createElement('button');b.innerHTML='<span class="emoji">'+icon+'</span>'+name+'<b>🪙 '+price+'</b><small></small>';b.onclick=()=>care(i);$('shop').append(b)}
function update(){let st=stage();$('coins').textContent=s.coins;$('solved').textContent=s.solved;for(let k of ['hunger','mood','clean']){$(k+'Bar').style.width=s[k]+'%';$(k+'Num').textContent=s[k]}$('xp').textContent=s.care*10;$('xpBar').style.width=(st===3?100:st===0?100*s.solved/3:st===1?25*s.care:100*(s.care-4)/8)+'%';$('growth').textContent=stages[st];$('petName').textContent=['あと '+(3-s.solved)+' もんで うまれるよ！','もちっこ','もちまる','もじもち'][st];let colors={Y:'#f7cd73',W:'#fffaf3',K:'#465375',P:'#ed95b4'};let pixels=sprites[Math.min(2,st)].flatMap((r,y)=>[...r].map((c,x)=>colors[c]?'<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+colors[c]+'"/>':'')).join('');$('pet').innerHTML=pixels+(st===3?'<path fill="#f5bf37" d="M5 0l2 1 1-1 1 1 2-1-1 3H6z"/>':'')+(st===0?'<path fill="#55475d" d="M5 7h1v1H5z M10 7h1v1h-1z M7 9h2v1H7z"/>':'')+(st&&s.hunger>=90?'<path fill="#ec929e" d="M3 9h2v1H3z M11 9h2v1h-2z"/>':'');$('level').replaceChildren(...['あいうえお','ローマじ','ことば','ながい ことば','ぶん'].map((n,i)=>{let o=new Option((i+1)+'　'+n+(i+1>unlocked()?' 🔒':''),i+1);o.disabled=i+1>unlocked();return o}));$('level').value=s.level;[...$('shop').children].forEach((b,i)=>{let [,,p,,gate=0]=items[i];b.disabled=st<gate||s.coins<p;b.querySelector('small').textContent=st<gate?stages[gate]+'から':s.coins<p?'あと '+(p-s.coins)+' コイン':'おせわする'})}
function tab(t){on=t;$('typingPanel').classList.toggle('hidden',!t);$('carePanel').classList.toggle('hidden',t);$('typingTab').classList.toggle('active',t);$('careTab').classList.toggle('active',!t);pick()}
$('typingTab').onclick=$('backToTyping').onclick=()=>tab(true);$('careTab').onclick=()=>tab(false);$('level').onchange=e=>{s.level=+e.target.value;save();pick();e.target.blur()};$('mute').checked=s.muted;$('mute').onchange=e=>{s.muted=e.target.checked;save()};$('vol').value=s.volume;$('vol').oninput=e=>{s.volume=+e.target.value;save();tone(520)};update();pick();
