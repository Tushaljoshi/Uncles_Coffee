import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Welcome from "./pages/Welcome";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import Bookings from "./pages/Bookings";
import TablesAvailability from "./pages/TablesAvailability"
import BookingDetails from "./pages/BookingDetails";
import BookingTracking from "./pages/BookingTracking";
function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Customer */}
          <Route path="/" element={<Welcome />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/tracking" element={<OrderTracking />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/tables" element={<TablesAvailability />} />
          <Route path="/bookings/details" element={<BookingDetails />} />
          <Route path="/bookings/tracking" element={<BookingTracking />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;