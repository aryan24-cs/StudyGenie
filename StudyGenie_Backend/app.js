import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import userRouter from './routes/User.routes.js';
import PDFRouter from './routes/PdfUpload.router.js'

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))


app.use(cookieParser());


app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ limit: '16kb', extended: true }))


app.use('/api/ver1/user', userRouter)
app.use("/api/ver1/pdf", PDFRouter )

export { app };
