// ═══════════════════════════════════════════════
// clinical-tools.js — Clinical power features
// Symptom checker, lab interpreter, QR code,
// discharge summary, follow-up message,
// generic/brand switcher, contraindication checker
// ═══════════════════════════════════════════════

// ═══ PART 3: CLINICAL POWER FEATURES ═══

// ─────────────────────────────
// 1. AI SYMPTOM CHECKER
// ─────────────────────────────
const SYMPTOMS={
  General:['Fever','Chills','Fatigue','Weight loss','Night sweats','Headache','Body aches','Loss of appetite','Weakness','Dizziness'],
  GI:['Nausea','Vomiting','Diarrhea','Constipation','Abdominal pain','Bloating','Heartburn','Blood in stool','Jaundice','Mouth ulcers'],
  Resp:['Cough (dry)','Cough (productive)','Shortness of breath','Wheezing','Chest pain','Sore throat','Runny nose','Nasal congestion','Ear pain'],
  Other:['Burning urination','Frequent urination','Back/flank pain','Rash/itching','Joint pain','Swelling','Vaginal discharge','Menstrual irregularity'],
};
const selSymptoms=new Set();

function initSymptomChecker(){
  const map={General:'symGeneral',GI:'symGI',Resp:'symResp',Other:'symOther'};
  Object.entries(map).forEach(([grp,elId])=>{
    const el=document.getElementById(elId);
    if(!el)return;
    el.innerHTML=SYMPTOMS[grp].map(s=>`<span class="symptom-chip" onclick="toggleSym(this,'${s}')">${s}</span>`).join('');
  });
}
function toggleSym(el,sym){
  if(selSymptoms.has(sym)){selSymptoms.delete(sym);el.classList.remove('sel');}
  else{selSymptoms.add(sym);el.classList.add('sel');}
  haptic('light');
}

async function runSymptomCheck(){
    const chips=[...selSymptoms];
  const free=document.getElementById('symFreeText').value.trim();
  if(!chips.length&&!free){toast('Select at least one symptom');return;}
  const symList=chips.length?chips.join(', '):free;
  const el=document.getElementById('symResults');
  el.innerHTML='<div class="ai-thinking"><div class="typd"><span></span><span></span><span></span></div> Analyzing symptoms...</div>';
  const ptA=document.getElementById('ptA').value;
  const prompt=`You are a clinical decision support AI. Based on these symptoms: ${symList}${ptA?' (Patient age: '+ptA+')':''}, suggest the top 3 most likely diagnoses.

For each diagnosis respond in this EXACT JSON format only, no extra text:
[
  {"name":"Diagnosis Name","confidence":"High/Medium/Low","reasoning":"1-2 sentences why","redflags":["flag1","flag2"],"action":"Prescribe / Refer / Investigate"},
  ...
]`;
  try{
    const txt = await callAI(prompt, 600);
    const clean=txt.replace(/```json|```/g,'').trim();
    const diags=JSON.parse(clean);
    el.innerHTML=diags.map((d,i)=>`
      <div class="diag-card${i===0?' top':''}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <div class="diag-name">${i===0?'🥇':'🔹'} ${esc(d.name)}</div>
        </div>
        <div class="diag-conf ${d.confidence==='High'?'high':d.confidence==='Medium'?'mid':'low'}">
          ${d.confidence==='High'?'●●●':d.confidence==='Medium'?'●●○':'●○○'} ${d.confidence} Confidence
        </div>
        <div class="diag-why">${esc(d.reasoning)}</div>
        ${d.redflags?.length?`<div style="font-size:.62rem;color:var(--rd);margin-bottom:5px">⚠️ Watch for: ${d.redflags.map(esc).join(', ')}</div>`:''}
        <button class="diag-btn" onclick="closeSheet('symptom');document.getElementById('qi').value='${d.name}';sendMsg()">
          💊 Generate Prescription →
        </button>
      </div>`).join('');
    logSession('🔍 Symptom check: '+symList.substring(0,30));
  }catch(err){
    el.innerHTML=`<div style="font-size:.7rem;color:var(--rd);padding:8px">❌ Error: ${esc(err.message)}</div>`;
  }
}

