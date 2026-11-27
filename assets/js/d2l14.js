/* D2L · Chapter 14 · Reinforcement Learning — interactive widgets (uses ar-common.js + d2l-common.js) */
const SECS=[['s14-1','14.1','عمليات ماركوف للقرار'],['s14-2','14.2','البرمجة الديناميكية'],['s14-3','14.3','تعلّم الفرق الزمني'],['s14-4','14.4','الاستكشاف'],['s14-5','14.5','التعلّم من العروض'],['s14-6','14.6','التحكم الأمثل'],['s14-7','14.7','تدرّج السياسة'],['s14-8','14.8','خطوط الأساس'],['s14-9','14.9','التقريب بالشبكات'],['ex','','الخلاصة والتمارين']];
const GL=[
['الوكيل / البيئة','agent / environment','صانع القرار، والعالم الذي يعمل فيه ويرد عليه بمكافأة وحالة جديدة.'],
['الحالة / الفعل','state / action','وصف الموقف الآن، والخيار المتاح فيه.'],
['المكافأة','reward','رقم تعطيه البيئة بعد كل خطوة.'],
['السياسة','policy π(a|s)','قاعدة اختيار الفعل في كل حالة (قد تكون احتمالية).'],
['عملية ماركوف للقرار','Markov decision process (MDP)','(S, A, P, r): الحالات والأفعال واحتمالات الانتقال والمكافأة.'],
['نواة الانتقال','transition kernel P(s′|s,a)','احتمال الوصول إلى s′ بعد الفعل a في s.'],
['العائد المخصوم','discounted return','Σ γᵗ rₜ: مجموع المكافآت مع تصغير البعيد منها.'],
['معامل الخصم','discount factor γ','بين 0 و1، والأفق الفعّال 1/(1 − γ).'],
['الانتهاء / القطع','termination / truncation','نهاية حقيقية (قيمة ما بعدها 0) مقابل توقف بالساعة (قيمة ما بعدها ليست 0).'],
['خاصية ماركوف','Markov property','المستقبل يعتمد على الحالة الحالية وحدها لا على التاريخ.'],
['تشكيل المكافأة','reward shaping','إضافة مكافآت مساعدة؛ الآمن منها r + γΦ(s′) − Φ(s).'],
['دالة القيمة','value function V(s)','العائد المتوقع من الحالة s فصاعداً.'],
['قيمة الفعل','action value Q(s,a)','العائد المتوقع إن بدأت بالفعل a ثم اتبعت السياسة.'],
['معادلة بلمان','Bellman equation','قيمة الحالة = مكافأة خطوة + γ × متوسط قيمة ما بعدها.'],
['تكرار القيمة','value iteration','تطبيق عامل بلمان مراراً حتى الثبات.'],
['تكرار السياسة','policy iteration','تقييم السياسة ثم تحسينها بالجشع، بالتناوب.'],
['الانكماش','contraction','كل مسح يقرّب أي جدولين بمعامل γ على الأقل.'],
['خطأ الفرق الزمني','TD error δ','r + γ max Q(s′,·) − Q(s,a).'],
['تعلّم Q','Q-learning','تحديث Q من انتقال واحد مُشاهَد، خارج السياسة.'],
['SARSA','SARSA','مثل تعلّم Q لكن الهدف من الفعل المأخوذ فعلاً (على السياسة).'],
['انحياز التعظيم','maximization bias','أكبر التقديرات المشوّشة يبالغ في المتوسط.'],
['ε-الجشع','ε-greedy','الفعل الأفضل غالباً، وفعل عشوائي باحتمال ε.'],
['قاطع الآلة متعدد الأذرع','multi-armed bandit','مسألة استكشاف بحالة واحدة وعدة خيارات.'],
['الندم','regret','مجموع ما فات مقارنة بالذراع الأفضل.'],
['حد الثقة الأعلى','upper confidence bound (UCB)','المتوسط + مكافأة عدم اليقين κ√(log t / n).'],
['معاينة تومسون','Thompson sampling','اسحب عينة من التوزيع البعدي لكل ذراع واختر الأكبر.'],
['الاستنساخ السلوكي','behavior cloning','تعلّم السياسة من أزواج (حالة، فعل الخبير) كتصنيف.'],
['انزياح التوزيع','distribution shift','أخطاء المتعلّم تأخذه إلى حالات لم يرها الخبير.'],
['DAgger','dataset aggregation','نشغّل المتعلّم ونطلب من الخبير تسمية الحالات التي يزورها.'],
['المنظِّم الخطي التربيعي','linear-quadratic regulator (LQR)','ديناميكا خطية وكلفة تربيعية: حل مغلق بمعادلة ريكاتي.'],
['iLQR','iterative LQR','LQR حول مسار يُحسَّن تكراراً لأنظمة غير خطية.'],
['التحكم التنبؤي','model predictive control (MPC)','أعد التخطيط من الحالة المقيسة في كل خطوة.'],
['تدرّج السياسة','policy gradient','رفع احتمال الأفعال بحسب العائد الذي جلبته.'],
['دالة النقاط','score function','∇ log π(a|s)؛ في softmax: eₐ − π.'],
['REINFORCE','REINFORCE','متوسط R(τ) × مجموع دوال النقاط.'],
['خط الأساس','baseline','مقدار يُطرح من العائد دون انحياز ويقلل التباين.'],
['الميزة','advantage A(s,a)','Q(s,a) − V(s): كم الفعل أفضل من المعتاد.'],
['RLOO','leave-one-out','خط أساس = متوسط بقية العينات.'],
['GRPO','group relative policy optimization','وزن كل استجابة = (مكافأتها − متوسط المجموعة)/انحرافها.'],
['التدرّج المساري','pathwise gradient','الاشتقاق عبر a = μ + σz بدل دالة النقاط.']];
initPage(SECS,GL);
const P3=v=>v.toFixed(3),pc=v=>(100*v).toFixed(1)+'%';

/* ================= the lake ================= */
const HOLES=new Set([5,7,11,12]),GOAL=15,TERM=s=>HOLES.has(s)||s===GOAL,ARW=['←','↓','→','↑'],ANAME=['يسار','أسفل','يمين','أعلى'];
function mv(s,a){let r=s>>2,c=s&3;if(a===0)c=Math.max(0,c-1);else if(a===1)r=Math.min(3,r+1);else if(a===2)c=Math.min(3,c+1);else r=Math.max(0,r-1);return r*4+c}
const MODEL={};
function lake(slip,bonus){const key=slip+'|'+(bonus?bonus.k+bonus.b:'');if(MODEL[key])return MODEL[key];const P=[],R=[];
  for(let s=0;s<16;s++){P.push([]);R.push([]);for(let a=0;a<4;a++){const p=new Array(16).fill(0);let r=0;
    if(TERM(s))p[s]=1;else{const outs=slip?[(a+3)%4,a,(a+1)%4]:[a];for(const b of outs){const t=mv(s,b);p[t]+=1/outs.length;if(t===GOAL)r+=1/outs.length;if(bonus)r+=bonus.f(s,t)/outs.length}}
    P[s].push(p);R[s].push(r)}}return MODEL[key]={P,R}}
const Qof=(M,V,g)=>M.P.map((ps,s)=>ps.map((p,a)=>M.R[s][a]+g*p.reduce((u,q,t)=>u+q*V[t],0)));
function vi(M,g,K){let V=new Array(16).fill(0);const h=[V];for(let k=0;k<K;k++){V=Qof(M,V,g).map(q=>Math.max(...q));h.push(V)}return h}
const amax=q=>{let b=0;for(let i=1;i<q.length;i++)if(q[i]>q[b]+1e-12)b=i;return b};
const det=pol=>pol.map(a=>[0,1,2,3].map(b=>b===a?1:0));
function occupy(M,pi,T=100){let d=new Array(16).fill(0);d[0]=1;const vis=new Array(16).fill(0);for(let t=0;t<T;t++){const n=new Array(16).fill(0);for(let s=0;s<16;s++){if(!d[s])continue;if(TERM(s)){n[s]+=d[s];continue}vis[s]+=d[s];for(let a=0;a<4;a++){const w=d[s]*pi[s][a];if(w)M.P[s][a].forEach((q,u)=>{if(q)n[u]+=w*q})}}d=n}return{d,vis}}
const succ=(M,pi,T=100)=>occupy(M,pi,T).d[GOAL];
const dist=s=>(3-(s>>2))+(3-(s&3));
const SOLVED={};function solved(slip){if(SOLVED[slip])return SOLVED[slip];const M=lake(slip),h=vi(M,0.95,400),V=h[400],Q=Qof(M,V,0.95);return SOLVED[slip]={M,h,V,Q,pol:Q.map(amax)}}

