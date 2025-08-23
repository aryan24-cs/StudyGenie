import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/ver1/user";

const useUsercred = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const signup = async ({ username, email, password, navigate }) => {
    setLoading(true);
    setError(null);
    console.log("Signup data:", { username, email, password });
    try {
      const response = await axios.post(
        `${BASE_URL}/signupbackend`,
        { username, email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log("Signup response:", response.data);
      setAccessToken(response.data.data.accessToken);
      navigate("/dashboard");
      return response.data;
    } catch (error) {
      console.error("Signup error:", error.response?.data, error.message);
      setError(error.response?.data?.message || "Signup failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const Login = async ({ email, password, navigate }) => {
    setLoading(true);
    setError(null);
    console.log("Login data:", { email, password });
    try {
      const response = await axios.post(
        `${BASE_URL}/loginbackend`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          credentials: "include",
        }
      );
      console.log("Login response:", response.data);
      setAccessToken(response.data.data.accessToken);
      console.log(
        "Access Token from response:",
        response.data.data.accessToken
      );
      navigate("/dashboard");
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data, error.message);
      setError(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { signup, Login, error, loading, accessToken };
};

export default useUsercred;
