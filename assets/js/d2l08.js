/* D2L · Chapter 8 · Sequence Models — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s8-1','8.1','التعامل مع التسلسلات'],['s8-2','8.2','من النص إلى الرموز'],['s8-3','8.3','نماذج اللغة والحيرة'],['s8-4','8.4','الشبكات التكرارية'],['s8-5','8.5','الانتشار العكسي عبر الزمن'],['s8-6','8.6','فك الترميز والتوليد'],['ex','','الخلاصة والتمارين']];
const GL=[
['الانحدار الذاتي','autoregression','التنبؤ بعنصر السلسلة من عناصرها السابقة.'],
['قاعدة السلسلة','chain rule','P(x₁…x_T) = ∏ P(xₜ | x₍<t₎) بلا تقريب.'],
['شرط ماركوف','Markov condition','المستقبل يعتمد على آخر m عناصر فقط.'],
['الحالة الكامنة','latent / hidden state','متجه بحجم ثابت يلخّص الماضي ويُحدَّث كل خطوة.'],
['الثبات الإحصائي','stationarity','قاعدة الانتقال نفسها صالحة عند كل t.'],
['التدحرج متعدد الخطوات','multistep rollout','التنبؤ على تنبؤات النموذج نفسه خطوة بعد خطوة.'],
['انحياز التعرّض','exposure bias','التدريب على بادئات صحيحة والتوليد على بادئات من صنع النموذج.'],
['الرمز','token','وحدة النص التي يراها النموذج: حرف أو كلمة أو جزء كلمة.'],
['خارج المفردات','out-of-vocabulary (OOV)','كلمة ليست في المفردات فتُستبدل بـ<unk>.'],
['ترميز أزواج البايتات','byte pair encoding (BPE)','دمج أكثر زوج متجاور تكراراً في رمز جديد، مرة بعد مرة.'],
['التقطيع المسبق','pre-tokenization','تقسيم النص بتعبير نمطي قبل BPE حتى لا يعبر الدمج حدود الكلمات.'],
['الخصوبة','fertility','متوسط عدد الرموز لكل كلمة في لغة ما.'],
['نموذج اللغة','language model','توزيع احتمالي على الرمز التالي بشرط ما قبله.'],
['n-gram','n-gram','نموذج يقدّر الاحتمال من عدّ تتابعات بطول n.'],
['قانون زيف','Zipf\'s law','تكرار الكلمة يتناسب عكسياً مع ترتيبها تقريباً.'],
['الحيرة','perplexity','exp(متوسط −log P): عدد الخيارات الفعّال عند كل خطوة.'],
['التنعيم','smoothing','إعطاء احتمال موجب لما لم يُرَ (لابلاس، Kneser–Ney).'],
['البتات لكل بايت','bits per byte (bpb)','مجموع المفاجأة بالبتات مقسوماً على عدد البايتات.'],
['الفرض القسري للمعلم','teacher forcing','إدخال الرمز الصحيح لا المتنبأ به أثناء التدريب.'],
['التضمين','embedding','جدول متجهات، صف لكل رمز.'],
['قصّ التدرّج','gradient clipping','تصغير التدرّج إلى طول أقصى θ مع حفظ اتجاهه.'],
['الانتشار العكسي عبر الزمن','backpropagation through time','الانتشار العكسي على الشبكة التكرارية مفرودة عبر الخطوات.'],
['نصف القطر الطيفي','spectral radius','أكبر قيمة ذاتية مطلقة لمصفوفة؛ يحكم نمو قواها.'],
['الانتشار العكسي المقطوع','truncated BPTT','إيقاف التدرّج عند حدود مقاطع بطول T₀.'],
['البحث الجشع','greedy search','اختيار الرمز الأعلى احتمالاً عند كل خطوة.'],
['البحث بالحزمة','beam search','الاحتفاظ بأفضل w بادئات عند كل خطوة.'],
['الحرارة','temperature','قسمة اللوجتات على τ: أقل من ١ أحدّ، وأكبر أسطح.'],
['top-k / top-p / min-p','truncated sampling','حذف ذيل التوزيع قبل السحب بعدد أو كتلة أو حد نسبي.'],
['تدهور النص','text degeneration','التكرار والحلقات عند فك الترميز بتعظيم الاحتمال.']];
initPage(SECS,GL);
const N=v=>Math.round(v).toLocaleString('en-US');

/* ---------- 8.1 AR(4) on a noisy sine ---------- */
let arSeed=1,AR=null;
function fitAR(){const R=rng(arSeed),T=1000,x=[0];for(let t=1;t<=T;t++)x.push(Math.sin(0.01*t)+0.2*gauss(R));
  const A=[],y=[];for(let t=5;t<=604;t++){A.push([x[t-4],x[t-3],x[t-2],x[t-1],1]);y.push(x[t])}
  const w=lstsq(A,y);const f=v=>w[0]*v[0]+w[1]*v[1]+w[2]*v[2]+w[3]*v[3]+w[4];AR={x,w,f,T}}
