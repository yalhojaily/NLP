/* Chapter 7 · Transformers and Pretraining — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sig=z=>1/(1+Math.exp(-z));
const r3=v=>{const x=+(+v).toFixed(3);return (Object.is(x,-0)?0:x).toString()};
const r2=v=>{const x=+(+v).toFixed(2);return (Object.is(x,-0)?0:x).toFixed(2)};
const num=s=>{const v=parseFloat(String(s).replace('−','-'));return isNaN(v)?NaN:v};
const fmtN=n=>Math.round(n).toLocaleString('en-US');
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function gauss(R){const u=Math.max(R(),1e-12),v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const vm=(x,M)=>M[0].map((_,c)=>x.reduce((s,v,r)=>s+v*M[r][c],0)); /* row vector × matrix */
const softmax=z=>{const m=Math.max(...z.filter(isFinite)),e=z.map(v=>v===-Infinity?0:Math.exp(v-m)),S=e.reduce((a,b)=>a+b,0);return e.map(v=>v/S)};
const vec=a=>'['+a.map(r2).join(', ')+']';
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function bars(el,items){const mx=Math.max(...items.map(i=>i.v),1e-9);el.innerHTML=items.map(i=>`<div class="br${i.pick?' pick':''}"${i.dim?' style="opacity:.4"':''}><span class="w0">${esc(i.l)}</span><div class="tr"><div class="fl" style="width:${(i.scale==='abs'?i.v:i.v/mx)*100}%"></div></div><span class="v">${i.t??i.v.toFixed(2)}</span></div>`).join('')}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s7-1','7.1','الانتباه'],['s7-2','7.2','كتلة المحوّل'],['s7-3','7.3','الحساب المتوازي والقناع'],['s7-4','7.4','تضمين الرمز والموضع'],['s7-5','7.5','رأس النمذجة اللغوية'],['s7-6','7.6','فك الترميز'],['s7-7','7.7','التدريب المسبق والحيرة'],['s7-8','7.8','النماذج الحالية'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* generic line plot */
function plot(el,o){
  const W=o.W||560,H=o.H||220,L=46,R=14,T=14,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img"><defs><clipPath id="c${el.id}"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs>`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${v}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">${o.xl}</text>`;if(o.yl)s+=`<text x="${L}" y="${T-3}">${o.yl}</text>`;
  (o.curves||[]).forEach(c=>{let d='';const n=300;for(let i=0;i<=n;i++){const v=o.xmin+(o.xmax-o.xmin)*i/n,u=c.f(v);if(!isFinite(u))continue;d+=(d?'L':'M')+x(v).toFixed(1)+' '+y(u).toFixed(1)}
    s+=`<path d="${d}" fill="none" stroke="${c.c}" stroke-width="${c.w||2.5}" ${c.dash?'stroke-dasharray="5 4"':''} clip-path="url(#c${el.id})"/>`});
  (o.vbars||[]).forEach(b=>{s+=`<rect x="${x(b.x)-b.w/2}" y="${y(Math.max(0,b.y))}" width="${b.w}" height="${Math.abs(y(b.y)-y(0))}" fill="${b.c}" rx="1"/>`});
  (o.pts||[]).forEach(p=>{s+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||5}" fill="${p.c}"/>${p.t?`<text x="${x(p.x)+8}" y="${y(p.y)-8}" style="fill:${p.c}">${p.t}</text>`:''}`});
  el.innerHTML=s+'</svg>';
}

/* ---------- toy tokens (illustrative) ---------- */
const TOK=['The','chicken','crossed','road','it'];
const X=[[0.1,0.2,0.0],[1.0,0.2,0.6],[0.1,1.0,0.0],[0.9,0.0,0.8],[0.8,0.1,0.7]];
const WQ=[[1.0,0.2],[0.1,1.0],[0.8,-0.2]],WK=[[0.9,0.0],[0.0,1.0],[0.9,0.1]],WV=[[0.5,1.0],[1.0,0.0],[0.2,0.6]],WO=[[1,0,0.5],[0,1,0.5]];
const DK=2,Q=X.map(x=>vm(x,WQ)),K=X.map(x=>vm(x,WK)),V=X.map(x=>vm(x,WV));

