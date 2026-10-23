/* Chapter 9 · Masked Language Models — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const r2=v=>(+v).toFixed(2);
const fmtN=n=>Math.round(n).toLocaleString('en-US');
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s9-1','9.1','ثلاث معماريات'],['s9-2','9.2','المرمِّز ثنائي الاتجاه'],['s9-3','9.3','التدريب: MLM وNSP'],['s9-4','9.4','الضبط للتصنيف'],['s9-5','9.5','الكيانات المسمّاة وBIO'],['ex','','الخلاصة']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- 9.1 three architectures ---------- */
const ART={dec:['المفكِّك (Decoder)','يأخذ سلسلة رموز ويولّد رمزاً بعد رمز. المعلومات تتدفق من اليسار إلى اليمين: كل مخرج يعتمد على المدخلات السابقة فقط. نموذج <b>توليدي</b>. ومنه GPT وClaude وLlama وMistral (الفصل ٧).'],
 enc:['المرمِّز (Encoder)','يأخذ سلسلة رموز ويُخرج <b>متجهاً لكل رمز</b> (ترميزاً). كل مخرج يرى المدخل كله. يُدرَّب عادةً بالقناع (BERT وRoBERTa). ليس توليدياً، بل يُستعمل غالباً لبناء مصنّفات (نص ← وسم) بعد ضبطه على بيانات موسومة.'],
 ed:['المرمِّز-المفكِّك (Encoder-Decoder)','يأخذ سلسلة ويولّد سلسلة. الفرق عن المفكِّك: العلاقة بين رموز المدخل والمخرج «أرخى»، فقد تكون من نوع مختلف تماماً أو أطول أو أقصر كثيراً. مثل الترجمة (لغة ← لغة أخرى، الفصل ١٣) والتعرف على الكلام (رموز صوت ← رموز نص، الفصل ١٦).']};
function drawAR(){const m=segVal('#arM','m');const W=560,H=190;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:600px"><defs><marker id="arA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--soft)"/></marker></defs>`;
  const node=(x,y,t,c)=>`<circle cx="${x}" cy="${y}" r="15" fill="var(--paper)" stroke="${c}" stroke-width="2"/><text x="${x}" y="${y+4}" font-size="11" text-anchor="middle" fill="${c}" font-family="Noto Sans Mono">${t}</text>`;
  const ln=(x1,y1,x2,y2,c='var(--soft)')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.1" marker-end="url(#arA)" opacity=".75"/>`;
  if(m!=='ed'){const xs=[100,190,280,370,460],yb=160,yt=30;
    xs.forEach((x,i)=>xs.forEach((x2,j)=>{if(m==='enc'||j>=i)s+=ln(x,yb-16,x2,yt+18)}));
    xs.forEach((x,i)=>{s+=node(x,yb,'w'+(i+1),'var(--ink)')+node(x,yt,m==='dec'?'w'+(i+2):'h'+(i+1),m==='dec'?'var(--green)':'var(--math)')});
    s+=`<text x="10" y="${yb+4}" font-size="11" fill="var(--soft)" font-family="Noto Sans">input</text><text x="10" y="${yt+4}" font-size="11" fill="var(--soft)" font-family="Noto Sans">${m==='dec'?'next token':'vectors'}</text>`}
  else{const xe=[60,130,200,270],xd=[350,430,510];
    xe.forEach((x,i)=>xe.forEach(x2=>{s+=ln(x,144,x2,48)}));
    xe.forEach((x,i)=>{s+=node(x,160,'x'+(i+1),'var(--ink)')+node(x,30,'h'+(i+1),'var(--math)')});
    xd.forEach((x,i)=>{xe.forEach(xe2=>{s+=`<line x1="${xe2+15}" y1="30" x2="${x-15}" y2="95" stroke="var(--math)" stroke-width=".7" stroke-dasharray="3 3" opacity=".6"/>`});xd.forEach((x2,j)=>{if(j>=i)s+=ln(x,144,x2,48,'var(--soft)')});s+=node(x,160,i?'y'+i:'&lt;s&gt;','var(--ink)')+node(x,30,'y'+(i+1),'var(--green)')});
    s+=`<text x="165" y="186" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans">encoder (e.g. Arabic)</text><text x="430" y="186" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans">decoder (e.g. English)</text>`}
  $('#arSvg').innerHTML=s+'</svg>';$('#arTxt').innerHTML=`<h4>${ART[m][0]}</h4>${ART[m][1]}`}
