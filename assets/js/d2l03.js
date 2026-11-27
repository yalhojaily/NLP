/* D2L · Chapter 3 · Linear Classification — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s3-1','3.1','انحدار السوفتماكس'],['s3-2','3.2','بيانات تصنيف الصور'],['s3-3','3.3','التنفيذ'],['s3-4','3.4','قياس المصنّفات'],['s3-5','3.5','التعميم في التصنيف'],['s3-6','3.6','تغيّر التوزيع'],['ex','','الخلاصة والتمارين']];
const GL=[
['التصنيف','classification','التنبؤ بصنف من مجموعة أصناف.'],
['الترميز الأحادي','one-hot encoding','متجه فيه 1 في موقع الصنف وأصفار في البقية.'],
['اللوجِت','logit','الدرجة الخطية لصنف قبل السوفتماكس.'],
['السوفتماكس','softmax','exp(oⱼ)/Σexp(oₖ): تحويل الدرجات إلى احتمالات.'],
['الإنتروبيا التقاطعية','cross-entropy','−log الاحتمال المعطى للصنف الصحيح.'],
['المفاجأة','surprisal','−log p: مقدار المعلومة في حدث احتماله p.'],
['الإنتروبيا','entropy','متوسط المفاجأة؛ أقل طول متوسط للترميز.'],
['تباعد KL','KL divergence','الفرق بين الإنتروبيا التقاطعية والإنتروبيا: ثمن التوزيع الخاطئ.'],
['الهامش','margin','درجة الصحيح ناقص أعلى درجة خاطئة.'],
['الحرارة','temperature','قسمة الدرجات على T: تحدّ التوزيع أو تسطّحه.'],
['المعايرة','calibration','تطابق ثقة النموذج مع نسبة صوابه الفعلية.'],
['منطقة القرار','decision region','جزء فضاء المدخلات الذي يُصنَّف صنفاً واحداً.'],
['التسطيح','flattening','تحويل الصورة إلى متجه صفاً بعد صف.'],
['الطفح / التلاشي','overflow / underflow','تجاوز أكبر عدد ممكن / الانهيار إلى صفر.'],
['حيلة LogSumExp','log-sum-exp trick','حساب log Σ exp بطرح الأكبر أولاً.'],
['الدقة','accuracy','نسبة الأمثلة التي أصاب فيها argmax.'],
['متباينة هوفدينغ','Hoeffding\'s inequality','حد مضمون لاحتمال ابتعاد المتوسط عن التوقع.'],
['الملاءمة التكيّفية','adaptive overfitting','تسرب معلومات الاختبار عبر قرارات التصميم.'],
['بعد VC','VC dimension','أكبر عدد نقاط تفصلها فئة النماذج بكل التوسيمات.'],
['تغيّر المتغيرات المصاحبة','covariate shift','تغيّر p(x) مع ثبات p(y|x).'],
['تغيّر الأصناف','label shift','تغيّر p(y) مع ثبات p(x|y).'],
['تغيّر المفهوم','concept shift','تغيّر p(y|x) نفسه.'],
['أوزان الأهمية','importance weights','β = p_T(x)/p_S(x) لإعادة وزن أمثلة المصدر.'],
['مصنّف المجال','domain classifier','مصنّف يميز المصدر من الهدف؛ لوجِته يقدّر log β.'],
['الحجم الفعلي للعينة','effective sample size','(Σβ)²/Σβ²: كم مثالاً «تساوي» العينة الموزونة.'],
['مصفوفة الالتباس','confusion matrix','C_ij: احتمال التنبؤ بـi حين يكون الصحيح j.']];
initPage(SECS,GL);
const CL=['var(--amber)','var(--green)','var(--math)'];
const smx=o=>{const m=Math.max(...o),e=o.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s)};

/* ---------- 3.1 softmax / loss / gradient ---------- */
const SMN=['cat','chicken','dog'];
['#smA','#smB','#smC'].forEach(id=>$(id).max=11);
function drawSM(){
  const o=['#smA','#smB','#smC'].map(id=>+$(id).value),T=+$('#smT').value,y=+segVal('#smY','y');
  const e=o.map(v=>Math.exp(v/T)),s=e.reduce((a,b)=>a+b,0),p=e.map(v=>v/s),g=p.map((v,j)=>v-(j===y?1:0)),L=-Math.log(p[y]);
  $('#smOut').innerHTML=p.map((v,j)=>bar(['قطة','دجاجة','كلب'][j]+(j===y?' ✓':''),v,1,v.toFixed(3),CL[j])).join('');
  $('#smCalc').textContent=`logits o = (${o.map(v=>v.toFixed(1)).join(', ')})   T = ${T.toFixed(1)}\nexp(o/T) = (${e.map(v=>v.toPrecision(4)).join(', ')})   sum = ${s.toPrecision(4)}\nŷ = (${p.map(v=>v.toFixed(3)).join(', ')})   argmax = ${SMN[p.indexOf(Math.max(...p))]}\nloss = −ln ŷ_${SMN[y]} = −ln ${p[y].toFixed(3)} = ${L.toFixed(3)} nats\ngradient ∂l/∂o = ŷ − y = (${g.map(v=>(v>=0?' ':'')+v.toFixed(3)).join(', ')})\nŷ_chicken / ŷ_cat = ${(p[1]/p[0]).toFixed(2)} = exp((o_chicken − o_cat)/T)  ← unchanged by adding a constant`;
}
['#smA','#smB','#smC','#smT'].forEach(id=>$(id).addEventListener('input',drawSM));segOn('#smY',drawSM);
$('#smShift').onclick=()=>{['#smA','#smB','#smC'].forEach(id=>$(id).value=Math.min(11,+$(id).value+5));drawSM()};
$('#smReset').onclick=()=>{$('#smA').value=1;$('#smB').value=2.2;$('#smC').value=0.3;$('#smT').value=1;drawSM()};drawSM();

