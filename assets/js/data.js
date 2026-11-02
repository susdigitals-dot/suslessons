// ডেটা লেয়ার — Supabase থাকলে সেখান থেকে, না থাকলে seed.js থেকে
import { CONFIG } from "./config.js";
import { SEED } from "./seed.js";

export const live = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase);
export const sb = live ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey) : null;

const byDate = (a, b) => String(b.published_at || "").localeCompare(String(a.published_at || ""));

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

export function listStories({ type, limit, bookSlug } = {}) {
  return q(
    () => {
      let r = sb.from("stories").select("*").eq("published", true).order("published_at", { ascending: false });
      if (type) r = r.eq("type", type);
      if (bookSlug) r = r.eq("book_slug", bookSlug);
      if (limit) r = r.limit(limit);
      return r;
    },
    () => {
      let s = SEED.stories.filter((x) => x.published).sort(byDate);
      if (type) s = s.filter((x) => x.type === type);
      if (bookSlug) s = s.filter((x) => x.book_slug === bookSlug);
      return limit ? s.slice(0, limit) : s;
    }
  );
}

export function getStory(slug) {
  return q(
    () => sb.from("stories").select("*").eq("slug", slug).eq("published", true).maybeSingle(),
    () => SEED.stories.find((x) => x.slug === slug && x.published) || null
  );
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
  return { ...SEED.settings, ...v, support: { ...SEED.settings.support, ...(v.support || {}) } };
}
