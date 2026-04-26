"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await authFetch("/api/admin/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await authFetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordSuccess("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;

    if (avatarFile.size > 2 * 1024 * 1024) {
      setAvatarError("File size must be less than 2MB");
      return;
    }

    setUploadingAvatar(true);
    setAvatarError("");
    setAvatarSuccess("");

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const response = await authFetch("/api/admin/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAvatarSuccess("Avatar uploaded successfully");
        setAvatarFile(null);
        setAvatarPreview("");
        // Refresh user data to get updated avatar
        const userResponse = await authFetch("/api/admin/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        }
        setTimeout(() => setAvatarSuccess(""), 3000);
      } else {
        setAvatarError(data.error || "Failed to upload avatar");
      }
    } catch (error) {
      setAvatarError("An error occurred. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-lg font-medium text-gray-500 dark:text-gray-300 animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account settings and password
        </p>
      </div>

      {/* Avatar Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Picture
        </h2>
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              {avatarPreview || user?.avatar ? (
                <img
                  src={avatarPreview || user?.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="/images/user/owner.jpg"
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label
                htmlFor="avatar"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload New Picture
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                    setAvatarError("");
                  }
                }}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recommended: Square image, at least 200x200px. Max size: 2MB.
            </p>
            {avatarFile && (
              <div className="flex gap-2">
                <button
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingAvatar ? "Uploading..." : "Save Picture"}
                </button>
                <button
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            {avatarError && (
              <p className="text-sm text-red-600">{avatarError}</p>
            )}
            {avatarSuccess && (
              <p className="text-sm text-green-600">{avatarSuccess}</p>
            )}
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <p className="text-gray-900 dark:text-white">{user?.name || "Admin User"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <p className="text-gray-900 dark:text-white">{user?.email || "admin@samanprefab.com"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h2>

        {passwordSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600">{passwordSuccess}</p>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{passwordError}</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="h-11 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {changingPassword ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