function kstep(k){const {x,f,T}=AR,p=[];for(let t=4+k;t<=T;t++){const win=[x[t-k-3],x[t-k-2],x[t-k-1],x[t-k]];let v;for(let s=0;s<k;s++){v=f(win);win.shift();win.push(v)}p.push([t,v])}return p}
function drawAR(){if(!AR)fitAR();const {x,w,f,T}=AR,m=segVal('#arK','v');let pr,lab;
  if(m==='r'){const win=[x[601],x[602],x[603],x[604]];pr=[];for(let t=605;t<=T;t++){const v=f(win);win.shift();win.push(v);pr.push([t,v])}lab='rollout from 604'}
  else{pr=kstep(+m);lab=m+'-step'}
  const val=pr.filter(q=>q[0]>=605),mse=val.reduce((a,q)=>a+(q[1]-x[q[0]])**2,0)/val.length;
  plot($('#arPlot'),{xmin:0,xmax:1000,ymin:-1.8,ymax:1.8,H:250,xt:[0,200,400,604,800,1000],yt:[-1,0,1],xl:'t',
    raw:(X,Y)=>{let s=`<line x1="${X(604)}" x2="${X(604)}" y1="${Y(1.8)}" y2="${Y(-1.8)}" stroke="var(--soft)" stroke-dasharray="4 3"/>`;for(let t=1;t<=T;t+=2)s+=`<circle cx="${X(t).toFixed(1)}" cy="${Y(x[t]).toFixed(1)}" r="1.3" fill="var(--soft)" opacity=".55"/>`;return s},
    curves:[{f:t=>Math.sin(0.01*t),c:'var(--green)',w:1.5,dash:1}],lines:[{pts:pr,c:'var(--rose)',w:2.4}]});
  const fk=m==='r'?null:0.05+1-Math.cos(0.01*m);
  $('#arCalc').textContent=`fitted weights on x(t−4..t−1): ${w.slice(0,4).map(v=>v.toFixed(2)).join(', ')}, bias ${w[4].toFixed(3)}  (sum ${(w[0]+w[1]+w[2]+w[3]).toFixed(3)})\n${lab} predictions, validation MSE (t ≥ 605): ${mse.toFixed(3)}`+(fk!==null?`\nbook's estimate 0.05 + 1 − cos(0.01·${m}) = ${fk.toFixed(3)}`:`\nfed its own outputs, the average decays toward a fixed point: last value ${pr[pr.length-1][1].toFixed(3)}`)+`\ngrey dots: data · dashed green: noiseless wave · red: predictions`}
segOn('#arK',drawAR);$('#arGo').addEventListener('click',()=>{arSeed++;AR=null;drawAR()});drawAR();