/* ---------- 7.1 simplified attention ---------- */
let saI=4;
$('#saBtns').innerHTML=TOK.map((t,i)=>`<button class="btn${i===saI?' pri':''}" data-i="${i}">${AR(i+1)} · ${t}</button>`).join('');
$$('#saBtns button').forEach(b=>b.addEventListener('click',()=>{saI=+b.dataset.i;$$('#saBtns button').forEach(x=>x.classList.toggle('pri',x===b));drawSA()}));
function drawSA(){const i=saI,js=[...Array(i+1).keys()],sc=js.map(j=>dot(X[i],X[j])),al=softmax(sc),a=[0,1,2].map(k=>js.reduce((s,j,n)=>s+al[n]*X[j][k],0));
  bars($('#saBars'),TOK.map((t,j)=>j<=i?{l:t,v:al[j],pick:al[j]===Math.max(...al)}:{l:t,v:0,dim:1,t:'—'}));
  $('#saCalc').textContent=`x vectors (made up, d = 3):  `+TOK.map((t,j)=>`${t} ${vec(X[j])}`).join('  ')+
   `\n\ncurrent token i = ${i+1} (“${TOK[i]}”), looks at j ≤ ${i+1} only\nscores  x_i·x_j = [${sc.map(r2).join(', ')}]\nα = softmax(scores) = [${al.map(r2).join(', ')}]   (sum ${r2(al.reduce((a,b)=>a+b,0))})\n`+
   `a_i = Σ α_ij x_j = ${js.map((j,n)=>`${r2(al[n])}·${TOK[j]}`).join(' + ')}\n    = ${vec(a)}`}
drawSA();

/* ---------- √dk demo ---------- */
let skSeed=3;
function drawSK(){const dk=2**(+$('#skD').value);$('#skDo').textContent=dk;const R=rng(skSeed*101+7);
  const q=Array.from({length:dk},()=>gauss(R)),ks=Array.from({length:8},()=>Array.from({length:dk},()=>gauss(R)));
  const s=ks.map(k=>dot(q,k)),a=softmax(s),b=softmax(s.map(v=>v/Math.sqrt(dk)));
  bars($('#skA'),a.map((v,i)=>({l:'k'+(i+1),v,scale:'abs',pick:v===Math.max(...a)})));bars($('#skB'),b.map((v,i)=>({l:'k'+(i+1),v,scale:'abs',pick:v===Math.max(...b)})));
  const sd=Math.sqrt(s.reduce((t,v)=>t+v*v,0)/s.length);
  $('#skCalc').textContent=`d_k = ${dk}   √d_k = ${r2(Math.sqrt(dk))}\nq·k = [${s.map(v=>v.toFixed(1)).join(', ')}]\nspread of q·k ≈ ${sd.toFixed(1)}   (theory: about √d_k = ${r2(Math.sqrt(dk))})\nlargest weight: without scaling ${r2(Math.max(...a))}   with ÷√d_k ${r2(Math.max(...b))}`}
$('#skD').addEventListener('input',drawSK);$('#skNew').addEventListener('click',()=>{skSeed++;drawSK()});drawSK();

/* ---------- full head, 8 steps ---------- */
let qkI=4,qkS=8;
const QKSTEP=['١ المتجهات','٢ قارن','٣ اقسم','٤ سوفتماكس','٥ زِن','٦ اجمع','٧ أعد التشكيل','٨ المخرج'];
$('#qkBtns').innerHTML=TOK.map((t,i)=>`<button class="btn${i===qkI?' pri':''}" data-i="${i}">a${i+1} · ${t}</button>`).join('');
$$('#qkBtns button').forEach(b=>b.addEventListener('click',()=>{qkI=+b.dataset.i;$$('#qkBtns button').forEach(x=>x.classList.toggle('pri',x===b));drawQK()}));
$('#qkStp').innerHTML=QKSTEP.map((t,i)=>`<button data-s="${i+1}" style="width:auto;padding:0 10px" title="${t}">${t}</button>`).join('');
$$('#qkStp button').forEach(b=>b.addEventListener('click',()=>{qkS=+b.dataset.s;drawQK()}));
function drawQK(){$$('#qkStp button').forEach(b=>{const s=+b.dataset.s;b.classList.toggle('on',s===qkS);b.classList.toggle('done',s<qkS)});
  const i=qkI,js=[...Array(i+1).keys()],raw=js.map(j=>dot(Q[i],K[j])),sc=raw.map(v=>v/Math.sqrt(DK)),al=softmax(sc),wv=js.map((j,n)=>V[j].map(v=>al[n]*v)),head=[0,1].map(k=>wv.reduce((s,w)=>s+w[k],0)),a=vm(head,WO);
  const L=[];
  L.push(`1. q, k, v for every x_j (j ≤ ${i+1}):  q = xW^Q  k = xW^K  v = xW^V   [1×3]·[3×2] → [1×2]\n`+js.map(j=>`   ${TOK[j].padEnd(8)} x=${vec(X[j])}  q=${vec(Q[j])}  k=${vec(K[j])}  v=${vec(V[j])}`).join('\n'));
  if(qkS>=2)L.push(`2. compare q_${i+1} with each key:  q_${i+1}·k_j = [${raw.map(r2).join(', ')}]`);
  if(qkS>=3)L.push(`3. divide by √d_k = √${DK} = ${r2(Math.sqrt(DK))}:  [${sc.map(r2).join(', ')}]`);
  if(qkS>=4)L.push(`4. softmax → α_${i+1},j = [${al.map(r2).join(', ')}]`);
  if(qkS>=5)L.push(`5. weigh each value:  `+js.map((j,n)=>`${r2(al[n])}·v_${j+1} = ${vec(wv[n])}`).join('   '));
  if(qkS>=6)L.push(`6. sum:  head_${i+1} = ${vec(head)}   [1 × d_v] = [1 × 2]`);
  if(qkS>=7)L.push(`7. reshape:  head · W^O,  [1×2]·[2×3]   W^O = [[1, 0, 0.5], [0, 1, 0.5]]`);
  if(qkS>=8)L.push(`8. output a_${i+1} = ${vec(a)}   [1 × d] = [1 × 3], same shape as x_${i+1}`);
  $('#qkCalc').textContent=L.join('\n\n')+'\n\n(all matrices are made up for illustration)'}
