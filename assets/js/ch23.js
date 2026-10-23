/* Chapter 23 · Lexicons for Sentiment, Affect, and Connotation — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const bar=(lab,v,mx,txt,colr='var(--amber)')=>`<div class="br"><span class="w0" style="font-size:13px">${esc(lab)}</span><span class="tr"><span class="fl" style="display:block;width:${Math.max(0,v/mx*100)}%;background:${colr}"></span></span><span class="v">${txt}</span></div>`;

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s23-1','23.1','تعريف الانفعال'],['s23-2','23.2','المعاجم المتاحة'],['s23-3','23.3','الوسم البشري'],['s23-4','23.4','شبه الإشرافي'],['s23-5','23.5','الإشرافي'],['s23-6','23.6','تعرّف المشاعر'],['s23-7','23.7','تعرّف الانفعال'],['s23-8','23.8','الانفعال نحو كيان'],['s23-9','23.9','أطر الإيحاء'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- Scherer typology ---------- */
const SC=[['الانفعال','Emotion','Relatively brief episode of response to the evaluation of an external or internal event as being of major significance.','angry, sad, joyful, fearful, ashamed, proud, elated, desperate'],['المزاج','Mood','Diffuse affect state, most pronounced as change in subjective feeling, of low intensity but relatively long duration, often without apparent cause.','cheerful, gloomy, irritable, listless, depressed, buoyant'],['الموقف من الآخر','Interpersonal stance','Affective stance taken toward another person in a specific interaction, coloring the interpersonal exchange in that situation.','distant, cold, warm, supportive, contemptuous, friendly'],['الاتجاه','Attitude','Relatively enduring, affectively colored beliefs, preferences, and predispositions towards objects or persons.','liking, loving, hating, valuing, desiring'],['سمات الشخصية','Personality traits','Emotionally laden, stable personality dispositions and behavior tendencies, typical for a person.','nervous, anxious, reckless, morose, hostile, jealous']];
const SCT=['قصير جداً · له سبب','طويل نسبياً · بلا سبب ظاهر غالباً','في تفاعل بعينه','دائم نسبياً · نحو أشياء أو أشخاص','ثابت · سمة للشخص'];
$('#scBtns').innerHTML=SC.map((s,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${s[0]}</button>`).join('');
function drawSC(i){$$('#scBtns button').forEach((b,j)=>b.classList.toggle('pri',j===i));const s=SC[i];$('#scCalc').textContent=`${s[1]}: ${s[2]}\nexamples: ${s[3]}\nالمدة والطبيعة: ${SCT[i]}`+(i===3?'\n← تحليل المشاعر (الملحق B) = استخراج هذا النوع':'')}
$$('#scBtns button').forEach(b=>b.addEventListener('click',()=>drawSC(+b.dataset.i)));drawSC(0);

/* ---------- Plutchik wheel ---------- */
const PL=[['joy','#e8c33a'],['trust','#8cc56a'],['fear','#3a9a5b'],['surprise','#3aa3b8'],['sadness','#4a78c8'],['disgust','#9a6ac0'],['anger','#d0505a'],['anticipation','#e88a3a']];
const DY=['love','submission','awe','disapproval','remorse','contempt','aggressiveness','optimism'];
const EK={joy:'happiness',fear:'fear',surprise:'surprise',sadness:'sadness',disgust:'disgust',anger:'anger'};
let plI=0;
function drawPL(){const m=segVal('#plM','m'),cx=170,cy=150,R=120,r0=34;let s=`<svg viewBox="0 0 340 300" style="width:100%;max-width:420px;display:block;margin:0 auto" role="img">`;
  const pt=(a,r)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
  PL.forEach(([n,c],i)=>{const a0=(i-0.5)*Math.PI/4-Math.PI/2,a1=(i+0.5)*Math.PI/4-Math.PI/2;const [x0,y0]=pt(a0,r0),[x1,y1]=pt(a0,R),[x2,y2]=pt(a1,R),[x3,y3]=pt(a1,r0);
    const opp=(plI+4)%8,dim=m==='e'&&!EK[n];const hl=i===plI||i===opp;
    s+=`<path d="M${x0},${y0} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 0 0 ${x0},${y0}Z" fill="${c}" opacity="${dim?0.15:hl&&m==='b'?1:0.6}" stroke="var(--paper)" stroke-width="${hl&&m==='b'?3:1.5}" data-i="${i}" style="cursor:pointer"/>`;
    const [tx,ty]=pt((a0+a1)/2,(R+r0)/2+6);s+=`<text x="${tx}" y="${ty}" font-size="12" text-anchor="middle" fill="#1d1d1d" font-family="Noto Sans" font-weight="600" pointer-events="none">${m==='e'&&EK[n]?EK[n]:n}</text>`;
    if(m==='d'){const [dx,dy]=pt(a1,R+14);s+=`<text x="${dx}" y="${dy+4}" font-size="11" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans" font-style="italic">${DY[i]}</text>`}});
  if(m==='b'){const [ax,ay]=pt(plI*Math.PI/4-Math.PI/2,R-10),[bx,by]=pt(((plI+4)%8)*Math.PI/4-Math.PI/2,R-10);s+=`<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="4 3"/>`}
  $('#plSvg').innerHTML=s+'</svg>';$$('#plSvg path').forEach(p=>p.addEventListener('click',()=>{plI=+p.dataset.i;drawPL()}));
  $('#plCalc').textContent=m==='b'?`${PL[plI][0]} ⟷ opposite: ${PL[(plI+4)%8][0]}\nthe 4 opposing pairs: joy–sadness, anger–fear, trust–disgust, anticipation–surprise`:m==='d'?`each derived emotion combines two neighbours, e.g. ${PL[plI][0]} + ${PL[(plI+1)%8][0]} = ${DY[plI]}`:`Ekman’s 6 (claimed universal): surprise, happiness, anger, fear, disgust, sadness\nPlutchik’s trust and anticipation have no Ekman counterpart (dimmed)`}
segOn('#plM',drawPL);drawPL();

/* ---------- lexicons ---------- */
const VAD=[['Valence',[['vacation',.840],['delightful',.918],['whistle',.653],['consolation',.408],['torture',.115]]],['Arousal',[['enraged',.962],['party',.840],['organized',.337],['effortless',.120],['napping',.046]]],['Dominance',[['powerful',.991],['authority',.935],['saxophone',.482],['discouraged',.0090],['weak',.045]]]];
const EMC=['anger','anticipation','disgust','fear','joy','sadness','surprise','trust','positive','negative'];
const EMO=[['reward','0100101110'],['worry','0101010001'],['tenderness','0000100010'],['sweetheart','0100110110'],['suddenly','0000001000'],['thirst','0100011000'],['garbage','0010000001']];
const INT=[['Anger',[['outraged',.964],['violence',.742],['coup',.578],['oust',.484],['suspicious',.484],['nurture',.059]]],['Fear',[['horror',.923],['anguish',.703],['pestilence',.625],['stressed',.531],['failing',.531],['confident',.094]]],['Joy',[['superb',.864],['cheered',.773],['rainbow',.531],['gesture',.387],['warms',.391],['hardship',.031]]],['Sadness',[['sad',.844],['guilt',.750],['unkind',.547],['difficulties',.421],['beggar',.422],['sing',.017]]]];
const LIWC=[['Positive Emotion','appreciat*, comfort*, great, happy, interest, joy*, perfect*, please*, safe*, terrific, value, wow*'],['Negative Emotion','anger*, bore*, cry, despair*, fail*, fear, griev*, hate*, panic*, suffers, terrify, violent*'],['Insight','aware*, believe, decid*, feel, figur*, know, knew, means, notice*, recogni*, sense, think'],['Inhibition','avoid*, careful*, hesitat*, limit*, oppos*, prevent*, reluctan*, safe*, stop, stubborn*, wait, wary'],['Family','brother*, cousin*, daughter*, family, father*, grandf*, grandm*, husband, mom, mother, niece*, wife'],['Negate','aren’t, cannot, didn’t, neither, never, no, nobod*, none, nor, nothing, nowhere, without']];
let emoI=0;
function drawLX(){const m=segVal('#lxM','m');let h='',c='';
  if(m==='vad'||m==='int'){const D=m==='vad'?VAD:INT;h=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">`+D.map(([n,ws])=>`<div><div class="note" style="margin:0 0 4px;font-weight:600">${n}</div><div class="bars">${ws.map(([w,v])=>bar(w,v,1,String(v).replace(/^0\./,'.'),m==='vad'?'var(--math)':'var(--rose)')).join('')}</div></div>`).join('')+'</div>';
    c=m==='vad'?'NRC VAD (Mohammad 2018a): 20,000 words, each scored on all three dimensions (Fig. 23.4 shows only the dimension of each column)':'NRC Emotion/Affect Intensity (Mohammad 2018b): 5,814 words, real-valued association with anger, fear, joy, sadness'}
  else if(m==='emo'){h=`<div class="scroll" dir="ltr"><table class="tb" dir="ltr"><tr><th>Word</th>${EMC.map(e=>`<th style="font-size:11px">${e}</th>`).join('')}</tr>${EMO.map(([w,b],i)=>`<tr data-i="${i}" style="cursor:pointer;${i===emoI?'background:var(--green-soft)':''}"><td>${w}</td>${[...b].map(x=>`<td class="mono" style="${x==='1'?'color:var(--green);font-weight:700':'color:var(--soft)'}">${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
    const [w,b]=EMO[emoI];c=`${w}: ${EMC.filter((e,k)=>b[k]==='1').join(', ')||'(none)'}\nEmoLex (Mohammad & Turney 2013): ~14,000 words × Plutchik’s 8 emotions + positive/negative, binary`}
  else{h=`<div class="scroll" dir="ltr"><table class="tb" dir="ltr">${LIWC.map(([n,w])=>`<tr><th style="white-space:nowrap">${n}</th><td>${w}</td></tr>`).join('')}</table></div>`;c='LIWC (Pennebaker et al. 2007): 73 lexicons, 2300+ words; 5 of them shown + Negate. * = any word with this prefix'}
  $('#lxOut').innerHTML=h;$('#lxCalc').textContent=c;$$('#lxOut tr[data-i]').forEach(r=>r.addEventListener('click',()=>{emoI=+r.dataset.i;drawLX()}))}
segOn('#lxM',drawLX);drawLX();

/* ---------- best-worst scaling ---------- */
const BW=[['delightful',.918],['vacation',.840],['whistle',.653],['party',.78],['consolation',.408],['umbrella',.55],['traffic',.25],['torture',.115],['funeral',.08],['sunshine',.88],['tax',.2],['pencil',.5]];
let bwSeed=1;
function corr(a,b){const n=a.length,ma=a.reduce((x,y)=>x+y,0)/n,mb=b.reduce((x,y)=>x+y,0)/n;let s=0,sa=0,sb=0;for(let i=0;i<n;i++){s+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sb+=(b[i]-mb)**2}return sa&&sb?s/Math.sqrt(sa*sb):0}
function drawBW(){const N=+$('#bwN').value,S=+$('#bwS').value;$('#bwNo').textContent=N;$('#bwSo').textContent=r2(S);const R=rng(1000+bwSeed*7919);
  const gauss=()=>{let u=0,v=0;while(!u)u=R();v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  const H=[0,1].map(()=>BW.map(()=>({b:0,w:0,n:0})));let ex='';
  for(let t=0;t<N;t++){const idx=[];while(idx.length<4){const k=Math.floor(R()*BW.length);if(!idx.includes(k))idx.push(k)}
    const pv=idx.map(k=>BW[k][1]+S*gauss());const bi=idx[pv.indexOf(Math.max(...pv))],wi=idx[pv.indexOf(Math.min(...pv))];const h=H[t%2];
    idx.forEach(k=>h[k].n++);h[bi].b++;h[wi].w++;if(t===0)ex=`first tuple: {${idx.map(k=>BW[k][0]).join(', ')}} → best: ${BW[bi][0]}, worst: ${BW[wi][0]}`}
  const sc=h=>h.map(x=>x.n?(x.b-x.w)/x.n:0);const all=BW.map((_,k)=>{const n=H[0][k].n+H[1][k].n;return n?(H[0][k].b+H[1][k].b-H[0][k].w-H[1][k].w)/n:0});
  const ord=BW.map((_,k)=>k).sort((a,b)=>all[b]-all[a]);
  $('#bwBars').innerHTML='<div class="bars">'+ord.map(k=>`<div class="br"><span class="w0" style="font-size:12px">${BW[k][0]}</span><span class="tr" style="position:relative"><span class="fl" style="display:block;width:${(all[k]+1)/2*100}%;background:${all[k]>=0?'var(--green)':'var(--rose)'}"></span><span style="position:absolute;top:0;bottom:0;left:50%;border-left:1px solid var(--ink)"></span></span><span class="v">${(all[k]>=0?'+':'')+r2(all[k])}</span></div>`).join('')+'</div>';
  $('#bwCalc').textContent=`${ex}\nscore = %best − %worst (from −1 to +1; middle line = 0)\nsplit-half reliability (odd vs even tuples): r = ${r2(corr(sc(H[0]),sc(H[1])))}\ncorrelation with the hidden “true” valence: r = ${r2(corr(all,BW.map(x=>x[1])))}\n(true values: the 5 valence words of Fig. 23.4; the other 7 are ours)`}
$('#bwN').addEventListener('input',drawBW);$('#bwS').addEventListener('input',drawBW);$('#bwGo').addEventListener('click',()=>{bwSeed++;drawBW()});drawBW();

/* ---------- semantic axis ---------- */
const AXP=[['good',2.0,3.0],['lovely',1.2,3.4],['excellent',2.6,2.6],['happy',1.6,2.8]],AXN=[['bad',-2.4,0.6],['horrible',-3.0,-0.2],['poor',-1.8,1.2],['unhappy',-2.2,-0.6]];
const AXT=[['delightful',1.8,3.6],['okay',0.6,2.0],['table',0.3,1.7],['mediocre',-0.8,1.6],['volatile',-1.0,0.4],['disaster',-2.8,0.2],['profit',1.5,1.0]];
const axOff=new Set();let axSel='okay';
function drawAX(){const P=AXP.filter(w=>!axOff.has(w[0])),N=AXN.filter(w=>!axOff.has(w[0]));
  const cen=L=>L.length?[L.reduce((a,w)=>a+w[1],0)/L.length,L.reduce((a,w)=>a+w[2],0)/L.length]:null;const vp=cen(P),vn=cen(N);
  const W=520,H=300,sx=x=>W/2+x*62,sy=y=>H-60-y*52;let s=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:560px;display:block;margin:0 auto" role="img"><defs><marker id="axA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="var(--math)"/></marker></defs>`;
  s+=`<line x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}" stroke="var(--grid)"/><line x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}" stroke="var(--grid)"/>`;
  let ax=null;if(vp&&vn){ax=[vp[0]-vn[0],vp[1]-vn[1]];s+=`<line x1="${sx(vn[0])}" y1="${sy(vn[1])}" x2="${sx(vp[0])}" y2="${sy(vp[1])}" stroke="var(--math)" stroke-width="2.5" marker-end="url(#axA)"/><text x="${(sx(vn[0])+sx(vp[0]))/2+6}" y="${(sy(vn[1])+sy(vp[1]))/2-6}" font-size="12" fill="var(--math)" font-family="Noto Sans Mono">V_axis</text>`;
    s+=`<circle cx="${sx(vp[0])}" cy="${sy(vp[1])}" r="6" fill="none" stroke="var(--green)" stroke-width="2"/><text x="${sx(vp[0])+8}" y="${sy(vp[1])+14}" font-size="12" fill="var(--green)" font-family="Noto Sans Mono">V+</text><circle cx="${sx(vn[0])}" cy="${sy(vn[1])}" r="6" fill="none" stroke="var(--rose)" stroke-width="2"/><text x="${sx(vn[0])+8}" y="${sy(vn[1])+14}" font-size="12" fill="var(--rose)" font-family="Noto Sans Mono">V−</text>`}
  const cos=(w)=>ax?(w[1]*ax[0]+w[2]*ax[1])/Math.hypot(w[1],w[2])/Math.hypot(...ax):NaN;
  const t=AXT.find(w=>w[0]===axSel);s+=`<line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(t[1])}" y2="${sy(t[2])}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="5 3"/>`;
  const dot=(w,c,k)=>`<g data-w="${w[0]}" data-k="${k}" style="cursor:pointer"><circle cx="${sx(w[1])}" cy="${sy(w[2])}" r="5" fill="${axOff.has(w[0])?'var(--paper)':c}" stroke="${c}" stroke-width="1.5"/><text x="${sx(w[1])+7}" y="${sy(w[2])-6}" font-size="12" fill="${axOff.has(w[0])?'var(--soft)':c}" font-family="Noto Sans" ${w[0]===axSel?'font-weight="700"':''}>${w[0]}</text></g>`;
  s+=AXP.map(w=>dot(w,'var(--green)','s')).join('')+AXN.map(w=>dot(w,'var(--rose)','s')).join('')+AXT.map(w=>dot(w,w[0]===axSel?'var(--amber)':'var(--soft)','t')).join('');
  $('#axSvg').innerHTML=s+'</svg>';
  $$('#axSvg g').forEach(g=>g.addEventListener('click',()=>{const w=g.dataset.w;if(g.dataset.k==='t')axSel=w;else axOff.has(w)?axOff.delete(w):axOff.add(w);drawAX()}));
  $('#axCalc').textContent=!ax?'need at least one positive and one negative seed':`V+ = centroid of ${P.length} positive seeds = (${r2(vp[0])}, ${r2(vp[1])})   V− = (${r2(vn[0])}, ${r2(vn[1])})\nV_axis = V+ − V− = (${r2(ax[0])}, ${r2(ax[1])})\nscore(${axSel}) = cos(E(${axSel}), V_axis) = ${f3(cos(t))}\n\nall scores: `+AXT.map(w=>[w[0],cos(w)]).sort((a,b)=>b[1]-a[1]).map(([w,c])=>`${w} ${(c>=0?'+':'')+r2(c)}`).join(' · ')}
drawAX();

/* ---------- SentProp ---------- */
const SN=[['love',300,70],['adore',380,40],['idolize',460,80],['like',250,140],['appreciate',360,120],['see',240,215],['find',330,265],['notice',350,195],['uncover',440,240],['dislike',150,180],['disapprove',150,255],['hate',80,120],['loathe',40,60],['abhor',130,40],['despise',60,200]];
const SE=[['love','adore',.85],['love','like',.75],['love','appreciate',.6],['adore','idolize',.8],['love','idolize',.6],['like','appreciate',.6],['like','see',.4],['like','dislike',.55],['appreciate','notice',.4],['see','notice',.7],['see','find',.65],['find','uncover',.6],['notice','uncover',.55],['find','notice',.5],['hate','loathe',.85],['hate','despise',.8],['loathe','abhor',.8],['abhor','hate',.7],['despise','dislike',.6],['hate','dislike',.65],['dislike','disapprove',.7],['disapprove','see',.3],['abhor','despise',.6]];
const SPOS=['love','adore','appreciate'],SNEG=['hate','loathe','despise'];
const sIdx=Object.fromEntries(SN.map((n,i)=>[n[0],i]));const nS=SN.length;
const Wm=Array.from({length:nS},()=>new Array(nS).fill(0));SE.forEach(([a,b,c])=>{const w=Math.acos(-c);Wm[sIdx[a]][sIdx[b]]=w;Wm[sIdx[b]][sIdx[a]]=w});
const Pm=Wm.map(r=>{const s=r.reduce((x,y)=>x+y,0);return r.map(x=>x/s)});
const BETA=0.2;
function seedVec(L){const v=new Array(nS).fill(0);L.forEach(w=>v[sIdx[w]]=1/L.length);return v}
function step(r,s0){const n=new Array(nS).fill(0);for(let i=0;i<nS;i++)for(let j=0;j<nS;j++)n[j]+=(1-BETA)*r[i]*Pm[i][j];return n.map((x,j)=>x+BETA*s0[j])}
function converge(L){let s0=seedVec(L),r=s0.slice();for(let k=0;k<200;k++)r=step(r,s0);return r}
let SP={it:0,p:null,n:null,boot:null};
function resetSP(){SP={it:0,p:seedVec(SPOS),n:seedVec(SNEG),boot:null};drawSP()}
function drawSP(){const sc=SP.p.map((x,i)=>x+SP.n[i]>1e-12?x/(x+SP.n[i]):0.5);
  const colr=v=>{const g=[46,139,87],r=[200,70,80],m=v=>Math.round(r[0]+(g[0]-r[0])*v);return `rgb(${m(v)},${Math.round(r[1]+(g[1]-r[1])*v)},${Math.round(r[2]+(g[2]-r[2])*v)})`};
  let s=`<svg viewBox="0 0 520 300" style="width:520px;max-width:none;display:block;margin:0 auto" role="img">`;
  SE.forEach(([a,b,c])=>{const A=SN[sIdx[a]],B=SN[sIdx[b]];s+=`<line x1="${A[1]}" y1="${A[2]}" x2="${B[1]}" y2="${B[2]}" stroke="var(--rule)" stroke-width="${0.5+c*2.5}"/>`});
  SN.forEach(([w,x,y],i)=>{const reach=SP.p[i]+SP.n[i]>1e-9,seed=SPOS.includes(w)||SNEG.includes(w);s+=`<circle cx="${x}" cy="${y}" r="${seed?9:7}" fill="${reach?colr(sc[i]):'var(--tint)'}" stroke="${seed?'var(--ink)':'var(--rule)'}" stroke-width="${seed?2:1}"/><text x="${x}" y="${y-13}" font-size="12" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${w}</text>`});
  $('#spSvg').innerHTML=s+'</svg>';
  const tgt=['like','see','notice','dislike','disapprove','idolize','uncover'];const reached=SN.map((_,i)=>i).filter(i=>SP.p[i]+SP.n[i]>1e-12);const mu=reached.reduce((a,i)=>a+sc[i],0)/(reached.length||1),sd=Math.sqrt(reached.reduce((a,i)=>a+(sc[i]-mu)**2,0)/(reached.length||1))||1;
  $('#spCalc').textContent=`step ${SP.it} · seeds: + {${SPOS.join(', ')}}  − {${SNEG.join(', ')}} · restart prob β = ${BETA}\nedge weight (23.4): E = arccos(−cos), e.g. cos .85 → ${r2(Math.acos(-.85))}, cos .3 → ${r2(Math.acos(-.3))}\n`+tgt.map(w=>{const i=sIdx[w];return `${w.padEnd(10)} raw+ ${SP.p[i].toFixed(4)}  raw− ${SP.n[i].toFixed(4)}  score+ ${SP.p[i]+SP.n[i]>1e-12?f3(sc[i])+'  std '+((sc[i]-mu)/sd>=0?'+':'')+r2((sc[i]-mu)/sd):'—'}`+(SP.boot?`  ± ${f3(SP.boot[i])}`:'')}).join('\n')+(reached.length===nS?'\nstd = standardized over all 15 words (zero mean, unit variance); in our toy graph the neutral verbs lean positive because they hang off like/appreciate':'')+(SP.boot?'\n± = std. dev. over 50 bootstrap runs, each with 2 of the 3 seeds per side':'')}
$('#spStep').addEventListener('click',()=>{const s0p=seedVec(SPOS),s0n=seedVec(SNEG);SP.p=step(SP.p,s0p);SP.n=step(SP.n,s0n);SP.it++;drawSP()});
$('#spRun').addEventListener('click',()=>{SP.p=converge(SPOS);SP.n=converge(SNEG);SP.it='∞ (converged)';drawSP()});
$('#spReset').addEventListener('click',resetSP);
$('#spBoot').addEventListener('click',()=>{const R=rng(42),runs=[];for(let b=0;b<50;b++){const pick=L=>{const k=Math.floor(R()*3);return L.filter((_,j)=>j!==k)};const p=converge(pick(SPOS)),n=converge(pick(SNEG));runs.push(p.map((x,i)=>x/(x+n[i])))}
  SP.p=converge(SPOS);SP.n=converge(SNEG);SP.it='∞ (converged)';SP.boot=SN.map((_,i)=>{const v=runs.map(r=>r[i]),m=v.reduce((a,b)=>a+b,0)/v.length;return Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length)});drawSP()});
resetSP();

/* ---------- conjunction / morphology ---------- */
const CJ=[['good','fair','and'],['fair','legitimate','and'],['good','adequate','and'],['good','thoughtful','and'],['corrupt','brutal','and'],['brutal','cruel','and'],['fair','brutal','but'],['legitimate','corrupt','but'],['adequate','inadequate','morph'],['thoughtful','thoughtless','morph']];
const CJW=['good','fair','legitimate','adequate','thoughtful','corrupt','brutal','cruel','inadequate','thoughtless'];
function drawCJ(){const m=+segVal('#cjM','m');const ok=t=>t==='and'||(t==='but'&&m>=1)||(t==='morph'&&m>=2);
  const pol={good:[1,'seed']};let ch=true;while(ch){ch=false;CJ.forEach(([a,b,t])=>{if(!ok(t))return;[[a,b],[b,a]].forEach(([x,y])=>{if(pol[x]&&!pol[y]){pol[y]=[t==='and'?pol[x][0]:-pol[x][0],`${x} ${t==='morph'?(y.startsWith('in')||y.endsWith('less')||x.startsWith('in')||x.endsWith('less')?'↔ morph. negation':'↔'):t} ${y}`];ch=true}})})}
  $('#cjTab').innerHTML='<tr><th>adjective</th><th>polarity</th><th>evidence</th></tr>'+CJW.map(w=>{const p=pol[w];return `<tr><td>${w}</td><td style="font-weight:700;color:${p?p[0]>0?'var(--green)':'var(--rose)':'var(--soft)'}">${p?p[0]>0?'+':'−':'?'}</td><td class="mono" style="font-size:13px">${p?p[1]:'—'}</td></tr>`}).join('');
  $('#cjCalc').textContent=`edges used: ${CJ.filter(c=>ok(c[2])).map(c=>`${c[0]} ${c[2]==='morph'?'/':c[2]} ${c[1]}`).join(' · ')}\nlabelled: ${Object.keys(pol).length}/${CJW.length}  (and → same polarity; but, un-/in-/-less → opposite)`}
segOn('#cjM',drawCJ);drawCJ();

/* ---------- Potts diagrams ---------- */
const nrm=a=>{const s=a.reduce((x,y)=>x+y,0);return a.map(x=>x/s)};
const PO={disappointing:[.10,.12,.14,.14,.13,.11,.08,.06,.06,.05],good:nrm([6,7,8,9,10,11,11.5,11.5,11,10]),great:nrm([5,5.5,6,6.5,7,8,9,11,13,15]),excellent:nrm([3,3.3,3.6,4,4.5,5.5,7,9,12,16]),bad:nrm([18,14,12,10,9,8,7,6,5,4.5]),terrible:nrm([26,18,13,10,8,6,5,4,3.5,3.5]),absolutely:nrm([16,13,11,9,8,8,8.5,9.5,11,14]),somewhat:nrm([5,7,9,11,13,13,12,10,8,6])};
const POT={disappointing:'hump, peak below the mean → weakly negative',good:'hump, peak above the mean → weakly positive',great:'J-shape → strongly positive',excellent:'J-shape → strongly positive',bad:'reverse J → strongly negative',terrible:'reverse J → strongly negative',absolutely:'U-shape → emphatic (both extremes)',somewhat:'hump in the middle → attenuator'};
function drawPO(){const w=segVal('#poW','w'),v=PO[w],W=440,H=200,mx=Math.max(...v)*1.15,X=i=>50+i*38,Y=y=>H-30-y/mx*(H-50);
  let s=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:480px;display:block;margin:0 auto" role="img"><line x1="40" y1="${H-30}" x2="${W-10}" y2="${H-30}" stroke="var(--rule)"/>`;
  v.forEach((_,i)=>s+=`<text x="${X(i)}" y="${H-12}" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${i+1}</text>`);
  s+=`<text x="${W/2}" y="${H}" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans">rating</text>`;
  s+=`<polyline points="${v.map((y,i)=>X(i)+','+Y(y)).join(' ')}" fill="none" stroke="${w==='disappointing'?'var(--rose)':'var(--math)'}" stroke-width="2.5"/>`+v.map((y,i)=>`<circle cx="${X(i)}" cy="${Y(y)}" r="3.5" fill="var(--ink)"/><text x="${X(i)}" y="${Y(y)-8}" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${r2(y).replace(/^0/,'')}</text>`).join('');
  $('#poSvg').innerHTML=s+'</svg>';const mean=v.reduce((a,y,i)=>a+y*(i+1),0)/v.reduce((a,b)=>a+b,0);
  $('#poCalc').textContent=`${w}: ${POT[w]}\nexpected rating under the word’s distribution = ${r2(mean)} (scale mean = 5.5)`+(w==='disappointing'?`\nfrom the book: P(disappointing|1) = 8,557 / 25,395,214 = ${(8557/25395214).toExponential(3)} ≈ .0003\nPotts score for rating 1 = .0003 / Σ_c P(w|c) = .10  →  Σ_c P(w|c) ≈ .003\n(the book’s vector sums to ${r2(v.reduce((a,b)=>a+b,0))} because of rounding)`:'\n(shape approximated by us, not the book’s values)')}
segOn('#poW',drawPO);drawPO();

/* ---------- log odds with informative Dirichlet prior ---------- */
const LO=[['horrible',600,100,200],['great',900,9000,2000],['the',50000,98000,25000],['zesty (rare)',3,0,2],['manager',400,150,150]];
const NI=1e6,NJ=2e6,BG0=500000;
function drawLO(){const [w,fi,fj,bg]=LO[+segVal('#loW','i')],m=+$('#loA').value;$('#loAo').textContent=r2(m);const aw=m*bg,a0=m*BG0;
  const lg=Math.log,llr=fi&&fj?lg(fi/NI)-lg(fj/NJ):fi?Infinity:-Infinity,lor=fi&&fj?lg(fi/(NI-fi))-lg(fj/(NJ-fj)):fi?Infinity:-Infinity;
  const d=(fi+aw>0&&fj+aw>0)?lg((fi+aw)/(NI+a0-(fi+aw)))-lg((fj+aw)/(NJ+a0-(fj+aw))):NaN,v=1/(fi+aw)+1/(fj+aw),z=d/Math.sqrt(v);
  const F=x=>x===Infinity?'+∞':x===-Infinity?'−∞':isNaN(x)?'undefined':f3(x);
  $('#loTab').innerHTML=`<tr><th></th><th>i (1-star)</th><th>j (5-star)</th><th>background (prior)</th></tr><tr><td>count f_w</td><td class="mono">${fi}</td><td class="mono">${fj}</td><td class="mono">α_w = ${r2(aw)}</td></tr><tr><td>corpus size n</td><td class="mono">${NI.toLocaleString('en')}</td><td class="mono">${NJ.toLocaleString('en')}</td><td class="mono">α_0 = ${Math.round(a0).toLocaleString('en')}</td></tr>`;
  $('#loCalc').textContent=`llr (23.7) = ${F(llr)}\nlor (23.8) = ${F(lor)}\nδ with prior (23.9) = ${F(d)}\nσ² (23.10) = ${isFinite(v)?v.toExponential(2):'∞'}   z (23.11) = ${F(z)}`+(isFinite(z)?`  → ${Math.abs(z)>1.96?(z>0?'significantly more 1-star':'significantly more 5-star'):'not significant (|z| ≤ 1.96)'}`:'')+(w==='the'?'\nonly a 2% relative difference: δ stays near 0, but huge counts make σ tiny, so z is large (a reliable yet small effect; look at δ too)':'')+(w.startsWith('zesty')?'\nwithout a prior (α multiplier 0) the rare word gets an infinite score; the prior shrinks it to a modest one':'')}
segOn('#loW',drawLO);$('#loA').addEventListener('input',drawLO);drawLO();

/* ---------- rule-based sentiment ---------- */
const POSW='admire amazing assure celebration charm eager enthusiastic excellent fancy fantastic frolic graceful happy joy luck majesty mercy nice patience perfect proud rejoice relief respect satisfactorily sensational super terrific thank vivid wise wonderful zest appreciat* comfort* great interest joy* perfect* please* safe* value wow*'.split(' ');
const NEGW='abominable anger anxious bad catastrophe cheap complaint condescending deceit defective disappointment embarrass fake fear filthy fool guilt hate idiot inflict lazy miserable mourn nervous objection pest plot reject scream silly terrible unfriendly vile wicked anger* bore* cry despair* fail* griev* hate* panic* suffers terrify violent*'.split(' ');
const inL=(t,L)=>L.some(x=>x.endsWith('*')?t.startsWith(x.slice(0,-1)):t===x);
const RBX=[['IMDb 10','A great movie. This film is just a wonderful experience. It’s surreal, zany, witty and slapstick all at the same time. And terrific performances too.'],['IMDb 1','This was probably the worst movie I have ever seen. The story went nowhere even though they could have done some interesting stuff with it.'],['Yelp 2','...it took a while to get our waters, we got our entree before our starter, and we never received silverware or napkins until we requested them...'],['Amazon 1','I hate this blender... It is nearly impossible to get frozen fruit and ice to turn into a smoothie... You have to add a TON of liquid. I also wish it had a spout ...'],['GoodReads 1','I am going to try and stop being deceived by eye-catching titles. I so wanted to like this book and was so disappointed by it.']];
$('#rbBtns').innerHTML=RBX.map((x,i)=>`<button class="btn" data-i="${i}" dir="ltr">${x[0]}</button>`).join('');
function drawRB(){const txt=$('#rbIn').value,lam=+$('#rbL').value;$('#rbLo').textContent=r1(lam);let fp=0,fn=0;
  const html=txt.split(/(\s+)/).map(tok=>{const t=tok.toLowerCase().replace(/[^a-z’'*-]/g,'');if(!t)return esc(tok);const p=inL(t,POSW),n=inL(t,NEGW);if(p&&!n){fp++;return `<mark style="background:var(--green-soft);color:var(--green);font-weight:600;border-radius:4px">${esc(tok)}</mark>`}if(n&&!p){fn++;return `<mark style="background:var(--rose-soft);color:var(--rose);font-weight:600;border-radius:4px">${esc(tok)}</mark>`}if(p&&n){fp++;fn++;return `<mark style="background:var(--amber-soft);color:var(--amber);border-radius:4px">${esc(tok)}</mark>`}return esc(tok)}).join('');
  $('#rbOut').innerHTML=html;const rp=fn?fp/fn:(fp?Infinity:NaN),rn=fp?fn/fp:(fn?Infinity:NaN);const lab=rp>lam?'+':rn>lam?'−':'0';
  $('#rbCalc').textContent=`f+ = ${fp}   f− = ${fn}   f+/f− = ${isNaN(rp)?'0/0':rp===Infinity?'∞':r2(rp)}   f−/f+ = ${isNaN(rn)?'0/0':rn===Infinity?'∞':r2(rn)}   λ = ${r1(lam)}\nsentiment = ${lab}`+(fp+fn===0?'\nno lexicon words at all: the rule says neutral, even if the text is clearly negative':'')}
function r1(v){return (+v).toFixed(1)}
$$('#rbBtns button').forEach(b=>b.addEventListener('click',()=>{$('#rbIn').value=RBX[+b.dataset.i][1];drawRB()}));
$('#rbIn').addEventListener('input',drawRB);$('#rbL').addEventListener('input',drawRB);$('#rbIn').value=RBX[0][1];drawRB();

/* ---------- PMI filter ---------- */
const PMX=[['new york',2e-5,[['new',1e-3],['york',5e-5]]],['of the',4e-3,[['of',3e-2],['the',6e-2]]],['so excited',1e-4,[['so',5e-3],['excited',2e-4]]],['i am so',2e-4,[['i',2e-2],['am',4e-3],['so',5e-3]]]];
function drawPM(){const [ph,p,ws]=PMX[+segVal('#pmP','i')],prod=ws.reduce((a,w)=>a*w[1],1),pmi=Math.log(p/prod),th=2*ws.length;
  $('#pmCalc').textContent=`p(${ph}) = ${p.toExponential(0)}   Π p(w) = ${ws.map(w=>`p(${w[0]})=${w[1].toExponential(0)}`).join(' × ')} = ${prod.toExponential(1)}\npmi = ln(${p.toExponential(0)} / ${prod.toExponential(1)}) = ln(${r1(p/prod)}) = ${r2(pmi)}\nthreshold = 2 × length = 2 × ${ws.length} = ${th}  →  ${pmi>th?'KEEP as a feature':'DROP (the words co-occur about as often as chance predicts)'}`}
segOn('#pmP',drawPM);drawPM();

/* ---------- Dark Knight ---------- */
const DK=[['Power','weakly','powerfully',[['Rachel',.18],['Dent',.38],['Gordan',.43],['Batman',.47],['Joker',.53]]],['Sentiment','negative','positive',[['Joker',.08],['Dent',.36],['Gordan',.43],['Rachel',.49],['Batman',.78]]],['Agency','dull','scary',[['Dent',.17],['Gordan',.36],['Rachel',.43],['Batman',.5],['Joker',.68]]]];
let dkSel='Rachel';
function drawDK(){const W=520;let s=`<svg viewBox="0 0 ${W} 270" style="width:100%;max-width:560px;display:block;margin:0 auto" role="img">`;
  DK.forEach(([n,lo,hi,pts],k)=>{const y=40+k*85,X=v=>70+v*(W-140);s+=`<line x1="${X(0)}" y1="${y}" x2="${X(1)}" y2="${y}" stroke="var(--ink)"/><text x="${X(0)-6}" y="${y+4}" font-size="11" text-anchor="end" fill="var(--soft)" font-family="Noto Sans">${lo}</text><text x="${X(1)+6}" y="${y+4}" font-size="11" fill="var(--soft)" font-family="Noto Sans">${hi}</text><text x="${W/2}" y="${y+34}" font-size="11" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans">${n} Score</text>`;
    pts.forEach(([c,v],j)=>{const on=c===dkSel,ly=y-12-(j%2)*13;s+=`<g data-c="${c}" style="cursor:pointer"><circle cx="${X(v)}" cy="${y}" r="${on?6:4}" fill="${on?'var(--amber)':'var(--math)'}"/><text x="${X(v)}" y="${ly}" font-size="12" text-anchor="middle" fill="${on?'var(--amber)':'var(--ink)'}" font-weight="${on?700:400}" font-family="Noto Sans">${c}</text></g>`})});
  $('#dkSvg').innerHTML=s+'</svg>';$$('#dkSvg g').forEach(g=>g.addEventListener('click',()=>{dkSel=g.dataset.c;drawDK()}));
  $('#dkCalc').textContent=`${dkSel}: `+DK.map(([n,,,pts])=>{const o=pts.map(p=>p[0]);return `${n} rank ${o.indexOf(dkSel)+1}/5`}).join(' · ')+'\n(only the order is from Fig. 23.13; the exact positions are approximate)'+(dkSel==='Rachel'?'\nnote: the caption says Rachel has low agency, but in the figure Dent and Gordan are below her on agency':'')}
drawDK();

/* ---------- connotation frames ---------- */
const CF={survive:{t:'tri',ex:'the teenager ... survived the Boston Marathon bombing',e:{w1:'+',w2:'−',r12:'−',d1:'+',d2:'−'},l1:'Role1 is a sympathetic victim',l2:'There is some type of hardship'},
  violate:{t:'tri',ex:'Country A violated the sovereignty of Country B',e:{w1:'−',w2:'+',r12:'−',d1:'−',d2:'+'},l1:'Role1 is the antagonist',l2:'Role2 is a sympathetic victim'},
  implore:{t:'pw',ex:'He implored the tribunal to show mercy.',p:'power(AG < TH)',d:'the agent is in a position of less power than the theme'},
  demand:{t:'pw',ex:'He demanded the tribunal show mercy.',p:'power(AG > TH)',d:'the agent has authority over the theme'},
  wait:{t:'ag',ex:'The princess waited for her prince.',p:'agency(AG) = −',d:'low agency: the agent is not driving the action'}};
function drawCF(){const v=segVal('#cfV','v'),c=CF[v];let s=`<svg viewBox="0 0 460 250" style="width:100%;max-width:520px;display:block;margin:0 auto" role="img">`;
  const node=(x,y,t)=>`<rect x="${x-44}" y="${y-15}" width="88" height="30" rx="15" fill="var(--tint)" stroke="var(--rule)"/><text x="${x}" y="${y+5}" font-size="13" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${t}</text>`;
  const edge=(x1,y1,x2,y2,sg,lab)=>{const col=sg==='+'?'var(--green)':'var(--rose)';return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2" ${lab?'stroke-dasharray="5 3"':''}/><circle cx="${(x1+x2)/2}" cy="${(y1+y2)/2}" r="11" fill="var(--paper)" stroke="${col}"/><text x="${(x1+x2)/2}" y="${(y1+y2)/2+5}" font-size="15" text-anchor="middle" fill="${col}" font-weight="700" font-family="Noto Sans">${sg}</text>`};
  if(c.t==='tri'){const e=c.e;s+=edge(230,40,110,125,e.w1)+edge(230,40,350,125,e.w2)+edge(150,125,310,125,e.r12,1)+edge(230,210,110,125,e.d1)+edge(230,210,350,125,e.d2);
    s+=node(230,40,'Writer')+node(110,125,'Role1')+node(350,125,'Role2')+node(230,210,'Reader');
    const lab=(x,t)=>{const w=t.split(' '),h=Math.ceil(w.length/2);return `<text x="${x}" y="160" font-size="10.5" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans"><tspan x="${x}">${w.slice(0,h).join(' ')}</tspan><tspan x="${x}" dy="13">${w.slice(h).join(' ')}</tspan></text>`};
    s+=lab(70,c.l1)+lab(390,c.l2)}
  else{s+=node(100,120,'AGENT')+`<ellipse cx="230" cy="120" rx="52" ry="24" fill="${c.t==='pw'?'var(--math-soft)':'var(--green-soft)'}" stroke="var(--rule)"/><text x="230" y="116" font-size="11" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">VERB</text><text x="230" y="131" font-size="13" text-anchor="middle" fill="var(--ink)" font-weight="600" font-family="Noto Sans">${v}</text>`+node(360,120,'THEME');
    s+=c.t==='pw'?`<path d="M110,150 Q230,${v==='implore'?205:205} 350,150" fill="none" stroke="var(--math)" stroke-width="2"/><text x="230" y="225" font-size="13" text-anchor="middle" fill="var(--math)" font-family="Noto Sans Mono">${c.p}</text>`:`<path d="M100,140 Q105,175 150,180" fill="none" stroke="var(--rose)" stroke-width="2"/><text x="160" y="185" font-size="13" fill="var(--rose)" font-family="Noto Sans Mono">${c.p}</text>`;
    s+=`<text x="230" y="40" font-size="14" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${esc(c.ex)}</text>`}
  $('#cfSvg').innerHTML=s+'</svg>';
  $('#cfCalc').textContent=c.t==='tri'?`“${c.ex}”\nS(writer→role1) = ${c.e.w1}   S(writer→role2) = ${c.e.w2}   S(role1→role2) = ${c.e.r12}\nS(reader→role1) = ${c.e.d1}   S(reader→role2) = ${c.e.d2}\n${c.l1} · ${c.l2}`:`${c.p}: ${c.d}`+(v==='demand'?'\n(contrast case named in the text; frame from Sap et al. 2017)':'')}
segOn('#cfV',drawCF);drawCF();

/* ---------- glossary ---------- */
const GL=[['وجداني','affective','الانفعال والمشاعر والمزاج والاتجاهات والشخصية.'],['الذاتية','subjectivity','تقييمات المتكلم وآراؤه وانفعالاته وتخميناته.'],['الإيحاء','connotation','جوانب المعنى المتعلقة بانفعالات الكاتب أو القارئ وتقييماته.'],['المعجم الوجداني','affective / sentiment lexicon','قائمة كلمات بشحنتها الوجدانية.'],['الانفعالات الأساسية','basic emotions','وحدات ذرية محدودة (إكمان ٦، بلوتشيك ٨).'],['التكافؤ / الإثارة / الهيمنة','valence / arousal / dominance','الإمتاع / الطاقة / السيطرة.'],['نظرية التقييم','appraisal theory','الانفعال عملية تقدير الحدث بالنسبة إلى الأهداف.'],['EmoLex','NRC Word-Emotion Association Lexicon','~١٤ ألف كلمة × ٨ انفعالات (٠/١).'],['LIWC','Linguistic Inquiry and Word Count','٧٣ معجماً لعلم النفس الاجتماعي.'],['التعهيد الجماعي','crowdsourcing','توزيع الوسم على واسمين كثر.'],['القياس الأفضل-الأسوأ','best-worst scaling','من N عناصر: الأعلى والأدنى؛ الدرجة %أفضل − %أسوأ.'],['موثوقية التنصيف','split-half reliability','ارتباط درجات نصفي التقديرات.'],['الكلمات البذرية','seed words','كلمات قطبي البعد.'],['المحور الدلالي','semantic axis','V+ − V−؛ الدرجة جيب تمام.'],['نشر الوسوم','label propagation (SentProp)','مشي عشوائي من البذور على رسم الجيران.'],['SentiWordNet','SentiWordNet','درجات إيجابية وسلبية وحياد لمعاني WordNet.'],['درجة بوتس','Potts score','P(w|c) مقسوماً على مجموعه على الفئات.'],['مخطط بوتس','Potts diagram','توزيع الكلمة على النجوم: J، J معكوسة، سنام، U.'],['نسبة الأرجحية اللوغاريتمية','log odds ratio','لوغاريتم نسبة أرجحيتي الكلمة في مدوّنتين.'],['أولية ديريكليه المعلِّمة','informative Dirichlet prior','أعداد مدوّنة خلفية تضاف إلى العدّين.'],['درجة z','z-score','الفرق مقسوماً على انحرافه المعياري.'],['PMI','pointwise mutual information','لوغاريتم نسبة التواجد الفعلي إلى المتوقع.'],['الانفعال نحو كيان','entity-centric affect','درجات S/A/P لكيان بعينه.'],['مشاعر / فاعلية / قوة','sentiment / agency / power','VAD معاد تسميته للأشخاص.'],['إطار الإيحاء','connotation frame','إيحاءات المحمول نحو معمولاته.'],['فارق القوة','power differential','أي المعمولين أقوى (implore / demand).']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
