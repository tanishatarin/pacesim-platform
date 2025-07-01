import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import db from "../lib/db";
import type { User } from "../lib/db";

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user
    const savedUserId = localStorage.getItem("currentUserId");
    if (savedUserId) {
      db.read();
      const user = db.data.users.find((u) => u.id === savedUserId);
      if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        db.write();
        setCurrentUser(user);
      } else {
        localStorage.removeItem("currentUserId");
      }
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
      const existingUser = db.data.users.find(
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
      localStorage.setItem("currentUserId", existingUser.id);

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
      const existingUser = db.data.users.find(
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

      db.data.users.push(newUser);
      db.write();
      setCurrentUser(newUser);
      localStorage.setItem("currentUserId", newUser.id);

      console.log("✅ Signup successful for user:", newUser.name);
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Something went wrong during signup." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUserId");
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