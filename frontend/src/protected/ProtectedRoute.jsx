import { Navigate } from "react-router-dom";
import { getUserRole } from "./Auth";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const role = getUserRole();

  if (!role || !allowedRoles.includes(role)) {
    localStorage.removeItem("token-37c");
    localStorage.removeItem("user-role");
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;