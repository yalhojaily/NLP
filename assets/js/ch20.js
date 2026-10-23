/* Chapter 20 · Dependency Parsing — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2),r1=v=>(+v).toFixed(1);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s20-1','20.1','علاقات الاعتماد'],['s20-2','20.2','التحليل الانتقالي'],['s20-3','20.3','التحليل بالرسوم'],['s20-4','20.4','التقييم: LAS وUAS'],['ex','','الخلاصة والمسرد']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ================= constituency trees (shared with ch19) ================= */
function parseBr(s){s=s.replace(/\[/g,'(').replace(/\]/g,')');const tk=s.match(/\(|\)|[^\s()]+/g)||[];let p=0;
  function node(){if(tk[p]!=='(')throw 'expected (';p++;let l='';if(tk[p]!=='('&&tk[p]!==')'){l=tk[p];p++}const c=[];
    while(p<tk.length&&tk[p]!==')'){if(tk[p]==='(')c.push(node());else{const t=tk[p++];const m=t.match(/^(.+)\/([^/]+)$/);c.push(m?{l:m[2],c:[{w:m[1]}]}:{w:t})}}
    if(tk[p]!==')')throw 'unbalanced';p++;return {l,c}}
  let t=node();while(!t.l&&t.c.length===1&&t.c[0].c)t=t.c[0];return t}
function leaves(t,a=[]){if(t.w!==undefined)a.push(t);else t.c.forEach(c=>leaves(c,a));return a}
function isPre(t){return t.c&&t.c.length===1&&t.c[0].w!==undefined}
function spans(t,o={i:0},out=[]){if(t.w!==undefined){o.i++;return out}const s=o.i;t.c.forEach(c=>spans(c,o,out));if(!isPre(t))out.push([s,o.i,t.l.replace(/-.*$/,'')]);t.s=s;t.e=o.i;return out}
function drawTree(t,opt={}){const L=leaves(t);let x=0;const xs=new Map();
  (function pl(n){if(!n.c)return;if(isPre(n))n.c[0].pl=(n.l+(n.head?`(${n.head})`:'')).length;n.c.forEach(pl)})(t);
  L.forEach(lf=>{const w=Math.max(54,lf.w.length*8.2+16,(lf.pl||0)*7.4+14);xs.set(lf,x+w/2);x+=w});
  let maxD=0;(function dep(n,d){n.d=d;if(n.c)n.c.forEach(c=>dep(c,d+1));else maxD=Math.max(maxD,d)})(t,0);
  (function px(n){if(n.w!==undefined)return xs.get(n);const v=n.c.map(px);n.x=(v[0]+v[v.length-1])/2;return n.x})(t);
  const W=Math.max(x,120)+20,lh=opt.lh||46,H=(maxD)*lh+40,yOf=n=>n.w!==undefined?maxD*lh+24:n.d*lh+20;
  let s=`<svg class="map" viewBox="-10 0 ${W} ${H}" role="img" style="width:${W}px;max-width:none;display:block;margin:0 auto">`;
  (function ln(n){if(!n.c)return;n.c.forEach(c=>{const cx=c.w!==undefined?xs.get(c):c.x;s+=`<line x1="${n.x}" y1="${yOf(n)+5}" x2="${cx}" y2="${yOf(c)-13}" stroke="${c.hlE?'var(--rose)':'var(--rule)'}" stroke-width="${c.hlE?2:1.2}"/>`;ln(c)})})(t);
  (function lb(n){if(n.w!==undefined){s+=`<text x="${xs.get(n)}" y="${yOf(n)}" font-size="14" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${esc(n.w)}</text>`;return}
    const pre=isPre(n),txt=n.l+(n.head?`(${n.head})`:''),col=n.hl?'var(--rose)':n.new?'var(--green)':pre?'var(--amber)':'var(--math)';
    s+=`<text x="${n.x}" y="${yOf(n)}" font-size="${pre?12:13}" text-anchor="middle" fill="${col}" font-weight="${n.hl||n.new?700:500}" font-family="Noto Sans Mono">${esc(txt)}</text>`;n.c.forEach(lb)})(t);
  return s+'</svg>'}


