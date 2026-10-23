/* Chapter 24 · Coreference Resolution and Entity Linking — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
const bar=(lab,v,mx,txt,colr='var(--amber)')=>`<div class="br"><span class="w0" style="font-size:12.5px">${esc(lab)}</span><span class="tr"><span class="fl" style="display:block;width:${Math.max(0,v/mx*100)}%;background:${colr}"></span></span><span class="v">${txt}</span></div>`;

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s24-1','24.1','خلفية لغوية'],['s24-2','24.2','المهام والبيانات'],['s24-3','24.3','اكتشاف الإشارات'],['s24-4','24.4','البنى'],['s24-5','24.5','الخصائص اليدوية'],['s24-6','24.6','الترتيب العصبي'],['s24-7','24.7','ربط الكيانات'],['s24-8','24.8','التقييم'],['s24-9','24.9','وينوغراد'],['s24-10','24.10','التحيز الجنسي'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- the running example (24.43) ---------- */
const M=[['Victoria Chen',1,'P'],['Megabucks Banking',2,'P'],['her',1,'Pr'],['her pay',3,'D'],['the 38-year-old',1,'D'],['the company',2,'D'],['she',1,'Pr'],['Megabucks',2,'P'],['Lotsabucks',4,'P']];
const ECOL={1:'green',2:'math',3:'amber',4:'rose'};
const ENAME={1:'Victoria Chen',2:'Megabucks',3:'her pay',4:'Lotsabucks'};
// render text; f(i) returns {cls style} for mention i or null
function textHTML(f){const S=i=>{const st=f(i);return st?`<span style="${st}">`:'<span>'};
  return `${S(0)}Victoria Chen</span>, CFO of ${S(1)}Megabucks Banking</span>, saw ${S(3)}${S(2)}her</span> pay</span> jump to $2.3 million, as ${S(4)}the 38-year-old</span> also became ${S(5)}the company</span>’s president. It is widely known that ${S(6)}she</span> came to ${S(7)}Megabucks</span> from rival ${S(8)}Lotsabucks</span>.`}
const mstyle=(c,strong)=>`background:var(--${c}-soft);border-bottom:2px solid var(--${c});border-radius:4px;padding:0 2px;${strong?'outline:2px solid var(--'+c+');':''}`;

/* ---------- discourse model ---------- */
let dmK=0;
function drawDM(){$('#dmText').innerHTML=textHTML(i=>i<dmK?mstyle(ECOL[M[i][1]],i===dmK-1):null);
  const ents={};for(let i=0;i<dmK;i++){const e=M[i][1];(ents[e]=ents[e]||[]).push(M[i][0])}
  $('#dmModel').innerHTML=Object.keys(ents).map(e=>`<div style="border:1.5px solid var(--${ECOL[e]});background:var(--${ECOL[e]}-soft);border-radius:10px;padding:6px 10px;font-size:14px" dir="ltr"><b style="color:var(--${ECOL[e]})">entity ${e}</b><br>${ents[e].map(esc).join(' · ')}</div>`).join('')||'<span class="note">نموذج الخطاب فارغ</span>';
  if(!dmK){$('#dmCalc').textContent='empty model: press “next”';return}
  const i=dmK-1,e=M[i][1],first=M.findIndex(m=>m[1]===e)===i;
  $('#dmCalc').textContent=`mention ${i+1}/9: “${M[i][0]}” → ${first?`EVOKES a new entity ${e}`:`ACCESSES entity ${e} (${ENAME[e]})`}`+(dmK===9?`\nfinal chains: ${[1,2,3,4].map(e=>'{'+M.filter(m=>m[1]===e).map(m=>m[0]).join(', ')+'}').join(' ')}\nsingletons: her pay, Lotsabucks · note “her” is nested inside “her pay” but refers to a different entity`:'')}
$('#dmNext').addEventListener('click',()=>{if(dmK<9)dmK++;drawDM()});$('#dmAll').addEventListener('click',()=>{dmK=9;drawDM()});$('#dmReset').addEventListener('click',()=>{dmK=0;drawDM()});drawDM();

