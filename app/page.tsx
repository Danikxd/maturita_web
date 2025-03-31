"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createClient } from "../utils/supabase/client";

interface SeriesItem {
  id: string;
  title: string;
  desc: string;
  start: string;
  end: string;
  channel_id: string;
}

interface ChannelItem {
  id: number;
  channel_name: string;
  display_name: string;
  logo: string;
}

export default function SeriesPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [channels, setChannels] = useState<Record<string, ChannelItem>>({});
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3030";

  const supabase = createClient();

  const fetchChannels = useCallback(async () => {
    try {
      const response = await axios.get<ChannelItem[]>(
        `${API_BASE_URL}/channels`
      );
      const channelMap = response.data.reduce((acc, channel) => {
        acc[channel.id.toString()] = channel; // Use string keys for consistency
        return acc;
      }, {} as Record<string, ChannelItem>);
      console.log("Fetched channels data:", channelMap);
      setChannels(channelMap);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }, []);

  const fetchSeries = useCallback(async (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    try {
      const response = await axios.get<SeriesItem[]>(
        `${API_BASE_URL}/series/${formattedDate}`
      );
      setSeries(response.data);
      console.log("Fetched series data:", response.data);
    } catch (error) {
      console.error("Error fetching series:", error);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    fetchSeries(date);
  }, [date, fetchChannels, fetchSeries]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        setUserEmail(undefined);
      } else {
        setUserEmail(user?.email || undefined);
      }
    };

    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail(undefined);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleRecordShow = async () => {
    if (!userEmail) {
      window.location.href = "/login";
      return;
    }

    if (selectedSeries) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      try {
        const response = await axios.post(
          `${API_BASE_URL}/notifications`,
          {
            channel_id: Number(selectedSeries.channel_id),
            title: selectedSeries.title,
            notify_before: 1,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
          }
        );

        if (response.status === 201) {
          alert("Notifikace přidána!");
          setSelectedSeries(null);
        }
      } catch (error) {
        console.error("Error recording notification:", error);
        alert("Nepodařila se přidat notifikace zkuste to prosím později.");
      }
    }
  };

  // Debugging grouped series
  const groupedSeries = series.reduce<Record<string, SeriesItem[]>>((acc, item) => {
    const channelKey = item.channel_id.toString(); // Ensure the key is a string
    if (!acc[channelKey]) acc[channelKey] = [];
    acc[channelKey].push(item);
    return acc;
  }, {});

  console.log("Grouped Series:", groupedSeries);
  console.log("Channels Object:", channels);

  const sortedChannels = Object.keys(groupedSeries).sort();
  console.log("Sorted Channels:", sortedChannels);

  return (
    <div className="relative p-4 max-w-7xl mx-auto">
      <div className="fixed top-2 right-4 text-sm space-x-4 flex items-center">
  {userEmail ? (
    <>
      <a href="/notifications" className="text-blue-500 hover:underline">
        Moje nahrávky
      </a>
      <span>Přihlášen jako: {userEmail}</span>
      <button
        className="text-red-500 hover:underline"
        onClick={async () => {
          await supabase.auth.signOut();
          setUserEmail(undefined);
        }}
      >
        Odhlásit se
      </button>
    </>
  ) : (
    <a href="/login" className="text-blue-500 underline">
      Přihlásit se
    </a>
  )}
</div>

      <div className="container mx-auto mt-4">
        <h1 className="text-2xl text-center font-bold mb-6">Datum</h1>
        <div className="flex justify-center mb-6">
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => date && setDate(date)}
            className="form-control border rounded p-2"
          />
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {sortedChannels.map((channelId) => (
            <div
              key={channelId}
              className="flex-shrink-0 bg-gray-100 border rounded p-4 w-64"
            >
              <div className="flex items-center mb-4">
                {channels[channelId]?.logo ? (
                  <img
                    src={channels[channelId].logo}
                    alt={channels[channelId].channel_name}
                    className="w-auto h-12 mx-auto object-contain"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                ) : (
                  <span className="text-lg font-semibold">{channels[channelId]?.display_name || channelId}</span>
                )}
              </div>
              <ul>
                {groupedSeries[channelId]?.map((item) => (
                      <li
                      key={item.id}
                      className="mb-4 cursor-pointer"
                      onClick={() => setSelectedSeries(item)}
                    >
                      <div className="text-sm text-gray-600 mb-1">
                        {new Date(item.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </div>
                      <h5 className="font-semibold text-blue-600 mb-1">
                        {item.title}
                      </h5>
                      <p className="text-sm text-gray-700">
                        {item.desc
                          ? item.desc.split(" ").slice(0, 20).join(" ") + (item.desc.split(" ").length > 20 ? " ..." : "")
                          : ""}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {selectedSeries && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      className="bg-white p-6 rounded shadow-lg w-96 relative"
      onClick={(e) => e.stopPropagation()}
    >
     
      <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
        {selectedSeries.title}
        <button
          className="ml-2 text-red-500 hover:text-red-700"
          onClick={() => setSelectedSeries(null)}
        >
          ❌
        </button>
      </h2>
      <p className="mb-2">
        <strong>Kanál:</strong> {channels[selectedSeries.channel_id]?.channel_name}
      </p>
      <p className="mb-2">
        <strong>Popis pořadu:</strong> {selectedSeries.desc}
      </p>
      <p className="mb-2">
        <strong>Začátek:</strong> {new Date(selectedSeries.start).toLocaleString("cs-CZ")}
      </p>
      <p className="mb-2">
        <strong>Konec:</strong> {new Date(selectedSeries.end).toLocaleString("cs-CZ")}
      </p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        onClick={handleRecordShow}
      >
        Nastavit upozorňění
      </button>
    </div>
  </div>
)}
    </div>
  );
}