/* ================= arc diagrams ================= */
/* words: array; deps: [{h,d,l}] with 1-based word indices, h=0 → root */
function arcSvg(words,deps,opt={}){const gap=14,ws=words.map(w=>Math.max(38,String(w).length*8.6+gap));let x=12;const cx=[0];ws.forEach(w=>{cx.push(x+w/2);x+=w});const W=Math.max(x+12,200);
  const nonRoot=deps.map((a,k)=>({...a,k})).filter(a=>a.h>0);const lvl={};
  nonRoot.sort((a,b)=>Math.abs(a.h-a.d)-Math.abs(b.h-b.d)).forEach(a=>{const lo=Math.min(a.h,a.d),hi=Math.max(a.h,a.d);let m=0;nonRoot.forEach(b=>{if(b.k===a.k||lvl[b.k]===undefined)return;const l2=Math.min(b.h,b.d),h2=Math.max(b.h,b.d);if(l2>=lo&&h2<=hi)m=Math.max(m,lvl[b.k])});lvl[a.k]=m+1});
  const maxL=Math.max(1,...Object.values(lvl)),step=opt.step||21,base=maxL*step+44,H=base+(opt.tags?40:26);
  const yOf=k=>base-14-lvl[k]*step;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="width:${W}px;max-width:none;display:block">`;
  s+=`<defs><marker id="ah${opt.id||''}" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L8,0L4,8z" fill="context-stroke"/></marker></defs>`;
  deps.forEach((a,k)=>{const col=opt.col?opt.col(a,k):'var(--math)',sw=opt.sw?opt.sw(a,k):1.4;
    if(a.h===0){const xx=cx[a.d];s+=`<g data-k="${k}" style="cursor:${opt.click?'pointer':'default'}"><line x1="${xx}" y1="10" x2="${xx}" y2="${base-16}" stroke="${col}" stroke-width="${sw}" marker-end="url(#ah${opt.id||''})"/><rect x="${xx-15}" y="4" width="30" height="13" rx="3" fill="var(--paper)" stroke="${col}"/><text x="${xx}" y="14" font-size="9.5" text-anchor="middle" fill="${col}" font-family="Noto Sans Mono">root</text></g>`;return}
    const x1=cx[a.h]+(a.d>a.h?4:-4),x2=cx[a.d]+(a.d>a.h?-3:3),y=yOf(k),r=5,dir=x2>x1?1:-1;
    s+=`<g data-k="${k}" style="cursor:${opt.click?'pointer':'default'}"><path d="M${x1},${base-16} L${x1},${y+r} Q${x1},${y} ${x1+dir*r},${y} L${x2-dir*r},${y} Q${x2},${y} ${x2},${y+r} L${x2},${base-16}" fill="none" stroke="${col}" stroke-width="${sw}" marker-end="url(#ah${opt.id||''})"/>`;
    if(a.l){const lw=a.l.length*6.2+8,mx=(x1+x2)/2;s+=`<rect x="${mx-lw/2}" y="${y-7}" width="${lw}" height="13" rx="3" fill="var(--paper)" stroke="${col}" stroke-width=".8"/><text x="${mx}" y="${y+3}" font-size="9.5" text-anchor="middle" fill="${col}" font-family="Noto Sans Mono">${esc(a.l)}</text>`}s+='</g>'});
  words.forEach((w,i)=>{const c=opt.wcol?opt.wcol(i+1):'var(--ink)';s+=`<text x="${cx[i+1]}" y="${base}" font-size="14" text-anchor="middle" fill="${c}" font-family="Noto Sans" font-weight="${c!=='var(--ink)'?700:400}">${esc(w)}</text>`;
    if(opt.tags)s+=`<text x="${cx[i+1]}" y="${base+15}" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${esc(opt.tags[i])}</text>`;if(opt.gloss)s+=`<text x="${cx[i+1]}" y="${base+28}" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans" font-style="italic">${esc(opt.gloss[i])}</text>`});
  return s+'</svg>'}
const D=(str)=>str.split(/\s*;\s*/).filter(Boolean).map(t=>{const m=t.match(/^(\d+)\s*->\s*(\d+)\s*(\S*)$/);return {h:+m[1],d:+m[2],l:m[3]}});

