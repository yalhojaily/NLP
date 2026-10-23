/* Chapter 13 · Machine Translation — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s13-1','13.1','اختلافات اللغات'],['s13-2','13.2','المرمِّز-المفكِّك والبيانات'],['s13-3','13.3','الانتباه المتقاطع'],['s13-4','13.4','البحث الشعاعي وMBR'],['s13-5','13.5','قلة الموارد'],['s13-6','13.6','التقييم: chrF وBERTScore'],['s13-7','13.7','الانحياز'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- 13.1.1 word order ---------- */
const RC={S:'var(--rose)',V:'var(--green)',O:'var(--amber)',PP:'var(--math)'};
const WO={en:{dir:'ltr',ch:[['S','He'],['V','wrote'],['O','a letter'],['PP','to a friend']],n:'SVO: the verb sits between subject and object; the preposition “to” comes BEFORE its noun.'},
 ja:{dir:'ltr',ch:[['PP','tomodachi ni','friend to'],['O','tegami-o','letter'],['V','kaita','wrote']],n:'SOV: the verb comes last; the postposition “ni” comes AFTER its noun; no pronoun for “he”.'},
 ar:{dir:'rtl',ch:[['V','كتبَ','wrote'],['O','رسالةً','a letter'],['PP','لصديقٍ','to a friend']],n:'VSO: the verb comes first; the preposition لِـ comes BEFORE its noun; the subject “he” is hidden inside the verb.'}};
function drawWO(){const L=WO[segVal('#woL','l')];
  $('#woOut').innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap;direction:${L.dir};justify-content:flex-start">`+L.ch.map(([r,w,g])=>`<div style="border:2px solid ${RC[r]};border-radius:8px;padding:4px 10px;text-align:center"><div style="font-size:18px;font-weight:600">${esc(w)}</div><div style="font-size:11px;color:${RC[r]};font-family:var(--f-mono)">${r}${g?' · '+esc(g):''}</div></div>`).join('')+'</div>';
  $('#woCalc').textContent=`order: ${L.ch.map(c=>c[0]).join(' – ')}\n${L.n}\n(S = subject, V = verb, O = object, PP = prepositional / postpositional phrase)`}
segOn('#woL',drawWO);drawWO();

/* ---------- 13.1.2 leg/foot/paw ---------- */
const LX={leg:[['human','jambe'],['animal','patte'],['chair','pied'],['journey','étape']],foot:[['human','pied'],['animal','patte'],['bird','patte']],paw:[['animal','patte']]};
function drawLX(){const w=segVal('#lxW','w');
  $('#lxOut').innerHTML=LX[w].map(([c,f])=>`<div class="row" dir="ltr" style="gap:8px;margin:3px 0"><span class="chip">${w}</span><span style="color:var(--soft)">of a ${c} →</span><span class="chip a">${f}</span></div>`).join('');
  const used=[...new Set(Object.values(LX).flat().map(x=>x[1]))];
  $('#lxCalc').textContent=`English “${w}” → ${[...new Set(LX[w].map(x=>x[1]))].join(', ')}\nand in the other direction: French “patte” ← leg (animal), foot (animal, bird), paw;  “pied” ← leg (chair), foot (human)\na many-to-many mapping: ${Object.keys(LX).length} English words, ${used.length} French words`}
segOn('#lxW',drawLX);drawLX();

