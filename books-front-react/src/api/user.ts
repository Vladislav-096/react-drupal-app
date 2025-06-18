import { z } from "zod";
import { API_URL } from "../constants/constants";
import { validateApiResponse, validateResponse } from "./validationResponse";

const userDataSchema = z.object({
  sub: z.string(),
  username: z.string(),
  email: z.string(),
  exp: z.number(),
});

const userSchema = z.object({
  message: z.string(),
  data: userDataSchema,
});

const refreshTokenSchema = z.object({
  access_token: z.string(),
});

const loginSchema = z.object({
  access_token: z.string(),
});

interface Register {
  username: string;
  email: string;
  password: string;
}

interface Login {
  username: string;
  password: string;
}

export const register = async ({ username, email, password }: Register) => {
  console.log("data reg: ", { username, email, password });
  return fetch(`${API_URL}/api/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  })
    .then(validateResponse)
    .catch((err) => {
      console.log("register function error", err);
      throw err;
    });
};

export const login = async ({ username, password }: Login) => {
  return fetch(`${API_URL}/api/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then(validateApiResponse)
    .then((res) => res.json())
    .then((data) => loginSchema.parse(data))
    .catch((err) => {
      console.log("login function err", err);
      throw err;
    });
};

export const logout = async () => {
  return fetch(`${API_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(validateResponse)
    .catch((err) => {
      console.log("logout finction err", err);
      throw err;
    });
};

export const refreshAccessToken = async () => {
  return fetch(`${API_URL}/api/refresh-access-token`, {
    method: "POST",
    credentials: "include",
  })
    .then(validateApiResponse)
    .then((res) => res.json())
    .then((data) => refreshTokenSchema.parse(data))
    .catch((err) => {
      console.log("refreshAccessToken function error", err);
      throw err;
    });
};

export const getUser = async () => {
  return fetch(`${API_URL}/api/get-user`, {
    method: "GET",
    credentials: "include",
  })
    .then(validateApiResponse)
    .then((res) => res.json())
    .then((data) => userSchema.parse(data))
    .catch((err) => {
      console.log("getUser function error", err);
      throw err;
    });
};
