import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { logout } from "../../api/user";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { queryClient } from "../../api/queryClient";
import { AccessTokenContext } from "../../context/AccessTokenContext";

export const Account = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const { setAccessToken } = useContext(AccessTokenContext);
  const [logoutError, setLogoutError] = useState<string>("");

  const LogoutMutation = useMutation(
    {
      mutationFn: logout,
      onError(err) {
        const error = `Logout error: ${err}`;
        setLogoutError(error);
      },

      onSuccess() {
        setAccessToken(null);
        setUser(null);
        navigate("/auth");
      },
    },
    queryClient
  );

  return (
    <div>
      <ul>
        <li>User name: {user?.username}</li>
        <li>Email: {user?.email}</li>
      </ul>
      <button onClick={() => LogoutMutation.mutate()}>
        {LogoutMutation.isPending ? "Loading.." : "Log out"}
      </button>
      <div>{logoutError && logoutError}</div>
    </div>
  );
};