segOn('#arM',drawAR);drawAR();

/* ---------- 9.2 causal vs bidirectional visibility ---------- */
const BIW=[['The','chicken','didn’t','cross','the','road','because','it','was','too','tired'],['The','chicken','didn’t','cross','the','road','because','it','was','too','wide']];let biR=7;
function drawBI(){const m=segVal('#biM','m'),S=BIW[+segVal('#biS','s')],N=S.length;
  $('#biTab').innerHTML=`<tr><th>q \\ k</th>${S.map(w=>`<th>${w}</th>`).join('')}</tr>`+S.map((w,i)=>`<tr data-r="${i}" class="${i===biR?'sel':''}"><th>${w}</th>${S.map((_,j)=>{const ok=m==='b'||j<=i;return `<td class="${ok?'ok':'no'}">${ok?'✓':'−∞'}</td>`}).join('')}</tr>`).join('');
  $$('#biTab tr[data-r]').forEach(tr=>tr.addEventListener('click',()=>{biR=+tr.dataset.r;drawBI()}));
  const vis=S.filter((_,j)=>m==='b'||j<=biR),last=S[N-1];
  $('#biCalc').textContent=`“${S[biR]}” (position ${biR+1}) can attend to ${vis.length} of ${N} tokens: ${vis.join(' ')}`+
   (biR===7?(vis.includes(last)?`\n→ it sees “${last}”, so its vector can lean toward ${last==='tired'?'chicken':'road'}`:`\n→ “${last}” is in the future and masked: at this point “it” cannot know if it is the chicken or the road`):'')+
   `\n${m==='b'?'bidirectional: no mask, the whole QKᵀ matrix is used (Eq. 9.2)':'causal: the upper triangle is −∞ (Eq. 9.1)'}   (click a row)`}
segOn('#biM',drawBI);segOn('#biS',drawBI);drawBI();

/* ---------- 9.3.1 masking ---------- */
const MLS=['So','long','and','thanks','for','all','the','fish'];
const UNI=[['the',.06],['of',.03],['and',.028],['to',.026],['a',.022],['in',.018],['is',.01],['apricot',.0001],['gasp',.0001],['river',.0003],['green',.0004],['said',.002]];
let mlSeed=1,mlState=null;
function uniSample(R){const S=UNI.reduce((a,c)=>a+c[1],0);let u=R()*S;for(const [w,p] of UNI){u-=p;if(u<0)return w}return UNI[0][0]}
function mlMake(seed){const R=rng(seed);let st;do{st=MLS.map(w=>{if(R()>=0.15)return {w,inp:w,sel:false};const u=R();return u<0.8?{w,inp:'[MASK]',sel:true,k:'mask'}:u<0.9?{w,inp:uniSample(R),sel:true,k:'rand'}:{w,inp:w,sel:true,k:'same'}})}while(!st.some(x=>x.sel));return st}
function drawML(extra){const st=mlState,K={mask:'→ [MASK] (80%)',rand:'→ random word (10%)',same:'unchanged (10%)'};
  $('#mlTab').innerHTML=`<tr><th>original</th>${st.map(x=>`<td>${x.w}</td>`).join('')}</tr><tr><th>model input</th>${st.map(x=>`<td class="${x.sel?'sel':''}">${esc(x.inp)}</td>`).join('')}</tr><tr><th>in M (loss)?</th>${st.map(x=>`<td>${x.sel?'✓':''}</td>`).join('')}</tr>`;
  const M=st.filter(x=>x.sel);
  $('#mlCalc').textContent=`selected (each token with probability 0.15): ${M.map(x=>`${x.w} ${K[x.k]}`).join(';  ')}\nloss L_MLM = −(1/|M|) Σ log P(original | h_i),  |M| = ${M.length}: ${M.map(x=>`−log P(${x.w})`).join(' + ')}  ÷ ${M.length}\nthe other ${st.length-M.length} tokens are still seen by attention, but add nothing to the loss`+(extra?'\n\n'+extra:'')}
