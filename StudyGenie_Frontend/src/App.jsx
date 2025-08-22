import React from "react";
import LandingPage from "./pages/LandingPage";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ModelPage from "./pages/ModelPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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
            path:'/login',
            element:<Login />
        },
        {
            path:'/dashboard',
            element:<Dashboard />
        }

    ])
    return (
        <RouterProvider router={Approuter} future={{ v7_startTransition: true,}}/>
  )
}
export default App

