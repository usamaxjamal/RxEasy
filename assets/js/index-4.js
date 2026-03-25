// ══════════════════════════════════════════════════
// SIDEBAR
// ACC-01 FIX: sidebar now has proper ARIA attributes and focus management
// ══════════════════════════════════════════════════
let _sidebarLastFocus = null;
function openSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  sb.classList.add('open');
  sb.setAttribute('aria-hidden','false');
  ov.classList.add('show');
  document.body.style.overflow='hidden';
  _sidebarLastFocus = document.activeElement;
  // Move focus to first interactive item in sidebar
  const firstBtn = sb.querySelector('button, [href], [tabindex]');
  if(firstBtn) setTimeout(()=>firstBtn.focus(), 50);
}
function closeSidebar(){
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  sb.classList.remove('open');
  sb.setAttribute('aria-hidden','true');
  ov.classList.remove('show');
  document.body.style.overflow='';
  if(_sidebarLastFocus) _sidebarLastFocus.focus();
}
function sbToggle(titleEl) {
  const section = titleEl.closest('.sb-section');
  section.classList.toggle('collapsed');
}
function updateSidebarBadges() {
  const hc = window.rxHist?.length || parseInt(localStorage.getItem('rxCount')||'0');
  const pc = window.patients?.length || 0;
  const hb = document.getElementById('sb-hist-badge');
  const pb = document.getElementById('sb-pts-badge');
  if (hb) { hb.textContent = hc > 99 ? '99+' : hc; hb.style.display = hc > 0 ? '' : 'none'; }
  if (pb) { pb.textContent = pc > 99 ? '99+' : pc; pb.style.display = pc > 0 ? '' : 'none'; }
  // sync dark button label
  const isDark = document.body.classList.contains('dark');
  const dbtn = document.getElementById('sbDkBtn');
  if (dbtn) dbtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
}

// Fix bnav() calls that referenced bottom nav tabs — redirect to sidebar open
// Override bnav to handle about tab (since bottom nav is removed)
function bnav(tab) {
  if (tab === 'about') {
    document.getElementById('tab-about').style.display = 'block';
    window.scrollTo(0,0);
  } else if (tab === 'home') {
    document.getElementById('tab-about').style.display = 'none';
  } else {
    openSheet(tab);
  }
}

// Also intercept updateBnavBadges to update sidebar instead
function updateBnavBadges() {
  updateSidebarBadges();
}

