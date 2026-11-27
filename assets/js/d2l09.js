/* D2L · Chapter 9 · Optimization Algorithms — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s9-1','9.1','المشهد والنزول التدرّجي'],['s9-2','9.2','النزول العشوائي'],['s9-3','9.3','نموذجا الاختبار'],['s9-4','9.4','الزخم'],['s9-5','9.5','Adam وAdamW'],['s9-6','9.6','Muon'],['s9-7','9.7','جداول معدّل التعلّم'],['s9-8','9.8','حجم الدفعة'],['s9-9','9.9','التحجيم μP'],['s9-10','9.10','تشخيصات عملية'],['ex','','الخلاصة والتمارين']];
const GL=[
['الانحناء','curvature','سرعة تغيّر الميل؛ القيم الذاتية لمصفوفة هيسه.'],
['عدد التكييف','condition number κ','نسبة أكبر انحناء إلى أصغره.'],
['نقطة السرج','saddle point','نقطة حرجة فيها انحناءات موجبة وسالبة.'],
['الحدّة','sharpness','أكبر قيمة ذاتية لهيسه؛ تحدّ η بـ2/λmax.'],
['حافة الاستقرار','edge of stability','ارتفاع الحدّة أثناء التدريب حتى 2/η تقريباً.'],
['كرة الضجيج','noise ball','المنطقة التي يتجول فيها SGD بمعدّل ثابت حول القاع.'],
['شروط روبنز ومونرو','Robbins–Monro conditions','Σηₜ = ∞ وΣηₜ² < ∞ للتقارب مع الضجيج.'],
['الزخم','momentum','سرعة تجمع التدرّجات السابقة بأوزان βᵏ.'],
['الخطوة الفعّالة','effective step','η/(1−β) للتدرّجات المتسقة.'],
['التخميد الحرج','critical damping','أسرع انكماش لاتجاه دون تذبذب.'],
['AdaGrad / RMSProp','AdaGrad / RMSProp','قسمة كل إحداثي على جذر مجموع (أو متوسط) مربعات تدرّجاته.'],
['Adam','Adam','زخم + قسمة على جذر متوسط المربعات + تصحيح انحياز البداية.'],
['تصحيح الانحياز','bias correction','القسمة على 1 − βᵗ لإزالة أثر البداية من الصفر.'],
['النزول بالإشارة','sign descent','x ← x − η·sign(g).'],
['AdamW','AdamW','Adam مع تخميد أوزان مطبَّق مباشرة لا عبر التدرّج.'],
['المعيار الطيفي','spectral norm','أكبر قيمة شاذة: أقصى تمدد تحدثه المصفوفة.'],
['التعامد','orthogonalization','استبدال كل القيم الشاذة بـ1: UVᵀ.'],
['نيوتن–شولتز','Newton–Schulz iteration','تكرار كثير حدود فردي يدفع القيم الشاذة نحو 1.'],
['Muon','Muon','زخم ثم تعامد تحديث المصفوفات الداخلية.'],
['الميزانية التراكمية','cumulative budget','مجموع η على كل الخطوات: المساحة تحت الجدول.'],
['ثبات ثم تخميد','warmup–stable–decay (WSD)','إحماء، ثم ذروة ثابتة، ثم تبريد قصير إلى الصفر.'],
['مقياس ضجيج التدرّج','gradient noise scale','tr Σ / ‖∇f‖²: الدفعة التي تتساوى عندها الإشارة والضجيج.'],
['الدفعة الحرجة','critical batch size','الحد الذي يتوقف بعده تكبير الدفعة عن توفير الخطوات.'],
['μP','maximal update parametrization','قواعد تحجيم تجعل η الأمثل ثابتاً مع العرض.'],
['فحص الإحداثيات','coordinate check','اختبار ثبات حجم التنشيطات عبر العروض بعد خطوة واحدة.'],
['القصّ بالمعيار الكلي','global-norm clipping','تصغير التدرّج كله إن تجاوز طوله θ.'],
['متوسط الأوزان المتحرك','weight EMA','نسخة ظل αx̄ + (1−α)x تُستعمل في التقييم.']];
initPage(SECS,GL);
const N=v=>Math.round(v).toLocaleString('en-US');
const L1=0.2,L2=4;
const ell=(X,Y)=>[0.25,1,3,8,16].map(c=>{let d='';for(let k=0;k<=64;k++){const a=2*Math.PI*k/64,u=Math.sqrt(c/0.1)*Math.cos(a),v=Math.sqrt(c/2)*Math.sin(a);d+=(k?'L':'M')+X(u).toFixed(1)+' '+Y(v).toFixed(1)}return`<path d="${d}" fill="none" stroke="var(--rule)"/>`}).join('');
const stepsTo=(path)=>{const ok=q=>Math.abs(q[0])<=0.05&&Math.abs(q[1])<=0.02;if(!ok(path[path.length-1]))return null;let i=path.length-1;while(i>0&&ok(path[i-1]))i--;return i};
const vplot=(el,lines,pts)=>plot(el,{xmin:-6,xmax:1.5,ymin:-2.6,ymax:2.6,H:260,xt:[-5,-2.5,0],yt:[-2,0,2],xl:'x₁',yl:'x₂',raw:ell,lines,pts:[{x:-5,y:-2,c:'var(--ink)',r:4,t:'start'},...(pts||[])]});

/* ---------- 9.1 GD on the valley ---------- */
function gdPath(eta,n=200){let x=-5,y=-2;const p=[[x,y]];for(let t=0;t<n;t++){x=(1-L1*eta)*x;y=(1-L2*eta)*y;p.push([x,y]);if(Math.abs(y)>50)break}return p}
function drawGD(){const eta=$('#gdE').value/1000;$('#gdEo').textContent=eta.toFixed(3);const p=gdPath(eta),s=stepsTo(p),m1=1-L1*eta,m2=1-L2*eta;
  vplot($('#gdPlot'),[{pts:p.slice(0,60),c:'var(--rose)',w:2}],p.slice(1,25).map(q=>({x:q[0],y:q[1],c:'var(--rose)',r:2.5})));
  $('#gdCalc').textContent=`x₁ multiplied by 1 − 0.2η = ${m1.toFixed(3)} per step (flat floor)\nx₂ multiplied by 1 − 4η = ${m2.toFixed(3)} per step (steep wall${m2<0?', flips sign':''})\n`+(Math.abs(m2)>=1?`|1 − 4η| ≥ 1 → diverges (η must be < 0.5)`:`steps until both within 1% of start: ${s===null?'> 200':s}`)}
