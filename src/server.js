import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser  from "cookie-parser";
import connectDB from "./config/db.js";
import morgan from "morgan";
import authenticate from "./middleware/authenticate.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js"


dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json({limit:"50mb"})); // Parse incoming JSON requests
app.use(cookieParser());  
app.use(morgan("dev"));
app.use(cors({origin:["https://bclicscom.vercel.app","http://localhost:5175"], credentials:true}))
app.disable("x-powered-by"); //less hacker know about our stack



// Routes
// default route
app.get("/",(req,res) => {
  return res.status(200).json({
    status:"success",
    statusCode:200,
    message:`Welcome to ${process.env.APP_NAME}`
  })
})


//Other  Routes

//Auth Route
app.use("/api",authRoutes);

// Protected Route
app.use("/api/v1",authenticate);

// User-related routes
app.use("/api/v1/users", userRoutes); 




// Default error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});


// NOT FOUND ROUTE
app.use("*",(req,res) => {
  res.status(400).json({
    status:"error",
    statusCode:400,
    message:"Error: Wrong Method"
  })
})


// Start Server
const PORT = process.env.PORT || 8000;

export const start = async() => {
  //Connect to MongoDB
  await connectDB();
  app.listen(PORT, () =>
    console.log(`Server started at http://localhost:${PORT}`)
  );
  
}