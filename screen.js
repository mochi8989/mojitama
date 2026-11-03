'use strict';
// The actual game controls stay mounted together; the child never selects a view.
(()=>{
 const wrap=document.querySelector('.wrap'),grid=wrap.querySelector('.grid'),home=grid.firstElementChild;
 const get=id=>document.getElementById(id),box=c=>Object.assign(document.createElement('div'),{className:c});
 const pet=box('companion'),tools=box('pet-tools'),identity=box('identity');
 identity.append(get('petName'),get('growth'));pet.append(get('scene'),identity);tools.append(get('basic'),get('careNotice'));
 const more=wrap.querySelector('details');more.querySelector('summary').textContent='おとな向け・くわしいせってい';
 get('closeSettings').onclick=()=>{more.open=false;get('card').focus({preventScroll:true})};
 const extra=box('extra-info');const stats=home.querySelector('.stats');stats.append(home.querySelector('.stat:has(#xp)'));stats.classList.add('live-stats');extra.append(get('wish'));
 more.append(extra);const actions=box('pet-links');actions.append(get('petBook'),get('petCamera'),home.querySelector('.family-actions'));
 home.replaceChildren(pet,stats,tools,actions,get('dailyLog'));
 get('petBook').textContent='📖 ずかん';get('petCamera').textContent='📸 ペット';
 get('recordCamera').textContent='📸 きろく';actions.append(get('lastResult'));
 get('level').parentElement.firstChild.textContent='レベル ';get('letterCase').parentElement.firstChild.textContent='ローマじ ';
 const board=box('play-board');board.append(wrap.querySelector('header'),grid,more,get('status'));wrap.append(board);wrap.classList.add('single-home');
 // Calculate the fit once per viewport change, never when game content changes.
 let fitFrame=0;
 function fit(){
   cancelAnimationFrame(fitFrame);
   fitFrame=requestAnimationFrame(()=>{
     const scale=Math.min(1,wrap.clientHeight/Math.max(1,board.offsetHeight));
     board.style.transform='scale('+scale+')';
     board.style.transformOrigin='top center';
     board.style.marginBottom=(board.offsetHeight*(scale-1))+'px';
   });
 }
 window.addEventListener('resize',fit);
 document.fonts.ready.then(fit);
 fit();
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&more.open)more.open=false});
})();
