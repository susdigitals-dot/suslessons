import { getSettings, listStories } from "./data.js?v=202611121349";
import "./track.js?v=202611121349";
import { $, esc, chrome, storyCard } from "./ui.js?v=202611121349";

const tag = new URLSearchParams(location.search).get("tag") || "";

const settings = await getSettings();
chrome(settings);

if (tag)
  $("#filters").innerHTML = `<a href="stories.html">All</a><a aria-current="page" href="stories.html?tag=${encodeURIComponent(tag)}">#${esc(tag)}</a>`;

let stories = await listStories();
if (tag) stories = stories.filter((s) => (s.tags || []).includes(tag));

$("#list").innerHTML = stories.length
  ? stories.map(storyCard).join("")
  : `<div class="empty"><h2>এখনো কিছু নেই</h2><p>শীঘ্রই নতুন story আসছে।</p></div>`;
