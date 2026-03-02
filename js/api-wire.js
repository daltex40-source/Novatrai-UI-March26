/* ═══════════════════════════════════════════════════════════════
 *  Novatrai API Wire — ES5 Compatible
 *  Dashboard hydration + Case list wiring
 *  Drop-in: loads after engine.js, before app.js
 * ═══════════════════════════════════════════════════════════════ */

// ── Global state ────────────────────────────────────────────
window.NOVATRAI = window.NOVATRAI || {};
window.NOVATRAI.selectedCaseId = null;
window.NOVATRAI.caseDetail = { activeId: null, reqId: 0 };
window.NOVATRAI.me = {};

// ── Bulletproof /auth/me response mapper (ES5) ──────────────
function mapMeResponseToNovatraiMe(resp) {
  var r = resp;
  if (r && r.data) r = r.data;

  var user = r && r.user ? r.user : r;

  var id =
    (user && (user.id || user.userId)) ||
    (r && (r.id || r.userId)) ||
    (r && r.sub) ||
    null;

  var email =
    (user && user.email) ||
    (r && r.email) ||
    null;

  var name =
    (user && (user.name || user.fullName)) ||
    (r && (r.name || r.fullName)) ||
    null;

  if (!name) {
    var fn = (user && user.firstName) || (r && r.firstName) || "";
    var ln = (user && user.lastName) || (r && r.lastName) || "";
    name = (fn + " " + ln).replace(/\s+/g, " ").trim() || null;
  }

  window.NOVATRAI = window.NOVATRAI || {};
  window.NOVATRAI.me = window.NOVATRAI.me || {};
  window.NOVATRAI.me.userId = id;
  window.NOVATRAI.me.email = email;
  window.NOVATRAI.me.name = name;

  return window.NOVATRAI.me;
}

// ── Config ──────────────────────────────────────────────────
var NOVATRAI_API_BASE = window.NOVATRAI_API_BASE || "http://localhost:3000/api";
var _novatraiApiOnline = null; // null = unknown, true/false after first call

function novatraiGetToken() {
  try { return localStorage.getItem("novatrai_token") || ""; } catch (e) { return ""; }
}

// ── Core XHR wrapper ────────────────────────────────────────
function novatraiApi(path, options, cb) {
  if (typeof options === 'function') { cb = options; options = {}; }
  options = options || {};
  cb = cb || function() {};

  var xhr = new XMLHttpRequest();
  xhr.open(options.method || "GET", NOVATRAI_API_BASE + path, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.timeout = 5000;

  var token = novatraiGetToken();
  if (token) xhr.setRequestHeader("Authorization", "Bearer " + token);

  xhr.onload = function() {
    _novatraiApiOnline = true;
    if (xhr.status === 401) {
      return cb({ message: "Unauthorized", status: 401 });
    }
    if (xhr.status >= 400) {
      var errMsg = "HTTP " + xhr.status;
      try { var ej = JSON.parse(xhr.responseText); errMsg = ej.message || ej.error || errMsg; } catch(x) {}
      return cb({ message: errMsg, status: xhr.status });
    }
    try {
      var json = JSON.parse(xhr.responseText);
      // Unwrap { data: ... } envelope if present
      cb(null, json.data !== undefined ? json.data : json);
    } catch (e) {
      cb({ message: "Invalid JSON", status: xhr.status });
    }
  };

  xhr.ontimeout = function() {
    _novatraiApiOnline = false;
    cb({ message: "Timeout", status: 0 });
  };

  xhr.onerror = function() {
    _novatraiApiOnline = false;
    cb({ message: "Network error", status: 0 });
  };

  if (options.body) {
    xhr.send(JSON.stringify(options.body));
  } else {
    xhr.send();
  }
}

// ── Health check on load ────────────────────────────────────
novatraiApi("/health", function(err) {
  if (err) {
    _novatraiApiOnline = false;
    console.log("Novatrai: backend offline — using template data");
  } else {
    _novatraiApiOnline = true;
    console.log("Novatrai: backend online");
  }
});


/* ═══════════════════════════════════════════════════════════════
 *  DASHBOARD HYDRATION
 * ═══════════════════════════════════════════════════════════════ */

// ── KPI hydration helpers ───────────────────────────────────
function hydrateDashboardKpis() {
  novatraiApi("/dashboard/kpis", function(err, data) {
    if (err || !data) return;
    var grid = document.getElementById('dashboard-grid');
    if (!grid) return;

    // Map each KPI to its widget
    var mapping = [
      { key: 'pipeline',       wid: 'pipeline' },
      { key: 'activeClients',  wid: 'active-clients' },
      { key: 'collections',    wid: 'collections' },
      { key: 'slaBreaches',    wid: 'sla-breaches' }
    ];

    mapping.forEach(function(m) {
      var card = grid.querySelector('[data-widget-id="' + m.wid + '"]');
      if (!card || !data[m.key]) return;
      var valEl = card.querySelector('.kpi-value');
      var subEl = card.querySelector('.kpi-sub');
      if (valEl && data[m.key].value !== undefined) valEl.textContent = data[m.key].value;
      if (subEl && data[m.key].sub)                 subEl.textContent = data[m.key].sub;
    });
    console.log("Novatrai: KPIs hydrated from API");
  });
}

function hydrateDashboardActivity() {
  novatraiApi("/dashboard/activity?limit=10", function(err, items) {
    if (err || !items || !items.length) return;
    var list = document.querySelector('#dashboard-grid [data-widget-id="activity-feed"] .activity-list');
    if (!list) return;

    var html = '';
    items.forEach(function(item) {
      html += '<div class="act-row">' +
        '<div class="act-dot"></div>' +
        '<div class="act-body">' +
          '<div class="act-text">' + (item.text || '') + '</div>' +
          '<div class="act-time">' + (item.time || '') + '</div>' +
        '</div></div>';
    });
    list.innerHTML = html;
    console.log("Novatrai: activity feed hydrated — " + items.length + " items");
  });
}

function hydrateDashboardMyDay() {
  novatraiApi("/dashboard/my-day", function(err, data) {
    if (err || !data) return;
    var widget = document.querySelector('#dashboard-grid [data-widget-id="my-day"]');
    if (!widget) return;
    var body = widget.querySelector('.widget-body');
    if (!body) return;

    var html = '';
    if (data.meetings && data.meetings.length) {
      html += '<div class="md-section-label">Meetings</div>';
      data.meetings.forEach(function(m) {
        html += '<div class="md-item"><span class="md-time">' + (m.time || '') +
          '</span><span class="md-text">' + (m.text || '') + '</span></div>';
      });
    }
    if (data.tasks && data.tasks.length) {
      html += '<div class="md-section-label" style="margin-top:10px">Tasks</div>';
      data.tasks.forEach(function(t) {
        var cls = t.done ? 'md-item done' : 'md-item';
        html += '<div class="' + cls + '"><span class="md-time">' + (t.time || '') +
          '</span><span class="md-text">' + (t.text || '') + '</span></div>';
      });
    }
    if (html) body.innerHTML = html;
    console.log("Novatrai: My Day hydrated");
  });
}

// ── Parallel dashboard data fetcher ─────────────────────────
function loadDashboardDataES5(done) {
  var out = { counts: null, overdue: null, assigned: null };
  var pending = 3;
  var failed = false;

  function finishOnce(err) {
    if (failed) return;
    if (err) {
      failed = true;
      return done(err);
    }
    pending -= 1;
    if (pending === 0) done(null, out);
  }

  novatraiApi("/cases/open-count-by-status", function(err, data) {
    if (!err && data) out.counts = data;
    finishOnce(err);
  });

  novatraiApi("/cases/overdue?limit=5", function(err, data) {
    if (!err && data) out.overdue = data;
    finishOnce(err);
  });

  novatraiApi("/cases/assigned-to-me?limit=8", function(err, data) {
    if (!err && data) out.assigned = data;
    finishOnce(err);
  });
}

// ── Render: status counts → KPI tiles ───────────────────────
function renderDashboardCounts(counts) {
  if (!counts) return;

  var acCard = document.querySelector('#dashboard-grid [data-widget-id="active-clients"]');
  if (acCard && counts.total !== undefined) {
    var valEl = acCard.querySelector('.kpi-value');
    var subEl = acCard.querySelector('.kpi-sub');
    if (valEl) valEl.textContent = counts.total;
    if (subEl) {
      var parts = [];
      if (counts['new'])            parts.push(counts['new'] + ' new');
      if (counts.inProgress)        parts.push(counts.inProgress + ' in progress');
      if (counts.awaitingClient)    parts.push(counts.awaitingClient + ' awaiting client');
      if (counts.review)            parts.push(counts.review + ' in review');
      subEl.textContent = parts.join(' \u00b7 ') || (counts.total + ' open cases');
    }
  }

  if (counts.breaches !== undefined) {
    var slaCard = document.querySelector('#dashboard-grid [data-widget-id="sla-breaches"]');
    if (slaCard) {
      var slaVal = slaCard.querySelector('.kpi-value');
      if (slaVal) slaVal.textContent = counts.breaches;
    }
  }

  console.log("Novatrai: dashboard counts rendered — " + (counts.total || 0) + " open cases");
}

// ── Render: pipeline widget from API counts + overdue ───────
function renderPipelineWidgetCounts(counts, overdueData) {
  var card = document.querySelector('.widget-card[data-widget-id="pipeline"]');
  if (!card) return;

  var kpiValueEl = card.querySelector('.kpi-value');
  var kpiSubEl   = card.querySelector('.kpi-sub');
  var kpiDeltaEl = card.querySelector('.kpi-delta');

  var open = (counts && counts.OPEN) ? counts.OPEN : 0;
  var prog = (counts && (counts.IN_PROGRESS || counts.INPROGRESS)) ? (counts.IN_PROGRESS || counts.INPROGRESS) : 0;
  var wait = (counts && counts.WAITING) ? counts.WAITING : 0;

  var total = open + prog + wait;

  if (kpiValueEl) kpiValueEl.textContent = total + " Cases";
  if (kpiSubEl) {
    kpiSubEl.textContent = open + " open \u00b7 " + prog + " in progress \u00b7 " + wait + " waiting";
  }

  var overdueCount = 0;
  if (overdueData) {
    if (overdueData.items && overdueData.items.length != null) overdueCount = overdueData.items.length;
    else if (overdueData.length != null) overdueCount = overdueData.length;
  }

  if (kpiDeltaEl) {
    kpiDeltaEl.className = "kpi-delta " + (overdueCount > 0 ? "down" : "up");
    kpiDeltaEl.textContent = overdueCount > 0
      ? (overdueCount + " overdue cases need attention")
      : "No overdue cases";
  }

  console.log("Novatrai: pipeline widget rendered — " + total + " total cases");
}

// ── Rename pipeline widget title after clone ────────────────
function renamePipelineTitle() {
  var card = document.querySelector('.widget-card[data-widget-id="pipeline"]');
  if (!card) return;
  var title = card.querySelector('.widget-title');
  if (title) title.textContent = "Cases Pipeline (Workload)";
}

// ── Render: overdue items → Attention Queue ─────────────────
function renderDashboardOverdue(items) {
  if (!items || !items.length) return;

  var widget = document.querySelector('#dashboard-grid [data-widget-id="attention-queue"]');
  if (!widget) return;
  var tbody = widget.querySelector('.aq-table tbody');
  if (!tbody) return;

  var badgeMap = {
    'sla':        'breach',
    'payment':    'payment',
    'compliance': 'compliance',
    'stuck':      'stuck',
    'overdue':    'breach'
  };

  var rows = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var badge = badgeMap[item.type] || 'breach';
    var label = item.type || 'Overdue';
    label = label.charAt(0).toUpperCase() + label.slice(1).replace(/([A-Z])/g, ' $1');

    rows += '<tr>' +
      '<td><span class="aq-badge ' + badge + '">' + label + '</span></td>' +
      '<td><div class="aq-co">' + (item.company || '') + '</div>' +
           '<div class="aq-detail">' + (item.detail || '') + '</div></td>' +
      '<td style="color:#E4EBF5">' + (item.description || '') + '</td>' +
      '<td class="aq-since">' + (item.since || '') + '</td>' +
      '<td><span class="aq-action" ' +
        (item.caseId ? 'onclick="switchScreen(\'company\');setTimeout(function(){openCompanyDetail(\'' + item.caseId + '\')},100)"' : '') +
        '>Resolve &rarr;</span></td>' +
    '</tr>';
  }

  tbody.innerHTML = rows;
  console.log("Novatrai: attention queue rendered — " + items.length + " overdue items");
}

// ── Render: assigned items → My Day widget ──────────────────
function renderDashboardAssigned(data) {
  if (!data) return;

  var widget = document.querySelector('#dashboard-grid [data-widget-id="my-day"]');
  if (!widget) return;
  var body = widget.querySelector('.widget-body');
  if (!body) return;

  var html = '';
  if (data.meetings && data.meetings.length) {
    html += '<div class="md-section-label">Meetings</div>';
    for (var i = 0; i < data.meetings.length; i++) {
      var m = data.meetings[i];
      html += '<div class="md-item"><span class="md-time">' + (m.time || '') +
        '</span><span class="md-text">' + (m.text || '') + '</span></div>';
    }
  }
  if (data.tasks && data.tasks.length) {
    html += '<div class="md-section-label" style="margin-top:10px">Tasks</div>';
    for (var j = 0; j < data.tasks.length; j++) {
      var t = data.tasks[j];
      var cls = t.done ? 'md-item done' : 'md-item';
      html += '<div class="' + cls + '"><span class="md-time">' + (t.time || '') +
        '</span><span class="md-text">' + (t.text || '') + '</span></div>';
    }
  }
  if (html) body.innerHTML = html;
  console.log("Novatrai: My Day assigned rendered");
}

// ── Sequential pipeline fetch: counts → overdue ─────────────
function initDashboardData() {
  novatraiApi("/cases/open-count-by-status", null, function (err, counts) {
    if (err) { console.log("Counts load failed:", err.message); return; }
    novatraiApi("/cases/overdue?limit=5", null, function (err2, overdue) {
      if (err2) { console.log("Overdue load failed:", err2.message); overdue = null; }
      renderPipelineWidgetCounts(counts, overdue);
    });
  });
}

// ── My Cases widget fetch ────────────────────────────────────
function loadMyCasesWidget() {
  novatraiApi("/cases/assigned-to-me?limit=10", null, function (err, data) {
    if (err) { console.log("My Cases load failed:", err.message); return; }
    renderMyCasesWidget(data);
  });
}

// ── Open case (overlay or fallback to list) ─────────────────
function openCase(id) {
  window.NOVATRAI = window.NOVATRAI || {};
  window.NOVATRAI.selectedCaseId = id;

  if (document.getElementById("case-detail-overlay")) {
    initCaseDetail(id);
    return;
  }

  // Fallback: go to cases list screen
  switchScreen("cases");
  if (typeof initCasesScreen === "function") initCasesScreen();
}

// ── Master dashboard hydration ──────────────────────────────
function hydrateDashboardFromApi() {
  setTimeout(function() {
    if (_novatraiApiOnline === false) {
      console.log("Novatrai: skipping API hydration — backend offline");
      return;
    }
    // Fetch current user identity (non-blocking)
    novatraiApi("/auth/me", null, function(err, data) {
      if (!err && data) mapMeResponseToNovatraiMe(data);
    });

    hydrateDashboardKpis();
    hydrateDashboardActivity();
    hydrateDashboardMyDay();
    loadMyCasesWidget();
    dashLoadApprovalsWidget();

    loadDashboardDataES5(function(err, out) {
      if (err) {
        console.log("Novatrai: loadDashboardDataES5 failed — " + err.message);
        return;
      }
      if (out.counts)   renderDashboardCounts(out.counts);
      if (out.counts || out.overdue) renderPipelineWidgetCounts(out.counts, out.overdue);
      if (out.overdue)  renderDashboardOverdue(out.overdue);
      if (out.assigned) renderDashboardAssigned(out.assigned);
    });
  }, 250);
}