drawQK();

/* ---------- 7.2 residual stream diagram ---------- */
const RS=[['x','المدخل x<sub>i</sub>','يبدأ التيار بمتجه الرمز [1 × d]: تضمينه وموضعه في الطبقة الأولى، أو مخرج الكتلة السابقة.'],
 ['ln1','t¹ = LayerNorm(x<sub>i</sub>)','نطبّع نسخة من التيار. التيار نفسه لم يتغير.'],
 ['att','t² = MultiHeadAttention(t¹<sub>i</sub>, t¹<sub>1</sub> … t¹<sub>i−1</sub>)','الانتباه يقرأ من تيار هذا الرمز ومن تيارات الرموز السابقة (الأسهم الجانبية). هذه الوحدة الوحيدة التي ترى رموزاً أخرى.'],
 ['add1','t³ = t² + x<sub>i</sub>','نضيف مخرج الانتباه إلى التيار. هذه «الوصلة المتبقية»: الأصل يمر كما هو، ويُضاف إليه الجديد.'],
 ['ln2','t⁴ = LayerNorm(t³)','نطبّع مرة أخرى قبل الشبكة الأمامية.'],
 ['ffn','t⁵ = FFN(t⁴)','الشبكة الأمامية تعمل على هذا الموضع وحده، بالأوزان نفسها لكل المواضع.'],
 ['add2','h<sub>i</sub> = t⁵ + t³','نضيف مخرجها إلى التيار. وh<sub>i</sub> [1 × d] يصير مدخل الكتلة التالية.']];
