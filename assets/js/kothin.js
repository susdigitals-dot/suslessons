// দোকানের ফিচার বই — "কঠিন কথা বলার ৫০টা প্রশ্ন"
// বইয়ের মলাট, উল্টানো যায় এমন প্রশ্ন-কার্ড, আর দাম ঠিক করার চাকা (চাকা সবসময় "ফ্রি"-তে থামে)
import { $, bn, esc, inline, wordmark } from "./ui.js?v=202611031900";
import { isIndia } from "./geo.js?v=202611031900";

// চাকা যে বইয়ের জন্য ঘোরে — দোকানের অন্য বইও openWheel-এ নিজের {title, pdf, spun} দেয়
const BOOK = { title: "কঠিন কথা বলার ৫০টা প্রশ্ন", tag: "চুপ আর চিৎকারের মাঝের রাস্তা", pdf: "books/kothin-kotha-50-proshno.pdf", spun: "kk-spun" };

// Facebook / Instagram-এর ভেতরের ব্রাউজারে PDF নামানো যায় না (?inapp দিয়ে পরীক্ষা করা যায়)
export const INAPP = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|Threads|; wv\)/i.test(navigator.userAgent) || /[?&]inapp\b/.test(location.search);

// গাইডের প্রতিটা অধ্যায়ের প্রথম পরিস্থিতি — ওরা কী বলে, আমরা কী বলি না, কী জিজ্ঞেস করি
const CARDS = [
  { ch: "বিয়ের কথাবার্তা", n: 15, who: "ছেলের মা", they: "আমরা কিছু চাই না। তবে মেয়েকে নিশ্চয়ই খালি হাতে পাঠাবেন না।", dont: "বুঝেছি, আপনারা দাম চাইছেন।", ask: "খালি হাতে না পাঠানো বলতে আপনারা ঠিক কী বোঝাচ্ছেন?" },
  { ch: "আত্মীয়দের চাপ", n: 13, who: "মাসি", they: "বিয়েটা কবে করছিস? বয়স তো আর বসে থাকবে না।", dont: "তোমার বিয়েটা কি খুব সুখের হয়েছে?", ask: "তোমার সময়ে বিয়ের সিদ্ধান্তটা কীভাবে নিয়েছিলে, মাসি?" },
  { ch: "অফিসে ছুটি-বেতন", n: 12, who: "ম্যানেজার", they: "এখন তো রিলিজ চলছে। এখন ছুটি?", dont: "ছুটি না দিলে রিজাইন করবো।", ask: "আমার কাজগুলো কীভাবে সামলে দিয়ে গেলে ছুটিটা সম্ভব হবে?" },
  { ch: "ধারের টাকা", n: 10, who: "শুভ", they: "দেবো রে দেবো। পালিয়ে যাচ্ছি নাকি?", dont: "তুই কোনোদিনই ফেরত দিবি না, জানি।", ask: "কোন মাস থেকে শুরু করলে তোর সুবিধা হয়?" },
];

// চাকার ঘর — ঘড়ির কাঁটার দিকে, ওপর থেকে। ফ্রি দু'জায়গায়, পাশাপাশি নয়
const SLICES = [
  { label: "ফ্রি", free: true, fill: "#3e2228", ink: "#d6a35c" },
  { label: "₹৯", fill: "#fbf7ef", ink: "#3e2228" },
  { label: "₹১৫", fill: "#d6a35c", ink: "#3e2228" },
  { label: "ফ্রি", free: true, fill: "#3e2228", ink: "#d6a35c" },
  { label: "₹২১", fill: "#d05a23", ink: "#fbf7ef" },
];
const STEP = 360 / SLICES.length;