/* ---------- information status ---------- */
const IS=[['He had gone round one day to bring her some walnuts.','some walnuts','brand new','discourse-new + hearer-new','typical form: indefinite NP (a, some, this)'],['I read about it in the New York Times.','the New York Times','unused','discourse-new but hearer-old (also: Hong Kong, Marie Curie)','typical form: name or unique definite'],['I went to a new restaurant. It was...','It','old (evoked)','discourse-old + hearer-old','typical form: pronoun, short definite'],['I went to a superb restaurant yesterday. The chef had just opened it.','The chef','inferrable','neither discourse-old nor hearer-old, but inferable by a bridging inference: restaurants have chefs (also: “Mix flour, butter and water. Knead the dough…”)','typical form: definite NP linked to an evoked entity']];
function drawIS(){const [s,sp,n,st,fm]=IS[+segVal('#isS','i')],k=s.indexOf(sp);
  $('#isOut').innerHTML=esc(s.slice(0,k))+`<span style="${mstyle('amber')}">${esc(sp)}</span>`+esc(s.slice(k+sp.length));
  $('#isCalc').textContent=`${sp} → ${n}\n${st}\n${fm}`}
segOn('#isS',drawIS);drawIS();

/* ---------- constraints & preferences ---------- */
const CP=[{n:'(24.33)',s:'Maryam has a theorem. She is exciting.',p:'She',c:[['Maryam','gender ✓ (female)','',1],['a theorem','gender ✗ (she ≠ nonpersonal)','',0]],note:'gender agreement alone decides'},
  {n:'(24.34)',s:'Maryam has a theorem. It is exciting.',p:'It',c:[['Maryam','gender ✗ (it ≠ person)','',0],['a theorem','gender ✓','',1]],note:'same sentence, different pronoun'},
  {n:'(24.31)',s:'IBM announced a new machine translation product yesterday. They have been working on it for 20 years.',p:'They',c:[['IBM','number: singular name, but semantically plural ✓','subject',1],['a new machine translation product','number ✗ (they ≠ it, and it is taken)','object',0]],note:'number agreement cannot be enforced too strictly'},
  {n:'(24.35)',s:'Janet bought herself a bottle of fish sauce.',p:'herself',c:[['Janet','binding ✓ reflexive = subject of its clause','subject',1],['a bottle of fish sauce','binding ✗ / gender ✗','',0]],note:'reflexives corefer with the clause subject'},
  {n:'(24.36)',s:'Janet bought her a bottle of fish sauce.',p:'her',c:[['Janet','binding ✗ non-reflexive cannot be the clause subject','subject',0],['a bottle of fish sauce','gender ✗','',0]],note:'her must be some other woman from the context'},
  {n:'(24.37)',s:'The doctor found an old map in the captain’s chest. Jim found an even older map hidden on the shelf. It described an island.',p:'It',c:[['an old map','✓','older sentence',0],['the captain’s chest','✓ (agreement), unlikely','older sentence',0],['an even older map','✓','recent ✓ · object',1],['the shelf','✓','recent · oblique',0]],note:'recency prefers Jim’s map'},
  {n:'(24.38)',s:'Billy Bones went to the bar with Jim Hawkins. He called for a glass of rum.',p:'He',c:[['Billy Bones','✓','subject ✓',1],['the bar','gender ✗','',0],['Jim Hawkins','✓','oblique',0]],note:'grammatical role: the subject is most salient'},
  {n:'(24.39)',s:'Jim Hawkins went to the bar with Billy Bones. He called for a glass of rum.',p:'He',c:[['Jim Hawkins','✓','subject ✓',1],['the bar','gender ✗','',0],['Billy Bones','✓','oblique',0]],note:'swap the roles, swap the answer'},
  {n:'(24.40)',s:'John telephoned Bill. He lost the laptop.',p:'He',c:[['John','✓','subject · implicit cause of telephoning ✓',1],['Bill','✓','object',0]],note:'verb semantics (implicit causality)'},
  {n:'(24.41)',s:'John criticized Bill. He lost the laptop.',p:'He',c:[['John','✓','subject',0],['Bill','✓','object · implicit cause of criticizing ✓',1]],note:'same structure, the verb flips the preference'},
  {n:'(24.42)',s:'I ate the soup in my new bowl after cooking it for hours',p:'it',c:[['the soup','selectional ✓ (edible)','',1],['my new bowl','selectional ✗ (eat needs something edible)','',0]],note:'selectional restrictions (Chapter 22)'},
  {n:'(24.32)',s:'“I voted for Nader because he was most aligned with my values,” she said.',p:'she',c:[['I / my','person ✓ despite 1st vs 3rd: quotation','',1],['Nader','gender ✗','',0]],note:'person agreement has exceptions in quotation'}];
