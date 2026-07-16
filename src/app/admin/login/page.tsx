"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (data.user?.email !== adminEmail) {
      await supabase.auth.signOut();
      setError("This account is not authorized for admin access.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#070b09] px-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#101614] border border-border-custom rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1e3f20]/5 dark:bg-[#dfb15b]/10 flex items-center justify-center text-[#dfb15b]">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-xl text-foreground font-semibold">Admin Sign In</h1>
          <p className="text-xs text-muted-text font-light">
            The Unshaken Self — Launch Analytics Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-stone-50 dark:bg-[#070b09] border border-border-custom rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#dfb15b]/40 text-foreground"
              required
            />
          </div>

          {error && (
            <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg text-[10px] text-red-500 font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#1e3f20] hover:bg-[#142a15] dark:bg-[#dfb15b] dark:hover:bg-[#c49945] text-white dark:text-black text-xs uppercase tracking-widest font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-text hover:text-foreground transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Back to Site</span>
        </Link>
      </div>
    </div>
  );
}
