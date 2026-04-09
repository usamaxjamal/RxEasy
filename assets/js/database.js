// ═══════════════════════════════════════════════
// database.js — Supabase connection, disease search,
// prescription builder from DB
//
// v2: Uses search_disease_match() RPC instead of
// fragile multi-step REST queries. Correctly handles
// the text[] aliases column in the new DB schema.
// ═══════════════════════════════════════════════

const SUPABASE_URL     = window.__RXEASY_CONFIG__.supabaseUrl;
const SUPABASE_ANON_KEY = window.__RXEASY_CONFIG__.supabaseKey;

function supabaseConfigured() {
  return SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE';
}

// ── Get the best auth token available ──────────────────────────
function getAuthToken() {
  try {
    const sess = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (sess && sess.access_token) return sess.access_token;
  } catch (_) {}
  return SUPABASE_ANON_KEY;
}

// ── Generic REST fetch ──────────────────────────────────────────
async function sbFetch(path, params) {
  params = params || '';
  const url = SUPABASE_URL + '/rest/v1/' + path + params;
  const res = await fetch(url, {
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + getAuthToken(),
    }
  });
  if (!res.ok) throw new Error('Supabase error ' + res.status);
  return res.json();
}

// ── RPC call helper ─────────────────────────────────────────────
async function sbRpc(fnName, body) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fnName, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + getAuthToken(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('RPC error ' + res.status + ': ' + err);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════════
// searchDisease(query)
//
// Uses the search_disease_match() Postgres RPC.
// Handles text[] aliases, fuzzy matching, abbreviations.
// Returns a disease object or null.
// ═══════════════════════════════════════════════════════════════
async function searchDisease(query) {
  try {
    const q = query.trim();
    if (!q) return null;

    // Single server-side RPC handles everything:
    // exact name, aliases (text[]), word overlap, trigram fuzzy
    const results = await sbRpc('search_disease_match', { search_query: q });

    if (results && results.length > 0 && results[0].match_score >= 60) {
      return results[0];
    }

    return null;
  } catch (e) {
    console.warn('[RxEasy DB] searchDisease failed:', e.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// getTreatmentFromDB(diseaseId, population)
// ═══════════════════════════════════════════════════════════════
async function getTreatmentFromDB(diseaseId, population) {
  const pops = [population, 'all'];
  const treatments = await sbFetch('disease_treatments',
    '?disease_id=eq.' + diseaseId +
    '&line=eq.first' +
    '&order=drug_order.asc' +
    '&select=*,drugs(*)');

  const mandatory = treatments.filter(function(t) {
    return pops.includes(t.population) && t.is_mandatory;
  });
  const optional = treatments.filter(function(t) {
    return pops.includes(t.population) && !t.is_mandatory;
  });
  return { mandatory: mandatory, optional: optional };
}

async function getInvestigations(diseaseId) {
  return sbFetch('investigations', '?disease_id=eq.' + diseaseId + '&order=priority.asc');
}

async function getRedFlags(diseaseId) {
  return sbFetch('red_flags', '?disease_id=eq.' + diseaseId);
}

function getPopulation() {
  if (flags.child)   return 'child';
  if (flags.preg)    return 'pregnancy';
  if (flags.elderly) return 'elderly';
  if (flags.renal)   return 'renal';
  if (flags.hepatic) return 'hepatic';
  return 'adult';
}

function calcQtyDB(freq, dur) {
  var fmap = { 'OD':1,'BD':2,'TDS':3,'QID':4 };
  var dm = dur.match(/(\d+)\s*days?/i);
  var fk = null;
  for (var k in fmap) { if (freq.includes(k)) { fk = fmap[k]; break; } }
  if (dm && fk) return ' = ' + (parseInt(dm[1]) * fk) + ' units';
  return '';
}

function formatDrugLineDB(t, idx) {
  var d = t.drugs;
  var brands = (d.brand_names || []).slice(0,2).join('/');
  var form   = t.formulation_to_use || '';
  var qtyEl  = document.getElementById('qtyT');
  var qty    = (qtyEl && qtyEl.checked) ? calcQtyDB(t.frequency, t.duration) : '';
  var sp     = t.special_instructions || '';

  // Separate food instruction from clinical note
  var foodRe = /(?:after|before|with(?:out)?)\s+(?:meal|food)/i;
  var foodNote = '';
  var clinNote = sp;
  var fm = sp.match(foodRe);
  if (fm) {
    foodNote = fm[0].charAt(0).toUpperCase() + fm[0].slice(1) + ' meal';
    clinNote  = sp.replace(foodRe, '').replace(/^\s*[,;.\-]\s*/, '').trim();
  }

  var purposePart = clinNote ? ' [' + clinNote + ']' : '';
  var line = idx + '. ' + d.generic_name + (form ? ' ' + form : '') + ' (' + brands + ')\n   ' +
             t.dose + ' | ' + t.frequency + ' | ' + t.duration + qty + purposePart;
  if (foodNote) line += '\n   ADMIN: ' + foodNote;
  return line;
}

// ═══════════════════════════════════════════════════════════════
// buildPrescriptionFromDB(query, population)
//
// Returns { structuredRx, disease } or null.
// ═══════════════════════════════════════════════════════════════
async function buildPrescriptionFromDB(query, population) {
  if (!supabaseConfigured()) return null;

  var disease;
  try { disease = await searchDisease(query); } catch(e) { return null; }
  if (!disease) return null;

  var result = await getTreatmentFromDB(disease.id, population);
  var mandatory = result.mandatory;
  var optional  = result.optional;
  if (mandatory.length === 0) return null;

  var invs = []; var rfs = [];
  try { invs = await getInvestigations(disease.id); } catch(e) {}
  try { rfs  = await getRedFlags(disease.id); } catch(e) {}

  var rx = 'DIAGNOSIS: ' + disease.name + '\n';
  if (disease.notes) rx += '\nCLINICAL NOTE: ' + disease.notes + '\n';
  rx += '\nPRESCRIPTION:\n';
  mandatory.forEach(function(t, i) { rx += formatDrugLineDB(t, i+1) + '\n'; });

  if (optional.length > 0) {
    rx += '\nCONDITIONAL (use only if specifically indicated):\n';
    optional.forEach(function(t) {
      var c = t.condition_for_use ? 'IF ' + t.condition_for_use + ': ' : 'Optional: ';
      rx += c + t.drugs.generic_name + ' (' + (t.drugs.brand_names||[]).slice(0,2).join('/') +
            ') ' + t.dose + ' ' + t.frequency + ' ' + t.duration + '\n';
    });
  }

  var invEl = document.getElementById('invT');
  if (invs.length > 0 && invEl && invEl.checked) {
    rx += '\nINVESTIGATIONS:\n';
    invs.forEach(function(inv) {
      rx += '• ' + inv.test_name + (inv.notes ? ' — ' + inv.notes : '') + '\n';
    });
  }

  var rfEl = document.getElementById('rfT');
  if (rfs.length > 0 && rfEl && rfEl.checked) {
    rx += '\nRED FLAGS (Refer if):\n';
    rfs.forEach(function(rf) {
      rx += '🚨 ' + rf.flag + (rf.action ? ' → ' + rf.action : '') + '\n';
    });
  }

  if (disease.referral_criteria) rx += '\nREFERRAL: ' + disease.referral_criteria + '\n';

  return { structuredRx: rx, disease: disease };
}
