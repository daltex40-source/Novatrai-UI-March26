/* ═══════════════════════════════════════════════════════════════
   VAULT DATA — Media Library sample assets
═══════════════════════════════════════════════════════════════ */
const _ML_ASSETS = [
  // Brand Assets
  { id:'ba-1', name:'Novatrai Logo — Primary (Dark BG)', type:'image', cat:'brand', btab:'logos',
    size:'42 KB', fmt:'PNG', tags:['brand','logo','primary'],
    thumb:'linear-gradient(135deg,#6c47ff,#9f7ffe)',
    thumbLabel:'N', added:'15 Jan 2026', by:'Admin' },
  { id:'ba-2', name:'Novatrai Logo — White (Light BG)', type:'image', cat:'brand', btab:'logos',
    size:'38 KB', fmt:'PNG', tags:['brand','logo','light'],
    thumb:'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
    thumbLabel:'N', added:'15 Jan 2026', by:'Admin' },
  { id:'ba-3', name:'Letterhead — A4 Standard', type:'pdf', cat:'brand', btab:'letterheads',
    size:'210 KB', fmt:'PDF', tags:['brand','letterhead'],
    thumb:'linear-gradient(135deg,#312e81,#4f46e5)',
    thumbLabel:'✉', added:'20 Jan 2026', by:'Admin' },
  { id:'ba-4', name:'Email Signature — Fritz Daltex', type:'image', cat:'brand', btab:'signatures',
    size:'18 KB', fmt:'PNG', tags:['brand','signature'],
    thumb:'linear-gradient(135deg,#1e1b4b,#312e81)',
    thumbLabel:'sig', added:'22 Jan 2026', by:'Admin' },
  { id:'ba-5', name:'Email Signature — Team Standard', type:'image', cat:'brand', btab:'signatures',
    size:'16 KB', fmt:'PNG', tags:['brand','signature','team'],
    thumb:'linear-gradient(135deg,#312e81,#5b21b6)',
    thumbLabel:'sig', added:'22 Jan 2026', by:'Admin' },
  { id:'ba-6', name:'LinkedIn Banner — Company Page', type:'image', cat:'brand', btab:'marketing',
    size:'380 KB', fmt:'PNG', tags:['brand','marketing','linkedin'],
    thumb:'linear-gradient(135deg,#6c47ff,#a78bfa)',
    thumbLabel:'LI', added:'10 Feb 2026', by:'Marketing' },
  { id:'ba-7', name:'Brand Photo — Office Exterior', type:'image', cat:'brand', btab:'photos',
    size:'1.2 MB', fmt:'JPG', tags:['brand','photo','office'],
    thumb:'linear-gradient(135deg,#374151,#6b7280)',
    thumbLabel:'📷', added:'05 Feb 2026', by:'Admin' },
  // Images
  { id:'img-1', name:'FICA Document Guide — Infographic', type:'image', cat:'images',
    size:'540 KB', fmt:'PNG', tags:['compliance','fica','guide'],
    thumb:'linear-gradient(135deg,#0f766e,#14b8a6)',
    thumbLabel:'📊', added:'18 Feb 2026', by:'Compliance' },
  { id:'img-2', name:'Client Portal Screenshot', type:'image', cat:'images',
    size:'890 KB', fmt:'PNG', tags:['product','portal'],
    thumb:'linear-gradient(135deg,#1d4ed8,#3b82f6)',
    thumbLabel:'🖥', added:'12 Feb 2026', by:'Product' },
  { id:'img-3', name:'Office Team Photo 2025', type:'image', cat:'images',
    size:'2.1 MB', fmt:'JPG', tags:['team','office'],
    thumb:'linear-gradient(135deg,#7c3aed,#a78bfa)',
    thumbLabel:'👥', added:'01 Dec 2025', by:'Admin' },
  { id:'img-4', name:'Property Overview Map — Sandton', type:'image', cat:'images',
    size:'720 KB', fmt:'PNG', tags:['property','map'],
    thumb:'linear-gradient(135deg,#064e3b,#10b981)',
    thumbLabel:'🗺', added:'22 Jan 2026', by:'Ops' },
  { id:'img-5', name:'Awards Ceremony Banner 2025', type:'image', cat:'images',
    size:'1.5 MB', fmt:'JPG', tags:['awards','event'],
    thumb:'linear-gradient(135deg,#92400e,#f59e0b)',
    thumbLabel:'🏆', added:'10 Nov 2025', by:'Marketing' },
  { id:'img-6', name:'Compliance Checklist Illustration', type:'image', cat:'images',
    size:'310 KB', fmt:'PNG', tags:['compliance','illustration'],
    thumb:'linear-gradient(135deg,#1e3a5f,#2563eb)',
    thumbLabel:'☑', added:'14 Jan 2026', by:'Design' },
  // Videos & Links
  { id:'vid-1', name:'Onboarding Walkthrough Video', type:'video', cat:'videos',
    size:'24 MB', fmt:'MP4', tags:['onboarding','video'],
    thumb:'linear-gradient(135deg,#7f1d1d,#ef4444)',
    thumbLabel:'▶', added:'05 Jan 2026', by:'Product' },
  { id:'lnk-1', name:'SARS eFiling Portal', type:'link', cat:'videos',
    size:'—', fmt:'URL', url:'https://efiling.sars.gov.za', tags:['sars','tax','external'],
    thumb:'linear-gradient(135deg,#1e3a5f,#1d4ed8)',
    thumbLabel:'🔗', added:'20 Jan 2026', by:'Compliance' },
  { id:'lnk-2', name:'CIPC Company Search', type:'link', cat:'videos',
    size:'—', fmt:'URL', url:'https://www.cipc.co.za', tags:['cipc','company','external'],
    thumb:'linear-gradient(135deg,#064e3b,#059669)',
    thumbLabel:'🔗', added:'20 Jan 2026', by:'Compliance' },
  { id:'lnk-3', name:'FSB / FSCA Regulatory Updates', type:'link', cat:'videos',
    size:'—', fmt:'URL', url:'https://www.fsca.co.za', tags:['fsca','regulatory','external'],
    thumb:'linear-gradient(135deg,#312e81,#6c47ff)',
    thumbLabel:'🔗', added:'20 Jan 2026', by:'Compliance' },
  // Documents
  { id:'doc-1', name:'Novatrai Rate Card 2026', type:'pdf', cat:'docs',
    size:'180 KB', fmt:'PDF', tags:['pricing','internal'],
    thumb:'linear-gradient(135deg,#1f2937,#374151)',
    thumbLabel:'📄', added:'02 Jan 2026', by:'Finance' },
  { id:'doc-2', name:'Process Manual — Onboarding', type:'pdf', cat:'docs',
    size:'420 KB', fmt:'PDF', tags:['process','onboarding'],
    thumb:'linear-gradient(135deg,#1f2937,#374151)',
    thumbLabel:'📄', added:'15 Jan 2026', by:'Ops' },
];

