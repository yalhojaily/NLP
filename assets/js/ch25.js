/* Chapter 25 · Discourse Coherence — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const hl=(t,c,lab)=>`<span style="background:var(--${c}-soft);border-bottom:2px solid var(--${c});border-radius:4px;padding:0 3px">${esc(t)}${lab?`<sub style="color:var(--${c});font-family:var(--f-mono);font-size:11px;font-weight:600;margin-inline-start:3px">${esc(lab)}</sub>`:''}</span>`;

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s25-1','25.1','علاقات التماسك'],['s25-2','25.2','تحليل الخطاب'],['s25-3','25.3','التمركز وشبكة الكيانات'],['s25-4','25.4','نماذج التمثيل'],['s25-5','25.5','التماسك الكلي'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- three kinds of local coherence ---------- */
const P3=[['John wanted to buy a piano for his living room.','John'],['Jenny also wanted to buy a piano.','Jenny'],['He went to the piano store.','He (John)'],['It was nearby.','It (store)'],['The living room was on the second floor.','The living room'],['She didn’t find anything she liked.','She (Jenny)'],['The piano he bought was hard to get up to that floor.','The piano']];
function drawLC(){const i=+segVal('#lcS','i');let h='',c='';
  if(i===0){h='John took a train from Paris to Istanbul. He likes spinach.';c='no coherence relation can be found: why would liking spinach follow a train trip?\n(readers even try to invent one: a French spinach shortage?)'}
  if(i===1){h=hl('Jane took a train from Paris to Istanbul.','green','nucleus')+' '+hl('She had to attend a conference.','amber','REASON');c='coherence relation: the second sentence gives a REASON for Jane’s action'}
  if(i===2){h=P3.map(([s,e])=>{const k=s.indexOf(e.split(' ')[0]);return esc(s.slice(0,k))+hl(e.split(' ')[0]==='The'?e.slice(0,e.length):e.split(' ')[0],'math')+esc(s.slice(k+(e.split(' ')[0]==='The'?e.length:e.split(' ')[0].length)))}).join('<br>');c='salient entity per sentence: '+P3.map(p=>p[1]).join(' → ')+'\nthe focus swings wildly: low entity-based coherence'}
  if(i===3){const W=['chimney','shingled','house','garret','closet','window'];const t='Before winter I built a chimney, and shingled the sides of my house... I have thus a tight shingled and plastered house... with a garret and a closet, a large window on each side....';h=t.split(/(\s+)/).map(w=>{const b=w.replace(/[^a-z]/gi,'');return W.includes(b)?hl(w,'green'):esc(w)}).join('');c='lexical cohesion: words from one semantic field (house, chimney, garret, closet, window) and a repeated word (shingled)'}
  $('#lcOut').innerHTML=h;$('#lcCalc').textContent=c}
segOn('#lcS',drawLC);drawLC();

/* ---------- RST relation examples ---------- */
const RS=[['Reason','Jane took a train from Paris to Istanbul.','She had to attend a conference.','NS','The nucleus is an action carried out by an animate agent and the satellite is the reason for the nucleus.'],
  ['Elaboration','Dorothy was from Kansas.','She lived in the midst of the great Kansas prairies.','NS','The satellite gives additional information or detail about the situation presented in the nucleus.'],
  ['Evidence','Kevin must be here.','His car is parked outside.','NS','The satellite gives additional information… presented with the goal of convincing the reader to accept the nucleus.'],
  ['Attribution','Analysts estimated','that sales at U.S. stores declined in the quarter, too','SN','The satellite gives the source of attribution for an instance of reported speech in the nucleus.'],
  ['List','Billy Bones was the mate;','Long John, he was quartermaster','NN','In this multinuclear relation, a series of nuclei is given, without contrast or explicit comparison.']];
