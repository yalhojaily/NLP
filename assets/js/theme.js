/* Theme: light / dark, remembered per browser. Loaded in <head> so the page never flashes the wrong theme. */
(function(){
  var KEY='slp-theme', root=document.documentElement;
  function saved(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function current(){return root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
  var s=saved(); if(s==='dark'||s==='light') root.setAttribute('data-theme',s);
  function label(btn){var d=current()==='dark';btn.textContent=d?'☀':'☾';btn.setAttribute('aria-label',d?'الوضع النهاري':'الوضع الليلي');btn.title=btn.getAttribute('aria-label')}
  document.addEventListener('DOMContentLoaded',function(){
    var bar=document.querySelector('.bar-in'); if(!bar) return;
    var btn=document.createElement('button'); btn.type='button'; btn.className='theme-btn'; label(btn);
    btn.addEventListener('click',function(){
      var next=current()==='dark'?'light':'dark'; root.setAttribute('data-theme',next);
      try{localStorage.setItem(KEY,next)}catch(e){} label(btn);
      document.dispatchEvent(new CustomEvent('themechange'));
    });
    bar.appendChild(btn);
  });
})();
