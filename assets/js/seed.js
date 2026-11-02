/*
  নমুনা লেখা — Supabase connect না থাকলে সাইট এগুলো দেখায়।
  Supabase connect হলে admin প্যানেল থেকে আসল লেখা যোগ করো।

  গল্পের body লেখার নিয়ম (admin-এও একই):
    ফাঁকা লাইন            → নতুন অনুচ্ছেদ
    ## শিরোনাম            → ছোট শিরোনাম
    @বাবা: “কথা”          → কথোপকথনের বাক্স (বক্তার নাম সহ)
    > লাইন                → গাঢ় statement card
    • আজ                  → সময়ের ট্যাগ (বর্তমান)
    ~ তিন মাস আগে          → সময়ের ট্যাগ (ফ্ল্যাশব্যাক)
    ![ছবির কথা](ছবির-লিংক) → ছবি
    ==শব্দ==               → কমলা হাইলাইট (১–৩টা শব্দ)
    **শব্দ**               → মোটা লেখা
    ---                   → বিভাজক
*/
export const SEED = {
  settings: {
    tagline: "গল্পের ==শেষ লাইনেই== আসল শিক্ষা",
    intro: "যে বইগুলো মানুষকে দেখার চোখ বদলে দেয়, সেগুলোর শিক্ষা — বাংলার ঘর, পাড়া আর লোকাল ট্রেনের ছোট ছোট গল্পে।",
    instagram: "https://instagram.com/sus.lessons",
    youtube: "https://www.youtube.com/channel/UCFbDGm8yw3Xj9ti0b6VIfaw",
    facebook: "https://www.facebook.com/profile.php?id=61595912784513",
    followers: "৩০ হাজার+",
    support: {
      enabled: true,
      title: "দাদাকে এক কাপ চা খাওয়ান",
      text: "বই বিনামূল্যে। ভালো লাগলে এক কাপ চা খাওয়াতে পারেন — পরের গল্পটা হয়তো একটু তাড়াতাড়ি আসবে।",
      upi: "",
      upiName: "sus.lessons",
      bkash: "",
      link: "",
    },
  },

  books: [
    {
      id: "b-48-laws",
      slug: "48-laws-of-power",
      title: "The 48 Laws of Power",
      title_bn: "ক্ষমতার ৪৮টি নিয়ম",
      author: "Robert Greene",
      hook: "ভালো মানুষ হয়ে ==বারবার ঠকছেন?==",
      description: "মানুষ কীভাবে ক্ষমতার খেলা খেলে, সেটা না বুঝলে আপনিই হেরে যাবেন। আমাদের মূল সিরিজ — একটা নিয়ম, একটা গল্প।",
      laws: [
        { no: "04", name: "Always Say Less Than Necessary", line: "যত কম বলবেন, তত বেশি মানুষ শুনবে।" },
        { no: "16", name: "Use Absence to Increase Respect", line: "রোজ যা পাওয়া যায়, তার দাম কেউ বোঝে না।" },
        { no: "29", name: "Plan All the Way to the End", line: "একদিনের শো-অফ, বারো বছরের কিস্তি।" },
      ],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://link.amazon/B0aH0WN7x" }],
      pdf_url: "",
      featured: true,
      sort: 1,
      published: true,
    },
    {
      id: "b-5-love",
      slug: "5-love-languages",
      title: "The 5 Love Languages",
      title_bn: "ভালোবাসার পাঁচটা ভাষা",
      author: "Gary Chapman",
      hook: "বাবা কখনো ==‘ভালোবাসি’== বলেননি?",
      description: "সবাই এক ভাষায় ভালোবাসে না। কেউ বলে, কেউ রান্না করে, কেউ শুধু জিজ্ঞেস করে “খেয়েছিস?”",
      laws: [
        { no: "01", name: "Words of Affirmation", line: "কেউ শুনতে চায় — “তুই পারবি।”" },
        { no: "02", name: "Acts of Service", line: "কেউ বলে না, শুধু করে দেয়।" },
        { no: "05", name: "Quality Time", line: "পাশে বসে থাকাটাই কারও কাছে সব।" },
      ],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://link.amazon/B0aJVklnk" }],
      pdf_url: "",
      featured: false,
      sort: 2,
      published: true,
    },
    {
      id: "b-easyway",
      slug: "easy-way-to-stop-smoking",
      title: "The Easy Way to Stop Smoking",
      title_bn: "সিগারেট ছাড়ার সহজ উপায়",
      author: "Allen Carr",
      hook: "“একটা তো খাই, ==কিছু হয় না।==”",
      description: "ইচ্ছাশক্তি নয়, ভয় নয় — শুধু বুঝে নেওয়া যে সিগারেট আপনাকে কিছুই দিচ্ছে না।",
      laws: [
        { no: "01", name: "The Little Monster", line: "যে খিদেটা সিগারেট মেটায়, সেটা সিগারেটই তৈরি করেছে।" },
        { no: "02", name: "Just One", line: "‘শুধু একটা’ বলেই সবাই আবার শুরু করে।" },
      ],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://www.amazon.in/s?k=Allen+Carr+Easy+Way+to+Stop+Smoking&tag=suscommunity-21" }],
      pdf_url: "",
      featured: false,
      sort: 3,
      published: true,
    },
    {
      id: "b-gift-fear",
      slug: "the-gift-of-fear",
      title: "The Gift of Fear",
      title_bn: "ভয় একটা উপহার",
      author: "Gavin de Becker",
      hook: "মনের ভেতরের ==খচখচানিটা== শুনুন।",
      description: "যে অস্বস্তিটা আমরা ‘ভদ্রতা’র খাতিরে চেপে যাই, সেটাই অনেক সময় আমাদের বাঁচায়।",
      laws: [{ no: "01", name: "Trust Your Intuition", line: "ভয়টা কারণ ছাড়া আসে না।" }],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://link.amazon/B02FV3KPf" }],
      pdf_url: "",
      featured: false,
      sort: 4,
      published: true,
    },
    {
      id: "b-atomic",
      slug: "atomic-habits",
      title: "Atomic Habits",
      title_bn: "ছোট অভ্যাস, বড় বদল",
      author: "James Clear",
      hook: "রোজ ==১% ভালো== হলেই যথেষ্ট।",
      description: "বড় সিদ্ধান্ত নয় — রোজকার ছোট অভ্যাসগুলোই ঠিক করে এক বছর পরে আপনি কোথায় থাকবেন। বাংলা অনুবাদও পাওয়া যায়।",
      laws: [
        { no: "01", name: "The 1% Rule", line: "রোজ একটু একটু করেই জীবন বদলায়।" },
        { no: "02", name: "Environment Design", line: "ইচ্ছাশক্তির চেয়ে ঘরটা কীভাবে সাজানো, সেটা বেশি কাজ করে।" },
        { no: "03", name: "Identity-Based Habits", line: "“আমি খাই না” — “ছাড়ার চেষ্টা করছি”-র চেয়ে অনেক শক্ত।" },
      ],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://link.amazon/B0iJxMSqx" }],
      pdf_url: "",
      featured: false,
      sort: 5,
      published: true,
    },
    {
      id: "b-millionaire",
      slug: "millionaire-next-door",
      title: "The Millionaire Next Door",
      title_bn: "পাশের বাড়ির কোটিপতি",
      author: "Thomas J. Stanley",
      hook: "“সবার আছে, ==আমার কেন থাকবে না?==”",
      description: "যাদের দেখে বড়লোক মনে হয়, তাদের অনেকেই ধারে চলে। আসল সঞ্চয়ীরা থাকেন চুপচাপ, সাধারণভাবে। বাংলা অনুবাদও পাওয়া যায়।",
      laws: [
        { no: "01", name: "Big Hat, No Cattle", line: "দেখানো বড়লোকি আর আসল সম্পদ এক জিনিস নয়।" },
        { no: "02", name: "Live Below Your Means", line: "আয়ের চেয়ে কম খরচ — এটাই আসল ধনী হওয়ার রাস্তা।" },
      ],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://link.amazon/B06MPv485" }],
      pdf_url: "",
      featured: false,
      sort: 6,
      published: true,
    },
    {
      id: "b-courage",
      slug: "courage-to-be-disliked",
      title: "The Courage to Be Disliked",
      title_bn: "অপছন্দের সাহস",
      author: "Ichiro Kishimi & Fumitake Koga",
      hook: "সবাইকে খুশি রাখতে গিয়ে ==নিজেকে হারাচ্ছেন?==",
      description: "“লোকে কী বলবে” — এই ভয়টাই আমাদের সবচেয়ে বেশি আটকে রাখে। অ্যাডলারের দর্শন, দুজন মানুষের কথোপকথনে।",
      laws: [
        { no: "01", name: "Separation of Tasks", line: "কে কী ভাববে, সেটা তার কাজ — আপনার নয়।" },
        { no: "02", name: "All Problems Are Interpersonal", line: "বেশিরভাগ কষ্টের শিকড় মানুষের সাথে সম্পর্কে।" },
      ],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://link.amazon/B0gZBdUCA" }],
      pdf_url: "",
      featured: false,
      sort: 7,
      published: true,
    },
    {
      id: "b-alcohol",
      slug: "easy-way-to-control-alcohol",
      title: "The Easy Way to Control Alcohol",
      title_bn: "মদ ছাড়ার সহজ উপায়",
      author: "Allen Carr",
      hook: "“একটু খেলে ==কিছু হয় না।==”",
      description: "মদ আপনাকে কিছু দিচ্ছে — এই বিশ্বাসটাই আসল ফাঁদ। ভয় বা জোর না করে বেরিয়ে আসার উপায়।",
      laws: [
        { no: "01", name: "The Illusion of Pleasure", line: "যে আরাম মদ ‘দেয়’, সেটা মদই আগে কেড়ে নিয়েছিল।" },
        { no: "02", name: "No Sacrifice", line: "ছাড়া মানে কিছু হারানো নয় — মুক্তি।" },
      ],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://link.amazon/B0bqsB5pc" }],
      pdf_url: "",
      featured: false,
      sort: 8,
      published: true,
    },
    {
      id: "b-steal",
      slug: "steal-like-an-artist",
      title: "Steal Like an Artist",
      title_bn: "শিল্পীর মতো চুরি করো",
      author: "Austin Kleon",
      hook: "কিছুই ==একদম নতুন== নয়।",
      description: "সব সৃষ্টিই আগের কারও কাজ থেকে শুরু হয়। লজ্জা নয় — ভালো জিনিস থেকে শিখুন, তারপর নিজের মতো করে বানান।",
      laws: [
        { no: "01", name: "Steal Like an Artist", line: "ভালো জিনিস থেকে শিখুন — নকল নয়, মিশিয়ে নিজের করুন।" },
        { no: "02", name: "Write the Book You Want to Read", line: "যেটা খুঁজে পাচ্ছেন না, সেটা নিজেই বানান।" },
      ],
      cover_url: "",
      affiliate: [{ store: "Amazon", url: "https://link.amazon/B0alsXZkS" }],
      pdf_url: "",
      featured: false,
      sort: 9,
      published: true,
    },
    {
      id: "b-free-notes",
      slug: "48-laws-bangla-notes",
      title: "48 Laws — Bangla Notes",
      title_bn: "৪৮ নিয়মের বাংলা নোট",
      author: "sus.lessons",
      hook: "প্রতিটা নিয়ম, ==এক পাতায়।==",
      description: "আমাদের নিজের লেখা ছোট্ট ই-বই — প্রতিটা নিয়ম সহজ বাংলায়, একটা করে ঘরোয়া উদাহরণ সহ। একদম বিনামূল্যে।",
      laws: [],
      cover_url: "",
      affiliate: [],
      pdf_url: "books/sample.pdf",
      featured: false,
      sort: 99,
      published: true,
    },
  ],

  stories: [
    {
      id: "s-bhalobashi",
      slug: "babar-bhalobashi",
      type: "slides",
      title: "তেইশ বছরে বাবা একবারও ‘ভালোবাসি’ বলেননি",
      excerpt: "বেশি আদর দিলে ছেলে মাথায় চড়ে — বাবার এই কথার পেছনে লুকিয়ে ছিল একটা পুরোনো খাতা।",
      last_line: "বাবার “খেয়েছিস?”… ==ওটাই ওঁর ‘ভালোবাসি’।==",
      cover_url: "assets/img/thumb-1.jpg",
      book_slug: "5-love-languages",
      law: "",
      tags: ["পরিবার", "বাবা"],
      body: "",
      slides: [
        { image: "assets/img/scene-1.jpg", speaker: "", text: "তেইশ বছরে বাবা একবারও ==‘ভালোবাসি’== বলেননি।" },
        { image: "assets/img/thumb-1.jpg", speaker: "বাবা", text: "“বেশি আদর দিলে ছেলে ==মাথায় চড়ে।==”" },
        { image: "assets/img/scene-2.jpg", speaker: "", text: "তারপর একদিন আলমারির পেছনে পাওয়া গেল ==একটা খাতা।==" },
        { image: "assets/img/scene-3.jpg", speaker: "", text: "প্রতিটা পাতায় আমার রেজাল্ট, আমার জ্বরের দিন, আমার ==প্রথম চাকরি।==" },
        { image: "assets/img/scene-4.jpg", speaker: "", text: "Gary Chapman বলেন — সবাই এক ভাষায় ভালোবাসে না। কেউ বলে, কেউ ==করে দেখায়।==" },
      ],
      published: true,
      published_at: "2026-10-28",
    },
    {
      id: "s-biye",
      slug: "boro-biye-boro-dhar",
      type: "blog",
      title: "বড় বিয়ে, বড় ধার",
      excerpt: "“সবার ছেলের বিয়েতে পাঁচশো লোক খায়, আমার ছেলের বেলায় কম হবে কেন?” — তারপর বারো বছরের কিস্তি।",
      last_line: "একদিনের হাততালির দাম ==বারো বছর== ধরে মেটাতে হয়।",
      cover_url: "assets/img/scene-5.jpg",
      book_slug: "48-laws-of-power",
      law: "29",
      tags: ["বিয়ে", "টাকা", "শো-অফ"],
      body: `• আজ

বাবা ব্যাংকের লাইনে দাঁড়িয়ে আছেন। হাতে একটা পাসবই, তাতে প্রতি মাসের এক লাইন — ==কিস্তি।==

~ বারো বছর আগে

ছেলের বিয়ের আলোচনা চলছে বসার ঘরে। মামা, পিসি, পাড়ার কাকু — সবাই আছেন।

@বাবা: “সবার ছেলের বিয়েতে পাঁচশো লোক খায়। আমার ছেলের বেলায় ==কম হবে কেন?==”

@মা: “একটু কম হলেও চলবে না? লোন নিতে হবে তো…”

@বাবা: “পাড়ায় মুখ দেখাতে হবে না?”

বিয়ে হলো। প্যান্ডেল, আলো, ক্যাটারার, ব্যান্ড পার্টি। পাড়ার লোক এক সপ্তাহ গল্প করল।

তারপর সবাই ভুলে গেল। কিস্তি ভুলল না।

> “পাড়ার লোক এক সপ্তাহ মনে রাখে। ব্যাংক ==বারো বছর।==”

## বই কী বলে

Robert Greene-এর The 48 Laws of Power-এর Law 29 — Plan All the Way to the End। শেষটা না ভেবে যে শুরু করে, সে মাঝপথে আটকে যায়।

বাবা বিয়ের দিনটা ভেবেছিলেন। বিয়ের পরের বারো বছর ভাবেননি।

## আমাদের জন্য

**১ · খরচের আগে শেষটা ভাবুন।** “এক মাস পরে, এক বছর পরে এটা কেমন লাগবে?”

**২ · ‘সবাই করে’ কোনো যুক্তি না।** সবাই আপনার কিস্তি দেবে না।

**৩ · সম্মান আসে স্বস্তি থেকে।** ধার ছাড়া ছোট অনুষ্ঠানে যে বাবা হাসেন, তাঁর মুখটাই আসল আলো।`,
      slides: [],
      published: true,
      published_at: "2026-10-24",
    },
    {
      id: "s-ekta-to-khai",
      slug: "ekta-to-khai",
      type: "blog",
      title: "“একটা তো খাই, কিছু হয় না”",
      excerpt: "ছোটমামা প্রতিবার এটাই বলতেন। কুড়ি বছর ধরে, দিনে কুড়িটা ‘একটা’।",
      last_line: "‘শুধু একটা’ বলে কেউ থামে না — ==একটা দিয়েই সবাই শুরু করে।==",
      cover_url: "assets/img/scene-2.jpg",
      book_slug: "easy-way-to-stop-smoking",
      law: "",
      tags: ["নেশা", "সিগারেট"],
      body: `• প্রতি সন্ধ্যায়

চায়ের দোকানে ছোটমামা। এক হাতে ভাঁড়, অন্য হাতে সিগারেট।

@ছোটমামা: “একটা তো খাই, ==কিছু হয় না।==”

কথাটা আমি প্রথম শুনেছিলাম ক্লাস সেভেনে। শেষবার শুনেছিলাম হাসপাতালের করিডোরে — মামার গলা তখন অক্সিজেন মাস্কের ভেতর থেকে আসছে।

> “একটা” কখনো একটা থাকে না।

## বই কী বলে

Allen Carr বলেন, সিগারেট যে অস্থিরতাটা ‘মেটায়’, সেটা আসলে আগের সিগারেটটাই তৈরি করেছিল। মানে, নেশা নিজের খিদে নিজেই বানায় — তারপর সেই খিদে মিটিয়ে ক্রেডিট নেয়।

## আমাদের জন্য

**১ · অজুহাতটা চিনুন।** “একটা তো”, “আজ তো ছুটি”, “টেনশনে আছি” — সবই একই দরজার চাবি।

**২ · কী পাচ্ছেন, সত্যি করে লিখুন।** তালিকাটা যত লম্বা ভাবেন, তত লম্বা নয়।`,
      slides: [],
      published: true,
      published_at: "2026-10-18",
    },
    {
      id: "s-ma-ranna",
      slug: "mayer-ranna",
      type: "slides",
      title: "মায়ের রান্না রোজ পাওয়া যায় বলেই…",
      excerpt: "যে জিনিস রোজ পাওয়া যায়, তার দাম আমরা বুঝি তখনই — যেদিন সেটা থাকে না।",
      last_line: "রোজকার জিনিসটাই ==একদিন সবচেয়ে দামি== হয়ে যায়।",
      cover_url: "assets/img/scene-3.jpg",
      book_slug: "48-laws-of-power",
      law: "16",
      tags: ["মা", "পরিবার"],
      body: "",
      slides: [
        { image: "assets/img/scene-3.jpg", speaker: "ছেলে", text: "“আজ আবার ==ডাল-ভাত?==”" },
        { image: "assets/img/scene-4.jpg", speaker: "", text: "মা কিছু বললেন না। শুধু থালাটা সরিয়ে নিলেন।" },
        { image: "assets/img/scene-1.jpg", speaker: "", text: "তিন দিন মা মামাবাড়ি। তিন দিন ==হোটেলের খাবার।==" },
        { image: "", speaker: "", text: "Law 16 — Use Absence to Increase Respect. রোজ যা পাওয়া যায়, তার দাম কেউ বোঝে না।" },
      ],
      published: true,
      published_at: "2026-10-12",
    },
  ],
};
