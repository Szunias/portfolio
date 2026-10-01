/* Shadow Frames: the investigation board that steps through the ambience
   stages.

   The board: photographs on the board -> ProgressiveAmbience stage. The
   stage names and layers are copied from SC_AMB_Progressive in the Wwise
   project (switch-group / switch-container captures). The range input is
   the accessible control; the ten .sf-slot photographs are a pointer/touch
   shortcut and stay aria-hidden, so no keyboard behaviour is duplicated
   onto them. Arrow keys, Home and End on the slider, and Enter/Space on
   the buttons, are the browser's own behaviour for <input type="range">
   and <button> - nothing here re-implements them. The develop-from-black
   transition on a newly pinned photograph is plain CSS
   (.sf-board.is-live), so prefers-reduced-motion (including a live
   change) is honoured by the stylesheet without any branch here. */
(function () {
  var board = document.querySelector('[data-sf-board]');
  if (!board) return;
  var range = board.querySelector('.sf-range');
  var out = board.querySelector('[data-sf-out]');
  var stageEl = board.querySelector('[data-sf-stage]');
  var layersEl = board.querySelector('[data-sf-layers]');
  var slots = Array.prototype.slice.call(board.querySelectorAll('.sf-slot'));
  var down = board.querySelector('[data-sf-step="-1"]');
  var up = board.querySelector('[data-sf-step="1"]');
  if (!range || !out || !stageEl || !layersEl || !slots.length) return;

  var STAGES = [
    ['InitalState', ['BC_AMB_BaseLayer']],
    ['StageOne', ['BC_AMB_BaseLayer', 'BC_AMB_Stage2_WeirdNoises']],
    ['StageTwo', ['BC_AMB_BaseLayer', 'BC_AMB_Stage2_WeirdNoises']],
    ['StageThree', ['BC_AMB_BaseLayer', 'BC_AMB_Stage2_WeirdNoises', 'AMB_Stage3_GhostlyScreech']],
    ['StageFour', ['BC_AMB_BaseLayer', 'AMB_Stage4_HorrorDrone_Alt']],
    ['StageFive', ['BC_AMB_BaseLayer', 'HorrorTrailerLogo']],
    ['StageSix', ['BC_AMB_BaseLayer', 'BC_AMB_Stage4_Horror']],
    ['StateSeven', ['BC_AMB_BaseLayer', 'BC_AMB_Stage5_Max']],
    ['StageEight', ['Horror Background Ambience']],
    ['StageNine', ['Horror Background Ambience']],
    ['StageTen', ['Horror Background Ambience']]
  ];
  var max = STAGES.length - 1;

  function ready(img) { img.classList.add('is-ready'); }
  function develop(img) {
    if (!img) return;
    if (img.hasAttribute('data-src')) {
      img.addEventListener('load', function () { ready(img); }, { once: true });
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    } else if (img.complete && img.naturalWidth) {
      ready(img);
    } else {
      img.addEventListener('load', function () { ready(img); }, { once: true });
    }
  }

  function render(n) {
    n = Math.max(0, Math.min(max, Math.round(n) || 0));
    range.value = String(n);
    slots.forEach(function (slot, i) {
      var pinned = i < n;
      slot.classList.toggle('is-pinned', pinned);
      if (pinned) develop(slot.querySelector('img'));
    });
    var stage = STAGES[n];
    var before = n > 0 ? STAGES[n - 1][1] : stage[1];
    out.textContent = '';
    var b = document.createElement('b');
    b.textContent = String(n);
    out.appendChild(b);
    out.appendChild(document.createTextNode(' / 10'));
    stageEl.textContent = stage[0];
    layersEl.textContent = '';
    stage[1].forEach(function (name) {
      var code = document.createElement('code');
      code.textContent = name;
      if (before.indexOf(name) === -1) code.className = 'is-new';
      layersEl.appendChild(code);
      layersEl.appendChild(document.createTextNode(' '));
    });
    range.setAttribute('aria-valuetext', n + ' of 10 photographs, ' + stage[0]);
    if (down) down.disabled = n === 0;
    if (up) up.disabled = n === max;
  }

  board.classList.add('is-live');
  range.addEventListener('input', function () { render(Number(range.value)); });
  if (down) down.addEventListener('click', function () { render(Number(range.value) - 1); });
  if (up) up.addEventListener('click', function () { render(Number(range.value) + 1); });
  slots.forEach(function (slot, i) {
    slot.addEventListener('click', function () {
      var n = Number(range.value);
      render(i + 1 === n ? i : i + 1);
    });
  });
  render(Number(range.value));
})();
