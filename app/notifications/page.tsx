"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  channel_id: number;
  title: string;
  user_id: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Get the user's session
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

    fetchNotifications();
  }, [supabase, router]);

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