$('#cpS').innerHTML=CP.map((c,i)=>`<button data-i="${i}" class="${i===0?'on':''}">${c.n}</button>`).join('');
function drawCP(){const c=CP[+segVal('#cpS','i')];const hl=(s,w,st)=>{const k=s.lastIndexOf(w);return k<0?esc(s):esc(s.slice(0,k))+`<span style="${st}">${esc(w)}</span>`+esc(s.slice(k+w.length))};
  let s=hl(c.s,c.p,mstyle('amber',1));const win=c.c.find(x=>x[3]);if(win&&win[0]!=='I / my'){const k=s.indexOf(esc(win[0]));if(k>=0)s=s.slice(0,k)+`<span style="${mstyle('green')}">${esc(win[0])}</span>`+s.slice(k+esc(win[0]).length)}
  $('#cpOut').innerHTML=s;
  $('#cpTab').innerHTML='<tr><th>candidate antecedent</th><th>constraints</th><th>preferences</th><th></th></tr>'+c.c.map(x=>`<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${esc(x[2])}</td><td style="font-weight:700;color:var(--${x[3]?'green':'rose'})">${x[3]?'✓':'✗'}</td></tr>`).join('');
  $('#cpCalc').textContent=`${c.p} → ${win?win[0]:'no antecedent in this sentence'}\n${c.note}`}
segOn('#cpS',drawCP);drawCP();

/* ---------- mention detection ---------- */
const MD=[['Victoria Chen',''],['CFO of Megabucks Banking','app'],['Megabucks Banking',''],['her',''],['her pay',''],['$2.3 million','num pred'],['the 38-year-old',''],['the company',''],['the company’s president','pred'],['It','pleo'],['she',''],['Megabucks',''],['Lotsabucks','']];
const MDF=[['pleo','احذف it الحشوية'],['app','احذف البدل'],['pred','احذف الخبر/الوصف'],['num','احذف الكميات']];
$('#mdF').innerHTML=MDF.map(f=>`<label class="note"><input type="checkbox" data-f="${f[0]}"> ${f[1]}</label>`).join('');
function drawMD(){const on=new Set($$('#mdF input').filter(x=>x.checked).map(x=>x.dataset.f));
  const keep=MD.filter(m=>!m[1].split(' ').some(t=>t&&on.has(t)));
  $('#mdOut').innerHTML=MD.map(m=>{const out=!keep.includes(m);return `<span style="display:inline-block;margin:2px 4px;padding:1px 8px;border-radius:12px;border:1px solid var(--${out?'rule':m[1]?'rose':'green'});${out?'text-decoration:line-through;color:var(--soft)':`background:var(--${m[1]?'rose':'green'}-soft)`}">${esc(m[0])}</span>`}).join('');
  $('#mdCalc').textContent=`${keep.length} candidate mentions`+(keep.length===9?'  = the book’s filtered set of 9':'')+(keep.length===13?'  (all NPs, possessive pronouns, named entities)':'')+`\nred = non-referring (would hurt precision if kept)`}
$$('#mdF input').forEach(x=>x.addEventListener('change',drawMD));drawMD();

