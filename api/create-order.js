const { check } = require("./_check");
const BASE = "https://api-m.sandbox.paypal.com";
async function token() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const r = await fetch(`${BASE}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  return (await r.json()).access_token;
}
module.exports = async (req, res) => {
  const b = req.body || {};
  const inv = { sender: String(b.sender || ""), amount: Number(b.amount) || 0, message: String(b.message || "") };
  if (!(inv.amount > 0 && inv.amount <= 10000)) return res.status(400).json({ error: "Enter an amount between 0 and 10000" });
  const result = await check(inv); // Scam Shield re-checks before any PayPal order is created
  if (result.score >= 70) return res.status(403).json({ blocked: true, result });
  const origin = `https://${req.headers.host}`;
  const r = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST", headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ description: `Payment to ${inv.sender}`.slice(0, 120), amount: { currency_code: "USD", value: inv.amount.toFixed(2) } }],
      payment_source: { paypal: { experience_context: { user_action: "PAY_NOW", return_url: origin, cancel_url: origin } } } })
  });
  const order = await r.json();
  const link = (order.links || []).find(l => l.rel === "payer-action" || l.rel === "approve");
  if (!link) return res.status(500).json({ error: "PayPal order failed", detail: order });
  res.status(200).json({ url: link.href, result });
};
