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
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editChannelId, setEditChannelId] = useState<number | null>(null);
  const [newChannelName, setNewChannelName] = useState<string>("");
  const [newDisplayName, setNewDisplayName] = useState<string>("");
  const [newLogo, setNewLogo] = useState<string>("");

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
        console.error("Error deleting TV channel:", response);
        alert("Failed to delete the TV channel. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting TV channel:", error);
      alert("Failed to delete the TV channel. Please try again.");
    }
  };

  const handleAddOrUpdateChannel = async () => {
    if (!newChannelName) {
      alert("Please provide a channel name.");
      return;
    }
    console.log(editChannelId);

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

      const url = isEditing
        ? `http://localhost:3030/tv_channels/${editChannelId}`
        : "http://localhost:3030/tv_channels";

      const method = isEditing ? "PATCH" : "POST";

      const response = await axios({
        method,
        url,
        data: {
          channel_name: newChannelName,
          display_name: newDisplayName || null,
          logo: newLogo || null,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert(
          isEditing
            ? "TV channel successfully updated!"
            : "TV channel successfully added!"
        );

        setShowModal(false);
        setNewChannelName("");
        setNewDisplayName("");
        setNewLogo("");
        setIsEditing(false);
        setEditChannelId(null);

        fetchChannels();
      } else {
        console.error(
          isEditing ? "Error updating TV channel:" : "Error adding TV channel:",
          response
        );
        alert(
          isEditing
            ? "Failed to update the TV channel. Please try again."
            : "Failed to add the TV channel. Please try again."
        );
      }
    } catch (error) {
      console.error(
        isEditing ? "Error updating TV channel:" : "Error adding TV channel:",
        error
      );
      alert(
        isEditing
          ? "Failed to update the TV channel. Please try again."
          : "Failed to add the TV channel. Please try again."
      );
    }
  };

  const handleEdit = (channel: Channel) => {
    setIsEditing(true);
    setEditChannelId(channel.id);
    setNewChannelName(channel.channel_name);
    setNewDisplayName(channel.display_name || "");
    setNewLogo(channel.logo || "");
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">TV Channels</h1>

      <button
        className="px-4 py-2 mb-6 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={() => {
          setIsEditing(false);
          setEditChannelId(null);
          setNewChannelName("");
          setNewDisplayName("");
          setNewLogo("");
          setShowModal(true);
        }}
      >
        Add TV Channel
      </button>

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
                      alt={`N/A`}
                      className="w-24 h-auto"
                    />
                  ) : (
                    "No logo"
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none mr-2"
                    onClick={() => handleEdit(channel)}
                  >
                    Edit
                  </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit TV Channel" : "Add TV Channel"}
            </h2>

            <label className="block mb-2">Channel Name</label>
            <input
              type="text"
              className="border rounded w-full p-2 mb-4"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />

            <label className="block mb-2">Display Name</label>
            <input
              type="text"
              className="border rounded w-full p-2 mb-4"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />

            <label className="block mb-2">Logo URL</label>
            <input
              type="text"
              className="border rounded w-full p-2 mb-4"
              value={newLogo}
              onChange={(e) => setNewLogo(e.target.value)}
            />

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
              onClick={handleAddOrUpdateChannel}
            >
              {isEditing ? "Update" : "Add"}
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