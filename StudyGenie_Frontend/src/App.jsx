import React from "react";
import LandingPage from "./pages/LandingPage";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ModelPage from "./pages/ModelPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudyGenieUpload from "./pages/UploadFile";
import OnboardingPage from "./pages/OnboardingPage";

function App() {
  const Approuter = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage />
    },
    {
      path: '/model',
      element: <ModelPage />
    },
    {
      path: '/signup',
      element: <SignUp />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/onboarding',
      element: <OnboardingPage />
    },
    {
      path: '/upload',
      element: <StudyGenieUpload />
    },
    {
      path: '/dashboard',
      element: <Dashboard />
    }
  ]);

  return (
    <RouterProvider router={Approuter} future={{ v7_startTransition: true }} />
  );
}

export default App;