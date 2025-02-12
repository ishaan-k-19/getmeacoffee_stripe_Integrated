// /app/api/checkout-session/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import Payment from '@/models/Payment';
import User from '@/models/User';
import {connectDB} from '@/db/connectDb';


export async function POST(req) {
    await connectDB()
    
    const { amount, username, paymentform } = await req.json();
    let user = await User.findOne({username:username})
    const stripeSecret = user.stripesecret;
    const stripe = new Stripe(stripeSecret)
    
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: 'Donation',
                        },
                        unit_amount: amount * 100, // amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            success_url: `${req.headers.get('origin')}/${username}?paymentdone=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/${username}?paymentdone=false`,
            payment_intent_data: {
                metadata: {
                  "name": username,
                },
              },
              client_reference_id: username,
        });
        await Payment.create({oid: session.id, amount: amount, to_user: username, name: paymentform.name, message: paymentform.message})

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error('Error creating session:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
