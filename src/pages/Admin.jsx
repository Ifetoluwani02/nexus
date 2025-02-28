import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../Lib/supabase";
import { logAction } from "../services/auditLogService";
import "../styles/admin.css";

export default function Admin() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (user && role === "admin") {
      fetchUsers();
      fetchTransactions();
      fetchAuditLogs();
    }
  }, [user, role]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) console.error("Error fetching users:", error);
    else setUsers(data);
    setLoading(false);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching transactions:", error);
    else setTransactions(data || []);
  };

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching audit logs:", error);
    else setAuditLogs(data);
  };

  const handleEditRole = async (userId) => {
    if (!newRole) return;
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("user_id", userId);
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
      setEditingUserId(null);
      setNewRole("");
      await logAction(user.id, "role_change", `Changed role of user ${userId} to ${newRole}`);
      fetchAuditLogs();
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const { error } = await supabase.from("profiles").delete().eq("user_id", userToDelete);
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.user_id !== userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
      await logAction(user.id, "delete_user", `Deleted user ${userToDelete}`);
      fetchAuditLogs();
    }
  };

  if (!user || role !== "admin") {
    return <p className="no-access">You do not have permission to access this page.</p>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-grid">
        <div className="admin-section">
          <h2>Users</h2>
          {loading ? (
            <p className="loading">Loading...</p>
          ) : (
            <ul>
              {users.map((user) => (
                <li key={user.user_id}>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p>
                    <strong>Role:</strong>{" "}
                    {editingUserId === user.user_id ? (
                      <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </p>
                  <div>
                    {editingUserId === user.user_id ? (
                      <>
                        <button onClick={() => handleEditRole(user.user_id)}>Save</button>
                        <button onClick={() => setEditingUserId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setEditingUserId(user.user_id)}>Edit Role</button>
                    )}
                    <button onClick={() => { setUserToDelete(user.user_id); setShowDeleteModal(true); }}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-section">
          <h2>Transactions</h2>
          {transactions.length === 0 ? (
            <p className="no-data">No transactions found.</p>
          ) : (
            <ul>
              {transactions.map((transaction) => (
                <li key={transaction.id}>
                  <p><strong>User ID:</strong> {transaction.user_id}</p>
                  <p><strong>Type:</strong> {transaction.type}</p>
                  <p><strong>Amount:</strong> ${transaction.amount ? transaction.amount.toFixed(2) : "0.00"}</p>
                  <p><strong>Date:</strong> {new Date(transaction.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-section">
          <h2>Audit Logs</h2>
          {auditLogs.length === 0 ? (
            <p className="no-data">No audit logs found.</p>
          ) : (
            <ul>
              {auditLogs.map((log) => (
                <li key={log.id}>
                  <p><strong>User ID:</strong> {log.user_id}</p>
                  <p><strong>Action:</strong> {log.action}</p>
                  <p><strong>Details:</strong> {log.details}</p>
                  <p><strong>Date:</strong> {new Date(log.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this user?</p>
            <button onClick={handleDeleteUser}>Yes</button>
            <button onClick={() => setShowDeleteModal(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}
