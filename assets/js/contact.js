import { getSettings, sendMessage } from "./data.js?v=202611031842";
import "./track.js?v=202611031842";
import { $, esc, chrome, contactWays, toast } from "./ui.js?v=202611031842";

const settings = await getSettings();
chrome(settings);

const ways = contactWays(settings.business || {}, settings);
$("#ways").innerHTML = `
  <h2>সরাসরি যোগাযোগ</h2>
  <dl class="ways">${ways.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  <div class="ways-help">
    <p><b>অর্ডার করে ফাইল পাননি?</b> আগে ইমেইলের Spam/Promotions ফোল্ডার দেখুন। না পেলে Order / Transaction ID দিয়ে লিখুন — ২৪ ঘণ্টার মধ্যে পাঠিয়ে দেব।</p>
    <p><a href="refund.html">রিফান্ড নীতি</a> · <a href="terms.html">শর্তাবলি</a> · <a href="privacy.html">Privacy</a></p>
  </div>`;

const f = $("#contactForm");
f.addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  if (v.website) return; // বট
  const btn = $("button[type=submit]", f);
  btn.disabled = true;
  btn.textContent = "পাঠানো হচ্ছে…";
  const { error } = await sendMessage({ name: v.name.trim(), contact: v.contact.trim(), topic: v.topic, body: v.body.trim() });
  btn.disabled = false;
  btn.textContent = "পাঠান →";
  if (error) {
    // ফর্ম কাজ না করলে ইমেইলে পাঠানোর রাস্তা দাও
    const mail = settings.business?.email;
    toast("পাঠানো গেল না — একটু পরে আবার চেষ্টা করুন");
    if (mail) location.href = `mailto:${mail}?subject=${encodeURIComponent(v.topic)}&body=${encodeURIComponent(v.body)}`;
    return;
  }
  f.innerHTML = `<div class="sent"><h2>ধন্যবাদ, ${esc(v.name.trim())}!</h2><p>মেসেজ পৌঁছে গেছে। ২ কাজের দিনের মধ্যে উত্তর দেব।</p></div>`;
});
