/* D2L · Chapter 2 · Linear Regression — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s2-1','2.1','الانحدار الخطي'],['s2-2','2.2','بيانات مصطنعة'],['s2-3','2.3','التنفيذ من الصفر'],['s2-4','2.4','تصميم كائني'],['s2-5','2.5','التنفيذ المختصر'],['s2-6','2.6','التعميم'],['s2-7','2.7','تناقص الأوزان'],['ex','','الخلاصة والتمارين']];
const GL=[
['الانحدار','regression','التنبؤ بقيمة عددية.'],
['الخاصية / الوسم','feature / label','المدخلات التي نتنبأ منها / القيمة التي نتنبأ بها.'],
['الوزن والانحياز','weight, bias','أثر كل خاصية / قيمة البداية المضافة.'],
['مصفوفة التصميم','design matrix','X: صف لكل مثال وعمود لكل خاصية.'],
['الخسارة التربيعية','squared loss','½(ŷ − y)²؛ تعاقب الأخطاء الكبيرة بشدة.'],
['المعادلات الطبيعية','normal equations','X⊤Xw = X⊤y: الحل المباشر للمربعات الصغرى.'],
['الإسقاط','projection','أقرب نقطة في فضاء أعمدة X إلى y؛ الخطأ عمودي عليه.'],
['النزول التدرّجي العشوائي بالدفعات','minibatch SGD','خطوات عكس متوسط تدرّج دفعة عشوائية.'],
['معدّل التعلّم','learning rate (η)','طول الخطوة.'],
['المعامل الفائق','hyperparameter','إعداد نختاره نحن لا تتعلّمه الخوارزمية (η، حجم الدفعة، λ).'],
['التوجيه','vectorization','حساب الدفعة كلها بعمليات مصفوفات بدل الحلقات.'],
['التوزيع الطبيعي','normal (Gaussian) distribution','منحنى الجرس 𝒩(μ, σ²).'],
['الأرجحية العظمى','maximum likelihood','اختيار المعاملات التي تجعل البيانات المرصودة أكثر احتمالاً.'],
['خسارة هوبر','Huber loss','تربيعية للأخطاء الصغيرة وخطية للكبيرة.'],
['الطبقة كاملة الاتصال','fully connected (dense) layer','كل مدخل موصول بكل مخرج.'],
['الدورة','epoch','مرور كامل على بيانات التدريب.'],
['أرضية الضجيج','noise floor','أقل خسارة ممكنة بسبب الضجيج العشوائي: ½σ².'],
['التباعد','divergence','تضخم الأخطاء حين يكون معدّل التعلّم كبيراً جداً.'],
['المحسِّن','optimizer','الكائن الذي يطبّق قاعدة التحديث على المعاملات.'],
['خطأ التعميم','generalization error','الخطأ المتوقع على أمثلة جديدة من التوزيع نفسه.'],
['فرط الملاءمة / نقصها','overfitting / underfitting','حفظ التدريب والفشل خارجه / الفشل في الاثنين.'],
['افتراض IID','IID assumption','الأمثلة مستقلة ومن التوزيع نفسه في التدريب والاختبار.'],
['مجموعة التحقق','validation set','بيانات لاختيار النموذج والمعاملات الفائقة.'],
['التحقق المتقاطع','K-fold cross-validation','تقسيم التدريب K أجزاء والتحقق على كل جزء مرة.'],
['تناقص الأوزان','weight decay','عقوبة (λ/2)‖w‖² تقلّص الأوزان في كل خطوة.']];
initPage(SECS,GL);
const F4=v=>isFinite(v)?(Math.abs(v)>=1e4||(Math.abs(v)<1e-3&&v!==0)?v.toExponential(2):(+v.toFixed(4)).toString()):'nan';

/* ---------- 2.1 three points ---------- */
const FX=[0,1,2],FY=[1,1,0];
function drawFT(){
  const w=+$('#ftW').value,b=+$('#ftB').value;$('#ftWo').textContent=w.toFixed(2);$('#ftBo').textContent=b.toFixed(2);
  const r=FX.map((x,i)=>w*x+b-FY[i]),L=r.reduce((s,v)=>s+v*v,0)/(2*FX.length);
  plot($('#ftPlot'),{xmin:-0.5,xmax:2.5,ymin:-1,ymax:2.5,yt:[-1,0,1,2],xt:[0,1,2],xl:'x',yl:'y',H:220,
    curves:[{f:x=>w*x+b,c:'var(--green)'}],lines:FX.map((x,i)=>({pts:[[x,FY[i]],[x,w*x+b]],c:'var(--rose)',w:2})),
    pts:FX.map((x,i)=>({x,y:FY[i],c:'var(--amber)'}))});
  $('#ftCalc').textContent=`ŷ = ${w.toFixed(2)}·x + ${b.toFixed(2)}\nresiduals r = ŷ − y = (${r.map(v=>v.toFixed(3)).join(', ')})   (red segments)\nL = (1/2n) Σ r² = (1/6)(${r.map(v=>(v<0?"("+v.toFixed(3)+")":v.toFixed(3))+"²").join(" + ")}) = ${L.toFixed(4)}\noptimum (normal equations): b = 7/6 ≈ 1.167, w = −0.5, L = 1/36 ≈ 0.0278`;
}
['#ftW','#ftB'].forEach(id=>$(id).addEventListener('input',drawFT));
$('#ftBest').onclick=()=>{$('#ftW').value=-0.5;$('#ftB').value=7/6;drawFT()};drawFT();document.addEventListener('themechange',drawFT);

