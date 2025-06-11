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

export const getBooks = async (accessToken: string) => {
  return fetch(`${API_URL}api/get-books`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(validateApiResponse)
    .then((res) => res.json())
    .then((data) => booksSchema.parse(data))
    .catch((err) => {
      console.log("getBooks function error", err);
      throw err;
    });
};
