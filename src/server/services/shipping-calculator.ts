import { prisma } from "@/server/db";
import { ShippingZoneType } from "@prisma/client";

export type CartItemInput = {
  productId: string;
  designerId: string;
  price: number;
  quantity: number;
  weightGrams?: number | null;
};

export type DesignerShippingBreakdown = {
  designerId: string;
  subtotal: number;
  totalWeightGrams: number;
  zone: ShippingZoneType;
  shippingFee: number;
  platformCommission: number;
  designerNetEarnings: number;
  grossTotal: number;
};

export class ShippingCalculatorService {
  /**
   * Resolves pincode to zone. Defaults based on state or standard region mapping.
   */
  resolveZone(destinationPincode: string, originPincode: string): ShippingZoneType {
    const destPrefix = destinationPincode.slice(0, 2);
    const originPrefix = originPincode.slice(0, 2);

    if (destPrefix === originPrefix) {
      return "zone_a"; // Same state
    }

    // Major Metro Pincodes (Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad)
    const metroPrefixes = ["11", "40", "56", "70", "60", "50"];
    if (metroPrefixes.includes(destPrefix) && metroPrefixes.includes(originPrefix)) {
      return "zone_b"; // Metro-to-metro
    }

    // Remote / NE / J&K Pincodes (Jammu, Kashmir, NE States)
    const remotePrefixes = ["19", "79", "78"];
    if (remotePrefixes.includes(destPrefix)) {
      return "zone_d";
    }

    return "zone_c"; // Rest of India
  }

  /**
   * Calculates weight slab rate in paise (or Rupees converted to paise).
   */
  getShippingRateForZone(zone: ShippingZoneType, weightGrams: number): number {
    const baseRatePaise =
      zone === "zone_a" ? 7900 : zone === "zone_b" ? 9900 : zone === "zone_c" ? 14900 : 19900;

    // Weight slab multiplier for items over 1kg (1000g)
    const kgMultiplier = Math.max(1, Math.ceil(weightGrams / 1000));
    return baseRatePaise * kgMultiplier;
  }

  /**
   * Group cart items by designer and compute multi-vendor financial & shipping split.
   */
  async calculateMultiVendorSplit(
    items: CartItemInput[],
    destinationPincode: string
  ): Promise<{
    breakdownByDesigner: Record<string, DesignerShippingBreakdown>;
    grandSubtotal: number;
    grandShippingFee: number;
    grandTotal: number;
  }> {
    const grouped: Record<string, CartItemInput[]> = {};
    for (const item of items) {
      if (!grouped[item.designerId]) {
        grouped[item.designerId] = [];
      }
      grouped[item.designerId].push(item);
    }

    const breakdownByDesigner: Record<string, DesignerShippingBreakdown> = {};
    let grandSubtotal = 0;
    let grandShippingFee = 0;

    for (const [designerId, designerItems] of Object.entries(grouped)) {
      // Get designer shipping origin address
      const verification = await prisma.businessVerification.findUnique({
        where: { designerId },
      });
      const originPincode = verification?.shippingPincode || "110001";

      const zone = this.resolveZone(destinationPincode, originPincode);

      let subtotal = 0;
      let totalWeight = 0;

      for (const item of designerItems) {
        subtotal += item.price * item.quantity;
        totalWeight += (item.weightGrams || 500) * item.quantity;
      }

      const shippingFee = this.getShippingRateForZone(zone, totalWeight);

      // Commission Rule: 15% applies ONLY to product subtotal
      const platformCommission = Math.round(subtotal * 0.15);
      const designerNetEarnings = subtotal - platformCommission + shippingFee;
      const grossTotal = subtotal + shippingFee;

      breakdownByDesigner[designerId] = {
        designerId,
        subtotal,
        totalWeightGrams: totalWeight,
        zone,
        shippingFee,
        platformCommission,
        designerNetEarnings,
        grossTotal,
      };

      grandSubtotal += subtotal;
      grandShippingFee += shippingFee;
    }

    return {
      breakdownByDesigner,
      grandSubtotal,
      grandShippingFee,
      grandTotal: grandSubtotal + grandShippingFee,
    };
  }
}
