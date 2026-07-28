import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const result = await saveUploadedFile(file);
  return NextResponse.json(result);
}
