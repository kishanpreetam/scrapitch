"use client";

/*
  Required Supabase tables (run in SQL editor):

  create table if not exists profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    display_name text,
    avatar_url text,
    plan text not null default 'free',
    generations_used integer not null default 0,
    generations_limit integer not null default 10,
    default_industry text not null default 'Auto-detect',
    default_framework text not null default 'All 3 Variants',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  -- RLS: users can only see their own rows
  alter table profiles enable row level security;
  create policy "own profile" on profiles for all using (auth.uid() = id);
*/

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  SlidersHorizontal,
  Lock,
  AlertTriangle,
  Mail,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Profile = {
  display_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro";
  default_industry: string;
  default_framework: string;
};

const SECTIONS = [
  { id: "profile",     label: "Profile",     Icon: User },
  { id: "security",   label: "Security",    Icon: Lock },
  { id: "preferences", label: "Preferences", Icon: SlidersHorizontal },
  { id: "danger",     label: "Danger Zone", Icon: AlertTriangle },
];

const INPUT_CLS =
  "w-full rounded-xl border border-white/12 bg-[#1a1a1a] px-4 py-3 text-[#f0f0f0] placeholder-[#6b6b6b] " +
  "focus:border-[#3b82f6]/50 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/15 transition-all text-sm disabled:opacity-40";

