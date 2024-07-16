import { type } from "express/lib/response";
import { min } from "moment-timezone";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    number: {
      type: Number,
      min: 11,
      max: 14,
      required: true,
      unique: true,
    },
    password: {
      type: Number,
      min: 5,
      max: 5,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
