/* Chapter 21 · Information Extraction — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s21-1','21.1','استخراج العلاقات'],['s21-2','21.2','خوارزميات العلاقات'],['s21-3','21.3','استخراج الأحداث'],['s21-4','21.4','تمثيل الزمن'],['s21-5','21.5','الجهة'],['s21-6','21.6','TimeBank'],['s21-7','21.7','التحليل الزمني'],['s21-8','21.8','ملء القوالب'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- ACE relations ---------- */
const ACE=[['PHYSICAL',['Located','Near'],'Physical-Located · PER-GPE · “He was in Tennessee”'],['PART-WHOLE',['Geographical','Subsidiary'],'Part-Whole-Subsidiary · ORG-ORG · “XYZ, the parent company of ABC”'],['PERSON-SOCIAL',['Business','Family','Lasting Personal'],'Person-Social-Family · PER-PER · “Yoko’s husband John”'],['GENERAL AFFILIATION',['Citizen-Resident-Ethnicity-Religion','Org-Location-Origin'],null],['ORG AFFILIATION',['Founder','Employment','Membership','Ownership','Student-Alum','Sports-Affiliation','Investor'],'Org-AFF-Founder · PER-ORG · “Steve Jobs, co-founder of Apple...”'],['ARTIFACT',['User-Owner-Inventor-Manufacturer'],null]];
let acI=0;$('#acBtns').innerHTML=ACE.map((a,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${a[0]} (${a[1].length})</button>`).join('');
function drawAC(){const [n,sub,ex]=ACE[acI];$$('#acBtns button').forEach((b,j)=>b.classList.toggle('pri',j===acI));
  $('#acCalc').textContent=`${n}: ${sub.join(' · ')}\n`+(ex?`example (Fig. 21.2): ${ex}`:'(no example for this group in Fig. 21.2)')+`\ntotal: ${ACE.reduce((a,b)=>a+b[1].length,0)} relations in 6 groups`+(acI===2||acI===4?'\nin our news text: Tim Wagner (spokesman) → American Airlines = ORG AFFILIATION: Employment':acI===1?'\nin our news text: American Airlines → AMR Corp., United → UAL Corp. = PART-WHOLE: Subsidiary':'')}
$$('#acBtns button').forEach(b=>b.addEventListener('click',()=>{acI=+b.dataset.i;drawAC()}));drawAC();

/* ---------- Hearst patterns ---------- */
const HX=['Agar is a substance prepared from a mixture of red algae, such as Gelidium, for laboratory or industrial use.','temples, treasuries, and other important civic buildings','red algae such as Gelidium','such authors as Herrick, Goldsmith, and Shakespeare','common-law countries, including Canada and England','European countries, especially France, England, and Spain'];
$('#hpBtns').innerHTML=HX.map((x,i)=>`<button class="btn" data-i="${i}" dir="ltr">${i===0?'Agar…':esc(x.split(' ').slice(0,3).join(' '))+'…'}</button>`).join('');
const STOP=/^(a|an|the|of|from|and|or|is|are|was|for|to|in|mixture|prepared|substance)$/i;
function npLeft(words,end,n=2){const out=[];for(let i=end;i>=0&&out.length<n;i--){const w=words[i].replace(/[,.]$/,'');if(!w||STOP.test(w)||/,$/.test(words[i])&&out.length)break;out.unshift(w)}return out.join(' ')}
function items(s){return s.replace(/[.]$/,'').split(/,\s*|\s+(?:and|or)\s+/).map(x=>x.replace(/^(and|or)\s+/,'').trim()).filter(Boolean).map(x=>x.split(/\s+(?:for|to|in|at)\s+/)[0])}
function hearst(t){const out=[];let m;
  if(m=t.match(/(.*?)\bsuch as\s+(.*)/i)){const w=m[1].replace(/,\s*$/,'').trim().split(/\s+/);const H=npLeft(w,w.length-1);items(m[2].split(/,\s*(?:for|to)\b/)[0]).forEach(x=>out.push([x,H,'NPH such as {NP,}* {(or|and)} NP']))}
  if(m=t.match(/\bsuch\s+(\w+(?:\s\w+)?)\s+as\s+(.*)/i))items(m[2]).forEach(x=>out.push([x,m[1],'such NPH as {NP,}* {(or|and)} NP']));
  if(m=t.match(/(.*?),?\s+(?:and|or)\s+other\s+(.*)/i))items(m[1]).forEach(x=>out.push([x,m[2].replace(/[.]$/,''),'NP {, NP}* {,} (and|or) other NPH']));
  if(m=t.match(/(.*?),?\s+including\s+(.*)/i)){const w=m[1].trim().split(/\s+/);items(m[2]).forEach(x=>out.push([x,npLeft(w,w.length-1),'NPH {,} including {NP,}* {(or|and)} NP']))}
  if(m=t.match(/(.*?),?\s+especially\s+(.*)/i)){const w=m[1].trim().split(/\s+/);items(m[2]).forEach(x=>out.push([x,npLeft(w,w.length-1),'NPH {,} especially {NP}* {(or|and)} NP']))}
  return out}
function drawHP(){const r=hearst($('#hpIn').value);$('#hpCalc').textContent=r.length?`pattern: ${r[0][2]}\n`+r.map(([a,b])=>`hyponym(${a}, ${b})   i.e. “${a}” is a kind of “${b}”`).join('\n'):'no Hearst pattern found (try “such as”, “including”, “especially”, “and other”)'}
$('#hpIn').addEventListener('input',drawHP);$$('#hpBtns button').forEach(b=>b.addEventListener('click',()=>{$('#hpIn').value=HX[+b.dataset.i];drawHP()}));$('#hpIn').value=HX[0];drawHP();

/* ---------- entity pairs ---------- */
const RP=[{s:'Citing high fuel prices, [ORG United Airlines] said [TIME Friday] it has increased fares by [MONEY $6] per round trip …',e:['United Airlines/ORG','Friday/TIME','$6/MONEY'],r:[]},
 {s:'[ORG American Airlines], a unit of [ORG AMR Corp.], immediately matched the move, spokesman [PER Tim Wagner] said.',e:['American Airlines/ORG','AMR Corp./ORG','Tim Wagner/PER'],r:[['American Airlines','AMR Corp.','PART-WHOLE: Subsidiary (“a unit of”)'],['Tim Wagner','American Airlines','ORG AFFILIATION: Employment (“spokesman”)']]},
 {s:'[ORG United], a unit of [ORG UAL Corp.], said the increase took effect [TIME Thursday] … such as [LOC Chicago] to [LOC Dallas] and [LOC Denver] to [LOC San Francisco].',e:['United/ORG','UAL Corp./ORG','Thursday/TIME','Chicago/LOC','Dallas/LOC','Denver/LOC','San Francisco/LOC'],r:[['United','UAL Corp.','PART-WHOLE: Subsidiary'],['United','Chicago, Dallas, Denver, San Francisco','domain-specific: airline route (×4)']]}];
let rpI=1;$('#rpBtns').innerHTML=RP.map((_,i)=>`<button class="btn${i===rpI?' pri':''}" data-i="${i}">الجملة ${i+1}</button>`).join('');
function drawRP(){const R=RP[rpI],n=R.e.length,pairs=n*(n-1)/2,rel=R.r.reduce((a,r)=>a+(r[1].includes(',')?4:1),0);$$('#rpBtns button').forEach((b,j)=>b.classList.toggle('pri',j===rpI));
  $('#rpCalc').textContent=`${R.s}\n\nentities: ${R.e.join(', ')}\n${n} entities → ${n}·${n-1}/2 = ${pairs} unordered pairs to classify\n`+(R.r.length?R.r.map(r=>`  ${r[0]} — ${r[1]}: ${r[2]}`).join('\n'):'  (no ACE relation between these entities)')+`\n${pairs-rel} of ${pairs} pairs are “no relation” → a filtering classifier saves work (TACRED: ~80% no_relation)`}
$$('#rpBtns button').forEach(b=>b.addEventListener('click',()=>{rpI=+b.dataset.i;drawRP()}));drawRP();

/* ---------- de-lexification ---------- */
function drawDL(){const m=segVal('#dlM','m');$('#dlCalc').textContent=(m==='raw'?'[CLS] Tim Wagner was born in Detroit , Michigan':'[CLS] [SUBJ_PERSON] was born in [OBJ_LOC] , Michigan')+'\n→ ENCODER → [CLS] vector → linear classifier → p(relation | SUBJ, OBJ)\n'+(m==='raw'?'risk: the model memorizes that “Tim Wagner” or “Detroit” go with certain relations':'the subject and object are replaced by their NER tags, so the classifier must rely on the context “was born in”')+'\n(the sentence is ours; Fig. 21.6 shows only the de-lexified version)'}
segOn('#dlM',drawDL);drawDL();

/* ---------- RlogF + noisy-or ---------- */
function drawCF(){let h=+$('#cfH').value,f=+$('#cfF').value;if(h>f){f=h;$('#cfF').value=f}$('#cfHo').textContent=h;$('#cfFo').textContent=f;
  const c=[+$('#cf1').value,+$('#cf2').value,+$('#cf3').value];['1','2','3'].forEach((k,i)=>$('#cf'+k+'o').textContent=r2(c[i]));
  const rl=h/f*Math.log2(f),fail=c.reduce((a,v)=>a*(1-v),1);
  $('#cfCalc').textContent=`Conf_RlogF(p) = (${h}/${f}) · log₂(${f}) = ${f3(h/f)} × ${f3(Math.log2(f))} = ${f3(rl)}\n  precision on known tuples (${f3(h/f)}) × productivity (log of how much it finds); the book says it is “generally normalized to produce a probability” (log base 2 is our choice)\nnoisy-or: Conf(t) = 1 − (1 − ${r2(c[0])})(1 − ${r2(c[1])})(1 − ${r2(c[2])}) = 1 − ${f3(fail)} = ${f3(1-fail)}`+(c.filter(v=>v>0).length>1?'\nmore independent supporting patterns → higher confidence than any single one':'')}
['#cfH','#cfF','#cf1','#cf2','#cf3'].forEach(x=>$(x).addEventListener('input',drawCF));drawCF();

/* ---------- distant supervision ---------- */
const DB=[['born-in','Edwin Hubble','Marshfield','PER','LOC'],['born-in','Albert Einstein','Ulm','PER','LOC'],['born-year','Albert Einstein','1879','PER','YEAR']];
const DSS=['...Hubble was born in Marshfield...','...Einstein, born (1879), Ulm...','...Hubble’s birthplace in Marshfield...','...Einstein gave a lecture in Ulm in 1921...','...Hubble moved to Chicago...'];
let dsOn=false;
function drawDS(){const last=n=>n.split(' ').pop();const rows=[];
  DSS.forEach((s,i)=>{DB.forEach(([r,a,b,ta,tb])=>{if(s.includes(last(a))&&s.includes(b)){let p=s.replace(/^\.\.\.|\.\.\.$/g,'').replace(last(a),ta).replace(b,tb);if(r==='born-in'&&/1879/.test(p))p=p.replace('1879','XXXX');rows.push([i,r,a,b,p,i===3])}})});
  $('#dsTab').innerHTML='<tr><th>sentence</th><th>matched DB tuple</th><th>extracted pattern feature</th></tr>'+DSS.map((s,i)=>{const m=rows.filter(r=>r[0]===i);return `<tr style="${dsOn&&m.some(x=>x[5])?'background:var(--rose-soft)':''}"><td>${esc(s)}</td><td>${dsOn?(m.map(x=>`&lt;${x[1]}, ${x[2]}, ${x[3]}&gt;`).join('<br>')||'—'):''}</td><td class="mono">${dsOn?(m.map(x=>esc(x[4])).join('<br>')||'—'):''}</td></tr>`}).join('');
  $('#dsCalc').textContent=dsOn?`${rows.length} matches from ${DB.length} database tuples and ${DSS.length} sentences\nfeatures for each tuple are pooled over ALL sentences that mention both entities\nred row: “Einstein gave a lecture in Ulm” also contains Einstein + Ulm → a noisy, wrong training example for born-in\n(this noise is why distant supervision has low precision)`:'database: '+DB.map(d=>`<${d[0]}, ${d[1]}, ${d[2]}>`).join('  ')+'\nsentences: '+DSS.length+' (two of them are our own additions)'}
$('#dsGo').addEventListener('click',()=>{dsOn=!dsOn;$('#dsGo').textContent=dsOn?'امسح':'طابق القاعدة مع الجمل';drawDS()});drawDS();

/* ---------- ReVerb ---------- */
const RVS=['United/NNP has/VBZ a/DT hub/NN in/IN Chicago/NNP ,/, which/WDT is/VBZ the/DT headquarters/NN of/IN United/NNP Continental/NNP Holdings/NNP ./.','Einstein/NNP was/VBD born/VBN in/IN Ulm/NNP ./.','The/DT company/NN made/VBD a/DT deal/NN with/IN Apple/NNP ./.'].map(s=>s.split(' ').map(t=>{const i=t.lastIndexOf('/');return [t.slice(0,i),t.slice(i+1)]}));
const isV=t=>/^(VB|MD)/.test(t),isW=t=>/^(NN|JJ|RB|PRP|DT|CD)/.test(t),isP=t=>/^(IN|RP|TO)$/.test(t);
function reverb(S){const tg=S.map(x=>x[1]),n=S.length,spans=[];
  for(let i=0;i<n;i++){if(!isV(tg[i]))continue;let j=i+1;if(j<n&&tg[j]==='RP')j++;if(j<n&&/^RB/.test(tg[j]))j++;let best=j;let k=j;while(k<n&&isW(tg[k]))k++;if(k<n&&isP(tg[k]))best=k+1;else if(j<n&&isP(tg[j]))best=j+1;spans.push([i,best])}
  const merged=[];spans.forEach(s=>{const l=merged[merged.length-1];if(l&&s[0]<=l[1])l[1]=Math.max(l[1],s[1]);else merged.push(s.slice())});
  const np=[];for(let i=0;i<n;){if(/^(DT|JJ|NN|PRP|CD)/.test(tg[i])&&!merged.some(([a,b])=>i>=a&&i<b)){let j=i;while(j<n&&/^(DT|JJ|NN|PRP|CD)/.test(tg[j])&&!merged.some(([a,b])=>j>=a&&j<b))j++;if(tg.slice(i,j).some(t=>/^(NN|PRP|CD)/.test(t)))np.push([i,j]);i=j}else i++}
  return merged.map(([a,b])=>{const x=[...np].reverse().find(([s,e])=>e<=a),y=np.find(([s,e])=>s>=b);return {a,b,x,y}})}
function drawRV(){const S=RVS[+segVal('#rvS','s')],R=reverb(S),words=S.map(x=>x[0]);
  const role=i=>R.some(r=>i>=r.a&&i<r.b)?'rel':R.some(r=>r.x&&i>=r.x[0]&&i<r.x[1])||R.some(r=>r.y&&i>=r.y[0]&&i<r.y[1])?'arg':'';
  $('#rvOut').innerHTML=S.map(([w,t],i)=>{const r=role(i);return `<span style="display:inline-block;text-align:center;margin:0 2px;${r==='rel'?'background:var(--rose-soft);':r==='arg'?'background:var(--math-soft);':''}border-radius:5px;padding:0 4px"><span style="font-size:15px">${esc(w)}</span><br><span class="mono" style="font-size:10px;color:var(--soft)">${t}</span></span>`}).join('');
  $('#rvCalc').textContent=R.map((r,k)=>`r${k+1}: <${r.x?words.slice(...r.x).join(' '):'?'}, ${words.slice(r.a,r.b).join(' ')}, ${r.y?words.slice(...r.y).join(' '):'?'}>`).join('\n')+'\n(red = relation phrase matching V | VP | VW*P; blue = nearest noun phrases; “which” is skipped when searching left)'+(segVal('#rvS','s')==='1'?'\n“was” and “born in” are adjacent matches → merged into one relation phrase':'')+(segVal('#rvS','s')==='2'?'\nlight verb “made”: the noun “deal” carries the core of the relation':'')}
segOn('#rvS',drawRV);drawRV();

/* ---------- events ---------- */
const EVT=[['','Citing','REPORTING (verb)'],[' high fuel prices, United Airlines '],['','said','REPORTING, tense=PAST, aspect=PERFECTIVE'],[' Friday it has '],['','increased','OCCURRENCE (verb)'],[' fares by $6 per round trip on flights to some cities also served by lower-cost carriers. American Airlines, a unit of AMR Corp., immediately '],['','matched','OCCURRENCE (verb)'],[' '],['','the move','nominal event: a noun phrase denoting the fare increase'],[', spokesman Tim Wagner '],['','said','REPORTING, tense=PAST, aspect=PERFECTIVE'],['. United, a unit of UAL Corp., '],['','said','REPORTING, tense=PAST, aspect=PERFECTIVE'],[' '],['','the increase','nominal event'],[' '],['x','took effect','NOT an event: tells when the increase began'],[' Thursday and '],['','applies','event / state (verb)'],[' to most routes where it '],['','competes','event (verb)'],[' against discount carriers, such as Chicago to Dallas and Denver to San Francisco.']];
let evI=2;
function drawEV(){$('#evText').innerHTML=EVT.map((e,i)=>e.length===1?esc(e[0]):`<span data-i="${i}" style="cursor:pointer;border-radius:4px;padding:0 3px;${e[0]==='x'?'border:1.5px dashed var(--rose);':'border:1.5px solid var(--green);'}${i===evI?'background:var(--green-soft);font-weight:700':''}">${esc(e[1])}</span>`).join('');
  $$('#evText span[data-i]').forEach(s=>s.addEventListener('click',()=>{evI=+s.dataset.i;drawEV()}));const e=EVT[evI];
  $('#evCalc').textContent=`“${e[1]}”: ${e[2]}\n${EVT.filter(x=>x.length>1&&x[0]!=='x').length} event mentions in the book’s markup (green); dashed = a verb that is not an event\n(the classes shown are our illustration; the book only annotates the “said” events)`}
drawEV();

/* ---------- Allen relations ---------- */
const A=[3,7];
function allen(a,b){const [s1,e1]=a,[s2,e2]=b;
  if(e1<s2)return ['A before B','B after A'];if(e2<s1)return ['A after B','B before A'];if(e1===s2)return ['A meets B',"B meets' A"];if(e2===s1)return ["A meets' B",'B meets A'];
  if(s1===s2&&e1===e2)return ['A equals B','(B equals A)'];if(s1===s2)return e1<e2?['A starts B',"B starts' A"]:["A starts' B",'B starts A'];if(e1===e2)return s1>s2?['A finishes B',"B finishes' A"]:["A finishes' B",'B finishes A'];
  if(s1>s2&&e1<e2)return ['A during B',"B during' A"];if(s2>s1&&e2<e1)return ["A during' B",'B during A'];if(s1<s2)return ['A overlaps B',"B overlaps' A"];return ["A overlaps' B",'B overlaps A']}
function drawAL(){let s=+$('#alS').value,e=+$('#alE').value;if(e<=s){e=s+1;$('#alE').value=e}$('#alSo').textContent=s;$('#alEo').textContent=e;const W=520,x=v=>30+v*42;
  let g=`<svg class="map" viewBox="0 0 ${W} 110" role="img">`;for(let i=0;i<=11;i++)g+=`<line x1="${x(i)}" y1="10" x2="${x(i)}" y2="92" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(i)}" y="105" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${i}</text>`;
  g+=`<rect x="${x(A[0])}" y="20" width="${x(A[1])-x(A[0])}" height="22" rx="5" fill="var(--math)" opacity=".85"/><text x="${(x(A[0])+x(A[1]))/2}" y="35" font-size="13" text-anchor="middle" fill="var(--paper)" font-family="Noto Sans">A</text><rect x="${x(s)}" y="56" width="${x(e)-x(s)}" height="22" rx="5" fill="var(--rose)" opacity=".85"/><text x="${(x(s)+x(e))/2}" y="71" font-size="13" text-anchor="middle" fill="var(--paper)" font-family="Noto Sans">B</text></svg>`;
  $('#alSvg').innerHTML=g;const [r1,r2]=allen(A,[s,e]);$('#alCalc').textContent=`A = [${A[0]}, ${A[1]}]   B = [${s}, ${e}]\n${r1}   ⇔   ${r2}\n(7 basic relations + 6 inverses (marked ′) = 13; “equals” is its own inverse)`}