$('#mlNew').addEventListener('click',()=>{mlSeed++;mlState=mlMake(mlSeed*977);drawML()});
$('#mlBook').addEventListener('click',()=>{mlState=MLS.map(w=>w==='long'||w==='thanks'?{w,inp:'[mask]',sel:true,k:'mask'}:w==='the'?{w,inp:'apricot',sel:true,k:'rand'}:{w,inp:w,sel:false});drawML('Figure 9.4: long and thanks masked, the replaced by apricot')});
$('#mlSim').addEventListener('click',()=>{const R=rng(2024);let n=1e6,c={sel:0,mask:0,rand:0,same:0};for(let i=0;i<n;i++){if(R()<0.15){c.sel++;const u=R();u<0.8?c.mask++:u<0.9?c.rand++:c.same++}}
  drawML(`simulated ${fmtN(n)} tokens: selected ${fmtN(c.sel)} (${(c.sel/n*100).toFixed(1)}%)\n  [MASK] ${fmtN(c.mask)} (${(c.mask/n*100).toFixed(1)}% of all text)  random ${fmtN(c.rand)} (${(c.rand/n*100).toFixed(2)}%)  unchanged ${fmtN(c.same)} (${(c.same/n*100).toFixed(2)}%)\n  expected: 15% · 12% · 1.5% · 1.5%`)});
mlState=MLS.map(w=>w==='long'||w==='thanks'?{w,inp:'[mask]',sel:true,k:'mask'}:w==='the'?{w,inp:'apricot',sel:true,k:'rand'}:{w,inp:w,sel:false});drawML('Figure 9.4: long and thanks masked, the replaced by apricot');

/* ---------- 9.3.2 NSP input ---------- */
const NS1=['Cancel','my','flight'],NS2={pos:['And','the','hotel'],neg:['Penguins','eat','fish']};
function drawNS(){const m=segVal('#nsM','m'),toks=['[CLS]',...NS1,'[SEP]',...NS2[m],'[SEP]'],seg=toks.map((_,i)=>i<=NS1.length+1?'s1':'s2');
  $('#nsTab').innerHTML=`<tr><th>token</th>${toks.map(t=>`<td><b>${t}</b></td>`).join('')}</tr><tr><th>word emb.</th>${toks.map(t=>`<td>E[${t}]</td>`).join('')}</tr><tr><th>segment</th>${seg.map(s=>`<td style="color:${s==='s1'?'var(--green)':'var(--amber)'}">${s}</td>`).join('')}</tr><tr><th>position</th>${toks.map((_,i)=>`<td>p${i+1}</td>`).join('')}</tr>`;
  $('#nsCalc').textContent=`x_i = word embedding + segment embedding + position embedding   (three [1 × d] vectors summed)\ngold label: ${m==='pos'?'IsNext (an actual adjacent pair, 50% of training pairs)':'NotNext (second sentence drawn at random from the corpus, the other 50%)'}\nprediction: y = softmax(h_CLS W_NSP),  W_NSP ∈ ℝ^(d×2)\n${m==='neg'?'(the random sentence is made up for illustration)':'(Figure 9.5)'}`}
segOn('#nsM',drawNS);drawNS();

