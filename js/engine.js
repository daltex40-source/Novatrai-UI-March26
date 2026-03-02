/* ═══════════════════════════════════════════════════════════════
   PHASES 2-8: AI Intelligence Pack — JavaScript Engine
═══════════════════════════════════════════════════════════════ */

/* ── PHASE 2: Relationship Health Engine ──────────────────── */
(function(){
  'use strict';
  var REL_KEY = 'cf_relationship_scores';

  var DEMO_CLIENTS = [
    { name:'Legal Clear', industry:'Legal Services', type:'White Label Client', relationshipType:'client', website:'legalclear.co.za', status:true, dealValue:245000, activeDeals:2, openTasks:4, tier:'Gold', tags:['Legal','FICA'], activity:[3,5,2,4,6,1,3], contactsCount:4, daysSinceContact:2, responseRate:83, dealStage:'negotiation', overdueInvoices:1, activeProjects:3, createdDate:'2026-01-12' },
    { name:'Cape Digital Ltd', industry:'Digital Agency', type:'Digital agency', relationshipType:'client', website:'capedigital.co.za', status:true, dealValue:180000, activeDeals:3, openTasks:7, tier:'Silver', tags:['Tech','Digital'], activity:[5,3,6,4,2,5,7], contactsCount:7, daysSinceContact:5, responseRate:78, dealStage:'closed-won', overdueInvoices:0, activeProjects:4, createdDate:'2026-01-08' },
    { name:'Vertex Holdings', industry:'Investment Mgmt', type:'Investment firm', relationshipType:'client', website:'vertex.co.za', status:true, dealValue:520000, activeDeals:1, openTasks:2, tier:'Gold', tags:['Finance','Investment'], activity:[2,1,3,2,4,3,2], contactsCount:5, daysSinceContact:8, responseRate:70, dealStage:'proposal', overdueInvoices:0, activeProjects:2, createdDate:'2026-01-03' },
    { name:'Sunrise Finance', industry:'Micro-lending', type:'Micro-lending', relationshipType:'prospect', website:'sunrisefinance.co.za', status:false, dealValue:95000, activeDeals:1, openTasks:3, tier:'Bronze', tags:['Finance','FICA'], activity:[1,0,2,1,0,1,2], contactsCount:3, daysSinceContact:21, responseRate:45, dealStage:'proposal', overdueInvoices:2, activeProjects:1, createdDate:'2025-12-19' },
    { name:'Harvest Agri (Pty) Ltd', industry:'Agriculture', type:'Agricultural exports', relationshipType:'client', website:'harvestagri.co.za', status:true, dealValue:310000, activeDeals:2, openTasks:5, tier:'Silver', tags:['Agri','Export'], activity:[4,6,3,5,4,7,5], contactsCount:6, daysSinceContact:3, responseRate:88, dealStage:'negotiation', overdueInvoices:0, activeProjects:3, createdDate:'2025-12-11' },
    { name:'Summit Holdings', industry:'Conglomerate', type:'Holding company', relationshipType:'client', website:'summitholdings.co.za', status:true, dealValue:890000, activeDeals:4, openTasks:6, tier:'Gold', tags:['Corporate','Multi'], activity:[6,5,7,4,8,6,5], contactsCount:9, daysSinceContact:2, responseRate:83, dealStage:'negotiation', overdueInvoices:1, activeProjects:3, createdDate:'2025-11-28' },
    { name:'Axis Medical', industry:'Healthcare', type:'Medical supplies', relationshipType:'prospect', website:'axismedical.co.za', status:true, dealValue:156000, activeDeals:1, openTasks:8, tier:'Silver', tags:['Health','Supply'], activity:[2,3,1,2,3,1,2], contactsCount:4, daysSinceContact:21, responseRate:45, dealStage:'proposal', overdueInvoices:2, activeProjects:1, createdDate:'2025-11-15' },
    { name:'Global Corp', industry:'Consulting', type:'Management consulting', relationshipType:'client', website:'globalcorp.co.za', status:true, dealValue:420000, activeDeals:3, openTasks:2, tier:'Gold', tags:['Consulting','Strategy'], activity:[5,4,6,5,3,4,6], contactsCount:8, daysSinceContact:8, responseRate:70, dealStage:'closed-won', overdueInvoices:0, activeProjects:2, createdDate:'2025-10-22' },
    { name:'TechVentures', industry:'Technology', type:'Software development', relationshipType:'client', website:'techventures.co.za', status:true, dealValue:675000, activeDeals:5, openTasks:3, tier:'Gold', tags:['Tech','SaaS'], activity:[7,8,6,9,7,8,10], contactsCount:12, daysSinceContact:1, responseRate:92, dealStage:'closed-won', overdueInvoices:0, activeProjects:4, createdDate:'2025-10-05' },
    { name:'Blue Ocean Fund', industry:'Asset Mgmt', type:'Fund management', relationshipType:'prospect', website:'blueocean.co.za', status:true, dealValue:340000, activeDeals:2, openTasks:4, tier:'Silver', tags:['Finance','Fund'], activity:[3,2,4,3,2,3,4], contactsCount:5, daysSinceContact:14, responseRate:55, dealStage:'proposal', overdueInvoices:1, activeProjects:1, createdDate:'2025-09-18' },
    { name:'Novus Capital', industry:'Private Equity', type:'PE firm', relationshipType:'lead', website:'novuscapital.co.za', status:false, dealValue:50000, activeDeals:0, openTasks:1, tier:'Bronze', tags:['Finance','PE'], activity:[0,1,0,0,1,0,0], contactsCount:2, daysSinceContact:45, responseRate:20, dealStage:'lead', overdueInvoices:2, activeProjects:0, createdDate:'2025-08-30' },
    { name:'Protea Insurance', industry:'Insurance', type:'Short-term insurance', relationshipType:'supplier', website:'proteains.co.za', status:true, dealValue:198000, activeDeals:2, openTasks:5, tier:'Silver', tags:['Insurance','STI'], activity:[4,3,5,4,3,4,5], contactsCount:6, daysSinceContact:6, responseRate:72, dealStage:'negotiation', overdueInvoices:0, activeProjects:2, createdDate:'2025-08-12' }
  ];

  function calcScore(c) {
    var s = 50;
    if (c.daysSinceContact <= 3) s += 20;
    else if (c.daysSinceContact <= 7) s += 10;
    else if (c.daysSinceContact <= 14) s += 0;
    else if (c.daysSinceContact <= 30) s -= 10;
    else s -= 25;
    s += Math.round((c.responseRate - 50) * 0.3);
    if (c.dealStage === 'closed-won') s += 15;
    else if (c.dealStage === 'negotiation') s += 8;
    else if (c.dealStage === 'proposal') s += 3;
    s -= c.overdueInvoices * 8;
    s += Math.min(c.activeProjects * 4, 16);
    return Math.max(0, Math.min(100, s));
  }

  function getHealthLabel(score) {
    if (score >= 75) return { label:'Hot', cls:'hot' };
    if (score >= 55) return { label:'Warm', cls:'warm' };
    if (score >= 35) return { label:'Cool', cls:'cool' };
    return { label:'Cold', cls:'cold' };
  }

  function getTrend(c) {
    if (c.daysSinceContact <= 7 && c.responseRate > 60) return 'up';
    if (c.daysSinceContact > 21 || c.overdueInvoices > 1) return 'down';
    return 'flat';
  }

  function computeAll() {
    var results = DEMO_CLIENTS.map(function(c) {
      var score = calcScore(c);
      var h = getHealthLabel(score);
      return { name:c.name, score:score, label:h.label, cls:h.cls, trend:getTrend(c), daysSince:c.daysSinceContact, overdueInvoices:c.overdueInvoices };
    });
    results.sort(function(a,b) { return a.score - b.score; });
    try { localStorage.setItem(REL_KEY, JSON.stringify(results)); } catch(e) {}
    return results;
  }

  function updateCompanyRelScore() {
    var all = computeAll();
    var summit = all.find(function(r) { return r.name === 'Summit Holdings'; });
    if (!summit) return;
    var numEl = document.getElementById('rel-score-num');
    if (numEl) numEl.textContent = summit.score;
    var labelEl = document.querySelector('.rel-score-label');
    if (labelEl) {
      labelEl.textContent = summit.label + ' Lead';
      labelEl.className = 'rel-score-label ' + summit.cls;
    }
  }

  function populateRelRiskWidget() {
    var list = document.getElementById('rr-widget-list');
    if (!list) return;
    var all = computeAll();
    var atRisk = all.filter(function(r) { return r.score < 55; });
    if (atRisk.length === 0) {
      list.innerHTML = '<div style="padding:12px;font-size:11px;color:var(--muted);text-align:center">All relationships healthy!</div>';
      return;
    }
    list.innerHTML = atRisk.map(function(r) {
      var reason = r.daysSince > 14 ? 'No contact ' + r.daysSince + 'd' : r.overdueInvoices + ' overdue inv.';
      return '<div class="rr-widget-row"><div class="rr-widget-score ' + r.cls + '">' + r.score + '</div><div><div class="rr-widget-name">' + r.name + ' <span class="rel-trend-' + r.trend + '"></span></div><div class="rr-widget-reason">' + reason + '</div></div></div>';
    }).join('');
  }

  var _relOrigSwitch2 = window.switchScreen;
  window.switchScreen = function(name) {
    _relOrigSwitch2(name);
    if (name === 'company') setTimeout(updateCompanyRelScore, 100);
    if (name === 'dashboard') setTimeout(populateRelRiskWidget, 200);
  };

  document.addEventListener('DOMContentLoaded', function() {
    computeAll();
    setTimeout(updateCompanyRelScore, 400);
    setTimeout(populateRelRiskWidget, 500);
    if (typeof recordMemoryEvent === 'function') {
      var cold = computeAll().filter(function(r) { return r.cls === 'cold'; });
      if (cold.length > 0) {
        recordMemoryEvent('system', 'Relationships', cold.length + ' client(s) at risk: ' + cold.map(function(r){return r.name}).join(', '), 'dashboard');
      }
    }
  });

  window.getRelationshipScores = computeAll;
  window.COMPANIES_DATA = DEMO_CLIENTS;
  window.calcScore = calcScore;
  window.getHealthLabel = getHealthLabel;
})();

/* ── Companies List V2 — Rich Dynamic Rendering ────────────── */
(function(){
  'use strict';

  var AVATAR_COLORS = ['#4A8FFF','#7B5FFF','#3DD68C','#F0A843','#F07070','#FF6FB5','#00BCD4','#8BC34A'];
  function avatarColor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
  }
  function initials(name) {
    var p = name.split(/\s+/);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.substring(0,2).toUpperCase();
  }
  function relDate(d) {
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return d + 'd ago';
    if (d < 30) return Math.floor(d / 7) + 'w ago';
    return Math.floor(d / 30) + 'mo ago';
  }
  function dotCls(d) { return d <= 7 ? 'recent' : d <= 21 ? 'stale' : 'overdue'; }
  function fmtRand(v) {
    if (v >= 1000000) return 'R ' + (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return 'R ' + Math.round(v / 1000) + 'K';
    return 'R ' + v;
  }

  function sparkSvg(data) {
    var mx = Math.max.apply(null, data) || 1;
    var bars = '';
    for (var i = 0; i < data.length; i++) {
      var bh = Math.max(2, Math.round((data[i] / mx) * 18));
      bars += '<rect x="' + (i * 6) + '" y="' + (20 - bh) + '" width="4" height="' + bh + '" rx="1" fill="currentColor" opacity="0.5"/>';
    }
    return '<svg width="40" height="20" viewBox="0 0 40 20" style="color:var(--accent)">' + bars + '</svg>';
  }

  function healthRing(score) {
    var circ = 2 * Math.PI * 14;
    var off = circ - (score / 100) * circ;
    var h = window.getHealthLabel(score);
    var sc = h.cls === 'hot' ? '#3DD68C' : h.cls === 'warm' ? '#F0A843' : h.cls === 'cool' ? '#4A8FFF' : '#5A7080';
    return '<div class="comp-health">' +
      '<div class="comp-health-ring">' +
        '<svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="3"/>' +
        '<circle cx="17" cy="17" r="14" fill="none" stroke="' + sc + '" stroke-width="3" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" stroke-linecap="round"/></svg>' +
        '<div class="comp-health-num">' + score + '</div>' +
      '</div>' +
      '<span class="comp-health-label ' + h.cls + '">' + h.label + '</span></div>';
  }

  function miniRing(score) {
    var circ = 2 * Math.PI * 10;
    var off = circ - (score / 100) * circ;
    var h = window.getHealthLabel(score);
    var sc = h.cls === 'hot' ? '#3DD68C' : h.cls === 'warm' ? '#F0A843' : h.cls === 'cool' ? '#4A8FFF' : '#5A7080';
    return '<div class="comp-stat-ring">' +
      '<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="10" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="2.5"/>' +
      '<circle cx="14" cy="14" r="10" fill="none" stroke="' + sc + '" stroke-width="2.5" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" stroke-linecap="round"/></svg>' +
      '<div class="comp-stat-ring-num">' + score + '</div></div>';
  }

  var state = { view:'list', filters:{status:'all',health:'all',dealStage:'all',tier:'all',relationship:'all'}, search:'', sort:{field:'name',dir:'asc'}, page:1 };

  function getData() {
    return window.COMPANIES_DATA || [];
  }

  function getFiltered() {
    var list = getData().slice();
    if (state.search) {
      var q = state.search.toLowerCase();
      list = list.filter(function(c) {
        return c.name.toLowerCase().indexOf(q) !== -1 || c.industry.toLowerCase().indexOf(q) !== -1 || (c.website && c.website.toLowerCase().indexOf(q) !== -1);
      });
    }
    if (state.filters.status !== 'all') {
      var isAct = state.filters.status === 'active';
      list = list.filter(function(c) { return c.status === isAct; });
    }
    if (state.filters.health !== 'all') {
      list = list.filter(function(c) { return window.getHealthLabel(window.calcScore(c)).cls === state.filters.health; });
    }
    if (state.filters.dealStage !== 'all') {
      list = list.filter(function(c) { return c.dealStage === state.filters.dealStage; });
    }
    if (state.filters.tier !== 'all') {
      list = list.filter(function(c) { return c.tier.toLowerCase() === state.filters.tier; });
    }
    if (state.filters.relationship !== 'all') {
      list = list.filter(function(c) { return (c.relationshipType || 'contact') === state.filters.relationship; });
    }
    list.sort(function(a, b) {
      var av = a[state.sort.field], bv = b[state.sort.field];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase(); }
      var cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return state.sort.dir === 'desc' ? -cmp : cmp;
    });
    return list;
  }

  function renderRow(c) {
    var score = window.calcScore(c);
    var stageLabel = c.dealStage.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    var tierCls = c.tier.toLowerCase();
    var indTag = c.industry.split(/\s/)[0];
    return '<div class="comp-row-v2" onclick="switchScreen(\'company\')">' +
      '<div><div class="comp-avatar" style="background:' + avatarColor(c.name) + '">' + initials(c.name) + '</div></div>' +
      '<div class="comp-name-info"><span class="comp-name-v2">' + c.name + '</span><span class="comp-industry">' + c.industry + '</span></div>' +
      healthRing(score) +
      '<div><span class="comp-deal-pill ' + c.dealStage + '">' + stageLabel + '</span></div>' +
      '<div style="font-size:13px;font-weight:500;color:#E4EBF5">' + fmtRand(c.dealValue) + '</div>' +
      '<div style="font-size:13px;color:#8A9BB0;text-align:center">' + c.activeDeals + '</div>' +
      '<div><div class="comp-last-contact"><span class="comp-contact-dot ' + dotCls(c.daysSinceContact) + '"></span>' + relDate(c.daysSinceContact) + '</div></div>' +
      '<div style="font-size:13px;color:#8A9BB0;text-align:center">' + c.openTasks + '</div>' +
      '<div>' + sparkSvg(c.activity) + '</div>' +
      '<div class="comp-tags"><span class="comp-tag rel-' + (c.relationshipType || 'contact') + '">' + ((c.relationshipType || 'contact').charAt(0).toUpperCase() + (c.relationshipType || 'contact').slice(1)) + '</span><span class="comp-tag ' + tierCls + '">' + c.tier + '</span></div>' +
      '<div class="comp-actions">' +
        '<button class="comp-action-btn" title="Email" onclick="event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></button>' +
        '<button class="comp-action-btn" title="Call" onclick="event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></button>' +
        '<button class="comp-action-btn" title="Add note" onclick="event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>' +
      '</div></div>';
  }

  function renderCard(c) {
    var score = window.calcScore(c);
    var stageLabel = c.dealStage.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    var tierCls = c.tier.toLowerCase();
    return '<div class="comp-card" onclick="switchScreen(\'company\')">' +
      '<div class="comp-card-header">' +
        '<div class="comp-avatar" style="background:' + avatarColor(c.name) + '">' + initials(c.name) + '</div>' +
        '<div class="comp-name-info"><span class="comp-name-v2">' + c.name + '</span><span class="comp-industry">' + c.industry + '</span></div>' +
        healthRing(score) +
      '</div>' +
      '<div class="comp-card-meta">' +
        '<span class="comp-tag rel-' + (c.relationshipType || 'contact') + '">' + ((c.relationshipType || 'contact').charAt(0).toUpperCase() + (c.relationshipType || 'contact').slice(1)) + '</span>' +
        '<span class="comp-deal-pill ' + c.dealStage + '">' + stageLabel + '</span>' +
        '<span class="comp-tag ' + tierCls + '">' + c.tier + '</span>' +
      '</div>' +
      '<div class="comp-card-metrics">' +
        '<div class="comp-card-metric"><span class="comp-card-metric-val">' + fmtRand(c.dealValue) + '</span><span class="comp-card-metric-label">Revenue</span></div>' +
        '<div class="comp-card-metric"><span class="comp-card-metric-val">' + c.activeDeals + '</span><span class="comp-card-metric-label">Active Deals</span></div>' +
        '<div class="comp-card-metric"><span class="comp-card-metric-val">' + c.openTasks + '</span><span class="comp-card-metric-label">Open Tasks</span></div>' +
        '<div class="comp-card-metric"><span class="comp-card-metric-val">' + c.contactsCount + '</span><span class="comp-card-metric-label">Contacts</span></div>' +
      '</div>' +
      '<div class="comp-card-footer">' +
        '<div class="comp-last-contact"><span class="comp-contact-dot ' + dotCls(c.daysSinceContact) + '"></span>' + relDate(c.daysSinceContact) + '</div>' +
        '<div>' + sparkSvg(c.activity) + '</div>' +
      '</div></div>';
  }

  function renderStatsBar() {
    var data = getData();
    var total = data.length;
    var clients = data.filter(function(c) { return c.relationshipType === 'client'; }).length;
    var prospects = data.filter(function(c) { return c.relationshipType === 'prospect'; }).length;
    var leads = data.filter(function(c) { return c.relationshipType === 'lead'; }).length;
    var others = total - clients - prospects - leads;
    var bar = document.getElementById('comp-stats-bar');
    if (!bar) return;
    bar.innerHTML =
      '<div class="comp-stat-item"><span class="comp-stat-value">' + total + '</span><span class="comp-stat-label">Total</span></div>' +
      '<div class="comp-stat-divider"></div>' +
      '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#3DD68C">' + clients + '</span><span class="comp-stat-label">Clients</span></div>' +
      '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#4A8FFF">' + prospects + '</span><span class="comp-stat-label">Prospects</span></div>' +
      '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#F0A843">' + leads + '</span><span class="comp-stat-label">Leads</span></div>' +
      (others > 0 ? '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#B57BFF">' + others + '</span><span class="comp-stat-label">Other</span></div>' : '') +
      '<div class="comp-stat-divider"></div>' +
      '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#3DD68C">' + data.filter(function(c) { return c.status; }).length + '</span><span class="comp-stat-label">Active</span></div>';
  }

  window.renderCompanies = function() {
    var filtered = getFiltered();
    var perPage = parseInt((document.getElementById('comp-per-page') || {}).value) || 10;
    var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * perPage;
    var pageItems = filtered.slice(start, start + perPage);

    var body = document.getElementById('comp-rows-body');
    if (body) body.innerHTML = pageItems.map(renderRow).join('');

    var grid = document.getElementById('comp-grid-body');
    if (grid) grid.innerHTML = pageItems.map(renderCard).join('');

    var countEl = document.getElementById('comp-footer-count');
    if (countEl) countEl.textContent = filtered.length === 0 ? 'No companies found' : 'Showing ' + (start + 1) + '\u2013' + Math.min(start + perPage, filtered.length) + ' of ' + filtered.length + ' companies';
    var pageEl = document.getElementById('comp-page-info');
    if (pageEl) pageEl.textContent = 'Page ' + state.page + ' of ' + totalPages;

    renderStatsBar();
  };

  window.setCompView = function(v) {
    state.view = v;
    document.querySelectorAll('.comp-view-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.view === v); });
    var listC = document.getElementById('comp-list-container');
    var gridC = document.getElementById('comp-grid-container');
    if (listC) listC.style.display = v === 'list' ? '' : 'none';
    if (gridC) gridC.classList.toggle('active', v === 'grid');
  };

  window.compPagePrev = function() { if (state.page > 1) { state.page--; renderCompanies(); } };
  window.compPageNext = function() {
    var filtered = getFiltered();
    var perPage = parseInt((document.getElementById('comp-per-page') || {}).value) || 10;
    var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (state.page < totalPages) { state.page++; renderCompanies(); }
  };

  document.addEventListener('DOMContentLoaded', function() {
    var searchEl = document.getElementById('comp-search');
    if (searchEl) searchEl.addEventListener('input', function() { state.search = this.value; state.page = 1; renderCompanies(); });

    // Filter chip toggles — scoped to companies screen only
    document.querySelectorAll('#screen-companies .comp-filter-wrap .filter-chip').forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        var drop = this.parentElement.querySelector('.comp-filter-drop');
        // Close others
        document.querySelectorAll('.comp-filter-drop.open').forEach(function(d) { if (d !== drop) d.classList.remove('open'); });
        document.querySelectorAll('.ct-filter-drop.open').forEach(function(d) { d.classList.remove('open'); });
        if (drop) drop.classList.toggle('open');
        e.stopPropagation();
      });
    });
    document.querySelectorAll('#screen-companies .comp-filter-opt').forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        var drop = this.closest('.comp-filter-drop');
        var chip = this.closest('.comp-filter-wrap').querySelector('.filter-chip');
        var filterKey = chip.dataset.filter;
        drop.querySelectorAll('.comp-filter-opt').forEach(function(o) { o.classList.remove('selected'); });
        this.classList.add('selected');
        state.filters[filterKey] = this.dataset.val;
        state.page = 1;
        drop.classList.remove('open');
        // Update chip text
        var labels = {status:'Status',health:'Health',dealStage:'Deal Stage',tier:'Tier',relationship:'Relationship'};
        chip.firstChild.textContent = (this.dataset.val === 'all' ? labels[filterKey] : this.textContent) + ' ';
        renderCompanies();
        e.stopPropagation();
      });
    });
    document.addEventListener('click', function() {
      document.querySelectorAll('.comp-filter-drop.open').forEach(function(d) { d.classList.remove('open'); });
      document.querySelectorAll('.ct-filter-drop.open').forEach(function(d) { d.classList.remove('open'); });
    });

    // Sort headers
    document.querySelectorAll('.comp-cols-v2 .ct-col-sort').forEach(function(col) {
      col.style.cursor = 'pointer';
      col.addEventListener('click', function() {
        var field = this.dataset.sort;
        if (state.sort.field === field) state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
        else { state.sort.field = field; state.sort.dir = 'asc'; }
        renderCompanies();
      });
    });

    // Initial render
    renderCompanies();
  });
})();

/* ── PEOPLE MODULE: Data + IIFE ────────────────────────────── */
window.EMPLOYEES_DATA = [
  { id:'EMP-001', firstName:'James', lastName:'De Villiers', email:'james@novatrai.co.za', phone:'+27 82 345 6789', jobTitle:'Sales Manager', department:'Sales', manager:'Fritz Erasmus', startDate:'2024-03-15', status:'active', payType:'hybrid', baseSalary:45000, hourlyRate:null, commissionPlan:'Standard Sales 5%', payFrequency:'monthly', lastPaid:'2026-02-25', nextPay:'2026-03-25', bankName:'FNB', branchCode:'250655', accountNumber:'62845678901', accountHolder:'James De Villiers', idNumber:'9201015023088', nextOfKin:{name:'Sarah De Villiers',relation:'Spouse',phone:'+27 83 456 7890'}, notes:[], documents:[{name:'Employment Contract.pdf',size:'245 KB',date:'2024-03-15'},{name:'ID Copy.pdf',size:'1.2 MB',date:'2024-03-15'}], auditLog:[{event:'employee.created',date:'2024-03-15',by:'Fritz Erasmus',detail:'Employee record created'},{event:'pay_profile.updated',date:'2025-01-01',by:'Fritz Erasmus',detail:'Base salary adjusted from R40,000 to R45,000'},{event:'commission.earned',date:'2026-01-15',by:'System',detail:'Commission of R12,500 on Acme Corp deal'},{event:'document.uploaded',date:'2024-03-15',by:'HR System',detail:'Employment contract uploaded'}] },
  { id:'EMP-002', firstName:'Naledi', lastName:'Molefe', email:'naledi@novatrai.co.za', phone:'+27 71 234 5678', jobTitle:'Operations Lead', department:'Operations', manager:'Fritz Erasmus', startDate:'2023-06-01', status:'active', payType:'salary', baseSalary:52000, hourlyRate:null, commissionPlan:null, payFrequency:'monthly', lastPaid:'2026-02-25', nextPay:'2026-03-25', bankName:'Standard Bank', branchCode:'051001', accountNumber:'10234567890', accountHolder:'Naledi Molefe', idNumber:'9505210045082', nextOfKin:{name:'Thabo Molefe',relation:'Brother',phone:'+27 72 345 6789'}, notes:[], documents:[{name:'Employment Contract.pdf',size:'230 KB',date:'2023-06-01'}], auditLog:[{event:'employee.created',date:'2023-06-01',by:'Fritz Erasmus',detail:'Employee record created'},{event:'role.changed',date:'2024-11-01',by:'Fritz Erasmus',detail:'Promoted from Operations Coordinator to Operations Lead'}] },
  { id:'EMP-003', firstName:'Pieter', lastName:'Van Wyk', email:'pieter@novatrai.co.za', phone:'+27 82 987 6543', jobTitle:'Finance Manager', department:'Finance', manager:'Fritz Erasmus', startDate:'2022-01-10', status:'active', payType:'salary', baseSalary:58000, hourlyRate:null, commissionPlan:null, payFrequency:'monthly', lastPaid:'2026-02-25', nextPay:'2026-03-25', bankName:'Absa', branchCode:'632005', accountNumber:'40567891234', accountHolder:'Pieter Van Wyk', idNumber:'8803225012087', nextOfKin:{name:'Marelize Van Wyk',relation:'Spouse',phone:'+27 83 876 5432'}, notes:[], documents:[{name:'Employment Contract.pdf',size:'220 KB',date:'2022-01-10'},{name:'Tax Certificate 2025.pdf',size:'89 KB',date:'2025-06-30'}], auditLog:[{event:'employee.created',date:'2022-01-10',by:'HR System',detail:'Employee record created'},{event:'pay_profile.updated',date:'2024-01-01',by:'Fritz Erasmus',detail:'Annual increase from R53,000 to R58,000'}] },
  { id:'EMP-004', firstName:'Ayanda', lastName:'Nkosi', email:'ayanda@novatrai.co.za', phone:'+27 73 456 7890', jobTitle:'Support Agent', department:'Support', manager:'Naledi Molefe', startDate:'2024-08-01', status:'active', payType:'hourly', baseSalary:null, hourlyRate:185, commissionPlan:null, payFrequency:'biweekly', lastPaid:'2026-02-14', nextPay:'2026-02-28', bankName:'Capitec', branchCode:'470010', accountNumber:'12345678901', accountHolder:'Ayanda Nkosi', idNumber:'0001015023083', nextOfKin:{name:'Nomsa Nkosi',relation:'Mother',phone:'+27 71 567 8901'}, notes:[], documents:[{name:'Employment Contract.pdf',size:'210 KB',date:'2024-08-01'}], auditLog:[{event:'employee.created',date:'2024-08-01',by:'Naledi Molefe',detail:'Employee record created'}] },
  { id:'EMP-005', firstName:'Lizel', lastName:'Botha', email:'lizel@novatrai.co.za', phone:'+27 82 111 2233', jobTitle:'Marketing Specialist', department:'Marketing', manager:'Fritz Erasmus', startDate:'2024-01-15', status:'active', payType:'salary', baseSalary:38000, hourlyRate:null, commissionPlan:null, payFrequency:'monthly', lastPaid:'2026-02-25', nextPay:'2026-03-25', bankName:'Nedbank', branchCode:'198765', accountNumber:'10987654321', accountHolder:'Lizel Botha', idNumber:'9607150034085', nextOfKin:{name:'Johan Botha',relation:'Father',phone:'+27 82 222 3344'}, notes:[], documents:[{name:'Employment Contract.pdf',size:'215 KB',date:'2024-01-15'}], auditLog:[{event:'employee.created',date:'2024-01-15',by:'Fritz Erasmus',detail:'Employee record created'}] },
  { id:'EMP-006', firstName:'Thandi', lastName:'Mthembu', email:'thandi@novatrai.co.za', phone:'+27 71 999 8877', jobTitle:'Sales Executive', department:'Sales', manager:'James De Villiers', startDate:'2024-06-01', status:'active', payType:'commission', baseSalary:null, hourlyRate:null, commissionPlan:'Standard Sales 5%', payFrequency:'monthly', lastPaid:'2026-02-25', nextPay:'2026-03-25', bankName:'FNB', branchCode:'250655', accountNumber:'62111222333', accountHolder:'Thandi Mthembu', idNumber:'9812050067081', nextOfKin:{name:'Sipho Mthembu',relation:'Spouse',phone:'+27 72 888 7766'}, notes:[], documents:[{name:'Employment Contract.pdf',size:'225 KB',date:'2024-06-01'}], auditLog:[{event:'employee.created',date:'2024-06-01',by:'James De Villiers',detail:'Employee record created'},{event:'commission.earned',date:'2026-02-10',by:'System',detail:'Commission of R8,200 on BlueSky Solutions deal'}] },
  { id:'EMP-007', firstName:'Ruan', lastName:'Pretorius', email:'ruan@novatrai.co.za', phone:'+27 82 555 4433', jobTitle:'IT Support Technician', department:'Support', manager:'Naledi Molefe', startDate:'2025-02-01', status:'suspended', payType:'hourly', baseSalary:null, hourlyRate:210, commissionPlan:null, payFrequency:'biweekly', lastPaid:'2026-01-31', nextPay:null, bankName:'Standard Bank', branchCode:'051001', accountNumber:'10555666777', accountHolder:'Ruan Pretorius', idNumber:'9409125044086', nextOfKin:{name:'Anna Pretorius',relation:'Mother',phone:'+27 83 444 3322'}, notes:[{text:'Suspended pending investigation',date:'2026-02-01',by:'Fritz Erasmus'}], documents:[{name:'Employment Contract.pdf',size:'218 KB',date:'2025-02-01'},{name:'Suspension Letter.pdf',size:'95 KB',date:'2026-02-01'}], auditLog:[{event:'employee.created',date:'2025-02-01',by:'Naledi Molefe',detail:'Employee record created'},{event:'status.changed',date:'2026-02-01',by:'Fritz Erasmus',detail:'Status changed from Active to Suspended — pending investigation'}] },
  { id:'EMP-008', firstName:'Zinhle', lastName:'Dlamini', email:'zinhle@novatrai.co.za', phone:'+27 73 777 6655', jobTitle:'Account Manager', department:'Sales', manager:'James De Villiers', startDate:'2023-09-15', status:'active', payType:'hybrid', baseSalary:35000, hourlyRate:null, commissionPlan:'Account Growth 3%', payFrequency:'monthly', lastPaid:'2026-02-25', nextPay:'2026-03-25', bankName:'Absa', branchCode:'632005', accountNumber:'40888999000', accountHolder:'Zinhle Dlamini', idNumber:'9703180029084', nextOfKin:{name:'Mandla Dlamini',relation:'Father',phone:'+27 71 666 5544'}, notes:[], documents:[{name:'Employment Contract.pdf',size:'222 KB',date:'2023-09-15'}], auditLog:[{event:'employee.created',date:'2023-09-15',by:'James De Villiers',detail:'Employee record created'},{event:'pay_profile.updated',date:'2025-04-01',by:'Fritz Erasmus',detail:'Commission plan changed to Account Growth 3%'}] },
  { id:'EMP-009', firstName:'Marco', lastName:'Ferreira', email:'marco@novatrai.co.za', phone:'+27 82 333 2211', jobTitle:'Operations Coordinator', department:'Operations', manager:'Naledi Molefe', startDate:'2024-11-01', status:'active', payType:'salary', baseSalary:32000, hourlyRate:null, commissionPlan:null, payFrequency:'monthly', lastPaid:'2026-02-25', nextPay:'2026-03-25', bankName:'Capitec', branchCode:'470010', accountNumber:'12999888777', accountHolder:'Marco Ferreira', idNumber:'0102035011089', nextOfKin:{name:'Ana Ferreira',relation:'Spouse',phone:'+27 83 222 1100'}, notes:[], documents:[{name:'Employment Contract.pdf',size:'208 KB',date:'2024-11-01'}], auditLog:[{event:'employee.created',date:'2024-11-01',by:'Naledi Molefe',detail:'Employee record created'}] },
  { id:'EMP-010', firstName:'Karen', lastName:'Smith', email:'karen@novatrai.co.za', phone:'+27 71 100 2200', jobTitle:'Junior Accountant', department:'Finance', manager:'Pieter Van Wyk', startDate:'2023-03-01', status:'terminated', payType:'commission', baseSalary:null, hourlyRate:null, commissionPlan:'Finance Referral 2%', payFrequency:'monthly', lastPaid:'2025-11-25', nextPay:null, bankName:'FNB', branchCode:'250655', accountNumber:'62333444555', accountHolder:'Karen Smith', idNumber:'9508100033082', nextOfKin:{name:'David Smith',relation:'Brother',phone:'+27 82 100 2233'}, notes:[{text:'Contract terminated — relocation',date:'2025-12-01',by:'Pieter Van Wyk'}], documents:[{name:'Employment Contract.pdf',size:'200 KB',date:'2023-03-01'},{name:'Termination Letter.pdf',size:'102 KB',date:'2025-12-01'}], auditLog:[{event:'employee.created',date:'2023-03-01',by:'Pieter Van Wyk',detail:'Employee record created'},{event:'status.changed',date:'2025-12-01',by:'Pieter Van Wyk',detail:'Status changed from Active to Terminated — employee relocated'}] }
];

/* Initialize payroll extension properties for all employees */
(window.EMPLOYEES_DATA||[]).forEach(function(e){
  if(!e.advances) e.advances=[];
  if(!e.bonuses) e.bonuses=[];
  if(!e.salaryHistory) e.salaryHistory=[];
  if(!e.payslipDelivery) e.payslipDelivery={email:true,whatsapp:false,print:false};
  if(!e.bankHistory) e.bankHistory=[];
  if(!e.payslipHistory) e.payslipHistory=[];
  if(!e.notes) e.notes=[];
  if(!e.headshot) e.headshot=null;
  if(!e.disciplinary) e.disciplinary={records:[],currentCase:null};
});

// Seed sample notes for EMP-001
(function seedEmployeeNotes(){
  var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id==='EMP-001';});
  if(!emp||emp.notes.length>0) return;
  emp.notes=[
    {id:'NOTE-1001',category:'arrangement',priority:'important',text:'James works from home on Wednesdays and Fridays per agreement with his manager. This arrangement was approved as part of his retention package in Q3 2025.',private:false,createdAt:new Date('2025-07-15T09:30:00').getTime(),createdBy:'Fritz Erasmus'},
    {id:'NOTE-1002',category:'health',priority:'urgent',text:'Severe peanut allergy — ensure all team events and office catering are peanut-free. EpiPen kept in his desk drawer (left side). Emergency contact: Sarah De Villiers.',private:true,createdAt:new Date('2025-04-02T14:15:00').getTime(),createdBy:'HR Admin'},
    {id:'NOTE-1003',category:'performance',priority:'normal',text:'Exceeded Q4 2025 sales targets by 18%. Nominated for Employee of the Quarter. Consider for senior role in next promotion cycle.',private:false,createdAt:new Date('2026-01-10T11:00:00').getTime(),createdBy:'Fritz Erasmus'},
    {id:'NOTE-1004',category:'general',priority:'normal',text:'Completed Advanced Sales Leadership course (external). Certificate on file in Documents tab.',private:false,createdAt:new Date('2025-09-20T16:45:00').getTime(),createdBy:'HR Admin'}
  ];
})();

