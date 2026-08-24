import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import AdminLayout from "../views/layouts/AdminLayout";
import LibrarianLayout from "../views/layouts/LibrarianLayout";
import MemberLayout from "../views/layouts/MemberLayout";

// Auth / Public
import LoginView from "../views/pages/auth/LoginView";
import PublicDashboardView from "../views/pages/public/PublicDashboardView";

// Admin Views
import DashboardView from "../views/pages/admin/DashboardView";
import ManageBooksView from "../views/pages/admin/ManageBooksView";
import ManageUsersView from "../views/pages/admin/ManageMemberView";
import RegisterUsersView from "../views/pages/admin/RegisterMemberView";
import RegisterLibrarianView from "../views/pages/admin/RegisterLibrarianView";
import ManageLibrarianView from "../views/pages/admin/ManageLibrarianView";
import IssueBookView from "../views/pages/admin/IssueBookView";
import ReturnBookView from "../views/pages/admin/ReturnBookView";
import IssuedBooksView from "../views/pages/admin/IssuedBooksView";
import ReportsView from "../views/pages/admin/ReportsView";
import SettingsView from "../views/pages/admin/SettingsView";

// Librarian Views
import LibrarianDashboardView from "../views/pages/admin/LibrarianDashboardView";

// Member Views
import MemberDashboardView from "../views/pages/member/MemberDashboardView";
import MemberSearchBooksView from "../views/pages/member/MemberSearchBooksView";
import MemberMyBooksView from "../views/pages/member/MemberMyBooksView";
import MemberProfileView from "../views/pages/member/MemberProfileView";

/**
 * Check whether the current user's role
 * is allowed to access a route.
 */
function isRoleAllowed(userRole, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  const normUserRole = String(userRole).toLowerCase().trim();
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).toLowerCase().trim()
  );

  if (normUserRole.includes("admin")) {
    return true;
  }

  if (normUserRole.includes("librarian")) {
    return normalizedAllowedRoles.some((role) =>
      role.includes("librarian")
    );
  }

  if (
    normUserRole.includes("student") ||
    normUserRole.includes("teacher") ||
    normUserRole.includes("member")
  ) {
    return normalizedAllowedRoles.some((role) =>
      ["member", "student", "teacher", "user"].includes(role)
    );
  }

  return normalizedAllowedRoles.includes(normUserRole);
}

/**
 * Protected route wrapper.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isRoleAllowed(user?.role, allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Unified dashboard.
 */
