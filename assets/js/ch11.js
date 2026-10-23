/* Chapter 11 · Information Retrieval and RAG — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2);
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const L10=Math.log10;
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
const toks=s=>(s.toLowerCase().match(/[a-z0-9’']+/g)||[]).map(t=>t.replace(/’/g,"'"));

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s11-1','11.1','استرجاع المعلومات'],['s11-2','11.2','تقييم الاسترجاع'],['s11-3','11.3','الاسترجاع الكثيف'],['s11-4','11.4','RAG'],['s11-5','11.5','مجموعات البيانات'],['s11-6','11.6','تقييم الإجابات'],['ex','','الخلاصة']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

function plot(el,o){
  const W=o.W||560,H=o.H||240,L=46,R=14,T=14,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img">`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${v}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">${o.xl}</text>`;if(o.yl)s+=`<text x="${L}" y="${T-3}">${o.yl}</text>`;
  (o.lines||[]).forEach(p=>{s+=`<path d="${p.pts.map((q,i)=>(i?'L':'M')+x(q[0]).toFixed(1)+' '+y(q[1]).toFixed(1)).join('')}" fill="none" stroke="${p.c}" stroke-width="${p.w||2}" ${p.dash?'stroke-dasharray="5 4"':''}/>`});
  (o.pts||[]).forEach(p=>{s+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||4}" fill="${p.c}"/>${p.t?`<text x="${x(p.x)+(p.dx??8)}" y="${y(p.y)+(p.dy??-8)}" style="fill:${p.c}" ${p.end?'text-anchor="end"':''}>${p.t}</text>`:''}`});
  el.innerHTML=s+'</svg>';
}

/* ---------- bag of words ---------- */
function drawBW(){const T=toks($('#bwIn').value),c={};T.forEach(t=>c[t]=(c[t]||0)+1);const e=Object.entries(c).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  $('#bwOut').innerHTML=e.map(([w,n])=>`<span class="chip${n>1?' a':''}">${esc(w)}<small>${n}</small></span>`).join('');
  $('#bwCalc').textContent=`${T.length} tokens, ${e.length} different words. Word order is thrown away; only counts are kept.\n“it” occurs ${c.it||0} times`+(c.it===5?' (as the book says)':'')+`\nthe document becomes a vector of length |V| with these counts and 0 everywhere else`}
$('#bwIn').addEventListener('input',drawBW);drawBW();

/* ---------- Shakespeare term-document matrix ---------- */
const TW=['battle','good','fool','wit'],TP=['As You Like It','Twelfth Night','Julius Caesar','Henry V'],TM=[[1,0,7,13],[114,80,62,89],[36,58,1,4],[20,15,2,3]],TC=['var(--green)','var(--green)','var(--rose)','var(--rose)'];
const col=j=>TM.map(r=>r[j]),dotv=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cosv=(a,b)=>dotv(a,b)/Math.sqrt(dotv(a,a)*dotv(b,b));
$('#tdTab').innerHTML=`<tr><th></th>${TP.map(p=>`<th>${p}</th>`).join('')}</tr>`+TW.map((w,i)=>`<tr><td><b>${w}</b></td>${TM[i].map(v=>`<td class="num">${v}</td>`).join('')}</tr>`).join('');
function drawTD(){const xi=+segVal('#tdX','w'),yi=+segVal('#tdY','w'),mx=Math.max(...TM[xi])*1.15,my=Math.max(...TM[yi])*1.2;
  plot($('#tdPlot'),{W:520,H:230,xmin:0,xmax:mx,ymin:0,ymax:my,xt:[0,Math.round(mx/2),Math.round(mx)],yt:[0,Math.round(my/2)],xl:TW[xi],yl:TW[yi],pts:TP.map((p,j)=>({x:TM[xi][j],y:TM[yi][j],c:TC[j],t:`${p} [${TM[xi][j]},${TM[yi][j]}]`,r:6,end:TM[xi][j]>mx*0.6,dx:TM[xi][j]>mx*0.6?-8:8}))});
  const pairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  $('#tdCalc').textContent=`cosine using all 4 dimensions:\n`+pairs.map(([a,b])=>`  cos(${TP[a]}, ${TP[b]}) = ${f3(cosv(col(a),col(b)))}`).join('\n')+`\nAs You Like It is closest to Twelfth Night, as the book says, but ALL cosines are high (Julius Caesar vs Henry V: 0.999):\nthe frequent word “good” dominates every raw count vector. This is why we weight terms (tf-idf) instead of using raw counts.`}
