import { createContext } from "react";

export interface User {
  username: string;
  email: string;
}

export interface AuthContext {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {},
});
