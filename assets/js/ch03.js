/* Chapter 3 · N-gram Language Models — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fx=(v,d=4)=>{if(v===0)return '0';if(!isFinite(v))return '∞';const a=Math.abs(v);return a>=0.001||a===0?(+v.toFixed(d)).toString():v.toExponential(2)};

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s3-1','3.1','الـ N-grams'],['s3-2','3.2','التدريب والاختبار'],['s3-3','3.3','الحيرة'],['s3-4','3.4','أخذ العيّنات'],['s3-5','3.5','التعميم والإفراط'],['s3-6','3.6','التنعيم'],['s3-7','3.7','الإنتروبيا'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

function bars(el,items,pick,fmt){const mx=Math.max(...items.map(i=>i[1]),1e-12);
  el.innerHTML=items.map(([w,p])=>`<div class="br ${w===pick?'pick':''}" data-w="${esc(w)}"><span class="w0">${esc(w)}</span><div class="tr"><div class="fl" style="width:${p/mx*100}%"></div></div><span class="v">${fmt?fmt(p):fx(p,3)}</span></div>`).join('')}

/* ---------- 3.1 bigram lab ---------- */
const LABC={sam:'I am Sam\nSam I am\nI do not like green eggs and ham',
  sam2:'I am Sam\nSam I am\nI am Sam\nI do not like green eggs and Sam',
  ar:'ذهبت إلى السوق\nذهبت إلى المدرسة صباحا\nذهب أخي إلى السوق\nأحب السوق القديم\nأحب المدرسة'};
