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
  // No role restrictions
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // No logged-in user role
  if (!userRole) {
    return false;
  }

  const normUserRole = String(userRole).toLowerCase().trim();

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).toLowerCase().trim()
  );

  // Admin has full access
  if (normUserRole.includes("admin")) {
    return true;
  }

  // Librarian access
  if (normUserRole.includes("librarian")) {
    return normalizedAllowedRoles.some((role) =>
      role.includes("librarian")
    );
  }

  // Member / Student / Teacher access
  if (
    normUserRole.includes("student") ||
    normUserRole.includes("teacher") ||
    normUserRole.includes("member")
  ) {
    return normalizedAllowedRoles.some((role) =>
      ["member", "student", "teacher", "user"].includes(role)
    );
  }

  // Exact role matching
  return normalizedAllowedRoles.includes(normUserRole);
}

/**
 * Protected route wrapper.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User does not have permission
  if (!isRoleAllowed(user?.role, allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Unified dashboard.
 *
 * Determines which dashboard/layout should be displayed
 * based on the currently authenticated user's role.
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

  // No authenticated user
  if (!user) {
    return <PublicDashboardView />;
  }

  const userRole = String(user?.role || "")
    .toLowerCase()
    .trim();

  // Librarian dashboard
  if (userRole.includes("librarian")) {
    return (
      <LibrarianLayout>
        <LibrarianDashboardView />
      </LibrarianLayout>
    );
  }

  // Member / Student / Teacher dashboard
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

  // Admin dashboard
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

      <Route path="/" element={<PublicDashboardView />} />

      <Route path="/login" element={<LoginView />} />

      {/* Unified dashboard based on user role */}
      <Route path="/dashboard" element={<UnifiedDashboardWrapper />} />

      {/* =========================================================
          ADMIN ROUTES
      ========================================================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* /admin */}
        <Route
          index
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* Dashboard */}
        <Route
          path="dashboard"
          element={<DashboardView />}
        />

        {/* Books */}
        <Route
          path="books/manage"
          element={<ManageBooksView />}
        />

        {/* Users / Members */}
        <Route
          path="users/manage"
          element={<ManageUsersView />}
        />

        {/* Backward-compatible students route */}
        <Route
          path="students/manage"
          element={
            <Navigate
              to="/admin/users/manage"
              replace
            />
          }
        />

        {/* Librarians */}
        <Route
          path="librarians/register"
          element={<RegisterLibrarianView />}
        />

        <Route
          path="librarians/manage"
          element={<ManageLibrarianView />}
        />

        {/* Transactions */}
        <Route
          path="transactions/issue"
          element={<IssueBookView />}
        />

        <Route
          path="transactions/return"
          element={<ReturnBookView />}
        />

        <Route
          path="transactions/issued"
          element={<IssuedBooksView />}
        />

        {/* Reports */}
        <Route
          path="reports"
          element={<ReportsView />}
        />

        {/* Settings */}
        <Route
          path="settings"
          element={<SettingsView />}
        />
      </Route>

      {/* =========================================================
          LIBRARIAN ROUTES
      ========================================================= */}

      <Route
        path="/librarian"
        element={
          <ProtectedRoute allowedRoles={["Librarian", "Admin"]}>
            <LibrarianLayout />
          </ProtectedRoute>
        }
      >
        {/* /librarian */}
        <Route
          index
          element={
            <Navigate
              to="/librarian/dashboard"
              replace
            />
          }
        />

        {/* Dashboard */}
        <Route
          path="dashboard"
          element={<LibrarianDashboardView />}
        />

        {/* Books */}
        <Route
          path="books/manage"
          element={<ManageBooksView />}
        />

        {/* Transactions */}
        <Route
          path="transactions/issue"
          element={<IssueBookView />}
        />

        <Route
          path="transactions/return"
          element={<ReturnBookView />}
        />

        <Route
          path="transactions/issued"
          element={<IssuedBooksView />}
        />

        {/* Reports */}
        <Route
          path="reports"
          element={<ReportsView />}
        />
      </Route>

      {/* =========================================================
          MEMBER / STUDENT / TEACHER ROUTES
      ========================================================= */}

      <Route
        path="/member"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Member",
              "Student",
              "Teacher",
              "Admin",
            ]}
          >
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        {/* /member */}
        <Route
          index
          element={
            <Navigate
              to="/member/dashboard"
              replace
            />
          }
        />

        {/* Dashboard */}
        <Route
          path="dashboard"
          element={<MemberDashboardView />}
        />

        {/* Search Books */}
        <Route
          path="search"
          element={<MemberSearchBooksView />}
        />

        {/* My Books */}
        <Route
          path="my-books"
          element={<MemberMyBooksView />}
        />

        {/* Profile */}
        <Route
          path="profile"
          element={<MemberProfileView />}
        />
      </Route>

      {/* =========================================================
          USER ALIAS ROUTES
      ========================================================= */}

      {/* /user -> unified dashboard */}
      <Route
        path="/user"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* /user/dashboard -> unified dashboard */}
      <Route
        path="/user/dashboard"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* /user/search -> member search */}
      <Route
        path="/user/search"
        element={<Navigate to="/member/search" replace />}
      />

      {/* /user/my-books -> member books */}
      <Route
        path="/user/my-books"
        element={<Navigate to="/member/my-books" replace />}
      />

      {/* /user/profile -> member profile */}
      <Route
        path="/user/profile"
        element={<Navigate to="/member/profile" replace />}
      />

      {/* =========================================================
          FALLBACK ROUTE
      ========================================================= */}

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}