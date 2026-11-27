/* D2L · Chapter 10 · Attention — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s10-1','10.1','الاستعلامات والمفاتيح والقيم'],['s10-2','10.2','الضرب النقطي والأقنعة'],['s10-3','10.3','متعدد الرؤوس'],['s10-4','10.4','المعلومات الموضعية'],['s10-5','10.5','FlashAttention'],['s10-6','10.6','النافذي والخطي'],['s10-7','10.7','رؤوس الاستقراء'],['ex','','الخلاصة والتمارين']];
const GL=[
['الاستعلام','query','متجه يمثل ما يبحث عنه الموقع الحالي.'],
['المفتاح','key','متجه يعلن عن محتوى موقع ليُطابَق مع الاستعلامات.'],
['القيمة','value','المتجه الذي يُعاد من الموقع إن اختير.'],
['تجميع الانتباه','attention pooling','متوسط القيم موزوناً بـsoftmax درجات المفاتيح.'],
['الغلاف المحدب','convex hull','كل المتوسطات الموزونة الممكنة لمجموعة نقاط.'],
['انحدار ناداريا–واتسون','Nadaraya–Watson regression','متوسط القيم موزوناً بنواة القرب؛ انتباه بلا تعلّم.'],
['الضرب النقطي المقيس','scaled dot-product','الدرجة qᵀk/√d.'],
['الانتباه الجمعي','additive attention','الدرجة wᵀtanh(W_q q + W_k k).'],
['القناع السببي','causal mask','يمنع الموضع i من رؤية ما بعده.'],
['قناع الحشو','padding mask','يمنع قراءة رموز الحشو.'],
['الانتباه الذاتي','self-attention','الاستعلامات والمفاتيح والقيم كلها من المدخل نفسه.'],
['متعدد الرؤوس','multi-head attention','عدة انتباهات متوازية بعرض d/H تُلصق نتائجها.'],
['ذاكرة المفاتيح والقيم','KV cache','حفظ مفاتيح وقيم الرموز السابقة أثناء التوليد.'],
['GQA / MQA','grouped / multi-query attention','مشاركة رأس مفاتيح وقيم بين عدة رؤوس استعلام.'],
['التكافؤ مع التبديل','permutation equivariance','تبديل المدخل يبدّل المخرج بالطريقة نفسها.'],
['الترميز الجيبي','sinusoidal encoding','جيوب بترددات هندسية تُضاف لكل موضع.'],
['RoPE','rotary position embedding','تدوير الاستعلام والمفتاح بزاوية تتناسب مع الموضع.'],
['ALiBi','attention with linear biases','طرح عقوبة خطية للبعد من الدرجة.'],
['softmax المتصل','online softmax','حساب softmax دفعة دفعة بتحديث العظمى والمجموع.'],
['FlashAttention','FlashAttention','انتباه دقيق مقطّع إلى بلاطات داخل الذاكرة السريعة.'],
['الشدة الحسابية','arithmetic intensity','عدد العمليات لكل بايت يُنقل من الذاكرة.'],
['النافذة المنزلقة','sliding-window attention','كل استعلام يرى آخر w مفتاح فقط.'],
['الانتباه الخطي','linear attention','نواة ϕ(q)ᵀϕ(k) تحوّل الانتباه إلى تكرار بحالة ثابتة.'],
['مجرى البقايا','residual stream','المتجه الجاري الذي تقرأ منه الطبقات وتضيف إليه.'],
['دائرة QK / OV','QK / OV circuit','W_qᵀW_k تحدد أين ينظر الرأس، وW_oW_v ماذا يكتب.'],
['رأس الاستقراء','induction head','يجد ظهوراً سابقاً للرمز الحالي وينسخ ما تلاه.'],
['التعلّم من السياق','in-context learning','الاستفادة من أمثلة في النص نفسه دون تحديث الأوزان.']];
initPage(SECS,GL);
const N=v=>Math.round(v).toLocaleString('en-US');
const smax=a=>{const m=Math.max(...a),e=a.map(x=>Math.exp(x-m)),s=e.reduce((p,q)=>p+q,0);return e.map(x=>x/s)};

/* ---------- 10.1 soft lookup ---------- */
function drawLK(){const q=$('#lkQ').value/10,s=$('#lkS').value/10;$('#lkQo').textContent=q.toFixed(1);$('#lkSo').textContent=s.toFixed(1);
  const out=x=>{const w=smax([-s*(x-2)**2,-s*(x-5)**2]);return 10*w[0]+20*w[1]},w=smax([-s*(q-2)**2,-s*(q-5)**2]);
  plot($('#lkPlot'),{xmin:0,xmax:7,ymin:8,ymax:22,H:210,xt:[0,2,3.5,5,7],yt:[10,15,20],xl:'query q',yl:'output',
    curves:[{f:x=>x<3.5?10:20,c:'var(--soft)',w:1.4,dash:1},{f:out,c:'var(--math)'}],pts:[{x:2,y:10,c:'var(--amber)',t:'(2, 10)'},{x:5,y:20,c:'var(--amber)',t:'(5, 20)',left:1},{x:q,y:out(q),c:'var(--green)',r:6,t:out(q).toFixed(2)}]});
  $('#lkCalc').textContent=`scores: −${s.toFixed(1)}·(q − 2)² = ${(-s*(q-2)**2).toFixed(2)},  −${s.toFixed(1)}·(q − 5)² = ${(-s*(q-5)**2).toFixed(2)}\nsoftmax weights: α₁ = ${w[0].toFixed(3)}, α₂ = ${w[1].toFixed(3)}\noutput = ${w[0].toFixed(3)}·10 + ${w[1].toFixed(3)}·20 = ${out(q).toFixed(2)}   (dashed: hard nearest-key lookup, zero gradient)`}
