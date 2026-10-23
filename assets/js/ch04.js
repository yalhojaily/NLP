/* Chapter 4 · Logistic Regression — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sig=z=>1/(1+Math.exp(-z));
const r3=v=>(+v.toFixed(3)).toString();

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s4-1','4.1','تعلّم الآلة والتصنيف'],['s4-2','4.2','السيغمويد'],['s4-3','4.3','التصنيف'],['s4-4','4.4','التعلّم'],['s4-5','4.5','الإنتروبيا التقاطعية'],['s4-6','4.6','النزول التدرّجي'],['s4-7','4.7','متعدد الأصناف'],['s4-8','4.8','تعلّمه'],['s4-9','4.9','الدقة والاستدعاء'],['s4-10','4.10','التحقق المتقاطع'],['s4-11','4.11','الدلالة الإحصائية'],['s4-12','4.12','الأضرار'],['s4-13','4.13','التفسير'],['s4-14','4.14','التنظيم'],['s4-15','4.15','اشتقاق التدرّج'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- generic SVG plot ---------- */
function plot(el,o){
  const W=o.W||560,H=o.H||240,L=46,R=14,T=14,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img"><defs><clipPath id="c${el.id}"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs>`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${v}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">${o.xl}</text>`;if(o.yl)s+=`<text x="${L}" y="${T-3}">${o.yl}</text>`;
  (o.bars||[]).forEach(b=>{s+=`<rect x="${x(b.x0)}" y="${y(b.h)}" width="${Math.max(1,x(b.x1)-x(b.x0)-1)}" height="${y(o.ymin)-y(b.h)}" fill="${b.c}" rx="2"/>`});
  (o.curves||[]).forEach(c=>{let d='';const n=200;for(let i=0;i<=n;i++){const v=o.xmin+(o.xmax-o.xmin)*i/n,u=c.f(v);if(!isFinite(u))continue;d+=(d?'L':'M')+x(v).toFixed(1)+' '+y(u).toFixed(1)}
    s+=`<path d="${d}" fill="none" stroke="${c.c}" stroke-width="${c.w||2.5}" ${c.dash?'stroke-dasharray="5 4"':''} clip-path="url(#c${el.id})"/>`});
  (o.paths||[]).forEach(p=>{s+=`<path d="${p.pts.map((q,i)=>(i?'L':'M')+x(q[0]).toFixed(1)+' '+y(q[1]).toFixed(1)).join('')}" fill="none" stroke="${p.c}" stroke-width="1.5" stroke-dasharray="3 3" clip-path="url(#c${el.id})"/>`});
  (o.vl||[]).forEach(v=>{s+=`<line x1="${x(v.x)}" x2="${x(v.x)}" y1="${T}" y2="${H-B}" stroke="${v.c}" stroke-width="2"/>${v.t?`<text x="${x(v.x)+4}" y="${T+12}" style="fill:${v.c}">${v.t}</text>`:''}`});
  (o.pts||[]).forEach(p=>{s+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||5}" fill="${p.c}"/>${p.t?`<text x="${x(p.x)+8}" y="${y(p.y)-8}" style="fill:${p.c}">${p.t}</text>`:''}`});
  el.innerHTML=s+'</svg>';
}

/* ---------- 4.2 sigmoid ---------- */
function drawSig(){const z=+$('#sgZ').value,s=sig(z);$('#sgZo').textContent=z.toFixed(2);
  plot($('#sgPlot'),{xmin:-8,xmax:8,ymin:0,ymax:1,yt:[0,0.5,1],xt:[-6,-3,0,3,6],xl:'z',yl:'σ(z)',curves:[{f:sig,c:'var(--green)'}],vl:[{x:z,c:'var(--amber)'}],pts:[{x:z,y:s,c:'var(--amber)',t:s.toFixed(3)}]});
  const odds=s/(1-s);
  $('#sgCalc').textContent=`σ(${z.toFixed(2)}) = 1 / (1 + e^${(-z).toFixed(2)}) = 1 / (1 + ${Math.exp(-z).toPrecision(4)}) = ${s.toFixed(4)}\nP(y=0) = 1 − σ(z) = ${(1-s).toFixed(4)}   = σ(−z) = ${sig(-z).toFixed(4)}\nodds = ${s.toFixed(3)} / ${(1-s).toFixed(3)} = ${odds.toPrecision(4)}    logit = ln(odds) = ${Math.log(odds).toFixed(2)}  ← back to z`}