/* ═══════════════════════════════════════════════════════════════
 *  CASE DETAIL OVERLAY PANEL
 * ═══════════════════════════════════════════════════════════════ */

var _csdCurrentCaseId = null;

// ── Panel open / close / tab ────────────────────────────────
function csdOpen() {
  var overlay = document.getElementById("case-detail-overlay");
  if (overlay) {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function csdClose() {
  var overlay = document.getElementById("case-detail-overlay");
  if (overlay) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  _csdCurrentCaseId = null;

  // Refresh cases list if anything changed while overlay was open
  if (window.NOVATRAI && window.NOVATRAI.caseDetail && window.NOVATRAI.caseDetail.dirty) {
    window.NOVATRAI.caseDetail.dirty = false;
    if (typeof casesReload === "function") casesReload();
  }
}

function csdBack() {
  csdClose();
  switchScreen("cases");
}

function csdHandleOverlayClick(e) {
  if (e.target.id === "case-detail-overlay") csdClose();
}

function csdTab(pane, el) {
  var tabs = document.querySelectorAll(".csd-tab");
  var panes = document.querySelectorAll(".csd-pane");
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("active");
  for (var j = 0; j < panes.length; j++) panes[j].classList.remove("active");
  if (el) el.classList.add("active");
  var target = document.getElementById("csd-pane-" + pane);
  if (target) target.classList.add("active");
}

// ── Main entry point (UI setup → data load) ────────────────
function initCaseDetail(id) {
  _csdCurrentCaseId = id;
  csdOpen();

  // Reset to overview tab
  var firstTab = document.querySelector(".csd-tab");
  csdTab("overview", firstTab);

  // Clear header
  safeText(document.getElementById("csd-header-title"), "--");
  safeText(document.getElementById("csd-header-number"), "");
  safeText(document.getElementById("csd-title"), "--");
  safeText(document.getElementById("csd-case-number"), "");
  safeText(document.getElementById("csd-description"), "");

  // Delegate to race-safe loader
  loadCaseDetail(id);
}

// ── Race-safe parallel loader ───────────────────────────────
function loadCaseDetail(id) {
  var state = window.NOVATRAI.caseDetail;
  state.activeId = id;
  state.reqId += 1;
  var thisReq = state.reqId;

  var overlay = document.getElementById("case-detail-overlay");
  if (!overlay) return;

  // Target pane containers
  var ovPane = overlay.querySelector("#csd-pane-overview");
  var tlPane = overlay.querySelector("#csd-pane-timeline");
  var lkPane = overlay.querySelector("#csd-pane-links");
  var ntPane = overlay.querySelector("#csd-pane-notes");
  var tkPane = overlay.querySelector("#csd-pane-tasks");

  // Loading placeholders
  setLoading(ovPane, true, "Loading case\u2026");
  setLoading(tlPane, true, "Loading timeline\u2026");
  setLoading(lkPane, true, "Loading links\u2026");
  setLoading(ntPane, true, "Loading notes\u2026");
  setLoading(tkPane, true, "Loading tasks\u2026");

  var results = { c: null, t: null, l: null, n: null, tk: null };
  var pending = 5;
  var failed = false;

  function doneOne(err) {
    if (failed) return;
    if (err) {
      failed = true;
      if (state.reqId !== thisReq) return;
      if (ovPane) ovPane.innerHTML = '<div style="color:#ffb3b3;padding:10px 8px">Failed to load case: ' + escapeHtml(err.message) + '</div>';
      if (tlPane) tlPane.innerHTML = "";
      if (lkPane) lkPane.innerHTML = "";
      if (ntPane) ntPane.innerHTML = "";
      if (tkPane) tkPane.innerHTML = "";
      return;
    }
    pending -= 1;
    if (pending === 0) {
      // Stale response guard
      if (state.reqId !== thisReq) return;

      renderCaseOverview(results.c);
      renderCaseTimeline(normItems(results.t));
      renderCaseLinks(normItems(results.l));
      renderCaseNotes(normItems(results.n));
      _csdRenderTasks(normItems(results.tk));
    }
  }

  novatraiApi("/cases/" + encodeURIComponent(id), null, function(err, data) {
    if (!err) results.c = data;
    doneOne(err);
  });

  novatraiApi("/entities/Case/" + encodeURIComponent(id) + "/timeline?limit=25", null, function(err, data) {
    if (!err) results.t = data;
    doneOne(err);
  });

  novatraiApi("/entities/Case/" + encodeURIComponent(id) + "/links", null, function(err, data) {
    if (!err) results.l = data;
    doneOne(err);
  });

  novatraiApi("/cases/" + encodeURIComponent(id) + "/notes?limit=50", null, function(err, data) {
    if (!err) results.n = data;
    doneOne(err);
  });

  // Tasks call is non-fatal — 404 just means endpoint not built yet
  novatraiApi("/cases/" + encodeURIComponent(id) + "/tasks?limit=10", null, function(err, data) {
    if (err) {
      // Render graceful empty state but don't block other panes
      if (state.reqId === thisReq && tkPane) {
        tkPane.innerHTML = (err.status === 404)
          ? '<div class="csd-section-hdr">Case Tasks</div><div class="csd-empty">Tasks endpoint not enabled yet.</div>'
          : '<div class="csd-section-hdr">Case Tasks</div><div class="csd-empty">Failed to load tasks.</div>';
      }
    } else {
      results.tk = data;
    }
    doneOne(null); // always count as done (non-fatal)
  });
}

// ── Refresh: full (nuclear) ──────────────────────────────────
function refreshCaseOverlay() {
  if (_csdCurrentCaseId) loadCaseDetail(_csdCurrentCaseId);
}

// ── Refresh: targeted (snappy, per-pane) ────────────────────
function csdRefreshOverview(caseId) {
  novatraiApi("/cases/" + encodeURIComponent(caseId), null, function(err, data) {
    if (err) return console.log("csdRefreshOverview failed:", err.message);
    _csdRenderHeader(data);
    _csdRenderOverview(data);
    _csdRenderKpis(data);
  });
}

function csdRefreshNotes(caseId) {
  novatraiApi("/cases/" + encodeURIComponent(caseId) + "/notes?limit=50", null, function(err, data) {
    if (err) return console.log("csdRefreshNotes failed:", err.message);
    _csdRenderNotes(normItems(data));
  });
}

function csdRefreshLinks(caseId) {
  novatraiApi("/entities/Case/" + encodeURIComponent(caseId) + "/links", null, function(err, data) {
    if (err) return console.log("csdRefreshLinks failed:", err.message);
    _csdRenderLinks(normItems(data));
  });
}

function csdRefreshTimeline(caseId) {
  novatraiApi("/entities/Case/" + encodeURIComponent(caseId) + "/timeline?limit=25", null, function(err, data) {
    if (err) return console.log("csdRefreshTimeline failed:", err.message);
    _csdRenderTimeline(normItems(data));
  });
}

function csdRefreshTasks(caseId) {
  novatraiApi("/cases/" + encodeURIComponent(caseId) + "/tasks?limit=10", null, function(err, data) {
    if (err) {
      console.log("csdRefreshTasks failed:", err.message);
      var list = document.getElementById("csd-tasks-list");
      if (list) {
        list.innerHTML = (err.status === 404)
          ? '<div class="csd-empty">Tasks endpoint not enabled yet.</div>'
          : '<div class="csd-empty">Failed to load tasks.</div>';
      }
      return;
    }
    _csdRenderTasks(normItems(data));
  });
}

function _csdRenderTasks(tasks) {
  var list = document.getElementById("csd-tasks-list");
  if (!list) return;

  if (!tasks || !tasks.length) {
    list.innerHTML = '<div class="csd-empty">No tasks linked to this case.</div>';
    return;
  }

  var html = "";
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var done = (t.status || "").toUpperCase() === "COMPLETED";
    var due = t.due_at ? new Date(t.due_at).toLocaleDateString() : "";

    var taskLifeInline = (typeof _osTaskLifeHtml === "function") ? _osTaskLifeHtml(t.status) : "";
    html += '<div class="csd-note-card" style="' + (done ? 'opacity:.6' : '') + '">' +
      '<div class="csd-note-text">' +
        (done ? '<s>' + escapeHtml(t.title || "") + '</s>' : escapeHtml(t.title || "")) +
      '</div>' +
      '<div class="csd-note-time" style="display:flex;align-items:center;gap:8px">' +
        taskLifeInline +
        (due ? '<span>Due ' + escapeHtml(due) + '</span>' : '') +
      '</div>' +
    '</div>';
  }
  list.innerHTML = html;
}

// ── Text setter helper ──────────────────────────────────────
function _csdSetText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ── Header renderer ─────────────────────────────────────────
function _csdRenderHeader(c) {
  _csdSetText("csd-header-title", c.title || "Untitled Case");
  _csdSetText("csd-header-number", c.case_number || "");
  _csdSetText("csd-title", c.title || "Untitled Case");
  _csdSetText("csd-case-number", c.case_number || "");

  // Status pill
  var statusEl = document.getElementById("csd-status");
  if (statusEl) {
    statusEl.textContent = mapStatusLabel(c.status);
    statusEl.className = "mc-status " + mapStatusClass(c.status);
  }

  // Priority badge
  var priEl = document.getElementById("csd-priority");
  if (priEl) {
    var pri = mapPriorityBadge(c.priority);
    priEl.textContent = pri.text;
    priEl.className = "aq-badge " + pri.cls;
  }

  // Lifecycle banner
  _osUpdateCaseBanner(c.status);

  // Description
  var descEl = document.getElementById("csd-description");
  if (descEl) {
    descEl.textContent = c.description || "";
  }

  // Meta grid
  var metaGrid = document.getElementById("csd-meta-grid");
  if (metaGrid) {
    var fields = [
      { lbl: "Assigned To", val: c.assigned_to_name || c.assigned_to || "--" },
      { lbl: "Category",    val: c.category || "--" },
      { lbl: "Created",     val: c.created_at ? new Date(c.created_at).toLocaleDateString() : "--" },
      { lbl: "Updated",     val: c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "--" }
    ];
    var html = "";
    for (var i = 0; i < fields.length; i++) {
      html += '<div class="csd-meta-field">' +
        '<div class="csd-meta-lbl">' + escapeHtml(fields[i].lbl) + '</div>' +
        '<div class="csd-meta-val">' + escapeHtml(fields[i].val) + '</div>' +
      '</div>';
    }
    metaGrid.innerHTML = html;
  }
}

// ── KPI renderer ────────────────────────────────────────────
function _csdRenderKpis(c) {
  _csdSetText("csd-kpi-notes", c.note_count != null ? c.note_count : 0);
  _csdSetText("csd-kpi-docs",  c.linked_docs_count != null ? c.linked_docs_count : 0);
  _csdSetText("csd-kpi-files", c.linked_files_count != null ? c.linked_files_count : 0);
  _csdSetText("csd-kpi-age",   formatAge(c.created_at) || "--");
}

// ── Overview renderer ───────────────────────────────────────
function _csdRenderOverview(c) {
  var grid = document.getElementById("csd-overview-grid");
  if (!grid) return;

  var fields = [
    { lbl: "Status",      val: mapStatusLabel(c.status) },
    { lbl: "Priority",    val: mapPriorityBadge(c.priority).text },
    { lbl: "Assigned To", val: c.assigned_to_name || c.assigned_to || "--" },
    { lbl: "Category",    val: c.category || "--" },
    { lbl: "Type",        val: c.type || c.case_type || "--" },
    { lbl: "Source",      val: c.source || "--" },
    { lbl: "Created",     val: c.created_at ? new Date(c.created_at).toLocaleString() : "--" },
    { lbl: "Last Updated",val: c.updated_at ? new Date(c.updated_at).toLocaleString() : "--" },
    { lbl: "Notes",       val: (c.note_count != null ? c.note_count : 0) + "" },
    { lbl: "Documents",   val: (c.linked_docs_count != null ? c.linked_docs_count : 0) + "" }
  ];

  var html = "";
  for (var i = 0; i < fields.length; i++) {
    html += '<div class="csd-meta-field">' +
      '<div class="csd-meta-lbl">' + escapeHtml(fields[i].lbl) + '</div>' +
      '<div class="csd-meta-val">' + escapeHtml(fields[i].val) + '</div>' +
    '</div>';
  }
  grid.innerHTML = html;

  // Sync status dropdown to current value
  var sel = document.getElementById("csd-status-select");
  if (sel && c && c.status) sel.value = c.status;
}

// ── Timeline renderer (reuses .tl-* CSS) ────────────────────
function _csdRenderTimeline(events) {
  var list = document.getElementById("csd-timeline-list");
  if (!list) return;

  if (!events || !events.length) {
    list.innerHTML = '<div class="csd-empty">No timeline events yet.</div>';
    return;
  }

  var html = "";
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var evType = (ev.event_type || "system").replace(".", "-").split("-")[0];
    var badgeCls = "ev-" + evType + "-badge";
    var iconCls  = "ev-" + evType;
    var label    = escapeHtml(ev.event_type_label || ev.event_type || "Event");
    var summary  = escapeHtml(ev.summary || "");
    var time     = escapeHtml(ev.relative_time || formatAge(ev.created_at) || "");
    var actor    = ev.actor_name ? escapeHtml(ev.actor_name) : "";
    var initials = ev.actor_initials || (actor ? actor.charAt(0).toUpperCase() : "");

    html += '<div class="tl-item">' +
      '<div class="tl-icon-wrap ' + iconCls + '">' +
        '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="12" cy="12" r="4"/></svg>' +
      '</div>' +
      '<div class="tl-content">' +
        '<div class="tl-top">' +
          '<span class="tl-type-badge ' + badgeCls + '">' + label + '</span>' +
          '<span class="tl-summary">' + summary + '</span>' +
        '</div>' +
        '<div class="tl-meta">' +
          '<span class="tl-time">' + time + '</span>' +
          (actor ? '<span class="tl-actor"><span class="tl-actor-dot" style="background:#6366f1">' + escapeHtml(initials) + '</span>' + actor + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }
  list.innerHTML = html;
}

// ── Notes renderer ──────────────────────────────────────────
function _csdRenderNotes(notes) {
  var list = document.getElementById("csd-notes-list");
  if (!list) return;

  if (!notes || !notes.length) {
    list.innerHTML = '<div class="csd-empty">No notes yet.</div>';
    return;
  }

  var html = "";
  for (var i = 0; i < notes.length; i++) {
    var n = notes[i];
    var time = n.created_at ? new Date(n.created_at).toLocaleString() : "";
    var author = n.created_by_name || n.author || "";
    html += '<div class="csd-note-card">' +
      '<div class="csd-note-time">' + escapeHtml(time) + '</div>' +
      '<div class="csd-note-text">' + escapeHtml(n.content || n.text || n.body || "") + '</div>' +
      (author ? '<div class="csd-note-author">by ' + escapeHtml(author) + '</div>' : '') +
    '</div>';
  }
  list.innerHTML = html;
}

// ── Links renderer ──────────────────────────────────────────
function _csdRenderLinks(links) {
  var list = document.getElementById("csd-links-list");
  if (!list) return;

  if (!links || !links.length) {
    list.innerHTML = '<div class="csd-empty">No linked entities.</div>';
    return;
  }

  var html = "";
  for (var i = 0; i < links.length; i++) {
    var lk = links[i];
    var type = (lk.entity_type || lk.type || "item").toLowerCase();
    var typeCls = type;
    var typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    var name = lk.name || lk.title || lk.display_name || "--";
    var meta = lk.description || lk.subtitle || "";

    html += '<div class="csd-link-card" data-link-type="' + escapeHtml(type) + '" data-link-id="' + escapeHtml(lk.id || lk.entity_id || "") + '">' +
      '<span class="csd-link-type ' + typeCls + '">' + escapeHtml(typeLabel) + '</span>' +
      '<div class="csd-link-name">' + escapeHtml(name) + '</div>' +
      (meta ? '<div class="csd-link-meta">' + escapeHtml(meta) + '</div>' : '') +
    '</div>';
  }
  list.innerHTML = html;

  // Attach click handlers
  var cards = list.querySelectorAll(".csd-link-card");
  for (var k = 0; k < cards.length; k++) {
    cards[k].addEventListener("click", function() {
      var linkType = this.getAttribute("data-link-type");
      var linkId   = this.getAttribute("data-link-id");
      if (linkType === "contact" && typeof openContactDetail === "function") {
        openContactDetail(linkId);
      } else if (linkType === "company") {
        csdClose();
        switchScreen("companies");
      }
    });
  }
}

// ── Public render API (called by loadCaseDetail) ────────────
function renderCaseOverview(caseData) {
  if (!caseData) return;
  _csdRenderHeader(caseData);
  _csdRenderOverview(caseData);
  _csdRenderKpis(caseData);
}

function renderCaseTimeline(events) {
  _csdRenderTimeline(events);
}

function renderCaseLinks(links) {
  _csdRenderLinks(links);
}

function renderCaseNotes(notes) {
  _csdRenderNotes(notes);
}

// ── Optimistic header badge updater (instant feel) ───────────
function _csdOptimisticUpdate(id, opts) {
  // Race guard: don't touch UI if user already navigated to a different case
  if (id !== window.NOVATRAI.caseDetail.activeId) return;

  // Instantly update status pill if provided
  if (opts && opts.status) {
    var statusEl = document.getElementById("csd-status");
    if (statusEl) {
      statusEl.textContent = mapStatusLabel(opts.status);
      statusEl.className = "mc-status " + mapStatusClass(opts.status);
    }
    var sel = document.getElementById("csd-status-select");
    if (sel) sel.value = opts.status;
  }
  // Bump "Updated" meta to right-now
  var metaVals = document.querySelectorAll
    ? document.querySelectorAll("#csd-meta-grid .csd-meta-field")
    : [];
  for (var i = 0; i < metaVals.length; i++) {
    var lbl = metaVals[i].querySelector(".csd-meta-lbl");
    if (lbl && lbl.textContent === "Updated") {
      var val = metaVals[i].querySelector(".csd-meta-val");
      if (val) val.textContent = new Date().toLocaleDateString();
    }
  }
  // Also bump "Last Updated" in overview pane
  var ovVals = document.querySelectorAll
    ? document.querySelectorAll("#csd-overview-grid .csd-meta-field")
    : [];
  for (var j = 0; j < ovVals.length; j++) {
    var ovLbl = ovVals[j].querySelector(".csd-meta-lbl");
    if (ovLbl && ovLbl.textContent === "Last Updated") {
      var ovVal = ovVals[j].querySelector(".csd-meta-val");
      if (ovVal) ovVal.textContent = new Date().toLocaleString();
    }
  }
}

// ── Add note (targeted refresh: notes + timeline only) ───────
function csdAddNote() {
  var id = window.NOVATRAI.caseDetail.activeId;
  if (!id) return;

  var inp = document.getElementById("csd-note-input");
  var body = inp ? inp.value.trim() : "";
  if (!body) return;

  var btn = document.querySelector(".csd-add-note-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }

  novatraiApi("/cases/" + encodeURIComponent(id) + "/notes", {
    method: "POST",
    body: JSON.stringify({ body: body })
  }, function(err) {
    if (btn) { btn.disabled = false; btn.textContent = "Add Note"; }
    if (err) {
      console.log("CSD: failed to add note — " + err.message);
      return;
    }
    if (inp) inp.value = "";
    window.NOVATRAI.caseDetail.dirty = true;
    if (window.showToast) window.showToast("Note added");
    _csdOptimisticUpdate(id, {});
    csdRefreshNotes(id);
    csdRefreshTimeline(id);
  });
}

// ── Change status (atomic transition) ───────────────────────
function csdChangeStatus(newStatus) {
  var id = window.NOVATRAI.caseDetail.activeId;
  if (!id) return;

  // Snapshot previous state for rollback on error
  var statusEl = document.getElementById("csd-status");
  var sel = document.getElementById("csd-status-select");
  var prev = {
    text:  statusEl ? statusEl.textContent : "",
    cls:   statusEl ? statusEl.className   : "",
    value: sel      ? sel.value            : ""
  };

  // Prompt reason for close/cancel
  var reason = null;
  if (newStatus === "CLOSED" || newStatus === "CANCELLED") {
    reason = prompt("Reason (optional):") || null;
  }

  // Apply optimistic update immediately
  _csdOptimisticUpdate(id, { status: newStatus });

  novatraiApi("/cases/" + encodeURIComponent(id) + "/status", {
    method: "POST",
    body: JSON.stringify({ status: newStatus, reason: reason })
  }, function(err) {
    if (err) {
      console.log("CSD: status change failed — " + err.message);
      if (window.showToast) window.showToast("Status change failed");
      // Rollback pill + dropdown to pre-optimistic snapshot
      if (statusEl) { statusEl.textContent = prev.text; statusEl.className = prev.cls; }
      if (sel) sel.value = prev.value;
      return;
    }
    window.NOVATRAI.caseDetail.dirty = true;
    if (window.showToast) window.showToast("Status updated to " + mapStatusLabel(newStatus));
    csdRefreshOverview(id);
    csdRefreshTimeline(id);
  });
}

// ── Add link (simple v1 with prompts) ───────────────────────
function csdPromptAddLink() {
  var id = window.NOVATRAI.caseDetail.activeId;
  if (!id) return;

  var entityType = prompt("Link entity type (e.g. Person, Company, DocumentInstance, File):");
  if (!entityType) return;

  var entityId = prompt("Link entity ID (uuid):");
  if (!entityId) return;

  var label = prompt("Label (optional):") || "related";

  novatraiApi("/entities/Case/" + encodeURIComponent(id) + "/links", {
    method: "POST",
    body: JSON.stringify({ entityType: entityType, entityId: entityId, label: label })
  }, function(err) {
    if (err) {
      console.log("CSD: add link failed — " + err.message);
      if (window.showToast) window.showToast("Failed to add link");
      return;
    }
    window.NOVATRAI.caseDetail.dirty = true;
    if (window.showToast) window.showToast("Link added");
    _csdOptimisticUpdate(id, {});
    csdRefreshLinks(id);
    csdRefreshTimeline(id);
  });
}


/* ═══════════════════════════════════════════════════════════════
 *  CASES SCREEN — state, filters, reload/loadMore stubs
 * ═══════════════════════════════════════════════════════════════ */

window.NOVATRAI = window.NOVATRAI || {};
window.NOVATRAI.casesList = window.NOVATRAI.casesList || {
  cursor: null,
  hasMore: false,
  lastQueryKey: ""
};

function casesGetFilters() {
  var q  = document.getElementById("cases-search");
  var st = document.getElementById("cases-status-filter");
  var pr = document.getElementById("cases-priority-filter");
  return {
    q:        q  ? (q.value || "").trim() : "",
    status:   st ? st.value : "",
    priority: pr ? pr.value : ""
  };
}

function casesOnFilterChanged() {
  casesReload();
}

function casesReload() {
  window.NOVATRAI.casesList.cursor = null;
  window.NOVATRAI.casesList.hasMore = false;
  var tbody = document.getElementById("cases-tbody");
  if (tbody) tbody.innerHTML = "";
  casesLoadMore();
}

function casesLoadMore() {
  if (typeof loadCasesPage === "function") loadCasesPage();
}

// ── New Case modal handlers ──────────────────────────────────
function casesOpenNewModal() {
  var m = document.getElementById("case-new-modal");
  if (m) m.className = "modal open";
  var t = document.getElementById("case-new-title");
  if (t) setTimeout(function(){ t.focus(); }, 0);
}

function casesCloseNewModal() {
  var m = document.getElementById("case-new-modal");
  if (m) m.className = "modal";
}

function casesSubmitNewCase() {
  var titleEl = document.getElementById("case-new-title");
  var descEl  = document.getElementById("case-new-desc");
  var priEl   = document.getElementById("case-new-priority");
  var dueEl   = document.getElementById("case-new-due");
  var meEl    = document.getElementById("case-new-assign-me");

  var title       = titleEl ? (titleEl.value || "").trim() : "";
  var description = descEl  ? (descEl.value  || "").trim() : "";
  var priority    = priEl   ? priEl.value : "MEDIUM";
  var due         = dueEl   ? dueEl.value : "";
  var assignMe    = meEl    ? !!meEl.checked : true;

  if (!title) return alert("Title is required");

  var body = { title: title, description: description, priority: priority };

  if (due) body.due_at = new Date(due).toISOString();
  if (assignMe && window.NOVATRAI && window.NOVATRAI.me && window.NOVATRAI.me.userId) {
    body.assigned_user_id = window.NOVATRAI.me.userId;
  }

  novatraiApi("/cases", { method: "POST", body: body }, function (err, data) {
    if (err) {
      if (window.showToast) window.showToast("Create failed");
      return alert("Create failed: " + err.message);
    }

    casesCloseNewModal();
    if (window.showToast) window.showToast("Case created");

    if (typeof casesReload === "function") casesReload();

    var id = data && (data.id || (data.data && data.data.id));
    if (id) openCase(id);
  });
}

// ── Cases screen helpers ─────────────────────────────────────
function _casesNormList(payload) {
  if (!payload) return { items: [], hasMore: false, nextCursor: null };

  // common wrappers
  if (payload.items && payload.items.length != null) {
    return {
      items: payload.items,
      hasMore: !!payload.hasMore,
      nextCursor: payload.nextCursor || payload.next_cursor || payload.cursor || null
    };
  }

  if (payload.data && payload.data.items && payload.data.items.length != null) {
    return {
      items: payload.data.items,
      hasMore: !!payload.data.hasMore,
      nextCursor: payload.data.nextCursor || payload.data.next_cursor || payload.data.cursor || null
    };
  }

  if (payload.length != null) return { items: payload, hasMore: false, nextCursor: null };
  return { items: [], hasMore: false, nextCursor: null };
}

function _casesStatusLabel(status) {
  status = (status || "").toUpperCase();
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "WAITING") return "Waiting";
  if (status === "CLOSED") return "Closed";
  if (status === "CANCELLED") return "Cancelled";
  return "Open";
}

function _casesStatusClass(status) {
  status = (status || "").toUpperCase();
  if (status === "IN_PROGRESS") return "in-progress";
  if (status === "WAITING") return "waiting";
  if (status === "CLOSED") return "closed";
  return "open";
}

function _casesPriorityBadge(priority) {
  priority = (priority || "").toUpperCase();
  if (priority === "URGENT") return { text: "Urgent", cls: "breach" };
  if (priority === "HIGH") return { text: "High", cls: "payment" };
  if (priority === "MEDIUM") return { text: "Medium", cls: "compliance" };
  return { text: "Low", cls: "stuck" };
}

function _casesFormatAge(isoDate) {
  if (!isoDate) return "";
  var d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  var now = new Date();
  var h = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (h < 24) return h + "h";
  return Math.floor(h / 24) + "d";
}

function _casesFormatDue(isoDate) {
  if (!isoDate) return "";
  var d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

// ── Cases screen loader (cursor pagination) ──────────────────
function loadCasesPage() {
  window.NOVATRAI = window.NOVATRAI || {};
  window.NOVATRAI.casesList = window.NOVATRAI.casesList || { cursor: null, hasMore: false, lastQueryKey: "" };

  var filters = casesGetFilters();
  var limit = 25;

  var qs = [];
  qs.push("limit=" + encodeURIComponent(limit));

  if (filters.q) qs.push("q=" + encodeURIComponent(filters.q));
  if (filters.status) qs.push("status=" + encodeURIComponent(filters.status));
  if (filters.priority) qs.push("priority=" + encodeURIComponent(filters.priority));

  if (window.NOVATRAI.casesList.cursor) {
    qs.push("cursor=" + encodeURIComponent(window.NOVATRAI.casesList.cursor));
  }

  var queryKey = (filters.q || "") + "|" + (filters.status || "") + "|" + (filters.priority || "");
  var isFreshQuery = (window.NOVATRAI.casesList.lastQueryKey !== queryKey);

  if (isFreshQuery && window.NOVATRAI.casesList.cursor) {
    window.NOVATRAI.casesList.cursor = null;
    window.NOVATRAI.casesList.hasMore = false;
    var tbody0 = document.getElementById("cases-tbody");
    if (tbody0) tbody0.innerHTML = "";
  }
  window.NOVATRAI.casesList.lastQueryKey = queryKey;

  var loadBtn = document.getElementById("cases-load-more");
  if (loadBtn) { loadBtn.disabled = true; loadBtn.textContent = "Loading\u2026"; loadBtn.style.display = "inline-block"; }

  novatraiApi("/cases/my?" + qs.join("&"), null, function (err, data) {
    if (loadBtn) { loadBtn.disabled = false; loadBtn.textContent = "Load more"; }

    if (err) {
      console.log("Cases load failed:", err.message);
      if (loadBtn) loadBtn.style.display = "none";
      return;
    }

    var page = _casesNormList(data);
    renderCasesRows(page.items, !!window.NOVATRAI.casesList.cursor);

    window.NOVATRAI.casesList.hasMore = !!page.hasMore;
    window.NOVATRAI.casesList.cursor = page.nextCursor;

    if (loadBtn) {
      loadBtn.style.display = window.NOVATRAI.casesList.hasMore ? "inline-block" : "none";
    }

    var countEl = document.getElementById("cases-count");
    if (countEl) {
      var tbody = document.getElementById("cases-tbody");
      var currentCount = tbody ? tbody.children.length : page.items.length;
      countEl.textContent = currentCount + " case(s)";
    }
  });
}

// ── Cases screen row renderer ────────────────────────────────
function renderCasesRows(items, append) {
  var tbody = document.getElementById("cases-tbody");
  if (!tbody) return;

  if (!append) tbody.innerHTML = "";

  if (!items || !items.length) {
    if (!append) {
      tbody.innerHTML = '<tr><td colspan="6" style="opacity:.7;padding:10px 8px">No cases found</td></tr>';
    }
    return;
  }

  for (var i = 0; i < items.length; i++) {
    var c = items[i];

    var pri = _casesPriorityBadge(c.priority);
    var stCls = _casesStatusClass(c.status);
    var stLbl = _casesStatusLabel(c.status);
    var due = _casesFormatDue(c.due_at);
    var age = _casesFormatAge(c.created_at);

    var subtitle = c.description || "";
    if (!subtitle) {
      var notes = (c.note_count != null) ? c.note_count : 0;
      var docs = (c.linked_docs_count != null) ? c.linked_docs_count : 0;
      var files = (c.linked_files_count != null) ? c.linked_files_count : 0;
      subtitle = notes + " notes \u00B7 " + docs + " docs \u00B7 " + files + " files";
    }

    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td><span class="aq-badge ' + pri.cls + '">' + escapeHtml(pri.text) + "</span></td>" +
      "<td>" +
        '<div class="aq-co">' + escapeHtml(c.title || "") + "</div>" +
        '<div class="aq-detail">' + escapeHtml(c.case_number || "") + " \u00B7 " + escapeHtml(subtitle) + "</div>" +
      "</td>" +
      '<td><span class="mc-status ' + stCls + '">' + escapeHtml(stLbl) + "</span></td>" +
      '<td class="aq-since">' + escapeHtml(due) + "</td>" +
      '<td class="aq-since">' + escapeHtml(age) + "</td>" +
      '<td><span class="aq-action">Open \u2192</span></td>';

    (function (caseId) {
      tr.onclick = function () { openCase(caseId); };
    })(c.id);

    tbody.appendChild(tr);
  }
}

// HTML escape helper
function _escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── My Cases widget helpers ─────────────────────────────────
function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  s = String(s);
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function hoursBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / 3600000);
}

