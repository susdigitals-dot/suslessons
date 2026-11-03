// চা খাওয়ান — শুধু ভারতের পাঠকদের জন্য (UPI)। বাংলাদেশ বা অন্য দেশ থেকে এলে পাতাটা চা দেখায় না।
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
  const upi = sp.upi || "";
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
        <label class="cha-own"><span>নিজের মতো</span><span class="cha-rs">₹</span><input type="number" inputmode="numeric" min="1" max="10000" placeholder="যত খুশি" id="own"></label>
        <div class="cha-pay" id="pay"></div>
        <p class="cha-note">চা খাওয়ানো পুরোপুরি আপনার ইচ্ছে — না খাওয়ালেও বই, গল্প সব একই থাকবে। ❤️<br>এটা দান, কোনো কেনাকাটা নয়; তাই রিফান্ড হয় না।</p>
      </div>
    </section>`;

  let amt = CUPS.find((c) => c.pick).amt;
  const pay = $("#pay");
  const own = $("#own");
  const opts = [...main.querySelectorAll(".cha-opt")];

  const fillCup = (f) => main.style.setProperty("--fill", f);

  function draw() {
    if (!upi) {
      pay.innerHTML = `<p class="cha-soon">UPI খুব শীঘ্রই চালু হচ্ছে। ততক্ষণ <a href="contact.html">একটা মেসেজ</a> পাঠালেও চলবে — সেটাই অনেক।</p>`;
      return;
    }
    const link = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(sp.upiName || "sus.lessons")}&am=${amt}&cu=INR&tn=${encodeURIComponent("এক কাপ চা")}`;
    let qr = "";
    if (window.qrcode) {
      const q = window.qrcode(0, "M");
      q.addData(link);
      q.make();
      qr = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    }
    pay.innerHTML = `
      <a class="btn btn-maroon cha-go" href="${esc(link)}">☕ ₹${bn(amt)}-এর চা খাওয়ান — UPI অ্যাপে খুলুন</a>
      <div class="cha-alt">
        ${qr ? `<div class="cha-qr" aria-label="UPI QR কোড">${qr}<small>ফোনের যেকোনো UPI অ্যাপে স্ক্যান করুন</small></div>` : ""}
        <div class="pay-row"><span>UPI</span><code>${esc(upi)}</code><button class="btn-mini" type="button" data-copy="${esc(upi)}">কপি</button></div>
      </div>`;
  }

  main.addEventListener("click", async (e) => {
    const o = e.target.closest(".cha-opt");
    if (o) {
      opts.forEach((x) => x.setAttribute("aria-checked", x === o));
      own.value = "";
      amt = Number(o.dataset.amt);
      fillCup(o.dataset.fill);
      draw();
    }
    const c = e.target.closest("[data-copy]");
    if (c) {
      try {
        await navigator.clipboard.writeText(c.dataset.copy);
        toast("কপি হয়েছে ✓");
      } catch {
        toast("কপি হলো না — হাতে লিখে নিন");
      }
    }
  });

  own.addEventListener("input", () => {
    const n = Math.min(10000, Math.max(0, Math.round(Number(own.value) || 0)));
    if (!n) return;
    opts.forEach((x) => x.setAttribute("aria-checked", "false"));
    amt = n;
    fillCup(Math.min(1, 0.3 + n / 150));
    draw();
  });

  fillCup(CUPS.find((c) => c.pick).fill);
  // QR লাইব্রেরি defer-এ আসে — এলে আবার আঁকো
  draw();
  if (!window.qrcode) window.addEventListener("load", draw, { once: true });
}
