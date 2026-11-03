import { getSettings, listProducts } from "./data.js?v=202611031735";
import "./track.js?v=202611031735";
import { $, chrome, productCard, KINDS } from "./ui.js?v=202611031735";
import { featureHtml, initFeature } from "./kothin.js?v=202611031735";

const show = new URLSearchParams(location.search).get("kind") || "";

// পুরোনো /shop.html লিংকে এলে ঠিকানায় /shop দেখাও (পাতা আবার লোড হয় না)
if (location.pathname.endsWith("/shop.html")) history.replaceState(null, "", "/shop" + location.search + location.hash);
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
    .map(([k, l]) => `<a href="/shop${k ? "?kind=" + k : ""}"${k === show ? ' aria-current="page"' : ""}>${l}</a>`)
    .join("");

const items = show ? all.filter((p) => p.kind === show) : all;
// ফিচার বইটা তো আছেই — আর কিছু না থাকলে "শীঘ্রই আসছে" না দেখিয়ে ঘরটা লুকিয়ে রাখো
$("#shop").innerHTML = items.map(productCard).join("");
$("#shop").hidden = !items.length;
