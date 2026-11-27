/* D2L · Chapter 13 · Computational Performance — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s13-1','13.1','خط السقف'],['s13-2','13.2','تشريح العتاد'],['s13-3','13.3','الترجمة والدمج'],['s13-4','13.4','الذاكرة والدقة'],['s13-5','13.5','توازي البيانات'],['s13-6','13.6','DDP عملياً'],['s13-7','13.7','ZeRO وFSDP'],['s13-8','13.8','دراسة حالة'],['ex','','الخلاصة والتمارين']];
const GL=[
['الشدة الحسابية','arithmetic intensity','عدد العمليات لكل بايت يُنقل من الذاكرة.'],
['خط السقف','roofline','الإنتاجية ≤ min(P، I·β).'],
['نقطة التوازن','ridge point','I* = P/β: الشدة اللازمة لبلوغ القدرة الكاملة.'],
['محدود بالذاكرة / بالحساب','bandwidth / compute-bound','تحت نقطة التوازن أو فوقها.'],
['التنفيذ غير المتزامن','asynchronous execution','بايثون يصفّ الأوامر ويكمل والمعالج يعمل خلفه.'],
['هرم الذاكرة','memory hierarchy','سجلات وSRAM ثم HBM ثم ذاكرة الجهاز ثم القرص.'],
['أنوية Tensor','Tensor Cores','وحدات متخصصة في ضرب كتل المصفوفات بدقة منخفضة.'],
['الحجم نصف الأداء','half-performance size','n½ = αβ: الحجم الذي يبلغ عنده النقل نصف السرعة.'],
['دمج العمليات','operator fusion','تنفيذ سلسلة عمليات في نواة واحدة دون كتابة الوسيط.'],
['التقاط المخطط','graph capture','تسجيل الحساب مسبقاً بالتتبع الرمزي.'],
['انقطاع المخطط','graph break','تقسيم المخطط عند فرع يعتمد على قيمة.'],
['CUDA graphs','CUDA graphs','إعادة تشغيل خطوة كاملة بنداء واحد.'],
['الدقة المختلطة','mixed precision','حساب بـbf16 مع نسخة رئيسية بـfp32.'],
['الحفظ المؤقت','activation checkpointing','حفظ مدخلات الكتل وإعادة حساب الباقي في الخلفي.'],
['تجميع التدرّجات','gradient accumulation','جمع تدرّجات عدة دفعات صغيرة قبل خطوة واحدة.'],
['توازي البيانات','data parallelism','نسخ النموذج وتقسيم الدفعة وجمع التدرّجات.'],
['allreduce','allreduce','جمع موتر من كل المعالجات وترك المجموع عند الجميع.'],
['allreduce الحلقي','ring allreduce','جمع وتوزيع ثم جمع الكل حول حلقة: 2(k−1)S/k لكل معالج.'],
['DDP','distributed data parallel','عملية لكل معالج وحاويات تدرّجات تتداخل مع الخلفي.'],
['ZeRO / FSDP','ZeRO / fully sharded data parallel','تقسيم العزوم والتدرّجات والأوزان على المعالجات.'],
['قانون أمدال','Amdahl\'s law','التسريع الكلي 1/(1 − f + f/s).'],
['MFU','model FLOPs utilization','6N × الرموز/ث ÷ القدرة القصوى.']];
initPage(SECS,GL);
const N=v=>Math.round(v).toLocaleString('en-US');
const fb=b=>b>=2**30?(b/2**30).toFixed(2)+' GiB':b>=2**20?(b/2**20).toFixed(1)+' MiB':b>=1024?(b/1024).toFixed(1)+' KiB':Math.round(b)+' B';

/* ---------- 13.1 roofline ---------- */
const GPU=[['RTX 4090 bf16',165.2,1.008],['RTX 4090 tf32',82.6,1.008],['H100 bf16',989,3.35]];
function drawRF(){const g=GPU[+segVal('#rfG','v')],o=segVal('#rfO','v'),n=2**+$('#rfN').value;$('#rfNo').textContent=N(n);
  const I={ew:0.25,dec:1.0,bat:60,mm:n/3}[o],ridge=g[1]/g[2],perf=Math.min(g[1],I*g[2]),lg=Math.log10;
  plot($('#rfPlot'),{xmin:-1,xmax:4,ymin:-1,ymax:3.2,H:240,xt:[-1,0,1,2,3,4],yt:[-1,0,1,2,3],ytf:v=>'10^'+v,xl:'log₁₀ I (FLOP/byte)',yl:'TFLOP/s',
    curves:[{f:x=>lg(Math.min(g[1],10**x*g[2])),c:'var(--math)'}],raw:(X,Y)=>`<line x1="${X(lg(ridge))}" x2="${X(lg(ridge))}" y1="${Y(-1)}" y2="${Y(3.2)}" stroke="var(--soft)" stroke-dasharray="4 4"/>`,
    pts:[{x:lg(I),y:lg(perf),c:I<ridge?'var(--rose)':'var(--green)',r:6,t:{ew:'x + 1',dec:'decode B=1',bat:'decode B=64',mm:'n×n matmul'}[o],left:lg(I)>2.5}]});
  $('#rfCalc').textContent=`${g[0]}: P = ${g[1]} TFLOP/s, β = ${g[2]} TB/s, ridge I* = P/β = ${ridge.toFixed(0)} FLOP/byte\n${o==='mm'?`square matmul n = ${N(n)}: I = n/3 = ${I.toFixed(1)}`:`I ≈ ${I}`} → bound min(P, Iβ) = ${perf.toFixed(perf<1?3:1)} TFLOP/s (${(100*perf/g[1]).toFixed(1)}% of peak)\n${I<ridge?'bandwidth-bound: fuse more math onto each byte, or reuse operands (bigger batches)':'compute-bound: only faster math formats or fewer FLOPs help'}`+(o==='mm'&&n<=1024?`\nthe roofline is only an upper bound: the book measures < 2% of peak at n = 256 (launch overhead, too little parallel work)`:'')}
