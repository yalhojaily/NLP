/* Chapter 22 · Semantic Role Labeling — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s22-1','22.1','الأدوار الدلالية'],['s22-2','22.2','التناوبات'],['s22-3','22.3','مشكلات الأدوار'],['s22-4','22.4','PropBank'],['s22-5','22.5','FrameNet'],['s22-6','22.6','وسم الأدوار'],['s22-7','22.7','القيود الانتقائية'],['s22-8','22.8','التفكيك إلى أوليات'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- role-span renderer ---------- */
const RC={ARG0:'green',AGENT:'green',BUYER:'green',ITEM:'amber',ARG1:'amber',THEME:'amber',GOODS:'amber',ARG2:'math',INSTRUMENT:'math',GOAL:'math',DIFFERENCE:'math',ARG3:'rose',ARG4:'rose',ATTRIBUTE:'rose','FINAL VALUE':'rose','INITIAL VALUE':'rose','FINAL STATE':'rose',GROUP:'rose'};
function col(l){if(!l)return null;if(RC[l])return RC[l];if(/^ARGM|^Arg ?M/i.test(l))return 'rose';if(/PRED|TARGET|^V$/.test(l))return 'soft';return 'math'}
function rspans(segs){return segs.map(([t,l])=>{if(!l)return esc(t);const c=col(l);const bg=c==='soft'?'var(--tint)':`var(--${c}-soft)`,fg=c==='soft'?'var(--ink)':`var(--${c})`;
  return `<span style="background:${bg};border:1px solid ${fg};border-radius:6px;padding:1px 5px;white-space:nowrap;display:inline-block;line-height:1.5;margin:2px 0">${esc(t)}<sub style="color:${fg};font-family:var(--f-mono);font-size:11px;font-weight:600;margin-inline-start:4px">${esc(l)}</sub></span>`}).join(' ')}

/* ---------- five purchase forms ---------- */
const BY=[[['XYZ corporation','BUYER'],['bought','PRED'],['the stock','GOODS'],['.']],'subject of bought',
  [['They'],['sold','PRED'],['the stock','GOODS'],['to'],['XYZ corporation','BUYER'],['.']],'object of “to” after sold (indirect object)',
  [['The stock','GOODS'],['was bought','PRED'],['by'],['XYZ corporation','BUYER'],['.']],'object of “by” in a passive',
  [['The'],['purchase','PRED'],['of'],['the stock','GOODS'],['by'],['XYZ corporation','BUYER'],['...']],'by-phrase of the noun purchase',
  [['The stock','GOODS'],['purchase','PRED'],['by'],['XYZ corporation','BUYER'],['...']],'by-phrase of a noun compound'];