['#alS','#alE'].forEach(z=>$(z).addEventListener('input',drawAL));drawAL();

/* ---------- Reichenbach ---------- */
const RB={pp:[['E',1],['R',2],['U',3],'Past Perfect','I had eaten (when the flight departed)'],sp:[['R,E',1.5],['U',3],'Simple Past','I ate'],prp:[['E',1],['R,U',3],'Present Perfect','I have eaten'],pr:[['U,R,E',2],'Present','I eat'],sf:[['U,R',1],['E',3],'Simple Future','I will eat'],fp:[['U',1],['E',2],['R',3],'Future Perfect','I will have eaten (by then)']};
function drawRB(){const d=RB[segVal('#rbT','t')],pts=d.filter(x=>Array.isArray(x)),W=520,x=v=>40+(v-0.5)*150;
  let g=`<svg class="map" viewBox="0 0 ${W} 90" role="img"><defs><marker id="rba" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L8,4L0,8z" fill="var(--soft)"/></marker></defs><line x1="20" y1="50" x2="${W-20}" y2="50" stroke="var(--soft)" stroke-width="1.5" marker-end="url(#rba)"/><text x="${W-22}" y="70" font-size="10" text-anchor="end" fill="var(--soft)" font-family="Noto Sans">time →</text>`;
  pts.forEach(([l,v])=>{g+=`<circle cx="${x(v)}" cy="50" r="6" fill="${l.includes('E')?'var(--rose)':'var(--math)'}"/><text x="${x(v)}" y="34" font-size="14" text-anchor="middle" fill="var(--ink)" font-weight="700" font-family="Noto Sans Mono">${l}</text>`});
  $('#rbSvg').innerHTML=g+'</svg>';const [nm,ex]=d.slice(pts.length);
  $('#rbCalc').textContent=`${nm}: ${pts.map(p=>p[0]).join(' — ')}   e.g. “${ex}” (our example)\nE = event time, R = reference time, U = utterance time; a comma means the points coincide`+(nm==='Past Perfect'?'\n(21.19) When Mary’s flight departed, I had eaten lunch: eating (E) before the departure (R), both before now (U)':nm==='Simple Past'?'\n(21.18) When Mary’s flight departed, I ate lunch: the departure (R) and the eating (E) together, before now (U)':'')}
