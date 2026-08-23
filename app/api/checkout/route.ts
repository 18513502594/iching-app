import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Stripe key not configured" }, { status: 500 });
    }

    const stripe = new Stripe(apiKey);
    const { birthData } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `I Ching Yearly Personal Reading (${birthData.targetYear})`,
              description: 'Complete Multi-Dimension Life & Fortune Guidance',
            },
            unit_amount: 499,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/?paid=true`,
      cancel_url: `${baseUrl}/`,
      metadata: { birthData: JSON.stringify(birthData) }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}