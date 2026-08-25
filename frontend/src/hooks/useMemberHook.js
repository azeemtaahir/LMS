import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

export const useMemberHook = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";
  const roleParam = searchParams.get("role") || "All";

  const [stats, setStats] = useState({
    totalBooks: 0,
    registeredStudents: 0,
    registeredUsers: 0,
    totalLibrarians: 0,
    booksIssued: 0,
    booksReturned: 0,
    overdueBooks: 0,
    pendingFines: 0,
    categories: 0,
  });

  const [recentIssues, setRecentIssues] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [students, setStudents] = useState([]);

  const [recentLogins, setRecentLogins] = useState(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("recent_logins") || "[]"
      );

      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch {
      // Ignore localStorage parsing error
    }

    return [];
  });

  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const [studentFormData, setStudentFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    department: "CS",
    role: "Student",
    designation: "",
    semester: "Semester 1",
  });

  // State handlers that keep search params in sync
  const setSearchQuery = useCallback(
    (query) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (query) {
          next.set("search", query);
        } else {
          next.delete("search");
        }

        return next;
      });
    },
    [setSearchParams]
  );

  const setSelectedRole = useCallback(
    (role) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (role && role !== "All") {
          next.set("role", role);
        } else {
          next.delete("role");
        }

        return next;
      });
    },
    [setSearchParams]
  );

  const processLoadedUsers = (memberRes) => {
    const storedRegistered = JSON.parse(
      localStorage.getItem("registered_users") || "[]"
    );

    const dbMembers =
      memberRes.status === "fulfilled" &&
      Array.isArray(memberRes.value?.data)
        ? memberRes.value.data
        : [];

    const normalizeUser = (m, idx) => {
      const dbId = m.id;

      const uId =
        m.user_id ||
        m.studentId ||
        m.id ||
        `MEM-${idx + 1}`;

      const name =
        m.name ||
        m.fullName ||
        `${m.first_name || ""} ${m.last_name || ""}`.trim() ||
        "User";

      return {
        ...m,
        db_id: dbId,
        id: uId,
        studentId: m.studentId || m.user_id || String(uId),
        user_id: m.user_id || m.studentId || String(uId),
        name,
        email:
          m.email ||
          `${name
            .toLowerCase()
            .replace(/\s+/g, ".")}@library.com`,
        role: m.role || "Student",
        department: m.department || "CS",
        registeredDate:
          m.joined_date ||
          m.created_at ||
          m.registeredDate ||
          new Date().toISOString().split("T")[0],
        status: m.status || "active",
        phone: m.phone || "",
      };
    };

    const normalizedDb = dbMembers.map((m, idx) =>
      normalizeUser(m, idx)
    );

    const normalizedStored = storedRegistered.map((m, idx) =>
      normalizeUser(m, dbMembers.length + idx)
    );

    const allCombined = [
      ...normalizedDb,
      ...normalizedStored,
    ];

    const uniqueMap = new Map();

    allCombined.forEach((u) => {
      const roleLower = String(u.role || "")
        .toLowerCase()
        .trim();

      if (
        !roleLower.includes("librarian") &&
        !roleLower.includes("admin")
      ) {
        const key = (
          u.email || String(u.id)
        ).toLowerCase();

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
      const [
        booksRes,
        memberRes,
        libRes,
        loanRes,
        fineRes,
      ] = await Promise.allSettled([
        api.get("/books"),
        api.get("/member"),
        api.get("/librarians"),
        api.get("/loans"),
        api.get("/fines"),
      ]);

      const booksData =
        booksRes.status === "fulfilled" &&
        Array.isArray(booksRes.value?.data)
          ? booksRes.value.data
          : [];

      const studentsData = processLoadedUsers(memberRes);

      const librariansData =
        libRes.status === "fulfilled" &&
        Array.isArray(libRes.value?.data)
          ? libRes.value.data
          : [];

      const issuesData =
        loanRes.status === "fulfilled" &&
        Array.isArray(loanRes.value?.data)
          ? loanRes.value.data
          : [];

      const overdueData =
        fineRes.status === "fulfilled" &&
        Array.isArray(fineRes.value?.data)
          ? fineRes.value.data
          : [];

      const totalBooks = booksData.length;

      const totalLibrarians =
        librariansData.length > 0
          ? librariansData.length
          : studentsData.filter(
              (u) => u.role === "Librarian"
            ).length;

      const booksIssued = issuesData.filter((i) => {
        const isReturned =
          i.status === "Returned" ||
          i.returned_date ||
          i.actualReturnedDate;

        return (
          !isReturned &&
          (i.status === "Issued" ||
            i.status === "Overdue")
        );
      }).length;

      const booksReturned = issuesData.filter(
        (i) =>
          i.status === "Returned" ||
          i.returned_date ||
          i.actualReturnedDate
      ).length;

      const overdueBooksCount = issuesData.filter((i) => {
        const isReturned =
          i.status === "Returned" ||
          i.returned_date ||
          i.actualReturnedDate;

        const isPaid =
          i.fineStatus === "Paid" ||
          i.fine_status === "Paid";

        const dueDate =
          i.dueDate || i.due_date;

        const isPastDue = dueDate
          ? new Date(dueDate) < new Date()
          : false;

        return (
          !isReturned &&
          !isPaid &&
          (i.status === "Overdue" || isPastDue)
        );
      }).length;

      setStats({
        totalBooks,
        registeredStudents: studentsData.length,
        registeredUsers: studentsData.length,
        totalLibrarians,
        booksIssued,
        booksReturned,
        overdueBooks: overdueBooksCount,
        pendingFines: 0,
        categories: 0,
      });

      setRecentIssues(issuesData);
      setOverdueBooks(overdueData);
      setStudents(studentsData);
    } catch (err) {
      console.error(
        "Error loading dashboard metrics",
        err
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  const handleAddStudentSubmit = async (
    dataOrEvent
  ) => {
    if (dataOrEvent?.preventDefault) {
      dataOrEvent.preventDefault();
    }

    const inputData =
      dataOrEvent &&
      (dataOrEvent.fullName || dataOrEvent.name)
        ? dataOrEvent
        : studentFormData;

    const fullName =
      inputData.fullName ||
      inputData.name ||
      "New User";

    const studentId =
      inputData.studentId ||
      `STU-${Date.now()
        .toString()
        .slice(-4)}`;

    const email = inputData.email || "";
    const role = inputData.role || "Student";
    const password =
      inputData.password || "123456";

    const first_name =
      inputData.first_name ||
      fullName.split(" ")[0] ||
      "User";

    const last_name =
      inputData.last_name ||
      fullName
        .split(" ")
        .slice(1)
        .join(" ") ||
      "Member";

    const payload = {
      id: Date.now(),

      user_id:
        inputData.user_id ||
        inputData.studentId ||
        studentId,

      studentId:
        inputData.user_id ||
        inputData.studentId ||
        studentId,

      first_name,
      last_name,

      name: fullName,
      fullName,

      email,
      password,
      role,

      department:
        inputData.department || "CS",

      phone:
        inputData.phone || "1234567890",

      status: (
        inputData.status || "active"
      ).toLowerCase(),

      joined_date:
        new Date()
          .toISOString()
          .split("T")[0],
    };

    // Check duplicate user
    const isDuplicate = students.some((s) => {
      const sEmail = String(
        s.email || ""
      )
        .toLowerCase()
        .trim();

      const inputEmail = String(
        email || ""
      )
        .toLowerCase()
        .trim();

      const sId = String(
        s.studentId ||
          s.user_id ||
          s.id ||
          ""
      )
        .toLowerCase()
        .trim();

      const inputId = String(
        inputData.user_id ||
          inputData.studentId ||
          studentId ||
          ""
      )
        .toLowerCase()
        .trim();

      return (
        (inputEmail && sEmail === inputEmail) ||
        (inputId && sId === inputId)
      );
    });

    if (isDuplicate) {
      alert(
        "⚠️ User is already created / registered with this email or User ID!"
      );

      return null;
    }

    // Save locally first
    const existingRegistered = JSON.parse(
      localStorage.getItem(
        "registered_users"
      ) || "[]"
    );

    const updatedRegistered = [
      payload,
      ...existingRegistered,
    ];

    localStorage.setItem(
      "registered_users",
      JSON.stringify(updatedRegistered)
    );

    try {
      const existingLogins = JSON.parse(
        localStorage.getItem(
          "recent_logins"
        ) || "[]"
      );

      const updatedLogins = [
        payload,
        ...existingLogins.filter(
          (u) =>
            u.email !== payload.email &&
            u.id !== payload.id
        ),
      ].slice(0, 10);

      localStorage.setItem(
        "recent_logins",
        JSON.stringify(updatedLogins)
      );

      setRecentLogins(updatedLogins);
    } catch {
      // Ignore localStorage error
    }

    setStudents((prev) => [
      payload,
      ...prev.filter(
        (s) =>
          s.id !== payload.id &&
          s.studentId !== payload.studentId
      ),
    ]);

    try {
      const res = await api.post(
        "/member",
        payload
      );

      await fetchDashboardData();

      setStudentFormData({
        name: "",
        studentId: "",
        email: "",
        department: "CS",
        role: "Student",
        designation: "",
        semester: "Semester 1",
      });

      setActiveModal(null);

      return (
        res.data?.member || res.data
      );
    } catch (err) {
      console.warn(
        "Add user API notice:",
        err?.message
      );

      setStudentFormData({
        name: "",
        studentId: "",
        email: "",
        department: "CS",
        role: "Student",
        designation: "",
        semester: "Semester 1",
      });

      setActiveModal(null);

      return payload;
    }
  };

  const handleDeleteStudent = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this member from database?"
      )
    ) {
      try {
        await api.delete(`/member/${id}`);
      } catch (err) {
        console.warn(
          "API DELETE /member failed:",
          err?.message
        );
      }

      setStudents((prev) =>
        prev.filter((s) => s.id !== id)
      );

      const registeredUsers = JSON.parse(
        localStorage.getItem(
          "registered_users"
        ) || "[]"
      );

      const updated = registeredUsers.filter(
        (u) =>
          u.id !== id &&
          u.studentId !== id
      );

      localStorage.setItem(
        "registered_users",
        JSON.stringify(updated)
      );
    }
  };

  const handleUpdateStudent = async (
    id,
    updatedData
  ) => {
    let updatedMember;

    try {
      const res = await api.put(
        `/member/${id}`,
        updatedData
      );

      updatedMember =
        res.data?.member ||
        res.data ||
        updatedData;
    } catch (err) {
      console.warn(
        "API PUT /member failed:",
        err?.message
      );

      updatedMember = updatedData;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ||
        s.studentId === id
          ? {
              ...s,
              ...updatedMember,
            }
          : s
      )
    );

    const registeredUsers = JSON.parse(
      localStorage.getItem(
        "registered_users"
      ) || "[]"
    );

    const updatedRegistered =
      registeredUsers.map((u) =>
        u.id === id ||
        u.user_id === id ||
        u.studentId === id ||
        u.email === updatedData.email
          ? {
              ...u,
              ...updatedData,
            }
          : u
      );

    localStorage.setItem(
      "registered_users",
      JSON.stringify(updatedRegistered)
    );

    return updatedMember;
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const roleLower = String(
        s.role || ""
      )
        .toLowerCase()
        .trim();

      if (
        roleLower.includes("librarian") ||
        roleLower.includes("admin")
      ) {
        return false;
      }

      const matchesSearch =
        (s.name &&
          s.name
            .toLowerCase()
            .includes(
              searchParamQuery.toLowerCase()
            )) ||
        (s.studentId &&
          s.studentId
            .toLowerCase()
            .includes(
              searchParamQuery.toLowerCase()
            )) ||
        (s.email &&
          s.email
            .toLowerCase()
            .includes(
              searchParamQuery.toLowerCase()
            ));

      const matchesDept =
        selectedDept === "All" ||
        s.department === selectedDept;

      const matchesRole =
        roleParam === "All" ||
        (s.role || "Student") === roleParam;

      return (
        matchesSearch &&
        matchesDept &&
        matchesRole
      );
    });
  }, [
    students,
    searchParamQuery,
    selectedDept,
    roleParam,
  ]);

  const displayRecentLogins = useMemo(() => {
    if (
      Array.isArray(recentLogins) &&
      recentLogins.length > 0
    ) {
      return recentLogins;
    }

    return students;
  }, [recentLogins, students]);

  return {
    stats,
    recentIssues,
    overdueBooks,

    students: filteredStudents,
    users: filteredStudents,

    allStudents: students,
    allUsers: students,

    recentLogins: displayRecentLogins,

    searchQuery: searchParamQuery,
    setSearchQuery,

    selectedDept,
    setSelectedDept,

    selectedRole: roleParam,
    setSelectedRole,

    loading,

    activeModal,
    setActiveModal,

    studentFormData,
    setStudentFormData,

    handleAddStudentSubmit,
    handleDeleteStudent,
    handleUpdateStudent,

    refreshDashboard: fetchDashboardData,
  };
};

export const useMemberController = useMemberHook;