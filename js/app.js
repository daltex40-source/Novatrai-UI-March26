
  // ═══════════════════════════════════════════════════════════════
  //  RELATIONSHIP INTELLIGENCE + CONVERSATION TIMELINE
  // ═══════════════════════════════════════════════════════════════

  // ── Relationship Strip ──────────────────────────────────────────

  /** Show/hide the NBA card */
  function relShowNBA() {
    const card = document.getElementById('nba-card');
    if (!card) return;
    if (card.style.display === 'none' || card.style.display === '') {
      card.style.display = 'block';
      card.style.animation = 'nba-in .22s ease';
    } else {
      card.style.display = 'none';
    }
  }

  /** Switch to the Conversation tab from any trigger */
  function relOpenConversation() {
    switchTab('conversation');
    const el = document.querySelector('[data-tab="conversation"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /** Fire the AI action (open email composer pre-filled with AI hook) */
  function relActNow() {
    // 1. Dismiss NBA card
    const card = document.getElementById('nba-card');
    if (card) card.style.display = 'none';

    // 2. Switch to the Conversation tab
    switchTab('conversation');

    // 3. After tab switch, expand the most recent entry + open its reply box
    setTimeout(function() {
      // Expand entry 0 (most recent email from James)
      const entry = document.getElementById('centry-0');
      if (entry && !entry.classList.contains('expanded')) {
        entry.classList.add('expanded');
      }

      // Open the inline reply box
      convOpenReply('qr-0', null);

      // Trigger AI draft so it's ready to use
      setTimeout(function() {
        const aiBtn = entry ? entry.querySelector('[onclick*="convAISuggest"]') : null;
        if (aiBtn) convAISuggest(aiBtn, null);
        // Scroll reply box into view
        const qr = document.getElementById('qr-0');
        if (qr) qr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }, 200);
  }

  // ── NBA card snooze menu ───────────────────────────────────────

  function relToggleSnooze(btn) {
    const menu = btn.closest('.nba-actions').querySelector('.nba-snooze-opts');
    if (!menu) return;
    const open = menu.style.display === 'block';
    // close all open snooze menus first
    document.querySelectorAll('.nba-snooze-opts').forEach(m => m.style.display = 'none');
    menu.style.display = open ? 'none' : 'block';
  }

  function relSnooze(days) {
    document.querySelectorAll('.nba-snooze-opts').forEach(m => m.style.display = 'none');
    const card = document.getElementById('nba-card');
    if (card) card.style.display = 'none';
    const label = days === 1 ? 'tomorrow' : days + ' days';
    showToast('Snoozed for ' + label);
  }

  function relDismissNBA() {
    const card = document.getElementById('nba-card');
    if (card) card.style.display = 'none';
    showToast('Action dismissed');
  }

  // Close snooze menu on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nba-btn-snooze')) {
      document.querySelectorAll('.nba-snooze-opts').forEach(m => m.style.display = 'none');
    }
  });

  // ── Conversation Timeline ──────────────────────────────────────

  /** Filter timeline entries by channel chip */
  function convFilter(el, type) {
    // Update chip active state
    document.querySelectorAll('#conv-chips .conv-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    // Show/hide entries
    document.querySelectorAll('#conv-timeline .conv-entry').forEach(entry => {
      const ch = entry.dataset.ch;
      entry.style.display = (type === 'all' || ch === type) ? '' : 'none';
    });

    // Show/hide date groups that have visible entries
    document.querySelectorAll('#conv-timeline .conv-date-group').forEach(group => {
      const hasVisible = [...group.querySelectorAll('.conv-entry')]
        .some(e => e.style.display !== 'none');
      group.style.display = hasVisible ? '' : 'none';
    });
  }

  /** Expand / collapse a timeline entry */
  function convToggleEntry(el) {
    // Don't toggle if click was on a button inside expanded area
    const exp = el.querySelector('.conv-entry-expanded');
    if (!exp) return;
    const open = el.classList.toggle('expanded');
    if (open) {
      // Close all other open entries
      document.querySelectorAll('.conv-entry.expanded').forEach(other => {
        if (other !== el) {
          other.classList.remove('expanded');
        }
      });
    }
  }

  /** Open inline reply box */
  function convOpenReply(id, e) {
    if (e) e.stopPropagation();
    // Close any other open reply box first
    document.querySelectorAll('.conv-quick-reply.open').forEach(r => {
      if (r.id !== id) r.classList.remove('open');
    });
    const box = document.getElementById(id);
    if (!box) return;
    box.classList.add('open');
    const ta = box.querySelector('textarea');
    if (ta) setTimeout(() => ta.focus(), 50);
  }

  /** Close inline reply box */
  function convCloseReply(id, e) {
    if (e) e.stopPropagation();
    const box = document.getElementById(id);
    if (box) {
      box.classList.remove('open');
      const ta = box.querySelector('textarea');
      if (ta) ta.value = '';
      // Hide AI suggestion if open
      const sug = document.getElementById(id + '-suggestion');
      if (sug) sug.style.display = 'none';
    }
  }

  /** Send reply (mock — shows toast) */
  function convSendReply(id, e) {
    if (e) e.stopPropagation();
    const box = document.getElementById(id);
    if (!box) return;
    const ta = box.querySelector('textarea');
    const text = ta ? ta.value.trim() : '';
    if (!text) {
      ta.style.borderColor = 'rgba(240,112,112,0.6)';
      setTimeout(() => ta.style.borderColor = '', 1500);
      return;
    }
    // Simulate send
    const btn = box.querySelector('.qr-send');
    if (btn) {
      btn.textContent = 'Sending…';
      btn.disabled = true;
    }
    setTimeout(() => {
      convCloseReply(id, null);
      showToast('Message sent');
      // Close expanded entry
      const entry = box.closest('.conv-entry');
      if (entry) entry.classList.remove('expanded');
    }, 800);
  }

  /** AI Draft suggestion for reply box */
  function convAISuggest(btn, e) {
    if (e) e.stopPropagation();
    // Find nearest quick-reply box
    const entry = btn.closest('.conv-entry');
    if (!entry) return;

    // Find the reply box id from the nearby open-reply button
    const replyBtn = entry.querySelector('[onclick*="convOpenReply"]');
    if (!replyBtn) return;

    // Extract id from onclick
    const m = replyBtn.getAttribute('onclick').match(/convOpenReply\('([^']+)'/);
    if (!m) return;
    const id = m[1];

    // Open reply box first
    convOpenReply(id, null);

    const suggestions = [
      "Hi James,\n\nThanks for getting back to me — great timing! Thursday afternoon works perfectly for me.\n\nShould I send a calendar invite with a Zoom link?\n\nLooking forward to it.\nFritz",
      "James,\n\nPerfect — let's do Thursday. I'll have our CFO join as well to walk through the financial scenarios.\n\nI'll send a calendar invite shortly.\n\nBest,\nFritz",
      "Hi James,\n\nGreat to hear from you. Thursday afternoon sounds ideal — say 3pm your time?\n\nAlso happy to include Sarah in the revenue-share discussion if that would help move things forward.\n\nFritz"
    ];
    const pick = suggestions[Math.floor(Math.random() * suggestions.length)];

    const sug = document.getElementById(id + '-suggestion');
    if (sug) {
      sug.style.display = 'block';
      sug.innerHTML = '<div class="qr-ai-label"><svg fill="none" viewBox="0 0 24 24" stroke="#4A8FFF" stroke-width="1.8" width="11" height="11"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> AI Draft — click to use</div><div class="qr-ai-text" onclick="convUseSuggestion(\'' + id + '\',this)">' + pick.replace(/\n/g, '<br>') + '</div>';
    }
  }

  function convUseSuggestion(id, el) {
    const ta = document.getElementById(id + '-text');
    if (ta) {
      // Get plain text from the suggestion
      ta.value = el.innerText;
      ta.focus();
    }
    // Hide suggestion
    const sug = document.getElementById(id + '-suggestion');
    if (sug) sug.style.display = 'none';
  }

  /** Log a call (stub) */
  function convLogCall() {
    showToast('Call logger opening…');
  }

  /** Add a note (stub — switches to activity tab note box) */
  function convAddNote() {
    showToast('Note added to activity log');
  }

  /** Edit an internal note */
  function convEditNote(btn, e) {
    if (e) e.stopPropagation();
    const fullText = btn.closest('.conv-entry-expanded').querySelector('.conv-entry-full-text');
    if (!fullText) return;
    // Toggle contenteditable
    const editing = fullText.contentEditable === 'true';
    fullText.contentEditable = editing ? 'false' : 'true';
    btn.textContent = editing ? 'Edit Note' : 'Save Note';
    if (!editing) {
      fullText.style.outline = '1px solid rgba(74,143,255,0.4)';
      fullText.style.borderRadius = '4px';
      fullText.style.padding = '6px';
      fullText.focus();
    } else {
      fullText.style.outline = '';
      fullText.style.padding = '';
      showToast('Note saved');
    }
  }

  /** Book a meeting (stub) */
  function convBookMeeting(e) {
    if (e) e.stopPropagation();
    showToast('Opening calendar…');
  }

  /** Load older interactions */
  function convLoadMore(btn) {
    btn.disabled = true;
    btn.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="12" height="12" class="spin"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Loading…';
    setTimeout(() => {
      btn.parentElement.innerHTML = '<div style="font-size:12px;color:#5A7080;text-align:center;padding:8px 0">All interactions loaded</div>';
    }, 1200);
  }

  // ── Conversation tab visibility guard ─────────────────────────
  // Ensure Conversation panel displays correctly when tab is switched
  (function() {
    const _origSwitchTab = typeof switchTab === 'function' ? switchTab : null;
    if (_origSwitchTab) {
      window._relOrigSwitchTab = _origSwitchTab;
    }
  })();

  // ── Score ring animation on company screen open ────────────────
  function relAnimateScore() {
    const ring = document.getElementById('rel-ring-fill');
    if (!ring) return;
    const score = 72;
    const r = 28;
    const circ = 2 * Math.PI * r;
    const dash = circ - (score / 100) * circ;
    ring.style.transition = 'stroke-dashoffset 1s ease';
    ring.style.strokeDashoffset = dash;
    // Update label
    const lbl = document.getElementById('rel-score-num');
    if (lbl) {
      let cur = 0;
      const step = Math.ceil(score / 30);
      const ticker = setInterval(() => {
        cur = Math.min(cur + step, score);
        lbl.textContent = cur;
        if (cur >= score) clearInterval(ticker);
      }, 33);
    }
  }

  // Animate when company screen becomes visible
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[onclick*="showScreen(\'company"]');
    if (btn) setTimeout(relAnimateScore, 200);
  });
  // Also animate on DOMContentLoaded if already on company screen
  document.addEventListener('DOMContentLoaded', function() {
    const sc = document.getElementById('screen-company');
    if (sc && (sc.style.display === 'flex' || sc.classList.contains('active'))) {
      setTimeout(relAnimateScore, 300);
    }
  });