$('#gdE').addEventListener('input',drawGD);$('#gdOpt').addEventListener('click',()=>{$('#gdE').value=476;drawGD()});drawGD();

/* ---------- 9.1 curvature filter ---------- */
const cf=x=>x*Math.cos(0.15*Math.PI*x),cfd=x=>Math.cos(0.15*Math.PI*x)-0.15*Math.PI*x*Math.sin(0.15*Math.PI*x),cfdd=x=>-0.3*Math.PI*Math.sin(0.15*Math.PI*x)-(0.15*Math.PI)**2*x*Math.cos(0.15*Math.PI*x);
function drawCF(){const eta=+segVal('#cfE','v');let x=10;const P=[x];for(let t=0;t<60;t++){x=x-eta*cfd(x);P.push(x)}
  plot($('#cfPlot'),{xmin:-12,xmax:13,ymin:-11,ymax:11,H:240,xt:[-10,-5,0,5,10],yt:[-10,-5,0,5,10],xl:'x',
    curves:[{f:cf,c:'var(--math)'}],lines:[{pts:P.slice(0,25).map(v=>[v,cf(v)]),c:'var(--rose)',w:1.2,dash:1}],pts:[...P.slice(0,25).map(v=>({x:v,y:cf(v),c:'var(--rose)',r:3})),{x:P[60],y:cf(P[60]),c:'var(--green)',r:6,t:'x = '+P[60].toFixed(2)}]});
  const c=cfdd(P[60]);
  $('#cfCalc').textContent=`η = ${eta}: GD tolerates curvature up to 2/η = ${(2/eta).toFixed(1)}\ndeep minimum x = 7.269, f'' = 1.81 → 1 − η·1.81 = ${(1-eta*1.81).toFixed(2)} ${Math.abs(1-eta*1.81)<1?'(stable)':'(unstable: ejects)'}\nshallow minimum x ≈ −1.83, f'' = 0.98 → 1 − η·0.98 = ${(1-eta*0.98).toFixed(2)} ${Math.abs(1-eta*0.98)<1?'(stable)':'(unstable)'}\nafter 60 steps: x = ${P[60].toFixed(3)}, f'' there = ${c.toFixed(2)}`}
segOn('#cfE',drawCF);drawCF();

