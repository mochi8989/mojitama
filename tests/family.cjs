const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const ctx={assert};vm.createContext(ctx);
for(const f of ['pets','adult','family'])vm.runInContext(fs.readFileSync(__dirname+'/../'+f+'.js','utf8'),ctx);
vm.runInContext(`
const s={family:Family.initial(null),coins:299,hatched:false,care:0,solved:0,petType:0,hunger:70,mood:70,clean:70,poop:false};
const first=JSON.stringify(s);
assert.equal(Family.purchase(s,'normal'),false);assert.equal(JSON.stringify(s),first);
assert.equal(Family.graduate(s,s.family.active),false);
s.coins=9000;
for(let i=0;i<10;i++){
  if(i>0)assert(Family.purchase(s,i<6?'normal':'rare',()=>i<6?i/6:(i-6)/4));
  assert.equal(s.petType,i);s.hatched=true;s.care=12;
  const id=s.family.active,c=s.coins;
  assert(Family.graduate(s,id));assert.equal(s.coins,c+500);
  assert(!Family.graduate(s,id));assert.equal(s.coins,c+500);
  const awards=Family.awards(s.family);
  assert.equal(awards.length,i<2?1:i<9?2:4);
  assert.deepEqual(s.family.album[i].pixels,AdultArt.frame(i,'joy',0));
}
assert.equal(s.family.claimed.length,10);
`,ctx);console.log('PASS: balances, ownership, graduation, 10 portraits and four achievements');
