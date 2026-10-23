/* Chapter 6 · Neural Networks — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sig=z=>1/(1+Math.exp(-z));
const r3=v=>{const x=+(+v).toFixed(3);return (Object.is(x,-0)?0:x).toString()};
const num=s=>{const v=parseFloat(String(s).replace('−','-'));return isNaN(v)?0:v};
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const ACT={sig:{f:sig,d:z=>sig(z)*(1-sig(z)),n:'σ'},tanh:{f:Math.tanh,d:z=>1-Math.tanh(z)**2,n:'tanh'},relu:{f:z=>Math.max(z,0),d:z=>z>=0?1:0,n:'ReLU'},lin:{f:z=>z,d:()=>1,n:'identity'}};
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const sg=(v,d=1)=>(v<0?'− ':'+ ')+(d===1?Math.abs(v).toFixed(1):r3(Math.abs(v)));
const segVal=(id,k)=>$(id+' button.on').dataset[k];

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s6-1','6.1','الوحدات'],['s6-2','6.2','مشكلة XOR'],['s6-2-1','6.2.1','الحل: طبقتان'],['s6-3','6.3','الشبكات الأمامية'],['s6-4','6.4','تصنيف النصوص'],['s6-5','6.5','التضمينات مدخلاً'],['s6-6','6.6','التدريب والانتشار العكسي'],['ex','','الخلاصة']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* generic line plot */
function plot(el,o){
  const W=o.W||560,H=o.H||240,L=46,R=14,T=14,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img"><defs><clipPath id="c${el.id}"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs>`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${v}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">${o.xl}</text>`;if(o.yl)s+=`<text x="${L}" y="${T-3}">${o.yl}</text>`;
  (o.curves||[]).forEach(c=>{let d='';const n=300;for(let i=0;i<=n;i++){const v=o.xmin+(o.xmax-o.xmin)*i/n,u=c.f(v);if(!isFinite(u))continue;d+=(d?'L':'M')+x(v).toFixed(1)+' '+y(u).toFixed(1)}
    s+=`<path d="${d}" fill="none" stroke="${c.c}" stroke-width="${c.w||2.5}" ${c.dash?'stroke-dasharray="5 4"':''} ${c.op?`opacity="${c.op}"`:''} clip-path="url(#c${el.id})"/>`});
  (o.lines||[]).forEach(p=>{if(p.pts.length<2)return;s+=`<path d="${p.pts.map((q,i)=>(i?'L':'M')+x(q[0]).toFixed(1)+' '+y(q[1]).toFixed(1)).join('')}" fill="none" stroke="${p.c}" stroke-width="2" clip-path="url(#c${el.id})"/>`});
  (o.pts||[]).forEach(p=>{s+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||5}" fill="${p.c}"/>${p.t?`<text x="${x(p.x)+8}" y="${y(p.y)-8}" style="fill:${p.c}">${p.t}</text>`:''}`});
  el.innerHTML=s+'</svg>';
}
/* square 2-D plane for XOR-type pictures */
function plane(el,o){
  const S=o.S||260,P=30,x=v=>P+(v-o.lo)/(o.hi-o.lo)*(S-2*P),y=v=>S-P-(v-o.lo)/(o.hi-o.lo)*(S-2*P);
  let s=`<svg class="map" viewBox="0 0 ${S} ${S}" role="img"><defs><clipPath id="pc${el.id}"><rect x="${P}" y="${P}" width="${S-2*P}" height="${S-2*P}"/></clipPath></defs>`;
  if(o.field){const n=o.n||26,st=(o.hi-o.lo)/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const u=o.lo+(i+.5)*st,v=o.lo+(j+.5)*st,f=o.field(u,v);if(f==null)continue;
    s+=`<rect x="${x(o.lo+i*st).toFixed(1)}" y="${y(o.lo+(j+1)*st).toFixed(1)}" width="${(x(st)-x(0)+.6).toFixed(1)}" height="${(x(st)-x(0)+.6).toFixed(1)}" fill="${f.c}" fill-opacity="${f.o.toFixed(2)}" shape-rendering="crispEdges"/>`}}
  (o.ticks||[]).forEach(g=>{s+=`<line x1="${x(g)}" x2="${x(g)}" y1="${P}" y2="${S-P}" stroke="var(--rule)" stroke-width=".7"/><line x1="${P}" x2="${S-P}" y1="${y(g)}" y2="${y(g)}" stroke="var(--rule)" stroke-width=".7"/><text x="${x(g)}" y="${S-P+14}" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${g}</text><text x="${P-5}" y="${y(g)+3}" font-size="10" text-anchor="end" fill="var(--soft)" font-family="Noto Sans Mono">${g}</text>`});
  s+=`<rect x="${P}" y="${P}" width="${S-2*P}" height="${S-2*P}" fill="none" stroke="var(--rule)"/>`;
  if(o.xl)s+=`<text x="${S-P}" y="${S-4}" font-size="11" text-anchor="end" fill="var(--soft)" font-family="Noto Sans">${o.xl}</text>`;
  if(o.yl)s+=`<text x="${P}" y="${P-8}" font-size="11" fill="var(--soft)" font-family="Noto Sans">${o.yl}</text>`;
  (o.lines||[]).forEach(l=>{s+=`<line x1="${x(l.x1)}" y1="${y(l.y1)}" x2="${x(l.x2)}" y2="${y(l.y2)}" stroke="${l.c}" stroke-width="2.2" ${l.dash?'stroke-dasharray="6 4"':''} clip-path="url(#pc${el.id})"/>`});
  (o.pts||[]).forEach(p=>{s+=`${p.bad?`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="12" fill="none" stroke="var(--rose)" stroke-width="2.5"/>`:''}<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||7}" fill="${p.on?'var(--ink)':'var(--paper)'}" stroke="var(--ink)" stroke-width="2"/>${p.t?`<text x="${x(p.x)+(p.dx||10)}" y="${y(p.y)+(p.dy||-10)}" font-size="11" fill="var(--soft)" font-family="Noto Sans Mono" ${p.end?'text-anchor="end"':''}>${p.t}</text>`:''}`});
  el.innerHTML=s+'</svg>';
}
/* line through square for w1 x + w2 y + b = 0 */
function bLine(w1,w2,b,lo,hi){if(Math.abs(w2)>1e-9)return {x1:lo,y1:(-b-w1*lo)/w2,x2:hi,y2:(-b-w1*hi)/w2};if(Math.abs(w1)>1e-9){const v=-b/w1;return {x1:v,y1:lo,x2:v,y2:hi}}return null}

