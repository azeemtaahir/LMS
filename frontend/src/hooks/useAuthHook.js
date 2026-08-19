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
          if (regStatusLower === "inactive" || regStatusLower === "pending") {
            const statusErr = new Error("Your account is inactive or pending approval by an admin.");
            statusErr.response = { data: { message: "Your account is inactive or pending approval by an admin." } };
            throw statusErr;
          }
          data = {
            token: "mock-jwt-token-12345",
            user: {
              id: Date.now(),
              email: foundRegistered.email,
              name: foundRegistered.name,
              role: foundRegistered.role || "Librarian",
              studentId: foundRegistered.studentId || "LIB-101",
              department: "Library Staff",
              status: foundRegistered.status || "Active",
            },
          };
        } else {
          let role = "Admin";
          let name = "";
          const emailPrefix = formData.email ? formData.email.split("@")[0] : "User";
          const formattedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          if (emailLower.includes("librarian")) {
            role = "Librarian";
            name = formattedName || "Librarian";
          } else if (emailLower.includes("teacher") || emailLower.includes("faculty")) {
            role = "Teacher";
            name = formattedName || "Teacher";
          } else if (emailLower.includes("student") || emailLower.includes("member")) {
            role = "Student";
            name = formattedName || "Student";
          } else {
            role = "Admin";
            name = formattedName || "Admin";
          }
          data = {
            token: "mock-jwt-token-12345",
            user: {
              id: Date.now(),
              email: formData.email,
              name,
              role,
              studentId: "",
              department: "",
              status: "Active",
            },
          };
        }
      }

      const userObj = data.user || { email: formData.email, name: "Admin", role: "Admin", status: "Active" };

      const userStatusLower = userObj.status ? String(userObj.status).toLowerCase() : "active";
      if (userStatusLower === "inactive" || userStatusLower === "pending") {
        const statusErr = new Error("Your account is inactive or pending approval by an admin.");
        statusErr.response = { data: { message: "Your account is inactive or pending approval by an admin." } };
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
