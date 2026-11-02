import { getSettings, listBooks } from "./data.js";
import { $, chrome, bookCard, disclosure } from "./ui.js";

const show = new URLSearchParams(location.search).get("show") || "";
const settings = await getSettings();
chrome(settings);

$("#filters").innerHTML = [
  ["", "সব বই"],
  ["buy", "কেনার বই"],
  ["free", "বিনামূল্যে PDF"],
]
  .map(([k, l]) => `<a href="books.html${k ? "?show=" + k : ""}"${k === show ? ' aria-current="page"' : ""}>${l}</a>`)
  .join("");

let books = await listBooks();
if (show === "free") books = books.filter((b) => b.pdf_url);
if (show === "buy") books = books.filter((b) => (b.affiliate || []).length);

$("#shelf").innerHTML = books.length ? books.map(bookCard).join("") : `<p class="empty">এখানে এখনো কোনো বই নেই।</p>`;
$("#disc").innerHTML = disclosure();
