/* D2L · Chapter 7 · Modern Convolutional Neural Networks — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s7-1','7.1','AlexNet'],['s7-2','7.2','VGG وNiN وGoogLeNet'],['s7-3','7.3','التطبيع الدفعي'],['s7-4','7.4','ResNet وأخواتها'],['s7-5','7.5','الشبكات الفعّالة'],['s7-6','7.6','وصفات التدريب'],['s7-7','7.7','ConvNeXt'],['s7-8','7.8','فضاءات التصميم وRegNet'],['ex','','الخلاصة والتمارين']];
const GL=[
['تعلّم التمثيلات','representation learning','تعلّم الخصائص نفسها من البيانات بدل تصميمها يدوياً.'],
['زيادة البيانات','data augmentation','تحويلات عشوائية للصور (قص، انعكاس…) تصنع أمثلة جديدة.'],
['عملية ضرب-جمع','multiply-add (MAC)','وحدة عدّ الحساب: ضرب عددين وإضافة الناتج.'],
['الإحماء','warmup','رفع معدّل التعلّم تدريجياً من الصفر في بداية التدريب.'],
['التخميد الجيبي','cosine decay','خفض معدّل التعلّم على نصف موجة جيب تمام حتى الصفر.'],
['كتلة','block','مجموعة طبقات بنمط ثابت تُكرَّر لبناء الشبكة.'],
['التجميع المتوسط الشامل','global average pooling','متوسط كل قناة على كل المواقع: رقم واحد لكل قناة.'],
['كتلة Inception','Inception block','مسارات متوازية بنوى مختلفة تُلصق مخرجاتها.'],
['الجذع والجسم والرأس','stem · body · head','تقسيم الشبكة: تصغير سريع، ثم مراحل متكررة، ثم مصنّف.'],
['التطبيع الدفعي','batch normalization','توحيد كل قناة بمتوسط الدفعة وانحرافها ثم γ وβ.'],
['الإحصاءات المتحركة','running statistics','متوسط وتباين أسّيان يُجمعان في التدريب ويُستعملان في الاستدلال.'],
['تطبيع الطبقة','layer normalization','توحيد كل مثال على قنواته، لا يعتمد على الدفعة.'],
['تطبيع المجموعة','group normalization','توحيد كل مثال على مجموعات من القنوات.'],
['مشكلة التدهور','degradation problem','الشبكة الأعمق أسوأ حتى في التدريب، لصعوبة التحسين.'],
['الكتلة المتبقية','residual block','كتلة تحسب x + g(x) فتتعلّم الفرق عن الهوية.'],
['الالتفاف المجمّع','grouped convolution','تقسيم القنوات إلى g مجموعة مستقلة؛ الكلفة ÷ g.'],
['معدّل النمو','growth rate','عدد القنوات التي تضيفها كل طبقة في DenseNet.'],
['الالتفاف العمقي','depthwise convolution','نافذة مكانية لكل قناة وحدها، بلا خلط قنوات.'],
['الالتفاف العمقي المنفصل','depthwise-separable','عمقي ثم 1×1: كلفته 1/cₒ + 1/k² من الكثيف.'],
['عنق الزجاجة المقلوب','inverted bottleneck','توسيع القنوات داخل الكتلة ثم إعادتها إلى مجرى ضيق.'],
['التحجيم المركّب','compound scaling','تكبير العمق والعرض والدقة معاً بنسب ثابتة.'],
['الضغط والإثارة','squeeze-and-excitation','بوابة لكل قناة من متوسطات القنوات الشاملة.'],
['إعادة المعلمة البنيوية','structural re-parameterization','تدريب فروع متعددة ودمجها جبرياً في طبقة واحدة.'],
['التكميم','quantization','تمثيل الأوزان والتنشيطات بأعداد صحيحة قليلة البتات.'],
['وصفة التدريب','training recipe','المحسِّن والجدول والزيادة والتنظيم والمدة معاً.'],
['تنعيم الوسوم','label smoothing','هدف 1 − ε للصنف الصحيح وε موزعة على الكل.'],
['Mixup / CutMix','Mixup / CutMix','خلط صورتين ووسميهما: بالمزج أو بلصق رقعة.'],
['العمق العشوائي','stochastic depth','إسقاط فرع متبقٍ كامل عشوائياً أثناء التدريب.'],
['المتوسط الأسي للأوزان','EMA of weights','نسخة ظل ρθ̄ + (1 − ρ)θ تُستعمل في التقييم.'],
['الاستئصال','ablation','تغيير مكوّن واحد كل مرة لقياس أثره.'],
['جذع التقطيع','patchify stem','التفاف 4×4 بخطوة 4 يقطّع الصورة رقعاً.'],
['مقياس الطبقة','layer scale','متجه γ صغير جداً يضرب الفرع المتبقي في البداية.'],
['فضاء التصميم','design space','مجتمع شبكات يولّده قالب واحد وقيود.'],
['دالة التوزيع التجميعي التجريبية','empirical CDF','نسبة العينات التي قيمتها لا تتجاوز كل عتبة.']];
initPage(SECS,GL);
const N=v=>Math.round(v).toLocaleString('en-US');
const F2=v=>(+v).toFixed(2);

/* ---------- 7.1 AlexNet params vs MACs ---------- */
const ALX=[['conv1 11×11·96',11712,33.9],['conv2 5×5·256',614656,415.3],['conv3 3×3·384',885120,127.4],['conv4 3×3·384',1327488,191.1],['conv5 3×3·256',884992,127.4],['fc6 6400→4096',26218496,26.2],['fc7 4096→4096',16781312,16.8],['fc8 4096→10',40970,0.04]];
function drawAlx(){const m=segVal('#alxS','v');const tp=ALX.reduce((a,r)=>a+r[1],0),tm=ALX.reduce((a,r)=>a+r[2],0);
  const mx=m==='p'?Math.max(...ALX.map(r=>r[1])):Math.max(...ALX.map(r=>r[2]));
  $('#alxOut').innerHTML=ALX.map((r,i)=>bar(r[0],m==='p'?r[1]:r[2],mx,m==='p'?N(r[1]):r[2]+'M',i<5?'var(--math)':'var(--amber)')).join('');
  const cp=ALX.slice(0,5).reduce((a,r)=>a+r[1],0),cm=ALX.slice(0,5).reduce((a,r)=>a+r[2],0);
  $('#alxCalc').textContent=`total: ${N(tp)} parameters, ${tm.toFixed(1)}M multiply-adds per image\nconv layers: ${(100*cp/tp).toFixed(0)}% of parameters, ${(100*cm/tm).toFixed(0)}% of multiply-adds\ndense layers: ${(100*(tp-cp)/tp).toFixed(0)}% of parameters, ${(100*(tm-cm)/tm).toFixed(0)}% of multiply-adds\n(a conv weight is reused at every position; a dense weight once per image)`}