/* ---------- 3.1 entropy ---------- */
function drawEN(){
  let p1=+$('#enP1').value,p2=+$('#enP2').value;if(p1+p2>1){p2=+(1-p1).toFixed(2);$('#enP2').value=p2}
  let q1=+$('#enQ1').value,q2=+$('#enQ2').value;if(q1+q2>0.99){q2=+(0.99-q1).toFixed(2);$('#enQ2').value=q2}
  const p=[p1,p2,+(1-p1-p2).toFixed(2)],q=[q1,q2,+(1-q1-q2).toFixed(2)];
  const H=-p.reduce((a,v)=>a+(v>0?v*Math.log(v):0),0),CE=-p.reduce((a,v,j)=>a+(v>0?v*Math.log(q[j]):0),0);
  $('#enOut').innerHTML=p.map((v,j)=>bar(`p${j+1} / p̂${j+1}`,v,1,`${v.toFixed(2)} / ${q[j].toFixed(2)}`,CL[j])).join('');
  $('#enCalc').textContent=`p = (${p.map(v=>v.toFixed(2)).join(', ')})   p̂ = (${q.map(v=>v.toFixed(2)).join(', ')})\nH(p)     = −Σ p log p   = ${H.toFixed(3)} nats = ${(H/Math.LN2).toFixed(3)} bits   (max log 3 = ${Math.log(3).toFixed(3)} nats)\nH(p, p̂)  = −Σ p log p̂   = ${CE.toFixed(3)} nats\nKL(p‖p̂) = H(p, p̂) − H(p) = ${(CE-H).toFixed(3)}   ≥ 0, and 0 only when p̂ = p`;
}
['#enP1','#enP2','#enQ1','#enQ2'].forEach(id=>$(id).addEventListener('input',drawEN));drawEN();