segOn('#tdX',drawTD);segOn('#tdY',drawTD);drawTD();

/* ---------- idf ---------- */
const IDW=[['Romeo',1,1.57],['salad',2,1.27],['Falstaff',4,0.967],['forest',12,0.489],['battle',21,0.246],['wit',34,0.037],['fool',36,0.012],['good',37,0],['sweet',37,0]];
$('#idTab').innerHTML='<tr><th>Word</th><th>df</th><th>idf (book)</th><th>log₁₀(37/df)</th></tr>'+IDW.map(([w,d,i])=>`<tr data-d="${d}" style="cursor:pointer"><td>${w}</td><td class="num">${d}</td><td class="num">${i}</td><td class="num">${f3(L10(37/d))}</td></tr>`).join('');
$$('#idTab tr[data-d]').forEach(tr=>tr.addEventListener('click',()=>{$('#idD').value=tr.dataset.d;drawID()}));
function drawID(){const d=+$('#idD').value,c=+$('#idC').value;$('#idDo').textContent=d;$('#idCo').textContent=c;const idf=L10(37/d),tf=c>0?1+L10(c):0;
  $('#idCalc').textContent=`idf = log₁₀(N/df) = log₁₀(37/${d}) = ${f3(idf)}\ntf  = ${c>0?`1 + log₁₀(${c}) = ${f3(tf)}`:'0 (count is 0)'}\ntf-idf = ${f3(tf)} × ${f3(idf)} = ${f3(tf*idf)}`+(d===37?'\n→ a word in every play gets idf 0: it cannot tell documents apart':'')}
['#idD','#idC'].forEach(s=>$(s).addEventListener('input',drawID));drawID();

/* ---------- nano documents: tf-idf cosine and BM25 ---------- */
const DOCS=['Sweet sweet nurse! Love?','Sweet sorrow','How sweet is love?','Nurse!'],DT=DOCS.map(toks),N=DT.length,VOC=[...new Set(DT.flat())];
const cnt=(t,arr)=>arr.filter(x=>x===t).length,df=t=>DT.filter(d=>d.includes(t)).length,idf=t=>df(t)?L10(N/df(t)):0,tf=c=>c>0?1+L10(c):0;
function tfidfVec(arr){return Object.fromEntries(VOC.map(t=>[t,tf(cnt(t,arr))*idf(t)]))}
const vlen=v=>Math.sqrt(Object.values(v).reduce((s,x)=>s+x*x,0));
function scoreAll(){const q=toks($('#tfQ').value),m=segVal('#tfM','m'),k=+$('#tfK').value,b=+$('#tfB').value,avg=DT.reduce((s,d)=>s+d.length,0)/N;
  if(m==='tfidf'){const qv=tfidfVec(q),ql=vlen(qv);return DT.map((d,i)=>{const dv=tfidfVec(d),dl=vlen(dv);return {i,s:ql&&dl?VOC.reduce((s,t)=>s+qv[t]/ql*dv[t]/dl,0):0,qv,ql,dv,dl}})}
  const qs=[...new Set(q)].filter(t=>VOC.includes(t));return DT.map((d,i)=>({i,s:qs.reduce((s,t)=>{const c=cnt(t,d);return s+idf(t)*c/(k*(1-b+b*d.length/avg)+c)},0),qs,avg}))}
