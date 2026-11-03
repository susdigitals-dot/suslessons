import { getSettings, getStory, getBook, listStories } from "./data.js?v=202611031842";
import "./track.js?v=202611031842";
import { $, esc, inline, safeUrl, chrome, renderBody, fmtDate, lawTag, avatar, endCard, bookMock, storyCard, setMeta } from "./ui.js?v=202611031842";

const slug = new URLSearchParams(location.search).get("s") || "";
const settings = await getSettings();
chrome(settings);

const story = slug ? await getStory(slug) : null;
const main = $("#story");

if (!story) {
  main.innerHTML = `<div class="wrap empty"><h2>গল্পটা খুঁজে পেলাম না</h2><p><a class="section-link" href="stories.html">সব গল্প দেখুন →</a></p></div>`;
} else {
  setMeta(story.title.replace(/==|\*\*/g, ""), story.excerpt);
  const book = story.book_slug ? await getBook(story.book_slug) : null;
  const meta = `<div class="sc-meta">${lawTag(story.law)}${(story.tags || []).map((t) => `<a class="chip" href="stories.html?tag=${encodeURIComponent(t)}" style="text-decoration:none">${esc(t)}</a>`).join("")}</div>`;
  const head = `
    <header class="read-head wrap">
      ${meta}
      <h1>${inline(story.title)}</h1>
      ${story.excerpt ? `<p class="lede">${inline(story.excerpt)}</p>` : ""}
      <div class="byline">${avatar(30)}<span>sus.lessons · ${fmtDate(story.published_at)}</span></div>
    </header>`;

  const callout = book
    ? `<a class="book-callout" href="book.html?b=${encodeURIComponent(book.slug)}">
        ${bookMock(book)}
        <div>
          <span class="eyebrow">From the book${story.law ? " · LAW " + esc(String(story.law).padStart(2, "0")) : ""}</span>
          <h3>${esc(book.title)}</h3>
          <p>${esc(book.author)} · ${esc(book.title_bn || "")}</p>
        </div>
      </a>`
    : "";

  main.innerHTML =
    head +
    (story.cover_url ? `<div class="read-cover"><img src="${safeUrl(story.cover_url)}" alt=""></div>` : "") +
    `<article class="prose">${renderBody(story.body)}</article>` +
    callout +
    `<div class="wrap">${story.last_line ? endCard(story.last_line, settings) : ""}</div>`;

  // আরও গল্প
  const others = (await listStories({ limit: 4 })).filter((s) => s.slug !== story.slug).slice(0, 3);
  if (others.length)
    $("#more").innerHTML = `
      <section class="section" style="padding-top:0">
        <div class="section-head"><div><span class="eyebrow">Read next</span><h2>আরও গল্প</h2></div><a class="section-link" href="stories.html">সব গল্প →</a></div>
        <div class="story-grid">${others.map(storyCard).join("")}</div>
      </section>`;
}

