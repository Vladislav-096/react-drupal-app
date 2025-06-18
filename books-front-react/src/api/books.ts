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

const booksResponseSchema = z.object({
  items: z.array(bookSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});
export type BooksResponse = z.infer<typeof booksResponseSchema>;

interface GetBooks {
  accessToken: string;
  limit: number;
  offset: number;
}

export const getBooks = async ({
  accessToken,
  limit = 5,
  offset = 0,
}: GetBooks) => {
  const url = new URL(`${API_URL}/api/get-books`);
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("offset", offset.toString());

  return fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(validateApiResponse)
    .then((res) => res.json())
    .then((data) => booksResponseSchema.parse(data))
    .catch((err) => {
      console.log("getBooks function error", err);
      throw err;
    });
  // return fetch(`${API_URL}/api/get-books`, {
  //   method: "GET",
  //   credentials: "include",
  //   headers: {
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  // })
  //   .then(validateApiResponse)
  //   .then((res) => res.json())
  //   .then((data) => booksSchema.parse(data))
  //   .catch((err) => {
  //     console.log("getBooks function error", err);
  //     throw err;
  //   });
};
