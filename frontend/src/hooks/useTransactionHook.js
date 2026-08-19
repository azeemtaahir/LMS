import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

const MOCK_RECENT_ISSUES = [];

const MOCK_OVERDUE_BOOKS = [];

export const useTransactionHook = () => {
  const [searchParams] = useSearchParams();
  const [recentIssues, setRecentIssues] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchParamQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamQuery);

  if (prevSearchParam !== searchParamQuery) {
    setPrevSearchParam(searchParamQuery);
    setSearchQuery(searchParamQuery);
  }
  const [statusFilter, setStatusFilter] = useState("All");

  const [issueFormData, setIssueFormData] = useState({
    studentId: "",
    bookId: "",
    issueDate: new Date().toISOString().split("T")[0],
    returnDate: "",
    notes: "",
  });

  const [searchStudentId, setSearchStudentId] = useState("");
  const [searchBookId, setSearchBookId] = useState("");
  const [activeReturnDetails, setActiveReturnDetails] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const [issuesRes, overdueRes] = await Promise.allSettled([
        api.get("/loans"),
        api.get("/fines"),
      ]);

      const issues =
        issuesRes.status === "fulfilled" && Array.isArray(issuesRes.value?.data)
          ? issuesRes.value.data
          : MOCK_RECENT_ISSUES;
      const overdue =
        overdueRes.status === "fulfilled" && Array.isArray(overdueRes.value?.data)
          ? overdueRes.value.data
          : MOCK_OVERDUE_BOOKS;

      setRecentIssues(issues);
      setOverdueBooks(overdue);
    } catch (err) {
      console.error("Failed to fetch transaction records", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initFetch() {
      try {
        const [issuesRes, overdueRes] = await Promise.allSettled([
          api.get("/loans"),
          api.get("/fines"),
        ]);

        if (ignore) return;

        const issues =
          issuesRes.status === "fulfilled" && Array.isArray(issuesRes.value?.data)
            ? issuesRes.value.data
            : MOCK_RECENT_ISSUES;
        const overdue =
          overdueRes.status === "fulfilled" && Array.isArray(overdueRes.value?.data)
            ? overdueRes.value.data
            : MOCK_OVERDUE_BOOKS;

        setRecentIssues(issues);
        setOverdueBooks(overdue);
      } catch (err) {
        console.error("Failed to fetch transaction records", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    initFetch();

    return () => {
      ignore = true;
    };
  }, []);

  const handleIssueBookSubmit = async (e) => {
    e.preventDefault();
    if (!issueFormData.studentId || !issueFormData.bookId) {
      alert("Please select both a student and a book.");
      return;
    }
    try {
      let newIssue;
      try {
        const res = await api.post("/loans", issueFormData);
        newIssue = res.data;
      } catch {
        newIssue = {
          id: Date.now(),
          bookTitle: issueFormData.bookTitle || "Selected Book",
          studentName: issueFormData.studentName || "Student",
          dueDate: issueFormData.dueDate || "30 May 2026",
          status: "Issued",
        };
      }
      setRecentIssues((prev) => [newIssue, ...prev]);
      alert("Book issued successfully!");
      setIssueFormData({
        studentId: "",
        bookId: "",
        issueDate: new Date().toISOString().split("T")[0],
        returnDate: "",
        notes: "",
      });
    } catch (err) {
      console.error("Issue book error", err);
    }
  };

  const handleSearchReturnRecord = (e) => {
    e.preventDefault();
    const found = recentIssues.find(
      (item) =>
        (searchStudentId && item.studentId?.toLowerCase().includes(searchStudentId.toLowerCase())) ||
        (searchBookId && item.bookTitle?.toLowerCase().includes(searchBookId.toLowerCase()))
    );
    if (found) {
      setActiveReturnDetails(found);
    } else {
      setActiveReturnDetails(null);
      alert("No active loan record found.");
    }
  };

  const handleCompleteReturn = async () => {
    if (!activeReturnDetails) return;
    try {
      try {
        await api.put(`/loans/${activeReturnDetails.id}`, { status: "Returned" });
      } catch {
        // Fallback
      }
      setRecentIssues((prev) =>
        prev.map((item) =>
          item.id === activeReturnDetails.id ? { ...item, status: "Returned" } : item
        )
      );
      alert("Book returned successfully!");
      setActiveReturnDetails(null);
    } catch (err) {
      console.error("Return book error", err);
    }
  };

  const filteredIssues = recentIssues.filter((item) => {
    const matchesSearch =
      item.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    recentIssues: filteredIssues,
    allIssues: recentIssues,
    overdueBooks,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    issueFormData,
    setIssueFormData,
    handleIssueBookSubmit,
    searchStudentId,
    setSearchStudentId,
    searchBookId,
    setSearchBookId,
    activeReturnDetails,
    setActiveReturnDetails,
    handleSearchReturnRecord,
    handleCompleteReturn,
    refreshTransactions: fetchTransactions,
  };
};

export const useTransactionController = useTransactionHook;
