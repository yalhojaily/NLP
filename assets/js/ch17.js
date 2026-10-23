/* Chapter 17 · Text-to-Speech — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2),r1=v=>(+v).toFixed(1);
const fmt=n=>Math.round(n).toLocaleString('en-US');
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s17-1','17.1','نظرة عامة'],['s17-2','17.2','الترميز الصوتي وRVQ'],['s17-3','17.3','VALL-E'],['s17-4','17.4','التقييم: MOS'],['s17-5','17.5','مهام كلام أخرى'],['s17-6','17.6','النماذج المنطوقة (فارغ)'],['ex','','الخلاصة والمسرد']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- 17.2 token rates ---------- */
function drawCR(){const N=+$('#crN').value,D=+$('#crD').value;$('#crNo').textContent=N;$('#crDo').textContent=D;
  const raw=16000*D,enc=75*N*D;
  $('#crCalc').textContent=`raw 16 kHz, 16-bit: ${fmt(raw)} tokens for ${D} s (vocabulary 2¹⁶ = 65,536), 256 kbit/s\nEnCodec 24 kHz → 75 frames/s (24000/75 = 320× downsampling = 2·4·5·8)\n  ${N} codebook${N>1?'s':''} × 75 = ${75*N} tokens/s → ${fmt(enc)} tokens for ${D} s (each codebook: 1024 codewords = 10 bits)\n  bitrate = 75 × ${N} × 10 = ${r1(75*N*10/1000)} kbit/s\nsequence ${r1(raw/enc)}× shorter; self-attention cost (∝ n²) ≈ ${fmt((raw/enc)**2)}× smaller`}
['#crN','#crD'].forEach(s=>$(s).addEventListener('input',drawCR));drawCR();

/* ---------- RVQ in 2-D ---------- */
let RV=[0.83,-0.41];
const stepOf=s=>1/Math.pow(3,s);
function rvq(z,N){let r=z.slice(),zq=[0,0];const st=[];for(let s=0;s<N;s++){const h=stepOf(s),ix=Math.max(-1,Math.min(1,Math.round(r[0]/h))),iy=Math.max(-1,Math.min(1,Math.round(r[1]/h))),cw=[ix*h,iy*h];
    zq=[zq[0]+cw[0],zq[1]+cw[1]];const code=(iy+1)*3+(ix+1);st.push({code,cw,res:r.slice(),zq:zq.slice()});r=[z[0]-zq[0],z[1]-zq[1]]}return {st,err:Math.hypot(z[0]-zq[0],z[1]-zq[1]),zq}}
function drawRV(){const N=+$('#rvN').value;$('#rvNo').textContent=N;const {st,err,zq}=rvq(RV,N);
  const W=340,P=20,S=(W-2*P)/3,sx=v=>P+(v+1.5)*S,sy=v=>P+(1.5-v)*S;let s=`<svg class="map" viewBox="0 0 ${W} ${W}" role="img" style="max-width:360px;cursor:crosshair" id="rvS">`;
  s+=`<rect x="${P}" y="${P}" width="${W-2*P}" height="${W-2*P}" fill="none" stroke="var(--rule)"/>`;
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)s+=`<circle cx="${sx(i)}" cy="${sy(j)}" r="5" fill="var(--math-soft)" stroke="var(--math)"/><text x="${sx(i)+7}" y="${sy(j)-6}" font-size="10" fill="var(--math)" font-family="Noto Sans Mono">${(j+1)*3+(i+1)}</text>`;
  if(N>=2){const c=st[0].cw,h=stepOf(1);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)s+=`<circle cx="${sx(c[0]+i*h)}" cy="${sy(c[1]+j*h)}" r="2.5" fill="var(--amber)"/>`}
  const cols=['var(--math)','var(--amber)','var(--green)','var(--rose)'];let prev=[0,0];
  st.forEach((x,k)=>{s+=`<line x1="${sx(prev[0])}" y1="${sy(prev[1])}" x2="${sx(x.zq[0])}" y2="${sy(x.zq[1])}" stroke="${cols[k]}" stroke-width="${3-k*0.5}" marker-end="url(#rva)"/>`;prev=x.zq});
  s+=`<defs><marker id="rva" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L8,4L0,8z" fill="var(--soft)"/></marker></defs>`;
  s+=`<circle cx="${sx(RV[0])}" cy="${sy(RV[1])}" r="6" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="${sx(RV[0])+9}" y="${sy(RV[1])+14}" font-size="12" fill="var(--ink)" font-family="Noto Sans Mono">z</text>`;
  $('#rvSvg').innerHTML=s+'</svg>';
  $('#rvS').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*W;RV=[Math.max(-1.49,Math.min(1.49,(x-P)/S-1.5)),Math.max(-1.49,Math.min(1.49,1.5-(y-P)/S))];drawRV()});
  $('#rvCalc').textContent=`z = (${f3(RV[0])}, ${f3(RV[1])})\n`+st.map((x,k)=>`stage ${k+1}: residual (${f3(x.res[0])}, ${f3(x.res[1])}) → nearest codeword (${f3(x.cw[0])}, ${f3(x.cw[1])}) = code ${x.code}   running sum z_q = (${f3(x.zq[0])}, ${f3(x.zq[1])})`).join('\n')+
    `\ntokens q_t = [${st.map(x=>x.code).join(', ')}]   reconstruction error ‖z − z_q‖ = ${f3(err)}\n`+(N<4?`add a stage → the error shrinks (≈ 3× per stage here)`:'4 stages: error below 1/50 of the square')+`\n(blue = codebook 1; small amber dots = codebook 2 around the first choice)`}
