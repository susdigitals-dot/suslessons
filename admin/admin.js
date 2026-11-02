// sus.lessons admin — গল্প, স্লাইড গল্প, বই আর সেটিংস লেখার জায়গা
import { CONFIG } from "../assets/js/config.js";
import { SEED } from "../assets/js/seed.js";
import { live, sb } from "../assets/js/data.js";
import { $, $$, esc, avatar, wordmark, toast } from "../assets/js/ui.js";

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
  ({ dashboard, stories: storiesList, books: booksList, settings: settingsForm })[v]();
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
  liveCh = sb.channel("live", { config: { presence: { key: "admin-" + Math.random().toString(36).slice(2, 8) } } });
  liveCh.on("presence", { event: "sync" }, () => {
    const people = Object.values(liveCh.presenceState()).map((x) => x[0]).filter((x) => x?.path);
    const byPage = {};
    people.forEach((x) => (byPage[x.path] = (byPage[x.path] || 0) + 1));
    if (!$("#liveNum")) return;
    $("#liveNum").textContent = num(people.length);
    $("#livePages").innerHTML = Object.entries(byPage)
      .sort((a, b) => b[1] - a[1])
      .map(([p, n]) => `<li><span>${esc(pageName(p))}</span><b>${num(n)}</b></li>`).join("");
  }).subscribe();

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
  const { data, error } = await sb.from("stories").select("id,slug,title,type,published,published_at,cover_url,slides").order("published_at", { ascending: false });
  if (error) return fail(error);
  main().innerHTML = `
    <div class="top">
      <h1>গল্প</h1>
      <div class="acts">
        <button class="btn btn-ghost btn-sm" data-new="slides">+ স্লাইড গল্প</button>
        <button class="btn btn-maroon btn-sm" data-new="blog">+ নতুন গল্প</button>
      </div>
    </div>
    ${data.length ? "" : `<div class="mode-banner">এখনো কোনো গল্প নেই। <button class="btn btn-gold btn-sm" id="importSeed">নমুনা গল্প আর বই ইমপোর্ট করো</button></div>`}
    <div class="table">${data.map((s) => row(s, "story")).join("") || `<p class="empty">খালি</p>`}</div>`;
  $$("[data-new]").forEach((b) => (b.onclick = () => storyForm({ type: b.dataset.new })));
  $("#importSeed")?.addEventListener("click", importSeed);
  bindRows("stories", storyForm);
}

