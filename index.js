import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

const uri = process.env.MONGODB;
if (!uri) {
  console.error("MongoDB connection string is missing!");
  process.exit(1);
}

// MongoDB
mongoose
  .connect(uri, { dbName: "bKash" })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// JWT
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
  });
  res.send({ token });
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Forbidden access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Forbidden access" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
};

// Routess
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

// Example of using verifyToken middleware
app.get("/protected", verifyToken, (req, res) => {
  res.send({ message: "This is a protected route" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Server start
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(port, () => {
  console.log(`Server Running on port ${port}`);
});
