import { useEffect,useState,useCallback } from "react";
import axios from "axios";
const BASE_URL = "http://localhost:5000/api/ver1/user"

const useUsercred = () => {
  const signup = async ({ username, email, password, navigate }) => {
    console.log('Signup data:', { username, email, password });
    try {
        const response = await axios.post(
            `${BASE_URL}/signupbackend`,
            { username, email, password },
            { withCredentials: true }
        );
        navigate("/dashboard");
        return response.data;
    } catch (error) {
        console.error('Signup error:', error.response?.data, error.message);
        throw error;
    }
};


  const Login = async({username,email,password,navigate})=>{
    try {
        const response = await axios.post(
            `${BASE_URL}/loginbackend`,
            {username,email,password},
            {withCredentials:true}
        )
        console.log(response.data)
        navigate("/dashboard")
        return response.data
    } catch (error) {
        console.log("login error:",error)
        throw error
    }
  }
  return {signup,Login};
};

export default useUsercred;