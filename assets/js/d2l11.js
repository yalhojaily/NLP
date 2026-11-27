/* D2L · Chapter 11 · Transformers — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s11-1','11.1','كتلة المحوّل'],['s11-2','11.2','GPT'],['s11-3','11.3','ذاكرة المفاتيح والقيم'],['s11-4','11.4','المرمّزات والمرمّز–المفكك'],['s11-5','11.5','محوّل الرؤية'],['s11-6','11.6','قوانين التحجيم'],['s11-7','11.7','خليط الخبراء'],['ex','','الخلاصة والتمارين']];
const GL=[
['كتلة المحوّل','transformer block','انتباه ثم شبكة لكل رمز، كلاهما يضيف إلى مجرى البقايا.'],
['الشبكة لكل موقع','position-wise FFN','شبكة صغيرة تُطبَّق على كل رمز وحده.'],
['التطبيع المسبق','pre-norm','تطبيع مدخل كل فرع لا المجرى الرئيسي.'],
['انهيار الرموز','token collapse','تقارب كل الرموز إلى متجه واحد عبر العمق.'],
['RMSNorm','RMSNorm','القسمة على جذر متوسط المربعات، بلا طرح متوسط.'],
['QK-Norm','QK-Norm','تطبيع الاستعلامات والمفاتيح لكل رأس لتقييد الدرجات.'],
['SwiGLU','SwiGLU','شبكة ببوابة: SiLU(xW_g) ⊙ xW₁ ثم W₂.'],
['ربط الأوزان','weight tying','استعمال مصفوفة التضمين نفسها في رأس المخرج.'],
['ذاكرة المفاتيح والقيم','KV cache','حفظ مفاتيح وقيم الرموز السابقة لتوليد خطي.'],
['الملء المسبق / التوليد','prefill / decode','تمرير البادئة كاملة، ثم رمز واحد في كل خطوة.'],
['خط السقف','roofline','حد الأداء بين قدرة الحساب وسرعة الذاكرة.'],
['المصارف','attention sinks','أول الرموز التي يلقي فيها الانتباه وزنه الزائد.'],
['نمذجة اللغة المقنَّعة','masked language modeling','إخفاء 15% من الرموز والتنبؤ بها من الجهتين.'],
['الانتباه المتقاطع','cross-attention','استعلامات من المفكك ومفاتيح وقيم من المرمّز.'],
['محوّل الرؤية','Vision Transformer','رقع الصورة كرموز في مرمّز محوّل.'],
['رمز التصنيف','<cls> token','رمز متعلَّم في البداية نصنّف من متجهه الأخير.'],
['قانون التحجيم','scaling law','الخسارة قانون قوة في المعاملات والبيانات.'],
['الأمثل حسابياً','compute-optimal (Chinchilla)','أفضل توزيع لميزانية ثابتة: نحو 20 رمزاً لكل معامل.'],
['خليط الخبراء','mixture of experts','عدة شبكات يختار الموجّه منها k لكل رمز.'],
['الموجّه','router','طبقة خطية وsoftmax تعطي احتمال كل خبير.'],
['عامل السعة','capacity factor','هامش المخزن الثابت لكل خبير فوق الحمل المتساوي.'],
['موازنة الحمل','load balancing','خسارة مساعدة أو انحياز يوزّع الرموز على الخبراء.']];
initPage(SECS,GL);
const N=v=>Math.round(v).toLocaleString('en-US');
const fm=v=>v>=1e9?(v/1e9).toFixed(2)+'B':v>=1e6?(v/1e6).toFixed(2)+'M':v>=1e3?(v/1e3).toFixed(1)+'K':String(Math.round(v));
const fb=b=>b>=2**30?(b/2**30).toFixed(2)+' GiB':b>=2**20?(b/2**20).toFixed(1)+' MiB':(b/1024).toFixed(0)+' KiB';

/* ---------- 11.1 token collapse ---------- */
function drawTC(){const g2=$('#tcG').value/100;$('#tcGo').textContent=g2.toFixed(2);const s=k=>Math.pow(1+Math.pow(1+g2*g2,k)/63,-0.5),lg=k=>Math.log10(s(k));const lo=Math.min(-1,Math.floor(lg(32)));const yt=[];for(let v=lo;v<=0;v++)yt.push(v);
  plot($('#tcPlot'),{xmin:0,xmax:32,ymin:lo,ymax:0.1,H:220,xt:[0,8,16,24,32],yt,ytf:v=>'10^'+v,xl:'block k',yl:'token spread s',curves:[{f:lg,c:'var(--rose)'}],pts:[{x:32,y:Math.log10(0.37),c:'var(--green)',t:'pre-norm, Xavier (book: 0.37)',left:1}]});
  $('#tcCalc').textContent=`post-norm: each block multiplies the common/distinct energy ratio by 1 + g⁴ = ${(1+g2*g2).toFixed(4)}\ns₈ = ${s(8).toExponential(2)}   s₁₆ = ${s(16).toExponential(2)}   s₃₂ = ${s(32).toExponential(2)}\ng² = 1 is Xavier; σ = 0.02 gives g² = 0.0004·d (0.10 at d = 256, 1.64 at d = 4096)`}