// ── Seed Disciplinary Demo Data for EMP-007 (Ruan Pretorius) ──
(function seedDiscData(){
  var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id==='EMP-007';});
  if(!emp||!emp.disciplinary||emp.disciplinary.records.length>0) return;
  emp.disciplinary.records=[
    {id:'DISC-001',type:'verbal',status:'expired',offence:'Late arrivals — 5 instances in October 2025',offenceCategory:'misconduct',dateIssued:new Date('2025-10-20').getTime(),expiryDate:new Date('2026-01-20').getTime(),issuedBy:'Naledi Molefe',witnessedBy:'Fritz Erasmus',employeeResponse:'Acknowledged. Apologised and committed to improvement.',documentGenerated:true,notes:'First offence, verbal warning appropriate per LRA Schedule 8.'},
    {id:'DISC-002',type:'written',status:'active',offence:'Unauthorized access to client database without permission on 15 Jan 2026',offenceCategory:'serious_misconduct',dateIssued:new Date('2026-01-18').getTime(),expiryDate:new Date('2026-07-18').getTime(),issuedBy:'Fritz Erasmus',witnessedBy:'James De Villiers',employeeResponse:'Denied intent, claimed he was troubleshooting a support ticket.',documentGenerated:true,notes:'Second offence. Escalated to written warning. Employee counselled on data access policies.'},
    {id:'DISC-003',type:'hearing',status:'in-progress',offence:'Continued unauthorized data access during suspension period — VPN logs show access on 5 Feb 2026',offenceCategory:'gross_misconduct',dateIssued:new Date('2026-02-10').getTime(),expiryDate:null,issuedBy:'Fritz Erasmus',witnessedBy:null,employeeResponse:null,documentGenerated:false,notes:'Third offence during active suspension. Disciplinary hearing required per LRA Schedule 8 Item 4.'}
  ];
  emp.disciplinary.currentCase=emp.disciplinary.records[2];
  emp.disciplinary.aiChatHistory=[
    {role:'bot',text:'I can see Ruan Pretorius (EMP-007) has a serious disciplinary history. He received a verbal warning in October 2025 for repeated late arrivals (now expired), followed by a written warning in January 2026 for unauthorized database access. He is currently suspended and a new incident of unauthorized VPN access has been reported.\n\nUnder South African Labour Relations Act (LRA) Schedule 8, this pattern of escalating misconduct — especially the continued unauthorized access during suspension — would typically warrant a formal disciplinary hearing.\n\nHow would you like to proceed?'},
    {role:'user',text:'What are the steps for a disciplinary hearing in SA?'},
    {role:'bot',text:'Under the LRA Schedule 8 (Code of Good Practice: Dismissal), a disciplinary hearing requires:\n\n1. Written notice to the employee (at least 48 hours before hearing)\n2. Clear description of charges and evidence\n3. Employee\'s right to representation (union rep or colleague)\n4. Fair hearing with impartial chairperson\n5. Opportunity for employee to state their case\n6. Written outcome with reasons\n7. Right to appeal\n\nGiven Ruan\'s progressive discipline history (verbal → written → now potential hearing), this follows the correct escalation path. The unauthorized access during suspension is particularly serious as it shows disregard for the disciplinary process itself.\n\nShall I help you prepare the hearing notice?'}
  ];
})();

// ── System Users ──
window.SYSTEM_USERS = [
  {id:'USR-001',empId:'EMP-001',firstName:'James',lastName:'De Villiers',email:'james@novatrai.co.za',role:'admin',status:'active',
   invitedAt:new Date('2024-03-10').getTime(),joinedAt:new Date('2024-03-10').getTime(),lastActive:new Date('2026-02-27T08:45:00').getTime(),lastLogin:new Date('2026-02-27T08:30:00').getTime(),loginCount:42,
   activityLog:[
     {action:'login',date:new Date('2026-02-27T08:30:00').getTime(),detail:'Logged in from Chrome / Windows'},
     {action:'page.view',date:new Date('2026-02-27T08:35:00').getTime(),detail:'Viewed Pay Runs'},
     {action:'payslip.issued',date:new Date('2026-02-25T14:20:00').getTime(),detail:'Issued February 2026 payslips'},
     {action:'employee.updated',date:new Date('2026-02-20T11:10:00').getTime(),detail:'Updated bank details for Naledi Mokoena'},
     {action:'login',date:new Date('2026-02-20T09:00:00').getTime(),detail:'Logged in from Chrome / Windows'}
   ]},
  {id:'USR-002',empId:'EMP-002',firstName:'Naledi',lastName:'Mokoena',email:'naledi@novatrai.co.za',role:'sales-rep',status:'active',
   invitedAt:new Date('2024-06-01').getTime(),joinedAt:new Date('2024-06-02').getTime(),lastActive:new Date('2026-02-26T16:30:00').getTime(),lastLogin:new Date('2026-02-26T09:15:00').getTime(),loginCount:28,
   activityLog:[
     {action:'login',date:new Date('2026-02-26T09:15:00').getTime(),detail:'Logged in from Safari / macOS'},
     {action:'page.view',date:new Date('2026-02-26T09:20:00').getTime(),detail:'Viewed Contacts'},
     {action:'deal.created',date:new Date('2026-02-25T15:00:00').getTime(),detail:'Created deal: Acme Corp Renewal'},
     {action:'login',date:new Date('2026-02-25T08:45:00').getTime(),detail:'Logged in from Safari / macOS'}
   ]},
  {id:'USR-003',empId:null,firstName:'Fritz',lastName:'Erasmus',email:'fritz@novatrai.co.za',role:'owner',status:'active',
   invitedAt:new Date('2024-01-01').getTime(),joinedAt:new Date('2024-01-01').getTime(),lastActive:new Date('2026-02-27T10:00:00').getTime(),lastLogin:new Date('2026-02-27T07:50:00').getTime(),loginCount:156,
   activityLog:[
     {action:'login',date:new Date('2026-02-27T07:50:00').getTime(),detail:'Logged in from Chrome / macOS'},
     {action:'settings.changed',date:new Date('2026-02-26T17:00:00').getTime(),detail:'Updated workspace branding'},
     {action:'report.exported',date:new Date('2026-02-26T16:45:00').getTime(),detail:'Exported monthly revenue report'},
     {action:'user.invited',date:new Date('2026-02-20T10:00:00').getTime(),detail:'Invited Lindiwe Nkosi'},
     {action:'page.view',date:new Date('2026-02-27T08:00:00').getTime(),detail:'Viewed Dashboard'},
     {action:'login',date:new Date('2026-02-26T08:30:00').getTime(),detail:'Logged in from Chrome / macOS'}
   ]},
  {id:'USR-004',empId:'EMP-003',firstName:'Pieter',lastName:'van der Merwe',email:'pieter@novatrai.co.za',role:'support',status:'active',
   invitedAt:new Date('2024-08-15').getTime(),joinedAt:new Date('2024-08-16').getTime(),lastActive:new Date('2026-02-26T14:20:00').getTime(),lastLogin:new Date('2026-02-26T08:00:00').getTime(),loginCount:15,
   activityLog:[
     {action:'login',date:new Date('2026-02-26T08:00:00').getTime(),detail:'Logged in from Firefox / Linux'},
     {action:'ticket.resolved',date:new Date('2026-02-26T14:20:00').getTime(),detail:'Resolved ticket #4521'},
     {action:'login',date:new Date('2026-02-24T08:15:00').getTime(),detail:'Logged in from Firefox / Linux'}
   ]},
  {id:'USR-005',empId:null,firstName:'Sandra',lastName:'Joubert',email:'sandra@joubert-accounting.co.za',role:'viewer',status:'active',
   invitedAt:new Date('2025-01-10').getTime(),joinedAt:new Date('2025-01-12').getTime(),lastActive:new Date('2026-02-24T11:30:00').getTime(),lastLogin:new Date('2026-02-24T10:00:00').getTime(),loginCount:8,
   activityLog:[
     {action:'login',date:new Date('2026-02-24T10:00:00').getTime(),detail:'Logged in from Chrome / Windows'},
     {action:'page.view',date:new Date('2026-02-24T10:05:00').getTime(),detail:'Viewed Financials'},
     {action:'report.viewed',date:new Date('2026-02-24T11:30:00').getTime(),detail:'Viewed P&L Report'}
   ]},
  {id:'USR-006',empId:'EMP-006',firstName:'Lindiwe',lastName:'Nkosi',email:'lindiwe@novatrai.co.za',role:'sales-rep',status:'invited',
   invitedAt:new Date('2026-02-20').getTime(),joinedAt:null,lastActive:null,lastLogin:null,loginCount:0,
   activityLog:[]},
  {id:'USR-007',empId:'EMP-010',firstName:'Thabo',lastName:'Molefe',email:'thabo@novatrai.co.za',role:'viewer',status:'suspended',
   invitedAt:new Date('2024-09-01').getTime(),joinedAt:new Date('2024-09-02').getTime(),lastActive:new Date('2025-12-15T09:00:00').getTime(),lastLogin:new Date('2025-12-15T09:00:00').getTime(),loginCount:12,
   activityLog:[
     {action:'login',date:new Date('2025-12-15T09:00:00').getTime(),detail:'Logged in from Chrome / Android'},
     {action:'status.suspended',date:new Date('2026-01-05').getTime(),detail:'Account suspended by Fritz Erasmus — Reason: Employment ended'}
   ]}
];

