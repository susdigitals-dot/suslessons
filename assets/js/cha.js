// চা খাওয়ান — শুধু ভারতের পাঠকদের জন্য (Razorpay পপআপ)। বাংলাদেশ বা অন্য দেশ থেকে এলে পাতাটা চা দেখায় না।
import { CONFIG } from "./config.js";
import { getSettings } from "./data.js";
import "./track.js";
import { $, bn, esc, inline, chrome, toast } from "./ui.js";
import { isIndia } from "./geo.js";

const settings = await getSettings();
chrome(settings);
const sp = settings.support || {};
const main = $("#cha");

// কাপ ভরাট: ০ – ১ (কত টাকায় কতটা চা)
const CUPS = [
  { amt: 20, name: "ভাঁড়ের চা", sub: "স্টেশনের ধারে, এক চুমুকে শেষ", fill: 0.45 },
  { amt: 50, name: "চা আর বিস্কুট", sub: "পরের গল্পটা লেখার সময় সঙ্গী", fill: 0.7, pick: true },
  { amt: 100, name: "আড্ডার চা", sub: "দু'কাপ চা, একটা লম্বা গল্প", fill: 0.95 },
];

if (!isIndia()) {
  main.innerHTML = `
    <section class="cha-off">
      <span class="eyebrow">sus.lessons</span>
      <h1>বইটা আপনার, একদম ফ্রি</h1>
      <p>এই পাতাটা আপনার দেশ থেকে খোলা যায় না। তাতে কিছু যায় আসে না — বই আর গল্প সবার জন্য।</p>
      <div class="cha-off-actions">
        <a class="btn btn-maroon" href="shop.html#kothin-kotha">দোকানে ফিরুন</a>
        <button class="btn btn-ghost" type="button" data-follow>ফলো করুন</button>
      </div>
    </section>`;
} else {
  render();
}