['#lkQ','#lkS'].forEach(x=>$(x).addEventListener('input',drawLK));drawLK();

/* ---------- 10.1 Nadaraya–Watson ---------- */
let nwSeed=2;
function drawNW(){const sg=$('#nwS').value/100;$('#nwSo').textContent=sg.toFixed(2);const R=rng(nwSeed),xs=[],ys=[];for(let i=0;i<40;i++){const x=5*R();xs.push(x);ys.push(2*Math.sin(x)+x+gauss(R))}
  const f=q=>{const w=smax(xs.map(x=>-((q-x)**2)/(2*sg*sg)));return w.reduce((a,v,i)=>a+v*ys[i],0)},tr=x=>2*Math.sin(x)+x;
  let mse=0;for(let i=0;i<=100;i++){const x=5*i/100;mse+=(f(x)-tr(x))**2}mse/=101;
  plot($('#nwPlot'),{xmin:0,xmax:5,ymin:-1,ymax:8,H:240,xt:[0,1,2,3,4,5],yt:[0,2,4,6,8],xl:'x',
    curves:[{f:tr,c:'var(--green)',w:1.6,dash:1},{f,c:'var(--math)',w:2.4}],pts:xs.map((x,i)=>({x,y:ys[i],c:'var(--soft)',r:3}))});
  const ym=ys.reduce((a,b)=>a+b,0)/40;
  $('#nwCalc').textContent=`keys = 40 training x, values = their y, query = any test x\nscore −(q − xᵢ)²/(2σ²) = −(q − xᵢ)² × ${(1/(2*sg*sg)).toFixed(2)}   (1/σ² acts as inverse temperature)\nmean squared error vs the true curve on [0, 5]: ${mse.toFixed(3)}   (sample mean of y: ${ym.toFixed(2)})`}
$('#nwS').addEventListener('input',drawNW);$('#nwGo').addEventListener('click',()=>{nwSeed++;drawNW()});drawNW();

