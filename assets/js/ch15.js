/* Chapter 15 · Phonetics and Speech Feature Extraction — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2),r1=v=>(+v).toFixed(1);
const fmt=n=>Math.round(n).toLocaleString('en-US');
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s15-1','15.1','الأصوات والكتابة الصوتية'],['s15-2','15.2','الصوتيات النطقية'],['s15-3','15.3','التنغيم'],['s15-4','15.4','الموجات والطيف'],['s15-5','15.5','طيف ميل اللوغاريتمي'],['s15-6','15.6','MFCC'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

function plot(el,o){
  const W=o.W||560,H=o.H||220,L=o.L||46,R=14,T=16,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(Math.max(o.ymin,Math.min(o.ymax,v))-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img">`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${o.xf?o.xf(v):v}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">${o.xl}</text>`;
  (o.rects||[]).forEach(r=>{s+=`<rect x="${x(r.x0)}" y="${T}" width="${x(r.x1)-x(r.x0)}" height="${H-B-T}" fill="${r.c}" opacity="${r.o||0.12}"/>`});
  (o.lines||[]).forEach(p=>{s+=`<path d="${p.pts.map((q,i)=>(i?'L':'M')+x(q[0]).toFixed(1)+' '+y(q[1]).toFixed(1)).join('')}" fill="none" stroke="${p.c}" stroke-width="${p.w||2}" ${p.dash?'stroke-dasharray="5 4"':''} ${p.op?`opacity="${p.op}"`:''}/>`});
  (o.pts||[]).forEach(p=>{s+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||3.5}" fill="${p.c}"/>${p.t?`<text x="${x(p.x)+(p.dx??6)}" y="${y(p.y)+(p.dy??-6)}" style="fill:${p.c}">${p.t}</text>`:''}`});
  (o.leg||[]).forEach((g,i)=>{s+=`<rect x="${L+8}" y="${T+4+i*16}" width="12" height="4" fill="${g[1]}"/><text x="${L+26}" y="${T+10+i*16}" style="fill:${g[1]}">${g[0]}</text>`});
  el.innerHTML=s+'</svg>';
}

/* ---------- 15.1 ARPAbet table ---------- */
const APC=[['p','p','parsley','p aa r s l iy'],['t','t','tea','t iy'],['k','k','cook','k uh k'],['b','b','bay','b ey'],['d','d','dill','d ih l'],['g','g','garlic','g aa r l ix k'],['m','m','mint','m ih n t'],['n','n','nutmeg','n ah t m eh g'],['ng','ŋ','baking','b ey k ix ng'],['f','f','flour','f l aw axr'],['v','v','clove','k l ow v'],['th','θ','thick','th ih k'],['dh','ð','those','dh ow z'],['s','s','soup','s uw p'],['z','z','eggs','eh g z'],['sh','ʃ','squash','s k w aa sh'],['zh','ʒ','ambrosia','ae m b r ow zh ax'],['ch','tʃ','cherry','ch eh r iy'],['jh','dʒ','jar','jh aa r'],['l','l','licorice','l ih k axr ix sh'],['w','w','kiwi','k iy w iy'],['r','r','rice','r ay s'],['y','j','yellow','y eh l ow'],['h','h','honey','h ah n iy']];
const APV=[['iy','i','lily','l ih l iy'],['ih','ɪ','lily','l ih l iy'],['ey','eɪ','daisy','d ey z iy'],['eh','ɛ','pen','p eh n'],['ae','æ','aster','ae s t axr'],['aa','ɑ','poppy','p aa p iy'],['ao','ɔ','orchid','ao r k ix d'],['uh','ʊ','wood','w uh d'],['ow','oʊ','lotus','l ow dx ax s'],['uw','u','tulip','t uw l ix p'],['ah','ʌ','butter','b ah dx axr'],['er','ɝ','bird','b er d'],['ay','aɪ','iris','ay r ix s'],['aw','aʊ','flower','f l aw axr'],['oy','ɔɪ','soil','s oy l'],['ax','ə','pita','p iy t ax']];
/* place, manner, voiced for consonants (incl. q, dx) */
const CI={p:['bilabial','stop',0],b:['bilabial','stop',1],m:['bilabial','nasal',1],w:['bilabial','approximant',1],f:['labiodental','fricative',0],v:['labiodental','fricative',1],th:['dental','fricative',0],dh:['dental','fricative',1],t:['alveolar','stop',0],d:['alveolar','stop',1],n:['alveolar','nasal',1],s:['alveolar','fricative',0],z:['alveolar','fricative',1],r:['alveolar','approximant',1],l:['alveolar','lateral',1],dx:['alveolar','tap',1],sh:['palatal','fricative',0],zh:['palatal','fricative',1],ch:['palatal','affricate',0],jh:['palatal','affricate',1],y:['palatal','approximant',1],k:['velar','stop',0],g:['velar','stop',1],ng:['velar','nasal',1],q:['glottal','stop',0],h:['glottal','fricative',0]};
const VI={iy:'high front',ih:'high front (lower than iy)',ey:'mid front, diphthong',eh:'mid front',ae:'low front',aa:'low back',ao:'mid-low back, rounded',uh:'high back',ow:'mid back, rounded diphthong',uw:'high back, rounded',ah:'mid central/back',er:'mid central, r-coloured',ay:'diphthong (low → high front)',aw:'diphthong (low → high back)',oy:'diphthong (back rounded → high front)',ax:'reduced (schwa), central'};
let apSel=0;
function drawAP(){const v=segVal('#apM','m')==='v',D=v?APV:APC;if(apSel>=D.length)apSel=0;
  $('#apTab').innerHTML='<tr><th>ARPAbet</th><th>IPA</th><th>word</th><th>transcription</th></tr>'+D.map((r,i)=>`<tr data-i="${i}" style="cursor:pointer;${i===apSel?'background:var(--green-soft)':''}"><td class="mono">[${r[0]}]</td><td>[${r[1]}]</td><td>${r[2]}</td><td class="mono">[${r[3].split(' ').map(p=>p===r[0]?`<b style="color:var(--rose)">${p}</b>`:p).join(' ')}]</td></tr>`).join('');
  $$('#apTab tr[data-i]').forEach(tr=>tr.addEventListener('click',()=>{apSel=+tr.dataset.i;drawAP()}));
  const r=D[apSel];
  $('#apCalc').textContent=v?`[${r[0]}] = IPA [${r[1]}] as in “${r[2]}”: ${VI[r[0]]}`:`[${r[0]}] = IPA [${r[1]}] as in “${r[2]}”: ${CI[r[0]][2]?'voiced':'voiceless'} ${CI[r[0]][0]} ${CI[r[0]][1]}`+`\n${D.length} ${v?'vowels':'consonants'} in the table (click a row)`}
