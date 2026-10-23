/* Chapter 19 · CFGs and Constituency Parsing — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r1=v=>(+v).toFixed(1);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s19-1','19.1','المكوّنات'],['s19-2','19.2','النحو الخالي من السياق'],['s19-3','19.3','بنوك الأشجار'],['s19-4','19.4','صيغة تشومسكي'],['s19-5','19.5','اللبس'],['s19-6','19.6','CKY'],['s19-7','19.7','التحليل العصبي بالمقاطع'],['s19-8','19.8','PARSEVAL'],['s19-9','19.9','الرؤوس'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ================= trees ================= */
/* node: {l:label, c:[children]} ; leaf: {w:word} */
function parseBr(s){s=s.replace(/\[/g,'(').replace(/\]/g,')');const tk=s.match(/\(|\)|[^\s()]+/g)||[];let p=0;
  function node(){if(tk[p]!=='(')throw 'expected (';p++;let l='';if(tk[p]!=='('&&tk[p]!==')'){l=tk[p];p++}const c=[];
    while(p<tk.length&&tk[p]!==')'){if(tk[p]==='(')c.push(node());else{const t=tk[p++];const m=t.match(/^(.+)\/([^/]+)$/);c.push(m?{l:m[2],c:[{w:m[1]}]}:{w:t})}}
    if(tk[p]!==')')throw 'unbalanced';p++;return {l,c}}
  let t=node();while(!t.l&&t.c.length===1&&t.c[0].c)t=t.c[0];return t}
function leaves(t,a=[]){if(t.w!==undefined)a.push(t);else t.c.forEach(c=>leaves(c,a));return a}
function isPre(t){return t.c&&t.c.length===1&&t.c[0].w!==undefined}
function spans(t,o={i:0},out=[]){if(t.w!==undefined){o.i++;return out}const s=o.i;t.c.forEach(c=>spans(c,o,out));if(!isPre(t))out.push([s,o.i,t.l.replace(/-.*$/,'')]);t.s=s;t.e=o.i;return out}
function drawTree(t,opt={}){const L=leaves(t);let x=0;const xs=new Map();
  (function pl(n){if(!n.c)return;if(isPre(n))n.c[0].pl=(n.l+(n.head?`(${n.head})`:'')).length;n.c.forEach(pl)})(t);
  L.forEach(lf=>{const w=Math.max(54,lf.w.length*8.2+16,(lf.pl||0)*7.4+14);xs.set(lf,x+w/2);x+=w});
  let maxD=0;(function dep(n,d){n.d=d;if(n.c)n.c.forEach(c=>dep(c,d+1));else maxD=Math.max(maxD,d)})(t,0);
  (function px(n){if(n.w!==undefined)return xs.get(n);const v=n.c.map(px);n.x=(v[0]+v[v.length-1])/2;return n.x})(t);
  const W=Math.max(x,120)+20,lh=opt.lh||46,H=(maxD)*lh+40,yOf=n=>n.w!==undefined?maxD*lh+24:n.d*lh+20;
  let s=`<svg class="map" viewBox="-10 0 ${W} ${H}" role="img" style="width:${W}px;max-width:none;display:block;margin:0 auto">`;
  (function ln(n){if(!n.c)return;n.c.forEach(c=>{const cx=c.w!==undefined?xs.get(c):c.x;s+=`<line x1="${n.x}" y1="${yOf(n)+5}" x2="${cx}" y2="${yOf(c)-13}" stroke="${c.hlE?'var(--rose)':'var(--rule)'}" stroke-width="${c.hlE?2:1.2}"/>`;ln(c)})})(t);
  (function lb(n){if(n.w!==undefined){s+=`<text x="${xs.get(n)}" y="${yOf(n)}" font-size="14" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${esc(n.w)}</text>`;return}
    const pre=isPre(n),txt=n.l+(n.head?`(${n.head})`:''),col=n.hl?'var(--rose)':n.new?'var(--green)':pre?'var(--amber)':'var(--math)';
    s+=`<text x="${n.x}" y="${yOf(n)}" font-size="${pre?12:13}" text-anchor="middle" fill="${col}" font-weight="${n.hl||n.new?700:500}" font-family="Noto Sans Mono">${esc(txt)}</text>`;n.c.forEach(lb)})(t);
  return s+'</svg>'}
