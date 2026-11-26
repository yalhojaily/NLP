/* Arabic track · Lesson 10: tools, corpora, benchmarks, pipelines */
const SECS=[['a10-1','١','الخريطة'],['a10-2','٢','الأنبوب'],['ex','','ختام المسار']];
const GL=[['الأداة','toolkit','مكتبة برمجية تنفّذ خطوات المعالجة.'],['المدوّنة الموسومة','annotated corpus','نصوص عليها وسوم بشرية.'],['الشجرة الموسومة','treebank','مدوّنة بأشجار نحوية.'],['المعيار','benchmark','مجموعة اختبار قياسية.'],['أنبوب المعالجة','pipeline','سلسلة خطوات تمر بها البيانات.'],['النظام الشامل','end-to-end system','نموذج واحد من المدخل إلى المخرج.'],['LDC','Linguistic Data Consortium','جهة توزّع مدوّنات لغوية كثيرة بتراخيص.']];
initPage(SECS,GL);

const RS=[
 ['tool','CAMeL Tools','أداة بايثون من CAMeL Lab (جامعة نيويورك أبوظبي): التطبيع، والتحليل الصرفي وإزالة غموضه، والتقطيع، وتحديد اللهجة، والكيانات، والمشاعر.','١، ٢، ٣، ٧، ٩','https://github.com/CAMeL-Lab/camel_tools'],
 ['tool','Farasa','مجموعة أدوات من QCRI لتقطيع النص العربي ووسمه وتحليله (منها التقطيع الذي استعملته بعض نسخ AraBERT).','٢، ٣، ٤','https://farasa.qcri.org'],
 ['tool','Stanza','مكتبة ستانفورد متعددة اللغات، فيها نماذج عربية مدرَّبة على UD: تقطيع، ووسم، ولِمّات، وتحليل اعتمادي.','٦','https://stanfordnlp.github.io/stanza/'],
 ['data','شجرة بن العربية (PATB)','الشجرة الموسومة العربية الكبرى: صرف وأقسام كلام وأشجار مكوّنات؛ توزّعها LDC.','٣، ٦',''],
 ['data','UD Arabic-PADT','شجرة براغ العربية بصيغة Universal Dependencies: أشجار اعتماد مفتوحة.','٦','https://universaldependencies.org/treebanks/ar_padt/index.html'],
 ['data','OntoNotes (العربي)','نحو ٣٠٠ ألف كلمة أخبار عربية موسومة بالإحالة والكيانات وغيرها (الفصل ٢٤)؛ عبر LDC.','٩',''],
 ['data','MADAR','جمل متوازية في لهجات ٢٥ مدينة عربية، لتحديد اللهجة والترجمة بين اللهجات.','٧',''],
 ['data','NADI','سلسلة مسابقات لتحديد اللهجات العربية على مستوى البلد والمنطقة.','٧',''],
 ['data','MGB','تحديات تعرّف على الكلام العربي متعدد اللهجات من البث (منه الجزيرة).','٨',''],
 ['data','Common Voice (العربية)','تسجيلات صوتية مفتوحة يقرؤها متطوعون.','٨','https://commonvoice.mozilla.org/ar'],
 ['data','ArSenL','معجم مشاعر عربي واسع (٢٠١٤).','٩',''],
 ['model','AraBERT','مرمِّز عربي (AUB MIND Lab).','٥','https://huggingface.co/aubmindlab/bert-base-arabertv2'],
 ['model','CAMeLBERT','مرمِّزات للفصحى واللهجات والتراث (CAMeL Lab).','٥، ٧','https://huggingface.co/CAMeL-Lab'],
 ['model','ALLaM','نماذج كبيرة عربية-إنجليزية من سدايا.','٥','https://arxiv.org/abs/2407.15390'],
 ['model','فنار Fanar','منصة ونماذج عربية من QCRI، بمقطِّع MorphBPE.','٢، ٥','https://arxiv.org/abs/2501.13944'],
 ['model','Jais 2 / Jais 3','نماذج عربية مفتوحة من MBZUAI وCerebras وInception.','٢، ٥','https://arxiv.org/abs/2611.10224'],
 ['bench','BALSAM','منصة لقياس النماذج العربية الكبيرة على مهام متنوعة (٢٠٢٥).','٥','https://arxiv.org/abs/2507.22603'],
 ['bench','ArabicMMLU','أسئلة معرفية متعددة الخيارات مكتوبة أصلاً بالعربية من مناهج دراسية عربية.','٥','']];
