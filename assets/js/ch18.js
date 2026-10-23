/* Chapter 18 · Sequence Labeling for POS and NER — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2),r1=v=>(+v).toFixed(1);
const fmt=n=>Math.round(n).toLocaleString('en-US');
const sci=v=>v===0?'0':v.toExponential(3);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];

/* ---------- TOC + progress ---------- */
const SECS=[['p3','III','مقدمة الجزء الثالث'],['s0','','افتتاحية الفصل'],['s18-1','18.1','أقسام الكلام'],['s18-2','18.2','وسم أقسام الكلام'],['s18-3','18.3','الكيانات ووسم BIO'],['s18-4','18.4','HMM وفيتربي'],['s18-5','18.5','CRF'],['s18-6','18.6','تقييم NER'],['s18-7','18.7','تفاصيل أخرى'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- 18.1 UD tagset ---------- */
const UD={open:[['ADJ','Adjective: noun modifiers describing properties','red, young, awesome'],['ADV','Adverb: verb modifiers of time, place, manner','very, slowly, home, yesterday'],['NOUN','words for persons, places, things, etc.','algorithm, cat, mango, beauty'],['VERB','words for actions and processes','draw, provide, go'],['PROPN','Proper noun: name of a person, organization, place, etc.','Regina, IBM, Colorado'],['INTJ','Interjection: exclamation, greeting, yes/no response, etc.','oh, um, yes, hello']],
 closed:[['ADP','Adposition (Preposition/Postposition): marks a noun’s spatial, temporal, or other relation','in, on, by, under'],['AUX','Auxiliary: helping verb marking tense, aspect, mood, etc.','can, may, should, are'],['CCONJ','Coordinating Conjunction: joins two phrases/clauses','and, or, but'],['DET','Determiner: marks noun phrase properties','a, an, the, this'],['NUM','Numeral','one, two, 2026, 11:00, hundred'],['PART','Particle: a function word that must be associated with another word','’s, not, (infinitive) to'],['PRON','Pronoun: a shorthand for referring to an entity or event','she, who, I, others'],['SCONJ','Subordinating Conjunction: joins a main clause with a subordinate clause such as a sentential complement','whether, because']],
 other:[['PUNCT','Punctuation','. , ( )'],['SYM','Symbols like $ or emoji','$, %'],['X','Other','asdf, qwfg']]};
function drawUD(){const m=segVal('#udM','m');$('#udTab').innerHTML='<tr><th>Tag</th><th>Description</th><th>Example</th></tr>'+UD[m].map(r=>`<tr><td class="mono"><b>${r[0]}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}
segOn('#udM',drawUD);drawUD();

/* ---------- UD vs Penn ---------- */
const TS=[[['There','PRON','EX'],['are','VERB','VBP'],['70','NUM','CD'],['children','NOUN','NNS'],['there','ADV','RB'],['.','PUNC','.']],
 [['Preliminary','ADJ','JJ'],['findings','NOUN','NNS'],['were','AUX','VBD'],['reported','VERB','VBN'],['in','ADP','IN'],['today','NOUN','NN'],['’s','PART','POS'],['London','PROPN','NNP'],['Journal','PROPN','NNP'],['of','ADP','IN'],['Medicine','PROPN','NNP']]];
function drawTG(){const s=+segVal('#tgS','s'),t=segVal('#tgT','t'),S=TS[s];
  $('#tgOut').innerHTML='<div style="display:flex;flex-wrap:wrap;gap:6px">'+S.map(([w,u,p])=>`<div style="text-align:center;border:1px solid var(--rule);border-radius:7px;padding:3px 8px"><div style="font-size:16px">${esc(w)}</div>${t!=='penn'?`<div class="mono" style="font-size:11.5px;color:var(--math)">${u}</div>`:''}${t!=='ud'?`<div class="mono" style="font-size:11.5px;color:var(--rose)">${p}</div>`:''}</div>`).join('')+'</div>';
  $('#tgCalc').textContent=s===0?'Penn has a special tag EX for existential “there” (UD: PRON) and marks the verb form (VBP = present, non-3rd-singular).':'Penn distinguishes tense and participles: were/VBD (past) vs reported/VBN (past participle); UD calls “were” an AUX.\n“London Journal of Medicine” is one proper noun, so Journal and Medicine are PROPN/NNP, not NOUN/NN.'}
segOn('#tgS',drawTG);segOn('#tgT',drawTG);drawTG();

/* ---------- 18.2 ambiguity ---------- */
const AM={types:{WSJ:[44432,7025],Brown:[45799,8050]},tokens:{WSJ:[577421,711780],Brown:[384349,786646]}};
function drawAM(){const m=segVal('#amM','m'),D=AM[m];
  $('#amBars').innerHTML=Object.entries(D).map(([c,[u,a]])=>{const p=a/(u+a)*100;return `<div class="br"><span class="w0">${c}</span><span class="tr" style="display:flex"><span class="fl" style="display:block;width:${100-p}%;background:var(--math);border-radius:5px 0 0 5px"></span><span class="fl" style="display:block;width:${p}%;background:var(--rose);border-radius:0 5px 5px 0"></span></span><span class="v">${p.toFixed(0)}%</span></div>`}).join('');
  $('#amCalc').textContent=Object.entries(D).map(([c,[u,a]])=>`${c}: unambiguous ${fmt(u)} (${(u/(u+a)*100).toFixed(0)}%)   ambiguous ${fmt(a)} (${(a/(u+a)*100).toFixed(0)}%)`).join('\n')+(m==='types'?'\n→ most word TYPES have one tag (blue); red = the ambiguous share':'\n→ but the ambiguous words are the frequent ones: most running TOKENS are ambiguous (red)')}
segOn('#amM',drawAM);drawAM();

/* ---------- 18.3 NER passage ---------- */
const NP=[['Citing high fuel prices, '],['United Airlines','ORG'],[' said '],['Friday','TIME'],[' it has increased fares by '],['$6','MONEY'],[' per round trip on flights to some cities also served by lower-cost carriers. '],['American Airlines','ORG'],[', a unit of '],['AMR Corp.','ORG'],[', immediately matched the move, spokesman '],['Tim Wagner','PER'],[' said. '],['United','ORG'],[', a unit of '],['UAL Corp.','ORG'],[', said the increase took effect '],['Thursday','TIME'],[' and applies to most routes where it competes against discount carriers, such as '],['Chicago','LOC'],[' to '],['Dallas','LOC'],[' and '],['Denver','LOC'],[' to '],['San Francisco','LOC'],['.']];
const NC={ORG:'var(--math)',LOC:'var(--green)',TIME:'var(--amber)',PER:'var(--rose)',MONEY:'var(--soft)'};let neSel='all';
const neTypes=['all','ORG','LOC','TIME','PER','MONEY'];
$('#neBtns').innerHTML='<span class="seg" id="neS">'+neTypes.map(t=>`<button data-t="${t}" class="${t==='all'?'on':''}">${t==='all'?'الكل':t}</button>`).join('')+'</span>';
function drawNE(){neSel=segVal('#neS','t');
  $('#neText').innerHTML=NP.map(([s,t])=>!t?esc(s):`<span style="border:1.5px solid ${NC[t]};border-radius:5px;padding:1px 4px;${neSel==='all'||neSel===t?`background:color-mix(in srgb, ${NC[t]} 16%, transparent)`:'opacity:.35'}">${esc(s)}<sub class="mono" style="color:${NC[t]};font-size:10px;margin-left:3px">${t}</sub></span>`).join('');
  const c={};NP.forEach(([s,t])=>{if(t)c[t]=(c[t]||0)+1});const n=Object.values(c).reduce((a,b)=>a+b,0);
  $('#neCalc').textContent=`${n} named-entity mentions: `+Object.entries(c).map(([t,k])=>`${k} ${t}`).join(', ')+`\n(the book: “13 mentions … 5 organizations, 4 locations, 2 times, 1 person, and 1 mention of money”)`+(neSel!=='all'?`\nhighlighted: ${c[neSel]} × ${neSel}`:'')}
segOn('#neS',drawNE);drawNE();

/* ---------- BIO table ---------- */
const BW=['Jane','Villanueva','of','United','Airlines','Holding','discussed','the','Chicago','route','.'],BSP=[[0,2,'PER'],[3,6,'ORG'],[8,9,'LOC']];
function labels(m){return BW.map((w,i)=>{const sp=BSP.find(s=>i>=s[0]&&i<s[1]);if(!sp)return 'O';const L=sp[1]-sp[0],k=i-sp[0];
  if(m==='io')return 'I-'+sp[2];if(m==='bio')return (k===0?'B-':'I-')+sp[2];return (L===1?'S-':k===0?'B-':k===L-1?'E-':'I-')+sp[2]})}
function drawBIO(){const m=segVal('#bioM','m'),L=labels(m);
  $('#bioTab').innerHTML=`<tr><th>Words</th>${BW.map(w=>`<td>${esc(w)}</td>`).join('')}</tr><tr><th>${m.toUpperCase()}</th>${L.map(l=>{const t=l.split('-')[1];return `<td class="mono" style="font-size:12.5px;color:${t?{PER:'var(--rose)',ORG:'var(--math)',LOC:'var(--green)'}[t]:'var(--soft)'};font-weight:${l[0]==='B'||l[0]==='S'?700:400}">${l}</td>`}).join('')}</tr>`;
  const n=3,cnt={io:n+1,bio:2*n+1,bioes:4*n+1}[m];
  $('#bioCalc').textContent=`with n = ${n} entity types (PER, ORG, LOC): ${cnt} possible tags  (${m==='io'?'n + 1':m==='bio'?'2n + 1':'4n + 1'})\n`+({io:'IO loses information: two adjacent entities of the same type would merge into one',bio:'B marks every beginning, so adjacent entities of the same type stay separate',bioes:'E marks the last word of a span, S a one-word span (Chicago)'})[m]}
segOn('#bioM',drawBIO);drawBIO();

/* ---------- 18.4.1 Markov chain ---------- */
const MS={H:'HOT',C:'COLD',W:'WARM'},MI={H:0,C:1,W:2},MA=[[.6,.1,.3],[.1,.8,.1],[.3,.1,.6]],MPI=[.1,.7,.2];let mcSeq=['H','H','H','H'];
function drawMC(){const W=560,H=70;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img">`;const cols={H:'var(--rose)',C:'var(--math)',W:'var(--amber)'};
  mcSeq.forEach((q,i)=>{const x=40+i*90;s+=`<circle cx="${x}" cy="35" r="24" fill="${cols[q]}" opacity=".85"/><text x="${x}" y="40" font-size="12" text-anchor="middle" fill="var(--paper)" font-family="Noto Sans Mono">${MS[q]}</text>`;
    if(i)s+=`<line x1="${x-66}" y1="35" x2="${x-26}" y2="35" stroke="var(--soft)" stroke-width="1.5"/><text x="${x-45}" y="26" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${MA[MI[mcSeq[i-1]]][MI[q]]}</text>`});
  if(!mcSeq.length)s+=`<text x="10" y="40" font-size="13" fill="var(--soft)" font-family="Noto Sans">add states with the buttons</text>`;
  $('#mcSvg').innerHTML=s+'</svg>';if(!mcSeq.length){$('#mcCalc').textContent='π = [0.1 (hot), 0.7 (cold), 0.2 (warm)]';return}
  const f=[MPI[MI[mcSeq[0]]],...mcSeq.slice(1).map((q,i)=>MA[MI[mcSeq[i]]][MI[q]])],p=f.reduce((a,b)=>a*b,1);
  $('#mcCalc').textContent=`P(${mcSeq.map(q=>MS[q].toLowerCase()).join(' ')}) = π(${MS[mcSeq[0]].toLowerCase()})${mcSeq.slice(1).map((q,i)=>` · a(${MS[mcSeq[i]].toLowerCase()}→${MS[q].toLowerCase()})`).join('')}\n = ${f.join(' × ')} = ${p<0.001?p.toExponential(2):+p.toFixed(5)}`+
   (mcSeq.join('')==='HHHH'?'\n(18.4) vs (18.5) cold hot cold hot = 0.7 × 0.1 × 0.1 × 0.1 = 0.0007: about 30× less likely':mcSeq.join('')==='CHCH'?'\n(18.5): weather tends to persist (self-loops .6/.8/.6); flipping back and forth every day is rare':'')}
$$('#mcBox button[data-q]').forEach(b=>b.addEventListener('click',()=>{if(mcSeq.length<6)mcSeq.push(b.dataset.q);drawMC()}));
$$('#mcBox button[data-s]').forEach(b=>b.addEventListener('click',()=>{mcSeq=[...b.dataset.s];drawMC()}));$('#mcU').addEventListener('click',()=>{mcSeq.pop();drawMC()});drawMC();

/* ---------- MLE ---------- */
$('#mlCalc').textContent=`transition A:  P(VB | MD) = C(MD, VB) / C(MD) = 10471 / 13124 = ${f3(10471/13124)}   (book: .80)\nemission B:    P(will | MD) = C(MD, will) / C(MD) = 4046 / 13124 = ${f3(4046/13124)}   (book: .31)\n“if we generate an MD, it is ‘will’ about 31% of the time”\n(Figs 18.12–18.13 are “slightly simplified”, so they give 0.7968 and 0.308431)`;

/* ---------- Viterbi ---------- */
const T=['NNP','MD','VB','JJ','NN','RB','DT'],WS=['Janet','will','back','the','bill'];
const A={'<s>':[.2767,.0006,.0031,.0453,.0449,.0510,.2026],NNP:[.3777,.0110,.0009,.0084,.0584,.0090,.0025],MD:[.0008,.0002,.7968,.0005,.0008,.1698,.0041],VB:[.0322,.0005,.0050,.0837,.0615,.0514,.2231],JJ:[.0366,.0004,.0001,.0733,.4509,.0036,.0036],NN:[.0096,.0176,.0014,.0086,.1216,.0177,.0068],RB:[.0068,.0102,.1011,.1012,.0120,.0728,.0479],DT:[.1147,.0021,.0002,.2157,.4744,.0102,.0017]};
const B={NNP:[.000032,0,0,.000048,0],MD:[0,.308431,0,0,0],VB:[0,.000028,.000672,0,.000028],JJ:[0,0,.000340,0,0],NN:[0,.000200,.000223,0,.002337],RB:[0,0,.010446,0,0],DT:[0,0,0,.506099,0]};
const V=[],BP=[];for(let t=0;t<5;t++){V.push([]);BP.push([]);T.forEach((tg,j)=>{if(t===0){V[0][j]=A['<s>'][j]*B[tg][0];BP[0][j]=-1;return}
  let best=0,bi=-1;T.forEach((pt,i)=>{const v=V[t-1][i]*A[pt][j];if(v>best){best=v;bi=i}});V[t][j]=best*B[tg][t];BP[t][j]=V[t][j]>0?bi:-1})}
const path=[];{let j=V[4].indexOf(Math.max(...V[4]));for(let t=4;t>=0;t--){path.unshift(j);j=BP[t][j]}}
let vtCol=0,vtSel=[0,0];
function drawVT(){const W=560,H=268,cw=96,rh=32,x0=58,y0=26;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img">`;
  WS.forEach((w,t)=>{s+=`<text x="${x0+t*cw+cw/2}" y="16" font-size="13" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${w}</text>`});
  T.forEach((tg,j)=>{s+=`<text x="${x0-8}" y="${y0+j*rh+20}" font-size="12" text-anchor="end" fill="var(--soft)" font-family="Noto Sans Mono">${tg}</text>`});
  const done=vtCol>=5;
  for(let t=0;t<vtCol;t++)T.forEach((_,j)=>{if(t>0&&V[t][j]>0&&BP[t][j]>=0){const on=done&&path[t]===j&&path[t-1]===BP[t][j];s+=`<line x1="${x0+(t-1)*cw+cw-8}" y1="${y0+BP[t][j]*rh+14}" x2="${x0+t*cw+8}" y2="${y0+j*rh+14}" stroke="${on?'var(--green)':'var(--soft)'}" stroke-width="${on?2.6:0.9}" opacity="${on?1:.55}"/>`}});
  for(let t=0;t<5;t++)T.forEach((_,j)=>{const shown=t<vtCol,v=V[t][j],sel=vtSel[0]===t&&vtSel[1]===j,onp=done&&path[t]===j;
    s+=`<g data-t="${t}" data-j="${j}" style="cursor:pointer"><rect x="${x0+t*cw+8}" y="${y0+j*rh+2}" width="${cw-16}" height="${rh-6}" rx="5" fill="${!shown?'var(--paper)':onp?'var(--green-soft)':v>0?'var(--math-soft)':'var(--tint)'}" stroke="${sel?'var(--rose)':onp?'var(--green)':'var(--rule)'}" stroke-width="${sel?2:1}"/><text x="${x0+t*cw+cw/2}" y="${y0+j*rh+19}" font-size="10.5" text-anchor="middle" fill="${v>0?'var(--ink)':'var(--soft)'}" font-family="Noto Sans Mono">${shown?(v>0?v.toExponential(2):'0'):''}</text></g>`});
  $('#vtSvg').innerHTML=s+'</svg>';
  $$('#vtSvg g[data-t]').forEach(g=>g.addEventListener('click',()=>{const t=+g.dataset.t;if(t<vtCol){vtSel=[t,+g.dataset.j];drawVT()}}));
  const [t,j]=vtSel;let m='';
  if(vtCol===0)m='press “next column” to start: column 1 = π(tag) × P(Janet | tag)';
  else if(t===0)m=`v₁(${T[j]}) = π(${T[j]}) × b_${T[j]}(Janet) = P(${T[j]} | <s>) × P(Janet | ${T[j]}) = ${A['<s>'][j]} × ${B[T[j]][0]} = ${sci(V[0][j])}`+(j===0?'\n(the book rounds: .28 × .000032 = .000009)':'');
  else{const cand=T.map((pt,i)=>({pt,v:V[t-1][i],a:A[pt][j],p:V[t-1][i]*A[pt][j]})).filter(c=>c.v>0);
    m=`v${t+1}(${T[j]}) = max_i v${t}(i) × a(i → ${T[j]}) × P(${WS[t]} | ${T[j]})\n`+(cand.length?cand.map(c=>`  from ${c.pt.padEnd(3)}: ${sci(c.v)} × ${c.a} = ${sci(c.p)}`).join('\n'):'  (no non-zero cell in the previous column)')+
      `\n  × b = ${B[T[j]][t]}  →  ${sci(V[t][j])}`+(V[t][j]>0?`   backpointer → ${T[BP[t][j]]}`:'  (this tag cannot emit “'+WS[t]+'”)')+(t===1&&j===1?'\n(the book gets 2.772e-8 from its rounded .000009 × .01 × .308; unrounded: 3.004e-8)':'')}
  if(done){const p=V[4][path[4]];m+=`\n\nbest final cell: ${T[path[4]]} = ${sci(p)}; follow the backpointers:\n→ ${WS.map((w,i)=>`${w}/${T[path[i]]}`).join(' ')}   ${path.map(i=>T[i]).join(' ')==='NNP MD VB DT NN'?'✓ the gold sequence NNP MD VB DT NN':''}`}
  $('#vtCalc').textContent=m}
$('#vtNext').addEventListener('click',()=>{if(vtCol<5){vtCol++;vtSel=[vtCol-1,V[vtCol-1].indexOf(Math.max(...V[vtCol-1]))]}drawVT()});
$('#vtAll').addEventListener('click',()=>{vtCol=5;vtSel=[4,path[4]];drawVT()});$('#vtReset').addEventListener('click',()=>{vtCol=0;vtSel=[0,0];drawVT()});drawVT();
$('#vtA').innerHTML='<tr><th>P(col | row)</th>'+T.map(t=>`<th>${t}</th>`).join('')+'</tr>'+Object.entries(A).map(([r,v])=>`<tr><th>${esc(r)}</th>${v.map(x=>`<td class="num">${x.toFixed(4)}</td>`).join('')}</tr>`).join('');
$('#vtB').innerHTML='<tr><th>P(word | tag)</th>'+WS.map(w=>`<th>${w}</th>`).join('')+'</tr>'+T.map(t=>`<tr><th>${t}</th>${B[t].map(x=>`<td class="num">${x?x.toFixed(6):'0'}</td>`).join('')}</tr>`).join('');

/* ---------- word shape ---------- */
const ctype=c=>/[a-z]/.test(c)?'x':/[A-Z]/.test(c)?'X':/[0-9]/.test(c)?'d':c;
function drawSH(){const w=$('#shW').value.trim(),k=+segVal('#shK','k');if(!w){$('#shCalc').textContent='';return}
  const ch=[...w],shape=ch.map(ctype).join(''),short=[...shape].filter((c,i,a)=>i===0||c!==a[i-1]).join('');
  const pre=[],suf=[];for(let n=1;n<=Math.min(k,ch.length);n++){pre.push(ch.slice(0,n).join(''));suf.push(ch.slice(-n).join(''))}
  $('#shCalc').textContent=pre.map(p=>`prefix(xi) = ${p}`).join('\n')+'\n'+suf.reverse().map(p=>`suffix(xi) = ${p}`).join('\n')+`\nword-shape(xi) = ${shape}\nshort-word-shape(xi) = ${short}`+
    (/^[A-Z]/.test(w)?'\n→ initial capital: a strong hint for NNP / a named entity':/ed$/.test(w)?'\n→ suffix “ed”: a strong hint for VBD / VBN':'')}
$('#shW').addEventListener('input',drawSH);segOn('#shK',drawSH);$$('#shBox button[data-w]').forEach(b=>b.addEventListener('click',()=>{$('#shW').value=b.dataset.w;$$('#shK button').forEach(x=>x.classList.toggle('on',x.dataset.k===(b.dataset.w==='L’Occitane'?'4':'2')));drawSH()}));drawSH();

/* ---------- Fig 18.16 ---------- */
(function(){const POS=['NNP','NNP','IN','NNP','NNP','NNP','VBD','DT','NNP','NN','.'],SH=BW.map(w=>{const s=[...w].map(ctype).join('');return [...s].filter((c,i,a)=>i===0||c!==a[i-1]).join('')}),GZ=[0,1,0,0,0,0,0,0,1,0,0],L=labels('bio');
  $('#nfTab').innerHTML=[['Words',BW],['POS',POS],['Short shape',SH],['Gazetteer',GZ],['BIO Label',L]].map(([h,r])=>`<tr><th>${h}</th>${r.map(v=>`<td class="${h==='Words'?'':'mono'}" style="font-size:12.5px">${esc(v)}</td>`).join('')}</tr>`).join('')})();

/* ---------- NER evaluation ---------- */
const EVO=[['jane','“Jane” instead of “Jane Villanueva” (PER)'],['ua','“United Airlines” instead of “United Airlines Holding” (ORG)'],['chi','“Chicago” tagged ORG instead of LOC'],['route','spurious entity: “route” tagged LOC'],['miss','missed “Chicago” completely']];
$('#evOpts').innerHTML=EVO.map(([k,l])=>`<label class="note" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-k="${k}" ${k==='jane'?'checked':''}> <span dir="ltr">${l}</span></label>`).join('');
function drawEV(){const on=k=>$(`#evOpts input[data-k="${k}"]`).checked;const gold=BSP.map(s=>s.join());
  let pred=[[on('jane')?'0,1,PER':'0,2,PER'],[on('ua')?'3,5,ORG':'3,6,ORG']].flat();if(!on('miss'))pred.push(on('chi')?'8,9,ORG':'8,9,LOC');if(on('route'))pred.push('9,10,LOC');
  const tp=pred.filter(p=>gold.includes(p)).length,P=pred.length?tp/pred.length:0,R=tp/gold.length,F=P+R?2*P*R/(P+R):0;
  const sp=pred.map(p=>p.split(',')),cols={PER:'var(--rose)',ORG:'var(--math)',LOC:'var(--green)'};
  $('#evOut').innerHTML=BW.map((w,i)=>{const st=sp.find(s=>+s[0]===i),en=sp.find(s=>+s[1]===i+1);return `${st?`<span class="mono" style="color:${cols[st[2]]}">[${st[2]} </span>`:''}${esc(w)}${en?`<span class="mono" style="color:${cols[en[2]]}">]</span>`:''}`}).join(' ');
  $('#evCalc').textContent=`gold entities: Jane Villanueva/PER, United Airlines Holding/ORG, Chicago/LOC  (3)\nsystem entities: ${pred.length}   exactly correct (same start, end and type): ${tp}\nprecision = ${tp}/${pred.length} = ${f3(P)}   recall = ${tp}/3 = ${f3(R)}   F1 = ${f3(F)}`+(on('jane')?'\n“Jane” alone = 2 errors: a false positive (Jane) and a false negative (Jane Villanueva)':'')}
$$('#evOpts input').forEach(c=>c.addEventListener('change',drawEV));drawEV();

/* ---------- glossary ---------- */
const GL=[['وسم السلاسل','sequence labeling','وسم لكل عنصر؛ المخرج بطول المدخل.'],['أقسام الكلام','parts of speech (POS)','فئات الكلمات النحوية: اسم، فعل…'],['فئة مغلقة / مفتوحة','closed / open class','ثابتة العضوية / تتجدد باستمرار.'],['كلمة وظيفية','function word','كلمة قصيرة متكررة ذات دور بنيوي (of, the).'],['اسم معدود / جمعي','count / mass noun','يُعدّ ويُجمع / كتلة متجانسة.'],['فعل مركّب','phrasal verb','فعل + أداة بمعنى غير تركيبي (turn down).'],['المكمِّل','complementizer','رابط يصل فعلاً بجملة معمولة (that).'],['فعل مساعد / رابط / صيغة','auxiliary / copula / modal','يحدد الزمن والجهة والصيغة.'],['UD / Penn Treebank','Universal Dependencies / Penn Treebank tagsets','١٧ وسماً عالمياً / ٣٦ وسماً إنجليزياً.'],['خط الأساس الأكثر تكراراً','most frequent class baseline','أعطِ كل كلمة وسمها الأكثر تكراراً (٩٢٪).'],['الكيان المسمّى','named entity','ما يُشار إليه باسم عَلَم.'],['التعرّف على الكيانات','named entity recognition (NER)','إيجاد مقاطع الأعلام وتحديد نوعها.'],['PER / LOC / ORG / GPE','person / location / organization / geo-political entity','أنواع الكيانات الأساسية.'],['وسم BIO','BIO tagging','بداية / داخل / خارج الكيان.'],['سلسلة ماركوف','Markov chain','الحالة التالية تعتمد على الحالية فقط.'],['نموذج ماركوف المخفي','hidden Markov model (HMM)','حالات مخفية تولّد مشاهدات.'],['احتمالات الانتقال / الانبعاث','transition A / emission B','P(وسم|وسم سابق) / P(كلمة|وسم).'],['توزيع البداية','initial distribution π','احتمال البدء في كل حالة.'],['الفك','decoding','إيجاد أرجح سلسلة حالات مخفية.'],['خوارزمية فيتربي','Viterbi algorithm','برمجة ديناميكية لأفضل مسار في الشبكة.'],['المؤشر الخلفي','backpointer','الخلية التي جاء منها أفضل مسار.'],['الحقل العشوائي الشرطي','conditional random field (CRF)','نموذج سلاسل تمييزي لوغاريتمي-خطي.'],['خصائص شاملة / محلية','global / local features','F_k مجموع f_k على مواضع الجملة.'],['دالة التقسيم','partition function Z(X)','مجموع الدرجات على كل السلاسل.'],['قوالب الخصائص','feature templates','أنماط تُملأ منها الخصائص آلياً.'],['شكل الكلمة','word shape','Xx، X.X.X.، Xd-d…'],['قائمة الأماكن','gazetteer','قائمة أسماء أماكن.'],['الدقة / الاستدعاء / F1','precision / recall / F1','تقييم الكيانات على مستوى الكيان.'],['وسم صرفي','morphological tag','سلسلة خصائص صرفية بدل وسم واحد.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
