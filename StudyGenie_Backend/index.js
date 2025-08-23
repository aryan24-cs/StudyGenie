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
import PDFParser from "pdf2json";
import Tesseract from "tesseract.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Create uploads directory if it doesn't exist
const uploadDir = "./Uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads directory");
}

// Load environment variables
dotenv.config({ path: "./.env" });
console.log("Environment Variables:", {
  MONGO_URL: process.env.MONGO_URL,
  ACCESS_SECRET: !!process.env.ACCESS_SECRET,
  REFRESH_SECRET: !!process.env.REFRESH_SECRET,
  ACCESS_EXP: process.env.ACCESS_EXP,
  REFRESH_EXP: process.env.REFRESH_EXP,
  GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
  CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));

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

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Generate questions and summary using Gemini API
const generateQuestionsAndSummary = async (content) => {
  try {
    const prompt = `
      Based on the provided PDF or image, generate:
      1. A set of questions in the following format:
         - 2 multiple-choice questions with 4 options each and the correct answer specified.
         - 1 short-answer question.
         - 1 true/false question.
         - 1 summary question asking for a brief summary of the content.
      2. A concise summary of the content (50-100 words).
      3. A detailed summary of the content (300-500 words).
      
      Return the response in JSON format with the structure:
      {
        "quiz": [
          {"type": "multiple-choice", "question": string, "options": [string, string, string, string], "answer": string},
          {"type": "multiple-choice", "question": string, "options": [string, string, string, string], "answer": string}
        ],
        "shortAnswer": [{"type": "short-answer", "question": string}],
        "trueFalse": [{"type": "true-false", "question": string, "answer": boolean}],
        "summary": {"type": "summary", "question": string},
        "conciseSummary": string,
        "detailedSummary": string
      }
      
      Ensure the response is valid JSON without markdown code fences.
    `;
    const response = await geminiModel.generateContent([
      ...content,
      { text: prompt },
    ]);
    const result = await response.response;
    const generatedText = result.text();

    console.log("Raw Gemini response:", generatedText);

    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith("```json") && cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(7, -3).trim();
    } else if (cleanedText.startsWith("```") && cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(3, -3).trim();
    } else if (!cleanedText.startsWith("{")) {
      console.error("Non-JSON response detected:", generatedText);
      throw new ApiError(
        500,
        `Gemini API returned non-JSON response: ${generatedText.slice(0, 100)}`
      );
    }

    let resultData;
    try {
      resultData = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Failed to parse Gemini response:", cleanedText, error);
      throw new ApiError(
        500,
        `Failed to parse response from Gemini API: ${error.message}`
      );
    }

    if (
      !resultData.quiz ||
      !resultData.shortAnswer ||
      !resultData.trueFalse ||
      !resultData.summary ||
      !resultData.conciseSummary ||
      !resultData.detailedSummary
    ) {
      console.error("Invalid response format:", resultData);
      throw new ApiError(500, "Invalid response format returned by Gemini API");
    }

    return resultData;
  } catch (error) {
    console.error("Gemini API error:", error.message, error.stack);
    throw new ApiError(500, `Failed to generate content: ${error.message}`);
  }
};

