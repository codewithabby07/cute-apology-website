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
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  async signIn(email, password) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }
    // Demo Mode Auth: Allows testing with any admin credentials
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }
    const session = {
      user: {
        id: "demo-admin-id",
        email: email.trim(),
        role: "admin",
        app_metadata: { provider: "email" }
      },
      access_token: "demo_access_token_" + Date.now(),
      expires_at: Math.floor(Date.now() / 1000) + 3600 * 24
    };
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
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
      const { data, error } = await supabase
        .from("personalized_links")
        .select("id, slug, template_id, sender_name, receiver_name, custom_data, is_active, views_count")
        .eq("slug", cleanSlug)
        .single();

      if (error || !data) return null;
      return data;
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
        // Fallback to direct increment if RPC is not deployed yet
        await supabase
          .from("personalized_links")
          .update({ views_count: (await this.getLinkBySlug(cleanSlug))?.views_count + 1 || 1 })
          .eq("slug", cleanSlug);
      }
      return;
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
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from("personalized_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return getStoredLinks().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createPersonalizedLink({ templateId, senderName, receiverName, customSlug }) {
    if (!senderName || !senderName.trim()) throw new Error("Sender name is required.");
    if (!receiverName || !receiverName.trim()) throw new Error("Receiver name is required.");

    const slug = (customSlug && customSlug.trim())
      ? customSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "")
      : generateRandomSlug(8);

    if (isConfigured && supabase) {
      const newRecord = {
        slug,
        template_id: templateId || "cute-apology",
        sender_name: senderName.trim(),
        receiver_name: receiverName.trim(),
        custom_data: {},
        is_active: true
      };

      const { data, error } = await supabase
        .from("personalized_links")
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("A link with this slug already exists. Please choose a unique custom slug or leave blank.");
        }
        throw error;
      }
      return data;
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
      custom_data: {},
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
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from("personalized_links")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const links = getStoredLinks();
    const index = links.findIndex(l => l.id === id);
    if (index === -1) throw new Error("Link not found.");

    links[index] = {
      ...links[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveStoredLinks(links);
    return links[index];
  },

  async deleteLink(id) {
    if (isConfigured && supabase) {
      const { error } = await supabase
        .from("personalized_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    }

    const links = getStoredLinks();
    const filtered = links.filter(l => l.id !== id);
    saveStoredLinks(filtered);
    return true;
  }
};