$('#sgZ').addEventListener('input',drawSig);drawSig();document.addEventListener('themechange',drawSig);

/* ---------- 4.3 sentiment classifier ---------- */
const POS=new Set(['enjoyable','great','nice','good','love','loved','awesome','wonderful','excellent','amazing','fun','best','beautiful','brilliant']);
const NEG=new Set(['hokey','second-rate','bad','awful','terrible','boring','worst','ridiculously','horrible','poor','dull','overpriced']);
const PRON=new Set(['i','me','my','mine','we','us','our','you','your','yours']);
const W0=[2.5,-5.0,-1.2,0.5,2.0,0.7],B0=0.1,TXT0=$('#saIn').value;
const FN=['x1 · positive words','x2 · negative words','x3 · "no" present','x4 · 1st/2nd pronouns','x5 · "!" present','x6 · ln(token count)'];
let SW=W0.slice(),SB=B0;
function saFeat(){const toks=$('#saIn').value.trim().split(/\s+/).filter(Boolean),lo=toks.map(t=>t.toLowerCase());
  return {toks,x:[lo.filter(t=>POS.has(t)).length,lo.filter(t=>NEG.has(t)).length,lo.includes('no')?1:0,lo.filter(t=>PRON.has(t)).length,lo.some(t=>t.includes('!'))?1:0,toks.length?Math.log(toks.length):0]}}
function drawSA(){const {toks,x}=saFeat();
  $('#saHl').innerHTML=toks.map(t=>{const l=t.toLowerCase();const c=POS.has(l)?'p':NEG.has(l)?'n':l==='no'?'q':PRON.has(l)?'r':t.includes('!')?'e':'';return c?`<span class="${c}">${esc(t)}</span>`:esc(t)}).join(' ');
  $('#saTable').innerHTML='<tr><th>الخاصية</th><th>x</th><th>w</th><th>w × x</th></tr>'+FN.map((f,i)=>`<tr><td class="en" style="text-align:left">${f}</td><td class="num">${i===5?`ln(${toks.length}) = ${x[5].toFixed(2)}`:x[i]}</td><td class="num"><input type="number" step="0.1" value="${SW[i]}" data-w="${i}" class="wIn"></td><td class="num">${r3(SW[i]*x[i])}</td></tr>`).join('')+`<tr><td class="en" style="text-align:left">b · bias</td><td></td><td class="num"><input type="number" step="0.1" value="${SB}" id="saB" class="wIn"></td><td class="num">${SB}</td></tr>`;
  $$('#saTable .wIn').forEach(i=>i.addEventListener('change',()=>{if(i.id==='saB')SB=+i.value;else SW[+i.dataset.w]=+i.value;drawSA()}));
  const z=SW.reduce((a,w,i)=>a+w*x[i],0)+SB,p=sig(z);
  $('#saCalc').textContent=`z = w·x + b = [${SW.join(', ')}] · [${x.map((v,i)=>i===5?v.toFixed(2):v).join(', ')}] + ${SB}\n  = ${z.toFixed(3)}\nP(+|x) = σ(${z.toFixed(3)}) = ${p.toFixed(2)}     P(−|x) = 1 − ${p.toFixed(2)} = ${(1-p).toFixed(2)}\ndecision: ${p>0.5?'POSITIVE (P > 0.5)':'NEGATIVE (P ≤ 0.5)'}`}
$('#saIn').addEventListener('input',drawSA);
$('#saReset').onclick=()=>{$('#saIn').value=TXT0;SW=W0.slice();SB=B0;drawSA()};
$('#saAdd').onclick=()=>{$('#saIn').value=TXT0+' But bottom line , the movie is terrible !';drawSA()};
drawSA();