function wrap(t,n){const w=t.split(' '),L=[];let c='';w.forEach(x=>{if((c+' '+x).trim().length>n){L.push(c.trim());c=x}else c+=' '+x});if(c.trim())L.push(c.trim());return L}
function drawRS(){const [r,a,b,d,def]=RS[+segVal('#rsS','i')];const W=480;let s=`<svg viewBox="0 0 ${W} 160" style="width:100%;max-width:520px;display:block;margin:0 auto" role="img"><defs><marker id="rsA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="var(--math)"/></marker></defs>`;
  const box=(x,t,role)=>{const L=wrap(t,24);return `<rect x="${x}" y="70" width="210" height="${22+L.length*17}" rx="8" fill="var(--${role==='N'?'green':'amber'}-soft)" stroke="var(--${role==='N'?'green':'amber'})"/>`+L.map((l,k)=>`<text x="${x+105}" y="${90+k*17}" font-size="13" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${esc(l)}</text>`).join('')+`<text x="${x+105}" y="62" font-size="11" text-anchor="middle" fill="var(--${role==='N'?'green':'amber'})" font-family="Noto Sans Mono">${role==='N'?'NUCLEUS':'SATELLITE'}</text>`};
  s+=box(20,a,d[0])+box(250,b,d[1]);
  if(d==='NN')s+=`<line x1="125" y1="40" x2="125" y2="50" stroke="var(--math)" stroke-width="2"/><line x1="355" y1="40" x2="355" y2="50" stroke="var(--math)" stroke-width="2"/><line x1="125" y1="40" x2="355" y2="40" stroke="var(--math)" stroke-width="2"/>`;
  else{const [x1,x2]=d==='NS'?[355,125]:[125,355];s+=`<path d="M${x1},50 Q240,0 ${x2},50" fill="none" stroke="var(--math)" stroke-width="2" marker-end="url(#rsA)"/>`}
  s+=`<text x="240" y="22" font-size="13" text-anchor="middle" fill="var(--math)" font-family="Noto Sans Mono" font-weight="600">${r.toLowerCase()}</text>`;
  $('#rsSvg').innerHTML=s+'</svg>';$('#rsCalc').textContent=`${r}: ${def}\n${d==='NN'?'multinuclear: two nuclei, no arrow':'arrow from the satellite to the nucleus'}`}
segOn('#rsS',drawRS);drawRS();

/* ---------- Mars tree (Fig 25.1) ---------- */
const EDU=['Mars','With its distant orbit – 50 percent farther from the sun than Earth – and slim atmospheric blanket,','Mars experiences frigid weather conditions.','Surface temperatures typically average about -60 degrees Celsius (-76 degrees Fahrenheit) at the equator','and can dip to -123 degrees C near the poles.','Only the midday sun at tropical latitudes is warm enough','to thaw ice on occasion,','but any liquid water formed in this way would evaporate almost instantly','because of the low atmospheric pressure.'];
const MT={id:'1-9',rel:'Title',k:[{leaf:0,r:'S'},{id:'2-9',r:'N',rel:'evidence',k:[{id:'2-3',r:'N',rel:'background',k:[{leaf:1,r:'S'},{leaf:2,r:'N'}]},{id:'4-9',r:'S',rel:'elaboration-additional',k:[{id:'4-5',r:'N',rel:'List',k:[{leaf:3,r:'N'},{leaf:4,r:'N'}]},{id:'6-9',r:'S',rel:'Contrast',k:[{id:'6-7',r:'N',rel:'purpose',k:[{leaf:5,r:'N'},{leaf:6,r:'S'}]},{id:'8-9',r:'N',rel:'explanation-argumentative',k:[{leaf:7,r:'N'},{leaf:8,r:'S'}]}]}]}]}]};
let mtSel='1-9';
function leavesOf(n){return n.leaf!==undefined?[n.leaf]:n.k.flatMap(leavesOf)}
function drawMT(){const LX=i=>40+i*72,W=LX(8)+60,H=300;let depth=0;(function d(n,l){n.d=l;depth=Math.max(depth,l);if(n.k)n.k.forEach(c=>d(c,l+1))})(MT,0);
  const Y=n=>n.leaf!==undefined?H-40:30+n.d*48;const X=n=>{if(n.leaf!==undefined)return LX(n.leaf);const L=leavesOf(n);return (LX(L[0])+LX(L[L.length-1]))/2};
  let s=`<svg viewBox="0 0 ${W} ${H}" style="width:${W}px;max-width:none;display:block;margin:0 auto" role="img">`;
  (function ed(n){if(!n.k)return;n.k.forEach(c=>{s+=`<line x1="${X(n)}" y1="${Y(n)+8}" x2="${X(c)}" y2="${Y(c)-12}" stroke="${c.r==='N'?'var(--green)':'var(--amber)'}" stroke-width="${c.r==='N'?2.4:1.4}" ${c.r==='S'?'stroke-dasharray="5 3"':''}/>`;ed(c)})})(MT);
  (function nd(n){const sel=(n.id||('L'+n.leaf))===mtSel;if(n.leaf!==undefined){s+=`<g data-id="L${n.leaf}" style="cursor:pointer"><circle cx="${X(n)}" cy="${Y(n)}" r="13" fill="${sel?'var(--amber)':'var(--tint)'}" stroke="var(--rule)"/><text x="${X(n)}" y="${Y(n)+4}" font-size="12" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans Mono">(${n.leaf+1})</text><text x="${X(n)}" y="${Y(n)+30}" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans">${esc(EDU[n.leaf].split(' ')[0])}…</text></g>`;return}
    s+=`<g data-id="${n.id}" style="cursor:pointer"><rect x="${X(n)-34}" y="${Y(n)-12}" width="68" height="20" rx="6" fill="${sel?'var(--amber-soft)':'var(--paper)'}" stroke="${sel?'var(--amber)':'var(--rule)'}"/><text x="${X(n)}" y="${Y(n)+3}" font-size="11" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans Mono">${n.id}</text><text x="${X(n)}" y="${Y(n)-16}" font-size="10.5" text-anchor="middle" fill="var(--math)" font-family="Noto Sans">${n.rel}</text></g>`;n.k.forEach(nd)})(MT);
  $('#mtSvg').innerHTML=s+'</svg>';$$('#mtSvg g').forEach(g=>g.addEventListener('click',()=>{mtSel=g.dataset.id;drawMT()}));
  let node=null;(function f(n){if((n.id||('L'+n.leaf))===mtSel)node=n;if(n.k)n.k.forEach(f)})(MT);const L=leavesOf(node);
  $('#mtCalc').textContent=(node.leaf!==undefined?`EDU (${node.leaf+1}): `:`span ${node.id}, relation “${node.rel}”: `+node.k.map(c=>`${c.id||'('+(c.leaf+1)+')'} = ${c.r==='N'?'nucleus':'satellite'}`).join(', ')+'\n')+L.map(i=>`(${i+1}) ${EDU[i]}`).join(' ')+'\n(green solid = nucleus, amber dashed = satellite; nuclearity as we read the figure)'}