let rsS=0;
$('#rsStp').innerHTML=RS.map((r,i)=>`<button data-s="${i}">${i}</button>`).join('');
$$('#rsStp button').forEach(b=>b.addEventListener('click',()=>{rsS=+b.dataset.s;drawRS()}));
function drawRS(){$$('#rsStp button').forEach(b=>{const s=+b.dataset.s;b.classList.toggle('on',s===rsS);b.classList.toggle('done',s<rsS)});
  const k=RS[rsS][0],on=id=>id===k,cx=150;
  const box=(id,y,lab,x=cx+70,w=110)=>`<rect x="${x-w/2}" y="${y-15}" width="${w}" height="30" rx="7" fill="${on(id)?'var(--green)':'var(--math-soft)'}" stroke="${on(id)?'var(--green)':'var(--math)'}"/><text x="${x}" y="${y+5}" font-size="12" text-anchor="middle" fill="${on(id)?'var(--paper)':'var(--math)'}" font-family="Noto Sans">${lab}</text>`;
  const plus=(id,y)=>`<circle cx="${cx}" cy="${y}" r="12" fill="${on(id)?'var(--green)':'var(--paper)'}" stroke="var(--ink)"/><text x="${cx}" y="${y+5}" font-size="16" text-anchor="middle" fill="${on(id)?'var(--paper)':'var(--ink)'}">+</text>`;
  let s=`<svg class="map" viewBox="0 0 330 380" role="img" style="max-width:340px"><defs><marker id="rsA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--soft)"/></marker></defs>`;
  s+=`<line x1="${cx}" y1="355" x2="${cx}" y2="22" stroke="var(--amber)" stroke-width="5" opacity=".55"/><text x="${cx-10}" y="200" font-size="11" fill="var(--amber)" text-anchor="end" font-family="Noto Sans">residual stream</text>`;
  /* side branches */
  const br=(y1,y2)=>`<path d="M${cx} ${y1} H${cx+70} V${y2}" fill="none" stroke="var(--soft)" stroke-width="1.3" marker-end="url(#rsA)"/>`;
  s+=br(330,312)+`<line x1="${cx+70}" y1="282" x2="${cx+70}" y2="262" stroke="var(--soft)" stroke-width="1.3" marker-end="url(#rsA)"/><path d="M${cx+70} 232 V220 H${cx+14}" fill="none" stroke="var(--soft)" stroke-width="1.3" marker-end="url(#rsA)"/>`;
  s+=br(205,168)+`<line x1="${cx+70}" y1="138" x2="${cx+70}" y2="118" stroke="var(--soft)" stroke-width="1.3" marker-end="url(#rsA)"/><path d="M${cx+70} 88 V76 H${cx+14}" fill="none" stroke="var(--soft)" stroke-width="1.3" marker-end="url(#rsA)"/>`;
  s+=box('ln1',297,'Layer Norm')+box('att',247,'MultiHead Attn')+box('ln2',153,'Layer Norm')+box('ffn',103,'Feedforward')+plus('add1',220)+plus('add2',76);
  s+=`<path d="M20 330 C 60 330, 120 250, ${cx+14} 250" fill="none" stroke="${on('att')?'var(--green)':'var(--rule)'}" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#rsA)"/><text x="10" y="322" font-size="10.5" fill="var(--soft)" font-family="Noto Sans">x₁ … xᵢ₋₁</text>`;
  s+=`<text x="${cx}" y="372" font-size="13" text-anchor="middle" fill="${on('x')?'var(--green)':'var(--ink)'}" font-family="Noto Sans Mono" font-weight="600">xᵢ</text><text x="${cx}" y="16" font-size="13" text-anchor="middle" fill="${on('add2')?'var(--green)':'var(--ink)'}" font-family="Noto Sans Mono" font-weight="600">hᵢ</text></svg>`;
  $('#rsSvg').innerHTML=s;$('#rsTxt').innerHTML=`<h4>الخطوة ${AR(rsS)}: <span dir="ltr">${RS[rsS][1]}</span></h4>${RS[rsS][2]}`}
drawRS();

/* ---------- Swish ---------- */
function drawSW(){const b=+$('#swB').value;$('#swBo').textContent=b.toFixed(1);
  plot($('#swPlot'),{W:520,H:200,xmin:-5,xmax:4,ymin:-1,ymax:4,xt:[-4,-2,0,2,4],yt:[-1,0,2,4],xl:'x',curves:[{f:x=>Math.max(0,x),c:'var(--math)',w:2},{f:x=>x*sig(b*x),c:'var(--green)',dash:1,w:2.5}]})}
$('#swB').addEventListener('input',drawSW);drawSW();

/* ---------- 7.2.2 layer norm ---------- */
function drawLN(){const g=+$('#lnG').value,b=+$('#lnB').value,m=segVal('#lnM','m');$('#lnGo').textContent=g.toFixed(1);$('#lnBo').textContent=b.toFixed(1);
  const x=$('#lnIn').value.split(/[,،\s]+/).filter(s=>s!=='').map(num).filter(v=>!isNaN(v));if(x.length<2){$('#lnCalc').textContent='اكتب رقمين على الأقل';return}
  const d=x.length,mu=x.reduce((a,c)=>a+c,0)/d;
  if(m==='ln'){const dev=x.map(v=>v-mu),sd=Math.sqrt(dev.reduce((a,c)=>a+c*c,0)/d),xh=dev.map(v=>v/(sd||1)),out=xh.map(v=>g*v+b);
    $('#lnCalc').textContent=`x = ${vec(x)}   d = ${d}\nμ = (1/${d})·Σx = ${r3(mu)}\nx − μ = ${vec(dev)}\nσ = √( (1/${d})·Σ(x−μ)² ) = √${r3(dev.reduce((a,c)=>a+c*c,0)/d)} = ${r3(sd)}\nx̂ = (x − μ)/σ = ${vec(xh)}   mean ${r2(xh.reduce((a,c)=>a+c,0)/d)}, std ${r2(Math.sqrt(xh.reduce((a,c)=>a+c*c,0)/d))}\nLayerNorm(x) = γ·x̂ + β = ${vec(out)}`}
  else{const rms=Math.sqrt(x.reduce((a,c)=>a+c*c,0)/d),out=x.map(v=>g*v/(rms||1));
    $('#lnCalc').textContent=`x = ${vec(x)}   d = ${d}\nRMS = √( (1/${d})·Σx² ) = ${r3(rms)}      (no mean is subtracted)\nRMSNorm(x) = γ·x/RMS = ${vec(out)}\nmean of result = ${r2(out.reduce((a,c)=>a+c,0)/d)}   ← not 0: the centring step is skipped`}}
