// ═══════════════════════════════════════════════
// ui-foundation.js — Visual polish & foundation
// Quotes, splash, clock, session, offline, haptic,
// confetti, achievements, auth guard, DOMContentLoaded init
// ═══════════════════════════════════════════════

// ═══ PART 1: FOUNDATION & VISUAL POLISH ═══

// ── Daily Medical Quotes ──
const MEDICAL_QUOTES=[
  {q:"The good physician treats the disease; the great physician treats the patient who has the disease.",a:"William Osler"},
  {q:"Medicine is not only a science; it is also an art. It does not consist of compounding pills and plasters.",a:"Paracelsus"},
  {q:"Wherever the art of medicine is loved, there is also a love of humanity.",a:"Hippocrates"},
  {q:"The art of medicine consists in amusing the patient while nature cures the disease.",a:"Voltaire"},
  {q:"A physician is obligated to consider more than a diseased organ, more even than the whole man — he must view the man in his world.",a:"Harvey Cushing"},
  {q:"The greatest medicine of all is teaching people how not to need it.",a:"Hippocrates"},
  {q:"To cure sometimes, to relieve often, to comfort always.",a:"Edward Trudeau"},
  {q:"One of the first duties of the physician is to educate the masses not to take medicine.",a:"William Osler"},
  {q:"The best doctor gives the least medicines.",a:"Benjamin Franklin"},
  {q:"A doctor must work eighteen hours a day and seven days a week. If you cannot console yourself to this, get out of the profession.",a:"Martin H. Fischer"},
  {q:"In nothing do men more nearly approach the gods than in giving health to men.",a:"Cicero"},
  {q:"It is more important to know what sort of person has a disease than to know what sort of disease a person has.",a:"Hippocrates"},
  {q:"The doctor of the future will give no medicine, but will instruct his patient in the care of the human frame.",a:"Thomas Edison"},
  {q:"Medicine is a science of uncertainty and an art of probability.",a:"William Osler"},
  {q:"Let food be thy medicine and medicine be thy food.",a:"Hippocrates"},
];

function loadDailyQuote(){
  const idx=new Date().getDate()%MEDICAL_QUOTES.length;
  const q=MEDICAL_QUOTES[idx];
  const el=document.getElementById('dailyQuoteTxt');
  const ea=document.getElementById('dailyQuoteAuthor');
  if(el)el.textContent='"'+q.q+'"';
  if(ea)ea.textContent='— '+q.a;
  // Also set splash quote
  const sq=document.getElementById('splashStatus');
  if(sq)sq.textContent='"'+q.q+'"';
}

// ── Splash Screen ──
function initSplashParticles(){
  const container = document.getElementById('spParticles');
  if(!container) return;
  for(let i=0;i<18;i++){
    const dot = document.createElement('div');
    dot.className = 'sp-dot';
    dot.style.left = Math.random()*100+'%';
    dot.style.animationDuration = (4+Math.random()*8)+'s';
    dot.style.animationDelay = (Math.random()*6)+'s';
    dot.style.width = dot.style.height = (1+Math.random()*2.5)+'px';
    dot.style.opacity = (0.1+Math.random()*0.4);
    container.appendChild(dot);
  }
}
function updateSplashStatus(msg){
  const el=document.getElementById('splashStatus');
  if(el)el.textContent=msg;
}
function hideSplash(){
  setTimeout(()=>{
    const s=document.getElementById('splash');
    if(s){s.classList.add('hide');setTimeout(()=>s.style.display='none',700);}
  },2200);
}

// ── Real-Time Clock ──
function startClock(){
  function tick(){
    const now=new Date();
    const h=now.getHours();
    const m=String(now.getMinutes()).padStart(2,'0');
    const s=String(now.getSeconds()).padStart(2,'0');
    const ampm=h>=12?'PM':'AM';
    const h12=((h%12)||12);
    const el=document.getElementById('liveClock');
    if(el)el.textContent=h12+':'+m+':'+s+' '+ampm;
  }
  tick();setInterval(tick,1000);
}

// ── Session Timer ──
const sessionStart=Date.now();
function startSessionTimer(){
  setInterval(()=>{
    const mins=Math.floor((Date.now()-sessionStart)/60000);
    const el=document.getElementById('sessionTimer');
    if(el)el.textContent='⏱ Session: '+(mins<60?mins+'m':Math.floor(mins/60)+'h '+mins%60+'m');
  },30000);
  // init immediately
  const el=document.getElementById('sessionTimer');
  if(el)el.textContent='⏱ Session: 0m';
}

// ── Offline Detection ──
function initOfflineDetection(){
  function update(){
    const b=document.getElementById('offlineBanner');
    if(!b)return;
    if(!navigator.onLine){b.classList.add('show');}else{b.classList.remove('show');}
  }
  window.addEventListener('online',update);
  window.addEventListener('offline',update);
  update();
}

// ── PWA Install Prompt ──
let deferredInstallPrompt=null;
/* PWA install moved to SW script */
/* installPWA in SW script */

// ── Haptic Feedback ──
function haptic(type='light'){
  if(!navigator.vibrate)return;
  const patterns={light:[10],medium:[30],heavy:[60],double:[20,50,20],success:[10,50,30]};
  navigator.vibrate(patterns[type]||[10]);
}