/* z-scores */
function drawZS(){const v=$('#zsIn').value.split(/[,،\s]+/).map(Number).filter(n=>!isNaN(n));if(v.length<2){$('#zsCalc').textContent='اكتب رقمين على الأقل';return}
  const m=v.length,mu=v.reduce((a,b)=>a+b,0)/m,sd=Math.sqrt(v.reduce((a,b)=>a+(b-mu)**2,0)/m),mn=Math.min(...v),mx=Math.max(...v);
  $('#zsCalc').textContent=`μ = (${v.join(' + ')}) / ${m} = ${r3(mu)}\nσ = √( (${v.map(x=>`(${x}−${r3(mu)})²`).join(' + ')}) / ${m} ) = ${r3(sd)}\nz-scores  (x−μ)/σ : ${v.map(x=>r3((x-mu)/sd)).join(', ')}\nmin-max   (x−min)/(max−min) : ${v.map(x=>r3((x-mn)/(mx-mn||1))).join(', ')}`}
$('#zsIn').addEventListener('input',drawZS);drawZS();

/* ---------- 4.5 cross-entropy ---------- */
let ceY=1;
function drawCE(){const yh=+$('#ceY').value;$('#ceYo').textContent=yh.toFixed(2);
  const L=-(ceY*Math.log(yh)+(1-ceY)*Math.log(1-yh));
  plot($('#cePlot'),{xmin:0,xmax:1,ymin:0,ymax:5,yt:[0,1,2,3,4,5],xt:[0,0.25,0.5,0.75,1],xl:'ŷ = P(y=1)',yl:'loss',curves:[{f:v=>-Math.log(v),c:'var(--green)',w:ceY?2.5:1.2,dash:!ceY},{f:v=>-Math.log(1-v),c:'var(--rose)',w:ceY?1.2:2.5,dash:!!ceY}],pts:[{x:yh,y:L,c:'var(--amber)',t:L.toFixed(2)}]});
  $('#ceCalc').textContent=`L = −[ y·ln ŷ + (1−y)·ln(1−ŷ) ] = −[ ${ceY}·ln ${yh.toFixed(2)} + ${1-ceY}·ln ${(1-yh).toFixed(2)} ]\n  = −ln ${ceY?yh.toFixed(2):(1-yh).toFixed(2)} = ${L.toFixed(3)}\n(green curve: loss when y = 1;  rose curve: loss when y = 0)`}
$('#ceY').addEventListener('input',drawCE);$$('#ceT button').forEach(b=>b.onclick=()=>{ceY=+b.dataset.y;$$('#ceT button').forEach(x=>x.classList.toggle('on',x===b));drawCE()});drawCE();document.addEventListener('themechange',drawCE);

/* ---------- 4.6 1-D gradient descent ---------- */
let gdW=-1,gdPath=[[-1,16]];const gL=w=>(w-3)**2,gD=w=>2*(w-3);
function drawGD(msg){const e=+$('#gdE').value;$('#gdEo').textContent=e.toFixed(2);
  plot($('#gdPlot'),{xmin:-3,xmax:9,ymin:0,ymax:36,yt:[0,9,18,27,36],xt:[-2,0,3,6,8],xl:'w',yl:'L(w)',curves:[{f:gL,c:'var(--green)'}],paths:[{pts:gdPath,c:'var(--amber)'}],pts:[...gdPath.slice(0,-1).map(p=>({x:p[0],y:p[1],c:'var(--amber)',r:3})),{x:gdW,y:gL(gdW),c:'var(--rose)',r:6}],vl:[{x:3,c:'var(--soft)',t:'w_min'}]});
  $('#gdCalc').textContent=msg||`w = ${r3(gdW)}   L(w) = ${r3(gL(gdW))}   slope dL/dw = 2(w−3) = ${r3(gD(gdW))}`}
