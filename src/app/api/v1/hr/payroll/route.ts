import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import { calculatePayroll, processPayroll } from "@/services/hr.service";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS_OFFICER,
  ]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json(
        { error: "month and year are required" },
        { status: 400 }
      );
    }

    const payroll = await db.payroll.findUnique({
      where: {
        month_year: {
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      include: {
        salarySlips: {
          include: {
            employee: true,
          },
        },
      },
    });

    return NextResponse.json(payroll);
  } catch (error) {
    console.error("Failed to retrieve payroll:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payroll" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTS_OFFICER,
  ]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const session = await import("@/lib/auth").then((m) => m.auth());
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const { month, year, action } = body;

    if (!month || !year) {
      return NextResponse.json(
        { error: "month and year are required" },
        { status: 400 }
      );
    }

    if (action === "calculate") {
      const result = await calculatePayroll(month, year, userId);
      return NextResponse.json(result);
    } else if (action === "process") {
      const payroll = await db.payroll.findUnique({
        where: {
          month_year: {
            month,
            year,
          },
        },
      });

      if (!payroll) {
        return NextResponse.json(
          { error: "Payroll not found" },
          { status: 404 }
        );
      }

      const processed = await processPayroll(payroll.id, userId);
      return NextResponse.json(processed);
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Failed to process payroll:", error);
    return NextResponse.json(
      { error: "Failed to process payroll" },
      { status: 500 }
    );
  }
}