$('#tcG').addEventListener('input',drawTC);drawTC();

/* ---------- 11.1 LayerNorm vs RMSNorm ---------- */
const NMX=[[1,2,3,6],[3,6,9,18],[11,12,13,16]];
function drawNM(){const x=NMX[+segVal('#nmX','v')],n=4,mu=x.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(x.reduce((a,b)=>a+(b-mu)**2,0)/n),rms=Math.sqrt(x.reduce((a,b)=>a+b*b,0)/n);
  const ln=x.map(v=>((v-mu)/sd).toFixed(2)),rn=x.map(v=>(v/rms).toFixed(2));
  $('#nmOut').innerHTML=lab('x',grid([x]))+lab('LayerNorm',grid([ln],()=>'m'))+lab('RMSNorm',grid([rn],()=>'g'));
  $('#nmCalc').textContent=`mean μ = ${mu.toFixed(2)}, std = ${sd.toFixed(3)}, RMS = ${rms.toFixed(3)}\nLayerNorm: (x − μ)/std — unchanged by ×3 and by +10\nRMSNorm: x/RMS — unchanged by ×3, changed by +10 (no centering)`}
segOn('#nmX',drawNM);drawNM();

/* ---------- 11.1 parameter census ---------- */
const PCP=[{n:'GPT-2 Small',L:12,d:768,V:50257,P:1024,kv:768,ff:2,dff:3072,tied:1},{n:'book GPT',L:6,d:256,V:256,P:0,kv:256,ff:3,dff:683,tied:1},{n:'Llama 3 8B',L:32,d:4096,V:128256,P:0,kv:1024,ff:3,dff:14336,tied:0}];
function drawPC(){const p=PCP[+segVal('#pcP','v')],att=2*p.d*p.d+2*p.d*p.kv,ffn=p.ff*p.d*p.dff,blk=p.L*(att+ffn),emb=p.V*p.d*(p.tied?1:2)+p.P*p.d,T=blk+emb,mx=Math.max(blk,emb);
  $('#pcOut').innerHTML=bar('الكتل: الانتباه',p.L*att,mx,fm(p.L*att),'var(--math)')+bar('الكتل: الشبكة',p.L*ffn,mx,fm(p.L*ffn),'var(--amber)')+bar(p.tied?'التضمين (مربوط بالرأس)':'التضمين + الرأس',emb,mx,fm(emb),'var(--green)');
  $('#pcCalc').textContent=`${p.n}: L = ${p.L}, d = ${p.d}, V = ${N(p.V)}${p.kv<p.d?`, GQA (K,V width ${p.kv})`:''}, FFN ${p.ff===2?'GELU 4d':'SwiGLU '+p.dff}\nblocks ${fm(blk)} (= ${(blk/(p.L*p.d*p.d)).toFixed(2)} L·d²)   embeddings ${fm(emb)} (${(100*emb/T).toFixed(1)}%)   total ${fm(T)}`}
segOn('#pcP',drawPC);drawPC();