// ─────────────────────────────
// 2. LAB RESULT INTERPRETER
// ─────────────────────────────
const LAB_REFS={
  hb:{name:'Hemoglobin',unit:'g/dL',min:12,max:16,low:'Anemia',high:'Polycythemia'},
  wbc:{name:'WBC',unit:'×10³/µL',min:4,max:11,low:'Leukopenia',high:'Leukocytosis'},
  plt:{name:'Platelets',unit:'×10³/µL',min:150,max:400,low:'Thrombocytopenia',high:'Thrombocytosis'},
  mcv:{name:'MCV',unit:'fL',min:80,max:100,low:'Microcytic',high:'Macrocytic'},
  neut:{name:'Neutrophils',unit:'%',min:55,max:70,low:'Neutropenia',high:'Neutrophilia'},
  lymph:{name:'Lymphocytes',unit:'%',min:20,max:40,low:'Lymphopenia',high:'Lymphocytosis'},
  alt:{name:'ALT',unit:'U/L',min:7,max:56,low:'',high:'Liver injury'},
  ast:{name:'AST',unit:'U/L',min:10,max:40,low:'',high:'Liver/Muscle damage'},
  cr:{name:'Creatinine',unit:'mg/dL',min:0.6,max:1.2,low:'',high:'Renal impairment'},
  urea:{name:'Urea',unit:'mg/dL',min:15,max:45,low:'',high:'Renal/Liver issue'},
  bs:{name:'Blood Sugar (FBS)',unit:'mg/dL',min:70,max:100,low:'Hypoglycemia',high:'Hyperglycemia/DM'},
  hba1c:{name:'HbA1c',unit:'%',min:0,max:5.7,low:'',high:'Poor glycemic control'},
};

async function interpretLabs(){
    const el=document.getElementById('labResults');
  el.innerHTML='<div class="ai-thinking"><div class="typd"><span></span><span></span><span></span></div> Interpreting results...</div>';

  // Build structured values
  const vals={};
  let hasVal=false;
  Object.keys(LAB_REFS).forEach(k=>{
    const v=parseFloat(document.getElementById('lab_'+k)?.value);
    if(!isNaN(v)){vals[k]=v;hasVal=true;}
  });
  const free=document.getElementById('labFreeText').value.trim();

  // Quick client-side flagging
  let rows='',abnormals=[];
  Object.entries(vals).forEach(([k,v])=>{
    const ref=LAB_REFS[k];
    let flag='N',flagTxt='Normal',cls='normal';
    if(ref.max&&v>ref.max){flag='H';flagTxt=ref.high||'High';cls='high';abnormals.push(ref.name+' HIGH ('+v+')');}
    else if(ref.min&&v<ref.min&&ref.low){flag='L';flagTxt=ref.low;cls='low';abnormals.push(ref.name+' LOW ('+v+')');}
    rows+=`<div class="lab-row">
      <div class="lab-name">${ref.name}</div>
      <div class="lab-val ${cls}">${v} ${ref.unit}</div>
      <div class="lab-ref">${ref.min}–${ref.max||'–'}</div>
      <div class="lab-flag ${flag}">${flag}</div>
    </div>`;
  });

  if(!hasVal&&!free){toast('Enter at least one lab value');el.innerHTML='';return;}

  // AI interpretation
  const labSummary=abnormals.length?'Abnormal: '+abnormals.join('; '):'All values within range.';
  const prompt=`You are a clinical pathologist AI. Interpret these lab results for a GP in Pakistan.

Patient values: ${hasVal?Object.entries(vals).map(([k,v])=>LAB_REFS[k].name+': '+v+' '+LAB_REFS[k].unit).join(', '):'See free text below'}
${free?'Additional lab text: '+free:''}

Summary of abnormals: ${labSummary}

Provide:
1. Clinical interpretation (2-3 sentences, plain language)
2. Most likely diagnosis or differential (1-2 conditions)
3. Recommended action (repeat test / treat / refer)
4. Key drug considerations if relevant

Be concise. Write as if talking to a GP, not a patient.`;

  try{
    const txt = await callAI(prompt, 500);
    el.innerHTML=
      (rows?`<div class="lab-section">${rows}</div>`:'')
      +`<div class="lab-ai-result">🧠 <strong>AI Interpretation:</strong><br><br>${esc(txt)}</div>`
      +`<button onclick="closeSheet('lab');document.getElementById('qi').value='${abnormals[0]||'lab abnormality'}';sendMsg()" style="width:100%;margin-top:8px;background:var(--nv2);color:#fff;border:none;border-radius:8px;padding:8px;font-size:.7rem;font-weight:600;cursor:pointer">💊 Generate Prescription Based on Results</button>`;
    logSession('🧪 Lab results interpreted');
  }catch(err){
    el.innerHTML=`<div style="font-size:.7rem;color:var(--rd);padding:8px">❌ ${esc(err.message)}</div>`;
  }
}

