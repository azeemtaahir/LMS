import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useMemberController } from "../../../hooks/useMemberHook";
import { useTransactionController } from "../../../hooks/useTransactionHook";
import { User, CheckCircle2, AlertTriangle } from "lucide-react";

export default function MemberProfileView() {
  const { user } = useAuth();
  const { allUsers } = useMemberController();
  const { allIssues } = useTransactionController();

  // Dynamically find current user's record strictly matching the logged-in user
  const liveUserRecord = (allUsers || []).find((u) => {
    if (!user) return false;
    const uEmail = String(user.email || "").toLowerCase().trim();
    const uId = String(user.id || user.db_id || "").toLowerCase().trim();
    const uStudentId = String(user.studentId || user.user_id || "").toLowerCase().trim();

    const mEmail = String(u.email || "").toLowerCase().trim();
    const mId = String(u.id || u.db_id || "").toLowerCase().trim();
    const mStudentId = String(u.studentId || u.user_id || "").toLowerCase().trim();

    if (uEmail && mEmail) {
      return uEmail === mEmail;
    }
    if (uStudentId && mStudentId) {
      return uStudentId === mStudentId;
    }
    if (uId && mId) {
      return uId === mId;
    }
    return false;
  });

  const activeUser = liveUserRecord || user;

  const rawFirstName = activeUser?.first_name || activeUser?.name?.split(" ")[0] || activeUser?.username || "";
  const rawLastName = activeUser?.last_name || activeUser?.name?.split(" ").slice(1).join(" ") || "";

  const [formData, setFormData] = useState({
    first_name: rawFirstName,
    last_name: rawLastName,
    email: activeUser?.email || "",
    role: activeUser?.role || "Student",
    status: activeUser?.status || "active",
  });

  useEffect(() => {
    if (activeUser) {
      const fName = activeUser.first_name || activeUser.name?.split(" ")[0] || activeUser.username || "";
      const lName = activeUser.last_name || activeUser.name?.split(" ").slice(1).join(" ") || "";

      setFormData({
        first_name: fName,
        last_name: lName,
        email: activeUser.email || "",
        role: activeUser.role || "Student",
        status: activeUser.status || "active",
      });
    }
  }, [activeUser]);

  const userOverdueLoans = (activeUser && allIssues) ? (allIssues || []).filter((item) => {
    const isReturned = item.status === "Returned" || Boolean(item.returned_date || item.actualReturnedDate);
    const isPaid = item.fineStatus === "Paid" || item.fine_status === "Paid";
    if (isReturned || isPaid) return false;

    const uId = String(activeUser.id || "");
    const uDbId = String(activeUser.db_id || activeUser.member_id || "");
    const uStudentId = String(activeUser.studentId || activeUser.user_id || "");
    const uName = String(activeUser.name || `${activeUser.first_name || ""} ${activeUser.last_name || ""}`).toLowerCase().trim();
    const uEmail = String(activeUser.email || "").toLowerCase().trim();

    const mMemberId = String(item.member_id || item.user_id || "");
    const mStudentId = String(item.studentId || "");
    const mName = String(item.studentName || item.memberName || "").toLowerCase().trim();
    const mEmail = String(item.email || "").toLowerCase().trim();

    const isUserLoan =
      (uId && mMemberId === uId) ||
      (uDbId && mMemberId === uDbId) ||
      (uStudentId && (mStudentId === uStudentId || mMemberId === uStudentId)) ||
      (uName && mName && (mName.includes(uName) || uName.includes(mName))) ||
      (uEmail && (mEmail === uEmail || (mName && mName.includes(uEmail))));

    if (!isUserLoan) return false;

    const dueDateStr = item.dueDate || item.due_date || item.returnDate;
    const isPastDue = dueDateStr ? new Date(dueDateStr) < new Date() : false;

    return item.status === "Overdue" || isPastDue;
  }) : [];

  const fullNameDisplay = `${formData.first_name} ${formData.last_name}`.trim() || activeUser?.name || "Member";

  return (
    <div className="max-w-xl mx-auto space-y-3 pb-4 select-none">
      {/* MEMBER HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3.5 sm:px-4 sm:py-3 rounded-xl border border-indigo-900/40 shadow-md text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            {fullNameDisplay ? fullNameDisplay[0].toUpperCase() : "M"}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-tight truncate">{fullNameDisplay}</h1>
            <p className="text-[11px] text-indigo-200 leading-tight truncate">{formData.role} • {formData.email}</p>
          </div>
        </div>

        {userOverdueLoans.length > 0 ? (
          <div className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
            <AlertTriangle size={12} className="text-rose-400" />
            <span>{userOverdueLoans.length} Overdue</span>
          </div>
        ) : (
          <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span>Active Account</span>
          </div>
        )}
      </div>

      {userOverdueLoans.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center justify-between text-rose-900 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <p className="text-[11px] text-rose-800 font-semibold leading-none">
              Overdue Alert: You have <strong>{userOverdueLoans.length}</strong> unreturned book(s). Please return them promptly.
            </p>
          </div>
        </div>
      )}

      {/* READ-ONLY MEMBER DETAILS MATCHING SAMPLE PICTURE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-2.5 flex items-center gap-2 text-white border-b border-indigo-900/40">
          <User size={15} className="text-indigo-400" />
          <h2 className="font-bold text-white tracking-tight text-xs">Member Information</h2>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {/* First Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">First Name</label>
            <input
              type="text"
              value={formData.first_name}
              disabled
              readOnly
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 font-medium cursor-not-allowed select-text"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              disabled
              readOnly
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 font-medium cursor-not-allowed select-text"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              disabled
              readOnly
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 font-medium cursor-not-allowed select-text"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role</label>
            <select
              value={formData.role}
              disabled
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 font-medium cursor-not-allowed appearance-none"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Member">Member</option>
            </select>
          </div>

          {/* Account Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account Status</label>
            <select
              value={formData.status}
              disabled
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 font-medium cursor-not-allowed appearance-none capitalize"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}