let L={};
function labTrain(){
  const lines=$('#labIn').value.split('\n').map(s=>s.trim()).filter(Boolean);
  const uni=new Map(),bi=new Map();let N=0;
  lines.forEach(l=>{const t=['<s>',...l.split(/\s+/),'</s>'];t.forEach(w=>{uni.set(w,(uni.get(w)||0)+1);N++});for(let i=1;i<t.length;i++){const k=t[i-1]+'\u0000'+t[i];bi.set(k,(bi.get(k)||0)+1)}});
  L={uni,bi,N,V:uni.size,types:[...uni.keys()]};
  const sel=$('#labPrev'),old=sel.value;
  sel.innerHTML=L.types.filter(w=>w!=='</s>').map(w=>`<option${w===old?' selected':''}>${esc(w)}</option>`).join('');
  if(!L.types.includes(old)){const pref=L.types.includes('am')?'am':'<s>';sel.value=pref}
  labParams();labDraw();
}
function labP(prev,w){
  const m=$('#labMode').value,c=L.bi.get(prev+'\u0000'+w)||0,cp=L.uni.get(prev)||0,cw=L.uni.get(w)||0;
  const k=+($('#labK')?.value??1),l1=+($('#labL')?.value??0.5);
  if(m==='mle')return {p:cp?c/cp:0,f:`P(${w}|${prev}) = C(${prev} ${w}) / C(${prev}) = ${c} / ${cp}`};
  if(m==='laplace')return {p:(c+1)/(cp+L.V),f:`P(${w}|${prev}) = (C(${prev} ${w}) + 1) / (C(${prev}) + V) = (${c} + 1) / (${cp} + ${L.V})`};
  if(m==='addk')return {p:(c+k)/(cp+k*L.V),f:`P(${w}|${prev}) = (${c} + ${k}) / (${cp} + ${k}×${L.V})`};
  if(m==='interp'){const pb=cp?c/cp:0,pu=cw/L.N;return {p:l1*pu+(1-l1)*pb,f:`P̂(${w}|${prev}) = λ1·P(${w}) + λ2·P(${w}|${prev})\n        = ${l1} × ${cw}/${L.N} + ${(+(1-l1).toFixed(2))} × ${c}/${cp}`}}
  if(m==='backoff'){if(c>0)return {p:c/cp,f:`S(${w}|${prev}) = C(${prev} ${w}) / C(${prev}) = ${c} / ${cp}     (bigram seen)`};return {p:0.4*cw/L.N,f:`S(${w}|${prev}) = 0.4 × C(${w}) / N = 0.4 × ${cw} / ${L.N}     (bigram unseen → back off)`}}
}
function labParams(){
  const m=$('#labMode').value,box=$('#labParams');
  if(m==='addk')box.innerHTML=`<label class="note">k = <b class="mono" id="labKo">0.5</b><br><input type="range" id="labK" min="0.01" max="1" step="0.01" value="0.5"></label>`;
  else if(m==='interp')box.innerHTML=`<label class="note">λ1 (unigram) = <b class="mono" id="labLo">0.5</b> &nbsp; λ2 (bigram) = <b class="mono" id="labL2">0.5</b><br><input type="range" id="labL" min="0" max="1" step="0.05" value="0.5"></label>`;
  else box.innerHTML='';
  $$('#labParams input').forEach(i=>i.addEventListener('input',labDraw));
}
let labPick=null;
function labDraw(){
  if($('#labKo'))$('#labKo').textContent=$('#labK').value;
  if($('#labLo')){$('#labLo').textContent=(+$('#labL').value).toFixed(2);$('#labL2').textContent=(1-$('#labL').value).toFixed(2)}
  const prev=$('#labPrev').value;$('#labPrevName').textContent=prev;
  const cands=L.types.filter(w=>w!=='<s>');
  const items=cands.map(w=>[w,labP(prev,w).p]).sort((a,b)=>b[1]-a[1]);
  if(!labPick||!cands.includes(labPick))labPick=items[0][0];
  bars($('#labBars'),items,labPick);
  $$('#labBars .br').forEach(r=>r.onclick=()=>{labPick=r.dataset.w;labDraw()});
  const r=labP(prev,labPick),sum=items.reduce((a,x)=>a+x[1],0);
  $('#labCalc').textContent=`${r.f}\n        = ${fx(r.p,4)}\n\nsum over all next words = ${fx(sum,4)}     (V = ${L.V} types, N = ${L.N} tokens incl. <s> and </s>)`;
  const m=$('#labMode').value;
  $('#labNote').textContent=m==='mle'?'الأزواج التي لم تظهر أبداً احتمالها صفر. جرّب «لابلاس» لترى كيف تأخذ نصيباً صغيراً.':m==='backoff'?'التراجع الغبي يعطي «درجات» لا احتمالات، فمجموعها لا يساوي ١.':m==='laplace'?'المجموع أقل قليلاً من ١ لأن الرمز <s> لا يظهر في القائمة (لا يأتي بعد أي كلمة)، لكنه محسوب في V كما يطلب التمرين.':'اضغط أي سطر لترى حسابه.';
}
$('#labIn').addEventListener('input',labTrain);['#labPrev','#labMode'].forEach(s=>$(s).addEventListener('change',()=>{if(s==='#labMode')labParams();labDraw()}));
$$('[data-lab]').forEach(b=>b.onclick=()=>{$('#labIn').value=LABC[b.dataset.lab];labPick=null;labTrain()});
$('#labIn').value=LABC.sam;labTrain();

/* ---------- Berkeley tables ---------- */
const BW=['i','want','to','eat','chinese','food','lunch','spend'];
const BC=[[5,827,0,9,0,0,0,2],[2,0,608,1,6,6,5,1],[2,0,4,686,2,0,6,211],[0,0,2,0,16,2,42,0],[1,0,0,0,0,82,1,0],[15,0,15,0,1,4,0,0],[2,0,0,0,0,1,0,0],[1,0,1,0,0,0,0,0]];
const BU=[2533,927,2417,746,158,1093,341,278],BV=1446;
let brView='count';
function brVal(i,j,k){const c=BC[i][j],u=BU[i];
  if(brView==='count')return c;if(brView==='mle')return c/u;if(brView==='lap')return (c+k)/(u+k*BV);return (c+k)*u/(u+k*BV)}