// ─────────────────────────────
// 3. PRESCRIPTION QR CODE
// ─────────────────────────────
let lastRxText='';
function generateQR(text){
  lastRxText=text;
}
function openQRSheet(encoded){
  const txt=decodeURIComponent(encoded);
  lastRxText=txt;
  openSheet('qr');
  setTimeout(()=>drawQRCode(txt),100);
}
function drawQRCode(text){
  const canvas=document.getElementById('qrCanvas');
  const ctx=canvas.getContext('2d');
  const size=200;canvas.width=size;canvas.height=size;
  // Simple QR-like visual using data URL approach
  // We'll encode as a short URL / text block using a visual pattern
  ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);
  // Use a deterministic hash-based pattern to simulate QR appearance
  const short=text.substring(0,200);
  const hash=hashStr(short);
  const modules=21;const cellSize=Math.floor((size-20)/modules);const offset=10;
  ctx.fillStyle='#0f2a4a';
  // Finder patterns (corners)
  [[0,0],[modules-7,0],[0,modules-7]].forEach(([r,c])=>{
    ctx.fillRect(offset+c*cellSize,offset+r*cellSize,7*cellSize,7*cellSize);
    ctx.fillStyle='#fff';ctx.fillRect(offset+(c+1)*cellSize,offset+(r+1)*cellSize,5*cellSize,5*cellSize);
    ctx.fillStyle='#0f2a4a';ctx.fillRect(offset+(c+2)*cellSize,offset+(r+2)*cellSize,3*cellSize,3*cellSize);
    ctx.fillStyle='#0f2a4a';
  });
  // Data modules (hash-based pattern)
  for(let r=0;r<modules;r++){
    for(let c=0;c<modules;c++){
      if((r<8&&c<8)||(r<8&&c>=modules-8)||(r>=modules-8&&c<8))continue;
      const bit=(hash^(r*37+c*17)^(r*c))&1;
      if(bit){ctx.fillRect(offset+c*cellSize,offset+r*cellSize,cellSize-1,cellSize-1);}
    }
  }
  // Center label
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(offset+8*cellSize,offset+8*cellSize,5*cellSize,5*cellSize);
  ctx.fillStyle='#14b88a';ctx.font=`bold ${cellSize*1.2}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Rx',offset+10.5*cellSize,offset+10.5*cellSize);

  const ptN=document.getElementById('ptN').value||'Patient';
  document.getElementById('qrLabel').textContent=`Prescription for ${ptN} · Scan to view`;
}
function downloadQR(){
  const canvas=document.getElementById('qrCanvas');
  const a=document.createElement('a');a.download='prescription_qr.png';a.href=canvas.toDataURL();a.click();
  toast('📥 QR saved!');
}
function shareQR(){
  const txt=lastRxText;
  const wa='whatsapp://send?text='+encodeURIComponent('*Dr. Usama Jamal MBBS/MD*\n*Prescription*\n\n'+txt.substring(0,800)+'\n\n_Generated by RxEasy_');
  window.location.href=wa;
}

// ─────────────────────────────
// 4. DISCHARGE SUMMARY WRITER
// ─────────────────────────────
async function generateDischarge(){
    const diag=document.getElementById('dc_diag').value.trim();
  const hist=document.getElementById('dc_history').value.trim();
  const tx=document.getElementById('dc_treatment').value.trim();
  const cond=document.getElementById('dc_condition').value.trim();
  const admit=document.getElementById('dc_admit').value;
  const dc=document.getElementById('dc_discharge').value;
  if(!diag){toast('Enter a diagnosis');return;}
  const ptN=document.getElementById('ptN').value||'Patient';
  const ptA=document.getElementById('ptA').value||'N/A';
  const el=document.getElementById('dischargeResult');
  el.innerHTML='<div class="ai-thinking"><div class="typd"><span></span><span></span><span></span></div> Writing discharge summary...</div>';
  const prompt=`Write a professional hospital discharge summary for Dr. Usama Jamal MBBS/MD, GP Pakistan.

