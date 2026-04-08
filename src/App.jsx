import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import MechanicServices from "./pages/MechanicServices";
import Referral from "./pages/Refferal";
import Dashboard from "./pages/Dashboard";
import Chats from "./pages/Chats";
import AddBanner from "./pages/AddBanner";
import Service from "./pages/CreateService";
import Profile from "./pages/CustomerProfile"
import MechanicProfile from "./pages/MechanicProfile"
import HelpSupport from "./pages/Help&Support";
import Dispute from "./pages/Dispute";
import Plan from "./pages/CreatePlan"
import UserWallet from "./pages/UserWallet"
import CustomerAssets from "./pages/Customer_Assets";
import AddReview from "./pages/AddReview";
import CustomerBooking from "./pages/CustomerBooking";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mechanicaservices" element={<MechanicServices />} />
        <Route path="/referral" element={<Referral/>} />
        <Route path="/chats" element={<Chats/>} />
        <Route path="/add-banner" element={<AddBanner/>} />
        <Route path="/service" element={<Service/>} />
        <Route path="/customer-profile" element={<Profile/>} />
        <Route path="/mechanic-profile" element={<MechanicProfile/>} />
        <Route path="/help" element={<HelpSupport/>} />
        <Route path="/dispute" element={<Dispute/>} />
        <Route path="/plan" element={<Plan/>} />
        <Route path="/userwallet" element={<UserWallet/>} />
        <Route path="/assests" element={<CustomerAssets/>} />
        <Route path="/add-review" element={<AddReview/>} />
        <Route path="/customer-booking" element={<CustomerBooking/>} />
      </Routes>
    </Router>
  );
}

export default App;
