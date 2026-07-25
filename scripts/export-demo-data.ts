/**
 * One-time dev tool: dumps the live local Postgres data into static JSON
 * files under src/data/, which become the runtime data source for the
 * portfolio-demo build (see src/lib/demo-store.ts). Not imported by the app.
 *
 * Usage: npx tsx scripts/export-demo-data.ts
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OUT_DIR = path.join(__dirname, "..", "src", "data");

function write(filename: string, data: unknown) {
  fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`wrote ${filename}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  write("categories.json", categories);

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });
  write("products.json", products);

  const siteSettings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  write("site-settings.json", siteSettings);

  const faq = await prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
  write("faq.json", faq);

  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  write("banners.json", banners);

  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  write("reviews.json", reviews);

  // Demo admin account — deliberately NOT the real owner email/password.
  const demoPasswordHash = await bcrypt.hash("Demo1234!", 10);
  write("admin-users.json", [
    {
      id: "demo-owner",
      email: "demo@lighttextiles.dev",
      passwordHash: demoPasswordHash,
      name: "Demo Owner",
      role: "OWNER",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Clean demo state — no carried-over test orders/contacts/uploads.
  write("orders.json", []);
  write("contact-requests.json", []);
  write("media-assets.json", []);

  console.log(
    `\nExported: ${categories.length} categories, ${products.length} products, ${faq.length} FAQ items, ${banners.length} banners, ${reviews.length} reviews.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
