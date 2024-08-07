import mongoose from "mongoose";

export interface UserData {
    _id?: string;
    email: string;
    refreshTokens?: string[];
}

const userSchema = new mongoose.Schema<UserData>({
    email: {
        type: String,
        required: true,
    },
    refreshTokens: {
        type: [String],
        required: false,
    },
});

export default mongoose.model<UserData>("User", userSchema);