['#lnIn','#lnG','#lnB'].forEach(s=>$(s).addEventListener('input',drawLN));segOn('#lnM',drawLN);drawLN();

/* ---------- 7.3 mask ---------- */
let mkRow=1;
function drawMK(){const m=segVal('#mkM','m'),N=TOK.length;
  const S=Q.map(q=>K.map(k=>dot(q,k)/Math.sqrt(DK))),M=S.map((r,i)=>r.map((v,j)=>j>i?(m==='inf'?-Infinity:m==='zero'?0:v):v)),A=M.map(softmax);
  const head=`<tr><th>q \\ k</th>${TOK.map(t=>`<th>${t}</th>`).join('')}</tr>`;
  $('#mkS').innerHTML=head+M.map((r,i)=>`<tr data-r="${i}" class="${i===mkRow?'sel':''}"><th>${TOK[i]}</th>${r.map((v,j)=>`<td class="num${j>i&&m!=='none'?' cut':''}">${v===-Infinity?'−∞':r2(v)}</td>`).join('')}</tr>`).join('');
  $('#mkA').innerHTML=head+A.map((r,i)=>`<tr data-r="${i}" class="${i===mkRow?'sel':''}"><th>${TOK[i]}</th>${r.map((v,j)=>`<td class="num" style="background:color-mix(in srgb,var(--green) ${Math.round(v*70)}%,transparent)">${r2(v)}</td>`).join('')}</tr>`).join('');
  $$('#mkS tr[data-r],#mkA tr[data-r]').forEach(tr=>tr.addEventListener('click',()=>{mkRow=+tr.dataset.r;drawMK()}));
  const i=mkRow,fut=A[i].slice(i+1).reduce((a,b)=>a+b,0);
  $('#mkCalc').textContent=`row ${i+1} (“${TOK[i]}”): α = [${A[i].map(r2).join(', ')}]   sum = ${r2(A[i].reduce((a,b)=>a+b,0))}\nweight on future tokens (j > ${i+1}): ${r2(fut)}`+
    (i===TOK.length-1?'   ← the last token has no future: pick another row':m==='none'?'   ← the model can peek at the words it should predict':m==='inf'?'   ← e^(−∞) = 0: the future is invisible':'   ← e^0 = 1 is not 0: future words still get weight, and a 0 can even beat a negative real score')+
    `\n(click a row to inspect it; Q and K come from the made-up example above)`}
segOn('#mkM',drawMK);drawMK();

/* ---------- quadratic ---------- */
function drawQD(){const N=2**(+$('#qdN').value);$('#qdNo').textContent=fmtN(N);
  $('#qdCalc').textContent=`N = ${fmtN(N)} tokens\nQKᵀ has N × N = ${fmtN(N*N)} dot products (per head, per layer)\ndouble the text → ${fmtN(4*N*N)} (4×)`+(N>=4096?`\nas 4-byte numbers: ${(N*N*4/2**30).toFixed(N>=65536?0:2)} GB for one head's score matrix`:'')}
$('#qdN').addEventListener('input',drawQD);drawQD();

/* ---------- 7.4 sinusoidal positions ---------- */
const PD=32,PN=40,PE=Array.from({length:PN},(_,p)=>Array.from({length:PD},(_,k)=>{const m=Math.floor(k/2),ang=p/Math.pow(10000,2*m/PD);return k%2===0?Math.sin(ang):Math.cos(ang)}));
(function(){const cw=10,ch=6,W=PD*cw+40,H=PN*ch+24;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:520px">`;
  PE.forEach((r,p)=>r.forEach((v,k)=>{s+=`<rect x="${34+k*cw}" y="${4+p*ch}" width="${cw}" height="${ch}" fill="${v>=0?'var(--green)':'var(--rose)'}" fill-opacity="${Math.abs(v).toFixed(2)}" shape-rendering="crispEdges"/>`}));
  [0,10,20,30,39].forEach(p=>{s+=`<text x="30" y="${4+p*ch+6}" font-size="9" text-anchor="end" fill="var(--soft)" font-family="Noto Sans Mono">${p}</text>`});
  s+=`<text x="34" y="${H-4}" font-size="10" fill="var(--soft)" font-family="Noto Sans">dim 0 (fast) →</text><text x="${W-6}" y="${H-4}" font-size="10" text-anchor="end" fill="var(--soft)" font-family="Noto Sans">dim 31 (slow)</text></svg>`;
  $('#pePlot').innerHTML=s})();
