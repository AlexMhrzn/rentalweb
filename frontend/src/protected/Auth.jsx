import { jwtDecode } from "jwt-decode";

export const getToken = () => localStorage.getItem("token-37c");
// export const getUserDetails = () => {
//   const user = localStorage.getItem("user");
//   return user ? JSON.parse(user) : null; 
// };
export const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) return true;
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (e) {
        return true;
    }
};
export const getUserRole = () => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
         localStorage.removeItem("token-37c");
         localStorage.removeItem("user-role");
        return null;
    }
    try {
        const decoded = jwtDecode(token);
        // Check if role is in token, otherwise get from localStorage
        return decoded.role || localStorage.getItem("user-role");
    } catch (e) {
        localStorage.removeItem("token-37c");
        localStorage.removeItem("user-role");
        return null;
    }
};