function formatAge(isoDate) {
  if (!isoDate) return "";
  var d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  var now = new Date();
  var h = hoursBetween(d, now);
  if (h < 24) return h + "h";
  var days = Math.floor(h / 24);
  return days + "d";
}

function mapPriorityBadge(priority) {
  priority = (priority || "").toUpperCase();
  if (priority === "URGENT") return { text: "Urgent", cls: "breach" };
  if (priority === "HIGH")   return { text: "High",   cls: "payment" };
  if (priority === "MEDIUM") return { text: "Medium", cls: "compliance" };
  return { text: "Low", cls: "stuck" };
}

function mapStatusClass(status) {
  status = (status || "").toUpperCase();
  if (status === "IN_PROGRESS") return "in-progress";
  if (status === "WAITING") return "waiting";
  if (status === "CLOSED") return "closed";
  return "open";
}

function mapStatusLabel(status) {
  status = (status || "").toUpperCase();
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "WAITING") return "Waiting";
  if (status === "CLOSED") return "Closed";
  if (status === "CANCELLED") return "Cancelled";
  return "Open";
}

// ── Normalizer + safe setters (case detail) ─────────────────
function normItems(payload) {
  if (!payload) return [];
  if (payload.items && payload.items.length != null) return payload.items;
  if (payload.data && payload.data.items && payload.data.items.length != null) return payload.data.items;
  if (payload.length != null) return payload;
  return [];
}

