import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import {
  requestLeave,
  approveLeaveRequest,
  getPendingLeaveRequests,
  getLeaveBalance,
} from "@/services/hr.service";
import { auth } from "@/lib/auth";

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
    const employeeId = searchParams.get("employeeId") || undefined;

    const pendingRequests = await getPendingLeaveRequests(employeeId);

    return NextResponse.json({
      data: pendingRequests,
      count: pendingRequests.length,
    });
  } catch (error) {
    console.error("Failed to retrieve leave requests:", error);
    return NextResponse.json(
      { error: "Failed to retrieve leave requests" },
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
    const session = await auth();
    const userId = (session?.user as any)?.id;

    const body = await req.json();
    const {
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      action,
      leaveRequestId,
      approvedBy,
    } = body;

    if (action === "request") {
      if (!employeeId || !leaveType || !startDate || !endDate) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const leaveRequest = await requestLeave(
        employeeId,
        leaveType,
        new Date(startDate),
        new Date(endDate),
        reason || "",
        userId
      );

      return NextResponse.json(leaveRequest);
    } else if (action === "approve") {
      if (!leaveRequestId || !approvedBy) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const approved = await approveLeaveRequest(
        leaveRequestId,
        approvedBy,
        userId
      );

      return NextResponse.json(approved);
    } else if (action === "balance") {
      if (!employeeId) {
        return NextResponse.json(
          { error: "employeeId is required" },
          { status: 400 }
        );
      }

      const year = new Date().getFullYear();
      const balance = await getLeaveBalance(employeeId, year);

      return NextResponse.json(balance);
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Failed to process leave request:", error);
    return NextResponse.json(
      { error: "Failed to process leave request" },
      { status: 500 }
    );
  }
}
