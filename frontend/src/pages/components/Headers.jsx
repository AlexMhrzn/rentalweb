import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe } from "../../services/api";
import { getToken } from "../../protected/Auth";
import toast from 'react-hot-toast';

const Headers = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
 
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await getMe();
        setUser(response.data.user);
      } catch (error) {
        console.error('fetchMe failed', error);
        toast.error(error.response?.data?.message || 'Session expired, please log in');
        localStorage.removeItem("token-37c");
        localStorage.removeItem("user-role");
        setUser(null);
      }
    };
    if (getToken()) {
      fetchMe();
    }
  }, []);
 
  const handleLogout = () => {
    const confirmDelete = window.confirm("Are you sure you want to logout this user?");
    if (!confirmDelete) return;
    localStorage.removeItem("token-37c");
 
    localStorage.removeItem("user-role");
    setUser(null);
    navigate("/login");
  };
 
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f5f5f5",
        textAlign: "center",
        fontWeight: "bold",
      }}
    >
      {/* header intentionally left blank */}
    </div>
  );
};
 
export default Headers;
 
 