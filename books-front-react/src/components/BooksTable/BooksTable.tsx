import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../../api/queryClient";
import { useEffect, useState } from "react";
import { Books, getBooks } from "../../api/books";
import { CustomError } from "../../api/validationResponse";
import { useNavigate } from "react-router";

export const BooksTable = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Books>([]);

  const getBooksQuery = useQuery(
    {
      queryFn: () => getBooks(),
      queryKey: ["books"],
      // staleTime: 1000 * 60 * 0.16, // кэш живёт 5 минут
      // refetchOnMount: false,
      // refetchOnWindowFocus: false,
      retry: false,
    },
    queryClient
  );

  useEffect(() => {
    const data = getBooksQuery.data;
    if (data) {
      setBooks(data);
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
  );
};