function gdStep(){const e=+$('#gdE').value,g=gD(gdW),nw=gdW-e*g;const m=`w_new = w − η·slope = ${r3(gdW)} − ${e} × ${r3(g)} = ${r3(nw)}\nL: ${r3(gL(gdW))} → ${r3(gL(nw))}${Math.abs(nw-3)>Math.abs(gdW-3)?'   ← moved AWAY from the minimum: η too large!':''}`;gdW=nw;gdPath.push([gdW,gL(gdW)]);drawGD(m)}
$('#gdStep').onclick=gdStep;$('#gd10').onclick=()=>{for(let i=0;i<10;i++)gdStep()};$('#gdReset').onclick=()=>{gdW=-1;gdPath=[[-1,16]];drawGD()};$('#gdE').addEventListener('input',()=>drawGD());drawGD();document.addEventListener('themechange',()=>drawGD());

/* ---------- 4.6.3 trainer ---------- */
const DATA=[[3,2,1],[2,5,0],[4,1,1],[1,3,0],[5,2,1],[0,4,0],[3,4,0],[4,0,1],[2,1,1],[1,5,0]];
let T={w:[0,0],b:0,i:0,step:0,epoch:0,order:DATA.map((_,i)=>i),mode:'sgd',last:''};
function tLoss(){let L=0,acc=0;DATA.forEach(([a,c,y])=>{const p=sig(T.w[0]*a+T.w[1]*c+T.b);L+=-(y*Math.log(p+1e-12)+(1-y)*Math.log(1-p+1e-12));acc+=((p>0.5?1:0)===y)});return {L:L/DATA.length,acc:acc/DATA.length}}
function tStep(){const e=+$('#trE').value,al=+$('#trA').value;
  if(T.mode==='sgd'){const k=T.order[T.i],[a,c,y]=DATA[k],z=T.w[0]*a+T.w[1]*c+T.b,p=sig(z),d=p-y;
    const g=[d*a+2*al*T.w[0],d*c+2*al*T.w[1],d];const old=[...T.w,T.b];
    T.w=[T.w[0]-e*g[0],T.w[1]-e*g[1]];T.b-=e*g[2];
    T.last=`example #${k+1}: x=[${a}, ${c}], y=${y}\nŷ = σ(${r3(old[0])}·${a} + ${r3(old[1])}·${c} + ${r3(old[2])}) = σ(${r3(z)}) = ${r3(p)}\ngradient = [(ŷ−y)·x1${al?' + 2αw1':''}, (ŷ−y)·x2${al?' + 2αw2':''}, ŷ−y] = [${g.map(r3).join(', ')}]\nθ ← θ − η·g = [${old.map(r3).join(', ')}] − ${e}×[${g.map(r3).join(', ')}]`;
    T.i++;if(T.i>=DATA.length){T.i=0;T.epoch++;T.order=DATA.map((_,i)=>i).sort(()=>Math.random()-0.5)}}
  else{let g=[0,0,0];DATA.forEach(([a,c,y])=>{const d=sig(T.w[0]*a+T.w[1]*c+T.b)-y;g[0]+=d*a;g[1]+=d*c;g[2]+=d});g=g.map(v=>v/DATA.length);g[0]+=2*al*T.w[0];g[1]+=2*al*T.w[1];
    T.w=[T.w[0]-e*g[0],T.w[1]-e*g[1]];T.b-=e*g[2];T.epoch++;T.last=`batch step: average gradient over all ${DATA.length} examples = [${g.map(r3).join(', ')}]`}
  T.step++}
