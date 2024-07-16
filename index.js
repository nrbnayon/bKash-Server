import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

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
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

mongoose
  .connect(uri)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("bKash").collection("AllUser");

    // JWT
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2h",
      });
      res.send({ token });
    });

    // Verify token
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "forbidden access" });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    };

    // Example of using verifyToken middleware
    app.get("/protected", verifyToken, (req, res) => {
      res.send({ message: "This is a protected route" });
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

run().catch(console.dir);

// Server start
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(port, () => {
  console.log(`Server Running on port ${port}`);
});

// mongoose
//   .connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("DB Connected");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