function safeText(el, txt) {
  if (!el) return;
  el.textContent = (txt === null || txt === undefined) ? "" : String(txt);
}

function setLoading(el, on, msg) {
  if (!el) return;
  if (on) {
    el.innerHTML = '<div style="opacity:.7;padding:10px 8px">' + escapeHtml(msg || "Loading...") + '</div>';
  }
}

// ── My Cases widget renderer ────────────────────────────────
function renderMyCasesWidget(payload) {
  var card = document.querySelector('.widget-card[data-widget-id="my-cases"]');
  if (!card) return;

  var tbody = card.querySelector("tbody.my-cases-body");
  if (!tbody) return;

  var items = [];
  if (payload) {
    if (payload.items && payload.items.length != null) items = payload.items;
    else if (payload.length != null) items = payload;
  }

  // Clear demo rows
  tbody.innerHTML = "";

  if (!items.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="opacity:.7;padding:10px 8px">No assigned cases</td></tr>';
    return;
  }

  for (var i = 0; i < items.length; i++) {
    var c = items[i];

    // Pick best "subtitle" text: description first, else show counts
    var subtitle = c.description || "";
    if (!subtitle) {
      var notes = (c.note_count != null) ? c.note_count : 0;
      var docs = (c.linked_docs_count != null) ? c.linked_docs_count : 0;
      var files = (c.linked_files_count != null) ? c.linked_files_count : 0;
      subtitle = notes + " notes · " + docs + " docs · " + files + " files";
    }

    var pri = mapPriorityBadge(c.priority);
    var statusCls = mapStatusClass(c.status);
    var statusLbl = mapStatusLabel(c.status);
    var age = formatAge(c.created_at);

    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td><span class="aq-badge ' + pri.cls + '">' + escapeHtml(pri.text) + '</span></td>' +
      '<td>' +
        '<div class="aq-co">' + escapeHtml(c.title || "") + '</div>' +
        '<div class="aq-detail">' + escapeHtml(c.case_number || "") + ' · ' + escapeHtml(subtitle) + '</div>' +
      '</td>' +
      '<td><span class="mc-status ' + statusCls + '">' + escapeHtml(statusLbl) + '</span></td>' +
      '<td class="aq-since">' + escapeHtml(age) + '</td>' +
      '<td><span class="aq-action">Open →</span></td>';

    // Click row to open case detail
    (function(caseId){
      tr.onclick = function() {
        if (typeof openCase === "function") openCase(caseId);
        else if (typeof switchScreen === "function") {
          switchScreen("cases");
        }
      };
    })(c.id);

    tbody.appendChild(tr);
  }
}

// ── Pending Approvals widget renderer ─────────────────────────
function renderApprovalsWidget(payload) {
  var card = document.querySelector('.widget-card[data-widget-id="pending-approvals"]');
  if (!card) return;

  var tbody = card.querySelector("tbody.approvals-widget-body");
  if (!tbody) return;

  var items = [];
  if (payload) {
    if (payload.items && payload.items.length != null) items = payload.items;
    else if (payload.length != null) items = payload;
  }

  // Clear loading / demo rows
  tbody.innerHTML = "";

  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="opacity:.7;padding:10px 8px">No pending approvals</td></tr>';
    return;
  }

  // Show at most 5 in the widget
  var max = items.length > 5 ? 5 : items.length;
  for (var i = 0; i < max; i++) {
    var a = items[i];
    var caseInfo = a.case_number ? (a.case_number + (a.case_title ? " \u00B7 " + a.case_title : "")) : "\u2014";
    var age = _approvalsFmtAge ? _approvalsFmtAge(a.created_at) : "";

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><div class='aq-co'>" + escapeHtml(a.workflow_name || "") + "</div>" +
      "<div class='aq-detail'>" + escapeHtml(a.step_name || "") + "</div></td>" +
      "<td class='aq-detail'>" + escapeHtml(caseInfo) + "</td>" +
      "<td class='aq-since'>" + escapeHtml(age) + "</td>" +
      "<td><span class='aq-action' onclick=\"switchScreen('approvals')\">Review \u2192</span></td>";

    tbody.appendChild(tr);
  }
}

function dashLoadApprovalsWidget() {
  novatraiApi("/approvals/my?limit=5&decision=PENDING", null, function(err, data) {
    if (err) {
      console.log("Approvals widget failed:", err.message);
      return;
    }
    var norm = _approvalsNormList(data);
    renderApprovalsWidget({ items: norm.items });
  });
}

function renderCaseListES5(items, meta) {
  if (!items) return;

  var container = document.querySelector('#screen-companies .companies-content');
  if (!container) return;

  var colsRow = container.querySelector('.comp-cols');

  var rowsHTML = '';
  for (var i = 0; i < items.length; i++) {
    var c = items[i];
    var name      = c.name || '';
    var trade     = c.tradeName || '';
    var desc      = c.description || '';
    var active    = c.active !== false;
    var website   = c.website || '';
    var contacts  = c.contactCount || 0;
    var emails    = c.emailCount || 0;
    var addresses = c.addressCount || 0;
    var phones    = c.phoneCount || 0;
    var created   = c.createdAt || '';
    var cid       = c.id || '';

    if (created && created.indexOf('T') > -1) {
      try {
        var d = new Date(created);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        created = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
      } catch(e) {}
    }

    var toggleClass = active ? 'row-toggle' : 'row-toggle off';
    var tradeClass  = trade ? (c.isLinked ? 'comp-trade linked' : 'comp-trade') : 'comp-trade';

    rowsHTML += '<div class="comp-row" onclick="switchScreen(\'company\')">' +
      '<div class="comp-name">' +
        '<span class="comp-name-text">' + _escHtml(name) + '</span>' +
        '<span class="' + tradeClass + '">' + _escHtml(trade) + '</span>' +
      '</div>' +
      '<div class="comp-desc">' + _escHtml(desc) + '</div>' +
      '<div><div class="' + toggleClass + '" onclick="toggleRowSwitch(this,event)"></div></div>' +
      '<div><a class="comp-link" href="#" onclick="event.stopPropagation()">' + _escHtml(website) + '</a></div>' +
      '<div class="comp-num">' + contacts + '</div>' +
      '<div class="comp-num">' + emails + '</div>' +
      '<div class="comp-num">' + addresses + '</div>' +
      '<div class="comp-num">' + phones + '</div>' +
      '<div class="comp-date">' + _escHtml(created) + '</div>' +
      '<div class="comp-chevron"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></div>' +
    '</div>';
  }

  container.innerHTML = '';
  if (colsRow) container.appendChild(colsRow);
  var tmp = document.createElement('div');
  tmp.innerHTML = rowsHTML;
  while (tmp.firstChild) container.appendChild(tmp.firstChild);

  _updateCaseListFooter(meta);
  console.log("Novatrai: case list rendered — " + items.length + " companies");
}

function _updateCaseListFooter(meta) {
  if (!meta) return;
  var footer = document.querySelector('#screen-companies .companies-footer');
  if (!footer) return;

  var summaryEl = footer.querySelector('span');
  if (summaryEl && meta.total !== undefined) {
    var start = ((meta.page - 1) * meta.limit) + 1;
    var end   = Math.min(meta.page * meta.limit, meta.total);
    if (meta.total === 0) { start = 0; end = 0; }
    summaryEl.textContent = start + '-' + end + ' of ' + meta.total + ' companies';
  }

  var pageInfo = footer.querySelector('.pagination-info > span');
  if (pageInfo && meta.totalPages !== undefined) {
    pageInfo.textContent = 'Page ' + meta.page + ' of ' + meta.totalPages;
  }
}


/* ═══════════════════════════════════════════════════════════════
 *  AUTO-WIRE: Hook into dashboard + case list lifecycle
 * ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
  // Dashboard: hydrate after grid renders
  setTimeout(function() {
    renamePipelineTitle();
    hydrateDashboardFromApi();
    initDashboardData();
  }, 300);

  // Case list: search input debounced
  var searchInput = document.querySelector('#screen-companies .contacts-search');
  if (searchInput) {
    var _searchTimer = null;
    searchInput.addEventListener('input', function() {
      clearTimeout(_searchTimer);
      var val = searchInput.value;
      _searchTimer = setTimeout(function() {
        loadCaseListES5({ search: val, page: 1 }, function(err, data) {
          if (err) return;
          if (data && data.items) renderCaseListES5(data.items, data.meta);
        });
      }, 350);
    });
  }

  // Case list: pagination buttons
  var footer = document.querySelector('#screen-companies .companies-footer');
  if (footer) {
    var btns = footer.querySelectorAll('.page-btn');
    if (btns.length >= 2) {
      btns[0].addEventListener('click', function() {
        if (_caseListState.page <= 1) return;
        loadCaseListES5({ page: _caseListState.page - 1 }, function(err, data) {
          if (err) return;
          if (data && data.items) renderCaseListES5(data.items, data.meta);
        });
      });
      btns[1].addEventListener('click', function() {
        loadCaseListES5({ page: _caseListState.page + 1 }, function(err, data) {
          if (err) return;
          if (data && data.items) renderCaseListES5(data.items, data.meta);
        });
      });
    }
    var perPage = footer.querySelector('.per-page-select');
    if (perPage) {
      perPage.addEventListener('change', function() {
        var val = parseInt(perPage.value, 10) || 10;
        loadCaseListES5({ limit: val, page: 1 }, function(err, data) {
          if (err) return;
          if (data && data.items) renderCaseListES5(data.items, data.meta);
        });
      });
    }
  }
});

// Hook into switchScreen for re-hydration
(function() {
  var _checkInterval = setInterval(function() {
    if (typeof window.switchScreen === 'function') {
      clearInterval(_checkInterval);

      var _origSwitch = window.switchScreen;
      window.switchScreen = function(name) {
        _origSwitch(name);

        if (name === 'dashboard') {
          setTimeout(function() {
            renamePipelineTitle();
            hydrateDashboardFromApi();
            initDashboardData();
          }, 300);
        }

        if (name === 'companies') {
          loadCaseListES5(null, function(err, data) {
            if (err) { console.log("Novatrai: case list load failed — " + err.message); return; }
            if (data && data.items) renderCaseListES5(data.items, data.meta);
          });
        }

        if (name === 'tasks') {
          tasksReload();
        }

        if (name === 'approvals') {
          approvalsReload();
        }

        if (name === 'my-day') {
          if (typeof myDayReload === 'function') myDayReload();
        }
      };

      console.log("Novatrai: api-wire.js hooked into switchScreen");
    }
  }, 100);
})();

/* ═══════════════════════════════════════════════════════════════
 *  TASKS SCREEN — state, filters, loader, renderer (ES5)
 * ═══════════════════════════════════════════════════════════════ */

window.NOVATRAI = window.NOVATRAI || {};
window.NOVATRAI.tasksList = window.NOVATRAI.tasksList || {
  cursor: null,
  hasMore: false,
  lastQueryKey: ""
};

function tasksGetFilters() {
  var q  = document.getElementById("tasks-search");
  var st = document.getElementById("tasks-status-filter");
  return {
    q:      q  ? (q.value || "").trim() : "",
    status: st ? st.value : "OPEN"
  };
}

function tasksOnFilterChanged() { tasksReload(); }

function tasksReload() {
  window.NOVATRAI.tasksList.cursor = null;
  window.NOVATRAI.tasksList.hasMore = false;
  var tbody = document.getElementById("tasks-tbody");
  if (tbody) tbody.innerHTML = "";
  tasksLoadMore();
}

function tasksLoadMore() {
  if (typeof loadTasksPage === "function") loadTasksPage();
}

// ── Tasks normalizer ─────────────────────────────────────────
function _tasksNormList(payload) {
  if (!payload) return { items: [], hasMore: false, nextCursor: null };
  if (payload.items && payload.items.length != null) return {
    items: payload.items,
    hasMore: !!payload.hasMore,
    nextCursor: payload.nextCursor || payload.next_cursor || payload.cursor || null
  };
  if (payload.data && payload.data.items && payload.data.items.length != null) return {
    items: payload.data.items,
    hasMore: !!payload.data.hasMore,
    nextCursor: payload.data.nextCursor || payload.data.next_cursor || payload.data.cursor || null
  };
  if (payload.length != null) return { items: payload, hasMore: false, nextCursor: null };
  return { items: [], hasMore: false, nextCursor: null };
}

// ── Tasks helpers ────────────────────────────────────────────
function _tasksFmtAge(iso) {
  if (!iso) return "";
  var d = new Date(iso); if (isNaN(d.getTime())) return "";
  var h = Math.floor((new Date().getTime() - d.getTime()) / 3600000);
  if (h < 24) return h + "h";
  return Math.floor(h / 24) + "d";
}

