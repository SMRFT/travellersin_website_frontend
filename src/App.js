import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle, theme } from "./GlobalStyles";

/* ===== Layout ===== */
import Navbar from "./Components/Tools/Navbar";
import Footer from "./Components/Tools/Footer";
import ScrollToTop from "./Components/Tools/ScrollToTop";

/* ===== Auth ===== */
import { AuthProvider } from "./Components/auth/AuthContext";
import LoginModal from "./Components/auth/LoginModal";

/* ===== Pages ===== */
import Home from "./Components/pages/Home";
import Rooms from "./Components/pages/Rooms";
import RoomDetails from "./Components/pages/RoomDetails";
import Events from "./Components/pages/Events";
import Booking from "./Components/pages/Booking";
import Payment from "./Components/pages/Payment";
import Confirmation from "./Components/pages/Confirmation";
import Profile from "./Components/pages/Profile";
import Contact from "./Components/pages/Contact";
import AdminLogin from "./Components/pages/AdminLogin";
import AdminSignup from "./Components/pages/AdminSignup";
import AdminDashboard from "./Components/pages/AdminDashboard";
import QuickBooking from "./Components/pages/QuickBooking";
import TrackBooking from './Components/pages/TrackBooking';
import Gallery from "./Components/pages/Gallery";
import TrackEvent from "./Components/pages/TrackEvent";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Navbar />

          {/* Optional Global Login Modal */}
          <LoginModal />

          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:roomId" element={<RoomDetails />} />
            <Route path="/booking/:roomId" element={<Booking />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/track-booking" element={<TrackBooking />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/quick-booking" element={<QuickBooking />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/trackevent" element={<TrackEvent />} />
          </Routes>

          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;