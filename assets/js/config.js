/*
  sus.lessons — সাইট কনফিগ
  ───────────────────────────────────────────────
  Supabase connect করতে নিচের দুটো ঘর ভরো:
  Supabase Dashboard → Project Settings → API
    • Project URL        → supabaseUrl
    • anon / public key  → supabaseAnonKey   (এটা public key, সাইটে রাখা নিরাপদ)
  ঘর দুটো ফাঁকা থাকলে সাইট seed.js-এর নমুনা লেখা দেখায়।
*/
export const CONFIG = {
  supabaseUrl: "https://lfvkfogsbdtrngjohlhl.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmdmtmb2dzYmR0cm5nam9obGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MjEzNTEsImV4cCI6MjEwOTE5NzM1MX0.o358ZkWgaQXNT-J5IH2awDOKjDjOnwMprGdBLzsSkAk",

  siteUrl: "https://suslessons.in",
  mediaBucket: "media",

  // চা খাওয়ান (cha.html) — Razorpay Dashboard → Account & Settings → API Keys → Key ID
  // শুধু Key ID (rzp_live_…) বসাও, Key Secret কখনো এখানে নয়। ফাঁকা থাকলে razorpayMe লিংক খোলে।
  razorpayKey: "rzp_live_TvdsfUyB9c5TdK",
  razorpayMe: "https://razorpay.me/@suslessons",
};