segOn('#rbT',drawRB);drawRB();

/* ---------- aspect quiz ---------- */
const AQ=[['I like express trains.','stative'],['She drove a Mazda.','activity'],['He booked me a reservation.','accomplishment'],['She found her gate.','achievement'],['I need the cheapest fare.','stative'],['I live in Brooklyn.','activity'],['The 7:00 train got me to New York City.','accomplishment'],['I reached New York.','achievement'],['I flew.','activity'],['I flew to New York.','accomplishment'],['I know my departure gate.','stative'],['John is flying.','activity'],['Sally booked her flight.','accomplishment']];
const AN={stative:'حالة (stative)',activity:'نشاط (activity)',accomplishment:'إنجاز (accomplishment)',achievement:'بلوغ (achievement)'};
const AW={stative:'no change; the property holds continuously',activity:'goes on over time with no built-in end point',accomplishment:'takes time and has a natural end point / result state (telic)',achievement:'punctual: happens in an instant and results in a state (telic)'};
let aqI=0,aqScore=[0,0];
function drawAS(){$('#asQ').textContent=AQ[aqI][0];$('#asQ').dir='ltr';$$('#asA button').forEach(b=>b.classList.remove('on'));$('#asCalc').textContent=`sentence ${aqI+1} of ${AQ.length} · score ${aqScore[0]}/${aqScore[1]}`}
$$('#asA button').forEach(b=>b.addEventListener('click',()=>{$$('#asA button').forEach(x=>x.classList.toggle('on',x===b));const ok=b.dataset.a===AQ[aqI][1];aqScore[1]++;if(ok)aqScore[0]++;
  $('#asCalc').textContent=`${ok?'✓':'✗'} ${AQ[aqI][0]} → ${AQ[aqI][1]}: ${AW[AQ[aqI][1]]}`+(AQ[aqI][0].startsWith('I flew')?'\nthe class depends on the whole expression: “to New York” adds an end point':'')+`\nscore ${aqScore[0]}/${aqScore[1]}`}));