const store = (k, v) => {
  try {
    if (v !== undefined) localStorage.setItem(k, v);
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

export function featureHtml() {
  return `
    <section class="kk" id="kothin-kotha" aria-labelledby="kk-title">
      <div class="kk-top">
        <div class="kk-art">
        <div class="kk-book" aria-hidden="true">
          <div class="kk-cover">
            <span class="kk-c-mark">— sus.lessons —</span>
            <span class="kk-c-num">${bn(50)}</span>
            <span class="kk-c-title">কঠিন কথা বলার<br>৫০টা প্রশ্ন</span>
            <span class="kk-c-rule"></span>
            <span class="kk-c-sub">চুপ আর চিৎকারের<br>মাঝের রাস্তা</span>
            <span class="kk-q kk-q1">?</span><span class="kk-q kk-q2">?</span>
          </div>
          <div class="kk-pages"></div>
        </div>
        <div class="kk-btns">
          <button class="btn btn-maroon kk-dl" type="button" data-wheel>⬇ DOWNLOAD NOW</button>
          <button class="btn btn-ghost" type="button" data-wheel>📖 ই-বুক নামান</button>
        </div>
        </div>
        <div class="kk-copy">
          <span class="eyebrow">নতুন গাইড · PDF</span>
          <h2 id="kk-title">কঠিন কথা বলার ৫০টা প্রশ্ন</h2>
          <p class="kk-hook">${inline("রাগের মাথায় যে লাইনটা বেরিয়ে আসে, সেটা ==সম্পর্ক ভাঙে।== একটা শান্ত প্রশ্ন সেই কথাটাই বলে — আর উল্টো দিকের মানুষটাকে ভাবতে বাধ্য করে।")}</p>
          <ul class="kk-stats">
            <li><b>${bn(50)}</b><span>প্রশ্ন</span></li>
            <li><b>${bn(4)}</b><span>পরিস্থিতি</span></li>
            <li><b>${bn(138)}</b><span>পাতা</span></li>
            <li><b>📱</b><span>মোবাইলে পড়ার মতো</span></li>
          </ul>
        </div>
      </div>
      <div class="kk-deck">
        <p class="kk-deck-h"><b>রাগের লাইন → প্রশ্ন।</b> কার্ডে চাপ দিন, দেখুন চিৎকারের বদলে কী জিজ্ঞেস করবেন।</p>
        <div class="kk-cards">
          ${CARDS.map((c, i) => `
            <button class="kk-card" type="button" aria-pressed="false" style="--i:${i}">
              <span class="kk-face kk-front">
                <span class="kk-ch">${esc(c.ch)} · ${bn(c.n)}টা প্রশ্ন</span>
                <span class="kk-who">${esc(c.who)} বললেন—</span>
                <span class="kk-they">“${esc(c.they)}”</span>
                <span class="kk-flip">উল্টে দেখুন ↻</span>
              </span>
              <span class="kk-face kk-back">
                <span class="kk-lbl">যেটা বলবেন না</span>
                <s class="kk-dont">${esc(c.dont)}</s>
                <span class="kk-lbl kk-lbl-ask">যেটা জিজ্ঞেস করবেন</span>
                <span class="kk-ask">${esc(c.ask)}</span>
              </span>
            </button>`).join("")}
        </div>
      </div>
    </section>`;
}

// more: দোকানের বাকি বই — ভাসমান বোতাম চাপলে আগে জিজ্ঞেস করে কোনটা নেবেন
export function initFeature(more = []) {
  const root = $("#kothin-kotha");
  if (!root) return;
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-wheel]")) openWheel(BOOK);
    const card = e.target.closest(".kk-card");
    if (card) {
      const on = card.classList.toggle("on");
      card.setAttribute("aria-pressed", on);
    }
  });

  // সবসময় ভেসে থাকা বোতাম — দাম বা চাকার কথা নয়, শুধু বোঝা যাক একটা ই-বুক অপেক্ষা করছে
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "kk-fab";
  fab.innerHTML = `<span class="kk-fab-ico" aria-hidden="true">📖</span><span class="kk-fab-txt">আপনার <b>ই-বুক</b> নিন →</span>`;
  fab.addEventListener("click", () => (more.length ? pickBook([BOOK, ...more]) : openWheel(BOOK)));
  document.body.appendChild(fab);

  // ইনস্টাগ্রাম থেকে সোজা চাকায়: /shop#spin
  if (location.hash === "#spin") openWheel(BOOK);
}