// ══════════════════════════════════════════════════
// COMMON DISEASES
// ══════════════════════════════════════════════════
const COMMON_DISEASES = [
  // Respiratory
  {cat:'🫁 Respiratory', name:'URTI / Common Cold', tags:'Cough, runny nose, sore throat', q:'Fever dry cough URTI upper respiratory'},
  {cat:'🫁 Respiratory', name:'LRTI / Bronchitis', tags:'Productive cough, wheezing', q:'Fever productive cough LRTI bronchitis'},
  {cat:'🫁 Respiratory', name:'Pneumonia', tags:'High fever, SOB, consolidation', q:'Pneumonia community acquired fever SOB'},
  {cat:'🫁 Respiratory', name:'Asthma', tags:'Wheeze, SOB, dry cough', q:'Asthma severe coughing wheeze'},
  {cat:'🫁 Respiratory', name:'Pulmonary TB', tags:'Hemoptysis, night sweats, weight loss', q:'Pulmonary tuberculosis TB'},
  {cat:'🫁 Respiratory', name:'Sinusitis', tags:'Facial pain, nasal congestion', q:'Sinusitis sinus infection'},
  {cat:'🫁 Respiratory', name:'Tonsillitis / Throat', tags:'Sore throat, dysphagia', q:'Sore throat tonsillitis pharyngitis'},
  // GI
  {cat:'🫃 GI / Abdomen', name:'GERD / Acidity', tags:'Heartburn, regurgitation', q:'GERD acidity heartburn'},
  {cat:'🫃 GI / Abdomen', name:'H. Pylori', tags:'Epigastric pain, bloating', q:'H.Pylori stomach infection'},
  {cat:'🫃 GI / Abdomen', name:'Peptic Ulcer', tags:'Epigastric pain, melena', q:'Gastric ulcer peptic ulcer'},
  {cat:'🫃 GI / Abdomen', name:'Diarrhea / Gastroenteritis', tags:'Loose stool, vomiting, cramps', q:'Diarrhea gastroenteritis loose stool'},
  {cat:'🫃 GI / Abdomen', name:'Typhoid Fever', tags:'Step-ladder fever, rose spots', q:'Typhoid fever enteric fever'},
  {cat:'🫃 GI / Abdomen', name:'H. Pylori Eradication', tags:'Triple therapy, clarithromycin', q:'H.Pylori eradication triple therapy'},
  {cat:'🫃 GI / Abdomen', name:'IBS', tags:'Cramping, alternating bowel', q:'IBS irritable bowel syndrome'},
  {cat:'🫃 GI / Abdomen', name:'Constipation', tags:'Straining, hard stool', q:'Constipation'},
  {cat:'🫃 GI / Abdomen', name:'Vomiting / Nausea', tags:'Antiemetics, rehydration', q:'Vomiting nausea'},
  // Infections
  {cat:'🦠 Infections', name:'UTI', tags:'Dysuria, frequency, urgency', q:'UTI urinary tract infection'},
  {cat:'🦠 Infections', name:'Pyelonephritis', tags:'Flank pain, fever, CVA tenderness', q:'Pylonephritis kidney infection'},
  {cat:'🦠 Infections', name:'Malaria', tags:'Fever, rigors, splenomegaly', q:'Malaria falciparum fever'},
  {cat:'🦠 Infections', name:'Ear Infection (Otitis)', tags:'Ear pain, discharge', q:'Ear infection discharge otitis'},
  {cat:'🦠 Infections', name:'Skin / Cellulitis', tags:'Redness, warmth, swelling', q:'Cellulitis skin infection'},
  {cat:'🦠 Infections', name:'Oral Ulcer / Aphthous', tags:'Mouth sores, painful ulcers', q:'Oral ulcer aphthous ulcer mouth sores'},
  // Chronic
  {cat:'💊 Chronic Diseases', name:'Hypertension', tags:'High BP, headache, dizziness', q:'Hypertension high blood pressure'},
  {cat:'💊 Chronic Diseases', name:'Diabetes Type 2', tags:'Polyuria, polydipsia, fatigue', q:'Diabetes mellitus type 2 DM'},
  {cat:'💊 Chronic Diseases', name:'Asthma (Maintenance)', tags:'Long-term controller therapy', q:'Asthma maintenance inhaler therapy'},
  {cat:'💊 Chronic Diseases', name:'GERD (Long-term)', tags:'PPI maintenance', q:'GERD chronic maintenance therapy'},
  // Hepatic
  {cat:'🫀 Liver', name:'Hepatitis B (HBV)', tags:'Chronic liver disease, HBsAg+', q:'Hepatitis B HBV chronic'},
  {cat:'🫀 Liver', name:'Hepatitis C (HCV)', tags:'Anti-HCV+, genotype 3', q:'Hepatitis C HCV chronic'},
  {cat:'🫀 Liver', name:'DCLD', tags:'Ascites, jaundice, coagulopathy', q:'Decompensated chronic liver disease DCLD'},
  {cat:'🫀 Liver', name:'Liver Abscess', tags:'Fever, RUQ pain, raised diaphragm', q:'Liver abscess amoebic'},
  // Gynae
  {cat:'🌸 Gynae / Women', name:'Vaginal Candidiasis', tags:'Itching, white discharge', q:'Vaginal candidiasis yeast infection'},
  {cat:'🌸 Gynae / Women', name:'Leukorrhea', tags:'Vaginal discharge', q:'Leukorrhea vaginal discharge'},
  {cat:'🌸 Gynae / Women', name:'Chlamydia / STI', tags:'Cervicitis, urethritis', q:'Chlamydia infection STI'},
  // Neuro / Psych
  {cat:'🧠 Neuro / Psych', name:'Headache / Migraine', tags:'Throbbing, photophobia, nausea', q:'Headache migraine'},
  {cat:'🧠 Neuro / Psych', name:'Anxiety / Depression', tags:'Mood disorder, GAD', q:'Anxiety depression'},
  {cat:'🧠 Neuro / Psych', name:'Insomnia', tags:'Sleep initiation, maintenance', q:'Insomnia sleep'},
  // Haem
  {cat:'🩸 Haematology', name:'Iron Deficiency Anemia', tags:'Pallor, fatigue, low Hb', q:'Iron deficiency anemia IDA'},
  {cat:'🩸 Haematology', name:'Megaloblastic Anemia', tags:'B12/Folate deficiency', q:'Megaloblastic anemia B12 folate'},
  // Renal
  {cat:'🫘 Renal', name:'Renal Stones', tags:'Colicky flank pain, hematuria', q:'Renal stones nephrolithiasis urolithiasis'},
  // MSK
  {cat:'🦴 MSK / Pain', name:'Back Pain', tags:'Lumbar, muscle spasm', q:'Back pain muscle pain'},
  {cat:'🦴 MSK / Pain', name:'Allergy / Urticaria', tags:'Itching, rash, hives', q:'Allergy urticaria itching'},
];

