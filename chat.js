/* American IT Experts assistant. Guided mode answers from the site's own facts and collects leads.
   If CHAT_ENDPOINT is set in config.js, free-text questions that the guided answers cannot match go to your AI chat worker. */
(function () {
  var d = document, CFG = window.AIX || {};
  var EMAIL = CFG.EMAIL || "support@americanitexperts.com";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var KEY = "aix-chat-v1";

  var LINKS = {
    managed: { t: "See Managed IT", h: "managed-it.html" },
    software: { t: "See Software, AI and CRM", h: "software.html" },
    enterprise: { t: "See Enterprise and ITSM", h: "enterprise-itsm.html" },
    about: { t: "About us", h: "about.html" },
    contact: { t: "Open the contact page", h: "contact.html" },
    privacy: { t: "Read the Privacy Policy", h: "privacy.html" }
  };
  var MAIN = [
    { t: "Find the right service", d: "flow:find" },
    { t: "Managed IT", d: "kb:managed" },
    { t: "AI agents and CRM", d: "kb:ai" },
    { t: "Enterprise and ITSM", d: "kb:itsm" },
    { t: "Get a free IT review", d: "lead", go: 1 }
  ];
  var PRICE_LEAD = [{ t: "How is pricing handled?", d: "kb:pricing" }, { t: "Get a free IT review", d: "lead", go: 1 }];

  var KB = [
    { id: "hi", k: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"],
      a: "Hi, I'm the automated assistant for American IT Experts. I can point you to the right service, answer common questions, or pass your details to the team.", o: MAIN },
    { id: "who", k: ["are you a bot", "are you human", "are you real", "real person", "chatgpt"],
      a: "I'm an automated assistant, not a person. I can answer common questions and pass your details to the team, who reply by the next business day.", o: MAIN },
    { id: "managed", k: ["managed it", "help desk", "helpdesk", "it support", "support desk", "microsoft 365", "m365", "office 365", "backup*", "monitoring", "patch*", "endpoint*", "small business", "user support", "onboarding", "offboarding"],
      a: "Managed IT is our help desk, monitoring and cloud care for one agreed monthly fee. Every request has a named owner and is tracked until it is closed. It suits small and mid-size businesses that want dependable IT without building a large team.", l: ["managed"], o: PRICE_LEAD },
    { id: "software", k: ["software", "web app", "application*", "website*", "portal*", "custom*", "develop*", "dashboard*", "api", "apis", "integrat*", "app", "apps"],
      a: "We build custom software: internal tools, dashboards, customer portals, integrations and workflow automation. Projects start with a written scope and an early working demo, and we hand over documentation so you are never locked out of your own system.", l: ["software"], o: PRICE_LEAD },
    { id: "crm", k: ["crm", "zoho", "hubspot", "salesforce", "dynamics", "pipeline*", "leads", "sales automation"],
      a: "We support Zoho CRM, HubSpot, Salesforce and Microsoft Dynamics 365: setup, pipelines, automation, data cleanup, reporting and day-to-day support. We can also build an AI-driven CRM or chatbot made for your business.", l: ["software"], o: PRICE_LEAD },
    { id: "ai", k: ["ai", "a.i", "artificial intelligence", "agent*", "chatbot*", "chat bot", "bot", "llm", "gpt", "mcp", "automation*", "automate*", "copilot", "prompt*"],
      a: "We build and support AI agents and chatbots made for your own business, plus automation and MCP integrations that connect your CRM, tickets and email. We also run them after launch: monitoring, tuning and fixing. A person reviews anything sensitive.", l: ["software"], o: [{ t: "Which CRMs do you support?", d: "kb:crm" }, { t: "Get a free IT review", d: "lead", go: 1 }] },
    { id: "itsm", k: ["itsm", "itil", "servicenow", "service now", "jira", "incident*", "problem management", "root cause", "rca", "change management", "release*", "cab", "major incident*", "production support", "data center", "data centre", "service delivery", "enterprise", "devops", "linux"],
      a: "For larger or regulated organizations we run incident, problem and change discipline: major incident management, root cause analysis, change and release control, and service reviews in the tools you already use, such as ServiceNow and Jira.", l: ["enterprise"], o: [{ t: "ISO 27001 review", d: "kb:iso" }, { t: "Get a free IT review", d: "lead", go: 1 }] },
    { id: "cert", k: ["are you certified", "are you iso", "iso certified", "certified", "accredited", "accreditation", "credentials", "certificate*", "certification*"],
      a: "I can't confirm any company certification from this page, so I won't guess. What we offer is an ISO 27001 readiness and gap review: advice to prepare you for a certification audit, not a certification audit itself. For credentials, send the team a note and they will answer directly.", o: [{ t: "ISO 27001 review", d: "kb:iso" }, { t: "Get a free IT review", d: "lead", go: 1 }] },
    { id: "iso", k: ["iso", "27001", "42001", "audit*", "compliance", "governance", "risk", "gap review"],
      a: "We offer an ISO 27001 readiness and gap review. We compare your current practices with the standard's requirements and give you a written list of findings and an action plan. It is advice to prepare you, not a certification audit. We also review AI governance and risk.", l: ["enterprise"], o: PRICE_LEAD },
    { id: "pricing", k: ["price*", "pricing", "cost*", "how much", "quote*", "rate", "rates", "fee", "fees", "budget", "expensive", "cheap", "afford*"],
      a: "We quote per engagement, so there is no public price list. Managed IT is a fixed monthly fee based on your users, systems and coverage hours. Projects are quoted at a fixed scope. After the free IT review you receive a written quote.", o: [{ t: "Get a free IT review", d: "lead", go: 1 }, { t: "Find the right service", d: "flow:find" }] },
    { id: "hours", k: ["hours", "24/7", "24x7", "after hours", "response", "how fast", "how long", "reply", "sla", "turnaround", "available", "weekend*"],
      a: "We reply to new enquiries by the next business day. For supported clients, response and resolution targets are set by priority in the agreement, and coverage hours are agreed in writing before work starts.", o: MAIN },
    { id: "team", k: ["who are you", "about", "company", "amzm", "experience", "founder", "owner", "us based", "u.s."],
      a: "American IT Experts is operated by AMZM Global LLC and led from Plano, Texas. The company is led by someone with more than 15 years of experience in enterprise IT operations: production support, incident response and service delivery.", l: ["about"], o: MAIN },
    { id: "where", k: ["phone", "phone number", "call us", "address", "office", "visit", "where are you", "where is your", "where do you", "based", "location", "located", "plano", "texas", "email", "email address", "how can i reach", "reach you", "reach out"],
      a: "You can reach us by email at " + EMAIL + " or by phone at (469) 326-2287. Our address is 3401 Custer Rd, Suite 154, Plano, TX 75023. We reply to written enquiries by the next business day.", l: ["contact"], o: [{ t: "Get a free IT review", d: "lead", go: 1 }] },
    { id: "start", k: ["where do i start", "where to start", "not sure", "which service", "what do you recommend", "recommend*", "help me choose", "what do i need", "what should i"], flow: true },
    { id: "security", k: ["security", "access", "permission*", "password*", "privacy", "data protection", "confidential*"],
      a: "We work through named accounts with the minimum permissions needed, with written approval for administrative access. Access is reviewed regularly and removed when work ends. How we handle details you send through this site is in our Privacy Policy.", l: ["privacy"], o: MAIN },
    { id: "thanks", k: ["thanks", "thank you", "thx", "cheers", "appreciate"],
      a: "You're welcome. Anything else I can help with?", o: MAIN },
    { id: "bye", k: ["bye", "goodbye", "see you", "that is all", "that's all"],
      a: "Thanks for stopping by. If you want a reply from the team, the free IT review is one message away.", o: [{ t: "Get a free IT review", d: "lead", go: 1 }] },
    { id: "contact", k: ["contact*", "talk to", "speak", "human", "call me", "book", "free review", "free it review", "get started", "hire", "consult*"], lead: true }
  ];
  KB.forEach(function (e) {
    e.re = (e.k || []).map(function (kw) {
      var open = /\*$/.test(kw), raw = kw.replace(/\*$/, "").replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
      return { w: kw.length > 6 ? 2 : 1, r: new RegExp("(^|[^a-z0-9])" + raw + (open ? "" : "([^a-z0-9]|$)")) };
    });
  });
  var FALLBACK = "I don't have a good answer to that yet. I can point you to a service, or take your details so the team can answer by the next business day.";

  var S = { m: [], open: false, mode: "chat", step: 0, lead: {} };
  try { var raw = sessionStorage.getItem(KEY); if (raw) { var p = JSON.parse(raw); if (p && p.m) S = p; } } catch (e) {}
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ m: S.m.slice(-40), open: S.open, mode: S.mode, step: S.step, lead: S.lead })); } catch (e) {} }

  // ---- markup
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>';
  var SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var launch = d.createElement("button");
  launch.className = "aix-launch"; launch.type = "button"; launch.id = "aix-launch";
  launch.setAttribute("aria-haspopup", "dialog"); launch.setAttribute("aria-expanded", "false"); launch.setAttribute("aria-controls", "aix-panel");
  launch.innerHTML = '<span class="ic">' + ICON + '</span><span class="t">Ask our assistant</span><span class="dot" aria-hidden="true"></span>';
  var panel = d.createElement("div");
  panel.className = "aix-panel"; panel.id = "aix-panel"; panel.hidden = true;
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "American IT Experts assistant");
  panel.innerHTML =
    '<div class="aix-head"><div><b>Assistant</b><small>Automated. Not a person.</small></div><button class="aix-x" type="button" aria-label="Close assistant">&#10005;</button></div>' +
    '<div class="aix-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
    '<form class="aix-form" autocomplete="off"><input type="text" id="aix-input" aria-label="Type your message" placeholder="Type a question" maxlength="400"><button type="submit" aria-label="Send">' + SEND + '</button></form>' +
    '<p class="aix-foot">Please do not share passwords or sensitive data here. <a href="privacy.html">Privacy Policy</a></p>';
  d.body.appendChild(launch); d.body.appendChild(panel);
  var log = panel.querySelector(".aix-log"), form = panel.querySelector(".aix-form"), input = panel.querySelector("#aix-input");

  // ---- rendering
  function el(tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function optEl(o) {
    var b;
    if (o.h) { b = el("a", "aix-opt", o.t); b.href = o.h; if (/^https?:/.test(o.h)) { b.target = "_blank"; b.rel = "noopener"; } }
    else { b = el("button", "aix-opt", o.t); b.type = "button"; b.addEventListener("click", function () { choose(o); }); }
    if (o.go) b.className += " go";
    return b;
  }
  function render() {
    log.textContent = "";
    S.m.forEach(function (m, i) {
      var bubble = el("div", "aix-m " + (m.r === "me" ? "me" : "bot"), m.t);
      log.appendChild(bubble);
      var isLast = i === S.m.length - 1;
      var opts = [];
      (m.l || []).forEach(function (k) { if (LINKS[k]) opts.push({ t: LINKS[k].t, h: LINKS[k].h }); });
      (m.x || []).forEach(function (x) { opts.push(x); });
      if (isLast) (m.o || []).forEach(function (x) { opts.push(x); });
      if (opts.length && (isLast || (m.l || []).length || (m.x || []).length)) {
        var row = el("div", "aix-opts");
        opts.forEach(function (o) { row.appendChild(optEl(o)); });
        log.appendChild(row);
      }
    });
    log.scrollTop = log.scrollHeight;
  }
  function push(m) { S.m.push(m); save(); render(); }

  var chain = Promise.resolve(), typingEl = null;
  function showTyping() { hideTyping(); typingEl = el("div", "aix-m bot typing"); typingEl.innerHTML = "<i></i><i></i><i></i>"; typingEl.setAttribute("aria-hidden", "true"); log.appendChild(typingEl); log.scrollTop = log.scrollHeight; }
  function hideTyping() { if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl); typingEl = null; }
  function bot(m, fast) {
    chain = chain.then(function () {
      return new Promise(function (res) {
        if (reduce || fast) { push(m); return res(); }
        showTyping();
        setTimeout(function () { hideTyping(); push(m); res(); }, 380 + Math.min(700, (m.t || "").length * 4));
      });
    });
    return chain;
  }

  // ---- matching
  function match(text) {
    var t = " " + text.toLowerCase() + " ", best = null, bestScore = 0;
    KB.forEach(function (e) {
      var s = 0;
      e.re.forEach(function (x) { if (x.r.test(t)) s += x.w; });
      if (s > bestScore) { bestScore = s; best = e; }
    });
    return best ? { e: best, score: bestScore } : null;
  }
  function answer(e) {
    if (e.lead) return startLead(true);
    if (e.flow) return findFlow();
    bot({ r: "bot", t: e.a, l: e.l, o: e.o || MAIN });
  }

  // ---- guided service finder
  function findFlow() {
    bot({ r: "bot", t: "Which of these sounds most like you?", o: [
      { t: "A small business that needs IT support", d: "pick:managed" },
      { t: "A team that needs software built", d: "pick:software" },
      { t: "I want AI agents or CRM help", d: "pick:ai" },
      { t: "A larger organization with ITSM or compliance needs", d: "pick:enterprise" }
    ] });
  }
  var PICK = {
    managed: ["Managed IT looks like the best fit. It covers your help desk, monitoring and cloud care for one agreed monthly fee.", "managed"],
    software: ["Custom software looks like the best fit. We build internal tools, portals, integrations and automation.", "software"],
    ai: ["The Software, AI and CRM page is your best starting point. It covers AI agents, chatbots, automation and CRM support for Zoho CRM, HubSpot, Salesforce and Microsoft Dynamics 365.", "software"],
    enterprise: ["Enterprise and ITSM looks like the best fit. It covers incident, problem and change discipline, plus ISO 27001 readiness and AI governance reviews.", "enterprise"]
  };

  // ---- lead capture
  function startLead(fromIntent) {
    S.mode = "lead"; S.step = 1; S.lead = {}; save();
    bot({ r: "bot", t: (fromIntent ? "Happy to help. " : "") + "I'll take a few details so the team can reply by the next business day. You can type cancel at any time. What's your name?" });
  }
  function leadStep(text) {
    var t = text.trim();
    if (/^(cancel|stop|never ?mind|no thanks)$/i.test(t)) { S.mode = "chat"; S.step = 0; save(); return bot({ r: "bot", t: "No problem, nothing was sent. Anything else I can help with?", o: MAIN }); }
    if (S.step === 1) {
      S.lead.name = t.slice(0, 80); S.step = 2; save();
      return bot({ r: "bot", t: "Thanks, " + S.lead.name + ". What's the best email address to reach you?" });
    }
    if (S.step === 2) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return bot({ r: "bot", t: "That email doesn't look right. Please type it like name@company.com." });
      S.lead.email = t.slice(0, 120); S.step = 3; save();
      return bot({ r: "bot", t: "And briefly, what do you need help with?" });
    }
    if (S.step === 3) {
      S.lead.message = t.slice(0, 600); S.step = 4; S.mode = "confirm"; save();
      return bot({ r: "bot", t: "Here is what I have.\nName: " + S.lead.name + "\nEmail: " + S.lead.email + "\nNeed: " + S.lead.message + "\n\nShall I pass this to the team?", o: [{ t: "Yes, send it", d: "send", go: 1 }, { t: "Start over", d: "lead" }, { t: "Cancel", d: "cancel" }] });
    }
  }
  function mailtoHref() {
    var b = "Name: " + S.lead.name + "\nEmail: " + S.lead.email + "\n\n" + S.lead.message + "\n\n(Sent from the website assistant)";
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Free IT review request") + "&body=" + encodeURIComponent(b);
  }
  function sendLead() {
    var data = { name: S.lead.name, email: S.lead.email, message: S.lead.message, topic: "", company: "", source: "website assistant" };
    S.mode = "chat"; S.step = 0; save();
    if (CFG.FORM_ENDPOINT) {
      bot({ r: "bot", t: "Sending now..." }, true);
      fetch(CFG.FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) {
          if (r.ok) bot({ r: "bot", t: "Sent. The team will reply to " + data.email + " by the next business day.", o: MAIN });
          else throw new Error("bad status");
        })
        .catch(function () { bot({ r: "bot", t: "I couldn't send that from here. You can email " + EMAIL + " directly.", x: [{ t: "Open email app", h: mailtoHref() }, { t: "Copy email address", d: "copy" }] }); });
    } else {
      bot({ r: "bot", t: "I can't send messages from this page yet, so nothing has been sent. Use the button to open your email app with this message ready, or write to " + EMAIL + " directly.", x: [{ t: "Open email app", h: mailtoHref() }, { t: "Copy email address", d: "copy" }] });
    }
  }

  // ---- optional AI endpoint
  function askModel(text) {
    var hist = S.m.filter(function (m) { return m.t; }).slice(-8).map(function (m) { return { role: m.r === "me" ? "user" : "assistant", content: m.t }; });
    showTyping();
    chain = chain.then(function () {
      return fetch(CFG.CHAT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: hist, page: location.pathname }) })
        .then(function (r) { if (!r.ok) throw new Error("bad status"); return r.json(); })
        .then(function (j) {
          hideTyping();
          if (!j || !j.reply) throw new Error("empty");
          push({ r: "bot", t: String(j.reply).slice(0, 1200), o: [{ t: "Get a free IT review", d: "lead", go: 1 }, { t: "Find the right service", d: "flow:find" }] });
        })
        .catch(function () {
          hideTyping();
          var hit = match(text);
          if (hit) answer(hit.e); else push({ r: "bot", t: FALLBACK, o: MAIN });
        });
    });
  }

  // ---- actions
  function choose(o) {
    var d2 = o.d || "";
    push({ r: "me", t: o.t });
    if (d2 === "lead") return startLead(false);
    if (d2 === "send") return sendLead();
    if (d2 === "cancel") { S.mode = "chat"; S.step = 0; save(); return bot({ r: "bot", t: "No problem, nothing was sent. Anything else I can help with?", o: MAIN }); }
    if (d2 === "flow:find") return findFlow();
    if (d2 === "copy") {
      var done = function (ok) { bot({ r: "bot", t: ok ? "Copied " + EMAIL + "." : "Please copy it from here: " + EMAIL, o: MAIN }, true); };
      try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(EMAIL).then(function () { done(true); }, function () { done(false); }); } catch (e) {}
      return done(false);
    }
    if (d2.indexOf("kb:") === 0) { var id = d2.slice(3); var e = KB.filter(function (x) { return x.id === id; })[0]; if (e) return answer(e); }
    if (d2.indexOf("pick:") === 0) {
      var pk = PICK[d2.slice(5)];
      if (pk) return bot({ r: "bot", t: pk[0], l: [pk[1]], o: [{ t: "Get a free IT review", d: "lead", go: 1 }, { t: "Ask something else", d: "kb:hi" }] });
    }
  }
  function handleText(text) {
    var t = text.trim();
    if (!t) return;
    push({ r: "me", t: t.slice(0, 400) });
    if (S.mode === "lead") return leadStep(t);
    if (S.mode === "confirm") {
      if (/^(y|yes|yeah|yep|send|send it|ok|okay|sure)\b/i.test(t)) return sendLead();
      if (/^(n|no|cancel|stop)\b/i.test(t)) { S.mode = "chat"; S.step = 0; save(); return bot({ r: "bot", t: "No problem, nothing was sent. Anything else I can help with?", o: MAIN }); }
      return bot({ r: "bot", t: "Please choose Yes, send it, or Cancel.", o: [{ t: "Yes, send it", d: "send", go: 1 }, { t: "Cancel", d: "cancel" }] });
    }
    var hit = match(t);
    if (CFG.CHAT_ENDPOINT && (!hit || hit.score < 2)) return askModel(t);
    if (hit) return answer(hit.e);
    bot({ r: "bot", t: FALLBACK, o: MAIN });
  }

  // ---- open and close
  function open() {
    S.open = true; panel.hidden = false; launch.setAttribute("aria-expanded", "true"); save();
    var dot = launch.querySelector(".dot"); if (dot) dot.hidden = true;
    if (!S.m.length) bot({ r: "bot", t: KB[0].a, o: MAIN }, true); else render();
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() { S.open = false; panel.hidden = true; launch.setAttribute("aria-expanded", "false"); save(); launch.focus(); }
  launch.addEventListener("click", function () { if (panel.hidden) open(); else close(); });
  panel.querySelector(".aix-x").addEventListener("click", close);
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); var v = input.value; input.value = ""; handleText(v); });

  if (S.open) { panel.hidden = false; launch.setAttribute("aria-expanded", "true"); var dd = launch.querySelector(".dot"); if (dd) dd.hidden = true; if (S.m.length) render(); else bot({ r: "bot", t: KB[0].a, o: MAIN }, true); }
  window.AIXChat = { open: open, close: close };
})();