// ── চাকা ───────────────────────────
function point(deg, r) {
  const a = (deg * Math.PI) / 180;
  return [100 + r * Math.sin(a), 100 - r * Math.cos(a)].map((n) => n.toFixed(2));
}

function wheelSvg() {
  const slices = SLICES.map((s, i) => {
    const [x1, y1] = point(i * STEP, 96);
    const [x2, y2] = point((i + 1) * STEP, 96);
    const mid = i * STEP + STEP / 2;
    const [tx, ty] = point(mid, 64);
    return `
      <path d="M100 100 L${x1} ${y1} A96 96 0 0 1 ${x2} ${y2} Z" fill="${s.fill}" stroke="#ece4d6" stroke-width="2"/>
      <text x="${tx}" y="${ty}" transform="rotate(${mid} ${tx} ${ty})" fill="${s.ink}" text-anchor="middle" dominant-baseline="central" class="kk-w-txt${s.free ? " free" : ""}">${s.label}</text>`;
  }).join("");
  const dots = Array.from({ length: SLICES.length * 3 }, (_, i) => {
    const [x, y] = point(i * (STEP / 3), 99);
    return `<circle cx="${x}" cy="${y}" r="1.6" fill="#d6a35c"/>`;
  }).join("");
  return `
    <svg viewBox="-4 -4 208 208" class="kk-wheel-svg" role="img" aria-label="দামের চাকা: ফ্রি, ৯ টাকা, ১৫ টাকা, ফ্রি, ২১ টাকা">
      <circle cx="100" cy="100" r="102" fill="#3e2228"/>
      <g class="kk-rotor">${slices}${dots}</g>
      <circle cx="100" cy="100" r="17" fill="#ece4d6" stroke="#3e2228" stroke-width="3"/>
      <text x="100" y="100" text-anchor="middle" dominant-baseline="central" class="kk-w-hub">?</text>
    </svg>`;
}

let dlg, book, turned = 0;

function dialog() {
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.className = "support kk-dlg";
    dlg.setAttribute("aria-labelledby", "kk-dlg-h");
    document.body.appendChild(dlg);
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
      if (e.target.closest("[data-go]")) spin();
      if (e.target.closest("[data-wa]")) dlg.querySelector(".kk-wapop").hidden = false;
      if (e.target.closest("[data-ok]")) dlg.querySelector(".kk-wapop").hidden = true;
      const pick = e.target.closest("[data-pick]");
      if (pick) openWheel(picks[pick.dataset.pick]);
    });
  }
  return dlg;
}

// কোন বইটা? — প্রতিটা বই মলাট আর নাম সহ, চাপলেই সেই বইয়ের চাকা
let picks = [];
function pickBook(list) {
  picks = list;
  dialog().innerHTML = `
    <button class="close" data-close aria-label="বন্ধ করুন">✕</button>
    ${wordmark()}
    <h2 id="kk-dlg-h">কোন বইটা নেবেন?</h2>
    <div class="kk-picks">
      ${list.map((b, i) => `
        <button class="kk-pick" type="button" data-pick="${i}">
          ${b.cover_url ? `<img src="${esc(b.cover_url)}" alt="" width="56" height="70">` : `<span class="kk-pick-c">${bn(50)}</span>`}
          <span><b>${esc(b.title)}</b><small>${esc(b.tag || "PDF ই-বুক")}</small></span>
          <span aria-hidden="true">→</span>
        </button>`).join("")}
    </div>`;
  if (!dlg.open) dlg.showModal();
}

