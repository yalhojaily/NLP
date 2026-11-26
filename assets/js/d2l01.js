/* D2L · Chapter 1 · Preliminaries — interactive widgets (uses ar-common.js) */
const SECS=[['s0','','افتتاحية الفصل'],['s1-1','1.1','الموترات'],['s1-2','1.2','تهيئة البيانات'],['s1-3','1.3','الجبر الخطي'],['s1-4','1.4','التفاضل'],['s1-5','1.5','الاشتقاق التلقائي'],['s1-6','1.6','الاحتمال والإحصاء'],['ex','','الخلاصة والتمارين']];
const GL=[
['الموتر','tensor','جدول أعداد بأي عدد من المحاور: عدد، متجه، مصفوفة، أو أكثر.'],
['الشكل','shape','عدد العناصر على كل محور، مثل (256, 1, 28, 28).'],
['الرتبة','order / ndim','عدد محاور الموتر.'],
['نوع البيانات','dtype','كيف تُخزَّن الأعداد: float32 أو uint8 أو غيرها.'],
['إعادة التشكيل','reshape','ترتيب العناصر نفسها بشكل آخر، صفاً بعد صف.'],
['البث','broadcasting','تمديد الموتر الأصغر تلقائياً ليوافق شكل الأكبر في العمليات.'],
['القيمة المفقودة','missing value (NaN)','خانة لا قيمة فيها.'],
['الإكمال','imputation','ملء القيم المفقودة بتقدير معقول كالمتوسط.'],
['الترميز الأحادي','one-hot / dummy','تحويل عمود فئوي إلى أعمدة ٠/١، عمود لكل فئة.'],
['ضرب هادامار','Hadamard product (⊙)','ضرب عنصر بعنصر لموترين بالشكل نفسه.'],
['الاختزال','reduction','تقليل المحاور بالجمع أو المتوسط على محور.'],
['الضرب النقطي','dot product','مجموع حواصل ضرب العناصر المتقابلة؛ يقيس التوافق.'],
['ضرب المصفوفات','matrix multiplication','كل عنصر ناتج = ضرب نقطي لصف في عمود.'],
['المعيار','norm','عدد يقيس حجم المتجه: ℓ₂ الطول، ℓ₁ مجموع القيم المطلقة.'],
['التشابه بجيب التمام','cosine similarity','الضرب النقطي مقسوماً على حاصل ضرب الطولين؛ بين −١ و١.'],
['القيمة الذاتية','eigenvalue','معامل مطّ اتجاه لا يغيّره الضرب في المصفوفة.'],
['المشتقة','derivative','ميل الدالة: تغيّر المخرج مقسوماً على تغيّر صغير جداً في المدخل.'],
['التدرّج','gradient (∇)','متجه المشتقات الجزئية؛ يشير إلى أسرع صعود.'],
['قاعدة السلسلة','chain rule','مشتقة الدالة المركّبة = حاصل ضرب المشتقات على الطريق.'],
['الرسم الحسابي','computational graph','سجل العمليات من المدخلات إلى الخسارة.'],
['الانتشار العكسي','backpropagation','المشي على الرسم إلى الخلف لحساب التدرّج.'],
['فصل القيمة','detach','قطع القيمة عن الرسم لتُعامل كثابت.'],
['اليعقوبية','Jacobian','جدول مشتقات كل مخرج بالنسبة لكل مدخل.'],
['التوزيع المشترك','joint distribution','احتمال قيم متغيرين معاً.'],
['الاحتمال الشرطي','conditional probability','P(A|B): احتمال A إذا علمنا أن B وقع.'],
['قاعدة بايز','Bayes\' theorem','تحديث احتمال الفرضية بعد الدليل.'],
['التوقع','expectation','المتوسط الموزون بالاحتمالات.'],
['التباين','variance','متوسط مربع البعد عن التوقع.'],
['الخطأ المعياري','standard error','الانحراف المعياري للتقدير؛ √(p(1−p)/n) للنسبة.']];
initPage(SECS,GL);