drawMT();

/* ---------- PDTB ---------- */
const PD=[[[['Jewelry displays in department stores were often cluttered and uninspired. And the merchandise was, well, fake.','Arg1'],['As a result,','Conn'],['marketers of faux gems steadily lost space in department stores to more fashionable rivals—cosmetics makers.','Arg2']],'explicit connective “as a result” → CONTINGENCY › Cause › Result'],
  [[['In July, the Environmental Protection Agency imposed a gradual ban on virtually all uses of asbestos.','Arg1'],['(implicit = as a result)','Conn'],['By 1997, almost all remaining uses of cancer-causing asbestos will be outlawed.','Arg2']],'no connective: the annotator inserts “as a result”, then labels its sense'],
  [[['The parishioners of St. Michael and All Angels stop to chat at the church door, as members here always have.','Arg1'],['(Implicit while)','Conn'],['In the tower, five men and women pull rhythmically on ropes attached to the same five bells that first sounded here in 1614.','Arg2']],'TEMPORAL › SYNCHRONOUS'],
  [[['Also unlike Mr. Ruder, Mr. Breeden appears to be in a position to get somewhere with his agenda.','Arg1'],['(implicit=because)','Conn'],['As a former White House aide who worked closely with Congress, he is savvy in the ways of Washington.','Arg2']],'CONTINGENCY › REASON'],
  [[['The U.S. wants the removal of what it perceives as barriers to investment;','Arg1'],['Japan denies there are real barriers.','Arg2']],'COMPARISON › CONTRAST'],
  [[['Not only','Conn'],['do the actors stand outside their characters and make it clear they are at odds with them,','Arg1'],['but','Conn'],['they often literally stand on their heads.','Arg2']],'EXPANSION › CONJUNCTION'],
  [[['为','Conn'],['推动图们江地区开发','Arg2'],['，'],['韩国捐款一百万美元设立了图们江发展基金','Arg1']],'Chinese Discourse TreeBank: “[In order to] [Arg2 promote the development of the Tumen River region], [Arg1 South Korea donated one million dollars to establish the Tumen River Development Fund].” Only 22% of Chinese relations have explicit connectives (47% in English)']];
