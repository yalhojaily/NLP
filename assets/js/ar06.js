/* Arabic track · Lesson 6: Arabic syntax and parsing */
const SECS=[['a6-1','١','الترتيب والمطابقة'],['a6-2','٢','الفاعل المستتر'],['a6-3','٣','أشجار الاعتماد'],['ex','','للمراجعة']];
const GL=[['ترتيب الكلمات','word order (VSO / SVO)','ترتيب الفعل والفاعل والمفعول.'],['المطابقة','agreement','توافق الفعل وفاعله في الجنس والعدد.'],['الإعراب','case marking','حركات أواخر الكلمات الدالة على الوظيفة.'],['الضمير المستتر','pro-drop / null subject','فاعل غير ملفوظ تدل عليه لاحقة الفعل.'],['العائد الصفري','zero anaphor','إشارة غير ملفوظة (الفصل ٢٤).'],['الجملة الاسمية','nominal sentence','مبتدأ وخبر بلا فعل ولا رابط.'],['الإضافة','idafa (construct state)','تركيب «كتاب النحو»، وسمه nmod في UD.'],['UD','Universal Dependencies','مخطط وسم اعتمادي موحّد لكل اللغات.'],['PADT','Prague Arabic Dependency Treebank','شجرة اعتماد عربية داخل UD.'],['CATiB','Columbia Arabic Treebank','مخطط وسم عربي بعلاقات قليلة قريبة من النحو العربي.']];
initPage(SECS,GL);

/* ---------- order & agreement ---------- */
const SB=[['الطالبُ','m','sg'],['الطلابُ','m','pl'],['الطالبةُ','f','sg'],['الطالباتُ','f','pl']];
const POST={m:{sg:'كَتَبَ',pl:'كَتَبُوا'},f:{sg:'كَتَبَتْ',pl:'كَتَبْنَ'}};
const U=(t,c,l)=>`<span style="border-bottom:3px solid var(--${c});padding:0 4px;margin:0 3px">${t}<sub style="font-family:var(--f-head);font-size:11px;color:var(--${c});margin-inline-start:4px">${l}</sub></span>`;
function drawWO(){const [s,g,n]=SB[+segVal('#woS','i')],o=segVal('#woO','o');const pre=g==='m'?'كَتَبَ':'كَتَبَتِ',post=POST[g][n];
  const V=o==='svo'?post:pre,S=U(s,'green','فاعل'),Vv=U(V,'amber','فعل'),O=U('الدرسَ','math','مفعول');
  const seq=o==='vso'?[Vv,S,O]:o==='svo'?[S,Vv,O]:[Vv,O,S];$('#woOut').innerHTML=seq.join(' ');
  const plain=(o==='vso'?[V,s,'الدرسَ']:o==='svo'?[s,V,'الدرسَ']:[V,'الدرسَ',s]).map(stripH).join(' ');
  $('#woCalc').textContent=`subject: ${g==='m'?'masculine':'feminine'} ${n==='sg'?'singular':'plural'} · verb: ${stripH(V)}\n`+(o==='svo'?'verb AFTER subject → agrees in gender AND number':'verb BEFORE subject → always singular, agrees in gender only')+`\nwithout diacritics: “${plain}”`+(o==='vos'?'\n→ only the case endings (ُ on the subject, َ on the object) mark who wrote; undiacritized, meaning must decide':'')}
segOn('#woS',drawWO);segOn('#woO',drawWO);drawWO();

/* ---------- pro-drop ---------- */
const PF=[['كَتَبْتُ','أنا','1','مفرد',''],['كَتَبْنا','نحن','1','جمع',''],['كَتَبْتَ','أنتَ','2','مفرد','مذكر'],['كَتَبْتِ','أنتِ','2','مفرد','مؤنث'],['كَتَبْتُما','أنتما','2','مثنى',''],['كَتَبْتُم','أنتم','2','جمع','مذكر'],['كَتَبْتُنَّ','أنتنّ','2','جمع','مؤنث'],['كَتَبَ','هو','3','مفرد','مذكر'],['كَتَبَتْ','هي','3','مفرد','مؤنث'],['كَتَبا','هما','3','مثنى','مذكر'],['كَتَبَتا','هما','3','مثنى','مؤنث'],['كَتَبُوا','هم','3','جمع','مذكر'],['كَتَبْنَ','هنّ','3','جمع','مؤنث']];
let pfI=0;
function drawPF(){$('#pdOut').innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px">'+PF.map((f,i)=>`<button class="btn${i===pfI?' pri':''}" data-i="${i}" style="font-family:'Noto Naskh Arabic',serif;font-size:21px">${f[0]}</button>`).join('')+'</div>';
  $$('#pdOut button').forEach(b=>b.addEventListener('click',()=>{pfI=+b.dataset.i;drawPF()}));const f=PF[pfI],bare=stripH(f[0]),same=PF.filter(x=>stripH(x[0])===bare);
  $('#pdCalc').textContent=`${f[0]} = subject “${f[1]}” (person ${f[2]}, ${f[3]}${f[4]?', '+f[4]:''}) hidden in the suffix\ndependency tree: the verb is the root, with NO nsubj token\nundiacritized “${bare}”: ${same.length} reading${same.length>1?'s':''} (${same.map(x=>x[1]).join('، ')})`}