segOn('#alxS',drawAlx);drawAlx();

/* ---------- 7.1 warmup + cosine ---------- */
const cosw=(t,T,tw)=>t<tw?t/tw:0.5*(1+Math.cos(Math.PI*Math.min((t-tw)/(T-tw),1)));
const stepd=(t,T,tw)=>t<tw?t/tw:t<0.6*T?1:t<0.85*T?0.1:0.01;
function drawWC(){const w=+$('#wcW').value;$('#wcWo').textContent=w+'%';const T=100,tw=w;const st=segVal('#wcS','v')==='s';
  const cv=[{f:t=>cosw(t,T,tw),c:'var(--math)'}];if(st)cv.push({f:t=>stepd(t,T,tw),c:'var(--rose)',dash:1});
  plot($('#wcPlot'),{xmin:0,xmax:100,ymin:0,ymax:1.05,H:230,xt:[0,25,50,75,100],yt:[0,0.25,0.5,0.75,1],ytf:v=>v+'η₀',xl:'% of training',yl:'η / η₀',curves:cv,
    pts:tw>0&&tw<100?[{x:tw,y:1,c:'var(--math)',t:'peak'}]:[]});
  const mid=tw+(T-tw)/2;
  $('#wcCalc').textContent=`warmup t_w = ${tw}% of T\nhalfway through the decay (t = ${mid.toFixed(0)}%): η = ${cosw(mid,T,tw).toFixed(2)} η₀\nat t = 90%: cosine ${cosw(90,T,tw).toFixed(3)} η₀`+(st?`, step schedule ${stepd(90,T,tw)} η₀ (÷10 at 60% and 85%)`:'')}
$('#wcW').addEventListener('input',drawWC);segOn('#wcS',drawWC);drawWC();

/* ---------- 7.2 bottleneck calculator ---------- */
function drawInc(){const c=+$('#incC').value,b=+$('#incB').value,o=+$('#incO').value,k=+segVal('#incK','v');
  $('#incCo').textContent=c;$('#incBo').textContent=b;$('#incOo').textContent=o;
  const D=k*k*c*o,B1=c*b,B2=k*k*b*o,B=B1+B2,mx=Math.max(D,B);
  $('#incOut').innerHTML=bar(`${k}×${k} مباشرة`,D,mx,N(D),'var(--rose)')+bar(`1×1 (${c}→${b}) ثم ${k}×${k}`,B,mx,N(B),'var(--green)');
  $('#incCalc').textContent=`direct:     ${k}·${k}·${c}·${o} = ${N(D)} weights\nbottleneck: ${c}·${b} + ${k}·${k}·${b}·${o} = ${N(B1)} + ${N(B2)} = ${N(B)}\nsaving: ${(D/B).toFixed(1)}×  (multiply-adds per position shrink by the same factor)`}
['#incC','#incB','#incO'].forEach(s=>$(s).addEventListener('input',drawInc));segOn('#incK',drawInc);drawInc();