/* ── TASKS DATA ── */
window.TASKS_DATA = [
  {id:'TSK-001',title:'Chase Stephanus van Wyk for certified ID copy',description:'',company:'Legal Clear',contactName:'Stephanus van Wyk',priority:'high',status:'open',assignedTo:'USR-001',assignedBy:'USR-003',dueDate:new Date('2026-02-10').getTime(),createdAt:new Date('2026-02-03').getTime(),completedAt:null,
   notes:[{text:'Spoke to Stephanus, he said he\'ll send by Friday.',by:'USR-001',at:new Date('2026-02-07').getTime()}],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-03').getTime(),detail:'Task created'},{action:'note',by:'USR-001',at:new Date('2026-02-07').getTime(),detail:'Added a note'}]},
  {id:'TSK-002',title:'Complete FICA verification review — client response pending',description:'Need to finalize FICA docs before compliance audit.',company:'Legal Clear',contactName:'',priority:'high',status:'open',assignedTo:'USR-002',assignedBy:'USR-003',dueDate:new Date('2026-02-14').getTime(),createdAt:new Date('2026-02-05').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-05').getTime(),detail:'Task created'}]},
  {id:'TSK-003',title:'Submit compliance sign-off to FCA before deadline',description:'',company:'Legal Clear',contactName:'',priority:'high',status:'open',assignedTo:'USR-004',assignedBy:'USR-003',dueDate:new Date('2026-02-20').getTime(),createdAt:new Date('2026-02-08').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-08').getTime(),detail:'Task created'},{action:'reassigned',by:'USR-003',at:new Date('2026-02-12').getTime(),from:'USR-002',to:'USR-004',detail:'Reassigned from Naledi to Pieter'}]},
  {id:'TSK-004',title:'Send updated SLA agreement to Legal Clear for review',description:'',company:'Legal Clear',contactName:'James Botha',priority:'medium',status:'open',assignedTo:'USR-001',assignedBy:'USR-003',dueDate:new Date('2026-02-27').getTime(),createdAt:new Date('2026-02-15').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-15').getTime(),detail:'Task created'}]},
  {id:'TSK-005',title:'Review GlobalCorp MSA redline and prepare response',description:'',company:'Global Corp',contactName:'',priority:'medium',status:'open',assignedTo:'USR-001',assignedBy:'USR-003',dueDate:new Date('2026-02-27').getTime(),createdAt:new Date('2026-02-16').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-16').getTime(),detail:'Task created'}]},
  {id:'TSK-006',title:'Prepare AML risk assessment report for Q1 2026',description:'',company:'Legal Clear',contactName:'',priority:'medium',status:'open',assignedTo:'USR-002',assignedBy:'USR-003',dueDate:new Date('2026-02-26').getTime(),createdAt:new Date('2026-02-10').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-10').getTime(),detail:'Task created'}]},
  {id:'TSK-007',title:'Upload 2026 Articles of Incorporation to workspace',description:'',company:'Legal Clear',contactName:'',priority:'medium',status:'open',assignedTo:'USR-004',assignedBy:'USR-003',dueDate:new Date('2026-02-28').getTime(),createdAt:new Date('2026-02-12').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-12').getTime(),detail:'Task created'}]},
  {id:'TSK-008',title:'Confirm Fin Services onboarding checklist with compliance team',description:'',company:'Fin Services',contactName:'',priority:'medium',status:'open',assignedTo:'USR-002',assignedBy:'USR-003',dueDate:new Date('2026-03-03').getTime(),createdAt:new Date('2026-02-14').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-14').getTime(),detail:'Task created'}]},
  {id:'TSK-009',title:'Archive resolved compliance tickets from Q4 2025',description:'',company:'Legal Clear',contactName:'',priority:'low',status:'open',assignedTo:'USR-001',assignedBy:'USR-003',dueDate:null,createdAt:new Date('2026-02-01').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-01').getTime(),detail:'Task created'}]},
  {id:'TSK-010',title:'Update contact details for Stephanus van Wyk',description:'',company:'Legal Clear',contactName:'Stephanus van Wyk',priority:'low',status:'open',assignedTo:'USR-002',assignedBy:'USR-003',dueDate:null,createdAt:new Date('2026-02-02').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-02').getTime(),detail:'Task created'}]},
  {id:'TSK-011',title:'Review and document form submission pipeline',description:'',company:'Legal Clear',contactName:'',priority:'low',status:'open',assignedTo:'USR-004',assignedBy:'USR-003',dueDate:null,createdAt:new Date('2026-02-04').getTime(),completedAt:null,notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-04').getTime(),detail:'Task created'}]},
  {id:'TSK-012',title:'Publish SLA Client Contact Submission form',description:'',company:'Legal Clear',contactName:'',priority:'medium',status:'completed',assignedTo:'USR-001',assignedBy:'USR-003',dueDate:new Date('2026-02-21').getTime(),createdAt:new Date('2026-02-10').getTime(),completedAt:new Date('2026-02-21').getTime(),notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-10').getTime(),detail:'Task created'},{action:'completed',by:'USR-001',at:new Date('2026-02-21').getTime(),detail:'Marked as completed'}]},
  {id:'TSK-013',title:'Add Legal Clear to Companies workspace',description:'',company:'Legal Clear',contactName:'',priority:'medium',status:'completed',assignedTo:'USR-004',assignedBy:'USR-003',dueDate:new Date('2026-02-19').getTime(),createdAt:new Date('2026-02-08').getTime(),completedAt:new Date('2026-02-19').getTime(),notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-08').getTime(),detail:'Task created'},{action:'completed',by:'USR-004',at:new Date('2026-02-19').getTime(),detail:'Marked as completed'}]},
  {id:'TSK-014',title:'Onboard Nomvula Mahlangu as compliance contact',description:'',company:'Legal Clear',contactName:'Nomvula Mahlangu',priority:'medium',status:'completed',assignedTo:'USR-002',assignedBy:'USR-003',dueDate:new Date('2026-02-17').getTime(),createdAt:new Date('2026-02-06').getTime(),completedAt:new Date('2026-02-17').getTime(),notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-06').getTime(),detail:'Task created'},{action:'completed',by:'USR-002',at:new Date('2026-02-17').getTime(),detail:'Marked as completed'}]},
  {id:'TSK-015',title:'Schedule quarterly review meeting with Global Corp leadership',description:'',company:'Global Corp',contactName:'',priority:'medium',status:'completed',assignedTo:'USR-001',assignedBy:'USR-003',dueDate:new Date('2026-02-15').getTime(),createdAt:new Date('2026-02-01').getTime(),completedAt:new Date('2026-02-15').getTime(),notes:[{text:'Meeting confirmed for Feb 15 at 10am.',by:'USR-001',at:new Date('2026-02-14').getTime()}],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-01').getTime(),detail:'Task created'},{action:'completed',by:'USR-001',at:new Date('2026-02-15').getTime(),detail:'Marked as completed'}]},
  {id:'TSK-016',title:'Send client satisfaction survey to Fin Services contacts',description:'',company:'Fin Services',contactName:'',priority:'low',status:'completed',assignedTo:'USR-002',assignedBy:'USR-003',dueDate:new Date('2026-02-18').getTime(),createdAt:new Date('2026-02-05').getTime(),completedAt:new Date('2026-02-18').getTime(),notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-05').getTime(),detail:'Task created'},{action:'completed',by:'USR-002',at:new Date('2026-02-18').getTime(),detail:'Marked as completed'}]},
  {id:'TSK-017',title:'Update CRM records for all Legal Clear contacts',description:'',company:'Legal Clear',contactName:'',priority:'low',status:'completed',assignedTo:'USR-004',assignedBy:'USR-003',dueDate:new Date('2026-02-20').getTime(),createdAt:new Date('2026-02-07').getTime(),completedAt:new Date('2026-02-20').getTime(),notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-07').getTime(),detail:'Task created'},{action:'completed',by:'USR-004',at:new Date('2026-02-20').getTime(),detail:'Marked as completed'}]},
  {id:'TSK-018',title:'File tax compliance certificates for Q4 2025',description:'',company:'Legal Clear',contactName:'',priority:'high',status:'completed',assignedTo:'USR-001',assignedBy:'USR-003',dueDate:new Date('2026-02-12').getTime(),createdAt:new Date('2026-02-01').getTime(),completedAt:new Date('2026-02-12').getTime(),notes:[],
   history:[{action:'created',by:'USR-003',at:new Date('2026-02-01').getTime(),detail:'Task created'},{action:'completed',by:'USR-001',at:new Date('2026-02-12').getTime(),detail:'Marked as completed'}]}
];
window._taskIdCounter = 19;

window.PAY_STRUCTURES_DATA = [
  { id:'PS-001', name:'Standard Salary', type:'salary', baseSalary:35000, hourlyRate:null, commissionPlan:null, frequency:'monthly', employees:['EMP-002','EMP-003','EMP-005','EMP-009'] },
  { id:'PS-002', name:'Standard Sales Package', type:'hybrid', baseSalary:35000, hourlyRate:null, commissionPlan:'Standard Sales 5%', frequency:'monthly', employees:['EMP-001','EMP-008'] },
  { id:'PS-003', name:'Hourly Support', type:'hourly', baseSalary:null, hourlyRate:185, commissionPlan:null, frequency:'biweekly', employees:['EMP-004','EMP-007'] },
  { id:'PS-004', name:'Commission Only — Sales', type:'commission', baseSalary:null, hourlyRate:null, commissionPlan:'Standard Sales 5%', frequency:'monthly', employees:['EMP-006'] },
  { id:'PS-005', name:'Commission Only — Finance', type:'commission', baseSalary:null, hourlyRate:null, commissionPlan:'Finance Referral 2%', frequency:'monthly', employees:['EMP-010'] }
];

/* ── People List + Profile + Pay Structures IIFE ──────────── */
(function(){
  'use strict';
  var AVATAR_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];
  function avatarColor(n){ var h=0; for(var i=0;i<n.length;i++) h=n.charCodeAt(i)+((h<<5)-h); return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length]; }
  function empInitials(f,l){ return (f.charAt(0)+l.charAt(0)).toUpperCase(); }
  function maskAccount(num){ if(!num) return '—'; return '••••••'+num.slice(-4); }
  function formatSalary(amt){ if(!amt) return '—'; return 'R '+amt.toLocaleString('en-ZA'); }
  function formatDate(ds){ if(!ds) return '—'; var d=new Date(ds); var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear(); }
  function payTypeLabel(t){ return {salary:'Salary',hourly:'Hourly',commission:'Commission',hybrid:'Hybrid'}[t]||t; }
  function payTypeCls(t){ return {salary:'salary',hourly:'hourly',commission:'commission',hybrid:'hybrid'}[t]||'salary'; }
  function statusLabel(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  var state = { filters:{status:'all',department:'all',payType:'all'}, search:'', sort:{field:'lastName',dir:'asc'}, page:1, perPage:10, currentEmployee:null };

  function getData(){ return window.EMPLOYEES_DATA || []; }

  function getFiltered(){
    var data = getData().slice();
    if(state.search){
      var q=state.search.toLowerCase();
      data=data.filter(function(e){ return (e.firstName+' '+e.lastName+' '+e.email+' '+e.jobTitle+' '+e.department+' '+e.id).toLowerCase().indexOf(q)!==-1; });
    }
    if(state.filters.status!=='all') data=data.filter(function(e){ return e.status===state.filters.status; });
    if(state.filters.department!=='all') data=data.filter(function(e){ return e.department===state.filters.department; });
    if(state.filters.payType!=='all') data=data.filter(function(e){ return e.payType===state.filters.payType; });
    data.sort(function(a,b){
      var av=a[state.sort.field], bv=b[state.sort.field];
      if(av==null) av=''; if(bv==null) bv='';
      if(typeof av==='string') av=av.toLowerCase();
      if(typeof bv==='string') bv=bv.toLowerCase();
      if(av<bv) return state.sort.dir==='asc'?-1:1;
      if(av>bv) return state.sort.dir==='asc'?1:-1;
      return 0;
    });
    return data;
  }

  function renderRow(e){
    var ini = empInitials(e.firstName,e.lastName);
    var col = avatarColor(e.firstName+e.lastName);
    return '<div class="ppl-row" onclick="openEmployee(\''+e.id+'\')">'+
      '<div><div class="ppl-avatar" style="background:'+col+'">'+ini+'</div></div>'+
      '<div class="ppl-name-cell"><div class="ppl-name-info"><div class="ppl-name-v2">'+e.firstName+' '+e.lastName+'</div><div class="ppl-role">'+e.jobTitle+'</div></div></div>'+
      '<div>'+e.department+'</div>'+
      '<div><span class="ppl-pay-badge '+payTypeCls(e.payType)+'">'+payTypeLabel(e.payType)+'</span></div>'+
      '<div><span class="ppl-status '+e.status+'">'+statusLabel(e.status)+'</span></div>'+
      '<div style="font-size:12px">'+formatDate(e.lastPaid)+'</div>'+
      '<div style="font-size:12px">'+(e.nextPay?formatDate(e.nextPay):'—')+'</div>'+
      '<div class="ppl-actions">'+
        '<button class="ppl-action-btn" title="View" onclick="event.stopPropagation();openEmployee(\''+e.id+'\')"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>'+
        '<button class="ppl-action-btn" title="Edit" onclick="event.stopPropagation()"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>'+
      '</div>'+
    '</div>';
  }

  function renderStatsBar(){
    var all=getData(), active=all.filter(function(e){return e.status==='active';}),
        suspended=all.filter(function(e){return e.status==='suspended';}),
        totalPayroll=active.reduce(function(s,e){return s+(e.baseSalary||0);},0);
    var bar=document.getElementById('ppl-stats-bar');
    if(!bar) return;
    bar.innerHTML=
      '<div class="ppl-stat-item"><div class="ppl-stat-value">'+all.length+'</div><div class="ppl-stat-label">Total</div></div>'+
      '<div class="ppl-stat-divider"></div>'+
      '<div class="ppl-stat-item"><div class="ppl-stat-value" style="color:#10B981">'+active.length+'</div><div class="ppl-stat-label">Active</div></div>'+
      '<div class="ppl-stat-divider"></div>'+
      '<div class="ppl-stat-item"><div class="ppl-stat-value" style="color:#F59E0B">'+suspended.length+'</div><div class="ppl-stat-label">Suspended</div></div>'+
      '<div class="ppl-stat-divider"></div>'+
      '<div class="ppl-stat-item"><div class="ppl-stat-value">'+formatSalary(totalPayroll)+'</div><div class="ppl-stat-label">Monthly Payroll</div></div>';
  }

  window.renderEmployees = function(){
    renderStatsBar();
    var filtered = getFiltered();
    var start = (state.page-1)*state.perPage, end = start+state.perPage;
    var page = filtered.slice(start,end);
    var body = document.getElementById('ppl-rows-body');
    if(body) body.innerHTML = page.map(renderRow).join('');
    var fc = document.getElementById('ppl-footer-count');
    if(fc) fc.textContent = 'Showing '+(filtered.length?start+1:0)+'–'+Math.min(end,filtered.length)+' of '+filtered.length+' employees';
    var pn = document.getElementById('ppl-page-num');
    if(pn) pn.textContent = state.page;
  };

  window.pplPagePrev = function(){ if(state.page>1){state.page--;renderEmployees();} };
  window.pplPageNext = function(){ var max=Math.ceil(getFiltered().length/state.perPage); if(state.page<max){state.page++;renderEmployees();} };

  window.openEmployee = function(id){
    var emp = getData().find(function(e){return e.id===id;});
    if(!emp) return;
    state.currentEmployee = id;
    renderEmployeeProfile(emp);
    switchScreen('employee');
  };

  function renderEmployeeProfile(emp){
    var ini=empInitials(emp.firstName,emp.lastName), col=avatarColor(emp.firstName+emp.lastName);
    document.getElementById('emp-breadcrumb-name').textContent = emp.firstName+' '+emp.lastName;
    var avatarEl = document.getElementById('emp-avatar');
    avatarEl.style.background = col;
    if(emp.headshot){
      avatarEl.innerHTML = '<img src="'+emp.headshot+'" alt="headshot"><span class="emp-avatar-cam"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></span>';
    } else {
      avatarEl.innerHTML = ini+'<span class="emp-avatar-cam"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></span>';
    }
    document.getElementById('emp-name').textContent = emp.firstName+' '+emp.lastName;
    document.getElementById('emp-role-line').textContent = emp.jobTitle+' · '+emp.department;
    document.getElementById('emp-badges').innerHTML =
      '<span class="ppl-status '+emp.status+'">'+statusLabel(emp.status)+'</span>'+
      '<span class="ppl-pay-badge '+payTypeCls(emp.payType)+'">'+payTypeLabel(emp.payType)+(emp.commissionPlan?' + Commission':'')+'</span>'+
      '<span class="badge badge-gray" style="padding:3px 10px;border-radius:20px;font-size:11px;background:rgba(100,116,139,.12);color:#94A3B8;">'+emp.id+'</span>';

    document.getElementById('emp-truth').innerHTML =
      '<div class="emp-truth-item"><div class="emp-truth-label">Status</div><div class="emp-truth-value"><span class="ppl-status '+emp.status+'" style="font-size:12px">'+statusLabel(emp.status)+'</span></div></div>'+
      '<div class="emp-truth-item"><div class="emp-truth-label">Pay Type</div><div class="emp-truth-value">'+payTypeLabel(emp.payType)+'</div></div>'+
      '<div class="emp-truth-item"><div class="emp-truth-label">Last Paid</div><div class="emp-truth-value">'+formatDate(emp.lastPaid)+'</div></div>'+
      '<div class="emp-truth-item"><div class="emp-truth-label">Next Pay Due</div><div class="emp-truth-value">'+(emp.nextPay?formatDate(emp.nextPay):'N/A')+'</div></div>'+
      '<div class="emp-truth-item"><div class="emp-truth-label">Tenure</div><div class="emp-truth-value">'+calcTenure(emp.startDate)+'</div></div>';

    renderOverviewTab(emp);
    renderPayTab(emp);
    renderWorkTab(emp);
    renderDocumentsTab(emp);
    renderAuditTab(emp);
    renderDisciplinaryTab(emp);

    // Reset to overview tab
    var tabs = document.querySelectorAll('#emp-tabs-bar .emp-tab');
    tabs.forEach(function(t){t.classList.remove('active');});
    if(tabs[0]) tabs[0].classList.add('active');
    var panels = document.querySelectorAll('#emp-content .tab-panel');
    panels.forEach(function(p){p.style.display='none';p.classList.remove('active');});
    var ov = document.getElementById('panel-emp-overview');
    if(ov){ov.style.display='';ov.classList.add('active');}
  }

  function calcTenure(startDate){
    var s=new Date(startDate), now=new Date();
    var years=now.getFullYear()-s.getFullYear(), months=now.getMonth()-s.getMonth();
    if(months<0){years--;months+=12;}
    if(years>0) return years+'y '+months+'m';
    return months+'m';
  }

  function renderOverviewTab(emp){
    var nok = emp.nextOfKin||{};
    var html=
      '<div class="emp-section"><div class="emp-section-title" style="display:flex;justify-content:space-between;align-items:center;">Personal Information<button class="btn btn-outline" style="font-size:11px;padding:3px 10px;" onclick="openEditPersonalModal(\''+emp.id+'\')">Edit</button></div>'+
      '<div class="emp-fields">'+
        field('Full Name',emp.firstName+' '+emp.lastName)+
        field('Email',emp.email)+
        field('Phone',emp.phone)+
        field('ID Number',emp.idNumber||'—')+
        field('Start Date',formatDate(emp.startDate))+
        field('Manager',emp.manager||'—')+
        field('Department',emp.department)+
        field('Job Title',emp.jobTitle)+
      '</div></div>'+
      '<div class="emp-section"><div class="emp-section-title" style="display:flex;justify-content:space-between;align-items:center;">Next of Kin<button class="btn btn-outline" style="font-size:11px;padding:3px 10px;" onclick="openEditNextOfKinModal(\''+emp.id+'\')">Edit</button></div>'+
      '<div class="emp-fields">'+
        field('Name',nok.name||'—')+
        field('Relationship',nok.relation||'—')+
        field('Phone',nok.phone||'—')+
      '</div></div>';

    // Notes section
    var notes=(emp.notes||[]).slice().sort(function(a,b){return b.createdAt-a.createdAt;});
    html+='<div class="emp-section"><div class="emp-section-title" style="display:flex;justify-content:space-between;align-items:center;">Notes'+(notes.length?' ('+notes.length+')':'')+'<button class="btn btn-outline" style="font-size:11px;padding:3px 10px;" onclick="openAddNoteModal()">+ Add Note</button></div>';
    if(notes.length===0){
      html+='<div style="color:#5A7080;font-size:12px;padding:16px;text-align:center;">No notes yet. Use the Add Note button to create one.</div>';
    } else {
      var catLabels={general:'General',arrangement:'Special Arrangement',health:'Health',performance:'Performance',disciplinary:'Disciplinary',other:'Other'};
      var catColors={general:'#6366f1',arrangement:'#f59e0b',health:'#ef4444',performance:'#10b981',disciplinary:'#ef4444',other:'#64748b'};
      var prioColors={normal:'',important:'#f59e0b',urgent:'#ef4444'};
      notes.forEach(function(n){
        var cat = n.category||'general';
        var prio = n.priority||'normal';
        var catLabel=catLabels[cat]||cat;
        var catColor=catColors[cat]||'#64748b';
        var dateStr=new Date(n.createdAt||n.date||Date.now()).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
        var prioBadge=prio!=='normal'?'<span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;background:rgba('+(prio==='urgent'?'239,68,68':'245,158,11')+',.12);color:'+(prioColors[prio]||'#94A3B8')+';">'+prio.charAt(0).toUpperCase()+prio.slice(1)+'</span> ':'';
        var privateBadge=n.private?'<span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;background:rgba(100,116,139,.12);color:#94A3B8;">Private</span> ':'';
        html+='<div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;">'+
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'+
            '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">'+
              '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:rgba('+hexToRgb(catColor)+',.12);color:'+catColor+';">'+catLabel+'</span>'+
              prioBadge+privateBadge+
              '<span style="font-size:11px;color:#5A7080;">'+dateStr+'</span>'+
              '<span style="font-size:11px;color:#3E4C59;">by '+(n.createdBy||n.by||'System')+'</span>'+
            '</div>'+
            '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;color:#EF4444;" onclick="deleteNote(\''+emp.id+'\',\''+n.id+'\')" title="Delete note">&times;</button>'+
          '</div>'+
          '<div style="font-size:12px;color:#C9D5E0;line-height:1.5;white-space:pre-wrap;">'+n.text+'</div>'+
        '</div>';
      });
    }
    html+='</div>';

    document.getElementById('panel-emp-overview').innerHTML = html;
  }

  function hexToRgb(hex){
    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return r+','+g+','+b;
  }

  function renderPayTab(emp){
    var bankRevealId = 'bank-reveal-'+emp.id;
    var html='';

    // Action buttons
    html+='<div class="emp-pay-actions">'+
      '<button class="btn btn-outline" onclick="openAdvanceModal(\''+emp.id+'\')"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>Record Advance</button>'+
      '<button class="btn btn-outline" onclick="openBonusModal(\''+emp.id+'\')"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M12 8v13m0-13V6a2 2 0 012-2h.93a1.5 1.5 0 011.342.83l.068.17A3 3 0 0113.5 8H12zm0 0V6a2 2 0 00-2-2h-.93a1.5 1.5 0 00-1.342.83l-.068.17A3 3 0 0010.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>Add Bonus</button>'+
      '<button class="btn btn-outline" onclick="openPayIncreaseModal(\''+emp.id+'\')"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>Pay Adjustment</button>'+
    '</div>';

    // Pay Profile
    html+='<div class="emp-section"><div class="emp-section-title">Pay Profile</div>'+
      '<div class="emp-fields">'+
        field('Pay Type',payTypeLabel(emp.payType))+
        field('Base Salary',formatSalary(emp.baseSalary))+
        field('Hourly Rate',emp.hourlyRate?'R '+emp.hourlyRate+'/hr':'—')+
        field('Commission Plan',emp.commissionPlan||'—')+
        field('Pay Frequency',emp.payFrequency?emp.payFrequency.charAt(0).toUpperCase()+emp.payFrequency.slice(1):'—')+
        field('Last Paid',formatDate(emp.lastPaid))+
        field('Next Pay',emp.nextPay?formatDate(emp.nextPay):'N/A')+
      '</div></div>';

    // Banking Details
    html+='<div class="emp-section"><div class="emp-section-title" style="display:flex;justify-content:space-between;align-items:center;">Banking Details<button class="btn btn-outline" style="font-size:11px;padding:3px 10px;" onclick="openBankEditModal(\''+emp.id+'\')">Edit</button></div>'+
      '<div class="emp-fields">'+
        field('Bank',emp.bankName||'—')+
        field('Branch Code',emp.branchCode||'—')+
        '<div class="emp-field"><div class="emp-field-label">Account Number</div><div class="emp-field-value"><div class="emp-bank-masked"><span id="'+bankRevealId+'">'+maskAccount(emp.accountNumber)+'</span><button class="emp-reveal-btn" onclick="revealBankNumber(\''+emp.id+'\',\''+bankRevealId+'\')">Show</button></div></div></div>'+
        field('Account Holder',emp.accountHolder||'—')+
      '</div></div>';

    // Bank Change History
    var bankHist=emp.bankHistory||[];
    if(bankHist.length>0){
      html+='<div class="emp-section"><div class="emp-section-title">Bank Details Change History ('+bankHist.length+')</div>';
      bankHist.slice().reverse().forEach(function(h){
        var changes=[];
        if(h.changes.bankName) changes.push('Bank: '+h.changes.bankName.from+' → '+h.changes.bankName.to);
        if(h.changes.branchCode) changes.push('Branch: '+h.changes.branchCode.from+' → '+h.changes.branchCode.to);
        if(h.changes.accountNumber) changes.push('Account: ****'+h.changes.accountNumber.from.slice(-4)+' → ****'+h.changes.accountNumber.to.slice(-4));
        if(h.changes.accountHolder) changes.push('Holder: '+h.changes.accountHolder.from+' → '+h.changes.accountHolder.to);
        html+='<div style="padding:8px 0;border-bottom:1px solid var(--border);">'+
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span style="color:#F4A261;font-weight:600;">'+formatDate(h.date)+'</span><span style="color:#5A7080;">by '+h.by+'</span></div>'+
          '<div style="font-size:11px;color:#E4EBF5;">'+changes.join(' | ')+'</div>'+
          (h.reason?'<div style="font-size:11px;color:#5A7080;margin-top:2px;font-style:italic;">Reason: '+h.reason+'</div>':'')+
        '</div>';
      });
      html+='</div>';
    }

    // Active Advances
    var activeAdvances=(emp.advances||[]).filter(function(a){return a.status==='active';});
    var completedAdvances=(emp.advances||[]).filter(function(a){return a.status==='completed';});
    if(emp.advances&&emp.advances.length>0){
      html+='<div class="emp-section"><div class="emp-section-title">Advances ('+activeAdvances.length+' active, '+completedAdvances.length+' completed)</div>';
      html+='<table class="emp-advance-table"><thead><tr><th>Date</th><th>Amount</th><th>Interest</th><th>Installment</th><th>Remaining</th><th>Status</th></tr></thead><tbody>';
      emp.advances.forEach(function(a){
        html+='<tr>'+
          '<td>'+formatDate(a.startDate)+'</td>'+
          '<td>R '+a.amount.toLocaleString('en-ZA')+'</td>'+
          '<td>'+a.interestRate+'%</td>'+
          '<td>R '+a.monthlyInstallment.toLocaleString('en-ZA',{minimumFractionDigits:2})+'</td>'+
          '<td>'+a.monthsRemaining+'/'+a.months+' months</td>'+
          '<td><span class="adv-status '+a.status+'">'+a.status.charAt(0).toUpperCase()+a.status.slice(1)+'</span></td>'+
        '</tr>';
      });
      html+='</tbody></table></div>';
    }

    // Current Period Bonuses
    var bonuses=emp.bonuses||[];
    if(bonuses.length>0){
      html+='<div class="emp-section"><div class="emp-section-title">Bonuses ('+bonuses.length+')</div>';
      bonuses.forEach(function(b){
        html+='<div class="emp-bonus-item">'+
          '<div><span class="emp-bonus-type">'+b.type+'</span>'+
          '<span style="font-size:11px;color:#5A7080;margin-left:8px;">'+b.period+'</span>'+
          (b.note?'<span style="font-size:11px;color:#5A7080;margin-left:8px;"> — '+b.note+'</span>':'')+
          '</div>'+
          '<div class="emp-bonus-amt">R '+b.amount.toLocaleString('en-ZA')+'</div>'+
        '</div>';
      });
      html+='</div>';
    }

    // Salary History
    var salHist=emp.salaryHistory||[];
    if(salHist.length>0){
      html+='<div class="emp-section"><div class="emp-section-title">Salary History ('+salHist.length+' changes)</div>';
      salHist.slice().reverse().forEach(function(s){
        var fLabel={baseSalary:'Base Salary',hourlyRate:'Hourly Rate',commissionPlan:'Commission Plan'}[s.field]||s.field;
        var oldD=(s.field==='commissionPlan')?(s.oldValue||'None'):'R '+(s.oldValue||0).toLocaleString('en-ZA');
        var newD=(s.field==='commissionPlan')?s.newValue:'R '+s.newValue.toLocaleString('en-ZA');
        html+='<div class="emp-salary-change">'+
          '<span class="sal-field">'+fLabel+'</span>'+
          '<span class="sal-old">'+oldD+'</span>'+
          '<span class="sal-arrow">&rarr;</span>'+
          '<span class="sal-new">'+newD+'</span>'+
          '<span class="sal-date">Effective '+formatDate(s.effectiveDate)+'</span>'+
        '</div>';
      });
      html+='</div>';
    }

    // Delivery Preferences
    var del=emp.payslipDelivery||{email:true,whatsapp:false,print:false};
    html+='<div class="emp-section"><div class="emp-section-title">Payslip Delivery Preferences</div>'+
      '<div class="emp-delivery-group" style="padding:4px 0;">'+
        '<label><input type="checkbox" id="del-pref-email-'+emp.id+'"'+(del.email?' checked':'')+'>  Email</label>'+
        '<label><input type="checkbox" id="del-pref-wa-'+emp.id+'"'+(del.whatsapp?' checked':'')+'>  WhatsApp</label>'+
        '<label><input type="checkbox" id="del-pref-print-'+emp.id+'"'+(del.print?' checked':'')+'>  Print</label>'+
      '</div>'+
      '<button class="btn btn-outline" style="font-size:11px;padding:4px 12px;margin-top:6px;" onclick="updateDeliveryPrefs(\''+emp.id+'\')">Update Preferences</button>'+
    '</div>';

    // Payslip History on Employee
    var psHist=emp.payslipHistory||[];
    if(psHist.length>0){
      html+='<div class="emp-section"><div class="emp-section-title">Payslip History ('+psHist.length+')</div>';
      html+='<table class="emp-advance-table"><thead><tr><th>Period</th><th>Gross</th><th>Net</th><th>Issued</th><th>Sent</th><th>Actions</th></tr></thead><tbody>';
      psHist.slice().reverse().forEach(function(p){
        var sentBadges='';
        if(p.sent.email) sentBadges+='<span class="pr-archive-sent yes">Email</span> ';
        if(p.sent.whatsapp) sentBadges+='<span class="pr-archive-sent yes">WhatsApp</span> ';
        if(p.sent.print) sentBadges+='<span class="pr-archive-sent yes">Print</span> ';
        if(!sentBadges) sentBadges='<span class="pr-archive-sent no">Not sent</span>';
        var issuedDate=p.issuedAt?new Date(p.issuedAt).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'}):'—';
        html+='<tr>'+
          '<td>'+p.period+'</td>'+
          '<td>R '+p.grossTotal.toLocaleString('en-ZA',{minimumFractionDigits:2})+'</td>'+
          '<td>R '+p.netPay.toLocaleString('en-ZA',{minimumFractionDigits:2})+'</td>'+
          '<td>'+issuedDate+'</td>'+
          '<td>'+sentBadges+'</td>'+
          '<td style="display:flex;gap:4px;">'+
            '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;" onclick="viewHistoricalPayslip(\''+p.id+'\')" title="View Payslip">&#128196;</button>'+
            '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;" onclick="resendArchived(\''+p.id+'\',\'email\')" title="Resend Email">&#9993;</button>'+
            '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;" onclick="resendArchived(\''+p.id+'\',\'whatsapp\')" title="Resend WhatsApp">&#128172;</button>'+
            '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;" onclick="resendArchived(\''+p.id+'\',\'print\')" title="Print">&#128424;</button>'+
          '</td>'+
        '</tr>';
      });
      html+='</tbody></table></div>';
    }

    document.getElementById('panel-emp-pay').innerHTML = html;
  }

  window.revealBankNumber = function(empId,elId){
    var emp = getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    var el = document.getElementById(elId);
    if(!el) return;
    if(el.dataset.revealed==='true'){
      el.textContent = maskAccount(emp.accountNumber);
      el.dataset.revealed = 'false';
      el.nextElementSibling.textContent = 'Show';
    } else {
      el.textContent = emp.accountNumber;
      el.dataset.revealed = 'true';
      el.nextElementSibling.textContent = 'Hide';
      // Add audit entry
      emp.auditLog.push({event:'bank_details.viewed',date:new Date().toISOString().split('T')[0],by:'Current User',detail:'Bank account number viewed'});
    }
  };

  function renderWorkTab(emp){
    var html = '<div class="emp-section"><div class="emp-section-title">Work & Earnings</div>';
    if(emp.payType==='commission'||emp.payType==='hybrid'){
      var commEntries = emp.auditLog.filter(function(a){return a.event==='commission.earned';});
      if(commEntries.length){
        html += '<div style="margin-bottom:12px;font-size:13px;color:#5A7080;">Commission Entries</div>';
        commEntries.forEach(function(c){
          html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;"><span style="color:#E4EBF5">'+c.detail+'</span><span style="color:#5A7080">'+formatDate(c.date)+'</span></div>';
        });
      } else {
        html += '<div style="color:#5A7080;font-size:13px;">No commission entries yet.</div>';
      }
    } else if(emp.payType==='hourly'){
      html += '<div style="color:#5A7080;font-size:13px;">Timesheet entries will appear here once the Timesheets module is enabled.</div>';
    } else {
      html += '<div style="color:#5A7080;font-size:13px;">Salaried employee — no variable earnings to display.</div>';
    }
    html += '</div>';
    document.getElementById('panel-emp-work').innerHTML = html;
  }

  function renderDocumentsTab(emp){
    var docs = emp.documents||[];
    var html = '<div class="emp-section"><div class="emp-section-title" style="justify-content:space-between;">Documents ('+docs.length+') <button class="btn btn-primary" style="font-size:11px;padding:4px 14px;" onclick="openContractFlow(\''+emp.id+'\')">Draft Contract</button></div>';
    if(docs.length){
      docs.forEach(function(d, idx){
        html += '<div class="emp-doc-row" onclick="openDocViewer(\''+emp.id+'\','+idx+')">'+
          '<div class="emp-doc-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>'+
          '<div class="emp-doc-info"><div class="emp-doc-name">'+d.name+'</div><div class="emp-doc-meta">'+d.size+' · Uploaded '+formatDate(d.date)+'</div></div>'+
          '<div style="color:#5A7080;font-size:11px;flex-shrink:0;">View →</div>'+
        '</div>';
      });
    }
    html += '</div>';
    html += '<div class="emp-upload-area">Click or drag files here to upload documents</div>';
    document.getElementById('panel-emp-documents').innerHTML = html;
  }

  function renderAuditTab(emp){
    var log = (emp.auditLog||[]).slice().reverse();
    var html = '<div class="emp-section"><div class="emp-section-title">Audit Log ('+log.length+' entries)</div><div class="emp-timeline">';
    log.forEach(function(entry){
      html += '<div class="emp-timeline-entry">'+
        '<div class="emp-timeline-dot"></div>'+
        '<div class="emp-timeline-body">'+
          '<div class="emp-timeline-event">'+entry.event.replace(/[._]/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();})+'</div>'+
          '<div class="emp-timeline-detail">'+entry.detail+'</div>'+
          '<div class="emp-timeline-meta">'+formatDate(entry.date)+' · by '+entry.by+'</div>'+
        '</div>'+
      '</div>';
    });
    html += '</div></div>';
    document.getElementById('panel-emp-audit').innerHTML = html;
  }

  function field(label,value){
    return '<div class="emp-field"><div class="emp-field-label">'+label+'</div><div class="emp-field-value">'+(value||'—')+'</div></div>';
  }

  window.switchEmpTab = function(tabName){
    var tabs = document.querySelectorAll('#emp-tabs-bar .emp-tab');
    tabs.forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-emptab')===tabName); });
    var panels = document.querySelectorAll('#emp-content .tab-panel');
    panels.forEach(function(p){
      if(p.id==='panel-'+tabName){p.style.display='';p.classList.add('active');}
      else{p.style.display='none';p.classList.remove('active');}
    });
  };

  /* ══════════════════════════════════════════════════════
     HEADSHOT UPLOAD
     ══════════════════════════════════════════════════════ */
  window.triggerHeadshotUpload = function(){
    document.getElementById('emp-headshot-input').click();
  };

  window.handleHeadshotUpload = function(event){
    var file = event.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 200;
        var ctx = canvas.getContext('2d');
        var size = Math.min(img.width, img.height);
        var sx = (img.width - size) / 2, sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        var emp = getCurrentEmployee();
        if(emp){
          emp.headshot = dataUrl;
          var avatar = document.getElementById('emp-avatar');
          avatar.innerHTML = '<img src="'+dataUrl+'" alt="headshot"><span class="emp-avatar-cam"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></span>';
          emp.auditLog.push({event:'headshot.uploaded',date:new Date().toISOString().split('T')[0],by:'Current User',detail:'Employee headshot photo uploaded'});
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  function getCurrentEmployee(){
    return (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===state.currentEmployee;});
  }

  /* ══════════════════════════════════════════════════════
     DISCIPLINARY TAB
     ══════════════════════════════════════════════════════ */
  function renderDisciplinaryTab(emp){
    var disc = emp.disciplinary || {records:[], currentCase:null};
    var records = disc.records || [];
    var html = '';

    // SA Labour Law banner
    html += '<div class="disc-law-banner">'+
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'+
      '<div class="disc-law-banner-text"><strong>South African Labour Law — Progressive Discipline</strong><br>'+
      'Under the LRA Schedule 8 (Code of Good Practice: Dismissal), employers must follow progressive discipline: Verbal Warning → Written Warning → Final Written Warning → Disciplinary Hearing. '+
      'The severity must match the offence, and employees have the right to representation at all stages.</div></div>';

    // Current case banner
    if(disc.currentCase){
      var cc = disc.currentCase;
      html += '<div class="disc-case-banner"><div><div class="disc-case-banner-info">Active Case: '+cc.offence.substring(0,60)+'...</div>'+
        '<div class="disc-case-banner-sub">Type: '+cc.type.charAt(0).toUpperCase()+cc.type.slice(1)+' · Status: In Progress · Issued: '+formatDate(cc.dateIssued)+'</div></div>'+
        '<button class="btn btn-primary" style="font-size:12px;padding:6px 16px;" onclick="openDiscFlow(\''+emp.id+'\',true)">Continue Case</button></div>';
    }

    // Actions
    html += '<div style="display:flex;gap:8px;margin-bottom:16px;">'+
      '<button class="btn btn-outline" style="font-size:12px;padding:6px 14px;" onclick="openDiscFlow(\''+emp.id+'\',false)">+ New Case</button></div>';

    // Timeline of records
    html += '<div class="emp-section"><div class="emp-section-title">Disciplinary History ('+records.length+' records)</div>';
    if(records.length){
      html += '<div class="disc-timeline">';
      records.forEach(function(r){
        var statusCls = r.status === 'expired' ? 'expired' : r.status === 'active' ? 'active' : r.status === 'in-progress' ? 'in-progress' : 'completed';
        html += '<div class="disc-tl-item">'+
          '<div class="disc-tl-dot '+statusCls+'"></div>'+
          '<div class="disc-tl-card">'+
            '<div class="disc-tl-header">'+
              '<span class="disc-type-badge '+r.type+'">'+r.type+'</span>'+
              '<span class="disc-status-pill '+statusCls+'">'+r.status.replace('-',' ')+'</span>'+
              '<span class="disc-tl-date">'+formatDate(r.dateIssued)+(r.expiryDate?' · Expires '+formatDate(r.expiryDate):'')+'</span>'+
            '</div>'+
            '<div class="disc-tl-detail">'+r.offence+'</div>'+
            (r.issuedBy?'<div style="font-size:11px;color:#5A7080;margin-top:4px;">Issued by: '+r.issuedBy+(r.witnessedBy?' · Witnessed by: '+r.witnessedBy:'')+'</div>':'')+
            (r.employeeResponse?'<div style="font-size:11px;color:#94A3B8;margin-top:4px;font-style:italic;">Employee response: "'+r.employeeResponse+'"</div>':'')+
            (r.notes?'<div style="font-size:11px;color:#5A7080;margin-top:4px;">'+r.notes+'</div>':'')+
          '</div></div>';
      });
      html += '</div>';
    } else {
      html += '<div style="color:#5A7080;font-size:13px;">No disciplinary records on file.</div>';
    }
    html += '</div>';

    document.getElementById('panel-emp-disciplinary').innerHTML = html;
  }

  /* ══════════════════════════════════════════════════════
     DISCIPLINARY FLOW (5-Step Wizard)
     ══════════════════════════════════════════════════════ */
  var discFlowState = { empId:null, step:0, continuing:false, offenceCategory:'', offenceDescription:'', selectedAction:'', generatedDoc:'' };
  var DISC_STEPS = ['Identify Offence','Review History','Select Action','Generate Document','Record & Notify'];
  var DISC_OFFENCE_CATS = [
    {val:'misconduct',label:'Misconduct (Late arrivals, absent without leave, minor policy breach)'},
    {val:'serious_misconduct',label:'Serious Misconduct (Unauthorized access, insubordination, negligence)'},
    {val:'gross_misconduct',label:'Gross Misconduct (Theft, fraud, assault, substance abuse at work)'},
    {val:'poor_performance',label:'Poor Performance (Failure to meet targets, quality issues)'},
    {val:'incapacity',label:'Incapacity (Medical, disability-related)'}
  ];

  window.openDiscFlow = function(empId, continuing){
    discFlowState.empId = empId;
    discFlowState.continuing = continuing;
    discFlowState.step = continuing ? 1 : 0;
    discFlowState.offenceCategory = '';
    discFlowState.offenceDescription = '';
    discFlowState.selectedAction = '';
    discFlowState.generatedDoc = '';

    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===empId;});
    if(!emp) return;
    if(continuing && emp.disciplinary.currentCase){
      discFlowState.offenceCategory = emp.disciplinary.currentCase.offenceCategory;
      discFlowState.offenceDescription = emp.disciplinary.currentCase.offence;
    }

    document.getElementById('disc-flow-title').textContent = 'Disciplinary Process — '+emp.firstName+' '+emp.lastName;
    renderDiscSteps();
    renderDiscStep();
    loadDiscAiChat(emp);
    document.getElementById('disc-flow-overlay').classList.add('open');
  };

  window.closeDiscFlow = function(){
    document.getElementById('disc-flow-overlay').classList.remove('open');
  };

  function renderDiscSteps(){
    var html = '';
    DISC_STEPS.forEach(function(name,i){
      var cls = i === discFlowState.step ? 'active' : (i < discFlowState.step ? 'completed' : '');
      html += '<div class="disc-flow-step '+cls+'" onclick="goDiscStep('+i+')">'+
        '<span class="disc-flow-step-num">'+(i < discFlowState.step ? '&#10003;' : (i+1))+'</span>'+name+'</div>';
    });
    document.getElementById('disc-flow-steps').innerHTML = html;
  }

  window.goDiscStep = function(n){
    if(n > discFlowState.step + 1) return;
    discFlowState.step = n;
    renderDiscSteps();
    renderDiscStep();
  };

  function renderDiscStep(){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===discFlowState.empId;});
    if(!emp) return;
    var main = document.getElementById('disc-flow-main');
    var step = discFlowState.step;

    if(step === 0){
      // Identify Offence
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 1: Identify the Offence</h4>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Offence Category</div>'+
        '<select class="disc-form-select" id="disc-offence-cat" onchange="discFlowState.offenceCategory=this.value;sendDiscAiContext()">'+
        '<option value="">Select category...</option>';
      DISC_OFFENCE_CATS.forEach(function(c){
        html += '<option value="'+c.val+'"'+(discFlowState.offenceCategory===c.val?' selected':'')+'>'+c.label+'</option>';
      });
      html += '</select></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Description of Offence</div>'+
        '<textarea class="disc-form-textarea" id="disc-offence-desc" placeholder="Describe what happened, when, and any evidence..."'+
        ' onchange="discFlowState.offenceDescription=this.value">'+discFlowState.offenceDescription+'</textarea></div>';
      html += '<div class="disc-btn-row"><button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="discFlowState.offenceCategory=document.getElementById(\'disc-offence-cat\').value;discFlowState.offenceDescription=document.getElementById(\'disc-offence-desc\').value;goDiscStep(1)">Next: Review History →</button></div>';
      main.innerHTML = html;

    } else if(step === 1){
      // Review History
      var records = (emp.disciplinary.records||[]).filter(function(r){return r.id!==(emp.disciplinary.currentCase||{}).id;});
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 2: Review Disciplinary History</h4>';
      html += '<div style="font-size:12px;color:#5A7080;margin-bottom:12px;">The AI Advisor has reviewed '+emp.firstName+'\'s full history. Prior warnings inform the appropriate next action.</div>';
      if(records.length){
        records.forEach(function(r){
          html += '<div class="disc-history-card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'+
            '<span class="disc-type-badge '+r.type+'">'+r.type+'</span>'+
            '<span class="disc-status-pill '+r.status.replace(' ','-')+'">'+r.status+'</span>'+
            '<span style="font-size:11px;color:#5A7080;">'+formatDate(r.dateIssued)+'</span></div>'+
            '<div style="font-size:12px;color:#CBD5E1;">'+r.offence+'</div></div>';
        });
      } else {
        html += '<div style="color:#5A7080;font-size:13px;padding:20px;text-align:center;background:var(--bg-base);border-radius:8px;">No prior disciplinary records. This would be a first offence.</div>';
      }
      html += '<div class="disc-btn-row"><button class="btn btn-outline" style="font-size:12px;padding:6px 18px;" onclick="goDiscStep(0)">← Back</button>'+
        '<button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="goDiscStep(2)">Next: Select Action →</button></div>';
      main.innerHTML = html;
      addDiscAiMsg('bot','Based on '+emp.firstName+'\'s history, I can see '+(records.length?records.length+' prior record(s)':'no prior records')+'. '+getAiActionAdvice(emp, records));

    } else if(step === 2){
      // Select Action
      var records = (emp.disciplinary.records||[]).filter(function(r){return r.status!=='expired'&&r.id!==(emp.disciplinary.currentCase||{}).id;});
      var recommended = getRecommendedAction(records, discFlowState.offenceCategory);
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 3: Select Disciplinary Action</h4>';
      html += '<div style="font-size:12px;color:#5A7080;margin-bottom:16px;">Based on the employee\'s history and the offence category, the AI recommends an appropriate action.</div>';
      var actions = [
        {val:'verbal',title:'Verbal Warning',desc:'Informal correction. Suitable for first minor offences.'},
        {val:'written',title:'Written Warning',desc:'Formal documented warning. Valid for 6 months typically.'},
        {val:'final',title:'Final Written Warning',desc:'Last formal warning before hearing. Very serious.'},
        {val:'hearing',title:'Disciplinary Hearing',desc:'Formal hearing with right to representation. Can lead to dismissal.'}
      ];
      html += '<div class="disc-action-choice">';
      actions.forEach(function(a){
        var sel = discFlowState.selectedAction === a.val ? 'selected' : '';
        var rec = recommended === a.val ? '<span class="disc-ai-badge" style="margin-bottom:6px;display:inline-block;">AI Recommended</span>' : '';
        html += '<div class="disc-action-opt '+sel+'" onclick="discFlowState.selectedAction=\''+a.val+'\';renderDiscStep()">'+
          rec+'<div class="disc-action-opt-title">'+a.title+'</div><div class="disc-action-opt-desc">'+a.desc+'</div></div>';
      });
      html += '</div>';
      html += '<div class="disc-btn-row"><button class="btn btn-outline" style="font-size:12px;padding:6px 18px;" onclick="goDiscStep(1)">← Back</button>'+
        '<button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="goDiscStep(3)">Next: Generate Document →</button></div>';
      main.innerHTML = html;

    } else if(step === 3){
      // Generate Document
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 4: Generate Disciplinary Document</h4>';
      if(!discFlowState.generatedDoc){
        html += '<div style="text-align:center;padding:40px;"><button class="btn btn-primary" style="padding:10px 24px;" onclick="generateDiscDocument()">Generate '+
          (discFlowState.selectedAction||'warning').charAt(0).toUpperCase()+(discFlowState.selectedAction||'warning').slice(1)+' Document</button></div>';
      } else {
        html += '<div class="disc-doc-preview" id="disc-doc-preview">'+discFlowState.generatedDoc+'</div>';
      }
      html += '<div class="disc-btn-row"><button class="btn btn-outline" style="font-size:12px;padding:6px 18px;" onclick="goDiscStep(2)">← Back</button>'+
        '<button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="goDiscStep(4)">Next: Record & Notify →</button></div>';
      main.innerHTML = html;

    } else if(step === 4){
      // Record & Notify
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 5: Record & Notify</h4>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Witnessed By</div><input class="disc-form-input" id="disc-witness" placeholder="Name of witness..."></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Schedule Meeting</div><input class="disc-form-input" type="date" id="disc-meeting-date"></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Additional Notes</div><textarea class="disc-form-textarea" id="disc-final-notes" placeholder="Any additional notes..."></textarea></div>';
      html += '<div class="disc-btn-row"><button class="btn btn-outline" style="font-size:12px;padding:6px 18px;" onclick="goDiscStep(3)">← Back</button>'+
        '<button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="saveDiscRecord()">Save & Close</button></div>';
      main.innerHTML = html;
    }
  }

  function getRecommendedAction(activeRecords, category){
    if(category==='gross_misconduct') return 'hearing';
    if(activeRecords.length===0) return 'verbal';
    var types = activeRecords.map(function(r){return r.type;});
    if(types.indexOf('final')!==-1) return 'hearing';
    if(types.indexOf('written')!==-1) return 'final';
    if(types.indexOf('verbal')!==-1) return 'written';
    return 'verbal';
  }

  function getAiActionAdvice(emp, records){
    var active = records.filter(function(r){return r.status!=='expired';});
    if(active.length===0) return 'With no active warnings, a verbal or written warning would typically be appropriate for a first offence, depending on severity.';
    if(active.length===1) return 'With 1 active warning on record, progressive discipline suggests escalating to the next level. Consider the severity of the current offence.';
    return 'With '+active.length+' active records, this is a serious situation. Progressive discipline under LRA Schedule 8 may warrant a final written warning or formal hearing.';
  }

  window.generateDiscDocument = function(){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===discFlowState.empId;});
    if(!emp) return;
    var action = discFlowState.selectedAction || 'written';
    var today = new Date().toLocaleDateString('en-ZA',{year:'numeric',month:'long',day:'numeric'});
    var actionLabel = action.charAt(0).toUpperCase()+action.slice(1);

    var doc = '';
    if(action==='hearing'){
      doc = 'NOTICE OF DISCIPLINARY HEARING\n\n'+
        'Date: '+today+'\n'+
        'To: '+emp.firstName+' '+emp.lastName+' ('+emp.id+')\n'+
        'Position: '+emp.jobTitle+', '+emp.department+'\n\n'+
        'Dear '+emp.firstName+',\n\n'+
        'You are hereby notified that a disciplinary hearing has been scheduled in accordance with the Labour Relations Act 66 of 1995, Schedule 8 (Code of Good Practice: Dismissal).\n\n'+
        'CHARGES:\n'+discFlowState.offenceDescription+'\n\n'+
        'Category: '+(discFlowState.offenceCategory||'').replace(/_/g,' ')+'\n\n'+
        'YOUR RIGHTS:\n'+
        '1. You are entitled to be represented by a fellow employee or trade union representative.\n'+
        '2. You have the right to present your case and call witnesses.\n'+
        '3. You have the right to cross-examine any witnesses.\n'+
        '4. You will receive a written outcome within 5 working days.\n'+
        '5. You have the right to appeal the outcome.\n\n'+
        'Please acknowledge receipt of this notice by signing below.\n\n'+
        '_______________________          _______________________\n'+
        'Employee Signature                    Date\n\n'+
        '_______________________          _______________________\n'+
        'Employer Representative              Date';
    } else {
      doc = (actionLabel.toUpperCase())+' WARNING\n\n'+
        'Date: '+today+'\n'+
        'To: '+emp.firstName+' '+emp.lastName+' ('+emp.id+')\n'+
        'Position: '+emp.jobTitle+', '+emp.department+'\n'+
        'Warning Type: '+actionLabel+' Warning\n'+
        'Valid For: 6 months from date of issue\n\n'+
        'Dear '+emp.firstName+',\n\n'+
        'This letter serves as a formal '+action+' warning in terms of the company\'s disciplinary code and procedure, read together with the Labour Relations Act 66 of 1995, Schedule 8.\n\n'+
        'DETAILS OF OFFENCE:\n'+discFlowState.offenceDescription+'\n\n'+
        'Category: '+(discFlowState.offenceCategory||'').replace(/_/g,' ')+'\n\n'+
        'EXPECTED CORRECTIVE ACTION:\n'+
        'You are required to immediately rectify your conduct. Failure to do so may result in further disciplinary action, up to and including dismissal.\n\n'+
        'This warning will remain on your file for a period of 6 months. Should you commit a similar or related offence during this period, further action will be taken in accordance with the progressive discipline procedure.\n\n'+
        'You have the right to add your comments below and to appeal this decision within 5 working days.\n\n'+
        'EMPLOYEE COMMENTS:\n_____________________________________________\n_____________________________________________\n\n'+
        '_______________________          _______________________\n'+
        'Employee Signature                    Date\n\n'+
        '_______________________          _______________________\n'+
        'Issuing Manager                       Date\n\n'+
        '_______________________          _______________________\n'+
        'Witness                               Date';
    }

    // Typing animation
    discFlowState.generatedDoc = '';
    var preview = document.getElementById('disc-doc-preview');
    if(!preview){
      renderDiscStep();
      preview = document.getElementById('disc-doc-preview');
    }
    if(!preview) { discFlowState.generatedDoc = doc; renderDiscStep(); return; }
    var idx = 0;
    var timer = setInterval(function(){
      if(idx >= doc.length){ clearInterval(timer); discFlowState.generatedDoc = doc; return; }
      var chunk = doc.substring(idx, Math.min(idx+8, doc.length));
      discFlowState.generatedDoc += chunk;
      preview.textContent = discFlowState.generatedDoc;
      idx += 8;
    }, 10);

    addDiscAiMsg('bot','I\'ve generated the '+actionLabel+' document based on South African labour law requirements. Please review the document carefully before proceeding. You can edit any part of it directly.');
  };

  window.saveDiscRecord = function(){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===discFlowState.empId;});
    if(!emp) return;
    var witness = document.getElementById('disc-witness').value;
    var notes = document.getElementById('disc-final-notes').value;
    var meetingDate = document.getElementById('disc-meeting-date').value;

    var record = {
      id:'DISC-'+Date.now(),
      type:discFlowState.selectedAction||'written',
      status:'active',
      offence:discFlowState.offenceDescription,
      offenceCategory:discFlowState.offenceCategory,
      dateIssued:Date.now(),
      expiryDate:discFlowState.selectedAction==='hearing'?null:Date.now()+(180*24*60*60*1000),
      issuedBy:'Current User',
      witnessedBy:witness||null,
      employeeResponse:null,
      documentGenerated:!!discFlowState.generatedDoc,
      notes:notes||null
    };

    if(discFlowState.continuing && emp.disciplinary.currentCase){
      var caseId = emp.disciplinary.currentCase.id;
      emp.disciplinary.records = emp.disciplinary.records.map(function(r){
        return r.id===caseId ? Object.assign({},r,{status:'completed',witnessedBy:witness||r.witnessedBy,notes:notes||r.notes,documentGenerated:true}) : r;
      });
      emp.disciplinary.currentCase = null;
    } else {
      emp.disciplinary.records.push(record);
    }

    emp.auditLog.push({event:'disciplinary.'+record.type,date:new Date().toISOString().split('T')[0],by:'Current User',detail:'Disciplinary '+record.type+' issued: '+record.offence.substring(0,50)});

    closeDiscFlow();
    renderDisciplinaryTab(emp);
    addDiscAiMsg('bot','The disciplinary record has been saved successfully.'+(meetingDate?' A meeting has been scheduled for '+meetingDate+'.':''));
  };

  // ── Disc AI Chat ──
  var discAiResponses = {
    'what happens if employee refuses to sign': 'Under SA law, an employee cannot be forced to sign a warning. If they refuse, note "Employee refused to sign" on the document and have a witness sign to confirm the warning was issued and explained. The warning remains valid regardless.',
    'can i dismiss': 'Dismissal requires a fair reason (misconduct, incapacity, or operational requirements) AND a fair procedure (proper hearing). Under LRA Schedule 8, summary dismissal is only appropriate for gross misconduct. For other cases, progressive discipline must be followed first.',
    'what is progressive discipline': 'Progressive discipline under LRA Schedule 8 means escalating sanctions: Verbal Warning → Written Warning → Final Written Warning → Hearing/Dismissal. Each step should be proportionate to the offence. However, for gross misconduct (theft, fraud, assault), you may skip to a hearing directly.',
    'appeal': 'The employee has the right to appeal any disciplinary outcome. The appeal should be heard by a more senior manager who was not involved in the original decision. The employee must lodge the appeal in writing within 5 working days of receiving the outcome.',
    'union': 'Under the LRA, employees have the right to be represented by a trade union representative or a fellow employee at any disciplinary hearing. You cannot deny this right. If the employee requests representation, the hearing must be postponed to allow them to arrange it.',
    'ccma': 'If an employee believes they were unfairly dismissed or disciplined, they can refer the dispute to the CCMA (Commission for Conciliation, Mediation and Arbitration) within 30 days. The CCMA will first attempt conciliation, and if that fails, the matter proceeds to arbitration.',
    'default': 'I can help with questions about South African labour law and disciplinary procedures. Common topics include:\n\n• Progressive discipline steps\n• Employee rights during hearings\n• CCMA referral processes\n• Fair vs unfair dismissal\n• Documentation requirements\n\nWhat would you like to know more about?'
  };

  function loadDiscAiChat(emp){
    var msgs = document.getElementById('disc-ai-msgs');
    msgs.innerHTML = '';
    var history = emp.disciplinary.aiChatHistory || [];
    if(history.length){
      history.forEach(function(m){
        addDiscAiMsg(m.role, m.text, true);
      });
    } else {
      addDiscAiMsg('bot', 'Hello! I\'m your AI Disciplinary Advisor, specializing in South African Labour Law. I can see '+emp.firstName+'\'s employment record and will guide you through the disciplinary process in compliance with the LRA Schedule 8.\n\nHow can I help you today?', true);
    }
  }

  function addDiscAiMsg(role, text, skipScroll){
    var msgs = document.getElementById('disc-ai-msgs');
    if(!msgs) return;
    var div = document.createElement('div');
    div.className = 'disc-ai-msg '+(role==='bot'?'bot':'user');
    div.textContent = text;
    msgs.appendChild(div);
    if(!skipScroll) msgs.scrollTop = msgs.scrollHeight;
  }

  window.sendDiscAiMsg = function(){
    var input = document.getElementById('disc-ai-input');
    var msg = input.value.trim();
    if(!msg) return;
    input.value = '';
    addDiscAiMsg('user', msg);

    // Show typing
    var msgs = document.getElementById('disc-ai-msgs');
    var typing = document.createElement('div');
    typing.className = 'disc-ai-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(function(){
      typing.remove();
      var lower = msg.toLowerCase();
      var response = discAiResponses['default'];
      for(var key in discAiResponses){
        if(key!=='default' && lower.indexOf(key)!==-1){ response = discAiResponses[key]; break; }
      }
      // Context-aware fallback
      if(response === discAiResponses['default']){
        if(lower.indexOf('hearing')!==-1 || lower.indexOf('steps')!==-1) response = discAiResponses['what is progressive discipline'];
        else if(lower.indexOf('dismiss')!==-1 || lower.indexOf('fire')!==-1) response = discAiResponses['can i dismiss'];
        else if(lower.indexOf('sign')!==-1 || lower.indexOf('refuse')!==-1) response = discAiResponses['what happens if employee refuses to sign'];
        else if(lower.indexOf('ccma')!==-1 || lower.indexOf('commission')!==-1) response = discAiResponses['ccma'];
        else if(lower.indexOf('union')!==-1 || lower.indexOf('represent')!==-1) response = discAiResponses['union'];
        else if(lower.indexOf('appeal')!==-1) response = discAiResponses['appeal'];
      }
      addDiscAiMsg('bot', response);
    }, 800 + Math.random()*600);
  };

  function sendDiscAiContext(){
    var cat = discFlowState.offenceCategory;
    if(!cat) return;
    var label = DISC_OFFENCE_CATS.find(function(c){return c.val===cat;});
    if(label) addDiscAiMsg('bot','You\'ve selected "'+label.label.split('(')[0].trim()+'". '+(cat==='gross_misconduct'?'This is a very serious category. Under LRA Schedule 8, gross misconduct may warrant immediate suspension and a formal disciplinary hearing, even as a first offence.':cat==='serious_misconduct'?'Serious misconduct typically warrants at least a written warning. Given the severity, review the employee\'s prior history carefully.':'For this category, progressive discipline applies. Start with the appropriate warning level based on prior history.'));
  }

  /* ══════════════════════════════════════════════════════
     CONTRACT DRAFTER (4-Step Wizard + Voice)
     ══════════════════════════════════════════════════════ */
  var contractState = { empId:null, step:0, contractType:'permanent', hours:'08:00 - 17:00', startDate:'', probation:'3 months', voiceTranscript:'', generatedContract:'', requirements:'' };
  var CONTRACT_STEPS = ['Role & Terms','Speak Requirements','Preview Contract','Save & Finalize'];

  window.openContractFlow = function(empId){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===empId;});
    if(!emp) return;
    contractState.empId = empId;
    contractState.step = 0;
    contractState.startDate = emp.startDate || '';
    contractState.voiceTranscript = '';
    contractState.generatedContract = '';
    contractState.requirements = '';

    renderContractSteps();
    renderContractStep();
    loadContractAiChat(emp);
    document.getElementById('contract-flow-overlay').classList.add('open');
  };

  window.closeContractFlow = function(){
    document.getElementById('contract-flow-overlay').classList.remove('open');
    if(window._voiceRecognition) { window._voiceRecognition.stop(); window._voiceRecognition = null; }
  };

  function renderContractSteps(){
    var html = '';
    CONTRACT_STEPS.forEach(function(name,i){
      var cls = i === contractState.step ? 'active' : (i < contractState.step ? 'completed' : '');
      html += '<div class="disc-flow-step '+cls+'" onclick="goContractStep('+i+')">'+
        '<span class="disc-flow-step-num">'+(i < contractState.step ? '&#10003;' : (i+1))+'</span>'+name+'</div>';
    });
    document.getElementById('contract-flow-steps').innerHTML = html;
  }

  window.goContractStep = function(n){
    if(n > contractState.step + 1) return;
    contractState.step = n;
    renderContractSteps();
    renderContractStep();
  };

  function renderContractStep(){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===contractState.empId;});
    if(!emp) return;
    var main = document.getElementById('contract-flow-main');
    var step = contractState.step;

    if(step === 0){
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 1: Role & Employment Terms</h4>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
      html += '<div class="disc-form-group"><div class="disc-form-label">Employee Name</div><input class="disc-form-input" value="'+emp.firstName+' '+emp.lastName+'" readonly style="opacity:.6"></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Job Title</div><input class="disc-form-input" value="'+emp.jobTitle+'" readonly style="opacity:.6"></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Department</div><input class="disc-form-input" value="'+emp.department+'" readonly style="opacity:.6"></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Pay Type</div><input class="disc-form-input" value="'+payTypeLabel(emp.payType)+'" readonly style="opacity:.6"></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Contract Type</div>'+
        '<select class="disc-form-select" id="contract-type" onchange="contractState.contractType=this.value">'+
        '<option value="permanent"'+(contractState.contractType==='permanent'?' selected':'')+'>Permanent</option>'+
        '<option value="fixed-term"'+(contractState.contractType==='fixed-term'?' selected':'')+'>Fixed-Term</option>'+
        '<option value="contractor"'+(contractState.contractType==='contractor'?' selected':'')+'>Independent Contractor</option></select></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Working Hours</div><input class="disc-form-input" id="contract-hours" value="'+contractState.hours+'" onchange="contractState.hours=this.value"></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Start Date</div><input class="disc-form-input" type="date" id="contract-start" value="'+contractState.startDate+'" onchange="contractState.startDate=this.value"></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Probation Period</div>'+
        '<select class="disc-form-select" id="contract-probation" onchange="contractState.probation=this.value">'+
        '<option value="none">None</option><option value="1 month">1 Month</option>'+
        '<option value="3 months" selected>3 Months</option><option value="6 months">6 Months</option></select></div>';
      html += '</div>';
      html += '<div class="disc-btn-row"><button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="goContractStep(1)">Next: Speak Requirements →</button></div>';
      main.innerHTML = html;

    } else if(step === 1){
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 2: Describe Requirements</h4>';
      html += '<div style="font-size:12px;color:#5A7080;margin-bottom:16px;">Use voice or text to describe the role expectations, KPIs, deliverables, and any special conditions. The AI will use this to draft role-specific contract clauses.</div>';
      html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">'+
        '<button class="voice-btn" id="voice-btn" onclick="toggleVoiceInput()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>'+
        '<span style="font-size:12px;color:#5A7080;" id="voice-status">Click the microphone to start speaking</span></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Requirements (Voice transcript or type here)</div>'+
        '<textarea class="disc-form-textarea" id="contract-requirements" style="min-height:140px;" placeholder="e.g., Must achieve monthly sales targets of R500k. Required to manage a team of 3 junior agents. Responsible for client relationship management in the Western Cape region..."'+
        ' onchange="contractState.requirements=this.value">'+contractState.requirements+'</textarea></div>';
      html += '<div class="disc-btn-row"><button class="btn btn-outline" style="font-size:12px;padding:6px 18px;" onclick="goContractStep(0)">← Back</button>'+
        '<button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="contractState.requirements=document.getElementById(\'contract-requirements\').value;goContractStep(2)">Next: Preview Contract →</button></div>';
      main.innerHTML = html;

    } else if(step === 2){
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 3: Contract Preview</h4>';
      if(!contractState.generatedContract){
        html += '<div style="text-align:center;padding:30px;"><button class="btn btn-primary" style="padding:10px 24px;" onclick="generateContract()">Generate Contract</button></div>';
      } else {
        html += '<div class="contract-preview" id="contract-preview">'+contractState.generatedContract+'</div>';
      }
      html += '<div class="disc-btn-row"><button class="btn btn-outline" style="font-size:12px;padding:6px 18px;" onclick="goContractStep(1)">← Back</button>'+
        '<button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="goContractStep(3)">Next: Save & Finalize →</button></div>';
      main.innerHTML = html;

    } else if(step === 3){
      var html = '<h4 style="color:#E4EBF5;margin:0 0 16px;font-size:15px;">Step 4: Save & Finalize</h4>';
      html += '<div style="background:rgba(61,214,140,.08);border:1px solid rgba(61,214,140,.2);border-radius:10px;padding:16px;margin-bottom:16px;">'+
        '<div style="font-size:13px;color:#3DD68C;font-weight:600;margin-bottom:4px;">Contract Ready</div>'+
        '<div style="font-size:12px;color:#94A3B8;">The contract for '+emp.firstName+' '+emp.lastName+' ('+emp.jobTitle+') has been generated. Click Save to add it to the employee\'s documents.</div></div>';
      html += '<div class="disc-form-group"><div class="disc-form-label">Document Name</div><input class="disc-form-input" id="contract-doc-name" value="Employment Contract - '+emp.firstName+' '+emp.lastName+'.pdf"></div>';
      html += '<div class="disc-btn-row"><button class="btn btn-outline" style="font-size:12px;padding:6px 18px;" onclick="goContractStep(2)">← Back</button>'+
        '<button class="btn btn-primary" style="font-size:12px;padding:6px 18px;" onclick="saveContract()">Save Contract</button></div>';
      main.innerHTML = html;
    }
  }

  // Voice Input
  window.toggleVoiceInput = function(){
    var btn = document.getElementById('voice-btn');
    var status = document.getElementById('voice-status');
    if(window._voiceRecognition){
      window._voiceRecognition.stop();
      window._voiceRecognition = null;
      btn.classList.remove('recording');
      status.textContent = 'Click the microphone to start speaking';
      return;
    }
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    var recognition = new SpeechRecognition();
    recognition.lang = 'en-ZA';
    recognition.interimResults = true;
    recognition.continuous = true;
    window._voiceRecognition = recognition;
    btn.classList.add('recording');
    status.textContent = 'Listening... speak now';

    recognition.onresult = function(event){
      var transcript = '';
      for(var i = 0; i < event.results.length; i++){
        transcript += event.results[i][0].transcript;
      }
      var ta = document.getElementById('contract-requirements');
      if(ta) ta.value = transcript;
      contractState.requirements = transcript;
    };
    recognition.onerror = function(e){
      btn.classList.remove('recording');
      status.textContent = 'Error: '+e.error+'. Click mic to retry.';
      window._voiceRecognition = null;
    };
    recognition.onend = function(){
      btn.classList.remove('recording');
      status.textContent = 'Recording stopped. Click mic to record again.';
      window._voiceRecognition = null;
    };
    recognition.start();
  };

  // Generate Contract
  window.generateContract = function(){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===contractState.empId;});
    if(!emp) return;
    var today = new Date().toLocaleDateString('en-ZA',{year:'numeric',month:'long',day:'numeric'});
    var dept = (emp.department||'').toLowerCase();
    var requirements = contractState.requirements || 'Standard duties as per job description.';

    var doc = 'EMPLOYMENT CONTRACT\n\n'+
      '═══════════════════════════════════════════════════\n\n'+
      'Entered into between:\n\n'+
      'EMPLOYER: Novatrai (Pty) Ltd\n'+
      'Registration: 2023/123456/07\n'+
      'Address: 123 Innovation Drive, Stellenbosch, 7600\n\n'+
      'AND\n\n'+
      'EMPLOYEE: '+emp.firstName+' '+emp.lastName+'\n'+
      'ID Number: '+(emp.idNumber||'[To be provided]')+'\n\n'+
      '═══════════════════════════════════════════════════\n\n'+
      '1. COMMENCEMENT AND DURATION\n\n'+
      'This contract commences on '+(contractState.startDate?new Date(contractState.startDate).toLocaleDateString('en-ZA',{year:'numeric',month:'long',day:'numeric'}):'[Date]')+
      ' and is for an '+(contractState.contractType==='fixed-term'?'initial fixed-term period of 12 months':'indefinite period')+
      '.'+(contractState.probation!=='none'?'\n\nThe first '+contractState.probation+' shall constitute a probationary period during which either party may terminate with 1 week\'s notice.':'')+'\n\n'+
      '2. POSITION AND DUTIES\n\n'+
      'Title: '+emp.jobTitle+'\n'+
      'Department: '+emp.department+'\n'+
      'Reporting to: '+(emp.manager||'Direct Manager')+'\n\n'+
      'Key Responsibilities and Requirements:\n'+requirements+'\n\n';

    // Role-specific clauses
    if(dept.indexOf('sales')!==-1){
      doc += '3. SALES-SPECIFIC TERMS\n\n'+
        'a) Commission: As per the company commission structure ('+(emp.commissionPlan||'to be agreed')+')\n'+
        'b) Targets: Monthly and quarterly sales targets will be set and communicated\n'+
        'c) Client Ownership: All client relationships developed during employment remain company property\n'+
        'd) Non-solicitation: Employee may not solicit company clients for 12 months after termination\n\n';
    } else if(dept.indexOf('operations')!==-1 || dept.indexOf('warehouse')!==-1 || dept.indexOf('support')!==-1){
      doc += '3. OPERATIONAL TERMS\n\n'+
        'a) Health & Safety: Employee must comply with all OHS Act requirements\n'+
        'b) Equipment: Company equipment must be maintained and returned upon termination\n'+
        'c) Shift Patterns: Work schedules may include shift work as required by operational needs\n'+
        'd) Safety Training: Employee must complete all required safety training within 30 days\n\n';
    } else if(dept.indexOf('management')!==-1 || dept.indexOf('finance')!==-1){
      doc += '3. MANAGEMENT TERMS\n\n'+
        'a) Reporting Structure: Employee reports to '+(emp.manager||'CEO')+'\n'+
        'b) Delegation: Authority to delegate tasks within the department\n'+
        'c) Performance: Quarterly performance reviews against agreed KPIs\n'+
        'd) Fiduciary Duty: Employee has a fiduciary duty to act in the company\'s best interest\n\n';
    } else {
      doc += '3. ROLE-SPECIFIC TERMS\n\n'+
        'As per the job description and requirements outlined above.\n\n';
    }

    doc += '4. REMUNERATION\n\n'+
      'Basic Salary/Rate: '+(emp.baseSalary?'R '+emp.baseSalary.toLocaleString()+' per month':emp.hourlyRate?'R '+emp.hourlyRate+' per hour':'As agreed')+'\n'+
      'Payment Frequency: '+payTypeLabel(emp.payFrequency||emp.payType)+'\n'+
      (emp.commissionPlan?'Commission: '+emp.commissionPlan+'\n':'')+
      'Payment Method: Direct deposit to employee\'s designated bank account\n\n'+
      '5. WORKING HOURS\n\n'+
      'Normal working hours: '+contractState.hours+', Monday to Friday\n'+
      'As per the Basic Conditions of Employment Act (BCEA), maximum 45 hours per week.\n'+
      'Overtime will be compensated at 1.5x the normal rate.\n\n'+
      '6. LEAVE\n\n'+
      'Annual Leave: 15 working days per annum (BCEA minimum)\n'+
      'Sick Leave: 30 days over a 3-year cycle (BCEA)\n'+
      'Family Responsibility Leave: 3 days per annum\n'+
      'Maternity Leave: 4 consecutive months (unpaid, UIF applicable)\n\n'+
      '7. CONFIDENTIALITY\n\n'+
      'Employee shall not disclose any proprietary information, trade secrets, client data, or business strategies during or after employment. Breach of confidentiality may result in disciplinary action and/or legal proceedings.\n\n'+
      '8. INTELLECTUAL PROPERTY\n\n'+
      'All work product, inventions, and intellectual property created during employment shall be the sole property of the Employer.\n\n'+
      '9. TERMINATION\n\n'+
      'Notice Period: '+(contractState.contractType==='contractor'?'30 days':'1 calendar month')+' written notice by either party\n'+
      'Summary Dismissal: For gross misconduct as defined in the LRA Schedule 8\n'+
      'Retrenchment: In accordance with Section 189 of the LRA\n\n'+
      '10. DISPUTE RESOLUTION\n\n'+
      'Any disputes arising from this contract shall be resolved through the CCMA (Commission for Conciliation, Mediation and Arbitration) in accordance with the Labour Relations Act 66 of 1995.\n\n'+
      '═══════════════════════════════════════════════════\n\n'+
      'SIGNED at __________________ on this ____ day of _________ 20____\n\n'+
      '_______________________          _______________________\n'+
      'Employee                              Employer Representative\n'+
      emp.firstName+' '+emp.lastName+'                     For Novatrai (Pty) Ltd\n\n'+
      '_______________________\n'+
      'Witness';

    // Typing animation
    contractState.generatedContract = '';
    var preview = document.getElementById('contract-preview');
    if(!preview){ contractState.generatedContract = doc; renderContractStep(); return; }
    var idx = 0;
    var timer = setInterval(function(){
      if(idx >= doc.length){ clearInterval(timer); contractState.generatedContract = doc; return; }
      var chunk = doc.substring(idx, Math.min(idx+12, doc.length));
      contractState.generatedContract += chunk;
      preview.textContent = contractState.generatedContract;
      idx += 12;
    }, 8);

    addContractAiMsg('bot','I\'ve generated a comprehensive employment contract for '+emp.firstName+' based on their role as '+emp.jobTitle+' in '+emp.department+'. The contract includes South African labour law requirements (BCEA, LRA) and role-specific clauses. Please review before saving.');
  };

  window.saveContract = function(){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===contractState.empId;});
    if(!emp) return;
    var docName = document.getElementById('contract-doc-name').value || 'Employment Contract.pdf';
    if(!emp.documents) emp.documents = [];
    emp.documents.push({name:docName, size:'~45 KB', date:new Date().toISOString().split('T')[0]});
    emp.auditLog.push({event:'contract.generated',date:new Date().toISOString().split('T')[0],by:'Current User',detail:'Employment contract generated and saved: '+docName});
    closeContractFlow();
    renderDocumentsTab(emp);
    renderAuditTab(emp);
  };

  // Contract AI Chat
  function loadContractAiChat(emp){
    var msgs = document.getElementById('contract-ai-msgs');
    msgs.innerHTML = '';
    addContractAiMsg('bot','Hello! I\'m your AI Contract Assistant. I\'ll help you draft an employment contract for '+emp.firstName+' '+emp.lastName+' ('+emp.jobTitle+', '+emp.department+').\n\nI\'ll include all required South African labour law clauses (BCEA, LRA) and tailor the contract to the specific role. You can use voice input in Step 2 to describe your requirements.\n\nLet\'s get started!', true);
  }

  function addContractAiMsg(role, text, skipScroll){
    var msgs = document.getElementById('contract-ai-msgs');
    if(!msgs) return;
    var div = document.createElement('div');
    div.className = 'disc-ai-msg '+(role==='bot'?'bot':'user');
    div.textContent = text;
    msgs.appendChild(div);
    if(!skipScroll) msgs.scrollTop = msgs.scrollHeight;
  }

  window.sendContractAiMsg = function(){
    var input = document.getElementById('contract-ai-input');
    var msg = input.value.trim();
    if(!msg) return;
    input.value = '';
    addContractAiMsg('user', msg);

    var msgs = document.getElementById('contract-ai-msgs');
    var typing = document.createElement('div');
    typing.className = 'disc-ai-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(function(){
      typing.remove();
      var lower = msg.toLowerCase();
      var response = 'I can help with contract clauses, employment terms, and SA labour law requirements. What specific aspect would you like to discuss?';
      if(lower.indexOf('probation')!==-1) response = 'Under SA law, probation allows both parties to assess suitability. During probation, shorter notice periods apply (typically 1 week). The employer must still follow fair procedures before terminating during probation — you must counsel the employee and give them a chance to improve.';
      else if(lower.indexOf('leave')!==-1) response = 'The BCEA prescribes minimum leave: 15 days annual leave, 30 days sick leave per 3-year cycle, 3 days family responsibility leave, and 4 months maternity leave. You can offer more than the minimum but never less.';
      else if(lower.indexOf('notice')!==-1) response = 'Notice periods under BCEA: 1 week during first 6 months, 2 weeks for 6-12 months, 4 weeks after 1 year. You can agree on longer periods in the contract but not shorter ones.';
      else if(lower.indexOf('restraint')!==-1 || lower.indexOf('non-compete')!==-1) response = 'Restraint of trade clauses are enforceable in SA but must be reasonable in scope, duration, and geographic area. Courts will consider whether the restraint protects a legitimate business interest and whether it\'s proportionate.';
      else if(lower.indexOf('commission')!==-1) response = 'Commission structures should be clearly defined in the contract: calculation method, payment timing, what happens to pipeline deals on termination, and any clawback provisions. Be specific about targets and thresholds.';
      else if(lower.indexOf('overtime')!==-1) response = 'Under BCEA, overtime is voluntary and limited to 10 hours per week. It must be paid at 1.5x the normal rate (2x on Sundays/public holidays). Employees earning above the BCEA threshold may agree to different arrangements.';
      addContractAiMsg('bot', response);
    }, 800 + Math.random()*600);
  };

  /* ══════════════════════════════════════════════════════
     DOCUMENT VIEWER
     ══════════════════════════════════════════════════════ */
  var _currentDocEmpId = null;
  var _currentDocIdx = null;

  window.openDocViewer = function(empId, docIdx){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===empId;});
    if(!emp) return;
    var docs = emp.documents||[];
    var doc = docs[docIdx];
    if(!doc) return;
    _currentDocEmpId = empId;
    _currentDocIdx = docIdx;

    document.getElementById('doc-viewer-title').textContent = doc.name;

    // If doc has generated content, use it
    var body = document.getElementById('doc-viewer-body');
    var content = generateDocContent(emp, doc);
    body.innerHTML = '<div class="doc-viewer-page">'+content+'</div>';
    document.getElementById('doc-viewer-overlay').classList.add('open');

    // Audit log
    emp.auditLog.push({event:'document.viewed',date:new Date().toISOString().split('T')[0],by:'Current User',detail:'Viewed document: '+doc.name});
  };

  // ═══ Company File Viewer ═══
  window.openCompanyFileViewer = function(fileName){
    document.getElementById('doc-viewer-title').textContent = fileName;
    var body = document.getElementById('doc-viewer-body');
    var content = generateCompanyFileContent(fileName);
    body.innerHTML = '<div class="doc-viewer-page">' + content + '</div>';
    document.getElementById('doc-viewer-overlay').classList.add('open');
  };

  function generateCompanyFileContent(fileName){
    var name = fileName.toLowerCase();
    var header = '<div class="doc-logo"><div class="doc-logo-name">NOVATRAI</div><div class="doc-logo-sub">People · Payroll · Performance</div></div>';
    var company = 'Legal Clear';
    var regNo = '2018/123456/07';
    var addr = 'Suite 4, 18 Buitenkant St, Cape Town, 8001';

    if(name.indexOf('articles_of_incorporation')!==-1){
      return header+
        '<h1>ARTICLES OF INCORPORATION</h1>'+
        '<p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:24px;">Republic of South Africa — Companies Act 71 of 2008</p>'+
        '<table class="doc-meta-table">'+
        '<tr><td>Company Name</td><td>'+company+' (Pty) Ltd</td></tr>'+
        '<tr><td>Registration No.</td><td>'+regNo+'</td></tr>'+
        '<tr><td>Date of Incorporation</td><td>15 March 2018</td></tr>'+
        '<tr><td>Registered Address</td><td>'+addr+'</td></tr>'+
        '<tr><td>Type</td><td>Private Company (Pty) Ltd</td></tr>'+
        '<tr><td>Financial Year End</td><td>28 February</td></tr>'+
        '</table>'+
        '<h2>1. Name and Nature</h2>'+
        '<p>The company shall be known as <strong>Legal Clear (Pty) Ltd</strong>, a private company incorporated under the Companies Act 71 of 2008 of the Republic of South Africa.</p>'+
        '<h2>2. Main Business</h2>'+
        '<p>The principal business of the company is the provision of legal compliance services, regulatory advisory, and corporate governance solutions to businesses operating within South Africa.</p>'+
        '<h2>3. Directors</h2>'+
        '<ul><li><strong>James Botha</strong> — Chief Executive Officer (appointed 15 March 2018)</li>'+
        '<li><strong>Sarah van der Merwe</strong> — Chief Financial Officer (appointed 1 June 2019)</li>'+
        '<li><strong>Nomvula Mahlangu</strong> — Head of Compliance (appointed 10 January 2022)</li></ul>'+
        '<h2>4. Share Capital</h2>'+
        '<p>The authorized share capital consists of 1,000 ordinary shares at no par value. All shares are currently held by the founding directors.</p>'+
        '<h2>5. Powers of the Company</h2>'+
        '<p>The company has all the powers of a natural person, subject to the provisions of the Companies Act and any other applicable legislation.</p>'+
        '<h2>6. Amendment</h2>'+
        '<p>These articles may be amended by special resolution of the shareholders in accordance with section 16 of the Companies Act.</p>'+
        '<div style="margin-top:30px;"><p><strong>CERTIFIED CORRECT</strong></p>'+
        '<p>Companies and Intellectual Property Commission (CIPC)</p>'+
        '<p>Date of Filing: 23 February 2026</p></div>'+
        '<div class="doc-viewer-watermark">Official CIPC document. Verify at www.cipc.co.za</div>';

    } else if(name.indexOf('client_agreement')!==-1){
      return header+
        '<h1>CLIENT SERVICE AGREEMENT</h1>'+
        '<p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:24px;">Version 3.0 — Effective 21 February 2026</p>'+
        '<table class="doc-meta-table">'+
        '<tr><td>Service Provider</td><td>Novatrai Business Operating System (Pty) Ltd</td></tr>'+
        '<tr><td>Client</td><td>'+company+' (Pty) Ltd</td></tr>'+
        '<tr><td>Client Registration</td><td>'+regNo+'</td></tr>'+
        '<tr><td>Effective Date</td><td>21 February 2026</td></tr>'+
        '<tr><td>Contract Duration</td><td>12 months (auto-renewal)</td></tr>'+
        '<tr><td>Primary Contact</td><td>James Botha (CEO)</td></tr>'+
        '</table>'+
        '<h2>1. Scope of Services</h2>'+
        '<p>Novatrai shall provide the Client with access to the Novatrai Business Operating System platform, including:</p>'+
        '<ul><li>People management and HR administration</li><li>Payroll processing and tax compliance</li><li>Client relationship management (CRM)</li><li>Document management and workflow automation</li><li>Financial reporting and invoice management</li></ul>'+
        '<h2>2. Service Level Agreement</h2>'+
        '<p>Novatrai guarantees 99.5% platform uptime, measured on a monthly basis. Support response times: Critical issues within 2 hours, Standard issues within 8 business hours.</p>'+
        '<h2>3. Fees and Payment</h2>'+
        '<p>Monthly subscription fee: <strong>R 4,500.00</strong> (excl. VAT), payable by the 1st of each month. Late payments attract interest at the prescribed rate under the National Credit Act.</p>'+
        '<h2>4. Data Protection</h2>'+
        '<p>Both parties agree to comply with the Protection of Personal Information Act 4 of 2013 (POPIA). Novatrai acts as an Operator processing personal information on behalf of the Client as Responsible Party.</p>'+
        '<h2>5. Confidentiality</h2>'+
        '<p>Each party shall keep confidential all information received from the other party and shall not disclose such information without prior written consent.</p>'+
        '<h2>6. Termination</h2>'+
        '<p>Either party may terminate this agreement by providing 30 days written notice. Novatrai may suspend services immediately in the event of non-payment exceeding 14 days.</p>'+
        '<div style="margin-top:30px;">'+
        '<p>Service Provider: <span class="doc-sig-line"></span> Date: <span class="doc-sig-line" style="width:120px;"></span></p>'+
        '<p style="margin-top:16px;">Client: <span class="doc-sig-line"></span> Date: <span class="doc-sig-line" style="width:120px;"></span></p></div>'+
        '<div class="doc-viewer-watermark">Generated by Novatrai BOS. Printed copies are uncontrolled.</div>';

    } else if(name.indexOf('kyc_checklist')!==-1){
      return header+
        '<h1>KYC COMPLIANCE CHECKLIST</h1>'+
        '<p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:24px;">Q1 2026 — FICA / POPIA Compliance Review</p>'+
        '<table class="doc-meta-table">'+
        '<tr><td>Client</td><td>'+company+' (Pty) Ltd</td></tr>'+
        '<tr><td>Registration No.</td><td>'+regNo+'</td></tr>'+
        '<tr><td>Review Period</td><td>January — March 2026</td></tr>'+
        '<tr><td>Prepared By</td><td>Kirill</td></tr>'+
        '<tr><td>Review Date</td><td>19 February 2026</td></tr>'+
        '</table>'+
        '<h2>Identity Verification</h2>'+
        '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">'+
        '<tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;border:1px solid #e2e8f0;">Document</th><th style="padding:8px;text-align:left;border:1px solid #e2e8f0;">Status</th><th style="padding:8px;text-align:left;border:1px solid #e2e8f0;">Date Received</th></tr>'+
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;">Certified ID — James Botha</td><td style="padding:8px;border:1px solid #e2e8f0;color:green;">&#10003; Verified</td><td style="padding:8px;border:1px solid #e2e8f0;">12 Jan 2026</td></tr>'+
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;">Certified ID — Sarah van der Merwe</td><td style="padding:8px;border:1px solid #e2e8f0;color:green;">&#10003; Verified</td><td style="padding:8px;border:1px solid #e2e8f0;">14 Jan 2026</td></tr>'+
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;">Proof of Address — Company</td><td style="padding:8px;border:1px solid #e2e8f0;color:green;">&#10003; Verified</td><td style="padding:8px;border:1px solid #e2e8f0;">15 Jan 2026</td></tr>'+
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;">CIPC Registration Certificate</td><td style="padding:8px;border:1px solid #e2e8f0;color:green;">&#10003; Verified</td><td style="padding:8px;border:1px solid #e2e8f0;">15 Jan 2026</td></tr>'+
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;">Tax Clearance Certificate</td><td style="padding:8px;border:1px solid #e2e8f0;color:orange;">&#9888; Pending renewal</td><td style="padding:8px;border:1px solid #e2e8f0;">Expires Mar 2026</td></tr>'+
        '<tr><td style="padding:8px;border:1px solid #e2e8f0;">BEE Certificate</td><td style="padding:8px;border:1px solid #e2e8f0;color:green;">&#10003; Level 2</td><td style="padding:8px;border:1px solid #e2e8f0;">8 Feb 2026</td></tr>'+
        '</table>'+
        '<h2>Risk Assessment</h2>'+
        '<p><strong>Overall Risk Rating:</strong> <span style="color:green;font-weight:700;">LOW</span></p>'+
        '<p>Client operates in the legal services sector with no adverse media findings. All directors passed sanctions screening.</p>'+
        '<div class="doc-viewer-watermark">Compliance checklist for internal use only.</div>';

    } else if(name.indexOf('tax_certificate')!==-1){
      return header+
        '<h1>TAX CLEARANCE CERTIFICATE</h1>'+
        '<p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:24px;">South African Revenue Service</p>'+
        '<table class="doc-meta-table">'+
        '<tr><td>Taxpayer</td><td>'+company+' (Pty) Ltd</td></tr>'+
        '<tr><td>Tax Reference No.</td><td>9012345678</td></tr>'+
        '<tr><td>Registration No.</td><td>'+regNo+'</td></tr>'+
        '<tr><td>VAT Number</td><td>4012345678</td></tr>'+
        '<tr><td>Issue Date</td><td>14 February 2026</td></tr>'+
        '<tr><td>Expiry Date</td><td>13 February 2027</td></tr>'+
        '</table>'+
        '<div style="text-align:center;margin:30px 0;padding:20px;border:2px solid green;border-radius:8px;">'+
        '<p style="font-size:18px;font-weight:700;color:green;margin:0;">TAX COMPLIANT</p>'+
        '<p style="font-size:12px;color:#64748b;margin:8px 0 0;">This certificate confirms that the taxpayer\'s tax affairs are in order.</p>'+
        '</div>'+
        '<h2>Taxes Registered</h2>'+
        '<ul><li>Income Tax — Compliant</li><li>Value Added Tax (VAT) — Compliant</li><li>Pay As You Earn (PAYE) — Compliant</li><li>Skills Development Levy (SDL) — Compliant</li><li>Unemployment Insurance Fund (UIF) — Compliant</li></ul>'+
        '<h2>Verification</h2>'+
        '<p>This certificate can be verified online at <strong>www.sars.gov.za</strong> using the Tax Reference Number and PIN provided separately.</p>'+
        '<p style="margin-top:20px;font-size:11px;color:#64748b;">This certificate is issued in terms of section 256 of the Tax Administration Act 28 of 2011.</p>'+
        '<div class="doc-viewer-watermark">SARS Tax Clearance Certificate. Verify at www.sars.gov.za</div>';

    } else if(name.indexOf('company_stamp')!==-1){
      return header+
        '<h1>COMPANY STAMP / SEAL</h1>'+
        '<p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:24px;">Scanned Document</p>'+
        '<div style="text-align:center;padding:40px;margin:20px 0;">'+
        '<div style="display:inline-block;width:200px;height:200px;border:3px solid #1a2332;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:20px;">'+
        '<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:#64748b;margin-bottom:4px;">LEGAL CLEAR</div>'+
        '<div style="font-size:7px;color:#94a3b8;">(PTY) LTD</div>'+
        '<div style="width:60%;height:1px;background:#cbd5e1;margin:8px 0;"></div>'+
        '<div style="font-size:8px;color:#64748b;">Reg: '+regNo+'</div>'+
        '<div style="font-size:7px;color:#94a3b8;margin-top:2px;">Cape Town, South Africa</div>'+
        '</div></div>'+
        '<table class="doc-meta-table">'+
        '<tr><td>File Type</td><td>PNG (Scanned Image)</td></tr>'+
        '<tr><td>Resolution</td><td>300 DPI</td></tr>'+
        '<tr><td>Scanned By</td><td>Kirill</td></tr>'+
        '<tr><td>Date Scanned</td><td>10 February 2026</td></tr>'+
        '</table>'+
        '<div class="doc-viewer-watermark">Digital scan for reference only. Use original stamp for official documents.</div>';

    } else {
      return header+
        '<h1>'+fileName.replace(/\.[^/.]+$/,'').replace(/_/g,' ')+'</h1>'+
        '<p style="text-align:center;color:#64748b;margin-top:40px;">Document preview for <strong>'+fileName+'</strong></p>'+
        '<p style="text-align:center;color:#94a3b8;font-size:12px;">This document is stored in the '+company+' workspace.</p>';
    }
  }

  window.closeDocViewer = function(){
    document.getElementById('doc-viewer-overlay').classList.remove('open');
  };

  window.printDocument = function(){
    var body = document.getElementById('doc-viewer-body');
    var win = window.open('','_blank','width=800,height=1000');
    win.document.write('<html><head><title>Print Document</title><style>body{font-family:Georgia,serif;padding:40px 60px;color:#1e293b;font-size:13px;line-height:1.8;}h1{font-size:18px;text-align:center;letter-spacing:1px;}h2{font-size:14px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:20px;}table{width:100%;border-collapse:collapse;margin:12px 0;font-size:12px;}td{padding:4px 8px;border:1px solid #ddd;}td:first-child{font-weight:600;width:140px;background:#f8f8f8;}.doc-logo-name{font-size:22px;font-weight:bold;letter-spacing:2px;}.doc-logo-sub{font-size:10px;color:#666;letter-spacing:1px;text-transform:uppercase;}.doc-sig-line{display:inline-block;width:200px;border-bottom:1px solid #000;margin:0 8px;}.doc-watermark{display:none;}</style></head><body>');
    win.document.write(body.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  window.downloadDocument = function(){
    var emp = (window.EMPLOYEES_DATA||[]).find(function(e){return e.id===_currentDocEmpId;});
    if(!emp) return;
    var doc = (emp.documents||[])[_currentDocIdx];
    if(!doc) return;
    var body = document.getElementById('doc-viewer-body');
    var blob = new Blob([body.innerText], {type:'text/plain'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = doc.name.replace('.pdf','.txt');
    a.click();
    URL.revokeObjectURL(url);
  };

  function generateDocContent(emp, doc){
    var name = doc.name.toLowerCase();
    var fullName = emp.firstName+' '+emp.lastName;
    var startDate = emp.startDate ? new Date(emp.startDate).toLocaleDateString('en-ZA',{year:'numeric',month:'long',day:'numeric'}) : '—';

    var header = '<div class="doc-logo"><div class="doc-logo-name">NOVATRAI</div><div class="doc-logo-sub">People · Payroll · Performance</div></div>';

    // If doc has savedContent (generated contract), use it
    if(doc.savedContent){
      return header+'<div style="white-space:pre-wrap;">'+doc.savedContent+'</div>';
    }

    if(name.indexOf('employment contract')!==-1){
      return header+
        '<h1>EMPLOYMENT CONTRACT</h1>'+
        '<p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:24px;">Confidential</p>'+
        '<table class="doc-meta-table">'+
        '<tr><td>Employee</td><td>'+fullName+'</td></tr>'+
        '<tr><td>ID Number</td><td>'+(emp.idNumber||'—')+'</td></tr>'+
        '<tr><td>Position</td><td>'+emp.jobTitle+'</td></tr>'+
        '<tr><td>Department</td><td>'+emp.department+'</td></tr>'+
        '<tr><td>Start Date</td><td>'+startDate+'</td></tr>'+
        '<tr><td>Reporting To</td><td>'+(emp.manager||'—')+'</td></tr>'+
        '<tr><td>Contract Type</td><td>Permanent</td></tr>'+
        '</table>'+
        '<h2>1. Commencement</h2>'+
        '<p>This agreement commences on '+startDate+' and shall continue indefinitely, subject to the terms of termination set out herein. The first 3 months shall serve as a probationary period.</p>'+
        '<h2>2. Position and Duties</h2>'+
        '<p>The Employee is employed in the position of <strong>'+emp.jobTitle+'</strong> in the <strong>'+emp.department+'</strong> department, reporting to <strong>'+(emp.manager||'Direct Manager')+'</strong>.</p>'+
        '<p>The Employee shall perform all duties reasonably associated with this position and any other duties as may be assigned from time to time.</p>'+
        '<h2>3. Remuneration</h2>'+
        '<p>The Employee shall receive:</p>'+
        '<ul>'+
        '<li>'+(emp.baseSalary?'Basic salary of <strong>R '+emp.baseSalary.toLocaleString()+'</strong> per month':emp.hourlyRate?'Hourly rate of <strong>R '+emp.hourlyRate+'</strong> per hour':'Remuneration as agreed')+'</li>'+
        (emp.commissionPlan?'<li>Commission: '+emp.commissionPlan+'</li>':'')+
        '<li>Payment by direct deposit on the '+(emp.payFrequency==='monthly'||emp.payType==='salary'?'25th of each month':'14th and 28th of each month')+'</li>'+
        '</ul>'+
        '<h2>4. Working Hours</h2>'+
        '<p>Normal working hours are 08:00 to 17:00, Monday to Friday (45 hours per week maximum as per the BCEA). Overtime shall be compensated at 1.5 times the normal rate.</p>'+
        '<h2>5. Leave Entitlements</h2>'+
        '<ul>'+
        '<li>Annual leave: 15 working days per annum</li>'+
        '<li>Sick leave: 30 days per 3-year cycle</li>'+
        '<li>Family responsibility leave: 3 days per annum</li>'+
        '<li>Maternity leave: 4 consecutive months</li>'+
        '</ul>'+
        '<h2>6. Confidentiality</h2>'+
        '<p>The Employee shall not disclose any confidential information, trade secrets, or proprietary data of the Employer during or after the term of employment.</p>'+
        '<h2>7. Termination</h2>'+
        '<p>Either party may terminate this agreement by providing one calendar month\'s written notice. The Employer may terminate for cause in accordance with the Labour Relations Act 66 of 1995.</p>'+
        '<h2>8. Governing Law</h2>'+
        '<p>This contract is governed by the laws of the Republic of South Africa, including the Basic Conditions of Employment Act 75 of 1997 and the Labour Relations Act 66 of 1995.</p>'+
        '<div style="margin-top:30px;">'+
        '<p><strong>SIGNED</strong> at __________________ on this ______ day of _____________ 20____</p>'+
        '<p style="margin-top:24px;">Employee: <span class="doc-sig-line"></span> Date: <span class="doc-sig-line" style="width:120px;"></span></p>'+
        '<p style="margin-top:16px;">Employer: <span class="doc-sig-line"></span> Date: <span class="doc-sig-line" style="width:120px;"></span></p>'+
        '<p style="margin-top:16px;">Witness: <span class="doc-sig-line"></span> Date: <span class="doc-sig-line" style="width:120px;"></span></p>'+
        '</div>'+
        '<div class="doc-viewer-watermark">This document was generated by Novatrai BOS. Printed copies are uncontrolled.</div>';

    } else if(name.indexOf('suspension')!==-1){
      var suspDate = doc.date ? new Date(doc.date).toLocaleDateString('en-ZA',{year:'numeric',month:'long',day:'numeric'}) : 'the date shown above';
      return header+
        '<h1>NOTICE OF SUSPENSION</h1>'+
        '<p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:24px;">Confidential — HR Use Only</p>'+
        '<table class="doc-meta-table">'+
        '<tr><td>Employee</td><td>'+fullName+'</td></tr>'+
        '<tr><td>Employee ID</td><td>'+emp.id+'</td></tr>'+
        '<tr><td>Position</td><td>'+emp.jobTitle+'</td></tr>'+
        '<tr><td>Department</td><td>'+emp.department+'</td></tr>'+
        '<tr><td>Date of Notice</td><td>'+suspDate+'</td></tr>'+
        '<tr><td>Suspension Type</td><td>Precautionary (with pay)</td></tr>'+
        '</table>'+
        '<h2>Notice</h2>'+
        '<p>Dear '+emp.firstName+',</p>'+
        '<p>You are hereby notified that you have been placed on <strong>precautionary suspension with immediate effect</strong>, pending the outcome of a disciplinary investigation.</p>'+
        '<h2>Reason for Suspension</h2>'+
        '<p>The Company has reason to believe that you may have been involved in conduct that warrants a formal investigation. Specifically:</p>'+
        '<ul>'+
        '<li>Allegations of unauthorized access to confidential company systems and client databases</li>'+
        '<li>Potential breach of the Company\'s IT Security Policy and Data Protection Policy</li>'+
        '</ul>'+
        '<p>This suspension is precautionary in nature and does not constitute a finding of guilt. It is intended to protect the integrity of the investigation.</p>'+
        '<h2>Terms of Suspension</h2>'+
        '<ul>'+
        '<li>You will continue to receive your full remuneration during the suspension period</li>'+
        '<li>You are not to enter company premises without prior written permission from HR</li>'+
        '<li>You must return all company property, including laptop, access cards, and keys</li>'+
        '<li>All remote access credentials have been temporarily revoked</li>'+
        '<li>You must remain available and contactable during normal business hours</li>'+
        '<li>You are not to contact colleagues regarding the matter under investigation</li>'+
        '<li>You are not to destroy, delete, or tamper with any potential evidence</li>'+
        '</ul>'+
        '<h2>Your Rights</h2>'+
        '<p>In terms of the Labour Relations Act 66 of 1995 and Schedule 8 (Code of Good Practice: Dismissal), you have the right to:</p>'+
        '<ul>'+
        '<li>Be informed of the allegations against you</li>'+
        '<li>Be given a reasonable opportunity to respond</li>'+
        '<li>Be represented by a trade union representative or fellow employee at any hearing</li>'+
        '<li>Appeal any outcome of the disciplinary process</li>'+
        '</ul>'+
        '<p>You will be notified in writing of any further steps, including any disciplinary hearing that may be scheduled.</p>'+
        '<h2>Contact</h2>'+
        '<p>Should you have any questions or require clarification, please contact the HR Department at <strong>hr@novatrai.co.za</strong>.</p>'+
        '<div style="margin-top:30px;">'+
        '<p>Yours sincerely,</p>'+
        '<p style="margin-top:20px;"><strong>Fritz Erasmus</strong><br>Managing Director<br>Novatrai (Pty) Ltd</p>'+
        '<p style="margin-top:24px;">Acknowledged by Employee: <span class="doc-sig-line"></span></p>'+
        '<p>Date: <span class="doc-sig-line" style="width:120px;"></span></p>'+
        '</div>'+
        '<div class="doc-viewer-watermark">This document was generated by Novatrai BOS. Printed copies are uncontrolled.</div>';

    } else if(name.indexOf('warning')!==-1){
      return header+
        '<h1>DISCIPLINARY WARNING</h1>'+
        '<p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:24px;">Confidential</p>'+
        '<table class="doc-meta-table">'+
        '<tr><td>Employee</td><td>'+fullName+'</td></tr>'+
        '<tr><td>Position</td><td>'+emp.jobTitle+'</td></tr>'+
        '<tr><td>Date Issued</td><td>'+(doc.date?new Date(doc.date).toLocaleDateString('en-ZA',{year:'numeric',month:'long',day:'numeric'}):'—')+'</td></tr>'+
        '<tr><td>Warning Type</td><td>Written Warning</td></tr>'+
        '<tr><td>Valid For</td><td>6 months from date of issue</td></tr>'+
        '</table>'+
        '<h2>Details of Offence</h2>'+
        '<p>Details of the offence are as recorded in the disciplinary record.</p>'+
        '<h2>Corrective Action Required</h2>'+
        '<p>The Employee is required to immediately rectify their conduct. Failure to comply may result in further disciplinary action up to and including dismissal.</p>'+
        '<div style="margin-top:30px;">'+
        '<p>Employee: <span class="doc-sig-line"></span> Date: <span class="doc-sig-line" style="width:120px;"></span></p>'+
        '<p style="margin-top:16px;">Manager: <span class="doc-sig-line"></span> Date: <span class="doc-sig-line" style="width:120px;"></span></p>'+
        '</div>'+
        '<div class="doc-viewer-watermark">This document was generated by Novatrai BOS. Printed copies are uncontrolled.</div>';

    } else {
      // Generic document
      return header+
        '<h1>'+doc.name.replace('.pdf','').toUpperCase()+'</h1>'+
        '<table class="doc-meta-table">'+
        '<tr><td>Employee</td><td>'+fullName+'</td></tr>'+
        '<tr><td>Document</td><td>'+doc.name+'</td></tr>'+
        '<tr><td>Size</td><td>'+doc.size+'</td></tr>'+
        '<tr><td>Uploaded</td><td>'+formatDate(doc.date)+'</td></tr>'+
        '</table>'+
        '<p style="margin-top:24px;color:#64748b;">This document is on file for '+fullName+'. The original document content is stored securely in the document management system.</p>'+
        '<div class="doc-viewer-watermark">This document was generated by Novatrai BOS. Printed copies are uncontrolled.</div>';
    }
  }

  /* ── Pay Structures ── */
  window.renderPayStructures = function(){
    var data = window.PAY_STRUCTURES_DATA||[];
    var body = document.getElementById('ps-rows-body');
    if(!body) return;
    body.innerHTML = data.map(function(ps){
      var base = ps.type==='salary'||ps.type==='hybrid' ? formatSalary(ps.baseSalary) : ps.type==='hourly' ? 'R '+ps.hourlyRate+'/hr' : '—';
      if(ps.commissionPlan && (ps.type==='commission'||ps.type==='hybrid')){ if(base==='—') base=ps.commissionPlan; else base+=' + '+ps.commissionPlan; }
      return '<div class="ps-row">'+
        '<div style="font-weight:600;color:#E4EBF5;">'+ps.name+'</div>'+
        '<div><span class="ppl-pay-badge '+payTypeCls(ps.type)+'">'+payTypeLabel(ps.type)+'</span></div>'+
        '<div>'+base+'</div>'+
        '<div>'+(ps.frequency.charAt(0).toUpperCase()+ps.frequency.slice(1))+'</div>'+
        '<div>'+ps.employees.length+'</div>'+
        '<div class="ppl-actions" style="opacity:1"><button class="ppl-action-btn" title="Edit" onclick="openPayStructureModal(\''+ps.id+'\')"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button></div>'+
      '</div>';
    }).join('');
  };

  /* ── Modals ── */
  window.openAddEmployeeModal = function(){ document.getElementById('add-employee-overlay').classList.add('open'); };
  window.closeAddEmployeeModal = function(){ document.getElementById('add-employee-overlay').classList.remove('open'); };
  window.openPayStructureModal = function(id){ document.getElementById('pay-structure-overlay').classList.add('open'); };
  window.closePayStructureModal = function(){ document.getElementById('pay-structure-overlay').classList.remove('open'); };

  window.submitAddEmployee = function(){
    var first=document.getElementById('emp-add-first').value.trim();
    var last=document.getElementById('emp-add-last').value.trim();
    if(!first||!last){ alert('First and last name are required.'); return; }
    var emp={
      id:'EMP-'+String(getData().length+1).padStart(3,'0'),
      firstName:first, lastName:last,
      email:document.getElementById('emp-add-email').value.trim(),
      phone:document.getElementById('emp-add-phone').value.trim(),
      jobTitle:document.getElementById('emp-add-title').value.trim(),
      department:document.getElementById('emp-add-dept').value,
      manager:document.getElementById('emp-add-manager').value.trim(),
      startDate:document.getElementById('emp-add-start').value||new Date().toISOString().split('T')[0],
      status:'active',
      payType:document.getElementById('emp-add-paytype').value,
      baseSalary:null, hourlyRate:null, commissionPlan:null,
      payFrequency:document.getElementById('emp-add-freq').value,
      lastPaid:null, nextPay:null,
      bankName:'', branchCode:'', accountNumber:'', accountHolder:first+' '+last,
      idNumber:'',
      nextOfKin:{name:'',relation:'',phone:''},
      notes:[], documents:[],
      auditLog:[{event:'employee.created',date:new Date().toISOString(),by:'Current User',detail:'Employee record created'}],
      advances:[], bonuses:[], salaryHistory:[], bankHistory:[],
      payslipDelivery:{
        email:document.getElementById('emp-add-del-email').checked,
        whatsapp:document.getElementById('emp-add-del-whatsapp').checked,
        print:document.getElementById('emp-add-del-print').checked
      }
    };
    if(emp.payType==='salary'||emp.payType==='hybrid') emp.baseSalary=0;
    if(emp.payType==='hourly') emp.hourlyRate=0;
    window.EMPLOYEES_DATA.push(emp);
    closeAddEmployeeModal();
    renderEmployees();
    if(window.showToast) showToast('Employee '+first+' '+last+' added');
  };

  /* ── Payroll Action Modals ── */
  var activeModalEmpId=null;

  window.openAdvanceModal=function(empId){
    activeModalEmpId=empId;
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    document.getElementById('adv-emp-name').textContent=emp.firstName+' '+emp.lastName+' ('+emp.id+')';
    document.getElementById('adv-amount').value='';
    document.getElementById('adv-method').value='next';
    document.getElementById('adv-months').value='';
    document.getElementById('adv-interest').value='0';
    document.getElementById('adv-note').value='';
    document.getElementById('adv-spread-row').style.display='none';
    document.getElementById('advance-overlay').classList.add('open');
  };
  window.closeAdvanceModal=function(){ document.getElementById('advance-overlay').classList.remove('open'); activeModalEmpId=null; };
  window.toggleAdvMonths=function(){
    document.getElementById('adv-spread-row').style.display=document.getElementById('adv-method').value==='spread'?'':'none';
  };

  window.submitAdvance=function(){
    var emp=getData().find(function(e){return e.id===activeModalEmpId;});
    if(!emp) return;
    var amount=parseFloat(document.getElementById('adv-amount').value);
    if(!amount||amount<=0){ alert('Enter a valid amount.'); return; }
    var method=document.getElementById('adv-method').value;
    var months=method==='next'?1:parseInt(document.getElementById('adv-months').value)||1;
    var rate=parseFloat(document.getElementById('adv-interest').value)||0;
    var totalAmount=Math.round(amount*(1+rate/100)*100)/100;
    var installment=Math.round(totalAmount/months*100)/100;
    var note=document.getElementById('adv-note').value.trim();
    var now=new Date().toISOString();
    var adv={
      id:'ADV-'+Date.now(), amount:amount, totalAmount:totalAmount,
      interestRate:rate, months:months, monthsRemaining:months,
      monthlyInstallment:installment, startDate:now, status:'active',
      note:note, createdAt:now, createdBy:'Current User'
    };
    emp.advances.push(adv);
    emp.auditLog.push({event:'advance.created',date:now,by:'Current User',
      detail:'Advance of R '+amount.toLocaleString('en-ZA')+' recorded — '+months+' month'+(months>1?'s':'')+' at '+rate+'% interest'});
    closeAdvanceModal();
    renderPayTab(emp); renderAuditTab(emp);
    if(window.showToast) showToast('Advance recorded for '+emp.firstName);
  };

  window.openBonusModal=function(empId){
    activeModalEmpId=empId;
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    document.getElementById('bns-emp-name').textContent=emp.firstName+' '+emp.lastName+' ('+emp.id+')';
    document.getElementById('bns-type').value='Performance Bonus';
    document.getElementById('bns-amount').value='';
    document.getElementById('bns-period').textContent=window.prState?window.prState.period.range:'Current Period';
    document.getElementById('bns-note').value='';
    document.getElementById('bonus-overlay').classList.add('open');
  };
  window.closeBonusModal=function(){ document.getElementById('bonus-overlay').classList.remove('open'); activeModalEmpId=null; };

  window.submitBonus=function(){
    var emp=getData().find(function(e){return e.id===activeModalEmpId;});
    if(!emp) return;
    var amount=parseFloat(document.getElementById('bns-amount').value);
    if(!amount||amount<=0){ alert('Enter a valid amount.'); return; }
    var type=document.getElementById('bns-type').value;
    var period=window.prState?window.prState.period.range:'Current Period';
    var note=document.getElementById('bns-note').value.trim();
    var now=new Date().toISOString();
    emp.bonuses.push({
      id:'BNS-'+Date.now(), type:type, amount:amount,
      period:period, note:note, createdAt:now, createdBy:'Current User'
    });
    emp.auditLog.push({event:'bonus.added',date:now,by:'Current User',
      detail:type+' of R '+amount.toLocaleString('en-ZA')+' added for '+period});
    closeBonusModal();
    renderPayTab(emp); renderAuditTab(emp);
    if(window.showToast) showToast('Bonus added for '+emp.firstName);
  };

  window.openPayIncreaseModal=function(empId){
    activeModalEmpId=empId;
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    document.getElementById('pinc-emp-name').textContent=emp.firstName+' '+emp.lastName+' ('+emp.id+')';
    document.getElementById('pinc-field').value='baseSalary';
    document.getElementById('pinc-new').value='';
    document.getElementById('pinc-date').value=new Date().toISOString().split('T')[0];
    document.getElementById('pinc-reason').value='';
    populateCurrentValue();
    document.getElementById('pay-increase-overlay').classList.add('open');
  };
  window.closePayIncreaseModal=function(){ document.getElementById('pay-increase-overlay').classList.remove('open'); activeModalEmpId=null; };

  window.populateCurrentValue=function(){
    var emp=getData().find(function(e){return e.id===activeModalEmpId;});
    if(!emp) return;
    var f=document.getElementById('pinc-field').value;
    var cur=emp[f];
    var display='—';
    if(f==='baseSalary') display=cur?'R '+cur.toLocaleString('en-ZA'):'Not set';
    else if(f==='hourlyRate') display=cur?'R '+cur+'/hr':'Not set';
    else if(f==='commissionPlan') display=cur||'None';
    document.getElementById('pinc-current').textContent=display;
    document.getElementById('pinc-new').type=(f==='commissionPlan')?'text':'number';
    document.getElementById('pinc-new').placeholder=(f==='commissionPlan')?'e.g. Standard Sales 5%':'Enter new amount';
  };

  window.submitPayIncrease=function(){
    var emp=getData().find(function(e){return e.id===activeModalEmpId;});
    if(!emp) return;
    var f=document.getElementById('pinc-field').value;
    var newVal=document.getElementById('pinc-new').value.trim();
    if(!newVal){ alert('Enter a new value.'); return; }
    var effectiveDate=document.getElementById('pinc-date').value||new Date().toISOString().split('T')[0];
    var reason=document.getElementById('pinc-reason').value.trim()||'No reason provided';
    var oldValue=emp[f];
    var parsedNew=(f==='commissionPlan')?newVal:parseFloat(newVal);
    var now=new Date().toISOString();
    emp.salaryHistory.push({
      id:'SAL-'+Date.now(), field:f, oldValue:oldValue, newValue:parsedNew,
      effectiveDate:effectiveDate, reason:reason, createdAt:now, createdBy:'Current User'
    });
    emp[f]=parsedNew;
    var fieldLabel={baseSalary:'Base Salary',hourlyRate:'Hourly Rate',commissionPlan:'Commission Plan'}[f];
    var oldDisp=(f==='commissionPlan')?(oldValue||'None'):'R '+(oldValue||0).toLocaleString('en-ZA');
    var newDisp=(f==='commissionPlan')?parsedNew:'R '+parsedNew.toLocaleString('en-ZA');
    emp.auditLog.push({event:'pay_profile.adjusted',date:now,by:'Current User',
      detail:fieldLabel+' changed from '+oldDisp+' to '+newDisp+' — effective '+formatDate(effectiveDate)+'. Reason: '+reason});
    closePayIncreaseModal();
    renderPayTab(emp); renderAuditTab(emp); renderOverviewTab(emp);
    if(window.showToast) showToast('Pay adjustment applied for '+emp.firstName);
  };

  /* ── Edit Bank Details ── */
  window.openBankEditModal=function(empId){
    activeModalEmpId=empId;
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    document.getElementById('bnk-emp-name').textContent=emp.firstName+' '+emp.lastName+' ('+emp.id+')';
    document.getElementById('bnk-bankName').value=emp.bankName||'';
    document.getElementById('bnk-branchCode').value=emp.branchCode||'';
    document.getElementById('bnk-accountNumber').value=emp.accountNumber||'';
    document.getElementById('bnk-accountHolder').value=emp.accountHolder||'';
    document.getElementById('bnk-reason').value='';
    document.getElementById('bank-edit-overlay').classList.add('open');
  };
  window.closeBankEditModal=function(){ document.getElementById('bank-edit-overlay').classList.remove('open'); activeModalEmpId=null; };

  window.submitBankEdit=function(){
    var emp=getData().find(function(e){return e.id===activeModalEmpId;});
    if(!emp) return;
    var newBank=document.getElementById('bnk-bankName').value.trim();
    var newBranch=document.getElementById('bnk-branchCode').value.trim();
    var newAcct=document.getElementById('bnk-accountNumber').value.trim();
    var newHolder=document.getElementById('bnk-accountHolder').value.trim();
    var reason=document.getElementById('bnk-reason').value.trim()||'No reason provided';
    if(!newBank||!newAcct){ alert('Bank name and account number are required.'); return; }
    var changes={};
    var changeDescs=[];
    if(newBank!==emp.bankName){ changes.bankName={from:emp.bankName||'',to:newBank}; changeDescs.push('Bank: '+(emp.bankName||'none')+' → '+newBank); }
    if(newBranch!==emp.branchCode){ changes.branchCode={from:emp.branchCode||'',to:newBranch}; changeDescs.push('Branch: '+(emp.branchCode||'none')+' → '+newBranch); }
    if(newAcct!==emp.accountNumber){ changes.accountNumber={from:emp.accountNumber||'',to:newAcct}; changeDescs.push('Account changed'); }
    if(newHolder!==emp.accountHolder){ changes.accountHolder={from:emp.accountHolder||'',to:newHolder}; changeDescs.push('Holder: '+(emp.accountHolder||'none')+' → '+newHolder); }
    if(changeDescs.length===0){ alert('No changes detected.'); return; }
    var now=new Date().toISOString();
    emp.bankHistory.push({
      id:'BNK-'+Date.now(), date:now, by:'Current User', reason:reason, changes:changes
    });
    emp.bankName=newBank; emp.branchCode=newBranch; emp.accountNumber=newAcct; emp.accountHolder=newHolder;
    emp.auditLog.push({event:'bank_details.changed',date:now,by:'Current User',
      detail:'Bank details updated — '+changeDescs.join(', ')+'. Reason: '+reason});
    closeBankEditModal();
    renderPayTab(emp); renderAuditTab(emp);
    if(window.showToast) showToast('Bank details updated for '+emp.firstName);
  };

  window.updateDeliveryPrefs=function(empId){
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    emp.payslipDelivery={
      email:document.getElementById('del-pref-email-'+empId).checked,
      whatsapp:document.getElementById('del-pref-wa-'+empId).checked,
      print:document.getElementById('del-pref-print-'+empId).checked
    };
    emp.auditLog.push({event:'delivery_prefs.updated',date:new Date().toISOString(),by:'Current User',
      detail:'Payslip delivery updated: '+(emp.payslipDelivery.email?'Email ':'')+(emp.payslipDelivery.whatsapp?'WhatsApp ':'')+(emp.payslipDelivery.print?'Print':'')});
    renderAuditTab(emp);
    if(window.showToast) showToast('Delivery preferences updated');
  };
  window.submitPayStructure = function(){
    closePayStructureModal();
    renderPayStructures();
  };

  /* ── Edit Personal Information ── */
  window.openEditPersonalModal=function(empId){
    activeModalEmpId=empId;
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    document.getElementById('pers-firstName').value=emp.firstName||'';
    document.getElementById('pers-lastName').value=emp.lastName||'';
    document.getElementById('pers-email').value=emp.email||'';
    document.getElementById('pers-phone').value=emp.phone||'';
    document.getElementById('pers-idNumber').value=emp.idNumber||'';
    document.getElementById('pers-startDate').value=emp.startDate||'';
    document.getElementById('pers-department').value=emp.department||'';
    document.getElementById('pers-jobTitle').value=emp.jobTitle||'';
    document.getElementById('pers-manager').value=emp.manager||'';
    document.getElementById('personal-edit-overlay').classList.add('open');
  };
  window.closeEditPersonalModal=function(){ document.getElementById('personal-edit-overlay').classList.remove('open'); activeModalEmpId=null; };

  window.submitEditPersonal=function(){
    var emp=getData().find(function(e){return e.id===activeModalEmpId;});
    if(!emp) return;
    var fields=[
      {key:'firstName',el:'pers-firstName',label:'First Name'},
      {key:'lastName',el:'pers-lastName',label:'Last Name'},
      {key:'email',el:'pers-email',label:'Email'},
      {key:'phone',el:'pers-phone',label:'Phone'},
      {key:'idNumber',el:'pers-idNumber',label:'ID Number'},
      {key:'startDate',el:'pers-startDate',label:'Start Date'},
      {key:'department',el:'pers-department',label:'Department'},
      {key:'jobTitle',el:'pers-jobTitle',label:'Job Title'},
      {key:'manager',el:'pers-manager',label:'Manager'}
    ];
    var changeDescs=[];
    fields.forEach(function(f){
      var newVal=document.getElementById(f.el).value.trim();
      var oldVal=(emp[f.key]||'').toString();
      if(newVal!==oldVal){
        changeDescs.push(f.label+': '+oldVal+' → '+newVal);
        emp[f.key]=newVal;
      }
    });
    if(changeDescs.length===0){ alert('No changes detected.'); return; }
    emp.auditLog.push({event:'personal_info.updated',date:new Date().toISOString(),by:'Current User',
      detail:'Personal info updated — '+changeDescs.join(', ')});
    closeEditPersonalModal();
    renderEmployeeProfile(emp);
    if(window.showToast) showToast('Personal info updated for '+emp.firstName);
  };

  /* ── Edit Next of Kin ── */
  window.openEditNextOfKinModal=function(empId){
    activeModalEmpId=empId;
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    var nok=emp.nextOfKin||{};
    document.getElementById('nok-name').value=nok.name||'';
    document.getElementById('nok-relation').value=nok.relation||'';
    document.getElementById('nok-phone').value=nok.phone||'';
    document.getElementById('nok-edit-overlay').classList.add('open');
  };
  window.closeEditNextOfKinModal=function(){ document.getElementById('nok-edit-overlay').classList.remove('open'); activeModalEmpId=null; };

  window.submitEditNextOfKin=function(){
    var emp=getData().find(function(e){return e.id===activeModalEmpId;});
    if(!emp) return;
    if(!emp.nextOfKin) emp.nextOfKin={};
    var newName=document.getElementById('nok-name').value.trim();
    var newRel=document.getElementById('nok-relation').value.trim();
    var newPhone=document.getElementById('nok-phone').value.trim();
    var changeDescs=[];
    if(newName!==(emp.nextOfKin.name||'')){ changeDescs.push('Name: '+(emp.nextOfKin.name||'none')+' → '+newName); emp.nextOfKin.name=newName; }
    if(newRel!==(emp.nextOfKin.relation||'')){ changeDescs.push('Relationship: '+(emp.nextOfKin.relation||'none')+' → '+newRel); emp.nextOfKin.relation=newRel; }
    if(newPhone!==(emp.nextOfKin.phone||'')){ changeDescs.push('Phone: '+(emp.nextOfKin.phone||'none')+' → '+newPhone); emp.nextOfKin.phone=newPhone; }
    if(changeDescs.length===0){ alert('No changes detected.'); return; }
    emp.auditLog.push({event:'next_of_kin.updated',date:new Date().toISOString(),by:'Current User',
      detail:'Next of Kin updated — '+changeDescs.join(', ')});
    closeEditNextOfKinModal();
    renderOverviewTab(emp); renderAuditTab(emp);
    if(window.showToast) showToast('Next of Kin updated');
  };

  /* ── Employee Notes ── */
  window.openAddNoteModal=function(){
    var empId=state.currentEmployee;
    if(!empId) return;
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    document.getElementById('note-emp-name').textContent=emp.firstName+' '+emp.lastName+' ('+emp.id+')';
    document.getElementById('note-category').value='general';
    document.getElementById('note-priority').value='normal';
    document.getElementById('note-text').value='';
    document.getElementById('note-private').checked=false;
    document.getElementById('add-note-overlay').classList.add('open');
  };
  window.closeAddNoteModal=function(){ document.getElementById('add-note-overlay').classList.remove('open'); };

  window.submitAddNote=function(){
    var empId=state.currentEmployee;
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    var text=document.getElementById('note-text').value.trim();
    if(!text){ alert('Please enter a note.'); return; }
    var note={
      id:'NOTE-'+Date.now(),
      category:document.getElementById('note-category').value,
      priority:document.getElementById('note-priority').value,
      text:text,
      private:document.getElementById('note-private').checked,
      createdAt:Date.now(),
      createdBy:'Current User'
    };
    emp.notes.push(note);
    var catLabels={general:'General',arrangement:'Special Arrangement',health:'Health',performance:'Performance',disciplinary:'Disciplinary',other:'Other'};
    emp.auditLog.push({event:'note.added',date:new Date().toISOString(),by:'Current User',
      detail:'Note added — Category: '+(catLabels[note.category]||note.category)+', Priority: '+note.priority});
    closeAddNoteModal();
    renderOverviewTab(emp); renderAuditTab(emp);
    if(window.showToast) showToast('Note added for '+emp.firstName);
  };

  window.deleteNote=function(empId,noteId){
    var emp=getData().find(function(e){return e.id===empId;});
    if(!emp) return;
    var idx=-1;
    for(var i=0;i<emp.notes.length;i++){ if(emp.notes[i].id===noteId){ idx=i; break; } }
    if(idx===-1) return;
    var removed=emp.notes.splice(idx,1)[0];
    emp.auditLog.push({event:'note.deleted',date:new Date().toISOString(),by:'Current User',
      detail:'Note deleted — Category: '+removed.category});
    renderOverviewTab(emp); renderAuditTab(emp);
    if(window.showToast) showToast('Note removed');
  };

  /* ── Header Adjust Pay helper ── */
  window.openPayIncreaseFromHeader=function(){
    var empId=state.currentEmployee;
    if(empId) openPayIncreaseModal(empId);
  };

  /* ── Event Wiring ── */
  document.addEventListener('DOMContentLoaded', function(){
    // Search
    var searchEl = document.getElementById('ppl-search');
    if(searchEl) searchEl.addEventListener('input', function(){ state.search=this.value; state.page=1; renderEmployees(); });

    // Filter chips
    ['status','dept','paytype'].forEach(function(key){
      var chip = document.getElementById('ppl-filter-'+key);
      var drop = document.getElementById('ppl-drop-'+key);
      if(!chip||!drop) return;
      chip.addEventListener('click', function(ev){ ev.stopPropagation(); drop.classList.toggle('open'); });
      drop.querySelectorAll('.comp-filter-opt').forEach(function(opt){
        opt.addEventListener('click', function(ev){
          ev.stopPropagation();
          var val = this.getAttribute('data-val');
          drop.querySelectorAll('.comp-filter-opt').forEach(function(o){o.classList.remove('selected');});
          this.classList.add('selected');
          var filterKey = key==='dept'?'department':key==='paytype'?'payType':key;
          state.filters[filterKey] = val;
          state.page=1;
          chip.childNodes[0].textContent = val==='all'?(key==='dept'?'Department':key==='paytype'?'Pay Type':'Status'):this.textContent+' ';
          drop.classList.remove('open');
          renderEmployees();
        });
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function(){
      ['status','dept','paytype'].forEach(function(k){
        var d=document.getElementById('ppl-drop-'+k); if(d) d.classList.remove('open');
      });
    });

    // Sort columns
    document.querySelectorAll('.ppl-cols span[data-sort]').forEach(function(col){
      col.addEventListener('click', function(){
        var f = this.getAttribute('data-sort');
        if(state.sort.field===f) state.sort.dir = state.sort.dir==='asc'?'desc':'asc';
        else { state.sort.field=f; state.sort.dir='asc'; }
        state.page=1;
        renderEmployees();
      });
    });

    // Close modals on overlay click
    ['add-employee-overlay','pay-structure-overlay'].forEach(function(id){
      var overlay = document.getElementById(id);
      if(overlay) overlay.addEventListener('click', function(ev){ if(ev.target===overlay) overlay.classList.remove('open'); });
    });

    // Initial render — deferred to when screen is shown
  });

  /* ── Hook into switchScreen for lazy render ── */
  var _origSwitch = window.switchScreen;
  window.switchScreen = function(name){
    _origSwitch(name);
    if(name==='employees') renderEmployees();
    if(name==='pay-structures') renderPayStructures();
  };
})();


/* ── PHASE 3: Morning Brief Ritual Enhancement ────────────── */
(function(){
  'use strict';
  var STREAK_KEY = 'cf_streak';

  function getStreak() {
    try {
      var data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
      var today = new Date().toISOString().split('T')[0];
      if (data.lastDate === today) return data;
      var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (data.lastDate === yesterday) {
        data.count = (data.count || 0) + 1;
      } else {
        data.count = 1;
      }
      data.lastDate = today;
      localStorage.setItem(STREAK_KEY, JSON.stringify(data));
      return data;
    } catch(e) { return { count:1, lastDate:new Date().toISOString().split('T')[0] }; }
  }

  function getTimeGreeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function getDayContext() {
    var d = new Date().getDay();
    if (d === 1) return "Let's start the week strong.";
    if (d === 5) return 'Finish the week with momentum.';
    if (d === 0 || d === 6) return 'Weekend mode — planning ahead.';
    return "Here's what needs your attention.";
  }

  function buildPriorities() {
    return [
      { text:'Follow up on R24,500 overdue invoice (Summit Holdings)', impact:'R24.5K', type:'invoice' },
      { text:'Prepare for 10:30 strategy meeting with Legal Clear', impact:'High', type:'meeting' },
      { text:'Close pipeline deal — Axis Medical (proposal stage)', impact:'R68K', type:'deal' },
      { text:'Review 3 unsigned documents expiring this week', impact:'Compliance', type:'document' },
      { text:'Run payroll processing before Friday cutoff', impact:'R38.5K', type:'payment' }
    ];
  }

  function enhanceBriefing() {
    var briefWidget = document.getElementById('ab-widget-instance');
    if (!briefWidget) return;

    // Add streak + listen button
    var header = briefWidget.querySelector('.widget-header');
    if (header && !document.getElementById('mb-streak-display')) {
      var streak = getStreak();
      var streakDiv = document.createElement('div');
      streakDiv.className = 'mb-streak';
      streakDiv.id = 'mb-streak-display';
      streakDiv.innerHTML = '<span class="mb-streak-fire">🔥</span> ' + streak.count + '-day streak <button class="mb-listen-btn" onclick="briefListen(this)"><svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 12h.01"/></svg> Listen</button>';
      header.after(streakDiv);
    }

    // Add priorities section — place AFTER ab-body as a separate row, not inside it
    var abBody = briefWidget.querySelector('.ab-body');
    if (abBody && !document.getElementById('mb-priorities-section')) {
      var pDiv = document.createElement('div');
      pDiv.className = 'mb-priorities';
      pDiv.id = 'mb-priorities-section';
      pDiv.style.cssText = 'padding:0 16px 10px; display:flex; flex-direction:column; gap:6px;';
      var priorities = buildPriorities();
      pDiv.innerHTML = '<div style="font-size:10px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;padding:0 4px">Today\'s Priorities</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
        priorities.map(function(p, i) {
          return '<div class="mb-priority-row"><span class="mb-priority-rank">' + (i+1) + '</span><span class="mb-priority-text">' + p.text + '</span><span class="mb-priority-impact">' + p.impact + '</span></div>';
        }).join('') + '</div>';
      // Insert after the ab-body, before the footer
      var abFooter = briefWidget.querySelector('.ab-footer');
      if (abFooter) abFooter.parentElement.insertBefore(pDiv, abFooter);
      else if (abBody.parentElement) abBody.parentElement.appendChild(pDiv);
    }
  }

  window.briefListen = function(btn) {
    if (!('speechSynthesis' in window)) { btn.textContent = 'Not supported'; return; }
    if (btn.classList.contains('playing')) {
      speechSynthesis.cancel();
      btn.classList.remove('playing');
      btn.innerHTML = '<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 12h.01"/></svg> Listen';
      return;
    }
    var text = getTimeGreeting() + '. ' + getDayContext() + ' ';
    buildPriorities().forEach(function(p, i) { text += 'Priority ' + (i+1) + ': ' + p.text + '. '; });
    var utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    btn.classList.add('playing');
    btn.innerHTML = '\u23F8 Pause';
    utt.onend = function() {
      btn.classList.remove('playing');
      btn.innerHTML = '<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 12h.01"/></svg> Listen';
    };
    speechSynthesis.speak(utt);
  };

  document.addEventListener('DOMContentLoaded', function() {
    getStreak();
    setTimeout(enhanceBriefing, 800);
  });

  var _mbOrigSwitch2 = window.switchScreen;
  window.switchScreen = function(name) {
    _mbOrigSwitch2(name);
    if (name === 'dashboard') setTimeout(enhanceBriefing, 300);
  };
})();


/* ── PHASE 4: Predictive Cash Flow ────────────────────────── */
(function(){
  'use strict';

  function addForecastTab() {
    var finBar = document.querySelector('#screen-finance .fin-bar');
    if (!finBar || document.getElementById('cf-forecast-tab-btn')) return;
    var viewGroups = finBar.querySelectorAll('.fin-tab-group');
    var viewTabs = viewGroups.length > 1 ? viewGroups[1] : null;
    if (viewTabs) {
      var fcBtn = document.createElement('div');
      fcBtn.className = 'fin-tab';
      fcBtn.id = 'cf-forecast-tab-btn';
      fcBtn.setAttribute('data-group', 'view');
      fcBtn.setAttribute('onclick', "setFinTab(this,'view');showCashForecast()");
      fcBtn.textContent = '📈 Forecast';
      viewTabs.appendChild(fcBtn);
    }
  }

  function generateForecastData() {
    var data = [];
    var balance = 382000;
    var today = new Date();
    for (var i = 0; i < 90; i++) {
      var d = new Date(today.getTime() + i * 86400000);
      var inflow = 0;
      if (i === 7) inflow = 24500;
      if (i === 15) inflow = 62500;
      if (i === 22) inflow = 18200;
      if (i === 30) inflow = 31000;
      if (i === 45) inflow = 45000;
      if (i === 60) inflow = 55000;
      if (i === 75) inflow = 38000;
      var outflow = 0;
      if (i % 30 === 0 && i > 0) outflow = 85000;
      if (i === 18) outflow = 61000;
      if (i === 25) outflow = 38500;
      if (i === 55) outflow = 38500;
      balance = balance + inflow * 0.85 - outflow;
      data.push({ day:i, balance:Math.round(balance), inflow:inflow, outflow:outflow });
    }
    return data;
  }

  window.showCashForecast = function() {
    var screen = document.getElementById('screen-finance');
    if (!screen) return;
    var existing = document.getElementById('cf-forecast-panel');
    if (existing) { existing.style.display = 'block'; return; }

    var panel = document.createElement('div');
    panel.id = 'cf-forecast-panel';
    panel.className = 'cf-forecast-wrap';

    var data = generateForecastData();
    var minBal = Math.min.apply(null, data.map(function(d){return d.balance}));
    var maxBal = Math.max.apply(null, data.map(function(d){return d.balance}));
    var criticalDay = data.find(function(d){return d.balance < 300000;});

    var w = 700, h = 240, pad = 40;
    var xScale = function(i) { return pad + (i / 89) * (w - pad * 2); };
    var yScale = function(v) { return h - pad - ((v - minBal + 20000) / (maxBal - minBal + 40000)) * (h - pad * 2); };

    var pathD = data.map(function(d, i) {
      return (i === 0 ? 'M' : 'L') + xScale(i).toFixed(1) + ',' + yScale(d.balance).toFixed(1);
    }).join(' ');

    var dangerY = yScale(300000);

    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:100%">' +
      '<defs><linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F0A843" stop-opacity="0.3"/><stop offset="100%" stop-color="#F0A843" stop-opacity="0"/></linearGradient></defs>' +
      '<line x1="' + pad + '" y1="' + dangerY + '" x2="' + (w-pad) + '" y2="' + dangerY + '" stroke="#EF4444" stroke-dasharray="4,4" stroke-width="1" opacity="0.5"/>' +
      '<text x="' + (w-pad+4) + '" y="' + (dangerY+3) + '" fill="#EF4444" font-size="8">Min</text>' +
      '<path d="' + pathD + ' L' + xScale(89).toFixed(1) + ',' + (h-pad) + ' L' + pad + ',' + (h-pad) + ' Z" fill="url(#fcGrad)"/>' +
      '<path d="' + pathD + '" fill="none" stroke="#F0A843" stroke-width="2"/>';

    for (var m = 0; m < 3; m++) {
      var xPos = xScale(m * 30);
      var label = m === 0 ? 'Today' : '+' + (m*30) + 'd';
      svg += '<text x="' + xPos + '" y="' + (h-10) + '" fill="var(--muted)" font-size="9" text-anchor="middle">' + label + '</text>';
    }
    svg += '<text x="' + xScale(89) + '" y="' + (h-10) + '" fill="var(--muted)" font-size="9" text-anchor="middle">+90d</text>';

    var steps = 5;
    for (var s = 0; s <= steps; s++) {
      var val = minBal - 20000 + (s / steps) * (maxBal - minBal + 40000);
      var yPos = h - pad - (s / steps) * (h - pad * 2);
      svg += '<text x="' + (pad-4) + '" y="' + (yPos+3) + '" fill="var(--muted)" font-size="8" text-anchor="end">R' + (val/1000).toFixed(0) + 'K</text>';
      svg += '<line x1="' + pad + '" y1="' + yPos + '" x2="' + (w-pad) + '" y2="' + yPos + '" stroke="var(--border)" stroke-width="0.5" opacity="0.3"/>';
    }
    svg += '</svg>';

    var narrative = criticalDay
      ? '\u26A0\uFE0F <strong>Cash drops below R300K safety threshold on day ' + criticalDay.day + '</strong> \u2014 consider accelerating collections on Summit Holdings (R24.5K overdue) and Axis Medical (R62.5K pending). VAT payment of R61K on day 18 is the largest single outflow.'
      : '\u2705 <strong>Cash position remains healthy through the 90-day window.</strong> Expected inflows of R274K cover projected outflows. Maintain current collection pace.';

    panel.innerHTML = '<div class="cf-forecast-chart">' + svg + '</div>' +
      '<div class="cf-legend"><span class="cf-legend-item"><span class="cf-legend-dot" style="background:#F0A843"></span> Projected Balance</span><span class="cf-legend-item"><span class="cf-legend-dot" style="background:#EF4444"></span> Safety Threshold (R300K)</span></div>' +
      '<div class="cf-forecast-narrative">' + narrative + '</div>';

    var finContent = screen.querySelector('.fin-content, .fin-grid');
    if (finContent) finContent.after(panel);
    else screen.appendChild(panel);
  };

  var _origSetFinTab = window.setFinTab;
  window.setFinTab = function(el, group) {
    if (_origSetFinTab) _origSetFinTab(el, group);
    var fp = document.getElementById('cf-forecast-panel');
    if (fp && el.id !== 'cf-forecast-tab-btn') fp.style.display = 'none';
  };

  document.addEventListener('DOMContentLoaded', function() { setTimeout(addForecastTab, 500); });

  var _fcOrigSwitch2 = window.switchScreen;
  window.switchScreen = function(name) {
    _fcOrigSwitch2(name);
    if (name === 'finance') setTimeout(addForecastTab, 200);
  };
})();


/* ── PHASE 5: Workflow Automation Engine ──────────────────── */
(function(){
  'use strict';
  var AUTO_KEY = 'cf_automations';
  var TRIGGER_LABELS = { invoice_overdue:'Invoice becomes overdue', deal_stage_change:'Deal changes stage', contact_no_response_14d:'No client response in 14 days', payment_received:'Payment received', document_expiry_30d:'Document expires in 30 days', relationship_cold:'Relationship turns cold' };
  var ACTION_LABELS = { create_todo:'Create todo task', send_notification:'Send notification', update_relationship:'Update relationship score', flag_client:'Flag client for review', record_memory:'Record in AI memory', create_calendar_event:'Create calendar reminder' };
  var TRIGGER_ICONS = { invoice_overdue:'🧾', deal_stage_change:'📊', contact_no_response_14d:'📭', payment_received:'💰', document_expiry_30d:'📄', relationship_cold:'\u2744\uFE0F' };

  function getAutos() { try { return JSON.parse(localStorage.getItem(AUTO_KEY) || '[]'); } catch(e) { return []; } }
  function saveAutos(arr) { localStorage.setItem(AUTO_KEY, JSON.stringify(arr)); }

  function seedAutos() {
    if (getAutos().length > 0) return;
    saveAutos([
      { name:'Follow up overdue invoices', trigger:'invoice_overdue', condition:'amount > 5000', action:'create_todo', active:true },
      { name:'Flag cold relationships', trigger:'relationship_cold', condition:'', action:'flag_client', active:true },
      { name:'Record payments in memory', trigger:'payment_received', condition:'', action:'record_memory', active:true },
      { name:'Alert on document expiry', trigger:'document_expiry_30d', condition:'', action:'send_notification', active:true },
      { name:'Create task on deal movement', trigger:'deal_stage_change', condition:'', action:'create_todo', active:false }
    ]);
  }

  function renderAutoList() {
    var list = document.getElementById('auto-list');
    if (!list) return;
    var autos = getAutos();
    var activeCount = autos.filter(function(a){return a.active}).length;
    var badge = document.getElementById('auto-count-badge');
    if (badge) badge.textContent = activeCount + ' active';
    var sbBadge = document.getElementById('auto-sidebar-badge');
    if (sbBadge) { sbBadge.textContent = activeCount; sbBadge.style.display = activeCount > 0 ? 'inline' : 'none'; }

    if (autos.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);font-size:13px">No automations yet. Click <strong>+ New Trigger</strong> to create one.</div>';
      return;
    }
    list.innerHTML = autos.map(function(a, i) {
      var icon = TRIGGER_ICONS[a.trigger] || '\u26A1';
      return '<div class="auto-card"><div class="auto-card-icon">' + icon + '</div><div class="auto-card-body"><div class="auto-card-title">' + a.name + '</div><div class="auto-card-desc">When: ' + (TRIGGER_LABELS[a.trigger]||a.trigger) + (a.condition ? ' (' + a.condition + ')' : '') + ' \u2192 Then: ' + (ACTION_LABELS[a.action]||a.action) + '</div><div class="auto-card-meta"><span class="auto-card-tag">' + a.trigger + '</span><span class="auto-card-tag">' + a.action + '</span></div></div><label class="auto-toggle"><input type="checkbox" ' + (a.active?'checked':'') + ' onchange="toggleAutomation(' + i + ',this.checked)"><span class="auto-toggle-slider"></span></label></div>';
    }).join('');
  }

  window.toggleAutomation = function(idx, active) {
    var autos = getAutos();
    if (autos[idx]) { autos[idx].active = active; saveAutos(autos); renderAutoList(); }
  };
  window.openAutoModal = function(idx) {
    document.getElementById('auto-modal-overlay').classList.add('open');
    document.getElementById('auto-edit-idx').value = idx !== undefined ? idx : -1;
    if (idx !== undefined) {
      var a = getAutos()[idx];
      document.getElementById('auto-trigger').value = a.trigger;
      document.getElementById('auto-condition').value = a.condition || '';
      document.getElementById('auto-action').value = a.action;
      document.getElementById('auto-name').value = a.name;
      document.getElementById('auto-modal-title').textContent = 'Edit Trigger';
    } else {
      document.getElementById('auto-trigger').value = '';
      document.getElementById('auto-condition').value = '';
      document.getElementById('auto-action').value = '';
      document.getElementById('auto-name').value = '';
      document.getElementById('auto-modal-title').textContent = 'New Smart Trigger';
    }
  };
  window.closeAutoModal = function() { document.getElementById('auto-modal-overlay').classList.remove('open'); };
  window.saveAutomation = function() {
    var trigger = document.getElementById('auto-trigger').value;
    var action = document.getElementById('auto-action').value;
    var name = document.getElementById('auto-name').value.trim();
    if (!trigger || !action || !name) { alert('Please fill in all required fields.'); return; }
    var autos = getAutos();
    var idx = parseInt(document.getElementById('auto-edit-idx').value);
    var entry = { name:name, trigger:trigger, condition:document.getElementById('auto-condition').value.trim(), action:action, active:true };
    if (idx >= 0 && autos[idx]) autos[idx] = entry;
    else autos.push(entry);
    saveAutos(autos);
    closeAutoModal();
    renderAutoList();
    if (typeof recordMemoryEvent === 'function') recordMemoryEvent('system', 'Automations', 'Trigger created: ' + name, 'automations');
  };

  var _autoOrigSwitch2 = window.switchScreen;
  window.switchScreen = function(name) {
    _autoOrigSwitch2(name);
    if (name === 'automations') setTimeout(renderAutoList, 100);
  };

  document.addEventListener('DOMContentLoaded', function() { seedAutos(); setTimeout(renderAutoList, 600); });
})();


/* ── PHASE 6: Document Intelligence ──────────────────────── */
(function(){
  'use strict';
  var DOC_INTEL_KEY = 'cf_doc_intel';
  var DEMO_ANALYSIS = {
    'Service Level Agreement': {
      dates: [{ date:'2025-12-31', label:'Contract expiry', type:'expiry' },{ date:'2025-09-30', label:'90-day notice period starts', type:'notice' },{ date:'2025-06-30', label:'Mid-term review due', type:'review' }],
      parties: ['Summit Holdings (Pty) Ltd', 'Novatrai Professional Services'],
      obligations: ['Monthly reporting by 5th of each month', 'Quarterly review meetings', 'Annual compliance audit'],
      risks: ['No automatic renewal clause \u2014 manual action required', 'Penalty clause for late deliverables (2% per week)']
    },
    'NDA \u2014 Project Falcon': {
      dates: [{ date:'2026-12-01', label:'NDA expiry', type:'expiry' },{ date:'2026-06-01', label:'6-month review', type:'review' }],
      parties: ['Summit Holdings', 'Falcon Ventures'],
      obligations: ['Confidentiality for 24 months post-termination', 'Return of materials within 30 days'],
      risks: ['Broad definition of confidential information', 'No carve-out for independently developed IP']
    },
    'Tax Certificate 2024': {
      dates: [{ date:'2025-03-31', label:'Tax year end', type:'expiry' },{ date:'2025-06-30', label:'Filing deadline', type:'notice' }],
      parties: ['Summit Holdings (Pty) Ltd'],
      obligations: ['Annual filing with SARS', 'Provisional tax payments bi-annually'],
      risks: ['Late filing penalty: R250/day']
    }
  };

  function addAnalyseButtons() {
    var masterScreen = document.getElementById('screen-master-docs');
    if (!masterScreen) return;
    var rows = masterScreen.querySelectorAll('tr');
    rows.forEach(function(row) {
      if (row.querySelector('.di-analyse-btn')) return;
      var nameCell = row.querySelector('td:first-child');
      if (!nameCell) return;
      var name = nameCell.textContent.trim();
      if (DEMO_ANALYSIS[name]) {
        var btn = document.createElement('button');
        btn.className = 'di-analyse-btn';
        btn.innerHTML = '🔍 Analyse';
        btn.onclick = function() { analyseDocument(name, row); };
        var lastCell = row.querySelector('td:last-child');
        if (lastCell) lastCell.appendChild(btn);
      }
    });
  }

  function analyseDocument(name, row) {
    var analysis = DEMO_ANALYSIS[name];
    if (!analysis) return;
    var existing = row.parentElement.querySelector('.di-results-row[data-for="' + name + '"]');
    if (existing) { existing.remove(); return; }

    var resultsRow = document.createElement('tr');
    resultsRow.className = 'di-results-row';
    resultsRow.setAttribute('data-for', name);
    resultsRow.innerHTML = '<td colspan="10"><div class="di-results">' +
      '<div class="di-section"><div class="di-section-title">📅 Key Dates</div>' +
      analysis.dates.map(function(d) {
        return '<div class="di-item"><span class="di-item-icon">📌</span><span class="di-item-date">' + d.date + '</span><span class="di-item-label">' + d.label + '</span><button class="di-add-cal-btn" onclick="diAddToCal(\'' + d.date + '\',\'' + d.label.replace(/'/g,"\\'") + ' \u2014 ' + name.replace(/'/g,"\\'") + '\')">+ Calendar</button></div>';
      }).join('') + '</div>' +
      '<div class="di-section"><div class="di-section-title">👥 Parties</div>' +
      analysis.parties.map(function(p) { return '<div class="di-item"><span class="di-item-icon">\u2022</span><span>' + p + '</span></div>'; }).join('') + '</div>' +
      '<div class="di-section"><div class="di-section-title">📋 Obligations</div>' +
      analysis.obligations.map(function(o) { return '<div class="di-item"><span class="di-item-icon">\u2610</span><span>' + o + '</span></div>'; }).join('') + '</div>' +
      '<div class="di-section"><div class="di-section-title">\u26A0\uFE0F Risk Flags</div>' +
      analysis.risks.map(function(r) { return '<div class="di-item"><span class="di-item-icon">🔴</span><span class="di-risk-flag">' + r + '</span></div>'; }).join('') + '</div>' +
      '</div></td>';
    row.after(resultsRow);

    try {
      var stored = JSON.parse(localStorage.getItem(DOC_INTEL_KEY) || '{}');
      stored[name] = { analysedAt:new Date().toISOString(), data:analysis };
      localStorage.setItem(DOC_INTEL_KEY, JSON.stringify(stored));
    } catch(e) {}
    if (typeof recordMemoryEvent === 'function') recordMemoryEvent('document', name, 'Document analysed: ' + analysis.dates.length + ' key dates, ' + analysis.risks.length + ' risk flags', 'master-docs');
  }

  window.diAddToCal = function(date, label) {
    if (typeof recordMemoryEvent === 'function') recordMemoryEvent('meeting', label, 'Calendar event from doc intelligence: ' + date, 'master-docs');
    var toast = document.getElementById('vta-toast');
    if (toast) { toast.textContent = '\u2705 Added to calendar: ' + label; toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); }, 3000); }
    else alert('Added to calendar: ' + label + ' on ' + date);
  };

  var _diOrigSwitch2 = window.switchScreen;
  window.switchScreen = function(name) {
    _diOrigSwitch2(name);
    if (name === 'master-docs') setTimeout(addAnalyseButtons, 300);
  };
  document.addEventListener('DOMContentLoaded', function() { setTimeout(addAnalyseButtons, 700); });
})();


/* ── PHASE 7: Voice-to-Action ────────────────────────────── */
(function(){
  'use strict';
  var recognition = null;
  var isListening = false;

  function initSpeech() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    var r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = 'en-US';
    r.onresult = function(e) { processVoiceCommand(e.results[0][0].transcript.toLowerCase().trim()); stopListening(); };
    r.onerror = function() { stopListening(); showVtaToast('Voice recognition error. Try again.'); };
    r.onend = function() { stopListening(); };
    return r;
  }

  function startListening() {
    if (!recognition) recognition = initSpeech();
    if (!recognition) { showVtaToast('Speech recognition not supported'); return; }
    isListening = true;
    var fab = document.getElementById('vta-fab'); var wave = document.getElementById('vta-wave');
    if (fab) fab.classList.add('listening'); if (wave) wave.classList.add('active');
    try { recognition.start(); } catch(e) { stopListening(); }
  }

  function stopListening() {
    isListening = false;
    var fab = document.getElementById('vta-fab'); var wave = document.getElementById('vta-wave');
    if (fab) fab.classList.remove('listening'); if (wave) wave.classList.remove('active');
    try { if (recognition) recognition.stop(); } catch(e) {}
  }

  function processVoiceCommand(text) {
    var screens = { dashboard:['dashboard','home'], finance:['finance','money'], invoices:['invoices','invoice','billing'], payments:['payments','payment'], calendar:['calendar','schedule'], pipeline:['pipeline','deals','sales'], contacts:['contacts','people'], todos:['todos','tasks'], automations:['automations','triggers'], portal:['portal','client view'], mail:['mail','email','inbox'], reports:['reports','analytics'] };
    if (/open|go to|show|navigate/.test(text)) {
      for (var scr in screens) {
        for (var k = 0; k < screens[scr].length; k++) {
          if (text.indexOf(screens[scr][k]) >= 0) {
            if (typeof switchScreen === 'function') switchScreen(scr);
            showVtaToast('📍 Opened ' + scr);
            if (typeof recordMemoryEvent === 'function') recordMemoryEvent('system', 'Voice', 'Voice nav: ' + scr, scr);
            return;
          }
        }
      }
    }
    var meetMatch = text.match(/add meeting (?:with )?(.*?)(?:\s+on\s+|\s+for\s+)(.*)/);
    if (meetMatch) { showVtaToast('📅 Meeting added: ' + meetMatch[1] + ' on ' + meetMatch[2]); if (typeof recordMemoryEvent === 'function') recordMemoryEvent('meeting', meetMatch[1], 'Voice meeting on ' + meetMatch[2], 'calendar'); return; }
    var todoMatch = text.match(/(?:create|add|new) (?:todo|task)\s+(.*)/);
    if (todoMatch) { showVtaToast('\u2705 Todo created: ' + todoMatch[1]); if (typeof recordMemoryEvent === 'function') recordMemoryEvent('system', 'Todos', 'Voice todo: ' + todoMatch[1], 'todos'); return; }
    showVtaToast('🎤 Heard: "' + text + '" \u2014 try "Open [screen]", "Add meeting with...", or "Create todo..."');
  }

  function showVtaToast(msg) {
    var toast = document.getElementById('vta-toast');
    if (!toast) return;
    toast.innerHTML = msg;
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 4000);
  }

  window.toggleVoiceAction = function() { if (isListening) stopListening(); else startListening(); };
})();