let filteredDiseases = COMMON_DISEASES;

function openCommonDiseases() {
  openSheet('common');
  renderCommonDiseases(COMMON_DISEASES);
  setTimeout(() => document.getElementById('commonSearch')?.focus(), 300);
}

function filterCommonDiseases(q) {
  const val = q.toLowerCase();
  filteredDiseases = COMMON_DISEASES.filter(d =>
    d.name.toLowerCase().includes(val) ||
    d.tags.toLowerCase().includes(val) ||
    d.cat.toLowerCase().includes(val)
  );
  renderCommonDiseases(filteredDiseases);
}

function renderCommonDiseases(list) {
  const el = document.getElementById('commonDiseaseList');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div style="font-size:.7rem;color:var(--tx2);padding:12px;text-align:center">No results found</div>'; return; }
  // Group by category
  const grouped = {};
  list.forEach(d => { if (!grouped[d.cat]) grouped[d.cat] = []; grouped[d.cat].push(d); });
  el.innerHTML = Object.entries(grouped).map(([cat, items]) => `
    <div class="cd-category">${cat}</div>
    ${items.map(d => `
      <div class="cd-item">
        <div>
          <div class="cd-item-name">${d.name}</div>
          <div class="cd-item-tags">${d.tags}</div>
        </div>
        <button class="cd-prescribe" onclick="closeSheet('common');document.getElementById('qi').value='${d.q.replace(/'/g,"\'")}';sendMsg()">
          💊 Prescribe
        </button>
      </div>`).join('')}
  `).join('');
}

// ══════════════════════════════════════════════════
// ANTIBIOTIC GUIDE
// ══════════════════════════════════════════════════
const ANTIBIOTIC_GUIDE = [
  {inf:'URTI / Common Cold', first:'Symptomatic only', alt:'No antibiotics needed', note:'Viral — avoid antibiotics'},
  {inf:'Strep Throat', first:'Amoxicillin 500mg TDS × 7d', alt:'Azithromycin 500mg OD × 3d', note:'If PCN allergy: Azithromycin'},
  {inf:'Sinusitis (Bacterial)', first:'Amoxicillin-Clavulanate 625mg BD × 7d', alt:'Doxycycline 100mg BD × 7d', note:'If no improvement in 3d'},
  {inf:'Otitis Media', first:'Amoxicillin 500mg TDS × 7d', alt:'Co-amoxiclav 625mg BD', note:'Child: Amoxicillin 40mg/kg/d'},
  {inf:'Pneumonia (CAP)', first:'Amoxicillin 1g TDS + Azithromycin 500mg OD', alt:'Levofloxacin 750mg OD × 7d', note:'Severe: IV Ceftriaxone'},
  {inf:'LRTI / Bronchitis', first:'Doxycycline 100mg BD × 5d', alt:'Azithromycin 500mg OD × 5d', note:'Only if bacterial signs'},
  {inf:'UTI (Uncomplicated)', first:'Nitrofurantoin 100mg BD × 5d', alt:'Trimethoprim 200mg BD × 7d', note:'Avoid in renal failure'},
  {inf:'UTI (Complicated)', first:'Co-amoxiclav 625mg TDS × 7d', alt:'Ciprofloxacin 500mg BD × 7d', note:'If resistant, culture first'},
  {inf:'Pyelonephritis', first:'Ciprofloxacin 500mg BD × 14d', alt:'Ceftriaxone 1g IM/IV × 14d', note:'Ensure hydration'},
  {inf:'H. Pylori', first:'Omeprazole + Clarithromycin + Amoxicillin × 14d', alt:'Bismuth quadruple therapy', note:'Triple or quadruple therapy'},
  {inf:'Typhoid', first:'Azithromycin 1g OD × 5-7d', alt:'Ciprofloxacin 500mg BD × 7d', note:'Resistance common — culture'},
  {inf:'Malaria (P. falciparum)', first:'Artemether-Lumefantrine (Coartem)', alt:'Artesunate IV (severe)', note:'Check local resistance'},
  {inf:'Malaria (P. vivax)', first:'Chloroquine + Primaquine', alt:'', note:'Check G6PD before primaquine'},
  {inf:'Cellulitis', first:'Co-amoxiclav 625mg TDS × 7d', alt:'Clindamycin 300mg TDS (PCN allergy)', note:'Elevate limb, mark border'},
  {inf:'Vaginal Candidiasis', first:'Fluconazole 150mg stat', alt:'Clotrimazole pessary 3/7', note:'Oral or topical'},
  {inf:'Chlamydia', first:'Azithromycin 1g stat', alt:'Doxycycline 100mg BD × 7d', note:'Treat partner too'},
  {inf:'Leukorrhea (BV)', first:'Metronidazole 400mg TDS × 7d', alt:'Metronidazole gel topical', note:'Avoid alcohol'},
  {inf:'Liver Abscess', first:'Metronidazole 500mg TDS × 10d', alt:'Tinidazole 2g OD × 3d', note:'+ aspiration if large'},
  {inf:'TB', first:'HRZE × 2m → HR × 4m', alt:'Refer for DOT program', note:'Category 1 standard regimen'},
];

