import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

const MOCK_USERS = [];

const MOCK_RECENT_ISSUES = [];

const MOCK_OVERDUE_BOOKS = [];

const validateUserInput = (data) => {
  const errors = {};
  if (!data.name || !data.name.trim()) {
    errors.name = "Full name is required";
  }
  if (!data.studentId || !data.studentId.trim()) {
    errors.studentId = data.role === "Teacher" ? "Teacher / Employee ID is required" : "Student ID is required";
  }
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "Valid email is required";
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const useMemberHook = () => {
  const [searchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";
  const roleParam = searchParams.get("role") || "All";

  const [stats, setStats] = useState({
    totalBooks: 0,
    registeredStudents: 0,
    registeredUsers: 0,
    totalLibrarians: 0,
    booksIssued: 0,
    overdueBooks: 0,
    pendingFines: 0,
    categories: 0,
  });

  const [recentIssues, setRecentIssues] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamQuery);
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedRole, setSelectedRole] = useState(roleParam);
  const [prevRoleParam, setPrevRoleParam] = useState(roleParam);
  const [loading, setLoading] = useState(false);

  const [activeModal, setActiveModal] = useState(null);

  const [studentFormData, setStudentFormData] = useState({ name: "", studentId: "", email: "", department: "CS", role: "Student", designation: "", semester: "Semester 1" });
  const [studentErrors, setStudentErrors] = useState({});

  if (prevSearchParam !== searchParamQuery) {
    setPrevSearchParam(searchParamQuery);
    setSearchQuery(searchParamQuery);
  }

  if (prevRoleParam !== roleParam) {
    setPrevRoleParam(roleParam);
    setSelectedRole(roleParam);
  }

  const processLoadedUsers = (memberRes) => {
    const storedRegistered = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const dbMembers = memberRes.status === "fulfilled" && Array.isArray(memberRes.value?.data) ? memberRes.value.data : [];
    const normalizedDb = dbMembers.map((m) => ({
      id: m.id,
      studentId: m.studentId || m.user_id || `MEM-${m.id}`,
      name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'User',
      email: m.email || `${(m.first_name || 'user').toLowerCase()}@library.com`,
      role: m.role || 'Student',
      department: m.department || 'CS',
      registeredDate: m.joined_date || m.created_at || new Date().toISOString().split("T")[0],
      status: m.status || 'active',
    }));

    const allCombined = [...storedRegistered, ...normalizedDb];
    const uniqueMap = new Map();
    allCombined.forEach((u) => {
      const roleLower = String(u.role || "").toLowerCase().trim();
      // Exclude Librarians and Admins from Manage Users table
      if (!roleLower.includes("librarian") && !roleLower.includes("admin")) {
        const key = (u.email || String(u.id)).toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, u);
        }
      }
    });
    return Array.from(uniqueMap.values());
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [booksRes, memberRes, libRes, loanRes, fineRes] = await Promise.allSettled([
        api.get("/books"),
        api.get("/member"),
        api.get("/librarians"),
        api.get("/loans"),
        api.get("/fines"),
      ]);

      const booksData = booksRes.status === "fulfilled" && Array.isArray(booksRes.value?.data) ? booksRes.value.data : [];
      const studentsData = processLoadedUsers(memberRes);
      const librariansData = libRes.status === "fulfilled" && Array.isArray(libRes.value?.data) ? libRes.value.data : [];
      const issuesData = loanRes.status === "fulfilled" && Array.isArray(loanRes.value?.data) ? loanRes.value.data : MOCK_RECENT_ISSUES;
      const overdueData = fineRes.status === "fulfilled" && Array.isArray(fineRes.value?.data) ? fineRes.value.data : MOCK_OVERDUE_BOOKS;

      const totalBooks = booksData.length;
      const totalLibrarians = librariansData.length > 0 ? librariansData.length : studentsData.filter(u => u.role === "Librarian").length;
      const booksIssued = issuesData.filter(i => i.status === "Issued").length;
      const booksReturned = issuesData.filter(i => i.status === "Returned").length;

      setStats({
        totalBooks,
        registeredStudents: studentsData.length,
        registeredUsers: studentsData.length,
        totalLibrarians,
        booksIssued,
        booksReturned,
        overdueBooks: overdueData.length,
        pendingFines: 0,
      });

      setRecentIssues(issuesData);
      setOverdueBooks(overdueData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Error loading dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddStudentSubmit = async (dataOrEvent) => {
    if (dataOrEvent && dataOrEvent.preventDefault) {
      dataOrEvent.preventDefault();
    }
    const inputData = (dataOrEvent && (dataOrEvent.fullName || dataOrEvent.name))
      ? dataOrEvent
      : studentFormData;

    const fullName = inputData.fullName || inputData.name || "New User";
    const studentId = inputData.studentId || `STU-${Date.now().toString().slice(-4)}`;
    const email = inputData.email || "";
    const role = inputData.role || "Student";
    const password = inputData.password || "123456";

    const first_name = inputData.first_name || fullName.split(" ")[0] || "User";
    const last_name = inputData.last_name || fullName.split(" ").slice(1).join(" ") || "Member";

    const payload = {
      user_id: inputData.user_id || inputData.studentId || studentId,
      studentId: inputData.user_id || inputData.studentId || studentId,
      first_name: first_name,
      last_name: last_name,
      name: fullName,
      fullName: fullName,
      email: email,
      password: password,
      role: role,
      status: (inputData.status || "active").toLowerCase(),
      joined_date: new Date().toISOString().split("T")[0],
    };

    try {
      let newStudent;
      try {
        const res = await api.post("/member", payload);
        newStudent = res.data?.member || res.data || { id: Date.now(), ...payload };
        await fetchDashboardData();
      } catch (err) {
        console.warn("Backend API POST /member fallback:", err?.message);
        newStudent = { id: Date.now(), ...payload };
      }

      // Persist to registered_users in localStorage so user can log in
      const existingRegistered = JSON.parse(localStorage.getItem("registered_users") || "[]");
      const updatedRegistered = [...existingRegistered.filter((u) => u.email !== payload.email), payload];
      localStorage.setItem("registered_users", JSON.stringify(updatedRegistered));

      setStudents((prev) => [...prev, newStudent]);
      setStats((prev) => ({
        ...prev,
        registeredStudents: prev.registeredStudents + 1,
        registeredUsers: (prev.registeredUsers || 0) + 1,
      }));
      setStudentFormData({ name: "", studentId: "", email: "", department: "CS", role: "Student", designation: "", semester: "Semester 1" });
      setActiveModal(null);
      return newStudent;
    } catch (err) {
      console.error("Add user failed", err);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to remove this member from database?")) {
      try {
        await api.delete(`/member/${id}`);
      } catch (err) {
        console.warn("API DELETE /member failed:", err?.message);
      }
      setStudents((prev) => prev.filter((s) => s.id !== id));
      const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
      const updated = registeredUsers.filter((u) => u.id !== id && u.studentId !== id);
      localStorage.setItem("registered_users", JSON.stringify(updated));
    }
  };

  const handleUpdateStudent = async (id, updatedData) => {
    let updatedMember;
    try {
      const res = await api.put(`/member/${id}`, updatedData);
      updatedMember = res.data?.member || res.data || updatedData;
    } catch (err) {
      console.warn("API PUT /member failed:", err?.message);
      updatedMember = updatedData;
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id || s.studentId === id ? { ...s, ...updatedMember } : s))
    );

    // Sync localStorage registered_users
    const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const updatedRegistered = registeredUsers.map((u) =>
      (u.id === id || u.user_id === id || u.studentId === id || u.email === updatedData.email)
        ? { ...u, ...updatedData }
        : u
    );
    localStorage.setItem("registered_users", JSON.stringify(updatedRegistered));
    return updatedMember;
  };

  const filteredStudents = students.filter((s) => {
    const roleLower = String(s.role || "").toLowerCase().trim();
    if (roleLower.includes("librarian") || roleLower.includes("admin")) {
      return false;
    }
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === "All" || s.department === selectedDept;
    const matchesRole = selectedRole === "All" || (s.role || "Student") === selectedRole;
    return matchesSearch && matchesDept && matchesRole;
  });

  return {
    stats,
    recentIssues,
    overdueBooks,
    students: filteredStudents,
    users: filteredStudents,
    allStudents: students,
    allUsers: students,
    searchQuery,
    setSearchQuery,
    selectedDept,
    setSelectedDept,
    selectedRole,
    setSelectedRole,
    loading,
    activeModal,
    setActiveModal,
    studentFormData,
    setStudentFormData,
    studentErrors,
    handleAddStudentSubmit,
    handleDeleteStudent,
    handleUpdateStudent,
    refreshDashboard: fetchDashboardData,
  };
};

export const useMemberController = useMemberHook;
