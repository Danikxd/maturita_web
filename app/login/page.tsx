"use client";

import React from "react";
import { login  } from "../../actions";


export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96" onSubmit={async (e) => { e.preventDefault(); await login(new FormData(e.currentTarget)); }}>
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        

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

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Log in
        </button>
      </form>
    </div>
  );
}