/* ---------- 3.2 28×28 drawing pad ---------- */
const PX=new Float32Array(784);let dwLast=null,dwDown=false;
$('#dwPad').innerHTML=Array.from({length:784},(_,i)=>`<i data-i="${i}" style="display:block;border:0.5px solid var(--tint)"></i>`).join('');
const dwCells=$$('#dwPad i');
function dwPaint(i){const r=Math.floor(i/28),c=i%28;PX[i]=1;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const rr=r+a,cc=c+b;if(rr>=0&&rr<28&&cc>=0&&cc<28)PX[rr*28+cc]=Math.max(PX[rr*28+cc],0.5)});dwLast=i}
function drawDW(){
  dwCells.forEach((el,i)=>el.style.background=PX[i]?`color-mix(in srgb, var(--ink) ${Math.round(PX[i]*100)}%, var(--paper))`:'');
  const nz=[];PX.forEach((v,i)=>{if(v)nz.push(i)});
  $('#dwVec').innerHTML=`<div style="color:var(--ink);margin-bottom:4px">x.reshape(-1) → shape (784,)</div>[`+Array.from({length:784},(_,i)=>PX[i]?`<b style="color:var(--amber)">${PX[i]===1?'1':'.5'}</b>`:'0').slice(0,392).join(' ')+' …]';
  $('#dwCalc').textContent=`image shape (1, 28, 28) → flattened (784,)   non-zero pixels: ${nz.length}\n`+(dwLast!==null?`last pixel: row ${Math.floor(dwLast/28)}, column ${dwLast%28}  →  index 28×${Math.floor(dwLast/28)} + ${dwLast%28} = ${dwLast}`:'draw on the grid (first 392 entries = top half shown on the right)');
}
function dwAt(ev){const t=ev.target.closest&&ev.target.closest('#dwPad i');if(t){dwPaint(+t.dataset.i);drawDW()}}
$('#dwPad').addEventListener('pointerdown',ev=>{dwDown=true;ev.preventDefault();dwAt(ev)});
$('#dwPad').addEventListener('mousedown',ev=>ev.preventDefault());
$('#dwPad').addEventListener('pointermove',ev=>{if(!dwDown)return;const el=document.elementFromPoint(ev.clientX,ev.clientY);if(el&&el.parentElement&&el.parentElement.id==='dwPad'){dwPaint(+el.dataset.i);drawDW()}});
addEventListener('pointerup',()=>dwDown=false);
$('#dwClear').onclick=()=>{PX.fill(0);dwLast=null;drawDW()};
$('#dwShirt').onclick=()=>{PX.fill(0);for(let c=8;c<=19;c++)for(let r=4;r<=6;r++)PX[r*28+c]=1;for(let r=7;r<=24;r++){for(let c=8;c<=12;c++)PX[r*28+c]=1;for(let c=15;c<=19;c++)PX[r*28+c]=1}for(let r=7;r<=9;r++)for(let c=13;c<=14;c++)PX[r*28+c]=1;dwLast=24*28+19;drawDW()};
drawDW();

/* ---------- 3.3 cross-entropy indexing ---------- */
const CEY=[[0.1,0.3,0.6],[0.3,0.2,0.5]];
function drawCE(){
  const y=segVal('#ceY','v').split(',').map(Number),pk=y.map((c,i)=>CEY[i][c]),L=-pk.reduce((a,v)=>a+Math.log(v),0)/2;
  $('#ceOut').innerHTML=lab('y_hat (2, 3)',grid(CEY,(i,j)=>j===y[i]?'h':''))+`<div style="align-self:center;font-size:20px">→</div>`+lab(`y_hat[[0, 1], [${y}]]`,grid([pk],()=>'h'));
  $('#ceCalc').textContent=`y_hat[list(range(2)), y] picks row 0 col ${y[0]} and row 1 col ${y[1]} → (${pk.join(', ')})\n−log → (${pk.map(v=>(-Math.log(v)).toFixed(4)).join(', ')})\nmean = ${L.toFixed(4)}`+(y[0]===0&&y[1]===2?'   (the book prints tensor(1.4979))':'');
}
segOn('#ceY',drawCE);drawCE();

