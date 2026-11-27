/* D2L · Chapter 6 · Convolutional Neural Networks — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s6-1','6.1','من الكاملة الاتصال إلى الالتفاف'],['s6-2','6.2','الالتفاف على الصور'],['s6-3','6.3','الحشو والخطوة والتمدد'],['s6-4','6.4','القنوات المتعددة'],['s6-5','6.5','التجميع'],['s6-6','6.6','LeNet'],['ex','','الخلاصة والتمارين']];
const GL=[
['التكافؤ مع الإزاحة','translation equivariance','إزاحة المدخل تزيح المخرج بالقدر نفسه.'],
['الثبات أمام الإزاحة','translation invariance','إزاحة المدخل لا تغيّر المخرج.'],
['المحلية','locality','كل وحدة تعتمد على جوار صغير فقط.'],
['النواة / المرشِّح','kernel / filter','مصفوفة الأوزان الصغيرة المشتركة التي تمر على الصورة.'],
['الارتباط المتقاطع','cross-correlation','ضرب الرقعة في النواة وجمعها دون قلب النواة (ما تسميه المكتبات التفافاً).'],
['مصفوفة توبليتز','Toeplitz matrix','مصفوفة ثابتة على كل قطر.'],
['خريطة الخصائص','feature map','مخرج قناة واحدة من طبقة التفافية.'],
['المجال الاستقبالي','receptive field','منطقة المدخل التي تؤثر في عنصر ما.'],
['المجال الفعّال','effective receptive field','الجزء الذي يؤثر فعلاً، ويتركز في الوسط كالجرس.'],
['im2col','im2col','تحويل الالتفاف إلى ضرب مصفوفة واحد بجمع الرقع صفوفاً.'],
['الحشو','padding','إطار حول المدخل (أصفار أو انعكاس أو تكرار).'],
['الخطوة','stride','مقدار قفز النافذة بين موقعين.'],
['التمدد','dilation','المسافة بين أوزان النواة؛ الحجم الفعّال d(k−1)+1.'],
['التقطيع إلى رقع','patchify','التفاف خطوته تساوي حجم نواته فيقطّع الصورة رقعاً.'],
['القناة','channel','محور الخصائص عند كل بكسل (ألوان أو خرائط).'],
['الالتفاف 1×1','1×1 convolution','طبقة خطية على متجه القنوات عند كل بكسل.'],
['عنق الزجاجة','bottleneck','تقليل القنوات بـ1×1 قبل الالتفاف المكاني ثم إعادتها.'],
['تجميع العظمى / المتوسط','max / average pooling','تلخيص كل نافذة بأكبر قيمة أو بالمتوسط.'],
['التجميع الشامل','global pooling','تلخيص الخريطة كلها في رقم لكل قناة.'],
['التشويه بالاعتيان','aliasing','ضياع أو تشوه الإشارة السريعة عند الاعتيان بخطوة.'],
['LeNet','LeNet-5','شبكة ليكون الالتفافية (١٩٩٨) لقراءة الأرقام.'],
['التحيز الاستقرائي المكاني','spatial inductive bias','افتراض أن الجيران في المصفوفة جيران في الصورة.']];
initPage(SECS,GL);
const corr=(X,K)=>{const H=X.length-K.length+1,W=X[0].length-K[0].length+1,Y=[];for(let i=0;i<H;i++){Y.push([]);for(let j=0;j<W;j++){let s=0;for(let a=0;a<K.length;a++)for(let b=0;b<K[0].length;b++)s+=K[a][b]*X[i+a][j+b];Y[i].push(+s.toFixed(4))}}return Y};
const F=v=>Number.isInteger(v)?String(v):(+v.toFixed(2)).toString();
function pix(M,col,size=7){const C=M[0].length;return`<div style="display:inline-grid;grid-template-columns:repeat(${C},${size}px);gap:0;border:1px solid var(--rule)">${M.map(r=>r.map(v=>`<span style="width:${size}px;height:${size}px;background:${col(v)}"></span>`).join('')).join('')}</div>`}
const gray=v=>`color-mix(in srgb, var(--ink) ${Math.round(Math.max(0,Math.min(1,v))*100)}%, var(--paper))`;
const signed=(v,m)=>v>0?`color-mix(in srgb, var(--green) ${Math.round(Math.min(1,v/m)*100)}%, var(--paper))`:v<0?`color-mix(in srgb, var(--rose) ${Math.round(Math.min(1,-v/m)*100)}%, var(--paper))`:'var(--paper)';

/* ---------- 6.1 weight sharing ---------- */
const WSC=['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666','#1f78b4','#b2df8a','#fb9a99','#fdbf6f','#cab2d6','#ffff99','#8dd3c7'];
function drawWS(){
  const m=segVal('#wsS','v');let html=`<div style="display:inline-grid;grid-template-columns:repeat(8,26px);gap:2px;direction:ltr">`;
  for(let i=0;i<8;i++)for(let k=0;k<8;k++){const o=k-i;let c='';
    if(m==='a')c=`hsl(${(i*8+k)*47%360} 55% 60%)`;else if(m==='b')c=WSC[o+7];else c=Math.abs(o)<=1?WSC[o+7]:'transparent';
    html+=`<span style="width:26px;height:26px;border-radius:4px;border:1px solid var(--rule);background:${c}" title="W[${i},${k}]"></span>`}
  $('#wsOut').innerHTML=html+'</div>';
  $('#wsCalc').textContent={a:'every one of the 8 × 8 = 64 weights is free',b:'W[i+1, k+1] = W[i, k]: constant along each diagonal (Toeplitz)\none weight per offset a = k − i ∈ {−7, …, 7}: 15 free weights',c:'locality keeps only offsets −1, 0, 1: 3 shared weights in every row\n= one 3-tap kernel slid along the signal'}[m];
}
segOn('#wsS',drawWS);drawWS();

