import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../../api/queryClient";
import { useEffect, useState } from "react";
import { Book } from "../../api/books";
import { CustomError } from "../../api/validationResponse";
import { useNavigate } from "react-router";
import { useGetBooksWithRetry } from "../../hooks/useGetBooksWithRetry";

const limit = 5;
export const BooksTable = () => {
  const navigate = useNavigate();
  const [offset, setOffset] = useState<number>(0);
  const [books, setBooks] = useState<Book[]>([]);
  const getBooksWithRetry = useGetBooksWithRetry({ limit, offset });

  const getBooksQuery = useQuery(
    {
      queryFn: () => getBooksWithRetry(),
      queryKey: ["books", offset],
      // staleTime: 1000 * 60 * 0.16, // кэш живёт 5 минут
      // refetchOnMount: false,
      // refetchOnWindowFocus: false,
      retry: false,
    },
    queryClient
  );

  const handleNext = () => {
    if (getBooksQuery.data && offset + limit < getBooksQuery.data.total) {
      setOffset(offset + limit);
    }
  };

  const handlePrevious = () => {
    if (offset - limit >= 0) {
      setOffset(offset - limit);
    }
  };

  useEffect(() => {
    const data = getBooksQuery.data;
    if (data) {
      setBooks(data.items);
    }
  }, [getBooksQuery.data]);

  if (getBooksQuery.status === "pending") {
    return <div>Loading...</div>;
  }

  if (getBooksQuery.status === "error") {
    if (getBooksQuery.error instanceof CustomError) {
      const error = getBooksQuery.error;
      if (error.code === "401") {
        return (
          <div>
            <div>Unauthorized</div>
            <button onClick={() => navigate("/auth")}>Log in</button>
          </div>
        );
      }

      if (error.code === "500") {
        return <div>Server error, try later.</div>;
      }
    }

    return <div>Unknown error, try later</div>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>author</th>
            <th>created</th>
          </tr>
        </thead>
        <tbody>
          {books.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.author ? item.author : "no data"}</td>
              <td>{item.created}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={handlePrevious} disabled={offset === 0}>
          Previous
        </button>
        <span>
          Page {Math.floor(offset / limit) + 1} of{" "}
          {Math.ceil(getBooksQuery.data.total / limit)}
        </span>
        <button
          onClick={handleNext}
          disabled={offset + limit >= getBooksQuery.data.total}
        >
          Next
        </button>
      </div>
    </div>
  );
};