/* lake drawing: o.vals (0..vmax colour), o.txt (cell strings), o.pol (arrows), o.hl (cell), o.raw (extra svg) */
function lakeSVG(o){const c=62,m=6,W=4*c+2*m;let s=`<svg viewBox="0 0 ${W} ${W}" style="width:100%;max-width:300px;height:auto;display:block;margin:0 auto;direction:ltr">`;
  for(let i=0;i<16;i++){const x=m+(i&3)*c,y=m+(i>>2)*c,h=HOLES.has(i),gl=i===GOAL;let fill=h?'var(--rose-soft)':gl?'var(--green-soft)':'var(--paper)';
    s+=`<rect x="${x}" y="${y}" width="${c-2}" height="${c-2}" rx="6" fill="${fill}" stroke="${o.hl===i?'var(--accent)':'var(--rule)'}" stroke-width="${o.hl===i?3:1}"/>`;
    if(o.vals&&!h&&!gl){const v=o.vals[i]/(o.vmax||1);if(v>0)s+=`<rect x="${x}" y="${y}" width="${c-2}" height="${c-2}" rx="6" fill="var(--math)" opacity="${(0.08+0.5*Math.min(1,v)).toFixed(3)}"/>`}
    s+=`<text x="${x+5}" y="${y+13}" font-size="10" fill="var(--soft)">${i}${i===0?' S':h?' H':gl?' G':''}</text>`;
    if(o.pol&&!TERM(i))s+=`<text x="${x+c/2-1}" y="${y+c/2+8}" font-size="22" text-anchor="middle" fill="var(--ink)">${ARW[o.pol[i]]}</text>`;
    if(o.txt&&o.txt[i]!=null)s+=`<text x="${x+c-6}" y="${y+c-8}" font-size="11" text-anchor="end" fill="var(--ink)" font-family="var(--f-mono)">${o.txt[i]}</text>`}
  if(o.raw)s+=o.raw(i=>[m+(i&3)*c+c/2-1,m+(i>>2)*c+c/2-1]);return s+'</svg>'}
const arrowDefs=`<defs><marker id="ah14" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs>`;

