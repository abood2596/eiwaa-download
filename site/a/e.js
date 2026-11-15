/* إيواء — landing v2: demos + the narrated tour. Vanilla, no dependencies. */
(function(){
'use strict';
document.body.classList.remove('no-js');
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
var PATH=document.body.dataset.path||'camp';
var AUTO={},STORY={show:function(){}},TOUR={on:false};
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function emit(type,detail){document.dispatchEvent(new CustomEvent('eiwaa:act',{detail:{type:type,v:detail}}))}

/* WhatsApp Business «إيواء» — the number is assembled here and never printed */
var WA=['972','56','750','1850'].join('');
$$('[data-wa]').forEach(function(a){a.href='https://wa.me/'+WA+'?text='+encodeURIComponent(a.dataset.wa);a.target='_blank';a.rel='noopener'});
var d0=new Date();$$('[data-today]').forEach(function(e){e.textContent=('0'+d0.getDate()).slice(-2)+'/'+('0'+(d0.getMonth()+1)).slice(-2)+'/'+d0.getFullYear()});

/* entrance */
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -12% 0px',threshold:.15}):null;
$$('[data-in]').forEach(function(e){io?io.observe(e):e.classList.add('in')});

/* ---------- sound effects, synthesised (no download) ---------- */
var AC=null,muted=false;
function ac(){if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended')AC.resume();return AC}
var SFX={
  stamp:function(c,t){var o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(48,t+.16);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.55,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.25);noise(c,t,.05,1800,.18)},
  chime:function(c,t){[[880,0],[1318.5,.12]].forEach(function(n){var o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=n[0];g.gain.setValueAtTime(.0001,t+n[1]);g.gain.exponentialRampToValueAtTime(.16,t+n[1]+.01);g.gain.exponentialRampToValueAtTime(.0001,t+n[1]+.7);o.connect(g).connect(c.destination);o.start(t+n[1]);o.stop(t+n[1]+.75)})},
  swoosh:function(c,t){noise(c,t,.32,900,.12,true)}
};
function noise(c,t,dur,f,vol,sweep){var n=c.sampleRate*dur,b=c.createBuffer(1,n,c.sampleRate),x=b.getChannelData(0);for(var i=0;i<n;i++)x[i]=Math.random()*2-1;var s=c.createBufferSource();s.buffer=b;var bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(f,t);if(sweep)bp.frequency.exponentialRampToValueAtTime(f*3,t+dur);var g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*.3);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(bp).connect(g).connect(c.destination);s.start(t);s.stop(t+dur)}
function sfx(name){if(muted||!soundOn)return;var c=ac();if(!c)return;try{SFX[name](c,c.currentTime+.01)}catch(e){}}
var soundOn=false; /* sound only after the visitor starts the tour */

/* ---------- ID check (Palestinian check digit, in the browser only) ---------- */
function valid(s){if(!/^\d{9}$/.test(s))return false;var t=0;for(var i=0;i<9;i++){var n=+s[i]*(i%2?2:1);t+=n>9?n-9:n}return t%10===0}
function mk(b){for(var c=0;c<10;c++)if(valid(b+c))return b+c}
var reg=$('#reg');
if(reg){
  var fam=[['F-041','أسرة يوسف ماهر',mk('40136827')],['F-042','أسرة هدى رامي',mk('40258314')],['F-043','أسرة خالد إبراهيم',mk('80371569')],['F-044','أسرة منى شعث',mk('90412736')]];
  reg.innerHTML=fam.map(function(f,i){return '<div data-i="'+i+'"><span class="m">'+f[0]+'</span><span>'+f[1]+'</span><span class="m">'+f[2].slice(0,3)+'····'+f[2].slice(7)+'</span></div>'}).join('');
  var inp=$('#idin'),res=$('#res'),sb=$('#stampbox'),last='';
  var stamp=function(cls,txt){if(last===txt)return;last=txt;sb.innerHTML=txt?'<div class="stamp '+cls+(RM?'':' thud')+'">'+txt+'</div>':'';if(txt)sfx('stamp')};
  var check=function(){
    var v=inp.value.replace(/[٠-٩]/g,function(c){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))}).replace(/\D/g,'').slice(0,9);
    if(inp.value!==v)inp.value=v;
    $$('div',reg).forEach(function(r){r.classList.remove('hit')});
    res.className='res';
    if(!v){res.textContent='يُفحص الرقم على جهازك فقط، ولا يُرسل لأي مكان.';stamp('','');return}
    if(v.length<9){res.textContent='كتبت '+v.length+' من 9 أرقام';stamp('','');return}
    var hit=-1;fam.forEach(function(f,i){if(f[2]===v)hit=i});
    if(hit>=0){$('[data-i="'+hit+'"]',reg).classList.add('hit');res.className='res dup';res.innerHTML='<span><b>مسجّل من قبل</b>في '+fam[hit][1]+' ('+fam[hit][0]+'). لن تُسجَّل الأسرة مرتين.</span>';stamp('s-dup','مكرّر');emit('id','dup');return}
    if(!valid(v)){res.className='res bad';res.innerHTML='<span><b>الرقم غير صحيح.</b>راجعه مع صاحب الهوية قبل الحفظ.</span>';stamp('s-bad','راجع الرقم');emit('id','bad');return}
    res.className='res ok';res.innerHTML='<span><b>رقم صحيح</b>وغير مسجّل. يمكن الحفظ.</span>';stamp('s-ok','تم التحقق');emit('id','ok');
  };
  inp.addEventListener('input',check);
  var typeIn=function(v){var i=0;(function t(){inp.value=v.slice(0,++i);check();if(i<9)setTimeout(t,RM?0:55)})()};
  $$('[data-try]').forEach(function(b){b.addEventListener('click',function(){
    var s=fam[2][2];typeIn(b.dataset.try==='dup'?fam[1][2]:s.slice(0,8)+((+s[8]+3)%10));
  })});
  AUTO.id=function(){typeIn(fam[1][2])};
}