function brFmt(v){if(brView==='count')return String(v);if(brView==='cstar')return v>=10?Math.round(v):v>=1?v.toFixed(1):v.toPrecision(2);return v===0?'0':v>=0.01?v.toFixed(2).replace(/0$/,''):v.toPrecision(2)}
function brDraw(){
  $$('#brTabs button').forEach(b=>b.classList.toggle('pri',b.dataset.v===brView));
  const showK=brView==='lap'||brView==='cstar';
  if(showK&&!$('#brKs'))$('#brK').innerHTML=`<label class="note">k = <b class="mono" id="brKo">1</b> &nbsp;(١ = لابلاس، أقل = «أضف k»)<br><input type="range" id="brKs" min="0" max="1" step="0.01" value="1"></label>`,$('#brKs').addEventListener('input',brDraw);
  if(!showK)$('#brK').innerHTML='';
  const k=showK?+$('#brKs').value:0;if($('#brKo'))$('#brKo').textContent=k.toFixed(2);
  let t=`<table class="dp mat"><tr><th class="corner">↓ w<sub>n−1</sub> · w<sub>n</sub> →</th>${BW.map(w=>`<th>${w}</th>`).join('')}</tr>`;
  BW.forEach((w,i)=>{const row=BW.map((_,j)=>brVal(i,j,k)),mx=Math.max(...row);
    t+=`<tr><th>${w}</th>${row.map((v,j)=>{const zero=BC[i][j]===0,a=mx>0?Math.max(0.06,Math.log1p(v*100/mx)/Math.log1p(100)):0;
      return `<td class="${zero?'zero':''}" data-i="${i}" data-j="${j}" style="--a:${zero?0:a.toFixed(2)}">${brFmt(v)}</td>`}).join('')}</tr>`});
  t+=`<tr class="uni"><th>C(w)</th>${BU.map(u=>`<td>${u}</td>`).join('')}</tr></table>`;
  $('#brTable').innerHTML=t;
  $$('#brTable td[data-i]').forEach(td=>td.onclick=()=>{const i=+td.dataset.i,j=+td.dataset.j,c=BC[i][j],u=BU[i],a=BW[i],b=BW[j];
    $$('#brTable td.sel').forEach(x=>x.classList.remove('sel'));td.classList.add('sel');
    let s=`C(${a} ${b}) = ${c}     C(${a}) = ${u}     V = ${BV}\n`;
    if(brView==='count')s+=`"${b}" followed "${a}" ${c} times in the corpus.`;
    else if(brView==='mle')s+=`P(${b}|${a}) = ${c} / ${u} = ${fx(c/u,5)}`;
    else if(brView==='lap')s+=`P(${b}|${a}) = (${c} + ${k}) / (${u} + ${k}×${BV}) = ${fx((c+k)/(u+k*BV),5)}`;
    else{const cs=(c+k)*u/(u+k*BV);s+=`C*(${a} ${b}) = (${c} + ${k}) × ${u} / (${u} + ${k}×${BV}) = ${fx(cs,4)}${c?`\ndiscount d = C*/C = ${fx(cs/c,3)}`:''}`}
    $('#brCalc').textContent=s});
}
$$('#brTabs button').forEach(b=>b.onclick=()=>{brView=b.dataset.v;brDraw()});brDraw();

/* ---------- underflow ---------- */
function drawUF(){const p=+$('#ufP').value,n=+$('#ufN').value;$('#ufPo').textContent=p;$('#ufNo').textContent=n;
  let prod=1;for(let i=0;i<n;i++)prod*=p;const ls=n*Math.log(p),l10=n*Math.log10(p);
  $('#ufCalc').textContent=`product:   ${p} × ${p} × … (${n} times) = ${prod===0?'0   ← underflow! the computer gave up':prod.toExponential(3)}\nlog-sum:   ln ${p} + ln ${p} + … = ${n} × ${Math.log(p).toFixed(4)} = ${ls.toFixed(2)}\nmeaning:   the true product is about 10^${l10.toFixed(1)}`}
