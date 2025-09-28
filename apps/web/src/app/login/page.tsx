"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("qa@example.com");
  const [password, setPassword] = useState("StrongPass123");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      const resp = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        setError("Ошибка авторизации");
        return;
      }

      const data = await resp.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch {
      setError("Ошибка сети");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <h1 className="text-2xl font-bold mb-4">Вход</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mb-2 p-2 rounded border w-64"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        className="mb-4 p-2 rounded border w-64"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Войти
      </button>
    </div>
  );
}
