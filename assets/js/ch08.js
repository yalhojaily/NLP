/* Chapter 8 · Post-training — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sig=z=>1/(1+Math.exp(-z));
const r3=v=>{const x=+(+v).toFixed(3);return (Object.is(x,-0)?0:x).toString()};
const r2=v=>{const x=+(+v).toFixed(2);return (Object.is(x,-0)?0:x).toFixed(2)};
const num=s=>{const v=parseFloat(String(s).replace('−','-'));return isNaN(v)?NaN:v};
const fmtN=n=>Math.round(n).toLocaleString('en-US');
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function bars(el,items){const mx=Math.max(...items.map(i=>i.v),1e-9);el.innerHTML=items.map(i=>`<div class="br${i.pick?' pick':''}"${i.dim?' style="opacity:.4"':''}><span class="w0">${esc(i.l)}</span><div class="tr"><div class="fl" style="width:${(i.scale==='abs'?i.v:i.v/mx)*100}%"></div></div><span class="v">${i.t??i.v.toFixed(2)}</span></div>`).join('')}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s8-1','8.1','الضبط على التعليمات'],['s8-2','8.2','LoRA'],['s8-3','8.3','التعلم من التفضيلات'],['s8-4','8.4','المواءمة وDPO'],['ex','','الخلاصة']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

function plot(el,o){
  const W=o.W||560,H=o.H||220,L=46,R=14,T=14,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img"><defs><clipPath id="c${el.id}"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs>`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${v}</text>`});
  (o.xlab||[]).forEach(([v,t])=>{s+=`<text x="${x(v)}" y="${H-B+15}" text-anchor="middle">${t}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end">${o.xl}</text>`;if(o.yl)s+=`<text x="${L}" y="${T-3}">${o.yl}</text>`;
  (o.curves||[]).forEach(c=>{let d='';const n=300;for(let i=0;i<=n;i++){const v=o.xmin+(o.xmax-o.xmin)*i/n,u=c.f(v);if(!isFinite(u))continue;d+=(d?'L':'M')+x(v).toFixed(1)+' '+y(u).toFixed(1)}
    s+=`<path d="${d}" fill="none" stroke="${c.c}" stroke-width="${c.w||2.5}" ${c.dash?'stroke-dasharray="5 4"':''} clip-path="url(#c${el.id})"/>`});
  (o.vbars||[]).forEach(b=>{s+=`<rect x="${x(b.x)-b.w/2}" y="${y(Math.max(0,b.y))}" width="${b.w}" height="${Math.abs(y(b.y)-y(0))}" fill="${b.c}" rx="2"/>${b.t?`<text x="${x(b.x)}" y="${b.y>=0?y(b.y)-5:y(b.y)+13}" text-anchor="middle" style="fill:var(--ink)">${b.t}</text>`:''}`});
  (o.pts||[]).forEach(p=>{s+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||5}" fill="${p.c}"/>${p.t?`<text x="${x(p.x)+8}" y="${y(p.y)-8}" style="fill:${p.c}">${p.t}</text>`:''}`});
  el.innerHTML=s+'</svg>';
}

/* ---------- 8.1 SFT loss mask ---------- */
const SFI='Instruction: You are given a sentence in Spanish. Your job is to translate the Spanish sentence into English.\\\\ Input: No tenía lavandería.\\\\ Output:'.split(' ');
const SFR=['it','didn’t','have','a','laundry','facility'],SFP=[0.31,0.42,0.88,0.93,0.71,0.64];
function drawSF(){const m=segVal('#sfM','m');const R0=rng(5),PI=SFI.map(()=>0.05+R0()*0.5);
  const tk=(t,on,resp)=>`<span style="padding:1px 4px;margin:1px;border-radius:4px;display:inline-block;${on?(resp?'background:var(--green-soft);color:var(--green);font-weight:600':'background:var(--amber-soft);color:var(--amber)'):'color:var(--soft);text-decoration:line-through;text-decoration-color:var(--rule)'}">${esc(t)}</span>`;
  $('#sfTxt').innerHTML=SFI.map(t=>tk(t,m==='all',0)).join(' ')+' <b style="color:var(--soft)">│</b> '+SFR.map(t=>tk(t,1,1)).join(' ');
  const resp=SFP.map(p=>-Math.log(p)),ins=PI.map(p=>-Math.log(p)),use=m==='all'?[...ins,...resp]:resp;
  $('#sfCalc').textContent=`response tokens (trained):  `+SFR.map((t,i)=>`${t} −log ${SFP[i]} = ${r2(resp[i])}`).join('   ')+
   `\n${m==='all'?`instruction tokens ALSO trained (${SFI.length} tokens): the model would learn to write instructions, not to answer them`:`instruction tokens: context only, contribute 0 to the loss (${SFI.length} tokens)`}\nloss = mean over ${use.length} tokens = ${r3(use.reduce((a,b)=>a+b,0)/use.length)}\n(probabilities are made up for illustration)`}
