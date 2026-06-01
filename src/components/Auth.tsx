/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../types";
import { motion } from "motion/react";
import { LogIn, UserPlus, Info, Play, ShieldAlert } from "lucide-react";

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setIsLoading(true);

    const url = isSignUp ? "/api/auth/register" : "/api/auth/login";
    const body = isSignUp ? { name, email, password } : { email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication procedure failed.");
      }
      onAuthSuccess(data);
    } catch (err: any) {
      setErrorText(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortcutLogin = async (role: "student" | "admin") => {
    setErrorText("");
    setIsLoading(true);
    const body = {
      email: role === "student" ? "user@email.com" : "admin@academyflix.com",
      password: role === "student" ? "learning123" : "admin123"
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      onAuthSuccess(data);
    } catch (err: any) {
      setErrorText(err.message || "Bypass login triggered an exception.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-container"
      className="relative min-h-screen flex items-center justify-center bg-[#0F0F10] px-4 py-12 select-none"
      style={{
        backgroundImage: "radial-gradient(circle at top, rgba(229,9,20,0.15) 0%, transparent 60%)"
      }}
    >
      <div id="auth-box" className="w-full max-w-md bg-[#161617]/90 backdrop-blur-md rounded-2xl p-8 border border-neutral-800 shadow-2xl relative overflow-hidden z-10">
        <div id="auth-header" className="flex flex-col items-center mb-8">
          <div className="bg-[#E50914] p-2.5 rounded-lg mb-3 shadow-[0_0_15px_rgba(229,9,20,0.4)]">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans text-center">
            ACADEMY<span className="text-[#E50914]">FLIX</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1">Unlimited Learning on Your Schedule</p>
        </div>

        {/* Tab Selection */}
        <div id="auth-tab-row" className="flex bg-neutral-900/80 p-1.5 rounded-xl mb-6 border border-neutral-800">
          <button
            onClick={() => { setIsSignUp(false); setErrorText(""); }}
            className={`flex-1 py-2 text-sm font-semibold tracking-wide rounded-lg cursor-pointer transition ${
              !isSignUp ? "bg-[#1C1C1E] text-[#E50914] shadow" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setErrorText(""); }}
            className={`flex-1 py-12 text-sm font-semibold tracking-wide rounded-lg cursor-pointer transition ${
              isSignUp ? "bg-[#1C1C1E] text-[#E50914] shadow" : "text-gray-400 hover:text-gray-200"
            }`}
            style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
          >
            Register
          </button>
        </div>

        {errorText && (
          <div id="auth-error-banner" className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-xs flex gap-2 items-start mb-6">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div id="field-signup-name">
              <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="Zayyanu Sani"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-900/60 text-white rounded-lg px-4 py-2.5 border border-neutral-800 focus:outline-none focus:border-[#E50914] text-sm"
              />
            </div>
          )}

          <div id="field-auth-email">
            <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900/60 text-white rounded-lg px-4 py-2.5 border border-neutral-800 focus:outline-none focus:border-[#E50914] text-sm"
            />
          </div>

          <div id="field-auth-password">
            <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900/60 text-white rounded-lg px-4 py-2.5 border border-neutral-800 focus:outline-none focus:border-[#E50914] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E50914] hover:bg-[#b8070f] text-white font-semibold py-3 rounded-lg text-sm tracking-wide mt-6 cursor-pointer flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Passes */}
        <div id="demo-passes-separator" className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xxs font-mono uppercase tracking-widest">Demonstration Bypass</span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        <div id="demo-pass-actions" className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleShortcutLogin("student")}
            className="bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 hover:border-[#E50914]/40 py-2.5 px-3 rounded-xl text-center cursor-pointer transition text-xs flex flex-col items-center justify-center gap-1 text-gray-300"
          >
            <span className="font-extrabold text-white text-[11px] font-sans">Quick Student</span>
            <span className="text-[10px] text-[#E50914] font-mono font-medium">user@email.com</span>
          </button>

          <button
            type="button"
            onClick={() => handleShortcutLogin("admin")}
            className="bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 py-2.5 px-3 rounded-xl text-center cursor-pointer transition text-xs flex flex-col items-center justify-center gap-1 text-gray-300"
          >
            <span className="font-extrabold text-white text-[11px] font-sans">Faculty Admin</span>
            <span className="text-[10px] text-amber-500 font-mono font-medium">admin@academyflix.com</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mt-6 p-2.5 bg-neutral-900/30 rounded-lg border border-neutral-900 text-[11px] text-gray-500 leading-normal">
          <Info className="w-4 h-4 text-[#E50914] shrink-0" />
          <span>Both roles are seeded with interactive courses, quizzes, and progression trackers.</span>
        </div>
      </div>
    </div>
  );
}
