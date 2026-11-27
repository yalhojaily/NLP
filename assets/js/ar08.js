/* Arabic track · Lesson 8: Arabic speech */
const SECS=[['a8-1','1','من الحرف إلى الصوت'],['a8-2','2','التعرّف على الكلام'],['a8-3','3','تحويل النص إلى كلام'],['ex','','للمراجعة']];
const GL=[['تحويل الحرف إلى صوت','grapheme-to-phoneme (G2P)','تحويل الكتابة إلى سلسلة أصوات.'],['الحروف الشمسية','sun letters','14 حرفاً تُدغم فيها لام «ال».'],['الحروف القمرية','moon letters','حروف تظهر قبلها لام «ال».'],['الإدغام','assimilation','تحوّل صوت إلى مثل جاره.'],['همزة الوصل','hamzat al-wasl','همزة تُنطق في الابتداء وتسقط في الدرج.'],['الوقف','pausal form','نطق آخر الكلمة عند التوقف: تسقط الحركة وتصير ة هاءً.'],['الصوامت المفخَّمة','emphatic consonants','ص ض ط ظ، ورمزها ˤ.'],['WER','word error rate','(إبدال + حذف + إدراج) ÷ كلمات المرجع.'],['CER','character error rate','الخطأ على مستوى الحروف.'],['التطبيع قبل التقييم','scoring normalization','توحيد الإملاء قبل حساب الخطأ.'],['العروض','prosody','النبر والتنغيم والإيقاع.']];
initPage(SECS,GL);

