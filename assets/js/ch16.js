/* Chapter 16 · Automatic Speech Recognition — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2),r1=v=>(+v).toFixed(1);
const fmt=n=>Math.round(n).toLocaleString('en-US');
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s16-1','16.1','مهمة التعرّف'],['s16-2','16.2','الشبكات الالتفافية'],['s16-3','16.3','المرمِّز-المفكِّك وWhisper'],['s16-4','16.4','HuBERT وk-means'],['s16-5','16.5','CTC وRNN-T'],['s16-6','16.6','معدل خطأ الكلمات'],['ex','','الخلاصة والمسرد']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- 16.1 WER bars (Fig 16.1) ---------- */
const WR=[['LibriSpeech clean',1.4,'en'],['LibriSpeech other',2.6,'en'],['Switchboard',5.8,'en'],['CALLHOME',11,'en'],['AMI meetings',11,'en'],['CORAAL (AAE)',16.2,'en'],['CHiME6 dinner parties',25.5,'en'],['CV15 Vietnamese',39.8,'x'],['CV15 Swahili',51.2,'x'],['FLEURS Bengali',50,'x'],['AISHELL-1 (CER)',3.9,'zh'],['HKUST (CER)',18.5,'zh']];
$('#wrBars').innerHTML=WR.map(([n,v,g])=>`<div class="br"><span class="w0" style="font-size:13px">${n}</span><span class="tr"><span class="fl" style="display:block;width:${v/52*100}%;background:${g==='en'?'var(--math)':g==='x'?'var(--rose)':'var(--amber)'}"></span></span><span class="v">${v}%</span></div>`).join('');

/* ---------- 16.2 1-D convolution ---------- */
const CX=[0,0,1,3,4,4,2,0,0,1],CK={avg:[1/3,1/3,1/3],edge:[-1,0,1],peak:[-1,2,-1]};let cvJ=3;
function drawCV(){const k=CK[segVal('#cvK','k')],st=+segVal('#cvS','s'),p=1,xp=[0,...CX,0],n=CX.length;
  const outIdx=[];for(let j=0;j<n;j+=st)outIdx.push(j);if(!outIdx.includes(cvJ))cvJ=outIdx[Math.min(1,outIdx.length-1)];
  const z=j=>k.reduce((s,w,i)=>s+w*xp[j+i],0);
  const W=560,H=150,cw=44,x0=(W-xp.length*cw)/2;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:580px">`;
  xp.forEach((v,i)=>{const pad=i===0||i===xp.length-1,inK=i>=cvJ&&i<cvJ+3;s+=`<rect x="${x0+i*cw+2}" y="14" width="${cw-4}" height="30" rx="5" fill="${inK?'var(--math-soft)':'var(--paper)'}" stroke="${inK?'var(--math)':'var(--rule)'}" ${pad?'stroke-dasharray="3 3"':''}/><text x="${x0+i*cw+cw/2}" y="34" font-size="13" text-anchor="middle" fill="${pad?'var(--soft)':'var(--ink)'}" font-family="Noto Sans Mono">${v}</text>`});
  k.forEach((w,i)=>{s+=`<text x="${x0+(cvJ+i)*cw+cw/2}" y="62" font-size="11" text-anchor="middle" fill="var(--math)" font-family="Noto Sans Mono">×${Math.abs(w-1/3)<1e-9?'⅓':w}</text>`});
  outIdx.forEach((j,m)=>{const on=j===cvJ;const xx=x0+(j+1)*cw;s+=`<g data-j="${j}" style="cursor:pointer"><rect x="${xx+2}" y="${96}" width="${cw-4}" height="30" rx="5" fill="${on?'var(--green)':'var(--green-soft)'}" stroke="var(--green)"/><text x="${xx+cw/2}" y="${116}" font-size="12" text-anchor="middle" fill="${on?'var(--paper)':'var(--green)'}" font-family="Noto Sans Mono">${r1(z(j))}</text></g>`});
  s+=`<line x1="${x0+(cvJ+1)*cw+cw/2}" y1="68" x2="${x0+(cvJ+1)*cw+cw/2}" y2="94" stroke="var(--math)" stroke-width="1.5"/><text x="4" y="34" font-size="10.5" fill="var(--soft)" font-family="Noto Sans">x (padded)</text><text x="4" y="116" font-size="10.5" fill="var(--soft)" font-family="Noto Sans">z</text></svg>`;
  $('#cvSvg').innerHTML=s;$$('#cvSvg g[data-j]').forEach(g=>g.addEventListener('click',()=>{cvJ=+g.dataset.j;drawCV()}));
  const kk=k.map(w=>Math.abs(w-1/3)<1e-9?'⅓':w);
  $('#cvCalc').textContent=`x = [${CX.join(', ')}]   padding p = 1 (zeros at both ends), kernel w = [${kk.join(', ')}], stride ${st}\nz_${cvJ+1} = ${k.map((w,i)=>`${kk[i]}·${xp[cvJ+i]}`).join(' + ')} = ${r2(z(cvJ))}\nz = [${outIdx.map(j=>r1(z(j))).join(', ')}]   length ${outIdx.length} (input ${n})`+
    ({avg:'\nthe averaging kernel smooths the signal',edge:'\nthe [−1 0 1] kernel responds where the signal rises (+) or falls (−): a “change detector”',peak:'\nthe [−1 2 −1] kernel responds to local peaks and dips'})[segVal('#cvK','k')]+'\n(click any output box to see how it is computed)'}
