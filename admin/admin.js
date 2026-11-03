// sus.lessons admin — গল্প, স্লাইড গল্প, বই আর সেটিংস লেখার জায়গা
import { CONFIG } from "../assets/js/config.js?v=202611031900";
import { SEED } from "../assets/js/seed.js?v=202611031900";
import { live, sb } from "../assets/js/data.js?v=202611031900";
import { $, $$, esc, avatar, wordmark, toast, KINDS, price } from "../assets/js/ui.js?v=202611031900";

const app = $("#app");
let user = null;
let view = "dashboard";
let liveCh = null;

// সাইটের relative পাথ (assets/…) admin ফোল্ডার থেকে দেখাতে ../ লাগে
const src = (u = "") => (!u || /^(https?:|data:|blob:)/.test(u) ? u : "../" + u);
const slugify = (s = "") =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);

if (!live) setupNeeded();
else init();

// ── Supabase connect নেই ───────────────────────────
function setupNeeded() {
  app.innerHTML = `
    <div class="login"><div class="login-card">
      ${avatar(64)}
      <h1>${wordmark()}</h1>
      <p>Admin প্যানেল চালু করতে Supabase connect করতে হবে।</p>
      <div class="notice">
        ১. Supabase-এ <code>supabase/schema.sql</code> ফাইলটা SQL Editor-এ Run করো।<br>
        ২. <code>assets/js/config.js</code>-এ Project URL আর anon key বসাও।<br>
        ৩. Authentication → Users → নিজের ইমেইল দিয়ে user বানাও।
      </div>
      <p style="margin-top:18px"><a class="section-link" href="../index.html">← সাইটে ফিরুন</a></p>
    </div></div>`;
}

// ── লগইন ───────────────────────────
async function init() {
  const { data } = await sb.auth.getSession();
  user = data.session?.user || null;
  sb.auth.onAuthStateChange((_e, s) => {
    const next = s?.user || null;
    if ((next && next.id) !== (user && user.id)) {
      user = next;
      route();
    }
  });
  route();
}

async function route() {
  if (!user) return login();
  const { data } = await sb.from("admins").select("email").limit(1);
  if (!data?.length) return notAdmin();
  shell();
}

function login() {
  app.innerHTML = `
    <div class="login"><div class="login-card">
      ${avatar(64)}
      <h1>${wordmark()}</h1>
      <p>Admin প্যানেলে ঢুকুন</p>
      <form id="loginForm">
        <label class="field"><span>ইমেইল</span><input type="email" name="email" required autocomplete="username"></label>
        <label class="field"><span>পাসওয়ার্ড</span><input type="password" name="password" autocomplete="current-password"></label>
        <button class="btn btn-maroon" type="submit">লগইন</button>
        <div class="or">অথবা</div>
        <button class="btn btn-ghost" type="button" id="magic">ইমেইলে লগইন লিংক পাঠাও</button>
      </form>
    </div></div>`;
  const f = $("#loginForm");
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(f));
    if (!password) return toast("পাসওয়ার্ড দাও, অথবা লগইন লিংক নাও");
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) toast("লগইন হলো না: " + error.message);
  });
  $("#magic").addEventListener("click", async () => {
    const email = f.email.value.trim();
    if (!email) return toast("আগে ইমেইল লেখো");
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href, shouldCreateUser: false } });
    toast(error ? "পাঠানো গেল না: " + error.message : "ইমেইল দেখো — লগইন লিংক পাঠানো হয়েছে ✓");
  });
}

function notAdmin() {
  app.innerHTML = `
    <div class="login"><div class="login-card">
      ${avatar(64)}
      <h1>অনুমতি নেই</h1>
      <p><b>${esc(user.email)}</b> এই সাইটের admin না।</p>
      <div class="notice">Supabase SQL Editor-এ চালাও:<br><code>insert into admins (email) values ('${esc(user.email)}');</code></div>
      <p style="margin-top:18px"><button class="btn btn-ghost" id="out">লগআউট</button></p>
    </div></div>`;
  $("#out").onclick = () => sb.auth.signOut();
}

// ── মূল লেআউট ───────────────────────────
function shell() {
  app.innerHTML = `
    <div class="shell">
      <aside class="side">
        <div class="brand">${avatar(34)}${wordmark()}</div>
        <button data-view="dashboard">📊 ড্যাশবোর্ড</button>
        <button data-view="stories">📝 গল্প</button>
        <button data-view="books">📚 বই</button>
        <button data-view="products">🛍️ দোকান</button>
        <button data-view="messages">📩 মেসেজ</button>
        <button data-view="donations">☕ চা</button>
        <button data-view="settings">⚙️ সেটিংস</button>
        <a href="../index.html" target="_blank">↗ সাইট দেখুন</a>
        <div class="grow"></div>
        <small>${esc(user.email)}</small>
        <button id="logout">লগআউট</button>
      </aside>
      <main class="main" id="main"></main>
    </div>`;
  $$(".side [data-view]").forEach((b) => (b.onclick = () => go(b.dataset.view)));
  $("#logout").onclick = () => sb.auth.signOut();
  // এই ব্রাউজার থেকে নিজের ভিজিট আর গোনা হবে না
  try { localStorage.setItem("sus-notrack", "1"); } catch {}
  go(view);
}

function go(v) {
  view = v;
  if (liveCh) sb.removeChannel(liveCh), (liveCh = null);
  $$(".side [data-view]").forEach((b) => b.setAttribute("aria-current", b.dataset.view === v));
  ({ dashboard, stories: storiesList, books: booksList, products: productsList, messages: messagesList, donations: donationsList, settings: settingsForm })[v]();
}

const main = () => $("#main");

