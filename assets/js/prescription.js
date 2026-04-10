// ═══════════════════════════════════════════════
// prescription.js — sendMsg, renderRx, waShare, cpyTxt
// Core prescription generation and rendering
// ═══════════════════════════════════════════════

async function sendMsg(){

  const qi=document.getElementById('qi');
  const q=qi.value.trim();
  if(!q)return;

  // ── SUBSCRIPTION CHECK ──
  // If profile not loaded yet, wait for it
  if (!_profile) {
    toast('⏳ Loading your account...');
    await loadProfile();
  }
  if (!canGenerateRx()) {
    showPaywall();
    return;
  }
  qi.value='';rsz(qi);
  document.getElementById('wc')&&(document.getElementById('wc').style.display='none');
  addHist(q);
  // Save query to autocomplete history (both local and Supabase user_search_history)
  // This is what feeds the "Recent searches" section in the autocomplete dropdown.
  if (typeof window.rxSaveSearchHistory === 'function') window.rxSaveSearchHistory(q);
  const chat=document.getElementById('chat');
  // User bubble
  const ub=document.createElement('div');ub.className='msg u';
  ub.innerHTML=`<div class="av">U</div><div class="bbl">${esc(q)}</div>`;
  chat.appendChild(ub);
  // Typing indicator
  const td=document.createElement('div');td.className='msg a';
  td.innerHTML='<div class="av">Rx</div><div class="typd"><span></span><span></span><span></span></div>';
  chat.appendChild(td);chat.scrollTop=chat.scrollHeight;

  const ptN=document.getElementById('ptN').value.trim();
  const ptA=document.getElementById('ptA').value;
  const ptW=document.getElementById('ptW').value;
  const alg=document.getElementById('alg').value;
  const ur=document.getElementById('urT').checked;
  const inv=document.getElementById('invT').checked;
  const alt=document.getElementById('altT').checked;
  const warn=document.getElementById('inT').checked;
  const rf=document.getElementById('rfT').checked;
  const qty=document.getElementById('qtyT').checked;

  const modeStr=flags.child?'CHILD MODE — MUST USE SYRUPS ONLY. NO TABLETS. Use only syrup/suspension formulations with pediatric dosing (ml/Tsp/drops by weight if available).':
    flags.preg?'PREGNANCY MODE — Use ONLY Category B safe drugs. Absolutely FORBIDDEN: Fluoroquinolones (Ciprofloxacin, Levofloxacin, Moxifloxacin), NSAIDs in 3rd trimester, Metronidazole in 1st trimester, Doxycycline/Tetracyclines, Co-trimoxazole near term. SAFE: Augmentin/Amclave, Cephalexin/Keflex, Azithromycin, Paracetamol, Cefixime.':
    flags.elderly?'ELDERLY MODE — Use lower doses. Avoid NSAIDs (use Paracetamol instead). Caution with benzodiazepines and anticholinergics.':
    flags.renal?'RENAL IMPAIRMENT MODE — Avoid NSAIDs, Metformin, Nephrotoxics. Dose-adjust renally cleared drugs (fluoroquinolones, aminoglycosides).':
    flags.hepatic?'HEPATIC IMPAIRMENT MODE — Reduce Paracetamol (max 2g/day). Avoid hepatotoxics. Caution with NSAIDs, high-dose Metformin.':'ADULT MODE';

  const prompt=`You are RxEasy, a clinical prescription assistant for Dr. Usama Jamal MBBS, General Practitioner in Pakistan. You generate evidence-based, clinically accurate prescriptions aligned with Pakistani GP practice and the Pakistan National Formulary.

PATIENT: ${ptN||'Not provided'} | Age: ${ptA||'Not provided'} | Weight: ${ptW||'Not provided'} kg
ALLERGIES/AVOID: ${alg||'None stated'}
CURRENT MODE: ${modeStr}

REFERENCE FORMULARY (Pakistan brands and standard treatments):
${FORMULARY}

════════════════════════════════════════
ABSOLUTE CLINICAL RULES — NEVER VIOLATE:
════════════════════════════════════════

RULE 1 — DIAGNOSIS-DRUG MATCHING (MOST IMPORTANT):
You MUST prescribe ONLY drugs that are clinically indicated for the diagnosed condition. 
- For EYE conditions (conjunctivitis, stye, etc): prescribe ONLY eye drops/eye ointments ± an oral antihistamine. NEVER prescribe cough syrups, antacids, or unrelated drugs.
- For SKIN conditions (eczema, rash, fungal): prescribe ONLY topical agents ± indicated oral drugs for that skin condition. NEVER add GI drugs unless GI symptoms exist.
- For ALLERGY/URTICARIA: prescribe antihistamines ± steroids. NEVER add antibiotics unless infection is confirmed.
- For DENGUE: prescribe ONLY Paracetamol + ORS. STRICTLY FORBIDDEN: Ibuprofen, Aspirin, Diclofenac, Mefenamic Acid (hemorrhage risk).
- For VIRAL infections (Chicken Pox, Dengue, viral URTI): NO antibiotics unless secondary bacterial infection is specifically mentioned.
- For MIGRAINE: use triptans/NSAIDs. Do NOT add antibiotics, antacids, or unrelated drugs.
- For HYPERTENSION: use antihypertensives only. Do NOT add antibiotics or cough syrup.
- For CONSTIPATION: use laxatives. NEVER add omeprazole or unrelated GI drugs as routine unless specifically needed.

RULE 2 — NO UNCONDITIONAL CONDITIONAL MEDICINES:
Do NOT routinely add "If nausea add Domperidone" or "If constipated add Lactulose" for every prescription. Only add these if the condition genuinely causes these symptoms (e.g. typhoid, malaria, chemotherapy). Eye conditions, skin conditions, allergy, migraine, fractures, sprains — do NOT add these routinely.

RULE 3 — MINIMUM EFFECTIVE DRUGS:
Prescribe the minimum number of drugs needed. A typical GP prescription has 2-4 drugs. Do NOT pad the prescription with vitamins, tonics, or supplements unless clinically indicated for that specific disease.

RULE 4 — FORMULATION MODE:
${flags.child?'CHILD MODE ACTIVE: ONLY syrups/suspensions. Format: Syp [Name] (Brand) dose ml/Tsp frequency duration':''}
${flags.preg?'PREGNANCY MODE: Category B only. FORBIDDEN: Fluoroquinolones, NSAIDs in 3rd tri, Doxycycline, Metronidazole in 1st tri':''}
${flags.elderly?'ELDERLY MODE: Lower doses, avoid NSAIDs (use Paracetamol), caution with benzodiazepines':''}
${flags.renal?'RENAL MODE: Avoid NSAIDs, Metformin, nephrotoxics. Dose-adjust renally cleared drugs':''}
${flags.hepatic?'HEPATIC MODE: Paracetamol max 2g/day, avoid hepatotoxics, caution with NSAIDs':''}

RULE 5 — BRAND NAMES: Always include exact Pakistani brand names in parentheses. Use brands from the formulary above.

RULE 6 — DOSING FORMAT: Use Pakistani format: 1+0+1, 1+1+1, 0+0+1, BD, TDS, OD, QID, PRN, HS.

RULE 7 — ALLERGY CHECK: If patient has documented allergy to ${alg||'nothing stated'}, DO NOT prescribe that drug class.

${qty?'RULE 8 — QUANTITY: After each drug write total quantity. Example: BD × 7 days = 14 tablets':''}

════════════════════
RESPOND IN THIS FORMAT — BE CONCISE:
════════════════════

DIAGNOSIS: [Specific condition name]

PRESCRIPTION:
[Numbered drugs max 4. One drug per block — EXACTLY this 2-line format:\n1. GenericName (Brand1/Brand2)\n   FormType Dose  Frequency  Duration × Qty  FoodInstruction  [reason ≤5 words]\nAll on ONE continuation line. No pipes. No extra lines.\nExample:\n1. Co-amoxiclav (Augmentin/Amclave)\n   Tab 625mg  BD  7 days × 14 tablets  After meal  [bacterial URTI]\nCRITICAL: Never repeat brand on line 2. Keep format consistent.]

${inv?'INVESTIGATIONS:\n[Relevant tests only — max 3]':''}

${alt?'ALTERNATIVE RX:\n[2nd line options only — one line each]':''}

${rf?'RED FLAGS:\n[Emergency signs — max 3 bullet points]':''}

${ur?'URDU INSTRUCTIONS:\n[Urdu patient instructions for medicine timings only — NO English repeat]':''}

Query: ${q}`;

  // ── Check cache first (saves tokens for repeated queries) ──
  const cacheKey = hashStr(prompt+modeStr+ptN+ptA+ptW);
  if(rxCache[cacheKey]){
    td.remove();
    renderRx(rxCache[cacheKey],q,chat);
    toast('⚡ Loaded from cache');
    return;
  }

  // ── DB-FIRST: Try Supabase, then fall back to AI ──
  try {
    let finalTxt = null;

    // Step 1: Try database lookup first (accurate, no hallucination)
    if (supabaseConfigured()) {
      try {
        const population = getPopulation();
        const dbResult = await buildPrescriptionFromDB(q, population);
        if (dbResult) {
          // Use DB output directly — no AI, no hallucination, same result every time
          var txt = dbResult.structuredRx;

          // Add patient info header if provided
          if (ptN || ptA || ptW) {
            var header = '\u{1F464} PATIENT: ' + (ptN||'—') +
              (ptA ? ' | Age: ' + ptA : '') +
              (ptW ? ' | Wt: ' + ptW + 'kg' : '') + '\n' +
              (modeStr ? '\u{1F3F7}\uFE0F MODE: ' + modeStr + '\n' : '') +
              '─────────────────────\n';
            txt = header + txt;
          }

          // Urdu footer if enabled
          if (ur) {
            txt += '\n\nمریض کے لیے ہدایات:\nدوائیں ڈاکٹر کی ہدایت کے مطابق وقت پر لیں۔ کوئی دوائی خود سے بند نہ کریں۔ اگر کوئی تکلیف ہو تو فوری ڈاکٹر سے رابطہ کریں۔';
          }

          finalTxt = txt;
          toast('✅ Database prescription');
        }
      } catch(dbErr) {
        console.warn('DB lookup failed, falling back to AI:', dbErr.message);
      }
    }

    // Step 2: If DB didn't find it, use AI with strict prompt (fallback)
    if (!finalTxt) {
      finalTxt = await callAI(prompt, 1800);
      await incrementQuery();
      // AI-BANNER FIX: Banner permanently removed. Known diseases now always
      // resolve via DB (trigram RPC added as final fallback in searchDisease).
      // For truly unknown diseases, AI silently generates — no disruptive warning.
    }

    rxCache[cacheKey] = finalTxt;
    td.remove();
    renderRx(finalTxt, q, chat);
    chat.scrollTop = chat.scrollHeight;

  } catch(err) {
    td.remove();
    const eb = document.createElement('div'); eb.className = 'msg a';
    eb.innerHTML = `<div class="av">!</div><div class="bbl" style="color:var(--rd)">${esc(err.message)}</div>`;
    chat.appendChild(eb);
    chat.scrollTop = chat.scrollHeight;
  }
}

