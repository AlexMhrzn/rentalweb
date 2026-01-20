import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { loginUserApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const navigate= useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validation()) return;

    try{
      const response = await loginUserApi(formData);
      
      if(response?.data?.success){
        localStorage.setItem("token",response?.data?.token);
        let decoded;
        try{
          decoded=jwtDecode(response?.data?.token);
          toast.success("Login successful");
          if(decoded.role==="admin"){
            navigate("/admindash",{replace:true});
          }else{
            navigate("/userdash",{replace:true});
          }
          window.location.reload();
        }catch{ 
          console.error("Invalid token");
          toast.error("Invalid token received");
        }
      }
      else{
        toast.error("error in login");
      }

    }catch(err){
      toast.error("Login failed");
    }
    console.log(formData) // send to backend later
  }

  const validation=()=>{
    // add validation logic here
    if(!formData.email.trim()){
      toast.error("Email is required");
      return false;
    }
    if(!/\S+@\S+\.\S+/.test(formData.email)){
      toast.error("Email is invalid");
      return false;
    }
    if(!formData.password){
      toast.error("Password is required");
      return false;
    }
    if(formData.password.length<6){
      toast.error("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
           </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            Register here
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sm:rounded-2xl sm:px-12">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="mail"
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-slate-50/30"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-slate-50/30"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98]"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login