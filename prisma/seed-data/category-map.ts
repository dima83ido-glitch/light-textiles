// Real category structure taken from the old site's own navigation menu
// (catalog.php?name=... groups containing view_cat.php?cat=... leaf categories).
export const CATEGORY_GROUPS = [
  {
    slug: "bedclothes",
    name: { uk: "Постільна білизна", ru: "Постельное белье" },
    children: [
      { slug: "double", name: { uk: "Комплекти постільної білизни", ru: "Комплекты постельного белья" } },
      { slug: "baby", name: { uk: "Дитяча постіль", ru: "Детское постельное белье" } },
      { slug: "bedsheet", name: { uk: "Простирадла, простирадла на резинці", ru: "Простыни, простыни на резинке" } },
      { slug: "navolochki", name: { uk: "Наволочки", ru: "Наволочки" } },
      { slug: "duvet-cover", name: { uk: "Підковдри", ru: "Пододеяльники" } },
      { slug: "blanket", name: { uk: "Ковдри", ru: "Одеяла" } },
      { slug: "skaterti", name: { uk: "Скатертини", ru: "Скатерти" } },
    ],
  },
  {
    slug: "towels",
    name: { uk: "Рушники", ru: "Полотенца" },
    children: [
      { slug: "vafelnye-polotenca", name: { uk: "Вафельні рушники", ru: "Вафельные полотенца" } },
      { slug: "polotentsa-50x90", name: { uk: "Рушники махрові 50х90", ru: "Полотенца махровые 50х90" } },
      { slug: "polotentsa-70x140", name: { uk: "Рушники махрові 70х140", ru: "Полотенца махровые 70х140" } },
      { slug: "beach-towel", name: { uk: "Рушники пляжні", ru: "Полотенца пляжные" } },
      { slug: "towel-poncho", name: { uk: "Рушники ПОНЧО", ru: "Полотенца ПОНЧО" } },
    ],
  },
  {
    slug: "cloth",
    name: { uk: "Постільні тканини", ru: "Постельные ткани" },
    children: [
      { slug: "satin", name: { uk: "Сатин, страйп-сатин", ru: "Сатин, страйп-сатин" } },
      { slug: "tkani_optom", name: { uk: "Бязь, 100% бавовна", ru: "Бязь, 100% хлопок" } },
      { slug: "children", name: { uk: "Дитячі тканини", ru: "Детские ткани" } },
      { slug: "flannel", name: { uk: "Фланель", ru: "Фланель" } },
      { slug: "waffle_cloth", name: { uk: "Тканина вафельна", ru: "Ткань вафельная" } },
      { slug: "tkani_skatertnye", name: { uk: "Тканина для скатертин", ru: "Ткань для скатертей" } },
      { slug: "linen", name: { uk: "Льон для постільної білизни", ru: "Лён для постельного белья" } },
      { slug: "tik", name: { uk: "Тік напірниковий", ru: "Тик наперниковый" } },
    ],
  },
  {
    slug: "accessories",
    name: { uk: "Нитки та фурнітура", ru: "Нитки и фурнитура" },
    children: [
      { slug: "nitki", name: { uk: "Нитки", ru: "Нитки" } },
      { slug: "upakovka", name: { uk: "Упаковка", ru: "Упаковка" } },
    ],
  },
] as const;
