import React, { useState, useEffect, useMemo } from "react";
import { platformApi, isConfigured } from "../../lib/supabase.js";
import { getAllTemplates } from "../../registry/index.js";
import {
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Power,
  Layers,
  Eye,
  LogOut,
  Sparkles,
  Heart,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function AdminDashboard({ session, onLogout }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("links"); // "links" | "create" | "templates"
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"

  // Creation Form State
  const [selectedTemplate, setSelectedTemplate] = useState("birthday-wish");
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [age, setAge] = useState("20");
  const [birthdayDate, setBirthdayDate] = useState("28 September");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdLinkResult, setCreatedLinkResult] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState("");

  // Edit Modal State
  const [editingLink, setEditingLink] = useState(null);
  const [editSender, setEditSender] = useState("");
  const [editReceiver, setEditReceiver] = useState("");
  const [editAge, setEditAge] = useState("20");
  const [editBirthdayDate, setEditBirthdayDate] = useState("28 September");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingLink, setDeletingLink] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const templates = useMemo(() => getAllTemplates(), []);

  // Load links from API
  const refreshLinks = async () => {
    try {
      setLoading(true);
      const data = await platformApi.listAllLinks();
      setLinks(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading links:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLinks();
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalTemplates = templates.length;
    const totalLinks = links.length;
    const activeLinks = links.filter((l) => l.is_active).length;
    const inactiveLinks = totalLinks - activeLinks;
    const totalViews = links.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
    return { totalTemplates, totalLinks, activeLinks, inactiveLinks, totalViews };
  }, [templates, links]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.slug.toLowerCase().includes(q) ||
        item.sender_name.toLowerCase().includes(q) ||
        item.receiver_name.toLowerCase().includes(q) ||
        item.template_id.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchSearch && matchStatus;
    });
  }, [links, searchQuery, statusFilter]);

  // Handle Create Link
  const handleCreateLink = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!senderName.trim() || !receiverName.trim()) {
      setCreateError("Please enter both sender and receiver names.");
      return;
    }

    setCreating(true);
    try {
      const customData = selectedTemplate === "birthday-wish" ? {
        age: age.trim() || "20",
        birthdayDate: birthdayDate.trim() || "28 September"
      } : {};

      const created = await platformApi.createPersonalizedLink({
        templateId: selectedTemplate,
        senderName: senderName.trim(),
        receiverName: receiverName.trim(),
        customSlug: customSlug.trim(),
        customData
      });

      setCreatedLinkResult(created);
      setSenderName("");
      setReceiverName("");
      setCustomSlug("");
      setCreating(false);
      refreshLinks();
    } catch (err) {
      setCreating(false);
      setCreateError(err.message || "Failed to create link");
    }
  };

  // Toggle active status
  const handleToggleActive = async (link) => {
    try {
      const updated = await platformApi.updateLink(link.id, {
        is_active: !link.is_active
      });
      setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)));
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  // Save Edit Link
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLink) return;
    if (!editSender.trim() || !editReceiver.trim()) {
      alert("Sender and receiver names cannot be empty.");
      return;
    }
    setSavingEdit(true);
    try {
      const updates = {
        sender_name: editSender.trim(),
        receiver_name: editReceiver.trim()
      };
      if (editingLink.template_id === "birthday-wish") {
        updates.custom_data = {
          ...(editingLink.custom_data || {}),
          age: editAge.trim() || "20",
          birthdayDate: editBirthdayDate.trim() || "28 September"
        };
      }
      const updated = await platformApi.updateLink(editingLink.id, updates);
      setLinks((prev) => prev.map((l) => (l.id === editingLink.id ? updated : l)));
      setSavingEdit(false);
      setEditingLink(null);
    } catch (err) {
      setSavingEdit(false);
      alert("Failed to save changes: " + err.message);
    }
  };

  // Delete Link
  const handleDeleteConfirm = async () => {
    if (!deletingLink) return;
    setDeleting(true);
    try {
      await platformApi.deleteLink(deletingLink.id);
      setLinks((prev) => prev.filter((l) => l.id !== deletingLink.id));
      setDeleting(false);
      setDeletingLink(null);
    } catch (err) {
      setDeleting(false);
      alert("Failed to delete link: " + err.message);
    }
  };

  // Copy share URL
  const getShareableUrl = (slug) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/p/${slug}`;
  };

  const handleCopy = (slug) => {
    const url = getShareableUrl(slug);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedSlug(slug);
    setTimeout(() => {
      setCopiedSlug("");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FBF5F4] text-gray-800 font-['Montserrat']">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#f1dede] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d84b5a] to-[#EE95BB] flex items-center justify-center text-white shadow-sm font-['Playfair_Display'] font-bold text-lg">
            C
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight font-['Playfair_Display']">
              Apology Platform Admin
            </h1>
            <div className="flex items-center gap-2 text-xs">
              {isConfigured ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Supabase Cloud
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Local Storage Mode
                </span>
              )}
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 truncate max-w-[140px] sm:max-w-none">
                {session?.user?.email || "admin"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition"
          >
            <Globe className="w-3.5 h-3.5" /> View Public Site
          </a>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-700 text-xs font-semibold text-gray-700 transition"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#f1dede] shadow-sm">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Templates</span>
              <Layers className="w-4 h-4 text-[#d84b5a]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Playfair_Display']">
              {metrics.totalTemplates}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Registered designs</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#f1dede] shadow-sm">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Total Links</span>
              <LinkIcon className="w-4 h-4 text-[#d84b5a]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Playfair_Display']">
              {metrics.totalLinks}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Generated for couples</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#f1dede] shadow-sm">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Active</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 font-['Playfair_Display']">
              {metrics.activeLinks}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Live & shareable</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#f1dede] shadow-sm">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Inactive</span>
              <XCircle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-500 font-['Playfair_Display']">
              {metrics.inactiveLinks}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Paused or expired</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#f1dede] shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Total Views</span>
              <Eye className="w-4 h-4 text-[#EE95BB]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Playfair_Display']">
              {metrics.totalViews}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Visits across all links</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#f1dede] pb-1">
          <button
            onClick={() => setActiveTab("links")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === "links"
                ? "bg-[#d84b5a] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <LinkIcon className="w-4 h-4" /> Personalized Links ({links.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === "create"
                ? "bg-[#d84b5a] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <Plus className="w-4 h-4" /> Create New Link
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === "templates"
                ? "bg-[#d84b5a] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <Layers className="w-4 h-4" /> Registered Templates ({templates.length})
          </button>
        </div>

        {/* ============================================================================== */}
        {/* TAB 1: PERSONALIZED LINKS LIST & MANAGEMENT                                     */}
        {/* ============================================================================== */}
        {activeTab === "links" && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-[#f1dede] shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sender, receiver, slug..."
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EE95BB] transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#EE95BB]"
                >
                  <option value="all">All Statuses ({links.length})</option>
                  <option value="active">Active Only ({metrics.activeLinks})</option>
                  <option value="inactive">Inactive Only ({metrics.inactiveLinks})</option>
                </select>

                <button
                  onClick={() => setActiveTab("create")}
                  className="px-3.5 py-2 bg-[#d84b5a] hover:bg-[#c33d4b] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> New Link
                </button>
              </div>
            </div>

            {/* Links Table */}
            <div className="bg-white rounded-2xl border border-[#f1dede] shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-400 text-sm">
                  <div className="w-8 h-8 border-3 border-[#EE95BB]/30 border-t-[#d84b5a] rounded-full animate-spin mx-auto mb-3"></div>
                  Loading links...
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700">No personalized links found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchQuery ? "Try clearing your search query." : "Generate your first personalized apology link!"}
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#d84b5a] text-white text-xs font-semibold"
                  >
                    Create Link Now
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-[#f1dede] text-gray-500 uppercase tracking-wider text-[11px] font-semibold">
                        <th className="py-3 px-4">Link Slug</th>
                        <th className="py-3 px-4">Couple (Sender ➔ Receiver)</th>
                        <th className="py-3 px-4">Template</th>
                        <th className="py-3 px-4 text-center">Views</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLinks.map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50/60 transition group">
                          {/* Slug / Direct Link */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                                /p/{link.slug}
                              </span>
                              <button
                                onClick={() => handleCopy(link.slug)}
                                className="p-1 text-gray-400 hover:text-gray-700 transition rounded"
                                title="Copy Share Link"
                              >
                                {copiedSlug === link.slug ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Couple / Recipient */}
                          <td className="py-3.5 px-4 font-medium text-gray-800">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[#d84b5a]">{link.sender_name}</span>
                              <span className="text-gray-400 mx-1">➔</span>
                              <span className="text-gray-900 font-semibold">{link.receiver_name}</span>
                            </div>
                            {link.template_id === "birthday-wish" && link.custom_data && (
                              <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-2">
                                <span className="bg-amber-100/70 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                  🎂 Age: {link.custom_data.age || "20"}
                                </span>
                                <span className="bg-amber-100/70 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                  📅 {link.custom_data.birthdayDate || "28 Sep"}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Template */}
                          <td className="py-3.5 px-4 text-gray-600">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                              link.template_id === "birthday-wish"
                                ? "bg-amber-50 text-amber-800 border-amber-200 font-semibold"
                                : "bg-[#fcecee] text-[#c33d4b] border-[#fad7db]"
                            }`}>
                              {link.template_id === "birthday-wish" ? "🎂 Birthday Wish" : link.template_id}
                            </span>
                          </td>

                          {/* Views */}
                          <td className="py-3.5 px-4 text-center text-gray-600 font-medium">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="w-3 h-3 text-gray-400" />
                              {link.views_count || 0}
                            </span>
                          </td>

                          {/* Status Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleActive(link)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${
                                link.is_active
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                              }`}
                              title="Click to toggle status"
                            >
                              <Power className="w-3 h-3" />
                              {link.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={getShareableUrl(link.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => {
                                  setEditingLink(link);
                                  setEditSender(link.sender_name);
                                  setEditReceiver(link.receiver_name);
                                  setEditAge(link.custom_data?.age || "20");
                                  setEditBirthdayDate(link.custom_data?.birthdayDate || "28 September");
                                }}
                                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Edit details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingLink(link)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* TAB 2: CREATE PERSONALIZED LINK FORM                                            */}
        {/* ============================================================================== */}
        {activeTab === "create" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#f1dede] shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-['Playfair_Display']">
                  Generate Personalized Link
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Create a dedicated, shareable link for birthdays or apologies using any registered template.
                </p>
              </div>

              {createError && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateLink} className="space-y-5">
                {/* Template Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Select Template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates.map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                          selectedTemplate === tpl.id
                            ? "border-[#d84b5a] bg-[#fff5f6] ring-2 ring-[#EE95BB]/50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <img
                          src={tpl.thumbnailUrl}
                          alt={tpl.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{tpl.name}</h4>
                          <span className="text-[11px] text-gray-500 font-mono">id: {tpl.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sender Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    {selectedTemplate === "birthday-wish"
                      ? "Sender's / Wish By Name (Who is wishing)"
                      : "Sender's Name (Who is apologizing)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder={selectedTemplate === "birthday-wish" ? "e.g. CodeWithAbby, Bestie, Abbas" : "e.g. Gugu, Rahul, Abbas"}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EE95BB] transition"
                  />
                </div>

                {/* Receiver Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    {selectedTemplate === "birthday-wish"
                      ? "Birthday Person's Name (Whose birthday it is)"
                      : "Receiver's Name (Who is receiving the apology)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder={selectedTemplate === "birthday-wish" ? "e.g. Priya, Simran, Rahul" : "e.g. Saibun, Priya, Aastha"}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EE95BB] transition"
                  />
                </div>

                {/* Birthday Specific Fields (Age Candles + Birthday Date) */}
                {selectedTemplate === "birthday-wish" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-amber-900 mb-1.5">
                        🎂 Age / Candles on Cake
                      </label>
                      <input
                        type="text"
                        required
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 20, 15, 25, 1"
                        className="w-full px-4 py-2.5 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                      />
                      <span className="text-[11px] text-amber-700 mt-1 block leading-tight">
                        Cake par yahi candles aayengi (jaise 20 likha toh 2 aur 0 candle cake par lag jayegi).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-amber-900 mb-1.5">
                        📅 Birthday Date
                      </label>
                      <input
                        type="text"
                        required
                        value={birthdayDate}
                        onChange={(e) => setBirthdayDate(e.target.value)}
                        placeholder="e.g. 28 September, 15 August"
                        className="w-full px-4 py-2.5 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                      />
                      <span className="text-[11px] text-amber-700 mt-1 block leading-tight">
                        Phone lock screen aur party room date chip par show hogi.
                      </span>
                    </div>
                  </div>
                )}

                {/* Custom Slug (Optional) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Custom Link Slug <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs text-gray-500 font-mono">
                      /p/
                    </span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                      placeholder="auto-generated if empty"
                      className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#EE95BB] font-mono transition"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Letters, numbers, hyphens only. Leave blank for a secure random 8-character ID.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#d84b5a] hover:bg-[#c33d4b] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60"
                >
                  {creating ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Personalized Link
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Success Result Modal / Card */}
            {createdLinkResult && (
              <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Personalized Link Successfully Created!
                </div>
                <p className="text-xs text-emerald-700 mb-4">
                  For {createdLinkResult.sender_name} ➔ {createdLinkResult.receiver_name}
                </p>

                <div className="bg-white p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                  <span className="font-mono text-xs sm:text-sm text-gray-800 break-all select-all">
                    {getShareableUrl(createdLinkResult.slug)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(createdLinkResult.slug)}
                      className="px-3 py-1.5 rounded-lg bg-[#d84b5a] text-white text-xs font-semibold hover:bg-[#c33d4b] flex items-center gap-1.5 transition shadow-sm"
                    >
                      {copiedSlug === createdLinkResult.slug ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </>
                      )}
                    </button>
                    <a
                      href={getShareableUrl(createdLinkResult.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Test Open
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => setCreatedLinkResult(null)}
                  className="text-xs text-emerald-800 hover:underline font-semibold"
                >
                  Create another link
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================================== */}
        {/* TAB 3: REGISTERED TEMPLATES CATALOG                                            */}
        {/* ============================================================================== */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-['Playfair_Display']">
                  Template Registry ({templates.length})
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  All apology designs registered in the platform engine. Future templates appear here automatically.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-3xl border border-[#f1dede] shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 bg-gray-100 overflow-hidden group">
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-white shadow-sm">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{tpl.name}</h3>
                        <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {tpl.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4">{tpl.tagline}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        Fields: {tpl.supportedFields.map((f) => f.label).join(", ")}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTemplate(tpl.id);
                          setActiveTab("create");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#d84b5a] hover:bg-[#c33d4b] text-white text-xs font-semibold transition"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Future Template Registration Information Banner */}
            <div className="bg-[#fff8f8] border border-[#f5dada] rounded-2xl p-5 text-xs text-gray-600 leading-relaxed">
              <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d84b5a]" /> How to add more templates in the future:
              </h4>
              <p>
                To add a new template, simply create its React component inside <code className="bg-white px-1.5 py-0.5 rounded border text-[#d84b5a]">src/templates/</code> and register it in <code className="bg-white px-1.5 py-0.5 rounded border text-[#d84b5a]">src/registry/index.js</code> via <code className="bg-white px-1.5 py-0.5 rounded border text-[#d84b5a]">registerTemplate(...)</code>. It will instantly show up in the Admin dropdown, metrics, and resolve at <code className="bg-white px-1.5 py-0.5 rounded border text-[#d84b5a]">/p/:slug</code> without modifying database structures or rerouting!
              </p>
            </div>
          </div>
        )}
        {/* Bottom Footer Credit */}
        <footer className="pt-8 pb-4 text-center text-xs text-gray-400 border-t border-[#f1dede]">
          <span>Created by </span>
          <a
            href="https://codewithabby-portfolio.vercel.app/templates"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#d84b5a] hover:underline"
          >
            CodeWithAbby
          </a>
        </footer>
      </main>

      {/* ============================================================================== */}
      {/* EDIT MODAL                                                                     */}
      {/* ============================================================================== */}
      {editingLink && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-[#f1dede]">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-['Playfair_Display']">
              Edit Personalized Link
            </h3>
            <p className="text-xs text-gray-500 mb-4 font-mono">/p/{editingLink.slug}</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {editingLink.template_id === "birthday-wish" ? "Sender / Wish By Name" : "Sender Name"}
                </label>
                <input
                  type="text"
                  required
                  value={editSender}
                  onChange={(e) => setEditSender(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EE95BB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {editingLink.template_id === "birthday-wish" ? "Birthday Person's Name" : "Receiver Name"}
                </label>
                <input
                  type="text"
                  required
                  value={editReceiver}
                  onChange={(e) => setEditReceiver(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EE95BB]"
                />
              </div>

              {editingLink.template_id === "birthday-wish" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      🎂 Age / Candle Number on Cake
                    </label>
                    <input
                      type="text"
                      required
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      placeholder="e.g. 20, 15, 25"
                      className="w-full px-3.5 py-2 text-sm bg-amber-50/50 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      📅 Birthday Date
                    </label>
                    <input
                      type="text"
                      required
                      value={editBirthdayDate}
                      onChange={(e) => setEditBirthdayDate(e.target.value)}
                      placeholder="e.g. 28 September"
                      className="w-full px-3.5 py-2 text-sm bg-amber-50/50 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#d84b5a] hover:bg-[#c33d4b] rounded-xl shadow-sm transition disabled:opacity-60"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* DELETE CONFIRMATION MODAL                                                      */}
      {/* ============================================================================== */}
      {deletingLink && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-red-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this link?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to delete <code className="font-mono text-red-600">/p/{deletingLink.slug}</code>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingLink(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
