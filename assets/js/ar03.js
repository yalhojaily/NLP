/* Arabic track · Lesson 3: root and pattern morphology */
const SECS=[['a3-1','1','الجذر والوزن'],['a3-2','2','انفجار الصيغ'],['a3-3','3','التحليل وإزالة الغموض'],['a3-4','4','في البحث'],['ex','','للمراجعة']];
const GL=[['الجذر','root','الحروف الأصلية للكلمة، غالباً ثلاثة.'],['الوزن','pattern / template','قالب من حركات وزوائد تُصبّ فيه حروف الجذر.'],['الصرف غير التسلسلي','non-concatenative morphology','بناء الكلمة بتشبيك جذر ووزن لا بلصق زوائد فقط.'],['جمع التكسير','broken plural','جمع بتغيير الوزن: كتاب ← كُتُب.'],['التصريف','inflection','تغيير الكلمة بالسمات النحوية (الشخص، العدد…).'],['الاشتقاق','derivation','توليد كلمة جديدة المعنى من الجذر.'],['اللِّمّة','lemma','الصيغة المعجمية الأساسية للكلمة.'],['المحلل الصرفي','morphological analyzer','يعطي كل التحليلات الممكنة للكلمة.'],['إزالة الغموض الصرفي','morphological disambiguation','اختيار التحليل الأرجح من السياق.'],['التجذيع الخفيف','light stemming','نزع السوابق واللواحق الشائعة فقط.'],['استخراج الجذر','root extraction','رد الكلمة إلى جذرها.'],['التفرق','sparsity','كثرة الأنواع النادرة أو غير المرئية في البيانات.']];
initPage(SECS,GL);

/* ---------- root x pattern ---------- */
const RT=[['ك','ت','ب','الكتابة'],['د','ر','س','الدرس'],['ع','ل','م','العلم'],['ف','ت','ح','الفتح'],['ج','ل','س','الجلوس'],['ق','ت','ل','القتل']];
const PT=[['فاعِل','اسم الفاعل: من يقوم بالفعل'],['مَفْعُول','اسم المفعول: من وقع عليه الفعل'],['فِعال','اسم (معانٍ متنوعة)'],['مَفْعَل','اسم مكان أو مصدر'],['مَفْعَلة','اسم مكان غالباً'],['مِفْعال','اسم آلة'],['فَعَّلَ','فعل مزيد (II): تكثير أو تعدية'],['تَفاعَلَ','فعل مزيد (VI): مشاركة'],['اسْتَفْعَلَ','فعل مزيد (X): طلب'],['مُفاعَلة','مصدر (III): مشاركة']];
// status per root per pattern: y common, r rare/limited, n not used ; gloss
const ST=[
 [['y','الكاتب'],['y','المكتوب، الرسالة'],['y','ما يُقرأ'],['y','الطاولة أو الإدارة'],['y','دار الكتب'],['n',''],['r','جهّز الكتائب (نادر بهذا المعنى)'],['y','تراسلا'],['y','طلب منه أن يكتب'],['y','المراسلة']],
 [['y','الدارس'],['y','المدروس، المتأنّى فيه'],['n','(المستعمل: دِراسة)'],['n',''],['y','مكان الدرس'],['n',''],['y','علّم'],['y','درسوا معاً'],['n',''],['y','الدرس المشترك']],
 [['y','العالِم'],['y','المعروف'],['n',''],['y','العلامة، الأثر'],['r',''],['n',''],['y','درّس'],['r','ادّعى العلم'],['y','استفسر'],['n','']],
 [['y','الفاتح'],['y','غير المغلق'],['n',''],['r',''],['n',''],['y','آلة الفتح'],['y','فتح كثيراً'],['r','تبادلا الحديث'],['y','بدأ، طلب الفتح'],['y','المبادأة بالحديث']],
 [['y','القاعد'],['n','الفعل لازم: لا اسم مفعول'],['n',''],['n','(المستعمل: مَجْلِس بكسر اللام)'],['n',''],['n',''],['n',''],['r','جلسوا معاً'],['n',''],['y','المصاحبة في الجلوس']],
 [['y','من قتل'],['y','من قُتل'],['y','الحرب، المعركة'],['y','موضع القتل'],['r','المذبحة'],['r',''],['y','أكثر القتل'],['y','اقتتلوا'],['y','قاتل حتى الموت'],['y','القتال']]];
