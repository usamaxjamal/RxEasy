// ═══════════════════════════════════════════════
// data.js — Static reference data
// FORMULARY: AI fallback reference (Pakistan brands)
// DRUGS: Searchable drug reference database
// ═══════════════════════════════════════════════

const FORMULARY = `
=== UTI / FEVER WITH BURNING MICTURATION ===
ADULTS: 1.Tab Levofloxacin 250mg/500mg (Leflox/Qumic/Cravit) TDS/BD OR Cap Cefixime 400mg (Cefspan/Cefiget) OD 2.Tab Mefenamic Acid (Ponstan/Ponstan forte) TDS/BD OR Tab Paracetamol (Panadol/Calpol) TDS 3.Syp Sodium Acid Citrate (Citralka) 2Tsp BD/TDS glass water 4.Cranmax pro sachets 1 sachet BD/OD. If Nausea/vomiting: Syp/Tab Domperidone (Motilium Syp 1mg/ml Tab 10mg) 30min before meals
CHILDREN: 1.Syp Nalidixic Acid 250mg (Negram/Nilacid) 1-2Tsp TDS/BD OR Syp Ciprofloxacin 125mg/250mg (Novidat/Mytill) TDS/BD OR Syp Co-trimoxazole (Septran DS) TDS/BD 2.Syp Antipyretic (Brufen DS/Panadol DS) 1-2Tsp TDS/BD 3.Syp Cranmax aqua (Hilton) OR Syp Cenova (Getz) BD/OD 4.If nausea: Syp Gravinate 1-2Tsp BD/TDS
PREGNANCY: Tab Co-Amoxiclave 375/625mg/1g (Augmentin/Amclave) TDS/BD OR Cap Cephalexin 250/500mg (Keflex/Ceporex) TDS/BD + Tab Paracetamol (Panadol/Calpol) BD/TDS
INVESTIGATIONS: CBC, UCE, Urine D/R, Urine C/S, U/S KUB, X-ray KUB

=== UTI (URINARY TRACT INFECTION) ===
ADULTS: 1.Tab Levofloxacin 250/500mg (Leflox/Cravit) TDS/BD OR Cap Cefixime 400mg (Cefspan/Cefiget) OD 2.Tab Diclofenac Sodium 50/100mg (Voren/Voltral) BD 3.Syp Sodium acid citrate (Citralka) 2-3tsp glass water BD/TDS 4.Cranmax pro sachets BD/OD
CHILDREN: 1.Syp Ciprofloxacin 125/250mg (Novidat) TDS/BD OR Syp Cefixime 100/200mg (Cefspan/Cefiget) BD/OD 2.Syp Ibuprofen (Brufen DS) TDS/BD 3.Syp Cranmax aqua BD/TDS
PREGNANCY: Tab Co-Amoxiclave (Augmentin/Amclave) TDS/BD OR Cap Cephalexin (Keflex/Ceporex) TDS/BD + Tab Paracetamol (Panadol/Calpol)
INVESTIGATIONS: CBC, UCE, Urine D/R, Urine C/S, U/S KUB

=== PYLONEPHRITIS ===
1.Cap Cefixime 400mg (Cefspan/Cefiget) OD OR Tab Moxifloxacin 400mg (Cefiget/Maxlox) OD 2.Tab Diclofenac Sodium (Voren/Voltral) BD 3.Syp Citralka 2tsp BD/TDS 4.Cranmax pro sachets BD/OD
CHILDREN: Syp Ciprofloxacin (Novidat) TDS/BD OR Syp Cefixime (Cefspan/Cefiget) BD/OD + Syp Brufen DS TDS/BD + Syp Cranmax aqua BD/OD
INVESTIGATIONS: CBC, UCE, Urine D/R, Urine C/S, U/S KUB, CT KUB

=== RENAL STONES (NEPHROLITHIASIS) ===
1.Tab Levofloxacin (Leflox/Qumic) if UTI present OR Cap Cefixime (Cefspan/Cefiget) OD 2.Tab Diclofenac sodium (Voren/Voltral) BD 3.Tab K-stone OR Tab Cystone BD 4.Tab Terazosin 1/2mg (Hytrin) BD/OD OR Tab Tamsulosin 0.4mg (Tamsolin) OD 5.Cranmax pro sachets BD If spasmodic: Tab Phenazopyridine 100mg (Uropin) BD OR Tab Drotaverine 80mg (Relispa forte) BD 6.Hydration ≥2.5L/day
INVESTIGATIONS: CBC, UCE, Uric acid, Urine D/R C/S, X-ray KUB, U/S KUB, CT KUB

=== TYPHOID FEVER ===
ADULTS: 1.Tab Azithromycin 500mg (Zetro/Bectizith/Azomax) OD 2.Tab Mefenamic Acid (Ponstan/Ponstan forte) TDS/BD 3.Syp Lysovit OR Syp Tresorix forte 2tsp BD 4.Omeprazole 40mg (Zoltar/Risek) OD 30min before meal. If Nausea: Syp/Tab Domperidone (Motilium)
CHILDREN: 1.Syp Azithromycin 200mg (Zetro/Bectizith) OR Syp Cefixime (Cefspan/Cefiget) TDS/BD 2.Syp Brufen DS/Panadol DS TDS/BD 3.Syp Lysovit/Leaderplex BD/OD. Treatment 7-14 days.
INVESTIGATIONS: Blood culture 1st week, Antigen/Widal 2nd week, Stool culture 3rd week, Urine culture 4th week (BASU)

=== MALARIA FEVER ===
ADULTS: 1.Tab Artemether+Lumefantrine (Artem DS 40/240mg OR Artem DS Plus 80/480mg) BD/TDS (Artheget) 2.Tab Paracetamol (Panadol/Calpol) TDS 3.Syp Tresorix forte/Glyvesol 2Tsp BD/OD
CHILDREN: Syp Artemether+Lumefantrine (Artem/Artheget Plain/DS) TDS/BD + Syp Panadol DS/Calpol Plus TDS/BD + Syp Lysovit/Leaderplex BD
INVESTIGATIONS: CBC, UCE, LFTs, Malaria Parasite, CXR, Urine D/R

=== FEVER WITH CHILLS AND RIGORS ===
1.Tab Artemether+Lumefantrine (Artem/Artheget DS/DS Plus) TDS/BD 2.Tab Levofloxacin 250/500mg (Leflox/Llumic) TDS/BD OR Cap Cefixime 400mg (Cefspan/Cefiget) OD 3.Tab Paracetamol (Panadol/Calpol) 1-2 tabs TDS/BD if high fever 2+2+2 4.Syp Lysovit OR Syp Glyvesol 2Tsp BD/OD
INVESTIGATIONS: CBC, LFTs, Malaria Parasite, Dengue IgG IgM, Dengue NS1, CXR, Urine D/R, Blood/Urine C/S

=== FEVER WITH DRY COUGH / URTI ===
1.Tab Co-Amoxiclave 375/625mg/1g (Augmentin/Amclave) TDS/BD OR Cap Azithromycin 250mg/Tab 500mg (Macrobac/Azomax/Zetro) BD/OD 2.Syp Hydrillin DM OR Syp Corex-D 2Tsp TDS/BD 3.Tab Loratadine 10mg (Softin/Lorin NSA) OD/BD 4.Tab Paracetamol (Panadol/Calpol) TDS/BD

=== FEVER WITH PRODUCTIVE COUGH / LRTI ===
1.Tab Clarithromycin 250/500mg (Klaricid/Claritek) TDS/BD OR Cap Cefixime 400mg (Cefspan/Cefiget) OD 2.Syp Hydrillin OR Syp Cofrest OR Syp Pulmonol 2Tsp TDS/BD 3.Tab Loratadine 10mg (Softin/Lorin NSA) OD/BD 4.Tab Paracetamol (Panadol/Calpol) TDS/BD

=== PRODUCTIVE COUGH WITH POST-NASAL DRIP ===
1.Syp Coferb Plus OR Syp Pulmonol OR Syp Seroline TDS/BD 2.Tab Fexofenadine 120mg (Fexet/Fexo) OD 3.Tab Montelukast 10mg (Montiget/Mytika) OD HS 4.If indicated: Tab Clarithromycin (Klaricid/Claritek) TDS/BD OR Cap Cefixime (Cefspan/Cefiget) OD

=== SORE THROAT / TONSILLITIS / PHARYNGITIS ===
ADULTS: 1.Cap Ampicillin 250/500mg (Penbritin) TDS/BD OR Cap Azithromycin (Macrobac/Azomax) BD/OD OR Tab Co-Amoxiclave 375/625mg/1g (Augmentin/Amclave) TDS/BD 2.Tab Mefenamic Acid (Ponstan forte/Mefnac DS) TDS/BD OR Tab Voren 50/100mg (Diclofenac) BD If sneezing/flu: Tab Fexet 60/120/180mg OD 3.Gargle Benzarin/Listerine/Enziclor 2-3x/day
CHILDREN: 1.Syp Co-Amoxiclave 156/312mg (Augmentin DS/Amclave DS) TDS/BD 2.Syp Panadol DS/Calpol Plus TDS/BD If sneezing: Syp T-day 2.5mg OR Softin 5mg OR Syp Neo-Antial OD

=== ACUTE SINUSITIS ===
1.Tab Fexofenadine 60mg+Pseudoephedrine 120mg (Fexet-D) OD 2.Tab Co-Amoxiclave (Augmentin/Amoxiclave) TDS/BD 3.Tab Mefenamic acid (Ponstan/Ponstan Fort) BD 4.Vaporization 2-3x/day
ALT: Tab Fexofenadine 120mg (Fexet/Telfast) OD + Tab Clarithromycin (Klaricid/Claritek) BD + Tab Aceclofenac 100mg (Acenac/Acelo) BD
INVESTIGATIONS: CBC, X-Ray PNS, CT scan PNS

=== ASTHMA / SEVERE COUGHING ===
1.Atem+2cc N/S Nebulization 6-8 hourly 2.Atrovent+2cc N/S Nebulization 6-8 hourly 3.Tab Montelukast sodium 10mg (Monitiget/Mytika) OD 4.Tab Fexofenadine 120mg (Telfast/Fexet) OD 5.Tab Clarithromycin 500mg (Klaricid/Claritek) OD 6.Cough Syrup (Hydrillin/Acefyl/Bronochol) 7.If not respond add steroids
EMERGENCY: Inj Hydrocortisone 100/250/500mg (Solu-cortif) + Inj Phenermine melate 25mg/ampule IV slowly
INVESTIGATIONS: CXR, CBC, PFTs, Sputum C/S

=== GERD (GASTRO-ESOPHAGEAL REFLUX DISEASE) ===
OPTION 1 (5-6 weeks max 8 weeks): 1.Cap Dexlansoprazole (Razodex 30/60mg) OD 30min before meal 2.Levosulpride 25/50mg (Levopraid/Scipride) BD 30min before meal 3.Syp Hilgas OR Syp Gaviscon advance 2tsp bedtime
OPTION 2: 1.Cap Omeprazole 40mg (Risek) OD 2.Itopride 50mg (Ganaton) BD 30min before meal If psychogenic dyspepsia: Tab Escitalopram 5/10mg (Estar/Citanew) OD after breakfast
INVESTIGATIONS: Upper endoscopy UGD, 24hr Esophageal pH monitoring

=== GASTRIC ULCER (PEPTIC ULCER) ===
1.Cap Omeprazole 40mg (Risek/Losec) OD 30min before meal 2.Syp Hilgas/Gaviscon Advance 2tsp BD/OD If depression: Tab Levosulpride 25/50mg (Levopraid/Scipride) BD If constipated: Syp Duphalac (Lactulose)/Laxoberon If nausea: Tab/Syp Domperidone 10mg (Motilium)
If severe/not responding → TRIPLE THERAPY 14 days (Clarithromycin+Amoxicillin+Omeprazole)

=== DUODENAL ULCER ===
1.Cap Omeprazole 40mg (Risek/Zoltar) OD 30min before meal 2.Syp Hilgas/Gaviscon Advance 2tsp BD/OD If depression: Tab Levosulpride (Levopraid/Scipride) BD If constipated: Syp Duphalac/Laxoberon If nausea: Domperidone (Motilium)
If severe → TRIPLE THERAPY 14 days

=== H.PYLORI INFECTION (14 or 21 days) ===
ADULTS: 1.Tab Clarithromycin 500mg (Klaricid/Claritek) BD 2.Cap Amoxicillin 1g (Amoxil/Zeemox) BD 3.Cap Omeprazole 40mg (Risek/Omezol) OD 30min before meal Patient mostly depressed: Tab Escitalopram 5/10mg (Depsit/Citanew) OD after breakfast
CHILDREN: 1.Syp Clarithromycin 125/250mg (Klaricid/Claritek) 2tsp BD/TDS 2.Syp Amoxicillin 125/250mg (Amoxil/Zeemox) 2tsp BD/TDS 3.Syp Famotidine (Peptiban/Acicon) 2tsp BD/TDS
ERADICATION: Standard Triple (PPI+Clarithromycin+Amoxicillin x14d) | 2nd line Levofloxacin Triple | Bismuth Quadruple
INVESTIGATIONS: H.Pylori stool Ag, Urea Breath Test, Upper Endoscopy

=== ORAL ULCER (APHTHOUS ULCER) ===
1.Cap Omeprazole 40mg (Risek/Ruling) OD 2.Tab Metronidazole 200/400mg (Flagyl/Metrozine) TDS/BD 3.Tab Folic Acid 5mg BD 4.Nystatin syrup OR Miconazole gel (Daktarin Oral Gel) BD
ALT: Cap Esomeprazole 40mg (Nexum/Esso) + Flagyl + Folic acid + Tab Vitamin-B complex (Neurobion) + Triamcinolone (Kanaolog in orobase) Treatment: heals 10-14 days

=== EAR INFECTION / DISCHARGE ===
1.Tab Co-Amoxiclave 375/625mg/1g (Augmentin/Amclave) TDS/BD OR Cap Cefadroxil 250/500mg (Duricef/Cedrox) TDS/BD 2.Tab Mefenamic acid (Ponstan/Ponstan fort) TDS OR Tab Naproxen 250/500mg (Neoprox/Flexin) BD 3.Cipocain OR Otocain Ear drop 2-3 drops 3-4x/day

=== IBS (IRRITABLE BOWEL SYNDROME) ===
1.Tab Mebeverine 135mg (Colofac/Spasler-P) TDS 2.Tab Metronidazole 400mg (Flagyl/Klint) TDS 3.Cap Omeprazole 40mg (Risek/Ruling) OD 30min before meal 4.Folic acid 5mg BD 5.Tab Librex BD If diarrhea: Loperamide If constipation: Ispghol husk + Lactulose (Duphalac/Lilac)
ALT: Tab Mebeverine 200mg (Despas MR) + Flagyl/Klint + Cap Dexlansoprazole 30mg (Razodex)

=== CONSTIPATION (ADULTS) ===
1.Syp Lactulose (Lilac/Duphalac) 12-60ml 4-6hourly then 30ml OD OR Laxoberon (sodium Picosulphate) OR Skilex (for diabetics) 2.Cap Omeprazole 40mg (Risek/Zoltar) OD 3.Isphaghol husk OD HS
CHILD CONSTIPATION: Costeroil 2TSP BD/TDS OR Skilex drops 4-6 drops BD/TDS If spasmodic: Syp Spasler-P BD/TDS

=== ULCERATIVE COLITIS ===
MILD-MODERATE: 1.Tab Mebeverine 135mg (Colofac/Spasler-P) TDS 30min before meal 2.Mesalazine 400mg (Masacol/Pentasa) BD/TDS 3.Tab Metronidazole 400mg (Flagyl/Klint) TDS 4.Cap Esomeprazole 40mg (Nexum/Esso) OD 5.Tab Becefol OD
MODERATE-SEVERE: Replace with Mebeverine 200mg (Despas/Despas MR) + Mesalazine 800mg (Masacol) Add Tab Prednisolone 5mg (Deltacortril) TAPERING: 3+3+3 x3d → 2+2+2 x3d → 2+0+2 x3d → 1+0+1 x3d → 0+0+1 x3d + Esomeprazole (Nexum/Esso) + Becefol
NOTE: Steroids for active flare ONLY not maintenance

=== IRON DEFICIENCY ANEMIA (IDA) ===
1.Cap Fefolvit OR Tab Iberet Folic OD/BD 2.Syp Maltofer 2+0+2 (2TSP BD)
INVESTIGATIONS: CBC, UCE, LFTs PT INR, Iron studies Ferritin, CXR, U/S Abdomen

=== MEGALOBLASTIC ANEMIA ===
1.Nutritional counseling - increase folate and B12 2.Tab Neurobion BD 3.Tab Folic acid 5mg BD
INVESTIGATIONS: CBC with peripheral smear, Retic count, Serum LDH, Vit B12 and folate level

=== DM TYPE-II (DIABETES MELLITUS) ===
1.Tab Glimepiride 2/4mg (Getryl/Amaryl) OD before breakfast 2.Metformin 500/750mg (Glucophage/Neophage) BD with meals 3.Tab Mecobalamin 500mcg (Methycobal/Cobalamin) BD If neuropathic pain: Cap Gabix 100/300mg (Gabapentin) OR Cap Gabica 50/75mg (Pregabalin) BD/OD 4.Canderel sugar tablets instead of sugar in tea
ANTIDIABETICS: Glimepiride(Getryl/Amaryl), Glibenclamide(Daonil), Gliclazid(Diamicron), Sitagliptin(Trevia), Vildagliptin(Vilget), Pioglitazone(Zolid), Dapagliflozin(Dapa), Empagliflozin(Xenglu), Saxagliptin(Saxagen)
COMBOS: Glimepiride+Metformin(Getformin), Pioglitazone+Metformin(Zolid plus), Sitagliptin+Metformin(Treviamet), Vildagliptin+Metformin(Vilget-M)
NEUROPATHY: Locosamid(Lalap), Pregabalin(Gabica), Gabapentin(Gabix), Neurobion, Bevidox, Methycobal

=== MYOCARDIAL INFARCTION (MI) PROPHYLAXIS ===
1.Tab Lisinopril (Zestril 2.5/5/10/20mg) OD/BD 2.Tab Atorvastatin 10/20mg (Lipiget/Lipitor) OD HS 3.Tab Clopidogril 75mg (Noclot/Lowplat) OD 4.Cap Esomeprazole 40mg (Nexum/Esso) OD 30min before meal 5.Nitroglycerin 0.5mg (Angised) SOS sublingual Patient depressed: Tab Sertraline 50mg (Sert) OD after breakfast If sleep disturbed: Tab Alprazolam 0.5mg (Xanax) OD HS

=== HYPERTENSION ===
1.Tab Amlodipine 5/10mg (Norvasc/Amloz) OD 2.Tab Ramipril 5/10mg (Tritace/Ramic) OD OR Tab Losartan 50/100mg (Cozaar/Losacar) OD 3.Tab Bisoprolol 5mg (Concor) OD OR Tab Atenolol 50mg (Tenormin) OD 4.Tab Hydrochlorothiazide 25mg OD add-on
Urgency: Tab Nifedipine (Adalat) 10mg SL stat

=== CHRONIC HEPATITIS C (HCV) ===
OPTION 1: 1.Cap Sofosbuvir 400mg (Sofomac/Sofohil/Sofiget) OD 2.Cap Daclatasvir 60mg (Maclinza/Clavir/Daclaget) OD 3.Tab L-methylfolate 400mcg (Myfol/Maxfol/Folate) OD HCV+Cirrhosis: add Cap Ribavirin 400mg (Viron/Novia/Ribazole) OD If constipation: Syp Lactulose (Duphalac/Lilac) 20-30ml HS 4.Cap Esomeprazole 40mg (Nexum/Esso) OD
OPTION 2: Cap Sofosbuvir 400mg+Velpatasvir 100mg OR Sofosbuvir+Ledipasvir 90mg (Syneget-LS) OD + Ribavirin (Viron/Novia/Ribazole) + L-methylfolate (Myfol/Maxfol)
INVESTIGATIONS: CBC, U/C/E, LFTs, PT INR, U/S Abdomen, HBsAg, Anti-HCV, HCV RNA PCR

=== CHRONIC HEPATITIS B (HBV) ===
1.Tenofovir Disoproxil Fumarate 300mg (Tenofo-B/Hilfovir/Gentovir/Vireof) OR Tab Entecavir (Ecavir 0.5mg/Tacavir 0.5/1mg) OD 2.Tab L-methylfolate 400mcg (Myfol/Maxfol/Folate) OD If constipation: Syp Lactulose (Duphalac/Lilac) HS 3.Cap Esomeprazole 40mg (Nexum/Esso) OD
INVESTIGATIONS: CBC, U/C/E, LFTs, HBsAg, Anti-HCV, HBV DNA PCR

=== DECOMPENSATED CHRONIC LIVER DISEASE (DCLD) ===
1.Tab Carvedilol 6.5mg (Carvida) Half Tab BD 2.Tab Spironolactone 100mg (Aldactone) OD max 400mg/day 3.Tab Furosemide 20/40mg (Lasix) BD 4.Tab L-methylfolate (Myfol/Maxfol) OR Tab Folic acid 5mg OD 5.Cap Esomeprazole 40mg (Nexum/Esso) OD If constipation: Syp Lactulose (Duphalac/Lilac) 20-30ml HS
INVESTIGATIONS: CBC, U/C/E, LFTs, HBsAg, Anti-HCV, CT abdomen with contrast, U/S guided aspiration

=== LIVER ABSCESS ===
1.Tab Ciprofloxacin 250/500mg (Ciproxen)+Entamizole DS/Metodine DF TDS/BD 2.Tab Metronidazole 400mg+Diloxanide furoate 500mg TDS 3.Tab Mefenamic Acid (Mefnac/Mefnac DS) TDS 4.Cap Omeprazole 40mg (Risek/Ruling) OD
ALT ANTIAMOEBIC: Flagyl/Metrozine, Tinidazole (Fasygen 200mg), Nitazoxanide (Izato 100mg), Entamizole DS
ALT ANTIBIOTICS: Novidat (Ciprofloxacin), Amoxil, Inj Ceftriaxone (Titan/Rocephin), Inj Gentamycin (Genticin)
OTHERS: Iodoquinal, Chloroquine (Resochine/Nevaquin-P), Hydroxychloroquine (Tab HCQ)
INVESTIGATIONS: CBC, U/C/E, LFTs, HBsAg, Anti-HCV, CT abdomen with contrast

=== VAGINAL CANDIDIASIS ===
1.Cap Clindamycin 150/300mg (Delacin-C) BD 2.Tab Metronidazole 400mg (Flagyl) TDS 3.Clotrimazole Vaginal Cream/Tablet (Canesten) OD after breakfast

=== CHLAMYDIA INFECTION ===
1.Cap Doxycycline 100mg (Doxyn) BD 2.Tab Metronidazole 400mg (Flagyl) TDS 3.Cap Fluconazole 100mg (Diflucan) OD 4.Clotrimazole Vaginal Cream/Tablet (Canesten) OD

=== LEUKORRHEA ===
1.Cap Lekozar BD 2.Tab Metronidazole 400mg (Flagyl) TDS 3.Cap Doxycycline (Doxyn/Vibramycin) OD 4.Tab Diclofenac sodium (Voren) BD

=== PULMONARY TUBERCULOSIS (TB) ===
1.Tab Myrin forte OR Myrin-P Forte 2-3 tabs morning before breakfast 2.Tab Vita-6 OD at night 3.Syp Tresorix fort 2-0-2 (2tsp 30min before food) 4.Cap Omeprazole 40mg (Risek/Zoltar) OD
ATT DOSES: Isoniazid 5-10mg/kg/day max 300mg, Rifampicin 10-15mg/kg/day max 600mg, Pyrazinamide 20-30mg/kg/day max 2g, Ethambutol 15-20mg/kg/day max 1.2g
INVESTIGATIONS: CBC, LFTs, UCE, PT INR, ESR, Sputum Gene Xpert/C&S/AFB, CXR, CT chest

=== ANXIETY / DEPRESSION ===
1.Tab Escitalopram (Estar/Citanew/Lexapro/Nexito) 10mg OD morning 2.Tab Clonazepam (Rivotril) 0.5mg OD HS PRN max 4 weeks OR Tab Alprazolam (Xanax/Alzam) 0.25mg BD PRN 3.Tab Sertraline (Sert/Zoloft) 50mg OD morning (alt, increase to 100mg)
Insomnia: Tab Zolpidem (Stilnox) 10mg OD HS OR Tab Promethazine (Phenergan) 25mg OD HS

=== VOMITING / NAUSEA ===
1.Tab/Syp Domperidone (Motilium Tab 10mg/Syp 1mg/ml) TDS 30min before meals 2.Tab Metoclopramide (Maxolon) 10mg TDS 3.Tab Ondansetron (Zofran) 4-8mg TDS PRN severe
CHILDREN: Syp Gravinate TDS BD OR Syp Ondansetron per weight

=== DIARRHEA / GASTROENTERITIS ===
1.Tab Metronidazole (Flagyl) 400mg TDS x 5 days 2.ORS sachets after each loose stool 3.Tab Loperamide (Imodium) 2mg after each stool max 8mg/day
CHILDREN: Syp Metronidazole 7.5mg/kg TDS x 5 days + ORS + Zinc 10-20mg OD x 14 days

=== ALLERGIC CONJUNCTIVITIS / RED EYE (ALLERGY) ===
ADULTS: 1.Olopatadine 0.1% Eye Drops (Patanol/Olopat) 1 drop BD-TDS x 7-14 days 2.Tab Loratadine 10mg (Softin/Lorin NSA) OD OR Tab Levocetirizine 5mg (Belair/Xyzal) OD 3.Artificial Tears (Refresh Tears/Optive) 1-2 drops PRN for dryness/irritation. If severe: Fluorometholone 0.1% Eye Drops (FML/Flucon) 1 drop BD x 5 days (short course only)
CHILDREN: Ketotifen 0.025% Eye Drops (Zaditen/Ketorol) 1 drop BD + Syp Softin/Cetirizine OD
NOTE: NO antibiotics, NO cough syrup, NO antacids for allergic conjunctivitis — this is a localized allergic condition.
INVESTIGATIONS: None usually needed. If unclear: Conjunctival swab.

=== BACTERIAL CONJUNCTIVITIS (MUCOPURULENT EYE DISCHARGE) ===
1.Ciprofloxacin 0.3% Eye Drops (Ciloxan/Ciprocin eye) 1-2 drops Q4H x 7 days 2.Tobramycin 0.3% Eye Drops (Tobrex/Tobrasix) 1-2 drops QID x 7 days (alternative) 3.Chloramphenicol Eye Drops 0.5% (Chloroptic) 1-2 drops QID x 5-7 days
NOTE: NO systemic antibiotics needed for uncomplicated bacterial conjunctivitis. NO antihistamines unless allergic component confirmed.
CHILDREN: Chloramphenicol Eye Drops (Chloroptic) 1 drop QID x 5 days OR Tobramycin drops

=== ALLERGIC RHINITIS ===
ADULTS: 1.Tab Fexofenadine 120mg (Fexet/Telfast) OD OR Tab Levocetirizine 5mg (Belair/Xyzal) OD HS 2.Mometasone Nasal Spray (Nasonex/Momez) 2 sprays each nostril OD x 4-6 weeks 3.Tab Montelukast 10mg (Montiget/Mytika) OD HS (add-on if needed) 4.If congestion: Tab Fexofenadine+Pseudoephedrine (Fexet-D) OD (avoid in HTN/CAD)
CHILDREN: Syp Softin/Cetirizine/Lorin OD + Mometasone nasal spray 1 spray each nostril OD (if >6 yrs) + Syp Montiget chewable (if >6 yrs)
NOTE: NO antibiotics unless secondary bacterial sinusitis confirmed. NO cough syrup unless cough specifically present.

=== URTICARIA / HIVES / ALLERGIC RASH ===
ACUTE: 1.Tab Levocetirizine 5mg (Belair/Xyzal) OD-BD x 7-14 days OR Tab Fexofenadine 180mg (Fexet/Telfast) OD 2.Tab Prednisolone 10-20mg (Deltacortril) OD x 3-5 days (if extensive/angioedema — taper) 3.If angioedema/anaphylaxis: Inj Adrenaline 0.5mg IM + Inj Hydrocortisone 200mg IV + Inj Phenergan 25mg IM STAT
CHRONIC URTICARIA: 1.Tab Fexofenadine 180mg (Fexet/Telfast) BD (double dose) 2.Tab Montelukast 10mg (Montiget) OD HS 3.Rule out thyroid, H.Pylori, parasites
NOTE: NO antibiotics for urticaria unless infection is the confirmed trigger.

=== SCABIES ===
1.Permethrin 5% Cream/Lotion (Lotrix/Mitonil) — apply below collar line to entire body including web spaces, leave overnight, bathe Day-3. Repeat after 1 week. 2.Tab Ivermectin 12mg (Mectizan/Scabi) OD — take after meal with water (single dose, repeat after 2 weeks if needed) 3.Tab Levocetirizine 5mg (Belair/Xyzal) OD HS for itching
ALL FAMILY MEMBERS should be treated simultaneously. Wash all clothes/bedding in hot water.
NOTE: NO antibiotics unless secondary skin infection (impetigo) present. NO topical steroids unless confirmed secondary eczema.
CHILDREN <15kg: Use Permethrin cream only (Ivermectin not approved <15kg)

=== DENGUE FEVER ===
ADULTS: 1.Tab Paracetamol (Panadol/Calpol) 500mg-1g TDS/QID for fever (MAX: 4g/day) 2.ORS sachets 3-4L fluid/day 3.Tab Neurobion OD (supportive)
CRITICAL — ABSOLUTELY FORBIDDEN IN DENGUE: NSAIDs (Aspirin, Ibuprofen, Diclofenac, Mefenamic Acid) — risk of hemorrhage. NO antibiotics unless secondary bacterial infection confirmed.
Platelet <20,000 OR Bleeding: REFER IMMEDIATELY for platelet transfusion.
CHILDREN: Syp Panadol DS (Paracetamol) TDS/QID per weight + ORS + Oral fluids pushed aggressively
INVESTIGATIONS: CBC with Platelets (serial), Dengue NS1 (Day 1-5), Dengue IgM/IgG (Day 5+), LFTs, UCE

=== CHICKEN POX (VARICELLA) ===
ADULTS: 1.Tab Acyclovir 800mg (Acylex/Zovirax) 5x/day x 7 days (start within 24-48 hrs of rash) 2.Tab Paracetamol (Panadol) TDS for fever 3.Tab Levocetirizine 5mg (Belair/Xyzal) OD for itching 4.Calamine Lotion topically TDS for lesions
CHILDREN: Syp Acyclovir 20mg/kg/dose (Acylex DS) QID x 5 days + Syp Panadol DS TDS + Calamine Lotion topically. NO ASPIRIN (Reye's syndrome risk)
NOTE: NO antibiotics unless secondary bacterial skin infection. ISOLATE for 7 days or until all lesions crust over.

=== MIGRAINE / HEADACHE ===
ACUTE ATTACK: 1.Tab Sumatriptan 50mg (Imitrex/Sumiget) stat at onset OR Tab Ergotamine+Caffeine (Cafergot) 1-2 tabs stat 2.Tab Naproxen Sodium 550mg (Synflex) stat OR Tab Ibuprofen 400mg (Brufen) stat (take early) 3.Tab Metoclopramide 10mg (Maxolon) if nausea/vomiting associated
PREVENTION (≥3 attacks/month): 1.Tab Propranolol 40mg (Inderal) BD 2.Tab Amitriptyline 10mg OD HS (low dose) 3.Tab Topiramate 25mg (Topamax/Topiramax) OD — titrate
TENSION HEADACHE: Tab Paracetamol (Panadol) 500mg-1g TDS PRN + Tab Ibuprofen (Brufen) 400mg BD + Stress management
NOTE: NO opioids as first line. Identify triggers (stress, sleep, food).

=== BACK PAIN / LUMBAGO / MUSCULOSKELETAL PAIN ===
ACUTE (≤6 weeks): 1.Tab Diclofenac Sodium 50mg (Voren/Voltral) BD with food x 5-7 days OR Tab Etoricoxib 60/90mg (Arcoxia/Etorie) OD (GI-friendly) 2.Tab Tizanidine 2mg (Movax/Musidin) OD HS OR Tab Cyclobenzaprine 5mg OD HS (muscle relaxant) 3.Cap Omeprazole 20mg (Risek/Lopraz) OD (gastric protection with NSAIDs)
CHRONIC (>6 weeks): 1.Cap Pregabalin 75mg (Gabica/Prelin) BD 2.Tab Diclofenac Sodium 50mg BD (PRN) with PPI cover 3.Cap/Tab Mecobalamin 500mcg (Methycobal) BD 4.Physiotherapy referral
ADVICE: Hot pack, rest, avoid heavy lifting, physiotherapy. Refer if neurological symptoms (weakness, bowel/bladder).

=== GOUT / HYPERURICEMIA ===
ACUTE ATTACK: 1.Tab Indomethacin 25mg (Indocid) TDS x 5-7 days OR Tab Colchicine 0.5mg BD x 3-5 days 2.Tab Etoricoxib 120mg (Arcoxia) OD x 5-7 days (alternative, GI-friendly) 3.Cap Omeprazole 20mg (Risek) OD (with NSAIDs)
MAINTENANCE (after acute settles): 1.Tab Allopurinol 100mg (Zyloric) OD — start ONLY when acute attack resolved (increase to 300mg) 2.Tab Febuxostat 40-80mg (Zurig) OD (alternative to Allopurinol)
DIET: Avoid red meat, organ meats, shellfish, beer. Increase water intake >2L/day.
INVESTIGATIONS: Serum Uric Acid, UCE, CBC, Joint Aspiration (if unclear)

=== HYPOTHYROIDISM ===
1.Tab Levothyroxine (Euthyrox/Oroxine/T4) 25-50mcg OD fasting morning — titrate based on TSH every 6-8 weeks 2.Tab Calcium (Osteocare/Calcibon) 1 tab OD (separate from Levothyroxine by 4 hrs)
NOTE: Start low in elderly/cardiac patients (25mcg). Take on empty stomach 30 min before breakfast. NO interaction with iron/calcium/antacids (4hr gap).
INVESTIGATIONS: TSH, Free T4, Free T3, Anti-TPO antibodies, CBC, Lipid Profile, ECG

=== HYPERTHYROIDISM / THYROTOXICOSIS ===
1.Tab Carbimazole (Neo-Mercazole/Carbimid) 5-10mg TDS (initially) then taper 2.Tab Propranolol 40mg (Inderal) BD-TDS (for symptomatic control — tremors, palpitations, HR) 3.Cap Omeprazole 20mg (Risek) OD
REFER to Endocrinology. INVESTIGATIONS: TSH, Free T4, Free T3, Anti-TSH receptor Ab, Thyroid U/S, Thyroid scan

=== ACNE VULGARIS ===
MILD (comedones only): 1.Benzoyl Peroxide 2.5-5% gel (Benzac/Panoxyl) OD-BD 2.Adapalene 0.1% gel (Adapco) OD at night x 2-3 months 3.Gentle non-comedogenic cleanser (Cetaphil/CeraVe)
MODERATE (papules/pustules): 1.Topical Clindamycin 1%+Benzoyl Peroxide gel (Duac/Benclin) OD-BD 2.Tab Doxycycline 100mg (Doxyn/Vibramycin) OD x 6-8 weeks 3.Adapalene gel (Adapco) OD at night
SEVERE (nodular/cystic): 1.Tab Isotretinoin 20mg (Arynoin) 0+0+1 x 4-6 months (dermatologist supervised) 2.Monthly LFTs and lipid profile monitoring
NOTE: NO systemic steroids for acne. AVOID in pregnancy (Isotretinoin Category X). SPF sunscreen daily.

=== WOUND CARE / SUPERFICIAL LACERATION ===
1.Cap Co-Amoxiclave 625mg (Augmentin/Amclave) BD x 5-7 days (if contaminated/bite wound) 2.Tab Metronidazole 400mg (Flagyl) TDS x 5 days (add if dirty wound/bite) 3.Tab Ibuprofen 400mg (Brufen) TDS OR Tab Diclofenac 50mg (Voren) BD for pain 4.Cap Omeprazole 20mg (Risek) OD (with NSAIDs)
CLEAN WOUNDS: Wound irrigation + antiseptic (Betadine/savlon) + dressing — NO antibiotics unless high risk.
TETANUS: Check immunization status → give TT injection if not vaccinated/unknown.
NOTE: Bites (human/animal/dog) — always give antibiotics + rabies assessment.

=== BURNS (MINOR — SUPERFICIAL) ===
1.Cool running water 20 min immediately 2.Silver Sulfadiazine Cream 1% (Silverex/Flamazine) apply BD after gentle cleaning 3.Tab Ibuprofen 400mg (Brufen) TDS OR Tab Paracetamol (Panadol) TDS for pain 4.Cap Co-Amoxiclave 625mg (Augmentin) BD x 5 days (if infected/dirty)
NOTE: REFER if >10% BSA, full thickness, face/hands/genitals/joints involved, circumferential, or inhalation injury.

=== SPRAIN / STRAIN / SOFT TISSUE INJURY ===
1.Tab Diclofenac Sodium 50mg (Voren/Voltral) BD with food x 5-7 days OR Tab Etoricoxib 60mg (Arcoxia) OD 2.Tab Tizanidine 2mg (Movax) OD HS 3.Cap Omeprazole 20mg (Risek) OD (gastric cover)
TOPICAL: Diclofenac Gel (Voveran Gel/Voltral Gel) apply TDS to affected area
RICE: Rest, Ice, Compression, Elevation. Physiotherapy after acute phase.

=== CELLULITIS / SKIN INFECTION ===
MILD-MODERATE: 1.Tab Co-Amoxiclave 625mg (Augmentin/Amclave) BD-TDS x 7-10 days 2.Tab Diclofenac Sodium 50mg (Voren) BD for pain/inflammation 3.Cap Omeprazole 20mg (Risek) OD
SEVERE: Inj Ceftriaxone 1-2g (Titan/Rocephin) IV OD + Inj Metronidazole 500mg (Flagyl IV) TDS → Step down to oral when improved
Mark border of erythema with pen to monitor spread. ELEVATE limb. Tetanus toxoid if open wound.

=== FUNGAL SKIN INFECTION (TINEA / RINGWORM / ATHLETE'S FOOT) ===
LOCALISED: 1.Terbinafine Cream (Terbiderm/Terbisil) apply BD x 2-4 weeks OR Clotrimazole 1% Cream (Canesten/Daktarin) BD x 3-4 weeks 2.Tab Terbinafine 250mg (Terbiderm oral) OD x 2-4 weeks (for extensive/scalp/nail)
EXTENSIVE/RECURRENT: 1.Tab Itraconazole 200mg (Sporanox/Icon) OD x 7 days (pulse therapy) 2.Ketoconazole Shampoo (Conaz/Nizoral) BD for scalp tinea (leave 5 min then rinse)
NOTE: Keep area dry. Avoid sharing towels. Continue treatment 1 week after lesions clear.

=== PITYRIASIS VERSICOLOR (WHITE PATCHES — TINEA VERSICOLOR) ===
1.Ketoconazole Shampoo (Conaz/Nizoral) — apply to body, leave 5 min, rinse. OD x 3-4 weeks 2.Selenium Sulfide Lotion (Selsun Blue) — apply body, leave 10 min, rinse. OD x 3-4 weeks 3.Tab Itraconazole 200mg (Sporanox/Icon) OD x 7 days (if extensive)
NOTE: Pigmentation may take months to normalize even after treatment — reassure patient.

=== ECZEMA / ATOPIC DERMATITIS ===
MILD: 1.Hydrocortisone 1% Cream BD x 7-10 days (short course only) 2.Tab Levocetirizine 5mg (Belair/Xyzal) OD HS for itching 3.Emollient (Vaseline/Cetaphil cream) apply generously BD
MODERATE-SEVERE: 1.Betamethasone 0.1% Cream (Betnovate/Dermovate) BD x 7-10 days (taper to OD then stop) 2.Tab Levocetirizine 5mg OD HS 3.Emollient liberally BD-TDS 4.If secondary infection: Cap Co-Amoxiclave (Augmentin) BD x 5 days
NOTE: Avoid triggers (soaps, detergents, heat). Long-term topical steroid use causes skin atrophy.

=== PSORIASIS ===
MILD-MODERATE: 1.Betamethasone+Salicylic Acid Ointment (Betasalic/Provate-S) BD to plaques 2.Tab Levocetirizine 5mg (Belair) OD HS 3.Coal Tar Shampoo (Polytar) for scalp involvement
MODERATE-SEVERE: 1.Tab Methotrexate 7.5-15mg once weekly (Unitrexate) — LFTs monthly 2.Folic acid 5mg OD (except day of Methotrexate)
REFER to dermatology for moderate-severe. AVOID: NSAIDs, lithium, beta-blockers (triggers).

=== OSTEOPOROSIS / BONE LOSS ===
1.Tab/Cap Calcium+Vit D3 (Osteocare/Calcibon/Ostibon Plus) OD-BD 2.Tab Alendronate Sodium 70mg (Drat 70mg) once weekly on empty stomach — remain upright 30 min 3.Inj Cholecalciferol (Indrop-D/Miura-D) IM once monthly if Vit D deficient
INVESTIGATIONS: DEXA scan, Vit D levels, Serum Calcium, PTH

=== GOUT ARTHRITIS / JOINT PAIN (CHRONIC) ===
1.Tab Allopurinol 100-300mg (Zyloric) OD — start after acute attack subsides 2.Tab Etoricoxib 60mg (Arcoxia/Etorie) OD PRN (for flares) 3.Tab Omeprazole 20mg (Risek) OD (with NSAIDs) 4.Colchicine 0.5mg BD prophylaxis for first 6 months of urate-lowering therapy
`;