/* ---------- before / after ---------- */
var ba=$('#ba');
if(ba){
  var rg=$('input',ba),done=false;
  var setX=function(){ba.style.setProperty('--x',rg.value+'%');if(!done&&+rg.value>=70){done=true;var s=$('.ba-after .stamp',ba);if(s&&!RM){s.classList.remove('thud');void s.offsetWidth;s.classList.add('thud')}sfx('stamp');emit('ba')}};
  rg.addEventListener('input',setX);
  var glide=function(to,cb){var from=+rg.value,t0=performance.now(),D=RM?1:1100;(function f(n){var k=Math.min(1,(n-t0)/D),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;rg.value=Math.round(from+(to-from)*e);setX();if(k<1)requestAnimationFrame(f);else if(cb)cb()})(t0)};
  if(io&&!RM){var nb=new IntersectionObserver(function(es){if(es[0].isIntersecting){nb.disconnect();var seq=[44,36,30,38,50],k=0;setTimeout(function s(){rg.value=seq[k++];ba.style.setProperty('--x',rg.value+'%');if(k<seq.length)setTimeout(s,80)},500)}},{threshold:.7});nb.observe(ba)}
  AUTO.ba=function(){glide(88)};
}

/* ---------- offline ---------- */
var sw=$('#sw');
if(sw){
  var net=$('#net'),ol=$('#ol'),pend=$('#pend'),names=['أسرة سامي عمر','أسرة رنا محمود','أسرة عمر نبيل','أسرة نادر حسن','أسرة ليلى سالم','أسرة إياد خليل'],no=46,q=[],offAdds=0;
  var tagOf=function(on){return on?'<span class="tag t-ok">أُرسلت</span>':'<span class="tag t-am">على الجوال</span>'};
  var upd=function(){pend.textContent=q.length};
  var isOn=function(){return sw.getAttribute('aria-checked')==='true'};
  var add=function(){
    var e=$('.empty',ol);if(e)e.remove();
    var on=isOn(),li=document.createElement('li');no++;
    li.innerHTML='<span class="m">F-0'+no+'</span><span>'+names[(no-47)%names.length]+'</span>'+tagOf(on);
    ol.insertBefore(li,ol.firstChild);if(!on){q.push(li);offAdds++}
    while(ol.children.length>5){var x=ol.lastChild;q=q.filter(function(y){return y!==x});ol.removeChild(x)}
    upd();sfx('swoosh');
    if(!on&&offAdds>=2)emit('off2');
  };
  var toggle=function(){
    var on=!isOn();sw.setAttribute('aria-checked',String(on));
    net.className='net '+(on?'on':'off');net.textContent=on?'متصل':'مقطوع';
    if(on){var had=q.length;(function flush(){if(!isOn())return;var li=q.shift();if(!li){upd();if(had){sfx('chime');emit('sync')}return}li.lastChild.outerHTML=tagOf(true);upd();setTimeout(flush,RM?0:420)})()}
    else emit('cut');
  };
  $('#add').addEventListener('click',add);
  sw.addEventListener('click',toggle);
  AUTO.cut=function(){if(isOn())toggle()};
  AUTO.off2=function(){if(isOn())toggle();add();setTimeout(add,700)};
  AUTO.sync=function(){if(!isOn())toggle()};
  /* start "online" so the visitor cuts it */
  sw.setAttribute('aria-checked','true');net.className='net on';net.textContent='متصل';
}