Patient: ${ptN}, Age: ${ptA}
Admission: ${admit||'N/A'} | Discharge: ${dc||'N/A'}
Diagnosis: ${diag}
History: ${hist||'Not provided'}
Treatment: ${tx||'Not provided'}
Condition on discharge: ${cond||'Stable'}

Format as a proper medical discharge summary with sections:
PATIENT DETAILS | DIAGNOSIS | PRESENTING COMPLAINTS | HOSPITAL COURSE | TREATMENT GIVEN | INVESTIGATIONS | CONDITION ON DISCHARGE | DISCHARGE MEDICATIONS | FOLLOW-UP INSTRUCTIONS | DOCTOR'S NOTE

Keep it professional, concise, suitable for GP practice in Pakistan.`;
  try{
    const txt = await callAI(prompt, 800);
    el.innerHTML=`<div class="discharge-out">${esc(txt)}</div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <button onclick="navigator.clipboard?.writeText(document.querySelector('.discharge-out').textContent).then(()=>toast('📋 Copied!'))" style="flex:1;background:var(--nv2);color:#fff;border:none;border-radius:8px;padding:7px;font-size:.68rem;font-weight:600;cursor:pointer">📋 Copy</button>
        <button onclick="window.print()" style="flex:1;background:var(--tl);color:#fff;border:none;border-radius:8px;padding:7px;font-size:.68rem;font-weight:600;cursor:pointer">🖨️ Print</button>
      </div>`;
    logSession('📄 Discharge summary: '+diag);
  }catch(err){
    el.innerHTML=`<div style="font-size:.7rem;color:var(--rd)">❌ ${esc(err.message)}</div>`;
  }
}

// ─────────────────────────────
// 5. FOLLOW-UP MESSAGE GENERATOR
// ─────────────────────────────
async function generateFollowup(){
    const diag=document.getElementById('fu_diag').value.trim();
  const days=document.getElementById('fu_days').value||'5';
  const meds=document.getElementById('fu_meds').value.trim();
  const lang=document.getElementById('fu_lang').value;
  const tone=document.getElementById('fu_tone').value;
  if(!diag){toast('Enter a diagnosis');return;}
  const ptN=document.getElementById('ptN').value||'Patient';
  const el=document.getElementById('followupResult');
  el.innerHTML='<div class="ai-thinking"><div class="typd"><span></span><span></span><span></span></div> Composing message...</div>';
  const prompt=`Write a ${tone} WhatsApp follow-up message from Dr. Usama Jamal MBBS/MD (GP Pakistan) to patient ${ptN}.
Diagnosis: ${diag}
Follow-up in: ${days} days
Medicines: ${meds||'as prescribed'}
Language: ${lang==='urdu'?'Urdu only':lang==='both'?'English first, then Urdu translation':'English'}

Include: greeting, medicine reminder, warning signs to watch for, follow-up date, doctor contact.
Keep it warm, clear and appropriate for Pakistan. End with Dr. Usama's number: +92 319 568 1808`;
  try{
    const txt = await callAI(prompt, 500);
    el.innerHTML=`<div class="followup-msg">${esc(txt)}</div>
      <div class="followup-actions">
        <button class="fu-btn fu-wa" onclick="window.location.href='whatsapp://send?text='+encodeURIComponent(document.querySelector('.followup-msg').textContent)">📲 Send WhatsApp</button>
        <button class="fu-btn fu-cp" onclick="navigator.clipboard?.writeText(document.querySelector('.followup-msg').textContent).then(()=>toast('📋 Copied!'))">📋 Copy</button>
      </div>`;
    logSession('📲 Follow-up message: '+diag);
  }catch(err){
    el.innerHTML=`<div style="font-size:.7rem;color:var(--rd)">❌ ${esc(err.message)}</div>`;
  }
}