const DRUGS=[
{name:"Levofloxacin",brand:"Leflox, Qumic, Cravit",dose:"250/500mg OD/BD",se:"GI upset, tendinopathy, QT prolongation, CNS",ci:"Pregnancy, children <18, tendinopathy history"},
{name:"Cefixime",brand:"Cefspan, Cefiget, Cefget",dose:"200/400mg OD/BD",se:"GI upset, rash, diarrhea",ci:"Cephalosporin allergy"},
{name:"Amoxicillin-Clavulanate",brand:"Augmentin, Amclave, Amoxiclave DS, Augmentin DS",dose:"375/625mg/1g TDS/BD",se:"GI upset, diarrhea, rash, cholestatic jaundice",ci:"Penicillin allergy, hepatic disease"},
{name:"Azithromycin",brand:"Zetro, Bectizith, Azomax, Macrobac",dose:"250/500mg OD x3-5 days",se:"GI upset, QT prolongation",ci:"QT prolongation, hepatic disease"},
{name:"Clarithromycin",brand:"Klaricid, Claritek, Claribid",dose:"250/500mg BD",se:"GI upset, QT prolongation, bitter taste",ci:"QT prolongation, hepatic failure"},
{name:"Ciprofloxacin",brand:"Novidat, Cifran, Ciproxen, Mytill",dose:"250/500mg BD (Syp for children)",se:"GI upset, tendinopathy, photosensitivity",ci:"Pregnancy, avoid in children if possible"},
{name:"Moxifloxacin",brand:"Cefiget 400mg, Maxlox",dose:"400mg OD",se:"GI upset, QT prolongation, hepatotoxicity",ci:"QT prolongation, pregnancy"},
{name:"Metronidazole",brand:"Flagyl, Klint, Metrozine",dose:"400mg TDS x5-7 days",se:"Metallic taste, nausea, peripheral neuropathy",ci:"1st trimester pregnancy, avoid alcohol"},
{name:"Doxycycline",brand:"Doxyn, Vibramycin",dose:"100mg BD",se:"GI upset, photosensitivity, esophageal ulcer",ci:"Pregnancy, children <8 years"},
{name:"Mefenamic Acid",brand:"Ponstan, Ponstan forte, Mefnac, Dollor, Mefnac DS",dose:"250/500mg TDS/BD with food",se:"GI irritation, peptic ulcer, renal impairment",ci:"Peptic ulcer, renal failure, pregnancy 3rd tri"},
{name:"Diclofenac Sodium",brand:"Voren, Voltral, Dicloran",dose:"50/100mg BD with food",se:"GI irritation, fluid retention, CV risk",ci:"Peptic ulcer, renal impairment, pregnancy"},
{name:"Ibuprofen",brand:"Brufen, Brufen DS syrup, Brufen plus",dose:"200-600mg TDS with food",se:"GI irritation, renal impairment",ci:"Peptic ulcer, renal failure, pregnancy 3rd tri"},
{name:"Naproxen",brand:"Neoprox, Flexin",dose:"250/500mg BD",se:"GI upset, headache, fluid retention",ci:"Peptic ulcer, renal failure, pregnancy"},
{name:"Aceclofenac",brand:"Acenac 100mg, Acelo",dose:"100mg BD",se:"GI irritation, headache",ci:"Peptic ulcer, renal/hepatic failure, pregnancy"},
{name:"Paracetamol",brand:"Panadol, Calpol, Panadol DS, Calpol Plus (syrups)",dose:"500mg-1g TDS/QID PRN",se:"Hepatotoxicity in overdose only",ci:"Severe hepatic failure"},
{name:"Domperidone",brand:"Motilium Tab 10mg, Motilium Syp 1mg/ml",dose:"10mg TDS 30min before meals",se:"QT prolongation rare, galactorrhea",ci:"Cardiac arrhythmias, GI hemorrhage, prolactinoma"},
{name:"Omeprazole",brand:"Risek, Lopraz, Zoltar, Losec, Omezol, Ruling",dose:"20-40mg OD before meal",se:"Headache, GI upset, hypomagnesemia long-term",ci:"Clopidogrel (use esomeprazole instead)"},
{name:"Esomeprazole",brand:"Nexum, Esso, Nexo",dose:"20-40mg OD before meal",se:"Headache, GI upset",ci:"Hypersensitivity to PPIs"},
{name:"Dexlansoprazole",brand:"Razodex 30mg/60mg",dose:"30-60mg OD before meal",se:"Headache, diarrhea, nausea",ci:"Hypersensitivity"},
{name:"Levosulpride",brand:"Levopraid 25/50mg, Scipride",dose:"25-50mg BD 30min before meal",se:"Drowsiness, EPS, galactorrhea, QT prolongation",ci:"GI hemorrhage, epilepsy, pheochromocytoma"},
{name:"Itopride",brand:"Ganaton 50mg, Itoprab",dose:"50mg TDS 30min before meal",se:"Diarrhea, abdominal pain, headache",ci:"GI hemorrhage, obstruction"},
{name:"Escitalopram",brand:"Estar, Citanew, Lexapro, Nexito, Depsit",dose:"5-20mg OD morning",se:"Nausea, insomnia, sexual dysfunction, QT prolongation",ci:"MAOIs, QT prolongation"},
{name:"Sertraline",brand:"Sert, Zoloft",dose:"50-100mg OD morning",se:"Nausea, diarrhea, insomnia, sexual dysfunction",ci:"MAOIs within 14 days"},
{name:"Alprazolam",brand:"Xanax, Alzam 0.25/0.5mg",dose:"0.25-0.5mg BD PRN max 4 weeks",se:"Sedation, dependence, memory impairment",ci:"Myasthenia gravis, severe respiratory disease"},
{name:"Sodium Acid Citrate",brand:"Citralka",dose:"2-3tsp in glass water BD/TDS",se:"GI upset, hypernatremia if excess",ci:"Renal failure, sodium restricted diet"},
{name:"Cranberry sachets",brand:"Cranmax pro sachets, Cenova (Getz), Cranmax aqua (Hilton)",dose:"1 sachet glass water BD/OD",se:"Mild GI upset",ci:"Oxalate kidney stones"},
{name:"Fexofenadine",brand:"Fexet 60/120/180mg, Telfast, FEEET",dose:"60-180mg OD",se:"Headache, minimal drowsiness",ci:"Severe renal impairment"},
{name:"Fexofenadine+Pseudoephedrine",brand:"Fexet-D, Telfast-D, FEEET-D",dose:"60+120mg OD",se:"Insomnia, palpitations, dry mouth, hypertension",ci:"Hypertension, CAD, hyperthyroidism, pregnancy"},
{name:"Loratadine",brand:"Softin 10mg, Lorin NSA, Clarityne",dose:"10mg OD",se:"Minimal drowsiness, headache",ci:"None significant"},
{name:"Montelukast",brand:"Montiget 10mg, Mytika, Singulair",dose:"10mg OD HS",se:"Headache, GI upset, mood changes",ci:"None significant"},
{name:"Mebeverine",brand:"Colofac 135mg, Spasler-P 135mg, Despas MR 200mg",dose:"135-200mg TDS/BD 30min before meal",se:"Rare: dizziness, rash",ci:"None significant"},
{name:"Mesalazine",brand:"Masacol 400/800mg, Pentasa",dose:"400-800mg TDS/OD",se:"Headache, nausea, diarrhea, rash",ci:"Salicylate allergy, severe renal/hepatic impairment"},
{name:"Prednisolone",brand:"Deltacortril 5mg",dose:"Tapering dose as directed",se:"Hyperglycemia, HTN, osteoporosis, weight gain, immunosuppression",ci:"Active infection without cover, peptic ulcer"},
{name:"Lactulose",brand:"Duphalac, Lilac",dose:"15-60ml OD/BD",se:"Flatulence, cramping, diarrhea if excess",ci:"Galactosaemia"},
{name:"Artemether+Lumefantrine",brand:"Artem DS 40/240mg, Artheget, Artem DS Plus 80/480mg",dose:"BD/TDS as directed",se:"Nausea, vomiting, headache, QT prolongation",ci:"1st trimester pregnancy — caution"},
{name:"Glimepiride",brand:"Getryl 2/4mg, Amaryl",dose:"2-4mg OD before breakfast",se:"Hypoglycemia, weight gain, rash",ci:"Type 1 DM, renal/hepatic failure, pregnancy"},
{name:"Metformin",brand:"Glucophage, Neophage 500/750mg",dose:"500-1000mg BD with meals",se:"GI upset, metallic taste, B12 deficiency",ci:"eGFR<30, hepatic failure, IV contrast"},
{name:"Glibenclamide",brand:"Daonil 5mg",dose:"5mg OD/BD before meals",se:"Prolonged hypoglycemia, weight gain",ci:"Renal/hepatic failure, elderly"},
{name:"Sitagliptin",brand:"Trevia 100mg, Januvia",dose:"100mg OD",se:"Nasopharyngitis, pancreatitis rare",ci:"Type 1 DM, pancreatitis history"},
{name:"Dapagliflozin",brand:"Dapa, Forxiga",dose:"10mg OD",se:"UTI, DKA rare, dehydration",ci:"Type 1 DM, eGFR<45"},
{name:"Empagliflozin",brand:"Xenglu, Jardiance",dose:"10-25mg OD",se:"UTI, DKA rare, dehydration",ci:"Type 1 DM, eGFR<45"},
{name:"Pregabalin",brand:"Gabica 50/75/100mg, Lyrica",dose:"50-150mg BD/TDS",se:"Dizziness, somnolence, weight gain",ci:"Severe renal impairment — dose adjust"},
{name:"Gabapentin",brand:"Gabix 100/300mg, Neurontin",dose:"100-300mg TDS",se:"Dizziness, somnolence, ataxia",ci:"Severe renal impairment — dose adjust"},
{name:"Sofosbuvir",brand:"Sofomac, Sofohil, Sofiget 400mg",dose:"400mg OD",se:"Fatigue, headache, nausea",ci:"Severe renal impairment with ribavirin"},
{name:"Daclatasvir",brand:"Maclinza, Clavir, Daclaget 60mg",dose:"60mg OD",se:"Headache, fatigue, nausea",ci:"Strong CYP3A4 inducers"},
{name:"Tenofovir",brand:"Tenofo-B, Hilfovir, Gentovir, Vireof 300mg",dose:"300mg OD",se:"Renal impairment, Fanconi, bone density loss",ci:"Severe renal impairment"},
{name:"Entecavir",brand:"Ecavir 0.5mg, Tacavir 0.5/1mg",dose:"0.5-1mg OD",se:"Headache, fatigue, nausea",ci:"Severe renal impairment — dose adjust"},
{name:"Carvedilol",brand:"Carvida 6.5mg, Coreg",dose:"6.25-25mg BD",se:"Dizziness, fatigue, bradycardia, hypotension",ci:"Severe asthma, bradycardia, heart block"},
{name:"Spironolactone",brand:"Aldactone 100mg",dose:"25-100mg OD max 400mg",se:"Hyperkalemia, gynecomastia, menstrual irregularity",ci:"Hyperkalemia, renal failure, pregnancy"},
{name:"Furosemide",brand:"Lasix 20/40mg",dose:"20-40mg BD",se:"Hypokalemia, hyponatremia, dehydration, ototoxicity",ci:"Anuria, sulfa allergy"},
{name:"Lisinopril",brand:"Zestril 2.5/5/10/20mg",dose:"5-20mg OD/BD",se:"Dry cough, hyperkalemia, angioedema, dizziness",ci:"Pregnancy, bilateral renal artery stenosis, angioedema history"},
{name:"Atorvastatin",brand:"Lipiget 10/20mg, Lipitor, Atocor",dose:"10-40mg OD HS",se:"Myalgia, elevated LFTs, rhabdomyolysis rare",ci:"Hepatic disease, pregnancy"},
{name:"Clopidogrel",brand:"Noclot 75mg, Lowplat, Plavix",dose:"75mg OD",se:"Bleeding, GI upset, rash",ci:"Active bleeding, severe hepatic impairment"},
{name:"Clindamycin",brand:"Delacin-C 150/300mg, Dalacin",dose:"150-300mg BD/TDS",se:"GI upset, C.difficile colitis",ci:"C.difficile colitis history"},
{name:"Fluconazole",brand:"Diflucan 100/150mg",dose:"150mg stat OR 100mg OD",se:"GI upset, headache, rash, hepatotoxicity",ci:"QT prolongation, hepatic disease"},
{name:"Clotrimazole vaginal",brand:"Canesten vaginal cream/tablet",dose:"1 pessary OD or cream BD",se:"Local irritation, burning",ci:"Known hypersensitivity"},
{name:"Neurobion",brand:"Neurobion B1+B6+B12, Bevidox",dose:"1 tab BD",se:"Generally safe",ci:"None significant"},
{name:"L-methylfolate",brand:"Myfol, Maxfol, Folate 400mcg",dose:"400mcg OD",se:"Generally safe",ci:"None significant"},
{name:"Lysovit / Tresorix",brand:"Lysovit syrup, Leaderplex, Tresorix forte, Glyvesol",dose:"2 tsp BD/OD",se:"Generally safe",ci:"None significant"},
{name:"Fefolvit / Iberet Folic",brand:"Fefolvit cap, Iberet Folic, Maltofer syrup",dose:"OD or BD",se:"GI upset, dark stools, constipation",ci:"Iron overload, hemochromatosis"},
{name:"Levosulpride",brand:"Levopraid 25/50mg, Scipride",dose:"25-50mg BD 30min before meal",se:"Drowsiness, EPS, galactorrhea",ci:"GI hemorrhage, epilepsy"},
{name:"Nitazoxanide",brand:"Izato 100mg",dose:"100mg BD with food",se:"Nausea, abdominal pain, headache",ci:"Hepatic impairment"},
{name:"Tinidazole",brand:"Fasygen 200mg",dose:"2g OD for 2-3 days",se:"Metallic taste, nausea",ci:"1st trimester pregnancy, alcohol"},

// ── Dermatology (from images) ──
{name:"Ketoconazole Cream",brand:"Conaz, Nizoral",dose:"Apply twice daily x 7-10 days",se:"Skin irritation, burning",ci:"Hypersensitivity to ketoconazole"},
{name:"Itraconazole",brand:"Sporanox, Icon",dose:"100mg BD x 7-10 days then monthly x 6 months",se:"GI upset, hepatotoxicity, QT prolongation",ci:"Hepatic disease, pregnancy, QT prolongation"},
{name:"Selenium Sulfide",brand:"Selsun Blue shampoo",dose:"Apply body head to toe, leave 2-3 min, rinse",se:"Skin irritation, hair discoloration",ci:"Hypersensitivity, broken skin"},
{name:"Miconazole + Gentamicin + Betamethasone Cream",brand:"Micogen-B",dose:"Topical application BD",se:"Skin atrophy, telangiectasia with prolonged use",ci:"Viral/fungal superinfection, pregnancy"},
{name:"Betamethasone + Neomycin + Miconazole Cream",brand:"Betaderm NM",dose:"Topical application BD",se:"Skin atrophy, adrenal suppression",ci:"Viral infections, rosacea, prolonged use"},
{name:"Terbinafine",brand:"Terbiderm, Terbisil",dose:"125-250mg OD x 2-4 weeks",se:"GI upset, headache, hepatotoxicity rare",ci:"Hepatic disease, chronic/active liver disease"},
{name:"Terbinafine Cream",brand:"Terbiderm, Terbisil cream",dose:"Apply OD/BD to affected area",se:"Burning, itching, skin irritation",ci:"Hypersensitivity to terbinafine"},
{name:"Levocetirizine",brand:"Belair, Xyzal",dose:"5mg OD",se:"Drowsiness, dry mouth, fatigue",ci:"Severe renal impairment, child <2yr"},
{name:"Clobetasol Propionate 0.05% Ointment",brand:"Clobevate, Dermovate, Clobederm",dose:"Apply BD (1+0+1)",se:"Skin atrophy, telangiectasia, adrenal suppression",ci:"Viral/fungal infections, rosacea, acne"},
{name:"Betamethasone Dipropionate + Salicylic Acid Ointment",brand:"Betasalic, Provate-S, Novsali",dose:"Apply BD",se:"Skin atrophy, salicylate toxicity",ci:"Viral infections, broken skin, large areas"},
{name:"Petroleum Jelly",brand:"Vaseline, generic",dose:"Apply BD (1+0+1)",se:"None significant",ci:"None significant"},
{name:"Tazarotene 0.1%",brand:"Trazene Gel, Tazret, Azoten cream",dose:"Apply BD (1+0+1)",se:"Skin irritation, burning, dryness, photosensitivity",ci:"Pregnancy (Category X), breastfeeding"},
{name:"Methotrexate",brand:"Unitrexate",dose:"2.5mg every 3rd day",se:"Hepatotoxicity, bone marrow suppression, mucositis",ci:"Pregnancy, breastfeeding, hepatic/renal failure"},
{name:"Miconazole Cream 2%",brand:"Daktarin, Mycon",dose:"Apply twice daily",se:"Skin irritation, burning",ci:"Hypersensitivity to miconazole"},
{name:"Clobetasol Cream",brand:"Clobevate, Dermovate",dose:"Apply twice daily",se:"Skin atrophy, adrenal suppression",ci:"Viral/fungal infections, rosacea"},
{name:"Ketaconazole Lotion 20mg/60ml",brand:"Conaz shampoo, Ketowin",dose:"Apply to scalp, lather 5 min, rinse",se:"Skin irritation, oiliness",ci:"Hypersensitivity"},
{name:"Permethrin 5% Cream/Lotion",brand:"Lotrix, Mitonil",dose:"Apply below collar line, leave overnight, bath Day-3",se:"Skin irritation, burning, pruritus",ci:"Hypersensitivity, infants <2 months"},
{name:"Acyclovir",brand:"Acylex, Zovirax",dose:"400-800mg BD/TDS/QID",se:"GI upset, headache, crystal nephropathy — increase fluid intake",ci:"Renal failure (adjust dose), hypersensitivity"},
{name:"Acyclovir Ointment",brand:"Acylex ointment, Zovirax ointment",dose:"Apply BD to affected site",se:"Burning, stinging, skin irritation",ci:"Hypersensitivity to acyclovir"},
{name:"Benzoyl Peroxide + Clindamycin",brand:"Duac gel, Benclin Gel",dose:"Apply 0+0+1",se:"Dryness, peeling, erythema",ci:"Hypersensitivity, avoid eyes/mucous membranes"},
{name:"Minocycline",brand:"Minoderm 100mg",dose:"100mg 1+0+1",se:"Photosensitivity, GI upset, dizziness, staining teeth",ci:"Pregnancy, children <8yr, hepatic failure"},
{name:"Isotretinoin Gel",brand:"Isotrex, Cosmin",dose:"Apply 0+0+1 x 2-3 months",se:"Dryness, irritation, photosensitivity",ci:"Pregnancy (teratogenic), breastfeeding"},
{name:"Doxycycline 100mg",brand:"Vibramycin, Doxyn",dose:"100mg BD x 3-4 weeks",se:"GI upset, photosensitivity, esophageal ulcer",ci:"Pregnancy, children <8yr"},
{name:"Adapalene Gel/Cream",brand:"Adapco gel",dose:"Apply 0+0+1 x 2-3 months",se:"Dryness, burning, photosensitivity",ci:"Pregnancy, eczema, sunburned skin"},
{name:"Isotretinoin Capsule",brand:"Arynoin 20mg",dose:"20mg 0+0+1 x 2-3 months",se:"Teratogenicity, dry lips/skin, hepatotoxicity, depression",ci:"Pregnancy (must use contraception), breastfeeding"},

// ── Bones & Joints ──
{name:"Feboxistate",brand:"Zurig 40mg/80mg",dose:"40-80mg twice daily",se:"Liver enzyme elevation, joint pain, rash",ci:"Hypersensitivity, severe renal failure"},
{name:"Prednisolone",brand:"Deltacortril 5mg",dose:"5mg — tapering dose (3 tabs TDS → taper)",se:"Adrenal suppression, hyperglycemia, osteoporosis",ci:"Active infection, live vaccines"},
{name:"Allopurinol",brand:"Zyloric 100mg/300mg",dose:"100-300mg OD",se:"Rash, GI upset, Steven-Johnson syndrome rare",ci:"Acute gout attack (do not start), azathioprine use"},
{name:"Leflonamide",brand:"Lefona, Lefora 10mg/20mg",dose:"10-20mg twice daily",se:"Hepatotoxicity, diarrhea, hypertension",ci:"Pregnancy, hepatic disease, immunodeficiency"},
{name:"Celecoxib",brand:"Celbexx, Seleco 100mg/200mg",dose:"100-200mg BD",se:"GI upset (less than NSAIDs), CV risk, fluid retention",ci:"Sulfonamide allergy, severe heart failure, peptic ulcer"},
{name:"Naproxen Sodium",brand:"Synflex, Neoprox 250mg/500mg/550mg",dose:"250-550mg BD",se:"GI irritation, fluid retention, renal impairment",ci:"Peptic ulcer, renal failure, pregnancy 3rd tri"},
{name:"Hydroxychloroquine",brand:"Tab HCQ 200mg",dose:"200mg OD/BD",se:"Retinopathy (eye check every 6 months), GI upset",ci:"Retinal disease, G6PD deficiency"},
{name:"Piroxicam",brand:"Feldine, Cap Piroxicam 20mg",dose:"20mg BD",se:"GI irritation, fluid retention, renal impairment",ci:"Peptic ulcer, renal failure, heart failure"},
{name:"Lornoxicam",brand:"Xikarapid, Acabel 4mg/8mg",dose:"4-8mg BD",se:"GI upset, headache, fluid retention",ci:"Peptic ulcer, renal failure, pregnancy"},
{name:"Dexamethasone",brand:"Oradexon, Kanadex",dose:"0.5-9mg OD (tapering)",se:"Adrenal suppression, hyperglycemia, osteoporosis",ci:"Active infection, live vaccines"},
{name:"Cartigen Plus",brand:"Cartigen Plus",dose:"1 tab BD",se:"Generally safe, mild GI upset",ci:"Shellfish allergy (glucosamine)"},
{name:"Gevolox Plus",brand:"Gevolox Plus",dose:"1 tab BD",se:"Generally safe, mild GI upset",ci:"None significant"},
{name:"Inj Cholechalceferol",brand:"Indrop-D, Miura-D",dose:"Once weekly/fortnightly as per Vit D level",se:"Hypercalcemia in overdose",ci:"Hypercalcemia, hypervitaminosis D"},
{name:"Tab Osteocare",brand:"Osteocare",dose:"1 tab OD",se:"GI upset, constipation",ci:"Hypercalcemia, renal stones"},
{name:"Alendronate Sodium",brand:"Drat 70mg",dose:"Once weekly on empty stomach",se:"Esophagitis, jaw osteonecrosis, musculoskeletal pain",ci:"Esophageal disorders, inability to sit upright 30 min"},
{name:"Tab Avelia / Ostibon Plus",brand:"Avelia, Ostibon Plus",dose:"1 tab OD",se:"GI upset, constipation",ci:"Hypercalcemia"},

// ── Neurology/Neurosurgery ──
{name:"Pregabalin",brand:"Gabica, Prelin, Zeegap 50mg/75mg/100mg",dose:"50-100mg BD/OD",se:"Dizziness, somnolence, weight gain, edema",ci:"Renal failure (adjust dose), pregnancy"},
{name:"Mecobalamin",brand:"Methycobal, Cobalamin 500mcg",dose:"500mcg BD",se:"Generally safe, mild GI upset",ci:"None significant"},
{name:"Tramol SR",brand:"Tramol SR 100mg",dose:"100mg 0+0+1",se:"Nausea, dizziness, constipation, dependence",ci:"Seizures, MAOIs, severe respiratory depression"},
{name:"Lacosamide",brand:"Lalap, Lecolep 50mg/100mg",dose:"50-100mg BD",se:"Dizziness, diplopia, nausea, PR interval prolongation",ci:"2nd/3rd degree AV block"},
{name:"Tizanidine",brand:"Movax, Musidin, Ternalin 2mg/4mg",dose:"2-4mg BD/OD",se:"Drowsiness, dry mouth, hypotension",ci:"Ciprofloxacin use, fluvoxamine use, hepatic disease"},
{name:"Diclofenac Sodium 50mg/100mg",brand:"Voren, Voltral 50mg",dose:"50mg BD",se:"GI irritation, renal impairment, CV risk",ci:"Peptic ulcer, renal failure, pregnancy"},
{name:"Carbidopa + Levodopa",brand:"Sinemet, Neudopa",dose:"Start low, titrate gradually (taken 30 min before meals)",se:"Dyskinesia, nausea, orthostatic hypotension",ci:"MAOIs, narrow-angle glaucoma"},
{name:"Procyclidine",brand:"Kamadrin, Kampro 5mg",dose:"5mg OD/BD",se:"Dry mouth, blurred vision, urinary retention, confusion",ci:"Glaucoma, urinary retention, GI obstruction"},
{name:"Amantadine",brand:"PK Merz, Amanta 100mg",dose:"100mg BD/TDS",se:"Livedo reticularis, edema, confusion",ci:"Seizure disorder, renal failure"},
{name:"Ropinirole",brand:"Ronirol, Requip, Ropinol 0.25mg/1mg/2mg",dose:"Start 0.25mg TDS, titrate weekly",se:"Nausea, dizziness, somnolence, impulse control",ci:"Pregnancy, severe renal failure"},
{name:"Memantine",brand:"Demantin, Alzagon, Afdol 5mg/10mg",dose:"5-10mg OD",se:"Dizziness, headache, constipation, confusion",ci:"Severe renal failure, seizures"},
{name:"Donepezil",brand:"Doncept, Alzex 5mg",dose:"5mg OD",se:"GI upset, insomnia, bradycardia",ci:"Sick sinus syndrome, peptic ulcer"},
{name:"Ginkgo Biloba",brand:"Ginbex, Tanakan, Ginkosen 40mg",dose:"40mg BD or 2tsp BD syrup",se:"GI upset, headache, bleeding risk",ci:"Anticoagulants, bleeding disorders"},
{name:"Tab Neurobion / Evion 400mg",brand:"Neurobion, Evion 400mg",dose:"1 tab OD",se:"Generally safe",ci:"None significant"},

// ── Neuro-Psychiatric ──
{name:"Risperidone",brand:"Risp, Risperdal 1mg/2mg/3mg/4mg",dose:"1-4mg OD/BD",se:"EPS, weight gain, prolactin elevation, sedation",ci:"Parkinsonism, dementia with Lewy bodies"},
{name:"Haloperidol",brand:"Serenace, Dosik 1.5mg/5mg/10mg",dose:"1.5-10mg OD/BD",se:"EPS, tardive dyskinesia, QT prolongation",ci:"CNS depression, Parkinson's, QT prolongation"},
{name:"Olanzapine",brand:"Olanzia, Olepra, Nirvanol 5mg/10mg",dose:"5-10mg OD/BD",se:"Weight gain, sedation, metabolic syndrome",ci:"Dementia with Lewy bodies, angle-closure glaucoma"},
{name:"Clozapine",brand:"Saveril, Clozaril 25mg/100mg",dose:"25mg BD, titrate to 300-350mg",se:"Agranulocytosis (CBC monitoring), seizures, sedation",ci:"Bone marrow disorders, uncontrolled epilepsy"},
{name:"Clonazepam",brand:"Naze, Revotril 0.5mg/2mg",dose:"0.5-2mg OD/BD (HS)",se:"Sedation, dependence, respiratory depression",ci:"Respiratory failure, severe hepatic disease"},
{name:"Escitalopram",brand:"Estar, Citanew 5mg/10mg/20mg",dose:"5-20mg OD (morning)",se:"GI upset, insomnia, sexual dysfunction, QT prolongation",ci:"MAOIs, QT prolongation, citalopram use"},
{name:"Fluoxetine",brand:"Prozac, Flux, Depex 20mg",dose:"20mg OD after breakfast",se:"GI upset, insomnia, sexual dysfunction, agitation",ci:"MAOIs (14 day washout), thioridazine"},
{name:"Sertraline",brand:"Sert 50mg/100mg",dose:"50-100mg OD",se:"GI upset, insomnia, sexual dysfunction, serotonin syndrome",ci:"MAOIs, pimozide"},
{name:"Alprazolam",brand:"Alp, Praz, Xanax 0.25mg/0.5mg/1mg",dose:"0.25-1mg OD/BD short-term only",se:"Dependence, sedation, respiratory depression, rebound anxiety",ci:"Respiratory failure, sleep apnea, pregnancy"},
{name:"Bromazepam",brand:"Relaxin, Lexotinil 3mg",dose:"3mg OD+1",se:"Sedation, dependence, withdrawal",ci:"Respiratory failure, sleep apnea"},
{name:"Eszopiclone",brand:"Clonexa 1mg/2mg/3mg",dose:"1-3mg OD at bedtime",se:"Unpleasant taste, dizziness, dependence",ci:"Severe hepatic disease, respiratory failure"},
{name:"Zolpidem",brand:"Stillnox, Zolp, Xolnon 10mg",dose:"10mg OD at bedtime",se:"Somnambulism, amnesia, dependence",ci:"Severe hepatic disease, respiratory failure"},
{name:"Trazodone",brand:"Deprel",dose:"50-150mg at bedtime",se:"Sedation, orthostatic hypotension, priapism",ci:"Recent MI, MAOIs"},
{name:"Fluoxetine + Olanzapine",brand:"Co-Depricap 25/3mg, 25/6mg, 25/12mg",dose:"OD at HS",se:"Weight gain, sedation, metabolic syndrome",ci:"Dementia with Lewy bodies, MAOIs"},
{name:"Etazolam",brand:"Esilgon 1mg/2mg",dose:"1-2mg at night",se:"Sedation, dependence",ci:"Respiratory failure, severe hepatic disease"},
{name:"Carbamazepine",brand:"Tegrol, Seizunil 200mg/400mg",dose:"200-400mg BD/TDS",se:"Dizziness, diplopia, hyponatremia, Stevens-Johnson",ci:"Bone marrow depression, MAOIs, porphyria"},
{name:"Clomipramine",brand:"Clomfranil 10mg/25mg",dose:"10-25mg OD at night",se:"Dry mouth, constipation, sedation, cardiac arrhythmia",ci:"MAOIs, recent MI, glaucoma"},
{name:"Paroxetine",brand:"Seroxate, Paraxyl 20mg",dose:"20mg OD",se:"GI upset, sexual dysfunction, weight gain, withdrawal syndrome",ci:"MAOIs, thioridazine, pregnancy"},

// ── Opioid Withdrawal / Symptomatic ──
{name:"Clonazepam 0.5mg/2mg",brand:"Revotril, Naze",dose:"0.5-2mg OD (HS)",se:"Sedation, dependence, respiratory depression",ci:"Respiratory failure, hepatic disease"},
{name:"Domperidone Syrup/Tab",brand:"Motilium 10mg, Domel",dose:"10mg TDS 30 min before meals",se:"QT prolongation rare, galactorrhea",ci:"Cardiac arrhythmias, GI hemorrhage"},
{name:"Loperamide",brand:"Imodium 2mg",dose:"2mg x 2 SOS",se:"Constipation, abdominal cramps",ci:"Bacterial dysentery, pseudomembranous colitis"},
{name:"Tramadol",brand:"Tramol, Tonoflex 50mg/100mg",dose:"50-100mg BD/TDS",se:"Nausea, dizziness, constipation, seizure risk",ci:"Seizures, MAOIs, severe respiratory depression"},
];