/* ---------- 1.1 reshape ---------- */
let tsSel=null;
function drawTS(){
  const raw=segVal('#tsS','s').split(',').map(Number);let shape=raw.slice(),err='';
  if(shape.includes(-1)){const known=shape.filter(v=>v!==-1).reduce((a,b)=>a*b,1);if(12%known){err=`12 ÷ ${known} = ${(12/known).toFixed(2)} is not a whole number → RuntimeError: shape '[${raw.join(', ')}]' is invalid for input of size 12`}else shape=shape.map(v=>v===-1?12/known:v)}
  if(err){$('#tsOut').innerHTML='';$('#tsCalc').textContent=`x.reshape(${raw.join(', ')})\n${err}`;return}
  const st=[];let acc=1;for(let k=shape.length-1;k>=0;k--){st[k]=acc;acc*=shape[k]}
  const idxOf=n=>shape.map((d,k)=>Math.floor(n/st[k])%d);
  let html='';
  if(shape.length===1)html=lab('x  '+shp(shape),grid([Array.from({length:12},(_,i)=>i)],(i,j)=>tsSel===j?'h':'',{click:1}));
  else if(shape.length===2)html=lab('X  '+shp(shape),grid(Array.from({length:shape[0]},(_,i)=>Array.from({length:shape[1]},(_,j)=>i*shape[1]+j)),(i,j)=>tsSel===i*shape[1]+j?'h':'',{click:1}));
  else html=Array.from({length:shape[0]},(_,b)=>lab(`[${b}, :, :]`,grid(Array.from({length:shape[1]},(_,i)=>Array.from({length:shape[2]},(_,j)=>b*shape[1]*shape[2]+i*shape[2]+j)),(i,j)=>tsSel===b*shape[1]*shape[2]+i*shape[2]+j?'h':'',{click:1}))).join('');
  if(shape.length===2&&shape[0]===4&&shape[1]===3){
    const T=[[0,4,8],[1,5,9],[2,6,10],[3,7,11]];html+=lab('compare: X.reshape(3,4).T  (4, 3)',grid(T,(i,j)=>T[i][j]===tsSel?'h':'m'))}
  $('#tsOut').innerHTML=html;
  $$('#tsOut .tgrid.click i').forEach(c=>c.onclick=()=>{tsSel=+c.textContent;drawTS()});
  let t=`x.reshape(${raw.join(', ')})  →  shape ${shp(shape)}   ndim = ${shape.length}   numel = ${shape.join('×')} = 12`;
  if(raw.includes(-1))t+=`\n-1 inferred: 12 ÷ ${raw.filter(v=>v!==-1).join('×')} = ${shape[raw.indexOf(-1)]}`;
  if(tsSel!==null)t+=`\nvalue ${tsSel} sits at index [${idxOf(tsSel).join(', ')}]  (memory position ${tsSel}, row-major)`;
  else t+=`\nclick a cell to see its index`;
  $('#tsCalc').textContent=t;
}
segOn('#tsS',drawTS);drawTS();

/* ---------- 1.1 broadcasting ---------- */
const BC=[
 {a:[[0,1,2,3],[4,5,6,7],[8,9,10,11]],sa:[3,4],b:[100,200,300,400],sb:[4],op:'+',na:'X',nb:'v'},
 {a:[[0],[1],[2]],sa:[3,1],b:[[0,1]],sb:[1,2],op:'+',na:'a',nb:'b'},
 {a:[[1,2],[3,4],[5,6]],sa:[3,2],b:[[1,2,3],[4,5,6]],sb:[2,3],op:'+',na:'A',nb:'B'},
 {a:[[1],[2],[3]],sa:[3,1],b:[1,2,3],sb:[3],op:'−',na:'y_hat',nb:'y'}];
