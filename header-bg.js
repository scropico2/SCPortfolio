/* Flow-field header background for simas.dev
   Expects: <header class="header"> containing <canvas class="header__bg"> and an element .dotMarked (the orange dot).
   Colors are read from your own CSS: header background, .header__title color, .dotMarked color. */
(function () {
  var hd = document.querySelector('.header');
  var cv = hd && hd.querySelector('.header__bg');
  var dotEl = hd && hd.querySelector('.dotMarked');
  if (!hd || !cv || !dotEl) return;

  var ctx = cv.getContext('2d');
  var DENSITY = 250;                       // px² per line: higher = fewer, calmer lines
  var BG = '#f5f3ee', LINE = '23,23,26', ACCENT = '242,106,61';
  var W, H, dpr, P = [], t = 0, mx = -1e4, my = -1e4, cx = 0, cy = 0;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rgbOf(c) { var m = c.match(/\d+(\.\d+)?/g); return m ? m.slice(0, 3).join(',') : null; }
  function readColors() {
    var bg = getComputedStyle(hd).backgroundColor;
    if (!bg || bg === 'transparent' || /rgba\(.*,\s*0\)$/.test(bg)) bg = getComputedStyle(document.body).backgroundColor;
    if (bg && !/rgba\(.*,\s*0\)$/.test(bg)) BG = bg;
    var title = hd.querySelector('.header__title');
    if (title) LINE = rgbOf(getComputedStyle(title).color) || LINE;
    ACCENT = rgbOf(getComputedStyle(dotEl).color) || ACCENT;
  }
  function dotPos() {
    var r = dotEl.getBoundingClientRect(), h = hd.getBoundingClientRect();
    cx = r.left - h.left + r.width / 2; cy = r.top - h.top + r.height * .78;
  }
  function seed(p) { p.x = Math.random() * W; p.y = Math.random() * H; p.life = 80 + Math.random() * 220; p.o = 0; }
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = hd.clientWidth; H = hd.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readColors(); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); dotPos();
    var n = Math.max(150, Math.round(W * H / DENSITY));
    P = []; for (var i = 0; i < n; i++) { var p = {}; seed(p); P.push(p); }
  }
  function ang(x, y) {
    return (Math.sin(x * .0021 + t * .25) + Math.sin(y * .0026 - t * .2) + Math.sin((x + y) * .0013 + t * .15) * 1.3) * 1.5;
  }
  function step() {
    var R = Math.min(W * .35, 260);
    for (var i = 0; i < P.length; i++) {
      var p = P[i], a = ang(p.x, p.y), dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) + .001, near = 0;
      var vx = Math.cos(a), vy = Math.sin(a);
      if (d < R) { near = 1 - d / R; var k = near * near * 2.6; vx += (-dy / d) * k; vy += (dx / d) * k; }  // swirl around the dot
      var mdx = p.x - mx, mdy = p.y - my, md = Math.hypot(mdx, mdy) + .001;
      if (md < 120) { var m = (1 - md / 120) * 2.2; vx += mdx / md * m; vy += mdy / md * m; }               // cursor pushes lines away
      var nx = p.x + vx * 1.5, ny = p.y + vy * 1.5, al = Math.min(1, p.o) * (.16 + near * .5);
      ctx.strokeStyle = near > .35 ? 'rgba(' + ACCENT + ',' + al * 1.4 + ')' : 'rgba(' + LINE + ',' + al + ')';
      ctx.lineWidth = near > .35 ? 1.1 : .7;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny; p.o += .05; p.life--;
      if (p.life < 0 || nx < -20 || nx > W + 20 || ny < -20 || ny > H + 20) seed(p);
    }
    t += .004;
  }
  function frame() { ctx.globalAlpha = .07; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; step(); requestAnimationFrame(frame); }

  hd.addEventListener('pointermove', function (e) { var r = hd.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  hd.addEventListener('pointerleave', function () { mx = my = -1e4; });
  addEventListener('resize', resize);
  if (document.fonts) document.fonts.ready.then(dotPos);
  resize();
  if (still) { for (var i = 0; i < 260; i++) step(); } else { requestAnimationFrame(frame); }
})();
