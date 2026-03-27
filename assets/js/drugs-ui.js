// ═══════════════════════════════════════════════
// drugs-ui.js — Drug reference rendering and search
// ═══════════════════════════════════════════════

// ═══ DRUGS ═══
function renderDrugs(list){document.getElementById('drl').innerHTML=list.map(d=>`<div class="dri"><div class="drn">${esc(d.name)}</div><div class="drb">🏷️ ${esc(d.brand)}</div><div class="drd"><span>Dose:</span> ${esc(d.dose)}</div><div class="drd"><span>Side effects:</span> ${esc(d.se)}</div><div class="drd"><span>Cautions/CI:</span> ${esc(d.ci)}</div></div>`).join('');}
function filterDrugs(q){renderDrugs(DRUGS.filter(d=>d.name.toLowerCase().includes(q.toLowerCase())||d.brand.toLowerCase().includes(q.toLowerCase())));}