/* ---------- pleonastic it ---------- */
const MOD='necessary|possible|certain|important|likely|unlikely|clear|obvious|good|easy|hard|difficult|impossible|essential',COG='thought|believed|known|anticipated|expected|assumed|said|reported|recommended|suggested';
const PLP=[[`\\bit\\s+(?:is|was|'s)\\s+(?:\\w+ly\\s+)?(?:${MOD})\\s+that\\b`,'It is Modaladjective that S'],[`\\bit\\s+(?:is|was|'s)\\s+(?:\\w+ly\\s+)?(?:${MOD})\\s+(?:for\\s+\\w+(?:\\s+\\w+)?\\s+)?to\\b`,'It is Modaladjective (for NP) to VP'],[`\\bit\\s+(?:is|was|'s)\\s+(?:\\w+ly\\s+)?(?:${COG})\\s+that\\b`,'It is Cogv-ed that S'],[`\\bit\\s+(?:seems|appears|means|follows)\\b`,'It seems/appears/means/follows (that) S']];
const PLX=['It is widely known that she came to Megabucks from rival Lotsabucks.','It is likely that I will be late.','It is important for you to rest.','It seems that the flight was cancelled.','I bought a new book. It was cheap.','It is raining.'];
$('#plBtns').innerHTML=PLX.map((x,i)=>`<button class="btn" data-i="${i}" dir="ltr">${esc(x.length>26?x.slice(0,24)+'…':x)}</button>`).join('');
function drawPL(){const s=$('#plIn').value;const hit=PLP.find(p=>new RegExp(p[0],'i').test(s));
  $('#plCalc').textContent=hit?`pleonastic it ✓ matched pattern: ${hit[1]}\n→ not a mention; filter it out`:/\bit\b/i.test(s)?`no Lappin & Leass pattern matched → treat “it” as a candidate mention`+(/rain|snow/i.test(s)?'\n…but this weather “it” IS pleonastic: the rules miss it (one reason learned classifiers are needed)':''):'no “it” in this sentence'}
$$('#plBtns button').forEach(b=>b.addEventListener('click',()=>{$('#plIn').value=PLX[+b.dataset.i];drawPL()}));$('#plIn').addEventListener('input',drawPL);$('#plIn').value=PLX[0];drawPL();

/* ---------- mention-pair ---------- */
const PR={2:[.85,.08],4:[.6,.1,.55,.3],5:[.05,.7,.02,.1,.2],6:[.7,.05,.8,.15,.45,.1],7:[.1,.9,.02,.05,.03,.6,.02],8:[.05,.35,.01,.05,.02,.2,.01,.3]};
const ANA=[2,4,5,6,7,8];
$('#mpA').innerHTML=ANA.map((i,k)=>`<button data-i="${i}" class="${i===6?'on':''}">${M[i][0]}</button>`).join('');
function link(i,mode){const p=PR[i];if(!p)return -1;if(mode==='cf'){for(let j=i-1;j>=0;j--)if(p[j]>.5)return j;return -1}let b=-1,bv=.5;p.forEach((v,j)=>{if(v>bv){bv=v;b=j}});return b}
function clusters(mode){const par=M.map((_,i)=>i),f=x=>par[x]===x?x:(par[x]=f(par[x]));M.forEach((_,i)=>{const j=link(i,mode);if(j>=0)par[f(i)]=f(j)});const g={};M.forEach((_,i)=>{(g[f(i)]=g[f(i)]||[]).push(i)});return Object.values(g)}
function drawMP(){const i=+segVal('#mpA','i'),c=segVal('#mpC','c');const ent=M[i][1];
  if(c==='tr'){let j=-1;for(let k=i-1;k>=0;k--)if(M[k][1]===ent){j=k;break}
    $('#mpOut').innerHTML=textHTML(k=>k===i?mstyle('amber',1):k===j?mstyle('green'):(j>=0&&k>j&&k<i)?mstyle('rose'):null);
    $('#mpCalc').textContent=j<0?`“${M[i][0]}” has no antecedent → no training pairs (it starts its chain)`:`anaphor: ${M[i][0]}\npositive: (${M[i][0]}, ${M[j][0]})  ← closest antecedent\nnegatives: ${M.slice(j+1,i).map(m=>`(${M[i][0]}, ${m[0]})`).join(' ')||'none'}`;return}
  const p=PR[i],j=link(i,c);
  $('#mpOut').innerHTML=textHTML(k=>k===i?mstyle('amber',1):k===j?mstyle('green'):k<i?'border-bottom:1px dashed var(--soft)':null);
  const order=c==='cf'?[...Array(i).keys()].reverse():[...Array(i).keys()];
  const cl=clusters(c),gold=[1,2,3,4].map(e=>M.map((m,k)=>m[1]===e?k:-1).filter(k=>k>=0));const same=JSON.stringify(cl.map(x=>x.join()).sort())===JSON.stringify(gold.map(x=>x.join()).sort());
  $('#mpCalc').textContent=`${c==='cf'?'closest-first: scan right to left, take the first p > .5':'best-first: take the most probable antecedent (if p > .5)'}\n`+order.map(k=>`  p(coref | ${M[k][0]}, ${M[i][0]}) = ${r2(p[k])}${k===j?'  ← link':''}`).join('\n')+`\n${j<0?'no antecedent selected':`link: ${M[i][0]} → ${M[j][0]} (${M[j][1]===M[i][1]?'correct':'WRONG'})`}\n\nall anaphors, then transitive closure:\n${cl.map(x=>'{'+x.map(k=>M[k][0]).join(', ')+'}').join(' ')}  ${same?'= gold ✓':'≠ gold'}`}
