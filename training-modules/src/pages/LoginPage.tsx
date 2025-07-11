import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [institution, setInstitution] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup, isAuthenticated, currentUser } = useAuth();

  // Monitor authentication state changes
  useEffect(() => {
    console.log("🔧 LoginPage: Auth state changed", {
      isAuthenticated,
      currentUser: currentUser?.name || null
    });
    
    if (isAuthenticated) {
      console.log("✅ LoginPage: User is now authenticated, App should redirect soon...");
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!username || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && !name) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      let result;

      if (isLogin) {
        console.log("🔐 LoginPage: Attempting login for:", username);
        result = await login(username, password);
      } else {
        console.log("📝 LoginPage: Attempting signup for:", username);
        result = await signup(username, password, name, role, institution);
      }

      if (result.success) {
        console.log("✅ LoginPage: Auth successful, waiting for App.tsx to redirect...");
        // Keep form in submitting state until redirect happens
        // setIsSubmitting(false); // Don't reset this - let the redirect handle it
      } else {
        setError(result.error || "Authentication failed");
        console.log("❌ LoginPage: Auth failed:", result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("❌ LoginPage: Auth error:", err);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setRole("");
    setInstitution("");
  };

  return (
    <div className="min-h-screen bg-[#E5EDF8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">PaceSim</h1>
          <p className="text-gray-600">
            External Pacemaker Simulation Platform
          </p>
        </div>

        <div className="bg-white px-8 py-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Sign In" : "Sign Up"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email/Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email or username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                    required={!isLogin}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                    required={!isLogin}
                  >
                    <option value="">Select your role</option>

                    <option disabled className="text-gray-500">— Administrative Roles —</option>
                    <option value="Head Nurse">Head Nurse</option>
                    <option value="Nursing Supervisor">Nursing Supervisor</option>

                    <option disabled className="text-gray-500">— Nursing Staff —</option>
                    <option value="Nursing Student">Nursing Student</option>
                    <option value="Staff Nurse">Staff Nurse</option>
                    <option value="Charge Nurse">Charge Nurse</option>

                    <option disabled className="text-gray-500">— Other Healthcare —</option>
                    <option value="other">Other Medical Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Enter your institution"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                  required={!isLogin}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? isLogin
                  ? "Signing In..."
                  : "Signing Up..."
                : isLogin
                ? "Sign In"
                : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isSubmitting}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Security: Passwords are hashed with bcrypt
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          © 2025 PaceSim. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;