function drawPD(){const i=+segVal('#pdS','i'),[sg,c]=PD[i];$('#pdOut').innerHTML=sg.map(([t,l])=>l?hl(t,l==='Arg1'?'math':l==='Arg2'?'green':'amber',l):esc(t)).join(' ');
  $('#pdCalc').textContent=c+(i>=2&&i<=5?'\n(Fig. 25.2; the Arg1/Arg2 split is our reading)':'')}
segOn('#pdS',drawPD);drawPD();

/* ---------- EDU segmentation ---------- */
const EG='Mr. Rambo says that a 3.2-acre property overlooking the San Fernando Valley is priced at $4 million because the late actor Erroll Flynn once lived there.'.split(' ');
const EGG=new Set([0,3,7,12,17]);let egP=new Set([0,3,7,12,17]);
function drawEG(){$('#egOut').innerHTML=EG.map((w,i)=>`<span data-i="${i}" style="cursor:pointer;display:inline-block;text-align:center;margin:0 3px"><span style="display:block;font-family:var(--f-mono);font-size:12px;color:var(--${egP.has(i)?'rose':'soft'});font-weight:${egP.has(i)?700:400}">${egP.has(i)?1:0}</span><span style="${egP.has(i)?'border-left:2px solid var(--rose);padding-left:3px':''}">${esc(w)}</span></span>`).join('');
  $$('#egOut [data-i]').forEach(s=>s.addEventListener('click',()=>{const i=+s.dataset.i;if(i===0)return;egP.has(i)?egP.delete(i):egP.add(i);drawEG()}));
  const st=[...egP].sort((a,b)=>a-b),segs=st.map((s,k)=>EG.slice(s,st[k+1]??EG.length).join(' '));const c=[...egP].filter(x=>EGG.has(x)&&x>0).length,p=egP.size-1,g=EGG.size-1;
  $('#egCalc').textContent=segs.map((s,k)=>`e${k+1}: [${s}]`).join('\n')+`\nboundary precision ${p?r2(c/p):'—'} · recall ${r2(c/g)} against the book’s 5 EDUs (the first token always starts an EDU)`}
drawEG();

/* ---------- shift-reduce RST ---------- */
const SRA=[['SH'],['SH'],['RD','attr','SN'],['SH'],['SH'],['RD','elab','NS'],['RD','elab','SN'],['PR']];
const SRT=['e1: American Telephone & Telegraph Co. said it','e2: will lay off 75 to 85 technicians here , effective Nov. 1.','e3: The workers install , maintain and repair its private branch exchanges,','e4: which are large intracompany telephone networks.'];
let srK=0;
function srState(k){let st=[],q=['e1','e2','e3','e4'],out=null;const rows=[];for(let i=0;i<k;i++){const a=SRA[i];rows.push([st.map(x=>x.n).join(' , ')||'∅',q.join(', ')||'∅',a[0]==='RD'?`RD(${a[1]},${a[2]})`:a[0]]);
    if(a[0]==='SH')st.push({n:q.shift(),t:q.length>=0?null:null,s:null});else if(a[0]==='RD'){const r=st.pop(),l=st.pop();const nm=l.n.split(':')[0].replace(/^e/,'e')+':'+(r.n.split(':').pop().replace('e',''));st.push({n:'e'+l.n.replace('e','').split(':')[0]+':'+r.n.replace('e','').split(':').pop(),l,r,rel:a[1],d:a[2]})}else{out=st.pop()}}
  return {st,q,rows,out}}
function show(t){if(!t.l)return t.n;return `${t.rel}(${t.d[0]}:${show(t.l)}, ${t.d[1]}:${show(t.r)})`}
function drawSR(){const S=srState(srK);const nx=srK<8?SRA[srK]:null;
  $('#srTab').innerHTML='<tr><th>step</th><th>stack</th><th>queue</th><th>action</th></tr>'+S.rows.map((r,i)=>`<tr><td>${i+1}</td><td class="mono">${r[0]}</td><td class="mono">${r[1]}</td><td class="mono">${r[2]}</td></tr>`).join('')+(nx?`<tr style="background:var(--green-soft)"><td>${srK+1}</td><td class="mono">${S.st.map(x=>x.n).join(' , ')||'∅'}</td><td class="mono">${S.q.join(', ')||'∅'}</td><td class="mono">next: ${nx[0]==='RD'?`RD(${nx[1]},${nx[2]})`:nx[0]}</td></tr>`:'');
  const trees=S.out?[S.out]:S.st;
  $('#srTree').innerHTML=`<div class="note" style="margin:0" dir="ltr">${trees.map(t=>esc(show(t))).join(' &nbsp;|&nbsp; ')||'(empty stack)'}</div>`;
  $('#srCalc').textContent=SRT.join('\n')+(srK===8?'\n\ndone: the popped tree is Fig. 25.5. N = nucleus, S = satellite':'')}