/* ---------- 8.2 BPE (character level) ---------- */
const BPC=[['low',5,'lower',2,'newest',6,'widest',3],['hug',10,'pug',5,'pun',12,'bun',4,'hugs',5],['كتب',3,'يكتب',2,'مكتب',2,'مكتبة',1,'كاتب',2,'يكتبون',1]];
const BPW=['lowest','hugs','مكتبات'];
function bpeTrain(words,M){let chunks=[];for(let i=0;i<words.length;i+=2)chunks.push({t:['␣',...words[i]],w:words[i+1]});const merges=[];
  for(let r=0;r<M;r++){const cnt=new Map(),order=[];chunks.forEach(c=>{for(let i=0;i<c.t.length-1;i++){const k=c.t[i]+'\u0001'+c.t[i+1];if(!cnt.has(k)){cnt.set(k,0);order.push(k)}cnt.set(k,cnt.get(k)+c.w)}});
    if(!order.length)break;let best=order[0];order.forEach(k=>{if(cnt.get(k)>cnt.get(best))best=k});const [a,b]=best.split('\u0001');merges.push([a,b,cnt.get(best)]);
    chunks.forEach(c=>{const o=[];for(let i=0;i<c.t.length;i++){if(i<c.t.length-1&&c.t[i]===a&&c.t[i+1]===b){o.push(a+b);i++}else o.push(c.t[i])}c.t=o})}
  return {merges,chunks}}
function bpeEncode(word,merges){let t=['␣',...word];const rank=new Map(merges.map((m,i)=>[m[0]+'\u0001'+m[1],i]));
  for(;;){let bi=-1,br=1e9;for(let i=0;i<t.length-1;i++){const r=rank.get(t[i]+'\u0001'+t[i+1]);if(r!==undefined&&r<br){br=r;bi=i}}if(bi<0)break;t.splice(bi,2,t[bi]+t[bi+1])}return t}
function drawBP(){const ci=+segVal('#bpT','v'),M=+$('#bpM').value;$('#bpMo').textContent=M;const {merges,chunks}=bpeTrain(BPC[ci],M);
  const toks=c=>c.map(s=>chip(s,'math')).join('');
  $('#bpOut').innerHTML=chunks.map(c=>lab(`×${c.w}`,`<div dir="ltr" style="display:flex;gap:3px;flex-wrap:wrap">${toks(c.t)}</div>`)).join('')+lab('الكلمة الجديدة',`<div dir="ltr" style="display:flex;gap:3px;flex-wrap:wrap">${toks(bpeEncode($('#bpW').value.trim()||'?',merges))}</div>`);
  const tot=chunks.reduce((a,c)=>a+c.t.length*c.w,0),chars=chunks.reduce((a,c)=>a+(c.t.join('').length)*c.w,0);
  $('#bpCalc').textContent=(merges.length?merges.map((m,i)=>`merge ${i+1}: ${m[0]} + ${m[1]} → ${m[0]+m[1]}   (count ${m[2]})`).join('\n'):'no merges yet: every character is its own token')+`\ncorpus: ${chars} characters → ${tot} tokens (${(chars/tot).toFixed(2)} chars/token)`}
segOn('#bpT',b=>{$('#bpW').value=BPW[+b.dataset.v];drawBP()});$('#bpM').addEventListener('input',drawBP);$('#bpW').addEventListener('input',drawBP);drawBP();