/* ---------- 9.3.3 alpha sampling ---------- */
const LG=[['English',1000e6],['German',300e6],['Arabic',100e6],['Swahili',5e6],['Yoruba',1e6]];
function drawAL(){const a=+$('#alA').value;$('#alAo').textContent=a.toFixed(2);const T=LG.reduce((s,l)=>s+l[1],0),p=LG.map(l=>l[1]/T),pa=p.map(v=>Math.pow(v,a)),S=pa.reduce((s,v)=>s+v,0),q=pa.map(v=>v/S);
  $('#alTab').innerHTML='<tr><th>language</th><th>sentences nᵢ</th><th>pᵢ</th><th>qᵢ</th><th style="width:40%"></th></tr>'+LG.map((l,i)=>`<tr><td>${l[0]}</td><td class="num">${fmtN(l[1])}</td><td class="num">${(p[i]*100).toFixed(2)}%</td><td class="num"><b>${(q[i]*100).toFixed(2)}%</b></td><td><div style="height:10px;background:var(--rule);border-radius:3px;width:${p[i]*100}%"></div><div style="height:10px;margin-top:2px;background:var(--green);border-radius:3px;width:${q[i]*100}%"></div></td></tr>`).join('');
  $('#alCalc').textContent=`qᵢ = pᵢ^${a} / Σ pⱼ^${a}\nYoruba: ${(p[4]*100).toFixed(2)}% → ${(q[4]*100).toFixed(2)}% (×${(q[4]/p[4]).toFixed(1)})    English: ${(p[0]*100).toFixed(1)}% → ${(q[0]*100).toFixed(1)}%\n`+(a===1?'α = 1: no change, sampling follows the raw data':a===0?'α = 0: every language gets the same share':'grey bars: raw share pᵢ   green bars: re-weighted qᵢ   (α = 0.3 is the value Conneau et al. found to work well)')+`\n(sentence counts are made up for illustration)`}
$('#alA').addEventListener('input',drawAL);drawAL();

/* ---------- 9.4 head size ---------- */
function drawHD(){const k=+$('#hdK').value,d=+segVal('#hdM','m');$('#hdKo').textContent=k;const P=d===768?100e6:550e6,n=d*k;
  $('#hdCalc').textContent=`W_C is [d × classes] = [${d} × ${k}] → ${fmtN(n)} new weights\nthe pretrained encoder has about ${d===768?'100M (BERT)':'550M (XLM-R)'} parameters → the head is ${(n/P*100).toFixed(4)}% of the model\ny = softmax(h_CLS · W_C):  [1×${d}]·[${d}×${k}] = [1×${k}]`}
$('#hdK').addEventListener('input',drawHD);segOn('#hdM',drawHD);drawHD();

/* ---------- 9.4.2 NLI quiz ---------- */
const NI=[['Jon walked back to the town to the smithy.','Jon traveled back to his hometown.','neutral'],['Tourist Information offices can be very helpful.','Tourist Information offices are never of any help.','contradicts'],['I’m confused.','Not all of it is very clear to me.','entails']];
const NIA={entails:'يستلزم',contradicts:'يناقض',neutral:'محايد'};
const NIX={neutral:'الفرضية قد تكون صحيحة وقد لا تكون: «البلدة» في المقدمة ليست بالضرورة «بلدته الأم».',contradicts:'«قد تكون مفيدة جداً» يناقض «لا تفيد أبداً».',entails:'من يقول «أنا مرتبك» فالأرجح أن بعض الأمر ليس واضحاً له.'};
$('#niList').innerHTML=NI.map((n,i)=>`<div class="card" style="margin-bottom:8px"><div dir="ltr"><b>a:</b> ${esc(n[0])}<br><b>b:</b> ${esc(n[1])}</div><div class="row" style="margin-top:6px">${Object.keys(NIA).map(k=>`<button class="btn" data-i="${i}" data-k="${k}">${NIA[k]}</button>`).join('')}</div><div class="note" id="niR${i}"></div></div>`).join('');
$$('#niList button').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i,k=b.dataset.k,c=NI[i][2];$('#niR'+i).innerHTML=(k===c?'<b style="color:var(--green)">صحيح.</b> ':`<b style="color:var(--rose)">الوسم في المجموعة: ${NIA[c]}.</b> `)+NIX[c]}));

