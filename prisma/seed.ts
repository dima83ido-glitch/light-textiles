import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { CATEGORY_GROUPS } from "./seed-data/category-map";
import { slugify } from "../src/lib/slugify";

const prisma = new PrismaClient();

const RAW_DIR = path.join(__dirname, "seed-data", "raw");
const UPLOADS_DIR = path.join(__dirname, "..", "public", "uploads", "products");

type RawProduct = {
  id: string;
  url: string;
  name: string | null;
  basePrice: number | null;
  currency: string;
  availability: "in_stock" | "out_of_stock";
  category: string | null;
  breadcrumb: string[];
  images: string[];
  variants: { name: string; price: number }[];
  description: string | null;
};

type RawProductRu = { id: string; name: string | null; description: string | null };
type RawProductEn = { id: string; name: string | null; description: string | null };
type RawCategory = { slug: string; clothParam: string | null; url: string; title: string | null; h1: string | null; productIds: string[] };

// Niche-first priority so products tagged into a specific category page
// (e.g. children's fabric, flannel) don't get swallowed by the broad
// "tkani_optom" wholesale-fabric listing they also happen to appear on.
const CATEGORY_PRIORITY = [
  "children", "flannel", "waffle_cloth", "linen", "tik", "tkani_skatertnye", "satin", "tkani_optom",
  "baby", "double", "duvet-cover", "blanket", "bedsheet", "navolochki", "skaterti",
  "vafelnye-polotenca", "polotentsa-50x90", "polotentsa-70x140", "beach-towel", "towel-poncho",
  "nitki", "upakovka",
];

function readJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(RAW_DIR, filename), "utf8"));
}

function readJsonOptional<T>(filename: string, fallback: T): T {
  try {
    return readJson<T>(filename);
  } catch {
    return fallback;
  }
}

const imageCache = new Map<string, string>();

