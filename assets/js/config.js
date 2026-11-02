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
  supabaseUrl: "",
  supabaseAnonKey: "",

  siteUrl: "https://suslessons.in",
  mediaBucket: "media",
};