/* ---------- opening: 20.1 ---------- */
const S1='I prefer the morning flight through Denver'.split(' '),D1=D('0->2 root;2->1 nsubj;2->5 obj;5->3 det;5->4 compound;5->7 nmod;7->6 case');
function depTree(words,deps){const kids={};deps.forEach(a=>{(kids[a.h]=kids[a.h]||[]).push(a)});const depth={};(function go(h,d){(kids[h]||[]).forEach(a=>{depth[a.d]=d;go(a.d,d+1)})})(0,0);
  const cw=86,W=words.length*cw+20,mx=Math.max(...Object.values(depth)),H=(mx+1)*56+30;let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="width:${W}px;max-width:none;display:block;margin:0 auto">`;
  const X=i=>10+(i-0.5)*cw,Y=i=>24+depth[i]*56;
  deps.forEach(a=>{if(a.h===0)return;s+=`<line x1="${X(a.h)}" y1="${Y(a.h)+6}" x2="${X(a.d)}" y2="${Y(a.d)-14}" stroke="var(--rule)" stroke-width="1.3"/><text x="${(X(a.h)+X(a.d))/2+4}" y="${(Y(a.h)+Y(a.d))/2-2}" font-size="9.5" fill="var(--rose)" font-family="Noto Sans Mono">${a.l}</text>`});
  words.forEach((w,i)=>{s+=`<text x="${X(i+1)}" y="${Y(i+1)}" font-size="14" text-anchor="middle" fill="${depth[i+1]===0?'var(--green)':'var(--ink)'}" font-weight="${depth[i+1]===0?700:400}" font-family="Noto Sans">${esc(w)}</text>`});
  return s+'</svg>'}
function drawDP(){const m=segVal('#dpM','m');
  if(m==='arc'){$('#dpOut').innerHTML=arcSvg(S1,D1);$('#dpCalc').textContent='7 words → 7 arcs (one incoming arc per word); root → prefer\nnsubj(prefer, I)  obj(prefer, flight)  det(flight, the)  compound(flight, morning)  nmod(flight, Denver)  case(Denver, through)'}
  else if(m==='dtree'){$('#dpOut').innerHTML=depTree(S1,D1);$('#dpCalc').textContent='the same arcs drawn as a tree: every node is a word; prefer (the root) is at the top\nprefer → I and prefer → flight are direct links: verb and its arguments'}
  else{const t=parseBr('[S [NP [Pro I]] [VP [Verb prefer] [NP [Det the] [Nom [Nom [Nom [Noun morning]] [Noun flight]] [PP [P through] [NP [Pro Denver]]]]]]]');$('#dpOut').innerHTML=drawTree(t);$('#dpCalc').textContent=`constituency tree: ${(function n(x){return x.c?1+x.c.reduce((a,c)=>a+n(c),0):0})(t)} non-word nodes; “prefer” reaches its object “flight” only through VP → NP → Nom → Nom\nthe dependency tree has no phrasal nodes at all`}}
segOn('#dpM',drawDP);drawDP();

/* ---------- UD relations (Fig 20.3) ---------- */
const UDX=[['NSUBJ','Nominal subject','United canceled the flight .',2,1],['OBJ','Direct object','United diverted the flight to Reno .',2,4],['OBJ','Direct object','We booked her the first flight to Miami .',2,6],['IOBJ','Indirect object','We booked her the flight to Miami .',2,3],['COMPOUND','Compound','We took the morning flight .',5,4],['NMOD','Nominal modifier','flight to Houston .',1,3],['AMOD','Adjectival modifier','Book the cheapest flight .',4,3],['APPOS','Appositional modifier','United , a unit of UAL , matched the fares .',1,4],['DET','Determiner','The flight was canceled .',2,1],['DET','Determiner','Which flight was delayed ?',2,1],['CONJ','Conjunct','We flew to Denver and drove to Steamboat .',2,6],['CC','Coordinating conjunction','We flew to Denver and drove to Steamboat .',6,5],['CASE','Prepositions, postpositions, case markers','Book the flight through Houston .',5,4]];
let udI=0;$('#udBtns').innerHTML=UDX.map((u,i)=>`<button class="btn${i===0?' pri':''}" data-i="${i}">${u[0]}${UDX.filter(v=>v[0]===u[0]).length>1?' '+(UDX.slice(0,i+1).filter(v=>v[0]===u[0]).length):''}</button>`).join('');
function drawUD(){const [r,desc,s,h,d]=UDX[udI],w=s.split(' ');$$('#udBtns button').forEach((b,j)=>b.classList.toggle('pri',j===udI));
  $('#udOut').innerHTML=arcSvg(w,[{h,d,l:r.toLowerCase()}],{wcol:i=>i===h?'var(--math)':i===d?'var(--rose)':'var(--ink)',col:()=>'var(--rose)'});
  $('#udCalc').textContent=`${r}: ${desc}\nhead = “${w[h-1]}”  →  dependent = “${w[d-1]}”`+({NSUBJ:'\n(clausal argument relation)',OBJ:'\n(clausal argument relation)',IOBJ:'\n(clausal argument relation: the recipient)',CONJ:'\n(UD convention: the first conjunct is the head of the second)',CC:'\n(the conjunction attaches to the conjunct that follows it)',CASE:'\n(UD: prepositions attach to their noun, not the noun to the preposition)'}[r]||'\n(nominal modifier relation)')}
$$('#udBtns button').forEach(b=>b.addEventListener('click',()=>{udI=+b.dataset.i;drawUD()}));drawUD();

/* ---------- projectivity (20.3) ---------- */
const S3='JetBlue canceled our flight this morning which was already late'.split(' '),D3=D('0->2 root;2->1 nsubj;2->4 obj;4->3 det;2->6 obl;6->5 det;4->10 acl:relcl;10->7 nsubj;10->8 cop;10->9 adv');
const headOf=(deps,n)=>{const h=Array(n+1).fill(-1);deps.forEach(a=>h[a.d]=a.h);return h};
function dominates(h,a,b){let x=b;while(x>0){x=h[x];if(x===a)return true}return a===0}
function projective(deps,n,a){const h=headOf(deps,n),lo=Math.min(a.h,a.d),hi=Math.max(a.h,a.d),bad=[];for(let k=lo+1;k<hi;k++)if(!dominates(h,a.h,k))bad.push(k);return bad}
let pjK=6;
function drawPJ(){const n=S3.length,np=D3.map(a=>a.h>0&&projective(D3,n,a).length>0);
  $('#pjOut').innerHTML=arcSvg(S3,D3,{click:1,col:(a,k)=>k===pjK?'var(--rose)':np[k]?'var(--amber)':'var(--math)',sw:(a,k)=>k===pjK?2.4:1.3,id:'p'});
  $$('#pjOut g[data-k]').forEach(g=>g.addEventListener('click',()=>{pjK=+g.dataset.k;drawPJ()}));
  const a=D3[pjK];if(a.h===0){$('#pjCalc').textContent='root → canceled: the root arc (always projective)';return}const bad=projective(D3,n,a),lo=Math.min(a.h,a.d),hi=Math.max(a.h,a.d);
  $('#pjCalc').textContent=`arc ${S3[a.h-1]} → ${S3[a.d-1]} (${a.l}); words in between: ${S3.slice(lo,hi-1).join(', ')||'none'}\n`+(bad.length?`✗ non-projective: no path from “${S3[a.h-1]}” to ${bad.map(k=>`“${S3[k-1]}”`).join(', ')}  → its line must cross another arc`:`✓ projective: “${S3[a.h-1]}” dominates every word in between`)+`\n${np.filter(Boolean).length} non-projective arc(s) in this tree (amber)`}
drawPJ();

/* ---------- UD treebank examples ---------- */
const TBX={es:['Subiremos a el tren a las cinco .','VERB ADP DET NOUN ADP DET NUM PUNCT','we-will-board on the train at the five .','0->1 root;1->4 obl;4->2 case;4->3 det;1->7 obl:tmod;7->5 case;7->6 det;1->8 punct','[Spanish] Subiremos al tren a las cinco. “We will be boarding the train at five.”\nnote “al” is split into a + el so that each word can have its own head'],
 eu:['Ekaitzak itsasontzia hondoratu du .','NOUN NOUN VERB AUX PUNCT','storm(Erg.) ship(Abs.) sunk has .','0->3 root;3->1 nsubj;3->2 obj;3->4 aux;3->5 punct','[Basque] Ekaitzak itsasontzia hondoratu du. “The storm has sunk the ship.”\nverb-final order and case suffixes (ergative/absolutive), yet the same relations as English'],
 zh:['但 我 昨天 才 收 到 信','ADV PRON NOUN ADV VERB VERB NOUN','but I yesterday only-then receive arrive letter','0->5 root;5->1 adv;5->2 nsubj;5->3 obj:tmod;5->4 advmod;5->6 compound:vv;5->7 obj','[Chinese] 但我昨天才收到信 “But I didn’t receive the letter until yesterday”\nChinese is written without spaces: the words were segmented first (Chapter 2)']};
function drawTB(){const [s,t,g,d,c]=TBX[segVal('#tbM','m')];$('#tbOut').innerHTML=arcSvg(s.split(' '),D(d),{tags:t.split(' '),gloss:g.split(' '),id:'t'});$('#tbCalc').textContent=c}
segOn('#tbM',drawTB);drawTB();

/* ================= transition parser ================= */
const TS=[{w:'Book me the morning flight'.split(' '),t:'VB PRP DT NN NN'.split(' '),d:D('0->1 root;1->2 iobj;1->5 obj;5->3 det;5->4 compound')},
 {w:'Book the flight through Houston'.split(' '),t:'VB DT NN IN NNP'.split(' '),d:D('0->1 root;1->3 obj;3->2 det;3->5 nmod;5->4 case')},
 {w:'United canceled the morning flights to Houston'.split(' '),t:'NNP VBD DT NN NNS TO NNP'.split(' '),d:D('0->2 root;2->1 nsubj;2->5 obj;5->3 det;5->4 compound;5->7 nmod;7->6 case')},
 {w:'I prefer the morning flight through Denver'.split(' '),t:'PRP VBP DT NN NN IN NNP'.split(' '),d:D1}];
let TR={};
function trInit(){const S=TS[+$('#trS').value];const gh={},gl={};S.d.forEach(a=>{gh[a.d]=a.h;gl[a.d]=a.l});TR={S,gh,gl,mode:segVal('#trM','m'),stack:[0],buf:S.w.map((_,i)=>i+1),arcs:[],log:[],done:false};drawTR(null)}
const W=i=>i===0?'root':TR.S.w[i-1].toLowerCase();
function allDepsDone(x){const need=Object.keys(TR.gh).filter(d=>TR.gh[d]===x).map(Number);return need.every(d=>TR.arcs.some(a=>a.d===d))}
function oracle(){const st=TR.stack,b=TR.buf;
  if(TR.mode==='std'){if(st.length>=2){const s1=st[st.length-1],s2=st[st.length-2];
      if(s2!==0&&TR.gh[s2]===s1)return ['LEFTARC',`(${W(s1)} → ${W(s2)}) is in the reference parse`];
      if(TR.gh[s1]===s2){if(allDepsDone(s1))return ['RIGHTARC',`(${W(s2)} → ${W(s1)}) is in the reference, and all dependents of “${W(s1)}” are attached`];
        if(b.length)return ['SHIFT',`RIGHTARC would add (${W(s2)} → ${W(s1)}), but “${W(s1)}” still has unattached dependents → defer`]}}
    return b.length?['SHIFT',st.length<2?'only one element on the stack':'no correct arc between the top two elements']:['ERROR','stuck (non-projective?)']}
  const s=st[st.length-1],x=b[0];const hasHead=v=>TR.arcs.some(a=>a.d===v);
  if(x!==undefined){if(s!==0&&TR.gh[s]===x&&!hasHead(s))return ['LEFTARC',`(${W(x)} → ${W(s)}): front of buffer is the head of the stack top`];
    if(TR.gh[x]===s)return ['RIGHTARC',`(${W(s)} → ${W(x)}): stack top is the head of the front of the buffer; push “${W(x)}”`];
    if(s!==0&&hasHead(s)&&allDepsDone(s))return ['REDUCE',`“${W(s)}” has its head and all its dependents`];
    return ['SHIFT','no arc between stack top and buffer front yet']}
  if(st.length>1)return ['REDUCE','buffer empty: pop'];return ['DONE','']}
function trStep(){if(TR.done)return;const st=TR.stack,b=TR.buf;if(TR.mode==='std'&&!b.length&&st.length===1){TR.done=true;TR.log.push({act:'Done'});drawTR(null);return}
  if(TR.mode==='eager'&&!b.length&&st.length===1){TR.done=true;TR.log.push({act:'Done'});drawTR(null);return}
  const [op,why]=oracle();const before={st:st.slice(),b:b.slice()};let rel='';
  if(TR.mode==='std'){if(op==='SHIFT')st.push(b.shift());else if(op==='LEFTARC'){const s1=st.pop(),s2=st.pop();TR.arcs.push({h:s1,d:s2,l:TR.gl[s2]});st.push(s1);rel=`(${W(s2)} ← ${W(s1)})`}
    else if(op==='RIGHTARC'){const s1=st.pop(),s2=st[st.length-1];TR.arcs.push({h:s2,d:s1,l:TR.gl[s1]});rel=`(${W(s2)} → ${W(s1)})`}}
  else{if(op==='SHIFT')st.push(b.shift());else if(op==='LEFTARC'){const s=st.pop();TR.arcs.push({h:b[0],d:s,l:TR.gl[s]});rel=`(${W(s)} ← ${W(b[0])})`}
    else if(op==='RIGHTARC'){const x=b.shift();TR.arcs.push({h:st[st.length-1],d:x,l:TR.gl[x]});st.push(x);rel=`(${W(st[st.length-2])} → ${W(x)})`}else if(op==='REDUCE')st.pop()}
  TR.log.push({...before,act:op,rel,why});drawTR({op,why,rel,before})}
function feats(st,b){const s1=st[st.length-1],s2=st[st.length-2],T=i=>i===0?'ROOT':TR.S.t[i-1],w=i=>i===undefined?'—':W(i),t=i=>i===undefined?'—':T(i);
  return `s1.w=${w(s1)}  s2.w=${w(s2)}  s1.t=${t(s1)}  s2.t=${t(s2)}  b1.w=${w(b[0])}  b1.t=${t(b[0])}  s1.wt=${s1===undefined?'—':w(s1)+t(s1)}  s1.t∘s2.t=${t(s1)}${s2===undefined?'':t(s2)}`}
function drawTR(last){const {stack,buf,arcs}=TR;
  const box=(i,c)=>`<span class="chip" style="${c}">${esc(W(i))}</span>`;
  $('#trState').innerHTML=`<div class="row" style="gap:10px;align-items:flex-start;flex-wrap:wrap"><div><div class="note">Stack (top →)</div><div class="chips">${stack.map((i,k)=>box(i,k>=stack.length-2&&TR.mode==='std'||k===stack.length-1?'background:var(--math-soft);color:var(--math)':'')).join('')}</div></div><div><div class="note">Buffer</div><div class="chips">${buf.map((i,k)=>box(i,k===0&&TR.mode==='eager'?'background:var(--amber-soft);color:var(--amber)':'background:var(--tint);color:var(--soft)')).join('')||'<span class="note">[ ]</span>'}</div></div></div>`;
  $('#trArcs').innerHTML=arcSvg(TR.S.w,arcs.length?arcs:[],{id:'r',col:(a,k)=>k===arcs.length-1&&last&&last.rel?'var(--rose)':'var(--math)'});
  const step=TR.log.filter(l=>l.act!=='Done').length,[nop,nwhy]=TR.done?['','']:oracle();
  $('#trCalc').textContent=(last?`step ${step}: ${last.op}${last.rel?'  '+last.rel:''}\n  why: ${last.why}\n`:TR.done?`done after ${step} transitions: ${arcs.length} arcs = one head for each of the ${TR.S.w.length} words\n`:'initial configuration: stack [root], buffer = the sentence, no relations\n')+
    (TR.done?'':`next (oracle): ${nop}  — ${nwhy}\n`)+`features of the current configuration (Eq. 20.10):\n  ${feats(stack,buf)}`+(TR.mode==='std'?'':'\n(arc eager: arcs link the stack top with the front of the buffer)');
  $('#trLog').innerHTML='<tr><th>Step</th><th>Stack</th><th>Word List</th><th>Action</th><th>Relation Added</th></tr>'+TR.log.map((l,i)=>l.act==='Done'?`<tr><td>${i}</td><td>[root]</td><td>[]</td><td>Done</td><td></td></tr>`:`<tr><td>${i}</td><td>[${l.st.map(W).join(', ')}]</td><td>[${l.b.map(W).join(', ')}]</td><td>${l.act}</td><td>${esc(l.rel)}</td></tr>`).join('')}
$('#trNext').addEventListener('click',trStep);$('#trAll').addEventListener('click',()=>{for(let g=0;g<60&&!TR.done;g++)trStep()});$('#trReset').addEventListener('click',trInit);
$('#trS').addEventListener('change',trInit);segOn('#trM',trInit);trInit();

/* ================= Chu-Liu-Edmonds ================= */
const CLW0={'0>1':12,'0>2':4,'0>3':4,'1>2':5,'2>1':6,'2>3':8,'3>2':7,'1>3':7,'3>1':5};let CLW={...CLW0};
const CLN=['root','Book','that','flight'];
function cleRun(nodes,sc,frames,names){/* nodes: ids, sc: {"u>v":score}, names: id->label */
  const best={};nodes.forEach(v=>{if(v===0)return;let bu=null,bs=-Infinity;nodes.forEach(u=>{const k=u+'>'+v;if(u!==v&&k in sc&&sc[k]>bs){bs=sc[k];bu=u}});best[v]=bu});
  /* cycle */let cyc=null;for(const v of nodes){if(v===0)continue;const seen=[];let x=v;while(x!==0&&x!==undefined&&!seen.includes(x)){seen.push(x);x=best[x]}if(x!==0&&x!==undefined){cyc=seen.slice(seen.indexOf(x));break}}
  frames.push({nodes:nodes.slice(),sc:{...sc},chosen:Object.entries(best).map(([v,u])=>u+'>'+v),names:{...names},note:cyc?`greedy: best incoming edge for each word → cycle ${cyc.map(c=>names[c]).join(' ⇄ ')}`:'greedy: best incoming edge for each word → no cycle: this is the maximum spanning tree',cyc});
  if(!cyc)return best;
  const sc2={};Object.entries(sc).forEach(([k,v])=>{const d=+k.split('>')[1];sc2[k]=v-sc[best[d]+'>'+d]});
  frames.push({nodes:nodes.slice(),sc:sc2,chosen:Object.entries(best).map(([v,u])=>u+'>'+v),names:{...names},note:'rescale: subtract from every edge the score of the best edge entering the same word (greedy edges become 0)',cyc});
  const c=Math.max(...nodes)+1,nn=nodes.filter(v=>!cyc.includes(v)).concat([c]),sc3={},from={};
  Object.entries(sc2).forEach(([k,v])=>{const [u,d]=k.split('>').map(Number),iu=cyc.includes(u),id=cyc.includes(d);
    if(iu&&id)return;if(!iu&&id){const kk=u+'>'+c;if(!(kk in sc3)||v>sc3[kk]){sc3[kk]=v;from[kk]=d}}else if(iu&&!id){const kk=c+'>'+d;if(!(kk in sc3)||v>sc3[kk]){sc3[kk]=v;from[kk]=u}}else sc3[k]=v});
  const nm={...names,[c]:cyc.map(x=>names[x][0].toLowerCase()).join('')};
  frames.push({nodes:nn,sc:sc3,chosen:[],names:nm,note:`contract the cycle into one node “${nm[c]}” and recurse on the smaller graph`});
  const sub=cleRun(nn,sc3,frames,nm);const res={};
  nn.forEach(v=>{if(v===0||v===c)return;const u=sub[v];res[v]=u===c?from[c+'>'+v]:u});
  cyc.forEach(x=>res[x]=best[x]);const u0=sub[c],ent=from[u0+'>'+c];res[ent]=u0;
  frames.push({nodes:nodes.slice(),sc:{...sc},chosen:Object.entries(res).map(([v,u])=>u+'>'+v),names:{...names},note:`expand “${nm[c]}”: the tree enters it via ${names[u0]} → ${names[ent]}, so the cycle edge ${names[best[ent]]} → ${names[ent]} is deleted`,final:true});
  return res}
let cleF=[],cleI=0;
function cleCompute(){cleF=[];const res=cleRun([0,1,2,3],CLW,cleF,{0:'root',1:'Book',2:'that',3:'flight'});const last=cleF[cleF.length-1];if(!last.final)last.final=true;cleI=0;cleF.res=res}
function cleDraw(){const f=cleF[cleI],ids=f.nodes,W=520,H=250,xs={};ids.forEach((v,i)=>xs[v]=60+i*(W-120)/(ids.length-1));const y=125;
  let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img" style="width:${W}px;max-width:none;display:block;margin:0 auto"><defs><marker id="cla" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L8,4L0,8z" fill="context-stroke"/></marker></defs>`;
  Object.entries(f.sc).forEach(([k,v])=>{const [u,d]=k.split('>').map(Number);if(!(u in xs&&d in xs))return;const x1=xs[u],x2=xs[d],span=Math.abs(x2-x1),up=x2>x1,h=Math.min(48,10+span*0.17)*(up?-1:1),ch=f.chosen.includes(k);
    const mx=(x1+x2)/2,y0=y+(up?-21:21),cy=y+h*2-(up?-6:6),ly=(y0+cy)/2+(up?0:0),col=ch?(f.final?'var(--green)':'var(--rose)'):'var(--soft)';
    s+=`<path d="M${x1},${y0} Q${mx},${cy} ${x2},${y0}" fill="none" stroke="${col}" stroke-width="${ch?2.6:1.1}" opacity="${ch?1:.7}" marker-end="url(#cla)"/><rect x="${mx-13}" y="${ly-8}" width="26" height="15" rx="4" fill="var(--paper)" stroke="${col}" stroke-width=".6"/><text x="${mx}" y="${ly+4}" font-size="11" text-anchor="middle" fill="${col}" font-family="Noto Sans Mono">${Number.isInteger(v)?v:v.toFixed(1)}</text>`});
  ids.forEach(v=>{s+=`<circle cx="${xs[v]}" cy="${y}" r="20" fill="var(--paper)" stroke="var(--ink)"/><text x="${xs[v]}" y="${y+4}" font-size="12" text-anchor="middle" fill="var(--ink)" font-family="Noto Sans">${esc(f.names[v])}</text>`});
  $('#cleSvg').innerHTML=s+'</svg>';
  const tot=f.final?Object.entries(cleF.res).reduce((a,[v,u])=>a+CLW[u+'>'+v],0):null;
  $('#cleCalc').textContent=`frame ${cleI+1} of ${cleF.length}: ${f.note}`+(f.cyc&&cleI<cleF.length-1?'':'')+(f.final?`\n✓ maximum spanning tree: ${Object.entries(cleF.res).map(([v,u])=>`${CLN[u]} → ${CLN[v]}`).join(', ')}   total score ${tot}`+(JSON.stringify(CLW)===JSON.stringify(CLW0)?'\n(the book’s blue tree: root → Book → flight → that)':''):'')+`\n(edges above the nodes point right, below point left; red = currently chosen)`}