$('#rvN').addEventListener('input',drawRV);$('#rvR').addEventListener('click',()=>{const R=rng(Date.now()%99991);RV=[R()*2.8-1.4,R()*2.8-1.4];drawRV()});drawRV();

/* ---------- VALL-E code matrix ---------- */
let vlStep=0;const VP=6,VT=12,AR_PER=4,AR_STEPS=VT/AR_PER,MAXS=AR_STEPS+7;
function drawVL(){const sec=+$('#vlS').value;$('#vlSo').textContent=sec;const W=560,cw=28,ch=20,x0=70,y0=18;let s=`<svg class="map" viewBox="0 0 ${W} ${y0+8*ch+44}" role="img">`;
  const arDone=Math.min(vlStep,AR_STEPS)*AR_PER,narDone=Math.max(0,vlStep-AR_STEPS);
  for(let q=0;q<8;q++){s+=`<text x="${x0-6}" y="${y0+q*ch+14}" font-size="10.5" text-anchor="end" fill="var(--soft)" font-family="Noto Sans Mono">q${q+1}</text>`;
    for(let t=0;t<VP+VT;t++){let fill='var(--tint)',st='var(--rule)';
      if(t<VP){fill='var(--math-soft)';st='var(--math)'}
      else{const tt=t-VP;if(q===0&&tt<arDone){fill='var(--amber-soft)';st='var(--amber)'}else if(q>0&&q<=narDone){fill='var(--green-soft)';st='var(--green)'}}
      const x=x0+t*cw+(t>=VP?8:0);s+=`<rect x="${x}" y="${y0+q*ch}" width="${cw-3}" height="${ch-3}" rx="3" fill="${fill}" stroke="${st}" stroke-width="1"/>`}}
  s+=`<text x="${x0+VP*cw/2}" y="${y0+8*ch+16}" font-size="11" text-anchor="middle" fill="var(--math)" font-family="Noto Sans">prompt C^P (3 s enrolled)</text><text x="${x0+VP*cw+8+VT*cw/2}" y="${y0+8*ch+16}" font-size="11" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">to generate C^T (${sec} s)</text><text x="${x0}" y="${y0+8*ch+34}" font-size="10.5" fill="var(--soft)" font-family="Noto Sans">time → (each cell stands for many 13.3-ms frames)</text>`;
  $('#vlSvg').innerHTML=s+'</svg>';
  const Tp=225,Tt=sec*75;
  let m;if(vlStep===0)m=`input: text x = BPE(transcript of the 3-s prompt + the new text), audio prompt C^P = EnCodec(3 s) = ${Tp} frames × 8 codes = ${fmt(Tp*8)} codes`;
  else if(vlStep<=AR_STEPS)m=`stage 1, autoregressive transformer: generates the q1 codes left to right, one frame at a time: p(c_t,1 | c_<t,1, x)\n(${arDone}/${VT} cells drawn; in reality ${Tt} frames → ${Tt} sequential AR steps + EOS)`;
  else m=`stage 2, non-autoregressive transformer, call ${narDone} of 7: fills ALL of row q${narDone+1} at once, conditioned on x, the prompt and ${narDone===1?"row q1":"rows q1…q"+narDone} (it may look to the right)`+(narDone===7?'\n✓ matrix complete → EnCodec decoder sums the 8 codewords per frame → 24 kHz waveform':'');
  $('#vlCalc').textContent=m+`\n\ntotal for ${sec} s: ${fmt(Tt*8)} codes = ${fmt(Tt)} AR steps (q1) + 7 NAR calls (q2…q8 = ${fmt(Tt*7)} codes in parallel)\nwith one AR model for everything: ${fmt(Tt*8)} sequential steps`}
