/* Arabic track · Lesson 1: script, Unicode, normalization */
const SECS=[['a1-1','١','الأبجدية حاسوبياً'],['a1-2','٢','يونيكود وUTF-8'],['a1-3','٣','التطبيع'],['a1-4','٤','الاتجاه الثنائي'],['ex','','للمراجعة']];
const GL=[['أبجد','abjad','نظام كتابة يكتب الصوامت ويترك الحركات القصيرة.'],['الشكل السياقي','contextual form','شكل الحرف المنفصل أو في أول الكلمة أو وسطها أو آخرها.'],['التشكيل (العرض)','shaping','اختيار برنامج العرض لشكل الحرف من جيرانه.'],['الرباط','ligature','شكل واحد لحرفين، كـ «لا».'],['نقطة الترميز','code point','رقم يونيكود للرمز، مثل U+0628 للباء.'],['UTF-8','UTF-8','ترميز بالبايتات: الحرف العربي بايتان.'],['الحركة المركّبة','combining mark','رمز يأتي بعد حرفه ويُرسم فوقه أو تحته.'],['التطويل','tatweel / kashida','U+0640: مدّ شكلي لا قيمة لغوية له.'],['أشكال العرض','presentation forms','رموز قديمة لأشكال الحروف، للتوافق فقط.'],['NFKC','NFKC normalization','تطبيع يونيكود يعيد أشكال العرض إلى الحروف.'],['التطبيع','normalization','توحيد صيغ الكتابة المختلفة قبل المعالجة.'],['الترتيب المنطقي','logical order','ترتيب الرموز في الذاكرة كما تُنطق.'],['خوارزمية الاتجاه الثنائي','Bidi algorithm','قواعد عرض النص المختلط الاتجاه.']];
initPage(SECS,GL);

/* ---------- letter forms ---------- */
const ZWJ='‍';
const LET=['ب','ع','ه','ك','ل','ي','س','ح','ا','د','ر','و'];
const NONJ=new Set(['ا','د','ذ','ر','ز','و']);
let shI=1;
$('#shBtns').innerHTML=LET.map((l,i)=>`<button class="btn${i===shI?' pri':''}" data-i="${i}" style="font-size:18px;min-width:44px">${l}</button>`).join('');
function drawSH(){$$('#shBtns button').forEach((b,j)=>b.classList.toggle('pri',j===shI));const l=LET[shI],nj=NONJ.has(l);
  const F=[['منفصل',l],['أول الكلمة',l+ZWJ],['وسط الكلمة',ZWJ+l+ZWJ],['آخر الكلمة',ZWJ+l]];
  $('#shOut').innerHTML=`<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;text-align:center">${F.map(([n,s])=>`<div style="border:1px solid var(--rule);border-radius:10px;padding:4px 0"><div style="font-size:40px;line-height:1.6">${s}</div><div class="note" style="margin:0;font-size:12.5px">${n}</div></div>`).join('')}</div>`;
  const cp='U+'+l.codePointAt(0).toString(16).toUpperCase().padStart(4,'0');
  $('#shCalc').textContent=`in memory: one code point ${cp} in every position\non screen: ${nj?'only 2 distinct shapes: “'+l+'” never joins the letter after it, so initial = isolated and medial = final':'4 contextual shapes chosen by the renderer'}`}
$$('#shBtns button').forEach(b=>b.addEventListener('click',()=>{shI=+b.dataset.i;drawSH()}));drawSH();

