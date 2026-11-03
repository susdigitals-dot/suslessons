// চা খাওয়ান — শুধু ভারতের পাঠকদের জন্য (Razorpay পপআপ, order আসে supabase/functions/cha-order থেকে)। বাংলাদেশ বা অন্য দেশ থেকে এলে পাতাটা চা দেখায় না।
// চায়ের দোকানের মেনু: প্রতিটা জিনিসের দাম বাঁধা, শুধু সংখ্যা বাড়ানো-কমানো যায়, একসাথে কয়েকটা নেওয়া যায়
import { CONFIG } from "./config.js?v=202611031731";
import { getSettings, sendMessage } from "./data.js?v=202611031731";
import "./track.js?v=202611031731";
import { $, bn, esc, inline, chrome, toast } from "./ui.js?v=202611031731";
import { isIndia } from "./geo.js?v=202611031731";

const settings = await getSettings();
chrome(settings);
const sp = settings.support || {};
const main = $("#cha");

const MENU = [
  { id: "cha", name: "ভাঁড়ের চা", price: 5, img: "assets/img/cha/cha.webp", sub: "মাটির ভাঁড়ে, গরম গরম" },
  { id: "bapuji", name: "বাপুজি কেক", price: 8, img: "assets/img/cha/bapuji.webp", sub: "চায়ের সাথে সেই পুরোনো সঙ্গী" },
  { id: "soan", name: "সন পাপড়ি", price: 5, img: "assets/img/cha/soan-papdi.webp", sub: "মুখে দিলেই গলে যায়", fav: true },
];
const MAX = 20; // একটা জিনিস সর্বোচ্চ কতগুলো

if (!isIndia()) {
  main.innerHTML = `
    <section class="cha-off">
      <span class="eyebrow">sus.lessons</span>
      <h1>বইটা আপনার, একদম ফ্রি</h1>
      <p>এই পাতাটা আপনার দেশ থেকে খোলা যায় না। তাতে কিছু যায় আসে না — বই আর গল্প সবার জন্য।</p>
      <div class="cha-off-actions">
        <a class="btn btn-maroon" href="/shop#kothin-kotha">দোকানে ফিরুন</a>
        <button class="btn btn-ghost" type="button" data-follow>ফলো করুন</button>
      </div>
    </section>`;
} else {
  render();
}

