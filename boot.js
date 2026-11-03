'use strict';
(async()=>{
  const load=src=>new Promise((ok,fail)=>{const script=document.createElement('script');script.src=src;script.onload=ok;script.onerror=fail;document.body.append(script)});
  try {
    if(location.protocol==='file:'){await load('./data/offline.js');window.wordCatalog=window.offlineWords}
    else {const response=await fetch('./data/words.json',{cache:'no-cache'});if(!response.ok)throw Error(response.status);window.wordCatalog=await response.json()}
    await load('./game.js?v=27');await load('./photo.js');
  }catch(err){document.getElementById('status').textContent='ゲームを よみこめなかったよ。もういちど ひらいてね。';console.error(err)}
})();
