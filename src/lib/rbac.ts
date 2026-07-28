import type { AdminRole } from "@prisma/client";
import { getSession, type SessionPayload } from "@/lib/session";
import { canEdit, type Resource } from "@/lib/rbac-policy";

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
