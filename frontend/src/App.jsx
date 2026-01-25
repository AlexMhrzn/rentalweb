import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import { Toaster } from 'react-hot-toast';
import Headers from './pages/components/Headers';
import Footers from './pages/components/Footers';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import Edituser from './pages/EditUser';
import ProtectedRoute from './protected/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
function App() {
  // block for js 
  return (
    <Router>
      <Toaster />
      <Headers />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/contact" element={<div> contact</div>} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/ownerdashboard" element={<OwnerDashboard />} />

        <Route path="/admindash" element={
          <ProtectedRoute allowedRoles={['admin']} element={<Dashboard />}
          
          />} />

        <Route path="/edituser/:id" element={
          <ProtectedRoute allowedRoles={['admin']} element={<Edituser />}
          />
        } />
      </Routes>
      <Footers />
    </Router>
  )
}

export default App;