export function openWheel(b) {
  book = b;
  dialog().innerHTML = `
    <button class="close" data-close aria-label="বন্ধ করুন">✕</button>
    ${wordmark()}
    <h2 id="kk-dlg-h">দাম ঠিক করবে চাকা</h2>
    <p>${esc(book.title)} — একবার ঘোরান, যেখানে থামবে সেই দামে বই।</p>
    <div class="kk-wheel">
      <span class="kk-pin" aria-hidden="true"></span>
      ${wheelSvg()}
    </div>
    <div class="kk-out" aria-live="polite">
      <button class="btn btn-maroon kk-go" type="button" data-go>চাকা ঘোরান 🎡</button>
    </div>`;
  if (!dlg.open) dlg.showModal();
  turned = 0;
  // আগে একবার ঘুরিয়েছেন — চাকা ফ্রি-তে দাঁড়িয়ে, সোজা ফলাফল
  if (store(book.spun)) {
    rotate(0, false);
    result(true);
  }
}

// ফ্রি ঘরের কোনো এক জায়গায় থামাও — কখনো কখনো ধার ঘেঁষে, যাতে "প্রায় ₹২১!" মনে হয়
function landing() {
  const free = SLICES.map((s, i) => (s.free ? i : -1)).filter((i) => i >= 0);
  const i = free[Math.floor(Math.random() * free.length)];
  const wobble = (Math.random() * 2 - 1) * (STEP / 2 - 5);
  return i * STEP + STEP / 2 + wobble;
}

function rotate(at, animate = true) {
  const rotor = dlg.querySelector(".kk-rotor");
  const base = Math.ceil(turned / 360) * 360;
  turned = base + (animate ? 360 * 6 : 0) + (360 - at);
  rotor.style.transition = animate ? "transform 5.2s cubic-bezier(.12,.72,.08,1)" : "none";
  rotor.style.transform = `rotate(${turned}deg)`;
}

function spin() {
  const go = dlg.querySelector(".kk-go");
  go.disabled = true;
  go.textContent = "ঘুরছে…";
  dlg.querySelector(".kk-wheel").classList.add("spinning");
  const from = turned;
  rotate(landing());
  sfx.spin(turned - from);
  setTimeout(() => {
    dlg.querySelector(".kk-wheel").classList.remove("spinning");
    store(book.spun, "1");
    sfx.win();
    result(false);
  }, 5300);
}

function result(again) {
  const out = dlg.querySelector(".kk-out");
  out.innerHTML = `
    <div class="kk-win${again ? "" : " pop"}">
      <span class="kk-stamp">ফ্রি!</span>
      <p><b>${again ? "আপনার চাকা ফ্রি-তেই থেমেছিলো।" : "চাকা থামলো ফ্রি-তে!"}</b><br>বইটা আপনার — একটা টাকাও লাগবে না।</p>
      ${INAPP ? inappHtml() : `<a class="btn btn-gold" href="${book.pdf}" download>⬇ বইটা নামিয়ে নিন (PDF)</a>`}
      ${isIndia() ? `<a class="kk-cha" href="cha.html"><span>☕</span><span><b>বইটা কাজে লাগলে, ভাইকে এক কাপ চা?</b><small>পুরোপুরি আপনার ইচ্ছে</small></span><span>→</span></a>` : ""}
    </div>
    ${again ? "" : confetti()}`;
  // চাকা ছোট হয়ে সরে যায়, যাতে ফ্রি থেকে চা অবধি পুরোটা একসাথে দেখা যায়
  const wheel = dlg.querySelector(".kk-wheel");
  wheel.classList.add("done");
  const last = out.querySelector(".kk-cha") || out.querySelector(".kk-win");
  const show = () => last.scrollIntoView({ block: "end", behavior: again ? "auto" : "smooth" });
  setTimeout(show, again ? 0 : 650);
}

