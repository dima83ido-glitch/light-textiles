import type { AdminRole } from "@prisma/client";

const KEY: Record<AdminRole, string> = {
  OWNER: "roleOwner",
  MANAGER: "roleManager",
  WAREHOUSE: "roleWarehouse",
  EMPLOYEE: "roleEmployee",
};

export function roleMessageKey(role: AdminRole): string {
  return KEY[role];
}
