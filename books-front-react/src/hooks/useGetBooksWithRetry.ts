import { useContext } from "react";
import { getBooks } from "../api/books";
import { refreshAccessToken } from "../api/user";
import { AccessTokenContext } from "../context/AccessTokenContext";
import { CustomError } from "../api/validationResponse";

export const useGetBooksWithRetry = () => {
  const { accessToken, setAccessToken } = useContext(AccessTokenContext);

  const fetchBooks = async () => {
    try {
      return await getBooks(accessToken || "");
    } catch (error) {
      // Если access токен истек
      if (error instanceof CustomError && error.code === "401") {
        try {
          const newTokens = await refreshAccessToken();
          setAccessToken(newTokens.access_token); // обнови токен в контексте
          return await getBooks(newTokens.access_token); // повтор запроса
        } catch (err) {
          setAccessToken(null); // сброс состояния токена
          //   throw new Error("Unauthorized");
          throw err;
        }
      }

      throw error;
    }
  };

  return fetchBooks;
};