function drawTR(){const e=+$('#trE').value,al=+$('#trA').value;$('#trEo').textContent=e.toFixed(2);$('#trAo').textContent=al.toFixed(2);
  const W=300,H=300,P=30,S=(W-2*P)/6,x=v=>P+v*S,y=v=>H-P-v*S;let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="حد القرار"><defs><clipPath id="trClip"><rect x="${P}" y="${P}" width="${W-2*P}" height="${H-2*P}"/></clipPath></defs>`;
  const N=24;for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=(i+0.5)*6/N,c=(j+0.5)*6/N,p=sig(T.w[0]*a+T.w[1]*c+T.b);
    s+=`<rect x="${x(i*6/N)}" y="${y((j+1)*6/N)}" width="${S*6/N+0.5}" height="${S*6/N+0.5}" fill="${p>0.5?'var(--green)':'var(--rose)'}" opacity="${(Math.abs(p-0.5)*0.5).toFixed(3)}"/>`}
  for(let v=0;v<=6;v++)s+=`<text x="${x(v)}" y="${H-P+14}" text-anchor="middle">${v}</text><text x="${P-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
  s+=`<text x="${W-P}" y="${H-4}" text-anchor="end">x1 (positive)</text><text x="${P}" y="${P-10}">x2 (negative)</text>`;
  if(Math.abs(T.w[1])>1e-9||Math.abs(T.w[0])>1e-9){let pts=[];if(Math.abs(T.w[1])>1e-9){for(const a of [0,6])pts.push([a,-(T.w[0]*a+T.b)/T.w[1]])}else{const a=-T.b/T.w[0];pts=[[a,0],[a,6]]}
    s+=`<line x1="${x(pts[0][0])}" y1="${y(pts[0][1])}" x2="${x(pts[1][0])}" y2="${y(pts[1][1])}" stroke="var(--ink)" stroke-width="2" clip-path="url(#trClip)"/>`}
  DATA.forEach(([a,c,yy],k)=>{const cur=T.mode==='sgd'&&T.step>0&&k===T.order[(T.i+DATA.length-1)%DATA.length];s+=`<circle cx="${x(a)}" cy="${y(c)}" r="${cur?8:6}" fill="${yy?'var(--green)':'var(--rose)'}" stroke="${cur?'var(--ink)':'var(--paper)'}" stroke-width="2"/>`});
  $('#trPlot').innerHTML=s+'</svg>';
  const {L,acc}=tLoss();
  $('#trCalc').textContent=`step ${T.step}   epoch ${T.epoch}\nw1 = ${r3(T.w[0])}   w2 = ${r3(T.w[1])}   b = ${r3(T.b)}\naverage loss = ${L.toFixed(3)}   accuracy = ${(acc*100).toFixed(0)}%\n\n${T.last||'press "one step": the first example is the book’s (x=[3,2], y=1)'}`}
$('#trStep').onclick=()=>{tStep();drawTR()};
$('#trEpoch').onclick=()=>{const n=T.mode==='sgd'?DATA.length:1;for(let i=0;i<n;i++)tStep();drawTR()};
$('#tr50').onclick=()=>{const n=(T.mode==='sgd'?DATA.length:1)*50;for(let i=0;i<n;i++)tStep();drawTR()};
$('#trReset').onclick=()=>{T={...T,w:[0,0],b:0,i:0,step:0,epoch:0,order:DATA.map((_,i)=>i),last:''};drawTR()};
$$('#trMode button').forEach(b=>b.onclick=()=>{T.mode=b.dataset.m;$$('#trMode button').forEach(x=>x.classList.toggle('on',x===b));$('#trReset').click()});
['#trE','#trA'].forEach(s=>$(s).addEventListener('input',drawTR));drawTR();document.addEventListener('themechange',drawTR);

/* ---------- 4.7 softmax ---------- */
function drawSM(){const z=$('#smIn').value.split(/[,،\s]+/).map(Number).filter(v=>!isNaN(v)&&String(v)!=='');if(!z.length)return;
  const mx=Math.max(...z),e=z.map(v=>Math.exp(v)),S=e.reduce((a,b)=>a+b,0),p=e.map(v=>v/S);
  $('#smBars').innerHTML=p.map((v,i)=>`<div class="br"><span class="w0">z${i+1} = ${z[i]}</span><div class="tr"><div class="fl" style="width:${v/Math.max(...p)*100}%"></div></div><span class="v">${v.toFixed(2)}</span></div>`).join('');
  $('#smCalc').textContent=`exp(z) = [${e.map(v=>v.toPrecision(3)).join(', ')}]\nsum = ${S.toPrecision(4)}\nsoftmax = exp(z)/sum = [${p.map(v=>v.toFixed(2)).join(', ')}]    (total = ${p.reduce((a,b)=>a+b,0).toFixed(2)})`}
$('#smIn').addEventListener('input',drawSM);drawSM();

