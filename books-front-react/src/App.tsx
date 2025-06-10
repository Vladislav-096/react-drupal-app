import { useMutation } from "@tanstack/react-query";
import { getUser, refreshAccessToken } from "./api/user";
import { queryClient } from "./api/queryClient";
import { CustomError } from "./api/validationResponse";
import { useEffect, useState } from "react";
import { AuthContext, User } from "./context/AuthContext";
import { AccessTokenContext } from "./context/AccessTokenContext";
import { Layout } from "./components/Layout/Layout";
import { localStorageUserKey } from "./constants/constants";

interface RequestError {
  message: string;
  code: string;
}

export const App = () => {
  // const [unauthorizedHandled, setUnauthorizedHandled] = useState(false); // чтобы не вызывать logout 100 раз
  // const [refreshTokenLoading, setRefreshTokenLoading] =
  // useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<RequestError | null>(null);
  const [isGetUserLoading, setIsGetUserLoading] = useState<boolean>(false);

  const updateUser = (newUserData: User | null) => {
    setUser(newUserData);
    if (newUserData) {
      localStorage.setItem(localStorageUserKey, JSON.stringify(newUserData));
    } else {
      console.log("Ошибка при получении профиля");
      localStorage.removeItem(localStorageUserKey);
    }
  };

  const refreshTokenMutation = useMutation(
    {
      mutationFn: refreshAccessToken,

      onError(err) {
        if (err instanceof CustomError) {
          // console.log("НЫААА: ", err.code);
          const error = { message: err.message, code: err.code };
          setError(error);
        } else {
          setError({ message: "Unknown error", code: "500" });
        }
      },

      async onSuccess(data) {
        try {
          console.log("onSuccess arg: ", data);
          setIsGetUserLoading(true);
          const userData = await getUser();
          const newUser = {
            username: userData.data.username,
            email: userData.data.email,
          };
          updateUser(newUser);
          setIsGetUserLoading(false);
        } catch (err) {
          if (err instanceof CustomError) {
            const error = { message: err.message, code: err.code };
            setError(error);
          } else {
            setError({ message: "Unknown error", code: "500" });
          }
        }
      },
    },
    queryClient
  );

  useEffect(() => {
    const newAccessToken = refreshTokenMutation.mutate();
    console.log(newAccessToken);
  }, []);

  if (refreshTokenMutation.isPending || isGetUserLoading) {
    return <div>Loading...</div>;
  }

  if (error && error.code === "500") {
    return <div>Server error, try later</div>;
  }

  return (
    <AccessTokenContext.Provider value={{ accessToken, setAccessToken }}>
      <AuthContext.Provider value={{ user, setUser: updateUser }}>
        <Layout />
      </AuthContext.Provider>
    </AccessTokenContext.Provider>
  );
};
