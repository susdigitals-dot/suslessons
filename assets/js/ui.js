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
  ["stories.html?type=slides", "স্লাইড গল্প"],
  ["books.html", "বই"],
];

export function chrome(settings) {
  const here = location.pathname.split("/").pop() || "index.html";
  const qs = location.search;
  const header = $("#site-header");
  if (header) {
    header.innerHTML = `
      <div class="wrap bar">
        <a class="brand" href="index.html" aria-label="sus.lessons হোম">${avatar(40)}${wordmark()}</a>
        <button class="menu-btn" aria-label="মেনু" aria-expanded="false"><span></span><span></span></button>
        <nav class="nav">
          ${NAV.map(([href, label]) => {
            const [p, s] = href.split("?");
            const on = p === here && (s ? qs.includes(s) : !qs.includes("type=slides"));
            return `<a href="${href}"${on ? ' aria-current="page"' : ""}>${label}</a>`;
          }).join("")}
          <a class="pill pill-maroon nav-follow" href="${safeUrl(settings.instagram)}" target="_blank" rel="noopener">ফলো করুন</a>
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
        </nav>
      </div>
      <div class="wrap foot-small">
        <small>© ${bn(new Date().getFullYear())} sus.lessons · #sus_lessons</small>
        <small>এই সাইটের কিছু বইয়ের লিংক affiliate লিংক — কিনলে আমরা সামান্য কমিশন পাই, আপনার দাম একই থাকে।</small>
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
        ${s.type === "slides" ? `<span class="sc-kind">স্লাইড · ${bn((s.slides || []).length + 1)}</span>` : ""}
      </a>
      <div class="sc-body">
        <div class="sc-meta">${lawTag(s.law)}${(s.tags || []).slice(0, 2).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        <h3><a href="${href}">${inline(s.title)}</a></h3>
        <p>${inline(s.excerpt)}</p>
        <a class="sc-more" href="${href}">শেষ লাইনটা পড়ুন →</a>
      </div>
    </article>`;
}

export function slideCard(s) {
  const first = (s.slides || [])[0] || {};
  return `
    <a class="slide-card" href="story.html?s=${encodeURIComponent(s.slug)}">
      ${s.cover_url || first.image ? `<img src="${safeUrl(s.cover_url || first.image)}" alt="" loading="lazy">` : ""}
      <span class="slide-card-pill">${wordmark()}</span>
      <span class="slide-card-text">${inline(s.title)}</span>
      <span class="slide-card-count">${bn((s.slides || []).length + 1)} স্লাইড ›</span>
    </a>`;
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

export function bookCard(b) {
  const href = `book.html?b=${encodeURIComponent(b.slug)}`;
  return `
    <article class="book-card">
      <a href="${href}">${bookMock(b)}</a>
      <div class="bc-body">
        <p class="bc-author">${esc(b.author)}</p>
        <h3><a href="${href}">${esc(b.title)}</a></h3>
        <p class="bc-bn">${esc(b.title_bn || "")}</p>
        <div class="bc-actions">
          ${b.pdf_url ? `<span class="chip chip-free">বিনামূল্যে PDF</span>` : ""}
          ${(b.affiliate || []).length ? `<span class="chip">কিনুন</span>` : ""}
        </div>
      </div>
    </article>`;
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
        <a class="follow-pill" href="${safeUrl(settings.instagram)}" target="_blank" rel="noopener">${avatar(34)}<span>ফলো করুন <b>sus.lessons</b></span></a>
      </div>
    </section>`;
}

export const disclosure = () =>
  `<p class="disclosure">ⓘ এই লিংকগুলো affiliate লিংক — এখান থেকে কিনলে আমরা সামান্য কমিশন পাই, আপনার দাম একই থাকে।</p>`;

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
