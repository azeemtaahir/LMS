import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
    try {
      const response = await api.post("/librarians", librarianData);
      const created = response.data?.librarian || response.data;
      await fetchLibrarians();
      return created;
    } catch (err) {
      console.error("Error registering librarian in database:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error registering librarian";
      throw new Error(errorMessage);
    }
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