segOn('#apM',()=>{apSel=0;drawAP()});drawAP();

/* ---------- consonant grid ---------- */
const PL=['bilabial','labiodental','dental','alveolar','palatal','velar','glottal'],MN=['stop','nasal','fricative','affricate','approximant','lateral','tap'];
const MNX={stop:'airflow completely blocked, then released (closure + release); also “plosive”',nasal:'velum lowered, air flows through the nose',fricative:'narrowed, turbulent “hissing” airflow',affricate:'a stop followed immediately by a fricative',approximant:'articulators close, but not close enough for turbulence',lateral:'tongue tip up, sides lowered so air flows over them',tap:'one quick flick of the tongue against the alveolar ridge'};
let cnSel='s';
function drawCN(){$('#cnTab').innerHTML='<tr><th></th>'+PL.map(p=>`<th>${p}</th>`).join('')+'</tr>'+MN.map(m=>`<tr><th>${m}</th>`+PL.map(p=>`<td>`+Object.entries(CI).filter(([k,v])=>v[0]===p&&v[1]===m).sort((a,b)=>a[1][2]-b[1][2]).map(([k,v])=>`<button class="cnb${k===cnSel?' on':''}" data-k="${k}" style="color:${v[2]?'var(--green)':'var(--rose)'}">${k}</button>`).join('')+'</td>').join('')+'</tr>').join('');
  $$('#cnTab .cnb').forEach(b=>b.addEventListener('click',()=>{cnSel=b.dataset.k;drawCN()}));
  const [p,m,v]=CI[cnSel],ex=APC.find(r=>r[0]===cnSel),pair=Object.entries(CI).find(([k,x])=>x[0]===p&&x[1]===m&&x[2]!==v);
  $('#cnCalc').textContent=`[${cnSel}]: ${v?'voiced':'voiceless'} ${p} ${m}${ex?`  (as in “${ex[2]}”)`:cnSel==='q'?'  (glottal stop, e.g. the [t] of “suit” in Fig. 15.2)':cnSel==='dx'?'  (the middle of “lotus” [l ow dx ax s])':''}\nmanner: ${MNX[m]}`+(pair?`\nsame place and manner, opposite voicing: [${pair[0]}]`:'')+(cnSel==='w'?'\n([w] also raises the back of the tongue toward the velum: labio-velar)':'')}
drawCN();

