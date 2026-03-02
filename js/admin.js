/* ═══════════════════════════════════════════════════════════════════
   SUPER ADMIN CONSOLE — JS
═══════════════════════════════════════════════════════════════════ */

/* ── Open / close console ── */
function openSuperAdmin() {
  // Hide main app sidebar and content so nothing bleeds through
  const mainSidebar = document.querySelector('nav.sidebar, nav#sidebar, aside.sidebar, .app-sidebar');
  if (mainSidebar) mainSidebar.setAttribute('data-sa-hidden','1') && (mainSidebar.style.zIndex='0');
  document.getElementById('sa-console').classList.add('open');
  document.body.style.overflow = 'hidden';
  saScreen('sa-overview');
}
function closeSuperAdmin() {
  document.getElementById('sa-console').classList.remove('open');
  document.body.style.overflow = '';
  const mainSidebar = document.querySelector('[data-sa-hidden="1"]');
  if (mainSidebar) { mainSidebar.removeAttribute('data-sa-hidden'); mainSidebar.style.zIndex = ''; }
}

/* ── Screen switching ── */
function saScreen(id) {
  document.querySelectorAll('.sa-screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  document.querySelectorAll('.sa-nav-item[data-sa]').forEach(i => i.classList.remove('active'));
  const navItem = document.querySelector('.sa-nav-item[data-sa="' + id + '"]');
  if (navItem) navItem.classList.add('active');
  // If navigating to tenants, make sure list is visible
  if (id === 'sa-tenants') {
    const list = document.getElementById('sa-tenants-list');
    const detail = document.getElementById('sa-tenant-detail');
    if (list) list.style.display = 'flex';
    if (detail) detail.style.display = 'none';
  }
}

/* ── Tenant detail ── */
const _SA_TENANTS = {
  't1': { name:'Botha Family Trust', email:'james@botha.co.za', plan:'Professional', status:'Active', seats:'5 / 10', seatPct:50, mrr:'R1,499', created:'12 Oct 2024', activity:'22 Feb 2026', badgeClass:'active', sub:'Professional Plan · 5 / 10 seats · R1,499/mo', loginUser:'James Botha' },
  't2': { name:'Meridian Properties', email:'admin@meridian.co.za', plan:'Enterprise', status:'Active', seats:'18 / 25', seatPct:72, mrr:'R4,999', created:'05 Jun 2023', activity:'24 Feb 2026', badgeClass:'active', sub:'Enterprise Plan · 18 / 25 seats · R4,999/mo', loginUser:'Sarah van Niekerk' },
  't3': { name:'Khumalo Investments', email:'thabo@khumalo.co.za', plan:'Professional', status:'Active – Overdue', seats:'3 / 10', seatPct:30, mrr:'R1,499', created:'18 Mar 2024', activity:'20 Feb 2026', badgeClass:'overdue', sub:'Professional Plan · Overdue 18d · R5,996 outstanding', loginUser:'Thabo Khumalo' },
  't4': { name:'Orion Capital', email:'david@orioncapital.co.za', plan:'Starter (Trial)', status:'Trial', seats:'2 / 5', seatPct:40, mrr:'—', created:'15 Feb 2026', activity:'19 Feb 2026', badgeClass:'trial', sub:'Starter Trial · 12 days remaining · No payment method', loginUser:'David Orion' },
  't5': { name:'Cape Compliance Co', email:'info@capecompliance.co.za', plan:'Professional', status:'Suspended', seats:'4 / 10', seatPct:40, mrr:'R1,499', created:'03 Sep 2022', activity:'14 Feb 2026', badgeClass:'suspended', sub:'Professional Plan · SUSPENDED · NON_PAYMENT · R14,955 outstanding', loginUser:'Cape Admin' },
  't6': { name:'Sanlam Wealth Partners', email:'ops@sanlamwealth.co.za', plan:'Enterprise', status:'Active', seats:'22 / 50', seatPct:44, mrr:'R4,999', created:'12 Jan 2023', activity:'23 Feb 2026', badgeClass:'active', sub:'Enterprise Plan · 22 / 50 seats · R4,999/mo', loginUser:'Lwazi Dlamini' },
};

function saOpenTenantDetail(tid) {
  const t = _SA_TENANTS[tid];
  if (!t) return;
  // Populate
  document.getElementById('sa-detail-name').textContent = t.name;
  document.getElementById('sa-detail-sub').textContent = t.sub;
  document.getElementById('sa-detail-status').className = 'sa-badge ' + t.badgeClass;
  document.getElementById('sa-detail-status').textContent = t.status;
  document.getElementById('sd-name').textContent = t.name;
  document.getElementById('sd-email').textContent = t.email;
  document.getElementById('sd-plan').textContent = t.plan;
  document.getElementById('sd-status').textContent = t.status;
  document.getElementById('sd-seats').textContent = t.seats;
  document.getElementById('sd-seat-fill').style.width = t.seatPct + '%';
  document.getElementById('sd-seat-fill').className = 'sa-progress-fill' + (t.seatPct >= 80 ? ' danger' : t.seatPct >= 60 ? ' amber' : '');
  document.getElementById('sd-mrr').textContent = t.mrr;
  document.getElementById('sd-created').textContent = t.created;
  document.getElementById('sd-activity').textContent = t.activity;
  // Action buttons
  document.getElementById('sa-d-login-btn').onclick = function(){ saOpenImpersonationModal(t.loginUser, t.name, tid); };
  document.getElementById('sa-d-suspend-btn').onclick = function(){ saOpenSuspendModal(tid, t.name); };
  // Switch to tenants screen and show detail
  saScreen('sa-tenants');
  document.getElementById('sa-tenants-list').style.display = 'none';
  document.getElementById('sa-tenant-detail').style.display = 'flex';
  // Reset tabs
  saDTab(document.querySelector('.sa-tab[data-dt="dt-overview"]'), 'dt-overview');
}

function saCloseTenantDetail() {
  document.getElementById('sa-tenants-list').style.display = 'flex';
  document.getElementById('sa-tenant-detail').style.display = 'none';
}

/* ── Detail tabs ── */
function saDTab(el, id) {
  document.querySelectorAll('.sa-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['dt-overview','dt-users','dt-billing','dt-usage','dt-audit'].forEach(tid => {
    const el = document.getElementById(tid);
    if (el) el.style.display = tid === id ? '' : 'none';
  });
}

/* ── Tenant table filtering ── */
function saTenantFilter(el, f) {
  document.querySelectorAll('.sa-filter-chip[data-tf]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#sa-tenants-tbody tr').forEach(row => {
    const st = row.dataset.status || '';
    const bi = row.dataset.billing || '';
    const match = f === 'all' || st === f || (f === 'overdue' && bi === 'overdue');
    row.style.display = match ? '' : 'none';
  });
}

function saFilterTenants(q) {
  const low = q.toLowerCase();
  document.querySelectorAll('#sa-tenants-tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(low) ? '' : 'none';
  });
}

/* ── User table filtering ── */
function saUserFilter(el, f) {
  document.querySelectorAll('.sa-filter-chip[data-uf]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#sa-users-table tbody tr').forEach(row => {
    const st = row.dataset.ustatus || '';
    const role = row.dataset.urole || '';
    const match = f === 'all' || st === f || (f === 'admin' && role === 'admin');
    row.style.display = match ? '' : 'none';
  });
}

function saFilterUsers(q) {
  const low = q.toLowerCase();
  document.querySelectorAll('#sa-users-table tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(low) ? '' : 'none';
  });
}