const ncos=(a,b)=>dot(a,b)/Math.sqrt(dot(a,a)*dot(b,b));
function drawPE(){const p=+$('#peP').value;$('#pePo').textContent=p;const c=PE.map(r=>ncos(PE[p],r));
  plot($('#peSim'),{W:560,H:190,xmin:-1,xmax:PN,ymin:0,ymax:1,xt:[0,10,20,30,39],yt:[0,.5,1],xl:'position q',yl:'cos(PE[p], PE[q])',vbars:c.map((v,q)=>({x:q,y:v,w:9,c:q===p?'var(--amber)':'var(--green)'}))});
  const nb=[p-1,p+1].filter(q=>q>=0&&q<PN);
  $('#peCalc').textContent=`cos(PE[${p}], PE[q]):  `+nb.map(q=>`q=${q}: ${r2(c[q])}`).join('   ')+(p!==17?`   q=17: ${r2(c[17])}`:'')+`\nnearby positions look alike; far ones less so (d = 32 here for display; the original transformer used d = 512)`}
$('#peP').addEventListener('input',drawPE);drawPE();

/* ---------- 7.6 decoding ---------- */
const DW=['all','the','your','that'],DU=[1.2,0.9,0.1,-0.5];let dcCnt=[0,0,0,0],dcLast=null,dcR=rng(42);
const tauOf=v=>v===0?0.01:+(10**((v-20)/10)).toPrecision(2);
function dcDist(){const t=tauOf(+$('#dcT').value),k=+$('#dcK').value,p=+$('#dcP').value;
  const pt=softmax(DU.map(u=>u/t)),ord=[0,1,2,3].sort((a,b)=>pt[b]-pt[a]),keep=new Set(ord.slice(0,k));
  let pk=pt.map((v,i)=>keep.has(i)?v:0);const sk=pk.reduce((a,b)=>a+b,0);pk=pk.map(v=>v/sk);
  const keep2=new Set();let cum=0;for(const i of ord){if(!keep.has(i))continue;keep2.add(i);cum+=pk[i];if(cum>=p-1e-9)break}
  let q=pk.map((v,i)=>keep2.has(i)?v:0);const sq=q.reduce((a,b)=>a+b,0);q=q.map(v=>v/sq);return {t,k,p,pt,pk,q,keep,keep2}}
function drawDC(extra){const D=dcDist();$('#dcTo').textContent=D.t;$('#dcKo').textContent=D.k;$('#dcPo').textContent=D.p.toFixed(2);
  const tot=dcCnt.reduce((a,b)=>a+b,0);
  bars($('#dcBars'),DW.map((w,i)=>({l:w,v:D.q[i],scale:'abs',dim:!D.keep2.has(i),pick:i===dcLast,t:D.q[i].toFixed(2)+(tot?` · n=${dcCnt[i]}`:'')})));
  let s=`logits u = [${DU.join(', ')}]   (${DW.join(', ')})\n1. temperature  softmax(u/τ), τ = ${D.t}:  [${D.pt.map(r2).join(', ')}]\n2. top-k, k = ${D.k}: keep {${[...D.keep].map(i=>DW[i]).join(', ')}} → renormalise [${D.pk.map(r2).join(', ')}]\n3. top-p, p = ${D.p.toFixed(2)}: smallest set with Σ ≥ p = {${[...D.keep2].map(i=>DW[i]).join(', ')}} → final [${D.q.map(r2).join(', ')}]`;
  if(tot)s+=`\n\nsamples so far: ${tot}   `+DW.map((w,i)=>`${w} ${(dcCnt[i]/tot*100).toFixed(0)}%`).join('  ');
  if(dcLast!=null&&extra)s+=`\nlast draw: “${DW[dcLast]}”`;
  if(extra==='book'){s+='\n\nFigure 7.21 recomputed:\n  τ      all   the   your  that\n'+[0.1,0.5,1,10,100].map(t=>{const p=softmax(DU.map(u=>u/t));return '  '+String(t).padEnd(6)+p.map(v=>v.toFixed(2).padStart(5)).join(' ')}).join('\n')}
  $('#dcCalc').textContent=s}
function dcSample(n){const D=dcDist();for(let r=0;r<n;r++){let u=dcR(),i=0;for(;i<3;i++){u-=D.q[i];if(u<0)break}dcCnt[i]++;dcLast=i}drawDC('s')}
['#dcT','#dcK','#dcP'].forEach(s=>$(s).addEventListener('input',()=>{dcCnt=[0,0,0,0];dcLast=null;drawDC()}));
$('#dcS1').addEventListener('click',()=>dcSample(1));$('#dcS1k').addEventListener('click',()=>dcSample(1000));
$('#dcReset').addEventListener('click',()=>{dcCnt=[0,0,0,0];dcLast=null;drawDC()});
$('#dcBook').addEventListener('click',()=>{$('#dcT').value=20;$('#dcK').value=4;$('#dcP').value=1;dcCnt=[0,0,0,0];dcLast=null;drawDC('book')});
drawDC();

