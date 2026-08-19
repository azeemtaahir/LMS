import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

const MOCK_USERS = [
  { id: 1, studentId: "STU-101", name: "John Doe", email: "student@gmail.com", role: "Student", department: "CS", semester: "Semester 5", registeredDate: "2024-01-15", status: "Active" },
  { id: 2, studentId: "TCH-201", name: "Dr. Sarah Jenkins", email: "teacher@gmail.com", role: "Teacher", department: "CS", designation: "Professor", registeredDate: "2023-11-20", status: "Active" },
  { id: 3, studentId: "STU-102", name: "Emily Davis", email: "emily.davis@university.edu", role: "Student", department: "IT", semester: "Semester 3", registeredDate: "2024-02-10", status: "Active" },
  { id: 4, studentId: "TCH-202", name: "Prof. Michael Brown", email: "michael.brown@university.edu", role: "Teacher", department: "ECE", designation: "Head of Department (HOD)", registeredDate: "2023-09-05", status: "Active" },
  { id: 5, studentId: "STU-103", name: "Alex Turner", email: "alex.turner@university.edu", role: "Student", department: "ME", semester: "Semester 7", registeredDate: "2024-03-01", status: "Active" },
];

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
  const searchParamQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamQuery);

  if (prevSearchParam !== searchParamQuery) {
    setPrevSearchParam(searchParamQuery);
    setSearchQuery(searchParamQuery);
  }
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [loading, setLoading] = useState(false);

  const [activeModal, setActiveModal] = useState(null);

  const [studentFormData, setStudentFormData] = useState({ name: "", studentId: "", email: "", department: "CS", role: "Student", designation: "", semester: "Semester 1" });
  const [studentErrors, setStudentErrors] = useState({});

  const processLoadedUsers = (memberRes) => {
    const storedRegistered = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const dbMembers = memberRes.status === "fulfilled" && Array.isArray(memberRes.value?.data) ? memberRes.value.data : [];
    const normalizedDb = dbMembers.map((m) => ({
      id: m.id,
      studentId: m.studentId || `MEM-${m.id}`,
      name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'User',
      email: m.email || 'user@library.com',
      role: m.role || 'Student',
      department: m.department || 'CS',
      semester: m.semester || 'Semester 1',
      designation: m.designation || '',
      registeredDate: m.joined_date || m.created_at || '2024-01-01',
      status: m.status || 'Active',
    }));

    const allCombined = [...storedRegistered, ...normalizedDb, ...MOCK_USERS];
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

    const payload = {
      name: fullName,
      fullName: fullName,
      studentId: studentId,
      email: email,
      password: password,
      role: role,
      department: inputData.department || "CS",
      semester: inputData.semester || "Semester 1",
      designation: inputData.designation || "",
      phoneNumber: inputData.phoneNumber || inputData.phone || "",
      status: "Active",
      registeredDate: new Date().toISOString().split("T")[0],
    };

    try {
      let newStudent;
      try {
        const res = await api.post("/member", payload);
        newStudent = res.data?.member || res.data || { id: Date.now(), ...payload };
      } catch (err) {
        console.warn("Backend API POST /member fallback:", err?.message);
        newStudent = { id: Date.now(), ...payload };
      }

      // Persist to registered_users in localStorage so user can log in
      const existingRegistered = JSON.parse(localStorage.getItem("registered_users") || "[]");
      const updatedRegistered = [...existingRegistered, payload];
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

  const handleDeleteStudent = (id) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
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
    refreshDashboard: fetchDashboardData,
  };
};

export const useMemberController = useMemberHook;
