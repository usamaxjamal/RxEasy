/**
 * RxEasy Autocomplete Module
 * ─────────────────────────────────────────────────────────────────
 * Provides intelligent autosuggest on the main diagnosis input (#qi).
 *
 * HOW IT REDUCES THE AI-vs-DB INCONSISTENCY BUG:
 * The core bug is that some queries hit the Supabase diseases table
 * (accurate, deterministic) while others fall through to the Groq AI
 * (non-deterministic, occasionally hallucinates).  By showing canonical
 * disease names from the diseases table as the FIRST suggestions, doctors
 * are guided to select exact DB names.  When they do, buildPrescriptionFromDB()
 * in index-2.js will find the record on the first ILIKE hit, bypassing AI
 * entirely — same result every single time.
 *
 * Data flow:
 *   keystroke → 300 ms debounce → /functions/v1/autocomplete edge function
 *   → [ {type:'disease', label:'...'}, …, {type:'history', label:'...'} ]
 *   → render dropdown → user clicks → fill #qi → optional auto-submit
 */

;(function () {

  /* ─── TUNEABLE CONSTANTS ─── */
  const DEBOUNCE_MS        = 300;   // ms after last keystroke before we search
  const MAX_SUGGESTIONS    = 10;    // total items shown at once
  const MIN_QUERY_LEN      = 2;     // don't search for 1-char inputs
  const AUTO_SUBMIT        = true;  // auto-trigger sendMsg() on DB disease pick
  const HISTORY_CACHE_KEY  = 'rxac_hist'; // localStorage key for local history cache
  const MAX_LOCAL_HIST     = 15;    // max entries kept in localStorage fallback

  /* ─── STATE ─── */
  let _debounceTimer   = null;
  let _currentItems    = [];   // [{label, type}]
  let _selectedIndex   = -1;
  let _open            = false;
  let _userId          = null; // set once Supabase session is available

  /* ─── DOM REFERENCES (set in init) ─── */
  let _input    = null;
  let _dropdown = null;

  /* ─── SUPABASE / CONFIG ─── */
  // These are defined in index-2.js scope; we read from window after init
  function getCfg () {
    return window.__RXEASY_CONFIG__ || {};
  }
  function getSupabaseUrl () {
    return (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL) ||
           getCfg().supabaseUrl ||
           'https://epvfbxzuziihhcaaaizp.supabase.co';
  }
  function getSupabaseKey () {
    return (typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY) ||
           getCfg().supabaseKey || '';
  }

  /* ─── AUTOCOMPLETE EDGE FUNCTION CALL ─── */
  async function fetchSuggestions (query) {
    const base = getSupabaseUrl();
    const key  = getSupabaseKey();
    if (!base || !key) return [];
    try {
      const res = await fetch(base + '/functions/v1/autocomplete', {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({ query, user_id: _userId || null }),
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) throw new Error('status ' + res.status);
      return await res.json();
    } catch (e) {
      // Fallback to local history when offline / edge function unavailable
      return localHistorySearch(query);
    }
  }

  /* ─── LOCAL HISTORY HELPERS (offline fallback) ─── */
  function getLocalHistory () {
    try { return JSON.parse(localStorage.getItem(HISTORY_CACHE_KEY) || '[]'); } catch { return []; }
  }
  function saveLocalHistory (arr) {
    try { localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(arr.slice(0, MAX_LOCAL_HIST))); } catch {}
  }
  function addLocalHistory (query) {
    const arr = getLocalHistory().filter(x => x !== query);
    arr.unshift(query);
    saveLocalHistory(arr);
  }
  function clearLocalHistory () {
    try { localStorage.removeItem(HISTORY_CACHE_KEY); } catch {}
  }
  function localHistorySearch (query) {
    const q = query.toLowerCase();
    return getLocalHistory()
      .filter(x => x.toLowerCase().includes(q))
      .slice(0, 5)
      .map(x => ({ label: x, type: 'history' }));
  }

  /* ─── SAVE QUERY TO SERVER HISTORY ─── */
  async function saveSearchHistory (query) {
    // Always save to local fallback
    addLocalHistory(query);

    // Save to Supabase if logged in
    if (!_userId) return;
    const base = getSupabaseUrl();
    const key  = getSupabaseKey();
    if (!base || !key) return;
    try {
      await fetch(base + '/rest/v1/user_search_history', {
        method : 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'apikey'       : key,
          'Authorization': 'Bearer ' + key,
          'Prefer'       : 'return=minimal'
        },
        body: JSON.stringify({ user_id: _userId, query }),
        signal: AbortSignal.timeout(5000)
      });
    } catch { /* non-critical — local copy already saved */ }
  }

  /* ─── DELETE SERVER HISTORY ─── */
  async function clearServerHistory () {
    clearLocalHistory();
    if (!_userId) return;
    const base = getSupabaseUrl();
    const key  = getSupabaseKey();
    if (!base || !key) return;
    try {
      await fetch(base + '/rest/v1/user_search_history?user_id=eq.' + _userId, {
        method : 'DELETE',
        headers: {
          'apikey'       : key,
          'Authorization': 'Bearer ' + key
        },
        signal: AbortSignal.timeout(5000)
      });
    } catch {}
  }

  /* ─── DROPDOWN RENDERING ─── */
  function renderDropdown (items, query) {
    _currentItems  = items;
    _selectedIndex = -1;

    if (!items.length) { closeDropdown(); return; }

    const ql = query.toLowerCase();

    // Build inner HTML — diseases first (green dot), history after (clock icon)
    let html = '';

    items.forEach((item, idx) => {
      const isDis  = item.type === 'disease';
      const label  = esc(item.label);

      // Bold matching portion
      const re     = new RegExp('(' + escRe(query) + ')', 'gi');
      const boldLbl = item.label.replace(re, '<strong>$1</strong>');

      const icon = isDis
        ? '<span class="ac-dot ac-dot-db" title="From disease database">💊</span>'
        : '<span class="ac-dot ac-dot-hist" title="Recent search">🕐</span>';

      const badge = isDis
        ? '<span class="ac-badge ac-badge-db">DB</span>'
        : '<span class="ac-badge ac-badge-hist">Recent</span>';

      html += `<div class="ac-item${idx === _selectedIndex ? ' ac-item-sel' : ''}" 
                    data-idx="${idx}" 
                    data-label="${label}"
                    data-type="${item.type}"
                    role="option"
                    aria-selected="${idx === _selectedIndex}">
                 <span class="ac-item-icon">${icon}</span>
                 <span class="ac-item-text">${boldLbl}</span>
                 ${badge}
               </div>`;
    });

    // Clear history button at bottom if any history items exist
    if (items.some(x => x.type === 'history')) {
      html += `<div class="ac-clear-hist" onclick="window._rxAClearHist()" role="button" tabindex="0">
                 🗑️ <span>Clear recent history</span>
               </div>`;
    }

    _dropdown.innerHTML = html;
    _dropdown.style.display = 'block';
    _open = true;

    // Bind click events
    _dropdown.querySelectorAll('.ac-item').forEach(el => {
      el.addEventListener('mousedown', function (e) {
        e.preventDefault(); // prevent blur before selection
        selectItem(parseInt(this.dataset.idx));
      });
    });
  }

  function closeDropdown () {
    if (_dropdown) { _dropdown.style.display = 'none'; _dropdown.innerHTML = ''; }
    _open = false;
    _selectedIndex = -1;
    _currentItems  = [];
  }

  function highlightItem (idx) {
    _selectedIndex = idx;
    const items = _dropdown.querySelectorAll('.ac-item');
    items.forEach((el, i) => {
      el.classList.toggle('ac-item-sel', i === idx);
      el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    // Scroll into view if needed
    if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
  }

  function selectItem (idx) {
    if (idx < 0 || idx >= _currentItems.length) return;
    const item = _currentItems[idx];
    _input.value = item.label;
    rsz(_input); // resize textarea (function defined in index-2.js)
    closeDropdown();
    _input.focus();
    // Auto-submit only for DB disease hits to maximise consistency
    if (AUTO_SUBMIT && item.type === 'disease') {
      setTimeout(() => { if (typeof sendMsg === 'function') sendMsg(); }, 50);
    }
  }

  /* ─── KEYBOARD NAVIGATION ─── */
  function handleKeydown (e) {
    if (!_open) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        highlightItem(Math.min(_selectedIndex + 1, _currentItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        highlightItem(Math.max(_selectedIndex - 1, 0));
        break;
      case 'Enter':
        if (_selectedIndex >= 0) {
          e.preventDefault();
          e.stopImmediatePropagation(); // prevent sendMsg from also firing
          selectItem(_selectedIndex);
        }
        break;
      case 'Escape':
        closeDropdown();
        break;
    }
  }

  /* ─── MAIN SEARCH TRIGGER ─── */
  function onInput () {
    clearTimeout(_debounceTimer);
    const q = _input.value.trim();
    if (q.length < MIN_QUERY_LEN) { closeDropdown(); return; }
    _debounceTimer = setTimeout(async () => {
      const items = await fetchSuggestions(q);
      // Guard: input may have changed while waiting
      if (_input.value.trim() === q) renderDropdown(items, q);
    }, DEBOUNCE_MS);
  }

  /* ─── UTILITIES ─── */
  function esc (s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escRe (s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ─── CSS INJECTION ─── */
  function injectStyles () {
    if (document.getElementById('rxac-styles')) return;
    const style = document.createElement('style');
    style.id = 'rxac-styles';
    style.textContent = `
/* ── RxEasy Autocomplete Dropdown ── */
#rxac-dropdown {
  position: absolute;
  z-index: 9999;
  background: #0d1828;
  border: 1px solid rgba(255,255,255,.1);
  border-top: none;
  border-radius: 0 0 14px 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.3);
  max-height: 340px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #1e3045 transparent;
  display: none;
  /* width & top/left set dynamically */
}
#rxac-dropdown::-webkit-scrollbar { width: 4px; }
#rxac-dropdown::-webkit-scrollbar-thumb { background: #1e3045; border-radius: 2px; }

.ac-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  cursor: pointer;
  transition: background .1s;
  border-bottom: 1px solid rgba(255,255,255,.04);
  font-family: 'DM Sans', sans-serif;
  font-size: .8rem;
  color: rgba(232,237,245,.8);
}
.ac-item:last-of-type { border-bottom: none; }
.ac-item:hover, .ac-item-sel {
  background: rgba(255,255,255,.07);
  color: rgba(232,237,245,.97);
}

.ac-item-icon { flex-shrink: 0; font-size: .78rem; line-height: 1; }
.ac-item-text { flex: 1; }
.ac-item-text strong { color: #00c896; font-weight: 700; }

/* DB badge */
.ac-badge {
  font-size: .5rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  letter-spacing: .4px;
  flex-shrink: 0;
}
.ac-badge-db   { background: rgba(0,200,150,.12); color: #00c896; border: 1px solid rgba(0,200,150,.2); }
.ac-badge-hist { background: rgba(42,122,191,.1);  color: rgba(100,160,220,.8); border: 1px solid rgba(42,122,191,.18); }

/* Dot icons */
.ac-dot { font-size: .72rem; }

/* Clear history row */
.ac-clear-hist {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  font-size: .65rem;
  color: rgba(232,237,245,.3);
  cursor: pointer;
  border-top: 1px solid rgba(255,255,255,.06);
  transition: color .15s, background .15s;
  font-family: 'DM Sans', sans-serif;
  user-select: none;
}
.ac-clear-hist:hover {
  background: rgba(220,80,80,.06);
  color: rgba(220,80,80,.7);
}

/* Input wrapper needs relative for dropdown positioning */
.ibox { position: relative; }

/* Loading ring inside input */
.ac-loading {
  position: absolute;
  right: 10px; top: 50%; transform: translateY(-50%);
  width: 12px; height: 12px;
  border: 2px solid rgba(0,200,150,.2);
  border-top-color: #00c896;
  border-radius: 50%;
  animation: acSpin .6s linear infinite;
  pointer-events: none;
}
@keyframes acSpin { to { transform: translateY(-50%) rotate(360deg); } }
`;
    document.head.appendChild(style);
  }

  /* ─── DROPDOWN POSITIONING ─── */
  function positionDropdown () {
    if (!_input || !_dropdown) return;
    const rect  = _input.getBoundingClientRect();
    const ibox  = _input.closest('.ibox');
    if (!ibox) return;
    const iRect = ibox.getBoundingClientRect();
    _dropdown.style.width = iRect.width + 'px';
    _dropdown.style.left  = '0';
    _dropdown.style.top   = (ibox.offsetHeight) + 'px';
  }

  /* ─── INIT ─── */
  function init () {
    injectStyles();

    _input = document.getElementById('qi');
    if (!_input) { console.warn('[RxAC] #qi not found'); return; }

    // Create dropdown anchored inside .ibox
    const ibox = _input.closest('.ibox');
    if (!ibox) { console.warn('[RxAC] .ibox not found'); return; }
    ibox.style.position = 'relative'; // ensure positioning context

    _dropdown = document.createElement('div');
    _dropdown.id = 'rxac-dropdown';
    _dropdown.setAttribute('role', 'listbox');
    _dropdown.setAttribute('aria-label', 'Diagnosis suggestions');
    ibox.appendChild(_dropdown);

    // Wire events
    _input.addEventListener('input', onInput);
    _input.addEventListener('keydown', handleKeydown, true); // capture to beat onKey()
    _input.addEventListener('focus', () => { if (_input.value.trim().length >= MIN_QUERY_LEN) onInput(); });
    _input.addEventListener('blur', () => { setTimeout(closeDropdown, 180); }); // allow click to register

    // Expose clear handler globally
    window._rxAClearHist = async function () {
      await clearServerHistory();
      closeDropdown();
      if (typeof toast === 'function') toast('🗑️ Recent history cleared');
    };

    // Expose saveSearchHistory globally so index-2.js sendMsg() can call it
    window.rxSaveSearchHistory = saveSearchHistory;

    // Try to get logged-in user id
    tryGetUserId();
  }

  function tryGetUserId () {
    // Poll until Supabase session is available (loaded async in index-2.js)
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      const base = getSupabaseUrl();
      const key  = getSupabaseKey();
      if (!base || !key) { if (attempts > 20) clearInterval(poll); return; }
      try {
        const res = await fetch(base + '/auth/v1/user', {
          headers: { 'apikey': key, 'Authorization': 'Bearer ' + key },
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.id) { _userId = json.id; clearInterval(poll); }
        } else {
          clearInterval(poll);
        }
      } catch {
        if (attempts > 20) clearInterval(poll);
      }
    }, 1500);
  }

  /* ─── BOOTSTRAP ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready
    init();
  }

  // Expose for debugging
  window._rxAC = { closeDropdown, clearLocalHistory };

})();