$('#srNext').addEventListener('click',()=>{if(srK<8)srK++;drawSR()});$('#srReset').addEventListener('click',()=>{srK=0;drawSR()});drawSR();

/* ---------- Centering ---------- */
const CT=[[['John went to his favorite music store to buy a piano.',[['John','n'],['store','x'],['piano','x']]],['He was excited that he could finally buy a piano.',[['John','p'],['piano','x']]],['He arrived just as the store was closing for the day.',[['John','p'],['store','x']]],['It was closing just as John arrived.',[['store','p'],['John','n']]]],
  [['John went to his favorite music store to buy a piano.',[['John','n'],['store','x'],['piano','x']]],['He had frequented the store for many years.',[['John','p'],['store','x']]],['He was excited that he could finally buy a piano.',[['John','p'],['piano','x']]],['He arrived just as the store was closing for the day.',[['John','p'],['store','x']]]],
  [['John went to his favorite music store to buy a piano.',[['John','n'],['store','x'],['piano','x']]],['It was a store John had frequented for many years.',[['store','p'],['John','n']]],['He was excited that he could finally buy a piano.',[['John','p'],['piano','x']]],['It was closing just as John arrived.',[['store','p'],['John','n']]]]];
const RANK={Continue:1,Retain:2,'Smooth-Shift':3,'Rough-Shift':4};
function drawCT(){const U=CT[+segVal('#ctS','i')];let prevCb=null,rows='',trans=[],viol=0;
  U.forEach(([s,cf],n)=>{const ents=cf.map(c=>c[0]),cp=ents[0];let cb=null,tr='—',r1='';
    if(n>0){const prevCf=U[n-1][1].map(c=>c[0]);cb=prevCf.find(e=>ents.includes(e))||null;
      if(cb){const same=prevCb===null||prevCb===cb;tr=same?(cb===cp?'Continue':'Retain'):(cb===cp?'Smooth-Shift':'Rough-Shift');trans.push(tr)}
      const pronPrev=cf.filter(c=>c[1]==='p'&&prevCf.includes(c[0]));const cbReal=cf.find(c=>c[0]===cb);
      if(pronPrev.length&&cbReal&&cbReal[1]!=='p'){r1='✗ Rule 1 violated';viol++}else if(pronPrev.length)r1='✓ Rule 1'}
    rows+=`<tr><td>U${n+1}</td><td style="min-width:200px">${esc(s)}</td><td class="mono">{${cf.map(c=>c[0]+(c[1]==='p'?'(pro)':'')).join(', ')}}</td><td class="mono">${cp}</td><td class="mono">${cb||'undefined'}</td><td style="font-weight:600;color:var(--${tr==='Continue'?'green':tr==='—'?'soft':'amber'})">${tr}</td><td style="color:var(--${r1.startsWith('✗')?'rose':'green'})">${r1}</td></tr>`;prevCb=cb});
  $('#ctTab').innerHTML='<tr><th></th><th>utterance</th><th>Cf (ranked)</th><th>Cp</th><th>Cb</th><th>transition</th><th>Rule 1</th></tr>'+rows;
  $('#ctCalc').textContent=`transitions: ${trans.join(' → ')}\nmean rank (1 = Continue … 4 = Rough-Shift) = ${r2(trans.reduce((a,t)=>a+RANK[t],0)/trans.length)} · Rule 1 violations: ${viol}\nCb(Un+1) = the highest-ranked element of Cf(Un) that is realized in Un+1`}
segOn('#ctS',drawCT);drawCT();

