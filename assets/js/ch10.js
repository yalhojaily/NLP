/* Chapter 10 · Interpretability — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const r2=v=>{const x=+(+v).toFixed(2);return (Object.is(x,-0)?0:x).toFixed(2)};
const sig=z=>1/(1+Math.exp(-z));
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function gauss(R){const u=Math.max(R(),1e-12),v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>Math.sqrt(dot(a,a)),cos=(a,b)=>dot(a,b)/(norm(a)*norm(b)||1);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s10-1','10.1','التضمينات السياقية'],['s10-2','10.2','المجسّات'],['s10-3','10.3','عدسة اللوجِت'],['s10-4','10.4–5','أقسام فارغة'],['s10-6','10.6','رؤوس الاستقراء'],['ex','','الخلاصة']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

function plot(el,o){
  const W=o.W||560,H=o.H||220,L=46,R=14,T=14,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img"><defs><clipPath id="c${el.id}"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs>`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${v}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">${o.xl}</text>`;if(o.yl)s+=`<text x="${L}" y="${T-3}">${o.yl}</text>`;
  (o.vbars||[]).forEach(b=>{s+=`<rect x="${x(b.x)-b.w/2}" y="${y(Math.max(0,b.y))}" width="${b.w}" height="${Math.abs(y(b.y)-y(0))}" fill="${b.c}" rx="1"/>`});
  (o.lines||[]).forEach(p=>{s+=`<path d="${p.pts.map((q,i)=>(i?'L':'M')+x(q[0]).toFixed(1)+' '+y(q[1]).toFixed(1)).join('')}" fill="none" stroke="${p.c}" stroke-width="2.4" ${p.dash?'stroke-dasharray="5 4"':''} clip-path="url(#c${el.id})"/>`+p.pts.map(q=>`<circle cx="${x(q[0])}" cy="${y(q[1])}" r="3" fill="${p.c}"/>`).join('')+(p.t?`<text x="${x(p.pts[p.pts.length-1][0])-4}" y="${y(p.pts[p.pts.length-1][1])-8}" text-anchor="end" style="fill:${p.c}">${p.t}</text>`:'')});
  el.innerHTML=s+'</svg>';
}

/* ---------- 10.1.1 WSD nearest centroid ---------- */
const WS={'bank¹ (money)':[[0.9,0.3],[1.0,0.4],[0.8,0.2],[0.95,0.15]],'bank² (river)':[[0.3,0.9],[0.4,1.0],[0.2,0.8],[0.35,0.85]]};
const WSC={'bank¹ (money)':'var(--amber)','bank² (river)':'var(--green)'};
const WT=[['I deposited my salary at the bank.',[0.85,0.35]],['We had a picnic on the bank of the Nile.',[0.3,0.95]],['The bank raised its interest rates.',[0.92,0.25]],['We sat by the bank and counted our money.',[0.62,0.6]]];let wsI=0;
$('#wsBtns').innerHTML=WT.map((t,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}" dir="ltr" style="margin:2px;font-size:13px">${esc(t[0])}</button>`).join('');
$$('#wsBtns button').forEach(b=>b.addEventListener('click',()=>{wsI=+b.dataset.i;$$('#wsBtns button').forEach(x=>x.classList.toggle('pri',x===b));drawWS()}));
function drawWS(){const t=WT[wsI][1],S=260,P=28,X=v=>P+v*(S-2*P)/1.1,Y=v=>S-P-v*(S-2*P)/1.1;
  const cen=Object.fromEntries(Object.entries(WS).map(([k,pts])=>[k,[0,1].map(d=>pts.reduce((s,p)=>s+p[d],0)/pts.length)]));
  const cs=Object.fromEntries(Object.entries(cen).map(([k,c])=>[k,cos(t,c)])),best=Object.keys(cs).sort((a,b)=>cs[b]-cs[a])[0];
  let s=`<svg class="map" viewBox="0 0 ${S} ${S}" role="img" style="max-width:300px"><rect x="${P}" y="${P}" width="${S-2*P}" height="${S-2*P}" fill="none" stroke="var(--rule)"/>`;
  Object.entries(WS).forEach(([k,pts])=>pts.forEach(p=>{s+=`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="4" fill="${WSC[k]}" opacity=".55"/>`}));
  Object.entries(cen).forEach(([k,c])=>{s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(c[0])}" y2="${Y(c[1])}" stroke="${WSC[k]}" stroke-width="${k===best?2.5:1.2}" stroke-dasharray="${k===best?'':'4 3'}"/><rect x="${X(c[0])-6}" y="${Y(c[1])-6}" width="12" height="12" fill="${WSC[k]}"/><text x="${X(c[0])+(c[0]>c[1]?-8:9)}" y="${Y(c[1])+(c[0]>c[1]?18:-8)}" font-size="11" text-anchor="${c[0]>c[1]?'end':'start'}" fill="${WSC[k]}" font-family="Noto Sans">v(${k.split(' ')[0]})</text>`});
  s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(t[0])}" y2="${Y(t[1])}" stroke="var(--ink)" stroke-width="2"/><circle cx="${X(t[0])}" cy="${Y(t[1])}" r="7" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5"/><text x="${X(t[0])+10}" y="${Y(t[1])+4}" font-size="12" fill="var(--ink)" font-family="Noto Sans Mono">t</text></svg>`;
  $('#wsPlot').innerHTML=s;
  $('#wsCalc').textContent=`v_s = mean of the training embeddings of sense s (Eq. 10.1)\n`+Object.entries(cen).map(([k,c])=>`  v(${k}) = [${c.map(r2).join(', ')}]`).join('\n')+`\n\ntest token t = [${t.map(r2).join(', ')}]\n`+Object.entries(cs).map(([k,c])=>`  cos(t, v(${k.split(' ')[0]})) = ${r2(c)}`).join('\n')+`\nsense(t) = argmax → ${best}`+(Math.abs(Object.values(cs)[0]-Object.values(cs)[1])<0.03?'\n(almost a tie: this sentence mixes money and a river)':'')+`\n\n(2-D vectors are made up; real ones have 768 dims)`}
drawWS();

/* ---------- 10.1.2 anisotropy ---------- */
function drawAN(){const off=+$('#anO').value,rog=+$('#anR').value;$('#anOo').textContent=off.toFixed(1);$('#anRo').textContent=rog;
  const R=rng(11),d=16,n=200,u=Array.from({length:d},()=>gauss(R)),un=norm(u),dir=u.map(v=>v/un);
  const X=Array.from({length:n},()=>Array.from({length:d},(_,k)=>off*dir[k]+gauss(R)+(k===0?rog*(1+0.5*gauss(R)):0)));
  const mu=Array.from({length:d},(_,k)=>X.reduce((s,x)=>s+x[k],0)/n),sd=Array.from({length:d},(_,k)=>Math.sqrt(X.reduce((s,x)=>s+(x[k]-mu[k])**2,0)/n)),Z=X.map(x=>x.map((v,k)=>(v-mu[k])/(sd[k]||1)));
  const P=Array.from({length:400},()=>[Math.floor(R()*n),Math.floor(R()*n)]).filter(([a,b])=>a!==b),ca=P.map(([a,b])=>cos(X[a],X[b])),cb=P.map(([a,b])=>cos(Z[a],Z[b]));
  const hist=arr=>{const h=Array(20).fill(0);arr.forEach(v=>h[Math.min(19,Math.floor((v+1)*10))]++);return h.map((c,i)=>({x:-0.95+i*0.1,y:c/arr.length,w:12,c:'var(--green)'}))};
  const o={W:300,H:180,xmin:-1,xmax:1,ymin:0,ymax:0.6,xt:[-1,0,1],yt:[0,.3,.6]};
  plot($('#anA'),{...o,vbars:hist(ca).map(b=>({...b,c:'var(--amber)'}))});plot($('#anB'),{...o,vbars:hist(cb)});
  const m=a=>a.reduce((s,v)=>s+v,0)/a.length;
  $('#anCalc').textContent=`anisotropy = expected cosine between random pairs (Ethayarajh 2019)\nbefore: mean cos = ${r2(m(ca))}      after z-scoring: mean cos = ${r2(m(cb))}\ndimension 0 (the rogue one): mean ${r2(mu[0])}, std ${r2(sd[0])}   other dims: std ≈ ${r2(m(sd.slice(1)))}`+(m(ca)>0.6?'\n→ almost every pair looks “similar”: raw cosine is useless here':'')+`\n(synthetic vectors: noise + a shared direction + one rogue dimension)`}
['#anO','#anR'].forEach(s=>$(s).addEventListener('input',drawAN));drawAN();

/* ---------- 10.2 probing (synthetic) ---------- */
const PRP=[['part of speech',3,'var(--green)'],['semantic role',7,'var(--amber)'],['coreference',10,'var(--rose)']];
function makeSet(R,sep,dir,n,randLab){const X=[],Y=[];for(let i=0;i<n;i++){const y=R()<0.5?1:0;const x=dir.map(v=>v*(y?sep/2:-sep/2)+gauss(R));X.push(x);Y.push(randLab?(R()<0.5?1:0):y)}return {X,Y}}
function trainProbe(tr){const d=tr.X[0].length;let w=Array(d).fill(0),b=0;for(let it=0;it<150;it++){const gw=Array(d).fill(0);let gb=0;tr.X.forEach((x,i)=>{const e=sig(dot(w,x)+b)-tr.Y[i];x.forEach((v,k)=>gw[k]+=e*v);gb+=e});w=w.map((v,k)=>v-0.5*gw[k]/tr.X.length);b-=0.5*gb/tr.X.length}return {w,b}}
const acc=(m,te)=>te.X.filter((x,i)=>((sig(dot(m.w,x)+m.b)>0.5)?1:0)===te.Y[i]).length/te.X.length;
let prSeed=1;
function runPR(){const R=rng(prSeed*7+3),d=8,res=[];
  PRP.forEach(([n,peak,c])=>{const u=Array.from({length:d},()=>gauss(R)),un=norm(u),dir=u.map(v=>v/un),pts=[];
    for(let l=1;l<=12;l++){const sep=0.4+3.2*Math.exp(-((l-peak)**2)/6),tr=makeSet(R,sep,dir,160),te=makeSet(R,sep,dir,160);pts.push([l,acc(trainProbe(tr),te)])}res.push({t:n,c,pts})});
  if($('#prCtl').checked){const u=Array.from({length:d},()=>gauss(R)),un=norm(u),dir=u.map(v=>v/un),pts=[];for(let l=1;l<=12;l++){const tr=makeSet(R,3.6,dir,160,1),te=makeSet(R,3.6,dir,160,1);pts.push([l,acc(trainProbe(tr),te)])}res.push({t:'control (random labels)',c:'var(--soft)',pts,dash:1})}
  plot($('#prPlot'),{W:560,H:230,xmin:0.5,xmax:12.5,ymin:0.3,ymax:1,xt:[1,3,5,7,9,11],yt:[0.4,0.6,0.8,1],xl:'layer',yl:'probe accuracy',lines:res.map(r=>({...r,t:null}))});
  $('#prCalc').textContent=res.map(r=>{const bst=r.pts.reduce((a,b)=>b[1]>a[1]?b:a);return `${r.t.padEnd(24)} best layer ${String(bst[0]).padStart(2)}  accuracy ${r2(bst[1])}`}).join('\n')+`\n(colours: green = part of speech, amber = semantic role, rose = coreference, grey dashed = control)\nsynthetic data shaped after the pattern reported by Tenney et al. (2019): grammar low, semantics middle, discourse high`;prSeed++}
$('#prRun').addEventListener('click',runPR);$('#prCtl').addEventListener('change',runPR);runPR();

/* ---------- 10.3 logit lens (Fig. 10.6 data) ---------- */
const LAY=['L42','L50','L58','L67','L75','L83','L92','L100'];
const LL=[{q:'The color of the planet fourth from the sun is',j:['color','color','Mars','color','red','red','red','red'],g:['valea','general','Mars','Mars','red','red','rust','red'],
  m:[0,0,1,2,3,3,4,4],n:['the J-lens already sees the idea of “color”, the logit lens shows noise','Mars appears: the model resolves “the fourth planet from the sun”','back to the property being asked: color','the answer “red” appears in both lenses','the answer stays stable to the last layer']},
 {q:'“小” 的反义词是“  (= The opposite of “small” is “)',j:['“','Chinese','opposite','bigger','big','big','大','大'],g:['interc','anie','opposite','oppos','large','больш','大','大'],
  m:[0,1,2,3,3,4,4,4],n:['early layers: little to read','the J-lens notices the language: Chinese','both lenses encode the concept “opposite”','the answer appears in English first (bigger, big / large)','then Russian (больш), and finally the correct Chinese 大 (= big)']}];
const LLN=(p,i)=>LL[p].n[LL[p].m[i]];
function drawLL(){const p=+segVal('#llP','p'),i=+$('#llL').value,D=LL[p];$('#llLo').textContent=LAY[i];
  $('#llQ').textContent=D.q;
  $('#llTab').innerHTML='<tr><th>layer</th><th>J-lens</th><th>Logit lens</th></tr>'+LAY.map((l,k)=>({l,k})).reverse().map(({l,k})=>`<tr style="${k>i?'opacity:.18':''}${k===i?';background:var(--amber-soft)':''}"><td class="mono">${l}</td><td><b>${esc(D.j[k])}</b></td><td>${esc(D.g[k])}</td></tr>`).join('');
  $('#llCalc').textContent=`${LAY[i]}: ${LLN(p,i)}\n(the words are exactly those of Figure 10.6, Claude Sonnet 4.5, from Gurnee et al. 2026)`}
segOn('#llP',drawLL);$('#llL').addEventListener('input',drawLL);drawLL();

/* ---------- 10.6 induction head ---------- */
function drawIH(){const T=$('#ihIn').value.trim().split(/\s+/).filter(Boolean);if(!T.length){$('#ihTxt').innerHTML='';$('#ihCalc').textContent='';return}
  const n=T.length,A=T[n-1];let j=-1;for(let k=n-2;k>=0;k--)if(T[k].toLowerCase()===A.toLowerCase()&&k+1<n-1){j=k;break}
  $('#ihTxt').innerHTML=T.map((t,k)=>{let st='padding:2px 5px;border-radius:5px;margin:1px;display:inline-block;';if(k===n-1)st+='background:var(--amber-soft);color:var(--amber);font-weight:600';else if(k===j)st+='outline:2px solid var(--amber)';else if(j>=0&&k===j+1)st+='background:var(--green);color:var(--paper);font-weight:600';return `<span style="${st}">${esc(t)}</span>`}).join(' ')+(j>=0?` <span style="padding:2px 6px;border:2px dashed var(--green);border-radius:5px;color:var(--green);font-weight:600">${esc(T[j+1])}?</span>`:'');
  $('#ihCalc').textContent=j>=0?`current token A = “${A}” (position ${n})\n1. prefix matching: attend back to the earlier “${T[j]}” at position ${j+1}\n2. copying: the token after it was B = “${T[j+1]}” → raise P(“${T[j+1]}”) as the next token\nrule AB … A → B:  ${T[j]} ${T[j+1]} … ${A} → ${T[j+1]}`:`“${A}” never appeared earlier (with a token after it): an induction head has nothing to copy here.\nTry ending the text with a word that occurred before.`}
$('#ihIn').addEventListener('input',drawIH);drawIH();

/* ---------- glossary ---------- */
const GL=[['قابلية التفسير','interpretability','فهم كيف تعمل النماذج من الداخل.'],['التفسير الآلي','mechanistic interpretability','البحث عن تمثيلات ودوائر محددة داخل النموذج.'],['دائرة','circuit','مكوّن مجرد في الشبكة يؤدي وظيفة.'],['التضمين السياقي','contextual embedding','متجه لمثيل الكلمة في سياقه.'],['متعدد المعاني','polysemous','كلمة لها أكثر من معنى.'],['المعنى','word sense','تمثيل منفصل لجانب من معنى الكلمة.'],['WordNet','WordNet','مكنز يسرد معاني الكلمات.'],['توضيح معنى الكلمة','word sense disambiguation (WSD)','اختيار المعنى الصحيح في السياق.'],['معنى واحد لكل خطاب','one sense per discourse','الكلمة تحافظ على معناها غالباً في الخطاب.'],['عدم توحّد الاتجاه','anisotropy','المتجهات كلها تتجه اتجاهاً واحداً تقريباً.'],['أبعاد مارقة','rogue dimensions','أبعاد ضخمة القيمة والتباين تهيمن على جيب التمام.'],['التقييس','standardization (z-scoring)','(x − μ)/σ لكل بُعد.'],['المجس','probe','مصنّف صغير يكشف معلومة في تمثيل داخلي.'],['التنشيطات','activations','القيم الداخلية للنموذج على مدخل.'],['الشرط الضابط','control condition','مقارنة كالمجس على وسوم عشوائية.'],['عدسة اللوجِت','logit lens','قراءة طبقة وسطى بمصفوفة فك التضمين.'],['عدسة جاكوبي','J-lens','قراءة طبقة وسطى عبر مشتقات بقية الشبكة.'],['اليعقوبي','Jacobian','مصفوفة مشتقات متجه بالنسبة لمتجه.'],['التعلم في السياق','in-context learning','التعلم من الموجِّه دون تحديث الأوزان.'],['رأس الاستقراء','induction head','دائرة انتباه تطبّق AB … A → B.'],['مطابقة البادئة','prefix matching','البحث عن ظهور سابق للرمز الحالي.'],['الاستئصال','ablation','تعطيل مكوّن لاختبار أثره السببي.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