/* ---------- 14.1 lake explorer ---------- */
let lkS=9,lkPath=null;
function drawLK(){const slip=segVal('#lkI','v')==='1',a=+segVal('#lkA','v'),M=lake(slip),p=M.P[lkS][a];
  const raw=C=>{let r=arrowDefs;if(lkPath){for(let i=1;i<lkPath.length;i++){const[x1,y1]=C(lkPath[i-1]),[x2,y2]=C(lkPath[i]);if(x1!==x2||y1!==y2)r+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--amber)" stroke-width="3" opacity=".7"/>`}return r}
    if(TERM(lkS))return r;const[x0,y0]=C(lkS);p.forEach((q,t)=>{if(!q)return;const[x,y]=C(t);if(t===lkS)r+=`<circle cx="${x0}" cy="${y0-16}" r="9" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="${x0+12}" y="${y0-18}" font-size="11" fill="var(--accent)">${q.toFixed(2)}</text>`;else r+=`<line x1="${x0+(x-x0)*0.2}" y1="${y0+(y-y0)*0.2}" x2="${x0+(x-x0)*0.72}" y2="${y0+(y-y0)*0.72}" stroke="var(--accent)" stroke-width="${1.5+3*q}" marker-end="url(#ah14)"/><text x="${x}" y="${y+18}" font-size="12" text-anchor="middle" fill="var(--accent)" font-weight="600">${q.toFixed(2)}</text>`});return r};
  $('#lkOut').innerHTML=lakeSVG({hl:lkS,raw});
  if(lkPath){const T=lkPath[lkPath.length-1];$('#lkCalc').textContent=`random policy episode: ${lkPath.join(' → ')}\n${lkPath.length-1} steps, ${T===GOAL?'reached the goal: return 1 (terminated)':HOLES.has(T)?'fell into hole '+T+': return 0 (terminated)':'cut at 100 steps on live ice (truncated)'}`;return}
  $('#lkCalc').textContent=TERM(lkS)?`cell ${lkS} is terminal (absorbing): P(${lkS} | ${lkS}, a) = 1, r = 0`:`P(· | s = ${lkS}, a = ${ANAME[a]})  [${slip?'slippery: intended and the two perpendicular moves, 1/3 each':'calm: always the intended move'}]\n`+p.map((q,t)=>q?`  → ${t}${HOLES.has(t)?' (hole)':t===GOAL?' (goal)':''}: ${q.toFixed(3)}`:'').filter(Boolean).join('\n')+`\nsum = ${p.reduce((u,v)=>u+v,0).toFixed(3)};  expected reward r(${lkS}, ${ANAME[a]}) = ${M.R[lkS][a].toFixed(3)}`}
$('#lkOut').addEventListener('click',e=>{const sv=e.target.closest('svg');if(!sv)return;const b=sv.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*260-6,y=(e.clientY-b.top)/b.height*260-6;const c=Math.floor(x/62),r=Math.floor(y/62);if(c>=0&&c<4&&r>=0&&r<4){lkS=r*4+c;lkPath=null;drawLK()}});
$('#lkRun').addEventListener('click',()=>{const slip=segVal('#lkI','v')==='1',M=lake(slip),R=Math.random;let s=0;const path=[0];for(let t=0;t<100;t++){const a=Math.floor(R()*4),p=M.P[s][a];let u=R(),c=0,n=15;for(let j=0;j<16;j++){c+=p[j];if(u<c){n=j;break}}s=n;path.push(s);if(TERM(s))break}lkPath=path;drawLK()});
segOn('#lkI',()=>{lkPath=null;drawLK()});segOn('#lkA',()=>{lkPath=null;drawLK()});drawLK();

/* ---------- 14.1 discount ---------- */
function drawDC(){const g=$('#dcG').value/1000;$('#dcGo').textContent=g.toFixed(3);const H=1/(1-g),w95=Math.ceil(Math.log(0.05)/Math.log(g)),T=Math.min(200,Math.max(30,Math.ceil(3.5*H)));
  plot($('#dcPlot'),{xmin:0,xmax:T,ymin:0,ymax:1.05,H:200,xt:[0,Math.round(T/4),Math.round(T/2),Math.round(3*T/4),T],yt:[0,0.5,1],xl:'step t',yl:'weight γᵗ',curves:[{f:t=>g**t,c:'var(--math)'}],
    raw:(X,Y)=>`<rect x="${X(0)}" y="${Y(1.05)}" width="${X(Math.min(w95,T))-X(0)}" height="${Y(0)-Y(1.05)}" fill="var(--green)" opacity=".07"/><line x1="${X(H)}" x2="${X(H)}" y1="${Y(0)}" y2="${Y(1.05)}" stroke="var(--rose)" stroke-dasharray="4 4"/>`,
    pts:[{x:Math.min(H,T),y:g**H,c:'var(--rose)',r:4,t:'H_eff = '+H.toFixed(1)},{x:5,y:g**5,c:'var(--green)',r:5,t:'γ⁵ = '+(g**5).toFixed(3)}]});
  $('#dcCalc').textContent=`effective horizon H_eff = 1/(1 − γ) = ${H.toFixed(1)} steps; weight there γ^H ≈ ${(g**H).toFixed(3)} (≈ e⁻¹ = 0.368 for γ near 1)\n95% of the total weight lies within the first ⌈ln 0.05 / ln γ⌉ = ${w95} steps (shaded)\nthe calm-ice goal reached after 6 moves (reward at t = 5) is worth γ⁵ = ${(g**5).toFixed(3)} today\nbound on everything after step k: γᵏ r_max/(1 − γ); with r_max = 1 the whole sum ≤ ${H.toFixed(1)}`}
$('#dcG').addEventListener('input',drawDC);drawDC();

/* ---------- 14.1 reward hacking ---------- */
function drawRH(){const b=$('#rhB').value/100,mode=segVal('#rhM','v'),slip=segVal('#rhI','v')==='1',g=0.95;$('#rhBo').textContent=b.toFixed(2);
  const Phi=s=>TERM(s)?0:-b*dist(s);
  const bonus=mode==='n'?{k:'n',b,f:(s,t)=>dist(t)<dist(s)?b:0}:{k:'p',b,f:(s,t)=>g*Phi(t)-Phi(s)};
  const M=lake(slip,bonus),h=vi(M,g,600),V=h[600],Q=Qof(M,V,g),pol=Q.map(amax),tr=succ(lake(slip),det(pol)),opt=solved(slip);
  $('#rhOut').innerHTML=lakeSVG({pol,hl:14,txt:V.map((v,i)=>TERM(i)?null:v.toFixed(2))});
  const loop=0.3*g/(1-g*g);
  $('#rhCalc').textContent=(mode==='n'?`naive bonus: +${b.toFixed(2)} whenever a step lowers the Manhattan distance ℓ to the goal (stepping back costs nothing)\ncalm-ice arithmetic at cell 14: enter the goal once = 1 + ${b.toFixed(2)} = ${(1+b).toFixed(2)}; shuttle 14 ↔ 13 forever = ${b.toFixed(2)}·γ/(1 − γ²) = ${(b*g/(1-g*g)).toFixed(2)}`:`potential-based: r̃ = r + γΦ(s′) − Φ(s), Φ(s) = −${b.toFixed(2)}·ℓ(s), Φ(terminal) = 0\n13 → 14 pays ${(g*Phi(14)-Phi(13)).toFixed(3)}, 14 → 13 charges ${(g*Phi(13)-Phi(14)).toFixed(3)}: a loop cannot gain more than −Φ(14) = ${(-Phi(14)).toFixed(2)}`)+
  `\nshaped optimum at cell 14: ${ARW[pol[14]]} (${ANAME[pol[14]]});  shaped V(0) = ${V[0].toFixed(3)}\ntrue 100-step success of that policy on ${slip?'slippery':'calm'} ice: ${pc(tr)}  (true optimum: ${pc(succ(lake(slip),det(opt.pol)))})`+(mode==='n'&&tr<0.01?'\n→ reward hacking: the learner farms the bonus and never finishes':'')}
$('#rhB').addEventListener('input',drawRH);segOn('#rhM',drawRH);segOn('#rhI',drawRH);drawRH();

/* ---------- 14.2 value iteration ---------- */
function drawVI(){const slip=segVal('#viI','v')==='1',k=+$('#viK').value;$('#viKo').textContent=k;const S=solved(slip),M=S.M,h=S.h;const Vk=h[Math.min(k,400)],Qk=Qof(M,Vk,0.95),pol=Qk.map(amax);
  $('#viOut').innerHTML=lakeSVG({vals:Vk,vmax:1,pol:k?pol:null,txt:Vk.map((v,i)=>TERM(i)?null:v.toFixed(3)),hl:9});
  const err=Math.max(...Vk.map((v,i)=>Math.abs(v-S.V[i]))),dv=k?Math.max(...Vk.map((v,i)=>Math.abs(v-h[k-1][i]))):NaN,same=pol.every((a,i)=>TERM(i)||Math.abs(S.Q[i][a]-S.V[i])<1e-9);
  $('#viCalc').textContent=`sweep k = ${k}: V_k(0) = ${Vk[0].toFixed(4)}  (V*(0) = ${S.V[0].toFixed(4)})\nQ_k(9, ·) = [${Qk[9].map(P3).join(', ')}]  (← ↓ → ↑)  — ${Qk[9][1]>Qk[9][2]?'down beats right':'right ≥ down'} at cell 9\ntrue error ‖V_k − V*‖∞ = ${err.toExponential(2)}`+(k?`;  certificate γ/(1−γ)·‖V_k − V_k−1‖∞ = ${(19*dv).toExponential(2)}`:'')+`\ngreedy policy ${k?(same?'is already optimal':'is not optimal yet'):'(undefined at k = 0)'}`}
$('#viK').addEventListener('input',drawVI);segOn('#viI',drawVI);drawVI();

/* ---------- 14.2 convergence ---------- */
(function(){const S=solved(true),h=S.h,e0=Math.max(...S.V),pts1=[],pts2=[],pts3=[];for(let k=1;k<=220;k++){const te=Math.max(...h[k].map((v,i)=>Math.abs(v-S.V[i]))),dv=Math.max(...h[k].map((v,i)=>Math.abs(v-h[k-1][i])));pts1.push([k,Math.log10(Math.max(te,1e-14))]);pts2.push([k,Math.log10(0.95**k*e0)]);pts3.push([k,Math.log10(19*dv)])}
  const find=(a,th)=>a.find(p=>p[1]<=th)[0];
  plot($('#cvPlot'),{xmin:0,xmax:220,ymin:-8,ymax:0.5,H:230,xt:[0,50,100,150,200],yt:[-8,-6,-4,-2,0],ytf:v=>'1e'+v,xl:'sweep k',yl:'sup-norm error',
    lines:[{pts:pts2,c:'var(--soft)',w:1.4,dash:1},{pts:pts3,c:'var(--amber)',w:2},{pts:pts1,c:'var(--math)',w:2.6}],raw:(X,Y)=>`<line x1="${X(0)}" x2="${X(220)}" y1="${Y(-6)}" y2="${Y(-6)}" stroke="var(--rose)" stroke-dasharray="3 3"/>`,
    pts:[{x:find(pts1,-6),y:-6,c:'var(--math)',r:4,t:'true '+find(pts1,-6),left:true},{x:find(pts3,-6),y:-6,c:'var(--amber)',r:4,t:'cert '+find(pts3,-6)}]});
  let k1=0;for(let k=1;k<=400;k++){const dv=Math.max(...h[k].map((v,i)=>Math.abs(v-h[k-1][i])));if(dv<=1e-6){k1=k;break}}const te1=Math.max(...h[k1].map((v,i)=>Math.abs(v-S.V[i])));
  $('#cvCalc').textContent=`blue: true error ‖V_k − V*‖∞;  dashed grey: a-priori bound γᵏ e₀;  amber: observable certificate 19·‖V_k − V_k−1‖∞\nstop when raw change ≤ 1e-6 → sweep ${k1}, but the true error is still ${te1.toExponential(1)} (${(te1/1e-6).toFixed(0)}× the tolerance)\nstop when the certificate ≤ 1e-6 → sweep ${find(pts3,-6)}; the true error crossed 1e-6 at sweep ${find(pts1,-6)}`})();

/* ---------- 14.2 three policies ---------- */
function drawSP(){const which=segVal('#spP','v'),M=lake(true),S=solved(true),C=solved(false);
  const pols={opt:det(S.pol),sp:det(C.pol),rnd:Array.from({length:16},()=>[.25,.25,.25,.25])};const o=occupy(M,pols[which]);
  $('#spOut').innerHTML=lakeSVG({vals:o.vis,vmax:Math.max(...o.vis.filter((_,i)=>!TERM(i))),pol:which==='rnd'?null:(which==='opt'?S.pol:C.pol),txt:o.vis.map((v,i)=>HOLES.has(i)?pc(o.d[i]):TERM(i)?null:v.toFixed(2))})+
    `<div style="margin-top:8px">`+bar('السياسة المثلى المدركة للانزلاق',succ(M,pols.opt),1,pc(succ(M,pols.opt)),'var(--green)')+bar('أقصر طريق (الأمثل على الجليد الساكن)',succ(M,pols.sp),1,pc(succ(M,pols.sp)),'var(--amber)')+bar('عشوائية',succ(M,pols.rnd),1,pc(succ(M,pols.rnd)),'var(--rose)')+`</div>`;
  const falls=[5,7,11,12].map(hh=>`${hh}: ${pc(o.d[hh])}`).join('  ');
  $('#spCalc').textContent=`exact 100-step success on slippery ice (state distribution propagated 100 times, no sampling)\nselected policy: numbers in cells = expected visits before the episode ends; in holes = probability of ending there\nfalls by hole → ${falls}`+(which==='opt'?`\nthe optimum commands into walls at 0, 1, 3, 4, 14 and away from the goal at 2, 6, 8, 10: only cell 6 (between holes 5 and 7) still risks a fall`:'')}
segOn('#spP',drawSP);drawSP();

/* ---------- 14.3 Q-learning ---------- */
function stepEnv(M,s,a,R){const p=M.P[s][a];let u=R(),c=0;for(let t=0;t<16;t++){c+=p[t];if(u<c)return t}return 15}
function qlearn(slip,E,seed,sched,g=0.95){const M=lake(slip),R=rng(seed),Q=Array.from({length:16},()=>[0,0,0,0]),N=Array.from({length:16},()=>[0,0,0,0]),rets=[],tr=[];let steps=0;
  for(let e=0;e<E;e++){const eps=e<E/2?1-0.95*e/(E/2):0.05;let s=0,ret=0;
    for(let t=0;t<100;t++){let a;if(R()<eps)a=Math.floor(R()*4);else{const m=Math.max(...Q[s]);const b=[0,1,2,3].filter(i=>Q[s][i]===m);a=b[Math.floor(R()*b.length)]}
      const s2=stepEnv(M,s,a,R),r=s2===GOAL?1:0;N[s][a]++;const n=N[s][a],al=sched==='c'?0.9:sched==='m'?1/(1+n):1/(1+0.1*n);
      Q[s][a]+=al*(r+(TERM(s2)?0:g*Math.max(...Q[s2]))-Q[s][a]);steps++;ret+=r;s=s2;if(TERM(s))break}
    rets.push(ret);tr.push(Q[0][0])}return{Q,rets,steps,tr}}
let qlSeed=1;
function drawQL(){const E=+$('#qlE').value,sch=segVal('#qlA','v');$('#qlEo').textContent=E.toLocaleString('en-US');const o=qlearn(true,E,qlSeed,sch),S=solved(true),pol=o.Q.map(amax),mx=o.Q.map(q=>Math.max(...q));
  $('#qlGrid').innerHTML=lakeSVG({vals:mx,vmax:1,pol,txt:mx.map((v,i)=>TERM(i)?null:v.toFixed(2))});
  const ma=[],w=200;let acc=0;o.rets.forEach((r,i)=>{acc+=r;if(i>=w)acc-=o.rets[i-w];if(i%Math.max(1,Math.floor(E/150))===0&&i>=w-1)ma.push([i+1,acc/w])});
  const trp=o.tr.map((v,i)=>[i+1,v]).filter((_,i)=>i%Math.max(1,Math.floor(E/300))===0);
  plot($('#qlPlot'),{xmin:0,xmax:E,ymin:0,ymax:0.8,H:200,xt:[0,E/2,E].map(Math.round),yt:[0,0.2,0.4,0.6,0.8],xl:'episode',yl:'',lines:[{pts:ma,c:'var(--green)',w:2.2},{pts:trp,c:'var(--math)',w:1.6},{pts:[[0,S.Q[0][0]],[E,S.Q[0][0]]],c:'var(--math)',w:1,dash:1},{pts:[[0,0.537],[E,0.537]],c:'var(--green)',w:1,dash:1}]});
  const sc=succ(lake(true),det(pol)),reg=S.V[0]-S.Q[0][pol[0]];const vErr=Math.max(...mx.map((v,i)=>TERM(i)?0:Math.abs(v-S.V[i])));
  $('#qlCalc').textContent=`seed ${qlSeed}, ${E.toLocaleString('en-US')} episodes, ${o.steps.toLocaleString('en-US')} environment steps;  α = ${sch==='c'?'0.9 constant':sch==='m'?'1/(1+n) (sample mean)':'1/(1 + 0.1 n)'};  ε: 1 → 0.05 over the first half\ngreen: 200-episode moving average of training returns (dashed: 0.537 = π* forced to explore with ε = 0.05)\nblue: Q(0, left) during training (dashed: exact Q*(0, left) = ${P3(S.Q[0][0])})\ngreedy policy from the learned table: exact success ${pc(sc)} (optimum 73.0%);  max |max Q − V*| = ${vErr.toFixed(3)}`+(sc>0.729?'  ✓ optimal':'')}
$('#qlE').addEventListener('change',drawQL);segOn('#qlA',drawQL);$('#qlNew').addEventListener('click',()=>{qlSeed++;drawQL()});drawQL();

/* ---------- 14.3 maximization bias ---------- */
function drawMB(){const m=+$('#mbM').value,n=+$('#mbN').value;$('#mbMo').textContent=m;$('#mbNo').textContent=n;const R=rng(7),T=4000;let sMax=0,sDbl=0;const hist=new Array(40).fill(0);
  for(let t=0;t<T;t++){const A=[],B=[];for(let a=0;a<m;a++){let x=0,y=0;for(let i=0;i<n;i++){x+=gauss(R);y+=gauss(R)}A.push(x/n);B.push(y/n)}const mx=Math.max(...A);sMax+=mx;sDbl+=B[amax(A)];const bi=Math.floor((mx+1.5)/3*40);if(bi>=0&&bi<40)hist[bi]++}
  const hm=Math.max(...hist);plot($('#mbPlot'),{xmin:-1.5,xmax:1.5,ymin:0,ymax:1.05,H:170,xt:[-1.5,-1,-0.5,0,0.5,1,1.5],yt:[],xl:'max over actions of the estimated value (truth: all 0)',
    raw:(X,Y)=>hist.map((c,i)=>`<rect x="${X(-1.5+i*3/40)}" y="${Y(c/hm)}" width="${X(3/40)-X(0)-1}" height="${Y(0)-Y(c/hm)}" fill="var(--amber)" opacity=".7"/>`).join('')+`<line x1="${X(0)}" x2="${X(0)}" y1="${Y(0)}" y2="${Y(1.05)}" stroke="var(--green)" stroke-width="2"/><line x1="${X(sMax/T)}" x2="${X(sMax/T)}" y1="${Y(0)}" y2="${Y(1.05)}" stroke="var(--rose)" stroke-width="2" stroke-dasharray="4 3"/>`});
  $('#mbCalc').textContent=`${m} actions, every true value 0; each estimate = mean of ${n} noisy rewards (noise σ = 1)\nE[max_a Q̂(a)] = ${(sMax/T).toFixed(3)}  > max_a E[Q̂(a)] = 0   (red dashed line: the upward bias)\ndouble estimator (choose with table A, evaluate with independent table B): ${(sDbl/T).toFixed(3)} ≈ 0\nmore actions → larger bias; more samples per estimate → smaller (≈ σ/√n scale)`}
['#mbM','#mbN'].forEach(s=>$(s).addEventListener('input',drawMB));drawMB();

/* ---------- 14.4 bandits ---------- */
const ARMS=[0.50,0.42,0.90,0.25,0.55,0.38,0.60,0.32,0.50,0.45];
function gammaR(R,k){const d=k-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{x=gauss(R);v=1+c*x}while(v<=0);v=v*v*v;const u=R();if(u<1-0.0331*x*x*x*x||Math.log(u)<0.5*x*x+d*(1-v+Math.log(v)))return d*v}}
const betaR=(R,a,b)=>{const x=gammaR(R,a),y=gammaR(R,b);return x/(x+y)};
function bandit(rule,T,seed,par){const R=rng(seed),m=10,w=new Array(m).fill(0),n=new Array(m).fill(0);let reg=0;const cur=new Float64Array(T);
  for(let t=0;t<T;t++){const mu=i=>n[i]?w[i]/n[i]:0;const am=f=>{let b=[],mx=-1e9;for(let i=0;i<m;i++){const v=f(i);if(v>mx+1e-12){mx=v;b=[i]}else if(Math.abs(v-mx)<=1e-12)b.push(i)}return b[Math.floor(R()*b.length)]};let a;
    if(rule==='greedy')a=am(mu);else if(rule==='eps')a=R()<par?Math.floor(R()*m):am(mu);else if(rule==='anneal')a=R()<Math.min(1,par/(t+1))?Math.floor(R()*m):am(mu);
    else if(rule==='ucb')a=t<m?t:am(i=>mu(i)+par*Math.sqrt(Math.log(t)/n[i]));else a=am(i=>betaR(R,1+w[i],1+n[i]-w[i]));
    w[a]+=R()<ARMS[a]?1:0;n[a]++;reg+=0.9-ARMS[a];cur[t]=reg}return{cur,n}}
