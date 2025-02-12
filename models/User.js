import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String },
    username: { type: String, required: true },
    profilepic: { type: String },
    coverpic: { type: String },
    stripeid: { type: String },
    stripesecret: { type: String },
    workShowcase: [{
        type: { type: String, enum: ['photo', 'video', 'github', 'youtube'] },
        projectName: {type: String},
        url: { type: String },
        description: { type: String }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || model("User", UserSchema);