/* ---------- entity grid ---------- */
const GE=['Department','Trial','Microsoft','Evidence','Competitors','Markets','Products','Brands','Case','Netscape','Software','Tactics','Government','Suit','Earnings'];
const GR=['SOSXO----------','--O--XSO-------','--SO----SOO----','--S--------S---','------------SO-','-XS-----------O'];
const GS=['[The Justice Department]S is conducting an [anti-trust trial]O against [Microsoft Corp.]X with [evidence]X that [the company]S is increasingly attempting to crush [competitors]O.','[Microsoft]O is accused of trying to forcefully buy into [markets]X where [its own products]S are not competitive enough to unseat [established brands]O.','[The case]S revolves around [evidence]O of [Microsoft]S aggressively pressuring [Netscape]O into merging [browser software]O.','[Microsoft]S claims [its tactics]S are commonplace and good economically.','[The government]S may file [a civil suit]O ruling that [conspiracy]S to curb [competition]O through [collusion]X is [a violation of the Sherman Act]O.','[Microsoft]S continues to show [increased earnings]O despite [the trial]X.'];
const TT=['SS','SO','SX','S-','OS','OO','OX','O-','XS','XO','XX','X-','-S','-O','-X','--'];
const D1=[.01,.01,0,.08,.01,0,0,.09,0,0,0,.03,.05,.07,.03,.59];
let gdOrd=[0,1,2,3,4,5],gdSel=0,gdSeed=3;
function drawGD(){const R=gdOrd.map(i=>GR[i]);
  $('#gdTab').innerHTML='<tr><th></th>'+GE.map(e=>`<th style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:11px;padding:4px 2px">${e}</th>`).join('')+'</tr>'+R.map((r,k)=>`<tr data-k="${k}" style="cursor:pointer;${k===gdSel?'background:var(--green-soft)':''}"><td class="mono">${gdOrd[k]+1}</td>${[...r].map(c=>`<td class="mono" style="text-align:center;padding:3px 4px;${c==='S'?'color:var(--green);font-weight:700':c==='O'?'color:var(--math);font-weight:700':c==='X'?'color:var(--amber)':'color:var(--soft)'}">${c==='-'?'–':c}</td>`).join('')}</tr>`).join('');
  $$('#gdTab tr[data-k]').forEach(t=>t.addEventListener('click',()=>{gdSel=+t.dataset.k;drawGD()}));
  $('#gdSent').innerHTML=`<b>${gdOrd[gdSel]+1}</b> `+esc(GS[gdOrd[gdSel]]).replace(/\]([SOX])/g,']<sub style="color:var(--math);font-weight:700">$1</sub>');
  const cnt={};TT.forEach(t=>cnt[t]=0);let tot=0;for(let c=0;c<GE.length;c++)for(let k=0;k<R.length-1;k++){cnt[R[k][c]+R[k+1][c]]++;tot++}
  const orig=gdOrd.join()==='0,1,2,3,4,5';
  $('#gdTr').innerHTML='<tr><th></th>'+TT.map(t=>`<th class="mono" style="font-size:11px">${t.replace(/-/g,'–')}</th>`).join('')+'</tr><tr><td>ours</td>'+TT.map(t=>`<td class="mono" style="font-size:12px">${r2(cnt[t]/tot).replace(/^0/,'')}</td>`).join('')+'</tr>'+(orig?'<tr><td>book d₁</td>'+D1.map(v=>`<td class="mono" style="font-size:12px;color:var(--soft)">${String(v).replace(/^0(?=\.)/,'')}</td>`).join('')+'</tr>':'');
  const dense=TT.filter(t=>!t.includes('-')).reduce((a,t)=>a+cnt[t],0);
  $('#gdCalc').textContent=`${GE.length} entities × ${R.length-1} sentence pairs = ${tot} transitions of length 2\n[S –] = ${cnt['S-']}/${tot} = ${r2(cnt['S-']/tot)} · [– –] = ${cnt['--']}/${tot} · transitions with the entity in both sentences = ${dense}`+(orig?' (original order)':` (shuffled order ${gdOrd.map(i=>i+1).join(',')}: the features change, which is what a sentence-order discriminator learns from)`)}
$('#gdShuf').addEventListener('click',()=>{const R=rng(gdSeed++);const a=[0,1,2,3,4,5];for(let i=5;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}gdOrd=a;drawGD()});
$('#gdOrig').addEventListener('click',()=>{gdOrd=[0,1,2,3,4,5];drawGD()});drawGD();

