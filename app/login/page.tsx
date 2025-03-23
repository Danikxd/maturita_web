'use client';

import React, { useEffect, useState } from 'react';
import { login } from '../../actions';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  invalid_email: 'Zadejte platnou e-mailovou adresu.',
  invalid_password_format: 'Heslo musí obsahovat alespoň 6 znaků.',
  invalid_credentials: 'Nesprávné přihlašovací údaje.',
  email_not_confirmed: 'E-mail není potvrzený. Zkontrolujte prosím svoji e-mailovou schránku.',
  unexpected_error: 'Nastala neočekávaná chyba. Zkuste to prosím později.',
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('signupSuccess') === 'true') {
      alert('Registrace úspěšná! Nyní se můžete přihlásit.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    if (result?.error) {
      setError(errorMessages[result.error] || errorMessages.unexpected_error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Přihlášení</h2>

        {error && (
          <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
        )}

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
            Heslo:
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
          Přihlásit se
        </button>
      </form>

      <p className="text-sm text-gray-600">
        Nemáte účet?{' '}
        <Link
          href="/register"
          className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 transition duration-150"
        >
          Zaregistrujte se
        </Link>
      </p>
    </div>
  );
}