/* ---------- 7.2 scoreboard ---------- */
const SB=[['LeNet',0.06,0.4,89,'88–90%'],['AlexNet',46.8,938,91,'≈91%'],['VGG (ربع العرض)',43.1,512,93,'93% (lr 0.1)'],['NiN',3.4,798,89,'89%'],['PooledVGG',0.6,470,89.5,'89–90%'],['GoogLeNet',6.0,276,91,'91%']];
function drawSB(){const m=+segVal('#sbS','v');const mx=m===1?50:m===2?1000:10;
  $('#sbOut').innerHTML=SB.map(r=>bar(r[0],m===3?r[3]-85:r[m],mx,m===1?r[1]+'M':m===2?r[2]+'M':r[4],m===3?'var(--green)':'var(--math)')).join('');
  $('#sbCalc').textContent=m===1?'parameters (millions): the dense head dominates AlexNet and VGG;\nglobal average pooling (NiN, PooledVGG, GoogLeNet) removes it'
    :m===2?'multiply-adds per image (millions); GoogLeNet runs on 96×96 inputs, the others on 224×224':'validation accuracy after 10 epochs (bars start at 85%)\nall within a few points: Fashion-MNIST is easy; parameters differ by ~800×'}
segOn('#sbS',drawSB);drawSB();

/* ---------- 7.3 batch norm on 4 numbers ---------- */
const BNX=[[2,4,6,8],[20,40,60,80],[102,104,106,108],[1,1,1,9]];
function drawBN(){const x=BNX[+segVal('#bnX','v')],g=$('#bnG').value/10,b=$('#bnB').value/10;$('#bnGo').textContent=g.toFixed(1);$('#bnBo').textContent=b.toFixed(1);
  const mu=x.reduce((a,v)=>a+v,0)/4,va=x.reduce((a,v)=>a+(v-mu)**2,0)/4,sd=Math.sqrt(va+1e-5),xh=x.map(v=>(v-mu)/sd),y=xh.map(v=>g*v+b);
  $('#bnOut').innerHTML=`<div class="tw">${lab('x',grid([x]))}${lab('x̂ = (x − μ̂)/σ̂',grid([xh.map(F2)],()=>'m'))}${lab('γx̂ + β',grid([y.map(F2)],()=>'g'))}</div>`;
  $('#bnCalc').textContent=`μ̂ = ${fmt(mu)}   σ̂² = ${fmt(va)}   σ̂ = ${sd.toFixed(3)}\nx̂ has mean ${Math.abs(xh.reduce((a,v)=>a+v,0)/4).toFixed(2)} and variance ${(xh.reduce((a,v)=>a+v*v,0)/4).toFixed(2)}\noutput mean = β = ${b.toFixed(1)}, output std = |γ| = ${g.toFixed(1)}`}
segOn('#bnX',drawBN);['#bnG','#bnB'].forEach(s=>$(s).addEventListener('input',drawBN));drawBN();

/* ---------- 7.3 activation scale through depth ---------- */
let dsSeed=7;
function randMat(R,n,m,sd){const W=[];for(let i=0;i<n;i++){const r=new Float64Array(m);for(let j=0;j<m;j++)r[j]=gauss(R)*sd;W.push(r)}return W}
function drawDS(){const s=$('#dsS').value/100;$('#dsSo').textContent=s.toFixed(2);const R=rng(dsSeed),n=64,B=128,L=20;
  const Ws=[];for(let l=0;l<L;l++)Ws.push(randMat(R,n,n,s*Math.sqrt(2/n)));
  let X=[];for(let b=0;b<B;b++){const r=new Float64Array(n);for(let j=0;j<n;j++)r[j]=gauss(R);X.push(r)}
  const run=norm=>{let H=X.map(r=>r.slice());const out=[];
    for(let l=0;l<L;l++){const W=Ws[l];const Z=H.map(h=>{const z=new Float64Array(n);for(let i=0;i<n;i++){let a=0;const w=W[i];for(let j=0;j<n;j++)a+=w[j]*h[j];z[i]=a}return z});
      let ss=0;Z.forEach(z=>z.forEach(v=>ss+=v*v));out.push(Math.sqrt(ss/(B*n)));
      if(norm){for(let i=0;i<n;i++){let m=0;for(let b=0;b<B;b++)m+=Z[b][i];m/=B;let v=0;for(let b=0;b<B;b++)v+=(Z[b][i]-m)**2;v=Math.sqrt(v/B+1e-5);for(let b=0;b<B;b++)Z[b][i]=(Z[b][i]-m)/v}}
      H=Z.map(z=>z.map(v=>v>0?v:0))}return out};
  const a=run(false),c=run(true),lg=v=>Math.log10(v);
  const lo=Math.min(-3,Math.floor(Math.min(...a.map(lg)))),hi=Math.max(1,Math.ceil(Math.max(...a.map(lg))));const yt=[];for(let v=lo;v<=hi;v++)yt.push(v);
  plot($('#dsPlot'),{xmin:1,xmax:20,ymin:lo,ymax:hi,H:230,xt:[1,5,10,15,20],yt,ytf:v=>'10^'+v,xl:'layer',yl:'std of pre-activations',
    lines:[{pts:a.map((v,i)=>[i+1,lg(v)]),c:'var(--rose)',w:2.5},{pts:c.map((v,i)=>[i+1,lg(v)]),c:'var(--green)',w:2.5}],
    pts:[{x:20,y:lg(a[19]),c:'var(--rose)',t:'no norm',left:1},{x:20,y:lg(c[19]),c:'var(--green)',t:'batch norm',left:1}]});
  $('#dsCalc').textContent=`init scale ${s.toFixed(2)} × He\nlayer 20 std: without normalization ${a[19].toExponential(2)}, with batch norm ${c[19].toFixed(2)}\nwithout: each layer multiplies the scale by ≈ ${s.toFixed(2)} → ${s.toFixed(2)}^20 = ${(s**20).toExponential(1)}`}
