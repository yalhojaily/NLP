/* D2L · Chapter 5 · Computation — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s5-1','5.1','الوحدات وبناء النماذج'],['s5-2','5.2','المعاملات والحالة والذاكرة'],['s5-3','5.3','التهيئة'],['s5-4','5.4','الطبقات والدوال المخصصة'],['s5-5','5.5','صيغ الأعداد'],['s5-6','5.6','الحفظ والتحميل'],['s5-7','5.7','المعالجات الرسومية والذاكرة'],['s5-8','5.8','قابلية التكرار والفحص'],['ex','','الخلاصة والتمارين']];
const GL=[
['الوحدة','module','لبنة تملك معاملات ووحدات أبناء وتعرّف مروراً أمامياً.'],
['التسجيل','registration','ربط الابن أو الموتر بأبيه كي تراه الشجرة.'],
['الوصلة المتبقية','residual connection','y = x + f(x).'],
['التهيئة الكسولة','lazy initialization','تأجيل معرفة شكل المدخل إلى أول تمرير.'],
['المخزن','buffer','موتر يُحفظ ويُنقل مع النموذج ولا يتدرّب.'],
['قاموس الحالة','state dict','قاموس من مسارات الشجرة إلى الموترات.'],
['ربط الأوزان','weight tying','استعمال مصفوفة واحدة في موضعين (التضمين ورأس المخرج).'],
['التجميد','freezing','منع تحديث معاملات بإيقاف تدرّجها.'],
['الجهاز الوهمي','meta device','موترات بأشكال وأنواع بلا ذاكرة، للعدّ دون حجز.'],
['الكسب','gain','معامل يضرب الانحراف في قاعدة التهيئة g/√n_in.'],
['الطبيعي المقطوع','truncated normal','توزيع طبيعي يُعاد سحب ما يتجاوز حداً منه.'],
['إسقاط المخرج','output projection','الطبقة الأخيرة في جسم الكتلة المتبقية.'],
['RMSNorm','root-mean-square normalization','قسمة المتجه على جذر متوسط مربعاته وضربه في كسب.'],
['المقدِّر المستقيم','straight-through estimator','تقريب أمامي، وتمرير التدرّج خلفياً كأنه الهوية.'],
['التكميم','quantization','تمثيل الأوزان بأعداد قليلة البتات.'],
['المدى / الدقة','dynamic range / precision','أكبر الأعداد وأصغرها / المسافة بين الأعداد المتجاورة.'],
['الأعداد دون الطبيعية','subnormal numbers','أعداد صغيرة جداً تحت أصغر عدد طبيعي تفقد بتاتها.'],
['الدقة المختلطة','mixed precision','أوزان رئيسية بـfp32 وحساب بـ16 بت.'],
['تحجيم الخسارة','loss scaling','ضرب الخسارة في S لرفع التدرّجات فوق منطقة التلاشي.'],
['safetensors','safetensors','صيغة حفظ بلا كود: طول وترويسة JSON وبيانات خام.'],
['نقطة الاستئناف','training checkpoint','النموذج والمحسِّن والمولّد والخطوة والإعداد.'],
['التنفيذ غير المتزامن','asynchronous execution','بايثون يدرج العمليات في طابور ويعود فوراً.'],
['نقطة المزامنة','synchronization point','لحظة ينتظر فيها بايثون نتيجة من المعالج الرسومي.'],
['إعادة حساب التنشيطات','activation checkpointing','حفظ حدود المقاطع وإعادة حساب ما بينها خلفياً.'],
['البذرة','seed','القيمة التي تحدد تسلسل المولّد شبه العشوائي كله.'],
['عدم التجميعية','non-associativity','(a + b) + c ≠ a + (b + c) في الحساب العشري.'],
['الخطّاف','hook','دالة تُسجَّل من الخارج وتُستدعى قبل الطبقة أو بعدها.']];
initPage(SECS,GL);
const NF=v=>v.toLocaleString('en-US');
const bytes=b=>b>=1e9?(b/1e9).toFixed(b>=1e11?0:1)+' GB':b>=1e6?(b/1e6).toFixed(1)+' MB':b>=1e3?(b/1e3).toFixed(1)+' KB':b+' B';

/* ---------- 5.1 module tree ---------- */
const MTW=[64,128,256,512,768,1024];let mtSel='';
function drawMT(){
  const W=MTW[+$('#mtH').value],B=+$('#mtB').value,plain=$('#mtList').checked;$('#mtHo').textContent=W;$('#mtBo').textContent=B;
  const lin=(a,b)=>a*b+b,inP=lin(784,W),blk=2*lin(W,W),outP=lin(W,10);
  const nodes=[];const add=(depth,path,label,params,reg=true)=>nodes.push({depth,path,label,params,reg});
  add(0,'net','MLP (config: 784 → '+W+' × '+B+' blocks → 10)',null);
  if(!plain){add(1,'0','Linear(784, '+W+')',inP);for(let i=1;i<=B;i++){add(1,String(i),'ResidualBlock('+W+')',blk);add(2,i+'.body','Sequential',blk);add(3,i+'.body.0','Linear('+W+', '+W+')',lin(W,W));add(3,i+'.body.1','ReLU',0);add(3,i+'.body.2','Linear('+W+', '+W+')',lin(W,W))}add(1,String(B+1),'Linear('+W+', 10)',outP)}
  else{add(1,'inp','Linear(784, '+W+')',inP);add(1,'blocks','python list [ … ]  ← not a module, not registered',null,false);for(let i=0;i<B;i++)add(2,'blocks['+i+']','ResidualBlock('+W+')',blk,false);add(1,'head','Linear('+W+', 10)',outP)}
  $('#mtTree').innerHTML=nodes.map(n=>`<div data-p="${n.path}" style="padding-left:${n.depth*22}px;cursor:pointer;${n.reg?'':'opacity:.45;'}${n.path===mtSel?'background:var(--amber-soft);border-radius:4px;':''}">${n.depth?'└─ ':''}<b style="color:${n.reg?'var(--green)':'var(--rose)'}">${n.path}</b> ${esc(n.label)}${n.params?` <span style="color:var(--soft)">· ${NF(n.params)}</span>`:''}</div>`).join('');
  $$('#mtTree div').forEach(d=>d.onclick=()=>{mtSel=d.dataset.p;drawMT()});
  const total=inP+B*blk+outP,seen=plain?inP+outP:total;
  const sel=nodes.find(n=>n.path===mtSel);
  $('#mtCalc').textContent=`by hand: 784·${W} + ${W} = ${NF(inP)};  each block 2·(${W}·${W} + ${W}) = ${NF(blk)};  head ${W}·10 + 10 = ${NF(outP)}\ntotal = ${NF(inP)} + ${B}·${NF(blk)} + ${NF(outP)} = ${NF(total)}\nsum(p.numel() for p in net.parameters()) = ${NF(seen)}`+(plain?`   ← the blocks are invisible: optimizer, state_dict and .to(device) all skip ${NF(total-seen)} parameters`:'')+
    (sel&&sel.path!=='net'?`\nselected: ${plain?sel.path:'net.'+sel.path.replace(/^(\d+)/,'[$1]').replace(/\.(\d+)/g,'[$1]')}${sel.params!=null?`  (${NF(sel.params)} parameters${sel.reg?'':', NOT registered'})`:''}`:'');
}
['#mtH','#mtB'].forEach(id=>$(id).addEventListener('input',drawMT));$('#mtList').addEventListener('change',drawMT);drawMT();

