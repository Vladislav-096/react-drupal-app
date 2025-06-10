import { useContext } from "react";
import { Link, NavLink } from "react-router";
import { AuthContext } from "../../context/AuthContext";

const links = [
  { path: "/", title: "Books" },
  { path: "/test", title: "Test" },
];

export const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header>
      <div className="constainer">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <nav style={{ maxWidth: "300px", overflowX: "auto" }}>
            {links.map((link, index) => (
              <NavLink key={index} to={link.path}>
                {link.title}
              </NavLink>
            ))}
          </nav>
          <Link to="/auth">{user ? "Account" : "Login"}</Link>
        </div>
      </div>
    </header>
  );
};
