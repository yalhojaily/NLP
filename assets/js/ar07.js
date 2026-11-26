/* Arabic track · Lesson 7: MSA, dialects, Arabizi */
const SECS=[['a7-1','١','الازدواجية'],['a7-2','٢','العربيزي'],['a7-3','٣','تحديد اللهجة'],['a7-4','٤','الأثر على الأنظمة'],['ex','','للمراجعة']];
const GL=[['الازدواجية','diglossia','تنوع عالٍ للكتابة وتنوعات دنيا للكلام اليومي.'],['الفصحى الحديثة','Modern Standard Arabic (MSA)','عربية الكتابة والإعلام.'],['اللهجة','dialectal Arabic (DA)','عربية الكلام اليومي في منطقة ما.'],['العربيزي','Arabizi','العربية بالحروف اللاتينية والأرقام.'],['التحويل الحرفي','transliteration','نقل الكتابة من نظام حروف إلى آخر.'],['التبديل اللغوي','code-switching','المزج بين لغتين في الكلام نفسه.'],['تحديد اللهجة','dialect identification','تصنيف النص بحسب لهجته.'],['مقاطع الحروف','character n-grams','سلاسل متجاورة من الحروف تُستعمل خصائص.'],['MADAR','MADAR corpus','جمل متوازية في لهجات ٢٥ مدينة عربية.'],['NADI','NADI shared tasks','مسابقات تحديد اللهجات العربية.']];
initPage(SECS,GL);

/* ---------- dialect table ---------- */
const DL=[[['الفصحى','ماذا تريد أن تفعل الآن؟'],['المصرية','عايز تعمل إيه دلوقتي؟'],['الشامية','شو بدك تعمل هلأ؟'],['الخليجية (النجدية)','وش تبي تسوي الحين؟'],['العراقية','شتريد تسوي هسه؟'],['المغربية','شنو بغيتي دير دابا؟']],
 [['الفصحى','أنا لا أعرف'],['المصرية','أنا مش عارف'],['الشامية','أنا ما بعرف'],['الخليجية (النجدية)','أنا ما أدري'],['العراقية','آني ما أدري'],['المغربية','أنا ما عرفتش']],
 [['الفصحى','كيف حالك؟'],['المصرية','إزيك؟'],['الشامية','كيفك؟'],['الخليجية (النجدية)','شلونك؟'],['العراقية','شلونك؟'],['المغربية','كيداير؟']]];
const nrm=s=>s.replace(/[؟?،]/g,'').replace(/[أإآ]/g,'ا').trim().split(/\s+/);
function drawDL(){const T=DL[+segVal('#dlS','i')],msa=new Set(nrm(T[0][1]));let lines=[];
  $('#dlTab').innerHTML='<tr><th>التنوع</th><th>الجملة</th><th>كلمات مشتركة مع الفصحى</th></tr>'+T.map(([d,s],i)=>{const w=nrm(s),sh=w.filter(x=>msa.has(x));if(i)lines.push(`${d}: ${sh.length}/${w.length}`);
    return `<tr><td>${d}</td><td style="font-family:'Noto Naskh Arabic',serif;font-size:20px">${s.split(/(\s+)/).map(x=>msa.has(nrm(x)[0]||'_')&&i?`<span style="background:var(--green-soft);border-radius:4px">${x}</span>`:x).join('')}</td><td class="mono c">${i?sh.length+' / '+w.length:'—'}</td></tr>`}).join('');
  $('#dlCalc').textContent='words shared with the MSA sentence (after alef normalization):\n'+lines.join(' · ')+'\na model trained only on MSA sees most dialect words as rare or unknown'}
segOn('#dlS',drawDL);drawDL();

/* ---------- Arabizi ---------- */
const DIG={'2':'ء','3':'ع','5':'خ','6':'ط','7':'ح','9':'ص'},DI={sh:'ش',kh:'خ',gh:'غ',th:'ث',dh:'ذ',ch:'ش',"3'":'غ',"7'":'خ'},CON={b:'ب',t:'ت',j:'ج',d:'د',r:'ر',z:'ز',s:'س',f:'ف',q:'ق',k:'ك',l:'ل',m:'م',n:'ن',h:'ه',w:'و',y:'ي',g:'ج',p:'ب',v:'ف',x:'كس',c:'ك'};
function azWord(w){w=w.toLowerCase();let o='',i=0;const n=w.length;
  while(i<n){const two=w.slice(i,i+2),c=w[i],first=i===0,last=i===n-1;
    if(DI[two]){o+=DI[two];i+=2;continue}
    if(DIG[c]){o+=(c==='2'&&first)?'أ':DIG[c];i++;continue}
    if('aeiou'.includes(c)){const dbl=w[i+1]===c||(c==='o'&&w[i+1]==='u')||(c==='e'&&w[i+1]==='e');const len=dbl?2:1;const end=i+len>=n;
      if(c==='a')o+=(first||end||dbl)?'ا':'';else if(c==='e')o+=first?'ا':(end||dbl)?'ي':'';else if(c==='i')o+=first?'ا':'ي';else o+=first?'ا':'و';i+=len;continue}
    if(CON[c]){if(w[i+1]===c){o+=CON[c];i+=2;continue}o+=CON[c];i++;continue}
    o+=c;i++}
  return o}
