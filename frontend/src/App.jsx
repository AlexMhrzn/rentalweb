import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import { Toaster } from 'react-hot-toast';
import Headers from './pages/components/Headers';
import Footers from './pages/components/Footers';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import ForgetPassword from './pages/ForgetPassword';
import UserDashboard from './pages/UserDashboard';
import Edituser from './pages/EditUser';
import ProtectedRoute from './protected/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import SwitchRole from './pages/SwitchRole';
import SplashScreen from './pages/components/SplashScreen';
function App() {
  // block for js 
  return (
    <Router>
      <Toaster />
      <Headers />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userdashboard" element={
          <ProtectedRoute allowedRoles={['user', 'admin']} element={<UserDashboard />} />
        } />
        <Route path="/contact" element={<div> contact</div>} />
        <Route path="/about" element={<div> about</div>} />
        <Route path="/admindashboard" element={
          <ProtectedRoute allowedRoles={['admin']} element={<AdminDashboard />} />
        } />
        <Route path="/ownerdashboard" element={
          <ProtectedRoute allowedRoles={['user', 'admin']} element={<OwnerDashboard />} />
        } />
        <Route path="/switchrole" element={
          <ProtectedRoute allowedRoles={['user', 'admin']} element={<SwitchRole />} />
        } />

        <Route path="/edituser/:id" element={
          <ProtectedRoute allowedRoles={['admin']} element={<Edituser />} />
        } />
      </Routes>
      <Footers />
    </Router>
  )
}

export default App;