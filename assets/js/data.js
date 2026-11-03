// ডেটা লেয়ার — Supabase থাকলে সেখান থেকে, না থাকলে seed.js থেকে
import { CONFIG } from "./config.js?v=202611031731";
import { SEED } from "./seed.js?v=202611031731";

export const live = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase);
export const sb = live ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey) : null;

const byDate = (a, b) => String(b.published_at || "").localeCompare(String(a.published_at || ""));

// রিল/ভিডিওর স্ক্রিনশট সাইটে দেখানো হয় না — পুরোনো লেখায় থাকলেও বাদ
const isVideoShot = (u = "") => /assets\/img\/(scene|thumb)-\d+\.jpg/i.test(u);
const clean = (s) =>
  s && {
    ...s,
    cover_url: isVideoShot(s.cover_url) ? "" : s.cover_url,
    body: String(s.body || "")
      .split(/\n\s*\n/)
      .filter((b) => !(/^!\[.*?\]\((.+?)\)$/.test(b.trim()) && isVideoShot(b)))
      .join("\n\n"),
  };

async function q(run, fallback) {
  if (!live) return fallback();
  try {
    const { data, error } = await run();
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn("[sus.lessons] Supabase থেকে আনা গেল না, নমুনা দেখাচ্ছি:", e.message || e);
    return fallback();
  }
}

// শুধু লেখা গল্প — স্লাইড গল্প সাইট থেকে সরানো হয়েছে
export async function listStories({ limit, bookSlug } = {}) {
  const rows = await q(
    () => {
      let r = sb.from("stories").select("*").eq("published", true).eq("type", "blog").order("published_at", { ascending: false });
      if (bookSlug) r = r.eq("book_slug", bookSlug);
      if (limit) r = r.limit(limit);
      return r;
    },
    () => {
      let s = SEED.stories.filter((x) => x.published && x.type === "blog").sort(byDate);
      if (bookSlug) s = s.filter((x) => x.book_slug === bookSlug);
      return limit ? s.slice(0, limit) : s;
    }
  );
  return (rows || []).map(clean);
}

export async function getStory(slug) {
  const row = await q(
    () => sb.from("stories").select("*").eq("slug", slug).eq("published", true).eq("type", "blog").maybeSingle(),
    () => SEED.stories.find((x) => x.slug === slug && x.published && x.type === "blog") || null
  );
  return clean(row);
}

export function listBooks({ featured, free } = {}) {
  return q(
    () => {
      let r = sb.from("books").select("*").eq("published", true).order("sort", { ascending: true });
      if (featured) r = r.eq("featured", true);
      if (free) r = r.neq("pdf_url", "");
      return r;
    },
    () => {
      let b = SEED.books.filter((x) => x.published).sort((a, c) => a.sort - c.sort);
      if (featured) b = b.filter((x) => x.featured);
      if (free) b = b.filter((x) => x.pdf_url);
      return b;
    }
  );
}

export function getBook(slug) {
  return q(
    () => sb.from("books").select("*").eq("slug", slug).eq("published", true).maybeSingle(),
    () => SEED.books.find((x) => x.slug === slug && x.published) || null
  );
}

export async function getSettings() {
  const row = await q(
    () => sb.from("settings").select("value").eq("key", "site").maybeSingle(),
    () => ({ value: SEED.settings })
  );
  // DB-তে যা নেই, সেটা seed থেকে নাও
  const v = row?.value || {};
  return {
    ...SEED.settings,
    ...v,
    support: { ...SEED.settings.support, ...(v.support || {}) },
    business: { ...SEED.settings.business, ...(v.business || {}) },
  };
}

export function listProducts({ kind } = {}) {
  return q(
    () => {
      let r = sb.from("products").select("*").eq("published", true).order("sort", { ascending: true });
      if (kind) r = r.eq("kind", kind);
      return r;
    },
    () => {
      let p = SEED.products.filter((x) => x.published).sort((a, c) => a.sort - c.sort);
      return kind ? p.filter((x) => x.kind === kind) : p;
    }
  );
}

export function getProduct(slug) {
  return q(
    () => sb.from("products").select("*").eq("slug", slug).eq("published", true).maybeSingle(),
    () => SEED.products.find((x) => x.slug === slug && x.published) || null
  );
}

// যোগাযোগ ফর্ম → messages টেবিল (Supabase না থাকলে error ফেরত দেয়)
export async function sendMessage(msg) {
  if (!live) return { error: { message: "offline" } };
  const { error } = await sb.from("messages").insert(msg);
  return { error };
}