function render() {
  main.innerHTML = `
    <section class="cha">
      <div class="cha-art" aria-hidden="true">
        <div class="cha-steam"><i></i><i></i><i></i></div>
        <svg viewBox="0 0 200 180" class="cha-cup">
          <defs><clipPath id="cupIn"><path d="M38 52 h112 l-12 96 a14 14 0 0 1 -14 12 h-60 a14 14 0 0 1 -14 -12 z"/></clipPath></defs>
          <path d="M150 74 h10 a22 22 0 0 1 0 44 h-16" fill="none" stroke="#3e2228" stroke-width="9" stroke-linecap="round"/>
          <path d="M38 52 h112 l-12 96 a14 14 0 0 1 -14 12 h-60 a14 14 0 0 1 -14 -12 z" fill="#c9764a"/>
          <rect class="cha-tea" x="30" y="52" width="130" height="120" fill="#7a3f1f" clip-path="url(#cupIn)"/>
          <path d="M38 52 h112 l-12 96 a14 14 0 0 1 -14 12 h-60 a14 14 0 0 1 -14 -12 z" fill="none" stroke="#3e2228" stroke-width="5"/>
          <path d="M56 98 q38 14 76 0" fill="none" stroke="#d6a35c" stroke-width="3" opacity=".7"/>
          <ellipse cx="94" cy="166" rx="70" ry="7" fill="#3e2228" opacity=".12"/>
        </svg>
      </div>
      <div class="cha-body">
        <span class="eyebrow">চায়ের দোকান</span>
        <h1>${esc(sp.title || "দাদাকে এক কাপ চা খাওয়ান")}</h1>
        <p class="cha-lead">${inline("বই আর গল্প ==সবার জন্য ফ্রি।== ভালো লাগলে এক কাপ চা খাওয়াতে পারেন — পরের গল্পটা হয়তো একটু তাড়াতাড়ি আসবে।")}</p>
        <div class="cha-cups" role="radiogroup" aria-label="কোন চা">
          ${CUPS.map((c) => `
            <button type="button" class="cha-opt" role="radio" aria-checked="${!!c.pick}" data-amt="${c.amt}" data-fill="${c.fill}">
              <b>₹${bn(c.amt)}</b><span>${c.name}</span><small>${c.sub}</small>
            </button>`).join("")}
        </div>
        <form class="cha-own" id="ownForm"><span>নিজের মতো</span><span class="cha-rs">₹</span><input type="number" inputmode="numeric" min="1" max="10000" placeholder="যত খুশি" id="own" aria-label="নিজের মতো টাকা"><button class="btn-mini" type="submit" id="ownGo">খাওয়ান</button></form>
        <div class="cha-pay" id="pay" aria-live="polite"></div>
        <p class="cha-note">চা খাওয়ানো পুরোপুরি আপনার ইচ্ছে — না খাওয়ালেও বই, গল্প সব একই থাকবে। ❤️<br>এটা দান, কোনো কেনাকাটা নয়; তাই রিফান্ড হয় না।</p>
      </div>
    </section>`;

  const pay = $("#pay");
  const own = $("#own");
  const opts = [...main.querySelectorAll(".cha-opt")];
  const fillCup = (f) => main.style.setProperty("--fill", f);
  const pick = (o) => opts.forEach((x) => x.setAttribute("aria-checked", x === o));

  // কাপে চাপ দিলেই সেই টাকার পেমেন্ট পপআপ
  main.addEventListener("click", (e) => {
    const o = e.target.closest(".cha-opt");
    if (!o) return;
    pick(o);
    own.value = "";
    fillCup(o.dataset.fill);
    checkout(Number(o.dataset.amt));
  });

  own.addEventListener("input", () => {
    const n = Math.round(Number(own.value) || 0);
    if (n > 0) {
      pick(null);
      fillCup(Math.min(1, 0.3 + n / 150));
    }
  });

  $("#ownForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const n = Math.round(Number(own.value) || 0);
    if (n < 1 || n > 10000) {
      toast("₹১ থেকে ₹১০,০০০-এর মধ্যে লিখুন");
      own.focus();
      return;
    }
    checkout(n);
  });

  fillCup(CUPS.find((c) => c.pick).fill);

  function checkout(amt) {
    // Key ID না থাকলে Razorpay.me লিংক — সেখানে পাঠক নিজে অঙ্কটা লেখেন
    if (!CONFIG.razorpayKey || !window.Razorpay) {
      if (!CONFIG.razorpayMe) return toast("পেমেন্ট এখনো চালু হয়নি");
      toast(`Razorpay-তে ₹${bn(amt)} লিখে পেমেন্ট করুন`);
      window.open(CONFIG.razorpayMe, "_blank", "noopener");
      return;
    }
    const rzp = new window.Razorpay({
      key: CONFIG.razorpayKey,
      amount: amt * 100, // পয়সায়
      currency: "INR",
      name: "sus.lessons",
      description: amt >= 100 ? "আড্ডার চা" : amt >= 50 ? "চা আর বিস্কুট" : "এক কাপ চা",
      image: `${CONFIG.siteUrl}/assets/brand/avatar.jpg`,
      notes: { purpose: "cha", page: location.pathname },
      theme: { color: "#3e2228" },
      handler: (r) => thanks(amt, r.razorpay_payment_id),
    });
    rzp.on("payment.failed", () => toast("পেমেন্ট হলো না — আবার চেষ্টা করুন"));
    rzp.open();
  }

  function thanks(amt, id) {
    pay.innerHTML = `
      <div class="cha-thanks">
        <b>চা পেয়ে গেছি — ধন্যবাদ! ☕</b>
        <p>₹${bn(amt)}-এর চা পৌঁছেছে। পরের গল্পটা আপনার জন্য একটু তাড়াতাড়ি আসবে।</p>
        ${id ? `<small>পেমেন্ট আইডি: ${esc(id)}</small>` : ""}
      </div>`;
    toast("ধন্যবাদ! ❤️");
  }
}