/* ---------- 8.3 perplexity ---------- */
const PLP=[0.5,0.2,0.1,0.6,0.05];
$('#plSl').innerHTML=PLP.map((p,i)=>`<label class="note">P(x${i+1}): <b id="plo${i}"></b> <input type="range" id="pl${i}" min="1" max="100" value="${Math.round(p*100)}" style="width:90px"></label>`).join('');
function drawPL(){const p=PLP.map((_,i)=>$('#pl'+i).value/100);p.forEach((v,i)=>$('#plo'+i).textContent=v.toFixed(2));
  const b=p.map(v=>-Math.log2(v)),mb=b.reduce((a,v)=>a+v,0)/5,ppl=Math.exp(-p.reduce((a,v)=>a+Math.log(v),0)/5);
  $('#plOut').innerHTML=b.map((v,i)=>bar(`الرمز ${i+1}`,v,Math.max(7,...b),v.toFixed(2)+' bit','var(--math)')).join('');
  $('#plCalc').textContent=`surprisal −log₂ P per token: ${b.map(v=>v.toFixed(2)).join(', ')}\nmean = ${mb.toFixed(3)} bits   →   PPL = 2^${mb.toFixed(3)} = exp(mean −ln P) = ${ppl.toFixed(2)}\nlike guessing among ${ppl.toFixed(1)} equally likely options at every step (set all five to 0.125 → PPL 8)`}
PLP.forEach((_,i)=>$('#pl'+i).addEventListener('input',drawPL));drawPL();

/* ---------- 8.3 Laplace after "the time" ---------- */
function drawKN(){const a=$('#knA').value/1000,V=4316,Nc=87,L=c=>(c+a)/(Nc+a*V);$('#knAo').textContent=a.toFixed(3);
  const ph=a*V/(Nc+a*V);
  $('#knOut').innerHTML=bar('traveller · العدّ وحده (47/87)',47/87,1,(47/87).toFixed(2),'var(--soft)')+bar('traveller · لابلاس',L(47),1,L(47).toFixed(3),'var(--rose)')+bar('traveller · Kneser–Ney',0.53,1,'0.53','var(--green)')+bar('machine · لابلاس',L(27),1,L(27).toFixed(3),'var(--rose)')+bar('كتلة العدّات الوهمية',ph,1,(100*ph).toFixed(0)+'%','var(--amber)');
  $('#knCalc').textContent=`Laplace: (N + α) / (87 + α·4316)\nα = ${a.toFixed(3)}: phantom counts α·|V| = ${(a*V).toFixed(2)} vs. 87 real ones\nany unseen word (e.g. "was") gets α/(87 + α|V|) = ${a?L(0).toExponential(2):'0 (MLE: zero probability)'}`}
$('#knA').addEventListener('input',drawKN);drawKN();

/* ---------- 8.3 bits per byte ---------- */
function drawBB(){const g=id=>parseFloat($(id).value),P1=g('#bbP1'),B1=g('#bbB1'),P2=g('#bbP2'),B2=g('#bbB2');
  if(!(P1>=1&&B1>0&&P2>=1&&B2>0)){$('#bbCalc').textContent='enter PPL ≥ 1 and bytes/token > 0';return}
  const b1=Math.log2(P1)/B1,b2=Math.log2(P2)/B2,mx=Math.max(b1,b2,1);
  $('#bbOut').innerHTML=bar('النموذج أ',b1,mx,b1.toFixed(2)+' bpb','var(--math)')+bar('النموذج ب',b2,mx,b2.toFixed(2)+' bpb','var(--green)');
  $('#bbCalc').textContent=`A: log₂ ${P1} / ${B1} = ${Math.log2(P1).toFixed(2)} / ${B1} = ${b1.toFixed(3)} bits per byte\nB: log₂ ${P2} / ${B2} = ${Math.log2(P2).toFixed(2)} / ${B2} = ${b2.toFixed(3)} bits per byte\n${b1<b2?'A':'B'} compresses better (lower bpb), whatever their perplexities say`}
['#bbP1','#bbB1','#bbP2','#bbB2'].forEach(s=>{$(s).addEventListener('input',drawBB);Object.assign($(s).style,{font:'inherit',padding:'2px 6px',border:'1px solid var(--rule)',borderRadius:'6px',background:'var(--paper)',color:'var(--ink)'})});drawBB();