/* ---------- journey (sticky phone / swipe cards) ---------- */
var steps=$$('.st');
if(steps.length){
  var imgs=$$('.stick .scr img'),dots=$$('.prog b'),cnt=$('.prog span');
  var act=function(i){steps.forEach(function(s,k){s.classList.toggle('on',k===i)});imgs.forEach(function(m,k){m.classList.toggle('on',k===i)});dots.forEach(function(x,k){x.classList.toggle('on',k===i)});if(cnt)cnt.textContent=(i+1)+' / '+steps.length};
  act(0);STORY.show=function(i){var s=steps[i];if(innerWidth<=980){var p=s.parentNode;p.scrollTo({left:s.offsetLeft-(p.clientWidth-s.offsetWidth)/2,behavior:RM?'auto':'smooth'});act(i)}else scrollToEl(s,'center')};
  if(io){
    var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)act(+e.target.dataset.i)})},{rootMargin:'-45% 0px -50% 0px'});
    var sh=new IntersectionObserver(function(es){es.forEach(function(e){if(e.intersectionRatio>.6)act(+e.target.dataset.i)})},{root:$('.steps'),threshold:[.6]});
    var mq=matchMedia('(max-width:980px)');
    var wire=function(){steps.forEach(function(s){so.unobserve(s);sh.unobserve(s);(mq.matches?sh:so).observe(s)})};
    wire();mq.addEventListener?mq.addEventListener('change',wire):mq.addListener(wire);
  }
}

/* ---------- films: one at a time; big play button ---------- */
$$('.vbox').forEach(function(b){
  var v=$('video',b),p=$('.play',b);
  p.addEventListener('click',function(){v.controls=true;p.hidden=true;v.play();emit('film')});
  v.addEventListener('play',function(){p.hidden=true;$$('video').forEach(function(o){if(o!==v)o.pause()});if(TOUR.on)TOUR.hold()});
  v.addEventListener('ended',function(){emit('filmEnd')});
});

/* ---------- org: export card (hero animates itself; chapter is interactive) ---------- */
var serial=31;
function exportCard(root,auto){
  if(!root)return;
  var btn=$('.btn',root),doc=$('.xdoc',root),log=$('.xlog',root),stampHost=$('.xdoc',root);
  var go=function(){
    if(btn.disabled)return;btn.disabled=true;btn.textContent='تم الاعتماد';
    var s=document.createElement('div');s.className='stamp s-ok'+(RM?'':' thud');s.textContent='معتمد';stampHost.appendChild(s);
    $('[data-serial]',root).textContent='2026/0'+serial;sfx('stamp');
    if(log){var r=document.createElement('div');r.className='xr new';r.innerHTML='<span class="m">2026/0'+serial+'</span><span>'+root.dataset.org+'</span><span class="m">64</span><span class="m dt" data-today></span>';log.insertBefore(r,log.children[1]);var t=$('[data-today]',r);t.textContent=('0'+d0.getDate()).slice(-2)+'/'+('0'+(d0.getMonth()+1)).slice(-2)+'/'+d0.getFullYear()}
    serial++;if(!auto)emit('export');
  };
  btn.addEventListener('click',go);
  if(auto){if(RM)go();else setTimeout(go,1600)}
  else AUTO.export=go;
}
exportCard($('#xhero'),true);exportCard($('#xch'),false);