['#ufP','#ufN'].forEach(s=>$(s).addEventListener('input',drawUF));drawUF();

/* ---------- 3.3 perplexity of colours ---------- */
const COL=['red','green','blue'];
$('#ppSliders').innerHTML=COL.map((c,i)=>`<label class="note">P(${c}) = <b class="mono" id="ppo${i}"></b><br><input type="range" id="pps${i}" min="0.01" max="1" step="0.01" value="${[0.8,0.1,0.1][i]}"></label>`).join('');
function ppProbs(){const r=COL.map((_,i)=>+$('#pps'+i).value),s=r.reduce((a,b)=>a+b,0);return r.map(x=>x/s)}
function drawPP(){const p=ppProbs();COL.forEach((_,i)=>$('#ppo'+i).textContent=p[i].toFixed(3));
  const t=$('#ppTest').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const ps=t.map(w=>{const i=COL.indexOf(w);return i<0?0:p[i]});const P=ps.reduce((a,b)=>a*b,1),N=t.length;
  $('#ppCalc').textContent=N?`P(test) = ${ps.map(x=>x.toFixed(3)).join(' × ')} = ${fx(P,6)}\nN = ${N}\nperplexity = P^(-1/N) = ${fx(P,6)}^(-1/${N}) = ${P===0?'∞  (a word with probability 0: division by zero)':Math.pow(P,-1/N).toFixed(3)}`:'اكتب كلمات من: red green blue'}
COL.forEach((_,i)=>$('#pps'+i).addEventListener('input',drawPP));$('#ppTest').addEventListener('input',drawPP);
$$('[data-pp]').forEach(b=>b.onclick=()=>{b.dataset.pp.split(',').forEach((v,i)=>$('#pps'+i).value=v);drawPP()});drawPP();

/* ---------- 3.5 generator ---------- */
const SONNETS=`Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date;
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimm'd;
And every fair from fair sometime declines,
By chance or nature's changing course untrimm'd;
But thy eternal summer shall not fade,
Nor lose possession of that fair thou ow'st;
Nor shall Death brag thou wander'st in his shade,
When in eternal lines to time thou grow'st:
So long as men can breathe or eyes can see,
So long lives this, and this gives life to thee.
Let me not to the marriage of true minds
Admit impediments. Love is not love
Which alters when it alteration finds,
Or bends with the remover to remove.
O no! it is an ever-fixed mark
That looks on tempests and is never shaken;
It is the star to every wand'ring bark,
Whose worth's unknown, although his height be taken.
Love's not Time's fool, though rosy lips and cheeks
Within his bending sickle's compass come;
Love alters not with his brief hours and weeks,
But bears it out even to the edge of doom.
If this be error and upon me prov'd,
I never writ, nor no man ever lov'd.
My mistress' eyes are nothing like the sun;
Coral is far more red than her lips' red;
If snow be white, why then her breasts are dun;
If hairs be wires, black wires grow on her head.
I have seen roses damask'd, red and white,
But no such roses see I in her cheeks;
And in some perfumes is there more delight
Than in the breath that from my mistress reeks.
I love to hear her speak, yet well I know
That music hath a far more pleasing sound;
I grant I never saw a goddess go;
My mistress, when she walks, treads on the ground.
And yet, by heaven, I think my love as rare
As any she belied with false compare.
When, in disgrace with fortune and men's eyes,
I all alone beweep my outcast state,
And trouble deaf heaven with my bootless cries,
And look upon myself and curse my fate,
Wishing me like to one more rich in hope,
Featur'd like him, like him with friends possess'd,
Desiring this man's art and that man's scope,
With what I most enjoy contented least;
Yet in these thoughts myself almost despising,
Haply I think on thee, and then my state,
Like to the lark at break of day arising
From sullen earth, sings hymns at heaven's gate;
For thy sweet love remember'd such wealth brings
That then I scorn to change my state with kings.`;
let G={src:'shk',n:2,lines:[],tables:null,seq:[],done:false,lastR:null,lastDist:null};
const gTok=l=>(l.toLowerCase().match(/[\p{L}\p{M}'’-]+|[^\s\p{L}\p{M}'’-]/gu)||[]);
function gText(){return G.src==='shk'?SONNETS:G.src==='lab'?$('#labIn').value:$('#genIn').value}
function gTrain(){
  G.lines=gText().split('\n').map(s=>s.trim()).filter(Boolean).map(gTok).filter(t=>t.length);
  G.tables={};for(let n=1;n<=4;n++){const tb=new Map();G.lines.forEach(t=>{const pad=[...Array(n-1).fill('<s>'),...t,'</s>'];for(let i=n-1;i<pad.length;i++){const ctx=pad.slice(i-n+1,i).join(' ');if(!tb.has(ctx))tb.set(ctx,new Map());const m=tb.get(ctx);m.set(pad[i],(m.get(pad[i])||0)+1)}});G.tables[n]=tb}
  gReset();
}
function gDist(){const n=G.n,hist=[...Array(n-1).fill('<s>'),...G.seq].slice(G.seq.length+n-1-(n-1)),ctx=n>1?hist.slice(-(n-1)).join(' '):'';
  const m=G.tables[n].get(ctx);if(!m)return {ctx,items:[]};const tot=[...m.values()].reduce((a,b)=>a+b,0);
  return {ctx,items:[...m.entries()].map(([w,c])=>[w,c/tot]).sort((a,b)=>b[1]-a[1])}}
