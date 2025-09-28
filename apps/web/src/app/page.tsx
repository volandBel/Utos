"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("qa@example.com");
  const [password, setPassword] = useState("StrongPass123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка: ${res.status}`);
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      alert("Успешный логин! Токен сохранён в localStorage.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h1 className="text-xl font-bold mb-4">Вход</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full mb-3 p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Входим..." : "Войти"}
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
}