$('#vlStep').addEventListener('click',()=>{vlStep=Math.min(MAXS,vlStep+1);drawVL()});$('#vlReset').addEventListener('click',()=>{vlStep=0;drawVL()});$('#vlS').addEventListener('input',drawVL);drawVL();

/* ---------- CMOS sign test ---------- */
const lC=(n,k)=>{let s=0;for(let i=1;i<=k;i++)s+=Math.log(n-k+i)-Math.log(i);return s};
const pmf=k=>Math.exp(lC(50,k)-50*Math.LN2);
function drawCM(){const k=+$('#cmK').value;$('#cmKo').textContent=k;const d=Math.abs(k-25),p=Math.min(1,[...Array(51).keys()].filter(i=>Math.abs(i-25)>=d).reduce((a,i)=>a+pmf(i),0));
  const W=560,H=170,L=30,B=24,mx=pmf(25);let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img">`;
  for(let i=0;i<=50;i++){const x=L+i*(W-L-10)/51,h=pmf(i)/mx*(H-B-14),tail=Math.abs(i-25)>=d;s+=`<rect x="${x}" y="${H-B-h}" width="${(W-L-10)/51-1.5}" height="${h}" fill="${i===k?'var(--rose)':tail?'var(--amber)':'var(--math)'}" opacity="${i===k||tail?1:0.45}"/>`;if(i%10===0)s+=`<text x="${x+4}" y="${H-8}" text-anchor="middle">${i}</text>`}
  $('#cmPlot').innerHTML=s+'</svg>';
  $('#cmCalc').textContent=`new system preferred in ${k} of 50 sentences (old in ${50-k})\nif the systems were equally good, preferences ~ Binomial(50, 0.5): expected 25\ntwo-sided p = P(|K − 25| ≥ ${d}) = ${p<0.001?p.toExponential(2):f3(p)}  (amber bars)\n→ ${p<=0.05?'significant at 0.05: the new system really is preferred'+(k<25?' LESS':''):'not significant: could be chance'}`}
$('#cmK').addEventListener('input',drawCM);drawCM();

/* ---------- diarization ---------- */
const DS=[[0,4,'A'],[4,6,'B'],[6,10,'A'],[10,13,'C'],[13,15,'B'],[15,19,'C'],[19,21,'A'],[21,25,'B']],SPK={A:[2,7],B:[7,6],C:[4.5,2]};let drOn=false;
const DRR=rng(31);const DE=DS.map(d=>{const c=SPK[d[2]];return [c[0]+(DRR()-.5)*1.8,c[1]+(DRR()-.5)*1.8]});
function cluster(){let mu=[DE[0]];while(mu.length<3){let best=-1,bi=0;DE.forEach((p,i)=>{const m=Math.min(...mu.map(c=>(p[0]-c[0])**2+(p[1]-c[1])**2));if(m>best){best=m;bi=i}});mu.push(DE[bi])}
  let as=[];for(let it=0;it<10;it++){as=DE.map(p=>{let b=0;mu.forEach((c,j)=>{if((p[0]-c[0])**2+(p[1]-c[1])**2<(p[0]-mu[b][0])**2+(p[1]-mu[b][1])**2)b=j});return b});
    mu=mu.map((c,j)=>{const S=DE.filter((_,i)=>as[i]===j);return S.length?[S.reduce((a,p)=>a+p[0],0)/S.length,S.reduce((a,p)=>a+p[1],0)/S.length]:c})}return as}
