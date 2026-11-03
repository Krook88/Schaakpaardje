// Meting voor docs/volgende-niveau.md: overflow, raakvlakken, tikken tot het bord, bordgrootte.
// Gebruik: npx serve out -l 3000 & node scripts/meet-niveau.mjs
import { chromium } from 'playwright'
const B='http://localhost:3000'
const maten=[[360,740],[390,844],[768,1024],[1024,768],[1440,900]]
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'})
const out=[]
for(const scheme of ['light','dark'])for(const [w,h] of maten){
  const p=await br.newPage({viewport:{width:w,height:h},colorScheme:scheme})
  await p.goto(B+'/',{waitUntil:'networkidle'})
  const naam=`${w}x${h}-${scheme}`
  await p.screenshot({path:`/home/user/Schaakpaardje/docs/volgende-niveau/voor-start-${naam}.png`})
  const start=await p.evaluate(()=>({hscroll:document.documentElement.scrollWidth>innerWidth,
    klein:[...document.querySelectorAll('a,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.width<48||r.height<48)}).map(e=>(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,25))}))
  // tikken tot bord
  let tikken=0;const t0=Date.now()
  for(;tikken<6;tikken++){
    if(await p.locator('[data-square]').count())break
    const knop=p.locator('main a, main button').filter({visible:true}).first()
    if(!await knop.count())break
    await knop.click();await p.waitForTimeout(800)
  }
  const opBord=await p.locator('[data-square]').count()>0
  let bord=null
  if(opBord){await p.waitForTimeout(500);await p.screenshot({path:`/home/user/Schaakpaardje/docs/volgende-niveau/voor-les-${naam}.png`})
    bord=await p.evaluate(()=>{const g=document.querySelector('[data-square]').closest('[role=group]');const r=g.getBoundingClientRect();return{w:Math.round(r.width),onder:Math.round(r.bottom),past:r.bottom<=innerHeight,hscroll:document.documentElement.scrollWidth>innerWidth}})}
  out.push({naam,klein:start.klein.length,hscroll:start.hscroll,tikken,opBord,sec:((Date.now()-t0)/1000).toFixed(1),bord,url:p.url()})
  await p.close()
}
console.log(JSON.stringify(out,null,1));await br.close()