/* ---------- syllable tree ---------- */
const SY={ham:[['h'],['ae'],['m']],green:[['g','r'],['iy'],['n']],eggs:[[],['eh'],['g','z']],strike:[['s','t','r'],['ay'],['k']],dog:[['d'],['aa'],['g']]};
function drawSY(){const w=segVal('#syW','w'),[on,nu,co]=SY[w],W=420,H=200;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:440px">`;
  const node=(x,y,t,c='var(--ink)')=>`<text x="${x}" y="${y}" font-size="14" text-anchor="middle" fill="${c}" font-family="Noto Sans">${t}</text>`,ln=(a,b,c,d)=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="var(--soft)" stroke-width="1.3"/>`;
  s+=node(210,22,'σ','var(--math)');const hasOn=on.length>0;const xO=110,xR=hasOn?280:210,xN=xR-60,xC=xR+60;
  if(hasOn){s+=ln(210,28,xO,55)+node(xO,70,'Onset','var(--amber)');on.forEach((p,i)=>{const x=xO+(i-(on.length-1)/2)*40;s+=ln(xO,76,x,150)+node(x,170,p)})}
  s+=ln(210,28,xR,55)+node(xR,70,'Rime','var(--green)')+ln(xR,76,xN,100)+node(xN,115,'Nucleus','var(--green)')+ln(xR,76,xC,100)+node(xC,115,'Coda','var(--rose)');
  nu.forEach(p=>{s+=ln(xN,121,xN,150)+node(xN,170,p)});co.forEach((p,i)=>{const x=xC+(i-(co.length-1)/2)*36;s+=ln(xC,121,x,150)+node(x,170,p)});
  s+=`<text x="8" y="${H-6}" font-size="11" fill="var(--soft)" font-family="Noto Sans">${w} = [${[...on,...nu,...co].join(' ')}]${on.length>1?'  (complex onset)':''}${!on.length?'  (no onset)':''}</text>`;
  $('#sySvg').innerHTML=s+'</svg>'}
segOn('#syW',drawSY);drawSY();

/* ---------- tune ---------- */
const TW=['You','know','what','I','mean'];
function drawTN(){const m=segVal('#tnM','m'),base=[180,175,170,168,0];const end={q:[165,190,240],s:[160,140,115],c:[160,150,175]}[m];
  const pts=[];for(let i=0;i<4;i++){pts.push([i,base[i]]);pts.push([i+0.5,base[i]-3])}pts.push([4,end[0]],[4.4,end[1]],[4.8,end[2]]);
  plot($('#tnPlot'),{xmin:-0.2,xmax:5,ymin:100,ymax:260,yt:[100,150,200,250],xt:[0,1,2,3,4],xf:v=>TW[v],lines:[{pts,c:m==='q'?'var(--rose)':m==='s'?'var(--math)':'var(--amber)',w:3}],H:200});
  $('#tnCalc').textContent={q:'H-H% “question rise”: F0 rises on the final word → “You know what I mean?”',s:'L-L% “final fall”: F0 drops at the end → “You know what I mean.” (declarative)',c:'L-H% “continuation rise”: a short rise that signals “more is coming”, e.g. after each item in a list'}[m]+'\n(F0 in Hz on the vertical axis; the curve is illustrative, not a measurement)'}
segOn('#tnM',drawTN);drawTN();

/* ---------- sine ---------- */
function drawSN(){const A=+$('#snA').value,f=+$('#snF').value;$('#snAo').textContent=r1(A);$('#snFo').textContent=f;
  const pts=[];for(let i=0;i<=600;i++){const t=i/1200;pts.push([t,A*Math.sin(2*Math.PI*f*t)])}
  plot($('#snPlot'),{xmin:0,xmax:0.5,ymin:-1.1,ymax:1.1,xt:[0,0.1,0.2,0.3,0.4,0.5],yt:[-1,0,1],xl:'time (s)',lines:[{pts,c:'var(--green)'}],H:190,
    rects:f<=10?[{x0:0,x1:1/f,c:'var(--amber)',o:0.18}]:[]});
  $('#snCalc').textContent=`y = ${r1(A)} · sin(2π · ${f} · t)\nfrequency f = ${f} Hz → ${f*0.5} cycles in the 0.5 s window\nperiod T = 1/f = ${f3(1/f)} s${f<=10?'   (one period shaded)':''}\namplitude A = ${r1(A)} (the maximum value)`}
['#snA','#snF'].forEach(s=>$(s).addEventListener('input',drawSN));drawSN();

/* ---------- Nyquist / aliasing ---------- */
function drawNQ(){const f=+$('#nqF').value,fs=+segVal('#nqS','s');$('#nqFo').textContent=f;const ny=fs/2,fa=Math.abs(f-fs*Math.round(f/fs)),Tw=0.004;
  const tr=[],al=[],sp=[];for(let i=0;i<=800;i++){const t=i/800*Tw;tr.push([t*1000,Math.cos(2*Math.PI*f*t)]);al.push([t*1000,Math.cos(2*Math.PI*fa*t)])}
  for(let n=0;n/fs<=Tw+1e-9;n++){const t=n/fs;sp.push({x:t*1000,y:Math.cos(2*Math.PI*f*t),c:'var(--rose)',r:3.5})}
  plot($('#nqPlot'),{xmin:0,xmax:4,ymin:-1.15,ymax:1.15,xt:[0,1,2,3,4],yt:[-1,0,1],xl:'time (ms)',H:200,lines:[{pts:tr,c:'var(--soft)',w:1,op:0.6},{pts:al,c:'var(--green)',w:2.2}],pts:sp});
  $('#nqCalc').textContent=`sampling rate ${fs} Hz → ${fs/1000} samples per ms, Nyquist frequency = ${ny} Hz\nwave ${f} Hz: ${r2(fs/f)} samples per cycle`+(f<ny?`  ≥ 2 ✓  the samples capture ${f} Hz`:f===ny?'  = 2: exactly at the limit':`  < 2 ✗  the samples look like a ${fa} Hz wave (“aliasing”)`)+`\n(telephone: 8 kHz → nothing above 4000 Hz; microphone speech: 16 kHz → up to 8000 Hz)`}
$('#nqF').addEventListener('input',drawNQ);segOn('#nqS',drawNQ);drawNQ();

/* ---------- mu-law ---------- */
function drawMU(){const x=+$('#muX').value;$('#muXo').textContent=f3(x);const mu=255,sg=Math.sign(x)||1;
  const ql=Math.round(x*127)/127,F=sg*Math.log(1+mu*Math.abs(x))/Math.log(1+mu),qF=Math.round(F*127)/127,dec=Math.sign(qF)*(Math.pow(1+mu,Math.abs(qF))-1)/mu;
  const el=Math.abs(ql-x),em=Math.abs(dec-x);
  $('#muCalc').textContent=`linear 8-bit: round(${f3(x)} × 127) = ${Math.round(x*127)} → decoded ${f3(ql)}   error ${el.toFixed(4)}${x?` (${(el/Math.abs(x)*100).toFixed(1)}% of |x|)`:''}\nµ-law: F(x) = sgn(x)·log(1 + 255·|x|)/log(256) = ${f3(F)}\n        round(F × 127) = ${Math.round(F*127)} → decoded ${f3(dec)}   error ${em.toFixed(4)}${x?` (${(em/Math.abs(x)*100).toFixed(1)}% of |x|)`:''}\n`+(Math.abs(x)<0.1?'→ quiet sample: µ-law is far more precise, like the ear':'→ loud sample: µ-law is less precise, but the ear barely notices differences at high levels')}
$('#muX').addEventListener('input',drawMU);drawMU();

/* ---------- F0 from cycles ---------- */
function drawF0(){const m=segVal('#f0M','m');
  $('#f0Calc').textContent=m==='iy'?`Fig 15.11: the wave repeats 10 times in 0.03875 s\nF0 = 10 / 0.03875 = ${r1(10/0.03875)} Hz  (book: 258 Hz)\none period T = 1/F0 = ${(0.03875/10*1000).toFixed(2)} ms: one opening of the vocal folds`:
    `Fig 15.19 [ae]: big wave repeats 10 times in 0.0427 s → 10/0.0427 = ${r1(10/0.0427)} Hz  (book: 234 Hz)\n4 small peaks inside each big wave → ≈ 4 × 234 = 936 Hz\n2 tiny waves on many of those → ≈ 2 × 936 = 1872 Hz\nthe DFT spectrum (Fig 15.20) shows peaks at about 930, 1860 and 3020 Hz`}
segOn('#f0M',drawF0);drawF0();

/* ---------- RMS ---------- */
function drawRM(){const A=+$('#rmA').value;$('#rmAo').textContent=A.toFixed(3);const N=1000,xs=[];for(let i=0;i<N;i++)xs.push(A*Math.sin(2*Math.PI*5*i/N));
  const mean=xs.reduce((a,b)=>a+b,0)/N,pw=xs.reduce((a,b)=>a+b*b,0)/N,rms=Math.sqrt(pw),P0=2e-5;
  $('#rmCalc').textContent=`${N} samples of a sine, amplitude ${A.toFixed(3)} Pa\nplain mean = ${Math.abs(mean)<1e-12?'0.000000':mean.toExponential(2)}   (positives and negatives cancel)\npower = (1/N) Σ x² = ${pw.toExponential(3)}   (= A²/2)\nRMS = √power = ${rms.toFixed(5)} Pa   (= A/√2 = ${(A/Math.SQRT2).toFixed(5)})\nintensity = 10·log₁₀(power / P₀²) = ${r1(10*Math.log10(pw/(P0*P0)))} dB   (P₀ = 2×10⁻⁵ Pa)\ndouble the amplitude → +${r1(20*Math.log10(2))} dB`}
$('#rmA').addEventListener('input',drawRM);drawRM();

/* ---------- mel ---------- */
const mel=f=>1127*Math.log(1+f/700),imel=m=>700*(Math.exp(m/1127)-1);
function drawML(){const f=+$('#mlF').value;$('#mlFo').textContent=f;const pts=[];for(let h=0;h<=8000;h+=100)pts.push([h,mel(h)]);
  plot($('#mlPlot'),{xmin:0,xmax:8000,ymin:0,ymax:3000,xt:[0,1000,2000,4000,6000,8000],yt:[0,1000,2000,3000],xl:'Hz',H:200,lines:[{pts,c:'var(--math)'},{pts:[[0,0],[3000,3000]],c:'var(--soft)',dash:1,w:1}],pts:[{x:f,y:mel(f),c:'var(--rose)',t:`${Math.round(mel(f))} mel`}]});
  $('#mlCalc').textContent=`mel(${f}) = 1127 · ln(1 + ${f}/700) = ${r1(mel(f))}\nadding 100 Hz here adds ${r1(mel(f+100)-mel(f))} mel\ncompare: 100→200 Hz = ${r1(mel(200)-mel(100))} mel,  7000→7100 Hz = ${r1(mel(7100)-mel(7000))} mel\n(mel(1000) ≈ 1000 by design; the dashed line is mel = Hz)`}
$('#mlF').addEventListener('input',drawML);drawML();

/* ---------- waveform types ---------- */
function drawWV(){const m=segVal('#wvM','m'),R=rng(11),pts=[],ms=20,fs=16000,N=ms*fs/1000;
  for(let n=0;n<N;n++){const t=n/fs;let v=0;
    if(m==='v'){const ph=(t*250)%1;v=Math.exp(-ph*6)*(Math.sin(2*Math.PI*2400*t)*0.4+Math.sin(2*Math.PI*270*t)*0.6+Math.sin(2*Math.PI*540*t)*0.3)}
    else if(m==='f'){v=(R()-.5)*0.9*(0.6+0.4*Math.sin(2*Math.PI*30*t))}
    else{if(t<0.008)v=(R()-.5)*0.02;else if(t<0.010)v=(R()-.5)*0.9*Math.exp(-(t-0.008)*800);else{const ph=(t*230)%1;v=Math.exp(-ph*5)*Math.sin(2*Math.PI*690*t)*Math.min(1,(t-0.010)*200)*0.8}}
    pts.push([t*1000,v])}
  plot($('#wvPlot'),{xmin:0,xmax:20,ymin:-1,ymax:1,xt:[0,5,10,15,20],yt:[-1,0,1],xl:'time (ms)',H:180,lines:[{pts,c:m==='v'?'var(--green)':m==='f'?'var(--rose)':'var(--math)',w:1.2}]});
  $('#wvCalc').textContent={v:'vowel: regular repeating peaks, one per opening of the vocal folds (here F0 = 250 Hz → a peak every 4 ms); loud and long',f:'fricative [sh]: noisy, irregular, no repeating pattern: turbulent air through a narrow channel',s:'stop [b]: closure (near silence) → short burst at the release → voicing of the following vowel'}[m]}
segOn('#wvM',drawWV);drawWV();

/* ---------- Fourier: sum of two sines + DFT ---------- */
function dft(x,K){const N=x.length,out=[];for(let k=0;k<K;k++){let re=0,im=0;for(let n=0;n<N;n++){const a=2*Math.PI*k*n/N;re+=x[n]*Math.cos(a);im-=x[n]*Math.sin(a)}out.push(Math.hypot(re,im))}return out}
function drawFT(){const f2=+$('#ftF2').value,a2=+$('#ftA2').value;$('#ftF2o').textContent=f2;$('#ftA2o').textContent=r1(a2);
  const fs=1000,N=500,x=[];for(let n=0;n<N;n++){const t=n/fs;x.push(Math.sin(2*Math.PI*10*t)+a2*Math.sin(2*Math.PI*f2*t))}
  plot($('#ftWave'),{xmin:0,xmax:0.5,ymin:-2.1,ymax:2.1,xt:[0,0.1,0.2,0.3,0.4,0.5],yt:[-2,0,2],xl:'time (s)',H:170,lines:[{pts:x.map((v,n)=>[n/fs,v]),c:'var(--green)',w:1.2}]});
  const X=dft(x,251),amp=X.map(v=>2*v/N);
  plot($('#ftSpec'),{xmin:0,xmax:250,ymin:0,ymax:1.15,xt:[0,50,100,150,200,250],yt:[0,0.5,1],xl:'frequency (Hz)',H:170,lines:amp.map((a,k)=>({pts:[[k*fs/N,0],[k*fs/N,a]],c:'var(--math)',w:2}))});
  const pk=amp.map((a,k)=>[k*fs/N,a]).filter(p=>p[1]>0.05).map(p=>`${p[0]} Hz (amplitude ${r2(p[1])})`);
  $('#ftCalc').textContent=`waveform = sin(2π·10·t) + ${r1(a2)}·sin(2π·${f2}·t), sampled at ${fs} Hz for 0.5 s (N = ${N})\nDFT: |X[k]| for k = 0..250, each bin k ↔ k·${fs}/${N} = ${2*1} Hz steps\npeaks found: ${pk.join(', ')||'—'}\nthe spectrum recovers exactly the waves we added`}
['#ftF2','#ftA2'].forEach(s=>$(s).addEventListener('input',drawFT));drawFT();

/* ---------- vowel space F1 x F2 ---------- */
(function(){const V=[['iy','tea (Fig 15.24)',268,2416,'var(--green)'],['ae','cat (Fig 15.24)',903,1695,'var(--rose)'],['uw','moo (Fig 15.24)',295,817,'var(--math)'],['iy','she (Fig 15.23)',540,2581,'var(--green)'],['ae','had (Fig 15.20)',930,1860,'var(--rose)'],['ih','Fig 15.21 (F1 only)',470,null,'var(--amber)']];
  const W=560,H=280,L=50,R=20,T=20,B=34,x=f2=>L+(3000-f2)/(3000-500)*(W-L-R),y=f1=>T+(f1-150)/(1050-150)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img">`;
  [500,1000,1500,2000,2500,3000].forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${v}</text>`});
  [200,400,600,800,1000].forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">← F2 (Hz): front … back →</text><text x="${L}" y="${T-6}">F1 (Hz) ↓ = lower tongue</text>`;
  V.forEach(([p,w,f1,f2,c],i)=>{if(f2===null){s+=`<line x1="${L}" x2="${W-R}" y1="${y(f1)}" y2="${y(f1)}" stroke="${c}" stroke-dasharray="4 4"/><text x="${W-R-4}" y="${y(f1)-4}" text-anchor="end" style="fill:${c}">[${p}] F1 ≈ ${f1}</text>`;return}
    s+=`<circle cx="${x(f2)}" cy="${y(f1)}" r="${i<3?6:4}" fill="${i<3?c:'none'}" stroke="${c}" stroke-width="2"/><text x="${f2<1200?x(f2)-9:x(f2)+9}" y="${y(f1)+(i===3?14:i===4?16:4)}" style="fill:${c}" ${f2<1200?'text-anchor="end"':''}>[${p}] ${w}</text>`});
  $('#vsPlot').innerHTML=s+'</svg>';
  $('#vsCalc').textContent='[iy] (high front): low F1, high F2  → top-left\n[ae] (low front):  high F1, mid F2  → bottom\n[uw] (high back):  low F1, low F2   → top-right\nF1 goes up as the tongue goes down; F2 goes up as the tongue moves forward\nthe two [iy]s differ (268 vs 540 Hz F1): different speakers and contexts'})();

