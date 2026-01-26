import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Register from './pages/Register';
import { Toaster } from 'react-hot-toast';
import Headers from './pages/components/Headers';
import Footers from './pages/components/Footers';
import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword';
import UserDashboard from './pages/UserDashboard';
import Edituser from './pages/EditUser';
import ProtectedRoute from './protected/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import SwitchRole from './pages/SwitchRole';
import SplashScreen from './pages/components/SplashScreen';
function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.5 seconds (2s display + 0.5s fade out)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // block for js 
  return (
     <>
      {showSplash && <SplashScreen />}
    <Router>
      <Toaster />
      <Headers />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/contact" element={<div> contact</div>} />
        <Route path="/about" element={<div> about</div>} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/ownerdashboard" element={<OwnerDashboard />} />
        <Route path="/switchrole" element={<SwitchRole />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />

        <Route path="/admindash" element={
          <ProtectedRoute allowedRoles={['admin']} element={<AdminDashboard />}
          />} />

        <Route path="/edituser/:id" element={
          <ProtectedRoute allowedRoles={['admin']} element={<Edituser />}
          />
        } />
      </Routes>
      <Footers />
    </Router>
     </>
  )
}

export default App;