function drawTF(){const m=segVal('#tfM','m');$('#tfBM').style.display=m==='bm25'?'':'none';$('#tfKo').textContent=(+$('#tfK').value).toFixed(1);$('#tfBo').textContent=(+$('#tfB').value).toFixed(2);
  const S=scoreAll(),rank=[...S].sort((a,b)=>b.s-a.s);
  $('#tfDocs').innerHTML='<tr><th>rank</th><th>doc</th><th>text</th><th>score</th></tr>'+rank.map((r,k)=>`<tr${k===0&&r.s>0?' style="background:var(--green-soft)"':''}><td class="num">${k+1}</td><td>Doc ${r.i+1}</td><td>${esc(DOCS[r.i])}</td><td class="num">${r.s===0?'0':r.s<0.1?r.s.toFixed(4):f3(r.s)}</td></tr>`).join('');
  const di=+segVal('#tfD','d'),R=S[di];let s='';
  if(m==='tfidf'){const q=toks($('#tfQ').value);
    s=`N = 4 documents.  idf = log₁₀(4/df)\nword     | q: cnt  tf    tf-idf  n'lized | d${di+1}: cnt  tf     tf-idf  n'lized | product\n`+VOC.map(t=>{const qc=cnt(t,q),dc=cnt(t,DT[di]),qn=R.ql?R.qv[t]/R.ql:0,dn=R.dl?R.dv[t]/R.dl:0;return `${t.padEnd(8)} |    ${qc}   ${f3(tf(qc))} ${f3(R.qv[t])}   ${f3(qn)}  |     ${dc}   ${f3(tf(dc))}  ${f3(R.dv[t])}   ${f3(dn)}  | ${f3(qn*dn)}`}).join('\n')+
     `\n|q| = ${f3(R.ql)}   |d${di+1}| = ${f3(R.dl)}   cosine = Σ products = ${R.s<0.1&&R.s>0?R.s.toFixed(4):f3(R.s)}`+(di<2?`   (book: ${di===0?'0.747':'0.0779'})`:'   (left as an exercise in the book)')}
  else{const d=DT[di];s=`BM25 for Doc ${di+1} (|d| = ${d.length}, |d_avg| = ${R.avg}), k = ${$('#tfK').value}, b = ${$('#tfB').value}\n`+(R.qs.length?R.qs.map(t=>{const c=cnt(t,d),den=(+$('#tfK').value)*(1-(+$('#tfB').value)+(+$('#tfB').value)*d.length/R.avg)+c;return `  ${t}: idf ${f3(idf(t))} × ${c}/${f3(den)} = ${f3(idf(t)*c/den)}`}).join('\n'):'  no query word is in the collection')+`\nscore = ${f3(R.s)}\n(idf uses log₁₀ here, as in tf-idf; the book's Eq. 11.12 writes just “log”)`}
  $('#tfCalc').textContent=s;drawIX()}
['#tfQ','#tfK','#tfB'].forEach(s=>$(s).addEventListener('input',drawTF));segOn('#tfM',drawTF);segOn('#tfD',drawTF);

/* ---------- inverted index ---------- */
function drawIX(){const q=new Set(toks($('#tfQ').value));const terms=[...VOC].sort();
  $('#ixIdx').innerHTML=terms.map(t=>{const p=DT.map((d,i)=>[i+1,cnt(t,d)]).filter(x=>x[1]);const on=q.has(t);return `<span style="${on?'color:var(--green);font-weight:600':''}">${(t+' {'+p.length+'}').padEnd(11)} → ${p.map(([i,c])=>`${i} [${c}]`).join(' → ')}</span>`}).join('\n');
  const cand=new Set();q.forEach(t=>DT.forEach((d,i)=>{if(d.includes(t))cand.add(i+1)}));
  $('#ixCalc').textContent=`query terms: ${[...q].join(', ')||'—'}\nfollow their postings lists → candidate documents: ${[...cand].sort().join(', ')||'none'}\nonly these need scoring; every other document has score 0`}
drawTF();

