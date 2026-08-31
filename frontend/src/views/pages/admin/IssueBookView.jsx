import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useBookController } from "../../../hooks/useBookHook";
import { useMemberController } from "../../../hooks/useMemberHook";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import {
  User,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Search,
  ChevronDown,
  Check,
  X,
  Calendar,
  Sparkles,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function IssueBookView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books } = useBookController();
  const { students, allStudents } = useMemberController();
  const { issueFormData, setIssueFormData, handleIssueBookSubmit, allIssues } =
    useTransactionController();

  const userList =
    allStudents && allStudents.length > 0 ? allStudents : students || [];

  // Dropdown UI States
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const bookDropdownRef = useRef(null);

  // Selected Data Objects
  const selectedStudentObj = userList.find(
    (s) =>
      String(s.db_id) === String(issueFormData.studentId) ||
      String(s.id) === String(issueFormData.studentId) ||
      String(s.studentId) === String(issueFormData.studentId) ||
      String(s.user_id) === String(issueFormData.studentId)
  );

  const selectedBookObj = books.find(
    (b) => String(b.id) === String(issueFormData.bookId)
  );

  const isOutOfStock =
    selectedBookObj &&
    Number(
      selectedBookObj.availableCopies ?? selectedBookObj.copies_owned ?? 0
    ) <= 0;

  const targetTitle = selectedBookObj?.title
    ? String(selectedBookObj.title).trim().toLowerCase()
    : "";
  const targetIsbn = selectedBookObj?.isbn
    ? String(selectedBookObj.isbn).trim().toLowerCase()
    : "";
  const targetBookId = String(selectedBookObj?.id || issueFormData.bookId);
  const targetMemberIdStr = String(
    selectedStudentObj?.db_id ||
      selectedStudentObj?.id ||
      selectedStudentObj?.user_id ||
      issueFormData.studentId
  ).toLowerCase();

  const hasActiveSameTitleOrIsbnLoan = Boolean(
    selectedStudentObj &&
      selectedBookObj &&
      (allIssues || []).some((loan) => {
        const isUnreturned = loan.status !== "Returned" && !loan.returned_date;
        if (!isUnreturned) return false;
        const loanMemberIdStr = String(
          loan.member_id || loan.studentId || ""
        ).toLowerCase();
        const isSameMember =
          loanMemberIdStr === targetMemberIdStr ||
          loan.studentName ===
            (selectedStudentObj?.name ||
              `${selectedStudentObj?.first_name || ""} ${
                selectedStudentObj?.last_name || ""
              }`.trim());
        if (!isSameMember) return false;
        const loanTitle =
          loan.bookTitle || loan.title
            ? String(loan.bookTitle || loan.title).trim().toLowerCase()
            : "";
        const loanIsbn = loan.isbn
          ? String(loan.isbn).trim().toLowerCase()
          : "";
        if (targetTitle && loanTitle && targetTitle === loanTitle) return true;
        if (targetIsbn && loanIsbn && targetIsbn === loanIsbn) return true;
        return String(loan.book_id || loan.bookId) === targetBookId;
      })
  );

  const selectedStudentOverdueLoans =
    selectedStudentObj && allIssues
      ? (allIssues || []).filter((item) => {
          const isReturned =
            item.status === "Returned" ||
            Boolean(item.returned_date || item.actualReturnedDate);
          const isPaid =
            item.fineStatus === "Paid" || item.fine_status === "Paid";
          if (isReturned || isPaid) return false;

          const uId = String(selectedStudentObj.id || "");
          const uDbId = String(
            selectedStudentObj.db_id || selectedStudentObj.member_id || ""
          );
          const uStudentId = String(
            selectedStudentObj.studentId || selectedStudentObj.user_id || ""
          );
          const uName = String(
            selectedStudentObj.name ||
              `${selectedStudentObj.first_name || ""} ${
                selectedStudentObj.last_name || ""
              }`
          )
            .toLowerCase()
            .trim();
          const uEmail = String(selectedStudentObj.email || "")
            .toLowerCase()
            .trim();

          const mMemberId = String(item.member_id || item.user_id || "");
          const mStudentId = String(item.studentId || "");
          const mName = String(item.studentName || item.memberName || "")
            .toLowerCase()
            .trim();
          const mEmail = String(item.email || "").toLowerCase().trim();

          const isUserLoan =
            (uId && mMemberId === uId) ||
            (uDbId && mMemberId === uDbId) ||
            (uStudentId &&
              (mStudentId === uStudentId || mMemberId === uStudentId)) ||
            (uName &&
              mName &&
              (mName.includes(uName) || uName.includes(mName))) ||
            (uEmail &&
              (mEmail === uEmail || (mName && mName.includes(uEmail))));

          if (!isUserLoan) return false;

          const dueDateStr = item.dueDate || item.due_date || item.returnDate;
          const isPastDue = dueDateStr
            ? new Date(dueDateStr) < new Date()
            : false;

          return item.status === "Overdue" || isPastDue;
        })
      : [];

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        bookDropdownRef.current &&
        !bookDropdownRef.current.contains(e.target)
      ) {
        setBookDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync search inputs with selections when dropdowns close
  useEffect(() => {
    if (selectedStudentObj && !userDropdownOpen) {
      setUserSearchTerm(
        selectedStudentObj.name ||
          `${selectedStudentObj.first_name || ""} ${
            selectedStudentObj.last_name || ""
          }`.trim()
      );
    }
  }, [issueFormData.studentId, selectedStudentObj, userDropdownOpen]);

  useEffect(() => {
    if (selectedBookObj && !bookDropdownOpen) {
      setBookSearchTerm(selectedBookObj.title || "");
    }
  }, [issueFormData.bookId, selectedBookObj, bookDropdownOpen]);

  // Filtered Users
  const filteredUsers = userList.filter((st) => {
    if (!userSearchTerm.trim()) return true;
    const q = userSearchTerm.toLowerCase().trim();
    const name = String(
      st.name || `${st.first_name || ""} ${st.last_name || ""}`
    ).toLowerCase();
    const id = String(
      st.studentId || st.user_id || st.id || st.db_id || ""
    ).toLowerCase();
    const email = String(st.email || "").toLowerCase();
    const role = String(st.role || "").toLowerCase();
    const dept = String(st.department || "").toLowerCase();
    return (
      name.includes(q) ||
      id.includes(q) ||
      email.includes(q) ||
      role.includes(q) ||
      dept.includes(q)
    );
  });

  // Filtered Books
  const filteredBooks = books.filter((b) => {
    if (!bookSearchTerm.trim()) return true;
    const q = bookSearchTerm.toLowerCase().trim();
    const title = String(b.title || "").toLowerCase();
    const author = String(b.author || "").toLowerCase();
    const isbn = String(b.isbn || "").toLowerCase();
    const cat = String(b.category || "").toLowerCase();
    return (
      title.includes(q) ||
      author.includes(q) ||
      isbn.includes(q) ||
      cat.includes(q)
    );
  });

  // Quick Loan Duration Presets
  const applyDurationPreset = (days) => {
    const issueDateStr =
      issueFormData.issueDate || new Date().toISOString().split("T")[0];
    const d = new Date(issueDateStr);
    let calcReturn = "";
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + days);
      calcReturn = d.toISOString().split("T")[0];
    }
    setIssueFormData((prev) => ({
      ...prev,
      issueDate: issueDateStr,
      loanDurationDays: String(days),
      returnDate: calcReturn || prev.returnDate,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!issueFormData.studentId) {
      toast.warning("Please search and select a borrower user.");
      return;
    }
    if (!issueFormData.bookId) {
      toast.warning("Please search and select a book to issue.");
      return;
    }
    if (isOutOfStock) {
      toast.warning(
        `Book "${selectedBookObj.title}" is out of stock (0/${
          selectedBookObj.totalQuantity ?? selectedBookObj.copies_owned ?? 0
        } available).`
      );
      return;
    }
    if (hasActiveSameTitleOrIsbnLoan) {
      toast.warning(
        `This member already has an active issue for '${selectedBookObj?.title}'.`
      );
      return;
    }
    const success = await handleIssueBookSubmit(
      e,
      selectedStudentObj,
      selectedBookObj
    );
    if (success) {
      const isLibrarianRoute =
        location.pathname.includes("-lib") ||
        location.pathname.includes("librarian");
      const targetPath = isLibrarianRoute ? "/issued-lib" : "/issued";
      navigate(targetPath);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-0 select-none">
      <form
        onSubmit={onSubmit}
        className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-md text-slate-900 space-y-3"
      >
        {/* Header Banner with Dark Navy Theme */}
        <div className="bg-slate-900 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-white border border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-xs">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight">
                Issue Book Form
              </h2>
              <p className="text-[11px] text-slate-400 leading-tight">
                Select borrower user, book title, and set checkout return dates.
              </p>
            </div>
          </div>

          <div className="relative z-10 hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
            <Sparkles size={11} className="text-amber-400 fill-amber-400" />
            <span>Circulation</span>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* ================= LEFT COLUMN: BORROWER SEARCH & DETAILS ================= */}
          <div className="space-y-2.5">
            {/* Searchable User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Select User (Student / Teacher) *</span>
                {selectedStudentObj && (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check size={11} /> Selected
                  </span>
                )}
              </label>

              {/* Search Input Box */}
              <div className="relative flex items-center">
                <div className="absolute left-3 pointer-events-none text-slate-400">
                  <Search size={14} />
                </div>

                <input
                  type="text"
                  value={userSearchTerm}
                  onFocus={() => setUserDropdownOpen(true)}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    setUserDropdownOpen(true);
                    if (issueFormData.studentId) {
                      setIssueFormData((prev) => ({ ...prev, studentId: "" }));
                    }
                  }}
                  placeholder="Search user name or ID..."
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition shadow-xs font-medium"
                />

                <div className="absolute right-2.5 flex items-center gap-1">
                  {userSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearchTerm("");
                        setIssueFormData((prev) => ({ ...prev, studentId: "" }));
                        setUserDropdownOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dropdown Options List */}
              {userDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl divide-y divide-slate-100 no-scrollbar">
                  {filteredUsers.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs font-medium">
                      No matching users found
                    </div>
                  ) : (
                    filteredUsers.map((st) => {
                      const uVal =
                        st.db_id || st.id || st.studentId || st.user_id;
                      const isSelected =
                        String(uVal) === String(issueFormData.studentId);
                      const fullName =
                        st.name ||
                        `${st.first_name || ""} ${st.last_name || ""}`.trim();

                      return (
                        <div
                          key={uVal}
                          onClick={() => {
                            setIssueFormData((prev) => ({
                              ...prev,
                              studentId: uVal,
                            }));
                            setUserSearchTerm(fullName);
                            setUserDropdownOpen(false);
                          }}
                          className={`p-2 px-2.5 flex items-center justify-between hover:bg-indigo-50/60 cursor-pointer transition ${
                            isSelected ? "bg-indigo-50/90" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {fullName ? fullName[0].toUpperCase() : "U"}
                            </div>

                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{fullName}</span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] border border-slate-200 font-semibold">
                                  {st.role || "Student"}
                                </span>
                              </div>

                              <div className="text-[10px] text-slate-500 truncate">
                                ID: {st.studentId || st.user_id || uVal}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <Check size={14} className="text-indigo-600 shrink-0 font-bold" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Borrower Details Card */}
            <div className="rounded-xl border border-slate-200/90 overflow-hidden shadow-xs bg-white space-y-0">
              <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-white border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-200">
                  <User size={13} className="text-indigo-400" />
                  <span>Borrower Profile</span>
                </span>
                {selectedStudentObj && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {selectedStudentObj.role || "Student"}
                  </span>
                )}
              </div>

              <div className="p-2.5 space-y-1">
                {selectedStudentObj ? (
                  <>
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {selectedStudentObj.name
                          ? selectedStudentObj.name[0].toUpperCase()
                          : "U"}
                      </div>

                      <div className="space-y-0.5 text-xs text-slate-600 leading-tight">
                        <p className="font-bold text-slate-900 text-xs">
                          {selectedStudentObj.name ||
                            `${selectedStudentObj.first_name || ""} ${
                              selectedStudentObj.last_name || ""
                            }`.trim()}
                        </p>
                        <p className="text-[10px]">
                          <span className="text-slate-500 font-semibold">ID:</span>{" "}
                          <span className="font-bold text-slate-800">{selectedStudentObj.studentId || selectedStudentObj.user_id || selectedStudentObj.id}</span>
                        </p>
                        <p className="text-[10px]">
                          <span className="text-slate-500 font-semibold">Dept:</span>{" "}
                          {selectedStudentObj.department || "General"}
                        </p>
                      </div>
                    </div>

                    {selectedStudentOverdueLoans.length > 0 && (
                      <div className="mt-1 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] flex items-center gap-1.5 font-semibold">
                        <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                        <span>
                          User has {selectedStudentOverdueLoans.length} overdue book(s)!
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-2.5 text-center text-slate-400 text-[11px] font-medium italic">
                    Select a user from dropdown above
                  </div>
                )}
              </div>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-600" />
                <span>Issue Date</span>
              </label>

              <input
                type="date"
                value={issueFormData.issueDate}
                onChange={(e) => {
                  const newIssueDate = e.target.value;
                  const days =
                    issueFormData.loanDurationDays &&
                    issueFormData.loanDurationDays !== "custom"
                      ? Number(issueFormData.loanDurationDays)
                      : 7;
                  const d = new Date(newIssueDate);
                  let calcReturn = "";
                  if (!isNaN(d.getTime())) {
                    d.setDate(d.getDate() + days);
                    calcReturn = d.toISOString().split("T")[0];
                  }
                  setIssueFormData((prev) => ({
                    ...prev,
                    issueDate: newIssueDate,
                    returnDate: calcReturn || prev.returnDate,
                  }));
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition shadow-xs font-medium"
              />
            </div>
          </div>

          {/* ================= RIGHT COLUMN: BOOK SEARCH & DETAILS ================= */}
          <div className="space-y-2.5">
            {/* Searchable Book Dropdown */}
            <div className="relative" ref={bookDropdownRef}>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Select Book *</span>
                {selectedBookObj && (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check size={11} /> Selected
                  </span>
                )}
              </label>

              {/* Search Input Box */}
              <div className="relative flex items-center">
                <div className="absolute left-3 pointer-events-none text-slate-400">
                  <Search size={14} />
                </div>

                <input
                  type="text"
                  value={bookSearchTerm}
                  onFocus={() => setBookDropdownOpen(true)}
                  onChange={(e) => {
                    setBookSearchTerm(e.target.value);
                    setBookDropdownOpen(true);
                    if (issueFormData.bookId) {
                      setIssueFormData((prev) => ({ ...prev, bookId: "" }));
                    }
                  }}
                  placeholder="Search book title or author..."
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition shadow-xs font-medium"
                />

                <div className="absolute right-2.5 flex items-center gap-1">
                  {bookSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setBookSearchTerm("");
                        setIssueFormData((prev) => ({ ...prev, bookId: "" }));
                        setBookDropdownOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setBookDropdownOpen((prev) => !prev)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        bookDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dropdown Options List */}
              {bookDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl divide-y divide-slate-100 no-scrollbar">
                  {filteredBooks.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs font-medium">
                      No matching books found
                    </div>
                  ) : (
                    filteredBooks.map((b) => {
                      const avail = Number(
                        b.availableCopies ?? b.copies_owned ?? 0
                      );
                      const isSelected =
                        String(b.id) === String(issueFormData.bookId);

                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            setIssueFormData((prev) => ({
                              ...prev,
                              bookId: b.id,
                            }));
                            setBookSearchTerm(b.title);
                            setBookDropdownOpen(false);
                          }}
                          className={`p-2 px-2.5 flex items-center justify-between hover:bg-indigo-50/60 cursor-pointer transition ${
                            isSelected ? "bg-indigo-50/90" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                              <BookOpen size={14} />
                            </div>

                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {b.title}
                              </div>

                              <div className="text-[10px] text-slate-500 truncate">
                                by {b.author}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                avail <= 0
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {avail <= 0 ? "Out of Stock" : `${avail} avail`}
                            </span>

                            {isSelected && (
                              <Check size={14} className="text-indigo-600 font-bold" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Book Details Card */}
            <div className="rounded-xl border border-slate-200/90 overflow-hidden shadow-xs bg-white space-y-0">
              <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-white border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-200">
                  <BookOpen size={13} className="text-indigo-400" />
                  <span>Book Details</span>
                </span>
                {selectedBookObj && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                      isOutOfStock
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {selectedBookObj.availableCopies ?? 0} /{" "}
                    {selectedBookObj.totalQuantity ??
                      selectedBookObj.copies_owned ??
                      0}{" "}
                    Avail
                  </span>
                )}
              </div>

              <div className="p-2.5 space-y-1">
                {selectedBookObj ? (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                      <BookOpen size={15} />
                    </div>

                    <div className="space-y-0.5 text-xs text-slate-600 leading-tight">
                      <p className="font-bold text-slate-900 text-xs">
                        {selectedBookObj.title}
                      </p>
                      <p className="text-[10px]">
                        <span className="text-slate-500 font-semibold">Author:</span>{" "}
                        <span className="text-slate-800 font-medium">{selectedBookObj.author}</span>
                      </p>
                      <p className="text-[10px]">
                        <span className="text-slate-500 font-semibold">Category:</span>{" "}
                        <span className="text-indigo-600 font-bold">{selectedBookObj.category || "General"}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2.5 text-center text-slate-400 text-[11px] font-medium italic">
                    Select a book from dropdown above
                  </div>
                )}
              </div>
            </div>

            {/* Return Date + Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock size={13} className="text-indigo-600" />
                  <span>Return Due Date</span>
                </label>

                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => applyDurationPreset(d)}
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-lg border transition cursor-pointer select-none ${
                        String(issueFormData.loanDurationDays) === String(d)
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="date"
                value={issueFormData.returnDate}
                onChange={(e) => {
                  const selectedReturn = e.target.value;
                  setIssueFormData((prev) => ({
                    ...prev,
                    loanDurationDays: "custom",
                    returnDate: selectedReturn,
                  }));
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition shadow-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Warning Alerts */}
        {isOutOfStock && (
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-2 shadow-xs">
            <AlertTriangle size={14} className="text-rose-600 shrink-0" />
            <span>Book Not Available! 0 copies currently available.</span>
          </div>
        )}

        {hasActiveSameTitleOrIsbnLoan && !isOutOfStock && (
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-2 shadow-xs">
            <ShieldAlert size={14} className="text-amber-600 shrink-0" />
            <span>User already has an active loan for this book title.</span>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isOutOfStock || hasActiveSameTitleOrIsbnLoan}
            className={`w-full py-2.5 px-5 rounded-xl font-extrabold text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
              isOutOfStock || hasActiveSameTitleOrIsbnLoan
                ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none opacity-80"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25 cursor-pointer active:scale-98"
            }`}
          >
            <span>
              {isOutOfStock
                ? "Book Out of Stock"
                : hasActiveSameTitleOrIsbnLoan
                ? "Duplicate Borrow Restriction Active"
                : "Issue Book"}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
