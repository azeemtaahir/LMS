import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

const MOCK_LIBRARIANS = [];

export const useLibrarianHook = () => {
  const [searchParams] = useSearchParams();
  const [librarians, setLibrarians] = useState([]);
  const searchParamQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamQuery);

  if (prevSearchParam !== searchParamQuery) {
    setPrevSearchParam(searchParamQuery);
    setSearchQuery(searchParamQuery);
  }
  const [selectedShift, setSelectedShift] = useState("All");
  const [loading, setLoading] = useState(false);

  const fetchLibrarians = async () => {
    setLoading(true);
    try {
      const response = await api.get("/librarians");
      if (Array.isArray(response.data)) {
        setLibrarians(response.data);
      }
    } catch {
      setLibrarians(MOCK_LIBRARIANS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function initFetch() {
      try {
        const response = await api.get("/librarians");
        if (ignore) return;
        if (Array.isArray(response.data)) {
          setLibrarians(response.data);
        }
      } catch {
        if (!ignore) setLibrarians(MOCK_LIBRARIANS);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    initFetch();

    return () => {
      ignore = true;
    };
  }, []);

  const handleAddLibrarian = async (librarianData) => {
    // 1. Create authentication login credentials in backend / local storage
    const email = librarianData.email;
    const password = librarianData.password;
    const name = librarianData.fullName || librarianData.name;

    try {
      await api.post("/auth/signup", {
        email,
        password,
        name,
        role: "librarian",
      });
    } catch (err) {
      console.warn("Librarian auth signup info:", err?.response?.data?.message || err.message);
    }

    try {
      const response = await api.post("/librarians", librarianData);
      setLibrarians((prev) => [...prev, response.data]);
    } catch {
      const newLibrarian = {
        id: Date.now(),
        ...librarianData,
        name,
        status: "Active"
      };
      setLibrarians((prev) => [...prev, newLibrarian]);
    }

    // Save to registered_users in local storage for local testing fallback
    const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const updatedUsers = registeredUsers.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
    updatedUsers.push({
      email,
      password,
      name,
      role: "Librarian",
      studentId: librarianData.librarianId || "LIB-101",
      status: "Active",
    });
    localStorage.setItem("registered_users", JSON.stringify(updatedUsers));
  };

  const handleDeleteLibrarian = (id) => {
    if (window.confirm("Are you sure you want to remove this librarian?")) {
      setLibrarians((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleUpdateLibrarian = async (id, updatedData) => {
    try {
      await api.put(`/librarians/${id}`, updatedData);
    } catch (err) {
      console.warn("Librarian update local fallback:", err?.message);
    }
    setLibrarians((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedData } : l))
    );
  };

  const filteredLibrarians = librarians.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.librarianId && l.librarianId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = selectedShift === "All" || l.shift === selectedShift;
    return matchesSearch && matchesShift;
  });

  return {
    librarians: filteredLibrarians,
    allLibrarians: librarians,
    searchQuery,
    setSearchQuery,
    selectedShift,
    setSelectedShift,
    loading,
    handleAddLibrarian,
    handleUpdateLibrarian,
    handleDeleteLibrarian,
    refreshLibrarians: fetchLibrarians,
  };
};

export const useLibrarianController = useLibrarianHook;