drawPF();

/* ---------- dependency arcs (RTL) ---------- */
const DP=[{g:[['قرأ'],['الطالبُ'],['كتابَ'],['النحوِ'],['بِـ','المكتبةِ']],a:[[0,1,'nsubj'],[0,2,'obj'],[2,3,'nmod'],[0,5,'obl'],[5,4,'case']],r:0},
 {g:[['الطالبُ'],['مجتهدٌ']],a:[[1,0,'nsubj']],r:1},
 {g:[['وَ','كَتَبَ','ـها'],['الطالبُ'],['أمسِ']],a:[[1,0,'cc'],[1,2,'obj'],[1,3,'nsubj'],[1,4,'obl']],r:1}];
function drawDP(){const d=DP[+segVal('#dpS','i')],seg=+segVal('#dpG','g');
  // tokens -> nodes
  const tokG=[];d.g.forEach((gr,gi)=>gr.forEach(()=>tokG.push(gi)));
  const nodes=seg?tokG.map((g,i)=>({t:d.g[g][d.g[g].length>1?d.g[g].slice(0,i-tokG.indexOf(g)+1).length-1:0]})).map((x,i)=>({t:d.g[tokG[i]][i-tokG.indexOf(tokG[i])]})):d.g.map(gr=>({t:gr.join('').replace(/ـ/g,'')}));
  const nid=i=>seg?i:tokG[i];
  const arcs=d.a.map(([h,dd,l])=>[nid(h),nid(dd),l]).filter(([h,dd])=>h!==dd);const lost=d.a.filter(([h,dd])=>nid(h)===nid(dd));
  const n=nodes.length,step=Math.max(90,Math.min(130,560/n)),W=Math.max(360,n*step+40),X=i=>W-30-step/2-i*step,base=200;
  let s=`<svg viewBox="0 0 ${W} 240" style="width:${W}px;max-width:none;display:block;margin:0 auto" role="img"><defs><marker id="dpA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="var(--math)"/></marker></defs>`;
  arcs.forEach(([h,dd,l])=>{const x1=X(h),x2=X(dd),hgt=30+Math.abs(h-dd)*28,mx=(x1+x2)/2;s+=`<path d="M${x1},${base-22} C${x1},${base-22-hgt} ${x2},${base-22-hgt} ${x2},${base-24}" fill="none" stroke="var(--math)" stroke-width="1.8" marker-end="url(#dpA)"/><text x="${mx}" y="${base-22-hgt*0.75-4}" font-size="12" text-anchor="middle" fill="var(--math)" font-family="Noto Sans Mono" style="paint-order:stroke;stroke:var(--paper);stroke-width:4px">${l}</text>`});
  const rr=nid(d.r);s+=`<line x1="${X(rr)}" y1="14" x2="${X(rr)}" y2="${base-26}" stroke="var(--amber)" stroke-width="1.8" marker-end="url(#dpA)"/><text x="${X(rr)+6}" y="26" font-size="12" fill="var(--amber)" font-family="Noto Sans Mono">root</text>`;
  nodes.forEach((nd,i)=>{s+=`<text x="${X(i)}" y="${base}" font-size="21" text-anchor="middle" fill="var(--ink)" font-family="Noto Naskh Arabic, serif">${nd.t}</text>`});
  $('#dpSvg').innerHTML=s+'</svg>';
  $('#dpCalc').textContent=`${n} nodes · ${arcs.length} arcs + root`+(lost.length?`\nlost inside an orthographic word: ${lost.map(a=>a[2]).join(', ')} → segment clitics first`:'')+(d.r===1&&d.g.length===2?'\nnominal sentence: no verb, no copula; the predicate مجتهدٌ is the root':'')}
segOn('#dpS',drawDP);segOn('#dpG',drawDP);drawDP();
