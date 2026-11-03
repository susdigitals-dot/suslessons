// ভিজিট আর লিংক ক্লিক গোনা + লাইভ ভিজিটর (admin → ড্যাশবোর্ড-এ দেখা যায়)
// কোনো IP বা ব্যক্তিগত তথ্য রাখা হয় না — শুধু পেজ, লিংক আর একটা র‍্যান্ডম সেশন আইডি।
import { CONFIG } from "./config.js?v=202611031842";
import { live, sb } from "./data.js?v=202611031842";

const store = (k, v) => {
  try {
    if (v !== undefined) localStorage.setItem(k, v);
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

// শুধু আসল সাইটে গোনো; admin নিজের ভিজিট গোনা হয় না (admin-এ লগইন করলে "sus-notrack" বসে)
// লোকালে টেস্ট করতে: localStorage.setItem("sus-track", "1")
const onSite = location.hostname === new URL(CONFIG.siteUrl).hostname || store("sus-track") === "1";
const enabled = live && onSite && store("sus-notrack") !== "1";

let sid = "";
try {
  sid = sessionStorage.getItem("sus-sid") || crypto.randomUUID().slice(0, 18);
  sessionStorage.setItem("sus-sid", sid);
} catch {
  sid = Math.random().toString(36).slice(2, 14);
}

// fbclid / utm_* এর মতো ট্র্যাকিং প্যারামিটার বাদ দাও, নইলে একই পেজ আলাদা আলাদা দেখায়
const qs = new URLSearchParams(location.search);
[...qs.keys()].forEach((k) => /^(fbclid|gclid|igshid|mibextid|utm_.*)$/i.test(k) && qs.delete(k));
const path = location.pathname.replace(/\/index\.html$/, "/") + (String(qs) ? "?" + qs : "");

function send(ev) {
  // keepalive: পেজ ছেড়ে চলে গেলেও রিকোয়েস্টটা যায়
  fetch(`${CONFIG.supabaseUrl}/rest/v1/events`, {
    method: "POST",
    keepalive: true,
    headers: {
      apikey: CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ path: path.slice(0, 300), sid, ...ev }),
  }).catch(() => {});
}

if (enabled) {
  let ref = "";
  try {
    const r = document.referrer && new URL(document.referrer);
    if (r && r.hostname !== location.hostname) ref = r.hostname;
  } catch {}
  send({ kind: "view", ref });

  document.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      // কার্ডের পুরো লেখা না নিয়ে শুধু শিরোনামটা নাও
      const title = a.querySelector(".bm-title, h1, h2, h3");
      const text = (a.getAttribute("aria-label") || title?.textContent || a.querySelector("img[alt]")?.alt || a.textContent || "")
        .replace(/\s+/g, " ").trim();
      const label = text || (a.hasAttribute("download") ? "⬇ ডাউনলোড" : a.href.split("/").pop());
      send({ kind: "click", label: label.slice(0, 200), href: a.href.slice(0, 600) });
    },
    true
  );

  // লাইভ: সাইট খোলা থাকলে Realtime Presence-এ জানিয়ে রাখো
  const ch = sb.channel("live", { config: { presence: { key: sid } } });
  ch.subscribe((status) => {
    if (status === "SUBSCRIBED") ch.track({ path, title: document.title, at: Date.now() });
  });
}