/* ---------- 10.2 entropy vs width ---------- */
let sdSeed=1;
function drawSD(){const R=rng(sdSeed),D=[4,8,16,32,64,128,256,512],Q=300,M=64,res=D.map(d=>{let es=0,eu=0;for(let q=0;q<Q;q++){const qq=Array.from({length:d},()=>gauss(R));const sc=[];for(let m=0;m<M;m++){let s=0;for(let j=0;j<d;j++)s+=qq[j]*gauss(R);sc.push(s)}
    const H=a=>{const w=smax(a);return -w.reduce((p,x)=>p+(x>0?x*Math.log(x):0),0)};es+=H(sc.map(x=>x/Math.sqrt(d)));eu+=H(sc)}return [es/Q,eu/Q]});
  const lx=D.map(d=>Math.log2(d));
  plot($('#sdPlot'),{xmin:2,xmax:9,ymin:0,ymax:4.4,H:230,xt:[2,4,6,8,9],yt:[0,1,2,3,4,4.16],ytf:v=>v===4.16?'log 64':v,xl:'log₂ d',yl:'entropy (nats)',
    lines:[{pts:lx.map((x,i)=>[x,res[i][0]]),c:'var(--green)',w:2.4},{pts:lx.map((x,i)=>[x,res[i][1]]),c:'var(--rose)',w:2.4}],
    pts:[{x:8.6,y:res[7][0],c:'var(--green)',t:'÷√d',left:1},{x:8.6,y:res[7][1]+0.2,c:'var(--rose)',t:'unscaled',left:1}]});
  $('#sdCalc').textContent=`d:          ${D.map(d=>String(d).padStart(5)).join('')}\nscaled:     ${res.map(r=>r[0].toFixed(2).padStart(5)).join('')}\nunscaled:   ${res.map(r=>r[1].toFixed(2).padStart(5)).join('')}\nscaled stays near log 64 − ½ ≈ 3.66 nats (≈ ${Math.exp(res[7][0]).toFixed(0)} keys in play); unscaled collapses toward one-hot`}
$('#sdGo').addEventListener('click',()=>{sdSeed++;drawSD()});drawSD();

/* ---------- 10.2 masks ---------- */
function drawMK(){const t=segVal('#mkT','v'),L=+$('#mkL').value,n=6;$('#mkLo').textContent=L;
  const ok=(i,j)=>t==='pad'?j<L:t==='cau'?j<=i:t==='both'?j<L&&j<=i:j<=i&&i-j<3;
  const M=[];for(let i=0;i<n;i++){const c=[];for(let j=0;j<n;j++)if(ok(i,j))c.push(j);M.push(Array.from({length:n},(_,j)=>ok(i,j)?(1/c.length).toFixed(2):'0'))}
  $('#mkOut').innerHTML=lab('weights α(i, j)',grid(M,(i,j)=>ok(i,j)?'g':'x'));
  let cnt=0;for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(ok(i,j))cnt++;
  $('#mkCalc').textContent=`${ {pad:`padding: keys j < ${L} valid (the rest are <blank>)`,cau:'causal: key j allowed only if j ≤ i',both:`padding & causal: j < ${L} and j ≤ i`,win:'sliding window w = 3: j ≤ i and i − j < 3'}[t]}\nallowed pairs: ${cnt} of ${n*n}; each row averages over its allowed keys (equal scores)`}
segOn('#mkT',drawMK);$('#mkL').addEventListener('input',drawMK);drawMK();