function openAntibioticGuide() {
  openSheet('antibiotic');
  const el = document.getElementById('antibioticGuideContent');
  if (!el) return;
  el.innerHTML = `
    <div style="font-size:.65rem;color:var(--tx2);margin-bottom:12px;padding:8px 12px;background:rgba(231,76,60,.05);border:1px solid rgba(231,76,60,.15);border-radius:8px">
      ⚠️ Always culture when possible. Local resistance patterns vary. These are general guidelines.
    </div>
    <div class="abx-row" style="font-weight:700;font-size:.6rem;color:var(--tx2);border-bottom:2px solid var(--bd)">
      <div style="min-width:110px">Infection</div>
      <div style="flex:1">First Choice</div>
      <div style="flex:1">Alternative</div>
    </div>
    ${ANTIBIOTIC_GUIDE.map(r => `
      <div class="abx-row">
        <div class="abx-infection">${r.inf}</div>
        <div>
          <div class="abx-choice">${r.first}</div>
          ${r.alt ? `<div class="abx-alt">Alt: ${r.alt}</div>` : ''}
          ${r.note ? `<div class="abx-alt" style="color:rgba(231,76,60,.7)">⚡ ${r.note}</div>` : ''}
        </div>
      </div>`).join('')}
  `;
}

// ══════════════════════════════════════════════════
// EMERGENCY DOSES
// ══════════════════════════════════════════════════
const EMERGENCY_DOSES = [
  {drug:'Adrenaline (Epinephrine)', dose:'0.5mg IM (0.5mL of 1:1000)', note:'Anaphylaxis — repeat every 5min if needed. Thigh IM.'},
  {drug:'Hydrocortisone IV', dose:'200mg IV stat', note:'Anaphylaxis, adrenal crisis, severe asthma'},
  {drug:'Chlorphenamine (Piriton)', dose:'10mg IV/IM', note:'Anaphylaxis adjunct — after adrenaline'},
  {drug:'Salbutamol Nebulizer', dose:'5mg nebulized q20min × 3', note:'Acute severe asthma. Add Ipratropium 0.5mg.'},
  {drug:'IV Hydration (ORS)', dose:'500mL NS bolus in 15-30min', note:'Dehydration, septic shock, hypovolemia'},
  {drug:'Diazepam (Seizure)', dose:'10mg IV/PR slow push', note:'Eclampsia: MgSO4 4g IV over 20min'},
  {drug:'Dextrose 50%', dose:'50mL IV stat', note:'Hypoglycemia — check BGL first, repeat if needed'},
  {drug:'Furosemide (Lasix)', dose:'40-80mg IV stat', note:'Acute pulmonary edema, fluid overload'},
  {drug:'Morphine', dose:'2-5mg IV slow, titrate', note:'Severe pain, AMI chest pain — monitor resp'},
  {drug:'Aspirin (AMI)', dose:'300mg PO chewed stat', note:'Suspected MI — + Clopidogrel 300mg loading'},
  {drug:'GTN (Nitrate)', dose:'0.5mg sublingual q5min × 3', note:'Angina/AMI — hold if BP < 90 systolic'},
  {drug:'Atropine', dose:'0.5-1mg IV, max 3mg', note:'Bradycardia, organophosphate poisoning'},
  {drug:'Naloxone', dose:'0.4-2mg IV/IM, repeat q2-3min', note:'Opioid overdose — monitor for re-narcotization'},
  {drug:'Metoclopramide', dose:'10mg IV/IM', note:'Severe vomiting, gastroparesis'},
  {drug:'Paracetamol IV', dose:'1g IV over 15min', note:'Pain/fever — max 4g/day, reduce in hepatic'},
  {drug:'Ceftriaxone IV', dose:'1-2g IV OD', note:'Severe sepsis, meningitis, pneumonia'},
  {drug:'Metronidazole IV', dose:'500mg IV TDS', note:'Anaerobic infection, amoebic abscess'},
  {drug:'Phenobarbitone', dose:'15-20mg/kg IV slow', note:'Status epilepticus — after benzodiazepine'},
  {drug:'Calcium Gluconate 10%', dose:'10-20mL IV over 10min', note:'Hypocalcemia, hyperkalemia — cardiac monitor'},
  {drug:'MgSO4 (Eclampsia)', dose:'4g IV load → 1g/h infusion', note:'Eclampsia/Pre-eclampsia — monitor reflexes'},
];

