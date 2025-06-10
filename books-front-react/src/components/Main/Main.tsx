import { Route, Routes } from "react-router";
import { BooksPage } from "../../pages/BooksPage/BooksPage";
import { AuthPage } from "../../pages/AuthPage/AuthPage";
import { TestPage } from "../../pages/TestPage/TestPage";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { AccountPage } from "../../pages/AccountPage/AccountPage";
import { UnauthorizedPage } from "../../pages/UnauthorizedPage/UnauthorizedPage";
import RedirectIfAuth from "../RedirectIfAuth/RedirectIfAuth";

export const Main = () => {
  const { user } = useContext(AuthContext);

  return (
    <main>
      <Routes>
        <Route path="/" element={<BooksPage />} />
        <Route
          path="/auth"
          element={
            <RedirectIfAuth>
              <AuthPage />
            </RedirectIfAuth>
          }
        />
        {user ? (
          <Route path="/account" element={<AccountPage />} />
        ) : (
          <Route path="/account" element={<UnauthorizedPage />} />
        )}
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </main>
  );
};
