import { db } from "@/lib/db";

export interface ExportDocumentData {
  shipmentId: string;
  invoiceNo: string;
  customerName: string;
  customerAddress: string;
  customerBIN?: string;
  customerTIN?: string;
  supplierName: string;
  supplierAddress: string;
  supplierBIN?: string;
  supplierTIN?: string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    hsCode?: string;
  }>;
  totalAmount: number;
  vatAmount: number;
  grossWeight: number;
  netWeight: number;
  containerNo?: string;
  sealNo?: string;
  vesselName?: string;
  voyageNo?: string;
  portOfLoading: string;
  portOfDischarge?: string;
  finalDestination?: string;
  billOfLadingNo?: string;
}

/**
 * Generate Commercial Invoice for export
 */
export function generateCommercialInvoice(data: ExportDocumentData): string {
  const invoiceDate = new Date().toISOString().split("T")[0];

  return `
COMMERCIAL INVOICE

Invoice Number: ${data.invoiceNo}
Invoice Date: ${invoiceDate}
Shipment ID: ${data.shipmentId}

EXPORTER (SELLER):
${data.supplierName}
${data.supplierAddress}
BIN: ${data.supplierBIN || "N/A"}
TIN: ${data.supplierTIN || "N/A"}

IMPORTER (BUYER):
${data.customerName}
${data.customerAddress}
BIN: ${data.customerBIN || "N/A"}
TIN: ${data.customerTIN || "N/A"}

SHIPMENT DETAILS:
Port of Loading: ${data.portOfLoading}
Port of Discharge: ${data.portOfDischarge || "N/A"}
Final Destination: ${data.finalDestination || "N/A"}
Vessel Name: ${data.vesselName || "N/A"}
Voyage Number: ${data.voyageNo || "N/A"}
Bill of Lading No: ${data.billOfLadingNo || "N/A"}

ITEMS:
${data.items
  .map(
    (item, idx) => `
${idx + 1}. ${item.productName}
   SKU: ${item.sku}
   HS Code: ${item.hsCode || "N/A"}
   Quantity: ${item.quantity} ${item.unit}
   Unit Price: BDT ${item.unitPrice.toFixed(2)}
   Total: BDT ${item.totalPrice.toFixed(2)}
`
  )
  .join("")}

TOTALS:
Subtotal: BDT ${(data.totalAmount - data.vatAmount).toFixed(2)}
VAT (15%): BDT ${data.vatAmount.toFixed(2)}
Total Amount: BDT ${data.totalAmount.toFixed(2)}

WEIGHTS:
Gross Weight: ${data.grossWeight} kg
Net Weight: ${data.netWeight} kg

Terms of Payment: As per agreement
Incoterms: FOB Chittagong

Prepared by: Aira Aqua ERP System
Date: ${invoiceDate}
`;
}

/**
 * Generate Packing List for export
 */
export function generatePackingList(data: ExportDocumentData): string {
  const packingDate = new Date().toISOString().split("T")[0];

  return `
PACKING LIST

Shipment ID: ${data.shipmentId}
Invoice Number: ${data.invoiceNo}
Packing Date: ${packingDate}

SHIPPER:
${data.supplierName}
${data.supplierAddress}

CONSIGNEE:
${data.customerName}
${data.customerAddress}

SHIPMENT DETAILS:
Container No: ${data.containerNo || "N/A"}
Seal No: ${data.sealNo || "N/A"}
Vessel: ${data.vesselName || "N/A"}
Voyage: ${data.voyageNo || "N/A"}
Port of Loading: ${data.portOfLoading}
Port of Discharge: ${data.portOfDischarge || "N/A"}

CONTENTS:
${data.items
  .map(
    (item, idx) => `
Package ${idx + 1}:
- Product: ${item.productName}
- SKU: ${item.sku}
- Quantity: ${item.quantity} ${item.unit}
- Weight: ${(item.quantity * (data.grossWeight / data.items.length)).toFixed(2)} kg
`
  )
  .join("")}

TOTAL WEIGHT: ${data.grossWeight} kg (Gross), ${data.netWeight} kg (Net)
TOTAL PACKAGES: ${data.items.length}

Special Handling Instructions:
- Keep in cool/refrigerated condition
- Handle with care - Perishable goods
- Do not expose to direct sunlight

Prepared by: Aira Aqua ERP System
Date: ${packingDate}
`;
}

/**
 * Generate Certificate of Origin for Bangladesh exports
 */