/* ---------- Unicode inspector ---------- */
const LN={0x621:'hamza ء',0x622:'alef madda آ',0x623:'alef hamza above أ',0x624:'waw hamza ؤ',0x625:'alef hamza below إ',0x626:'yaa hamza ئ',0x627:'alef ا',0x628:'baa ب',0x629:'taa marbuta ة',0x62A:'taa ت',0x62B:'thaa ث',0x62C:'jeem ج',0x62D:'haa ح',0x62E:'khaa خ',0x62F:'dal د',0x630:'thal ذ',0x631:'raa ر',0x632:'zain ز',0x633:'seen س',0x634:'sheen ش',0x635:'sad ص',0x636:'dad ض',0x637:'tah ط',0x638:'zah ظ',0x639:'ain ع',0x63A:'ghain غ',0x640:'TATWEEL ـ',0x641:'faa ف',0x642:'qaf ق',0x643:'kaf ك',0x644:'lam ل',0x645:'meem م',0x646:'noon ن',0x647:'haa ه',0x648:'waw و',0x649:'alef maqsura ى',0x64A:'yaa ي',0x64B:'fathatan (tanween)',0x64C:'dammatan (tanween)',0x64D:'kasratan (tanween)',0x64E:'fatha',0x64F:'damma',0x650:'kasra',0x651:'shadda',0x652:'sukun',0x670:'superscript alef',0x60C:'Arabic comma ،',0x61B:'Arabic semicolon ؛',0x61F:'Arabic question mark ؟',0x6CC:'FARSI yeh ی',0x6A9:'KEHEH (Persian kaf) ک',0x200D:'zero width joiner',0x200F:'right-to-left mark',0xFEFB:'PRESENTATION FORM lam-alef ﻻ'};
function kind(c){if(c>=0x64B&&c<=0x652||c===0x670)return 'diacritic';if(c>=0x660&&c<=0x669)return 'Arabic-Indic digit '+(c-0x660);if(c>=0x6F0&&c<=0x6F9)return 'Persian digit';if(c>=0xFB50&&c<=0xFEFF)return 'presentation form';if(c>=0x600&&c<=0x6FF)return 'Arabic';if(c<128)return c===32?'space':'ASCII';return 'other'}
const UCX=['كَتَبَ','قرأَ الطالبُ ٣ كتبٍ عن GPT','كتـــاب','ﻻ يوجد','یوم','اشتريت 3 كتب، وأنت؟'];
$('#ucEx').innerHTML=UCX.map((x,i)=>`<button class="btn" data-i="${i}">${esc(x)}</button>`).join('');
function utf8len(c){return c<0x80?1:c<0x800?2:c<0x10000?3:4}
function drawUC(){const s=$('#ucIn').value,cs=[...s];let by=0,nl=0,nd=0;
  const rows=cs.map((ch,i)=>{const c=ch.codePointAt(0),b=utf8len(c);by+=b;const k=kind(c);if(k==='diacritic')nd++;else if(k==='Arabic')nl++;
    const show=k==='diacritic'?'◌'+ch:ch===' '?'␠':ch;
    return `<tr style="${k==='diacritic'?'background:var(--amber-soft)':k==='presentation form'||/FARSI|KEHEH|TATWEEL/.test(LN[c]||'')?'background:var(--rose-soft)':''}"><td class="mono">${i+1}</td><td style="font-family:'Noto Naskh Arabic',serif;font-size:22px;text-align:center">${esc(show)}</td><td class="mono">U+${c.toString(16).toUpperCase().padStart(4,'0')}</td><td>${esc(LN[c]||k)}</td><td class="mono c">${b}</td></tr>`}).join('');
  $('#ucTab').innerHTML='<tr><th>#</th><th>char</th><th>code point</th><th>name / kind</th><th>UTF-8 bytes</th></tr>'+rows;
  $('#ucCalc').textContent=`${cs.length} code points (${nl} Arabic letters/marks of the base block, ${nd} diacritics) · ${by} bytes in UTF-8\nrows are in LOGICAL order: the order the text is stored and the order a model reads it\namber = diacritic (a separate code point after its letter) · rose = a look-alike that breaks matching`}
$$('#ucEx button').forEach(b=>b.addEventListener('click',()=>{$('#ucIn').value=UCX[+b.dataset.i];drawUC()}));
$('#ucIn').addEventListener('input',drawUC);$('#ucIn').value=UCX[0];drawUC();

/* ---------- normalizer ---------- */
const CORP='أحمد احمد إسلام اسلام الإسلام الاسلام مدرسة مدرسه كتـــاب كتاب الْكِتَابُ الكتاب على علي إلى الى مسؤول قرآن قران ﻻ لا یوم يوم'.split(' ');
const RULES=[['nfkc','NFKC (أشكال العرض)',s=>s.normalize('NFKC')],['diac','حذف الحركات',s=>s.replace(/[ً-ْٰ]/g,'')],['tatw','حذف التطويل',s=>s.replace(/ـ/g,'')],['alef','توحيد الألف أ إ آ ← ا',s=>s.replace(/[أإآٱ]/g,'ا')],['fa','حروف فارسية ی ک ← ي ك',s=>s.replace(/ی/g,'ي').replace(/ک/g,'ك')],['yaa','ى ← ي',s=>s.replace(/ى/g,'ي')],['taa','ة ← ه',s=>s.replace(/ة/g,'ه')]];
const RISKY=[['على','علي'],['مدرسة','مدرسه']];
$('#nmF').innerHTML=RULES.map((r,i)=>`<label class="note"><input type="checkbox" data-i="${i}" ${i<3?'checked':''}> ${r[1]}</label>`).join('');
function drawNM(){const on=$$('#nmF input').filter(x=>x.checked).map(x=>RULES[+x.dataset.i]);const norm=s=>on.reduce((a,r)=>r[2](a),s);
  const G={};CORP.forEach(w=>{const n=norm(w);(G[n]=G[n]||new Set()).add(w)});
  const before=new Set(CORP).size,after=Object.keys(G).length;
  const risky=RISKY.filter(([a,b])=>norm(a)===norm(b));
  $('#nmOut').innerHTML=Object.entries(G).map(([n,s])=>{const m=s.size>1,bad=risky.some(([a,b])=>s.has(a)&&s.has(b));return `<span class="archip" style="background:var(--${bad?'rose':m?'green':'tint'}-soft,var(--tint));border-color:var(--${bad?'rose':m?'green':'rule'})" title="${esc([...s].join(' · '))}">${esc(n)}${m?`<sub style="color:var(--${bad?'rose':'green'})">← ${esc([...s].join(' ، '))}</sub>`:''}</span>`}).join(' ');
  $('#nmCalc').textContent=`${CORP.length} tokens · ${before} types before → ${after} types after (${before-after} merged)\n`+(risky.length?`⚠ merged words that may really be different: ${risky.map(r=>r.join(' / ')).join(' , ')}`:'no risky merges with the current rules')}
$$('#nmF input').forEach(x=>x.addEventListener('change',drawNM));drawNM();