// Evaluate user answers
const evaluateAnswers = (userAnswers, questions) => {
  let score = 0;
  const totalQuestions =
    questions.quiz.length +
    questions.shortAnswer.length +
    questions.trueFalse.length +
    1;
  const feedback = [];

  questions.quiz.forEach((q, index) => {
    const userAnswer = userAnswers[`quiz-${index}`];
    const isCorrect = userAnswer === q.answer;
    if (isCorrect) score += 1;
    feedback.push({
      type: "multiple-choice",
      question: q.question,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect,
      explanation: isCorrect
        ? "Correct! You selected the right option."
        : `Incorrect. The correct answer is "${q.answer}". Review the relevant section of the document to understand why.`,
    });
  });

  questions.trueFalse.forEach((q, index) => {
    const userAnswer = userAnswers[`trueFalse-${index}`];
    const isCorrect = userAnswer === q.answer;
    if (isCorrect) score += 1;
    feedback.push({
      type: "true-false",
      question: q.question,
      userAnswer: userAnswer ? "True" : "False",
      correctAnswer: q.answer ? "True" : "False",
      isCorrect,
      explanation: isCorrect
        ? "Correct! You identified the statement correctly."
        : `Incorrect. The correct answer is ${
            q.answer ? "True" : "False"
          }. Check the document for clarification.`,
    });
  });

  questions.shortAnswer.forEach((q, index) => {
    const userAnswer = userAnswers[`shortAnswer-${index}`];
    const isCorrect = userAnswer && userAnswer.trim().length > 10;
    if (isCorrect) score += 1;
    feedback.push({
      type: "short-answer",
      question: q.question,
      userAnswer,
      correctAnswer: "N/A (requires manual grading)",
      isCorrect,
      explanation: isCorrect
        ? "Your answer seems detailed. Ensure it addresses all key points."
        : "Answer is too short or missing. Provide a more detailed response.",
    });
  });

  const summaryAnswer = userAnswers["summary-0"];
  const isSummaryCorrect = summaryAnswer && summaryAnswer.trim().length > 50;
  if (isSummaryCorrect) score += 1;
  feedback.push({
    type: "summary",
    question: questions.summary.question,
    userAnswer: summaryAnswer,
    correctAnswer: "N/A (requires manual grading)",
    isCorrect: isSummaryCorrect,
    explanation: isSummaryCorrect
      ? "Your summary is sufficiently detailed. Ensure it captures the main ideas."
      : "Summary is too short or missing. Include key points from the document.",
  });

  const suggestions = feedback
    .filter((item) => !item.isCorrect)
    .map(
      (item) =>
        `For "${item.question}", review the document section related to ${
          item.correctAnswer || "the topic"
        } to clarify your understanding.`
    );

  return {
    score,
    total: totalQuestions,
    percentage: ((score / totalQuestions) * 100).toFixed(2),
    feedback,
    suggestions:
      suggestions.length > 0
        ? suggestions
        : ["Great job! Keep reviewing to reinforce your understanding."],
  };
};

// Extract text from PDF or Image
const extractText = async (file) => {
  try {
    console.log("Processing file:", file.originalname, "Type:", file.mimetype);
    if (file.mimetype === "application/pdf") {
      return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", (errData) => {
          console.error("PDF parsing error:", errData.parserError);
          reject(new Error(`PDF parsing error: ${errData.parserError}`));
        });
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          const text = pdfParser.getRawTextContent();
          console.log("Extracted PDF text:", text.slice(0, 100) || "<empty>");
          if (!text.trim()) {
            reject(new Error("No readable text extracted from PDF"));
          }
          resolve(text);
        });
        pdfParser.loadPDF(file.path);
      });
    } else if (file.mimetype.startsWith("image/")) {
      const {
        data: { text },
      } = await Tesseract.recognize(file.path, "eng");
      console.log("Extracted image text:", text.slice(0, 100) || "<empty>");
      if (!text.trim()) {
        throw new Error("No readable text extracted from image");
      }
      return text;
    } else {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }
  } catch (error) {
    console.error("Text extraction error:", error.message, error.stack);
    throw new ApiError(400, `Text extraction failed: ${error.message}`);
  }
};

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
    password: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    history: [
      {
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        vectorPath: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    refreshToken: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log(
    "Hashing password for user:",
    this.username,
    "Password:",
    this.password
  );
  try {
    this.password = await bcrypt.hash(this.password, 10);
    console.log("Hashed password:", this.password);
    next();
  } catch (error) {
    console.error("Password hashing error:", error.message);
    next(error);
  }
});

UserSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  console.log(
    "Comparing password for user:",
    this.username,
    "Entered:",
    enteredPassword,
    "Stored:",
    this.password
  );
  const isValid = await bcrypt.compare(enteredPassword, this.password);
  console.log("Password comparison result:", isValid);
  return isValid;
};