// FB/Insta-র ভেতরে PDF নামে না — লিংকটা WhatsApp-এ নিজেকে পাঠিয়ে সেখান থেকে নামানো
function inappHtml() {
  const url = new URL(book.pdf, location.href).href;
  const wa = `https://wa.me/?text=${encodeURIComponent(`📖 আমার ই-বুক: ${book.title}\n` + url)}`;
  // আগে একটা ছোট পপআপ বুঝিয়ে দেয় কেন WhatsApp — "বুঝলাম" চাপলেই WhatsApp খোলে
  return `
    <button class="btn btn-gold kk-wa" type="button" data-wa><img src="assets/img/whatsapp.png" alt="" width="26" height="26">PDF DOWNLOAD</button>
    <div class="kk-wapop" role="alertdialog" aria-labelledby="kk-wapop-h" hidden>
      <div class="kk-wapop-card">
        <img src="assets/img/whatsapp.png" alt="" width="56" height="56">
        <p id="kk-wapop-h"><b>Instagram বা Facebook থেকে সরাসরি PDF ডাউনলোড হয় না।</b><br>তাই WhatsApp-এ নিজেকে পাঠিয়ে নিন, তারপর সেখান থেকে ডাউনলোড করে নিন।</p>
        <a class="btn btn-maroon" href="${wa}" target="_blank" rel="noopener" data-ok>বুঝলাম</a>
      </div>
    </div>`;
}

function confetti() {
  const colors = ["#d6a35c", "#d05a23", "#3e2228", "#24575a", "#fbf7ef"];
  return `<div class="kk-confetti" aria-hidden="true">${Array.from({ length: 26 }, (_, i) =>
    `<i style="--x:${Math.round(Math.random() * 100)}%;--d:${(Math.random() * 0.5).toFixed(2)}s;--r:${Math.round(Math.random() * 720 - 360)}deg;background:${colors[i % colors.length]}"></i>`).join("")}</div>`;
}

// ── চাকার আওয়াজ ───────────────────────────
// কোনো ফাইল নয়, Web Audio দিয়ে বানানো: প্রতিটা পিন কাঁটা পেরোলে "টিক", থামলে ছোট্ট "টিং-টিং"
const sfx = (() => {
  let ac;
  const ctx = () => {
    try {
      ac ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
    } catch {}
    return ac;
  };
  const tone = (freq, at, len, vol, type = "sine") => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g).connect(ac.destination);
    o.start(at);
    o.stop(at + len + 0.02);
  };
  // চাকার CSS-এর একই কার্ভ (cubic-bezier(.12,.72,.08,1), ৫.২ সেকেন্ড) থেকে আগেভাগে হিসেব করা:
  // চাকার গায়ে প্রতি ২৪° একটা পিন, প্রতিটা পিন কাঁটা পেরোনোর মুহূর্তে একটা টিক। চাকা যত ধীর, টিক তত ফাঁকা ফাঁকা
  function spin(deg) {
    if (!ctx()) return;
    const bez = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
    const start = ac.currentTime + 0.03;
    let gone = 0, prev = -1;
    for (let i = 1; i <= 2000; i++) {
      const t = i / 2000;
      const pins = Math.floor((bez(t, 0.72, 1) * deg) / 24);
      const at = start + bez(t, 0.12, 0.08) * 5.2;
      // একদম জোরে ঘোরার সময় টিকগুলো গায়ে গায়ে লেগে যায় — অন্তত ২৫ মিলিসেকেন্ড ফাঁক রাখো
      if (pins > gone && at - prev > 0.025) {
        tone(1500 + Math.random() * 300, at, 0.035, 0.12, "triangle");
        prev = at;
      }
      gone = Math.max(gone, pins);
    }
  }

  function win() {
    if (!ctx()) return;
    const t = ac.currentTime;
    tone(880, t, 0.25, 0.18);
    tone(1320, t + 0.12, 0.45, 0.16);
  }

  return { spin, win };
})();
