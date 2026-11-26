/* Arabic track · Lesson 2: clitics, segmentation, BPE, fertility */
const SECS=[['a2-1','١','الكلمة العربية'],['a2-2','٢','BPE على العربية'],['a2-3','٣','ضريبة الرموز'],['ex','','للمراجعة']];
const GL=[['الكلمة الإملائية','orthographic word','ما بين مسافتين.'],['اللاصقة','clitic','كلمة مستقلة نحوياً تُكتب ملتصقة بغيرها.'],['السابقة','proclitic','لاصقة قبل الجذع: و، ف، ب، ك، ل، س، ال.'],['اللاحقة الضميرية','enclitic','ضمير متصل بعد الجذع: ه، ها، هم…'],['الجذع','stem','الكلمة بعد نزع اللواصق.'],['تقطيع اللواصق','clitic segmentation','فصل السوابق واللواحق عن الجذع.'],['BPE','byte-pair encoding','مقطِّع يدمج أكثر الأزواج المتجاورة تكراراً.'],['الدمج','merge','قاعدة BPE: زوج رموز يصير رمزاً.'],['الحد الصرفي','morpheme boundary','الحد بين لاصقة وجذع أو بين صرفيمين.'],['MorphBPE','morphology-aware BPE','BPE لا يدمج عبر الحدود الصرفية (فنار).'],['الخصوبة','fertility','عدد الرموز لكل كلمة.'],['نافذة السياق','context window','أقصى عدد رموز يراه النموذج دفعة واحدة.'],['ضريبة الرموز','token tax','التكلفة الإضافية للغات التي تحتاج رموزاً أكثر.']];
initPage(SECS,GL);

/* ---------- clitic segmenter ---------- */
const LEX=[['كتاب','n','كِتاب'],['قلم','n','قَلَم'],['مدرسة','n','مَدْرَسة'],['طالب','n','طالِب'],['طلاب','n','طُلّاب'],['درس','n','دَرْس'],['درس','vp','دَرَسَ'],['بيت','n','بَيْت'],['جد','n','جَدّ'],['وجد','vp','وَجَدَ'],['فهم','n','فَهْم'],['فهم','vp','فَهِمَ'],['هم','pr','هُم (ضمير منفصل)'],['يكتبون','vi','يَكْتُبون'],['يكتب','vi','يَكْتُب'],['يدرسون','vi','يَدْرُسون'],['وصل','vp','وَصَلَ'],['صل','vimp','صَلِّ (أمر)'],['قرأ','vp','قَرَأَ'],['كتب','vp','كَتَبَ'],['كتب','n','كُتُب'],['علم','n','عِلْم'],['علم','vp','عَلِمَ'],['ولد','n','وَلَد'],['سيارة','n','سَيّارة'],['معلم','n','مُعَلِّم'],['رسالة','n','رِسالة'],['قال','vp','قالَ'],['لعب','vp','لَعِبَ'],['عب','n','عَبّ؟'],['بعد','n','بَعْد'],['عد','vimp','عُدَّ (أمر)']];
const ENC=['ه','ها','هم','هما','هن','ك','كم','كن','نا','ي','ني'];
const POSN={n:'اسم',vp:'فعل ماضٍ',vi:'فعل مضارع',vimp:'فعل أمر',pr:'ضمير'};
function segs(w){const out=[];
  for(const c of ['','و','ف'])for(const p of ['','ب','ك','ل','س'])for(const a of ['','ال']){
    const surf=c+(p==='ل'&&a==='ال'?'لل':p+a);if(!w.startsWith(surf))continue;const r=w.slice(surf.length);if(!r)continue;
    for(const e of ['',...ENC]){if(e&&!r.endsWith(e))continue;let st=e?r.slice(0,-e.length):r;if(st.length<2)continue;
      const cands=[];LEX.forEach(L=>{if(L[0]===st)cands.push([L,st]);if(e&&st.endsWith('ت')&&L[0]===st.slice(0,-1)+'ة'&&L[1]==='n')cands.push([L,st])});
      cands.forEach(([L,stS])=>{const pos=L[1];
        if(a&&pos!=='n')return;if(p==='س'&&pos!=='vi')return;if(['ب','ك','ل'].includes(p)&&pos!=='n')return;if(e&&(pos==='pr'||a))return;
        out.push({c,p,a,st:stS,e,L})})}}
  return out}
