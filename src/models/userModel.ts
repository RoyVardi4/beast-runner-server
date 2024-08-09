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

const User = mongoose.model("User",userSchema);
export default User;
