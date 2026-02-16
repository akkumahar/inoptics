import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isExhibitorLoggedIn");

  if (!isLoggedIn) {
    return <Navigate to="/exhibitor-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
