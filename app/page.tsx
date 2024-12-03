"use client"

import { useState, useEffect, useCallback, use } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css"; 
import { createClient } from "@supabase/supabase-js";

interface SeriesItem {
  id: string;
  channel_name: string;
  title: string;
  desc: string;
  start: string;
  end: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function SeriesPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUserEmail(user?.email || null);
      }
    };

    fetchUser();
  }, []);






  const groupedSeries = series.reduce<Record<string, SeriesItem[]>>(
    (acc, item) => {
      const channel = item.channel_name || "Unknown Channel";
      if (!acc[channel]) acc[channel] = [];
      acc[channel].push(item);
      console.log(acc);
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

    <div style={{ position: "relative", padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      {/* Email uživatele v pravém horním rohu */}
      <div style={{ position: "fixed", top: "10px", right: "10px", fontSize: "14px" }}>
      {userEmail ? `Logged in as: ${userEmail}` : <a href="/login" style={{ marginLeft: "10px", textDecoration: "underline" }}>
          Login
        </a>}
     
      </div>

    <div className="container mt-4">
      <h1 className="text-center mb-4">TV Series by Date</h1>
      <div className="d-flex justify-content-center mb-3">
        <DatePicker
          selected={date}
          onChange={(date: Date | null) => date && setDate(date)}
          className="form-control w-auto"
        />
      </div>

      <div
        className="d-flex overflow-auto"
        style={{
          whiteSpace: "nowrap",
          gap: "20px",
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        {sortedChannels.map((channel) => (
          <div
            key={channel}
            className="flex-shrink-0 bg-light border rounded p-3"
            style={{
              minWidth: "250px",
              maxWidth: "300px",
            }}
          >
            <h2 className="text-primary">{channel}</h2>
            <ul className="list-unstyled">
              {groupedSeries[channel].map((item) => (
                <li key={item.id} className="mb-3">
                  <h5>{item.title}</h5>
                  <p className="mb-1 truncated-description" title={item.desc}>
                    {item.desc || <em>No description available</em>}
                  </p>
                  <p className="mb-0">
                    <strong>Start:</strong>{" "}
                    {new Date(item.start).toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(item.end).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}