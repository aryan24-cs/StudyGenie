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
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import PDFParser from "pdf2json";
import Tesseract from "tesseract.js";
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
  EMAIL_USER: !!process.env.EMAIL_USER,
  EMAIL_PASS: !!process.env.EMAIL_PASS,
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

// Career Paths Data (must match MapCareer.jsx)
const careerPaths = [
  {
    title: "Software Developer",
    category: "Software Engineering",
    description: "Design and build applications to solve real-world problems.",
    matches: [
      "solving_complex",
      "building_products",
      "coding",
      "frontend",
      "backend",
      "mobile",
      "game",
      "embedded",
      "algorithmic",
    ],
    skills: [
      "Programming",
      "Problem-solving",
      "Version control",
      "Testing",
      "Debugging",
    ],
    tools: ["JavaScript/TypeScript", "Python", "Java", "Git", "Docker"],
    learningResource: {
      name: "Learn Python",
      url: "https://www.learnpython.org",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Software+Developer",
    detailsPage: "/career-details?career=Software+Developer",
    outlook: "High demand with diverse opportunities across industries.",
    traits: ["Analytical thinking", "Creativity", "Attention to detail"],
  },
  {
    title: "Data Scientist",
    category: "Data Science",
    description: "Analyze data to uncover insights and drive decisions.",
    matches: [
      "solving_complex",
      "data_insights",
      "data_analysis",
      "ai_ml",
      "predictive",
      "data_viz",
    ],
    skills: ["Statistical analysis", "Machine learning", "Data visualization"],
    tools: ["Python", "R", "SQL", "TensorFlow", "Tableau"],
    learningResource: {
      name: "Coursera Data Science",
      url: "https://www.coursera.org/specializations/data-science",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Data+Scientist",
    detailsPage: "/career-details?career=Data+Scientist",
    outlook: "Growing demand for data-driven decision-making.",
    traits: ["Statistical thinking", "Curiosity", "Communication"],
  },
  {
    title: "Machine Learning Engineer",
    category: "Artificial Intelligence",
    description: "Develop AI systems that learn and adapt from data.",
    matches: [
      "solving_complex",
      "ai_ml",
      "data_analysis",
      "computer_vision",
      "nlp",
      "reinforcement",
      "generative_ai",
    ],
    skills: ["Deep learning", "Feature engineering", "Model optimization"],
    tools: ["Python", "TensorFlow/PyTorch", "Kubernetes"],
    learningResource: {
      name: "Google's ML Crash Course",
      url: "https://developers.google.com/machine-learning/crash-course",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Machine+Learning+Engineer",
    detailsPage: "/career-details?career=Machine+Learning+Engineer",
    outlook: "Rapid growth in AI-driven industries.",
    traits: ["Mathematical thinking", "Experimental mindset"],
  },
  {
    title: "DevOps Engineer",
    category: "Infrastructure & Operations",
    description: "Automate and manage infrastructure for software deployment.",
    matches: [
      "system_design",
      "infrastructure",
      "coding",
      "system_scale",
      "integration",
    ],
    skills: ["CI/CD", "Infrastructure as Code", "Cloud architecture"],
    tools: ["Docker", "Kubernetes", "Terraform", "AWS"],
    learningResource: {
      name: "AWS Training",
      url: "https://aws.amazon.com/training/",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=DevOps+Engineer",
    detailsPage: "/career-details?career=DevOps+Engineer",
    outlook: "Strong demand for cloud and automation expertise.",
    traits: ["Systems thinking", "Process orientation"],
  },
  {
    title: "UX/UI Designer",
    category: "Design & User Experience",
    description: "Create intuitive and engaging user interfaces.",
    matches: [
      "user_experience",
      "designing",
      "user_impact",
      "user_research",
      "ui_design",
      "interaction_design",
    ],
    skills: ["User research", "Wireframing", "Visual design"],
    tools: ["Figma", "Adobe XD", "Sketch"],
    learningResource: {
      name: "Skillshare UX Design",
      url: "https://www.skillshare.com/classes/UX-Design",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=UX+Designer",
    detailsPage: "/career-details?career=UX/UI+Designer",
    outlook: "Increasing importance of user-centric design.",
    traits: ["Empathy", "Creative thinking"],
  },
  {
    title: "Cybersecurity Specialist",
    category: "Security",
    description: "Protect systems and data from cyber threats.",
    matches: ["solving_complex", "security_issues", "cybersecurity"],
    skills: ["Threat detection", "Security protocols", "Risk assessment"],
    tools: ["SIEM tools", "Penetration testing tools"],
    learningResource: {
      name: "Cybrary Cybersecurity",
      url: "https://www.cybrary.it",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Cybersecurity+Specialist",
    detailsPage: "/career-details?career=Cybersecurity+Specialist",
    outlook: "Critical demand due to rising cyber threats.",
    traits: ["Analytical thinking", "Ethical mindset"],
  },
  {
    title: "Data Engineer",
    category: "Data Infrastructure",
    description: "Build and maintain data pipelines and infrastructure.",
    matches: [
      "data_analysis",
      "infrastructure",
      "system_design",
      "data_pipeline",
    ],
    skills: ["Data modeling", "ETL processes", "Database design"],
    tools: ["SQL", "Spark", "Airflow", "Snowflake"],
    learningResource: {
      name: "DataCamp Data Engineering",
      url: "https://www.datacamp.com/tracks/data-engineer",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Data+Engineer",
    detailsPage: "/career-details?career=Data+Engineer",
    outlook: "High demand for scalable data systems.",
    traits: ["Systems thinking", "Reliability focus"],
  },
  {
    title: "Product Manager",
    category: "Product Development",
    description: "Lead product development from ideation to launch.",
    matches: ["building_products", "user_impact", "communicator", "leader"],
    skills: [
      "Market research",
      "Roadmap planning",
      "Cross-functional leadership",
    ],
    tools: ["Jira", "Product analytics"],
    learningResource: {
      name: "LinkedIn Learning Product Management",
      url: "https://www.linkedin.com/learning/topics/product-management",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Product+Manager",
    detailsPage: "/career-details?career=Product+Manager",
    outlook: "Key role with strong career advancement.",
    traits: ["Strategic thinking", "Decision-making"],
  },
  {
    title: "Cloud Architect",
    category: "Cloud Computing",
    description: "Design and manage cloud infrastructure for scalability.",
    matches: ["system_design", "infrastructure", "cloud_edge", "integration"],
    skills: ["Cloud architecture", "Cost optimization", "Security design"],
    tools: ["AWS", "Azure", "Google Cloud", "Terraform"],
    learningResource: {
      name: "Microsoft Azure Training",
      url: "https://learn.microsoft.com/en-us/training/azure/",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Cloud+Architect",
    detailsPage: "/career-details?career=Cloud+Architect",
    outlook: "Rapid growth in cloud adoption.",
    traits: ["Strategic planning", "Technical expertise"],
  },
  {
    title: "Blockchain Developer",
    category: "Web3 & Blockchain",
    description: "Build decentralized applications and smart contracts.",
    matches: ["coding", "blockchain", "solving_complex", "integration"],
    skills: [
      "Smart contract development",
      "Cryptography",
      "Distributed systems",
    ],
    tools: ["Solidity", "Ethereum", "Truffle", "Hardhat"],
    learningResource: {
      name: "Alchemy University",
      url: "https://university.alchemy.com",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Blockchain+Developer",
    detailsPage: "/career-details?career=Blockchain+Developer",
    outlook: "Emerging field with high potential.",
    traits: ["Innovative thinking", "Security focus"],
  },
  {
    title: "AR/VR Developer",
    category: "Immersive Technologies",
    description:
      "Create immersive experiences for augmented and virtual reality.",
    matches: ["coding", "ar_vr", "user_experience", "game"],
    skills: ["3D modeling", "Real-time rendering", "Spatial computing"],
    tools: ["Unity", "Unreal Engine", "Blender"],
    learningResource: { name: "Unity Learn", url: "https://learn.unity.com" },
    jobSearchLink: "https://www.indeed.com/jobs?q=AR+VR+Developer",
    detailsPage: "/career-details?career=AR/VR+Developer",
    outlook: "Growing demand in gaming and enterprise.",
    traits: ["Creative thinking", "Technical precision"],
  },
  {
    title: "Technical Writer",
    category: "Technical Communication",
    description: "Create clear documentation for technical products.",
    matches: ["communicator", "user_impact", "conceptual_learner"],
    skills: ["Technical writing", "Documentation", "User guides"],
    tools: ["Markdown", "Confluence", "Sphinx"],
    learningResource: {
      name: "Write the Docs",
      url: "https://www.writethedocs.org",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Technical+Writer",
    detailsPage: "/career-details?career=Technical+Writer",
    outlook: "Steady demand for clear documentation.",
    traits: ["Clarity in communication", "Attention to detail"],
  },
];

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

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Signup OTP for StudyGenix",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

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
    console.log(
      `Database connected!! Host: ${connectionInstance.connection.host}, Database: ${db_name}`
    );
    await User.syncIndexes(); // Sync indexes to match schema
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
      trim: true,
      default: function () {
        return this.email ? this.email.split("@")[0] : "";
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?\d{10,15}$/, "Please enter a valid phone number"],
    },
    age: {
      type: Number,
      min: [13, "Age must be at least 13"],
      max: [100, "Age cannot exceed 100"],
    },
    gradeLevel: {
      type: String,
      enum: [
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
        "College",
        "Other",
      ],
      default: null,
    },
    learningInterests: {
      type: [String],
      enum: [
        "Mathematics",
        "Science",
        "History",
        "Literature",
        "Computer Science",
        "Art",
        "Music",
        "Languages",
        "Engineering",
        "Business",
        "Other",
      ],
      default: [],
    },
    badges: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true }, // URL or emoji for badge icon
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        points: { type: Number, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    history: [
      {
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        vectorPath: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assessments: [
      {
        responses: [
          {
            questionId: String,
            selectedIds: [String],
            skipped: Boolean,
          },
        ],
        recommendations: [
          {
            title: String,
            category: String,
            description: String,
            matches: [String],
            skills: [String],
            tools: [String],
            learningResource: { name: String, url: String },
            jobSearchLink: String,
            detailsPage: String,
            outlook: String,
            traits: [String],
            matchPercentage: Number,
          },
        ],
        timestamp: { type: Date, default: Date.now },
      },
    ],
    refreshToken: { type: String },
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
    { id: this._id, email: this.email },
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

const OTPSchema = new Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const OTP = mongoose.model("OTP", OTPSchema);

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

const SendOTP = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  console.log("SendOTP request body:", req.body);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  let otpDoc = await OTP.findOne({ email });
  if (otpDoc) {
    await otpDoc.deleteOne();
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  try {
    otpDoc = await OTP.create({
      email,
      otp,
      hashedPassword: password,
      expiresAt,
    });
    console.log("OTP document created:", otpDoc);
    await sendMail(email, otp);
    console.log("OTP email sent to:", email);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "OTP sent to your email"));
  } catch (error) {
    console.error("SendOTP error:", error);
    if (otpDoc) {
      await otpDoc.deleteOne();
    }
    throw new ApiError(500, "Failed to send OTP email: " + error.message);
  }
});

const VerifyOTP = AsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }
  console.log("VerifyOTP request body:", req.body);
  const otpDoc = await OTP.findOne({ email });
  if (!otpDoc) {
    throw new ApiError(404, "No OTP found for this email");
  }
  if (otpDoc.expiresAt < new Date()) {
    await otpDoc.deleteOne();
    throw new ApiError(400, "OTP has expired");
  }
  if (otpDoc.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }
  const user = await User.create({
    email,
    password: otpDoc.hashedPassword,
  });
  console.log("Created user:", user);
  await otpDoc.deleteOne();
  const { accessToken, refreshToken } = await GenerateAccessRefreshToken(
    user._id
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
    .cookie("refreshToken", refreshToken, refreshOptions)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        201,
        { userId: user._id, email: user.email, redirectTo: "/onboarding" },
        "User created successfully, please complete onboarding"
      )
    );
});

const SaveOnboardingData = AsyncHandler(async (req, res) => {
  const { gradeLevel, learningInterests, username, phoneNumber, age } =
    req.body;
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "No user authenticated");
  }
  if (!gradeLevel || !learningInterests || !Array.isArray(learningInterests)) {
    throw new ApiError(400, "Grade level and learning interests are required");
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.gradeLevel = gradeLevel;
    user.learningInterests = learningInterests;
    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (age) user.age = age;
    await user.save();
    console.log("Onboarding data saved for user:", user);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Onboarding data saved successfully"));
  } catch (error) {
    console.error("Onboarding save error:", error);
    throw new ApiError(500, "Failed to save onboarding data: " + error.message);
  }
});

const UpdateProfile = AsyncHandler(async (req, res) => {
  const { username, phoneNumber, age } = req.body;
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "No user authenticated");
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (age) user.age = age;
    await user.save();
    console.log("Profile updated for user:", user);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Profile updated successfully"));
  } catch (error) {
    console.error("Profile update error:", error);
    throw new ApiError(500, "Failed to update profile: " + error.message);
  }
});

const LoginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  console.log("LoginUser request body:", { email, password });
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  console.log("Stored hashed password:", user.password);
  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("Password comparison result:", isPasswordValid);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const { accessToken, refreshToken } = await GenerateAccessRefreshToken(
    user._id
  );
  const finalUser = await User.findById(user._id).select("-password");
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
    .cookie("refreshToken", refreshToken, refreshOptions)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, finalUser, "Logged in successfully"));
});

