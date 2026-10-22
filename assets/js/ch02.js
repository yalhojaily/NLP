/* Chapter 2 · Words and Tokens — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PL=(n,one,two,few,many)=>n===1?one:n===2?two:(n%100>=3&&n%100<=10)?`${AR(n)} ${few}`:`${AR(n)} ${many}`;
const chip=(s,cls='')=>`<span class="chip ${cls}">${esc(s)}</span>`;

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s2-1','2.1','الكلمات'],['s2-2','2.2','المورفيمات'],['s2-3','2.3','يونيكود'],['s2-4','2.4','BPE'],['s2-5','2.5','المدوّنات'],['s2-6','2.6','التعابير النمطية'],['s2-7','2.7','أدوات يونكس'],['s2-8','2.8','التقطيع بالقواعد'],['s2-9','2.9','المسافة التحريرية'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){
  const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur));
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- 2.1 types vs instances ---------- */
function drawWC(){
  const punct=$('#wcPunct').checked, lower=$('#wcLower').checked;
  let toks=$('#wcIn').value.match(/[\p{L}\p{N}\p{M}'’-]+|[^\s\p{L}\p{N}\p{M}]/gu)||[];
  if(!punct)toks=toks.filter(t=>/[\p{L}\p{N}]/u.test(t));
  if(lower)toks=toks.map(t=>t.toLowerCase());
  const m=new Map();toks.forEach(t=>m.set(t,(m.get(t)||0)+1));
  $('#wcStats').innerHTML=`<span>الأمثلة N = <b>${toks.length}</b></span><span>الأنواع |V| = <b>${m.size}</b></span>`;
  $('#wcTypes').innerHTML=[...m.entries()].map(([t,c])=>`<span class="chip ${c>1?'a':''}">${esc(t)}<small>(${c})</small></span>`).join('');
}
['#wcIn','#wcPunct','#wcLower'].forEach(s=>$(s).addEventListener('input',drawWC));drawWC();

/* ---------- Heaps' law plot ---------- */
function fmtN(v){return v>=1e6?(v/1e6).toFixed(v>=1e7?0:1)+'M':v>=1e3?Math.round(v/1e3)+'K':Math.round(v)+''}
function drawHeaps(){
  const b=+$('#hpB').value,k=+$('#hpK').value;$('#hpBo').textContent=b.toFixed(2);$('#hpKo').textContent=k;
  const W=560,H=260,L=56,R=14,T=14,B=34,Nmax=1e6,Vmax=1.2e5;
  const x=n=>L+(n/Nmax)*(W-L-R), y=v=>H-B-(v/Vmax)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="منحنى قانون هيبس"><defs><clipPath id="hpClip"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs>`;
  for(let i=0;i<=4;i++){const v=Vmax*i/4;s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width="1"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${fmtN(v)}</text>`}
  for(let i=0;i<=4;i++){const n=Nmax*i/4;s+=`<text x="${x(n)}" y="${H-B+16}" text-anchor="middle">${fmtN(n)}</text>`}
  s+=`<text x="${W-R}" y="${H-4}" text-anchor="end">N (words of text)</text><text x="${L}" y="${T-2}" text-anchor="start">|V| (types)</text>`;
  // linear reference beta=1 with same k is off the chart quickly; draw N itself clipped
  let lin='';for(let i=0;i<=60;i++){const n=Nmax*i/60;lin+=(i?'L':'M')+x(n)+' '+y(n)}
  s+=`<path d="${lin}" fill="none" stroke="var(--soft)" stroke-dasharray="4 4" stroke-width="1.2" clip-path="url(#hpClip)"/><text x="${x(1.05e5)}" y="${T+14}" style="fill:var(--soft)">β = 1</text>`;
  let p='';for(let i=0;i<=120;i++){const n=Nmax*i/120;p+=(i?'L':'M')+x(n).toFixed(1)+' '+y(k*Math.pow(n,b)).toFixed(1)}
  s+=`<path d="${p}" fill="none" stroke="var(--green)" stroke-width="2.5" clip-path="url(#hpClip)"/>`;
  const shN=884000,shV=k*Math.pow(shN,b);
  s+=`<circle cx="${x(shN)}" cy="${y(shV)}" r="4.5" fill="var(--amber)"/><circle cx="${x(shN)}" cy="${y(29000)}" r="4" fill="none" stroke="var(--rose)" stroke-width="2"/>`;
  s+=`<text x="${x(shN)-8}" y="${y(Math.max(shV,29000))-10}" text-anchor="end" style="fill:var(--amber)">Shakespeare</text></svg>`;
  $('#hpPlot').innerHTML=s;
  $('#hpCalc').textContent=`|V| = ${k} × 884,000^${b.toFixed(2)} = ${Math.round(shV).toLocaleString('en')} types   (actual Shakespeare: ≈ 29,000)\n|V| = ${k} × 1,000,000^${b.toFixed(2)} = ${Math.round(k*Math.pow(1e6,b)).toLocaleString('en')} types`;
}
['#hpB','#hpK'].forEach(s=>$(s).addEventListener('input',drawHeaps));drawHeaps();
document.addEventListener('themechange',drawHeaps);

/* ---------- number bases ---------- */
function drawNB(){
  let n=parseInt(String($('#nbIn').value).replace(/[^\d]/g,''),10);
  if(isNaN(n)){$('#nbOut').textContent='اكتب رقماً عشرياً';return}
  n=Math.min(Math.max(n,0),1114111);
  const bin=n.toString(2),hex=n.toString(16).toUpperCase();
  const dec=String(n).split('').reverse().map((d,i)=>`${d}×10^${i}`).reverse().join(' + ');
  const hx=hex.split('').reverse().map((d,i)=>`${d}(${parseInt(d,16)})×16^${i}`).reverse().join(' + ');
  const bparts=bin.split('').reverse().map((d,i)=>d==='1'?2**i:0).filter(Boolean).reverse();
  let ch='';try{ch=String.fromCodePoint(n)}catch(e){}
  $('#nbOut').textContent=`decimal  ${n}   = ${dec}\nbinary   ${bin.replace(/\B(?=(\d{4})+$)/g,' ')}   = ${bparts.join(' + ')||0}\nhex      0x${hex}   = ${hx}\nbits needed: ${bin.length}    bytes if written raw: ${Math.ceil(bin.length/8)}${ch&&n>31?`\nas a code point: U+${hex.padStart(4,'0')}  →  "${ch}"`:''}`;
}
$('#nbIn').addEventListener('input',drawNB);$$('[data-nb]').forEach(b=>b.onclick=()=>{$('#nbIn').value=b.dataset.nb;drawNB()});drawNB();

/* ---------- UTF-8 lab ---------- */
function u8parts(cp){
  const bin=(v,n)=>v.toString(2).padStart(n,'0');
  if(cp<0x80)return {row:1,bytes:[[['p','0'],['x',bin(cp,7)]]],groups:{x:bin(cp,7)}};
  if(cp<0x800){const y=cp>>6,x=cp&63;return {row:2,bytes:[[['p','110'],['y',bin(y,5)]],[['p','10'],['x',bin(x,6)]]],groups:{y:bin(y,5),x:bin(x,6)}}}
  if(cp<0x10000){const z=cp>>12,y=(cp>>6)&63,x=cp&63;return {row:3,bytes:[[['p','1110'],['z',bin(z,4)]],[['p','10'],['y',bin(y,6)]],[['p','10'],['x',bin(x,6)]]],groups:{z:bin(z,4),y:bin(y,6),x:bin(x,6)}}}
  const u=cp>>16,z=(cp>>12)&15,y=(cp>>6)&63,x=cp&63,ub=bin(u,5);
  return {row:4,bytes:[[['p','11110'],['u',ub.slice(0,3)]],[['p','10'],['u',ub.slice(3)],['z',bin(z,4)]],[['p','10'],['y',bin(y,6)]],[['p','10'],['x',bin(x,6)]]],groups:{u:ub,z:bin(z,4),y:bin(y,6),x:bin(x,6)}};
}
function drawU8(){
  const s=Array.from($('#u8In').value)[0];if(!s){$('#u8Out').innerHTML='';return}
  const cp=s.codePointAt(0),P=u8parts(cp);
  const hex=cp.toString(16).toUpperCase().padStart(4,'0');
  const cpBits=Object.entries(P.groups).map(([g,b])=>`<span class="${g}">${b}</span>`).join(' ');
  const bytesHtml=P.bytes.map(by=>`<span class="byte">${by.map(([c,b])=>`<span class="${c}">${b}</span>`).join('')}</span>`).join('');
  const real=[...new TextEncoder().encode(s)].map(b=>b.toString(16).toUpperCase().padStart(2,'0'));
  $('#u8Out').innerHTML=`
   <div class="u8row"><span class="k">الحرف</span><span style="font-size:24px">${esc(s)}</span></div>
   <div class="u8row"><span class="k">نقطة الترميز</span><span class="mono ltr">U+${hex} = ${cp.toLocaleString('en')}</span></div>
   <div class="u8row"><span class="k">الصف في الجدول</span><span>الصف ${AR(P.row)}، أي ${PL(P.row,'بايت واحد','بايتان','بايتات','بايتاً')}</span></div>
   <div class="u8row"><span class="k">بِتات النقطة</span><span class="bits">${cpBits}</span></div>
   <div class="u8row"><span class="k">بعد الرزم في القالب</span><span class="bits">${bytesHtml}</span></div>
   <div class="u8row"><span class="k">بالست عشري</span><span class="chips">${real.map(b=>chip(b)).join('')}</span></div>`;
}
$('#u8In').addEventListener('input',drawU8);$$('[data-u8]').forEach(b=>b.onclick=()=>{$('#u8In').value=b.dataset.u8;drawU8()});drawU8();

/* ---------- BPE ---------- */
const SP='␣';
let bW,bMerges,bVocab,bLast;
function bInit(){
  const raw=$('#bpeIn').value.trim().split(/\s+/).filter(Boolean);
  const m=new Map();raw.forEach((w,i)=>{const k=(i?SP:'')+w;m.set(k,(m.get(k)||0)+1)});
  bW=[...m.entries()].map(([w,c],i)=>({sym:Array.from(w),c,i})).sort((a,b)=>b.c-a.c||a.i-b.i);
  bVocab=[];bW.forEach(w=>w.sym.forEach(s=>{if(!bVocab.includes(s))bVocab.push(s)}));
  bVocab.sort((a,b)=>a===SP?-1:b===SP?1:a.localeCompare(b));
  bMerges=[];bLast=null;bRender();
}
function bPairs(){const m=new Map();bW.forEach(w=>{for(let i=0;i<w.sym.length-1;i++){const k=w.sym[i]+'\u0000'+w.sym[i+1];m.set(k,(m.get(k)||0)+w.c)}});return [...m.entries()].map(([k,c],o)=>{const [a,b]=k.split('\u0000');return {a,b,c,o}})}
function bBest(ps){let b=null;ps.forEach(p=>{if(!b||p.c>b.c)b=p});return b}
function mergeSeq(sym,a,b){const out=[];for(let i=0;i<sym.length;i++){if(i<sym.length-1&&sym[i]===a&&sym[i+1]===b){out.push(a+b);i++}else out.push(sym[i])}return out}
function bStep(){const b=bBest(bPairs());if(!b)return false;bW.forEach(w=>w.sym=mergeSeq(w.sym,b.a,b.b));bMerges.push([b.a,b.b,b.c]);const nt=b.a+b.b;if(!bVocab.includes(nt))bVocab.push(nt);bLast=nt;return true}
function bRender(){
  const ps=bPairs(),b=bBest(ps);
  $('#bpeWords').innerHTML=bW.map(w=>{let h='';for(let i=0;i<w.sym.length;i++){const hl=b&&((w.sym[i]===b.a&&w.sym[i+1]===b.b)||(i>0&&w.sym[i-1]===b.a&&w.sym[i]===b.b));h+=chip(w.sym[i],w.sym[i]===bLast?'new':(hl?'hl':''))}return `<div class="wordrow"><span class="cnt">${w.c}×</span><div class="chips" dir="auto">${h}</div></div>`}).join('');
  const top=[...ps].sort((x,y)=>y.c-x.c||x.o-y.o).slice(0,6),mx=top.length?top[0].c:1;
  $('#bpePairs').innerHTML=top.length?top.map(p=>`<div class="pairbar ${p===b?'top':''}"><span class="chips">${chip(p.a)}${chip(p.b)}</span><div class="tr"><div class="fl" style="width:${p.c/mx*100}%"></div></div><span class="v">${p.c}</span></div>`).join(''):'<p class="note">لا أزواج متبقية: كل كلمة صارت رمزاً واحداً.</p>';
  $('#bpeMerges').innerHTML=bMerges.length?bMerges.map((m,i)=>`<div><span class="k">${i+1}.</span>${chip(m[0])}+${chip(m[1])}→${chip(m[0]+m[1],'new')}<span class="k">(${m[2]})</span></div>`).join(''):'<span class="note" style="direction:rtl">لم يحدث دمج بعد.</span>';
  $('#bpeVocab').innerHTML=bVocab.map(s=>chip(s,s===bLast?'new':'')).join('');
  $('#bpeVN').textContent=AR(bVocab.length)+' رمزاً';
  $('#bpeStatus').textContent=b?`التالي: «${b.a}» + «${b.b}» (${AR(b.c)} مرات)`:'اكتمل الدمج';
  $('#bpeStep').disabled=$('#bpe5').disabled=!b;
  drawEnc();
}
function drawEnc(){
  const w=$('#encIn').value.trim();if(!w){$('#encSteps').innerHTML='';return}
  let sym=Array.from(($('#encSp').checked?SP:'')+w);
  let h=`<div class="encstep"><span class="rule">start (characters)</span><span class="chips">${sym.map(s=>chip(s,'ghost')).join('')}</span></div>`;
  bMerges.forEach(([a,b],i)=>{const nx=mergeSeq(sym,a,b);if(nx.length!==sym.length){sym=nx;h+=`<div class="encstep"><span class="rule">rule ${i+1}: ${esc(a)} + ${esc(b)}</span><span class="chips">${sym.map(s=>chip(s,s===a+b?'new':'')).join('')}</span></div>`}});
  h+=`<p class="note" style="margin:6px 0 0">النتيجة: ${PL(sym.length,'رمز واحد','رمزان','رموز','رمزاً')}. ${bMerges.length?'القواعد التي لم تجد ما تدمجه لا تظهر.':'لم تتعلم دمجات بعد، فاضغط «الدمج التالي» في المختبر فوق.'}</p>`;
  $('#encSteps').innerHTML=h;
}
$('#bpeStep').onclick=()=>{bStep();bRender()};
$('#bpe5').onclick=()=>{for(let i=0;i<5;i++)if(!bStep())break;bRender()};
$('#bpeReset').onclick=bInit;
$('#bpeIn').addEventListener('input',bInit);
['#encIn','#encSp'].forEach(s=>$(s).addEventListener('input',drawEnc));
$$('[data-bpe]').forEach(b=>b.onclick=()=>{$('#bpeIn').value=b.dataset.bpe;$('#encIn').value=/[a-z]/i.test(b.dataset.bpe)?'renewset':'مكتوب';bInit()});
bInit();

/* ---------- regex lab ---------- */
function rxRun(pat,text,flags){
  const re=new RegExp(pat,flags);const out=[];let m;let guard=0;
  while((m=re.exec(text))&&guard++<5000){out.push({i:m.index,s:m[0],g:m.slice(1)});if(m[0]==='')re.lastIndex++}
  return out;
}
function rxHighlight(text,ms){
  let h='',p=0;ms.forEach(m=>{h+=esc(text.slice(p,m.i));h+=m.s===''?'<mark class="z"></mark>':`<mark>${esc(m.s)}</mark>`;p=m.i+m.s.length});
  return h+esc(text.slice(p));
}
function drawRX(){
  const pat=$('#rxPat').value,text=$('#rxText').value,flags='gmu'+($('#rxI').checked?'i':'');
  try{
    const ms=rxRun(pat,text,flags);
    $('#rxOut').innerHTML=rxHighlight(text,ms)||'&nbsp;';
    const g=ms.find(m=>m.g.length&&m.g.some(x=>x!==undefined));
    $('#rxInfo').innerHTML=ms.length?`${PL(ms.length,'تطابق واحد','تطابقان','تطابقات','تطابقاً')}. أول تطابق: <code>${esc(ms[0].s)||'(نص فارغ)'}</code>${g?` · المجموعات: ${g.g.map((x,i)=>`<code>\\${i+1} = ${esc(x??'')}</code>`).join(' ')}`:''}`:'لا تطابق.';
  }catch(e){$('#rxOut').innerHTML=esc(text);$('#rxInfo').innerHTML=`<span class="rx-err">نمط غير صالح: ${esc(e.message)}</span>`}
}
const RXP=[
 ['[mM]ary',"Mary Ann stopped by Mona's"],['[abc]','In uomini, in soldati'],['[0-9]','plenty of 7 to 5'],['[A-Z]',"we should call it 'Drenched Blossoms'"],
 ['[^A-Z]','Oyfn pripetchik'],['[^Ss]',"I have no exquisite reason for't"],['colou?r','color or colour?'],['baa+!','b! ba! baa! baaaa!'],['ba*!','b! ba! baa! baaaa!'],
 ['[0-9]+','There are 299 bottles, 3 cups and 42 plates'],['rose.*rose','a rose is a rose is a rose'],['^The','The dog\nthe cat\nThe end'],['\\b99\\b','There are 99 bottles\nThere are 299 bottles\nIt costs $99'],
 ['cat|dog','my cat and your dog'],['gupp(y|ies)','one guppy, two guppies'],['the*','theeeee thethe'],['[a-z]*','once upon a time'],['[a-z]*?','once upon a time'],
 ['\\b[tT]he\\b','The other one is there, the end'],['\\b([A-Za-z]+)\\s+\\1\\b','Paris in the the spring'],['(\\d{2})/(\\d{2})/(\\d{4})','The date is 10/15/2011'],['^(?![tT])(\\w+)\\b','Tomorrow is fine\nyesterday was not\nToday is today']
];
$('#rxPresets').innerHTML=RXP.map((p,i)=>`<button class="btn" data-i="${i}"><span dir="ltr">${esc(p[0])}</span></button>`).join('');
$$('#rxPresets button').forEach(b=>b.onclick=()=>{const p=RXP[+b.dataset.i];$('#rxPat').value=p[0];$('#rxText').value=p[1];$('#rxI').checked=false;drawRX()});
['#rxPat','#rxText','#rxI'].forEach(s=>$(s).addEventListener('input',drawRX));drawRX();

/* the / [tT]he / \b[tT]he\b comparison */
(function(){
  const t='The cat sat on the mat. Is there other cat? THE END.';
  $('#theCmp').innerHTML=['the','[tT]he','\\b[tT]he\\b'].map(p=>{const ms=rxRun(p,t,'g');return `<div class="rxcmp"><code class="ltr">${esc(p)}</code><div class="rx-out" dir="ltr">${rxHighlight(t,ms)}</div></div>`}).join('')+
  '<p class="note" style="margin:6px 0 0">الأول يفوّت The (سلبية كاذبة) ويطابق داخل there وother (إيجابيات كاذبة). الثاني يلتقط The لكنه ما زال يطابق داخل الكلمات. والثالث صحيح. (THE بأحرف كبيرة كلها تبقى خارج الأنماط الثلاثة، فهي سلبية كاذبة متبقية.)</p>';
})();

/* ELIZA */
const ELIZA=[
 [/.*\bYOU ARE (DEPRESSED|SAD)\b.*/,'I AM SORRY TO HEAR YOU ARE $1','.* YOU ARE (DEPRESSED|SAD) .*'],
 [/.*\bALWAYS\b.*/,'CAN YOU THINK OF A SPECIFIC EXAMPLE','.* ALWAYS .*'],
 [/.*\bYOUR (MOTHER|FATHER|SISTER|BROTHER)\b.*/,'TELL ME MORE ABOUT YOUR FAMILY','.* YOUR (MOTHER|FATHER|…) .*'],
 [/.*\bYOUR (\w+) MADE YOU (.*?)[.!]?$/,'YOUR $1 MADE YOU $2','.* YOUR (\\w+) MADE YOU (.*)'],
 [/^YOU NEED (.*?)[.!]?$/,'WHAT WOULD IT MEAN TO YOU IF YOU GOT $1','YOU NEED (.*)'],
 [/.*/,'PLEASE GO ON','.* (fallback)']
];
function eliza(inp){
  let s=' '+inp.toUpperCase().replace(/[’]/g,"'")+' ';
  const swaps=[[/\bMY\b/g,'YOUR'],[/\bI'M\b/g,'YOU ARE'],[/\bI AM\b/g,'YOU ARE'],[/\bME\b/g,'YOU'],[/\bI\b/g,'YOU']];
  swaps.forEach(([a,b])=>s=s.replace(a,b));s=s.replace(/^.*?\b(HE|SHE|THEY) SAYS\s+/,'').trim();
  for(const [re,out,show] of ELIZA){const m=s.match(re);if(m)return {r:s.replace(re,out),rule:show,mid:s}}
}
function elSend(){
  const v=$('#elIn').value.trim();if(!v)return;const r=eliza(v);
  $('#elLog').innerHTML+=`<div class="u">User: ${esc(v)}</div><div class="e">ELIZA: ${esc(r.r)}</div>`;$('#elLog').scrollTop=1e6;
  $('#elRule').innerHTML=`بعد الاستبدالات الأولى صار المدخل: <code>${esc(r.mid)}</code> · القاعدة المطبّقة: <code>${esc(r.rule)}</code>`;$('#elIn').value='';
}
$('#elGo').onclick=elSend;$('#elIn').addEventListener('keydown',e=>{if(e.key==='Enter')elSend()});
$('#elLog').innerHTML='<div class="e">ELIZA: HOW DO YOU DO. PLEASE TELL ME YOUR PROBLEM</div>';

/* GPT-2 pretokenizer */
const G2=/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
function drawG2(){const t=$('#g2In').value.replace(/[’]/g,"'");const parts=t.match(G2)||[];$('#g2Out').innerHTML=parts.map(p=>chip(p.replace(/ /g,SP))).join('')+`<span class="note" style="margin-inline-start:8px">← ${PL(parts.length,'قطعة واحدة','قطعتان','قطع','قطعة')}</span>`}
$('#g2In').addEventListener('input',drawG2);drawG2();

/* ---------- 2.7 unix pipeline ---------- */
const UX=[
 ['cat sh.txt','النص كما هو.'],
 ["tr -sc 'A-Za-z' '\\n' < sh.txt",'كل تسلسل من غير الحروف (مسافات، علامات ترقيم) صار سطراً جديداً، فصارت كل كلمة في سطر.'],
 ["... | tr A-Z a-z",'حُوّلت الحروف الكبيرة إلى صغيرة، فصار And وand كلمة واحدة.'],
 ['... | sort','رُتّبت الأسطر أبجدياً، فتجاورت الكلمات المتطابقة.'],
 ['... | uniq -c','دُمجت الأسطر المتطابقة المتجاورة وكُتب عددها قبلها.'],
 ['... | sort -n -r','رُتّبت حسب العدد (‎-n رقمياً، ‎-r تنازلياً). الأعلى في الأعلى.']
];
let uxI=5;
$('#uxSteps').innerHTML=UX.map((u,i)=>`<button class="btn" data-i="${i}">${i?['tr','tr A-Z a-z','sort','uniq -c','sort -nr'][i-1]:'cat'}</button>`).join('');
function uxRun(){
  const t=$('#uxIn').value;let lines;
  if(uxI===0)return t;
  let words=t.split(/[^A-Za-z]+/).filter(Boolean);
  if(uxI>=2)words=words.map(w=>w.toLowerCase());
  if(uxI===1||uxI===2)return words.join('\n');
  words.sort((a,b)=>a<b?-1:a>b?1:0);
  if(uxI===3)return words.join('\n');
  const c=[];words.forEach(w=>{if(c.length&&c[c.length-1][1]===w)c[c.length-1][0]++;else c.push([1,w])});
  if(uxI===5)c.sort((a,b)=>b[0]-a[0]);
  return c.map(([n,w])=>String(n).padStart(4)+' '+w).join('\n');
}
function drawUX(){
  $$('#uxSteps button').forEach((b,i)=>b.classList.toggle('on',i===uxI));
  $('#uxCmd').textContent=uxI===0?UX[0][0]:"tr -sc 'A-Za-z' '\\n' < sh.txt"+(uxI>=2?' | tr A-Z a-z':'')+(uxI>=3?' | sort':'')+(uxI>=4?' | uniq -c':'')+(uxI>=5?' | sort -n -r':'');
  $('#uxOut').textContent=uxRun();$('#uxNote').textContent=UX[uxI][1];
}
$$('#uxSteps button').forEach(b=>b.onclick=()=>{uxI=+b.dataset.i;drawUX()});$('#uxIn').addEventListener('input',drawUX);drawUX();

/* ---------- 2.8 NLTK regex tokenizer ---------- */
const NK=/(?:[A-Z]\.)+|\w+(?:-\w+)*|\$?\d+(?:\.\d+)?%?|\.\.\.|[\][.,;"'?():_`-]/g;
function drawNK(){const p=$('#nkIn').value.match(NK)||[];$('#nkOut').innerHTML=p.map(x=>chip(x)).join('')+`<span class="note" style="margin-inline-start:8px">← ${PL(p.length,'رمز واحد','رمزان','رموز','رمزاً')}</span>`}
$('#nkIn').addEventListener('input',drawNK);drawNK();

/* ---------- 2.9 edit distance ---------- */
let eA,eB,eD,eP,eSub,eK=0,eTotal,eTimer=null;
function edCompute(){
  eA=Array.from($('#edA').value.slice(0,14));eB=Array.from($('#edB').value.slice(0,14));eSub=+$('#edSub').value;
  const n=eA.length,m=eB.length;eD=[];eP=[];
  for(let i=0;i<=n;i++){eD[i]=[];eP[i]=[];for(let j=0;j<=m;j++){
    if(i===0&&j===0){eD[i][j]=0;eP[i][j]='';continue}
    if(i===0){eD[i][j]=j;eP[i][j]='←';continue}
    if(j===0){eD[i][j]=i;eP[i][j]='↑';continue}
    const s=eA[i-1]===eB[j-1]?0:eSub,c=[eD[i-1][j-1]+s,eD[i][j-1]+1,eD[i-1][j]+1],mn=Math.min(...c);
    eD[i][j]=mn;eP[i][j]=(c[0]===mn?'↖':'')+(c[1]===mn?'←':'')+(c[2]===mn?'↑':'');}}
  eTotal=n*m;eK=0;edStop();edDraw();
}
function edTrace(){
  let i=eA.length,j=eB.length;const path=[[i,j]],ops=[];
  while(i>0||j>0){const p=eP[i][j];
    if(p.includes('↖')&&i>0&&j>0){ops.push([eA[i-1],eB[j-1],eA[i-1]===eB[j-1]?'':'s']);i--;j--}
    else if(p.includes('←')&&j>0){ops.push(['*',eB[j-1],'i']);j--}
    else{ops.push([eA[i-1],'*','d']);i--}
    path.push([i,j])}
  return {path,ops:ops.reverse()};
}
function edDraw(){
  const n=eA.length,m=eB.length,arrows=$('#edArrows').checked;
  const ci=eK>0&&eK<=eTotal?Math.floor((eK-1)/m)+1:-1,cj=eK>0&&eK<=eTotal?((eK-1)%m)+1:-1;
  const filled=(i,j)=>i===0||j===0||((i-1)*m+j)<=eK,done=eK>=eTotal,tr=done?edTrace():null;
  const onPath=(i,j)=>tr&&tr.path.some(p=>p[0]===i&&p[1]===j);
  let t='<table class="dp"><tr><th></th><th>#</th>'+eB.map(b=>`<th>${esc(b)}</th>`).join('')+'</tr>';
  for(let i=0;i<=n;i++){t+=`<tr><th>${i?esc(eA[i-1]):'#'}</th>`;
    for(let j=0;j<=m;j++){let cls=filled(i,j)?'':'empty';
      if(i===ci&&j===cj)cls='cur';else if(ci>0&&((i===ci-1&&j===cj)||(i===ci&&j===cj-1)||(i===ci-1&&j===cj-1)))cls='cand';else if(onPath(i,j))cls='path';
      t+=`<td class="${cls}">${arrows&&filled(i,j)&&eP[i][j]?`<span class="ar">${eP[i][j]}</span>`:''}${eD[i][j]}</td>`}
    t+='</tr>'}
  $('#edTable').innerHTML=t+'</table>';
  const F=$('#edF');
  if(ci>0){const a=eA[ci-1],b=eB[cj-1],s=a===b?0:eSub;
    F.textContent=`D[${ci},${cj}] = min( D[${ci-1},${cj}]+1 = ${eD[ci-1][cj]+1}    (delete ${a})\n              D[${ci},${cj-1}]+1 = ${eD[ci][cj-1]+1}    (insert ${b})\n              D[${ci-1},${cj-1}]+${s} = ${eD[ci-1][cj-1]+s}    (${s?'substitute '+a+'→'+b:'match '+a}) )  = ${eD[ci][cj]}`+(done?`\n\nminimum edit distance = D[${n},${m}] = ${eD[n][m]}`:'')}
  else if(done)F.textContent=`minimum edit distance = D[${n},${m}] = ${eD[n][m]}`;
  else F.textContent='D[i,0] = i  and  D[0,j] = j   (first row and column: cost from the empty string)';
  $('#edAlign').innerHTML=tr?`<div class="sub-h">المحاذاة من التتبّع العكسي</div><div class="scroll"><div class="align2">${tr.ops.map(o=>`<div><span>${esc(o[0])}</span><span>|</span><span>${esc(o[1])}</span><span class="op-${o[2]||'m'}">${o[2]||' '}</span></div>`).join('')}</div></div><p class="note">d حذف · i إدراج · s استبدال. الخانات البرتقالية في الجدول هي المسار.</p>`:'';
  $('#edStep').disabled=$('#edPlay').disabled=done;
}
function edStop(){if(eTimer){clearInterval(eTimer);eTimer=null;$('#edPlay').textContent='▶ تشغيل'}}
$('#edStep').onclick=()=>{edStop();if(eK<eTotal){eK++;edDraw()}};
$('#edAll').onclick=()=>{edStop();eK=eTotal;edDraw()};
$('#edReset').onclick=()=>{edStop();eK=0;edDraw()};
$('#edPlay').onclick=()=>{if(eTimer){edStop();return}$('#edPlay').textContent='❚❚ إيقاف';eTimer=setInterval(()=>{if(eK>=eTotal){edStop();edDraw();return}eK++;edDraw()},matchMedia('(prefers-reduced-motion: reduce)').matches?40:240)};
['#edA','#edB'].forEach(s=>$(s).addEventListener('input',edCompute));$('#edSub').addEventListener('change',edCompute);$('#edArrows').addEventListener('change',edDraw);
$$('[data-ed]').forEach(b=>b.onclick=()=>{const [a,c,s]=b.dataset.ed.split('|');$('#edA').value=a;$('#edB').value=c;$('#edSub').value=s;edCompute();eK=eTotal;edDraw()});
edCompute();

/* ---------- glossary ---------- */
const G=[['تقطيع','tokenization','فصل الكلمات وأجزائها من النص المتصل.'],['نوع الكلمة','word type','كلمة مختلفة؛ عددها |V|.'],['مثال الكلمة','word instance','كل ظهور لكلمة؛ عددها N.'],['قانون هيبس','Heaps\' / Herdan\'s law','|V| = kN^β: الأنواع تنمو أبطأ من النص ولا تتوقف.'],['كلمات وظيفية','function words','كلمات نحوية مثل «في» و«من»، عددها ثابت تقريباً.'],['كلمة مجهولة','unknown word','كلمة لم يرها النموذج في التدريب.'],['مورفيم','morpheme','أصغر وحدة تحمل معنى.'],['جذر / لاصقة','root / affix','المعنى الأساسي / معنى مضاف.'],['تصريفي / اشتقاقي','inflectional / derivational','لاصقة نحوية منتظمة / لاصقة تغيّر نوع الكلمة.'],['كلمة ملتصقة','clitic','مورفيم كالكلمة لكنه ملتصق بغيره (وَ، بِـ، \'ve).'],['يونيكود','Unicode','معيار يعطي كل حرف في العالم رقماً.'],['نقطة ترميز','code point','الرقم الفريد للحرف، مثل U+0639.'],['شكل طباعي','glyph','الصورة المرسومة للحرف في خط معيّن.'],['UTF‑8','UTF-8','ترميز متغير الطول من ١ إلى ٤ بايتات.'],['بِت / بايت','bit / byte','خانة ثنائية / ٨ بِتات (٢٥٦ قيمة).'],['BPE','byte-pair encoding','تقطيع بدمج أكثر الأزواج تكراراً.'],['أجزاء الكلمات','subwords','رموز أصغر من الكلمة.'],['تقطيع مسبق','pretokenization','تقسيم أولي بالتعابير النمطية قبل BPE.'],['تبديل اللغات','code switching','خلط لغتين في عبارة واحدة.'],['ورقة بيانات','datasheet','وثيقة تصف أصل المدوّنة وخصائصها.'],['تعبير نمطي','regular expression','لغة لوصف أنماط النصوص.'],['نجمة كلين','Kleene *','صفر مرة أو أكثر.'],['مرساة','anchor','^ أول السطر، $ آخره، \\b حد كلمة.'],['مجموعة التقاط','capture group','أقواس تحفظ ما طابقته لاستخدامه بـ \\1.'],['نظرة أمامية','lookahead','(?=…) أو (?!…) بلا استهلاك حروف.'],['إيجابية كاذبة','false positive','تطابق خاطئ.'],['سلبية كاذبة','false negative','تطابق فائت.'],['المسافة التحريرية','minimum edit distance','أقل عدد عمليات لتحويل نص إلى آخر.'],['محاذاة','alignment','مطابقة أجزاء نصين.'],['برمجة ديناميكية','dynamic programming','حل المسألة من حلول مسائل أصغر محفوظة في جدول.'],['تتبّع عكسي','backtrace','اتباع الأسهم من آخر الجدول لاستخراج المسار.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+G.map(g=>`<tr><td><b>${g[0]}</b></td><td class="en">${esc(g[1])}</td><td>${esc(g[2])}</td></tr>`).join('');