/* ---------- source-filter ---------- */
const SF={iy:[268,2416],ae:[903,1695],uw:[295,817]};
function drawSF(){const v=segVal('#sfV','v'),F0=+$('#sfF').value;$('#sfFo').textContent=F0;const [F1,F2]=SF[v],F3=2900,bw=110;
  const Hf=f=>1/(1+((f-F1)/bw)**2)+0.8/(1+((f-F2)/bw)**2)+0.5/(1+((f-F3)/(bw*1.5))**2)+0.02;
  const env=[];for(let f=0;f<=4000;f+=20)env.push([f,20*Math.log10(Hf(f))]);
  const harm=[];for(let k=1;k*F0<=4000;k++){const f=k*F0;harm.push([f,20*Math.log10(Hf(f)/Math.sqrt(k))])}
  plot($('#sfPlot'),{xmin:0,xmax:4000,ymin:-50,ymax:5,xt:[0,1000,2000,3000,4000],yt:[-40,-20,0],xl:'Hz',H:200,
    lines:[...harm.map(h=>({pts:[[h[0],-50],[h[0],h[1]]],c:'var(--math)',w:1.6})),{pts:env,c:'var(--rose)',dash:1,w:1.5}],
    pts:[{x:F1,y:3,c:'var(--rose)',t:'F1',r:0.1},{x:F2,y:3,c:'var(--rose)',t:'F2',r:0.1}]});
  const near=F=>{const k=Math.max(1,Math.round(F/F0));return `harmonic ${k} (${k*F0} Hz)`};
  $('#sfCalc').textContent=`source: glottal pulses at F0 = ${F0} Hz → harmonics at ${F0}, ${2*F0}, ${3*F0}, … Hz (${harm.length} below 4 kHz), each weaker than the last\nfilter [${v}]: resonances at F1 = ${F1} Hz and F2 = ${F2} Hz (dashed = filter shape; F3 ≈ 2900 Hz is our assumption)\noutput: the harmonics nearest the resonances are amplified: ${near(F1)} for F1, ${near(F2)} for F2\nchange F0: the harmonics move, but the formant peaks stay → the vowel identity stays`}
