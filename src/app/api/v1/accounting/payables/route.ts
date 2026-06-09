import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import { getOutstandingPayables } from "@/services/accounting.service";

export async function GET(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS_OFFICER,
    UserRole.PROCUREMENT_MANAGER,
  ]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const supplierId = searchParams.get("supplierId") || undefined;

    const payables = await getOutstandingPayables(supplierId);

    const totalOutstanding = payables.reduce(
      (sum, p) => sum + Number(p.amount) - Number(p.paidAmount),
      0
    );

    return NextResponse.json({
      data: payables,
      summary: {
        count: payables.length,
        totalOutstanding,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve payables:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payables" },
      { status: 500 }
    );
  }
}
