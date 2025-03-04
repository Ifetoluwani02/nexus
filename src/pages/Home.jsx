import "../styles/home.css";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      {/* The Navigation Link */}
      <div>
        <section className="flex justify-evenly p-5">
          <Link to={"/"}>Home</Link>
          <Link to={"/login"}>Link</Link>
          <Link to={"/register"}>Register</Link>
          <Link to={"/transactions"}>Transactions</Link>
          <Link to={"/wallet"}>Wallet</Link>
          <Link to={"/chat"}>Chat</Link>
          <Link to={"/admin"}>Admin</Link>
        </section>
      </div>
      <h2>Welcome to Nexus Financial App</h2>
      <p>Manage your finances with ease and security.</p>
    </div>
  );
}