function drawBC(){
  const c=BC[+segVal('#bcS','i')];
  const A2=c.sa.length===1?[c.a]:c.a, B2=c.sb.length===1?[c.b]:c.b;
  const sa=c.sa.length===1?[1,...c.sa]:c.sa, sb=c.sb.length===1?[1,...c.sb]:c.sb;
  const lines=[`align shapes from the right:`,`  ${c.na}: ${shp(c.sa).padStart(8)}`,`  ${c.nb}: ${shp(c.sb).padStart(8)}`];
  const out=[];let ok=true;
  for(let k=0;k<2;k++){const p=sa[k],q=sb[k];const pad=(k===0&&(c.sa.length===1||c.sb.length===1));
    if(p===q)out.push(p);else if(p===1||q===1)out.push(Math.max(p,q));else{ok=false;out.push('✗')}
    lines.push(`  axis ${k-2}: ${p} vs ${q}${pad&&(c.sa.length===1?' (missing in '+c.na+' → 1)':' (missing in '+c.nb+' → 1)')||''} → ${p===q?'equal':(p===1||q===1)?'stretch the 1':'MISMATCH'}`)}
  if(!ok){lines.push(`RuntimeError: The size of tensor a (${c.sa[c.sa.length-1]}) must match the size of tensor b (${c.sb[c.sb.length-1]}) at non-singleton dimension 1`);
    $('#bcOut').innerHTML=lab(`${c.na} ${shp(c.sa)}`,grid(A2))+lab(`${c.nb} ${shp(c.sb)}`,grid(B2));$('#bcCalc').textContent=lines.join('\n');return}
  const R=out[0],C=out[1];
  const ga=(i,j)=>A2[sa[0]===1?0:i][sa[1]===1?0:j], gb=(i,j)=>B2[sb[0]===1?0:i][sb[1]===1?0:j];
  const res=Array.from({length:R},(_,i)=>Array.from({length:C},(_,j)=>c.op==='+'?ga(i,j)+gb(i,j):ga(i,j)-gb(i,j)));
  const EA=Array.from({length:R},(_,i)=>Array.from({length:C},(_,j)=>ga(i,j))),EB=Array.from({length:R},(_,i)=>Array.from({length:C},(_,j)=>gb(i,j)));
  const stA=(i,j)=>(sa[0]===1&&i>0)||(sa[1]===1&&j>0)?'x':'', stB=(i,j)=>(sb[0]===1&&i>0)||(sb[1]===1&&j>0)?'x':'';
  $('#bcOut').innerHTML=lab(`${c.na} stretched`,grid(EA,stA))+`<div style="align-self:center;font-size:22px">${c.op}</div>`+lab(`${c.nb} stretched`,grid(EB,stB))+`<div style="align-self:center;font-size:22px">=</div>`+lab(`result ${shp([R,C])}`,grid(res,(i,j)=>c===BC[3]&&i!==j?'h':'g'));
  lines.push(`result shape: ${shp([R,C])}   (faded cells = copies made by broadcasting)`);
  if(c===BC[3]){const mse=res.flat().reduce((s,v)=>s+v*v,0)/9;lines.push(`predictions equal the labels, yet mean((y_hat − y)²) = ${mse.toFixed(3)} ≠ 0  ← silent bug`,`fix: y_hat.reshape(-1) − y  → [0, 0, 0]`)}
  $('#bcCalc').textContent=lines.join('\n');
}
segOn('#bcS',drawBC);drawBC();

/* ---------- 1.2 preprocessing ---------- */
const RAW=[['NA','NA',127500],[2,'NA',106000],[4,'Slate',178100],['NA','NA',140000]];
function drawPP(){
  const k=+segVal('#ppS','i');let head,rows,calc;const nan='<span style="color:var(--rose)">NaN</span>';
  if(k===0){head=['','NumRooms','RoofType','Price'];rows=RAW.map((r,i)=>[i,r[0]==='NA'?nan:r[0].toFixed(1),r[1]==='NA'?nan:r[1],r[2]]);calc=`pd.read_csv(...)  → 4 rows × 3 columns;  "NA" became NaN (missing)`}
  else if(k===1){head=['','NumRooms','RoofType','║','Price (target)'];rows=RAW.map((r,i)=>[i,r[0]==='NA'?nan:r[0].toFixed(1),r[1]==='NA'?nan:r[1],'║',r[2]]);calc=`inputs  = data.iloc[:, 0:2]   (columns 0 and 1)\ntargets = data.iloc[:, 2]     (column 2)`}
  else if(k===2){head=['','NumRooms','RoofType_Slate','RoofType_nan'];rows=RAW.map((r,i)=>[i,r[0]==='NA'?nan:r[0].toFixed(1),r[1]==='Slate'?'True':'False',r[1]==='NA'?'True':'False']);calc=`get_dummies(dummy_na=True): one 0/1 column per category, "missing" is its own category`}
  else if(k===3){head=['','NumRooms','RoofType_Slate','RoofType_nan'];rows=RAW.map((r,i)=>[i,r[0]==='NA'?'<b style="color:var(--amber)">3.0</b>':r[0].toFixed(1),r[1]==='Slate'?'True':'False',r[1]==='NA'?'True':'False']);calc=`mean of known NumRooms = (2 + 4) / 2 = 3.0  → fills rows 0 and 3`}
  else{head=['X[:, 0]','X[:, 1]','X[:, 2]','║','y'];rows=RAW.map(r=>[r[0]==='NA'?3:r[0],r[1]==='Slate'?1:0,r[1]==='NA'?1:0,'║',r[2]].map(v=>typeof v==='number'?v+'.':v));calc=`X = torch.tensor(...)  shape (4, 3), dtype float64\ny = torch.tensor(...)  shape (4,)   → ready for a model`}
  $('#ppTab').innerHTML='<tr>'+head.map(h=>`<th>${h}</th>`).join('')+'</tr>'+rows.map(r=>'<tr>'+r.map(v=>`<td class="num">${v}</td>`).join('')+'</tr>').join('');
  $('#ppCalc').textContent=calc;
}
segOn('#ppS',drawPP);drawPP();

