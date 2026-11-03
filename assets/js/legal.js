// আইনি পাতা (Privacy, Terms, Refund, Disclosure) — লেখা HTML-এ, ব্যবসার তথ্য সেটিংস থেকে
import { getSettings } from "./data.js?v=202611031627";
import "./track.js?v=202611031627";
import { chrome, fillBiz } from "./ui.js?v=202611031627";

const settings = await getSettings();
chrome(settings);
fillBiz(settings);
