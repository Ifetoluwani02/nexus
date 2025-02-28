import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../Lib/supabase";
import Notifications from "../components/Notifications";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);

    if (error) console.error("Error fetching transactions:", error);
    else setTransactions(data);
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <Notifications />
      <p>Welcome, {user?.email}!</p>
      <button onClick={logout}>Logout</button>

      <h2>Your Transactions</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.amount} - {transaction.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
