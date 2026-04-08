"use client";

/*
  Required Supabase tables (run in SQL editor):

  create table if not exists profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    display_name text,
    avatar_url text,
    plan text not null default 'free',          -- 'free' | 'pro'
    generations_used integer not null default 0,
    generations_limit integer not null default 10,
    default_tone text not null default 'Professional',
    default_industry text not null default 'Auto-detect',
    default_framework text not null default 'All 3',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists generations_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    prospect_url text,
    score integer,
    created_at timestamptz not null default now()
  );

  -- RLS: users can only see their own rows
  alter table profiles enable row level security;
  alter table generations_history enable row level security;
  create policy "own profile" on profiles for all using (auth.uid() = id);
  create policy "own history" on generations_history for all using (auth.uid() = user_id);
*/

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Profile = {
  display_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro";
  generations_used: number;
  generations_limit: number;
  default_tone: string;
  default_industry: string;
  default_framework: string;
};

type HistoryEntry = {
  id: string;
  prospect_url: string;
  score: number | null;
  created_at: string;
};

const SECTIONS = [
  { id: "profile",      label: "Profile",       icon: "👤" },
  { id: "subscription", label: "Subscription",  icon: "💳" },
  { id: "usage",        label: "API Usage",     icon: "📊" },
  { id: "preferences",  label: "Preferences",   icon: "⚙️" },
  { id: "security",     label: "Security",      icon: "🔒" },
  { id: "danger",       label: "Danger Zone",   icon: "⚠️" },
];

const INPUT_CLS =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 " +
  "focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all text-sm disabled:opacity-50";

