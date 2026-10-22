/**
 * OPTIONAL real-AI backend for the website assistant (Cloudflare Worker).
 * The site works without this file. Deploy it only when you want free-text answers from an LLM.
 *
 * Setup (about 10 minutes):
 *  1. Create a Cloudflare Worker and paste this file as the code.
 *  2. Settings > Variables: add a SECRET named ANTHROPIC_API_KEY, and plain variables
 *     ALLOWED_ORIGIN = https://americanitexperts.com   and   MODEL = claude-haiku-5-5   [CONFIRM model name and price in your Anthropic console].
 *  3. Add a Cloudflare rate-limiting rule for this Worker's URL (for example 20 requests per minute per IP).
 *     The in-memory limiter below is only a second line of defense.
 *  4. Set a monthly spend limit in the Anthropic console so a bad actor cannot run up a bill.
 *  5. Paste the Worker URL into CHAT_ENDPOINT in config.js.
 *
 * The browser sends { messages: [{role, content}], page }. The Worker answers { reply }.
 */
const SYSTEM = `You are the website assistant for American IT Experts, operated by AMZM Global LLC, a U.S.-led IT services and software company.
Answer in plain, short sentences (under 110 words). Use only the facts below. If you do not know, say so and offer to pass the visitor's details to the team.
Never invent prices, client names, statistics, certifications, guarantees or response-time promises. Never claim anyone holds a certification.

FACTS
- Services: Managed IT (help desk, monitoring, cloud care, fixed monthly fee, quoted after a free IT review); custom software (internal tools, portals, integrations, automation); AI agents and chatbots built for the client's own business; AI automation and MCP integrations; managed AI agent support after launch; CRM support for Zoho CRM, HubSpot, Salesforce and Microsoft Dynamics 365; enterprise ITSM (incident, problem, change and release management, root cause analysis, ServiceNow and Jira); ISO 27001 readiness and gap review (advice, not a certification audit); AI governance and risk review.
- Pricing: no public prices. Quotes are written after a free IT review.
- Replies: new enquiries get a reply by the next business day. Coverage hours for clients are agreed in writing.
- Contact: support@americanitexperts.com, phone (469) 326-2287, address 3401 Custer Rd, Suite 154, Plano, TX 75023, or the contact page.
- The company is led from Plano, Texas, by someone with 15+ years of enterprise IT operations experience.
- You are an automated assistant, not a person. Do not ask for passwords or sensitive data.
If the visitor wants to talk to the team, tell them to say "free IT review" so you can take their details.`;

const hits = new Map(); // ip -> [timestamps]; per-isolate only, so keep the Cloudflare rule too

function cors(origin, env) {
  const allow = env.ALLOWED_ORIGIN || "";
  const ok = allow && origin === allow;
  return {
    "Access-Control-Allow-Origin": ok ? origin : allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = { ...cors(origin, env), "Content-Type": "application/json" };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers });
    if (!env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers });

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
    if (recent.length >= 12) return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers });
    recent.push(now); hits.set(ip, recent);

    let body;
    try { body = await request.json(); } catch (e) { return new Response(JSON.stringify({ error: "Bad JSON" }), { status: 400, headers }); }
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length) return new Response(JSON.stringify({ error: "No message" }), { status: 400, headers });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: env.MODEL || "claude-haiku-5-5", max_tokens: 350, system: SYSTEM, messages })
    });
    if (!r.ok) return new Response(JSON.stringify({ error: "Upstream error" }), { status: 502, headers });
    const j = await r.json();
    const block = (j.content || []).find((b) => b.type === "text");
    const reply = block ? block.text.trim() : "";
    return new Response(JSON.stringify({ reply }), { status: 200, headers });
  }
};
