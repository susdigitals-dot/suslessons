// আইনি পাতা (Privacy, Terms, Refund, Disclosure) — লেখা HTML-এ, ব্যবসার তথ্য সেটিংস থেকে
import { getSettings } from "./data.js";
import "./track.js";
import { chrome, fillBiz } from "./ui.js";

const settings = await getSettings();
chrome(settings);
fillBiz(settings);
