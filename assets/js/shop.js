import { getSettings, listProducts } from "./data.js";
import "./track.js";
import { $, chrome, productCard, KINDS } from "./ui.js";
import { featureHtml, initFeature } from "./kothin.js";

const show = new URLSearchParams(location.search).get("kind") || "";
const settings = await getSettings();
chrome(settings);

// সব ফিল্টারে ফিচার বইটা ওপরে
$("#feature").innerHTML = featureHtml();
initFeature();

const all = await listProducts();

// শুধু যে ধরনের জিনিস আছে, সেই ফিল্টারগুলো দেখাও
const kinds = Object.keys(KINDS).filter((k) => all.some((p) => p.kind === k));
if (kinds.length > 1)
  $("#filters").innerHTML = [["", "সব"], ...kinds.map((k) => [k, KINDS[k]])]
    .map(([k, l]) => `<a href="shop.html${k ? "?kind=" + k : ""}"${k === show ? ' aria-current="page"' : ""}>${l}</a>`)
    .join("");

const items = show ? all.filter((p) => p.kind === show) : all;
// ফিচার বইটা তো আছেই — আর কিছু না থাকলে "শীঘ্রই আসছে" না দেখিয়ে ঘরটা লুকিয়ে রাখো
$("#shop").innerHTML = items.map(productCard).join("");
$("#shop").hidden = !items.length;