/* ---------- 6.2 convolution playground ---------- */
const CVX={book:[[0,1,2],[3,4,5],[6,7,8]],stripe:Array.from({length:6},()=>[1,1,0,0,0,0,1,1]),stripeT:null,plus:Array.from({length:8},(_,i)=>Array.from({length:8},(_,j)=>(i===3||i===4)&&j>=1&&j<=6||(j===3||j===4)&&i>=1&&i<=6?1:0))};
CVX.stripeT=CVX.stripe[0].map((_,j)=>CVX.stripe.map(r=>r[j]));
const CVK={book:[[0,1],[2,3]],edge:[[1,-1]],edgeT:[[1],[-1]],blur:[[1,1,1],[1,1,1],[1,1,1]].map(r=>r.map(v=>v/9)),lap:[[0,1,0],[1,-4,1],[0,1,0]]};
let cvShift=0,cvSel=[0,0];
function drawCV(){
  const xk=segVal('#cvX','v'),kk=segVal('#cvK','v');let X=CVX[xk].map(r=>r.slice());
  for(let s=0;s<cvShift;s++)X=X.map(r=>[r[0],...r.slice(0,-1)]);
  const K=CVK[kk];
  if(K.length>X.length||K[0].length>X[0].length){$('#cvOut').innerHTML='';$('#cvCalc').textContent='kernel larger than the image';return}
  const Y=corr(X,K);let [si,sj]=cvSel;if(si>=Y.length||sj>=Y[0].length){si=0;sj=0;cvSel=[0,0]}
  const inWin=(i,j)=>i>=si&&i<si+K.length&&j>=sj&&j<sj+K[0].length;
  const mY=Math.max(1e-9,...Y.flat().map(Math.abs));
  $('#cvOut').innerHTML=lab(`X ${X.length}×${X[0].length}`,grid(X,(i,j)=>inWin(i,j)?'h':''))+`<div style="align-self:center;font-size:22px">⋆</div>`+lab(`K ${K.length}×${K[0].length}`,grid(K.map(r=>r.map(v=>+v.toFixed(2))),()=>'m'))+`<div style="align-self:center;font-size:22px">=</div>`+
    lab(`Y ${Y.length}×${Y[0].length}`,grid(Y,(i,j)=>i===si&&j===sj?'h':Y[i][j]>0?'g':Y[i][j]<0?'m':'',{click:1}));
  $$('#cvOut .tgrid.click i').forEach(c=>c.onclick=()=>{cvSel=[+c.dataset.i,+c.dataset.j];drawCV()});
  const terms=[];for(let a=0;a<K.length;a++)for(let b=0;b<K[0].length;b++)terms.push(`${K[a][b]<0?"("+F(K[a][b])+")":F(K[a][b])}×${X[si+a][sj+b]}`);
  $('#cvCalc').textContent=`Y[${si}, ${sj}] = ${terms.join(' + ')} = ${F(Y[si][sj])}\noutput shape (${X.length} − ${K.length} + 1) × (${X[0].length} − ${K[0].length} + 1) = ${Y.length} × ${Y[0].length}`+(cvShift?`\ninput shifted right by ${cvShift}: the response pattern moves right by ${cvShift} too (equivariance)`:'');
}
segOn('#cvX',()=>{cvShift=0;drawCV()});segOn('#cvK',drawCV);$('#cvShift').onclick=()=>{cvShift=(cvShift+1)%3;drawCV()};drawCV();

