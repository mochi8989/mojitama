'use strict';
// Each segment is a set of spellings. Match a prefix without expanding the
// Cartesian product of all spellings in a word.
const Roman=(()=>{
  const map={};
  for(const [i,row] of ['あいうえお','かきくけこ','がぎぐげご','さしすせそ','ざじずぜぞ','たちつてと','だぢづでど','なにぬねの','はひふへほ','ばびぶべぼ','ぱぴぷぺぽ','まみむめも','らりるれろ'].entries())
    [...row].forEach((k,j)=>map[k]=[['','K','G','S','Z','T','D','N','H','B','P','M','R'][i]+'AIUEO'[j]]);
  Object.assign(map,{とぅ:['TWU','TOXU','TOLU'],し:['SHI','SI'],じ:['JI','ZI'],ち:['CHI','TI'],つ:['TSU','TU'],ふ:['FU','HU'],や:['YA'],ゆ:['YU'],よ:['YO'],わ:['WA'],を:['WO'],ー:['-'],ふぉ:['FO'],ふぁ:['FA'],ふぃ:['FI'],ふぇ:['FE'],てぃ:['THI'],でぃ:['DHI'],ちぇ:['CHE','TYE'],しぇ:['SHE','SYE'],じぇ:['JE','ZYE']});
  for(const [i,k] of [...'きぎしじちにひびぴみり'].entries()){
    const stems=['KY','GY','SH SY','J ZY JY','CH TY CY','NY','HY','BY','PY','MY','RY'][i].split(' ');
    [...'ゃゅょ'].forEach((v,j)=>map[k+v]=stems.map(s=>s+'AUO'[j]));
  }
  [...'ぁぃぅぇぉゃゅょ'].forEach((k,i)=>map[k]=['X','L'].map(p=>p+['A','I','U','E','O','YA','YU','YO'][i]));
  function segments(reading){
    reading=reading.normalize('NFKC').replace(/[ァ-ヶ]/g,k=>String.fromCharCode(k.charCodeAt(0)-96));
    const out=[];
    for(let i=0;i<reading.length;i++){
      const k=reading[i];
      if(k==='っ'){out.push(null);continue}
      if(k==='ん'){out.push(/^[あいうえおやゆよ]/.test(reading.slice(i+1))?['NN','XN']:['N','NN','XN']);continue}
      const pair=reading.slice(i,i+2);
      if(pair.length===2 && map[pair]){out.push(map[pair]);i++}
      else if(map[k])out.push(map[k]);else throw Error('未対応の読み: '+reading);
    }
    for(let i=out.length-1;i>=0;i--)if(out[i]===null){
      const next=out[i+1];
      if(next){
        const doubles=next.filter(x=>/^[BCDFGHJKLMPRSTVWYZ]/.test(x)).map(x=>x[0]+x);
        const tch=next.filter(x=>x.startsWith('CH')).map(x=>'T'+x);
        out.splice(i,2,[...tch,...doubles,...['XTU','LTU','XTSU','LTSU'].flatMap(p=>next.map(x=>p+x))]);
      }else out[i]=['XTU','LTU','XTSU','LTSU'];
    }
    return out;
  }
  function guide(parts,prefix){
    const memo=new Map();
    function rest(i,j){
      const key=i+':'+j;if(memo.has(key))return memo.get(key);
      if(i===parts.length)return j===prefix.length?'':null;
      const typed=prefix.slice(j);
      for(const form of parts[i]){
        if(typed.startsWith(form)){
          const suffix=rest(i+1,j+form.length);
          if(suffix!==null)return suffix;
        }else if(form.startsWith(typed))return form.slice(typed.length)+parts.slice(i+1).map(p=>p[0]).join('');
      }
      memo.set(key,null);return null;
    }
    return rest(0,0);
  }
  return {segments,guide,standard:r=>segments(r).map(p=>p[0]).join('')};
})();
if(typeof module!=='undefined')module.exports=Roman;
