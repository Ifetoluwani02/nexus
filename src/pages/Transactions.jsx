import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../Lib/supabase";
import "../styles/transactions.css";

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching transactions:", error);
    else setTransactions(data);

    setLoading(false);
  };

  return (
    <div>
      <h1>Transactions</h1>
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <p>
                <strong>Type:</strong> {transaction.type}
              </p>
              <p>
                <strong>Amount:</strong> ${transaction.amount.toFixed(2)}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(transaction.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}