// ═══ RENDER PRESCRIPTION CARD ═══
function renderRx(txt,q,chat){
  const ptN=document.getElementById('ptN').value.trim();
  const ptA=document.getElementById('ptA').value;
  const now=new Date();
  const dt=now.toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'});
  const badge=flags.child?'<div class="mbadge mb-ch">👶 Pediatric — Syrups Only</div>':
    flags.preg?'<div class="mbadge mb-pr">🤰 Pregnancy Safe — Category B</div>':
    flags.elderly?'<div class="mbadge mb-el">🧓 Elderly — Adjusted Doses</div>':
    flags.renal?'<div class="mbadge mb-rn">🫘 Renally Adjusted</div>':
    flags.hepatic?'<div class="mbadge mb-hp">🫀 Hepatic Safe</div>':'';

  // Parse sections from text
  const sections={};
  const sectionKeys=['PRESCRIPTION','CONDITIONAL MEDICINES','INVESTIGATIONS','ALTERNATIVE RX','DRUG INTERACTIONS','RED FLAGS','ADVICE','URDU INSTRUCTIONS'];
  let diag='';
  const diagMatch=txt.match(/DIAGNOSIS:\s*(.+)/i);
  if(diagMatch)diag=diagMatch[1].trim();

  let remaining=txt;
  sectionKeys.forEach(key=>{
    const re=new RegExp(key+'[^:]*:\\s*([\\s\\S]*?)(?=(?:'+sectionKeys.map(k=>k.replace(/[()]/g,'\\$&')).join('|')+'):|$)','i');
    const m=remaining.match(re);
    if(m)sections[key]=m[1].trim();
  });

  // Render prescription lines — rich multi-line drug cards
  /* ─────────────────────────────────────────────
     renderLines — clean prescription renderer
     Drug format: number | name | brand | dose
     Works with any AI output format (piped or free-text)
  ───────────────────────────────────────────── */
  function renderLines(text, isRx=false){
    if(!text)return'';

    if(!isRx){
      // For non-drug sections: render each line as a clean item
      return text.split('\n').map(l=>{
        l=l.trim();if(!l)return'';
        // Strip leading bullet chars for clean display
        l=l.replace(/^[\*\-•·]\s*/,'').replace(/^\d+\.\s*/,'');
        return `<div class="bxi">${esc(l)}</div>`;
      }).filter(Boolean).join('');
    }

    /* ── Drug section parser ──
       Handles both formats:
       A) "1. Generic (Brand)\n   dose | freq | dur"  (pipe format)
       B) "1. Generic (Brand) dose freq dur × qty"     (inline format)
    */
    const lines = text.split('\n');
    let html = '';
    let i = 0;

    while(i < lines.length){
      const line = lines[i].trim();
      if(!line){ i++; continue; }

      if(/^\d+\./.test(line)){
        const num  = line.match(/^(\d+)\./)[1];
        const rest = line.replace(/^\d+\.\s*/, '').trim();

        /* Extract brand from parentheses — last () group */
        let rawName = rest, brand = '', inlineDose = '';
        const bm = rest.match(/^(.*?)\s*\(([^)]+)\)\s*(.*)$/);
        if(bm){ rawName = bm[1].trim(); brand = bm[2].trim(); inlineDose = bm[3].trim(); }

        /* Strip vehicle prefix (Tab/Cap/Syp…) from name for clean display
           Keep it as a suffix label                                       */
        const vehicleRe = /^(Tab(?:lets?)?|Cap(?:sules?)?|Syp\.?|Syrup|Inj\.?|Susp\.?|Cream|Drops?|Oint(?:ment)?|Spray|Inhaler|Sachet)\s*/i;
        let vehiclePrefix = '';
        const vpm = rawName.match(vehicleRe);
        if(vpm){ vehiclePrefix = vpm[1]; rawName = rawName.replace(vehicleRe,'').trim(); }

        const name = rawName;

        /* Collect continuation lines until next numbered drug */
        const detLines = [];
        i++;
        while(i < lines.length){
          const nt = lines[i].trim();
          if(!nt){ i++; continue; }
          if(/^\d+\./.test(nt)) break;
          detLines.push(nt);
          i++;
        }

        /* Build the dose display string */
        let doseDisplay = '';
        // Prefer first continuation line over inline dose (more complete)
        let doseRaw = (detLines.length > 0 && detLines[0].length > inlineDose.length)
          ? detLines[0] : inlineDose;
        // Strip any ADMIN: prefix if present
        doseRaw = doseRaw.replace(/^ADMIN:\s*/i,'').trim();
        // Strip [purpose bracket] — show it separately
        let purposeNote = '';
        const pm = doseRaw.match(/\[([^\]]+)\]/);
        if(pm){ purposeNote = pm[1]; doseRaw = doseRaw.replace(/\[[^\]]*\]/,'').trim(); }
        // Pipe-separated → join with spaces as clean single line
        if(doseRaw.includes('|')){
          const parts = doseRaw.split('|').map(p=>p.trim()).filter(Boolean);
          doseDisplay = parts.join('  ·  ');
        } else {
          doseDisplay = doseRaw;
        }
        // Check remaining detail lines for ADMIN
        let adminNote = '';
        detLines.slice(1).forEach(dl=>{
          if(/^ADMIN:/i.test(dl)) adminNote = dl.replace(/^ADMIN:\s*/i,'').trim();
          else if(/^PURPOSE:/i.test(dl) && !purposeNote) purposeNote = dl.replace(/^PURPOSE:\s*/i,'').trim();
        });
        // If doseDisplay still empty but vehiclePrefix+brand exist, build minimal
        if(!doseDisplay && vehiclePrefix) doseDisplay = vehiclePrefix;

        html += `<div class="rxmed">
  <div class="rxnum">${num}.</div>
  <div class="rxmed-body">
    <div class="rxmn">${esc(name)}${vehiclePrefix?`<span class="rxvehicle">${esc(vehiclePrefix)}</span>`:''}</div>
    ${brand ? `<div class="rxmb">${esc(brand)}</div>` : ''}
    ${doseDisplay ? `<div class="rxdose">${esc(doseDisplay)}${adminNote?`<span class="rxdose-admin"> · ${esc(adminNote)}</span>`:''}</div>` : ''}
    ${purposeNote ? `<div class="rxpurpose">${esc(purposeNote)}</div>` : ''}
  </div>
</div>`;
      } else {
        html += `<div class="bxi">${esc(line.replace(/^[\*\-•·]\s*/,''))}</div>`;
        i++;
      }
    }
    return html;
  }

  const rxLines   = renderLines(sections['PRESCRIPTION']||'', true);
  const condLines = sections['CONDITIONAL MEDICINES']
    ? `<div class="rxbx bx-adv">
        <div class="bxt">➕ If Specifically Indicated</div>
        ${renderLines(sections['CONDITIONAL MEDICINES'])}
       </div>` : '';
  const invLines  = sections['INVESTIGATIONS']
    ? `<div class="rxbx bx-inv">
        <div class="bxt">✏ Investigations</div>
        <div class="bx-inv-list">${renderLines(sections['INVESTIGATIONS'])}</div>
       </div>` : '';
  const altLines  = sections['ALTERNATIVE RX']
    ? `<div class="rxbx bx-alt" onclick="var b=this.querySelector('.alt-body');var a=this.querySelector('.alt-arr');b.style.display=b.style.display==='block'?'none':'block';a.style.transform=b.style.display==='block'?'rotate(180deg)':'';" style="cursor:pointer">
        <div class="bxt bxt-row">
          <span>🔀 Alternative Rx</span>
          <span class="alt-arr" style="font-size:.55rem;color:rgba(200,160,50,.55);transition:transform .2s">▾</span>
        </div>
        <div class="alt-body" style="display:none;margin-top:6px">${renderLines(sections['ALTERNATIVE RX'])}</div>
       </div>` : '';
  const warnLines = sections['DRUG INTERACTIONS']
    ? `<div class="rxbx bx-wrn">
        <div class="bxt">⚠️ Drug Interactions</div>
        ${renderLines(sections['DRUG INTERACTIONS'])}
       </div>` : '';
  const rfLines   = sections['RED FLAGS']
    ? `<div class="rxbx bx-flg">
        <div class="bxt">🚨 Red Flags — Refer Immediately</div>
        ${renderLines(sections['RED FLAGS'])}
       </div>` : '';
  const urduLines = sections['URDU INSTRUCTIONS']
    ? `<div class="bx-urdu">
        <div class="urdu-t">مریض کی ہدایات</div>
        <div class="urdu-x">${esc(sections['URDU INSTRUCTIONS'])}</div>
       </div>` : '';
  const advLines = '';

  const card = document.createElement('div');
  card.className = 'msg a';
  card.innerHTML = `
<div class="av">Rx</div>
<div style="max-width:90%;width:100%">
<div class="rxcard" id="rxc_${Date.now()}">

  <!-- ══ LETTERHEAD ══ -->
  <div class="rxlh">
    <div class="rxlh-top">
      <div class="rxlh-brand">
        <div class="rxlh-logo-badge">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(20,184,138,.95)"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(20,184,138,.55)" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <div class="rxlh-logo-text">Rx<span>Easy</span></div>
          <div class="rxlh-logo-sub">AI&nbsp;Prescription</div>
        </div>
      </div>
    </div>
    <div class="rxlh-divider"></div>
    <div class="rxlh-meta">
      <div class="rxlh-pt">
        <span class="rxlh-pt-icon">👤</span>
        ${ptN ? esc(ptN) : 'Patient'}${ptA ? ' &nbsp;·&nbsp; Age ' + ptA : ''}${ptW ? ' &nbsp;·&nbsp; ' + ptW + ' kg' : ''}
      </div>
      <div class="rxlh-dt">${dt}</div>
    </div>
  </div>

  <!-- ══ BODY ══ -->
  <div class="rxbody">
    ${badge}

    <!-- Diagnosis -->
    <div class="rxdiag">
      <span class="rxdiag-badge">Dx</span>
      <span class="rxdiag-text">${diag ? esc(diag) : esc(q)}</span>
    </div>
    <div class="rxdiag-sep"></div>

    <!-- ℞ Symbol -->
    <div class="rx-symbol">&#8478;</div>

    <!-- Medications -->
    <div class="rxmeds">${rxLines}</div>

    <!-- Sections -->
    ${condLines}${invLines}${altLines}${warnLines}${rfLines}${urduLines}${advLines}
  </div>

  <!-- ══ ACTION BAR ══ -->
  <div class="rxacts">
    <button class="rxbtn bwa" onclick="waShare('${encodeURIComponent(txt)}')">
      <div class="bii">📲</div><div class="bll">WhatsApp</div>
    </button>
    <button class="rxbtn bcp" onclick="cpyTxt('${encodeURIComponent(txt)}')">
      <div class="bii">📋</div><div class="bll">Copy Rx</div>
    </button>
    <button class="rxbtn bsv" onclick="saveFav('${encodeURIComponent(q)}')">
      <div class="bii">⭐</div><div class="bll">Save</div>
    </button>
  </div>

</div>
</div>
  `;
  chat.appendChild(card);
  chat.scrollTop=chat.scrollHeight;
  // track count silently
  const rxCount=(parseInt(localStorage.getItem('rxCount')||'0'))+1;
  localStorage.setItem('rxCount',rxCount);
  checkAchievements(rxCount);
  logSession('📋 Prescription generated: '+(diag||q).substring(0,40));
  updateBnavBadges();
}

function waShare(encoded){
  const txt=decodeURIComponent(encoded);
  const wa='whatsapp://send?text='+encodeURIComponent('*RxEasy Prescription*\n*Dr. Usama Jamal MBBS/MD, GP*\n\n'+txt+'\n\n_RxEasy App — rxeasy.dr_');
  window.location.href=wa;
  setTimeout(()=>window.open('https://wa.me/?text='+encodeURIComponent('*Dr. Usama Jamal MBBS/MD*\n*GP Prescription*\n\n'+txt),5000));
}
function cpyTxt(encoded){
  navigator.clipboard?.writeText(decodeURIComponent(encoded)).then(()=>toast('📋 Copied!')).catch(()=>toast('Copy failed'));
}
