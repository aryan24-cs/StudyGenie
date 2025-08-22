import axios from 'axios';
import { useState, useCallback } from 'react';

const useUserPDFs = (userId) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserFiles = useCallback(async () => {
    try {
      setLoading(true);
      
      const res = await axios.post("http://localhost:5000/getdocs", { user_id: userId },{headers: {"Content-Type":"application/json" }});
      console.log("/getdocs response:", res.data);
      console.log("User ID sent:", userId); 
      setFiles(res.data.files || []);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { files, fetchUserFiles, loading };
};

export default useUserPDFs;
