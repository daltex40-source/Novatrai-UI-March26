/* ═══════════════════════════════════════════════════════════════
 *  Pipeline Board — Live API-Driven Kanban
 *  Fetches /pipelines → /pipelines/:id/board
 *  Drag-drop with POST /deals/:id/move + optimistic revert
 *  Deal overlay with Mark Won / Mark Lost actions
 * ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ── State ─────────────────────────────────────────────────
  var _plb = {
    pipelineId: null,
    board: null,          // raw board response
    stages: [],           // sorted by order
    deals: [],            // flat deal list from all stages
    filteredDeals: null,   // null = show all
    ownerFilter: "",       // "" = all owners
    showClosed: false,
    searchQuery: "",
    dragging: null,        // deal id being dragged
    currentDeal: null,     // deal in overlay
  };

  // ── Helpers ───────────────────────────────────────────────
  function fmtCurrency(value, currency) {
    if (value == null) return "—";
    currency = currency || "";
    var n = Number(value);
    if (isNaN(n)) return String(value);
    if (n >= 1000000) return currency + (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return currency + (n / 1000).toFixed(0) + "K";
    return currency + n.toFixed(0);
  }

  function isAtRisk(deal) {
    if (!deal) return false;
    if (deal.age_days >= 14) return true;
    if (deal.expected_close_at) {
      var d = new Date(deal.expected_close_at);
      if (d < new Date()) return true;
    }
    return false;
  }

  function initials(name) {
    if (!name) return "?";
    var parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0][0] + (parts[0][1] || "")).toUpperCase();
  }

  function escHtml(s) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(s || ""));
    return d.innerHTML;
  }

  // ── Demo mode check ────────────────────────────────────────
  function _plbDemoActive() {
    try { return localStorage.getItem("novatrai_demo_mode") === "1"; } catch(e) { return false; }
  }

  // ── Bootstrap: hook into switchScreen ─────────────────────
  var _origSwitch = window.switchScreen;
  window.switchScreen = function (name) {
    if (typeof _origSwitch === "function") _origSwitch(name);
    if (name === "pipeline") plbLoad();
  };

  // ── Load pipeline board ───────────────────────────────────
  function plbLoad() {
    var container = document.getElementById("plb-root");
    if (!container) return;

    // If demo mode is active, use synthetic data immediately
    if (_plbDemoActive() && window._PLB_DEMO_BOARD) {
      plbHydrateBoard(window._PLB_DEMO_BOARD);
      return;
    }

    container.innerHTML = '<div class="plb-loading">Loading pipeline\u2026</div>';

    novatraiApi("/pipelines", function (err, data) {
      if (err || !data) {
        plbFallback();
        return;
      }
      // data can be array or { items: [...] }
      var pipelines = Array.isArray(data) ? data : (data.items || data.pipelines || []);
      if (!pipelines.length) { plbFallback(); return; }

      _plb.pipelineId = pipelines[0].id;
      plbFetchBoard();
    });
  }

  function plbFetchBoard() {
    if (!_plb.pipelineId) return;

    novatraiApi("/pipelines/" + _plb.pipelineId + "/board", function (err, data) {
      if (err || !data) { plbFallback(); return; }
      plbHydrateBoard(data);
    });
  }

  // ── Hydrate from any board payload (API or demo) ──────────
  function plbHydrateBoard(data) {
    _plb.board = data;

    // Normalize stages
    var stages = data.stages || data.columns || [];
    // Deep-copy so demo data isn't mutated across toggles
    stages = JSON.parse(JSON.stringify(stages));
    stages.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    _plb.stages = stages;

    // Flatten deals
    _plb.deals = [];
    stages.forEach(function (stage) {
      (stage.deals || []).forEach(function (deal) {
        deal._stageId = stage.id;
        deal._stageName = stage.name;
        _plb.deals.push(deal);
      });
    });

    plbRender();
  }

  // ── Onboarding empty state (ghost board + tooltip) ────────
  var PLB_ONBOARD_KEY = "novatrai_plb_onboard_dismissed";

  function _plbOnboardDismissed() {
    try { return localStorage.getItem(PLB_ONBOARD_KEY) === "1"; } catch(e) { return false; }
  }

  function plbFallback() {
    var container = document.getElementById("plb-root");
    if (!container) return;

    // Hide old static board
    var oldBoard = document.getElementById("pipeline-board");
    if (oldBoard) oldBoard.style.display = "none";
    var oldSummary = document.querySelector("#screen-pipeline .pipeline-summary");
    if (oldSummary) oldSummary.style.display = "none";

    var showTooltip = !_plbOnboardDismissed();

    // Ghost stage data for preview
    var ghostStages = [
      { name: "Prospect",   color: "#5A7080", cards: 3 },
      { name: "Qualified",  color: "#4A8FFF", cards: 2 },
      { name: "Proposal",   color: "#9B87F5", cards: 2 },
      { name: "Negotiating", color: "#F0A843", cards: 1 },
      { name: "Won",        color: "#3DD68C", cards: 1 },
    ];

    var html = '<div class="plb-onboard">';

    // ── Tooltip overlay card (only if not dismissed) ─────
    if (showTooltip) {
      html += '<div class="plb-onboard-tooltip" id="plb-onboard-tooltip">';
      html += '<button class="plb-onboard-close" id="plb-onboard-close" title="Dismiss">&times;</button>';
      html += '<div class="plb-onboard-icon">'
        + '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="32" height="32">'
        + '<path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"/>'
        + '</svg></div>';
      html += '<h3 class="plb-onboard-title">Your Pipeline Board</h3>';
      html += '<p class="plb-onboard-desc">'
        + 'Track every deal from first contact to close. '
        + 'Drag cards between stages, spot at-risk deals early, '
        + 'and keep your pipeline moving.'
        + '</p>';
      html += '<ul class="plb-onboard-features">';
      html += '<li><span class="plb-onboard-bullet">&#10003;</span> Visual Kanban columns for each sales stage</li>';
      html += '<li><span class="plb-onboard-bullet">&#10003;</span> Drag &amp; drop deals to update their progress</li>';
      html += '<li><span class="plb-onboard-bullet">&#10003;</span> At-risk alerts for stale or overdue deals</li>';
      html += '<li><span class="plb-onboard-bullet">&#10003;</span> KPI summary with pipeline value &amp; win rate</li>';
      html += '</ul>';
      html += '<button class="plb-onboard-got-it" id="plb-onboard-got-it">Got it</button>';
      html += '</div>';
    } else {
      // Dismissed: show a compact empty-state banner instead
      html += '<div class="plb-onboard-banner">';
      html += '<span>No pipeline data available.</span> ';
      html += '<span class="plb-onboard-banner-link" id="plb-onboard-show-again">What is this?</span>';
      html += '</div>';
    }

    // ── Ghost board preview (faded, non-interactive) ──────
    html += '<div class="plb-ghost-board">';

    // Ghost KPI strip
    html += '<div class="plb-ghost-kpis">';
    var ghostKpis = [
      { label: "Pipeline Value", val: "R 876K" },
      { label: "Open Deals",    val: "9" },
      { label: "Avg Deal",      val: "R 97K" },
      { label: "Win Rate",      val: "38%" },
    ];
    ghostKpis.forEach(function (kpi) {
      html += '<div class="plb-ghost-kpi">'
        + '<span class="plb-ghost-kpi-label">' + kpi.label + '</span>'
        + '<span class="plb-ghost-kpi-val">' + kpi.val + '</span>'
        + '</div>';
    });
    html += '</div>';

    // Ghost columns
    html += '<div class="plb-ghost-cols">';
    ghostStages.forEach(function (stage) {
      html += '<div class="plb-ghost-col">';
      html += '<div class="plb-ghost-col-header" style="border-color:' + stage.color + '">';
      html += '<span>' + stage.name + '</span>';
      html += '<span class="plb-ghost-count">' + stage.cards + '</span>';
      html += '</div>';
      for (var i = 0; i < stage.cards; i++) {
        html += '<div class="plb-ghost-card">';
        html += '<div class="plb-ghost-card-row"><div class="plb-ghost-bar w60"></div></div>';
        html += '<div class="plb-ghost-card-row"><div class="plb-ghost-bar w40 light"></div></div>';
        html += '<div class="plb-ghost-card-row"><div class="plb-ghost-bar w50 accent"></div></div>';
        html += '<div class="plb-ghost-card-row"><div class="plb-ghost-bar w30 light"></div><div class="plb-ghost-bar w20 light"></div></div>';
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>'; // /ghost-cols

    html += '</div>'; // /ghost-board
    html += '</div>'; // /plb-onboard

    container.innerHTML = html;

    // ── Bind dismiss actions ──────────────────────────────
    var closeBtn = document.getElementById("plb-onboard-close");
    var gotItBtn = document.getElementById("plb-onboard-got-it");
    var showAgainLink = document.getElementById("plb-onboard-show-again");

    function dismissOnboard() {
      try { localStorage.setItem(PLB_ONBOARD_KEY, "1"); } catch(e) {}
      plbFallback(); // re-render without tooltip
    }

    if (closeBtn) closeBtn.onclick = dismissOnboard;
    if (gotItBtn) gotItBtn.onclick = dismissOnboard;

    if (showAgainLink) {
      showAgainLink.onclick = function () {
        try { localStorage.removeItem(PLB_ONBOARD_KEY); } catch(e) {}
        plbFallback(); // re-render with tooltip
      };
    }
  }

  // ── Cleanup: revert to static board (called by demo toggle off) ─
  function plbCleanup() {
    var container = document.getElementById("plb-root");
    if (container) container.innerHTML = "";
    _plb.board = null;
    _plb.stages = [];
    _plb.deals = [];
    // Show static board again
    var oldBoard = document.getElementById("pipeline-board");
    if (oldBoard) oldBoard.style.display = "";
    var oldSummary = document.querySelector("#screen-pipeline .pipeline-summary");
    if (oldSummary) oldSummary.style.display = "";
  }

  // ── Full render ───────────────────────────────────────────
  function plbRender() {
    var container = document.getElementById("plb-root");
    if (!container) return;

    // Hide old static board
    var oldBoard = document.getElementById("pipeline-board");
    if (oldBoard) oldBoard.style.display = "none";
    var oldSummary = document.querySelector("#screen-pipeline .pipeline-summary");
    if (oldSummary) oldSummary.style.display = "none";

    var kpis = _plb.board.kpis || _plb.board.summary || {};
    var html = "";

    // ── KPI Strip ──────────────────────────────────────────
    html += '<div class="plb-kpi-strip">';
    html += plbKpiBox("Pipeline Value", fmtCurrency(kpis.pipeline_value, kpis.currency || ""), "");
    html += plbKpiBox("Open Deals", kpis.open_count != null ? kpis.open_count : "—", "");
    html += plbKpiBox("Avg Deal", fmtCurrency(kpis.avg_deal, kpis.currency || ""), "");
    html += plbKpiBox("Win Rate", kpis.win_rate != null ? (kpis.win_rate * 100).toFixed(0) + "%" : "—", "green");
    html += plbKpiBox("At Risk", plbCountAtRisk(), "danger");
    html += '<div class="plb-kpi-actions">' + plbFilterBar() + '</div>';
    html += '</div>';

    // ── Board columns ─────────────────────────────────────
    html += '<div class="plb-board" id="plb-board">';
    _plb.stages.forEach(function (stage) {
      html += plbRenderColumn(stage);
    });
    html += '</div>';

    container.innerHTML = html;

    // Attach event listeners for filters
    plbBindFilters();
  }

  function plbKpiBox(label, value, cls) {
    return '<div class="pipeline-kpi">'
      + '<span class="pipeline-kpi-label">' + escHtml(label) + '</span>'
      + '<span class="pipeline-kpi-val' + (cls ? ' ' + cls : '') + '">' + escHtml(String(value)) + '</span>'
      + '</div>';
  }

  function plbCountAtRisk() {
    var c = 0;
    _plb.deals.forEach(function (d) { if (isAtRisk(d)) c++; });
    return c;
  }

  // ── Filter bar ────────────────────────────────────────────
  function plbFilterBar() {
    // Build unique owners from deals
    var owners = {};
    _plb.deals.forEach(function (d) {
      if (d.owner_name) owners[d.owner_name] = true;
    });
    var ownerList = Object.keys(owners).sort();

    var html = '<select class="plb-filter-select" id="plb-owner-filter">';
    html += '<option value="">All Owners</option>';
    ownerList.forEach(function (o) {
      html += '<option value="' + escHtml(o) + '">' + escHtml(o) + '</option>';
    });
    html += '</select>';

    html += '<label class="plb-toggle-label">'
      + '<input type="checkbox" id="plb-show-closed" ' + (_plb.showClosed ? 'checked' : '') + '>'
      + '<span class="plb-toggle-text">Show Closed</span></label>';

    html += '<div class="plb-search-wrap">'
      + '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/></svg>'
      + '<input class="plb-search" id="plb-search" type="text" placeholder="Search deals\u2026" value="' + escHtml(_plb.searchQuery) + '">'
      + '</div>';

    return html;
  }

  function plbBindFilters() {
    var ownerSel = document.getElementById("plb-owner-filter");
    if (ownerSel) ownerSel.onchange = function () {
      _plb.ownerFilter = ownerSel.value;
      plbRenderColumns();
    };

    var closedCb = document.getElementById("plb-show-closed");
    if (closedCb) closedCb.onchange = function () {
      _plb.showClosed = closedCb.checked;
      plbRenderColumns();
    };

    var searchEl = document.getElementById("plb-search");
    if (searchEl) searchEl.oninput = function () {
      _plb.searchQuery = searchEl.value.toLowerCase().trim();
      plbRenderColumns();
    };
  }

  // ── Re-render just the board columns (for filter changes) ─
  function plbRenderColumns() {
    var board = document.getElementById("plb-board");
    if (!board) return;
    var html = "";
    _plb.stages.forEach(function (stage) {
      html += plbRenderColumn(stage);
    });
    board.innerHTML = html;

    // Update at-risk count in KPI
    var riskEl = document.querySelector(".plb-kpi-strip .pipeline-kpi:last-of-type .pipeline-kpi-val");
    if (riskEl) riskEl.textContent = plbCountAtRisk();
  }

  // ── Filter deals for a stage ──────────────────────────────
  function plbStageDeals(stage) {
    var deals = (stage.deals || []).slice();

    // Owner filter
    if (_plb.ownerFilter) {
      deals = deals.filter(function (d) { return d.owner_name === _plb.ownerFilter; });
    }

    // Show-closed toggle: hide Won/Lost stages unless toggled
    if (!_plb.showClosed) {
      var name = (stage.name || "").toLowerCase();
      if (name === "won" || name === "lost" || name === "closed won" || name === "closed lost") {
        return []; // entire column hidden
      }
    }

    // Search filter
    if (_plb.searchQuery) {
      deals = deals.filter(function (d) {
        var blob = ((d.title || "") + " " + (d.company_name || "") + " " + (d.owner_name || "")).toLowerCase();
        return blob.indexOf(_plb.searchQuery) !== -1;
      });
    }

    return deals;
  }

  // ── Render a single column ────────────────────────────────
  function plbRenderColumn(stage) {
    var deals = plbStageDeals(stage);
    var totals = stage.totals || {};

    // Compute filtered totals
    var filteredCount = deals.length;
    var filteredValue = 0;
    deals.forEach(function (d) { filteredValue += (Number(d.value) || 0); });

    var stageName = escHtml(stage.name || "");
    var stageSlug = (stage.name || "").toLowerCase().replace(/\s+/g, "-");

    var html = '<div class="pl-col" data-stage="' + escHtml(stage.id) + '" data-stage-slug="' + stageSlug + '">';

    // Column header
    html += '<div class="pl-col-header">';
    html += '<span class="pl-col-title">' + stageName + '</span>';
    html += '<span class="pl-col-count">' + filteredCount + '</span>';
    html += '<span class="pl-col-total">' + fmtCurrency(filteredValue, _plb.board.kpis ? (_plb.board.kpis.currency || "") : "") + '</span>';
    html += '</div>';

    // Drop zone
    html += '<div class="pl-drop-zone" id="plb-zone-' + stage.id + '"'
      + ' ondragover="plbDragOver(event,\'' + stage.id + '\')"'
      + ' ondragleave="plbDragLeave(event)"'
      + ' ondrop="plbDrop(event,\'' + stage.id + '\')">';

    deals.forEach(function (deal) {
      html += plbRenderCard(deal);
    });

    html += '</div>'; // /drop-zone
    html += '</div>'; // /pl-col
    return html;
  }

  // ── Render a single deal card ─────────────────────────────
  function plbRenderCard(deal) {
    var atRisk = isAtRisk(deal);
    var curr = _plb.board.kpis ? (_plb.board.kpis.currency || "") : "";

    var html = '<div class="pl-card' + (atRisk ? ' pl-card-at-risk' : '') + '"'
      + ' id="plb-deal-' + deal.id + '"'
      + ' draggable="true"'
      + ' ondragstart="plbDragStart(event,\'' + deal.id + '\')"'
      + ' ondragend="plbDragEnd(event)"'
      + ' onclick="plbOpenDeal(\'' + deal.id + '\')">';

    // At risk badge
    if (atRisk) {
      html += '<div class="plb-risk-badge" title="At Risk: ';
      if (deal.expected_close_at && new Date(deal.expected_close_at) < new Date()) {
        html += 'Past expected close';
      } else {
        html += 'Age ' + deal.age_days + '+ days';
      }
      html += '">AT RISK</div>';
    }

    // Top row: avatar + info
    html += '<div class="pl-card-top">';
    html += '<div class="pl-card-avatar">' + initials(deal.company_name || deal.title) + '</div>';
    html += '<div class="pl-card-info">';
    html += '<div class="pl-card-company">' + escHtml(deal.title || "") + '</div>';
    html += '<div class="pl-card-contact">' + escHtml(deal.company_name || "") + '</div>';
    html += '</div>';
    html += '</div>';

    // Value
    html += '<div class="pl-card-value">' + escHtml(curr + Number(deal.value || 0).toLocaleString()) + '</div>';

    // Meta: owner, age
    html += '<div class="pl-card-meta">';
    if (deal.owner_name) {
      html += '<span class="pl-card-channel">' + escHtml(deal.owner_name) + '</span>';
    }
    if (deal.age_days != null) {
      var daysClass = "";
      if (deal.age_days >= 30) daysClass = " danger";
      else if (deal.age_days >= 14) daysClass = " warning";
      html += '<span class="pl-card-days' + daysClass + '">'
        + '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="9" height="9"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        + deal.age_days + 'd'
        + '</span>';
    }
    html += '</div>';

    html += '</div>'; // /pl-card
    return html;
  }

  // ── Drag & Drop ───────────────────────────────────────────
  window.plbDragStart = function (e, dealId) {
    _plb.dragging = dealId;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId);
    setTimeout(function () {
      var el = document.getElementById("plb-deal-" + dealId);
      if (el) el.classList.add("dragging");
    }, 0);
  };

  window.plbDragEnd = function (e) {
    if (_plb.dragging) {
      var el = document.getElementById("plb-deal-" + _plb.dragging);
      if (el) el.classList.remove("dragging");
    }
    document.querySelectorAll(".pl-drop-zone").forEach(function (z) { z.classList.remove("drag-over"); });
    _plb.dragging = null;
  };

  window.plbDragOver = function (e, stageId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    document.querySelectorAll(".pl-drop-zone").forEach(function (z) { z.classList.remove("drag-over"); });
    var zone = document.getElementById("plb-zone-" + stageId);
    if (zone) zone.classList.add("drag-over");
  };

  window.plbDragLeave = function (e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove("drag-over");
    }
  };

  window.plbDrop = function (e, toStageId) {
    e.preventDefault();
    var dealId = e.dataTransfer.getData("text/plain") || _plb.dragging;
    if (!dealId) return;

    // Find deal + old stage
    var deal = null;
    var fromStageId = null;
    _plb.stages.forEach(function (stage) {
      (stage.deals || []).forEach(function (d) {
        if (String(d.id) === String(dealId)) {
          deal = d;
          fromStageId = stage.id;
        }
      });
    });

    if (!deal || fromStageId === toStageId) return;

    // Optimistic update: move card in DOM
    var card = document.getElementById("plb-deal-" + dealId);
    var zone = document.getElementById("plb-zone-" + toStageId);
    if (card && zone) {
      zone.appendChild(card);
    }

    // Move deal in data
    var fromStage = _plb.stages.find(function (s) { return s.id === fromStageId; });
    var toStage = _plb.stages.find(function (s) { return s.id === toStageId; });
    if (fromStage && fromStage.deals) {
      fromStage.deals = fromStage.deals.filter(function (d) { return String(d.id) !== String(dealId); });
    }
    if (toStage) {
      toStage.deals = toStage.deals || [];
      deal._stageId = toStageId;
      deal._stageName = toStage.name;
      toStage.deals.push(deal);
    }

    // Update column stats optimistically
    plbUpdateColumnStats();

    var toStageName = toStage ? toStage.name : toStageId;
    showToast("Deal moved to " + toStageName);

    // Demo mode: skip API, keep optimistic update
    if (_plbDemoActive() && String(dealId).indexOf("demo-") === 0) return;

    // API call
    novatraiApi("/deals/" + dealId + "/move", {
      method: "POST",
      body: { to_stage_id: toStageId }
    }, function (err) {
      if (err) {
        showToast("Move failed — reverting");
        // Revert: move deal back
        if (toStage && toStage.deals) {
          toStage.deals = toStage.deals.filter(function (d) { return String(d.id) !== String(dealId); });
        }
        if (fromStage) {
          fromStage.deals = fromStage.deals || [];
          deal._stageId = fromStageId;
          deal._stageName = fromStage.name;
          fromStage.deals.push(deal);
        }
        // Re-render columns to revert DOM
        plbRenderColumns();
      }
    });
  };

  function plbUpdateColumnStats() {
    _plb.stages.forEach(function (stage) {
      var deals = plbStageDeals(stage);
      var countEl = document.querySelector('[data-stage="' + stage.id + '"] .pl-col-count');
      var totalEl = document.querySelector('[data-stage="' + stage.id + '"] .pl-col-total');
      if (countEl) countEl.textContent = deals.length;
      if (totalEl) {
        var sum = 0;
        deals.forEach(function (d) { sum += (Number(d.value) || 0); });
        var curr = _plb.board.kpis ? (_plb.board.kpis.currency || "") : "";
        totalEl.textContent = fmtCurrency(sum, curr);
      }
    });
  }

  // ── Deal Overlay ──────────────────────────────────────────
  window.plbOpenDeal = function (dealId) {
    var deal = null;
    _plb.stages.forEach(function (stage) {
      (stage.deals || []).forEach(function (d) {
        if (String(d.id) === String(dealId)) deal = d;
      });
    });
    if (!deal) return;
    _plb.currentDeal = deal;

    var overlay = document.getElementById("plb-deal-overlay");
    if (!overlay) return;

    // Populate overlay
    document.getElementById("plb-do-avatar").textContent = initials(deal.company_name || deal.title);
    document.getElementById("plb-do-title").textContent = deal.title || "";
    document.getElementById("plb-do-company").textContent = deal.company_name || "";
    document.getElementById("plb-do-value").textContent = ((_plb.board.kpis ? (_plb.board.kpis.currency || "") : "") + Number(deal.value || 0).toLocaleString());
    document.getElementById("plb-do-owner").textContent = deal.owner_name || "—";
    document.getElementById("plb-do-stage").textContent = deal._stageName || "—";
    document.getElementById("plb-do-age").textContent = (deal.age_days != null ? deal.age_days + " days" : "—");

    var closeDate = deal.expected_close_at ? new Date(deal.expected_close_at).toLocaleDateString() : "—";
    document.getElementById("plb-do-close").textContent = closeDate;

    // At risk indicator
    var riskEl = document.getElementById("plb-do-risk");
    if (riskEl) {
      riskEl.style.display = isAtRisk(deal) ? "" : "none";
    }

    // Show/hide action buttons based on stage
    var wonBtn = document.getElementById("plb-btn-won");
    var lostBtn = document.getElementById("plb-btn-lost");
    var stageLower = (deal._stageName || "").toLowerCase();
    var isClosed = stageLower === "won" || stageLower === "lost" || stageLower === "closed won" || stageLower === "closed lost";
    if (wonBtn) wonBtn.style.display = isClosed ? "none" : "";
    if (lostBtn) lostBtn.style.display = isClosed ? "none" : "";

    // Update lifecycle banner
    if (typeof _osUpdatePlbDealBanner === "function") _osUpdatePlbDealBanner(deal._stageName);

    overlay.classList.add("open");
  };

  window.plbCloseDeal = function () {
    var overlay = document.getElementById("plb-deal-overlay");
    if (overlay) overlay.classList.remove("open");
    _plb.currentDeal = null;

    // Also close lost reason modal if open
    var lrm = document.getElementById("plb-lost-reason-modal");
    if (lrm) lrm.classList.remove("open");
  };

  // ── Mark Won ──────────────────────────────────────────────
  window.plbMarkWon = function () {
    var deal = _plb.currentDeal;
    if (!deal) return;

    // Demo mode: simulate locally
    if (_plbDemoActive() && String(deal.id).indexOf("demo-") === 0) {
      showToast("Demo: Deal marked as Won!");
      plbCloseDeal();
      plbLoad(); // re-render
      return;
    }

    novatraiApi("/deals/" + deal.id + "/mark-won", { method: "POST" }, function (err, data) {
      if (err) {
        showToast("Mark Won failed: " + (err.message || "Error"));
        return;
      }
      showToast("Deal marked as Won!");
      plbCloseDeal();

      // Navigate to case if case_id returned
      var caseId = data && (data.case_id || data.caseId);
      if (caseId && typeof openCase === "function") {
        openCase(caseId);
      }

      // Refresh board
      plbFetchBoard();
    });
  };

  // ── Mark Lost (with reason modal) ─────────────────────────
  window.plbOpenLostModal = function () {
    var modal = document.getElementById("plb-lost-reason-modal");
    if (modal) modal.classList.add("open");
    var input = document.getElementById("plb-lost-reason-input");
    if (input) { input.value = ""; setTimeout(function () { input.focus(); }, 150); }
  };

  window.plbCloseLostModal = function () {
    var modal = document.getElementById("plb-lost-reason-modal");
    if (modal) modal.classList.remove("open");
  };

  window.plbSubmitLost = function () {
    var deal = _plb.currentDeal;
    if (!deal) return;
    var reason = (document.getElementById("plb-lost-reason-input").value || "").trim();
    if (!reason) { showToast("Please enter a reason"); return; }

    // Demo mode: simulate locally
    if (_plbDemoActive() && String(deal.id).indexOf("demo-") === 0) {
      showToast("Demo: Deal marked as Lost \u2014 " + reason);
      plbCloseDeal();
      plbLoad();
      return;
    }

    novatraiApi("/deals/" + deal.id + "/mark-lost", {
      method: "POST",
      body: { reason: reason }
    }, function (err) {
      if (err) {
        showToast("Mark Lost failed: " + (err.message || "Error"));
        return;
      }
      showToast("Deal marked as Lost");
      plbCloseDeal();
      plbFetchBoard();
    });
  };

  // ── Expose for switchScreen hook + demo-data.js ────────────
  window.plbLoad = plbLoad;
  window.plbCleanup = plbCleanup;
  window.plbHydrateBoard = plbHydrateBoard;

  console.log("Novatrai: pipeline-board.js loaded");
})();
