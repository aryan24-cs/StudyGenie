import {AsyncHandler} from '../utils/AsyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponce.js'
import { UploadOnCloudinary } from '../utils/Cloudinary.js'
import { PDFUpload } from '../models/PdfUpload.model.js'
import fs from 'fs'
import axios from 'axios'
import path from 'path'
import { User } from '../models/User.model.js'
import FormData from 'form-data'; 



const HandleUpload = AsyncHandler(async (req, res, next) => {
    const UserId = req.user._id;
    const pdfFile = req.file;

    if (!UserId) throw new ApiError(400, "no user found");
    if (!pdfFile) throw new ApiError(400, "no file found");

    const existingFile = await PDFUpload.findOne({
        userid: UserId,
        fileName: pdfFile.originalname
    });

    if (existingFile) throw new ApiError(400, "file already uploaded");

    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfFile.path));

    const flaskResponse = await axios.post(
        "http://localhost:5000/upload",
        formData,
        { headers: formData.getHeaders() }
    );

    if (flaskResponse.status !== 200) {
        throw new ApiError(500, "Flask upload failed");
    }

    const vectorPathFromFlask = flaskResponse.data.vectorPath;

    
    const newFileSys = new PDFUpload({
        userid: UserId,
        fileName: pdfFile.originalname,
        filePath: pdfFile.path,
        vectorPath: vectorPathFromFlask
    });
    await newFileSys.save();


    const user = await User.findById(UserId);
    user.history.push({
        fileName: newFileSys.fileName,
        filePath: newFileSys.filePath,
        vectorPath: newFileSys.vectorPath
    });
    await user.save();

    return res.status(200).json(new ApiResponse(200, newFileSys, "File uploaded and stored successfully"));
});


export {HandleUpload}