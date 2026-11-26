/* Arabic track · Lesson 9: meaning, reference, sentiment */
const SECS=[['a9-1','١','الترجمة'],['a9-2','٢','الكيانات المسمّاة'],['a9-3','٣','الإحالة'],['a9-4','٤','المشاعر'],['ex','','للمراجعة']];
const GL=[['الجنس النحوي','grammatical gender','تذكير الكلمة وتأنيثها.'],['التحيز الجنسي في الترجمة','gender bias in MT','اختيار جنس افتراضي (غالباً المذكر) عند غياب الدليل.'],['التعرّف على الكيانات','named entity recognition','وسم أسماء الأشخاص والأماكن والمنظمات.'],['الحرف الكبير','capitalization','خاصية قوية للأعلام في الإنجليزية، غائبة في العربية.'],['الضمير المتصل','clitic pronoun','ضمير ملتصق: ـه، ـها، ـهم.'],['الضمير المستتر','zero pronoun','فاعل غير ملفوظ.'],['اكتشاف الإشارات','mention detection','إيجاد العبارات المحيلة.'],['معجم المشاعر','sentiment lexicon','قائمة كلمات بقطبيتها.'],['مطابقة اللِّمّة','lemma matching','مطابقة الصيغة الأساسية لا الصيغة المكتوبة.'],['نطاق النفي','negation scope','الكلمات التي يقلب النفي قطبيتها.'],['ArSenL','Arabic Sentiment Lexicon','معجم مشاعر عربي واسع (٢٠١٤).']];
initPage(SECS,GL);

/* ---------- MT decisions ---------- */
const MT=[['You are late.',[['أنتَ متأخر','مخاطَب مذكر مفرد'],['أنتِ متأخرة','مخاطَبة مؤنثة مفردة'],['أنتما متأخران / متأخرتان','مثنى'],['أنتم متأخرون','جمع مذكر أو مختلط'],['أنتنّ متأخرات','جمع مؤنث']],'gender and number of the addressee','absent from the sentence: needs the conversation context'],
 ['The doctor said she would come.',[['قالت الطبيبة إنها ستأتي','الطبيب امرأة (she تعود إليها)'],['قال الطبيب إنها ستأتي','she امرأة أخرى']],'gender of the doctor','present, but only if “she” is linked to “the doctor” (coreference)'],
 ['The doctor arrived.',[['وصل الطبيب','افتراض المذكر'],['وصلت الطبيبة','افتراض المؤنث']],'gender of the doctor','absent: a system usually defaults to the masculine (a gender-bias risk)'],
 ['I am tired.',[['أنا متعب','المتكلم رجل'],['أنا متعبة','المتكلمة امرأة']],'gender of the speaker','absent: depends on who is speaking'],
 ['The students wrote.',[['كتب الطلاب','ذكور أو مختلطون'],['كتبت الطالبات','إناث فقط']],'gender of the group','absent; Arabic uses the masculine plural for mixed groups']];