segOn('#sfV',drawSF);$('#sfF').addEventListener('input',drawSF);drawSF();

/* ---------- pipeline ---------- */
const PP=[['waveform','analog air pressure → microphone voltage'],['sample + quantize','1 s at 16 kHz → x[n]: 16,000 integers (16-bit)'],['window','25 ms Hamming windows every 10 ms → 98 frames × 400 samples'],['DFT / FFT','pad each frame to 512 → 257 frequency bins (0–8000 Hz, 31.25 Hz apart)'],['mel filter bank','80 triangular filters → 98 frames × 80 mel energies'],['log','log of each energy → log mel spectrum (98 × 80)'],['normalize','scale to −1…1 with zero mean → input to the neural network (Ch. 16)']];let ppI=2;
function drawPP(){$('#ppBtns').innerHTML=PP.map((p,i)=>`<button class="btn${i===ppI?' pri':''}" data-i="${i}" dir="ltr">${i+1}. ${p[0]}</button>`).join('');
  $$('#ppBtns button').forEach(b=>b.addEventListener('click',()=>{ppI=+b.dataset.i;drawPP()}));
  $('#ppCalc').textContent=PP.slice(0,ppI+1).map((p,i)=>`${i===ppI?'▶':' '} ${i+1}. ${p[0].padEnd(18)} ${p[1]}`).join('\n')+'\n(numbers for 1 second of 16 kHz audio with 80 channels)'}
