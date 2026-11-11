const BASE = "https://api-m.sandbox.paypal.com";
module.exports = async (req, res) => {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const t = await (await fetch(`${BASE}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" })).json();
  const id = encodeURIComponent(String((req.body || {}).orderId || ""));
  const r = await fetch(`${BASE}/v2/checkout/orders/${id}/capture`, { method: "POST", headers: { Authorization: `Bearer ${t.access_token}`, "Content-Type": "application/json" }, body: "{}" });
  const d = await r.json();
  const cap = d.purchase_units && d.purchase_units[0].payments.captures[0];
  res.status(r.ok ? 200 : 500).json({ status: d.status, id: d.id, amount: cap && cap.amount.value, currency: cap && cap.amount.currency_code });
};