/* ---------- 11.2 ranked evaluation ---------- */
const BOOKJ='RNRNRRNRNNRNNNRNNRNNNNNNR'.split('');let J=[...BOOKJ];
function evStats(){let rel=0;const U=J.filter(x=>x==='R').length;return J.map((j,k)=>{if(j==='R')rel++;return {k:k+1,j,p:rel/(k+1),r:U?rel/U:0}})}
function drawEV(){const S=evStats(),U=J.filter(x=>x==='R').length;
  $('#evTab').innerHTML='<tr><th>Rank</th><th>Judgment</th><th>P@k</th><th>R@k</th></tr>'+S.map(s=>`<tr><td class="num">${s.k}</td><td><button class="btn" data-k="${s.k-1}" style="padding:0 10px;${s.j==='R'?'background:var(--green);color:var(--paper)':''}">${s.j}</button></td><td class="num">${r2(s.p)}</td><td class="num">${r2(s.r)}</td></tr>`).join('');
  $$('#evTab button').forEach(b=>b.addEventListener('click',()=>{const k=+b.dataset.k;J[k]=J[k]==='R'?'N':'R';drawEV()}));
  const lv=[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1],ip=lv.map(r=>{const c=S.filter(s=>s.r>=r-1e-9);return c.length?Math.max(...c.map(s=>s.p)):0});
  const relS=S.filter(s=>s.j==='R'),AP=relS.length?relS.reduce((a,s)=>a+s.p,0)/relS.length:0;
  plot($('#evPlot'),{W:340,H:240,xmin:0,xmax:1,ymin:0,ymax:1.05,xt:[0,.5,1],yt:[0,.5,1],xl:'Recall',yl:'Precision',lines:[{pts:S.map(s=>[s.r,s.p]),c:'var(--soft)',w:1.2},{pts:lv.map((r,i)=>[r,ip[i]]),c:'var(--green)',w:2.5}],pts:relS.map(s=>({x:s.r,y:s.p,c:'var(--amber)',r:3.5}))});
  $('#evCalc').textContent=`relevant documents: ${U}   (recall denominator)\n11-point interpolated precision:\n`+lv.map((r,i)=>`  R ${r.toFixed(1)} → ${r2(ip[i])}`).join('\n')+`\nAP = mean of P@k at the relevant ranks [${relS.map(s=>s.k).join(', ')}]\n   = (${relS.map(s=>r2(s.p)).join(' + ')}) / ${relS.length} = ${f3(AP)}`+(J.join('')===BOOKJ.join('')?'   (book: 0.6)':'')+`\n(grey: raw P/R points; green: interpolated curve)`}
$('#evBook').addEventListener('click',()=>{J=[...BOOKJ];drawEV()});
$('#evBest').addEventListener('click',()=>{const n=J.filter(x=>x==='R').length;J=J.map((_,k)=>k<n?'R':'N');drawEV()});
$('#evWorst').addEventListener('click',()=>{const n=J.filter(x=>x==='R').length;J=J.map((_,k)=>k>=J.length-n?'R':'N');drawEV()});
drawEV();

/* ---------- cost of cross- vs bi-encoder ---------- */
function drawCE(){const N=10**(+$('#ceN').value),Q=10**(+$('#ceQ').value),K=+$('#ceK').value;$('#ceNo').textContent=fmtN(N);$('#ceQo').textContent=fmtN(Q);$('#ceKo').textContent=K;
  $('#ceCalc').textContent=`cross-encoder (query + passage together): ${fmtN(Q)} × ${fmtN(N)} = ${fmtN(Q*N)} BERT passes\nbi-encoder: encode passages once ${fmtN(N)} + each query ${fmtN(Q)} = ${fmtN(N+Q)} passes, then cheap dot products\nBM25 first, then cross-encoder rerank of top ${K}: ${fmtN(Q)} × ${K} = ${fmtN(Q*K)} passes\ncross-encoder costs ${fmtN(Q*N/(N+Q))}× more than the bi-encoder here`}
['#ceN','#ceQ','#ceK'].forEach(s=>$(s).addEventListener('input',drawCE));drawCE();

/* ---------- ColBERT MaxSim (2-D unit vectors, made up) ---------- */
const QT=[['premiere',60],['magic',10],['flute',30]],DTK=[['mozart',40],['magic',15],['flute',32],['debut',75],['1791',100]];
(function(){const S=QT.map(q=>DTK.map(d=>Math.cos((q[1]-d[1])*Math.PI/180))),mx=S.map(r=>Math.max(...r)),tot=mx.reduce((a,b)=>a+b,0);
  $('#cbTab').innerHTML=`<tr><th>query \\ doc</th>${DTK.map(d=>`<th>${d[0]}</th>`).join('')}<th>MaxSim</th></tr>`+QT.map((q,i)=>`<tr><td><b>${q[0]}</b></td>${S[i].map(v=>`<td class="num" style="${v===mx[i]?'background:var(--green-soft);color:var(--green);font-weight:600':''}">${f3(v)}</td>`).join('')}<td class="num"><b>${f3(mx[i])}</b></td></tr>`).join('');
  $('#cbCalc').textContent=`score(q, d) = Σ_i max_j E_qi · E_dj = ${mx.map(f3).join(' + ')} = ${f3(tot)}\n“premiere” finds “debut” (cos ${f3(mx[0])}) although the word premiere never occurs in the document\nwith BM25 the term premiere would add exactly 0: the vocabulary mismatch problem\n(vectors are 2-D unit vectors made up for illustration; dot product of unit vectors = cosine)`})();

