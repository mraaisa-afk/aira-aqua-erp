import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import { getAuditLogs } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const authResult = await authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUDITOR]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId") || undefined;
    const module = searchParams.get("module") || undefined;
    const action = searchParams.get("action") || undefined;
    const recordId = searchParams.get("recordId") || undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const result = await getAuditLogs({
      userId,
      module,
      action: action as any,
      recordId,
      startDate,
      endDate,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to retrieve audit logs:", error);
    return NextResponse.json({ error: "Failed to retrieve audit logs" }, { status: 500 });
  }
}
