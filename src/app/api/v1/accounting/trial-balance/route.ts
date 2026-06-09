import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import { getTrialBalance } from "@/services/accounting.service";

export async function GET(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS_OFFICER,
    UserRole.AUDITOR,
  ]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: "fromDate and toDate are required" },
        { status: 400 }
      );
    }

    const trialBalance = await getTrialBalance(
      new Date(fromDate),
      new Date(toDate)
    );

    return NextResponse.json({
      data: trialBalance,
      period: { from: fromDate, to: toDate },
    });
  } catch (error) {
    console.error("Failed to retrieve trial balance:", error);
    return NextResponse.json(
      { error: "Failed to retrieve trial balance" },
      { status: 500 }
    );
  }
}