function _tasksFmtDue(iso) {
  if (!iso) return "";
  var d = new Date(iso); if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

// ── Tasks loader (cursor pagination) ─────────────────────────
function loadTasksPage() {
  var filters = tasksGetFilters();
  var limit = 25;

  var qs = [];
  qs.push("limit=" + encodeURIComponent(limit));
  if (filters.q) qs.push("q=" + encodeURIComponent(filters.q));
  if (filters.status) qs.push("status=" + encodeURIComponent(filters.status));
  if (window.NOVATRAI.tasksList.cursor) qs.push("cursor=" + encodeURIComponent(window.NOVATRAI.tasksList.cursor));

  var key = (filters.q || "") + "|" + (filters.status || "");
  if (window.NOVATRAI.tasksList.lastQueryKey !== key && window.NOVATRAI.tasksList.cursor) {
    window.NOVATRAI.tasksList.cursor = null;
    var tb = document.getElementById("tasks-tbody");
    if (tb) tb.innerHTML = "";
  }
  window.NOVATRAI.tasksList.lastQueryKey = key;

  var btn = document.getElementById("tasks-load-more");
  if (btn) { btn.disabled = true; btn.textContent = "Loading\u2026"; btn.style.display = "inline-block"; }

  novatraiApi("/tasks/my?" + qs.join("&"), null, function(err, data) {
    if (btn) { btn.disabled = false; btn.textContent = "Load more"; }
    if (err) {
      console.log("Tasks load failed:", err.message);
      if (btn) btn.style.display = "none";
      var tbody = document.getElementById("tasks-tbody");
      if (tbody && !tbody.children.length) {
        var msg = (err.status === 404) ? "Tasks endpoint not enabled yet." : "Failed to load tasks: " + escapeHtml(err.message);
        tbody.innerHTML = '<tr><td colspan="4" style="opacity:.7;padding:10px 8px">' + msg + '</td></tr>';
      }
      return;
    }

    var page = _tasksNormList(data);
    renderTasksRows(page.items, !!window.NOVATRAI.tasksList.cursor);

    window.NOVATRAI.tasksList.hasMore = !!page.hasMore;
    window.NOVATRAI.tasksList.cursor = page.nextCursor;

    if (btn) btn.style.display = window.NOVATRAI.tasksList.hasMore ? "inline-block" : "none";

    var countEl = document.getElementById("tasks-count");
    if (countEl) {
      var tbody = document.getElementById("tasks-tbody");
      countEl.textContent = (tbody ? tbody.children.length : page.items.length) + " task(s)";
    }
  });
}

// ── Tasks row renderer ───────────────────────────────────────
function renderTasksRows(items, append) {
  var tbody = document.getElementById("tasks-tbody");
  if (!tbody) return;
  if (!append) tbody.innerHTML = "";

  if (!items || !items.length) {
    if (!append) tbody.innerHTML = '<tr><td colspan="5" style="opacity:.7;padding:10px 8px">No tasks</td></tr>';
    return;
  }

  for (var i = 0; i < items.length; i++) {
    var t = items[i];
    var tr = document.createElement("tr");

    var subtitle = t.case_number ? (t.case_number + " \u00B7 " + (t.case_title || "")) : (t.description || "");
    var taskStatus = t.status || "OPEN";
    var taskLifeHtml = (typeof _osTaskLifeHtml === "function") ? _osTaskLifeHtml(taskStatus) : "";
    tr.innerHTML =
      "<td><div class='aq-co'>" + escapeHtml(t.title || "") + "</div>" +
      "<div class='aq-detail'>" + escapeHtml(subtitle || "") + "</div></td>" +
      "<td>" + taskLifeHtml + "</td>" +
      "<td class='aq-since'>" + escapeHtml(_tasksFmtDue(t.due_at)) + "</td>" +
      "<td class='aq-since'>" + escapeHtml(_tasksFmtAge(t.created_at)) + "</td>" +
      "<td><span class='aq-action'>Complete \u2192</span></td>";

    (function(taskId, linkedCaseId) {
      tr.onclick = function() {
        tasksComplete(taskId, linkedCaseId);
      };
    })(t.id, t.case_id || null);

    tbody.appendChild(tr);
  }
}

// ── Complete task (atomic transition) ────────────────────────
function tasksComplete(taskId, caseId) {
  novatraiApi("/tasks/" + encodeURIComponent(taskId) + "/complete", { method: "POST", body: {} }, function(err) {
    if (err) {
      if (window.showToast) window.showToast("Complete failed");
      return alert(err.message);
    }
    if (window.showToast) window.showToast("Task completed");
    tasksReload();
    // If a case is open in overlay, refresh its timeline/overview
    if (caseId && window.NOVATRAI && window.NOVATRAI.caseDetail && window.NOVATRAI.caseDetail.activeId === caseId) {
      csdRefreshTimeline(caseId);
      csdRefreshOverview(caseId);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
 *  APPROVALS SCREEN — state, filters, loader, renderer (ES5)
 * ═══════════════════════════════════════════════════════════════ */

window.NOVATRAI = window.NOVATRAI || {};
window.NOVATRAI.approvalsList = window.NOVATRAI.approvalsList || {
  cursor: null,
  hasMore: false,
  lastQueryKey: ""
};

function approvalsGetFilters() {
  var q  = document.getElementById("approvals-search");
  var df = document.getElementById("approvals-decision-filter");
  return {
    q:        q  ? (q.value || "").trim() : "",
    decision: df ? df.value : "PENDING"
  };
}

function approvalsOnFilterChanged() { approvalsReload(); }

function approvalsReload() {
  window.NOVATRAI.approvalsList.cursor = null;
  window.NOVATRAI.approvalsList.hasMore = false;
  var tbody = document.getElementById("approvals-tbody");
  if (tbody) tbody.innerHTML = "";
  approvalsLoadMore();
}

function approvalsLoadMore() {
  if (typeof loadApprovalsPage === "function") loadApprovalsPage();
}

// ── Approvals normalizer ─────────────────────────────────────
function _approvalsNormList(payload) {
  if (!payload) return { items: [], hasMore: false, nextCursor: null };
  if (payload.items && payload.items.length != null) return {
    items: payload.items,
    hasMore: !!payload.hasMore,
    nextCursor: payload.nextCursor || payload.next_cursor || payload.cursor || null
  };
  if (payload.data && payload.data.items && payload.data.items.length != null) return {
    items: payload.data.items,
    hasMore: !!payload.data.hasMore,
    nextCursor: payload.data.nextCursor || payload.data.next_cursor || payload.data.cursor || null
  };
  if (payload.length != null) return { items: payload, hasMore: false, nextCursor: null };
  return { items: [], hasMore: false, nextCursor: null };
}

// ── Approvals helpers ────────────────────────────────────────
function _approvalsFmtAge(iso) {
  if (!iso) return "";
  var d = new Date(iso); if (isNaN(d.getTime())) return "";
  var h = Math.floor((new Date().getTime() - d.getTime()) / 3600000);
  if (h < 24) return h + "h";
  return Math.floor(h / 24) + "d";
}

function _approvalsDecisionPill(decision) {
  var d = (decision || "PENDING").toUpperCase();
  var cls = "pending";
  if (d === "APPROVED") cls = "approved";
  else if (d === "REJECTED") cls = "rejected";
  return '<span class="appr-pill ' + cls + '">' + escapeHtml(d) + '</span>';
}

// ── Approvals loader (cursor pagination) ─────────────────────
function loadApprovalsPage() {
  var filters = approvalsGetFilters();
  var limit = 25;

  var qs = [];
  qs.push("limit=" + encodeURIComponent(limit));
  if (filters.q) qs.push("q=" + encodeURIComponent(filters.q));
  if (filters.decision) qs.push("decision=" + encodeURIComponent(filters.decision));
  if (window.NOVATRAI.approvalsList.cursor) qs.push("cursor=" + encodeURIComponent(window.NOVATRAI.approvalsList.cursor));

  var key = (filters.q || "") + "|" + (filters.decision || "");
  if (window.NOVATRAI.approvalsList.lastQueryKey !== key && window.NOVATRAI.approvalsList.cursor) {
    window.NOVATRAI.approvalsList.cursor = null;
    var tb = document.getElementById("approvals-tbody");
    if (tb) tb.innerHTML = "";
  }
  window.NOVATRAI.approvalsList.lastQueryKey = key;

  var btn = document.getElementById("approvals-load-more");
  if (btn) { btn.disabled = true; btn.textContent = "Loading\u2026"; btn.style.display = "inline-block"; }

  novatraiApi("/approvals/my?" + qs.join("&"), null, function(err, data) {
    if (btn) { btn.disabled = false; btn.textContent = "Load more"; }
    if (err) {
      console.log("Approvals load failed:", err.message);
      if (btn) btn.style.display = "none";
      var tbody = document.getElementById("approvals-tbody");
      if (tbody && !tbody.children.length) {
        var msg = (err.status === 404) ? "Approvals endpoint not enabled yet." : "Failed to load approvals: " + escapeHtml(err.message);
        tbody.innerHTML = '<tr><td colspan="5" style="opacity:.7;padding:10px 8px">' + msg + '</td></tr>';
      }
      return;
    }

    var page = _approvalsNormList(data);
    renderApprovalsRows(page.items, !!window.NOVATRAI.approvalsList.cursor);

    window.NOVATRAI.approvalsList.hasMore = !!page.hasMore;
    window.NOVATRAI.approvalsList.cursor = page.nextCursor;

    if (btn) btn.style.display = window.NOVATRAI.approvalsList.hasMore ? "inline-block" : "none";

    var countEl = document.getElementById("approvals-count");
    if (countEl) {
      var tbody = document.getElementById("approvals-tbody");
      countEl.textContent = (tbody ? tbody.children.length : page.items.length) + " approval(s)";
    }
  });
}

// ── Approvals row renderer ───────────────────────────────────
function renderApprovalsRows(items, append) {
  var tbody = document.getElementById("approvals-tbody");
  if (!tbody) return;
  if (!append) tbody.innerHTML = "";

  if (!items || !items.length) {
    if (!append) tbody.innerHTML = '<tr><td colspan="5" style="opacity:.7;padding:10px 8px">No approvals</td></tr>';
    return;
  }

  for (var i = 0; i < items.length; i++) {
    var a = items[i];
    var tr = document.createElement("tr");

    var caseInfo = a.case_number ? (a.case_number + (a.case_title ? " \u00B7 " + a.case_title : "")) : "\u2014";
    var isPending = (a.decision || "").toUpperCase() === "PENDING";

    var actionHtml = "";
    if (isPending) {
      actionHtml =
        '<div class="appr-act">' +
        '<button class="appr-btn approve" data-id="' + escapeHtml(a.id) + '" data-decision="APPROVED">\u2713 Approve</button>' +
        '<button class="appr-btn reject" data-id="' + escapeHtml(a.id) + '" data-decision="REJECTED">\u2717 Reject</button>' +
        '</div>';
    } else {
      actionHtml = '<span class="aq-since">' + escapeHtml(a.decided_at ? new Date(a.decided_at).toLocaleDateString() : "") + '</span>';
    }

    tr.innerHTML =
      "<td><div class='aq-co'>" + escapeHtml(a.workflow_name || "") + "</div>" +
      "<div class='aq-detail'>" + escapeHtml(a.step_name || "") + "</div></td>" +
      "<td class='aq-detail'>" + escapeHtml(caseInfo) + "</td>" +
      "<td>" + (typeof _osApprovalLifeHtml === "function" ? _osApprovalLifeHtml(a.decision) : _approvalsDecisionPill(a.decision)) + "</td>" +
      "<td class='aq-since'>" + escapeHtml(_approvalsFmtAge(a.created_at)) + "</td>" +
      "<td>" + actionHtml + "</td>";

    tbody.appendChild(tr);
  }

  // Attach click handlers for approve/reject buttons
  var buttons = tbody.querySelectorAll(".appr-btn[data-id]");
  for (var b = 0; b < buttons.length; b++) {
    (function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var approvalId = btn.getAttribute("data-id");
        var decision = btn.getAttribute("data-decision");
        approvalsDecide(approvalId, decision);
      };
    })(buttons[b]);
  }
}

// ── Approvals context help toggle + first-time nudge ──────────
function toggleApprovalsHelp() {
  var el = document.getElementById("approvals-help");
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// First-time nudge: auto-show help on first visit to Approvals screen
(function() {
  var KEY = "novatrai_seen_approvals_help";
  var _origSwitch = null;
  var _hookInterval = setInterval(function() {
    if (typeof window.switchScreen !== "function") return;
    clearInterval(_hookInterval);
    _origSwitch = window.switchScreen;
    window.switchScreen = function(name) {
      _origSwitch(name);
      if (name === "approvals") {
        try {
          if (!localStorage.getItem(KEY)) {
            localStorage.setItem(KEY, "1");
            setTimeout(function() {
              var el = document.getElementById("approvals-help");
              if (el) el.style.display = "block";
            }, 400);
          }
        } catch(e) {}
      }
    };
  }, 100);
})();

// ── Cases context help toggle + first-time nudge ──────────────
function toggleCasesHelp() {
  var el = document.getElementById("cases-help");
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

(function() {
  var KEY = "novatrai_seen_cases_help";
  var _hookInterval = setInterval(function() {
    if (typeof window.switchScreen !== "function") return;
    clearInterval(_hookInterval);
    var _origSwitch = window.switchScreen;
    window.switchScreen = function(name) {
      _origSwitch(name);
      if (name === "cases") {
        try {
          if (!localStorage.getItem(KEY)) {
            localStorage.setItem(KEY, "1");
            setTimeout(function() {
              var el = document.getElementById("cases-help");
              if (el) el.style.display = "block";
            }, 400);
          }
        } catch(e) {}
      }
    };
  }, 100);
})();

// ── Generic screen help toggle ─────────────────────────────────
function toggleScreenHelp(helpId) {
  var el = document.getElementById(helpId);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// First-time auto-show nudge for all screen help tooltips
(function() {
  var screens = [
    { name: "dashboard", key: "novatrai_seen_dashboard_help", id: "dashboard-help" },
    { name: "my-day",    key: "novatrai_seen_myday_help",     id: "myday-help" },
    { name: "pipeline",  key: "novatrai_seen_pipeline_help",  id: "pipeline-help" },
    { name: "tasks",     key: "novatrai_seen_tasks_help",     id: "tasks-help" },
    { name: "companies", key: "novatrai_seen_companies_help", id: "companies-help" },
    { name: "contacts",  key: "novatrai_seen_contacts_help",  id: "contacts-help" },
    { name: "calendar",  key: "novatrai_seen_calendar_help",  id: "calendar-help" }
  ];
  var _hookInterval2 = setInterval(function() {
    if (typeof window.switchScreen !== "function") return;
    clearInterval(_hookInterval2);
    var _origSwitch2 = window.switchScreen;
    window.switchScreen = function(name) {
      _origSwitch2(name);
      for (var i = 0; i < screens.length; i++) {
        if (screens[i].name === name) {
          try {
            if (!localStorage.getItem(screens[i].key)) {
              localStorage.setItem(screens[i].key, "1");
              (function(id) {
                setTimeout(function() {
                  var el = document.getElementById(id);
                  if (el) el.style.display = "block";
                }, 400);
              })(screens[i].id);
            }
          } catch(e) {}
          break;
        }
      }
    };
  }, 100);
})();

// ── Decide on approval (atomic transition) ────────────────────
function approvalsDecide(approvalId, decision) {
  var comments = "";
  if (decision === "REJECTED") {
    comments = prompt("Rejection reason (optional):");
    if (comments === null) return; // user cancelled
  }

  var body = { decision: decision };
  if (comments) body.comments = comments;

  novatraiApi("/approvals/" + encodeURIComponent(approvalId) + "/decide", { method: "POST", body: body }, function(err) {
    if (err) {
      if (err.status === 409) {
        if (window.showToast) window.showToast("Already decided");
      } else {
        if (window.showToast) window.showToast("Decision failed");
        alert(err.message);
      }
      return;
    }
    if (window.showToast) window.showToast("Approval " + decision.toLowerCase());
    approvalsReload();
    // Refresh dashboard widget if visible
    if (typeof dashLoadApprovalsWidget === "function") dashLoadApprovalsWidget();
    // Refresh case detail if open
    if (window.NOVATRAI && window.NOVATRAI.caseDetail && window.NOVATRAI.caseDetail.activeId) {
      if (typeof csdRefreshTimeline === "function") csdRefreshTimeline(window.NOVATRAI.caseDetail.activeId);
      if (typeof csdRefreshOverview === "function") csdRefreshOverview(window.NOVATRAI.caseDetail.activeId);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
 *  MY DAY SCREEN — parallel fetch + client-side aggregation (ES5)
 * ═══════════════════════════════════════════════════════════════ */

function myDayReload() {
  _myDaySetLoading();

  // Fetch pipeline deal tiles (independent of other My Day data)
  _myDayFetchDealTiles();

  // Try single aggregated endpoint first; fall back to 3-call approach
  novatraiApi("/my-day", null, function(err, data) {
    if (!err && data) {
      // Unwrap ResponseTransformInterceptor wrapper if present
      var d = data.data || data;
      var appr = d.approvalsPendingTop || [];
      var overdue = d.overdueTasksTop || [];
      var today = d.dueTodayTasksTop || [];
      var pri = d.priorityCasesTop || [];
      var wait = d.waitingTooLongTop || [];

      _myDayRenderApprovals(null, { items: appr });
      _myDayRenderTaskListDirect(overdue, today);
      _myDayRenderCasesDirect(pri, wait);
      _myDayUpdateKpis({ approvals: appr.length, overdue: overdue.length, today: today.length, priority: pri.length });
      _myDayUpdatedStamp();
      return;
    }

    // Fallback: 3 parallel calls (backend may not have /my-day yet)
    console.log("Novatrai: /my-day unavailable, falling back to 3-call mode");
    var counts = { approvals: 0, overdue: 0, today: 0, priority: 0 };
    var done = { a: false, t: false, c: false };
    function mark(k) {
      done[k] = true;
      if (done.a && done.t && done.c) {
        _myDayUpdateKpis(counts);
        _myDayUpdatedStamp();
      }
    }

    novatraiApi("/approvals/my?decision=PENDING&limit=10", null, function(err2, data2) {
      var items = err2 ? [] : _myDayNormItems(data2);
      counts.approvals = items.length;
      _myDayRenderApprovals(err2, data2);
      mark("a");
    });

    novatraiApi("/tasks/my?status=OPEN&limit=80", null, function(err2, data2) {
      var items = err2 ? [] : _myDayNormItems(data2);
      var o = 0, t = 0;
      for (var i = 0; i < items.length; i++) {
        if (items[i].due_at && _myDayIsOverdue(items[i].due_at)) o++;
        if (items[i].due_at && _myDayIsToday(items[i].due_at)) t++;
      }
      counts.overdue = o;
      counts.today = t;
      _myDayRenderTasks(err2, data2);
      mark("t");
    });

    novatraiApi("/cases/my?limit=80", null, function(err2, data2) {
      var items = err2 ? [] : _myDayNormItems(data2);
      var p = 0;
      for (var i = 0; i < items.length; i++) {
        var pr = (items[i].priority || "").toUpperCase();
        if (pr === "URGENT" || pr === "HIGH") p++;
      }
      counts.priority = p;
      _myDayRenderCases(err2, data2);
      mark("c");
    });
  });
}

// ── Direct renderers for pre-split backend data ─────────────
function _myDayRenderTaskListDirect(overdue, today) {
  // Sort: overdue oldest-due first, today earliest-due first
  overdue.sort(function(a, b) { return _sortByDateAsc(a, b, "due_at"); });
  today.sort(function(a, b) { return _sortByDateAsc(a, b, "due_at"); });
  _myDayRenderTaskList("myday-overdue-tasks-body", overdue, "No overdue tasks \u2014 nice work", "myday-overdue-tasks");
  _myDayRenderTaskList("myday-due-today-body", today, "Nothing due today", "myday-due-today");
}

function _myDayRenderCasesDirect(priority, waiting) {
  // Sort: URGENT > HIGH > newest; waiting: longest first
  priority.sort(function(a, b) {
    var pa = (a.priority || "").toUpperCase() === "URGENT" ? 0 : 1;
    var pb = (b.priority || "").toUpperCase() === "URGENT" ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return _sortByDateDesc(a, b, "updated_at");
  });
  waiting.sort(function(a, b) { return _sortByDateAsc(a, b, "updated_at"); });
  _myDayRenderCaseList("myday-top-cases-body", priority, "No high priority cases", 10, "myday-top-cases");
  _myDayRenderCaseList("myday-waiting-body", waiting, "No cases waiting too long", 8, "myday-waiting");
}

function _myDaySetLoading() {
  _myDaySetHtml("myday-approvals-body", "Loading\u2026");
  _myDaySetHtml("myday-overdue-tasks-body", "Loading\u2026");
  _myDaySetHtml("myday-top-cases-body", "Loading\u2026");
  _myDaySetHtml("myday-waiting-body", "Loading\u2026");
  _myDaySetHtml("myday-due-today-body", "Loading\u2026");
  _myDaySetHtml("myday-deals-risk-body", "Loading\u2026");
  _myDaySetHtml("myday-deals-closing-body", "Loading\u2026");
  _myDayHydateHeroDate();
}

function _myDayUpdatedStamp() {
  var el = document.getElementById("myday-updated");
  if (!el) return;
  el.textContent = "Updated " + new Date().toLocaleTimeString();
}

function _myDaySetHtml(id, text) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '<div style="opacity:.7;padding:10px 8px">' + escapeHtml(text) + '</div>';
}

// ── Hero date + greeting ─────────────────────────────────────
function _myDayHydateHeroDate() {
  var titleEl = document.getElementById("md-hero-title");
  var dateEl = document.getElementById("md-hero-date");
  var now = new Date();
  var h = now.getHours();
  var greeting = h < 12 ? "Good morning" : (h < 17 ? "Good afternoon" : "Good evening");
  var name = (window.NOVATRAI && window.NOVATRAI.me && window.NOVATRAI.me.firstName) ? window.NOVATRAI.me.firstName : "";
  if (titleEl) titleEl.textContent = greeting + (name ? ", " + name : "");
  if (dateEl) {
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    dateEl.textContent = days[now.getDay()] + ", " + now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear();
  }
}

// ── Hero KPI updater ─────────────────────────────────────────
function _myDayUpdateKpis(counts) {
  var ids = {
    approvals: "md-kpi-approvals",
    overdue:   "md-kpi-overdue",
    today:     "md-kpi-today",
    priority:  "md-kpi-priority"
  };
  for (var k in ids) {
    if (ids.hasOwnProperty(k)) {
      var el = document.getElementById(ids[k]);
      if (el && counts[k] != null) el.textContent = String(counts[k]);
    }
  }
}

// ── My Day normalizer ────────────────────────────────────────
function _myDayNormItems(payload) {
  if (!payload) return [];
  if (payload.items && payload.items.length != null) return payload.items;
  if (payload.data && payload.data.items && payload.data.items.length != null) return payload.data.items;
  if (payload.data && payload.data.length != null) return payload.data;
  if (payload.length != null) return payload;
  return [];
}

function _myDayIsOverdue(iso) {
  if (!iso) return false;
  var d = new Date(iso); if (isNaN(d.getTime())) return false;
  return d.getTime() < new Date().getTime();
}

function _myDayIsToday(iso) {
  if (!iso) return false;
  var d = new Date(iso); if (isNaN(d.getTime())) return false;
  var n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

// ── Tile count updater ───────────────────────────────────────
function _myDayTileCount(widgetId, count) {
  var card = document.getElementById(widgetId);
  if (!card) return;
  var title = card.querySelector(".widget-title");
  if (!title) return;
  // Strip any existing count suffix
  var base = title.getAttribute("data-base-title");
  if (!base) {
    base = title.textContent.replace(/\s*\(\d+\)\s*$/, "");
    title.setAttribute("data-base-title", base);
  }
  // Rebuild innerHTML preserving the SVG icon
  var svg = title.querySelector("svg");
  var svgHtml = svg ? svg.outerHTML + " " : "";
  title.innerHTML = svgHtml + escapeHtml(base) + (count > 0 ? " <span style='color:var(--text-mid);font-weight:600'>(" + count + ")</span>" : "");
}

// ── Sort helpers ─────────────────────────────────────────────
function _sortByDateAsc(a, b, field) {
  var da = a[field] ? new Date(a[field]).getTime() : Infinity;
  var db = b[field] ? new Date(b[field]).getTime() : Infinity;
  return da - db; // oldest first
}
function _sortByDateDesc(a, b, field) {
  var da = a[field] ? new Date(a[field]).getTime() : 0;
  var db = b[field] ? new Date(b[field]).getTime() : 0;
  return db - da; // newest first
}

// ── Render: Approvals ────────────────────────────────────────
function _myDayRenderApprovals(err, data) {
  var items = err ? [] : _myDayNormItems(data);
  var el = document.getElementById("myday-approvals-body");
  if (!el) return;

  // Sort: newest first
  items.sort(function(a, b) { return _sortByDateDesc(a, b, "created_at"); });

  _myDayTileCount("myday-approvals", items.length);

  // Update the responsibility hint
  var hintEl = document.getElementById("myday-approvals-hint");
  var hintCount = document.getElementById("myday-approvals-hint-count");
  if (hintEl && hintCount) {
    if (items.length > 0) {
      hintCount.textContent = String(items.length);
      hintEl.style.display = "block";
    } else {
      hintEl.style.display = "none";
    }
  }

  if (err) { el.innerHTML = '<div style="opacity:.7;padding:10px 8px">Failed to load</div>'; return; }
  if (!items.length) { el.innerHTML = '<div style="opacity:.7;padding:10px 8px">No pending approvals \u2014 you\u2019re clear</div>'; return; }

  var html = '<table class="aq-table"><tbody>';
  for (var i = 0; i < items.length; i++) {
    var a = items[i];
    var wf = (a.workflow_name || "Workflow") + " \u00B7 " + (a.step_name || "Step");
    var linked = a.case_number ? (a.case_number + " \u00B7 " + (a.case_title || "")) : "\u2014";
    var rowAction = a.case_id ? "openCase('" + escapeHtml(a.case_id) + "')" : "switchScreen('approvals')";
    html += "<tr onclick=\"" + rowAction + "\" style='cursor:pointer'>";
    html += "<td><div class='aq-co'>" + escapeHtml(wf) + "</div><div class='aq-detail'>" + escapeHtml(linked) + "</div></td>";
    html += "<td style='text-align:right'>";
    html += "<span class='appr-btn approve' data-appr-id='" + escapeHtml(a.id) + "' data-appr-dec='APPROVED'>Approve</span> ";
    html += "<span class='appr-btn reject' data-appr-id='" + escapeHtml(a.id) + "' data-appr-dec='REJECTED'>Reject</span>";
    html += "</td>";
    html += "</tr>";
  }
  html += "</tbody></table>";
  html += "<div style='display:flex;justify-content:flex-end;margin-top:10px'><span class='aq-action' onclick=\"switchScreen('approvals')\">Open inbox \u2192</span></div>";
  el.innerHTML = html;

  // Attach button handlers with stopPropagation
  var btns = el.querySelectorAll(".appr-btn[data-appr-id]");
  for (var b = 0; b < btns.length; b++) {
    (function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        approvalsDecide(btn.getAttribute("data-appr-id"), btn.getAttribute("data-appr-dec"));
      };
    })(btns[b]);
  }
}

// ── Render: Tasks (overdue + due today) ──────────────────────
function _myDayRenderTasks(err, data) {
  var items = err ? [] : _myDayNormItems(data);

  var overdue = [];
  var today = [];

  for (var i = 0; i < items.length; i++) {
    var t = items[i];
    if (t.due_at && _myDayIsOverdue(t.due_at)) overdue.push(t);
    if (t.due_at && _myDayIsToday(t.due_at)) today.push(t);
  }

  // Sort: overdue by most overdue first (oldest due_at), today by earliest due first
  // Fallback: older created_at first for deterministic ordering on ties
  overdue.sort(function(a, b) {
    var r = _sortByDateAsc(a, b, "due_at");
    return r !== 0 ? r : _sortByDateAsc(a, b, "created_at");
  });
  today.sort(function(a, b) {
    var r = _sortByDateAsc(a, b, "due_at");
    return r !== 0 ? r : _sortByDateAsc(a, b, "created_at");
  });

  _myDayRenderTaskList("myday-overdue-tasks-body", overdue, "No overdue tasks \u2014 nice work", "myday-overdue-tasks");
  _myDayRenderTaskList("myday-due-today-body", today, "Nothing due today", "myday-due-today");
}

function _myDayRenderTaskList(targetId, list, emptyMsg, widgetId) {
  var el = document.getElementById(targetId);
  if (!el) return;

  if (widgetId) _myDayTileCount(widgetId, list.length);

  if (!list.length) { el.innerHTML = '<div style="opacity:.7;padding:10px 8px">' + escapeHtml(emptyMsg) + '</div>'; return; }

  var html = '<table class="aq-table"><tbody>';
  for (var i = 0; i < Math.min(list.length, 8); i++) {
    var t = list[i];
    var sub = t.case_number ? (t.case_number + " \u00B7 " + (t.case_title || "")) : (t.description || "");
    var rowAction = t.case_id ? "openCase('" + escapeHtml(t.case_id) + "')" : "switchScreen('tasks')";
    html += "<tr onclick=\"" + rowAction + "\" style='cursor:pointer'>";
    html += "<td><div class='aq-co'>" + escapeHtml(t.title || "") + "</div><div class='aq-detail'>" + escapeHtml(sub || "") + "</div></td>";
    html += "<td style='text-align:right'><span class='aq-action md-complete-btn' data-task-id='" + escapeHtml(t.id) + "' data-case-id='" + escapeHtml(t.case_id || "") + "'>Complete \u2192</span></td>";
    html += "</tr>";
  }
  html += "</tbody></table>";
  el.innerHTML = html;

  // Attach complete buttons with stopPropagation
  var btns = el.querySelectorAll(".md-complete-btn[data-task-id]");
  for (var b = 0; b < btns.length; b++) {
    (function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        tasksComplete(btn.getAttribute("data-task-id"), btn.getAttribute("data-case-id") || null);
      };
    })(btns[b]);
  }
}

// ── Render: Cases (priority + waiting too long) ──────────────
function _myDayRenderCases(err, data) {
  var items = err ? [] : _myDayNormItems(data);

  var pri = [];
  var waiting = [];

  var now = new Date().getTime();
  for (var i = 0; i < items.length; i++) {
    var c = items[i];
    var p = (c.priority || "").toUpperCase();
    if (p === "URGENT" || p === "HIGH") pri.push(c);

    var st = (c.status || "").toUpperCase();
    var base = c.updated_at || c.created_at;
    if (st === "WAITING" && base) {
      var d = new Date(base);
      if (!isNaN(d.getTime())) {
        var days = Math.floor((now - d.getTime()) / 86400000);
        if (days >= 3) waiting.push(c);
      }
    }
  }

  // Sort priority: URGENT before HIGH, then by newest update
  pri.sort(function(a, b) {
    var pa = (a.priority || "").toUpperCase() === "URGENT" ? 0 : 1;
    var pb = (b.priority || "").toUpperCase() === "URGENT" ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return _sortByDateDesc(a, b, "updated_at");
  });

  // Sort waiting: longest waiting first (oldest updated_at)
  waiting.sort(function(a, b) { return _sortByDateAsc(a, b, "updated_at"); });

  _myDayRenderCaseList("myday-top-cases-body", pri, "No high priority cases", 10, "myday-top-cases");
  _myDayRenderCaseList("myday-waiting-body", waiting, "No cases waiting too long", 8, "myday-waiting");
}

function _myDayRenderCaseList(targetId, list, emptyMsg, max, widgetId) {
  var el = document.getElementById(targetId);
  if (!el) return;

  if (widgetId) _myDayTileCount(widgetId, list.length);

  // Update cases responsibility hint (same pattern as approvals)
  if (widgetId === "myday-top-cases") {
    var cHintEl = document.getElementById("myday-cases-hint");
    var cHintCount = document.getElementById("myday-cases-hint-count");
    if (cHintEl && cHintCount) {
      if (list.length > 0) {
        cHintCount.textContent = String(list.length);
        cHintEl.style.display = "block";
      } else {
        cHintEl.style.display = "none";
      }
    }
  }

  if (!list.length) { el.innerHTML = '<div style="opacity:.7;padding:10px 8px">' + escapeHtml(emptyMsg) + '</div>'; return; }

  var html = '<table class="aq-table"><tbody>';
  for (var i = 0; i < Math.min(list.length, max || 8); i++) {
    var c = list[i];
    var sub = (c.case_number ? c.case_number + " \u00B7 " : "") + (c.description || "");
    html += "<tr onclick=\"openCase('" + escapeHtml(c.id) + "')\" style='cursor:pointer'>";
    html += "<td><div class='aq-co'>" + escapeHtml(c.title || "") + "</div><div class='aq-detail'>" + escapeHtml(sub) + "</div></td>";
    html += "<td style='text-align:right'><span class='aq-action'>Open \u2192</span></td>";
    html += "</tr>";
  }
  html += "</tbody></table>";
  el.innerHTML = html;
}

// ── My Day: Pipeline Deal Tiles (At Risk + Closing This Week) ─

function _myDayFetchDealTiles() {
  // Demo mode: derive from synthetic board data
  var demoOn = false;
  try { demoOn = localStorage.getItem("novatrai_demo_mode") === "1"; } catch(e) {}
  if (demoOn && window._PLB_DEMO_BOARD) {
    _myDayRenderDealTiles(null, window._PLB_DEMO_BOARD);
    return;
  }

  // Live mode: fetch pipeline board
  novatraiApi("/pipelines", null, function(err, listResp) {
    if (err || !listResp) {
      _myDaySetHtml("myday-deals-risk-body", "No pipeline data");
      _myDaySetHtml("myday-deals-closing-body", "No pipeline data");
      return;
    }
    var items = _myDayNormItems(listResp);
    if (!items.length) {
      _myDaySetHtml("myday-deals-risk-body", "No pipelines configured");
      _myDaySetHtml("myday-deals-closing-body", "No pipelines configured");
      return;
    }
    var pipelineId = items[0].id;
    novatraiApi("/pipelines/" + pipelineId + "/board", null, function(err2, boardResp) {
      _myDayRenderDealTiles(err2, boardResp);
    });
  });
}

function _myDayRenderDealTiles(err, boardResp) {
  if (err || !boardResp) {
    _myDaySetHtml("myday-deals-risk-body", "Failed to load");
    _myDaySetHtml("myday-deals-closing-body", "Failed to load");
    return;
  }

  var stages = boardResp.stages || boardResp.columns || [];
  var allDeals = [];
  var currency = (boardResp.kpis && boardResp.kpis.currency) ? boardResp.kpis.currency : "";

  for (var i = 0; i < stages.length; i++) {
    var stageName = (stages[i].name || "").toLowerCase();
    // Skip closed stages
    if (stages[i].is_won || stages[i].is_lost || stageName === "won" || stageName === "lost" ||
        stageName === "closed won" || stageName === "closed lost") continue;
    var deals = stages[i].deals || [];
    for (var j = 0; j < deals.length; j++) {
      deals[j]._stageName = stages[i].name;
      allDeals.push(deals[j]);
    }
  }

  var now = new Date();
  var weekAhead = new Date();
  weekAhead.setDate(now.getDate() + 7);

  var atRisk = [];
  var closingSoon = [];

  for (var k = 0; k < allDeals.length; k++) {
    var d = allDeals[k];
    var closeDate = d.expected_close_at ? new Date(d.expected_close_at) : null;

    // At Risk: age >= 14 days OR past expected close
    if ((d.age_days && d.age_days >= 14) || (closeDate && closeDate < now)) {
      atRisk.push(d);
    }

    // Closing This Week: expected close within next 7 days
    if (closeDate && closeDate >= now && closeDate <= weekAhead) {
      closingSoon.push(d);
    }
  }

  // Sort by close date ascending
  _myDaySortByClose(atRisk);
  _myDaySortByClose(closingSoon);

  _myDayTileCount("myday-deals-risk", atRisk.length);
  _myDayTileCount("myday-deals-closing", closingSoon.length);

  _myDayRenderDealList("myday-deals-risk-body", atRisk, currency, "No deals at risk", "myday-deals-risk");
  _myDayRenderDealList("myday-deals-closing-body", closingSoon, currency, "Nothing closing this week", "myday-deals-closing");

  // Update sidebar badge for pipeline (At Risk count)
  if (typeof _updateSidebarBadge === "function") {
    _updateSidebarBadge("pipeline", atRisk.length);
  }
}

function _myDaySortByClose(list) {
  list.sort(function(a, b) {
    var ad = a.expected_close_at ? new Date(a.expected_close_at).getTime() : Infinity;
    var bd = b.expected_close_at ? new Date(b.expected_close_at).getTime() : Infinity;
    return ad - bd;
  });
}

function _myDayRenderDealList(targetId, list, currency, emptyMsg) {
  var el = document.getElementById(targetId);
  if (!el) return;

  if (!list.length) {
    el.innerHTML = '<div style="opacity:.7;padding:10px 8px">' + escapeHtml(emptyMsg) + '</div>';
    return;
  }

  var html = '<table class="aq-table"><tbody>';
  for (var i = 0; i < Math.min(list.length, 8); i++) {
    var d = list[i];
    var valStr = currency + " " + Number(d.value || 0).toLocaleString();
    var sub = escapeHtml(d.company_name || "");
    if (d._stageName) sub += (sub ? " \u00B7 " : "") + escapeHtml(d._stageName);
    if (d.age_days != null) sub += " \u00B7 " + d.age_days + "d";

    html += "<tr onclick=\"switchScreen('pipeline')\" style='cursor:pointer'>";
    html += "<td><div class='aq-co'>" + escapeHtml(d.title || "") + "</div>";
    html += "<div class='aq-detail'>" + sub + "</div></td>";
    html += "<td style='text-align:right'><div style='font-weight:600;white-space:nowrap'>" + escapeHtml(valStr) + "</div></td>";
    html += "</tr>";
  }
  html += "</tbody></table>";

  if (list.length > 8) {
    html += "<div style='opacity:.6;font-size:10px;padding:4px 8px'>+" + (list.length - 8) + " more</div>";
  }

  html += "<div style='display:flex;justify-content:flex-end;margin-top:10px'>";
  html += "<span class='aq-action' onclick=\"switchScreen('pipeline')\">Open Pipeline \u2192</span>";
  html += "</div>";

  el.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════
//  SIDEBAR BADGES + 60s POLLING (ES5)
// ══════════════════════════════════════════════════════════════

window.NOVATRAI = window.NOVATRAI || {};
window.NOVATRAI._badgeCounts = { approvals: 0, overdueTask: 0 };
window.NOVATRAI._badgeTimer = null;

function _updateSidebarBadge(screen, count) {
  var link = document.querySelector('.sidebar-item[data-screen="' + screen + '"]');
  if (!link) return;
  // Remove existing badge
  var old = link.querySelector(".sidebar-badge");
  if (old) old.remove();
  if (count > 0) {
    var badge = document.createElement("span");
    badge.className = "sidebar-badge";
    badge.textContent = count > 99 ? "99+" : String(count);
    link.appendChild(badge);
  }
}

function refreshBadgeCounts() {
  // Only poll when tab is visible
  if (document.hidden) return;

  novatraiApi("/approvals/my?decision=PENDING&limit=50", null, function(err, data) {
    if (err) return;
    var items = (typeof _myDayNormItems === "function") ? _myDayNormItems(data) : [];
    window.NOVATRAI._badgeCounts.approvals = items.length;
    _updateSidebarBadge("approvals", items.length);
  });

  novatraiApi("/tasks/my?status=OPEN&limit=80", null, function(err, data) {
    if (err) return;
    var items = (typeof _myDayNormItems === "function") ? _myDayNormItems(data) : [];
    var overdue = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].due_at && (typeof _myDayIsOverdue === "function") && _myDayIsOverdue(items[i].due_at)) overdue++;
    }
    window.NOVATRAI._badgeCounts.overdueTask = overdue;
    _updateSidebarBadge("tasks", overdue);
  });

  // Pipeline: At Risk badge (demo mode or live)
  _refreshPipelineBadge();
}

function _refreshPipelineBadge() {
  var demoOn = false;
  try { demoOn = localStorage.getItem("novatrai_demo_mode") === "1"; } catch(e) {}
  if (demoOn && window._PLB_DEMO_BOARD) {
    var riskCount = _countAtRiskFromBoard(window._PLB_DEMO_BOARD);
    _updateSidebarBadge("pipeline", riskCount);
    return;
  }
  novatraiApi("/pipelines", null, function(err, listResp) {
    if (err || !listResp) return;
    var items = (typeof _myDayNormItems === "function") ? _myDayNormItems(listResp) : [];
    if (!items.length) return;
    novatraiApi("/pipelines/" + items[0].id + "/board", null, function(err2, boardResp) {
      if (err2 || !boardResp) return;
      var riskCount = _countAtRiskFromBoard(boardResp);
      _updateSidebarBadge("pipeline", riskCount);
    });
  });
}

function _countAtRiskFromBoard(boardResp) {
  var stages = boardResp.stages || boardResp.columns || [];
  var now = new Date();
  var count = 0;
  for (var i = 0; i < stages.length; i++) {
    var sn = (stages[i].name || "").toLowerCase();
    if (stages[i].is_won || stages[i].is_lost || sn === "won" || sn === "lost" ||
        sn === "closed won" || sn === "closed lost") continue;
    var deals = stages[i].deals || [];
    for (var j = 0; j < deals.length; j++) {
      var d = deals[j];
      var closeDate = d.expected_close_at ? new Date(d.expected_close_at) : null;
      if ((d.age_days && d.age_days >= 14) || (closeDate && closeDate < now)) count++;
    }
  }
  return count;
}

// Start polling after a short delay (let the app boot first)
(function() {
  setTimeout(function() {
    refreshBadgeCounts();
    // Poll every 60s
    window.NOVATRAI._badgeTimer = setInterval(refreshBadgeCounts, 60000);
  }, 3000);
})()

/* ═══════════════════════════════════════════════════════════════
 *  Command Bar (Ctrl+K) — ES5
 * ═══════════════════════════════════════════════════════════════ */

window.NOVATRAI = window.NOVATRAI || {};
window.NOVATRAI.cmdk = window.NOVATRAI.cmdk || {
  open: false,
  term: "",
  items: [],
  activeIndex: 0,
  reqId: 0,
  timer: null
};

function cmdkIsOpen() {
  var m = document.getElementById("cmdk-modal");
  return !!(m && (m.className || "").indexOf("open") !== -1);
}

function cmdkOpen() {
  var m = document.getElementById("cmdk-modal");
  if (!m) return;
  m.className = "modal open";
  window.NOVATRAI.cmdk.open = true;
  window.NOVATRAI.cmdk.activeIndex = 0;

  var input = document.getElementById("cmdk-input");
  if (input) {
    input.value = "";
    setTimeout(function(){ input.focus(); }, 0);
  }
  cmdkRender([]);
}

function cmdkClose() {
  var m = document.getElementById("cmdk-modal");
  if (m) m.className = "modal";
  window.NOVATRAI.cmdk.open = false;
}

// ── Debounced input + search ─────────────────────────────────
function cmdkOnInput() {
  var input = document.getElementById("cmdk-input");
  var term = input ? (input.value || "").trim() : "";
  window.NOVATRAI.cmdk.term = term;

  if (window.NOVATRAI.cmdk.timer) clearTimeout(window.NOVATRAI.cmdk.timer);
  window.NOVATRAI.cmdk.timer = setTimeout(function(){
    cmdkSearch(term);
  }, 180);
}

function cmdkSearch(term) {
  window.NOVATRAI.cmdk.reqId += 1;
  var thisReq = window.NOVATRAI.cmdk.reqId;

  if (!term) {
    window.NOVATRAI.cmdk.items = [];
    window.NOVATRAI.cmdk.activeIndex = 0;
    cmdkRender([]);
    return;
  }

  var res = document.getElementById("cmdk-results");
  if (res) res.innerHTML = '<div class="cmdk-empty">Searching\u2026</div>';

  novatraiApi("/cases/my?limit=8&q=" + encodeURIComponent(term), null, function(err, data){
    if (window.NOVATRAI.cmdk.reqId !== thisReq) return;

    if (err) {
      if (res) res.innerHTML = '<div class="cmdk-empty">Search failed: ' + escapeHtml(err.message) + "</div>";
      window.NOVATRAI.cmdk.items = [];
      return;
    }

    var items = [];
    if (data && data.items && data.items.length != null) items = data.items;
    else if (data && data.data && data.data.items && data.data.items.length != null) items = data.data.items;
    else if (data && data.length != null) items = data;

    window.NOVATRAI.cmdk.items = items;
    window.NOVATRAI.cmdk.activeIndex = 0;
    cmdkRender(items);
  });
}

// ── Render results ───────────────────────────────────────────
function cmdkRender(items) {
  var res = document.getElementById("cmdk-results");
  if (!res) return;

  var term = (window.NOVATRAI.cmdk.term || "").trim();
  res.innerHTML = "";

  if (!term) {
    res.innerHTML = '<div class="cmdk-empty">Type to search cases.</div>';
    return;
  }

  if (!items || !items.length) {
    res.innerHTML =
      '<div class="cmdk-row active" onclick="cmdkCreateCaseFromTerm()">' +
        '<div class="cmdk-main">' +
          '<div class="cmdk-title">Create case: ' + escapeHtml(term) + '</div>' +
          '<div class="cmdk-sub">No matching cases found</div>' +
        '</div>' +
        '<span class="aq-action">Enter \u2192</span>' +
      '</div>';
    window.NOVATRAI.cmdk.activeIndex = 0;
    return;
  }

  for (var i = 0; i < items.length; i++) {
    var c = items[i];
    var pri = _casesPriorityBadge(c.priority);
    var stCls = _casesStatusClass(c.status);
    var stLbl = _casesStatusLabel(c.status);

    var row = document.createElement("div");
    row.className = "cmdk-row" + (i === window.NOVATRAI.cmdk.activeIndex ? " active" : "");
    row.onclick = (function(id){ return function(){ cmdkSelectCase(id); }; })(c.id);

    row.innerHTML =
      '<span class="aq-badge ' + pri.cls + '">' + escapeHtml(pri.text) + '</span>' +
      '<div class="cmdk-main">' +
        '<div class="cmdk-title">' + escapeHtml(c.case_number || "") + ' \u00B7 ' + escapeHtml(c.title || "") + '</div>' +
        '<div class="cmdk-sub">' + escapeHtml(c.description || "") + '</div>' +
      '</div>' +
      '<span class="mc-status ' + stCls + '">' + escapeHtml(stLbl) + '</span>';

    res.appendChild(row);
  }
}

function cmdkSelectCase(id) {
  cmdkClose();
  if (typeof openCase === "function") openCase(id);
}

function cmdkCreateCaseFromTerm() {
  var term = (window.NOVATRAI.cmdk.term || "").trim();
  cmdkClose();

  if (typeof casesOpenNewModal === "function") casesOpenNewModal();

  var t = document.getElementById("case-new-title");
  if (t) t.value = term;
}

// ── Keyboard navigation inside cmdk ──────────────────────────
function cmdkMove(delta) {
  var items = window.NOVATRAI.cmdk.items || [];

  if (!items.length) {
    window.NOVATRAI.cmdk.activeIndex = 0;
    cmdkRender([]);
    return;
  }

  var idx = window.NOVATRAI.cmdk.activeIndex + delta;
  if (idx < 0) idx = 0;
  if (idx > items.length - 1) idx = items.length - 1;
  window.NOVATRAI.cmdk.activeIndex = idx;
  cmdkRender(items);
}

function cmdkEnter() {
  var items = window.NOVATRAI.cmdk.items || [];
  var term = (window.NOVATRAI.cmdk.term || "").trim();

  if (!term) return;

  if (!items.length) {
    cmdkCreateCaseFromTerm();
    return;
  }

  var idx = window.NOVATRAI.cmdk.activeIndex || 0;
  var c = items[idx];
  if (c && c.id) cmdkSelectCase(c.id);
}

/* ═══════════════════════════════════════════════════════════════
 *  Global Keyboard Shortcuts (ES5)
 * ═══════════════════════════════════════════════════════════════ */

function _isTypingTarget(e) {
  var t = e.target || e.srcElement;
  if (!t) return false;
  var tag = (t.tagName || "").toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (t.isContentEditable) return true;
  return false;
}

function _isModalOpen() {
  var m = document.getElementById("case-new-modal");
  return !!(m && (m.className || "").indexOf("open") !== -1);
}

function _isCaseOverlayOpen() {
  var o = document.getElementById("case-detail-overlay");
  if (!o) return false;
  var cls = o.className || "";
  if (cls.indexOf("open") !== -1) return true;
  if (o.style && o.style.display && o.style.display !== "none") return true;
  var panel = document.getElementById("case-detail-panel");
  if (panel && panel.offsetWidth > 0 && panel.offsetHeight > 0) return true;
  return false;
}

function _isScreenActive(name) {
  var el = document.getElementById("screen-" + name);
  return !!(el && (el.className || "").indexOf("active") !== -1);
}

document.addEventListener("keydown", function (e) {
  e = e || window.event;

  // Ctrl+K / Cmd+K toggles command bar
  if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K" || e.keyCode === 75)) {
    if (cmdkIsOpen()) cmdkClose();
    else cmdkOpen();
    e.preventDefault();
    return;
  }

  // Command bar arrow/enter navigation
  if (cmdkIsOpen()) {
    if (e.keyCode === 38) { cmdkMove(-1); e.preventDefault(); return; }
    if (e.keyCode === 40) { cmdkMove(1);  e.preventDefault(); return; }
    if (e.keyCode === 13) { cmdkEnter();  e.preventDefault(); return; }
  }

  // ESC closes command bar, overlay or modal (priority: cmdk > modal > overlay)
  if (e.key === "Escape" || e.keyCode === 27) {
    if (cmdkIsOpen()) {
      cmdkClose();
      return;
    }
    if (_isModalOpen()) {
      if (typeof casesCloseNewModal === "function") casesCloseNewModal();
      return;
    }
    if (_isCaseOverlayOpen()) {
      if (typeof csdClose === "function") csdClose();
      return;
    }
    return;
  }

  var typing = _isTypingTarget(e);

  // Ctrl+Enter submits note (only if note input focused)
  if ((e.ctrlKey || e.metaKey) && (e.key === "Enter" || e.keyCode === 13)) {
    var t = e.target || e.srcElement;
    if (t && t.id === "csd-note-input") {
      if (typeof csdAddNote === "function") csdAddNote();
      e.preventDefault();
    }
    return;
  }

  if (typing) return;

  // N opens New Case modal (only when not in overlay or modal)
  if ((e.key === "n" || e.key === "N" || e.keyCode === 78) && !_isCaseOverlayOpen() && !_isModalOpen()) {
    if (typeof casesOpenNewModal === "function") casesOpenNewModal();
    e.preventDefault();
    return;
  }

  // / focuses case search (only on cases screen)
  if (e.key === "/" || e.keyCode === 191) {
    if (_isScreenActive("cases")) {
      var search = document.getElementById("cases-search");
      if (search) {
        search.focus();
        e.preventDefault();
      }
    }
    return;
  }
});

/* ═══════════════════════════════════════════════════════════════
 *  LIFECYCLE BANNER SYSTEM  (shared across surfaces)
 * ═══════════════════════════════════════════════════════════════ */

// ── Core helper: update step track ──────────────────────────
function _osSetLifecycleSteps(containerId, currentStep) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var steps = container.querySelectorAll(".os-life-step");
  var found = false;
  for (var i = 0; i < steps.length; i++) {
    var s = steps[i];
    var stepVal = s.getAttribute("data-step");
    s.classList.remove("done", "active");
    if (stepVal === currentStep) {
      s.classList.add("active");
      found = true;
    } else if (!found) {
      s.classList.add("done");
    }
  }
}

// ── Core helper: update pill ─────────────────────────────────
function _osSetPill(pillId, label, cssClass) {
  var el = document.getElementById(pillId);
  if (!el) return;
  el.textContent = label;
  el.className = "os-pill " + (cssClass || "");
}

// ── Case lifecycle banner ────────────────────────────────────
function _osUpdateCaseBanner(status) {
  var banner = document.getElementById("csd-lifecycle-banner");
  if (!banner) return;
  banner.style.display = "flex";

  var st = (status || "OPEN").toUpperCase();
  var map = {
    "OPEN": { label: "Open", cls: "st-open", step: "OPEN" },
    "IN_PROGRESS": { label: "In Progress", cls: "st-in-progress", step: "IN_PROGRESS" },
    "WAITING": { label: "Waiting", cls: "st-waiting", step: "WAITING" },
    "CLOSED": { label: "Closed", cls: "st-closed", step: "CLOSED" },
    "CANCELLED": { label: "Cancelled", cls: "st-cancelled", step: "CLOSED" }
  };
  var m = map[st] || map["OPEN"];

  _osSetPill("csd-os-pill", m.label, m.cls);
  _osSetLifecycleSteps("csd-os-life", m.step);

  // Next action slot
  var nextEl = document.getElementById("csd-os-next-action");
  if (nextEl) {
    if (st === "CLOSED" || st === "CANCELLED") {
      nextEl.innerHTML = "";
    } else {
      var nextMap = {
        "OPEN": { label: "Start Work", action: "IN_PROGRESS" },
        "IN_PROGRESS": { label: "Set Waiting", action: "WAITING" },
        "WAITING": { label: "Resume Work", action: "IN_PROGRESS" }
      };
      var n = nextMap[st];
      if (n) {
        nextEl.innerHTML = '<button class="os-next-btn" onclick="_osCaseAdvance(\'' + n.action + '\')">' +
          n.label + ' <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>';
      }
    }
  }
}

function _osCaseAdvance(newStatus) {
  var activeId = window.NOVATRAI && window.NOVATRAI.caseDetail && window.NOVATRAI.caseDetail.activeId;
  if (!activeId) return;
  novatraiApi("/cases/" + encodeURIComponent(activeId) + "/transition", {
    method: "POST",
    body: { action: newStatus }
  }, function(err) {
    if (err) {
      if (window.showToast) window.showToast("Transition failed");
      return;
    }
    if (window.showToast) window.showToast("Status → " + newStatus.replace(/_/g, " "));
    csdRefreshOverview(activeId);
  });
}

// ── Deal lifecycle banner ────────────────────────────────────
var _dealStageOrder = ["Prospect", "Proposal Sent", "Qualified", "Negotiating", "Won", "Lost"];
var _dealStageMap = {
  "Prospect":      { cls: "st-prospect",    step: "Prospect" },
  "Proposal Sent": { cls: "st-proposal",    step: "Proposal Sent" },
  "Qualified":     { cls: "st-qualified",    step: "Qualified" },
  "Negotiating":   { cls: "st-negotiating",  step: "Negotiating" },
  "Won":           { cls: "st-won",          step: "Won" },
  "Lost":          { cls: "st-lost",         step: "Lost" }
};

function _osUpdateDealBanner(stage) {
  var banner = document.getElementById("dm-lifecycle-banner");
  if (!banner) return;

  var m = _dealStageMap[stage] || _dealStageMap["Prospect"];
  _osSetPill("dm-os-pill", stage || "Prospect", m.cls);
  _osSetLifecycleSteps("dm-os-life", m.step);

  // Next action
  var nextEl = document.getElementById("dm-os-next-action");
  if (nextEl) {
    var idx = _dealStageOrder.indexOf(stage);
    // Won/Lost are terminal
    if (stage === "Won" || stage === "Lost") {
      nextEl.innerHTML = "";
    } else if (idx >= 0 && idx < 3) {
      // Advance to next stage (not past Negotiating)
      var nextStage = _dealStageOrder[idx + 1];
      nextEl.innerHTML = '<button class="os-next-btn" onclick="_osDealAdvance(\'' + nextStage + '\')">' +
        'Move to ' + nextStage.replace(" Sent", "") +
        ' <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>';
    } else if (stage === "Negotiating") {
      nextEl.innerHTML = '<button class="os-next-btn" onclick="_osDealAdvance(\'Won\')" style="color:var(--success);border-color:rgba(61,214,140,.2);background:rgba(61,214,140,.06)">' +
        'Mark Won <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></button>';
    }
  }
}

function _osDealAdvance(stage) {
  var sel = document.getElementById("dm-stage");
  if (sel) {
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text === stage) { sel.selectedIndex = i; break; }
    }
  }
  _osUpdateDealBanner(stage);
}

