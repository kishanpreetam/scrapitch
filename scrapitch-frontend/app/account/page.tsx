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
import {
  User,
  CreditCard,
  BarChart2,
  SlidersHorizontal,
  Lock,
  AlertTriangle,
  Mail,
  Zap,
} from "lucide-react";
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
  { id: "profile",      label: "Profile",       Icon: User },
  { id: "subscription", label: "Subscription",  Icon: CreditCard },
  { id: "usage",        label: "API Usage",     Icon: BarChart2 },
  { id: "preferences",  label: "Preferences",   Icon: SlidersHorizontal },
  { id: "security",     label: "Security",      Icon: Lock },
  { id: "danger",       label: "Danger Zone",   Icon: AlertTriangle },
];

const INPUT_CLS =
  "w-full rounded-xl border border-white/12 bg-[#1c1c1c] px-4 py-3 text-[#f0f0f0] placeholder-[#6b6b6b] " +
  "focus:border-[#a855f7]/50 focus:outline-none focus:ring-2 focus:ring-[#a855f7]/15 transition-all text-sm disabled:opacity-40";

const SELECT_CLS =
  "w-full h-11 rounded-xl border border-white/12 bg-[#1c1c1c] px-3 text-sm text-[#f0f0f0] " +
  "focus:border-[#a855f7]/50 focus:outline-none focus:ring-2 focus:ring-[#a855f7]/15 transition-all appearance-none";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [prefTone, setPrefTone] = useState("Professional");
  const [prefIndustry, setPrefIndustry] = useState("Auto-detect");
  const [prefFramework, setPrefFramework] = useState("All 3");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
  const avgScore =
    history.length > 0
      ? Math.round((history.reduce((s, h) => s + (h.score ?? 0), 0) / history.length) * 10) / 10
      : null;

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">

          {/* Page header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight">Account Settings</h1>
            <p className="text-white0 mt-2 text-sm">{user.email}</p>
            <div className="mt-6 h-px bg-linear-to-r from-[#7c3aed]/30 via-[#a855f7]/20 to-transparent" />
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
                        ? "bg-purple-500/10 text-purple-300"
                        : s.id === "danger"
                          ? "text-white0 hover:text-red-400 hover:bg-red-500/6"
                          : "text-[#a8a8a8] hover:text-[#f0f0f0] hover:bg-white/4"
                    } ${s.id === "danger" ? "mt-2 lg:mt-4" : ""}`}
                  >
                    {activeSection === s.id && (
                      <span className="absolute left-0 inset-y-2 w-0.5 rounded-r-full bg-linear-to-b from-[#7c3aed] to-[#a855f7]" />
                    )}
                    <s.Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        activeSection === s.id
                          ? "text-purple-400"
                          : s.id === "danger"
                            ? "text-[#6b6b6b] group-hover:text-red-400"
                            : "text-white0 group-hover:text-[#d4d4d4]"
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
                          <div className="p-0.5 rounded-full bg-linear-to-br from-[#7c3aed] to-[#a855f7] shadow-[0_0_16px_rgba(168,85,247,0.25)]">
                            <div className="w-20 h-20 rounded-full bg-[#1c1c1c] flex items-center justify-center overflow-hidden">
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
                            {uploadingAvatar ? "Uploading…" : "Change photo"}
                          </button>
                          <p className="text-xs text-[#6b6b6b] mt-1.5">JPG, PNG, GIF up to 2MB</p>
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
                        <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-1.5">
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
                        <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email ?? ""}
                          disabled
                          className={INPUT_CLS}
                        />
                        <p className="text-xs text-[#6b6b6b] mt-1.5">Email cannot be changed here.</p>
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
                    <div className="space-y-7">
                      {/* Plan badge */}
                      <div className="flex items-center gap-3">
                        <span
                          style={profile?.plan === "pro"
                            ? { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.25)", background: "transparent" }
                            : { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }
                          }
                        >
                          {profile?.plan === "pro" ? "PRO" : "FREE"}
                        </span>
                        <span className="text-sm text-white0">Current plan</span>
                      </div>

                      {/* Usage bar */}
                      <div className="rounded-xl border border-white/10 bg-[#1c1c1c]/40 p-5">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="font-medium text-[#d4d4d4]">Generations used</span>
                          <span className="font-bold text-[#d4d4d4]">
                            {profile?.generations_used ?? 0}
                            <span className="font-normal text-white0"> / {profile?.generations_limit ?? 10}</span>
                          </span>
                        </div>
                        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              usagePercent >= 90
                                ? "bg-linear-to-r from-red-500 to-red-400"
                                : usagePercent >= 70
                                  ? "bg-linear-to-r from-yellow-500 to-amber-400"
                                  : "bg-linear-to-r from-[#7c3aed] to-[#a855f7]"
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#6b6b6b] mt-2">
                          {Math.max(0, (profile?.generations_limit ?? 10) - (profile?.generations_used ?? 0))} remaining this month
                        </p>
                      </div>

                      {profile?.plan !== "pro" && (
                        <div className="rounded-2xl border border-purple-500/20 bg-linear-to-br from-purple-500/8 to-[#a855f7]/4 p-6">
                          <p className="font-bold text-[#f0f0f0] text-base mb-1.5">Upgrade to Pro</p>
                          <p className="text-sm text-[#a8a8a8] mb-5 leading-relaxed">
                            Unlimited generations, all 3 email frameworks, follow-up sequences, and priority support.
                          </p>
                          <Link
                            href="/pricing"
                            className="inline-block rounded-xl bg-linear-to-r from-[#7c3aed] to-[#a855f7] px-6 py-3 text-sm font-bold text-white hover:opacity-90 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)] transition-all"
                          >
                            Upgrade for $9.99/mo
                          </Link>
                        </div>
                      )}

                      {profile?.plan === "pro" && (
                        <div className="rounded-xl border border-white/10 bg-[#1c1c1c]/40 p-5">
                          <p className="text-sm text-[#d4d4d4] font-medium mb-1">Pro plan, billed monthly</p>
                          <p className="text-sm text-white0 mb-4">
                            Billing is managed through Stripe. Cancel anytime.
                          </p>
                          <button className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
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
                    <div className="space-y-7">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard
                          label="Generations used"
                          value={String(profile?.generations_used ?? 0)}
                          sub="total"
                        />
                        <StatCard
                          label="Remaining"
                          value={String(Math.max(0, (profile?.generations_limit ?? 10) - (profile?.generations_used ?? 0)))}
                          sub={`of ${profile?.generations_limit ?? 10}`}
                        />
                        <StatCard
                          label="Avg. score"
                          value={avgScore != null ? `${avgScore}/10` : "—"}
                          sub="last 10 gens"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-[#d4d4d4] mb-4">Recent generations</h3>
                        {history.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-white/10 py-14 text-center">
                            <Zap className="w-6 h-6 text-[#6b6b6b] mx-auto mb-2" />
                            <p className="text-[#6b6b6b] text-sm">No generations yet</p>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-white/10 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/10 bg-[#1c1c1c]/80">
                                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white0 uppercase tracking-wider">URL</th>
                                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white0 uppercase tracking-wider hidden sm:table-cell">Date</th>
                                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-white0 uppercase tracking-wider">Score</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/8">
                                {history.map((h, i) => (
                                  <tr
                                    key={h.id}
                                    className={`transition-colors hover:bg-white/4 ${i % 2 === 0 ? "bg-transparent" : "bg-white/3"}`}
                                  >
                                    <td className="px-5 py-3.5 text-[#d4d4d4] truncate max-w-50">
                                      <a
                                        href={h.prospect_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-purple-400 transition-colors"
                                      >
                                        {h.prospect_url.replace(/^https?:\/\//, "")}
                                      </a>
                                    </td>
                                    <td className="px-5 py-3.5 text-white0 text-xs hidden sm:table-cell">
                                      {new Date(h.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                      {h.score != null ? (
                                        <span
                                          style={h.score >= 8
                                            ? { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0" }
                                            : h.score >= 5
                                              ? { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#a16207", background: "#fefce8", border: "1px solid #fde68a" }
                                              : { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca" }
                                          }
                                        >
                                          {h.score}/10
                                        </span>
                                      ) : (
                                        <span className="text-[#6b6b6b] text-xs">—</span>
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
                  <div className="space-y-6">
                    <PrefField
                      label="Default Email Tone"
                      description="The writing style applied to all generated emails."
                    >
                      <select value={prefTone} onChange={(e) => setPrefTone(e.target.value)} className={SELECT_CLS}>
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Bold</option>
                        <option>Friendly</option>
                      </select>
                    </PrefField>

                    <PrefField
                      label="Default Industry"
                      description="Pre-fills the industry field in the generator for faster setup."
                    >
                      <select value={prefIndustry} onChange={(e) => setPrefIndustry(e.target.value)} className={SELECT_CLS}>
                        <option>Auto-detect</option>
                        <option>B2B Agency</option>
                        <option>SaaS</option>
                        <option>Consulting</option>
                        <option>Ecommerce</option>
                      </select>
                    </PrefField>

                    <PrefField
                      label="Default Framework"
                      description="The email framework used by default. You can always override per session."
                    >
                      <select value={prefFramework} onChange={(e) => setPrefFramework(e.target.value)} className={SELECT_CLS}>
                        <option>All 3</option>
                        <option>The Direct (PAS)</option>
                        <option>Value-First</option>
                        <option>The Curious</option>
                      </select>
                    </PrefField>

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
                      <h3 className="text-sm font-semibold text-[#d4d4d4] mb-3">Connected Accounts</h3>
                      <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/8">
                        <div className="flex items-center justify-between px-5 py-4 bg-white/3">
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-[#a8a8a8]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#d4d4d4]">Email / Password</p>
                              <p className="text-xs text-white0 mt-0.5">{user.email}</p>
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
                              <p className="text-xs text-white0 mt-0.5">OAuth 2.0</p>
                            </div>
                          </div>
                          <span style={isGoogleUser
                            ? { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", background: "transparent" }
                            : { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }
                          }>
                            {isGoogleUser ? "Connected" : "Not connected"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Change password */}
                    {!isGoogleUser && (
                      <div>
                        <h3 className="text-sm font-semibold text-[#d4d4d4] mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-1.5">
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
                            <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-1.5">
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
                      <div className="rounded-xl border border-white/10 bg-[#1c1c1c]/30 p-5">
                        <p className="text-sm text-[#a8a8a8]">
                          You signed in with Google. Password management is handled by your Google account.
                        </p>
                      </div>
                    )}

                    {/* Session */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#d4d4d4] mb-3">Session</h3>
                      <button
                        onClick={handleSignOut}
                        className="rounded-xl border border-white/12 px-5 py-2.5 text-sm font-medium text-[#a8a8a8] hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/6 transition-all"
                      >
                        Sign out of all devices
                      </button>
                    </div>
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
                {deleting ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children, titleClass = "text-[#f8f8f8]" }: { title: string; children: React.ReactNode; titleClass?: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#141414] p-8">
      <h2 className={`text-xl font-bold ${titleClass}`}>{title}</h2>
      <div className="h-px bg-white/8 mt-4 mb-7" />
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
      <p className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-black text-white leading-none">{value}</p>
      <p className="text-xs text-[#6b6b6b] mt-1.5">{sub}</p>
    </div>
  );
}

function PrefField({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#d4d4d4] mb-0.5">{label}</label>
      <p className="text-xs text-white0 mb-2">{description}</p>
      {children}
    </div>
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
        className="rounded-xl bg-linear-to-r from-[#7c3aed] to-[#a855f7] px-8 py-3 text-sm font-bold text-white hover:opacity-90 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