drawPP();

/* ---------- windowing ---------- */
function drawWN(){const m=segVal('#wnM','m'),D=+$('#wnD').value;$('#wnDo').textContent=D;const L=400,fs=16000;
  const w=n=>m==='ham'?0.54-0.46*Math.cos(2*Math.PI*n/L):1;const sig=[],win=[],out=[];
  for(let n=0;n<L;n++){const t=n/fs*1000,s=Math.sin(2*Math.PI*200*n/fs+0.7)*0.9;sig.push([t,s]);win.push([t,w(n)]);out.push([t,s*w(n)])}
  plot($('#wnPlot'),{xmin:0,xmax:25,ymin:-1.05,ymax:1.1,xt:[0,5,10,15,20,25],yt:[-1,0,1],xl:'ms within one frame',H:200,lines:[{pts:sig,c:'var(--soft)',w:1,op:0.6},{pts:win,c:'var(--amber)',dash:1,w:1.6},{pts:out,c:'var(--green)'}],
    leg:[['signal s[n]','var(--soft)'],['window w[n]','var(--amber)'],['y[n] = w[n]·s[n]','var(--green)']]});
  const fr=D>=25?Math.floor((D-25)/10)+1:0;
  $('#wnCalc').textContent=`${m==='ham'?'Hamming: w[0] = 0.54 − 0.46·cos 0 = 0.08, w[L/2] = 0.54 + 0.46 = 1.00 → the edges fade to near zero':'rectangular: w[n] = 1 → the frame is cut abruptly at both edges (bad for the DFT)'}\nat 16 kHz: window 25 ms = ${L} samples, stride 10 ms = 160 samples (frames overlap by 15 ms)\n${D} ms of speech → ⌊(${D} − 25)/10⌋ + 1 = ${fr} frames`}
