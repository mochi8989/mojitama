'use strict';
(()=>{
  const studio=$('studio'), canvas=$('photo'), ctx=canvas.getContext('2d'), input=$('comment');
  const ink='#393046', palette=['#ffe6ae','#d9eeff','#f8dbea','#e0dbff'];
  const accents=['#e2ae58','#83b9ce','#dd99ba','#a79ad0'];
  const rankNames=['メダルに ちょうせん！','はじめの メダル','ぎんの メダル','きんの メダル'];
  let mode='pet', snapshot, revision=0, readyFile=null;
  const box=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
  function label(str,x,y,size,width,color=ink){
    ctx.font='900 '+size+'px system-ui, sans-serif';ctx.fillStyle=color;ctx.textAlign='center';
    ctx.fillText(str,x,y,width);
  }
  function pet(x,y,unit){
    const rects=snapshot.rects;
    for(const [px,py] of rects)box(x+px*unit-3,y+py*unit-3,unit+6,unit+6,ink);
    for(const [px,py,color] of rects)box(x+px*unit,y+py*unit,unit,unit,color);
    ctx.save();ctx.translate(x,y);ctx.scale(unit,unit);
    for(const [d,color] of snapshot.details){ctx.fillStyle=color;ctx.fill(new Path2D(d))}
    ctx.restore();
  }
  function render(){
    const {st,name,rank,best}=snapshot, big=mode==='pet',accent=accents[st];
    ctx.imageSmoothingEnabled=false;
    box(0,0,1200,1200,ink);box(12,12,1176,1176,palette[st]);box(32,32,1136,1136,'#fffaf1');
    for(let n=42;n<1160;n+=40){box(n,18,18,10,accent);box(n,1170,18,10,accent)}
    label('もじたま！',600,122,76,980);label(big?'✦　ペットカード　✦':'✦　きろくカード　✦',600,184,36,960);
    box(68,214,1064,530,ink);box(76,222,1048,514,palette[st]);
    for(let i=0;i<7;i++){let x=110+i*145,y=260+(i%3)*38;box(x,y,36,12,'#fffaf1');box(x+12,y-12,12,36,'#fffaf1')}
    box(76,625,1048,111,accent);for(let i=0;i<14;i++)box(90+i*76,656+(i%2)*38,22,8,palette[st]);
    pet(big?360:133,big?235:290,big?30:26);
    if(!big){label(rank?'🏅':'☆',830,450,140,290);label(rankNames[rank],830,533,40,460);label('さいこう　'+best+' もん',830,600,40,470)}
    label(name+'　／　'+stages[st],600,815,54,1000);
    label(big?rankNames[rank]+'　・　さいこう '+best+' もん':'ミスなしで つづいた きろく',600,889,37,1010);
    box(90,932,1020,175,ink);box(96,938,1008,163,'#fff');label('ひ と こ と',600,985,28,870,ink);
    label(input.value||'きょうも できたよ！',600,1064,56,940);
    $('recordMode').setAttribute('aria-pressed',String(!big));$('petMode').setAttribute('aria-pressed',String(big));
    readyFile=null;$('sharePhoto').hidden=true;const id=++revision;
    canvas.toBlob(blob=>{
      if(!blob||id!==revision)return;
      readyFile=new File([blob],'mojitama-'+mode+'.png',{type:'image/png'});
      $('sharePhoto').hidden=!navigator.canShare?.({files:[readyFile]});
    },'image/png');
  }
  function open(initial){
    mode=initial;const st=stage();const svg=$('pet');
    snapshot={st,name:st?$('petName').textContent:'もじたま',best:s.best,rank:[1,10,50].filter(n=>s.solved>=n).length,
      rects:[...svg.querySelectorAll('rect')].map(r=>[+r.getAttribute('x'),+r.getAttribute('y'),r.getAttribute('fill')]),
      details:[...svg.querySelectorAll('path')].map(p=>[p.getAttribute('d'),p.getAttribute('fill')])};
    on=false;studio.showModal();$('photoStatus').textContent='';render();tone(680,.035);tone(360,.06,.045);
  }
  function edit(){
    let value=input.value;
    let chars=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('ja',{granularity:'grapheme'}).segment(value)].map(x=>x.segment):Array.from(value);
    input.value=chars.slice(0,10).join('');render();
  }
  input.oninput=e=>{if(!e.isComposing)edit()};input.oncompositionend=edit;
  $('petCamera').onclick=()=>open('pet');$('recordCamera').onclick=()=>open('record');
  $('recordMode').onclick=()=>{mode='record';render()};$('petMode').onclick=()=>{mode='pet';render()};
  studio.onclose=()=>{on=true;$('card').focus({preventScroll:true})};
  $('downloadPhoto').onclick=()=>{
    let a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='mojitama-'+mode+'.png';a.click();
    $('photoStatus').textContent='ほぞんを はじめたよ！';
  };
  $('sharePhoto').onclick=async()=>{if(!readyFile)return;try{await navigator.share({files:[readyFile]})}catch(e){if(e.name!=='AbortError')$('photoStatus').textContent='がぞうを ほぞん してね。'}};
})();
