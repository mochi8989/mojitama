'use strict';
// Original 32×32 silhouettes, painted as indexed pixels for the live pet,
// collection icons, photo studio and graduation portraits.
const AdultArt=(()=>{
 const colors={K:'#362744',W:'#fff9ed',C:'#eda754',M:'#ad817d',P:'#ffadbe',R:'#e56870',Y:'#ffd861',B:'#5184d9',I:'#a4dcff',G:'#a7dc62',L:'#d1acf1',D:'#a781cc',T:'#d9917f',S:'#e4d6ee'};
 function frame(type,pose,tick,stage=4){
 const a=Array.from({length:32},()=>Array(32).fill('.')),t=tick%3,up=pose==='walk'?t%2:0;
 function dot(x,y,c){x=Math.round(x);y=Math.round(y)-up;if(x>=0&&x<32&&y>=0&&y<32)a[y][x]=c}
 function ellipse(x,y,rx,ry,c,border=true){for(let j=-ry;j<=ry;j++)for(let i=-rx;i<=rx;i++){if((i/rx)**2+(j/ry)**2<=1)dot(x+i,y+j,border&&((i/(rx-.9))**2+(j/(ry-.9))**2>1)?'K':c)}}
 function poly(points,c){
 const inside=(x,y)=>{let v=false;for(let i=0,j=points.length-1;i<points.length;j=i++){let [u,b]=points[i],[w,d]=points[j];if((b>y)!=(d>y)&&x<(w-u)*(y-b)/(d-b)+u)v=!v}return v};
 for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(inside(x+.5,y+.5))dot(x,y,[[1,0],[-1,0],[0,1],[0,-1]].some(([u,v])=>!inside(x+u+.5,y+v+.5))?'K':c)
 }
 const e=ellipse,p=poly;let eyeY=15;
 if(stage===0){e(16,18+t%2,9,12-t%2,'W');e(13+t,13,2,3,'Y',false);e(20,21,2,2,'P',false);e(12,25,2,1,'L',false);return a.map(r=>r.join(''))}
 const body=['W','C','W','G','B','W','Y','I','L','T'][type];
 const step=0,lift=['joy','play','bath'].includes(pose)?2+t:0;
 if(type<=4||type===8){
 if(type===0||type===1){e(6,21,4,6,body);e(5,17,2,3,type===0?'C':'W')}
 if(type===8){p([[3,14],[11,19],[9,25],[6,22],[2,24]],'D');p([[22,19],[29,12],[31,23],[27,21],[24,25]],'D');p([[20,25],[30,19],[28,27],[22,29]],'Y')}
 e(16,22,8,7,body);e(16,22,5,5,'W',false);
 e(12+step,27,4,2,type===4?'Y':body);e(21-step,27,4,2,type===4?'Y':body);
 if(type===0){p([[6,12],[6,2],[15,8]],'M');p([[18,8],[25,1],[27,13]],'C')}
 if(type===1){e(7,10,5,6,'C');e(25,10,4,6,'C')}
 if(type===2){e(12,7,3,7,'W');e(12,6,1,4,'P',false);e(20,6,3,6,'W');e(20,5,1,3,'P',false)}
 if(type===3){e(10,9,4,4,'G');e(22,9,4,4,'G')}
 if(type===8){p([[7,12],[9,2],[14,9]],'Y');p([[19,9],[25,1],[25,13]],'Y')}
 e(16,15,type===3?12:10,8,body);
 if(type===0){e(11,10,3,2,'M',false);e(22,11,2,2,'C',false);e(16,23,5,1,'R',false);e(16,24,2,2,'Y')}
 if(type===1){e(17,17,6,4,'W',false);p([[11,22],[23,22],[20,27]],'R')}
 if(type===4){e(16,16,8,5,'W',false);e(16,22,8,2,'I');p([[19,23],[24,22],[24,28],[20,27]],'I')}
 if(type===8){e(13,22,3,2,'W',false);e(18,22,4,2,'W',false)}
 e(7,22-lift,3,2,body);e(25,21-lift,3,2,body)
 }else if(type===5){p([[3,25],[4,19],[8,13],[13,10],[16,7],[20,11],[26,14],[29,21],[29,26],[24,28],[8,28]],'W');e(17,6,3,3,'W');eyeY=19}
 else if(type===6){p([[16,2],[20,10],[30,12],[23,19],[24,29],[16,24],[7,29],[9,19],[1,13],[12,10]],'Y');eyeY=15;e(6,24-lift,3,2,'L')}
 else if(type===7){p([[22,16],[31,10],[30,22]],'B');p([[15,9],[20,3],[22,11]],'I');e(15,18,12,10,'I');e(15,22,9,5,'W',false);e(6,21-lift,3,2,'I');e(24,20-lift,3,2,'I');eyeY=16}
 else if(type===10){
   p([[13,5],[18,5],[18,28],[13,28]],'Y');
   p([[6,2+t%2],[9,1+t%2],[25,11+t%2],[22,14+t%2]],'Y');p([[22,1-t%2],[25,3-t%2],[9,14-t%2],[6,12-t%2]],'Y');
   e(11,15,5,4,t===1?'R':'M');e(22,15,5,4,t===1?'M':'R');
   e(16,27,7,2,'K');eyeY=21
 }else if(type===11||type===12){
   const fan=type===12;
   if(fan){e(16,23,2,6,'I');e(16,28,8,2,'I');e(16,13,12,11,'I')}
   else{p([[2,6],[30,6],[30,26],[2,26]],'S');e(8,27,3,1,'K');e(24,27,3,1,'K')}
   const cx=fan?16:12,cy=fan?12:15;
   e(cx,cy,8,8,'W');
   for(let blade=0;blade<3;blade++){const angle=(blade*3+t)*Math.PI*2/9;e(cx+4*Math.cos(angle),cy+4*Math.sin(angle),3,2,fan?'I':'M')}
   e(cx,cy,2,2,'B');if(!fan){for(let y=10;y<=20;y+=3)e(25,y,2,1,'M',false)}if(pose==='play'||pose==='joy'){for(let j=0;j<3;j++)dot(fan?27+j:24+j,9+j*3,'I')}
   eyeY=fan?19:21
 }else{e(16,23,13,5,'T');e(16,18,10,6,'T');e(16,12,7,5,'T');p([[12,10],[16,6],[19,2],[21,7],[20,12]],'T');eyeY=19}
 for(const x of [12,20]){
 if(pose==='sleep'||pose==='blink'&&t===1||['joy','play'].includes(pose)){dot(x-1,eyeY,'K');dot(x,eyeY+(pose==='sleep'?1:-1),'K');dot(x+1,eyeY,'K')}
 else{dot(x+(t===2?1:0),eyeY-1,'K');dot(x+(t===2?1:0),eyeY,'K')}
 e(x+(x<16?-2:2),eyeY+2,2,1,'P',false)
 }
 if(pose==='blink'&&t===1){for(const x of [12,20])e(x,eyeY,2,1,'K',false)}
 if(pose==='eat')e(16,eyeY+3,1+t,2,'R');else if(pose==='sleep')dot(16,eyeY+3,'K');else{dot(15,eyeY+2,'K');dot(17,eyeY+2,'K');dot(16,eyeY+3,'R')}
 if(pose==='play')e(3+t,8-t,2,2,'Y');if(pose==='joy')e(27,8-t,1,2,'P',false);
 if(pose==='bath'){e(4+t,8,2,2,'I');e(26,5+t,1,1,'W')}
 if(pose==='eat')e(13+t,eyeY+6,3,2,'C');
 if(pose==='sleep'){dot(26+t,6,'D');dot(27+t,6,'D');dot(26+t,7,'D');dot(25+t,8,'D');dot(26+t,8,'D')}
 // Juveniles use their species silhouette at progressively smaller scales.
 if(stage===1)e(16,eyeY+6,3,2,'I');
 if(stage===2)p([[11,eyeY+5],[21,eyeY+5],[16,eyeY+10]],'Y');
 if(stage===3){e(22,eyeY+6,3,2,'L');dot(22,eyeY+6,'Y')}
 if(stage<4){const z=[0,.7,.82,.93][stage];return a.map((row,y)=>row.map((_,x)=>a[Math.floor((y-28)/z+28)]?.[Math.floor((x-16)/z+16)]||'.').join(''))}
 return a.map(r=>r.join(''));
 }
 return {frame,colors};
})();
