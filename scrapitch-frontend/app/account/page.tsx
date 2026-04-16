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
import { Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const INPUT_CLS =
  "w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-2.5 text-[#f0f0f0] placeholder-[#6b6b6b] " +
  "focus:border-[#3b82f6]/50 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/15 transition-all text-sm disabled:opacity-40";

const SELECT_CLS =
  "w-full h-10 rounded-lg border border-white/10 bg-[#111111] px-3 pr-8 text-sm text-[#f0f0f0] " +
  "focus:border-[#3b82f6]/50 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/15 transition-all appearance-none cursor-pointer";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profileLoading, setProfileLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [prefIndustry, setPrefIndustry] = useState("Auto-detect");
  const [prefFramework, setPrefFramework] = useState("All 3 Variants");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [notifUpdates, setNotifUpdates] = useState(true);
  const [notifTips, setNotifTips] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
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
        setDisplayName(prof.display_name ?? "");
        setOriginalName(prof.display_name ?? "");
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
    if (!error) setOriginalName(displayName);
    setProfileMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Saved." });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (!upErr) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: data.publicUrl });
      setAvatarUrl(data.publicUrl);
    }
    setUploadingAvatar(false);
  };

  const handleToggleNotif = (key: "updates" | "tips", value: boolean) => {
    if (key === "updates") setNotifUpdates(value);
    else setNotifTips(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        key === "updates" ? "notif_updates" : "notif_tips",
        String(value)
      );
    }
  };

  const handleSavePrefs = async () => {
    if (!user) return;
    setSavingPrefs(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      default_industry: prefIndustry,
      default_framework: prefFramework,
      updated_at: new Date().toISOString(),
    });
    setSavingPrefs(false);
    setPrefsMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Saved." });
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
    if (!error) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
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
  const nameChanged = displayName !== originalName;

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#0a0a0a]">
        <div className="mx-auto max-w-160 px-4 sm:px-6 py-12">

          {/* Page header */}
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Settings</h1>
            <p className="text-sm text-[#64748b] mt-1">{user.email}</p>
          </div>

          {/* ── PROFILE ────────────────────────────────────────────────────── */}
          <section className="py-8">
            <h2 className="text-lg font-semibold text-[#fafafa]">Profile</h2>

            {profileLoading ? (
              <Skeleton />
            ) : (
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">

                  {/* Avatar */}
                  <div className="shrink-0">
                    <div className="relative w-16 h-16">
                      <div className="w-16 h-16 rounded-full border-2 border-[#3b82f6] bg-[#111111] flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-white">
                            {(displayName || user.email || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      {uploadingAvatar && (
                        <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                          <Spinner />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="mt-2 block text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? "Uploading..." : "Upload photo"}
                    </button>
                    <p className="text-xs text-[#64748b] mt-0.5">JPG, PNG, or GIF. Max 2MB.</p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-4 w-full">
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
                      <p className="text-sm text-[#f0f0f0]">
                        {user.email}
                        <span className="ml-2 text-xs text-[#64748b]">cannot be changed</span>
                      </p>
                    </div>
                  </div>
                </div>

                {nameChanged && (
                  <div className="mt-5 flex items-center justify-end gap-3">
                    {profileMsg && (
                      <p className={`text-xs ${profileMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                        {profileMsg.text}
                      </p>
                    )}
                    <SmallPrimaryButton onClick={handleSaveProfile} saving={savingProfile} label="Save" />
                  </div>
                )}
              </div>
            )}
          </section>

          <Divider />

          {/* ── GENERATOR DEFAULTS ─────────────────────────────────────────── */}
          <section className="py-8">
            <h2 className="text-lg font-semibold text-[#fafafa]">Generator defaults</h2>
            <p className="text-sm text-[#64748b] mt-1">
              These preferences are pre selected when you open the generator.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                  Default Framework
                </label>
                <div className="relative">
                  <select
                    value={prefFramework}
                    onChange={(e) => setPrefFramework(e.target.value)}
                    className={SELECT_CLS}
                  >
                    <option>All 3 Variants</option>
                    <option>The Direct (PAS)</option>
                    <option>Value First</option>
                    <option>The Curious</option>
                  </select>
                  <ChevronDown />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                  Default Industry
                </label>
                <div className="relative">
                  <select
                    value={prefIndustry}
                    onChange={(e) => setPrefIndustry(e.target.value)}
                    className={SELECT_CLS}
                  >
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
                  <ChevronDown />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              {prefsMsg && (
                <p className={`text-xs ${prefsMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {prefsMsg.text}
                </p>
              )}
              <SmallPrimaryButton onClick={handleSavePrefs} saving={savingPrefs} label="Save" />
            </div>
          </section>

          <Divider />

          {/* ── NOTIFICATIONS ──────────────────────────────────────────────── */}
          <section className="py-8">
            <h2 className="text-lg font-semibold text-[#fafafa]">Notifications</h2>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#d4d4d4]">Product updates</p>
                  <p className="text-xs text-[#64748b] mt-0.5">New features and improvements</p>
                </div>
                <Toggle
                  checked={notifUpdates}
                  onChange={(v) => handleToggleNotif("updates", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#d4d4d4]">Cold email tips</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Tips on writing better outreach</p>
                </div>
                <Toggle
                  checked={notifTips}
                  onChange={(v) => handleToggleNotif("tips", v)}
                />
              </div>
            </div>
          </section>

          <Divider />

          {/* ── SECURITY ───────────────────────────────────────────────────── */}
          <section className="py-8 space-y-8">
            <h2 className="text-lg font-semibold text-[#fafafa]">Security</h2>

            {/* Connected accounts */}
            <div>
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                Connected accounts
              </h3>
              <div className="rounded-lg border border-white/10 overflow-hidden divide-y divide-white/6">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-white/6 flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-[#a8a8a8]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#d4d4d4]">Email</p>
                      <p className="text-xs text-[#64748b]">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">Connected</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-white/6 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-[#60a5fa]">G</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#d4d4d4]">Google</p>
                      <p className="text-xs text-[#64748b]">
                        {isGoogleUser ? `Connected as ${user.email}` : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {isGoogleUser ? (
                    <span className="text-xs font-medium text-emerald-400">Connected</span>
                  ) : (
                    <button
                      onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
                      className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:border-white/30 hover:text-[#d4d4d4] transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Change password */}
            <div>
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                Change password
              </h3>
              {!isGoogleUser ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                      Current password
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
                      New password
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
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="pt-1 flex items-center gap-3">
                    <SmallPrimaryButton
                      onClick={handleChangePassword}
                      saving={savingPw}
                      label="Update password"
                    />
                    {pwMsg && (
                      <p className={`text-xs ${pwMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                        {pwMsg.text}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#64748b]">
                  You signed in with Google. Password management is handled by your Google account.
                </p>
              )}
            </div>

            {/* Active sessions */}
            <div>
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                Active sessions
              </h3>
              <div className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-[#d4d4d4]">This device</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Last active now</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:border-white/30 hover:text-[#d4d4d4] transition-colors"
                >
                  Sign out all other sessions
                </button>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── DANGER ZONE ────────────────────────────────────────────────── */}
          <section className="py-8">
            <h2 className="text-lg font-semibold text-[#ef4444] mb-6">Danger zone</h2>
            <div
              className="rounded-lg p-5"
              style={{ border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.05)" }}
            >
              <p className="text-sm font-semibold text-[#fafafa] mb-1">Delete account</p>
              <p className="text-sm text-[#64748b] leading-relaxed mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <DangerButton onClick={() => setDeleteModalOpen(true)} label="Delete account" />
            </div>
          </section>

        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/25 bg-[#0a0a0a] p-8 space-y-5 shadow-2xl">
            <div>
              <p className="text-lg font-bold text-white mb-1.5">Delete account?</p>
              <p className="text-sm text-[#a8a8a8] leading-relaxed">
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
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 rounded-lg border border-white/15 py-2.5 text-sm font-medium text-[#d4d4d4] hover:text-white hover:border-white/25 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

function Divider() {
  return <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />;
}

function ChevronDown() {
  return (
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 4.5L6 8.5L10 4.5"
          stroke="#64748b"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SmallPrimaryButton({
  onClick,
  saving,
  label,
}: {
  onClick: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {saving ? (
        <>
          <Spinner /> Saving...
        </>
      ) : (
        label
      )}
    </button>
  );
}

function DangerButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-4 py-2 text-sm font-medium text-[#ef4444] transition-colors hover:bg-red-500/10"
      style={{ border: "1px solid rgba(239,68,68,0.3)" }}
    >
      {label}
    </button>
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
    <div className="space-y-3 mt-6 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="h-10 bg-white/6 rounded-lg" />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
  );
}
