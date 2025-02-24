import express from "express";
import colors from "colors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
dotenv.config();
// __dirname सेट करें
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env कॉन्फ़िगर करें
dotenv.config();

// डेटाबेस कनेक्ट करें
connectDB();

// Express ऐप बनाएं
const app = express();

// मिडलवेयर
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// API रूट्स
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// स्टैटिक फोल्डर सर्व करें
app.use(express.static(path.join(__dirname, "./client/dist")));

// कोई भी अन्य रूट पर React ऐप लोड करें
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

// पोर्ट सेट करें
const PORT = process.env.PORT ||8080;

// सर्वर रन करें
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan
      .white
  );
});