let rpI=0;
$('#rpR').innerHTML=RT.map((r,i)=>`<button data-i="${i}" class="${i===0?'on':''}" style="font-size:17px">${r.slice(0,3).join(' ')}</button>`).join('');
const fill=(p,r)=>p.replace(/ف/g,'\u0001').replace(/ع/g,'\u0002').replace(/ل/g,'\u0003').replace('\u0001',r[0]).replace('\u0002',r[1]).replace('\u0003',r[2]);
function drawRP(){const i=+segVal('#rpR','i'),r=RT[i];let c={y:0,r:0,n:0};
  $('#rpTab').innerHTML='<tr><th>الوزن</th><th>الكلمة المولَّدة</th><th>الاستعمال</th><th>المعنى</th><th>وظيفة الوزن</th></tr>'+PT.map(([p,f],k)=>{const [s,g]=ST[i][k];c[s]++;const w=fill(p,r);
    return `<tr style="${s==='n'?'color:var(--soft)':''}"><td style="font-family:'Noto Naskh Arabic',serif;font-size:19px">${p}</td><td style="font-family:'Noto Naskh Arabic',serif;font-size:22px;${s==='n'?'text-decoration:line-through':''}">${w}</td><td style="font-weight:700;color:var(--${s==='y'?'green':s==='r'?'amber':'rose'})">${s==='y'?'مستعمل':s==='r'?'نادر':'غير مستعمل'}</td><td>${esc(g)}</td><td class="note" style="margin:0">${f}</td></tr>`}).join('');
  $('#rpCalc').textContent=`root ${r.slice(0,3).join(' ')} (field: ${r[3]}) × ${PT.length} patterns = ${PT.length} mechanical outputs\ncommon: ${c.y} · rare: ${c.r} · not used: ${c.n}\nthe pattern carries the function; the root carries the meaning field`}
segOn('#rpR',drawRP);drawRP();

/* ---------- explosion ---------- */
const FORMS=[['ماضٍ',13,1,0],['مضارع مرفوع',13,1,1],['مضارع منصوب',13,1,0],['مضارع مجزوم',13,1,0],['أمر',5,0,0]]; // [name, pngs, hasPassive, takesFuture]
const EXF=[['voice','البناء للمجهول (ما عدا الأمر)'],['conj','حرف العطف: لا، و، ف (×3)'],['fut','حرف الاستقبال س مع المضارع المرفوع'],['obj','ضمير المفعول: لا شيء + 12 ضميراً (للمعلوم فقط)']];
$('#exF').innerHTML='<div class="row" style="flex-wrap:wrap;gap:6px 16px">'+EXF.map(f=>`<label class="note"><input type="checkbox" data-f="${f[0]}" checked> ${f[1]}</label>`).join('')+'</div>';
function drawEX(){const on=Object.fromEntries($$('#exF input').map(x=>[x.dataset.f,x.checked]));let tot=0,lines=[];
  FORMS.forEach(([n,k,pas,fut])=>{const voices=on.voice&&pas?[1,0]:[1];voices.forEach(act=>{let m=k*(on.conj?3:1)*(on.fut&&fut?2:1)*(on.obj&&act?13:1);tot+=m;lines.push(`${n}${act?'':' (مجهول)'}: ${k} × ${on.conj?3:1} × ${on.fut&&fut?2:1} × ${on.obj&&act?13:1} = ${m}`)})});
  $('#exBars').innerHTML='<div class="bars">'+bar('فعل عربي واحد',tot,Math.max(tot,5),tot.toLocaleString('en'),'var(--amber)')+bar('write (English)',5,Math.max(tot,5),'5','var(--math)')+'</div>';
  $('#exCalc').textContent=lines.join('\n')+`\ntotal ≈ ${tot.toLocaleString('en')} analyses for ONE verb (forms × conjunction × future × object pronoun)\n(13 = person-number-gender combinations; our rough estimate, many analyses share the same spelling)`}
$$('#exF input').forEach(x=>x.addEventListener('change',drawEX));drawEX();