/* ---------- 7.7 perplexity ---------- */
const PPW=['So','long','and','thanks','for','all'],PP0=[0.05,0.3,0.2,0.6,0.44];
$('#ppTab').innerHTML=`<tr><th>t</th><th>context w₁..w_t</th><th>true next</th><th>P(next)</th><th>−log P</th></tr>`+PP0.map((p,t)=>`<tr><td class="num">${t+1}</td><td>${PPW.slice(0,t+1).join(' ')}</td><td><b>${PPW[t+1]}</b></td><td><input class="wIn" id="pp${t}" value="${p}"></td><td class="num" id="ppL${t}"></td></tr>`).join('');
function drawPP(){const P=PP0.map((_,t)=>num($('#pp'+t).value)),ok=P.every(p=>p>0&&p<=1);
  if(!ok){$('#ppCalc').textContent='كل احتمال يجب أن يكون أكبر من ٠ ولا يزيد على ١';return}
  const L=P.map(p=>-Math.log(p));L.forEach((l,t)=>$('#ppL'+t).textContent=l.toFixed(3));
  const T=P.length,mean=L.reduce((a,b)=>a+b,0)/T,prod=P.reduce((a,b)=>a*b,1);
  $('#ppCalc').textContent=`mean cross-entropy loss = (1/${T})·Σ −log P = ${mean.toFixed(4)} nats\nperplexity via exp:    exp(${mean.toFixed(4)}) = ${Math.exp(mean).toFixed(3)}\nperplexity via (7.57): (${prod.toExponential(3)})^(−1/${T}) = ${Math.pow(prod,-1/T).toFixed(3)}   ← the same number\n\n(teacher forcing: every row gets the TRUE context, whatever the model guessed before)`}
PP0.forEach((_,t)=>$('#pp'+t).addEventListener('input',drawPP));drawPP();

/* ---------- 7.8 KV cache ---------- */
function drawKV(){const T=+$('#kvT').value;$('#kvTo').textContent=fmtN(T);const no=T*(T+1)/2;
  $('#kvCalc').textContent=`without cache: step t recomputes k and v for all t tokens → 1 + 2 + … + ${fmtN(T)} = ${fmtN(no)} key/value projections\nwith KV cache: one new k and v per step → ${fmtN(T)} projections   (${(no/T).toFixed(1)}× fewer)\nthe price: the cache must stay in memory, growing with T`}
$('#kvT').addEventListener('input',drawKV);drawKV();

/* ---------- Fig 7.24 models ---------- */
const MD=[['GPT-2 XL',2019,48,1600,25,6400,50e3,'1K',1.5e9,0],['GPT-3',2020,96,12288,96,49152,50e3,'2K',175e9,0],['Qwen3-0.6B',2025,28,1024,16,3072,152e3,'32K',0.6e9,1],['Qwen3-32B',2025,64,5120,64,25600,152e3,'128K',32e9,1],['Llama 3.1 8B',2024,32,4096,32,14336,128e3,'128K',8e9,1],['Llama 3.1 405B',2024,126,16384,128,53248,128e3,'128K',405e9,1]];
let mdI=1;const B=v=>v>=1e9?(v/1e9).toFixed(v<1e10?2:0)+'B':(v/1e6).toFixed(0)+'M';
$('#mdTab').innerHTML=`<tr><th>Model</th><th>Year</th><th>L</th><th>d</th><th>A</th><th>d_ff</th><th>|V|</th><th>Context</th><th>Params</th></tr>`+MD.map((m,i)=>`<tr data-i="${i}" style="cursor:pointer"><td>${m[0]}</td><td class="num">${m[1]}</td><td class="num">${m[2]}</td><td class="num">${fmtN(m[3])}</td><td class="num">${m[4]}</td><td class="num">${fmtN(m[5])}</td><td class="num">${m[6]/1e3}K</td><td class="num">${m[7]}</td><td class="num">${B(m[8])}</td></tr>`).join('');
$$('#mdTab tr[data-i]').forEach(tr=>tr.addEventListener('click',()=>{mdI=+tr.dataset.i;drawMD()}));
function drawMD(){$$('#mdTab tr[data-i]').forEach(tr=>tr.classList.toggle('sel',+tr.dataset.i===mdI));const [n,,L,d,A,dff,Vs,,P,glu]=MD[mdI];
  const rule=12*L*d*d,att=4*L*d*d,ffn=(glu?3:2)*L*d*dff,emb=Vs*d;
  $('#mdCalc').textContent=`${n}:  L = ${L}, d = ${fmtN(d)}, A = ${A} → d_k = d/A = ${Math.round(d/A)}\n\nrule of thumb 12·L·d² = 12·${L}·${fmtN(d)}² = ${B(rule)}   (+ embeddings |V|·d = ${B(emb)})\nusing the real d_ff:  attention 4·L·d² = ${B(att)}   FFN ${glu?'3 (SwiGLU)':'2'}·L·d·d_ff = ${B(ffn)}   embeddings ${B(emb)}\n  total ≈ ${B(att+ffn+emb)}   reported: ${B(P)}\n(rough: grouped-query attention shrinks W^K, W^V; some models keep separate input/output embeddings)`}
