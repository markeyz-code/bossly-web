(function () {
  'use strict';
  if (window.__ojalyWidgetLoaded) return;
  window.__ojalyWidgetLoaded = true;

  var script = document.currentScript;
  if (!script) return;
  var slug = script.getAttribute('data-ojaly');
  if (!slug) return;
  var mode = script.getAttribute('data-mode') || 'button';
  var label = script.getAttribute('data-label') || 'Order on WhatsApp';
  var origin = new URL(script.src).origin;
  var orderLink = origin + '/s/' + encodeURIComponent(slug);

  var style = document.createElement('style');
  style.textContent = [
    '.ojaly-w{position:fixed;z-index:2147483000;bottom:20px;right:20px;font-family:system-ui,-apple-system,sans-serif}',
    '.ojaly-w-b{display:inline-flex;align-items:center;gap:8px;background:#FF5A1F;color:#fff;border:0;border-radius:999px;padding:14px 20px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 10px 30px rgba(6,35,26,.25)}',
    '.ojaly-w-b:hover{transform:translateY(-1px)}',
    '.ojaly-w-m{position:fixed;inset:0;z-index:2147483001;background:rgba(6,35,26,.6);display:flex;align-items:center;justify-content:center;padding:16px}',
    '.ojaly-w-f{width:100%;max-width:430px;height:90vh;max-height:720px;border:0;border-radius:20px;background:#fff;box-shadow:0 30px 80px rgba(0,0,0,.4)}',
    '.ojaly-w-c{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:999px;border:0;background:#fff;font-size:18px;cursor:pointer}',
    '@media (max-width:480px){.ojaly-w-f{height:100%;max-height:none;border-radius:0}.ojaly-w-m{padding:0}}'
  ].join('');
  document.head.appendChild(style);

  function open() {
    var modal = document.createElement('div');
    modal.className = 'ojaly-w-m';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Order form');
    modal.innerHTML = '<iframe class="ojaly-w-f" title="Order from this business" src="' + origin + '/embed/order?b=' + encodeURIComponent(slug) + '&v=1"></iframe><button class="ojaly-w-c" aria-label="Close">×</button>';
    var close = function () { modal.remove(); document.removeEventListener('keydown', onKey); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('.ojaly-w-c').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(modal);
    window.addEventListener('message', function (e) {
      if (e.origin !== origin) return;
      if (e.data && e.data.type === 'ojaly:close') close();
      if (e.data && e.data.type === 'ojaly:order-created') setTimeout(close, 3500);
    }, { once: true });
  }

  var holder = document.createElement('div');
  holder.className = 'ojaly-w';
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'ojaly-w-b';
  button.innerHTML = '<span aria-hidden="true">🛍️</span> ' + label;
  button.addEventListener('click', open);
  holder.appendChild(button);

  var targetSel = script.getAttribute('data-target');
  if (mode === 'inline' && targetSel) {
    var target = document.querySelector(targetSel);
    if (target) { holder.className = ''; holder.style.cssText = 'display:inline-block'; target.appendChild(holder); return; }
  }
  document.body.appendChild(holder);
})();
