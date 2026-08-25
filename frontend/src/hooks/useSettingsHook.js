import { useState, useEffect } from "react";
import api from "../api/api";

export const useSettingsHook = () => {
  // =========================
  // STATE
  // =========================
  const [activeTab, setActiveTab] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [profileData, setProfileData] = useState({
    name: "Super Admin",
    email: "admin@library.com",
    phone: "+92 300 1234567",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [libraryInfo, setLibraryInfo] = useState({
    library_name: "Central University Library",
    library_address: "123 University Campus, Education Block",
    library_email: "contact@library.edu",
    max_issue_limit: "5",
    issue_period_days: "14",
    fine_per_week: "500",
  });

  const [preferences, setPreferences] = useState({
    email_notifications: "true",
    auto_fine_calc: "true",
    theme: "light",
    language: "English",
  });

  const [dbStats, setDbStats] = useState({
    connected: true,
    dbName: "library_db",
    dbHost: "localhost",
    dbPort: 5432,
    dbUser: "postgres",
    tableCounts: {
      users: 0,
      member: 0,
      book: 0,
      loan: 0,
      fine: 0,
      fine_payment: 0,
    },
    status: "Healthy & Connected",
  });

  // =========================
  // FETCH SETTINGS
  // =========================
  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        // Loading starts before the API request
        if (isMounted) {
          setLoading(true);
        }

        const response = await api.get("/settings");

        if (!isMounted) return;

        if (response.data.success) {
          const {
            settings,
            dbStats: stats,
            adminProfile,
          } = response.data;

          // -------------------------
          // Admin Profile
          // -------------------------
          if (adminProfile) {
            setProfileData((prev) => ({
              ...prev,
              ...adminProfile,
            }));
          }

          // -------------------------
          // Library Settings
          // -------------------------
          if (settings) {
            setLibraryInfo({
              library_name:
                settings.library_name ||
                "Central University Library",

              library_address:
                settings.library_address ||
                "123 University Campus, Education Block",

              library_email:
                settings.library_email ||
                "contact@library.edu",

              max_issue_limit:
                settings.max_issue_limit || "5",

              issue_period_days:
                settings.issue_period_days || "14",

              fine_per_week:
                settings.fine_per_week || "500",
            });

            // -------------------------
            // Preferences
            // -------------------------
            setPreferences({
              email_notifications:
                settings.email_notifications || "true",

              auto_fine_calc:
                settings.auto_fine_calc || "true",

              theme:
                settings.theme || "light",

              language:
                settings.language || "English",
            });
          }

          // -------------------------
          // Database Statistics
          // -------------------------
          if (stats) {
            setDbStats(stats);
          }
        }
      } catch (err) {
        console.warn(
          "Could not load backend settings, using local defaults:",
          err.message
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, []);

  // =========================
  // PROFILE
  // =========================
  const handleProfileSubmit = async (e) => {
    if (e) e.preventDefault();

    setSaving(true);
    setMessage({
      type: "",
      text: "",
    });

    try {
      await api.put("/settings", {
        admin_name: profileData.name,
        admin_email: profileData.email,
        admin_phone: profileData.phone,
      });

      setMessage({
        type: "success",
        text: "Admin profile updated successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // PASSWORD
  // =========================
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validate passwords
    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "New passwords do not match!",
      });

      return;
    }

    setSaving(true);
    setMessage({
      type: "",
      text: "",
    });

    try {
      const res = await api.post("/settings/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({
        type: "success",
        text:
          res.data.message ||
          "Password changed successfully!",
      });

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to change password.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LIBRARY INFORMATION
  // =========================
  const handleLibraryInfoSubmit = async (e) => {
    if (e) e.preventDefault();

    setSaving(true);
    setMessage({
      type: "",
      text: "",
    });

    try {
      await api.put("/settings", libraryInfo);

      setMessage({
        type: "success",
        text:
          "Library information and policies saved to database!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to save library settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // PREFERENCES
  // =========================
  const handlePreferencesSubmit = async (e) => {
    if (e) e.preventDefault();

    setSaving(true);
    setMessage({
      type: "",
      text: "",
    });

    try {
      await api.put("/settings", preferences);

      setMessage({
        type: "success",
        text:
          "System preferences updated in database!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to update preferences.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // TEST DATABASE
  // =========================
  const handleTestDatabase = async () => {
    setSaving(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const res = await api.post("/settings/test-db");

      if (res.data.success) {
        setDbStats(res.data.dbStats);

        setMessage({
          type: "success",
          text: "PostgreSQL database connected & healthy!",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          "Failed to connect to database: " +
          err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // BACKUP DATABASE
  // =========================
  const handleBackupDatabase = async () => {
    setSaving(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const res = await api.post("/settings/backup");

      if (res.data.success) {
        setMessage({
          type: "success",
          text:
            res.data.message ||
            "Database backup snapshot generated!",
        });

        // Refresh settings after backup
        // We can simply request the endpoint again.
        try {
          const response = await api.get("/settings");

          if (response.data.success) {
            const {
              settings,
              dbStats: stats,
              adminProfile,
            } = response.data;

            if (adminProfile) {
              setProfileData((prev) => ({
                ...prev,
                ...adminProfile,
              }));
            }

            if (settings) {
              setLibraryInfo({
                library_name:
                  settings.library_name ||
                  "Central University Library",

                library_address:
                  settings.library_address ||
                  "123 University Campus, Education Block",

                library_email:
                  settings.library_email ||
                  "contact@library.edu",

                max_issue_limit:
                  settings.max_issue_limit || "5",

                issue_period_days:
                  settings.issue_period_days || "14",

                fine_per_week:
                  settings.fine_per_week || "500",
              });

              setPreferences({
                email_notifications:
                  settings.email_notifications || "true",

                auto_fine_calc:
                  settings.auto_fine_calc || "true",

                theme:
                  settings.theme || "light",

                language:
                  settings.language || "English",
              });
            }

            if (stats) {
              setDbStats(stats);
            }
          }
        } catch (refreshError) {
          console.warn(
            "Backup succeeded but settings refresh failed:",
            refreshError.message
          );
        }
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          "Backup operation failed: " +
          err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // RETURN
  // =========================
  return {
    activeTab,
    setActiveTab,

    loading,

    saving,

    message,
    setMessage,

    profileData,
    setProfileData,

    passwordData,
    setPasswordData,

    libraryInfo,
    setLibraryInfo,

    preferences,
    setPreferences,

    dbStats,

    handleProfileSubmit,
    handlePasswordSubmit,
    handleLibraryInfoSubmit,
    handlePreferencesSubmit,
    handleTestDatabase,
    handleBackupDatabase,
  };
};

// Alias
export const useSettingsController = useSettingsHook;