/* ---------- org: twenty forms merge into one ---------- */
var forms=$('.forms');
if(forms){
  var W=forms.clientWidth,H=forms.clientHeight,h='';
  for(var i=0;i<14;i++){var x=Math.round(Math.random()*(W-150)),y=Math.round(Math.random()*(H-96)),r=Math.round(Math.random()*24-12);h+='<div class="fm" style="left:'+x+'px;top:'+y+'px;transform:rotate('+r+'deg);--mx:'+Math.round(W/2-75-x)+'px;--my:'+Math.round(H/2-48-y)+'px"><i></i><i></i><i style="width:'+(40+Math.random()*50|0)+'%"></i><i></i></div>'}
  forms.insertAdjacentHTML('afterbegin',h);
  var fo=io?new IntersectionObserver(function(es){if(es[0].isIntersecting){fo.disconnect();setTimeout(function(){forms.classList.add('merge')},RM?0:1400)}},{threshold:.6}):null;
  fo?fo.observe(forms):forms.classList.add('merge');
}

/* ---------- org: chain lights up ---------- */
var chain=$('.chain');
if(chain){var lis=$$('li',chain);var co=io?new IntersectionObserver(function(es){if(es[0].isIntersecting){co.disconnect();lis.forEach(function(l,k){setTimeout(function(){l.classList.add('lit')},RM?0:k*650)})}},{threshold:.5}):null;co?co.observe(chain):lis.forEach(function(l){l.classList.add('lit')})}

/* ---------- org: privacy toggle ---------- */
var pv=$('#pv');
if(pv){
  var cells=$$('[data-id]'),ph=$$('[data-ph]');
  var set=function(on){pv.setAttribute('aria-checked',String(on));cells.forEach(function(c){c.textContent=on?'•••••'+c.dataset.id.slice(5):c.dataset.id});ph.forEach(function(c){c.textContent=on?'—':c.dataset.ph})};
  set(false);
  pv.addEventListener('click',function(){var on=pv.getAttribute('aria-checked')!=='true';set(on);if(on){sfx('swoosh');emit('privacy')}});
  AUTO.privacy=function(){if(pv.getAttribute('aria-checked')!=='true')pv.click()};
}

