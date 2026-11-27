/* Arabic track · shared helpers (loaded before each lesson script) */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f3=v=>(+v).toFixed(3),r2=v=>(+v).toFixed(2),r1=v=>(+v).toFixed(1);
const AD=n=>String(n).replace(/\d/g,d=>'0123456789'[d]);
function segOn(id,cb){$$(id+' button').forEach(b=>b.addEventListener('click',()=>{$$(id+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b)}))}
const segVal=(id,k)=>$(id+' button.on').dataset[k];
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const bar=(lab,v,mx,txt,colr='var(--amber)')=>`<div class="br"><span class="w0" style="font-size:13px">${esc(lab)}</span><span class="tr"><span class="fl" style="display:block;width:${Math.max(0,Math.min(1,v/mx))*100}%;background:${colr}"></span></span><span class="v">${txt}</span></div>`;
const chip=(t,c,lab)=>`<span class="archip" style="${c==='plain'?'background:var(--paper);border-color:var(--rule)':`background:var(--${c}-soft);border-color:var(--${c})`}">${esc(t)}${lab?`<sub style="color:var(--${c==='plain'?'soft':c})">${esc(lab)}</sub>`:''}</span>`;
function initPage(SECS,GL){
  $('#toc').innerHTML=SECS.map(s=>`<a href="#${s[0]}" data-id="${s[0]}"><span class="n">${s[1]}</span><span>${s[2]}</span></a>`).join('');
  $('#mtoc').innerHTML=SECS.map(s=>`<a href="#${s[0]}">${s[1]?s[1]+' · ':''}${s[2]}</a>`).join('');
  const L=$$('#toc a');
  const on=()=>{const h=document.documentElement;$('#prog').style.width=(h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight)*100)+'%';
    let cur=SECS[0][0];SECS.forEach(s=>{const el=document.getElementById(s[0]);if(el&&el.getBoundingClientRect().top<140)cur=s[0]});L.forEach(a=>a.classList.toggle('on',a.dataset.id===cur))};
  addEventListener('scroll',on,{passive:true});on();
  if(GL&&$('#gloss'))$('#gloss').innerHTML='<tr><th>المصطلح</th><th>بالإنجليزية</th><th>المعنى</th></tr>'+GL.map(g=>`<tr><td>${g[0]}</td><td class="en">${esc(g[1])}</td><td>${g[2]}</td></tr>`).join('');
}
/* Arabic text utilities */
const HARAKAT=/[ً-ْٰ]/g;
const stripH=s=>s.replace(HARAKAT,'');
/* segmented buttons with Arabic labels: right-to-left, body font (the mono font has no Arabic glyphs) */
document.querySelectorAll('.seg button').forEach(b=>{if(/[؀-ۿ]/.test(b.textContent))b.classList.add('arl')});