/* ── Invoice filtering ── */
function saFilterInvoices(status, el) {
  if (el) {
    document.querySelectorAll('#sa-invoices .sa-filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }
  document.querySelectorAll('#sa-invoices-tbody tr').forEach(row => {
    const st = row.dataset.invStatus || '';
    row.style.display = (!status || status === 'all' || st === status) ? '' : 'none';
  });
}

/* ── Global search ── */
function saGlobalSearch(q) {
  if (!q || q.length < 2) return;
  const low = q.toLowerCase();
  // Check tenants
  const tenantMatch = Object.entries(_SA_TENANTS).find(([id,t]) =>
    t.name.toLowerCase().includes(low) || t.email.toLowerCase().includes(low));
  if (tenantMatch) {
    _showToast('Found tenant: ' + tenantMatch[1].name + ' — navigating…');
    setTimeout(() => saOpenTenantDetail(tenantMatch[0]), 600);
    return;
  }
  // Check invoices
  if (low.startsWith('inv')) {
    saScreen('sa-invoices');
    _showToast('Searching invoices for: ' + q);
    return;
  }
  _showToast('Searching platform for: "' + q + '"');
}

/* ── Impersonation modal ── */
let _saImpTarget = { name:'', tenant:'', tid:'' };
function saOpenImpersonationModal(name, tenant, tid) {
  _saImpTarget = { name, tenant, tid };
  document.getElementById('sa-imp-target-name').textContent = name;
  document.getElementById('sa-imp-target-tenant').textContent = tenant;
  document.getElementById('sa-imp-reason').value = '';
  document.getElementById('sa-imp-password').value = '';
  document.getElementById('sa-imp-overlay').classList.add('open');
}
function closeSaImpModal() {
  document.getElementById('sa-imp-overlay').classList.remove('open');
}

function saStartImpersonation() {
  const reason = document.getElementById('sa-imp-reason').value.trim();
  const pwd = document.getElementById('sa-imp-password').value.trim();
  if (!reason) { _showToast('Please enter a reason for impersonation'); return; }
  if (!pwd) { _showToast('Please confirm your identity with your password'); return; }
  closeSaImpModal();
  closeSuperAdmin();
  // Show banner
  const banner = document.getElementById('sa-imp-banner');
  banner.classList.add('active');
  document.getElementById('sa-imp-banner-text').textContent = 'You are impersonating ' + _saImpTarget.name + ' (' + _saImpTarget.tenant + ') · Reason: ' + reason.slice(0,60) + (reason.length>60?'…':'');
  // Start 15-minute countdown
  _saStartImpTimer(15 * 60);
  _showToast('⚠ Impersonation session started — all actions are being logged');
}

let _saImpTimerInterval = null;
function _saStartImpTimer(seconds) {
  if (_saImpTimerInterval) clearInterval(_saImpTimerInterval);
  let rem = seconds;
  const timerEl = document.getElementById('sa-imp-timer');
  _saImpTimerInterval = setInterval(function() {
    rem--;
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    if (timerEl) timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s + ' remaining';
    if (rem <= 0) {
      clearInterval(_saImpTimerInterval);
      saEndImpersonation();
      _showToast('Impersonation session expired — automatically ended');
    }
  }, 1000);
}

function saEndImpersonation() {
  if (_saImpTimerInterval) clearInterval(_saImpTimerInterval);
  document.getElementById('sa-imp-banner').classList.remove('active');
  _showToast('Impersonation session ended · Session logged to audit trail');
}

/* ── Suspend modal ── */
let _saSusTarget = { tid:'', name:'' };
function saOpenSuspendModal(tid, name) {
  _saSusTarget = { tid, name };
  document.getElementById('sa-sus-target-name').textContent = name;
  document.getElementById('sa-sus-reason-code').value = '';
  document.getElementById('sa-sus-notes').value = '';
  document.getElementById('sa-sus-date').value = new Date().toISOString().slice(0,10);
  document.getElementById('sa-sus-readonly').checked = false;
  document.getElementById('sa-suspend-overlay').classList.add('open');
}
function closeSaSuspendModal() {
  document.getElementById('sa-suspend-overlay').classList.remove('open');
}
function saConfirmSuspend() {
  const code = document.getElementById('sa-sus-reason-code').value;
  if (!code) { _showToast('Please select a suspension reason code'); return; }
  closeSaSuspendModal();
  _showToast('✓ ' + _saSusTarget.name + ' suspended · Reason: ' + code + ' · Logged to audit trail');
  // Update the badge in the tenants table
  const row = document.querySelector('#sa-tenants-tbody tr[data-tid="' + _saSusTarget.tid + '"]');
  if (row) {
    row.dataset.status = 'suspended';
    const statusCell = row.querySelector('.sa-badge.active, .sa-badge.trial');
    if (statusCell) { statusCell.className = 'sa-badge suspended'; statusCell.innerHTML = '<span class="sa-badge-dot" style="background:#ef4444"></span>Suspended'; }
  }
}

/* ── Keyboard shortcut to exit console ── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const con = document.getElementById('sa-console');
    if (con && con.classList.contains('open')) closeSuperAdmin();
    const impOv = document.getElementById('sa-imp-overlay');
    if (impOv && impOv.classList.contains('open')) closeSaImpModal();
    const susOv = document.getElementById('sa-suspend-overlay');
    if (susOv && susOv.classList.contains('open')) closeSaSuspendModal();
  }
});

/* ═══════════════════════════════════════════════════════
   SETTINGS CONSOLE  JS
   ═══════════════════════════════════════════════════════ */

/* ── Open / Close ─────────────────────────────────── */
function openSettings(section) {
  const cons = document.getElementById('settings-console');
  if (!cons) return;
  cons.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Default to profile; optionally jump to a section
  const target = section || 'stg-profile';
  const navEl = document.querySelector('[data-stg="' + target + '"]');
  stgNav(navEl || document.querySelector('.stg-nav-item'), target, null);
}

function closeSettings() {
  const cons = document.getElementById('settings-console');
  if (cons) cons.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Screen switching ─────────────────────────────── */
function stgNav(el, screenId, label) {
  if (screenId === 'stg-superadmin') { setTimeout(saRefresh, 80); }
  if (screenId === 'stg-team') { setTimeout(renderTeamAccess, 80); }
  if (!screenId) return;
  // Update nav items
  document.querySelectorAll('.stg-nav-item').forEach(function(n) {
    n.classList.remove('active');
  });
  if (el) el.classList.add('active');
  // Update screens
  document.querySelectorAll('.stg-screen').forEach(function(s) {
    s.classList.remove('active');
  });
  const sc = document.getElementById(screenId);
  if (sc) sc.classList.add('active');
  // Topbar label
  if (label) {
    const lbl = document.getElementById('stg-topbar-label');
    if (lbl) lbl.textContent = 'Settings — ' + label;
  }
}

/* ── Profile ─────────────────────────────────────── */
function stgSaveProfile() {
  const first = document.getElementById('stg-first-name');
  const last  = document.getElementById('stg-last-name');
  if (first && last) {
    const name = first.value.trim() + ' ' + last.value.trim();
    // Update avatar initials
    const initEl = document.getElementById('stg-av-initials');
    if (initEl) {
      const parts = name.split(' ');
      initEl.textContent = (parts[0][0] || '') + (parts[1] ? parts[1][0] : '');
    }
    const nameEl = document.getElementById('stg-av-name');
    if (nameEl) nameEl.textContent = name;
  }
  showToast('Profile saved');
}

function stgResetProfile() {
  const fields = ['stg-first-name','stg-last-name','stg-email','stg-phone','stg-jobtitle'];
  const defaults = { 'stg-first-name':'Fritz','stg-last-name':'Dalton',
                     'stg-email':'fritz@novatrai.com','stg-phone':'+1 (555) 012-3456',
                     'stg-jobtitle':'Operations Lead' };
  fields.forEach(function(id) {
    const el = document.getElementById(id);
    if (el && defaults[id]) el.value = defaults[id];
  });
  showToast('Changes discarded');
}

function stgSaveLocale() {
  showToast('Locale preferences saved');
}

/* ── Security ─────────────────────────────────────── */
function stgChangePassword() {
  const cur  = (document.getElementById('stg-pwd-current') || {}).value || '';
  const nw   = (document.getElementById('stg-pwd-new')     || {}).value || '';
  const conf = (document.getElementById('stg-pwd-confirm') || {}).value || '';
  if (!cur) { showToast('Enter your current password'); return; }
  if (nw.length < 8) { showToast('New password must be at least 8 characters'); return; }
  if (nw !== conf)   { showToast('Passwords do not match'); return; }
  // Clear fields
  ['stg-pwd-current','stg-pwd-new','stg-pwd-confirm'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  showToast('Password updated successfully');
}

var _stgMfaEnabled = false;
function stgToggleMfa() {
  _stgMfaEnabled = !_stgMfaEnabled;
  const icon  = document.getElementById('stg-mfa-icon');
  const title = document.getElementById('stg-mfa-title');
  const sub   = document.getElementById('stg-mfa-sub');
  const btn   = document.getElementById('stg-mfa-btn');
  if (_stgMfaEnabled) {
    if (icon)  { icon.className = 'stg-mfa-icon enabled'; }
    if (title) title.textContent = '2FA is enabled';
    if (sub)   sub.textContent = 'Your account is protected with two-factor authentication';
    if (btn)   { btn.textContent = 'Disable 2FA'; btn.className = 'stg-btn stg-btn-danger stg-btn-sm'; }
    showToast('Two-factor authentication enabled');
  } else {
    if (icon)  { icon.className = 'stg-mfa-icon disabled'; }
    if (title) title.textContent = '2FA is not enabled';
    if (sub)   sub.textContent = 'Add an extra layer of security to your account';
    if (btn)   { btn.textContent = 'Enable 2FA'; btn.className = 'stg-btn stg-btn-primary stg-btn-sm'; }
    showToast('Two-factor authentication disabled');
  }
}

function stgRevokeSession(btn, name) {
  if (!btn) return;
  const row = btn.closest('tr');
  if (row) row.remove();
  showToast('Session "' + name + '" revoked');
}

function stgRevokeAll() {
  const rows = document.querySelectorAll('#stg-security .stg-sessions-table tbody tr');
  rows.forEach(function(r) {
    // Keep the "current" row
    if (!r.querySelector('.stg-badge-current')) r.remove();
  });
  showToast('All other sessions revoked');
}

/* ── API Tokens ───────────────────────────────────── */
function stgCreateToken() {
  const nameEl = document.getElementById('stg-new-token-name');
  if (!nameEl || !nameEl.value.trim()) { showToast('Enter a token name'); return; }
  const name = nameEl.value.trim();
  const list = document.getElementById('stg-token-list');
  if (!list) return;
  const rand = Math.random().toString(36).substring(2,6);
  const row  = document.createElement('div');
  row.className = 'stg-token-row';
  row.innerHTML = [
    '<div class="stg-token-info">',
    '  <div class="stg-token-name">' + name + '</div>',
    '  <div class="stg-token-meta">Created just now · Never used</div>',
    '</div>',
    '<span class="stg-token-key" style="color:#4A8FFF">cf_live_' + rand + Math.random().toString(36).substring(2,10) + '</span>',
    '<button class="stg-btn stg-btn-danger stg-btn-sm" data-tn="' + name + '" onclick="stgRevokeToken(this, this.dataset.tn)">Revoke</button>'
  ].join('');
  list.appendChild(row);
  nameEl.value = '';
  showToast('Token created — copy it now, it will not be shown again');
}

function stgRevokeToken(btn, name) {
  if (!btn) return;
  const row = btn.closest('.stg-token-row');
  if (row) row.remove();
  showToast('Token "' + name + '" revoked');
}

/* ── Roles & Permissions matrix ──────────────────── */
var _PERM_DATA = [
  // [label, owner, admin, salesrep, support, viewer]
  // locked value = 'L1' (always checked, locked) or 'L0' (always unchecked, locked)
  ['View Contacts',         'L1','L1','1','1','1'],
  ['Edit Contacts',         'L1','L1','1','0','0'],
  ['Delete Contacts',       'L1','1', '0','0','0'],
  ['View Deals',            'L1','L1','1','0','1'],
  ['Edit Deals',            'L1','L1','1','0','0'],
  ['Delete Deals',          'L1','1', '0','0','0'],
  ['View Financials',       'L1','L1','1','0','1'],
  ['Create Invoices',       'L1','L1','1','0','0'],
  ['Approve Invoices',      'L1','L1','0','0','0'],
  ['Delete Invoices',       'L1','1', '0','0','L0'],
  ['Manage Templates',      'L1','L1','1','0','0'],
  ['View Reports',          'L1','L1','1','0','1'],
  ['Export Data',           'L1','1', '0','0','0'],
  ['Manage Integrations',   'L1','1', '0','0','0'],
  ['Manage Automations',    'L1','1', '0','0','0'],
  ['Invite Team Members',   'L1','1', '0','0','0'],
  ['Manage Roles',          'L1','1', '0','0','0'],
  ['Billing & Subscription','L1','1', '0','0','0'],
  ['Workspace Settings',    'L1','1', '0','0','0'],
];

function stgLoadPermMatrix() {
  var grid = document.getElementById('stg-roles-matrix');
  if (!grid) return;
  // Keep the header row (first 6 children)
  while (grid.children.length > 6) grid.removeChild(grid.lastChild);

  _PERM_DATA.forEach(function(row) {
    var label = row[0];
    var labelDiv = document.createElement('div');
    labelDiv.className = 'stg-roles-row';

    var featureCell = document.createElement('div');
    featureCell.textContent = label;
    labelDiv.appendChild(featureCell);

    for (var i = 1; i <= 5; i++) {
      var val = row[i];
      var cell = document.createElement('div');
      var box  = document.createElement('div');
      box.className = 'stg-perm-check';
      if (val === 'L1') { box.classList.add('checked','locked'); }
      else if (val === 'L0') { box.classList.add('locked'); }
      else if (val === '1') { box.classList.add('checked'); }
      if (!box.classList.contains('locked')) {
        box.onclick = (function(b) {
          return function() { b.classList.toggle('checked'); };
        })(box);
      }
      cell.appendChild(box);
      labelDiv.appendChild(cell);
    }
    grid.appendChild(labelDiv);
  });
}

/* ── Wire keyboard shortcut ──────────────────────── */
/* ── Team & Access ────────────────────────────────── */
var _teamExpandedUser = null;
var _TEAM_AV_COLORS=['#6366f1','#8B5CF6','#EC4899','#EF4444','#F59E0B','#10B981','#14B8A6','#3B82F6','#6D28D9','#059669'];
function _teamAvatarColor(n){ var h=0; for(var i=0;i<n.length;i++) h=n.charCodeAt(i)+((h<<5)-h); return _TEAM_AV_COLORS[Math.abs(h)%_TEAM_AV_COLORS.length]; }

var _roleLabels = {owner:'Owner',admin:'Admin','sales-rep':'Sales Rep',support:'Support',viewer:'Viewer'};

function renderTeamAccess(){
  var users = window.SYSTEM_USERS || [];
  var search = (document.getElementById('team-search')||{}).value || '';
  var roleF = (document.getElementById('team-role-filter')||{}).value || '';
  var statusF = (document.getElementById('team-status-filter')||{}).value || '';

  // Stats
  var total=users.length, active=0, invited=0, suspended=0;
  users.forEach(function(u){ if(u.status==='active') active++; if(u.status==='invited') invited++; if(u.status==='suspended') suspended++; });
  var statsEl=document.getElementById('team-stats-bar');
  if(statsEl) statsEl.innerHTML=
    '<div class="team-stat-box"><div class="team-stat-val">'+total+'</div><div class="team-stat-label">Total Users</div></div>'+
    '<div class="team-stat-box"><div class="team-stat-val" style="color:#10B981">'+active+'</div><div class="team-stat-label">Active</div></div>'+
    '<div class="team-stat-box"><div class="team-stat-val" style="color:#F59E0B">'+invited+'</div><div class="team-stat-label">Invited</div></div>'+
    '<div class="team-stat-box"><div class="team-stat-val" style="color:#EF4444">'+suspended+'</div><div class="team-stat-label">Suspended</div></div>';

  // Filter users
  var filtered=users.filter(function(u){
    if(roleF && u.role!==roleF) return false;
    if(statusF && u.status!==statusF) return false;
    if(search){
      var s=search.toLowerCase();
      var name=(u.firstName+' '+u.lastName).toLowerCase();
      if(name.indexOf(s)===-1 && u.email.toLowerCase().indexOf(s)===-1) return false;
    }
    return true;
  });

  // Team table
  var tbl='<table class="team-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Linked Employee</th><th>Last Active</th><th>Actions</th></tr></thead><tbody>';
  if(filtered.length===0){
    tbl+='<tr><td colspan="6" style="text-align:center;color:#5A7080;padding:20px;">No users match the filters.</td></tr>';
  } else {
    filtered.forEach(function(u){
      var ini=(u.firstName.charAt(0)+u.lastName.charAt(0)).toUpperCase();
      var col=_teamAvatarColor(u.firstName+u.lastName);
      var empLink=u.empId?u.empId:'<span style="color:#5A7080;font-style:italic;">External</span>';
      var lastAct=u.lastActive?new Date(u.lastActive).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'}):'—';
      var isExpanded=_teamExpandedUser===u.id;

      tbl+='<tr>'+
        '<td><div class="team-user-cell"><div class="team-avatar" style="background:'+col+'">'+ini+'</div><div class="team-user-info"><div class="team-user-name">'+u.firstName+' '+u.lastName+'</div><div class="team-user-email">'+u.email+'</div></div></div></td>'+
        '<td><span class="team-role-badge '+u.role+'">'+(_roleLabels[u.role]||u.role)+'</span></td>'+
        '<td><span class="team-status-badge '+u.status+'">'+u.status.charAt(0).toUpperCase()+u.status.slice(1)+'</span></td>'+
        '<td>'+empLink+'</td>'+
        '<td>'+lastAct+'</td>'+
        '<td><div class="team-actions">'+
          '<button onclick="openEditUserModal(\''+u.id+'\')" title="Edit">Edit</button>'+
          (u.role!=='owner'?
            (u.status==='suspended'?
              '<button onclick="toggleUserStatus(\''+u.id+'\')" title="Reactivate">Reactivate</button>':
              '<button onclick="toggleUserStatus(\''+u.id+'\')" title="Suspend" class="danger">Suspend</button>'
            ):'') +
          (u.status==='active'||u.status==='invited'?'<button onclick="resetUserPassword(\''+u.id+'\')" title="Reset Password">Reset PW</button>':'')+
          '<button onclick="viewUserActivity(\''+u.id+'\')" title="Activity">'+(isExpanded?'Hide':'Activity')+'</button>'+
          (u.role!=='owner'?'<button onclick="removeUser(\''+u.id+'\')" title="Remove" class="danger">Remove</button>':'')+
        '</div></td>'+
      '</tr>';

      // Expanded activity log
      if(isExpanded && u.activityLog.length>0){
        tbl+='<tr><td colspan="6" style="padding:0 8px 8px;"><div class="team-expanded-log">';
        u.activityLog.slice().sort(function(a,b){return b.date-a.date;}).forEach(function(a){
          var d=new Date(a.date).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
          tbl+='<div class="team-activity-row">'+
            '<span class="team-activity-action">'+a.action+'</span>'+
            '<span class="team-activity-detail">'+a.detail+'</span>'+
            '<span class="team-activity-date">'+d+'</span>'+
          '</div>';
        });
        tbl+='</div></td></tr>';
      }
    });
  }
  tbl+='</tbody></table>';
  var tableEl=document.getElementById('team-members-table');
  if(tableEl) tableEl.innerHTML=tbl;

  // Recent activity across all users (last 30 entries)
  var allActivity=[];
  users.forEach(function(u){
    (u.activityLog||[]).forEach(function(a){
      allActivity.push({userId:u.id,userName:u.firstName+' '+u.lastName,action:a.action,detail:a.detail,date:a.date});
    });
  });
  allActivity.sort(function(a,b){return b.date-a.date;});
  allActivity=allActivity.slice(0,30);

  var actHtml='';
  if(allActivity.length===0){
    actHtml='<div style="color:#5A7080;font-size:12px;text-align:center;padding:16px;">No activity recorded yet.</div>';
  } else {
    allActivity.forEach(function(a){
      var d=new Date(a.date).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
      actHtml+='<div class="team-activity-row">'+
        '<span class="team-activity-user">'+a.userName+'</span>'+
        '<span class="team-activity-action">'+a.action+'</span>'+
        '<span class="team-activity-detail">'+a.detail+'</span>'+
        '<span class="team-activity-date">'+d+'</span>'+
      '</div>';
    });
  }
  var actEl=document.getElementById('team-activity-log');
  if(actEl) actEl.innerHTML=actHtml;
}

window.openInviteUserModal=function(){
  document.getElementById('inv-firstName').value='';
  document.getElementById('inv-lastName').value='';
  document.getElementById('inv-email').value='';
  document.getElementById('inv-role').value='viewer';
  document.getElementById('inv-link-row').style.display='none';
  // Populate employee dropdown
  var sel=document.getElementById('inv-empLink');
  sel.innerHTML='<option value="">— None (external user) —</option>';
  var usedEmpIds=(window.SYSTEM_USERS||[]).map(function(u){return u.empId;}).filter(Boolean);
  (window.EMPLOYEES_DATA||[]).forEach(function(e){
    if(usedEmpIds.indexOf(e.id)===-1){
      sel.innerHTML+='<option value="'+e.id+'">'+e.firstName+' '+e.lastName+' ('+e.id+')</option>';
    }
  });
  document.getElementById('invite-user-overlay').classList.add('open');
};
window.closeInviteUserModal=function(){ document.getElementById('invite-user-overlay').classList.remove('open'); };

window.submitInviteUser=function(){
  var fn=document.getElementById('inv-firstName').value.trim();
  var ln=document.getElementById('inv-lastName').value.trim();
  var em=document.getElementById('inv-email').value.trim();
  var role=document.getElementById('inv-role').value;
  var empLink=document.getElementById('inv-empLink').value||null;
  if(!fn||!ln||!em){ alert('First name, last name, and email are required.'); return; }
  var users=window.SYSTEM_USERS=window.SYSTEM_USERS||[];
  var existing=users.find(function(u){return u.email.toLowerCase()===em.toLowerCase();});
  if(existing){ alert('A user with this email already exists.'); return; }
  var newUser={
    id:'USR-'+Date.now(),empId:empLink,firstName:fn,lastName:ln,email:em,role:role,status:'invited',
    invitedAt:Date.now(),joinedAt:null,lastActive:null,lastLogin:null,loginCount:0,
    activityLog:[{action:'user.invited',date:Date.now(),detail:'Invited by Current User'}]
  };
  users.push(newUser);
  // Show invite link
  var slug='novatrai';
  var link='https://'+slug+'.thebos.app/invite/'+newUser.id.toLowerCase();
  document.getElementById('inv-link').value=link;
  document.getElementById('inv-link-row').style.display='';
  renderTeamAccess();
  if(window.showToast) showToast('Invite sent to '+fn+' '+ln);
};

window.copyInviteLink=function(){
  var el=document.getElementById('inv-link');
  if(el){ el.select(); document.execCommand('copy'); }
  if(window.showToast) showToast('Invite link copied to clipboard');
};

window.openEditUserModal=function(userId){
  var users=window.SYSTEM_USERS||[];
  var u=users.find(function(x){return x.id===userId;});
  if(!u) return;
  document.getElementById('edtu-name').textContent=u.firstName+' '+u.lastName+' ('+u.id+')';
  document.getElementById('edtu-email').value=u.email;
  document.getElementById('edtu-role').value=u.role;
  // Populate employee dropdown
  var sel=document.getElementById('edtu-empLink');
  sel.innerHTML='<option value="">— None (external user) —</option>';
  var usedEmpIds=users.filter(function(x){return x.id!==userId;}).map(function(x){return x.empId;}).filter(Boolean);
  (window.EMPLOYEES_DATA||[]).forEach(function(e){
    if(usedEmpIds.indexOf(e.id)===-1){
      var selected=e.id===u.empId?' selected':'';
      sel.innerHTML+='<option value="'+e.id+'"'+selected+'>'+e.firstName+' '+e.lastName+' ('+e.id+')</option>';
    }
  });
  document.getElementById('edit-user-overlay').classList.add('open');
  document.getElementById('edit-user-overlay').dataset.userId=userId;
};
window.closeEditUserModal=function(){ document.getElementById('edit-user-overlay').classList.remove('open'); };

window.submitEditUser=function(){
  var userId=document.getElementById('edit-user-overlay').dataset.userId;
  var users=window.SYSTEM_USERS||[];
  var u=users.find(function(x){return x.id===userId;});
  if(!u) return;
  var newEmail=document.getElementById('edtu-email').value.trim();
  var newRole=document.getElementById('edtu-role').value;
  var newEmp=document.getElementById('edtu-empLink').value||null;
  var changes=[];
  if(newEmail!==u.email){ changes.push('Email: '+u.email+' → '+newEmail); u.email=newEmail; }
  if(newRole!==u.role){ changes.push('Role: '+(_roleLabels[u.role]||u.role)+' → '+(_roleLabels[newRole]||newRole)); u.role=newRole; }
  if(newEmp!==u.empId){ changes.push('Employee link: '+(u.empId||'none')+' → '+(newEmp||'none')); u.empId=newEmp; }
  if(changes.length===0){ alert('No changes detected.'); return; }
  u.activityLog.push({action:'user.updated',date:Date.now(),detail:changes.join(', ')});
  closeEditUserModal();
  renderTeamAccess();
  if(window.showToast) showToast('User updated: '+u.firstName+' '+u.lastName);
};

window.toggleUserStatus=function(userId){
  var users=window.SYSTEM_USERS||[];
  var u=users.find(function(x){return x.id===userId;});
  if(!u||u.role==='owner') return;
  if(u.status==='suspended'){
    u.status='active';
    u.activityLog.push({action:'status.reactivated',date:Date.now(),detail:'Account reactivated by Current User'});
    if(window.showToast) showToast(u.firstName+' '+u.lastName+' reactivated');
  } else {
    u.status='suspended';
    u.activityLog.push({action:'status.suspended',date:Date.now(),detail:'Account suspended by Current User'});
    if(window.showToast) showToast(u.firstName+' '+u.lastName+' suspended');
  }
  renderTeamAccess();
};

window.resetUserPassword=function(userId){
  var users=window.SYSTEM_USERS||[];
  var u=users.find(function(x){return x.id===userId;});
  if(!u) return;
  u.activityLog.push({action:'password.reset',date:Date.now(),detail:'Password reset link sent to '+u.email});
  if(window.showToast) showToast('Password reset link sent to '+u.email);
  renderTeamAccess();
};

window.removeUser=function(userId){
  var users=window.SYSTEM_USERS||[];
  var u=users.find(function(x){return x.id===userId;});
  if(!u||u.role==='owner') return;
  if(!confirm('Remove '+u.firstName+' '+u.lastName+' from the system? This cannot be undone.')) return;
  var idx=users.indexOf(u);
  if(idx>-1) users.splice(idx,1);
  if(window.showToast) showToast(u.firstName+' '+u.lastName+' removed');
  renderTeamAccess();
};

window.viewUserActivity=function(userId){
  _teamExpandedUser=_teamExpandedUser===userId?null:userId;
  renderTeamAccess();
};

document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === ',') {
    e.preventDefault();
    if (document.getElementById('settings-console') &&
        document.getElementById('settings-console').classList.contains('open')) {
      closeSettings();
    } else {
      openSettings();
    }
  }
});


/* ═══════════════════════════════════════════════════════
   NEW COMPANY — AI Enrichment JS
   ═══════════════════════════════════════════════════════ */

var _newcoSelectedMembers = new Set([1,2,3,4,5]);
var _newcoAllSelected = true;

function openNewCompanyModal() {
  var overlay = document.getElementById('newco-overlay');
  if (!overlay) return;
  // Reset to step 1
  document.getElementById('newco-modal-s1').style.display = '';
  document.getElementById('newco-modal-s2').style.display = 'none';
  document.getElementById('newco-modal-s3').style.display = 'none';
  // Clear inputs
  var ni = document.getElementById('newco-name-input');
  var ui = document.getElementById('newco-url-input');
  if (ni) ni.value = '';
  if (ui) ui.value = '';
  // Reset steps
  ['newco-ind-1','newco-ind-2','newco-ind-3'].forEach(function(id,i) {
    var el = document.getElementById(id);
    if (el) { el.className = 'newco-step' + (i===0?' active':''); }
  });
  ['newco-line-1','newco-line-2'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.className = 'newco-step-line';
  });
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(function() { var ui2 = document.getElementById('newco-url-input'); if(ui2) ui2.focus(); }, 150);
}

