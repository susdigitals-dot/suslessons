// শেয়ার করা UI — হেডার, ফুটার, কার্ড, লেখা ফরম্যাট
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ইংরেজি সংখ্যা → বাংলা সংখ্যা
export const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// শুধু http(s), mailto, upi আর সাইটের নিজের পাথ — বাকি সব লিংক বাদ
export const safeUrl = (u = "") => {
  u = String(u).trim();
  if (!u) return "";
  if (/^(https?:|mailto:|upi:)/i.test(u)) return esc(u);
  if (/^[\w./-]+$/.test(u) && !u.startsWith("//")) return esc(u);
  return "";
};

// ==হাইলাইট== আর **মোটা** — আগে escape, তারপর ফরম্যাট
export const inline = (s = "") =>
  esc(s)
    .replace(/==(.+?)==/g, "<mark>$1</mark>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

// গল্পের body → HTML (নিয়ম seed.js-এ লেখা আছে)
export function renderBody(src = "") {
  return String(src)
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((b) => {
      if (b === "---") return `<hr class="rule">`;
      if (b.startsWith("## ")) return `<h2>${inline(b.slice(3))}</h2>`;
      if (b.startsWith("> ")) return `<blockquote class="statement">${inline(b.slice(2))}</blockquote>`;
      if (b.startsWith("• ")) return `<p><span class="tag tag-now">${inline(b.slice(2))}</span></p>`;
      if (b.startsWith("~ ")) return `<p><span class="tag tag-past">${inline(b.slice(2))}</span></p>`;
      const img = b.match(/^!\[(.*?)\]\((.+?)\)$/);
      if (img) return `<figure><img src="${safeUrl(img[2])}" alt="${esc(img[1])}" loading="lazy">${img[1] ? `<figcaption>${esc(img[1])}</figcaption>` : ""}</figure>`;
      const say = b.match(/^@(.+?):\s*([\s\S]+)$/);
      if (say) return `<div class="caption-box"><span class="speaker">${esc(say[1])}</span><p>${inline(say[2])}</p></div>`;
      return `<p>${inline(b).replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

export const fmtDate = (d) => {
  if (!d) return "";
  const t = new Date(d);
  if (isNaN(t)) return "";
  return bn(t.toLocaleDateString("bn-IN", { day: "numeric", month: "long", year: "numeric" }));
};

// ── ব্র্যান্ড মার্ক ───────────────────────────
export const avatar = (size = 44) =>
  `<span class="avatar" style="--s:${size}px"><img src="${root()}assets/brand/avatar.jpg" alt="sus.lessons" width="${size}" height="${size}"></span>`;

export const wordmark = () => `<span class="wordmark">— sus.lessons —</span>`;

// admin/ ফোল্ডার থেকে লোড হলে পাথ ঠিক রাখো
export function root() {
  return document.documentElement.dataset.root || "";
}

// ── হেডার / ফুটার ───────────────────────────
const NAV = [
  ["index.html", "হোম"],
  ["stories.html", "গল্প"],
  ["books.html", "বই"],
  ["/shop", "দোকান"],
];

// ফুটারের আইনি পাতা — পেমেন্ট গেটওয়ে (Razorpay ইত্যাদি) এগুলো চায়
const LEGAL = [
  ["about.html", "আমাদের কথা"],
  ["contact.html", "যোগাযোগ"],
  ["privacy.html", "Privacy Policy"],
  ["terms.html", "Terms & Conditions"],
  ["refund.html", "Refund Policy"],
  ["disclosure.html", "Affiliate Disclosure"],
];

export function chrome(settings) {
  // যেকোনো "ফলো করুন" বোতামে চাপলে তিনটে অপশন
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-follow]")) followDialog(settings);
  });
  // "/shop", "shop.html" আর "/shop.html" — সবই একই পাতা
  const page = (h) => h.split("/").pop().replace(/\.html$/, "") || "index";
  const here = page(location.pathname);
  const header = $("#site-header");
  if (header) {
    header.innerHTML = `
      <div class="wrap bar">
        <a class="brand" href="index.html" aria-label="sus.lessons হোম">${avatar(40)}${wordmark()}</a>
        <button class="menu-btn" aria-label="মেনু" aria-expanded="false"><span></span><span></span></button>
        <nav class="nav">
          ${NAV.map(([href, label]) => `<a href="${href}"${page(href) === here ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          <button class="pill pill-maroon nav-follow" type="button" data-follow>ফলো করুন</button>
        </nav>
      </div>`;
    const btn = $(".menu-btn", header);
    btn.addEventListener("click", () => {
      const open = header.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
  }
  const footer = $("#site-footer");
  if (footer) {
    footer.innerHTML = `
      <div class="wrap foot">
        <div>
          <div class="foot-brand">${avatar(36)}${wordmark()}</div>
          <p>${inline(settings.tagline)}</p>
        </div>
        <nav class="foot-nav">
          ${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}
          <a href="${safeUrl(settings.instagram)}" target="_blank" rel="noopener">Instagram</a>
          ${settings.youtube ? `<a href="${safeUrl(settings.youtube)}" target="_blank" rel="noopener">YouTube</a>` : ""}
          ${settings.facebook ? `<a href="${safeUrl(settings.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ""}
        </nav>
      </div>
      <nav class="wrap foot-legal" aria-label="নীতি ও যোগাযোগ">
        ${LEGAL.map(([h, l]) => `<a href="${root()}${h}">${l}</a>`).join("")}
      </nav>
      <div class="wrap foot-small">
        <small>© ${bn(new Date().getFullYear())} ${esc(settings.business?.name || "sus.lessons")} · #sus_lessons</small>
        <small>কিছু লিংক affiliate — সেখান থেকে কিনলে আপনার খরচ বাড়ে না, আমরা সামান্য কমিশন পাই।</small>
      </div>`;
  }
}

// ── কার্ড ───────────────────────────
export const lawTag = (law) => (law ? `<span class="law">LAW ${esc(String(law).padStart(2, "0"))}</span>` : "");

export function storyCard(s) {
  const href = `story.html?s=${encodeURIComponent(s.slug)}`;
  return `
    <article class="story-card">
      <a href="${href}" class="sc-media">
        ${s.cover_url ? `<img src="${safeUrl(s.cover_url)}" alt="" loading="lazy">` : `<div class="sc-blank">${wordmark()}</div>`}
      </a>
      <div class="sc-body">
        <div class="sc-meta">${lawTag(s.law)}${(s.tags || []).slice(0, 2).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        <h3><a href="${href}">${inline(s.title)}</a></h3>
        <p>${inline(s.excerpt)}</p>
        <a class="sc-more" href="${href}">শেষ লাইনটা পড়ুন →</a>
      </div>
    </article>`;
}


// আমাদের নিজের মেরুন বইয়ের মলাট (প্রকাশকের মলাট নয়)
export function bookMock(b, size = "") {
  if (b.cover_url) return `<div class="book-mock has-img ${size}"><img src="${safeUrl(b.cover_url)}" alt="${esc(b.title)}"></div>`;
  return `
    <div class="book-mock ${size}">
      <div class="bm-frame">
        <span class="bm-mark">— sus.lessons —</span>
        <span class="bm-title">${esc(b.title)}</span>
        <span class="bm-rule"></span>
        <span class="bm-bn">${esc(b.title_bn || "")}</span>
        <span class="bm-author">${esc(b.author || "")}</span>
      </div>
    </div>`;
}

// direct: বইয়ের পেজে না নিয়ে গিয়ে সোজা দোকানে (books.html-এ ব্যবহার হয়)
export function bookCard(b, { direct = false } = {}) {
  const buy = (b.affiliate || []).filter((a) => a.url);
  const out = direct && buy.length;
  const href = out ? safeUrl(buy[0].url) : `book.html?b=${encodeURIComponent(b.slug)}`;
  const attrs = out ? ` target="_blank" rel="sponsored noopener"` : "";
  return `
    <article class="book-card">
      <a href="${href}"${attrs}>${bookMock(b)}</a>
      <div class="bc-body">
        <p class="bc-author">${esc(b.author)}</p>
        <h3><a href="${href}"${attrs}>${esc(b.title)}</a></h3>
        <p class="bc-bn">${esc(b.title_bn || "")}</p>
        ${out
          ? `<div class="bc-buy">${buy.map((a) => `<a class="btn btn-gold" href="${safeUrl(a.url)}" target="_blank" rel="sponsored noopener">${esc(a.store)}-এ কিনুন ↗</a>`).join("")}</div>`
          : `<div class="bc-actions">
          ${b.pdf_url ? `<span class="chip chip-free">বিনামূল্যে PDF</span>` : ""}
          ${buy.length ? `<span class="chip">কিনুন</span>` : ""}
        </div>`}
      </div>
    </article>`;
}

// ── দোকান ───────────────────────────
export const KINDS = {
  ebook: "ই-বুক",
  notes: "নোটস",
  guide: "গাইড",
  checklist: "চেকলিস্ট",
  affiliate: "প্রস্তাবিত",
};

export const price = (n) => (Number(n) > 0 ? `₹${bn(Number(n).toLocaleString("en-IN"))}` : "ফ্রি");

export function priceTag(p) {
  if (p.kind === "affiliate" && !p.price) return "";
  const off = p.mrp > p.price && p.price > 0;
  return `<p class="price"><b>${price(p.price)}</b>${off ? `<s>${price(p.mrp)}</s><span class="off">${bn(Math.round((1 - p.price / p.mrp) * 100))}% ছাড়</span>` : ""}</p>`;
}

// কভার না থাকলে মেরুন মলাট, ওপরে জিনিসের ধরন
export function productMock(p, size = "") {
  if (p.cover_url) return `<div class="prod-mock has-img ${size}"><img src="${safeUrl(p.cover_url)}" alt="${esc(p.title)}" loading="lazy"></div>`;
  return `
    <div class="prod-mock ${size}">
      <div class="bm-frame">
        <span class="bm-mark">— sus.lessons —</span>
        <span class="pm-kind">${esc(KINDS[p.kind] || "")}</span>
        <span class="bm-bn">${esc(p.title)}</span>
        <span class="bm-rule"></span>
      </div>
    </div>`;
}

// affiliate হলে সোজা দোকানে, নিজের জিনিস হলে বিস্তারিত পাতায়
export function productCard(p) {
  const aff = p.kind === "affiliate";
  const href = aff ? safeUrl(p.buy_url) : `product.html?p=${encodeURIComponent(p.slug)}`;
  const attrs = aff ? ` target="_blank" rel="sponsored noopener"` : "";
  return `
    <article class="prod-card">
      <a href="${href}"${attrs}>${productMock(p)}</a>
      <div class="pc-body">
        <span class="chip">${esc(KINDS[p.kind] || "")}</span>
        <h3><a href="${href}"${attrs}>${esc(p.title)}</a></h3>
        ${p.subtitle ? `<p class="pc-sub">${inline(p.subtitle)}</p>` : ""}
        ${priceTag(p)}
        <a class="btn ${aff ? "btn-gold" : "btn-maroon"}" href="${href}"${attrs}>${aff ? `${esc(p.store || "দোকান")}-এ দেখুন ↗` : "বিস্তারিত দেখুন →"}</a>
      </div>
    </article>`;
}

// ── ব্যবসার তথ্য (আইনি পাতা আর যোগাযোগ) ───────────────────────────
const digits = (s = "") => String(s).replace(/[^\d+]/g, "");

export function contactWays(biz, settings) {
  const wa = digits(biz.whatsapp).replace(/^\+/, "");
  return [
    biz.email && ["ইমেইল", `<a href="mailto:${esc(biz.email)}">${esc(biz.email)}</a>`],
    biz.phone && ["ফোন", `<a href="tel:${esc(digits(biz.phone))}">${esc(biz.phone)}</a>`],
    wa && ["WhatsApp", `<a href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">${esc(biz.whatsapp)}</a>`],
    settings?.instagram && ["Instagram", `<a href="${safeUrl(settings.instagram)}" target="_blank" rel="noopener">@sus.lessons</a>`],
    biz.address && ["ঠিকানা", esc(biz.address).replace(/\n/g, "<br>")],
    biz.hours && ["সময়", esc(biz.hours)],
  ].filter(Boolean);
}

// [data-biz="email"] ইত্যাদি ঘর আর [data-biz-card] বাক্স settings.business থেকে ভরো
export function fillBiz(settings) {
  const biz = settings.business || {};
  const contactLink = `<a href="contact.html">our contact page</a>`;
  const val = {
    name: esc(biz.name || "sus.lessons"),
    email: biz.email ? `<a href="mailto:${esc(biz.email)}">${esc(biz.email)}</a>` : contactLink,
    city: esc(biz.city || "the place of our registered address"),
    refundDays: esc(String(biz.refundDays || 7)),
  };
  $$("[data-biz]").forEach((el) => (el.innerHTML = val[el.dataset.biz] ?? ""));
  $$("[data-biz-card]").forEach((el) => {
    const rows = contactWays(biz, settings);
    el.innerHTML = `
      <p><b>${val.name}</b>${biz.owner ? ` · ${esc(biz.owner)}` : ""}</p>
      ${rows.map(([k, v]) => `<p><span>${k}</span> ${v}</p>`).join("")}
      <p><a href="contact.html">Contact form →</a></p>`;
  });
}

// এন্ড কার্ড — মেরুন, শেষ লাইন + ফলো পিল
export function endCard(line, settings, sub = "এমন আরও গল্পের জন্য") {
  return `
    <section class="end-card">
      <div class="end-frame">
        ${wordmark()}
        <p class="end-line">${inline(line)}</p>
        <span class="end-rule"></span>
        <p class="end-sub">${esc(sub)}</p>
        <button class="follow-pill" type="button" data-follow>${avatar(34)}<span>ফলো করুন <b>sus.lessons</b></span></button>
      </div>
    </section>`;
}

// ── ফলো করুন: YouTube, Facebook, Instagram ───────────────────────────
const ICONS = {
  youtube: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="10" width="42" height="29" rx="9" fill="#FF0000"/><path d="M20 18.5v12l10.5-6z" fill="#fff"/></svg>`,
  facebook: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="4" width="40" height="40" rx="10" fill="#0866FF"/><path d="M31.5 44V30.6h4.4l.7-5.2h-5.1v-3.3c0-1.5.4-2.5 2.6-2.5H37v-4.6a37 37 0 0 0-4-.2c-4 0-6.7 2.4-6.7 6.9v3.7h-4.5v5.2h4.5V44z" fill="#fff"/></svg>`,
  instagram: `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><radialGradient id="igg" cx="0.25" cy="1.05" r="1.25"><stop offset="0" stop-color="#FED373"/><stop offset=".25" stop-color="#F15245"/><stop offset=".55" stop-color="#D92E7F"/><stop offset=".8" stop-color="#9B36B7"/><stop offset="1" stop-color="#515ECF"/></radialGradient></defs><rect x="4" y="4" width="40" height="40" rx="11" fill="url(#igg)"/><rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="#fff" stroke-width="3"/><circle cx="24" cy="24" r="5.6" fill="none" stroke="#fff" stroke-width="3"/><circle cx="31.3" cy="16.7" r="1.9" fill="#fff"/></svg>`,
};

export function followDialog(settings) {
  let dlg = $("#follow");
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.id = "follow";
    dlg.className = "support follow-sheet";
    document.body.appendChild(dlg);
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
    });
  }
  const ways = [
    ["youtube", "YouTube", "ভিডিও গল্প দেখুন", settings.youtube],
    ["facebook", "Facebook", "পেজে ফলো করুন", settings.facebook],
    ["instagram", "Instagram", "রিল আর গল্প", settings.instagram],
  ].filter((w) => w[3]);
  dlg.innerHTML = `
    <button class="close" data-close aria-label="বন্ধ করুন">✕</button>
    ${wordmark()}
    <h2>ফলো করুন</h2>
    ${settings.followers ? `<p>${esc(settings.followers)} ফলোয়ার — আপনিও যোগ দিন</p>` : ""}
    <div class="follow-list">
      ${ways.map(([k, name, sub, url]) => `
        <a class="follow-row follow-${k}" href="${safeUrl(url)}" target="_blank" rel="noopener" aria-label="${name}-এ ফলো করুন" data-close>
          <span class="follow-icon">${ICONS[k]}</span>
          <span class="follow-text"><b>${name}</b><small>${sub}</small></span>
          <span class="follow-go">↗</span>
        </a>`).join("")}
    </div>`;
  dlg.showModal();
}

// ── চা খাওয়ান (সাপোর্ট) ───────────────────────────
export function supportDialog(settings, { title, download } = {}) {
  const sp = settings.support || {};
  let dlg = $("#support");
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.id = "support";
    dlg.className = "support";
    document.body.appendChild(dlg);
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
      const c = e.target.closest("[data-copy]");
      if (c) copy(c.dataset.copy);
    });
  }
  const upiLink = sp.upi ? `upi://pay?pa=${encodeURIComponent(sp.upi)}&pn=${encodeURIComponent(sp.upiName || "sus.lessons")}&cu=INR` : "";
  const rows = [
    sp.upi && `<div class="pay-row"><span>UPI</span><code>${esc(sp.upi)}</code><button class="btn-mini" data-copy="${esc(sp.upi)}">কপি</button></div>`,
    sp.bkash && `<div class="pay-row"><span>বিকাশ</span><code>${esc(sp.bkash)}</code><button class="btn-mini" data-copy="${esc(sp.bkash)}">কপি</button></div>`,
  ].filter(Boolean);
  dlg.innerHTML = `
    <button class="close" data-close aria-label="বন্ধ করুন">✕</button>
    ${wordmark()}
    <h2>${esc(sp.title)}</h2>
    <p>${esc(sp.text)}</p>
    ${rows.length ? `<div class="pay-list">${rows.join("")}</div>` : ""}
    <div class="support-actions">
      ${upiLink ? `<a class="btn btn-maroon" href="${upiLink}">UPI অ্যাপে খুলুন</a>` : ""}
      ${sp.link ? `<a class="btn btn-maroon" href="${safeUrl(sp.link)}" target="_blank" rel="noopener">চা খাওয়ান ↗</a>` : ""}
      ${download ? `<a class="btn btn-gold" href="${safeUrl(download)}" download data-close>⬇ ${title ? esc(title) + " — " : ""}বইটা নামিয়ে নিন</a>` : ""}
    </div>
    <p class="note">বই সবার জন্য। চা খাওয়ানো সম্পূর্ণ আপনার ইচ্ছে। ❤️</p>`;
  dlg.showModal();
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  toast("কপি হয়েছে ✓");
}

let toastTimer;
export function toast(msg) {
  let el = $("#toast");
  if (!el) {
    el = Object.assign(document.createElement("div"), { id: "toast", className: "toast" });
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

export function setMeta(title, desc) {
  document.title = title ? `${title} · sus.lessons` : "sus.lessons — গল্পের শেষ লাইনেই আসল শিক্ষা";
  if (desc) $('meta[name="description"]')?.setAttribute("content", desc.replace(/==|\*\*/g, ""));
}
