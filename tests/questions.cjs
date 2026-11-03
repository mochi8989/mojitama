const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
require('../tools/validate.cjs');
const R=require('../roman.js'), words=require('../data/words.json');
const makeDeck=vm.runInNewContext(fs.readFileSync(__dirname+'/../deck.js','utf8')+';makeDeck');
const saved=new Map(),store={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
for(const [kana,paths] of Object.entries({'し':['SI','SHI'],'じ':['ZI','JI'],'ち':['TI','CHI'],'つ':['TU','TSU'],'しゃ':['SYA','SHA'],'ちゃ':['TYA','CHA'],'じゃ':['ZYA','JA'],'しっちゃう':['SHICCHAU','SITTYAU','SHIXTUCHAU'],'しんよう':['SINNYOU','SHIXNYOU'],'しんぶん':['SHINBUN','SINNBUN'],'ぴゃ':['PYA'],'ぁゅ':['LAXYU'],'こーひー':['KO-HI-']})){
 for(const input of paths){
  const parts=R.segments(kana);for(let i=0;i<=input.length;i++)assert.notEqual(R.guide(parts,input.slice(0,i)),null);
  assert.equal(R.guide(parts,input),'',input);
 }
}
assert.equal(R.guide(R.segments('しんよう'),'SINYOU'),null);
assert.equal(R.standard('こうちゃ'),'KOUCHA');assert.equal(R.standard('コウチャ'),'KOUCHA');
for(const path of ['KOUCHA','KOUTYA'])assert.equal(R.guide(R.segments('こうちゃ'),path),'');
for(const rate of [0,25,70,100]){
 saved.clear();let deck=makeDeck(words,store,'test');
 for(let level=1;level<=5;level++){
  const counts={},seen=new Map();let previous=null;
  for(let i=0;i<500;i++){
   if(i===43)deck=makeDeck(words,store,'test');
   const w=deck.draw(level,rate);assert.equal(w.difficulty,level);assert.notEqual(w.id,previous);previous=w.id;
   const group=x=>x.kind==='normal'?'normal':level===5?x.group||'meme':'fun',g=group(w);
   const bucket=seen.get(g)||new Set();if(bucket.size===words.filter(x=>x.difficulty===level&&group(x)===g).length)bucket.clear();
   assert(!bucket.has(w.id));bucket.add(w.id);seen.set(g,bucket);counts[g]=(counts[g]||0)+1;
  }
  assert.equal(counts.normal||0,level<3?500:5*(100-rate));
  if(level===5&&rate===70)assert.deepEqual(counts,{normal:150,silly:125,pun:75,meme:100,cat:50});
 }
}
saved.clear();const deck=makeDeck(words,store,'test');let prev=null;
for(let i=0;i<100;i++){const w=deck.draw(1,false);assert.notEqual(w.id,prev);prev=w.id}
console.log('PASS: alternate spellings, all levels, three complete cycles, restored queues and mix');