segOn('#rfG',drawRF);segOn('#rfO',drawRF);$('#rfN').addEventListener('input',drawRF);drawRF();

/* ---------- 13.2 latency vs bandwidth ---------- */
const LTP=[['NVMe',70e-6,14e9],['PCIe 4.0 ×16 (α ≈ 5 µs, illustrative)',5e-6,32e9],['GPU DRAM (α ≈ 0.25 µs)',0.25e-6,1.008e12]];
function drawLT(){const p=LTP[+segVal('#ltP','v')],a=p[1],b=p[2],nh=a*b,f=x=>{const n=10**x;return 1/(1+nh/n)};
  plot($('#ltPlot'),{xmin:2,xmax:10,ymin:0,ymax:1.05,H:210,xt:[3,4,5,6,7,8,9,10],yt:[0,0.5,1],ytf:v=>(100*v)+'%',xl:'log₁₀ transfer size (bytes)',yl:'β_eff / β',curves:[{f,c:'var(--math)'}],pts:[{x:Math.log10(nh),y:0.5,c:'var(--rose)',r:5,t:'n½ = '+fb(nh)}]});
  $('#ltCalc').textContent=`${p[0]}: α = ${(a*1e6).toFixed(2)} µs, β = ${(b/1e9).toFixed(0)} GB/s\nn½ = αβ = ${fb(nh)}\n4 KiB transfers reach ${(100*f(Math.log10(4096))).toFixed(1)}% of β;  1 MiB: ${(100*f(Math.log10(2**20))).toFixed(1)}%;  64 MiB: ${(100*f(Math.log10(2**26))).toFixed(1)}%`}
segOn('#ltP',drawLT);drawLT();

/* ---------- 13.3 fusion ---------- */
function drawFS(){const k=+$('#fsK').value,S=2**+$('#fsS').value;$('#fsKo').textContent=k;$('#fsSo').textContent=fb(S);const bw=1.008e12,h=10e-6;
  const eB=(2*k+2)*S,fB=2*S,eT=eB/bw+k*h,fT=fB/bw+h,mx=Math.max(eT,fT);
  $('#fsOut').innerHTML=bar('فوري: نقل الذاكرة',eB/bw,mx,(eB/bw*1e3).toFixed(3)+' ms','var(--rose)')+bar('فوري: إصدار '+k+' نوى',k*h,mx,(k*h*1e3).toFixed(3)+' ms','var(--amber)')+bar('مدمج: نقل + إصدار واحد',fT,mx,(fT*1e3).toFixed(3)+' ms','var(--green)');
  $('#fsCalc').textContent=`eager: ${k} kernels read ${k+2} arrays and write ${k} → ${fb(eB)}; fused: read 1, write 1 → ${fb(fB)}  (${((2*k+2)/2).toFixed(0)}× less traffic)\nmodel: bytes/1.008 TB/s + 10 µs per launch → eager ${(eT*1e3).toFixed(3)} ms, fused ${(fT*1e3).toFixed(3)} ms, speedup ${(eT/fT).toFixed(1)}×\n${S<2**20?'small arrays: launch overhead dominates — CUDA graphs matter most':'large arrays: DRAM traffic dominates — fusion matters most'}`}
['#fsK','#fsS'].forEach(s=>$(s).addEventListener('input',drawFS));drawFS();

