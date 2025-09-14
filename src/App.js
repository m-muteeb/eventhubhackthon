import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Corrected import for named export
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard'; // Ensure this import is correct
import Login from './pages/Login';
import Register from './pages/Register';
import AccessDenied from './pages/AccessDenied'; // Corrected import for Access Denied page
import PrivateRoute from './components/PrivateRoute'; // Ensure this import is correct
import Footer from './components/Footer'; 
import PageNotFound from './pages/PageNotFound'; // Import the PageNotFound component

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>

        <Route path="/" element={<BuyerDashboard />} />
       
          <Route path="/login" element={<Login />} />
         
          <Route path="/register" element={<Register />} />
       
          <Route path="/seller-dashboard" element={<PrivateRoute element={<SellerDashboard />} />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<PageNotFound />} /> {/* Catch-all route for undefined paths */}
        </Routes>
        <Footer/>
      </Router>
    </AuthProvider>
  );
};

export default App;
