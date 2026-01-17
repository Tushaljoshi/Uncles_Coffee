import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Products from "./pages/Products";
import Referral from "./pages/Refferal";
import Dashboard from "./pages/Dashboard";
import Chats from "./pages/Chats"
import Documents from "./pages/Documents";
import Profile from "./pages/Profile"
import HelpSupport from "./pages/Help&Support";
import UserInvestment from "./pages/UserInvestment";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/referral" element={<Referral/>} />
        <Route path="/chats" element={<Chats/>} />
        <Route path="/documents" element={<Documents/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/help" element={<HelpSupport/>} />
        <Route path="/investment" element={<UserInvestment/>} />
      </Routes>
    </Router>
  );
}

export default App;