// ═══════════════════════════════════════════════════════════════
  //  PIPELINE BOARD
  // ═══════════════════════════════════════════════════════════════

  // Deal data store
  const _plDeals = {
    'deal-1':  { company:'Legal Clear',       initials:'LC', contact:'James Rourke · CEO',     value:'$47,000',  stage:'Proposal Sent', close:'2026-03-31', prob:'45%', notes:'James replied today — positive signal. Follow up with call invite Thursday. Sarah (Finance) CC\'d — good sign.' },
    'deal-2':  { company:'TechNova Solutions', initials:'TN', contact:'Sarah Mitchell · CTO',   value:'$85,000',  stage:'Negotiating',   close:'2026-02-28', prob:'70%', notes:'Term sheet agreed in principle. Waiting on legal sign-off from their side.' },
    'deal-3':  { company:'BluePeak Capital',   initials:'BP', contact:'Nina Osei · Partner',    value:'$62,000',  stage:'Proposal Sent', close:'2026-04-15', prob:'30%', notes:'Relationship cooling. Last email opened but not replied. Try WhatsApp ping.' },
    'deal-4':  { company:'Northern Trust',     initials:'NT', contact:'David Kim · CFO',        value:'$220,000', stage:'Qualified',     close:'2026-05-01', prob:'50%', notes:'Very large deal — board approval required. David positive, needs exec deck.' },
    'deal-5':  { company:'FlowState Inc',      initials:'FS', contact:'Emma Lawson · CEO',      value:'$92,000',  stage:'Qualified',     close:'2026-03-15', prob:'65%', notes:'Emma is moving fast. Wants pilot live by April. Book demo call this week.' },
    'deal-6':  { company:'Zenith Analytics',   initials:'ZA', contact:'Priya Nair · Head of Ops', value:'$28,000', stage:'Prospect',    close:'2026-06-01', prob:'20%', notes:'Cold outreach via LinkedIn. Priya showed interest — send intro deck.' },
    'deal-7':  { company:'Coastal Brands',     initials:'CB', contact:'Mark Stevens · CEO',     value:'$34,000',  stage:'Prospect',     close:'2026-05-15', prob:'25%', notes:'Warm intro via Mark at Chamber of Commerce event. Follow up this week.' },
    'deal-8':  { company:'Meridian Ventures',  initials:'MV', contact:'James Rourke · CEO',     value:'$155,000', stage:'Qualified',    close:'2026-04-30', prob:'55%', notes:'Strong initial call. Interested in strategic partnership angle. Send proposal.' },
    'deal-9':  { company:'Atlas Group',        initials:'AG', contact:'Robert Crane · MD',      value:'$155,000', stage:'Negotiating',  close:'2026-03-01', prob:'35%', notes:'STALLED 67 days. Robert has gone quiet. Consider escalating to their CEO.' },
    'deal-10': { company:'Vantage Systems',    initials:'VS', contact:'Anna Brooks · CEO',      value:'$120,000', stage:'Won',          close:'2026-01-12', prob:'100%',notes:'Closed and signed. Onboarding starts 1 Feb. Great reference customer.' },
    'deal-11': { company:'Oakwood Corp',       initials:'OC', contact:'Tom Walsh · CFO',        value:'$45,000',  stage:'Lost',         close:'2025-12-15', prob:'0%', notes:'Lost to competitor on pricing. Tom wanted 40% discount — not viable. Good for future when budget improves.' },
  };

  let _plDragging = null;
  let _plCurrentDeal = null;

  // ── Drag & Drop ────────────────────────────────────────────────
  function plDragStart(e, id) {
    _plDragging = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('dragging');
    }, 0);
  }

  function plDragEnd(e) {
    if (_plDragging) {
      const el = document.getElementById(_plDragging);
      if (el) el.classList.remove('dragging');
    }
    document.querySelectorAll('.pl-drop-zone').forEach(z => z.classList.remove('drag-over'));
    _plDragging = null;
  }

  function plDragOver(e, stage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.pl-drop-zone').forEach(z => z.classList.remove('drag-over'));
    const zone = document.getElementById('zone-' + stage);
    if (zone) zone.classList.add('drag-over');
  }

  function plDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('drag-over');
    }
  }

  function plDrop(e, stage) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || _plDragging;
    if (!id) return;

    const card = document.getElementById(id);
    const zone = document.getElementById('zone-' + stage);
    if (!card || !zone) return;

    zone.classList.remove('drag-over');
    zone.insertBefore(card, zone.querySelector('.pl-add-card'));

    // Update deal data
    if (_plDeals[id]) {
      const stageMap = { prospect:'Prospect', qualified:'Qualified', proposal:'Proposal Sent', negotiating:'Negotiating', won:'Won', lost:'Lost' };
      _plDeals[id].stage = stageMap[stage] || stage;
    }

    plUpdateColStats();
    showToast('Deal moved to ' + (stage.charAt(0).toUpperCase() + stage.slice(1)));
  }

  // ── Column stats recalculation ────────────────────────────────
  function plUpdateColStats() {
    const stages = ['prospect','qualified','proposal','negotiating','won','lost'];
    stages.forEach(stage => {
      const zone = document.getElementById('zone-' + stage);
      if (!zone) return;
      const cards = zone.querySelectorAll('.pl-card');
      let total = 0;
      cards.forEach(card => {
        const deal = _plDeals[card.id];
        if (deal) {
          const v = parseFloat(deal.value.replace(/[$,]/g,'')) || 0;
          total += v;
        }
      });
      const cnt = document.getElementById('cnt-' + stage);
      const tot = document.getElementById('tot-' + stage);
      if (cnt) cnt.textContent = cards.length;
      if (tot) {
        const k = total >= 1000 ? (total/1000).toFixed(0) + 'K' : total;
        tot.textContent = total > 0 ? '$' + k : '—';
      }
    });
    // Update total pipeline (exclude lost)
    let grandTotal = 0;
    ['prospect','qualified','proposal','negotiating','won'].forEach(stage => {
      const zone = document.getElementById('zone-' + stage);
      if (!zone) return;
      zone.querySelectorAll('.pl-card').forEach(card => {
        const deal = _plDeals[card.id];
        if (deal) grandTotal += parseFloat(deal.value.replace(/[$,]/g,'')) || 0;
      });
    });
    const tv = document.getElementById('pl-total-val');
    if (tv) tv.textContent = '$' + (grandTotal/1000).toFixed(0) + 'K';
  }

  // ── Deal detail modal ─────────────────────────────────────────
  function plOpenDeal(id) {
    const deal = _plDeals[id];
    if (!deal) return;
    _plCurrentDeal = id;

    document.getElementById('dm-avatar').textContent   = deal.initials;
    document.getElementById('dm-company').textContent  = deal.company;
    document.getElementById('dm-sub').textContent      = deal.contact;
    document.getElementById('dm-value').value          = deal.value;
    document.getElementById('dm-prob').value           = deal.prob;
    document.getElementById('dm-notes').value          = deal.notes;
    document.getElementById('dm-close').value          = deal.close;

    // Set stage dropdown
    const sel = document.getElementById('dm-stage');
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text === deal.stage) { sel.selectedIndex = i; break; }
    }

    document.getElementById('deal-modal-overlay').classList.add('open');

    // Update lifecycle banner
    if (typeof _osUpdateDealBanner === "function") _osUpdateDealBanner(deal.stage);
  }

  function plCloseDeal() {
    document.getElementById('deal-modal-overlay').classList.remove('open');
    _plCurrentDeal = null;
  }

  function plSaveDeal() {
    if (!_plCurrentDeal) return;
    const deal = _plDeals[_plCurrentDeal];
    if (!deal) return;
    deal.value = document.getElementById('dm-value').value;
    deal.prob  = document.getElementById('dm-prob').value;
    deal.notes = document.getElementById('dm-notes').value;
    deal.close = document.getElementById('dm-close').value;
    deal.stage = document.getElementById('dm-stage').value;
    plCloseDeal();
    plUpdateColStats();
    showToast('Deal updated');
  }

  function openEmailComposerForDeal() {
    plCloseDeal();
    const deal = _plCurrentDeal ? _plDeals[_plCurrentDeal] : null;
    openEmailComposer(deal ? deal.contact.split(' · ')[0] : '');
  }

  // ── Add deal ──────────────────────────────────────────────────
  function plAddDeal(stage) {
    plOpenNewDeal(stage);
  }

  function plOpenNewDeal(stage) {
    // Reset form
    ['nd-name','nd-company','nd-contact','nd-value','nd-prob','nd-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // Default close date to 90 days from now
    const closeEl = document.getElementById('nd-close');
    if (closeEl) {
      const d = new Date();
      d.setDate(d.getDate() + 90);
      closeEl.value = d.toISOString().split('T')[0];
    }
    // Pre-select stage
    const stageEl = document.getElementById('nd-stage');
    if (stageEl && stage) {
      const map = { prospect:'prospect', qualified:'qualified', proposal:'proposal',
                    negotiating:'negotiating', won:'won', lost:'lost' };
      stageEl.value = map[stage] || 'prospect';
    }
    document.getElementById('new-deal-overlay').classList.add('open');
    setTimeout(() => { const n = document.getElementById('nd-name'); if(n) n.focus(); }, 150);
  }

  function plCloseNewDeal() {
    document.getElementById('new-deal-overlay').classList.remove('open');
  }

  function plSaveNewDeal() {
    const name    = (document.getElementById('nd-name').value || '').trim();
    const company = (document.getElementById('nd-company').value || '').trim();
    const contact = (document.getElementById('nd-contact').value || '').trim();
    const value   = (document.getElementById('nd-value').value || '').trim();
    const stage   = document.getElementById('nd-stage').value;
    const close   = (document.getElementById('nd-close').value || '').trim();
    const prob    = (document.getElementById('nd-prob').value || '').trim();
    const notes   = (document.getElementById('nd-notes').value || '').trim();

    if (!name || !value) { showToast('Please fill in the deal name and value'); return; }

    // Generate ID & initials
    const newId = 'deal-' + Date.now();
    const words = (company || name).split(' ').filter(Boolean);
    const initials = (words[0]?.[0] || '') + (words[1]?.[0] || words[0]?.[1] || '');

    // Store in _plDeals
    const stageLabel = { prospect:'Prospect', qualified:'Qualified', proposal:'Proposal Sent',
                         negotiating:'Negotiating', won:'Won', lost:'Lost' }[stage] || stage;
    _plDeals[newId] = { company: company || name, initials: initials.toUpperCase(),
      contact, value, stage: stageLabel, close, prob: prob || '25%', notes };

    // Build card HTML
    const card = document.createElement('div');
    card.className = 'pl-card';
    card.id = newId;
    card.draggable = true;
    card.setAttribute('ondragstart', `plDragStart(event,'${newId}')`);
    card.setAttribute('ondragend', 'plDragEnd(event)');
    card.setAttribute('onclick', `plOpenDeal('${newId}')`);
    card.innerHTML = `
      <div class="pl-card-top">
        <div class="pl-card-avatar">${initials.toUpperCase() || '?'}</div>
        <div class="pl-card-info">
          <div class="pl-card-company">${company || name}</div>
          <div class="pl-card-contact">${contact || '—'}</div>
        </div>
        <div class="pl-card-score new"></div>
      </div>
      <div class="pl-card-value">${value}</div>
      <div class="pl-card-meta">
        <span class="pl-card-days">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="9" height="9"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          0 days
        </span>
        <span class="pl-card-channel">New</span>
      </div>`;

    // Insert before the "+ Add deal" button in the correct column
    const zone = document.getElementById('zone-' + stage);
    const addBtn = zone ? zone.parentElement.querySelector('.pl-add-card') : null;
    if (zone && addBtn) {
      zone.parentElement.insertBefore(card, addBtn);
    } else if (zone) {
      zone.appendChild(card);
    }

    plUpdateColStats();
    plCloseNewDeal();
    showToast('Opportunity added to ' + stageLabel);
  }

  // ── Filter ────────────────────────────────────────────────────
  function plFilter(type, btn) {
    document.querySelectorAll('.pipeline-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    showToast(type === 'mine' ? 'Showing your deals' : 'Showing all deals');
  }

// ═══════════════════════════════════════════════════════════════
  //  AI EMAIL COMPOSER
  // ═══════════════════════════════════════════════════════════════

  let _emailComposerOpen = false;

  function openEmailComposer(toName) {
    const overlay = document.getElementById('email-composer-overlay');
    if (!overlay) return;
    _emailComposerOpen = true;
    overlay.classList.add('open');

    // Pre-fill To if name given
    if (toName) {
      const toInput = document.getElementById('ec-to');
      if (toInput && !toInput.value) toInput.value = toName;
    }
    setTimeout(() => {
      const subj = document.getElementById('ec-subject');
      if (subj && !subj.value) subj.focus();
    }, 200);
  }

  function closeEmailComposer() {
    const overlay = document.getElementById('email-composer-overlay');
    if (overlay) overlay.classList.remove('open');
    _emailComposerOpen = false;
  }

  function ecSetTone(btn, tone) {
    document.querySelectorAll('.ec-tone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showToast('Tone set to ' + tone);
  }

  function ecAIRewrite(action) {
    const body = document.getElementById('ec-body');
    if (!body || !body.value.trim()) {
      showToast('Write something first, then ask AI to rewrite it');
      return;
    }

    const btn = event ? event.target.closest('.ec-ai-action') : null;
    const orig = btn ? btn.textContent : '';
    if (btn) { btn.textContent = '...'; btn.disabled = true; }

    const rewrites = {
      shorter:   'Hi James,\n\nThanks for getting back to me — Thursday works. Let\'s say 3pm your time. I\'ll send a calendar invite now.\n\nFritz',
      warmer:    'Hey James,\n\nReally great to hear from you — this is exciting timing! Thursday afternoon is perfect. I\'ve been looking forward to diving deeper into the revenue model with you.\n\nI\'ll get a calendar invite over shortly. Can\'t wait.\n\nWarmly,\nFritz',
      direct:    'James,\n\nThursday 3pm confirmed. Calendar invite incoming. I\'ll bring the full financial model and our CFO.\n\nFritz',
      personalize: 'Hi James,\n\nGreat to hear back — and congrats on the LinkedIn post about your compliance pipeline. Sounds like Q2 is shaping up to be a big one for Meridian.\n\nThursday afternoon works perfectly. I\'ll have our CFO join to walk through the three revenue scenarios we modelled. Should be a useful session.\n\nCalendar invite coming now.\n\nFritz',
    };

    setTimeout(() => {
      body.value = rewrites[action] || body.value;
      if (btn) { btn.textContent = orig; btn.disabled = false; }
      body.style.borderColor = 'rgba(74,143,255,0.45)';
      setTimeout(() => body.style.borderColor = '', 1000);
      showToast('AI rewrite applied');
    }, 900);
  }

  function ecGenerateSubject() {
    const body = document.getElementById('ec-body');
    const subj = document.getElementById('ec-subject');
    if (!subj) return;
    const subjects = [
      'Following up — Partnership Call Thursday',
      'RE: Q1 Partnership — Confirming Thursday',
      'Thursday confirmed — sending invite now',
    ];
    subj.value = subjects[Math.floor(Math.random() * subjects.length)];
    subj.style.borderColor = 'rgba(74,143,255,0.45)';
    setTimeout(() => subj.style.borderColor = '', 1000);
  }

  function ecSend() {
    const to   = document.getElementById('ec-to')?.value?.trim();
    const subj = document.getElementById('ec-subject')?.value?.trim();
    const body = document.getElementById('ec-body')?.value?.trim();
    if (!to || !subj || !body) {
      showToast('Fill in To, Subject and message first');
      return;
    }
    const btn = document.getElementById('ec-send-btn');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
    setTimeout(() => {
      closeEmailComposer();
      if (btn) { btn.textContent = 'Send'; btn.disabled = false; }
      // Clear fields
      ['ec-to','ec-subject','ec-body'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      showToast('Email sent to ' + to);
    }, 1000);
  }

  function ecScheduleSend() {
    showToast('Scheduled send — coming soon');
  }

  function ecInsertToken(token) {
    const body = document.getElementById('ec-body');
    if (!body) return;
    const pos = body.selectionStart;
    body.value = body.value.slice(0, pos) + token + body.value.slice(body.selectionEnd);
    body.focus();
    body.selectionStart = body.selectionEnd = pos + token.length;
  }

  // Tab switching
  /* ══════════════════════════════════════════════════════
     COMPANY: Edit Profile / Add Contact / Welcome Email
     ══════════════════════════════════════════════════════ */
  // Current company data (read from DOM on open)
  var _companyData = {
    name:'Legal Clear', industry:'Legal Services', website:'legalclear.co.za',
    phone:'+27 21 555 0100', phoneLabel:'Main', email:'accounts@legalclear.co.za',
    address:'Suite 4, 18 Buitenkant St, Cape Town, 8001', type:'White Label Client',
    status:'active', relationshipType:'client',
    contacts:[
      {name:'James Botha', role:'Owner / CEO', ext:'Ext 101', email:'james@legalclear.co.za', phone:'+27 82 555 0101', primary:true},
      {name:'Sarah Chen', role:'Operations Manager', ext:'Ext 102', email:'sarah@legalclear.co.za', phone:'+27 83 555 0102'},
      {name:'Pieter van der Berg', role:'Finance Director', ext:'Ext 103', email:'pieter@legalclear.co.za', phone:'+27 84 555 0103'},
      {name:'Nomsa Khumalo', role:'HR Manager', ext:'Ext 104', email:'nomsa@legalclear.co.za', phone:'+27 85 555 0104'},
      {name:'David Jacobs', role:'Senior Legal Advisor', ext:'Ext 105', email:'david@legalclear.co.za', phone:'+27 86 555 0105'},
      {name:'Fatima Essop', role:'Accounts Administrator', ext:'Ext 106', email:'fatima@legalclear.co.za', phone:'+27 87 555 0106'}
    ]
  };

  // ── Edit Profile ──
  window.openEditCompanyModal = function(){
    document.getElementById('comp-edit-name').value = _companyData.name;
    document.getElementById('comp-edit-industry').value = _companyData.industry;
    document.getElementById('comp-edit-website').value = _companyData.website;
    document.getElementById('comp-edit-reltype').value = _companyData.relationshipType||'client';
    document.getElementById('comp-edit-phone').value = _companyData.phone;
    document.getElementById('comp-edit-phone-label').value = _companyData.phoneLabel||'Main';
    document.getElementById('comp-edit-email').value = _companyData.email;
    document.getElementById('comp-edit-address').value = _companyData.address;
    document.getElementById('comp-edit-type').value = _companyData.type;
    document.getElementById('comp-edit-status').value = _companyData.status;
    document.getElementById('edit-company-overlay').classList.add('open');
  };
  window.closeEditCompanyModal = function(){
    document.getElementById('edit-company-overlay').classList.remove('open');
  };
  window.saveEditCompany = function(){
    var d = _companyData;
    d.name = document.getElementById('comp-edit-name').value||d.name;
    d.industry = document.getElementById('comp-edit-industry').value||d.industry;
    d.website = document.getElementById('comp-edit-website').value||d.website;
    d.relationshipType = document.getElementById('comp-edit-reltype').value||d.relationshipType;
    d.phone = document.getElementById('comp-edit-phone').value||d.phone;
    d.phoneLabel = document.getElementById('comp-edit-phone-label').value||d.phoneLabel;
    d.email = document.getElementById('comp-edit-email').value||d.email;
    d.address = document.getElementById('comp-edit-address').value||d.address;
    d.type = document.getElementById('comp-edit-type').value||d.type;
    d.status = document.getElementById('comp-edit-status').value||d.status;
    // Update DOM
    var nameEl = document.querySelector('#screen-company .company-name');
    if(nameEl) nameEl.textContent = d.name;
    var avatarEl = document.querySelector('#screen-company .company-avatar');
    if(avatarEl) avatarEl.textContent = d.name.split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();
    var phoneEl = document.querySelector('#screen-company .cmp-meta-pill');
    if(phoneEl) phoneEl.lastChild.textContent = ' '+d.phone;
    var emailLink = document.querySelector('#screen-company .company-meta-row2 a[href^="mailto:"]');
    if(emailLink){ emailLink.href='mailto:'+d.email; emailLink.textContent=d.email; }
    var websiteLink = document.querySelector('#screen-company .company-meta a');
    if(websiteLink) websiteLink.textContent = d.website;
    closeEditCompanyModal();
    showToast('Company profile updated successfully');
  };

  // ── Create Contact (tabbed drawer) ──
  window.openAddContactModal = function(){
    // Reset all fields across all tabs
    ['ct-add-first','ct-add-last','ct-add-role','ct-add-email','ct-add-phone','ct-add-mobile',
     'ct-add-ext','ct-add-company','ct-add-linkedin','ct-add-facebook','ct-add-twitter',
     'ct-add-instagram','ct-add-birthday','ct-add-anniversary','ct-add-spouse',
     'ct-add-interests','ct-add-notes'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.value = '';
    });
    ['ct-add-dept','ct-add-relationship','ct-add-source','ct-add-pref-comm','ct-add-language'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.value = '';
    });
    var prim = document.getElementById('ct-add-primary');
    if(prim) prim.checked = false;
    // Clear custom fields
    var cf = document.getElementById('ct-custom-fields');
    if(cf) cf.innerHTML = '';
    // Reset AI tab
    var aiRes = document.getElementById('ct-ai-results');
    var aiLoad = document.getElementById('ct-ai-loading');
    var aiBtn = document.getElementById('ct-ai-research-btn');
    var aiTarget = document.getElementById('ct-ai-target');
    if(aiRes) aiRes.style.display = 'none';
    if(aiLoad) aiLoad.style.display = 'none';
    if(aiBtn) { aiBtn.style.display = ''; aiBtn.disabled = false; }
    if(aiTarget) aiTarget.style.display = 'none';
    // Reset to first tab
    switchContactTab('basic');
    document.getElementById('add-contact-overlay').classList.add('open');
  };

  window.closeAddContactModal = function(){
    document.getElementById('add-contact-overlay').classList.remove('open');
  };

  window.switchContactTab = function(tabId, btn){
    // Toggle panels
    document.querySelectorAll('.ct-tab-panel').forEach(function(p){ p.classList.remove('active'); });
    var panel = document.getElementById('ct-tab-'+tabId);
    if(panel) panel.classList.add('active');
    // Toggle tab buttons
    document.querySelectorAll('.ct-tab').forEach(function(t){ t.classList.remove('active'); });
    if(btn){ btn.classList.add('active'); }
    else {
      var tabs = document.querySelectorAll('.ct-tab');
      var idx = {basic:0,social:1,notes:2,ai:3}[tabId]||0;
      if(tabs[idx]) tabs[idx].classList.add('active');
    }
    // If switching to AI tab, update target name
    if(tabId === 'ai'){
      var f = (document.getElementById('ct-add-first').value||'').trim();
      var l = (document.getElementById('ct-add-last').value||'').trim();
      var co = (document.getElementById('ct-add-company').value||'').trim();
      var tgt = document.getElementById('ct-ai-target');
      var tgtName = document.getElementById('ct-ai-target-name');
      var tgtCo = document.getElementById('ct-ai-target-company');
      if(f || l){
        tgt.style.display = '';
        tgtName.textContent = (f+' '+l).trim();
        tgtCo.textContent = co || 'Unknown company';
      } else {
        tgt.style.display = 'none';
      }
    }
  };

  // Custom fields
  window.addCustomField = function(){
    var container = document.getElementById('ct-custom-fields');
    var count = container.querySelectorAll('.ct-custom-row').length;
    if(count >= 5){ showToast('Maximum 5 custom fields allowed'); return; }
    var row = document.createElement('div');
    row.className = 'ct-custom-row';
    row.innerHTML = '<input class="field-input" placeholder="Field name" data-cf="label">'+
      '<input class="field-input" placeholder="Value" data-cf="value">'+
      '<button class="ct-custom-remove" onclick="removeCustomField(this)" title="Remove">&times;</button>';
    container.appendChild(row);
  };
  window.removeCustomField = function(btn){
    btn.closest('.ct-custom-row').remove();
  };

  // AI Research simulation
  window.runContactAIResearch = function(){
    var f = (document.getElementById('ct-add-first').value||'').trim();
    var l = (document.getElementById('ct-add-last').value||'').trim();
    if(!f && !l){ showToast('Enter a name in Basic Info first, so AI knows who to research'); return; }
    var fullName = (f+' '+l).trim();

    var btn = document.getElementById('ct-ai-research-btn');
    var loading = document.getElementById('ct-ai-loading');
    var results = document.getElementById('ct-ai-results');
    var loadName = document.getElementById('ct-ai-loading-name');

    btn.style.display = 'none';
    results.style.display = 'none';
    loading.style.display = '';
    loadName.textContent = fullName;

    // Animate steps
    var steps = ['ct-ai-s1','ct-ai-s2','ct-ai-s3','ct-ai-s4'];
    steps.forEach(function(s){ var el = document.getElementById(s); el.className = 'ct-ai-step'; });

    steps.forEach(function(sId, i){
      setTimeout(function(){
        // Mark previous as done
        if(i > 0) document.getElementById(steps[i-1]).className = 'ct-ai-step done';
        document.getElementById(sId).className = 'ct-ai-step active';
      }, i * 600);
    });

    // Show results after animation
    setTimeout(function(){
      document.getElementById(steps[3]).className = 'ct-ai-step done';
      loading.style.display = 'none';
      results.style.display = '';
    }, 2800);
  };

  // Use AI insights → copy to Notes
  window.useAIInsights = function(){
    var summary = document.getElementById('ct-ai-summary').textContent.trim();
    var linkedin = document.getElementById('ct-ai-linkedin').textContent.trim();
    var signals = document.getElementById('ct-ai-signals').textContent.trim();
    var combined = '--- AI Research Summary ---\n'+summary+'\n\n--- LinkedIn ---\n'+linkedin+'\n\n--- Signals ---\n'+signals;
    var notes = document.getElementById('ct-add-notes');
    notes.value = (notes.value ? notes.value+'\n\n' : '') + combined;
    switchContactTab('notes');
    showToast('AI insights added to Notes');
  };

  window.saveAddContact = function(){
    var first = document.getElementById('ct-add-first').value.trim();
    var last = document.getElementById('ct-add-last').value.trim();
    if(!first||!last){ showToast('First and last name are required'); switchContactTab('basic'); return; }
    var role = document.getElementById('ct-add-role').value.trim()||'Contact';
    var dept = document.getElementById('ct-add-dept').value;
    var email = document.getElementById('ct-add-email').value.trim();
    var phone = document.getElementById('ct-add-phone').value.trim();
    var ext = document.getElementById('ct-add-ext').value.trim();
    var isPrimary = document.getElementById('ct-add-primary').checked;
    var fullName = first+' '+last;
    var initials = (first[0]+(last[0]||'')).toUpperCase();
    var colors = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6'];
    var color = colors[(_companyData.contacts||[]).length % colors.length];

    var contact = {name:fullName, role:role, ext:ext, email:email, phone:phone, primary:isPrimary,
      company: document.getElementById('ct-add-company').value.trim(),
      relationship: document.getElementById('ct-add-relationship').value,
      source: document.getElementById('ct-add-source').value,
      mobile: document.getElementById('ct-add-mobile').value.trim(),
      linkedin: document.getElementById('ct-add-linkedin').value.trim(),
      facebook: document.getElementById('ct-add-facebook').value.trim(),
      twitter: document.getElementById('ct-add-twitter').value.trim(),
      instagram: document.getElementById('ct-add-instagram').value.trim(),
      birthday: document.getElementById('ct-add-birthday').value,
      anniversary: document.getElementById('ct-add-anniversary').value,
      spouse: document.getElementById('ct-add-spouse').value.trim(),
      prefComm: document.getElementById('ct-add-pref-comm').value,
      language: document.getElementById('ct-add-language').value,
      interests: document.getElementById('ct-add-interests').value.trim(),
      notes: document.getElementById('ct-add-notes').value.trim()
    };

    // Collect custom fields
    contact.customFields = [];
    document.querySelectorAll('.ct-custom-row').forEach(function(row){
      var lbl = row.querySelector('[data-cf="label"]').value.trim();
      var val = row.querySelector('[data-cf="value"]').value.trim();
      if(lbl && val) contact.customFields.push({label:lbl, value:val});
    });

    if(_companyData.contacts) _companyData.contacts.push(contact);

    // Add card to contact grid (company screen)
    var grid = document.querySelector('#screen-company .cc-grid');
    if(grid){
      var card = document.createElement('div');
      card.className = 'cc-card'+(isPrimary?' is-main':'');
      card.innerHTML = '<div class="cc-top"><div class="cc-avatar" style="background:'+color+'">'+initials+'</div>'+
        '<div class="cc-name-block"><div class="cc-name">'+fullName+(isPrimary?' <span class="cc-star">★</span>':'')+'</div>'+
        '<span class="cc-role">'+role+(ext?' · '+ext:'')+'</span></div></div>'+
        '<div class="cc-links">'+(email?'<a class="mcs-lnk" href="mailto:'+email+'"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Email</a>':'')+
        (phone?'<a class="mcs-lnk" href="tel:'+phone.replace(/\s/g,'')+'"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> Call</a>':'')+
        '</div>';
      grid.appendChild(card);
    }

    // Update contact count
    var countBadge = document.querySelector('#screen-company .ct-count-badge');
    if(countBadge) countBadge.textContent = (_companyData.contacts||[]).length+' contacts';
    var chipCount = document.querySelector('#screen-company .cmp-contacts-chip');
    if(chipCount){ var txt = chipCount.querySelector('svg'); chipCount.innerHTML = ''; if(txt) chipCount.appendChild(txt); chipCount.appendChild(document.createTextNode(' '+(_companyData.contacts||[]).length+' Contacts')); }

    closeAddContactModal();
    showToast('Contact "'+fullName+'" created successfully');
  };

  // ── Welcome Email ──
  window.openWelcomeEmailModal = function(){
    // Populate recipient dropdown
    var sel = document.getElementById('we-recipient');
    sel.innerHTML = '<option value="">Select contact...</option>';
    _companyData.contacts.forEach(function(c){
      sel.innerHTML += '<option value="'+c.email+'">'+c.name+' ('+c.role+')'+(c.email?' — '+c.email:'')+'</option>';
    });
    if(_companyData.contacts.length) sel.value = _companyData.contacts[0].email||'';
    updateWelcomeTemplate();
    document.getElementById('welcome-email-overlay').classList.add('open');
  };
  window.closeWelcomeEmailModal = function(){
    document.getElementById('welcome-email-overlay').classList.remove('open');
  };
  window.updateWelcomeTemplate = function(){
    var tpl = document.getElementById('we-template').value;
    var primary = _companyData.contacts.find(function(c){return c.primary;})||_companyData.contacts[0]||{name:'there'};
    var firstName = primary.name.split(' ')[0];
    var subjects = {
      'new-client':'Welcome to Novatrai — Let\'s Get Started!',
      'onboarding':'Your Onboarding Guide — '+_companyData.name,
      'partnership':'Partnership Welcome — Novatrai x '+_companyData.name
    };
    var bodies = {
      'new-client':'Dear '+firstName+',\n\nWelcome to Novatrai! We\'re thrilled to have '+_companyData.name+' on board as a valued client.\n\nAs your dedicated business operating system, we\'re here to streamline your people management, payroll, and client operations. Here\'s what happens next:\n\n1. Your dedicated account manager will reach out within 24 hours\n2. We\'ll schedule a quick onboarding call to set up your workspace\n3. Your team will receive login credentials via email\n\nIn the meantime, feel free to explore your dashboard and let us know if you have any questions.\n\nWarm regards,\nThe Novatrai Team',
      'onboarding':'Dear '+firstName+',\n\nWelcome aboard! This email contains everything you need to get started with Novatrai.\n\nYour workspace for '+_companyData.name+' is ready. Here\'s your quick-start guide:\n\n• Log in at app.novatrai.co.za\n• Complete your company profile\n• Invite your team members\n• Upload your first documents\n\nOur support team is available Monday-Friday, 08:00-17:00 SAST.\n\nLet\'s make great things happen!\n\nBest,\nThe Novatrai Onboarding Team',
      'partnership':'Dear '+firstName+',\n\nWe\'re excited to welcome '+_companyData.name+' as a Novatrai partner!\n\nThis partnership opens up exciting opportunities for both our organizations. As next steps:\n\n• Partner portal access will be shared within 48 hours\n• Joint go-to-market materials are being prepared\n• Your partner success manager will be in touch shortly\n\nWe look forward to a successful collaboration.\n\nKind regards,\nNovatrai Partnerships'
    };
    document.getElementById('we-subject').value = subjects[tpl]||subjects['new-client'];
    document.getElementById('we-body').value = bodies[tpl]||bodies['new-client'];
  };
  window.sendWelcomeEmail = function(){
    var recipient = document.getElementById('we-recipient').value;
    if(!recipient){ showToast('Please select a recipient'); return; }
    var subject = document.getElementById('we-subject').value;
    // Simulate sending
    closeWelcomeEmailModal();
    showToast('Welcome email sent to '+recipient);
  };

  // ── Toast notification ──
  window.showToast = window.showToast || function(msg){
    var existing = document.querySelector('.comp-toast');
    if(existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'comp-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1B2537;border:1px solid rgba(61,214,140,.3);color:#3DD68C;padding:12px 20px;border-radius:10px;font-size:13px;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,.3);animation:toast-in .3s ease;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function(){ toast.style.opacity='0'; toast.style.transition='opacity .3s'; setTimeout(function(){toast.remove();},300); },3000);
  };

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
  }

  // Folder selection
  function setFolder(el) {
    document.querySelectorAll('.folder-item').forEach(f => f.classList.remove('active'));
    el.classList.add('active');
  }

  // View toggle
  function setView(v) {
    const fv = document.getElementById('file-view');
    fv.className = 'view-' + v;
    document.getElementById('btn-list').classList.toggle('active-view', v === 'list');
    document.getElementById('btn-grid').classList.toggle('active-view', v === 'grid');
  }

  // Bulk selection
  function handleCheck() {
    const checked = document.querySelectorAll('.file-table-row input[type="checkbox"]:checked');
    const bar = document.getElementById('bulk-bar');
    const label = document.getElementById('bulk-label');
    if (checked.length > 0) {
      bar.classList.add('visible');
      label.textContent = checked.length + ' selected';
    } else {
      bar.classList.remove('visible');
    }
  }

  function toggleRow(row) {
    const cb = row.querySelector('input[type="checkbox"]');
    if (cb) { cb.checked = !cb.checked; handleCheck(); }
  }

  // Screen switching
  function switchScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + name);
    if (target) target.classList.add('active');
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    // company workspace is child of companies list — keep Companies highlighted
    const sidebarKey = name === 'company' ? 'companies' : name;
    const link = document.querySelector('.sidebar-item[data-screen="' + sidebarKey + '"]');
    if (link) link.classList.add('active');
  }

  // Highlight Companies on initial load (company workspace is default screen)
  document.addEventListener('DOMContentLoaded', function() {
    const l = document.querySelector('.sidebar-item[data-screen="companies"]');
    if (l) l.classList.add('active');
  });

  // Form tab switching
  function switchFormTab(name) {
    document.querySelectorAll('.form-tab').forEach(t => t.classList.toggle('active', t.dataset.ftab === name));
    document.querySelectorAll('.form-tab-panel').forEach(p => p.classList.toggle('active', p.id === 'ftab-' + name));
  }

  // ═══ TODOS — Dynamic Task System ═══
  var _todoFilter = 'all';
  var _todoCompanyFilter = null;
  var _todoSearch = '';

  function _getUserName(uid) {
    var u = (window.SYSTEM_USERS||[]).find(function(x){return x.id===uid;});
    return u ? u.firstName + ' ' + u.lastName : 'Unknown';
  }
  function _getUserInitials(uid) {
    var u = (window.SYSTEM_USERS||[]).find(function(x){return x.id===uid;});
    return u ? u.firstName.charAt(0) + u.lastName.charAt(0) : '??';
  }
  function _getUserGradient(uid) {
    var gradients = {
      'USR-001':'linear-gradient(135deg,#4A8FFF,#6A3FE0)',
      'USR-002':'linear-gradient(135deg,#3DD68C,#1A9E6F)',
      'USR-003':'linear-gradient(135deg,#F0A843,#D47B20)',
      'USR-004':'linear-gradient(135deg,#E06AE0,#9B3FE0)',
      'USR-005':'linear-gradient(135deg,#FF6B6B,#E04040)',
      'USR-006':'linear-gradient(135deg,#6AE0C8,#3FA8E0)',
      'USR-007':'linear-gradient(135deg,#A0A0A0,#606060)'
    };
    return gradients[uid] || 'linear-gradient(135deg,#4A8FFF,#6A3FE0)';
  }

  function _isToday(ts) {
    if (!ts) return false;
    var d = new Date(ts), now = new Date();
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
  }
  function _isOverdue(ts) {
    if (!ts) return false;
    var d = new Date(ts); d.setHours(23,59,59,999);
    return d.getTime() < Date.now();
  }
  function _formatDue(ts) {
    if (!ts) return 'No due date';
    var d = new Date(ts);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate();
  }
  function _formatDateTime(ts) {
    var d = new Date(ts);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ', ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function filterTasks(filter, companyFilter) {
    var tasks = window.TASKS_DATA || [];
    var now = Date.now();
    if (companyFilter) {
      tasks = tasks.filter(function(t){return t.company===companyFilter;});
    }
    if (_todoSearch) {
      var s = _todoSearch.toLowerCase();
      tasks = tasks.filter(function(t){return t.title.toLowerCase().indexOf(s)!==-1 || t.company.toLowerCase().indexOf(s)!==-1;});
    }
    switch(filter) {
      case 'today': return tasks.filter(function(t){return t.status!=='completed' && _isToday(t.dueDate);});
      case 'upcoming': return tasks.filter(function(t){return t.status!=='completed' && t.dueDate && !_isOverdue(t.dueDate) && !_isToday(t.dueDate);});
      case 'overdue': return tasks.filter(function(t){return t.status!=='completed' && _isOverdue(t.dueDate);});
      case 'completed': return tasks.filter(function(t){return t.status==='completed';});
      default: return tasks;
    }
  }

  function renderTodosScreen() {
    var tasks = window.TASKS_DATA || [];
    var openTasks = tasks.filter(function(t){return t.status!=='completed';});
    var completedTasks = tasks.filter(function(t){return t.status==='completed';});
    var overdueTasks = openTasks.filter(function(t){return _isOverdue(t.dueDate);});
    var todayTasks = openTasks.filter(function(t){return _isToday(t.dueDate);});
    var upcomingTasks = openTasks.filter(function(t){return t.dueDate && !_isOverdue(t.dueDate) && !_isToday(t.dueDate);});

    // Update sidebar badge
    var badge = document.querySelector('.sidebar-item[data-screen="todos"] span');
    if (badge) badge.textContent = overdueTasks.length;

    // Update rail counts
    var railCounts = {all:openTasks.length, today:todayTasks.length, upcoming:upcomingTasks.length, overdue:overdueTasks.length, completed:completedTasks.length};
    document.querySelectorAll('.todos-rail-item[data-tfilter]').forEach(function(el){
      var f = el.getAttribute('data-tfilter');
      var cnt = el.querySelector('.todos-rail-count');
      if (cnt && railCounts[f] !== undefined) cnt.textContent = railCounts[f];
    });

    // Update stats bar
    var statsHtml = '<div class="todos-stat"><span class="todos-stat-num">' + openTasks.length + '</span>&nbsp;Open</div>' +
      '<div class="todos-stat-sep"></div><div class="todos-stat"><span class="todos-stat-num danger">' + overdueTasks.length + '</span>&nbsp;Overdue</div>' +
      '<div class="todos-stat-sep"></div><div class="todos-stat"><span class="todos-stat-num warn">' + todayTasks.length + '</span>&nbsp;Due today</div>' +
      '<div class="todos-stat-sep"></div><div class="todos-stat"><span class="todos-stat-num success">' + completedTasks.length + '</span>&nbsp;Completed</div>';
    var statsBar = document.querySelector('.todos-stats-bar');
    if (statsBar) statsBar.innerHTML = statsHtml;

    // Update project counts
    var companies = {};
    tasks.forEach(function(t){ if(t.status!=='completed') companies[t.company] = (companies[t.company]||0) + 1; });

    // Get filtered tasks
    var filtered = filterTasks(_todoFilter, _todoCompanyFilter);

    // Render task groups
    var content = document.querySelector('.todos-content');
    if (!content) return;
    var html = '';

    if (_todoFilter === 'completed') {
      html += renderTaskGroup('Completed', 'var(--success)', filtered, true, true);
    } else if (_todoFilter === 'all' && !_todoCompanyFilter) {
      var high = filtered.filter(function(t){return t.priority==='high' && t.status!=='completed';});
      var med = filtered.filter(function(t){return t.priority==='medium' && t.status!=='completed';});
      var low = filtered.filter(function(t){return t.priority==='low' && t.status!=='completed';});
      var done = filtered.filter(function(t){return t.status==='completed';});
      html += renderTaskGroup('High Priority', 'var(--danger)', high, true, false);
      html += renderTaskGroup('Medium Priority', 'var(--warning)', med, true, false);
      html += renderTaskGroup('Low Priority', '#5A7080', low, false, false);
      if (done.length) html += renderTaskGroup('Completed', 'var(--success)', done, false, true);
    } else {
      html += renderTaskGroup(_todoFilter.charAt(0).toUpperCase()+_todoFilter.slice(1) + ' Tasks', 'var(--accent)', filtered, true, _todoFilter==='completed');
    }
    content.innerHTML = html;

    // Update dashboard tasks today count
    var dbTasks = document.getElementById('db-greet-tasks');
    if (dbTasks) dbTasks.textContent = todayTasks.length;
  }

  function renderTaskGroup(name, dotColor, tasks, startOpen, isCompleted) {
    if (!tasks.length && !isCompleted) return '';
    var html = '<div class="task-group">';
    html += '<div class="task-group-header" onclick="toggleTaskGroup(this)">';
    html += '<svg class="task-group-chevron' + (startOpen?' open':'') + '" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';
    html += '<span class="task-group-dot" style="background:'+dotColor+'"></span>';
    html += '<span class="task-group-name">' + name + '</span>';
    html += '<span class="task-group-count">' + tasks.length + '</span>';
    html += '</div>';
    html += '<div class="task-group-body' + (startOpen?' open':'') + '">';
    tasks.forEach(function(t) {
      var dueClass = '', dueText = _formatDue(t.dueDate);
      if (isCompleted || t.status === 'completed') {
        dueClass = '';
        dueText = 'Done ' + _formatDue(t.completedAt);
      } else if (_isOverdue(t.dueDate)) {
        dueClass = ' overdue'; dueText += ' · overdue';
      } else if (_isToday(t.dueDate)) {
        dueClass = ' today'; dueText = 'Today';
      }
      var isDone = t.status === 'completed';
      html += '<div class="task-row" onclick="openTaskDetail(\''+t.id+'\')">';
      html += '<div class="task-check' + (isDone?' done':'') + '" onclick="quickToggleTask(\''+t.id+'\',event)"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div>';
      var prioColor = t.priority==='high'?'var(--danger)':t.priority==='medium'?'var(--warning)':'#5A7080';
      if (isDone) prioColor = 'var(--success)';
      html += '<span class="task-priority-dot" style="background:'+prioColor+'"></span>';
      html += '<span class="task-title' + (isDone?' done':'') + '">' + t.title + '</span>';
      html += '<span class="task-co-tag">' + t.company + '</span>';
      html += '<span class="task-due' + dueClass + '"' + (isDone?' style="color:var(--success)"':'') + '>' + dueText + '</span>';
      html += '<div class="task-avatar" style="background:'+_getUserGradient(t.assignedTo)+'">' + _getUserInitials(t.assignedTo) + '</div>';
      html += '<div class="task-row-actions">';
      if (!isDone) {
        html += '<div class="task-row-btn" onclick="openTaskDetail(\''+t.id+'\');event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></div>';
      }
      html += '<div class="task-row-btn" onclick="event.stopPropagation()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg></div>';
      html += '</div></div>';
    });
    if (!isCompleted) {
      html += '<div class="task-add-row" onclick="openAddTaskModal()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>Add task</div>';
    }
    html += '</div></div>';
    return html;
  }

  function switchTodoFilter(el, name) {
    _todoFilter = name;
    _todoCompanyFilter = null;
    document.querySelectorAll('.todos-ftab').forEach(function(t){t.classList.remove('active');});
    el.classList.add('active');
    document.querySelectorAll('.todos-rail-item').forEach(function(i){i.classList.remove('active');});
    var ri = document.querySelector('.todos-rail-item[data-tfilter="'+name+'"]');
    if (ri) ri.classList.add('active');
    renderTodosScreen();
  }
  function switchTodoRail(el, name) {
    _todoFilter = name;
    _todoCompanyFilter = null;
    document.querySelectorAll('.todos-rail-item').forEach(function(i){i.classList.remove('active');});
    el.classList.add('active');
    document.querySelectorAll('.todos-ftab').forEach(function(t){t.classList.remove('active');});
    var ft = document.querySelector('.todos-ftab[data-tfilter="'+name+'"]');
    if (ft) ft.classList.add('active');
    renderTodosScreen();
  }
  function toggleTaskGroup(el) {
    var chevron = el.querySelector('.task-group-chevron');
    var body = el.nextElementSibling;
    chevron.classList.toggle('open');
    body.classList.toggle('open');
  }
  function quickToggleTask(taskId, event) {
    event.stopPropagation();
    var t = (window.TASKS_DATA||[]).find(function(x){return x.id===taskId;});
    if (!t) return;
    if (t.status === 'completed') {
      t.status = 'open'; t.completedAt = null;
      t.history.push({action:'reopened',by:'USR-003',at:Date.now(),detail:'Task reopened'});
    } else {
      t.status = 'completed'; t.completedAt = Date.now();
      t.history.push({action:'completed',by:'USR-003',at:Date.now(),detail:'Marked as completed'});
    }
    renderTodosScreen();
  }

  // ═══ Add Task Modal ═══
  function openAddTaskModal(companyName) {
    var sel = document.getElementById('task-add-assignee');
    sel.innerHTML = '<option value="">Select team member…</option>';
    (window.SYSTEM_USERS||[]).forEach(function(u){
      if (u.status !== 'active' && u.status !== 'invited') return;
      sel.innerHTML += '<option value="'+u.id+'">'+u.firstName+' '+u.lastName+' ('+u.role+')</option>';
    });
    document.getElementById('task-add-title').value = '';
    document.getElementById('task-add-desc').value = '';
    document.getElementById('task-add-company').value = companyName || '';
    document.getElementById('task-add-contact').value = '';
    document.getElementById('task-add-priority').value = 'medium';
    document.getElementById('task-add-due').value = '';
    document.getElementById('add-task-overlay').classList.add('open');
  }
  function closeAddTaskModal() {
    document.getElementById('add-task-overlay').classList.remove('open');
  }
  function saveNewTask() {
    var title = document.getElementById('task-add-title').value.trim();
    var assignee = document.getElementById('task-add-assignee').value;
    if (!title) { alert('Please enter a task title.'); return; }
    if (!assignee) { alert('Please select a team member to assign this task.'); return; }
    var due = document.getElementById('task-add-due').value;
    var task = {
      id: 'TSK-' + String(window._taskIdCounter++).padStart(3,'0'),
      title: title,
      description: document.getElementById('task-add-desc').value.trim(),
      company: document.getElementById('task-add-company').value.trim() || 'General',
      contactName: document.getElementById('task-add-contact').value.trim(),
      priority: document.getElementById('task-add-priority').value,
      status: 'open',
      assignedTo: assignee,
      assignedBy: 'USR-003',
      dueDate: due ? new Date(due).getTime() : null,
      createdAt: Date.now(),
      completedAt: null,
      notes: [],
      history: [{action:'created',by:'USR-003',at:Date.now(),detail:'Task created and assigned to '+_getUserName(assignee)}]
    };
    window.TASKS_DATA.push(task);
    closeAddTaskModal();
    renderTodosScreen();
    _addTaskToConvTimeline('Task created', task.title, 'Assigned to ' + _getUserName(assignee) + (due ? ' · Due ' + _formatDue(task.dueDate) : ''), task.priority);
    _showToast('Task assigned to ' + _getUserName(assignee));
  }

  // ═══ Insert task event into Conversation timeline ═══
  function _addTaskToConvTimeline(action, title, detail, priority) {
    var timeline = document.getElementById('conv-timeline');
    if (!timeline) return;
    var now = new Date();
    var hours = String(now.getHours()).padStart(2,'0');
    var mins = String(now.getMinutes()).padStart(2,'0');
    var prioLabel = priority ? ' <span class="task-priority-badge '+priority+'" style="font-size:9px;padding:1px 6px;vertical-align:middle;">'+priority+'</span>' : '';
    var entryHtml = '<div class="conv-entry" data-ch="task" style="animation:fadeIn 0.3s ease">' +
      '<div class="conv-entry-left"><div class="conv-ch-icon task">' +
      '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>' +
      '</div><div class="conv-entry-connector"></div></div>' +
      '<div class="conv-entry-body">' +
      '<div class="conv-entry-header">' +
      '<span class="conv-entry-contact">Fritz (You)</span>' +
      '<span class="conv-entry-channel task">Task</span>' +
      '<span class="conv-entry-time">Just now · ' + hours + ':' + mins + '</span>' +
      '</div>' +
      '<div class="conv-entry-subject">' + action + ': ' + title + prioLabel + '</div>' +
      '<div class="conv-entry-preview">' + detail + '</div>' +
      '</div></div>';
    // Insert at the top of the first date group (Today)
    var firstGroup = timeline.querySelector('.conv-date-group');
    if (firstGroup) {
      var label = firstGroup.querySelector('.conv-date-label');
      if (label) {
        label.insertAdjacentHTML('afterend', entryHtml);
      } else {
        firstGroup.insertAdjacentHTML('afterbegin', entryHtml);
      }
    }
  }

  // ═══ Task Detail Modal ═══
  var _currentTaskId = null;
  function openTaskDetail(taskId) {
    var t = (window.TASKS_DATA||[]).find(function(x){return x.id===taskId;});
    if (!t) return;
    _currentTaskId = taskId;
    document.getElementById('td-title').textContent = t.title;
    var pb = document.getElementById('td-priority-badge');
    pb.textContent = t.priority; pb.className = 'task-priority-badge ' + t.priority;
    var sp = document.getElementById('td-status-pill');
    sp.textContent = t.status === 'completed' ? 'Completed' : 'Open';
    sp.className = 'task-status-pill ' + (t.status==='completed'?'completed':'open');
    renderTaskDetailBody(t);
    document.getElementById('task-detail-overlay').classList.add('open');
  }
  function closeTaskDetail() {
    document.getElementById('task-detail-overlay').classList.remove('open');
    _currentTaskId = null;
  }
  function renderTaskDetailBody(t) {
    var html = '';
    // Description
    if (t.description) {
      html += '<div class="task-detail-desc">' + t.description + '</div>';
    }
    // Info grid
    html += '<div class="task-detail-grid">';
    html += '<div class="task-detail-field"><label>Company</label><span>' + t.company + '</span></div>';
    if (t.contactName) html += '<div class="task-detail-field"><label>Contact</label><span>' + t.contactName + '</span></div>';
    html += '<div class="task-detail-field"><label>Assigned To</label><span>' + _getUserName(t.assignedTo) + '</span></div>';
    html += '<div class="task-detail-field"><label>Assigned By</label><span>' + _getUserName(t.assignedBy) + '</span></div>';
    html += '<div class="task-detail-field"><label>Created</label><span>' + _formatDateTime(t.createdAt) + '</span></div>';
    html += '<div class="task-detail-field"><label>Due Date</label><span>' + (t.dueDate ? _formatDateTime(t.dueDate) : 'No due date') + '</span></div>';
    if (t.completedAt) html += '<div class="task-detail-field"><label>Completed</label><span style="color:var(--success)">' + _formatDateTime(t.completedAt) + '</span></div>';
    html += '</div>';

    // Action bar
    if (t.status !== 'completed') {
      html += '<div class="task-action-bar">';
      html += '<button class="task-action-btn complete" onclick="completeTask()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Mark Complete</button>';
      html += '<button class="task-action-btn" onclick="showAddNoteForm()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Add Note</button>';
      html += '<button class="task-action-btn" onclick="showReassignForm()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>Reassign</button>';
      html += '</div>';
    } else {
      html += '<div class="task-action-bar">';
      html += '<button class="task-action-btn" onclick="reopenTask()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Reopen Task</button>';
      html += '<button class="task-action-btn" onclick="showAddNoteForm()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Add Note</button>';
      html += '</div>';
    }

    // Inline forms area
    html += '<div id="td-inline-area"></div>';

    // Notes section
    if (t.notes.length) {
      html += '<div class="task-detail-section"><div class="task-detail-section-title">Notes (' + t.notes.length + ')</div>';
      t.notes.slice().reverse().forEach(function(n){
        html += '<div class="task-note-item"><div class="note-header"><span class="note-author">' + _getUserName(n.by) + '</span><span class="note-time">' + _formatDateTime(n.at) + '</span></div><div class="note-text">' + n.text + '</div></div>';
      });
      html += '</div>';
    }

    // History section
    if (t.history.length) {
      html += '<div class="task-detail-section"><div class="task-detail-section-title">Activity</div>';
      t.history.slice().reverse().forEach(function(h){
        html += '<div class="task-history-item"><div class="history-dot"></div><div class="history-text"><strong>' + _getUserName(h.by||'USR-003') + '</strong> ' + h.detail + '<br><span style="font-size:10px;color:#4A5568">' + _formatDateTime(h.at) + '</span></div></div>';
      });
      html += '</div>';
    }

    document.getElementById('td-body').innerHTML = html;
  }

  function completeTask() {
    var t = (window.TASKS_DATA||[]).find(function(x){return x.id===_currentTaskId;});
    if (!t) return;
    t.status = 'completed'; t.completedAt = Date.now();
    t.history.push({action:'completed',by:'USR-003',at:Date.now(),detail:'Marked as completed'});
    _showToast('Task completed');
    _addTaskToConvTimeline('Task completed', t.title, 'Completed by Fritz Erasmus', null);
    renderTaskDetailBody(t);
    document.getElementById('td-status-pill').textContent = 'Completed';
    document.getElementById('td-status-pill').className = 'task-status-pill completed';
    renderTodosScreen();
  }
  function reopenTask() {
    var t = (window.TASKS_DATA||[]).find(function(x){return x.id===_currentTaskId;});
    if (!t) return;
    t.status = 'open'; t.completedAt = null;
    t.history.push({action:'reopened',by:'USR-003',at:Date.now(),detail:'Task reopened'});
    _showToast('Task reopened');
    renderTaskDetailBody(t);
    document.getElementById('td-status-pill').textContent = 'Open';
    document.getElementById('td-status-pill').className = 'task-status-pill open';
    renderTodosScreen();
  }
  function showAddNoteForm() {
    var area = document.getElementById('td-inline-area');
    area.innerHTML = '<div class="task-inline-form"><textarea id="td-note-text" placeholder="Add a note…"></textarea><div class="inline-actions"><button class="btn btn-outline" style="height:28px;font-size:11px;padding:0 10px;" onclick="cancelInlineForm()">Cancel</button><button class="btn btn-primary" style="height:28px;font-size:11px;padding:0 10px;" onclick="saveTaskNote()">Save Note</button></div></div>';
    document.getElementById('td-note-text').focus();
  }
  function showReassignForm() {
    var t = (window.TASKS_DATA||[]).find(function(x){return x.id===_currentTaskId;});
    if (!t) return;
    var html = '<div class="task-inline-form"><label style="font-size:11px;font-weight:600;color:#5A7080;text-transform:uppercase;letter-spacing:0.05em;">Reassign to:</label><select class="task-reassign-dropdown" id="td-reassign-user">';
    (window.SYSTEM_USERS||[]).forEach(function(u){
      if (u.status !== 'active' && u.status !== 'invited') return;
      if (u.id === t.assignedTo) return;
      html += '<option value="'+u.id+'">'+u.firstName+' '+u.lastName+' ('+u.role+')</option>';
    });
    html += '</select><textarea id="td-reassign-note" class="task-reassign-dropdown" style="min-height:50px;margin-top:6px;resize:vertical;" placeholder="Reason for reassignment (optional)"></textarea>';
    html += '<div class="inline-actions"><button class="btn btn-outline" style="height:28px;font-size:11px;padding:0 10px;" onclick="cancelInlineForm()">Cancel</button><button class="btn btn-primary" style="height:28px;font-size:11px;padding:0 10px;" onclick="saveReassign()">Reassign</button></div></div>';
    document.getElementById('td-inline-area').innerHTML = html;
  }
  function cancelInlineForm() {
    document.getElementById('td-inline-area').innerHTML = '';
  }
  function saveTaskNote() {
    var t = (window.TASKS_DATA||[]).find(function(x){return x.id===_currentTaskId;});
    if (!t) return;
    var text = document.getElementById('td-note-text').value.trim();
    if (!text) { alert('Please enter a note.'); return; }
    t.notes.push({text:text,by:'USR-003',at:Date.now()});
    t.history.push({action:'note',by:'USR-003',at:Date.now(),detail:'Added a note'});
    _showToast('Note added');
    renderTaskDetailBody(t);
  }
  function saveReassign() {
    var t = (window.TASKS_DATA||[]).find(function(x){return x.id===_currentTaskId;});
    if (!t) return;
    var newUser = document.getElementById('td-reassign-user').value;
    if (!newUser) return;
    var note = (document.getElementById('td-reassign-note')||{}).value || '';
    var oldUser = t.assignedTo;
    t.assignedTo = newUser;
    var detail = 'Reassigned from ' + _getUserName(oldUser) + ' to ' + _getUserName(newUser);
    if (note) detail += ' — ' + note;
    t.history.push({action:'reassigned',by:'USR-003',at:Date.now(),from:oldUser,to:newUser,detail:detail});
    if (note) t.notes.push({text:'Reassignment note: ' + note,by:'USR-003',at:Date.now()});
    _showToast('Task reassigned to ' + _getUserName(newUser));
    _addTaskToConvTimeline('Task reassigned', t.title, detail, null);
    renderTaskDetailBody(t);
    renderTodosScreen();
  }

  // Wire up "New Task" button and search on page load
  document.addEventListener('DOMContentLoaded', function(){
    // Wire New Task button
    var newBtn = document.querySelector('#screen-todos .todos-topbar .btn-primary');
    if (newBtn) newBtn.onclick = function(){ openAddTaskModal(); };
    // Wire search
    var searchInput = document.querySelector('.todos-search-box input');
    if (searchInput) {
      searchInput.addEventListener('input', function(){
        _todoSearch = this.value.trim();
        renderTodosScreen();
      });
    }
    // Initial render
    renderTodosScreen();
  });

  // Toggle interactions
  function toggleSwitch(el) { el.classList.toggle('on'); }
  function toggleRowSwitch(el, e) { e.stopPropagation(); el.classList.toggle('off'); }

  // Mail interactions
  function openMail(el) {
    document.querySelectorAll('.mail-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    el.classList.remove('unread');
    el.querySelector('.mail-unread-dot') && (el.querySelector('.mail-unread-dot').style.display = 'none');
  }
  function setMailFolder(el) {
    document.querySelectorAll('.mail-folder').forEach(f => f.classList.remove('active'));
    el.classList.add('active');
  }
  function openCompose() { document.getElementById('compose-overlay').classList.add('open'); }
  function closeCompose() { document.getElementById('compose-overlay').classList.remove('open'); }

  /* ══ DASHBOARD ══════════════════════════════════════════ */
  /* ── Quote of the Day ── */
  const _QUOTES = [
    { q: 'The secret of getting ahead is getting started.', a: 'Mark Twain' },
    { q: 'Success is not the key to happiness. Happiness is the key to success.', a: 'Albert Schweitzer' },
    { q: 'Do not wait to strike till the iron is hot; but make it hot by striking.', a: 'William Butler Yeats' },
    { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
    { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
    { q: 'In the middle of every difficulty lies opportunity.', a: 'Albert Einstein' },
    { q: 'Efforts and courage are not enough without purpose and direction.', a: 'John F. Kennedy' },
    { q: 'Quality is not an act, it is a habit.', a: 'Aristotle' },
    { q: "Your time is limited, so don't waste it living someone else's life.", a: "Steve Jobs" },
    { q: 'The best investment you can make is in yourself.', a: 'Warren Buffett' },
    { q: 'Price is what you pay. Value is what you get.', a: 'Warren Buffett' },
    { q: 'Risk comes from not knowing what you are doing.', a: 'Warren Buffett' },
    { q: 'Without continual growth and progress, such words as improvement mean nothing.', a: 'Benjamin Franklin' },
    { q: 'To win without risk is to triumph without glory.', a: 'Pierre Corneille' },
    { q: 'If you are not willing to risk the usual, you will have to settle for the ordinary.', a: 'Jim Rohn' },
    { q: 'The entrepreneur always searches for change, responds to it, and exploits it as an opportunity.', a: 'Peter Drucker' },
    { q: "Business opportunities are like buses — there's always another one coming.", a: "Richard Branson" },
    { q: 'A satisfied customer is the best business strategy of all.', a: 'Michael LeBoeuf' },
    { q: 'The secret to successful hiring is to look for people who want to change the world.', a: 'Marc Benioff' },
    { q: 'Formal education will make you a living; self-education will make you a fortune.', a: 'Jim Rohn' },
    { q: "Don't find customers for your products; find products for your customers.", a: "Seth Godin" },
    { q: 'There are no secrets to success — it is the result of preparation, hard work, and learning from failure.', a: 'Colin Powell' },
    { q: 'Chase the vision, not the money. The money will end up following you.', a: 'Tony Hsieh' },
    { q: 'Every problem is a gift — without problems we would not grow.', a: 'Anthony Robbins' },
    { q: 'The way to get started is to quit talking and begin doing.', a: 'Walt Disney' },
    { q: 'Innovation distinguishes between a leader and a follower.', a: 'Steve Jobs' },
    { q: "It always seems impossible until it's done.", a: "Nelson Mandela" },
    { q: 'Real estate cannot be lost or stolen, nor can it be carried away.', a: 'Franklin D. Roosevelt' },
    { q: "Buy land — they're not making any more of it.", a: "Mark Twain" },
    { q: 'Ninety percent of all millionaires become so through owning real estate.', a: 'Andrew Carnegie' },
    { q: 'The best time to plant a tree was 20 years ago. The second best time is now.', a: 'Chinese Proverb' },
  ];

  function initQotd() {
    const el = document.getElementById('db-qotd');
    const attrEl = document.getElementById('db-qotd-attr');
    if (!el) return;
    // Deterministic by day-of-year so it changes daily but is same all day
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    const q = _QUOTES[dayOfYear % _QUOTES.length];
    el.textContent = q.q;
    if (attrEl) attrEl.textContent = '— ' + q.a;
  }

  /* ── News Digest data ── */
  const _NEWS_DATA = {
    realestate: [
      { badge:'local',  label:'SA Market',    time:'1h ago',   headline:'Cape Town office-to-residential conversions accelerate as hybrid work reshapes demand',        summary:"Conversion pipeline up 34% YoY as developers chase Cape Town's rental shortage. Permits approved faster under new zoning amendments." },
      { badge:'local',  label:'SA Market',    time:'3h ago',   headline:'Sectional title levies under scrutiny — NAMA calls for national cap framework',               summary:'Body corporates facing double-digit levy increases amid rising insurance costs. NAMA proposes capped escalation linked to CPI.' },
      { badge:'intl',   label:'Global',       time:'5h ago',   headline:'US Fed signals two further rate cuts — mortgage markets respond with 6-month low on 30-year fixed', summary:'30-year fixed rate hits 6.4%, its lowest since Aug 2023. Housing inventory still historically tight despite improved affordability.' },
      { badge:'market', label:'Trend',        time:'8h ago',   headline:'SA residential asking prices up 4.1% YoY — Western Cape leads at 6.8%, Gauteng trails at 2.2%', summary:'Lightstone data confirms a two-speed market. Sub-R2M segment outperforms as first-time buyers stretch affordability limits.' },
      { badge:'intl',   label:'Global',       time:'Yesterday',headline:'Dubai residential transactions hit AED 141bn in 2025 — off-plan sales now 58% of total market', summary:'Foreign investment from Indian, British, and Russian buyers continues to dominate. Oversupply concerns emerging in Marina corridor.' },
      { badge:'local',  label:'Regulation',   time:'Yesterday',headline:'Property Practitioners Act: BEE compliance deadline extended to Q3 2026 — PPRA circular',      summary:'Practitioners have additional 6 months to achieve compliance. Mandatory CPD hours remain unchanged.' },
      { badge:'market', label:'Commercial',   time:'2d ago',   headline:'Sandton vacancy rate drops to 11.2% — best since 2018 as return-to-office gains traction',      summary:'A-grade nodes tighten fastest. Analysts flag Rosebank and Waterfall as undersupplied heading into 2026.' },
    ],
    legal: [
      { badge:'legal',  label:'SA Law',       time:'2h ago',   headline:'Constitutional Court rules on POPIA enforcement — personal data liability extends to processors',  summary:'Landmark ruling expands data controller liability. Processors now jointly responsible for breaches. ICO fines expected to rise.' },
      { badge:'local',  label:'Regulation',   time:'4h ago',   headline:'Companies Act amendments: new beneficial ownership register goes live March 2026',               summary:'CIPC portal now open for BEO declarations. Non-compliance penalties up to R10M or imprisonment. 90-day grace period applies.' },
      { badge:'intl',   label:'Global',       time:'6h ago',   headline:'UK SRA flags AI-drafted contracts — calls for mandatory human review before execution',          summary:'Guidance stops short of prohibition but signals regulatory intent. South African Law Society expected to follow with parallel guidance.' },
      { badge:'legal',  label:'Tax',          time:'Yesterday',headline:'SARS transfer pricing audits intensify — 47 multinationals under investigation in Q1 2026',      summary:"SARS signals focus on management fee arrangements and IP royalties. Arm's-length documentation now critical for all related-party transactions." },
      { badge:'market', label:'M&A',          time:'Yesterday',headline:'PE deal activity recovers: mid-market M&A up 22% in SADC region — legal due diligence backlogs', summary:'Demand for deal counsel outpacing supply. Turnaround times on DD reports stretching to 6–8 weeks in competitive processes.' },
      { badge:'intl',   label:'ESG',          time:'2d ago',   headline:'EU Corporate Sustainability Due Diligence Directive: SA exporters face new compliance burden',   summary:'CSDDD applies to non-EU companies with EU revenue above €150M from 2027. Supply chain audits now a legal procurement requirement.' },
    ],
    finance: [
      { badge:'finance',label:'Markets',      time:'1h ago',   headline:'JSE All Share up 1.2% as rand strengthens on better-than-expected CPI print of 4.8%',           summary:'Inflation surprise boosts rate-cut expectations. Resources and banks led gains. Naspers weighed after Tencent guidance miss.' },
      { badge:'intl',   label:'Global',       time:'3h ago',   headline:'IMF upgrades SA growth forecast to 1.8% for 2026 — infrastructure spend and mining recovery cited', summary:'Upgrade conditional on Eskom grid reliability maintaining above 95%. Fiscal consolidation path described as "credible but fragile".' },
      { badge:'finance',label:'Banking',      time:'5h ago',   headline:'SARB holds repo rate at 7.5% — MPC unanimous, signals data-dependent easing in H2 2026',         summary:'Statement highlights wage settlement risk and oil price volatility. Markets now pricing one 25bps cut in September.' },
      { badge:'market', label:'Wealth',       time:'Yesterday',headline:'Global HNW wealth grew 4.7% in 2025 — Africa fastest-growing region for third consecutive year', summary:'Capgemini World Wealth Report: Africa HNWI population up 6.2%. South Africa, Nigeria, and Kenya account for 68% of regional wealth.' },
      { badge:'intl',   label:'Crypto',       time:'Yesterday',headline:'Bitcoin crosses $95K as ETF inflows hit monthly record — institutional rotation accelerates',      summary:'BlackRock and Fidelity ETFs collectively absorbed $4.1bn in January. SA crypto asset service provider registrations now at 247.' },
      { badge:'finance',label:'Tax',          time:'2d ago',   headline:'National Treasury proposes CGT inclusion rate hike to 50% for individuals — Budget 2026 preview',  summary:'Proposal affects gains from March 2026. Property and equity holdings above R2M threshold most exposed. Industry pushback expected.' },
    ],
    ops: [
      { badge:'tech',   label:'AI & Ops',     time:'2h ago',   headline:'Gartner: 65% of enterprises will deploy agentic AI by 2027 — workflow automation leads adoption', summary:'Client-facing operations, document processing, and compliance monitoring cited as top deployment targets. ROI achieved within 9 months on average.' },
      { badge:'local',  label:'HR',           time:'4h ago',   headline:'NMW increases to R28.79/hour from March 2026 — hospitality and retail most exposed',              summary:'7.9% increase above CPI. Employers have 60 days to adjust payroll. Sectoral determinations for agriculture follow in April.' },
      { badge:'intl',   label:'Supply Chain', time:'6h ago',   headline:'Red Sea disruptions push container rates up 18% — SA import timelines extend by 8–12 days',       summary:'Cape of Good Hope route now standard for Asian cargo. Retailers and manufacturers advised to build 3-week buffer stocks.' },
      { badge:'tech',   label:'Cyber',        time:'Yesterday',headline:'SA NCPF 2026: mandatory incident reporting within 72 hours now enforceable under POPIA',          summary:'ICO begins enforcement from Feb 2026. Companies must have documented incident response plans. Tabletop exercises recommended quarterly.' },
      { badge:'market', label:'Procurement',  time:'Yesterday',headline:'Preferential procurement regulations gazetted — 30% local content threshold mandatory from Q2',  summary:'Affects all organs of state and SOEs above R500K. Private sector supply chains to B2G clients need compliance review.' },
      { badge:'tech',   label:'Cloud',        time:'2d ago',   headline:'AWS, Azure announce SA second availability zones — enterprise cloud redundancy now achievable locally', summary:'Dual-AZ configurations now possible entirely within SA data sovereignty boundaries. Financial services sector to benefit most from local failover.' },
    ],
  };

  /* Profile → industry mapping */
  function _newsIndustry() {
    try {
      const prof = (localStorage.getItem('novatrai_profile') || 'ceo').split(',')[0].trim().toLowerCase();
      if (prof.includes('real') || prof.includes('estate') || prof.includes('broker')) return 'realestate';
      if (prof.includes('legal') || prof.includes('law')) return 'legal';
      if (prof.includes('finance') || prof.includes('wealth') || prof.includes('invest')) return 'finance';
      return 'ops'; // default / CEO / general
    } catch(e) { return 'realestate'; }
  }

  const _INDUSTRY_META = {
    realestate: { label: 'Real Estate Digest', dot: '#3DD68C' },
    legal:      { label: 'Legal & Compliance Digest', dot: '#A78BFA' },
    finance:    { label: 'Finance & Markets Digest', dot: '#F07070' },
    ops:        { label: 'Business & Ops Digest', dot: '#4AD6C8' },
  };

  let _newsFilter = 'all';

  function renderNewsFeed(refresh) {
    const container = document.getElementById('news-list-container');
    const titleEl   = document.getElementById('news-digest-title');
    const footerEl  = document.getElementById('news-footer-meta');
    if (!container) return;

    const industry = _newsIndustry();
    const meta = _INDUSTRY_META[industry] || _INDUSTRY_META.ops;
    if (titleEl) titleEl.textContent = meta.label;

    const items = (_NEWS_DATA[industry] || []).filter(item => {
      if (_newsFilter === 'all') return true;
      return item.badge === _newsFilter;
    });

    if (refresh) {
      container.style.opacity = '0.4';
      setTimeout(() => {
        _renderNewsItems(container, items);
        container.style.opacity = '1';
        if (footerEl) footerEl.textContent = 'Curated by AI · just now';
      }, 600);
    } else {
      _renderNewsItems(container, items);
      if (footerEl) {
        const now = new Date();
        footerEl.textContent = 'Curated by AI · ' + now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      }
    }
  }

  function _renderNewsItems(container, items) {
    if (!items || items.length === 0) {
      container.innerHTML = '<div class="news-empty">No stories match this filter.</div>';
      return;
    }
    container.innerHTML = items.slice(0, 5).map((item, i) => `
      <div class="news-item" onclick="newsItemClick(${i})">
        <div class="news-item-top">
          <span class="news-badge ${item.badge}">${item.label}</span>
          <span class="news-time">${item.time}</span>
        </div>
        <div class="news-headline">${item.headline}</div>
        <div class="news-summary">${item.summary}</div>
        <span class="news-read-more">Read more →</span>
      </div>`).join('');
  }

  function newsFilter(btn, filter) {
    _newsFilter = filter;
    document.querySelectorAll('.news-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderNewsFeed(false);
  }

  function newsItemClick(idx) {
    // Placeholder — in production would open full article or external URL
    const industry = _newsIndustry();
    const item = (_NEWS_DATA[industry] || [])[idx];
    if (item) {
      if (typeof _showToast === 'function') _showToast('Opening: ' + item.headline.slice(0, 48) + '…');
    }
  }

  /* ── Greeting bar ── */
  function initGreetingBar() {
    const now = new Date();
    const hour = now.getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Personalise from localStorage profile name
    let name = 'Fritz';
    try {
      const prof = localStorage.getItem('novatrai_profile');
      if (prof) {
        const labels = { 'ceo':'Fritz', 'admin':'Admin', 'finance':'Finance', 'ops':'Ops', 'realestate_broker':'Broker', 'legal_pm':'Legal PM' };
        const key = prof.split(',')[0].trim().toLowerCase();
        name = labels[key] || name;
      }
    } catch(e) {}

    const helloEl = document.getElementById('db-greet-hello');
    const nameEl  = document.getElementById('db-greet-name');
    const dateEl  = document.getElementById('db-greet-date');
    const avatarEl = document.getElementById('db-greet-avatar');
    if (helloEl) helloEl.innerHTML = greet + ', <span id="db-greet-name">' + name + '</span>';
    if (dateEl) {
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      dateEl.textContent = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
    }
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();

    // Count unchecked tasks for today
    const pendingTasks = document.querySelectorAll('[id^="myday-task-"] .myday-check:not(.checked)').length;
    const taskCountEl = document.getElementById('db-greet-tasks');
    if (taskCountEl) taskCountEl.textContent = pendingTasks || 3;
  }

  /* ── My Day task toggle ── */
  function mydayCheck(el, rowId) {
    el.classList.toggle('checked');
    const row = document.getElementById(rowId);
    if (!row) return;
    const textEl = row.querySelector('.myday-text');
    const timeEl = row.querySelector('.myday-time');
    if (el.classList.contains('checked')) {
      if (textEl) textEl.classList.add('done');
      if (timeEl) timeEl.textContent = 'Done';
    } else {
      if (textEl) textEl.classList.remove('done');
      if (timeEl) timeEl.textContent = 'Today';
    }
    // Update greeting task count
    const pendingTasks = document.querySelectorAll('[id^="myday-task-"] .myday-check:not(.checked)').length;
    const taskCountEl = document.getElementById('db-greet-tasks');
    if (taskCountEl) taskCountEl.textContent = pendingTasks;
  }


  // Default CEO layout definition
  const DEFAULT_LAYOUT = [
    { id:'ai-briefing',     size:'w-12', active:true },
    { id:'cash-position',   size:'w-3',  active:true },
    { id:'revenue-mtd',     size:'w-3',  active:true },
    { id:'pipeline',        size:'w-3',  active:true },
    { id:'active-clients',  size:'w-3',  active:true },
    { id:'revenue-trend',   size:'w-8',  active:true },
    { id:'goal-tracker',    size:'w-4',  active:true },
    { id:'my-day',          size:'w-4',  active:true },
    { id:'collections',     size:'w-3',  active:true },
    { id:'sla-breaches',    size:'w-3',  active:true },
    { id:'attention-queue', size:'w-6',  active:true },
    { id:'sales-funnel',    size:'w-6',  active:true },
    { id:'ar-ageing',       size:'w-6',  active:true },
    { id:'ops-health',      size:'w-6',  active:true },
    { id:'activity-feed',   size:'w-6',  active:true },
    { id:'news-digest',     size:'w-6',  active:true },
  ];
  // NOTE: original DEFAULT_LAYOUT replaced by dashboard_enhance.py

  // Persist in localStorage (TODO: replace with POST /dashboard/layout)
  function loadDashboardLayout() {
    try { return JSON.parse(localStorage.getItem('cf_dashboard_layout')) || DEFAULT_LAYOUT; }
    catch(e) { return DEFAULT_LAYOUT; }
  }
  function saveDashboardLayout() {
    const widgets = [];
    document.querySelectorAll('#dashboard-grid .widget-card').forEach(el => {
      widgets.push({ id: el.dataset.widgetId, size: getCurrentSize(el), active: true });
    });
    localStorage.setItem('cf_dashboard_layout', JSON.stringify(widgets));
    showToast('Layout saved');
  }
  function resetDashboardLayout() {
    localStorage.removeItem('cf_dashboard_layout');
    renderDashboardGrid(DEFAULT_LAYOUT);
    syncBuilderToggles();
    showToast('Reset to default layout');
  }
  function getCurrentSize(el) {
    return ['w-3','w-4','w-6','w-8','w-12'].find(c => el.classList.contains(c)) || 'w-6';
  }

  // Builder Drawer
  function openBuilder() {
    document.getElementById('builder-overlay').classList.add('open');
    document.getElementById('builder-drawer').classList.add('open');
    syncBuilderToggles();
  }
  function closeBuilder() {
    document.getElementById('builder-overlay').classList.remove('open');
    document.getElementById('builder-drawer').classList.remove('open');
  }
  function syncBuilderToggles() {
    const active = new Set(
      Array.from(document.querySelectorAll('#dashboard-grid .widget-card'))
        .map(el => el.dataset.widgetId)
    );
    document.querySelectorAll('.catalog-item').forEach(item => {
      item.classList.toggle('active', active.has(item.dataset.widgetId));
    });
  }
  function toggleCatalogWidget(item) {
    const id = item.dataset.widgetId;
    item.classList.toggle('active');
    const grid = document.getElementById('dashboard-grid');
    const existing = grid.querySelector(`[data-widget-id="${id}"]`);
    if (existing) {
      existing.remove();
    } else {
      const tpl = document.getElementById('wtpl-' + id);
      if (tpl) grid.appendChild(tpl.content.cloneNode(true));
      initWidgetDrag();
    }
  }

  // Widget size picker
  function setWidgetSize(btn, size) {
    const card = btn.closest('.widget-card');
    ['w-3','w-4','w-6','w-8','w-12'].forEach(c => card.classList.remove(c));
    card.classList.add(size);
    card.querySelectorAll('.widget-size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // Date range filter
  function setDateFilter(btn, range) {
    document.querySelectorAll('.db-dtab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    // TODO: propagate range to widgets that support it
  }

  // Widget remove
  function removeWidget(btn) {
    btn.closest('.widget-card').remove();
    syncBuilderToggles();
  }

  // Drag-to-reorder on the grid
  let dragSrc = null;
  function initWidgetDrag() {
    document.querySelectorAll('#dashboard-grid .widget-card').forEach(card => {
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', e => {
        dragSrc = card;
        setTimeout(() => card.classList.add('dragging'), 0);
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.widget-card').forEach(c => c.classList.remove('drag-over'));
        dragSrc = null;
      });
      card.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragSrc && dragSrc !== card) card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
      card.addEventListener('drop', e => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (!dragSrc || dragSrc === card) return;
        const grid = document.getElementById('dashboard-grid');
        const cards = [...grid.querySelectorAll('.widget-card')];
        const srcIdx = cards.indexOf(dragSrc);
        const tgtIdx = cards.indexOf(card);
        if (srcIdx < tgtIdx) card.after(dragSrc); else card.before(dragSrc);
      });
    });
  }

  // Render grid from layout JSON
  function renderDashboardGrid(layout) {
    const grid = document.getElementById('dashboard-grid');
    if (!grid) return;
    grid.innerHTML = '';
    layout.filter(w => w.active).forEach(w => {
      const tpl = document.getElementById('wtpl-' + w.id);
      if (!tpl) return;
      const node = tpl.content.cloneNode(true);
      const card = node.querySelector('.widget-card');
      if (card && w.size) {
        ['w-3','w-4','w-6','w-8','w-12'].forEach(c => card.classList.remove(c));
        card.classList.add(w.size);
      }
      grid.appendChild(node);
    });
    initWidgetDrag();
  }

  // Toast helper
  function showToast(msg) {
    let t = document.getElementById('cf-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cf-toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1B2230;border:1px solid var(--border-mid);color:#E4EBF5;font-size:12px;padding:10px 16px;border-radius:8px;z-index:999;transition:opacity 0.3s';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
  }

  // Init dashboard on screen load
  document.addEventListener('DOMContentLoaded', () => {
    initGreetingBar();
    initQotd();
    const layout = loadDashboardLayout();
    renderDashboardGrid(layout);
  });
  // Also re-init when switching to dashboard; update AI context on every screen change
  const _origSwitch = window.switchScreen;
  window.switchScreen = function(name) {
    _origSwitch(name);
    if (name === 'dashboard') {
      const layout = loadDashboardLayout();
      renderDashboardGrid(layout);
      setTimeout(initGreetingBar, 60);
      setTimeout(renderNewsFeed, 80);
      // Init AI Briefing widget after grid has cloned templates
      setTimeout(() => { if (typeof initAiBriefingWidget === 'function') initAiBriefingWidget(); }, 50);
    }
    if (name === 'cases') {
      if (typeof casesReload === 'function') casesReload();
    }
    if (name === 'tasks') {
      if (typeof tasksReload === 'function') tasksReload();
    }
    // AI context awareness — update badge + re-render panel for new screen
    if (typeof updateAiContext === 'function') updateAiContext(name);
  };

  // Builder search filter
  function filterCatalog(val) {
    document.querySelectorAll('.catalog-item').forEach(item => {
      const text = item.querySelector('.catalog-name').textContent.toLowerCase();
      item.style.display = text.includes(val.toLowerCase()) ? '' : 'none';
    });
    document.querySelectorAll('.builder-cat-label').forEach(lbl => {
      const next = lbl.nextElementSibling;
      let visible = false;
      let el = next;
      while (el && !el.classList.contains('builder-cat-label')) {
        if (el.classList.contains('catalog-item') && el.style.display !== 'none') visible = true;
        el = el.nextElementSibling;
      }
      lbl.style.display = visible ? '' : 'none';
    });
  }

  /* ══ FINANCES JS ═════════════════════════════════════════ */
  // Finance filter tabs
  function setFinTab(btn, group) {
    btn.closest('.fin-bar').querySelectorAll('.fin-tab[data-group="'+group+'"]')
      .forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  function setChartTab(btn) {
    btn.closest('.chart-tabs').querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }

  // Invoice create panel
  function openCreateInvoice() {
    document.getElementById('ci-overlay').classList.add('open');
    document.getElementById('ci-panel').classList.add('open');
  }
  function closeCreateInvoice() {
    document.getElementById('ci-overlay').classList.remove('open');
    document.getElementById('ci-panel').classList.remove('open');
  }
  function addLineItem() {
    const tbody = document.getElementById('li-tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input class="li-inp" type="text" placeholder="Description…"></td>
      <td style="width:60px"><input class="li-inp" type="number" value="1" min="1" style="text-align:center"></td>
      <td style="width:90px"><input class="li-inp" type="text" placeholder="0.00"></td>
      <td style="width:80px" class="li-total" style="text-align:right;font-size:12px;color:var(--text-mid)">—</td>
      <td style="width:28px"><div class="li-del" onclick="this.closest('tr').remove();calcTotals()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></div></td>`;
    tbody.appendChild(row);
  }
  // calcTotals() defined above in switchInvView block
  function acceptAISuggestion(btn) {
    const hint = btn.closest('.ci-ai-hint');
    addLineItem();
    hint.style.display = 'none';
  }

  // Payment expand
  function togglePayRow(el) {
    const expandRow = el.nextElementSibling;
    const chevron = el.querySelector('.pay-chevron');
    const isOpen = expandRow.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open', isOpen);
  }

  /* ─── JOURNALS / LEDGER ─────────────────────────────── */
  function setJlTab(btn, name) {
    btn.closest('.jl-tabs').querySelectorAll('.jl-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function toggleJeRow(el) {
    const expandRow = el.nextElementSibling;
    const chevron   = el.querySelector('.je-chevron');
    const isOpen    = expandRow.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open', isOpen);
  }

  function openQuickEntry() {
    document.getElementById('qe-overlay').classList.add('open');
    document.getElementById('qe-panel').classList.add('open');
  }
  function closeQuickEntry() {
    document.getElementById('qe-overlay').classList.remove('open');
    document.getElementById('qe-panel').classList.remove('open');
  }

  function addJeLine() {
    const tbody = document.getElementById('qe-lines-tbody');
    const accts = ['Accounts Receivable','Bank: Operating','Revenue: Legal Fees','Trust Account','Salaries & Wages','VAT Output (15%)','Accounts Payable','Office Expenses'];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><select><option value="">— Select account —</option>${accts.map(a=>`<option>${a}</option>`).join('')}</select></td>
      <td><input type="text" placeholder="Line description"></td>
      <td><input type="text" placeholder="0.00" style="text-align:right" oninput="checkJeBalance()"></td>
      <td><input type="text" placeholder="0.00" style="text-align:right" oninput="checkJeBalance()"></td>
      <td style="width:28px"><button onclick="this.closest('tr').remove();checkJeBalance()" style="background:none;border:none;color:#5A7080;cursor:pointer;font-size:16px;line-height:1">×</button></td>`;
    tbody.appendChild(tr);
  }

  function checkJeBalance() {
    const rows  = document.querySelectorAll('#qe-lines-tbody tr');
    let dr = 0, cr = 0;
    rows.forEach(r => {
      const inputs = r.querySelectorAll('input[type=text]');
      dr += parseFloat(inputs[1]?.value) || 0;
      cr += parseFloat(inputs[2]?.value) || 0;
    });
    const bar = document.getElementById('qe-balance-bar');
    if (!bar) return;
    if (Math.abs(dr - cr) < 0.01) {
      bar.className = 'qe-balance-row balanced';
      bar.innerHTML = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Balanced — DR R ${dr.toFixed(2)} = CR R ${cr.toFixed(2)}`;
    } else {
      bar.className = 'qe-balance-row unbalanced';
      bar.innerHTML = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> Unbalanced — difference R ${Math.abs(dr-cr).toFixed(2)}`;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     AI ASSISTANT — Data Provider (stub) + Core Functions
  ═══════════════════════════════════════════════════════════ */
  const AI = {
    context: { page: 'finance', entity: null },

    INSIGHTS: {
      finance: [
        { id:'fi1', badge:'Risk',    title:'Cash risk in 14 days',          summary:'R 68K overdue + R 28K distribution due. Net runway narrows to ~R 2.1M if unpaid by Friday.',    confidence:'high', action:'fix'  },
        { id:'fi2', badge:'Tax',     title:'VAT payable spike this quarter', summary:'Output VAT exceeds input by R 61K — SARS payment due in 18 days. Recommend provisioning now.',   confidence:'high', action:'audit'},
        { id:'fi3', badge:'AR',      title:'Overdue invoices rising',        summary:'2 more invoices moved 30+ days overdue this week. Batch follow-up recommended today.',          confidence:'med',  action:'fix'  },
      ],
      invoices: [
        { id:'ii1', badge:'Pattern', title:'Late payment likely — Axis Medical', summary:'Axis Medical historically pays 9–12 days after due date. Current invoice is day 38 of 45.',    confidence:'high', action:'fix'  },
        { id:'ii2', badge:'Tax',     title:'VAT inconsistency on INV-2024-147', summary:'This invoice used 15% VAT, prior Legal Clear invoices used standard rate. Verify account code.', confidence:'med',  action:'audit'},
        { id:'ii3', badge:'Action',  title:'4 invoices need follow-up today',   summary:'INV-139, INV-141, INV-143, INV-145 are all past due. Batch reminder email recommended.',       confidence:'high', action:'fix'  },
      ],
      payments: [
        { id:'pi1', badge:'Risk',    title:'Distribution shortfall — R 3.7K', summary:'Pending distributions total R 28K but wallet balance is R 24.3K. Top-up required before run.', confidence:'high', action:'fix'  },
        { id:'pi2', badge:'Pattern', title:'Global Corp partial payment pattern', summary:'3 consecutive months of partial payments. Consider revised payment terms discussion.',         confidence:'med',  action:'audit'},
      ],
      journals: [
        { id:'ji1', badge:'Check',   title:'Books balanced this period',       summary:'All 10 journal entries verify correctly. DR = CR = R 348,200. No exceptions detected.',       confidence:'high', action:null   },
        { id:'ji2', badge:'Payroll', title:'Payroll variance from prior month', summary:'JE-0087 gross R 38,500 vs prior R 35,600 (+8.1%). Headcount change or rate increase?',         confidence:'med',  action:'audit'},
      ],
      default: [
        { id:'di1', badge:null, title:'Navigate to a Finance screen', summary:'Open Finance Overview, Invoices, Payments, or Journals to see contextual AI insights for that view.', confidence:'low', action:null },
      ]
    },

    PROMPTS: {
      finance:  ['Summarize financial health in 5 bullets','What changed since last month?','Show cash risk for next 30 days','Any compliance risks?'],
      invoices: ['Which invoices need attention today?','Draft reminders for overdue invoices','Check VAT across all open invoices','Explain why invoice count dropped'],
      payments: ['Are we short for any client distributions?','Explain this batch breakdown','Flag anomalies in recent payments','Show pending distribution schedule'],
      journals: ['Confirm the books are balanced','Explain the payroll variance','Show VAT position this period','Any unusual entries this month?'],
      default:  ['Summarize this view','What needs my attention?','Show key risks','Explain current data']
    },

    EXPLAIN: {
      finance:  `<strong>Finance Overview</strong> consolidates your operating and trust financial position for the selected period and entity.<br><br><ul><li><strong>Cash Available</strong> — unrestricted operating cash (trust ring-fenced and excluded)</li><li><strong>Net Position</strong> = Cash Available − Trust Obligations</li><li><strong>Revenue MTD</strong> — all posted invoices, not just received payments</li><li><strong>Overdue Invoices</strong> — invoices past due date by &gt;0 days, any amount</li></ul><p>Click any KPI card to drill into the underlying screen.</p><p style="margin-top:10px"><a onclick="toggleAiCalc(this)" style="color:var(--accent);cursor:pointer;font-size:11px">Show net position calculation →</a></p><div class="ai-calc" style="display:none">Net Position = Cash Available (R 3.82M) − Trust Obligations (R 1.14M) = R 2.68M ✓<br>Trust is excluded as it is client-held and cannot be used for operations.</div>`,
      invoices: `<strong>Invoices</strong> tracks all raised tax invoices across clients. Status reflects the payment lifecycle.<br><br><ul><li><strong>Overdue</strong> — past due date, no full payment received</li><li><strong>Partial</strong> — payment received but below invoice total</li><li><strong>Sent</strong> — delivered to client, awaiting payment</li><li><strong>Draft</strong> — created but not yet sent to client</li></ul><p>VAT is calculated at 15% on the net amount and shown separately in each invoice.</p>`,
      payments: `<strong>Payments & Distributions</strong> shows incoming client payments and their allocation pipeline.<br><br><ul><li><strong>Platform Fee (12%)</strong> — deducted from gross payment before distribution</li><li><strong>Trust Hold</strong> — ring-fenced until matter finalised, cannot be distributed</li><li><strong>Distribution Status</strong> — whether net funds have been paid out to the client wallet</li></ul><p>Expand any row to see the full allocation breakdown and distribution status.</p>`,
      journals: `<strong>General Ledger</strong> contains every financial event as a double-entry journal. Every Debit must equal every Credit.<br><br><ul><li><strong>Sales journals</strong> — auto-generated when invoices are raised</li><li><strong>Cash journals</strong> — created when payments are received or made</li><li><strong>Payroll journals</strong> — posted from approved payroll runs</li><li><strong>General journals</strong> — manual entries for adjustments, accruals, transfers</li></ul><p style="margin-top:10px"><a onclick="toggleAiCalc(this)" style="color:var(--accent);cursor:pointer;font-size:11px">Show period balance check →</a></p><div class="ai-calc" style="display:none">Σ DR (R 348,200.00) − Σ CR (R 348,200.00) = R 0.00 ✓<br>10 entries verified · 5 date groups · March 2025</div>`,
      default:  `Select a Finance screen — Overview, Invoices, Payments, or Journals — to see contextual AI explanations tailored to what you are viewing.`
    },

    ACTIONS: {
      finance:  [
        { id:'af1', icon:'✉', label:'Draft overdue invoice reminders', desc:'Generate professional follow-up emails for all invoices 30+ days past due.', safe:true  },
        { id:'af2', icon:'⚑', label:'Create SARS VAT payment reminder', desc:'Add a calendar task for the R 61K VAT payment due in 18 days.', safe:true  },
        { id:'af3', icon:'↓', label:'Export 30-day cash flow projection', desc:'Generate a cash flow summary as a downloadable CSV or PDF.', safe:true  },
      ],
      invoices: [
        { id:'ai1', icon:'✉', label:'Batch-send overdue reminders',           desc:'Send follow-up emails to all clients with invoices 30+ days past due.', safe:false },
        { id:'ai2', icon:'✦', label:'Suggest line items from last invoice',    desc:"Pre-fill line items based on this client's most recent invoice history.", safe:true  },
        { id:'ai3', icon:'⚑', label:'Escalate to finance manager',             desc:'Mark overdue invoices as escalated and assign to the finance team queue.', safe:true  },
      ],
      payments: [
        { id:'ap1', icon:'⊕', label:'Create distribution batch from wallet',  desc:'Prepare a new distribution batch using current available wallet balance.', safe:false },
        { id:'ap2', icon:'⚑', label:'Flag shortfall as exception',             desc:'Track the R 3.7K shortfall as a formal exception for finance review.', safe:true  },
      ],
      journals: [
        { id:'aj1', icon:'↩', label:'Create reversing entry for selected JE', desc:'Prepare a reversal journal for the selected entry in the next accounting period.', safe:false },
        { id:'aj2', icon:'↓', label:'Export journal entries to CSV',           desc:'Download all current period journal entries as a structured CSV file.', safe:true  },
      ],
      default: []
    },

    AUDIT: {
      finance:  [
        { ref:'INV-2024-147', type:'Invoice',     note:'Used to calculate AR balance and Revenue MTD figures' },
        { ref:'JE-0088',      type:'Journal',     note:'Global Corp payment — cleared R 62,500 from AR' },
        { ref:'TRUST-RELEASE-4412', type:'Trust Event', note:'Reduced trust obligations by R 15,000 (matter finalised)' },
        { ref:'PAYROLL-2025-03B',   type:'Payroll Run', note:'Expenses MTD includes this R 38,500 payroll run' },
      ],
      invoices: [
        { ref:'INV-2024-145', type:'Invoice',     note:'Axis Medical — 45-day terms, currently at day 38 with no payment' },
        { ref:'PAYMENT-HIST-AXM', type:'Pattern', note:'Last 4 Axis Medical payments: avg 51 days from invoice date' },
        { ref:'VAT-RATE-CHK',  type:'Calculation',note:'INV-2024-147 rate (15%) vs prior Legal Clear invoices: consistent ✓' },
      ],
      payments: [
        { ref:'PAY-2024-088',  type:'Payment',    note:'Global Corp — R 31,250 of R 62,500 invoice total, 3rd partial' },
        { ref:'DIST-4421-AXM', type:'Distribution',note:'Net after 12% platform fee = R 22,000 distributed' },
        { ref:'WALLET-CALC',   type:'Balance',    note:'Available R 24,300 − Pending R 28,000 = shortfall R 3,700' },
      ],
      journals: [
        { ref:'JE-0089 → JE-0080', type:'Journal Range', note:'All 10 entries verified: Σ DR = Σ CR = R 348,200 ✓' },
        { ref:'PAYROLL-2025-03B',  type:'Payroll',       note:'JE-0087 gross R 38,500 vs prior R 35,600 (Δ +8.1%)' },
      ],
      default: []
    },

    MOCK_RESPONSES: {
      'Summarize financial health in 5 bullets': `<strong>Financial health — March 2025:</strong><ul><li>Cash position R 3.82M (↑ healthy operating balance)</li><li>Net position after trust ring-fence: R 2.68M</li><li>Outstanding AR: R 497K across 4 active invoices</li><li>Overdue exposure: R 68K — 14% of AR (rising)</li><li>VAT payable to SARS in 18 days: ~R 61K (provision recommended)</li></ul>`,
      'What changed since last month?': `Revenue MTD is R 187K vs R 163K last month <strong>(+14.7%)</strong>. Expenses increased R 12K from an additional payroll run. Two further invoices moved into overdue status this week, bringing the total to four.`,
      'Which invoices need attention today?': `<strong>4 invoices require action:</strong><ul><li>INV-139 (Global Corp) — 38 days overdue · R 62,500</li><li>INV-141 (Axis Medical) — 22 days overdue · R 91,200</li><li>INV-143 (Fin Services) — 15 days overdue · R 48,700</li><li>INV-145 (Legal Clear) — 5 days overdue · R 45,000</li></ul>Recommended: send batch reminder now via Fix tab.`,
      'Confirm the books are balanced': `<strong>Books are balanced ✓</strong><br>Σ Debits = Σ Credits = <strong>R 348,200.00</strong> across all 10 journal entries for March 2025. No unposted drafts. No orphaned lines detected.`,
      'Are we short for any client distributions?': `<strong>Shortfall detected:</strong> Pending distributions total <strong>R 28,000</strong> but the available wallet balance is <strong>R 24,300</strong>. Shortfall of <strong>R 3,700</strong> — you will need to top up before processing the batch or split the run.`,
    }
  };

  /* ── Core Rail Functions ── */
  function toggleAiRail() {
    const strip = document.getElementById('ai-strip-trigger');
    const drawer = document.getElementById('ai-panel-drawer');
    const isOpen = drawer.classList.toggle('open');
    strip.classList.toggle('active', isOpen);
    if (isOpen) renderAiPanel();
  }

  function activateAiTab(name) {
    document.querySelectorAll('.ai-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.ai-tab-content').forEach(c => c.classList.toggle('active', c.id === 'ai-tc-' + name));
  }

  /* ── Context Awareness ── */
  function updateAiContext(page) {
    AI.context.page = page;
    const labels = { finance:'Finance Overview', invoices:'Invoices', payments:'Payments & Distributions', journals:'General Ledger', dashboard:'CEO Dashboard', contacts:'Contacts', companies:'Companies', mail:'Mail', todos:'Tasks', forms:'Forms' };
    const ctxEl = document.getElementById('ai-ctx-label');
    if (ctxEl) ctxEl.textContent = labels[page] || page;
    // Update badge
    const key = AI.INSIGHTS[page] ? page : 'default';
    const count = AI.INSIGHTS[key].filter(i => i.confidence !== 'low').length;
    const badge = document.getElementById('ai-rail-badge');
    if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
    // Re-render if panel is open
    if (document.getElementById('ai-panel-drawer').classList.contains('open')) renderAiPanel();
  }

  /* ── Render Panel ── */
  function renderAiPanel() {
    const page = AI.context.page;
    const get  = key => AI[key][page] || AI[key]['default'];

    // Chips
    const chips = document.getElementById('ai-chips');
    if (chips) chips.innerHTML = get('PROMPTS').map(p =>
      `<button class="ai-chip" onclick="runAiQuery('${p.replace(/'/g,"\\'")}') ">${p}</button>`
    ).join('');

    // Insights
    const insEl = document.getElementById('ai-tc-insights');
    if (insEl) insEl.innerHTML = get('INSIGHTS').map(ins => `
      <div class="ai-insight-card">
        <div class="ai-ic-top">
          ${ins.badge ? `<span class="ai-ic-badge">${ins.badge}</span>` : ''}
          <span class="ai-confidence ${ins.confidence}">${ins.confidence.toUpperCase()}</span>
        </div>
        <div class="ai-ic-title">${ins.title}</div>
        <div class="ai-ic-summary">${ins.summary}</div>
        ${ins.action === 'fix'   ? `<div class="ai-ic-actions"><button class="ai-ic-btn primary" onclick="activateAiTab('fix')">See actions →</button></div>` : ''}
        ${ins.action === 'audit' ? `<div class="ai-ic-actions"><button class="ai-ic-btn secondary" onclick="activateAiTab('audit')">Audit trail</button></div>` : ''}
      </div>`).join('');

    // Explain
    const expEl = document.getElementById('ai-tc-explain');
    if (expEl) {
      const explainText = AI.EXPLAIN[page] || AI.EXPLAIN['default'];
      expEl.innerHTML = `<div class="ai-explain-body">${explainText}</div><div class="ai-chat-area" id="ai-chat-area" style="margin-top:10px"></div>`;
    }

    // Fix / Actions
    const fixEl = document.getElementById('ai-tc-fix');
    const actions = get('ACTIONS');
    if (fixEl) fixEl.innerHTML = actions.length
      ? actions.map(a => `
          <div class="ai-action-card">
            <div class="ai-action-top">
              <div class="ai-action-icon">${a.icon}</div>
              <div><div class="ai-action-label">${a.label}</div><div class="ai-action-desc">${a.desc}</div></div>
            </div>
            <button class="ai-action-btn ${a.safe ? '' : 'destructive'}" onclick="requestActionPreview('${a.id}','${a.label.replace(/'/g,"\\'")}')">
              ${a.safe ? 'Preview action' : '⚠ Preview — requires approval'}
            </button>
          </div>`).join('')
      : `<div class="ai-empty">No recommended actions for this view.</div>`;

    // Audit
    const audEl = document.getElementById('ai-tc-audit');
    const audit = get('AUDIT');
    if (audEl) audEl.innerHTML = audit.length
      ? `<p class="ai-audit-intro">The following records and events were used to derive the insights shown on this view:</p>
         <div class="ai-audit-list">${audit.map(a => `
           <div class="ai-audit-item">
             <div class="ai-audit-ref">${a.ref}</div>
             <div class="ai-audit-type">${a.type}</div>
             <div class="ai-audit-note">${a.note}</div>
           </div>`).join('')}
         </div>
         <div class="ai-audit-footer">Reasoning trace generated from stub data. In production this reflects actual model inputs, source documents, and calculation steps.</div>`
      : `<div class="ai-empty">Navigate to a Finance screen to see the audit trail.</div>`;
  }

  /* ── Free Chat ── */
  function runAiQuery(text) {
    if (!text || !text.trim()) return;
    // Ensure panel is open
    const drawer = document.getElementById('ai-panel-drawer');
    if (!drawer.classList.contains('open')) {
      drawer.classList.add('open');
      document.getElementById('ai-strip-trigger').classList.add('active');
      renderAiPanel();
    }
    // Switch to Explain tab to show chat
    activateAiTab('explain');
    setTimeout(() => {
      const chatArea = document.getElementById('ai-chat-area');
      if (!chatArea) return;
      // User message
      chatArea.innerHTML += `<div class="ai-msg user">${text}</div>`;
      // Typing indicator
      const typingId = 'ai-typing-' + Date.now();
      chatArea.innerHTML += `<div class="ai-msg assistant" id="${typingId}"><div class="ai-typing-dots"><span></span><span></span><span></span></div></div>`;
      chatArea.scrollTop = chatArea.scrollHeight;
      // Response after delay
      setTimeout(() => {
        const el = document.getElementById(typingId);
        if (el) el.innerHTML = AI.MOCK_RESPONSES[text] || `Based on the current <strong>${AI.context.page}</strong> context, I've reviewed the available data. There are no additional anomalies beyond what's shown in the Insights tab. Would you like to drill into a specific area?`;
        chatArea.scrollTop = chatArea.scrollHeight;
      }, 900);
      const input = document.getElementById('ai-text-input');
      if (input) input.value = '';
    }, 50);
  }

  /* ── Inline Ask AI (popover) ── */
  function openInlineAsk(triggerEl, context) {
    const popover = document.getElementById('ai-popover');
    if (!popover) return;
    const suggestions = {
      'ageing-chart':  ['Explain the ageing bands','Which clients are oldest?','Draft a follow-up plan'],
      'invoice-totals':['Check VAT calculation','Verify line item totals','Compare to last invoice'],
      'distribution':  ['Is this distribution sufficient?','Explain the breakdown','Flag the shortfall'],
      'journal-totals':['Confirm balance check','Explain the largest entry','Show VAT position'],
    }[context] || ['Explain this section','Flag for review','Show related data'];

    popover.innerHTML = `
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#5A7080;margin-bottom:8px">Quick questions</div>
      <div class="ai-popover-chips">${suggestions.map(s =>
        `<button class="ai-popover-chip" onclick="handleInlineQuery('${s.replace(/'/g,"\\'")}');closeInlineAsk()">${s}</button>`
      ).join('')}</div>
      <div class="ai-popover-input-row">
        <input id="ai-inline-input" class="ai-inline-input" placeholder="Ask anything…"
          onkeydown="if(event.key==='Enter'){handleInlineQuery(this.value);closeInlineAsk()}">
        <button onclick="handleInlineQuery(document.getElementById('ai-inline-input').value);closeInlineAsk()"
          style="background:var(--accent);border:none;border-radius:var(--radius);color:#fff;padding:0 12px;cursor:pointer;font-size:14px;font-weight:700">→</button>
      </div>`;

    const rect = triggerEl.getBoundingClientRect();
    popover.style.top  = (rect.bottom + 8) + 'px';
    popover.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 312)) + 'px';
    popover.style.display = 'block';
    setTimeout(() => document.addEventListener('click', _closeInlineOutside, { once: true }), 60);
  }
  function _closeInlineOutside(e) {
    const p = document.getElementById('ai-popover');
    if (p && !p.contains(e.target)) p.style.display = 'none';
  }
  function closeInlineAsk() { const p = document.getElementById('ai-popover'); if (p) p.style.display = 'none'; }
  function handleInlineQuery(text) {
    if (!text.trim()) return;
    runAiQuery(text);
  }

  /* ── Action Preview + Confirmation ── */
  function requestActionPreview(actionId, label) {
    document.getElementById('ai-confirm-action-label').textContent = label;
    document.getElementById('ai-confirm-action-id').value = actionId;
    document.getElementById('ai-confirm-overlay').classList.add('open');
    document.getElementById('ai-confirm-modal').classList.add('open');
  }
  function closeActionModal() {
    document.getElementById('ai-confirm-overlay').classList.remove('open');
    document.getElementById('ai-confirm-modal').classList.remove('open');
  }
  function applyAction(actionId) {
    closeActionModal();
    const toast = document.createElement('div');
    toast.className = 'ai-toast';
    toast.textContent = '✓ Action staged — changes queued for review';
    document.body.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('show'); }); });
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
  }

  /* ── Expand calculation block (used in Explain tab) ── */
  function toggleAiCalc(link) {
    const calc = link.parentElement.nextElementSibling;
    if (!calc) return;
    const isVisible = calc.style.display !== 'none';
    calc.style.display = isVisible ? 'none' : 'block';
    link.textContent = isVisible ? 'Show calculation →' : 'Hide calculation ↑';
  }

  /* ── Initialise badge on page load ── */
  window.addEventListener('DOMContentLoaded', () => updateAiContext('finance'));

  /* ══════════════════════════════════════════════════════════
     AI BRIEFING WIDGET — Data Provider + Widget Functions
  ══════════════════════════════════════════════════════════ */

  /* ── Mock data provider ── */
  const BRIEFING = {
    _state: { range:'30D', tone:'CEO', scenario:'good' },

    scenarios: {
      good: {
        signal: 'good',
        headline: 'Business is on track — revenue up 12 % MTD with healthy cash reserves.',
        bullets: [
          'Revenue <strong>R 1.42 M MTD</strong>, up <strong>12 %</strong> vs prior month — driven by 3 new retainer closings.',
          'Cash position <strong>R 284 K</strong> (14-day runway +28 %) with no urgent payables this week.',
          'AR collections at <strong>94 % on-time</strong> — only 2 invoices past 30 days, totalling R 18 K.',
          'Pipeline value <strong>R 890 K</strong> across 7 active deals; 2 expected to close this month.',
          'SLA breaches at <strong>0 %</strong> this week — all 14 active client deliverables on schedule.'
        ],
        actions: [
          { id:'send-reminders', label:'Send payment reminders for the 2 overdue invoices', impact:'low', impactLabel:'Low Impact' },
          { id:'close-pipeline', label:'Schedule closing calls for 2 near-close pipeline deals', impact:'low', impactLabel:'Low Impact' },
          { id:'update-forecast', label:'Lock October revenue forecast in Finances', impact:'med', impactLabel:'Med Impact' }
        ],
        eventCount: 41,
        timestamp: 'Oct 24, 2024 · 09:14 AM'
      },
      cashRisk: {
        signal: 'risk',
        headline: 'Cash risk in 14 days — R 96 K outflows due before next collection cycle.',
        bullets: [
          '<strong>R 68 K overdue</strong> from 3 clients (Nexacore, TechBridge, Alvaro Ltd) — all 30+ days past due.',
          'Distribution payment of <strong>R 28 K</strong> due on Nov 1 with no buffer in current account.',
          'Operating expenses running <strong>8 % above plan</strong> — R 14 K overspend on contractor fees.',
          'New invoices issued <strong>R 210 K</strong> this month but avg payment lag is 38 days — too slow.',
          'VAT output exceeds input by <strong>R 61 K</strong> this quarter — provisioning required before month-end.'
        ],
        actions: [
          { id:'chase-overdue', label:'Chase the 3 overdue clients with escalation emails', impact:'high', impactLabel:'High Impact' },
          { id:'defer-distribution', label:'Defer Nov 1 distribution by 7 days pending collections', impact:'high', impactLabel:'High Impact' },
          { id:'provision-vat', label:'Create VAT provision journal entry for R 61 K', impact:'med', impactLabel:'Med Impact' }
        ],
        eventCount: 63,
        timestamp: 'Oct 24, 2024 · 09:14 AM'
      },
      overdueSpike: {
        signal: 'warn',
        headline: 'Overdue invoices spiked this week — 5 new past-due accounts need attention.',
        bullets: [
          '<strong>5 invoices</strong> moved to 30+ days overdue this week — total exposure <strong>R 127 K</strong>.',
          'Overdue rate jumped from <strong>6 % → 19 %</strong> in 7 days; largest spike since March.',
          'Top 2 clients (Alvaro Ltd <strong>R 48 K</strong>, Deltawave <strong>R 31 K</strong>) have not responded to reminders.',
          'Collections team follow-up rate at <strong>62 %</strong> this month — below 80 % target.',
          'Cash position still healthy at <strong>R 210 K</strong> but will dip below <strong>R 80 K</strong> if unpaid within 21 days.'
        ],
        actions: [
          { id:'escalate-top2', label:'Escalate Alvaro Ltd + Deltawave to director level', impact:'high', impactLabel:'High Impact' },
          { id:'collections-review', label:'Review collections process for recurring late payers', impact:'med', impactLabel:'Med Impact' },
          { id:'set-alert', label:'Set 14-day cash alert threshold at R 100 K', impact:'low', impactLabel:'Low Impact' }
        ],
        eventCount: 57,
        timestamp: 'Oct 24, 2024 · 09:14 AM'
      }
    },

    sources: {
      good: [
        { group:'Invoices', items:[{ icon:'🧾', name:'INV-0041 — Nexacore Holdings', detail:'R 42,000 · Paid Oct 18' },{ icon:'🧾', name:'INV-0043 — Deltawave SA', detail:'R 28,500 · Paid Oct 20' }] },
        { group:'Payments', items:[{ icon:'💳', name:'PMT-0088 · Alvaro Ltd', detail:'R 15,000 · Oct 22 · Received' }] },
        { group:'Journals', items:[{ icon:'📒', name:'GL Oct W4 — Revenue Recognition', detail:'10 entries · Oct 21–24' }] }
      ],
      cashRisk: [
        { group:'Invoices', items:[{ icon:'🧾', name:'INV-0038 — Nexacore Holdings', detail:'R 28,000 · 38 days overdue' },{ icon:'🧾', name:'INV-0035 — TechBridge Ltd', detail:'R 19,500 · 42 days overdue' },{ icon:'🧾', name:'INV-0031 — Alvaro Ltd', detail:'R 20,500 · 61 days overdue' }] },
        { group:'Journals', items:[{ icon:'📒', name:'VAT Output Ledger — Q3', detail:'6 entries · Sep–Oct' },{ icon:'📒', name:'Contractor Costs — Oct', detail:'Overspend R 14 K' }] }
      ],
      overdueSpike: [
        { group:'Invoices', items:[{ icon:'🧾', name:'INV-0048 — Alvaro Ltd', detail:'R 48,000 · 31 days overdue' },{ icon:'🧾', name:'INV-0046 — Deltawave SA', detail:'R 31,000 · 33 days overdue' },{ icon:'🧾', name:'INV-0044 — Nexacore', detail:'R 24,000 · 30 days overdue' }] },
        { group:'Payments', items:[{ icon:'💳', name:'Collections Tracker — Oct W4', detail:'62 % follow-up rate' }] }
      ]
    },

    followupResponses: {
      'What changed since last week?': 'vs last week: +2 new overdue accounts, pipeline closed 1 deal (R 145 K), cash position up R 18 K after 3 collections.',
      'Explain cash risk': 'Cash risk arises from the gap between R 96 K in near-term outflows (overdue distributions + payroll) and current collections pace. If the 3 overdue clients don\'t pay within 14 days, the account dips below minimum operating buffer.',
      'Biggest risks?': 'Top 3 risks: (1) Alvaro Ltd & Deltawave not responding — R 79 K combined. (2) VAT provision not yet journalled — R 61 K liability. (3) Contractor overspend continuing — R 14 K above plan with 7 days left in month.'
    },

    /* ── Provider stubs (replace with real API calls) ── */
    getNarrativeSummary(ctx) {
      const s = this._state.scenario;
      return Promise.resolve(this.scenarios[s]);
    },
    getSources(ctx) {
      const s = this._state.scenario;
      return Promise.resolve(this.sources[s] || []);
    },
    runFollowupQuestion(ctx, questionText) {
      const key = questionText.trim();
      const reply = this.followupResponses[key] || `Analysing "${key}" across ${ctx.range} data… (stub response — connect to real AI endpoint)`;
      return new Promise(resolve => setTimeout(() => resolve(reply), 900));
    }
  };

  /* ── Widget state ── */
  let _abMode = 'large'; // 'medium' | 'large'
  let _abData = null;

  /* ── Core render ── */
  function renderBriefing() {
    const wrap = document.getElementById('ab-widget-instance');
    if (!wrap) return;
    const skel = wrap.querySelector('.ab-skeleton');
    if (skel) skel.classList.add('visible');

    BRIEFING.getNarrativeSummary(BRIEFING._state).then(data => {
      _abData = data;
      _fillBriefingContent(wrap, data);
      if (skel) { skel.classList.remove('visible'); }
    });
  }

  function _fillBriefingContent(wrap, data) {
    // Signal dot + headline text (separate elements in new DOM)
    const sig = wrap.querySelector('.ab-signal');
    if (sig) { sig.className = 'ab-signal ' + data.signal; }
    const hlText = wrap.querySelector('.ab-hl-text');
    if (hlText) hlText.textContent = data.headline;

    // Bullets
    const ul = wrap.querySelector('.ab-bullets');
    if (ul) {
      ul.innerHTML = data.bullets.map(b => `<li class="ab-bullet">${b}</li>`).join('');
    }

    // Actions — new two-row card layout (text row + impact+button row)
    const ac = wrap.querySelector('.ab-action-cards');
    if (ac) {
      ac.innerHTML = data.actions.map(a => `
        <div class="ab-action-card">
          <div class="ab-action-text">${a.label}</div>
          <div class="ab-action-foot">
            <span class="ab-impact-tag ${a.impact}">${a.impactLabel}</span>
            <button class="ab-do-btn" onclick="requestActionPreview('${a.id}','${a.label.replace(/'/g,'\\\'')}')">&rarr; Do it</button>
          </div>
        </div>`).join('');
    }

    // Footer meta
    const meta = wrap.querySelector('.ab-meta');
    if (meta) meta.textContent = `Generated from ${data.eventCount} events · ${data.timestamp}`;

    // Apply current display mode
    _applyAbMode(wrap);
  }

  function _applyAbMode(wrap) {
    wrap.classList.remove('mode-medium', 'mode-large');
    wrap.classList.add('mode-' + _abMode);
    // medium: hide bullets 4+5 + right column (via CSS); update expand link text
    const moreLink = wrap.querySelector('.ab-more-link');
    if (moreLink) moreLink.textContent = _abMode === 'medium' ? 'View full briefing →' : '';
  }

  /* ── Public API ── */
  function refreshBriefing() {
    const btn = document.querySelector('.ab-refresh-btn');
    if (btn) btn.classList.add('spinning');
    setTimeout(() => {
      // Cycle through scenarios for demo
      const scenarios = ['good', 'cashRisk', 'overdueSpike'];
      const cur = scenarios.indexOf(BRIEFING._state.scenario);
      BRIEFING._state.scenario = scenarios[(cur + 1) % scenarios.length];
      renderBriefing();
      if (btn) btn.classList.remove('spinning');
    }, 1200);
  }

  function toggleAbMode() {
    _abMode = _abMode === 'medium' ? 'large' : 'medium';
    const wrap = document.getElementById('ab-widget-instance');
    if (wrap && _abData) _applyAbMode(wrap);
  }

  function setAbRange(btn, range) {
    BRIEFING._state.range = range;
    btn.closest('.ab-toggle-group').querySelectorAll('.ab-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderBriefing();
  }

  function setAbTone(btn, tone) {
    BRIEFING._state.tone = tone;
    btn.closest('.ab-toggle-group').querySelectorAll('.ab-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderBriefing();
  }

  function runBriefingQuery(text) {
    if (!text || !text.trim()) return;
    const input = document.querySelector('.ab-ask-input');
    if (input) input.value = '';
    const wrap = document.getElementById('ab-widget-instance');
    if (!wrap) return;

    // Show temporary reply inline
    const footer = wrap.querySelector('.ab-footer');
    const replyEl = wrap.querySelector('.ab-followup-reply') || (() => {
      const el = document.createElement('div');
      el.className = 'ab-followup-reply';
      el.style.cssText = 'font-size:11px;color:#9AABB8;background:#1B2230;border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px;margin-top:6px;line-height:1.5;';
      if (footer && footer.parentNode) footer.parentNode.insertBefore(el, footer);
      return el;
    })();
    replyEl.textContent = 'Thinking…';

    BRIEFING.runFollowupQuestion(BRIEFING._state, text).then(reply => {
      replyEl.textContent = reply;
    });
  }

  function openSourcesPanel() {
    const overlay = document.getElementById('ab-sources-overlay');
    const panel   = document.getElementById('ab-sources-panel');
    if (!overlay || !panel) return;

    // Fill sources
    BRIEFING.getSources(BRIEFING._state).then(groups => {
      const body = panel.querySelector('.ab-sources-body');
      if (!body) return;
      body.innerHTML = groups.map(g => `
        <div>
          <div class="ab-source-group-label">${g.group}</div>
          ${g.items.map(item => `
            <div class="ab-source-item" onclick="alert('Drill-down: ${item.name}')">
              <div class="ab-source-icon">${item.icon}</div>
              <div class="ab-source-info">
                <div class="ab-source-name">${item.name}</div>
                <div class="ab-source-detail">${item.detail}</div>
              </div>
              <span class="ab-source-arrow">›</span>
            </div>`).join('')}
        </div>`).join('');
    });

    overlay.classList.add('open');
    panel.classList.add('open');
  }

  function closeSourcesPanel() {
    const overlay = document.getElementById('ab-sources-overlay');
    const panel   = document.getElementById('ab-sources-panel');
    if (overlay) overlay.classList.remove('open');
    if (panel)   panel.classList.remove('open');
  }

  function initAiBriefingWidget() {
    const wrap = document.getElementById('ab-widget-instance');
    if (!wrap) return;
    // Prevent double-init
    if (wrap.dataset.abInit === '1') return;
    wrap.dataset.abInit = '1';
    renderBriefing();
  }


  /* ═══════════════════════════════════════════════
     INVOICE TEMPLATE DESIGNER — JS
  ═══════════════════════════════════════════════ */

  /* ── Default template structure ── */
  const DEFAULT_TEMPLATE = {
    sections: [
      { key:'header',    on:true  },
      { key:'title',     on:true  },
      { key:'client',    on:true  },
      { key:'meta',      on:true  },
      { key:'lineItems', on:true  },
      { key:'totals',    on:true  },
      { key:'notes',     on:true  },
      { key:'terms',     on:true  },
      { key:'payment',   on:true  },
      { key:'footer',    on:true  }
    ],
    fields: {
      header:    { logo:true, companyName:true, companyAddr:true },
      client:    { clientName:true, clientAddr:true, clientEmail:true, clientRef:true },
      meta:      { invoiceNum:true, invoiceDate:true, dueDate:true, paymentMethod:true },
      lineItems: { description:true, qty:true, unitPrice:true, tax:true, discount:false },
      totals:    { subtotal:true, tax:true, discount:false, total:true },
      payment:   { bankName:true, accountNum:true, branch:true, reference:true }
    },
    style: { accent:'#2563eb', logoAlign:'left', fontScale:1 }
  };

  /* ── Section metadata ── */
  const SECTION_META = {
    header:    { label:'Company Header',  icon:'🏢', locked:false, draggable:true,  hasFields:true  },
    title:     { label:'Invoice Title',   icon:'📄', locked:true,  draggable:false, hasFields:false },
    client:    { label:'Bill To',         icon:'👤', locked:false, draggable:true,  hasFields:true  },
    meta:      { label:'Invoice Details', icon:'🗒️', locked:false, draggable:true,  hasFields:true  },
    lineItems: { label:'Line Items',      icon:'📋', locked:false, draggable:true,  hasFields:true  },
    totals:    { label:'Totals',          icon:'➕', locked:false, draggable:true,  hasFields:true  },
    notes:     { label:'Notes',           icon:'📝', locked:false, draggable:true,  hasFields:false },
    terms:     { label:'Terms',           icon:'📜', locked:false, draggable:true,  hasFields:false },
    payment:   { label:'Payment Details', icon:'🏦', locked:false, draggable:true,  hasFields:true  },
    footer:    { label:'Footer',          icon:'—',  locked:true,  draggable:false, hasFields:false }
  };

  /* ── Field labels ── */
  const FIELD_LABELS = {
    logo:'Logo', companyName:'Company name', companyAddr:'Address',
    clientName:'Client name', clientAddr:'Address', clientEmail:'Email', clientRef:'Reference #',
    invoiceNum:'Invoice #', invoiceDate:'Issue date', dueDate:'Due date', paymentMethod:'Payment method',
    description:'Description', qty:'Quantity', unitPrice:'Unit price', tax:'Tax column', discount:'Discount column',
    subtotal:'Subtotal', taxRow:'VAT row', discountRow:'Discount row', total:'Total',
    bankName:'Bank name', accountNum:'Account number', branch:'Branch code', reference:'Reference'
  };

  /* ── Mock invoice data ── */
  const MOCK_INVOICE = {
    company:{ name:'Novatrai Legal', addr:'123 Business Park, Cape Town, 8001', email:'info@novatrai.com', vatNo:'4321098765', regNo:'2019/123456/07' },
    client:{ name:'Legal Clear', addr:'45 Commerce Street\nJohannesburg, 2000', email:'legal@legalclear.com', ref:'LC-2026-Q1' },
    num:'INV-1089', date:'24 February 2026', due:'31 March 2026', payment:'EFT', status:'sent',
    lines:[
      { desc:'AML Risk Assessment — Q1 2026',          qty:1,  unit:18000, total:18000 },
      { desc:'Compliance Documentation Review',         qty:1,  unit:4500,  total:4500  },
      { desc:'Regulatory Framework Advisory (3h)',      qty:3,  unit:2000,  total:6000  }
    ],
    subtotal:28500, tax:4275, discount:0, total:32775,
    notes:'Payment due within 30 days of invoice date. Late payments attract 2% monthly interest.',
    terms:'All services rendered per MSA dated 15 January 2024. Disputes must be raised within 7 days.',
    bank:{ name:'FNB Business Bank', account:'62851234567', branch:'250655', ref:'INV-1089' },
    footerText:'Novatrai Legal (Pty) Ltd · Reg: 2019/123456/07 · VAT: 4321098765 · novatrai.com'
  };

  /* ── Mutable state (deep clone of default) ── */
  let ITP = JSON.parse(JSON.stringify(DEFAULT_TEMPLATE));
  let _itpZoom = 100;
  let _itpDragKey = null;
  let _ivCurrent = null;   // currently-open invoice in view lightbox

  /* ── Helper: fmt ── */
  function itpFmt(n){ return 'R' + n.toLocaleString('en-ZA'); }

  /* ══ VIEW TOGGLE ══════════════════════════════ */
  function switchInvView(mode) {
    const listView   = document.getElementById('inv-list-view');
    const quotesView = document.getElementById('inv-quotes-view');
    const tplView    = document.getElementById('inv-template-view');
    const btnList    = document.getElementById('inv-vtbtn-list');
    const btnQuotes  = document.getElementById('inv-vtbtn-quotes');
    const btnTpl     = document.getElementById('inv-vtbtn-template');
    const kpiQuotes  = document.getElementById('kpi-quotes-tile');
    const kpiConv    = document.getElementById('kpi-conversion-tile');
    const kpiDraft   = document.getElementById('kpi-draft-tile');
    const createBtn  = document.getElementById('inv-create-btn');
    // Hide all
    [listView, quotesView, tplView].forEach(v => { if(v) v.style.display = 'none'; });
    [btnList, btnQuotes, btnTpl].forEach(b => { if(b) b.classList.remove('active'); });
    if (mode === 'quotes') {
      quotesView.style.display = '';
      btnQuotes.classList.add('active');
      if (kpiQuotes) kpiQuotes.style.display = '';
      if (kpiConv)   kpiConv.style.display   = '';
      if (kpiDraft)  kpiDraft.style.display  = 'none';
      if (createBtn) createBtn.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" style="width:13px;height:13px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg> Create Quote`;
    } else if (mode === 'template') {
      tplView.classList.add('active');
      tplView.style.display = '';
      btnTpl.classList.add('active');
      if (kpiQuotes) kpiQuotes.style.display = 'none';
      if (kpiConv)   kpiConv.style.display   = 'none';
      if (kpiDraft)  kpiDraft.style.display  = '';
      if (createBtn) createBtn.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" style="width:13px;height:13px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg> Create Invoice`;
      loadItpTemplate();
      renderCustomizer();
      renderA4Preview();
    } else {
      listView.style.display = '';
      btnList.classList.add('active');
      if (kpiQuotes) kpiQuotes.style.display = 'none';
      if (kpiConv)   kpiConv.style.display   = 'none';
      if (kpiDraft)  kpiDraft.style.display  = '';
      if (createBtn) createBtn.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" style="width:13px;height:13px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg> Create Invoice`;
    }
  }

  function invCreateAction() {
    const activeQuotes = document.getElementById('inv-vtbtn-quotes')?.classList.contains('active');
    if (activeQuotes) openCreateQuote(); else openCreateInvoice();
  }

  /* ── calcTotals: live line-item maths (invoices) ── */
  function calcTotals() {
    const tbody = document.getElementById('li-tbody');
    if (!tbody) return;
    let sub = 0;
    tbody.querySelectorAll('tr').forEach(row => {
      const inputs = row.querySelectorAll('.li-inp');
      if (inputs.length < 3) return;
      const qty   = parseFloat(inputs[1].value) || 0;
      const price = parseFloat((inputs[2].value || '0').replace(/[^0-9.]/g, '')) || 0;
      const total = qty * price;
      sub += total;
      const totalCell = row.querySelector('.li-total');
      if (totalCell) totalCell.textContent = 'R' + total.toLocaleString('en-ZA', {minimumFractionDigits:0,maximumFractionDigits:2});
    });
    const vatRate = 0.15;
    const vat = sub * vatRate;
    const grand = sub + vat;
    const fmt = v => 'R' + v.toLocaleString('en-ZA',{minimumFractionDigits:0,maximumFractionDigits:2});
    const subEl = document.querySelector('#ci-panel .ci-total-row:nth-child(1) span:last-child');
    const vatEl = document.querySelector('#ci-panel .ci-total-row:nth-child(2) span:last-child');
    const grdEl = document.querySelector('#ci-panel .ci-total-row.grand span:last-child');
    if (subEl) subEl.textContent = fmt(sub);
    if (vatEl) vatEl.textContent = fmt(vat);
    if (grdEl) grdEl.textContent = fmt(grand);
  }

  /* ── calcQuoteTotals: same for quote panel ── */
  function calcQuoteTotals() {
    const tbody = document.getElementById('cq-li-tbody');
    if (!tbody) return;
    let sub = 0;
    tbody.querySelectorAll('tr').forEach(row => {
      const inputs = row.querySelectorAll('.li-inp');
      if (inputs.length < 3) return;
      const qty   = parseFloat(inputs[1].value) || 0;
      const price = parseFloat((inputs[2].value || '0').replace(/[^0-9.]/g, '')) || 0;
      const total = qty * price;
      sub += total;
      const totalCell = row.querySelector('.li-total');
      if (totalCell) totalCell.textContent = 'R' + total.toLocaleString('en-ZA', {minimumFractionDigits:0,maximumFractionDigits:2});
    });
    const vatInput = document.getElementById('cq-vat');
    const vatRate = vatInput ? (parseFloat(vatInput.value) || 15) / 100 : 0.15;
    const vat = sub * vatRate;
    const grand = sub + vat;
    const fmt = v => 'R' + v.toLocaleString('en-ZA',{minimumFractionDigits:0,maximumFractionDigits:2});
    const subEl  = document.getElementById('cq-subtotal');
    const vatEl  = document.getElementById('cq-vat-amt');
    const grdEl  = document.getElementById('cq-grand');
    if (subEl)  subEl.textContent  = fmt(sub);
    if (vatEl)  vatEl.textContent  = fmt(vat);
    if (grdEl)  grdEl.textContent  = fmt(grand);
  }

  /* ── Create Quote panel ── */
  function openCreateQuote() {
    document.getElementById('cq-overlay').classList.add('open');
    document.getElementById('cq-panel').classList.add('open');
    calcQuoteTotals();
  }
  function closeCreateQuote() {
    document.getElementById('cq-overlay').classList.remove('open');
    document.getElementById('cq-panel').classList.remove('open');
  }
  function addQuoteLineItem() {
    const tbody = document.getElementById('cq-li-tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input class="li-inp" type="text" placeholder="Description…" oninput="calcQuoteTotals()"></td>
      <td><input class="li-inp" type="number" value="1" min="1" style="text-align:center" oninput="calcQuoteTotals()"></td>
      <td><input class="li-inp" type="text" placeholder="0.00" oninput="calcQuoteTotals()"></td>
      <td class="li-total" style="font-size:12px;color:var(--text-mid);text-align:right;padding-right:4px">—</td>
      <td><div class="li-del" onclick="this.closest('tr').remove();calcQuoteTotals()"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></div></td>`;
    tbody.appendChild(row);
    tbody.querySelectorAll('.li-inp[type=text]:first-child').length && row.querySelector('.li-inp').focus();
  }
  function saveQuoteDraft() {
    closeCreateQuote();
    _showToast('Quote QTE-007 saved as draft');
  }
  function sendQuote() {
    const client = document.getElementById('cq-client')?.value || 'Client';
    const num    = document.getElementById('cq-num')?.value    || 'QTE-007';
    closeCreateQuote();
    _showToast(`Quote ${num} sent to ${client || 'client'}`);
  }
  function convertQuoteToInvoice(qtNum, client, amount) {
    const invNum = 'INV-' + (1097 + Math.floor(Math.random()*10));
    _showToast(`${qtNum} converted to ${invNum} — ready to send`);
    // Switch to invoice list view
    switchInvView('list');
    // Update quote row status
    document.querySelectorAll('.inv-row').forEach(row => {
      const numEl = row.querySelector('.inv-num');
      if (numEl && numEl.textContent === qtNum) {
        const statusEl = row.querySelector('.qt-status');
        if (statusEl) { statusEl.className = 'qt-status accepted'; statusEl.textContent = 'Converted'; }
      }
    });
  }
  function openQuoteView(qtNum, client) {
    _showToast('Opening ' + qtNum + ' preview…');
  }
  function invFilterByStatus(status) {
    // Visual only — highlight relevant rows
    document.querySelectorAll('.inv-row').forEach(row => {
      const st = row.querySelector('.inv-status');
      if (!st) return;
      row.style.background = st.classList.contains(status) ? 'rgba(74,143,255,0.04)' : '';
    });
    setTimeout(() => document.querySelectorAll('.inv-row').forEach(r => r.style.background = ''), 1500);
  }

  /* ══ CUSTOMIZER RENDER ════════════════════════ */
  function renderCustomizer() {
    const list = document.getElementById('itp-section-list');
    if (!list) return;
    list.innerHTML = ITP.sections.map((s, idx) => {
      const m = SECTION_META[s.key];
      const isOn = s.on;
      const hasF = m.hasFields && ITP.fields[s.key];
      return `
        <div class="itp-section-row${m.draggable ? ' draggable' : ''}"
             id="itprow-${s.key}" data-key="${s.key}"
             ${m.draggable ? `draggable="true" ondragstart="itpDragStart(event,'${s.key}')" ondragover="itpDragOver(event,'${s.key}')" ondragleave="itpDragLeave(event,'${s.key}')" ondrop="itpDrop(event,'${s.key}')"` : ''}>
          <span class="itp-drag-handle" style="${m.draggable ? '' : 'opacity:0.15;cursor:default'}">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"/></svg>
          </span>
          <span class="itp-section-icon">${m.icon}</span>
          <span class="itp-section-name">${m.label}</span>
          ${m.locked ? '<span class="itp-locked-badge">locked</span>' : ''}
          ${hasF ? `<button class="itp-expand-btn" onclick="itpToggleFields('${s.key}')" title="Toggle fields">›</button>` : '<span style="width:18px"></span>'}
          <div class="itp-toggle${isOn ? ' on' : ''}${m.locked ? ' locked' : ''}"
               onclick="${m.locked ? '' : `itpToggleSection('${s.key}')`}"
               title="${m.locked ? 'This section cannot be removed' : (isOn ? 'Hide section' : 'Show section')}"></div>
        </div>
        ${hasF ? `<div class="itp-fields" id="itpfields-${s.key}">
          ${Object.entries(ITP.fields[s.key]).map(([fk, fv]) => `
            <div class="itp-field-row">
              <span class="itp-field-name">${FIELD_LABELS[fk] || fk}</span>
              <div class="itp-ftoggle${fv ? ' on' : ''}" onclick="itpToggleField('${s.key}','${fk}')" title="${fv ? 'Hide field' : 'Show field'}"></div>
            </div>`).join('')}
        </div>` : ''}`;
    }).join('');
  }

  /* ── Toggle section on/off ── */
  function itpToggleSection(key) {
    const s = ITP.sections.find(x => x.key === key);
    if (!s || SECTION_META[key].locked) return;
    s.on = !s.on;
    renderCustomizer();
    renderA4Preview();
  }

  /* ── Toggle field on/off ── */
  function itpToggleField(sectionKey, fieldKey) {
    if (ITP.fields[sectionKey]) {
      ITP.fields[sectionKey][fieldKey] = !ITP.fields[sectionKey][fieldKey];
      renderCustomizer();
      renderA4Preview();
    }
  }

  /* ── Expand/collapse field list ── */
  function itpToggleFields(key) {
    const el = document.getElementById('itpfields-' + key);
    if (!el) return;
    el.classList.toggle('open');
    const btn = document.querySelector(`#itprow-${key} .itp-expand-btn`);
    if (btn) btn.textContent = el.classList.contains('open') ? '›' : '›';
    if (el.classList.contains('open')) btn.style.transform = 'rotate(90deg)';
    else btn.style.transform = '';
  }

  /* ══ DRAG-DROP ════════════════════════════════ */
  function itpDragStart(e, key) {
    _itpDragKey = key;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const el = document.getElementById('itprow-' + key);
      if (el) el.classList.add('is-dragging');
    }, 0);
  }

  function itpDragOver(e, targetKey) {
    e.preventDefault();
    if (!_itpDragKey || _itpDragKey === targetKey) return;
    // Constraint: totals cannot go above lineItems
    const srcIdx = ITP.sections.findIndex(s => s.key === _itpDragKey);
    const tgtIdx = ITP.sections.findIndex(s => s.key === targetKey);
    if (_itpDragKey === 'totals') {
      const liIdx = ITP.sections.findIndex(s => s.key === 'lineItems');
      if (tgtIdx <= liIdx) { e.dataTransfer.dropEffect = 'none'; return; }
    }
    if (targetKey === 'lineItems' && _itpDragKey === 'totals') { e.dataTransfer.dropEffect = 'none'; return; }
    // Footer locked at bottom, title locked at pos 1
    if (!SECTION_META[targetKey].draggable) { e.dataTransfer.dropEffect = 'none'; return; }
    const el = document.getElementById('itprow-' + targetKey);
    if (el) {
      el.classList.remove('drag-top', 'drag-bot');
      el.classList.add(srcIdx < tgtIdx ? 'drag-bot' : 'drag-top');
    }
    e.dataTransfer.dropEffect = 'move';
  }

  function itpDragLeave(e, targetKey) {
    const el = document.getElementById('itprow-' + targetKey);
    if (el) el.classList.remove('drag-top', 'drag-bot');
  }

  function itpDrop(e, targetKey) {
    e.preventDefault();
    if (!_itpDragKey || _itpDragKey === targetKey) { _itpCleanDrag(); return; }
    const srcIdx = ITP.sections.findIndex(s => s.key === _itpDragKey);
    const tgtIdx = ITP.sections.findIndex(s => s.key === targetKey);
    // Constraints
    if (!SECTION_META[_itpDragKey].draggable || !SECTION_META[targetKey].draggable) { _itpCleanDrag(); return; }
    if (_itpDragKey === 'totals') {
      const liIdx = ITP.sections.findIndex(s => s.key === 'lineItems');
      if (tgtIdx <= liIdx) { _itpCleanDrag(); return; }
    }
    // Reorder
    const moved = ITP.sections.splice(srcIdx, 1)[0];
    const newTgt = ITP.sections.findIndex(s => s.key === targetKey);
    ITP.sections.splice(srcIdx < tgtIdx ? newTgt + 1 : newTgt, 0, moved);
    _itpCleanDrag();
    renderCustomizer();
    renderA4Preview();
  }

  function _itpCleanDrag() {
    document.querySelectorAll('.itp-section-row').forEach(el => {
      el.classList.remove('is-dragging', 'drag-top', 'drag-bot');
    });
    _itpDragKey = null;
  }

  /* ══ STYLE CONTROLS ══════════════════════════ */
  function itpSetAccent(color) {
    ITP.style.accent = color;
    const bar = document.getElementById('itp-a4-accent-bar');
    if (bar) bar.style.background = color;
    renderA4Preview();
  }

  function itpSetLogoAlign(val) {
    ITP.style.logoAlign = val;
    document.querySelectorAll('#itp-logo-seg button').forEach(b => {
      b.classList.toggle('active', b.dataset.val === val);
    });
    renderA4Preview();
  }

  function itpSetFontScale(val) {
    ITP.style.fontScale = parseFloat(val);
    document.querySelectorAll('#itp-font-seg button').forEach(b => {
      b.classList.toggle('active', parseFloat(b.dataset.val) === parseFloat(val));
    });
    renderA4Preview();
  }

  /* ══ ZOOM ═════════════════════════════════════ */
  function setItpZoom(z) {
    _itpZoom = z;
    [75,100,125].forEach(v => {
      const btn = document.getElementById('itp-zoom-' + v);
      if (btn) btn.classList.toggle('active', v === z);
    });
    const paper = document.getElementById('itp-a4-paper');
    if (paper) paper.style.transform = z === 100 ? '' : `scale(${z/100})`;
  }

  /* ══ A4 PREVIEW RENDER ════════════════════════ */
  function renderA4Preview() {
    const inner = document.getElementById('itp-a4-inner');
    if (!inner) return;
    const inv = MOCK_INVOICE;
    const fld = ITP.fields;
    const fs = ITP.style.fontScale;
    inner.style.fontSize = (12 * fs) + 'px';

    let html = '';
    for (const sec of ITP.sections) {
      if (!sec.on) continue;
      switch(sec.key) {

        case 'header': {
          const logoAlign = ITP.style.logoAlign;
          const flexDir = logoAlign === 'right' ? 'row-reverse' : 'row';
          html += `<div class="inv-doc-hdr" style="flex-direction:${flexDir}">`;
          if (fld.header && fld.header.logo)
            html += `<div class="inv-doc-logo" style="text-align:${logoAlign}">LOGO</div>`;
          html += `<div style="flex:1;${logoAlign==='center'?'text-align:center':''}">`;
          if (!fld.header || fld.header.companyName)
            html += `<div class="inv-doc-co-name">${inv.company.name}</div>`;
          if (!fld.header || fld.header.companyAddr)
            html += `<div class="inv-doc-co-line">${inv.company.addr}</div>
                     <div class="inv-doc-co-line">${inv.company.email}</div>`;
          html += `</div></div>`;
          break;
        }

        case 'title': {
          const pillMap = {sent:'sent',paid:'paid',overdue:'overdue',draft:'draft'};
          const pill = pillMap[inv.status] || 'draft';
          html += `<div class="inv-doc-title-row">
            <span class="inv-doc-title">INVOICE</span>
            <span class="inv-doc-pill ${pill}">${inv.status.toUpperCase()}</span>
          </div>`;
          break;
        }

        case 'client': {
          const mf = fld.meta || {};
          html += `<div class="inv-doc-two">
            <div class="inv-doc-bill">
              <div class="inv-doc-lbl">Bill To</div>`;
          if (!fld.client || fld.client.clientName)
            html += `<div class="inv-doc-client-name">${inv.client.name}</div>`;
          if (!fld.client || fld.client.clientAddr)
            html += `<div class="inv-doc-client-addr">${inv.client.addr.replace(/\n/g,'<br>')}</div>`;
          if (!fld.client || fld.client.clientEmail)
            html += `<div class="inv-doc-client-addr">${inv.client.email}</div>`;
          html += `</div>`;
          // Meta column inline when client section active
          const metaSec = ITP.sections.find(s => s.key === 'meta');
          if (!metaSec || !metaSec.on) {
            html += `<div class="inv-doc-meta"></div>`;
          } else {
            html += `<div class="inv-doc-meta"><table class="inv-doc-meta-tbl">`;
            if (!fld.meta || fld.meta.invoiceNum)
              html += `<tr><td class="inv-doc-meta-lbl">Invoice</td><td class="inv-doc-meta-val">${inv.num}</td></tr>`;
            if (!fld.meta || fld.meta.invoiceDate)
              html += `<tr><td class="inv-doc-meta-lbl">Date</td><td class="inv-doc-meta-val">${inv.date}</td></tr>`;
            if (!fld.meta || fld.meta.dueDate)
              html += `<tr><td class="inv-doc-meta-lbl">Due</td><td class="inv-doc-meta-val">${inv.due}</td></tr>`;
            if (!fld.meta || fld.meta.paymentMethod)
              html += `<tr><td class="inv-doc-meta-lbl">Payment</td><td class="inv-doc-meta-val">${inv.payment}</td></tr>`;
            if (fld.client && fld.client.clientRef)
              html += `<tr><td class="inv-doc-meta-lbl">Ref</td><td class="inv-doc-meta-val">${inv.client.ref}</td></tr>`;
            html += `</table></div>`;
          }
          html += `</div>`;
          break;
        }

        case 'meta': {
          // Only render standalone meta if client section is absent
          const clientSec = ITP.sections.find(s => s.key === 'client');
          if (clientSec && clientSec.on) break; // rendered inside client
          html += `<div style="margin-bottom:24px"><table class="inv-doc-meta-tbl" style="max-width:260px">`;
          if (!fld.meta || fld.meta.invoiceNum)
            html += `<tr><td class="inv-doc-meta-lbl">Invoice</td><td class="inv-doc-meta-val">${inv.num}</td></tr>`;
          if (!fld.meta || fld.meta.invoiceDate)
            html += `<tr><td class="inv-doc-meta-lbl">Date</td><td class="inv-doc-meta-val">${inv.date}</td></tr>`;
          if (!fld.meta || fld.meta.dueDate)
            html += `<tr><td class="inv-doc-meta-lbl">Due</td><td class="inv-doc-meta-val">${inv.due}</td></tr>`;
          if (!fld.meta || fld.meta.paymentMethod)
            html += `<tr><td class="inv-doc-meta-lbl">Payment</td><td class="inv-doc-meta-val">${inv.payment}</td></tr>`;
          html += `</table></div>`;
          break;
        }

        case 'lineItems': {
          html += `<table class="inv-doc-tbl">
            <thead><tr>
              <th style="width:auto">Description</th>
              ${!fld.lineItems || fld.lineItems.qty ? '<th style="width:50px;text-align:center">Qty</th>' : ''}
              ${!fld.lineItems || fld.lineItems.unitPrice ? '<th style="width:90px;text-align:right">Unit Price</th>' : ''}
              ${fld.lineItems && fld.lineItems.discount ? '<th style="width:80px;text-align:right">Discount</th>' : ''}
              ${fld.lineItems && fld.lineItems.tax ? '<th style="width:70px;text-align:right">Tax</th>' : ''}
              <th style="width:90px;text-align:right">Total</th>
            </tr></thead>
            <tbody>`;
          for (const line of inv.lines) {
            html += `<tr>
              <td class="inv-doc-tbl-desc">${line.desc}</td>
              ${!fld.lineItems || fld.lineItems.qty ? `<td class="inv-doc-tbl-num">${line.qty}</td>` : ''}
              ${!fld.lineItems || fld.lineItems.unitPrice ? `<td class="inv-doc-tbl-num">${itpFmt(line.unit)}</td>` : ''}
              ${fld.lineItems && fld.lineItems.discount ? '<td class="inv-doc-tbl-num">—</td>' : ''}
              ${fld.lineItems && fld.lineItems.tax ? '<td class="inv-doc-tbl-num">15%</td>' : ''}
              <td class="inv-doc-tbl-num"><strong>${itpFmt(line.total)}</strong></td>
            </tr>`;
          }
          html += `</tbody></table>`;
          break;
        }

        case 'totals': {
          html += `<div class="inv-doc-tots">`;
          if (!fld.totals || fld.totals.subtotal)
            html += `<div class="inv-doc-tot-row"><span>Subtotal</span><span>${itpFmt(inv.subtotal)}</span></div>`;
          if (!fld.totals || fld.totals.tax)
            html += `<div class="inv-doc-tot-row"><span>VAT (15%)</span><span>${itpFmt(inv.tax)}</span></div>`;
          if (fld.totals && fld.totals.discount)
            html += `<div class="inv-doc-tot-row"><span>Discount</span><span style="color:#16a34a">— R0</span></div>`;
          if (!fld.totals || fld.totals.total)
            html += `<div class="inv-doc-tot-row grand">
              <span>Total Due</span><span>${itpFmt(inv.total)}</span>
            </div>
            <div class="inv-doc-tot-row balance">
              <span>Balance Due</span><span style="color:#1d4ed8">${itpFmt(inv.total)}</span>
            </div>`;
          html += `</div>`;
          break;
        }

        case 'notes':
          html += `<div class="inv-doc-prose-section">
            <div class="inv-doc-section-title">Notes</div>
            <p class="inv-doc-prose">${inv.notes}</p>
          </div>`;
          break;

        case 'terms':
          html += `<div class="inv-doc-prose-section">
            <div class="inv-doc-section-title">Terms &amp; Conditions</div>
            <p class="inv-doc-prose">${inv.terms}</p>
          </div>`;
          break;

        case 'payment': {
          html += `<div class="inv-doc-prose-section">
            <div class="inv-doc-section-title">Payment Details</div>
            <div class="inv-doc-pay-grid">`;
          if (!fld.payment || fld.payment.bankName)
            html += `<div class="inv-doc-pay-row"><span class="inv-doc-pay-lbl">Bank</span><span class="inv-doc-pay-val">${inv.bank.name}</span></div>`;
          if (!fld.payment || fld.payment.accountNum)
            html += `<div class="inv-doc-pay-row"><span class="inv-doc-pay-lbl">Account</span><span class="inv-doc-pay-val">${inv.bank.account}</span></div>`;
          if (!fld.payment || fld.payment.branch)
            html += `<div class="inv-doc-pay-row"><span class="inv-doc-pay-lbl">Branch</span><span class="inv-doc-pay-val">${inv.bank.branch}</span></div>`;
          if (!fld.payment || fld.payment.reference)
            html += `<div class="inv-doc-pay-row"><span class="inv-doc-pay-lbl">Reference</span><span class="inv-doc-pay-val">${inv.bank.ref}</span></div>`;
          html += `</div></div>`;
          break;
        }

        case 'footer':
          html += `<div class="inv-doc-footer">${inv.footerText}</div>`;
          break;
      }
    }

    inner.innerHTML = html;
    // Apply accent to title text
    const titleEl = inner.querySelector('.inv-doc-title');
    if (titleEl) titleEl.style.color = ITP.style.accent;
  }

  /* ══ RESET ════════════════════════════════════ */
  function itpReset() {
    ITP = JSON.parse(JSON.stringify(DEFAULT_TEMPLATE));
    _itpZoom = 100;
    // Reset UI controls
    const accentInput = document.getElementById('itp-accent-input');
    if (accentInput) accentInput.value = '#2563eb';
    const bar = document.getElementById('itp-a4-accent-bar');
    if (bar) bar.style.background = '#2563eb';
    setItpZoom(100);
    document.querySelectorAll('#itp-logo-seg button').forEach(b => b.classList.toggle('active', b.dataset.val === 'left'));
    document.querySelectorAll('#itp-font-seg button').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.val) === 1));
    renderCustomizer();
    renderA4Preview();
  }

  /* ══ SAVE MODAL ═══════════════════════════════ */
  function openSaveModal() {
    const modal = document.getElementById('itp-save-modal');
    if (modal) modal.classList.add('open');
    const inp = document.getElementById('itp-save-name');
    if (inp) inp.focus();
  }
  function closeSaveModal() {
    const modal = document.getElementById('itp-save-modal');
    if (modal) modal.classList.remove('open');
  }
  function confirmSaveTemplate() {
    const inp = document.getElementById('itp-save-name');
    const name = inp ? inp.value.trim() : 'Default';
    saveItpTemplate(name || 'Default');
    closeSaveModal();
    // Show brief toast
    const toast = document.createElement('div');
    toast.textContent = '\u2713 Template "' + (name || 'Default') + '" saved';
    Object.assign(toast.style, { position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
      background:'#111', color:'#fff', padding:'10px 20px', borderRadius:'8px', fontSize:'13px',
      fontWeight:'600', zIndex:'9999', pointerEvents:'none', transition:'opacity 0.3s' });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
  }

  /* ══ LOCALSTORAGE PERSISTENCE ════════════════ */
  function saveItpTemplate(name) {
    try { localStorage.setItem('itp_default_template', JSON.stringify({ name, template: ITP })); } catch(e) {}
  }
  function loadItpTemplate() {
    try {
      const raw = localStorage.getItem('itp_default_template');
      if (raw) { const saved = JSON.parse(raw); if (saved.template) ITP = saved.template; }
    } catch(e) {}
    // Sync style controls from loaded state
    const inp = document.getElementById('itp-accent-input');
    if (inp) inp.value = ITP.style.accent || '#2563eb';
    const bar = document.getElementById('itp-a4-accent-bar');
    if (bar) bar.style.background = ITP.style.accent || '#2563eb';
    document.querySelectorAll('#itp-logo-seg button').forEach(b => b.classList.toggle('active', b.dataset.val === (ITP.style.logoAlign || 'left')));
    document.querySelectorAll('#itp-font-seg button').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.val) === (ITP.style.fontScale || 1)));
  }

  /* ── Extra inv-doc CSS (inject at runtime) ── */
  (function injectItpDocCss() {
    const s = document.createElement('style');
    s.textContent = `
      .inv-doc-meta-tbl td { padding:2px 8px 2px 0; }
      .inv-doc-meta-lbl { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#bbb; white-space:nowrap; }
      .inv-doc-meta-val { font-size:11px; color:#333; font-weight:600; }
      .inv-doc-tbl { width:100%; border-collapse:collapse; margin-bottom:20px; }
      .inv-doc-tbl thead th { font-size:9px; font-weight:800; text-transform:uppercase; color:#bbb; letter-spacing:0.06em; padding:0 8px 8px; border-bottom:1.5px solid #e5e7eb; }
      .inv-doc-tbl tbody tr { border-bottom:1px solid #f3f4f6; }
      .inv-doc-tbl tbody tr:last-child { border-bottom:none; }
      .inv-doc-tbl-desc { padding:9px 8px; font-size:11.5px; color:#222; }
      .inv-doc-tbl-num { padding:9px 8px; text-align:right; font-size:11.5px; color:#444; }
      .inv-doc-tots { display:flex; flex-direction:column; align-items:flex-end; margin-bottom:24px; min-width:240px; align-self:flex-end; }
      .inv-doc-tot-row { display:flex; justify-content:space-between; gap:32px; padding:4px 0; font-size:11.5px; color:#555; min-width:220px; }
      .inv-doc-tot-row.grand { border-top:1.5px solid #e5e7eb; margin-top:4px; padding-top:8px; font-weight:700; color:#111; font-size:13px; }
      .inv-doc-tot-row.balance { background:#f0f5ff; border-radius:6px; padding:8px 12px; margin-top:8px; font-weight:700; font-size:13px; color:#1d4ed8; min-width:220px; }
      .inv-doc-prose-section { margin-bottom:20px; }
      .inv-doc-section-title { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#bbb; margin-bottom:8px; }
      .inv-doc-prose { font-size:11px; color:#555; line-height:1.65; margin:0; }
      .inv-doc-pay-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 24px; }
      .inv-doc-pay-row { display:flex; gap:8px; align-items:baseline; padding:3px 0; }
      .inv-doc-pay-lbl { font-size:10px; color:#999; min-width:68px; }
      .inv-doc-pay-val { font-size:11px; font-weight:600; color:#222; }
      .inv-doc-footer { margin-top:auto; padding-top:20px; border-top:1px solid #e5e7eb; font-size:9px; color:#bbb; text-align:center; letter-spacing:0.02em; }
      #inv-list-view { display:flex; flex-direction:column; flex:1; overflow:hidden; }
      .itp-modal-hdr { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
      .itp-modal-title { flex:1; font-size:15px; font-weight:700; color:#E4EBF5; }
      .itp-modal-body { margin-bottom:16px; }
      .itp-modal-foot { display:flex; gap:8px; }
    `;
    document.head.appendChild(s);
  })();


  /* ═══════════════════════════════════════════════
     INVOICE ACTION HANDLERS
  ═══════════════════════════════════════════════ */

  /* ── Helpers ── */
  function _iaFmt(n){ return 'R' + Number(n).toLocaleString('en-ZA'); }
  function _showToast(msg, duration=2500) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style,{position:'fixed',bottom:'28px',left:'50%',transform:'translateX(-50%)',
      background:'#111',color:'#fff',padding:'10px 20px',borderRadius:'8px',fontSize:'13px',
      fontWeight:'600',zIndex:'9999',pointerEvents:'none',transition:'opacity 0.3s',whiteSpace:'nowrap'});
    document.body.appendChild(t);
    setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),300); },duration);
  }

  /* ══ RECORD PAYMENT ══════════════════════════ */
  function openRecordPayment(invNum, client, amount, status) {
    document.getElementById('rp-num').textContent = invNum;
    document.getElementById('rp-client').textContent = client;
    document.getElementById('rp-inv-amount').textContent = _iaFmt(amount);
    const statusLabels = {overdue:'Overdue — payment required', sent:'Sent — awaiting payment',
      partial:'Partially paid — balance due', paid:'Paid in full'};
    document.getElementById('rp-status-line').textContent = statusLabels[status] || 'Invoice';
    document.getElementById('rp-amount').value = _iaFmt(amount);
    // Default to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('rp-date').value = today;
    document.getElementById('rp-ref').value = '';
    document.getElementById('rp-notes').value = '';
    document.getElementById('rp-overlay').classList.add('open');
    setTimeout(()=>document.getElementById('rp-amount').focus(),150);
  }
  function closeRecordPayment() {
    document.getElementById('rp-overlay').classList.remove('open');
  }
  function confirmRecordPayment() {
    const inv = document.getElementById('rp-num').textContent;
    const client = document.getElementById('rp-client').textContent;
    const amount = document.getElementById('rp-amount').value || '0';
    const date = document.getElementById('rp-date').value;
    const method = document.getElementById('rp-method').value;
    closeRecordPayment();
    _showToast(`✓ Payment recorded — ${inv} · ${client} · ${amount}`);
    // Update the status pill in the invoice table
    document.querySelectorAll('.inv-row').forEach(row => {
      const numEl = row.querySelector('.inv-num');
      if (numEl && numEl.textContent === inv) {
        const statusEl = row.querySelector('.inv-status');
        const dueEl = row.querySelector('.inv-due-val');
        if (statusEl) { statusEl.className = 'inv-status paid'; statusEl.textContent = 'Paid'; }
        if (dueEl) { dueEl.className = 'inv-due-val'; dueEl.style.color = 'var(--success)'; dueEl.textContent = 'Paid ' + (date ? new Date(date).toLocaleDateString('en-ZA',{day:'numeric',month:'short'}) : 'today'); }
        // Update action buttons
        const actDiv = row.querySelector('.inv-actions');
        if (actDiv) actDiv.innerHTML = `<span class="inv-action-btn" onclick="openInvoiceView('${inv}','${client}','${amount}','paid')">View</span><span class="inv-action-btn" onclick="downloadInvoicePDF('${inv}')">Download PDF</span><span class="inv-action-btn" onclick="openInvMenu(this,'${inv}','${client}','${amount}','paid')">⋯</span>`;
      }
    });
  }

  /* ══ SEND INVOICE / REMINDER ═════════════════ */
  function openSendInvoice(invNum, client, mode) {
    const isReminder = mode === 'reminder';
    const isResend   = mode === 'resend';
    document.getElementById('si-title').textContent = isReminder ? 'Send Payment Reminder' : isResend ? 'Resend Invoice' : 'Send Invoice';
    document.getElementById('si-send-btn').querySelector('span')||null;
    document.getElementById('si-num').textContent = invNum;
    document.getElementById('si-client').textContent = client;
    document.getElementById('si-meta').textContent = isReminder ? 'Payment reminder email' : 'Invoice email with PDF attachment';
    const emailMap = {'Legal Clear':'accounts@legalclear.com','Global Corp':'finance@globalcorp.co.za',
      'Fin Services':'billing@finservices.co.za','Axis Medical':'admin@axismedical.co.za',
      'Nexalink':'finance@nexalink.co.za','Summit Holdings':'accounts@summitholdings.co.za',
      'CoreTech':'finance@coretech.co.za','Vantage Capital':'ap@vantagecapital.co.za'};
    document.getElementById('si-to').value = emailMap[client] || 'client@company.com';
    document.getElementById('si-subject').value = isReminder
      ? `Payment Reminder — ${invNum} — Novatrai Legal`
      : `Invoice ${invNum} — Novatrai Legal`;
    document.getElementById('si-message').value = isReminder
      ? `Dear ${client} team,\n\nThis is a friendly reminder that ${invNum} is now overdue. Please arrange payment at your earliest convenience.\n\nKind regards,\nNovatrai Legal`
      : `Dear ${client} team,\n\nPlease find attached your invoice ${invNum} from Novatrai Legal.\n\nKind regards,\nNovatrai Legal`;
    document.getElementById('si-overlay').classList.add('open');
    setTimeout(()=>document.getElementById('si-to').focus(),150);
  }
  function openSendReminder(invNum, client) { openSendInvoice(invNum, client, 'reminder'); }
  function closeSendInvoice() { document.getElementById('si-overlay').classList.remove('open'); }
  function confirmSendInvoice() {
    const inv = document.getElementById('si-num').textContent;
    const to  = document.getElementById('si-to').value;
    closeSendInvoice();
    _showToast(`✓ Invoice sent — ${inv} → ${to}`);
    // Update status to sent
    document.querySelectorAll('.inv-row').forEach(row => {
      const numEl = row.querySelector('.inv-num');
      if (numEl && numEl.textContent === inv) {
        const statusEl = row.querySelector('.inv-status');
        if (statusEl && statusEl.textContent === 'Draft') {
          statusEl.className = 'inv-status sent'; statusEl.textContent = 'Sent';
        }
      }
    });
  }

  /* ══ VIEW INVOICE ════════════════════════════ */
  function openInvoiceView(invNum, client, amount, status) {
    document.getElementById('inv-view-panel-title').textContent = invNum + ' · ' + client;
    // Set accent bar
    const bar = document.getElementById('inv-view-accent-bar');
    bar.style.background = '#2563eb';
    // Render a mini A4 document
    const statusPills = {sent:'<span style="display:inline-flex;align-items:center;font-size:9px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;padding:3px 9px;border-radius:12px;background:#eff6ff;color:#1d4ed8">SENT</span>',
      paid:'<span style="display:inline-flex;align-items:center;font-size:9px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;padding:3px 9px;border-radius:12px;background:#f0fdf4;color:#15803d">PAID</span>',
      overdue:'<span style="display:inline-flex;align-items:center;font-size:9px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;padding:3px 9px;border-radius:12px;background:#fef2f2;color:#dc2626">OVERDUE</span>',
      partial:'<span style="display:inline-flex;align-items:center;font-size:9px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;padding:3px 9px;border-radius:12px;background:#fffbeb;color:#b45309">PARTIAL</span>',
      draft:'<span style="display:inline-flex;align-items:center;font-size:9px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;padding:3px 9px;border-radius:12px;background:#f9fafb;color:#6b7280">DRAFT</span>'};
    const pill = statusPills[status] || statusPills.sent;
    const amt = Number(amount);
    const subtotal = Math.round(amt / 1.15);
    const vat = amt - subtotal;
    document.getElementById('inv-view-a4-inner').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
        <div>
          <div style="font-size:13px;font-weight:800;color:#111">Novatrai Legal</div>
          <div style="font-size:10px;color:#777;line-height:1.6">123 Business Park, Cape Town, 8001<br>info@novatrai.com · novatrai.com</div>
        </div>
        <div style="width:72px;height:28px;background:#e5e7eb;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#bbb">LOGO</div>
      </div>
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:24px">
        <div style="font-size:30px;font-weight:800;letter-spacing:-0.025em;color:#2563eb">INVOICE</div>
        ${pill}
      </div>
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="flex:1">
          <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#bbb;margin-bottom:5px">Bill To</div>
          <div style="font-size:12px;font-weight:700;color:#111">${client}</div>
          <div style="font-size:10px;color:#555;line-height:1.6">accounts@${client.toLowerCase().replace(/\s+/g,'')}.co.za</div>
        </div>
        <div style="width:200px;flex-shrink:0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbb;padding:2px 6px 2px 0">Invoice</td><td style="font-size:11px;font-weight:600;color:#333;padding:2px 0">${invNum}</td></tr>
            <tr><td style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbb;padding:2px 6px 2px 0">Date</td><td style="font-size:11px;font-weight:600;color:#333;padding:2px 0">24 February 2026</td></tr>
            <tr><td style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbb;padding:2px 6px 2px 0">Due</td><td style="font-size:11px;font-weight:600;color:#333;padding:2px 0">31 March 2026</td></tr>
            <tr><td style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbb;padding:2px 6px 2px 0">Payment</td><td style="font-size:11px;font-weight:600;color:#333;padding:2px 0">EFT</td></tr>
          </table>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <thead><tr>
          <th style="text-align:left;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbb;padding:0 6px 8px;border-bottom:1.5px solid #e5e7eb">Description</th>
          <th style="text-align:center;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbb;padding:0 6px 8px;border-bottom:1.5px solid #e5e7eb;width:40px">Qty</th>
          <th style="text-align:right;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbb;padding:0 6px 8px;border-bottom:1.5px solid #e5e7eb;width:90px">Unit Price</th>
          <th style="text-align:right;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#bbb;padding:0 0 8px;border-bottom:1.5px solid #e5e7eb;width:90px">Total</th>
        </tr></thead>
        <tbody>
          <tr><td style="padding:9px 6px;font-size:11px;color:#222;border-bottom:1px solid #f3f4f6">Professional Services — ${client}</td><td style="padding:9px 6px;font-size:11px;text-align:center;color:#444;border-bottom:1px solid #f3f4f6">1</td><td style="padding:9px 6px;font-size:11px;text-align:right;color:#444;border-bottom:1px solid #f3f4f6">R${subtotal.toLocaleString('en-ZA')}</td><td style="padding:9px 0;font-size:11px;text-align:right;color:#222;font-weight:600;border-bottom:1px solid #f3f4f6">R${subtotal.toLocaleString('en-ZA')}</td></tr>
        </tbody>
      </table>
      <div style="display:flex;flex-direction:column;align-items:flex-end;margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;gap:32px;min-width:210px;padding:3px 0;font-size:11px;color:#555"><span>Subtotal</span><span>R${subtotal.toLocaleString('en-ZA')}</span></div>
        <div style="display:flex;justify-content:space-between;gap:32px;min-width:210px;padding:3px 0;font-size:11px;color:#555"><span>VAT (15%)</span><span>R${vat.toLocaleString('en-ZA')}</span></div>
        <div style="display:flex;justify-content:space-between;gap:32px;min-width:210px;padding:8px 0 0;margin-top:4px;border-top:1.5px solid #e5e7eb;font-size:13px;font-weight:700;color:#111"><span>Total Due</span><span>R${amt.toLocaleString('en-ZA')}</span></div>
        <div style="display:flex;justify-content:space-between;gap:32px;min-width:210px;padding:8px 12px;margin-top:8px;background:#eff6ff;border-radius:6px;font-size:13px;font-weight:700;color:#1d4ed8"><span>Balance Due</span><span>R${amt.toLocaleString('en-ZA')}</span></div>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#bbb;margin-bottom:6px">Payment Details</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px">
          <div style="display:flex;gap:8px;padding:2px 0;font-size:10px"><span style="color:#999;min-width:60px">Bank</span><span style="font-weight:600;color:#222">FNB Business Bank</span></div>
          <div style="display:flex;gap:8px;padding:2px 0;font-size:10px"><span style="color:#999;min-width:60px">Account</span><span style="font-weight:600;color:#222">62851234567</span></div>
          <div style="display:flex;gap:8px;padding:2px 0;font-size:10px"><span style="color:#999;min-width:60px">Branch</span><span style="font-weight:600;color:#222">250655</span></div>
          <div style="display:flex;gap:8px;padding:2px 0;font-size:10px"><span style="color:#999;min-width:60px">Reference</span><span style="font-weight:600;color:#222">${invNum}</span></div>
        </div>
      </div>
      <div style="margin-top:auto;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#bbb;text-align:center;letter-spacing:0.02em">Novatrai Legal (Pty) Ltd · Reg: 2019/123456/07 · VAT: 4321098765 · novatrai.com</div>
    `;
    // Store current invoice state (used by header toolbar buttons via _ivCurrent)
    _ivCurrent = { num: invNum, client, amount, status };
    // Set header badge
    const badge = document.getElementById('inv-view-badge');
    const badgeMap = { paid:'PAID', sent:'SENT', overdue:'OVERDUE', partial:'PARTIAL', draft:'DRAFT' };
    badge.textContent  = badgeMap[status] || 'SENT';
    badge.className    = 'inv-view-hdr-badge ' + (status || 'sent');
    // Show Record Payment only when balance is outstanding
    const rpBtn = document.getElementById('inv-view-rp-btn');
    rpBtn.style.display = ['overdue','sent','partial'].includes(status) ? '' : 'none';
    // Accent bar colour by status
    const barColours = { paid:'#16a34a', sent:'#2563eb', overdue:'#dc2626', partial:'#d97706', draft:'#6b7280' };
    document.getElementById('inv-view-accent-bar').style.background = barColours[status] || '#2563eb';
    // Open lightbox — panel animates via CSS (it is a child of the overlay)
    document.getElementById('inv-view-overlay').classList.add('open');
    // Small rAF delay so the panel CSS transition fires after display:flex kicks in
    requestAnimationFrame(() => {
      document.getElementById('inv-view-panel').classList.add('open');
    });
  }
  function closeInvoiceView() {
    document.getElementById('inv-view-panel').classList.remove('open');
    // Wait for exit animation then hide overlay
    setTimeout(() => {
      document.getElementById('inv-view-overlay').classList.remove('open');
      _ivCurrent = null;
    }, 280);
  }

  /* ══ DOWNLOAD PDF ════════════════════════════ */
  function downloadInvoicePDF(invNum) {
    _showToast(`↓ Downloading ${invNum}.pdf…`);
    setTimeout(()=>_showToast(`✓ ${invNum}.pdf downloaded`), 1200);
  }

  /* ══ SAVE DRAFT ══════════════════════════════ */
  function saveDraftInvoice() {
    // Save to localStorage drafts list
    const drafts = JSON.parse(localStorage.getItem('inv_drafts') || '[]');
    const invNum = document.querySelector('#ci-panel .ci-input[value="INV-1097"]')?.value || 'INV-1097';
    const draft = { num:invNum, client:'New Client', date:new Date().toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'}), amount:'R18,975', savedAt: Date.now() };
    drafts.unshift(draft);
    try { localStorage.setItem('inv_drafts', JSON.stringify(drafts.slice(0,20))); } catch(e) {}
    closeCreateInvoice();
    // Show banner
    const banner = document.getElementById('draft-banner');
    document.getElementById('draft-banner-sub').textContent = `${invNum} saved to Drafts`;
    banner.classList.add('show');
    setTimeout(()=>banner.classList.remove('show'), 5000);
  }
  function closeDraftBanner() {
    document.getElementById('draft-banner').classList.remove('show');
  }

  /* ── Invoice lifecycle enhancer: add lifecycle tracks to demo rows ── */
  (function() {
    function enhanceInvoiceRows() {
      var rows = document.querySelectorAll('#inv-list-view .inv-table tbody .inv-row');
      for (var i = 0; i < rows.length; i++) {
        var statusEl = rows[i].querySelector('.inv-status');
        if (!statusEl || statusEl.getAttribute('data-os-done')) continue;
        statusEl.setAttribute('data-os-done', '1');

        // Determine status from class
        var st = 'draft';
        if (statusEl.classList.contains('sent'))    st = 'sent';
        if (statusEl.classList.contains('paid'))    st = 'paid';
        if (statusEl.classList.contains('overdue')) st = 'overdue';
        if (statusEl.classList.contains('partial')) st = 'partial';

        if (typeof _osInvoiceLifeHtml === 'function') {
          var lifeHtml = _osInvoiceLifeHtml(st);
          var wrapper = document.createElement('div');
          wrapper.style.cssText = 'margin-top:4px';
          wrapper.innerHTML = lifeHtml;
          statusEl.parentNode.insertBefore(wrapper, statusEl.nextSibling);
        }
      }
    }
    // Run after DOM and after any JS renders
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { setTimeout(enhanceInvoiceRows, 300); });
    } else {
      setTimeout(enhanceInvoiceRows, 300);
    }
    // Also run when switching to invoices screen
    var _invHookInt = setInterval(function() {
      if (typeof window.switchScreen !== "function") return;
      clearInterval(_invHookInt);
      var _origSwInv = window.switchScreen;
      window.switchScreen = function(name) {
        _origSwInv(name);
        if (name === "invoices") setTimeout(enhanceInvoiceRows, 100);
      };
    }, 100);
  })();

  /* ══ BOS-NATIVE INVOICE → DOCUMENT-INSTANCE + CASE LINK ═══════ */

  // ── State for case selector ──
  var _invSelectedCase = null;  // { id, case_number, title }
  var _invCaseSearchTimer = null;
  var _invCasesCache = [];

  // ── Case search (debounced) ──
  window.invCaseSearch = function(query) {
    clearTimeout(_invCaseSearchTimer);
    _invCaseSearchTimer = setTimeout(function() { _invCaseDoSearch(query); }, 250);
  };

  function _invCaseDoSearch(query) {
    var dd = document.getElementById('ci-case-dropdown');
    if (!dd) return;

    // Try /api/cases/my?q= first, fall back to /api/cases?limit=50
    var path = (query && query.length >= 2)
      ? '/cases/my?q=' + encodeURIComponent(query) + '&limit=20'
      : '/cases?limit=50&status=OPEN';

    novatraiApi(path, null, function(err, data) {
      if (err) {
        // Fallback: filter cached results client-side
        if (_invCasesCache.length) {
          _invCaseRenderDropdown(_invCaseFilterLocal(_invCasesCache, query));
          return;
        }
        // Try broader endpoint
        novatraiApi('/cases?limit=50', null, function(err2, data2) {
          if (err2) { dd.style.display = 'none'; return; }
          var items = _myDayNormItems ? _myDayNormItems(data2) : (Array.isArray(data2) ? data2 : []);
          _invCasesCache = items;
          _invCaseRenderDropdown(_invCaseFilterLocal(items, query));
        });
        return;
      }
      var items = _myDayNormItems ? _myDayNormItems(data) : (Array.isArray(data) ? data : []);
      _invCasesCache = items.length > _invCasesCache.length ? items : _invCasesCache;
      _invCaseRenderDropdown(items);
    });
  }

  function _invCaseFilterLocal(items, query) {
    if (!query || query.length < 2) return items.slice(0, 15);
    var q = query.toLowerCase();
    return items.filter(function(c) {
      return (c.title && c.title.toLowerCase().indexOf(q) !== -1) ||
             (c.case_number && c.case_number.toLowerCase().indexOf(q) !== -1);
    }).slice(0, 15);
  }

  function _invCaseRenderDropdown(items) {
    var dd = document.getElementById('ci-case-dropdown');
    if (!dd) return;
    if (!items || !items.length) {
      dd.innerHTML = '<div class="ci-case-dd-empty">No cases found</div>';
      dd.style.display = 'block';
      return;
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var c = items[i];
      var num = c.case_number || '';
      var title = c.title || '';
      var st = c.status || '';
      html += '<div class="ci-case-dd-item" onclick="invCaseSelect(\'' +
        (c.id || '').replace(/'/g, "\\'") + '\',\'' +
        num.replace(/'/g, "\\'") + '\',\'' +
        title.replace(/'/g, "\\'") + '\')">' +
        '<span class="ci-case-dd-num">' + _escHtml(num) + '</span> ' +
        '<span class="ci-case-dd-title">' + _escHtml(title) + '</span>' +
        '<span class="ci-case-dd-status">' + _escHtml(st) + '</span>' +
        '</div>';
    }
    dd.innerHTML = html;
    dd.style.display = 'block';
  }

  function _escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.invCaseSelect = function(id, num, title) {
    _invSelectedCase = { id: id, case_number: num, title: title };
    var dd = document.getElementById('ci-case-dropdown');
    if (dd) dd.style.display = 'none';
    var search = document.getElementById('ci-case-search');
    if (search) search.style.display = 'none';
    var sel = document.getElementById('ci-case-selected');
    if (sel) sel.style.display = 'block';
    var pill = document.getElementById('ci-case-pill-text');
    if (pill) pill.textContent = num + ' · ' + title;
  };

  window.invCaseClear = function() {
    _invSelectedCase = null;
    var sel = document.getElementById('ci-case-selected');
    if (sel) sel.style.display = 'none';
    var search = document.getElementById('ci-case-search');
    if (search) { search.style.display = ''; search.value = ''; }
  };

  // Close dropdown on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest || !e.target.closest('#ci-case-search') && !e.target.closest('#ci-case-dropdown')) {
      var dd = document.getElementById('ci-case-dropdown');
      if (dd) dd.style.display = 'none';
    }
  });

  // ── Collect invoice form payload ──
  function _invCollectPayload() {
    var client   = (document.getElementById('ci-client') || {}).value || '';
    var invNum   = (document.getElementById('ci-inv-num') || {}).value || 'INV-1097';
    var invDate  = (document.getElementById('ci-inv-date') || {}).value || '';
    var dueDate  = (document.getElementById('ci-due-date') || {}).value || '';
    var payMethod= (document.getElementById('ci-pay-method') || {}).value || 'EFT';
    var vat      = (document.getElementById('ci-vat') || {}).value || '15%';
    var notes    = (document.getElementById('ci-notes') || {}).value || '';

    // Collect line items
    var lines = [];
    var rows = document.querySelectorAll('#li-tbody tr');
    for (var i = 0; i < rows.length; i++) {
      var inputs = rows[i].querySelectorAll('.li-inp');
      if (inputs.length < 3) continue;
      lines.push({
        description: inputs[0].value || '',
        qty: parseFloat(inputs[1].value) || 0,
        unit_price: parseFloat((inputs[2].value || '0').replace(/[^0-9.]/g, '')) || 0
      });
    }

    // Read totals from DOM
    var totalEl = document.querySelector('#ci-panel .ci-total-row.grand span:last-child');
    var totalText = totalEl ? totalEl.textContent : '';

    return {
      invoice_number: invNum,
      client: client,
      invoice_date: invDate,
      due_date: dueDate,
      payment_method: payMethod,
      vat_rate: vat,
      notes: notes,
      line_items: lines,
      total: totalText,
      currency: 'ZAR'
    };
  }

  // ── Save to backend: POST /api/document-instances ──
  window.invSaveDraftToBackend = function(mode) {
    var payload = _invCollectPayload();
    if (!payload.client && !payload.line_items.length) {
      if (window.showToast) window.showToast('Add a client or line items first');
      return;
    }

    var title = payload.invoice_number + ': ' + (payload.client || 'New Client');
    var status = (mode === 'send') ? 'SENT' : 'DRAFT';

    var body = {
      title: title,
      status: status,
      data_json: payload
    };

    // Add case link if selected
    if (_invSelectedCase && _invSelectedCase.id) {
      body.link_to = {
        entityType: 'Case',
        entityId: _invSelectedCase.id,
        link_type: 'finance.invoice'
      };
    }

    novatraiApi('/document-instances', { method: 'POST', body: body }, function(err, data) {
      if (err) {
        // Fallback: save to localStorage like before, but still show toast
        _invLocalFallbackSave(payload, status);
        return;
      }

      var docId = data && (data.id || (data.data && data.data.id));
      closeCreateInvoice();

      // Inject row into invoice table
      _invInjectRow(payload, status, docId, _invSelectedCase);

      // Reset case selector
      invCaseClear();

      if (window.showToast) window.showToast('Invoice Draft Created');
    });
  };

  // ── Fallback: save to localStorage if backend not available ──
  function _invLocalFallbackSave(payload, status) {
    var drafts = JSON.parse(localStorage.getItem('inv_drafts') || '[]');
    var draft = {
      num: payload.invoice_number,
      client: payload.client || 'New Client',
      date: payload.invoice_date,
      amount: payload.total,
      status: status.toLowerCase(),
      case_id: _invSelectedCase ? _invSelectedCase.id : null,
      case_number: _invSelectedCase ? _invSelectedCase.case_number : null,
      savedAt: Date.now()
    };
    drafts.unshift(draft);
    try { localStorage.setItem('inv_drafts', JSON.stringify(drafts.slice(0, 20))); } catch(e) {}

    closeCreateInvoice();
    _invInjectRow(payload, status, null, _invSelectedCase);
    invCaseClear();
    if (window.showToast) window.showToast('Invoice Draft Created (offline)');
  }

  // ── Inject a new row at top of invoice table ──
  function _invInjectRow(payload, status, docId, linkedCase) {
    var tbody = document.querySelector('#inv-list-view .inv-table tbody');
    if (!tbody) return;

    var stLower = (status || 'draft').toLowerCase();
    var client = _escHtml(payload.client || 'New Client');
    var invNum = _escHtml(payload.invoice_number || 'INV-????');
    var total  = _escHtml(payload.total || 'R0');
    var dueDate = _escHtml(payload.due_date || '—');
    var meta = _escHtml(payload.invoice_date + ' · ' + payload.payment_method);

    // Build Linked / actions cell
    var linkedHtml = '';
    if (linkedCase && linkedCase.id) {
      linkedHtml = '<span class="inv-linked-pill" onclick="openCase(\'' + linkedCase.id + '\')" title="' +
        _escHtml(linkedCase.case_number + ' · ' + linkedCase.title) + '">' +
        '<svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/><path stroke-linecap="round" stroke-linejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101"/></svg>' +
        ' Linked</span>';
    }

    // Build doc action
    var docAction = '';
    if (docId) {
      docAction = '<span class="inv-action-btn" onclick="event.stopPropagation();alert(\'Document ID: ' + docId + '\')">Open Document &rarr;</span>';
    }

    var caseAction = '';
    if (linkedCase && linkedCase.id) {
      caseAction = '<span class="inv-action-btn" onclick="event.stopPropagation();openCase(\'' + linkedCase.id + '\')">Open Case &rarr;</span>';
    }

    var tr = document.createElement('tr');
    tr.className = 'inv-row';
    tr.innerHTML =
      '<td><div class="inv-client-name">' + client + '</div><div class="inv-client-meta">' + meta + '</div></td>' +
      '<td><span class="inv-num">' + invNum + '</span></td>' +
      '<td><span class="inv-amount-val">' + total + '</span></td>' +
      '<td><span class="inv-status ' + stLower + '">' + (status === 'SENT' ? 'Sent' : 'Draft') + '</span></td>' +
      '<td><span class="inv-due-val">' + dueDate + '</span></td>' +
      '<td>' + linkedHtml + '</td>' +
      '<td><div class="inv-actions">' + docAction + caseAction +
        '<span class="inv-action-btn" onclick="openInvMenu(this,\'' + invNum + '\',\'' + client + '\',\'\',\'' + stLower + '\')">⋯</span>' +
      '</div></td>';

    tbody.insertBefore(tr, tbody.firstChild);
  }

  /* ══ CONTEXT MENU (⋯) ════════════════════════ */
  let _ctxInv = {};
  function openInvMenu(btn, invNum, client, amount, status) {
    _ctxInv = {invNum, client, amount, status};
    const menu = document.getElementById('inv-ctx-menu');
    const rect = btn.getBoundingClientRect();
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - 168) + 'px';
    // Wire actions
    document.getElementById('ctx-view').onclick = () => { closeCtxMenu(); openInvoiceView(invNum, client, amount, status); };
    document.getElementById('ctx-pdf').onclick = () => { closeCtxMenu(); downloadInvoicePDF(invNum); };
    document.getElementById('ctx-send').onclick = () => { closeCtxMenu(); openSendInvoice(invNum, client, 'send'); };
    document.getElementById('ctx-duplicate').onclick = () => { closeCtxMenu(); _showToast(`Duplicating ${invNum}…`); };
    document.getElementById('ctx-void').onclick = () => { closeCtxMenu(); if(confirm(`Void ${invNum}? This cannot be undone.`)) _showToast(`${invNum} voided`); };
    menu.classList.add('open');
    // Close on outside click
    setTimeout(()=>document.addEventListener('click', _closeCtxOnOutside, {once:true}), 0);
  }
  function _closeCtxOnOutside(e) {
    const menu = document.getElementById('inv-ctx-menu');
    if (menu && !menu.contains(e.target)) menu.classList.remove('open');
  }
  function closeCtxMenu() {
    document.getElementById('inv-ctx-menu')?.classList.remove('open');
  }


  /* ── Escape key: close any open overlay ── */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (document.getElementById('inv-view-overlay').classList.contains('open'))  { closeInvoiceView(); return; }
    if (document.getElementById('rp-overlay').classList.contains('open'))        { closeRecordPayment(); return; }
    if (document.getElementById('si-overlay').classList.contains('open'))        { closeSendInvoice(); return; }
    if (document.getElementById('itp-save-modal').classList.contains('open'))    { closeItpSaveModal(); return; }
    if (document.getElementById('msg-overlay').classList.contains('open'))        { closeMsgComposer(); return; }
  });

  /* ══════════════════════════════════════════════════════════════
     CALENDAR ENGINE
     ══════════════════════════════════════════════════════════════ */

  // ── Event data ────────────────────────────────────────────────
  const CAL_EVENTS = {
    '2026-02-03': [{ type:'birthday', label:'🎂 Sean Hartmann', sub:'Buyer · Legal Clear' }],
    '2026-02-05': [{ type:'deadline', label:'KYC Documents Due', sub:'Nexalink' }],
    '2026-02-09': [{ type:'meeting',  label:'Weekly Standup',    sub:'All team · 9:00am' }],
    '2026-02-10': [{ type:'meeting',  label:'Client Onboarding', sub:'Vantage Capital 10:30am' }],
    '2026-02-14': [{ type:'deadline', label:'Month-end Reports', sub:'Finance team' }],
    '2026-02-16': [{ type:'meeting',  label:'Weekly Standup',    sub:'All team · 9:00am' }],
    '2026-02-18': [{ type:'reminder', label:'Invoice Follow-up', sub:'Vantage Capital' }],
    '2026-02-20': [{ type:'meeting',  label:'Compliance Review', sub:'Internal 2:00pm' }],
    '2026-02-23': [{ type:'meeting',  label:'Weekly Standup',    sub:'All team · 9:00am' }],
    '2026-02-24': [
      { type:'meeting',  label:'Client Briefing Prep', sub:'9:00am' },
      { type:'task',     label:'Q1 Filing Prep',       sub:'Deadline approaching' }
    ],
    '2026-02-25': [{ type:'meeting',  label:'Summit Holdings Call', sub:'10:30am' }],
    '2026-02-26': [{ type:'deadline', label:'Invoice Due',          sub:'Nexalink INV-1089' }],
    '2026-02-27': [{ type:'task',     label:'FICA Follow-up',       sub:'Legal Clear' }],
    '2026-02-28': [{ type:'deadline', label:'Quarter Close',        sub:'All accounts' }],
    '2026-03-05': [{ type:'deadline', label:'KYC Docs Due',         sub:'Legal Clear' }],
    '2026-03-09': [{ type:'meeting',  label:'Weekly Standup',       sub:'All team · 9:00am' }],
    '2026-03-12': [{ type:'birthday', label:'🎂 James Botha',       sub:'CEO · Legal Clear' }],
    '2026-03-14': [{ type:'birthday', label:'🎂 Pi Day celebration', sub:'Office team' }],
    '2026-03-15': [{ type:'meeting',  label:'Q1 Board Meeting',     sub:'Cape Town HQ' }],
    '2026-03-18': [{ type:'meeting',  label:'New Client Onboarding',sub:'Summit Holdings' }],
    '2026-03-31': [{ type:'deadline', label:'Quarter End',          sub:'All invoices due' }],
    '2026-06-05': [{ type:'birthday', label:'🎂 Thandi Mokoena',    sub:'HR · Legal Clear' }],
    '2026-07-14': [{ type:'birthday', label:'🎂 Nandi Dlamini',     sub:'Team Leader · Legal Clear' }],
    '2026-08-27': [{ type:'birthday', label:'🎂 Lerato Sithole',    sub:'Operations · Legal Clear' }],
    '2026-11-18': [{ type:'birthday', label:'🎂 Pieter Viljoen',    sub:'Accounts · Legal Clear' }],
  };

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let _calYear = 2026, _calMonth = 1; // 0-indexed (Jan=0, Feb=1)
  let _calView = 'month';
  const _TODAY = { y:2026, m:1, d:24 };

  function _calKey(y, m, d) {
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  // ── Main month grid ───────────────────────────────────────────
  function renderCalGrid() {
    const grid = document.getElementById('cal-grid');
    if (!grid) return;

    document.getElementById('cal-month-lbl').textContent =
      MONTH_NAMES[_calMonth] + ' ' + _calYear;

    const firstDay = new Date(_calYear, _calMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
    const daysInPrev  = new Date(_calYear, _calMonth, 0).getDate();

    let cells = '';
    let totalCells = firstDay + daysInMonth;
    if (totalCells % 7 !== 0) totalCells = totalCells + (7 - totalCells % 7);

    for (let i = 0; i < totalCells; i++) {
      let day, month = _calMonth, year = _calYear, cls = '';
      if (i < firstDay) {
        day = daysInPrev - firstDay + i + 1;
        month = _calMonth - 1; year = _calYear;
        if (month < 0) { month = 11; year--; }
        cls = 'other-m';
      } else if (i >= firstDay + daysInMonth) {
        day = i - firstDay - daysInMonth + 1;
        month = _calMonth + 1; year = _calYear;
        if (month > 11) { month = 0; year++; }
        cls = 'other-m';
      } else {
        day = i - firstDay + 1;
      }

      const isToday = (year === _TODAY.y && month === _TODAY.m && day === _TODAY.d);
      const isWknd  = (i % 7 === 0 || i % 7 === 6);
      const key     = _calKey(year, month, day);
      const evs     = CAL_EVENTS[key] || [];

      let evHtml = '';
      const MAX_SHOW = 2;
      evs.slice(0, MAX_SHOW).forEach(ev => {
        evHtml += `<div class="cal-ev ev-${ev.type}" title="${ev.label} — ${ev.sub}">${ev.label}</div>`;
      });
      if (evs.length > MAX_SHOW) {
        evHtml += `<div class="cal-more">+${evs.length - MAX_SHOW} more</div>`;
      }

      cells += `<div class="cal-day${cls ? ' ' + cls : ''}${isToday ? ' today' : ''}${isWknd ? ' wknd-day' : ''}" onclick="_calDayClick('${key}')">
        <div class="cal-dn">${day}</div>${evHtml}
      </div>`;
    }

    grid.innerHTML = cells;
    renderMiniCal();
    renderUpcoming();
    renderBdayList();
  }

  function _calDayClick(key) {
    const evs = CAL_EVENTS[key];
    if (!evs || evs.length === 0) { _showToast('No events · ' + key); return; }
    const lines = evs.map(e => '• ' + e.label + ' — ' + e.sub).join('\n');
    _showToast(lines.split('\n')[0] + (evs.length > 1 ? ' +' + (evs.length-1) + ' more' : ''));
  }

  // ── Mini calendar (sidebar) ───────────────────────────────────
  function renderMiniCal() {
    const grid = document.getElementById('mcal-grid');
    const lbl  = document.getElementById('mcal-lbl');
    if (!grid) return;
    lbl.textContent = MONTH_NAMES[_calMonth].slice(0,3) + ' ' + _calYear;

    let html = DAY_NAMES.map(d => `<div class="mc-wh">${d.slice(0,1)}</div>`).join('');

    const firstDay = new Date(_calYear, _calMonth, 1).getDay();
    const daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
    const daysInPrev  = new Date(_calYear, _calMonth, 0).getDate();
    let total = firstDay + daysInMonth;
    if (total % 7 !== 0) total += 7 - (total % 7);

    for (let i = 0; i < total; i++) {
      let day, month = _calMonth, year = _calYear, other = false;
      if (i < firstDay) { day = daysInPrev - firstDay + i + 1; other = true; }
      else if (i >= firstDay + daysInMonth) { day = i - firstDay - daysInMonth + 1; other = true; }
      else { day = i - firstDay + 1; }

      const isToday = !other && (year === _TODAY.y && month === _TODAY.m && day === _TODAY.d);
      const hasEv   = !other && !!CAL_EVENTS[_calKey(year, month, day)];
      const cls = [
        'mc-d',
        other   ? 'mc-other' : '',
        isToday ? 'mc-today' : '',
        hasEv && !isToday ? 'mc-has-ev' : ''
      ].filter(Boolean).join(' ');

      html += `<div class="${cls}">${day}</div>`;
    }
    grid.innerHTML = html;
  }

  function calMiniPrev() { _calMonth--; if (_calMonth < 0) { _calMonth = 11; _calYear--; } renderCalGrid(); }
  function calMiniNext() { _calMonth++; if (_calMonth > 11) { _calMonth = 0; _calYear++; } renderCalGrid(); }
  function calPrev()     { calMiniPrev(); }
  function calNext()     { calMiniNext(); }
  function calGoToday()  { _calYear = _TODAY.y; _calMonth = _TODAY.m; renderCalGrid(); }
  function calSetView(v) {
    _calView = v;
    ['month','week','day'].forEach(x => {
      const b = document.getElementById('cal-vt-' + x);
      if (b) b.classList.toggle('active', x === v);
    });
    if (v !== 'month') _showToast('Week/Day view — coming in next release');
    else renderCalGrid();
  }

  // ── Upcoming events list (next 7 days) ───────────────────────
  function renderUpcoming() {
    const el = document.getElementById('cal-upcoming-list');
    if (!el) return;
    const dotColors = { meeting:'#3b82f6', deadline:'#ef4444', birthday:'#8b5cf6', task:'#22c55e', reminder:'#f59e0b' };
    let html = '';
    for (let i = 0; i <= 14; i++) {
      const d = new Date(_TODAY.y, _TODAY.m, _TODAY.d + i);
      const key = _calKey(d.getFullYear(), d.getMonth(), d.getDate());
      const evs = CAL_EVENTS[key];
      if (!evs) continue;
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTH_NAMES[d.getMonth()].slice(0,3);
      evs.forEach(ev => {
        html += `<div class="cal-up-item">
          <div class="cal-up-dot" style="background:${dotColors[ev.type]||'#888'}"></div>
          <div class="cal-up-body">
            <div class="cal-up-lbl">${ev.label}</div>
            <div class="cal-up-sub">${label} · ${ev.sub}</div>
          </div>
        </div>`;
      });
    }
    el.innerHTML = html || '<div style="font-size:11px;color:#5A7080">No upcoming events</div>';
  }

  // ── Birthdays this month ──────────────────────────────────────
  function renderBdayList() {
    const el = document.getElementById('cal-bday-list');
    if (!el) return;
    let html = '';
    const daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = _calKey(_calYear, _calMonth, d);
      const evs = (CAL_EVENTS[key] || []).filter(e => e.type === 'birthday');
      evs.forEach(ev => {
        html += `<div class="cal-up-item">
          <div class="cal-up-dot" style="background:#8b5cf6"></div>
          <div class="cal-up-body">
            <div class="cal-up-lbl">${ev.label}</div>
            <div class="cal-up-sub">${MONTH_NAMES[_calMonth].slice(0,3)} ${d} · ${ev.sub}</div>
          </div>
        </div>`;
      });
    }
    el.innerHTML = html || '<div style="font-size:11px;color:#5A7080">No birthdays this month</div>';
  }

  // ── Init calendar when screen opens ──────────────────────────
  const _origSwitchScreen = typeof switchScreen === 'function' ? switchScreen : null;
  document.addEventListener('DOMContentLoaded', () => {
    // Patch switchScreen to also init calendar
    if (typeof switchScreen === 'function') {
      const _ss = switchScreen;
      window.switchScreen = function(id) {
        _ss(id);
        if (id === 'calendar') setTimeout(renderCalGrid, 0);
      };
    }
  });


  /* ══ ACTIVITY SYSTEM JS ══════════════════════════════════════ */

  // Toggle timeline item expand/collapse
  function actToggle(el) {
    if (el.classList.contains('tl-content')) {
      el.classList.toggle('expanded');
    }
  }

  // Pin / unpin a timeline item
  function actPin(btn) {
    const card = btn.closest('.tl-content');
    const isPinned = card.classList.toggle('pinned');
    btn.classList.toggle('pinned-btn', isPinned);
    btn.title = isPinned ? 'Unpin' : 'Pin';
    // Add/remove pin flag
    let flag = card.querySelector('.tl-pin-flag');
    if (isPinned && !flag) {
      flag = document.createElement('span');
      flag.className = 'tl-pin-flag';
      flag.textContent = '📌 Pinned';
      card.querySelector('.tl-top').insertBefore(flag, card.querySelector('.tl-actions'));
    } else if (!isPinned && flag) {
      flag.remove();
    }
    _showToast(isPinned ? '📌 Event pinned' : 'Pin removed');
  }

  // Filter timeline by type
  function actFilter(btn, type) {
    // Update button states
    btn.closest('.act-filter-bar').querySelectorAll('.act-fc').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Show/hide items
    const col = document.getElementById('act-tl-col');
    if (!col) return;
    col.querySelectorAll('.tl-item').forEach(item => {
      const t = item.dataset.type || '';
      let show = type === 'all';
      if (!show) {
        const map = {
          comms:     ['comms'],
          financial: ['financial'],
          workflow:  ['workflow'],
          notes:     ['notes'],
          tasks:     ['tasks'],
          system:    ['system']
        };
        show = (map[type] || []).includes(t);
      }
      item.style.display = show ? '' : 'none';
    });
    // Hide day headers with no visible children
    col.querySelectorAll('.tl-day').forEach(day => {
      const visible = [...day.querySelectorAll('.tl-item')].some(i => i.style.display !== 'none');
      day.style.display = visible ? '' : 'none';
    });
  }

  // Search timeline
  function actSearch(q) {
    const col = document.getElementById('act-tl-col');
    if (!col) return;
    const lq = q.toLowerCase();
    col.querySelectorAll('.tl-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = (!q || text.includes(lq)) ? '' : 'none';
    });
  }

  // Toggle rail section open/close
  function actRailToggle(hdr) {
    const body = hdr.nextElementSibling;
    const toggle = hdr.querySelector('.rail-sec-toggle');
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : '';
    if (toggle) toggle.style.transform = open ? 'rotate(-90deg)' : '';
  }

  // Toggle a task checkbox
  function actToggleTask(el) {
    el.classList.toggle('done');
    const title = el.nextElementSibling?.querySelector('.rt-title');
    if (title) title.classList.toggle('done-text');
    _showToast(el.classList.contains('done') ? '✓ Task marked complete' : 'Task reopened');
  }

  // Save a note from the add box
  function actSaveNote(btn) {
    const box  = btn.closest('.note-add-box');
    const ta   = box.querySelector('.note-add-input');
    const text = ta.value.trim();
    if (!text) { _showToast('Write something first'); return; }
    // Insert new note above the add box
    const section = box.closest('.rail-sec-body');
    const note = document.createElement('div');
    note.className = 'rail-note';
    note.innerHTML = `<div class="rn-header">
      <div class="rn-avatar" style="background:#6366f1">FR</div>
      <span class="rn-author">Fritz (You)</span>
      <span class="rn-time">Just now</span>
    </div>
    <div class="rn-body">${text}</div>
    <div class="rn-tags"><span class="rn-tag rn-vis-internal">Internal</span></div>`;
    section.insertBefore(note, box);
    ta.value = '';
    // Update count badge
    const count = section.closest('.rail-section').querySelectorAll('.rail-note').length;
    const badge = section.closest('.rail-section').querySelector('.rail-sec-count');
    if (badge) badge.textContent = count;
    _showToast('✓ Note saved to timeline');
  }

  // Ownership status change stub

  /* ── WhatsApp / SMS Composer ────────────────────────────────── */
  let _msgChannel = 'wa';

  const _msgTemplates = {
    followup: 'Hi {name}, I hope you are well. I wanted to follow up on the outstanding documents we discussed. Could you please send through the required items at your earliest convenience? Please let me know if you have any questions. Kind regards, Fritz — Novatrai',
    payment:  'Hi {name}, I hope you are doing well. This is a friendly reminder that invoice {inv} dated {date} for R {amount} is now due. Please let us know once payment has been made so we can allocate it promptly. Thank you.',
    confirm:  'Hi {name}, thank you — we have received your documents / payment. We will process this and follow up shortly. Kind regards, Fritz — Novatrai',
    meeting:  'Hi {name}, I would love to schedule a quick call to catch up on your account. Would you be available this week? Please suggest a time that suits you and I will send a calendar invite. Thanks.',
  };

  function openMsgComposer(channel) {
    _msgChannel = channel || 'wa';
    setMsgChannel(_msgChannel, true);
    document.getElementById('msg-overlay').classList.add('open');
    requestAnimationFrame(() => {
      document.getElementById('msg-panel').classList.add('open');
    });
  }

  function closeMsgComposer() {
    document.getElementById('msg-panel').classList.remove('open');
    setTimeout(() => {
      document.getElementById('msg-overlay').classList.remove('open');
      document.getElementById('msg-textarea').value = '';
      document.getElementById('msg-preview-bubble').textContent = 'Your message will appear here…';
      document.getElementById('msg-preview-bubble').style.fontStyle = 'italic';
      document.getElementById('msg-preview-bubble').style.color = '#5A7080';
      document.getElementById('msg-tpl-select').value = '';
      document.getElementById('msg-char-count').textContent = '0 characters';
      document.getElementById('msg-sched-input').value = '';
    }, 280);
  }

  function setMsgChannel(ch, skipAnim) {
    _msgChannel = ch;
    const isWa = ch === 'wa';
    document.getElementById('msg-btn-wa').classList.toggle('active', isWa);
    document.getElementById('msg-btn-sms').classList.toggle('active', !isWa);
    document.getElementById('msg-to-num').textContent = isWa
      ? '+27 82 411 0001 · WhatsApp Business'
      : '+27 82 411 0001 · SMS';
    document.getElementById('msg-preview-lbl').textContent = isWa ? 'WhatsApp Preview' : 'SMS Preview';
    const btn = document.getElementById('msg-send-btn');
    btn.className = 'msg-send-btn ' + ch;
    btn.innerHTML = isWa
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.859L.058 23.545a.5.5 0 00.609.61l5.805-1.525A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.012-1.375l-.36-.214-3.715.976.991-3.624-.235-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg> Send WhatsApp'
      : '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg> Send SMS';
  }

  function applyMsgTemplate(key) {
    if (!key) return;
    const tpl = _msgTemplates[key] || '';
    const filled = tpl
      .replace('{name}', 'James')
      .replace('{inv}', 'INV-1095')
      .replace('{date}', '1 Mar 2026')
      .replace('{amount}', '23,200');
    document.getElementById('msg-textarea').value = filled;
    updateMsgPreview();
    updateMsgCharCount(document.getElementById('msg-textarea'));
  }

  function updateMsgPreview() {
    const val = document.getElementById('msg-textarea').value.trim();
    const bubble = document.getElementById('msg-preview-bubble');
    if (val) {
      bubble.textContent = val;
      bubble.style.fontStyle = 'normal';
      bubble.style.color = '#E4EBF5';
    } else {
      bubble.textContent = 'Your message will appear here…';
      bubble.style.fontStyle = 'italic';
      bubble.style.color = '#5A7080';
    }
  }

  function updateMsgCharCount(el) {
    const n = el.value.length;
    const counter = document.getElementById('msg-char-count');
    const ch = _msgChannel === 'sms' ? ' (1 SMS = 160 chars)' : '';
    counter.textContent = n + ' characters' + ch;
    counter.style.color = (_msgChannel === 'sms' && n > 160) ? '#ef4444' : '#5A7080';
  }

  function sendMsg() {
    const body = document.getElementById('msg-textarea').value.trim();
    if (!body) { _showToast('Please enter a message first'); return; }
    const sched = document.getElementById('msg-sched-input').value;
    const label = _msgChannel === 'wa' ? 'WhatsApp' : 'SMS';
    const msg = sched
      ? label + ' scheduled for ' + sched + ' — added to queue'
      : label + ' sent to James Botha ✓';
    closeMsgComposer();
    setTimeout(() => _showToast(msg), 300);
  }


  /* ══ TEMPLATES SCREEN ══════════════════════════════════════ */

  const _TPL_DATA = {
    wa: [
      {
        id:'wa1', name:'FICA Follow-Up', tags:['compliance','follow-up'],
        snippet:'Hi {name}, following up on the outstanding FICA documents…',
        body:'Hi {name},\n\nI hope you are well. I wanted to follow up on the outstanding FICA documents required for your account.\n\nCould you please send through the following:\n• Certified copy of ID\n• Proof of residence (not older than 3 months)\n\nWe need these by {deadline} to keep your account active. Please let me know if you have any questions.\n\nKind regards,\n{sender} — Novatrai'
      },
      {
        id:'wa2', name:'Payment Reminder', tags:['financial','reminder'],
        snippet:'Hi {name}, friendly reminder that INV-{inv} for R{amount} is now due…',
        body:'Hi {name},\n\nThis is a friendly reminder that invoice INV-{inv} for R{amount} was due on {due_date}.\n\nPlease let us know once payment has been arranged so we can allocate it promptly. If you have already paid, please disregard this message.\n\nThank you,\n{sender} — Novatrai'
      },
      {
        id:'wa3', name:'Document Received', tags:['confirmation','onboarding'],
        snippet:'Hi {name}, we have received your documents. Thank you!',
        body:'Hi {name},\n\nThank you — we have received your documents successfully. Our team will review these and follow up with you shortly.\n\nIf anything additional is required, we will be in touch.\n\nKind regards,\n{sender} — Novatrai'
      },
      {
        id:'wa4', name:'Schedule a Call', tags:['relationship','follow-up'],
        snippet:'Hi {name}, would you be available for a quick call this week?',
        body:'Hi {name},\n\nI hope you are doing well. I would love to schedule a quick 15-minute call to touch base on your account and any upcoming matters.\n\nWould you be available this week? Please suggest a time that suits you and I will send a calendar invite.\n\nLooking forward to speaking with you.\n\n{sender} — Novatrai'
      }
    ],
    em: [
      {
        id:'em1', name:'FICA Action Required', tags:['compliance','urgent'],
        snippet:'Outstanding FICA verification documents — action required before deadline',
        subject:'FICA Verification — Action Required — {company}',
        visual: true
      },
      {
        id:'em2', name:'Invoice Sent', tags:['financial','invoice'],
        snippet:'Your invoice INV-{inv} for R{amount} is attached. Payment due {due_date}.',
        subject:'Invoice INV-{inv} — {company} — Novatrai',
        body:'Dear {name},\n\nPlease find attached your invoice INV-{inv} for professional services rendered.\n\nInvoice Details:\n• Invoice No: INV-{inv}\n• Amount: R{amount} (incl. VAT)\n• Due Date: {due_date}\n• Payment Method: EFT\n\nPlease use the invoice number as your payment reference. Should you have any queries regarding this invoice, please do not hesitate to contact us.\n\nKind regards,\n{sender}\nNovatrai'
      },
      {
        id:'em3', name:'Payment Confirmed', tags:['financial','confirmation'],
        snippet:'Payment of R{amount} received and allocated to INV-{inv}. Thank you.',
        subject:'Payment Received — INV-{inv} — Thank You',
        body:'Dear {name},\n\nThank you — we have received your payment of R{amount} for invoice INV-{inv}.\n\nYour account is now up to date. A receipt has been allocated to your account and is available in your client portal.\n\nWe appreciate your promptness and look forward to continuing to work with you.\n\nKind regards,\n{sender}\nNovatrai'
      }
    ],
    sms: [
      {
        id:'sms1', name:'Payment Due Reminder', tags:['financial','reminder'],
        snippet:'Novatrai: Hi {name}, INV-{inv} for R{amount} is due {due_date}. Reply PAID if settled.',
        body:'Novatrai: Hi {name}, your invoice INV-{inv} for R{amount} is due on {due_date}. Please reply PAID once payment is made or call us on +27 21 555 0100. Thank you.'
      },
      {
        id:'sms2', name:'Invoice Ready', tags:['financial','notification'],
        snippet:'Novatrai: Hi {name}, your invoice INV-{inv} is ready. Check your email.',
        body:'Novatrai: Hi {name}, invoice INV-{inv} for R{amount} has been sent to {email}. Due date: {due_date}. Queries: +27 21 555 0100.'
      },
      {
        id:'sms3', name:'Document Received', tags:['confirmation','compliance'],
        snippet:'Novatrai: Hi {name}, we received your documents. We will be in touch shortly.',
        body:'Novatrai: Hi {name}, we have received your documents successfully. Our team will review and contact you within 1-2 business days. Queries: +27 21 555 0100.'
      }
    ]
  };

  let _tplCat = 'wa';
  let _tplSelected = null;
  let _tplAiResult = null;

  function tplSwitchCat(cat) {
    _tplCat = cat;
    _tplSelected = null;
    document.querySelectorAll('.tpl-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    tplRenderList();
    tplShowPreview(null);
  }

  function tplRenderList(filter) {
    const cards = document.getElementById('tpl-cards');
    if (!cards) return;
    const items = (_TPL_DATA[_tplCat] || []).filter(t => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.snippet.toLowerCase().includes(q) || (t.tags||[]).some(tg => tg.includes(q));
    });
    cards.innerHTML = items.map(t => `
      <div class="tpl-card${_tplSelected === t.id ? ' active' : ''}" onclick="tplSelect('${t.id}')" id="tplcard-${t.id}">
        <div class="tpl-card-top">
          <div class="tpl-card-icon ${_tplCat}">${_tplCat === 'wa' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.859L.058 23.545a.5.5 0 00.609.61l5.805-1.525A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.012-1.375l-.36-.214-3.715.976.991-3.624-.235-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>' : _tplCat === 'sms' ? '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>' : '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>'}</div>
          <div>
            <div class="tpl-card-name">${t.name}</div>
            <div class="tpl-card-tags">${(t.tags||[]).map(tg => `<span class="tpl-card-tag">${tg}</span>`).join('')}</div>
          </div>
        </div>
        <div class="tpl-card-snippet">${t.snippet}</div>
        <div class="tpl-card-actions">
          <button class="tpl-act-btn" onclick="event.stopPropagation();tplSelect('${t.id}')">Preview</button>
          <button class="tpl-act-btn use" onclick="event.stopPropagation();tplUse('${t.id}')">Use</button>
          <button class="tpl-act-btn" onclick="event.stopPropagation();_showToast('Edit — coming soon')">Edit</button>
        </div>
      </div>
    `).join('');
  }

  function tplSelect(id) {
    _tplSelected = id;
    // re-render to update active state
    tplRenderList(document.querySelector('.tpl-search') ? document.querySelector('.tpl-search').value : '');
    // find template
    const all = [..._TPL_DATA.wa, ..._TPL_DATA.em, ..._TPL_DATA.sms];
    const t = all.find(x => x.id === id);
    if (t) tplShowPreview(t);
  }

  function tplShowPreview(t) {
    const empty = document.getElementById('tpl-preview-empty');
    const content = document.getElementById('tpl-preview-content');
    if (!t) {
      if (empty) empty.style.display = '';
      if (content) content.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (content) content.style.display = '';
    document.getElementById('tpl-preview-name').textContent = t.name;
    const body = document.getElementById('tpl-preview-body');

    if (_tplCat === 'wa') {
      body.innerHTML = `
        <div class="tpl-wa-preview">
          <div class="tpl-wa-preview-phone">
            <div class="tpl-wa-bar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.859L.058 23.545a.5.5 0 00.609.61l5.805-1.525A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.012-1.375l-.36-.214-3.715.976.991-3.624-.235-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
              Novatrai Business
            </div>
            <div class="tpl-wa-chat">
              <div class="tpl-wa-bubble">${(t.body||t.snippet).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
              <div class="tpl-wa-time">12:58 ✓✓</div>
            </div>
          </div>
        </div>`;
    } else if (_tplCat === 'sms') {
      body.innerHTML = `
        <div class="tpl-sms-preview">
          <div class="tpl-sms-phone">
            <div class="tpl-sms-bar">SMS · Novatrai</div>
            <div class="tpl-sms-chat">
              <div class="tpl-sms-bubble">${(t.body||t.snippet).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
            </div>
          </div>
        </div>`;
    } else {
      // Email
      if (t.visual) {
        body.innerHTML = `
          <div class="tpl-email-preview">
            <div class="tpl-email-meta">
              <div><b>From:</b> <span>Fritz — Novatrai &lt;fritz@novatrai.co.za&gt;</span></div>
              <div><b>Subject:</b> <span>FICA Verification — Action Required — Legal Clear</span></div>
              <div><b>To:</b> <span>james@legalclear.co.za</span></div>
            </div>
            <div class="tpl-email-body-wrap">
              <div class="email-tpl-render">
                <!-- HEADER -->
                <div class="email-tpl-header">
                  <div class="email-tpl-logo">
                    <div class="email-tpl-logo-mark">N</div>
                    <div>
                      <div class="email-tpl-logo-text">Novatrai</div>
                      <span class="email-tpl-logo-sub">Legal &amp; Compliance Platform</span>
                    </div>
                  </div>
                </div>
                <!-- HERO IMAGE -->
                <div class="email-tpl-hero">
                  <div class="email-tpl-hero-img">
                    <span class="email-tpl-hero-img-txt">FICA</span>
                    <span class="email-tpl-hero-badge">Action Required</span>
                  </div>
                </div>
                <!-- CONTENT -->
                <div class="email-tpl-content">
                  <div class="email-tpl-greeting">Hi James,</div>
                  <p class="email-tpl-body-txt">We hope you are doing well. We are reaching out regarding the outstanding <strong>FICA verification documents</strong> required for your account with Novatrai.</p>
                  <p class="email-tpl-body-txt">Our records indicate that the following documents have not yet been received:</p>
                  <div class="email-tpl-box">
                    <div class="email-tpl-box-lbl">Documents Required</div>
                    <div class="email-tpl-box-val">• Certified copy of ID document</div>
                    <div class="email-tpl-box-val">• Proof of residence (not older than 3 months)</div>
                    <div class="email-tpl-box-val">• Company registration certificate (CIPC)</div>
                    <div class="email-tpl-box-sub" style="margin-top:8px">Please ensure documents are certified and clearly legible</div>
                  </div>
                  <p class="email-tpl-body-txt">In order to keep your account fully compliant and operational, we kindly request that you submit these documents <strong>no later than 28 February 2026</strong>.</p>
                  <div class="email-tpl-cta">
                    <a class="email-tpl-cta-btn" href="#">Upload Documents →</a>
                  </div>
                  <p class="email-tpl-body-txt" style="font-size:12px;color:#94a3b8">If you have already submitted your documents, please disregard this email. For any queries, reply to this email or contact us directly on +27 21 555 0100.</p>
                </div>
                <div class="email-tpl-divider"></div>
                <!-- FOOTER -->
                <div class="email-tpl-footer">
                  <div class="email-tpl-footer-links">
                    <a class="email-tpl-footer-link" href="#">Unsubscribe</a>
                    <a class="email-tpl-footer-link" href="#">Privacy Policy</a>
                    <a class="email-tpl-footer-link" href="#">Contact Us</a>
                  </div>
                  <div class="email-tpl-footer-txt">
                    Novatrai (Pty) Ltd &nbsp;·&nbsp; 12 Innovation Drive, Cape Town, 8001<br>
                    This email was sent to james@legalclear.co.za &nbsp;·&nbsp; &copy; 2026 Novatrai
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      } else {
        body.innerHTML = `
          <div class="tpl-email-preview">
            <div class="tpl-email-meta">
              <div><b>From:</b> <span>Fritz — Novatrai &lt;fritz@novatrai.co.za&gt;</span></div>
              <div><b>Subject:</b> <span>${t.subject || t.name}</span></div>
            </div>
            <div class="tpl-email-body-wrap" style="padding:24px 32px;background:#f8fafc">
              <div style="font-family:-apple-system,sans-serif;font-size:14px;color:#475569;line-height:1.75;white-space:pre-wrap;max-width:520px">${(t.body||t.snippet).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
            </div>
          </div>`;
      }
    }
  }

  function tplSearch(q) {
    tplRenderList(q);
  }

  function tplUse(id) {
    const all = [..._TPL_DATA.wa, ..._TPL_DATA.em, ..._TPL_DATA.sms];
    const t = all.find(x => x.id === id);
    if (!t) return;
    const ch = _tplCat === 'wa' ? 'wa' : _tplCat === 'sms' ? 'sms' : null;
    if (ch) {
      openMsgComposer(ch);
      setTimeout(() => {
        const ta = document.getElementById('msg-textarea');
        if (ta) { ta.value = t.body || t.snippet; updateMsgPreview(); updateMsgCharCount(ta); }
      }, 350);
    } else {
      _showToast('Email template loaded — email composer coming soon');
    }
  }

  function tplUseSelected() { if (_tplSelected) tplUse(_tplSelected); }

  function tplCopy() {
    const all = [..._TPL_DATA.wa, ..._TPL_DATA.em, ..._TPL_DATA.sms];
    const t = all.find(x => x.id === _tplSelected);
    if (!t) return;
    navigator.clipboard.writeText(t.body || t.snippet).then(() => _showToast('Template text copied ✓')).catch(() => _showToast('Copied to clipboard'));
  }

  const _tplAiExamples = {
    wa: 'Hi {name},\n\nI hope this message finds you well. I wanted to follow up on a matter that requires your urgent attention.\n\nAs per our earlier discussion, we are still awaiting the outstanding documentation. Please could you send these through within the next 48 hours to avoid any disruption to your account.\n\nDo not hesitate to reach out if you need any assistance.\n\nKind regards,\n{sender} — Novatrai',
    em: 'Subject: Important — Action Required on Your Account\n\nDear {name},\n\nI hope you are well. I am reaching out regarding an important matter on your account that requires your attention.\n\nPlease review the details below and take the necessary action by {deadline}.\n\nShould you have any questions, please do not hesitate to contact me directly.\n\nKind regards,\n{sender}\nNovatrai',
    sms: 'Novatrai: Hi {name}, your account requires attention. Please check your email or call us on +27 21 555 0100 at your earliest convenience. Ref: {ref}.'
  };

  function tplAiGenerate() {
    const input = document.getElementById('tpl-ai-input').value.trim();
    if (!input) { _showToast('Please describe what you need'); return; }
    const ch = document.getElementById('tpl-ai-channel').value;
    const btn = document.querySelector('.tpl-ai-gen-btn');
    btn.textContent = 'Generating…';
    btn.disabled = true;
    setTimeout(() => {
      _tplAiResult = _tplAiExamples[ch] || _tplAiExamples.wa;
      const sug = document.getElementById('tpl-ai-suggestion');
      document.getElementById('tpl-ai-suggestion-text').style.cssText = 'white-space:pre-wrap;font-size:12px;line-height:1.65;color:#9AABB8';
      document.getElementById('tpl-ai-suggestion-text').textContent = _tplAiResult;
      sug.classList.add('visible');
      btn.innerHTML = '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Generate';
      btn.disabled = false;
    }, 1200);
  }

  function tplAiUse() {
    if (!_tplAiResult) return;
    const ch = document.getElementById('tpl-ai-channel').value;
    const name = 'AI Draft — ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    _TPL_DATA[ch].unshift({ id: 'ai_' + Date.now(), name, tags:['ai-generated'], snippet: _tplAiResult.substring(0,80) + '…', body: _tplAiResult });
    const count = document.getElementById('tpl-count-' + ch);
    if (count) count.textContent = _TPL_DATA[ch].length;
    _tplCat = ch;
    document.querySelectorAll('.tpl-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === ch));
    tplRenderList();
    _showToast('Template saved ✓');
    document.getElementById('tpl-ai-input').value = '';
    document.getElementById('tpl-ai-suggestion').classList.remove('visible');
  }

  function tplNew() { _showToast('Template editor — coming soon'); }

  // Init templates screen when switched to
  document.addEventListener('DOMContentLoaded', function() {
    const orig = window.switchScreen;
    window.switchScreen = function(name) {
      orig(name);
      if (name === 'templates') {
        setTimeout(() => { tplSwitchCat('wa'); }, 50);
      }
    };
  });

  function actChangeStatus() {
    const statuses = ['On Track','Waiting on Client','Waiting on 3rd Party','Blocked','Escalation'];
    _showToast('Status selector — coming soon');
  }

