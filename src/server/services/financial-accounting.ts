export type FinancialCalculationInput = {
  subtotal: number; // in paise or rupees
  baseGarmentPrice: number; // in paise or rupees
  builtInShippingFee?: number; // in paise or rupees
  prepaidDiscountShare?: number; // in paise or rupees
};

export type FinancialLedgerBreakdown = {
  subtotal: number;
  baseGarmentPrice: number;
  builtInShippingFee: number;
  platformCommission: number; // 10% of baseGarmentPrice
  commissionGst: number; // 18% GST on platform commission
  tcsAmount: number; // 1% GST TCS under Sec 52
  prepaidDiscountShare: number;
  designerNetPayable: number;
};

export class FinancialAccountingEngine {
  /**
   * Calculates complete platform & designer financial ledger breakdown.
   * Rounding Rule: All calculations are rounded to the nearest integer.
   */
  calculateLedger(input: FinancialCalculationInput): FinancialLedgerBreakdown {
    const subtotal = Math.round(input.subtotal || 0);
    const baseGarmentPrice = Math.round(input.baseGarmentPrice || subtotal);
    const builtInShippingFee = Math.round(input.builtInShippingFee || 0);
    const prepaidDiscountShare = Math.round(input.prepaidDiscountShare || 0);

    // Rule 1: Platform Commission (10% on base garment price ONLY)
    const platformCommission = Math.round(baseGarmentPrice * 0.10);

    // Rule 2: 18% GST on Platform Commission
    const commissionGst = Math.round(platformCommission * 0.18);

    // Rule 3: 1% GST TCS (Section 52 e-commerce operator deduction on gross consideration)
    const grossConsideration = subtotal + builtInShippingFee;
    const tcsAmount = Math.round(grossConsideration * 0.01);

    // Rule 4: Designer Net Payable calculation
    // Net = Gross Consideration - Commission - Commission GST - TCS - Discount Share
    const designerNetPayable = Math.max(
      0,
      grossConsideration - platformCommission - commissionGst - tcsAmount - prepaidDiscountShare
    );

    return {
      subtotal,
      baseGarmentPrice,
      builtInShippingFee,
      platformCommission,
      commissionGst,
      tcsAmount,
      prepaidDiscountShare,
      designerNetPayable,
    };
  }
}