const TestPassword = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  console.log("Test password - Stored hash:", user.password);
  console.log("Test password - Input:", password);
  const isValid = await bcrypt.compare(password, user.password);
  console.log("Test password - Result:", isValid);
  return res.json(new ApiResponse(200, { isValid }, "Password test result"));
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
    phoneNumber: user.phoneNumber,
    age: user.age,
    gradeLevel: user.gradeLevel,
    learningInterests: user.learningInterests,
    badges: user.badges,
    achievements: user.achievements,
    history: user.history,
    assessments: user.assessments,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, userObj, "User details fetched successfully"));
});

const SubmitAssessment = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { responses } = req.body;
  if (!responses || !Array.isArray(responses)) {
    throw new ApiError(400, "Responses are required and must be an array");
  }
  console.log("SubmitAssessment request body:", { userId, responses });
  // Filter out skipped or invalid responses and collect selected IDs
  const selectedIds = responses
    .filter((r) => r && !r.skipped && r.selectedIds && r.selectedIds.length > 0)
    .flatMap((r) => r.selectedIds);
  // Calculate match percentages for each career
  const recommendations = careerPaths
    .map((career) => {
      const matchedIds = career.matches.filter((id) =>
        selectedIds.includes(id)
      );
      const matchPercentage = Math.round(
        (matchedIds.length / career.matches.length) * 100
      );
      return {
        ...career,
        matchPercentage: Math.max(50, Math.min(95, matchPercentage)), // Clamp between 50-95
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 5); // Return top 5 careers
  // Save assessment to user's record
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.assessments.push({
      responses,
      recommendations,
      timestamp: new Date(),
    });
    // Award badge and achievement for completing assessment
    const badge = {
      name: "Career Explorer",
      description: "Completed a career assessment",
      icon: "🏆",
      earnedAt: new Date(),
    };
    const achievement = {
      title: "First Step to Success",
      description: "Completed your first career assessment",
      points: 100,
      earnedAt: new Date(),
    };
    if (!user.badges.some((b) => b.name === badge.name)) {
      user.badges.push(badge);
    }
    if (!user.achievements.some((a) => a.title === achievement.title)) {
      user.achievements.push(achievement);
    }
    await user.save();
    console.log("Assessment saved for user:", userId);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { recommendations },
          "Assessment submitted successfully"
        )
      );
  } catch (error) {
    console.error("SubmitAssessment error:", error.message, error.stack);
    throw new ApiError(500, `Failed to save assessment: ${error.message}`);
  }
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
    // Award badge and achievement for uploading a file
    const badge = {
      name: "Content Creator",
      description: "Uploaded your first study material",
      icon: "📚",
      earnedAt: new Date(),
    };
    const achievement = {
      title: "Study Starter",
      description: "Uploaded a study resource",
      points: 50,
      earnedAt: new Date(),
    };
    if (!user.badges.some((b) => b.name === badge.name)) {
      user.badges.push(badge);
    }
    if (!user.achievements.some((a) => a.title === achievement.title)) {
      user.achievements.push(achievement);
    }
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
  // Award badge and achievement for quiz completion
  const user = await User.findById(userId);
  const badge = {
    name: "Quiz Master",
    description: "Completed a quiz on uploaded material",
    icon: "🎓",
    earnedAt: new Date(),
  };
  const achievement = {
    title: "Knowledge Seeker",
    description: `Scored ${evaluation.percentage}% on a quiz`,
    points: Math.round(evaluation.percentage),
    earnedAt: new Date(),
  };
  if (!user.badges.some((b) => b.name === badge.name)) {
    user.badges.push(badge);
  }
  if (!user.achievements.some((a) => a.title === achievement.title)) {
    user.achievements.push(achievement);
  }
  await user.save();
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
userRouter.post("/send-otp", SendOTP);
userRouter.post("/verify-otp", VerifyOTP);
userRouter.post("/onboarding", VerifyUser, SaveOnboardingData);
userRouter.post("/update-profile", VerifyUser, UpdateProfile);
userRouter.post("/loginbackend", LoginUser);
userRouter.post("/test-password", TestPassword);
userRouter.post("/history", VerifyUser, upload.single("pdf"), HistoryHandle);
userRouter.get("/fetchcred", VerifyUser, FetchUserId);
userRouter.get("/history", VerifyUser, GetUserHistory);
userRouter.post("/submit-assessment", VerifyUser, SubmitAssessment);
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
