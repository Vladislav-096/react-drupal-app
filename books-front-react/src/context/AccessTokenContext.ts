import { createContext } from "react";

export interface AccessTokenContext {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}

export const AccessTokenContext = createContext<AccessTokenContext>({
  accessToken: null,
  setAccessToken: () => {},
});
