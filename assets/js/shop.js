import { getSettings, listProducts } from "./data.js?v=202611031900";
import "./track.js?v=202611031900";
import { $, esc, inline, chrome, productCard, productMock, priceTag, KINDS } from "./ui.js?v=202611031900";
import { featureHtml, initFeature, INAPP } from "./kothin.js?v=202611032200";

const show = new URLSearchParams(location.search).get("kind") || "";

// ফ্রি গাইড — DB-তে নেই, সাইটের কোডে। কার্ড থেকেই সোজা PDF নামে
const FREE = [
  {
    kind: "guide",
    slug: "aaj-charo-kal-dhoro-na",
    title: "আজ ছাড়ো, কাল ধরো না",
    subtitle: "যে ৮টা অভ্যাস ==আজই ছাড়বে==, আর যে ৫টা কোনোদিন শুরুই করবে না",
    cover_url: "assets/img/shop/aaj-charo-cover.jpg",
    pdf: "books/aaj-charo-kal-dhoro-na.pdf",
    price: 0,
  },
];

// FB/Insta-র ভেতরে PDF নামে না — তখন WhatsApp-এ নিজেকে লিংক পাঠানো
function freeCard(p) {
  const url = new URL(p.pdf, location.href).href;
  const href = INAPP ? `https://wa.me/?text=${encodeURIComponent(`📖 আমার ফ্রি গাইড: ${p.title}\n${url}`)}` : p.pdf;
  const attrs = INAPP ? ` target="_blank" rel="noopener"` : " download";
  return `
    <article class="prod-card" id="${esc(p.slug)}">
      <a href="${href}"${attrs}>${productMock(p)}</a>
      <div class="pc-body">
        <span class="chip chip-free">ফ্রি ${esc(KINDS[p.kind])} · PDF</span>
        <h3><a href="${href}"${attrs}>${esc(p.title)}</a></h3>
        <p class="pc-sub">${inline(p.subtitle)}</p>
        ${priceTag(p)}
        <a class="btn btn-maroon" href="${href}"${attrs}>${INAPP ? "WhatsApp-এ PDF নিন" : "⬇ ফ্রি-তে নামান"}</a>
        ${INAPP ? `<small class="pc-wa">Insta/FB থেকে সরাসরি নামে না — WhatsApp-এ নিজেকে পাঠিয়ে সেখান থেকে নামান</small>` : ""}
      </div>
    </article>`;
}

// পুরোনো /shop.html লিংকে এলে ঠিকানায় /shop দেখাও (পাতা আবার লোড হয় না)
if (location.pathname.endsWith("/shop.html")) history.replaceState(null, "", "/shop" + location.search + location.hash);
const settings = await getSettings();
chrome(settings);

// সব ফিল্টারে ফিচার বইটা ওপরে
$("#feature").innerHTML = featureHtml();
initFeature();

const all = [...FREE, ...(await listProducts())];

// শুধু যে ধরনের জিনিস আছে, সেই ফিল্টারগুলো দেখাও
const kinds = Object.keys(KINDS).filter((k) => all.some((p) => p.kind === k));
if (kinds.length > 1)
  $("#filters").innerHTML = [["", "সব"], ...kinds.map((k) => [k, KINDS[k]])]
    .map(([k, l]) => `<a href="/shop${k ? "?kind=" + k : ""}"${k === show ? ' aria-current="page"' : ""}>${l}</a>`)
    .join("");

const items = show ? all.filter((p) => p.kind === show) : all;
// ফিচার বইটা তো আছেই — আর কিছু না থাকলে "শীঘ্রই আসছে" না দেখিয়ে ঘরটা লুকিয়ে রাখো
$("#shop").innerHTML = items.map((p) => (p.pdf ? freeCard(p) : productCard(p))).join("");
$("#shop").hidden = !items.length;