/* ---------- 2.1 one corrupted label ---------- */
function drawOL(){
  const bad=$('#olOn').checked,X=Array.from({length:20},(_,i)=>i+1),Y=X.map(x=>2*x);if(bad)Y[5]=10000;
  const sxx=X.reduce((s,x)=>s+x*x,0),sxy=X.reduce((s,x,i)=>s+x*Y[i],0),wls=sxy/sxx;
  // least absolute deviation through origin = weighted median of y/x with weights x
  const pr=X.map((x,i)=>[Y[i]/x,x]).sort((a,b)=>a[0]-b[0]);let acc=0,half=X.reduce((s,x)=>s+x,0)/2,wlad=pr[0][0];for(const [r,wt] of pr){acc+=wt;if(acc>=half){wlad=r;break}}
  plot($('#olPlot'),{xmin:0,xmax:21,ymin:0,ymax:60,yt:[0,20,40,60],xt:[5,10,15,20],xl:'x',yl:'y',H:220,
    curves:[{f:x=>wls*x,c:'var(--rose)'},{f:x=>wlad*x,c:'var(--green)',dash:1}],
    pts:X.map((x,i)=>Y[i]>60?{x,y:58,c:'var(--rose)',t:'↑ 10,000'}:{x,y:Y[i],c:'var(--amber)',r:3.5})});
  $('#olCalc').textContent=`squared loss slope  = Σxy / Σx² = ${sxy.toLocaleString('en-US')} / ${sxx} = ${wls.toFixed(2)}   (red)\nabsolute loss slope = weighted median of y/x = ${wlad.toFixed(2)}   (green dashed)\ntrue slope = 2.00`+(bad?`\none label in twenty moved the squared-loss line by ${(wls-2).toFixed(2)}`:'');
}
$('#olOn').addEventListener('change',drawOL);drawOL();document.addEventListener('themechange',drawOL);

/* ---------- 2.1 SGD noise ball ---------- */
const SG=(()=>{const R=rng(11),n=1000,X=[],y=[];for(let i=0;i<n;i++){const a=gauss(R),c=gauss(R);X.push([a,c]);y.push(2*a-3.4*c+4.2+gauss(R))}
  const wh=lstsq(X.map(r=>[r[0],r[1],1]),y);return{X,y,wh,n}})();
