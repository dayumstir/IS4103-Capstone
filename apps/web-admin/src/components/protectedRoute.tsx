import { Navigate, Outlet } from "react-router-dom";
import Header from "./header";
import { useGetProfileQuery } from "../redux/services/adminService";

export default function ProtectedRoute() {
  const jwt_token = localStorage.getItem("token");
  const isAuthenticated = !!jwt_token;

  const { data: user } = useGetProfileQuery();
  const isSuperAdmin = user?.admin_type === "SUPER";

  if (isAuthenticated) {
    return (
      <>
        <Header isSuperAdmin={isSuperAdmin} />
        <div className={`${isAuthenticated ? "mt-16" : ""} min-h-screen`}>
          <Outlet />
        </div>
      </>
    );
  } else {
    return <Navigate to={"/login"} />;
  }
}
