import { getSettings, listProducts } from "./data.js?v=202611051913";
import "./track.js?v=202611051913";
import { $, esc, inline, chrome, productCard, productMock, KINDS } from "./ui.js?v=202611051913";
import { BOOK, initFeature, openWheel } from "./kothin.js?v=202611051913";

const show = new URLSearchParams(location.search).get("kind") || "";

// সাইটের কোডে রাখা বই (DB-তে নেই) — প্রতিটায় দুটো বোতাম, দুটোতেই দামের চাকা
const BOOKS = [
  {
    kind: "guide",
    slug: "ragher-mathay-bolar-age",
    title: "রাগের মাথায় বলার আগে",
    subtitle: "==ওই দশ সেকেন্ডে== কী করবে, আর ভুল কথা বলে ফেললে কীভাবে ফেরাবে",
    cover_url: "assets/img/shop/ragher-mathay-cover.jpg",
    pdf: "books/ragher-mathay-bolar-age.pdf",
    spun: "kk-spun-ragher-mathay",
    tag: "রাগের মাথায় ভুল কথা সামলানো",
  },
  {
    kind: "guide",
    slug: "maniye-ne-noy-ami-achi",
    title: "“মানিয়ে নে” নয়, “আমি আছি”",
    subtitle: "মেয়ের শ্বশুরবাড়িতে ==বিপদ চেনার== আর পাশে দাঁড়ানোর গাইড",
    cover_url: "assets/img/shop/maniye-ne-cover.jpg",
    pdf: "books/maniye-ne-noy-ami-achi.pdf",
    spun: "kk-spun-maniye-ne",
    tag: "মেয়ের শ্বশুরবাড়িতে বিপদ চেনা",
  },
  BOOK,
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
  {
    kind: "guide",
    slug: "chup-kore-shonar-shokti",
    title: "চুপ করে শোনার শক্তি",
    subtitle: "পারিবারিক ঝামেলায় ==কে আসলে কী চায়==, চিনে নেওয়ার গাইড",
    cover_url: "assets/img/shop/chup-kore-cover.jpg",
    pdf: "books/chup-kore-shonar-shokti.pdf",
    spun: "kk-spun-chup-kore",
    tag: "পারিবারিক ঝামেলায় কে কী চায়",
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

// কোনো বই আলাদা করে ফিচার করা হয় না — শুধু ভাসমান ই-বুক বোতাম আর #spin
initFeature(BOOKS.filter((b) => b !== BOOK));

const all = [...BOOKS, ...(await listProducts())];

// শুধু যে ধরনের জিনিস আছে, সেই ফিল্টারগুলো দেখাও
const kinds = Object.keys(KINDS).filter((k) => all.some((p) => p.kind === k));
if (kinds.length > 1)
  $("#filters").innerHTML = [["", "সব"], ...kinds.map((k) => [k, KINDS[k]])]
    .map(([k, l]) => `<a href="/shop${k ? "?kind=" + k : ""}"${k === show ? ' aria-current="page"' : ""}>${l}</a>`)
    .join("");

const items = show ? all.filter((p) => p.kind === show) : all;
// কিছু না থাকলে "শীঘ্রই আসছে" না দেখিয়ে ঘরটা লুকিয়ে রাখো
$("#shop").innerHTML = items.map((p) => (p.pdf ? bookCard(p) : productCard(p))).join("");
$("#shop").hidden = !items.length;
$("#shop").addEventListener("click", (e) => {
  const b = BOOKS.find((x) => x.slug === e.target.closest("[data-book]")?.dataset.book);
  if (b) openWheel(b);
});
