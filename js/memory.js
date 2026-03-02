/* ═══════════════════════════════════════════════════════════════
   LIVING MEMORY LAYER — Persistent Cross-Module AI Memory
   Records every significant business event, enables fuzzy search
═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  const MEM_KEY = 'nv_memory';
  const MEM_MAX = 500;
  let _memFilter = 'all';
  let _memQuery = '';

  const MEM_ICONS = {
    deal:'💼', email:'✉️', payment:'💰', meeting:'📅',
    document:'📄', invoice:'🧾', contact:'👤', system:'⚙️'
  };

  /* ── CRUD ── */
  function getMemory() {
    try { return JSON.parse(localStorage.getItem(MEM_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function saveMemory(arr) {
    localStorage.setItem(MEM_KEY, JSON.stringify(arr));
  }

  window.recordMemoryEvent = function(type, entity, summary, screen) {
    var mem = getMemory();
    mem.unshift({
      ts: Date.now(),
      type: type || 'system',
      entity: entity || '',
      summary: summary || '',
      screen: screen || AI.context.page || 'unknown'
    });
    // LRU eviction
    if (mem.length > MEM_MAX) mem = mem.slice(0, MEM_MAX);
    saveMemory(mem);
  };

  /* ── Seed demo data if empty ── */
  function seedMemoryIfEmpty() {
    if (getMemory().length > 0) return;
    var now = Date.now();
    var day = 86400000;
    var seeds = [
      { ts:now - day*0.5, type:'email',    entity:'Legal Clear',       summary:'Sent compliance update email to James Botha', screen:'mail' },
      { ts:now - day*1,   type:'meeting',  entity:'Legal Clear',       summary:'Board call scheduled for Feb 28 at 2 PM', screen:'calendar' },
      { ts:now - day*1.5, type:'deal',     entity:'Summit Holdings',   summary:'Deal moved to Negotiating — $280K opportunity', screen:'pipeline' },
      { ts:now - day*2,   type:'payment',  entity:'TechBridge SA',     summary:'Payment received R 18,500 for INV-1084', screen:'payments' },
      { ts:now - day*3,   type:'invoice',  entity:'Legal Clear',       summary:'Invoice INV-1089 created — R 32,775', screen:'invoices' },
      { ts:now - day*4,   type:'document', entity:'Nexacore',          summary:'NDA_2026_v2.pdf uploaded to signed docs', screen:'master-docs' },
      { ts:now - day*5,   type:'contact',  entity:'Sarah Chen',        summary:'Contact added — CFO at TechBridge SA', screen:'contacts' },
      { ts:now - day*6,   type:'deal',     entity:'Alvaro Holdings',   summary:'Deal moved to Qualified — $95K opportunity', screen:'pipeline' },
      { ts:now - day*7,   type:'email',    entity:'TechBridge SA',     summary:'Follow-up email sent re: Q1 assessment', screen:'mail' },
      { ts:now - day*8,   type:'invoice',  entity:'Nexacore',          summary:'Invoice INV-1085 marked overdue — R 28,000 (38 days)', screen:'invoices' },
      { ts:now - day*9,   type:'meeting',  entity:'Summit Holdings',   summary:'Discovery call completed with procurement team', screen:'calendar' },
      { ts:now - day*10,  type:'payment',  entity:'Alvaro Holdings',   summary:'Partial payment received R 12,000 of R 24,000', screen:'payments' },
      { ts:now - day*12,  type:'document', entity:'Legal Clear',       summary:'Q1 Assessment Report.pdf shared with client', screen:'master-docs' },
      { ts:now - day*14,  type:'deal',     entity:'Global Corp',       summary:'New prospect added — $150K estimated value', screen:'pipeline' },
      { ts:now - day*18,  type:'email',    entity:'Nexacore',          summary:'Payment reminder sent for INV-1085', screen:'mail' },
      { ts:now - day*21,  type:'contact',  entity:'James Botha',       summary:'Contact updated — new phone number added', screen:'contacts' },
      { ts:now - day*25,  type:'invoice',  entity:'Summit Holdings',   summary:'Quote QT-0023 converted to invoice INV-1087', screen:'invoices' },
      { ts:now - day*30,  type:'meeting',  entity:'Alvaro Holdings',   summary:'Quarterly review meeting — all deliverables on track', screen:'calendar' },
    ];
    saveMemory(seeds);
  }

  /* ── Fuzzy Search ── */
  function fuzzyMatch(query, text) {
    if (!query) return 1;
    query = query.toLowerCase();
    text = text.toLowerCase();
    if (text.indexOf(query) >= 0) return 2; // exact substring = best
    // char-by-char fuzzy
    var qi = 0;
    for (var i = 0; i < text.length && qi < query.length; i++) {
      if (text[i] === query[qi]) qi++;
    }
    return qi === query.length ? 1 : 0;
  }

  /* ── Time Ago ── */
  function timeAgo(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    if (days < 7) return days + 'd ago';
    var weeks = Math.floor(days / 7);
    if (weeks < 5) return weeks + 'w ago';
    return Math.floor(days / 30) + 'mo ago';
  }

  /* ── Render Memory List ── */
  window.renderMemoryTab = function() {
    var mem = getMemory();
    var list = document.getElementById('mem-list');
    var countEl = document.getElementById('mem-count');
    if (!list) return;

    // Filter
    var filtered = mem.filter(function(m) {
      if (_memFilter !== 'all' && m.type !== _memFilter) return false;
      if (_memQuery) {
        var score = fuzzyMatch(_memQuery, m.summary + ' ' + m.entity);
        return score > 0;
      }
      return true;
    });

    // Sort by relevance if searching, otherwise by time
    if (_memQuery) {
      filtered.sort(function(a, b) {
        var sa = fuzzyMatch(_memQuery, a.summary + ' ' + a.entity);
        var sb = fuzzyMatch(_memQuery, b.summary + ' ' + b.entity);
        return sb - sa || b.ts - a.ts;
      });
    }

    if (filtered.length === 0) {
      list.innerHTML = '<div class="mem-empty">' + (_memQuery ? 'No memories match "' + _memQuery + '"' : 'No memories yet. Actions you take will appear here.') + '</div>';
    } else {
      list.innerHTML = filtered.slice(0, 50).map(function(m) {
        var icon = MEM_ICONS[m.type] || '📌';
        return '<div class="mem-item" onclick="memoryItemClick(\'' + m.screen + '\')">' +
          '<div class="mem-item-icon ' + m.type + '">' + icon + '</div>' +
          '<div class="mem-item-body">' +
            '<div class="mem-item-summary">' + escHtml(m.summary) + '</div>' +
            '<div class="mem-item-meta">' +
              '<span class="mem-item-entity">' + escHtml(m.entity) + '</span>' +
              '<span>·</span>' +
              '<span>' + timeAgo(m.ts) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    if (countEl) countEl.textContent = mem.length + ' memories stored';
  };

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.memoryItemClick = function(screen) {
    if (screen && typeof switchScreen === 'function') {
      switchScreen(screen);
    }
  };

  window.filterMemory = function(q) {
    _memQuery = q;
    renderMemoryTab();
  };

  window.setMemFilter = function(type, btn) {
    _memFilter = type;
    document.querySelectorAll('.mem-filter-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderMemoryTab();
  };

  /* ── Hook into AI tab switching ── */
  var _origActivateAiTab = window.activateAiTab;
  window.activateAiTab = function(tab) {
    if (_origActivateAiTab) _origActivateAiTab(tab);
    // Also handle memory tab
    document.querySelectorAll('.mem-tab-content').forEach(function(el) {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    if (tab === 'memory') renderMemoryTab();
  };

  /* ── Hook into key actions to auto-record memories ── */
  // Hook switchScreen to record navigation
  var _memOrigSwitch = window.switchScreen;
  if (_memOrigSwitch) {
    window.switchScreen = function(name) {
      _memOrigSwitch(name);
      // Don't record simple navigation — only record significant events
    };
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function() {
    seedMemoryIfEmpty();
  });

  /* ── Expose for other modules ── */
  window.getMemoryEntries = getMemory;
  window.getMemoryByEntity = function(entity) {
    return getMemory().filter(function(m) {
      return m.entity.toLowerCase().indexOf(entity.toLowerCase()) >= 0;
    });
  };
  window.getMemoryByType = function(type) {
    return getMemory().filter(function(m) { return m.type === type; });
  };
  window.getRecentMemory = function(count) {
    return getMemory().slice(0, count || 10);
  };

})();
