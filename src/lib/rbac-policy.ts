import type { AdminRole } from "@prisma/client";

export type Resource =
  | "products"
  | "categories"
  | "orders"
  | "warehouses"
  | "users"
  | "media"
  | "homepage"
  | "reviews"
  | "seo"
  | "contacts"
  | "account";

const ALL_RESOURCES: Resource[] = [
  "products",
  "categories",
  "orders",
  "warehouses",
  "users",
  "media",
  "homepage",
  "reviews",
  "seo",
  "contacts",
  "account",
];

/** Resources visible in the nav / reachable at all (read access). */
export const NAV_ACCESS: Record<AdminRole, Resource[]> = {
  OWNER: ALL_RESOURCES,
  MANAGER: ["products", "categories", "orders", "warehouses", "media", "homepage", "reviews", "seo", "contacts", "account"],
  WAREHOUSE: ["products", "orders", "warehouses", "account"],
  EMPLOYEE: ["products", "orders", "account"],
};

/** Resources this role can create/edit/delete in (a subset of NAV_ACCESS). */
export const EDIT_ACCESS: Record<AdminRole, Resource[]> = {
  OWNER: ALL_RESOURCES,
  MANAGER: ["products", "categories", "orders", "warehouses", "media", "homepage", "reviews", "seo", "contacts"],
  WAREHOUSE: ["warehouses", "orders"],
  EMPLOYEE: ["orders"],
};

export function canView(role: AdminRole, resource: Resource): boolean {
  return NAV_ACCESS[role].includes(resource);
}

export function canEdit(role: AdminRole, resource: Resource): boolean {
  return EDIT_ACCESS[role].includes(resource);
}