function drawSG(){
  const lr=+segVal('#sgL','v'),B=+segVal('#sgB','v'),R=rng(5);let w=SG.wh.slice();const tr=[[w[0],w[1]]];let dist=0;const T=1500,BURN=300;
  for(let t=0;t<T;t++){const g=[0,0,0];for(let k=0;k<B;k++){const i=Math.floor(R()*SG.n),x=SG.X[i],e=w[0]*x[0]+w[1]*x[1]+w[2]-SG.y[i];g[0]+=e*x[0];g[1]+=e*x[1];g[2]+=e}
    w=w.map((v,j)=>v-lr*g[j]/B);if(t<400)tr.push([w[0],w[1]]);if(t>=BURN)dist+=(w[0]-SG.wh[0])**2+(w[1]-SG.wh[1])**2+(w[2]-SG.wh[2])**2}
  const msd=dist/(T-BURN);
  const c=SG.wh,S=0.3,tk=v=>+v.toFixed(2);
  plot($('#sgPlot'),{xmin:c[0]-S,xmax:c[0]+S,ymin:c[1]-S,ymax:c[1]+S,W:360,H:300,maxw:'420px',xt:[tk(c[0]-S/2),tk(c[0]+S/2)],yt:[tk(c[1]-S/2),tk(c[1]),tk(c[1]+S/2)],xl:'w₁',yl:'w₂',
    lines:[{pts:tr,c:'var(--math)',w:1}],pts:[{x:c[0],y:c[1],c:'var(--amber)',r:3,t:'ŵ (least squares)'}]});
  $('#sgCalc').textContent=`least-squares ŵ = (${c.map(v=>v.toFixed(3)).join(', ')})   (true: 2, −3.4, 4.2; noise σ = 1)\nη = ${lr}, |𝓑| = ${B}, ${T} steps from ŵ, examples drawn at random with replacement (first 400 steps drawn)\nmean squared distance from ŵ (after step ${BURN}) = ${msd.toExponential(2)}\nη/|𝓑| = ${(lr/B).toExponential(2)}   ratio = ${(msd/(lr/B)).toFixed(2)}  ← roughly constant: the ball scales with η/|𝓑|`;
}
segOn('#sgL',drawSG);segOn('#sgB',drawSG);drawSG();document.addEventListener('themechange',drawSG);

/* ---------- 2.1 Gaussian ---------- */
const npdf=(x,m,s)=>Math.exp(-((x-m)**2)/(2*s*s))/Math.sqrt(2*Math.PI*s*s);
function drawGA(){
  const m=+$('#gaM').value,s=+$('#gaS').value;$('#gaMo').textContent=m.toFixed(1);$('#gaSo').textContent=s.toFixed(1);
  plot($('#gaPlot'),{xmin:-7,xmax:7,ymin:0,ymax:1.4,yt:[0,0.5,1],xt:[-6,-3,0,3,6],xl:'x',yl:'p(x)',H:200,
    curves:[{f:x=>npdf(x,m,s),c:'var(--green)'}],
    lines:[[m-s,'var(--amber)'],[m+s,'var(--amber)'],[m-2*s,'var(--soft)'],[m+2*s,'var(--soft)']].map(([x,c])=>({pts:[[x,0],[x,npdf(x,m,s)]],c,dash:1,w:1.4}))});
  $('#gaCalc').textContent=`peak height 1/√(2πσ²) = ${npdf(m,m,s).toFixed(3)}  at x = μ = ${m.toFixed(1)}\n≈ 68% of the probability lies in [μ − σ, μ + σ] = [${(m-s).toFixed(1)}, ${(m+s).toFixed(1)}]   (amber)\n≈ 95% lies in [μ − 2σ, μ + 2σ] = [${(m-2*s).toFixed(1)}, ${(m+2*s).toFixed(1)}]\ndensity at μ + 5σ relative to the peak: e^(−12.5) ≈ ${Math.exp(-12.5).toExponential(1)}`;
}
['#gaM','#gaS'].forEach(id=>$(id).addEventListener('input',drawGA));drawGA();document.addEventListener('themechange',drawGA);

/* ---------- 2.1 losses ---------- */
function drawLS(){
  const d=+$('#lsD').value;$('#lsDo').textContent=d.toFixed(1);
  const hub=r=>Math.abs(r)<=d?0.5*r*r:d*(Math.abs(r)-0.5*d);
  plot($('#lsPlot'),{xmin:-4,xmax:4,ymin:0,ymax:5,yt:[0,1,2,3,4,5],xt:[-4,-2,0,2,4],xl:'ŷ − y',yl:'loss',H:220,
    curves:[{f:r=>0.5*r*r,c:'var(--rose)'},{f:r=>Math.abs(r),c:'var(--math)'},{f:hub,c:'var(--green)',w:3.5,dash:1}],
    pts:[{x:-3.9,y:4.6,c:'var(--rose)',r:0,t:'½r²'},{x:3.2,y:3.5,c:'var(--math)',r:0,t:'|r|'}]});
  $('#lsCalc').textContent=`error r = 3:  squared ½·9 = 4.5   absolute 3   Huber(δ=${d.toFixed(1)}) = ${hub(3).toFixed(2)}\nerror r = 0.5: squared 0.125  absolute 0.5  Huber = ${hub(0.5).toFixed(3)}\nHuber (green dashed): quadratic for |r| ≤ δ, then linear with slope δ`;
}
$('#lsD').addEventListener('input',drawLS);drawLS();document.addEventListener('themechange',drawLS);

