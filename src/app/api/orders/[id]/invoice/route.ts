import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { NotFoundError } from "@/server/errors";

export const runtime = "nodejs";

/** GET /api/orders/[id]/invoice - GST Tax Invoice Generator */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        designer: { include: { businessVerification: true } },
        items: true,
      },
    });

    if (!order) throw new NotFoundError("Order not found");

    const invoiceNum = `DS-INV-${order.id.slice(-6).toUpperCase()}`;
    const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const sellerName = order.designer?.name || "Designer's Street Luxury Marketplace";
    const sellerGstin = order.designer?.gstin || order.designer?.businessVerification?.gstin || "07AAAAA0000A1Z5";
    const sellerAddress = order.designer?.businessVerification?.shippingAddress || "Atelier House, Fashion District, New Delhi, India 110001";

    const ship = (order.shippingAddress as any) || {};
    const buyerName = ship.fullName || order.user?.name || order.user?.email || "Valued Customer";
    const buyerAddressStr = `${ship.line1 || ""}${ship.line2 ? `, ${ship.line2}` : ""}, ${ship.city || ""}, ${ship.state || ""} - ${ship.postalCode || ""}`;

    const totalRupees = order.total / 100;
    const gstRupees = order.gstAmount ? order.gstAmount / 100 : Math.round(totalRupees * 0.12);
    const taxableAmount = totalRupees - gstRupees;
    const cgst = Math.round((gstRupees / 2) * 100) / 100;
    const sgst = Math.round((gstRupees / 2) * 100) / 100;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GST Tax Invoice - ${invoiceNum}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #101010; margin: 0; padding: 40px; background: #faf8f5; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #e5e0d8; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #101010; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 800; text-transform: uppercase; tracking: 2px; }
    .invoice-title { text-align: right; font-size: 14px; font-weight: bold; color: #706e6b; text-transform: uppercase; }
    .inv-num { font-size: 18px; color: #101010; font-family: monospace; font-weight: bold; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .box-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #706e6b; letter-spacing: 1px; margin-bottom: 6px; }
    .box-body { font-size: 12px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f2eee9; text-align: left; padding: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e5e0d8; }
    td { padding: 12px; font-size: 12px; border-bottom: 1px solid #f2eee9; }
    .totals { width: 300px; margin-left: auto; font-size: 12px; line-height: 1.8; }
    .totals div { display: flex; justify-content: space-between; }
    .grand-total { border-top: 2px solid #101010; padding-top: 8px; margin-top: 8px; font-size: 16px; font-weight: bold; }
    .footer { text-align: center; margin-top: 40px; pt: 20px; font-size: 10px; color: #706e6b; border-top: 1px solid #e5e0d8; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">DESIGNER'S STREET</div>
        <div style="font-size: 11px; color: #706e6b; margin-top: 4px;">Curated Luxury Fashion Marketplace</div>
      </div>
      <div class="invoice-title">
        GST TAX INVOICE
        <div class="inv-num">${invoiceNum}</div>
        <div style="font-size: 11px; color: #101010; font-weight: normal; margin-top: 2px;">Date: ${invoiceDate}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="box-title">Seller / Supplier Details</div>
        <div class="box-body">
          <strong>${sellerName}</strong><br>
          GSTIN: <strong>${sellerGstin}</strong><br>
          ${sellerAddress}
        </div>
      </div>
      <div>
        <div class="box-title">Billed To / Delivery Address</div>
        <div class="box-body">
          <strong>${buyerName}</strong><br>
          ${buyerAddressStr}<br>
          Phone: ${ship.phone || "N/A"}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>HSN Code</th>
          <th>Qty</th>
          <th>Size</th>
          <th>Unit Price (INR)</th>
          <th style="text-align: right;">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item) => `
          <tr>
            <td><strong>${item.name}</strong><br><span style="font-size:10px; color:#706e6b;">By ${item.brand || sellerName}</span></td>
            <td>6204</td>
            <td>${item.quantity}</td>
            <td>${item.size}</td>
            <td>₹${item.price.toLocaleString("en-IN")}</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      <div><span>Taxable Value:</span> <span style="font-family: monospace;">₹${taxableAmount.toLocaleString("en-IN")}</span></div>
      <div><span>CGST (9%):</span> <span style="font-family: monospace;">₹${cgst.toLocaleString("en-IN")}</span></div>
      <div><span>SGST (9%):</span> <span style="font-family: monospace;">₹${sgst.toLocaleString("en-IN")}</span></div>
      <div><span>Shipping (Built-in):</span> <span style="font-family: monospace; color: #047857; font-weight: bold;">FREE</span></div>
      <div class="grand-total"><span>Grand Total (INR):</span> <span style="font-family: monospace;">₹${totalRupees.toLocaleString("en-IN")}</span></div>
    </div>

    <div class="footer">
      This is a computer-generated GST Tax Invoice under Section 31 of the CGST Act 2017. No signature required.
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
