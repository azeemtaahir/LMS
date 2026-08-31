import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/api";

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
  const statusParam = searchParams.get("status") || "All";
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [prevStatusParam, setPrevStatusParam] = useState(statusParam);

  if (prevStatusParam !== statusParam) {
    setPrevStatusParam(statusParam);
    setSelectedStatus(statusParam);
  }
  const [selectedShift, setSelectedShift] = useState("All");
  const [loading, setLoading] = useState(false);

  const fetchLibrarians = async () => {
    setLoading(true);
    try {
      const response = await api.get("/librarians");
      if (Array.isArray(response.data)) {
        setLibrarians(response.data);
      } else {
        setLibrarians([]);
      }
    } catch (err) {
      console.error("Error fetching librarians from database:", err);
      setLibrarians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function initFetch() {
      setLoading(true);
      try {
        const response = await api.get("/librarians");
        if (ignore) return;
        if (Array.isArray(response.data)) {
          setLibrarians(response.data);
        } else {
          setLibrarians([]);
        }
      } catch (err) {
        console.error("Error fetching librarians from database:", err);
        if (!ignore) setLibrarians([]);
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
    const email = librarianData.email || "";
    const password = librarianData.password || "librarian123";
    const name = librarianData.fullName || librarianData.name || email.split("@")[0] || "Librarian";
    const librarianId = librarianData.librarianId || `LIB-${Date.now().toString().slice(-4)}`;

    const payload = {
      id: Date.now(),
      librarianId,
      user_id: librarianId,
      studentId: librarianId,
      name,
      fullName: name,
      email,
      password,
      role: "Librarian",
      status: librarianData.status || "active",
      joinedDate: new Date().toISOString().split("T")[0],
    };

    // Check if librarian with same Email or ID already exists
    const isDuplicate = librarians.some((l) => {
      const lEmail = String(l.email || "").toLowerCase().trim();
      const inputEmail = String(email || "").toLowerCase().trim();
      const lId = String(l.id || l.librarianId || l.user_id || "").toLowerCase().trim();
      const inputId = String(librarianId || "").toLowerCase().trim();
      return (inputEmail && lEmail === inputEmail) || (inputId && lId === inputId);
    });

    if (isDuplicate) {
      toast.warning("⚠️ User is already generated / registered with this email or Librarian ID!");
      return null;
    }

    let created;
    try {
      const response = await api.post("/librarians", librarianData);
      created = response.data?.librarian || response.data || payload;
      await fetchLibrarians();
    } catch (err) {
      console.warn("Backend API POST /librarians fallback:", err?.message);
      created = payload;
      setLibrarians((prev) => [...prev, created]);
    }

    // Persist to registered_users in localStorage so librarian can log in
    const existingRegistered = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const updatedRegistered = [...existingRegistered.filter((u) => u.email !== payload.email), payload];
    localStorage.setItem("registered_users", JSON.stringify(updatedRegistered));

    return created;
  };

  const handleDeleteLibrarian = async (id) => {
    if (window.confirm("Are you sure you want to remove this librarian?")) {
      try {
        await api.delete(`/librarians/${id}`);
      } catch (err) {
        console.warn("Librarian delete fallback:", err?.message);
      }
      setLibrarians((prev) => prev.filter((l) => l.id !== id && l.librarianId !== id));
    }
  };

  const handleUpdateLibrarian = async (id, updatedData) => {
    const targetId = id || updatedData.id || updatedData.librarianId;

    // Update local state instantly
    setLibrarians((prev) =>
      prev.map((l) =>
        l.id === targetId || l.librarianId === targetId || (updatedData.email && l.email?.toLowerCase() === updatedData.email.toLowerCase())
          ? { ...l, ...updatedData }
          : l
      )
    );

    // Sync localStorage registered_users
    const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const updatedRegistered = registeredUsers.map((u) =>
      u.id === targetId || u.librarianId === targetId || u.user_id === targetId || (updatedData.email && u.email?.toLowerCase() === updatedData.email.toLowerCase())
        ? { ...u, ...updatedData }
        : u
    );
    localStorage.setItem("registered_users", JSON.stringify(updatedRegistered));

    try {
      await api.put(`/librarians/${targetId}`, updatedData);
    } catch (err) {
      console.warn("Librarian update API warning:", err?.message);
    }
  };

  const filteredLibrarians = librarians.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.librarianId && l.librarianId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" ||
      (l.status || "Active").toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
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
