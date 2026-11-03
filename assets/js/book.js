import { getSettings, getBook, listStories } from "./data.js?v=202611031510";
import "./track.js?v=202611031510";
import { $, esc, inline, safeUrl, chrome, bookMock, lawTag, storyCard, endCard, supportDialog, toast, setMeta } from "./ui.js?v=202611031510";

const slug = new URLSearchParams(location.search).get("b") || "";
const settings = await getSettings();
chrome(settings);

const book = slug ? await getBook(slug) : null;
const main = $("#book");

if (!book) {
  main.innerHTML = `<div class="empty"><h2>বইটা খুঁজে পেলাম না</h2><p><a class="section-link" href="books.html">বইয়ের তাকে ফিরুন →</a></p></div>`;
} else {
  setMeta(book.title, book.description);
  const stories = await listStories({ bookSlug: book.slug });
  const buy = book.affiliate || [];
  const sp = settings.support || {};

  main.innerHTML = `
    <section class="book-hero">
      ${bookMock(book, "lg")}
      <div>
        <p class="bc-author">${esc(book.author)}</p>
        <h1>${esc(book.title)}</h1>
        ${book.title_bn ? `<p class="bn-title">${esc(book.title_bn)}</p>` : ""}
        ${book.hook ? `<p class="hook">${inline(book.hook)}</p>` : ""}
        <p class="lede">${inline(book.description)}</p>
        ${(book.laws || []).length ? `<ul class="laws">${book.laws.map((l) => `<li>${lawTag(l.no)}<b>${esc(l.name)}</b><span>${esc(l.line)}</span></li>`).join("")}</ul>` : ""}
        ${book.pdf_url ? `
          <div class="free-box">
            <p>এই বইটা বিনামূল্যে — PDF নামিয়ে নিন।</p>
            <button class="btn btn-maroon" id="getFree">⬇ বইটা নিন</button>
          </div>` : ""}
        ${buy.length ? `<div class="buy-row">${buy.map((a) => `<a class="btn btn-gold" href="${safeUrl(a.url)}" target="_blank" rel="sponsored noopener">${esc(a.store)}-এ কিনুন ↗</a>`).join("")}</div>` : ""}
      </div>
    </section>

    ${stories.length ? `
      <section class="section">
        <div class="section-head"><div><span class="eyebrow">Stories from this book</span><h2>এই বইয়ের গল্প</h2></div></div>
        <div class="story-grid">${stories.map(storyCard).join("")}</div>
      </section>` : ""}

    ${endCard("বই পড়ুন, গল্প দেখুন — ==শেষ লাইনটা মনে রাখুন।==", settings)}`;

  $("#getFree")?.addEventListener("click", () => {
    // চা খাওয়ানোর সুযোগ দাও, কিন্তু ডাউনলোড কখনো আটকে রেখো না
    if (sp.enabled && (sp.upi || sp.bkash || sp.link)) supportDialog(settings, { title: book.title_bn || book.title, download: book.pdf_url });
    else {
      const a = Object.assign(document.createElement("a"), { href: book.pdf_url, download: "" });
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast("বইটা নামছে… 📥");
    }
  });
}
