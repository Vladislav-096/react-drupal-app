import { z } from "zod";
import { API_URL } from "../constants/constants";
import { validateApiResponse } from "./validationResponse";

const bookSchema = z.object({
  id: z.number(),
  uid: z.number(),
  created: z.number(),
  name: z.string(),
  author: z.nullable(z.string()),
});
export type Book = z.infer<typeof bookSchema>;

const booksSchema = z.array(bookSchema);
export type Books = z.infer<typeof booksSchema>;

export const getBooks = async () => {
  return fetch(`${API_URL}/api/books`, {
    // Токен не живет больше на фронте. Тут Authorization само подставится. Все опирации с токеном и куки происходят на бэке
    method: "GET",
    credentials: "include",
  })
    .then(validateApiResponse)
    .then((res) => res.json())
    .then((data) => booksSchema.parse(data))
    .catch((err) => {
      console.log("getBooks function error", err);
      throw err;
    });
};

// export const addUserData = async (newUser: ) => {

// }