// ── PLB (pipeline board) deal overlay banner ─────────────────
function _osUpdatePlbDealBanner(stageName) {
  var banner = document.getElementById("plb-lifecycle-banner");
  if (!banner) return;

  // Map backend stage names to display names
  var stageMap = {
    "Prospect": "Prospect", "prospect": "Prospect",
    "Proposal Sent": "Proposal Sent", "proposal_sent": "Proposal Sent", "proposal sent": "Proposal Sent",
    "Qualified": "Qualified", "qualified": "Qualified",
    "Negotiating": "Negotiating", "negotiating": "Negotiating", "negotiation": "Negotiating",
    "Won": "Won", "won": "Won", "Closed Won": "Won", "closed won": "Won", "closed_won": "Won",
    "Lost": "Lost", "lost": "Lost", "Closed Lost": "Lost", "closed lost": "Lost", "closed_lost": "Lost"
  };
  var stage = stageMap[stageName] || "Prospect";
  var m = _dealStageMap[stage] || _dealStageMap["Prospect"];

  _osSetPill("plb-os-pill", stage, m.cls);
  _osSetLifecycleSteps("plb-os-life", m.step);

  // Next action slot — PLB uses plbMoveDeal
  var nextEl = document.getElementById("plb-os-next-action");
  if (nextEl) {
    if (stage === "Won" || stage === "Lost") {
      nextEl.innerHTML = "";
    } else {
      var idx = _dealStageOrder.indexOf(stage);
      if (idx >= 0 && idx < 3) {
        var nextStage = _dealStageOrder[idx + 1];
        nextEl.innerHTML = '<button class="os-next-btn" onclick="_osPlbAdvance(\'' + nextStage + '\')">' +
          'Move to ' + nextStage.replace(" Sent", "") +
          ' <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>';
      } else if (stage === "Negotiating") {
        nextEl.innerHTML = '<button class="os-next-btn" onclick="_osPlbAdvance(\'Won\')" style="color:var(--success);border-color:rgba(61,214,140,.2);background:rgba(61,214,140,.06)">' +
          'Mark Won <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></button>';
      }
    }
  }
}

