import React, { useState, useEffect } from "react";
import CuteApologyApp from "./CuteApology.jsx";
import PersonalizedView from "./components/PersonalizedView.jsx";
import AdminLogin from "./components/Admin/AdminLogin.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import { platformApi } from "./lib/supabase.js";
import { Lock } from "lucide-react";

function parseCurrentRoute() {
  if (typeof window === "undefined") {
    return { type: "home" };
  }

  const path = window.location.pathname || "";
  const hash = window.location.hash || "";
  const search = window.location.search || "";

  // 1. Admin route detection
  if (
    path.startsWith("/admin") ||
    hash.startsWith("#/admin") ||
    hash.startsWith("#admin") ||
    search.includes("admin=true")
  ) {
    return { type: "admin" };
  }

  // 2. Personalized link slug detection (/p/:slug or #/p/:slug)
  if (path.startsWith("/p/")) {
    const slug = path.replace("/p/", "").split("/")[0].split("?")[0];
    if (slug) {
      return { type: "personalized", slug };
    }
  }

  if (hash.startsWith("#/p/")) {
    const slug = hash.replace("#/p/", "").split("/")[0].split("?")[0];
    if (slug) {
      return { type: "personalized", slug };
    }
  }

  // 3. Default to public home (Cute Apology Website with dynamic ?from= & ?to= support)
  return { type: "home" };
}

export default function App() {
  const [route, setRoute] = useState(() => parseCurrentRoute());
  const [session, setSession] = useState(null);
  const [sessionChecking, setSessionChecking] = useState(true);

  // Monitor URL route changes
  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(parseCurrentRoute());
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  // Check admin session
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const currentSession = await platformApi.getSession();
        if (isMounted) {
          setSession(currentSession);
          setSessionChecking(false);
        }
      } catch (e) {
        if (isMounted) setSessionChecking(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await platformApi.signOut();
    setSession(null);
  };

  // Render Admin Route
  if (route.type === "admin") {
    if (sessionChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBF5F4]">
          <div className="w-8 h-8 border-3 border-[#EE95BB]/30 border-t-[#d84b5a] rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!session) {
      return <AdminLogin onLoginSuccess={(newSession) => setSession(newSession)} />;
    }

    return <AdminDashboard session={session} onLogout={handleLogout} />;
  }

  // Render Personalized Apology Route (/p/:slug)
  if (route.type === "personalized") {
    return <PersonalizedView slug={route.slug} />;
  }

  // Render Home Template (Original Cute Apology Website)
  return (
    <div className="relative">
      <CuteApologyApp />

      {/* Discreet Admin Quick-Access Shortcut Button in top-left */}
      <a
        href="/admin"
        title="Admin Portal"
        className="fixed top-3 left-3 z-50 p-2 rounded-full bg-white/70 hover:bg-white text-gray-400 hover:text-[#d84b5a] shadow-sm backdrop-blur-sm border border-[#f1dede] transition"
      >
        <Lock className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