/* ---------- G2P ---------- */
const IPA={'ء':'ʔ','أ':'ʔ','إ':'ʔ','ؤ':'ʔ','ئ':'ʔ','ب':'b','ت':'t','ث':'θ','ج':'dʒ','ح':'ħ','خ':'x','د':'d','ذ':'ð','ر':'r','ز':'z','س':'s','ش':'ʃ','ص':'sˤ','ض':'dˤ','ط':'tˤ','ظ':'ðˤ','ع':'ʕ','غ':'ɣ','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'j'};
const SUN=new Set([...'تثدذرزسشصضطظلن']);
const V={'َ':'a','ُ':'u','ِ':'i','ً':'an','ٌ':'un','ٍ':'in'};
function g2p(text,pause){const words=text.trim().split(/\s+/).filter(Boolean),notes=[];let missing=0;
  const out=words.map((w,wi)=>{const L=[];for(const c of w){if(/[ً-ْٰ]/.test(c)&&L.length)L[L.length-1].d+=c;else L.push({c,d:''})}
    const last=wi===words.length-1&&pause;let o='',i=0;
    if(L.length>2&&L[0].c==='ا'&&L[1].c==='ل'){const nx=L[2].c;const sun=SUN.has(nx);o+=wi===0?'ʔa':'';if(!sun)o+='l';notes.push(`${w}: ${sun?'sun letter '+nx+' → lam assimilated':'moon letter '+nx+' → lam pronounced'}${wi?' · hamzat al-wasl dropped in connected speech':''}`);i=2}
    for(;i<L.length;i++){let {c,d}=L[i];const isLast=i===L.length-1;
      if(last&&isLast){if(d.includes('ً')&&c!=='ة'){}else d=d.replace(/[ٌٍَُِ]/g,'')}
      if(c==='ا'){if(i>0&&L[i-1].d.includes('ً'))continue;if(o.endsWith('a'))o=o.slice(0,-1)+'aː';else if(i===0)o+='ʔa';else o+='aː';continue}
      if(c==='آ'){o+='ʔaː';continue}
      if(c==='ى'){if(o.endsWith('a'))o=o.slice(0,-1)+'aː';else o+='aː';continue}
      if((c==='و'&&o.endsWith('u')||c==='ي'&&o.endsWith('i'))&&!d){o=o.slice(0,-1)+(c==='و'?'uː':'iː');continue}
      if(c==='ة'){o+=last&&isLast?'h':'t';if(last&&isLast){notes.push(`${w}: taa marbuta at a pause → h`);continue}}
      else{const p=IPA[c];if(!p){o+=c;continue}o+=p;if(d.includes('ّ'))o+=p}
      const vv=[...d].map(x=>V[x]).filter(Boolean).join('');
      if(d.includes('ٰ'))o+='aː';
      if(vv){if(last&&isLast&&d.includes('ً'))o+='aː';else o+=vv}
      else if(!d.includes('ْ')&&!d.includes('ٰ')&&!(last&&isLast)){const nx=L[i+1];const longNext=nx&&(nx.c==='ا'||nx.c==='و'||nx.c==='ي'||nx.c==='ى')&&!nx.d;if(!longNext&&c!=='ة'){o+='◌';missing++}}}
    return o});
  return {s:out.join(' '),notes,missing}}
const GPX=['الشَّمْسُ','القَمَرُ','كَتَبَ الطَّالِبُ الدَّرْسَ','ذَهَبَ الْوَلَدُ إِلَى الْمَدْرَسَةِ','جَاءَ صَبَاحًا','الرَّجُلُ','ذهب الولد إلى المدرسة'];
$('#gpEx').innerHTML=GPX.map((x,i)=>`<button class="btn" data-i="${i}">${x}</button>`).join('');
function drawGP(){const r=g2p($('#gpIn').value,+segVal('#gpM','m'));$('#gpOut').textContent=r.s?'/'+r.s+'/':'';
  $('#gpCalc').textContent=(r.notes.join('\n')||'no special rule fired')+(r.missing?`\n◌ = ${r.missing} short vowel${r.missing>1?'s':''} unknown: the text is not (fully) diacritized`:'\nevery vowel is known: the text is fully diacritized')+(+segVal('#gpM','m')?'\npause: the final short vowel / case ending is dropped':'')}
$$('#gpEx button').forEach(b=>b.addEventListener('click',()=>{$('#gpIn').value=GPX[+b.dataset.i];drawGP()}));segOn('#gpM',drawGP);$('#gpIn').addEventListener('input',drawGP);$('#gpIn').value=GPX[2];drawGP();

/* ---------- WER with normalization ---------- */
const REF='ذهب أحمد إلى المدرسة في الصباح',HYP=['ذهب احمد الى المدرسه في الصباح','ذهب احمد الى المدرسه في المساء','ذهب أحمد إلى المدرسة فالصباح'];
const norm=s=>s.replace(/[ً-ْ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
function align(r,h){const n=r.length,m=h.length,D=[...Array(n+1)].map(()=>Array(m+1).fill(0));for(let i=0;i<=n;i++)D[i][0]=i;for(let j=0;j<=m;j++)D[0][j]=j;
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)D[i][j]=Math.min(D[i-1][j]+1,D[i][j-1]+1,D[i-1][j-1]+(r[i-1]===h[j-1]?0:1));
  const ops=[];let i=n,j=m;while(i||j){if(i&&j&&D[i][j]===D[i-1][j-1]+(r[i-1]===h[j-1]?0:1)){ops.unshift([r[i-1]===h[j-1]?'ok':'S',i-1,j-1]);i--;j--}else if(i&&D[i][j]===D[i-1][j]+1){ops.unshift(['D',i-1,null]);i--}else{ops.unshift(['I',null,j-1]);j--}}
  return ops}
function drawWE(){const H=HYP[+segVal('#weH','i')],N=$('#weN').checked;const r0=REF.split(' '),h0=H.split(' '),r=N?r0.map(norm):r0,h=N?h0.map(norm):h0;const ops=align(r,h);
  const c={S:0,D:0,I:0};ops.forEach(o=>{if(o[0]!=='ok')c[o[0]]++});
  const lab={ok:'',S:'إبدال',D:'حذف',I:'إدراج'};
  $('#weOut').innerHTML='<div class="note" style="margin:0">المرجع ← الفرضية:</div>'+ops.map(([t,a,b])=>`<span class="archip" style="background:var(--${t==='ok'?'green':'rose'}-soft);border-color:var(--${t==='ok'?'green':'rose'})">${a!==null?r0[a]:'∅'} ← ${b!==null?h0[b]:'∅'}${t!=='ok'?`<sub style="color:var(--rose)">${lab[t]}</sub>`:''}</span>`).join(' ');
  const e=c.S+c.D+c.I;$('#weCalc').textContent=`WER = (S ${c.S} + D ${c.D} + I ${c.I}) / ${r0.length} reference words = ${(e/r0.length*100).toFixed(1)}%  ${N?'(after normalization: diacritics, alef, ى→ي, ة→ه)':'(raw text: spelling variants count as errors)'}`}
segOn('#weH',drawWE);$('#weN').addEventListener('change',drawWE);drawWE();