$('#dsS').addEventListener('input',drawDS);$('#dsGo').addEventListener('click',()=>{dsSeed++;drawDS()});drawDS();

/* ---------- 7.3 which entries share statistics ---------- */
let ntSel=[1,2];
function drawNT(){const m=segVal('#ntS','v'),[si,sj]=ntSel;const M=[];for(let i=0;i<4;i++){M.push([]);for(let j=0;j<8;j++)M[i].push('c'+(j+1))}
  const same=(i,j)=>m==='bn'?j===sj:m==='ln'?i===si:m==='gn'?i===si&&Math.floor(j/4)===Math.floor(sj/4):i===si&&j===sj;
  $('#ntOut').innerHTML=lab('الصفوف: الأمثلة ٤ · الأعمدة: القنوات ٨',grid(M,(i,j)=>i===si&&j===sj?'m':same(i,j)?'h':'x',{click:1}));
  $$('#ntOut .tgrid i').forEach(e=>e.addEventListener('click',()=>{ntSel=[+e.dataset.i,+e.dataset.j];drawNT()}));
  let k=0;for(let i=0;i<4;i++)for(let j=0;j<8;j++)if(same(i,j))k++;
  const nm={bn:'batch norm: one channel, all examples',ln:'layer norm: one example, all channels',gn:'group norm: one example, its group of 4 channels',in:'instance norm: one example, one channel'}[m];
  $('#ntCalc').textContent=`${nm}\nshared cells: ${k}; with 28×28 maps each cell holds 784 values → ${N(k*784)} values per mean\n`+(m==='bn'?'depends on the other examples in the batch':'independent of the batch: works with one image')}
segOn('#ntS',drawNT);drawNT();

/* ---------- 7.4 gradient norm through depth ---------- */
let grSeed=3;
function drawGR(){const s=$('#grS').value/100,L=+$('#grL').value;$('#grSo').textContent=s.toFixed(2);$('#grLo').textContent=L;const n=32,al=0.2,R=rng(grSeed);
  const Ws=[];for(let l=0;l<L;l++)Ws.push(randMat(R,n,n,s*Math.sqrt(2/n)));const x=new Float64Array(n);for(let j=0;j<n;j++)x[j]=gauss(R);
  const u=new Float64Array(n);for(let j=0;j<n;j++)u[j]=gauss(R);const un=Math.hypot(...u);for(let j=0;j<n;j++)u[j]/=un;
  const mv=(W,h)=>{const z=new Float64Array(n);for(let i=0;i<n;i++){let a=0;for(let j=0;j<n;j++)a+=W[i][j]*h[j];z[i]=a}return z};
  const mtv=(W,g)=>{const z=new Float64Array(n);for(let i=0;i<n;i++){const gi=g[i];if(!gi)continue;for(let j=0;j<n;j++)z[j]+=W[i][j]*gi}return z};
  const run=res=>{let h=x.slice();const masks=[];for(let l=0;l<L;l++){const z=mv(Ws[l],h);masks.push(z.map(v=>v>0?1:0));const r=z.map(v=>v>0?v:0);h=res?h.map((v,i)=>v+al*r[i]):r}
    let g=u.slice();const out=[[L,0]];for(let l=L-1;l>=0;l--){const gm=g.map((v,i)=>v*masks[l][i]);const b=mtv(Ws[l],gm);g=res?g.map((v,i)=>v+al*b[i]):b;out.push([l,Math.log10(Math.max(1e-30,Math.hypot(...g)))])}return out};
  const p=run(false),r=run(true);const all=[...p,...r].map(q=>q[1]);const lo=Math.max(-12,Math.min(-2,Math.floor(Math.min(...all)))),hi=Math.max(2,Math.ceil(Math.max(...all)));
  const yt=[];const st=Math.ceil((hi-lo)/6);for(let v=lo;v<=hi;v+=st)yt.push(v);
  plot($('#grPlot'),{xmin:0,xmax:L,ymin:lo,ymax:hi,H:240,xt:[0,L/2,L],yt,ytf:v=>'10^'+v,xl:'layer (0 = input)',yl:'‖gradient‖',
    lines:[{pts:p,c:'var(--rose)',w:2.5},{pts:r,c:'var(--green)',w:2.5}],pts:[{x:Math.round(L/4),y:p[L-Math.round(L/4)][1],c:'var(--rose)',t:'plain'},{x:Math.round(L/4),y:r[L-Math.round(L/4)][1],c:'var(--green)',t:'residual'}]});
  $('#grCalc').textContent=`gradient norm reaching the input after ${L} layers (starts at 1 at the output):\nplain    ∏ Dₗ Wₗ        : ${(10**p[L][1]).toExponential(2)}\nresidual ∏ (I + 0.2 Dₗ Wₗ): ${(10**r[L][1]).toExponential(2)}\n(residual branches scaled by 0.2, as if their last γ started small)`}
