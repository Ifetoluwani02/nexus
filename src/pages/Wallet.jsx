import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../Lib/supabase";
import { logAction } from "../services/auditLogService";
import "../styles/wallet.css";

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (error) console.error("Error fetching balance:", error);
    else setBalance(data?.balance || 0);
  };

  const sendNotification = async (message) => {
    const { error } = await supabase
      .from("notifications")
      .insert([{ user_id: user.id, message }]);

    if (error) console.error("Error sending notification:", error);
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setError("");

    const newBalance = balance + parseFloat(amount);

    const { error: walletError } = await supabase
      .from("wallets")
      .upsert({ user_id: user.id, balance: newBalance })
      .select();

    if (walletError) {
      setError("Error updating balance.");
      console.error(walletError);
    } else {
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([{ user_id: user.id, type: "deposit", amount: parseFloat(amount) }]);

      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
      } else {
        await sendNotification(`Deposit of $${amount} successful.`);
        await logAction(user.id, "deposit", `Deposit of $${amount} successful.`);
      }

      setBalance(newBalance);
      setAmount("");
    }

    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (parseFloat(amount) > balance) {
      setError("Insufficient funds.");
      return;
    }

    setLoading(true);
    setError("");

    const newBalance = balance - parseFloat(amount);

    const { error: walletError } = await supabase
      .from("wallets")
      .upsert({ user_id: user.id, balance: newBalance })
      .select();

    if (walletError) {
      setError("Error updating balance.");
      console.error(walletError);
    } else {
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([{ user_id: user.id, type: "withdrawal", amount: parseFloat(amount) }]);

      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
      } else {
        await sendNotification(`Withdrawal of $${amount} successful.`);
        await logAction(user.id, "withdraw", `Withdrawal of $${amount} successful.`);
      }

      setBalance(newBalance);
      setAmount("");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Wallet</h1>
      <p>Your current balance: ${balance.toFixed(2)}</p>

      <div>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleDeposit} disabled={loading}>
          Deposit
        </button>
        <button onClick={handleWithdraw} disabled={loading}>
          Withdraw
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
