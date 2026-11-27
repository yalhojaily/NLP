/* Arabic track · Lesson 5: language models for Arabic */
const SECS=[['a5-1','1','التفرق'],['a5-2','2','المرمِّزات العربية'],['a5-3','3','النماذج الكبيرة العربية'],['ex','','للمراجعة']];
const GL=[['خارج المفردات','out-of-vocabulary (OOV)','رمز في الاختبار لم يظهر في التدريب.'],['التفرق','sparsity','قلة مرات ظهور أكثر الأنواع في البيانات.'],['الثنائية غير المرئية','unseen bigram','زوج متجاور لم يظهر في التدريب.'],['التنعيم','smoothing','إعطاء احتمال صغير لما لم يُرَ.'],['النموذج المقنَّع','masked language model','نموذج يستعيد رموزاً مخفية من السياق.'],['تنوّع اللغة','language variant','فصحى حديثة، لهجات، عربية تراثية.'],['التدريب من الصفر','training from scratch','تدريب نموذج بأوزان عشوائية في البداية.'],['مواصلة التدريب المسبق','continual pretraining','متابعة تدريب نموذج قائم على بيانات جديدة.'],['مزج البيانات','data mixture','نسب اللغات والمصادر في بيانات التدريب.'],['المعيار','benchmark','مجموعة اختبار قياسية لمقارنة النماذج.']];
initPage(SECS,GL);

/* ---------- sparsity ---------- */
const TR=['و+ذهب ال+ولد إلى ال+مدرسة ب+ال+سيارة','و+كتب ال+طالب ال+درس في ال+دفتر','ف+قرأ+ه ال+معلم و+شكر+ه','س+يكتب ال+طلاب ال+دروس غدا','و+س+يكتبون+ها في ال+مكتبة','ال+كتاب على ال+طاولة و+ال+قلم في ال+حقيبة','ذهب+نا إلى ال+مكتبة و+قرأ+نا ال+كتب','ال+معلمة شكرت ال+طالبات ل+أن+هن كتبن ال+درس','و+ب+ال+أمس زار+نا ال+مدرسة','ف+كتب+ت ال+رسالة ب+ال+قلم'];
const TE=['و+كتب+ت ال+معلمة ال+رسالة','س+يذهب ال+طلاب إلى ال+مكتبة غدا','ف+قرأ+نا+ها في ال+بيت','و+ال+طالبة شكرت ال+معلم'];
// segmented tokens: keep a marker so "و+" (prefix) differs from a standalone word
function seg(w){const p=w.split('+');if(p.length===1)return p;let st=0;p.forEach((x,i)=>{if(x.length>=3&&!st)st=i});return p.map((x,i)=>i<st?x+'+':i>st?'+'+x:x)}
const toks=(s,m)=>s.split(' ').flatMap(w=>m?seg(w):[w.replace(/\+/g,'')]);
function drawSP(){const m=+segVal('#spM','m');const V=new Set(TR.flatMap(s=>toks(s,m)));const B=new Set();TR.forEach(s=>{const t=['<s>',...toks(s,m)];t.forEach((x,i)=>{if(i)B.add(t[i-1]+'|'+x)})});
  let n=0,oov=0,nb=0,ub=0;const html=TE.map(s=>{const t=toks(s,m);const tt=['<s>',...t];tt.forEach((x,i)=>{if(i){nb++;if(!B.has(tt[i-1]+'|'+x))ub++}});return '<div>'+t.map(x=>{n++;const o=!V.has(x);if(o)oov++;return chip(x,o?'rose':'green')}).join('')+'</div>'}).join('');
  $('#spOut').innerHTML=html;
  $('#spBars').innerHTML='<div class="bars">'+bar('OOV tokens',oov/n,1,(oov/n*100).toFixed(0)+'%','var(--rose)')+bar('unseen bigrams',ub/nb,1,(ub/nb*100).toFixed(0)+'%','var(--amber)')+'</div>';
  $('#spCalc').textContent=`${m?'segmented':'orthographic words'} · training vocabulary: ${V.size} types\ntest: ${n} tokens, ${oov} never seen in training → OOV = ${(oov/n*100).toFixed(1)}%\nbigrams: ${ub}/${nb} unseen → ${(ub/nb*100).toFixed(1)}%  (an unsmoothed bigram model gives each a probability of 0)\nrose = unseen in training`}
segOn('#spM',drawSP);drawSP();

/* ---------- Arabic models table ---------- */
const LL=[['AraBERT','2020','مرمِّز (BERT)','AUB MIND Lab (الجامعة الأمريكية في بيروت)','نماذج مقنَّعة عربية؛ بعض نسخها يقطّع النص صرفياً (Farasa) قبل التدريب.','https://huggingface.co/aubmindlab/bert-base-arabertv2'],
 ['CAMeLBERT','2021','مرمِّز (BERT)','CAMeL Lab (جامعة نيويورك أبوظبي)','نسخ مفصولة للفصحى الحديثة واللهجات والعربية التراثية، ونسخة مختلطة.','https://huggingface.co/CAMeL-Lab'],
 ['Jais','2023','مفكِّك (GPT)','Inception (G42) وMBZUAI وCerebras','نموذج عربي-إنجليزي مدرَّب من الصفر.',''],
 ['ALLaM','2024','مفكِّك','المركز الوطني للذكاء الاصطناعي، سدايا (الرياض)','أحجام 7 و13 و70 مليار: مواصلة تدريب من أوزان Llama-2، ونموذج 7 مليارات من الصفر.','https://arxiv.org/abs/2407.15390'],
 ['فنار Fanar','2025','مفكِّك','QCRI، جامعة حمد بن خليفة (قطر)','Fanar Star (~7 مليارات) من الصفر على نحو تريليون رمز، وFanar Prime (~9 مليارات) مواصلة تدريب من Gemma-2؛ مقطِّع MorphBPE.','https://arxiv.org/abs/2501.13944'],
 ['Jais 2','2026','مفكِّك','MBZUAI وCerebras وInception','حجما 8 و70 ملياراً، مدرَّبان من الصفر.','https://arxiv.org/abs/2608.13580'],
 ['Jais 3','2026','مفكِّك (منها MoE)','معهد النماذج الأساسية في MBZUAI وCerebras وInception42','ستة نماذج من 0.9 إلى 375 مليار معامل، بمواصلة تدريب K2 Horizon، وموجَّهة للمهام الوكيلة بالعربية.','https://arxiv.org/abs/2611.10224']];
let llI=4;
function drawLL(){$('#llTab').innerHTML='<tr><th>النموذج</th><th>السنة</th><th>النوع</th><th>الجهة</th></tr>'+LL.map((r,i)=>`<tr data-i="${i}" style="cursor:pointer;${i===llI?'background:var(--green-soft)':''}"><td><b>${r[0]}</b></td><td class="mono">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
  $$('#llTab tr[data-i]').forEach(t=>t.addEventListener('click',()=>{llI=+t.dataset.i;drawLL()}));const r=LL[llI];
  $('#llCalc').textContent=`${r[0]} (${r[1]}): ${r[4]}`+(r[5]?`\nsource: ${r[5]}`:'')+(/من الصفر/.test(r[4])&&/مواصلة/.test(r[4])?'\nboth strategies in one family':/مواصلة/.test(r[4])?'\nstrategy: continual pretraining':/من الصفر/.test(r[4])?'\nstrategy: from scratch':'')}
drawLL();
