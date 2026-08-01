import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { FinancialCalculatorService } from "@/server/services/financial-calculator";
import { NotFoundError } from "@/server/errors";
import { fail } from "@/server/utils/api-response";

export const runtime = "nodejs";
const financialCalc = new FinancialCalculatorService();

/** GET /api/orders/[id]/invoice */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
        designer: {
          include: { businessVerification: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const verification = order.designer?.businessVerification;
    const sellerName = verification?.bankAccountName || order.designer?.name || "Designer House";
    const sellerGstin = verification?.gstin || "URP (Unregistered Person)";
    const sellerAddress = `${verification?.shippingAddress || "Atelier Studio"}, ${verification?.shippingCity || "Delhi"} - ${verification?.shippingPincode || "110001"}`;

    const buyerAddressObj = (order.shippingAddress as any) || {};
    const buyerName = buyerAddressObj.fullName || order.user?.name || "Buyer";
    const buyerAddressStr = `${buyerAddressObj.line1 || ""}, ${buyerAddressObj.city || ""}, ${buyerAddressObj.state || ""} ${buyerAddressObj.postalCode || ""}`;

    const fin = financialCalc.calculateFinancialSplit({
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
    });

    const subtotalRs = (order.subtotal / 100).toFixed(2);
    const shippingRs = (order.shippingFee / 100).toFixed(2);
    const totalRs = (order.total / 100).toFixed(2);
    const gstRate = 0.12; // 12% standard GST on garments
    const taxableValue = (order.subtotal / 1.12 / 100).toFixed(2);
    const totalGstAmount = (Number(subtotalRs) - Number(taxableValue)).toFixed(2);
    const cgstAmount = (Number(totalGstAmount) / 2).toFixed(2);
    const sgstAmount = (Number(totalGstAmount) / 2).toFixed(2);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GST Tax Invoice — #${order.id.slice(-8)}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 40px; color: #101010; font-size: 12px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #101010; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .box { background: #FAFAFA; border: 1px solid #E0E0E0; padding: 16px; border-radius: 12px; }
    .box-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #606060; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #F0F0F0; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #D0D0D0; }
    td { padding: 10px; border-bottom: 1px solid #E0E0E0; }
    .totals { margin-top: 24px; margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E0E0E0; }
    .grand-total { font-size: 14px; font-weight: bold; border-top: 2px solid #101010; border-bottom: 2px solid #101010; margin-top: 8px; padding: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">GST Tax Invoice</div>
      <div>Invoice #: DS-INV-${order.id.slice(-8).toUpperCase()}</div>
      <div>Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold; font-size: 14px;">Designer's Street</div>
      <div>Luxury Fashion Marketplace</div>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="box-title">Seller Details (Atelier House)</div>
      <strong>${sellerName}</strong><br>
      ${sellerAddress}<br>
      <strong>GSTIN:</strong> ${sellerGstin}
    </div>
    <div class="box">
      <div class="box-title">Buyer Shipping Details</div>
      <strong>${buyerName}</strong><br>
      ${buyerAddressStr}<br>
      <strong>Place of Supply:</strong> ${buyerAddressObj.state || "Delhi"}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>HSN Code</th>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price (INR)</th>
        <th>Taxable Value (INR)</th>
        <th>CGST (6%)</th>
        <th>SGST (6%)</th>
        <th>Total Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (item) => `
        <tr>
          <td><strong>6204</strong></td>
          <td>${item.brand} — ${item.name} (Size: ${item.size})</td>
          <td>${item.quantity}</td>
          <td>₹${(item.price / 100).toFixed(2)}</td>
          <td>₹${((item.price * item.quantity) / 1.12 / 100).toFixed(2)}</td>
          <td>₹${(((item.price * item.quantity) / 1.12 / 100) * 0.06).toFixed(2)}</td>
          <td>₹${(((item.price * item.quantity) / 1.12 / 100) * 0.06).toFixed(2)}</td>
          <td><strong>₹${((item.price * item.quantity) / 100).toFixed(2)}</strong></td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Product Subtotal:</span> <span>₹${subtotalRs}</span></div>
    <div class="totals-row"><span>CGST (6%):</span> <span>₹${cgstAmount}</span></div>
    <div class="totals-row"><span>SGST (6%):</span> <span>₹${sgstAmount}</span></div>
    <div class="totals-row"><span>Direct Shipping Fee:</span> <span>₹${shippingRs}</span></div>
    <div class="totals-row grand-total"><span>Grand Total Paid:</span> <span>₹${totalRs}</span></div>
  </div>
</body>
</html>`;

    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