/* ---------- lexical coherence (25.32 with counts) ---------- */
const STOP=new Set('a an the of to in on for and or but with by at from his her its their he she it they i was were is are be had have has that this as also just could did didn’t didn t anything there were any much many for to up get got so than then them we you my our'.split(' '));
const LT=[['The museum opened a new gallery of modern art.','The gallery shows paintings by young artists.','Many artists in the gallery work with bright colors.','Visitors to the museum praised the colors and the paintings.'],P3.map(p=>p[0]),['John went to his favorite music store to buy a piano.','He had frequented the store for many years.','He was excited that he could finally buy a piano.','He arrived just as the store was closing for the day.']];
let lsOrd=null,lsSeed=7;
const bag=s=>{const m={};s.toLowerCase().replace(/[^a-z’' ]/g,' ').split(/\s+/).filter(w=>w&&!STOP.has(w)).forEach(w=>{w=w.replace(/s$/,'');m[w]=(m[w]||0)+1});return m};
const cosb=(a,b)=>{let d=0,na=0,nb=0;for(const k in a){na+=a[k]**2;if(b[k])d+=a[k]*b[k]}for(const k in b)nb+=b[k]**2;return na&&nb?d/Math.sqrt(na*nb):0};
function drawLS(){const T=LT[+segVal('#lsT','i')];if(!lsOrd||lsOrd.length!==T.length)lsOrd=T.map((_,i)=>i);const S=lsOrd.map(i=>T[i]);const B=S.map(bag);const cs=S.slice(1).map((_,k)=>cosb(B[k],B[k+1]));
  $('#lsOut').innerHTML=S.map((s,k)=>`<b class="mono">${lsOrd[k]+1}</b> ${esc(s)}`+(k<cs.length?` <span class="mono" style="color:var(--math);font-size:12.5px">↓ cos ${r2(cs[k])}</span>`:'')).join('<br>');
  $('#lsCalc').textContent=`coherence(T) = average of ${cs.length} adjacent cosines = ${f3(cs.reduce((a,b)=>a+b,0)/cs.length)}`+(lsOrd.every((v,i)=>v===i)?' (original order)':' (shuffled)')+'\nbag of content words, crude plural stripping; no synonyms'}
segOn('#lsT',()=>{lsOrd=null;drawLS()});$('#lsShuf').addEventListener('click',()=>{const T=LT[+segVal('#lsT','i')],R=rng(lsSeed++),a=T.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}lsOrd=a;drawLS()});$('#lsOrig').addEventListener('click',()=>{lsOrd=null;drawLS()});drawLS();

/* ---------- LCD ---------- */
const SV=[0.8,0.1,0.5],TV=[0.7,0.2,0.4];
function drawLCD(){const fp=+$('#lfP').value,fn=+$('#lfN').value,eta=+$('#lfE').value;$('#lfPo').textContent=r2(fp);$('#lfNo').textContent=r2(fn);$('#lfEo').textContent=r2(eta);
  const v=a=>'['+a.map(x=>r2(x)).join(', ')+']';const d=SV.map((x,i)=>x-TV[i]);
  const L=Math.max(0,eta-fp+fn);
  $('#lcdCalc').textContent=`s = ${v(SV)}   t = ${v(TV)}\nfeatures = [s, t, s − t, |s − t|, s ⊙ t] = ${v([...SV,...TV,...d,...d.map(Math.abs),...SV.map((x,i)=>x*TV[i])])}  (15 numbers → one-layer FFN → score)\n\nmargin loss = max(0, η − f+ + f−) = max(0, ${r2(eta)} − ${r2(fp)} + ${r2(fn)}) = ${r2(L)}`+(L===0?'  → the real pair already wins by at least η: no update':fp>fn?'  → the real pair wins, but not by the margin η':'  → the fake pair scores higher: a large update')}
['#lfP','#lfN','#lfE'].forEach(id=>$(id).addEventListener('input',drawLCD));drawLCD();

/* ---------- argument structure ---------- */
const AG=[['(1) Museums and art galleries provide a better understanding about arts than Internet.','claim'],['(2) In most museums and art galleries, detailed descriptions in terms of the background, history and author are provided.','premise'],['(3) Seeing an artwork online is not the same as watching it with our own eyes,','premise'],['(4) as the picture online does not show the texture or three-dimensional structure of the art, which is important to study.','premise']];
let agSel=0;const AGP=[[230,40],[120,140],[340,140],[340,240]],AGE=[[1,0],[2,0],[3,2]];
function drawAG(){let s=`<svg viewBox="0 0 460 280" style="width:100%;max-width:480px;display:block;margin:0 auto" role="img"><defs><marker id="agA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="var(--green)"/></marker></defs>`;
  AGE.forEach(([a,b])=>{const [x1,y1]=AGP[a],[x2,y2]=AGP[b];s+=`<line x1="${x1}" y1="${y1-20}" x2="${x2}" y2="${y2+22}" stroke="var(--green)" stroke-width="2" marker-end="url(#agA)"/><text x="${(x1+x2)/2+6}" y="${(y1+y2)/2}" font-size="11" fill="var(--green)" font-family="Noto Sans Mono">SUPPORT</text>`});
  AG.forEach(([t,r],i)=>{const [x,y]=AGP[i];s+=`<g data-i="${i}" style="cursor:pointer"><rect x="${x-58}" y="${y-20}" width="116" height="40" rx="10" fill="var(--${r==='claim'?'amber':'math'}-soft)" stroke="var(--${r==='claim'?'amber':'math'})" stroke-width="${i===agSel?2.5:1}"/><text x="${x}" y="${y-2}" font-size="13" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans" font-weight="600">(${i+1})</text><text x="${x}" y="${y+13}" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans">${r}</text></g>`});
  $('#agSvg').innerHTML=s+'</svg>';$$('#agSvg g').forEach(g=>g.addEventListener('click',()=>{agSel=+g.dataset.i;drawAG()}));
  $('#agCalc').textContent=`${AG[agSel][0]}\nrole: ${AG[agSel][1]}`+`\nrelations: SUPPORT(2,1), SUPPORT(3,1), SUPPORT(4,3)`}
drawAG();

/* ---------- glossary ---------- */
const GL=[['الخطاب','discourse','مجموعة جمل متماسكة منظمة.'],['التماسك','coherence','ما يجعل الخطاب غير جمل عشوائية.'],['علاقة التماسك','coherence relation','علاقة منظمة بين مقطعين (سبب، تفصيل…).'],['السبك المعجمي','lexical cohesion','تشارك كلمات متطابقة أو متقاربة في الجمل المتجاورة.'],['نظرية البنية البلاغية','Rhetorical Structure Theory (RST)','علاقات نواة-تابع في شجرة.'],['النواة / التابع','nucleus / satellite','المركزي المستقل / الثانوي التابع.'],['وحدة الخطاب الأولية','elementary discourse unit (EDU)','ورقة شجرة RST.'],['بنك بن للخطاب','Penn Discourse TreeBank (PDTB)','علاقات بين أزواج مقاطع مبنية على الروابط.'],['الرابط الخطابي','discourse connective','because، although، as a result…'],['صريح / ضمني','explicit / implicit','برابط ظاهر / بلا رابط.'],['تحليل الخطاب','discourse parsing','استنتاج علاقات التماسك آلياً.'],['النووية','nuclearity (NN, NS, SN)','أي الطرفين نواة.'],['RST-Pareval','RST-Pareval (S, N, R, F)','مقاييس تقييم شجرة RST.'],['التحليل الضحل','shallow discourse parsing','تحليل PDTB المسطح.'],['نظرية التمركز','Centering Theory','بروز الكيانات وانتقالاتها.'],['المركز الخلفي / الأمامي / المفضل','Cb / Cf / Cp','البارز الآن / المرشحون مرتبين / أعلاهم.'],['Continue / Retain / Shift','Continue / Retain / Smooth-, Rough-Shift','انتقالات برينان مرتبة تفضيلاً.'],['شبكة الكيانات','entity grid','جمل × كيانات بالأدوار S/O/X/–.'],['انتقال الكيان المحلي','local entity transition','تسلسل أدوار كيان في جمل متجاورة.'],['الإشراف الذاتي','self-supervision','تمييز الترتيب الأصلي من المخلوط.'],['TextTiling','TextTiling','جيب التمام بين المقاطع المتجاورة.'],['LCD','local coherence discriminator','مميّز الأزواج المتتالية الحقيقية.'],['خسارة الهامش','margin loss','max(0, η − f⁺ + f⁻).'],['تنقيب الحجاج','argumentation mining','استخراج الادعاءات والمقدمات وعلاقاتها.'],['الادعاء / المقدمة','claim / premise','المكون الخلافي / سبب دعمه أو نقضه.'],['التقسيم الحجاجي','argumentative zoning','وسوم جمل الأوراق العلمية (AIM، OWN METHOD…).']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
