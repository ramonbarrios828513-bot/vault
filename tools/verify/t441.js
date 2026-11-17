// v1249 · ⚪ damas 3 reglas + 📺 robots que explican + 🎓 maestro que juega por vos + ⛶ solo tablero + botones agrupados + 🖨️ imprimir Faltan completar
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 // reglas
 const R=await p.evaluate(()=>{ const D=window.__dmz, E=()=>Array(64).fill(0), ix=(r,c)=>r*8+c;
   // peón blanco en (4,3), negro detrás en (5,4) -> comer para atrás
   let b=E(); b[ix(4,3)]=1; b[ix(5,4)]=-1; const back={br:D.gen(b,1,D.V.br).some(m=>m.cap.length), es:D.gen(b,1,D.V.es).some(m=>m.cap.length), en:D.gen(b,1,D.V.en).some(m=>m.cap.length)};
   // dama en (7,0) con negra en (3,4): vuela y come en br/es, no en en
   b=E(); b[ix(7,0)]=2; b[ix(3,4)]=-1; const fly={br:D.gen(b,1,D.V.br).some(m=>m.cap.length), en:D.gen(b,1,D.V.en).some(m=>m.cap.length)};
   // mayoría: una opción come 1 y otra come 2
   b=E(); b[ix(6,1)]=1; b[ix(5,2)]=-1; b[ix(6,5)]=1; b[ix(5,6)]=-1; b[ix(3,6)]=-1; const maxBr=D.gen(b,1,D.V.br).map(m=>m.cap.length), maxEn=D.gen(b,1,D.V.en).map(m=>m.cap.length);
   // obligatoria: si hay captura no hay movimientos simples
   b=D.start(); b[ix(4,1)]=-1; const forced=D.gen(b,1,D.V.br).every(m=>m.cap.length);
   return {back,fly,maxBr,maxEn,forced}; });
 console.log('   '+JSON.stringify(R));
 ok(R.back.br && !R.back.es && !R.back.en,'brasileña come para atrás; española e inglesa no');
 ok(R.fly.br && !R.fly.en,'la dama vuela en brasileña, en inglesa no');
 ok(R.maxBr.every(n=>n===2) && R.maxEn.includes(1),'regla de la mayoría (br) y libre (inglesa)');
 ok(R.forced,'comer es obligatorio');
 // abrir ajedrez
 await p.evaluate(()=>window.__chz.open()); await p.waitForTimeout(1500); await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(x=>x.remove()));
 ok(await p.evaluate(()=>document.querySelectorAll('#ajedrez .chx-grp').length>=3 && !!document.querySelector('#ajedrez [data-chx="damas"]')),'ajedrez: botones en grupos y selector Ajedrez/Damas');
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chx="damas"]').click()); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>document.querySelectorAll('#dmzBd [data-dq]').length===64 && document.querySelectorAll('#dmzBd .dmz-pc').length===24),'damas: tablero con 24 fichas');
 // jugar una: blanca de (5,2) a (4,3)
 await p.evaluate(()=>{ document.querySelector('#dmzBd [data-dq="42"]').click(); }); await p.waitForTimeout(200);
 const sel=await p.evaluate(()=>window.__dmz.st.opts.length); ok(sel>0,'al tocar una ficha muestra a dónde puede ir');
 await p.evaluate(()=>{ const o=window.__dmz.st.opts[0]; document.querySelector('#dmzBd [data-dq="'+o.path[o.path.length-1]+'"]').click(); }); 
 await p.waitForTimeout(4500);
 const st=await p.evaluate(()=>({turn:window.__dmz.st.turn, n:window.__dmz.st.hist.length, msg:document.getElementById('dmzMsg').innerText}));
 console.log('   '+JSON.stringify(st).slice(0,300));
 ok(st.n>=2 && st.turn===1,'el robot contestó');
 ok(/Plan/.test(st.msg),'explica la jugada y el plan');
 // demo
 await p.evaluate(()=>document.querySelector('#ajedrez [data-dmz="demo"]').click()); await p.waitForTimeout(9000);
 const dm=await p.evaluate(()=>({n:window.__dmz.st.hist.length, demo:window.__dmz.st.demo, msg:document.getElementById('dmzMsg').innerText}));
 ok(dm.demo && dm.n>=1 && /(Chispa|Tuerca)/.test(dm.msg),'📺 robots juegan solos y explican ('+dm.n+' jugadas)');
 // solo tablero
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chx="solo"]').click()); await p.waitForTimeout(400);
 const so=await p.evaluate(()=>{ const bd=document.getElementById('dmzBd').getBoundingClientRect(); return {on:document.getElementById('ajedrez').classList.contains('chx-solo-on'), w:bd.width, exit:!!document.getElementById('chxExit')}; });
 ok(so.on && so.w>600 && so.exit,'⛶ solo tablero: el tablero ocupa la pantalla ('+Math.round(so.w)+' px) y hay botón para salir');
 await p.screenshot({path:'/tmp/claude-0/s130/dmz-solo.png'});
 await p.evaluate(()=>document.getElementById('chxExit').click()); await p.waitForTimeout(300);
 await p.evaluate(()=>document.querySelector('#ajedrez [data-dmz="demo"]').click());
 // ajedrez: maestro
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chx="ajedrez"]').click()); await p.waitForTimeout(500);
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chxr="pilot"]').click()); await p.waitForTimeout(9000);
 const pm=await p.evaluate(()=>({h:window.__chz && document.getElementById('chzMsg').innerText}));
 console.log('   '+String(pm.h).slice(0,200));
 ok(/maestro|Muevo/i.test(pm.h),'🎓 el robot maestro juega por vos y explica');
 await p.screenshot({path:'/tmp/claude-0/s130/chz-grp.png'});
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
