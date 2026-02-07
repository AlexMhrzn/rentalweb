import axios from 'axios';

const ApiFormData=axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL,
    withCredentials:true,
    headers:{
        "Content-Type":"multipart/form-data",
    },
});

const Api=axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL,
    withCredentials:true,
    headers:{
        "Content-Type":"application/json",
    },
});

const getConfig = () => ({
  headers: {
    authorization: `Bearer ${localStorage.getItem("token-37c")}`,
  },
});

export const createUserApi=(data)=>ApiFormData.post('/api/user/user',data);
export const createAdminUserApi=(data)=>ApiFormData.post('/api/user/admin-register',data);
export const loginUserApi=(data)=>Api.post('/api/user/loginuser',data);
export const getUser = () => Api.get("/api/user/getalluser", getConfig());
export const deleteUserById = (id) => Api.delete(`/api/user/deleteuserbyid/${id}`, getConfig());
export const getUserById = (id) => Api.get(`/api/user/getusersbyid/${id}`, getConfig());
export const updateUserById = (id, data) => Api.put(`/api/user/updateuserbyid/${id}`, data, getConfig());
export const getMe = () => Api.get("/api/user/me", getConfig());

// Product/Property APIs
export const getProducts = (params) => Api.get("/api/product/products", { params });
export const getMyProducts = () => Api.get("/api/product/my", getConfig());
export const getProductById = (id) => Api.get(`/api/product/${id}`);
export const getPendingApprovals = () => Api.get("/api/product/pending", getConfig());
export const approveProduct = (id) => Api.post(`/api/product/approve/${id}`, {}, getConfig());
export const rejectProduct = (id) => Api.post(`/api/product/reject/${id}`, {}, getConfig());
export const createProduct = (data) => Api.post("/api/product/", data, getConfig());
export const updateProduct = (id, data) => Api.put(`/api/product/${id}`, data, getConfig());
export const deleteProduct = (id) => Api.delete(`/api/product/${id}`, getConfig());
export const getAdminStats = () => Api.get("/api/product/admin/stats", getConfig());
