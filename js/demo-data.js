/* ═══════════════════════════════════════════════════════════════
 *  DEMO DATA — Toggle-able dummy data for Novatrai BOS
 *  Fills My Day widgets, Cases/Tasks/Approvals list screens
 *  Toggle in sidebar footer persists via localStorage
 *  All IDs prefixed "demo-" to distinguish from real data
 *  ES5 only — no arrow functions, no const/let
 * ═══════════════════════════════════════════════════════════════ */

(function() {
  "use strict";

  var DEMO_KEY = "novatrai_demo_mode";

  // ── Helper: today/yesterday/days-ago ISO strings ──────────
  function _dIso(daysAgo, hour) {
    var d = new Date();
    d.setDate(d.getDate() - (daysAgo || 0));
    d.setHours(hour || 9, 0, 0, 0);
    return d.toISOString();
  }
  function _dToday(hour) { return _dIso(0, hour || 17); }
  function _dFuture(daysAhead, hour) {
    var d = new Date();
    d.setDate(d.getDate() + (daysAhead || 1));
    d.setHours(hour || 17, 0, 0, 0);
    return d.toISOString();
  }

  // ══════════════════════════════════════════════════════════
  //  DEMO CASES — 15 items, SA-themed
  // ══════════════════════════════════════════════════════════
  var DEMO_CASES = [
    { id:"demo-case-001", title:"FICA Compliance Review \u2014 Vertex Holdings",
      case_number:"CS-2026-0041", description:"Annual FICA compliance audit for investment firm",
      priority:"URGENT", status:"IN_PROGRESS", due_at:_dFuture(1), created_at:_dIso(10), updated_at:_dIso(1,14),
      note_count:4, linked_docs_count:2, linked_files_count:1 },

    { id:"demo-case-002", title:"Employment Dispute \u2014 Ndlovu vs Harvest Agri",
      case_number:"CS-2026-0042", description:"CCMA referral for unfair dismissal claim",
      priority:"HIGH", status:"WAITING", due_at:_dFuture(3), created_at:_dIso(12), updated_at:_dIso(5,10),
      note_count:7, linked_docs_count:5, linked_files_count:3 },

    { id:"demo-case-003", title:"BEE Certificate Renewal \u2014 Cape Digital Ltd",
      case_number:"CS-2026-0043", description:"Level 2 B-BBEE verification due for annual renewal",
      priority:"HIGH", status:"IN_PROGRESS", due_at:_dFuture(5), created_at:_dIso(8), updated_at:_dIso(2,11),
      note_count:3, linked_docs_count:4, linked_files_count:2 },

    { id:"demo-case-004", title:"CIPC Annual Return \u2014 Dlamini Construction",
      case_number:"CS-2026-0044", description:"Overdue CIPC annual return filing for FY2025",
      priority:"URGENT", status:"OPEN", due_at:_dIso(2), created_at:_dIso(15), updated_at:_dIso(0,8),
      note_count:2, linked_docs_count:1, linked_files_count:0 },

    { id:"demo-case-005", title:"POPI Act Data Audit \u2014 Summit Holdings",
      case_number:"CS-2026-0045", description:"Information regulator compliance audit preparation",
      priority:"MEDIUM", status:"IN_PROGRESS", due_at:_dFuture(7), created_at:_dIso(6), updated_at:_dIso(1,16),
      note_count:5, linked_docs_count:3, linked_files_count:2 },

    { id:"demo-case-006", title:"SARS Tax Clearance \u2014 Van der Merwe Transport",
      case_number:"CS-2026-0046", description:"Tax clearance certificate application for tender bid",
      priority:"HIGH", status:"OPEN", due_at:_dFuture(2), created_at:_dIso(4), updated_at:_dIso(1,9),
      note_count:1, linked_docs_count:2, linked_files_count:1 },

    { id:"demo-case-007", title:"Property Transfer \u2014 84 Riebeek Street",
      case_number:"CS-2026-0047", description:"Conveyancing for commercial property sale in Cape Town CBD",
      priority:"MEDIUM", status:"WAITING", due_at:_dFuture(10), created_at:_dIso(20), updated_at:_dIso(8,15),
      note_count:9, linked_docs_count:6, linked_files_count:4 },

    { id:"demo-case-008", title:"IP Trademark Registration \u2014 Protea Brands",
      case_number:"CS-2026-0048", description:"National trademark registration for new product line",
      priority:"LOW", status:"IN_PROGRESS", due_at:_dFuture(14), created_at:_dIso(25), updated_at:_dIso(3,12),
      note_count:2, linked_docs_count:1, linked_files_count:1 },

    { id:"demo-case-009", title:"Municipal Rates Dispute \u2014 Sandton City Mall",
      case_number:"CS-2026-0049", description:"Appeal against increased property rates assessment",
      priority:"MEDIUM", status:"WAITING", due_at:_dFuture(6), created_at:_dIso(14), updated_at:_dIso(4,10),
      note_count:3, linked_docs_count:2, linked_files_count:0 },

    { id:"demo-case-010", title:"Shareholder Agreement \u2014 Mbeki & Associates",
      case_number:"CS-2026-0050", description:"Draft new shareholders agreement for equity restructure",
      priority:"HIGH", status:"IN_PROGRESS", due_at:_dFuture(4), created_at:_dIso(7), updated_at:_dIso(0,11),
      note_count:6, linked_docs_count:3, linked_files_count:2 },

    { id:"demo-case-011", title:"Labour Court Filing \u2014 Moyo vs TechBridge SA",
      case_number:"CS-2026-0051", description:"Constructive dismissal claim preparation for Labour Court",
      priority:"URGENT", status:"OPEN", due_at:_dFuture(1), created_at:_dIso(3), updated_at:_dIso(0,10),
      note_count:3, linked_docs_count:4, linked_files_count:2 },

    { id:"demo-case-012", title:"Procurement Compliance \u2014 Gauteng Water Board",
      case_number:"CS-2026-0052", description:"Public sector procurement process review and compliance check",
      priority:"MEDIUM", status:"OPEN", due_at:_dFuture(8), created_at:_dIso(5), updated_at:_dIso(2,14),
      note_count:1, linked_docs_count:2, linked_files_count:1 },

    { id:"demo-case-013", title:"Insurance Claim \u2014 Warehouse Fire (Durban)",
      case_number:"CS-2026-0053", description:"Commercial insurance claim for fire damage at harbour warehouse",
      priority:"HIGH", status:"WAITING", due_at:_dFuture(5), created_at:_dIso(18), updated_at:_dIso(6,9),
      note_count:8, linked_docs_count:7, linked_files_count:5 },

    { id:"demo-case-014", title:"NCA Credit Agreement \u2014 First Capital Finance",
      case_number:"CS-2026-0054", description:"National Credit Act compliance review for new lending product",
      priority:"LOW", status:"IN_PROGRESS", due_at:_dFuture(12), created_at:_dIso(9), updated_at:_dIso(1,15),
      note_count:2, linked_docs_count:3, linked_files_count:1 },

    { id:"demo-case-015", title:"Environmental Impact Assessment \u2014 Limpopo Solar Farm",
      case_number:"CS-2026-0055", description:"EIA application for 50MW solar installation in Polokwane",
      priority:"MEDIUM", status:"OPEN", due_at:_dFuture(15), created_at:_dIso(11), updated_at:_dIso(2,10),
      note_count:4, linked_docs_count:5, linked_files_count:3 }
  ];

  // ══════════════════════════════════════════════════════════
  //  DEMO TASKS — 15 items, linked to cases
  // ══════════════════════════════════════════════════════════
  var DEMO_TASKS = [
    // 4 overdue
    { id:"demo-task-001", title:"Draft FICA risk assessment report",
      description:"Prepare risk matrix for Vertex Holdings compliance review",
      due_at:_dIso(3,17), created_at:_dIso(8), case_id:"demo-case-001",
      case_number:"CS-2026-0041", case_title:"FICA Compliance Review \u2014 Vertex Holdings" },

    { id:"demo-task-002", title:"Collect CCMA referral documentation",
      description:"Gather employment contracts and disciplinary records",
      due_at:_dIso(2,17), created_at:_dIso(10), case_id:"demo-case-002",
      case_number:"CS-2026-0042", case_title:"Employment Dispute \u2014 Ndlovu vs Harvest Agri" },

    { id:"demo-task-003", title:"File CIPC annual return online",
      description:"Submit overdue annual return on CIPC portal",
      due_at:_dIso(1,17), created_at:_dIso(12), case_id:"demo-case-004",
      case_number:"CS-2026-0044", case_title:"CIPC Annual Return \u2014 Dlamini Construction" },

    { id:"demo-task-004", title:"Review BEE scorecard calculations",
      description:"Verify ownership and management control scores",
      due_at:_dIso(1,12), created_at:_dIso(6), case_id:"demo-case-003",
      case_number:"CS-2026-0043", case_title:"BEE Certificate Renewal \u2014 Cape Digital Ltd" },

    // 3 due today
    { id:"demo-task-005", title:"Send SARS power of attorney form",
      description:"Get client signature and submit eFiling authorisation",
      due_at:_dToday(17), created_at:_dIso(3), case_id:"demo-case-006",
      case_number:"CS-2026-0046", case_title:"SARS Tax Clearance \u2014 Van der Merwe Transport" },

    { id:"demo-task-006", title:"Prepare POPI data inventory spreadsheet",
      description:"Map all personal data processing activities",
      due_at:_dToday(15), created_at:_dIso(4), case_id:"demo-case-005",
      case_number:"CS-2026-0045", case_title:"POPI Act Data Audit \u2014 Summit Holdings" },

    { id:"demo-task-007", title:"Schedule Labour Court consultation",
      description:"Book conference with advocate for case preparation",
      due_at:_dToday(12), created_at:_dIso(2), case_id:"demo-case-011",
      case_number:"CS-2026-0051", case_title:"Labour Court Filing \u2014 Moyo vs TechBridge SA" },

    // 8 upcoming
    { id:"demo-task-008", title:"Draft shareholders agreement (first version)",
      description:"Prepare initial draft based on client instructions",
      due_at:_dFuture(2,17), created_at:_dIso(5), case_id:"demo-case-010",
      case_number:"CS-2026-0050", case_title:"Shareholder Agreement \u2014 Mbeki & Associates" },

    { id:"demo-task-009", title:"Request property valuation report",
      description:"Instruct valuers for Section 78 compliance",
      due_at:_dFuture(3,17), created_at:_dIso(15), case_id:"demo-case-007",
      case_number:"CS-2026-0047", case_title:"Property Transfer \u2014 84 Riebeek Street" },

    { id:"demo-task-010", title:"Submit trademark application to CIPC",
      description:"File Form TM1 with supporting documentation",
      due_at:_dFuture(5,17), created_at:_dIso(20), case_id:"demo-case-008",
      case_number:"CS-2026-0048", case_title:"IP Trademark Registration \u2014 Protea Brands" },

    { id:"demo-task-011", title:"Prepare municipal rates appeal submission",
      description:"Draft grounds of appeal with comparative valuations",
      due_at:_dFuture(4,17), created_at:_dIso(10), case_id:"demo-case-009",
      case_number:"CS-2026-0049", case_title:"Municipal Rates Dispute \u2014 Sandton City Mall" },

    { id:"demo-task-012", title:"Compile insurance loss schedule",
      description:"Itemise warehouse contents and replacement costs",
      due_at:_dFuture(3,17), created_at:_dIso(16), case_id:"demo-case-013",
      case_number:"CS-2026-0053", case_title:"Insurance Claim \u2014 Warehouse Fire (Durban)" },

    { id:"demo-task-013", title:"Review NCA disclosure requirements",
      description:"Check pre-agreement disclosure obligations",
      due_at:_dFuture(6,17), created_at:_dIso(7), case_id:"demo-case-014",
      case_number:"CS-2026-0054", case_title:"NCA Credit Agreement \u2014 First Capital Finance" },

    { id:"demo-task-014", title:"Draft EIA public participation notice",
      description:"Prepare notice for Government Gazette and local newspaper",
      due_at:_dFuture(8,17), created_at:_dIso(9), case_id:"demo-case-015",
      case_number:"CS-2026-0055", case_title:"Environmental Impact Assessment \u2014 Limpopo Solar Farm" },

    { id:"demo-task-015", title:"Obtain procurement compliance certificate",
      description:"Complete BBBEE and tax compliance declarations",
      due_at:_dFuture(5,17), created_at:_dIso(4), case_id:"demo-case-012",
      case_number:"CS-2026-0052", case_title:"Procurement Compliance \u2014 Gauteng Water Board" }
  ];

  // ══════════════════════════════════════════════════════════
  //  DEMO APPROVALS — 12 items
  // ══════════════════════════════════════════════════════════
  var DEMO_APPROVALS = [
    // 8 pending
    { id:"demo-appr-001", workflow_name:"FICA Compliance Workflow", step_name:"Senior Partner Approval",
      case_id:"demo-case-001", case_number:"CS-2026-0041", case_title:"FICA Compliance Review \u2014 Vertex Holdings",
      decision:"PENDING", created_at:_dIso(1,9), decided_at:null },

    { id:"demo-appr-002", workflow_name:"Employee Onboarding", step_name:"HR Director Sign-off",
      case_id:"demo-case-002", case_number:"CS-2026-0042", case_title:"Employment Dispute \u2014 Ndlovu vs Harvest Agri",
      decision:"PENDING", created_at:_dIso(2,10), decided_at:null },

    { id:"demo-appr-003", workflow_name:"BEE Verification Process", step_name:"Compliance Check",
      case_id:"demo-case-003", case_number:"CS-2026-0043", case_title:"BEE Certificate Renewal \u2014 Cape Digital Ltd",
      decision:"PENDING", created_at:_dIso(1,14), decided_at:null },

    { id:"demo-appr-004", workflow_name:"Invoice Approval Chain", step_name:"Finance Manager Review",
      case_id:"demo-case-006", case_number:"CS-2026-0046", case_title:"SARS Tax Clearance \u2014 Van der Merwe Transport",
      decision:"PENDING", created_at:_dIso(0,8), decided_at:null },

    { id:"demo-appr-005", workflow_name:"Contract Sign-off", step_name:"Director Approval",
      case_id:"demo-case-010", case_number:"CS-2026-0050", case_title:"Shareholder Agreement \u2014 Mbeki & Associates",
      decision:"PENDING", created_at:_dIso(0,10), decided_at:null },

    { id:"demo-appr-006", workflow_name:"POPI Data Request", step_name:"Information Officer Review",
      case_id:"demo-case-005", case_number:"CS-2026-0045", case_title:"POPI Act Data Audit \u2014 Summit Holdings",
      decision:"PENDING", created_at:_dIso(3,11), decided_at:null },

    { id:"demo-appr-007", workflow_name:"Procurement Review", step_name:"Supply Chain Approval",
      case_id:"demo-case-012", case_number:"CS-2026-0052", case_title:"Procurement Compliance \u2014 Gauteng Water Board",
      decision:"PENDING", created_at:_dIso(1,15), decided_at:null },

    { id:"demo-appr-008", workflow_name:"Labour Matter Workflow", step_name:"Managing Partner Review",
      case_id:"demo-case-011", case_number:"CS-2026-0051", case_title:"Labour Court Filing \u2014 Moyo vs TechBridge SA",
      decision:"PENDING", created_at:_dIso(0,11), decided_at:null },

    // 2 approved
    { id:"demo-appr-009", workflow_name:"SARS Submission Review", step_name:"Tax Partner Sign-off",
      case_id:"demo-case-006", case_number:"CS-2026-0046", case_title:"SARS Tax Clearance \u2014 Van der Merwe Transport",
      decision:"APPROVED", created_at:_dIso(5,9), decided_at:_dIso(4,14) },

    { id:"demo-appr-010", workflow_name:"Board Resolution Approval", step_name:"Company Secretary",
      case_id:"demo-case-007", case_number:"CS-2026-0047", case_title:"Property Transfer \u2014 84 Riebeek Street",
      decision:"APPROVED", created_at:_dIso(10,8), decided_at:_dIso(9,16) },

    // 2 rejected
    { id:"demo-appr-011", workflow_name:"Invoice Approval Chain", step_name:"Finance Director",
      case_id:"demo-case-013", case_number:"CS-2026-0053", case_title:"Insurance Claim \u2014 Warehouse Fire (Durban)",
      decision:"REJECTED", created_at:_dIso(7,10), decided_at:_dIso(6,15) },

    { id:"demo-appr-012", workflow_name:"EIA Application Workflow", step_name:"Environmental Officer",
      case_id:"demo-case-015", case_number:"CS-2026-0055", case_title:"Environmental Impact Assessment \u2014 Limpopo Solar Farm",
      decision:"REJECTED", created_at:_dIso(8,9), decided_at:_dIso(7,11) }
  ];

  // ══════════════════════════════════════════════════════════
  //  DEMO PIPELINE BOARD — matches /pipelines/:id/board shape
  // ══════════════════════════════════════════════════════════
  var DEMO_PIPELINE_BOARD = {
    kpis: {
      pipeline_value: 876000,
      open_count: 9,
      avg_deal: 97333,
      win_rate: 0.38,
      currency: "R"
    },
    stages: [
      { id: "stg-prospect", name: "Prospect", order: 1,
        totals: { count: 2, value: 62000 },
        deals: [
          { id: "demo-deal-001", title: "Annual Retainer", company_name: "Coastal Brands",
            value: 34000, currency: "R", owner_name: "Sarah Botha", age_days: 18,
            expected_close_at: _dFuture(60) },
          { id: "demo-deal-002", title: "Compliance Package", company_name: "Zenith Analytics",
            value: 28000, currency: "R", owner_name: "James Rourke", age_days: 5,
            expected_close_at: _dFuture(90) }
        ]
      },
      { id: "stg-qualified", name: "Qualified", order: 2,
        totals: { count: 3, value: 467000 },
        deals: [
          { id: "demo-deal-003", title: "Enterprise Platform", company_name: "Northern Trust",
            value: 220000, currency: "R", owner_name: "Sarah Botha", age_days: 19,
            expected_close_at: _dFuture(45) },
          { id: "demo-deal-004", title: "Pilot Programme", company_name: "FlowState Inc",
            value: 92000, currency: "R", owner_name: "Nina Osei", age_days: 8,
            expected_close_at: _dFuture(14) },
          { id: "demo-deal-005", title: "Strategic Partnership", company_name: "Meridian Ventures",
            value: 155000, currency: "R", owner_name: "James Rourke", age_days: 12,
            expected_close_at: _dFuture(30) }
        ]
      },
      { id: "stg-proposal", name: "Proposal Sent", order: 3,
        totals: { count: 2, value: 109000 },
        deals: [
          { id: "demo-deal-006", title: "Legal Advisory Retainer", company_name: "Legal Clear",
            value: 47000, currency: "R", owner_name: "James Rourke", age_days: 47,
            expected_close_at: _dIso(5) },
          { id: "demo-deal-007", title: "Investment Fund Review", company_name: "BluePeak Capital",
            value: 62000, currency: "R", owner_name: "Nina Osei", age_days: 31,
            expected_close_at: _dFuture(15) }
        ]
      },
      { id: "stg-negotiating", name: "Negotiating", order: 4,
        totals: { count: 2, value: 240000 },
        deals: [
          { id: "demo-deal-008", title: "SaaS Subscription", company_name: "TechNova Solutions",
            value: 85000, currency: "R", owner_name: "Sarah Botha", age_days: 23,
            expected_close_at: _dIso(2) },
          { id: "demo-deal-009", title: "Consulting Engagement", company_name: "Atlas Group",
            value: 155000, currency: "R", owner_name: "James Rourke", age_days: 67,
            expected_close_at: _dIso(30) }
        ]
      },
      { id: "stg-won", name: "Won", order: 5,
        totals: { count: 1, value: 120000 },
        deals: [
          { id: "demo-deal-010", title: "Platform Onboarding", company_name: "Vantage Systems",
            value: 120000, currency: "R", owner_name: "Sarah Botha", age_days: 50,
            expected_close_at: _dIso(40) }
        ]
      },
      { id: "stg-lost", name: "Lost", order: 6,
        totals: { count: 1, value: 45000 },
        deals: [
          { id: "demo-deal-011", title: "Advisory Services", company_name: "Oakwood Corp",
            value: 45000, currency: "R", owner_name: "Nina Osei", age_days: 80,
            expected_close_at: _dIso(60) }
        ]
      }
    ]
  };

  // Expose for pipeline-board.js to pick up
  window._PLB_DEMO_BOARD = DEMO_PIPELINE_BOARD;

  // ══════════════════════════════════════════════════════════
  //  PRE-COMPUTED SUBSETS for My Day widgets
  // ══════════════════════════════════════════════════════════
  function _isOverdue(iso) {
    if (!iso) return false;
    return new Date(iso).getTime() < new Date().setHours(0,0,0,0);
  }
  function _isToday(iso) {
    if (!iso) return false;
    var d = new Date(iso);
    var n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  }

  function _getDemoSubsets() {
    var overdue = [], today = [], priority = [], waiting = [];
    var now = new Date().getTime();
    var i;

    for (i = 0; i < DEMO_TASKS.length; i++) {
      if (_isOverdue(DEMO_TASKS[i].due_at)) overdue.push(DEMO_TASKS[i]);
      if (_isToday(DEMO_TASKS[i].due_at)) today.push(DEMO_TASKS[i]);
    }
    for (i = 0; i < DEMO_CASES.length; i++) {
      var p = (DEMO_CASES[i].priority || "").toUpperCase();
      if (p === "URGENT" || p === "HIGH") priority.push(DEMO_CASES[i]);

      var st = (DEMO_CASES[i].status || "").toUpperCase();
      var base = DEMO_CASES[i].updated_at || DEMO_CASES[i].created_at;
      if (st === "WAITING" && base) {
        var days = Math.floor((now - new Date(base).getTime()) / 86400000);
        if (days >= 3) waiting.push(DEMO_CASES[i]);
      }
    }
    var pendingApprovals = [];
    for (i = 0; i < DEMO_APPROVALS.length; i++) {
      if (DEMO_APPROVALS[i].decision === "PENDING") pendingApprovals.push(DEMO_APPROVALS[i]);
    }

    return { overdue: overdue, today: today, priority: priority, waiting: waiting, pending: pendingApprovals };
  }

  // ══════════════════════════════════════════════════════════
  //  STATE
  // ══════════════════════════════════════════════════════════
  function demoIsActive() {
    try { return localStorage.getItem(DEMO_KEY) === "1"; } catch(e) { return false; }
  }

  // ══════════════════════════════════════════════════════════
  //  INJECT DEMO DATA INTO ALL SCREENS
  // ══════════════════════════════════════════════════════════
  function demoInject() {
    var sub = _getDemoSubsets();

    // ── My Day widgets ──
    if (typeof _myDayRenderApprovals === "function") {
      _myDayRenderApprovals(null, { items: sub.pending });
    }
    if (typeof _myDayRenderTaskList === "function") {
      _myDayRenderTaskList("myday-overdue-tasks-body", sub.overdue, "No overdue tasks", "myday-overdue-tasks");
      _myDayRenderTaskList("myday-due-today-body", sub.today, "Nothing due today", "myday-due-today");
    }
    if (typeof _myDayRenderCaseList === "function") {
      _myDayRenderCaseList("myday-top-cases-body", sub.priority, "No high priority cases", 10, "myday-top-cases");
      _myDayRenderCaseList("myday-waiting-body", sub.waiting, "No cases waiting too long", 8, "myday-waiting");
    }
    if (typeof _myDayUpdateKpis === "function") {
      _myDayUpdateKpis({
        approvals: sub.pending.length,
        overdue: sub.overdue.length,
        today: sub.today.length,
        priority: sub.priority.length
      });
    }

    // ── Pipeline board ──
    if (typeof plbHydrateBoard === "function" && window._PLB_DEMO_BOARD) {
      var activeScreen = document.querySelector(".screen.active");
      if (activeScreen && activeScreen.id === "screen-pipeline") {
        plbHydrateBoard(window._PLB_DEMO_BOARD);
      }
    }

    // ── Cases list screen ──
    if (typeof renderCasesRows === "function") {
      renderCasesRows(DEMO_CASES, false);
    }
    var casesCount = document.getElementById("cases-count");
    if (casesCount) casesCount.textContent = DEMO_CASES.length + " case(s)";
    var casesLoadMore = document.getElementById("cases-load-more");
    if (casesLoadMore) casesLoadMore.style.display = "none";

    // ── Tasks list screen ──
    if (typeof renderTasksRows === "function") {
      renderTasksRows(DEMO_TASKS, false);
    }
    var tasksCount = document.getElementById("tasks-count");
    if (tasksCount) tasksCount.textContent = DEMO_TASKS.length + " task(s)";
    var tasksLoadMore = document.getElementById("tasks-load-more");
    if (tasksLoadMore) tasksLoadMore.style.display = "none";

    // ── Approvals list screen ──
    if (typeof renderApprovalsRows === "function") {
      renderApprovalsRows(DEMO_APPROVALS, false);
    }
    var apprCount = document.getElementById("approvals-count");
    if (apprCount) apprCount.textContent = DEMO_APPROVALS.length + " approval(s)";
    var apprLoadMore = document.getElementById("approvals-load-more");
    if (apprLoadMore) apprLoadMore.style.display = "none";

    // ── Sidebar badges ──
    if (typeof _updateSidebarBadge === "function") {
      _updateSidebarBadge("approvals", sub.pending.length);
      _updateSidebarBadge("tasks", sub.overdue.length);
      _updateSidebarBadge("cases", sub.priority.length);
      // Pipeline: count at-risk deals from demo board
      if (typeof _countAtRiskFromBoard === "function" && window._PLB_DEMO_BOARD) {
        _updateSidebarBadge("pipeline", _countAtRiskFromBoard(window._PLB_DEMO_BOARD));
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  //  CLEANUP — revert to real data
  // ══════════════════════════════════════════════════════════
  function demoCleanup() {
    // Clear pipeline board
    if (typeof plbCleanup === "function") plbCleanup();

    // Clear tbodies
    var tbodies = ["cases-tbody", "tasks-tbody", "approvals-tbody"];
    for (var i = 0; i < tbodies.length; i++) {
      var tb = document.getElementById(tbodies[i]);
      if (tb) tb.innerHTML = "";
    }

    // Clear My Day widget bodies
    var widgetBodies = [
      "myday-approvals-body", "myday-overdue-tasks-body",
      "myday-due-today-body", "myday-top-cases-body", "myday-waiting-body"
    ];
    for (var w = 0; w < widgetBodies.length; w++) {
      var wb = document.getElementById(widgetBodies[w]);
      if (wb) wb.innerHTML = '<div style="opacity:.7;padding:10px 8px">\u2014</div>';
    }

    // Reset KPIs
    if (typeof _myDayUpdateKpis === "function") {
      _myDayUpdateKpis({ approvals: 0, overdue: 0, today: 0, priority: 0 });
    }

    // Reset sidebar badges
    if (typeof _updateSidebarBadge === "function") {
      _updateSidebarBadge("approvals", 0);
      _updateSidebarBadge("tasks", 0);
      _updateSidebarBadge("cases", 0);
      _updateSidebarBadge("pipeline", 0);
    }

    // Clear footer counts
    var countEls = ["cases-count", "tasks-count", "approvals-count"];
    for (var c = 0; c < countEls.length; c++) {
      var ce = document.getElementById(countEls[c]);
      if (ce) ce.textContent = "";
    }

    // Re-trigger real data loaders for the active screen
    var active = document.querySelector(".screen.active");
    if (!active) return;
    var sid = active.id || "";

    if (sid === "screen-my-day" && typeof myDayReload === "function") myDayReload();
    if (sid === "screen-cases" && typeof loadCasesPage === "function") loadCasesPage();
    if (sid === "screen-tasks" && typeof loadTasksPage === "function") loadTasksPage();
    if (sid === "screen-approvals" && typeof loadApprovalsPage === "function") loadApprovalsPage();

    if (typeof refreshBadgeCounts === "function") refreshBadgeCounts();
  }

  // ══════════════════════════════════════════════════════════
  //  TOGGLE HANDLER (called from checkbox onchange)
  // ══════════════════════════════════════════════════════════
  window.demoDataToggle = function(on) {
    try { localStorage.setItem(DEMO_KEY, on ? "1" : "0"); } catch(e) {}
    if (on) {
      demoInject();
      if (window.showToast) window.showToast("Demo mode ON \u2014 showing sample data");
    } else {
      demoCleanup();
      if (window.showToast) window.showToast("Demo mode OFF");
    }
  };

  // ══════════════════════════════════════════════════════════
  //  HOOKS — wrap switchScreen, openCase, tasksComplete, approvalsDecide
  // ══════════════════════════════════════════════════════════

  // -- switchScreen hook: re-inject demo data after screen change --
  var _hookReady = setInterval(function() {
    if (typeof window.switchScreen !== "function") return;
    clearInterval(_hookReady);

    var _origSwitch = window.switchScreen;
    window.switchScreen = function(name) {
      _origSwitch(name);
      if (demoIsActive()) {
        // Inject immediately and again after a short delay (in case API calls overwrite)
        setTimeout(demoInject, 100);
        setTimeout(demoInject, 600);
      }
    };
  }, 100);

  // -- openCase hook: intercept demo case IDs --
  var _hookCase = setInterval(function() {
    if (typeof window.openCase !== "function") return;
    clearInterval(_hookCase);

    var _origOpen = window.openCase;
    window.openCase = function(id) {
      if (demoIsActive() && id && id.indexOf("demo-") === 0) {
        var found = null;
        for (var i = 0; i < DEMO_CASES.length; i++) {
          if (DEMO_CASES[i].id === id) { found = DEMO_CASES[i]; break; }
        }
        if (window.showToast) {
          window.showToast("Demo: " + (found ? found.case_number + " \u2014 " + found.title : id));
        }
        return;
      }
      _origOpen(id);
    };
  }, 100);

  // -- tasksComplete hook: intercept demo task IDs --
  var _hookTask = setInterval(function() {
    if (typeof window.tasksComplete !== "function") return;
    clearInterval(_hookTask);

    var _origComplete = window.tasksComplete;
    window.tasksComplete = function(taskId, caseId) {
      if (demoIsActive() && taskId && taskId.indexOf("demo-") === 0) {
        if (window.showToast) window.showToast("Demo: Task marked complete \u2713");
        return;
      }
      _origComplete(taskId, caseId);
    };
  }, 100);

  // -- approvalsDecide hook: intercept demo approval IDs --
  var _hookApproval = setInterval(function() {
    if (typeof window.approvalsDecide !== "function") return;
    clearInterval(_hookApproval);

    var _origDecide = window.approvalsDecide;
    window.approvalsDecide = function(approvalId, decision) {
      if (demoIsActive() && approvalId && approvalId.indexOf("demo-") === 0) {
        var label = (decision || "").toLowerCase();
        if (window.showToast) window.showToast("Demo: Approval " + label);
        return;
      }
      _origDecide(approvalId, decision);
    };
  }, 100);

  // -- refreshBadgeCounts hook: use demo counts when active --
  var _hookBadge = setInterval(function() {
    if (typeof window.refreshBadgeCounts !== "function") return;
    clearInterval(_hookBadge);

    var _origBadge = window.refreshBadgeCounts;
    window.refreshBadgeCounts = function() {
      if (demoIsActive()) {
        var sub = _getDemoSubsets();
        if (typeof _updateSidebarBadge === "function") {
          _updateSidebarBadge("approvals", sub.pending.length);
          _updateSidebarBadge("tasks", sub.overdue.length);
        }
        return;
      }
      _origBadge();
    };
  }, 100);

  // ══════════════════════════════════════════════════════════
  //  FILTER INTERCEPT — when demo mode is on, filter from arrays
  // ══════════════════════════════════════════════════════════
  function _demoFilterCases() {
    if (!demoIsActive()) return;
    var statusEl = document.getElementById("cases-status-filter");
    var prioEl = document.getElementById("cases-priority-filter");
    var searchEl = document.getElementById("cases-search");

    var status = statusEl ? statusEl.value : "";
    var prio = prioEl ? prioEl.value : "";
    var q = searchEl ? searchEl.value.toLowerCase().trim() : "";

    var filtered = [];
    for (var i = 0; i < DEMO_CASES.length; i++) {
      var c = DEMO_CASES[i];
      if (status && c.status !== status) continue;
      if (prio && c.priority !== prio) continue;
      if (q && (c.title + " " + c.case_number + " " + c.description).toLowerCase().indexOf(q) === -1) continue;
      filtered.push(c);
    }
    if (typeof renderCasesRows === "function") renderCasesRows(filtered, false);
    var countEl = document.getElementById("cases-count");
    if (countEl) countEl.textContent = filtered.length + " case(s)";
  }

  function _demoFilterTasks() {
    if (!demoIsActive()) return;
    var statusEl = document.getElementById("tasks-status-filter");
    var searchEl = document.getElementById("tasks-search");

    var status = statusEl ? statusEl.value : "";
    var q = searchEl ? searchEl.value.toLowerCase().trim() : "";

    var filtered = [];
    for (var i = 0; i < DEMO_TASKS.length; i++) {
      var t = DEMO_TASKS[i];
      // Tasks don't have a status field in demo, so "OPEN" = all, "COMPLETED" = none
      if (status === "COMPLETED") continue;
      if (q && (t.title + " " + t.case_number + " " + t.description).toLowerCase().indexOf(q) === -1) continue;
      filtered.push(t);
    }
    if (typeof renderTasksRows === "function") renderTasksRows(filtered, false);
    var countEl = document.getElementById("tasks-count");
    if (countEl) countEl.textContent = filtered.length + " task(s)";
  }

  function _demoFilterApprovals() {
    if (!demoIsActive()) return;
    var decEl = document.getElementById("approvals-decision-filter");
    var searchEl = document.getElementById("approvals-search");

    var dec = decEl ? decEl.value : "";
    var q = searchEl ? searchEl.value.toLowerCase().trim() : "";

    var filtered = [];
    for (var i = 0; i < DEMO_APPROVALS.length; i++) {
      var a = DEMO_APPROVALS[i];
      if (dec && a.decision !== dec) continue;
      if (q && (a.workflow_name + " " + a.step_name + " " + a.case_number + " " + a.case_title).toLowerCase().indexOf(q) === -1) continue;
      filtered.push(a);
    }
    if (typeof renderApprovalsRows === "function") renderApprovalsRows(filtered, false);
    var countEl = document.getElementById("approvals-count");
    if (countEl) countEl.textContent = filtered.length + " approval(s)";
  }

  // Attach filter listeners after DOM ready
  function _attachFilterListeners() {
    var casesFilters = ["cases-status-filter", "cases-priority-filter"];
    for (var i = 0; i < casesFilters.length; i++) {
      var el = document.getElementById(casesFilters[i]);
      if (el) el.addEventListener("change", _demoFilterCases);
    }
    var casesSearch = document.getElementById("cases-search");
    if (casesSearch) casesSearch.addEventListener("input", function() {
      if (demoIsActive()) { clearTimeout(window._demoCasesDebounce); window._demoCasesDebounce = setTimeout(_demoFilterCases, 200); }
    });

    var tasksFilter = document.getElementById("tasks-status-filter");
    if (tasksFilter) tasksFilter.addEventListener("change", _demoFilterTasks);
    var tasksSearch = document.getElementById("tasks-search");
    if (tasksSearch) tasksSearch.addEventListener("input", function() {
      if (demoIsActive()) { clearTimeout(window._demoTasksDebounce); window._demoTasksDebounce = setTimeout(_demoFilterTasks, 200); }
    });

    var apprFilter = document.getElementById("approvals-decision-filter");
    if (apprFilter) apprFilter.addEventListener("change", _demoFilterApprovals);
    var apprSearch = document.getElementById("approvals-search");
    if (apprSearch) apprSearch.addEventListener("input", function() {
      if (demoIsActive()) { clearTimeout(window._demoApprDebounce); window._demoApprDebounce = setTimeout(_demoFilterApprovals, 200); }
    });
  }

  // ══════════════════════════════════════════════════════════
  //  INIT ON DOM READY
  // ══════════════════════════════════════════════════════════
  document.addEventListener("DOMContentLoaded", function() {
    _attachFilterListeners();

    var cb = document.getElementById("demo-data-toggle");
    if (cb && demoIsActive()) {
      cb.checked = true;
      // Delay to let other scripts init first
      setTimeout(demoInject, 800);
    }
  });

  // Expose on window for debugging
  window.DEMO_DATA = {
    cases: DEMO_CASES,
    tasks: DEMO_TASKS,
    approvals: DEMO_APPROVALS
  };

})();
