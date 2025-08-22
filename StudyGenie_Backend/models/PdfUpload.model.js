import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const PdfSchema = new Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  }
}, { timestamps: true });

export const PDFUpload = mongoose.model('PDFHistory', PdfSchema);