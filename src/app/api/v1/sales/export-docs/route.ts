import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authz";
import { UserRole } from "@prisma/client";
import { getShipmentExportDocs } from "@/services/export-docs.service";

export async function GET(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.SALES_OFFICER,
  ]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const shipmentId = searchParams.get("shipmentId");
    const docType = searchParams.get("docType") || "all";

    if (!shipmentId) {
      return NextResponse.json(
        { error: "shipmentId is required" },
        { status: 400 }
      );
    }

    const docs = await getShipmentExportDocs(shipmentId);

    if (docType === "all") {
      return NextResponse.json(docs);
    } else if (
      docType === "commercial-invoice" ||
      docType === "packing-list" ||
      docType === "certificate-of-origin" ||
      docType === "bill-of-lading"
    ) {
      const docKey = docType.replace(/-/g, "").replace(/([A-Z])/g, (g) =>
        g.toLowerCase()
      );
      const key = docKey.charAt(0).toUpperCase() + docKey.slice(1);
      return NextResponse.json({
        [docType]: docs[key as keyof typeof docs],
      });
    } else {
      return NextResponse.json({ error: "Invalid docType" }, { status: 400 });
    }
  } catch (error) {
    console.error("Failed to generate export documents:", error);
    return NextResponse.json(
      { error: "Failed to generate export documents" },
      { status: 500 }
    );
  }
}