['#grS','#grL'].forEach(s=>$(s).addEventListener('input',drawGR));$('#grGo').addEventListener('click',()=>{grSeed++;drawGR()});drawGR();

/* ---------- 7.4 path lengths ---------- */
function drawPA(){const L=+$('#paL').value;$('#paLo').textContent=L;const c=[1];for(let k=1;k<=L;k++)c.push(c[k-1]*(L-k+1)/k);const tot=2**L,pr=c.map(v=>v/tot),mx=Math.max(...pr);
  plot($('#paPlot'),{xmin:-0.5,xmax:L+0.5,ymin:0,ymax:mx*1.1,H:200,xt:[0,Math.round(L/2),L],yt:[0,+(mx/2).toPrecision(2),+mx.toPrecision(2)],xl:'path length k (residual branches used)',yl:'share of paths',
    raw:(x,y)=>pr.map((v,k)=>`<rect x="${x(k-0.4)}" y="${y(v)}" width="${Math.max(1,x(k+0.4)-x(k-0.4))}" height="${y(0)-y(v)}" fill="var(--math)" opacity=".8"/>`).join('')});
  let mid=0;for(let k=0;k<=L;k++)if(Math.abs(k-L/2)<=Math.sqrt(L)/2)mid+=pr[k];
  $('#paCalc').textContent=`${L} blocks → 2^${L} = ${tot.toExponential(2)} paths\nnumber of paths of length k = C(${L}, k); mean length ${L/2}, std ${(Math.sqrt(L)/2).toFixed(2)}\n${(100*mid).toFixed(0)}% of paths have length within ±1 std of ${L/2}; only 1 path uses all ${L} branches`}
$('#paL').addEventListener('input',drawPA);drawPA();

/* ---------- 7.4 ResNeXt cost ---------- */
function drawRX(){const c=+$('#rxC').value,b=+$('#rxB').value,g=+segVal('#rxG','v');$('#rxCo').textContent=c;$('#rxBo').textContent=b;
  const l1=c*b,l2=9*b*b/g,l3=b*c,T=l1+l2+l3,b0=c/4,R0=c*b0+9*b0*b0+b0*c,mx=Math.max(T,R0);
  $('#rxOut').innerHTML=bar(`1×1 ${c}→${b}`,l1,mx,N(l1))+bar(`3×3 ${b}→${b}، ${g} مجموعة`,l2,mx,N(l2),'var(--math)')+bar(`1×1 ${b}→${c}`,l3,mx,N(l3))+bar('المجموع',T,mx,N(T),'var(--green)')+bar(`ResNet (b = ${b0}، g = 1)`,R0,mx,N(R0),'var(--rose)');
  $('#rxCalc').textContent=`c·b + 9·b·b/g + b·c = ${N(l1)} + ${N(l2)} + ${N(l3)} = ${N(T)}\neach group sees ${b/g} channel(s); the 3×3 layer costs 1/${g} of a dense one\nResNet bottleneck with b = c/4 = ${b0}: ${N(R0)}`}
['#rxC','#rxB'].forEach(s=>$(s).addEventListener('input',drawRX));segOn('#rxG',drawRX);drawRX();

/* ---------- 7.5 depthwise separable ---------- */
function drawDW(){const ci=+$('#dwI').value,co=+$('#dwO').value,k=+segVal('#dwK','v');$('#dwIo').textContent=ci;$('#dwOo').textContent=co;
  const D=k*k*ci*co,S1=k*k*ci,S2=ci*co,S=S1+S2,mx=Math.max(D,S);
  $('#dwOut').innerHTML=bar('كثيف',D,mx,N(D),'var(--rose)')+bar(`عمقي ${k}×${k}`,S1,mx,N(S1),'var(--math)')+bar('نقطي 1×1',S2,mx,N(S2),'var(--math)')+bar('المنفصل كله',S,mx,N(S),'var(--green)');
  $('#dwCalc').textContent=`dense:     k²·cᵢ·cₒ = ${k*k}·${ci}·${co} = ${N(D)}\nseparable: k²·cᵢ + cᵢ·cₒ = ${N(S1)} + ${N(S2)} = ${N(S)}\nratio = 1/cₒ + 1/k² = ${(1/co+1/(k*k)).toFixed(4)}  →  ${(D/S).toFixed(1)}× fewer`}
['#dwI','#dwO'].forEach(s=>$(s).addEventListener('input',drawDW));segOn('#dwK',drawDW);
$('#dwEx').addEventListener('click',()=>{$('#dwI').value=3;$('#dwO').value=3;$$('#dwK button').forEach(b=>b.classList.toggle('on',b.dataset.v==='3'));drawDW()});drawDW();

/* ---------- 7.5 compound scaling ---------- */
function drawCM(){const p=+$('#cmP').value;$('#cmPo').textContent=p;const d=1.2**p,w=1.1**p,r=1.15**p,c=d*w*w*r*r,mx=Math.max(c,1.92**7);
  $('#cmOut').innerHTML=bar('العمق',d,mx,'×'+d.toFixed(2),'var(--math)')+bar('العرض',w,mx,'×'+w.toFixed(2),'var(--math)')+bar('الدقة',r,mx,'×'+r.toFixed(2),'var(--math)')+bar('الحساب',c,mx,'×'+c.toFixed(1),'var(--amber)');
  $('#cmCalc').textContent=`compute ∝ depth · width² · resolution²\none step: 1.2 · 1.1² · 1.15² = ${(1.2*1.21*1.3225).toFixed(2)} ≈ 2×\n${p} step(s): ${d.toFixed(2)} · ${w.toFixed(2)}² · ${r.toFixed(2)}² = ${c.toFixed(2)}×`}
