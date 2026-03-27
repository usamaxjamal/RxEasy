// ═══════════════════════════════════════════════
// database.js — Supabase connection, disease search,
// fuzzy matching, prescription builder from DB
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// SUPABASE DATABASE ENGINE
// Step 1: Create free account at supabase.com
// Step 2: New Project → run schema SQL → run seed SQL
// Step 3: Project Settings → API → copy URL and anon key
// Step 4: Paste them into the two lines below
// ═══════════════════════════════════════════════
const SUPABASE_URL = 'https://epvfbxzuziihhcaaaizp.supabase.co';      // e.g. https://xyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdmZieHp1emlpaGhjYWFhaXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDQ2MzIsImV4cCI6MjA4OTY4MDYzMn0.Yq7vX7TWzQ-VXwHl9E4lwHhL-gbzSMKUYcd2CLT8rKw'; // starts with eyJ...

function supabaseConfigured() {
  return SUPABASE_URL !== '' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE';
}

async function sbFetch(path, params) {
  params = params || '';
  const url = SUPABASE_URL + '/rest/v1/' + path + params;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    }
  });
  if (!res.ok) throw new Error('Supabase error ' + res.status);
  return res.json();
}

// ── Fuzzy matching: Levenshtein distance between two strings ──
function levenshtein(a, b) {
  var m = a.length, n = b.length;
  var dp = [];
  for (var i = 0; i <= m; i++) {
    dp[i] = [i];
    for (var j = 1; j <= n; j++) {
      dp[i][j] = i === 0 ? j :
        a[i-1] === b[j-1] ? dp[i-1][j-1] :
        1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// Allowed typos based on word length
function fuzzyTolerance(word) {
  if (word.length <= 4) return 1;
  if (word.length <= 7) return 2;
  return 3;
}

async function searchDisease(query) {
  try {
    var q = query.toLowerCase().trim();

    // Helper: safely parse aliases whether stored as array or JSON string
    function getAliases(d) {
      if (!d.aliases) return [];
      if (Array.isArray(d.aliases)) return d.aliases;
      try { var parsed = JSON.parse(d.aliases); return Array.isArray(parsed) ? parsed : []; }
      catch(e) { return []; }
    }

    // 1. Exact ilike match on name
    var byName = await sbFetch('diseases', '?name=ilike.*' + encodeURIComponent(q) + '*&limit=5');
    if (byName && byName.length > 0) return byName[0];

    // 2. Alias search via Supabase
    var byAlias = await sbFetch('diseases', '?aliases=ilike.*' + encodeURIComponent(q) + '*&limit=5');
    if (byAlias && byAlias.length > 0) return byAlias[0];

    // 3. Fetch all for JS-side matching (Layer 3 + 4)
    var all = await sbFetch('diseases', '?limit=300');
    if (!all) return null;

    var qWords = q.split(/\s+/).filter(function(w) { return w.length > 2; });

    var scored = all.map(function(d) {
      var name = d.name.toLowerCase();
      var aliases = getAliases(d).map(function(a) { return a.toLowerCase(); });
      var allTerms = [name].concat(aliases);
      var score = 0;

      // Layer 3: exact/contains matching
      if (name === q) score = 100;
      else if (aliases.indexOf(q) !== -1) score = 90;
      else if (name.includes(q)) score = 70;
      else if (aliases.some(function(a) { return a === q || a.includes(q); })) score = 60;
      else if (qWords.length > 0) {
        var matched = qWords.filter(function(w) {
          return name.includes(w) || aliases.some(function(a) { return a.includes(w); });
        });
        if (matched.length > 0) score = Math.round((matched.length / qWords.length) * 50);
      }

      // Layer 4: fuzzy matching (typo correction) — only if Layer 3 found nothing
      if (score === 0) {
        var fuzzyScore = 0;

        // Check full query against each term
        allTerms.forEach(function(term) {
          var termWords = term.split(/\s+/);
          termWords.forEach(function(tw) {
            if (tw.length < 3) return;
            qWords.forEach(function(qw) {
              if (qw.length < 3) return;
              var dist = levenshtein(qw, tw);
              var tol  = fuzzyTolerance(qw);
              if (dist <= tol) {
                // Closer match = higher score (max 40 for fuzzy)
                var s = Math.round((1 - dist / (tol + 1)) * 40);
                if (s > fuzzyScore) fuzzyScore = s;
              }
            });
          });
        });

        score = fuzzyScore;
      }

      return { disease: d, score: score };
    });

    scored.sort(function(a, b) { return b.score - a.score; });
    var best = scored[0];
    // Minimum score of 10 to avoid wild false matches
    if (best && best.score >= 10) return best.disease;

    // TRIGRAM RPC FIX: Final fallback — call the search_diseases_trgm RPC.
    // This catches abbreviations like "GERD", "HTN", "DM", "URTI" that don't
    // fuzzy-match well in JS but resolve perfectly via Postgres trigram similarity.
    // Without this, known DB diseases fall through to AI → causing the
    // "AI-generated (add to DB for accuracy)" banner to appear incorrectly.
    try {
      var sess = JSON.parse(localStorage.getItem('sb_session') || 'null');
      var tok  = (sess && sess.access_token) ? sess.access_token : KEY;
      var rpcRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/search_diseases_trgm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': KEY,
          'Authorization': 'Bearer ' + tok
        },
        body: JSON.stringify({ search_query: q, result_limit: 3 })
      });
      if (rpcRes.ok) {
        var rpcData = await rpcRes.json();
        if (rpcData && rpcData.length > 0) return rpcData[0];
      }
    } catch(rpcErr) { /* non-critical — fall through to null */ }

    return null;

  } catch(e) { return null; }
}

async function getTreatmentFromDB(diseaseId, population) {
  const pops = [population, 'all'];
  const treatments = await sbFetch('disease_treatments',
    '?disease_id=eq.' + diseaseId + '&line=eq.first&order=drug_order.asc&select=*,drugs(*)');
  const mandatory = treatments.filter(function(t) { return pops.includes(t.population) && t.is_mandatory; });
  const optional  = treatments.filter(function(t) { return pops.includes(t.population) && !t.is_mandatory; });
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
  var sp     = t.special_instructions ? ' [' + t.special_instructions + ']' : '';
  return idx + '. ' + d.generic_name + ' ' + form + ' (' + brands + ')\n   ' +
         t.dose + ' | ' + t.frequency + ' | ' + t.duration + qty + sp;
}

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
    invs.forEach(function(inv) { rx += '• ' + inv.test_name + (inv.notes ? ' — ' + inv.notes : '') + '\n'; });
  }

  var rfEl = document.getElementById('rfT');
  if (rfs.length > 0 && rfEl && rfEl.checked) {
    rx += '\nRED FLAGS (Refer if):\n';
    rfs.forEach(function(rf) { rx += '🚨 ' + rf.flag + (rf.action ? ' → ' + rf.action : '') + '\n'; });
  }

  if (disease.referral_criteria) rx += '\nREFERRAL: ' + disease.referral_criteria + '\n';

  return { structuredRx: rx, disease: disease };
}