/* ---------- 10.3 Alice gave Bob the book ---------- */
const AW=['Alice','gave','Bob','the','book'],AQ=[[1,-1],[1,1],[1,-1],[0,0],[1,-1]],AK=[[1,1],[1,-1],[1,1],[0,0],[1,1]];
function drawAH(){const i=+segVal('#ahQ','v'),sc=AK.map(k=>(AQ[i][0]*k[0]+AQ[i][1]*k[1])/Math.SQRT2),w=smax(sc);
  $('#ahOut').innerHTML=AW.map((t,j)=>bar(t,w[j],1,w[j].toFixed(2),w[j]>0.25?'var(--green)':'var(--soft)')).join('');
  $('#ahCalc').textContent=`query of "${AW[i]}" = (${AQ[i]})\nkeys: Alice, Bob, book (1, 1) · gave (1, −1) · the (0, 0)\nscores q·k/√2: ${sc.map(x=>x.toFixed(2)).join(', ')}\n`+(i===1?'the verb spreads ~0.29 over each noun: one head returns ONE blend of giver, recipient and object':i===3?'zero query: uniform weights 0.20':'nouns look for the action (key (1, −1)) and find "gave"')}
segOn('#ahQ',drawAH);drawAH();

/* ---------- 10.4 sinusoidal heatmap ---------- */
(function(){const n=64,d=32,P=[];for(let i=0;i<n;i++){P.push([]);for(let m=0;m<d/2;m++){const w=10000**(-2*m/d);P[i].push(Math.sin(i*w),Math.cos(i*w))}}
  const cs=9,rs=4;let s=`<svg viewBox="0 0 ${d*cs} ${n*rs}" style="width:100%;max-width:${d*cs*1.6}px;height:auto;direction:ltr;display:block;margin:0 auto" shape-rendering="crispEdges">`;
  for(let i=0;i<n;i++)for(let j=0;j<d;j++){const v=P[i][j];s+=`<rect x="${j*cs}" y="${i*rs}" width="${cs}" height="${rs}" fill="${v>=0?`color-mix(in srgb, var(--green) ${Math.round(v*100)}%, var(--paper))`:`color-mix(in srgb, var(--rose) ${Math.round(-v*100)}%, var(--paper))`}"/>`}
  $('#peOut').innerHTML=s+'</svg>';
  $('#peCalc').textContent=`ω_m = 10000^(−2m/32); period of column pair m = 2π/ω_m\nm = 0: ${(2*Math.PI).toFixed(2)}   m = 2: ${(2*Math.PI/10000**(-4/32)).toFixed(1)}   m = 4: ${(2*Math.PI/10000**(-8/32)).toFixed(1)}   m = 8: ${(2*Math.PI/10000**(-16/32)).toFixed(0)}   m = 15: ${N(2*Math.PI/10000**(-30/32))} tokens\nleft columns flip fast (like a low bit), right columns barely move in 64 positions`})();

/* ---------- 10.4 RoPE vs additive ---------- */
const RQ=(()=>{const R=rng(17);return [Array.from({length:8},()=>gauss(R)),Array.from({length:8},()=>gauss(R))]})();
const rot=(v,i)=>{const o=v.slice();for(let m=0;m<4;m++){const a=i*10000**(-2*m/8),c=Math.cos(a),s=Math.sin(a),x=v[2*m],y=v[2*m+1];o[2*m]=c*x-s*y;o[2*m+1]=s*x+c*y}return o};
const sinp=i=>{const p=[];for(let m=0;m<4;m++){const w=10000**(-2*m/8);p.push(Math.sin(i*w),Math.cos(i*w))}return p};
const dot=(a,b)=>a.reduce((s,x,k)=>s+x*b[k],0)/Math.sqrt(8);
function drawRO(){const i=+$('#roI').value,j=+$('#roJ').value;$('#roIo').textContent=i;$('#roJo').textContent=j;const [q,k]=RQ;
  const r=dot(rot(q,i),rot(k,j)),a=dot(q.map((x,t)=>x+sinp(i)[t]),k.map((x,t)=>x+sinp(j)[t])),r0=dot(rot(q,0),rot(k,j-i));
  $('#roOut').innerHTML=bar('RoPE',Math.abs(r),4,r.toFixed(4),'var(--green)')+bar('جيبي مضاف',Math.abs(a),4,a.toFixed(4),'var(--math)');
  $('#roCalc').textContent=`i = ${i}, j = ${j}, offset j − i = ${j-i}\nRoPE score (R_i q)·(R_j k)/√8 = ${r.toFixed(6)}   = qᵀR_{j−i}k/√8 = ${r0.toFixed(6)}\nadditive score (q + p_i)·(k + p_j)/√8 = ${a.toFixed(6)}\nmove both positions by the same amount: RoPE stays put, additive drifts`}
