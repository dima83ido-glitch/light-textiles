import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { canEdit } from "@/lib/rbac";
import { saveUploadedFile, UploadValidationError } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canEdit(session.role, "media")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  try {
    const result = await saveUploadedFile(file);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
