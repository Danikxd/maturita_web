"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { set } from "react-datepicker/dist/date_utils";

import axios from "axios";

interface Notification {
  id: number;
  channel_id: number;
  title: string;
  user_id: string;
}


interface ChannelsMap {
  [key: number]: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [channels, setChannels] = useState<ChannelsMap>({});

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
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

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3030/channels");
    
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
    
        const data = await response.json();
        
        setChannels(data);
        console.log("Channels:", data);
      } catch (error) {
        console.error("Error fetching channels:", error);
        throw error;
      } finally {
        
        setLoading(false);
      }
    };
        
        
    fetchChannels();
    fetchNotifications();
  }, [supabase, router]);

 
  function getChannelName(channelId: number, channels: Record<number, string>): string {
    return channels[channelId] || "Unknown channel";
  }


  
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
  

  return (
    <div className="flex flex-col items-center py-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Notifications</h1>
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
              <p className="text-gray-600">Channel name: {getChannelName(notification.channel_id, channels)}</p>
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
    </div>
  );
}