/* ---------- 13.2.2 sentence alignment (Fig 13.4) ---------- */
const ES=['“Good morning,” said the little prince.','“Good morning,” said the merchant.','This was a merchant who sold pills that had been perfected to quench thirst.','You just swallow one pill a week and you won’t feel the need for anything to drink.','“They save a huge amount of time,” said the merchant.','“Fifty−three minutes a week.”','“If I had fifty−three minutes to spend?” said the little prince to himself.','“I would take a stroll to a spring of fresh water”'];
const FS=['-Bonjour, dit le petit prince.','-Bonjour, dit le marchand de pilules perfectionnées qui apaisent la soif.','On en avale une par semaine et l’on n’éprouve plus le besoin de boire.','-C’est une grosse économie de temps, dit le marchand.','Les experts ont fait des calculs.','On épargne cinquante-trois minutes par semaine.','“Moi, se dit le petit prince, si j’avais cinquante-trois minutes à dépenser, je marcherais tout doucement vers une fontaine...”'];
const AL=[[[0],[0]],[[1,2],[1]],[[3],[2]],[[4],[3]],[[],[4]],[[5],[5]],[[6,7],[6]]];let alI=1;
function drawAL(){const W=520,H=300,yE=i=>22+i*36,yF=i=>22+i*40,xE=150,xF=370;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:560px">`;
  AL.forEach(([e,f],k)=>{const on=k===alI;e.forEach(i=>f.forEach(j=>{s+=`<line x1="${xE}" y1="${yE(i)}" x2="${xF}" y2="${yF(j)}" stroke="${on?'var(--green)':'var(--rule)'}" stroke-width="${on?3:1.5}" data-k="${k}"/>`}))});
  ES.forEach((_,i)=>{const on=AL[alI][0].includes(i);s+=`<g data-k="${AL.findIndex(a=>a[0].includes(i))}" style="cursor:pointer"><rect x="${xE-110}" y="${yE(i)-12}" width="110" height="24" rx="6" fill="${on?'var(--green)':'var(--paper)'}" stroke="var(--ink)" stroke-width="1"/><text x="${xE-55}" y="${yE(i)+4}" font-size="12" text-anchor="middle" fill="${on?'var(--paper)':'var(--ink)'}" font-family="Noto Sans Mono">E${i+1}</text></g>`});
  FS.forEach((_,j)=>{const on=AL[alI][1].includes(j),k=AL.findIndex(a=>a[1].includes(j));s+=`<g data-k="${k}" style="cursor:pointer"><rect x="${xF}" y="${yF(j)-12}" width="110" height="24" rx="6" fill="${on?'var(--green)':'var(--paper)'}" stroke="${AL[k][0].length?'var(--ink)':'var(--rose)'}" stroke-width="${AL[k][0].length?1:2}" ${AL[k][0].length?'':'stroke-dasharray="4 3"'}/><text x="${xF+55}" y="${yF(j)+4}" font-size="12" text-anchor="middle" fill="${on?'var(--paper)':'var(--ink)'}" font-family="Noto Sans Mono">F${j+1}</text></g>`});
  s+=`<text x="${xE-55}" y="${H-4}" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans">English</text><text x="${xF+55}" y="${H-4}" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans">French</text></svg>`;
  $('#alSvg').innerHTML=s;$$('#alSvg g[data-k]').forEach(g=>g.addEventListener('click',()=>{alI=+g.dataset.k;drawAL()}));
  const [e,f]=AL[alI],typ=`${e.length}–${f.length}`;
  $('#alCalc').textContent=`alignment ${typ}${e.length?'':' (null: F'+(f[0]+1)+' has no English counterpart)'}\n`+e.map(i=>`E${i+1}: ${ES[i]}`).join('\n')+(e.length?'\n':'')+f.map(j=>`F${j+1}: ${FS[j]}`).join('\n')+`\n(click any sentence box; dashed red = null alignment)`}
drawAL();

/* ---------- 13.3 cross-attention (illustrative weights) ---------- */
const CE=['The','green','witch','arrived'],CD=['llegó','la','bruja','verde'],CW=[[.05,.05,.1,.8],[.7,.05,.2,.05],[.1,.1,.75,.05],[.05,.8,.1,.05]];let caI=3;
$('#caBtns').innerHTML=CD.map((t,i)=>`<button class="btn${i===caI?' pri':''}" data-i="${i}">${t}</button>`).join('');
$$('#caBtns button').forEach(b=>b.addEventListener('click',()=>{caI=+b.dataset.i;$$('#caBtns button').forEach(x=>x.classList.toggle('pri',x===b));drawCA()}));
function drawCA(){const W=520,H=170,xs=i=>80+i*120;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:560px">`;
  CE.forEach((_,j)=>CD.forEach((_,i)=>{if(i!==caI)return;s+=`<line x1="${xs(i)}" y1="122" x2="${xs(j)}" y2="44" stroke="var(--green)" stroke-width="${0.5+CW[i][j]*9}" opacity="${0.25+CW[i][j]*0.75}"/><text x="${(xs(i)+xs(j))/2+(j>i?8:-8)}" y="${85}" font-size="11" text-anchor="middle" fill="var(--green)" font-family="Noto Sans Mono">${r2(CW[i][j])}</text>`}));
  CE.forEach((t,j)=>{s+=`<rect x="${xs(j)-42}" y="18" width="84" height="26" rx="6" fill="var(--math-soft)" stroke="var(--math)"/><text x="${xs(j)}" y="35" font-size="13" text-anchor="middle" fill="var(--math)" font-family="Noto Sans">${t}</text>`});
  CD.forEach((t,i)=>{s+=`<rect x="${xs(i)-42}" y="122" width="84" height="26" rx="6" fill="${i===caI?'var(--green)':'var(--paper)'}" stroke="var(--green)"/><text x="${xs(i)}" y="139" font-size="13" text-anchor="middle" fill="${i===caI?'var(--paper)':'var(--ink)'}" font-family="Noto Sans">${t}</text>`});
  s+=`<text x="8" y="12" font-size="10.5" fill="var(--soft)" font-family="Noto Sans">encoder output H_enc → keys, values</text><text x="8" y="${H-4}" font-size="10.5" fill="var(--soft)" font-family="Noto Sans">decoder → queries</text></svg>`;
  $('#caSvg').innerHTML=s;
  const top=CW[caI].indexOf(Math.max(...CW[caI]));
  $('#caCalc').textContent=`decoder token “${CD[caI]}”: q = h_dec · W^Q   [1 × d_k]\nK = H_enc · W^K   [4 × d_k]      V = H_enc · W^V   [4 × d_v]\nα = softmax(q Kᵀ / √d_k) = [${CW[caI].map(r2).join(', ')}]  over (${CE.join(', ')})\nmost attended source word: “${CE[top]}”   → output = Σ α_j v_j\nnote the reordering: “verde” (4th) looks at “green” (2nd), “llegó” (1st) at “arrived” (4th)\n(weights are made up for illustration)`}