const SGX=['وسيكتبونها','فبالقلم','وكتابهم','للمدرسة','وجد','فهم','وصل','ومدرستها','بعد'];
$('#sgEx').innerHTML=SGX.map((x,i)=>`<button class="btn" data-i="${i}">${x}</button>`).join('');
function drawSG(){const w=$('#sgIn').value.trim().replace(/[ً-ْ]/g,'');const S=segs(w);
  $('#sgOut').innerHTML=S.length?S.map((s,k)=>`<div><b class="mono" style="font-size:13px;color:var(--soft)">${k+1}.</b> `+[s.c&&chip(s.c,'green','عطف'),s.p&&chip(s.p,'math',s.p==='س'?'استقبال':'جر'),s.a&&chip('ال','amber','تعريف'),chip(s.st,'plain',POSN[s.L[1]]),s.e&&chip(s.e,'rose','ضمير')].filter(Boolean).join(' + ')+` <span class="note">← ${esc(s.L[2])}</span></div>`).join(''):'<span class="note">لا تقطيع بالمعجم الصغير</span>';
  const n=S.length?Math.max(...S.map(s=>[s.c,s.p,s.a,s.st,s.e].filter(Boolean).length)):0;
  $('#sgCalc').textContent=S.length?`${S.length} possible segmentation${S.length>1?'s':''}`+(S.length>1?' → ambiguous: context must decide':'')+`\nmost pieces: ${n} tokens from 1 orthographic word`:'no analysis found (try one of the examples)'}
$$('#sgEx button').forEach(b=>b.addEventListener('click',()=>{$('#sgIn').value=SGX[+b.dataset.i];drawSG()}));
$('#sgIn').addEventListener('input',drawSG);$('#sgIn').value=SGX[0];drawSG();

/* ---------- BPE ---------- */
const AR=['و+ذهب ال+ولد إلى ال+مدرسة ب+ال+سيارة','و+كتب ال+طالب ال+درس في ال+دفتر','ف+قرأ+ه ال+معلم و+شكر+ه','س+يكتب ال+طلاب ال+دروس غدا','و+س+يكتبون+ها في ال+مكتبة','ال+كتاب على ال+طاولة و+ال+قلم في ال+حقيبة','ذهب+نا إلى ال+مكتبة و+قرأ+نا ال+كتب','ال+معلمة شكرت ال+طالبات ل+أن+هن كتبن ال+درس','و+ب+ال+أمس زار+نا ال+مدرسة','ف+كتب+ت ال+رسالة ب+ال+قلم'];
const EN=['and the boy went to the school by the car','and the student wrote the lesson in the notebook','so the teacher read it and thanked him','the students will write the lessons tomorrow','and they will write it in the library','the book is on the table and the pen is in the bag','we went to the library and we read the books','the teacher thanked the students because they wrote the lesson','and yesterday we visited the school','so i wrote the letter with the pen'];
const ART=['و+ذهب+ت ال+طالبة إلى ال+مكتبة ب+ال+أمس','س+يكتبون ال+رسالة ب+ال+قلم'],ENT=['and the student went to the library yesterday','they will write the letter with the pen'];
// a word -> units; each unit = array of symbols; symbol = string; last symbol of the word carries '_' end mark
function units(w,morph){const parts=w.split('+');if(!morph){const ch=[...parts.join('')];ch[ch.length-1]+='_';return [ch]}
  return parts.map((p,i)=>{const ch=[...p];if(i===parts.length-1)ch[ch.length-1]+='_';return ch})}
function train(words,K,morph){const freq={};words.forEach(w=>freq[w]=(freq[w]||0)+1);
  let types=Object.keys(freq).map(w=>({w,f:freq[w],u:units(w,morph)}));const merges=[];
  for(let k=0;k<K;k++){const pc=new Map();types.forEach(t=>t.u.forEach(u=>{for(let i=0;i<u.length-1;i++){const key=u[i]+'\u0001'+u[i+1];pc.set(key,(pc.get(key)||0)+t.f)}}));
    let best=null,bc=1;for(const [key,c] of pc)if(c>bc){bc=c;best=key}if(!best)break;const [a,b]=best.split('\u0001');merges.push([a,b]);
    types.forEach(t=>t.u=t.u.map(u=>apply1(u,a,b)))}
  return merges}