/* ── PHASE 8: Client Portal + AI entries for new screens ─── */
(function(){
  'use strict';
  if (typeof AI !== 'undefined') {
    AI.INSIGHTS.automations = [
      { id:'aut1', badge:'Active', title:'5 automations running', summary:'4 triggers actively monitoring your business. 1 paused.', confidence:'high', action:null },
      { id:'aut2', badge:'Hit', title:'3 triggers fired this week', summary:'Invoice overdue (2x), relationship cold (1x). Each generated a todo.', confidence:'med', action:null }
    ];
    AI.INSIGHTS.portal = [
      { id:'pt1', badge:'Client', title:'Summit Holdings portal active', summary:'3 active projects, 1 overdue invoice (R24.5K), 2 unread messages.', confidence:'high', action:null },
      { id:'pt2', badge:'Risk', title:'Client may notice overdue delays', summary:'Portal shows INV-2024-156 overdue. Consider proactive communication.', confidence:'med', action:'fix' }
    ];
    AI.PROMPTS.automations = ['Which triggers fired this week?','Create a trigger for overdue invoices','Show automation performance','Suggest new triggers'];
    AI.PROMPTS.portal = ['What does the client see?','Any overdue items visible?','Draft a client update','Review portal activity'];
    AI.EXPLAIN.automations = '<strong>Smart Triggers</strong> automate repetitive actions based on business events. Each trigger has a trigger event, optional condition, and action.';
    AI.EXPLAIN.portal = '<strong>Client Portal</strong> shows what your client sees \u2014 projects, invoices, documents, and messages. Review before sharing.';
    AI.ACTIONS.automations = [{ id:'aa1', icon:'\u26A1', label:'Create trigger from pattern', desc:'AI suggests automation triggers based on your activity.', safe:true }];
    AI.ACTIONS.portal = [{ id:'ap1', icon:'\u2709', label:'Send portal link to client', desc:'Generate and send a secure portal access link.', safe:false },{ id:'ap2', icon:'\u2691', label:'Flag portal issues', desc:'Review portal for data that should be hidden.', safe:true }];
    AI.AUDIT.automations = [{ ref:'AUTO-ENGINE-v1', type:'System', note:'5 triggers configured, 4 active.' }];
    AI.AUDIT.portal = [{ ref:'PORTAL-SUMMIT', type:'Client View', note:'Rendering Summit Holdings: 3 projects, 3 invoices, 4 docs, 3 msgs.' }];
  }

  document.addEventListener('DOMContentLoaded', function() {
    var grid = document.getElementById('dashboard-grid');
    if (grid && !grid.querySelector('[data-widget-id="rel-risk"]')) {
      var tpl = document.getElementById('wtpl-rel-risk');
      if (tpl) { var clone = tpl.content.cloneNode(true); grid.appendChild(clone); }
    }
  });
})();