const TN={tool:'أداة',data:'بيانات',model:'نموذج',bench:'معيار'};
function drawRS(){const t=segVal('#rsT','t');$('#rsTab').innerHTML='<tr><th>المورد</th><th>النوع</th><th>الوصف</th><th>الدروس</th></tr>'+RS.filter(r=>t==='all'||r[0]===t).map(r=>`<tr><td><b>${r[4]?`<a href="${r[4]}" rel="noopener">${r[1]}</a>`:r[1]}</b></td><td>${TN[r[0]]}</td><td>${r[2]}</td><td class="c">${r[3]}</td></tr>`).join('')}
segOn('#rsT',drawRS);drawRS();

const PP=[['بحث في الأخبار',[['تطبيع (الحركات، الألف، التطويل، أشكال العرض)',1],['تقطيع اللواصق أو تجذيع خفيف للفهرس',2],['معالجة جمع التكسير بمعجم، أو استرجاع بالتضمينات',3],['تقييم بالدقة والاستدعاء',3]],'no diacritization needed; normalization is the biggest win'],
 ['مساعد يفهم اللهجة',[['تحديد اللهجة',7],['تطبيع إملاء اللهجة (مش/مِش)',1],['نموذج مدرَّب أو مضبوط على بيانات لهجية',5],['تقطيع يراعي اللهجة (بـ للمضارع، ـش للنفي)',2],['تقييم بمعيار لهجي',5]],'MSA-only data is the most common failure'],
 ['كتاب مسموع من نص',[['تطبيع النص للنطق (الأعداد والاختصارات)',8],['تشكيل كامل',4],['تحويل الحرف إلى صوت (الشمسية، الوصل، الوقف)',8],['نموذج صوتي ومولّد موجة',8]],'every diacritization error becomes an audible error'],
 ['استخراج أسماء الأشخاص',[['تطبيع',1],['تقطيع اللواصق (و + سعيد)',2],['وسّام كيانات مضبوط على بيانات عربية',9],['ربط الكيانات بقاعدة معرفة',9]],'no capital letters: context and clitic segmentation carry the signal'],
 ['مشاعر التغريدات',[['تطبيع (ومنه العربيزي إن وُجد)',7],['تحديد اللهجة أو نموذج متعدد اللهجات',7],['معجم مشاعر مع تجذيع ونفي، أو مصنّف مضبوط',9],['تقييم بعيّنة موسومة من التغريدات نفسها',9]],'tweets mix dialects, Arabizi and emoji']];
$('#ppT').innerHTML=PP.map((p,i)=>`<button data-i="${i}" class="${i===0?'on':''}">${p[0]}</button>`).join('');
const LS=['01-script','02-tokenization','03-morphology','04-diacritics','05-language-models','06-syntax','07-dialects','08-speech','09-meaning','10-resources'];
function drawPP(){const p=PP[+segVal('#ppT','i')];$('#ppOut').innerHTML=p[1].map(([s,l],k)=>`<div style="display:flex;gap:10px;align-items:center;margin:4px 0"><b class="mono" style="color:var(--green)">${k+1}</b><span style="flex:1">${s}</span><a class="arlink" href="${LS[l-1]}.html">الدرس ${AD(l)}</a></div>`+(k<p[1].length-1?'<div style="margin-inline-start:4px;color:var(--soft)">↓</div>':'')).join('');
  $('#ppCalc').textContent=`${p[1].length} steps · lessons used: ${[...new Set(p[1].map(x=>x[1]))].join(', ')}\nkey point: ${p[2]}`}
segOn('#ppT',drawPP);drawPP();