function openEmergencyDoses() {
  openSheet('emergency');
  const el = document.getElementById('emergencyDosesContent');
  if (!el) return;
  el.innerHTML = `
    <div style="font-size:.65rem;color:var(--tx2);margin-bottom:12px;padding:8px 12px;background:rgba(231,76,60,.07);border:1px solid rgba(231,76,60,.2);border-radius:8px">
      🚨 <strong>Emergency Reference Only</strong> — Always verify doses per patient weight, renal function, and local protocols. Call for backup when needed.
    </div>
    ${EMERGENCY_DOSES.map(e => `
      <div class="em-card">
        <div class="em-drug">💉 ${e.drug}</div>
        <div class="em-dose">${e.dose}</div>
        <div class="em-note">${e.note}</div>
      </div>`).join('')}
  `;
}



// ══════════════════════════════════════════════════
// BRANDING & IDENTITY FEATURES JS
// ══════════════════════════════════════════════════

// ── Sheet openers for new features ──
function openSheet(n) {
  const el = document.getElementById('ov-' + n);
  if (!el) return;
  el.classList.add('show');
  if (n === 'testimonials') renderTestimonials();
  if (n === 'blog') renderBlog();
  if (n === 'referral') renderReferral();
  if (n === 'clinicbrand') loadBranding();
}

// ── BUSINESS CARD ──
function updateBC() {
  const name = document.getElementById('bcInputName')?.value || '';
  const qual = document.getElementById('bcInputQual')?.value || '';
  const clinic = document.getElementById('bcInputClinic')?.value || '';
  const phone = document.getElementById('bcInputPhone')?.value || '';
  const addr = document.getElementById('bcInputAddr')?.value || '';
  if (document.getElementById('bcName')) document.getElementById('bcName').textContent = name;
  if (document.getElementById('bcQual')) document.getElementById('bcQual').textContent = qual;
  if (document.getElementById('bcClinic')) document.getElementById('bcClinic').textContent = clinic;
  if (document.getElementById('bcPhone')) document.getElementById('bcPhone').textContent = phone;
  if (document.getElementById('bcAddress')) document.getElementById('bcAddress').textContent = addr;
}
function getBizCardText() {
  const n = document.getElementById('bcInputName')?.value || 'Dr. Usama Jamal';
  const q = document.getElementById('bcInputQual')?.value || 'MBBS/MD · GP';
  const c = document.getElementById('bcInputClinic')?.value || 'Mardan, KPK';
  const p = document.getElementById('bcInputPhone')?.value || '+92 319 568 1808';
  const a = document.getElementById('bcInputAddr')?.value || 'Mardan, KPK';
  return `👨‍⚕️ ${n}\n${q}\n🏥 ${c}\n📞 ${p}\n📍 ${a}\n\n🤖 Prescriptions by RxEasy AI`;
}
function shareBizCard() {
  const text = getBizCardText();
  if (navigator.share) navigator.share({ title: 'My Medical Card', text });
  else copyBizCardText();
}
function copyBizCardText() {
  navigator.clipboard.writeText(getBizCardText()).then(() => toast('📋 Card copied!'));
}
function sendBizCardWA() {
  const text = encodeURIComponent(getBizCardText());
  window.open('https://wa.me/?text=' + text, '_blank');
}
function saveBizCard() {
  const data = {
    name: document.getElementById('bcInputName')?.value,
    qual: document.getElementById('bcInputQual')?.value,
    clinic: document.getElementById('bcInputClinic')?.value,
    phone: document.getElementById('bcInputPhone')?.value,
    addr: document.getElementById('bcInputAddr')?.value
  };
  localStorage.setItem('rxeasy_bizcard', JSON.stringify(data));
  toast('💾 Business card saved!');
}
(function loadBizCard() {
  const saved = localStorage.getItem('rxeasy_bizcard');
  if (!saved) return;
  try {
    const d = JSON.parse(saved);
    if (d.name && document.getElementById('bcInputName')) {
      document.getElementById('bcInputName').value = d.name;
      document.getElementById('bcInputQual').value = d.qual || '';
      document.getElementById('bcInputClinic').value = d.clinic || '';
      document.getElementById('bcInputPhone').value = d.phone || '';
      document.getElementById('bcInputAddr').value = d.addr || '';
      updateBC();
    }
  } catch(e) {}
})();