const med=v=>{const s=v.slice().sort((a,b)=>a-b),k=s.length;return k%2?s[(k-1)/2]:(s[k/2-1]+s[k/2])/2};
function drawBD(){const eps=$('#bdE').value/100,kap=$('#bdK').value/100;$('#bdEo').textContent=eps.toFixed(2);$('#bdKo').textContent=kap.toFixed(2);const T=2000,runs=20;
  const rules=[['greedy','جشع',0,'var(--rose)'],['eps','ε ثابت',eps,'var(--amber)'],['anneal','ε = 20/t',20,'var(--soft)'],['ucb','UCB',kap,'var(--math)'],['ts','تومسون',0,'var(--green)']];const res=[];
  rules.forEach(r=>{const C=[];let pulls=new Array(10).fill(0);for(let s=0;s<runs;s++){const o=bandit(r[0],T,s+1,r[2]);C.push(o.cur);o.n.forEach((v,i)=>pulls[i]+=v/runs)}const curve=[];for(let t=9;t<T;t+=20)curve.push([t+1,med(C.map(c=>c[t]))]);curve.push([T,med(C.map(c=>c[T-1]))]);res.push({r,curve,fin:C.map(c=>c[T-1]),pulls})});
  const lg=v=>Math.log10(Math.max(1,v));
  plot($('#bdPlot'),{xmin:0,xmax:T,ymin:0,ymax:3.1,H:230,xt:[0,500,1000,1500,2000],yt:[0,1,2,3],ytf:v=>String(10**v),xl:'pull t',yl:'median cumulative regret (log scale)',lines:res.map(o=>({pts:o.curve.map(p=>[p[0],lg(p[1])]),c:o.r[3],w:2.2}))});
  $('#bdLeg').innerHTML=res.map(o=>`<span style="display:inline-flex;align-items:center;gap:6px;margin-inline-end:14px"><i style="width:14px;height:3px;background:${o.r[3]};display:inline-block"></i>${o.r[1]}</span>`).join('');
  $('#bdCalc').textContent=`arms μ = [${ARMS.join(', ')}], best μ₃ = 0.90; ${runs} runs × ${T} pulls; regret = Σ (0.90 − μ_chosen)\n`+res.map(o=>`${o.r[0].padEnd(7)} median ${med(o.fin).toFixed(0).padStart(4)}   max ${Math.max(...o.fin).toFixed(0).padStart(4)}   pulls of the best arm ${o.pulls[2].toFixed(0)}`).join('\n')+`\nLai–Robbins: the second-best arm (0.60) must be pulled ≥ ln(2000)/D(0.60‖0.90) ≈ 24 times → regret Ω(ln t)`}
['#bdE','#bdK'].forEach(s=>$(s).addEventListener('change',drawBD));drawBD();

/* ---------- 14.4 chain ---------- */
function drawCH(){const N=+$('#chN').value;$('#chNo').textContent=N;let d=new Array(N).fill(0);d[0]=1;for(let t=0;t<2*N;t++){const n=new Array(N).fill(0);for(let s=0;s<N;s++){if(!d[s])continue;if(s===N-1){n[s]+=d[s];continue}n[0]+=d[s]/2;n[s+1]+=d[s]/2}d=n}
  const rnd=1/d[N-1],f=[];for(let seed=0;seed<20;seed++){const R=rng(seed),Q=Array.from({length:N},()=>[1,1]),V=Array.from({length:N},()=>[0,0]);let got=Infinity;
    for(let e=1;e<=200&&got===Infinity;e++){let s=0;for(let t=0;t<2*N;t++){const m=Math.max(...Q[s]),b=[0,1].filter(i=>Q[s][i]===m),a=b[Math.floor(R()*b.length)],s2=a?s+1:0,r=(a&&s===N-2)?1:0;V[s][a]++;const term=s2===N-1;Q[s][a]+=1/(1+0.1*V[s][a])*(r+(term?0:0.95*Math.max(...Q[s2]))-Q[s][a]);s=s2;if(term){got=e;break}}}f.push(got)}
  const om=med(f),mx=Math.max(rnd,om);
  $('#chOut').innerHTML=bar('عشوائي / جدول أصفار (متوسط)',Math.log10(rnd),Math.log10(Math.max(mx,10))+0.3,rnd.toLocaleString('en-US',{maximumFractionDigits:0}),'var(--rose)')+bar('تفاؤلي: Q₀ = 1 وجشع (وسيط)',Math.log10(Math.max(om,1.2)),Math.log10(Math.max(mx,10))+0.3,String(om),'var(--green)');
  $('#chCalc').textContent=`chain of ${N} states: action 1 moves on, action 0 resets to state 0; reward 1 only on entering state ${N-1}; episodes cut after ${2*N} steps\nrandom actions succeed within ${2*N} steps with probability ${d[N-1].toExponential(2)} → ${rnd.toFixed(0)} episodes expected (doubles per extra state)\noptimistic greedy Q-learning: median ${om} episodes to the first success (max ${Math.max(...f)}) over 20 seeds — grows ≈ linearly in N\n(bars on a log scale)`}
