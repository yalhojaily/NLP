/* D2L section · shared helpers (load after ar-common.js, before d2lNN.js) */
const fmt=v=>{if(typeof v==='string')return v;if(Number.isInteger(v))return String(v);return String(+v.toFixed(3))};
const grid=(M,cls,opt={})=>{ // M: 2D array; cls(i,j) -> class
  const R=M.length,C=M[0].length;
  return `<div class="tgrid${opt.click?' click':''}" style="grid-template-columns:repeat(${C},auto)">${M.map((r,i)=>r.map((v,j)=>`<i class="${cls?cls(i,j):''}" data-i="${i}" data-j="${j}">${fmt(v)}</i>`).join('')).join('')}</div>`};
const lab=(t,inner)=>`<div><div class="tl">${t}</div>${inner}</div>`;
const shp=s=>'('+s.join(', ')+(s.length===1?',':'')+')';
function plot(el,o){
  const W=o.W||560,H=o.H||240,L=50,R=14,T=16,B=30;
  const x=v=>L+(v-o.xmin)/(o.xmax-o.xmin)*(W-L-R), y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;max-width:${o.maxw||'none'};height:auto;direction:ltr;display:block;margin:0 auto"><defs><clipPath id="c${el.id}"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs>`;
  (o.yt||[]).forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="var(--soft)">${o.ytf?o.ytf(v):v}</text>`});
  (o.xt||[]).forEach(v=>{s+=`<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H-B}" stroke="var(--rule)" stroke-dasharray="2 4"/><text x="${x(v)}" y="${H-B+15}" text-anchor="middle" font-size="11" fill="var(--soft)">${v}</text>`});
  if(o.xl)s+=`<text x="${W-R}" y="${H-3}" text-anchor="end" font-size="11" fill="var(--soft)">${o.xl}</text>`;if(o.yl)s+=`<text x="${L}" y="${T-4}" font-size="11" fill="var(--soft)">${o.yl}</text>`;
  (o.curves||[]).forEach(c=>{let d='';const n=200;for(let i=0;i<=n;i++){const v=o.xmin+(o.xmax-o.xmin)*i/n,u=c.f(v);if(!isFinite(u))continue;d+=(d?'L':'M')+x(v).toFixed(1)+' '+y(u).toFixed(1)}
    s+=`<path d="${d}" fill="none" stroke="${c.c}" stroke-width="${c.w||2.5}" ${c.dash?'stroke-dasharray="5 4"':''} clip-path="url(#c${el.id})"/>`});
  (o.lines||[]).forEach(p=>{s+=`<path d="${p.pts.map((q,i)=>(i?'L':'M')+x(q[0]).toFixed(1)+' '+y(q[1]).toFixed(1)).join('')}" fill="none" stroke="${p.c}" stroke-width="${p.w||1.8}" ${p.dash?'stroke-dasharray="4 4"':''} clip-path="url(#c${el.id})"/>`});
  (o.pts||[]).forEach(p=>{s+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r||5}" fill="${p.c}"/>${p.t?`<text x="${x(p.x)+(p.left?-8:8)}" y="${y(p.y)-8}" font-size="12" fill="${p.c}" text-anchor="${p.left?'end':'start'}">${p.t}</text>`:''}`});
  el.innerHTML=s+'</svg>';
}

/* standard normal sampler from a seeded uniform rng */
function gauss(R){let u=0,v=0;while(u===0)u=R();while(v===0)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
/* least squares via Householder QR: min ||A x - y||, A is n×p (n ≥ p) */
function lstsq(A,y){const n=A.length,p=A[0].length,Q=A.map(r=>r.slice()),b=y.slice();
  for(let k=0;k<p;k++){let s=0;for(let i=k;i<n;i++)s+=Q[i][k]*Q[i][k];let nr=Math.sqrt(s);if(nr===0)continue;if(Q[k][k]>0)nr=-nr;
    const v=[];for(let i=k;i<n;i++)v.push(Q[i][k]);v[0]-=nr;const vv=v.reduce((a,c)=>a+c*c,0);if(vv===0)continue;
    for(let j=k;j<p;j++){let d=0;for(let i=k;i<n;i++)d+=v[i-k]*Q[i][j];d=2*d/vv;for(let i=k;i<n;i++)Q[i][j]-=d*v[i-k]}
    let d=0;for(let i=k;i<n;i++)d+=v[i-k]*b[i];d=2*d/vv;for(let i=k;i<n;i++)b[i]-=d*v[i-k]}
  const x=new Array(p).fill(0);for(let k=p-1;k>=0;k--){let s=b[k];for(let j=k+1;j<p;j++)s-=Q[k][j]*x[j];x[k]=Math.abs(Q[k][k])<1e-12?0:s/Q[k][k]}return x}