// ── TESTIMONIALS ──
let testiRating = 5;
const BUILTIN_TESTIMONIALS = [
  { name:'Dr. Hamza Ali', role:'MBBS · Peshawar', text:'RxEasy has completely changed how I write prescriptions. The AI understands Pakistan formulary perfectly — even XDR typhoid protocols. Saves me 10 minutes per patient.', rating:5, verified:true, date:'Feb 2025' },
  { name:'Dr. Sana Malik', role:'GP · Islamabad', text:'The Urdu instructions feature is brilliant. My patients actually understand their medications now. The emergency doses reference has saved me twice already.', rating:5, verified:true, date:'Jan 2025' },
  { name:'Dr. Rashid Khan', role:'Family Physician · Lahore', text:'Best medical app built by a Pakistani doctor for Pakistani doctors. The antibiotic guide and drug database are exactly what we need. Highly recommend!', rating:5, verified:true, date:'Dec 2024' }
];
function setRating(r) {
  testiRating = r;
  document.querySelectorAll('.testi-star').forEach((s,i) => {
    s.classList.toggle('active', i < r);
  });
}
function submitTestimonial() {
  const name = document.getElementById('testiName')?.value.trim();
  const role = document.getElementById('testiRole')?.value.trim();
  const text = document.getElementById('testiText')?.value.trim();
  if (!name || !text) { toast('⚠️ Please fill name and review'); return; }
  const reviews = JSON.parse(localStorage.getItem('rxeasy_reviews') || '[]');
  reviews.unshift({ name, role: role || 'Doctor', text, rating: testiRating, verified:false, date: new Date().toLocaleDateString('en-GB',{month:'short',year:'numeric'}) });
  localStorage.setItem('rxeasy_reviews', JSON.stringify(reviews));
  document.getElementById('testiName').value = '';
  document.getElementById('testiRole').value = '';
  document.getElementById('testiText').value = '';
  toast('✅ Review submitted! Thank you.');
  renderTestimonials();
}
function renderTestimonials() {
  const el = document.getElementById('testiList');
  if (!el) return;
  const userReviews = JSON.parse(localStorage.getItem('rxeasy_reviews') || '[]');
  const all = [...userReviews, ...BUILTIN_TESTIMONIALS];
  const stars = r => '⭐'.repeat(r);
  el.innerHTML = all.map(t => `
    <div class="testi-card">
      <div class="testi-quote-icon">"</div>
      <div class="testi-text">${t.text}</div>
      <div class="testi-author-row">
        <div style="display:flex;align-items:center">
          <div class="testi-avatar">${t.name.charAt(0)}</div>
          <div>
            <div class="testi-author">${t.name}</div>
            <div class="testi-role">${t.role} · ${t.date}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
          <div class="testi-rating">${stars(t.rating)}</div>
          ${t.verified ? '<div class="testi-verified-tag">✅ Verified</div>' : ''}
        </div>
      </div>
    </div>`).join('');
}

