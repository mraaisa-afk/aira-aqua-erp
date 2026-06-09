import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import { getOutstandingReceivables } from "@/services/accounting.service";

export async function GET(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS_OFFICER,
    UserRole.SALES_OFFICER,
  ]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const customerId = searchParams.get("customerId") || undefined;

    const receivables = await getOutstandingReceivables(customerId);

    const totalOutstanding = receivables.reduce(
      (sum, r) => sum + Number(r.amount) - Number(r.paidAmount),
      0
    );

    return NextResponse.json({
      data: receivables,
      summary: {
        count: receivables.length,
        totalOutstanding,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve receivables:", error);
    return NextResponse.json(
      { error: "Failed to retrieve receivables" },
      { status: 500 }
    );
  }
}
