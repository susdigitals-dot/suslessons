import { getSettings, getStory, getBook, listStories } from "./data.js";
import { $, $$, bn, esc, inline, safeUrl, chrome, renderBody, fmtDate, lawTag, wordmark, avatar, endCard, bookMock, storyCard, setMeta } from "./ui.js";

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

  if (story.type === "slides") {
    main.innerHTML = head + slidesViewer(story) + callout;
    initDeck();
  } else {
    main.innerHTML =
      head +
      (story.cover_url ? `<div class="read-cover"><img src="${safeUrl(story.cover_url)}" alt=""></div>` : "") +
      `<article class="prose">${renderBody(story.body)}</article>` +
      callout +
      `<div class="wrap">${story.last_line ? endCard(story.last_line, settings) : ""}</div>`;
  }

  // আরও গল্প
  const others = (await listStories({ limit: 4 })).filter((s) => s.slug !== story.slug).slice(0, 3);
  if (others.length)
    $("#more").innerHTML = `
      <section class="section" style="padding-top:${story.type === "slides" ? "72px" : "0"}">
        <div class="section-head"><div><span class="eyebrow">Read next</span><h2>আরও গল্প</h2></div><a class="section-link" href="stories.html">সব গল্প →</a></div>
        <div class="story-grid">${others.map(storyCard).join("")}</div>
      </section>`;
}

function slidesViewer(s) {
  const slides = (s.slides || []).map((sl) => {
    const box = `<div class="caption-box">${sl.speaker ? `<span class="speaker">${esc(sl.speaker)}</span>` : ""}<p>${inline(sl.text)}</p></div>`;
    return sl.image
      ? `<div class="slide"><img src="${safeUrl(sl.image)}" alt="" draggable="false">${box}</div>`
      : `<div class="slide text-only">${box}</div>`;
  });
  // শেষ স্লাইড সবসময় মেরুন এন্ড কার্ড
  slides.push(`
    <div class="slide end">
      <div class="end-frame">
        ${wordmark()}
        <p class="end-line">${inline(s.last_line || "এমন আরও গল্পের জন্য")}</p>
        <span class="end-rule"></span>
        <p class="end-sub">এমন আরও গল্পের জন্য</p>
        <a class="follow-pill" href="${safeUrl(settings.instagram)}" target="_blank" rel="noopener">${avatar(30)}<span>ফলো করুন <b>sus.lessons</b></span></a>
      </div>
    </div>`);
  return `
    <section class="viewer">
      <div class="deck" tabindex="0" aria-roledescription="carousel" aria-label="${esc(s.title.replace(/==|\*\*/g, ""))}">
        <span class="deck-pill">${wordmark()}</span>
        <div class="track">${slides.join("")}</div>
        <button class="deck-nav deck-prev" aria-label="আগের স্লাইড">‹</button>
        <button class="deck-nav deck-next" aria-label="পরের স্লাইড">›</button>
      </div>
      <div class="dots">${slides.map((_, i) => `<button aria-label="স্লাইড ${bn(i + 1)}"></button>`).join("")}</div>
      <p class="viewer-hint">← সরান অথবা কিবোর্ডের তীর চাপুন →</p>
    </section>`;
}

function initDeck() {
  const deck = $(".deck");
  const track = $(".track", deck);
  const dots = $$(".dots button");
  const n = dots.length;
  let i = 0;

  const show = (k) => {
    i = Math.max(0, Math.min(n - 1, k));
    track.style.transform = `translateX(${-i * 100}%)`;
    dots.forEach((d, j) => d.setAttribute("aria-current", j === i));
    $(".deck-prev", deck).disabled = i === 0;
    $(".deck-next", deck).disabled = i === n - 1;
    deck.classList.toggle("at-end", i === n - 1);
  };
  $(".deck-prev", deck).onclick = () => show(i - 1);
  $(".deck-next", deck).onclick = () => show(i + 1);
  dots.forEach((d, j) => (d.onclick = () => show(j)));
  deck.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(i + 1);
    if (e.key === "ArrowLeft") show(i - 1);
  });

  // সোয়াইপ
  let x0 = null, dx = 0;
  deck.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    x0 = e.clientX; dx = 0;
    track.style.transition = "none";
    deck.setPointerCapture(e.pointerId);
  });
  deck.addEventListener("pointermove", (e) => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`;
  });
  const end = () => {
    if (x0 === null) return;
    track.style.transition = "";
    const w = deck.clientWidth;
    show(Math.abs(dx) > w * 0.18 ? i + (dx < 0 ? 1 : -1) : i);
    x0 = null;
  };
  deck.addEventListener("pointerup", end);
  deck.addEventListener("pointercancel", end);
  show(0);
}