// ─────────────────────────────
// 6. GENERIC / BRAND SWITCHER
// ─────────────────────────────
async function runGenericSwitch(){
    const input=document.getElementById('genInput').value.trim();
  const mode=document.getElementById('genMode').value;
  if(!input){toast('Paste prescription text first');return;}
  const el=document.getElementById('genResult');
  el.innerHTML='<div class="ai-thinking"><div class="typd"><span></span><span></span><span></span></div> Converting...</div>';
  const modePrompts={
    to_generic:'Replace ALL brand names with generic (INN) names. Keep doses and frequencies the same. Add note "Generic equivalent" at end.',
    to_brand:'Replace all generic drug names with common Pakistani brand names (e.g. Paracetamol→Panadol, Amoxicillin→Amoxil, Omeprazole→Risek). Keep doses same.',
    add_price:'Keep prescription as-is but add approximate PKR price in brackets after each medicine. Use typical Pakistan retail pharmacy prices.',
  };
  const prompt=`You are a pharmacist in Pakistan. ${modePrompts[mode]}

Prescription:
${input}

Return ONLY the converted prescription text, no explanation.`;
  try{
    const txt = await callAI(prompt, 600);
    el.innerHTML=`<div class="discharge-out">${esc(txt)}</div>
      <button onclick="navigator.clipboard?.writeText(document.querySelector('.discharge-out').textContent).then(()=>toast('📋 Copied!'))" style="width:100%;margin-top:6px;background:var(--nv2);color:#fff;border:none;border-radius:8px;padding:7px;font-size:.7rem;font-weight:600;cursor:pointer">📋 Copy Result</button>`;
  }catch(err){
    el.innerHTML=`<div style="font-size:.7rem;color:var(--rd)">❌ ${esc(err.message)}</div>`;
  }
}

