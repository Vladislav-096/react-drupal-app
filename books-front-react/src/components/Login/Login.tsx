import { useMutation } from "@tanstack/react-query";
import { useContext, useState, ChangeEvent, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import { queryClient } from "../../api/queryClient";
import { getUser, login } from "../../api/user";
import { AuthContext } from "../../context/AuthContext";
import { FormField } from "../FormField/FormField";
import styles from "./login.module.scss";
import { passwordRules, userNameRules } from "../../constants/constants";
import { AccessTokenContext } from "../../context/AccessTokenContext";

interface FormFileds {
  username: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { setAccessToken } = useContext(AccessTokenContext);
  const [isOnSuccessRequestsPending, setIsOnSuccessRequestsPending] =
    useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [userNameValue, setUserNameValue] = useState<string>("noobAss");
  const [passwordValue, setPasswordValue] = useState<string>("Wasd2112");

  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    clearErrors("username");
    setValue("username", value);
    setUserNameValue(value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    clearErrors("password");
    setValue("password", value);
    setPasswordValue(value);
  };

  const loginMutation = useMutation(
    {
      mutationFn: login,

      onError(err) {
        const error = `Login error: ${err}`;
        setLoginError(error);
      },

      async onSuccess(response) {
        try {
          setAccessToken(response.access_token);
          setIsOnSuccessRequestsPending(true);
          const { data } = await getUser();
          setIsOnSuccessRequestsPending(false);
          setUser(data);
          resetFormValues();
          navigate("/");
        } catch (e) {
          console.log("also here");
          setAccessToken(null);
          setLoginError("Ошибка при верификации пользователя? попробуй позже");
          console.error("verifyUser error", e);
        } finally {
          setIsOnSuccessRequestsPending(false);
        }
      },
    },
    queryClient
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    // trigger,
    formState: { errors },
    clearErrors,
  } = useForm<FormFileds>();

  const resetFormValues = () => {
    reset();
    setUserNameValue("");
    setPasswordValue("");
    clearErrors();
  };

  const onSubmit = (formData: FormFileds) => {
    const { username, password } = formData;
    console.log({ username, password });
    loginMutation.mutate({ username, password });
  };

  useEffect(() => {
    setValue("username", "noobAss");
    setValue("password", "Wasd2112");
  }, []);

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <FormField
        errorMessage={errors.username?.message}
        text={userNameValue}
        placeholder="User name"
      >
        <Controller
          name="username"
          control={control}
          rules={userNameRules}
          render={() => (
            <input
              className={styles.input}
              value={userNameValue}
              onChange={handleUserNameChange}
              type="text"
            />
          )}
        />
      </FormField>
      <FormField
        errorMessage={errors.password?.message}
        text={passwordValue}
        placeholder="Password"
      >
        <Controller
          name="password"
          control={control}
          rules={passwordRules}
          render={() => (
            <input
              className={styles.input}
              value={passwordValue}
              onChange={handlePasswordChange}
              type="text"
            />
          )}
        />
      </FormField>
      <button type="submit">
        {loginMutation.isPending || isOnSuccessRequestsPending
          ? "Loading..."
          : "Log in"}
      </button>
      {loginError && <div>{loginError}</div>}
    </form>
  );
};