/* ---------- 8.4 scalar RNN ---------- */
const RNX=[1,0,0,0,0,0,0,0,0,0];
function drawRN(){const w=$('#rnW').value/100;$('#rnWo').textContent=w.toFixed(2);const h=[];let s=0;RNX.forEach(x=>{s=Math.tanh(x+w*s);h.push(s)});
  $('#rnIn').innerHTML=lab('المدخل xₜ (انقر للتغيير)',grid([RNX],(i,j)=>RNX[j]?'h':'',{click:1}))+lab('الحالة hₜ',grid([h.map(v=>v.toFixed(2))],()=>'m'));
  $$('#rnIn .tgrid.click i').forEach(e=>e.addEventListener('click',()=>{const j=+e.dataset.j;RNX[j]=RNX[j]===0?1:RNX[j]===1?-1:0;drawRN()}));
  plot($('#rnPlot'),{xmin:0.5,xmax:10.5,ymin:-1,ymax:1,H:190,xt:[1,4,7,10],yt:[-1,0,1],xl:'t',
    raw:(X,Y)=>h.map((v,i)=>`<line x1="${X(i+1)}" x2="${X(i+1)}" y1="${Y(0)}" y2="${Y(v)}" stroke="var(--math)" stroke-width="3"/>`).join(''),pts:h.map((v,i)=>({x:i+1,y:v,c:'var(--math)',r:4}))});
  $('#rnCalc').textContent=`h₁ = tanh(${RNX[0]} + ${w.toFixed(2)}·0) = ${h[0].toFixed(3)}\nh₂ = tanh(${RNX[1]} + ${w.toFixed(2)}·${h[0].toFixed(3)}) = ${h[1].toFixed(3)}\nh₃ = tanh(${RNX[2]} + ${w.toFixed(2)}·${h[1].toFixed(3)}) = ${h[2].toFixed(3)}\nh₁₀ = ${h[9].toFixed(4)}   (one number carries everything seen so far)`}
$('#rnW').addEventListener('input',drawRN);drawRN();

/* ---------- 8.4 parameter count ---------- */
function drawPC(){const V=+$('#pcV').value,d=+$('#pcD').value,h=+$('#pcH').value;$('#pcVo').textContent=N(V);$('#pcDo').textContent=d;$('#pcHo').textContent=h;
  const E=V*d,X=d*h,H=h*h+h,O=h*V+V,T=E+X+H+O,mx=Math.max(E,X,H,O),pc=v=>(100*v/T).toFixed(1)+'%';
  $('#pcOut').innerHTML=bar('التضمين E',E,mx,`${N(E)} · ${pc(E)}`,'var(--amber)')+bar('W_xh',X,mx,`${N(X)} · ${pc(X)}`,'var(--math)')+bar('W_hh + b_h',H,mx,`${N(H)} · ${pc(H)}`,'var(--math)')+bar('W_hq + b_q',O,mx,`${N(O)} · ${pc(O)}`,'var(--amber)');
  const mac=d*h+h*h+h*V;
  $('#pcCalc').textContent=`total parameters: ${N(T)}\nrecurrent cell (W_xh, W_hh, b_h): ${pc(X+H)};  vocabulary layers (E, W_hq, b_q): ${pc(E+O)}\nmultiply-adds per token: d·h + h·h + h·|V| = ${N(mac)}  (output layer ${(100*h*V/mac).toFixed(1)}%)\nhidden state per sequence: ${h} × 4 bytes = ${N(4*h)} bytes`}
['#pcV','#pcD','#pcH'].forEach(s=>$(s).addEventListener('input',drawPC));drawPC();