/* ---------- 4.9 confusion matrix ---------- */
const CM={pie:[0,0,100,999900],good:[80,20,20,999880],spam:[24,6,16,954]};
function cmSet(k){[$('#cmTP').value,$('#cmFP').value,$('#cmFN').value,$('#cmTN').value]=CM[k];drawCM()}
function drawCM(){const [tp,fp,fn,tn]=['#cmTP','#cmFP','#cmFN','#cmTN'].map(s=>Math.max(0,+$(s).value||0)),b=+$('#cmB').value;$('#cmBo').textContent=b.toFixed(2);
  const N=tp+fp+fn+tn,acc=N?(tp+tn)/N:0,P=tp+fp?tp/(tp+fp):NaN,R=tp+fn?tp/(tp+fn):NaN,F=(P+R)?2*P*R/(P+R):0,Fb=(b*b*P+R)?(b*b+1)*P*R/(b*b*P+R):0;
  const f=v=>isNaN(v)?'undefined (0/0)':v.toFixed(4);
  $('#cmCalc').textContent=`accuracy  = (tp+tn)/all = ${tp+tn}/${N} = ${(acc*100).toFixed(2)}%\nprecision = tp/(tp+fp) = ${tp}/${tp+fp} = ${f(P)}\nrecall    = tp/(tp+fn) = ${tp}/${tp+fn} = ${f(R)}\nF1 = 2PR/(P+R) = ${isNaN(P)||isNaN(R)?'0':F.toFixed(4)}      Fβ(β=${b.toFixed(2)}) = ${isNaN(P)||isNaN(R)?'0':Fb.toFixed(4)}\narithmetic mean (P+R)/2 = ${isNaN(P)||isNaN(R)?'—':((P+R)/2).toFixed(4)}   ← compare with F1`}
['#cmTP','#cmFP','#cmFN','#cmTN','#cmB'].forEach(s=>$(s).addEventListener('input',drawCM));$$('[data-cm]').forEach(b=>b.onclick=()=>cmSet(b.dataset.cm));cmSet('good');

/* 3-class */
const C3=['urgent','normal','spam'];let M3=[[8,10,1],[5,60,50],[3,30,200]];
function drawM3(){
  let t='<table class="tb m3"><tr><th></th><th colspan="3" style="text-align:center">gold labels</th><th>precision</th></tr><tr><th>system ↓</th>'+C3.map(c=>`<th>${c}</th>`).join('')+'<th></th></tr>';
  const P=C3.map((_,i)=>M3[i][i]/M3[i].reduce((a,b)=>a+b,0)),R=C3.map((_,j)=>M3[j][j]/M3.reduce((a,r)=>a+r[j],0));
  M3.forEach((r,i)=>{t+=`<tr><th>${C3[i]}</th>${r.map((v,j)=>`<td class="num"><input type="number" min="0" value="${v}" data-i="${i}" data-j="${j}" class="${i===j?'diag':''}"></td>`).join('')}<td class="num">${P[i].toFixed(2)}</td></tr>`});
  t+=`<tr><th>recall</th>${R.map(v=>`<td class="num">${v.toFixed(2)}</td>`).join('')}<td></td></tr></table>`;$('#m3').innerHTML=t;
  $$('#m3 input').forEach(inp=>inp.addEventListener('change',()=>{M3[+inp.dataset.i][+inp.dataset.j]=Math.max(0,+inp.value||0);drawM3()}));
  const TP=M3.reduce((a,r,i)=>a+r[i],0),SYS=M3.flat().reduce((a,b)=>a+b,0);
  const pool=C3.map((_,i)=>{const tp=M3[i][i],fp=M3[i].reduce((a,b)=>a+b,0)-tp,fn=M3.reduce((a,r)=>a+r[i],0)-tp;return {tp,fp,fn}});
  $('#m3Calc').textContent=C3.map((c,i)=>`${c.padEnd(7)}: tp=${pool[i].tp}  fp=${pool[i].fp}  →  precision = ${pool[i].tp}/${pool[i].tp+pool[i].fp} = ${P[i].toFixed(2)}`).join('\n')+
  `\n\npooled: tp=${TP}  fp=${SYS-TP}\nmicroaverage precision = ${TP}/${SYS} = ${(TP/SYS).toFixed(2)}\nmacroaverage precision = (${P.map(v=>v.toFixed(2)).join(' + ')}) / 3 = ${(P.reduce((a,b)=>a+b,0)/3).toFixed(2)}`}
