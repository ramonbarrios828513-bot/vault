// v1249 · 📲 acceso directo: el enlace #juego=damas abre el Baúl directo en las damas después de poner la clave
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 await p.evaluate(()=>window.__chz.open()); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(x=>x.remove()));
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chx="link"]').click()); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>/#juego=ajedrez/.test(document.querySelector('.ico-ov input').value)),'muestra el enlace de acceso directo');
 await p.evaluate(()=>{ location.hash='#juego=damas'; }); await p.reload(); await p.waitForTimeout(1500);
 await p.click('#heroPass'); await p.keyboard.type('1234'); await p.keyboard.press('Enter'); await p.waitForTimeout(4500);
 try{await p.click('text=Ahora no',{timeout:1000});}catch(e){}
 ok(await p.evaluate(()=>{ const a=document.getElementById('ajedrez'); return a && !a.hidden && !!document.getElementById('dmzBd'); }),'al entrar con la clave abre directo las damas');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