segOn('#cvK',drawCV);segOn('#cvS',drawCV);drawCV();

/* ---------- conv params ---------- */
function drawCP(){const I=+$('#cpI').value,O=+$('#cpO').value,K=+$('#cpK').value;$('#cpIo').textContent=I;$('#cpOo').textContent=O;$('#cpKo').textContent=K;
  const w=I*O*K;
  $('#cpCalc').textContent=`${O} kernels, each of shape [depth ${I} × width ${K}] = ${fmt(I*K)} weights\nweights = ${I} × ${O} × ${K} = ${fmt(w)}   (+ ${fmt(O)} biases = ${fmt(w+O)})\nthe same weights are reused at every frame: 3000 frames cost no extra parameters\nWhisper large: conv1 128→1280 (k=3) ≈ ${fmt(128*1280*3+1280)}, conv2 1280→1280 (k=3) ≈ ${fmt(1280*1280*3+1280)}`}
['#cpI','#cpO','#cpK'].forEach(s=>$(s).addEventListener('input',drawCP));drawCP();

/* ---------- subsampling ---------- */
function drawSS(){const m=segVal('#ssM','m'),D=+$('#ssD').value;$('#ssDo').textContent=D;const words=D*4,letters=words*5,bpe=words*1.3;let t;
  if(m==='wh')t=`${D} s audio → log mel frames every 10 ms: ${D*100} frames × 128 channels\nconv1 (stride 1) + GELU: ${D*100} × d_model\nconv2 (stride 2) + GELU: ${D*50} × d_model   → one audio token every 20 ms\n+ sinusoidal positions → transformer encoder (30 s window = 3000 → 1500)`;
  else if(m==='hu')t=`${D} s raw audio at 16 kHz: ${fmt(D*16000)} samples\n7 conv layers, strides [5,2,2,2,2,2,2] → total ${5*64} × shorter\n${fmt(D*16000)} / 320 = ${fmt(D*50)} frames  → one every 20 ms (each conv layer has 512 channels)`;
  else t=`${D} s → ${D*100} frames of 40-d features every 10 ms\nstack f_i with f_{i−1}, f_{i−2} and drop the two: ${Math.floor(D*100/3)} frames of 120-d, one every 30 ms (n = t/3)`;
  $('#ssCalc').textContent=t+`\n\nfor comparison, ${D} s of conversation ≈ ${words} words (250 ms each) ≈ ${letters} letters ≈ ${Math.round(bpe)} BPE tokens\n10-ms frames per letter: ${r1(D*100/letters)}   per BPE token: ${r1(D*100/bpe)}   (book: 5 to 19 times longer)`}
segOn('#ssM',drawSS);$('#ssD').addEventListener('input',drawSS);drawSS();