const SELECT_CLS =
  "w-full h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white " +
  "focus:border-purple-400/60 focus:outline-none focus:ring-1 focus:ring-purple-400/20 transition-all";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Preferences state
  const [prefTone, setPrefTone] = useState("Professional");
  const [prefIndustry, setPrefIndustry] = useState("Auto-detect");
  const [prefFramework, setPrefFramework] = useState("All 3");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Security state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setProfileLoading(true);
      const [{ data: prof }, { data: hist }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).single(),
        supabase
          .from("generations_history")
          .select("id, prospect_url, score, created_at")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (prof) {
        setProfile(prof as Profile);
        setDisplayName(prof.display_name ?? "");
        setAvatarUrl(prof.avatar_url ?? null);
        setPrefTone(prof.default_tone ?? "Professional");
        setPrefIndustry(prof.default_industry ?? "Auto-detect");
        setPrefFramework(prof.default_framework ?? "All 3");
      }
      if (hist) setHistory(hist as HistoryEntry[]);
      setProfileLoading(false);
    }
    load();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName, updated_at: new Date().toISOString() });
    setSavingProfile(false);
    setProfileMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Profile saved." });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!upErr) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: url });
      setAvatarUrl(url);
    }
    setUploadingAvatar(false);
  };

  const handleSavePrefs = async () => {
    if (!user) return;
    setSavingPrefs(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      default_tone: prefTone,
      default_industry: prefIndustry,
      default_framework: prefFramework,
      updated_at: new Date().toISOString(),
    });
    setSavingPrefs(false);
    setPrefsMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Preferences saved." });
    setTimeout(() => setPrefsMsg(null), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    setPwMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password updated." });
    if (!error) { setNewPassword(""); setConfirmPassword(""); }
    setTimeout(() => setPwMsg(null), 4000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    // Calls a server-side function — placeholder; requires an Edge Function or API route
    // that calls supabase.auth.admin.deleteUser(user.id)
    const { error } = await supabase.rpc("delete_user");
    if (error) {
      setDeleting(false);
      alert("Failed to delete account: " + error.message);
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  if (authLoading || !user) return null;

  const isGoogleUser = user.app_metadata?.provider === "google";
  const usagePercent = profile
    ? Math.min((profile.generations_used / profile.generations_limit) * 100, 100)
    : 0;

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-zinc-50">Account Settings</h1>
            <p className="text-zinc-500 mt-1 text-sm">{user.email}</p>
          </div>

          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className="lg:w-52 shrink-0">
              <nav className="flex lg:flex-col gap-1 flex-wrap">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                      activeSection === s.id
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                    } ${s.id === "danger" ? "mt-2 lg:mt-4" : ""}`}
                  >
                    <span className="text-base">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {/* ── PROFILE ── */}
              {activeSection === "profile" && (
                <Section title="Profile">
                  {profileLoading ? (
                    <Skeleton />
                  ) : (
                    <div className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl font-bold text-white">
                                {(displayName || user.email || "?")[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          {uploadingAvatar && (
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                              <Spinner />
                            </div>
                          )}
                        </div>
                        <div>
                          <button
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                          >
                            {uploadingAvatar ? "Uploading…" : "Change photo"}
                          </button>
                          <p className="text-xs text-zinc-600 mt-0.5">JPG, PNG, GIF up to 2MB</p>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </div>
                      </div>

                      {/* Display name */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name"
                          className={INPUT_CLS}
                        />
                      </div>

                      {/* Email (read-only) */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email ?? ""}
                          disabled
                          className={INPUT_CLS}
                        />
                        <p className="text-xs text-zinc-600 mt-1">Email cannot be changed here.</p>
                      </div>

                      <SaveButton onClick={handleSaveProfile} saving={savingProfile} msg={profileMsg} />
                    </div>
                  )}
                </Section>
              )}

              {/* ── SUBSCRIPTION ── */}
              {activeSection === "subscription" && (
                <Section title="Subscription">
                  {profileLoading ? (
                    <Skeleton />
                  ) : (
                    <div className="space-y-6">
                      {/* Current plan badge */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1.5 rounded-full text-sm font-bold border ${
                            profile?.plan === "pro"
                              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-300"
                              : "bg-zinc-800 border-zinc-700 text-zinc-300"
                          }`}
                        >
                          {profile?.plan === "pro" ? "Pro" : "Free"}
                        </span>
                        <span className="text-sm text-zinc-500">Current plan</span>
                      </div>

                      {/* Usage bar */}
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-2">
                          <span>Generations used this month</span>
                          <span>
                            {profile?.generations_used ?? 0} / {profile?.generations_limit ?? 10}
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usagePercent >= 90
                                ? "bg-red-500"
                                : usagePercent >= 70
                                  ? "bg-yellow-500"
                                  : "bg-gradient-to-r from-purple-500 to-pink-500"
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>

                      {profile?.plan !== "pro" && (
                        <div className="rounded-xl border border-purple-400/20 bg-purple-500/[0.06] p-5">
                          <p className="font-semibold text-zinc-100 mb-1">Upgrade to Pro</p>
                          <p className="text-sm text-zinc-400 mb-4">
                            Unlimited generations, priority support, and early access to new features.
                          </p>
                          <Link
                            href="/pricing"
                            className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                          >
                            Upgrade for $9.99/mo →
                          </Link>
                        </div>
                      )}

                      {profile?.plan === "pro" && (
                        <div>
                          <p className="text-sm text-zinc-400 mb-3">
                            You&apos;re on Pro. Billing is managed through Stripe.
                          </p>
                          <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
                            Cancel subscription
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Section>
              )}

              {/* ── API USAGE ── */}
              {activeSection === "usage" && (
                <Section title="API Usage">
                  {profileLoading ? (
                    <Skeleton />
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                            This month
                          </p>
                          <p className="text-3xl font-black text-zinc-50">
                            {profile?.generations_used ?? 0}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">generations</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                            Remaining
                          </p>
                          <p className="text-3xl font-black text-zinc-50">
                            {Math.max(0, (profile?.generations_limit ?? 10) - (profile?.generations_used ?? 0))}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">of {profile?.generations_limit ?? 10}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Last 10 generations</h3>
                        {history.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center">
                            <p className="text-zinc-600 text-sm">No generations yet</p>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-zinc-800 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">URL</th>
                                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Score</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/60">
                                {history.map((h) => (
                                  <tr key={h.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-4 py-3 text-zinc-300 truncate max-w-[200px]">
                                      <a
                                        href={h.prospect_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-purple-400 transition-colors"
                                      >
                                        {h.prospect_url.replace(/^https?:\/\//, "")}
                                      </a>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                                      {new Date(h.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      {h.score != null ? (
                                        <span
                                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                            h.score >= 8
                                              ? "bg-emerald-500/20 text-emerald-400"
                                              : h.score >= 5
                                                ? "bg-yellow-500/20 text-yellow-400"
                                                : "bg-red-500/20 text-red-400"
                                          }`}
                                        >
                                          {h.score}/10
                                        </span>
                                      ) : (
                                        <span className="text-zinc-600 text-xs">—</span>
                                      )}
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
                </Section>
              )}

              {/* ── PREFERENCES ── */}
              {activeSection === "preferences" && (
                <Section title="Preferences">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Default Email Tone
                      </label>
                      <select value={prefTone} onChange={(e) => setPrefTone(e.target.value)} className={SELECT_CLS}>
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Bold</option>
                        <option>Friendly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Default Industry
                      </label>
                      <select value={prefIndustry} onChange={(e) => setPrefIndustry(e.target.value)} className={SELECT_CLS}>
                        <option>Auto-detect</option>
                        <option>B2B Agency</option>
                        <option>SaaS</option>
                        <option>Consulting</option>
                        <option>Ecommerce</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Default Framework
                      </label>
                      <select value={prefFramework} onChange={(e) => setPrefFramework(e.target.value)} className={SELECT_CLS}>
                        <option>All 3</option>
                        <option>The Direct (PAS)</option>
                        <option>Value-First</option>
                        <option>The Curious</option>
                      </select>
                    </div>
                    <p className="text-xs text-zinc-600">
                      These defaults pre-fill the generator form. You can always override per session.
                    </p>
                    <SaveButton onClick={handleSavePrefs} saving={savingPrefs} msg={prefsMsg} label="Save Preferences" />
                  </div>
                </Section>
              )}

              {/* ── SECURITY ── */}
              {activeSection === "security" && (
                <Section title="Security">
                  <div className="space-y-8">
                    {/* Connected accounts */}
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Connected Accounts</h3>
                      <div className="rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">📧</span>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">Email / Password</p>
                              <p className="text-xs text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                          <span className="text-xs text-emerald-400 font-medium">Connected</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🔵</span>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">Google</p>
                              <p className="text-xs text-zinc-500">OAuth 2.0</p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium ${isGoogleUser ? "text-emerald-400" : "text-zinc-600"}`}
                          >
                            {isGoogleUser ? "Connected" : "Not connected"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Change password — only for non-Google users */}
                    {!isGoogleUser && (
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Change Password</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Min. 8 characters"
                              className={INPUT_CLS}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat new password"
                              className={INPUT_CLS}
                            />
                          </div>
                          <SaveButton
                            onClick={handleChangePassword}
                            saving={savingPw}
                            msg={pwMsg}
                            label="Update Password"
                          />
                        </div>
                      </div>
                    )}

                    {isGoogleUser && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                        <p className="text-sm text-zinc-400">
                          You signed in with Google. Password management is handled by your Google account.
                        </p>
                      </div>
                    )}

                    {/* Sign out */}
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Session</h3>
                      <button
                        onClick={handleSignOut}
                        className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                      >
                        Sign out of all devices
                      </button>
                    </div>
                  </div>
                </Section>
              )}

              {/* ── DANGER ZONE ── */}
              {activeSection === "danger" && (
                <Section title="Danger Zone">
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-6 space-y-4">
                    <div>
                      <p className="font-semibold text-red-400">Delete Account</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        Permanently deletes your account, all generated emails, and usage history.
                        This action cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/20 hover:border-red-500/60 transition-colors"
                    >
                      Delete my account
                    </button>
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0f0f0f] p-8 space-y-5">
            <div>
              <p className="text-xl font-black text-zinc-50 mb-2">Delete account?</p>
              <p className="text-sm text-zinc-400">
                This is permanent. All your data will be erased. Type{" "}
                <span className="font-mono font-bold text-red-400">DELETE</span> to confirm.
              </p>
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className={INPUT_CLS + " font-mono"}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(""); }}
                className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7">
      <h2 className="text-lg font-bold text-zinc-50 mb-6 pb-4 border-b border-zinc-800">{title}</h2>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-zinc-800/60 rounded-xl" />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
  );
}

function SaveButton({
  onClick,
  saving,
  msg,
  label = "Save Changes",
}: {
  onClick: () => void;
  saving: boolean;
  msg: { ok: boolean; text: string } | null;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <button
        onClick={onClick}
        disabled={saving}
        className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Spinner /> Saving…
          </span>
        ) : (
          label
        )}
      </button>
      {msg && (
        <p className={`text-sm font-medium ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
