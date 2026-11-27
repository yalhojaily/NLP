/* D2L · Chapter 4 · Multilayer Perceptrons — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s4-1','4.1','الشبكات متعددة الطبقات'],['s4-2','4.2','التنفيذ'],['s4-3','4.3','الانتشار العكسي'],['s4-4','4.4','الاستقرار العددي والتهيئة'],['s4-5','4.5','التعميم في التعلّم العميق'],['s4-6','4.6','الإسقاط'],['s4-7','4.7','أسعار البيوت على Kaggle'],['ex','','الخلاصة والتمارين']];
const GL=[
['الطبقة المخفية','hidden layer','طبقة بين المدخل والمخرج تتعلّم تمثيلاً جديداً.'],
['دالة التنشيط','activation function','دالة غير خطية تُطبَّق عنصراً بعنصر بعد الطبقة الخطية.'],
['ReLU','rectified linear unit','max(z, 0).'],
['Leaky ReLU','leaky ReLU','max(z, αz) بميل صغير للسالب.'],
['GELU','Gaussian error linear unit','z·Φ(z)؛ افتراضية المحوّلات.'],
['السيغمويد / tanh','sigmoid / tanh','دالتان مشبعتان؛ مداهما (0,1) و(−1,1).'],
['الوحدة الميتة','dead unit','وحدة ReLU مدخلها سالب دائماً فلا تتعلّم.'],
['XOR','exclusive or','1 حين يختلف المدخلان؛ لا يفصله خط.'],
['التقريب الشامل','universal approximation','طبقة مخفية عريضة تقرّب أي دالة متصلة.'],
['الشبكة متعددة الطبقات','multilayer perceptron (MLP)','طبقات كاملة الاتصال بينها تنشيطات غير خطية.'],
['الانتشار العكسي','backpropagation','حساب التدرّجات من الخسارة إلى المدخلات بقاعدة السلسلة.'],
['فحص التدرّج','gradient checking','مقارنة التدرّج بالفروق المركزية العددية.'],
['تلاشي / انفجار التدرّج','vanishing / exploding gradients','تقلّص التدرّج أو تضخمه أسياً عبر الطبقات.'],
['تهيئة Xavier','Xavier initialization','تباين 2/(n_in + n_out).'],
['تهيئة He','He (Kaiming) initialization','تباين 2/n_in، لـReLU.'],
['كسر التناظر','symmetry breaking','بدء الأوزان مختلفة كي لا تتطابق الوحدات.'],
['التحيز الاستقرائي','inductive bias','تفضيل المتعلّم لبعض الحلول على بعض.'],
['الهبوط المزدوج','double descent','ارتفاع الخطأ عند h = n ثم انخفاضه ثانية.'],
['التحيز الضمني','implicit bias','ميل النزول التدرّجي إلى حلول أصغر معياراً أو أكبر هامشاً.'],
['الإيقاف المبكر','early stopping','إيقاف التدريب حين يتوقف تحسن التحقق.'],
['الاستيعاب المتأخر','grokking','قفزة متأخرة جداً في التعميم بعد حفظ التدريب.'],
['الإسقاط','dropout','إطفاء وحدات عشوائياً أثناء التدريب مع مضاعفة الباقي.'],
['التكيّف المشترك','co-adaptation','اعتماد وحدات على شريكات بعينها.'],
['خطأ اللوغاريتم','log-RMSE','الجذر التربيعي لمتوسط مربع فرق لوغاريتمات الأسعار.'],
['التسريب','leakage','وصول معلومات التحقق أو الاختبار إلى التدريب.']];
initPage(SECS,GL);
const relu=z=>Math.max(0,z);

/* ---------- 4.1 XOR with two ReLUs ---------- */
const XO=[[0,0,0],[1,0,1],[0,1,1],[1,1,0]];
function drawXO(){
  const s=+segVal('#xoS','v');
  const rows=XO.map(([a,b,y])=>{const z=[a+b,a+b-1],h=z.map(relu),o=h[0]-2*h[1];return{x:[a,b],z,h,o,y}});
  const P=r=>[r.x,r.z,r.h][s];
  const lines=s===2?[{pts:[[-1.5,-1],[2.5,1]],c:'var(--ink)',w:2,dash:1}]:[];
  plot($('#xoPlot'),{xmin:-1.5,xmax:2.5,ymin:-1.5,ymax:1.8,W:380,H:300,maxw:'380px',xt:[-1,0,1,2],yt:[-1,0,1],xl:['x₁','z₁','h₁'][s],yl:['x₂','z₂','h₂'][s],lines,
    pts:rows.map(r=>({x:P(r)[0]+(s===2&&r.y?0:0),y:P(r)[1],c:r.y?'var(--green)':'var(--rose)',r:9,t:s===2&&r.y&&r.x[0]===1?'(1,0) = (0,1) here':'',left:1}))});
  $('#xoTab').innerHTML='<tr><th>x</th><th>z = xW⁽¹⁾ + b⁽¹⁾</th><th>h = ReLU(z)</th><th>o = h₁ − 2h₂</th><th>y</th></tr>'+rows.map(r=>`<tr><td class="num">(${r.x})</td><td class="num">(${r.z})</td><td class="num">(${r.h})</td><td class="num"><b>${r.o}</b></td><td class="num" style="color:${r.y?'var(--green)':'var(--rose)'}">${r.y}</td></tr>`).join('')+'<tr><td colspan="5" style="color:var(--soft)">W⁽¹⁾ = [[1, 1], [1, 1]], b⁽¹⁾ = (0, −1), w⁽²⁾ = (1, −2), b⁽²⁾ = 0</td></tr>';
}
segOn('#xoS',drawXO);drawXO();document.addEventListener('themechange',drawXO);

