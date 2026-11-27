/* D2L · Chapter 12 · State Space Models — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s12-1','12.1','LSTM وGRU'],['s12-2','12.2','التسلسل إلى تسلسل'],['s12-3','12.3','التكرار الخطي والمسح'],['s12-4','12.4','S4D'],['s12-5','12.5','Mamba'],['s12-6','12.6','الحالة المصفوفية'],['s12-7','12.7','قاعدة الدلتا'],['s12-8','12.8','البنى الهجينة'],['ex','','الخلاصة والتمارين']];
const GL=[
['خلية الذاكرة','memory cell','مسار LSTM الجانبي الذي يُحدَّث بالجمع.'],
['بوابة النسيان','forget gate','كم يبقى من الخلية في كل خطوة.'],
['عمر النصف','half-life','عدد الخطوات حتى تنخفض الإشارة إلى النصف: ln 2 / ln(1/f).'],
['GRU','gated recurrent unit','شبكة تكرارية ببوابتي إعادة ضبط وتحديث.'],
['متجه السياق','context vector','الحالة الوحيدة التي يمر عبرها المصدر إلى المفكك.'],
['BLEU / chrF','BLEU / chrF','مقياسا ترجمة: تطابق كلمات مع عقوبة القِصَر، أو تطابق حروف.'],
['التحديث التآلفي','affine update','hₜ = aₜ ⊙ hₜ₋₁ + bₜ.'],
['المسح التجميعي','associative scan','حساب كل البادئات بعملية تجميعية في log T جولة.'],
['minGRU','minimal GRU','GRU بلا اعتماد للبوابات على الحالة: قابلة للمسح.'],
['نموذج فضاء الحالة','state space model','h′ = Ah + Bx و y = Ch + Dx.'],
['الاحتفاظ الصفري','zero-order hold','تحويل إلى خطوات بافتراض ثبات المدخل خلال كل خطوة.'],
['S4D','diagonal structured SSM','بنك متكاملات متسربة بمعدلات −1…−N وخطوة لكل قناة.'],
['الانتقائية','selectivity','خطوة وكتابة وقراءة تعتمد على الرمز (Mamba).'],
['الذاكرة الترابطية','associative memory','مصفوفة تخزّن أزواجاً بحاصل الضرب الخارجي vkᵀ.'],
['التداخل','interference','تسرب القيم بين المفاتيح غير المتعامدة.'],
['الانتباه الخطي المبوّب','gated linear attention','ذاكرة مصفوفية بتلاشٍ يعتمد على الرمز.'],
['قاعدة الدلتا','delta rule','اقرأ ثم اكتب الخطأ: S += β(v − Sk)kᵀ.'],
['انعكاس هاوسهولدر','Householder reflection','I − 2kkᵀ: يقلب الإشارة على اتجاه k.'],
['حد ويلش','Welch bound','حد أدنى لتداخل m مفتاحاً في d_k بعداً.'],
['البنية الهجينة','hybrid architecture','طبقات تكرارية مع طبقة انتباه كاملة كل بضع طبقات.']];
initPage(SECS,GL);
const N=v=>Math.round(v).toLocaleString('en-US');
const sig=x=>1/(1+Math.exp(-x));

/* ---------- 12.1 LSTM cell ---------- */
function drawLS(){const f=$('#lsF').value/1000,i=$('#lsI').value/100,o=$('#lsO').value/100;$('#lsFo').textContent=f.toFixed(3);$('#lsIo').textContent=i.toFixed(2);$('#lsOo').textContent=o.toFixed(2);
  const T=120,W=10,C=[],H=[];let c=0;for(let t=1;t<=T;t++){c=f*c+i*(t<=W?1:0);C.push([t,c]);H.push([t,o*Math.tanh(c)])}
  const mx=Math.max(1,...C.map(q=>q[1]))*1.1,hl=Math.log(2)/Math.log(1/f);
  plot($('#lsPlot'),{xmin:0,xmax:T,ymin:0,ymax:mx,H:220,xt:[0,10,40,80,120],yt:[0,+(mx/2).toFixed(2),+(mx/1.1).toFixed(2)],xl:'step',lines:[{pts:C,c:'var(--math)',w:2.5},{pts:H,c:'var(--green)',w:2.2,dash:1}],pts:[{x:W,y:C[W-1][1],c:'var(--math)',t:'cell c',r:3},{x:60,y:H[59][1],c:'var(--green)',t:'exposed h',r:3}]});
  $('#lsCalc').textContent=`write c̃ = 1 for steps 1–${W}, then input 0\nc at step ${W}: ${C[W-1][1].toFixed(3)}   at step 60: ${C[59][1].toFixed(3)}   at step 120: ${C[119][1].toFixed(3)}\nhalf-life ln 2 / ln(1/f) = ${hl.toFixed(1)} steps;  h = o·tanh(c) (book: c = 0.71, o = 0.2 → h = ${(0.2*Math.tanh(0.71)).toFixed(2)})`}