/* ---------- LM rescoring ---------- */
const RS=[['its time for lunch',-4.0,-12.0],["it's time for lunch",-4.4,-9.5],['its thyme for lunch',-3.9,-16.0]];
function drawRS(){const l=+$('#rsL').value;$('#rsLo').textContent=r2(l);
  const sc=RS.map(([y,p,lm])=>({y,p,lm,c:y.length,s:p/y.length+l*lm})),best=sc.reduce((a,b)=>b.s>a.s?b:a);
  $('#rsTab').innerHTML='<tr><th>hypothesis Y</th><th>log P(Y|X)</th><th>|Y|<sub>c</sub></th><th>log P/|Y|<sub>c</sub></th><th>log P<sub>LM</sub></th><th>score</th></tr>'+sc.map(r=>`<tr style="${r===best?'background:var(--green-soft)':''}"><td>${esc(r.y)}</td><td class="num">${r1(r.p)}</td><td class="num">${r.c}</td><td class="num">${f3(r.p/r.c)}</td><td class="num">${r1(r.lm)}</td><td class="num"><b>${f3(r.s)}</b></td></tr>`).join('');
  $('#rsCalc').textContent=`score = (1/|Y|_c)·log P(Y|X) + ${r2(l)}·log P_LM(Y)\nbest: “${best.y}”`+(l===0?'\nwith λ = 0 the acoustic model alone prefers “thyme” (it sounds the same!)':best.y.startsWith("it's")?'\nthe language model knows “it’s time for lunch” is the likely sentence':'')+'\n(the log-probabilities are made up; λ is tuned on held-out data in practice)'}
$('#rsL').addEventListener('input',drawRS);drawRS();

/* ---------- tau ---------- */
const TC=[0.82,0.75,0.40,0.10,-0.30];
function drawTAU(){const t=+$('#tauT').value;$('#tauTo').textContent=r2(t);const e=TC.map(c=>Math.exp(c/t)),Z=e.reduce((a,b)=>a+b,0),p=e.map(v=>v/Z),mx=p.indexOf(Math.max(...p));
  $('#tauBars').innerHTML=TC.map((c,i)=>`<div class="br${i===mx?' pick':''}"><span class="w0">unit ${i+1}</span><span class="tr"><span class="fl" style="display:block;width:${(p[i]*100).toFixed(1)}%"></span></span><span class="v">${r2(p[i])}</span></div>`).join('');
  $('#tauCalc').textContent=`cos(A·h_t, e_c) = [${TC.join(', ')}]\ndivided by τ: [${TC.map(c=>r1(c/t)).join(', ')}]\nsoftmax → p = [${p.map(r2).join(', ')}]`+(t<=0.1?'\nwith τ = 0.1 the logits range over ±10, so the distribution can be sharp':t>=1?'\nwith τ ≥ 1 the logits stay within ±1: the distribution is almost flat whatever the cosine':'')}
$('#tauT').addEventListener('input',drawTAU);drawTAU();

/* ---------- k-means ---------- */
let KM={};
function kmInit(seed){const R=rng(seed),pts=[],C=[[2,2],[7,3],[4.5,7.5]];
  C.forEach(([cx,cy])=>{for(let i=0;i<10;i++){const a=R()*6.283,r=Math.sqrt(R())*1.6;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}});
  const k=+segVal('#kmK','k');KM={pts,k,mu:pts.map((p,i)=>[R(),i]).sort((a,b)=>a[0]-b[0]).slice(0,k).map(([_,i])=>[pts[i][0]+0.3,pts[i][1]+0.3]),asg:null,it:0,phase:'init',seed}}
const KC=['var(--math)','var(--rose)','var(--green)','var(--amber)'];
const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
function kmStep(){if(KM.phase==='init'||KM.phase==='re'){KM.asg=KM.pts.map(p=>{let b=0;KM.mu.forEach((m,j)=>{if(d2(p,m)<d2(p,KM.mu[b]))b=j});return b});KM.phase='as';KM.it++}
  else{const old=KM.mu.map(m=>m.slice());KM.mu=KM.mu.map((m,j)=>{const S=KM.pts.filter((_,i)=>KM.asg[i]===j);return S.length?[S.reduce((a,p)=>a+p[0],0)/S.length,S.reduce((a,p)=>a+p[1],0)/S.length]:m});
    KM.moved=KM.mu.reduce((s,m,j)=>s+Math.sqrt(d2(m,old[j])),0);KM.phase='re'}drawKM()}
