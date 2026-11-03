'use strict';
function familyButton(text,action){const b=document.createElement('button');b.textContent=text;b.onclick=action;return b}
function familyText(text){const p=document.createElement('p');p.textContent=text;return p}
function changeFamily(operation){
 const before=structuredClone(s);
 if(!operation())return false;
 if(!save()){s=before;return false}
 clearTimeout(reactionTimer);reaction='';$('careFx').textContent='';$('pet').classList.remove('eat','bounce','wash','clean');update();drawCharacter(0);return true;
}
function familyStatus(){
 const f=s.family,active=!!f.active;
 $('adopt').hidden=stage()!==4||!active;$('petCamera').disabled=!active;
 for(const b of buttons)if(!active)b.disabled=true;
 if(!active){$('petName').textContent='つぎの たまごを えらぼう';$('growth').textContent='おるすばん';$('petWish').textContent='';$('wish').textContent='たまごやさんで あたらしいこを むかえられるよ。'}
 $('eggShop').textContent=active?'🥚 たまごやさん・おへや':'🥚 つぎの たまごを えらぶ';$('eggShop').classList.toggle('nextEgg',!active);
 $('pet').style.visibility=active?'visible':'hidden';
}
function initFamily(){
 const dialog=$('familyDialog'),body=$('familyBody');
 function show(title){body.replaceChildren();$('familyTitle').textContent=title;if(!dialog.open)dialog.showModal()}
 $('familyClose').onclick=()=>dialog.close();
 $('adopt').onclick=()=>{
   const target=s.family.active;show('このこを 旅に出す？');
   body.append(familyText('おとなの '+petArt.types[s.petType].name+' は、おもいでアルバムに のこるよ。きねんメダルと 500コインが もらえるよ。'),
     familyButton('まだ いっしょに いる',()=>dialog.close()),familyButton('旅に出す',()=>{
       if(changeFamily(()=>Family.graduate(s,target))){show('旅に出たよ！');body.append(familyText('🏅 きねんメダル と 500コイン！'));eggChoices();body.append(familyButton('旅のおもいでを みる',()=>album()))}
     }));
 };
 function eggChoices(){
   body.append(familyText('つぎの たまごを えらぶ　🪙 いま '+s.coins+' コイン'));
   for(const [k,e] of Object.entries(Family.eggs)){
     body.append(familyText(e.types.map(i=>petArt.types[i].name).join('・')+' の どれかが うまれるよ。'));
     const b=familyButton(e.name+'　🪙 '+e.price+' で むかえる',()=>{if(changeFamily(()=>Family.purchase(s,k)))dialog.close()});
     b.disabled=s.coins<e.price;if(b.disabled)b.textContent+='（あと '+(e.price-s.coins)+'コイン）';body.append(b);
   }
 }
 function shop(page=0){show('🥚 たまごやさん');if(s.family.active)body.append(familyText('いまのこは おへやで まっているよ。'));eggChoices();
   body.append(familyText('🏠 おへやで まっているこ：'+s.family.stored.length+'ひき'));
   if(s.family.stored.length>1)pager(page,s.family.stored.length,shop);
   for(const p of s.family.stored.slice(page,page+1))body.append(familyButton((p.hatched?petArt.types[p.petType].name:'たまご')+'（おせわ '+p.care+'かい）と こうたい',()=>{if(changeFamily(()=>Family.swap(s,p.id)))dialog.close()}));
 }

 function pager(page,count,render){const bar=document.createElement('div');const back=familyButton('◀ まえ',()=>render(page-1)),next=familyButton('つぎ ▶',()=>render(page+1));back.disabled=page===0;next.disabled=page+1>=count;bar.append(back,' '+(page+1)+' / '+count+' ',next);body.append(bar)}
 function album(page=0){
   show('🌸 おもいでアルバム');
   body.append(familyText('旅に出た '+s.family.album.length+'ひき　・　であった しゅるい '+s.family.discovered.length+' / '+petArt.types.length));
   const awards=Family.awards(s.family);if(awards.length)body.append(familyText('🏅 '+awards.join('・')));if(s.family.medals?.length)body.append(familyText('🥇 '+s.family.medals.join('・')));
   if(!s.family.album.length)body.append(familyText('旅に出たペットが ここに のこるよ。'));
   if(s.family.album.length>1)pager(page,s.family.album.length,album);
   for(const p of [...s.family.album].reverse().slice(page,page+1)){const displayName=petArt.types[p.petType]?.name||p.name;if(p.sentAt&&Date.now()>=p.sentAt)body.append(familyText('💌 '+displayName+'から おてがみが とどいたよ！「そだててくれて ありがとう。また あそぼうね！」'));else body.append(familyText(displayName+'からの おてがみは あした とどくよ。'));
     const card=document.createElement('canvas');card.width=640;card.height=480;card.setAttribute('aria-label',displayName+'の 旅の思い出カード');
     const c=card.getContext('2d'),entry=petArt.types[p.petType],colors={...AdultArt.colors,k:'#292536',c:entry.accent,y:entry.tone==='ice'?'#26364a':entry.tone==='choco'?'#a77555':'#fff0cf',p:'#f09bb5',w:'#fffdf5'};
     c.fillStyle='#fff4d9';c.fillRect(0,0,640,480);c.textAlign='center';
     const line=(t,y,size)=>{c.fillStyle='#40364b';c.font='bold '+size+'px sans-serif';c.fillText(t,320,y,600)};
     line('🌸 おもいでアルバム',46,32);
     p.pixels.forEach((row,y)=>[...row].forEach((cell,x)=>{if(colors[cell]){c.fillStyle=colors[cell];c.fillRect(208+x*7,55+y*7,7,7)}}));
     line(displayName,306,32);line((p.start||'開始日ふめい')+' ～ '+p.end,346,22);
     line('おせわ '+p.care+'かい　・　せいかい '+p.solved+'もん',391,24);line('🏅 '+p.medal,440,26);
     body.append(card,familyButton(displayName+'の カードを PNGほぞん',()=>{const a=document.createElement('a');a.href=card.toDataURL('image/png');a.download='mojitama-'+p.id+'.png';a.click()}));
   }
 }
 $('eggShop').onclick=()=>shop();$('album').onclick=()=>album();
}