/* ---------- 5.2 memory calculator ---------- */
function drawMM(){
  const N=+segVal('#mmN','v');
  const rows=[['inference weights, bf16',2*N,'var(--green)'],['inference weights, fp32',4*N,'var(--green)'],['training, SGD (weights + gradients)',8*N,'var(--math)'],['training, Adam (+ two moments)',16*N,'var(--rose)'],['resumable checkpoint (weights + moments)',12*N,'var(--amber)']];
  $('#mmOut').innerHTML=rows.map(r=>bar(r[0],r[1],16*N,bytes(r[1]),r[2])).join('');
  $('#mmCalc').textContent=`N = ${NF(N)} parameters\nAdam in fp32: 4 (weights) + 4 (gradients) + 4 (m) + 4 (v) = 16 bytes × N = ${bytes(16*N)}\n`+(16*N>80e9?`exceeds a single 80 GB GPU before storing one activation`:16*N<1e6?`= ${(16*N/1048576).toFixed(2)} MiB: why memory never mattered in earlier chapters`:`fits on one large GPU, before activations`)+`\nmixed precision does not shrink this floor (fp32 master weights and moments stay)`;
}
segOn('#mmN',drawMM);drawMM();

/* ---------- 5.3 residual variance ---------- */
function drawRV(){
  const N=+$('#rvN').value,gm=segVal('#rvG','v');$('#rvNo').textContent=N;const g=gm==='1'?1:gm==='0'?0:1/Math.sqrt(N);
  const R=rng(7),d=32,h=128,n=128;let X=Array.from({length:n},()=>Float64Array.from({length:d},()=>gauss(R)));
  const sd=A=>{let s=0;for(const r of A)for(const v of r)s+=v*v;return Math.sqrt(s/(A.length*A[0].length))};
  const meas=[sd(X)];
  for(let k=0;k<N;k++){const W1=Float64Array.from({length:d*h},()=>gauss(R)*Math.sqrt(2/d)),W2=Float64Array.from({length:h*d},()=>gauss(R)*g/Math.sqrt(h));
    X=X.map(x=>{const z=new Float64Array(h);for(let i=0;i<d;i++){const v=x[i];for(let j=0;j<h;j++)z[j]+=v*W1[i*h+j]}const o=Float64Array.from(x);for(let j=0;j<h;j++){const a=z[j]>0?z[j]:0;if(!a)continue;for(let i=0;i<d;i++)o[i]+=a*W2[j*d+i]}return o});meas.push(sd(X))}
  const th=k=>Math.sqrt(Math.pow(1+g*g,k)),lg=Math.log10;
  const top=Math.max(1,Math.ceil(lg(Math.max(...meas,th(N)))));const yt=[];for(let v=0;v<=top;v++)yt.push(v);
  plot($('#rvPlot'),{xmin:0,xmax:N,ymin:-0.2,ymax:Math.max(0.6,top),yt,ytf:v=>v?'10^'+v:'1',xt:[0,Math.round(N/2),N],xl:'block k',yl:'activation std (log scale)',H:220,
    curves:[{f:k=>lg(th(k)),c:'var(--amber)',dash:1,w:2}],lines:[{pts:meas.map((v,i)=>[i,lg(v)]),c:'var(--green)'}],pts:meas.map((v,i)=>({x:i,y:lg(v),c:'var(--green)',r:2.5}))});
  $('#rvCalc').textContent=`g = ${gm==='s'?'1/√'+N+' = '+g.toFixed(3):g}: each block multiplies the mean square by 1 + g² = ${(1+g*g).toFixed(3)}\ntheory after ${N} blocks: std × √(${(1+g*g).toFixed(3)}^${N}) = ${th(N)<1e4?th(N).toFixed(2):th(N).toExponential(2)}   (amber dashed)\nmeasured (green): ${meas[N]<1e4?meas[N].toFixed(2):meas[N].toExponential(2)}`+(gm==='s'?`\nbound for any depth: √e ≈ 1.65`:gm==='0'?`\nevery block starts as the identity`:'');
}
$('#rvN').addEventListener('input',drawRV);segOn('#rvG',drawRV);drawRV();document.addEventListener('themechange',drawRV);

