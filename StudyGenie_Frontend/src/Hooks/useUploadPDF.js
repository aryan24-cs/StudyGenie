import axios from 'axios';
import { useState, useCallback } from 'react';

const BASE_URL = "http://localhost:5000/api/ver1/pdf";

const useUploadPDF = (userId) => {
  const [pdf, setPdf] = useState("");
  const [error, setError] = useState("");

  const uploadPDF = useCallback(async (file) => {
    try {
      const pdfFile = new FormData();
      pdfFile.append('pdf', file);
      pdfFile.append('userId', userId); 
      console.log(pdfFile)

      const response = await axios.post(`${BASE_URL}/uploadmern`, pdfFile, {
        withCredentials: true,
      });

      setPdf(response.data.message || "File uploaded successfully.");
      setError("");
    } catch (err) {
      console.error("Error uploading the file:", err);
      setError(err?.response?.data?.message || "Upload failed");
    }
  }, [userId]);

  return { uploadPDF, pdf, error };
};

export default useUploadPDF;
