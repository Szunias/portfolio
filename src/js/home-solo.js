/* Solo keys on the homepage "Tools in practice" desk. One tool at a time, like
   an exclusive solo on a mixer: every #work link whose data-tools lacks the
   tool gets .is-muted (dimmed in home.css, nothing moves), and the status line
   names what stays lit, including earlier projects inside the closed
   disclosure. The lit key again, or Escape, clears the solo. Without
   JavaScript the keys stay hidden and the desk is a list of four proof links. */
(function () {
  'use strict';
  var desk = document.querySelector('[data-solo-desk]');
  if (!desk) return;
  var buttons = Array.prototype.slice.call(desk.querySelectorAll('[data-solo]'));
  var items = Array.prototype.slice.call(document.querySelectorAll('#work [data-tools]'));
  var status = desk.querySelector('[data-solo-status]');
  var hint = desk.querySelector('[data-solo-hint]');
  if (!buttons.length || !items.length || !status) return;

  var current = null;

  // The strip's visible tool name, so the markup stays the only list of tools.
  function toolName(button) {
    var strip = button.closest('li');
    var label = strip && strip.querySelector('.tool-strip__name');
    return label ? label.textContent.trim() : button.getAttribute('data-solo');
  }

  function uses(item, tool) {
    return (item.getAttribute('data-tools') || '').split(/\s+/).indexOf(tool) !== -1;
  }

  function apply(button) {
    var tool = button ? button.getAttribute('data-solo') : null;
    var lit = [];
    current = button;
    buttons.forEach(function (key) {
      key.setAttribute('aria-pressed', String(key === button));
    });
    items.forEach(function (item) {
      var on = !tool || uses(item, tool);
      item.classList.toggle('is-muted', !on);
      if (tool && on) lit.push(item.getAttribute('data-name'));
    });
    status.textContent = tool ? 'Solo ' + toolName(button) + ': ' + lit.join(', ') : '';
  }

  buttons.forEach(function (button) {
    button.hidden = false;
    button.addEventListener('click', function () {
      apply(current === button ? null : button);
    });
  });
  desk.classList.add('has-solo');
  if (hint) hint.hidden = false;

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && current) apply(null);
  });
})();
