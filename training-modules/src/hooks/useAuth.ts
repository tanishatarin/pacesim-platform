import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import db from "../lib/db";
import type { User } from "../lib/db";

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user - FIX: Use the correct localStorage key
    const savedUserId = localStorage.getItem("pacesim_currentUserId"); // Changed key to avoid conflicts

    if (savedUserId) {
      console.log("🔍 Checking for saved user:", savedUserId);

      try {
        db.read();
        const user = db.data?.users?.find((u) => u.id === savedUserId);

        if (user) {
          console.log("✅ Found saved user:", user.name);
          // Update last login
          user.lastLogin = new Date().toISOString();
          db.write();
          setCurrentUser(user);
        } else {
          console.log(
            "❌ Saved user not found in database, clearing localStorage",
          );
          localStorage.removeItem("pacesim_currentUserId");
        }
      } catch (error) {
        console.error("Error loading saved user:", error);
        localStorage.removeItem("pacesim_currentUserId");
      }
    } else {
      console.log("🆕 No saved user found");
    }

    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      db.read();

      // Find existing user by email/username
      const existingUser = db.data?.users?.find(
        (u) => u.email === username || u.name === username,
      );

      if (!existingUser) {
        return {
          success: false,
          error: "User not found. Please sign up first.",
        };
      }

      // Check password
      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.passwordHash,
      );

      if (!passwordMatch) {
        return {
          success: false,
          error: "Incorrect password. Please try again.",
        };
      }

      // Password is correct - log them in
      existingUser.lastLogin = new Date().toISOString();
      db.write();
      setCurrentUser(existingUser);

      // FIX: Use consistent localStorage key
      localStorage.setItem("pacesim_currentUserId", existingUser.id);

      console.log("✅ Login successful for user:", existingUser.name);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Something went wrong during login." };
    }
  };

  const signup = async (
    username: string,
    password: string,
    name?: string,
    role?: string,
    institution?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      db.read();

      // Check if user already exists
      const existingUser = db.data?.users?.find(
        (u) => u.email === username || u.name === username,
      );
      if (existingUser) {
        return {
          success: false,
          error: "User with this email already exists. Please sign in instead.",
        };
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser: User = {
        id: uuidv4(),
        name: name || username.split("@")[0] || username,
        email: username,
        passwordHash,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: role || "Medical Student",
        institution: institution || "Johns Hopkins Hospital",
      };

      db.data!.users.push(newUser);
      db.write();
      setCurrentUser(newUser);

      // FIX: Use consistent localStorage key
      localStorage.setItem("pacesim_currentUserId", newUser.id);

      console.log("✅ Signup successful for user:", newUser.name);
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Something went wrong during signup." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    // FIX: Clear the correct localStorage key
    localStorage.removeItem("pacesim_currentUserId");
  };

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    signup,
    logout,
  };
};