/* ---------- 4.1 hinge approximation ---------- */
const HAF=[x=>0.5+0.4*Math.sin(2*Math.PI*x)+0.1*Math.sin(6*Math.PI*x),x=>1/(1+Math.exp(-25*(x-0.5)))];
function drawHA(){
  const k=+$('#haK').value,f=HAF[+segVal('#haF','v')];$('#haKo').textContent=k;
  const t=Array.from({length:k+1},(_,i)=>i/k),v=t.map(f),sl=t.slice(0,k).map((_,i)=>(v[i+1]-v[i])*k);
  const c=sl.map((s,i)=>i?s-sl[i-1]:s);// coefficient of ReLU(x - t_i)
  const g=x=>v[0]+c.reduce((s,ci,i)=>s+ci*relu(x-t[i]),0);
  let err=0;for(let i=0;i<=400;i++){const x=i/400;err=Math.max(err,Math.abs(g(x)-f(x)))}
  plot($('#haPlot'),{xmin:0,xmax:1,ymin:-0.1,ymax:1.15,yt:[0,0.5,1],xt:[0,0.5,1],xl:'x',H:220,
    curves:[{f,c:'var(--soft)',w:1.5,dash:1},{f:g,c:'var(--green)'}],pts:t.slice(0,k).map(x=>({x,y:g(x),c:'var(--amber)',r:3.5}))});
  $('#haCalc').textContent=`g(x) = ${v[0].toFixed(2)} + Σ cᵢ · ReLU(x − tᵢ)   with ${k} hinge${k>1?'s':''} at tᵢ = i/${k} (amber)\nfirst coefficients c = [${c.slice(0,5).map(v=>v.toFixed(2)).join(', ')}${k>5?', …':''}]   (each = change of slope at its knot)\nmax error |g − f| = ${err.toFixed(4)}`;
}
$('#haK').addEventListener('input',drawHA);segOn('#haF',drawHA);drawHA();document.addEventListener('themechange',drawHA);

/* ---------- 4.1 tent folding ---------- */
const tent=z=>2*relu(z)-4*relu(z-0.5);
function drawTF(){
  const m=+$('#tfM').value;$('#tfMo').textContent=m;const g=x=>{let z=x;for(let i=0;i<m;i++)z=tent(z);return z};
  const N=Math.max(800,2**m*20),pts=[];for(let i=0;i<=N;i++){const x=i/N;pts.push([x,g(x)])}
  plot($('#tfPlot'),{xmin:0,xmax:1,ymin:-0.05,ymax:1.1,yt:[0,0.5,1],xt:[0,0.5,1],xl:'x',H:200,lines:[{pts,c:'var(--green)',w:1.8}]});
  $('#tfCalc').textContent=`g(z) = 2·ReLU(z) − 4·ReLU(z − ½)   composed ${m} time${m>1?'s':''}\nlinear pieces: 2^${m} = ${2**m}\ndeep network: ${m} layers × 2 units = ${2*m} hidden units\none hidden layer needs at least 2^${m} − 1 = ${2**m-1} units`+(m===7?'\n(the book: m = 10 → 20 units deep vs 1,023 in one layer)':'');
}
$('#tfM').addEventListener('input',drawTF);drawTF();document.addEventListener('themechange',drawTF);