/* ---------- 13.4 memory budget ---------- */
function drawMM(){const bpp=+segVal('#mmO','v'),ab=+segVal('#mmA','v'),ck=segVal('#mmC','v')==='1',Np=1.01e9,L=18,d=2048,T=1024,G=24*2**30;
  const state=bpp*Np,blk=19.5*d*ab,head=212*1024,perTok=ck?L*d*ab+blk+head:L*blk+head,perSeq=perTok*T,free=G-state,seqs=Math.max(0,Math.floor(free/perSeq));
  $('#mmOut').innerHTML=bar('حالة المعاملات والمحسِّن',state,G,fb(state),'var(--amber)')+bar('تنشيطات تسلسل واحد',perSeq,G,fb(perSeq),'var(--math)')+bar('المتبقي للتنشيطات',Math.max(0,free),G,fb(Math.max(0,free)),'var(--green)');
  $('#mmCalc').textContent=`state: ${bpp} B/param × 1.01B = ${fb(state)} (independent of batch)\nactivations per token: ${ck?`checkpointing: ${L} block inputs (${fb(L*d*ab)}) + one block recomputed (${fb(blk)})`:`${L} blocks × ≈19.5d × ${ab} B = ${fb(L*blk)}`} + head ${fb(head)} = ${fb(perTok)}\nsequences of ${T} tokens per micro-batch: ${seqs}${seqs>0?` (${N(seqs*T)} tokens; reach 0.5M-token batches by accumulating ${Math.ceil(5e5/(seqs*T))} micro-batches)`:' — does not fit'}`+(ck?'\ncost: one extra forward per step (≈ 6N → 8N FLOPs/token)':'')}
segOn('#mmO',drawMM);segOn('#mmA',drawMM);segOn('#mmC',drawMM);drawMM();

/* ---------- 13.5 data-parallel scaling ---------- */
function drawRG(){const T=+$('#rgT').value,ov=segVal('#rgO','v')==='1',S=45e6,bw=25e9;$('#rgTo').textContent=T;const comm=k=>k===1?0:2*(k-1)/k*S/bw*1000,step=k=>ov?Math.max(T/k,comm(k))+0.1*Math.min(T/k,comm(k)):T/k+comm(k),sp=k=>T/step(k);
  const pts=[];for(let k=1;k<=8;k++)pts.push([k,sp(k)]);
  plot($('#rgPlot'),{xmin:1,xmax:8,ymin:0,ymax:8,H:210,xt:[1,2,4,6,8],yt:[1,2,4,6,8],xl:'GPUs k',yl:'speedup',lines:[{pts:[[1,1],[8,8]],c:'var(--soft)',w:1.2,dash:1},{pts,c:'var(--green)',w:2.6}],pts:pts.map(p=>({x:p[0],y:p[1],c:'var(--green)',r:3}))});
  $('#rgCalc').textContent=`ring traffic per GPU 2(k−1)/k · 45 MB; at 25 GB/s: k = 2 → ${comm(2).toFixed(2)} ms, k = 8 → ${comm(8).toFixed(2)} ms\nstep(k) = ${ov?'max(compute/k, comm) (overlapped, +10% contention)':'compute/k + comm'}\nspeedup at k = 2: ${sp(2).toFixed(2)}×   k = 4: ${sp(4).toFixed(2)}×   k = 8: ${sp(8).toFixed(2)}×  (dashed: ideal)`}
$('#rgT').addEventListener('input',drawRG);segOn('#rgO',drawRG);drawRG();

/* ---------- 13.6 bucket overlap timeline ---------- */
function drawBK(){const m=+$('#bkB').value,r=$('#bkR').value/100,L=12,lat=0.3;$('#bkBo').textContent=m;$('#bkRo').textContent=r.toFixed(2);
  const bks=[];let t=0;for(let s=0;s<L;s+=m){const n=Math.min(m,L-s),ready=s+n,dur=n*r+lat,st=Math.max(ready,t);bks.push([st,dur,n]);t=st+dur}
  const end=Math.max(L,t),noov=L+bks.reduce((a,b)=>a+b[1],0),W=Math.max(end,noov)+0.5;
  const sx=v=>20+v/W*520;let s=`<svg viewBox="0 0 560 110" style="width:100%;max-width:640px;height:auto;display:block;margin:0 auto;direction:ltr"><text x="20" y="14" font-size="11" fill="var(--soft)">backward (layer 12 → 1)</text>`;
  for(let i=0;i<L;i++)s+=`<rect x="${sx(i)}" y="20" width="${sx(i+1)-sx(i)-1}" height="22" fill="var(--math)" opacity=".8"/>`;
  s+=`<text x="20" y="62" font-size="11" fill="var(--soft)">allreduce buckets</text>`;bks.forEach(b=>{s+=`<rect x="${sx(b[0])}" y="68" width="${Math.max(1,sx(b[0]+b[1])-sx(b[0])-1)}" height="22" fill="var(--green)" opacity=".85"/>`});
  s+=`<line x1="${sx(end)}" x2="${sx(end)}" y1="16" y2="96" stroke="var(--rose)" stroke-dasharray="4 3"/><text x="${sx(end)}" y="106" font-size="11" text-anchor="middle" fill="var(--rose)">end ${end.toFixed(1)}</text></svg>`;
  $('#bkPlot').innerHTML=s;
  $('#bkCalc').textContent=`${bks.length} bucket(s) of ≤ ${m} layers; each costs n·${r.toFixed(2)} + ${lat} (per-bucket latency) time units\noverlapped step ends at ${end.toFixed(2)} vs ${noov.toFixed(2)} if all communication waits for backward\nexposed communication: ${(end-L).toFixed(2)} units (the last bucket can only start when layer 1 finishes)`}
