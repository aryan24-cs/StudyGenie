import { Router } from "express";
import { VerifyUser } from "../middlewares/Auth.js";
import { HandleUpload } from "../controllers/PdfUpload.controllers.js";
import { upload } from "../middlewares/multer.js";

const router = Router()


router.route("/uploadmern").post(VerifyUser,upload.single('pdf'),HandleUpload)


export default router