/* ---------- 2.2 synthetic scatter ---------- */
const SY=(()=>{const R=rng(3),P=[];for(let i=0;i<300;i++){const a=gauss(R),b=gauss(R);P.push([a,b,2*a-3.4*b+4.2+0.01*gauss(R)])}return P})();
function drawSY(){
  const v=segVal('#syS','v');const pts=SY.map(p=>({x:v==='1'?p[0]:v==='2'?p[1]:2*p[0]-3.4*p[1]+4.2,y:p[2],c:'var(--math)',r:2.2}));
  const xr=v==='p'?[-8,16]:[-3.5,3.5];
  plot($('#syPlot'),{xmin:xr[0],xmax:xr[1],ymin:-8,ymax:16,yt:[-8,0,8,16],xt:v==='p'?[-8,0,8,16]:[-3,0,3],xl:v==='1'?'x₁':v==='2'?'x₂':'2x₁ − 3.4x₂ + 4.2',yl:'y',H:240,pts});
  $('#syCalc').textContent=v==='p'?'against the true prediction the points lie on a thin line: the only scatter left is the noise (σ = 0.01)':`against x${v==='1'?'₁':'₂'} alone: a wide band, because x${v==='1'?'₂':'₁'} also moves y up and down`;
}
segOn('#syS',drawSY);drawSY();document.addEventListener('themechange',drawSY);