/* ---------- 5.4 RMSNorm ---------- */
function drawRM(){
  const x=[+$('#rmX1').value,+$('#rmX2').value],g=[+$('#rmG1').value,+$('#rmG2').value];
  const ms=(x[0]**2+x[1]**2)/2,rms=Math.sqrt(ms+1e-6),y=[x[0]/rms*g[0],x[1]/rms*g[1]];
  const circ=a=>Array.from({length:121},(_,i)=>{const t=i/120*2*Math.PI;return[Math.SQRT2*Math.cos(t)*a[0],Math.SQRT2*Math.sin(t)*a[1]]});
  plot($('#rmPlot'),{xmin:-4.5,xmax:4.5,ymin:-4.5,ymax:4.5,W:340,H:340,maxw:'340px',xt:[-4,-2,0,2,4],yt:[-4,-2,0,2,4],
    lines:[{pts:circ([1,1]),c:'var(--soft)',dash:1,w:1.2},{pts:circ(g),c:'var(--amber)',w:1.8},{pts:[[0,0],x],c:'var(--math)',w:2.2},{pts:[[0,0],y],c:'var(--green)',w:2.6}],
    pts:[{x:x[0],y:x[1],c:'var(--math)',t:'x',r:4},{x:y[0],y:y[1],c:'var(--green)',t:'RMSNorm(x)',r:5}]});
  $('#rmCalc').textContent=`x = (${x.map(v=>v.toFixed(1)).join(', ')})   mean square = ${ms.toFixed(3)}   RMS = ${rms.toFixed(3)}\nx / RMS = (${(x[0]/rms).toFixed(3)}, ${(x[1]/rms).toFixed(3)})   length ${Math.hypot(x[0]/rms,x[1]/rms).toFixed(3)} = √2 (dashed circle)\n⊙ g = (${g.join(', ')}) → (${y.map(v=>v.toFixed(3)).join(', ')})   (amber: the stretched circle)\nscale x by any c > 0 and the output does not change`;
}
['#rmX1','#rmX2','#rmG1','#rmG2'].forEach(id=>$(id).addEventListener('input',drawRM));drawRM();document.addEventListener('themechange',drawRM);

