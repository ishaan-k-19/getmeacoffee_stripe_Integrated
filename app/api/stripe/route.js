import Stripe from "stripe"
import { NextResponse } from "next/server"
import {connectDB} from "@/db/connectDb"
import Payment from "@/models/Payment"
import User from "@/models/User"


export async function POST(req) {
    await connectDB()
    const payload = await req.text()
    const response = JSON.parse(payload)
    const sig = req.headers.get("stripe-signature")
    const mname = response.data.object.metadata.name;
    const cname = response.data.object.client_reference_id;
    let user;

    if(!mname){
         user = await User.findOne({ username: cname });
    }else{
         user = await User.findOne({ username: mname });
    }

    const stripeSecret = user.stripesecret;
    const stripe = new Stripe(stripeSecret)
    




    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        // return NextResponse.json({ status: "Failed", error: err.message }, { status: 400 });
        return NextResponse.json({ "signature": sig });
    }


    try{
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const payment = await Payment.findOne({ oid: session.id });
            if (payment) {
                payment.done = 'true';
                await payment.save();
            } else {
                console.error('Payment record not found for session ID:', session.id);
            }

            console.log('Payment completed successfully.');
        }


        return NextResponse.json({ status: "Success" })


    } catch (error) {
        return NextResponse.json({ status: "Failed", error })
    }
}