/* ---------- RAG pipeline ---------- */
const RP=['The Magic Flute is an opera in two acts by Wolfgang Amadeus Mozart, with a German libretto by Emanuel Schikaneder.','The premiere of The Magic Flute took place on 30 September 1791 at the Theater auf der Wieden in Vienna, with Mozart conducting.','Mozart died in Vienna on 5 December 1791, a few weeks after the premiere of his last opera.','The flute is a woodwind instrument that produces sound from a flow of air across an opening.','Don Giovanni, another opera by Mozart, was first performed in Prague in 1787.','The Louvre Museum is located in Paris, on the Right Bank of the Seine.'];
const RPT=RP.map(toks),RN=RP.length,ravg=RPT.reduce((s,d)=>s+d.length,0)/RN;
function drawRG(){const q=[...new Set(toks($('#rgQ').value))],k=+$('#rgK').value;$('#rgKo').textContent=k;
  const sc=RPT.map((d,i)=>({i,s:q.reduce((s,t)=>{const c=cnt(t,d),dfx=RPT.filter(x=>x.includes(t)).length;return dfx?s+L10(RN/dfx)*c/(1.2*(0.25+0.75*d.length/ravg)+c):s},0)})).sort((a,b)=>b.s-a.s);
  $('#rgTab').innerHTML='<tr><th>rank</th><th>passage</th><th>BM25</th></tr>'+sc.map((r,j)=>`<tr style="${j<k?'background:var(--green-soft)':'opacity:.55'}"><td class="num">${j+1}</td><td>${esc(RP[r.i])}</td><td class="num">${f3(r.s)}</td></tr>`).join('');
  $('#rgPrompt').textContent=sc.slice(0,k).map((r,j)=>`[${j+1}] ${RP[r.i]}`).join('\n')+`\n\nBased on these texts, answer this question: ${$('#rgQ').value}`+`\n\n(the LLM would now generate the answer conditioned on this prompt; we do not run a model here)`}
['#rgQ','#rgK'].forEach(s=>$(s).addEventListener('input',drawRG));drawRG();

/* ---------- MMLU ---------- */
const MM=[['College Computer Science','Any set of Boolean operators that is sufficient to represent all Boolean expressions is said to be complete. Which of the following is NOT complete?',['AND, NOT','NOT, OR','AND, OR','NAND'],2],
 ['College Physics','The primary source of the Sun’s energy is a series of thermonuclear reactions in which the energy produced is c² times the mass difference between',['two hydrogen atoms and one helium atom','four hydrogen atoms and one helium atom','six hydrogen atoms and two helium atoms','three helium atoms and one carbon atom'],1],
 ['International Law','Which of the following is a treaty-based human rights mechanism?',['The UN Human Rights Committee','The UN Human Rights Council','The UN Universal Periodic Review','The UN special mandates'],0],
 ['Prehistory','Unlike most other early civilizations, Minoan culture shows little evidence of',['trade.','warfare.','the development of a common religion.','conspicuous consumption by elites.'],1]];
$('#mmList').innerHTML=MM.map((m,i)=>`<div class="card" dir="ltr" style="margin-bottom:8px"><b>${m[0]}</b><br>${esc(m[1])}<div style="margin-top:6px">${m[2].map((o,j)=>`<button class="btn" data-i="${i}" data-j="${j}" style="display:block;margin:3px 0;text-align:left;width:100%">(${'ABCD'[j]}) ${esc(o)}</button>`).join('')}</div><div class="note" id="mmR${i}" dir="rtl"></div></div>`).join('');
$$('#mmList button').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i,j=+b.dataset.j,c=MM[i][3];$$(`#mmList button[data-i="${i}"]`).forEach(x=>{const jj=+x.dataset.j;x.style.background=jj===c?'var(--green)':jj===j?'var(--rose-soft)':'';x.style.color=jj===c?'var(--paper)':''});
  $('#mmR'+i).innerHTML=j===c?'<b style="color:var(--green)">تطابق تام: ١</b>':`<b style="color:var(--rose)">تطابق تام: ٠</b> · الإجابة (${'ABCD'[c]})`}));