segOn('#mpA',drawMP);segOn('#mpC',drawMP);drawMP();

/* ---------- mention-ranking softmax ---------- */
const NR=[['ε (no antecedent)',null,null,0],['Victoria Chen',1.5,1.0,1],['Megabucks Banking',1.2,-4,0],['her',0.8,1.5,1],['her pay',1.0,-3.5,0],['the 38-year-old',1.1,0.2,1],['the company',0.9,-3,0]];
const MI=1.0;
function drawNR(){const off=+$('#nrB').value;$('#nrBo').textContent=(off>0?'+':'')+off;
  const s=NR.map(r=>r[1]===null?0:MI+r[1]+r[2]+off),mx=Math.max(...s),ex=s.map(v=>Math.exp(v-mx)),Z=ex.reduce((a,b)=>a+b,0),P=ex.map(v=>v/Z);
  const best=s.indexOf(mx),gp=P.reduce((a,p,k)=>a+(NR[k][3]?p:0),0);
  $('#nrTab').innerHTML='<tr><th>candidate j</th><th>m(i)</th><th>m(j)</th><th>c(i,j)</th><th>s(i,j)</th><th>P(y=j)</th><th>gold?</th></tr>'+NR.map((r,k)=>`<tr style="${k===best?'background:var(--green-soft)':''}"><td>${esc(r[0])}</td><td class="mono">${r[1]===null?'—':r2(MI)}</td><td class="mono">${r[1]===null?'—':r2(r[1])}</td><td class="mono">${r[1]===null?'—':r2(r[2]+off)}</td><td class="mono"><b>${r2(s[k])}</b></td><td class="mono">${f3(P[k])}</td><td>${r[3]?'✓':''}</td></tr>`).join('');
  $('#nrCalc').textContent=`anaphor i = she · s(i, ε) fixed at 0\nprediction: ${NR[best][0]}`+(best===0?'  ← all real scores are negative, so the model abstains':'')+`\nloss for this mention (24.57): −log(Σ P over gold antecedents) = −log(${f3(gp)}) = ${f3(-Math.log(gp))}`}
$('#nrB').addEventListener('input',drawNR);drawNR();

