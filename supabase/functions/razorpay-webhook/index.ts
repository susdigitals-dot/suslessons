// Razorpay webhook — পেমেন্ট captured হলে donations টেবিলে লিখে রাখে (admin → চা-এ দেখা যায়)
// Razorpay Dashboard → Webhooks → URL: https://<project>.supabase.co/functions/v1/razorpay-webhook
//   Events: payment.captured, payment.failed
// Secret (Supabase → Edge Functions → Secrets): RAZORPAY_WEBHOOK_SECRET — Razorpay-তে webhook বানানোর সময় যেটা দিয়েছ
// এই function-এ "Verify JWT" বন্ধ রাখতে হবে — Razorpay লগইন টোকেন পাঠায় না, তার বদলে signature মেলানো হয়।

const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// সময় ফাঁস না করে তুলনা
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  if (!WEBHOOK_SECRET) return new Response("webhook secret not set", { status: 500 });

  // signature মেলাতে হুবহু raw body লাগে — আগে JSON parse নয়
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!same(await hmacHex(WEBHOOK_SECRET, raw), sig)) return new Response("bad signature", { status: 401 });

  const ev = JSON.parse(raw);
  const p = ev?.payload?.payment?.entity;
  if (!p || !["payment.captured", "payment.failed"].includes(ev.event)) return new Response("ignored");

  // একই পেমেন্টের খবর দু'বার এলেও একটাই সারি (payment_id unique)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/donations?on_conflict=payment_id`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      payment_id: p.id,
      order_id: p.order_id ?? "",
      amount: Math.round(Number(p.amount) / 100),
      status: p.status ?? (ev.event === "payment.captured" ? "captured" : "failed"),
      method: p.method ?? "",
      email: p.email ?? "",
      contact: p.contact ?? "",
      purpose: p.notes?.purpose ?? "",
      items: String(p.notes?.items ?? "").slice(0, 250),
    }),
  });
  if (!res.ok) return new Response("db error: " + (await res.text()), { status: 500 });
  return new Response("ok");
});