$('#cleNext').addEventListener('click',()=>{if(cleI<cleF.length-1)cleI++;cleDraw()});$('#cleReset').addEventListener('click',()=>{cleI=0;cleDraw()});
$('#cleRand').addEventListener('click',()=>{const R=rng(Date.now()%99991);Object.keys(CLW).forEach(k=>CLW[k]=1+Math.floor(R()*12));cleCompute();cleDraw()});cleCompute();cleDraw();

/* ---------- biaffine toy ---------- */
const BH={root:[0.2,0.1],Book:[1.2,0.3],that:[0.1,0.9]},BD=[1.0,0.2],U0=[[1,0],[0,-0.5]],W0=[0.1,0.1,0.6,0.2];
function drawBF(){const u=+$('#bfU').value,w=+$('#bfW').value;$('#bfUo').textContent=r1(u);$('#bfWo').textContent=r1(w);
  const sc=Object.entries(BH).map(([n,x])=>{const Uy=U0.map(r=>r[0]*BD[0]+r[1]*BD[1]),mult=u*(x[0]*Uy[0]+x[1]*Uy[1]),lin=w*[...x,...BD].reduce((a,v,i)=>a+v*W0[i],0);return {n,x,mult,lin,s:mult+lin}});
  const mx=Math.max(...sc.map(c=>c.s)),ex=sc.map(c=>Math.exp(c.s-mx)),Z=ex.reduce((a,b)=>a+b,0),p=ex.map(e=>e/Z),bi=p.indexOf(Math.max(...p));
  $('#bfBars').innerHTML=sc.map((c,i)=>`<div class="br${i===bi?' pick':''}"><span class="w0">${c.n} → flight</span><span class="tr"><span class="fl" style="display:block;width:${(p[i]*100).toFixed(1)}%"></span></span><span class="v">${r2(p[i])}</span></div>`).join('');
  $('#bfCalc').textContent=`h_dep(flight) = [${BD.join(', ')}]\n`+sc.map(c=>`${c.n.padEnd(4)} h_head=[${c.x.join(', ')}]  xᵀUy = ${r2(c.mult)}  W(x⊕y) = ${r2(c.lin)}  score = ${r2(c.s)}`).join('\n')+`\np(head of flight) = softmax = [${p.map(r2).join(', ')}] → “${sc[bi].n}”`+(u===0?'\nwith the multiplicative term off, only the general “good head” tendency of each word counts':'')}
