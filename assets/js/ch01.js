const $=(s,r=document)=>r.querySelector(s);
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* TOC */
const SECS=[['s0','','افتتاحية الفصل'],['s1-1','1.1','ما النموذج اللغوي الكبير؟'],['s1-2','1.2','ماذا تتعلم من التنبؤ؟'],['s1-3','1.3','الشبكات العصبية والتضمينات'],['s1-4','1.4','تاريخ موجز'],['s1-5','1.5','البنية اللغوية والتفسير'],['s1-6','1.6','كيف تُدرَّب النماذج'],['s1-7','1.7','الاستدلال'],['s1-8','1.8','الوكلاء'],['s1-9','1.9','التقييم'],['s1-10','1.10','الأمان والمواءمة'],['s1-11','1.11','الأنسنة والمصطلحات'],['ex','','التمارين والمسرد']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=[...document.querySelectorAll('#toc a')];
function onScroll(){
  const h=document.documentElement;const p=h.scrollTop/(h.scrollHeight-h.clientHeight);$('#prog').style.width=(p*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur));
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* bars helper */
function bars(el,items,pick){
  const mx=Math.max(...items.map(i=>i[1]),0.0001);
  el.innerHTML=items.map(([w,p])=>`<div class="br ${w===pick?'pick':''}"><span class="w0">${esc(w)}</span><div class="tr"><div class="fl" style="width:${p/mx*100}%"></div></div><span class="v">${p.toFixed(2)}</span></div>`).join('');
}

/* probability distribution */
const PD0=[['all',.44],['the',.33],['your',.15],['that',.08]];
let PD=PD0.map(x=>x.slice());
function drawPD(){bars($('#pdBars'),PD);const s=PD.reduce((a,x)=>a+x[1],0);$('#pdSum').textContent=PD.map(x=>x[1].toFixed(2)).join(' + ')+' = '+s.toFixed(2)}
$('#pdTweak').onclick=()=>{ // move mass to 'all', renormalise others
  const add=Math.min(.1,1-PD[0][1]-.01);if(add<=0)return;
  const rest=PD.slice(1).reduce((a,x)=>a+x[1],0);
  PD=PD.map((x,i)=>i===0?[x[0],x[1]+add]:[x[0],Math.max(0,x[1]-add*x[1]/rest)]);drawPD()};
$('#pdReset').onclick=()=>{PD=PD0.map(x=>x.slice());drawPD()};
drawPD();

/* number line sampling */
const NLC=['var(--amber-soft)','var(--green-soft)','var(--math-soft)','var(--rose-soft)'];
let tally={};
function drawNL(r){
  let x=0;let h='';PD0.forEach(([w,p],i)=>{h+=`<div class="seg" style="width:${p*100}%;background:${NLC[i]}">${w}</div>`});
  let ticks=[0];PD0.forEach(([,p])=>{x+=p;ticks.push(x)});
  h+=ticks.map(t=>`<span class="tick" style="left:${t*100}%">${t.toFixed(2)}</span>`).join('');
  if(r!=null)h+=`<span class="mark" style="left:${r*100}%" data-v="${r.toFixed(3)}"></span>`;
  $('#nl').innerHTML=h;
  $('#nlTally').innerHTML=PD0.map(([w])=>`<span>${w}: ${tally[w]||0}</span>`).join('')+`<span style="color:var(--soft)">total: ${Object.values(tally).reduce((a,b)=>a+b,0)}</span>`;
}
function pickNL(r){let c=0;for(const [w,p] of PD0){c+=p;if(r<c)return w}return PD0[PD0.length-1][0]}
$('#nlOne').onclick=()=>{const r=Math.random();const w=pickNL(r);tally[w]=(tally[w]||0)+1;drawNL(r);$('#nlMsg').textContent=`الرقم ${r.toFixed(3)} وقع في قطعة «${w}»`};
$('#nl100').onclick=()=>{let r;for(let i=0;i<100;i++){r=Math.random();const w=pickNL(r);tally[w]=(tally[w]||0)+1}drawNL(r);$('#nlMsg').textContent='١٠٠ رمية إضافية'};
$('#nlClr').onclick=()=>{tally={};drawNL();$('#nlMsg').textContent=''};
drawNL();

/* autoregressive stepper */
const AR_STEPS=[{d:[['all',.44],['the',.33],['your',.15],['that',.08]],pick:'all'},{d:[['the',.77],['your',.17],['our',.04],['of',.02]],pick:'the'},{d:null,pick:'fish'}];
let arI=0;
function drawAR(){
  const base='So long and thanks for';const gen=AR_STEPS.slice(0,arI).map(s=>s.pick);
  $('#arCtx').innerHTML=esc(base)+gen.map(g=>` <span class="gen">${g}</span>`).join('')+' <span style="color:var(--soft)">?</span>';
  const s=AR_STEPS[arI];
  if(s&&s.d){bars($('#arBars'),s.d);$('#arNote').textContent=arI===0?'هذا التوزيع للسياق الأصلي. اضغط ليختار النموذج كلمة ويضيفها.':'السياق صار أطول، فتغيّر التوزيع كله: the الآن ٠٫٧٧.'}
  else if(s){$('#arBars').innerHTML='';$('#arNote').textContent='الكتاب لا يعطي أرقام هذه الخطوة. لكن الجملة المشهورة تكتمل بـ fish (وسيستخدمها الكتاب في القسم ١٫٩٫٢).'}
  else{$('#arBars').innerHTML='';$('#arNote').textContent='اكتملت الجملة. كل كلمة أُضيفت صارت جزءاً من السياق للكلمة التي بعدها.'}
  $('#arNext').disabled=arI>=AR_STEPS.length;
}
$('#arNext').onclick=()=>{const s=AR_STEPS[arI];if(s&&s.d)bars($('#arBars'),s.d,s.pick);setTimeout(()=>{arI++;drawAR()},s&&s.d?450:0)};
$('#arReset').onclick=()=>{arI=0;drawAR()};
drawAR();

/* scaling */
function fmtX(v){return v>=100?Math.round(v).toLocaleString('en'):v>=10?v.toFixed(1):v.toFixed(2)}
function fmtBig(v){return v>=1e12?(v/1e12).toFixed(1)+' T':v>=1e9?(v/1e9).toFixed(1)+' B':(v/1e6).toFixed(0)+' M'}
function drawSC(){const k=Math.pow(10,+$('#scK').value);const s=Math.sqrt(k);
  $('#scKo').textContent='× '+fmtX(k);$('#scC').textContent='× '+fmtX(k);$('#scN').textContent='× '+fmtX(s);$('#scD').textContent='× '+fmtX(s);
  $('#scNx').textContent='1 B → '+fmtBig(1e9*s);$('#scDx').textContent='20 B → '+fmtBig(2e10*s)}
$('#scK').addEventListener('input',drawSC);drawSC();

/* weighted sum */
const X=[1,0.5,2];let W=[0.8,-1,0.5],B=0.2;
$('#wsSliders').innerHTML=[0,1,2].map(i=>`<label class="note">w${i+1} = <b class="mono" id="wso${i}"></b><br><input type="range" min="-2" max="2" step="0.1" value="${W[i]}" id="ws${i}"></label>`).join('')+`<label class="note">b = <b class="mono" id="wsob"></b><br><input type="range" min="-2" max="2" step="0.1" value="${B}" id="wsb"></label>`;
function drawWS(){W=[0,1,2].map(i=>+$('#ws'+i).value);B=+$('#wsb').value;
  [0,1,2].forEach(i=>$('#wso'+i).textContent=W[i].toFixed(1));$('#wsob').textContent=B.toFixed(1);
  const parts=W.map((w,i)=>w*X[i]);const z=parts.reduce((a,b)=>a+b,0)+B;
  $('#wsCalc').textContent=`z = (${W[0].toFixed(1)} × 1) + (${W[1].toFixed(1)} × 0.5) + (${W[2].toFixed(1)} × 2) + ${B.toFixed(1)}\n  = ${parts.map(p=>p.toFixed(2)).join(' + ')} + ${B.toFixed(1)}\n  = ${z.toFixed(2)}`}
document.querySelectorAll('#wsSliders input').forEach(i=>i.addEventListener('input',drawWS));drawWS();

/* embedding map */
const EMB=[['حلو',2,8],['عسل',1.3,8.9],['عصير',3,7.1],['حلوى',1.1,7.3],['سكر',2.4,9.3],['كعكة',3.4,8.5],['مالح',7.4,3.3],['مقلي',8.5,2.5],['شوربة',6.5,1.9],['دجاج',7.9,1.2],['بطاطس',8.9,3.8]];
let embSel=[];
function drawEmb(){
  const S=30,O=20,H=10*S+O*2;const px=x=>O+x*S, py=y=>H-O-y*S;
  let svg=`<svg class="map" viewBox="0 0 ${H} ${H}" role="img" aria-label="خريطة كلمات ثنائية الأبعاد">`;
  for(let i=0;i<=10;i++){svg+=`<line x1="${px(i)}" y1="${py(0)}" x2="${px(i)}" y2="${py(10)}" stroke="var(--rule)" stroke-width="${i%5?0.5:1}"/><line x1="${px(0)}" y1="${py(i)}" x2="${px(10)}" y2="${py(i)}" stroke="var(--rule)" stroke-width="${i%5?0.5:1}"/>`}
  [0,5,10].forEach(i=>{svg+=`<text x="${px(i)}" y="${py(0)+14}" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${i}</text><text x="${px(0)-8}" y="${py(i)+3}" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${i}</text>`});
  if(embSel.length===2){const a=EMB[embSel[0]],b=EMB[embSel[1]];
    svg+=`<line x1="${px(a[1])}" y1="${py(a[2])}" x2="${px(b[1])}" y2="${py(a[2])}" stroke="var(--math)" stroke-dasharray="4 3"/><line x1="${px(b[1])}" y1="${py(a[2])}" x2="${px(b[1])}" y2="${py(b[2])}" stroke="var(--math)" stroke-dasharray="4 3"/><line x1="${px(a[1])}" y1="${py(a[2])}" x2="${px(b[1])}" y2="${py(b[2])}" stroke="var(--rose)" stroke-width="2.5"/>`}
  EMB.forEach(([w,x,y],i)=>{const on=embSel.includes(i);const sweet=i<6;
    svg+=`<g class="pt" data-i="${i}" tabindex="0" role="button" aria-label="${w}"><circle cx="${px(x)}" cy="${py(y)}" r="${on?7:5}" fill="${on?'var(--rose)':(sweet?'var(--amber)':'var(--green)')}"/><text x="${px(x)}" y="${py(y)-10}" font-size="15" text-anchor="middle" fill="var(--ink)" font-weight="${on?700:500}">${w}</text></g>`});
  $('#embMap').innerHTML=svg+'</svg>';
  document.querySelectorAll('#embMap .pt').forEach(g=>{const f=()=>{const i=+g.dataset.i;if(embSel.length>=2)embSel=[];if(!embSel.includes(i))embSel.push(i);drawEmb()};g.onclick=f;g.onkeydown=e=>{if(e.key==='Enter')f()}});
  const out=$('#embOut');
  if(embSel.length===0)out.innerHTML='اختر الكلمة الأولى.';
  else if(embSel.length===1){const a=EMB[embSel[0]];out.innerHTML=`«${a[0]}» عند النقطة <span class="ltr mono">(${a[1]}, ${a[2]})</span>. اختر الكلمة الثانية.`}
  else{const a=EMB[embSel[0]],b=EMB[embSel[1]];const dx=b[1]-a[1],dy=b[2]-a[2];const d=Math.hypot(dx,dy);
    out.innerHTML=`<b>«${a[0]}» و«${b[0]}»</b><div class="calc" style="margin-top:6px">Δx = ${b[1]} − ${a[1]} = ${dx.toFixed(1)}
Δy = ${b[2]} − ${a[2]} = ${dy.toFixed(1)}
Δx² + Δy² = ${(dx*dx).toFixed(2)} + ${(dy*dy).toFixed(2)} = ${(dx*dx+dy*dy).toFixed(2)}
distance = √${(dx*dx+dy*dy).toFixed(2)} = ${d.toFixed(2)}</div><p class="note" style="margin:6px 0 0">${d<2.5?'مسافة صغيرة: معنيان متقاربان.':d<5?'مسافة متوسطة.':'مسافة كبيرة: معنيان بعيدان.'} الخطان المتقطعان هما Δx وΔy، والأحمر هو المسافة.</p>`}
}
drawEmb();

/* pretraining knowledge cards */
const PK=[['مع الورد والداليا والفاوانيا، كنتُ محاطاً بـ ___','الأزهار','تصنيف المفاهيم: الورد والداليا والفاوانيا كلها أنواع من الأزهار.'],['لم تكن الغرفة كبيرة فقط، كانت ___','هائلة','درجات المعنى: «هائلة» على مقياس «كبيرة» نفسه، لكن أبعد.'],['الجذر التربيعي للعدد ٤ هو ___','٢','الرياضيات: لأن ٢ × ٢ = ٤.'],['مؤلفة كتاب «غرفة تخصّ المرء وحده» هي ___','فرجينيا وولف','حقائق عن العالم والأدب.'],['قال الأستاذ إنّـ ___','ـه (ضمير المذكر)','وهنا الخطر: إذا تكرر هذا كثيراً في التدريب، قد يربط النموذج «الأستاذ» بالذكور فقط، فيتعامل بظلم مع بعض الناس.']];
$('#pk').innerHTML=PK.map((p,i)=>`<button class="card reveal" data-i="${i}" aria-expanded="false">${p[0]}<span class="lesson">اضغط لترى الإجابة وما يتعلمه النموذج</span></button>`).join('');
document.querySelectorAll('#pk .reveal').forEach(b=>b.onclick=()=>{const p=PK[+b.dataset.i];b.innerHTML=`${p[0].replace('___',`<span class="ans">${p[1]}</span>`)}<span class="lesson">${p[2]}</span>`;b.setAttribute('aria-expanded','true')});

/* Shannon game */
const SG={ar:'خرج الصياد في الصباح الباكر الى البحر ليصطاد السمك',en:'THE ROOM WAS NOT VERY LIGHT A SMALL OBLONG READING LAMP ON THE DESK'};
let sgLang='ar',sgPos=0,sgRes=[];
const norm=c=>c.toUpperCase().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي');
function drawSG(){
  const t=Array.from(SG[sgLang]);const el=$('#sgText');el.className='sg-text'+(sgLang==='en'?' en':'');el.dir=sgLang==='en'?'ltr':'rtl';
  el.innerHTML=t.map((c,i)=>{const show=c===' '?(i<sgPos?'&nbsp;':'_'):esc(c);
    if(i<sgPos)return `<span class="${sgRes[i]}">${c===' '?'&nbsp;':esc(c)}</span>`;
    if(i===sgPos)return `<span class="cur">${c===' '?'_':'•'}</span>`;
    return `<span class="hid">${c===' '?'&nbsp;':'•'}</span>`}).join('');
  const n=sgRes.length,ok=sgRes.filter(r=>r==='ok').length;
  let first=[0,0],rest=[0,0];
  sgRes.forEach((r,i)=>{if(t[i]===' ')return;const start=i===0||t[i-1]===' ';const b=start?first:rest;b[1]++;if(r==='miss')b[0]++});
  const pct=(a)=>a[1]?Math.round(a[0]/a[1]*100)+'٪':'—';
  $('#sgStat').innerHTML=n?`أصبت ${AR(ok)} من ${AR(n)}. نسبة الأخطاء في <b>أول حرف من الكلمة</b>: ${AR(pct(first))}، وفي <b>بقية الحروف</b>: ${AR(pct(rest))}.${sgPos>=t.length?' <b>انتهى النص.</b>':''}`:'الأخضر: خمّنته صحيحاً. الأحمر: احتجت أن يُكشف لك.';
  $('#sgIn').disabled=sgPos>=t.length;$('#sgSkip').disabled=sgPos>=t.length;
}
function sgGuess(ch){const t=Array.from(SG[sgLang]);if(sgPos>=t.length)return;sgRes.push(ch!=null&&norm(ch)===norm(t[sgPos])?'ok':'miss');sgPos++;drawSG()}
$('#sgIn').addEventListener('input',e=>{const v=e.target.value;e.target.value='';if(v)sgGuess(v.slice(-1))});
$('#sgSkip').onclick=()=>{sgGuess(null);$('#sgIn').focus()};
$('#sgRe').onclick=()=>{sgPos=0;sgRes=[];drawSG()};
document.querySelectorAll('[data-sg]').forEach(b=>b.onclick=()=>{sgLang=b.dataset.sg;sgPos=0;sgRes=[];drawSG()});
drawSG();

/* timeline */
(function(){
  const A=1940,Z=2026,pos=y=>(y-A)/(Z-A)*100;
  const E=[[1945,1966,'الأسس الإحصائية والعصبية','var(--math-soft)','var(--math)'],[1965,1992,'التحول الرمزي','var(--rose-soft)','var(--rose)'],[1975,2017,'العودة الطويلة إلى التجريبية','var(--amber-soft)','var(--amber)'],[2019,2026,'التوجيه','var(--green-soft)','var(--green)']];
  let h=E.map(e=>`<div class="lane"><div class="era" style="left:${pos(e[0])}%;width:${pos(e[1])-pos(e[0])}%;background:${e[3]};color:${e[4]};border:1px solid ${e[4]}" title="${e[0]}–${e[1]}">${e[2]}</div></div>`).join('');
  h+=`<div class="axis">${[1940,1960,1980,2000,2020].map(y=>`<span>${y}</span>`).join('')}</div>`;
  $('#tl').innerHTML=h;
})();

/* inference steps */
const IDS=[27,17360,29,1608,553,261,10297,326,37082,29186,13,30985,4468,276,1151,326,20323,13,464,1428,29,15179,11955,392,976,54336,328,104807,69029];
const INF=[
 ['تجميع الموجّه','يُلصق موجّه النظام وأي محادثة سابقة قبل سؤالك:<div class="dlg">&lt;system&gt; You are a helpful and knowledgeable assistant. Answer concisely and correctly. &lt;user&gt; Who wrote "The Origin of Species"?</div>'],
 ['التقطيع إلى رموز','يُقسَّم النص إلى رموز، ويأخذ كل رمز <b>رقماً تعريفياً</b> هو موقعه في قائمة المفردات، كرقم الكلمة في فهرس قاموس. هذه أرقام الكتاب:<div class="chips" style="margin-top:8px">'+IDS.map(i=>`<span class="chip">${i}</span>`).join('')+'</div><p class="note" style="margin:6px 0 0">٢٩ رمزاً. الرقم مجرد عنوان: ١٧٣٦٠ ليس «أكبر» من ٢٧ في المعنى.</p>'],
 ['كل رمز يصبح تضميناً','يُستبدل كل رقم بمتجه تضمينه، وقد يكون فيه ٧٦٨ أو ١٠٢٤ بُعداً:<div class="calc" style="margin-top:6px">27    → [ 0.12, −0.48,  0.91, … ]   (768 numbers)\n17360 → [−0.33,  0.05,  1.20, … ]\n…</div><p class="note" style="margin:6px 0 0">الأرقام داخل المتجهات هنا للتوضيح.</p>'],
 ['التمرير عبر الشبكة','تمر سلسلة التضمينات عبر طبقات الشبكة العصبية، بأوزانها المدرّبة مسبقاً (القسم ١٫٦). لا يتغير أي وزن هنا.'],
 ['يخرج توزيع على الرمز التالي','كما في الشكل ١٫٢: احتمال لكل رمز في المفردات. بعد هذا السياق نتوقع أن تكون Charles عالية الاحتمال، أو ربما The.<div class="bars" style="margin-top:8px" id="infBars"></div><p class="note" style="margin:6px 0 0">الأرقام هنا توضيحية.</p>'],
 ['اختيار رمز','قد يكون الأعلى احتمالاً، أو رمزاً أقل احتمالاً بقليل، بحسب إعداد <b>الحرارة</b> <span class="en">(temperature)</span> الذي يشرحه الفصل ٧. هذا هو «أخذ العيّنة» الذي جربته في القسم ١٫١.'],
 ['الإضافة والعودة','يُضاف تضمين الرمز المختار إلى نهاية السلسلة، ونعود إلى الخطوة ٤ لنتنبأ بالرمز الذي بعده (Darwin).'],
 ['التوقف','تنتهي الحلقة حين يولّد النموذج رمزاً خاصاً معناه «نهاية الإجابة»، فيُعرض النص كاملاً للمستخدم.']];
let infI=0;
$('#infStp').innerHTML=INF.map((s,i)=>`<button data-i="${i}" aria-label="الخطوة ${i+1}">${i+1}</button>`).join('');
function drawInf(){
  document.querySelectorAll('#infStp button').forEach((b,i)=>{b.classList.toggle('on',i===infI);b.classList.toggle('done',i<infI)});
  $('#infBody').innerHTML=`<h4>${AR(infI+1)}. ${INF[infI][0]}</h4><div>${INF[infI][1]}</div>`;
  if(infI===4)bars($('#infBars'),[['Charles',.62],['The',.21],['Darwin',.09],['It',.03]]);
  $('#infPrev').disabled=infI===0;$('#infNext').disabled=infI===INF.length-1;
}
document.querySelectorAll('#infStp button').forEach(b=>b.onclick=()=>{infI=+b.dataset.i;drawInf()});
$('#infPrev').onclick=()=>{if(infI>0){infI--;drawInf()}};
$('#infNext').onclick=()=>{if(infI<INF.length-1){infI++;drawInf()}};
drawInf();

/* perplexity */
function drawPP(){const p=+$('#ppP').value,n=+$('#ppN').value;$('#ppPo').textContent=p.toFixed(2);$('#ppNo').textContent=n;
  const prod=Math.pow(p,n);const f=prod<1e-4?prod.toExponential(2):prod.toFixed(5);
  $('#ppCalc').textContent=`P(sentence) = ${p.toFixed(2)} × ${p.toFixed(2)} × … (${n} times) = ${p.toFixed(2)}^${n} = ${f}\nper-word probability = ${p.toFixed(2)}\nperplexity = 1 / ${p.toFixed(2)} = ${(1/p).toFixed(2)}   ← "choosing among ~${(1/p).toFixed(1)} equally likely words"`}
['#ppP','#ppN'].forEach(s=>$(s).addEventListener('input',drawPP));drawPP();

/* glossary */
const G=[['نموذج لغوي','language model','نظام يعطي كل كلمة تالية ممكنة احتمالاً.'],['رمز','token','كلمة أو جزء كلمة؛ الوحدة التي يعمل عليها النموذج.'],['توزيع احتمالي','probability distribution','احتمالات لكل النتائج الممكنة، مجموعها ١.'],['أخذ العيّنات','sampling','اختيار عشوائي يفضّل الأعلى احتمالاً.'],['ذاتي الانحدار / سببي','autoregressive / causal','يولّد من اليسار إلى اليمين بناءً على ما سبق.'],['معامل','parameter','رقم تتعلمه الشبكة؛ أوزان وانحيازات.'],['قوانين التوسّع','scaling laws','علاقة الأداء بالحجم والبيانات والحوسبة.'],['فرضية التوزيع','distributional hypothesis','الكلمات في سياقات متشابهة معانيها متشابهة.'],['التدريب المسبق','pretraining','تعلّم التنبؤ بالكلمة التالية على نص هائل.'],['توليد شرطي','conditional generation','توليد رموز بحسب احتمالها بشرط ما سبق.'],['شبكة عصبية','neural network','شبكة وحدات حساب تتعلم من البيانات.'],['تضمين','embedding','متجه أرقام يمثّل معنى رمز في سياقه.'],['قابلية التفسير','interpretability','كشف ما يحسبه النموذج داخلياً.'],['الضبط بالتعليمات','instruction tuning / SFT','تدريب على أزواج «تعليمة ← إجابة».'],['المواءمة بالتفضيلات','preference alignment','تدريب على إجابة مفضّلة وأخرى مرفوضة.'],['RLVR','RL with verifiable rewards','تعزيز بمكافأة على إجابات يمكن التحقق منها آلياً.'],['قليل الأمثلة','few-shot','موجّه فيه أمثلة محلولة.'],['موجّه النظام','system prompt','تعليمات أولية تُلصق قبل كلام المستخدم.'],['سلسلة التفكير','chain-of-thought','كتابة خطوات الحل قبل الجواب.'],['التعلم في السياق','in-context learning','تعلّم من الموجّه دون تغيير الأوزان.'],['وكيل','agent','نموذج يستدعي أدوات ليتصرف في العالم.'],['تلوّث البيانات','data contamination','تسرّب أسئلة الاختبار إلى بيانات التدريب.'],['الحيرة','perplexity','مقياس تنبؤ مستقل عن الطول؛ الأقل أفضل.'],['النموذج حَكَماً','LLM-as-a-judge','نموذج يقيّم مخرجات نموذج آخر.'],['مقياس تقريبي','proxy metric','معادلة سريعة تقرّب الحكم البشري.'],['التملّق','sycophancy','موافقة المستخدم وإطراؤه بإفراط.'],['حقن الموجّه','prompt injection','دسّ أوامر خبيثة في الموجّه أو البيانات.'],['الهلوسة','hallucination','توليد معلومات خاطئة أو مخترعة.'],['المعايرة','calibration','تطابق الثقة المعلنة مع الدقة الفعلية.'],['الأنسنة','anthropomorphism','نسبة صفات بشرية إلى غير البشر.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+G.map(g=>`<tr><td><b>${g[0]}</b></td><td class="en">${g[1]}</td><td>${g[2]}</td></tr>`).join('');
