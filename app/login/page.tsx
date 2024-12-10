"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Typy pro stav komponenty
type AuthMessage = {
  type: "success" | "error";
  text: string;
};

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Získání informace o přihlášeném uživateli
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
      //  console.error("Error fetching user:", error.message);
      } else {
        setUserEmail(user?.email || null);
      }
    };

    fetchUser();
  }, []);

  const handleRegister = async () => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Registration successful! Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Unknown error occurred." });
    }
  };

  const handleLogin = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Login successful!" });
        setUserEmail(user?.email || null); // Nastav aktuální e-mail
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Unknown error occurred." });
    }
  };

  return (
    <div style={{ position: "relative", padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      {/* Email uživatele v pravém horním rohu */}
      <div style={{ position: "fixed", top: "10px", right: "10px", fontSize: "14px" }}>
        {userEmail ? `Logged in as: ${userEmail}` : "Not logged in"}
      </div>

      <h1>Login / Register</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
      />
      <button onClick={handleRegister} style={{ marginRight: "10px", padding: "8px 16px" }}>
        Register
      </button>
      <button onClick={handleLogin} style={{ padding: "8px 16px" }}>
        Login
      </button>
      {message && (
        <p
          style={{
            marginTop: "20px",
            color: message.type === "success" ? "green" : "red",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}