import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";

export const register = async (req, res, next) => {
  const { username, email, number, password } = req.body;

  if (!username || !email || !number || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  const convertNumber = number.replace(/^\+|[^0-9]/g, "");

  if (convertNumber.length !== 11) {
    return next(errorHandler(400, "Phone number must be 11 digits"));
  }

  if (password.length !== 5) {
    return next(errorHandler(400, "Password must be a 5-digit number"));
  }

  try {
    const hashedPassword = await bcrypt.hash(password.toString(), 10);

    const existingUser = await User.findOne({
      $or: [{ number: convertNumber }, { email }],
    });

    if (existingUser) {
      return next(
        errorHandler(400, "User with this number or email already exists")
      );
    }

    const newUser = new User({
      username,
      email,
      number: convertNumber,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return next(err);
  }
};