/* ---------- 11.2 loss landmarks ---------- */
(function(){const R=[['تخمين منتظم ln 256',5.55,'var(--soft)'],['تكرار البايتات (أحادي)',3.17,'var(--soft)'],['جدول الأزواج',2.45,'var(--soft)'],['شبكة تكرارية مطابقة الحجم',1.4,'var(--rose)'],['GPT بست كتل (1,000 خطوة)',1.34,'var(--green)']];
  $('#lmOut').innerHTML=R.map(r=>bar(r[0],r[1],5.6,r[1].toFixed(2),r[2])).join('');
  $('#lmCalc').textContent=`nats per byte on WikiText-103 validation bytes (book's numbers)\n1.34 nats/byte = ${(1.34/Math.log(2)).toFixed(2)} bits/byte; the RNN value is its plateau at window positions ≥ 16`})();

/* ---------- 11.3 KV cache ---------- */
const KVP=[{L:12,dh:64,b:4,W:498e6,bw:1e12,hk:[1,2,3,4,6,12],def:5,n:'GPT-2 Small fp32, 1 TB/s'},{L:32,dh:128,b:2,W:16.06e9,bw:3.35e12,hk:[1,2,4,8,16,32],def:3,n:'Llama 3 8B bf16, 3.35 TB/s'}];
let kvLast=0;
function drawKV(){const pi=+segVal('#kvP','v'),p=KVP[pi];if(pi!==kvLast){$('#kvH').value=p.def;kvLast=pi}
  const n=2**+$('#kvN').value,B=2**+$('#kvB').value,H=p.hk[+$('#kvH').value];$('#kvNo').textContent=N(n);$('#kvBo').textContent=B;$('#kvHo').textContent=H;
  const per=2*p.b*p.L*H*p.dh,M=per*n*B,mx=Math.max(M,p.W);
  $('#kvOut').innerHTML=bar('ذاكرة المفاتيح والقيم',M,mx,fb(M),M>p.W?'var(--rose)':'var(--math)')+bar('الأوزان',p.W,mx,fb(p.W),'var(--amber)');
  const t=(p.W+M)/p.bw*1000;
  $('#kvCalc').textContent=`${p.n}\nper token: 2 × ${p.b} B × ${p.L} layers × ${H} KV heads × ${p.dh} = ${fb(per)}\ncache for n = ${N(n)}, B = ${B}: ${fb(M)}  (${(M/p.W).toFixed(2)}× the weights)\ndecode step floor ≈ (weights + cache)/bandwidth = ${t.toFixed(2)} ms → ≤ ${N(B*1000/t)} tokens/s for the batch`}
segOn('#kvP',drawKV);['#kvN','#kvB','#kvH'].forEach(s=>$(s).addEventListener('input',drawKV));drawKV();

/* ---------- 11.4 MLM masking ---------- */
const MLS='Homarus gammarus, known as the European lobster, is a species of clawed lobster.';let mlSeed=3;
function drawML(){const R=rng(mlSeed),m=[...MLS].map(c=>c!==' '&&R()<0.15);const cnt=m.filter(Boolean).length;
  $('#mlOut').innerHTML=[...MLS].map((c,i)=>m[i]?`<span style="background:var(--amber-soft);border:1px solid var(--amber);border-radius:4px;padding:0 3px">▢</span>`:esc(c)).join('');
  $('#mlCalc').textContent=`masked ${cnt} of ${[...MLS].filter(c=>c!==' ').length} characters (p = 0.15)\ntargets: ${[...MLS].filter((c,i)=>m[i]).join(' ')}\nloss on these positions only (others get label −100); every masked position sees both left and right context`}
$('#mlGo').addEventListener('click',()=>{mlSeed++;drawML()});drawML();

/* ---------- 11.5 ViT tokens ---------- */
function drawVT(){const S=+segVal('#vtI','v'),p=+segVal('#vtP','v'),m=(S/p)**2,pix=S*S,mx=pix*pix;
  $('#vtOut').innerHTML=bar('رموز',m,pix,N(m),'var(--math)')+bar('أزواج الانتباه',m*m,mx,N(m*m),'var(--amber)');
  $('#vtCalc').textContent=`${S}×${S} image, patch ${p}×${p}: (${S}/${p})² = ${N(m)} tokens (+1 <cls>)\nattention pairs per head and layer: ${N(m*m)}\nvs pixels as tokens: ${N(pix)} tokens, ${(pix*pix).toExponential(2)} pairs → ${p}⁴ = ${N(p**4)}× fewer pairs`}
segOn('#vtI',drawVT);segOn('#vtP',drawVT);drawVT();

