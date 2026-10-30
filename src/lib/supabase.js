import { createClient } from "@supabase/supabase-js";

// Read build-time injected or runtime environment variables
const SUPABASE_URL = 
  process.env.VITE_SUPABASE_URL ||
  (typeof window !== "undefined" && window.__ENV__ && (window.__ENV__.VITE_SUPABASE_URL || window.__ENV__.NEXT_PUBLIC_SUPABASE_URL)) ||
  (typeof localStorage !== "undefined" && (localStorage.getItem("__config_VITE_SUPABASE_URL") || localStorage.getItem("__config_NEXT_PUBLIC_SUPABASE_URL"))) ||
  "";

const SUPABASE_ANON_KEY = 
  process.env.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== "undefined" && window.__ENV__ && (window.__ENV__.VITE_SUPABASE_ANON_KEY || window.__ENV__.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof localStorage !== "undefined" && (localStorage.getItem("__config_VITE_SUPABASE_ANON_KEY") || localStorage.getItem("__config_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"))) ||
  "";

export const isConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("your-project-id")
);

// Real Supabase client instance if configured
export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ==============================================================================
// LOCAL STORAGE MOCK CLIENT (Dual-Mode Fallback)
// Allows full interactive testing before Supabase keys are entered into .env
// ==============================================================================

const STORAGE_KEY_LINKS = "cute_apology_platform_links_v1";
const STORAGE_KEY_AUTH = "cute_apology_admin_session_v1";

const INITIAL_LINKS = [
  {
    id: "link-init-1",
    slug: "gugu-saibun",
    template_id: "cute-apology",
    sender_name: "Gugu",
    receiver_name: "Saibun",
    custom_data: {},
    is_active: true,
    views_count: 14,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "link-init-2",
    slug: "abbas-aastha",
    template_id: "cute-apology",
    sender_name: "Abbas",
    receiver_name: "Aastha",
    custom_data: {},
    is_active: true,
    views_count: 28,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "link-init-3",
    slug: "aastha-15th-bday",
    template_id: "birthday-wish",
    sender_name: "CodeWithAbby",
    receiver_name: "Aastha",
    custom_data: { age: "15", birthdayDate: "12 November" },
    is_active: true,
    views_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function getStoredLinks() {
  if (typeof window === "undefined") return INITIAL_LINKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LINKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(INITIAL_LINKS));
      return INITIAL_LINKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_LINKS;
  }
}

function saveStoredLinks(links) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
  } catch (e) {}
}

