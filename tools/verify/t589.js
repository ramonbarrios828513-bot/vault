// v1329 · 📠 escáner: un ticket blanco sobre una tela o mesa CLARA se recorta solo (antes agarraba ticket + fondo); el papel sobre mesa oscura y la hoja con media sombra siguen saliendo enteros
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 const R=await p.evaluate(()=>{ const mk=(W,H,draw)=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); draw(x); return c; };
  const txt=(x,x0,y0,w,h)=>{ x.fillStyle='#111'; for(let y=y0+30;y<y0+h-20;y+=26) x.fillRect(x0+18,y,(w-36)*(0.5+((y*7)%10)/20),5); };
  const tela=(x,x0,y0,w,h)=>{ for(let y=y0;y<y0+h;y+=8) for(let X=x0;X<x0+w;X+=8){ const v=188+(((X>>3)+(y>>3))%2)*26; x.fillStyle='rgb('+v+','+v+','+v+')'; x.fillRect(X,y,8,8); } };
  const A=mk(900,1300,x=>{ x.fillStyle='#1c1c1c'; x.fillRect(0,0,900,1300); x.fillStyle='#f7f7f7'; x.fillRect(200,150,500,1000); txt(x,200,150,500,1000); });
  const B=mk(900,1300,x=>{ x.fillStyle='#262626'; x.fillRect(0,0,900,1300); tela(x,60,60,780,1180); x.fillStyle='#fbfbfb'; x.fillRect(120,90,260,1100); txt(x,120,90,260,1100); });
  const C=mk(900,1300,x=>{ x.fillStyle='#1c1c1c'; x.fillRect(0,0,900,1300); x.fillStyle='#f4f4f4'; x.fillRect(150,150,600,1000); x.fillStyle='#e2e2e2'; x.fillRect(150,650,600,500); txt(x,150,150,600,1000); });
  const D=(c)=>{ const d=window.__ds.detect(c,c.width,c.height); if(!d) return null; const xs=d.q.map(q=>q[0]*c.width), ys=d.q.map(q=>q[1]*c.height); return {conf:+d.conf.toFixed(2),x0:Math.round(Math.min(...xs)),x1:Math.round(Math.max(...xs)),y0:Math.round(Math.min(...ys)),y1:Math.round(Math.max(...ys))}; };
  /* v1334 · ticket BLANCO sobre mesa BLANCA con un posnet y una lapicera al lado: por brillo no se distingue; se encuentra por el bloque de letra */
  const E=mk(900,1300,x=>{ x.fillStyle='#f3f3f1'; x.fillRect(0,0,900,1300); x.fillStyle='#161616'; x.fillRect(20,30,250,330); x.fillStyle='#222'; x.fillRect(760,420,40,330); x.fillStyle='#fbfbfb'; x.fillRect(330,20,250,1260); x.fillStyle='#111'; for(let y=60;y<1240;y+=22){ if(y%220<30) continue; for(let X=350;X<560;X+=14) if(((X*7+y*3)%5)!==0) x.fillRect(X,y,9,9); } });
  const dE=window.__ds.detect(E,900,1300), DE=D(E); if(DE) DE.text=!!(dE&&dE.text);
  return {A:D(A),B:D(B),C:D(C),E:DE}; });
 console.log(JSON.stringify(R));
 const near=(v,t,d)=>Math.abs(v-t)<=d;
 ok(R.A&&R.A.conf>=0.6&&near(R.A.x0,200,25)&&near(R.A.x1,700,25)&&near(R.A.y0,150,25)&&near(R.A.y1,1150,25),'hoja blanca sobre mesa oscura: sale entera, como antes');
 ok(R.B&&R.B.conf>=0.6&&near(R.B.x0,120,25)&&near(R.B.x1,380,30)&&near(R.B.y0,90,30)&&near(R.B.y1,1190,30),'ticket blanco sobre tela CLARA: recorta solo el ticket (x '+(R.B&&R.B.x0)+'–'+(R.B&&R.B.x1)+' de 900), no el ticket con la tela');
 ok(R.C&&R.C.conf>=0.6&&near(R.C.x0,150,25)&&near(R.C.x1,750,25)&&near(R.C.y0,150,25)&&near(R.C.y1,1150,25),'hoja con la mitad en sombra suave: sale entera, no se corta por la sombra');
 // 🎯 enderezar: una hoja con los renglones inclinados 4° se detecta y queda derecha
 const S=await p.evaluate(()=>{ const mk=(deg)=>{ const c=document.createElement('canvas'); c.width=500; c.height=1100; const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,500,1100); x.translate(250,550); x.rotate(deg*Math.PI/180); x.fillStyle='#111'; for(let y=-480;y<480;y+=30) x.fillRect(-190,y,380*(0.55+((y*7+700)%10)/22),7); return c; }; const c4=mk(4), cm=mk(-3), c0=mk(0); const a4=window.__dsSkew(c4), am=window.__dsSkew(cm), a0=window.__dsSkew(c0); const fix=window.__dsRotFine(c4,-a4); return {a4:a4,am:am,a0:a0,after:window.__dsSkew(fix),same:fix.width===500&&fix.height===1100}; });
 console.log(JSON.stringify(S));
 ok(Math.abs(S.a4-4)<=0.75&&Math.abs(S.am+3)<=0.75&&Math.abs(S.a0)<=0.5,'mide la inclinación de los renglones: 4° → '+S.a4+' · −3° → '+S.am+' · derecha → '+S.a0);
 ok(Math.abs(S.after)<=0.5&&S.same,'después de enderezar, la hoja queda derecha ('+S.after+'°) y del mismo tamaño');
 ok(R.E&&R.E.text&&R.E.conf>=0.5&&R.E.x0>=280&&R.E.x0<=345&&R.E.x1>=560&&R.E.x1<=640&&R.E.y1-R.E.y0>1000,'ticket blanco sobre mesa BLANCA con posnet y lapicera: se recorta solo el ticket, por su letra (x '+(R.E&&R.E.x0)+'–'+(R.E&&R.E.x1)+' de 900)');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