UserSchema.methods.GenerateAccessToken = function () {
  if (!process.env.ACCESS_SECRET)
    throw new Error("ACCESS_SECRET is not defined");
  return jwt.sign(
    { id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXP || "1h" }
  );
};

UserSchema.methods.GenerateRefreshToken = function () {
  if (!process.env.REFRESH_SECRET)
    throw new Error("REFRESH_SECRET is not defined");
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
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    vectorPath: { type: String, required: true },
    questions: {
      quiz: [
        {
          type: { type: String, default: "multiple-choice" },
          question: String,
          options: [String],
          answer: String,
        },
      ],
      shortAnswer: [
        { type: { type: String, default: "short-answer" }, question: String },
      ],
      trueFalse: [
        {
          type: { type: String, default: "true-false" },
          question: String,
          answer: Boolean,
        },
      ],
      summary: { type: { type: String, default: "summary" }, question: String },
    },
    conciseSummary: String,
    detailedSummary: String,
    quizResults: [
      {
        score: Number,
        total: Number,
        percentage: Number,
        feedback: [
          {
            type: String,
            question: String,
            userAnswer: Schema.Types.Mixed,
            correctAnswer: Schema.Types.Mixed,
            isCorrect: Boolean,
            explanation: String,
          },
        ],
        suggestions: [String],
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const PDFUpload = mongoose.model("PDFHistory", PdfSchema);

// Middleware
const VerifyUser = AsyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");
  console.log("Verifying token:", token ? "Token present" : "No token");
  if (!token) {
    throw new ApiError(401, "No access token found");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET);
    console.log("Decoded token:", decodedToken);
    const user = await User.findById(decodedToken.id).select(
      "-refreshToken -password"
    );
    if (!user) {
      throw new ApiError(401, "No user found for this token");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message, error.stack);
    throw new ApiError(401, "Invalid or expired token");
  }
});

// Controllers
const GenerateAccessRefreshToken = async (userId) => {
  try {
    console.log("Generating tokens for userId:", userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for ID:", userId);
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.GenerateAccessToken();
    const refreshToken = user.GenerateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    console.log("Tokens generated:", { accessToken, refreshToken });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error.message, error.stack);
    throw new ApiError(
      500,
      "Access or refresh token failure: " + error.message
    );
  }
};

const creatingUser = AsyncHandler(async (req, res) => {
  const { username, email, password } = req.body || {};
  console.log("Creating user:", { username, email });

  if (
    !req.body ||
    [username, email, password].some((field) => !field?.trim())
  ) {
    throw new ApiError(
      400,
      "All fields (username, email, password) are required"
    );
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "User with this username or email already exists");
  }

  const userObj = { username, email, password };
  try {
    const newUser = await User.create(userObj);
    const { accessToken, refreshToken } = await GenerateAccessRefreshToken(
      newUser._id
    );
    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    };
    const refreshOptions = {
      ...options,
      maxAge: 7 * 24 * 3600000,
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, refreshOptions)
      .json(
        new ApiResponse(
          201,
          { user: createdUser, accessToken },
          "User created successfully"
        )
      );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Username or email already exists");
    }
    throw new ApiError(500, "Failed to create user: " + error.message);
  }
});

const LoginUser = AsyncHandler(async (req, res) => {
  console.log("Login request received:", req.body);
  if (!req.body) {
    throw new ApiError(400, "Request body is missing");
  }
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    console.log("User not found for email:", email);
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("Password valid:", isPasswordValid);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await GenerateAccessRefreshToken(
    user._id
  );
  const finalUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000, // 1 hour
  };

  const refreshOptions = {
    ...options,
    maxAge: 7 * 24 * 3600000, // 7 days
  };

  console.log("Setting cookies:", { accessToken, refreshToken });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json(
      new ApiResponse(
        200,
        { user: finalUser, accessToken, refreshToken },
        "Logged in successfully"
      )
    );
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

  const cloudinaryResult = await cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
  });
  if (!cloudinaryResult) {
    throw new ApiError(500, "Failed to upload file to Cloudinary");
  }

  user.history.push({
    fileName: req.file.originalname,
    filePath: cloudinaryResult.secure_url,
    vectorPath: cloudinaryResult.public_id,
    createdAt: new Date(),
  });
  await user.save();

  try {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (unlinkError) {
    console.error(`Failed to delete file ${filePath}: ${unlinkError.message}`);
  }

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
    email: user.email,
    history: user.history,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, userObj, "User data fetched successfully"));
});

