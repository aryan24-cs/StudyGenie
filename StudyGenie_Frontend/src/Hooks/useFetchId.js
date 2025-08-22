import axios from 'axios';
import { useEffect, useState } from 'react';

const BASE_URL = "http://localhost:5000/api/ver1/user";

const useFetchId = () => {
  const [userid, setUserid] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/fetchcred`, { withCredentials: true });
        setUserid(res.data.data.userid);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchData();
  }, []);

  return userid;
};

export { useFetchId };
