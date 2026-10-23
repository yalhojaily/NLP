/* Chapter 14 · RNNs and LSTMs — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2);
const fmt=n=>Math.round(n).toLocaleString('en-US');
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s14-1','14.1','الشبكات التكرارية'],['s14-2','14.2','نماذج لغوية تكرارية'],['s14-3','14.3','مهام أخرى'],['s14-4','14.4','المكدسة وثنائية الاتجاه'],['s14-5','14.5','LSTM'],['s14-6','14.6','خلاصة المعماريات'],['s14-7','14.7','المرمِّز-المفكِّك'],['s14-8','14.8','الانتباه'],['ex','','الخلاصة والمسرد']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

function plot(el,o){
  const W=o.W||560,H=o.H||240,L=46,R=14,T=16,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img">`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${v}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">${o.xl}</text>`;
  (o.lines||[]).forEach(p=>{s+=`<path d="${p.pts.map((q,i)=>(i?'L':'M')+x(q[0]).toFixed(1)+' '+y(q[1]).toFixed(1)).join('')}" fill="none" stroke="${p.c}" stroke-width="${p.w||2}" ${p.dash?'stroke-dasharray="5 4"':''}/>`;
    p.pts.forEach(q=>{s+=`<circle cx="${x(q[0])}" cy="${y(q[1])}" r="2.6" fill="${p.c}"/>`})});
  (o.leg||[]).forEach((g,i)=>{s+=`<rect x="${L+8}" y="${T+4+i*16}" width="12" height="4" fill="${g[1]}"/><text x="${L+26}" y="${T+10+i*16}" style="fill:${g[1]}">${g[0]}</text>`});
  el.innerHTML=s+'</svg>';
}

/* ---------- 14.1 one-unit RNN + gradient ---------- */
function drawRN(){const u=+$('#rnU').value,w=+$('#rnW').value;$('#rnUo').textContent=r2(u);$('#rnWo').textContent=r2(w);
  const T=15,h=[0],x=t=>t===1?1:0;for(let t=1;t<=T;t++)h.push(Math.tanh(u*h[t-1]+w*x(t)));
  // d h_T / d h_1 = prod_{t=2..T} u (1 - h_t^2)
  const g=[[1,1]];let p=1;for(let t=2;t<=T;t++){p*=u*(1-h[t]*h[t]);g.push([t,p])}
  plot($('#rnPlot'),{xmin:1,xmax:T,ymin:0,ymax:1.55,xt:[1,3,5,7,9,11,13,15],yt:[0,0.5,1],xl:'t',
    lines:[{pts:h.slice(1).map((v,i)=>[i+1,v]),c:'var(--green)'},{pts:g.map(q=>[q[0],Math.min(q[1],1.55)]),c:'var(--rose)',dash:1}],
    leg:[['h_t (memory of the pulse)','var(--green)'],['∂h_t/∂h_1 (gradient reaching t = 1)','var(--rose)']]});
  $('#rnCalc').textContent=`x = [1, 0, 0, …]   h_0 = 0\n`+h.slice(1,6).map((v,i)=>`h_${i+1} = tanh(${r2(u)}·${f3(h[i])} + ${r2(w)}·${x(i+1)}) = ${f3(v)}`).join('\n')+`\n…\nh_10 = ${f3(h[10])}   h_15 = ${f3(h[15])}\n\nbackprop through time: ∂h_15/∂h_1 = Π_{t=2..15} u·(1 − h_t²) = ${p.toExponential(2)}`+
   (p<1e-3?'\n→ vanishing gradient: the error at t = 15 barely changes anything at t = 1':u>1?'\n→ with u > 1 tanh saturates near ±1, so (1 − h²) is tiny: the memory stays but the gradient still dies':'')}
['#rnU','#rnW'].forEach(s=>$(s).addEventListener('input',drawRN));drawRN();

/* ---------- 14.2 parameters with/without tying ---------- */
function drawPT(){const V=+$('#ptV').value,d=+$('#ptD').value;$('#ptVo').textContent=fmt(V);$('#ptDo').textContent=d;
  const E=d*V,WU=2*d*d,Vo=V*d,un=E+WU+Vo,ti=E+WU;
  $('#ptCalc').textContent=`E [d × |V|] = ${d} × ${fmt(V)} = ${fmt(E)}\nW, U [d × d] each = 2 × ${d}² = ${fmt(WU)}\nV [|V| × d] = ${fmt(Vo)}\n\nuntied: ${fmt(un)} parameters\ntied (V = Eᵀ): ${fmt(ti)} parameters  → saves ${fmt(Vo)} (${(Vo/un*100).toFixed(1)}%)\nthe recurrent part (W, U) is only ${(WU/un*100).toFixed(1)}% of the untied model: the vocabulary dominates`}