drawM3();

/* ---------- 4.10 cross-validation ---------- */
let cvI=0;
function drawCV(){let h='<div class="cv-row">';for(let k=0;k<10;k++)h+=`<span class="${k===cvI?'dev':'trn'}">${k===cvI?'Dev':'Train'}</span>`;h+='</div><div class="cv-test">Test set<small>منفصلة، تُستخدم مرة واحدة في النهاية</small></div>';
  $('#cv').innerHTML=h;$('#cvNote').textContent=`الدورة ${AR(cvI+1)} من ١٠: ندرّب على ٩ طيّات ونقيس على الطيّة ${AR(cvI+1)}.`}
$('#cvNext').onclick=()=>{cvI=(cvI+1)%10;drawCV()};drawCV();

/* ---------- 4.11 bootstrap ---------- */
let DOCS=['AB','A','AB','-','AB','A','B','AB','A','-'];
const DLAB={AB:'A✓ B✓',A:'A✓ B✗',B:'A✗ B✓','-':'A✗ B✗'},NEXT={AB:'A',A:'B',B:'-','-':'AB'};
function bsDelta(arr){let a=0,b=0;arr.forEach(d=>{if(d==='AB'||d==='A')a++;if(d==='AB'||d==='B')b++});return (a-b)/arr.length}
function drawDocs(){$('#bsDocs').innerHTML=DOCS.map((d,i)=>`<button class="doc d-${d==='-'?'n':d}" data-i="${i}"><small>${AR(i+1)}</small>${DLAB[d]}</button>`).join('');
  $$('#bsDocs .doc').forEach(b=>b.onclick=()=>{DOCS[+b.dataset.i]=NEXT[DOCS[+b.dataset.i]];drawDocs();$('#bsPlot').innerHTML='';showDelta()})}
function showDelta(){let a=0,b=0;DOCS.forEach(d=>{if(d==='AB'||d==='A')a++;if(d==='AB'||d==='B')b++});$('#bsCalc').textContent=`accuracy A = ${a}/10 = ${(a/10).toFixed(2)}   B = ${b}/10 = ${(b/10).toFixed(2)}   δ(x) = ${(bsDelta(DOCS)).toFixed(2)}\npress “run”`}
$('#bsRun').onclick=()=>{const B=+$('#bsB').value,d=bsDelta(DOCS),n=DOCS.length,hist=new Map();let s=0;
  for(let i=0;i<B;i++){const smp=[];for(let j=0;j<n;j++)smp.push(DOCS[Math.floor(Math.random()*n)]);const di=Math.round(bsDelta(smp)*10)/10;hist.set(di,(hist.get(di)||0)+1);if(di>=2*d-1e-9)s++}
  const ks=[...hist.keys()].sort((a,b)=>a-b),mx=Math.max(...hist.values());
  plot($('#bsPlot'),{xmin:-0.65,xmax:0.85,ymin:0,ymax:mx*1.1,yt:[0,Math.round(mx/2),mx],xt:[-0.6,-0.4,-0.2,0,0.2,0.4,0.6,0.8],xl:'δ(x⁽ⁱ⁾)',yl:'count',bars:ks.map(k=>({x0:k-0.045,x1:k+0.045,h:hist.get(k),c:k>=2*d-1e-9?'var(--rose)':'var(--amber)'})),vl:[{x:2*d,c:'var(--rose)',t:'2δ'},{x:d,c:'var(--ink)',t:'δ'}]});
  const p=s/B;$('#bsCalc').textContent=`δ(x) = ${d.toFixed(2)}   threshold 2δ = ${(2*d).toFixed(2)}\nvirtual test sets with δ(x⁽ⁱ⁾) ≥ 2δ: ${s} of ${B}\np-value ≈ ${s}/${B} = ${p.toFixed(4)}\n${p<0.01?'p < 0.01 → reject H₀: A is significantly better':p<0.05?'p < 0.05 (but ≥ 0.01): significant at the 0.05 level only':'p ≥ 0.05 → cannot reject H₀: the difference may be chance'}`};