/* ---------- 8.5 vanishing gradients ---------- */
function drawVG(){const r=$('#vgR').value/100,d=$('#vgD').value/100,m=segVal('#vgP','v');$('#vgRo').textContent=r.toFixed(2);$('#vgDo').textContent=d.toFixed(2);
  if(m==='a'){const f=r*d,lg=k=>k*Math.log10(f),K=64,lo=Math.min(-2,Math.floor(lg(K))),hi=Math.max(1,Math.ceil(lg(K)));const yt=[];const st=Math.max(1,Math.ceil((hi-lo)/6));for(let v=lo;v<=hi;v+=st)yt.push(v);
    plot($('#vgPlot'),{xmin:0,xmax:K,ymin:lo,ymax:hi,H:230,xt:[0,8,16,32,64],yt,ytf:v=>'10^'+v,xl:'lag k',yl:'‖G(t−k)‖ / ‖G(t)‖',
      raw:(X,Y)=>`<line x1="${X(0)}" x2="${X(K)}" y1="${Y(-2)}" y2="${Y(-2)}" stroke="var(--amber)" stroke-dasharray="5 4"/>`,curves:[{f:lg,c:f<1?'var(--rose)':'var(--math)'}]});
    const k1=f<1?Math.ceil(-2/Math.log10(f)):null;
    $('#vgCalc').textContent=`per-step factor ≈ ρ × mean(1 − H²) = ${r.toFixed(2)} × ${d.toFixed(2)} = ${f.toFixed(3)}\n`+(f<1?`below 1% (dashed) after k = ${k1} steps; at k = 32: ${(f**32).toExponential(1)}`:`≥ 1: the gradient grows ${f.toFixed(2)}^k (exploding; clipping caps the step)`)+`\n(book's trained RNN: ρ ≈ 1.80, mean tanh′ ≈ 0.27 → below 1% by lag 8)`}
  else{plot($('#vgPlot'),{xmin:0,xmax:40,ymin:0,ymax:50,H:230,xt:[0,10,20,30,40],yt:[0,1,10,25,50],xl:'k',yl:'wᵏ',curves:[{f:k=>0.9**k,c:'var(--rose)'},{f:k=>1.1**k,c:'var(--math)'}],
      pts:[{x:40,y:0.9**40,c:'var(--rose)',t:'0.9⁴⁰ = '+(0.9**40).toFixed(3),left:1},{x:40,y:1.1**40,c:'var(--math)',t:'1.1⁴⁰ = '+(1.1**40).toFixed(1),left:1}]});
    $('#vgCalc').textContent=`h(t) = w·h(t−1) + x(t)  →  ∂h(t)/∂h(t−k) = wᵏ\nw = 0.9: 0.9^40 = ${(0.9**40).toFixed(4)} (vanishing)\nw = 1.1: 1.1^40 = ${(1.1**40).toFixed(1)} (exploding)`}}
['#vgR','#vgD'].forEach(s=>$(s).addEventListener('input',drawVG));segOn('#vgP',drawVG);drawVG();

/* ---------- 8.6 greedy vs beam ---------- */
const BM={A:[0.5,{X:0.3,Y:0.3,Z:0.2,W:0.2}],B:[0.4,{X:0.9,Y:0.05,Z:0.05}],C:[0.1,{X:0.6,Y:0.4}]};
function drawBM(){const w=+segVal('#bmW','v');const first=Object.keys(BM).sort((a,b)=>BM[b][0]-BM[a][0]),keep=first.slice(0,w);
  const cands=[];keep.forEach(a=>Object.entries(BM[a][1]).forEach(([b,p])=>cands.push([a+b,BM[a][0]*p])));cands.sort((a,b)=>b[1]-a[1]);
  const best=w===1?[cands[0]]:cands.slice(0,w);
  $('#bmOut').innerHTML=lab('الخطوة ١',first.map(a=>bar(a,BM[a][0],1,BM[a][0].toFixed(2),keep.includes(a)?'var(--green)':'var(--soft)')).join(''))+lab(`الخطوة ٢ (${cands.length} مرشحاً)`,cands.map(c=>bar(c[0],c[1],0.5,c[1].toFixed(3),best.some(b=>b[0]===c[0])?'var(--green)':'var(--soft)')).join(''));
  $('#bmCalc').textContent=(w===1?`greedy: A (0.50) then its best child (0.30) → ${best[0][0]} with 0.50 × 0.30 = 0.150\nmissed: BX = 0.40 × 0.90 = 0.360 (2.4× higher)`:`beam w = 2: keep A and B, expand both, keep top 2\nbest: ${best[0][0]} = ${best[0][1].toFixed(3)}; evaluations: ${Object.keys(BM).length} + ${cands.length} instead of every path`)}