const HandleUpload = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const file = req.file;

  if (!userId) throw new ApiError(401, "No user authenticated");
  if (!file) throw new ApiError(400, "No file uploaded");

  const existingFile = await PDFUpload.findOne({
    userid: userId,
    fileName: file.originalname,
  });
  if (existingFile) throw new ApiError(409, "File already uploaded");

  try {
    console.log("Processing file:", {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      path: file.path,
    });

    if (file.size > 20 * 1024 * 1024) {
      throw new ApiError(400, "File size exceeds 20MB limit");
    }

    if (!fs.existsSync(file.path)) {
      throw new ApiError(400, `File not found at path: ${file.path}`);
    }

    let resultData;
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      const fileData = fs.readFileSync(file.path);
      console.log("File read successfully, size:", fileData.length);
      const content = [
        {
          inlineData: {
            mimeType: file.mimetype,
            data: fileData.toString("base64"),
          },
        },
      ];
      resultData = await generateQuestionsAndSummary(content);
    } else {
      throw new ApiError(400, `Unsupported file type: ${file.mimetype}`);
    }

    const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    const newFile = new PDFUpload({
      userid: userId,
      fileName: file.originalname,
      filePath: cloudinaryResult.secure_url,
      vectorPath: cloudinaryResult.public_id,
      questions: {
        quiz: resultData.quiz,
        shortAnswer: resultData.shortAnswer,
        trueFalse: resultData.trueFalse,
        summary: resultData.summary,
      },
      conciseSummary: resultData.conciseSummary,
      detailedSummary: resultData.detailedSummary,
    });
    await newFile.save();

    const user = await User.findById(userId);
    user.history.push({
      fileName: newFile.fileName,
      filePath: newFile.filePath,
      vectorPath: newFile.vectorPath,
      createdAt: new Date(),
    });
    await user.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          vectorPath: newFile.vectorPath,
          questions: resultData,
          conciseSummary: resultData.conciseSummary,
          detailedSummary: resultData.detailedSummary,
        },
        "File uploaded and content generated successfully"
      )
    );
  } catch (error) {
    console.error("HandleUpload error:", error.message, error.stack);
    throw new ApiError(500, `Failed to process file: ${error.message}`);
  } finally {
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`Deleted file: ${file.path}`);
      } catch (unlinkError) {
        console.error(
          `Failed to delete file ${file.path}: ${unlinkError.message}`
        );
      }
    }
  }
});

const HandleGuestUpload = AsyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new ApiError(400, "No file uploaded");

  try {
    console.log("Processing file:", {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      path: file.path,
    });

    if (file.size > 20 * 1024 * 1024) {
      throw new ApiError(400, "File size exceeds 20MB limit");
    }

    if (!fs.existsSync(file.path)) {
      throw new ApiError(400, `File not found at path: ${file.path}`);
    }

    let resultData;
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      const fileData = fs.readFileSync(file.path);
      console.log("File read successfully, size:", fileData.length);
      const content = [
        {
          inlineData: {
            mimeType: file.mimetype,
            data: fileData.toString("base64"),
          },
        },
      ];
      resultData = await generateQuestionsAndSummary(content);
    } else {
      throw new ApiError(400, `Unsupported file type: ${file.mimetype}`);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          questions: resultData,
          conciseSummary: resultData.conciseSummary,
          detailedSummary: resultData.detailedSummary,
        },
        "Content generated successfully for guest"
      )
    );
  } catch (error) {
    console.error("HandleGuestUpload error:", error.message, error.stack);
    throw new ApiError(500, `Failed to process file: ${error.message}`);
  } finally {
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`Deleted file: ${file.path}`);
      } catch (unlinkError) {
        console.error(
          `Failed to delete file ${file.path}: ${unlinkError.message}`
        );
      }
    }
  }
});

