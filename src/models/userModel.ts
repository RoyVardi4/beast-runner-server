import mongoose from "mongoose";
import { UserPreferences } from "src/types/UserFitnessData";

export interface UserData {
    _id?: string;
    email: string;
    refreshTokens?: string[];
    userPreferences?: UserPreferences;
}

const userPreferencesSchema = new mongoose.Schema<UserPreferences>({
    gender: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    userRunningLevel: {
        type: String,
        required: true,
    },
    userRunningGoal: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
})

const userSchema = new mongoose.Schema<UserData>({
    email: {
        type: String,
        required: true,
    },
    refreshTokens: {
        type: [String],
        required: false,
    },
    userPreferences: {
        type: userPreferencesSchema,
        required: false,
    }
});

const User = mongoose.model("User",userSchema);
export default User;
