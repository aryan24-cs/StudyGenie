import {Router} from 'express'
import { creatingUser,HistoryHandle,LoginUser,FetchUserId } from '../controllers/User.controller.js'
import { VerifyUser } from '../middlewares/Auth.js'
import { upload } from '../middlewares/multer.js'

const router = Router()

router.route("/signupbackend").post(creatingUser)
router.route("/loginbackend").post(LoginUser)
router.route("/history").post(VerifyUser,upload.single('pdf'),HistoryHandle)
router.route("/fetchcred").get(VerifyUser,FetchUserId)


export default router