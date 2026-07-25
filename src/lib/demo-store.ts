/**
 * In-memory data store for the portfolio-demo build. Replaces Prisma/Postgres
 * entirely — seeded once per process from the static JSON snapshots in
 * src/data/ (see scripts/export-demo-data.ts), then mutated in place by admin
 * actions for the lifetime of that process. A redeploy/restart always starts
 * from the clean exported snapshot again.
 */
import categoriesData from "@/data/categories.json";
import productsData from "@/data/products.json";
import siteSettingsData from "@/data/site-settings.json";
import faqData from "@/data/faq.json";
import bannersData from "@/data/banners.json";
import reviewsData from "@/data/reviews.json";
import adminUsersData from "@/data/admin-users.json";
import ordersData from "@/data/orders.json";
import contactRequestsData from "@/data/contact-requests.json";
import mediaAssetsData from "@/data/media-assets.json";

export type LocalizedText = Partial<Record<"uk" | "en" | "ru", string>>;
export type AdminRole = "OWNER" | "STAFF";
export type Availability = "IN_STOCK" | "OUT_OF_STOCK" | "ON_ORDER";
export type OrderStatus = "NEW" | "CONFIRMED" | "PACKING" | "SHIPPING" | "COMPLETED" | "CANCELLED";

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText | null;
  image: string | null;
  sortOrder: number;
  isVisible: boolean;
  metaTitle: LocalizedText | null;
  metaDescription: LocalizedText | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText | null;
  basePrice: number;
  discountPrice: number | null;
  currency: string;
  availability: Availability;
  isVisible: boolean;
  isFeatured: boolean;
  sourceUrl: string | null;
  metaTitle: LocalizedText | null;
  metaDescription: LocalizedText | null;
  categoryId: string;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  deliveryMethod: string | null;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string | null;
  authorName: string;
  rating: number;
  text: string;
  photos: string[];
  isApproved: boolean;
  createdAt: Date;
}

export interface SiteSettings {
  id: string;
  phone: string;
  viber: string | null;
  email: string;
  workingHours: LocalizedText;
  address: LocalizedText | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  heroTitle: LocalizedText | null;
  heroSubtitle: LocalizedText | null;
  heroImage: string | null;
  aboutText: LocalizedText | null;
  deliveryText: LocalizedText | null;
  footerText: LocalizedText | null;
  metaTitle: LocalizedText | null;
  metaDescription: LocalizedText | null;
  updatedAt: Date;
}

export interface Banner {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText | null;
  image: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactRequest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  isHandled: boolean;
  createdAt: Date;
}

export interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

interface DemoStore {
  categories: Category[];
  products: Product[];
  siteSettings: SiteSettings | null;
  faqItems: FaqItem[];
  banners: Banner[];
  reviews: Review[];
  adminUsers: AdminUser[];
  orders: Order[];
  contactRequests: ContactRequest[];
  mediaAssets: MediaAsset[];
}

function withDates<T>(raw: unknown, keys: string[]): T {
  const copy = { ...(raw as Record<string, unknown>) };
  for (const key of keys) {
    if (copy[key]) copy[key] = new Date(copy[key] as string);
  }
  return copy as T;
}

function createStore(): DemoStore {
  return {
    categories: (categoriesData as unknown[]).map((c) => withDates<Category>(c, ["createdAt", "updatedAt"])),
    products: (productsData as unknown[]).map((p) => withDates<Product>(p, ["createdAt", "updatedAt"])),
    siteSettings: siteSettingsData ? withDates<SiteSettings>(siteSettingsData, ["updatedAt"]) : null,
    faqItems: faqData as FaqItem[],
    banners: (bannersData as unknown[]).map((b) => withDates<Banner>(b, ["createdAt"])),
    reviews: (reviewsData as unknown[]).map((r) => withDates<Review>(r, ["createdAt"])),
    adminUsers: (adminUsersData as unknown[]).map((u) => withDates<AdminUser>(u, ["createdAt", "updatedAt"])),
    orders: (ordersData as unknown[]).map((o) => withDates<Order>(o, ["createdAt", "updatedAt"])),
    contactRequests: (contactRequestsData as unknown[]).map((c) => withDates<ContactRequest>(c, ["createdAt"])),
    mediaAssets: (mediaAssetsData as unknown[]).map((m) => withDates<MediaAsset>(m, ["createdAt"])),
  };
}

const globalForStore = globalThis as unknown as { __demoStore?: DemoStore };

export const store: DemoStore = globalForStore.__demoStore ?? (globalForStore.__demoStore = createStore());

export function genId(): string {
  return crypto.randomUUID();
}

export function withCategory<T extends { categoryId: string }>(product: T): T & { category: Category | undefined } {
  return { ...product, category: store.categories.find((c) => c.id === product.categoryId) };
}

export function withCategoryRelations(category: Category) {
  return {
    ...category,
    children: store.categories
      .filter((c) => c.parentId === category.id && c.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    parent: category.parentId ? (store.categories.find((c) => c.id === category.parentId) ?? null) : null,
  };
}

export function countProductsInCategory(categoryId: string): number {
  return store.products.filter((p) => p.categoryId === categoryId).length;
}