['#ptV','#ptD'].forEach(s=>$(s).addEventListener('input',drawPT));drawPT();

/* ---------- 14.4 bidirectional ---------- */
const BW=['The','flights','the','airline','was','canceling','were','full'];let biI=6;
function drawBI(){$('#biW').innerHTML=BW.map((w,i)=>`<button class="btn${i===biI?' pri':''}" data-i="${i}">${w}</button>`).join('');
  $$('#biW button').forEach(b=>b.addEventListener('click',()=>{biI=+b.dataset.i;drawBI()}));
  const t=biI+1,n=BW.length;
  $('#biCalc').textContent=`t = ${t}  (“${BW[biI]}”)\nh^f_${t} = RNN_forward(${BW.slice(0,t).join(' ')})   ← sees words 1..${t}\nh^b_${t} = RNN_backward(${BW.slice(biI).join(' ')})   ← sees words ${t}..${n}\nh_${t} = h^f_${t} ⊕ h^b_${t}   (if each is d-dimensional, h_${t} has 2d dimensions)`+
   (biI===6?'\nto tag “were”, the forward net must still remember the plural “flights” from 5 words back':biI===1?'\nonly the backward net knows that “were” comes later and agrees with “flights”':'')}
drawBI();

/* ---------- 14.5 LSTM cell vs RNN ---------- */
function drawLS(){const f=+$('#lsF').value,ig=+$('#lsI').value;$('#lsFo').textContent=r2(f);$('#lsIo').textContent=r2(ig);
  const R=rng(7),T=16,noise=[0,1];for(let t=2;t<=T;t++)noise.push((R()-.5)*0.6);
  // LSTM: c_t = f*c_{t-1} + i*g_t ; step 1: i = 1, g = 1 ; later g_t = noise
  const c=[0],sig=[0],hr=[0];for(let t=1;t<=T;t++){const i=t===1?1:ig;c.push(f*c[t-1]+i*noise[t]);sig.push(t===1?1:sig[t-1]*f)}
  for(let t=1;t<=T;t++)hr.push(Math.tanh(0.8*hr[t-1]+(t===1?1.5:1)*noise[t]));
  plot($('#lsPlot'),{xmin:1,xmax:T,ymin:-0.6,ymax:1.6,xt:[1,4,7,10,13,16],yt:[-0.5,0,0.5,1],xl:'t',
    lines:[{pts:c.slice(1).map((v,i)=>[i+1,v]),c:'var(--green)'},{pts:sig.slice(1).map((v,i)=>[i+1,v]),c:'var(--green)',dash:1,w:1.4},{pts:hr.slice(1).map((v,i)=>[i+1,v]),c:'var(--rose)'}],
    leg:[['LSTM context c_t','var(--green)'],['part of c_t still from t = 1 (f^(t−1))','var(--green)'],['simple RNN h_t (u = 0.8)','var(--rose)']]});
  const left=Math.pow(f,T-1);
  $('#lsCalc').textContent=`t = 1: i = 1, g = 1 → c_1 = f·0 + 1·1 = 1   (store “flights is plural”)\nt ≥ 2: k_t = c_{t−1} ⊙ f,  j_t = g_t ⊙ i,  c_t = j_t + k_t   (g_t = small noise from the intervening words)\nafter ${T-1} steps the stored signal is f^${T-1} = ${r2(f)}^${T-1} = ${f3(left)}\nc_16 = ${f3(c[T])}   simple RNN h_16 = ${f3(hr[T])}\n∂c_16/∂c_1 = f^${T-1} = ${f3(left)}  (no tanh and no matrix in the way)`+
   (left>0.4&&ig<0.2?'\n→ forget ≈ 1 and add ≈ 0: the cell keeps the information and its gradient':left<0.05?'\n→ a small forget gate erases the context, like the simple RNN':ig>0.5?'\n→ a large add gate lets the noise of the intervening words pile into the context':'')+`\n(we fix the gates by hand; a trained LSTM computes them from h_{t−1} and x_t at every step)`}
['#lsF','#lsI'].forEach(s=>$(s).addEventListener('input',drawLS));drawLS();