$('#cmP').addEventListener('input',drawCM);drawCM();

/* ---------- 7.5 RepVGG fusion ---------- */
let rpSeed=11;
function drawRP(){const R=rng(rpSeed),eps=1e-5,U=(a,b)=>a+(b-a)*R();
  const K3=[0,1,2].map(()=>[0,1,2].map(()=>+gauss(R).toFixed(2))),k1=+gauss(R).toFixed(2);
  const bn=()=>({g:+U(0.5,2).toFixed(2),b:+U(-1,1).toFixed(2),m:+U(-1,1).toFixed(2),v:+U(0.5,3).toFixed(2)});const B1=bn(),B2=bn(),B3=bn();
  const sc=q=>q.g/Math.sqrt(q.v+eps),sh=q=>q.b-q.g*q.m/Math.sqrt(q.v+eps);
  const X=[];for(let i=0;i<8;i++){X.push([]);for(let j=0;j<8;j++)X[i].push(i&&j&&i<7&&j<7?gauss(R):0)} // 6×6 input zero-padded by 1
  const conv=(K,i,j)=>{let s=0;for(let a=0;a<3;a++)for(let b=0;b<3;b++)s+=K[a][b]*X[i+a][j+b];return s};
  const F1=K3.map(r=>r.map(v=>v*sc(B1))),F2k=[[0,0,0],[0,k1*sc(B2),0],[0,0,0]],F3=[[0,0,0],[0,sc(B3),0],[0,0,0]];
  const KF=F1.map((r,a)=>r.map((v,b)=>v+F2k[a][b]+F3[a][b])),bF=sh(B1)+sh(B2)+sh(B3);
  let md=0;for(let i=0;i<6;i++)for(let j=0;j<6;j++){const y=(conv(K3,i,j)-B1.m)*sc(B1)+B1.b+(k1*X[i+1][j+1]-B2.m)*sc(B2)+B2.b+(X[i+1][j+1]-B3.m)*sc(B3)+B3.b;md=Math.max(md,Math.abs(y-(conv(KF,i,j)+bF)))}
  const r2=M=>M.map(r=>r.map(F2)),cc=(a,b)=>a===1&&b===1?'h':'';
  $('#rpOut').innerHTML=lab('3×3 بعد دمج تطبيعه',grid(r2(F1),cc))+lab('+ 1×1 مبطّنة',grid(r2(F2k),cc))+lab('+ الهوية',grid(r2(F3),cc))+lab('= النواة المدمجة',grid(r2(KF),(a,b)=>a===1&&b===1?'g':''));
  $('#rpCalc').textContent=`BN₁ γ=${B1.g} β=${B1.b} μ=${B1.m} σ²=${B1.v}   (each branch has its own BN)\nfused bias b̂ = Σ (β − γμ/√(σ²+ε)) = ${bF.toFixed(3)}\nmax |three-branch output − fused conv output| on a random 6×6 input = ${md.toExponential(1)}\nonly the center tap differs from the 3×3 branch`}
$('#rpGo').addEventListener('click',()=>{rpSeed++;drawRP()});drawRP();

/* ---------- 7.6 label smoothing ---------- */
const lsL=(m,e)=>{const Z=Math.exp(m)+2,py=Math.exp(m)/Z,pk=1/Z;return -(1-e+e/3)*Math.log(py)-(2*e/3)*Math.log(pk)};
function drawLS(){const m=$('#lsM').value/10,e=$('#lsE').value/100;$('#lsMo').textContent=m.toFixed(1);$('#lsEo').textContent=e.toFixed(2);
  let best=0,bv=1e9;for(let t=0;t<=1500;t++){const v=lsL(t/100,e);if(v<bv){bv=v;best=t/100}}
  plot($('#lsPlot'),{xmin:0,xmax:12,ymin:0,ymax:1.5,H:230,xt:[0,3,6,9,12],yt:[0,0.5,1,1.5],xl:'logit margin m',yl:'loss',
    curves:[{f:t=>lsL(t,0),c:'var(--rose)',dash:1},{f:t=>lsL(t,e),c:'var(--math)'}],
    pts:[{x:m,y:Math.min(1.5,lsL(m,e)),c:'var(--math)',t:lsL(m,e).toFixed(3)},...(e>0?[{x:best,y:bv,c:'var(--green)',r:4}]:[])]});
  const Z=Math.exp(m)+2;
  $('#lsCalc').textContent=`logits (m, 0, 0) → p_y = ${(Math.exp(m)/Z).toFixed(4)}\nplain cross-entropy (dashed): ${lsL(m,0).toFixed(4)}\nsmoothed, ε = ${e.toFixed(2)}: ${lsL(m,e).toFixed(4)}`+(e>0?`\nminimum ${bv.toFixed(3)} at m ≈ ${best.toFixed(1)} (p_y = 1 − ε + ε/3 = ${(1-e+e/3).toFixed(3)})`:'\nwith ε = 0 the loss keeps falling as m → ∞')}