async function downloadImage(url: string): Promise<string | null> {
  if (imageCache.has(url)) return imageCache.get(url)!;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = path.extname(new URL(url).pathname) || ".jpg";
    const filename = `${slugify(path.basename(new URL(url).pathname, ext))}-${Buffer.from(url).toString("base64url").slice(0, 8)}${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    const localPath = `/uploads/products/${filename}`;
    imageCache.set(url, localPath);
    return localPath;
  } catch {
    return null;
  }
}

async function downloadImagesWithConcurrency(urls: string[], concurrency = 10): Promise<void> {
  const queue = [...urls];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) return;
      await downloadImage(url);
    }
  });
  await Promise.all(workers);
}

async function main() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  console.log("Loading scraped data...");
  const products = readJson<RawProduct[]>("products.json");
  const productsRu = readJson<RawProductRu[]>("products_ru.json");
  const productsEn = readJsonOptional<RawProductEn[]>("products_en.json", []);
  const categoriesRaw = readJson<RawCategory[]>("categories.json");

  const ruById = new Map(productsRu.map((p) => [p.id, p]));
  const enById = new Map(productsEn.map((p) => [p.id, p]));

  // --- Admin user ---
  console.log("Creating admin user...");
  const ownerEmail = process.env.OWNER_EMAIL || "dima83ido@gmail.com";
  const tempPassword = process.env.OWNER_PASSWORD || "LightTextiles2026!";
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      passwordHash,
      name: "Власник",
      role: "OWNER",
    },
  });

  // --- Warehouses ---
  console.log("Creating warehouses...");
  const warehouseSeeds = [
    { slug: "radomyshl", name: { uk: "Радомишль", en: "Radomyshl", ru: "Радомышль" } },
    { slug: "horenychi", name: { uk: "Горенычі", en: "Horenychi", ru: "Горенычи" } },
  ];
  const warehouseIds: string[] = [];
  for (const w of warehouseSeeds) {
    const row = await prisma.warehouse.upsert({
      where: { slug: w.slug },
      update: { name: w.name },
      create: { slug: w.slug, name: w.name },
    });
    warehouseIds.push(row.id);
  }

  // --- Categories ---
  console.log("Creating categories...");
  const categoryIdBySlug = new Map<string, string>();

  for (let gi = 0; gi < CATEGORY_GROUPS.length; gi++) {
    const group = CATEGORY_GROUPS[gi];
    const groupRow = await prisma.category.upsert({
      where: { slug: group.slug },
      update: { name: group.name, sortOrder: gi },
      create: { slug: group.slug, name: group.name, sortOrder: gi, isVisible: true },
    });
    categoryIdBySlug.set(group.slug, groupRow.id);

    for (let ci = 0; ci < group.children.length; ci++) {
      const child = group.children[ci];
      const childRow = await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: groupRow.id, sortOrder: ci },
        create: {
          slug: child.slug,
          name: child.name,
          parentId: groupRow.id,
          sortOrder: ci,
          isVisible: true,
        },
      });
      categoryIdBySlug.set(child.slug, childRow.id);
    }
  }

  // --- Category membership map (from category listing pages) ---
  const membershipByProductId = new Map<string, Set<string>>();
  for (const cat of categoriesRaw) {
    if (cat.slug === "postel") continue; // filtered variant of "double", not a real leaf
    for (const id of cat.productIds) {
      if (!membershipByProductId.has(id)) membershipByProductId.set(id, new Set());
      membershipByProductId.get(id)!.add(cat.slug);
    }
  }

  function resolveCategorySlug(product: RawProduct): string | null {
    const memberships = membershipByProductId.get(product.id);
    if (memberships) {
      const chosen = CATEGORY_PRIORITY.find((slug) => memberships.has(slug));
      if (chosen) return chosen;
    }
    if (product.category) {
      const first = product.category.split(",")[0].trim();
      if (categoryIdBySlug.has(first)) return first;
    }
    return null;
  }

  // --- Download all unique product images up front ---
  console.log("Downloading product images (this may take a few minutes)...");
  const allImageUrls = [...new Set(products.flatMap((p) => p.images))];
  await downloadImagesWithConcurrency(allImageUrls);
  console.log(`Downloaded ${imageCache.size}/${allImageUrls.length} unique images.`);

  // --- Products ---
  console.log("Creating products...");
  const usedSlugs = new Set<string>();
  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const categorySlug = resolveCategorySlug(product);
    const categoryId = categorySlug ? categoryIdBySlug.get(categorySlug) : undefined;
    if (!categoryId) {
      skipped++;
      continue;
    }

    const nameUk = product.name?.trim() || `Товар ${product.id}`;
    const ru = ruById.get(product.id);
    const nameRu = ru?.name?.trim() || nameUk;
    const en = enById.get(product.id);
    const nameEn = en?.name?.trim() || nameUk;

    const baseSlug = slugify(nameUk) || `product-${product.id}`;
    let slug = `${baseSlug}-${product.id}`;
    let n = 1;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${product.id}-${n}`;
      n++;
    }
    usedSlugs.add(slug);

    const localImages = product.images
      .map((url) => imageCache.get(url))
      .filter((v): v is string => !!v);

    const basePrice = product.basePrice ?? product.variants[0]?.price ?? 0;

    const created_ = await prisma.product.create({
      data: {
        slug,
        name: { uk: nameUk, en: nameEn, ru: nameRu },
        description:
          product.description || ru?.description || en?.description
            ? {
                uk: product.description ?? "",
                en: en?.description ?? product.description ?? "",
                ru: ru?.description ?? product.description ?? "",
              }
            : undefined,
        basePrice,
        currency: product.currency || "UAH",
        availability: product.availability === "in_stock" ? "IN_STOCK" : "OUT_OF_STOCK",
        categoryId,
        sourceUrl: product.url,
        images: {
          create: localImages.map((url, i) => ({ url, sortOrder: i })),
        },
        variants: {
          create: product.variants.map((v, i) => ({ name: v.name, price: v.price, sortOrder: i })),
        },
      },
    });
    created++;
    if (created % 50 === 0) console.log(`  ${created} products created...`);
    void created_;
  }

  console.log(`Products created: ${created}, skipped (no category): ${skipped}`);

  // --- Initial stock levels (flat default so the storefront isn't empty) ---
  console.log("Seeding initial stock levels...");
  const allProductIds = await prisma.product.findMany({ select: { id: true } });
  const DEFAULT_SEED_QUANTITY = 20;
  await prisma.stockLevel.createMany({
    data: allProductIds.flatMap((p) =>
      warehouseIds.map((warehouseId) => ({ productId: p.id, warehouseId, quantity: DEFAULT_SEED_QUANTITY })),
    ),
    skipDuplicates: true,
  });

  // Feature a handful of products per top-level group for the homepage.
  console.log("Marking featured products...");
  for (const group of CATEGORY_GROUPS) {
    const childIds = group.children
      .map((c) => categoryIdBySlug.get(c.slug))
      .filter((v): v is string => !!v);
    const picks = await prisma.product.findMany({
      where: { categoryId: { in: childIds }, isVisible: true },
      take: 2,
    });
    await prisma.product.updateMany({
      where: { id: { in: picks.map((p) => p.id) } },
      data: { isFeatured: true },
    });
  }

  // Category thumbnail images: use the first available product image in each leaf category.
  console.log("Assigning category thumbnails...");
  for (const group of CATEGORY_GROUPS) {
    for (const child of group.children) {
      const categoryId = categoryIdBySlug.get(child.slug);
      if (!categoryId) continue;
      const withImage = await prisma.product.findFirst({
        where: { categoryId },
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
      });
      const thumb = withImage?.images[0]?.url;
      if (thumb) {
        await prisma.category.update({ where: { id: categoryId }, data: { image: thumb } });
      }
    }
  }

  // --- Site settings ---
  console.log("Creating site settings...");
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      phone: "0977050575",
      viber: "+380977050575",
      email: "light-textiles@ukr.net",
      workingHours: { uk: "Пн–Пт 10:00–18:00", en: "Mon–Fri 10:00 AM–6:00 PM", ru: "Пн–Пт 10:00–18:00" },
      address: {
        uk: "Виробництво: м. Радомишль, Житомирська область",
        en: "Production: Radomyshl, Zhytomyr region, Ukraine",
        ru: "Производство: г. Радомышль, Житомирская область",
      },
      facebookUrl: "https://www.facebook.com/lighttextiles.com.ua/",
      instagramUrl: "https://www.instagram.com/light_textiles.com.ua/",
    },
  });

  // --- FAQ ---
  console.log("Creating FAQ items...");
  const faqItems = [
    {
      question: {
        uk: "Скільки часу займає індивідуальне пошиття?",
        en: "How long does custom sewing take?",
        ru: "Сколько времени занимает индивидуальный пошив?",
      },
      answer: {
        uk: "Виготовлення комплекту чи окремого виробу за вашими розмірами займає від 1 до 5 робочих днів залежно від складності замовлення.",
        en: "Making a set or an individual item to your measurements takes 1 to 5 business days, depending on the complexity of the order.",
        ru: "Изготовление комплекта или отдельного изделия по вашим размерам занимает от 1 до 5 рабочих дней в зависимости от сложности заказа.",
      },
    },
    {
      question: {
        uk: "Як здійснюється доставка?",
        en: "How is delivery handled?",
        ru: "Как осуществляется доставка?",
      },
      answer: {
        uk: "Доставляємо по всій Україні Новою Поштою та Укрпоштою. Готові товари відправляємо протягом 1–2 днів після оформлення замовлення.",
        en: "We deliver across Ukraine via Nova Poshta and Ukrposhta. Ready-made items are shipped within 1–2 days of placing the order.",
        ru: "Доставляем по всей Украине Новой Почтой и Укрпочтой. Готовые товары отправляем в течение 1–2 дней после оформления заказа.",
      },
    },
    {
      question: {
        uk: "Які способи оплати ви приймаєте?",
        en: "What payment methods do you accept?",
        ru: "Какие способы оплаты вы принимаете?",
      },
      answer: {
        uk: "Оплатити замовлення можна на розрахунковий рахунок ФОП або накладеним платежем (післяплата) під час отримання на пошті.",
        en: "You can pay by bank transfer to our business account or by cash on delivery when picking up the order at the post office.",
        ru: "Оплатить заказ можно на расчетный счет ФОП или наложенным платежом (постоплата) при получении на почте.",
      },
    },
    {
      question: {
        uk: "З якої тканини виготовляється постільна білизна?",
        en: "What fabric is the bedding made from?",
        ru: "Из какой ткани изготавливается постельное белье?",
      },
      answer: {
        uk: "Ми працюємо зі 100% бавовняними тканинами: бязь Тиротекс (Молдова), страйп-сатин (Туреччина) та сатин (Пакистан).",
        en: "We work only with 100% cotton fabrics: Tirotex poplin (Moldova), stripe satin (Turkey), and satin (Pakistan).",
        ru: "Мы работаем со 100% хлопковыми тканями: бязь Тиротекс (Молдова), страйп-сатин (Турция) и сатин (Пакистан).",
      },
    },
    {
      question: {
        uk: "Чи можна замовити нестандартний розмір?",
        en: "Can I order a non-standard size?",
        ru: "Можно ли заказать нестандартный размер?",
      },
      answer: {
        uk: "Так, ми шиємо комплекти, простирадла на резинці та наволочки за будь-якими нестандартними розмірами, включно з круглими та дитячими ліжками.",
        en: "Yes, we sew bedding sets, fitted sheets, and pillowcases to any non-standard size, including round and children's beds.",
        ru: "Да, мы шьем комплекты, простыни на резинке и наволочки по любым нестандартным размерам, включая круглые и детские кровати.",
      },
    },
  ];

  for (let i = 0; i < faqItems.length; i++) {
    const existing = await prisma.faqItem.findFirst({ where: { sortOrder: i } });
    if (!existing) {
      await prisma.faqItem.create({ data: { ...faqItems[i], sortOrder: i } });
    }
  }

  console.log("\nSeed complete.");
  console.log(`Admin login: ${ownerEmail} / ${tempPassword} (change this after first login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