// ── ড্যাশবোর্ড: লাইভ ভিজিটর, ভিউ, লিংক ক্লিক ───────────────────────────
const num = (n) => Number(n || 0).toLocaleString("bn-IN");
const pageName = (p = "") => decodeURIComponent(p).replace(/^\//, "") || "হোম";

async function dashboard(days = Number(sessionStorage.getItem("dash-days")) || 7) {
  main().innerHTML = `
    <div class="top">
      <h1>ড্যাশবোর্ড</h1>
      <div class="acts">
        <select class="input" id="days" style="width:auto">
          ${[[1, "আজ (২৪ ঘণ্টা)"], [7, "গত ৭ দিন"], [30, "গত ৩০ দিন"], [90, "গত ৯০ দিন"]]
            .map(([d, l]) => `<option value="${d}"${d === days ? " selected" : ""}>${l}</option>`).join("")}
        </select>
        <button class="btn btn-ghost btn-sm" id="reload">↻ রিফ্রেশ</button>
      </div>
    </div>
    <div class="live-card">
      <span class="live-dot"></span>
      <div><b id="liveNum">…</b> জন এখন সাইটে আছে</div>
      <ul class="live-pages" id="livePages"></ul>
    </div>
    <div id="stats"><div class="skeleton"></div></div>`;
  $("#days").onchange = (e) => {
    sessionStorage.setItem("dash-days", e.target.value);
    go("dashboard");
  };
  $("#reload").onclick = () => go("dashboard");

  // লাইভ ভিজিটর — সাইটের প্রতিটা খোলা ট্যাব "live" চ্যানেলে presence পাঠায় (track.js)
  // presence key না দিলে Supabase এই চ্যানেলে ভিজিটরের তালিকা পাঠায় না
  liveCh = sb.channel("live", { config: { presence: { key: "admin-" + Math.random().toString(36).slice(2, 8), enabled: true } } });
  liveCh.on("presence", { event: "sync" }, () => {
    const people = Object.values(liveCh.presenceState()).map((x) => x[0]).filter((x) => x?.path);
    const byPage = {};
    people.forEach((x) => (byPage[x.path] = (byPage[x.path] || 0) + 1));
    if (!$("#liveNum")) return;
    $("#liveNum").textContent = num(people.length);
    $("#livePages").innerHTML = Object.entries(byPage)
      .sort((a, b) => b[1] - a[1])
      .map(([p, n]) => `<li><span>${esc(pageName(p))}</span><b>${num(n)}</b></li>`).join("");
  }).subscribe((s) => {
    // নিজে একবার track না করলে Supabase অনেক সময় তালিকা পাঠায় না; path নেই বলে admin গোনা হয় না
    if (s === "SUBSCRIBED") liveCh?.track({ admin: true });
  });

  const [{ data: st, error }, { data: recent }] = await Promise.all([
    sb.rpc("event_stats", { p_days: days }),
    sb.from("events").select("label,href,path,created_at").eq("kind", "click").order("created_at", { ascending: false }).limit(25),
  ]);
  if (!$("#stats")) return;
  if (error) {
    $("#stats").innerHTML = `<div class="notice">ডেটা আনা গেল না (${esc(error.message)})।<br>
      Supabase SQL Editor-এ আবার <code>supabase/schema.sql</code> Run করো — নতুন <code>events</code> টেবিলটা তৈরি হবে।</div>`;
    return;
  }
  const max = Math.max(1, ...st.daily.map((d) => d.views));
  const list = (rows, cell) =>
    rows.length ? `<ol class="rank">${rows.map((r) => `<li>${cell(r)}<b>${num(r.n)}</b></li>`).join("")}</ol>` : `<p class="empty">এখনো কিছু নেই</p>`;
  const when = (t) => new Date(t).toLocaleString("bn-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  $("#stats").innerHTML = `
    <div class="kpis">
      <div class="kpi"><span>পেজ ভিউ</span><b>${num(st.views)}</b></div>
      <div class="kpi"><span>ভিজিটর</span><b>${num(st.visitors)}</b></div>
      <div class="kpi"><span>লিংক ক্লিক</span><b>${num(st.clicks)}</b></div>
    </div>
    ${st.daily.length > 1 ? `<div class="panel"><h2>দিন অনুযায়ী ভিউ</h2><div class="bars">
      ${st.daily.map((d) => `<div class="bar" title="${esc(d.d)} · ${d.views} ভিউ · ${d.clicks} ক্লিক"><i style="height:${(d.views / max) * 100}%"></i><small>${esc(d.d.slice(8))}</small></div>`).join("")}
    </div></div>` : ""}
    <div class="panel"><h2>কোন লিংকে কতজন ক্লিক করেছে</h2>
      ${list(st.top_links, (r) => `<span><b>${esc(r.label || "—")}</b><a href="${esc(r.href)}" target="_blank" rel="noopener">${esc(r.href.replace(/^https?:\/\//, ""))}</a></span>`)}
    </div>
    <div class="grid2">
      <div class="panel"><h2>সবচেয়ে বেশি দেখা পেজ</h2>${list(st.top_pages, (r) => `<span>${esc(pageName(r.path))}</span>`)}</div>
      <div class="panel"><h2>কোথা থেকে এসেছে</h2>${list(st.top_refs, (r) => `<span>${esc(r.ref)}</span>`)}</div>
    </div>
    <div class="panel"><h2>সাম্প্রতিক ক্লিক</h2>
      ${recent?.length ? `<ol class="rank recent">${recent.map((r) => `<li><span><b>${esc(r.label || "—")}</b><small>${esc(pageName(r.path))} থেকে</small></span><small>${when(r.created_at)}</small></li>`).join("")}</ol>` : `<p class="empty">এখনো কিছু নেই</p>`}
    </div>`;
}

// ── গল্পের তালিকা ───────────────────────────
async function storiesList() {
  main().innerHTML = `<div class="skeleton"></div>`;
  const { data, error } = await sb.from("stories").select("id,slug,title,type,published,published_at,cover_url").order("published_at", { ascending: false });
  if (error) return fail(error);
  main().innerHTML = `
    <div class="top">
      <h1>গল্প</h1>
      <div class="acts">
        <button class="btn btn-maroon btn-sm" data-new>+ নতুন গল্প</button>
      </div>
    </div>
    ${data.length ? "" : `<div class="mode-banner">এখনো কোনো গল্প নেই। <button class="btn btn-gold btn-sm" id="importSeed">নমুনা গল্প আর বই ইমপোর্ট করো</button></div>`}
    <div class="table">${data.map((s) => row(s, "story")).join("") || `<p class="empty">খালি</p>`}</div>`;
  $$("[data-new]").forEach((b) => (b.onclick = () => storyForm({})));
  $("#importSeed")?.addEventListener("click", importSeed);
  bindRows("stories", storyForm);
}

function row(x, kind) {
  const img = x.cover_url;
  const pub = x.published;
  const view = { story: "../story.html?s=", book: "../book.html?b=", product: "../product.html?p=" }[kind] + encodeURIComponent(x.slug);
  return `
    <div class="row">
      ${img ? `<img src="${esc(src(img))}" alt="">` : `<div class="ph"></div>`}
      <div>
        <h3>${esc((x.title || "").replace(/==|\*\*/g, ""))}</h3>
        <div class="sub">
          <span class="status ${pub ? "on" : "off"}">${pub ? "প্রকাশিত" : "খসড়া"}</span>
          ${kind === "story" ? `${x.type === "slides" ? `<span class="status off">স্লাইড — সাইটে দেখায় না</span>` : ""}<span>${esc(x.published_at || "")}</span>`
            : kind === "product" ? `<span>${esc(KINDS[x.kind] || "")}</span><span>${x.kind === "affiliate" && !x.price ? "affiliate" : price(x.price)}</span>${x.buy_url ? "" : `<span class="status off">কেনার লিংক নেই</span>`}`
            : `<span>${esc(x.author || "")}</span>`}
          <span>/${esc(x.slug)}</span>
        </div>
      </div>
      <div class="acts">
        <a class="btn btn-ghost btn-sm" href="${view}" target="_blank">দেখুন</a>
        <button class="btn btn-maroon btn-sm" data-edit="${x.id}">এডিট</button>
      </div>
      <div class="acts"><button class="btn btn-danger btn-sm" data-del="${x.id}">মুছুন</button></div>
    </div>`;
}

function bindRows(table, form) {
  $$("[data-edit]", main()).forEach((b) =>
    (b.onclick = async () => {
      const { data, error } = await sb.from(table).select("*").eq("id", b.dataset.edit).single();
      if (error) return fail(error);
      form(data);
    })
  );
  $$("[data-del]", main()).forEach((b) =>
    (b.onclick = async () => {
      if (!confirm("সত্যিই মুছে ফেলবে? এটা আর ফেরত আনা যাবে না।")) return;
      const { error } = await sb.from(table).delete().eq("id", b.dataset.del);
      if (error) return fail(error);
      toast("মুছে ফেলা হলো");
      go(view);
    })
  );
}

// ── গল্প এডিটর ───────────────────────────
async function storyForm(s = {}) {
  const { data: books } = await sb.from("books").select("slug,title").order("sort");
  main().innerHTML = `
    <div class="top">
      <h1>${s.id ? "গল্প এডিট" : "নতুন গল্প"}</h1>
      <button class="btn btn-ghost btn-sm" id="back">← তালিকায় ফিরুন</button>
    </div>
    <form class="form" id="f">
      <div class="grid2">
        <label class="field"><span>Slug (লিংকের নাম, ইংরেজিতে)</span><input type="text" name="slug" value="${esc(s.slug || "")}" placeholder="boro-biye-boro-dhar"><small>ফাঁকা রাখলে নিজে থেকে তৈরি হবে</small></label>
      </div>
      <label class="field"><span>শিরোনাম</span><input type="text" name="title" required value="${esc(s.title || "")}"><small><code>==শব্দ==</code> দিলে কমলা হাইলাইট হয়</small></label>
      <label class="field"><span>ছোট বিবরণ (কার্ডে দেখায়)</span><textarea name="excerpt">${esc(s.excerpt || "")}</textarea></label>
      <label class="field"><span>শেষ লাইন — আসল শিক্ষা</span><input type="text" name="last_line" value="${esc(s.last_line || "")}"><small>মেরুন এন্ড কার্ডে বড় করে দেখায়। ১–৩টা শব্দ <code>==এভাবে==</code> হাইলাইট করো।</small></label>
      ${uploadField("cover_url", "কভার ছবি (রিল/ভিডিওর স্ক্রিনশট দিও না)", s.cover_url, "covers")}
      <div class="grid2">
        <label class="field"><span>কোন বই থেকে</span>
          <select name="book_slug"><option value="">— কোনোটা না —</option>${(books || []).map((b) => `<option value="${esc(b.slug)}"${b.slug === s.book_slug ? " selected" : ""}>${esc(b.title)}</option>`).join("")}</select>
        </label>
        <label class="field"><span>LAW নম্বর (থাকলে)</span><input type="text" name="law" value="${esc(s.law || "")}" placeholder="04"></label>
      </div>
      <label class="field"><span>ট্যাগ (কমা দিয়ে)</span><input type="text" name="tags" value="${esc((s.tags || []).join(", "))}" placeholder="পরিবার, বাবা"></label>

      <div>
        <label class="field"><span>গল্প</span><textarea class="body" name="body">${esc(s.body || "")}</textarea></label>
        <div class="help" style="margin-top:10px">
          <code>## শিরোনাম</code> · <code>@বাবা: “কথা”</code> কথোপকথন · <code>&gt; লাইন</code> গাঢ় কার্ড ·
          <code>• আজ</code> সময় · <code>~ তিন মাস আগে</code> ফ্ল্যাশব্যাক · <code>![কথা](ছবির-লিংক)</code> ছবি ·
          <code>==শব্দ==</code> হাইলাইট · <code>**শব্দ**</code> মোটা · <code>---</code> বিভাজক · ফাঁকা লাইন = নতুন অনুচ্ছেদ
        </div>
      </div>


      <div class="grid2">
        <label class="field"><span>প্রকাশের তারিখ</span><input type="date" name="published_at" value="${esc(s.published_at || new Date().toISOString().slice(0, 10))}"></label>
        <label class="check" style="align-self:end;padding-bottom:12px"><input type="checkbox" name="published" ${s.published ? "checked" : ""}> প্রকাশ করো (না দিলে খসড়া)</label>
      </div>
      <div class="savebar">
        ${s.slug ? `<a class="btn btn-ghost" href="../story.html?s=${encodeURIComponent(s.slug)}" target="_blank">দেখুন ↗</a>` : ""}
        <button class="btn btn-maroon" type="submit">💾 সেভ করো</button>
      </div>
    </form>`;

  const f = $("#f");
  $("#back").onclick = () => go("stories");
  bindForm(f);

  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f));
    const rec = {
      type: "blog",
      title: v.title.trim(),
      slug: slugify(v.slug) || slugify(v.title) || "story-" + Date.now().toString(36),
      excerpt: v.excerpt.trim(),
      last_line: v.last_line.trim(),
      cover_url: v.cover_url.trim(),
      book_slug: v.book_slug || null,
      law: v.law.trim(),
      tags: v.tags.split(/[,،]/).map((t) => t.trim()).filter(Boolean),
      body: v.body || "",
      slides: [],
      published: !!v.published,
      published_at: v.published_at || null,
    };
    await save("stories", s.id, rec, (saved) => storyForm(saved));
  };
}


// ── বইয়ের তালিকা ───────────────────────────
async function booksList() {
  main().innerHTML = `<div class="skeleton"></div>`;
  const { data, error } = await sb.from("books").select("id,slug,title,author,published,cover_url").order("sort");
  if (error) return fail(error);
  main().innerHTML = `
    <div class="top"><h1>বই</h1><button class="btn btn-maroon btn-sm" id="new">+ নতুন বই</button></div>
    <div class="table">${data.map((b) => row(b, "book")).join("") || `<p class="empty">এখনো কোনো বই নেই</p>`}</div>`;
  $("#new").onclick = () => bookForm({ published: true });
  bindRows("books", bookForm);
}

async function bookForm(b = {}) {
  main().innerHTML = `
    <div class="top"><h1>${b.id ? "বই এডিট" : "নতুন বই"}</h1><button class="btn btn-ghost btn-sm" id="back">← তালিকায় ফিরুন</button></div>
    <form class="form" id="f">
      <div class="grid2">
        <label class="field"><span>বইয়ের নাম (ইংরেজি)</span><input type="text" name="title" required value="${esc(b.title || "")}"></label>
        <label class="field"><span>বাংলা নাম</span><input type="text" name="title_bn" value="${esc(b.title_bn || "")}"></label>
        <label class="field"><span>লেখক</span><input type="text" name="author" value="${esc(b.author || "")}"></label>
        <label class="field"><span>Slug</span><input type="text" name="slug" value="${esc(b.slug || "")}" placeholder="48-laws-of-power"></label>
      </div>
      <label class="field"><span>হুক লাইন</span><input type="text" name="hook" value="${esc(b.hook || "")}" placeholder="ভালো মানুষ হয়ে ==বারবার ঠকছেন?=="></label>
      <label class="field"><span>বিবরণ</span><textarea name="description">${esc(b.description || "")}</textarea></label>
      ${uploadField("cover_url", "কভার ছবি (ফাঁকা রাখলে আমাদের মেরুন মলাট দেখাবে)", b.cover_url, "books")}

      <div class="field"><span>Laws / মূল শিক্ষা</span><small>বইয়ের পাতায় আর “আজকের বই”-তে ৩টা দেখায়</small></div>
      <div class="repeat" id="laws" style="--cols:80px 1fr 1.3fr">${(b.laws || []).map(lawItem).join("")}</div>
      <button type="button" class="btn btn-ghost btn-sm add" id="addLaw">+ Law যোগ করো</button>

      <div class="field"><span>কেনার লিংক (affiliate)</span><small>Amazon affiliate লিংক</small></div>
      <div class="repeat" id="aff" style="--cols:160px 1fr">${(b.affiliate || []).map(affItem).join("")}</div>
      <button type="button" class="btn btn-ghost btn-sm add" id="addAff">+ লিংক যোগ করো</button>

      ${uploadField("pdf_url", "ফ্রি PDF (থাকলে বিনামূল্যে ডাউনলোড বোতাম দেখাবে)", b.pdf_url, "pdf", "application/pdf")}
      <div class="grid2">
        <label class="field"><span>ক্রম (ছোট সংখ্যা আগে)</span><input type="number" name="sort" value="${esc(b.sort ?? 100)}"></label>
        <div style="display:grid;gap:10px;align-self:end">
          <label class="check"><input type="checkbox" name="featured" ${b.featured ? "checked" : ""}> “আজকের বই” হিসেবে হোমপেজে দেখাও</label>
          <label class="check"><input type="checkbox" name="published" ${b.published ? "checked" : ""}> প্রকাশ করো</label>
        </div>
      </div>
      <div class="savebar">
        ${b.slug ? `<a class="btn btn-ghost" href="../book.html?b=${encodeURIComponent(b.slug)}" target="_blank">দেখুন ↗</a>` : ""}
        <button class="btn btn-maroon" type="submit">💾 সেভ করো</button>
      </div>
    </form>`;
  const f = $("#f");
  $("#back").onclick = () => go("books");
  $("#addLaw").onclick = () => $("#laws").insertAdjacentHTML("beforeend", lawItem({}));
  $("#addAff").onclick = () => $("#aff").insertAdjacentHTML("beforeend", affItem({}));
  bindForm(f);

  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f));
    const rows = (sel, keys) => $$(`${sel} .rep-item`).map((el) => Object.fromEntries(keys.map((k) => [k, $(`[data-k="${k}"]`, el).value.trim()])));
    const rec = {
      title: v.title.trim(),
      title_bn: v.title_bn.trim(),
      author: v.author.trim(),
      slug: slugify(v.slug) || slugify(v.title) || "book-" + Date.now().toString(36),
      hook: v.hook.trim(),
      description: v.description.trim(),
      cover_url: v.cover_url.trim(),
      laws: rows("#laws", ["no", "name", "line"]).filter((l) => l.name || l.line),
      affiliate: rows("#aff", ["store", "url"]).filter((a) => a.url),
      pdf_url: v.pdf_url.trim(),
      sort: Number(v.sort) || 100,
      featured: !!v.featured,
      published: !!v.published,
    };
    // “আজকের বই” একটাই থাকবে
    if (rec.featured) await sb.from("books").update({ featured: false }).neq("slug", rec.slug);
    await save("books", b.id, rec, (saved) => bookForm(saved));
  };
}

const lawItem = (l = {}) => `
  <div class="rep-item">
    <input type="text" data-k="no" value="${esc(l.no || "")}" placeholder="04" class="input">
    <input type="text" data-k="name" value="${esc(l.name || "")}" placeholder="Always Say Less Than Necessary" class="input">
    <input type="text" data-k="line" value="${esc(l.line || "")}" placeholder="বাংলায় এক লাইনে" class="input">
    <button type="button" class="x" data-remove aria-label="মুছুন">✕</button>
  </div>`;

const affItem = (a = {}) => `
  <div class="rep-item">
    <input type="text" data-k="store" value="${esc(a.store || "")}" placeholder="Amazon" class="input">
    <input type="url" data-k="url" value="${esc(a.url || "")}" placeholder="https://amzn.to/…" class="input">
    <button type="button" class="x" data-remove aria-label="মুছুন">✕</button>
  </div>`;

// ── দোকান: বিক্রির জিনিস আর affiliate ───────────────────────────
// ফিচার বই (কঠিন কথা বলার ৫০টা প্রশ্ন) DB-তে নেই, সাইটের কোডে আছে (assets/js/kothin.js)।
// ডাউনলোড গোনা হয় track.js-এর ক্লিক থেকে: সরাসরি PDF লিংক, আর FB/Insta-তে WhatsApp-এর লিংক (তার ভেতরেও PDF-এর ঠিকানা থাকে)
const FEATURE_PDF = "kothin-kotha-50-proshno.pdf";

async function featureDownloads() {
  const base = () => sb.from("events").select("id", { count: "exact", head: true }).eq("kind", "click").ilike("href", `%${FEATURE_PDF}%`);
  const week = new Date(Date.now() - 7 * 864e5).toISOString();
  const day = new Date(Date.now() - 864e5).toISOString();
  const [all, wa, w, d] = await Promise.all([
    base(),
    base().ilike("href", "%wa.me%"),
    base().gte("created_at", week),
    base().gte("created_at", day),
  ]);
  if (all.error) return `<p class="empty">ডাউনলোডের হিসাব আনা গেল না (${esc(all.error.message)})</p>`;
  return `
    <div class="kpis kpis-4">
      <div class="kpi"><span>মোট ডাউনলোড</span><b>${num(all.count)}</b></div>
      <div class="kpi"><span>WhatsApp দিয়ে (FB/Insta)</span><b>${num(wa.count)}</b></div>
      <div class="kpi"><span>গত ৭ দিনে</span><b>${num(w.count)}</b></div>
      <div class="kpi"><span>আজ (২৪ ঘণ্টা)</span><b>${num(d.count)}</b></div>
    </div>`;
}

async function productsList() {
  main().innerHTML = `<div class="skeleton"></div>`;
  const [{ data, error }, dl] = await Promise.all([
    sb.from("products").select("id,slug,title,kind,price,buy_url,published,cover_url").order("sort"),
    featureDownloads(),
  ]);
  if (error) return fail(error, true);
  main().innerHTML = `
    <div class="top">
      <h1>দোকান</h1>
      <div class="acts">
        <button class="btn btn-ghost btn-sm" data-new="affiliate">+ affiliate জিনিস</button>
        <button class="btn btn-maroon btn-sm" data-new="ebook">+ নতুন প্রোডাক্ট</button>
      </div>
    </div>
    <div class="notice" style="margin-bottom:18px">
      পেমেন্ট আর ফাইল পাঠানো হয় <b>কেনার লিংক</b>-এর প্ল্যাটফর্মে — Razorpay Payment Page, Instamojo, Cosmofeed বা Gumroad-এ প্রোডাক্ট বানিয়ে
      PDF আপলোড করো, তারপর সেই লিংকটা এখানে বসাও। ক্রেতা টাকা দিলেই ইমেইলে ফাইল পেয়ে যাবে।
    </div>
    <div class="panel">
      <h2>ফিচার বই · দোকানের ওপরে</h2>
      <div class="row row-feature">
        <div class="ph"></div>
        <div>
          <h3>কঠিন কথা বলার ৫০টা প্রশ্ন</h3>
          <div class="sub"><span class="status on">প্রকাশিত</span><span>ই-বুক · ফ্রি (চাকা)</span><span>/${esc(FEATURE_PDF)}</span></div>
        </div>
        <div class="acts"><a class="btn btn-ghost btn-sm" href="../shop#kothin-kotha" target="_blank">দেখুন</a></div>
      </div>
      ${dl}
      <small class="hint">এই বইটা সাইটের কোডে বসানো, তাই এখান থেকে এডিট হয় না। শুধু আসল সাইটের (${esc(new URL(CONFIG.siteUrl).hostname)}) ডাউনলোড গোনা হয়, admin-এর নিজেরটা নয়।</small>
    </div>
    <h2 class="section-h">অন্য প্রোডাক্ট</h2>
    <div class="table">${data.map((p) => row(p, "product")).join("") || `<p class="empty">এখনো অন্য কোনো প্রোডাক্ট নেই — ওপরের বোতাম দিয়ে যোগ করো</p>`}</div>`;
  $$("[data-new]").forEach((b) => (b.onclick = () => productForm({ kind: b.dataset.new, published: true })));
  bindRows("products", productForm);
}

async function productForm(p = {}) {
  const aff = p.kind === "affiliate";
  main().innerHTML = `
    <div class="top"><h1>${p.id ? "প্রোডাক্ট এডিট" : aff ? "নতুন affiliate জিনিস" : "নতুন প্রোডাক্ট"}</h1><button class="btn btn-ghost btn-sm" id="back">← তালিকায় ফিরুন</button></div>
    <form class="form" id="f">
      <div class="grid2">
        <label class="field"><span>ধরন</span>
          <select name="kind">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}"${k === p.kind ? " selected" : ""}>${l}${k === "affiliate" ? " (অন্যের দোকানের লিংক)" : ""}</option>`).join("")}</select>
        </label>
        <label class="field"><span>Slug</span><input type="text" name="slug" value="${esc(p.slug || "")}" placeholder="48-laws-notes"><small>ফাঁকা রাখলে নিজে থেকে তৈরি হবে</small></label>
      </div>
      <label class="field"><span>নাম</span><input type="text" name="title" required value="${esc(p.title || "")}" placeholder="৪৮ নিয়মের বাংলা নোটস"></label>
      <label class="field"><span>এক লাইনে (কার্ডে দেখায়)</span><input type="text" name="subtitle" value="${esc(p.subtitle || "")}" placeholder="পুরো বইটা ==৪০ পাতায়==, বাংলায়"></label>
      <label class="field"><span>বিবরণ</span><textarea name="description" rows="6">${esc(p.description || "")}</textarea><small>ফাঁকা লাইন = নতুন অনুচ্ছেদ · <code>==শব্দ==</code> হাইলাইট · <code>**শব্দ**</code> মোটা</small></label>
      ${uploadField("cover_url", "কভার ছবি (৪:৫; ফাঁকা রাখলে মেরুন মলাট)", p.cover_url, "products")}
      <div class="grid2">
        <label class="field"><span>দাম (₹)</span><input type="number" name="price" min="0" value="${esc(p.price ?? 0)}"><small>০ = ফ্রি · affiliate-এ ০ দিলে দাম দেখাবে না</small></label>
        <label class="field"><span>আসল দাম (₹, কেটে দেখাবে)</span><input type="number" name="mrp" min="0" value="${esc(p.mrp ?? 0)}"><small>ছাড় না থাকলে ০</small></label>
        <label class="field"><span>ফরম্যাট</span><input type="text" name="format" value="${esc(p.format || "")}" placeholder="PDF · ৪২ পাতা · বাংলা"></label>
        <label class="field"><span>দোকানের নাম (affiliate হলে)</span><input type="text" name="store" value="${esc(p.store || "")}" placeholder="Amazon"></label>
      </div>
      <label class="field"><span>কেনার লিংক</span><input type="url" name="buy_url" value="${esc(p.buy_url || "")}" placeholder="https://rzp.io/l/… অথবা https://amzn.to/…"><small>নিজের জিনিস: Razorpay / Instamojo / Cosmofeed / Gumroad-এর পেমেন্ট লিংক · affiliate: দোকানের affiliate লিংক</small></label>
      ${uploadField("preview_url", "ফ্রি স্যাম্পল PDF (প্রথম কয়েক পাতা — পুরো ফাইল এখানে দিও না, এটা সবাই দেখতে পায়)", p.preview_url, "samples", "application/pdf")}
      <label class="field"><span>ভেতরে যা আছে (এক লাইনে একটা)</span><textarea name="includes" rows="4" placeholder="৪৮টা নিয়ম, প্রতিটা এক পাতায়&#10;প্রতিটা নিয়মের বাংলা উদাহরণ&#10;প্রিন্ট করার মতো চেকলিস্ট">${esc((p.includes || []).join("\n"))}</textarea></label>
      <div class="grid2">
        <label class="field"><span>ক্রম (ছোট সংখ্যা আগে)</span><input type="number" name="sort" value="${esc(p.sort ?? 100)}"></label>
        <label class="check" style="align-self:end;padding-bottom:12px"><input type="checkbox" name="published" ${p.published ? "checked" : ""}> প্রকাশ করো</label>
      </div>
      <div class="savebar">
        ${p.slug ? `<a class="btn btn-ghost" href="../product.html?p=${encodeURIComponent(p.slug)}" target="_blank">দেখুন ↗</a>` : ""}
        <button class="btn btn-maroon" type="submit">💾 সেভ করো</button>
      </div>
    </form>`;
  const f = $("#f");
  $("#back").onclick = () => go("products");
  bindForm(f);
  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f));
    const rec = {
      kind: v.kind,
      title: v.title.trim(),
      slug: slugify(v.slug) || slugify(v.title) || "item-" + Date.now().toString(36),
      subtitle: v.subtitle.trim(),
      description: v.description.trim(),
      cover_url: v.cover_url.trim(),
      price: Math.max(0, Math.round(Number(v.price) || 0)),
      mrp: Math.max(0, Math.round(Number(v.mrp) || 0)),
      format: v.format.trim(),
      store: v.store.trim(),
      buy_url: v.buy_url.trim(),
      preview_url: v.preview_url.trim(),
      includes: v.includes.split("\n").map((x) => x.trim()).filter(Boolean),
      sort: Number(v.sort) || 100,
      published: !!v.published,
    };
    await save("products", p.id, rec, (saved) => productForm(saved));
  };
}

// ── যোগাযোগ ফর্মের মেসেজ ───────────────────────────
async function messagesList() {
  main().innerHTML = `<div class="skeleton"></div>`;
  const { data, error } = await sb.from("messages").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) return fail(error, true);
  const when = (t) => new Date(t).toLocaleString("bn-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const reply = (c) => (/@/.test(c) ? `mailto:${c}` : `https://wa.me/${c.replace(/[^\d]/g, "")}`);
  const open = data.filter((m) => !m.done).length;
  main().innerHTML = `
    <div class="top"><h1>মেসেজ</h1><span>${open ? `${num(open)}টা উত্তর বাকি` : "সব উত্তর দেওয়া হয়েছে ✓"}</span></div>
    <div class="msgs">
      ${data.map((m) => `
        <div class="panel msg${m.done ? " done" : ""}">
          <div class="msg-head">
            <b>${esc(m.name)}</b>
            <a href="${esc(reply(m.contact))}" target="_blank" rel="noopener">${esc(m.contact)}</a>
            <span class="status ${m.done ? "on" : "off"}">${esc(m.topic || "")}</span>
            <small>${when(m.created_at)}</small>
          </div>
          <p>${esc(m.body).replace(/\n/g, "<br>")}</p>
          <div class="acts">
            <button class="btn btn-ghost btn-sm" data-done="${m.id}" data-v="${m.done ? "" : "1"}">${m.done ? "↺ আবার খোলো" : "✓ উত্তর দেওয়া হয়েছে"}</button>
            <button class="btn btn-danger btn-sm" data-delmsg="${m.id}">মুছুন</button>
          </div>
        </div>`).join("") || `<p class="empty">এখনো কোনো মেসেজ আসেনি</p>`}
    </div>`;
  $$("[data-done]").forEach((b) => (b.onclick = async () => {
    const { error } = await sb.from("messages").update({ done: !!b.dataset.v }).eq("id", b.dataset.done);
    error ? fail(error) : go("messages");
  }));
  $$("[data-delmsg]").forEach((b) => (b.onclick = async () => {
    if (!confirm("মেসেজটা মুছে ফেলবে?")) return;
    const { error } = await sb.from("messages").delete().eq("id", b.dataset.delmsg);
    error ? fail(error) : go("messages");
  }));
}

// ── চা খাওয়ানো (Razorpay webhook → donations) ───────────────────────────
async function donationsList() {
  main().innerHTML = `<div class="skeleton"></div>`;
  const { data, error } = await sb.from("donations").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) return fail(error, true);
  const when = (t) => new Date(t).toLocaleString("bn-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const ok = data.filter((d) => d.status === "captured");
  const total = ok.reduce((n, d) => n + d.amount, 0);
  main().innerHTML = `
    <div class="top"><h1>চা</h1><span>${num(ok.length)} বার · মোট ${price(total)}</span></div>
    <div class="msgs">
      ${data.map((d) => `
        <div class="panel msg${d.status === "captured" ? "" : " done"}">
          <div class="msg-head">
            <b>${price(d.amount)}</b>
            <span class="status ${d.status === "captured" ? "on" : "off"}">${d.status === "captured" ? "পেয়েছি" : "ব্যর্থ"}</span>
            <span>${esc(d.method)}</span>
            ${d.email ? `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>` : ""}
            ${d.contact ? `<span>${esc(d.contact)}</span>` : ""}
            <small>${when(d.created_at)}</small>
          </div>
          ${d.items ? `<p>${esc(d.items)}</p>` : ""}
          <p><small>${esc(d.payment_id)}</small></p>
        </div>`).join("") || `<p class="empty">এখনো কেউ চা খাওয়াননি</p>`}
    </div>`;
}

// ── সেটিংস ───────────────────────────
async function settingsForm() {
  const { data } = await sb.from("settings").select("value").eq("key", "site").maybeSingle();
  const v = { ...SEED.settings, ...(data?.value || {}) };
  const sp = { ...SEED.settings.support, ...(v.support || {}) };
  const bz = { ...SEED.settings.business, ...(v.business || {}) };
  main().innerHTML = `
    <div class="top"><h1>সেটিংস</h1></div>
    <form class="form" id="f">
      <label class="field"><span>ট্যাগলাইন</span><input type="text" name="tagline" value="${esc(v.tagline)}"></label>
      <label class="field"><span>হোমপেজের পরিচিতি</span><textarea name="intro">${esc(v.intro)}</textarea></label>
      <div class="grid2">
        <label class="field"><span>Instagram লিংক</span><input type="url" name="instagram" value="${esc(v.instagram)}"></label>
        <label class="field"><span>YouTube লিংক</span><input type="url" name="youtube" value="${esc(v.youtube)}"></label>
        <label class="field"><span>Facebook লিংক</span><input type="url" name="facebook" value="${esc(v.facebook)}"></label>
        <label class="field"><span>ফলোয়ার সংখ্যা (হোমপেজে)</span><input type="text" name="followers" value="${esc(v.followers)}"></label>
      </div>
      <h2 style="font-size:1.4rem;margin-top:10px">🏪 ব্যবসার তথ্য (যোগাযোগ, Privacy, Terms, Refund পাতায় দেখায়)</h2>
      <small style="color:var(--muted)">Razorpay / Instamojo-র মতো পেমেন্ট গেটওয়ে চালু করতে এগুলো সাইটে থাকা দরকার।</small>
      <div class="grid2">
        <label class="field"><span>ব্যবসার নাম (KYC-র নামের সঙ্গে মিলিয়ে)</span><input type="text" name="b_name" value="${esc(bz.name)}"></label>
        <label class="field"><span>মালিকের নাম</span><input type="text" name="b_owner" value="${esc(bz.owner)}"></label>
        <label class="field"><span>সাপোর্ট ইমেইল</span><input type="email" name="b_email" value="${esc(bz.email)}" placeholder="support@suslessons.in"></label>
        <label class="field"><span>ফোন</span><input type="text" name="b_phone" value="${esc(bz.phone)}" placeholder="+91 98xxxxxxx"></label>
        <label class="field"><span>WhatsApp নম্বর</span><input type="text" name="b_whatsapp" value="${esc(bz.whatsapp)}" placeholder="+91 98xxxxxxx"></label>
        <label class="field"><span>শহর (Terms-এ আদালতের এক্তিয়ার)</span><input type="text" name="b_city" value="${esc(bz.city)}" placeholder="Kolkata, West Bengal"></label>
        <label class="field"><span>কাজের সময়</span><input type="text" name="b_hours" value="${esc(bz.hours)}"></label>
        <label class="field"><span>রিফান্ড চাওয়ার সময়সীমা (দিন)</span><input type="number" name="b_refundDays" min="1" value="${esc(bz.refundDays)}"></label>
      </div>
      <label class="field"><span>ঠিকানা</span><textarea name="b_address" rows="3">${esc(bz.address)}</textarea></label>

      <h2 style="font-size:1.4rem;margin-top:10px">☕ চা খাওয়ান (ফ্রি বই ডাউনলোডের সময়)</h2>
      <label class="check"><input type="checkbox" name="s_enabled" ${sp.enabled ? "checked" : ""}> চালু রাখো</label>
      <div class="grid2">
        <label class="field"><span>শিরোনাম</span><input type="text" name="s_title" value="${esc(sp.title)}"></label>
        <label class="field"><span>UPI ID</span><input type="text" name="s_upi" value="${esc(sp.upi)}" placeholder="name@upi"></label>
        <label class="field"><span>UPI-তে দেখানো নাম</span><input type="text" name="s_upiName" value="${esc(sp.upiName)}"></label>
        <label class="field"><span>বিকাশ নম্বর</span><input type="text" name="s_bkash" value="${esc(sp.bkash)}"></label>
      </div>
      <label class="field"><span>লেখা</span><textarea name="s_text">${esc(sp.text)}</textarea></label>
      <label class="field"><span>অন্য পেমেন্ট লিংক (Razorpay / Buy Me a Coffee ইত্যাদি)</span><input type="url" name="s_link" value="${esc(sp.link)}"></label>
      <div class="savebar"><button class="btn btn-maroon" type="submit">💾 সেভ করো</button></div>
    </form>`;
  const f = $("#f");
  f.onsubmit = async (e) => {
    e.preventDefault();
    const x = Object.fromEntries(new FormData(f));
    const value = {
      tagline: x.tagline.trim(),
      intro: x.intro.trim(),
      instagram: x.instagram.trim(),
      youtube: x.youtube.trim(),
      facebook: x.facebook.trim(),
      followers: x.followers.trim(),
      business: {
        name: x.b_name.trim() || "sus.lessons", owner: x.b_owner.trim(), email: x.b_email.trim(), phone: x.b_phone.trim(),
        whatsapp: x.b_whatsapp.trim(), city: x.b_city.trim(), hours: x.b_hours.trim(), address: x.b_address.trim(),
        refundDays: Math.max(1, Number(x.b_refundDays) || 7),
      },
      support: { enabled: !!x.s_enabled, title: x.s_title.trim(), text: x.s_text.trim(), upi: x.s_upi.trim(), upiName: x.s_upiName.trim(), bkash: x.s_bkash.trim(), link: x.s_link.trim() },
    };
    const { error } = await sb.from("settings").upsert({ key: "site", value });
    error ? fail(error) : toast("সেভ হয়েছে ✓");
  };
}

// ── শেয়ার করা টুকরো ───────────────────────────
function uploadField(name, label, value = "", folder, accept = "image/*") {
  const isImg = accept.startsWith("image");
  return `
    <div class="field">
      <span>${label}</span>
      <div class="upload">
        <input type="text" name="${name}" value="${esc(value || "")}" placeholder="লিংক দাও অথবা আপলোড করো" class="input">
        <label class="btn btn-ghost btn-sm">⬆ আপলোড<input type="file" accept="${accept}" data-up="${folder}"></label>
      </div>
      ${isImg ? `<img class="thumb" src="${esc(src(value || ""))}" alt="" ${value ? "" : "hidden"}>` : ""}
    </div>`;
}

function bindForm(f) {
  f.addEventListener("click", (e) => {
    const x = e.target.closest("[data-remove]");
    if (x) x.closest(".rep-item").remove();
  });
  f.addEventListener("change", async (e) => {
    const inp = e.target.closest("input[type=file][data-up]");
    if (!inp || !inp.files[0]) return;
    const file = inp.files[0];
    const box = inp.closest(".upload");
    const target = $("input[type=text]", box);
    const label = inp.parentElement;
    label.firstChild.textContent = "⏳ আপলোড হচ্ছে…";
    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${inp.dataset.up}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await sb.storage.from(CONFIG.mediaBucket).upload(path, file, { contentType: file.type, upsert: false });
    label.firstChild.textContent = "⬆ আপলোড";
    inp.value = "";
    if (error) return fail(error);
    const url = sb.storage.from(CONFIG.mediaBucket).getPublicUrl(path).data.publicUrl;
    target.value = url;
    const img = box.parentElement.querySelector("img") || box.closest(".rep-item")?.querySelector("img");
    if (img) { img.src = url; img.hidden = false; img.style.visibility = ""; }
    toast("আপলোড হয়েছে ✓");
  });
}

async function save(table, id, rec, after) {
  const r = id ? sb.from(table).update(rec).eq("id", id) : sb.from(table).insert(rec);
  const { data, error } = await r.select().single();
  if (error) return fail(error);
  toast("সেভ হয়েছে ✓");
  after(data);
}

function fail(error, page = false) {
  console.error(error);
  const m = error.message || String(error);
  // নতুন টেবিল এখনো তৈরি হয়নি
  if (page && /does not exist|schema cache/.test(m))
    return (main().innerHTML = `<div class="notice">এই অংশের টেবিল এখনো তৈরি হয়নি।<br>Supabase SQL Editor-এ আবার <code>supabase/schema.sql</code> পুরোটা Run করো।</div>`);
  toast(/duplicate key/.test(m) ? "এই slug আগে থেকেই আছে — অন্য slug দাও" : "সমস্যা: " + m);
}

// নমুনা লেখা DB-তে তোলো (প্রথমবারের জন্য)
async function importSeed() {
  if (!confirm("নমুনা ৫টা বই আর ৪টা গল্প ডাটাবেসে যোগ করব?")) return;
  const strip = ({ id, ...rest }) => rest;
  let { error } = await sb.from("books").upsert(SEED.books.map(strip), { onConflict: "slug" });
  if (!error) ({ error } = await sb.from("stories").upsert(SEED.stories.map(strip), { onConflict: "slug" }));
  if (!error) ({ error } = await sb.from("settings").upsert({ key: "site", value: SEED.settings }));
  if (error) return fail(error);
  toast("নমুনা লেখা যোগ হয়েছে ✓");
  go("stories");
}