$('#mtS').innerHTML=MT.map((m,i)=>`<button data-i="${i}" class="${i===0?'on':''}">${m[0]}</button>`).join('');
function drawMT(){const m=MT[+segVal('#mtS','i')];$('#mtTab').innerHTML='<tr><th>الترجمة الممكنة</th><th>متى تصح</th></tr>'+m[1].map(r=>`<tr><td style="font-family:'Noto Naskh Arabic',serif;font-size:20px">${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  $('#mtCalc').textContent=`“${m[0]}” → ${m[1].length} Arabic options\nthe translator must decide: ${m[2]}\nin the source: ${m[3]}`}
segOn('#mtS',drawMT);drawMT();

/* ---------- NER ---------- */
const NE=[[[['التقى',''],['أمل','B-PER'],['و',''],['سعيد','B-PER'],['في',''],['القاهرة','B-LOC']],'after “التقى” and joined by و: two people; القاهرة a known city'],[[['يعيش',''],['على',''],['أمل',''],['سعيد','']],'“on a happy hope”: أمل is a noun and سعيد an adjective agreeing with it'],[[['أعجبني',''],['جمال',''],['الحديقة','']],'جمال in an idafa with الحديقة: “the beauty of the garden”'],[[['ألقى',''],['جمال','B-PER'],['عبد','I-PER'],['الناصر','I-PER'],['خطاباً','']],'a full name of three words, subject of ألقى: one PER entity with B and I tags']];
function drawNE(){const [t,cue]=NE[+segVal('#neS','i')];$('#neOut').innerHTML=t.map(([w,l])=>l?chip(w,l.endsWith('PER')?'green':'math',l):chip(w,'plain')).join(' ');
  $('#neCalc').textContent=`entities: ${t.filter(x=>x[1].startsWith('B')).length}\ncue: ${cue}\n(no capital letters in Arabic: the same word is a name in one sentence and a common word in another)`}
segOn('#neS',drawNE);drawNE();

/* ---------- coreference with clitics ---------- */
const CR=[{m:[['سارةُ','مؤنث مفرد','A'],['أحمدَ','مذكر مفرد','B'],['(هي) فاعل أعطت','مؤنث مفرد','A'],['ـه في أعطته','مذكر مفرد','B'],['ـها في كتابها','مؤنث مفرد','A']],seg:'ف + أعطت + ـه | كتاب + ـها',amb:0,why:'every pronoun is either feminine (→ سارة) or masculine (→ أحمد): agreement resolves everything'},
 {m:[['أحمدُ','مذكر مفرد','A'],['خالداً','مذكر مفرد','B'],['(هو) فاعل أعطى','مذكر مفرد','A?'],['ـه في أعطاه','مذكر مفرد','B?'],['ـه في كتابه','مذكر مفرد','?']],seg:'ف + أعطى + ـه | كتاب + ـه',amb:3,why:'all mentions are masculine singular: agreement decides nothing; preferences (subject continuity, centering) suggest أحمد gave خالد, and كتابه stays truly ambiguous'}];
function drawCR(){const c=CR[+segVal('#crS','i')];$('#crOut').innerHTML='<span class="note">التقطيع: </span>'+c.seg.split('|').map(x=>chip(x.trim(),'plain')).join(' ');
  $('#crTab').innerHTML='<tr><th>الإشارة</th><th>السمات</th><th>السلسلة</th></tr>'+c.m.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td style="font-weight:700;color:var(--${r[2].includes('?')?'amber':r[2]==='A'?'green':'math'})">${r[2].replace('A','سلسلة ١').replace('B','سلسلة ٢').replace(/^\?$/,'ملتبس')}</td></tr>`).join('');
  $('#crCalc').textContent=`${c.m.length} mentions (3 of them hidden in a verb or attached to another word) · ambiguous: ${c.amb}\n${c.why}`}
segOn('#crS',drawCR);drawCR();

/* ---------- sentiment ---------- */
const LEXP=['رائع','جميل','ممتاز'],LEXN=['سيء','مزعج','ممل'];
const REV=['الفيلم رائع والممثلون رائعون','الخدمة سيئة والانتظار مزعج','القصة ليست مملة أبداً','ممتاز! سأعود بالتأكيد','ما أعجبني الفيلم'];
const NEG=new Set(['ليس','ليست','لا','لم','غير','ما']);
function stem(w){w=w.replace(/[ً-ْ]/g,'').replace(/[!؟.،]/g,'').replace(/[أإآ]/g,'ا');for(const p of ['وال','بال','فال','ال','و'])if(w.startsWith(p)&&w.length-p.length>=3){w=w.slice(p.length);break}for(const s of ['ون','ين','ات','ة'])if(w.endsWith(s)&&w.length-s.length>=3){w=w.slice(0,-s.length);break}return w.replace(/ئ$/,'ء')}
function drawSE(){const m=+segVal('#seM','m');let lines=[];
  $('#seOut').innerHTML=REV.map(r=>{const ws=r.split(' ');let sc=0,neg=-9;const h=ws.map((w,i)=>{const k=m?stem(w):w.replace(/[!؟.،]/g,'');if(m===2&&NEG.has(k)){neg=i;return chip(w,'amber','نفي')}
      let p=LEXP.includes(k)?1:LEXN.includes(k)?-1:0;if(p&&m===2&&i-neg<=2){p=-p;sc+=p;return chip(w,p>0?'green':'rose',(p>0?'+':'−')+' بعد النفي')}if(p){sc+=p;return chip(w,p>0?'green':'rose',p>0?'+':'−')}return esc(w)}).join(' ');
    lines.push(sc>0?'+':sc<0?'−':'0');return `<div>${h} <b class="mono" style="color:var(--${sc>0?'green':sc<0?'rose':'soft'})">${sc>0?'+':''}${sc}</b></div>`}).join('');
  const gold=['+','−','+','+','−'];const ok=lines.filter((x,i)=>x===gold[i]).length;
  $('#seCalc').textContent=`predictions: ${lines.join(' ')} · gold: ${gold.join(' ')} → ${ok}/5 correct\n`+['surface match misses رائعون, سيئة, مملة: the lexicon has only the base forms','normalization + light stemming finds the inflected forms, but “ليست مملة” is wrongly negative','negation flips the next 2 words: ليست مملة becomes positive; ما أعجبني still fails (أعجب not in the lexicon)'][m]}
segOn('#seM',drawSE);drawSE();