const SELECT_CLS =
  "w-full h-11 rounded-xl border border-white/12 bg-[#1a1a1a] px-3 text-sm text-[#f0f0f0] " +
  "focus:border-[#3b82f6]/50 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/15 transition-all appearance-none";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [prefIndustry, setPrefIndustry] = useState("Auto-detect");
  const [prefFramework, setPrefFramework] = useState("All 3 Variants");
  const [notifUpdates, setNotifUpdates] = useState(true);
  const [notifTips, setNotifTips] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setNotifUpdates(localStorage.getItem("notif_updates") !== "false");
      setNotifTips(localStorage.getItem("notif_tips") !== "false");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setProfileLoading(true);
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (prof) {
        setProfile(prof as Profile);
        setDisplayName(prof.display_name ?? "");
        setAvatarUrl(prof.avatar_url ?? null);
        setPrefIndustry(prof.default_industry ?? "Auto-detect");
        setPrefFramework(prof.default_framework ?? "All 3 Variants");
      }
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
    if (typeof window !== "undefined") {
      localStorage.setItem("notif_updates", String(notifUpdates));
      localStorage.setItem("notif_tips", String(notifTips));
    }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      default_industry: prefIndustry,
      default_framework: prefFramework,
      updated_at: new Date().toISOString(),
    });
    setSavingPrefs(false);
    setPrefsMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Preferences saved." });
    setTimeout(() => setPrefsMsg(null), 3000);
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    setSavingPw(true);
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInErr) {
      setSavingPw(false);
      setPwMsg({ ok: false, text: "Current password is incorrect." });
      setTimeout(() => setPwMsg(null), 4000);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    setPwMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password updated." });
    if (!error) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setTimeout(() => setPwMsg(null), 4000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
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

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">

          {/* Page header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight">Account Settings</h1>
            <p className="text-[#6b6b6b] mt-2 text-sm">{user.email}</p>
            <div className="mt-6 h-px bg-linear-to-r from-[#3b82f6]/30 via-[#60a5fa]/20 to-transparent" />
          </div>

          <div className="flex gap-8 flex-col lg:flex-row">

            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <nav className="flex lg:flex-col gap-1 flex-wrap">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full group ${
                      activeSection === s.id
                        ? "bg-blue-500/10 text-blue-300"
                        : s.id === "danger"
                          ? "text-[#6b6b6b] hover:text-red-400 hover:bg-red-500/6"
                          : "text-[#a8a8a8] hover:text-[#f0f0f0] hover:bg-white/4"
                    } ${s.id === "danger" ? "mt-2 lg:mt-4" : ""}`}
                  >
                    {activeSection === s.id && (
                      <span className="absolute left-0 inset-y-2 w-0.5 rounded-r-full bg-[#3b82f6]" />
                    )}
                    <s.Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        activeSection === s.id
                          ? "text-blue-400"
                          : s.id === "danger"
                            ? "text-[#6b6b6b] group-hover:text-red-400"
                            : "text-[#6b6b6b] group-hover:text-[#d4d4d4]"
                      }`}
                    />
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
                    <div className="space-y-7">
                      {/* Avatar */}
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="p-0.5 rounded-full bg-[#3b82f6] shadow-[0_0_16px_rgba(59,130,246,0.25)]">
                            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-3xl font-bold text-white">
                                  {(displayName || user.email || "?")[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          {uploadingAvatar && (
                            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                              <Spinner />
                            </div>
                          )}
                        </div>
                        <div>
                          <button
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="rounded-lg border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-[#d4d4d4] hover:text-white hover:border-white/25 transition-all disabled:opacity-50"
                          >
                            {uploadingAvatar ? "Uploading..." : "Change photo"}
                          </button>
                          <p className="text-xs text-[#64748b] mt-1.5">JPG, PNG, GIF up to 2MB</p>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
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

                      <div>
                        <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email ?? ""}
                          disabled
                          className={INPUT_CLS}
                        />
                        <p className="text-xs text-[#64748b] mt-1.5">Email cannot be changed here.</p>
                      </div>

                      <SaveButton onClick={handleSaveProfile} saving={savingProfile} msg={profileMsg} />
                    </div>
                  )}
                </Section>
              )}

              {/* ── SECURITY ── */}
              {activeSection === "security" && (
                <Section title="Security">
                  <div className="space-y-8">

                    {/* Change password */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#fafafa] mb-4">Change Password</h3>
                      {!isGoogleUser ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              className={INPUT_CLS}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
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
                            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                              Confirm New Password
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
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-[#1a1a1a]/30 p-5">
                          <p className="text-sm text-[#a8a8a8]">
                            You signed in with Google. Password management is handled by your Google account.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Connected accounts */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#fafafa] mb-3">Connected Accounts</h3>
                      <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/8">
                        <div className="flex items-center justify-between px-5 py-4 bg-white/3">
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-[#a8a8a8]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#d4d4d4]">Email and Password</p>
                              <p className="text-xs text-[#6b6b6b] mt-0.5">{user.email}</p>
                            </div>
                          </div>
                          <span style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", background: "transparent" }}>
                            Connected
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                              <span className="text-sm font-black text-blue-400">G</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#d4d4d4]">Google</p>
                              <p className="text-xs text-[#6b6b6b] mt-0.5">
                                {isGoogleUser ? `Connected as ${user.email}` : "OAuth 2.0"}
                              </p>
                            </div>
                          </div>
                          {isGoogleUser ? (
                            <span style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", background: "transparent" }}>
                              Connected
                            </span>
                          ) : (
                            <button
                              onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
                              className="rounded-lg border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-medium text-[#d4d4d4] hover:text-white hover:border-white/25 transition-all"
                            >
                              Connect Google Account
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Active sessions */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#fafafa] mb-3">Active Sessions</h3>
                      <div className="rounded-xl border border-white/10 bg-[#1a1a1a]/30 p-5">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <p className="text-sm font-medium text-[#d4d4d4]">Current session</p>
                            <p className="text-xs text-[#64748b] mt-0.5">Active now</p>
                          </div>
                          <button
                            onClick={handleSignOut}
                            className="rounded-xl border border-white/12 px-5 py-2.5 text-sm font-medium text-[#a8a8a8] hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/6 transition-all"
                          >
                            Sign out all other sessions
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </Section>
              )}

              {/* ── PREFERENCES ── */}
              {activeSection === "preferences" && (
                <Section title="Preferences">
                  <div className="space-y-6">

                    <PrefField
                      label="Default Framework"
                      description="This will be pre selected when you open the generator."
                    >
                      <select value={prefFramework} onChange={(e) => setPrefFramework(e.target.value)} className={SELECT_CLS}>
                        <option>All 3 Variants</option>
                        <option>The Direct (PAS)</option>
                        <option>Value First</option>
                        <option>The Curious</option>
                      </select>
                    </PrefField>

                    <PrefField
                      label="Default Industry"
                      description="This will be pre selected when you open the generator."
                    >
                      <select value={prefIndustry} onChange={(e) => setPrefIndustry(e.target.value)} className={SELECT_CLS}>
                        <option>Auto-detect</option>
                        <option>B2B SaaS</option>
                        <option>Marketing &amp; Creative Agency</option>
                        <option>Sales &amp; Revenue Consulting</option>
                        <option>IT Services &amp; MSP</option>
                        <option>Recruiting &amp; Staffing</option>
                        <option>Legal Services</option>
                        <option>Financial Services &amp; Fintech</option>
                        <option>Real Estate</option>
                        <option>Healthcare &amp; MedTech</option>
                        <option>Manufacturing &amp; Industrial</option>
                        <option>Ecommerce &amp; DTC</option>
                        <option>Freelancer / Solo Consultant</option>
                      </select>
                    </PrefField>

                    <div>
                      <p className="text-sm font-semibold text-[#d4d4d4] mb-0.5">Email Notifications</p>
                      <p className="text-xs text-[#64748b] mb-4">Manage what we send to {user.email}.</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#1a1a1a]/40 px-4 py-3.5">
                          <span className="text-sm text-[#d4d4d4]">Product updates and new features</span>
                          <Toggle checked={notifUpdates} onChange={setNotifUpdates} />
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#1a1a1a]/40 px-4 py-3.5">
                          <span className="text-sm text-[#d4d4d4]">Tips on improving cold email performance</span>
                          <Toggle checked={notifTips} onChange={setNotifTips} />
                        </div>
                      </div>
                    </div>

                    <SaveButton onClick={handleSavePrefs} saving={savingPrefs} msg={prefsMsg} label="Save Preferences" />
                  </div>
                </Section>
              )}

              {/* ── DANGER ZONE ── */}
              {activeSection === "danger" && (
                <Section title="Danger Zone" titleClass="text-[#f87171]">
                  <div className="rounded-xl border border-red-500/20 bg-red-500/4 p-6">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-bold text-red-400 mb-1">Delete Account</p>
                        <p className="text-sm text-[#a8a8a8] leading-relaxed">
                          Permanently deletes your account, all generated emails, and usage history.
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/15 hover:border-red-500/60 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/25 bg-[#0a0a0a] p-8 space-y-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-lg font-black text-white mb-1.5">Delete account?</p>
                <p className="text-sm text-[#a8a8a8] leading-relaxed">
                  This is permanent. All your data will be erased. Type{" "}
                  <span className="font-mono font-bold text-red-400">DELETE</span> to confirm.
                </p>
              </div>
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
                className="flex-1 rounded-xl border border-white/12 py-2.5 text-sm font-medium text-[#d4d4d4] hover:text-white hover:border-white/25 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Shared components ───────────────────────────────────────────────────── */

function Section({
  title,
  children,
  titleClass = "text-[#fafafa]",
}: {
  title: string;
  children: React.ReactNode;
  titleClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111111] p-8">
      <h2 className={`text-xl font-bold ${titleClass}`}>{title}</h2>
      <div className="h-px bg-white/8 mt-4 mb-7" />
      {children}
    </div>
  );
}

function PrefField({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#d4d4d4] mb-0.5">{label}</label>
      <p className="text-xs text-[#64748b] mb-2">{description}</p>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 ${
        checked ? "bg-[#3b82f6]" : "bg-white/15"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-11 bg-white/6 rounded-xl" />
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
    <div className="flex items-center gap-4 flex-wrap pt-1">
      <button
        onClick={onClick}
        disabled={saving}
        className="rounded-xl bg-[#3b82f6] px-8 py-3 text-sm font-bold text-white hover:bg-[#2563eb] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Spinner /> Saving...
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
