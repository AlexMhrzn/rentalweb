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

const config={
    headers:{
        "authorization":`Bearer ${localStorage.getItem("token-37c")}`,
    },
};

export const createUserApi=(data)=>ApiFormData.post('api/user/user',data);
export const loginUserApi=(data)=>Api.post('api/user/loginuser',data);
export const getUser = () => Api.get("/api/user/getallUsers",config)
export const deleteUserById = (data) => Api.delete(`/api/user/deleteuser/${data}`)
export const getUserById = (id) => Api.get(`/api/user/getuser/${id}`,config)
export const updateUserById = (id, data) => Api.put(`/api/user/updateuser/${id}`, data,config)
export const getMe = () => Api.get("/api/user/me", config);