['#lsF','#lsI','#lsO'].forEach(s=>$(s).addEventListener('input',drawLS));drawLS();

/* ---------- 12.2 BLEU vs chrF ---------- */
const REF='we will visit our grandparents tomorrow',BLP=['we will visits our grandparents tomorrow','we are going to see our grandparents tomorrow',REF];
const ngr=(a,n)=>{const m=new Map();for(let i=0;i+n<=a.length;i++){const k=a.slice(i,i+n).join('\u0001');m.set(k,(m.get(k)||0)+1)}return m};
function bleu(c,r){const C=c.split(/\s+/).filter(Boolean),R=r.split(/\s+/);let lp=0;const ps=[];for(let n=1;n<=4;n++){const cm=ngr(C,n),rm=ngr(R,n);let mt=0,tot=0;cm.forEach((v,k)=>{tot+=v;mt+=Math.min(v,rm.get(k)||0)});const p=tot?mt/tot:0;ps.push(p);lp+=p>0?Math.log(p)/4:-Infinity}
  const bp=Math.exp(Math.min(0,1-R.length/Math.max(1,C.length)));return {s:bp*Math.exp(lp),ps,bp}}
function chrf(c,r){const C=[...c.replace(/\s+/g,'')],R=[...r.replace(/\s+/g,'')];let P=0,Rc=0,k=0;for(let n=1;n<=6;n++){const cm=ngr(C,n),rm=ngr(R,n);let mt=0,tc=0,tr=0;cm.forEach((v,key)=>{tc+=v;mt+=Math.min(v,rm.get(key)||0)});rm.forEach(v=>tr+=v);if(tc&&tr){P+=mt/tc;Rc+=mt/tr;k++}}
  P/=k||1;Rc/=k||1;const b2=4;return P+Rc?(1+b2)*P*Rc/(b2*P+Rc):0}
function drawBL(){const c=$('#blC').value.trim().toLowerCase(),b=bleu(c,REF),f=chrf(c,REF);
  $('#blOut').innerHTML=bar('BLEU',b.s,1,b.s.toFixed(2),'var(--rose)')+bar('chrF',f,1,f.toFixed(2),'var(--green)');
  $('#blCalc').textContent=`n-gram precisions p₁…p₄: ${b.ps.map(p=>p.toFixed(2)).join(', ')}   brevity penalty ${b.bp.toFixed(2)}\nBLEU = BP × (p₁p₂p₃p₄)^¼ = ${b.s.toFixed(3)}  — any p_n = 0 makes it 0\nchrF (character 1–6-grams, β = 2) = ${f.toFixed(3)}`}
$('#blC').addEventListener('input',drawBL);segOn('#blP',b=>{$('#blC').value=BLP[+b.dataset.v];drawBL()});drawBL();

/* ---------- 12.3 Hillis–Steele scan ---------- */
let scSeed=4,scR=0;
function drawSC(){const R=rng(scSeed),T=8,a=[],b=[];for(let t=0;t<T;t++){a.push(+(0.3+0.6*R()).toFixed(2));b.push(+(R()*2-1).toFixed(2))}
  let A=a.slice(),B=b.slice();const upd=[];for(let r=0;r<scR;r++){const s=2**r,nA=A.slice(),nB=B.slice(),u=[];for(let t=s;t<T;t++){nA[t]=A[t-s]*A[t];nB[t]=A[t]*B[t-s]+B[t];u.push(t)}A=nA;B=nB;if(r===scR-1)upd.push(...u)}
  const seq=[];let h=0;for(let t=0;t<T;t++){h=a[t]*h+b[t];seq.push(h)}
  const done=scR>=3;
  $('#scOut').innerHTML=lab('aₜ',grid([a.map(x=>x.toFixed(2))]))+lab('bₜ',grid([b.map(x=>x.toFixed(2))]))+lab(`B after ${scR} round(s)`,grid([B.map(x=>x.toFixed(2))],(i,j)=>upd.includes(j)?'h':done?'g':''))+lab('sequential hₜ',grid([seq.map(x=>x.toFixed(2))],()=>'m'));
  $('#scCalc').textContent=`round ${scR}${scR?`: stride ${2**(scR-1)}, positions ${upd.map(x=>x+1).join(', ')} combine with position t − ${2**(scR-1)}`:': nothing combined yet'}\n(a₁, b₁) • (a₂, b₂) = (a₁a₂, a₂b₁ + b₂)\n`+(done?`after log₂ 8 = 3 rounds every B equals the sequential state (max diff ${Math.max(...B.map((x,t)=>Math.abs(x-seq[t]))).toExponential(1)})`:`positions 1…${2**scR} are already final`);
  $('#scNext').textContent=scR<3?'الجولة التالية':'ابدأ من جديد'}
