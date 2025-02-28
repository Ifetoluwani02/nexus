import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../Lib/supabase";
import "../styles/chat.css";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching messages:", error);
    else setMessages(data);

    setLoading(false);
  };

  const subscribeToMessages = () => {
    supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from("messages")
      .insert([{ user_id: user.id, content: newMessage }]);

    if (error) console.error("Error sending message:", error);
    else setNewMessage("");
  };

  return (
    <div>
      <h1>Chat</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div>
            {messages.map((message) => (
              <div key={message.id}>
                <p>
                  <strong>{message.user_id}:</strong> {message.content}
                </p>
                <p>{new Date(message.created_at).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
          <div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}