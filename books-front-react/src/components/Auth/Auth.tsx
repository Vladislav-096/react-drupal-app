import { useState } from "react";
import { Login } from "../Login/Login";
import { Register } from "../Register/Register";

export const Auth = () => {
  const [tab, setTab] = useState<string>("Login");

  return (
    <div>
      <div style={{ display: "flex" }}>
        <button
          onClick={() => setTab("Login")}
          style={{ marginRight: "10px", backgroundColor: tab === "Login" ? "#00BFFF" : "" }}
        >
          Login
        </button>
        <button
          onClick={() => setTab("Register")}
          style={{
            marginRight: "10px",
            backgroundColor: tab === "Register" ? "#00BFFF" : "",
          }}
        >
          Register
        </button>
      </div>
      {tab === "Login" ? <Login /> : <Register />}
    </div>
  );
};
