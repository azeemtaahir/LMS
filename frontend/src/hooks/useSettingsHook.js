import { useState } from "react";

export const useSettingsHook = () => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [profileData, setProfileData] = useState({
    name: "Admin",
    email: "admin@library.com",
    phone: "1234567890",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [libraryInfo, setLibraryInfo] = useState({
    libraryName: "Central University Library",
    address: "123 University Campus, Education Block",
    contactEmail: "contact@library.edu",
    maxIssueLimit: 5,
    issuePeriodDays: 14,
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert("Admin Profile updated successfully!");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return {
    activeTab,
    setActiveTab,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    libraryInfo,
    setLibraryInfo,
    handleProfileSubmit,
    handlePasswordSubmit,
  };
};

export const useSettingsController = useSettingsHook;
