// ═══════════════════════════════════════════════
// calculators.js — BMI, BP, Sugar, Peds, eGFR, Fever, Dehydration
// ═══════════════════════════════════════════════

// ═══ CALCULATORS ═══
function showCalc(type){
  const area=document.getElementById('calcArea');
  const is=`width:100%;background:var(--bg);border:1.5px solid var(--bd);border-radius:8px;padding:7px 10px;font-size:.8rem;font-family:Plus Jakarta Sans,sans-serif;color:var(--tx);outline:none;margin-bottom:6px;display:block`;
  const bs=`background:var(--nv2);color:#fff;border:none;border-radius:8px;padding:8px;width:100%;font-size:.79rem;font-weight:600;cursor:pointer;margin-bottom:8px`;
  const forms={
    bmi:`<div style="font-weight:600;font-size:.77rem;margin-bottom:7px">⚖️ BMI Calculator</div><input style="${is}" id="c_h" type="number" placeholder="Height (cm)" /><input style="${is}" id="c_w" type="number" placeholder="Weight (kg)" /><button style="${bs}" onclick="calcBMI()">Calculate</button><div class="cr" id="cr_bmi"></div>`,
    bp:`<div style="font-weight:600;font-size:.77rem;margin-bottom:7px">❤️ BP Classifier</div><input style="${is}" id="c_sys" type="number" placeholder="Systolic (mmHg)" /><input style="${is}" id="c_dia" type="number" placeholder="Diastolic (mmHg)" /><button style="${bs}" onclick="calcBP()">Classify</button><div class="cr" id="cr_bp"></div>`,
    sugar:`<div style="font-weight:600;font-size:.77rem;margin-bottom:7px">🩸 Blood Sugar</div><select style="${is}" id="c_st"><option value="fbs">FBS (Fasting)</option><option value="rbs">RBS (Random)</option><option value="hba1c">HbA1c (%)</option><option value="ogtt">OGTT 2hr</option></select><input style="${is}" id="c_sv" type="number" placeholder="Value (mg/dL or %)" /><button style="${bs}" onclick="calcSugar()">Interpret</button><div class="cr" id="cr_sugar"></div>`,
    peds:`<div style="font-weight:600;font-size:.77rem;margin-bottom:7px">👶 Pediatric Dose Calculator</div><input style="${is}" id="c_pw" type="number" placeholder="Weight (kg)" /><select style="${is}" id="c_pd"><option value="par">Paracetamol (Panadol DS 120mg/5ml)</option><option value="ibu">Ibuprofen (Brufen DS 100mg/5ml)</option><option value="amx">Amoxicillin (125mg/5ml)</option><option value="mtz">Metronidazole (200mg/5ml)</option><option value="ctz">Cetirizine (5mg/5ml)</option><option value="azt">Azithromycin (200mg/5ml)</option></select><button style="${bs}" onclick="calcPeds()">Calculate Dose</button><div class="cr" id="cr_peds"></div>`,
    egfr:`<div style="font-weight:600;font-size:.77rem;margin-bottom:7px">🫘 eGFR Calculator (CKD-EPI)</div><input style="${is}" id="c_cr" type="number" placeholder="Creatinine (mg/dL)" /><input style="${is}" id="c_age" type="number" placeholder="Age (years)" /><select style="${is}" id="c_sex"><option value="m">Male</option><option value="f">Female</option></select><button style="${bs}" onclick="calcEGFR()">Calculate</button><div class="cr" id="cr_egfr"></div>`,
    fever:`<div style="font-weight:600;font-size:.77rem;margin-bottom:7px">🌡️ Fever Grade</div><select style="${is}" id="c_fu"><option value="f">°F</option><option value="c">°C</option></select><input style="${is}" id="c_ft" type="number" placeholder="Temperature" /><button style="${bs}" onclick="calcFever()">Grade</button><div class="cr" id="cr_fever"></div>`,
    dehy:`<div style="font-weight:600;font-size:.77rem;margin-bottom:7px">💧 Dehydration Assessment</div><div id="dehy_qs"></div><button style="${bs}" onclick="calcDehy()">Assess</button><div class="cr" id="cr_dehy"></div>`
  };
  area.innerHTML=forms[type]||'';
  if(type==='dehy'){
    const qs=['Sunken eyes','Dry mouth/lips','Decreased skin turgor','Decreased urine output','Tachycardia (fast HR)','Irritability / restlessness','Weak pulse','Lethargic or unconscious'];
    document.getElementById('dehy_qs').innerHTML=qs.map((q,i)=>`<label style="display:flex;align-items:center;gap:7px;font-size:.72rem;margin-bottom:5px;cursor:pointer"><input type="checkbox" id="dq${i}" style="width:14px;height:14px"> ${q}</label>`).join('');
  }
}
function calcBMI(){
  const h=parseFloat(document.getElementById('c_h').value)/100;
  const w=parseFloat(document.getElementById('c_w').value);
  if(!h||!w){toast('Enter both height and weight');return;}
  const bmi=(w/(h*h)).toFixed(1);
  const cats=[{max:18.5,c:'Underweight',a:'Low calorie intake. Increase protein and caloric intake. Nutritional counseling.'},{max:25,c:'Normal',a:'Healthy weight. Maintain with balanced diet and exercise.'},{max:30,c:'Overweight',a:'Lifestyle modification, reduce calories, increase activity. Consider metformin if pre-diabetic.'},{max:35,c:'Obese Class I',a:'Dietary and exercise counseling. Screen for DM, HTN, dyslipidemia.'},{max:40,c:'Obese Class II',a:'Medical management. Consider bariatric referral.'},{max:999,c:'Obese Class III',a:'Bariatric surgery consideration. Aggressive management of comorbidities.'}];
  const r=cats.find(c=>bmi<c.max);
  showResult('cr_bmi',`BMI: ${bmi} kg/m²`,r.c,r.a);
}
function calcBP(){
  const s=parseInt(document.getElementById('c_sys').value);
  const d=parseInt(document.getElementById('c_dia').value);
  if(!s||!d){toast('Enter both values');return;}
  const cats=[[90,60,'Hypotension','IV fluids if symptomatic. Identify cause.'],[120,80,'Normal','Maintain with lifestyle.'],[130,80,'Elevated/Pre-HTN','Lifestyle modification. Recheck in 3 months.'],[140,90,'Stage 1 HTN','Lifestyle + consider Amlodipine 5mg or Ramipril 5mg OD.'],[160,100,'Stage 2 HTN','Dual therapy: Amlodipine + Ramipril/Losartan.'],[180,120,'Hypertensive Urgency','Tab Nifedipine (Adalat) 10mg SL stat. Refer if no response.'],[999,999,'Hypertensive Emergency','IV Labetalol/Nitroprusside. Emergency referral NOW.']];
  let cat=cats[cats.length-1];
  for(let i=0;i<cats.length-1;i++){if(s<cats[i][0]&&d<cats[i][1]){cat=cats[i];break;}}
  showResult('cr_bp',`${s}/${d} mmHg`,cat[2],cat[3]);
}
function calcSugar(){
  const type=document.getElementById('c_st').value;
  const v=parseFloat(document.getElementById('c_sv').value);
  if(!v){toast('Enter value');return;}
  const ranges={
    fbs:[[70,'Hypoglycemia','Give glucose. Reduce antidiabetic dose. Rule out missed meal.'],[100,'Normal FBS','Maintain diet. Recheck in 6 months.'],[126,'Pre-diabetes (IFG)','Lifestyle modification. Start Metformin if risk factors present.'],[999,'Diabetes (FBS ≥126)','Start antidiabetic therapy. Glimepiride + Metformin + lifestyle.']],
    rbs:[[70,'Hypoglycemia','Immediate glucose. Reassess medication.'],[140,'Normal','Continue current management.'],[200,'Possible Diabetes','Confirm with FBS. Start lifestyle modification.'],[999,'Diabetes (RBS ≥200)','Antidiabetic therapy required.']],
    hba1c:[[5.7,'Normal (<5.7%)','Excellent control. Maintain.'],[6.5,'Pre-diabetes (5.7-6.4%)','Lifestyle modification. Consider Metformin.'],[8,'Diabetes (6.5-7.9%) - Good control','Continue current therapy. Target <7%.'],[10,'Poor control (8-9.9%)','Add/intensify therapy. Review diet compliance.'],[999,'Very poor control (≥10%)','Aggressive intensification. Rule out non-compliance. Add insulin if needed.']],
    ogtt:[[140,'Normal','No action.'],[200,'Pre-diabetes (IGT)','Lifestyle + Metformin.'],[999,'Diabetes (≥200)','Start antidiabetic therapy.']]
  };
  const r=ranges[type].find(r=>v<r[0]);
  showResult('cr_sugar',`${type.toUpperCase()}: ${v}${type==='hba1c'?'%':' mg/dL'}`,r[1],r[2]);
}
function calcPeds(){
  const w=parseFloat(document.getElementById('c_pw').value);
  const drug=document.getElementById('c_pd').value;
  if(!w){toast('Enter weight');return;}
  const d={par:{dose:15,conc:120,unit:'mg/5ml',name:'Paracetamol (Panadol DS)',max:75},ibu:{dose:10,conc:100,unit:'mg/5ml',name:'Ibuprofen (Brufen DS)',max:40},amx:{dose:25,conc:125,unit:'mg/5ml',name:'Amoxicillin',max:500},mtz:{dose:7.5,conc:200,unit:'mg/5ml',name:'Metronidazole',max:400},ctz:{dose:0.25,conc:5,unit:'mg/5ml',name:'Cetirizine',max:10},azt:{dose:10,conc:200,unit:'mg/5ml',name:'Azithromycin',max:500}};
  const dd=d[drug];
  const totalMg=Math.min(dd.dose*w,dd.max);
  const ml=((totalMg/dd.conc)*5).toFixed(1);
  showResult('cr_peds',`${dd.name}`,`${totalMg.toFixed(0)}mg = ${ml}ml per dose`,`Syrup concentration: ${dd.unit}\nGive ${ml}ml per dose. Standard frequency: TDS/BD as directed.\nMax single dose: ${dd.max}mg`);
}
function calcEGFR(){
  const cr=parseFloat(document.getElementById('c_cr').value);
  const age=parseFloat(document.getElementById('c_age').value);
  const sex=document.getElementById('c_sex').value;
  if(!cr||!age){toast('Enter all values');return;}
  let egfr=141*Math.pow(Math.min(cr/(sex==='f'?0.7:0.9),1),(sex==='f'?-0.329:-0.411))*Math.pow(Math.max(cr/(sex==='f'?0.7:0.9),1),-1.209)*Math.pow(0.993,age)*(sex==='f'?1.018:1);
  egfr=Math.round(egfr);
  const ck=[{min:90,s:'G1 Normal',a:'No dose adjustment. Monitor annually.'},{min:60,s:'G2 Mildly reduced',a:'Avoid NSAIDs long-term. Monitor 6-monthly.'},{min:45,s:'G3a Mild-moderate',a:'Avoid metformin if <30. Dose adjust renally cleared drugs.'},{min:30,s:'G3b Moderate-severely reduced',a:'Stop metformin. Dose adjust antibiotics. Refer nephrology.'},{min:15,s:'G4 Severely reduced',a:'Stop metformin, NSAIDs. Pre-dialysis planning. Nephrology urgent.'},{min:0,s:'G5 Kidney failure',a:'Dialysis or transplant. All dose adjustments critical.'}];
  const r=ck.find(c=>egfr>=c.min)||ck[ck.length-1];
  showResult('cr_egfr',`eGFR: ${egfr} ml/min/1.73m²`,`CKD Stage: ${r.s}`,r.a);
}
function calcFever(){
  let t=parseFloat(document.getElementById('c_ft').value);
  const u=document.getElementById('c_fu').value;
  if(!t){toast('Enter temperature');return;}
  if(u==='f')t=(t-32)*5/9;
  const fc=[[36.5,'Hypothermia (<36.5°C)','Warm patient. Rule out sepsis if clinical signs present.'],[37.2,'Normal (36.5-37.2°C)','No treatment needed.'],[38,'Low-grade fever (37.3-38°C)','Hydration, rest. Monitor. Paracetamol if symptomatic.'],[39,'Mild fever (38.1-39°C)','Paracetamol 1g TDS. Investigate cause. Cold sponging.'],[40,'High fever (39.1-40°C)','Paracetamol 1g + Mefenamic acid/Ibuprofen. Full workup CBC, cultures.'],[41,'Very high fever (40.1-41°C)','Urgent cooling. IV fluids. Full sepsis workup. Admit.'],[999,'Hyperpyrexia (>41°C) — EMERGENCY','ICU level care. IV cooling. Antibiotics empirically. Dexamethasone if CNS signs.']];
  const r=fc.find(c=>t<c[0]);
  showResult('cr_fever',`${t.toFixed(1)}°C (${(t*9/5+32).toFixed(1)}°F)`,r[1],r[2]);
}
function calcDehy(){
  const qs=['Sunken eyes','Dry mouth/lips','Decreased skin turgor','Decreased urine output','Tachycardia','Irritability','Weak pulse','Lethargic/unconscious'];
  const score=qs.filter((_,i)=>document.getElementById('dq'+i)?.checked).length;
  const cats=[[0,'None (0)','No signs. No dehydration. Continue normal feeds.'],[2,'Mild (1-2 signs)','Oral rehydration. ORS after each loose stool. Monitor.'],[5,'Moderate (3-5 signs)','ORS aggressively 50-100ml/kg over 3-4 hours. Reassess.'],[8,'Severe (6-8 signs)','IV fluids STAT. Ringer Lactate 100ml/kg. Hospital admission. Emergency.']];
  const r=cats.find(c=>score<=c[0])||cats[cats.length-1];
  showResult('cr_dehy',`Score: ${score}/8 signs`,`${r[1]} Dehydration`,r[2]);
}
function showResult(id,val,cat,advice){
  const el=document.getElementById(id);
  if(!el)return;
  el.className='cr show';
  el.innerHTML=`<div class="crv">${esc(val)}</div><div class="crc">${esc(cat)}</div><div class="cra">${esc(advice)}</div>`;
}
