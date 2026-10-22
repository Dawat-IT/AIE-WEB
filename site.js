/* American IT Experts site behavior: theme, menu, replaying records, pointer parallax, tabs, hero video slot, contact form. */
(function () {
  var d = document, root = d.documentElement;
  var CFG = window.AIX || {};
  var EMAIL = CFG.EMAIL || "support@americanitexperts.com";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  root.classList.add("js");

  // theme
  var tbtn = d.getElementById("theme");
  if (tbtn) tbtn.addEventListener("click", function () {
    var cur = root.getAttribute("data-theme") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("aitx-theme", next); } catch (e) {}
  });

  // mobile menu
  var mbtn = d.getElementById("menu"), nav = d.getElementById("nav");
  if (mbtn && nav) {
    var setMenu = function (open) { nav.classList.toggle("open", open); mbtn.setAttribute("aria-expanded", open ? "true" : "false"); };
    mbtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); mbtn.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  }

  // footer year
  var y = d.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();

  // replaying records: highlight one child at a time
  if (!reduce) d.querySelectorAll("[data-cycle]").forEach(function (box) {
    var rows = box.children, i = 0;
    if (rows.length < 2) return;
    setInterval(function () {
      rows[i].classList.remove("on"); i = (i + 1) % rows.length; rows[i].classList.add("on");
    }, 2200);
  });

  // pointer parallax on the home hero
  var vis = d.getElementById("visual"), hero = d.getElementById("top"), raf = 0;
  if (vis && hero && !reduce) hero.addEventListener("pointermove", function (e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0; var r = hero.getBoundingClientRect();
      vis.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      vis.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  });


  // live network animation behind heroes and the AI band
  (function () {
    var cvs = d.querySelectorAll("canvas.fx");
    if (!cvs.length) return;
    function hex(c) {
      c = (c || "").trim();
      if (c.charAt(0) !== "#") return [29, 63, 181];
      if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
      return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    }
    function palette(dark) {
      if (dark) return { line: [143, 176, 255], pulse: [255, 155, 170], a: 0.42 };
      var cs = getComputedStyle(root);
      return { line: hex(cs.getPropertyValue("--brand")), pulse: hex(cs.getPropertyValue("--cta")), a: 0.38 };
    }
    cvs.forEach(function (cv) {
      var ctx = cv.getContext("2d");
      if (!ctx) return;
      var host = cv.parentNode, forceDark = cv.getAttribute("data-fx") === "dark";
      var W = 1, H = 1, dpr = 1, nodes = [], pulses = [], col = palette(forceDark);
      var running = false, visible = true, px = -9999, py = -9999, last = 0, spawn = 0, n = 0;
      function size() {
        var r = host.getBoundingClientRect();
        W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
        dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var want = Math.max(14, Math.min(58, Math.round(W * H / 17000)));
        while (nodes.length < want) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22, r: 1.3 + Math.random() * 1.6 });
        nodes.length = want;
        if (!running) draw();
      }
      function reach() { return Math.min(170, Math.max(110, W / 7)); }
      function draw() {
        ctx.clearRect(0, 0, W, H);
        var L = reach(), L2 = L * L, i, j, a, b, dx, dy, dd, lc = col.line.join(",");
        ctx.lineWidth = 1;
        for (i = 0; i < nodes.length; i++) {
          a = nodes[i];
          for (j = i + 1; j < nodes.length; j++) {
            b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; dd = dx * dx + dy * dy;
            if (dd < L2) {
              ctx.strokeStyle = "rgba(" + lc + "," + ((1 - Math.sqrt(dd) / L) * col.a).toFixed(3) + ")";
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
          dx = a.x - px; dy = a.y - py; dd = dx * dx + dy * dy;
          if (dd < 36100) {
            ctx.strokeStyle = "rgba(" + col.pulse.join(",") + "," + ((1 - Math.sqrt(dd) / 190) * 0.55).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(px, py); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(" + lc + "," + Math.min(0.8, col.a + 0.3).toFixed(2) + ")";
        for (i = 0; i < nodes.length; i++) { a = nodes[i]; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill(); }
        var pc = col.pulse.join(",");
        for (i = 0; i < pulses.length; i++) {
          var p = pulses[i], A = nodes[p.a], B = nodes[p.b];
          if (!A || !B) continue;
          var x = A.x + (B.x - A.x) * p.t, y = A.y + (B.y - A.y) * p.t;
          ctx.fillStyle = "rgba(" + pc + ",0.22)"; ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "rgba(" + pc + ",0.95)"; ctx.beginPath(); ctx.arc(x, y, 2.8, 0, 6.2832); ctx.fill();
        }
      }
      function step(dt) {
        var i, a, k = dt / 16, L = reach();
        for (i = 0; i < nodes.length; i++) {
          a = nodes[i];
          var dx = px - a.x, dy = py - a.y, dd = dx * dx + dy * dy;
          if (dd < 40000 && dd > 1) { a.vx += dx / Math.sqrt(dd) * 0.004 * k; a.vy += dy / Math.sqrt(dd) * 0.004 * k; }
          a.vx *= 0.995; a.vy *= 0.995;
          if (Math.abs(a.vx) < 0.05) a.vx += (Math.random() - 0.5) * 0.01;
          if (Math.abs(a.vy) < 0.05) a.vy += (Math.random() - 0.5) * 0.01;
          a.x += a.vx * k; a.y += a.vy * k;
          if (a.x < 0 || a.x > W) { a.vx = -a.vx; a.x = Math.max(0, Math.min(W, a.x)); }
          if (a.y < 0 || a.y > H) { a.vy = -a.vy; a.y = Math.max(0, Math.min(H, a.y)); }
        }
        for (i = pulses.length - 1; i >= 0; i--) { pulses[i].t += dt * 0.00075; if (pulses[i].t >= 1) pulses.splice(i, 1); }
        spawn -= dt;
        if (spawn <= 0 && pulses.length < 7) {
          spawn = 520;
          var s = nodes[Math.floor(Math.random() * nodes.length)], best = -1, bd = 1e9, j;
          for (j = 0; j < nodes.length; j++) {
            if (nodes[j] === s) continue;
            var ex = nodes[j].x - s.x, ey = nodes[j].y - s.y, ed = ex * ex + ey * ey;
            if (ed < L * L && ed < bd && Math.random() < 0.6) { bd = ed; best = j; }
          }
          if (best > -1) pulses.push({ a: nodes.indexOf(s), b: best, t: 0 });
        }
      }
      var frames = 0;
      function loop(ts) {
        if (!running) return;
        var dt = Math.min(48, last ? ts - last : 16); last = ts;
        if (++frames % 60 === 0) col = palette(forceDark);
        step(dt); draw(); requestAnimationFrame(loop);
      }
      function start() { if (running || reduce || !visible || d.hidden) return; running = true; last = 0; requestAnimationFrame(loop); }
      function stop() { running = false; }
      size();
      if (window.ResizeObserver) new ResizeObserver(size).observe(host); else window.addEventListener("resize", size);
      if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(host);
      d.addEventListener("visibilitychange", function () { if (d.hidden) stop(); else start(); });
      host.addEventListener("pointermove", function (e) { var r = host.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
      host.addEventListener("pointerleave", function () { px = -9999; py = -9999; });
      if (tbtn) tbtn.addEventListener("click", function () { setTimeout(function () { col = palette(forceDark); if (!running) draw(); }, 30); });
      start();
    });
  })();

  // pause SVG pulses for reduced motion
  if (reduce) d.querySelectorAll("svg.flow").forEach(function (s) { try { s.pauseAnimations(); } catch (e) {} });

  // hero media slot: only loads when HERO_VIDEO (or HERO_POSTER) is set in config.js
  var slot = d.getElementById("hero-media");
  if (slot && (CFG.HERO_VIDEO || CFG.HERO_POSTER)) {
    var conn = navigator.connection || {};
    var light = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || "");
    if (CFG.HERO_VIDEO && !reduce && !light) {
      var v = d.createElement("video");
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true"); v.preload = "auto";
      if (CFG.HERO_POSTER) v.poster = CFG.HERO_POSTER;
      v.addEventListener("canplay", function () { slot.classList.add("on"); slot.parentNode.classList.add("has-video"); var p = v.play(); if (p && p.catch) p.catch(function () {}); });
      v.addEventListener("error", function () { slot.classList.remove("on"); slot.parentNode.classList.remove("has-video"); slot.removeChild(v); });
      v.src = CFG.HERO_VIDEO;
      slot.appendChild(v);
    } else if (CFG.HERO_POSTER) {
      var im = d.createElement("img");
      im.alt = ""; im.setAttribute("aria-hidden", "true");
      im.addEventListener("load", function () { slot.classList.add("on"); slot.parentNode.classList.add("has-video"); });
      im.src = CFG.HERO_POSTER;
      slot.appendChild(im);
    }
  }

  // tabs (incident lifecycle)
  d.querySelectorAll("[data-tabs]").forEach(function (box) {
    var tabs = [].slice.call(box.querySelectorAll('[role="tab"]'));
    var panels = [].slice.call(box.querySelectorAll('[role="tabpanel"]'));
    var pick = function (i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { pick(i, false); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); pick(n, true); }
      });
    });
    pick(0, false);
  });

  // copy buttons
  d.querySelectorAll("[data-copy]").forEach(function (btn) {
    var target = d.getElementById(btn.getAttribute("data-copy"));
    if (!target) return;
    var label = btn.textContent;
    var flash = function (m) { btn.textContent = m; setTimeout(function () { btn.textContent = label; }, 1800); };
    var pickText = function () {
      var r = d.createRange(); r.selectNodeContents(target);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); flash("Selected");
    };
    btn.addEventListener("click", function () {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(target.textContent.trim()).then(function () { flash("Copied"); }, pickText);
        else pickText();
      } catch (e) { pickText(); }
    });
  });

  // open the assistant from any button
  d.querySelectorAll("[data-open-chat]").forEach(function (b) {
    b.addEventListener("click", function () { if (window.AIXChat) window.AIXChat.open(); });
  });

  // contact form
  var form = d.getElementById("lead-form"), status = d.getElementById("form-status");
  if (form && status) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = form.elements;
    var data = {
      name: f.name.value.trim(), email: f.email.value.trim(), company: f.company.value.trim(),
      topic: f.topic ? f.topic.value : "", message: f.message.value.trim(), source: "contact form"
    };
    if (!data.name || data.email.indexOf("@") < 1 || data.email.indexOf(".") < 0 || !data.message) {
      status.textContent = "Please add your name, a valid email and a short message.";
      return;
    }
    if (CFG.FORM_ENDPOINT) {
      status.textContent = "Sending...";
      fetch(CFG.FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) {
          if (r.ok) { status.textContent = "Thank you. We will reply by the next business day."; form.reset(); }
          else status.textContent = "Something went wrong. Please email " + EMAIL + " directly.";
        })
        .catch(function () { status.textContent = "Something went wrong. Please email " + EMAIL + " directly."; });
    } else {
      var body = "Name: " + data.name + "\nEmail: " + data.email + "\nCompany: " + data.company + "\nInterested in: " + data.topic + "\n\n" + data.message;
      status.textContent = "Your email app should open with your message ready to send. If it does not, copy our address below and write to us directly.";
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Free IT review request") + "&body=" + encodeURIComponent(body);
    }
  });
})();