/* ---------- span attention ---------- */
const TK='General Electric said the Postal Service contacted the company'.split(' '),AL=[0.5,2.0,0.3,-1.0,0.8,2.2,0.1,-1.0,2.5];
const SPN=[[0,1],[1,3],[3,5],[5,7],[7,8]];
$('#spS').innerHTML=SPN.map(([a,b],k)=>`<button data-k="${k}" class="${k===2?'on':''}">${TK.slice(a,b+1).join(' ')}</button>`).join('');
function drawSP(){const [a,b]=SPN[+segVal('#spS','k')],al=AL.slice(a,b+1),mx=Math.max(...al),ex=al.map(v=>Math.exp(v-mx)),Z=ex.reduce((x,y)=>x+y,0),w=ex.map(v=>v/Z),h=w.indexOf(Math.max(...w));
  $('#spBars').innerHTML='<div class="bars">'+w.map((v,k)=>bar(TK[a+k],v,1,'a='+r2(v),k===h?'var(--rose)':'var(--amber)')).join('')+'</div>';
  const T=TK.length;$('#spCalc').textContent=`g = [h_START = h(${TK[a]}), h_END = h(${TK[b]}), h_ATT]\nα scores: ${al.map((v,k)=>TK[a+k]+' '+r1(v)).join(', ')} → softmax (24.52) → attention head ≈ “${TK[a+h]}”\nh_ATT = Σ a_t · e_t = ${w.map((v,k)=>r2(v)+'·e('+TK[a+k]+')').join(' + ')}\nthis 9-word sentence has T(T+1)/2 = ${T*(T+1)/2} spans; Fig. 24.5 shows only a few`}
function r1(v){return (+v).toFixed(1)}
segOn('#spS',drawSP);drawSP();

/* ---------- TAGME ---------- */
const W=1e6,INL={D:5000,I:8000,cur:12000,sur:900,lang:150,dyn:6000};
const INT={'D|cur':40,'D|sur':15,'D|lang':1,'D|dyn':2500,'I|cur':120,'I|sur':20,'I|lang':2,'I|dyn':2200,'D|I':3000};
const ENT={D:'Dynasties in Chinese history',I:'Imperial China',cur:'Renminbi (Yuan currency)',sur:'Yuan (surname)',lang:'Yuan (language, Thailand)',dyn:'Yuan dynasty'};
const ANC={'Chinese Dynasty':{lp:.35,E:[['D',.92],['I',.08]]},'Yuan':{lp:.25,E:[['cur',.70],['sur',.12],['lang',.05],['dyn',.13]]}};
const lg=Math.log;
function rel(a,b){if(a===b)return 1;const k=INT[a+'|'+b]??INT[b+'|'+a]??0;if(!k)return 0;const A=INL[a],B=INL[b];const d=(lg(Math.max(A,B))-lg(k))/(lg(W)-lg(Math.min(A,B)));return Math.max(0,1-d)}
function drawTG(){const q=+segVal('#tgQ','q'),anc=q===0?['Chinese Dynasty','Yuan']:['Yuan'],EPS=0.02,LAM=0.1;
  const res={};let rows='';
  anc.forEach(a=>{const others=anc.filter(b=>b!==a);const sc=ANC[a].E.map(([e,p])=>{const r=others.reduce((s,b)=>{const Eb=ANC[b].E;return s+Eb.reduce((t,[y,py])=>t+rel(e,y)*py,0)/Eb.length},0);return {e,p,r}});
    const top=Math.max(...sc.map(x=>x.r));const near=sc.filter(x=>x.r>=top-EPS);const pick=near.reduce((a,b)=>b.p>a.p?b:a);res[a]=pick.e;
    rows+=`<tr><th colspan="4">anchor “${a}” · linkprob ${ANC[a].lp}</th></tr>`+sc.map(x=>`<tr style="${x===pick?'background:var(--green-soft)':''}"><td>${ENT[x.e]}</td><td class="mono">p(e|a) = ${r2(x.p)}</td><td class="mono">relatedness = ${f3(x.r)}</td><td>${x===pick?'✓ chosen':''}</td></tr>`).join('')});
  $('#tgTab').innerHTML=rows;
  const S=Object.values(res);const lines=anc.map(a=>{const X=res[a];const oth=S.filter(y=>y!==X);const coh=oth.length?oth.reduce((s,y)=>s+rel(y,X),0)/oth.length:0;const scv=(coh+ANC[a].lp)/2;return `${a} → ${ENT[X]} · coherence ${f3(coh)} · score = (${f3(coh)} + ${ANC[a].lp})/2 = ${f3(scv)} ${scv<LAM?'< λ: pruned':'≥ λ: kept'}`});
  $('#tgCalc').textContent=`rel(Yuan dynasty, Dynasties in Chinese history) = ${f3(rel('dyn','D'))} · rel(currency, Dynasties…) = ${f3(rel('cur','D'))}\n`+lines.join('\n')+`\n(ε = ${EPS} for the near-best set, λ = ${LAM}; `+(q===0?'the prior alone would pick the currency; relatedness to “Chinese Dynasty” rescues the dynasty)':'no other anchors: relatedness is 0 for all, so the prior decides → currency; coherence taken as 0)')}