function UnifiedDashboardWrapper() {
  const { user: authUser } = useAuth();
  let storedUser = null;

  try {
    storedUser =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(localStorage.getItem("lms_user") || "null");
  } catch (error) {
    console.error("Failed to parse stored user:", error);
  }

  const user = authUser || storedUser;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user?.role || "")
    .toLowerCase()
    .trim();

  if (userRole.includes("librarian")) {
    return (
      <LibrarianLayout>
        <LibrarianDashboardView />
      </LibrarianLayout>
    );
  }

  if (
    userRole.includes("student") ||
    userRole.includes("teacher") ||
    userRole.includes("member")
  ) {
    return (
      <MemberLayout>
        <MemberDashboardView />
      </MemberLayout>
    );
  }

  return (
    <AdminLayout>
      <DashboardView />
    </AdminLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* =========================================================
          PUBLIC ROUTES
      ========================================================= */}

      <Route path="/" element={<Navigate to="/public-dashboard" replace />} />
      <Route path="/public-dashboard" element={<PublicDashboardView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/dashboard" element={<UnifiedDashboardWrapper />} />

      {/* =========================================================
          ADMIN TOP-LEVEL ROUTES
      ========================================================= */}

      {/* Manage Books */}
      <Route
        path="/manage"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManageBooksView />} />
      </Route>

      {/* Manage Users */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManageUsersView />} />
      </Route>

      {/* Manage Librarians */}
      <Route
        path="/librarians"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManageLibrarianView />} />
      </Route>

      {/* Issue Book */}
      <Route
        path="/issue"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IssueBookView />} />
      </Route>

      {/* Return Book */}
      <Route
        path="/return"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReturnBookView />} />
      </Route>

      {/* Issued Books */}
      <Route
        path="/issued"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IssuedBooksView />} />
      </Route>

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReportsView />} />
      </Route>

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SettingsView />} />
      </Route>

      {/* =========================================================
          LIBRARIAN TOP-LEVEL ROUTES (NO /librarian PREFIX)
      ========================================================= */}

      {/* Manage Books (Librarian) */}
      <Route
        path="/manage-lib"
        element={
          <ProtectedRoute allowedRoles={["Librarian", "Admin"]}>
            <LibrarianLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManageBooksView />} />
      </Route>

      {/* Issue Book (Librarian) */}
      <Route
        path="/issue-lib"
        element={
          <ProtectedRoute allowedRoles={["Librarian", "Admin"]}>
            <LibrarianLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IssueBookView />} />
      </Route>

      {/* Return Book (Librarian) */}
      <Route
        path="/return-lib"
        element={
          <ProtectedRoute allowedRoles={["Librarian", "Admin"]}>
            <LibrarianLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReturnBookView />} />
      </Route>

      {/* Issued Books (Librarian) */}
      <Route
        path="/issued-lib"
        element={
          <ProtectedRoute allowedRoles={["Librarian", "Admin"]}>
            <LibrarianLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IssuedBooksView />} />
      </Route>

      {/* Reports (Librarian) */}
      <Route
        path="/reports-lib"
        element={
          <ProtectedRoute allowedRoles={["Librarian", "Admin"]}>
            <LibrarianLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReportsView />} />
      </Route>

      {/* =========================================================
          MEMBER TOP-LEVEL ROUTES (NO /member PREFIX)
      ========================================================= */}

      {/* Search Books */}
      <Route
        path="/search"
        element={
          <ProtectedRoute allowedRoles={["Member", "Student", "Teacher", "Admin"]}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberSearchBooksView />} />
      </Route>

      {/* My Borrowed Books */}
      <Route
        path="/my-books"
        element={
          <ProtectedRoute allowedRoles={["Member", "Student", "Teacher", "Admin"]}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberMyBooksView />} />
      </Route>

      {/* My Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["Member", "Student", "Teacher", "Admin"]}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberProfileView />} />
      </Route>

      {/* =========================================================
          ADMIN BACKWARD-COMPATIBLE REDIRECTS
      ========================================================= */}

      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/books/manage" element={<Navigate to="/manage" replace />} />
      <Route path="/admin/users/register" element={<RegisterUsersView />} />
      <Route path="/admin/users/manage" element={<Navigate to="/users" replace />} />
      <Route path="/admin/students/register" element={<Navigate to="/admin/users/register" replace />} />
      <Route path="/admin/students/manage" element={<Navigate to="/users" replace />} />
      <Route path="/admin/librarians/register" element={<RegisterLibrarianView />} />
      <Route path="/admin/librarians/manage" element={<Navigate to="/librarians" replace />} />
      <Route path="/admin/transactions/issue" element={<Navigate to="/issue" replace />} />
      <Route path="/admin/transactions/return" element={<Navigate to="/return" replace />} />
      <Route path="/admin/transactions/issued" element={<Navigate to="/issued" replace />} />
      <Route path="/admin/reports" element={<Navigate to="/reports" replace />} />
      <Route path="/admin/settings" element={<Navigate to="/settings" replace />} />

      {/* =========================================================
          LIBRARIAN BACKWARD-COMPATIBLE REDIRECTS
      ========================================================= */}

      <Route path="/librarian" element={<Navigate to="/dashboard" replace />} />
      <Route path="/librarian/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/librarian/manage-lib" element={<Navigate to="/manage-lib" replace />} />
      <Route path="/librarian/manage" element={<Navigate to="/manage-lib" replace />} />
      <Route path="/librarian/books/manage" element={<Navigate to="/manage-lib" replace />} />
      <Route path="/librarian/issue-lib" element={<Navigate to="/issue-lib" replace />} />
      <Route path="/librarian/issue" element={<Navigate to="/issue-lib" replace />} />
      <Route path="/librarian/transactions/issue" element={<Navigate to="/issue-lib" replace />} />
      <Route path="/librarian/return-lib" element={<Navigate to="/return-lib" replace />} />
      <Route path="/librarian/return" element={<Navigate to="/return-lib" replace />} />
      <Route path="/librarian/transactions/return" element={<Navigate to="/return-lib" replace />} />
      <Route path="/librarian/issued-lib" element={<Navigate to="/issued-lib" replace />} />
      <Route path="/librarian/issued" element={<Navigate to="/issued-lib" replace />} />
      <Route path="/librarian/transactions/issued" element={<Navigate to="/issued-lib" replace />} />
      <Route path="/librarian/reports-lib" element={<Navigate to="/reports-lib" replace />} />
      <Route path="/librarian/reports" element={<Navigate to="/reports-lib" replace />} />

      {/* =========================================================
          MEMBER BACKWARD-COMPATIBLE REDIRECTS
      ========================================================= */}

      <Route path="/member" element={<Navigate to="/dashboard" replace />} />
      <Route path="/member/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/member/search" element={<Navigate to="/search" replace />} />
      <Route path="/member/my-books" element={<Navigate to="/my-books" replace />} />
      <Route path="/member/profile" element={<Navigate to="/profile" replace />} />

      {/* =========================================================
          USER ALIAS REDIRECTS
      ========================================================= */}

      <Route path="/user" element={<Navigate to="/dashboard" replace />} />
      <Route path="/user/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/user/search" element={<Navigate to="/search" replace />} />
      <Route path="/user/my-books" element={<Navigate to="/my-books" replace />} />
      <Route path="/user/profile" element={<Navigate to="/profile" replace />} />

      {/* =========================================================
          FALLBACK ROUTE
      ========================================================= */}

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}