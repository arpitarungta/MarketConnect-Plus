// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Register from './components/Auth/Register';
import LoginVendor from './components/Auth/LoginVendor';
import LoginSupplier from './components/Auth/LoginSupplier';
import VendorDashboard from './components/Dashboards/VendorDashboard';
import SupplierDashboard from './components/Dashboards/SupplierDashboard';
import VendorSupplierPage from "./components/Dashboards/VendorSupplierPage";
import SupplierOrders from "./components/Dashboards/SupplierOrders";
import CheckoutPage from "./components/Dashboards/CheckoutPage";
import VendorOrders from "./components/Dashboards/VendorOrders";
import Settings from "./components/Dashboards/Settings";
import VendorSearchPage from "./components/Dashboards/VendorSearchPage";
import SupplierReport from "./components/Dashboards/SupplierReport";
import Profile from "./components/Profile";
import SearchSuppliers from "./components/Dashboards/SearchSuppliers";

function HomeHero() {
  return (
    <div className="center-hero">
      <h1>Welcome to MarketConnect+</h1>
      <p>Your perfect marketplace experience begins here.</p>

      {/* NEW SECTION START */}
      <div style={{ marginTop: 30 }}>

        <Link to="/register" className="mc-btn-primary">
          Register
        </Link>

        <p style={{ marginTop: 15 }}>
          Already have an account?
        </p>

        <div style={{
          display: "flex",
          gap: 15,
          justifyContent: "center",
          marginTop: 10
        }}>

          <Link to="/login/supplier" className="mc-btn-primary">
            Login as Supplier
          </Link>

          <Link to="/login/vendor" className="mc-btn-primary">
            Login as Vendor
          </Link>

        </div>

      </div>
      {/* NEW SECTION END */}

    </div>
  );
}




function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeHero />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login/vendor" element={<LoginVendor />} />
        <Route path="/login/supplier" element={<LoginSupplier />} />

        {/* Vendor Dashboard */}
        <Route path="/dashboard/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />

        {/* Supplier Dashboard */}
        <Route path="/dashboard/supplier" element={<SupplierDashboard />} />
        <Route path="/supplier/dashboard" element={<SupplierDashboard />} />

        {/* Supplier page */}
        <Route path="/vendor/supplier/:supplierId" element={<VendorSupplierPage />} />

        <Route path="/supplier/orders" element={<SupplierOrders />} />

        <Route path="/vendor/checkout" element={<CheckoutPage />} />

        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/vendor/search" element={<VendorSearchPage />} />
        <Route path="/supplier/report" element={<SupplierReport />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/vendor/suppliers" element={<SearchSuppliers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