segOn('#tgQ',drawTG);drawTG();

/* ---------- MUC / B3 ---------- */
const GOLD=[[0,2,4,6],[1,5,7],[3],[8]];
const HYP=[GOLD,[[0,2],[4,6],[1,5,7],[3],[8]],[[0,2,4,6,1,5,7],[3],[8]],[[0,4,6],[2,3],[1,5,7],[8]],M.map((_,i)=>[i])];
function part(K,H){const s=new Set();K.forEach(m=>{const h=H.findIndex(c=>c.includes(m));s.add(h<0?'x'+m:h)});return s.size}
function muc(K,R){let n=0,d=0;K.forEach(k=>{n+=k.length-part(k,R);d+=k.length-1});return d?n/d:0}
function b3(H,R){let p=0,r=0;M.forEach((_,i)=>{const h=H.find(c=>c.includes(i)),g=R.find(c=>c.includes(i));const n=h.filter(x=>g.includes(x)).length;p+=n/h.length;r+=n/g.length});return [p/M.length,r/M.length]}
const F=(p,r)=>p+r?2*p*r/(p+r):0;
const CC=['green','math','amber','rose','soft'];
function drawEV(){const H=HYP[+segVal('#evH','i')];const show=(C)=>C.map((c,k)=>`<span style="display:inline-block;margin:2px 4px;padding:1px 8px;border-radius:10px;border:1.5px solid var(--${CC[k%5]==='soft'?'rule':CC[k%5]})">{${c.map(i=>esc(M[i][0])).join(', ')}}</span>`).join('');
  $('#evOut').innerHTML='<div class="note" style="margin:0">gold R:</div>'+show(GOLD)+'<div class="note" style="margin:6px 0 0">hypothesis H:</div>'+show(H);
  const mr=muc(GOLD,H),mp=muc(H,GOLD),[bp,br]=b3(H,GOLD);
  $('#evCalc').textContent=`MUC  recall = Σ(|K|−|p(K)|)/Σ(|K|−1) over gold = ${f3(mr)}   precision (roles swapped) = ${f3(mp)}   F1 = ${f3(F(mp,mr))}\nB³   precision = ${f3(bp)}   recall = ${f3(br)}   F1 = ${f3(F(bp,br))}`+(HYP.indexOf(H)===2?'\nover-merging keeps every gold link: MUC recall 1 and precision still high, B³ punishes it more':'')+(HYP.indexOf(H)===4?'\nall singletons: MUC has no links at all (0), B³ still gives credit to the singletons':'')+'\n(the CoNLL score also averages in CEAF-e, not computed here)'}
segOn('#evH',drawEV);drawEV();

/* ---------- Winograd ---------- */
const WG=[['The city council denied the demonstrators a permit because they ',['feared','advocated'],' violence.','they',['The city council','the demonstrators'],'cultural frames about social actors'],
  ['The trophy didn’t fit into the suitcase because it was too ',['large','small'],'.','it',['The trophy','the suitcase'],'physical knowledge: a bigger object can’t fit into a smaller one'],
  ['Bill passed the gameboy to John because his turn was ',['over','next'],'.','his',['Bill','John'],'knowledge about turn-taking'],
  ['Joan made sure to thank Susan for all the help she had ',['given','received'],'.','she',['Susan','Joan'],'knowledge about thanking (Susan gave, Joan received)']];