['#roI','#roJ'].forEach(x=>$(x).addEventListener('input',drawRO));$('#roSh').addEventListener('click',()=>{const i=+$('#roI').value,j=+$('#roJ').value;if(Math.max(i,j)+17>60){$('#roI').value=i-Math.min(i,j);$('#roJ').value=j-Math.min(i,j)}else{$('#roI').value=i+17;$('#roJ').value=j+17}drawRO()});drawRO();

/* ---------- 10.5 memory of naive attention ---------- */
const fmb=b=>b>=2**30?(b/2**30).toFixed(b>=2**33?0:1)+' GiB':b>=2**20?(b/2**20).toFixed(b>=2**23?0:1)+' MiB':(b/1024).toFixed(0)+' KiB';
function drawFM(){const n=2**+$('#fmN').value;$('#fmNo').textContent=N(n);const S=8*n*n,I=3*n*64*4,C=n*512*4;
  $('#fmOut').innerHTML=bar('مصفوفتا الدرجات والأوزان',S,S,fmb(S),'var(--rose)')+bar('شريط بعرض ٥١٢ (متصل)',C,S,fmb(C),'var(--green)')+bar('المدخلات Q وK وV',I,S,fmb(I),'var(--math)');
  $('#fmCalc').textContent=`naive: scores (4n²) + weights (4n²) = 8 × ${N(n)}² bytes = ${fmb(S)} per head\ninputs Q, K, V: 3 × ${N(n)} × 64 × 4 bytes = ${fmb(I)}  → scratch is ${(S/I).toFixed(0)}× larger\nonline softmax with key blocks of c = 512: ${fmb(C)} for the current stripe`}
$('#fmN').addEventListener('input',drawFM);drawFM();

/* ---------- 10.5 online softmax ---------- */
let osK=0,osRev=false;const OSB=[[[1,10],[3,20]],[[5,30],[2,40]]];
function drawOS(){const B=osRev?[OSB[1],OSB[0]]:OSB;let m=-Infinity,s=0,o=0;const rows=[];
  for(let b=0;b<osK;b++){const mb=Math.max(m,...B[b].map(x=>x[0])),sc=m===-Infinity?0:Math.exp(m-mb);s=s*sc;o=o*sc;B[b].forEach(([a,v])=>{s+=Math.exp(a-mb);o+=Math.exp(a-mb)*v});m=mb;rows.push([`block ${b+1}: (${B[b].map(x=>x[0]).join(', ')})`,m,s,o])}
  const all=[...OSB[0],...OSB[1]],w=smax(all.map(x=>x[0])),full=w.reduce((p,x,i)=>p+x*all[i][1],0);
  $('#osOut').innerHTML=lab('scores (values)',`<div dir="ltr" style="display:flex;gap:10px;flex-wrap:wrap">${B.map((bl,b)=>`<div style="padding:4px 8px;border:1px solid var(--rule);border-radius:6px;${b<osK?'background:var(--green-soft)':''}">${bl.map(x=>`${x[0]} (${x[1]})`).join(' · ')}</div>`).join('')}</div>`);
  $('#osCalc').textContent=(rows.length?rows.map(r=>`${r[0].padEnd(20)} m = ${r[1]}   s = ${r[2].toFixed(4)}   o = ${r[3].toFixed(3)}   o/s = ${(r[3]/r[2]).toFixed(4)}`).join('\n'):'press "next block": state starts at m = −∞, s = 0, o = 0')+`\nfull softmax(a)·v over all four keys = ${full.toFixed(4)}`;
  $('#osNext').textContent=osK<2?'الدفعة التالية':'ابدأ من جديد'}