$('#chN').addEventListener('input',drawCH);drawCH();

/* ---------- 14.4 pass@K ---------- */
function drawPK(){const p=$('#pkP').value/100,K=+$('#pkK').value;$('#pkPo').textContent=p.toFixed(2);$('#pkKo').textContent=K;const z=(1-p)**K+p**K,pass=1-(1-p)**K;
  $('#pkOut').innerHTML=bar('مجموعة بلا إشارة (كلها خطأ أو كلها صواب)',z,1,pc(z),'var(--rose)')+bar('pass@K: واحدة على الأقل صحيحة',pass,1,pc(pass),'var(--green)');
  $('#pkCalc').textContent=`p = π(correct | x) = ${p.toFixed(2)}, K = ${K} responses per prompt\nP(all K score the same) = (1 − p)^K + p^K = ${(1-p).toFixed(2)}^${K} + ${p.toFixed(2)}^${K} = ${z.toFixed(4)}  → every group-relative weight is 0\npass@K = 1 − (1 − p)^K = ${pass.toFixed(4)}`}
['#pkP','#pkK'].forEach(s=>$(s).addEventListener('input',drawPK));drawPK();

/* ---------- 14.5 behaviour cloning on calm ice ---------- */
const EXPERT=solved(false).pol,PATH=new Set([0,4,8,9,13,14]);
function drawBC(){const mode=segVal('#bcM','v'),q=$('#bcQ').value/10000;$('#bcQo').textContent=q.toFixed(3);const M=lake(false),row=a=>[0,1,2,3].map(b=>b===a?q:(1-q)/3);
  const bc=EXPERT.map((a,s)=>PATH.has(s)?row(a):[.25,.25,.25,.25]),dag=EXPERT.map(row);
  const pi=mode==='g'?det(bc.map(amax)):mode==='d'?dag:bc,o=occupy(M,pi),vis=o.vis;
  $('#bcOut').innerHTML=lakeSVG({vals:vis,vmax:1,pol:EXPERT,txt:vis.map((v,i)=>HOLES.has(i)?pc(o.d[i]):TERM(i)?null:v.toFixed(2)),raw:C=>{let r='';const pth=[0,4,8,9,13,14,15];for(let i=1;i<pth.length;i++){const[a,b]=C(pth[i-1]),[c,d]=C(pth[i]);r+=`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="var(--math)" stroke-width="2" opacity=".35"/>`}return r}});
  const sB=succ(M,bc),sD=succ(M,dag);let err=0,tot=0;for(let s=0;s<16;s++){if(TERM(s))continue;err+=vis[s]*(1-pi[s][EXPERT[s]]);tot+=vis[s]}
  $('#bcCalc').textContent=`clone: π(expert action | s) = ${q.toFixed(3)} on the 6 demonstrated cells (error ε = ${(1-q).toFixed(3)}), uniform 1/4 on unvisited cells 1, 2, 3, 6, 10\n`+
   `${mode==='g'?'greedy deployment (argmax): stays on the tube':mode==='d'?'after DAgger: every reachable cell labelled by the expert, same ε everywhere':'sampled deployment (as a language model samples tokens)'} → exact success ${pc(succ(M,pi))}\n`+
   `error on the expert's own states: ${(1-q).toFixed(3)};  error weighted by the policy's own visits: ${(err/tot).toFixed(3)}\nBC sampled ${pc(sB)}  vs  DAgger ceiling ${pc(sD)}  vs  expert 100%  (more expert episodes cannot change the BC table)`}
segOn('#bcM',drawBC);$('#bcQ').addEventListener('input',drawBC);drawBC();

/* ---------- 14.5 compounding error ---------- */
function drawCE(){const e=$('#ceE').value/1000,u=+$('#ceU').value;$('#ceEo').textContent=e.toFixed(3);$('#ceUo').textContent=u;const Tm=128,L=T=>{let c=0;for(let t=1;t<=T;t++)c+=1-(1-e)**t;return c};
  const a=[],b=[],c=[];for(let T=1;T<=Tm;T+=1){a.push([T,L(T)]);b.push([T,e*T*(T+1)/2]);c.push([T,Math.min(T,u*e*T)])}const ym=Math.max(1,b[b.length-1][1]*1.05);
  plot($('#cePlot'),{xmin:0,xmax:Tm,ymin:0,ymax:Math.min(ym,Tm),H:210,xt:[0,32,64,96,128],yt:[0,Math.round(Math.min(ym,Tm)/2),Math.round(Math.min(ym,Tm))],xl:'horizon T',yl:'expected reward lost',lines:[{pts:b,c:'var(--soft)',w:1.3,dash:1},{pts:a,c:'var(--rose)',w:2.4},{pts:c,c:'var(--green)',w:2.4}],pts:[{x:64,y:L(64),c:'var(--rose)',r:4,t:L(64).toFixed(2),left:true},{x:64,y:u*e*64,c:'var(--green)',r:4,t:(u*e*64).toFixed(2)}]});
  $('#ceCalc').textContent=`expert earns 1 per step; each imitator errs with probability ε = ${e.toFixed(3)} per step\ncloned (one slip = off the path for good): loses Σₜ 1 − (1 − ε)ᵗ = ${L(64).toFixed(2)} at T = 64 (bound εT(T+1)/2 = ${(e*64*65/2).toFixed(2)}, dashed)\nrecovering (back on the path after a ${u}-step penalty): loses uεT = ${(u*e*64).toFixed(2)} at T = 64 → ${(L(64)/(u*e*64)).toFixed(0)}× less\nquadratic vs linear in the horizon: doubling T roughly quadruples the clone's loss`}
['#ceE','#ceU'].forEach(s=>$(s).addEventListener('input',drawCE));drawCE();

/* ---------- 14.6 LQR helpers ---------- */
function riccati(A,B,Q,R,H){let P=[[Q[0][0],0],[0,Q[1][1]]],K=[0,0];for(let t=0;t<H;t++){const PB=[P[0][0]*B[0]+P[0][1]*B[1],P[1][0]*B[0]+P[1][1]*B[1]],s=R+B[0]*PB[0]+B[1]*PB[1],BtPA=[PB[0]*A[0][0]+PB[1]*A[1][0],PB[0]*A[0][1]+PB[1]*A[1][1]];K=[BtPA[0]/s,BtPA[1]/s];
  const C=[[A[0][0]-B[0]*K[0],A[0][1]-B[0]*K[1]],[A[1][0]-B[1]*K[0],A[1][1]-B[1]*K[1]]],AtP=[[A[0][0]*P[0][0]+A[1][0]*P[1][0],A[0][0]*P[0][1]+A[1][0]*P[1][1]],[A[0][1]*P[0][0]+A[1][1]*P[1][0],A[0][1]*P[0][1]+A[1][1]*P[1][1]]];
  P=[[Q[0][0]+AtP[0][0]*C[0][0]+AtP[0][1]*C[1][0],AtP[0][0]*C[0][1]+AtP[0][1]*C[1][1]],[AtP[1][0]*C[0][0]+AtP[1][1]*C[1][0],Q[1][1]+AtP[1][0]*C[0][1]+AtP[1][1]*C[1][1]]]}return{P,K}}
function spec(M){const tr=M[0][0]+M[1][1],dt=M[0][0]*M[1][1]-M[0][1]*M[1][0],D=tr*tr/4-dt;return D>=0?Math.max(Math.abs(tr/2+Math.sqrt(D)),Math.abs(tr/2-Math.sqrt(D))):Math.sqrt(dt)}
function drawLQ(){const R=10**($('#lqR').value/10);$('#lqRo').textContent=R<0.1?R.toFixed(3):R.toFixed(2);const dt=0.1,A=[[1,dt],[0,1]],B=[0.5*dt*dt,dt],{P,K}=riccati(A,B,[[1,0],[0,0.1]],R,100);
  const C=[[A[0][0]-B[0]*K[0],A[0][1]-B[0]*K[1]],[A[1][0]-B[1]*K[0],A[1][1]-B[1]*K[1]]];let x=[1,0];const pp=[[0,1]],vv=[[0,0]],uu=[];
  for(let t=0;t<50;t++){const u=-(K[0]*x[0]+K[1]*x[1]);uu.push([t*dt,u]);x=[C[0][0]*x[0]+C[0][1]*x[1],C[1][0]*x[0]+C[1][1]*x[1]];pp.push([(t+1)*dt,x[0]]);vv.push([(t+1)*dt,x[1]])}
  const um=Math.min(-1.2,Math.min(...uu.map(p=>p[1])));
  plot($('#lqPlot'),{xmin:0,xmax:5,ymin:Math.max(um,-8),ymax:1.1,H:210,xt:[0,1,2,3,4,5],yt:[Math.ceil(Math.max(um,-8)),-1,0,1],xl:'time (s)',yl:'',lines:[{pts:uu,c:'var(--amber)',w:1.8},{pts:vv,c:'var(--math)',w:1.8},{pts:pp,c:'var(--green)',w:2.6}]});
  $('#lqCalc').textContent=`double integrator, Δt = 0.1: p ← p + Δt·v + ½Δt²·u, v ← v + Δt·u;  cost Σ p² + 0.1 v² + R u²\nRiccati (100 steps backward) → K∞ = [${K[0].toFixed(3)}, ${K[1].toFixed(3)}]:  u = −${K[0].toFixed(2)}·p − ${K[1].toFixed(2)}·v  (a PD controller)\nspectral radius ρ(A − BK) = ${spec(C).toFixed(3)} < 1 (stable);  cost-to-go from (1, 0): P₀₀ = ${P[0][0].toFixed(2)}\ngreen p(t), blue v(t), amber u(t);  small R → strong, fast control; large R → gentle, slow`}
