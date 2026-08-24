import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

const getTodayStr = () => new Date().toISOString().split("T")[0];

const get7DaysLaterStr = (baseDateStr) => {
  const d = baseDateStr ? new Date(baseDateStr) : new Date();
  if (isNaN(d.getTime())) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
};

export const useTransactionHook = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "All";

  const [recentIssues, setRecentIssues] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const initialToday = getTodayStr();
  const [issueFormData, setIssueFormData] = useState({
    studentId: "",
    bookId: "",
    issueDate: initialToday,
    returnDate: get7DaysLaterStr(initialToday),
    notes: "",
  });

  const [searchStudentId, setSearchStudentId] = useState("");
  const [searchBookId, setSearchBookId] = useState("");
  const [activeReturnDetails, setActiveReturnDetails] = useState(null);

  const setSearchQuery = useCallback((query) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (query) next.set("search", query);
      else next.delete("search");
      return next;
    });
  }, [setSearchParams]);

  const setStatusFilter = useCallback((status) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (status && status !== "All") next.set("status", status);
      else next.delete("status");
      return next;
    });
  }, [setSearchParams]);

  const computeLoanFine = (loan) => {
    const isPaid = loan.fineStatus === "Paid" || loan.fine_status === "Paid";
    if (loan.status === "Returned" || isPaid) {
      return { fineAmount: 0, status: "Returned", overdueDays: 0, overdueWeeks: 0, fineStatus: isPaid ? "Paid" : "Unpaid" };
    }

    const issueDateStr = loan.issueDate || loan.loan_date;
    const dueDateStr = loan.dueDate || loan.due_date || loan.returnDate;
    const returnedDateStr = loan.returned_date || loan.actualReturnedDate;

    const dueDate = dueDateStr ? new Date(dueDateStr) : (issueDateStr ? new Date(new Date(issueDateStr).getTime() + 14 * 24 * 3600 * 1000) : null);
    if (!dueDate || isNaN(dueDate.getTime())) {
      return { 
        fineAmount: isPaid ? 0 : (Number(loan.fineAmount) || 0), 
        status: (loan.status === "Returned" || isPaid) ? "Returned" : (loan.status || "Issued"), 
        overdueDays: 0, 
        overdueWeeks: 0,
        fineStatus: isPaid ? "Paid" : (loan.fineStatus || loan.fine_status || "Unpaid")
      };
    }

    const endDate = returnedDateStr ? new Date(returnedDateStr) : new Date();
    const diffMs = endDate.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { 
        fineAmount: 0, 
        status: (loan.status === "Returned" || isPaid) ? "Returned" : (loan.status || "Issued"), 
        overdueDays: 0, 
        overdueWeeks: 0,
        fineStatus: isPaid ? "Paid" : "Unpaid"
      };
    }

    const overdueWeeks = Math.ceil(diffDays / 7);
    const fineAmount = isPaid ? 0 : overdueWeeks * 500; // 500 PKR per week
    const status = (loan.status === "Returned" || isPaid) ? "Returned" : "Overdue";

    return { 
      fineAmount, 
      status, 
      overdueDays: diffDays, 
      overdueWeeks,
      fineStatus: isPaid ? "Paid" : (loan.fineStatus || loan.fine_status || "Unpaid")
    };
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const [issuesRes, overdueRes] = await Promise.allSettled([
        api.get("/loans"),
        api.get("/fines"),
      ]);

      const rawIssues =
        issuesRes.status === "fulfilled" && Array.isArray(issuesRes.value?.data)
          ? issuesRes.value.data
          : [];

      if (issuesRes.status === "fulfilled" && Array.isArray(issuesRes.value?.data)) {
        localStorage.removeItem("library_loans");
      }

      const rawOverdue =
        overdueRes.status === "fulfilled" && Array.isArray(overdueRes.value?.data)
          ? overdueRes.value.data
          : [];

      const processedIssues = rawIssues.map((item) => {
        const { fineAmount, status, overdueDays, overdueWeeks, fineStatus } = computeLoanFine(item);
        return {
          ...item,
          status,
          fineAmount: Number(item.fineAmount) || fineAmount,
          overdueDays,
          overdueWeeks,
          fineStatus: item.fineStatus || item.fine_status || fineStatus,
          fine_status: item.fine_status || item.fineStatus || fineStatus,
        };
      });

      setRecentIssues(processedIssues);
      setOverdueBooks(rawOverdue);
    } catch (err) {
      console.error("Failed to fetch transaction records", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initFetch = async () => {
      if (isMounted) {
        await fetchTransactions();
      }
    };
    initFetch();
    return () => {
      isMounted = false;
    };
  }, [fetchTransactions]);

  const handleIssueBookSubmit = async (e, selectedStudent, selectedBook) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (!issueFormData.studentId || !issueFormData.bookId) {
      alert("Please select both a borrower user and a book.");
      return false;
    }

    if (selectedBook && Number(selectedBook.availableCopies) <= 0) {
      alert(`Book "${selectedBook.title || 'Selected Book'}" is not available (0 copies in stock). Cannot issue book.`);
      return false;
    }

    const dbMemberId = selectedStudent?.db_id || selectedStudent?.id;
    const numericMemberId = Number(dbMemberId);
    const numericBookId = Number(selectedBook?.id || issueFormData.bookId);
    const studentNameVal =
      selectedStudent?.name ||
      `${selectedStudent?.first_name || ""} ${selectedStudent?.last_name || ""}`.trim() ||
      "Student";
    const bookTitleVal = selectedBook?.title || "Selected Book";
    const studentIdVal = selectedStudent?.studentId || selectedStudent?.id || issueFormData.studentId;

    const payload = {
      book_id: isNaN(numericBookId) ? issueFormData.bookId : numericBookId,
      bookId: isNaN(numericBookId) ? issueFormData.bookId : numericBookId,
      member_id: isNaN(numericMemberId) ? dbMemberId : numericMemberId,
      studentId: studentIdVal,
      studentName: studentNameVal,
      bookTitle: bookTitleVal,
      issueDate: issueFormData.issueDate,
      returnDate: issueFormData.returnDate,
      dueDate: issueFormData.returnDate,
      notes: issueFormData.notes,
      status: "Issued",
    };

    try {
      await api.post("/loans", payload);
      await fetchTransactions();
      window.dispatchEvent(new Event("book-updated"));
      alert("Book issued successfully!");
      const freshToday = getTodayStr();
      setIssueFormData({
        studentId: "",
        bookId: "",
        issueDate: freshToday,
        returnDate: get7DaysLaterStr(freshToday),
        notes: "",
      });
      return true;
    } catch (err) {
      console.error("API POST /loans failed:", err?.response?.data || err?.message);
      const errMsg = err?.response?.data?.message || err?.message || "Book not available or issue failed.";
      alert(errMsg);
      return false;
    }
  };

  const handleSearchReturnRecord = (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (!searchStudentId && !searchBookId) {
      alert("Please enter a Student ID or Book ID to search.");
      return;
    }
    const found = recentIssues.find(
      (item) =>
        (searchStudentId && (
          String(item.studentId || "").toLowerCase().includes(searchStudentId.toLowerCase()) ||
          String(item.member_id || "").toLowerCase().includes(searchStudentId.toLowerCase()) ||
          String(item.studentName || "").toLowerCase().includes(searchStudentId.toLowerCase())
        )) ||
        (searchBookId && (
          String(item.bookTitle || "").toLowerCase().includes(searchBookId.toLowerCase()) ||
          String(item.book_id || "").toLowerCase().includes(searchBookId.toLowerCase()) ||
          String(item.id || "").toLowerCase().includes(searchBookId.toLowerCase())
        ))
    );

    if (found) {
      const computed = computeLoanFine(found);
      setActiveReturnDetails({
        ...found,
        ...computed,
      });
    } else {
      setActiveReturnDetails(null);
      alert("No matching active loan record found.");
    }
  };

  const handleCompleteReturn = async () => {
    if (!activeReturnDetails) return;
    try {
      const todayStr = getTodayStr();
      try {
        await api.put(`/loans/${activeReturnDetails.id}/return`, { status: "Returned" });
      } catch (err) {
        console.warn("API PUT /loans/:id/return fallback:", err?.message);
      }
      setRecentIssues((prev) =>
        prev.map((item) =>
          item.id === activeReturnDetails.id ? { ...item, status: "Returned", returned_date: todayStr } : item
        )
      );

      await fetchTransactions();
      window.dispatchEvent(new Event("book-updated"));
      alert("Book returned successfully!");
      setActiveReturnDetails(null);
    } catch (err) {
      console.error("Return book error", err);
    }
  };

  const handleReturnLoanDirect = async (loanItem) => {
    if (!loanItem) return;
    try {
      const todayStr = getTodayStr();
      try {
        await api.put(`/loans/${loanItem.id}/return`, { status: "Returned" });
      } catch (err) {
        console.warn("API PUT /loans/:id/return fallback:", err?.message);
      }
      setRecentIssues((prev) =>
        prev.map((item) =>
          item.id === loanItem.id ? { ...item, status: "Returned", returned_date: todayStr } : item
        )
      );

      await fetchTransactions();
      window.dispatchEvent(new Event("book-updated"));
      alert(`Book "${loanItem.bookTitle || "Book"}" returned successfully!`);
    } catch (err) {
      console.error("Return loan error", err);
    }
  };

  const handlePayFine = async (loanItem) => {
    if (!loanItem) return;
    try {
      const fineAmount = loanItem.fineAmount || 500;
      const targetLoanId = loanItem.loan_id || loanItem.id;
      const targetMemberId = loanItem.member_id || loanItem.memberId || loanItem.studentId;

      try {
        await api.post("/fines/pay", {
          member_id: targetMemberId,
          loan_id: targetLoanId,
          fine_id: loanItem.fine_id || targetLoanId,
          payment_amount: fineAmount,
        });
      } catch (err) {
        console.warn("API POST /fines/pay fallback:", err?.message);
      }

      const todayStr = getTodayStr();

      setRecentIssues((prev) =>
        prev.map((item) =>
          item.id === loanItem.id || item.id === targetLoanId
            ? {
                ...item,
                status: "Returned",
                returned_date: todayStr,
                fineStatus: "Paid",
                fine_status: "Paid",
                fineAmount: 0,
              }
            : item
        )
      );

      await fetchTransactions();
      window.dispatchEvent(new Event("book-updated"));
      alert(`Fine of ${fineAmount} PKR marked as Paid for "${loanItem.studentName || "Member"}"! Issued book status updated to Returned.`);
    } catch (err) {
      console.error("Pay fine error", err);
    }
  };

  const filteredIssues = useMemo(() => {
    return recentIssues.filter((item) => {
      const matchesSearch =
        item.studentName?.toLowerCase().includes(searchParamQuery.toLowerCase()) ||
        item.bookTitle?.toLowerCase().includes(searchParamQuery.toLowerCase());
      const matchesStatus = statusParam === "All" || item.status === statusParam;
      return matchesSearch && matchesStatus;
    });
  }, [recentIssues, searchParamQuery, statusParam]);

  return {
    recentIssues: filteredIssues,
    allIssues: recentIssues,
    overdueBooks,
    loading,
    searchQuery: searchParamQuery,
    setSearchQuery,
    statusFilter: statusParam,
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
    handleReturnLoanDirect,
    handlePayFine,
    refreshTransactions: fetchTransactions,
  };
};

export const useTransactionController = useTransactionHook;