function gStep(){if(G.done)return;const d=gDist();if(!d.items.length){G.done=true;return}
  const r=Math.random();let c=0,pick=d.items[d.items.length-1][0];for(const [w,p] of d.items){c+=p;if(r<c){pick=w;break}}
  G.lastR=r;G.lastDist=d;
  if(pick==='</s>'||G.seq.length>=40)G.done=true;else G.seq.push(pick);gDraw(pick)}
function gReset(){G.seq=[];G.done=false;G.lastR=null;G.lastDist=null;gDraw()}
const NLC=['var(--amber-soft)','var(--green-soft)','var(--math-soft)','var(--rose-soft)'];
function gDraw(pick){
  $$('#genN button').forEach(b=>b.classList.toggle('on',+b.dataset.n===G.n));
  const out=G.seq.join(' ').replace(/ ([,.;:!?])/g,'$1');
  $('#genOut').innerHTML=(out?esc(out):'<span style="color:var(--soft)">&lt;s&gt;</span>')+(G.done?' <span style="color:var(--soft)">&lt;/s&gt;</span>':' <span style="color:var(--soft)">…</span>');
  const d=G.lastDist&&!pick?null:(pick?G.lastDist:gDist());
  const show=G.lastDist&&pick?G.lastDist:gDist();
  const top=show.items.slice(0,8),rest=show.items.slice(8).reduce((a,x)=>a+x[1],0);
  $('#genDistH').textContent=G.n===1?'التوزيع (unigram: لا سياق)':`التوزيع بعد السياق «${show.ctx.replace(/<s>/g,'⟨s⟩')}» ومسطرته التراكمية`;
  let x=0,h='';top.forEach(([w,p],i)=>{h+=`<div class="seg" style="width:${p*100}%;background:${NLC[i%4]}" title="${esc(w)} ${p.toFixed(3)}">${p>0.07?esc(w):''}</div>`;x+=p});
  if(rest>0)h+=`<div class="seg" style="width:${rest*100}%;background:var(--tint)">${rest>0.07?'…':''}</div>`;
  h+=`<span class="tick" style="left:0%">0</span><span class="tick" style="left:100%">1</span>`;
  if(pick&&G.lastR!=null)h+=`<span class="mark" style="left:${G.lastR*100}%" data-v="${G.lastR.toFixed(3)}"></span>`;
  $('#genNL').innerHTML=h;
  bars($('#genBars'),top.length?top:[['—',0]],pick);
  const nI=show.items.length;let note=nI===1?'كلمة واحدة ممكنة فقط في هذا السياق.':nI===2?'كلمتان ممكنتان في هذا السياق.':`${AR(nI)} ${nI%100>=3&&nI%100<=10?'كلمات ممكنة':'كلمة ممكنة'} في هذا السياق.`;
  if(pick)note=`الرقم العشوائي ${G.lastR.toFixed(3)} وقع في قطعة «${pick==='</s>'?'</s> (نهاية الجملة)':pick}». `+note;
  if(G.done&&G.seq.length>2){const s=' '+G.seq.join(' ')+' ';const copied=G.lines.some(t=>(' '+t.join(' ')+' ').includes(s));note+=copied?' <b>هذه الجملة منسوخة حرفياً من نص التدريب.</b>':' هذه الجملة غير موجودة حرفياً في نص التدريب.'}
  if(G.n>=3&&nI===1)note+=' النموذج «يحفظ» هنا.';
  $('#genNote').innerHTML=note;
  $('#genStep').disabled=$('#genAll').disabled=G.done;
}
$$('#genN button').forEach(b=>b.onclick=()=>{G.n=+b.dataset.n;gReset()});
$('#genStep').onclick=()=>gStep();
$('#genAll').onclick=()=>{let g=0;while(!G.done&&g++<60)gStep()};
$('#genNew').onclick=()=>{gReset();let g=0;while(!G.done&&g++<60)gStep()};
$$('[data-gen]').forEach(b=>b.onclick=()=>{G.src=b.dataset.gen;$('#genIn').hidden=G.src!=='own';if(G.src==='own'&&!$('#genIn').value)$('#genIn').value='اكتب هنا نصاً، كل جملة في سطر.';$$('[data-gen]').forEach(x=>x.classList.toggle('pri',x===b));gTrain()});
$('#genIn').addEventListener('input',gTrain);
$('[data-gen="shk"]').classList.add('pri');gTrain();

