import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function authorize(allowedRoles: UserRole[]) {
  const session = await auth();

  if (!session || !session.user) {
    return { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const userRole = (session.user as any).role as UserRole;

  if (!allowedRoles.includes(userRole)) {
    return { authorized: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { authorized: true, response: null };
}