['#bkB','#bkR'].forEach(s=>$(s).addEventListener('input',drawBK));drawBK();

/* ---------- 13.7 ZeRO stages ---------- */
function drawZR(){const k=+$('#zrK').value,Np=1.92e9,G=24*2**30;$('#zrKo').textContent=k;
  const st=[['DDP',16],['ZeRO-1',8+8/k],['ZeRO-2',4+12/k],['ZeRO-3 / FSDP',16/k]];
  $('#zrOut').innerHTML=st.map(s=>{const b=s[1]*Np;return bar(s[0],b,16*Np,fb(b),b>G?'var(--rose)':'var(--green)')}).join('')+bar('سعة البطاقة',G,16*Np,'24 GiB','var(--soft)');
  $('#zrCalc').textContent=`bytes/param per GPU at k = ${k}: DDP 16 · ZeRO-1 ${(8+8/k).toFixed(2)} · ZeRO-2 ${(4+12/k).toFixed(2)} · ZeRO-3 ${(16/k).toFixed(2)}\ncommunication per step: DDP, ZeRO-1, ZeRO-2 = 2(k−1)/k·S; ZeRO-3 ≈ 1.5× that (weights gathered for forward and backward)\nred = state alone exceeds 24 GiB (activations still need room)`}
$('#zrK').addEventListener('input',drawZR);drawZR();

/* ---------- 13.8 Amdahl ---------- */
function drawAM(){const f=$('#amF').value/100,s=$('#amS').value/10;$('#amFo').textContent=f.toFixed(2);$('#amSo').textContent=s.toFixed(1)+'×';const sp=x=>1/(1-f+f/x),lim=1/(1-f);
  plot($('#amPlot'),{xmin:1,xmax:20,ymin:1,ymax:Math.min(12,lim*1.1),H:200,xt:[1,2,5,10,20],yt:[1,2,3,5,10].filter(v=>v<Math.min(12,lim*1.1)),xl:'speedup s of the accelerated part',yl:'overall',curves:[{f:sp,c:'var(--math)'},{f:()=>lim,c:'var(--rose)',dash:1,w:1.4}],pts:[{x:s,y:sp(s),c:'var(--green)',r:6,t:sp(s).toFixed(2)+'×'}]});
  $('#amCalc').textContent=`overall = 1/(1 − f + f/s) = 1/(${(1-f).toFixed(2)} + ${(f/s).toFixed(3)}) = ${sp(s).toFixed(3)}×\nupper limit as s → ∞: 1/(1 − f) = ${lim.toFixed(2)}× (dashed)\nbook: bf16 doubles GEMMs (f ≈ 0.68) → ≥ 1.52×; measured 1.74× because activation traffic also halved`}
['#amF','#amS'].forEach(s=>$(s).addEventListener('input',drawAM));drawAM();

/* ---------- 13.8 MFU ---------- */
function drawMF(){const Np=+$('#mfN').value*1e6,tps=+$('#mfT').value*1e3,P=+segVal('#mfP','v');$('#mfNo').textContent=$('#mfN').value;$('#mfTo').textContent=$('#mfT').value;
  const ach=6*Np*tps/1e12,mfu=ach/P;
  $('#mfOut').innerHTML=bar('MFU',Math.min(1,mfu),1,(100*mfu).toFixed(1)+'%',mfu>1?'var(--rose)':'var(--green)');
  $('#mfCalc').textContent=`achieved = 6 × ${N(Np)} × ${N(tps)} tokens/s = ${ach.toFixed(1)} TFLOP/s\nMFU = ${ach.toFixed(1)} / ${P} = ${(100*mfu).toFixed(1)}%`+(mfu>1?'\n> 100%: impossible — check the numbers':'')+`\n(the book's 19M GPT: fp32 baseline ≈ 23%, after compile + bf16 ≈ 45–50%)`}
['#mfN','#mfT'].forEach(s=>$(s).addEventListener('input',drawMF));segOn('#mfP',drawMF);drawMF();
