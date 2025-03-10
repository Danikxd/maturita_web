"use client";

import React, {useState, useEffect} from "react";
import { login, signUp } from "./actions";

export default function LoginPage() {

  const [signupSuccess, setSignupSuccess] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("signupSuccess") === "true") {
        setSignupSuccess(true);
        alert("Registration successful! Please check your email to confirm your account before logging in.");
      }
    }
  }, []);


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome</h2>


       
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            formAction={login}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Log in
          </button>

          <button
            type="submit"
            formAction={signUp}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