/* ---------- 5.4 straight-through estimator ---------- */
let stSeed=1;
function drawST(){
  const R=rng(stSeed),X=Array.from({length:256},()=>Array.from({length:8},()=>gauss(R))),wt=Array.from({length:8},()=>R()*14-7),y=X.map(r=>r.reduce((s,v,i)=>s+v*wt[i],0));
  const loss=w=>X.reduce((s,r,k)=>s+(r.reduce((a,v,i)=>a+v*w[i],0)-y[k])**2,0)/256;
  const run=ste=>{let w=new Array(8).fill(0);const hist=[];for(let t=0;t<100;t++){const wr=w.map(Math.round);hist.push(loss(wr));if(!ste)continue;
      const g=new Array(8).fill(0);X.forEach((r,k)=>{const e=2*(r.reduce((a,v,i)=>a+v*wr[i],0)-y[k])/256;for(let i=0;i<8;i++)g[i]+=e*r[i]});w=w.map((v,i)=>v-0.05*g[i])}
    const wr=w.map(Math.round);hist.push(loss(wr));return{hist,wr}};
  const a=run(false),b=run(true),ref=loss(wt.map(Math.round)),lg=Math.log10;
  plot($('#stPlot'),{xmin:0,xmax:100,ymin:-1,ymax:Math.ceil(lg(a.hist[0]))+0.2,yt:[-1,0,1,2,3].filter(v=>v<=Math.ceil(lg(a.hist[0]))),ytf:v=>'10^'+v,xt:[0,25,50,75,100],xl:'SGD step',yl:'loss (log scale)',H:220,
    lines:[{pts:a.hist.map((v,i)=>[i,lg(v)]),c:'var(--rose)'},{pts:b.hist.map((v,i)=>[i,lg(Math.max(v,0.1))]),c:'var(--green)'},{pts:[[0,lg(ref)],[100,lg(ref)]],c:'var(--soft)',dash:1,w:1}],
    pts:[{x:100,y:lg(a.hist[100]),c:'var(--rose)',t:'plain rounding',left:1,r:3},{x:100,y:lg(Math.max(b.hist[100],0.1)),c:'var(--green)',t:'straight-through',left:1,r:3}]});
  $('#stCalc').textContent=`X: 256 × 8 standard normal, w_true ~ U(−7, 7) = (${wt.map(v=>v.toFixed(1)).join(', ')})\nstart from w = 0, SGD lr = 0.05, 100 steps, loss = mean squared error\nstart ${a.hist[0].toFixed(1)}   plain rounding ${a.hist[100].toFixed(1)} (all gradients zero)   straight-through ${b.hist[100].toFixed(2)}   rounded target ${ref.toFixed(2)} (dashed)\nlearned integer weights: (${b.wr.join(', ')})`;
}
$('#stGo').onclick=()=>{stSeed++;drawST()};drawST();document.addEventListener('themechange',drawST);

