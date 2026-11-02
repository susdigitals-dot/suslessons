import { getSettings, listStories } from "./data.js";
import "./track.js";
import { $, esc, chrome, storyCard, slideCard, setMeta } from "./ui.js";

const params = new URLSearchParams(location.search);
const type = params.get("type") || "";
const tag = params.get("tag") || "";

const settings = await getSettings();
chrome(settings);

const TYPES = [
  ["", "সব"],
  ["blog", "লেখা গল্প"],
  ["slides", "স্লাইড গল্প"],
];
$("#filters").innerHTML = TYPES.map(
  ([t, l]) => `<a href="stories.html${t ? "?type=" + t : ""}"${t === type && !tag ? ' aria-current="page"' : ""}>${l}</a>`
).join("") + (tag ? `<a aria-current="page" href="stories.html?tag=${encodeURIComponent(tag)}">#${esc(tag)}</a>` : "");

if (type === "slides") {
  $("#pageTitle").textContent = "স্লাইড গল্প";
  $("#pageIntro").textContent = "আঙুল দিয়ে সরান — রিলের মতো, কিন্তু নিজের গতিতে।";
  setMeta("স্লাইড গল্প");
}

let stories = await listStories({ type: type || undefined });
if (tag) stories = stories.filter((s) => (s.tags || []).includes(tag));

const list = $("#list");
if (type === "slides") list.className = "book-grid";
list.innerHTML = stories.length
  ? stories.map(type === "slides" ? slideCard : storyCard).join("")
  : `<div class="empty"><h2>এখনো কিছু নেই</h2><p>শীঘ্রই নতুন গল্প আসছে।</p></div>`;
