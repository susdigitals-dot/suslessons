import { getSettings, sendMessage } from "./data.js?v=202611121349";
import "./track.js?v=202611121349";
import { $, esc, chrome, contactWays, toast } from "./ui.js?v=202611121349";

const settings = await getSettings();
chrome(settings);

const ways = contactWays(settings.business || {}, settings);
$("#ways").innerHTML = `
  <h2>সরাসরি Contact</h2>
  <dl class="ways">${ways.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  <div class="ways-help">
    <p><b>PDF download হচ্ছে না?</b> Facebook বা Instagram-এর ভেতর থেকে না খুলে Chrome-এ <a href="/free">Free e-Books</a> পাতাটা খুলুন। তবুও না হলে লিখুন — link পাঠিয়ে দেব।</p>
    <p><a href="terms.html">Terms</a> · <a href="privacy.html">Privacy</a></p>
  </div>`;

const f = $("#contactForm");
f.addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  if (v.website) return; // বট
  const btn = $("button[type=submit]", f);
  btn.disabled = true;
  btn.textContent = "Sending…";
  const { error } = await sendMessage({ name: v.name.trim(), contact: v.contact.trim(), topic: v.topic, body: v.body.trim() });
  btn.disabled = false;
  btn.textContent = "Send →";
  if (error) {
    // ফর্ম কাজ না করলে ইমেইলে পাঠানোর রাস্তা দাও
    const mail = settings.business?.email;
    toast("পাঠানো গেল না — একটু পরে আবার try করুন");
    if (mail) location.href = `mailto:${mail}?subject=${encodeURIComponent(v.topic)}&body=${encodeURIComponent(v.body)}`;
    return;
  }
  f.innerHTML = `<div class="sent"><h2>Thank you, ${esc(v.name.trim())}!</h2><p>Message পৌঁছে গেছে। ২ working day-এর মধ্যে reply দেব।</p></div>`;
});