/* ---------- 5.5 float formats ---------- */
function rhe(v){const f=Math.floor(v),d=v-f;return d>0.5?f+1:d<0.5?f:(f%2===0?f:f+1)}
function quant(x,m,emin,emax){if(!isFinite(x)||x===0)return x;const s=Math.sign(x),a=Math.abs(x);let e=Math.floor(Math.log2(a));if(Math.pow(2,e)>a)e--;if(Math.pow(2,e+1)<=a)e++;
  const sp=Math.pow(2,Math.max(e,emin)-m),r=rhe(a/sp)*sp,mx=Math.pow(2,emax)*(2-Math.pow(2,-m));if(r>mx)return s*Infinity;return s*r}
const FMT=[['fp32',23,-126,127,v=>Math.fround(v)],['bf16',7,-126,127,null],['fp16',10,-14,15,null]];
const spacing=(x,m,emin)=>{const a=Math.abs(x)||1;let e=Math.floor(Math.log2(a));return Math.pow(2,Math.max(e,emin)-m)};
function drawFP(){
  const s=$('#fpIn').value.trim();let x=NaN;if(/^[0-9eE+\-*/(). ]+$/.test(s)){try{x=Function('return ('+s+')')()}catch(e){}}
  if(!isFinite(x)&&!isNaN(x)){}
  const sh=v=>!isFinite(v)?(isNaN(v)?'nan':(v>0?'inf':'-inf')):v===0?'0':(Math.abs(v)>=1e5||Math.abs(v)<1e-3)?v.toPrecision(8):(+v.toPrecision(10)).toString();
  $('#fpTab').innerHTML='<tr><th>format</th><th>stored value</th><th>error</th><th>spacing near x</th><th>note</th></tr>'+FMT.map(([n,m,emin,emax,f])=>{const q=f?f(x):quant(x,m,emin,emax);const sp=spacing(x,m,emin);
    const note=!isFinite(q)&&isFinite(x)?'overflow':q===0&&x!==0?'underflow to 0':Math.abs(x)<Math.pow(2,emin)&&x!==0?'subnormal':q===x?'exact':'';
    return`<tr><td>${n}</td><td class="num">${sh(q)}</td><td class="num">${isFinite(q)?sh(q-x):'—'}</td><td class="num">${sh(sp)}</td><td>${note}</td></tr>`}).join('')+`<tr><td colspan="5" style="color:var(--soft)">x = ${sh(x)}</td></tr>`;
}
$('#fpIn').addEventListener('input',drawFP);$$('#fpEx button').forEach(b=>b.addEventListener('click',()=>{$('#fpIn').value=b.dataset.v;drawFP()}));drawFP();

/* ---------- 5.5 accumulation ---------- */
function drawAC(){
  const step=Math.pow(2,-10);let s16=0,s32=0;const p16=[[0,0]],p32=[[0,0]];let froze=null;
  for(let i=1;i<=4096;i++){const n16=quant(s16+step,10,-14,15);if(n16===s16&&froze===null)froze=i;s16=n16;s32=Math.fround(s32+step);if(i%32===0){p16.push([i,s16]);p32.push([i,s32])}}
  plot($('#acPlot'),{xmin:0,xmax:4096,ymin:0,ymax:4.2,yt:[0,1,2,3,4],xt:[0,1024,2048,3072,4096],xl:'additions',yl:'running sum',H:200,
    lines:[{pts:p32,c:'var(--green)',w:2.2},{pts:p16,c:'var(--rose)',w:2.2}],pts:[{x:4096,y:s32,c:'var(--green)',t:'fp32',left:1,r:3},{x:4096,y:s16,c:'var(--rose)',t:'fp16',left:1,r:3}]});
  $('#acCalc').textContent=`fp32 accumulator: ${s32}   fp16 accumulator: ${s16}\nfp16 stops growing at step ${froze}: between 2 and 4 the fp16 spacing is 2⁻⁹, so 2 + 2⁻¹⁰ is a tie and rounds back to the even value 2`;
}
drawAC();document.addEventListener('themechange',drawAC);