export function generateCertificateOfOrigin(data: ExportDocumentData): string {
  const certDate = new Date().toISOString().split("T")[0];
  const certNo = `BD-${Date.now()}`;

  return `
CERTIFICATE OF ORIGIN
(Made in Bangladesh)

Certificate Number: ${certNo}
Date of Issue: ${certDate}
Commercial Invoice Number: ${data.invoiceNo}

EXPORTER'S DETAILS:
Name: ${data.supplierName}
Address: ${data.supplierAddress}
BIN: ${data.supplierBIN || "N/A"}
TIN: ${data.supplierTIN || "N/A"}

CONSIGNEE'S DETAILS:
Name: ${data.customerName}
Address: ${data.customerAddress}

COUNTRY OF ORIGIN: BANGLADESH

DESCRIPTION OF GOODS:
${data.items
  .map(
    (item) => `
- ${item.productName}
  HS Code: ${item.hsCode || "N/A"}
  Quantity: ${item.quantity} ${item.unit}
  Value: BDT ${item.totalPrice.toFixed(2)}
`
  )
  .join("")}

TOTAL INVOICE VALUE: BDT ${data.totalAmount.toFixed(2)}

I hereby certify that the goods described above are of Bangladesh origin and 
have been produced, manufactured or processed in Bangladesh in accordance with 
the rules of origin requirements.

This certificate is issued in accordance with the provisions of the 
Generalized System of Preferences (GSP) and other applicable trade agreements.

Authorized Signatory: ___________________
Name: Aira Aqua ERP System
Date: ${certDate}

Stamp/Seal: [Chamber of Commerce & Industry Stamp]
`;
}

/**
 * Generate Bill of Lading
 */
export function generateBillOfLading(data: ExportDocumentData): string {
  const bolDate = new Date().toISOString().split("T")[0];
  const bolNo = data.billOfLadingNo || `BOL-${Date.now()}`;

  return `
BILL OF LADING

Bill of Lading Number: ${bolNo}
Date of Issue: ${bolDate}
Port of Loading: ${data.portOfLoading}
Port of Discharge: ${data.portOfDischarge || "N/A"}

SHIPPER:
${data.supplierName}
${data.supplierAddress}

CONSIGNEE:
${data.customerName}
${data.customerAddress}

NOTIFY PARTY:
${data.customerName}

VESSEL: ${data.vesselName || "N/A"}
VOYAGE: ${data.voyageNo || "N/A"}

CONTAINER DETAILS:
Container Number: ${data.containerNo || "N/A"}
Seal Number: ${data.sealNo || "N/A"}

CARGO DESCRIPTION:
${data.items
  .map(
    (item, idx) => `
${idx + 1}. ${item.productName}
   Quantity: ${item.quantity} ${item.unit}
   HS Code: ${item.hsCode || "N/A"}
`
  )
  .join("")}

WEIGHT AND MEASUREMENT:
Gross Weight: ${data.grossWeight} kg
Net Weight: ${data.netWeight} kg

FREIGHT CHARGES:
Freight: As per agreement
Terms: FOB Chittagong

MARKS AND NUMBERS:
Marks: ${data.supplierName} - ${data.invoiceNo}

RECEIVED IN APPARENT GOOD ORDER AND CONDITION:
${data.items.length} Package(s)

Issued at: Chittagong, Bangladesh
Date: ${bolDate}

Carrier's Authorized Representative: ___________________
Signature: ___________________
`;
}

/**
 * Get shipment export documentation
 */
export async function getShipmentExportDocs(shipmentId: string) {
  const shipment = await db.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      invoice: {
        include: {
          so: {
            include: {
              customer: true,
              items: {
                include: {
                  product: {
                    include: {
                      unit: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!shipment) {
    throw new Error("Shipment not found");
  }

  // Get supplier info (company info - would be stored in settings)
  const supplier = {
    name: "Aira Aqua & Fisheries Ltd",
    address: "Chittagong, Bangladesh",
    bin: "N/A",
    tin: "N/A",
  };

  const data: ExportDocumentData = {
    shipmentId: shipment.id,
    invoiceNo: shipment.invoice.invoiceNo,
    customerName: shipment.invoice.so.customer.name,
    customerAddress: shipment.invoice.so.customer.address || "",
    customerBIN: shipment.invoice.so.customer.binNumber || undefined,
    customerTIN: shipment.invoice.so.customer.tinNumber || undefined,
    supplierName: supplier.name,
    supplierAddress: supplier.address,
    supplierBIN: supplier.bin,
    supplierTIN: supplier.tin,
    items: shipment.invoice.so.items.map((item) => ({
      productName: item.product.name,
      sku: item.product.sku,
      quantity: Number(item.quantity),
      unit: item.product.unit.symbol,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.quantity) * Number(item.unitPrice),
      hsCode: (item.product as any).hsCode,
    })),
    totalAmount: Number(shipment.invoice.totalAmount),
    vatAmount: Number(shipment.invoice.vatAmount || 0),
    grossWeight: Number(shipment.grossWeight || 0),
    netWeight: Number(shipment.netWeight || 0),
    containerNo: shipment.containerNo || undefined,
    sealNo: shipment.sealNo || undefined,
    vesselName: shipment.vesselName || undefined,
    voyageNo: shipment.voyageNo || undefined,
    portOfLoading: shipment.portOfLoading || "Chittagong, Bangladesh",
    portOfDischarge: shipment.portOfDischarge || undefined,
    finalDestination: shipment.finalDestination || undefined,
    billOfLadingNo: shipment.billOfLadingNo || undefined,
  };

  return {
    commercialInvoice: generateCommercialInvoice(data),
    packingList: generatePackingList(data),
    certificateOfOrigin: generateCertificateOfOrigin(data),
    billOfLading: generateBillOfLading(data),
  };
}