$('#lqR').addEventListener('input',drawLQ);drawLQ();

/* ---------- 14.6 pendulum basin ---------- */
const g10=10,pdt=0.05,wrap=t=>((t+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
const KP=riccati([[1+1.5*g10*pdt*pdt,pdt],[1.5*g10*pdt,1]],[3*pdt*pdt,3*pdt],[[1,0],[0,0.1]],0.001,200).K;
function drawPD(){const th0=$('#pdT').value/100;$('#pdTo').textContent=th0.toFixed(2)+' rad = '+(th0*180/Math.PI).toFixed(0)+'°';let th=th0,w=0,c=0;const pts=[[0,th0]],us=[];
  for(let t=0;t<200;t++){let u=-(KP[0]*wrap(th)+KP[1]*w);u=Math.max(-2,Math.min(2,u));us.push([t*pdt,u/2]);c+=wrap(th)**2+0.1*w*w+0.001*u*u;w=Math.max(-8,Math.min(8,w+(1.5*g10*Math.sin(th)+3*u)*pdt));th+=w*pdt;pts.push([(t+1)*pdt,wrap(th)])}
  plot($('#pdPlot'),{xmin:0,xmax:10,ymin:-3.3,ymax:3.3,H:200,xt:[0,2,4,6,8,10],yt:[-3,-1.5,0,1.5,3],xl:'time (s)',yl:'angle (rad, 0 = upright)',raw:(X,Y)=>`<rect x="${X(0)}" y="${Y(0.412)}" width="${X(10)-X(0)}" height="${Y(-0.412)-Y(0.412)}" fill="var(--green)" opacity=".08"/>`,lines:[{pts:us,c:'var(--amber)',w:1.2},{pts,c:'var(--math)',w:2.4}]});
  const fin=wrap(th);$('#pdCalc').textContent=`Pendulum-v1: θ̇ ← clip(θ̇ + (15 sin θ + 3u)·0.05, ±8), θ ← θ + 0.05·θ̇;  torque clipped to |u| ≤ 2\nLQR at the top: open-loop eigenvalue 1.2133 (tilt grows 21%/step) → K∞ = [${KP[0].toFixed(3)}, ${KP[1].toFixed(3)}]\ngravity torque 5 sin θ exceeds the motor's 2 beyond arcsin(0.4) = 0.412 rad (shaded band)\nstart ${th0.toFixed(2)} rad → after 200 steps θ = ${fin.toFixed(3)}, return ${(-c).toFixed(2)}  ${Math.abs(fin)<0.01?'✓ caught':'✗ not balanced'}`+(Math.abs(fin)<0.01&&th0>0.45?'  (caught by luck after swinging, not by control)':'')+`\n(amber: torque / 2)`}
$('#pdT').addEventListener('input',drawPD);drawPD();

/* ---------- 14.6 iLQR swing-up ---------- */
const ILQR=(function(){const H=80,qr=0.02,rv=0.02,qT=100,Qb=[1,0.1],x0=[Math.PI,0];let vs=Array.from({length:H},(_,t)=>t<15?0.2:0);
  const st=(x,v)=>{const tv=Math.tanh(v),u=2*tv,du=2*(1-tv*tv),nw=x[1]+(1.5*g10*Math.sin(x[0])+3*u)*pdt,d=1.5*g10*Math.cos(x[0])*pdt,dv=3*pdt*du;return{x:[x[0]+nw*pdt,nw],A:[[1+d*pdt,pdt],[d,1]],B:[dv*pdt,dv],u}};
  const xq=x=>Qb[0]*x[0]*x[0]+Qb[1]*x[1]*x[1];const roll=vv=>{const xs=[x0.slice()],us=[];let c=0;for(let t=0;t<H;t++){c+=(t>=H-20?qT:qr)*xq(xs[t])+rv*vv[t]*vv[t];const o=st(xs[t],vv[t]);xs.push(o.x);us.push(o.u)}c+=qT*xq(xs[H]);return{xs,us,c}};
  const hist=[roll(vs)];
  for(let it=0;it<35;it++){const xs=[x0.slice()],As=[],Bs=[];let cost=0;for(let t=0;t<H;t++){const o=st(xs[t],vs[t]);As.push(o.A);Bs.push(o.B);cost+=(t>=H-20?qT:qr)*xq(xs[t])+rv*vs[t]*vs[t];xs.push(o.x)}cost+=qT*xq(xs[H]);
    let Vx=[2*qT*Qb[0]*xs[H][0],2*qT*Qb[1]*xs[H][1]],Vxx=[[2*qT*Qb[0],0],[0,2*qT*Qb[1]]];const ks=[],Ks=[];
    for(let t=H-1;t>=0;t--){const w=t>=H-20?qT:qr,A=As[t],B=Bs[t],Qx=[2*w*Qb[0]*xs[t][0]+A[0][0]*Vx[0]+A[1][0]*Vx[1],2*w*Qb[1]*xs[t][1]+A[0][1]*Vx[0]+A[1][1]*Vx[1]],Qv=2*rv*vs[t]+B[0]*Vx[0]+B[1]*Vx[1];
      const VA=[[Vxx[0][0]*A[0][0]+Vxx[0][1]*A[1][0],Vxx[0][0]*A[0][1]+Vxx[0][1]*A[1][1]],[Vxx[1][0]*A[0][0]+Vxx[1][1]*A[1][0],Vxx[1][0]*A[0][1]+Vxx[1][1]*A[1][1]]];
      const Qxx=[[2*w*Qb[0]+A[0][0]*VA[0][0]+A[1][0]*VA[1][0],A[0][0]*VA[0][1]+A[1][0]*VA[1][1]],[A[0][1]*VA[0][0]+A[1][1]*VA[1][0],2*w*Qb[1]+A[0][1]*VA[0][1]+A[1][1]*VA[1][1]]];
      const VB=[Vxx[0][0]*B[0]+Vxx[0][1]*B[1],Vxx[1][0]*B[0]+Vxx[1][1]*B[1]],Qvv=2*rv+1e-2+B[0]*VB[0]+B[1]*VB[1],Qvx=[B[0]*VA[0][0]+B[1]*VA[1][0],B[0]*VA[0][1]+B[1]*VA[1][1]];
      ks[t]=-Qv/Qvv;Ks[t]=[-Qvx[0]/Qvv,-Qvx[1]/Qvv];Vx=[Qx[0]+Qvx[0]*ks[t],Qx[1]+Qvx[1]*ks[t]];Vxx=[[Qxx[0][0]+Qvx[0]*Ks[t][0],Qxx[0][1]+Qvx[0]*Ks[t][1]],[Qxx[1][0]+Qvx[1]*Ks[t][0],Qxx[1][1]+Qvx[1]*Ks[t][1]]]}
    let al=0;for(const a of [1,0.5,0.25,0.1,0.03]){let x=x0.slice(),c=0;const vn=[];for(let t=0;t<H;t++){const v=vs[t]+a*ks[t]+Ks[t][0]*(x[0]-xs[t][0])+Ks[t][1]*(x[1]-xs[t][1]);vn.push(v);c+=(t>=H-20?qT:qr)*xq(x)+rv*v*v;x=st(x,v).x}c+=qT*xq(x);if(c<cost){vs=vn;al=a;break}}
    const r=roll(vs);r.alpha=al;hist.push(r)}return hist})();
function drawIL(){const k=+$('#ilK').value;$('#ilKo').textContent=k;const o=ILQR[k],th=o.xs.map((x,t)=>[t*pdt,x[0]]),w=o.xs.map((x,t)=>[t*pdt,x[1]/2]),u=o.us.map((v,t)=>[t*pdt,v]);
  plot($('#ilPlot'),{xmin:0,xmax:4,ymin:-3.5,ymax:6.5,H:220,xt:[0,1,2,3,4],yt:[-2,0,2,Math.PI,4,6].map(v=>+v.toFixed(2)),xl:'time (s)',yl:'',raw:(X,Y)=>`<line x1="${X(0)}" x2="${X(4)}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--green)" stroke-width="1.5"/><line x1="${X(3)}" x2="${X(3)}" y1="${Y(-3.5)}" y2="${Y(6.5)}" stroke="var(--soft)" stroke-dasharray="3 3"/>`,lines:[{pts:u,c:'var(--amber)',w:1.6},{pts:w,c:'var(--soft)',w:1.4},{pts:th,c:'var(--math)',w:2.6}]});
  const f=o.xs[80];$('#ilCalc').textContent=`iteration ${k}${k?` (line-search step α = ${o.alpha})`:' = initial guess: a small push v = 0.2 for 15 steps'}: trajectory cost ${o.c.toFixed(1)}\nθ₈₀ = ${f[0].toFixed(4)} rad, θ̇₈₀ = ${f[1].toFixed(4)}  ${Math.abs(f[0])<0.01&&Math.abs(f[1])<0.05?'✓ swung up and caught at the top':''}\nblue θ (starts hanging at π), grey θ̇/2, amber torque u = 2 tanh(v);  green line = upright;  dashed = start of the heavy capture window (last 20 steps)\n`+(k>=30?`phases: back-swing to θ₁₀ = ${o.xs[10][0].toFixed(2)}, pump through the bottom to θ₃₀ = ${o.xs[30][0].toFixed(2)}, whip up (θ̇₄₀ = ${o.xs[40][1].toFixed(2)}) and brake at the top`:'move the slider: each iteration linearizes around the current trajectory, solves a Riccati pass, and keeps the change only if the true cost drops')}
$('#ilK').addEventListener('input',drawIL);drawIL();

/* ---------- 14.7 softmax score ---------- */
function drawSC(){const th=[0,1,2,3].map(i=>$('#scT'+i).value/10),a=+segVal('#scA','v');th.forEach((v,i)=>$('#scT'+i+'o').textContent=v.toFixed(1));const e=th.map(Math.exp),Z=e.reduce((u,v)=>u+v),pi=e.map(v=>v/Z),sc=pi.map((p,i)=>(i===a?1:0)-p);
  $('#scOut').innerHTML=pi.map((p,i)=>bar('π('+ANAME[i]+')',p,1,p.toFixed(3),i===a?'var(--accent)':'var(--math)')).join('')+'<div style="height:6px"></div>'+sc.map((v,i)=>bar('نقاط '+ANAME[i],Math.abs(v),1,(v>=0?'+':'')+v.toFixed(3),v>=0?'var(--green)':'var(--rose)')).join('');
  $('#scCalc').textContent=`π(a) = e^θₐ / Σ e^θ;  sampled action: ${ANAME[a]}\nscore ∇_θ log π(${ANAME[a]}) = e_${ANAME[a]} − π = [${sc.map(v=>v.toFixed(3)).join(', ')}]\nsum of the score = ${sc.reduce((u,v)=>u+v,0).toFixed(3)} (always 0);  E_a[score] = Σ π(a)(eₐ − π) = 0\na step along R × score raises the chosen action by ${(1-pi[a]).toFixed(3)}·R and lowers each other in proportion to its probability`}
[0,1,2,3].forEach(i=>$('#scT'+i).addEventListener('input',drawSC));segOn('#scA',drawSC);drawSC();

/* ---------- 14.7 Gaussian REINFORCE ---------- */
const Rg=a=>0.4+2*Math.exp(-((a-2)**2)/2);
let g1Seed=3;
function drawG1(){const n=+$('#g1N').value;$('#g1No').textContent=n;const R=rng(g1Seed);const as=[];for(let i=0;i<n;i++)as.push(gauss(R));const est=as.reduce((u,a)=>u+Rg(a)*a,0)/n;
  const R2=rng(99),M=300,E=[];for(let j=0;j<M;j++){let s=0;for(let i=0;i<n;i++){const a=gauss(R2);s+=Rg(a)*a}E.push(s/n)}const mE=E.reduce((u,v)=>u+v)/M,sd=Math.sqrt(E.reduce((u,v)=>u+(v-mE)**2,0)/M);
  plot($('#g1Plot'),{xmin:-3,xmax:4,ymin:-0.2,ymax:2.6,H:200,xt:[-3,-2,-1,0,1,2,3,4],yt:[0,1,2],xl:'action a',yl:'',curves:[{f:Rg,c:'var(--green)'},{f:a=>2*Math.exp(-a*a/2),c:'var(--soft)',w:1.3,dash:1}],
    raw:(X,Y)=>as.map(a=>`<line x1="${X(a)}" x2="${X(a)}" y1="${Y(0)}" y2="${Y(Rg(a))}" stroke="var(--math)" stroke-width="1.5" opacity=".6"/><circle cx="${X(a)}" cy="${Y(Rg(a))}" r="3" fill="var(--math)"/>`).join('')+`<line x1="${X(0)}" x2="${X(0)}" y1="${Y(-0.2)}" y2="${Y(2.6)}" stroke="var(--soft)"/><line x1="${X(0)}" x2="${X(est)}" y1="${Y(2.4)}" y2="${Y(2.4)}" stroke="var(--accent)" stroke-width="3"/><line x1="${X(0)}" x2="${X(0.52)}" y1="${Y(2.5)}" y2="${Y(2.5)}" stroke="var(--green)" stroke-width="3"/>`});
  $('#g1Calc').textContent=`policy a ~ N(μ = 0, 1); reward R(a) = 0.4 + 2 exp(−(a − 2)²/2) (green); dashed: the policy's density (scaled)\nscore of a sample: ∂ log π / ∂μ = a − μ = a, so each sample pulls μ toward itself in proportion to R(a)\nthis batch of ${n}: estimate (1/n) Σ R(aᵢ)·aᵢ = ${est.toFixed(3)} (orange bar)  vs  exact gradient 0.520 (green bar)\nover ${M} batches: mean ${mE.toFixed(3)} (unbiased), spread ${sd.toFixed(3)} ≈ 1.34/√${n} = ${(1.34/Math.sqrt(n)).toFixed(3)}`}
$('#g1N').addEventListener('input',drawG1);$('#g1New').addEventListener('click',()=>{g1Seed++;drawG1()});drawG1();

/* ---------- 14.8 variance parabola ---------- */
const gq=(f,mu=0,s=1)=>{let S=0;const n=1600;for(let i=0;i<n;i++){const z=-8+16*(i+0.5)/n;S+=f(mu+s*z,z)*Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)*16/n}return S};
const VR=(function(){const G=gq(a=>Rg(a)*a),m2=gq(a=>(Rg(a)*a)**2),m1=gq(a=>Rg(a)*a*a),ER=gq(Rg);return{G,ER,bs:m1,var:b=>m2-2*b*m1+b*b*1-G*G}})();
function drawVR(){const b=$('#vrB').value/100;$('#vrBo').textContent=b.toFixed(2);const v0=VR.var(0);
  plot($('#vrPlot'),{xmin:-0.5,xmax:2.5,ymin:0,ymax:2.4,H:200,xt:[-0.5,0,0.5,1,1.5,2,2.5],yt:[0,0.5,1,1.5,2],xl:'baseline b',yl:'variance of (R − b)·a',curves:[{f:VR.var,c:'var(--math)'}],
    pts:[{x:0,y:v0,c:'var(--rose)',r:4,t:'b = 0'},{x:VR.ER,y:VR.var(VR.ER),c:'var(--amber)',r:4,t:'E[R]',left:true},{x:VR.bs,y:VR.var(VR.bs),c:'var(--green)',r:4,t:'b*'},{x:b,y:VR.var(b),c:'var(--accent)',r:6}]});
  $('#vrCalc').textContent=`same 1-step problem: estimator (R(a) − b)·a, a ~ N(0, 1); its mean is ${VR.G.toFixed(3)} for every b (E[b·a] = 0)\nb = ${b.toFixed(2)}: standard deviation ${Math.sqrt(VR.var(b)).toFixed(3)} (${pc(VR.var(b)/v0)} of the raw variance)\nraw b = 0: ${Math.sqrt(v0).toFixed(2)};  mean reward b = ${VR.ER.toFixed(2)}: ${Math.sqrt(VR.var(VR.ER)).toFixed(2)};  optimum b* = E[R a²]/E[a²] = ${VR.bs.toFixed(2)}: ${Math.sqrt(VR.var(VR.bs)).toFixed(2)} (${pc(VR.var(VR.bs)/v0)})`}
$('#vrB').addEventListener('input',drawVR);drawVR();

/* ---------- 14.8 group weights ---------- */
function drawGW(){const K=+$('#gwK').value,k=Math.min(+$('#gwC').value,K);$('#gwC').max=K;$('#gwKo').textContent=K;$('#gwCo').textContent=k;const p=k/K,sd=Math.sqrt(p*(1-p));
  const rows=[['متمركز بمتوسط المجموعة',1-p,-p],['GRPO: مقسوم على الانحراف',sd?(1-p)/sd:0,sd?-p/sd:0],['RLOO: متوسط البقية',K>1?(1-(k-1)/(K-1)):0,K>1?-(k/(K-1)):0]];
  $('#gwOut').innerHTML=rows.map(r=>`<div style="margin:4px 0"><b style="font-size:13px">${r[0]}</b></div>`+bar('وزن الصحيحة',Math.abs(r[1]),3,(r[1]>=0?'+':'')+r[1].toFixed(3),'var(--green)')+bar('وزن الخاطئة',Math.abs(r[2]),3,(r[2]>=0?'+':'')+r[2].toFixed(3),'var(--rose)')).join('');
  $('#gwCalc').textContent=`group of K = ${K} responses to one prompt, ${k} correct (reward 1), ${K-k} wrong (reward 0); p̂ = ${p.toFixed(3)}\ncentered: right +(1 − p̂), wrong −p̂;  GRPO: +√((1−p̂)/p̂) = ${sd?((1-p)/sd).toFixed(3):'—'}, −√(p̂/(1−p̂)) = ${sd?(-p/sd).toFixed(3):'—'}\n`+(k===0||k===K?'all responses score the same → every weight is 0: this group teaches nothing':'a rare success on a hard prompt gets a large push; without a baseline wrong answers would get weight 0')+`\nweights sum to 0 in every scheme: the group is its own baseline (no value network)`}
['#gwK','#gwC'].forEach(s=>$(s).addEventListener('input',drawGW));drawGW();

/* ---------- 14.8 verifier training ---------- */
const VANS=[2,4,-1,-1],VRESP=['1','3','4','7','12','19','23','35','hedge'];
const sm=r=>{const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b);return e.map(v=>v/s)};
const vsucc=th=>th.reduce((u,r,x)=>u+(VANS[x]>=0?sm(r)[VANS[x]]:0),0)/4;
function drawVT(){const K=+$('#vtK').value,mode=segVal('#vtW','v'),steps=+$('#vtS').value;$('#vtKo').textContent=K;$('#vtSo').textContent=steps;const R=rng(1);let th=[0,1,2,3].map(()=>[0,0,0,0,0,0,0,0,-4]);const cur=[[0,vsucc(th)]];
  for(let it=1;it<=steps;it++){th=th.map((row,x)=>{const pi=sm(row),ys=[];for(let j=0;j<K;j++){let u=R(),c=0,y=8;for(let q=0;q<9;q++){c+=pi[q];if(u<c){y=q;break}}ys.push(y)}const r=ys.map(y=>y===VANS[x]?1:0),mn=r.reduce((a,b)=>a+b)/K,sd=Math.sqrt(r.reduce((a,b)=>a+(b-mn)**2,0)/K);
    const w=mode==='raw'?r:mode==='grpo'?r.map(v=>(v-mn)/(sd+1e-8)):r.map(v=>K>1?v-(mn*K-v)/(K-1):0);const g=new Array(9).fill(0);ys.forEach((y,j)=>{for(let q=0;q<9;q++)g[q]+=w[j]*((q===y?1:0)-pi[q])/K});return row.map((v,q)=>v+2*g[q])});cur.push([it,vsucc(th)])}
  plot($('#vtPlot'),{xmin:0,xmax:steps,ymin:0,ymax:0.55,H:190,xt:[0,Math.round(steps/2),steps],yt:[0,0.1,0.2,0.3,0.4,0.5],xl:'update',yl:'success of a sampled response',lines:[{pts:[[0,0.5],[steps,0.5]],c:'var(--soft)',w:1,dash:1},{pts:cur,c:'var(--green)',w:2.4}]});
  const fin=th.map(sm);$('#vtCalc').textContent=`verifier task: prompts 2+2, 3*4, 8*8, 9*9; nine shared answers (${VRESP.join(', ')}); reward 1 only for the exact answer\nreference policy: success 0.062 (ceiling 0.5: 64 and 81 are not among the candidates)\n${mode==='raw'?'REINFORCE (weight = reward)':mode==='grpo'?'GRPO (group-standardized)':'RLOO (reward − mean of the other K − 1)'}, K = ${K}, η = 2, ${steps} updates (${(K*steps).toLocaleString('en-US')} scored responses per prompt) → success ${vsucc(th).toFixed(3)}\nπ(4 | 2+2) = ${fin[0][2].toFixed(3)},  π(12 | 3*4) = ${fin[1][4].toFixed(3)};  unsolvable prompts get zero gradient`+(K===1&&mode!=='raw'?'\nK = 1: the group mean is the response\'s own reward → every weight is 0, nothing is learned':'')}