/* ---------- 6.1 single unit ---------- */
const UN0={x1:.5,x2:.6,x3:.1,w1:.2,w2:.3,w3:.9,b:.5};
function drawUnit(){const g=segVal('#unG','g'),A=ACT[g];const v={};Object.keys(UN0).forEach(k=>v[k]=num($('#un'+k).value));
  const xs=[v.x1,v.x2,v.x3],ws=[v.w1,v.w2,v.w3],z=xs.reduce((s,x,i)=>s+x*ws[i],0)+v.b,a=A.f(z);
  const W=520,H=210;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:560px">`;
  const ys=[35,95,155],sx=250,sy=95;
  ys.forEach((y,i)=>{s+=`<line x1="60" y1="${y}" x2="${sx-26}" y2="${sy}" stroke="var(--math)" stroke-width="${1+Math.min(4,Math.abs(ws[i])*3)}" opacity=".7"/><text x="${(60+sx)/2-10}" y="${(y+sy)/2-6}" font-size="12" fill="var(--math)" font-family="Noto Sans Mono">w${i+1}=${r3(ws[i])}</text>
    <circle cx="40" cy="${y}" r="20" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/><text x="40" y="${y+4}" font-size="12" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans Mono">${r3(xs[i])}</text><text x="12" y="${y-22}" font-size="11" fill="var(--soft)" font-family="Noto Sans">x${i+1}</text>`});
  s+=`<line x1="60" y1="195" x2="${sx-20}" y2="${sy+18}" stroke="var(--soft)" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="40" cy="195" r="13" fill="var(--tint)" stroke="var(--soft)"/><text x="40" y="199" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">+1</text><text x="130" y="200" font-size="12" fill="var(--soft)" font-family="Noto Sans Mono">b=${r3(v.b)}</text>
  <circle cx="${sx}" cy="${sy}" r="26" fill="var(--math-soft)" stroke="var(--math)" stroke-width="2"/><text x="${sx}" y="${sy+6}" font-size="20" text-anchor="middle" fill="var(--math)">Σ</text>
  <line x1="${sx+26}" y1="${sy}" x2="${sx+84}" y2="${sy}" stroke="var(--ink)" stroke-width="1.5"/><text x="${sx+55}" y="${sy-8}" font-size="12" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans Mono">z=${r3(z)}</text>
  <rect x="${sx+84}" y="${sy-22}" width="64" height="44" rx="8" fill="var(--green-soft)" stroke="var(--green)" stroke-width="2"/><text x="${sx+116}" y="${sy+5}" font-size="14" text-anchor="middle" fill="var(--green)" font-family="Noto Sans">${A.n}</text>
  <line x1="${sx+148}" y1="${sy}" x2="${W-60}" y2="${sy}" stroke="var(--ink)" stroke-width="1.5"/><text x="${W-8}" y="${sy+5}" font-size="14" text-anchor="end" fill="var(--ink)" font-family="Noto Sans Mono" font-weight="600">y=${r3(a)}</text></svg>`;
  $('#unSvg').innerHTML=s;
  $('#unCalc').textContent=`z = w·x + b = ${ws.map((w,i)=>`${r3(w)}×${r3(xs[i])}`).join(' + ')} + ${r3(v.b)}\n  = ${xs.map((x,i)=>r3(x*ws[i])).join(' + ')} + ${r3(v.b)} = ${r3(z)}\n`+
   (g==='sig'?`y = σ(z) = 1/(1+e^(−${r3(z)})) = 1/(1+${r3(Math.exp(-z))}) = ${r3(a)}`:g==='tanh'?`y = tanh(z) = (e^z − e^−z)/(e^z + e^−z) = (${r3(Math.exp(z))} − ${r3(Math.exp(-z))})/(${r3(Math.exp(z))} + ${r3(Math.exp(-z))}) = ${r3(a)}`:`y = ReLU(z) = max(${r3(z)}, 0) = ${r3(a)}`)+
   (g==='sig'&&Math.abs(z-.87)<1e-9?'    ← the book: .70':'')}
Object.keys(UN0).forEach(k=>$('#un'+k).addEventListener('input',drawUnit));
segOn('#unG',drawUnit);
$('#unReset').addEventListener('click',()=>{Object.entries(UN0).forEach(([k,v])=>$('#un'+k).value=v);$$('#unG button').forEach(b=>b.classList.toggle('on',b.dataset.g==='sig'));drawUnit()});
drawUnit();