['#lsM','#lsE'].forEach(s=>$(s).addEventListener('input',drawLS));drawLS();

/* ---------- 7.6 Mixup / CutMix ---------- */
function gam(R,a){if(a<1)return gam(R,a+1)*Math.pow(R(),1/a);const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{x=gauss(R);v=1+c*x}while(v<=0);v=v*v*v;const u=R();if(u<1-0.0331*x**4||Math.log(u)<0.5*x*x+d*(1-v+Math.log(v)))return d*v}}
const beta=(R,a)=>{const x=gam(R,a),y=gam(R,a);return x/(x+y)};
const IMA=[],IMB=[];for(let i=0;i<14;i++){IMA.push([]);IMB.push([]);for(let j=0;j<14;j++){
  const sh=(i>=2&&i<=12&&j>=4&&j<=9)||(i>=2&&i<=5&&j>=1&&j<=12),nk=i===2&&j>=6&&j<=7;IMA[i].push(sh&&!nk?0.85:0);
  const tr=(i>=1&&i<=3&&j>=3&&j<=10)||(i>=3&&i<=12&&((j>=3&&j<=5)||(j>=8&&j<=10)));IMB[i].push(tr?0.6:0)}}
const gray=v=>`color-mix(in srgb, var(--ink) ${Math.round(Math.max(0,Math.min(1,v))*100)}%, var(--paper))`;
function pix(M,size=7){const C=M[0].length;return`<div style="display:inline-grid;grid-template-columns:repeat(${C},${size}px);border:1px solid var(--rule)">${M.map(r=>r.map(v=>`<span style="width:${size}px;height:${size}px;background:${gray(v)}"></span>`).join('')).join('')}</div>`}
let mxSeed=5;
function drawMX(){const a=$('#mxA').value/10;$('#mxAo').textContent=a.toFixed(1);const R=rng(mxSeed),lam=beta(R,a);
  const MX=IMA.map((r,i)=>r.map((v,j)=>lam*v+(1-lam)*IMB[i][j]));
  const side=Math.round(14*Math.sqrt(1-lam)),r0=Math.floor(R()*(15-side)),c0=Math.floor(R()*(15-side)),area=side*side/196;
  const CM=IMA.map((r,i)=>r.map((v,j)=>i>=r0&&i<r0+side&&j>=c0&&j<c0+side?IMB[i][j]:v));
  $('#mxOut').innerHTML=lab('xᵢ قميص',pix(IMA))+lab('xⱼ بنطال',pix(IMB))+lab(`Mixup، λ = ${lam.toFixed(2)}`,pix(MX))+lab('CutMix',pix(CM));
  const H=new Array(20).fill(0),R2=rng(99);for(let t=0;t<2000;t++){H[Math.min(19,Math.floor(beta(R2,a)*20))]++}const mx=Math.max(...H)/2000;
  plot($('#mxPlot'),{xmin:0,xmax:1,ymin:0,ymax:mx*1.1,H:170,xt:[0,0.25,0.5,0.75,1],yt:[0,+(mx/2).toPrecision(2),+mx.toPrecision(2)],xl:'λ ~ Beta(α, α)',yl:'share of draws',
    raw:(x,y)=>H.map((v,k)=>`<rect x="${x(k/20)+1}" y="${y(v/2000)}" width="${x(1/20)-x(0)-2}" height="${y(0)-y(v/2000)}" fill="var(--math)" opacity=".75"/>`).join('')});
  $('#mxCalc').textContent=`Mixup  label: shirt ${lam.toFixed(2)}, trousers ${(1-lam).toFixed(2)}\nCutMix label: shirt ${(1-area).toFixed(2)}, trousers ${area.toFixed(2)}  (pasted ${side}×${side} of 14×14)\nloss on the soft label = λ·CE(shirt) + (1 − λ)·CE(trousers)`}
$('#mxA').addEventListener('input',drawMX);$('#mxGo').addEventListener('click',()=>{mxSeed++;drawMX()});drawMX();

/* ---------- 7.6 EMA lag ---------- */
const EMT=(()=>{const R=rng(42),o=[];for(let t=0;t<200;t++)o.push(Math.min(t/50,1)+0.1*gauss(R));return o})();
function drawEM(){const rho=+segVal('#emS','v');let s=0;const e=EMT.map(v=>s=rho*s+(1-rho)*v);
  const sd=a=>{const q=a.slice(100),m=q.reduce((x,y)=>x+y,0)/q.length;return Math.sqrt(q.reduce((x,y)=>x+(y-m)**2,0)/q.length)};
  plot($('#emPlot'),{xmin:0,xmax:200,ymin:-0.2,ymax:1.3,H:230,xt:[0,50,100,150,200],yt:[0,0.5,1],xl:'step',yl:'weight',
    lines:[{pts:EMT.map((v,i)=>[i,v]),c:'var(--soft)',w:1.2},{pts:e.map((v,i)=>[i,v]),c:'var(--math)',w:2.8}],pts:[{x:199,y:e[199],c:'var(--math)',t:e[199].toFixed(2),left:1}]});
  $('#emCalc').textContent=`ρ = ${rho}: horizon ≈ 1/(1 − ρ) = ${Math.round(1/(1-rho))} steps\nshadow weight at step 200: ${e[199].toFixed(3)} (${Math.abs(100*(1-e[199])).toFixed(0)}% ${e[199]<1?'below':'above'} 1)\nspread (std over steps 100–200, includes any lag drift): raw ${sd(EMT).toFixed(3)}, EMA ${sd(e).toFixed(3)}`}
