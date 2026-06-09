import { NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import { getGeneralLedger } from "@/services/accounting.service";

export async function GET() {
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
    const ledger = await getGeneralLedger();

    const totalDebit = ledger.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalCredit = ledger.reduce((sum, l) => sum + Number(l.credit), 0);

    return NextResponse.json({
      data: ledger,
      summary: {
        totalDebit,
        totalCredit,
        balanced: Math.abs(totalDebit - totalCredit) < 0.01,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve general ledger:", error);
    return NextResponse.json(
      { error: "Failed to retrieve general ledger" },
      { status: 500 }
    );
  }
}