/* ---------- 6.2 learning a kernel ---------- */
let lkSeed=1;
function drawLK(){
  const X=CVX.stripe,Y=corr(X,[[1,-1]]),R=rng(lkSeed);let k=[0.01*gauss(R),0.01*gauss(R)];const L=[],Ks=[k.slice()];
  for(let t=0;t<10;t++){let l=0,g0=0,g1=0;for(let i=0;i<6;i++)for(let j=0;j<7;j++){const e=k[0]*X[i][j]+k[1]*X[i][j+1]-Y[i][j];l+=e*e;g0+=2*e*X[i][j];g1+=2*e*X[i][j+1]}L.push(l);k=[k[0]-0.03*g0,k[1]-0.03*g1];Ks.push(k.slice())}
  const lg=Math.log10;
  plot($('#lkPlot'),{xmin:0,xmax:9,ymin:-4,ymax:2,yt:[-4,-2,0,2],ytf:v=>'10^'+v,xt:[0,3,6,9],xl:'step',yl:'loss (sum of squared errors)',H:200,
    lines:[{pts:L.map((v,i)=>[i,lg(Math.max(v,1e-4))]),c:'var(--green)'}],pts:L.map((v,i)=>({x:i,y:lg(Math.max(v,1e-4)),c:'var(--green)',r:3}))});
  $('#lkCalc').textContent=`loss by step: ${L.map(v=>v<0.01?v.toExponential(1):v.toFixed(2)).join(', ')}\nkernel: start (${Ks[0].map(v=>v.toFixed(3)).join(', ')}) → after 10 steps (${k.map(v=>v.toFixed(3)).join(', ')})   target (1, −1)`;
}
$('#lkGo').onclick=()=>{lkSeed++;drawLK()};drawLK();document.addEventListener('themechange',drawLK);

/* ---------- 6.2 receptive-field path counts ---------- */
function drawRF(){
  const L=+$('#rfL').value,k=+$('#rfK').value;$('#rfLo').textContent=L;$('#rfKo').textContent=k;
  let row=[1];const rows=[row];for(let l=0;l<L;l++){const nx=new Array(row.length+k-1).fill(0);row.forEach((v,i)=>{for(let a=0;a<k;a++)nx[i+a]+=v});row=nx;rows.push(row)}
  const mx=Math.max(...row);
  $('#rfOut').innerHTML=`<div dir="ltr" style="display:flex;align-items:flex-end;gap:2px;height:120px;overflow-x:auto">${row.map(v=>`<div style="flex:1;min-width:14px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%"><span style="font-size:10.5px;color:var(--soft);font-family:var(--f-mono)">${v}</span><span style="width:100%;height:${(v/mx*90).toFixed(0)}px;background:var(--green);border-radius:3px 3px 0 0;opacity:${(0.35+0.65*v/mx).toFixed(2)}"></span></div>`).join('')}</div>`;
  $('#rfCalc').textContent=`receptive field r = 1 + L(k − 1) = 1 + ${L}·${k-1} = ${row.length} inputs\npaths from each input to the top unit: ${row.length<=17?row.join(', '):row.slice(0,8).join(', ')+', …'}\ncentre/edge = ${mx}/1: the centre pixel has ${mx} routes, an edge pixel just one → bell-shaped effective field`;
}
['#rfL','#rfK'].forEach(id=>$(id).addEventListener('input',drawRF));drawRF();