const DC=['var(--math)','var(--rose)','var(--green)'];
function drawDR(){const as=drOn?cluster():null,W=560,H=250;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img">`;
  const tx=t=>20+t/25*(W-40);DS.forEach((d,i)=>{s+=`<rect x="${tx(d[0])+1}" y="14" width="${tx(d[1])-tx(d[0])-2}" height="26" rx="4" fill="${as?DC[as[i]]:'var(--tint)'}" opacity="${as?0.85:1}" stroke="var(--rule)"/><text x="${(tx(d[0])+tx(d[1]))/2}" y="31" font-size="11" text-anchor="middle" fill="${as?'var(--paper)':'var(--soft)'}" font-family="Noto Sans Mono">s${i+1}</text>`});
  [0,5,10,15,20,25].forEach(t=>{s+=`<text x="${tx(t)}" y="54" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${t}s</text>`});
  const sx=v=>W/2-150+v/9*300,sy=v=>H-14-v/9*170;s+=`<rect x="${sx(0)}" y="${sy(9)}" width="300" height="170" fill="none" stroke="var(--rule)"/><text x="${sx(0)-6}" y="${sy(9)+10}" font-size="10" text-anchor="end" fill="var(--soft)" font-family="Noto Sans">speaker embeddings</text>`;
  DE.forEach((p,i)=>{s+=`<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="9" fill="${as?DC[as[i]]:'var(--tint)'}" stroke="var(--soft)"/><text x="${sx(p[0])}" y="${sy(p[1])+3.5}" font-size="9" text-anchor="middle" fill="${as?'var(--paper)':'var(--ink)'}" font-family="Noto Sans Mono">${i+1}</text>`});
  $('#drSvg').innerHTML=s+'</svg>';
  if(!as){$('#drCalc').textContent='1. VAD found 8 speech segments s1…s8 (top: timeline)\n2. each segment → a speaker-embedding vector (bottom: 2-D for display)\npress “cluster” for step 3';return}
  const ok=DS.every((d,i)=>DS.every((e,j)=>(d[2]===e[2])===(as[i]===as[j])));
  $('#drCalc').textContent=`3. k-means (k = 3) on the embeddings → speaker labels\n`+DS.map((d,i)=>`s${i+1} ${d[0]}–${d[1]}s → speaker ${String.fromCharCode(65+as[i])}`).join('\n')+`\n${ok?'✓ matches the true “who spoke when”':'✗ some segments mislabelled'}  (labels are arbitrary: the system knows “same/different speaker”, not names)`}
$('#drGo').addEventListener('click',()=>{drOn=true;drawDR()});$('#drClr').addEventListener('click',()=>{drOn=false;drawDR()});drawDR();

/* ---------- glossary ---------- */
const GL=[['تحويل النص إلى كلام','text-to-speech (TTS) / speech synthesis','توليد موجة كلام من نص.'],['توليد بلا أمثلة','zero-shot TTS','بصوت لم يُرَ في التدريب، من ٣ ثوانٍ تقريباً.'],['الترميز الصوتي العصبي','neural audio codec','مرمِّز + مكمِّم + مفكِّك للصوت.'],['مرمِّز الرموز الصوتية','audio tokenizer','يحوّل الموجة إلى رموز متقطعة.'],['EnCodec','EnCodec','ترميز صوتي: ٢٤ kHz ← ٧٥ متجهاً/ثانية.'],['التقليل / التكبير','downsampling / upsampling','تقصير السلسلة / إطالتها بالالتفاف.'],['التكميم المتجهي','vector quantization (VQ)','متجه ← فهرس أقرب كلمة رمز.'],['كتاب الرموز / كلمة الرمز','codebook / codeword','المراكز وفهارسها.'],['الرمز','code','فهرس المجموعة.'],['التكميم المتبقي','residual vector quantization (RVQ)','كتب رموز متتالية تكمّم الخطأ المتبقي.'],['المتبقي','residual','z − z_q: خطأ التكميم.'],['المرمِّز الذاتي','autoencoder','نموذج يتعلم إعادة بناء مدخله.'],['خسارة إعادة البناء','reconstruction loss','الفرق بين الموجة الأصلية والمعادة.'],['الخسارة التنافسية','adversarial (GAN) loss','خداع مميِّز يفرّق الحقيقي من المولَّد.'],['المقدِّر المستقيم','straight-through estimator','نسخ التدرّج عبر التكميم.'],['VALL-E','VALL-E','نموذج لغوي ترميزي بمرحلتين لـ TTS.'],['مصفوفة الرموز الصوتية','acoustic code matrix C','T إطاراً × 8 كتب رموز.'],['ذاتي / غير ذاتي الانحدار','autoregressive / non-autoregressive','رمزاً رمزاً / صفاً كاملاً دفعة واحدة.'],['الموجِّه الصوتي','acoustic prompt / enrolled speech','رموز عيّنة الصوت المطلوب.'],['متوسط درجة الرأي','mean opinion score (MOS)','تقييم المستمعين من ١ إلى ٥.'],['CMOS','comparative MOS','تفضيل بين نظامين من −٣ إلى ٣.'],['تقسيم المتحدثين','speaker diarization','من تكلم متى.'],['كشف النشاط الصوتي','voice activity detection (VAD)','إيجاد مقاطع الكلام.'],['التحقق / التحديد','speaker verification / identification','هل هو X؟ / أيّ من N؟'],['تحديد اللغة','language identification','أي لغة في الملف الصوتي.'],['كلمة الإيقاظ','wake word detection','كشف «Alexa» وأمثالها على الجهاز.'],['التوليد بالمكوّنات / بالوصل / النطقي','formant / concatenative / articulatory synthesis','نماذج التوليد التاريخية الثلاثة.'],['الثنائيات الصوتية','diphones','وحدات الوصل من منتصف صوت إلى منتصف تاليه.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
