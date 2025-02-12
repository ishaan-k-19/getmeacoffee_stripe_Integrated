"use server"

import Payment from "@/models/Payment"
import {connectDB} from "@/db/connectDb"
import User from "@/models/User"


const toPlainObject = (doc) => {
    const plainDoc = { ...doc, _id: doc._id.toString() };
    return plainDoc;
};


export const fetchuser = async (identifier) => {
    await connectDB();
    let u = await User.findOne({ username: identifier }).lean();
    
    if (!u) {
        u = await User.findOne({ email: identifier }).lean();
    }
    
    if (u) {
        u = toPlainObject(u);
    }
    
    return u;
}
export const fetchpayments = async (username) => {
    await connectDB();
    let payments = await Payment.find({ to_user: username, done: true })
        .sort({ amount: -1 })
        .limit(10)
        .lean();
    payments = payments.map((payment) => toPlainObject(payment));
    return payments;
}

export const fetchAndUpdatePaymentStatus = async (sessionId) => {
    await connectDB();
    let payment = await Payment.findOne({ oid: sessionId });
    if (payment) {
        payment.done = true;
        await payment.save();
        return { success: true, message: "Payment status updated successfully" };
    } else {
        return { success: false, message: "Payment not found" };
    }
}

export const updateProfile = async (data, oldusername) => {
    await connectDB();
    const { profilepic, coverpic, ...rest } = data;

    // Update the user profile
    const updateData = { ...rest };
    if (profilepic) updateData.profilepic = profilepic;
    if (coverpic) updateData.coverpic = coverpic;

    if (oldusername !== updateData.username) {
        const existingUser = await User.findOne({ username: updateData.username }).lean();
        if (existingUser) {
            return { error: "User already exists" };
        }
        await User.updateOne({ email: updateData.email }, updateData);
        await Payment.updateMany({ to_user: oldusername }, { to_user: updateData.username });
    } else {
        await User.updateOne({ email: updateData.email }, updateData);
    }

    return { success: true, message: "Profile updated successfully" };
};