/* ---------- 2.3 training from scratch ---------- */
const TD=(()=>{const R=rng(42),X=[],y=[];for(let i=0;i<2000;i++){const a=gauss(R),b=gauss(R);X.push([a,b]);y.push(2*a-3.4*b+4.2+0.01*gauss(R))}return{X,y}})();
let trSeed=1;
function drawTR(){
  const lr=+segVal('#trL','v'),R=rng(trSeed);let w=[0.01*gauss(R),0.01*gauss(R)],b=0;
  const val=()=>{let s=0;for(let i=1000;i<2000;i++){const e=w[0]*TD.X[i][0]+w[1]*TD.X[i][1]+b-TD.y[i];s+=e*e/2}return s/1000};
  const hist=[val()];let dead=false;
  for(let ep=0;ep<10&&!dead;ep++){const perm=Array.from({length:1000},(_,i)=>i);for(let i=999;i>0;i--){const j=Math.floor(R()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
    for(let s=0;s<1000;s+=32){const idx=perm.slice(s,s+32);let g0=0,g1=0,gb=0;for(const i of idx){const e=w[0]*TD.X[i][0]+w[1]*TD.X[i][1]+b-TD.y[i];g0+=e*TD.X[i][0];g1+=e*TD.X[i][1];gb+=e}
      const m=idx.length;w=[w[0]-lr*g0/m,w[1]-lr*g1/m];b-=lr*gb/m}
    const v=val();if(!isFinite(v)||v>1e30){dead=true;hist.push(NaN)}else hist.push(v)}
  const lg=hist.map(v=>isFinite(v)?Math.log10(v):NaN);
  const pts=lg.map((v,i)=>isFinite(v)?[i,Math.max(-6,Math.min(4,v))]:null).filter(Boolean);
  plot($('#trPlot'),{xmin:0,xmax:10,ymin:-6,ymax:4,yt:[-6,-4,-2,0,2,4],ytf:v=>'10^'+v,xt:[0,2,4,6,8,10],xl:'epoch',yl:'validation loss (log scale)',H:220,
    lines:[{pts:[[0,Math.log10(5e-5)],[10,Math.log10(5e-5)]],c:'var(--soft)',dash:1,w:1},{pts,c:'var(--green)',w:2.2}],pts:pts.map(p=>({x:p[0],y:p[1],c:'var(--green)',r:3}))});
  $('#trCalc').textContent=`η = ${lr}, batch 32 → 32 updates per epoch, 10 epochs\nvalidation loss by epoch: ${hist.map(F4).join(', ')}\n`+(dead?`diverged: the loss overflowed to nan — every step overshoots the minimum further`:
    `final: error in w = (${(w[0]-2).toExponential(1)}, ${(w[1]+3.4).toExponential(1)})   error in b = ${(b-4.2).toExponential(1)}\nnoise floor ½σ² = 5e-5 (dashed line)`);
}
segOn('#trL',drawTR);$('#trGo').onclick=()=>{trSeed++;drawTR()};drawTR();document.addEventListener('themechange',drawTR);

/* ---------- 2.6 polynomial fitting ---------- */
const PF_F=x=>Math.sin(2.5*x)+0.3*x;let pfSeed=4,PF;
function pfData(){const R=rng(pfSeed),tr=[],va=[];for(let i=0;i<12;i++){const x=R()*2-1;tr.push([x,PF_F(x)+0.25*gauss(R)])}for(let i=0;i<200;i++){const x=R()*2-1;va.push([x,PF_F(x)+0.25*gauss(R)])}
  const fits=[];for(let d=0;d<=11;d++){const w=lstsq(tr.map(p=>Array.from({length:d+1},(_,k)=>p[0]**k)),tr.map(p=>p[1]));const f=x=>w.reduce((s,c,k)=>s+c*x**k,0);
    const mse=D=>D.reduce((s,p)=>s+(f(p[0])-p[1])**2,0)/D.length;fits.push({f,tr:mse(tr),va:mse(va)})}
  PF={tr,va,fits}}
function drawPF(){
  const d=+$('#pfD').value;$('#pfDo').textContent=d;const ft=PF.fits[d];
  plot($('#pfPlot'),{xmin:-1.05,xmax:1.05,ymin:-2.2,ymax:2.2,yt:[-2,-1,0,1,2],xt:[-1,-0.5,0,0.5,1],xl:'x',yl:'y',H:220,
    curves:[{f:PF_F,c:'var(--soft)',w:1.4,dash:1},{f:ft.f,c:'var(--green)'}],pts:PF.tr.map(p=>({x:p[0],y:p[1],c:'var(--amber)',r:4}))});
  const lt=PF.fits.map(q=>Math.log10(Math.max(q.tr,1e-6))),lv=PF.fits.map(q=>Math.log10(q.va));
  const top=Math.min(3,Math.max(...lv)+0.3);
  plot($('#pfErr'),{xmin:0,xmax:11,ymin:-3,ymax:top,yt:[-3,-2,-1,0,1,2,3].filter(v=>v<=top),ytf:v=>'10^'+v,xt:[0,2,4,6,8,10],xl:'degree d',yl:'mean squared error (log)',H:200,
    lines:[{pts:lt.map((v,i)=>[i,Math.max(-3,v)]),c:'var(--math)'},{pts:lv.map((v,i)=>[i,Math.min(top,v)]),c:'var(--rose)'},{pts:[[d,-3],[d,top]],c:'var(--amber)',dash:1,w:1}],
    pts:[{x:d,y:Math.max(-3,lt[d]),c:'var(--math)',t:'train',left:d>7},{x:d,y:Math.min(top,lv[d]),c:'var(--rose)',t:'validation',left:d>7}]});
  const best=lv.indexOf(Math.min(...lv));
  $('#pfCalc').textContent=`degree ${d}: ${d+1} parameters, 12 training points\ntraining MSE   = ${F4(ft.tr)}${d===11?'   (12 parameters, 12 points: passes through every point)':''}\nvalidation MSE = ${F4(ft.va)}   (noise alone gives ≈ 0.0625)\nlowest validation error at degree ${best}`+(ft.tr>0.125?'   ← underfitting: both errors high':ft.va>4*PF.fits[best].va?'   ← overfitting: training error tiny, validation error large':'');
}
$('#pfD').addEventListener('input',drawPF);$('#pfNew').onclick=()=>{pfSeed++;pfData();drawPF()};pfData();drawPF();document.addEventListener('themechange',drawPF);

/* ---------- 2.6 K-fold ---------- */
function drawKF(){
  const K=+segVal('#kfK','v');
  $('#kfOut').innerHTML=Array.from({length:K},(_,r)=>`<div style="display:flex;gap:3px;align-items:center;margin:3px 0"><span class="note" style="width:72px;flex:none">الجولة ${AD(r+1)}</span>${Array.from({length:K},(_,j)=>`<span style="flex:1;height:18px;border-radius:4px;background:${j===r?'var(--amber)':'var(--green-soft)'};border:1px solid ${j===r?'var(--amber)':'var(--green)'}"></span>`).join('')}</div>`).join('')+`<div class="note" style="margin-top:6px"><span style="color:var(--amber)">■</span> تحقق &nbsp; <span style="color:var(--green)">■</span> تدريب</div>`;
  $('#kfCalc').textContent=`K = ${K}: train ${K} models, each on ${K-1}/${K} = ${((K-1)/K*100).toFixed(0)}% of the data\nevery example is used for validation exactly once\nestimate = average of the ${K} validation errors`;
}
segOn('#kfK',drawKF);drawKF();

/* ---------- 2.7 weight decay ---------- */
const WD=(()=>{const R=rng(9),d=200,mk=n=>{const X=[],y=[];for(let i=0;i<n;i++){const x=Array.from({length:d},()=>gauss(R));X.push(x);y.push(0.05+0.01*x.reduce((s,v)=>s+v,0)+0.01*gauss(R))}return{X,y}};return{d,tr:mk(20),va:mk(100)}})();
function wdTrain(lam,E){
  const R=rng(17),d=WD.d;let w=Array.from({length:d},()=>gauss(R)),b=0;const lr=0.01;
  const loss=D=>{let s=0;for(let i=0;i<D.y.length;i++){let p=b;const x=D.X[i];for(let j=0;j<d;j++)p+=w[j]*x[j];s+=(p-D.y[i])**2/2}return s/D.y.length};
  const ht=[loss(WD.tr)],hv=[loss(WD.va)];
  for(let ep=0;ep<E;ep++){const perm=[...Array(20).keys()];for(let i=19;i>0;i--){const j=Math.floor(R()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
    for(let s=0;s<20;s+=5){const g=new Array(d).fill(0);let gb=0;for(const i of perm.slice(s,s+5)){const x=WD.tr.X[i];let p=b;for(let j=0;j<d;j++)p+=w[j]*x[j];const e=p-WD.tr.y[i];for(let j=0;j<d;j++)g[j]+=e*x[j];gb+=e}
      for(let j=0;j<d;j++)w[j]=(1-lr*lam)*w[j]-lr*g[j]/5;b-=lr*gb/5}
    ht.push(loss(WD.tr));hv.push(loss(WD.va))}
  return{ht,hv,norm:Math.sqrt(w.reduce((s,v)=>s+v*v,0))}}
function drawWD(){
  const lam=+segVal('#wdL','v'),E=+segVal('#wdE','v'),r=wdTrain(lam,E);
  const L=a=>a.map((v,i)=>[i,Math.max(-5,Math.min(3,Math.log10(v)))]);
  plot($('#wdPlot'),{xmin:0,xmax:E,ymin:-5,ymax:3,yt:[-4,-2,0,2],ytf:v=>'10^'+v,xt:E===10?[0,5,10]:[0,25,50,75,100],xl:'epoch',yl:'loss (log scale)',H:220,
    lines:[{pts:L(r.ht),c:'var(--math)'},{pts:L(r.hv),c:'var(--rose)'}],pts:[{x:E,y:L(r.ht)[E][1],c:'var(--math)',t:'train',r:3,left:1},{x:E,y:L(r.hv)[E][1],c:'var(--rose)',t:'validation',r:3,left:1}]});
  const all=[0,1,3,10].map(l=>{const q=wdTrain(l,E);return`  λ = ${String(l).padEnd(3)} train ${F4(q.ht[E]).padEnd(9)} validation ${F4(q.hv[E]).padEnd(9)} ‖w‖ = ${q.norm.toFixed(3)}`});
  $('#wdCalc').textContent=`d = 200 features, 20 training and 100 validation examples, w initialised ~ 𝒩(0, 1)\ntrue weights: all 0.01  →  ‖w*‖ = 0.01·√200 ≈ 0.141\nafter ${E} epochs:\n${all.join('\n')}`;
}
segOn('#wdL',drawWD);segOn('#wdE',drawWD);drawWD();document.addEventListener('themechange',drawWD);