/* ---------- 14.6 architectures ---------- */
const AR={lab:{n:5,out:'all',d:'sequence labeling: one output per input (e.g. a POS tag for every word)
the loss is summed over every position'},
 cls:{n:5,out:'last',d:'sequence classification: only h_n feeds a classifier (sentiment, spam, topic)
one loss for the whole text'},
 lm:{n:5,out:'next',d:'language modeling: at every step predict the NEXT input (y_t = x_{t+1})
trained with teacher forcing'},
 ed:{n:4,out:'ed',d:'encoder-decoder: the encoder reads x_1..x_n, a context c summarises it,
and the decoder generates y_1..y_m (m can differ from n)'}};
function drawAR(){const k=segVal('#arM','m'),a=AR[k],W=540,H=190;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:580px">`;
  const box=(x,y,t,fill,st)=>`<rect x="${x-24}" y="${y-13}" width="48" height="26" rx="6" fill="${fill}" stroke="${st}"/><text x="${x}" y="${y+4}" font-size="12" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans Mono">${t}</text>`;
  const ln=(x1,y1,x2,y2,c='var(--soft)')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.6" marker-end="url(#ah)"/>`;
  s+=`<defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L8,4L0,8z" fill="var(--soft)"/></marker></defs>`;
  if(k!=='ed'){const xs=i=>60+i*100;
    for(let i=0;i<a.n;i++){s+=box(xs(i),160,'x'+(i+1),'var(--paper)','var(--rule)')+ln(xs(i),147,xs(i),115)+box(xs(i),100,'RNN','var(--math-soft)','var(--math)');if(i<a.n-1)s+=ln(xs(i)+24,100,xs(i+1)-26,100);
      const show=a.out==='all'||a.out==='next'||(a.out==='last'&&i===a.n-1);
      if(show){const lab=a.out==='all'?'y'+(i+1):a.out==='next'?'x'+(i+2):'class';s+=ln(xs(i),87,xs(i),55)+box(xs(i),40,lab,'var(--green-soft)','var(--green)')}}}
  else{const xs=i=>40+i*64;
    for(let i=0;i<4;i++){s+=box(xs(i),160,'x'+(i+1),'var(--paper)','var(--rule)')+ln(xs(i),147,xs(i),115)+box(xs(i),100,'enc','var(--math-soft)','var(--math)');if(i<3)s+=ln(xs(i)+24,100,xs(i+1)-26,100)}
    s+=ln(xs(3)+24,100,xs(4)-14,100)+`<circle cx="${xs(4)}" cy="100" r="13" fill="var(--amber-soft)" stroke="var(--amber)"/><text x="${xs(4)}" y="104" font-size="12" text-anchor="middle" fill="var(--amber)" font-family="Noto Sans Mono">c</text>`;
    for(let j=0;j<3;j++){const x=xs(5)+j*64;s+=box(x,100,'dec','var(--rose-soft)','var(--rose)')+ln(x,87,x,55)+box(x,40,'y'+(j+1),'var(--green-soft)','var(--green)');s+=ln(j?x-40:xs(4)+13,100,x-26,100)}}
  $('#arSvg').innerHTML=s+'</svg>';$('#arCalc').textContent=a.d}
segOn('#arM',drawAR);drawAR();

/* ---------- 14.8 attention ---------- */
const EN=['the','green','witch','arrived'],HE=[[2,0,0,.3],[0,2,.2,0],[.2,0,2,.3],[0,.3,0,2]];
const ES2=['llegó','la','bruja','verde'],HD=[[.2,0,.3,1.5],[1.4,.1,.3,.2],[.2,.2,1.5,0],[.1,1.5,.4,0]];
const WS=[[1.6,0,0,0],[0,1.6,.3,0],[0,0,1.6,0],[.3,0,0,1.6]];let atI=0;
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),mv=(M,v)=>M.map(r=>dot(r,v));
$('#atBtns').innerHTML=ES2.map((t,i)=>`<button class="btn${i===atI?' pri':''}" data-i="${i}">${t}</button>`).join('');
$$('#atBtns button').forEach(b=>b.addEventListener('click',()=>{atI=+b.dataset.i;$$('#atBtns button').forEach(x=>x.classList.toggle('pri',x===b));drawAT()}));
function drawAT(){const m=segVal('#atM','m'),q=HD[atI];let sc,al;
  if(m==='last'){sc=null;al=[0,0,0,1]}else{sc=HE.map(h=>m==='dot'?dot(q,h):dot(q,mv(WS,h)));const mx=Math.max(...sc),ex=sc.map(v=>Math.exp(v-mx)),Z=ex.reduce((a,b)=>a+b,0);al=ex.map(v=>v/Z)}
  const c=[0,1,2,3].map(k=>al.reduce((s,a,j)=>s+a*HE[j][k],0)),top=al.indexOf(Math.max(...al));
  $('#atBars').innerHTML=EN.map((w,j)=>`<div class="br${j===top?' pick':''}"><span class="w0">${w}</span><span class="tr"><span class="fl" style="display:block;width:${(al[j]*100).toFixed(1)}%"></span></span><span class="v">α=${r2(al[j])}</span></div>`).join('');
  $('#atCalc').textContent=(m==='last'?`no attention: c = h^e_4 (“arrived”) for every output word\nwhen generating “${ES2[atI]}” the decoder only sees the summary vector [${HE[3].join(', ')}]`+(atI===0?'':`\n→ the information about “${EN[[3,0,2,1][atI]]}” must have survived inside h^e_4: the bottleneck`):
    `h^d_{i−1} before “${ES2[atI]}” = [${q.join(', ')}]\n`+EN.map((w,j)=>`score(·, h^e_${j+1} “${w}” [${HE[j].join(', ')}]) = ${r2(sc[j])}`).join('\n')+(m==='bil'?'\n(score = h^d · W_s h^e with a learned W_s; here W_s ≈ 1.6·I plus two off-diagonal entries, so attention is sharper)':'')+
    `\nα = softmax(scores) = [${al.map(r2).join(', ')}]`)+`\nc_${atI+1} = Σ α_j h^e_j = [${c.map(r2).join(', ')}]   most attended: “${EN[top]}”\n(the 4-d states are made up for illustration)`}
segOn('#atM',drawAT);drawAT();

/* ---------- glossary ---------- */
const GL=[['الشبكة العصبية التكرارية','recurrent neural network (RNN)','شبكة فيها دائرة: الحالة المخفية تعتمد على سابقتها.'],['شبكة إلمان','Elman / simple recurrent network','h_t = g(Uh_{t−1} + Wx_t).'],['الحالة المخفية','hidden state h_t','ملخّص ما قُرئ حتى t.'],['الفرد في الزمن','unrolling','نسخ الشبكة لكل خطوة بأوزان مشتركة.'],['الانتشار العكسي عبر الزمن','backpropagation through time (BPTT)','الانتشار العكسي على الشبكة المفرودة.'],['نموذج لغوي تكراري','RNN language model','يتنبأ بالكلمة التالية من h_t.'],['إجبار المعلّم','teacher forcing','إعطاء الكلمة الصحيحة مدخلاً تالياً في التدريب.'],['ربط الأوزان','weight tying','استعمال Eᵀ بدل V في طبقة المخرج.'],['وسم السلاسل','sequence labeling','وسم لكل عنصر.'],['تصنيف السلاسل','sequence classification','صنف واحد للسلسلة كلها.'],['من الطرف إلى الطرف','end-to-end training','الخسارة النهائية تدرّب كل المكوّنات.'],['الدمج','pooling (mean / max)','تجميع كل الحالات في متجه واحد.'],['التوليد ذاتي الانحدار','autoregressive generation','كل كلمة مولَّدة تصير مدخلاً للتالية.'],['شبكة مكدسة','stacked RNN','مخرجات طبقة مدخلات للتي فوقها.'],['ثنائية الاتجاه','bidirectional RNN','شبكتان من اليسار ومن اليمين تُلصق حالتاهما.'],['تلاشي التدرّجات','vanishing gradients','التدرّج يقترب من الصفر بالضرب المتكرر.'],['LSTM','long short-term memory','شبكة بطبقة سياق وثلاث بوابات.'],['طبقة السياق','context layer c_t','ذاكرة LSTM تُحدَّث بالجمع.'],['بوابة النسيان','forget gate f','تمحو من السياق ما لم يعد مطلوباً.'],['بوابة الإضافة','add (input) gate i','تختار ما يُضاف إلى السياق.'],['بوابة الإخراج','output gate o','تختار ما يظهر في h_t.'],['ضرب هادامار','Hadamard product ⊙','الضرب عنصراً بعنصر.'],['GRU','gated recurrent unit','صيغة بوابية أبسط من LSTM.'],['المرمِّز-المفكِّك','encoder-decoder / seq2seq','مرمِّز وسياق ومفكِّك.'],['متجه السياق','context vector c','ما ينقله المرمِّز إلى المفكِّك.'],['عنق الزجاجة','bottleneck','حمل معنى الجملة كلها في متجه واحد.'],['الانتباه','attention','سياق خاص لكل خطوة = متوسط موزون لحالات المرمِّز.'],['انتباه الضرب النقطي','dot-product attention','الدرجة = h^d · h^e.'],['ثنائي الخطية','bilinear score','الدرجة = h^d W_s h^e.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