/* ---------- 5.6 safetensors layout ---------- */
(function(){
  const T=[['hidden.bias',[256]],['hidden.weight',[256,20]],['output.bias',[10]],['output.weight',[10,256]]];let off=0;const hdr={};
  const rows=T.map(([n,sh])=>{const b=sh.reduce((a,c)=>a*c,1)*4,r={n,sh,a:off,b:off+b};hdr[n]={dtype:'F32',shape:sh,data_offsets:[off,off+b]};off+=b;return r});
  const H=JSON.stringify(hdr).length,total=8+H+off;
  const seg=(w,c,t)=>`<span style="display:inline-block;height:26px;line-height:26px;width:${Math.max(2,w/total*100)}%;background:${c};color:#fff;font-size:11px;overflow:hidden;white-space:nowrap;text-align:center">${t}</span>`;
  $('#sfOut').innerHTML=`<div dir="ltr" style="display:flex;border:1px solid var(--rule);border-radius:6px;overflow:hidden">${seg(8,'var(--ink)','8')}${seg(H,'var(--math)','JSON')}${rows.map((r,i)=>seg(r.b-r.a,['var(--amber)','var(--green)','var(--rose)','var(--amber)'][i],r.n)).join('')}</div>`;
  $('#sfTab').innerHTML='<tr><th>tensor (sorted by name)</th><th>shape</th><th>bytes</th><th>data_offsets</th></tr>'+rows.map(r=>`<tr><td>${r.n}</td><td class="num">(${r.sh.join(', ')})</td><td class="num">${NF(r.b-r.a)}</td><td class="num">[${NF(r.a)}, ${NF(r.b)}]</td></tr>`).join('')+`<tr><td colspan="4" style="color:var(--soft)">8-byte length prefix + ${H}-byte JSON header + ${NF(off)} bytes of raw float32 = ${NF(total)} bytes; loading parses JSON and checks ranges, executing no code</td></tr>`;
})();

/* ---------- 5.6 Adam restart ---------- */
function drawAD(){
  const ge=+$('#adG').value,ve=+$('#adV').value;$('#adGo').textContent=ge;$('#adVo').textContent=ve;
  const g=Math.pow(10,ge),sv=Math.pow(10,ve),eta=0.05,eps=1e-8,fresh=eta*g/(g+eps),res=eta*g/(sv+eps);
  $('#adCalc').textContent=`fresh Adam, step 1: m̂ = g, v̂ = g²  →  step = η·|g|/(|g| + ε) = ${fresh.toExponential(2)}  (≈ η, whatever |g| is)\nrestored Adam: √v̂ remembers past gradients ≈ ${sv.toExponential(0)}  →  step ≈ η·|g|/√v̂ = ${res.toExponential(2)}\nthe fresh optimizer moves this parameter ${(fresh/res).toFixed(fresh/res>=10?0:1)}× farther`+(fresh/res>100?'  ← near convergence: the loss spikes':'');
}
['#adG','#adV'].forEach(id=>$(id).addEventListener('input',drawAD));drawAD();

