"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


import { createClient } from "../utils/supabase/client";

interface SeriesItem {
  id: string;
  channel_name: string;
  title: string;
  desc: string;
  start: string;
  end: string;
  channel_id: string;
}



export default function SeriesPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
 

  // Modal state
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);

  const supabase = createClient();

  const fetchSeries = useCallback(async (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    try {
      const response = await axios.get<SeriesItem[]>(
        `http://localhost:3030/series/${formattedDate}`
      );
      setSeries(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchSeries(date);
  }, [date, fetchSeries]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
  
      if (error) {
        console.error("Error fetching user:", error.message);
        setUserEmail(undefined);
        
      } else {
        setUserEmail(user?.email || undefined);
        
        console.log("User ID:", user?.id);
      }
    };
  
    fetchUser();
  
    // Listen for auth state changes to keep session updated
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
          "http://localhost:3030/notifications",
          {
        
            channel_id: Number(selectedSeries.channel_id),
            title: selectedSeries.title,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token}`,
            },
          }
        );

        if (response.status === 201) {
          alert("Show successfully recorded!");
          setSelectedSeries(null);
        }
      } catch (error) {
        console.error("Error recording show:", error);
        alert("Failed to record the show. Please try again.");
      } 
    }
  };

  const groupedSeries = series.reduce<Record<string, SeriesItem[]>>(
    (acc, item) => {
      const channel = item.channel_name || "Unknown Channel";
      if (!acc[channel]) acc[channel] = [];
      acc[channel].push(item);
      return acc;
    },
    {}
  );

  const sortedChannels = Object.keys(groupedSeries).sort();
  sortedChannels.forEach((channel) => {
    groupedSeries[channel].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  });

  return (
    <div className="relative p-4 max-w-7xl mx-auto">
      <div className="fixed top-2 right-4 text-sm">
        {userEmail ? (
         <>
           <a href="/notifications" className="text-blue-500 hover:underline">My Recordings</a>
           <span>Logged in as: {userEmail}</span>
         </>
        ) : (
          <a href="/login" className="text-blue-500 underline">
            Login
          </a>
        )}
      </div>

      <div className="container mx-auto mt-4">
        <h1 className="text-2xl text-center font-bold mb-6">TV Series by Date</h1>
        <div className="flex justify-center mb-6">
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => date && setDate(date)}
            className="form-control border rounded p-2"
          />
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {sortedChannels.map((channel) => (
            <div
              key={channel}
              className="flex-shrink-0 bg-gray-100 border rounded p-4 w-64"
            >
              <h2 className="text-lg font-semibold text-blue-600 mb-2">{channel}</h2>
              <ul>
                {groupedSeries[channel].map((item) => (
                  <li key={item.id} className="mb-4">
                    <h5
                      className="font-bold cursor-pointer text-blue-500"
                      onClick={() => setSelectedSeries(item)}
                    >
                      {item.title}
                    </h5>
                    <p className="text-sm text-gray-600 mb-1">
                      {item.desc
                        ? item.desc.split(" ").slice(0, 13).join(" ") +
                          (item.desc.split(" ").length > 13 ? " ..." : "")
                        : <em>No description available</em>}
                    </p>
                    <p className="text-sm">
                      <strong>Start:</strong> {new Date(item.start).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <strong>End:</strong> {new Date(item.end).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedSeries && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedSeries(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600"
              onClick={() => setSelectedSeries(null)}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedSeries.title}</h2>
            <p className="mb-2">
              <strong>Channel:</strong> {selectedSeries.channel_name}
            </p>
            <p className="mb-2">
              <strong>Description:</strong> {selectedSeries.desc}
            </p>
            <p className="mb-2">
              <strong>Start:</strong> {new Date(selectedSeries.start).toLocaleString()}
            </p>
            <p className="mb-2">
              <strong>End:</strong> {new Date(selectedSeries.end).toLocaleString()}
            </p>

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
              onClick={handleRecordShow}
            >
              Record Show
            </button>
            <span className="ml-2 text-yellow-500">
              <i className="fas fa-star"></i> {/* For Font Awesome */}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}