segOn('#wnM',drawWN);$('#wnD').addEventListener('input',drawWN);drawWN();

/* ---------- mel filter bank ---------- */
function drawFB(){const M=+$('#fbM').value;$('#fbMo').textContent=M;const mmax=mel(8000),c=[];for(let i=0;i<=M+1;i++)c.push(imel(mmax*i/(M+1)));
  const lines=[];for(let i=1;i<=M;i++)lines.push({pts:[[c[i-1],0],[c[i],1],[c[i+1],0]],c:i%2?'var(--math)':'var(--green)',w:1.6});
  plot($('#fbPlot'),{xmin:0,xmax:8000,ymin:0,ymax:1.1,xt:[0,1000,2000,4000,6000,8000],yt:[0,0.5,1],xl:'Hz',H:180,lines});
  $('#fbCalc').textContent=`${M} triangles with centres equally spaced on the mel scale (0 … ${Math.round(mmax)} mel)\nfirst filter: ${Math.round(c[0])}–${Math.round(c[2])} Hz (width ${Math.round(c[2]-c[0])} Hz)\nlast filter:  ${Math.round(c[M-1])}–${Math.round(c[M+1])} Hz (width ${Math.round(c[M+1]-c[M-1])} Hz)\n→ fine resolution at low frequencies, coarse at high ones; each filter's output is one channel`}
$('#fbM').addEventListener('input',drawFB);drawFB();

/* ---------- MFCC grid ---------- */
(function(){const G=[['cepstral c1–c12','var(--math)',12],['energy','var(--amber)',1],['Δ cepstral','var(--math)',12],['Δ energy','var(--amber)',1],['ΔΔ cepstral','var(--math)',12],['ΔΔ energy','var(--amber)',1]];
  let s='<div style="display:flex;flex-wrap:wrap;gap:2px;direction:ltr">',k=0;G.forEach(([n,c,m],g)=>{for(let i=0;i<m;i++){k++;s+=`<span title="${n}" style="width:13px;height:22px;border-radius:3px;background:${c};opacity:${g<2?1:g<4?0.65:0.38}"></span>`}});
  $('#mfGrid').innerHTML=s+'</div>';
  $('#mfCalc').textContent=G.map(([n,,m])=>`${String(m).padStart(2)}  ${n}`).join('\n')+`\n──\n${k}  total (dark = static, medium = Δ velocity, light = ΔΔ acceleration)`})();

/* ---------- cepstrum (synthetic) ---------- */
function drawCP(){const m=segVal('#cpM','m'),N=256,fmax=4000,df=fmax/N,F0=125,per=F0/df;
  const env=k=>{const f=k*df;return 2.2*Math.exp(-(((f-500)/220)**2))+1.6*Math.exp(-(((f-1500)/260)**2))+1.0*Math.exp(-(((f-2500)/300)**2))-0.4*f/4000},src=k=>0.45*Math.cos(2*Math.PI*k/per);
  const ls=[];for(let k=0;k<N;k++)ls.push(m==='env'?env(k):m==='src'?src(k):env(k)+src(k));
  plot($('#cpPlot'),{xmin:0,xmax:4000,ymin:-1,ymax:3,xt:[0,1000,2000,3000,4000],yt:[-1,0,1,2,3],xl:'Hz (pretend it is time)',H:170,lines:[{pts:ls.map((v,k)=>[k*df,v]),c:m==='src'?'var(--rose)':m==='env'?'var(--math)':'var(--green)',w:1.5}]});
  const C=dft(ls,64).map(v=>v/N);
  plot($('#cpCep'),{xmin:0,xmax:64,ymin:0,ymax:Math.max(0.35,...C.slice(1))*1.1,xt:[0,8,16,24,32,40,48,56,64],yt:[0],xl:'quefrency (cepstral index)',H:150,rects:[{x0:0.5,x1:12.5,c:'var(--math)',o:0.13}],lines:C.map((a,n)=>({pts:[[n,0],[n,a]],c:n>=1&&n<=12?'var(--math)':n===Math.round(N/per)?'var(--rose)':'var(--soft)',w:2.4}))});
  const pk=Math.round(N/per);
  $('#cpCalc').textContent=`upper plot: log spectrum, treated as a signal (${N} points)\nlower plot: its spectrum = the cepstrum (index 0 = overall level, omitted from the scale)\nsource ripple repeats every ${per} bins (= ${F0} Hz harmonic spacing) → cepstral peak at index ${N}/${per} = ${pk}\nslow envelope (formants) → energy only at low indices; shaded = c1…c12 kept for MFCC`+(m==='src'?'\nsource only: the c1…c12 region is empty':m==='env'?'\nfilter only: no peak at 32':'')}