const byN=BY.length/2;$('#byBtns').innerHTML=Array.from({length:byN},(_,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${i+1}</button>`).join('');
function drawBY(i){$$('#byBtns button').forEach((b,j)=>b.classList.toggle('pri',j===i));$('#byOut').innerHTML=rspans(BY[2*i]);
  $('#byCalc').textContent=`surface position of XYZ: ${BY[2*i+1]}\nsemantic role of XYZ: BUYER (the same in all five)`}
$$('#byBtns button').forEach(b=>b.addEventListener('click',()=>drawBY(+b.dataset.i)));drawBY(0);

/* ---------- thematic roles (Figs 22.1, 22.2) ---------- */
const TR=[['AGENT','The volitional causer of an event','The waiter spilled the soup.','The waiter'],['EXPERIENCER','The experiencer of an event','John has a headache.','John'],['FORCE','The non-volitional causer of the event','The wind blows debris from the mall into our yards.','The wind'],['THEME','The participant most directly affected by an event','Only after Benjamin Franklin broke the ice...','the ice'],['RESULT','The end product of an event','The city built a regulation-size baseball diamond...','a regulation-size baseball diamond'],['CONTENT','The proposition or content of a propositional event','Mona asked “You met Mary Ann at a supermarket?”','“You met Mary Ann at a supermarket?”'],['INSTRUMENT','An instrument used in an event','He poached catfish, stunning them with a shocking device...','a shocking device'],['BENEFICIARY','The beneficiary of an event','Whenever Ann Callahan makes hotel reservations for her boss...','her boss'],['SOURCE','The origin of the object of a transfer event','I flew in from Boston.','Boston'],['GOAL','The destination of an object of a transfer event','I drove to Portland.','Portland']];
$('#trBtns').innerHTML=TR.map((t,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${t[0]}</button>`).join('');
function drawTR(i){$$('#trBtns button').forEach((b,j)=>b.classList.toggle('pri',j===i));const [r,d,ex,sp]=TR[i],k=ex.indexOf(sp);
  $('#trOut').innerHTML=esc(ex.slice(0,k))+rspans([[sp,r]])+esc(ex.slice(k+sp.length));$('#trCalc').textContent=`${r}: ${d}`}
$$('#trBtns button').forEach(b=>b.addEventListener('click',()=>drawTR(+b.dataset.i)));drawTR(0);

/* ---------- diathesis alternations ---------- */
const DT=[[[['John','AGENT'],['broke'],['the window','THEME'],['.']],[['AGENT','Subject'],['THEME','Object']]],
  [[['John','AGENT'],['broke'],['the window','THEME'],['with a rock','INSTRUMENT'],['.']],[['AGENT','Subject'],['THEME','Object'],['INSTRUMENT','PP-with']]],
  [[['The rock','INSTRUMENT'],['broke'],['the window','THEME'],['.']],[['INSTRUMENT','Subject'],['THEME','Object']]],
  [[['The window','THEME'],['broke'],['.']],[['THEME','Subject']]],
  [[['The window','THEME'],['was broken by'],['John','AGENT'],['.']],[['THEME','Subject'],['AGENT','PP-by (passive)']]],
  [[['Doris','AGENT'],['gave'],['the book','THEME'],['to'],['Cary','GOAL'],['.']],[['AGENT','Subject'],['THEME','Object'],['GOAL','PP-to']]],
  [[['Doris','AGENT'],['gave'],['Cary','GOAL'],['the book','THEME'],['.']],[['AGENT','Subject'],['GOAL','first Object'],['THEME','second Object']]]];
function drawDT(){const i=+segVal('#dtS','i');const [sg,rz]=DT[i];$('#dtOut').innerHTML=rspans(sg);
  $('#dtTab').innerHTML='<tr><th>role</th><th>syntactic position</th></tr>'+rz.map(r=>`<tr><td class="mono">${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  $('#dtCalc').textContent=i<5?`verb: break · realization: ${rz.map(r=>r[0]+'/'+r[1]).join(', ')}\nbreak’s thematic grid so far: {AGENT, THEME, INSTRUMENT}`:`verb: give · dative alternation: (22.8a) THEME before GOAL, (22.8b) GOAL before THEME`}
segOn('#dtS',drawDT);drawDT();

/* ---------- proto-roles ---------- */
const PA=['volitionally involved','causes an event / change of state','sentient / intentional','moving'],PP=['undergoes change of state','causally affected by another participant','stationary relative to others'];
const PPX=[['Sasha',[1,1,1,1],[0,0,0]],['the window',[0,0,0,0],[1,1,1]],['The rock',[0,1,0,1],[0,1,0]],['John (has a headache)',[0,0,1,0],[1,0,1]],['The wind',[0,1,0,1],[0,0,0]]];
let ppS=PPX.map(x=>[x[1].slice(),x[2].slice()]);
function drawPP(){const i=+segVal('#ppS','i'),[a,p]=ppS[i];
  $('#ppChk').innerHTML=PA.map((t,j)=>`<label class="note" style="color:var(--green)"><input type="checkbox" data-g="0" data-j="${j}" ${a[j]?'checked':''}> ${t}</label>`).join('')+PP.map((t,j)=>`<label class="note" style="color:var(--amber)"><input type="checkbox" data-g="1" data-j="${j}" ${p[j]?'checked':''}> ${t}</label>`).join('');
  $$('#ppChk input').forEach(c=>c.addEventListener('change',()=>{ppS[i][+c.dataset.g][+c.dataset.j]=c.checked?1:0;drawPP()}));
  const na=a.reduce((x,y)=>x+y,0),np=p.reduce((x,y)=>x+y,0);
  $('#ppCalc').textContent=`${PPX[i][0]}: agent-like properties ${na}/4 · patient-like properties ${np}/3\n→ `+(na>np?'more likely PROTO-AGENT':np>na?'more likely PROTO-PATIENT':'a tie: no clear proto-role')+`\n(no single property is necessary or sufficient; the more properties, the likelier the label)`}
segOn('#ppS',drawPP);drawPP();

/* ---------- PropBank ---------- */
const PB={agree:{f:'agree.01\n  Arg0: Agreer\n  Arg1: Proposition\n  Arg2: Other entity agreeing',ex:[['(22.11) Ex1',[['The group','Arg0'],['agreed','V'],['it wouldn’t make an offer','Arg1'],['.']]],['(22.11) Ex2',[['Usually','ArgM-TMP'],['John','Arg0'],['agrees','V'],['with Mary','Arg2'],['on everything','Arg1'],['.']]]]},
  fall:{f:'fall.01\n  Arg1: Logical subject, patient, thing falling\n  Arg2: Extent, amount fallen\n  Arg3: start point\n  Arg4: end point, end state of arg1\n  (no Arg0: the normal subject of fall is a PROTO-PATIENT)',ex:[['(22.12) Ex1',[['Sales','Arg1'],['fell','V'],['to $25 million','Arg4'],['from $27 million','Arg3'],['.']]],['(22.12) Ex2',[['The average junk bond','Arg1'],['fell','V'],['by 4.2%','Arg2'],['.']]]]},
  increase:{f:'increase.01 “go up incrementally”\n  Arg0: causer of increase\n  Arg1: thing increasing\n  Arg2: amount increased by, EXT, or MNR\n  Arg3: start point\n  Arg4: end point',ex:[['(22.14)',[['Big Fruit Co.','Arg0'],['increased','V'],['the price of bananas','Arg1'],['.']]],['(22.15)',[['The price of bananas','Arg1'],['was increased again','V'],['by Big Fruit Co.','Arg0']]],['(22.16)',[['The price of bananas','Arg1'],['increased','V'],['5%','Arg2'],['.']]]]}};
let pbI=0;
function drawPB(){const v=PB[segVal('#pbV','v')];$('#pbFrame').textContent=v.f;if(pbI>=v.ex.length)pbI=0;
  $('#pbEx').innerHTML=v.ex.map((e,i)=>`<button class="btn${i===pbI?' pri':''}" data-i="${i}" dir="ltr">${e[0]}</button>`).join('');
  $$('#pbEx button').forEach(b=>b.addEventListener('click',()=>{pbI=+b.dataset.i;drawPB()}));
  $('#pbOut').innerHTML=rspans(v.ex[pbI][1].map(([t,l])=>[t,l?l.toUpperCase().replace('ARGM','ARGM'):l]))}
segOn('#pbV',()=>{pbI=0;drawPB()});drawPB();

/* ---------- FrameNet ---------- */
const FN=[['(22.20)',[['Oil','ITEM'],['rose','TARGET'],['in price','ATTRIBUTE'],['by 2%','DIFFERENCE'],['.']]],['(22.21)',[['It','ITEM'],['has increased','TARGET'],['to having them 1 day a month','FINAL STATE'],['.']]],['(22.22)',[['Microsoft shares','ITEM'],['fell','TARGET'],['to 7 5/8','FINAL VALUE'],['.']]],['(22.23)',[['Colon cancer incidence','ITEM'],['fell','TARGET'],['by 50%','DIFFERENCE'],['among men','GROUP'],['.']]],['(22.24)',[['a steady'],['increase','TARGET'],['from 9.5','INITIAL VALUE'],['to 14.3','FINAL VALUE'],['in dividends','ITEM']]],['(22.25)',[['a'],['5%','DIFFERENCE'],['dividend','ITEM'],['increase','TARGET'],['...']]],['(22.26)',[['They','AGENT'],['raised','TARGET'],['the price of their soda','ITEM'],['by 2%','DIFFERENCE'],['.']]]];
$('#fnBtns').innerHTML=FN.map((f,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${f[0]}</button>`).join('');
function drawFN(i){$$('#fnBtns button').forEach((b,j)=>b.classList.toggle('pri',j===i));$('#fnOut').innerHTML=rspans(FN[i][1]);const tg=FN[i][1].find(s=>s[1]==='TARGET')[0];
  $('#fnCalc').textContent=`target: ${tg} (${/increase|fell|rose|raised/.test(tg)&&i!==4&&i!==5?'verb':'noun'})\nframe: ${i===6?'Cause_change_position_on_a_scale (adds AGENT; linked to the frame below by the cause relation)':'Change_position_on_a_scale'}\nframe elements: ${FN[i][1].filter(s=>s[1]&&s[1]!=='TARGET').map(s=>s[1]).join(', ')}`}
$$('#fnBtns button').forEach(b=>b.addEventListener('click',()=>drawFN(+b.dataset.i)));drawFN(0);

/* ---------- tree + path features (Fig 22.5) ---------- */
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

const FT_S='(S (NP-SBJ (DT The) (NNP San) (NNP Francisco) (NNP Examiner)) (VP (VBD issued) (NP (DT a) (JJ special) (NN edition)) (PP-TMP (IN around) (NP (NN noon) (NP-TMP yesterday)))))';
function setPar(t,p=null){t.p=p;if(t.c)t.c.forEach(c=>setPar(c,t))}
function findL(t,pred,out=[]){if(t.c){if(pred(t))out.push(t);t.c.forEach(c=>findL(c,pred,out))}return out}
const base=l=>l.replace(/-.*$/,'');
function headOf(n){if(isPre(n))return n;const c=n.c,b=c.map(x=>base(x.l));let k=-1;
  if(base(n.l)==='NP'){for(let i=c.length-1;i>=0;i--)if(/^NN/.test(b[i])&&isPre(c[i])){k=i;break}if(k<0)k=c.length-1}
  else if(base(n.l)==='PP')k=b.indexOf('IN');else if(base(n.l)==='VP')k=b.findIndex(x=>/^VB/.test(x));else if(base(n.l)==='S')k=b.indexOf('VP');
  if(k<0)k=0;return headOf(c[k])}
const FTC=[['NP-SBJ',0,'ARG0','ORG'],['NP',1,'ARG1','—'],['PP-TMP',0,'ARGM-TMP','—'],['NP',2,'NONE','—'],['NP-TMP',0,'NONE','—'],['NNP',2,'NONE','ORG (part)'],['DT',0,'NONE','—']];
$('#ftBtns').innerHTML=FTC.map((f,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${f[0]}${f[0]==='NP'?(f[1]===1?' (a special edition)':' (noon yesterday)'):f[0]==='NNP'?' (Examiner)':f[0]==='DT'?' (The)':''}</button>`).join('');
function drawFT(i){$$('#ftBtns button').forEach((b,j)=>b.classList.toggle('pri',j===i));
  const t=parseBr(FT_S);setPar(t);leaves(t).forEach((l,k)=>l.idx=k);spans(t);
  const [lab,occ,gold,ne]=FTC[i];const node=findL(t,n=>n.l===lab)[occ];const pred=findL(t,n=>n.l==='VBD')[0];
  const up=[],anc=new Set();for(let n=pred;n;n=n.p)anc.add(n);let n=node;while(!anc.has(n)){up.push(n);n=n.p}const lca=n;const down=[];for(let m=pred;m!==lca;m=m.p)down.unshift(m);
  const path=up.map(x=>base(x.l)).join('↑')+'↑'+base(lca.l)+down.map(x=>'↓'+base(x.l)).join('');
  [...up,lca,...down].forEach(x=>{x.hl=true});[...up,...down].forEach(x=>{x.hlE=true});
  $('#ftTree').innerHTML=drawTree(t);
  const L=leaves(node),h=headOf(node),vp=pred.p,pi=leaves(pred)[0].idx;
  const pos=L[L.length-1].idx<pi?'before':'after';
  const fv=['issued',base(lab),h.c[0].w,h.l,path,'active',pos,'VP → '+vp.c.map(x=>base(x.l)).join(' '),ne,L[0].w,L[L.length-1].w];
  $('#ftCalc').textContent=`${gold}: [${fv.join(', ')}]\n\npredicate=issued · phrase type=${fv[1]} · head=${fv[2]} (${fv[3]}) · path=${path}\nvoice=active · position=${pos} · subcat=${fv[7]} · NE=${ne} · first/last word=${fv[9]} / ${fv[10]}\n(rose = the path: up ↑ from the constituent to the lowest common ancestor ${base(lca.l)}, then down ↓ to the predicate)`}
$$('#ftBtns button').forEach(b=>b.addEventListener('click',()=>drawFT(+b.dataset.i)));drawFT(0);

/* ---------- neural BIO SRL ---------- */
const NN=[{w:'the cats love hats'.split(' '),p:{love:['B-ARG0','I-ARG0','B-PRED','B-ARG1']}},
  {w:'The group agreed it would n’t make an offer'.split(' '),p:{agreed:['B-ARG0','I-ARG0','B-PRED','B-ARG1','I-ARG1','I-ARG1','I-ARG1','I-ARG1','I-ARG1'],make:['O','O','O','B-ARG0','B-ARGM-MOD','B-ARGM-NEG','B-PRED','B-ARG1','I-ARG1']}},
  {w:'John broke the window with a rock'.split(' '),p:{broke:['B-ARG0','B-PRED','B-ARG1','I-ARG1','B-ARG2','I-ARG2','I-ARG2']}}];
let nnPr=null;
function drawNN(){const s=NN[+segVal('#nnS','i')];const ps=Object.keys(s.p);if(!ps.includes(nnPr))nnPr=ps[0];
  $('#nnP').innerHTML=ps.map(p=>`<button data-p="${p}" class="${p===nnPr?'on':''}">predicate: ${p}</button>`).join('');
  $$('#nnP button').forEach(b=>b.addEventListener('click',()=>{nnPr=b.dataset.p;drawNN()}));
  const tags=s.p[nnPr],pi=s.w.indexOf(nnPr);const inp=['[CLS]',...s.w,'[SEP]',nnPr,'[SEP]'];
  const ind=['0',...s.w.map((w,k)=>k===pi?'1':'0'),'0','1','0'];const out=['',...tags,'','',''];
  const cell=t=>{const m=t.match(/^[BI]-(.*)$/);if(!m)return `<td class="mono" style="color:var(--soft)">${t}</td>`;const c=col(m[1]==='PRED'?'PRED':m[1].replace(/^ARG(\d)$/,'ARG$1'));const fg=c==='soft'?'var(--ink)':`var(--${c})`;return `<td class="mono" style="color:${fg};font-weight:600">${t}</td>`};
  $('#nnTab').innerHTML=`<tr><th>input</th>${inp.map(x=>`<td style="font-weight:600">${esc(x)}</td>`).join('')}</tr><tr><th>predicate indicator</th>${ind.map(x=>`<td class="mono">${x}</td>`).join('')}</tr><tr><th>FFN + softmax →</th>${out.map(x=>x?cell(x):'<td></td>').join('')}</tr>`;
  const sp=[];let cur=null;tags.forEach((t,k)=>{if(t.startsWith('B-')){cur={l:t.slice(2),w:[s.w[k]]};sp.push(cur)}else if(t.startsWith('I-')&&cur)cur.w.push(s.w[k]);else cur=null});
  $('#nnCalc').textContent=`decoded spans for “${nnPr}”: `+sp.map(x=>`[${x.l} ${x.w.join(' ')}]`).join(' ')+(ps.length>1?`\nthis sentence has ${ps.length} predicates → ${ps.length} separate passes, each with its own indicator and tags`:'')}
segOn('#nnS',drawNN);drawNN();

/* ---------- SRL evaluation ---------- */
const EW='The San Francisco Examiner issued a special edition around noon yesterday'.split(' ');
const EG=[[0,4,'ARG0'],[5,8,'ARG1'],[8,11,'ARGM-TMP']];
const EP=[EG,[[1,4,'ARG0'],[5,8,'ARG1'],[8,11,'ARGM-TMP']],[[0,4,'ARG0'],[5,8,'ARG1'],[8,11,'ARGM-LOC']],[[0,4,'ARG0'],[5,8,'ARG1']]];
function segsOf(S){const out=[];let k=0;S.slice().sort((a,b)=>a[0]-b[0]).forEach(([s,e,l])=>{if(k<s)out.push([EW.slice(k,s).join(' ')]);out.push([EW.slice(s,e).join(' '),l]);k=e});if(k<EW.length)out.push([EW.slice(k).join(' ')]);return out.map(x=>x[0]==='issued'?[x[0],'V']:x).flatMap(x=>x[1]?[x]:x[0].split(' issued ').length>1?[[x[0].split(' issued ')[0]],['issued','V'],[x[0].split(' issued ')[1]]]:x[0]==='issued'?[['issued','V']]:[x])}
function prf(G,P,lab){const key=x=>x[0]+':'+x[1]+(lab?':'+x[2]:'');const g=new Set(G.map(key));const c=P.filter(x=>g.has(key(x))).length;const p=P.length?c/P.length:0,r=c/G.length,f=p+r?2*p*r/(p+r):0;return [c,P.length,G.length,p,r,f]}
function drawEV(){const P=EP[+segVal('#evS','i')];
  $('#evOut').innerHTML='<div class="note" style="margin:0">gold:</div>'+rspans(segsOf(EG))+'<div class="note" style="margin:6px 0 0">system:</div>'+rspans(segsOf(P));
  const L=prf(EG,P,true),U=prf(EG,P,false);
  $('#evCalc').textContent=`labeled (span + role must match exactly): correct ${L[0]} / predicted ${L[1]} / gold ${L[2]}\n  P = ${r2(L[3])}  R = ${r2(L[4])}  F1 = ${r2(L[5])}\nidentification only (role ignored): P = ${r2(U[3])}  R = ${r2(U[4])}  F1 = ${r2(U[5])}`}
segOn('#evS',drawEV);drawEV();

/* ---------- WordNet selectional restrictions ---------- */
const HY={hamburger:['hamburger, beefburger','sandwich','snack food','dish','nutriment, nourishment, nutrition...','food, nutrient','substance','matter','physical entity','entity'],
  takeoff:['takeoff','ascent','movement','event','abstraction','entity'],gold:['gold','noble metal','metal','material','substance','matter','physical entity','entity'],
  matrix:['matrix','array','arrangement','group','abstraction','entity'],someplace:['someplace (location)','physical object','physical entity','entity']};
const RS={eat:'food, nutrient',imagine:'entity',lift:'physical entity',diagonalize:'matrix'};
function drawWN(){const v=segVal('#wnV','v'),n=segVal('#wnN','n'),ch=HY[n],r=RS[v];const k=ch.findIndex(x=>x===r||x.startsWith(r+' ')||x===r);
  $('#wnCalc').textContent=`${v}: THEME restricted to {${r}}\n\n`+ch.map((x,i)=>(i?'  '.repeat(i)+'=> ':'')+x+(i===k?'   ✓ restriction synset':'')).join('\n')+`\n\n${v} + ${n}: `+(k>=0?'well-formed (the restriction is an ancestor)':'VIOLATION (the restriction never appears in the chain)')+(v==='eat'&&n==='gold'?'\n…yet (22.36) “you can’t eat gold for lunch” is a fine sentence → preferences, not hard constraints':'')+(v==='eat'&&n==='someplace'?'\n→ so “eat someplace nearby” should not take someplace as THEME (22.29)':'')+(n!=='hamburger'?'\n(chain simplified by us)':'\n(Fig. 22.7)')}
segOn('#wnV',drawWN);segOn('#wnN',drawWN);drawWN();

/* ---------- Resnik ---------- */
const RCL=['FOOD','ARTIFACT','PERSON','WRITING','ACTIVITY','LOCATION'],PRI=[.10,.30,.20,.10,.15,.15];
const RV={eat:[80,8,2,1,4,5],read:[2,8,3,85,1,1],see:[12,28,22,8,15,15],be:[10,30,20,10,15,15]};
let rsW=null;
function buildRS(){rsW=RV[segVal('#rsV','v')].slice();
  $('#rsSl').innerHTML=RCL.map((c,i)=>`<label class="note" style="display:inline-block;margin:0 10px 4px 0" dir="ltr">${c}: <b class="mono" id="rsO${i}"></b><br><input type="range" min="0" max="100" step="1" value="${rsW[i]}" data-i="${i}"></label>`).join('');
  $$('#rsSl input').forEach(x=>x.addEventListener('input',()=>{rsW[+x.dataset.i]=+x.value;drawRS()}));drawRS()}
function drawRS(){const s=rsW.reduce((a,b)=>a+b,0)||1,q=rsW.map(w=>w/s);
  const term=q.map((p,i)=>p>0?p*Math.log2(p/PRI[i]):0),S=term.reduce((a,b)=>a+b,0);
  RCL.forEach((c,i)=>$('#rsO'+i).textContent=r2(q[i]));
  const mx=Math.max(...q,...PRI);
  $('#rsBars').innerHTML='<div class="bars">'+RCL.map((c,i)=>`<div class="br"><span class="w0" style="font-size:12px">${c}</span><span class="tr" style="position:relative"><span class="fl" style="display:block;width:${q[i]/mx*100}%;background:var(--amber)"></span><span style="position:absolute;top:0;bottom:0;left:${PRI[i]/mx*100}%;border-left:3px solid var(--math)"></span></span><span class="v">${r2(q[i])}</span></div>`).join('')+'</div><p class="note" style="margin:4px 0 0">العمود البرتقالي P(c|v)، والخط الأزرق P(c) العام.</p>';
  $('#rsCalc').textContent='class      P(c)  P(c|v)  log2 ratio   term      A_R(v,c)\n'+RCL.map((c,i)=>`${c.padEnd(10)} ${r2(PRI[i])}  ${r2(q[i])}    ${q[i]>0?(Math.log2(q[i]/PRI[i])>=0?' ':'')+r2(Math.log2(q[i]/PRI[i])):'  —  '}       ${(term[i]>=0?' ':'')+f3(term[i])}    ${S>1e-9?(term[i]/S>=0?' ':'')+f3(term[i]/S):'—'}`).join('\n')+`\n\nS_R(v) = Σ terms = ${f3(S)} bits`+(S<1e-6?'  → the verb tells us nothing (P(c|v) = P(c))':'')}
segOn('#rsV',buildRS);buildRS();

/* ---------- conditional probability + pseudowords ---------- */
const CV={drive:400,eat:500,read:600},CN={car:900,house:1000,banana:150,door:160,book:1200,plan:1100,bargain:120,nail:200};
const CNT={'drive|car':120,'drive|house':2,'eat|banana':30,'eat|door':0,'read|book':150,'read|plan':5,'drive|bargain':10,'drive|nail':15};
const PS=[['drive','car','house'],['eat','banana','door'],['read','book','plan'],['drive','bargain','nail']];
function score(m,v,n){const c=CNT[v+'|'+n]||0;if(!c)return m==='lg'?-Infinity:0;return m==='nv'?c/CV[v]:m==='vn'?c/CN[n]:Math.log(c)}
function drawPS(){const m=segVal('#psM','m');const fm=x=>x===-Infinity?'−∞':m==='lg'?r2(x):f3(x);let ok=0;
  $('#psTab').innerHTML='<tr><th>verb</th><th>pseudoword</th><th>C(v,n,obj)</th><th>C(v,obj)</th><th>C(n,obj)</th><th>score</th><th>choice</th></tr>'+PS.map(([v,a,b])=>{const sa=score(m,v,a),sb=score(m,v,b),win=sa>sb?a:b,good=win===a;if(good)ok++;
    return `<tr><td>${v}</td><td class="mono">${a}/${b}</td><td class="mono">${CNT[v+'|'+a]||0} / ${CNT[v+'|'+b]||0}</td><td class="mono">${CV[v]}</td><td class="mono">${CN[a]} / ${CN[b]}</td><td class="mono">${fm(sa)} / ${fm(sb)}</td><td style="color:var(--${good?'green':'rose'});font-weight:600">${win} ${good?'✓':'✗'}</td></tr>`}).join('');
  $('#psCalc').textContent=`${m==='nv'?'P(n|v,r) = C(n,v,r)/C(v,r)':m==='vn'?'P(v|n,r) = C(n,v,r)/C(n,r)':'log count(v,n,r)'} · accuracy on the pseudoword test: ${ok}/${PS.length}\n(the original object is always the first word; the confounder has a similar overall frequency)`+(m!=='vn'?'\n“drive a bargain”: nail is seen more often with drive, so this model prefers it':'\nP(v|n) normalizes by how common the noun is, so rare “bargain” with drive wins')}
segOn('#psM',drawPS);drawPS();

/* ---------- primitive decomposition ---------- */
const PD=['Jim killed his philodendron.\n\nKILL(x,y) ⇔ CAUSE(x, BECOME(NOT(ALIVE(y))))\n\nCAUSE(Jim, BECOME(NOT(ALIVE(philodendron))))\nprimitives: CAUSE, BECOME, NOT, ALIVE',
  'John opened the door.\n\nCAUSE(John, BECOME(OPEN(door)))\n\n= causative: someone causes the change of state',
  'The door opened.\n\nBECOME(OPEN(door))\n\n= inchoative: the change of state without a causer',
  'The door is open.\n\nOPEN(door)\n\n= the single state predicate OPEN underlies all three',
  'The waiter brought Mary the check.\n\n∃x,y Atrans(x) ∧ Actor(x,Waiter) ∧ Object(x,Check) ∧ To(x,Mary)\n     ∧ Ptrans(y) ∧ Actor(y,Waiter) ∧ Object(y,Check) ∧ To(y,Mary)\n\nATRANS: control of the check passed to Mary\nPTRANS: the check was physically conveyed to Mary'];
function drawPD(){$('#pdCalc').textContent=PD[+segVal('#pdS','i')]}
segOn('#pdS',drawPD);drawPD();

/* ---------- glossary ---------- */
const GL=[['الدور الدلالي','semantic role','دور المعمول في الحدث الذي يصفه المحمول.'],['المحمول / المعمول','predicate / argument','الفعل (أو الاسم) الدال على الحدث / المشاركون فيه.'],['الدور الموضوعي','thematic role','دور من قائمة عامة محدودة (AGENT، THEME…).'],['الفاعل المريد','AGENT','المسبِّب المتعمِّد للحدث.'],['المتأثر','THEME','المشارك الأكثر تأثراً مباشراً بالحدث.'],['الآلة','INSTRUMENT','أداة مستعملة في الحدث.'],['الشبكة الموضوعية','thematic grid, θ-grid, case frame','مجموعة أدوار الفعل.'],['التناوب','verb / diathesis alternation','تحقيق أدوار الفعل بأكثر من بنية نحوية.'],['تناوب المفعولين','dative alternation','gave the book to Cary / gave Cary the book.'],['VerbNet','VerbNet','فئات ليفن للأفعال مربوطة بـ WordNet وFrameNet.'],['الفاعل / المفعول الأوّلي','PROTO-AGENT / PROTO-PATIENT','أدوار معمّمة بخصائص ترجيحية.'],['PropBank','Proposition Bank','جمل موسومة بأدوار مرقّمة لكل معنى فعل.'],['ملف الإطار','frame file','مدخل معنى الفعل في PropBank بأدواره.'],['ArgM','ArgM modifiers','أدوار ثانوية عامة: TMP، LOC، DIR، MNR…'],['NomBank','NomBank','أدوار PropBank للمحمولات الاسمية.'],['FrameNet','FrameNet','أدوار خاصة بالأطر، لأفعال وأسماء.'],['الإطار','frame','معرفة خلفية متماسكة تستدعيها كلمات.'],['عناصر الإطار','frame elements','أدوار الإطار؛ جوهرية وغير جوهرية.'],['وسم الأدوار الدلالية','semantic role labeling (SRL)','إسناد الأدوار إلى المقاطع آلياً.'],['المسار','path feature','طريق الشجرة من المكون إلى المحمول (NP↑S↓VP↓VBD).'],['الإطار الفرعي','subcategorization','القاعدة التي توسّع أبا المحمول.'],['التحسين العام','global optimization','اختيار وسوم متسقة معاً (فيتربي، إعادة ترتيب، ILP).'],['القيد الانتقائي','selectional restriction','قيد دلالي على نوع المعمول.'],['التفضيل الانتقائي','selectional preference','قيد مرن موزون أو احتمالي.'],['قوة التفضيل','selectional preference strength','S_R(v) = KL(P(c|v) ‖ P(c)).'],['الارتباط الانتقائي','selectional association','A_R(v,c): نصيب الفئة من قوة التفضيل.'],['انحراف KL','Kullback-Leibler divergence / relative entropy','بُعد توزيع عن آخر بالبِت.'],['الكلمة الزائفة','pseudoword','كلمة أصلية + مموِّهة لاختبار النموذج.'],['التفكيك إلى أوليات','primitive decomposition / componential analysis','تحليل المعنى إلى عناصر أولية.'],['الاعتماد المفهومي','conceptual dependency (CD)','عشر أوليات: ATRANS، PTRANS…'],['المعمول الضمني','implicit argument (iSRL)','معمول خارج الجملة أو مستنتَج.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