$('#asN').addEventListener('click',()=>{aqI=(aqI+1)%AQ.length;drawAS()});drawAS();

/* ---------- temporal normalizer ---------- */
const pad=n=>String(n).padStart(2,'0'),iso=d=>`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
const addD=(d,n)=>new Date(d.getTime()+n*864e5);
function isoWeek(d){const t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));const day=(t.getUTCDay()+6)%7;const th=addD(t,3-day);const y=th.getUTCFullYear();const jan1=new Date(Date.UTC(y,0,1));return [y,1+Math.floor(((th-jan1)/864e5)/7)]}
const wk=d=>{const [y,w]=isoWeek(d);return `${y}-W${pad(w)}`};
function drawNM(){const v=$('#nmD').value;if(!v)return;const D=new Date(v+'T00:00:00Z'),dow=(D.getUTCDay()+6)%7,DN=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const lastDow=t=>{let k=(dow-t+7)%7;if(k===0)k=7;return iso(addD(D,-k))},nextDow=t=>{let k=(t-dow+7)%7;if(k===0)k=7;return iso(addD(D,k))};
  const q=Math.floor(D.getUTCMonth()/3)+1;
  const R=[['today','DATE',iso(D),'anchor'],['yesterday','DATE',iso(addD(D,-1)),'anchor − 1 day'],['tomorrow','DATE',iso(addD(D,1)),'anchor + 1 day'],['last week','DATE',wk(addD(D,-7)),'ISO week of anchor − 1'],['this week','DATE',wk(D),'ISO week of anchor'],['next week','DATE',wk(addD(D,7)),'ISO week + 1'],['the weekend','DURATION','P1WE','a duration (anchored to a week)'],['two weeks','DURATION','P2W','duration'],['three days','DURATION','P3D','duration'],['last Tuesday','DATE',lastDow(1),'most recent past Tuesday'],['next Friday','DATE',nextDow(4),'nearest coming Friday (ambiguous! could be the one after)'],['this quarter','DATE',`${D.getUTCFullYear()}-Q${q}`,'financial quarter Qn'],['last year','DATE',String(D.getUTCFullYear()-1),'year − 1']];
  $('#nmTab').innerHTML='<tr><th>expression</th><th>type</th><th>value (ISO 8601)</th><th>rule</th></tr>'+R.map(r=>`<tr><td>${r[0]}</td><td class="mono">${r[1]}</td><td class="mono"><b>${r[2]}</b></td><td>${r[3]}</td></tr>`).join('');
  $('#nmCalc').textContent=`document date (temporal anchor): ${iso(D)}, a ${DN[dow]}, ISO week ${wk(D)}`+(v==='2007-07-02'?'\nthe book’s example: July 2, 2007 → 2007-W27, so “last week” = 2007-W26 ✓':'')+'\n(next/last rules are simple heuristics; real systems use tense and context)'}
$('#nmD').addEventListener('input',drawNM);drawNM();

/* ---------- template filling ---------- */
const TF=[['LEAD AIRLINE','UNITED AIRLINES','United Airlines','extracted text span (also “United” later: coreference)'],['AMOUNT','$6','$6','extracted text span'],['EFFECTIVE DATE','2006-10-26','Thursday','inferred: “Thursday” normalized against the article date'],['FOLLOWER','AMERICAN AIRLINES','American Airlines','extracted text span; the role comes from “matched the move”']];
let tfI=0;const TXT='Citing high fuel prices, United Airlines said Friday it has increased fares by $6 per round trip on flights to some cities also served by lower-cost carriers. American Airlines, a unit of AMR Corp., immediately matched the move, spokesman Tim Wagner said. United, a unit of UAL Corp., said the increase took effect Thursday and applies to most routes where it competes against discount carriers, such as Chicago to Dallas and Denver to San Francisco.';
function drawTF(){$('#tfTab').innerHTML='<tr><th colspan="2">FARE-RAISE ATTEMPT</th></tr>'+TF.map((t,i)=>`<tr data-i="${i}" style="cursor:pointer;${i===tfI?'background:var(--green-soft)':''}"><td class="mono">${t[0]}:</td><td class="mono"><b>${t[1]}</b></td></tr>`).join('');
  $$('#tfTab tr[data-i]').forEach(r=>r.addEventListener('click',()=>{tfI=+r.dataset.i;drawTF()}));const t=TF[tfI];const k=TXT.indexOf(t[2]);
  $('#tfText').innerHTML=esc(TXT.slice(0,k))+`<mark style="background:var(--amber-soft);color:var(--amber);font-weight:700;border-radius:4px;padding:0 2px">${esc(t[2])}</mark>`+esc(TXT.slice(k+t[2].length));
  $('#tfCalc').textContent=`${t[0]} = ${t[1]}  ←  “${t[2]}”: ${t[3]}`+(tfI===2?'\n(so the article itself must be dated Friday 2006-10-27)':'')}
drawTF();

/* ---------- glossary ---------- */
const GL=[['استخراج المعلومات','information extraction (IE)','تحويل النص غير المنظم إلى بيانات منظمة.'],['استخراج العلاقات','relation extraction','إيجاد العلاقات بين الكيانات وتصنيفها.'],['الرسم المعرفي','knowledge graph','بيانات معرفة علائقية منظمة.'],['ACE','Automatic Content Extraction','تقييمات بـ ١٧ علاقة في ٦ مجموعات.'],['صندوق المعلومات','infobox','جدول حقائق منظم في ويكيبيديا.'],['ثلاثية RDF','RDF triple','فاعل-محمول-مفعول.'],['الكلمة العامة / الخاصة','hypernym / hyponym','«حيوان» / «زرافة».'],['TACRED','TACRED','١٠٦ آلاف مثال، ٤١ علاقة + no_relation.'],['أنماط هيرست','Hearst patterns','أنماط معجمية-نحوية لعلاقة «نوع من».'],['الإقلاع الذاتي','bootstrapping','من بذور قليلة إلى أنماط وثلاثيات جديدة.'],['الانجراف الدلالي','semantic drift','نمط خاطئ يجر ثلاثيات وأنماطاً خاطئة.'],['RlogF','RlogF confidence','دقة النمط × لوغاريتم إنتاجيته.'],['noisy-or','noisy-or','1 − Π(1 − ثقة كل نمط داعم).'],['الإشراف البعيد','distant supervision','قاعدة بيانات تعطي أمثلة تدريب مشوّشة كثيرة.'],['الاستخراج المفتوح','open information extraction (Open IE)','علاقات سلاسل كلمات بلا قائمة مسبقة.'],['ReVerb','ReVerb','نظام Open IE بقيد V | VP | VW*P.'],['ذكر الحدث','event mention','تعبير عن حدث أو حالة له زمن.'],['الفعل الخفيف','light verb','فعل قليل المعنى والحدث في مفعوله.'],['جبر الفترات','interval algebra','تمثيل ألن للأحداث فتراتٍ.'],['علاقات ألن','Allen relations','١٣ علاقة بين فترتين.'],['النقطة المرجعية','reference point (Reichenbach)','R بين زمن الحدث E والتلفظ U.'],['الجهة','aspect / aktionsart','البنية الزمنية الداخلية للحدث.'],['حالة / نشاط / إنجاز / بلوغ','stative / activity / accomplishment / achievement','أقسام فندلر الأربعة.'],['غائي','telic','له نقطة نهاية أو غاية.'],['TimeBank / TimeML','TimeBank / TimeML','مدوّنة ولغة وسم زمنية.'],['TLINK / ALINK / SLINK','temporal / aspectual / subordination links','روابط الزمن والجهة والواقعية.'],['التعبير الزمني','temporal expression (TIMEX3)','مطلق، ونسبي، ومدة.'],['التطبيع الزمني','temporal normalization','تحويل التعبير إلى قيمة ISO 8601.'],['المرساة الزمنية','temporal anchor','تاريخ الوثيقة الذي تُحسب منه التعابير النسبية.'],['ملء القوالب','template filling','ملء خانات موقف نمطي من النص.'],['السيناريو','script','تسلسل نمطي من الأحداث والأدوار.'],['التعرّف على القالب / استخراج الملء','template recognition / role-filler extraction','هل القالب موجود؟ / من يملأ كل خانة؟'],['FASTUS / MUC','FASTUS / Message Understanding Conferences','نظام محوّلات قديم / تقييمات حكومية.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