$('#scNext').addEventListener('click',()=>{scR=scR<3?scR+1:0;drawSC()});$('#scNew').addEventListener('click',()=>{scSeed++;scR=0;drawSC()});drawSC();

/* ---------- 12.4 S4D timescales ---------- */
function drawS4(){const D=10**($('#s4D').value/10);$('#s4Do').textContent=($('#s4D').value/10).toFixed(1);const ns=[1,2,4,8,16],cols=['var(--green)','var(--math)','var(--amber)','var(--rose)','var(--soft)'],K=400;
  plot($('#s4Plot'),{xmin:0,xmax:K,ymin:0,ymax:1.05,H:220,xt:[0,100,200,300,400],yt:[0,0.5,1],xl:'steps after the impulse',yl:'āᵏ',curves:ns.map((n,i)=>({f:k=>Math.exp(-D*n*k),c:cols[i]})),pts:ns.map((n,i)=>({x:Math.min(K-40,Math.log(2)/(D*n)),y:0.5,c:cols[i],r:3,t:'n='+n}))});
  $('#s4Calc').textContent=`Δ = ${D.toExponential(1)}: ā_n = e^(−Δn)\nhalf-lives ln 2/(Δn): ${ns.map(n=>`n=${n}: ${(Math.log(2)/(D*n)).toFixed(1)}`).join('   ')}\nS4D init: Δ log-uniform in [0.001, 0.1] → half-lives from 0.43 (Δ = 0.1, n = 16) to 693 steps (Δ = 0.001, n = 1)`}
$('#s4D').addEventListener('input',drawS4);drawS4();

/* ---------- 12.5 selective gate ---------- */
const MBX=Array(24).fill(0);[2,9,15].forEach(i=>MBX[i]=1);
function drawMB(){const h=[],hf=[];let s=0,sf=0;MBX.forEach(m=>{const st=m?2:-4.6,z=sig(-st);s=z*s+(1-z)*(m?1:0);h.push(s);sf=0.5*sf+0.5*(m?1:0);hf.push(sf)});
  $('#mbIn').innerHTML=lab('الرموز (١ = مهم، ٠ = حشو)',grid([MBX],(i,j)=>MBX[j]?'h':'',{click:1}));
  $$('#mbIn .tgrid.click i').forEach(e=>e.addEventListener('click',()=>{const j=+e.dataset.j;MBX[j]=1-MBX[j];drawMB()}));
  plot($('#mbPlot'),{xmin:0.5,xmax:24.5,ymin:0,ymax:1.05,H:200,xt:[1,6,12,18,24],yt:[0,0.5,1],xl:'t',lines:[{pts:h.map((v,i)=>[i+1,v]),c:'var(--green)',w:2.6},{pts:hf.map((v,i)=>[i+1,v]),c:'var(--rose)',w:1.6,dash:1}]});
  $('#mbCalc').textContent=`marked token: s = +2 → Δ = softplus(2) = ${Math.log(1+Math.exp(2)).toFixed(2)}, keep gate e^(−Δ) = σ(−2) = ${sig(-2).toFixed(2)} (overwrite)\nfiller token: s = −4.6 → Δ = ${Math.log(1+Math.exp(-4.6)).toFixed(3)}, keep gate ${sig(4.6).toFixed(3)} (freeze)\ngreen: selective state, final ${h[23].toFixed(3)} · dashed red: fixed gate 0.5 (time-invariant), final ${hf[23].toFixed(3)}`}
drawMB();

/* ---------- 12.6 matrix memory capacity ---------- */
let msSeed=6;
const unit=(R,d)=>{const v=Array.from({length:d},()=>gauss(R)),n=Math.hypot(...v);return v.map(x=>x/n)};
function drawMS(){const d=2**+$('#msD').value,n=2**+$('#msN').value;$('#msDo').textContent=d;$('#msNo').textContent=n;const R=rng(msSeed+d*7+n);
  const K=[],V=[];for(let j=0;j<n;j++){K.push(unit(R,d));V.push(unit(R,d))}const cb=V.slice();while(cb.length<Math.max(256,n))cb.push(unit(R,d));
  const S=Array.from({length:d},()=>new Float64Array(d));for(let j=0;j<n;j++)for(let a=0;a<d;a++)for(let b=0;b<d;b++)S[a][b]+=V[j][a]*K[j][b];
  let err=0,ok=0;for(let j=0;j<n;j++){const r=S.map(row=>row.reduce((s,x,b)=>s+x*K[j][b],0));err+=r.reduce((s,x,a)=>s+(x-V[j][a])**2,0);let bi=0,bv=-1e9;cb.forEach((c,i)=>{const s=c.reduce((p,x,a)=>p+x*r[a],0);if(s>bv){bv=s;bi=i}});if(bi===j)ok++}
  err/=n;const pred=(n-1)/d;
  $('#msOut').innerHTML=bar('الخطأ التربيعي المقيس',err,Math.max(err,pred,1),err.toFixed(3),'var(--rose)')+bar('المتوقع (n − 1)/d_k',pred,Math.max(err,pred,1),pred.toFixed(3),'var(--soft)')+bar('الاسترجاع',ok/n,1,(100*ok/n).toFixed(0)+'%','var(--green)');
  $('#msCalc').textContent=`S = Σ vⱼkⱼᵀ, ${d}×${d} = ${N(d*d)} entries, ${n} random unit pairs\nmean ‖Skⱼ − vⱼ‖² = ${err.toFixed(3)} (theory ${pred.toFixed(3)});  nearest-of-${cb.length} recall ${ok}/${n}\n1-D competitor variance (n − 1)/(d_k·d_v) = ${((n-1)/(d*d)).toFixed(4)}: recall survives far beyond n = d_k`}