function render() {
  const qty = { cha: 1, bapuji: 0, soan: 0 };

  main.innerHTML = `
    <section class="cha">
      <div class="cha-head">
        <span class="eyebrow">চায়ের দোকান</span>
        <h1>${esc(sp.title || "দাদাকে এক কাপ চা খাওয়ান")}</h1>
        <p class="cha-lead">${inline("বই আর গল্প ==সবার জন্য ফ্রি।== ভালো লাগলে দোকান থেকে কিছু একটা খাওয়ান — পরের গল্পটা হয়তো একটু তাড়াতাড়ি আসবে।")}</p>
      </div>
      <div class="cha-menu">
        ${MENU.map((m) => `
          <article class="cha-item" data-id="${m.id}">
            <div class="cha-pic">
              <img src="${m.img}" alt="${esc(m.name)}" width="480" height="480" loading="lazy">
              ${m.fav ? `<span class="cha-fav">❤ দাদার প্রিয়</span>` : ""}
            </div>
            <div class="cha-info">
              <h2>${esc(m.name)}</h2>
              <p>${esc(m.sub)}</p>
              <div class="cha-row">
                <b class="cha-price">₹${bn(m.price)}</b>
                <div class="cha-step" role="group" aria-label="${esc(m.name)} কতগুলো">
                  <button type="button" data-step="-1" aria-label="একটা কমান">−</button>
                  <output aria-live="polite">${bn(qty[m.id])}</output>
                  <button type="button" data-step="1" aria-label="একটা বাড়ান">+</button>
                </div>
              </div>
            </div>
          </article>`).join("")}
      </div>
      <div class="cha-msg">
        <label for="chaNote"><b>চায়ের সাথে দু'কথা</b> <small>ইচ্ছে হলে লিখুন</small></label>
        <textarea id="chaNote" rows="3" maxlength="500" placeholder="মনের কথা, আমাদের গল্প কেমন লাগে, বা নিজের সম্পর্কে একটু… শুধু দাদা পড়বে।"></textarea>
        <input id="chaName" maxlength="60" autocomplete="name" placeholder="আপনার নাম (না দিলেও চলবে)">
      </div>
      <div class="cha-bar">
        <div class="cha-sum"><small id="sumItems"></small><b id="sumTotal"></b></div>
        <button class="btn btn-maroon" type="button" id="payGo">খাওয়ান ☕</button>
      </div>
      <div class="cha-pay" id="pay" aria-live="polite"></div>
      <p class="cha-note">খাওয়ানো পুরোপুরি আপনার ইচ্ছে — না খাওয়ালেও বই, গল্প সব একই থাকবে। ❤️<br>এটা দান, কোনো কেনাকাটা নয়; তাই রিফান্ড হয় না।</p>
    </section>`;

  const pay = $("#pay");
  const total = () => MENU.reduce((n, m) => n + m.price * qty[m.id], 0);
  // "২টা ভাঁড়ের চা · ১টা সন পাপড়ি"
  const summary = () => MENU.filter((m) => qty[m.id]).map((m) => `${bn(qty[m.id])}টা ${m.name}`).join(" · ");

  function draw() {
    MENU.forEach((m) => {
      const el = main.querySelector(`.cha-item[data-id="${m.id}"]`);
      el.classList.toggle("on", qty[m.id] > 0);
      el.querySelector("output").textContent = bn(qty[m.id]);
      el.querySelector('[data-step="-1"]').disabled = !qty[m.id];
      el.querySelector('[data-step="1"]').disabled = qty[m.id] >= MAX;
    });
    const t = total();
    $("#sumItems").textContent = summary() || "কিছু বাছুন";
    $("#sumTotal").textContent = `মোট ₹${bn(t)}`;
    $("#payGo").disabled = !t;
  }

  main.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (b) {
      const id = b.closest(".cha-item").dataset.id;
      qty[id] = Math.min(MAX, Math.max(0, qty[id] + Number(b.dataset.step)));
      draw();
    }
    if (e.target.closest("#payGo")) checkout();
  });

  draw();

  // Supabase-এর cha-order function থেকে Razorpay order — না পেলে order ছাড়াই পপআপ খোলে
  async function makeOrder(amt) {
    try {
      const res = await fetch(`${CONFIG.supabaseUrl}/functions/v1/cha-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: CONFIG.supabaseAnonKey, Authorization: `Bearer ${CONFIG.supabaseAnonKey}` },
        body: JSON.stringify({ amount: amt }),
      });
      const o = await res.json();
      return res.ok && o.id ? o.id : "";
    } catch {
      return "";
    }
  }

  let busy = false;
  async function checkout() {
    const amt = total();
    if (!amt) return;
    // Key ID না থাকলে Razorpay.me লিংক — সেখানে পাঠক নিজে অঙ্কটা লেখেন
    if (!CONFIG.razorpayKey || !window.Razorpay) {
      if (!CONFIG.razorpayMe) return toast("পেমেন্ট এখনো চালু হয়নি");
      toast(`Razorpay-তে ₹${bn(amt)} লিখে পেমেন্ট করুন`);
      window.open(CONFIG.razorpayMe, "_blank", "noopener");
      return;
    }
    if (busy) return;
    busy = true;
    toast("পেমেন্ট খুলছে…");
    const orderId = await makeOrder(amt);
    busy = false;
    const items = summary();
    const note = $("#chaNote").value.trim();
    const name = $("#chaName").value.trim();
    const rzp = new window.Razorpay({
      key: CONFIG.razorpayKey,
      ...(orderId ? { order_id: orderId } : {}),
      amount: amt * 100, // পয়সায়
      currency: "INR",
      name: "sus.lessons",
      description: items.slice(0, 250),
      image: `${CONFIG.siteUrl}/assets/brand/avatar.jpg`,
      notes: { purpose: "cha", items: items.slice(0, 250), ...(name ? { name } : {}), ...(note ? { message: note.slice(0, 250) } : {}) },
      ...(name ? { prefill: { name } } : {}),
      theme: { color: "#3e2228" },
      handler: (r) => {
        thanks(amt, items, r.razorpay_payment_id, name);
        // লেখা থাকলে admin → মেসেজ-এ পৌঁছায়, পেমেন্ট আইডি সহ
        if (note) sendMessage({ name: name || "নাম না জানানো পাঠক", contact: r.razorpay_payment_id || "razorpay", topic: "☕ চায়ের সাথে", body: `${note}\n\n— ${items} (₹${amt})` });
      },
    });
    rzp.on("payment.failed", () => toast("পেমেন্ট হলো না — আবার চেষ্টা করুন"));
    rzp.open();
  }

  function thanks(amt, items, id, name) {
    $(".cha-msg").hidden = true;
    pay.innerHTML = `
      <div class="cha-thanks">
        <b>পেয়ে গেছি — ধন্যবাদ${name ? `, ${esc(name)}` : ""}! ☕</b>
        <p>${esc(items)} (₹${bn(amt)}) পৌঁছেছে। পরের গল্পটা আপনার জন্য একটু তাড়াতাড়ি আসবে।</p>
        ${id ? `<small>পেমেন্ট আইডি: ${esc(id)}</small>` : ""}
      </div>`;
    pay.scrollIntoView({ block: "nearest", behavior: "smooth" });
    toast("ধন্যবাদ! ❤️");
  }
}