/* ---------- 6.1 activation functions ---------- */
function drawAct(){const f=segVal('#acF','f'),A=ACT[f],z=+$('#acZ').value,n=+$('#acN').value;$('#acZo').textContent=z.toFixed(2);$('#acNo').textContent=n;
  const lo=f==='relu'?-1.5:f==='tanh'?-1.2:-0.2,hi=f==='relu'?6:1.2;
  plot($('#acPlot'),{xmin:-6,xmax:6,ymin:lo,ymax:hi,xt:[-6,-4,-2,0,2,4,6],yt:f==='relu'?[0,2,4,6]:f==='tanh'?[-1,0,1]:[0,.25,.5,1],xl:'z',
    curves:[{f:A.f,c:'var(--green)'},{f:A.d,c:'var(--amber)',dash:1,w:2}],pts:[{x:z,y:A.f(z),c:'var(--green)',t:`${A.n}(z)=${r3(A.f(z))}`},{x:z,y:A.d(z),c:'var(--amber)',r:4,t:`slope ${r3(A.d(z))}`}]});
  const d=A.d(z);
  $('#acCalc').textContent=`${A.n}(${z.toFixed(2)}) = ${r3(A.f(z))}\nderivative (slope) ${A.n}′(${z.toFixed(2)}) = ${f==='sig'?`σ(z)(1−σ(z)) = ${r3(A.f(z))}×${r3(1-A.f(z))} = `:f==='tanh'?`1 − tanh²(z) = `:`(z ≥ 0 ? 1 : 0) = `}${d<1e-3&&d>0?d.toExponential(2):r3(d)}\n`+
   `product of ${n} such slopes: (${d<1e-3&&d>0?d.toExponential(2):r3(d)})^${n} = ${Math.pow(d,n)<1e-3&&Math.pow(d,n)>0?Math.pow(d,n).toExponential(2):r3(Math.pow(d,n))}`+(Math.pow(d,n)<0.01&&d>0?'   ← vanishing gradient':'')}
segOn('#acF',drawAct);$('#acZ').addEventListener('input',drawAct);$('#acN').addEventListener('input',drawAct);drawAct();

/* ---------- 6.2 perceptron ---------- */
const TT={AND:[0,0,0,1],OR:[0,1,1,1],XOR:[0,1,1,0]},XS=[[0,0],[0,1],[1,0],[1,1]],PCBOOK={AND:[1,1,-1],OR:[1,1,0],XOR:null};
let pcMsg='';
function drawPC(){const f=segVal('#pcF','f'),w1=+$('#pcW1').value,w2=+$('#pcW2').value,b=+$('#pcB').value;
  $('#pcW1o').textContent=w1.toFixed(1);$('#pcW2o').textContent=w2.toFixed(1);$('#pcBo').textContent=b.toFixed(1);
  const out=XS.map(([a,c])=>w1*a+w2*c+b>0?1:0),ok=out.filter((o,i)=>o===TT[f][i]).length,ln=bLine(w1,w2,b,-1,2);
  plane($('#pcPlot'),{lo:-0.5,hi:1.5,ticks:[0,1],xl:'x₁',yl:'x₂',n:24,field:(u,v)=>w1*u+w2*v+b>0?{c:'var(--green)',o:.22}:null,lines:ln?[{...ln,c:'var(--green)'}]:[],
    pts:XS.map((p,i)=>({x:p[0],y:p[1],on:TT[f][i]===1,bad:out[i]!==TT[f][i],t:`[${p}]`}))});
  $('#pcCalc').textContent=`${f}: y = 1 if ${w1.toFixed(1)}·x₁ ${sg(w2)}·x₂ ${sg(b)} > 0\n\nx₁ x₂ | w·x+b | out | truth\n`+
    XS.map((p,i)=>{const z=w1*p[0]+w2*p[1]+b;return ` ${p[0]}  ${p[1]} | ${(z>=0?' ':'')+z.toFixed(1).padStart(4)}  |  ${out[i]}  |  ${TT[f][i]}${out[i]===TT[f][i]?'  ✓':'  ✗'}`}).join('\n')+
    `\n\ncorrect: ${ok}/4`+(ok===4?'  — separated!':'')+(ln&&Math.abs(w2)>1e-9?`\nboundary: x₂ = ${r3(-w1/w2)}·x₁ ${sg(-b/w2,3)}`:'')+(pcMsg?'\n'+pcMsg:'')}
function pcSet(w){[$('#pcW1').value,$('#pcW2').value,$('#pcB').value]=w;pcMsg='';drawPC()}
segOn('#pcF',()=>{pcMsg='';drawPC()});['#pcW1','#pcW2','#pcB'].forEach(s=>$(s).addEventListener('input',()=>{pcMsg='';drawPC()}));
$('#pcBook').addEventListener('click',()=>{const f=segVal('#pcF','f');if(PCBOOK[f])pcSet(PCBOOK[f]);else{pcMsg='XOR: the book gives no weights, because none exist.';drawPC()}});
$('#pcSearch').addEventListener('click',()=>{const f=segVal('#pcF','f'),R=rng(7);let best=-1,bw=null,hits=0;
  for(let t=0;t<20000;t++){const w=[R()*4-2,R()*4-2,R()*4-2].map(v=>Math.round(v*10)/10),ok=XS.filter(([a,c],i)=>(w[0]*a+w[1]*c+w[2]>0?1:0)===TT[f][i]).length;if(ok===4)hits++;if(ok>best){best=ok;bw=w}}
  [$('#pcW1').value,$('#pcW2').value,$('#pcB').value]=bw;pcMsg=`random search: ${hits} of 20000 settings got 4/4; best = ${best}/4`+(best<4?'  → no line separates XOR':'');drawPC()});
