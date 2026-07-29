import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { getSession, type SessionPayload } from "@/lib/session";
import { canEdit, canView, type Resource } from "@/lib/rbac-policy";

export { canView, canEdit, NAV_ACCESS, EDIT_ACCESS, type Resource } from "@/lib/rbac-policy";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Requires a signed-in session; throws otherwise. Use in server actions/routes. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

/** Requires the session's role to be one of `allowed`; throws otherwise. */
export async function assertRole(...allowed: AdminRole[]): Promise<SessionPayload> {
  const session = await requireSession();
  if (!allowed.includes(session.role)) throw new UnauthorizedError("Only " + allowed.join("/") + " can do this");
  return session;
}

/** Requires edit access to `resource`; throws otherwise. */
export async function assertCanEdit(resource: Resource): Promise<SessionPayload> {
  const session = await requireSession();
  if (!canEdit(session.role, resource)) throw new UnauthorizedError(`${session.role} cannot edit ${resource}`);
  return session;
}

/**
 * Requires view access to `resource`; redirects to /admin otherwise. Use at the top of
 * admin page.tsx Server Components — NAV_ACCESS only controls which links are *shown* in
 * the sidebar, it does not by itself stop a signed-in user from opening the URL directly.
 */
export async function requireView(resource: Resource): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !canView(session.role, resource)) redirect("/admin");
  return session;
}
