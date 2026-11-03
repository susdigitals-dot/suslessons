// ভিজিটর ভারত থেকে কিনা — ব্রাউজারের টাইমজোন দেখে (কোনো IP বা বাইরের সার্ভিস লাগে না)
// ভারত: Asia/Kolkata (পুরোনো নাম Asia/Calcutta) · বাংলাদেশ: Asia/Dhaka
// লোকালে অন্য দেশ টেস্ট করতে: localStorage.setItem("sus-geo", "BD")
export function country() {
  try {
    const forced = localStorage.getItem("sus-geo");
    if (forced) return forced;
  } catch {}
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (/^Asia\/(Kolkata|Calcutta)$/.test(tz)) return "IN";
  if (tz === "Asia/Dhaka") return "BD";
  return "";
}

export const isIndia = () => country() === "IN";
