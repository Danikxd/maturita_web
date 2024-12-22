"use client";

import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";

import { createClient } from "../../../utils/supabase/client";

import axios from "axios";

interface Channel {
  id: number;
  channel_name: string;
  display_name: string | null;
  logo: string | null;
}

export default function TvChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch("http://localhost:3030/channels");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Channel[] = await response.json();
      const sortedChannels = data.sort((a, b) => a.id - b.id);
      setChannels(sortedChannels);
      console.log("Channels:", sortedChannels);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("Error retrieving session:", error);
        alert("Failed to authenticate. Please log in again.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:3030/tv_channels/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("TV channel successfully deleted!");
        setChannels((prev) => prev.filter((item) => item.id !== id));
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">TV Channels</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Channel Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Display Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">Logo</th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr
                key={channel.id}
                className="hover:bg-gray-100 transition duration-150"
              >
                <td className="border border-gray-300 px-4 py-2">{channel.id}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {channel.channel_name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {channel.display_name || "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={`${channel.channel_name} Logo`}
                      className="w-24 h-auto"
                    />
                  ) : (
                    "No logo"
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                    onClick={() => handleDelete(channel.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}