/* ---------- 6.3 output-shape calculator ---------- */
function drawOS(){
  const n=+$('#osN').value,k=+$('#osK').value,p=+$('#osP').value,s=+$('#osS').value,d=+$('#osD').value;
  [['osNo',n],['osKo',k],['osPo',p],['osSo',s],['osDo',d]].forEach(([i,v])=>$('#'+i).textContent=v);
  const kp=d*(k-1)+1,N=n+2*p,out=Math.floor((n+2*p-d*(k-1)-1)/s)+1;
  const starts=[];for(let t=0;t+kp<=N;t+=s)starts.push(t);
  const taps=new Set(Array.from({length:k},(_,a)=>a*d));
  const cell=(i)=>{const pad=i<p||i>=p+n,first=taps.has(i);return`<span style="display:inline-grid;place-items:center;width:24px;height:24px;margin:1px;border-radius:4px;font-size:10px;font-family:var(--f-mono);border:1px solid ${first?'var(--amber)':'var(--rule)'};background:${first?'var(--amber-soft)':pad?'var(--tint)':'var(--paper)'};color:var(--soft)">${pad?'0':i-p}</span>`};
  const marks=Array.from({length:N},(_,i)=>`<span style="display:inline-block;width:24px;margin:0 1px;text-align:center;color:var(--green);font-size:12px">${starts.includes(i)?'▲':''}</span>`).join('');
  $('#osOut').innerHTML=`<div dir="ltr" style="white-space:nowrap">${Array.from({length:N},(_,i)=>cell(i)).join('')}</div><div dir="ltr" style="white-space:nowrap">${marks}</div>`;
  $('#osCalc').textContent=out>0?`⌊(n + 2p − d(k − 1) − 1)/s⌋ + 1 = ⌊(${n} + ${2*p} − ${d*(k-1)} − 1)/${s}⌋ + 1 = ⌊${n+2*p-d*(k-1)-1}/${s}⌋ + 1 = ${out}\neffective kernel size k′ = d(k − 1) + 1 = ${kp}   (amber: taps of the first window; grey: padding)\nwindow start positions (▲): ${starts.join(', ')}`+(p===(k-1)/2&&s===1&&d===1?'\np = (k − 1)/2 with stride 1: size preserved':''):`kernel (effective size ${kp}) does not fit in ${N} padded positions`;
}
['#osN','#osK','#osP','#osS','#osD'].forEach(id=>$(id).addEventListener('input',drawOS));drawOS();

/* ---------- 6.3 strided vs dilated towers ---------- */
function drawTW(){
  const m=segVal('#twS','v'),s=m==='s'?[2,2,1]:[1,1,1],d=m==='d'?[1,2,4]:[1,1,1];
  const P=[1];for(let i=0;i<3;i++)P.push(P[i]*s[i]);const g=[0,1,2].map(i=>d[i]*P[i]);
  const S=[[],[],[],[0]];for(let l=3;l>0;l--){const set=new Set();S[l].forEach(c=>[-1,0,1].forEach(t=>set.add(c+t*g[l-1])));S[l-1]=[...set].sort((a,b)=>a-b)}
  const W=520,H=210,xmin=-9,xmax=9,X=v=>20+(v-xmin)/(xmax-xmin)*(W-40),Y=l=>H-25-l*55;
  let svg=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:560px;height:auto;direction:ltr;display:block;margin:0 auto">`;
  for(let l=3;l>0;l--)S[l].forEach(c=>[-1,0,1].forEach(t=>{const c2=c+t*g[l-1];svg+=`<line x1="${X(c)}" y1="${Y(l)}" x2="${X(c2)}" y2="${Y(l-1)}" stroke="var(--math)" stroke-width="1.2" opacity=".7"/>`}));
  for(let l=0;l<=3;l++){for(let v=xmin;v<=xmax;v++){if(v%P[l]!==0)continue;const on=S[l].includes(v);svg+=`<circle cx="${X(v)}" cy="${Y(l)}" r="${on?6:4}" fill="${on?(l===3?'var(--amber)':'var(--green)'):'var(--paper)'}" stroke="${on?'none':'var(--rule)'}"/>`}
    svg+=`<text x="4" y="${Y(l)+4}" font-size="11" fill="var(--soft)">${l?'L'+l:'in'}</text>`}
  $('#twOut').innerHTML=svg+'</svg>';
  const r=1+[0,1,2].reduce((a,i)=>a+2*g[i],0);
  $('#twCalc').textContent=`kernel 3 in every layer; strides (${s}) dilations (${d})\neach layer widens the view by (k − 1)·d·(product of earlier strides) = ${g.map(v=>2*v).join(' + ')}\nreceptive field r = 1 + ${g.map(v=>2*v).join(' + ')} = ${r} inputs`+(m==='s'?'\nlayers keep every 2nd, then every 4th position (hollow = not computed)':m==='d'?'\nsame wiring, but every position is computed at every layer':'');
}
segOn('#twS',drawTW);drawTW();document.addEventListener('themechange',drawTW);