/* ---------- 9.5.1 NER text ---------- */
const NET=[['Citing high fuel prices, '],['United Airlines','ORG'],[' said '],['Friday','TIME'],[' it has increased fares by '],['$6','MONEY'],[' per round trip on flights to some cities also served by lower-cost carriers. '],['American Airlines','ORG'],[', a unit of '],['AMR Corp.','ORG'],[', immediately matched the move, spokesman '],['Tim Wagner','PER'],[' said. '],['United','ORG'],[', a unit of '],['UAL Corp.','ORG'],[', said the increase took effect '],['Thursday','TIME'],[' and applies to most routes where it competes against discount carriers, such as '],['Chicago','LOC'],[' to '],['Dallas','LOC'],[' and '],['Denver','LOC'],[' to '],['San Francisco','LOC'],['.']];
const NEC={ORG:'var(--amber)',LOC:'var(--green)',PER:'var(--rose)',TIME:'var(--math)',MONEY:'var(--soft)'};let neHL=null;
function drawNE(){const cnt={};NET.forEach(([t,k])=>{if(k)cnt[k]=(cnt[k]||0)+1});
  $('#neLeg').innerHTML=Object.keys(NEC).map(k=>`<button class="chip" data-k="${k}" style="border:0;cursor:pointer;${neHL===k?'outline:2px solid '+NEC[k]:''}">${k} <small>${cnt[k]}</small></button>`).join('');
  $$('#neLeg button').forEach(b=>b.addEventListener('click',()=>{neHL=neHL===b.dataset.k?null:b.dataset.k;drawNE()}));
  $('#neTxt').innerHTML=NET.map(([t,k])=>k?`<span style="border:1.5px solid ${NEC[k]};border-radius:5px;padding:0 4px;${neHL&&neHL!==k?'opacity:.3':''}${neHL===k?';background:color-mix(in srgb,'+NEC[k]+' 18%,transparent)':''}"><sub style="color:${NEC[k]};font-size:10px;font-family:var(--f-mono)">${k}</sub> ${esc(t)}</span>`:esc(t)).join('');
  const tot=Object.values(cnt).reduce((a,b)=>a+b,0);$('#neCalc').textContent=`${tot} named-entity mentions: `+Object.entries(cnt).map(([k,v])=>`${v} ${k}`).join(', ')}
drawNE();

/* ---------- 9.5.2 BIO ---------- */
const BS=[{w:['Jane','Villanueva','of','United','Airlines','Holding','discussed','the','Chicago','route','.'],sp:[[0,2,'PER'],[3,6,'ORG'],[8,9,'LOC']]},{w:['Xiomara','told','Jane','Rafael','left','.'],sp:[[0,1,'PER'],[2,3,'PER'],[3,4,'PER']]}];
function tags(n,sp,sch){const t=Array(n).fill('O');sp.forEach(([a,b,k])=>{for(let i=a;i<b;i++){if(sch==='IO')t[i]='I-'+k;else if(sch==='BIO')t[i]=(i===a?'B-':'I-')+k;else t[i]=(b-a===1?'S-':i===a?'B-':i===b-1?'E-':'I-')+k}});return t}
function decode(t){const sp=[];let cur=null;t.forEach((g,i)=>{const [p,k]=g==='O'?['O',null]:g.split('-');
  if(p==='O'){if(cur){sp.push(cur);cur=null}return}
  if(p==='B'||p==='S'||!cur||cur[2]!==k){if(cur)sp.push(cur);cur=[i,i+1,k]}else cur[1]=i+1;
  if(p==='E'||p==='S'){sp.push(cur);cur=null}});if(cur)sp.push(cur);return sp}
