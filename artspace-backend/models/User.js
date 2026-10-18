
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    studentId: {
      type: String,
      trim: true,
      default: null,
    },

    faculty: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      required: true,
    },

    authProvider: {
      type: String,
      enum: ["microsoft"],
      default: "microsoft",
    },

    providerUserId: {
      type: String,
      trim: true,
      default: null,
    },

    profileImage: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.index(
  { authProvider: 1, providerUserId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerUserId: { $type: "string" },
    },
  }
);

module.exports = mongoose.model("User", userSchema);
