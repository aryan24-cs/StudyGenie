import React from "react";
import LandingPage from "./pages/LandingPage";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ModelPage from "./pages/ModelPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudyGenieUpload from "./pages/UploadFile"
import MapCareer from "./pages/MapCareer";
import OnboardingPage from "./pages/OnboardingPage";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/LeaderBoard";

function App ()
{
    const Approuter = createBrowserRouter([
        {
            path:'/',
            element:<LandingPage/>
        },
        {
            path:'/model',
            element:<ModelPage />
        },
        {
            path:'/signup',
            element:<SignUp />
        },
        {
            path:'/upload',
            element:<StudyGenieUpload />
        },
        {
            path:'/login',
            element:<Login />
        },
        {
            path:'/dashboard',
            element:<Dashboard />
        },
        {
            path:'/career',
            element:<MapCareer />
        },
        {
            path:'/onboarding',
            element:<OnboardingPage />
        },
        {
            path:'/profile',
            element:<Profile />
        },
        {
            path:'/leaderboard',
            element:<Leaderboard />
        },

    ])
    return (
        <RouterProvider router={Approuter} future={{ v7_startTransition: true,}}/>
  )
}
export default App