['#msD','#msN'].forEach(s=>$(s).addEventListener('input',drawMS));$('#msGo').addEventListener('click',()=>{msSeed++;drawMS()});drawMS();

/* ---------- 12.7 additive vs delta ---------- */
let dlSeed=2;
function drawDL(){const beta=+segVal('#dlB','v'),d=64,Rs=[1,2,4,8],R=rng(dlSeed),res=Rs.map(Rn=>{const Sa=Array.from({length:d},()=>new Float64Array(d)),Sd=Array.from({length:d},()=>new Float64Array(d)),last=[];
  for(let r=0;r<Rn;r++)for(let k=0;k<8;k++){const v=unit(R,d);last[k]=v;for(let a=0;a<d;a++){Sa[a][k]+=v[a];Sd[a][k]+=beta*(v[a]-Sd[a][k])}}
  const cos=(S,k)=>{const r=S.map(row=>row[k]),nr=Math.hypot(...r);return r.reduce((s,x,a)=>s+x*last[k][a],0)/nr};
  let ca=0,cd=0;for(let k=0;k<8;k++){ca+=cos(Sa,k);cd+=cos(Sd,k)}return [ca/8,cd/8]});
  $('#dlOut').innerHTML=Rs.map((Rn,i)=>bar(`R = ${Rn} · جمعي`,Math.max(0,res[i][0]),1,res[i][0].toFixed(2),'var(--rose)')+bar(`R = ${Rn} · دلتا`,Math.max(0,res[i][1]),1,res[i][1].toFixed(2),'var(--green)')).join('');
  $('#dlCalc').textContent=`keys e₁…e₈ (orthonormal, no cross-talk); each rewritten R times with fresh random unit values\nadditive S += vkᵀ returns the sum of all R values: cosine with the latest ≈ 1/√R\ndelta S += β(v − Sk)kᵀ with β = ${beta}: `+(beta===1?'reads then replaces exactly → cosine 1':'moves halfway each write → latest value dominates but older ones linger')}
segOn('#dlB',drawDL);$('#dlGo').addEventListener('click',()=>{dlSeed++;drawDL()});drawDL();

/* ---------- 12.8 Welch bound ---------- */
function drawWL(){const dk=2**+$('#wlD').value,m=2**+$('#wlM').value,r=+$('#wlR').value;$('#wlDo').textContent=dk;$('#wlMo').textContent=m;$('#wlRo').textContent=r;
  const w=m>dk?(m-dk)/(dk*(m-1)):0,rnd=1/dk,kv=1/(r+1);
  $('#wlOut').innerHTML=bar('حد ويلش (الأدنى الممكن)',w,rnd,w.toFixed(4),'var(--rose)')+bar('مفاتيح عشوائية 1/d_k',rnd,rnd,rnd.toFixed(4),'var(--soft)')+bar('ذاكرة الهجين / الانتباه الكامل',kv,1,(100*kv).toFixed(0)+'%','var(--green)');
  $('#wlCalc').textContent=`m = ${m} unit keys in d_k = ${dk} dims: mean squared overlap ≥ (m − d_k)/(d_k(m − 1)) = ${w.toFixed(4)}\nthat is ${rnd?(100*w/rnd).toFixed(1):0}% of what random keys give: ${w/rnd>0.8?'almost no room for training to reduce cross-talk':'training can still arrange keys to reduce cross-talk'}\nhybrid with ${r} recurrent layers per attention layer: KV cache ≈ 1/(r + 1) = ${(100*kv).toFixed(0)}% for n ≫ window`}
['#wlD','#wlM','#wlR'].forEach(s=>$(s).addEventListener('input',drawWL));drawWL();