segOn('#cpM',drawCP);drawCP();

/* ---------- deltas ---------- */
(function(){const c=[1,1.2,1.8,2.9,3.4,3.5,3.3,2.6],d=c.map((v,t)=>t?v-c[t-1]:null),dd=d.map((v,t)=>t>1?v-d[t-1]:null);
  plot($('#dlPlot'),{xmin:1,xmax:8,ymin:-1,ymax:3.8,xt:[1,2,3,4,5,6,7,8],yt:[-1,0,1,2,3],xl:'frame',H:190,
    lines:[{pts:c.map((v,i)=>[i+1,v]),c:'var(--math)'},{pts:d.map((v,i)=>[i+1,v]).filter(p=>p[1]!==null),c:'var(--green)'},{pts:dd.map((v,i)=>[i+1,v]).filter(p=>p[1]!==null),c:'var(--rose)',dash:1}],
    leg:[['feature c','var(--math)'],['Δ = c[t] − c[t−1]','var(--green)'],['ΔΔ = Δ[t] − Δ[t−1]','var(--rose)']]});
  $('#dlCalc').textContent=`c  = [${c.map(r1).join(', ')}]\nΔ  = [—, ${d.slice(1).map(r1).join(', ')}]\nΔΔ = [—, —, ${dd.slice(2).map(r1).join(', ')}]\nΔ is largest where c changes fastest (frame 4: a formant transition); ΔΔ turns negative as the change slows`})();

/* ---------- glossary ---------- */
const GL=[['الصوتيات','phonetics','دراسة أصوات الكلام وإنتاجها وتحققها الصوتي.'],['الصوت','phone','وحدة صوتية في كتابة النطق.'],['IPA / ARPAbet','IPA / ARPAbet','أبجديتان صوتيتان: عالمية، وأمريكية بحروف ASCII.'],['قاموس النطق','pronunciation dictionary','نطق كل كلمة بالأصوات (CMU، CELEX).'],['كتابة مؤقّتة','time-aligned transcription','لكل صوت زمن بداية ونهاية (TIMIT).'],['المزمار','glottis','الفراغ بين الوترين الصوتيين.'],['مجهور / مهموس','voiced / unvoiced','باهتزاز الوترين أو دونه.'],['مكان النطق','place of articulation','موضع أقصى تضييق.'],['طريقة النطق','manner of articulation','كيفية التضييق: انفجاري، احتكاكي…'],['انفجاري','stop / plosive','حبس كامل ثم إطلاق.'],['احتكاكي','fricative','تضييق مضطرب «هسيسي».'],['صائت مزدوج','diphthong','صائت يتحرك فيه اللسان.'],['المقطع','syllable','بداية + نواة + قفلة.'],['قيود التتابع','phonotactics','أي الأصوات يتبع بعضها.'],['التنغيم','prosody','F0 والطاقة والمدة للمعنى.'],['النبر اللحني / المعجمي','pitch accent / lexical stress','بروز في الجملة / مقطع منبور في القاموس.'],['شوا','schwa [ax]','أشهر الصوائت المختزلة.'],['ToBI','Tone and Break Indices','نظام كتابة التنغيم بـ H وL.'],['التردد / السعة','frequency / amplitude','دورات في الثانية / أقصى قيمة.'],['تردد نايكويست','Nyquist frequency','نصف معدل العينات: أعلى تردد يمكن قياسه.'],['التكميم','quantization','تمثيل العينة بعدد صحيح.'],['µ-law','µ-law','ضغط لوغاريتمي للعينات.'],['التردد الأساسي','fundamental frequency, F0','سرعة اهتزاز الوترين.'],['RMS / الشدة','RMS / intensity (dB)','متوسط السعة الفعّال / القدرة بالديسيبل.'],['سلّم ميل','mel scale','سلّم ترددات إدراكي: m = 1127 ln(1 + f/700).'],['الطيف','spectrum','مكوّنات التردد وسعاتها.'],['المخطط الطيفي','spectrogram','الطيف عبر الزمن.'],['المكوّن الصوتي','formant','قمة طيفية يضخّمها المجرى الصوتي (F1، F2).'],['المصدر-المرشِّح','source-filter model','نبضات الحنجرة يرشّحها المجرى الصوتي.'],['التوافقية','harmonic','موجة ترددها مضاعف F0.'],['الإطار / الخطوة','frame / stride','نافذة ٢٥ ms / إزاحة ١٠ ms.'],['نافذة هامينغ','Hamming window','نافذة تخفت عند الحدود.'],['DFT / FFT','discrete / fast Fourier transform','حساب الطيف لإشارة معيّنة.'],['بنك مرشِّحات ميل','mel filter bank','مرشِّحات مثلثية على سلّم ميل.'],['القناة','channel','مخرج مرشِّح واحد.'],['طيف ميل اللوغاريتمي','log mel spectrum','الخصائص المعتادة لأنظمة الكلام.'],['MFCC','mel frequency cepstral coefficients','٣٩ ميزة: ١٢ سِبسترم + طاقة، ودلتاها.'],['السِّبسترم','cepstrum','طيف لوغاريتم الطيف.'],['دلتا','delta / double delta','التغير / تغير التغير بين الإطارات.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
