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
import Search from './pages/Search';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import Edituser from './pages/EditUser';
import ProtectedRoute from './protected/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import Account from './pages/Account';
import SwitchRole from './pages/SwitchRole';
import SplashScreen from './pages/components/SplashScreen';
import AllProperties from './pages/AllProperties';
import PropertyDetails from './pages/PropertyDetails';
function App() {
  // block for js 
  return (
    <Router>
      <Toaster />
      <Headers />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/create-admin" element={<AdminRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/userdashboard" element={
          <ProtectedRoute allowedRoles={['user', 'admin']} element={<UserDashboard />} />
        } />
        <Route path="/search" element={<Search />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/with/:userId" element={<Messages />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/contact" element={<div> contact</div>} />
        <Route path="/about" element={<div> about</div>} />
        <Route path="/admindashboard" element={
          <ProtectedRoute allowedRoles={['admin']} element={<AdminDashboard />} />
        } />
        <Route path="/ownerdashboard" element={
          <ProtectedRoute allowedRoles={['user', 'admin']} element={<OwnerDashboard />} />
        } />
        <Route path="/requests" element={
          <ProtectedRoute allowedRoles={['user', 'admin']} element={<Requests />} />
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['user','owner','admin']} element={<Profile />} />
        } />
        <Route path="/profile/account" element={
          <ProtectedRoute allowedRoles={['user','owner','admin']} element={<Account />} />
        } />
        <Route path="/switchrole" element={
          <ProtectedRoute allowedRoles={['user', 'admin']} element={<SwitchRole />} />
        } />
        <Route path="/edituser/:id" element={
          <ProtectedRoute allowedRoles={['admin']} element={<Edituser />} />
        } />
        <Route path="/properties" element={<AllProperties />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Routes>
      <Footers />
    </Router>
  )
}

export default App;