const SubmitQuizAnswers = AsyncHandler(async (req, res) => {
  const { userId, vectorPath, answers } = req.body;

  if (!vectorPath || !answers) {
    throw new ApiError(400, "Vector path and answers are required");
  }

  const pdfRecord = await PDFUpload.findOne({ vectorPath, userid: userId });
  if (!pdfRecord) {
    throw new ApiError(404, "File not found or not associated with user");
  }

  const evaluation = evaluateAnswers(answers, pdfRecord.questions);

  pdfRecord.quizResults.push({
    score: evaluation.score,
    total: evaluation.total,
    percentage: evaluation.percentage,
    feedback: evaluation.feedback,
    suggestions: evaluation.suggestions,
    timestamp: new Date(),
  });
  await pdfRecord.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        score: evaluation.score,
        total: evaluation.total,
        percentage: evaluation.percentage,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions,
      },
      "Quiz answers evaluated and stored successfully"
    )
  );
});

const GetUserHistory = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("history");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user.history, "History fetched successfully"));
});

const DeleteHistoryItem = AsyncHandler(async (req, res) => {
  const { vectorPath } = req.body;
  const userId = req.user._id;

  if (!vectorPath) {
    throw new ApiError(400, "Vector path is required");
  }

  const pdfRecord = await PDFUpload.findOneAndDelete({
    vectorPath,
    userid: userId,
  });
  if (!pdfRecord) {
    throw new ApiError(404, "File not found or not associated with user");
  }

  await User.updateOne({ _id: userId }, { $pull: { history: { vectorPath } } });

  try {
    await cloudinary.uploader.destroy(pdfRecord.vectorPath);
    console.log(`Deleted file from Cloudinary: ${pdfRecord.vectorPath}`);
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${error.message}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "History item deleted successfully"));
});

const GetQuizResults = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const results = await PDFUpload.find({ userid: userId }).select(
    "quizResults vectorPath createdAt fileName"
  );
  const quizResults = results.flatMap((doc) =>
    doc.quizResults.map((result) => ({
      ...result.toObject(),
      vectorPath: doc.vectorPath,
      fileName: doc.fileName,
      createdAt: doc.createdAt,
    }))
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, quizResults, "Quiz results fetched successfully")
    );
});

// Routes
const userRouter = express.Router();
const pdfRouter = express.Router();

userRouter.post("/signupbackend", creatingUser);
userRouter.post("/loginbackend", LoginUser);
userRouter.post(
  "/refresh-token",
  AsyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "No refresh token provided");
    }
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
      }
      const { accessToken, refreshToken: newRefreshToken } =
        await GenerateAccessRefreshToken(user._id);
      const options = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      };
      const refreshOptions = {
        ...options,
        maxAge: 7 * 24 * 3600000,
      };
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, refreshOptions)
        .json(
          new ApiResponse(200, { accessToken }, "Token refreshed successfully")
        );
    } catch (error) {
      console.error("Refresh token error:", error);
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  })
);
userRouter.get("/fetchcred", VerifyUser, FetchUserId);
userRouter.get("/history", VerifyUser, GetUserHistory);
pdfRouter.post("/uploadmern", VerifyUser, upload.single("file"), HandleUpload);
pdfRouter.post("/generate-questions", upload.single("file"), HandleGuestUpload);
pdfRouter.post("/submit-quiz", VerifyUser, SubmitQuizAnswers);
pdfRouter.get("/quiz-results", VerifyUser, GetQuizResults);
pdfRouter.delete("/delete", VerifyUser, DeleteHistoryItem);

app.use("/api/ver1/user", userRouter);
app.use("/api/ver1/pdf", pdfRouter);

// Start Server
connectDatabase()
  .then(() => {
    const port = process.env.PORT || 5000;
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
  console.error("Global error:", err.message, err.stack);
  const statusCode = err.statuscode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json(new ApiResponse(statusCode, null, message));
});
