import React, { useState } from "react";
import { platformApi } from "../../lib/supabase.js";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const data = await platformApi.signIn(email, password);
      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(data.session || data);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF5F4] px-4 py-12 font-['Montserrat']">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#f1dede] relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#EE95BB]/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#d84b5a] to-[#EE95BB] flex items-center justify-center text-white shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Playfair_Display']">
            Platform Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Apology Templates & Personalized Links Management
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cutiepage.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EE95BB] focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EE95BB] focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#d84b5a] hover:bg-[#c33d4b] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                Sign In to Admin <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-700 transition"
          >
            ← Return to Live Website
          </a>
        </div>
      </div>
    </div>
  );
}
