// Real category structure taken from the old site's own navigation menu
// (catalog.php?name=... groups containing view_cat.php?cat=... leaf categories).
export const CATEGORY_GROUPS = [
  {
    slug: "bedclothes",
    name: { uk: "Постільна білизна", en: "Bedding", ru: "Постельное белье" },
    children: [
      { slug: "double", name: { uk: "Комплекти постільної білизни", en: "Bedding sets", ru: "Комплекты постельного белья" } },
      { slug: "baby", name: { uk: "Дитяча постіль", en: "Baby bedding", ru: "Детское постельное белье" } },
      { slug: "bedsheet", name: { uk: "Простирадла, простирадла на резинці", en: "Bed sheets & fitted sheets", ru: "Простыни, простыни на резинке" } },
      { slug: "navolochki", name: { uk: "Наволочки", en: "Pillowcases", ru: "Наволочки" } },
      { slug: "duvet-cover", name: { uk: "Підковдри", en: "Duvet covers", ru: "Пододеяльники" } },
      { slug: "blanket", name: { uk: "Ковдри", en: "Blankets", ru: "Одеяла" } },
      { slug: "skaterti", name: { uk: "Скатертини", en: "Tablecloths", ru: "Скатерти" } },
    ],
  },
  {
    slug: "towels",
    name: { uk: "Рушники", en: "Towels", ru: "Полотенца" },
    children: [
      { slug: "vafelnye-polotenca", name: { uk: "Вафельні рушники", en: "Waffle towels", ru: "Вафельные полотенца" } },
      { slug: "polotentsa-50x90", name: { uk: "Рушники махрові 50х90", en: "Terry towels 50x90", ru: "Полотенца махровые 50х90" } },
      { slug: "polotentsa-70x140", name: { uk: "Рушники махрові 70х140", en: "Terry towels 70x140", ru: "Полотенца махровые 70х140" } },
      { slug: "beach-towel", name: { uk: "Рушники пляжні", en: "Beach towels", ru: "Полотенца пляжные" } },
      { slug: "towel-poncho", name: { uk: "Рушники ПОНЧО", en: "Poncho towels", ru: "Полотенца ПОНЧО" } },
    ],
  },
  {
    slug: "cloth",
    name: { uk: "Постільні тканини", en: "Bedding fabrics", ru: "Постельные ткани" },
    children: [
      { slug: "satin", name: { uk: "Сатин, страйп-сатин", en: "Satin & stripe satin", ru: "Сатин, страйп-сатин" } },
      { slug: "tkani_optom", name: { uk: "Бязь, 100% бавовна", en: "Poplin, 100% cotton", ru: "Бязь, 100% хлопок" } },
      { slug: "children", name: { uk: "Дитячі тканини", en: "Children's fabrics", ru: "Детские ткани" } },
      { slug: "flannel", name: { uk: "Фланель", en: "Flannel", ru: "Фланель" } },
      { slug: "waffle_cloth", name: { uk: "Тканина вафельна", en: "Waffle fabric", ru: "Ткань вафельная" } },
      { slug: "tkani_skatertnye", name: { uk: "Тканина для скатертин", en: "Tablecloth fabric", ru: "Ткань для скатертей" } },
      { slug: "linen", name: { uk: "Льон для постільної білизни", en: "Linen for bedding", ru: "Лён для постельного белья" } },
      { slug: "tik", name: { uk: "Тік напірниковий", en: "Pillow ticking fabric", ru: "Тик наперниковый" } },
    ],
  },
  {
    slug: "accessories",
    name: { uk: "Нитки та фурнітура", en: "Threads & notions", ru: "Нитки и фурнитура" },
    children: [
      { slug: "nitki", name: { uk: "Нитки", en: "Threads", ru: "Нитки" } },
      { slug: "upakovka", name: { uk: "Упаковка", en: "Packaging", ru: "Упаковка" } },
    ],
  },
] as const;
