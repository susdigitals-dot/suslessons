# sus.lessons — suslessons.in

A static site (GitHub Pages) with Supabase as the database and admin backend.

| Page | What it does |
|---|---|
| `index.html` | Home: hero, new stories, sliding stories, "আজকের বই" (book of the day), bookshelf |
| `stories.html` / `story.html?s=slug` | Written stories and sliding (carousel) stories |
| `books.html` / `book.html?b=slug` | Book recommendations with affiliate links and free PDFs |
| `shop.html` / `product.html?p=slug` | Shop: e-books, notes, guides, checklists (sold via payment links) + recommended affiliate items |
| `contact.html` | Contact details + form (messages land in admin → মেসেজ) |
| `privacy.html`, `terms.html`, `refund.html`, `disclosure.html` | Legal pages; business name/email/address come from admin → সেটিংস |
| `admin/` | Admin panel for adding/editing stories, slides, books and settings |

## Connect it (one-time setup)

1. **Supabase**: open SQL Editor, paste and Run [`supabase/schema.sql`](supabase/schema.sql).
   - Authentication → Users → Add user (your email + password). That email must be in the `admins` table (the schema adds `maitys8289@gmail.com`).
   - Authentication → URL Configuration → Site URL `https://suslessons.in`, Redirect URL `https://suslessons.in/admin/`.
   - Project Settings → API → copy the Project URL and anon key into [`assets/js/config.js`](assets/js/config.js).
2. **GitHub**: push this folder to a repo, then Settings → Pages → Deploy from branch `main` / root. Custom domain: `suslessons.in`, then turn on Enforce HTTPS.
3. **Domain DNS** (at your domain registrar):
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `<github-username>.github.io`
4. Open `https://suslessons.in/admin/`, log in, and click "নমুনা গল্প আর বই ইমপোর্ট করো" to import the sample content (or write your own).

Until Supabase is connected, the site shows the sample content from `assets/js/seed.js`.

Local preview: `python -m http.server 5500` (from this folder).

Before each push, run `python tools/bump.py`. It stamps a new `?v=` on every CSS/JS link and import, so visitors get the new files right away instead of a cached copy (GitHub Pages lets browsers cache for 10 minutes).
