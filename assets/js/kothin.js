// Free e-Books / PDFs — দাম ঠিক করার চাকা (চাকা সবসময় "Free"-তে থামে), ভাসমান বোতাম, বই বাছার তালিকা
import { $, bn, esc, wordmark } from "./ui.js?v=202611121349";
import { isIndia } from "./geo.js?v=202611121349";

// চাকা যে বইয়ের জন্য ঘোরে — free.js-এর প্রতিটা বই openWheel-এ নিজের {title, pdf, spun} দেয়
export const BOOK = {
  kind: "ebook",
  slug: "kothin-kotha",
  title: "কঠিন কথা বলার ৫০টা প্রশ্ন",
  subtitle: "রাগের মাথায় যে লাইনটা বেরিয়ে আসে, সেটা ==সম্পর্ক ভাঙে।== একটা শান্ত প্রশ্ন সেই কথাটাই বলে।",
  tag: "চুপ আর চিৎকারের মাঝের রাস্তা",
  pdf: "books/kothin-kotha-50-proshno.pdf",
  spun: "kk-spun",
};

// Facebook / Instagram-এর ভেতরের ব্রাউজারে PDF নামানো যায় না (?inapp দিয়ে পরীক্ষা করা যায়)
export const INAPP = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|Threads|; wv\)/i.test(navigator.userAgent) || /[?&]inapp\b/.test(location.search);

// চাকার ঘর — ঘড়ির কাঁটার দিকে, ওপর থেকে। ফ্রি দু'জায়গায়, পাশাপাশি নয়
const SLICES = [
  { label: "Free", free: true, fill: "#3e2228", ink: "#d6a35c" },
  { label: "₹৯", fill: "#fbf7ef", ink: "#3e2228" },
  { label: "₹১৫", fill: "#d6a35c", ink: "#3e2228" },
  { label: "Free", free: true, fill: "#3e2228", ink: "#d6a35c" },
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

// list: পাতার সব বই — ভাসমান বোতাম চাপলে আগে জিজ্ঞেস করে কোনটা নেবেন
export function initFeature(list = [BOOK]) {
  // সবসময় ভেসে থাকা বোতাম — দাম বা চাকার কথা নয়, শুধু বোঝা যাক একটা ই-বুক অপেক্ষা করছে
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "kk-fab";
  fab.innerHTML = `<span class="kk-fab-ico" aria-hidden="true">📖</span><span class="kk-fab-txt"><b>Free e-Book</b> নিন →</span>`;
  fab.addEventListener("click", () => (list.length > 1 ? pickBook(list) : openWheel(list[0])));
  document.body.appendChild(fab);

  // Instagram থেকে সোজা চাকায়: /free#spin (পুরোনো /shop#spin-ও এখানে আসে)
  if (location.hash === "#spin") openWheel(BOOK);
  // /free#slug — সোজা সেই বইয়ের চাকা
  const b = list.find((x) => "#" + x.slug === location.hash);
  if (b) openWheel(b);
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
    <svg viewBox="-4 -4 208 208" class="kk-wheel-svg" role="img" aria-label="দামের চাকা: Free, ৯ টাকা, ১৫ টাকা, Free, ২১ টাকা">
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
    <button class="close" data-close aria-label="Close">✕</button>
    ${wordmark()}
    <h2 id="kk-dlg-h">কোন e-Book-টা নেবেন?</h2>
    <div class="kk-picks">
      ${list.map((b, i) => `
        <button class="kk-pick" type="button" data-pick="${i}">
          ${b.cover_url ? `<img src="${esc(b.cover_url)}" alt="" width="56" height="70">` : `<span class="kk-pick-c">${bn(50)}</span>`}
          <span><b>${esc(b.title)}</b><small>${esc(b.tag || "PDF e-Book")}</small></span>
          <span aria-hidden="true">→</span>
        </button>`).join("")}
    </div>`;
  if (!dlg.open) dlg.showModal();
}

export function openWheel(b) {
  book = b;
  dialog().innerHTML = `
    <button class="close" data-close aria-label="Close">✕</button>
    ${wordmark()}
    <h2 id="kk-dlg-h">দাম ঠিক করবে চাকা</h2>
    <p>${esc(book.title)} — একবার Spin করুন, যেখানে থামবে সেই দামে বই।</p>
    <div class="kk-wheel">
      <span class="kk-pin" aria-hidden="true"></span>
      ${wheelSvg()}
    </div>
    <div class="kk-out" aria-live="polite">
      <button class="btn btn-maroon kk-go" type="button" data-go>Spin করুন 🎡</button>
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
  go.textContent = "Spinning…";
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
      <span class="kk-stamp">FREE!</span>
      <p><b>${again ? "আপনার চাকা Free-তেই থেমেছিলো।" : "চাকা থামলো Free-তে!"}</b><br>বইটা আপনার — একটা টাকাও লাগবে না।</p>
      ${INAPP ? inappHtml() : `<a class="btn btn-gold" href="${book.pdf}" download>⬇ Download PDF</a>`}
      ${isIndia() ? `<a class="kk-cha" href="cha.html"><span>☕</span><span><b>বইটা কাজে লাগলে, ভাইকে এক কাপ চা?</b><small>পুরোপুরি আপনার ইচ্ছে</small></span><span>→</span></a>` : ""}
    </div>
    ${again ? "" : confetti()}`;
  // চাকা ছোট হয়ে সরে যায়, যাতে Free থেকে চা অবধি পুরোটা একসাথে দেখা যায়
  const wheel = dlg.querySelector(".kk-wheel");
  wheel.classList.add("done");
  const last = out.querySelector(".kk-cha") || out.querySelector(".kk-win");
  const show = () => last.scrollIntoView({ block: "end", behavior: again ? "auto" : "smooth" });
  setTimeout(show, again ? 0 : 650);
}

// FB/Insta-র ভেতরে PDF নামে না — লিংকটা WhatsApp-এ নিজেকে পাঠিয়ে সেখান থেকে নামানো
function inappHtml() {
  const url = new URL(book.pdf, location.href).href;
  const wa = `https://wa.me/?text=${encodeURIComponent(`📖 আমার Free e-Book: ${book.title}\n` + url)}`;
  // আগে একটা ছোট পপআপ বুঝিয়ে দেয় কেন WhatsApp — "বুঝলাম" চাপলেই WhatsApp খোলে
  return `
    <button class="btn btn-gold kk-wa" type="button" data-wa><img src="assets/img/whatsapp.png" alt="" width="26" height="26">PDF DOWNLOAD</button>
    <div class="kk-wapop" role="alertdialog" aria-labelledby="kk-wapop-h" hidden>
      <div class="kk-wapop-card">
        <img src="assets/img/whatsapp.png" alt="" width="56" height="56">
        <p id="kk-wapop-h"><b>Instagram বা Facebook থেকে সরাসরি PDF download হয় না।</b><br>তাই WhatsApp-এ নিজেকে পাঠিয়ে নিন, তারপর সেখান থেকে download করে নিন।</p>
        <a class="btn btn-maroon" href="${wa}" target="_blank" rel="noopener" data-ok>OK, বুঝেছি</a>
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
