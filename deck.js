'use strict';
function makeDeck(words,store,key){
 let state={};try{state=JSON.parse(store.getItem(key))||{}}catch{}
 const bags=state.bags||{},recent=Array.isArray(state.recent)?state.recent:[],schedules=state.schedules||{};
 function shuffle(a,r){for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function draw(level,rate,r=Math.random){
  const pool=words.filter(w=>w.difficulty===level),group=w=>w.kind==='normal'?'normal':level===5?w.group||'meme':'fun';
  const groups=[...new Set(pool.map(group))],weights=level===5?{normal:100-rate,silly:rate*25/70,pun:rate*15/70,meme:rate*20/70,cat:rate*10/70}:{normal:100-rate,fun:rate};
  let active=groups.filter(g=>weights[g]>0);if(!active.length)active=groups;
  const slot=level+':'+rate;
  if(!schedules[slot]?.length){
   const total=active.reduce((n,g)=>n+weights[g],0)||1;
   const quota=active.map(g=>({g,n:weights[g]*100/total||0}));if(quota.every(x=>!x.n))quota[0].n=100;
   const batch=quota.flatMap(x=>Array(Math.floor(x.n)).fill(x.g));
   quota.sort((a,b)=>(b.n%1)-(a.n%1));for(let i=0;batch.length<100;i++)batch.push(quota[i%quota.length].g);
   schedules[slot]=shuffle(batch,r);
  }
  let g=schedules[slot].pop();if(!active.includes(g))g=active[0];
  const members=pool.filter(w=>group(w)===g),ids=members.map(w=>w.id),k=level+'/'+g;
  const bag=bags[k]||{known:[],queue:[]};bags[k]=bag;
  bag.queue=bag.queue.filter(id=>ids.includes(id));bag.queue.push(...shuffle(ids.filter(id=>!bag.known.includes(id)),r));bag.known=ids;
  if(!bag.queue.length)bag.queue=shuffle([...ids],r);
  let choices=bag.queue;for(const id of [...recent].reverse()){const fresh=choices.filter(x=>x!==id);if(fresh.length)choices=fresh}
  const id=choices[0];bag.queue.splice(bag.queue.indexOf(id),1);recent.push(id);if(recent.length>8)recent.shift();
  try{store.setItem(key,JSON.stringify({bags,recent,schedules}))}catch{}
  return members.find(w=>w.id===id);
 }
 return {draw};
}