function drawKM(){const W=360,H=300,P=20,sx=v=>P+v/10*(W-2*P),sy=v=>H-P-v/10*(H-2*P);let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:380px">`;
  s+=`<rect x="${P}" y="${P}" width="${W-2*P}" height="${H-2*P}" fill="none" stroke="var(--rule)"/>`;
  KM.pts.forEach((p,i)=>{const c=KM.asg?KC[KM.asg[i]]:'var(--soft)';s+=`<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="5" fill="${c}" opacity="0.75"/>`;if(KM.asg&&KM.phase==='as'){const m=KM.mu[KM.asg[i]];s+=`<line x1="${sx(p[0])}" y1="${sy(p[1])}" x2="${sx(m[0])}" y2="${sy(m[1])}" stroke="${c}" stroke-width="0.6" opacity="0.5"/>`}});
  KM.mu.forEach((m,j)=>{const x=sx(m[0]),y=sy(m[1]);s+=`<path d="M${x-8},${y-8}L${x+8},${y+8}M${x-8},${y+8}L${x+8},${y-8}" stroke="${KC[j]}" stroke-width="4"/><path d="M${x-8},${y-8}L${x+8},${y+8}M${x-8},${y+8}L${x+8},${y-8}" stroke="var(--paper)" stroke-width="1.2"/>`});
  $('#kmSvg').innerHTML=s+'</svg>';
  const sse=KM.asg?KM.pts.reduce((a,p,i)=>a+d2(p,KM.mu[KM.asg[i]]),0):null,sizes=KM.asg?KM.mu.map((_,j)=>KM.asg.filter(a=>a===j).length):[];
  $('#kmCalc').textContent=(KM.phase==='init'?`initialization: ${KM.k} codewords μ (×) placed near randomly chosen points; points not yet assigned\npress “next step”`:KM.phase==='as'?`iteration ${KM.it}, step 1 (assignment): each point → the nearest codeword (Eq. 16.14)\ncluster sizes: [${sizes.join(', ')}]`:`iteration ${KM.it}, step 2 (re-estimation): each codeword → mean of its points (Eq. 16.15)\ncodewords moved a total of ${r2(KM.moved)}`+(KM.moved<1e-6?'  → converged!':''))+(sse!==null?`\nsum of squared distances to the codewords = ${r2(sse)}`:'')+`\nin HuBERT: 172 million 39-d MFCC vectors, k = 100 (stage 1) or 768-d vectors, k = 500 (stage 2)`}
$('#kmStep').addEventListener('click',kmStep);$('#kmReset').addEventListener('click',()=>{kmInit(KM.seed+17);drawKM()});segOn('#kmK',()=>{kmInit(KM.seed);drawKM()});kmInit(5);drawKM();

/* ---------- CTC collapse ---------- */
function collapse(a){const m=[];a.forEach(c=>{if(!m.length||m[m.length-1]!==c)m.push(c)});return {merged:m,out:m.filter(c=>c!=='_')}}
function drawCT(){const v=$('#ctA').value.trim(),a=v.includes(' ')?v.split(/\s+/):[...v];const {merged,out}=collapse(a);
  $('#ctCalc').textContent=`alignment A (${a.length} frames): ${a.join(' ')}\nmerge consecutive duplicates: ${merged.join(' ')}\nremove blanks (_):            ${out.join(' ')}\noutput Y = “${out.join('')}”  (${out.length} letters from ${a.length} frames)`+(!a.includes('_')&&out.join('')==='diner'?'\n✗ without a blank the double “n” of dinner is lost':'')}
$('#ctA').addEventListener('input',drawCT);$$('#ctBox button[data-a]').forEach(b=>b.addEventListener('click',()=>{$('#ctA').value=b.dataset.a;drawCT()}));drawCT();

/* ---------- CTC: best alignment vs best output ---------- */
const CXL=['a','b','_'],CX0=[[.4,.3,.3],[.2,.5,.3],[.2,.35,.45]];let CXP=CX0.map(r=>r.slice());
function drawCX(){$('#cxP').innerHTML='<tr><th>p(a_t | X)</th>'+CXL.map(c=>`<th>${c==='_'?'␣ (blank)':c}</th>`).join('')+'</tr>'+CXP.map((r,t)=>`<tr><td>t = ${t+1}</td>${r.map(v=>`<td class="num">${r2(v)}</td>`).join('')}</tr>`).join('');
  const al=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++){const a=[CXL[i],CXL[j],CXL[k]],p=CXP[0][i]*CXP[1][j]*CXP[2][k];al.push({a,p,y:collapse(a).out.join('')||'∅'})}
  al.sort((x,y)=>y.p-x.p);const ys={};al.forEach(x=>{(ys[x.y]=ys[x.y]||{p:0,n:[]}).p+=x.p;ys[x.y].n.push(x)});
  const yr=Object.entries(ys).sort((a,b)=>b[1].p-a[1].p);const ba=al[0],by=yr[0];
  $('#cxCalc').textContent=`most probable alignment: [${ba.a.join(' ').replace(/_/g,'␣')}] p = ${f3(ba.p)} → Y = “${ba.y}”\n\nP_CTC(Y|X) = sum over the alignments of each output:\n`+yr.slice(0,4).map(([y,o])=>`  “${y}”: ${f3(o.p)}   (${o.n.length} alignments: ${o.n.slice(0,4).map(x=>x.a.join('').replace(/_/g,'␣')).join(', ')}${o.n.length>4?', …':''})`).join('\n')+
   `\n\nmost probable output: “${by[0]}”`+(by[0]!==ba.y?`  ≠ “${ba.y}” from the single best alignment ✓ this is the book’s point`:'  (same as the best alignment this time)')}
