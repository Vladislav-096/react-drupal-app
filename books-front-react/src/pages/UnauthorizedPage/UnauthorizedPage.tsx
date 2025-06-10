import { useNavigate } from "react-router";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div>Access denied. Log in first.</div>

      <button onClick={() => navigate("/auth")}>Log in</button>
    </div>
  );
};
