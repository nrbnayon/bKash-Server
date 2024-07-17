import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  const { username, email, number, password, role, balance } = req.body;

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
    const hashedPassword = await bcryptjs.hash(password.toString(), 10);

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
      role,
      balance,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return next(err);
  }
};
export const signin = async (req, res, next) => {
  const { email, number, password } = req.body;

  if ((!email && !number) || !password) {
    return next(
      errorHandler(400, "Email/Phone number and password are required")
    );
  }

  try {
    let query = {};

    if (email) {
      query.email = email.toLowerCase().trim();
    } else if (number) {
      query.number = number.replace(/^\+|[^0-9]/g, "").trim();
    }

    const validUser = await User.findOne(query);

    if (!validUser) {
      return next(errorHandler(400, "Invalid email/number or password"));
    }

    const isPasswordValid = bcryptjs.compareSync(
      password.toString(),
      validUser.password
    );

    if (!isPasswordValid) {
      return next(errorHandler(400, "Invalid password"));
    }

    const token = jwt.sign(
      { id: validUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const { password: pass, ...rest } = validUser._doc;

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({ message: "Login successful", user: rest });
  } catch (err) {
    return next(err);
  }
};
