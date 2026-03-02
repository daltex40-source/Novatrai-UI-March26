/* ══════════════════════════════════════════════════════════════════════════
   WIZARD V2 — 5-Step Onboarding Flow
   Step 0: Company Setup
   Step 1: Industry & Region
   Step 2: Your Story + Module Discovery
   Step 3: Smart Setup (Details + Docs)
   Step 4: Launch
══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ── State ────────────────────────────────────────────────
  var _v2Step = 0;
  var _v2Logo = null;          // { dataUrl, fileName, fileSize }
  var _v2CompanyName = '';
  var _v2WebsiteUrl = '';
  var _v2AiData = {};          // extracted from website/docs
  var _v2Docs = [];            // uploaded doc files

  // step map: 5 steps
  var stepPanels = [
    'ow-step-new-1-company',    // 0: company setup
    'ow-step-new-2-indregion',  // 1: industry + region
    'ow-step-new-3-story',      // 2: story + module discovery
    'ow-step-new-4-setup',      // 3: smart setup (details + docs)
    'ow-step-new-5-launch'      // 4: launch
  ];

  // ── Master module list ──────────────────────────────────
  var _allModules = {
    contacts:          { label:'Contacts & CRM',       icon:'\uD83D\uDC65' },
    companies:         { label:'Companies',             icon:'\uD83C\uDFE2' },
    pipeline:          { label:'Pipeline & Deals',      icon:'\uD83C\uDFAF' },
    calendar:          { label:'Calendar',              icon:'\uD83D\uDCC5' },
    documents:         { label:'Documents',             icon:'\uD83D\uDDC2\uFE0F' },
    templates:         { label:'Templates',             icon:'\uD83D\uDCCB' },
    tasks:             { label:'Tasks',                 icon:'\u2705' },
    invoicing:         { label:'Invoicing & Payments',  icon:'\uD83D\uDCB0' },
    whatsapp:          { label:'WhatsApp',              icon:'\uD83D\uDCAC' },
    emailComposer:     { label:'Email Composer',        icon:'\uD83D\uDCE7' },
    relationshipScore: { label:'Relationship Score',    icon:'\uD83D\uDCA1' },
    financial:         { label:'Financial Reports',     icon:'\uD83D\uDCCA' }
  };

  // ── Progress bar update ──────────────────────────────────
  function updateProgress(step) {
    for (var i = 0; i < 5; i++) {
      var dot = document.getElementById('ow-pdot-' + i);
      var line = document.getElementById('ow-pline-' + i);
      if (!dot) continue;
      dot.className = 'wizard-prog-dot';
      if (i < step) {
        dot.classList.add('done');
        dot.innerHTML = '';
      } else if (i === step) {
        dot.classList.add('active');
        dot.innerHTML = '' + (i + 1);
      } else {
        dot.innerHTML = '' + (i + 1);
      }
      if (line) {
        line.className = 'wizard-prog-line' + (i < step ? ' filled' : '');
      }
    }
  }

  // ── Show a specific step ─────────────────────────────────
  function showStep(step) {
    _v2Step = step;
    stepPanels.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    var target = document.getElementById(stepPanels[step]);
    if (target) target.style.display = 'block';
    updateProgress(step);
  }

  // ── Global navigation ────────────────────────────────────
  window.owGoStep = function(step) {
    // Validate transitions
    if (step === 1 && !document.getElementById('ow-company-name').value.trim()) return;
    if (step === 2 && (_owSelected.length === 0 || !_owSelectedRegion)) return;

    // Render dynamic content when entering certain steps
    if (step === 2) owRenderModuleDiscovery();
    if (step === 3) owRenderAutoSummary();
    if (step === 4) owRenderLaunchSummary();

    showStep(step);
  };

  window.owBackV2 = function() {
    if (_v2Step > 0) showStep(_v2Step - 1);
  };

  // ── Override existing functions ──────────────────────────
  var _origOwNext = window.owNext;
  window.owNext = function() {
    // From industry step: go to story+modules
    if (_owSelected.length === 0) return;
    if (!_owSelectedRegion) return;
    owRenderModuleDiscovery();
    showStep(2);
  };

  var _origOwBack = window.owBack;
  window.owBack = function() {
    owBackV2();
  };

  // Override launch to include confetti
  var _origLaunch = window.owLaunch;
  window.owLaunch = function() {
    // Save company data to localStorage
    var compData = {
      name: document.getElementById('ow-company-name').value.trim(),
      website: document.getElementById('ow-website-url').value.trim(),
      regNumber: document.getElementById('ow-reg-number').value.trim(),
      vatNumber: document.getElementById('ow-vat-number').value.trim(),
      phone: document.getElementById('ow-company-phone').value.trim(),
      email: document.getElementById('ow-company-email').value.trim(),
      logo: _v2Logo ? _v2Logo.dataUrl : null
    };
    try { localStorage.setItem('novatrai_company', JSON.stringify(compData)); } catch(e){}

    // Fire confetti
    owFireConfetti();

    // Call original launch
    if (_origLaunch) _origLaunch();
  };

  // Override open wizard to start at step 0
  var _origOpen = window.openOnboardingWizard;
  window.openOnboardingWizard = function() {
    _v2Step = 0;
    _v2Logo = null;
    _v2Docs = [];
    _v2AiData = {};

    // Reset fields
    var fields = ['ow-company-name','ow-website-url','ow-reg-number','ow-vat-number','ow-company-phone','ow-company-email'];
    fields.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) { el.value = ''; el.classList.remove('ai-filled-input'); }
    });
    ['ow-reg-ai','ow-vat-ai','ow-phone-ai','ow-email-ai'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Reset logo drop
    var logoDrop = document.getElementById('ow-logo-drop');
    if (logoDrop) logoDrop.classList.remove('has-file');

    // Reset docs drop
    var docsDrop = document.getElementById('ow-docs-drop');
    if (docsDrop) docsDrop.classList.remove('has-file');

    // Hide AI bars
    var aiBar = document.getElementById('ow-ai-extract-bar');
    if (aiBar) aiBar.style.display = 'none';
    var docsBar = document.getElementById('ow-docs-ai-bar');
    if (docsBar) docsBar.style.display = 'none';

    // Hide auto summary
    var autoSum = document.getElementById('ow-auto-summary');
    if (autoSum) autoSum.style.display = 'none';

    // Reset module discovery
    var modAct = document.getElementById('ow-modules-activated');
    if (modAct) modAct.innerHTML = '';
    var modAvail = document.getElementById('ow-modules-available');
    if (modAvail) modAvail.innerHTML = '';

    // Reset region compact cards
    document.querySelectorAll('.ow-region-card-compact').forEach(function(c) { c.classList.remove('selected'); });

    // Hide all new step panels
    stepPanels.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Call original open
    if (_origOpen) _origOpen();

    // Update to our progress bar
    updateProgress(0);

    // Show step 0
    var s0 = document.getElementById(stepPanels[0]);
    if (s0) s0.style.display = 'block';
  };

  // ── URL input listener (enable AI scan button) ───────────
  document.addEventListener('DOMContentLoaded', function() {
    var urlInput = document.getElementById('ow-website-url');
    var scanBtn = document.getElementById('ow-ai-scan');
    if (urlInput && scanBtn) {
      urlInput.addEventListener('input', function() {
        var val = urlInput.value.trim();
        scanBtn.disabled = !(val.length > 4 && (val.indexOf('.') > -1));
      });
    }
  });

  // ── Company step validation ──────────────────────────────
  window.owValidateCompanyStep = function() {
    var name = document.getElementById('ow-company-name').value.trim();
    var btn = document.getElementById('ow-company-next');
    if (btn) btn.disabled = !name;
  };

  // ── Industry + Region combined validation ────────────────
  window.owValidateIndRegionStep = function() {
    var btn = document.getElementById('ow-indregion-next');
    if (btn) btn.disabled = !(_owSelected.length > 0 && _owSelectedRegion);
  };

  // ── Logo handlers ────────────────────────────────────────
  window.owHandleLogoDrop = function(e) {
    e.preventDefault();
    var drop = document.getElementById('ow-logo-drop');
    drop.classList.remove('drag-over');
    var files = e.dataTransfer.files;
    if (files.length > 0) processLogo(files[0]);
  };

  window.owHandleLogoSelect = function(e) {
    var files = e.target.files;
    if (files.length > 0) processLogo(files[0]);
  };

  function processLogo(file) {
    if (!file.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      _v2Logo = { dataUrl:e.target.result, fileName:file.name, fileSize:file.size };
      var preview = document.getElementById('ow-logo-preview');
      if (preview) preview.src = e.target.result;
      var drop = document.getElementById('ow-logo-drop');
      if (drop) drop.classList.add('has-file');
    };
    reader.readAsDataURL(file);
  }

  // ── Document handlers ────────────────────────────────────
  window.owHandleDocsDrop = function(e) {
    e.preventDefault();
    var drop = document.getElementById('ow-docs-drop');
    drop.classList.remove('drag-over');
    var files = e.dataTransfer.files;
    if (files.length > 0) processDocs(files);
  };

  window.owHandleDocsSelect = function(e) {
    var files = e.target.files;
    if (files.length > 0) processDocs(files);
  };

  window.owClearDocs = function() {
    _v2Docs = [];
    var drop = document.getElementById('ow-docs-drop');
    if (drop) drop.classList.remove('has-file');
    var bar = document.getElementById('ow-docs-ai-bar');
    if (bar) bar.style.display = 'none';
  };

  function processDocs(files) {
    _v2Docs = [];
    var names = [];
    var totalSize = 0;
    for (var i = 0; i < files.length; i++) {
      _v2Docs.push(files[i]);
      names.push(files[i].name);
      totalSize += files[i].size;
    }
    var fnEl = document.getElementById('ow-docs-filename');
    var fsEl = document.getElementById('ow-docs-filesize');
    if (fnEl) fnEl.textContent = names.join(', ');
    if (fsEl) fsEl.textContent = formatFileSize(totalSize);
    var drop = document.getElementById('ow-docs-drop');
    if (drop) drop.classList.add('has-file');

    simulateDocsExtraction();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function simulateDocsExtraction() {
    var bar = document.getElementById('ow-docs-ai-bar');
    var txt = document.getElementById('ow-docs-ai-text');
    if (!bar || !txt) return;

    bar.style.display = 'flex';
    bar.className = 'ow-ai-bar extracting';
    txt.innerHTML = '<strong>AI is reading your documents...</strong> Extracting registration details.';

    var steps = [
      { delay:1200, msg:'<strong>Found registration number</strong> from CIPC certificate...' },
      { delay:2200, msg:'<strong>Found VAT number</strong> from tax clearance...' },
      { delay:3000, msg:'<strong>Extracted company phone &amp; email</strong> from letterhead...' },
      { delay:3800, msg:'<strong>All done!</strong> We filled in what we found. Check below and correct anything.' }
    ];

    var fakeData = {
      regNumber: '2024/789012/07',
      vatNumber: '4987654321',
      phone: '+27 21 555 0199',
      email: 'admin@yourcompany.co.za'
    };

    steps.forEach(function(s) {
      setTimeout(function() { txt.innerHTML = s.msg; }, s.delay);
    });

    setTimeout(function() {
      bar.className = 'ow-ai-bar success';
      fillField('ow-reg-number', fakeData.regNumber, 'ow-reg-ai');
      fillField('ow-vat-number', fakeData.vatNumber, 'ow-vat-ai');
      fillField('ow-company-phone', fakeData.phone, 'ow-phone-ai');
      fillField('ow-company-email', fakeData.email, 'ow-email-ai');
    }, 4000);
  }

  function fillField(inputId, value, badgeId) {
    var inp = document.getElementById(inputId);
    var badge = document.getElementById(badgeId);
    if (inp && !inp.value.trim()) {
      inp.value = value;
      inp.classList.add('ai-filled-input');
    }
    if (badge) badge.style.display = 'inline';
  }

  // ── AI Website scan ──────────────────────────────────────
  window.owAIScanWebsite = function() {
    var url = document.getElementById('ow-website-url').value.trim();
    if (!url) return;

    var btn = document.getElementById('ow-ai-scan');
    var bar = document.getElementById('ow-ai-extract-bar');
    var txt = document.getElementById('ow-ai-extract-text');

    btn.classList.add('scanning');
    btn.disabled = true;
    bar.style.display = 'flex';
    bar.className = 'ow-ai-bar extracting';

    var steps = [
      { delay:800,  msg:'<strong>Connecting to ' + url.replace(/https?:\/\//, '').split('/')[0] + '</strong>...' },
      { delay:1800, msg:'<strong>Scanning homepage</strong> for company details...' },
      { delay:3000, msg:'<strong>Found phone number &amp; email</strong> in footer...' },
      { delay:4200, msg:'<strong>Detected logo</strong> from site header...' },
      { delay:5000, msg:'<strong>Scan complete!</strong> We auto-filled what we could find.' }
    ];

    steps.forEach(function(s) {
      setTimeout(function() { txt.innerHTML = s.msg; }, s.delay);
    });

    setTimeout(function() {
      btn.classList.remove('scanning');
      btn.disabled = false;
      bar.className = 'ow-ai-bar success';

      fillField('ow-company-phone', '+27 21 555 0100', 'ow-phone-ai');
      fillField('ow-company-email', 'info@' + url.replace(/https?:\/\/(www\.)?/, '').split('/')[0], 'ow-email-ai');
    }, 5200);
  };

  // ── Detail mode toggle ───────────────────────────────────
  window.owToggleDetailMode = function(mode) {
    var uploadBtn = document.getElementById('ow-toggle-upload');
    var manualBtn = document.getElementById('ow-toggle-manual');
    var uploadPanel = document.getElementById('ow-panel-upload');
    var divider = document.getElementById('ow-or-divider-details');

    if (mode === 'upload') {
      uploadBtn.classList.add('active');
      manualBtn.classList.remove('active');
      uploadPanel.classList.add('active');
      if (divider) divider.style.display = 'flex';
    } else {
      manualBtn.classList.add('active');
      uploadBtn.classList.remove('active');
      uploadPanel.classList.remove('active');
      if (divider) divider.style.display = 'none';
    }
  };

  // ── Module Discovery Renderer ────────────────────────────
  window.owRenderModuleDiscovery = function() {
    var config;
    if (_owSelected.length === 1) {
      config = _novatraiProfileConfig[_owSelected[0]];
    } else if (typeof _buildCompositeConfig === 'function') {
      config = _buildCompositeConfig(_owSelected);
    } else {
      config = _novatraiProfileConfig[_owSelected[0]];
    }
    if (!config) return;

    var activatedHtml = '';
    var availableHtml = '';

    Object.keys(_allModules).forEach(function(key) {
      var mod = _allModules[key];
      var isActive = config.features && config.features[key] === true;
      var chipHtml = '<div class="ow-module-chip ' + (isActive ? 'activated' : 'available') + '">' +
        '<span class="ow-module-chip-icon">' + mod.icon + '</span>' +
        '<span>' + mod.label + '</span>' +
        (isActive ? ' <span style="margin-left:4px;font-size:10px;">\u2713</span>' : ' <span style="margin-left:4px;font-size:10px;">+</span>') +
      '</div>';

      if (isActive) activatedHtml += chipHtml;
      else availableHtml += chipHtml;
    });

    var actEl = document.getElementById('ow-modules-activated');
    var availEl = document.getElementById('ow-modules-available');
    if (actEl) actEl.innerHTML = activatedHtml;
    if (availEl) availEl.innerHTML = availableHtml;

    // Set industry name inline
    var indEl = document.getElementById('ow-industry-name-inline');
    if (indEl) indEl.textContent = config.name || 'Industry';
  };

  // ── Auto Summary Renderer (Step 4) ──────────────────────
  window.owRenderAutoSummary = function() {
    var config;
    if (_owSelected.length === 1) {
      config = _novatraiProfileConfig[_owSelected[0]];
    } else if (typeof _buildCompositeConfig === 'function') {
      config = _buildCompositeConfig(_owSelected);
    } else {
      config = _novatraiProfileConfig[_owSelected[0]];
    }
    if (!config) return;

    var items = [];

    if (_owSelectedRegion && typeof _novatraiRegions !== 'undefined') {
      var reg = _novatraiRegions[_owSelectedRegion];
      if (reg) {
        items.push('Currency set to ' + reg.currency.code + ' (' + reg.currency.symbol + ')');
        items.push('Date format: ' + reg.dateFormat);
        items.push('Tax terminology: ' + reg.taxTerm);
      }
    }

    if (config.pipeline) {
      items.push('Pipeline: ' + config.pipeline.name + ' (' + config.pipeline.stages.length + ' stages)');
    }
    if (config.templates) {
      items.push(config.templates.length + ' starter templates loaded');
    }

    var html = items.map(function(item) {
      return '<div class="ow-auto-summary-item">' + item + '</div>';
    }).join('');

    var el = document.getElementById('ow-auto-summary');
    var itemsEl = document.getElementById('ow-auto-summary-items');
    if (el && itemsEl) {
      itemsEl.innerHTML = html;
      el.style.display = items.length > 0 ? 'block' : 'none';
    }
  };

  // ── Launch Summary Renderer (Step 5) ────────────────────
  window.owRenderLaunchSummary = function() {
    var config;
    if (_owSelected.length === 1) {
      config = _novatraiProfileConfig[_owSelected[0]];
    } else if (typeof _buildCompositeConfig === 'function') {
      config = _buildCompositeConfig(_owSelected);
    } else {
      config = _novatraiProfileConfig[_owSelected[0]];
    }
    if (!config) return;

    var companyName = document.getElementById('ow-company-name').value.trim() || 'Your Company';
    var activeModules = 0;
    if (config.features) {
      Object.keys(config.features).forEach(function(k) {
        if (config.features[k]) activeModules++;
      });
    }
    var templateCount = config.templates ? config.templates.length : 0;

    // Set headline
    var indEl = document.getElementById('ow-launch-industry');
    if (indEl) indEl.textContent = config.name || 'Industry';
    var countEl = document.getElementById('ow-launch-module-count');
    if (countEl) countEl.textContent = activeModules;
    var iconEl = document.getElementById('ow-launch-icon');
    if (iconEl) iconEl.textContent = config.icon || '\uD83D\uDE80';

    // Summary cards
    var summaryEl = document.getElementById('ow-launch-summary');
    if (summaryEl) {
      summaryEl.innerHTML =
        '<div class="ow-launch-summary-card"><div class="ow-launch-summary-value">' + companyName + '</div><div class="ow-launch-summary-label">Company</div></div>' +
        '<div class="ow-launch-summary-card"><div class="ow-launch-summary-value">' + activeModules + '</div><div class="ow-launch-summary-label">Active Modules</div></div>' +
        '<div class="ow-launch-summary-card"><div class="ow-launch-summary-value">' + templateCount + '</div><div class="ow-launch-summary-label">Templates</div></div>';
    }

    // Quick start
    var qsEl = document.getElementById('ow-launch-quickstart');
    if (qsEl && config.onboarding && config.onboarding.quickStart) {
      var qsList = config.onboarding.quickStart.map(function(qs) {
        return '<div class="ow-launch-qs-item">' + qs + '</div>';
      }).join('');
      qsEl.innerHTML = '<div class="ow-launch-qs-title">Quick Start After Launch</div>' + qsList;
    }
  };

  // ── Confetti ─────────────────────────────────────────────
  window.owFireConfetti = function() {
    var wrap = document.createElement('div');
    wrap.className = 'ow-confetti-wrap';
    document.body.appendChild(wrap);

    var colors = ['#4A8FFF','#3DD68C','#FF6B8A','#FFB547','#B57BFF','#48D1CC'];
    for (var i = 0; i < 60; i++) {
      var piece = document.createElement('div');
      piece.className = 'ow-confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = (Math.random() * 0.8) + 's';
      piece.style.width = (4 + Math.random() * 8) + 'px';
      piece.style.height = (4 + Math.random() * 8) + 'px';
      if (Math.random() > 0.5) piece.style.borderRadius = '50%';
      wrap.appendChild(piece);
    }
    setTimeout(function() { wrap.remove(); }, 3500);
  };

})();