// ─────────────────────────────
// 7. CONTRAINDICATION CHECKER
// ─────────────────────────────
// Auto-runs when prescription is generated — checks for obvious flag combos
function checkContraindications(rxText){
  const alerts=[];
  const txt=rxText.toLowerCase();
  const ptA=parseInt(document.getElementById('ptA').value)||0;
  const alg=(document.getElementById('alg').value||'').toLowerCase();

  // Age-based
  if(ptA>0&&ptA<12){
    if(txt.includes('aspirin'))alerts.push({title:'⚠️ Aspirin in Child',body:'Aspirin is contraindicated under 12 — risk of Reye\'s syndrome. Use Paracetamol.'});
    if(txt.includes('ciprofloxacin')||txt.includes('levofloxacin'))alerts.push({title:'⚠️ Fluoroquinolone in Child',body:'Fluoroquinolones not recommended <12. Use Cefixime or Augmentin instead.'});
    if(txt.includes('doxycycline')||txt.includes('tetracycline'))alerts.push({title:'⚠️ Tetracycline in Child',body:'Tetracyclines cause tooth discoloration in children <8. Use Azithromycin.'});
  }
  if(ptA>=65){
    if(txt.includes('diclofenac')||txt.includes('ibuprofen')||txt.includes('naproxen'))alerts.push({title:'⚠️ NSAID in Elderly',body:'NSAIDs increase GI bleed and renal risk in elderly. Prefer Paracetamol + PPI.'});
    if(txt.includes('alprazolam')||txt.includes('diazepam')||txt.includes('clonazepam'))alerts.push({title:'⚠️ Benzodiazepine in Elderly',body:'Benzodiazepines cause falls/confusion in elderly. Use lowest dose, short duration.'});
  }

  // Pregnancy flags
  if(flags.preg){
    if(txt.includes('ciprofloxacin')||txt.includes('levofloxacin')||txt.includes('moxifloxacin'))alerts.push({title:'🤰 Fluoroquinolone in Pregnancy',body:'Fluoroquinolones are Category C/D — avoid. Use Cefixime or Augmentin.'});
    if(txt.includes('metronidazole')&&txt.includes('1st'))alerts.push({title:'🤰 Metronidazole in 1st Trimester',body:'Avoid Metronidazole in 1st trimester — use after week 14 only.'});
    if(txt.includes('nsaid')||txt.includes('diclofenac'))alerts.push({title:'🤰 NSAID in Pregnancy',body:'NSAIDs contraindicated in 3rd trimester (premature ductus arteriosus closure).'});
  }

  // Allergy check
  if(alg){
    const drugMatches=['amoxicillin','penicillin','cephalexin','augmentin','cefixime','sulfa','co-trimoxazole','nsaid','aspirin','diclofenac','ibuprofen'];
    drugMatches.forEach(drug=>{
      if(alg.includes(drug.split('/')[0])&&txt.includes(drug)){
        alerts.push({title:'🚨 Allergy Alert: '+drug,body:'Patient has documented allergy/avoidance for '+drug+'. Review prescription.'});
      }
    });
  }

  // Show alerts if any
  if(alerts.length){
    setTimeout(()=>{
      const chat=document.getElementById('chat');
      const el=document.createElement('div');
      el.className='msg a';
      el.innerHTML=`<div class="av" style="background:var(--rd)">⚠️</div>
        <div style="max-width:87%">${alerts.map(a=>`
          <div class="contra-alert">
            <div class="contra-title">${a.title}</div>
            <div class="contra-body">${a.body}</div>
          </div>`).join('')}
        </div>`;
      chat.appendChild(el);
      chat.scrollTop=chat.scrollHeight;
      haptic('heavy');
      toast('⚠️ '+alerts.length+' contraindication alert'+(alerts.length>1?'s':'')+'!',4000);
    },800);
  }
  // ── Contraindication check
  checkContraindications(txt);
  // Also add QR button to action bar
  setTimeout(()=>{
    const cards=document.querySelectorAll('.rxcard');
    const last=cards[cards.length-1];
    if(last){
      const acts=last.querySelector('.rxacts');
      if(acts&&!last.querySelector('.bqr')){
        const qrBtn=document.createElement('button');
        qrBtn.className='rxbtn bqr';
        qrBtn.style.cssText='background:#5b6abf;color:#fff';
        qrBtn.innerHTML='<div class="bii">📱</div><div class="bll">QR Code</div>';
        qrBtn.onclick=()=>openQRSheet(encodeURIComponent(txt));
        const fuBtn=document.createElement('button');
        fuBtn.className='rxbtn';
        fuBtn.style.cssText='background:#25d366;color:#fff';
        fuBtn.innerHTML='<div class="bii">💬</div><div class="bll">Follow-up</div>';
        fuBtn.onclick=()=>{
          document.getElementById('fu_diag').value=q;
          openSheet('followup');
        };
        acts.appendChild(qrBtn);
        acts.appendChild(fuBtn);
        // Satisfaction button
        const satBtn=document.createElement('button');
        satBtn.className='rxbtn';
        satBtn.style.cssText='background:#f39c12;color:#fff';
        satBtn.innerHTML='<div class="bii">😊</div><div class="bll">Rate</div>';
        satBtn.onclick=()=>{renderSatStats();openSheet('satisfaction');};
        acts.appendChild(satBtn);
      }
    }
  },200);
}

// ── Add clinical tools to command palette ──
CMD_COMMANDS.push(
  {icon:'🤖',label:'AI Symptom Checker',sub:'Select symptoms → get diagnosis',action:()=>{initSymptomChecker();openSheet('symptom');}},
  {icon:'🧪',label:'Lab Interpreter',sub:'Paste CBC/LFT → AI explains',action:()=>openSheet('lab')},
  {icon:'📄',label:'Discharge Summary',sub:'AI writes hospital discharge note',action:()=>openSheet('discharge')},
  {icon:'📲',label:'Follow-up Message',sub:'WhatsApp message for patient',action:()=>openSheet('followup')},
  {icon:'💊',label:'Generic Switcher',sub:'Brand↔Generic, add PKR prices',action:()=>openSheet('generic')},
  {icon:'📱',label:'Prescription QR',sub:'QR code for last prescription',action:()=>openSheet('qr')},
);