['#vtK','#vtS'].forEach(s=>$(s).addEventListener('change',drawVT));segOn('#vtW',drawVT);drawVT();

/* ---------- 14.9 table vs network ---------- */
const NT=(function(){const R=rng(5),H=64,w1=[],b1=[],w2=[];for(let i=0;i<H;i++){w1.push(gauss(R)*1.5);b1.push(gauss(R)*0.5);w2.push(gauss(R)/Math.sqrt(H))}return{H,w1,b1,w2}})();
const ntV=(x,P)=>{let s=0;for(let i=0;i<NT.H;i++)s+=P.w2[i]*Math.tanh(P.w1[i]*x+P.b1[i]);return s};
function drawNT(){const x0=$('#ntX').value/100;$('#ntXo').textContent=x0.toFixed(2);const P={w1:NT.w1,b1:NT.b1,w2:NT.w2};
  const gr=[],hs=[];let nrm=0;for(let i=0;i<NT.H;i++){const h=Math.tanh(P.w1[i]*x0+P.b1[i]),d=1-h*h;gr.push([P.w2[i]*d*x0,P.w2[i]*d,h]);nrm+=(P.w2[i]*d*x0)**2+(P.w2[i]*d)**2+h*h}
  const eta=0.5/nrm,Q={w1:P.w1.map((v,i)=>v+eta*gr[i][0]),b1:P.b1.map((v,i)=>v+eta*gr[i][1]),w2:P.w2.map((v,i)=>v+eta*gr[i][2])};const dV=x=>ntV(x,Q)-ntV(x,P);
  const k=x=>{let s=0;for(let i=0;i<NT.H;i++){const h=Math.tanh(P.w1[i]*x+P.b1[i]),d=1-h*h;s+=(P.w2[i]*d*x)*gr[i][0]+(P.w2[i]*d)*gr[i][1]+h*gr[i][2]}return s};
  plot($('#ntPlot'),{xmin:-1,xmax:1,ymin:-0.2,ymax:0.6,H:200,xt:[-1,-0.5,0,0.5,1],yt:[-0.2,0,0.2,0.4,0.6],xl:'state x',yl:'change in V after one update',curves:[{f:dV,c:'var(--math)'}],
    raw:(X,Y)=>`<line x1="${X(-1)}" x2="${X(1)}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--soft)"/><line x1="${X(x0)}" x2="${X(x0)}" y1="${Y(0)}" y2="${Y(0.5)}" stroke="var(--amber)" stroke-width="4"/>`});
  const far=[-1,1].map(dV);$('#ntCalc').textContent=`one SGD step asks V(x₀ = ${x0.toFixed(2)}) to rise by 0.50 (64-unit tanh MLP, fixed random init)\nnetwork (blue): ΔV(x₀) = ${dV(x0).toFixed(3)};  ΔV(x₀ ± 0.1) = ${dV(x0-0.1).toFixed(3)}, ${dV(x0+0.1).toFixed(3)} (generalization);  at the ends ΔV(−1) = ${far[0].toFixed(3)}, ΔV(1) = ${far[1].toFixed(3)}\ntable (amber bar): +0.50 at x₀ and exactly 0 everywhere else\nΔV(x) ≈ η·(y − V(x₀))·k(x, x₀), with the tangent kernel k(x, x₀) = ∇V(x)ᵀ∇V(x₀); k(x₀, x₀) = ${k(x0).toFixed(2)}`}