drawPC();

/* ---------- 6.2.1 XOR network ---------- */
const relu=z=>Math.max(z,0);
const xorNet=([a,c])=>{const z1=[a+c,a+c-1],h=z1.map(relu),zy=h[0]-2*h[1];return {z1,h,zy,y:relu(zy)}};
let xnI=0;
$('#xnBtns').innerHTML=XS.map((p,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">x = [${p}]</button>`).join('');
$$('#xnBtns button').forEach(b=>b.addEventListener('click',()=>{xnI=+b.dataset.i;$$('#xnBtns button').forEach(x=>x.classList.toggle('pri',x===b));drawXN()}));
function drawXN(){const x=XS[xnI],r=xorNet(x);
  $('#xnCalc').textContent=`x = [${x}]\nh₁ = ReLU(1·${x[0]} + 1·${x[1]} + 0)  = ReLU(${r.z1[0]})  = ${r.h[0]}\nh₂ = ReLU(1·${x[0]} + 1·${x[1]} − 1)  = ReLU(${r.z1[1]})  = ${r.h[1]}\ny  = ReLU(1·${r.h[0]} − 2·${r.h[1]} + 0) = ReLU(${r.zy}) = ${r.y}     XOR(${x}) = ${TT.XOR[xnI]} ✓`;
  const lab=XS.map(p=>`[${p}]`);
  plane($('#xnX'),{lo:-0.5,hi:2.5,ticks:[0,1,2],xl:'x₁',yl:'x₂',pts:XS.map((p,i)=>({x:p[0],y:p[1],on:TT.XOR[i]===1,t:lab[i],r:i===xnI?9:7}))});
  const H=XS.map(p=>xorNet(p).h),pts=[];
  H.forEach((h,i)=>pts.push({x:h[0],y:h[1],on:TT.XOR[i]===1,r:i===xnI?9:7,t:i===1?'[0,1] & [1,0]':i===2?null:'from '+lab[i],dy:i===1?22:-10,dx:i===1?-6:10}));
  plane($('#xnH'),{lo:-0.5,hi:2.5,ticks:[0,1,2],xl:'h₁',yl:'h₂',lines:[{...bLine(1,-2,-0.5,-1,3),c:'var(--green)',dash:1}],pts})}
drawXN();

/* ---------- 6.3 softmax ---------- */
function drawSM(){const z=$('#smIn').value.split(/[,،\s]+/).filter(s=>s!=='').map(num);if(!z.length)return;
  const e=z.map(v=>Math.exp(v)),S=e.reduce((a,b)=>a+b,0),p=e.map(v=>v/S),mx=Math.max(...p);
  $('#smBars').innerHTML=p.map((v,i)=>`<div class="br${v===mx?' pick':''}"><span class="w0">z${i+1} = ${z[i]}</span><div class="tr"><div class="fl" style="width:${v/mx*100}%"></div></div><span class="v">${v<0.01?v.toFixed(4):v.toFixed(3)}</span></div>`).join('');
  $('#smCalc').textContent=`exp(z) = [${e.map(v=>v.toPrecision(3)).join(', ')}]\nsum = ${S.toPrecision(4)}\nsoftmax = exp(z)/sum = [${p.map(v=>v<0.01?v.toFixed(4):v.toFixed(3)).join(', ')}]   total = ${p.reduce((a,b)=>a+b,0).toFixed(2)}`}
$('#smIn').addEventListener('input',drawSM);drawSM();

/* ---------- 6.3.1 linear collapse ---------- */
const LW=[1,-1,0.5],LB=[0,1,-1],LU=[1,1,-2];
function drawLC(){const g=segVal('#lcG','g'),A=ACT[g],f=x=>LW.reduce((s,w,i)=>s+LU[i]*A.f(w*x+LB[i]),0);
  plot($('#lcPlot'),{xmin:-3,xmax:3,ymin:-3,ymax:7,xt:[-3,-2,-1,0,1,2,3],yt:[-2,0,2,4,6],xl:'x',yl:'y',
    curves:[...LW.map((w,i)=>({f:x=>LU[i]*A.f(w*x+LB[i]),c:'var(--math)',w:1.3,dash:1,op:.55})),{f,c:'var(--green)',w:3}]});
  $('#lcCalc').textContent=`hidden: h_i = g(w_i·x + b_i)   w = [1, −1, 0.5]   b = [0, 1, −1]\noutput: y = 1·h₁ + 1·h₂ − 2·h₃      (thin dashed lines: each term U_i·h_i)\n`+
   (g==='lin'?`g = identity:  y = (1·1 + 1·(−1) − 2·0.5)·x + (1·0 + 1·1 − 2·(−1))\n             = W′x + b′ = −1·x + 3     ← one straight line: the 3 hidden units added nothing`
   :`g = ${A.n}:  the sum bends, so no single W′x + b′ can draw it\ny(−2) = ${r3(f(-2))}   y(0) = ${r3(f(0))}   y(2) = ${r3(f(2))}`)}
segOn('#lcG',drawLC);drawLC();

/* ---------- 6.4.1 forward pass ---------- */
const FW=[[0,1.5,-1],[0,-1,1.5],[0.2,0,0],[0,0.8,0.8]],FB=[-0.5,0.2,-0.5,-1.2],FU=[[2,-1,0,-1.5],[-1,2,0,1.5],[0,0,0.8,0]],FC=['p(+)','p(−)','p(neut)'];
const fmtM=M=>M.map(r=>'[ '+r.map(v=>(v<0?'':' ')+v.toFixed(1)).join(' ')+' ]');
function drawFF(){const g=segVal('#ffG','g'),A=ACT[g],x=[1,2,3].map(i=>num($('#ffx'+i).value));
  const zh=FW.map((r,j)=>r.reduce((s,w,i)=>s+w*x[i],0)+FB[j]),h=zh.map(A.f),z=FU.map(r=>r.reduce((s,u,j)=>s+u*h[j],0)),e=z.map(Math.exp),S=e.reduce((a,b)=>a+b,0),p=e.map(v=>v/S);
  const Wl=fmtM(FW),Ul=fmtM(FU);
  $('#ffCalc').textContent=`x = [${x.map(r3).join(', ')}]ᵀ        shape [3×1]\n\nW [4×3]               b [4×1]   Wx + b      h = ${A.n}(Wx+b)  [4×1]\n`+
    Wl.map((l,j)=>`${l}   ${(FB[j]<0?'':' ')+FB[j].toFixed(1)}     ${r3(zh[j]).padStart(6)}   →  ${r3(h[j])}`).join('\n')+
    `\n\nU [3×4]                 z = Uh  [3×1]   softmax\n`+Ul.map((l,k)=>`${l}   ${r3(z[k]).padStart(6)}     ${FC[k]} = ${p[k].toFixed(3)}`).join('\n')+
    `\n\n(illustrative weights: hidden unit 1 reacts to positive words, 2 to “no”, 3 to length, 4 only when both 2 and 3 fire)`;
  const mx=Math.max(...p);$('#ffBars').innerHTML=p.map((v,k)=>`<div class="br${v===mx?' pick':''}"><span class="w0">${FC[k]}</span><div class="tr"><div class="fl" style="width:${v*100}%"></div></div><span class="v">${v.toFixed(2)}</span></div>`).join('')}
[1,2,3].forEach(i=>$('#ffx'+i).addEventListener('input',drawFF));segOn('#ffG',drawFF);
$('#ffNeg').addEventListener('click',()=>{[5,0,2].forEach((v,i)=>$('#ffx'+(i+1)).value=v);drawFF()});drawFF();

/* ---------- 6.5 embeddings: one-hot × E, pooling ---------- */
const EV=[['dessert',3,[0.8,0.1,0.3,-0.2]],['was',524,[0.1,0.0,-0.1,0.2]],['great',902,[0.2,0.9,0.1,0.4]],['terrible',871,[0.1,-0.8,0.2,0.3]],['not',588,[-0.1,-0.3,0.0,0.9]],['food',330,[0.7,0.2,0.4,-0.1]],['the',451,[0.0,0.1,0.0,0.1]]];
const EMap=Object.fromEntries(EV.map(e=>[e[0],e]));
let emS=['dessert','was','great'];
$('#emVocab').innerHTML=EV.map(e=>`<button class="chip" data-w="${e[0]}" style="border:0;cursor:pointer">${e[0]}<small>V${e[1]}</small></button>`).join('');
$$('#emVocab button').forEach(b=>b.addEventListener('click',()=>{if(emS.length<6){emS.push(b.dataset.w);drawEM()}}));
segOn('#emM',drawEM);$('#emSwap').addEventListener('click',()=>{emS.reverse();drawEM()});
const f2=v=>(v<0?'':' ')+v.toFixed(2);
function drawEM(){const m=segVal('#emM','m'),N=emS.length;
  $('#emSent').innerHTML=N?emS.map((w,i)=>`<button class="chip a" data-i="${i}" style="border:0;cursor:pointer">${w} ✕</button>`).join(''):'<span class="note">النص فارغ: أضف كلمات</span>';
  $$('#emSent button').forEach(b=>b.addEventListener('click',()=>{emS.splice(+b.dataset.i,1);drawEM()}));
  if(!N){$('#emTab').innerHTML='';$('#emCalc').textContent='';return}
  const rows=emS.map(w=>EMap[w][2]),d=4;let out;
  if(m==='mean')out=[0,1,2,3].map(k=>rows.reduce((s,r)=>s+r[k],0)/N);else if(m==='max')out=[0,1,2,3].map(k=>Math.max(...rows.map(r=>r[k])));else out=rows.flat();
  let h=`<tr><th>token</th><th>id</th><th>one-hot x (1×|V|)</th><th colspan="4">e = xE : row of E (1×d)</th></tr>`;
  emS.forEach(w=>{const e=EMap[w];h+=`<tr><td>${w}</td><td class="num">${e[1]}</td><td class="mono" style="font-size:12px">0 … 0 <b style="color:var(--amber)">1</b><sub>${e[1]}</sub> 0 … 0</td>${e[2].map(v=>`<td class="num">${f2(v)}</td>`).join('')}</tr>`});
  if(m!=='cat')h+=`<tr class="pool"><td colspan="3"><b>${m==='mean'?'mean-pool':'max-pool'} → x (1×${d})</b></td>${out.map(v=>`<td class="num"><b>${f2(v)}</b></td>`).join('')}</tr>`;
  $('#emTab').innerHTML=h;
  const shape=m==='cat'?`[1 × ${N*d}]`:`[1 × ${d}]`;
  $('#emCalc').textContent=`one-hot rows X: [${N} × |V|]   ×   E: [|V| × ${d}]   =   [${N} × ${d}]   (one row of E per token)\n`+
   (m==='mean'?`mean-pool: x_k = (1/${N}) Σ e_k  →  x = [${out.map(r3).join(', ')}]`:m==='max'?`max-pool: x_k = max over tokens of e_k  →  x = [${out.map(r3).join(', ')}]`:`concatenate: e = [${emS.map(w=>'e('+w+')').join(' ; ')}]\n  = [${out.map(r3).join(', ')}]`)+
   `\nclassifier input shape: ${shape}   → W must be [${m==='cat'?N*d:d} × d_h]`+(m==='cat'?'\n(the order matters: reversing the sentence changes e)':'\n(order does not matter: reversing the sentence gives the same x)')+
   `\n\n(ids follow the book for dessert/was/great/the; the other ids and all E values are made up, d = 4)`}
drawEM();

/* ---------- 6.6.1 cross-entropy ---------- */
const CEZ=[0.6,1.1,-1.5,1.2,3.2,-1.1],CEP=(()=>{const e=CEZ.map(Math.exp),S=e.reduce((a,b)=>a+b,0);return e.map(v=>v/S)})();let ceC=4;
$('#ceBtns').innerHTML=CEP.map((p,i)=>`<button class="btn${i===ceC?' pri':''}" data-i="${i}">c = ${i+1}  ·  ŷ = ${p<0.01?p.toFixed(4):p.toFixed(3)}</button>`).join('');
$$('#ceBtns button').forEach(b=>b.addEventListener('click',()=>{ceC=+b.dataset.i;$$('#ceBtns button').forEach(x=>x.classList.toggle('pri',x===b));drawCE()}));
function drawCE(){const p=CEP[ceC];$('#ceCalc').textContent=`y = [${CEP.map((_,i)=>i===ceC?1:0).join(', ')}]   (one-hot, correct class c = ${ceC+1})\nL = −Σ y_k log ŷ_k = −log ŷ_${ceC+1} = −log(${p.toPrecision(3)}) = ${r3(-Math.log(p))}`+(ceC===4?'   ← network is right and confident: small loss':p<0.02?'   ← network gave the right answer almost no probability: large loss':'')}
drawCE();

/* ---------- 6.6.3–4 computation graph ---------- */
let cgStage=0;
function cgVals(){const a=num($('#cga').value),b=num($('#cgb').value),c=num($('#cgc').value),d=2*b,e=a+d,L=c*e;
  return {a,b,c,d,e,L,gL:1,ge:c,gc:e,ga:c*1,gd:c*1,gb:c*1*2}}
function drawCG(){const v=cgVals(),fw=cgStage>=1,bk=cgStage-1;
  const N={a:[60,40,'a'],b:[60,130,'b'],c:[60,220,'c'],d:[210,130,'d = 2b'],e:[350,85,'e = a + d'],L:[490,160,'L = c·e']};
  const E=[['b','d','∂d/∂b = 2'],['a','e','∂e/∂a = 1'],['d','e','∂e/∂d = 1'],['e','L','∂L/∂e = c'],['c','L','∂L/∂c = e']];
  const gs={L:[0,'∂L/∂L = 1',v.gL],e:[1,'∂L/∂e',v.ge],c:[1,'∂L/∂c',v.gc],a:[2,'∂L/∂a',v.ga],d:[2,'∂L/∂d',v.gd],b:[3,'∂L/∂b',v.gb]};
  let s=`<svg class="map" viewBox="0 0 580 278" role="img" style="max-width:620px"><defs><marker id="cgA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--soft)"/></marker></defs>`;
  E.forEach(([p,q,lab])=>{const [x1,y1]=N[p],[x2,y2]=N[q],dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy),r1=p.length>1?30:22,r2=44;
    const sx=x1+dx/l*22,sy=y1+dy/l*22,ex=x2-dx/l*r2,ey=y2-dy/l*(q==='L'?26:24);
    s+=`<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="var(--soft)" stroke-width="1.5" marker-end="url(#cgA)"/>`;
    if(bk>=gs[q][0]+1)s+=`<text x="${sx+(ex-sx)*0.42}" y="${sy+(ey-sy)*0.42-7}" font-size="10.5" text-anchor="middle" fill="var(--math)" font-family="Noto Sans Mono">${lab}</text>`});
  Object.entries(N).forEach(([k,[x,y,lab]])=>{const inp='abc'.includes(k),w=inp?22:46;
    s+=inp?`<circle cx="${x}" cy="${y}" r="22" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>`:`<rect x="${x-w}" y="${y-22}" width="${2*w}" height="44" rx="10" fill="var(--math-soft)" stroke="var(--math)" stroke-width="1.5"/>`;
    s+=`<text x="${x}" y="${y+(fw?-3:4)}" font-size="12" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans Mono">${lab}</text>`;
    if(fw)s+=`<text x="${x}" y="${y+13}" font-size="12" text-anchor="middle" fill="var(--green)" font-family="Noto Sans Mono" font-weight="600">${k==='a'||k==='b'||k==='c'?'':k+'='}${r3(v[k])}</text>`;
    const g=gs[k];if(bk>=g[0])s+=`<text x="${x}" y="${y+40}" font-size="12" text-anchor="middle" fill="var(--rose)" font-family="Noto Sans Mono" font-weight="600">${g[1].split(' =')[0]} = ${r3(g[2])}</text>`});
  $('#cgSvg').innerHTML=s+'</svg>';
  const lines=[];
  if(fw)lines.push(`forward:  d = 2·${r3(v.b)} = ${r3(v.d)}    e = ${r3(v.a)} + ${r3(v.d)} = ${r3(v.e)}    L = ${r3(v.c)}·${r3(v.e)} = ${r3(v.L)}`);else lines.push('press “forward pass”');
  if(bk>=0)lines.push(`backward step 1 (node L): start with ∂L/∂L = 1`);
  if(bk>=1)lines.push(`backward step 2 (node L = c·e):  ∂L/∂e = c = ${r3(v.ge)}     ∂L/∂c = e = ${r3(v.gc)}`);
  if(bk>=2)lines.push(`backward step 3 (node e = a+d): downstream = upstream × local\n   ∂L/∂a = ∂L/∂e · ∂e/∂a = ${r3(v.ge)} × 1 = ${r3(v.ga)}     ∂L/∂d = ∂L/∂e · ∂e/∂d = ${r3(v.ge)} × 1 = ${r3(v.gd)}`);
  if(bk>=3){const eps=0.001,L2=(a,b,c)=>c*(a+2*b);
    lines.push(`backward step 4 (node d = 2b):  ∂L/∂b = ∂L/∂d · ∂d/∂b = ${r3(v.gd)} × 2 = ${r3(v.gb)}`);
    lines.push(`\ncheck by nudging each input by ${eps}:\n   a: (L(a+ε) − L)/ε = ${r3((L2(v.a+eps,v.b,v.c)-v.L)/eps)}   b: ${r3((L2(v.a,v.b+eps,v.c)-v.L)/eps)}   c: ${r3((L2(v.a,v.b,v.c+eps)-v.L)/eps)}  ✓`)}
  $('#cgCalc').textContent=lines.join('\n');
  $('#cgB').disabled=cgStage<1||cgStage>=5}
$('#cgF').addEventListener('click',()=>{cgStage=Math.max(cgStage,1);drawCG()});
$('#cgB').addEventListener('click',()=>{if(cgStage>=1&&cgStage<5)cgStage++;drawCG()});
$('#cgR').addEventListener('click',()=>{cgStage=0;drawCG()});
['#cga','#cgb','#cgc'].forEach(s=>$(s).addEventListener('input',drawCG));drawCG();

/* ---------- 6.6.5 train a network on XOR with backprop ---------- */
const TY=[0,1,1,0];
const T={H:3,g:'tanh',W:null,b:null,U:null,c:0,steps:0,hist:[],seed:1,zero:false,run:false};
function trInit(zero){const R=rng(T.seed*7919+T.H*31),H=T.H,u=()=>zero?0:(R()*2-1);T.zero=!!zero;
  T.W=Array.from({length:H},()=>[u(),u()]);T.b=Array.from({length:H},()=>zero?0:u()*0.5);T.U=Array.from({length:H},()=>u());T.c=0;T.steps=0;T.hist=[[0,trLoss()]]}
function trFwd(x){const A=ACT[T.g],z=T.W.map((w,j)=>w[0]*x[0]+w[1]*x[1]+T.b[j]),h=z.map(A.f),o=h.reduce((s,v,j)=>s+v*T.U[j],0)+T.c;return {z,h,o,p:sig(o)}}
function trLoss(){return XS.reduce((s,x,i)=>{const p=trFwd(x).p;return s-(TY[i]*Math.log(p+1e-12)+(1-TY[i])*Math.log(1-p+1e-12))},0)/4}
function trStep(n){const A=ACT[T.g],eta=+$('#trE').value,H=T.H;
  for(let s=0;s<n;s++){const gW=T.W.map(()=>[0,0]),gb=Array(H).fill(0),gU=Array(H).fill(0);let gc=0;
    XS.forEach((x,i)=>{const f=trFwd(x),dz2=(f.p-TY[i])/4; /* ∂L/∂z[2] = a[2] − y */
      gc+=dz2;for(let j=0;j<H;j++){gU[j]+=dz2*f.h[j];const dz1=dz2*T.U[j]*A.d(f.z[j]);gW[j][0]+=dz1*x[0];gW[j][1]+=dz1*x[1];gb[j]+=dz1}});
    for(let j=0;j<H;j++){T.W[j][0]-=eta*gW[j][0];T.W[j][1]-=eta*gW[j][1];T.b[j]-=eta*gb[j];T.U[j]-=eta*gU[j]}T.c-=eta*gc;T.steps++;
    if(T.steps%10===0)T.hist.push([T.steps,trLoss()])}}
function drawTR(){$('#trEo').textContent=(+$('#trE').value).toFixed(2);
  plane($('#trMap'),{lo:-0.25,hi:1.25,ticks:[0,1],xl:'x₁',yl:'x₂',n:30,field:(u,v)=>{const p=trFwd([u,v]).p;return {c:p>0.5?'var(--green)':'var(--rose)',o:Math.min(.75,Math.abs(p-.5)*1.5+.04)}},
    pts:XS.map((x,i)=>{const p=trFwd(x).p;return {x:x[0],y:x[1],on:TY[i]===1,bad:(p>0.5?1:0)!==TY[i]}})});
  const L=trLoss(),mx=Math.max(T.steps,200);
  plot($('#trLoss'),{W:340,H:240,xmin:0,xmax:mx,ymin:0,ymax:0.8,yt:[0,.2,.4,.6,.8],xt:[0,Math.round(mx/2),mx],xl:'step',lines:[{pts:T.hist,c:'var(--amber)'}],curves:[{f:()=>Math.log(2),c:'var(--soft)',w:1,dash:1}]});
  const ok=XS.filter((x,i)=>(trFwd(x).p>0.5?1:0)===TY[i]).length;
  $('#trCalc').textContent=`step ${T.steps}   loss L = ${L.toFixed(4)}   correct ${ok}/4${T.zero?'   (started from all zeros)':''}\n\n  x     | hidden h = ${ACT[T.g].n}(Wx+b)${' '.repeat(Math.max(0,T.H*7-18))}| ŷ = σ(Uh+c) | y\n`+
    XS.map((x,i)=>{const f=trFwd(x);return ` [${x}] | [${f.h.map(v=>(v<0?'':' ')+v.toFixed(2)).join(' ')}] |    ${f.p.toFixed(3)}    | ${TY[i]}`}).join('\n')+
    `\n\ndashed grey line on the loss plot: ln 2 = 0.693, the loss of always answering 0.5`+(T.zero&&T.steps>0?'\nall hidden units stay identical (look at the h columns): symmetry is never broken':'')}
function trLoop(){if(!T.run)return;trStep(25);drawTR();if(T.steps>=4000||trLoss()<0.005){T.run=false;$('#trRun').textContent='درّب';return}requestAnimationFrame(trLoop)}
$('#trRun').addEventListener('click',()=>{T.run=!T.run;$('#trRun').textContent=T.run?'أوقف':'درّب';if(T.run)trLoop()});
$('#trStep').addEventListener('click',()=>{trStep(10);drawTR()});
$('#trRand').addEventListener('click',()=>{T.seed++;trInit(false);drawTR()});
$('#trZero').addEventListener('click',()=>{trInit(true);drawTR()});
segOn('#trH',b=>{T.H=+b.dataset.h;trInit(false);drawTR()});
segOn('#trG',b=>{T.g=b.dataset.g;trInit(false);drawTR()});
$('#trE').addEventListener('input',drawTR);
trInit(false);drawTR();

/* redraw on theme change is not needed: all colours are CSS variables */

/* ---------- glossary ---------- */
const GL=[['وحدة عصبية','unit','مجموع موزون + انحياز، ثم دالة تنشيط.'],['الانحياز','bias term','رقم يُضاف للمجموع؛ وزنٌ لمدخل ثابت قيمته ١.'],['دالة التنشيط / التنشيط','activation function / activation','دالة غير خطية f، وناتجها a = f(z).'],['tanh','tanh','مثل السيغمويد لكن من −١ إلى ١.'],['ReLU','rectified linear unit','max(z, 0).'],['التشبّع','saturation','ناتج قريب من حده الأقصى ومشتقة قريبة من الصفر.'],['تلاشي التدرّج','vanishing gradient','ضرب مشتقات صغيرة عبر الطبقات حتى تضيع إشارة الخطأ.'],['البيرسبترون','perceptron','وحدة ناتجها ٠ أو ١ بدالة الدرجة.'],['حد القرار','decision boundary','الخط (أو المستوي الفائق) الفاصل بين الصنفين.'],['قابل للفصل خطياً','linearly separable','يمكن فصل صنفيه بخط مستقيم.'],['XOR','exclusive or','صحيح إذا كان أحد المدخلين فقط صحيحاً.'],['الطبقة المخفية','hidden layer','طبقة بين المدخل والمخرج تصنع تمثيلاً جديداً.'],['شبكة أمامية','feedforward network','طبقات متصلة بلا حلقات.'],['متصلة كلياً','fully-connected','كل وحدة متصلة بكل وحدات الطبقة السابقة.'],['MLP','multi-layer perceptron','اسم تاريخي غير دقيق للشبكة الأمامية.'],['مصفوفة الأوزان','weight matrix','أوزان الطبقة كلها؛ الصف j أوزان الوحدة j.'],['عنصراً بعنصر','element-wise','تطبيق الدالة على كل خانة في المتجه وحدها.'],['اللوجِتات','logits','القيم الأخيرة قبل السوفتماكس.'],['التعلّم العميق','deep learning','استخدام شبكات ذات طبقات كثيرة.'],['تعلّم التمثيل','representation learning','تعلّم الخصائص تلقائياً بدل تصميمها.'],['التوجيه','vectorizing','حساب أمثلة كثيرة دفعة واحدة بضرب المصفوفات.'],['المنقول','transpose ᵀ','قلب الصفوف أعمدة.'],['مصفوفة التضمين','embedding matrix E','[|V| × d]: صف تضمين لكل كلمة.'],['أحادي الواحد','one-hot vector','أصفار إلا خانة واحدة فيها ١.'],['الدمج','pooling','تحويل N تضميناً إلى تضمين واحد.'],['دمج المتوسط / الأقصى','mean / max pooling','المتوسط / الأكبر لكل بُعد.'],['اللصق','concatenation [a ; b]','وضع المتجهات متتابعة في متجه طويل.'],['نموذج لغوي عصبي أمامي','feedforward neural LM','يتنبأ بالكلمة التالية من تضمينات الكلمات السابقة الملصقة.'],['خسارة سالب لوغاريتم الأرجحية','negative log likelihood','−log احتمال الصنف الصحيح.'],['الانتشار العكسي','error backpropagation','حساب تدرّجات كل الأوزان من آخر الشبكة إلى أولها.'],['مخطط الحساب','computation graph','الحساب مقسّماً إلى عمليات، كل عملية عقدة.'],['التمرير الأمامي / العكسي','forward / backward pass','حساب القيم من اليسار / المشتقات من اليمين.'],['قاعدة السلسلة','chain rule','مشتقة الدالة المركبة = حاصل ضرب المشتقات.'],['تدرّج قادم / محلي / نازل','upstream / local / downstream gradient','النازل = القادم × المحلي.'],['غير محدّب','non-convex','دالة لها قيعان كثيرة.'],['الإسقاط','dropout','تصفير مخرجات وحدات عشوائياً أثناء التدريب.'],['معامل فائق','hyperparameter','يختاره المصمم ويُضبط على مجموعة التطوير.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
