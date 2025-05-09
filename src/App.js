import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import LoginWithOtp from "./LoginWithOtp"; // Import OTP Login Page
import Home from "./Home";
import Layout from "./Layout";
import Profile from "./Profile";
import Portfolios from "./Portfolios";
import Portfolioslist from "./Portfolioslist";
import ProductDetail from "./ProductDetail";
import CreatePortfolio from "./CreatePortfolio";
import ViewinAr from "./ViewinAR";
import Selectmodel from "./Selectmodel";
import PrivateRoute from "./components/PrivateRoute";
import Catelog from "./Catelog";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "font-awesome/css/font-awesome.min.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout wraps all routes where the header is needed */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" />} /> {/* Redirects from "/" to "/home" */}
          <Route path="home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="portfolios" element={<PrivateRoute><Portfolios /></PrivateRoute>} />
          <Route path="/portfolios/:slug" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
          <Route path="portfolioslist/:id" element={<PrivateRoute><Portfolioslist /></PrivateRoute>} />
          <Route path="createportfolio" element={<PrivateRoute><CreatePortfolio /></PrivateRoute>} />
          <Route path="selectmodel" element={<PrivateRoute><Selectmodel /></PrivateRoute>} />
          <Route path="viewinar" element={<PrivateRoute><ViewinAr /></PrivateRoute>} />
          <Route path="catelog" element={<PrivateRoute><Catelog /></PrivateRoute>} />
        </Route>

        {/* Routes that don't require the Layout (e.g., Register, Login, OTP Login) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-otp" element={<LoginWithOtp />} /> {/* New OTP Login Route */}

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