$('#ntX').addEventListener('input',drawNT);drawNT();

/* ---------- 14.9 score vs pathwise ---------- */
function drawPW(){const mu=$('#pwM').value/100,s=$('#pwS').value/100,c=+$('#pwC').value;$('#pwMo').textContent=mu.toFixed(2);$('#pwSo').textContent=s.toFixed(2);$('#pwCo').textContent=c;const Q=a=>-((a-1)**2)+c;
  const ms=gq((a,z)=>Q(a)*z/s,mu,s),vs=gq((a,z)=>(Q(a)*z/s)**2,mu,s)-ms*ms,mp=gq(a=>-2*(a-1),mu,s),vp=gq(a=>4*(a-1)**2,mu,s)-mp*mp,mx=Math.max(vs,vp);
  $('#pwOut').innerHTML=bar('تباين دالة النقاط',Math.log10(1+vs),Math.log10(1+Math.max(mx,10)),vs.toFixed(2),'var(--rose)')+bar('تباين التدرّج المساري',Math.log10(1+vp),Math.log10(1+Math.max(mx,10)),vp.toFixed(2),'var(--green)');
  $('#pwCalc').textContent=`Q(a) = −(a − 1)² + ${c},  a = μ + σz,  z ~ N(0, 1);  exact ∂/∂μ E[Q(a)] = −2(μ − 1) = ${(-2*(mu-1)).toFixed(3)}\nscore function:  Q(a)·(a − μ)/σ²  → mean ${ms.toFixed(3)}, variance ${vs.toFixed(2)}\npathwise:  Q′(μ + σz) = −2(a − 1)  → mean ${mp.toFixed(3)}, variance ${vp.toFixed(2)}  (= 4σ², unaffected by the shift ${c})\nratio ${(vs/vp).toFixed(1)}×;  pathwise needs a differentiable Q (a learned critic), score function only needs reward numbers`}
['#pwM','#pwS','#pwC'].forEach(s=>$(s).addEventListener('input',drawPW));drawPW();
