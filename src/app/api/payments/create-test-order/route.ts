import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

/**
 * POST /api/payments/create-test-order
 * Returns a Razorpay order that can be used by the frontend Razorpay Checkout.
 * Expects JSON body: { amount: number } where amount is in rupees.
 */
export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // convert rupees to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