['#bfU','#bfW'].forEach(x=>$(x).addEventListener('input',drawBF));drawBF();

/* ---------- evaluation (Fig 20.15) ---------- */
(function(){const w='Book me the flight through Houston'.split(' '),R=D('0->1 root;1->2 iobj;1->4 obj;4->3 det;4->6 nmod;6->5 case'),S=D('0->1 root;1->4 xcomp;4->2 nsubj;4->3 det;4->6 nmod;6->5 case');
  const rh={},sh={};R.forEach(a=>rh[a.d]=a);S.forEach(a=>sh[a.d]=a);
  $('#evRef').innerHTML='<div class="note">(a) Reference</div>'+arcSvg(w,R,{id:'e1'});$('#evSys').innerHTML='<div class="note">(b) System</div>'+arcSvg(w,S,{id:'e2',col:a=>rh[a.d].h===a.h&&rh[a.d].l===a.l?'var(--math)':rh[a.d].h===a.h?'var(--amber)':'var(--rose)'});
  let las=0,uas=0,ls=0;const rows=w.map((x,i)=>{const r=rh[i+1],s=sh[i+1],hu=r.h===s.h,lb=r.l===s.l;if(hu)uas++;if(hu&&lb)las++;if(lb)ls++;return `<tr><td>${x}</td><td>${r.h?w[r.h-1]:'root'} / ${r.l}</td><td>${s.h?w[s.h-1]:'root'} / ${s.l}</td><td>${hu?'✓':'✗'}</td><td>${hu&&lb?'✓':'✗'}</td></tr>`});
  $('#evTab').innerHTML='<tr><th>word</th><th>reference head / label</th><th>system head / label</th><th>UAS</th><th>LAS</th></tr>'+rows.join('');
  $('#evCalc').textContent=`UAS = ${uas}/6 = ${f3(uas/6)}   LAS = ${las}/6 = ${f3(las/6)} (= 2/3)   LS = ${ls}/6\n“flight”: right head (book), wrong label (xcomp instead of obj) → counts for UAS, not LAS (amber)\n“me”: wrong head (flight instead of book) and wrong label → counts for neither (red)`})();

