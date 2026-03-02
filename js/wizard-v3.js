/* ══════════════════════════════════════════════════════════════════════════
   WIZARD V3 — Your Story tool chips
   (CSV import removed from wizard — available post-onboarding in Settings)
══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var _selectedTools = [];

  // ── Tool chip toggle ─────────────────────────────────────
  window.owToggleTool = function(el) {
    var tool = el.getAttribute('data-tool');
    // "Starting Fresh" is exclusive
    if (tool === 'nothing') {
      _selectedTools = ['nothing'];
      document.querySelectorAll('.ow-tool-chip').forEach(function(c) {
        c.classList.remove('selected');
      });
      el.classList.add('selected');
    } else {
      // Deselect "nothing" if picking a tool
      _selectedTools = _selectedTools.filter(function(t){ return t !== 'nothing'; });
      var nothingChip = document.querySelector('.ow-tool-chip[data-tool="nothing"]');
      if (nothingChip) nothingChip.classList.remove('selected');

      if (_selectedTools.indexOf(tool) > -1) {
        _selectedTools = _selectedTools.filter(function(t){ return t !== tool; });
        el.classList.remove('selected');
      } else {
        _selectedTools.push(tool);
        el.classList.add('selected');
      }
    }
  };

  // ── Save tools data on launch ─────────────────────────────
  var _origLaunchV3 = window.owLaunch;
  window.owLaunch = function() {
    var storyData = {
      currentTools: _selectedTools,
      whySwitch: (document.getElementById('ow-why-switch') || {}).value || ''
    };
    try { localStorage.setItem('novatrai_onboard_story', JSON.stringify(storyData)); } catch(e){}
    if (_origLaunchV3) _origLaunchV3();
  };

  // ── Reset story fields on wizard open ─────────────────────
  var _origOpenV3 = window.openOnboardingWizard;
  window.openOnboardingWizard = function() {
    _selectedTools = [];
    document.querySelectorAll('.ow-tool-chip').forEach(function(c) { c.classList.remove('selected'); });
    var why = document.getElementById('ow-why-switch');
    if (why) why.value = '';

    if (_origOpenV3) _origOpenV3();
  };

})();