/* ---------- 3.7 horse race / entropy ---------- */
const HR={skew:[1/2,1/4,1/8,1/16,1/64,1/64,1/64,1/64],uni:Array(8).fill(1/8),sure:[0.93,0.01,0.01,0.01,0.01,0.01,0.01,0.01]};
const BOOKCODE=['0','10','110','1110','111100','111101','111110','111111'];
function huffman(p){const nodes=p.map((v,i)=>({p:v,i}));const codes=Array(p.length).fill('');let q=nodes.map(n=>({p:n.p,items:[n.i]}));
  while(q.length>1){q.sort((a,b)=>a.p-b.p);const a=q.shift(),b=q.shift();a.items.forEach(i=>codes[i]='1'+codes[i]);b.items.forEach(i=>codes[i]='0'+codes[i]);q.push({p:a.p+b.p,items:[...a.items,...b.items]})}return codes}
const frac=v=>{for(const d of [2,4,8,16,64]){const n=v*d;if(Math.abs(n-Math.round(n))<1e-9)return `${Math.round(n)}/${d}`}return v.toFixed(2)};
function drawHR(key){const p=HR[key];const codes=key==='skew'?BOOKCODE:key==='uni'?['000','001','010','011','100','101','110','111']:huffman(p);
  const H=-p.reduce((a,x)=>a+x*Math.log2(x),0),avg=p.reduce((a,x,i)=>a+x*codes[i].length,0);
  $('#hrTable').innerHTML='<tr><th>الحصان</th><th>p</th><th>−log₂ p (بِت)</th><th>الرمز</th></tr>'+p.map((x,i)=>`<tr><td>${AR(i+1)}</td><td class="num">${frac(x)}</td><td class="num">${(-Math.log2(x)).toFixed(2)}</td><td class="num">${codes[i]}</td></tr>`).join('');
  $('#hrCalc').textContent=`H = −Σ p·log₂ p = ${p.map(x=>`${frac(x)}×${(-Math.log2(x)).toFixed(2)}`).join(' + ')}\n  = ${H.toFixed(3)} bits\naverage code length = Σ p × length = ${avg.toFixed(3)} bits     (fixed 3-bit code: 3 bits)`;
  $$('[data-hr]').forEach(b=>b.classList.toggle('pri',b.dataset.hr===key))}