/* ---------- 6.4 red vs green at equal luminance ---------- */
(function(){
  const n=6,Rc=[1,0,0],Gc=[0,0.509,0],img=Array.from({length:n},()=>Array.from({length:n},(_,j)=>j<3?Rc:Gc));
  const lum=img.map(r=>r.map(c=>+(0.299*c[0]+0.587*c[1]+0.114*c[2]).toFixed(3))),rg=img.map(r=>r.map(c=>+(c[0]-c[1]).toFixed(3)));
  const eGray=corr(lum,[[1,-1]]),eRG=corr(rg,[[1,-1]]);
  const rgb=`<div style="display:inline-grid;grid-template-columns:repeat(${n},22px);gap:1px">${img.flat().map(c=>`<span style="width:22px;height:22px;border-radius:3px;background:rgb(${c.map(v=>Math.round(v*255)).join(',')})"></span>`).join('')}</div>`;
  $('#rgOut').innerHTML=lab('RGB image',rgb)+lab('grayscale → [1, −1]',grid(eGray.map(r=>r.map(v=>+v.toFixed(2)))))+lab('1×1 conv: R − G → [1, −1]',grid(eRG.map(r=>r.map(v=>+v.toFixed(2))),(i,j)=>eRG[i][j]?'g':''));
  $('#rgCalc').textContent=`red (1, 0, 0) and green (0, 0.509, 0) have the same luminance 0.299R + 0.587G + 0.114B = 0.299\ngrayscale edge detector: all zeros, no edge visible\nR − G per pixel = ${rg[0][0]} | ${rg[0][5]}  → the edge detector fires at the boundary: ${eRG[0][2]}`;
})();

/* ---------- 6.4 channel cost ---------- */
const CCC=[3,16,64,128,256,512];
function drawCC(){
  const ci=CCC[+$('#ccI').value],co=CCC[+$('#ccO').value],k=+$('#ccK').value,h=+$('#ccH').value;
  $('#ccIo').textContent=ci;$('#ccOo').textContent=co;$('#ccKo').textContent=k+'×'+k;$('#ccHo').textContent=h;
  const P=co*ci*k*k+co,M=h*h*co*ci*k*k,A=h*h*co;
  const b=Math.max(1,Math.round(Math.min(ci,co)/4)),PB=ci*b+b*b*k*k+b*co,MB=h*h*PB;
  const mx=Math.max(P,PB);
  $('#ccOut').innerHTML=bar('معاملات الطبقة',P,mx,P.toLocaleString(),'var(--rose)')+bar(`عنق زجاجة ${ci}→${b}→${b}→${co}`,PB,mx,PB.toLocaleString(),'var(--green)');
  $('#ccCalc').textContent=`parameters  cₒcᵢk² + cₒ = ${co}·${ci}·${k*k} + ${co} = ${P.toLocaleString()}\nmultiply-adds h·w·cₒcᵢk² = ${h}²·${(co*ci*k*k).toLocaleString()} ≈ ${M.toExponential(2)} per image\nactivations h·w·cₒ = ${A.toLocaleString()} per image  (${(A/P).toFixed(A/P<10?2:0)}× the parameters)\nbottleneck (1×1 to ${b}, ${k}×${k}, 1×1 back, no biases): ${PB.toLocaleString()} weights, ${(P/PB).toFixed(1)}× fewer`;
}
['#ccI','#ccO','#ccK','#ccH'].forEach(id=>$(id).addEventListener('input',drawCC));drawCC();