function drawBIO(){const s=BS[+segVal('#bioS','s')],n=s.w.length,T={IO:tags(n,s.sp,'IO'),BIO:tags(n,s.sp,'BIO'),BIOES:tags(n,s.sp,'BIOES')};
  $('#bioTab').innerHTML='<tr><th>Words</th><th>IO</th><th>BIO</th><th>BIOES</th></tr>'+s.w.map((w,i)=>`<tr><td>${w}</td>${['IO','BIO','BIOES'].map(k=>`<td class="mono" style="color:${T[k][i]==='O'?'var(--soft)':'var(--ink)'}">${T[k][i]}</td>`).join('')}</tr>`).join('');
  const show=sp=>sp.map(([a,b,k])=>`[${k} ${s.w.slice(a,b).join(' ')}]`).join(' ');
  $('#bioCalc').textContent=`gold:            ${show(s.sp)}\nread back IO:    ${show(decode(T.IO))}\nread back BIO:   ${show(decode(T.BIO))}\nread back BIOES: ${show(decode(T.BIOES))}`+
   (segVal('#bioS','s')==='1'?'\n→ IO merges the two adjacent people into one “Jane Rafael”: B is what marks where a new span starts\n(“Xiomara told Jane Rafael left.” = she told Jane that Rafael left; this sentence is our own example)':'\nwith 4 entity types: IO has 5 tags, BIO 2·4+1 = 9, BIOES 4·4+1 = 17')}
segOn('#bioS',drawBIO);drawBIO();

/* ---------- subword alignment ---------- */
const SWW=['Mt.','Sanitas','is','in','Sunshine','Canyon','.'],SWT=['B-LOC','I-LOC','O','O','B-LOC','I-LOC','O'];
const SWP=[['Mt',0],['.',0],['San',1],['##itas',1],['is',2],['in',3],['Sunshine',4],['Canyon',5],['.',6]],SWPRED=['B-LOC','O','I-LOC','O','O','O','B-LOC','I-LOC','O'];
function drawSW(){const m=segVal('#swM','m');
  if(m==='train'){$('#swTab').innerHTML=`<tr><th>WordPiece</th>${SWP.map(p=>`<td>${p[0]}</td>`).join('')}</tr><tr><th>word</th>${SWP.map(p=>`<td style="color:var(--soft)">${SWW[p[1]]}</td>`).join('')}</tr><tr><th>training tag</th>${SWP.map(p=>`<td class="mono">${SWT[p[1]]}</td>`).join('')}</tr>`;
    $('#swCalc').textContent=`gold tags are per word: ${SWW.map((w,i)=>`${w}/${SWT[i]}`).join(' ')}\ntraining: every subword copies the tag of its word (so “.” inside “Mt.” is also B-LOC, and “##itas” is I-LOC)`}
  else{const first=SWP.map((p,i)=>i===0||SWP[i-1][1]!==p[1]);
    $('#swTab').innerHTML=`<tr><th>WordPiece</th>${SWP.map(p=>`<td>${p[0]}</td>`).join('')}</tr><tr><th>predicted</th>${SWP.map((p,i)=>`<td class="mono" style="${first[i]?'':'opacity:.4;text-decoration:line-through'}">${SWPRED[i]}</td>`).join('')}</tr><tr><th>word tag</th>${SWP.map((p,i)=>`<td class="mono">${first[i]?SWW[p[1]]+' → '+SWPRED[i]:''}</td>`).join('')}</tr>`;
    $('#swCalc').textContent=`decoding: each word takes the argmax tag of its FIRST subword\n“Mt.” ← tag of “Mt”    “Sanitas” ← tag of “San”     the tags on “.” and “##itas” are ignored\n(the predicted tags are made up; here the model's mistake on “##itas” does no harm)`}}
segOn('#swM',drawSW);drawSW();

