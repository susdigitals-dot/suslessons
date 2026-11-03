// চা খাওয়ান — পেমেন্টের আগে Razorpay-তে order বানায় (cha.html থেকে ডাকা হয়)
// Secrets (Supabase → Edge Functions → Secrets): RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// Key Secret শুধু এখানে, সাইটের কোডে কখনো নয়।

const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

// শুধু নিজের সাইট (আর লোকাল টেস্ট) থেকে ডাকা যাবে
const allowed = (o: string) =>
  /^https:\/\/(www\.)?suslessons\.in$/.test(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const cors = {
    "Access-Control-Allow-Origin": allowed(origin) ? origin : "https://suslessons.in",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "POST only" }, 405);
  if (!allowed(origin)) return reply({ error: "origin not allowed" }, 403);
  if (!KEY_ID || !KEY_SECRET) return reply({ error: "Razorpay secrets not set" }, 500);

  const { amount } = await req.json().catch(() => ({}));
  const rupees = Math.round(Number(amount));
  if (!(rupees >= 1 && rupees <= 10000)) return reply({ error: "amount must be 1–10000" }, 400);

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${KEY_ID}:${KEY_SECRET}`),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: rupees * 100, // পয়সায়
      currency: "INR",
      receipt: `cha_${Date.now()}`,
      notes: { purpose: "cha" },
    }),
  });
  const order = await res.json();
  if (!res.ok) return reply({ error: order?.error?.description ?? "order failed" }, 502);
  return reply({ id: order.id, amount: order.amount });
});