const AZX=['7abibi','3arabi','mar7aba','kifak','ya3ni','sho 3am ta3mel?','ana ra7','inshallah','2alb','5alas'];
$('#azEx').innerHTML=AZX.map((x,i)=>`<button class="btn mono" data-i="${i}" style="font-size:13px">${x}</button>`).join('');
function drawAZ(){const s=$('#azIn').value;const out=s.split(/(\s+)/).map(t=>/\s/.test(t)?t:t.replace(/[a-z0-9']+/gi,m=>azWord(m)).replace(/\?/g,'؟')).join('');
  $('#azOut').textContent=out;const digits=(s.match(/[235679]/g)||[]).length;
  $('#azCalc').textContent=`${digits} digit${digits===1?'':'s'} used as letters (2=ء 3=ع 5=خ 6=ط 7=ح 9=ص/ق) · short vowels inside words dropped\n`+(/inshallah/i.test(s)?'“inshallah” is written as pronounced; the standard spelling is إن شاء الله (3 words): no rule can recover that':/2alb/i.test(s)?'“2alb” = قلب pronounced with a glottal stop (Levantine/Egyptian): the rule gives ألب':/5alas/i.test(s)?'“5alas” = خلاص: Arabizi marks neither the long ā nor the emphatic ص, so the rule gives خلس':'rough rules: real systems learn transliteration from paired data')}
$$('#azEx button').forEach(b=>b.addEventListener('click',()=>{$('#azIn').value=AZX[+b.dataset.i];drawAZ()}));$('#azIn').addEventListener('input',drawAZ);$('#azIn').value=AZX[0];drawAZ();

/* ---------- dialect ID ---------- */
const CUE={'الفصحى':'ماذا الآن أريد تريد يريد أن لا أعرف كيف حالك ليس سوف هذا الذي لماذا','المصرية':'عايز عايزة دلوقتي ايه مش ازيك بتاع كده اوي فين ازاي امتى عارف','الشامية':'شو بدي بدك هلأ هلق كيفك بعرف كتير منيح عم رح هيك وين','الخليجية':'وش ابي تبي يبي الحين سوي تسوي شلونك ادري وايد زين شفيك','العراقية':'شتريد هسه اني شلونك اكو ماكو هواية شكو ادري','المغربية':'بغيت بغيتي دابا شنو واش بزاف كيداير ديال مزيان عرفتش'};
const CW=Object.fromEntries(Object.entries(CUE).map(([k,v])=>[k,new Set(v.split(' '))]));
const DIX=['عايز تعمل إيه دلوقتي؟','شو بدك تعمل هلأ؟','وش تبي تسوي الحين؟','شنو بغيتي دير دابا؟','ماذا تريد أن تفعل الآن؟','ما أدري','شلونك؟'];
$('#diEx').innerHTML=DIX.map((x,i)=>`<button class="btn" data-i="${i}">${x}</button>`).join('');
function drawDI(){const w=$('#diIn').value.replace(/[؟?،.!]/g,' ').replace(/[أإآ]/g,'ا').trim().split(/\s+/).filter(Boolean);
  const sc=Object.keys(CW).map(k=>[k,w.filter(x=>CW[k].has(x)).length,w.filter(x=>CW[k].has(x))]);const mx=Math.max(1,...sc.map(x=>x[1]));
  $('#diBars').innerHTML='<div class="bars">'+sc.map(([k,v])=>bar(k,v,mx,String(v),v===mx&&v>0?'var(--green)':'var(--math)')).join('')+'</div>';
  const top=sc.filter(x=>x[1]===mx&&x[1]>0);
  $('#diCalc').textContent=!top.length?'no cue words found → cannot decide':top.length>1?`tie between ${top.map(x=>x[0]).join(' / ')} → ambiguous (short sentence, shared words)`:`prediction: ${top[0][0]} (cues: ${top[0][2].join('، ')})`}
$$('#diEx button').forEach(b=>b.addEventListener('click',()=>{$('#diIn').value=DIX[+b.dataset.i];drawDI()}));$('#diIn').addEventListener('input',drawDI);$('#diIn').value=DIX[0];drawDI();