/* ---------- 9.2 noise ball ---------- */
let nbSeed=4;
function drawNB(){const eta=$('#nbE').value/100,b=2**+$('#nbB').value;$('#nbEo').textContent=eta.toFixed(2);$('#nbBo').textContent=b;const R=rng(nbSeed),sd=1/Math.sqrt(b),M=400,T=500;
  const pts=[];let s1=0,s2=0;for(let m=0;m<M;m++){let x=-5,y=-2;for(let t=0;t<T;t++){x=(1-L1*eta)*x-eta*sd*gauss(R);y=(1-L2*eta)*y-eta*sd*gauss(R)}pts.push([x,y]);s1+=x*x;s2+=y*y}
  const v1=eta/(b*L1*(2-eta*L1)),v2=eta/(b*L2*(2-eta*L2));
  plot($('#nbPlot'),{xmin:-2.6,xmax:2.6,ymin:-1.3,ymax:1.3,H:240,xt:[-2,-1,0,1,2],yt:[-1,0,1],xl:'x₁',yl:'x₂',
    raw:(X,Y)=>{let d='';for(let k=0;k<=64;k++){const a=2*Math.PI*k/64;d+=(k?'L':'M')+X(2*Math.sqrt(v1)*Math.cos(a)).toFixed(1)+' '+Y(2*Math.sqrt(v2)*Math.sin(a)).toFixed(1)}return pts.map(q=>`<circle cx="${X(q[0]).toFixed(1)}" cy="${Y(q[1]).toFixed(1)}" r="2.2" fill="var(--math)" opacity=".55"/>`).join('')+`<path d="${d}" fill="none" stroke="var(--rose)" stroke-dasharray="5 4" stroke-width="1.6"/>`}});
  $('#nbCalc').textContent=`measured variance  x₁: ${(s1/M).toFixed(4)}   x₂: ${(s2/M).toFixed(4)}\nformula ησ²/(λ(2 − ηλ)), σ² = 1/b: x₁ ${v1.toFixed(4)}   x₂ ${v2.toFixed(4)}\nflat/steep ratio ≈ ${(v1/v2).toFixed(1)}  ·  η/b = ${(eta/b).toFixed(4)} sets the size (dashed: 2 std)`}
['#nbE','#nbB'].forEach(s=>$(s).addEventListener('input',drawNB));$('#nbGo').addEventListener('click',()=>{nbSeed++;drawNB()});drawNB();

/* ---------- 9.4 momentum ---------- */
function mPath(eta,beta,n=300){let x=-5,y=-2,vx=0,vy=0;const p=[[x,y]];for(let t=0;t<n;t++){vx=beta*vx+L1*x;vy=beta*vy+L2*y;x-=eta*vx;y-=eta*vy;p.push([x,y]);if(Math.abs(y)>50||Math.abs(x)>50)break}return p}
function drawMM(){const eta=$('#mmE').value/100,beta=$('#mmB').value/100;$('#mmEo').textContent=eta.toFixed(2);$('#mmBo').textContent=beta.toFixed(2);
  const g=mPath(eta,0),m=mPath(eta,beta),sg=stepsTo(g),sm=stepsTo(m),dv=p=>p.length<301&&(Math.abs(p[p.length-1][1])>50||Math.abs(p[p.length-1][0])>50);
  vplot($('#mmPlot'),[{pts:g.slice(0,40),c:'var(--rose)',w:1.6,dash:1},{pts:m.slice(0,80),c:'var(--green)',w:2.2}]);
  const ceil=2*(1+beta)/L2;
  $('#mmCalc').textContent=`plain GD (dashed red): ${dv(g)?'diverges (η ≥ 0.5)':'1% in '+(sg===null?'> 300':sg)+' steps'}\nmomentum β = ${beta.toFixed(2)} (green): ${dv(m)?'diverges':'1% in '+(sm===null?'> 300':sm)+' steps'}\nfloor step η/(1−β) = ${(eta/(1-beta)).toFixed(2)}   wall step η/(1+β) = ${(eta/(1+beta)).toFixed(2)}   ceiling η < 2(1+β)/λmax = ${ceil.toFixed(2)}`}
['#mmE','#mmB'].forEach(s=>$(s).addEventListener('input',drawMM));$('#mmOpt').addEventListener('click',()=>{$('#mmE').value=67;$('#mmB').value=40;drawMM()});drawMM();

