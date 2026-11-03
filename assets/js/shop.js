import { getSettings, listProducts } from "./data.js?v=202611031900";
import "./track.js?v=202611031900";
import { $, esc, inline, chrome, productCard, productMock, KINDS } from "./ui.js?v=202611031900";
import { featureHtml, initFeature, openWheel } from "./kothin.js?v=202611032330";

const show = new URLSearchParams(location.search).get("kind") || "";

// সাইটের কোডে রাখা বই (DB-তে নেই) — ফিচার বইয়ের মতোই দুটো বোতাম, দুটোতেই দামের চাকা
const BOOKS = [
  {
    kind: "guide",
    slug: "aaj-charo-kal-dhoro-na",
    title: "আজ ছাড়ো, কাল ধরো না",
    subtitle: "যে ৮টা অভ্যাস ==আজই ছাড়বে==, আর যে ৫টা কোনোদিন শুরুই করবে না",
    cover_url: "assets/img/shop/aaj-charo-cover.jpg",
    pdf: "books/aaj-charo-kal-dhoro-na.pdf",
    spun: "kk-spun-aaj-charo",
    tag: "যে অভ্যাস আজই ছাড়বে",
  },
];

function bookCard(p) {
  return `
    <article class="prod-card" id="${esc(p.slug)}">
      <button class="pc-cover" type="button" data-book="${esc(p.slug)}" aria-label="${esc(p.title)}">${productMock(p)}</button>
      <div class="pc-body">
        <span class="chip">${esc(KINDS[p.kind])} · PDF</span>
        <h3>${esc(p.title)}</h3>
        <p class="pc-sub">${inline(p.subtitle)}</p>
        <div class="pc-btns">
          <button class="btn btn-maroon kk-dl" type="button" data-book="${esc(p.slug)}">⬇ DOWNLOAD NOW</button>
          <button class="btn btn-ghost" type="button" data-book="${esc(p.slug)}">📖 ই-বুক নামান</button>
        </div>
      </div>
    </article>`;
}

// পুরোনো /shop.html লিংকে এলে ঠিকানায় /shop দেখাও (পাতা আবার লোড হয় না)
if (location.pathname.endsWith("/shop.html")) history.replaceState(null, "", "/shop" + location.search + location.hash);
const settings = await getSettings();
chrome(settings);

// সব ফিল্টারে ফিচার বইটা ওপরে
$("#feature").innerHTML = featureHtml();
initFeature(BOOKS);

const all = [...BOOKS, ...(await listProducts())];

// শুধু যে ধরনের জিনিস আছে, সেই ফিল্টারগুলো দেখাও
const kinds = Object.keys(KINDS).filter((k) => all.some((p) => p.kind === k));
if (kinds.length > 1)
  $("#filters").innerHTML = [["", "সব"], ...kinds.map((k) => [k, KINDS[k]])]
    .map(([k, l]) => `<a href="/shop${k ? "?kind=" + k : ""}"${k === show ? ' aria-current="page"' : ""}>${l}</a>`)
    .join("");

const items = show ? all.filter((p) => p.kind === show) : all;
// ফিচার বইটা তো আছেই — আর কিছু না থাকলে "শীঘ্রই আসছে" না দেখিয়ে ঘরটা লুকিয়ে রাখো
$("#shop").innerHTML = items.map((p) => (p.pdf ? bookCard(p) : productCard(p))).join("");
$("#shop").hidden = !items.length;
$("#shop").addEventListener("click", (e) => {
  const b = BOOKS.find((x) => x.slug === e.target.closest("[data-book]")?.dataset.book);
  if (b) openWheel(b);
});
