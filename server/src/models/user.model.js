import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["student", "teacher", "admin"],
            default: "student",
        },

        bio: {
            type: String,
            trim: true,
            default: "",
        },

        preferredMode: {
            type: String,
            enum: ["normal", "low-bandwidth"],
            default: "normal",
        },

        streakCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        lastActiveAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

const User = mongoose.model("User", userSchema);

export default User;