function rulesOf(t,R=new Map(),Lx=new Map()){if(!t.c)return;const l=t.l.replace(/-.*$/,'');if(isPre(t)){const k=l;if(!Lx.has(k))Lx.set(k,new Set());Lx.get(k).add(t.c[0].w)}
  else{const r=l+' → '+t.c.map(c=>c.l.replace(/-.*$/,'')).join(' ');R.set(r,(R.get(r)||0)+1);t.c.forEach(c=>rulesOf(c,R,Lx))}return [R,Lx]}

/* ---------- 19.1 constituency test ---------- */
const CT=[['three parties from Brooklyn','arrive',1],['from','arrive',0],['a high-class spot such as Mindy’s','attracts',1],['as','attracts',0],['the Broadway coppers','love',1],['the','is',0],['they','sit',1],['spot','sat',0]];
$('#ctBtns').innerHTML=CT.map((c,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${esc(c[0])}</button>`).join('');
function drawCT(i){const [np,v,ok]=CT[i];$$('#ctBtns button').forEach((b,j)=>b.classList.toggle('pri',j===i));
  $('#ctCalc').textContent=`${ok?'  ':'* '}${np} ${v}…\n`+(ok?'✓ grammatical: the whole noun phrase can stand before a verb → evidence that it is a constituent (NP)':'✗ ungrammatical (*): a single word taken out of a noun phrase cannot stand there on its own')}
$$('#ctBtns button').forEach(b=>b.addEventListener('click',()=>drawCT(+b.dataset.i)));drawCT(0);

/* ---------- 19.2 L0 generator ---------- */
const L0={S:[['NP','VP']],NP:[['Pronoun'],['Proper-Noun'],['Det','Nominal']],Nominal:[['Nominal','Noun'],['Noun']],VP:[['Verb'],['Verb','NP'],['Verb','NP','PP'],['Verb','PP']],PP:[['Preposition','NP']]};
const LX0={Noun:['flights','flight','breeze','trip','morning'],Verb:['is','prefer','like','need','want','fly','do'],Adjective:['cheapest','non-stop','first','latest','other','direct'],Pronoun:['me','I','you','it'],'Proper-Noun':['Alaska','Baltimore','Los Angeles','Chicago','United','American'],Determiner:['the','a','an','this','these','that'],Preposition:['from','to','on','near','in'],Conjunction:['and','or','but']};
LX0.Det=LX0.Determiner;
$('#l0Tab').innerHTML='<tr><th>Grammar rules (Fig. 19.3)</th><th>Lexicon (Fig. 19.2)</th></tr>'+(()=>{const g=Object.entries(L0).map(([a,rs])=>`${a} → ${rs.map(r=>r.join(' ')).join(' | ')}`),l=Object.entries(LX0).filter(([k])=>k!=='Det').map(([a,w])=>`${a} → ${w.join(' | ')}`);const n=Math.max(g.length,l.length);return Array.from({length:n},(_,i)=>`<tr><td class="mono">${esc(g[i]||'')}</td><td class="mono">${esc(l[i]||'')}</td></tr>`).join('')})();
let dvR=rng(3);
function gen(sym,d){if(LX0[sym]){const w=LX0[sym];return {l:sym,c:[{w:w[Math.floor(dvR()*w.length)]}]}}
  let opts=L0[sym];if(d>4)opts=opts.filter(r=>!r.includes(sym)&&!(sym==='VP'&&r.includes('NP'))&&!(sym==='NP'&&r.includes('Nominal'))).concat(sym==='NP'?[['Pronoun']]:[]);
  if(sym==='Nominal')opts=dvR()<0.75||d>3?[['Noun']]:L0.Nominal;const r=opts[Math.floor(dvR()*opts.length)]||L0[sym][0];return {l:sym,c:r.map(x=>gen(x,d+1))}}
function derivation(t){const steps=[];let cur=[t];steps.push('S');
  for(let g=0;g<40;g++){const i=cur.findIndex(n=>n.c);if(i<0)break;cur=[...cur.slice(0,i),...cur[i].c,...cur.slice(i+1)];steps.push(cur.map(n=>n.w!==undefined?n.w:n.l).join(' '))}return steps}
function showDV(t){$('#dvTree').innerHTML=drawTree(t);const st=derivation(t),L=leaves(t).map(l=>l.w);
  const br=(function b(n){return n.w!==undefined?n.w:`[${n.l} ${n.c.map(b).join(' ')}]`})(t);
  $('#dvCalc').textContent=`sentence: ${L.join(' ')}\nleftmost derivation (${st.length-1} rewrites):\n`+st.map((s,i)=>(i?'⇒ ':'  ')+s).join('\n')+`\nbracketed: ${br}`}
$('#dvGo').addEventListener('click',()=>{dvR=rng(Date.now()%100000);let t;for(let k=0;k<20;k++){t=gen('S',0);if(leaves(t).length<=9)break}showDV(t)});
$('#dvBook').addEventListener('click',()=>showDV(parseBr('[S [NP [Pronoun I]] [VP [Verb prefer] [NP [Det a] [Nominal [Nominal [Noun morning]] [Noun flight]]]]]')));
showDV(parseBr('[S [NP [Pronoun I]] [VP [Verb prefer] [NP [Det a] [Nominal [Nominal [Noun morning]] [Noun flight]]]]]'));

/* ---------- 19.3 treebank viewer ---------- */
const TB={a:'((S (NP-SBJ (DT That) (JJ cold) (, ,) (JJ empty) (NN sky) )\n  (VP (VBD was) (ADJP-PRD (JJ full) (PP (IN of) (NP (NN fire) (CC and) (NN light) ))))\n  (. .) ))',
 b:'((S (NP-SBJ The/DT flight/NN )\n  (VP should/MD (VP arrive/VB (PP-TMP at/IN (NP eleven/CD a.m/RB )) (NP-TMP tomorrow/NN )))))',
 c:'[S [NP [Pro I]] [VP [V prefer] [NP [Det a] [Nom [Nom [N morning]] [N flight]]]]]'};
function drawTR(){try{const t=parseBr($('#trIn').value);$('#trTree').innerHTML=drawTree(t);const [R,Lx]=rulesOf(t);
  $('#trCalc').textContent=`${leaves(t).length} words, ${[...R.values()].reduce((a,b)=>a+b,0)} rule applications\nextracted grammar (function tags like -SBJ stripped):\n`+[...R.keys()].map(r=>'  '+r).join('\n')+'\nlexicon:\n'+[...Lx.entries()].map(([k,v])=>`  ${k} → ${[...v].join(' | ')}`).join('\n')}
  catch(e){$('#trCalc').textContent='cannot read the brackets: '+e}}
$('#trIn').addEventListener('input',drawTR);$$('#trBox button[data-t]').forEach(b=>b.addEventListener('click',()=>{$('#trIn').value=TB[b.dataset.t];drawTR()}));$('#trIn').value=TB.a;drawTR();

/* ---------- 19.5 elephant ---------- */
const ELE={np:'[S [NP [Pronoun I]] [VP [Verb shot] [NP [Det an] [Nominal [Nominal [Noun elephant]] [PP [Preposition in] [NP [Det my] [Nominal [Noun pajamas]]]]]]]]',
 vp:'[S [NP [Pronoun I]] [VP [Verb shot] [NP [Det an] [Nominal [Noun elephant]]] [PP [Preposition in] [NP [Det my] [Nominal [Noun pajamas]]]]]]'};
function markPP(t){(function m(n,p){if(!n.c)return;if(n.l==='PP'){n.hl=true;n.hlE=true;if(p)p.hl=true}n.c.forEach(c=>m(c,n))})(t,null);return t}
function drawAM(){const m=segVal('#amM','m'),t=markPP(parseBr(ELE[m]));$('#amTree').innerHTML=drawTree(t);
  $('#amCalc').textContent=m==='np'?'rule used: Nominal → Nominal PP   the PP is inside the NP headed by “elephant”\n→ the (humorous) reading: the elephant is in my pajamas':'rule used: VP → Verb NP PP   the PP is a sister of the verb “shot”\n→ the intended reading: I was in my pajamas when I shot it\nboth trees are licensed by L₁: the grammar alone cannot choose'}
segOn('#amM',drawAM);drawAM();

/* ---------- CNF table ---------- */
const CNFR=[['S → NP VP','S → NP VP'],['S → Aux NP VP','S → X1 VP<br>X1 → Aux NP'],['S → VP','S → book | include | prefer<br>S → Verb NP<br>S → X2 PP<br>S → Verb PP<br>S → VP PP'],['NP → Pronoun','NP → I | she | me'],['NP → Proper-Noun','NP → United | Houston'],['NP → Det Nominal','NP → Det Nominal'],['Nominal → Noun','Nominal → book | flight | meal | money'],['Nominal → Nominal Noun','Nominal → Nominal Noun'],['Nominal → Nominal PP','Nominal → Nominal PP'],['VP → Verb','VP → book | include | prefer'],['VP → Verb NP','VP → Verb NP'],['VP → Verb NP PP','VP → X2 PP<br>X2 → Verb NP'],['VP → Verb PP','VP → Verb PP'],['VP → VP PP','VP → VP PP'],['PP → Preposition NP','PP → Preposition NP']];
$('#cnfTab').innerHTML='<tr><th>L₁ Grammar</th><th>L₁ in CNF</th></tr>'+CNFR.map(([a,b])=>`<tr style="${a===b?'':'background:var(--amber-soft)'}"><td class="mono">${a}</td><td class="mono">${b}</td></tr>`).join('')+'<tr><td colspan="2" class="note">Lexicon: Det → that | this | the | a · Noun → book | flight | meal | money · Verb → book | include | prefer · Pronoun → I | she | me · Proper-Noun → Houston | United · Aux → does · Preposition → from | to | on | near | through</td></tr>';

/* ---------- CKY ---------- */
const BIN=[['S','NP','VP'],['S','X1','VP'],['X1','Aux','NP'],['S','Verb','NP'],['S','X2','PP'],['S','Verb','PP'],['S','VP','PP'],['NP','Det','Nominal'],['Nominal','Nominal','Noun'],['Nominal','Nominal','PP'],['VP','Verb','NP'],['VP','X2','PP'],['X2','Verb','NP'],['VP','Verb','PP'],['VP','VP','PP'],['PP','Preposition','NP']];
const LEX={Det:['that','this','the','a'],Noun:['book','flight','meal','money'],Verb:['book','include','prefer'],Pronoun:['i','she','me'],'Proper-Noun':['houston','united'],Aux:['does'],Preposition:['from','to','on','near','through'],
  S:['book','include','prefer'],VP:['book','include','prefer'],NP:['i','she','me','united','houston'],Nominal:['book','flight','meal','money']};
const LORD=['S','VP','X2','X1','NP','Nominal','PP','Verb','Noun','Det','Pronoun','Proper-Noun','Aux','Preposition'];
let CK={};
function ckInit(){const w=$('#ckS').value.split(/\s+/),n=w.length,T={};const order=[];
  for(let j=1;j<=n;j++){order.push([j-1,j]);for(let i=j-2;i>=0;i--)order.push([i,j])}
  CK={w,n,T,order,step:0,sel:null,parse:0};drawCK()}
function cell(i,j){return CK.T[i+','+j]||(CK.T[i+','+j]=new Map())}
function ckFill([i,j]){const C=cell(i,j),log=[];
  if(j===i+1){const wd=CK.w[i].toLowerCase();Object.entries(LEX).forEach(([A,ws])=>{if(ws.includes(wd)){C.set(A,[{word:CK.w[i]}]);}});log.push(`lexical: ${[...C.keys()].sort((a,b)=>LORD.indexOf(a)-LORD.indexOf(b)).join(', ')||'— (unknown word!)'} → ${CK.w[i]}`)}
  else for(let k=i+1;k<j;k++){const L=cell(i,k),R=cell(k,j);const hits=[];BIN.forEach(([A,B,Cc])=>{if(L.has(B)&&R.has(Cc)){if(!C.has(A))C.set(A,[]);C.get(A).push({k,B,C:Cc});hits.push(`${A} → ${B} ${Cc}`)}});
    log.push(`k=${k}: [${i},${k}]={${[...L.keys()].join(',')||'∅'}} × [${k},${j}]={${[...R.keys()].join(',')||'∅'}}  ${hits.length?'⇒ '+hits.join(', '):'no rule'}`)}
  return log}
function count(i,j,A,memo={}){const key=i+','+j+','+A;if(key in memo)return memo[key];const es=(CK.T[i+','+j]||new Map()).get(A)||[];let s=0;
  es.forEach(e=>{s+=e.word!==undefined?1:count(i,e.k,e.B,memo)*count(e.k,j,e.C,memo)});return memo[key]=s}
function trees(i,j,A,lim=30){const es=CK.T[i+','+j].get(A)||[];const out=[];
  for(const e of es){if(out.length>=lim)break;if(e.word!==undefined){out.push({l:A,c:[{w:e.word}]});continue}
    const L=trees(i,e.k,e.B,lim),R=trees(e.k,j,e.C,lim);for(const a of L)for(const b of R){if(out.length<lim)out.push({l:A,c:[a,b]})}}return out}
function drawCK(){const {w,n,step,order}=CK;let logs=CK.logs||{};
  const W=Math.max(520,n*96),cw=(W-40)/n,ch=58;let s=`<svg class="map" viewBox="0 0 ${W} ${n*ch+34}" role="img" style="width:${W}px;max-width:none;display:block">`;
  w.forEach((x,j)=>{s+=`<text x="${40+j*cw+cw/2}" y="16" font-size="13" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${esc(x)}</text>`});
  const filled=new Set(order.slice(0,step).map(c=>c.join()));const cur=step>0?order[step-1].join():null;
  for(let i=0;i<n;i++)for(let j=i+1;j<=n;j++){const x=40+(j-1)*cw,y=24+i*ch,key=i+','+j,f=filled.has(key),C=CK.T[key],sel=CK.sel===key;
    const labs=f&&C?[...C.keys()].sort((a,b)=>LORD.indexOf(a)-LORD.indexOf(b)):[];
    s+=`<g data-c="${key}" style="cursor:pointer"><rect x="${x+3}" y="${y+3}" width="${cw-6}" height="${ch-6}" rx="5" fill="${key===cur?'var(--amber-soft)':f?(labs.length?'var(--math-soft)':'var(--tint)'):'var(--paper)'}" stroke="${sel?'var(--rose)':key==='0,'+n&&labs.includes('S')?'var(--green)':'var(--rule)'}" stroke-width="${sel||(key==='0,'+n&&labs.includes('S'))?2.2:1}"/>`;
    s+=`<text x="${x+8}" y="${y+16}" font-size="9.5" fill="var(--soft)" font-family="Noto Sans Mono">[${i},${j}]</text>`;
    const txt=labs.map(l=>{const c=C.get(l).length;return c>1?`${l}×${c}`:l});const lines=[];let curL='';txt.forEach(t=>{if((curL+', '+t).length>Math.floor(cw/6.6)&&curL){lines.push(curL);curL=t}else curL=curL?curL+', '+t:t});if(curL)lines.push(curL);
    lines.slice(0,3).forEach((l,q)=>{s+=`<text x="${x+cw/2}" y="${y+30+q*12}" font-size="10.5" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans Mono">${esc(l)}</text>`});s+='</g>'}
  $('#ckTab').innerHTML=s+'</svg>';
  $$('#ckTab g[data-c]').forEach(g=>g.addEventListener('click',()=>{CK.sel=g.dataset.c;drawCK()}));
  let m;const done=step>=order.length;
  if(CK.sel&&logs[CK.sel])m=`cell [${CK.sel}]:\n`+logs[CK.sel].join('\n');
  else if(step===0)m=`${n} words → fenceposts 0…${n}; cells are filled column by column (left to right), each column bottom-up.\npress “next step”`;
  else{const k=order[step-1].join();m=`filled cell [${k}] (step ${step} of ${order.length}):\n`+(logs[k]||[]).join('\n')}
  if(done){const S=CK.T['0,'+n].get('S');const cnt=S?count(0,n,'S'):0;m+=`\n\n${cnt?`✓ S in [0,${n}]: the sentence is grammatical — ${cnt} parse${cnt>1?'s':''}`:`✗ no S in [0,${n}]: not in the language of L₁`}`;
    $('#ckParses').innerHTML=cnt?`<span class="note">parses:</span> `+trees(0,n,'S',12).map((_,q)=>`<button class="btn${q===CK.parse?' pri':''}" data-p="${q}">S #${q+1}</button>`).join(''):'';
    $$('#ckParses button').forEach(b=>b.addEventListener('click',()=>{CK.parse=+b.dataset.p;drawCK()}));
    if(cnt){const t=trees(0,n,'S',12)[Math.min(CK.parse,cnt-1)];(function mk(nd){if(nd.c){if(/^X\d/.test(nd.l))nd.new=true;nd.c.forEach(mk)}})(t);$('#ckTree').innerHTML=drawTree(t);m+=`\nshowing parse #${CK.parse+1} in CNF (green X1/X2 = dummy non-terminals; delete them and promote their daughters to recover the L₁ tree)`}else $('#ckTree').innerHTML=''}
  else{$('#ckParses').innerHTML='';$('#ckTree').innerHTML=''}
  $('#ckCalc').textContent=m}
function ckStep(){if(CK.step<CK.order.length){CK.logs=CK.logs||{};const c=CK.order[CK.step];CK.logs[c.join()]=ckFill(c);CK.step++;CK.sel=null}drawCK()}
$('#ckNext').addEventListener('click',ckStep);$('#ckAll').addEventListener('click',()=>{while(CK.step<CK.order.length){const c=CK.order[CK.step];CK.logs=CK.logs||{};CK.logs[c.join()]=ckFill(c);CK.step++}CK.sel=null;drawCK()});
$('#ckS').addEventListener('change',()=>{CK.logs={};ckInit()});CK.logs={};ckInit();

/* ---------- 19.7 span-based CKY ---------- */
const SW=['Book','the','flight','through','Houston'];
function spanScores(){const s={};const set=(i,j,l,v)=>{(s[i+','+j]=s[i+','+j]||{})[l]=v};
  ['VB','DT','NN','IN','NNP'].forEach((t,i)=>set(i,i+1,t,2));
  set(0,5,'S',4);set(1,5,'NP',+$('#spN').value);set(0,3,'VP',+$('#spV').value);set(1,3,'NP',2);set(3,5,'PP',2.5);set(2,5,'Nominal',0.5);return s}
function bestLab(s,i,j){const d=s[i+','+j]||{};let bl='∅',bv=j-i>1?0:-Infinity;Object.entries(d).forEach(([l,v])=>{if(v>bv){bv=v;bl=l}});if(j-i>1&&bv<0){bl='∅';bv=0}return [bl,bv]}
function drawSP(){$('#spNo').textContent=r1($('#spN').value);$('#spVo').textContent=r1($('#spV').value);const s=spanScores(),n=5,B={},K={};
  for(let len=1;len<=n;len++)for(let i=0;i+len<=n;i++){const j=i+len,[l,v]=bestLab(s,i,j);if(len===1){B[i+','+j]=v;continue}let bk=-1,bv=-Infinity;for(let k=i+1;k<j;k++){const t=B[i+','+k]+B[k+','+j];if(t>bv){bv=t;bk=k}}B[i+','+j]=v+bv;K[i+','+j]=bk}
  function build(i,j){const [l]=bestLab(s,i,j);if(j-i===1)return {l,c:[{w:SW[i]}]};const k=K[i+','+j],kids=[build(i,k),build(k,j)].flatMap(c=>c.l==='∅'?c.c:[c]);return {l,c:kids}}
  const t=build(0,n);$('#spTree').innerHTML=drawTree(t);const used=spans(t).map(([a,b,l])=>`${l}[${a},${b}]=${(s[a+','+b]||{})[l]}`);
  const vpAttach=t.c.some(c=>c.l==='VP');
  $('#spCalc').textContent=`s_best(0,5) = ${r1(B['0,5'])}   (sum of the scores of all labelled spans in the tree; ∅ = “not a constituent”, score 0)\nspans used: ${used.join(', ')}  + 5 POS spans × 2\n→ ${vpAttach?'VP attachment: [VP Book the flight] [PP through Houston]  (booking happens through Houston)':'NP attachment: Book [NP the flight through Houston]'}\nraise the VP[0,3] score above the NP[1,5] score to flip the decision\n(all scores are made up; a real parser computes s(i,j,l) with BERT + an MLP, Eq. 19.6)`}
['#spN','#spV'].forEach(x=>$(x).addEventListener('input',drawSP));drawSP();

/* ---------- 19.8 PARSEVAL ---------- */
function drawPV(){const m=segVal('#pvM','m'),ref=parseBr(ELE.vp),hyp=parseBr(m==='np'?ELE.np:ELE.vp);const R=spans(ref),H=spans(hyp);const rk=R.map(x=>x.join()),hk=H.map(x=>x.join());
  const ok=H.filter(h=>rk.includes(h.join())).length,P=ok/H.length,Rc=ok/R.length,F=2*P*Rc/(P+Rc);
  const cross=H.filter(([a,b])=>R.some(([c,d])=>(a<c&&c<b&&b<d)||(c<a&&a<d&&d<b))).length;
  const all=[...new Set([...rk,...hk])].map(k=>k.split(',')).sort((x,y)=>(+x[0]-+y[0])||(+y[1]-+x[1]));const W='I shot an elephant in my pajamas'.split(' ');
  $('#pvTab').innerHTML='<tr><th>constituent</th><th>words</th><th>reference</th><th>hypothesis</th></tr>'+all.map(([a,b,l])=>{const k=[a,b,l].join(),inR=rk.includes(k),inH=hk.includes(k);return `<tr style="${inR&&inH?'':'background:var(--rose-soft)'}"><td class="mono">${l} [${a},${b}]</td><td>${W.slice(+a,+b).join(' ')}</td><td>${inR?'✓':''}</td><td>${inH?'✓':''}</td></tr>`}).join('');
  $('#pvCalc').textContent=`reference constituents: ${R.length}   hypothesis constituents: ${H.length}   correct (same start, end, label): ${ok}\nlabeled recall = ${ok}/${R.length} = ${f3(Rc)}   labeled precision = ${ok}/${H.length} = ${f3(P)}   F1 = ${f3(F)}\ncrossing brackets: ${cross}`+(cross?'  (Nominal[3,7] “elephant in my pajamas” crosses the reference NP[2,4] “an elephant”)':'')+'\n(pre-terminal POS nodes are not counted, as in evalb)'}
segOn('#pvM',drawPV);drawPV();

/* ---------- 19.9 heads ---------- */
const HR={S:['L',['TO','IN','VP','S','SBAR','ADJP','UCP','NP']],VP:['L',['TO','VBD','VBN','MD','VBZ','VB','VBG','VBP','VP','ADJP','NN','NNS','NP']],PP:['L',['IN','TO','P']]};
function npHead(n){const k=n.c.map(c=>c.l);if(k[k.length-1]==='POS')return [n.c.length-1,'last word is POS'];
  for(let i=k.length-1;i>=0;i--)if(['NN','NNP','NNPS','NX','POS','JJR'].includes(k[i]))return [i,`right-to-left: first ${k[i]}`];
  for(let i=0;i<k.length;i++)if(k[i]==='NP')return [i,'left-to-right: first NP'];
  return [n.c.length-1,'no listed tag found → last word (NNS is not in the book’s list)']}
function headChild(n){if(n.l==='NP')return npHead(n);const r=HR[n.l];if(!r)return [0,'no rule'];const k=n.c.map(c=>c.l);
  for(const p of r[1]){const idx=r[0]==='L'?k.indexOf(p):k.lastIndexOf(p);if(idx>=0)return [idx,`${n.l}: search ${r[0]==='L'?'left-to-right':'right-to-left'} for ${r[1].slice(0,r[1].indexOf(p)+1).join(' → ')}`+(n.l==='PP'?'  (PP rule: our assumption, not in Fig. 19.17)':'')]}
  return [0,'default']}
let hdT,hdLvl=0;
function hdInit(){hdT=parseBr('(S (NP (NNS workers)) (VP (VBD dumped) (NP (NNS sacks)) (PP (P into) (NP (DT a) (NN bin)))))');hdLvl=0;
  (function h(n){if(n.w!==undefined)return 0;n.ht=isPre(n)?0:1+Math.max(...n.c.map(h));return n.ht})(hdT);drawHD([])}
function drawHD(log){$('#hdTree').innerHTML=drawTree(hdT,{lh:50});$('#hdCalc').textContent=hdLvl===0?'press the button: first every POS node takes its own word as head, then heads percolate up level by level':log.join('\n')+(hdLvl>hdT.ht?'\n✓ done: S(dumped) — the lexicalized tree of Fig. 19.16':'')}
function hdStep(){if(hdLvl>hdT.ht)return;const log=[];(function walk(n){if(n.w!==undefined)return;n.new=false;n.c.forEach(walk);
    if(n.ht===hdLvl){if(isPre(n)){n.head=n.c[0].w;log.push(`${n.l} → ${n.head} (its own word)`)}else{const [i,why]=headChild(n);n.head=n.c[i].head;log.push(`${n.l}: head child = ${n.c[i].l}(${n.head})   [${why}]`)}n.new=true}})(hdT);hdLvl++;drawHD(log)}
$('#hdStep').addEventListener('click',hdStep);$('#hdReset').addEventListener('click',hdInit);hdInit();

/* ---------- glossary ---------- */
const GL=[['النحو / التركيب','syntax','طريقة ترتيب الكلمات معاً.'],['المكوّن','constituent','مجموعة كلمات تتصرف وحدة واحدة.'],['العبارة الاسمية / الفعلية / الجرية','noun / verb / prepositional phrase (NP / VP / PP)','أنواع المكوّنات الأساسية.'],['النحو الخالي من السياق','context-free grammar (CFG)','قواعد إعادة كتابة يسارها رمز واحد.'],['القاعدة / الإنتاج','rule / production','A → β.'],['المعجم','lexicon','القواعد التي تُدخل الكلمات.'],['نهائي / غير نهائي','terminal / non-terminal','كلمة / رمز تجريدي.'],['رمز البداية','start symbol S','الرمز الذي تُشتق منه الجمل.'],['الاشتقاق','derivation','سلسلة تطبيقات القواعد.'],['شجرة التحليل','parse tree','تمثيل الاشتقاق شجرةً.'],['يهيمن','dominates','العقدة فوق كل ما تحتها.'],['الصيغة القوسية','bracketed notation','[S [NP …] [VP …]].'],['النحو التوليدي','generative grammar','اللغة = ما يولّده النحو.'],['بنك الأشجار','treebank','مدوّنة جملها موسومة بأشجارها.'],['تكافؤ قوي / ضعيف','strong / weak equivalence','نفس السلاسل والبنى / نفس السلاسل فقط.'],['صيغة تشومسكي المعيارية','Chomsky normal form (CNF)','A → B C أو A → a.'],['الإنتاج الأحادي','unit production','A → B.'],['الإلحاق التشومسكي','Chomsky-adjunction','A → A B.'],['اللبس البنيوي','structural ambiguity','أكثر من شجرة للجملة.'],['لبس التعلّق / العطف','attachment / coordination ambiguity','أين يتعلق المكوّن / ما الذي يُعطف.'],['البرمجة الديناميكية','dynamic programming','ملء جدول بحلول المسائل الجزئية.'],['CKY','Cocke-Kasami-Younger algorithm','تحليل بجدول مثلثي لنحو CNF.'],['أعمدة السياج','fenceposts','الفواصل بين الكلمات 0…n.'],['المُعرِّف / المحلل','recognizer / parser','يقرر النحوية / يعطي الأشجار.'],['التحليل القائم على المقاطع','span-based (neural CKY) parsing','درجة لكل مقطع موسوم ثم CKY.'],['PARSEVAL','PARSEVAL metrics','الاستدعاء والدقة الموسومان للمكوّنات.'],['الأقواس المتقاطعة','crossing brackets','((A B) C) مقابل (A (B C)).'],['evalb','evalb','التنفيذ المعياري لـ PARSEVAL.'],['الرأس المعجمي','lexical head','أهم كلمة نحوياً في المكوّن.'],['جدول ارتشاح الرؤوس','head percolation table','قواعد اتجاه وأولويات لإيجاد الرأس.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
