# AI Scam Shield

AI checks a payment request or invoice and gives a 0-100 risk score **before** you pay. Safe requests continue to PayPal checkout (sandbox); risky ones are blocked, and the server re-checks before any PayPal order is created.

**How it works:** paste invoice -> Gemini AI scores it (rule-based fallback if no key) -> if score < 70, PayPal Orders API creates and captures the order.

**Tools:** PayPal Orders API (sandbox), Google Gemini API, Vercel serverless functions.

## Run it
1. Get PayPal sandbox keys (developer.paypal.com > Apps & Credentials) and a Gemini key (aistudio.google.com/apikey).
2. Deploy on Vercel and set environment variables: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `GEMINI_API_KEY`.
3. Or locally: `npm i -g vercel`, create `.env` with the same variables, then `vercel dev`.
4. Test pay with a sandbox personal (buyer) account from developer.paypal.com > Testing Tools > Sandbox accounts.

License: MIT