/* ---------- 1.3 reductions ---------- */
const RA=[[0,1,2],[3,4,5]];
function drawRD(){
  const a=segVal('#rdS','a');let html,calc;
  if(a==='all'){html=lab('A (2, 3)',grid(RA,()=> 'g'))+`<div style="align-self:center;font-size:22px">→</div>`+lab('shape ()',grid([[15]],()=>'h'));calc='A.sum() = 0+1+2+3+4+5 = 15   → a scalar, shape ()'}
  else if(a==='0'){html=lab('A (2, 3)  ↓ sum each column',grid(RA,(i,j)=>['g','m','h'][j]))+`<div style="align-self:center;font-size:22px">→</div>`+lab('shape (3,)',grid([[3,5,7]],(i,j)=>['g','m','h'][j]));calc='A.sum(axis=0): collapse axis 0 (rows)\n[0+3, 1+4, 2+5] = [3, 5, 7]   shape (3,)'}
  else if(a==='1'){html=lab('A (2, 3)  → sum each row',grid(RA,(i)=>['g','h'][i]))+`<div style="align-self:center;font-size:22px">→</div>`+lab('shape (2,)',grid([[3,12]],(i,j)=>['g','h'][j]))+lab('keepdims=True (2, 1)',grid([[3],[12]],(i)=>['g','h'][i]));calc='A.sum(axis=1): collapse axis 1 (columns)\n[0+1+2, 3+4+5] = [3, 12]   shape (2,)\nwith keepdims=True: [[3], [12]]   shape (2, 1)'}
  else{const N=RA.map(r=>{const s=r.reduce((p,q)=>p+q,0);return r.map(v=>v/s)});html=lab('A',grid(RA))+`<div style="align-self:center;font-size:22px">/</div>`+lab('sum (2, 1)',grid([[3],[12]],()=> 'h'))+`<div style="align-self:center;font-size:22px">=</div>`+lab('each row sums to 1',grid(N,()=> 'g'));
    calc='(2, 3) / (2, 1) → the column of sums is broadcast across each row\nrow 0: [0/3, 1/3, 2/3] = [0, 0.333, 0.667]   sum = 1\nrow 1: [3/12, 4/12, 5/12] = [0.25, 0.333, 0.417]   sum = 1\nwithout keepdims: (2, 3) / (2,) → error here; on a square matrix it would silently divide columns'}
  $('#rdOut').innerHTML=html;$('#rdCalc').textContent=calc;
}
segOn('#rdS',drawRD);drawRD();

