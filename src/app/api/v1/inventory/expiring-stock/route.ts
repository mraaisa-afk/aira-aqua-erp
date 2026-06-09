import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import { getExpiringStockReport } from "@/services/inventory.service";

export async function GET(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.WAREHOUSE_OFFICER,
  ]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const daysFromNow = searchParams.get("daysFromNow")
      ? parseInt(searchParams.get("daysFromNow")!)
      : 30;

    const report = await getExpiringStockReport(daysFromNow);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to retrieve expiring stock report:", error);
    return NextResponse.json(
      { error: "Failed to retrieve expiring stock report" },
      { status: 500 }
    );
  }
}
