import { useNotifications } from "../context/NotificationsContext";
import "../styles/notifications.css";

export default function Notifications() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.read ? "read" : "unread"}
            >
              <p>{notification.message}</p>
              <p className="timestamp">
                {new Date(notification.created_at).toLocaleString()}
              </p>
              {!notification.read && (
                <button onClick={() => markAsRead(notification.id)}>
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