function _osPlbAdvance(targetStage) {
  // Advance the PLB deal using the existing plbMoveDeal function
  if (typeof plbMoveDeal === "function" && window._plb && window._plb.currentDeal) {
    // Find target stage ID
    var stages = window._plb.stages || [];
    for (var i = 0; i < stages.length; i++) {
      if (stages[i].name === targetStage || stages[i].label === targetStage) {
        plbMoveDeal(window._plb.currentDeal.id, stages[i].id);
        _osUpdatePlbDealBanner(targetStage);
        return;
      }
    }
  }
  // Fallback: just update the banner visually
  _osUpdatePlbDealBanner(targetStage);
  if (window.showToast) window.showToast("Stage → " + targetStage);
}

// ── Approval lifecycle: inline HTML builder ──────────────────
function _osApprovalLifeHtml(decision) {
  var d = (decision || "PENDING").toUpperCase();
  var pillCls = d === "APPROVED" ? "st-approved" : d === "REJECTED" ? "st-rejected" : "st-pending";

  var html = '<span class="os-banner-inline">' +
    '<span class="os-pill ' + pillCls + '">' + d + '</span>' +
    '<span class="os-life">' +
      '<span class="os-life-step ' + (d === "PENDING" ? "active" : "done") + '" data-step="PENDING">Pending</span>' +
      '<span class="os-life-step ' + (d === "APPROVED" ? "active" : d === "REJECTED" ? "" : "") + ' endpoint" data-step="APPROVED">Approved</span>' +
      '<span class="os-life-step ' + (d === "REJECTED" ? "active" : "") + ' endpoint" data-step="REJECTED">Rejected</span>' +
    '</span></span>';
  return html;
}

