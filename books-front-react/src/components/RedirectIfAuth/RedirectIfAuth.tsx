import { ReactNode, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router";

interface RedirectIfAuth {
  children: ReactNode;
}

export default function RedirectIfAuth({ children }: RedirectIfAuth) {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