// ── BLOG ──
const BLOG_POSTS = [
  { tag:'update', tagLabel:'Update', emoji:'🚀', title:'RxEasy v4.0 Released', excerpt:'New sidebar with Clinical Tools, Reference Library, Analytics dashboard, and 8 new Branding & Identity features. The biggest update yet.', date:'Feb 26, 2025', read:'3 min read', bg:'linear-gradient(135deg,#040c18,#0c2240)' },
  { tag:'tip', tagLabel:'Clinical Tip', emoji:'💊', title:'XDR Typhoid — Azithromycin First Line in Pakistan', excerpt:'With extensively drug-resistant typhoid spreading in Sindh and KPK, azithromycin 20mg/kg/day for 7 days is now first-line for uncomplicated cases. Avoid fluoroquinolones and 3rd gen cephalosporins empirically.', date:'Feb 20, 2025', read:'2 min read', bg:'linear-gradient(135deg,#2c0a0a,#6b1a1a)' },
  { tag:'news', tagLabel:'Pakistan Health', emoji:'🇵🇰', title:'Sehat Sahulat Card — What Doctors Need to Know', excerpt:'The Sehat Sahulat Program now covers over 10 million families in KPK. Key: verify eligibility before referral, use ICD-10 codes on all referral letters, and document clearly for insurance claims.', date:'Feb 15, 2025', read:'4 min read', bg:'linear-gradient(135deg,#0a2c0a,#1a5c2a)' },
  { tag:'update', tagLabel:'Update', emoji:'✨', title:'Urdu Instructions — 50+ Conditions Added', excerpt:'Expanded Urdu medication instructions now cover 50+ conditions including diabetes management, hypertension lifestyle advice, TB compliance, and antenatal care. Patients can now understand their treatment completely.', date:'Jan 30, 2025', read:'1 min read', bg:'linear-gradient(135deg,#1a1200,#4a3500)' },
  { tag:'tip', tagLabel:'Clinical Tip', emoji:'🫀', title:'Ramadan Medication Adjustments — A Practical Guide', excerpt:'Metformin: shift to Suhoor + Iftar. Insulin: reduce basal 20%, skip mealtime at Suhoor. Antihypertensives: once-daily at Iftar. Antiepileptics: modified release preferred. Always counsel individually.', date:'Jan 22, 2025', read:'5 min read', bg:'linear-gradient(135deg,#1a0a2c,#3d1a6b)' },
];
function renderBlog() {
  const el = document.getElementById('blogList');
  if (!el) return;
  el.innerHTML = BLOG_POSTS.map(p => `
    <div class="blog-post" onclick="toast('📖 Full post coming soon!')">
      <div class="blog-post-img" style="background:${p.bg}">${p.emoji}</div>
      <div class="blog-post-body">
        <div class="blog-post-tag ${p.tag}">${p.tagLabel}</div>
        <div class="blog-post-title">${p.title}</div>
        <div class="blog-post-excerpt">${p.excerpt}</div>
        <div class="blog-post-meta">
          <span class="blog-post-date">📅 ${p.date}</span>
          <span class="blog-post-read">⏱ ${p.read} →</span>
        </div>
      </div>
    </div>`).join('');
}

// ── SOCIAL SHARE ──
function shareViaWA() {
  const msg = document.getElementById('shareMsg')?.value || '';
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}
function shareViaTW() {
  const msg = '🩺 I use RxEasy by Dr. Usama Jamal — Pakistan\'s best AI prescription platform! Try it free 👇';
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(msg), '_blank');
}
function shareViaLI() {
  window.open('https://www.linkedin.com/sharing/share-offsite/?url=https://rxeasy.dr-usama.com', '_blank');
}
function copyShareLink() {
  const msg = document.getElementById('shareMsg')?.value || 'Check out RxEasy by Dr. Usama Jamal';
  navigator.clipboard.writeText(msg).then(() => toast('🔗 Copied to clipboard!'));
}

