import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getUser, login, logout, register } from "../../api/user";
import { queryClient } from "../../api/queryClient";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import styles from "./register.module.scss";
import { FormField } from "../FormField/FormField";
import {
  emailRules,
  passwordRules,
  userNameRules,
} from "../../constants/constants";
import { AccessTokenContext } from "../../context/AccessTokenContext";

interface FormFileds {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { setAccessToken } = useContext(AccessTokenContext);
  const [isOnSuccessRequestsPending, setIsOnSuccessRequestsPending] =
    useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>("");
  const [userNameValue, setUserNameValue] = useState<string>("user_name_2");
  const [emailValue, setEmailValue] = useState<string>("user_name_2@mail.ru");
  const [passwordValue, setPasswordValue] = useState<string>("Wasd2112");
  const [confirmPasswordValue, setConfirmPasswordValue] =
    useState<string>("Wasd2112");

  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    clearErrors("username");
    setValue("username", value);
    setUserNameValue(value);
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    clearErrors("email");
    setValue("email", value);
    setEmailValue(value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    clearErrors("password");
    setValue("password", value);
    setPasswordValue(value);
  };

  const handleConfirmPasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    clearErrors("confirmPassword");
    setValue("confirmPassword", value);
    setConfirmPasswordValue(value);
  };

  const registerMutation = useMutation(
    {
      mutationFn: register,

      onError(err) {
        const error = `Register error: ${err}`;
        setRegisterError(error);
      },

      async onSuccess() {
        try {
          setIsOnSuccessRequestsPending(true);
          const loginResponse = await login({
            username: userNameValue,
            password: passwordValue,
          });
          setAccessToken(loginResponse.access_token);
          const { data } = await getUser();
          if (data) {
            setUser(data);
            resetFormValues();
            navigate("/");
          } else {
            await logout();
          }
        } catch (err) {
          console.error(
            "Ошибка логина или получения пользователя, обнови страницу",
            err
          );
          setRegisterError(
            `Ошибка логина или получения пользователя, обнови страницу: ${err}`
          );
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
    formState: { errors },
    clearErrors,
  } = useForm<FormFileds>();

  const resetFormValues = () => {
    reset();
    setUserNameValue("");
    setEmailValue("");
    setPasswordValue("");
    setConfirmPasswordValue("");
    clearErrors();
  };

  const onSubmit = (formData: FormFileds) => {
    const req = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };
    console.log(req);
    registerMutation.mutate(req);
  };

  useEffect(() => {
    setValue("username", "user_name_2");
    setValue("email", "user_name_2@mail.ru");
    setValue("password", "Wasd2112");
    setValue("confirmPassword", "Wasd2112");
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
        errorMessage={errors.email?.message}
        text={emailValue}
        placeholder="Email"
      >
        <Controller
          name="email"
          control={control}
          rules={emailRules}
          render={() => (
            <input
              className={styles.input}
              value={emailValue}
              onChange={handleEmailChange}
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
      <FormField
        errorMessage={errors.confirmPassword?.message}
        text={confirmPasswordValue}
        placeholder="Confirm password"
      >
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            ...passwordRules,
            validate: (value) =>
              value === passwordValue || "Passwords don't match",
          }}
          render={() => (
            <input
              className={styles.input}
              value={confirmPasswordValue}
              onChange={handleConfirmPasswordChange}
              type="text"
            />
          )}
        />
      </FormField>
      <button type="submit">
        {registerMutation.isPending || isOnSuccessRequestsPending
          ? "Loading..."
          : "Register"}
      </button>
      {registerError && <div>{registerError}</div>}
    </form>
  );
};
