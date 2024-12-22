"use client"; 

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import axios from "axios";


interface Notification {
  id: number;
  channel_id: number;
  title: string;
  user_id: string;
}


interface Channel {
  id: number;
  channel_name: string;
  display_name: string | null;
  logo: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [newNotificationTitle, setNewNotificationTitle] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchChannels();
    fetchNotifications();
  }, []);

 
  const fetchChannels = async () => {
    try {
      const response = await fetch("http://localhost:3030/channels");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Channel[] = await response.json();
      setChannels(data);
      console.log("Channels:", data);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };


  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("User not authenticated or error fetching session:", error?.message);
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:3030/records", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch notifications");
        router.push("/login");
        return;
      }

      const data: Notification[] = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };


  const getChannelName = (channelId: number): string => {
    const channel = channels.find((ch) => ch.id === channelId);
    return channel ? channel.channel_name : "Unknown channel";
  };


  const handleDeleteNotification = async (id: number) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("Error retrieving session:", error);
        alert("Failed to authenticate. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await axios.delete(`http://localhost:3030/notifications/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.status === 200) {
        alert("Notification successfully deleted!");
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      } else {
        console.error("Error deleting notification:", response);
        alert("Failed to delete the notification. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete the notification. Please try again.");
    }
  };

  const handleAddNotification = async () => {
    if (!newNotificationTitle || !selectedChannel) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("Error retrieving session:", error);
        alert("Failed to authenticate. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:3030/notifications",
        {
          channel_id: Number(selectedChannel),
          title: newNotificationTitle,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

    
      if (response.status === 201) {
        alert("Notification successfully added!");
    
        setNotifications((prev) => [...prev, response.data]);

       
        setShowModal(false);
        setNewNotificationTitle("");
        setSelectedChannel(null);

    
        fetchNotifications();
      } else {
        console.error("Error adding notification:", response);
        alert("Failed to add the notification. Please try again.");
      }
    } catch (error) {
      console.error("Error adding notification:", error);
      alert("Failed to add the notification. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center py-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Notifications</h1>

      
      <button
        className="px-4 py-2 mb-6 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={() => setShowModal(true)}
      >
        Add Notification
      </button>

  
      {loading ? (
        <p className="text-gray-600">Loading notifications...</p>
      ) : notifications.length > 0 ? (
        <ul className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="border-b border-gray-200 pb-4 last:border-none"
            >
              <h2 className="text-lg font-semibold text-gray-700">
                {notification.title}
              </h2>
              <p className="text-gray-600">
                Channel name: {getChannelName(notification.channel_id)}
              </p>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none mt-2"
                onClick={() => handleDeleteNotification(notification.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No notifications found.</p>
      )}

    
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Add Notification</h2>
            <label className="block mb-2">Notification Title</label>
            <input
              type="text"
              className="border rounded w-full p-2 mb-4"
              value={newNotificationTitle}
              onChange={(e) => setNewNotificationTitle(e.target.value)}
            />

            <label className="block mb-2">Select Channel</label>
            <select
              className="border rounded w-full p-2 mb-4"
              value={selectedChannel || ""}
              onChange={(e) => setSelectedChannel(Number(e.target.value))}
            >
              <option value="" disabled>
                -- Select a Channel --
              </option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.channel_name}
                </option>
              ))}
            </select>

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
              onClick={handleAddNotification}
            >
              Add
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}