'use strict';
const victoryTunes = [
  [523,659,784,1047], [587,740,659,880], [784,659,784,988],
  [494,587,740,988], [659,880,784,1047], [523,784,988,1175]
];
let previousTune = -1;
function victorySound(combo, rare) {
  if (s.muted || !s.volume) return;
  const milestone = combo > 0 && combo % 5 === 0;
  const grand = milestone && combo % 10 === 0;
  let notes;
  if (rare) notes = [523,659,784,1047,1319,1568];
  else if (grand) notes = [392,523,659,784,1047,1319,1568];
  else if (milestone) notes = [440,554,659,880,1109];
  else {
    previousTune = (previousTune + 1 + Math.floor(Math.random() * (victoryTunes.length - 1))) % victoryTunes.length;
    notes = victoryTunes[previousTune];
  }
  notes.forEach((hz,i) => {
    const last = i === notes.length - 1;
    tone(hz,last ? .18 : .085,i*.065,'triangle',hz,.68);
    if (last || milestone || rare) tone(hz/2,.13,i*.065,'sine',hz/2,.38);
  });
  if (rare) jackpot();
}
function memeRain(word) {
  const layer = $('memeRain');
  layer.replaceChildren();
  if (word.kind !== 'fun' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const art = /さふーる/.test(word.reading) ? 'drum' : /ねこ|こねこ|にゃんこ|にくきゅう/.test(word.reading) ? 'cat' : null;
  if (!art) return;
  for (let i=0;i<6;i++) {
    const img=document.createElement('img');
    img.alt='';img.src='./assets/twemoji/'+art+'.svg';
    img.style.left=(4+i*16)+'%';img.style.animationDelay=(i*.08)+'s';
    img.addEventListener('animationend',()=>img.remove(),{once:true});layer.append(img);
  }
}

function growthEvents(oldLevel,oldStage){
  const events=[];
  for(let level=oldLevel;level<unlocked();level++)events.push(['level',level,level+1]);
  if(stage()>oldStage)events.push(['evolution',oldStage,stage()]);
  return events;
}

let celebrationBusy=false;
function playEventQueue(events,done=()=>{}){
  function next(){
    if(!events.length){celebrationBusy=false;done();return}
    const [kind,from,to]=events.shift();
    celebrationBusy=true;
    if(kind==='evolution'){
      const page=document.createElement('div');page.className='page-evolution';
      const title=document.createElement('h2');title.textContent='おや？ ひかっているよ！';
      const detail=document.createElement('strong');detail.textContent=stages[from]+' → '+stages[to];
      const skip=document.createElement('button');skip.type='button';skip.textContent='スキップ';
      const rain=document.createElement('div');rain.className='cracker-rain';rain.setAttribute('aria-hidden','true');
      for(let i=0;i<28;i++){const piece=document.createElement('span');piece.textContent=['🎉','🎊','⭐','✨','💗'][i%5];piece.style.left=(i*37%100)+'%';piece.style.animationDelay=(i%9)*.1+'s';rain.append(piece)}
      page.append(rain,title,detail,skip);document.body.append(page);
      reaction='joy';drawCharacter(petFrame);$('pet').classList.add('evolve');
      const voices=[tone(659,.12,0,'triangle',659,.53),tone(784,.12,.1,'triangle',784,.53),tone(988,.12,.2,'triangle',988,.53),tone(1319,.2,.3,'triangle',1319,.6)];
      const reveal=setTimeout(()=>{title.textContent='しんか おめでとう！';},650);
      let finished=false;
      const timer=setTimeout(finish,2200);
      function finish(){if(finished)return;finished=true;clearTimeout(timer);clearTimeout(reveal);voices.forEach(voice=>voice?.stop());page.remove();$('pet').classList.remove('evolve');reaction='';drawCharacter(0);next()}
      skip.onclick=finish;
      return;
    }
    const dialog=$('celebration'), ctx=$('eventPet').getContext('2d');
    const evolution=kind==='evolution', level=kind==='level';
    let revealed=!evolution, frame=0;
    function paint(){
      ctx.clearRect(0,0,32,32);
      const st=evolution?(revealed?to:from):stage();
      const pose=!revealed?'idle':kind==='jackpot'?'play':'joy';
      AdultArt.frame(s.petType,pose,frame++,st).forEach((row,y)=>[...row].forEach((c,x)=>{
        if(c!== '.'){ctx.fillStyle=AdultArt.colors[c];ctx.fillRect(x,y,1,1)}
      }));
    }
    dialog.dataset.kind=kind;
    $('eventTitle').textContent=evolution?'おや？ ひかっているよ！':level?'レベルアップ！':'だいあたり！';
    $('eventDetail').textContent=evolution?stages[from]+' → '+stages[to]:level?'レベル '+from+' → '+to:'＋'+from+' コイン';
    $('eventStars').textContent=evolution?'✦　💗　✧　💗　✦':level?'🎊　⭐　🎉　⭐　🎊':'🌈　⭐　🪙　🌟　🪙　🌈';
    dialog.showModal();
    paint();
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation=reduced?0:setInterval(paint,220);
    const notes=level?[523,659,784,1047]:[659,784,988,1319];
    let voices=[];
    function chime(){voices=notes.map((hz,i)=>tone(hz,.12,i*.1,'triangle',hz,.53))}
    let reveal=0;
    if(evolution)reveal=setTimeout(()=>{
      revealed=true;paint();$('eventTitle').textContent='しんか おめでとう！';chime();
    },650);
    else if(level)chime();else voices=jackpot()||[];
    const timer=setTimeout(finish,evolution?2050:1750);
    function finish(){
      clearTimeout(timer);clearTimeout(reveal);clearInterval(animation);
      for(const voice of voices)voice?.stop();
      dialog.close();next();
    }
    $('skipEvent').onclick=finish;
    dialog.oncancel=e=>{e.preventDefault();finish()};
  }
  next();
}