/* ---------- glossary ---------- */
const GL=[['أنحاء الاعتماد','dependency grammars','البنية علاقات ثنائية بين الكلمات.'],['بنية اعتماد موسومة','typed dependency structure','أقواس موسومة من الرؤوس إلى التوابع.'],['الرأس / التابع','head / dependent','الكلمة المنظِّمة / المعدِّل.'],['العلاقة / الوظيفة النحوية','grammatical relation / function','فاعل، مفعول، محدِّد…'],['Universal Dependencies','Universal Dependencies (UD)','٣٧ علاقة لأكثر من ١٠٠ لغة.'],['nsubj / obj / iobj','nominal subject / direct / indirect object','علاقات جُملية.'],['nmod / amod / det / case','nominal / adjectival modifier, determiner, case marker','علاقات تعديل.'],['شجرة الاعتماد','dependency tree','جذر واحد، ولكل كلمة رأس واحد.'],['الإسقاطية','projectivity','لا أقواس متقاطعة.'],['بنك أشجار الاعتماد','dependency treebank','جمل موسومة بأشجار اعتماد.'],['التحليل الانتقالي','transition-based parsing','مكدس ومخزن وعمليات يختارها متنبئ.'],['المكدس / المخزن','stack / buffer','الكلمات قيد المعالجة / المتبقية.'],['SHIFT / LEFTARC / RIGHTARC','shift / left-arc / right-arc','نقل، ربط يساري، ربط يميني.'],['المتنبئ','oracle','مصنّف يختار الانتقال.'],['الهيئة','configuration','المكدس + المخزن + العلاقات.'],['arc standard / arc eager','arc standard / arc eager','نظاما انتقال؛ الثاني يربط مبكراً ويضيف REDUCE.'],['متنبئ التدريب','training oracle','يولّد الانتقالات الصحيحة من المرجع.'],['قالب الخصائص','feature template','s1.w، b1.t…'],['البحث الشعاعي','beam search','الاحتفاظ بأفضل عدة هيئات.'],['التحليل بالرسوم','graph-based parsing','تقييم أشجار كاملة.'],['مفكَّك على الأضلاع','edge-factored','درجة الشجرة = مجموع درجات أضلاعها.'],['أكبر شجرة ممتدة','maximum spanning tree','الشجرة الأعلى درجة التي تغطي كل الكلمات.'],['تشو-ليو-إدموندز','Chu-Liu-Edmonds algorithm','اختيار جشع + إعادة تقييم + طي الدوائر.'],['التعلّم بالاستدلال','inference-based learning','حلّل، ثم صحّح أوزان الخصائص الخاطئة.'],['ثنائي التآلف','biaffine scorer','xᵀUy + W(x ⊕ y) + b.'],['LAS / UAS / LS','labeled / unlabeled attachment score, label score','الرأس والعلاقة / الرأس / العلاقة.'],['المطابقة التامة','exact match (EM)','نسبة الجمل المحللة صحيحاً كلها.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
