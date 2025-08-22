import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import axios from "axios";
import path from "path";
import FormData from "form-data";
import dotenv from "dotenv";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Load environment variables
dotenv.config({
  path: "./.env",
});

// Constants
const db_name = "chat_bot";

// Utility Classes and Functions
class ApiError extends Error {
  constructor(statuscode, message = "failure", error, stack = "") {
    super(message);
    this.statuscode = statuscode;
    this.stack = stack;
    this.message = message;
    this.data = null;
    this.error = error;
  }
}

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}

const AsyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath); // Clean up local file
    return response;
  } catch (error) {
    console.error("Error in uploading to Cloudinary:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Database Connection
const connectDatabase = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}/${db_name}`
    );
    console.log(`Database connected!! ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

// Mongoose Models
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    history: [
      {
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        vectorPath: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.GenerateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXP || "1h" }
  );
};

UserSchema.methods.GenerateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXP || "7d",
  });
};

const User = mongoose.model("User", UserSchema);

const PdfSchema = new Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    vectorPath: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PDFUpload = mongoose.model("PDFHistory", PdfSchema);

// Middleware
const VerifyUser = AsyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken; // Fixed typo: accesstoken to accessToken
  if (!token) {
    throw new ApiError(401, "No access token found");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(decodedToken.id).select(
      "-refreshToken -password"
    );
    if (!user) {
      throw new ApiError(401, "No user found for this token");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    throw new ApiError(401, "Invalid or expired token");
  }
});

// Controllers
const GenerateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = await user.GenerateAccessToken();
    const refreshToken = await user.GenerateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(
      500,
      "Access or refresh token failure: " + error.message
    );
  }
};

const creatingUser = AsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this username or email already exists");
  }

  const userObj = {
    username,
    email,
    password,
  };

  try {
    const newUser = await User.create(userObj);
    const createdUser = await User.findById(newUser?._id).select("-password");

    if (!createdUser) {
      throw new ApiError(500, "Failed to create user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Username or email already exists");
    }
    throw new ApiError(500, "Failed to create user: " + error.message);
  }
});

const LoginUser = AsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!password || (!username && !email)) {
    throw new ApiError(
      400,
      "Password and either username or email are required"
    );
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await GenerateAccessRefreshToken(
    user._id
  );

  const finalUser = await User.findById(user._id).select("-password -email");

  const options = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, finalUser, "Logged in successfully"));
});

const HistoryHandle = AsyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  const userId = req.user._id;

  if (!filePath) {
    throw new ApiError(400, "No file uploaded");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const cloudinaryResult = await UploadOnCloudinary(filePath);
  if (!cloudinaryResult) {
    throw new ApiError(500, "Failed to upload file to Cloudinary");
  }

  user.history.push({
    fileName: req.file.originalname,
    filePath: cloudinaryResult.secure_url,
    vectorPath: cloudinaryResult.public_id, // Adjust based on actual vector path logic
  });
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "File saved in history"));
});

const FetchUserId = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "Error fetching user ID");
  }

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found in database");
  }

  const userObj = {
    userId: user._id,
    username: user.username,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, userObj, "User ID fetched successfully"));
});

const HandleUpload = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const pdfFile = req.file;

  if (!userId) throw new ApiError(401, "No user authenticated");
  if (!pdfFile) throw new ApiError(400, "No file uploaded");

  const existingFile = await PDFUpload.findOne({
    userid: userId,
    fileName: pdfFile.originalname,
  });

  if (existingFile) throw new ApiError(409, "File already uploaded");

  const formData = new FormData();
  formData.append("file", fs.createReadStream(pdfFile.path));

  try {
    const flaskResponse = await axios.post(
      "http://localhost:5000/api/ver1/pdf/uploadmern",
      formData,
      { headers: formData.getHeaders() }
    );

    if (flaskResponse.status !== 200) {
      throw new ApiError(500, "Flask upload failed");
    }

    const vectorPathFromFlask = flaskResponse.data.vectorPath;

    const newFile = new PDFUpload({
      userid: userId,
      fileName: pdfFile.originalname,
      filePath: pdfFile.path,
      vectorPath: vectorPathFromFlask,
    });
    await newFile.save();

    const user = await User.findById(userId);
    user.history.push({
      fileName: newFile.fileName,
      filePath: newFile.filePath,
      vectorPath: newFile.vectorPath,
    });
    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, newFile, "File uploaded and stored successfully")
      );
  } catch (error) {
    console.error("PDF upload error:", error);
    throw new ApiError(500, "Failed to process PDF upload: " + error.message);
  } finally {
    if (fs.existsSync(pdfFile.path)) {
      fs.unlinkSync(pdfFile.path); // Clean up local file
    }
  }
});

// Express App Setup


app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));

// Routes
const userRouter = express.Router();
const pdfRouter = express.Router();

userRouter.post("/signupbackend", creatingUser);
userRouter.post("/loginbackend", LoginUser);
userRouter.post("/history", VerifyUser, upload.single("pdf"), HistoryHandle);
userRouter.get("/fetchcred", VerifyUser, FetchUserId);

pdfRouter.post("/uploadmern", VerifyUser, upload.single("pdf"), HandleUpload);

app.use("/api/ver1/user", userRouter);
app.use("/api/ver1/pdf", pdfRouter);

// Start Server
connectDatabase()
  .then(() => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Server is LIVE on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Server startup error:", error);
    process.exit(1);
  });

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  const statusCode = err.statuscode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json(new ApiResponse(statusCode, null, message));
});