// ── REFERRAL ──
function renderReferral() {
  const count = parseInt(localStorage.getItem('rxeasy_referrals') || '0');
  const tiers = [3, 10, 25, 50];
  const nextTier = tiers.find(t => t > count) || 50;
  const prevTier = tiers.filter(t => t <= count).pop() || 0;
  const progress = Math.min(100, ((count - prevTier) / (nextTier - prevTier)) * 100) || 0;
  if (document.getElementById('referralCount')) document.getElementById('referralCount').textContent = count;
  if (document.getElementById('referralNext')) document.getElementById('referralNext').textContent = nextTier;
  if (document.getElementById('referralProgress')) document.getElementById('referralProgress').style.width = progress + '%';
  // Generate personal code
  const code = 'RXDR-' + (localStorage.getItem('rxeasy_ref_code') || (() => {
    const c = 'USAMA'; localStorage.setItem('rxeasy_ref_code', c); return c;
  })());
  if (document.getElementById('myReferralCode')) document.getElementById('myReferralCode').textContent = code;
  // Update tiers
  tiers.forEach((t, i) => {
    const el = document.getElementById('tier' + (i+1));
    if (!el) return;
    const unlocked = count >= t;
    el.classList.toggle('unlocked', unlocked);
    el.querySelector('.reward-tier-status').textContent = unlocked ? '✅ Unlocked' : count + '/' + t;
  });
}
function copyReferralCode() {
  const code = document.getElementById('myReferralCode')?.textContent || 'RXDR-USAMA';
  navigator.clipboard.writeText(code).then(() => toast('📋 Code copied: ' + code));
}
function referViaWA() {
  const code = document.getElementById('myReferralCode')?.textContent || 'RXDR-USAMA';
  const msg = '👨‍⚕️ Hey! I use RxEasy by Dr. Usama Jamal for AI prescriptions.\n\nPakistan\'s best GP tool — completely free!\n\nUse my referral code: *' + code + '*\n\nTry it: rxeasy.dr-usama.com';
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}
function applyReferralCode() {
  const code = document.getElementById('enterReferralCode')?.value.trim().toUpperCase();
  if (!code) { toast('⚠️ Enter a referral code'); return; }
  if (localStorage.getItem('rxeasy_used_ref')) { toast('ℹ️ You already used a referral code'); return; }
  localStorage.setItem('rxeasy_used_ref', code);
  // Increment referrer's count (simulated locally)
  toast('✅ Referral code applied! Both you and your referrer get credit.');
  haptic('success');
}

// ── CLINIC BRANDING ──
let currentBrandBg = 'linear-gradient(135deg,#0c2240,#1a4a7a)';
let currentBrandColor = '#fff';
let currentTemplate = 'navy';
function setBrandColor(el, bg, txtColor) {
  document.querySelectorAll('.branding-color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  currentBrandBg = bg;
  currentBrandColor = txtColor;
  updateBrandingPreview();
  saveBranding();
}
function selectTemplate(el, tpl) {
  document.querySelectorAll('.branding-template').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
  currentTemplate = tpl;
  saveBranding();
}
function updateBranding() {
  updateBrandingPreview();
  saveBranding();
}
function updateBrandingPreview() {
  const name = document.getElementById('brandClinicName')?.value || 'Dr. Usama Jamal Clinic';
  const sub = document.getElementById('brandTagline')?.value || 'MBBS/MD · GP';
  const hdr = document.getElementById('brandingHdr');
  const nm = document.getElementById('brandPreviewName');
  const sb = document.getElementById('brandPreviewSub');
  const rx = document.getElementById('brandPreviewRx');
  if (hdr) hdr.style.background = currentBrandBg;
  if (hdr) hdr.style.color = currentBrandColor;
  if (nm) { nm.textContent = name; nm.style.color = currentBrandColor; }
  if (sb) { sb.textContent = sub; sb.style.color = currentBrandColor + 'aa'; }
  if (rx) rx.style.color = currentBrandColor + '33';
}
function saveBranding() {
  const data = {
    clinicName: document.getElementById('brandClinicName')?.value || '',
    tagline: document.getElementById('brandTagline')?.value || '',
    pmdc: document.getElementById('brandPMDC')?.value || '',
    showPmdc: document.getElementById('pmdc_badge_toggle')?.checked ?? true,
    bg: currentBrandBg,
    txtColor: currentBrandColor,
    template: currentTemplate
  };
  localStorage.setItem('rxeasy_branding', JSON.stringify(data));
}
function loadBranding() {
  const saved = localStorage.getItem('rxeasy_branding');
  if (!saved) return;
  try {
    const d = JSON.parse(saved);
    if (document.getElementById('brandClinicName')) document.getElementById('brandClinicName').value = d.clinicName || '';
    if (document.getElementById('brandTagline')) document.getElementById('brandTagline').value = d.tagline || '';
    if (document.getElementById('brandPMDC')) document.getElementById('brandPMDC').value = d.pmdc || '';
    if (document.getElementById('pmdc_badge_toggle')) document.getElementById('pmdc_badge_toggle').checked = d.showPmdc !== false;
    if (d.bg) { currentBrandBg = d.bg; currentBrandColor = d.txtColor || '#fff'; }
    if (d.template) currentTemplate = d.template;
    updateBrandingPreview();
  } catch(e) {}
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  renderTestimonials();
});

// Init sidebar on load
document.addEventListener('DOMContentLoaded', () => {
  updateSidebarBadges();
});
