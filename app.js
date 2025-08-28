import express from "express";
import errorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import cors from "cors";
import NodeCache from "node-cache";
import morgan from "morgan";
import adminRoutes from "./routes/adminRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import { formatDate } from "./utils/date.js";

// Load environment variables
config();

const app = express();
export const myCache = new NodeCache();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
    origin: ["https://blogdesigngobinath.netlify.app","https://lets-blog-client.netlify.app","http://localhost:3000", "http://localhost:5173", "https://blogdesign-gilt.vercel.app","https://blogadmin-sage.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
}));
app.use(morgan("dev"));

// Routes
app.use("/api/v1", adminRoutes);
app.use("/api/v1", blogRoutes);




// Function to format the date


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Blog API",
        author: "NeonShark",
        date: formatDate(new Date()), // Formatted date
        // Dynamic health status
    });
});


// Error handling middleware
app.use(errorMiddleware);

export default app;