drawCA();

/* ---------- 13.4 beam search on Fig 13.7 ---------- */
const T1={ok:.4,yes:.5,EOS:.1},T2={ok:{ok:.7,yes:.2,EOS:.1},yes:{ok:.3,yes:.4,EOS:.3}};
function drawBS(){const k=+segVal('#bsK','k'),all=[];
  Object.entries(T1).forEach(([a,pa])=>{if(a==='EOS'){all.push({p:[a],pr:pa});return}Object.entries(T2[a]).forEach(([b,pb])=>all.push({p:b==='EOS'?[a,b]:[a,b,'EOS'],pr:pa*pb}))});
  let chosen,log;
  if(k===3){chosen=all.reduce((x,y)=>y.pr>x.pr?y:x);log=`exhaustive: score every one of the ${all.length} sequences\n`+[...all].sort((a,b)=>b.pr-a.pr).map(s=>`  ${s.p.join(' ').padEnd(12)} ${f3(s.pr)}`).join('\n')}
  else{const f1=Object.entries(T1).sort((a,b)=>b[1]-a[1]).slice(0,k);log=`t1 frontier (best ${k}): ${f1.map(([w,p])=>`${w} ${r2(p)}`).join(', ')}\n`;
    const ext=[];f1.forEach(([a,pa])=>{if(a==='EOS'){ext.push({p:[a],pr:pa});return}Object.entries(T2[a]).forEach(([b,pb])=>ext.push({p:b==='EOS'?[a,b]:[a,b,'EOS'],pr:pa*pb}))});
    log+=`extend each: ${ext.map(s=>`${s.p.join(' ')} ${f3(s.pr)}`).join(', ')}\n`;
    const f2=[...ext].sort((a,b)=>b.pr-a.pr).slice(0,k);log+=`t2 frontier (best ${k}): ${f2.map(s=>`${s.p.join(' ')} ${f3(s.pr)}`).join(', ')}\nthen EOS with probability 1.0`;chosen=f2[0]}
  const best=all.reduce((x,y)=>y.pr>x.pr?y:x);
  $('#bsCalc').textContent=log+`\n\nresult: ${chosen.p.join(' ')}  (p = ${f3(chosen.pr)})`+(chosen===best||chosen.p.join()===best.p.join()?'  ✓ the most probable sequence':`  ✗ the best is ${best.p.join(' ')} (p = ${f3(best.pr)})`)+`\nlog-probs: ${chosen.p.map((w,i)=>i===0?Math.log(T1[w]).toFixed(2):i===1?Math.log(w==='EOS'?T2[chosen.p[0]].EOS:T2[chosen.p[0]][w]).toFixed(2):'0').join(' + ')} = ${Math.log(chosen.pr).toFixed(2)}`;
  /* tree */
  const W=520,H=250;const N={start:[30,125],ok:[160,70],yes:[160,180],EOS1:[160,232]};const kids={ok:{ok:[300,25],yes:[300,62],EOS:[300,100]},yes:{ok:[300,150],yes:[300,188],EOS:[300,226]}};
  const onPath=(a,b)=>chosen.p[0]===a&&(b===undefined||chosen.p[1]===b);
  let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="max-width:560px">`;
  const edge=(x1,y1,x2,y2,p,on)=>`<line x1="${x1+18}" y1="${y1}" x2="${x2-20}" y2="${y2}" stroke="${on?'var(--green)':'var(--rule)'}" stroke-width="${on?3:1.4}"/><text x="${(x1+x2)/2}" y="${(y1+y2)/2-4}" font-size="11" text-anchor="middle" fill="var(--rose)" font-family="Noto Sans Mono">${p}</text>`;
  s+=edge(...N.start,...N.ok,'.4',onPath('ok'))+edge(...N.start,...N.yes,'.5',onPath('yes'))+edge(...N.start,...N.EOS1,'.1',onPath('EOS'));
  ['ok','yes'].forEach(a=>Object.entries(kids[a]).forEach(([b,xy])=>{s+=edge(...N[a],...xy,String(T2[a][b]).replace('0.','.'),onPath(a,b));if(b!=='EOS'){s+=`<line x1="${xy[0]+22}" y1="${xy[1]}" x2="${420}" y2="${xy[1]}" stroke="${onPath(a,b)?'var(--green)':'var(--rule)'}" stroke-width="${onPath(a,b)?3:1.2}"/><text x="${380}" y="${xy[1]-4}" font-size="10" fill="var(--rose)" font-family="Noto Sans Mono">1.0</text><text x="${445}" y="${xy[1]+4}" font-size="12" text-anchor="middle" fill="var(--math)" font-family="Noto Sans Mono">EOS</text><text x="${495}" y="${xy[1]+4}" font-size="10.5" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${f3(T1[a]*T2[a][b])}</text>`}}));
  const lab=(xy,t)=>`<text x="${xy[0]}" y="${xy[1]+4}" font-size="13" text-anchor="middle" fill="var(--math)" font-family="Noto Sans Mono">${t}</text>`;
  s+=lab(N.start,'start')+lab(N.ok,'ok')+lab(N.yes,'yes')+lab(N.EOS1,'EOS');['ok','yes'].forEach(a=>Object.entries(kids[a]).forEach(([b,xy])=>{s+=lab(xy,b)}));
  $('#bsSvg').innerHTML=s+'</svg>'}
segOn('#bsK',drawBS);drawBS();

/* ---------- length normalization ---------- */
function drawLN(){const T=+$('#lnT').value;$('#lnTo').textContent=T;const sh=[-0.9,-1.2],ss=sh.reduce((a,b)=>a+b,0),ls=-0.5*T;
  $('#lnCalc').textContent=`short translation (2 words): log-probs ${sh.join(', ')} → sum ${ss.toFixed(2)}, per word ${(ss/2).toFixed(2)}\nlong translation (${T} words, each −0.50): sum ${ls.toFixed(2)}, per word −0.50\nraw sum picks: ${ss>=ls?'SHORT':'LONG'}     length-normalised (Eq. 13.16) picks: ${(ss/2)>=-0.5?'SHORT':'LONG'}`+(ss>=ls?'\n→ the long translation has better words on average, but every extra word adds a negative log-prob':'')}
$('#lnT').addEventListener('input',drawLN);drawLN();

/* ---------- chrF ---------- */
function ngr(s,n){const m={};for(let i=0;i+n<=s.length;i++){const g=s.slice(i,i+n);m[g]=(m[g]||0)+1}return m}
function chrF(ref,hyp,k,b,detail){const R=ref.replace(/\s+/g,''),H=hyp.replace(/\s+/g,'');let P=0,Rc=0;const lines=[];
  for(let n=1;n<=k;n++){const gr=ngr(R,n),gh=ngr(H,n),tr=Math.max(0,R.length-n+1),th=Math.max(0,H.length-n+1);let m=0;Object.entries(gh).forEach(([g,c])=>m+=Math.min(c,gr[g]||0));
    const p=th?m/th:0,r=tr?m/tr:0;P+=p;Rc+=r;if(detail)lines.push(`${n}-grams: ref ${tr}, hyp ${th}, matching ${m}   P = ${m}/${th} = ${f3(p)}   R = ${m}/${tr} = ${f3(r)}`)}
  P/=k;Rc/=k;const F=P+Rc?(1+b*b)*P*Rc/(b*b*P+Rc):0;return {F,P,R:Rc,lines,Rs:R,Hs:H}}
function drawCF(){const k=+$('#cfK').value,b=+$('#cfB').value;$('#cfKo').textContent=k;$('#cfBo').textContent=b;const x=chrF($('#cfR').value,$('#cfH').value,k,b,1);
  $('#cfCalc').textContent=`spaces removed:  REF ${x.Rs} (${x.Rs.length} chars)   HYP ${x.Hs} (${x.Hs.length} chars)\n`+x.lines.join('\n')+`\nchrP = average of the ${k} precisions = ${f3(x.P)}\nchrR = average of the ${k} recalls    = ${f3(x.R)}\nchrF${b},${k} = (1+β²)·chrP·chrR / (β²·chrP + chrR) = ${f3(x.F)}`+(k===2&&b===2&&$('#cfR').value==='witness for the past,'?($('#cfH').value==='witness of the past,'?'   (book: .86)':$('#cfH').value==='past witness'?'   (book: .62)':''):'')}
['#cfR','#cfH','#cfK','#cfB'].forEach(s=>$(s).addEventListener('input',drawCF));$$('#cfBox button[data-h]').forEach(b=>b.addEventListener('click',()=>{$('#cfH').value=b.dataset.h;$('#cfR').value='witness for the past,';$('#cfK').value=2;$('#cfB').value=2;drawCF()}));drawCF();

/* ---------- MBR with chrF ---------- */
const MB=['Llegó la bruja verde','La bruja verde llegó','Llegó la bruja verde.','Ha llegado la bruja verde','Llegó el brujo azul'];
$('#mbList').innerHTML='<div class="note">ترشيحات مسحوبة لترجمة «The green witch arrived»:</div><div class="chips" dir="ltr" style="margin-top:4px">'+MB.map((m,i)=>`<span class="chip">y${i+1}: ${esc(m)}</span>`).join('')+'</div>';
(function(){const U=MB.map(y=>MB.map(c=>y===c?null:chrF(c,y,4,2).F)),S=U.map(r=>r.reduce((a,v)=>a+(v??0),0)),best=S.indexOf(Math.max(...S));
  $('#mbTab').innerHTML=`<tr><th>y \\ c</th>${MB.map((_,j)=>`<th>c${j+1}</th>`).join('')}<th>Σ util</th></tr>`+U.map((r,i)=>`<tr style="${i===best?'background:var(--green-soft)':''}"><td>y${i+1}</td>${r.map(v=>`<td class="num">${v===null?'—':r2(v)}</td>`).join('')}<td class="num"><b>${r2(S[i])}</b></td></tr>`).join('');
  $('#mbCalc').textContent=`util(y, c) = chrF(reference = c, hypothesis = y), k = 4, β = 2\nŷ = argmax_y Σ_c util(y, c) → y${best+1}: “${MB[best]}”\ny5 (“el brujo azul”: wrong gender and colour) agrees least with the others, so MBR avoids it\n(the candidates are our own; a real system would sample 32–64 of them)`})();

/* ---------- BERTScore (illustrative cosines) ---------- */
const BX=['the','weather','is','cold','today'],BY=['it','is','freezing','today'],BS=[[.45,.30,.20,.25],[.40,.35,.60,.30],[.30,.95,.25,.35],[.20,.30,.85,.25],[.25,.30,.30,.97]];
(function(){const rm=BS.map(r=>Math.max(...r)),pm=BY.map((_,j)=>Math.max(...BS.map(r=>r[j]))),R=rm.reduce((a,b)=>a+b,0)/BX.length,P=pm.reduce((a,b)=>a+b,0)/BY.length,F=2*P*R/(P+R);
  $('#bzTab').innerHTML=`<tr><th>ref x \\ cand x̃</th>${BY.map(t=>`<th>${t}</th>`).join('')}<th>max (recall)</th></tr>`+BS.map((r,i)=>`<tr><td><b>${BX[i]}</b></td>${r.map(v=>`<td class="num" style="${v===rm[i]?'background:var(--green-soft);color:var(--green);font-weight:600':''}">${r2(v)}</td>`).join('')}<td class="num">${r2(rm[i])}</td></tr>`).join('')+`<tr><td>max (precision)</td>${pm.map(v=>`<td class="num">${r2(v)}</td>`).join('')}<td></td></tr>`;
  $('#bzCalc').textContent=`R_BERT = (1/|x|) Σ max = (${rm.map(r2).join(' + ')}) / ${BX.length} = ${f3(R)}\nP_BERT = (1/|x̃|) Σ max = (${pm.map(r2).join(' + ')}) / ${BY.length} = ${f3(P)}\nF_BERT = 2PR/(P+R) = ${f3(F)}\n“cold” matches “freezing” (0.85): chrF would give these words almost no credit\n(cosines are made up for illustration)`})();

/* ---------- 13.7 gender bias table ---------- */
const GB=[['ő egy ápoló','she is a nurse'],['ő egy tudós','he is a scientist'],['ő egy mérnök','he is an engineer'],['ő egy pék','he is a baker'],['ő egy tanár','she is a teacher'],['ő egy esküvőszervező','she is a wedding organizer'],['ő egy vezérigazgató','he is a CEO']];
$('#gbTab').innerHTML='<tr><th>Hungarian (gender neutral) source</th><th>English MT output</th></tr>'+GB.map(([h,e])=>`<tr><td>${h}</td><td>${e.replace(/^(she|he)/,m=>`<b style="color:${m==='she'?'var(--rose)':'var(--math)'}">${m}</b>`)}</td></tr>`).join('');
$('#gbCalc').textContent=`ő means both “he” and “she”. The system had to choose, and chose by occupation stereotype:\n${GB.filter(g=>g[1].startsWith('she')).length} × she (nurse, teacher, wedding organizer)   ${GB.filter(g=>g[1].startsWith('he ')).length} × he (scientist, engineer, baker, CEO)`;

/* ---------- glossary ---------- */
const esc2=esc;
const GL=[['الترجمة الآلية','machine translation (MT)','استعمال الحاسوب للترجمة بين اللغات.'],['الفجوة الرقمية','digital divide','المعلومات أكثر بلغات الدول الغنية.'],['التحرير اللاحق','post-editing','إصلاح المترجم لمسودة آلية.'],['التوطين','localization','تكييف محتوى لمجتمع لغوي.'],['علم التصنيف اللغوي','linguistic typology','دراسة الاختلافات المنتظمة بين اللغات.'],['SVO / SOV / VSO','word order types','ترتيب الفاعل والفعل والمفعول.'],['فجوة معجمية','lexical gap','لا مقابل لكلمة في اللغة الأخرى.'],['مؤطَّرة بالفعل / بالتوابع','verb-framed / satellite-framed','اتجاه الحركة على الفعل / على الأداة.'],['حاذفة الضمير','pro-drop','لغة يمكن أن تحذف الضمائر.'],['الكثافة الإحالية','referential density','كثرة استعمال الضمائر الصريحة.'],['المرمِّز-المفكِّك','encoder-decoder / seq2seq','مرمِّز للمصدر ومفكِّك يولّد الهدف.'],['WordPiece / Unigram','WordPiece / unigram (SentencePiece)','خوارزميتا ترميز فرعي.'],['النص المتوازي','parallel corpus / bitext','نص بلغتين أو أكثر.'],['محاذاة الجمل','sentence alignment','إيجاد الجمل المتقابلة بين ترجمتين.'],['الانتباه المتقاطع','cross-attention','Q من المفكِّك، وK وV من المرمِّز.'],['إجبار المعلّم','teacher forcing','إعطاء المفكِّك الرمز الذهبي في التدريب.'],['البحث الشعاعي','beam search','الاحتفاظ بأفضل k فرضيات في كل خطوة.'],['عرض الشعاع','beam width k','عدد الفرضيات المحتفظ بها.'],['تطبيع الطول','length normalization','قسمة لوغاريتم الاحتمال على الطول.'],['أقل مخاطرة بايزية','minimum Bayes risk (MBR)','اختيار الترشيح الأشبه بالبقية.'],['تعزيز البيانات','data augmentation','إضافة بيانات اصطناعية.'],['الترجمة العكسية','backtranslation','ترجمة نص أحادي في اللغة الهدف إلى المصدر.'],['الأمانة / الطلاقة','adequacy / fluency','نقل المعنى / طبيعية الأسلوب.'],['chrF','character F-score','تداخل n-grams الحروف مع المرجع.'],['BLEU','BLEU','دقة n-grams الكلمات مع عقوبة الإيجاز.'],['BERTScore','BERTScore','مطابقة الرموز بجيب تمام تضميناتها.'],['COMET / BLEURT','COMET / BLEURT','مقاييس مدرَّبة على تقييمات بشرية.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc2(g[1])}</td><td>${g[2]}</td></tr>`).join('');