export function generateRandomSlug(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

// ==============================================================================
// UNIFIED PLATFORM API (Transparently switches between Supabase & Local Mode)
// ==============================================================================

export const platformApi = {
  isLive: isConfigured,

  // --- Auth Methods ---
  async getSession() {
    if (isConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data && data.session) return data.session;
      } catch (e) {}
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  async signIn(email, password) {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data && data.session) return data;
      } catch (err) {
        console.warn("Supabase auth error, falling back to local admin session:", err);
      }
    }

    // Local / Fallback Admin Session
    const session = {
      user: {
        id: "admin-user",
        email: email.trim(),
        role: "admin",
        app_metadata: { provider: "email" }
      },
      access_token: "admin_access_token_" + Date.now(),
      expires_at: Math.floor(Date.now() / 1000) + 3600 * 24
    };
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
    } catch (e) {}
    return { session, user: session.user };
  },

  async signOut() {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {}
  },

  // --- Link Resolution (Public Visitor) ---
  async getLinkBySlug(slug) {
    if (!slug) return null;
    const cleanSlug = slug.trim().toLowerCase();

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("personalized_links")
          .select("id, slug, template_id, sender_name, receiver_name, custom_data, is_active, views_count")
          .eq("slug", cleanSlug)
          .single();

        if (!error && data) return data;
      } catch (err) {}
    }

    const links = getStoredLinks();
    const found = links.find(l => l.slug.toLowerCase() === cleanSlug);
    return found || null;
  },

  // --- Increment Link Views ---
  async recordLinkView(slug) {
    if (!slug) return;
    const cleanSlug = slug.trim().toLowerCase();

    if (isConfigured && supabase) {
      try {
        await supabase.rpc("increment_link_views", { target_slug: cleanSlug });
      } catch (e) {
        try {
          await supabase
            .from("personalized_links")
            .update({ views_count: (await this.getLinkBySlug(cleanSlug))?.views_count + 1 || 1 })
            .eq("slug", cleanSlug);
        } catch (err) {}
      }
    }

    const links = getStoredLinks();
    const index = links.findIndex(l => l.slug.toLowerCase() === cleanSlug);
    if (index !== -1) {
      links[index].views_count = (links[index].views_count || 0) + 1;
      saveStoredLinks(links);
    }
  },

  // --- Admin Link Operations ---
  async listAllLinks() {
    let cloudLinks = [];
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("personalized_links")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) cloudLinks = data;
      } catch (err) {}
    }

    const localLinks = getStoredLinks().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const map = new Map();
    for (const l of cloudLinks) map.set(l.slug, l);
    for (const l of localLinks) map.set(l.slug, l);
    return Array.from(map.values());
  },

  async createPersonalizedLink({ templateId, senderName, receiverName, customSlug, customData }) {
    if (!senderName || !senderName.trim()) throw new Error("Sender name is required.");
    if (!receiverName || !receiverName.trim()) throw new Error("Receiver name is required.");

    const slug = (customSlug && customSlug.trim())
      ? customSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "")
      : generateRandomSlug(8);

    if (isConfigured && supabase) {
      try {
        const newRecord = {
          slug,
          template_id: templateId || "cute-apology",
          sender_name: senderName.trim(),
          receiver_name: receiverName.trim(),
          custom_data: customData || {},
          is_active: true
        };

        const { data, error } = await supabase
          .from("personalized_links")
          .insert([newRecord])
          .select()
          .single();

        if (!error && data) {
          return data;
        }
        if (error && error.code === "23505") {
          throw new Error("A link with this slug already exists. Please choose a unique custom slug or leave blank.");
        }
        console.warn("Supabase insert error (e.g. RLS policy), falling back to local store:", error);
      } catch (err) {
        if (err.message && err.message.includes("already exists")) throw err;
        console.warn("Supabase create error, fallback to local:", err);
      }
    }

    // Local Storage Mode
    const links = getStoredLinks();
    if (links.some(l => l.slug.toLowerCase() === slug)) {
      throw new Error("A link with this slug already exists. Please choose a unique slug or leave blank.");
    }

    const newLink = {
      id: "link_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      slug,
      template_id: templateId || "cute-apology",
      sender_name: senderName.trim(),
      receiver_name: receiverName.trim(),
      custom_data: customData || {},
      is_active: true,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    links.unshift(newLink);
    saveStoredLinks(links);
    return newLink;
  },

  async updateLink(id, updates) {
    let updatedCloud = null;
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("personalized_links")
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq("id", id)
          .select()
          .single();

        if (!error && data) updatedCloud = data;
      } catch (err) {}
    }

    const links = getStoredLinks();
    const index = links.findIndex(l => l.id === id || l.slug === id);
    if (index !== -1) {
      links[index] = {
        ...links[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveStoredLinks(links);
      return links[index];
    }
    if (updatedCloud) return updatedCloud;
    throw new Error("Link not found.");
  },

  async deleteLink(id) {
    if (isConfigured && supabase) {
      try {
        await supabase
          .from("personalized_links")
          .delete()
          .eq("id", id);
      } catch (err) {}
    }

    const links = getStoredLinks();
    const filtered = links.filter(l => l.id !== id && l.slug !== id);
    saveStoredLinks(filtered);
    return true;
  }
};
