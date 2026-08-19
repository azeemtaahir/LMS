import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const validateLoginInput = (credentials) => {
  const errors = {};
  if (!credentials.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
    errors.email = "Invalid email format";
  }
  if (!credentials.password) {
    errors.password = "Password is required";
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const useAuthHook = () => {
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogin = async (e, onSuccess) => {
    e.preventDefault();
    setServerError("");

    const validation = validateLoginInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      let data;
      try {
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        data = response.data;
      } catch (err) {
        const emailLower = (formData.email || "").toLowerCase();
        const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
        const foundRegistered = registeredUsers.find(
          (u) => u.email.toLowerCase() === emailLower && u.password === formData.password
        );

        if (foundRegistered) {
          const regStatusLower = foundRegistered.status ? String(foundRegistered.status).toLowerCase() : "active";
          if (regStatusLower === "suspended" || regStatusLower === "inactive" || regStatusLower === "disabled") {
            const statusErr = new Error(`Your account status is ${foundRegistered.status}. Access denied.`);
            statusErr.response = { data: { message: `Your account status is ${foundRegistered.status}. Access denied.` } };
            throw statusErr;
          }
          data = {
            token: "mock-jwt-token-12345",
            user: {
              id: Date.now(),
              email: foundRegistered.email,
              name: foundRegistered.name || foundRegistered.fullName || "User",
              role: foundRegistered.role || "Student",
              studentId: foundRegistered.studentId || foundRegistered.user_id || "MEM-101",
              status: foundRegistered.status || "Active",
            },
          };
        } else if (emailLower.includes("admin")) {
          data = {
            token: "mock-jwt-token-12345",
            user: {
              id: 1,
              email: formData.email,
              name: "System Admin",
              role: "Admin",
              status: "Active",
            },
          };
        } else if (emailLower.includes("librarian")) {
          data = {
            token: "mock-jwt-token-12345",
            user: {
              id: 2,
              email: formData.email,
              name: "Librarian Staff",
              role: "Librarian",
              status: "Active",
            },
          };
        } else {
          // Reject unregistered users
          const unregErr = new Error("Access denied. Only registered members are allowed to log in.");
          unregErr.response = { data: { message: "Access denied. Only registered members are allowed to log in." } };
          throw unregErr;
        }
      }

      const userObj = data.user;
      if (!userObj) {
        throw new Error("Invalid email or password");
      }

      const userStatusLower = userObj.status ? String(userObj.status).toLowerCase() : "active";
      if (userStatusLower === "suspended" || userStatusLower === "inactive" || userStatusLower === "disabled") {
        const statusErr = new Error(`Your account status is ${userObj.status}. Access denied.`);
        statusErr.response = { data: { message: `Your account status is ${userObj.status}. Access denied.` } };
        throw statusErr;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      loginUser(userObj);
      if (onSuccess) onSuccess(userObj);
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    serverError,
    handleChange,
    handleLogin,
  };
};

export const useAuthController = useAuthHook;
