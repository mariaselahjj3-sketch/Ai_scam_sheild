const RULES = [
  [/gift ?card|bitcoin|crypto|wire transfer|western union/i, 35, "Asks for an unusual payment method"],
  [/urgent|immediately|within 24 ?h|final notice|act now|suspend/i, 25, "Uses urgent or threatening language"],
  [/verify your account|password|otp|login/i, 30, "Asks for account details"],
  [/bit\.ly|tinyurl|http:\/\//i, 20, "Contains a suspicious link"],
  [/refund|overpa(id|yment)|lottery|prize|inheritance/i, 25, "Mentions refund or prize bait"]
];
const label = s => (s < 35 ? "Safe" : s < 70 ? "Suspicious" : "Danger");

function ruleCheck(inv) {
  const text = `${inv.sender} ${inv.message}`;
  let score = 5; const reasons = [];
  for (const [re, pts, why] of RULES) if (re.test(text)) { score += pts; reasons.push(why); }
  if (inv.amount > 1000) { score += 10; reasons.push("Large amount"); }
  score = Math.min(score, 100);
  return { score, label: label(score), reasons: reasons.length ? reasons : ["No warning signs found"], advice: "Basic rule check.", source: "rules" };
}

async function aiCheck(inv) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = `You are a payment fraud analyst. Review this payment request and return ONLY JSON: {"score":0-100,"reasons":["max 4 short reasons"],"advice":"one short sentence for the payer"}. Higher score = more likely a scam.
Sender: ${inv.sender}
Amount (USD): ${inv.amount}
Message: ${inv.message}`;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
  });
  if (!r.ok) throw new Error("AI error " + r.status);
  const data = await r.json();
  const out = JSON.parse(data.candidates[0].content.parts[0].text);
  const score = Math.max(0, Math.min(100, Math.round(Number(out.score))));
  return { score, label: label(score), reasons: out.reasons || [], advice: out.advice || "", source: "gemini" };
}

async function check(inv) {
  if (process.env.GEMINI_API_KEY) { try { return await aiCheck(inv); } catch (e) { console.error(e.message); } }
  return ruleCheck(inv);
}
module.exports = { check };