/* ---------- 4.1 activation functions ---------- */
const erf=x=>{const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y};
const Phi=z=>0.5*(1+erf(z/Math.SQRT2)),phi=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI),sg=z=>1/(1+Math.exp(-z));
const ACT={relu:[relu,z=>z>0?1:0],leaky:[z=>z>0?z:0.01*z,z=>z>0?1:0.01],gelu:[z=>z*Phi(z),z=>Phi(z)+z*phi(z)],silu:[z=>z*sg(z),z=>sg(z)*(1+z*(1-sg(z)))],sigmoid:[sg,z=>sg(z)*(1-sg(z))],tanh:[Math.tanh,z=>1-Math.tanh(z)**2]};
function drawAC(){
  const k=segVal('#acS','v'),[f,d]=ACT[k];
  plot($('#acPlot'),{xmin:-4,xmax:4,ymin:-1.2,ymax:3,yt:[-1,0,1,2,3],xt:[-4,-2,0,2,4],xl:'z',H:220,curves:[{f,c:'var(--green)'},{f:d,c:'var(--amber)',dash:1}]});
  const zs=[-3,-0.75,0,1,3];
  $('#acCalc').textContent=`z       ${zs.map(z=>String(z).padStart(8)).join('')}\nφ(z)    ${zs.map(z=>f(z).toFixed(3).padStart(8)).join('')}\nφ′(z)   ${zs.map(z=>d(z).toFixed(3).padStart(8)).join('')}\nmax slope on [−4, 4]: ${Math.max(...Array.from({length:801},(_,i)=>d(-4+i/100))).toFixed(3)}`+(k==='sigmoid'?'   → at most ¼ per layer':'');
}
segOn('#acS',drawAC);drawAC();document.addEventListener('themechange',drawAC);

/* ---------- 4.2 linear vs MLP on two rings ---------- */
const ML=(()=>{const R=rng(31),X=[],y=[];for(let i=0;i<400;i++){const c=i%2,r=c?1.4+0.18*gauss(R):0.6+0.18*gauss(R),a=R()*2*Math.PI;X.push([r*Math.cos(a),r*Math.sin(a)]);y.push(c)}return{X,y}})();
let mlNet=null,mlTimer=null,mlEp=0;
function mlInit(h){const R=rng(5);const he=n=>Math.sqrt(2/n);
  return h?{h,W1:[0,1].map(()=>Array.from({length:h},()=>gauss(R)*he(2))),b1:new Array(h).fill(0),W2:Array.from({length:h},()=>[gauss(R)*he(h),gauss(R)*he(h)]),b2:[0,0]}:{h:0,W:[[0.01*gauss(R),0.01*gauss(R)],[0.01*gauss(R),0.01*gauss(R)]],b:[0,0]}}
function mlFwd(N,x){if(!N.h){return{o:[0,1].map(j=>x[0]*N.W[0][j]+x[1]*N.W[1][j]+N.b[j])}}
  const z=N.b1.map((b,k)=>b+x[0]*N.W1[0][k]+x[1]*N.W1[1][k]),hh=z.map(relu),o=[0,1].map(j=>N.b2[j]+hh.reduce((s,v,k)=>s+v*N.W2[k][j],0));return{z,hh,o}}