/* ---------- analyses of علم ---------- */
const AN=[['عِلْم','عِلْم','فِعْل','اسم (مصدر)','المعرفة'],['عَلَم','عَلَم','فَعَل','اسم','الراية'],['عَلِمَ','عَلِمَ','فَعِلَ','فعل ماضٍ معلوم','عرف'],['عُلِمَ','عَلِمَ','فُعِلَ','فعل ماضٍ مجهول','عُرف'],['عَلَّمَ','عَلَّمَ','فَعَّلَ','فعل ماضٍ معلوم','درّس'],['عُلِّمَ','عَلَّمَ','فُعِّلَ','فعل ماضٍ مجهول','دُرِّس']];
const AS=[['العلم نور',0,'مبتدأ معرّف خبره «نور»: اسم لا فعل؛ والمعنى المجازي يرجّح المعرفة على الراية.'],['رفع الجنود العلم على السارية',1,'مفعول «رفع»، ومكانه «السارية»: الراية.'],['علم الطالب بنجاحه',2,'فعل في أول الجملة بعده فاعل، و«علم بالشيء» يتعدى بالباء.'],['علم المعلم الطلاب القراءة',4,'مفعولان (الطلاب، القراءة): «علّم» يتعدى إلى مفعولين.'],['علم الخبر قبل إعلانه',3,'«الخبر» هو ما عُرف، ولا ذكر لمن عرفه: الأرجح المبني للمجهول (والجملة بلا حركات تحتمل غيره).']];
$('#anS').innerHTML=AS.map((s,i)=>`<button data-i="${i}" class="${i===0?'on':''}">${s[0]}</button>`).join('');
function drawAN(){const [s,k,cue]=AS[+segVal('#anS','i')];
  $('#anTab').innerHTML='<tr><th>التشكيل</th><th>اللِّمّة</th><th>الوزن</th><th>قسم الكلام</th><th>المعنى</th></tr>'+AN.map((a,i)=>`<tr style="${i===k?'background:var(--green-soft);font-weight:600':''}"><td style="font-family:'Noto Naskh Arabic',serif;font-size:21px">${a[0]}</td><td style="font-family:'Noto Naskh Arabic',serif">${a[1]}</td><td style="font-family:'Noto Naskh Arabic',serif">${a[2]}</td><td>${a[3]}</td><td>${a[4]}</td></tr>`).join('');
  $('#anCalc').textContent=`analyzer: 6 analyses for the undiacritized word علم (root ع ل م)\ndisambiguator picks: ${AN[k][0]} (${AN[k][3]})\ncue: ${cue}`}
segOn('#anS',drawAN);drawAN();

/* ---------- light stemming vs root ---------- */
const LW=['كتاب','الكتاب','كتابه','كتب','مكتب','مكتبة','كاتب','مكتوب','والكتابة','كتابة'];
const REL=new Set(['كتاب','الكتاب','كتابه','كتب']);
const PRE=['وال','بال','كال','فال','لل','ال','و'],SUF=['ها','ان','ات','ون','ين','يه','ية','ه','ة','ي'];
function light(w){for(const p of PRE)if(w.startsWith(p)&&w.length-p.length>=3){w=w.slice(p.length);break}for(const s of SUF)if(w.endsWith(s)&&w.length-s.length>=3){w=w.slice(0,-s.length);break}return w}
function drawLS(){const m=+segVal('#lsM','m'),q='كتاب';const hit=w=>m===0?w===q:m===1?light(w)===light(q):true;
  const H=LW.filter(hit),tp=H.filter(w=>REL.has(w)).length;
  $('#lsOut').innerHTML=LW.map(w=>{const h=hit(w),r=REL.has(w);return `<span class="archip" style="background:var(--${h?(r?'green':'rose'):'paper'}${h?'-soft':''});border-color:var(--${h?(r?'green':'rose'):r?'amber':'rule'})">${w}${m===1?`<sub style="color:var(--soft)">${light(w)}</sub>`:''}${!h&&r?'<sub style="color:var(--amber)">فاتنا</sub>':''}</span>`}).join(' ');
  $('#lsCalc').textContent=`retrieved ${H.length} · relevant among them ${tp} · relevant in total ${REL.size}\nprecision = ${tp}/${H.length} = ${r2(tp/H.length)} · recall = ${tp}/${REL.size} = ${r2(tp/REL.size)}\ngreen = correct hit · rose = wrong hit · amber = missed`+(m===1?'\nlight stemming misses the broken plural كتب and wrongly joins كتابة (writing)':m===2?'\nall share the root ك ت ب: recall is perfect, but مكتب, كاتب… are not books':'')}
segOn('#lsM',drawLS);drawLS();