/* ---------- QA eval ---------- */
function drawQA(){const norm=s=>toks(s.replace(/[^\w\s’']/g,' ')),g=norm($('#qaG').value),p=norm($('#qaP').value);
  const gc={};g.forEach(t=>gc[t]=(gc[t]||0)+1);let common=0;const used={};p.forEach(t=>{if((gc[t]||0)>(used[t]||0)){used[t]=(used[t]||0)+1;common++}});
  const P=p.length?common/p.length:0,R=g.length?common/g.length:0,F=P+R?2*P*R/(P+R):0,EM=g.join(' ')===p.join(' ')?1:0;
  $('#qaCalc').textContent=`normalised gold: [${g.join(', ')}]   predicted: [${p.join(', ')}]\nexact match = ${EM}\ncommon tokens = ${common}   precision = ${common}/${p.length} = ${r2(P)}   recall = ${common}/${g.length} = ${r2(R)}\ntoken F1 = 2PR/(P+R) = ${r2(F)}\n(over a dataset: average the per-question F1)`}
['#qaG','#qaP'].forEach(s=>$(s).addEventListener('input',drawQA));drawQA();

/* ---------- glossary ---------- */
const GL=[['الهلوسة','hallucination','رد لا يطابق حقائق العالم.'],['المعايرة','calibration','تطابق ثقة النظام مع احتمال صحته.'],['التوليد المعزز بالاسترجاع','retrieval-augmented generation (RAG)','استرجاع وثائق ثم التوليد بشرطها.'],['استرجاع المعلومات','information retrieval (IR)','إعادة وثائق بحسب حاجة المستخدم.'],['الاسترجاع المخصص','ad hoc retrieval','استعلام ← وثائق مرتبة من مجموعة.'],['كيس الكلمات','bag of words','تمثيل النص بعدّ كلماته دون ترتيب.'],['مصفوفة المصطلحات والوثائق','term-document matrix','صف لكل كلمة وعمود لكل وثيقة.'],['تكرار المصطلح','term frequency (tf)','1 + log₁₀ count.'],['تكرار الوثائق / مقلوبه','df / idf','عدد الوثائق التي فيها الكلمة / log₁₀(N/df).'],['tf-idf','tf-idf','وزن الكلمة = tf × idf.'],['BM25','Okapi BM25','صيغة من tf-idf بمعاملي k وb.'],['قائمة التوقف','stop list','كلمات شائعة تُحذف قبل الفهرسة.'],['الفهرس المقلوب','inverted index','قاموس مصطلحات ← قوائم وثائقها.'],['قائمة الورود','postings','أرقام الوثائق التي فيها مصطلح.'],['الدقة / الاستدعاء عند k','precision / recall at k','نسبة الصالح في أعلى k / من كل الصالح.'],['الدقة المستوفاة','interpolated precision','أقصى دقة عند استدعاء يساوي المستوى أو أعلى.'],['متوسط الدقة المتوسطة','mean average precision (MAP)','متوسط الدقة عند رتب الصالح، ثم على الاستعلامات.'],['اختلاف المفردات','vocabulary mismatch','السؤال والجواب بكلمات مختلفة.'],['المرمِّز المزدوج','bi-encoder','مرمِّز للاستعلام وآخر للوثيقة، والدرجة ضرب نقطي.'],['إعادة الترتيب','reranking','ترتيب أفضل N بطريقة أدق وأغلى.'],['ColBERT','ColBERT','مجموع أقصى تشابه لكل رمز من رموز الاستعلام.'],['أقرب جار تقريبي','approximate nearest neighbor','بحث سريع عن أشبه المتجهات (Faiss).'],['المسترجع / المولِّد','retriever / generator (reader)','مكوّنا RAG.'],['RAG بالوكلاء','agent-based RAG','النظام يقرر متى يسترجع ومن أين.'],['الاستشهاد بالمعرفة','knowledge citation','إحالة الادعاءات إلى مصادرها.'],['فهم المقروء','reading comprehension','استخراج الإجابة من وثيقة معطاة.'],['كتاب مفتوح / مغلق','open / closed book QA','بوثائق / من النموذج وحده.'],['التطابق التام','exact match','نسبة الإجابات المطابقة حرفياً.'],['F1 على الرموز','token F1','التداخل بين كلمات الإجابة والمرجع.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
