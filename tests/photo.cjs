const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH});try{
 const p=await b.newPage();await p.goto(require('url').pathToFileURL(path.resolve(__dirname,'../index.html')).href);await p.waitForFunction(()=>document.querySelector('#petCamera').onclick);
 for(const mode of ['record','pet']){
 const preview=await p.evaluate(mode=>{
   s.petType=9;s.hatched=true;s.care=4;s.solved=129;s.best=20;update();drawCharacter(0);
   $(mode==='pet'?'petCamera':'recordCamera').click();
   const c=$('photo'),rgba=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   const color=AdultArt.colors.T.slice(1).match(/../g).map(h=>parseInt(h,16));
   let count=0;
   for(let i=0;i<rgba.length;i+=4)if(color.every((v,j)=>rgba[i+j]===v)){
     const x=i/4%c.width,y=Math.floor(i/4/c.width);
     if(y<222||y>=736||x<76||x>=(mode==='record'?585:1124))throw Error('pet outside portrait area');
     count++;
   }
   if(count<1000)throw Error('missing portrait');return c.toDataURL().split(',')[1];
 },mode);
 const [d]=await Promise.all([p.waitForEvent('download'),p.click('#downloadPhoto')]);
 assert.equal(fs.readFileSync(await d.path()).toString('base64'),preview);
 await p.evaluate(()=>$('studio').close());
 }console.log('PASS: both portraits fit and downloaded PNGs match previews')
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
