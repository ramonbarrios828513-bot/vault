// v1349 · 🟢 turno REAL de caja de punta a punta: inicio contando billetes → ventas con vuelto del stock → cierre contando → billetes para el próximo turno → el próximo inicio los trae cargados
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
const SS='/tmp/claude-0/-home-claude/35b1ce44-d35c-5596-924f-bd3f45a2f74d/scratchpad/';
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; P.emps.push({id:'eA1',n:'Ana Vendedora',suc:'KM 7',pin:'4321'}); window.__vt.open(); const V=window.__vt.st(); V.open=false; V.stock={}; V.sales=[]; V.movs=[]; V.lastDeja=null; V.vendAct='Ana Vendedora'; window.__vt.open(); });
 await p.waitForTimeout(500);
 const fillCnt=async(M)=>{ for(const [k,v] of Object.entries(M)){ await p.fill('.vt-cnt [data-vn="GS:'+k+'"]',String(v)); await p.dispatchEvent('.vt-cnt [data-vn="GS:'+k+'"]','change'); } await p.waitForTimeout(300); };
 // 1) INICIO DE TURNO contando billetes y monedas
 await p.click('#ventas [data-vt="ini"]'); await p.waitForTimeout(500);
 await fillCnt({100000:1,50000:2,20000:3,10000:5,5000:4,2000:5,1000:10,500:6}); await p.screenshot({path:SS+'turno1-inicio.png'});
 await p.click('.vt-cnt [data-vc="ok"]'); await p.waitForTimeout(600);
 const s1=await p.evaluate(()=>{ const V=window.__vt.st(); return {open:V.open, ini:!!V.iniAt, st:V.stock.GS}; }); console.log('   inicio',JSON.stringify(s1));
 ok(s1.open&&s1.ini&&+s1.st[500]===6&&+s1.st[100000]===1,'🟢 inicio de turno: la caja abre con el stock contado (billete por billete y monedas)');
 // 2) VENTA: cobra ₲ 18.150 con un billete de 100.000 → vuelto sale del stock
 await p.evaluate(()=>{ const V=window.__vt.st(), t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:18000,uq:1,nodesc:true}]; t.cid=''; t.cli=''; window.__vt.open(); }); await p.waitForTimeout(300);
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(600); await p.click('.vt-ov [data-rqn="100000"]'); await p.keyboard.type('1'); await p.waitForTimeout(500);
 await p.screenshot({path:SS+'turno2-cobro.png'});
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(900);
 const s2=await p.evaluate(()=>{ const V=window.__vt.st(), s=V.sales[V.sales.length-1]; return {n:V.sales.length, vu:s&&s.vuelto, st:V.stock.GS}; }); console.log('   venta',JSON.stringify(s2));
 const tot=g=>Object.entries(g||{}).reduce((a,[d,n])=>a+d*n,0);
 ok(s2.n===1&&s2.vu===82000&&tot(s2.st)===tot(s1.st)+18000&&+s2.st[100000]===2,'venta: entra el billete de 100.000 y el vuelto (₲ 82.000) sale del stock; la caja sube ₲ 18.000');
 // 3) CIERRE por teclado: ① remesa de cierre (los grandes) ② lo que queda para el próximo turno (el sencillo). Falta 1 de 100.000 y sobra 1 de 20.000 a propósito
 const st=s2.st, R={}, D={}; Object.entries(st).forEach(([d,n])=>{ if(+d>=50000) R[d]=n; else D[d]=n; }); R[100000]=(+R[100000])-1; D[20000]=(+D[20000]||0)+1;
 await p.click('#ventas [data-vt="cierre"]'); await p.waitForTimeout(500);
 const t1=await p.evaluate(()=>document.querySelector('.vt-cnt').innerText); ok(/REMESA DE CIERRE/.test(t1)&&!/hay \d/.test(t1),'cierre ①: pide la remesa de cierre por teclado (sin mostrar lo que dice el sistema)');
 await fillCnt(R); await p.screenshot({path:SS+'turno3-remesa.png'}); await p.click('.vt-cnt [data-vc="ok"]'); await p.waitForTimeout(500);
 const t2=await p.evaluate(()=>document.querySelector('.vt-cnt').innerText); ok(/PRÓXIMO TURNO/.test(t2),'cierre ②: pide lo que queda para el próximo turno por teclado');
 await fillCnt(D); await p.screenshot({path:SS+'turno4-deja.png'}); await p.click('.vt-cnt [data-vc="ok"]'); await p.waitForTimeout(600);
 const dif=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().innerText); console.log('   '+dif.split('\n').filter(l=>/100\.000|20\.000|Diferencias/.test(l)).join(' | '));
 ok(/₲ 100\.000\t2\t1\t\t1\t⛔ faltante 1/.test(dif),'cuadre: el sistema dice 2 de 100.000, remesa 1 → FALTANTE 1 de 100.000');
 ok(/₲ 20\.000\t2\t\t3\t3\t🟡 sobrante 1/.test(dif),'cuadre: el sistema dice 2 de 20.000, quedan 3 → SOBRANTE 1 de 20.000');
 await p.screenshot({path:SS+'turno5-cuadre.png'}); await p.click('.vt-ov [data-ivok]'); await p.waitForTimeout(600);
 const s4=await p.evaluate(()=>{ const V=window.__vt.st(), h=V.hist.slice(-1)[0]; return {open:V.open, deja:V.lastDeja&&V.lastDeja.GS, h:V.hist.length, sales:V.sales.length, rem:h.movs.filter(m=>m.k==='rem').reduce((a,m)=>a+m.g,0), difB:h.difB}; }); console.log('   cierre',JSON.stringify(s4));
 ok(!s4.open&&s4.sales===0&&s4.rem===50000+100000&&+s4.deja[20000]===3&&s4.difB.GS[100000]===-1&&s4.difB.GS[20000]===1,'turno cerrado: remesa de cierre registrada, diferencias guardadas en el historial, el próximo turno queda con lo cargado');
 // 5) INICIO del próximo turno: ya trae cargado lo que se dejó
 await p.click('#ventas [data-vt="ini"]'); await p.waitForTimeout(500);
 const pre=await p.evaluate(()=>{ const o={}; document.querySelectorAll('.vt-cnt [data-vn^="GS:"]').forEach(i=>{ if(i.value) o[i.dataset.vn.slice(3)]=+i.value; }); return o; }); console.log('   pre',JSON.stringify(pre));
 await p.screenshot({path:SS+'turno6-proximo.png'});
 ok(pre[20000]===3&&pre[500]===6&&pre[1000]===10,'el próximo inicio de turno ya trae los billetes que se dejaron (el cajero confirma contando)');
 await p.click('.vt-cnt [data-vc="ok"]'); await p.waitForTimeout(500); ok(await p.evaluate(()=>window.__vt.st().open),'el próximo turno queda abierto');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 console.log('fallas',fail); await b.close(); process.exit(fail?1:0); })();
