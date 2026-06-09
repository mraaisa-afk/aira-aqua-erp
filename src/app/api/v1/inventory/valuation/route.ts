import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import {
  getInventoryValuationFIFO,
  getInventoryValuationWeightedAverage,
} from "@/services/inventory.service";

export async function GET(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.WAREHOUSE_OFFICER,
    UserRole.ACCOUNTS_OFFICER,
  ]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const method = searchParams.get("method") || "FIFO";

    let valuation;

    if (method === "WEIGHTED_AVERAGE") {
      valuation = await getInventoryValuationWeightedAverage();
    } else {
      valuation = await getInventoryValuationFIFO();
    }

    return NextResponse.json(valuation);
  } catch (error) {
    console.error("Failed to retrieve inventory valuation:", error);
    return NextResponse.json(
      { error: "Failed to retrieve inventory valuation" },
      { status: 500 }
    );
  }
}