$('#osNext').addEventListener('click',()=>{osK=osK<2?osK+1:0;drawOS()});$('#osRev').addEventListener('click',()=>{osRev=!osRev;osK=0;drawOS()});drawOS();

/* ---------- 10.6 tiles ---------- */
function drawTL(){const n=2**+$('#tlN').value,w=segVal('#tlM','v')==='w',T=n/128;$('#tlNo').textContent=N(n);const vis=(i,j)=>w?(j===i||j===i-1):j<=i;
  const cnt=w?2*T-1:T*(T+1)/2;
  if(T<=32){const c=Math.max(6,Math.floor(320/T));let s=`<svg viewBox="0 0 ${T*c} ${T*c}" style="width:100%;max-width:${Math.min(330,T*c)}px;height:auto;display:block;margin:0 auto;direction:ltr">`;
    for(let i=0;i<T;i++)for(let j=0;j<T;j++)s+=`<rect x="${j*c+0.5}" y="${i*c+0.5}" width="${c-1}" height="${c-1}" fill="${vis(i,j)?'var(--green)':'var(--tint)'}" opacity="${vis(i,j)?0.85:1}"/>`;$('#tlOut').innerHTML=s+'</svg>'}
  else $('#tlOut').innerHTML=`<div class="note" style="text-align:center">${T} × ${T} بلاطة: أكبر من أن تُرسم</div>`;
  $('#tlCalc').textContent=`n = ${N(n)}, tile b = 128 → T = ${T} tile rows, ${N(T*T)} tiles in total\n${w?`sliding window: diagonal + left neighbour = 2T − 1 = ${N(cnt)} tiles`:`causal: T(T + 1)/2 = ${N(cnt)} tiles`} (${(100*cnt/(T*T)).toFixed(1)}%)\ncausal / window tile ratio: ${(T*(T+1)/2/(2*T-1)).toFixed(1)}×`}
$('#tlN').addEventListener('input',drawTL);segOn('#tlM',drawTL);drawTL();

/* ---------- 10.7 induction rule ---------- */
function drawIN(){const raw=$('#inS').value,u=segVal('#inU','v'),tk=u==='w'?raw.trim().split(/\s+/).filter(Boolean):[...raw];const pr=[];
  for(let i=0;i<tk.length;i++){let j=-1;for(let k=i-1;k>=0;k--)if(tk[k]===tk[i]&&k+1<=i){j=k;break}pr.push(j>=0&&j+1<tk.length?[j,tk[j+1]]:null)}
  const nxt=pr[tk.length-1];
  $('#inOut').innerHTML=`<div dir="ltr" style="display:flex;flex-wrap:wrap;gap:6px">${tk.map((t,i)=>`<div style="text-align:center"><div>${chip(t===' '?'␣':t,pr[i]?'green':'plain')}</div><div class="note" style="font-size:11px;font-family:var(--f-mono)">${pr[i]?'→ '+esc(pr[i][1]===' '?'␣':pr[i][1]):'·'}</div></div>`).join('')}</div>`;
  const hit=pr.filter(Boolean).length;
  $('#inCalc').textContent=`under each token: what an induction head predicts next (copy what followed its previous occurrence)\ntokens with an earlier match: ${hit} of ${tk.length}\n`+(nxt?`after the last token "${tk[tk.length-1]}": attend to token #${nxt[0]+2} (right after its previous occurrence, token #${nxt[0]+1}) → predict "${nxt[1]}"`:`the last token "${tk[tk.length-1]||''}" has no earlier occurrence: nothing to copy`)}
$('#inS').addEventListener('input',drawIN);segOn('#inU',drawIN);drawIN();
