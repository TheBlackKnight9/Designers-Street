import { prisma } from "../server/db";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";
import { Resend } from "resend";

async function main() {
  console.log("==========================================");
  console.log("🚀 TESTING ALL INTEGRATIONS FOR DESIGNERS STREET");
  console.log("==========================================");

  let allPassed = true;

  // 1. SUPABASE / POSTGRESQL DATABASE TEST
  console.log("\n1. Testing Supabase PostgreSQL Database...");
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const designerCount = await prisma.designerHouse.count();
    console.log("   ✅ SUPABASE DATABASE CONNECTED!");
    console.log(`      • Registered Users: ${userCount}`);
    console.log(`      • Designer Houses: ${designerCount}`);
    console.log(`      • Products: ${productCount}`);
    console.log(`      • Total Orders: ${orderCount}`);
  } catch (err: any) {
    allPassed = false;
    console.error("   ❌ SUPABASE DATABASE ERROR:", err?.message || err);
  }

  // 2. CLOUDINARY MEDIA ENGINE TEST
  console.log("\n2. Testing Cloudinary Media Engine...");
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const ping = await cloudinary.api.ping();
    console.log("   ✅ CLOUDINARY CONNECTED!");
    console.log(`      • Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`      • Status: ${ping.status}`);
  } catch (err: any) {
    allPassed = false;
    console.error("   ❌ CLOUDINARY ERROR:", err?.message || err);
  }

  // 3. RAZORPAY PAYMENT GATEWAY TEST
  console.log("\n3. Testing Razorpay Payment Gateway...");
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    // Create a 100 paise (₹1) test order
    const testOrder = await razorpay.orders.create({
      amount: 100,
      currency: "INR",
      receipt: `test_verify_${Date.now()}`,
    });

    console.log("   ✅ RAZORPAY CONNECTED!");
    console.log(`      • Key ID: ${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}`);
    console.log(`      • Test Order ID Created: ${testOrder.id}`);
    console.log(`      • Order Amount: ₹${Number(testOrder.amount) / 100} (${testOrder.currency})`);
  } catch (err: any) {
    allPassed = false;
    console.error("   ❌ RAZORPAY ERROR:", err?.message || err);
  }

  // 4. RESEND EMAIL GATEWAY TEST
  console.log("\n4. Testing Resend Email Gateway...");
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY missing from environment");
    }

    const resend = new Resend(resendApiKey);

    // List domains or send verification ping to check key authenticity
    const domains = await resend.domains.list();
    console.log("   ✅ RESEND API KEY VALIDATED!");
    console.log(`      • Key: ${resendApiKey.slice(0, 8)}...`);
    const domainList = (domains as any)?.data?.data || (domains as any)?.data || [];
    console.log(`      • Configured Domains: ${Array.isArray(domainList) ? domainList.length : 0}`);
  } catch (err: any) {
    allPassed = false;
    console.error("   ❌ RESEND ERROR:", err?.message || err);
  }

  console.log("\n==========================================");
  if (allPassed) {
    console.log("🎉 ALL 4 EXTERNAL SERVICES ARE WORKING 100% PERFECTLY!");
  } else {
    console.log("⚠️ SOME SERVICES ENCOUNTERED ISSUES — SEE LOGS ABOVE.");
  }
  console.log("==========================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