/* ---------- 3.3 numerical stability ---------- */
const f32=Math.fround,e32=v=>f32(Math.exp(f32(v)));
const show=v=>isNaN(v)?'nan':!isFinite(v)?(v>0?'inf':'-inf'):v===0?'0':Math.abs(v)<1e-3||Math.abs(v)>1e4?v.toExponential(3):v.toFixed(4);
function drawST(){
  const o=segVal('#stS','v').split(',').map(Number);
  const e=o.map(e32),s=f32(e.reduce((a,b)=>f32(a+b),0)),p=e.map(v=>f32(v/s)),lp=p.map(v=>f32(Math.log(v)));
  const m=Math.max(...o),es=o.map(v=>e32(v-m)),ss=f32(es.reduce((a,b)=>f32(a+b),0)),ps=es.map(v=>f32(v/ss)),lse=f32(Math.log(ss)),lps=o.map(v=>f32(v-m-lse));
  $('#stCalc').textContent=`logits o = [${o.join(', ')}]\n\nnaive:   exp(o)   = [${e.map(show).join(', ')}]   sum = ${show(s)}\n         softmax  = [${p.map(show).join(', ')}]\n         log      = [${lp.map(show).join(', ')}]\n\nstable:  exp(o − ${m<0?'('+m+')':m}) = [${es.map(show).join(', ')}]   sum = ${show(ss)}\n         softmax  = [${ps.map(show).join(', ')}]\n         log ŷ = o − max − log Σ exp(o − max) = [${lps.map(show).join(', ')}]`;
}
segOn('#stS',drawST);drawST();