// ── Task lifecycle: inline HTML builder ──────────────────────
function _osTaskLifeHtml(status) {
  var st = (status || "OPEN").toUpperCase();
  var isComplete = st === "COMPLETED";
  var pillCls = isComplete ? "st-completed" : "st-open";
  var label = isComplete ? "Completed" : "Open";

  return '<span class="os-banner-inline">' +
    '<span class="os-pill ' + pillCls + '">' + label + '</span>' +
    '<span class="os-life">' +
      '<span class="os-life-step ' + (isComplete ? "done" : "active") + '" data-step="OPEN">Open</span>' +
      '<span class="os-life-step ' + (isComplete ? "active" : "") + ' endpoint" data-step="COMPLETED">Completed</span>' +
    '</span></span>';
}

// ── Invoice lifecycle: inline HTML builder ───────────────────
function _osInvoiceLifeHtml(status) {
  var st = (status || "draft").toLowerCase();
  var map = {
    "draft":   { label: "Draft",   cls: "st-draft",   step: "DRAFT" },
    "sent":    { label: "Sent",    cls: "st-sent",    step: "SENT" },
    "paid":    { label: "Paid",    cls: "st-paid",    step: "PAID" },
    "overdue": { label: "Overdue", cls: "st-overdue", step: "SENT" },
    "partial": { label: "Partial", cls: "st-partial", step: "SENT" }
  };
  var m = map[st] || map["draft"];
  var steps = ["DRAFT", "SENT", "PAID"];
  var html = '<span class="os-banner-inline">';
  html += '<span class="os-life">';
  var found = false;
  for (var i = 0; i < steps.length; i++) {
    var cls = "";
    if (steps[i] === m.step) { cls = "active"; found = true; }
    else if (!found) { cls = "done"; }
    html += '<span class="os-life-step ' + cls + '" data-step="' + steps[i] + '">' + steps[i].charAt(0) + steps[i].slice(1).toLowerCase() + '</span>';
  }
  html += '</span></span>';
  return html;
}

console.log("Novatrai: api-wire.js loaded");