function drawWG(){const w=WG[+segVal('#wgS','i')],v=+segVal('#wgV','v');const ans=w[4][v];
  let s=esc(w[0])+`<b style="color:var(--amber)">${w[1][v]}</b>`+esc(w[2]);s=s.replace(new RegExp('\\b'+w[3]+'\\b'),`<span style="${mstyle('amber',1)}">${w[3]}</span>`);s=s.replace(esc(ans),`<span style="${mstyle('green')}">${esc(ans)}</span>`);
  $('#wgOut').innerHTML=s;$('#wgCalc').textContent=`${w[3]} → ${ans}  (switch “${w[1][v]}” → “${w[1][1-v]}” and the answer becomes ${w[4][1-v]})\nknowledge needed: ${w[5]}`}
segOn('#wgS',drawWG);segOn('#wgV',drawWG);drawWG();

/* ---------- glossary ---------- */
const GL=[['الإشارة / العبارة المحيلة','mention / referring expression','عبارة يحيل بها الكاتب إلى كيان.'],['المرجع','referent','الكيان المحال إليه في نموذج الخطاب.'],['اتحاد المرجع','corefer','إحالة إشارتين إلى الكيان نفسه.'],['نموذج الخطاب','discourse model','نموذج ذهني للكيانات وخصائصها يُبنى تدريجياً.'],['يستحضر / يصل','evoke / access','أول ذكر / ذكر لاحق.'],['العائد / السابق','anaphor / antecedent','الإشارة اللاحقة / الإشارة التي تتحد معها قبلها.'],['المفرد','singleton','كيان بإشارة واحدة.'],['سلسلة الإحالة','coreference chain / cluster','مجموعة الإشارات المتحدة.'],['ربط الكيانات','entity linking / wikification','ربط الكيان بفرد في أنطولوجيا.'],['الإحالة البعدية','cataphora','الضمير قبل مرجعه.'],['الضمير الصفري','zero anaphor','عائد غير ملفوظ.'],['حالة المعلومة','information status','جديد تماماً، غير مستعمل، قديم، مستنتَج.'],['استنتاج الجسر','bridging inference','إضافة كيان مستنتَج من كيان مذكور.'],['البروز / الإتاحة','salience / accessibility','سهولة استحضار المرجع؛ الأبرز يُشار إليه بأقل.'],['الحشوي','expletive / pleonastic','it غير محيلة.'],['البدل / الخبر','appositive / predicative NP','عبارات واصفة غير محيلة.'],['العام','generic','إحالة إلى الصنف لا فرد.'],['نظرية الربط','binding theory','قيود الضمائر الانعكاسية وغيرها.'],['اكتشاف الإشارات','mention detection','إيجاد مقاطع الإشارات.'],['مصنّف العَود','anaphoricity classifier','هل العبارة عائدة؟'],['زوج الإشارات','mention-pair','مصنّف ثنائي لكل زوج.'],['ترتيب الإشارات','mention-ranking','softmax على السوابق + ε.'],['السابق الوهمي','dummy antecedent ε','«لا سابق».'],['الإغلاق المتعدي','transitive closure','تجميع الروابط الثنائية في عناقيد.'],['شكل الكيان','entity shape','تسلسل أنواع إشارات العنقود (P-Pr-D).'],['e2e-coref','end-to-end coreference','كل المقاطع، وm وc، وخسارة واحدة.'],['قاموس الروابط','anchor dictionary','نصوص الروابط لكل صفحة ويكيبيديا.'],['احتمال الربط','linkprob','link(a)/freq(a).'],['MUC / B³ / CEAF','MUC / B-cubed / CEAF','مقاييس الروابط / الإشارات / الكيانات.'],['مخطط وينوغراد','Winograd schema','زوج جمل تقلب كلمةٌ فيه المرجع.'],['WinoBias / GAP','WinoBias / GAP','مجموعات لقياس التحيز الجنسي.'],['الكناية','metonymy','Washington بمعنى الولايات المتحدة.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