/* ---------- 9.5.4 entity-level evaluation ---------- */
const EVW=BS[0].w,EVG=[[0,2,'PER'],[3,6,'ORG'],[8,9,'LOC']];
const EVS=[EVG,[[0,1,'PER'],[3,6,'ORG'],[8,9,'LOC']],[[0,2,'PER'],[3,6,'LOC'],[8,9,'LOC']],[[0,2,'PER'],[3,6,'ORG']]];
function drawEV(){const P=EVS[+segVal('#evS','s')],key=s=>s.join(),gk=new Set(EVG.map(key)),pk=new Set(P.map(key)),tp=P.filter(s=>gk.has(key(s))).length,fp=P.length-tp,fn=EVG.filter(s=>!pk.has(key(s))).length;
  const pr=P.length?tp/P.length:0,rc=tp/EVG.length,f=pr+rc?2*pr*rc/(pr+rc):0,show=s=>`[${s[2]} ${EVW.slice(s[0],s[1]).join(' ')}]`;
  $('#evTab').innerHTML='<tr><th>gold entities</th><th>system entities</th></tr>'+Array.from({length:Math.max(EVG.length,P.length)},(_,i)=>`<tr><td>${EVG[i]?show(EVG[i])+(pk.has(key(EVG[i]))?' ✓':' <span style="color:var(--rose)">missed (FN)</span>'):''}</td><td>${P[i]?show(P[i])+(gk.has(key(P[i]))?' ✓':' <span style="color:var(--rose)">wrong (FP)</span>'):''}</td></tr>`).join('');
  $('#evCalc').textContent=`TP = ${tp}  FP = ${fp}  FN = ${fn}   (the unit is the whole entity: span AND type must match)\nprecision = TP/(TP+FP) = ${tp}/${tp+fp} = ${r2(pr)}\nrecall    = TP/(TP+FN) = ${tp}/${tp+fn} = ${r2(rc)}\nF1 = 2PR/(P+R) = ${r2(f)}`}
segOn('#evS',drawEV);drawEV();

/* ---------- glossary ---------- */
const GL=[['المرمِّز','encoder','يُخرج متجهاً سياقياً لكل رمز مدخل.'],['المفكِّك','decoder','يولّد رمزاً بعد رمز من اليسار.'],['المرمِّز-المفكِّك','encoder-decoder','يحوّل سلسلة إلى سلسلة أخرى (ترجمة، كلام).'],['ثنائي الاتجاه','bidirectional','الانتباه يرى ما قبل الرمز وما بعده.'],['BERT','BERT','مرمِّز ثنائي الاتجاه مدرَّب بالقناع وNSP.'],['النمذجة اللغوية المقنّعة','masked language modeling','إخفاء رموز وتخمينها من الجانبين.'],['مهمة كلوز','cloze task','ملء الفراغ.'],['إزالة التشويش','denoising','إفساد المدخل ثم استعادة الأصل.'],['[MASK]','mask token','رمز خاص يحل محل الكلمة المخفية.'],['التنبؤ بالجملة التالية','next sentence prediction (NSP)','هل الجملتان متجاورتان حقاً؟'],['[CLS] / [SEP]','classification / separator tokens','رمز بداية يمثل السلسلة / رمز فاصل.'],['تضمين المقطع','segment embedding','يميز الجملة الأولى من الثانية.'],['WordPiece','WordPiece','خوارزمية ترميز فرعي يستعملها BERT؛ ## تعني تكملة.'],['لعنة تعدد اللغات','curse of multilinguality','تراجع الأداء في كل لغة حين تكثر اللغات.'],['نقل التعلم','transfer learning','نقل معرفة من مهمة إلى أخرى.'],['رأس المصنّف','classifier head','طبقة صغيرة فوق النموذج المدرَّب لمهمة معينة.'],['الاستدلال اللغوي الطبيعي','natural language inference (NLI)','يستلزم / يناقض / محايد بين مقدمة وفرضية.'],['وسم السلاسل','sequence labeling','وسم لكل رمز.'],['الكيان المسمّى','named entity','ما يُشار إليه باسم علم: PER وORG وLOC وGPE.'],['التعرف على الكيانات','NER','إيجاد مقاطع الأسماء وتحديد أنواعها.'],['وسوم BIO','BIO tagging','بداية / داخل / خارج المقطع.'],['IO / BIOES','IO / BIOES tagging','بلا B / مع E للنهاية وS للمقطع المفرد.'],['CRF','conditional random field','طبقة تراعي الانتقالات بين الوسوم.'],['F1','F1 measure','المتوسط التوافقي للدقة والاستدعاء.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
