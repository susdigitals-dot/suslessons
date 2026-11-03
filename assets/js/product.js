import { getSettings, getProduct } from "./data.js?v=202611031510";
import "./track.js?v=202611031510";
import { $, esc, bn, inline, safeUrl, chrome, productMock, priceTag, KINDS, endCard, setMeta } from "./ui.js?v=202611031510";

const slug = new URLSearchParams(location.search).get("p") || "";
const settings = await getSettings();
chrome(settings);

const p = slug ? await getProduct(slug) : null;
const main = $("#product");
const biz = settings.business || {};

if (!p) {
  main.innerHTML = `<div class="empty"><h2>জিনিসটা খুঁজে পেলাম না</h2><p><a class="section-link" href="shop.html">দোকানে ফিরুন →</a></p></div>`;
} else {
  setMeta(p.title, p.subtitle || p.description);
  const aff = p.kind === "affiliate";
  const buy = safeUrl(p.buy_url);
  const rel = aff ? "sponsored noopener" : "noopener";
  const label = aff ? `${esc(p.store || "দোকান")}-এ দেখুন ↗` : Number(p.price) > 0 ? "এখনই কিনুন →" : "ফ্রি-তে নিন →";

  main.innerHTML = `
    <section class="book-hero prod-hero">
      ${productMock(p, "lg")}
      <div>
        <span class="chip">${esc(KINDS[p.kind] || "")}</span>
        <h1>${esc(p.title)}</h1>
        ${p.subtitle ? `<p class="hook">${inline(p.subtitle)}</p>` : ""}
        ${priceTag(p)}
        ${p.format ? `<p class="pc-format">${esc(p.format)}</p>` : ""}
        <div class="buy-row">
          ${buy ? `<a class="btn ${aff ? "btn-gold" : "btn-maroon"}" href="${buy}" target="_blank" rel="${rel}">${label}</a>` : `<span class="chip">শীঘ্রই পাওয়া যাবে</span>`}
          ${p.preview_url ? `<a class="btn btn-ghost" href="${safeUrl(p.preview_url)}" target="_blank" rel="noopener">ফ্রি স্যাম্পল দেখুন</a>` : ""}
        </div>
        ${aff
          ? `<p class="pc-trust">এটা affiliate লিংক — এখান থেকে কিনলে আপনার দাম একই থাকে, আমরা সামান্য কমিশন পাই। <a href="disclosure.html">বিস্তারিত</a></p>`
          : `<ul class="trust">
              <li>✓ পেমেন্টের পরেই ইমেইলে ডাউনলোড লিংক</li>
              <li>✓ UPI, কার্ড, নেটব্যাংকিং — নিরাপদ পেমেন্ট</li>
              <li>✓ ফাইল না পেলে বা খারাপ হলে ${bn(biz.refundDays || 7)} দিনের মধ্যে সমাধান বা রিফান্ড — <a href="refund.html">নীতি পড়ুন</a></li>
            </ul>`}
        ${p.description ? `<div class="prod-desc">${String(p.description).split(/\n\s*\n/).map((x) => `<p>${inline(x.trim()).replace(/\n/g, "<br>")}</p>`).join("")}</div>` : ""}
        ${(p.includes || []).length ? `<h2 class="prod-h">ভেতরে যা আছে</h2><ul class="includes">${p.includes.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>` : ""}
      </div>
    </section>
    <p class="shop-note"><a href="shop.html">← দোকানে ফিরুন</a> · <a href="contact.html">প্রশ্ন আছে? যোগাযোগ করুন</a></p>
    ${endCard("বই পড়ুন, শিখুন — ==শেষ লাইনটা মনে রাখুন।==", settings)}`;
}