drawMD();

/* ---------- glossary ---------- */
const GL=[['المحوّل','transformer','معمارية مبنية على الانتباه، أساس النماذج اللغوية الكبيرة.'],['سببي / ذاتي الانحدار','causal / autoregressive','يتنبأ بكل رمز من الرموز السابقة فقط.'],['كتلة المحوّل','transformer block','تطبيع + انتباه + إضافة + تطبيع + أمامية + إضافة.'],['التيار المتبقي','residual stream','متجه الرمز الذي يصعد وتضيف إليه الوحدات.'],['التضمين السياقي','contextual embedding','تمثيل للكلمة يتغير بسياقها.'],['الانتباه الذاتي','self-attention','مجموع موزون لمتجهات الرموز السابقة.'],['رأس الانتباه','attention head','وحدة انتباه واحدة بمصفوفات W^Q وW^K وW^V.'],['الاستعلام / المفتاح / القيمة','query / key / value','عمّ أبحث / بماذا أُعرَف / ماذا أعطي.'],['بُعد النموذج','model dimension d','طول متجه التيار في كل الطبقات.'],['الانتباه متعدد الرؤوس','multi-head attention','رؤوس متوازية تُلصق مخرجاتها ثم تُضرب في W^O.'],['الطبقة الأمامية','feedforward layer','شبكة من طبقتين لكل موضع، بُعدها الأوسط d_ff ≈ 4d.'],['موضعي','position-wise','يعمل على كل موضع وحده بالأوزان نفسها.'],['SwiGLU','SwiGLU','دالة بوابية: Swish(xW₁) ⊗ (xW₂).'],['التطبيع الطبقي','layer norm','(x − μ)/σ لمتجه رمز واحد، ثم γ وβ.'],['RMSNorm','RMSNorm','القسمة على جذر متوسط المربعات دون طرح المتوسط.'],['خلط الرموز','token-mixing','نقل المعلومات بين مواضع الرموز، وهو دور الانتباه.'],['القناع','mask','−∞ فوق القطر ليمنع رؤية المستقبل.'],['تربيعي','quadratic','العمل يكبر بمربع طول النص.'],['تضمين الموضع','positional embedding','متجه يمثّل موضع الرمز ويُضاف إلى تضمينه.'],['الموضع المطلق / النسبي','absolute / relative position','رقم الموضع / المسافة بين الرموز.'],['RoPE','rotary position embedding','أشهر طرق الموضع النسبي اليوم.'],['رأس النمذجة اللغوية','language modeling head','فك التضمين ثم سوفتماكس على المفردات.'],['ربط الأوزان / فك التضمين','weight tying / unembedding','استعمال Eᵀ لتحويل المتجه إلى لوجِتات.'],['مفكِّك فقط','decoder-only','المحوّل السببي المستعمل في النماذج اللغوية.'],['فك الترميز','decoding','اختيار الرمز المولَّد من الاحتمالات.'],['جشع','greedy decoding','اختيار الأرجح دائماً (argmax).'],['السحب العشوائي','random sampling','الاختيار بحسب الاحتمال.'],['السحب بالحرارة','temperature sampling','softmax(u/τ): τ صغيرة أكثر جشعاً، وكبيرة أكثر تسطحاً.'],['top-k / top-p','top-k / nucleus sampling','أرجح k رمز / أصغر مجموعة كتلتها p.'],['ذاتي الإشراف','self-supervised','النص نفسه هو الوسم.'],['إجبار المعلّم','teacher forcing','إعطاء النموذج التاريخ الصحيح دائماً في التدريب.'],['الحيرة','perplexity','exp لمتوسط خسارة الإنتروبيا التقاطعية.'],['nats','nats','وحدة الخسارة مع اللوغاريتم الطبيعي.'],['ذاكرة KV المؤقتة','KV cache','حفظ مفاتيح وقيم الرموز السابقة أثناء التوليد.'],['النموذج الأساسي','foundation model','تقنية النماذج الكبيرة مطبقة في مجالات متعددة.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