$('#cxR').addEventListener('click',()=>{const R=rng(Date.now()%100000);CXP=CXP.map(()=>{const v=[R()+.05,R()+.05,R()+.05],s=v[0]+v[1]+v[2];return v.map(x=>x/s)});drawCX()});
$('#cxD').addEventListener('click',()=>{CXP=CX0.map(r=>r.slice());drawCX()});drawCX();

/* ---------- WER ---------- */
function align(R,H){const n=R.length,m=H.length,D=Array.from({length:n+1},(_,i)=>Array.from({length:m+1},(_,j)=>i===0?j:j===0?i:0));
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){const sub=R[i-1].toLowerCase()===H[j-1].toLowerCase()?0:1;D[i][j]=Math.min(D[i-1][j-1]+sub,D[i-1][j]+1,D[i][j-1]+1)}
  const out=[];let i=n,j=m;while(i>0||j>0){if(i>0&&j>0&&D[i][j]===D[i-1][j-1]+(R[i-1].toLowerCase()===H[j-1].toLowerCase()?0:1)){out.push([R[i-1],H[j-1],R[i-1].toLowerCase()===H[j-1].toLowerCase()?'':'S']);i--;j--}
    else if(j>0&&D[i][j]===D[i][j-1]+1){out.push(['***',H[j-1],'I']);j--}else{out.push([R[i-1],'***','D']);i--}}
  return {ops:out.reverse(),dist:D[n][m]}}
function drawWE(){const R=$('#weR').value.trim().split(/\s+/).filter(Boolean),H=$('#weH').value.trim().split(/\s+/).filter(Boolean);if(!R.length){$('#weCalc').textContent='enter a reference';return}
  const {ops,dist}=align(R,H),c={S:0,I:0,D:0};ops.forEach(o=>{if(o[2])c[o[2]]++});
  const col=t=>t==='S'?'var(--amber)':t==='I'?'var(--green)':t==='D'?'var(--rose)':'var(--ink)';
  $('#weTab').innerHTML=`<tr><th>REF</th>${ops.map(o=>`<td style="color:${col(o[2])}">${esc(o[0])}</td>`).join('')}</tr><tr><th>HYP</th>${ops.map(o=>`<td style="color:${col(o[2])}">${esc(o[1])}</td>`).join('')}</tr><tr><th>Eval</th>${ops.map(o=>`<td style="color:${col(o[2])};font-weight:700">${o[2]}</td>`).join('')}</tr>`;
  $('#weCalc').textContent=`substitutions S = ${c.S}, insertions I = ${c.I}, deletions D = ${c.D}   (edit distance ${dist})\nreference words N = ${R.length}\nWER = 100 × (${c.I} + ${c.S} + ${c.D}) / ${R.length} = ${r1(100*(c.I+c.S+c.D)/R.length)}%`+(c.I+c.S+c.D>R.length?'\n(more errors than reference words: WER above 100% is possible because of insertions)':'')+'\n(comparison ignores upper/lower case)'}
['#weR','#weH'].forEach(s=>$(s).addEventListener('input',drawWE));drawWE();