/* ---------- 5.7 step memory ---------- */
function drawSM(){
  const W=2**+$('#smW').value,B=2**+$('#smB').value;$('#smWo').textContent=NF(W);$('#smBo').textContent=NF(B);
  const N=1024*W+W+2*(W*W+W)+10*W+10,MiB=1048576,act=3*B*W*4;
  const st=[['1 · weights',4*N],['2 · after forward (+ activations)',4*N+act],['3 · after backward (activations → gradients)',8*N],['4 · after optimizer step (+ Adam moments)',16*N],['peak from step 2 on (16N + activations)',16*N+act]];
  const mx=Math.max(...st.map(s=>s[1]));
  $('#smOut').innerHTML=st.map((s,i)=>bar(s[0],s[1],mx,(s[1]/MiB).toFixed(0)+' MiB',i===4?'var(--rose)':i===1?'var(--amber)':'var(--green)')).join('');
  $('#smCalc').textContent=`N = 1024·${W} + ${W} + 2(${W}² + ${W}) + ${W}·10 + 10 = ${NF(N)} parameters → 4N = ${(4*N/MiB).toFixed(0)} MiB\nactivations: 3 layers × ${NF(B)} × ${NF(W)} × 4 bytes = ${(act/MiB).toFixed(0)} MiB  (${act>4*N?'larger than':'smaller than'} the weights)\nhalve the batch → activations halve; the 16N floor does not move\nwith zero_grad(set_to_none=True) before the forward pass the peak is 12N + activations = ${((12*N+act)/MiB).toFixed(0)} MiB`;
}
['#smW','#smB'].forEach(id=>$(id).addEventListener('input',drawSM));drawSM();

/* ---------- 5.7 activation checkpointing ---------- */
function drawCK(){
  const K=+$('#ckK').value;$('#ckS').max=K;let s=Math.min(+$('#ckS').value,K);$('#ckKo').textContent=K;$('#ckSo').textContent=s;
  const stored=Math.ceil(K/s)+(s>1?s:0),best=Math.round(Math.sqrt(K)),bestStored=Math.ceil(K/best)+best;
  $('#ckOut').innerHTML=bar('بلا إعادة حساب',K,K,AD(K),'var(--rose)')+bar(`مقاطع من ${AD(s)}`,Math.min(stored,K),K,AD(Math.min(stored,K)),'var(--green)')+bar(`الأمثل s = √K ≈ ${AD(best)}`,bestStored,K,AD(bestStored),'var(--math)');
  $('#ckCalc').textContent=`K = ${K} layers, segments of s = ${s}: keep ⌈K/s⌉ = ${Math.ceil(K/s)} boundaries + ${s>1?s:0} live inside the active segment = ${stored} (instead of ${K})\nbest s ≈ √${K} = ${Math.sqrt(K).toFixed(1)} → ${bestStored} tensors, i.e. ${(bestStored/K*100).toFixed(0)}% of the memory\ncost: one extra forward pass, ≈ 3 → 4 forward-equivalents per step (≤ ~33% more compute)`;
}
['#ckK','#ckS'].forEach(id=>$(id).addEventListener('input',drawCK));drawCK();

/* ---------- 5.8 non-associativity ---------- */
const NA=(()=>{const R=rng(5),v=[1e8,-1e8,1];for(let i=0;i<997;i++){const k=R();v.push(Math.fround(k<0.3?(R()-0.5)*2e7:k<0.6?(R()-0.5)*20:(R()-0.5)*0.02))}return v})();
let naOrder=NA.map((_,i)=>i),naSeed=1;
function drawNA(){
  let s=0;for(const i of naOrder)s=Math.fround(s+NA[i]);
  const exact=NA.reduce((a,b)=>a+b,0),f=Math.fround;
  $('#naCalc').textContent=`three numbers in float32:\n  (−1e8 + 1e8) + 1 = ${f(f(-1e8+1e8)+1)}\n  −1e8 + (1e8 + 1) = ${f(-1e8+f(1e8+1))}   (near 1e8 the float32 spacing is 8, so 1e8 + 1 rounds to 1e8)\n\n${NA.length} float32 numbers of mixed size, summed left to right in float32 in the current order:\n  float32 sum = ${s}\n  float64 sum = ${exact.toFixed(4)}\n  difference  = ${(s-exact).toFixed(4)}`;
}
$('#naShuf').onclick=()=>{const R=rng(++naSeed);for(let i=naOrder.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[naOrder[i],naOrder[j]]=[naOrder[j],naOrder[i]]}drawNA()};
$('#naSort').onclick=()=>{naOrder.sort((a,b)=>Math.abs(NA[a])-Math.abs(NA[b]));drawNA()};
$('#naRev').onclick=()=>{naOrder.sort((a,b)=>Math.abs(NA[b])-Math.abs(NA[a]));drawNA()};
drawNA();
