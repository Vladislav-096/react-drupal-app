import { createContext } from "react";

interface AccessTokenContext {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}

export const AccessTokenContext = createContext<AccessTokenContext>({
  accessToken: null,
  setAccessToken: () => {},
});