const sm2=o=>{const m=Math.max(o[0],o[1]),a=Math.exp(o[0]-m),b=Math.exp(o[1]-m);return[a/(a+b),b/(a+b)]};
function mlEpoch(N,R,lr){const perm=[...Array(400).keys()];for(let i=399;i>0;i--){const j=Math.floor(R()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
  for(let s=0;s<400;s+=32){const idx=perm.slice(s,s+32),m=idx.length;
    if(!N.h){const gW=[[0,0],[0,0]],gb=[0,0];for(const i of idx){const x=ML.X[i],p=sm2(mlFwd(N,x).o);p[ML.y[i]]-=1;for(let j=0;j<2;j++){gW[0][j]+=x[0]*p[j];gW[1][j]+=x[1]*p[j];gb[j]+=p[j]}}
      for(let j=0;j<2;j++){N.W[0][j]-=lr*gW[0][j]/m;N.W[1][j]-=lr*gW[1][j]/m;N.b[j]-=lr*gb[j]/m}continue}
    const h=N.h,gW1=[new Array(h).fill(0),new Array(h).fill(0)],gb1=new Array(h).fill(0),gW2=Array.from({length:h},()=>[0,0]),gb2=[0,0];
    for(const i of idx){const x=ML.X[i],f=mlFwd(N,x),p=sm2(f.o);p[ML.y[i]]-=1;
      for(let k=0;k<h;k++){gW2[k][0]+=f.hh[k]*p[0];gW2[k][1]+=f.hh[k]*p[1];const gz=f.z[k]>0?p[0]*N.W2[k][0]+p[1]*N.W2[k][1]:0;gW1[0][k]+=x[0]*gz;gW1[1][k]+=x[1]*gz;gb1[k]+=gz}gb2[0]+=p[0];gb2[1]+=p[1]}
    for(let k=0;k<h;k++){N.W1[0][k]-=lr*gW1[0][k]/m;N.W1[1][k]-=lr*gW1[1][k]/m;N.b1[k]-=lr*gb1[k]/m;N.W2[k][0]-=lr*gW2[k][0]/m;N.W2[k][1]-=lr*gW2[k][1]/m}N.b2[0]-=lr*gb2[0]/m;N.b2[1]-=lr*gb2[1]/m}}
function drawML(){
  const N=mlNet,G=32,r=2.2;let L=0,ok=0;ML.X.forEach((x,i)=>{const p=sm2(mlFwd(N,x).o);L-=Math.log(Math.max(p[ML.y[i]],1e-12));if((p[1]>0.5?1:0)===ML.y[i])ok++});
  const raw=(X,Y)=>{let s='';for(let i=0;i<G;i++)for(let k=0;k<G;k++){const a=-r+(i+0.5)*2*r/G,b=-r+(k+0.5)*2*r/G,p=sm2(mlFwd(N,[a,b]).o)[1];
    const x0=X(-r+i*2*r/G),x1=X(-r+(i+1)*2*r/G),y0=Y(-r+(k+1)*2*r/G),y1=Y(-r+k*2*r/G);s+=`<rect shape-rendering="crispEdges" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(x1-x0+1).toFixed(1)}" height="${(y1-y0+1).toFixed(1)}" fill="${p>0.5?'var(--green)':'var(--amber)'}" opacity="${(0.08+0.55*Math.abs(p-0.5)).toFixed(2)}"/>`}return s};
  plot($('#mlPlot'),{xmin:-r,xmax:r,ymin:-r,ymax:r,W:380,H:360,maxw:'420px',xt:[-2,0,2],yt:[-2,0,2],raw,pts:ML.X.map((x,i)=>({x:x[0],y:x[1],c:ML.y[i]?'var(--green)':'var(--amber)',r:2.4}))});
  const h=N.h,params=h?(2+1)*h+(h+1)*2:6;
  $('#mlCalc').textContent=`${h?`MLP 2 → ${h} ReLU → 2`:'linear softmax 2 → 2'}   parameters: ${params}   He init, SGD η = 0.1, batch 32\nepoch ${mlEp}: training loss ${(L/400).toFixed(3)}   accuracy ${(ok/4).toFixed(1)}%`+(h===0&&mlEp>0?'\na straight boundary cannot separate a ring from its centre: stuck near 50%':'')+(h===2&&mlEp>=150?'\ntwo hinges give at most a wedge; more units → a rounder boundary':'');
}
function mlStart(){clearInterval(mlTimer);mlNet=mlInit(+segVal('#mlH','v'));mlEp=0;drawML()}
$('#mlGo').onclick=()=>{mlStart();const R=rng(77);mlTimer=setInterval(()=>{for(let i=0;i<5;i++){mlEpoch(mlNet,R,0.1);mlEp++}drawML();if(mlEp>=200)clearInterval(mlTimer)},60)};
segOn('#mlH',mlStart);mlStart();document.addEventListener('themechange',drawML);

/* ---------- 4.3 worked backprop example ---------- */
const BP=[
 ['X','[1, 2]','input (n = 1, d = 2)'],['W⁽¹⁾','[[1, 0], [−1, 1]]','first-layer weights'],['Z = XW⁽¹⁾','[1·1 + 2·(−1), 1·0 + 2·1] = [−1, 2]','pre-activation'],
 ['H = ReLU(Z)','[0, 2]','unit 1 is off (z₁ < 0)'],['o = HW⁽²⁾','0·2 + 2·(−1) = −2','W⁽²⁾ = [2, −1]ᵀ'],['L = ½(o − y)²','½(−2 − 0)² = 2','squared loss, y = 0'],
 ['∂L/∂o','o − y = −2','start of the backward pass'],['∂L/∂W⁽²⁾ = Hᵀ ∂L/∂o','[0, 2]ᵀ·(−2) = [0, −4]ᵀ','rule 1 (needs the cached H)'],['∂L/∂H = ∂L/∂o · W⁽²⁾ᵀ','(−2)·[2, −1] = [−4, 2]','rule 1 (gradient flows back through Wᵀ)'],
 ['∂L/∂Z = ∂L/∂H ⊙ ReLU′(Z)','[−4, 2] ⊙ [0, 1] = [0, 2]','rule 3 (the ReLU mask blocks unit 1)'],['∂L/∂W⁽¹⁾ = Xᵀ ∂L/∂Z','[1, 2]ᵀ · [0, 2] = [[0, 2], [0, 4]]','rule 1 (needs the cached X); first column zero']];
let bpK=0;
function drawBP(){
  $('#bpTab').innerHTML='<tr><th>quantity</th><th>value</th><th>note</th></tr>'+BP.map((r,i)=>i>bpK?'':`<tr style="${i===bpK?'background:var(--amber-soft)':''}${i>=6?';color:var(--math)':''}"><td>${r[0]}</td><td class="num">${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  $('#bpStep').textContent=`الخطوة ${AD(bpK+1)} من ${AD(BP.length)} · ${bpK<6?'المرور الأمامي':'المرور الخلفي'}`;
  $('#bpCalc').textContent=bpK<6?'forward: compute and cache each value':'backward: each step uses one local rule and a cached forward value';
}
$('#bpNext').onclick=()=>{bpK=Math.min(BP.length-1,bpK+1);drawBP()};$('#bpPrev').onclick=()=>{bpK=Math.max(0,bpK-1);drawBP()};drawBP();

/* ---------- 4.3 gradient check ---------- */
function drawGC(){
  const w=1,ex=Math.exp(w)*(Math.sin(w)+Math.cos(w)),F=Math.fround;
  const f64=v=>Math.sin(v)*Math.exp(v),f32=v=>F(F(Math.sin(F(v)))*F(Math.exp(F(v))));
  const e64=[],e32=[];for(let k=1;k<=12;k+=0.25){const h=Math.pow(10,-k);
    e64.push([-k,Math.log10(Math.max(1e-17,Math.abs((f64(w+h)-f64(w-h))/(2*h)-ex)))]);
    const wp=F(w+h),wm=F(w-h),hh=(wp-wm)/2;e32.push([-k,Math.log10(Math.max(1e-17,hh?Math.abs(F(F(f32(wp)-f32(wm))/F(2*hh))-ex):1))])}
  plot($('#gcPlot'),{xmin:-12,xmax:-1,ymin:-12,ymax:1,xt:[-12,-10,-8,-6,-4,-2],yt:[-12,-8,-4,0],ytf:v=>'10^'+v,xl:'log₁₀ h',yl:'error (log scale)',H:220,
    lines:[{pts:e64,c:'var(--green)'},{pts:e32,c:'var(--rose)'}],pts:[{x:-2,y:e64[4][1],c:'var(--green)',t:'float64',r:0},{x:-6,y:e32[20][1]+1.2,c:'var(--rose)',t:'float32',r:0}]});
  const b64=e64.reduce((a,b)=>b[1]<a[1]?b:a),b32=e32.reduce((a,b)=>b[1]<a[1]?b:a);
  $('#gcCalc').textContent=`f′(1) exact = e(sin 1 + cos 1) = ${ex.toFixed(6)}\nbest h in float64 ≈ 10^${b64[0]}  (error ≈ 10^${b64[1].toFixed(1)})\nbest h in float32 ≈ 10^${b32[0]}  (error ≈ 10^${b32[1].toFixed(1)})\nright side: truncation error ∝ h²;  left side: rounding error ∝ ε/h`;
}
drawGC();document.addEventListener('themechange',drawGC);

/* ---------- 4.4 vanishing / exploding ---------- */
const VI_W=128,VI_N=64,VI_L=10;
function drawVI(){
  const init=segVal('#viI','v'),act=segVal('#viA','v'),R=rng(13);
  const tau=init==='small'?0.01:init==='one'?1:init==='xavier'?Math.sqrt(2/(2*VI_W)):Math.sqrt(2/VI_W);
  const f={relu:[relu,z=>z>0?1:0],sigmoid:[sg,z=>sg(z)*(1-sg(z))],tanh:[Math.tanh,z=>1-Math.tanh(z)**2]}[act];
  const Ws=Array.from({length:VI_L},()=>Float64Array.from({length:VI_W*VI_W},()=>gauss(R)*tau));
  let H=Array.from({length:VI_N},()=>Float64Array.from({length:VI_W},()=>gauss(R)));const Zs=[],Hs=[H];const ms=a=>{let s=0,c=0;for(const r of a)for(const v of r){s+=v*v;c++}return s/c};
  const fw=[];for(let l=0;l<VI_L;l++){const W=Ws[l],Z=H.map(r=>{const z=new Float64Array(VI_W);for(let i=0;i<VI_W;i++){const x=r[i];if(!x)continue;for(let j=0;j<VI_W;j++)z[j]+=x*W[i*VI_W+j]}return z});Zs.push(Z);H=Z.map(z=>z.map(f[0]));Hs.push(H);fw.push(ms(H))}
  let G=H.map(()=>Float64Array.from({length:VI_W},()=>gauss(R)));const bw=new Array(VI_L);
  for(let l=VI_L-1;l>=0;l--){const W=Ws[l],GZ=G.map((g,n)=>g.map((v,j)=>v*f[1](Zs[l][n][j])));bw[l]=ms(GZ);G=GZ.map(gz=>{const o=new Float64Array(VI_W);for(let i=0;i<VI_W;i++){let s=0;for(let j=0;j<VI_W;j++)s+=gz[j]*W[i*VI_W+j];o[i]=s}return o})}
  const lg=v=>Math.max(-40,Math.min(40,Math.log10(v||1e-300)));
  const all=[...fw,...bw].map(lg),lo=Math.floor(Math.min(...all,-1)),hi=Math.ceil(Math.max(...all,1));
  const step=Math.max(1,Math.ceil((hi-lo)/6));const yt=[];for(let v=lo;v<=hi;v+=step)yt.push(v);
  plot($('#viPlot'),{xmin:1,xmax:10,ymin:lo,ymax:hi,xt:[1,2,3,4,5,6,7,8,9,10],yt,ytf:v=>'10^'+v,xl:'layer',yl:'mean square (log scale)',H:230,
    lines:[{pts:fw.map((v,i)=>[i+1,lg(v)]),c:'var(--green)'},{pts:bw.map((v,i)=>[i+1,lg(v)]),c:'var(--rose)'},{pts:[[1,0],[10,0]],c:'var(--soft)',dash:1,w:1}],
    pts:[{x:10,y:lg(fw[9]),c:'var(--green)',t:'activations',left:1,r:3},{x:1,y:lg(bw[0]),c:'var(--rose)',t:'gradients',r:3}]});
  const Ephi2={relu:0.5}[act];
  $('#viCalc').textContent=`width ${VI_W}, ${VI_L} layers, τ² = ${tau*tau<1e-3?(tau*tau).toExponential(1):(tau*tau).toFixed(4)}, ${act}\nmean square of activations after layer 10: ${fw[9].toExponential(2)}\nmean square of gradient at layer 1 (∂/∂z):  ${bw[0].toExponential(2)}`+(Ephi2?`\npredicted factor per layer h·τ²·E[φ′²] = ${VI_W}·${(tau*tau).toPrecision(3)}·½ = ${(VI_W*tau*tau/2).toPrecision(3)}`:'')+`\n(green: forward, read left→right; red: backward, read right→left)`;
}
segOn('#viI',drawVI);segOn('#viA',drawVI);drawVI();document.addEventListener('themechange',drawVI);

/* ---------- 4.5 double descent ---------- */
function solveLin(A,b){const n=A.length,M=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;[M[k],M[p]]=[M[p],M[k]];for(let i=k+1;i<n;i++){const f=M[i][k]/M[k][k];for(let j=k;j<=n;j++)M[i][j]-=f*M[k][j]}}const x=new Array(n);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let j=i+1;j<n;j++)s-=M[i][j]*x[j];x[i]=s/M[i][i]}return x}
const DDH=[2,5,10,20,30,36,40,44,50,80,150,400,1000,3000];
const DD=(()=>{const R=rng(2),D=10,n=40,v=Array.from({length:D},()=>gauss(R)/Math.sqrt(D)),F=x=>{const s=x.reduce((a,c,i)=>a+c*v[i],0);return 2*s+Math.abs(s)};
  const mk=m=>Array.from({length:m},()=>{const x=Array.from({length:D},()=>gauss(R));return[x,F(x)+0.2*gauss(R)]});const tr=mk(n),te=mk(500);
  const HM=3000,A=[],B=[];for(let j=0;j<HM;j++){A.push(Array.from({length:D},()=>gauss(R)/Math.sqrt(D)));B.push(0.5*gauss(R))}
  const raw=x=>Array.from({length:HM},(_,j)=>Math.max(0,A[j].reduce((s,a,i)=>s+a*x[i],0)+B[j]));
  const Ptr=tr.map(p=>raw(p[0])),Pte=te.map(p=>raw(p[0])),y=tr.map(p=>p[1]);
  const res=DDH.map(h=>{const sc=Math.sqrt(2/h),P=Ptr.map(r=>r.slice(0,h).map(v=>v*sc));let w;
    if(h<n){const G=Array.from({length:h},(_,a)=>Array.from({length:h},(_,b)=>P.reduce((s,r)=>s+r[a]*r[b],0))),r=Array.from({length:h},(_,a)=>P.reduce((s,row,i)=>s+row[a]*y[i],0));w=solveLin(G,r)}
    else{const G=P.map(r1=>P.map(r2=>{let s=0;for(let k=0;k<h;k++)s+=r1[k]*r2[k];return s})),al=solveLin(G,y);w=Array.from({length:h},(_,k)=>P.reduce((s,r,i)=>s+r[k]*al[i],0))}
    const mse=(PP,YY)=>PP.reduce((s,r,i)=>{let o=0;for(let k=0;k<h;k++)o+=r[k]*sc*w[k];return s+(o-YY[i])**2},0)/PP.length;
    return{h,te:mse(Pte,te.map(p=>p[1])),tr:mse(Ptr,y),norm:Math.sqrt(w.reduce((a,c)=>a+c*c,0))}});
  return{res,n}})();
function drawDD(){
  const i=+$('#ddH').value,r=DD.res[i];$('#ddHo').textContent=r.h;
  const lx=h=>Math.log10(h),lt=DD.res.map(q=>[lx(q.h),Math.log10(q.te)]),ltr=DD.res.map(q=>[lx(q.h),Math.log10(Math.max(q.tr,1e-4))]);
  plot($('#ddPlot'),{xmin:0.2,xmax:3.6,ymin:-4,ymax:4,xt:[],yt:[-4,-2,0,2,4],ytf:v=>'10^'+v,xl:'number of features h (log scale)',yl:'mean squared error (log scale)',H:240,
    raw:(X,Y)=>[10,40,100,1000].map(h=>`<text x="${X(lx(h))}" y="${Y(-4)-4}" font-size="11" fill="var(--soft)" text-anchor="middle">${h}</text>`).join('')+`<line x1="${X(lx(40))}" x2="${X(lx(40))}" y1="${Y(4)}" y2="${Y(-4)}" stroke="var(--amber)" stroke-dasharray="3 4"/>`,
    lines:[{pts:lt,c:'var(--rose)'},{pts:ltr,c:'var(--math)'},{pts:[[lx(r.h),-4],[lx(r.h),4]],c:'var(--ink)',w:1,dash:1}],
    pts:[...lt.map(p=>({x:p[0],y:p[1],c:'var(--rose)',r:3})),{x:lx(r.h),y:Math.log10(r.te),c:'var(--rose)',r:6,t:'test',left:i>9},{x:lx(r.h),y:Math.log10(Math.max(r.tr,1e-4)),c:'var(--math)',r:5,t:'train',left:i>9}]});
  const best=DD.res.slice(0,6).reduce((a,b)=>b.te<a.te?b:a);
  $('#ddCalc').textContent=`h = ${r.h} random ReLU features (frozen), n = ${DD.n} training points in 10 dimensions\n${r.h<DD.n?'least squares (more equations than unknowns)':r.h===DD.n?'h = n: exactly one interpolating solution':'minimum-norm interpolation (many solutions; pick the smallest ‖w‖)'}\ntest MSE ${r.te<100?r.te.toFixed(3):r.te.toFixed(0)}   train MSE ${r.tr<1e-6?'0':r.tr.toFixed(3)}   ‖w‖ = ${r.norm.toFixed(1)}\nbest under-parameterised: h = ${best.h}, test ${best.te.toFixed(3)};   h = 3000: test ${DD.res[13].te.toFixed(3)}`;
}
$('#ddH').addEventListener('input',drawDD);drawDD();document.addEventListener('themechange',drawDD);

/* ---------- 4.6 dropout ---------- */
let doSeed=3;
function drawDO(){
  const p=+$('#doP').value;$('#doPo').textContent=p.toFixed(1);const R=rng(doSeed),X=[...Array(16).keys()];
  const mask=X.map(()=>p>=1?0:R()>=p?1:0),out=X.map((v,i)=>p>=1?0:mask[i]*v/(1-p));
  $('#doOut').innerHTML=lab('X',grid([X]))+lab('mask (keep with prob. 1 − p)',grid([mask],(i,j)=>mask[j]?'g':'x'))+lab(`X · mask / (1 − ${p.toFixed(1)})`,grid([out.map(v=>+v.toFixed(2))],(i,j)=>mask[j]?'h':'x'));
  const R2=rng(doSeed+100),N=100000;let s=0,s2=0;for(let i=0;i<N;i++){const v=p>=1?0:(R2()>=p?1/(1-p):0);s+=v;s2+=v*v}const m=s/N;
  $('#doCalc').textContent=`kept ${mask.reduce((a,b)=>a+b,0)} of 16; survivors multiplied by 1/(1 − p) = ${p<1?(1/(1-p)).toFixed(2):'—'}\ncheck on ${N.toLocaleString('en-US')} ones: mean ${m.toFixed(3)} (theory 1)   variance ${(s2/N-m*m).toFixed(3)} (theory p/(1 − p) = ${p<1?(p/(1-p)).toFixed(3):'—'})`;
}
$('#doP').addEventListener('input',drawDO);$('#doGo').onclick=()=>{doSeed++;drawDO()};drawDO();

/* ---------- 4.7 log error ---------- */
function drawLR(){
  const e=+$('#lrE').value;$('#lrEo').textContent=e.toLocaleString('en-US');
  const row=(p)=>{const q=p+e,le=Math.log(q)-Math.log(p);return`  price $${p.toLocaleString('en-US').padEnd(10)} predicted $${q.toLocaleString('en-US').padEnd(10)} relative ${(e/p*100).toFixed(1).padStart(5)}%   log error ${le.toFixed(3)}`};
  $('#lrCalc').textContent=`the same $${e.toLocaleString('en-US')} error:\n${row(125000)}\n${row(4000000)}\nsquared error in dollars treats both alike; log error sees ${((Math.log(125000+e)-Math.log(125000))/(Math.log(4000000+e)-Math.log(4000000))).toFixed(0)}× more error in the cheap house\nfor small errors log error ≈ relative error: log(1.1) = ${Math.log(1.1).toFixed(3)}`;
}
$('#lrE').addEventListener('input',drawLR);drawLR();