function row(x, kind) {
  const img = x.cover_url || x.slides?.[0]?.image;
  const pub = x.published;
  const view = kind === "story" ? `../story.html?s=${encodeURIComponent(x.slug)}` : `../book.html?b=${encodeURIComponent(x.slug)}`;
  return `
    <div class="row">
      ${img ? `<img src="${esc(src(img))}" alt="">` : `<div class="ph"></div>`}
      <div>
        <h3>${esc((x.title || "").replace(/==|\*\*/g, ""))}</h3>
        <div class="sub">
          <span class="status ${pub ? "on" : "off"}">${pub ? "প্রকাশিত" : "খসড়া"}</span>
          ${kind === "story" ? `<span>${x.type === "slides" ? "স্লাইড" : "লেখা"}</span><span>${esc(x.published_at || "")}</span>` : `<span>${esc(x.author || "")}</span>`}
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
  const isSlides = s.type === "slides";
  main().innerHTML = `
    <div class="top">
      <h1>${s.id ? "গল্প এডিট" : isSlides ? "নতুন স্লাইড গল্প" : "নতুন গল্প"}</h1>
      <button class="btn btn-ghost btn-sm" id="back">← তালিকায় ফিরুন</button>
    </div>
    <form class="form" id="f">
      <div class="grid2">
        <label class="field"><span>ধরন</span>
          <select name="type"><option value="blog"${!isSlides ? " selected" : ""}>লেখা গল্প</option><option value="slides"${isSlides ? " selected" : ""}>স্লাইড গল্প</option></select>
        </label>
        <label class="field"><span>Slug (লিংকের নাম, ইংরেজিতে)</span><input type="text" name="slug" value="${esc(s.slug || "")}" placeholder="boro-biye-boro-dhar"><small>ফাঁকা রাখলে নিজে থেকে তৈরি হবে</small></label>
      </div>
      <label class="field"><span>শিরোনাম</span><input type="text" name="title" required value="${esc(s.title || "")}"><small><code>==শব্দ==</code> দিলে কমলা হাইলাইট হয়</small></label>
      <label class="field"><span>ছোট বিবরণ (কার্ডে দেখায়)</span><textarea name="excerpt">${esc(s.excerpt || "")}</textarea></label>
      <label class="field"><span>শেষ লাইন — আসল শিক্ষা</span><input type="text" name="last_line" value="${esc(s.last_line || "")}"><small>মেরুন এন্ড কার্ডে বড় করে দেখায়। ১–৩টা শব্দ <code>==এভাবে==</code> হাইলাইট করো।</small></label>
      ${uploadField("cover_url", "কভার ছবি", s.cover_url, "covers")}
      <div class="grid2">
        <label class="field"><span>কোন বই থেকে</span>
          <select name="book_slug"><option value="">— কোনোটা না —</option>${(books || []).map((b) => `<option value="${esc(b.slug)}"${b.slug === s.book_slug ? " selected" : ""}>${esc(b.title)}</option>`).join("")}</select>
        </label>
        <label class="field"><span>LAW নম্বর (থাকলে)</span><input type="text" name="law" value="${esc(s.law || "")}" placeholder="04"></label>
      </div>
      <label class="field"><span>ট্যাগ (কমা দিয়ে)</span><input type="text" name="tags" value="${esc((s.tags || []).join(", "))}" placeholder="পরিবার, বাবা"></label>

      <div id="blogPart" ${isSlides ? "hidden" : ""}>
        <label class="field"><span>গল্প</span><textarea class="body" name="body">${esc(s.body || "")}</textarea></label>
        <div class="help" style="margin-top:10px">
          <code>## শিরোনাম</code> · <code>@বাবা: “কথা”</code> কথোপকথন · <code>&gt; লাইন</code> গাঢ় কার্ড ·
          <code>• আজ</code> সময় · <code>~ তিন মাস আগে</code> ফ্ল্যাশব্যাক · <code>![কথা](ছবির-লিংক)</code> ছবি ·
          <code>==শব্দ==</code> হাইলাইট · <code>**শব্দ**</code> মোটা · <code>---</code> বিভাজক · ফাঁকা লাইন = নতুন অনুচ্ছেদ
        </div>
      </div>

      <div id="slidesPart" ${isSlides ? "" : "hidden"}>
        <div class="field"><span>স্লাইডগুলো</span><small>প্রতিটা স্লাইডে একটা ছবি (৪:৫ বা ৯:১৬) আর এক-দুই লাইন। শেষে মেরুন এন্ড কার্ড নিজে থেকে যোগ হয়।</small></div>
        <div class="repeat" id="slides">${(s.slides || []).map(slideItem).join("")}</div>
        <button type="button" class="btn btn-ghost btn-sm add" id="addSlide" style="margin-top:10px">+ স্লাইড যোগ করো</button>
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
  f.type.onchange = () => {
    $("#blogPart").hidden = f.type.value !== "blog";
    $("#slidesPart").hidden = f.type.value !== "slides";
  };
  $("#addSlide").onclick = () => $("#slides").insertAdjacentHTML("beforeend", slideItem({}));
  bindForm(f);

  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f));
    const rec = {
      type: v.type,
      title: v.title.trim(),
      slug: slugify(v.slug) || slugify(v.title) || "story-" + Date.now().toString(36),
      excerpt: v.excerpt.trim(),
      last_line: v.last_line.trim(),
      cover_url: v.cover_url.trim(),
      book_slug: v.book_slug || null,
      law: v.law.trim(),
      tags: v.tags.split(/[,،]/).map((t) => t.trim()).filter(Boolean),
      body: v.body || "",
      slides: $$("#slides .rep-item").map((el) => ({
        image: $('[data-k="image"]', el).value.trim(),
        speaker: $('[data-k="speaker"]', el).value.trim(),
        text: $('[data-k="text"]', el).value.trim(),
      })).filter((x) => x.text || x.image),
      published: !!v.published,
      published_at: v.published_at || null,
    };
    await save("stories", s.id, rec, (saved) => storyForm(saved));
  };
}

function slideItem(sl = {}) {
  return `
    <div class="rep-item slide-item">
      <img src="${esc(src(sl.image || ""))}" alt="" ${sl.image ? "" : 'style="visibility:hidden"'}>
      <div class="upload"><input type="text" data-k="image" value="${esc(sl.image || "")}" placeholder="ছবির লিংক" class="input"><label class="btn btn-ghost btn-sm">⬆ আপলোড<input type="file" accept="image/*" data-up="slides"></label></div>
      <button type="button" class="x" data-remove aria-label="স্লাইড মুছুন">✕</button>
      <input type="text" data-k="speaker" value="${esc(sl.speaker || "")}" placeholder="বক্তা (যেমন: বাবা) — না থাকলে ফাঁকা" class="input full">
      <textarea data-k="text" placeholder="স্লাইডের লেখা — ==হাইলাইট==" class="input full" rows="2">${esc(sl.text || "")}</textarea>
    </div>`;
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

// ── সেটিংস ───────────────────────────
async function settingsForm() {
  const { data } = await sb.from("settings").select("value").eq("key", "site").maybeSingle();
  const v = { ...SEED.settings, ...(data?.value || {}) };
  const sp = { ...SEED.settings.support, ...(v.support || {}) };
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

function fail(error) {
  console.error(error);
  const m = error.message || String(error);
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