/* ---------- 6.5 pooling and shifts ---------- */
function drawPL(){
  const c=+$('#plC').value,r=+$('#plR').value;$('#plCo').textContent=c;$('#plRo').textContent=r;
  const X=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>i===r&&j===c?1:0));
  const mp=[0,1].map(a=>[0,1].map(b=>Math.max(X[2*a][2*b],X[2*a][2*b+1],X[2*a+1][2*b],X[2*a+1][2*b+1])));
  const ap=[0,1].map(a=>[0,1].map(b=>(X[2*a][2*b]+X[2*a][2*b+1]+X[2*a+1][2*b]+X[2*a+1][2*b+1])/4));
  const blk=(i,j)=>((i>>1)+(j>>1))%2?'m':'';
  $('#plOut').innerHTML=lab('feature map 4×4',grid(X,(i,j)=>X[i][j]?'h':blk(i,j)))+lab('max-pool 2×2, s=2',grid(mp,(i,j)=>mp[i][j]?'h':''))+lab('avg-pool 2×2, s=2',grid(ap,(i,j)=>ap[i][j]?'h':''))+lab('global max / avg',grid([[1,0.0625]],()=>'g'));
  $('#plCalc').textContent=`response at row ${r}, column ${c} → falls in pooling block (${r>>1}, ${c>>1})\nmax-pool keeps its full strength 1; avg-pool reports coverage 1/4 = 0.25\nglobal max = 1 and global average = 1/16 wherever the response sits (shaded blocks: the 2×2 pooling tiles)`;
}
['#plC','#plR'].forEach(id=>$(id).addEventListener('input',drawPL));drawPL();

/* ---------- 6.6 LeNet costs ---------- */
const LN=[['conv 5×5, 1→6',156,117600],['conv 5×5, 6→16',2416,240000],['dense 400→120',48120,48000],['dense 120→84',10164,10080],['dense 84→10',850,840]];
function drawLN(){
  const m=segVal('#lnS','v'),idx=m==='p'?1:2,T=LN.reduce((a,r)=>a+r[idx],0),mx=Math.max(...LN.map(r=>r[idx]));
  $('#lnOut').innerHTML=LN.map((r,i)=>bar(r[0],r[idx],mx,`${r[idx].toLocaleString()} · ${(r[idx]/T*100).toFixed(0)}%`,i<2?'var(--math)':'var(--amber)')).join('');
  const conv=LN[0][idx]+LN[1][idx];
  $('#lnCalc').textContent=`total ${m==='p'?'parameters':'multiply-adds per image'}: ${T.toLocaleString()}\nconvolutions: ${(conv/T*100).toFixed(0)}%   dense layers: ${(100-conv/T*100).toFixed(0)}%   first dense layer alone: ${(LN[2][idx]/T*100).toFixed(0)}%\nMLP of chapter 4 for comparison: 203,530 parameters, ≈ 203,000 multiply-adds`;
}
segOn('#lnS',drawLN);drawLN();

/* ---------- 6.6 shuffled pixels ---------- */
const TROU=(()=>{const P=Array.from({length:28},()=>new Array(28).fill(0));for(let c=8;c<=19;c++)for(let r=4;r<=6;r++)P[r][c]=1;for(let r=7;r<=24;r++){for(let c=8;c<=12;c++)P[r][c]=1;for(let c=15;c<=19;c++)P[r][c]=1}for(let r=7;r<=9;r++)for(let c=13;c<=14;c++)P[r][c]=1;return P})();
let shSeed=1;
function drawSH(){
  const R=rng(shSeed),perm=[...Array(784).keys()];for(let i=783;i>0;i--){const j=Math.floor(R()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
  const flat=TROU.flat(),sh=Array.from({length:28},(_,i)=>Array.from({length:28},(_,j)=>flat[perm[i*28+j]]));
  const e1=corr(TROU,[[1,-1]]),e2=corr(sh,[[1,-1]]);
  const nz=E=>E.flat().filter(v=>v).length,runs=E=>{let n=0;for(let j=0;j<E[0].length;j++){let cnt=0;for(let i=0;i<E.length;i++){if(E[i][j]){cnt++;if(cnt===10)n++}else cnt=0}}return n};
  $('#shOut').innerHTML=lab('image',pix(TROU,gray,6))+lab('edges [1, −1]',pix(e1,v=>signed(v,1),6))+lab('shuffled image',pix(sh,gray,6))+lab('edges of shuffled',pix(e2,v=>signed(v,1),6));
  $('#shCalc').textContent=`same 784 pixel values, same number of bright pixels (${flat.filter(v=>v).length})\nedge responses: original ${nz(e1)} non-zero, arranged in ${runs(e1)} vertical runs of 10+ (the outline)\nshuffled ${nz(e2)} non-zero, scattered: ${runs(e2)} such runs. A 5×5 kernel now reads 25 unrelated pixels.\nan MLP would not notice: the permutation just reorders the rows of its first weight matrix`;
}
$('#shGo').onclick=()=>{shSeed++;drawSH()};drawSH();
