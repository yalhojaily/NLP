/* Chapter 5 · Embeddings — interactive widgets */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sig=z=>1/(1+Math.exp(-z));
const r3=v=>(+v.toFixed(3)).toString();
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0), len=a=>Math.sqrt(dot(a,a)), cos=(a,b)=>dot(a,b)/(len(a)*len(b)||1);
/* seeded RNG so results are reproducible */
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

/* ---------- TOC + progress ---------- */
const SECS=[['s0','','افتتاحية الفصل'],['s5-1','5.1','الدلالة المعجمية'],['s5-2','5.2','الحدس المتجهي'],['s5-3','5.3','تضمينات العدّ'],['s5-4','5.4','جيب التمام'],['s5-5','5.5','word2vec'],['s5-6','5.6','التصوير'],['s5-7','5.7','الخصائص الدلالية'],['s5-8','5.8','الانحياز'],['s5-9','5.9','التقييم'],['ex','','الخلاصة والتمارين']];
$('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
$('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
const tocLinks=$$('#toc a');
function onScroll(){const h=document.documentElement;$('#prog').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});
  tocLinks.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* generic scatter: points [{x,y,t,c,r,b}] , arrows [{x1,y1,x2,y2,c,dash}] */
function scatter(el,o){
  const W=o.W||340,H=o.H||340,P=34,x=v=>P+(v-o.x0)/(o.x1-o.x0)*(W-2*P),y=v=>H-P-(v-o.y0)/(o.y1-o.y0)*(H-2*P);
  const cols=[...new Set((o.arrows||[]).map(a=>a.c))];
  let s=`<svg class="map" viewBox="0 0 ${W} ${H}" role="img"><defs>${cols.map((c,i)=>`<marker id="ah${el.id}${i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`).join('')}</defs>`;
  (o.grid||[]).forEach(g=>{s+=`<line x1="${x(g)}" x2="${x(g)}" y1="${y(o.y0)}" y2="${y(o.y1)}" stroke="var(--rule)" stroke-width="0.6"/><line x1="${x(o.x0)}" x2="${x(o.x1)}" y1="${y(g)}" y2="${y(g)}" stroke="var(--rule)" stroke-width="0.6"/>`});
  (o.ticks||[]).forEach(g=>{s+=`<text x="${x(g)}" y="${H-P+14}" font-size="10" text-anchor="middle" fill="var(--soft)" font-family="Noto Sans Mono">${g}</text><text x="${P-6}" y="${y(g)+3}" font-size="10" text-anchor="end" fill="var(--soft)" font-family="Noto Sans Mono">${g}</text>`});
  if(o.xl)s+=`<text x="${W-P}" y="${H-4}" font-size="11" text-anchor="end" fill="var(--soft)" font-family="Noto Sans">${o.xl}</text>`;
  if(o.yl)s+=`<text x="${P}" y="${P-10}" font-size="11" fill="var(--soft)" font-family="Noto Sans">${o.yl}</text>`;
  (o.arcs||[]).forEach(a=>{s+=`<path d="${a.d(x,y)}" fill="none" stroke="${a.c}" stroke-width="1.5"/>`});
  (o.arrows||[]).forEach(a=>{s+=`<line x1="${x(a.x1)}" y1="${y(a.y1)}" x2="${x(a.x2)}" y2="${y(a.y2)}" stroke="${a.c}" stroke-width="${a.w||2}" ${a.dash?'stroke-dasharray="5 4"':''} marker-end="${a.head===false?'':`url(#ah${el.id}${cols.indexOf(a.c)})`}"/>`});
  (o.pts||[]).forEach(p=>{s+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||4.5}" fill="${p.c||'var(--green)'}" ${p.ring?`stroke="${p.ring}" stroke-width="2.5"`:''}/>`;if(p.t)s+=`<text x="${x(p.x)+6}" y="${y(p.y)-6}" font-size="${p.fs||12}" fill="${p.tc||'var(--ink)'}" font-family="Noto Sans, Noto Naskh Arabic" font-weight="${p.b?700:400}">${esc(p.t)}</text>`});
  el.innerHTML=s+'</svg>';
}

/* ---------- 5.1 VAD ---------- */
const VAD={courageous:[8.0,5.5,7.4],music:[7.7,5.6,6.5],heartbreak:[2.5,5.7,3.6],cub:[6.7,4.0,4.2]};
const VADN=['valence','arousal','dominance'];let vadA=[0,1];
function drawVAD(){scatter($('#vadPlot'),{x0:0,x1:9,y0:0,y1:9,grid:[0,3,6,9],ticks:[0,3,6,9],xl:VADN[vadA[0]],yl:VADN[vadA[1]],pts:Object.entries(VAD).map(([w,v])=>({x:v[vadA[0]],y:v[vadA[1]],t:w,c:'var(--math)'}))})}
$$('#vadAx button').forEach(b=>b.onclick=()=>{vadA=b.dataset.a.split(',').map(Number);$$('#vadAx button').forEach(x=>x.classList.toggle('on',x===b));drawVAD()});drawVAD();document.addEventListener('themechange',drawVAD);

/* ---------- 5.3 co-occurrence ---------- */
let coSel=null;
const tokLine=l=>(l.toLowerCase().match(/[\p{L}\p{N}'’-]+/gu)||[]);
function drawCO(){const W=+$('#coW').value;$('#coWo').textContent=W;
  const lines=$('#coIn').value.split('\n').map(tokLine),T=$('#coT').value.split(/[,،]/).map(s=>s.trim().toLowerCase()).filter(Boolean),C=$('#coC').value.split(/[,،]/).map(s=>s.trim().toLowerCase()).filter(Boolean);
  const M=T.map(()=>C.map(()=>0));
  lines.forEach(t=>t.forEach((w,i)=>{const ti=T.indexOf(w);if(ti<0)return;for(let j=Math.max(0,i-W);j<=Math.min(t.length-1,i+W);j++){if(j===i)continue;const ci=C.indexOf(t[j]);if(ci>=0)M[ti][ci]++}}));
  $('#coTable').innerHTML=`<table class="tb co"><tr><th></th>${C.map(c=>`<th class="en">${esc(c)}</th>`).join('')}</tr>${T.map((w,i)=>`<tr data-w="${esc(w)}" class="${w===coSel?'sel':''}"><td class="en"><b>${esc(w)}</b></td>${M[i].map(v=>`<td class="num ${v?'':'zero'}">${v}</td>`).join('')}</tr>`).join('')}</table>`;
  $$('#coTable tr[data-w]').forEach(r=>r.onclick=()=>{coSel=r.dataset.w;drawCO()});
  if(coSel){let h='';lines.forEach(t=>{t.forEach((w,i)=>{if(w!==coSel)return;const a=Math.max(0,i-W),b=Math.min(t.length-1,i+W);h+='<div>'+t.map((x,j)=>j===i?`<b class="tg">${esc(x)}</b>`:(j>=a&&j<=b)?`<span class="${C.includes(x)?'cx':'wn'}">${esc(x)}</span>`:`<span class="out">${esc(x)}</span>`).join(' ')+'</div>'})});$('#coWin').innerHTML=h||'—'}else $('#coWin').innerHTML='';
}
['#coIn','#coT','#coC','#coW'].forEach(s=>$(s).addEventListener('input',drawCO));drawCO();

/* ---------- 5.4 cosine ---------- */
const CV={cherry:[442,8,2],strawberry:[60,0,0],digital:[5,1683,1670],information:[5,3982,3325]};const DIMS=['pie','data','computer'];
['#csA','#csB'].forEach((s,k)=>{$(s).innerHTML=Object.keys(CV).map(w=>`<option${(k===0&&w==='digital')||(k===1&&w==='information')?' selected':''}>${w}</option>`).join('')});
function drawCS(){const k=+$('#csK').value;$('#csKo').textContent=k.toFixed(1);const a=$('#csA').value,b=$('#csB').value,va=CV[a].map(v=>v*k),vb=CV[b];
  const d=dot(va,vb),la=len(va),lb=len(vb),c=d/(la*lb),ang=Math.acos(Math.min(1,c))*180/Math.PI;
  /* direction-only plot in (computer, pie) plane */
  const u=v=>{const p=[v[2],v[0]],l=Math.hypot(...p)||1;return [p[0]/l,p[1]/l]};
  const LN={cherry:1,strawberry:0.75,digital:0.75,information:1};
  const arrows=Object.keys(CV).map(w=>{const q=u(CV[w]).map(v=>v*LN[w]);return {x1:0,y1:0,x2:q[0],y2:q[1],c:w===a||w===b?(w===a?'var(--amber)':'var(--green)'):'var(--rule)',w:w===a||w===b?2.5:1.5}});
  const pts=Object.keys(CV).map(w=>{const q=u(CV[w]).map(v=>v*LN[w]);return {x:q[0],y:q[1],t:w,r:0.1,tc:w===a||w===b?'var(--ink)':'var(--soft)',b:w===a||w===b}});
  const qa=u(CV[a]),qb=u(CV[b]),t1=Math.atan2(qa[1],qa[0]),t2=Math.atan2(qb[1],qb[0]);
  scatter($('#csPlot'),{x0:-0.05,x1:1.25,y0:-0.05,y1:1.25,grid:[0,0.5,1],ticks:[0,0.5,1],xl:'computer →',yl:'↑ pie',arrows,pts,arcs:[{c:'var(--rose)',d:(x,y)=>{const r=0.3;return `M${x(r*Math.cos(t1))} ${y(r*Math.sin(t1))} A${x(r)-x(0)} ${x(r)-x(0)} 0 0 ${t1>t2?1:0} ${x(r*Math.cos(t2))} ${y(r*Math.sin(t2))}`}}]});
  $('#csCalc').textContent=`${a}${k!==1?` × ${k}`:''} = [${va.map(v=>r3(v)).join(', ')}]\n${b} = [${vb.join(', ')}]   (pie, data, computer)\n\ndot = ${va.map((v,i)=>`${r3(v)}×${vb[i]}`).join(' + ')}\n    = ${r3(d)}\n|${a}| = ${r3(la)}    |${b}| = ${r3(lb)}\ncos = ${r3(d)} / (${r3(la)} × ${r3(lb)}) = ${c.toFixed(3)}\nangle θ = ${ang.toFixed(1)}°`}
['#csA','#csB','#csK'].forEach(s=>$(s).addEventListener('input',drawCS));drawCS();document.addEventListener('themechange',drawCS);

/* ---------- 5.5 SGNS pair generator ---------- */
const NOISE={the:50,of:30,a:30,and:25,aardvark:1,seven:3,my:6,forever:2,where:4,dear:2,coaxial:1,if:5,matrix:2,tolstoy:1,zebra:1,pinch:2,lemon:2};
let sgSeed=7;
function noiseSample(R,exclude,alpha=0.75){const ks=Object.keys(NOISE).filter(w=>w!==exclude),ws=ks.map(w=>Math.pow(NOISE[w],alpha)),S=ws.reduce((a,b)=>a+b,0);let r=R()*S;for(let i=0;i<ks.length;i++){r-=ws[i];if(r<=0)return ks[i]}return ks[ks.length-1]}
function drawSG(){const toks=$('#sgIn').value.trim().split(/\s+/).filter(Boolean),L=+$('#sgL').value,k=+$('#sgK').value;$('#sgLo').textContent=L;$('#sgKo').textContent=k;
  const sel=$('#sgT'),old=sel.value;const words=[...new Set(toks.filter(t=>/[\p{L}]/u.test(t)))];sel.innerHTML=words.map(w=>`<option${w===(old||'apricot')?' selected':''}>${esc(w)}</option>`).join('');
  const tg=sel.value,i=toks.indexOf(tg),R=rng(sgSeed);if(i<0){$('#sgPairs').innerHTML='';return}
  const ctx=[];for(let j=i-L;j<=i+L;j++){if(j===i||j<0||j>=toks.length)continue;if(/[\p{L}]/u.test(toks[j]))ctx.push(toks[j]);}
  let h='<div class="ph"><span>أمثلة إيجابية +</span><span>أمثلة سلبية − (k = '+AR(k)+' لكل إيجابي)</span></div>';
  ctx.forEach(c=>{const negs=[];for(let n=0;n<k;n++)negs.push(noiseSample(R,tg));h+=`<div class="pr"><span class="chip">${esc(tg)} · ${esc(c)}</span><span class="chips">${negs.map(n=>`<span class="chip ghost">${esc(tg)} · ${esc(n)}</span>`).join('')}</span></div>`});
  $('#sgPairs').innerHTML=h}
['#sgIn','#sgL','#sgK','#sgT'].forEach(s=>$(s).addEventListener('input',drawSG));$('#sgRe').onclick=()=>{sgSeed++;drawSG()};drawSG();

/* alpha weighting */
function drawAL(){const a=+$('#al').value;$('#alo').textContent=a.toFixed(2);const pa=Math.pow(.99,a),pb=Math.pow(.01,a),S=pa+pb;
  $('#alCalc').textContent=`Pα(a) = .99^${a} / (.99^${a} + .01^${a}) = ${pa.toFixed(4)} / ${S.toFixed(4)} = ${(pa/S).toFixed(3)}\nPα(b) = .01^${a} / (.99^${a} + .01^${a}) = ${pb.toFixed(4)} / ${S.toFixed(4)} = ${(pb/S).toFixed(3)}\n${a===1?'α = 1: the plain probabilities':a===0?'α = 0: every word equally likely':'the rare event b gained probability'}`}
$('#al').addEventListener('input',drawAL);drawAL();

/* ---------- word2vec trainer (d = 2) ---------- */
const FOOD=['apple','cherry','strawberry','grape','pie','jam','sugar','sweet','juice','cake'],TECH=['computer','data','digital','information','software','network','internet','code','file','server'];
const FUNC=['the','a','of','with','and','is','on','in'];
function makeCorpus(){const R=rng(42),pick=a=>a[Math.floor(R()*a.length)],out=[];
  const pats=['the X with Y','a X and Y','X of the Y','the X is Y','Y in a X and Z','X on the Y','the X and the Y is Z'];
  for(let i=0;i<160;i++){const topic=i%2?FOOD:TECH;let s=pick(pats).replace('X',pick(topic)).replace('Y',pick(topic)).replace('Z',pick(topic));out.push(s.split(' '))}return out}
const CORP=makeCorpus();const VOC=[...new Set(CORP.flat())];const VI=Object.fromEntries(VOC.map((w,i)=>[w,i]));
const CNT=VOC.map(w=>CORP.flat().filter(x=>x===w).length),NW=CNT.map(c=>Math.pow(c,0.75)),NS=NW.reduce((a,b)=>a+b,0);
let WV,CVv,wvR,pairs,pi,wvEpoch,wvLast,wvLoss;
function buildPairs(){const p=[];CORP.forEach(t=>t.forEach((w,i)=>{for(let j=i-2;j<=i+2;j++)if(j!==i&&j>=0&&j<t.length)p.push([VI[w],VI[t[j]]])}));for(let i=p.length-1;i>0;i--){const j=Math.floor(wvR()*(i+1));[p[i],p[j]]=[p[j],p[i]]}return p}
function wvInit(seed){wvR=rng(seed||Date.now()%100000);WV=VOC.map(()=>[wvR()-0.5,wvR()-0.5]);CVv=VOC.map(()=>[wvR()-0.5,wvR()-0.5]);pairs=buildPairs();pi=0;wvEpoch=0;wvLast=null;wvLoss=[]}
function sampleNeg(ex){for(;;){let r=wvR()*NS;for(let i=0;i<NW.length;i++){r-=NW[i];if(r<=0){if(i!==ex)return i;break}}}}
function wvUpdate(detail){const e=+$('#wvE').value,k=+$('#wvK').value,[t,c]=pairs[pi];const negs=[];for(let n=0;n<k;n++)negs.push(sampleNeg(t));
  const w=WV[t],cp=CVv[c],sp=sig(dot(cp,w));let L=-Math.log(sp+1e-9);const gw=[(sp-1)*cp[0],(sp-1)*cp[1]];
  const before=detail?{sp,sn:negs.map(n=>sig(dot(CVv[n],w)))}:null;
  const ncp=[cp[0]-e*(sp-1)*w[0],cp[1]-e*(sp-1)*w[1]];
  negs.forEach(n=>{const cn=CVv[n],sn=sig(dot(cn,w));L+=-Math.log(1-sn+1e-9);gw[0]+=sn*cn[0];gw[1]+=sn*cn[1];CVv[n]=[cn[0]-e*sn*w[0],cn[1]-e*sn*w[1]]});
  CVv[c]=ncp;WV[t]=[w[0]-e*gw[0],w[1]-e*gw[1]];wvLoss.push(L);if(wvLoss.length>pairs.length)wvLoss.shift();
  if(detail){const after={sp:sig(dot(CVv[c],WV[t])),sn:negs.map(n=>sig(dot(CVv[n],WV[t])))};wvLast={t,c,negs,before,after}}
  pi++;if(pi>=pairs.length){pi=0;wvEpoch++}}
function centered(){const S=VOC.map((_,i)=>[WV[i][0]+CVv[i][0],WV[i][1]+CVv[i][1]]),m=[0,1].map(d=>S.reduce((a,v)=>a+v[d],0)/S.length);return S.map(v=>[v[0]-m[0],v[1]-m[1]])}
function drawWV(){$('#wvEo').textContent=(+$('#wvE').value).toFixed(3);$('#wvKo').textContent=$('#wvK').value;
  const E=centered(),m=Math.max(0.5,...E.flat().map(Math.abs))*1.15;
  const hl=wvLast?{[wvLast.t]:'var(--rose)',[wvLast.c]:'var(--ink)'}:{};
  scatter($('#wvPlot'),{x0:-m,x1:m,y0:-m,y1:m,grid:[0],ticks:[],pts:VOC.map((w,i)=>{const f=FUNC.includes(w);return {x:E[i][0],y:E[i][1],t:w,fs:f?10:11.5,tc:f?'var(--soft)':'var(--ink)',c:hl[i]||(FOOD.includes(w)?'var(--amber)':TECH.includes(w)?'var(--math)':'var(--rule)'),r:hl[i]?6.5:4,b:!!hl[i]}})});
  const avg=wvLoss.length?wvLoss.reduce((a,b)=>a+b,0)/wvLoss.length:NaN;
  let s=`epoch ${wvEpoch}   pair ${pi}/${pairs.length}\naverage loss (recent pairs) = ${isNaN(avg)?'—':avg.toFixed(3)}\n`;
  if(wvLast){const L=wvLast;s+=`\nlast step: target "${VOC[L.t]}", context "${VOC[L.c]}"\n  P(+|w,c_pos): ${L.before.sp.toFixed(3)} → ${L.after.sp.toFixed(3)}  (up = closer)\n`+L.negs.map((n,j)=>`  noise "${VOC[n]}" P(+): ${L.before.sn[j].toFixed(3)} → ${L.after.sn[j].toFixed(3)}`).join('\n')}
  $('#wvCalc').textContent=s;drawNN()}
function drawNN(){const q=$('#wvQ').value,qi=VI[q],E=centered(),sum=i=>E[i];
  const items=VOC.map((w,i)=>[w,cos(sum(qi),sum(i))]).filter(x=>x[0]!==q&&!FUNC.includes(x[0])).sort((a,b)=>b[1]-a[1]).slice(0,6);
  $('#wvNN').innerHTML=items.map(([w,c])=>`<div class="br"><span class="w0">${w}</span><div class="tr"><div class="fl" style="width:${Math.max(0,c)*100}%;background:${FOOD.includes(w)?'var(--amber)':'var(--math)'}"></div></div><span class="v">${c.toFixed(2)}</span></div>`).join('')}
$('#wvQ').innerHTML=[...FOOD,...TECH].map(w=>`<option${w==='cherry'?' selected':''}>${w}</option>`).join('');$('#wvQ').addEventListener('change',drawNN);
$('#wvStep').onclick=()=>{wvUpdate(true);drawWV()};
$('#wvEpoch').onclick=()=>{wvLast=null;const n=pairs.length;for(let i=0;i<n;i++)wvUpdate(false);drawWV()};
$('#wv10').onclick=()=>{wvLast=null;const n=pairs.length*10;for(let i=0;i<n;i++)wvUpdate(false);drawWV()};
$('#wvReset').onclick=()=>{wvInit();drawWV()};['#wvE','#wvK'].forEach(s=>$(s).addEventListener('input',drawWV));
wvInit(3);drawWV();document.addEventListener('themechange',drawWV);

/* ---------- fasttext ---------- */
function drawFT(){const w=$('#ftIn').value.trim(),n=+$('#ftN').value;$('#ftNo').textContent=n;if(!w){$('#ftOut').innerHTML='';return}
  const s=Array.from('<'+w+'>'),g=[];for(let i=0;i+n<=s.length;i++)g.push(s.slice(i,i+n).join(''));
  $('#ftOut').innerHTML=`<span class="chip a">${esc('<'+w+'>')}</span>`+g.map(x=>`<span class="chip">${esc(x)}</span>`).join('')+`<span class="note" style="margin-inline-start:8px">${AR(g.length+1)} تضمينات تُجمع</span>`}
['#ftIn','#ftN'].forEach(s=>$(s).addEventListener('input',drawFT));$$('[data-ft]').forEach(b=>b.onclick=()=>{$('#ftIn').value=b.dataset.ft;drawFT()});drawFT();

/* ---------- analogy ---------- */
const AN={man:[1,1],woman:[1,3],king:[4,1.2],queen:[4,3.2],boy:[0.4,0.3],girl:[0.4,2.3],prince:[4.8,0.6],apple:[7,5.9],tree:[8.5,7.9],grape:[6,6.6],vine:[7.4,8.7],orange:[6.9,4.9],bush:[9.3,6.9],France:[2.2,6.9],Paris:[3.2,8.9],Italy:[0.6,6.3],Rome:[1.5,8.4],Germany:[3.3,5.9],Berlin:[4.4,8.0]};
const ANW=Object.keys(AN);
['#anA','#anB','#anC'].forEach((s,k)=>{$(s).innerHTML=ANW.map(w=>`<option${w===['man','king','woman'][k]?' selected':''}>${w}</option>`).join('')});
function drawAN(){const a=$('#anA').value,b=$('#anB').value,c=$('#anC').value,A=AN[a],B=AN[b],C=AN[c],T=[B[0]-A[0]+C[0],B[1]-A[1]+C[1]];
  const ds=ANW.filter(w=>![a,b,c].includes(w)).map(w=>[w,Math.hypot(AN[w][0]-T[0],AN[w][1]-T[1])]).sort((x,y)=>x[1]-y[1]);
  const best=ds[0][0],role={[a]:'a',[b]:'b',[c]:'a*',[best]:'→'};
  scatter($('#anPlot'),{x0:0,x1:10,y0:0,y1:10,grid:[0,2,4,6,8,10],ticks:[0,5,10],
    arrows:[{x1:A[0],y1:A[1],x2:B[0],y2:B[1],c:'var(--amber)'},{x1:C[0],y1:C[1],x2:T[0],y2:T[1],c:'var(--amber)',dash:true},{x1:A[0],y1:A[1],x2:C[0],y2:C[1],c:'var(--soft)',dash:true,head:false,w:1},{x1:B[0],y1:B[1],x2:T[0],y2:T[1],c:'var(--soft)',dash:true,head:false,w:1}],
    pts:[...ANW.map(w=>({x:AN[w][0],y:AN[w][1],t:role[w]?`${w} (${role[w]})`:w,c:w===best?'var(--green)':role[w]?'var(--amber)':'var(--math)',r:role[w]?6:4,b:!!role[w],tc:role[w]?'var(--ink)':'var(--soft)'})),{x:T[0],y:T[1],c:'none',ring:'var(--rose)',r:7}]});
  $('#anCalc').textContent=`b − a + a* = ${b} − ${a} + ${c}\n  = [${B}] − [${A}] + [${C}]\n  = [${T.map(r3).join(', ')}]   (rose ring)\n\nnearest words (inputs excluded):\n`+ds.slice(0,4).map(([w,d],i)=>`${i?'  ':'→ '}${w.padEnd(9)} distance ${d.toFixed(2)}`).join('\n')}
['#anA','#anB','#anC'].forEach(s=>$(s).addEventListener('input',drawAN));$$('[data-an]').forEach(btn=>btn.onclick=()=>{const [a,b,c]=btn.dataset.an.split(',');$('#anA').value=a;$('#anB').value=b;$('#anC').value=c;drawAN()});drawAN();document.addEventListener('themechange',drawAN);

/* ---------- glossary ---------- */
const GL=[['تضمين','embedding','متجه يمثّل معنى الكلمة كنقطة في فضاء.'],['الدلالة المتجهية','vector semantics','تمثيل المعنى بمتجهات مشتقة من التوزيع.'],['تعلّم التمثيل','representation learning','تعلّم الخصائص تلقائياً بدل تصميمها.'],['الدلالة المعجمية','lexical semantics','دراسة معاني الكلمات.'],['المدخل المعجمي','lemma','صيغة الاستشهاد في القاموس.'],['معنى الكلمة','word sense','أحد معاني المدخل.'],['ترادف','synonymy','تطابق تقريبي في المعنى.'],['ارتباط','relatedness','كلمتان تشتركان في حدث أو حقل، كقهوة وفنجان.'],['حقل دلالي','semantic field','كلمات مجال واحد.'],['إيحاء','connotation','المعنى العاطفي.'],['تكافؤ / استثارة / هيمنة','valence / arousal / dominance','أبعاد أوزغود الثلاثة.'],['مصفوفة الكلمة والسياق','word-context matrix','عدّ التواجد المشترك |V|×|V|.'],['نافذة السياق','context window','الكلمات المعدودة حول الهدف.'],['متناثر / كثيف','sparse / dense','أغلبه أصفار / قصير وقيمه حقيقية.'],['متعامد','orthogonal','ضربهما النقطي صفر.'],['طول المتجه','vector length','الجذر التربيعي لمجموع المربعات.'],['جيب التمام','cosine','الضرب النقطي ÷ حاصل ضرب الطولين.'],['متجه الوحدة','unit vector','متجه طوله ١.'],['skip-gram','skip-gram','يتنبأ هل تجاور كلمةٌ كلمةً.'],['أخذ العيّنات السلبية','negative sampling','كلمات ضجيج عشوائية أمثلةً سلبية.'],['الإشراف الذاتي','self-supervision','النص نفسه يعطي الأجوبة الصحيحة.'],['تضمينات ثابتة','static embeddings','متجه واحد لكل كلمة مهما كان السياق.'],['تضمين الهدف / السياق','target / context embedding','المصفوفتان W وC.'],['fasttext','fasttext','تضمين الكلمة = مجموع تضمينات قطعها الحرفية.'],['GloVe','GloVe','تضمينات من نِسب احتمالات التواجد المشترك.'],['t-SNE','t-SNE','إسقاط الأبعاد الكثيرة إلى بُعدين.'],['نموذج متوازي الأضلاع','parallelogram model','b − a + a* لحل التشابهات.'],['ضرر التوزيع','allocational harm','توزيع موارد بظلم بين الفئات.'],['تضخيم الانحياز','bias amplification','التحيز في التضمين أكبر منه في النص.'],['الارتباط (الإحصائي)','correlation','مدى تحرك متغيرين معاً، من −١ إلى ١.']];
$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td><b>${g[0]}</b></td><td class="en">${esc(g[1])}</td><td>${esc(g[2])}</td></tr>`).join('');
