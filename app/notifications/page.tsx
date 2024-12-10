"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);


interface Notification {
  id: number;
  channel_id: number;
  title: string;
  user_id: string;
}

export default function NotificationsPage() {
  const [userID, setUserID] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUserID(user?.id || null);
      }
    };

    fetchUser();
  }, []);


  useEffect(() => {
    const fetchNotifications = async () => {
      if (userID) {
        try {
          const response = await fetch("http://localhost:3030/records", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userID }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch notifications");
          }

          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [userID]);

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
              <p className="text-gray-600">Channel ID: {notification.channel_id}</p>
             
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No notifications found.</p>
      )}
    </div>
  );
}