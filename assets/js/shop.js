import { getSettings, listProducts } from "./data.js";
import "./track.js";
import { $, chrome, productCard, KINDS } from "./ui.js";

const show = new URLSearchParams(location.search).get("kind") || "";
const settings = await getSettings();
chrome(settings);

const all = await listProducts();

// শুধু যে ধরনের জিনিস আছে, সেই ফিল্টারগুলো দেখাও
const kinds = Object.keys(KINDS).filter((k) => all.some((p) => p.kind === k));
if (kinds.length > 1)
  $("#filters").innerHTML = [["", "সব"], ...kinds.map((k) => [k, KINDS[k]])]
    .map(([k, l]) => `<a href="shop.html${k ? "?kind=" + k : ""}"${k === show ? ' aria-current="page"' : ""}>${l}</a>`)
    .join("");

const items = show ? all.filter((p) => p.kind === show) : all;
$("#shop").innerHTML = items.length
  ? items.map(productCard).join("")
  : `<div class="empty"><h2>শীঘ্রই আসছে</h2><p>নতুন ই-বুক আর গাইডের খবর পেতে Instagram-এ ফলো করুন।</p></div>`;
