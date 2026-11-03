'use strict';
const Family=(()=>{
 const eggs={normal:{name:'ふつうのたまご',price:300,types:[0,1,2,3,4,5]},rare:{name:'レアなたまご',price:1000,types:[6,7,8,9]}};
 const date=()=>new Date().toLocaleDateString('sv-SE');
 const id=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 function initial(saved){
   if([5,6].includes(saved?.version) && saved.family && Array.isArray(saved.family.album))return saved.family;
   return {active:id(),start:saved?'':date(),origin:'starter',petSolved:saved?.solved||0,
     stored:[],album:[],purchases:[],claimed:[],discovered:saved?.hatched?[saved.petType||0]:[],maxLevel:5};
 }
 const fields=['petType','hatched','poop','care','hunger','mood','clean'];
 function snapshot(s){const f=s.family;return {id:f.active,start:f.start,origin:f.origin,solved:f.petSolved,...Object.fromEntries(fields.map(k=>[k,s[k]]))}}
 function activate(s,p){Object.assign(s.family,{active:p.id,start:p.start,origin:p.origin,petSolved:p.solved});for(const k of fields)s[k]=p[k]}
 function purchase(s,kind,rand=Math.random){
   const egg=eggs[kind],f=s.family;if(!egg||s.coins<egg.price)return false;
   if(f.active)f.stored.push(snapshot(s));
   const p={id:id(),origin:kind,start:date(),solved:0,petType:egg.types[Math.floor(rand()*egg.types.length)],hatched:false,poop:false,care:0,hunger:70,mood:70,clean:70};
   s.coins-=egg.price;f.purchases.push({id:p.id,kind,date:p.start,price:egg.price});activate(s,p);return true;
 }
 function swap(s,target){
   const f=s.family,index=f.stored.findIndex(p=>p.id===target);if(index<0)return false;
   const [next]=f.stored.splice(index,1);if(f.active)f.stored.push(snapshot(s));activate(s,next);return true;
 }
 function graduate(s,expected){
   const f=s.family;if(!expected||f.active!==expected||!s.hatched||s.care<12||f.claimed.includes(expected))return false;
   const pet=snapshot(s);f.album.push({...pet,name:petArt.types[s.petType].name,end:date(),sentAt:Date.now()+86400000,medal:'旅に出したメダル',pixels:AdultArt.frame(s.petType,'joy',0)});
   f.claimed.push(expected);s.coins+=500;
   activate(s,{id:null,start:'',origin:'',solved:0,petType:0,hatched:false,poop:false,care:0,hunger:70,mood:70,clean:70});return true;
 }
 function awards(f){const count=f.album.length,solved=f.totalSolved||0;const rows=[[count>=1,'はじめての旅'],[count>=3,'3びき そだてた！'],[count>=10,'10ぴき そだてた！'],[new Set(f.album.filter(p=>p.petType<10).map(p=>p.petType)).size===10,'ぜんしゅるい コンプリート!'],...Array.from({length:16},(_,i)=>[solved>=(i+1)*10,'タイピング '+((i+1)*10)+'もん！'])];return rows.filter(x=>x[0]).map(x=>x[1])}
 return {initial,eggs,purchase,swap,graduate,awards};
})();