// ── Confetti ──
const confettiParticles=[];
function fireConfetti(){
  const canvas=document.getElementById('confettiCanvas');
  if(!canvas)return;
  canvas.style.display='block';
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const ctx=canvas.getContext('2d');
  const colors=['#14b88a','#2a7abf','#f39c12','#e74c3c','#9b59b6','#0f2a4a','#27ae60','#e67e22'];
  confettiParticles.length=0;
  for(let i=0;i<120;i++){
    confettiParticles.push({
      x:Math.random()*canvas.width,y:-10,
      vx:(Math.random()-0.5)*4,vy:Math.random()*4+2,
      color:colors[Math.floor(Math.random()*colors.length)],
      size:Math.random()*7+3,
      angle:Math.random()*360,spin:Math.random()*10-5,
      life:1
    });
  }
  let frame=0;
  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    confettiParticles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=0.08;p.angle+=p.spin;p.life-=0.008;
      if(p.life<=0||p.y>canvas.height)return;
      ctx.save();ctx.globalAlpha=p.life;ctx.translate(p.x,p.y);ctx.rotate(p.angle*Math.PI/180);
      ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
      ctx.restore();
    });
    frame++;
    if(frame<180)requestAnimationFrame(animate);
    else{ctx.clearRect(0,0,canvas.width,canvas.height);canvas.style.display='none';}
  }
  animate();
  haptic('success');
}

// ── Achievements System ──
const ACHIEVEMENTS={
  first_rx:{icon:'🎉',title:'First Prescription!',sub:'You wrote your first prescription'},
  ten_rx:{icon:'⭐',title:'10 Prescriptions!',sub:'You\'re on a roll, Doctor!'},
  fifty_rx:{icon:'🏆',title:'50 Prescriptions!',sub:'Experienced Physician'},
  hundred_rx:{icon:'💎',title:'100 Prescriptions!',sub:'Master Prescriber — Elite level!'},
  first_child:{icon:'👶',title:'Pediatric Care!',sub:'First pediatric prescription written'},
  first_preg:{icon:'🤰',title:'Safe for Mom!',sub:'First pregnancy-safe prescription'},
  night_owl:{icon:'🦉',title:'Night Owl!',sub:'Working after midnight — dedication!'},
};

function checkAchievements(count){
  const earned=JSON.parse(localStorage.getItem('achievements')||'[]');
  const checks=[
    {key:'first_rx',cond:count===1},
    {key:'ten_rx',cond:count===10},
    {key:'fifty_rx',cond:count===50},
    {key:'hundred_rx',cond:count===100},
    {key:'first_child',cond:flags.child&&count>0},
    {key:'first_preg',cond:flags.preg&&count>0},
    {key:'night_owl',cond:new Date().getHours()>=0&&new Date().getHours()<5},
  ];
  checks.forEach(({key,cond})=>{
    if(cond&&!earned.includes(key)){
      earned.push(key);
      localStorage.setItem('achievements',JSON.stringify(earned));
      showAchievement(ACHIEVEMENTS[key]);
    }
  });
}

function showAchievement(ach){
  if(!ach)return;
  const t=document.getElementById('achieveToast');
  document.getElementById('achIcon').textContent=ach.icon;
  document.getElementById('achTitle').textContent=ach.title;
  document.getElementById('achSub').textContent=ach.sub;
  t.classList.add('show');
  haptic('double');
  setTimeout(()=>t.classList.remove('show'),4000);
}

// ── Init All Part 1 Features ──
// ═══ API KEYS ═══
// Keys have been moved to Supabase Edge Function secrets (ai-proxy).
// See supabase/functions/ai-proxy/index.ts in your project.

// ═══ AUTH GUARD ═══
(function() {
  // First check if OAuth token is in URL hash or code in params
  const hash = window.location.hash;
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (hash && hash.includes('access_token')) {
    // Save token from hash
    try {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token') || '';
      if (access_token) {
        const parts = access_token.split('.');
        const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
        localStorage.setItem('sb_session', JSON.stringify({
          access_token, refresh_token,
          user: { id: payload.sub, email: payload.email,
            user_metadata: { full_name: payload.user_metadata?.full_name || payload.email || '' }
          }
        }));
        history.replaceState(null, '', window.location.pathname);
      }
    } catch(e) { console.error('Auth guard token parse:', e); }
  }

  // Now check session
  try {
    const session = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!session || !session.access_token) {
      // If there's a code param, let login.html handle it
      if (code) { window.location.href = 'login.html?' + urlParams.toString(); return; }
      window.location.href = 'login.html';
      return;
    }
    // Show doctor name in header
    const name = session.user?.user_metadata?.full_name || session.user?.email || '';
    if (name) {
      const dnm = document.getElementById('dnm');
      if (dnm) dnm.textContent = name;
    }
  } catch(e) {
    window.location.href = 'login.html';
  }
})();

document.addEventListener('DOMContentLoaded',()=>{
  initSplashParticles();
  updateSplashStatus('Loading prescription engine...');
  setTimeout(()=>updateSplashStatus('Ready ✓'),800);
  loadDailyQuote();
  hideSplash();
  startClock();
  startSessionTimer();
  initOfflineDetection();
  // Part 2 inits
  initBottomNav();
  initCommandPalette();
  initAutoLock();
  initSwipeGestures();
  initContextMenu();
  initKeyboardShortcuts();
  updateBnavBadges();
  loadSessionLog();
  renderAchievements();
  // Part 3 inits
  initSymptomChecker();
});

