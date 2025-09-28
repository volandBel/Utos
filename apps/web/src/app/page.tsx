"use client";

import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchProjects = async () => {
      const resp = await fetch("http://localhost:3000/api/v1/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setProjects(data.data || []);
      }
    };

    fetchProjects();
  }, [token]);

  const handleCreate = async () => {
    setError(null);
    if (!name.trim()) return;

    try {
      const resp = await fetch("http://localhost:3000/api/v1/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!resp.ok) {
        setError("Ошибка при создании проекта");
        return;
      }

      const data = await resp.json();
      setProjects([...projects, data]);
      setName("");
    } catch {
      setError("Ошибка сети");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-black">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Мои проекты</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Выйти
        </button>
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название проекта"
          className="flex-1 p-2 rounded border"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Создать
        </button>
      </div>

      <ul>
        {projects.map((p) => (
          <li key={p.id} className="border-b border-gray-300 py-2">
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