/* ── SIDEBAR: Collapse, Resize & Section Toggle ──────────── */
(function(){
  'use strict';

  /* — Collapse / Expand toggle — */
  window.toggleSidebarCollapse = function() {
    var sidebar = document.querySelector('.sidebar');
    var isCollapsed = sidebar.classList.toggle('collapsed');
    if (isCollapsed) {
      sidebar.dataset.expandedWidth = sidebar.style.width || '220px';
      sidebar.style.width = '';
    } else {
      var w = sidebar.dataset.expandedWidth || '220px';
      sidebar.style.width = w;
    }
    localStorage.setItem('sidebar-collapsed', isCollapsed ? '1' : '0');
  };

  /* — Section collapse / expand — */
  document.querySelectorAll('.sidebar-group-label').forEach(function(label) {
    label.addEventListener('click', function() {
      var sidebar = document.querySelector('.sidebar');
      if (sidebar.classList.contains('collapsed')) return;
      var section = label.closest('.sidebar-section');
      if (!section) return;
      section.classList.toggle('section-collapsed');
      saveSectionStates();
    });
  });

  function saveSectionStates() {
    var states = [];
    document.querySelectorAll('.sidebar-section').forEach(function(s) {
      states.push(s.classList.contains('section-collapsed') ? '1' : '0');
    });
    localStorage.setItem('sidebar-sections', states.join(','));
  }

  /* — Drag resize — */
  var handle = document.getElementById('sidebarResizeHandle');
  var sidebar = document.querySelector('.sidebar');
  if (handle && sidebar) {
    var startX, startW;
    handle.addEventListener('mousedown', function(e) {
      if (sidebar.classList.contains('collapsed')) return;
      e.preventDefault();
      startX = e.clientX;
      startW = sidebar.offsetWidth;
      sidebar.classList.add('resizing');
      handle.classList.add('active');
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    function onMove(e) {
      var w = Math.max(180, Math.min(360, startW + (e.clientX - startX)));
      sidebar.style.width = w + 'px';
    }
    function onUp() {
      sidebar.classList.remove('resizing');
      handle.classList.remove('active');
      sidebar.dataset.expandedWidth = sidebar.offsetWidth + 'px';
      localStorage.setItem('sidebar-width', sidebar.offsetWidth);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
  }

  /* — Restore state on load — */
  function restoreSidebarState() {
    var sb = document.querySelector('.sidebar');
    if (localStorage.getItem('sidebar-collapsed') === '1') {
      sb.classList.add('collapsed');
    } else {
      var saved = localStorage.getItem('sidebar-width');
      if (saved) { sb.style.width = saved + 'px'; sb.dataset.expandedWidth = saved + 'px'; }
    }
    var ss = localStorage.getItem('sidebar-sections');
    if (ss) {
      var arr = ss.split(',');
      document.querySelectorAll('.sidebar-section').forEach(function(s, i) {
        if (arr[i] === '1') s.classList.add('section-collapsed');
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreSidebarState);
  } else {
    restoreSidebarState();
  }
})();


/* ── SIDEBAR: Shadow Items (hidden-but-visible with activation) ── */
(function(){
  'use strict';

  var _shadowReasons = {
    companies: 'Your profile focuses on individual clients. Companies is typically used for B2B client management — but you can activate it if needed.',
    invoices:  'Invoicing is not enabled for your profile. This is common for broker models where billing is handled externally — but you can activate it here.',
    pipeline:  'Your profile uses a different client intake model. Pipeline is typically used for sales-driven workflows — but you can enable it if you need it.'
  };

  /* — Override persistence — */
  window._getSidebarOverrides = function() {
    try {
      return JSON.parse(localStorage.getItem('sidebar-overrides') || '[]');
    } catch(e) { return []; }
  };

  function _saveSidebarOverride(screen) {
    var arr = _getSidebarOverrides();
    if (arr.indexOf(screen) === -1) arr.push(screen);
    localStorage.setItem('sidebar-overrides', JSON.stringify(arr));
  }

  function _removeSidebarOverride(screen) {
    var arr = _getSidebarOverrides();
    var idx = arr.indexOf(screen);
    if (idx !== -1) arr.splice(idx, 1);
    localStorage.setItem('sidebar-overrides', JSON.stringify(arr));
  }

  window._addDeactivateBtn = function(el, screen) {
    if (el.querySelector('.deactivate-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'deactivate-btn';
    btn.title = 'Deactivate';
    btn.innerHTML = '<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      _deactivateSidebarItem(screen);
    });
    el.appendChild(btn);
  }

  function _deactivateSidebarItem(screen) {
    _removeSidebarOverride(screen);
    var el = document.querySelector('.sidebar-item[data-user-activated="' + screen + '"]');
    if (el) {
      el.classList.add('shadow');
      el.setAttribute('data-shadow-screen', screen);
      el.removeAttribute('data-user-activated');
      var btn = el.querySelector('.deactivate-btn');
      if (btn) btn.remove();
      // Re-add lock icon
      var lockSvg = document.createElement('span');
      lockSvg.className = 'shadow-lock';
      lockSvg.innerHTML = '<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="opacity:.4;margin-left:auto"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>';
      el.appendChild(lockSvg);
    }
    if (typeof _showToast === 'function') _showToast('Item deactivated');
  }

  /* — Popover — */
  var _activePopover = null;

  function _closePopover() {
    if (_activePopover) { _activePopover.remove(); _activePopover = null; }
  }

  function _showShadowPopover(el) {
    _closePopover();
    var screen = el.getAttribute('data-shadow-screen');
    if (!screen) return;
    var reason = _shadowReasons[screen] || 'This feature is not included in your current profile, but you can activate it.';
    var label = el.textContent.trim().replace(/[\s\S]*?(?=[A-Z])/, '').split('\n')[0] || screen;
    // Get clean label from visible text
    var textNodes = [];
    el.childNodes.forEach(function(n){ if (n.nodeType === 3 && n.textContent.trim()) textNodes.push(n.textContent.trim()); });
    if (textNodes.length) label = textNodes[0];

    var pop = document.createElement('div');
    pop.className = 'shadow-popover';
    pop.innerHTML =
      '<div class="shadow-popover-title">' +
        '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
        label +
      '</div>' +
      '<div class="shadow-popover-text">' + reason + '</div>' +
      '<div class="shadow-popover-actions">' +
        '<button class="shadow-popover-activate" data-screen="' + screen + '">Activate</button>' +
        '<button class="shadow-popover-dismiss"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>' +
      '</div>';

    document.body.appendChild(pop);
    _activePopover = pop;

    // Position next to the item
    var rect = el.getBoundingClientRect();
    var popH = pop.offsetHeight;
    var top = rect.top;
    if (top + popH > window.innerHeight - 16) top = window.innerHeight - popH - 16;
    if (top < 8) top = 8;
    pop.style.left = (rect.right + 8) + 'px';
    pop.style.top = top + 'px';

    // Activate button
    pop.querySelector('.shadow-popover-activate').addEventListener('click', function(){
      var scr = this.getAttribute('data-screen');
      _saveSidebarOverride(scr);
      var item = document.querySelector('.sidebar-item[data-shadow-screen="' + scr + '"]');
      if (item) {
        item.classList.remove('shadow');
        item.removeAttribute('data-shadow-screen');
        item.setAttribute('data-user-activated', scr);
        var lock = item.querySelector('.shadow-lock');
        if (lock) lock.remove();
        _addDeactivateBtn(item, scr);
      }
      _closePopover();
      if (typeof _showToast === 'function') _showToast(label + ' activated!');
    });

    // Dismiss button
    pop.querySelector('.shadow-popover-dismiss').addEventListener('click', _closePopover);
  }

  /* — Intercept clicks on shadow items — */
  document.addEventListener('click', function(e) {
    var shadowItem = e.target.closest('.sidebar-item.shadow');
    if (shadowItem) {
      e.preventDefault();
      e.stopPropagation();
      _showShadowPopover(shadowItem);
      return;
    }
    // Close popover when clicking outside
    if (_activePopover && !e.target.closest('.shadow-popover')) {
      _closePopover();
    }
  }, true);

})();

/* ── Contacts List V2 — Rich Dynamic Rendering ────────────── */
(function(){
  'use strict';

  var CT_AVATAR_COLORS = ['#4A8FFF','#7B5FFF','#3DD68C','#F0A843','#F07070','#FF6FB5','#00BCD4','#8BC34A'];
  function ctAvatarColor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return CT_AVATAR_COLORS[Math.abs(h) % CT_AVATAR_COLORS.length];
  }
  function ctInitials(name) {
    var p = name.split(/\s+/);
    return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name.substring(0,2).toUpperCase();
  }
  function ctRelDate(d) {
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return d + 'd ago';
    if (d < 30) return Math.floor(d / 7) + 'w ago';
    return Math.floor(d / 30) + 'mo ago';
  }
  function ctDotCls(d) { return d <= 7 ? 'recent' : d <= 21 ? 'stale' : 'overdue'; }

  function ctSparkSvg(data) {
    var mx = Math.max.apply(null, data) || 1;
    var bars = '';
    for (var i = 0; i < data.length; i++) {
      var bh = Math.max(2, Math.round((data[i] / mx) * 18));
      bars += '<rect x="' + (i * 6) + '" y="' + (20 - bh) + '" width="4" height="' + bh + '" rx="1" fill="currentColor" opacity="0.5"/>';
    }
    return '<svg width="40" height="20" viewBox="0 0 40 20" style="color:var(--accent)">' + bars + '</svg>';
  }

  var CONTACTS_DATA = [
    { id:'CF000130', name:'Stephanus Van Deventer', role:'Director', company:'Legal Clear', email:'s.vandeventer@legalclear.co.za', phone:'+27 82 345 6789', mobile:'+27 82 345 6789', ext:'102', idNumber:'8801015023088', source:'referral', type:'director', status:'active', daysSinceContact:0, activity:[3,5,4,6,2,5,4], linkedin:'https://linkedin.com/in/stephanusvandeventer', twitter:'@svdeventer', prefComm:'Email', language:'Afrikaans', birthday:'1988-03-05', spouse:'Elané', notes:'Handles all compliance matters. Very detail-oriented — always send meeting agendas in advance.' },
    { id:'CF000129', name:'Megan Naidoo', role:'CEO', company:'Cape Digital Ltd', email:'m.naidoo@capedigital.co.za', phone:'+27 71 234 5678', mobile:'+27 82 111 2233', idNumber:'9203224182081', source:'website', type:'director', status:'active', daysSinceContact:0, activity:[5,4,6,3,7,5,4], linkedin:'https://linkedin.com/in/megannaidoo', facebook:'https://facebook.com/megan.naidoo', instagram:'@megannaidoo', prefComm:'WhatsApp', language:'English', birthday:'1992-03-22', notes:'Key decision maker. Interested in expanding digital services. Prefers WhatsApp for quick updates.' },
    { id:'CF000128', name:'André du Plessis', role:'CFO', company:'Vertex Holdings', email:'a.duplessis@vertex.co.za', phone:'+27 83 456 7890', ext:'201', idNumber:'7705135149088', source:'direct', type:'director', status:'active', daysSinceContact:1, activity:[2,3,1,4,2,3,2], linkedin:'https://linkedin.com/in/andreduplessis', prefComm:'Email', language:'Afrikaans', notes:'Signs off on all invoices over R50k. Strict on payment terms — always net 30.' },
    { id:'CF000127', name:'Nomvula Dlamini', role:'Ops Manager', company:'Sunrise Finance', email:'n.dlamini@sunrisefinance.co.za', phone:'+27 84 567 8901', idNumber:'8506065319087', source:'website', type:'individual', status:'active', daysSinceContact:4, activity:[1,2,3,1,2,1,3], prefComm:'Phone', language:'Zulu' },
    { id:'CF000126', name:'Pieter Engelbrecht', role:'Compliance Officer', company:'Legal Clear', email:'p.engelbrecht@legalclear.co.za', phone:'+27 72 678 9012', idNumber:'6909185028081', source:'referral', type:'shareholder', status:'active', daysSinceContact:6, activity:[4,3,5,2,4,3,5] },
    { id:'CF000125', name:'Thandiwe Mokoena', role:'Operations Director', company:'Harvest Agri (Pty) Ltd', email:'t.mokoena@harvestagri.co.za', phone:'+27 79 321 4567', mobile:'+27 79 321 4567', idNumber:'9107230158083', source:'referral', type:'director', status:'active', daysSinceContact:3, activity:[6,5,7,4,6,5,8], linkedin:'https://linkedin.com/in/thandiwe-mokoena', facebook:'https://facebook.com/thandiwe.mokoena', prefComm:'WhatsApp', language:'Sotho', birthday:'1991-07-23', spouse:'Tshepo', notes:'Runs all on-site operations. Best reached before 9am or after 4pm — on the floor during the day.' },
    { id:'CF000124', name:'James Botha', role:'Managing Partner', company:'Legal Clear', email:'j.botha@legalclear.co.za', phone:'+27 21 555 0100', mobile:'+27 83 555 0101', ext:'101', idNumber:'7812045032080', source:'direct', type:'director', status:'active', daysSinceContact:2, activity:[4,5,3,6,4,5,3], linkedin:'https://linkedin.com/in/jamesbotha', twitter:'@jamesbotha_law', prefComm:'Email', language:'English', birthday:'1978-12-04', spouse:'Sarah', notes:'Primary decision-maker. Prefers WhatsApp for quick updates. Golf on Fridays \u2014 avoid scheduling calls after 2pm.' },
    { id:'CF000123', name:'Fatima Patel', role:'Finance Manager', company:'Global Corp', email:'f.patel@globalcorp.co.za', phone:'+27 83 222 3344', idNumber:'8503150089087', source:'website', type:'individual', status:'active', daysSinceContact:8, activity:[3,2,4,3,2,3,4], linkedin:'https://linkedin.com/in/fatimapatel', language:'English' },
    { id:'CF000122', name:'Willem Kruger', role:'Legal Advisor', company:'Summit Holdings', email:'w.kruger@summitholdings.co.za', phone:'+27 76 444 5566', idNumber:'7201085134082', source:'referral', type:'trustee', status:'active', daysSinceContact:5, activity:[5,4,6,5,3,4,6], prefComm:'Email', language:'Afrikaans' },
    { id:'CF000121', name:'Lerato Khumalo', role:'Trustee', company:'Sunrise Finance', email:'l.khumalo@sunrisefinance.co.za', phone:'+27 82 777 8899', idNumber:'8904120267088', source:'direct', type:'trustee', status:'inactive', daysSinceContact:32, activity:[1,0,1,0,0,1,0] },
    { id:'CF000120', name:'Riaan van der Merwe', role:'Shareholder', company:'TechVentures', email:'r.vdmerwe@techventures.co.za', phone:'+27 71 888 9900', mobile:'+27 82 888 9901', idNumber:'8005225098085', source:'website', type:'shareholder', status:'active', daysSinceContact:1, activity:[7,8,6,9,7,8,10], linkedin:'https://linkedin.com/in/riaanvdmerwe', twitter:'@riaanvdm', instagram:'@riaanvdmerwe', facebook:'https://facebook.com/riaan.vandermerwe', prefComm:'WhatsApp', language:'English', birthday:'1980-05-22', spouse:'Liesl', notes:'Active angel investor. Looking to expand into fintech. Introduced us to three new prospects last quarter.' },
    { id:'CF000119', name:'Zanele Sithole', role:'Company Secretary', company:'Protea Insurance', email:'z.sithole@proteains.co.za', phone:'+27 84 111 2233', idNumber:'9302180143086', source:'referral', type:'individual', status:'active', daysSinceContact:6, activity:[4,3,5,4,3,4,5], linkedin:'https://linkedin.com/in/zanelesithole', prefComm:'Email', language:'Zulu', birthday:'1993-02-18' },
    { id:'CF000118', name:'David Malherbe', role:'Non-Exec Director', company:'Blue Ocean Fund', email:'d.malherbe@blueocean.co.za', phone:'+27 82 333 4455', idNumber:'6711095012089', source:'direct', type:'director', status:'active', daysSinceContact:14, activity:[3,2,4,3,2,3,4], language:'Afrikaans' },
    { id:'CF000117', name:'Priya Govender', role:'Tax Consultant', company:'Axis Medical', email:'p.govender@axismedical.co.za', phone:'+27 73 555 6677', idNumber:'8808280195082', source:'website', type:'individual', status:'active', daysSinceContact:21, activity:[2,3,1,2,3,1,2], linkedin:'https://linkedin.com/in/priyagovender', prefComm:'Email', language:'English' },
    { id:'CF000116', name:'Thabo Molefe', role:'Former Director', company:'Novus Capital', email:'t.molefe@novuscap.co.za', phone:'+27 79 666 7788', idNumber:'7506155048083', source:'referral', type:'director', status:'inactive', daysSinceContact:45, activity:[0,1,0,0,1,0,0] },
    { id:'CF000115', name:'Christina Louw', role:'Accountant', company:'Cape Digital Ltd', email:'c.louw@capedigital.co.za', phone:'+27 82 999 0011', idNumber:'9005120234087', source:'website', type:'individual', status:'active', daysSinceContact:5, activity:[5,3,6,4,2,5,7], facebook:'https://facebook.com/christina.louw', instagram:'@christina_louw', language:'Afrikaans', birthday:'1990-05-12' },
    { id:'CF000114', name:'Sipho Ndaba', role:'CTO', company:'TechVentures', email:'s.ndaba@techventures.co.za', phone:'+27 71 222 3344', mobile:'+27 82 222 3345', idNumber:'8703180099084', source:'direct', type:'director', status:'active', daysSinceContact:1, activity:[8,7,9,6,8,7,9], linkedin:'https://linkedin.com/in/siphondaba', twitter:'@siphondaba', instagram:'@sipho.tech', prefComm:'WhatsApp', language:'Zulu', birthday:'1987-03-18', notes:'Technical gatekeeper for all integrations. Needs API documentation before any meeting.' },
    { id:'CF000113', name:'Anneliese Pretorius', role:'HR Director', company:'Summit Holdings', email:'a.pretorius@summitholdings.co.za', phone:'+27 84 444 5566', mobile:'+27 82 444 5567', ext:'305', idNumber:'8201050178086', source:'referral', type:'director', status:'active', daysSinceContact:2, activity:[6,5,7,4,8,6,5], linkedin:'https://linkedin.com/in/anneliese-pretorius', facebook:'https://facebook.com/anneliese.pretorius', prefComm:'Phone', language:'Afrikaans', birthday:'1982-01-05', spouse:'Jan', notes:'Handles all staff onboarding. Contact for employment contract reviews and FICA documentation.' }
  ];

  // Build company→relationshipType lookup for contact inheritance
  function getContactRelType(contact) {
    if (contact.relationshipType) return contact.relationshipType;
    var companies = window.COMPANIES_DATA || [];
    for (var i = 0; i < companies.length; i++) {
      if (companies[i].name === contact.company) return companies[i].relationshipType || 'contact';
    }
    return 'contact';
  }
  window.getContactRelType = getContactRelType;
  window.CONTACTS_DATA = CONTACTS_DATA;

  /* ── Social / personal helpers ── */
  function ctHasSocial(c) { return !!(c.linkedin || c.facebook || c.twitter || c.instagram); }

  function ctSocialIcons(c, sz) {
    if (!ctHasSocial(c)) return '';
    sz = sz || 14;
    var h = '';
    if (c.linkedin)  h += '<a class="ct-social-link linkedin" href="'+c.linkedin+'" title="LinkedIn" onclick="event.stopPropagation()" target="_blank"><svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg></a>';
    if (c.twitter)   h += '<a class="ct-social-link twitter" href="https://x.com/'+c.twitter.replace('@','')+'" title="X / Twitter" onclick="event.stopPropagation()" target="_blank"><svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>';
    if (c.facebook)  h += '<a class="ct-social-link facebook" href="'+c.facebook+'" title="Facebook" onclick="event.stopPropagation()" target="_blank"><svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg></a>';
    if (c.instagram) h += '<a class="ct-social-link instagram" href="https://instagram.com/'+c.instagram.replace('@','')+'" title="Instagram" onclick="event.stopPropagation()" target="_blank"><svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>';
    return h;
  }
  window.ctSocialIcons = ctSocialIcons;

  function ctBirthdaySoon(c) {
    if (!c.birthday) return false;
    var today = new Date(); today.setHours(0,0,0,0);
    var parts = c.birthday.split('-');
    var bd = new Date(today.getFullYear(), parseInt(parts[1],10)-1, parseInt(parts[2],10));
    if (bd < today) bd.setFullYear(bd.getFullYear()+1);
    var diff = (bd - today) / 86400000;
    return diff <= 7;
  }

  function ctFormatBirthday(c) {
    if (!c.birthday) return '';
    var parts = c.birthday.split('-');
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return parseInt(parts[2],10) + ' ' + months[parseInt(parts[1],10)-1];
  }

  function ctFormatBirthdayFull(c) {
    if (!c.birthday) return '';
    var parts = c.birthday.split('-');
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return parseInt(parts[2],10) + ' ' + months[parseInt(parts[1],10)-1] + ' ' + parts[0];
  }

  function ctBirthdayAge(c) {
    if (!c.birthday) return '';
    var today = new Date(); today.setHours(0,0,0,0);
    var parts = c.birthday.split('-');
    var birthYear = parseInt(parts[0],10);
    var bd = new Date(today.getFullYear(), parseInt(parts[1],10)-1, parseInt(parts[2],10));
    if (bd < today) bd.setFullYear(bd.getFullYear()+1);
    var diff = Math.round((bd - today) / 86400000);
    var turnsAge = bd.getFullYear() - birthYear;
    if (diff <= 30) return '<span class="cc-bday-soon">turns ' + turnsAge + ' in ' + diff + ' days</span>';
    return '';
  }

  function ctRoleClass(role) {
    var r = (role||'').toLowerCase();
    if (r.indexOf('ceo')!==-1||r.indexOf('owner')!==-1||r.indexOf('managing')!==-1||r.indexOf('partner')!==-1||r.indexOf('director')!==-1&&r.indexOf('non')===-1) return 'cc-role-ceo';
    if (r.indexOf('cfo')!==-1||r.indexOf('finance')!==-1||r.indexOf('account')!==-1) return 'cc-role-accts';
    if (r.indexOf('hr')!==-1||r.indexOf('human')!==-1) return 'cc-role-hr';
    if (r.indexOf('ops')!==-1||r.indexOf('operation')!==-1) return 'cc-role-ops';
    if (r.indexOf('cto')!==-1||r.indexOf('tech')!==-1||r.indexOf('it ')!==-1) return 'cc-role-lead';
    if (r.indexOf('compliance')!==-1||r.indexOf('legal')!==-1||r.indexOf('secretary')!==-1) return 'cc-role-buyer';
    if (r.indexOf('tax')!==-1||r.indexOf('consultant')!==-1) return 'cc-role-accts';
    return 'cc-role-ops';
  }

  /* ── Inline note editing on contact cards ── */
  window.ctAddNoteInline = function(contactId, el) {
    var input = document.createElement('textarea');
    input.className = 'cc-notes-inline';
    input.placeholder = 'Type a note…';
    input.rows = 3;
    el.replaceWith(input);
    input.focus();
    input.addEventListener('blur', function() {
      var val = input.value.trim();
      if (val) {
        // Save to data
        for (var i = 0; i < CONTACTS_DATA.length; i++) {
          if (CONTACTS_DATA[i].id === contactId) { CONTACTS_DATA[i].notes = val; break; }
        }
        renderContacts();
        if (typeof showToast === 'function') showToast('Note saved');
      } else {
        renderContacts();
      }
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = ''; input.blur(); }
    });
  };

  var ctState = { view:'list', filters:{ctStatus:'all',ctSource:'all',ctCompany:'all',ctType:'all',ctRelationship:'all'}, search:'', sort:{field:'name',dir:'asc'}, page:1 };

  function getCtFiltered() {
    var list = CONTACTS_DATA.slice();
    if (ctState.search) {
      var q = ctState.search.toLowerCase();
      list = list.filter(function(c) {
        return c.name.toLowerCase().indexOf(q) !== -1 || c.company.toLowerCase().indexOf(q) !== -1 || c.email.toLowerCase().indexOf(q) !== -1 || c.role.toLowerCase().indexOf(q) !== -1;
      });
    }
    if (ctState.filters.ctStatus !== 'all') {
      list = list.filter(function(c) { return c.status === ctState.filters.ctStatus; });
    }
    if (ctState.filters.ctSource !== 'all') {
      list = list.filter(function(c) { return c.source === ctState.filters.ctSource; });
    }
    if (ctState.filters.ctCompany !== 'all') {
      list = list.filter(function(c) { return c.company === ctState.filters.ctCompany; });
    }
    if (ctState.filters.ctType !== 'all') {
      list = list.filter(function(c) { return c.type === ctState.filters.ctType; });
    }
    if (ctState.filters.ctRelationship !== 'all') {
      list = list.filter(function(c) { return getContactRelType(c) === ctState.filters.ctRelationship; });
    }
    list.sort(function(a, b) {
      var av = a[ctState.sort.field], bv = b[ctState.sort.field];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase(); }
      var cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return ctState.sort.dir === 'desc' ? -cmp : cmp;
    });
    return list;
  }

  function renderCtRow(c) {
    var statusCls = c.status === 'active' ? 'active' : 'inactive';
    var statusLabel = c.status === 'active' ? 'Active' : 'Inactive';
    var relType = getContactRelType(c);
    var relLabel = relType.charAt(0).toUpperCase() + relType.slice(1);
    var relInherited = !c.relationshipType && c.company;
    var bdFlag = ctBirthdaySoon(c) ? '<span class="ct-birthday-flag" title="Birthday on '+ctFormatBirthday(c)+'">&#127874;</span>' : '';
    var socials = ctSocialIcons(c, 13);
    // Enhanced actions
    var actions = '<button class="comp-action-btn" title="Email '+c.email+'" onclick="event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></button>';
    actions += '<button class="comp-action-btn" title="Call '+c.phone+'" onclick="event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></button>';
    if (c.linkedin) actions += '<a class="comp-action-btn" title="LinkedIn" href="'+c.linkedin+'" target="_blank" onclick="event.stopPropagation()"><svg fill="currentColor" viewBox="0 0 24 24" width="14" height="14"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg></a>';
    if (c.mobile) actions += '<a class="comp-action-btn" title="WhatsApp '+c.mobile+'" href="https://wa.me/'+c.mobile.replace(/[\s+]/g,'')+'" target="_blank" onclick="event.stopPropagation()"><svg fill="currentColor" viewBox="0 0 24 24" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>';
    return '<div class="ct-row-v2" onclick="openContactDetail(\'' + c.id + '\')">' +
      '<div><div class="ct-avatar" style="background:' + ctAvatarColor(c.name) + '">' + ctInitials(c.name) + '</div></div>' +
      '<div class="ct-name-cell"><div class="ct-name-info"><span class="ct-name-v2">' + c.name + bdFlag + '</span><span class="ct-role-v2">' + c.role + '</span></div></div>' +
      '<div class="ct-company-cell"><span class="ct-company-v2" onclick="event.stopPropagation();switchScreen(\'company\')">' + c.company + '</span></div>' +
      '<div><span class="comp-tag rel-' + relType + '">' + relLabel + '</span>' + (relInherited ? '<span class="ct-rel-via" title="Inherited from ' + c.company + '">via co.</span>' : '') + '</div>' +
      '<div><span class="ct-source-pill ' + c.source + '">' + c.source.charAt(0).toUpperCase() + c.source.slice(1) + '</span></div>' +
      '<div class="ct-social-cell">' + (socials ? '<div class="ct-social-icons">' + socials + '</div>' : '<span class="ct-no-social">—</span>') + '</div>' +
      '<div><div class="comp-last-contact"><span class="comp-contact-dot ' + ctDotCls(c.daysSinceContact) + '"></span>' + ctRelDate(c.daysSinceContact) + '</div></div>' +
      '<div>' + ctSparkSvg(c.activity) + '</div>' +
      '<div><span class="ct-status-v2 ' + statusCls + '">' + statusLabel + '</span></div>' +
      '<div class="comp-actions">' + actions + '</div></div>';
  }

  function renderCtCard(c) {
    var relType = getContactRelType(c);
    var relLabel = relType.charAt(0).toUpperCase() + relType.slice(1);
    var isPrimary = !!c.primary;
    var socials = ctSocialIcons(c, 14);
    var roleCls = ctRoleClass(c.role);

    var html = '<div class="cc-card' + (isPrimary?' is-main':'') + '" onclick="openContactDetail(\'' + c.id + '\')">';

    // ── Top: avatar + name + role ──
    html += '<div class="cc-top">' +
      '<div class="cc-avatar" style="background:' + ctAvatarColor(c.name) + '">' + ctInitials(c.name) + '</div>' +
      '<div class="cc-name-block">' +
        '<div class="cc-name">' + c.name + (isPrimary?' <span class="cc-star" title="Primary contact">&#9733;</span>':'') + '</div>' +
        '<span class="cc-role ' + roleCls + '">' + c.role + '</span>' +
      '</div>' +
    '</div>';

    html += '<div class="cc-div"></div>';

    // ── Contact details: phone + email ──
    html += '<div class="cc-details">';
    html += '<div class="cc-row"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>' + c.phone + (c.ext ? ' <span class="cc-ext">Ext ' + c.ext + '</span>' : '') + '</div>';
    html += '<div class="cc-row"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><a href="mailto:' + c.email + '" onclick="event.stopPropagation()">' + c.email + '</a></div>';
    html += '</div>';

    // ── Birthday (if exists) ──
    if (c.birthday) {
      var bdFull = ctFormatBirthdayFull(c);
      var bdAge = ctBirthdayAge(c);
      html += '<div class="cc-bday"><span>&#127874;</span><span class="cc-bday-val">' + bdFull + '</span>' + bdAge + '</div>';
    }

    // ── Social row (if any) ──
    if (socials) {
      html += '<div class="cc-socials-row">' + socials + '</div>';
    }

    // ── Tags: relationship + source + company ──
    html += '<div class="cc-tags">' +
      '<span class="comp-tag rel-' + relType + '">' + relLabel + '</span>' +
      '<span class="ct-source-pill ' + c.source + '">' + c.source.charAt(0).toUpperCase() + c.source.slice(1) + '</span>' +
      '<span class="cc-company-tag" onclick="event.stopPropagation();switchScreen(\'company\')">' + c.company + '</span>' +
    '</div>';

    html += '<div class="cc-div"></div>';

    // ── Notes (always show section — editable) ──
    html += '<div class="cc-notes-area">' +
      '<div class="cc-notes-lbl">Notes</div>' +
      (c.notes
        ? '<div class="cc-notes-body">' + c.notes + '</div>'
        : '<div class="cc-notes-empty" onclick="event.stopPropagation();ctAddNoteInline(\'' + c.id + '\',this)">+ Add a note…</div>') +
    '</div>';

    // ── Actions: Email / Call / View ──
    html += '<div class="cc-actions">' +
      '<button class="cc-act" onclick="event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Email</button>' +
      '<button class="cc-act" onclick="event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> Call</button>' +
      '<button class="cc-act" onclick="event.stopPropagation();openContactDetail(\'' + c.id + '\')"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> View</button>' +
    '</div>';

    html += '</div>';
    return html;
  }

  function renderCtStatsBar() {
    var data = CONTACTS_DATA;
    var total = data.length;
    var active = data.filter(function(c) { return c.status === 'active'; }).length;
    var clientContacts = data.filter(function(c) { return getContactRelType(c) === 'client'; }).length;
    var prospectContacts = data.filter(function(c) { return getContactRelType(c) === 'prospect'; }).length;
    var bar = document.getElementById('ct-stats-bar');
    if (!bar) return;
    bar.innerHTML =
      '<div class="comp-stat-item"><span class="comp-stat-value">' + total + '</span><span class="comp-stat-label">Total</span></div>' +
      '<div class="comp-stat-divider"></div>' +
      '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#3DD68C">' + clientContacts + '</span><span class="comp-stat-label">Client</span></div>' +
      '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#4A8FFF">' + prospectContacts + '</span><span class="comp-stat-label">Prospect</span></div>' +
      '<div class="comp-stat-divider"></div>' +
      '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#3DD68C">' + active + '</span><span class="comp-stat-label">Active</span></div>' +
      '<div class="comp-stat-item"><span class="comp-stat-value" style="color:#5A7080">' + (total - active) + '</span><span class="comp-stat-label">Inactive</span></div>';
  }

  window.renderContacts = function() {
    var filtered = getCtFiltered();
    var perPage = parseInt((document.getElementById('ct-per-page') || {}).value) || 10;
    var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (ctState.page > totalPages) ctState.page = totalPages;
    var start = (ctState.page - 1) * perPage;
    var pageItems = filtered.slice(start, start + perPage);

    var body = document.getElementById('ct-rows-body');
    if (body) body.innerHTML = pageItems.map(renderCtRow).join('');

    var grid = document.getElementById('ct-grid-body');
    if (grid) grid.innerHTML = pageItems.map(renderCtCard).join('');

    var countEl = document.getElementById('ct-footer-count');
    if (countEl) countEl.textContent = filtered.length === 0 ? 'No contacts found' : 'Showing ' + (start + 1) + '\u2013' + Math.min(start + perPage, filtered.length) + ' of ' + filtered.length + ' contacts';
    var pageEl = document.getElementById('ct-page-info');
    if (pageEl) pageEl.textContent = 'Page ' + ctState.page + ' of ' + totalPages;

    renderCtStatsBar();
  };

  window.setCtView = function(v) {
    ctState.view = v;
    document.querySelectorAll('#screen-contacts .comp-view-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.view === v); });
    var listC = document.getElementById('ct-list-container');
    var gridC = document.getElementById('ct-grid-container');
    if (listC) listC.style.display = v === 'list' ? '' : 'none';
    if (gridC) gridC.classList.toggle('active', v === 'grid');
  };

  window.ctPagePrev = function() { if (ctState.page > 1) { ctState.page--; renderContacts(); } };
  window.ctPageNext = function() {
    var filtered = getCtFiltered();
    var perPage = parseInt((document.getElementById('ct-per-page') || {}).value) || 10;
    var totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (ctState.page < totalPages) { ctState.page++; renderContacts(); }
  };

  // Populate company filter dynamically
  function populateCompanyFilter() {
    var companies = [];
    CONTACTS_DATA.forEach(function(c) { if (companies.indexOf(c.company) === -1) companies.push(c.company); });
    companies.sort();
    var drop = document.getElementById('ct-filter-company');
    if (!drop) return;
    var opts = '<div class="comp-filter-opt selected" data-val="all">All</div>';
    companies.forEach(function(co) { opts += '<div class="comp-filter-opt" data-val="' + co + '">' + co + '</div>'; });
    drop.innerHTML = opts;
  }

  window.openNewContactModal = function() {
    if (typeof openAddContactModal === 'function') {
      openAddContactModal();
    } else {
      document.getElementById('add-contact-overlay').style.display = 'flex';
    }
  };

  function initContactsListeners() {
    populateCompanyFilter();

    var searchEl = document.getElementById('ct-search');
    if (searchEl) searchEl.addEventListener('input', function() { ctState.search = this.value; ctState.page = 1; renderContacts(); });

    // Filter chip toggles
    document.querySelectorAll('#screen-contacts .ct-filter-chip').forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        var drop = this.parentElement.querySelector('.ct-filter-drop');
        document.querySelectorAll('.ct-filter-drop.open').forEach(function(d) { if (d !== drop) d.classList.remove('open'); });
        document.querySelectorAll('.comp-filter-drop.open').forEach(function(d) { d.classList.remove('open'); });
        if (drop) drop.classList.toggle('open');
        e.stopPropagation();
      });
    });
    document.querySelectorAll('.ct-filter-drop .comp-filter-opt').forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        var drop = this.closest('.ct-filter-drop');
        var chip = this.closest('.comp-filter-wrap').querySelector('.ct-filter-chip');
        var filterKey = chip.dataset.filter;
        drop.querySelectorAll('.comp-filter-opt').forEach(function(o) { o.classList.remove('selected'); });
        this.classList.add('selected');
        ctState.filters[filterKey] = this.dataset.val;
        ctState.page = 1;
        drop.classList.remove('open');
        var labels = {ctStatus:'Status',ctSource:'Source',ctCompany:'Company',ctType:'Type',ctRelationship:'Relationship'};
        chip.firstChild.textContent = (this.dataset.val === 'all' ? labels[filterKey] : this.textContent) + ' ';
        renderContacts();
        e.stopPropagation();
      });
    });
    document.addEventListener('click', function() { document.querySelectorAll('.ct-filter-drop.open').forEach(function(d) { d.classList.remove('open'); }); });

    // Sort headers
    document.querySelectorAll('#screen-contacts .ct-cols-v2 .ct-col-sort').forEach(function(col) {
      col.style.cursor = 'pointer';
      col.addEventListener('click', function() {
        var field = this.dataset.sort;
        if (ctState.sort.field === field) ctState.sort.dir = ctState.sort.dir === 'asc' ? 'desc' : 'asc';
        else { ctState.sort.field = field; ctState.sort.dir = 'asc'; }
        renderContacts();
      });
    });

    // Hook into switchScreen
    var _ctOrigSwitch = window.switchScreen;
    window.switchScreen = function(name) {
      _ctOrigSwitch(name);
      if (name === 'contacts') setTimeout(renderContacts, 50);
    };

    renderContacts();
  }

  // Run immediately if DOM already loaded, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactsListeners);
  } else {
    initContactsListeners();
  }
})();

