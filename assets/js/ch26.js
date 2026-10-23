/* Chapter 26 · Conversation and its Structure — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const r2=v=>(+v).toFixed(2);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];

/* ---------- TOC + progress ---------- */
const SECS=[['s26-1','26.1','خصائص المحادثة'],['s26-2','26.2','أفعال الحوار'],['ex','','للمراجعة']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- the travel-agent conversation ---------- */
const TU=[['C1','. . . I need to travel in May.','CONSTATIVE','—','[assert]','book: stating a constraint = constative'],
 ['A2','And, what day in May did you want to travel?','DIRECTIVE','“And” + repeats “in May”','[info-req, ack]','book: a question is a (polite) directive'],
 ['C3','OK uh I need to be there for a meeting that’s from the 12th to the 15th.','CONSTATIVE','next contribution','[assert, answer]','does not literally answer: implicature (§26.1.6)'],
 ['A4','And you’re flying into what city?','DIRECTIVE','“And”: next contribution','[info-req, ack]',''],
 ['C5','Seattle.','CONSTATIVE','next contribution','[assert, answer]',''],
 ['A6','And what time would you like to leave Pittsburgh?','DIRECTIVE','“And”: next contribution','[info-req, ack]',''],
 ['C7','Uh hmm I don’t think there’s many options for non-stop.','CONSTATIVE','—','[check, hold]','a check that holds off the answer'],
 ['A8','Right. There’s three non-stops today.','ACKNOWLEDGMENT + CONSTATIVE','“Right”: acknowledgment','[accept, ack] + [assert]',''],
 ['C9','What are they?','DIRECTIVE','next contribution','[info-req]',''],
 ['A10','The first one departs PGH at 10:00am arrives Seattle at 12:05 their time. The second flight departs PGH at 5:55pm, arrives Seattle at 8pm. And the last flight departs PGH at 8:15pm arrives Seattle at 10:28pm.','CONSTATIVE','next contribution','[assert, open-option]','a long multi-sentence turn listing options'],
 ['C11','OK I’ll take the 5ish flight on the night before on the 11th.','COMMISSIVE','“OK”','[accept, ack]','the 11th: the inference from C3 confirmed'],
 ['A12','On the 11th? OK. Departing at 5:55pm arrives Seattle at 8pm, U.S. Air flight 115.','DIRECTIVE (check) + CONSTATIVE','display: repeats “On the 11th” + “OK”','[check, ack] + [assert, ack]',''],
 ['C13','OK.','ACKNOWLEDGMENT','“OK”','[ack]','a one-word turn'],
 ['A14','And you said returning on May 15th?','DIRECTIVE (check)','“And”','',''],
 ['C15','Uh, yeah, at the end of the day.','CONSTATIVE','answer','',''],
 ['A16','OK. There’s #two non-stops . . . #','CONSTATIVE','“OK”','','overlapped by C17 (#…#): the agent must stop talking'],
 ['C17','#Act. . . actually #, what day of the week is the 15th?','DIRECTIVE','—','','interruption: starts a correction subdialogue'],
 ['A18','It’s a Friday.','CONSTATIVE','answer','',''],
 ['C19','Uh hmm. I would consider staying there an extra day til Sunday.','CONSTATIVE','—','','implies a plan change: return on the 17th'],
 ['A20','OK. . . OK. On Sunday I have . . .','ACKNOWLEDGMENT + CONSTATIVE','“OK”','','']];
let cvSel=1;
function drawCV(){const L=segVal('#cvL','l');
  $('#cvOut').innerHTML=TU.map((t,i)=>{const sp=t[0][0];let tag='';
    if(L==='act')tag=`<span class="mono" style="font-size:11px;color:var(--math);margin-inline-start:6px">${t[2].split(' ')[0]}</span>`;
    if(L==='gr'&&t[3]!=='—')tag=`<span class="mono" style="font-size:11px;color:var(--green);margin-inline-start:6px">${esc(t[3])}</span>`;
    if(L==='damsl'&&t[4])tag=`<span class="mono" style="font-size:11px;color:var(--amber);margin-inline-start:6px">${esc(t[4])}</span>`;
    if(L==='turn')tag=`<span class="mono" style="font-size:11px;color:var(--soft);margin-inline-start:6px">${t[1].split(/\s+/).filter(w=>/\w/.test(w)).length}w</span>`;
    return `<div data-i="${i}" style="cursor:pointer;padding:2px 8px;border-radius:6px;margin:1px 0;${i===cvSel?'background:var(--green-soft)':''};${sp==='A'?'':'padding-left:28px'}"><b class="mono" style="color:var(--${sp==='A'?'math':'amber'})">${t[0]}:</b> ${esc(t[1]).replace(/#([^#]*)#/g,'<u style="text-decoration-color:var(--rose);text-decoration-thickness:2px">$1</u>')}${tag}</div>`}).join('');
  $$('#cvOut [data-i]').forEach(d=>d.addEventListener('click',()=>{cvSel=+d.dataset.i;drawCV()}));
  const t=TU[cvSel],n=t[1].split(/\s+/).filter(w=>/\w/.test(w)).length;
  $('#cvCalc').textContent=`${t[0]} · ${t[0][0]==='A'?'agent':'client'} · ${n} word${n>1?'s':''}\nspeech act: ${t[2]}\ngrounding: ${t[3]}\nDAMSL (Fig. 26.5): ${t[4]||'(not labeled in the figure)'}`+(t[5]?`\nnote: ${t[5]}`:'')+`\n\n20 turns in all · client (C) indented`}
segOn('#cvL',drawCV);drawCV();

/* ---------- endpointing ---------- */
const SEG=[[0,900],[1150,2100],[2700,3600],[3900,4800]];
function drawEP(){const T=+$('#epT').value;$('#epTo').textContent=T+' ms';
  let cut=null,k=-1;for(let i=0;i<SEG.length-1;i++){if(SEG[i+1][0]-SEG[i][1]>=T){cut=SEG[i][1]+T;k=i;break}}const premature=cut!==null;if(!premature)cut=SEG[SEG.length-1][1]+T;
  const W=520,X=t=>20+t/6600*(W-40);let s=`<svg viewBox="0 0 ${W} 110" style="width:100%;max-width:560px;display:block;margin:0 auto" role="img"><line x1="20" y1="60" x2="${W-20}" y2="60" stroke="var(--rule)"/>`;
  SEG.forEach(([a,b],i)=>{s+=`<rect x="${X(a)}" y="44" width="${X(b)-X(a)}" height="32" rx="5" fill="${premature&&i>k?'var(--rose-soft)':'var(--green-soft)'}" stroke="${premature&&i>k?'var(--rose)':'var(--green)'}"/>`;if(i<SEG.length-1)s+=`<text x="${(X(b)+X(SEG[i+1][0]))/2}" y="94" font-size="10.5" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${SEG[i+1][0]-b}ms</text>`});
  s+=`<line x1="${X(cut)}" y1="28" x2="${X(cut)}" y2="86" stroke="var(--rose)" stroke-width="2.5"/><text x="${X(cut)}" y="22" font-size="11" text-anchor="middle" fill="var(--rose)" font-family="Noto Sans">endpoint</text>`;
  for(let t=0;t<=6000;t+=1000)s+=`<text x="${X(t)}" y="108" font-size="9.5" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${t/1000}s</text>`;
  $('#epSvg').innerHTML=s+'</svg>';
  $('#epCalc').textContent=premature?`a ${SEG[k+1][0]-SEG[k][1]} ms mid-turn pause ≥ threshold → the system declares the end at ${(cut/1000).toFixed(2)} s\n✗ premature: it cuts the user off (red speech is lost or interrupted)`:`no internal pause reaches ${T} ms → the end is detected ${T} ms after the user really stops (${(cut/1000).toFixed(2)} s)\n✓ correct, with a response latency of ${T} ms`+(T>700?' (humans usually respond almost immediately)':'')}
$('#epT').addEventListener('input',drawEP);drawEP();

/* ---------- speech acts ---------- */
const SA=[['CONSTATIVES','committing the speaker to something’s being the case','answering, claiming, confirming, denying, disagreeing, stating','إخباري'],['DIRECTIVES','attempts by the speaker to get the addressee to do something','advising, asking, forbidding, inviting, ordering, requesting','توجيهي'],['COMMISSIVES','committing the speaker to some future course of action','promising, planning, vowing, betting, opposing','إلزامي'],['ACKNOWLEDGMENTS','express the speaker’s attitude regarding the hearer with respect to some social action','apologizing, greeting, thanking, accepting an acknowledgment','تسليمي']];
const SQ=[['Turn up the music.',1],['I need to travel in May.',0],['Thanks!',3],['I promise to call you tomorrow.',2],['What day in May did you want to travel?',1],['Sorry I’m late.',3],['I bet it will rain.',2],['Seattle.',0]];
let saI=0,saQ=0,saOk=0,saN=0;
$('#saBtns').innerHTML=SA.map((s,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${s[3]} · ${s[0].toLowerCase()}</button>`).join('');
$('#saAns').innerHTML=SA.map((s,i)=>`<button class="btn" data-a="${i}">${s[3]}</button>`).join('');
function drawSA(){$$('#saBtns button').forEach((b,j)=>b.classList.toggle('pri',j===saI));const s=SA[saI];$('#saCalc').textContent=`${s[0]}: ${s[1]}\n(${s[2]})`;$('#saQ').textContent=SQ[saQ][0]}
$$('#saBtns button').forEach(b=>b.addEventListener('click',()=>{saI=+b.dataset.i;drawSA()}));
$$('#saAns button').forEach(b=>b.addEventListener('click',()=>{const a=+b.dataset.a,c=SQ[saQ][1];saN++;if(a===c)saOk++;$('#saRes').textContent=`“${SQ[saQ][0]}” → ${SA[c][3]} (${SA[c][0].toLowerCase()}) ${a===c?'✓':'✗ you chose '+SA[a][3]}\nscore ${saOk}/${saN} · next utterance shown above`;saQ=(saQ+1)%SQ.length;drawSA()}));
drawSA();$('#saRes').textContent='choose a class for the utterance above (our examples)';

/* ---------- grounding continuum ---------- */
const GR=[['Continued attention','B shows she is continuing to attend and therefore remains satisfied with A’s presentation.','(silent, attentive listening)'],['Next contribution','B starts in on the next relevant contribution.','A4: “And you’re flying into what city?” (the “And” continues)'],['Acknowledgment','B nods or says a continuer like uh-huh, yeah, or the like, or an assessment like that’s great.','“C: He wants to fly from Boston to Baltimore / A: Uh huh”'],['Demonstration','B demonstrates all or part of what she has understood A to mean, for example, by reformulating (paraphrasing) A’s utterance or by collaborative completion of A’s utterance.','(ours) “So you want a non-stop?”'],['Display','B displays verbatim all or part of A’s presentation.','A12: “On the 11th?” · A2 repeats “in May”']];
let grI=4;
function drawGR(){$('#grBars').innerHTML='<div class="bars">'+GR.map((g,i)=>`<div class="br${i===grI?' pick':''}" data-i="${i}" style="cursor:pointer;grid-template-columns:150px minmax(0,1fr) 30px"><span class="w0" style="font-size:12.5px">${g[0]}</span><span class="tr"><span class="fl" style="display:block;width:${(i+1)*20}%;background:${i===grI?'var(--amber)':'var(--math)'}"></span></span><span class="v">${i+1}</span></div>`).join('')+'</div>';
  $$('#grBars .br').forEach(b=>b.addEventListener('click',()=>{grI=+b.dataset.i;drawGR()}));const g=GR[grI];$('#grCalc').textContent=`${g[0]} (strength ${grI+1}/5): ${g[1]}\nexample: ${g[2]}`}
drawGR();

/* ---------- side sequences ---------- */
const SS=[[[0,'A16: OK. There’s #two non-stops . . . #','REQUEST pending: return flights on May 15'],[1,'C17: #Act. . . actually #, what day of the week is the 15th?','QUESTION (interrupts)'],[1,'A18: It’s a Friday.','ANSWER'],[0,'C19: Uh hmm. I would consider staying there an extra day til Sunday.','back to the main task: plan change'],[0,'A20: OK. . . OK. On Sunday I have . . .','search resumes, now for the 17th']],'correction subdialogue (Litman 1985): C17–A18 is nested inside the flight search; the agent must also infer the new plan from C19',
  [[0,'User: What do you have going to UNKNOWN WORD on the 5th?','REQUEST (first pair part)'],[1,'System: Let’s see, going where on the 5th?','CLARIFICATION QUESTION'],[1,'User: Going to Hong Kong.','clarification answer'],[0,'System: OK, here are some flights...','RESPONSE (second pair part)']],'clarification subdialogue between a REQUEST and its RESPONSE, typically triggered by a speech recognition error',
  [[1,'User: Can you make train reservations?','PRESEQUENCE: asks about capabilities'],[1,'System: Yes I can.',''],[0,'User: Great, I’d like to reserve a seat on the 4pm train to New York.','the actual REQUEST']],'presequence: a question about the system’s capabilities before the request',
  [[0,'Q: What day in May did you want to travel?','QUESTION → expects ANSWER'],[0,'A: …from the 12th to the 15th.','ANSWER'],[0,'Proposal: How about the 5:55 flight?','PROPOSAL → ACCEPTANCE / REJECTION (ours)'],[0,'Acceptance: Sounds good.',''],[0,'Compliment: Nice jacket!','COMPLIMENT → DOWNPLAYER'],[0,'Downplayer: Oh, this old thing?','']],'adjacency pairs (Schegloff 1968): a first pair part sets up an expectation for a second pair part'];
function drawSS(){const i=+segVal('#ssS','i'),L=SS[2*i];$('#ssOut').innerHTML=L.map(([d,t,lab])=>`<div style="margin-left:${d*34}px;${d?'border-left:3px solid var(--amber);padding-left:8px':''}">${esc(t)} ${lab?`<span class="mono" style="font-size:11px;color:var(--math)">${esc(lab)}</span>`:''}</div>`).join('');$('#ssCalc').textContent=SS[2*i+1]}
segOn('#ssS',drawSS);drawSS();

/* ---------- implicature ---------- */
const IM=['A2 asks: “what day in May did you want to travel?”','C3 replies: “I need to be there for a meeting that’s from the 12th to the 15th.” Not literally an answer!','Maxim of relevance: speakers try to be relevant, so there must be some relevance in mentioning this meeting. What could it be?','One precondition for having a meeting (at least before Web conferencing) is being where it is held → the meeting is probably the reason for the trip.','People like to arrive the day before a meeting.','So the flight should be on the 11th. (And in C11 the client indeed takes “the 5ish flight on the night before on the 11th”.)'];
let imK=1;
function drawIM(){$('#imOut').innerHTML=IM.slice(0,imK).map((t,i)=>`<div style="padding:6px 10px;margin:4px 0;border-radius:8px;background:var(--${i===imK-1?'green':'tint'}${i===imK-1?'-soft':''});border-inline-start:3px solid var(--${i<2?'math':'green'})" dir="ltr"><b class="mono">${i+1}.</b> ${esc(t)}</div>`).join('')}
$('#imNext').addEventListener('click',()=>{if(imK<IM.length)imK++;drawIM()});$('#imReset').addEventListener('click',()=>{imK=1;drawIM()});drawIM();

/* ---------- Verbmobil ---------- */
const VB=[['THANK','Thanks'],['GREET','Hello Dan'],['INTRODUCE','It’s me again'],['BYE','Alright bye'],['REQUEST-COMMENT','How does that look?'],['SUGGEST','from thirteenth through seventeenth June'],['REJECT','No Friday I’m booked all day'],['ACCEPT','Saturday sounds fine'],['REQUEST-SUGGEST','What is a good day of the week for you?'],['INIT','I wanted to make an appointment with you'],['GIVE_REASON','Because I have meetings all afternoon'],['FEEDBACK','Okay'],['DELIBERATE','Let me check my calendar here'],['CONFIRM','Okay, that would be wonderful'],['CLARIFY','Okay, do you mean Tuesday the 23rd?'],['DIGRESS','[we could meet for lunch] and eat lots of ice cream'],['MOTIVATE','We should go to visit our subsidiary in Munich'],['GARBAGE','Oops, I-']];
$('#vbTab').innerHTML='<tr><th>Tag</th><th>Example</th></tr>'+VB.map(v=>`<tr><td class="mono">${v[0]}</td><td>${esc(v[1])}</td></tr>`).join('');

/* ---------- HIS dialogue ---------- */
const HS=[['U','Hi, I am looking for somewhere to eat.','hello(task = find,type=restaurant)'],['S','You are looking for a restaurant. What type of food do you like?','confreq(type = restaurant, food)'],['U','I’d like an Italian somewhere near the museum.','inform(food = Italian, near=museum)'],['S','Roma is a nice Italian restaurant near the museum.','inform(name = "Roma", type = restaurant, food = Italian, near = museum)'],['U','Is it reasonably priced?','confirm(pricerange = moderate)'],['S','Yes, Roma is in the moderate price range.','affirm(name = "Roma", pricerange = moderate)'],['U','What is the phone number?','request(phone)'],['S','The number of Roma is 385456.','inform(name = "Roma", phone = "385456")'],['U','Ok, thank you goodbye.','bye()']];
const VAL={hello:[1,1,'Open a dialogue and give info'],inform:[1,1,'Give info'],request:[1,1,'Request value for a given b = x'],reqalts:[0,1,'Request alternative'],confirm:[1,1,'Explicitly confirm'],confreq:[1,0,'Implicitly confirm a = x, ... and request value of d'],select:[1,0,'(see note)'],affirm:[1,1,'Affirm and give further info'],negate:[0,1,'Negate and give corrected value'],deny:[0,1,'Deny that a = x'],bye:[1,1,'Close a dialogue']};
let hsI=1;
function drawHS(){$('#hsTab').innerHTML='<tr><th></th><th>Utterance</th><th>Dialogue act</th></tr>'+HS.map((h,i)=>`<tr data-i="${i}" style="cursor:pointer;${i===hsI?'background:var(--green-soft)':''}"><td class="mono">${h[0]}</td><td>${esc(h[1])}</td><td class="mono" style="font-size:12.5px">${esc(h[2])}</td></tr>`).join('');
  $$('#hsTab tr[data-i]').forEach(r=>r.addEventListener('click',()=>{hsI=+r.dataset.i;drawHS()}));
  const [sp,u,a]=HS[hsI],m=a.match(/^(\w+)\((.*)\)$/),act=m[1],args=m[2].split(/,\s*(?=\w+\s*=|\w+$)/).map(x=>x.trim()).filter(Boolean),v=VAL[act];
  $('#hsCalc').textContent=`speaker: ${sp==='U'?'user':'system'} · act: ${act.toUpperCase()} — ${v[2]}\nslots: ${args.length?args.map(x=>x.includes('=')?x.replace(/\s*=\s*/,' = '):x+' = ?  (value requested)').join(' · '):'(none)'}\nvalid as system output: ${v[0]?'✓':'χ'} · valid as user input: ${v[1]?'✓':'χ'}  ${(sp==='S'&&v[0])||(sp==='U'&&v[1])?'(consistent with Fig. 26.3)':'(!)'}`}
drawHS();

/* ---------- glossary ---------- */
const GL=[['الدور','turn','مساهمة واحدة من متكلم واحد.'],['تحديد نهاية الكلام','endpointing / endpoint detection','اكتشاف أن المستخدم انتهى من الكلام.'],['فعل الكلام','speech act','القول بوصفه فعلاً يؤديه المتكلم.'],['إخباري / توجيهي / إلزامي / تسليمي','constative / directive / commissive / acknowledgment','أصناف باخ وهارنيش الأربعة.'],['الأرضية المشتركة','common ground','ما يتفق عليه المتحاوران.'],['التأسيس','grounding','إقرار السامع بأنه فهم.'],['العرض / القبول','presentation / acceptance','مرحلتا المساهمة عند كلارك وشيفر.'],['المواصِل / القناة الخلفية','continuer / backchannel','uh-huh: إقرار قصير لا يتطلب ردّاً.'],['تحليل المحادثة','conversation analysis','دراسة البنية المحلية بين أفعال الكلام.'],['الزوج المتجاور','adjacency pair','جزء أول يُنشئ توقعاً لجزء ثانٍ.'],['التسلسل الجانبي / الحوار الفرعي','side sequence / subdialogue','تبادل يفصل جزأي الزوج.'],['المسبِّق','presequence','سؤال تمهيدي قبل الطلب.'],['المبادرة','initiative','من يقود المحادثة: النظام، أو المستخدم، أو مختلطة.'],['الاستلزام الحواري','conversational implicature','استنتاجات مسوَّغة تتجاوز الكلمات.'],['قاعدة الصلة','maxim of relevance','المتكلم يحاول أن يكون ذا صلة.'],['فعل الحوار','dialogue act','وسم الوظيفة التفاعلية للقول.'],['الخانة','slot','معلومة يطلبها الحوار أو ينقلها (food، phone).'],['DAMSL','Dialogue Act Markup in Several Layers','وظائف أمامية وخلفية لكل قول.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