/* ---------- 9.5 first steps of RMSProp vs Adam ---------- */
function drawAD(){const b2=+segVal('#adB','v'),b1=0.9,T=40,r=t=>1/Math.sqrt(1-b2**t),a=t=>(1-b1**t)/Math.sqrt(1-b2**t),mx=r(1)*1.1;
  plot($('#adPlot'),{xmin:1,xmax:T,ymin:0,ymax:mx,H:230,xt:[1,10,20,30,40],yt:[0,1,+(r(1)/2).toFixed(1),+r(1).toFixed(1)],xl:'step t',yl:'|Δx| / η',
    lines:[{pts:Array.from({length:T},(_,i)=>[i+1,r(i+1)]),c:'var(--rose)',w:2.4},{pts:Array.from({length:T},(_,i)=>[i+1,a(i+1)]),c:'var(--amber)',w:2,dash:1},{pts:[[1,1],[T,1]],c:'var(--green)',w:2.4}],
    pts:[{x:1,y:r(1),c:'var(--rose)',t:'RMSProp',r:4},{x:12,y:a(12),c:'var(--amber)',t:'Adam, no correction',r:3},{x:30,y:1,c:'var(--green)',t:'Adam',r:3}]});
  $('#adCalc').textContent=`constant gradient g, β₂ = ${b2}:\nRMSProp from v₀ = 0: step 1 = η/√(1 − β₂) = ${r(1).toFixed(2)}η, step 10 = ${r(10).toFixed(2)}η\nAdam without bias correction: step 1 = ${a(1).toFixed(2)}η\nAdam with m̂ = m/(1 − β₁ᵗ), v̂ = v/(1 − β₂ᵗ): exactly η every step (±η per coordinate at t = 1)`}
segOn('#adB',drawAD);drawAD();

/* ---------- 9.6 Newton–Schulz ---------- */
const NSQ=x=>3.4445*x-4.7750*x**3+2.0315*x**5,NSC=x=>1.5*x-0.5*x**3;
function drawNS(){const k=+$('#nsK').value,q=segVal('#nsP','v')==='q';$('#nsKo').textContent=k;const p=q?NSQ:NSC,it=s=>{for(let i=0;i<k;i++)s=p(s);return s};
  plot($('#nsPlot'),{xmin:0,xmax:1,ymin:0,ymax:1.3,H:230,xt:[0,0.25,0.5,0.75,1],yt:[0,0.5,1],xl:'σ (after normalizing by ‖G‖F)',yl:'p⁽ᵏ⁾(σ)',
    raw:(X,Y)=>`<rect x="${X(0)}" y="${Y(1.2)}" width="${X(1)-X(0)}" height="${Y(0.68)-Y(1.2)}" fill="var(--amber-soft)"/>`,curves:[{f:s=>s,c:'var(--soft)',w:1,dash:1},{f:it,c:'var(--math)',w:2.4}]});
  const lo=q?0.0015:0.02;let mn=9,mx=-9;for(let i=0;i<=2000;i++){const s=lo+(1-lo)*i/2000,v=it(s);mn=Math.min(mn,v);mx=Math.max(mx,v)}
  $('#nsCalc').textContent=`${q?'quintic 3.4445x − 4.7750x³ + 2.0315x⁵':'cubic 1.5x − 0.5x³'}, ${k} iteration(s)\nσ ∈ [${lo}, 1] maps into [${mn.toFixed(3)}, ${mx.toFixed(3)}]\nslope at 0 after k steps: ${(q?3.4445:1.5)}^${k} = ${((q?3.4445:1.5)**k).toFixed(1)}`}
$('#nsK').addEventListener('input',drawNS);segOn('#nsP',drawNS);drawNS();

/* ---------- 9.7 schedules on a noisy flat direction ---------- */
const SCH=[['constant',t=>0.1,'var(--soft)'],['(1+t/50)^−½',t=>0.1/Math.sqrt(1+t/50),'var(--math)'],['(1+t/50)^−1',t=>0.1/(1+t/50),'var(--green)'],['exponential',t=>0.4*0.98**t,'var(--rose)']];
function drawSC(){const v=segVal('#scV','v'),T=3000,lam=0.2;const res=SCH.map(([n,f,c])=>{let e=25,B=0;const pts=[];for(let t=0;t<T;t++){const h=f(t);B+=h;e=(1-h*lam)**2*e+h*h;if(t%10===0||t===T-1)pts.push([t,v==='eta'?Math.log10(Math.max(h,1e-30)):Math.log10(e)])}return {n,c,pts,e,B,last:f(T-1)}});
  plot($('#scPlot'),{xmin:0,xmax:T,ymin:v==='eta'?-5:-3,ymax:v==='eta'?0:1.6,H:240,xt:[0,1000,2000,3000],yt:v==='eta'?[-4,-3,-2,-1,0]:[-2,-1,0,1],ytf:x=>'10^'+x,xl:'step',yl:v==='eta'?'η':'E[x²]',
    lines:res.map(r=>({pts:r.pts,c:r.c,w:2.2})),pts:res.map((r,i)=>({x:[2950,2950,2950,2950][i],y:r.pts[r.pts.length-1][1],c:r.c,r:3,t:r.n,left:1}))});
  $('#scCalc').textContent=res.map(r=>`${r.n.padEnd(13)} B = ${r.B.toFixed(1).padStart(5)}  η_T = ${r.last.toExponential(0).padStart(6)}  E[x²] = ${r.e.toFixed(3)}`).join('\n')+`\nconstant 0.1; polynomial 0.1(1+t/50)^−α (our choice); exponential 0.4·0.98ᵗ\nexact recursion E[x²] ← (1 − ηλ)²E[x²] + η² from x₀ = −5`}