function closeNewCompany() {
  var overlay = document.getElementById('newco-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Start enrichment ──────────────────────────────── */
function newcoStartEnrich() {
  var urlEl = document.getElementById('newco-url-input');
  var url = urlEl ? urlEl.value.trim() : '';
  if (!url) {
    if (urlEl) { urlEl.style.outline = '2px solid #F07070'; setTimeout(function(){ urlEl.style.outline=''; }, 1200); }
    showToast('Enter a company website URL');
    return;
  }
  // Normalise domain display
  url = url.replace(/^https?:\/\//,'').replace(/\/.*$/,'');
  if (urlEl) urlEl.value = url;

  // Transition to step 2
  document.getElementById('newco-modal-s1').style.display = 'none';
  document.getElementById('newco-modal-s2').style.display = '';

  // Update domain label
  var domEl = document.getElementById('newco-enrich-domain');
  if (domEl) domEl.textContent = url;

  // Reset all progress items
  for (var i=1; i<=5; i++) {
    var item = document.getElementById('ncp-'+i);
    if (item) item.className = 'newco-progress-item';
  }

  // Animate progress steps
  _newcoRunProgress(url);
}

function _newcoRunProgress(url) {
  var timings = [600, 1200, 2000, 2800, 3400]; // ms for each step to complete
  var badges  = [null, null, '5 found', null, null];
  var titles  = [
    'Fetching website…',
    'Reading About Us…',
    'Scanning team page…',
    'Researching leadership…',
    'Building intelligence…'
  ];

  function activateStep(n) {
    var item = document.getElementById('ncp-'+n);
    if (!item) return;
    item.className = 'newco-progress-item active';
    // Swap static icon for spinning one
    var icon = item.querySelector('.ncp-icon');
    if (icon) icon.classList.add('ncp-spin');
    // Update title
    var titleEl = document.getElementById('newco-enrich-title');
    if (titleEl && titles[n-1]) titleEl.textContent = titles[n-1];
  }

  function doneStep(n) {
    var item = document.getElementById('ncp-'+n);
    if (!item) return;
    item.className = 'newco-progress-item done';
    var icon = item.querySelector('.ncp-icon');
    if (icon) {
      icon.classList.remove('ncp-spin');
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>';
      icon.setAttribute('viewBox','0 0 24 24');
    }
    // Update badge text if needed
    if (badges[n-1]) {
      var badge = item.querySelector('.ncp-badge');
      if (badge) badge.textContent = badges[n-1];
    }
  }

  // Fire steps
  activateStep(1);
  for (var s = 1; s <= 5; s++) {
    (function(step, delay) {
      setTimeout(function() {
        doneStep(step);
        if (step < 5) activateStep(step+1);
        if (step === 5) {
          // Done — transition to step 3 after short pause
          setTimeout(function() { _newcoShowReview(url); }, 400);
        }
      }, delay);
    })(s, timings[s-1]);
  }
}

/* ── Show review step ───────────────────────────────── */
function _newcoShowReview(url) {
  document.getElementById('newco-modal-s2').style.display = 'none';
  document.getElementById('newco-modal-s3').style.display = '';

  // Update step indicators
  ['newco-ind-1','newco-ind-2'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.className = 'newco-step done';
  });
  var ind3 = document.getElementById('newco-ind-3');
  if (ind3) ind3.className = 'newco-step active';
  var line1 = document.getElementById('newco-line-1');
  var line2 = document.getElementById('newco-line-2');
  if (line1) line1.className = 'newco-step-line done';
  if (line2) line2.className = 'newco-step-line done';

  // Update subtitle
  var sub = document.getElementById('newco-review-sub');
  if (sub) sub.textContent = 'Found for ' + url + ' — edit anything before importing';

  // Re-select all members
  _newcoSelectedMembers = new Set([1,2,3,4,5]);
  _newcoAllSelected = true;
  document.querySelectorAll('.newco-member-row').forEach(function(r) {
    r.classList.add('selected');
  });
  _newcoUpdateTeamCount();
}

/* ── Team member toggles ────────────────────────────── */
function newcoToggleMember(el) {
  var mid = parseInt(el.dataset.mid);
  if (_newcoSelectedMembers.has(mid)) {
    _newcoSelectedMembers.delete(mid);
    el.classList.remove('selected');
  } else {
    _newcoSelectedMembers.add(mid);
    el.classList.add('selected');
  }
  _newcoUpdateTeamCount();
}

function newcoToggleAll() {
  _newcoAllSelected = !_newcoAllSelected;
  var btn = document.querySelector('.newco-select-all');
  document.querySelectorAll('.newco-member-row').forEach(function(r) {
    var mid = parseInt(r.dataset.mid);
    if (_newcoAllSelected) {
      r.classList.add('selected');
      _newcoSelectedMembers.add(mid);
    } else {
      r.classList.remove('selected');
      _newcoSelectedMembers.delete(mid);
    }
  });
  if (btn) btn.textContent = _newcoAllSelected ? 'Deselect all' : 'Select all';
  _newcoUpdateTeamCount();
}

function _newcoUpdateTeamCount() {
  var n = _newcoSelectedMembers.size;
  var countEl = document.getElementById('newco-team-count');
  if (countEl) countEl.textContent = ' \u00b7 ' + n + ' selected';
  var impEl = document.getElementById('newco-import-count');
  if (impEl) impEl.textContent = n + ' contact' + (n !== 1 ? 's' : '');
}

/* ── Manual add (no AI) ────────────────────────────── */
function newcoManual() {
  closeNewCompany();
  showToast('Manual company form — coming soon');
}

/* ── Confirm create ─────────────────────────────────── */
function newcoConfirmCreate() {
  var nameEl = document.getElementById('r-co-name');
  var name   = nameEl ? nameEl.value.trim() : 'Apex Digital Solutions';
  var n      = _newcoSelectedMembers.size;

  closeNewCompany();

  // Show launchpad ribbon if on companies screen
  _newcoShowLaunchpad(name, n);

  showToast(name + ' created' + (n > 0 ? ' · ' + n + ' contact' + (n!==1?'s':'') + ' imported' : ''));
}

/* ── Communication Launchpad ────────────────────────── */
function _newcoShowLaunchpad(name, contactCount) {
  // Inject launchpad into companies screen header area if not present
  var screen = document.getElementById('screen-companies');
  if (!screen) { screen = document.querySelector('[id*="compan"]'); }
  if (!screen) return;

  var existing = document.getElementById('newco-launchpad');
  if (!existing) {
    var lp = document.createElement('div');
    lp.id = 'newco-launchpad';
    lp.innerHTML = _newcoLaunchpadHTML(name, contactCount);
    // Insert after the companies header
    var header = screen.querySelector('header') || screen.firstElementChild;
    if (header && header.nextSibling) {
      screen.insertBefore(lp, header.nextSibling);
    } else {
      screen.appendChild(lp);
    }
  } else {
    existing.innerHTML = _newcoLaunchpadHTML(name, contactCount);
  }

  var lp2 = document.getElementById('newco-launchpad');
  if (lp2) {
    lp2.classList.add('visible');
    lp2.style.margin = '16px 24px 0';
  }
}

function _newcoLaunchpadHTML(name, contactCount) {
  return '<div class="nlp-icon">' +
    '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
    '</div>' +
    '<div class="nlp-body">' +
    '<div class="nlp-title">' + name + ' added successfully</div>' +
    '<div class="nlp-sub">' + contactCount + ' contacts imported &middot; CEO intelligence ready</div>' +
    '<div class="nlp-hook">' +
      '\u26a1 <strong>AI hook:</strong> James just closed a $24M Series B and is expanding into EMEA. Reference his SaaStr keynote on "AI replacing SDRs" &mdash; he responds well to data-led outreach.' +
    '</div>' +
    '<div class="nlp-actions">' +
      '<button class="nlp-btn nlp-btn-primary" onclick="openComposer(\'email\')">Send Intro Email</button>' +
      '<button class="nlp-btn nlp-btn-ghost" onclick="openComposer(\'whatsapp\')">WhatsApp CEO</button>' +
      '<button class="nlp-btn nlp-btn-ghost" onclick="showToast(\'Added to Pipeline\')">+ Add to Pipeline</button>' +
      '<button class="nlp-btn nlp-btn-ghost" onclick="showToast(\'Schedule call &mdash; coming soon\')">Schedule Discovery Call</button>' +
    '</div>' +
    '</div>' +
    '<button class="nlp-dismiss" onclick="this.closest(\'#newco-launchpad\').classList.remove(\'visible\')" title="Dismiss">&times;</button>';
}

function openComposer(type) {
  closeNewCompany();
  // Try to open the messaging composer
  var msgBtn = document.getElementById('open-composer-btn') || document.querySelector('[onclick*="openComposer"]');
  if (type === 'whatsapp' || type === 'email') {
    // Switch to inbox / messaging screen and open composer
    switchScreen('inbox');
    setTimeout(function() {
      var composeBtn = document.querySelector('[onclick*="compose"], [onclick*="newMessage"], .compose-btn');
      if (composeBtn) composeBtn.click();
      else showToast('Opening ' + type + ' composer\u2026');
    }, 200);
  }
}


/* ── Pipeline email button wiring ─────────────────────────────── */
function plAddEmailBtns() {
  document.querySelectorAll('.pl-card[data-id]').forEach(function(card) {
    if (card.querySelector('.pl-card-email-btn')) return; // skip if already added
    var id = card.dataset.id;
    var deal = _plDeals[id];
    if (!deal) return;
    var contactName = deal.contact.split(' · ')[0]; // "James Rourke" from "James Rourke · VP Sales"
    var btn = document.createElement('button');
    btn.className = 'pl-card-email-btn';
    btn.title = 'Email ' + contactName;
    btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M1 5.5l7 5 7-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Email';
    btn.onclick = function(e) {
      e.stopPropagation(); // don't open deal modal
      openEmailComposer(contactName);
    };
    card.appendChild(btn);
  });
}

// Run on load (cards are static HTML, always in DOM)
document.addEventListener('DOMContentLoaded', plAddEmailBtns);

// Also run when pipeline screen is activated (in case of late init)
(function() {
  var _origSwitchScreen = typeof switchScreen === 'function' ? switchScreen : null;
  // Patch after all scripts load
  window.addEventListener('DOMContentLoaded', function() {
    var origFn = switchScreen;
    switchScreen = function(name) {
      origFn(name);
      if (name === 'pipeline') { plAddEmailBtns(); }
    };
  });
})();


/* ══════════════════════════════════════════════════════════════════════════
   NOVATRAI — INDUSTRY PROFILE SYSTEM
   8 profiles · composite merge for multi-line insurance · wizard engine
══════════════════════════════════════════════════════════════════════════ */

const _novatraiProfileConfig = {

  /* ── 1. PERSONAL LINES ──────────────────────────────────────────────── */
  personal_lines: {
    key:'personal_lines', name:'Personal Lines Broker', icon:'🛡️',
    industry:'insurance', clientBase:'b2c', invoicing:false,
    accentColor:'#4A8FFF',
    tagline:'Short-term insurance for individuals & families',
    sidebar:[
      {screen:'dashboard', label:'Dashboard',         icon:'🏠', priority:1},
      {screen:'contacts',  label:'Contacts',        icon:'👥', priority:2},
      {screen:'pipeline',  label:'Renewals Tracker',  icon:'🔄', priority:3},
      {screen:'calendar',  label:'Renewals Calendar', icon:'📅', priority:4},
      {screen:'documents', label:'Policy Vault',      icon:'🗂️', priority:5},
      {screen:'templates', label:'Templates',         icon:'📋', priority:6},
      {screen:'tasks',     label:'Tasks',             icon:'✅', priority:7},
      {screen:'companies', label:'Companies',         icon:'🏢', hidden:true},
      {screen:'invoices',  label:'Invoices',          icon:'💰', hidden:true},
      {screen:'employees', label:'Employees',         icon:'👥', priority:8},
      {screen:'pay-structures', label:'Pay Structures',icon:'💵', priority:9},
    ],
    pipeline:{
      name:'Renewals Tracker', cardLabel:'Policy', valueLabel:'Annual Premium',
      wonLabel:'Renewed', lostLabel:'Lapsed',
      stages:[
        {id:'on_risk',    label:'On Risk',               color:'#3DD68C'},
        {id:'due_90',     label:'Renewal Due (90 days)', color:'#F0A843'},
        {id:'due_30',     label:'Renewal Due (30 days)', color:'#F07070'},
        {id:'quote_sent', label:'Quote Sent',            color:'#4A8FFF'},
        {id:'renewed',    label:'Renewed',               color:'#3DD68C', isWon:true},
        {id:'lapsed',     label:'Lapsed',                color:'#F07070', isLost:true},
      ],
    },
    features:{contacts:true,pipeline:true,calendar:true,documents:true,
      templates:true,tasks:true,whatsapp:true,emailComposer:true,
      relationshipScore:true,companies:false,invoicing:false,financial:false},
    labels:{deal:'Policy',deals:'Policies',pipeline:'Renewals Tracker',
      contact:'Client',won:'Renewed',lost:'Lapsed',
      documents:'Policy Vault',value:'Annual Premium',addDeal:'Track Policy'},
    templates:[
      {id:'pl_t1',name:'Renewal Reminder — 90 Days',               channel:'whatsapp'},
      {id:'pl_t2',name:'Renewal Reminder — 30 Days (Urgent)',       channel:'whatsapp'},
      {id:'pl_t3',name:'Quote Follow-up (No Response)',             channel:'email'},
      {id:'pl_t4',name:'Welcome to Our Agency',                     channel:'email'},
      {id:'pl_t5',name:'Claim Submission Support',                  channel:'whatsapp'},
      {id:'pl_t6',name:'Policy Endorsement Confirmation',           channel:'email'},
      {id:'pl_t7',name:'Annual Review — Is Your Cover Still Right?',channel:'whatsapp'},
    ],
    onboarding:{welcomeHeadline:'Your personal lines workspace is ready',
      quickStart:['Add your first client','Set up your renewal reminder templates','Track your first policy renewal']},
  },

  /* ── 2. LIFE & INVESTMENTS ──────────────────────────────────────────── */
  life_invest: {
    key:'life_invest', name:'Life & Investments Broker', icon:'📈',
    industry:'insurance', clientBase:'b2c', invoicing:false,
    accentColor:'#B57BFF',
    tagline:'Risk cover, retirement annuities & investment portfolios',
    sidebar:[
      {screen:'dashboard', label:'Dashboard',       icon:'🏠', priority:1},
      {screen:'contacts',  label:'Contacts',      icon:'👥', priority:2},
      {screen:'calendar',  label:'Review Calendar', icon:'📅', priority:3},
      {screen:'pipeline',  label:'Opportunities',   icon:'🎯', priority:4},
      {screen:'documents', label:'Client Files',    icon:'🗂️', priority:5},
      {screen:'templates', label:'Templates',       icon:'📋', priority:6},
      {screen:'tasks',     label:'Tasks',           icon:'✅', priority:7},
      {screen:'companies', label:'Companies',       icon:'🏢', hidden:true},
      {screen:'invoices',  label:'Invoices',        icon:'💰', hidden:true},
      {screen:'employees', label:'Employees',       icon:'👥', priority:8},
      {screen:'pay-structures', label:'Pay Structures',icon:'💵', priority:9},
    ],
    pipeline:{
      name:'Opportunities', cardLabel:'Opportunity', valueLabel:'Monthly Premium',
      wonLabel:'On Risk', lostLabel:'Not Proceeded',
      stages:[
        {id:'prospect',    label:'Prospect / Referral',     color:'#9AABB8'},
        {id:'needs',       label:'Needs Analysis',          color:'#F0A843'},
        {id:'proposal',    label:'Proposal / Illustration', color:'#4A8FFF'},
        {id:'application', label:'Application Submitted',   color:'#B57BFF'},
        {id:'on_risk',     label:'On Risk',                 color:'#3DD68C', isWon:true},
        {id:'declined',    label:'Not Proceeded',           color:'#F07070', isLost:true},
      ],
    },
    features:{contacts:true,pipeline:true,calendar:true,documents:true,
      templates:true,tasks:true,whatsapp:true,emailComposer:true,
      relationshipScore:true,companies:false,invoicing:false,financial:false},
    labels:{deal:'Opportunity',deals:'Opportunities',pipeline:'Opportunities',
      contact:'Client',won:'On Risk',lost:'Not Proceeded',
      documents:'Client Files',value:'Monthly Premium',addDeal:'New Opportunity'},
    templates:[
      {id:'li_t1',name:'Annual Review Invitation',                  channel:'email'},
      {id:'li_t2',name:'Needs Analysis — Documents Required',       channel:'email'},
      {id:'li_t3',name:'Policy Illustration Ready — Let\'s Connect',channel:'whatsapp'},
      {id:'li_t4',name:'Application Submitted — What Happens Next', channel:'email'},
      {id:'li_t5',name:'Birthday / Life Milestone Touchpoint',      channel:'whatsapp'},
      {id:'li_t6',name:'RA Maturity / Investment Milestone',        channel:'email'},
    ],
    onboarding:{welcomeHeadline:'Your life & investments workspace is ready',
      quickStart:['Add your first client','Schedule their annual review','Log a new opportunity']},
  },

  /* ── 3. COMMERCIAL LINES ────────────────────────────────────────────── */
  commercial: {
    key:'commercial', name:'Commercial Lines Broker', icon:'🏗️',
    industry:'insurance', clientBase:'b2b', invoicing:false,
    accentColor:'#3DD68C',
    tagline:'Business insurance for commercial & corporate clients',
    sidebar:[
      {screen:'dashboard', label:'Dashboard',           icon:'🏠', priority:1},
      {screen:'companies', label:'Client Companies',    icon:'🏢', priority:2},
      {screen:'pipeline',  label:'Commercial Pipeline', icon:'🎯', priority:3},
      {screen:'contacts',  label:'Contacts',            icon:'👥', priority:4},
      {screen:'calendar',  label:'Calendar',            icon:'📅', priority:5},
      {screen:'documents', label:'Policy & Risk Files', icon:'🗂️', priority:6},
      {screen:'templates', label:'Templates',           icon:'📋', priority:7},
      {screen:'tasks',     label:'Tasks',               icon:'✅', priority:8},
      {screen:'invoices',  label:'Invoices',            icon:'💰', hidden:true},
      {screen:'employees', label:'Employees',           icon:'👥', priority:9},
      {screen:'pay-structures', label:'Pay Structures',  icon:'💵', priority:10},
    ],
    pipeline:{
      name:'Commercial Pipeline', cardLabel:'Account', valueLabel:'Annual Premium',
      wonLabel:'On Risk', lostLabel:'Declined / Market',
      stages:[
        {id:'prospect',     label:'Prospect',              color:'#9AABB8'},
        {id:'risk_survey',  label:'Risk Survey Requested', color:'#F0A843'},
        {id:'underwriting', label:'Quote to Underwriter',  color:'#4A8FFF'},
        {id:'proposal',     label:'Proposal Presented',    color:'#B57BFF'},
        {id:'on_risk',      label:'On Risk',               color:'#3DD68C', isWon:true},
        {id:'declined',     label:'Declined / Market',     color:'#F07070', isLost:true},
      ],
    },
    features:{contacts:true,companies:true,pipeline:true,calendar:true,
      documents:true,templates:true,tasks:true,whatsapp:true,
      emailComposer:true,relationshipScore:true,invoicing:false,financial:false},
    labels:{deal:'Account',deals:'Accounts',pipeline:'Commercial Pipeline',
      contact:'Stakeholder',company:'Client Company',won:'On Risk',
      lost:'Declined',documents:'Policy & Risk Files',
      value:'Annual Premium',addDeal:'New Account'},
    templates:[
      {id:'com_t1',name:'Risk Survey Request',                channel:'email'},
      {id:'com_t2',name:'Renewal Presentation Invitation',    channel:'email'},
      {id:'com_t3',name:'Claims Procedure — Business Guide',  channel:'email'},
      {id:'com_t4',name:'Cover Comparison — New vs Current',  channel:'email'},
      {id:'com_t5',name:'Letter of Insurance / Compliance Cert',channel:'email'},
    ],
    onboarding:{welcomeHeadline:'Your commercial insurance workspace is ready',
      quickStart:['Add your first client company','Build your commercial pipeline','Set up renewal tracking']},
  },

  /* ── 4. REAL ESTATE ─────────────────────────────────────────────────── */
  real_estate: {
    key:'real_estate', name:'Real Estate Agency', icon:'🏡',
    industry:'real_estate', clientBase:'both', invoicing:true,
    accentColor:'#F0A843',
    tagline:'Property sales and rentals — residential & commercial',
    sidebar:[
      {screen:'dashboard', label:'Dashboard',          icon:'🏠', priority:1},
      {screen:'pipeline',  label:'Listings Pipeline',  icon:'🏡', priority:2},
      {screen:'contacts',  label:'Buyers & Tenants',   icon:'👥', priority:3},
      {screen:'calendar',  label:'Viewings Calendar',  icon:'📅', priority:4},
      {screen:'documents', label:'Property Files',     icon:'🗂️', priority:5},
      {screen:'invoices',  label:'Commission Invoices',icon:'💰', priority:6},
      {screen:'templates', label:'Templates',          icon:'📋', priority:7},
      {screen:'tasks',     label:'Tasks',              icon:'✅', priority:8},
      {screen:'companies', label:'Companies',          icon:'🏢', hidden:true},
      {screen:'employees', label:'Employees',          icon:'👥', priority:9},
      {screen:'pay-structures', label:'Pay Structures', icon:'💵', priority:10},
    ],
    pipeline:{
      name:'Listings Pipeline', cardLabel:'Listing', valueLabel:'Property Value',
      wonLabel:'Transferred', lostLabel:'Fallen Through',
      stages:[
        {id:'mandate',     label:'Mandate / Listed',   color:'#9AABB8'},
        {id:'viewing',     label:'Viewing Scheduled',  color:'#F0A843'},
        {id:'offer',       label:'Offer Received',     color:'#4A8FFF'},
        {id:'otp',         label:'OTP / Lease Signed', color:'#B57BFF'},
        {id:'transferred', label:'Transferred / Let',  color:'#3DD68C', isWon:true},
        {id:'fallen',      label:'Fallen Through',     color:'#F07070', isLost:true},
      ],
    },
    features:{contacts:true,pipeline:true,calendar:true,documents:true,
      invoicing:true,templates:true,tasks:true,whatsapp:true,
      emailComposer:true,relationshipScore:true,companies:false,financial:false},
    labels:{deal:'Listing',deals:'Listings',pipeline:'Listings Pipeline',
      contact:'Buyer / Tenant',won:'Transferred',lost:'Fallen Through',
      documents:'Property Files',value:'Property Value',addDeal:'New Listing'},
    templates:[
      {id:'re_t1',name:'New Listing Alert — Matches Your Brief',         channel:'whatsapp'},
      {id:'re_t2',name:'Viewing Confirmation & Property Details',        channel:'email'},
      {id:'re_t3',name:'Offer Submitted — Next Steps & Timeline',        channel:'email'},
      {id:'re_t4',name:'OTP Signed — Conditions & Transfer Process',     channel:'email'},
      {id:'re_t5',name:'Transfer / Registration Milestone Update',       channel:'whatsapp'},
      {id:'re_t6',name:'Rental Renewal — Lease Expires in 60 Days',     channel:'email'},
      {id:'re_t7',name:'Post-Sale Check-In — Settling In?',              channel:'whatsapp'},
    ],
    onboarding:{welcomeHeadline:'Your real estate workspace is ready',
      quickStart:['Add your first listing','Log a buyer enquiry','Set up your viewing calendar']},
  },

  /* ── 5. ACCOUNTING & TAX ────────────────────────────────────────────── */
  accounting: {
    key:'accounting', name:'Accounting & Tax Practice', icon:'🧾',
    industry:'professional_services', clientBase:'both', invoicing:true,
    accentColor:'#3DD6C8',
    tagline:'Tax returns, year-end accounts & compliance management',
    sidebar:[
      {screen:'dashboard', label:'Dashboard',           icon:'🏠', priority:1},
      {screen:'calendar',  label:'Compliance Calendar', icon:'📅', priority:2},
      {screen:'contacts',  label:'Contacts',          icon:'👥', priority:3},
      {screen:'companies', label:'Business Clients',    icon:'🏢', priority:4},
      {screen:'documents', label:'Client Documents',    icon:'🗂️', priority:5},
      {screen:'invoices',  label:'Billing & Invoices',  icon:'💰', priority:6},
      {screen:'templates', label:'Templates',           icon:'📋', priority:7},
      {screen:'tasks',     label:'Tasks',               icon:'✅', priority:8},
      {screen:'pipeline',  label:'New Clients',         icon:'🎯', hidden:true},
      {screen:'employees', label:'Employees',           icon:'👥', priority:9},
      {screen:'pay-structures', label:'Pay Structures',  icon:'💵', priority:10},
    ],
    pipeline:{
      name:'New Client Pipeline', cardLabel:'Engagement', valueLabel:'Annual Fee',
      wonLabel:'On-Boarded', lostLabel:'Not Proceeded',
      stages:[
        {id:'enquiry',    label:'Enquiry',                color:'#9AABB8'},
        {id:'scoping',    label:'Scope Meeting',          color:'#F0A843'},
        {id:'quote',      label:'Quote / Proposal Sent',  color:'#4A8FFF'},
        {id:'eng_letter', label:'Engagement Letter Sent', color:'#B57BFF'},
        {id:'onboarded',  label:'Client On-Boarded',      color:'#3DD68C', isWon:true},
        {id:'declined',   label:'Not Proceeded',          color:'#F07070', isLost:true},
      ],
    },
    features:{contacts:true,companies:true,calendar:true,documents:true,
      invoicing:true,templates:true,tasks:true,whatsapp:true,
      emailComposer:true,relationshipScore:true,pipeline:false,financial:false},
    labels:{deal:'Engagement',deals:'Engagements',pipeline:'New Clients',
      contact:'Client',company:'Business Client',won:'On-Boarded',
      lost:'Not Proceeded',documents:'Client Documents',
      value:'Annual Fee',addDeal:'New Engagement'},
    templates:[
      {id:'acc_t1',name:'Tax Season Kick-Off — Documents We Need',     channel:'email'},
      {id:'acc_t2',name:'Deadline Reminder — Document Due in 14 Days', channel:'whatsapp'},
      {id:'acc_t3',name:'Financial Statements Ready for Review',        channel:'email'},
      {id:'acc_t4',name:'Provisional Tax — Payment Due & Amount',      channel:'email'},
      {id:'acc_t5',name:'Engagement Letter & Fee Proposal',            channel:'email'},
      {id:'acc_t6',name:'Missing Documents Follow-Up (Friendly Nudge)',channel:'whatsapp'},
    ],
    onboarding:{welcomeHeadline:'Your accounting practice workspace is ready',
      quickStart:['Import your client list','Set up compliance calendar deadlines','Create your first invoice']},
  },

  /* ── 6. RECRUITMENT & STAFFING ──────────────────────────────────────── */
  recruitment: {
    key:'recruitment', name:'Recruitment & Staffing', icon:'🤝',
    industry:'professional_services', clientBase:'both', invoicing:true,
    accentColor:'#FF7BBB',
    tagline:'Candidate placement & vacancy management',
    sidebar:[
      {screen:'dashboard', label:'Dashboard',          icon:'🏠', priority:1},
      {screen:'pipeline',  label:'Active Vacancies',   icon:'🎯', priority:2},
      {screen:'companies', label:'Client Companies',   icon:'🏢', priority:3},
      {screen:'contacts',  label:'Candidates',         icon:'👤', priority:4},
      {screen:'calendar',  label:'Interview Calendar', icon:'📅', priority:5},
      {screen:'documents', label:'CVs & Agreements',   icon:'🗂️', priority:6},
      {screen:'invoices',  label:'Placement Invoices', icon:'💰', priority:7},
      {screen:'templates', label:'Templates',          icon:'📋', priority:8},
      {screen:'tasks',     label:'Tasks',              icon:'✅', priority:9},
      {screen:'employees', label:'Employees',          icon:'👥', priority:10},
      {screen:'pay-structures', label:'Pay Structures', icon:'💵', priority:11},
    ],
    pipeline:{
      name:'Active Vacancies', cardLabel:'Vacancy', valueLabel:'Placement Fee',
      wonLabel:'Placed', lostLabel:'Vacancy Closed',
      stages:[
        {id:'briefed',      label:'Vacancy Briefed',         color:'#9AABB8'},
        {id:'sourcing',     label:'Candidates Sourcing',     color:'#F0A843'},
        {id:'cvs_sent',     label:'CVs Submitted to Client', color:'#4A8FFF'},
        {id:'interviewing', label:'Interviews Underway',     color:'#B57BFF'},
        {id:'offer',        label:'Offer Stage',             color:'#FF7BBB'},
        {id:'placed',       label:'Placement Made',          color:'#3DD68C', isWon:true},
        {id:'closed',       label:'Vacancy Closed',          color:'#F07070', isLost:true},
      ],
    },
    features:{contacts:true,companies:true,pipeline:true,calendar:true,
      documents:true,invoicing:true,templates:true,tasks:true,
      whatsapp:true,emailComposer:true,relationshipScore:true,financial:false},
    labels:{deal:'Vacancy',deals:'Vacancies',pipeline:'Active Vacancies',
      contact:'Candidate',company:'Client Company',won:'Placed',
      lost:'Vacancy Closed',documents:'CVs & Agreements',
      value:'Placement Fee',addDeal:'New Vacancy'},
    templates:[
      {id:'rec_t1',name:'Candidate Introduction — Vacancy Match',          channel:'whatsapp'},
      {id:'rec_t2',name:'CV Submission to Client — Shortlist for [Role]',  channel:'email'},
      {id:'rec_t3',name:'Interview Prep — What to Expect',                 channel:'email'},
      {id:'rec_t4',name:'Offer Received — Let\'s Talk Through the Details',channel:'email'},
      {id:'rec_t5',name:'Placement Confirmation — Congratulations',        channel:'whatsapp'},
      {id:'rec_t6',name:'3-Month Check-In — How\'s the New Role Going?',   channel:'email'},
      {id:'rec_t7',name:'Client Update — Vacancy Briefing Acknowledgement',channel:'email'},
    ],
    onboarding:{welcomeHeadline:'Your recruitment workspace is ready',
      quickStart:['Add your first client company','Log a new vacancy','Add a candidate to your database']},
  },

  /* ── 7. SOLAR & ENERGY ──────────────────────────────────────────────── */
  solar: {
    key:'solar', name:'Solar & Energy Installer', icon:'☀️',
    industry:'energy', clientBase:'both', invoicing:true,
    accentColor:'#F0A843',
    tagline:'Residential & commercial solar installation management',
    sidebar:[
      {screen:'dashboard', label:'Dashboard',             icon:'🏠', priority:1},
      {screen:'pipeline',  label:'Installation Pipeline', icon:'🔆', priority:2},
      {screen:'contacts',  label:'Clients & Leads',       icon:'👥', priority:3},
      {screen:'calendar',  label:'Site Calendar',         icon:'📅', priority:4},
      {screen:'documents', label:'Installation Files',    icon:'🗂️', priority:5},
      {screen:'invoices',  label:'Invoices & Deposits',   icon:'💰', priority:6},
      {screen:'templates', label:'Templates',             icon:'📋', priority:7},
      {screen:'tasks',     label:'Tasks',                 icon:'✅', priority:8},
      {screen:'companies', label:'Commercial Clients',    icon:'🏢', hidden:true},
      {screen:'employees', label:'Employees',             icon:'👥', priority:9},
      {screen:'pay-structures', label:'Pay Structures',    icon:'💵', priority:10},
    ],
    pipeline:{
      name:'Installation Pipeline', cardLabel:'Installation', valueLabel:'System Value (R)',
      wonLabel:'COC Issued', lostLabel:'Lost to Competitor',
      stages:[
        {id:'lead',      label:'Lead / Enquiry',         color:'#9AABB8'},
        {id:'survey',    label:'Site Survey Booked',     color:'#F0A843'},
        {id:'proposal',  label:'Proposal Sent',          color:'#4A8FFF'},
        {id:'deposit',   label:'Deposit Received',       color:'#B57BFF'},
        {id:'scheduled', label:'Installation Scheduled', color:'#F0A843'},
        {id:'complete',  label:'Installation Complete',  color:'#3DD6C8'},
        {id:'coc',       label:'COC Issued',             color:'#3DD68C', isWon:true},
        {id:'lost',      label:'Lost to Competitor',     color:'#F07070', isLost:true},
      ],
    },
    features:{contacts:true,pipeline:true,calendar:true,documents:true,
      invoicing:true,templates:true,tasks:true,whatsapp:true,
      emailComposer:true,relationshipScore:true,companies:false,financial:false},
    labels:{deal:'Installation',deals:'Installations',pipeline:'Installation Pipeline',
      contact:'Client',won:'COC Issued',lost:'Lost to Competitor',
      documents:'Installation Files',value:'System Value',addDeal:'New Installation'},
    templates:[
      {id:'sol_t1',name:'Site Survey Confirmation',                    channel:'email'},
      {id:'sol_t2',name:'Solar Proposal — System Design & Pricing',    channel:'email'},
      {id:'sol_t3',name:'Proposal Follow-Up — Any Questions?',         channel:'whatsapp'},
      {id:'sol_t4',name:'Deposit Invoice & Installation Timeline',     channel:'email'},
      {id:'sol_t5',name:'Installation Day Reminder — Team Arriving',   channel:'whatsapp'},
      {id:'sol_t6',name:'COC Issued — Your System is On Grid',         channel:'email'},
      {id:'sol_t7',name:'Annual Maintenance Reminder',                 channel:'whatsapp'},
      {id:'sol_t8',name:'Referral Request — Know Anyone Needing Solar?',channel:'email'},
    ],
    onboarding:{welcomeHeadline:'Your solar installation workspace is ready',
      quickStart:['Log your first lead','Schedule a site survey','Send a proposal from your templates']},
  },

  /* ── 8. TRADES & FIELD SERVICES ─────────────────────────────────────── */
  trades: {
    key:'trades', name:'Trades & Field Services', icon:'🔧',
    industry:'trades', clientBase:'both', invoicing:true,
    accentColor:'#F0A843',
    tagline:'Plumbing, electrical, HVAC & maintenance services',
    sidebar:[
      {screen:'dashboard', label:'Dashboard',         icon:'🏠', priority:1},
      {screen:'pipeline',  label:'Jobs Pipeline',     icon:'🔧', priority:2},
      {screen:'contacts',  label:'Clients & Leads',   icon:'👥', priority:3},
      {screen:'calendar',  label:'Job Schedule',      icon:'📅', priority:4},
      {screen:'documents', label:'Job Documents',     icon:'🗂️', priority:5},
      {screen:'invoices',  label:'Invoices & Quotes', icon:'💰', priority:6},
      {screen:'templates', label:'Templates',         icon:'📋', priority:7},
      {screen:'tasks',     label:'Tasks',             icon:'✅', priority:8},
      {screen:'companies', label:'Commercial Clients',icon:'🏢', hidden:true},
      {screen:'employees', label:'Employees',         icon:'👥', priority:9},
      {screen:'pay-structures', label:'Pay Structures',icon:'💵', priority:10},
    ],
    pipeline:{
      name:'Jobs Pipeline', cardLabel:'Job', valueLabel:'Job Value (R)',
      wonLabel:'Job Complete', lostLabel:'Lost to Competitor',
      stages:[
        {id:'enquiry',   label:'Enquiry / Call-out',  color:'#9AABB8'},
        {id:'site_visit',label:'Site Visit Booked',   color:'#F0A843'},
        {id:'quote_sent',label:'Quote Sent',          color:'#4A8FFF'},
        {id:'accepted',  label:'Quote Accepted',      color:'#B57BFF'},
        {id:'scheduled', label:'Job Scheduled',       color:'#F0A843'},
        {id:'progress',  label:'In Progress',         color:'#3DD6C8'},
        {id:'complete',  label:'Job Complete',        color:'#3DD68C', isWon:true},
        {id:'lost',      label:'Lost to Competitor',  color:'#F07070', isLost:true},
      ],
    },
    features:{contacts:true,pipeline:true,calendar:true,documents:true,
      invoicing:true,templates:true,tasks:true,whatsapp:true,
      emailComposer:true,relationshipScore:true,companies:false,financial:false},
    labels:{deal:'Job',deals:'Jobs',pipeline:'Jobs Pipeline',
      contact:'Client',won:'Job Complete',lost:'Lost to Competitor',
      documents:'Job Documents',value:'Job Value',addDeal:'New Job'},
    templates:[
      {id:'tr_t1',name:'Site Visit Confirmation',                   channel:'whatsapp'},
      {id:'tr_t2',name:'Quote / Estimate — Job Details & Pricing',  channel:'email'},
      {id:'tr_t3',name:'Quote Follow-Up — Any Questions?',          channel:'whatsapp'},
      {id:'tr_t4',name:'Job Scheduled — Team Arriving on [Date]',   channel:'whatsapp'},
      {id:'tr_t5',name:'Job Complete — Certificate & Invoice',      channel:'email'},
      {id:'tr_t6',name:'Annual Maintenance Reminder',               channel:'whatsapp'},
      {id:'tr_t7',name:'Referral Request — Happy With Our Work?',   channel:'whatsapp'},
    ],
    onboarding:{welcomeHeadline:'Your trades & field services workspace is ready',
      quickStart:['Log your first enquiry','Schedule a site visit','Send a quote from your templates']},
  },

}; // end _novatraiProfileConfig


/* ══════════════════════════════════════════════════════════════════════════
   COMPOSITE MERGE ENGINE
   Builds a unified config when multiple insurance lines are selected
══════════════════════════════════════════════════════════════════════════ */
const _OW_INSURANCE_KEYS = ['personal_lines','life_invest','commercial'];

function _buildCompositeConfig(keys) {
  const configs = keys.map(function(k){ return _novatraiProfileConfig[k]; });
  const allInsurance = keys.every(function(k){ return _OW_INSURANCE_KEYS.includes(k); });

  // Merge features — if ANY profile enables a feature, composite enables it
  var mergedFeatures = {};
  configs.forEach(function(c){
    Object.keys(c.features).forEach(function(k){
      mergedFeatures[k] = mergedFeatures[k] || c.features[k];
    });
  });

  // Merge templates (deduplicated by id)
  var seenIds = {};
  var mergedTemplates = [];
  configs.forEach(function(c){
    c.templates.forEach(function(t){
      if (!seenIds[t.id]) { seenIds[t.id] = true; mergedTemplates.push(t); }
    });
  });

  // Merge sidebar — union, deduplicated by screen, visible wins over hidden
  var sbMap = {};
  configs.forEach(function(c){
    c.sidebar.forEach(function(item){
      if (!sbMap[item.screen] || sbMap[item.screen].hidden) {
        sbMap[item.screen] = Object.assign({}, item);
      }
    });
  });
  var mergedSidebar = Object.values(sbMap).sort(function(a,b){
    if (a.hidden && !b.hidden) return 1;
    if (!a.hidden && b.hidden) return -1;
    return (a.priority||99) - (b.priority||99);
  });

  // Composite pipeline — tabs per line, unified stage set covers all lines
  var compositeName = keys.length === 3
    ? 'Full-Service Broker Pipeline'
    : keys.map(function(k){ return _novatraiProfileConfig[k].pipeline.name; }).join(' · ');

  // Build composite stage set: named stages that cover all selected lines
  var compositeStages = allInsurance ? [
    {id:'prospect',     label:'Prospect',            color:'#9AABB8'},
    {id:'needs',        label:'Needs Analysis',      color:'#F0A843'},
    {id:'quote',        label:'Quote / Proposal',    color:'#4A8FFF'},
    {id:'application',  label:'Applied / Submitted', color:'#B57BFF'},
    {id:'on_risk',      label:'On Risk',             color:'#3DD68C', isWon:true},
    {id:'declined',     label:'Declined / Lapsed',   color:'#F07070', isLost:true},
  ] : configs[0].pipeline.stages;

  var compositeIcon = keys.length === 3 ? '⭐' :
    keys.length === 2 ? (configs[0].icon + configs[1].icon) : configs[0].icon;

  var nameStr = allInsurance && keys.length === 3
    ? 'Full-Service Insurance Broker'
    : configs.map(function(c){ return c.name; }).join(' + ');

  return {
    key: 'composite__' + keys.join('_'),
    name: nameStr,
    icon: keys.length === 3 ? '⭐' : configs[0].icon,
    industry: 'insurance',
    clientBase: mergedFeatures.companies ? 'both' : 'b2c',
    invoicing: configs.some(function(c){ return c.invoicing; }),
    accentColor: '#4A8FFF',
    tagline: configs.map(function(c){ return c.name; }).join(' · '),
    isComposite: true,
    compositeKeys: keys,
    sidebar: mergedSidebar,
    pipeline: {
      name: compositeName,
      cardLabel: 'Account',
      valueLabel: 'Annual Premium',
      wonLabel: 'On Risk',
      lostLabel: 'Declined / Lapsed',
      stages: compositeStages,
      tabs: keys.map(function(k){
        var pc = _novatraiProfileConfig[k];
        return { key:k, label:pc.pipeline.name, stages:pc.pipeline.stages };
      }),
    },
    features: mergedFeatures,
    labels: Object.assign(
      {deal:'Account',deals:'Accounts',pipeline:compositeName,
       contact:'Client',won:'On Risk',lost:'Declined',
       documents:'Client Files',value:'Annual Premium',addDeal:'New Account'},
      mergedFeatures.companies ? {company:'Client Company'} : {}
    ),
    templates: mergedTemplates,
    onboarding:{
      welcomeHeadline: 'Your ' + nameStr + ' workspace is ready',
      quickStart:['Add your first client','Open your business pipeline','Explore your ' + mergedTemplates.length + ' starter templates'],
    },
  };
}


/* ══════════════════════════════════════════════════════════════════════════
   PROFILE APPLICATION ENGINE
   applyProfile(key) — transforms the workspace after onboarding
══════════════════════════════════════════════════════════════════════════ */
var _novatraiProfile = null;

function applyProfile(keyOrKeys) {
  var config;
  if (Array.isArray(keyOrKeys)) {
    config = keyOrKeys.length === 1
      ? _novatraiProfileConfig[keyOrKeys[0]]
      : _buildCompositeConfig(keyOrKeys);
  } else {
    config = _novatraiProfileConfig[keyOrKeys];
  }
  if (!config) return;
  _novatraiProfile = config;

  // Persist
  try {
    var saveKey = Array.isArray(keyOrKeys) ? keyOrKeys.join(',') : keyOrKeys;
    localStorage.setItem('novatrai_profile', saveKey);
  } catch(e){}

  // Body attribute for CSS hooks
  document.body.setAttribute('data-profile', config.key);
  document.body.setAttribute('data-invoicing', config.invoicing ? 'true' : 'false');

  // Sidebar labels + visibility (shadow items instead of hiding)
  var overrides = _getSidebarOverrides();
  config.sidebar.forEach(function(item){
    var el = document.querySelector('[data-screen="' + item.screen + '"], [onclick*="switchScreen(\'' + item.screen + '\')"]');
    if (!el) return;
    // Update label — find text node directly, skip badge spans
    var labelEl = el.querySelector('.nav-label');
    if (labelEl && item.label) { labelEl.textContent = item.label; }
    else if (item.label) {
      var nodes = el.childNodes;
      for (var ni = 0; ni < nodes.length; ni++) {
        if (nodes[ni].nodeType === 3 && nodes[ni].textContent.trim()) { nodes[ni].textContent = '\n      ' + item.label + '\n    '; break; }
      }
    }
    // Shadow or show
    el.style.display = '';
    el.classList.remove('shadow');
    el.removeAttribute('data-shadow-screen');
    var lockIcon = el.querySelector('.shadow-lock');
    if (lockIcon) lockIcon.remove();
    if (item.hidden && overrides.indexOf(item.screen) === -1) {
      el.classList.add('shadow');
      el.setAttribute('data-shadow-screen', item.screen);
      var lock = document.createElementNS('http://www.w3.org/2000/svg','svg');
      lock.setAttribute('class','shadow-lock');
      lock.setAttribute('fill','none');
      lock.setAttribute('viewBox','0 0 24 24');
      lock.setAttribute('stroke','currentColor');
      lock.setAttribute('stroke-width','2');
      lock.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
      el.appendChild(lock);
    } else if (item.hidden && overrides.indexOf(item.screen) !== -1) {
      // User-activated item — mark it and add deactivate button
      el.setAttribute('data-user-activated', item.screen);
      el.removeAttribute('data-shadow-screen');
      /* Defer until _addDeactivateBtn is defined */
      (function(e, s){ setTimeout(function(){ if (typeof window._addDeactivateBtn === 'function') window._addDeactivateBtn(e, s); }, 0); })(el, item.screen);
    }
  });

  // Pipeline rename
  if (config.pipeline) {
    var addBtn = document.querySelector('.pipeline-add-btn');
    if (addBtn && config.labels && config.labels.addDeal) {
      addBtn.textContent = '+ ' + config.labels.addDeal;
    }
  }

  // Feature-gated elements
  document.querySelectorAll('[data-feature="invoicing"]').forEach(function(el){
    el.style.display = config.features.invoicing ? '' : 'none';
  });

  console.log('Novatrai profile applied:', config.name);
}


/* ══════════════════════════════════════════════════════════════════════════
   ONBOARDING WIZARD ENGINE
══════════════════════════════════════════════════════════════════════════ */
var _owSelected = [];   // array of profile keys currently selected
var _owStep     = 1;

function openOnboardingWizard() {
  _owSelected = [];
  _owStep = 0;
  _owSelectedRegion = null;
  _owSelectedLanguage = 'en';
  // Hide old panels if they exist (backwards compat)
  ['ow-step-0','ow-step-1','ow-step-2'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var nextBtn = document.getElementById('ow-next-btn');
  if (nextBtn) nextBtn.disabled = true;
  var rBtn = document.getElementById('ow-region-next-btn');
  if (rBtn) rBtn.disabled = true;
  document.querySelectorAll('.ow-card, .ow-region-card, .ow-region-card-compact').forEach(function(c){ c.classList.remove('selected'); });
  document.getElementById('onboarding-wizard-overlay').classList.add('open');
}

function closeOnboardingWizard() {
  document.getElementById('onboarding-wizard-overlay').classList.remove('open');
}

function owSkip() {
  closeOnboardingWizard();
  showToast('Setup skipped — you can configure your profile in Settings anytime');
}

function owSelectCard(key, el) {
  var isInsurance = _OW_INSURANCE_KEYS.includes(key);

  if (isInsurance) {
    // Multi-select: toggle this key, clear any non-insurance selection
    _owSelected = _owSelected.filter(function(k){ return _OW_INSURANCE_KEYS.includes(k); });
    document.querySelectorAll('.ow-card[data-group="single"]').forEach(function(c){
      c.classList.remove('selected');
    });
    if (_owSelected.includes(key)) {
      _owSelected = _owSelected.filter(function(k){ return k !== key; });
      el.classList.remove('selected');
    } else {
      _owSelected.push(key);
      el.classList.add('selected');
    }
  } else {
    // Single-select: clear everything, pick this one
    _owSelected = [key];
    document.querySelectorAll('.ow-card').forEach(function(c){ c.classList.remove('selected'); });
    el.classList.add('selected');
  }

  var nextBtn = document.getElementById('ow-next-btn');
  if (nextBtn) nextBtn.disabled = (_owSelected.length === 0);
  if (typeof owValidateIndRegionStep === 'function') owValidateIndRegionStep();
}

function owNext() {
  if (_owSelected.length === 0) return;
  _owStep = 2;
  document.getElementById('ow-step-1').style.display = 'none';
  document.getElementById('ow-step-2').style.display = 'block';
  _owUpdateDots(3);
  _owRenderPreview();
}

function owBack() {
  if (_owStep === 2) {
    _owStep = 1;
    document.getElementById('ow-step-2').style.display = 'none';
    document.getElementById('ow-step-1').style.display = 'block';
    _owUpdateDots(1);
  } else if (_owStep === 1) {
    _owStep = 0;
    document.getElementById('ow-step-1').style.display = 'none';
    document.getElementById('ow-step-0').style.display = 'block';
    _owUpdateDots(0);
  }
}

function owLaunch() {
  if (_owSelectedRegion) applyRegion(_owSelectedRegion, _owSelectedLanguage);
  applyProfile(_owSelected.length === 1 ? _owSelected[0] : _owSelected);
  closeOnboardingWizard();
  var config = _novatraiProfile;
  showToast(config ? config.onboarding.welcomeHeadline : 'Workspace ready!');
}

function _owUpdateDots(step) {
  // v2: dots replaced by progress bar — this is now a no-op
  // Progress bar is updated by updateProgress() in wizard v2 JS
}

function _owRenderPreview() {
  var config = _owSelected.length === 1
    ? _novatraiProfileConfig[_owSelected[0]]
    : _buildCompositeConfig(_owSelected);

  var isComposite = config.isComposite;
  var tplCount    = config.templates.length;
  var stageCount  = config.pipeline.stages.length;
  var sbVisible   = config.sidebar.filter(function(s){ return !s.hidden; });

  // Badges
  var badges = '';
  var cb = config.clientBase;
  if (cb === 'b2c')  badges += '<span class="ow-preview-badge" style="background:rgba(74,143,255,.12);color:#4A8FFF;border:1px solid rgba(74,143,255,.25);">B2C</span>';
  if (cb === 'b2b')  badges += '<span class="ow-preview-badge" style="background:rgba(181,123,255,.12);color:#B57BFF;border:1px solid rgba(181,123,255,.25);">B2B</span>';
  if (cb === 'both') badges += '<span class="ow-preview-badge" style="background:rgba(74,143,255,.12);color:#4A8FFF;border:1px solid rgba(74,143,255,.25);">B2C</span><span class="ow-preview-badge" style="background:rgba(181,123,255,.12);color:#B57BFF;border:1px solid rgba(181,123,255,.25);">B2B</span>';
  if (config.invoicing) badges += '<span class="ow-preview-badge" style="background:rgba(61,214,140,.12);color:#3DD68C;border:1px solid rgba(61,214,140,.25);">Invoicing On</span>';
  else badges += '<span class="ow-preview-badge" style="background:rgba(240,112,112,.12);color:#F07070;border:1px solid rgba(240,112,112,.25);">No Client Invoicing</span>';

  // Composite notice
  var compositeHtml = '';
  if (isComposite) {
    var lineNames = _owSelected.map(function(k){ return _novatraiProfileConfig[k].pipeline.name; }).join(', ');
    compositeHtml = '<div class="ow-composite-notice">Your pipeline will include <strong>' + _owSelected.length + ' line-of-business tabs</strong>: ' + lineNames + '. All contacts, templates, and features from each line are merged into a single unified workspace.</div>';
  }

  // Sidebar mini-preview (first 6 visible)
  var sbHtml = sbVisible.slice(0,6).map(function(item, i){
    var isPrimary = i < 3;
    return '<div class="ow-preview-sb-item' + (isPrimary ? ' primary' : '') + '"><div class="sb-dot"></div>' + item.icon + '&nbsp; ' + item.label + '</div>';
  }).join('');

  // Pipeline stages mini-preview (first 5)
  var stHtml = config.pipeline.stages.slice(0,5).map(function(s){
    var icon = s.isWon ? '✓ ' : s.isLost ? '✗ ' : '';
    return '<div class="ow-preview-stage"><div class="stage-pip" style="background:' + s.color + '"></div>' + icon + s.label + '</div>';
  }).join('');
  if (config.pipeline.stages.length > 5) {
    stHtml += '<div class="ow-preview-stage" style="color:#5A7080;font-style:italic;">+ ' + (config.pipeline.stages.length - 5) + ' more stages</div>';
  }

  // Quick start list
  var qsList = (config.onboarding.quickStart || []).map(function(qs){
    return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12px;color:#9AABB8;border-bottom:1px solid rgba(255,255,255,.04)"><div style="width:18px;height:18px;border-radius:50%;background:rgba(74,143,255,.12);border:1px solid rgba(74,143,255,.25);display:flex;align-items:center;justify-content:center;font-size:9px;color:#4A8FFF;font-weight:800;flex-shrink:0;">→</div>' + qs + '</div>';
  }).join('');

  var _localeBar = _owBuildLocaleBar();
  document.getElementById('ow-preview-content').innerHTML =
    _localeBar +
    '<div class="ow-preview-hero">' +
      '<div class="ow-preview-icon">' + config.icon + '</div>' +
      '<div class="ow-preview-name">' + config.name + '</div>' +
      '<div class="ow-preview-tagline">' + config.tagline + '</div>' +
      '<div class="ow-preview-badges">' + badges + '</div>' +
    '</div>' +
    compositeHtml +
    '<div class="ow-preview-stats">' +
      '<div class="ow-stat-box"><div class="ow-stat-num">' + sbVisible.length + '</div><div class="ow-stat-label">Sidebar Items</div></div>' +
      '<div class="ow-stat-box"><div class="ow-stat-num">' + stageCount + '</div><div class="ow-stat-label">Pipeline Stages</div></div>' +
      '<div class="ow-stat-box"><div class="ow-stat-num">' + tplCount + '</div><div class="ow-stat-label">Starter Templates</div></div>' +
    '</div>' +
    '<div class="ow-preview-grid">' +
      '<div class="ow-preview-panel"><h4>Your Sidebar</h4>' + sbHtml + '</div>' +
      '<div class="ow-preview-panel"><h4>' + config.pipeline.name + '</h4>' + stHtml + '</div>' +
    '</div>' +
    '<div class="ow-preview-panel" style="margin-bottom:4px"><h4>Quick Start After Launch</h4>' + qsList + '</div>';
}


/* ══════════════════════════════════════════════════════════════════════════
   AUTO-LAUNCH: show wizard on first visit, restore profile on return
══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  try {
    var savedLocale = localStorage.getItem('novatrai_locale');
    if (savedLocale) {
      try { var lc = JSON.parse(savedLocale); applyRegion(lc.region, lc.language); } catch(e){}
    }
    var saved = localStorage.getItem('novatrai_profile');
    if (saved) {
      // Returning user — restore profile silently
      var keys = saved.includes(',') ? saved.split(',') : saved;
      applyProfile(keys);
    } else {
      // First visit — launch wizard after short delay for app to render
      setTimeout(openOnboardingWizard, 600);
    }
  } catch(e) {
    setTimeout(openOnboardingWizard, 600);
  }
});

/* Allow re-opening wizard from Settings ─────────────────────────────── */
function openProfileWizard() { openOnboardingWizard(); }


/* ══════════════════════════════════════════════════════════════════════════
   NOVATRAI LOCALE SYSTEM
   Region config · Language config · applyRegion() engine
══════════════════════════════════════════════════════════════════════════ */

const _novatraiRegions = {
  za:{ name:'South Africa',    flag:'🇿🇦', continent:'africa',
       currency:{code:'ZAR',symbol:'R',   position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'VAT',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'whatsapp'},
       locale:'en-ZA', languages:['en','af','zu','xh'] },
  na:{ name:'Namibia',         flag:'🇳🇦', continent:'africa',
       currency:{code:'NAD',symbol:'N$',  position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'VAT',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'whatsapp'},
       locale:'en-NA', languages:['en','af'] },
  zw:{ name:'Zimbabwe',        flag:'🇿🇼', continent:'africa',
       currency:{code:'USD',symbol:'$',   position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'VAT',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'whatsapp'},
       locale:'en-ZW', languages:['en','sn'] },
  ke:{ name:'Kenya',           flag:'🇰🇪', continent:'africa',
       currency:{code:'KES',symbol:'KSh', position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'VAT',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'whatsapp'},
       locale:'en-KE', languages:['en','sw'] },
  ng:{ name:'Nigeria',         flag:'🇳🇬', continent:'africa',
       currency:{code:'NGN',symbol:'₦',   position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'VAT',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'whatsapp'},
       locale:'en-NG', languages:['en'] },
  ae:{ name:'UAE / Middle East',flag:'🇦🇪', continent:'africa',
       currency:{code:'AED',symbol:'AED ',position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'VAT',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'whatsapp'},
       locale:'en-AE', languages:['en','ar'] },
  us:{ name:'United States',   flag:'🇺🇸', continent:'americas',
       currency:{code:'USD',symbol:'$',   position:'before'},
       dateFormat:'MM/DD/YYYY', taxTerm:'Sales Tax',
       comms:{whatsapp:false, sms:true, email:true, primaryChannel:'sms'},
       locale:'en-US', languages:['en','es'] },
  ca:{ name:'Canada',          flag:'🇨🇦', continent:'americas',
       currency:{code:'CAD',symbol:'CA$', position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'GST/HST',
       comms:{whatsapp:false, sms:true, email:true, primaryChannel:'sms'},
       locale:'en-CA', languages:['en','fr'] },
  br:{ name:'Brazil / LatAm',  flag:'🇧🇷', continent:'americas',
       currency:{code:'BRL',symbol:'R$',  position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'Tax',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'whatsapp'},
       locale:'pt-BR', languages:['pt','es','en'] },
  gb:{ name:'United Kingdom',  flag:'🇬🇧', continent:'europe',
       currency:{code:'GBP',symbol:'£',   position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'VAT',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'email'},
       locale:'en-GB', languages:['en'] },
  eu:{ name:'Europe (EU)',     flag:'🇪🇺', continent:'europe',
       currency:{code:'EUR',symbol:'€',   position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'VAT',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'email'},
       locale:'en-EU', languages:['en','de','fr','es','it','nl'] },
  au:{ name:'Australia / NZ',  flag:'🇦🇺', continent:'europe',
       currency:{code:'AUD',symbol:'A$',  position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'GST',
       comms:{whatsapp:false, sms:true, email:true, primaryChannel:'sms'},
       locale:'en-AU', languages:['en'] },
  in:{ name:'India',           flag:'🇮🇳', continent:'europe',
       currency:{code:'INR',symbol:'₹',   position:'before'},
       dateFormat:'DD/MM/YYYY', taxTerm:'GST',
       comms:{whatsapp:true, sms:true, email:true, primaryChannel:'whatsapp'},
       locale:'en-IN', languages:['en','hi'] },
};

const _novatraiLanguages = {
  en:{ name:'English',    nativeName:'English',   flag:'🇬🇧' },
  af:{ name:'Afrikaans',  nativeName:'Afrikaans', flag:'🇿🇦' },
  zu:{ name:'Zulu',       nativeName:'isiZulu',   flag:'🇿🇦' },
  xh:{ name:'Xhosa',      nativeName:'isiXhosa',  flag:'🇿🇦' },
  fr:{ name:'French',     nativeName:'Français',  flag:'🇫🇷' },
  es:{ name:'Spanish',    nativeName:'Español',   flag:'🇪🇸' },
  pt:{ name:'Portuguese', nativeName:'Português', flag:'🇧🇷' },
  ar:{ name:'Arabic',     nativeName:'العربية',   flag:'🇦🇪' },
  sw:{ name:'Swahili',    nativeName:'Kiswahili', flag:'🇰🇪' },
  de:{ name:'German',     nativeName:'Deutsch',   flag:'🇩🇪' },
  hi:{ name:'Hindi',      nativeName:'हिन्दी',    flag:'🇮🇳' },
  sn:{ name:'Shona',      nativeName:'ChiShona',  flag:'🇿🇼' },
};

var _novatraiLocale = null;       // active locale object
var _owSelectedRegion   = null;   // wizard: selected region key
var _owSelectedLanguage = 'en';   // wizard: selected language key

/* ── applyRegion() ──────────────────────────────────────────────────────── */
function applyRegion(regionKey, langKey) {
  var region = _novatraiRegions[regionKey];
  if (!region) return;
  var lang = langKey || 'en';

  _novatraiLocale = {
    region:     regionKey,
    language:   lang,
    currency:   region.currency,
    dateFormat: region.dateFormat,
    taxTerm:    region.taxTerm,
    comms:      region.comms,
    locale:     region.locale,
    flag:       region.flag,
    name:       region.name,
  };

  // Persist alongside profile
  try { localStorage.setItem('novatrai_locale', JSON.stringify({region:regionKey, language:lang})); } catch(e){}

  // ── Currency: update all value displays ───────────────────
  var sym = region.currency.symbol;
  document.querySelectorAll('[data-currency-symbol]').forEach(function(el){
    el.textContent = sym;
  });
  // Update KPI bar totals (they're formatted inline — prefix symbol)
  document.querySelectorAll('.pipeline-kpi-total').forEach(function(el){
    var raw = el.getAttribute('data-raw-value') || el.textContent.replace(/[^0-9.]/g,'');
    if (raw) {
      el.textContent = sym + parseFloat(raw).toLocaleString(region.locale, {minimumFractionDigits:0, maximumFractionDigits:0});
    }
  });

  // ── Communication channels ────────────────────────────────
  var showWA  = region.comms.whatsapp;
  var primary = region.comms.primaryChannel;  // 'whatsapp' | 'sms' | 'email'

  // WhatsApp compose buttons — hide for SMS-primary markets
  document.querySelectorAll('.conv-cmp-btn[data-channel="whatsapp"], .wa-compose-btn, [data-channel="whatsapp"]').forEach(function(el){
    el.style.display = showWA ? '' : 'none';
  });
  // SMS buttons — show for non-WhatsApp markets, label as "Text" for US
  document.querySelectorAll('[data-channel="sms"]').forEach(function(el){
    el.style.display = '';
    var labelEl = el.querySelector('.btn-label') || el;
    if (primary === 'sms') {
      if (labelEl && labelEl.textContent.trim() === 'SMS') labelEl.textContent = 'Text';
    }
  });
  // Reorder compose buttons: primary channel button gets a highlight class
  document.querySelectorAll('[data-channel="' + primary + '"]').forEach(function(el){
    el.classList.add('comms-primary');
  });

  // ── Tax term ──────────────────────────────────────────────
  document.querySelectorAll('[data-tax-term]').forEach(function(el){
    el.textContent = region.taxTerm;
  });

  // ── Date format hint ──────────────────────────────────────
  document.querySelectorAll('[data-date-format]').forEach(function(el){
    el.textContent = region.dateFormat;
  });

  // ── Body locale attribute ─────────────────────────────────
  document.body.setAttribute('data-region', regionKey);
  document.body.setAttribute('data-lang', lang);
  document.body.setAttribute('data-primary-comms', primary);

  console.log('Novatrai locale:', regionKey, region.currency.code, 'primary:', primary, 'lang:', lang);
}

/* ── Currency formatter ─────────────────────────────────────────────────── */
function formatCurrency(amount) {
  if (!_novatraiLocale) return 'R ' + Number(amount).toLocaleString();
  var c = _novatraiLocale.currency;
  var formatted = Number(amount).toLocaleString(_novatraiLocale.locale, {minimumFractionDigits:0, maximumFractionDigits:0});
  return c.position === 'before' ? c.symbol + formatted : formatted + ' ' + c.symbol;
}

/* ── Date formatter ─────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!_novatraiLocale || !dateStr) return dateStr;
  try {
    var d = new Date(dateStr);
    if (_novatraiLocale.dateFormat === 'MM/DD/YYYY') {
      return (d.getMonth()+1).toString().padStart(2,'0') + '/' + d.getDate().toString().padStart(2,'0') + '/' + d.getFullYear();
    }
    return d.getDate().toString().padStart(2,'0') + '/' + (d.getMonth()+1).toString().padStart(2,'0') + '/' + d.getFullYear();
  } catch(e) { return dateStr; }
}

/* ══════════════════════════════════════════════════════════════════════════
   WIZARD STEP 0 HANDLERS
══════════════════════════════════════════════════════════════════════════ */
function owSelectRegion(key, el) {
  _owSelectedRegion = key;
  document.querySelectorAll('.ow-region-card').forEach(function(c){ c.classList.remove('selected'); });
  document.querySelectorAll('.ow-region-card-compact').forEach(function(c){ c.classList.remove('selected'); });
  el.classList.add('selected');

  // Auto-suggest first language for this region
  var region = _novatraiRegions[key];
  if (region && region.languages && region.languages.length > 0) {
    var firstLang = region.languages[0];
    var sel = document.getElementById('ow-lang-select');
    if (sel) {
      sel.value = firstLang;
      _owSelectedLanguage = firstLang;
    }
  }

  var btn = document.getElementById('ow-region-next-btn');
  if (btn) btn.disabled = false;
  if (typeof owValidateIndRegionStep === 'function') owValidateIndRegionStep();
}

function owSetLanguage(val) {
  _owSelectedLanguage = val;
}

function owRegionNext() {
  if (!_owSelectedRegion) return;
  _owStep = 1;
  document.getElementById('ow-step-0').style.display = 'none';
  document.getElementById('ow-step-1').style.display = 'block';
  _owUpdateDots(2);
}

/* ── Locale info bar for preview (Step 2) ──────────────────────────────── */
function _owBuildLocaleBar() {
  if (!_owSelectedRegion) return '';
  var reg  = _novatraiRegions[_owSelectedRegion];
  var lang = _novatraiLanguages[_owSelectedLanguage] || _novatraiLanguages['en'];
  if (!reg) return '';

  var primary = reg.comms.primaryChannel;
  var primaryLabel = primary === 'whatsapp' ? '📱 WhatsApp-first'
                   : primary === 'sms'      ? '💬 SMS / Text-first'
                   :                          '✉️ Email-first';

  var waLabel = reg.comms.whatsapp
    ? '<span class="ow-locale-comms-on">WhatsApp ✓</span>'
    : '<span class="ow-locale-comms-off">WhatsApp</span>';

  return '<div class="ow-locale-bar">' +
    '<span class="ow-locale-item">' + reg.flag + ' <strong>' + reg.name + '</strong></span>' +
    '<span class="ow-locale-sep">|</span>' +
    '<span class="ow-locale-item">💰 <strong>' + reg.currency.symbol + ' ' + reg.currency.code + '</strong></span>' +
    '<span class="ow-locale-sep">|</span>' +
    '<span class="ow-locale-item">' + primaryLabel + '</span>' +
    '<span class="ow-locale-sep">|</span>' +
    '<span class="ow-locale-item">' + waLabel + '</span>' +
    '<span class="ow-locale-sep">|</span>' +
    '<span class="ow-locale-item">🌐 <strong>' + lang.name + '</strong></span>' +
    '<span class="ow-locale-sep">|</span>' +
    '<span class="ow-locale-item" style="font-size:10px;color:#5A7080;">' + reg.taxTerm + ' · ' + reg.dateFormat + '</span>' +
    '</div>';
}



// ════════════════════════════════════════════════════════════════
//  SUPER ADMIN ENGINE
// ════════════════════════════════════════════════════════════════
var _saLog = [];

/* intercept console.log for the sa panel */
(function(){
  var _orig = console.log.bind(console);
  console.log = function() {
    _orig.apply(console, arguments);
    var msg = Array.from(arguments).join(' ');
    _saLog.push({ t: new Date().toLocaleTimeString(), m: msg });
    if (_saLog.length > 100) _saLog.shift();
    var el = document.getElementById('sa-console-log');
    if (el) {
      el.innerHTML = _saLog.slice().reverse().map(function(e){
        return '<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)">' +
               '<span style="color:#5A7080;margin-right:8px">' + e.t + '</span>' + e.m + '</div>';
      }).join('');
    }
  };
})();

function saRefresh() {
  /* ── Stat grid ─── */
  var locale   = _novatraiLocale || {};
  var reg      = (locale.region && _novatraiRegions) ? _novatraiRegions[locale.region] : null;
  var profKey  = (typeof _novatraiActiveProfile !== 'undefined') ? _novatraiActiveProfile : localStorage.getItem('novatrai_profile') || '—';
  var profCfg  = (_novatraiProfileConfig && profKey !== '—') ? _novatraiProfileConfig[profKey] : null;

  var stats = [
    { label:'Profile', value: profCfg ? profCfg.name : profKey, color:'#4A8FFF' },
    { label:'Region',  value: reg ? reg.flag + ' ' + reg.name : (locale.region || '—'), color:'#3DD68C' },
    { label:'Currency',value: reg ? reg.currency.code + ' (' + reg.currency.symbol + ')' : '—', color:'#F0A843' },
    { label:'Language',value: locale.language || 'en', color:'#9AABB8' },
    { label:'Primary Channel', value: reg ? (reg.comms.primaryChannel === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS') : '—', color: reg && reg.comms.primaryChannel === 'whatsapp' ? '#3DD68C' : '#4A8FFF' },
    { label:'Tax Term', value: reg ? reg.taxTerm : '—', color:'#9AABB8' },
  ];

  var grid = document.getElementById('sa-stat-grid');
  if (grid) grid.innerHTML = stats.map(function(s){
    return '<div style="background:#141A22;border-radius:8px;padding:12px 14px;border:1px solid rgba(255,255,255,0.06)">' +
           '<div style="font-size:10px;color:#5A7080;letter-spacing:.4px;text-transform:uppercase;margin-bottom:5px">' + s.label + '</div>' +
           '<div style="font-size:15px;font-weight:700;color:' + s.color + '">' + s.value + '</div>' +
           '</div>';
  }).join('');

  /* ── Locale grid ─── */
  var locGrid = document.getElementById('sa-locale-grid');
  if (locGrid && reg) {
    var items = [
      ['Flag',        reg.flag + ' ' + reg.name],
      ['Currency',    reg.currency.symbol + ' · ' + reg.currency.code],
      ['Date Format', reg.dateFormat],
      ['Tax Term',    reg.taxTerm],
      ['WhatsApp',    reg.comms.whatsapp ? '✓ Active' : '✗ Hidden'],
      ['SMS / Text',  reg.comms.sms ? '✓ Active' : '✗ Hidden'],
      ['Languages',   (reg.languages || []).join(', ')],
      ['Locale Code', reg.locale || '—'],
    ];
    locGrid.innerHTML = items.map(function(r){
      return '<div style="display:flex;flex-direction:column;gap:3px;padding:10px 12px;background:#141A22;border-radius:8px;border:1px solid rgba(255,255,255,0.05)">' +
             '<span style="font-size:10px;color:#5A7080;text-transform:uppercase;letter-spacing:.3px">' + r[0] + '</span>' +
             '<span style="font-size:13px;color:#E4EBF5;font-weight:600">' + r[1] + '</span></div>';
    }).join('');
  } else if (locGrid) {
    locGrid.innerHTML = '<div style="color:#5A7080;font-size:12px;padding:8px">No locale applied — run setup wizard first.</div>';
  }

  /* ── Profile detail ─── */
  var profDiv = document.getElementById('sa-profile-detail');
  if (profDiv && profCfg) {
    var featureCount = Object.values(profCfg.features || {}).filter(Boolean).length;
    var stages = (profCfg.pipeline && profCfg.pipeline.stages) ? profCfg.pipeline.stages.length : 0;
    var tmpl   = (profCfg.templates || []).length;
    profDiv.innerHTML =
      '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
      '<div style="font-size:24px;font-weight:800;color:#4A8FFF">' + profCfg.name + '</div>' +
      (profCfg.isComposite ? '<span style="font-size:11px;padding:3px 9px;border-radius:20px;background:rgba(240,168,67,0.12);color:#F0A843;border:1px solid rgba(240,168,67,0.2)">Composite Merge</span>' : '') +
      '</div>' +
      '<div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap">' +
      _saBadge(featureCount + ' Features enabled', '#4A8FFF') +
      _saBadge(stages + ' Pipeline stages', '#3DD68C') +
      _saBadge(tmpl + ' Templates', '#F0A843') +
      (profCfg.pipeline ? _saBadge('Pipeline: ' + profCfg.pipeline.name, '#9AABB8') : '') +
      '</div>' +
      (profCfg.compositeKeys ? '<div style="margin-top:10px;font-size:12px;color:#9AABB8">Merged from: <b style=color:#E4EBF5>' + profCfg.compositeKeys.join(' + ') + '</b></div>' : '');
  } else if (profDiv) {
    profDiv.innerHTML = '<div style="color:#5A7080;font-size:12px;padding:8px">No profile applied — run setup wizard first.</div>';
  }

  /* ── Feature flags ─── */
  var fGrid = document.getElementById('sa-features-grid');
  if (fGrid && profCfg && profCfg.features) {
    fGrid.innerHTML = Object.entries(profCfg.features).map(function(e){
      var on = e[1];
      return '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:#141A22;border:1px solid rgba(255,255,255,0.05)">' +
             '<div style="width:7px;height:7px;border-radius:50%;background:' + (on ? '#3DD68C' : '#F07070') + ';flex-shrink:0"></div>' +
             '<span style="font-size:12px;color:' + (on ? '#E4EBF5' : '#5A7080') + '">' + e[0].replace(/([A-Z])/g,' $1').replace(/^./,function(c){return c.toUpperCase()}) + '</span>' +
             '</div>';
    }).join('');
  } else if (fGrid) {
    fGrid.innerHTML = '<div style="color:#5A7080;font-size:12px;padding:8px">No profile loaded.</div>';
  }

  /* ── Pipeline snapshot ─── */
  var pGrid = document.getElementById('sa-pipeline-grid');
  if (pGrid) {
    var deals = (typeof _plDeals !== 'undefined') ? (Array.isArray(_plDeals) ? _plDeals : Object.values(_plDeals)) : [];
    var totalVal = deals.reduce(function(s,d){ return s + (parseFloat(d.value)||0); }, 0);
    var won   = deals.filter(function(d){ return d.stage && d.stage.toLowerCase().includes('won'); }).length;
    var stages2 = [...new Set(deals.map(function(d){ return d.stage; }))].length;
    var pStats = [
      { label:'Total Deals',   value: deals.length, color:'#4A8FFF' },
      { label:'Total Value',   value: (reg ? reg.currency.symbol : '') + totalVal.toLocaleString(), color:'#3DD68C' },
      { label:'Stages Active', value: stages2, color:'#F0A843' },
      { label:'Won Deals',     value: won, color:'#9AABB8' },
    ];
    pGrid.innerHTML = pStats.map(function(s){
      return '<div style="background:#141A22;border-radius:8px;padding:12px 14px;border:1px solid rgba(255,255,255,0.06)">' +
             '<div style="font-size:10px;color:#5A7080;letter-spacing:.4px;text-transform:uppercase;margin-bottom:5px">' + s.label + '</div>' +
             '<div style="font-size:20px;font-weight:700;color:' + s.color + '">' + s.value + '</div>' +
             '</div>';
    }).join('');
  }

  /* ── Timestamp ─── */
  var ts = document.getElementById('sa-last-refresh');
  if (ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString();
}

function _saBadge(txt, color) {
  return '<span style="font-size:11px;padding:4px 10px;border-radius:20px;background:rgba(255,255,255,0.05);color:' + color + ';border:1px solid rgba(255,255,255,0.1)">' + txt + '</span>';
}

function saCopyConfig() {
  var cfg = {
    locale: _novatraiLocale,
    profile: localStorage.getItem('novatrai_profile'),
    timestamp: new Date().toISOString()
  };
  try {
    navigator.clipboard.writeText(JSON.stringify(cfg, null, 2));
    console.log('Super Admin: config JSON copied to clipboard');
  } catch(e) {
    console.log('Super Admin: copy failed — ' + e.message);
  }
}

function saExportLog() {
  var log = _saLog.map(function(e){ return '[' + e.t + '] ' + e.m; }).join('\n');
  var a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(log);
  a.download = 'novatrai-system-log-' + Date.now() + '.txt';
  a.click();
  console.log('Super Admin: system log exported');
}

function saClearLog() {
  _saLog = [];
  var el = document.getElementById('sa-console-log');
  if (el) el.innerHTML = '<div style="color:#5A7080;font-size:12px">Log cleared.</div>';
}

/* Auto-refresh when the Super Admin screen is opened */
var _saOrigStgNav = typeof stgNav === 'function' ? stgNav : null;


/* ════════════════════════════════════════════════════════════════
   CONTACTS DATA STORE
════════════════════════════════════════════════════════════════ */
var _contactsData = {
  'CF000130': {
    id:'CF000130', name:'Stephanus Van Deventer', initials:'SV',
    jobTitle:'Director', company:'Legal Clear', companyId:'legal-clear',
    email:'s.vandeventer@legalclear.co.za', phone:'+27 82 445 6712',
    whatsapp:'+27 82 445 6712', status:'active', tags:['active','vip'],
    source:'Referral', created:'2024-01-12',
    relScore:87, lastContact:'2025-02-18',
    address:'14 Sandton Drive, Sandton, GP, 2196',
    idNumber:'7203155123085',
    notes: [],
    tasks: [
      {id:'t1', text:'Send policy renewal reminder', due:'Tomorrow', done:false},
      {id:'t2', text:'Schedule annual review call', due:'Next week', done:false},
    ],
    deals: ['deal-1'],
    timeline: [
      {type:'email', icon:'✉', title:'Sent renewal quote', time:'Today, 10:22am',
       text:'Forwarded updated motor & household premium schedule for 2026/27 policy year.'},
      {type:'wa', icon:'💬', title:'WhatsApp replied', time:'Yesterday, 3:41pm',
       text:'Confirmed receipt of documents. Requested PDF summary.'},
      {type:'call', icon:'📞', title:'Outbound call — 8 min', time:'Mon 17 Feb',
       text:'Discussed claim status. Client satisfied with resolution. Flagged renewal in 6 weeks.'},
      {type:'deal', icon:'🏷', title:'Deal moved to Proposal Sent', time:'Mon 17 Feb',
       text:'Pipeline deal "Legal Clear — Fleet" advanced from Qualified to Proposal Sent.'},
      {type:'note', icon:'📝', title:'Note added', time:'Fri 14 Feb',
       text:'James mentioned Sarah (Finance) is the decision-maker on group policy. Copy her on all correspondence.'},
      {type:'email', icon:'✉', title:'Email received', time:'Thu 13 Feb',
       text:'Replied with updated claims history and NCD certificate.'},
    ]
  },
  'CF000131': {
    id:'CF000131', name:'Megan Naidoo', initials:'MN',
    jobTitle:'Operations Manager', company:'Apex Logistics', companyId:'apex-logistics',
    email:'megan.naidoo@apexlogistics.co.za', phone:'+27 71 830 2209',
    whatsapp:'+27 71 830 2209', status:'active', tags:['active','prospect'],
    source:'LinkedIn', created:'2024-03-05',
    relScore:64, lastContact:'2025-02-10',
    address:'22 Industrial Park, Isando, GP, 1609',
    idNumber:'8805234512083',
    notes: [],
    tasks: [
      {id:'t3', text:'Follow up on fleet insurance quote', due:'Today', done:false},
      {id:'t4', text:'Send commercial lines brochure', due:'This week', done:true},
    ],
    deals: ['deal-3'],
    timeline: [
      {type:'email', icon:'✉', title:'Sent fleet quote', time:'Mon 10 Feb',
       text:'Comprehensive fleet cover proposal for 14-vehicle logistics fleet. Awaiting response.'},
      {type:'wa', icon:'💬', title:'WhatsApp — first contact', time:'Fri 7 Feb',
       text:'Introduced Novatrai services. Megan confirmed interest in fleet and liability cover.'},
      {type:'note', icon:'📝', title:'Note added', time:'Wed 5 Feb',
       text:'Met at Cape Town Logistics Expo. Strong lead — 14-vehicle fleet, liability exposure.'},
    ]
  },
  'CF000132': {
    id:'CF000132', name:'André du Plessis', initials:'AP',
    jobTitle:'Financial Director', company:'Du Plessis Family Trust', companyId:'dp-trust',
    email:'aduplessis@dptrust.co.za', phone:'+27 83 512 7741',
    whatsapp:'+27 83 512 7741', status:'active', tags:['active','vip'],
    source:'Referral', created:'2023-11-20',
    relScore:92, lastContact:'2025-02-20',
    address:'8 Wine Estate Drive, Stellenbosch, WC, 7600',
    idNumber:'6711135049081',
    notes: [],
    tasks: [
      {id:'t5', text:'Prepare estate planning review document', due:'Next Friday', done:false},
    ],
    deals: ['deal-2'],
    timeline: [
      {type:'call', icon:'📞', title:'Review call — 22 min', time:'Thu 20 Feb',
       text:'Comprehensive annual financial review. Discussed offshore allocation and beneficiary updates.'},
      {type:'email', icon:'✉', title:'Sent investment report Q4 2025', time:'Mon 17 Feb',
       text:'Quarterly portfolio performance summary. Returns: +11.2% YTD across all instruments.'},
      {type:'deal', icon:'🏷', title:'Portfolio value updated', time:'Mon 17 Feb',
       text:'Du Plessis Family Trust portfolio value confirmed at R2.1M across 4 products.'},
      {type:'note', icon:'📝', title:'Estate planning flag', time:'Fri 7 Feb',
       text:'André flagged desire to restructure trust beneficiaries before end of tax year. High priority.'},
    ]
  },
  'CF000133': {
    id:'CF000133', name:'Nomvula Dlamini', initials:'ND',
    jobTitle:'HR Manager', company:'Soweto Community Health', companyId:'sch',
    email:'n.dlamini@sch.org.za', phone:'+27 76 234 8812',
    whatsapp:'+27 76 234 8812', status:'prospect', tags:['prospect'],
    source:'Web Form', created:'2025-01-08',
    relScore:41, lastContact:'2025-02-01',
    address:'33 Vilakazi Street, Orlando West, GP, 1804',
    idNumber:'9004178234086',
    notes: [],
    tasks: [
      {id:'t6', text:'Send group life cover proposal', due:'Overdue', done:false},
      {id:'t7', text:'Book discovery call', due:'This week', done:false},
    ],
    deals: [],
    timeline: [
      {type:'email', icon:'✉', title:'Follow-up email sent', time:'Sat 1 Feb',
       text:'Second follow-up on group life and disability inquiry. No response yet.'},
      {type:'email', icon:'✉', title:'Initial inquiry received', time:'Wed 8 Jan',
       text:'Submitted inquiry via web form. Interested in group life cover for 45 employees.'},
    ]
  },
  'CF000134': {
    id:'CF000134', name:'Pieter Engelbrecht', initials:'PE',
    jobTitle:'CEO', company:'Engelbrecht Solar', companyId:'engelbrecht-solar',
    email:'pieter@engelbrechtsolar.co.za', phone:'+27 82 991 3345',
    whatsapp:'+27 82 991 3345', status:'active', tags:['active'],
    source:'Google Ads', created:'2024-09-14',
    relScore:73, lastContact:'2025-02-15',
    address:'77 Berg Street, Paarl, WC, 7646',
    idNumber:'7508175098083',
    notes: [],
    tasks: [
      {id:'t8', text:'Confirm installation date for Phase 2', due:'Tomorrow', done:false},
      {id:'t9', text:'Send invoice for Phase 1 completion', due:'Today', done:false},
    ],
    deals: ['deal-4','deal-5'],
    timeline: [
      {type:'deal', icon:'🏷', title:'Phase 2 deal created', time:'Sat 15 Feb',
       text:'New pipeline deal created: Engelbrecht Solar Phase 2 — Battery Backup. Value: R285,000.'},
      {type:'call', icon:'📞', title:'Site visit call — 15 min', time:'Thu 13 Feb',
       text:'Confirmed Phase 1 installation complete. Pieter very happy. Ready to proceed with Phase 2.'},
      {type:'email', icon:'✉', title:'Phase 1 completion docs sent', time:'Mon 10 Feb',
       text:'Handover certificate, warranty documentation, and Phase 2 proposal attached.'},
      {type:'note', icon:'📝', title:'Upsell opportunity', time:'Mon 10 Feb',
       text:'Pieter expressed interest in battery backup for their workshop building. Budget R250-300k.'},
    ]
  }
};

var _cdpCurrentContact = null;

/* ── Open / Close ────────────────────────────────── */
function openContactDetail(contactId) {
  var c = _contactsData[contactId];
  if (!c) return;
  _cdpCurrentContact = c;
  _cdpPopulate(c);
  document.getElementById('contact-detail-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Reset to timeline tab
  cdpTab('timeline', document.querySelector('.cdp-tab'));
}

function cdpClose() {
  document.getElementById('contact-detail-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function cdpBack() { cdpClose(); switchScreen('contacts'); }

function cdpHandleOverlayClick(e) {
  if (e.target === document.getElementById('contact-detail-overlay')) cdpClose();
}

function cdpOpenCompany(e) {
  e.preventDefault(); cdpClose(); switchScreen('companies');
}

/* ── Tab switching ───────────────────────────────── */
function cdpTab(pane, el) {
  document.querySelectorAll('.cdp-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.cdp-pane').forEach(function(p){ p.classList.remove('active'); });
  if (el) el.classList.add('active');
  var paneEl = document.getElementById('cdp-pane-' + pane);
  if (paneEl) paneEl.classList.add('active');
}

/* ── Populate panel ──────────────────────────────── */
function _cdpPopulate(c) {
  // Header
  document.getElementById('cdp-header-name').textContent = c.name;
  document.getElementById('cdp-header-company').textContent = '· ' + c.company;

  // Avatar
  var av = document.getElementById('cdp-avatar');
  av.textContent = c.initials;
  av.style.color = c.tags.includes('vip') ? '#F0A843' : '#4A8FFF';

  // Profile card
  document.getElementById('cdp-name').textContent = c.name;
  document.getElementById('cdp-jobtitle').textContent = c.jobTitle;
  var cl = document.getElementById('cdp-company-link');
  cl.textContent = c.company; cl.href = '#';

  // Contact chips
  var cr = document.getElementById('cdp-contact-row');
  cr.innerHTML = [
    c.email ? '<a class="cdp-contact-chip" href="mailto:'+c.email+'">' +
      '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' +
      c.email + '</a>' : '',
    c.phone ? '<a class="cdp-contact-chip call" href="tel:'+c.phone+'">' +
      '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>' +
      c.phone + '</a>' : '',
    c.whatsapp ? '<a class="cdp-contact-chip wa" href="#" onclick="openEmailComposer(\''+c.name+'\');return false;">' +
      '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>' +
      'WhatsApp</a>' : '',
  ].join('');

  // Tags
  var tr = document.getElementById('cdp-tags-row');
  tr.innerHTML = (c.tags||[]).map(function(t){
    return '<span class="cdp-tag ' + t + '">' + t.replace('-',' ') + '</span>';
  }).join('') + '<span class="cdp-tag" style="background:rgba(154,171,184,0.08);color:#9AABB8;border:1px solid rgba(154,171,184,0.15)">' + c.source + '</span>';

  // KPIs
  var linked = _cdpLinkedDeals(c);
  var totalVal = linked.reduce(function(s,d){ return s + _cdpDealValue(d.value); }, 0);
  var currency = (_novatraiLocale && _novatraiRegions && _novatraiRegions[_novatraiLocale.region])
    ? _novatraiRegions[_novatraiLocale.region].currency.symbol : 'R';
  document.getElementById('cdp-kpi-deals').textContent = linked.length;
  document.getElementById('cdp-kpi-value').textContent = currency + ' ' + totalVal.toLocaleString();
  document.getElementById('cdp-kpi-activities').textContent = (c.timeline||[]).length;
  var scoreEl = document.getElementById('cdp-kpi-score');
  scoreEl.textContent = c.relScore;
  scoreEl.style.color = c.relScore >= 75 ? '#3DD68C' : c.relScore >= 50 ? '#F0A843' : '#F07070';

  // Timeline
  _cdpRenderTimeline(c);
  // Deals
  _cdpRenderDeals(c);
  // Notes & Tasks
  _cdpRenderNotesTasks(c);
  // Full Profile
  _cdpRenderFullProfile(c);
}

function _cdpLinkedDeals(c) {
  if (!c.deals || !c.deals.length) return [];
  var deals = (typeof _plDeals !== 'undefined')
    ? (Array.isArray(_plDeals) ? _plDeals : Object.values(_plDeals))
    : [];
  return deals.filter(function(d){ return c.deals.indexOf(d.id||d.deal_id) > -1; });
}

function _cdpDealValue(valStr) {
  if (!valStr) return 0;
  return parseFloat(String(valStr).replace(/[^0-9.]/g,'')) || 0;
}

function _cdpRenderTimeline(c) {
  var list = document.getElementById('cdp-timeline-list');
  if (!list || !c.timeline) return;
  list.innerHTML = c.timeline.map(function(item){
    return '<div class="cdp-tl-item">' +
      '<div class="cdp-tl-dot ' + item.type + '">' + item.icon + '</div>' +
      '<div class="cdp-tl-body">' +
        '<div class="cdp-tl-header">' +
          '<span class="cdp-tl-title">' + item.title + '</span>' +
          '<span class="cdp-tl-time">' + item.time + '</span>' +
        '</div>' +
        '<div class="cdp-tl-text">' + item.text + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function _cdpRenderDeals(c) {
  var list = document.getElementById('cdp-deals-list');
  if (!list) return;
  var linked = _cdpLinkedDeals(c);
  if (!linked.length) {
    list.innerHTML = '<div style="color:#5A7080;font-size:12px;padding:8px">No pipeline deals linked to this contact yet.</div>';
    return;
  }
  list.innerHTML = linked.map(function(d){
    return '<div class="cdp-deal-card">' +
      '<div class="cdp-deal-row">' +
        '<div class="cdp-deal-name">' + (d.company||d.name||'Deal') + '</div>' +
        '<div class="cdp-deal-stage-pill">' + (d.stage||'—') + '</div>' +
        '<div class="cdp-deal-val">' + (d.value||'—') + '</div>' +
      '</div>' +
      '<div class="cdp-deal-meta">Close: ' + (d.close||'—') + ' · Probability: ' + (d.prob||'—') + '</div>' +
    '</div>';
  }).join('');
}

function _cdpRenderNotesTasks(c) {
  // Tasks
  var taskList = document.getElementById('cdp-tasks-list');
  if (taskList && c.tasks) {
    taskList.innerHTML = c.tasks.map(function(t){
      return '<div class="cdp-task-item" id="task-'+t.id+'">' +
        '<div class="cdp-task-check ' + (t.done?'done':'') + '" onclick="cdpToggleTask(\''+c.id+'\',\''+t.id+'\',this)">' +
          (t.done ? '<svg fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3" style="width:10px;height:10px"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : '') +
        '</div>' +
        '<span class="cdp-task-text ' + (t.done?'done':'') + '">' + t.text + '</span>' +
        '<span class="cdp-task-due">' + t.due + '</span>' +
      '</div>';
    }).join('');
  }
  // Notes
  var noteList = document.getElementById('cdp-notes-list');
  if (noteList) _cdpRenderNotesList(c);
}

function _cdpRenderNotesList(c) {
  var noteList = document.getElementById('cdp-notes-list');
  if (!c.notes || !c.notes.length) {
    noteList.innerHTML = '<div style="color:#5A7080;font-size:12px;padding:4px 0 12px">No notes yet — add one above.</div>';
    return;
  }
  noteList.innerHTML = c.notes.map(function(n){
    return '<div style="background:#1B2230;border-radius:8px;padding:10px 14px;margin-bottom:8px;border:1px solid #1F2A38">' +
      '<div style="font-size:11px;color:#5A7080;margin-bottom:4px">' + n.time + '</div>' +
      '<div style="font-size:12px;color:#9AABB8">' + n.text + '</div>' +
    '</div>';
  }).join('');
}

function _cdpRenderFullProfile(c) {
  var grid = document.getElementById('cdp-full-profile-grid');
  if (!grid) return;
  var fields = [
    ['Email', c.email||'—'], ['Phone', c.phone||'—'],
    ['WhatsApp', c.whatsapp||'—'], ['Address', c.address||'—'],
    ['File #', c.id], ['ID Number', c.idNumber||'—'],
    ['Status', c.status], ['Source', c.source],
    ['Created', c.created||'—'], ['Last Contact', c.lastContact||'—'],
  ];
  grid.innerHTML = fields.map(function(f){
    return '<div style="background:#1B2230;border-radius:8px;padding:10px 14px;border:1px solid #1F2A38">' +
      '<div style="font-size:10px;color:#5A7080;text-transform:uppercase;letter-spacing:.3px;margin-bottom:3px">' + f[0] + '</div>' +
      '<div style="font-size:12px;color:#E4EBF5;font-weight:600;word-break:break-all">' + f[1] + '</div>' +
    '</div>';
  }).join('');
}

function cdpToggleTask(contactId, taskId, el) {
  var c = _contactsData[contactId];
  if (!c) return;
  var task = c.tasks.find(function(t){ return t.id === taskId; });
  if (!task) return;
  task.done = !task.done;
  _cdpRenderNotesTasks(c);
}

function cdpAddNote() {
  var inp = document.getElementById('cdp-note-input');
  var text = inp ? inp.value.trim() : '';
  if (!text || !_cdpCurrentContact) return;
  var now = new Date();
  var timeStr = now.toLocaleDateString('en-ZA', {day:'numeric',month:'short'}) + ' at ' +
    now.toLocaleTimeString('en-ZA', {hour:'2-digit', minute:'2-digit'});
  _cdpCurrentContact.notes.unshift({text:text, time:timeStr});
  inp.value = '';
  _cdpRenderNotesList(_cdpCurrentContact);
  // Add to timeline too
  _cdpCurrentContact.timeline.unshift({
    type:'note', icon:'📝', title:'Note added', time:timeStr, text:text
  });
  _cdpRenderTimeline(_cdpCurrentContact);
  console.log('Novatrai: note added for ' + _cdpCurrentContact.name);
}

// ── Full Workspace / God Mode View ─────────────────────────────
var _novatraiGodMode = false;

function viewFullWorkspace() {
  _novatraiGodMode = true;

  // 1. Show every sidebar-section container (applyProfile hides these)
  document.querySelectorAll('.sidebar-section').forEach(function(el){
    el.style.display = '';
  });

  // 2. Show every individual sidebar-item <a> tag
  document.querySelectorAll('[data-screen]').forEach(function(el){
    el.style.display = '';
  });

  // 3. Restore original labels from the full screens list
  var allScreens = [
    {screen:'dashboard',     label:'Dashboard'},
    {screen:'todos',         label:'Tasks & To-Dos'},
    {screen:'pipeline',      label:'Pipeline'},
    {screen:'calendar',      label:'Calendar'},
    {screen:'mail',          label:'Mail'},
    {screen:'finance',       label:'Finance'},
    {screen:'invoices',      label:'Invoices'},
    {screen:'payments',      label:'Payments'},
    {screen:'journals',      label:'Journals'},
    {screen:'companies',     label:'Companies'},
    {screen:'contacts',      label:'Contacts'},
    {screen:'media-library', label:'Media Library'},
    {screen:'master-docs',   label:'Documents'},
    {screen:'templates',     label:'Templates'},
    {screen:'forms',         label:'Forms'},
    {screen:'reports',       label:'Reports'},
    {screen:'automations',   label:'Automations'},
    {screen:'integrations',  label:'Integrations'},
  ];

  allScreens.forEach(function(item){
    // Try data-screen attribute first, then scan all nav links for onclick match
    var el = document.querySelector('[data-screen="' + item.screen + '"]');
    if (!el) {
      document.querySelectorAll('[onclick]').forEach(function(candidate){
        if (candidate.getAttribute('onclick') && candidate.getAttribute('onclick').indexOf(item.screen) > -1) {
          el = candidate;
        }
      });
    }
    if (!el) return;
    var labelEl = el.querySelector('.nav-label');
    if (labelEl) { labelEl.textContent = item.label; }
    else {
      /* Update only the direct text node, not badge spans */
      var nodes = el.childNodes;
      for (var n = 0; n < nodes.length; n++) {
        if (nodes[n].nodeType === 3 && nodes[n].textContent.trim()) { nodes[n].textContent = '\n      ' + item.label + '\n    '; break; }
      }
    }
    var li = el.closest('li') || el.parentElement;
    if (li) li.style.display = '';
    el.style.display = '';
  });

  // Show ALL feature-gated elements
  document.querySelectorAll('[data-feature]').forEach(function(el){
    el.style.display = '';
  });

  // Show all nav groups / sidebar sections that may have been hidden
  document.querySelectorAll('.nav-group, .sidebar-section, .nav-section, .nav-divider').forEach(function(el){
    el.style.display = '';
  });

  // Remove any existing banner first
  var existing = document.getElementById('god-mode-banner');
  if (existing) existing.remove();

  // Inject amber banner across the top
  var banner = document.createElement('div');
  banner.id = 'god-mode-banner';
  banner.style.cssText = [
    'position:fixed','top:0','left:0','right:0','z-index:8500',
    'display:flex','align-items:center','gap:10px','padding:7px 20px',
    'background:#1C1200','border-bottom:2px solid rgba(240,168,67,0.4)',
    'backdrop-filter:blur(4px)',
  ].join(';');
  banner.innerHTML = [
    '<span style="font-size:13px;font-weight:800;color:#F0A843;letter-spacing:.3px">',
      '&#x26A1; SUPER ADMIN VIEW',
    '</span>',
    '<span style="font-size:11px;color:#9AABB8;margin-left:4px">',
      '— All features unlocked &amp; profile filters removed',
    '</span>',
    '<button onclick="exitGodMode()" style="',
      'margin-left:auto;padding:5px 16px;border-radius:8px;cursor:pointer;',
      'border:1px solid rgba(240,168,67,0.45);background:rgba(240,168,67,0.1);',
      'color:#F0A843;font-size:11px;font-weight:700;transition:background .15s;',
    '" onmouseover="this.style.background=\'rgba(240,168,67,0.2)\'" ',
    'onmouseout="this.style.background=\'rgba(240,168,67,0.1)\'">',
      '&#x2715; Exit Admin View',
    '</button>',
  ].join('');
  document.body.appendChild(banner);

  // Push app shell down so banner doesn't cover the topbar
  var appShell = document.querySelector('.app-shell') ||
                 document.querySelector('#app') ||
                 document.querySelector('main') ||
                 document.body.children[0];
  if (appShell && appShell.id !== 'god-mode-banner') {
    appShell.style.marginTop = '40px';
  }

  console.log('Novatrai: Super Admin god mode — all features and sidebar items visible');
}

function exitGodMode() {
  _novatraiGodMode = false;

  // Remove banner
  var banner = document.getElementById('god-mode-banner');
  if (banner) banner.remove();

  // Reset margin
  var appShell = document.querySelector('.app-shell') ||
                 document.querySelector('#app') ||
                 document.querySelector('main');
  if (appShell) appShell.style.marginTop = '';

  // Re-apply saved profile to restore filters
  var saved = localStorage.getItem('novatrai_profile');
  if (saved) {
    var keys = saved.split(',').map(function(k){ return k.trim(); });
    applyProfile(keys.length === 1 ? keys[0] : keys);
    console.log('Novatrai: exited god mode — profile filters restored');
  } else {
    console.log('Novatrai: exited god mode — no saved profile to restore');
  }
}

// ── Reset & re-run setup wizard


function resetAndRunWizard() {
  if (!confirm('Re-run the setup wizard? Your current workspace config will be cleared.')) return;
  localStorage.removeItem('novatrai_profile');
  localStorage.removeItem('novatrai_locale');
  localStorage.removeItem('sidebar-overrides');
  _owSelected = [];
  _owSelectedRegion = null;
  _owSelectedLanguage = 'en';
  _novatraiLocale = null;
  document.querySelectorAll('.ow-card.selected').forEach(function(c){ c.classList.remove('selected'); });
  document.querySelectorAll('.ow-region-card.selected, .ow-region-card-compact.selected').forEach(function(c){ c.classList.remove('selected'); });
  var ls = document.getElementById('ow-lang-select');
  if (ls) ls.value = 'en';
  var nb = document.getElementById('ow-region-next-btn');
  if (nb) { nb.disabled = true; nb.style.opacity = '0.4'; }
  openOnboardingWizard();
  console.log('Novatrai: wizard reset — starting from Step 0');
}

  /* ══ REPORTS & ANALYTICS ══════════════════════════════════ */
  function switchRptTab(el, name) {
    document.querySelectorAll('#screen-reports .rpt-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('#screen-reports .rpt-tab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('rpt-panel-' + name);
    if (panel) panel.classList.add('active');
  }

  function rptSetRange(el, range) {
    document.querySelectorAll('.rpt-dr-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    // In a real app this would re-fetch data; here we just show a toast
    const labels = {
      'mtd': 'Month to Date',
      'last-month': 'Last Month',
      'q1': 'Q1 2026',
      '6m': 'Last 6 Months',
      'ytd': 'Year to Date'
    };
    showToast('Date range: ' + (labels[range] || range), 'info');
  }

  function rptExport() {
    const activeTab = document.querySelector('#screen-reports .rpt-tab.active');
    const tabName = activeTab ? activeTab.textContent.trim() : 'Overview';
    showToast('Exporting ' + tabName + ' report as PDF…', 'success');
  }

  
  /* ══ THEME TOGGLE ══════════════════════════════════════ */
  function initTheme() {
    var saved = localStorage.getItem('cf_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cf_theme', next);
    showToast(next === 'light' ? 'Light mode on' : 'Dark mode on', 'info');
  }

  // Init on load
  initTheme();

  
  /* ══ CALENDAR: EVENT PANEL & WEEK/DAY VIEW ════════════════ */

  /* ── type colour map ── */
  const _CAL_COLORS = {
    meeting:  { bg:'rgba(59,130,246,.18)',  border:'#3b82f6', text:'#3b82f6'  },
    deadline: { bg:'rgba(239,68,68,.18)',   border:'#ef4444', text:'#ef4444'  },
    birthday: { bg:'rgba(139,92,246,.18)',  border:'#8b5cf6', text:'#8b5cf6'  },
    task:     { bg:'rgba(34,197,94,.18)',   border:'#22c55e', text:'#22c55e'  },
    reminder: { bg:'rgba(245,158,11,.18)',  border:'#f59e0b', text:'#f59e0b'  },
  };

  /* ── selected event key for popover/edit/delete ── */
  let _calActiveKey  = null;
  let _calActiveIdx  = 0;

  /* ── Open panel for new event ── */
  function openCalPanel(dateStr, prefillTitle) {
    const today = new Date();
    const pad = n => String(n).padStart(2,'0');
    const defaultDate = dateStr ||
      `${_calYear}-${pad(_calMonth+1)}-${pad(_TODAY.d)}`;

    document.getElementById('cep-title').value      = prefillTitle || '';
    document.getElementById('cep-date').value       = defaultDate;
    document.getElementById('cep-start').value      = '09:00';
    document.getElementById('cep-end').value        = '10:00';
    document.getElementById('cep-desc').value       = '';
    document.getElementById('cep-attendees').value  = '';
    document.getElementById('cep-location').value   = '';
    document.getElementById('cep-client').value     = '';
    document.getElementById('cep-allday').value     = 'no';
    document.getElementById('cep-repeat').value     = 'none';
    document.getElementById('cep-time-row').style.display = '';
    document.querySelectorAll('.cal-type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.cal-type-btn[data-type="meeting"]').classList.add('active');
    document.getElementById('cal-ep-title').textContent = 'New Event';
    document.getElementById('cal-ep').classList.add('open');
    document.getElementById('cal-ep-backdrop').classList.add('open');
    setTimeout(() => document.getElementById('cep-title').focus(), 150);
  }

  function closeCalPanel() {
    document.getElementById('cal-ep').classList.remove('open');
    document.getElementById('cal-ep-backdrop').classList.remove('open');
  }

  function calSelectType(btn, type) {
    document.querySelectorAll('.cal-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function calToggleAllDay(val) {
    document.getElementById('cep-time-row').style.display = val === 'yes' ? 'none' : '';
  }

  function saveCalEvent() {
    const title = document.getElementById('cep-title').value.trim();
    if (!title) { document.getElementById('cep-title').focus(); showToast('Please add a title', 'warning'); return; }
    const dateVal = document.getElementById('cep-date').value;
    if (!dateVal) { document.getElementById('cep-date').focus(); showToast('Please select a date', 'warning'); return; }

    const activeType = document.querySelector('.cal-type-btn.active');
    const type = activeType ? activeType.dataset.type : 'meeting';
    const start     = document.getElementById('cep-start').value;
    const end       = document.getElementById('cep-end').value;
    const desc      = document.getElementById('cep-desc').value.trim();
    const attendees = document.getElementById('cep-attendees').value.trim();
    const location  = document.getElementById('cep-location').value.trim();
    const client    = document.getElementById('cep-client').value.trim();
    const allDay    = document.getElementById('cep-allday').value === 'yes';
    const repeat    = document.getElementById('cep-repeat').value;

    const sub = [
      !allDay && start ? start + (end ? '–' + end : '') : 'All day',
      client || attendees || ''
    ].filter(Boolean).join(' · ');

    const newEv = { type, label: title, sub, desc, attendees, location, client,
                    start: allDay ? null : start, end: allDay ? null : end, allDay, repeat };

    if (!CAL_EVENTS[dateVal]) CAL_EVENTS[dateVal] = [];
    CAL_EVENTS[dateVal].push(newEv);

    closeCalPanel();
    showToast('Event saved: ' + title, 'success');
    renderCalGrid();
    if (_calView === 'week') renderWeekView();
    if (_calView === 'day')  renderDayView();
  }

  /* ── Improved day click ── */
  function _calDayClick(key) {
    const evs = CAL_EVENTS[key];
    if (!evs || evs.length === 0) {
      openCalPanel(key);
    } else if (evs.length === 1) {
      openCalPopover(key, 0, event);
    } else {
      // Multiple events — open popover for first, user can navigate
      openCalPopover(key, 0, event);
    }
  }

  /* ── Event detail popover ── */
  function openCalPopover(key, idx, ev) {
    if (ev) ev.stopPropagation();
    _calActiveKey = key;
    _calActiveIdx = idx;
    const evObj = CAL_EVENTS[key] && CAL_EVENTS[key][idx];
    if (!evObj) return;

    const pop = document.getElementById('cal-popover');
    const dot = document.getElementById('cal-pop-dot');
    const colors = _CAL_COLORS[evObj.type] || _CAL_COLORS.meeting;

    dot.style.background = colors.border;
    document.getElementById('cal-pop-title').textContent = evObj.label;

    // Date
    const parts = key.split('-');
    const d = new Date(+parts[0], +parts[1]-1, +parts[2]);
    const dateStr = d.toLocaleDateString('en-ZA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    document.getElementById('cal-pop-date-txt').textContent = dateStr;

    // Time
    const timeRow = document.getElementById('cal-pop-time-row');
    if (evObj.allDay || !evObj.start) {
      document.getElementById('cal-pop-time-txt').textContent = 'All day';
    } else {
      document.getElementById('cal-pop-time-txt').textContent =
        (evObj.start || '') + (evObj.end ? ' – ' + evObj.end : '');
    }

    // Location
    const locRow = document.getElementById('cal-pop-loc-row');
    locRow.style.display = evObj.location ? '' : 'none';
    document.getElementById('cal-pop-loc-txt').textContent = evObj.location || '';

    // Attendees
    const attendRow = document.getElementById('cal-pop-attend-row');
    attendRow.style.display = evObj.attendees ? '' : 'none';
    document.getElementById('cal-pop-attend-txt').textContent = evObj.attendees || '';

    // Description
    const descRow = document.getElementById('cal-pop-desc-row');
    descRow.style.display = evObj.desc ? '' : 'none';
    document.getElementById('cal-pop-desc-txt').textContent = evObj.desc || '';

    // Position popover near click
    pop.classList.add('open');
    if (ev) {
      const x = Math.min(ev.clientX + 10, window.innerWidth - 280);
      const y = Math.min(ev.clientY - 10, window.innerHeight - 280);
      pop.style.left = x + 'px';
      pop.style.top  = y + 'px';
    } else {
      pop.style.left = '50%'; pop.style.top = '40%';
      pop.style.transform = 'translate(-50%,-50%)';
    }
    document.addEventListener('click', _closePopoverOutside, { once: true });
  }

  function _closePopoverOutside(e) {
    const pop = document.getElementById('cal-popover');
    if (!pop.contains(e.target)) closeCalPopover();
  }

  function closeCalPopover() {
    document.getElementById('cal-popover').classList.remove('open');
    document.getElementById('cal-popover').style.transform = '';
  }

  function editCalEvent() {
    const evObj = CAL_EVENTS[_calActiveKey] && CAL_EVENTS[_calActiveKey][_calActiveIdx];
    if (!evObj) return;
    closeCalPopover();
    openCalPanel(_calActiveKey, evObj.label);
    // Pre-fill fields
    setTimeout(() => {
      document.getElementById('cep-title').value     = evObj.label || '';
      document.getElementById('cep-desc').value      = evObj.desc || '';
      document.getElementById('cep-attendees').value = evObj.attendees || '';
      document.getElementById('cep-location').value  = evObj.location || '';
      document.getElementById('cep-client').value    = evObj.client || '';
      if (evObj.start) document.getElementById('cep-start').value = evObj.start;
      if (evObj.end)   document.getElementById('cep-end').value   = evObj.end;
      const typeBtn = document.querySelector(`.cal-type-btn[data-type="${evObj.type}"]`);
      if (typeBtn) { document.querySelectorAll('.cal-type-btn').forEach(b=>b.classList.remove('active')); typeBtn.classList.add('active'); }
      document.getElementById('cal-ep-title').textContent = 'Edit Event';
      // Remove old event on save (simple approach: mark for replacement)
      document.getElementById('cal-ep').dataset.editKey = _calActiveKey;
      document.getElementById('cal-ep').dataset.editIdx = _calActiveIdx;
    }, 50);
  }

  function deleteCalEvent() {
    if (!_calActiveKey || !CAL_EVENTS[_calActiveKey]) return;
    const title = CAL_EVENTS[_calActiveKey][_calActiveIdx]?.label || 'Event';
    CAL_EVENTS[_calActiveKey].splice(_calActiveIdx, 1);
    if (CAL_EVENTS[_calActiveKey].length === 0) delete CAL_EVENTS[_calActiveKey];
    closeCalPopover();
    showToast('Deleted: ' + title, 'info');
    renderCalGrid();
    if (_calView === 'week') renderWeekView();
    if (_calView === 'day')  renderDayView();
  }

  /* ── Week View ── */
  function renderWeekView() {
    const container = document.getElementById('cal-view-week');
    if (!container) return;

    // Find Sunday of current week
    const dayOfWeek = new Date(_calYear, _calMonth, _TODAY.d).getDay();
    const weekStart = new Date(_calYear, _calMonth, _TODAY.d - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    const hours = Array.from({length: 15}, (_, i) => i + 7); // 7am–9pm
    const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const pad = n => String(n).padStart(2,'0');

    // Header
    let hdrHtml = '<div style="display:grid;grid-template-columns:52px repeat(7,1fr);border-bottom:1px solid var(--border);flex-shrink:0">';
    hdrHtml += '<div style="padding:8px 4px"></div>';
    days.forEach(d => {
      const isT = (d.getFullYear()===_TODAY.y && d.getMonth()===_TODAY.m && d.getDate()===_TODAY.d);
      hdrHtml += `<div style="padding:8px 6px;text-align:center;border-left:1px solid var(--border)">
        <div class="cal-timed-hdr-day">${DAY_ABBR[d.getDay()]}</div>
        <div class="cal-timed-hdr-num${isT?' today':''}"">${d.getDate()}</div>
      </div>`;
    });
    hdrHtml += '</div>';

    // Body
    let bodyHtml = '<div style="display:grid;grid-template-columns:52px repeat(7,1fr);flex:1;overflow-y:auto;">';
    // Time labels col
    bodyHtml += '<div class="cal-time-col">';
    hours.forEach(h => {
      const lbl = h === 12 ? '12pm' : h < 12 ? h+'am' : (h-12)+'pm';
      bodyHtml += `<div class="cal-time-slot"><span class="cal-time-lbl">${lbl}</span></div>`;
    });
    bodyHtml += '</div>';

    // Day columns
    days.forEach((d, di) => {
      const key = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      const isT = (d.getFullYear()===_TODAY.y && d.getMonth()===_TODAY.m && d.getDate()===_TODAY.d);
      const evs = CAL_EVENTS[key] || [];

      bodyHtml += `<div class="cal-day-col${isT?' today-col':''}" onclick="openCalPanel('${key}')" style="position:relative">`;
      hours.forEach(h => {
        bodyHtml += `<div class="cal-hour-line" data-half=":30"></div>`;
      });

      // Place timed events
      evs.forEach((ev, ei) => {
        if (!ev.start) return; // all-day handled elsewhere
        const [sh, sm] = ev.start.split(':').map(Number);
        const [eh, em] = ev.end ? ev.end.split(':').map(Number) : [sh+1, sm];
        const startMin = sh * 60 + (sm || 0);
        const endMin   = eh * 60 + (em || 0);
        const topPx    = (startMin - 7*60) * (48/60);
        const heightPx = Math.max((endMin - startMin) * (48/60), 22);
        if (topPx < 0 || topPx > hours.length * 48) return;
        const colors = _CAL_COLORS[ev.type] || _CAL_COLORS.meeting;
        bodyHtml += `<div class="cal-tev" onclick="event.stopPropagation();openCalPopover('${key}',${ei},event)"
          style="top:${topPx}px;height:${heightPx}px;background:${colors.bg};border-left:3px solid ${colors.border};color:${colors.text}">
          <div class="cal-tev-title">${ev.label}</div>
          ${heightPx > 30 ? `<div class="cal-tev-sub">${ev.sub||''}</div>` : ''}
        </div>`;
      });

      bodyHtml += '</div>';
    });
    bodyHtml += '</div>';

    container.innerHTML = hdrHtml + bodyHtml;
  }

  /* ── Day View ── */
  function renderDayView() {
    const container = document.getElementById('cal-view-day');
    if (!container) return;

    const d = new Date(_calYear, _calMonth, _TODAY.d);
    const pad = n => String(n).padStart(2,'0');
    const key = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const hours = Array.from({length: 15}, (_, i) => i + 7);
    const evs = CAL_EVENTS[key] || [];
    const MONTH_FULL = MONTH_NAMES[d.getMonth()];

    const hdrHtml = `<div style="display:grid;grid-template-columns:52px 1fr;border-bottom:1px solid var(--border);flex-shrink:0">
      <div style="padding:8px 4px"></div>
      <div style="padding:8px 16px;border-left:1px solid var(--border)">
        <div style="font-size:22px;font-weight:700;color:var(--text-primary,#E4EBF5);">${d.getDate()}</div>
        <div style="font-size:12px;color:var(--text-muted,#5A7080);font-weight:500">${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]}, ${MONTH_FULL} ${d.getFullYear()}</div>
      </div>
    </div>`;

    let bodyHtml = '<div style="display:grid;grid-template-columns:52px 1fr;flex:1;overflow-y:auto;">';
    bodyHtml += '<div class="cal-time-col">';
    hours.forEach(h => {
      const lbl = h === 12 ? '12pm' : h < 12 ? h+'am' : (h-12)+'pm';
      bodyHtml += `<div class="cal-time-slot"><span class="cal-time-lbl">${lbl}</span></div>`;
    });
    bodyHtml += '</div>';

    bodyHtml += `<div class="cal-day-col today-col" onclick="openCalPanel('${key}')" style="position:relative">`;
    hours.forEach(h => {
      bodyHtml += `<div class="cal-hour-line" data-half=":30"></div>`;
    });
    evs.forEach((ev, ei) => {
      if (!ev.start) return;
      const [sh, sm] = ev.start.split(':').map(Number);
      const [eh, em] = ev.end ? ev.end.split(':').map(Number) : [sh+1, sm];
      const startMin = sh * 60 + (sm||0);
      const endMin   = eh * 60 + (em||0);
      const topPx    = (startMin - 7*60) * (48/60);
      const heightPx = Math.max((endMin - startMin) * (48/60), 22);
      if (topPx < 0) return;
      const colors = _CAL_COLORS[ev.type] || _CAL_COLORS.meeting;
      bodyHtml += `<div class="cal-tev" onclick="event.stopPropagation();openCalPopover('${key}',${ei},event)"
        style="top:${topPx}px;height:${heightPx}px;background:${colors.bg};border-left:3px solid ${colors.border};color:${colors.text}">
        <div class="cal-tev-title">${ev.label}</div>
        ${heightPx > 36 ? `<div class="cal-tev-sub">${ev.start}${ev.end?' – '+ev.end:''} · ${ev.sub||''}</div>` : ''}
      </div>`;
    });
    bodyHtml += '</div></div>';

    container.innerHTML = hdrHtml + bodyHtml;
  }

  /* ── Override calSetView to render week/day views ── */
  function calSetView(v) {
    _calView = v;
    ['month','week','day'].forEach(x => {
      const b = document.getElementById('cal-vt-' + x);
      if (b) b.classList.toggle('active', x === v);
    });
    const mv = document.getElementById('cal-view-month');
    const wv = document.getElementById('cal-view-week');
    const dv = document.getElementById('cal-view-day');
    if (mv) mv.style.display = v === 'month' ? '' : 'none';
    if (wv) wv.style.display = v === 'week'  ? 'flex' : 'none';
    if (dv) dv.style.display = v === 'day'   ? 'flex' : 'none';
    if (v === 'month') renderCalGrid();
    if (v === 'week')  renderWeekView();
    if (v === 'day')   renderDayView();
  }