/* ---------- 3.3 train a softmax classifier in the plane ---------- */
const TCC=[[-1.4,-0.6],[1.4,-0.4],[0,1.5]];
const TC=(()=>{const R=rng(21),mk=n=>{const X=[],y=[];for(let i=0;i<n;i++){const c=i%3;X.push([TCC[c][0]+0.85*gauss(R),TCC[c][1]+0.85*gauss(R)]);y.push(c)}return{X,y}};return{tr:mk(300),va:mk(300)}})();
let TCH=null,tcTimer=null;
function tcTrain(lr){const R=rng(8);let W=[[0,0,0],[0,0,0]].map(r=>r.map(()=>0.01*gauss(R))),b=[0,0,0];const snaps=[];
  const ev=D=>{let L=0,ok=0;D.X.forEach((x,i)=>{const p=smx([0,1,2].map(j=>x[0]*W[0][j]+x[1]*W[1][j]+b[j]));L-=Math.log(Math.max(p[D.y[i]],1e-12));if(p.indexOf(Math.max(...p))===D.y[i])ok++});return[L/D.y.length,ok/D.y.length]};
  const snap=()=>{const [tl,ta]=ev(TC.tr),[vl,va]=ev(TC.va);snaps.push({W:W.map(r=>r.slice()),b:b.slice(),tl,ta,vl,va})};snap();
  for(let ep=0;ep<30;ep++){const perm=[...Array(300).keys()];for(let i=299;i>0;i--){const j=Math.floor(R()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
    for(let s=0;s<300;s+=32){const idx=perm.slice(s,s+32),gW=[[0,0,0],[0,0,0]],gb=[0,0,0];
      for(const i of idx){const x=TC.tr.X[i],p=smx([0,1,2].map(j=>x[0]*W[0][j]+x[1]*W[1][j]+b[j]));p[TC.tr.y[i]]-=1;for(let j=0;j<3;j++){gW[0][j]+=x[0]*p[j];gW[1][j]+=x[1]*p[j];gb[j]+=p[j]}}
      for(let j=0;j<3;j++){W[0][j]-=lr*gW[0][j]/idx.length;W[1][j]-=lr*gW[1][j]/idx.length;b[j]-=lr*gb[j]/idx.length}}
    snap()}
  return snaps}
function drawTC(){
  const ep=+$('#tcE').value;$('#tcEo').textContent=ep;const S=TCH[ep],G=34,xr=[-4,4],yr=[-3.5,4.5];
  const raw=(x,y)=>{let s='';for(let i=0;i<G;i++)for(let k=0;k<G;k++){const a=xr[0]+(i+0.5)*(xr[1]-xr[0])/G,c=yr[0]+(k+0.5)*(yr[1]-yr[0])/G,p=smx([0,1,2].map(j=>a*S.W[0][j]+c*S.W[1][j]+S.b[j])),m=Math.max(...p),j=p.indexOf(m);
    const x0=x(xr[0]+i*(xr[1]-xr[0])/G),x1=x(xr[0]+(i+1)*(xr[1]-xr[0])/G),y0=y(yr[0]+(k+1)*(yr[1]-yr[0])/G),y1=y(yr[0]+k*(yr[1]-yr[0])/G);
    s+=`<rect shape-rendering="crispEdges" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(x1-x0+1).toFixed(1)}" height="${(y1-y0+1).toFixed(1)}" fill="${CL[j]}" opacity="${(0.08+0.4*(m-1/3)*1.5).toFixed(2)}"/>`}return s};
  plot($('#tcPlot'),{xmin:xr[0],xmax:xr[1],ymin:yr[0],ymax:yr[1],W:420,H:360,maxw:'460px',xt:[-3,0,3],yt:[-3,0,3],xl:'x₁',yl:'x₂',raw,
    pts:TC.tr.X.map((x,i)=>({x:x[0],y:x[1],c:CL[TC.tr.y[i]],r:2.6}))});
  $('#tcCalc').textContent=`epoch ${ep}   (η = ${segVal('#tcL','v')}, batch 32, 10 updates per epoch)\ntrain: loss ${S.tl.toFixed(3)}  accuracy ${(S.ta*100).toFixed(1)}%\nvalid: loss ${S.vl.toFixed(3)}  accuracy ${(S.va*100).toFixed(1)}%\nW = [[${S.W[0].map(v=>v.toFixed(2)).join(', ')}], [${S.W[1].map(v=>v.toFixed(2)).join(', ')}]]   b = [${S.b.map(v=>v.toFixed(2)).join(', ')}]\ncolour = argmax class, shade = its probability (confidence)`;
}
function tcReset(){TCH=tcTrain(+segVal('#tcL','v'));drawTC()}
$('#tcE').addEventListener('input',()=>{clearInterval(tcTimer);drawTC()});
segOn('#tcL',()=>{clearInterval(tcTimer);tcReset()});
$('#tcPlay').onclick=()=>{clearInterval(tcTimer);$('#tcE').value=0;drawTC();tcTimer=setInterval(()=>{const v=+$('#tcE').value;if(v>=30){clearInterval(tcTimer);return}$('#tcE').value=v+1;drawTC()},180)};
tcReset();document.addEventListener('themechange',drawTC);

/* ---------- 3.4 accuracy ---------- */
const ACN=['T-shirt','Trouser','Shirt','Bag'];
const ACO=[[3.1,-1,1.9,-0.5],[-2,4.5,-1,0.2],[1.2,-0.8,1.5,-1],[0.1,-1.5,0.2,2.8],[2.2,0.3,2.0,-0.4],[-0.5,3.9,0,0.1],[0.8,-1,0.7,0.4],[-1,0.5,-0.6,3.3]];
const ACY=[0,1,0,3,2,1,2,3];
function drawAC(){
  const rows=ACO.map((o,i)=>{const p=smx(o),pr=p.indexOf(Math.max(...p));return{o,p,pr,ok:pr===ACY[i]}});
  $('#acTab').innerHTML='<tr><th>#</th>'+ACN.map(n=>`<th>${n}</th>`).join('')+'<th>argmax</th><th>Y</th><th>==</th></tr>'+rows.map((r,i)=>`<tr data-i="${i}" style="cursor:pointer"><td>${i}</td>${r.p.map((v,j)=>`<td class="num" style="${j===r.pr?'font-weight:700;':''}${j===ACY[i]?'background:var(--green-soft)':''}">${v.toFixed(2)}</td>`).join('')}<td class="num">${r.pr}</td><td class="num">${ACY[i]}</td><td class="num" style="color:${r.ok?'var(--green)':'var(--rose)'}">${r.ok?1:0}</td></tr>`).join('');
  $$('#acTab tr[data-i]').forEach(tr=>tr.onclick=()=>{const i=+tr.dataset.i;ACY[i]=(ACY[i]+1)%4;drawAC()});
  const ok=rows.filter(r=>r.ok).length;
  $('#acCalc').textContent=`preds   = Y_hat.argmax(axis=1) = [${rows.map(r=>r.pr).join(', ')}]\nY       = [${ACY.join(', ')}]\ncompare = [${rows.map(r=>r.ok?1:0).join(', ')}]\naccuracy = mean = ${ok}/8 = ${(ok/8).toFixed(3)}\n(green cell = true class; bold = predicted; softmax shown, argmax of logits is the same)`;
}
drawAC();

/* ---------- 3.5 test-set size ---------- */
function drawSS(){
  const e=+$('#ssE').value,c=+segVal('#ssC','v');$('#ssEo').textContent=e.toFixed(3);
  const z={0.68:1,0.95:2,0.999:3.29}[c],nC=Math.ceil(z*z*0.25/(e*e)),nH=Math.ceil(Math.log(1/(1-c))/(2*e*e));
  $('#ssCalc').textContent=`margin ±${e} with ${c*100}% confidence (worst case ε = 0.5):\n  central limit (≈${z} standard deviations): n = ${z}² × 0.25 / ${e}² ≈ ${nC.toLocaleString('en-US')}\n  Hoeffding, exp(−2nt²) < ${(1-c).toFixed(3)}:            n = ln(1/${(1-c).toFixed(3)}) / (2 × ${e}²) ≈ ${nH.toLocaleString('en-US')}\nhalve the margin → ×4 the examples`;
}
$('#ssE').addEventListener('input',drawSS);segOn('#ssC',drawSS);drawSS();

/* ---------- 3.5 VC: shattering ---------- */
const VCP={3:[[0,0],[2,0],[1,1.7]],4:[[0,0],[2,0],[0,2],[2,2]]};let VCL={3:[1,0,1],4:[1,0,0,1]};
function sep(P,L){if(L.every(v=>v===L[0]))return{ok:true,w:null};let w=[0,0,0];for(let ep=0;ep<4000;ep++){let err=0;P.forEach((p,i)=>{const t=L[i]?1:-1;if(t*(w[0]*p[0]+w[1]*p[1]+w[2])<=0){w=[w[0]+t*p[0],w[1]+t*p[1],w[2]+t];err++}});if(!err)return{ok:true,w}}return{ok:false,w:null}}
function drawVC(){
  const n=+segVal('#vcN','v'),P=VCP[n],L=VCL[n],r=sep(P,L);
  const lines=[];if(r.w){const [a,b,c]=r.w;if(Math.abs(b)>1e-9)lines.push({pts:[[-1,(-c+a)/b],[3,(-c-3*a)/b]],c:'var(--ink)',w:2});else lines.push({pts:[[-c/a,-1],[-c/a,3]],c:'var(--ink)',w:2})}
  plot($('#vcPlot'),{xmin:-1,xmax:3,ymin:-1,ymax:3,W:300,H:300,maxw:'300px',xt:[],yt:[],lines,pts:P.map((p,i)=>({x:p[0],y:p[1],c:L[i]?'var(--green)':'var(--rose)',r:11}))});
  $$('#vcPlot circle').forEach((c,i)=>{c.style.cursor='pointer';c.addEventListener('click',()=>{VCL[n][i]^=1;drawVC()})});
  $('#vcCalc').textContent=`labels: [${L.map(v=>v?'+':'−').join(' ')}]   ${r.ok?'separable by a line ✓':'NOT separable by any line ✗  (this is the XOR pattern)'}`+(r.w?`\nline: ${r.w[0].toFixed(0)}·x₁ + ${r.w[1].toFixed(0)}·x₂ + ${r.w[2].toFixed(0)} = 0  (found by the perceptron)`:'');
}
segOn('#vcN',drawVC);drawVC();
$('#vcAll').onclick=()=>{const n=+segVal('#vcN','v');let ok=0,bad=[];for(let m=0;m<(1<<n);m++){const L=Array.from({length:n},(_,i)=>(m>>i)&1);if(sep(VCP[n],L).ok)ok++;else bad.push(L.map(v=>v?'+':'−').join(''))}
  $('#vcCalc').textContent=`${n} points: ${ok} of ${1<<n} labelings are separable`+(ok===1<<n?`  → shattered ✓ (VC dimension of lines in the plane ≥ ${n})`:`  → not shattered; failures: ${bad.join(', ')}\n(every set of 4 points has some labeling a line cannot split, so the VC dimension is 3 = d + 1)`)};

/* ---------- 3.6 covariate shift ---------- */
const sig=z=>1/(1+Math.exp(-z));
const CSY=(a,b)=>b>0.5*a*a-1?1:0;
function logreg(X,y,wt,it=900,lr=0.5){let w=[0,0,0];const W=wt.reduce((a,b)=>a+b,0);for(let t=0;t<it;t++){const g=[0,0,0];for(let i=0;i<X.length;i++){const e=(sig(w[0]*X[i][0]+w[1]*X[i][1]+w[2])-y[i])*wt[i];g[0]+=e*X[i][0];g[1]+=e*X[i][1];g[2]+=e}w=w.map((v,j)=>v-lr*g[j]/W)}return w}
const CSCACHE={};
function csRun(m){if(CSCACHE[m])return CSCACHE[m];const R=rng(3),S=[],T=[],TE=[];for(let i=0;i<400;i++)S.push([gauss(R),gauss(R)]);for(let i=0;i<400;i++)T.push([m+gauss(R),gauss(R)]);for(let i=0;i<2000;i++)TE.push([m+gauss(R),gauss(R)]);
  const ys=S.map(p=>CSY(...p)),yt=TE.map(p=>CSY(...p));
  const dom=m>0?logreg([...S,...T],[...S.map(()=>0),...T.map(()=>1)],new Array(800).fill(1),1200):[0,0,0];
  let beta=S.map(p=>Math.exp(dom[0]*p[0]+dom[1]*p[1]+dom[2]));const mb=beta.reduce((a,b)=>a+b)/beta.length;beta=beta.map(b=>b/mb);const clip=beta.map(b=>Math.min(b,10));
  const acc=w=>TE.filter((p,i)=>((w[0]*p[0]+w[1]*p[1]+w[2])>0?1:0)===yt[i]).length/TE.length;
  const domAcc=[...S.map(p=>[p,0]),...T.map(p=>[p,1])].filter(([p,z])=>((dom[0]*p[0]+dom[1]*p[1]+dom[2])>0?1:0)===z).length/800;
  const fits=[S.map(()=>1),beta,clip].map(wt=>{const w=logreg(S,ys,wt);return{w,acc:acc(w)}});
  const neff=b=>b.reduce((a,c)=>a+c)**2/b.reduce((a,c)=>a+c*c);
  return CSCACHE[m]={S,ys,T,dom,beta,clip,fits,domAcc,neff:[400,neff(beta),neff(clip)]}}
function drawCS(){
  const m=+$('#csM').value,k=+segVal('#csW','v');$('#csMo').textContent=m;const r=csRun(m),f=r.fits[k],wt=[null,r.beta,r.clip][k];
  const [a,b,c]=f.w,mx=Math.max(...(wt||[1]));
  plot($('#csPlot'),{xmin:-3.5,xmax:6,ymin:-3.5,ymax:4,W:460,H:320,xt:[-2,0,2,4],yt:[-2,0,2],xl:'x₁',yl:'x₂',
    curves:[{f:x=>0.5*x*x-1,c:'var(--soft)',w:1.5,dash:1},{f:x=>-(a*x+c)/b,c:'var(--ink)',w:2.2}],
    pts:[...r.T.slice(0,150).map(p=>({x:p[0],y:p[1],c:'var(--soft)',r:1.6})),...r.S.map((p,i)=>({x:p[0],y:p[1],c:r.ys[i]?'var(--green)':'var(--rose)',r:wt?Math.max(1,Math.min(6,1.2+5*Math.sqrt(wt[i]/mx))):2.4}))]});
  $('#csCalc').textContent=`source 𝒩(0, I), target 𝒩((${m}, 0), I);  label = 1 if x₂ > ½x₁² − 1 (dashed curve)\ndomain classifier logit h(x) = ${r.dom[0].toFixed(2)}·x₁ ${r.dom[1]<0?"−":"+"} ${Math.abs(r.dom[1]).toFixed(2)}·x₂ ${r.dom[2]<0?"−":"+"} ${Math.abs(r.dom[2]).toFixed(2)}   (true log-ratio: ${m}·x₁ − ${(m*m/2).toFixed(1)})   domain accuracy ${(r.domAcc*100).toFixed(0)}%\naccuracy on the target (2,000 labelled target points, used only for scoring):\n  unweighted ${(r.fits[0].acc*100).toFixed(1)}%   importance-weighted ${(r.fits[1].acc*100).toFixed(1)}%   clipped at 10: ${(r.fits[2].acc*100).toFixed(1)}%\neffective sample size of the 400 source points: ${r.neff.map(v=>v.toFixed(0)).join(' / ')}  (unweighted / weighted / clipped)\npoint size = weight; grey = unlabelled target points`;
}
$('#csM').addEventListener('input',drawCS);segOn('#csW',drawCS);drawCS();document.addEventListener('themechange',drawCS);

/* ---------- 3.6 label shift ---------- */
let lbSeed=1;
function drawLB(){
  const p=+$('#lbP').value,n=+segVal('#lbN','v');$('#lbPo').textContent=p.toFixed(2);
  const sens=0.85,fpr=0.10,R=rng(lbSeed);let pos=0,trueSick=0;
  for(let i=0;i<n;i++){const sick=R()<p;if(sick)trueSick++;const pred=sick?R()<sens:R()<fpr;if(pred)pos++}
  const mu=pos/n,est=(mu-fpr)/(sens-fpr);
  $('#lbCalc').textContent=`classifier measured on source validation data: P(says sick | sick) = ${sens}, P(says sick | healthy) = ${fpr}\nC = [[${sens}, ${fpr}], [${(1-sens).toFixed(2)}, ${(1-fpr).toFixed(2)}]]   (columns: true sick, true healthy)\n\ntarget: ${n.toLocaleString('en-US')} unlabelled examples, true share of sick = ${p.toFixed(2)} (unknown to us)\nshare the classifier calls sick: μ̂ = ${mu.toFixed(4)}   ← naive estimate, biased\nsolve C p = μ:  p̂ = (μ̂ − ${fpr}) / (${sens} − ${fpr}) = ${est.toFixed(4)}   (true ${p.toFixed(2)}, error ${(est-p>=0?'+':'')+(est-p).toFixed(4)})\nclass weights if the source had 10% sick: β(sick) = ${(est/0.1).toFixed(2)}, β(healthy) = ${((1-est)/0.9).toFixed(2)}`;
}
$('#lbP').addEventListener('input',drawLB);segOn('#lbN',drawLB);$('#lbGo').onclick=()=>{lbSeed++;drawLB()};drawLB();
