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
  {
    kind: "guide",
    slug: "jotheshto-kototuku",
    title: "যথেষ্ট কতোটুকু?",
    subtitle: "নিজের ==“যথেষ্ট” খোঁজার== গাইড, আর খরচকে ঘণ্টায় মাপার হিসেব",
    cover_url: "assets/img/shop/jotheshto-kototuku-cover.jpg",
    pdf: "books/jotheshto-kototuku.pdf",
    spun: "kk-spun-jotheshto-kototuku",
    tag: "নিজের “যথেষ্ট” খোঁজা",
  },
  {
    kind: "guide",
    slug: "babar-shokher-khata",
    title: "বাবা-মায়ের শখের খাতা",
    subtitle: "ওঁদের জিজ্ঞেস করার মতো ==কুড়িটা প্রশ্ন==, আর চিলেকোঠা থেকে শখ নামানোর উপায়",
    cover_url: "assets/img/shop/babar-shokher-khata-cover.jpg",
    pdf: "books/babar-shokher-khata.pdf",
    spun: "kk-spun-babar-shokher-khata",
    tag: "বাবা-মায়ের শখ ফেরানো",
  },
  {
    kind: "guide",
    slug: "na-bolar-shahosh",
    title: "“না” বলার সাহস",
    subtitle: "ভদ্রভাবে ==“না” বলার কুড়িটা লাইন==, আর কোন “হ্যাঁ”-টা সত্যি দরকার",
    cover_url: "assets/img/shop/na-bolar-shahosh-cover.jpg",
    pdf: "books/na-bolar-shahosh.pdf",
    spun: "kk-spun-na-bolar-shahosh",
    tag: "ভদ্রভাবে “না” বলা",
  },
  {
    kind: "guide",
    slug: "baba-mayer-shommaner-khata",
    title: "বাবা-মায়ের সম্মানের খাতা",
    subtitle: "বাবা-মা ==নিজের সম্মান== কীভাবে বাঁচিয়ে রাখবেন, আর ছেলেমেয়েরা কী করবে",
    cover_url: "assets/img/shop/baba-mayer-shommaner-khata-cover.jpg",
    pdf: "books/baba-mayer-shommaner-khata.pdf",
    spun: "kk-spun-baba-mayer-shommaner-khata",
    tag: "বাবা-মায়ের সম্মান রাখা",
  },
  {
    kind: "guide",
    slug: "age-jomao-pore-khoroch",
    title: "আগে জমাও, পরে খরচ",
    subtitle: "==পাঁচশো টাকা== দিয়ে শুরু, আর বারো মাসের জমানোর চার্ট",
    cover_url: "assets/img/shop/age-jomao-pore-khoroch-cover.jpg",
    pdf: "books/age-jomao-pore-khoroch.pdf",
    spun: "kk-spun-age-jomao-pore-khoroch",
    tag: "পাঁচশো টাকায় জমানো শুরু",
  },
  {
    kind: "guide",
    slug: "maine-onujayi-bacho",
    title: "মাইনে অনুযায়ী বাঁচো",
    subtitle: "তোমার মাইনেতে ==কতো ইএমআই চলে==, আর ইমার্জেন্সি ফান্ডের হিসেব",
    cover_url: "assets/img/shop/maine-onujayi-bacho-cover.jpg",
    pdf: "books/maine-onujayi-bacho.pdf",
    spun: "kk-spun-maine-onujayi-bacho",
    tag: "মাইনে অনুযায়ী খরচ",
  },
  {
    kind: "guide",
    slug: "bondhuke-dhar-deyar-age",
    title: "বন্ধুকে ধার দেওয়ার আগে",
    subtitle: "==টাকাও বাঁচুক, বন্ধুটাও==— ধার দেওয়া আর নেওয়ার গাইড",
    cover_url: "assets/img/shop/bondhuke-dhar-deyar-age-cover.jpg",
    pdf: "books/bondhuke-dhar-deyar-age.pdf",
    spun: "kk-spun-bondhuke-dhar-deyar-age",
    tag: "বন্ধুকে ধার দেওয়া",
  },
  {
    kind: "guide",
    slug: "boro-sajar-dam",
    title: "বড় সাজার দাম",
    subtitle: "অন্যের সামনে ==বড়লোক সাজার খরচ== চেনো, আর কম খরচে আপ্যায়নের উপায়",
    cover_url: "assets/img/shop/boro-sajar-dam-cover.jpg",
    pdf: "books/boro-sajar-dam.pdf",
    spun: "kk-spun-boro-sajar-dam",
    tag: "লোক দেখানো খরচ চেনা",
  },
  {
    kind: "guide",
    slug: "gift-budget",
    title: "লোক দেখানো নয়, মন দেখানো",
    subtitle: "বিয়ে, পুজো, অনুষ্ঠানের ==গিফট বাজেট==, আর কম খরচে মনে রাখার মতো উপহার",
    cover_url: "assets/img/shop/gift-budget-cover.jpg",
    pdf: "books/gift-budget.pdf",
    spun: "kk-spun-gift-budget",
    tag: "অনুষ্ঠানের গিফট বাজেট",
  },
  {
    kind: "guide",
    slug: "kharap-diner-tohobil",
    title: "খারাপ দিনের তহবিল",
    subtitle: "চাকরি গেলে, অসুখ হলে, বিপদে ==যে টাকা তোমার পাশে থাকবে==",
    cover_url: "assets/img/shop/kharap-diner-tohobil-cover.jpg",
    pdf: "books/kharap-diner-tohobil.pdf",
    spun: "kk-spun-kharap-diner-tohobil",
    tag: "বিপদের দিনের টাকা",
  },
  {
    kind: "guide",
    slug: "nijer-rasta-khojar-khata",
    title: "নিজের রাস্তা খোঁজার খাতা",
    subtitle: "শখ, চাকরির পরীক্ষা আর “লোকে কী বলবে”-র মাঝখানে ==নিজের রাস্তা চেনার== গাইড",
    cover_url: "assets/img/shop/nijer-rasta-khojar-khata-cover.jpg",
    pdf: "books/nijer-rasta-khojar-khata.pdf",
    spun: "kk-spun-nijer-rasta-khojar-khata",
    tag: "নিজের রাস্তা চেনা",
  },
  {
    kind: "guide",
    slug: "emi-te-kenar-age",
    title: "ইএমআই-তে কেনার আগে এই পাতাগুলো পড়ো",
    subtitle: "==“নো-কস্ট” কিস্তির আসল দাম==, আর “সবার আছে” থেকে বেরোনোর রাস্তা",
    cover_url: "assets/img/shop/emi-te-kenar-age-cover.jpg",
    pdf: "books/emi-te-kenar-age.pdf",
    spun: "kk-spun-emi-te-kenar-age",
    tag: "ইএমআই-এর আসল দাম",
  },
  {
    kind: "guide",
    slug: "taka-dobol-er-fand",
    title: "টাকা ডবলের ফাঁদ চেনো",
    subtitle: "অবসরের টাকা, জমানো টাকা লাগানোর আগে ==১০টা প্রশ্ন==",
    cover_url: "assets/img/shop/taka-dobol-er-fand-cover.jpg",
    pdf: "books/taka-dobol-er-fand.pdf",
    spun: "kk-spun-taka-dobol-er-fand",
    tag: "টাকা ডবলের ফাঁদ চেনা",
  },
  {
    kind: "guide",
    slug: "or-shopno-na-amar",
    title: "ওর স্বপ্ন, না আমার?",
    subtitle: "সন্তানের ==আসল ঝোঁক চেনার== গাইড, বাবা-মায়েদের জন্য",
    cover_url: "assets/img/shop/or-shopno-na-amar-cover.jpg",
    pdf: "books/or-shopno-na-amar.pdf",
    spun: "kk-spun-or-shopno-na-amar",
    tag: "সন্তানের আসল ঝোঁক চেনা",
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
