export type FinancialCalculationInput = {
  subtotal: number; // Product subtotal in paise
  shippingFee: number; // Shipping fee in paise
};

export type FinancialCalculationResult = {
  subtotal: number;
  shippingFee: number;
  grossTotal: number;
  platformCommission: number; // 15% of product subtotal
  commissionGst: number; // 18% GST on commission
  tcsDeducted: number; // 1% TCS Section 52 on (subtotal + shippingFee)
  designerNetEarnings: number; // grossTotal - commission - commissionGst - tcs
};

export class FinancialCalculatorService {
  /**
   * Calculates 15% commission, 18% GST on commission, 1% Section 52 TCS, and Net Payout.
   */
  calculateFinancialSplit(input: FinancialCalculationInput): FinancialCalculationResult {
    const subtotal = Math.max(0, input.subtotal);
    const shippingFee = Math.max(0, input.shippingFee);
    const grossTotal = subtotal + shippingFee;

    // 15% Platform Commission on Product Subtotal ONLY
    const platformCommission = Math.round(subtotal * 0.15);

    // 18% GST on Platform Commission
    const commissionGst = Math.round(platformCommission * 0.18);

    // 1% Section 52 TCS Deduction on Gross E-Commerce Value
    const tcsDeducted = Math.round(grossTotal * 0.01);

    // Designer Net Earnings Formula
    const designerNetEarnings = grossTotal - platformCommission - commissionGst - tcsDeducted;

    return {
      subtotal,
      shippingFee,
      grossTotal,
      platformCommission,
      commissionGst,
      tcsDeducted,
      designerNetEarnings: Math.max(0, designerNetEarnings),
    };
  }
}
