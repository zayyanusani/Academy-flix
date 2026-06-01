/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Course, User } from "./types";
import Splash from "./components/Splash";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import CourseDetail from "./components/CourseDetail";
import VideoPlayer from "./components/VideoPlayer";
import QuizView from "./components/QuizView";
import CertificateView from "./components/CertificateView";
import AdminPanel from "./components/AdminPanel";
import { Play, LogOut, Settings, Award, Users, BookOpen, User as UserIcon } from "lucide-react";

type ViewState =
  | "SPLASH"
  | "AUTH"
  | "DASHBOARD"
  | "COURSE_DETAIL"
  | "VIDEO_PLAYER"
  | "QUIZ"
  | "CERTIFICATE"
  | "ADMIN";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("SPLASH");
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Fetch courses from server API
  const loadCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Could not download training syllabus catalogs.");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Course load failure", error);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Update dynamic user progress locally and sync on API callbacks
  const handleProgressUpdate = async (lessonId: string, playedSeconds: number, isCompleted: boolean) => {
    if (!user || !selectedCourse) return;

    try {
      const res = await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          courseId: selectedCourse._id,
          lessonId,
          playedSeconds,
          isCompleted
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        // Sync selected Course reference to refresh lessons checklists immediately
        const refreshedCourse = courses.find(c => c._id === selectedCourse._id);
        if (refreshedCourse) {
          setSelectedCourse(refreshedCourse);
        }
      }
    } catch (error) {
      console.error("Failed syncing progress", error);
    }
  };

  const handleEnrollUser = async (courseId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          courseId
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Enrollment procedure failed", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("AUTH");
    setSelectedCourse(null);
    setSelectedLessonId(null);
  };

  // Content switcher
  const renderMainContent = () => {
    switch (currentView) {
      case "SPLASH":
        return (
          <Splash
            onComplete={() => {
              setCurrentView("AUTH");
            }}
          />
        );

      case "AUTH":
        return (
          <Auth
            onAuthSuccess={(authenticatedUser) => {
              setUser(authenticatedUser);
              setCurrentView("DASHBOARD");
            }}
          />
        );

      case "DASHBOARD":
        if (!user) return null;
        return (
          <Dashboard
            user={user}
            courses={courses}
            onSelectCourse={(course) => {
              setSelectedCourse(course);
              setCurrentView("COURSE_DETAIL");
            }}
            onEnroll={handleEnrollUser}
          />
        );

      case "COURSE_DETAIL":
        if (!user || !selectedCourse) return null;
        return (
          <CourseDetail
            user={user}
            course={selectedCourse}
            onBack={() => {
              setCurrentView("DASHBOARD");
              setSelectedCourse(null);
            }}
            onEnroll={handleEnrollUser}
            onSelectLesson={(lessonId) => {
              setSelectedLessonId(lessonId);
              setCurrentView("VIDEO_PLAYER");
            }}
            onTriggerQuiz={() => {
              setCurrentView("QUIZ");
            }}
            onTriggerCertificate={() => {
              setCurrentView("CERTIFICATE");
            }}
          />
        );

      case "VIDEO_PLAYER":
        if (!user || !selectedCourse || !selectedLessonId) return null;
        return (
          <VideoPlayer
            user={user}
            course={selectedCourse}
            lessonId={selectedLessonId}
            onBack={() => {
              setCurrentView("COURSE_DETAIL");
              setSelectedLessonId(null);
            }}
            onLessonChange={(lesId) => {
              setSelectedLessonId(lesId);
            }}
            onProgressUpdate={handleProgressUpdate}
          />
        );

      case "QUIZ":
        if (!user || !selectedCourse) return null;
        return (
          <QuizView
            user={user}
            course={selectedCourse}
            onBack={() => {
              setCurrentView("COURSE_DETAIL");
            }}
            onQuizPassed={(updatedUser) => {
              setUser(updatedUser);
            }}
          />
        );

      case "CERTIFICATE":
        if (!user || !selectedCourse) return null;
        return (
          <CertificateView
            user={user}
            course={selectedCourse}
            onBack={() => {
              setCurrentView("COURSE_DETAIL");
            }}
          />
        );

      case "ADMIN":
        return (
          <AdminPanel
            onBackToDashboard={() => {
              setCurrentView("DASHBOARD");
            }}
            courses={courses}
            onRefreshDatabase={() => {
              loadCourses();
            }}
          />
        );

      default:
        return null;
    }
  };

  // Global styled shell
  const isOuterNavVisible = currentView !== "SPLASH" && currentView !== "AUTH";

  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#E4E4E7] font-sans transition">
      {/* Platform Header Navigation */}
      {isOuterNavVisible && user && (
        <header className="sticky top-0 z-45 bg-[#0F0F10]/95 backdrop-blur-md border-b border-neutral-900 select-none px-4 md:px-8 py-4.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Brand Logo */}
            <div
              onClick={() => {
                setCurrentView("DASHBOARD");
                setSelectedCourse(null);
                setSelectedLessonId(null);
              }}
              className="flex items-center gap-2 cursor-pointer transition transform active:scale-95 shrink-0"
            >
              <div className="bg-[#E50914] p-2 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(229,9,20,0.5)]">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-lg md:text-xl font-extrabold tracking-tighter text-white font-sans">
                ACADEMY<span className="text-[#E50914]">FLIX</span>
              </span>
            </div>

            {/* Actions Panel */}
            <div className="flex items-center gap-4">
              
              {/* Profile card badge */}
              <div className="hidden sm:flex items-center gap-2 p-1.5 bg-neutral-900/60 rounded-xl border border-neutral-850 px-3">
                <img
                  src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover border border-neutral-700 bg-neutral-950 font-sans text-xxs block font-extrabold"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-bold text-gray-200 truncate max-w-[100px]">
                  {user.name}
                </span>

                {user.isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono leading-none tracking-widest font-extrabold text-amber-500 uppercase bg-amber-500/10 border border-amber-950/40">
                    FACULTY
                  </span>
                )}
              </div>

              {/* Enter Admin Dashboard switch */}
              {user.isAdmin && (
                <button
                  onClick={() => {
                    setCurrentView(currentView === "ADMIN" ? "DASHBOARD" : "ADMIN");
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 text-xs font-semibold ${
                    currentView === "ADMIN"
                      ? "bg-amber-500 text-black shadow-lg"
                      : "bg-neutral-900 hover:bg-neutral-850 text-gray-300 border border-neutral-800"
                  }`}
                  title="Toggle Admin Control Center"
                >
                  <Settings className={`w-4 h-4 ${currentView === "ADMIN" ? "animate-spin" : ""}`} />
                  <span className="hidden md:inline">Faculty Dashboard</span>
                </button>
              )}

              {/* Logout icon */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-gray-400 hover:text-white border border-neutral-800 cursor-pointer transition flex items-center gap-1 text-xs"
                title="Sign Out Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Primary Application Render Center */}
      <main className={isOuterNavVisible ? "max-w-7xl mx-auto px-4 md:px-8 pt-8" : ""}>
        {renderMainContent()}
      </main>
    </div>
  );
}