segOn('#sfM',drawSF);drawSF();

/* ---------- 8.1.1 templates ---------- */
const TP={sent:{kv:[['text','Did not like the service that I was provided...'],['label','0']],tpl:['{{text}} How does the reviewer feel about the movie?','{{text}} Did the reviewer enjoy the movie?'],out:'label'},
 nli:{kv:[['premise','Jimmy Smith... played college football at University of Colorado.'],['hypothesis','The University of Colorado has a college football team.'],['label','0']],tpl:['Suppose {{premise}} Can we infer that {{hypothesis}}? Yes, no, or maybe?'],out:'label'},
 qa:{kv:[['context','Beyoncé Giselle Knowles-Carter is an American singer...'],['question','When did Beyoncé start becoming popular?'],['answers','{ text: [’in the late 1990s’], answer start: 269 }']],tpl:['{{context}} Using the passage, {{question}}'],out:'answers'}};
let tpI=0;
function drawTP(){const t=segVal('#tpT','t'),D=TP[t];if(tpI>=D.tpl.length)tpI=0;
  $('#tpV').innerHTML=D.tpl.map((_,i)=>`<button data-i="${i}" class="${i===tpI?'on':''}">template ${i+1}</button>`).join('');
  $$('#tpV button').forEach(b=>b.addEventListener('click',()=>{tpI=+b.dataset.i;drawTP()}));
  $('#tpKV').innerHTML='<tr><th>Key</th><th>Value</th></tr>'+D.kv.map(([k,v])=>`<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join('');
  const kv=Object.fromEntries(D.kv);let s=esc(D.tpl[tpI]).replace(/\{\{(\w+)\}\}/g,(_,k)=>`<mark style="background:var(--green-soft);color:var(--green)">${esc(kv[k])}</mark>`);
  const tgt=t==='qa'?'in the late 1990s':kv.label;
  $('#tpOut').innerHTML=`<div style="color:var(--soft);font-size:12px">template: ${esc(D.tpl[tpI])}</div><div style="margin-top:6px">${s}</div><div style="margin-top:8px;color:var(--amber)">target output → ${esc(tgt)}</div>`}
segOn('#tpT',()=>{tpI=0;drawTP()});drawTP();

/* ---------- leave-one-out clusters ---------- */
const LO=[['Sentiment',8],['Textual entailment',25],['Extractive Q/A',30],['Translation',40],['Summarization',12],['Paraphrase',6]];let loI=0;
function drawLO(){$('#loChips').innerHTML=LO.map(([n,k],i)=>`<button class="chip${i===loI?' hl':''}" data-i="${i}" style="border:0;cursor:pointer">${n} <small>×${k}</small></button>`).join('');
  $$('#loChips button').forEach(b=>b.addEventListener('click',()=>{loI=+b.dataset.i;drawLO()}));
  const tr=LO.filter((_,i)=>i!==loI),nt=tr.reduce((a,c)=>a+c[1],0);
  $('#loCalc').textContent=`TEST (held out): all ${LO[loI][1]} ${LO[loI][0]} datasets\nTRAIN: ${tr.map(c=>c[0]).join(', ')}  (${nt} datasets)\nthe model never saw ANY ${LO[loI][0].toLowerCase()} data, so a good score means it learned to follow new instructions\n(cluster sizes are illustrative, except the 25 entailment sets mentioned in the book)`}
drawLO();

/* ---------- 8.2 LoRA ---------- */
function drawLR(){const k=2**(+$('#lrK').value),d=2**(+$('#lrD').value),r=2**(+$('#lrR').value);$('#lrKo').textContent=fmtN(k);$('#lrDo').textContent=fmtN(d);$('#lrRo').textContent=r;
  const full=k*d,lo=r*(k+d);
  $('#lrCalc').textContent=`full fine-tuning of W [${fmtN(k)} × ${fmtN(d)}]:  ΔW has ${fmtN(full)} parameters\nLoRA:  A [${fmtN(k)} × ${r}] + B [${r} × ${fmtN(d)}] = ${fmtN(k*r)} + ${fmtN(r*d)} = ${fmtN(lo)} parameters\n→ ${(lo/full*100).toFixed(lo/full<0.01?3:2)}% of the full update   (${(full/lo).toFixed(0)}× fewer)`+(r>=Math.min(k,d)?'\n(r is not small here: LoRA only saves when r ≪ min(d, k))':'')+(k===4096&&d===4096?'\n(4096 is the model dimension d of Llama 3.1 8B, Fig. 7.24)':'')}
['#lrK','#lrD','#lrR'].forEach(s=>$(s).addEventListener('input',drawLR));drawLR();
let lrSeed=1;
const M=(a)=>a.map(r=>'[ '+r.map(v=>(v<0?'':' ')+v.toFixed(2)).join(' ')+' ]');
function drawLD(){const R=rng(lrSeed*17),rv=()=>Math.round((R()*2-1)*100)/100;
  const W=[0,1,2,3].map(()=>[0,1,2,3].map(rv)),A=[0,1,2,3].map(()=>[rv()]),B=[[0,1,2,3].map(rv)],AB=A.map(a=>B[0].map(b=>a[0]*b)),WP=W.map((r,i)=>r.map((v,j)=>v+AB[i][j]));
  const x=[1,0.5,-1,2],xW=[0,1,2,3].map(j=>x.reduce((s,v,i)=>s+v*W[i][j],0)),xA=x.reduce((s,v,i)=>s+v*A[i][0],0),xAB=B[0].map(b=>xA*b),h=xW.map((v,j)=>v+xAB[j]);
  const ml=M(W),al=M(A),abl=M(AB),wl=M(WP);
  $('#lrDemo').textContent=`W (frozen)                      A        AB = A·B (rank 1)               W + AB\n`+ml.map((l,i)=>`${l}   ${al[i]}   ${abl[i]}   ${wl[i]}`).join('\n')+`\nB = ${M(B)[0]}\n\nx = [1, 0.5, −1, 2]\nh = xW + xAB = [${xW.map(r2).join(', ')}] + ${r2(xA)}·B = [${h.map(r2).join(', ')}]\nsame as x(W + AB), so after training AB can be merged into W: no extra cost at inference`}
$('#lrNew').addEventListener('click',()=>{lrSeed++;drawLD()});drawLD();

/* ---------- 8.3.1 pairs from rankings ---------- */
function drawPC(){const N=+$('#pcN').value,m=segVal('#pcM','m');$('#pcNo').textContent=N;const L='ABCDEFGHI'.slice(0,N).split('');const P=[];
  for(let i=0;i<N;i++)for(let j=i+1;j<N;j++)if(m==='rank'||i===0)P.push(`${L[i]} ≻ ${L[j]}`);
  $('#pcPairs').innerHTML=P.map(p=>`<span class="chip">${p}</span>`).join('');
  $('#pcCalc').textContent=m==='rank'?`ranking ${L.join(' ≻ ')}\n(N choose 2) = N(N−1)/2 = ${N}·${N-1}/2 = ${P.length} pairs`+(N===4?'   ← InstructGPT: rank 4 outputs → 6 pairs':''):`only the best is chosen: ${L[0]} beats each of the other ${N-1}\nN − 1 = ${P.length} pairs (we learn nothing about how ${L.slice(1).join(', ')} compare to each other)`}
$('#pcN').addEventListener('input',drawPC);segOn('#pcM',drawPC);drawPC();

/* ---------- 8.3.2 Bradley-Terry ---------- */
function drawBT(msg){const zi=+$('#btI').value,zj=+$('#btJ').value,d=zi-zj,p=sig(d);$('#btIo').textContent=zi.toFixed(1);$('#btJo').textContent=zj.toFixed(1);
  plot($('#btPlot'),{W:520,H:200,xmin:-8,xmax:8,ymin:0,ymax:1,xt:[-8,-4,0,4,8],yt:[0,.5,1],xl:'δ = zᵢ − zⱼ',curves:[{f:sig,c:'var(--green)'}],pts:[{x:d,y:p,c:'var(--amber)',t:`P = ${r2(p)}`}]});
  $('#btCalc').textContent=`δ = zᵢ − zⱼ = ${zi.toFixed(1)} − ${zj.toFixed(1)} = ${d.toFixed(1)}\nP(oᵢ ≻ oⱼ) = σ(δ) = 1/(1 + e^(${(-d).toFixed(1)})) = ${r3(p)}      P(oⱼ ≻ oᵢ) = ${r3(1-p)}\nif the data says oᵢ won:  loss = −log σ(δ) = ${r3(-Math.log(p))}`+(msg?'\n'+msg:'')}
['#btI','#btJ'].forEach(s=>$(s).addEventListener('input',()=>drawBT()));
$('#btShift').addEventListener('click',()=>{const i=+$('#btI').value,j=+$('#btJ').value,s=Math.max(i,j)<=2?2:-2;$('#btI').value=i+s;$('#btJ').value=j+s;drawBT(`both scores ${s>0?'+':'−'}2: P did not change, only the difference matters`)});
drawBT();

/* ---------- 8.3.3 reward model on 4 responses ---------- */
const RN=['A','B','C','D'];let RP=[[0,1],[1,2],[2,3],[0,2],[3,1]],RZ=[0,0,0,0],RS=0;
const pz=v=>v<0?`(${r2(v)})`:r2(v);
function rmLoss(){return RP.reduce((s,[w,l])=>s-Math.log(sig(RZ[w]-RZ[l])),0)/RP.length}
function rmStep(n){for(let t=0;t<n;t++){const g=[0,0,0,0];RP.forEach(([w,l])=>{const q=1-sig(RZ[w]-RZ[l]);g[w]-=q;g[l]+=q});RZ=RZ.map((z,i)=>z-0.5*g[i]/RP.length);RS++}drawRM()}
function drawRM(){$('#rmPairs').innerHTML=RP.map(([w,l],i)=>`<button class="chip" data-i="${i}" style="border:0;cursor:pointer">${RN[w]} ≻ ${RN[l]}</button>`).join('');
  $$('#rmPairs button').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.i;RP[i]=[RP[i][1],RP[i][0]];drawRM()}));
  const mx=Math.max(2,...RZ.map(Math.abs));
  $('#rmBars').innerHTML=RZ.map((z,i)=>`<div class="br"><span class="w0">r(${RN[i]})</span><div class="tr" style="position:relative;background:var(--tint)"><div style="position:absolute;top:0;bottom:0;${z>=0?'left:50%':'right:50%'};width:${Math.abs(z)/mx*50}%;background:${z>=0?'var(--green)':'var(--rose)'};border-radius:4px"></div><div style="position:absolute;left:50%;top:0;bottom:0;border-left:1px solid var(--soft)"></div></div><span class="v">${r2(z)}</span></div>`).join('');
  $('#rmCalc').textContent=`step ${RS}   loss L_CE = mean −log σ(r_w − r_l) = ${r3(rmLoss())}\n`+RP.map(([w,l])=>`P(${RN[w]} ≻ ${RN[l]}) = σ(${pz(RZ[w])} − ${pz(RZ[l])}) = ${r2(sig(RZ[w]-RZ[l]))}`).join('   ')+
   `\nsum of rewards = ${r2(RZ.reduce((a,b)=>a+b,0))}  (each update adds to the winner what it takes from the loser, so only differences are learned)`+
   (['1,2','2,3','3,1'].every(k=>RP.some(q=>q.join()===k))?`\nB ≻ C, C ≻ D and D ≻ B form a cycle: no scores can satisfy all three, so B, C, D end up tied (noisy preferences). flip a pair to break the cycle`:'')}
$('#rmStep').addEventListener('click',()=>rmStep(10));$('#rmRun').addEventListener('click',()=>rmStep(300));$('#rmReset').addEventListener('click',()=>{RZ=[0,0,0,0];RS=0;drawRM()});drawRM();

/* ---------- 8.4 KL-regularised optimum ---------- */
const KR=[1.0,0.6,0.2,-0.5],KP=[0.15,0.40,0.35,0.10],KN=['o₁','o₂','o₃','o₄'];
const betaOf=v=>+(10**((v-20)/10)).toPrecision(2);
function drawKL(){const b=betaOf(+$('#klB').value);$('#klBo').textContent=b;
  const w=KP.map((p,i)=>p*Math.exp(KR[i]/b)),Z=w.reduce((a,c)=>a+c,0),P=w.map(v=>v/Z);
  const Er=P.reduce((s,p,i)=>s+p*KR[i],0),Eref=KP.reduce((s,p,i)=>s+p*KR[i],0),KL=P.reduce((s,p,i)=>s+(p>0?p*Math.log(p/KP[i]):0),0);
  $('#klTab').innerHTML='<tr><th>output</th><th>reward r</th><th>π_ref</th><th>π* (optimal)</th><th></th></tr>'+KN.map((n,i)=>`<tr><td>${n}</td><td class="num">${KR[i]}</td><td class="num">${KP[i].toFixed(2)}</td><td class="num"><b>${P[i].toFixed(3)}</b></td><td style="width:40%"><div style="height:12px;background:var(--green);border-radius:3px;width:${P[i]*100}%"></div></td></tr>`).join('');
  $('#klCalc').textContent=`β = ${b}\nπ*(o) = π_ref(o)·exp(r(o)/β) / Z      Z = ${Z<1e6?r3(Z):Z.toExponential(2)}\nexpected reward  E[r] = ${r3(Er)}   (π_ref alone: ${r3(Eref)}, best possible: ${KR[0]})\nKL(π* ‖ π_ref) = ${r3(KL)}\n`+(b<0.05?'tiny β: almost no penalty → all mass on the highest-reward output (forgets π_ref)':b>20?'huge β: the penalty dominates → π* stays ≈ π_ref':'in between: pushed toward high reward, but still close to π_ref')+`\n(this four-output problem is our own illustration)`}
$('#klB').addEventListener('input',drawKL);drawKL();

/* ---------- 8.4.2 DPO loss ---------- */
function drawDP(){const rw=num($('#dpRw').value),rl=num($('#dpRl').value),b=num($('#dpB').value);const lw=+$('#dpW').value,ll=+$('#dpL').value,pw=Math.exp(lw),pl=Math.exp(ll);
  $('#dpWo').textContent=pw.toFixed(4);$('#dpLo').textContent=pl.toFixed(4);
  if(!(rw>0&&rw<1&&rl>0&&rl<1&&b>0)){$('#dpCalc').textContent='π_ref بين ٠ و١، وβ موجبة';return}
  const aw=lw-Math.log(rw),al=ll-Math.log(rl),m=b*(aw-al),L=-Math.log(sig(m));
  $('#dpCalc').textContent=`implicit reward of winner  β·log(π_θ/π_ref) = ${b}·log(${pw.toFixed(4)}/${rw}) = ${r3(b*aw)}\nimplicit reward of loser   β·log(π_θ/π_ref) = ${b}·log(${pl.toFixed(4)}/${rl}) = ${r3(b*al)}\nmargin = ${r3(m)}    P(o_w ≻ o_l) = σ(margin) = ${r3(sig(m))}\nL_DPO = −log σ(margin) = ${r3(L)}`+(Math.abs(m)<1e-6?'   = log 2 ≈ 0.693 (π_θ = π_ref: no preference yet, whatever β is)':m>0?'   ← lower: the policy now favours the winner more than π_ref did':'   ← higher: the policy favours the loser')+`\ngradient descent pushes π_θ(o_w) up and π_θ(o_l) down`}
['#dpRw','#dpRl','#dpB','#dpW','#dpL'].forEach(s=>$(s).addEventListener('input',drawDP));
$('#dpRef').addEventListener('click',()=>{const rw=num($('#dpRw').value),rl=num($('#dpRl').value);if(rw>0)$('#dpW').value=Math.log(rw);if(rl>0)$('#dpL').value=Math.log(rl);drawDP()});drawDP();

/* ---------- glossary ---------- */
const GL=[['التدريب اللاحق','post-training','كل ما يأتي بعد التدريب المسبق لجعل النموذج نافعاً وآمناً.'],['النموذج الأساسي','base model','مدرَّب مسبقاً فقط.'],['الضبط الدقيق','fine-tuning','تدريب إضافي لنموذج مدرَّب على بيانات جديدة.'],['الضبط على التعليمات','instruction tuning / SFT','ضبط على أزواج تعليمة ورد، والخسارة على الرد.'],['التعلم الفوقي','meta-learning','تعلّم كيف نتعلم: اتباع تعليمات جديدة عموماً.'],['حقبة','epoch','مرور كامل على بيانات التدريب.'],['قالب','template','نص فيه خانات تُملأ من مجموعة بيانات.'],['استبعاد واحد','leave-one-out','حجب عنقود مهام كامل للاختبار.'],['الضبط الموفّر للمعاملات','PEFT','تجميد معظم المعاملات وتدريب جزء صغير.'],['LoRA','low-rank adaptation','W + AB بمصفوفتين صغيرتين A وB.'],['الرتبة','rank','عدد الاتجاهات المستقلة في المصفوفة.'],['التجميد','freeze','عدم تحديث معاملات أثناء التدريب.'],['التفضيل','preference (oᵢ ≻ oⱼ)','حكم بأن مخرجاً أفضل من آخر.'],['مقياس ليكرت','Likert scale','تقييم رقمي من ٠ إلى ٤ لكل بُعد.'],['نموذج برادلي–تيري','Bradley–Terry model','P(oᵢ ≻ oⱼ) = σ(zᵢ − zⱼ).'],['نموذج المكافأة','reward model r(x, o)','نموذج يعطي كل رد درجة.'],['التوقّع','expectation E','المتوسط على التوزيع أو البيانات.'],['أفضل من N','best-of-N sampling','نسحب N رداً ونختار أعلاها مكافأة.'],['التعلم المعزز','reinforcement learning','تعلّم أفعال تعظّم المكافأة.'],['السياسة','policy π','النموذج الذي يختار الأفعال (الرموز).'],['النموذج المرجعي','reference policy π_ref','نقطة البداية المجمّدة.'],['تباعد KL','KL divergence','مقياس اختلاف توزيعين: Σ P log(P/Q).'],['دالة التجزئة','partition function Z(x)','مجموع على كل المخرجات الممكنة.'],['PPO','proximal policy optimization','طريقة تعلم معزز بنموذج مكافأة صريح.'],['DPO','direct preference optimization','مواءمة مباشرة من أزواج التفضيل.'],['RLVR','RL with verifiable rewards','تعلم معزز على مسائل لها جواب صحيح قابل للتحقق.'],['الهلوسة','hallucination','توليد معلومات خاطئة بثقة.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