/* ---------- 1.3 matrix products ---------- */
const MA=[[0,1,2],[3,4,5]],MX=[0,1,2],MB=[[1,0],[2,1],[0,3]];let mmSel=[0,0];
function drawMM(){
  const m=segVal('#mmS','m');const B=m==='v'?MX.map(v=>[v]):MB;const C=B[0].length;
  const P=MA.map(r=>Array.from({length:C},(_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
  let [si,sj]=mmSel;if(sj>=C)sj=0;
  $('#mmOut').innerHTML=lab('A (2, 3)',grid(MA,i=>i===si?'h':''))+`<div style="align-self:center;font-size:22px">×</div>`+lab(m==='v'?'x (3,)':'B (3, 2)',grid(B,(i,j)=>j===sj?'m':''))+`<div style="align-self:center;font-size:22px">=</div>`+lab(m==='v'?'Ax (2,)':'AB (2, 2)',grid(P,(i,j)=>i===si&&j===sj?'g':'',{click:1}));
  $$('#mmOut .tgrid.click i').forEach(c=>c.onclick=()=>{mmSel=[+c.dataset.i,+c.dataset.j];drawMM()});
  const terms=MA[si].map((v,k)=>`${v}×${B[k][sj]}`).join(' + ');
  $('#mmCalc').textContent=`${m==='v'?'(Ax)':'(AB)'}[${si}${m==='v'?'':', '+sj}] = row ${si} of A · ${m==='v'?'x':'column '+sj+' of B'}\n  = ${terms} = ${P[si][sj]}\nshapes: (2, 3) × ${m==='v'?'(3,)':'(3, 2)'} → ${m==='v'?'(2,)':'(2, 2)'}   inner sizes must match (3 = 3)\ncost ≈ 2·m·k·n = 2·2·3·${C} = ${12*C} operations`;
}
segOn('#mmS',drawMM);drawMM();

/* ---------- 1.3 norms & cosine ---------- */
function drawNM(){
  const x=[+$('#nx1').value,+$('#nx2').value],y=[+$('#ny1').value,+$('#ny2').value];
  const W=300,H=300,c=150,s=26,P=v=>[c+v[0]*s,c-v[1]*s];
  let g=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:300px;height:auto;direction:ltr;display:block;margin:6px auto"><defs><marker id="nmA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--green)"/></marker><marker id="nmB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--amber)"/></marker></defs>`;
  for(let k=-5;k<=5;k++){g+=`<line x1="${c+k*s}" x2="${c+k*s}" y1="${c-5*s}" y2="${c+5*s}" stroke="var(--rule)" stroke-width="${k?1:1.6}"/><line y1="${c+k*s}" y2="${c+k*s}" x1="${c-5*s}" x2="${c+5*s}" stroke="var(--rule)" stroke-width="${k?1:1.6}"/>`}
  const [x1,x2]=P(x),[y1,y2]=P(y);
  if(x[0]||x[1])g+=`<line x1="${c}" y1="${c}" x2="${x1}" y2="${x2}" stroke="var(--green)" stroke-width="3" marker-end="url(#nmA)"/><text x="${x1+6}" y="${x2-6}" font-size="14" fill="var(--green)">x</text>`;
  if(y[0]||y[1])g+=`<line x1="${c}" y1="${c}" x2="${y1}" y2="${y2}" stroke="var(--amber)" stroke-width="3" marker-end="url(#nmB)"/><text x="${y1+6}" y="${y2-6}" font-size="14" fill="var(--amber)">y</text>`;
  $('#nmPlot').innerHTML=g+'</svg>';
  const l2=v=>Math.hypot(v[0],v[1]),l1=v=>Math.abs(v[0])+Math.abs(v[1]),dot=x[0]*y[0]+x[1]*y[1];
  let t=`x = (${x}),  y = (${y})\n‖x‖₂ = √(${x[0]<0?"("+x[0]+")":x[0]}² + ${x[1]<0?"("+x[1]+")":x[1]}²) = ${l2(x).toFixed(3)}     ‖x‖₁ = |${x[0]}| + |${x[1]}| = ${l1(x)}\n‖y‖₂ = ${l2(y).toFixed(3)}     ‖y‖₁ = ${l1(y)}\nx·y = ${x[0]}×${y[0]} + ${x[1]<0?"("+x[1]+")":x[1]}×${y[1]<0?"("+y[1]+")":y[1]} = ${dot}`;
  if(l2(x)&&l2(y)){const cs=dot/(l2(x)*l2(y));t+=`\ncos θ = x·y / (‖x‖‖y‖) = ${dot} / (${l2(x).toFixed(3)}×${l2(y).toFixed(3)}) = ${cs.toFixed(3)}   →  θ ≈ ${(Math.acos(Math.max(-1,Math.min(1,cs)))*180/Math.PI).toFixed(1)}°`+(Math.abs(cs)<1e-9?'   (orthogonal)':'')}
  else t+='\ncos θ undefined: a zero vector has no direction';
  $('#nmCalc').textContent=t;
}
['#nx1','#nx2','#ny1','#ny2'].forEach(id=>$(id).addEventListener('input',drawNM));drawNM();

/* ---------- 1.3 eigen growth ---------- */
function drawEG(){
  const k=+$('#egK').value;$('#egKo').textContent=k;
  const lg=v=>Math.log10(v);
  plot($('#egPlot'),{xmin:0,xmax:100,ymin:-5,ymax:5,yt:[-4,-2,0,2,4],ytf:v=>'10^'+v,xt:[0,25,50,75,100],xl:'layers k',yl:'factor (log scale)',
    curves:[{f:t=>lg(Math.pow(1.1,t)),c:'var(--rose)'},{f:t=>lg(Math.pow(0.9,t)),c:'var(--math)'}],
    lines:[{pts:[[k,-5],[k,5]],c:'var(--amber)',dash:1}],pts:[{x:k,y:lg(Math.pow(1.1,k)),c:'var(--rose)',t:'1.1^k'},{x:k,y:lg(Math.pow(0.9,k)),c:'var(--math)',t:'0.9^k'}]});
  $('#egCalc').textContent=`after k = ${k} layers:\n  direction with λ = 1.1:  1.1^${k} = ${Math.pow(1.1,k).toPrecision(4)}   (explodes)\n  direction with λ = 0.9:  0.9^${k} = ${Math.pow(0.9,k).toPrecision(4)}   (vanishes)\n  ratio between them: ${(Math.pow(1.1/0.9,k)).toPrecision(3)}`;
}
$('#egK').addEventListener('input',drawEG);drawEG();document.addEventListener('themechange',drawEG);

/* ---------- 1.4 derivative as a limit ---------- */
const fq=x=>3*x*x-4*x;
function drawDV(){
  const x0=+$('#dvX').value,e=+$('#dvH').value,h=Math.pow(10,-e);$('#dvXo').textContent=x0.toFixed(1);$('#dvHo').textContent='-'+e;
  const slope=6*x0-4,sec=(fq(x0+h)-fq(x0))/h;
  plot($('#dvPlot'),{xmin:-0.5,xmax:3.5,ymin:-3,ymax:15,yt:[0,5,10,15],xt:[0,1,2,3],xl:'x',yl:'f(x)',
    curves:[{f:fq,c:'var(--green)'},{f:t=>fq(x0)+slope*(t-x0),c:'var(--amber)',w:1.6,dash:1}],
    lines:[{pts:[[x0-2,fq(x0)-2*sec],[x0+2,fq(x0)+2*sec]],c:'var(--math)',w:1.4}],
    pts:[{x:x0,y:fq(x0),c:'var(--amber)',t:'tangent slope '+fmt(slope)},{x:x0+h,y:fq(x0+h),c:'var(--math)',r:3.5}]});
  let rows='h          (f(x+h) − f(x)) / h\n';
  for(let k=1;k<=5;k++){const hh=Math.pow(10,-k);rows+=`${hh.toFixed(k).padEnd(10)} ${((fq(x0+hh)-fq(x0))/hh).toFixed(5)}${k===e?'   ← current h (blue secant)':''}\n`}
  $('#dvCalc').textContent=rows+`exact: f′(x) = 6x − 4 = 6×${fmt(x0)} − 4 = ${fmt(slope)}   (amber tangent)\nthe gap shrinks like 3h: secant − exact = ${(sec-slope).toPrecision(3)}`;
}
['#dvX','#dvH'].forEach(id=>$(id).addEventListener('input',drawDV));drawDV();document.addEventListener('themechange',drawDV);

/* ---------- 1.5 computational graph ---------- */
const AX=[[1,0],[1,1],[1,2]],AY=[1,1,0];let AW,AG,ANB,AN;
function adReset(){AW=[1,0];AG=null;ANB=0;AN=0;drawAD()}
function adFwd(w){const yh=AX.map(r=>r[0]*w[0]+r[1]*w[1]),r=yh.map((v,i)=>v-AY[i]),s=r.map(v=>v*v);return{yh,r,s,L:s.reduce((a,b)=>a+b,0)}}
function drawAD(){
  const f=adFwd(AW),g=[AX.reduce((a,row,i)=>a+row[0]*2*f.r[i],0),AX.reduce((a,row,i)=>a+row[1]*2*f.r[i],0)];
  const F=v=>fmt(+v.toFixed(4));
  const rows=[['w (leaf, requires_grad)',`(${AW.map(F).join(', ')})`,AG?`w.grad = (${AG.map(F).join(', ')})`:'w.grad = None'],
    ['ŷ = X @ w',`(${f.yh.map(F).join(', ')})`,'∂L/∂ŷ = 2r = ('+f.r.map(v=>F(2*v)).join(', ')+')'],
    ['r = ŷ − y',`(${f.r.map(F).join(', ')})`,'∂L/∂r = 2r'],['s = r ⊙ r',`(${f.s.map(F).join(', ')})`,'∂L/∂s = (1, 1, 1)'],['L = s.sum()',F(f.L),'∂L/∂L = 1']];
  $('#adTab').innerHTML='<tr><th>node (forward ↓)</th><th>value</th><th>gradient (backward ↑)</th></tr>'+rows.map(r=>`<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td></tr>`).join('');
  let t=`X = [[1,0],[1,1],[1,2]]   y = (1, 1, 0)   step ${AN}\nL(w) = ${F(f.L)}\nX⊤(2r) = (${g.map(F).join(', ')})   ← the true gradient at this w`;
  if(ANB>1)t+=`\n⚠ backward() called ${ANB}× without zero_(): w.grad = ${ANB} × (${g.map(F).join(', ')}) — gradients accumulate`;
  $('#adCalc').textContent=t;
}
$('#adBack').onclick=()=>{const f=adFwd(AW),g=[AX.reduce((a,row,i)=>a+row[0]*2*f.r[i],0),AX.reduce((a,row,i)=>a+row[1]*2*f.r[i],0)];AG=AG?AG.map((v,i)=>v+g[i]):g;ANB++;drawAD()};
$('#adZero').onclick=()=>{if(AG)AG=[0,0];ANB=0;drawAD()};
$('#adStep').onclick=()=>{if(!AG){$('#adCalc').textContent+='\n→ call backward() first: there is no gradient yet';return}AW=AW.map((v,i)=>v-0.1*AG[i]);AN++;const L=adFwd(AW).L;drawAD();$('#adCalc').textContent+=`\nwith torch.no_grad(): w -= 0.1 * w.grad   → new loss ${fmt(+L.toFixed(4))}${ANB>1?'  (step used the accumulated, too-large gradient)':''}\nnow zero_() then backward() again`};
$('#adReset').onclick=adReset;adReset();

/* ---------- 1.5 control flow ---------- */
function drawCF(){
  const a=+$('#cfA').value;$('#cfAo').textContent=a.toFixed(2);
  if(a===0){$('#cfCalc').textContent='a = 0: b stays 0, the loop never reaches 1000 → infinite loop!\n(that is why the book samples a at random)';return}
  let b=a*2,n=1;while(Math.abs(b)<1000){b*=2;n++}
  const pos=b>0,c=pos?b:100*b,k=c/a;
  $('#cfCalc').textContent=`b = a × 2 = ${fmt(a*2)}\nloop: doubled ${n} times in total → b = a × 2^${n} = ${fmt(+b.toFixed(3))}   (|b| ≥ 1000)\nb.sum() ${pos?'> 0 → c = b':'≤ 0 → c = 100 × b'}\nc = ${fmt(+c.toFixed(3))} = ${k} × a\nautograd: dc/da = ${k}   (the slope of the path that actually ran)`;
}
$('#cfA').addEventListener('input',drawCF);drawCF();

/* ---------- 1.6 coin tosses ---------- */
let ctSeed=7;
function drawCT(){
  const n=+segVal('#ctN','n'),R=rng(ctSeed);let h=0;const pts=[];const step=Math.max(1,Math.floor(n/300));
  for(let i=1;i<=n;i++){if(R()<0.5)h++;if(i%step===0||i===n)pts.push([i,h/i])}
  const se=Math.sqrt(0.25/n),p=h/n;
  plot($('#ctPlot'),{xmin:0,xmax:n,ymin:0,ymax:1,yt:[0,0.25,0.5,0.75,1],xt:[0,n/2,n].map(Math.round),xl:'tosses',yl:'running share of heads',
    lines:[{pts:[[0,0.5+2*se],[n,0.5+2*se]],c:'var(--soft)',dash:1,w:1},{pts:[[0,0.5-2*se],[n,0.5-2*se]],c:'var(--soft)',dash:1,w:1},{pts:[[0,0.5],[n,0.5]],c:'var(--amber)',w:1.4},{pts,c:'var(--green)',w:2}]});
  $('#ctCalc').textContent=`heads = ${h} of ${n}   p̂ = ${p.toFixed(4)}\nstandard error = √(0.5×0.5/${n}) = ${se.toFixed(4)}   (dashed lines: 0.5 ± 2 SE)\np̂ is ${(Math.abs(p-0.5)/se).toFixed(2)} standard errors from 0.5`;
}
segOn('#ctN',drawCT);$('#ctGo').onclick=()=>{ctSeed++;drawCT()};drawCT();document.addEventListener('themechange',drawCT);

/* ---------- 1.6 joint table ---------- */
const JT={ru:0.25,rn:0.05,nu:0.10,nn:0.60};
function drawJT(){
  const q=segVal('#jtS','q');const hi=(k)=>({j:[],m:[],c:['ru','rn'],i:['ru']}[q].includes(k)?' style="background:var(--amber-soft)"':'');
  const pr=JT.ru+JT.rn,pu=JT.ru+JT.nu;
  const marg=q==='m'||q==='i';
  $('#jtTab').innerHTML=`<tr><th></th><th>مظلة</th><th>بلا مظلة</th>${marg?'<th>الهامشي</th>':''}</tr>
   <tr><th>مطر</th><td class="num"${hi('ru')}>0.25</td><td class="num"${hi('rn')}>0.05</td>${marg?`<td class="num"><b>${pr.toFixed(2)}</b></td>`:''}</tr>
   <tr><th>بلا مطر</th><td class="num"${hi('nu')}>0.10</td><td class="num"${hi('nn')}>0.60</td>${marg?`<td class="num"><b>${(1-pr).toFixed(2)}</b></td>`:''}</tr>
   ${marg?`<tr><th>الهامشي</th><td class="num"><b>${pu.toFixed(2)}</b></td><td class="num"><b>${(1-pu).toFixed(2)}</b></td><td class="num">1.00</td></tr>`:''}`;
  $('#jtCalc').textContent={j:'P(rain, umbrella) = 0.25   … the four cells sum to 1.00',
    m:`P(rain) = 0.25 + 0.05 = ${pr.toFixed(2)}\nP(umbrella) = 0.25 + 0.10 = ${pu.toFixed(2)}`,
    c:`P(umbrella | rain) = P(rain, umbrella) / P(rain) = 0.25 / ${pr.toFixed(2)} = ${(JT.ru/pr).toFixed(3)}\n(compare P(umbrella) = ${pu.toFixed(2)}: knowing it rains changes a lot)`,
    i:`independent would need P(rain, umbrella) = P(rain) × P(umbrella)\n0.25  vs  ${pr.toFixed(2)} × ${pu.toFixed(2)} = ${(pr*pu).toFixed(3)}   → NOT independent`}[q];
}
segOn('#jtS',drawJT);drawJT();

/* ---------- 1.6 Bayes ---------- */
function drawBS(){
  const p=+$('#bsP').value/100,fp=+$('#bsF').value/100,two=$('#bs2').checked;$('#bsPo').textContent=(+$('#bsP').value).toFixed(2);$('#bsFo').textContent=$('#bsF').value;
  const N=100000,sick=N*p,well=N-sick;
  const s1=1.0,s2=0.98,f2=0.03;
  const tp=sick*s1*(two?s2:1),fpN=well*fp*(two?f2:1),post=tp/(tp+fpN);
  $('#bsOut').innerHTML=bar('مصابون وإيجابيون',tp,Math.max(tp,fpN),Math.round(tp).toLocaleString('ar-EG'),'var(--green)')+bar('أصحاء وإيجابيون خطأً',fpN,Math.max(tp,fpN),Math.round(fpN).toLocaleString('ar-EG'),'var(--rose)');
  const pD=p*s1*(two?s2:1)+(1-p)*fp*(two?f2:1);
  $('#bsCalc').textContent=`out of ${N.toLocaleString()} people: ${fmt(+sick.toFixed(1))} infected, ${fmt(+well.toFixed(1))} healthy\n`+
   (two?`both tests positive: P(D1,D2|H=1) = 1.00×0.98 = 0.98   P(D1,D2|H=0) = ${fp}×0.03 = ${(fp*0.03).toPrecision(3)}\n`:`test positive: P(D|H=1) = 1.00   P(D|H=0) = ${fp}\n`)+
   `P(D) = ${(two?0.98:1)}×${p} + ${(two?fp*0.03:fp).toPrecision(3)}×${(1-p).toFixed(4)} = ${pD.toPrecision(6)}\nP(infected | positive) = ${(p*(two?0.98:1)).toPrecision(4)} / ${pD.toPrecision(6)} = ${post.toFixed(4)}  ≈ ${(post*100).toFixed(1)}%`;
}
['#bsP','#bsF','#bs2'].forEach(id=>$(id).addEventListener('input',drawBS));drawBS();

/* ---------- 1.6 expectation & variance ---------- */
function drawEV(){
  let a=+$('#evA').value,c=+$('#evC').value;if(a+c>1){c=+(1-a).toFixed(2);$('#evC').value=c}
  const b=+(1-a-c).toFixed(2),X=[0,2,10],P=[a,b,c];
  const E=X.reduce((s,x,i)=>s+x*P[i],0),E2=X.reduce((s,x,i)=>s+x*x*P[i],0),V=E2-E*E;
  $('#evOut').innerHTML=X.map((x,i)=>bar('×'+x,P[i],1,P[i].toFixed(2),['var(--rose)','var(--amber)','var(--green)'][i])).join('');
  $('#evCalc').textContent=`P = (${P.map(v=>v.toFixed(2)).join(', ')})  for outcomes (0, 2, 10)\nE[X]  = 0×${a.toFixed(2)} + 2×${b.toFixed(2)} + 10×${c.toFixed(2)} = ${E.toFixed(2)}\nE[X²] = 0 + 4×${b.toFixed(2)} + 100×${c.toFixed(2)} = ${E2.toFixed(2)}\nVar   = E[X²] − E[X]² = ${E2.toFixed(2)} − ${(E*E).toFixed(2)} = ${V.toFixed(2)}    σ = √Var = ${Math.sqrt(Math.max(0,V)).toFixed(2)}`;
}
['#evA','#evC'].forEach(id=>$(id).addEventListener('input',drawEV));drawEV();