/* ── PAY RUNS + PAYSLIPS IIFE ──────────────────────────── */
(function(){
  'use strict';

  var AVATAR_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];
  function avatarColor(n){ var h=0; for(var i=0;i<n.length;i++) h=n.charCodeAt(i)+((h<<5)-h); return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length]; }
  function prInitials(f,l){ return (f.charAt(0)+l.charAt(0)).toUpperCase(); }
  function fmt(amt){
    var c=COUNTRY_META[(prState&&prState.settings&&prState.settings.country)||'ZA'];
    if(!amt&&amt!==0) return c.sym+' 0.00';
    return c.sym+' '+Number(amt).toLocaleString(c.locale,{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  function fmtDate(ds){ if(!ds) return '—'; var d=new Date(ds); var m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return d.getDate()+' '+m[d.getMonth()]+' '+d.getFullYear(); }
  function maskAcct(num){ if(!num) return '—'; return '****'+num.slice(-4); }

  /* ── COUNTRY METADATA ──────────────────────────────── */
  var COUNTRY_META = {
    ZA:{name:'South Africa',flag:'\u{1F1FF}\u{1F1E6}',sym:'R',code:'ZAR',locale:'en-ZA'},
    UK:{name:'United Kingdom',flag:'\u{1F1EC}\u{1F1E7}',sym:'£',code:'GBP',locale:'en-GB'},
    US:{name:'United States',flag:'\u{1F1FA}\u{1F1F8}',sym:'$',code:'USD',locale:'en-US'},
    AU:{name:'Australia',flag:'\u{1F1E6}\u{1F1FA}',sym:'A$',code:'AUD',locale:'en-AU'},
    KE:{name:'Kenya',flag:'\u{1F1F0}\u{1F1EA}',sym:'KSh',code:'KES',locale:'en-KE'},
    BW:{name:'Botswana',flag:'\u{1F1E7}\u{1F1FC}',sym:'P',code:'BWP',locale:'en-BW'},
    NA:{name:'Namibia',flag:'\u{1F1F3}\u{1F1E6}',sym:'N$',code:'NAD',locale:'en-NA'}
  };

  /* ── Progressive bracket calculator ────────────────── */
  function applyBrackets(income, brackets){
    var tax=0, prev=0;
    for(var i=0;i<brackets.length;i++){
      var b=brackets[i];
      var cap=b[0]===Infinity?income:b[0];
      if(income<=prev) break;
      var taxable=Math.min(income,cap)-prev;
      tax+=taxable*b[1];
      prev=cap;
    }
    return tax;
  }

  /* ── TAX REGISTRY — 7 countries ────────────────────── */
  var TAX_REGISTRY = {
    /* ── South Africa ──────────────────────────────── */
    ZA:{
      calculate:function(gross,annualGross){
        var lines=[];
        // PAYE – 2024/25 brackets (annual)
        var brackets=[
          [237100,0.18],[370500,0.26],[512800,0.31],
          [673000,0.36],[857900,0.39],[1817000,0.41],[Infinity,0.45]
        ];
        var annualTax=applyBrackets(annualGross,brackets);
        // Primary rebate
        annualTax=Math.max(0,annualTax-17235);
        var monthlyPAYE=Math.round(annualTax/12*100)/100;
        if(monthlyPAYE>0) lines.push({desc:'PAYE (Income Tax)',amount:monthlyPAYE});
        // UIF – 1% capped at R177.12/month
        var uif=Math.min(gross*0.01,177.12);
        uif=Math.round(uif*100)/100;
        lines.push({desc:'UIF (1%)',amount:uif});
        // SDL – 1%
        var sdl=Math.round(gross*0.01*100)/100;
        lines.push({desc:'SDL (1%)',amount:sdl});
        return lines;
      }
    },
    /* ── United Kingdom ────────────────────────────── */
    UK:{
      calculate:function(gross,annualGross){
        var lines=[];
        // Income Tax — personal allowance £12,570
        var taxable=Math.max(0,annualGross-12570);
        var brackets=[
          [37700,0.20],[99730,0.40],[Infinity,0.45]
        ];
        var annualTax=applyBrackets(taxable,brackets);
        var monthlyTax=Math.round(annualTax/12*100)/100;
        if(monthlyTax>0) lines.push({desc:'Income Tax',amount:monthlyTax});
        // National Insurance — 8% on £12,570–£50,270, 2% above
        var niTaxable=Math.max(0,annualGross-12570);
        var niBrackets=[[37700,0.08],[Infinity,0.02]];
        var annualNI=applyBrackets(niTaxable,niBrackets);
        var monthlyNI=Math.round(annualNI/12*100)/100;
        if(monthlyNI>0) lines.push({desc:'National Insurance',amount:monthlyNI});
        return lines;
      }
    },
    /* ── United States ─────────────────────────────── */
    US:{
      calculate:function(gross,annualGross){
        var lines=[];
        // Federal Income Tax — standard deduction $14,600 (single 2024)
        var taxable=Math.max(0,annualGross-14600);
        var brackets=[
          [11600,0.10],[47150,0.12],[100525,0.22],
          [191950,0.24],[243725,0.32],[609350,0.35],[Infinity,0.37]
        ];
        var annualTax=applyBrackets(taxable,brackets);
        var monthlyTax=Math.round(annualTax/12*100)/100;
        if(monthlyTax>0) lines.push({desc:'Federal Income Tax',amount:monthlyTax});
        // Social Security — 6.2% up to $168,600
        var ssAnnual=Math.min(annualGross,168600)*0.062;
        var ssMo=Math.round(ssAnnual/12*100)/100;
        lines.push({desc:'Social Security (6.2%)',amount:ssMo});
        // Medicare — 1.45%
        var medMo=Math.round(gross*0.0145*100)/100;
        lines.push({desc:'Medicare (1.45%)',amount:medMo});
        return lines;
      }
    },
    /* ── Australia ──────────────────────────────────── */
    AU:{
      calculate:function(gross,annualGross){
        var lines=[];
        // Income Tax — tax-free threshold $18,200
        var brackets=[
          [18200,0],[45000,0.19],[120000,0.325],
          [180000,0.37],[Infinity,0.45]
        ];
        var annualTax=applyBrackets(annualGross,brackets);
        var monthlyTax=Math.round(annualTax/12*100)/100;
        if(monthlyTax>0) lines.push({desc:'Income Tax',amount:monthlyTax});
        // Medicare Levy — 2%
        var medLevy=Math.round(gross*0.02*100)/100;
        lines.push({desc:'Medicare Levy (2%)',amount:medLevy});
        return lines;
      }
    },
    /* ── Kenya ──────────────────────────────────────── */
    KE:{
      calculate:function(gross,annualGross){
        var lines=[];
        // PAYE — monthly brackets (KES)
        var brackets=[
          [24000,0.10],[32333,0.25],[500000,0.30],
          [800000,0.325],[Infinity,0.35]
        ];
        var tax=applyBrackets(gross,brackets);
        // Personal relief KSh 2,400/month
        tax=Math.max(0,tax-2400);
        tax=Math.round(tax*100)/100;
        if(tax>0) lines.push({desc:'PAYE (Income Tax)',amount:tax});
        // NHIF — tiered
        var nhif=0;
        if(gross<=5999) nhif=150;
        else if(gross<=7999) nhif=300;
        else if(gross<=11999) nhif=400;
        else if(gross<=14999) nhif=500;
        else if(gross<=19999) nhif=600;
        else if(gross<=24999) nhif=750;
        else if(gross<=29999) nhif=850;
        else if(gross<=34999) nhif=900;
        else if(gross<=39999) nhif=950;
        else if(gross<=44999) nhif=1000;
        else if(gross<=49999) nhif=1100;
        else if(gross<=59999) nhif=1200;
        else if(gross<=69999) nhif=1300;
        else if(gross<=79999) nhif=1400;
        else if(gross<=89999) nhif=1500;
        else if(gross<=99999) nhif=1600;
        else nhif=1700;
        lines.push({desc:'NHIF',amount:nhif});
        // NSSF — 6% capped at KSh 1,080 Tier I + II
        var nssf=Math.min(Math.round(gross*0.06*100)/100,2160);
        lines.push({desc:'NSSF (6%)',amount:nssf});
        // Housing Levy — 1.5%
        var housing=Math.round(gross*0.015*100)/100;
        lines.push({desc:'Housing Levy (1.5%)',amount:housing});
        return lines;
      }
    },
    /* ── Botswana ───────────────────────────────────── */
    BW:{
      calculate:function(gross,annualGross){
        var lines=[];
        // Income Tax — annual brackets (BWP)
        var brackets=[
          [48000,0],[84000,0.05],[120000,0.125],
          [156000,0.1875],[Infinity,0.25]
        ];
        var annualTax=applyBrackets(annualGross,brackets);
        var monthlyTax=Math.round(annualTax/12*100)/100;
        if(monthlyTax>0) lines.push({desc:'Income Tax',amount:monthlyTax});
        return lines;
      }
    },
    /* ── Namibia ────────────────────────────────────── */
    NA:{
      calculate:function(gross,annualGross){
        var lines=[];
        // PAYE — annual brackets (NAD)
        var brackets=[
          [50000,0],[100000,0.18],[300000,0.25],
          [500000,0.28],[800000,0.30],[1500000,0.32],[Infinity,0.37]
        ];
        var annualTax=applyBrackets(annualGross,brackets);
        var monthlyTax=Math.round(annualTax/12*100)/100;
        if(monthlyTax>0) lines.push({desc:'PAYE (Income Tax)',amount:monthlyTax});
        // Social Security — 0.9% capped at N$81/month
        var ss=Math.min(Math.round(gross*0.009*100)/100,81);
        lines.push({desc:'Social Security (0.9%)',amount:ss});
        return lines;
      }
    }
  };

  var prState = {
    runStatus:'draft',
    selectedEmpId:null,
    zoom:100,
    payslips:[],
    settings:{
      showEmpNo:true, showIdNum:false, showDept:true,
      showHourly:true, showCommission:true,
      showBank:true, maskAccount:true,
      country:'ZA',
      footerText:'This is a system-generated payslip.',
      notes:''
    },
    period:{ label:'February 2026', range:'1 Feb – 28 Feb 2026', month:2, year:2026 },
    auditLog:[]
  };
  window.prState=prState;

  function computeGross(emp){
    var gross=0;
    if(emp.baseSalary) gross+=emp.baseSalary;
    if(emp.hourlyRate) gross+=emp.hourlyRate*160;
    if(emp.commissionPlan){
      var seed=emp.id.charCodeAt(emp.id.length-1);
      gross+=Math.round((seed*137)%15000)+2000;
    }
    // Include current-period bonuses in gross
    var currentPeriod=prState.period?prState.period.range:'';
    (emp.bonuses||[]).forEach(function(b){
      if(b.period===currentPeriod) gross+=b.amount;
    });
    return gross;
  }

  function computeEarnings(emp){
    var lines=[];
    if(emp.baseSalary) lines.push({desc:'Base Salary',amount:emp.baseSalary});
    if(emp.hourlyRate){ var cs=COUNTRY_META[(prState.settings.country)||'ZA'].sym; lines.push({desc:'Hourly Wages (160 hrs @ '+cs+emp.hourlyRate+')',amount:emp.hourlyRate*160}); }
    if(emp.commissionPlan){
      var seed=emp.id.charCodeAt(emp.id.length-1);
      var comm=Math.round((seed*137)%15000)+2000;
      lines.push({desc:'Commission — '+emp.commissionPlan,amount:comm});
    }
    // Include current-period bonuses
    var currentPeriod=prState.period?prState.period.range:'';
    (emp.bonuses||[]).forEach(function(b){
      if(b.period===currentPeriod) lines.push({desc:b.type,amount:b.amount});
    });
    return lines;
  }

  function computeDeductions(emp){
    var gross=computeGross(emp);
    var annualGross=gross*12;
    var country=(prState.settings&&prState.settings.country)||'ZA';
    var engine=TAX_REGISTRY[country];
    var lines=engine?engine.calculate(gross,annualGross):[];
    // Include active advance repayments
    (emp.advances||[]).forEach(function(adv){
      if(adv.status==='active'&&adv.monthsRemaining>0){
        lines.push({desc:'Advance Repayment ('+adv.id+')',amount:adv.monthlyInstallment});
      }
    });
    return lines;
  }

  window.generateAllPayslips=function(){
    var employees=(window.EMPLOYEES_DATA||[]).filter(function(e){ return e.status==='active'; });
    var now=new Date().toISOString();
    prState.payslips=employees.map(function(emp){
      var earnings=computeEarnings(emp);
      var deductions=computeDeductions(emp);
      var grossTotal=earnings.reduce(function(s,l){return s+l.amount;},0);
      var deductTotal=deductions.reduce(function(s,l){return s+l.amount;},0);
      // Process advance repayments — decrement remaining months
      (emp.advances||[]).forEach(function(adv){
        if(adv.status==='active'&&adv.monthsRemaining>0){
          adv.monthsRemaining--;
          if(adv.monthsRemaining===0){
            adv.status='completed';
            emp.auditLog.push({event:'advance.completed',date:now,by:'System',detail:'Advance '+adv.id+' fully repaid (R '+adv.totalAmount.toLocaleString('en-ZA')+')'});
          }
        }
      });
      return {
        empId:emp.id, status:'generated', generatedAt:now, issuedAt:null,
        earnings:earnings, deductions:deductions,
        grossTotal:grossTotal, deductTotal:deductTotal, netPay:grossTotal-deductTotal
      };
    });
    prState.runStatus='approved';
    prState.auditLog.push({event:'payrun.generated',date:now,by:'Fritz Erasmus',detail:'Payslips generated for '+prState.payslips.length+' employees'});
    var issBtn=document.getElementById('pr-btn-issue'); if(issBtn) issBtn.disabled=false;
    var zipBtn=document.getElementById('pr-btn-zip'); if(zipBtn) zipBtn.disabled=false;
    var genBtn=document.getElementById('pr-btn-generate'); if(genBtn){ genBtn.disabled=true; genBtn.textContent='Generated'; }
    renderPayRuns();
  };

  window.issueAllPayslips=function(){
    var now=new Date().toISOString();
    prState.payslips.forEach(function(ps){ ps.status='issued'; ps.issuedAt=now; });
    prState.runStatus='paid';
    prState.auditLog.push({event:'payrun.issued',date:now,by:'Fritz Erasmus',detail:'All payslips issued'});
    var issBtn=document.getElementById('pr-btn-issue'); if(issBtn){ issBtn.disabled=true; issBtn.textContent='All Issued'; }
    renderPayRuns();
    if(prState.selectedEmpId) renderPayslipPreview(prState.selectedEmpId);
  };

  window.issueCurrentPayslip=function(){
    if(!prState.selectedEmpId) return;
    var ps=prState.payslips.find(function(p){return p.empId===prState.selectedEmpId;});
    if(!ps||ps.status==='issued') return;
    ps.status='issued'; ps.issuedAt=new Date().toISOString();
    prState.auditLog.push({event:'payslip.issued',date:ps.issuedAt,by:'Fritz Erasmus',detail:'Payslip issued for '+prState.selectedEmpId});
    renderPayRuns();
    renderPayslipPreview(prState.selectedEmpId);
  };

  window.downloadCurrentPayslip=function(){ alert('PDF download — demo stub. In production, use html2pdf.js or server-side generation.'); };
  window.downloadPayRunZIP=function(){ alert('ZIP download — demo stub. In production, generate ZIP of all PDFs.'); };
  window.sendPayslipEmail=function(empId){
    var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id===empId;});
    if(emp) alert('Email payslip to '+emp.email+' — demo stub. In production, integrate with email service.');
  };
  window.sendPayslipWhatsApp=function(empId){
    var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id===empId;});
    if(emp) alert('WhatsApp payslip to '+emp.phone+' — demo stub. In production, integrate with WhatsApp Business API.');
  };
  window.printPayslip=function(empId){ alert('Print payslip — demo stub. In production, trigger browser print dialog for payslip element.'); };

  window.openPayRunSettings=function(){
    document.getElementById('pr-settings-overlay').classList.add('open');
    document.getElementById('pr-settings-drawer').classList.add('open');
  };
  window.closePayRunSettings=function(){
    document.getElementById('pr-settings-overlay').classList.remove('open');
    document.getElementById('pr-settings-drawer').classList.remove('open');
  };
  window.togglePrSetting=function(btn){ btn.classList.toggle('on'); };
  window.applyPayRunSettings=function(){
    var s=prState.settings;
    var oldCountry=s.country;
    s.showEmpNo=document.getElementById('pr-set-empno').classList.contains('on');
    s.showIdNum=document.getElementById('pr-set-idnum').classList.contains('on');
    s.showDept=document.getElementById('pr-set-dept').classList.contains('on');
    s.showHourly=document.getElementById('pr-set-hourly').classList.contains('on');
    s.showCommission=document.getElementById('pr-set-commission').classList.contains('on');
    s.showBank=document.getElementById('pr-set-bank').classList.contains('on');
    s.maskAccount=document.getElementById('pr-set-mask').classList.contains('on');
    s.country=document.getElementById('pr-set-country').value;
    s.footerText=document.getElementById('pr-set-footer').value;
    s.notes=document.getElementById('pr-set-notes').value;
    closePayRunSettings();
    // If country changed and payslips exist, regenerate with new tax rules
    if(s.country!==oldCountry && prState.payslips.length>0){
      generateAllPayslips();
    } else if(prState.selectedEmpId){
      renderPayslipPreview(prState.selectedEmpId);
    }
  };

  window.setPayslipZoom=function(level){
    prState.zoom=level;
    document.querySelectorAll('.pr-zoom-btn').forEach(function(b){
      b.classList.toggle('active',parseInt(b.getAttribute('data-zoom'))===level);
    });
    var doc=document.querySelector('.pr-payslip');
    if(doc) doc.style.transform='scale('+(level/100)+')';
  };

  window.selectPayRunEmployee=function(empId){
    prState.selectedEmpId=empId;
    document.querySelectorAll('.pr-emp-row').forEach(function(r){
      r.classList.toggle('selected',r.getAttribute('data-emp')===empId);
    });
    renderPayslipPreview(empId);
  };

  function renderEmployeeList(){
    var employees=(window.EMPLOYEES_DATA||[]).filter(function(e){ return e.status==='active'; });
    var body=document.getElementById('pr-emp-list');
    if(!body) return;
    body.innerHTML=employees.map(function(emp){
      var ps=prState.payslips.find(function(p){return p.empId===emp.id;});
      var gross=ps?ps.grossTotal:computeGross(emp);
      var statusCls=ps?ps.status:'not-generated';
      var statusLabel=statusCls==='not-generated'?'Not generated':statusCls==='generated'?'Generated':'Issued';
      var selected=prState.selectedEmpId===emp.id?' selected':'';
      return '<div class="pr-emp-row'+selected+'" data-emp="'+emp.id+'" onclick="selectPayRunEmployee(\''+emp.id+'\')">'+
        '<div style="display:flex;align-items:center;gap:10px;">'+
          '<div class="ppl-avatar" style="background:'+avatarColor(emp.firstName+emp.lastName)+';width:32px;height:32px;font-size:11px;">'+prInitials(emp.firstName,emp.lastName)+'</div>'+
          '<div><div class="pr-emp-name">'+emp.firstName+' '+emp.lastName+'</div><div class="pr-emp-role">'+emp.jobTitle+'</div></div>'+
        '</div>'+
        '<div class="pr-emp-gross">'+fmt(gross)+'</div>'+
        '<div><span class="pr-slip-status '+statusCls+'">'+statusLabel+'</span></div>'+
        '<div style="display:flex;align-items:center;gap:2px;">'+
          (function(){ var del=emp.payslipDelivery||{email:true}; var ic=''; if(del.email) ic+='<span class="emp-delivery-badge" title="Email">&#9993;</span>'; if(del.whatsapp) ic+='<span class="emp-delivery-badge" title="WhatsApp">&#128172;</span>'; if(del.print) ic+='<span class="emp-delivery-badge" title="Print">&#128424;</span>'; return ic; })()+
          '<button class="ppl-action-btn" title="Preview" style="opacity:1;margin-left:4px;" onclick="event.stopPropagation();selectPayRunEmployee(\''+emp.id+'\')">'+
            '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>'+
          '</button>'+
        '</div></div>';
    }).join('');
  }

  function renderPayslipPreview(empId){
    var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id===empId;});
    var ps=prState.payslips.find(function(p){return p.empId===empId;});
    var toolbar=document.getElementById('pr-preview-toolbar');
    var canvas=document.getElementById('pr-payslip-doc');
    var empty=document.getElementById('pr-empty-state');

    if(!emp){
      if(toolbar) toolbar.style.display='none';
      if(canvas) canvas.style.display='none';
      if(empty) empty.style.display='';
      return;
    }
    // If payslips not generated yet, build a live preview
    if(!ps){
      var earnings=computeEarnings(emp);
      var deductions=computeDeductions(emp);
      var grossTotal=earnings.reduce(function(s,l){return s+l.amount;},0);
      var deductTotal=deductions.reduce(function(s,l){return s+l.amount;},0);
      ps={empId:emp.id,status:'preview',earnings:earnings,deductions:deductions,grossTotal:grossTotal,deductTotal:deductTotal,netPay:grossTotal-deductTotal};
    }

    if(toolbar) toolbar.style.display='';
    if(canvas) canvas.style.display='';
    if(empty) empty.style.display='none';

    var s=prState.settings;

    var empFields='';
    empFields+='<div><div class="ps-doc-field-label">Employee Name</div><div class="ps-doc-field-value">'+emp.firstName+' '+emp.lastName+'</div></div>';
    if(s.showEmpNo) empFields+='<div><div class="ps-doc-field-label">Employee No.</div><div class="ps-doc-field-value">'+emp.id+'</div></div>';
    empFields+='<div><div class="ps-doc-field-label">Pay Period</div><div class="ps-doc-field-value">'+prState.period.range+'</div></div>';
    empFields+='<div><div class="ps-doc-field-label">Pay Date</div><div class="ps-doc-field-value">25 Feb 2026</div></div>';
    if(s.showDept) empFields+='<div><div class="ps-doc-field-label">Department</div><div class="ps-doc-field-value">'+emp.department+'</div></div>';
    if(s.showIdNum) empFields+='<div><div class="ps-doc-field-label">ID Number</div><div class="ps-doc-field-value">'+emp.idNumber+'</div></div>';

    var ytdMonth=prState.period.month||1;

    var earningsRows=ps.earnings.map(function(l){
      return '<tr><td>'+l.desc+'</td><td>'+fmt(l.amount)+'</td><td class="ytd">'+fmt(l.amount*ytdMonth)+'</td></tr>';
    }).join('')+'<tr class="subtotal"><td>Total Earnings</td><td>'+fmt(ps.grossTotal)+'</td><td class="ytd">'+fmt(ps.grossTotal*ytdMonth)+'</td></tr>';

    var deductRows=ps.deductions.length>0
      ? ps.deductions.map(function(l){
          // For advance repayments, calculate actual YTD based on months paid
          var ytdAmt=l.amount*ytdMonth;
          if(l.desc.indexOf('Advance Repayment')===0){
            var advId=l.desc.match(/\(([^)]+)\)/);
            if(advId){
              var adv=(emp.advances||[]).find(function(a){return a.id===advId[1];});
              if(adv) ytdAmt=adv.monthlyInstallment*(adv.months-adv.monthsRemaining);
            }
          }
          return '<tr><td>'+l.desc+'</td><td>'+fmt(l.amount)+'</td><td class="ytd">'+fmt(ytdAmt)+'</td></tr>';
        }).join('')
      : '<tr><td colspan="3" style="color:#999;font-style:italic;">No deductions</td></tr>';
    deductRows+='<tr class="subtotal"><td>Total Deductions</td><td>'+fmt(ps.deductTotal)+'</td><td class="ytd">'+fmt(ps.deductTotal*ytdMonth)+'</td></tr>';

    var paymentBlock='';
    if(s.showBank){
      var acctDisplay=s.maskAccount?maskAcct(emp.accountNumber):emp.accountNumber;
      paymentBlock='<div class="ps-doc-payment">'+
        '<div class="ps-doc-payment-row"><span>Payment Method</span><span>EFT</span></div>'+
        '<div class="ps-doc-payment-row"><span>Bank</span><span>'+emp.bankName+'</span></div>'+
        '<div class="ps-doc-payment-row"><span>Account</span><span>'+acctDisplay+'</span></div>'+
        '<div class="ps-doc-payment-row"><span>Reference</span><span>'+emp.id+'-FEB2026</span></div>'+
      '</div>';
    }

    var notesBlock=s.notes?'<div style="padding:8px 16px;background:#fffbeb;border-radius:6px;font-size:10px;color:#92400e;margin-bottom:12px;">'+s.notes+'</div>':'';

    // Outstanding Loans / Advances block
    var loansBlock='';
    var activeLoans=(emp.advances||[]).filter(function(a){return a.status==='active'&&a.monthsRemaining>0;});
    if(activeLoans.length>0){
      var totalOutstanding=0;
      loansBlock='<div class="ps-doc-loans"><div class="ps-doc-loans-title">Outstanding Loans / Advances</div>';
      activeLoans.forEach(function(a){
        var remaining=Math.round(a.monthlyInstallment*a.monthsRemaining*100)/100;
        totalOutstanding+=remaining;
        loansBlock+='<div class="ps-doc-loan-row"><span>'+a.id+' — Original: '+fmt(a.amount)+' | Installment: '+fmt(a.monthlyInstallment)+'/mo | '+a.monthsRemaining+' of '+a.months+' months left</span><span>'+fmt(remaining)+'</span></div>';
      });
      loansBlock+='<div class="ps-doc-loan-total"><span>Total Outstanding</span><span>'+fmt(totalOutstanding)+'</span></div>';
      loansBlock+='</div>';
    }

    canvas.innerHTML=
      '<div class="pr-payslip" style="transform:scale('+(prState.zoom/100)+')">'+
        '<div class="ps-doc-header">'+
          '<div class="ps-doc-logo">N</div>'+
          '<div class="ps-doc-company">'+
            '<div class="ps-doc-company-name">Novatrai (Pty) Ltd</div>'+
            '<div class="ps-doc-company-addr">123 Innovation Drive, Cape Town, 8001<br>hello@novatrai.co.za</div>'+
          '</div>'+
        '</div>'+
        '<div class="ps-doc-title">PAYSLIP</div>'+
        '<div class="ps-doc-emp-block">'+empFields+'</div>'+
        '<table class="ps-doc-table"><thead><tr><th>Earnings</th><th>Amount</th><th class="ytd-hdr">YTD</th></tr></thead><tbody>'+earningsRows+'</tbody></table>'+
        '<table class="ps-doc-table"><thead><tr><th>Deductions</th><th>Amount</th><th class="ytd-hdr">YTD</th></tr></thead><tbody>'+deductRows+'</tbody></table>'+
        '<div class="ps-doc-net">'+
          '<div class="ps-doc-net-line"><div class="ps-doc-net-label">Gross Pay</div><div class="ps-doc-net-value">'+fmt(ps.grossTotal)+'<div class="ps-doc-net-ytd">YTD: '+fmt(ps.grossTotal*ytdMonth)+'</div></div></div>'+
          '<div class="ps-doc-net-line"><div class="ps-doc-net-label">Deductions</div><div class="ps-doc-net-value">'+fmt(ps.deductTotal)+'<div class="ps-doc-net-ytd">YTD: '+fmt(ps.deductTotal*ytdMonth)+'</div></div></div>'+
          '<div class="ps-doc-net-line"><div class="ps-doc-net-label">Net Pay</div><div class="ps-doc-net-value highlight">'+fmt(ps.netPay)+'<div class="ps-doc-net-ytd">YTD: '+fmt(ps.netPay*ytdMonth)+'</div></div></div>'+
        '</div>'+
        paymentBlock+
        loansBlock+
        notesBlock+
        '<div class="ps-doc-footer">'+
          '<div style="margin-bottom:4px;">Generated: '+fmtDate(ps.generatedAt)+(ps.issuedAt?' &nbsp;|&nbsp; Issued: '+fmtDate(ps.issuedAt):'')+'</div>'+
          '<div>'+s.footerText+'</div>'+
        '</div>'+
      '</div>';

    var issBtn=document.getElementById('pr-btn-issue-single');
    if(issBtn){
      if(ps.status==='issued'){ issBtn.disabled=true; issBtn.textContent='Issued'; }
      else { issBtn.disabled=false; issBtn.textContent='Issue'; }
    }
    // Populate send buttons based on delivery preferences
    var sendContainer=document.getElementById('pr-send-btns');
    if(sendContainer&&ps.status==='issued'){
      var del=emp.payslipDelivery||{email:true};
      var btns='';
      if(del.email) btns+='<button class="btn btn-outline" onclick="sendPayslipEmail(\''+emp.id+'\')" style="font-size:11px;padding:4px 10px;">&#9993; Email</button>';
      if(del.whatsapp) btns+='<button class="btn btn-outline" onclick="sendPayslipWhatsApp(\''+emp.id+'\')" style="font-size:11px;padding:4px 10px;">&#128172; WhatsApp</button>';
      if(del.print) btns+='<button class="btn btn-outline" onclick="printPayslip(\''+emp.id+'\')" style="font-size:11px;padding:4px 10px;">&#128424; Print</button>';
      sendContainer.innerHTML=btns;
    } else if(sendContainer){ sendContainer.innerHTML=''; }
  }

  function renderRunHeader(){
    var pill=document.getElementById('pr-run-status');
    if(pill){
      pill.className='pr-status-pill '+prState.runStatus;
      pill.textContent=prState.runStatus.charAt(0).toUpperCase()+prState.runStatus.slice(1);
    }
  }

  /* ── Payslip History (Employee-Centric) ── */

  // Helper: find a payslip history entry across all employees
  function findPayslipEntry(psId){
    var emps=window.EMPLOYEES_DATA||[];
    for(var i=0;i<emps.length;i++){
      var hist=emps[i].payslipHistory||[];
      for(var j=0;j<hist.length;j++){
        if(hist[j].id===psId) return {emp:emps[i],ps:hist[j]};
      }
    }
    return null;
  }

  // View a historical payslip in modal
  window.viewHistoricalPayslip=function(psId){
    var found=findPayslipEntry(psId);
    if(!found){ console.warn('Payslip not found:',psId); return; }
    var emp=found.emp, p=found.ps;
    var s=prState.settings;

    var empFields='';
    empFields+='<div><div class="ps-doc-field-label">Employee Name</div><div class="ps-doc-field-value">'+emp.firstName+' '+emp.lastName+'</div></div>';
    if(s.showEmpNo) empFields+='<div><div class="ps-doc-field-label">Employee No.</div><div class="ps-doc-field-value">'+emp.id+'</div></div>';
    empFields+='<div><div class="ps-doc-field-label">Pay Period</div><div class="ps-doc-field-value">'+(p.periodRange||p.period)+'</div></div>';
    var payDate=p.issuedAt?new Date(p.issuedAt).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'}):'—';
    empFields+='<div><div class="ps-doc-field-label">Pay Date</div><div class="ps-doc-field-value">'+payDate+'</div></div>';
    if(s.showDept) empFields+='<div><div class="ps-doc-field-label">Department</div><div class="ps-doc-field-value">'+emp.department+'</div></div>';
    if(s.showIdNum) empFields+='<div><div class="ps-doc-field-label">ID Number</div><div class="ps-doc-field-value">'+emp.idNumber+'</div></div>';

    var ytdMonth=p.month||1;

    var earningsRows=p.earnings.map(function(l){
      return '<tr><td>'+l.desc+'</td><td>'+fmt(l.amount)+'</td><td class="ytd">'+fmt(l.amount*ytdMonth)+'</td></tr>';
    }).join('')+'<tr class="subtotal"><td>Total Earnings</td><td>'+fmt(p.grossTotal)+'</td><td class="ytd">'+fmt(p.grossTotal*ytdMonth)+'</td></tr>';

    var deductRows=p.deductions.length>0
      ? p.deductions.map(function(l){
          return '<tr><td>'+l.desc+'</td><td>'+fmt(l.amount)+'</td><td class="ytd">'+fmt(l.amount*ytdMonth)+'</td></tr>';
        }).join('')
      : '<tr><td colspan="3" style="color:#999;font-style:italic;">No deductions</td></tr>';
    deductRows+='<tr class="subtotal"><td>Total Deductions</td><td>'+fmt(p.deductTotal)+'</td><td class="ytd">'+fmt(p.deductTotal*ytdMonth)+'</td></tr>';

    var paymentBlock='';
    if(s.showBank){
      var acctDisplay=s.maskAccount?maskAcct(emp.accountNumber):emp.accountNumber;
      var monthNames=['','JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      var ref=emp.id+'-'+(monthNames[p.month]||'')+(p.year||'');
      paymentBlock='<div class="ps-doc-payment">'+
        '<div class="ps-doc-payment-row"><span>Payment Method</span><span>EFT</span></div>'+
        '<div class="ps-doc-payment-row"><span>Bank</span><span>'+emp.bankName+'</span></div>'+
        '<div class="ps-doc-payment-row"><span>Account</span><span>'+acctDisplay+'</span></div>'+
        '<div class="ps-doc-payment-row"><span>Reference</span><span>'+ref+'</span></div>'+
      '</div>';
    }

    var notesBlock=s.notes?'<div style="padding:8px 16px;background:#fffbeb;border-radius:6px;font-size:10px;color:#92400e;margin-bottom:12px;">'+s.notes+'</div>':'';

    var docHTML=
      '<div class="pr-payslip" style="transform:scale(1);">'+
        '<div class="ps-doc-header">'+
          '<div class="ps-doc-logo">N</div>'+
          '<div class="ps-doc-company">'+
            '<div class="ps-doc-company-name">Novatrai (Pty) Ltd</div>'+
            '<div class="ps-doc-company-addr">123 Innovation Drive, Cape Town, 8001<br>hello@novatrai.co.za</div>'+
          '</div>'+
        '</div>'+
        '<div class="ps-doc-title">PAYSLIP</div>'+
        '<div class="ps-doc-emp-block">'+empFields+'</div>'+
        '<table class="ps-doc-table"><thead><tr><th>Earnings</th><th>Amount</th><th class="ytd-hdr">YTD</th></tr></thead><tbody>'+earningsRows+'</tbody></table>'+
        '<table class="ps-doc-table"><thead><tr><th>Deductions</th><th>Amount</th><th class="ytd-hdr">YTD</th></tr></thead><tbody>'+deductRows+'</tbody></table>'+
        '<div class="ps-doc-net">'+
          '<div class="ps-doc-net-line"><div class="ps-doc-net-label">Gross Pay</div><div class="ps-doc-net-value">'+fmt(p.grossTotal)+'<div class="ps-doc-net-ytd">YTD: '+fmt(p.grossTotal*ytdMonth)+'</div></div></div>'+
          '<div class="ps-doc-net-line"><div class="ps-doc-net-label">Deductions</div><div class="ps-doc-net-value">'+fmt(p.deductTotal)+'<div class="ps-doc-net-ytd">YTD: '+fmt(p.deductTotal*ytdMonth)+'</div></div></div>'+
          '<div class="ps-doc-net-line"><div class="ps-doc-net-label">Net Pay</div><div class="ps-doc-net-value highlight">'+fmt(p.netPay)+'<div class="ps-doc-net-ytd">YTD: '+fmt(p.netPay*ytdMonth)+'</div></div></div>'+
        '</div>'+
        paymentBlock+
        notesBlock+
        '<div class="ps-doc-footer">'+
          '<div style="margin-bottom:4px;">Generated: '+fmtDate(p.generatedAt)+(p.issuedAt?' &nbsp;|&nbsp; Issued: '+fmtDate(p.issuedAt):'')+'</div>'+
          '<div>'+s.footerText+'</div>'+
        '</div>'+
      '</div>';

    var titleEl=document.getElementById('ps-viewer-title');
    if(titleEl) titleEl.textContent=p.period+' — '+emp.firstName+' '+emp.lastName;
    var docEl=document.getElementById('ps-viewer-doc');
    if(docEl) docEl.innerHTML=docHTML;
    document.getElementById('payslip-viewer-overlay').classList.add('open');
    document.getElementById('payslip-viewer-overlay').dataset.currentPsId=psId;
  };

  window.closePayslipViewer=function(){
    document.getElementById('payslip-viewer-overlay').classList.remove('open');
  };

  window.printViewedPayslip=function(){
    var docEl=document.getElementById('ps-viewer-doc');
    if(!docEl) return;
    var w=window.open('','_blank','width=700,height=900');
    w.document.write('<!DOCTYPE html><html><head><title>Payslip</title><style>body{font-family:Arial,sans-serif;margin:20px;color:#1a1a1a;}table{width:100%;border-collapse:collapse;margin-bottom:12px;}th,td{padding:6px 10px;text-align:left;border-bottom:1px solid #e5e7eb;font-size:12px;}th{font-weight:600;background:#f3f4f6;}.subtotal td{font-weight:700;border-top:2px solid #374151;}.ps-doc-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;}.ps-doc-logo{width:40px;height:40px;background:#6366f1;color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;}.ps-doc-company-name{font-weight:700;font-size:16px;}.ps-doc-company-addr{font-size:11px;color:#6b7280;}.ps-doc-title{text-align:center;font-size:18px;font-weight:700;letter-spacing:3px;margin:12px 0;padding:8px 0;border-top:2px solid #374151;border-bottom:2px solid #374151;}.ps-doc-emp-block{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;padding:10px;background:#f9fafb;border-radius:6px;}.ps-doc-field-label{font-size:10px;color:#6b7280;text-transform:uppercase;}.ps-doc-field-value{font-size:12px;font-weight:600;}.ps-doc-net{border:2px solid #374151;border-radius:8px;padding:12px;margin-bottom:12px;}.ps-doc-net-line{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;}.ps-doc-net-label{font-weight:600;}.ps-doc-net-value{text-align:right;}.ps-doc-net-value.highlight{font-size:16px;font-weight:700;color:#059669;}.ps-doc-net-ytd{font-size:9px;color:#6b7280;}.ps-doc-payment{background:#f9fafb;border-radius:6px;padding:10px;margin-bottom:12px;font-size:11px;}.ps-doc-payment-row{display:flex;justify-content:space-between;padding:3px 0;}.ps-doc-footer{text-align:center;font-size:10px;color:#9ca3af;padding-top:12px;border-top:1px solid #e5e7eb;}.ytd,.ytd-hdr{color:#6b7280;font-size:10px;text-align:right;}@media print{body{margin:0;}}</style></head><body>'+docEl.innerHTML+'</body></html>');
    w.document.close();
    w.focus();
    setTimeout(function(){ w.print(); },300);
  };

  // Save payslip to employee when issued
  function savePayslipToEmployee(ps,emp){
    if(!emp||!ps) return;
    var period=prState.period;
    var existing=(emp.payslipHistory||[]).find(function(h){return h.period===period.label;});
    if(existing) return;
    emp.payslipHistory.push({
      id:'PS-'+Date.now()+'-'+emp.id,
      period:period.label, periodRange:period.range,
      month:period.month, year:period.year,
      earnings:JSON.parse(JSON.stringify(ps.earnings)),
      deductions:JSON.parse(JSON.stringify(ps.deductions)),
      grossTotal:ps.grossTotal, deductTotal:ps.deductTotal, netPay:ps.netPay,
      generatedAt:ps.generatedAt, issuedAt:ps.issuedAt||new Date().toISOString(),
      sent:{email:false,whatsapp:false,print:false}
    });
  }

  // Patch issueAllPayslips
  var _origIssueAll=window.issueAllPayslips;
  window.issueAllPayslips=function(){
    _origIssueAll();
    prState.payslips.forEach(function(ps){
      var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id===ps.empId;});
      savePayslipToEmployee(ps,emp);
    });
    renderPayslipHistory();
  };

  // Patch issueCurrentPayslip
  var _origIssueSingle=window.issueCurrentPayslip;
  window.issueCurrentPayslip=function(){
    _origIssueSingle();
    var ps=prState.payslips.find(function(p){return p.empId===prState.selectedEmpId;});
    if(ps&&ps.status==='issued'){
      var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id===ps.empId;});
      savePayslipToEmployee(ps,emp);
    }
    renderPayslipHistory();
  };

  // Patch send functions to update employee payslipHistory
  var _origSendEmail=window.sendPayslipEmail;
  window.sendPayslipEmail=function(empId){
    _origSendEmail(empId);
    var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id===empId;});
    if(emp){
      var period=prState.period;
      var entry=(emp.payslipHistory||[]).find(function(h){return h.period===period.label;});
      if(entry) entry.sent.email=true;
    }
    renderPayslipHistory();
  };
  var _origSendWA=window.sendPayslipWhatsApp;
  window.sendPayslipWhatsApp=function(empId){
    _origSendWA(empId);
    var emp=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id===empId;});
    if(emp){
      var period=prState.period;
      var entry=(emp.payslipHistory||[]).find(function(h){return h.period===period.label;});
      if(entry) entry.sent.whatsapp=true;
    }
    renderPayslipHistory();
  };

  // Populate employee filter dropdown
  function populateHistoryEmpFilter(){
    var sel=document.getElementById('pr-hist-emp');
    if(!sel) return;
    var emps=(window.EMPLOYEES_DATA||[]);
    sel.innerHTML='<option value="">All Employees</option>';
    emps.forEach(function(e){
      sel.innerHTML+='<option value="'+e.id+'">'+e.firstName+' '+e.lastName+'</option>';
    });
  }

  window.updateHistDateValue=function(which){
    var m=document.getElementById('pr-hist-'+which+'-month').value;
    var y=document.getElementById('pr-hist-'+which+'-year').value;
    document.getElementById('pr-hist-'+which).value=y+'-'+m;
    renderPayslipHistory();
  };

  // Aggregate all payslip history from employees
  function getAllPayslipHistory(){
    var all=[];
    (window.EMPLOYEES_DATA||[]).forEach(function(emp){
      (emp.payslipHistory||[]).forEach(function(ps){
        all.push({empId:emp.id, empName:emp.firstName+' '+emp.lastName, ps:ps});
      });
    });
    // Sort by date descending
    all.sort(function(a,b){ return (b.ps.year*100+b.ps.month)-(a.ps.year*100+a.ps.month)||a.empName.localeCompare(b.empName); });
    return all;
  }

  window.renderPayslipHistory=function(){
    var body=document.getElementById('pr-archive-body');
    var countEl=document.getElementById('pr-archive-count');
    var bulkBar=document.getElementById('pr-bulk-bar');
    if(!body) return;

    var from=document.getElementById('pr-hist-from').value;
    var to=document.getElementById('pr-hist-to').value;
    var empFilter=document.getElementById('pr-hist-emp').value;
    var sentFilter=document.getElementById('pr-hist-sent').value;

    var allHistory=getAllPayslipHistory();
    var totalCount=allHistory.length;

    var filtered=allHistory.filter(function(a){
      var p=a.ps;
      var ym=p.year+'-'+(p.month<10?'0':'')+p.month;
      if(from&&ym<from) return false;
      if(to&&ym>to) return false;
      if(empFilter&&a.empId!==empFilter) return false;
      if(sentFilter==='sent'&&!p.sent.email&&!p.sent.whatsapp&&!p.sent.print) return false;
      if(sentFilter==='not-sent'&&(p.sent.email||p.sent.whatsapp||p.sent.print)) return false;
      return true;
    });

    if(countEl) countEl.textContent=totalCount+' archived payslip'+(totalCount!==1?'s':'');

    if(filtered.length===0){
      body.innerHTML='<div style="color:#5A7080;font-size:12px;text-align:center;padding:20px;">No payslips match the selected filters.</div>';
      if(bulkBar) bulkBar.style.display='none';
      return;
    }

    var html='<table class="pr-archive-table"><thead><tr>'+
      '<th><input type="checkbox" id="pr-bulk-select-all" onchange="toggleBulkSelectAll()"></th>'+
      '<th>Employee</th><th>Period</th><th>Gross</th><th>Net</th><th>Issued</th><th>Sent</th><th>Actions</th>'+
    '</tr></thead><tbody>';

    filtered.forEach(function(a){
      var p=a.ps;
      var sentBadges='';
      if(p.sent.email) sentBadges+='<span class="pr-archive-sent yes">Email</span> ';
      if(p.sent.whatsapp) sentBadges+='<span class="pr-archive-sent yes">WhatsApp</span> ';
      if(p.sent.print) sentBadges+='<span class="pr-archive-sent yes">Print</span> ';
      if(!sentBadges) sentBadges='<span class="pr-archive-sent no">Not sent</span>';
      var issuedDate=p.issuedAt?new Date(p.issuedAt).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'}):'—';

      html+='<tr>'+
        '<td><input type="checkbox" class="pr-bulk-check" data-ps-id="'+p.id+'" data-emp-id="'+a.empId+'"></td>'+
        '<td>'+a.empName+'</td>'+
        '<td>'+p.period+'</td>'+
        '<td>'+fmt(p.grossTotal)+'</td>'+
        '<td>'+fmt(p.netPay)+'</td>'+
        '<td>'+issuedDate+'</td>'+
        '<td>'+sentBadges+'</td>'+
        '<td style="display:flex;gap:4px;">'+
          '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;" onclick="viewHistoricalPayslip(\''+p.id+'\')" title="View Payslip">&#128196;</button>'+
          '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;" onclick="resendArchived(\''+p.id+'\',\'email\')" title="Send Email">&#9993;</button>'+
          '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;" onclick="resendArchived(\''+p.id+'\',\'whatsapp\')" title="Send WhatsApp">&#128172;</button>'+
          '<button class="btn btn-ghost" style="font-size:10px;padding:2px 6px;" onclick="resendArchived(\''+p.id+'\',\'print\')" title="Print">&#128424;</button>'+
        '</td>'+
      '</tr>';
    });
    html+='</tbody></table>';
    body.innerHTML=html;
    if(bulkBar) bulkBar.style.display='flex';
    document.querySelectorAll('.pr-bulk-check').forEach(function(cb){
      cb.addEventListener('change', updateBulkCount);
    });
  };

  window.resendArchived=function(psId,method){
    var found=findPayslipEntry(psId);
    if(!found) return;
    var emp=found.emp, ps=found.ps;
    if(method==='email'){
      ps.sent.email=true;
      alert('Email payslip ('+ps.period+') sent to '+emp.email+' — demo stub.');
    } else if(method==='whatsapp'){
      ps.sent.whatsapp=true;
      alert('WhatsApp payslip ('+ps.period+') sent to '+emp.phone+' — demo stub.');
    } else if(method==='print'){
      ps.sent.print=true;
      alert('Print payslip ('+ps.period+') for '+emp.firstName+' '+emp.lastName+' — demo stub.');
    }
    renderPayslipHistory();
  };

  window.toggleBulkSelectAll=function(){
    var all=document.getElementById('pr-bulk-select-all');
    var checks=document.querySelectorAll('.pr-bulk-check');
    checks.forEach(function(cb){ cb.checked=all.checked; });
    updateBulkCount();
  };

  function updateBulkCount(){
    var checks=document.querySelectorAll('.pr-bulk-check:checked');
    var el=document.getElementById('pr-bulk-count');
    if(el) el.textContent=checks.length+' selected';
  }

  window.bulkSendPayslips=function(method){
    var checks=document.querySelectorAll('.pr-bulk-check:checked');
    if(checks.length===0){ alert('Select at least one payslip.'); return; }
    var count=0;
    checks.forEach(function(cb){
      var psId=cb.dataset.psId;
      var found=findPayslipEntry(psId);
      if(!found) return;
      if(method==='email') found.ps.sent.email=true;
      else if(method==='whatsapp') found.ps.sent.whatsapp=true;
      else if(method==='print') found.ps.sent.print=true;
      count++;
    });
    var methodLabel={email:'Email',whatsapp:'WhatsApp',print:'Print'}[method];
    alert('Bulk '+methodLabel+': '+count+' payslip'+(count!==1?'s':'')+' processed — demo stub.');
    renderPayslipHistory();
  };

  // Seed payslip history on employees for demo
  (function seedPayslipHistory(){
    var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    var daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];

    function buildPayslipEntry(emp,m,y,sentFlags){
      var earnings=computeEarnings(emp);
      var deductions=computeDeductions(emp);
      var gross=earnings.reduce(function(s,l){return s+l.amount;},0);
      var deductTotal=deductions.reduce(function(s,l){return s+l.amount;},0);
      var mIdx=m-1;
      return {
        id:'PS-SEED-'+emp.id+'-'+y+'-'+(m<10?'0':'')+m,
        period:months[mIdx]+' '+y,
        periodRange:'1 '+months[mIdx].substring(0,3)+' – '+daysInMonth[mIdx]+' '+months[mIdx].substring(0,3)+' '+y,
        month:m, year:y,
        earnings:earnings, deductions:deductions,
        grossTotal:gross, deductTotal:deductTotal, netPay:gross-deductTotal,
        generatedAt:y+'-'+(m<10?'0':'')+m+'-23T10:00:00.000Z',
        issuedAt:y+'-'+(m<10?'0':'')+m+'-25T10:00:00.000Z',
        sent:sentFlags||{email:false,whatsapp:false,print:false}
      };
    }

    // EMP-001 James De Villiers: 12 months (Mar 2025 → Feb 2026)
    var james=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id==='EMP-001';});
    if(james){
      for(var m=3;m<=12;m++) james.payslipHistory.push(buildPayslipEntry(james,m,2025,{email:true,whatsapp:false,print:m%3===0}));
      james.payslipHistory.push(buildPayslipEntry(james,1,2026,{email:true,whatsapp:true,print:false}));
      james.payslipHistory.push(buildPayslipEntry(james,2,2026,{email:true,whatsapp:false,print:false}));
    }

    // EMP-002 Naledi: 6 months (Sep 2025 → Feb 2026)
    var naledi=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id==='EMP-002';});
    if(naledi){
      for(var m2=9;m2<=12;m2++) naledi.payslipHistory.push(buildPayslipEntry(naledi,m2,2025,{email:true,whatsapp:false,print:false}));
      naledi.payslipHistory.push(buildPayslipEntry(naledi,1,2026,{email:true,whatsapp:false,print:false}));
      naledi.payslipHistory.push(buildPayslipEntry(naledi,2,2026,{email:false,whatsapp:false,print:false}));
    }

    // EMP-003 Pieter: 4 months (Nov 2025 → Feb 2026)
    var pieter=(window.EMPLOYEES_DATA||[]).find(function(e){return e.id==='EMP-003';});
    if(pieter){
      for(var m3=11;m3<=12;m3++) pieter.payslipHistory.push(buildPayslipEntry(pieter,m3,2025,{email:true,whatsapp:false,print:false}));
      pieter.payslipHistory.push(buildPayslipEntry(pieter,1,2026,{email:true,whatsapp:false,print:true}));
      pieter.payslipHistory.push(buildPayslipEntry(pieter,2,2026,{email:false,whatsapp:false,print:false}));
    }
  })();

  window.renderPayRuns=function(){
    renderRunHeader();
    renderEmployeeList();
    if(prState.selectedEmpId) renderPayslipPreview(prState.selectedEmpId);
    populateHistoryEmpFilter();
    renderPayslipHistory();
  };

  var _prOrigSwitch=window.switchScreen;
  window.switchScreen=function(name){
    _prOrigSwitch(name);
    if(name==='pay-runs') renderPayRuns();
  };
})();