segOn('#emS',drawEM);drawEM();

/* ---------- 7.7 ConvNeXt roadmap ---------- */
const CN=[['ResNet-50 (٢٠١٥)',76.1,'starting point'],['وصفة حديثة',78.8,'300 epochs, AdamW, Mixup, label smoothing, stochastic depth'],['مراحل 3,3,9,3',79.4,'blocks per stage (3,4,6,3) → (3,3,9,3)'],['جذع 4×4',79.5,'7×7/2 conv + pool → one 4×4 stride-4 conv'],['عمقي، عرض ٩٦',80.5,'3×3 becomes depthwise; width 64 → 96'],['عنق مقلوب',80.6,'expand 4× inside the block'],['عمقي 7×7',80.6,'moved to front (79.9) then enlarged to 7×7'],['GELU',80.6,'smooth activation; no change alone'],['GELU واحد',81.3,'one GELU per block instead of three'],['تطبيع واحد',81.4,'one normalization per block instead of three'],['BN ← LN',81.5,'layer norm over channels at each position'],['تصغير منفصل',82.0,'LN + 2×2 stride-2 conv between stages']];
function drawCN(){const k=+$('#cnS').value;$('#cnSo').textContent=k;
  $('#cnOut').innerHTML=CN.map((r,i)=>`<div style="opacity:${i<=k?1:.3}">${bar(r[0],r[1]-75,8,r[1].toFixed(1)+'%',i===0?'var(--rose)':i===1?'var(--amber)':'var(--math)')}</div>`).join('')+bar('Swin-T',81.3-75,8,'81.3%','var(--soft)');
  const d=k?CN[k][1]-CN[k-1][1]:0,tot=CN[k][1]-76.1,rec=Math.min(tot,2.7);
  $('#cnCalc').textContent=`step ${k}: ${CN[k][2]}\nchange vs previous: ${d>=0?'+':''}${d.toFixed(1)}   total vs ResNet-50: +${tot.toFixed(1)}\n  of which recipe +${rec.toFixed(1)}, architecture +${(tot-rec).toFixed(1)}   (bars start at 75%)`+(CN[k][1]>81.3?'\nabove Swin-T (81.3%), with no attention layer':'')}
$('#cnS').addEventListener('input',drawCN);drawCN();

/* ---------- 7.8 RegNet staircase ---------- */
function drawRG(){const u0=+$('#rgU').value,a=$('#rgA').value/100,m=$('#rgM').value/100,D=+$('#rgD').value;
  $('#rgUo').textContent=u0;$('#rgAo').textContent=a.toFixed(2);$('#rgMo').textContent=m.toFixed(2);$('#rgDo').textContent=D;
  const u=[],s=[],w=[];for(let j=0;j<D;j++){u.push(u0+a*j);s.push(Math.round(Math.log(u[j]/u0)/Math.log(m)));w.push(Math.max(8,Math.round(u0*m**s[j]/8)*8))}
  const st=[];w.forEach(v=>{if(st.length&&st[st.length-1][1]===v)st[st.length-1][0]++;else st.push([1,v])});
  const ymax=Math.max(...u,...w)*1.1,lv=[];for(let q=0;u0*m**q<=ymax;q++)lv.push(u0*m**q);
  const pts=[];w.forEach((v,j)=>{pts.push([j-0.5,v],[j+0.5,v])});
  plot($('#rgPlot'),{xmin:-0.5,xmax:D-0.5,ymin:0,ymax,H:240,xt:[0,Math.floor((D-1)/2),D-1],yt:[0,Math.round(ymax/2/8)*8,Math.round(ymax/1.1/8)*8],xl:'block j',yl:'width',
    raw:(x,y)=>lv.map(v=>`<line x1="${x(-0.5)}" x2="${x(D-0.5)}" y1="${y(v)}" y2="${y(v)}" stroke="var(--soft)" stroke-dasharray="4 4"/>`).join(''),
    lines:[{pts,c:'var(--green)',w:3}],pts:u.map((v,j)=>({x:j,y:v,c:'var(--math)',r:4}))});
  $('#rgCalc').textContent=`u_j = ${u0} + ${a.toFixed(2)}·j  (dots); levels ${u0}·${m.toFixed(2)}^s (dashed); widths rounded to multiples of 8\nstages: ${st.length}\ndepths: (${st.map(q=>q[0]).join(', ')})\nwidths: (${st.map(q=>q[1]).join(', ')})`}
['#rgU','#rgA','#rgM','#rgD'].forEach(s=>$(s).addEventListener('input',drawRG));drawRG();