drawDocs();showDelta();

/* ---------- 4.15 derivative check ---------- */
function drawDV(){const z=+$('#dvZ').value,h=1e-4;$('#dvZo').textContent=z.toFixed(1);const num=(sig(z+h)-sig(z-h))/(2*h),s=sig(z);
  $('#dvCalc').textContent=`numeric slope  ≈ (σ(z+h) − σ(z−h)) / 2h = ${num.toFixed(6)}    (h = 0.0001)\nformula        σ(z)(1 − σ(z)) = ${s.toFixed(4)} × ${(1-s).toFixed(4)} = ${(s*(1-s)).toFixed(6)}`}
$('#dvZ').addEventListener('input',drawDV);drawDV();

/* ---------- glossary ---------- */
const GL=[['تصنيف النصوص','text categorization','إعطاء النص صنفاً.'],['تحليل المشاعر','sentiment analysis','هل موقف الكاتب إيجابي أم سلبي؟'],['تعلّم موجَّه','supervised learning','التعلم من أمثلة موسومة بالجواب الصحيح.'],['خاصية','feature','صفة رقمية للمدخل، xᵢ.'],['وزن / انحياز','weight / bias','أهمية الخاصية / رقم يُضاف للمجموع.'],['الضرب النقطي','dot product','مجموع حواصل ضرب العناصر المتقابلة.'],['السيغمويد','sigmoid','σ(z) = 1/(1+e⁻ᶻ) تعصر أي رقم إلى (0,1).'],['اللوجِت','logit','z: لوغاريتم الأرجحية؛ مدخل السيغمويد أو السوفتماكس.'],['حد القرار','decision boundary','عتبة 0.5 للاحتمال.'],['الدرجة المعيارية','z-score','(x − μ)/σ.'],['دالة الخسارة','loss function','مقياس بُعد التقدير عن الجواب الصحيح.'],['الإنتروبيا التقاطعية','cross-entropy loss','−log احتمال الجواب الصحيح.'],['argmin','argmin','المُدخل الذي يحقق أصغر قيمة.'],['دالة محدّبة','convex','لها قاع واحد فقط.'],['التدرّج','gradient ∇','متجه المشتقات الجزئية؛ اتجاه أسرع صعود.'],['معدل التعلّم','learning rate η','طول خطوة النزول.'],['معامل فائق','hyperparameter','يختاره المصمم ولا يُتعلَّم.'],['نزول تدرّجي عشوائي','SGD','تحديث بعد كل مثال عشوائي.'],['دفعة صغيرة','mini-batch','تدرّج على مجموعة أمثلة.'],['متجه أحادي الواحد','one-hot','١ في خانة الصنف الصحيح وأصفار في الباقي.'],['السوفتماكس','softmax','يحوّل متجه درجات إلى توزيع احتمالي.'],['مصفوفة الالتباس','confusion matrix','جدول النظام مقابل الوسوم الذهبية.'],['الدقة / الاستدعاء','precision / recall','tp/(tp+fp) / tp/(tp+fn).'],['مقياس F','F-measure','متوسط توافقي للدقة والاستدعاء.'],['متوسط كبير / صغير','macro / micro average','متوسط الأصناف / تجميع القرارات.'],['تحقق متقاطع','cross-validation','تدريب واختبار k مرة على طيّات مختلفة.'],['فرضية العدم','null hypothesis','A ليس أفضل من B.'],['القيمة الاحتمالية','p-value','احتمال فرق بهذا الحجم صدفةً.'],['البوتستراب','bootstrap','عيّنات افتراضية بالسحب مع الإرجاع.'],['بطاقة النموذج','model card','وثيقة تصف بيانات النموذج واستخدامه وأداءه.'],['التنظيم','regularization','عقوبة على الأوزان الكبيرة.'],['L2 / L1','ridge / lasso','مجموع المربعات / مجموع القيم المطلقة.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td><b>${g[0]}</b></td><td class="en">${esc(g[1])}</td><td>${esc(g[2])}</td></tr>`).join('');
