/* Arabic track · Lesson 4: diacritics and ambiguity */
const SECS=[['a4-1','١','الحركات الغائبة'],['a4-2','٢','التشكيل الآلي'],['a4-3','٣','كم نشكّل؟'],['ex','','للمراجعة']];
const GL=[['الحركة','diacritic / short vowel','علامة الصائت القصير: فتحة، ضمة، كسرة.'],['السكون','sukun','علامة غياب الصائت.'],['الشدة','shadda','علامة تضعيف الحرف.'],['التنوين','tanween','نون ساكنة زائدة تُكتب حركتين.'],['التشكيل','diacritization','إضافة الحركات إلى النص.'],['الغموض المعجمي','lexical ambiguity','كلمات مختلفة تُكتب بالحروف نفسها.'],['الوسم على مستوى الحرف','character-level tagging','وسم لكل حرف بدل كل كلمة.'],['حركة الإعراب','case ending','حركة آخر الكلمة التي تتبع وظيفتها النحوية.'],['DER','diacritic error rate','نسبة الحروف ذات الحركة الخاطئة.'],['WER','word error rate','نسبة الكلمات التي فيها خطأ واحد على الأقل.'],['التشكيل الجزئي','partial diacritization','تشكيل الكلمات الملتبسة فقط.']];
initPage(SECS,GL);

/* ---------- ambiguity ---------- */
const AM={'عقد':[['عَقْد','اسم','اتفاق مكتوب؛ أو عشر سنين'],['عِقْد','اسم','قلادة'],['عُقَد','اسم (جمع)','جمع عُقْدة'],['عَقَدَ','فعل ماضٍ','ربط؛ أقام (اجتماعاً)'],['عُقِدَ','فعل مجهول','أُقيم (الاجتماع)']],
 'ذهب':[['ذَهَبَ','فعل ماضٍ','مضى'],['ذَهَب','اسم','المعدن الأصفر'],['ذُهِبَ','فعل مجهول','(ذُهِبَ به: أُخذ)']],
 'حب':[['حُبّ','اسم','المحبة'],['حَبّ','اسم','البذور'],['حِبّ','اسم','المحبوب']],
 'قدم':[['قَدَم','اسم','الرِّجل'],['قِدَم','اسم','عكس الحداثة'],['قَدِمَ','فعل ماضٍ','وصل'],['قَدَّمَ','فعل ماضٍ','أعطى؛ جعله أمامه'],['قُدِّمَ','فعل مجهول','أُعطي']],
 'مدرسة':[['مَدْرَسة','اسم','مكان التعليم'],['مُدَرِّسة','اسم','المعلّمة'],['مُدَرَّسة','اسم مفعول','(مادة) تُدرَّس']],
 'كتب':[['كَتَبَ','فعل ماضٍ','خطّ'],['كُتِبَ','فعل مجهول','خُطّ'],['كُتُب','اسم (جمع)','جمع كتاب'],['كَتَّبَ','فعل مزيد','(نادر) جهّز الكتائب']]};
$('#amW').innerHTML=Object.keys(AM).map((w,i)=>`<button data-w="${w}" class="${i===0?'on':''}" style="font-size:18px">${w}</button>`).join('');
function drawAM(){const w=segVal('#amW','w'),R=AM[w];
  $('#amOut').innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">'+R.map(r=>`<div style="border:1px solid var(--rule);border-radius:10px;padding:6px 10px;text-align:center"><div style="font-family:'Noto Naskh Arabic',serif;font-size:30px;line-height:1.7">${r[0]}</div><div class="note" style="margin:0;color:var(--math)">${r[1]}</div><div style="font-size:15px">${r[2]}</div></div>`).join('')+'</div>';
  $('#amCalc').textContent=`“${w}” without diacritics → ${R.length} readings (${R.filter(r=>/فعل/.test(r[1])).length} verbal, ${R.filter(r=>!/فعل/.test(r[1])).length} nominal)\nthe written form alone cannot decide: context (or a model) must`}
segOn('#amW',drawAM);drawAM();

/* ---------- diacritizer evaluation ---------- */
const isD=c=>/[ً-ْٰ]/.test(c);
function parse(w){const L=[];for(const c of w){if(isD(c)&&L.length)L[L.length-1][1]+=c;else L.push([c,''])}return L.map(([c,d])=>[c,[...d].sort().join('')])}
const GOLD='ذَهَبَ الْوَلَدُ إِلَى الْمَدْرَسَةِ صَبَاحًا';
const PRED=[GOLD,'ذَهَبَ الْوَلَدَ إِلَى الْمَدْرَسَةِ صَبَاحًا','ذُهِبَ الْوَلَدُ إِلَى الْمَدْرَسَةِ صَبَاحًا',GOLD.replace(/[ً-ْ]/g,'')];
function drawDZ(){const P=PRED[+segVal('#dzP','i')].split(' '),G=GOLD.split(' ');let n=0,e=0,nx=0,ex=0,we=0,wex=0;
  const rows=G.map((g,k)=>{const a=parse(g),b=parse(P[k]);let err=0,errX=0;
    a.forEach((x,j)=>{const bad=x[1]!==(b[j]||['',''])[1];n++;if(bad)e++,err++;if(j<a.length-1){nx++;if(bad)ex++,errX++}});
    if(err)we++;if(errX)wex++;
    const pv=b.map((x,j)=>{const bad=x[1]!==a[j][1];return bad?`<span style="background:var(--rose-soft);color:var(--rose);border-radius:3px">${x[0]+x[1]}</span>`:x[0]+x[1]}).join('');
    return `<tr><td style="font-family:'Noto Naskh Arabic',serif;font-size:21px">${g}</td><td style="font-family:'Noto Naskh Arabic',serif;font-size:21px">${pv}</td><td class="mono c">${err}</td><td class="mono c">${err-errX}</td></tr>`}).join('');
  $('#dzTab').innerHTML='<tr><th>الذهبي</th><th>التنبؤ</th><th>حروف خاطئة</th><th>منها الإعراب</th></tr>'+rows;
  const pc=x=>(x*100).toFixed(1)+'%';
  $('#dzCalc').textContent=`with case endings:    DER = ${e}/${n} = ${pc(e/n)}   WER = ${we}/${G.length} = ${pc(we/G.length)}\nwithout case endings: DER = ${ex}/${nx} = ${pc(ex/nx)}   WER = ${wex}/${G.length} = ${pc(wex/G.length)}\n(all letters counted, including those that carry no mark in the gold text)`}
segOn('#dzP',drawDZ);drawDZ();

/* ---------- partial diacritization ---------- */
const PDL=['عقد المدير اجتماعا مع المدرسة في المدرسة','عَقَدَ المدير اجتماعا مع المُدَرِّسة في المدرسة','عَقَدَ المُدِيرُ اجْتِمَاعًا مَعَ المُدَرِّسَةِ فِي المَدْرَسَةِ'];
function drawPD(){const l=+segVal('#pdL','l'),s=PDL[l],nd=[...s].filter(isD).length;$('#pdOut').textContent=s;
  $('#pdCalc').textContent=`${nd} diacritics`+[`\nambiguous: عقد (عَقَدَ / عُقِدَ / عَقْد…) and المدرسة twice (school or teacher?)`,`\nonly the 2 ambiguous words are marked: enough for a human reader`,`\nevery letter marked: what a text-to-speech system needs`][l]}
segOn('#pdL',drawPD);drawPD();