/* ======================= the narrated tour ======================= */
function scrollToEl(el,block){var r=el.getBoundingClientRect(),hd=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hd'))||64,tb=document.body.classList.contains('touring')&&bar?bar.offsetHeight:0,avail=innerHeight-hd-tb;var y=block==='center'?r.top+scrollY-hd-Math.max(8,(avail-r.height)/2):r.top+scrollY-hd-8;scrollTo({top:Math.max(0,y),behavior:RM?'auto':'smooth'})}
var LINES={};try{LINES=JSON.parse($('#lines').textContent)}catch(e){}
var PLAN={
  camp:[
    {sec:'#c1',line:'intro'},
    {sec:'#c2',line:'chaos',wait:'ba',react:'chaos_done',focus:'#ba'},
    {sec:'#c3',line:'reveal',sfx:'swoosh',pause:600},
    {sec:'#c4',line:'id',wait:'id',react:{ok:'id_ok',bad:'id_bad',dup:'id_dup'},focus:'.idc'},
    {sec:'#c5',line:'off',wait:'off2',react:'off_saved',then:{wait:'sync',react:'off_sync'},focus:'.panel'},
    {sec:'#c6',story:['j1','j2','j3','j4','j5']},
    {sec:'#c7',line:'film',wait:'film',focus:'.vbox',film:true},
    {sec:'#c9',line:'close'}
  ],
  org:[
    {sec:'#o1',line:'intro'},
    {sec:'#o2',line:'chaos',wait:'ba',react:'chaos_done',focus:'#ba'},
    {sec:'#o3',line:'reveal',sfx:'swoosh',pause:600},
    {sec:'#o4',line:'export',wait:'export',react:'export_done',focus:'#xch'},
    {sec:'#o5',line:'chain'},
    {sec:'#o6',line:'privacy',wait:'privacy',react:'privacy_done',focus:'.priv'},
    {sec:'#o7',line:'film',wait:'film',focus:'.vbox',film:true},
    {sec:'#o9',line:'close'}
  ]
}[PATH];
var bar=$('.tbar'),capEl=$('.cap',bar),dotsEl=$('.tdots',bar);
var voice=new Audio(),bed=null,run=0,paused=false,waiters=[],cur=-1,capsOn=true;
voice.preload='auto';

function setCap(t){capEl.textContent=t||''}
function vol(){if(bed)bed.volume=muted?0:(voice.paused?.16:.06);voice.muted=muted}
function chk(id){if(id!==run)throw 'stop'}
function gate(id){chk(id);if(!paused)return Promise.resolve();return new Promise(function(r){waiters.push(r)}).then(function(){chk(id)})}
function sleep(ms,id){return new Promise(function(r){var left=ms,t0=Date.now(),tm;function go(){t0=Date.now();tm=setTimeout(fin,left)}function fin(){if(paused){left=Math.max(0,left-(Date.now()-t0));waiters.push(go);return}r()}go()}).then(function(){chk(id)})}
function say(k,id){
  chk(id);var txt=LINES[k]||'';setCap(txt);
  return new Promise(function(res){
    var done=false;function fin(){if(done)return;done=true;voice.onended=voice.onerror=null;vol();res()}
    voice.onended=fin;voice.onerror=function(){setTimeout(fin,Math.max(1800,txt.length*70))};
    voice.src='/audio/'+PATH+'/'+k+'.mp3';if(bed&&bed.paused)bed.play().catch(function(){});
    var p=voice.play();vol();
    if(p&&p.catch)p.catch(function(){setTimeout(fin,Math.max(1800,txt.length*70))});
  }).then(function(){return gate(id)});
}
function waitFor(type,id,ms){
  return new Promise(function(res){
    var t=null,fired=false;
    function h(e){if(e.detail.type===type){fin(e.detail.v)}}
    function fin(v){if(fired)return;fired=true;document.removeEventListener('eiwaa:act',h);clearTimeout(t);res(v)}
    document.addEventListener('eiwaa:act',h);
    (function arm(){t=setTimeout(function(){if(paused){waiters.push(arm);return}if(id!==run){fin();return}if(AUTO[type])AUTO[type]();else fin()},ms)})();
  }).then(function(v){chk(id);return v});
}
function mark(i){cur=i;$$('button',dotsEl).forEach(function(b,k){b.classList.toggle('on',k===i);b.classList.toggle('done',k<i);b.setAttribute('aria-current',k===i?'step':'false')})}
function focusOn(sel,on){var el=sel&&$(sel);if(el)el.classList.toggle('focus-ring',!!on)}

async function play(from){
  var id=++run;paused=false;setPause(false);
  try{
    for(var i=from;i<PLAN.length;i++){
      var s=PLAN[i];mark(i);
      var sec=$(s.sec),fe=s.focus&&$(s.focus);sec.classList.add('in');if(fe&&innerWidth<=980){scrollToEl(sec);await sleep(RM?100:900,id);scrollToEl(fe,'center')}else scrollToEl(fe&&innerHeight<900?fe:sec,fe&&innerHeight<900?'center':0);
      await sleep(RM?150:700,id);
      if(s.sfx)sfx(s.sfx);
      if(s.story){for(var j=0;j<s.story.length;j++){STORY.show(j);await sleep(RM?100:450,id);await say(s.story[j],id);await sleep(500,id)}continue}
      await say(s.line,id);
      if(s.wait){
        focusOn(s.focus,true);
        if(s.film){setCap('');var fv=await waitFor('film',id,9000);focusOn(s.focus,false);if(fv===undefined&&!filmPlaying()){continue}await filmDone(id);continue}
        var v=await waitFor(s.wait,id,s.wait==='id'?16000:14000);
        focusOn(s.focus,false);
        await sleep(350,id);
        await say(typeof s.react==='object'?s.react[v||'dup']:s.react,id);
        if(s.then){focusOn(s.focus,true);await waitFor(s.then.wait,id,10000);focusOn(s.focus,false);await sleep(500,id);await say(s.then.react,id)}
      }
      if(s.pause)await sleep(s.pause,id);
      await sleep(700,id);
    }
    finish(false);
  }catch(e){if(e!=='stop')throw e}
}
function filmPlaying(){var v=$('.vbox video');return v&&!v.paused}
function filmDone(id){return new Promise(function(r){var v=$('.vbox video');if(!v||v.paused&&v.currentTime===0){r();return}v.addEventListener('ended',r,{once:true});v.addEventListener('pause',function p(){r();v.removeEventListener('pause',p)})}).then(function(){chk(id);paused=false;setPause(false)})}
TOUR.hold=function(){voice.pause();if(bed)bed.pause();setCap('')};

function start(from){
  soundOn=true;ac();TOUR.on=true;document.body.classList.add('touring');
  if(!bed){bed=new Audio('/audio/bed-'+PATH+'.mp3');bed.loop=true;bed.preload='auto'}
  bed.play().catch(function(){});vol();
  play(from||0);
  $('.tctl .tb',bar).focus({preventScroll:true});
}
function finish(user){
  run++;TOUR.on=false;voice.pause();if(bed)bed.pause();setCap('');paused=false;
  $$('.focus-ring').forEach(function(e){e.classList.remove('focus-ring')});
  document.body.classList.remove('touring');
  if(!user){var c=$(PLAN[PLAN.length-1].sec);var b=c&&$('.btn',c);if(b)b.focus({preventScroll:true})}
}
function setPause(p){paused=p;var b=$('[data-t=pause]',bar);b.setAttribute('aria-pressed',String(p));$('.t',b).textContent=p?'تابع':'إيقاف مؤقت';$('use',b).setAttribute('href',p?'#i-play':'#i-pause')}

if(bar&&PLAN){
  dotsEl.innerHTML=PLAN.map(function(s,i){return '<button type="button" aria-label="الفصل '+(i+1)+' من '+PLAN.length+'"></button>'}).join('');
  $$('button',dotsEl).forEach(function(b,i){b.addEventListener('click',function(){voice.pause();play(i)})});
  bar.addEventListener('click',function(e){
    var b=e.target.closest('[data-t]');if(!b)return;var t=b.dataset.t;
    if(t==='pause'){if(paused){setPause(false);var w=waiters;waiters=[];w.forEach(function(f){f()});if(voice.src&&!voice.ended&&voice.currentTime>0)voice.play().catch(function(){});if(bed)bed.play().catch(function(){});vol()}else{setPause(true);voice.pause();if(bed)bed.pause()}}
    if(t==='mute'){muted=!muted;b.setAttribute('aria-pressed',String(muted));$('.t',b).textContent=muted?'الصوت':'كتم';$('use',b).setAttribute('href',muted?'#i-mute':'#i-vol');vol()}
    if(t==='cap'){capsOn=!capsOn;b.setAttribute('aria-pressed',String(capsOn));capEl.classList.toggle('off',!capsOn)}
    if(t==='skip'){voice.pause();var n=cur+1;if(n<PLAN.length)play(n);else finish(false)}
    if(t==='end')finish(true);
  });
  addEventListener('keydown',function(e){if(e.key==='Escape'&&TOUR.on)finish(true)});
}

/* chooser: the first decision of the tour */
var ch=$('#chooser');
$$('[data-tour-start]').forEach(function(b){b.addEventListener('click',function(){
  ch.hidden=false;$('[data-pick='+PATH+']',ch).focus();
})});
if(ch){
  $$('[data-pick]',ch).forEach(function(b){b.addEventListener('click',function(){
    if(b.dataset.pick===PATH){ch.hidden=true;start(0)}
    else location.href=(b.dataset.pick==='org'?'/org/':'/')+'#tour';
  })});
  $('.x',ch).addEventListener('click',function(){ch.hidden=true});
  ch.addEventListener('keydown',function(e){if(e.key==='Escape')ch.hidden=true});
  /* arrived from the other page's chooser: one tap to start (sound needs a tap) */
  if(location.hash==='#tour'){history.replaceState(null,'',location.pathname);ch.hidden=false;$$('[data-pick]',ch).forEach(function(b){if(b.dataset.pick!==PATH)b.hidden=true});$('.lead',ch).textContent='اضغط لتبدأ الجولة بالصوت.'}
}

/* the page opens without internet after the first visit */
if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});
})();