/* ---------- MAPSSWE ---------- */
function Phi(z){const t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp(-z*z/2),p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p}
function drawMS(){const Z=$('#msZ').value.split(/[,\s]+/).filter(s=>s!=='').map(Number).filter(v=>!isNaN(v)),n=Z.length;if(n<2){$('#msCalc').textContent='need at least two segments';return}
  const mu=Z.reduce((a,b)=>a+b,0)/n,v=Z.reduce((a,z)=>a+(z-mu)**2,0)/(n-1),sd=Math.sqrt(v),W=sd?mu/(sd/Math.sqrt(n)):0,p2=2*(1-Phi(Math.abs(W)));
  $('#msCalc').textContent=`n = ${n} segments${n<=12?`, Z = {${Z.join(', ')}}`:''}\nμ̂_z = ΣZ/n = ${f3(mu)}\nσ_z² = Σ(Z − μ̂)²/(n − 1) = ${f3(v)}   σ_z = ${f3(sd)}\nW = μ̂_z / (σ_z/√n) = ${f3(mu)} / ${f3(sd/Math.sqrt(n))} = ${f3(W)}\ntwo-tailed p = 2·P(Z ≥ |W|) = ${f3(p2)}  → ${p2<=0.05?'reject H0: the systems differ':'cannot reject H0 (no significant difference)'}`+(n<=50?'\n(warning: the normal approximation needs n > 50)':'')+(mu>0?'\nμ̂ > 0: system A makes more errors':mu<0?'\nμ̂ < 0: system B makes more errors':'')}
$('#msZ').addEventListener('input',drawMS);$('#msR').addEventListener('click',()=>{const R=rng(Date.now()%9999),z=[];for(let i=0;i<60;i++){const u=R();z.push(u<.2?1:u<.35?2:u<.6?0:u<.85?-1:-2)}$('#msZ').value=z.join(', ');drawMS()});drawMS();

/* ---------- glossary ---------- */
const GL=[['التعرّف الآلي على الكلام','automatic speech recognition (ASR)','تحويل الموجة الصوتية إلى نص.'],['كلام مقروء / محادثة','read / conversational speech','الأول أسهل في التعرّف بكثير.'],['معدل خطأ الكلمات','word error rate (WER)','(S + I + D) ÷ كلمات المرجع.'],['معدل خطأ الحروف','character error rate (CER)','مثله بالحروف (للصينية مثلاً).'],['الشبكة الالتفافية','convolutional neural network (CNN)','نواة صغيرة تنزلق عبر المدخل.'],['النواة','kernel / filter','متجه أوزان صغير يُضرب نقطياً في كل موضع.'],['الارتباط المتقاطع','cross-correlation','الالتفاف دون قلب النواة.'],['الحشو','padding','أصفار في طرفي الإشارة.'],['المجال الاستقبالي','receptive field','عدد الإطارات التي تراها النواة.'],['العمق','depth','عدد قنوات المدخل في النواة.'],['الخطوة','stride','مقدار تحريك النواة؛ ٢ تنصّف الطول.'],['AED / LAS','attention-based encoder-decoder / Listen Attend and Spell','المرمِّز-المفكِّك للكلام.'],['Whisper / OWSM','Whisper / Open Whisper-style Speech Model','مرمِّز-مفكِّك متعدد المهام ونظيره المفتوح.'],['معدل إطارات منخفض','low frame rate','لصق ٣ إطارات في واحد.'],['قائمة أفضل n','n-best list','الشعاع النهائي من الفرضيات.'],['إعادة التقييم','rescoring','مزج درجة نموذج لغوي مع درجة الفرضية.'],['ذاتي الإشراف','self-supervised (SSL)','تدريب مسبق على صوت دون نصوص.'],['HuBERT / wav2vec 2.0','HuBERT / wav2vec 2.0','نماذج كلام بالإخفاء والتنبؤ بوحدات.'],['k-means','k-means clustering','تجميع المتجهات في k مجموعة بالإسناد وإعادة التقدير.'],['المركز / كلمة الرمز','centroid / codeword','متوسط المجموعة الذي يمثّلها.'],['كتاب الرموز','codebook','مجموعة كلمات الرمز.'],['CTC','connectionist temporal classification','حرف لكل إطار ثم طي.'],['المحاذاة','alignment','سلسلة الرموز المقابلة للإطارات.'],['الفراغ','blank ␣','رمز «لا حرف» في CTC.'],['دالة الطي','collapsing function B','دمج المتكرر ثم حذف الفراغ.'],['البث','streaming','التعرّف أثناء الكلام.'],['RNN-T','RNN-Transducer','CTC + متنبئ لغوي + شبكة مشتركة.'],['sclite','sclite','أداة NIST لحساب WER.'],['تطبيع النص','text normalization','توحيد الصيغ قبل التقييم.'],['MAPSSWE','matched-pair sentence segment word error','اختبار دلالة لفروق WER.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