// favourites / recent (simulated)
const _ML_FAVS = new Set(['ba-1','img-1','lnk-1']);
const _ML_RECENT = ['img-2','ba-3','lnk-2','img-1','ba-1'];

let _mlCurrentNav = 'all';
let _mlCurrentFilter = 'all';
let _mlCurrentBrandTab = 'logos';
let _mlCurrentView = 'grid';
let _mlSearchQuery = '';
let _mlSelectedId = null;

/* ── Navigation ── */
function mlSetNav(el, key) {
  document.querySelectorAll('.vault-nav-item[data-ml]').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  _mlCurrentNav = key;
  _mlSearchQuery = '';
  const si = document.getElementById('ml-grid-area');
  if(si) si.querySelector('.vault-search') && (si.querySelector('.vault-search').value='');
  document.getElementById('ml-brand-tabs').style.display = (key==='brand') ? 'flex' : 'none';
  mlRenderGrid();
  stgLoadPermMatrix();
}

function mlBrandTab(el, tab) {
  document.querySelectorAll('.brand-tab-btn[data-btab]').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  _mlCurrentBrandTab = tab;
  mlRenderGrid();
}

function mlFilter(el, f) {
  document.querySelectorAll('.vault-filter-chip[data-mf]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  _mlCurrentFilter = f;
  mlRenderGrid();
}

function mlSearch(q) { _mlSearchQuery = q.toLowerCase(); mlRenderGrid(); }

function mlSetView(v, el) {
  document.querySelectorAll('.vault-view-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  _mlCurrentView = v;
  mlRenderGrid();
}

/* ── Filtered asset list ── */
function mlGetAssets() {
  let list = _ML_ASSETS.slice();
  if (_mlCurrentNav === 'favorites') list = list.filter(a => _ML_FAVS.has(a.id));
  else if (_mlCurrentNav === 'recent') list = _ML_RECENT.map(id => list.find(a=>a.id===id)).filter(Boolean);
  else if (_mlCurrentNav === 'brand') { list = list.filter(a => a.cat==='brand'); if(_mlCurrentBrandTab!=='all') list = list.filter(a=>a.btab===_mlCurrentBrandTab); }
  else if (_mlCurrentNav === 'images') list = list.filter(a => a.cat==='images');
  else if (_mlCurrentNav === 'videos') list = list.filter(a => a.cat==='videos');
  else if (_mlCurrentNav === 'docs') list = list.filter(a => a.cat==='docs');
  // filter chip
  if (_mlCurrentFilter !== 'all') {
    if (_mlCurrentFilter === 'image') list = list.filter(a => a.type==='image');
    else if (_mlCurrentFilter === 'video') list = list.filter(a => a.type==='video');
    else if (_mlCurrentFilter === 'link') list = list.filter(a => a.type==='link');
    else if (_mlCurrentFilter === 'pdf') list = list.filter(a => a.type==='pdf');
  }
  if (_mlSearchQuery) list = list.filter(a => a.name.toLowerCase().includes(_mlSearchQuery) || (a.tags||[]).some(t=>t.includes(_mlSearchQuery)));
  return list;
}

/* ── Grid/List render ── */
function mlRenderGrid() {
  const grid = document.getElementById('ml-grid');
  if(!grid) return;
  const assets = mlGetAssets();
  if (!assets.length) {
    grid.innerHTML = '<div style="padding:40px;text-align:center;color:#5A7080;font-size:13px">No media found</div>';
    grid.className = 'vault-grid';
    return;
  }
  if (_mlCurrentView === 'list') {
    grid.className = 'vault-list';
    grid.innerHTML = assets.map(a => `
      <div class="vault-list-row ${_mlSelectedId===a.id?'selected':''}" onclick="mlSelectAsset('${a.id}')">
        <div class="vault-list-thumb" style="background:${a.thumb};color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;border-radius:6px;width:36px;height:36px;flex-shrink:0">${a.thumbLabel}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;color:#E4EBF5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.name}</div>
          <div style="font-size:11px;color:#5A7080">${a.fmt} · ${a.size} · ${a.added} · ${a.by}</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          ${(a.tags||[]).slice(0,2).map(t=>`<span class="mdoc-tag">${t}</span>`).join('')}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="mdoc-action-btn" onclick="event.stopPropagation();_showToast('${a.name} copied to clipboard link')" title="Copy link">🔗</button>
          <button class="mdoc-action-btn" onclick="event.stopPropagation();mlToggleFav('${a.id}')" title="Favourite">${_ML_FAVS.has(a.id)?'★':'☆'}</button>
          <button class="mdoc-action-btn" onclick="event.stopPropagation();_showToast('Downloading ${a.name}…')" title="Download">↓</button>
        </div>
      </div>`).join('');
  } else {
    grid.className = 'vault-grid';
    grid.innerHTML = assets.map(a => `
      <div class="vault-card ${_mlSelectedId===a.id?'selected':''}" onclick="mlSelectAsset('${a.id}')">
        <div class="vault-thumb" style="background:${a.thumb};display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:700;border-radius:10px 10px 0 0">
          ${a.type==='link'?'🔗':a.type==='video'?'▶':a.thumbLabel}
        </div>
        <div class="vault-card-body">
          <div class="vault-card-name">${a.name}</div>
          <div class="vault-card-meta">${a.fmt} · ${a.size}</div>
          <div class="vault-card-actions">
            <button class="mdoc-action-btn" title="Favourite" onclick="event.stopPropagation();mlToggleFav('${a.id}')">${_ML_FAVS.has(a.id)?'★':'☆'}</button>
            <button class="mdoc-action-btn" title="Copy link" onclick="event.stopPropagation();_showToast('Link copied!')">🔗</button>
            <button class="mdoc-action-btn" title="Download" onclick="event.stopPropagation();_showToast('Downloading…')">↓</button>
          </div>
        </div>
      </div>`).join('');
  }
}

function mlToggleFav(id) {
  if (_ML_FAVS.has(id)) _ML_FAVS.delete(id); else _ML_FAVS.add(id);
  mlRenderGrid();
  if (_mlSelectedId===id) mlShowPreview(id);
}

/* ── Asset selection + preview ── */
function mlSelectAsset(id) {
  _mlSelectedId = id;
  mlRenderGrid();
  mlShowPreview(id);
}

function mlShowPreview(id) {
  const a = _ML_ASSETS.find(x=>x.id===id);
  if(!a) return;
  const drawer = document.getElementById('ml-preview-drawer');
  const title = document.getElementById('ml-preview-title');
  const body = document.getElementById('ml-preview-body');
  if(!drawer||!title||!body) return;
  drawer.classList.remove('closed');
  title.textContent = 'Preview';
  body.innerHTML = `
    <div style="background:${a.thumb};border-radius:8px;height:140px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:32px;font-weight:700;margin-bottom:14px">${a.type==='link'?'🔗':a.type==='video'?'▶':a.thumbLabel}</div>
    <div style="font-size:13px;font-weight:600;color:#E4EBF5;margin-bottom:4px">${a.name}</div>
    <div style="font-size:11px;color:#5A7080;margin-bottom:14px">${a.fmt} · ${a.size} · Added ${a.added} by ${a.by}</div>
    ${a.url ? `<div style="font-size:11px;color:#6c47ff;word-break:break-all;margin-bottom:14px"><a href="${a.url}" target="_blank" style="color:#6c47ff">${a.url}</a></div>` : ''}
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px">${(a.tags||[]).map(t=>`<span class="mdoc-tag">${t}</span>`).join('')}</div>
    ${a.cat==='brand'?`<div style="font-size:11px;color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:6px;padding:6px 10px;margin-bottom:12px">🔒 Brand Asset — Admin / Marketing only</div>`:''}
    <div style="display:flex;flex-direction:column;gap:6px">
      <button class="vault-btn primary" onclick="_showToast('Inserting ${a.name.replace(/'/g,'')}…')" style="justify-content:center">Insert into Message</button>
      <button class="vault-btn" onclick="_showToast('Downloading…')" style="justify-content:center">↓ Download</button>
      <button class="vault-btn" onclick="mlToggleFav('${a.id}')" style="justify-content:center">${_ML_FAVS.has(a.id)?'★ Remove from Favourites':'☆ Add to Favourites'}</button>
    </div>`;
}

function mlClosePreview() {
  const d = document.getElementById('ml-preview-drawer');
  if(d) d.classList.add('closed');
  _mlSelectedId = null;
  mlRenderGrid();
}

function mlAddLink() {
  const url = prompt('Enter URL to add to Media Library:');
  if (!url||!url.trim()) return;
  const name = prompt('Label for this link:') || url;
  _ML_ASSETS.push({
    id:'lnk-'+Date.now(), name, type:'link', cat:'videos', size:'—', fmt:'URL', url,
    tags:['link'], thumb:'linear-gradient(135deg,#1e3a5f,#6c47ff)', thumbLabel:'🔗',
    added:'Now', by:'You'
  });
  mlRenderGrid();
  _showToast('Link added: '+name);
}

/* ═══════════════════════════════════════════════════════════════
   MASTER DOCUMENTS JS
═══════════════════════════════════════════════════════════════ */
let _mdCurrentNav = 'all';
let _mdCurrentFilter = 'all';
let _mdCurrentView = 'list';
let _mdSearchQuery = '';
let _mdSelectedDoc = null;

const _MD_PREVIEW_DATA = {
  'tpl-1': { name:'Client Agreement — Standard', fmt:'DOCX', version:'v3.2', updated:'18 Feb 2026', by:'Legal team', desc:'Standard client onboarding agreement covering scope of services, fees, liability, and termination. Used for all new individual and entity clients.' },
  'tpl-2': { name:'Non-Disclosure Agreement', fmt:'DOCX', version:'v2.0', updated:'10 Jan 2026', by:'Legal team', desc:'Mutual NDA for use before sharing confidential business information with prospective or current clients.' },
  'tpl-3': { name:'Service Level Agreement', fmt:'PDF', version:'v1.5', updated:'05 Feb 2026', by:'Operations', desc:'Defines service delivery standards, response times, escalation procedures, and performance benchmarks.' },
  'tpl-4': { name:'FICA Checklist — Individual', fmt:'PDF', version:'v4.1', updated:'20 Feb 2026', by:'Compliance', desc:'Comprehensive FICA document checklist for natural persons. Includes ID verification, proof of address, source of funds, and PEP screening.' },
  'tpl-5': { name:'FICA Checklist — Company', fmt:'PDF', version:'v3.0', updated:'20 Feb 2026', by:'Compliance', desc:'Entity-level FICA checklist. Covers registration docs, beneficial ownership, director KYC, and corporate structure.' },
  'tpl-6': { name:'Letter of Engagement', fmt:'DOCX', version:'v2.1', updated:'12 Jan 2026', by:'Legal team', desc:'Formal letter confirming engagement scope, fees, and professional responsibilities.' },
  'cr-1':  { name:'Certificate of Incorporation', fmt:'PDF', version:'Permanent', updated:'2019', by:'CIPC', desc:'Official CIPC registration certificate. Company reg no: 2019/042831. Permanent document.' },
  'cr-2':  { name:'Company FICA Pack 2025', fmt:'PDF', version:'Annual', updated:'03 Jan 2026', by:'Compliance', desc:'Annual FICA compliance pack for Novatrai (Pty) Ltd. Includes all required entity documents.' },
  'cr-3':  { name:'FSCA Licence', fmt:'PDF', version:'FSP 12483', updated:'01 Jan 2026', by:'Regulatory', desc:'Financial Services Provider licence issued by FSCA. Expires 31 Dec 2026. Must be renewed annually.' },
  'pk-1':  { name:'New Client Onboarding Pack', fmt:'Pack', version:'4 docs', updated:'15 Feb 2026', by:'Ops', desc:'Complete onboarding pack: NDA + Client Agreement + Letter of Engagement + FICA Individual Checklist. Send as a single signing event.' },
  'pk-2':  { name:'FICA Compliance Pack — Individual', fmt:'Pack', version:'3 docs', updated:'20 Feb 2026', by:'Compliance', desc:'FICA individual pack: FICA Checklist + ID form + Proof of Address template.' },
  'pk-3':  { name:'FICA Compliance Pack — Company', fmt:'Pack', version:'5 docs', updated:'20 Feb 2026', by:'Compliance', desc:'Entity FICA pack: FICA Company Checklist + CIPC + Director KYC forms + Beneficial Ownership declaration.' },
  'pk-4':  { name:'Annual Review Pack', fmt:'Pack', version:'3 docs', updated:'01 Feb 2026', by:'Ops', desc:'Annual renewal pack: SLA renewal + Updated Client Agreement + FICA Refresh checklist.' },
  'sa-1':  { name:'Client Agreement — Botha Family Trust', fmt:'PDF (Signed)', version:'Signed', updated:'14 Feb 2026', by:'James Botha', desc:'Signed client agreement. eSignature reference: ES-4421. Legally binding.' },
  'sa-2':  { name:'NDA — Botha Family Trust', fmt:'PDF (Signed)', version:'Signed', updated:'14 Feb 2026', by:'James Botha', desc:'Signed NDA. eSignature reference: ES-4420.' },
  'sa-3':  { name:'SLA — Meridian Properties', fmt:'PDF', version:'Awaiting', updated:'Sent 22 Feb 2026', by:'Sarah van Niekerk', desc:'Sent for signature. Awaiting response from Sarah van Niekerk, Meridian Properties.' },
  'sa-4':  { name:'Letter of Engagement — Khumalo Investments', fmt:'PDF (Signed)', version:'Signed', updated:'01 Feb 2026', by:'Thabo Khumalo', desc:'Signed LOE. eSignature reference: ES-4398.' },
  'sa-5':  { name:'FICA Pack — Orion Capital', fmt:'PDF', version:'Awaiting', updated:'Sent 21 Feb 2026', by:'David Orion', desc:'Awaiting FICA pack signature from David Orion, Orion Capital.' },
};

function mdocSetNav(el, key) {
  document.querySelectorAll('.vault-nav-item[data-md]').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  _mdCurrentNav = key;
  _mdSearchQuery = '';
  // show/hide pack builder sub-tabs
  const pt = document.getElementById('md-pack-tabs');
  if(pt) pt.style.display = (key==='packs') ? 'flex' : 'none';
  if(key !== 'packs') { const pb = document.getElementById('md-pack-builder'); if(pb) pb.style.display='none'; }
  mdocApplyFilter();
}

function mdocFilter(el, f) {
  document.querySelectorAll('.vault-filter-chip[data-mdf]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  _mdCurrentFilter = f;
  mdocApplyFilter();
}

function mdocSetView(v, el) {
  document.querySelectorAll('.vault-view-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  _mdCurrentView = v;
  mdocApplyFilter();
}

function mdocSearch(q) { _mdSearchQuery = q.toLowerCase(); mdocApplyFilter(); }

function mdocApplyFilter() {
  const rows = document.querySelectorAll('.mdoc-row');
  const sections = document.querySelectorAll('.mdoc-section');
  sections.forEach(sec => {
    const sKey = sec.id.replace('mds-','');
    const navMatch = _mdCurrentNav==='all' || _mdCurrentNav==='recent' || _mdCurrentNav==='pending' || sKey===_mdCurrentNav;
    sec.style.display = navMatch ? '' : 'none';
  });
  rows.forEach(row => {
    const cat = row.dataset.cat || '';
    const fmt = row.dataset.fmt || '';
    const name = (row.querySelector('.mdoc-row-name')||{}).textContent||'';
    const navMatch = _mdCurrentNav==='all' || cat===_mdCurrentNav ||
      (_mdCurrentNav==='recent') ||
      (_mdCurrentNav==='pending' && row.classList.contains('pending-sig'));
    const fmtMatch = _mdCurrentFilter==='all' || fmt===_mdCurrentFilter;
    const searchMatch = !_mdSearchQuery || name.toLowerCase().includes(_mdSearchQuery);
    row.style.display = (navMatch && fmtMatch && searchMatch) ? '' : 'none';
  });
  // hide section headers if all their rows are hidden
  document.querySelectorAll('.mdoc-section').forEach(sec => {
    if(sec.style.display==='none') return;
    const visible = [...sec.querySelectorAll('.mdoc-row')].filter(r=>r.style.display!=='none');
    sec.style.display = visible.length ? '' : 'none';
  });
}

function mdocSelect(id, el) {
  document.querySelectorAll('.mdoc-row').forEach(r=>r.classList.remove('selected'));
  el.classList.add('selected');
  _mdSelectedDoc = id;
  mdocShowPreview(id);
}

function mdocShowPreview(id) {
  const d = _MD_PREVIEW_DATA[id];
  if(!d) return;
  const drawer = document.getElementById('md-preview-drawer');
  const body = document.getElementById('md-preview-body');
  if(!drawer||!body) return;
  drawer.classList.remove('closed');
  const isSigned = d.version==='Signed';
  const isPending = d.version==='Awaiting';
  const isPack = d.fmt==='Pack';
  body.innerHTML = `
    <div style="background:${isSigned?'linear-gradient(135deg,#064e3b,#10b981)':isPending?'linear-gradient(135deg,#78350f,#f59e0b)':isPack?'linear-gradient(135deg,#312e81,#6c47ff)':'linear-gradient(135deg,#1f2937,#374151)'};border-radius:8px;height:100px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;margin-bottom:14px">${isSigned?'✓':isPending?'⏳':isPack?'📦':'📄'}</div>
    <div style="font-size:13px;font-weight:600;color:#E4EBF5;margin-bottom:4px;line-height:1.4">${d.name}</div>
    <div style="font-size:11px;color:#5A7080;margin-bottom:2px">${d.fmt} · ${d.version}</div>
    <div style="font-size:11px;color:#5A7080;margin-bottom:12px">Updated ${d.updated} · ${d.by}</div>
    <div style="font-size:12px;color:#9AABB8;line-height:1.5;margin-bottom:16px">${d.desc}</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${isSigned?`<button class="vault-btn" onclick="_showToast('Downloading signed copy…')" style="justify-content:center">↓ Download Signed Copy</button>`:''}
      ${isPending?`<button class="vault-btn primary" onclick="_showToast('Sending reminder…')" style="justify-content:center;background:#f59e0b;border-color:#f59e0b">🔔 Send Reminder</button>`:''}
      ${!isSigned&&!isPending?`<button class="vault-btn primary" onclick="_showToast('Sending for signature…')" style="justify-content:center">✍ Send for Signature</button>`:''}
      <button class="vault-btn" onclick="openAfvModal()" style="justify-content:center">📎 Attach to Message</button>
      ${!isSigned&&!isPending?`<button class="vault-btn" onclick="_showToast('Downloading…')" style="justify-content:center">↓ Download Template</button>`:''}
    </div>`;
}

function mdocClosePreview() {
  const d = document.getElementById('md-preview-drawer');
  if(d) d.classList.add('closed');
  _mdSelectedDoc = null;
  document.querySelectorAll('.mdoc-row').forEach(r=>r.classList.remove('selected'));
}

function mdocNewDoc() { _showToast('Document editor — coming soon'); }
function mdocNewPack() {
  // switch to packs nav and open builder
  const el = document.querySelector('.vault-nav-item[data-md="packs"]');
  if(el) mdocSetNav(el,'packs');
  const pt = document.getElementById('md-pack-tabs');
  if(pt) { pt.style.display='flex'; const btns = pt.querySelectorAll('.brand-tab-btn'); btns.forEach(b=>b.classList.remove('active')); btns[1]&&btns[1].classList.add('active'); }
  const pb = document.getElementById('md-pack-builder');
  if(pb) pb.style.display='block';
  // hide the packs list rows
  document.querySelectorAll('#mds-packs .mdoc-row.pack-row').forEach(r=>r.style.display='none');
  const hdr = document.querySelector('#mds-packs .mdoc-section-hdr');
  if(hdr) hdr.style.display='none';
}

function mdocPackTab(el, tab) {
  document.querySelectorAll('#md-pack-tabs .brand-tab-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const pb = document.getElementById('md-pack-builder');
  const rows = document.querySelectorAll('#mds-packs .mdoc-row.pack-row');
  const hdr = document.querySelector('#mds-packs .mdoc-section-hdr');
  if(tab==='pack-builder') {
    if(pb) pb.style.display='block';
    rows.forEach(r=>r.style.display='none');
    if(hdr) hdr.style.display='none';
  } else {
    if(pb) pb.style.display='none';
    rows.forEach(r=>r.style.display='');
    if(hdr) hdr.style.display='';
  }
}

/* ── Pack Builder ── */
const _pbItems = {};
function pbSearch(q) {
  const low = q.toLowerCase();
  document.querySelectorAll('#pb-source-list .pb-doc-item').forEach(el=>{
    el.style.display = el.textContent.toLowerCase().includes(low) ? '' : 'none';
  });
}
function pbAddDoc(el, id, name) {
  if(_pbItems[id]) { _showToast(name+' already in pack'); return; }
  _pbItems[id] = name;
  el.style.opacity = '0.4';
  el.style.pointerEvents = 'none';
  _pbRender();
}
function pbRemoveDoc(id) {
  delete _pbItems[id];
  const src = document.querySelector(`#pb-source-list [data-pbid="${id}"]`);
  if(src) { src.style.opacity=''; src.style.pointerEvents=''; }
  _pbRender();
}
function _pbRender() {
  const ids = Object.keys(_pbItems);
  document.getElementById('pb-count').textContent = '('+ids.length+' docs)';
  const empty = document.getElementById('pb-drop-empty');
  const list = document.getElementById('pb-pack-items');
  if(!ids.length) { if(empty) empty.style.display=''; if(list) list.innerHTML=''; return; }
  if(empty) empty.style.display='none';
  if(list) list.innerHTML = ids.map((id,i)=>`
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#141A22;border:1px solid var(--border);border-radius:6px;margin-bottom:6px;font-size:12px;color:#E4EBF5">
      <span style="color:#5A7080;min-width:18px">${i+1}.</span>
      <span style="flex:1">${_pbItems[id]}</span>
      <button style="background:none;border:none;color:#5A7080;cursor:pointer;font-size:14px;padding:0" onclick="pbRemoveDoc('${id}')">×</button>
    </div>`).join('');
}
function pbClear() {
  Object.keys(_pbItems).forEach(id=>delete _pbItems[id]);
  document.querySelectorAll('#pb-source-list .pb-doc-item').forEach(el=>{el.style.opacity='';el.style.pointerEvents='';});
  document.getElementById('pb-pack-name').value='';
  _pbRender();
}
function pbSavePack() {
  const name = document.getElementById('pb-pack-name').value.trim();
  const ids = Object.keys(_pbItems);
  if(!name) { _showToast('Please enter a pack name'); return; }
  if(!ids.length) { _showToast('Add at least one document to the pack'); return; }
  _showToast('Pack "'+name+'" saved with '+ids.length+' document'+(ids.length!==1?'s':'')+'!');
  pbClear();
}

/* ═══════════════════════════════════════════════════════════════
   ATTACH-FROM-VAULT MODAL
═══════════════════════════════════════════════════════════════ */
let _afvSource = 'media';
let _afvFilter = 'all';
let _afvSearch = '';
let _afvSelected = new Set();

const _AFV_DATA = {
  media: _ML_ASSETS,
  master: [
    { id:'tpl-1', name:'Client Agreement — Standard', type:'docx', size:'DOCX', thumb:'linear-gradient(135deg,#312e81,#6c47ff)', thumbLabel:'📄' },
    { id:'tpl-2', name:'Non-Disclosure Agreement', type:'docx', size:'DOCX', thumb:'linear-gradient(135deg,#312e81,#6c47ff)', thumbLabel:'📄' },
    { id:'tpl-3', name:'Service Level Agreement', type:'pdf', size:'PDF', thumb:'linear-gradient(135deg,#1f2937,#374151)', thumbLabel:'📄' },
    { id:'tpl-4', name:'FICA Checklist — Individual', type:'pdf', size:'PDF', thumb:'linear-gradient(135deg,#064e3b,#10b981)', thumbLabel:'📄' },
    { id:'tpl-5', name:'FICA Checklist — Company', type:'pdf', size:'PDF', thumb:'linear-gradient(135deg,#064e3b,#10b981)', thumbLabel:'📄' },
    { id:'tpl-6', name:'Letter of Engagement', type:'docx', size:'DOCX', thumb:'linear-gradient(135deg,#312e81,#6c47ff)', thumbLabel:'📄' },
    { id:'pk-1', name:'New Client Onboarding Pack', type:'pack', size:'4 docs', thumb:'linear-gradient(135deg,#6c47ff,#a78bfa)', thumbLabel:'📦' },
    { id:'pk-2', name:'FICA Pack — Individual', type:'pack', size:'3 docs', thumb:'linear-gradient(135deg,#6c47ff,#a78bfa)', thumbLabel:'📦' },
    { id:'sa-1', name:'Agreement — Botha Family Trust ✓', type:'pdf', size:'Signed PDF', thumb:'linear-gradient(135deg,#064e3b,#10b981)', thumbLabel:'✓' },
    { id:'sa-2', name:'NDA — Botha Family Trust ✓', type:'pdf', size:'Signed PDF', thumb:'linear-gradient(135deg,#064e3b,#10b981)', thumbLabel:'✓' },
  ],
  client: [
    { id:'cf-1', name:'James Botha — ID Document', type:'pdf', size:'PDF', thumb:'linear-gradient(135deg,#1f2937,#374151)', thumbLabel:'🪪' },
    { id:'cf-2', name:'James Botha — Proof of Address', type:'pdf', size:'PDF', thumb:'linear-gradient(135deg,#1f2937,#374151)', thumbLabel:'🏠' },
    { id:'cf-3', name:'Trust Deed — Botha Family Trust', type:'pdf', size:'PDF', thumb:'linear-gradient(135deg,#312e81,#4f46e5)', thumbLabel:'⚖' },
    { id:'cf-4', name:'Source of Funds Declaration', type:'pdf', size:'PDF', thumb:'linear-gradient(135deg,#064e3b,#059669)', thumbLabel:'💰' },
  ],
  brand: _ML_ASSETS.filter(a=>a.cat==='brand'),
};

function openAfvModal() {
  _afvSelected = new Set();
  _afvSource = 'media';
  _afvFilter = 'all';
  _afvSearch = '';
  document.querySelectorAll('.afv-src-btn').forEach(b=>b.classList.toggle('active',b.dataset.src==='media'));
  const si = document.getElementById('afv-search');
  if(si) si.value='';
  document.querySelectorAll('.vault-filter-chip[data-afvf]').forEach(c=>c.classList.toggle('active',c.dataset.afvf==='all'));
  afvRenderGrid();
  afvUpdateFooter();
  const ov = document.getElementById('afv-overlay');
  if(ov) ov.style.display='flex';
  requestAnimationFrame(()=>{ if(ov) ov.style.opacity='1'; });
}

function closeAfvModal() {
  const ov = document.getElementById('afv-overlay');
  if(ov) ov.style.display='none';
}

function afvSetSource(el, src) {
  document.querySelectorAll('.afv-src-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  _afvSource = src;
  _afvSelected = new Set();
  afvRenderGrid();
  afvUpdateFooter();
}

function afvFilter(el, f) {
  document.querySelectorAll('.vault-filter-chip[data-afvf]').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  _afvFilter = f;
  afvRenderGrid();
}

function afvSearch(q) { _afvSearch=q.toLowerCase(); afvRenderGrid(); }

function afvGetItems() {
  let list = (_AFV_DATA[_afvSource]||[]).slice();
  if(_afvFilter!=='all') list = list.filter(a=>(a.type||'').includes(_afvFilter)||(a.fmt||'').toLowerCase().includes(_afvFilter));
  if(_afvSearch) list = list.filter(a=>a.name.toLowerCase().includes(_afvSearch)||(a.tags||[]).some(t=>t.includes(_afvSearch)));
  return list;
}

function afvRenderGrid() {
  const grid = document.getElementById('afv-grid');
  if(!grid) return;
  const items = afvGetItems();
  if(!items.length) {
    grid.innerHTML='<div style="padding:40px;text-align:center;color:#5A7080;font-size:13px">No items found</div>';
    return;
  }
  grid.innerHTML = items.map(a=>`
    <div class="afv-item ${_afvSelected.has(a.id)?'selected':''}" onclick="afvToggleItem('${a.id}')">
      <div class="afv-item-thumb" style="background:${a.thumb||'linear-gradient(135deg,#374151,#6b7280)'}">${a.thumbLabel||a.name.charAt(0)}</div>
      <div class="afv-item-name">${a.name}</div>
      <div class="afv-item-meta">${a.fmt||a.size||''}</div>
      ${_afvSelected.has(a.id)?'<div class="afv-item-check">✓</div>':''}
    </div>`).join('');
}

function afvToggleItem(id) {
  if(_afvSelected.has(id)) _afvSelected.delete(id); else _afvSelected.add(id);
  afvRenderGrid();
  afvUpdateFooter();
}

function afvUpdateFooter() {
  const n = _afvSelected.size;
  const cnt = document.getElementById('afv-selected-count');
  const lbl = document.getElementById('afv-insert-label');
  const btn = document.getElementById('afv-insert-btn');
  if(cnt) cnt.textContent = n+' item'+(n!==1?'s':'')+' selected';
  if(lbl) lbl.textContent = n ? n+' item'+(n!==1?'s':'')+' ready to insert' : '';
  if(btn) btn.disabled = n===0;
}

function afvInsert() {
  const n = _afvSelected.size;
  if(!n) return;
  closeAfvModal();
  _showToast(n+' item'+(n!==1?'s':'')+' attached to message');
  // wire to composer attach badge if open
  const badge = document.getElementById('msg-attach-badge');
  if(badge) { badge.textContent=n; badge.style.display='flex'; }
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSER ATTACH BUTTON (wired in msg-panel footer)
═══════════════════════════════════════════════════════════════ */
function msgToggleAttachMenu(el) {
  const menu = document.getElementById('msg-attach-menu');
  if(!menu) return;
  const open = menu.classList.toggle('open');
  el.classList.toggle('active', open);
  if(open) {
    const close = function(e){ if(!menu.contains(e.target)&&e.target!==el){ menu.classList.remove('open'); el.classList.remove('active'); document.removeEventListener('click',close); } };
    setTimeout(()=>document.addEventListener('click',close),0);
  }
}

/* ═══════════════════════════════════════════════════════════════
   INIT — run on page load
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Media Library grid when screen is activated
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if(m.target.id==='screen-media-library' && m.target.classList.contains('active')) {
        mlRenderGrid();
      }
    });
  });
  const mlScreen = document.getElementById('screen-media-library');
  if(mlScreen) observer.observe(mlScreen, { attributes:true, attributeFilter:['class'] });
});