/* ---------- 11.6 IsoFLOP ---------- */
const CHE=1.69,CHB=410.7,CHa=0.34,CHA=CHB*Math.pow(0.05,CHa);const chL=(n,d)=>CHE+CHA/n**CHa+CHB/d**CHa;
function drawCH(){const C=10**($('#chC').value/10);$('#chCo').textContent=($('#chC').value/10).toFixed(1);const f=l=>{const n=10**l;return chL(n,C/(6*n))};
  let best=0,bv=1e9;for(let l=5;l<=14;l+=0.005){const v=f(l);if(v<bv){bv=v;best=l}}
  const Ns=10**best,Ds=C/(6*Ns);
  plot($('#chPlot'),{xmin:5,xmax:14,ymin:1.6,ymax:4,H:230,xt:[5,7,9,11,13],yt:[2,2.5,3,3.5,4],ytf:v=>v.toFixed(1),xl:'log₁₀ N (parameters)',yl:'loss',curves:[{f,c:'var(--math)'}],pts:[{x:best,y:bv,c:'var(--green)',r:6,t:'N* = '+fm(Ns)}]});
  $('#chCalc').textContent=`C = ${C.toExponential(2)} FLOPs = 6ND\noptimum: N* = ${fm(Ns)}, D* = ${fm(Ds)} tokens, D*/N* = ${(Ds/Ns).toFixed(1)}, loss ${bv.toFixed(3)}\n10× smaller model on 10× data: ${f(best-1).toFixed(3)}   10× larger on 10× less: ${f(best+1).toFixed(3)}\n(Chinchilla: C = 5.76e23 → 70B params on 1.4T tokens)`}
$('#chC').addEventListener('input',drawCH);drawCH();

/* ---------- 11.7 MoE routing ---------- */
function drawMO(){const sk=$('#moK').value/10,g=$('#moG').value/100,bal=segVal('#moB','v')==='1',E=8,n=256;$('#moKo').textContent=sk.toFixed(1);$('#moGo').textContent=g.toFixed(2);
  const R=rng(9),pref=[1,0.6,0.3,0,0,0,-0.2,-0.4],P=[];for(let t=0;t<n;t++)P.push(smaxv(pref.map(w=>sk*w+gauss(R))));
  const b=new Array(E).fill(0),route=()=>P.map(p=>{let bi=0;for(let e=1;e<E;e++)if(p[e]+b[e]>p[bi]+b[bi])bi=e;return bi});
  if(bal)for(let it=0;it<300;it++){const r=route(),f=new Array(E).fill(0);r.forEach(e=>f[e]++);for(let e=0;e<E;e++)b[e]+=0.01*Math.sign(1/E-f[e]/n)}
  const r=route(),load=new Array(E).fill(0);r.forEach(e=>load[e]++);const S=Math.ceil(g*n/E),drop=load.reduce((a,l)=>a+Math.max(0,l-S),0),mx=Math.max(...load,S);
  $('#moOut').innerHTML=load.map((l,e)=>bar('الخبير '+(e+1),l,mx,l+(l>S?` (−${l-S})`:''),l>S?'var(--rose)':'var(--green)')).join('');
  const aux=E*load.reduce((a,l,e)=>a+(l/n)*P.reduce((s,p)=>s+p[e],0)/n,0);
  $('#moCalc').textContent=`capacity S = ⌈${g.toFixed(2)} × ${n}·1/${E}⌉ = ${S} tokens per expert\nbusiest expert: ${Math.max(...load)} tokens (${(100*Math.max(...load)/n).toFixed(0)}%, even share ${n/E})\ndropped: ${drop} of ${n} (${(100*drop/n).toFixed(0)}%)   auxiliary loss E·Σ f·p̄ = ${aux.toFixed(2)} (1 = balanced)`+(bal?`\nbias controller: b_e += 0.01·sign(1/E − f_e), 300 updates (selection only)`:'')}
function smaxv(a){const m=Math.max(...a),e=a.map(x=>Math.exp(x-m)),s=e.reduce((p,q)=>p+q,0);return e.map(x=>x/s)}
['#moK','#moG'].forEach(s=>$(s).addEventListener('input',drawMO));segOn('#moB',drawMO);drawMO();