segOn('#bmW',drawBM);drawBM();

/* ---------- 8.6 truncated sampling ---------- */
const TSL={toy:[.45,.25,.15,.10,.05].map(Math.log),flat:Array.from({length:40},(_,i)=>-0.075*i),peak:Array.from({length:40},(_,i)=>i?-0.6-0.11*i:3.2)};
function drawTS(){const D=segVal('#tsD','v'),R=segVal('#tsR','v'),v=+$('#tsV').value,tau=$('#tsT').value/100;$('#tsTo').textContent=tau.toFixed(2);
  const lg=TSL[D],n=lg.length,mx=Math.max(...lg.map(l=>l/tau)),e=lg.map(l=>Math.exp(l/tau-mx)),Z=e.reduce((a,b)=>a+b,0),p=e.map(x=>x/Z);
  let keep,par;if(R==='k'){par=Math.max(1,Math.round(v*n/100));keep=par;$('#tsVo').textContent='k = '+par}
  else if(R==='p'){par=v/100;let c=0;keep=0;while(keep<n&&c<par-1e-12){c+=p[keep];keep++}$('#tsVo').textContent='p = '+par.toFixed(2)}
  else{par=v/100;keep=p.filter(x=>x>=par*p[0]).length;$('#tsVo').textContent='p_min = '+par.toFixed(2)}
  const km=p.slice(0,keep).reduce((a,b)=>a+b,0);
  plot($('#tsPlot'),{xmin:-0.5,xmax:n-0.5,ymin:0,ymax:p[0]*1.1,H:210,xt:n>5?[0,9,19,29,39]:[0,1,2,3,4],yt:[0,+(p[0]/2).toPrecision(2),+p[0].toPrecision(2)],xl:'rank (sorted)',yl:'probability',
    raw:(X,Y)=>p.map((q,i)=>`<rect x="${X(i-0.4)}" y="${Y(q)}" width="${X(i+0.4)-X(i-0.4)}" height="${Y(0)-Y(q)}" fill="${i<keep?'var(--green)':'var(--soft)'}" opacity="${i<keep?.9:.45}"/>`).join('')+(R==='m'?`<line x1="${X(-0.5)}" x2="${X(n-0.5)}" y1="${Y(par*p[0])}" y2="${Y(par*p[0])}" stroke="var(--rose)" stroke-dasharray="5 4"/>`:'')});
  $('#tsCalc').textContent=`τ = ${tau.toFixed(2)}: top token ${p[0].toFixed(3)}, ${n} tokens\nkept ${keep} token(s) holding ${(100*km).toFixed(1)}% of the mass; dropped tail ${(100*(1-km)).toFixed(1)}%\n`+(R==='k'?'top-k keeps a fixed count whatever the model\'s confidence':R==='p'?'top-p keeps the smallest head whose mass reaches p':`min-p keeps tokens ≥ ${par.toFixed(2)} × ${p[0].toFixed(3)} = ${(par*p[0]).toFixed(4)} (dashed line)`)+`\nafter renormalizing, the top token gets ${(p[0]/km).toFixed(3)}`}
segOn('#tsD',drawTS);segOn('#tsR',b=>{$('#tsV').value=b.dataset.v==='k'?40:b.dataset.v==='p'?80:10;drawTS()});['#tsV','#tsT'].forEach(s=>$(s).addEventListener('input',drawTS));drawTS();
