import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createUserApi } from '../services/api';


const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validation()) return

    try{
      const response = await createUserApi(formData);
      
      if(response.data.success){
        toast.success("Registration successful");
      }
      else{
        toast.error("error in registration");
      }
    }catch(err){
      toast.error("Registration failed");
    }
    console.log(formData) // send to backend later
  }

  const validation=()=>{
    // add validation logic here
    if(!formData.username.trim()){
      toast.error("Username is required");
      return false;
    }
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
    if(formData.password!==formData.confirmPassword){
      toast.error("Passwords do not match");
      return false;
    }
    
    return true;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
           </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Register
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            Login here
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sm:rounded-2xl sm:px-12">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-slate-50/30"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

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
              <label htmlFor="password" strokeWidth={2} className="block text-sm font-semibold text-slate-700 mb-1.5">
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="confirm password"
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-slate-50/30"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98]"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register