$$('[data-hr]').forEach(b=>b.onclick=()=>drawHR(b.dataset.hr));drawHR('skew');

/* ---------- glossary ---------- */
const GL=[['نموذج لغوي','language model','يعطي احتمالاً للكلمة التالية وللجملة.'],['N-gram','n-gram','تسلسل من n كلمة، أو نموذج ينظر n−1 كلمة للخلف.'],['bigram / trigram','bigram / trigram','كلمتان / ثلاث كلمات.'],['قاعدة السلسلة','chain rule','احتمال التسلسل = حاصل ضرب الاحتمالات الشرطية.'],['افتراض ماركوف','Markov assumption','الكلمة تعتمد على آخر كلمات قليلة فقط.'],['تقدير الإمكان الأعظم','MLE','الاحتمال = العدّ ÷ عدّ السياق.'],['التطبيع','normalize','القسمة على مجموع لتصير القيم احتمالات مجموعها ١.'],['التكرار النسبي','relative frequency','عدّ جزء ÷ عدّ الكل.'],['لوغاريتم الاحتمال','log probability','نجمع اللوغاريتمات بدل ضرب الاحتمالات.'],['تقييم خارجي / داخلي','extrinsic / intrinsic','داخل تطبيق حقيقي / بمقياس مستقل مثل الحيرة.'],['التدريب / التطوير / الاختبار','training / dev / test set','نتعلم / نجرّب / نقيس مرة واحدة.'],['تلوّث البيانات','data contamination','تسرّب نص الاختبار إلى التدريب.'],['الحيرة','perplexity','P(W)^(−1/N)؛ الأقل أفضل.'],['المتوسط الهندسي','geometric mean','الجذر النوني لحاصل ضرب N رقماً.'],['معامل التفرّع','branching factor','عدد الكلمات الممكنة بعد أي كلمة.'],['أخذ العيّنات','sampling','توليد كلمات بحسب احتمالاتها.'],['الإفراط في الملاءمة','overfitting','حفظ التدريب بدل التعميم.'],['الأصفار','zeros','تسلسلات لم تظهر في التدريب.'],['التنعيم / الخصم','smoothing / discounting','نقل جزء من الاحتمال إلى ما لم يُرَ.'],['تنعيم لابلاس','Laplace / add-one','أضف ١ لكل عدّ و V للمقام.'],['أضف k','add-k','أضف كسراً k بدل ١.'],['العدّ المعاد بناؤه','adjusted count C*','العدّ المكافئ للاحتمال المنعّم.'],['الاستيفاء الخطي','linear interpolation','متوسط موزون لتقديرات unigram وbigram وtrigram.'],['مدوّنة محجوزة','held-out corpus','بيانات تُحجز لضبط λ.'],['التراجع الغبي','stupid backoff','إن لم يُرَ الـ N-gram خذ 0.4 × درجة الأقصر.'],['الإنتروبيا','entropy','متوسط المفاجأة بالبِتات.'],['الإنتروبيا التقاطعية','cross-entropy','مفاجأة النص بحسب نموذج تقريبي؛ ≥ الإنتروبيا.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td><b>${g[0]}</b></td><td class="en">${esc(g[1])}</td><td>${esc(g[2])}</td></tr>`).join('');