segOn('#scV',drawSC);drawSC();

/* ---------- 9.8 critical batch size ---------- */
function drawBS(){const r=2**($('#bsR').value/5);$('#bsRo').textContent=r<1?'1/'+(1/r).toFixed(r<0.2?0:1):r.toFixed(r>5?0:1);
  plot($('#bsPlot'),{xmin:-4,xmax:4,ymin:0,ymax:18,H:230,xt:[-4,-2,0,2,4],yt:[1,2,5,10,17],xl:'log₂(b / b_crit)',
    curves:[{f:l=>1+1/2**l,c:'var(--math)'},{f:l=>1+2**l,c:'var(--rose)'}],pts:[{x:Math.log2(r),y:1+1/r,c:'var(--math)',t:'steps'},{x:Math.log2(r),y:1+r,c:'var(--rose)',t:'examples',left:1}]});
  $('#bsCalc').textContent=`b = ${r.toFixed(3)} × b_crit\nsteps S/S_min = 1 + b_crit/b = ${(1+1/r).toFixed(2)}\nexamples (data, compute) E/E_min = 1 + b/b_crit = ${(1+r).toFixed(2)}\n`+(r<0.7?'small batch: cheap in data, many steps':r>1.5?'large batch: few steps saved, data bill grows':'near the knee: 2× steps and 2× data of each optimum')}
$('#bsR').addEventListener('input',drawBS);drawBS();

/* ---------- 9.9 width scaling ---------- */
function drawMU(){const mu=segVal('#muP','v')==='mu',eta=2**-8,W=[128,512,2048,8192];const s=W.map(n=>mu?eta/(n/128)*n:eta*n);
  $('#muOut').innerHTML=W.map((n,i)=>bar('n = '+N(n),s[i],32,s[i].toFixed(2)+'×',s[i]>2?'var(--rose)':'var(--green)')).join('');
  $('#muCalc').textContent=mu?`μP: hidden-matrix learning rate η/m, m = n/128\nshift = (η/m)·n = η·128 = ${(eta*128).toFixed(2)} at every width → the same η transfers`:`SP: one global η = 2⁻⁸ ≈ ${eta.toFixed(4)}\nfirst Adam step shifts a hidden pre-activation by ≈ η·n (n sign-aligned terms)\nfrom ${(eta*128).toFixed(2)}× at n = 128 to ${(eta*8192).toFixed(0)}× at n = 8192`}
segOn('#muP',drawMU);drawMU();

/* ---------- 9.10 Adam second-moment spike ---------- */
function drawSP(){const b2=+segVal('#spB','v'),clip=segVal('#spC','v')==='1',s=clip?16:1e4,v0=b2+(1-b2)*s,T=3000;const vt=t=>1+(v0-1)*b2**t,rec=v0>2?Math.ceil(Math.log(v0-1)/-Math.log(b2)):0;
  plot($('#spPlot'),{xmin:0,xmax:T,ymin:0,ymax:1.05,H:220,xt:[0,500,1000,2000,3000],yt:[0,0.25,0.5,0.75,1],xl:'steps after the spike',yl:'effective LR / normal',
    curves:[{f:t=>1/Math.sqrt(vt(t)),c:clip?'var(--green)':'var(--rose)'}],pts:rec&&rec<T?[{x:rec,y:1/Math.sqrt(2),c:'var(--math)',t:'v ≤ 2× normal'}]:[]});
  $('#spCalc').textContent=`normal g² = 1; spike gradient ${clip?'clipped to 4× (g² = 16)':'100× (g² = 10⁴)'}\nv right after: β₂ + (1 − β₂)·${s} = ${v0.toFixed(2)} → effective LR × ${(1/Math.sqrt(v0)).toFixed(2)}\nsteps until v is back within 2× of normal: ${rec}`}
segOn('#spB',drawSP);segOn('#spC',drawSP);drawSP();