function apply1(u,a,b){const o=[];for(let i=0;i<u.length;i++){if(i<u.length-1&&u[i]===a&&u[i+1]===b){o.push(a+b);i++}else o.push(u[i])}return o}
function tok(w,merges,morph){let us=units(w,morph);merges.forEach(([a,b])=>{us=us.map(u=>apply1(u,a,b))});
  // map tokens to char spans for crossing check
  const bounds=new Set();let pos=0;w.split('+').forEach((p,i,arr)=>{pos+=[...p].length;if(i<arr.length-1)bounds.add(pos)});
  const toks=[];let at=0;us.flat().forEach(t=>{const s=t.replace(/_$/,'');const L=[...s].length;let cross=false;for(let q=at+1;q<at+L;q++)if(bounds.has(q))cross=true;toks.push({s,cross});at+=L});return toks}
let bpCache={};
function drawBP(){const K=+$('#bpK').value,morph=+segVal('#bpM','m'),shared=+segVal('#bpD','d');$('#bpKo').textContent=K;
  const arW=AR.join(' ').split(' '),enW=EN.join(' ').split(' ');const key=K+'|'+morph+'|'+shared;
  if(!bpCache[key]){if(shared){const enX=[].concat(enW,enW,enW,enW,enW);const m=train(morph?arW.concat(enX):arW.map(w=>w.replace(/\+/g,'')).concat(enX),K,morph);bpCache[key]=[m,m]}else bpCache[key]=[train(arW,K,morph),train(enW,K,0)]}const [mA,mE]=bpCache[key];
  let aT=0,aW=0,cross=0,eT=0,eW=0,html='';
  ART.forEach((s,i)=>{const ws=s.split(' ');aW+=ws.length;html+='<div style="margin:4px 0;line-height:2.3">'+ws.map(w=>{const t=tok(w,mA,morph);aT+=t.length;cross+=t.filter(x=>x.cross).length;return '<span style="display:inline-block;margin-inline-end:10px">'+t.map(x=>`<span class="archip" style="font-size:17px;background:var(--${x.cross?'rose':'green'}-soft);border-color:var(--${x.cross?'rose':'green'})">${esc(x.s)}</span>`).join('')+'</span>'}).join('')+'</div>';
    const ew=ENT[i].split(' ');eW+=ew.length;html+='<div dir="ltr" style="margin:0 0 10px;line-height:2.2">'+ew.map(w=>{const t=tok(w,mE,0);eT+=t.length;return '<span style="display:inline-block;margin-right:10px">'+t.map(x=>`<span class="archip" style="font-family:var(--f-mono);font-size:13px;background:var(--math-soft);border-color:var(--math)">${esc(x.s)}</span>`).join('')+'</span>'}).join('')+'</div>'});
  $('#bpOut').innerHTML=html;
  $('#bpCalc').textContent=`held-out sentences (not in the training corpus):\nArabic: ${aW} words → ${aT} tokens · fertility ${r2(aT/aW)} tokens/word\nEnglish: ${eW} words → ${eT} tokens · fertility ${r2(eT/eW)} tokens/word\nsame content: Arabic needs ${r2(aT/eT)}× the English tokens\ntokens crossing a morpheme boundary (rose): ${cross}/${aT}`+(morph?' (0 by construction)':'')+`\n`+(shared?`(ONE shared tokenizer, ${K} merges, trained with the English text repeated 5×: most merges go to English)`:`(${K} merges learned separately for each language on 10 sentences)`)}
$('#bpK').addEventListener('input',drawBP);segOn('#bpM',drawBP);segOn('#bpD',drawBP);drawBP();

/* ---------- fertility calculator ---------- */
const TK=[['Jais 3 tokenizer',1.86,'var(--green)'],['cl100k',4.17,'var(--rose)']];
function drawFT(){const W=+$('#ftW').value,C=+$('#ftC').value*1000;$('#ftWo').textContent=W.toLocaleString('en');$('#ftCo').textContent=C.toLocaleString('en');
  const mx=W*4.17;$('#ftBars').innerHTML='<div class="bars">'+TK.map(([n,f,c])=>bar(n,W*f,mx,Math.round(W*f).toLocaleString('en')+' tokens',c)).join('')+'</div>';
  $('#ftCalc').textContent=TK.map(([n,f])=>`${n}: ${f} tokens/word → ${Math.round(W*f).toLocaleString('en')} tokens · a ${C.toLocaleString('en')}-token window holds ≈ ${Math.floor(C/f).toLocaleString('en')} Arabic words`).join('\n')+`\nratio: ${r2(4.17/1.86)}× more tokens (and cost) with cl100k for the same Arabic text\n(fertility figures as reported in the Jais 3 technical report)`}
$('#ftW').addEventListener('input',drawFT);$('#ftC').addEventListener('input',drawFT);drawFT();
