import { getSettings, listStories, listBooks } from "./data.js";
import { $, inline, esc, safeUrl, chrome, storyCard, slideCard, bookCard, bookMock, endCard, disclosure, lawTag } from "./ui.js";

const settings = await getSettings();
chrome(settings);

$("#heroTitle").innerHTML = inline(settings.tagline).replace(/(শেষ লাইনেই<\/mark>)\s*/, "$1<br>");
$("#heroIntro").textContent = settings.intro;
$("#statFollowers").textContent = settings.followers;

const [blogs, slides, books] = await Promise.all([
  listStories({ type: "blog", limit: 6 }),
  listStories({ type: "slides", limit: 10 }),
  listBooks(),
]);

$("#latest").innerHTML = blogs.length ? blogs.map(storyCard).join("") : `<p class="empty">শীঘ্রই নতুন গল্প আসছে।</p>`;
$("#slidesRail").innerHTML = slides.map(slideCard).join("") || `<p class="empty">শীঘ্রই আসছে।</p>`;
$("#shelf").innerHTML = books.slice(0, 4).map(bookCard).join("");

// আজকের বই — featured বই, না থাকলে প্রথমটা
const b = books.find((x) => x.featured) || books[0];
if (b) {
  const href = `book.html?b=${encodeURIComponent(b.slug)}`;
  $("#todayBook").innerHTML = `
    <div class="today">
      <div class="today-grid">
        <a href="${href}">${bookMock(b, "lg")}</a>
        <div>
          <span class="eyebrow">আজকের বই · ${esc(b.author)}</span>
          <h2>${inline(b.hook || b.title_bn)}</h2>
          <p class="lede">${inline(b.description)}</p>
          ${(b.laws || []).length ? `<ul class="laws">${b.laws.slice(0, 3).map((l) => `<li>${lawTag(l.no)}<b>${esc(l.name)}</b><span>${esc(l.line)}</span></li>`).join("")}</ul>` : ""}
          <div class="buy-row">
            ${(b.affiliate || []).map((a) => `<a class="btn btn-gold" href="${safeUrl(a.url)}" target="_blank" rel="sponsored noopener">${esc(a.store)}-এ কিনুন ↗</a>`).join("")}
            <a class="btn btn-paper" href="${href}">বইটার গল্পগুলো</a>
          </div>
          ${(b.affiliate || []).length ? disclosure() : ""}
        </div>
      </div>
    </div>`;
}

$("#endCard").innerHTML = endCard("আসল কথাটা সবসময় ==শেষ লাইনে।==", settings);
