/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Course, Lesson, Quiz, Question, Analytics, User } from "../types";
import { Plus, Trash, Edit, Check, Tv, Award, Users, BookOpen, AlertCircle, Info, UploadCloud, Save } from "lucide-react";

interface AdminPanelProps {
  onBackToDashboard: () => void;
  courses: Course[];
  onRefreshDatabase: () => void;
}

type MenuSelection = "dashboard" | "courses" | "students";

export default function AdminPanel({ onBackToDashboard, courses, onRefreshDatabase }: AdminPanelProps) {
  const [activeMenu, setActiveMenu] = useState<MenuSelection>("dashboard");
  const [analytics, setAnalytics] = useState<Analytics>({
    totalEnrollments: 0,
    completedQuizzes: 0,
    totalStudents: 0,
    totalCourses: 0
  });
  const [studentAccounts, setStudentAccounts] = useState<any[]>([]);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  // Admin Course Creation Form State
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCategory, setCourseCategory] = useState<"Design" | "Development" | "Marketing" | "Business">("Design");
  const [courseInstructor, setCourseInstructor] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [coursePrice, setCoursePrice] = useState("0");

  // Selection state for specific course lessons/quizzes
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonUrl, setNewLessonUrl] = useState("Ke90Tje7VS0");
  const [newLessonDuration, setNewLessonDuration] = useState("10 mins");

  // Selection state for quiz questions
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptionA, setNewOptionA] = useState("");
  const [newOptionB, setNewOptionB] = useState("");
  const [newOptionC, setNewOptionC] = useState("");
  const [newOptionD, setNewOptionD] = useState("");
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);

  // Load analytics and list of students
  const fetchAnalyticsAndStudents = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Could not load administrative telemetry system.");
      const data = await res.json();
      setAnalytics({
        totalEnrollments: data.totalEnrollments,
        completedQuizzes: data.completedQuizzes,
        totalStudents: data.totalStudents,
        totalCourses: data.totalCourses
      });
      setStudentAccounts(data.students || []);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to load administrative analytics.");
    }
  };

  useEffect(() => {
    fetchAnalyticsAndStudents();
    if (courses.length > 0) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses]);

  const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    const payload = {
      title: courseTitle,
      description: courseDesc,
      category: courseCategory,
      instructor: courseInstructor || "Faculty Member",
      thumbnail: courseThumbnail || "https://images.unsplash.com/photo-1561070791-26c113006238?w=800",
      price: parseFloat(coursePrice) || 0
    };

    try {
      const url = editingCourseId ? `/api/courses/${editingCourseId}` : "/api/courses";
      const method = editingCourseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish course curriculum.");

      setSuccessText(editingCourseId ? "Course data modified successfully!" : "New Course module published successfully!");
      
      // Reset form
      setEditingCourseId(null);
      setCourseTitle("");
      setCourseDesc("");
      setCourseInstructor("");
      setCourseThumbnail("");
      setCoursePrice("0");
      
      onRefreshDatabase();
      fetchAnalyticsAndStudents();
    } catch (err: any) {
      setErrorText(err.message || "Could not publish course data.");
    }
  };

  const handleEditCourseInitiate = (course: Course) => {
    setEditingCourseId(course._id);
    setCourseTitle(course.title);
    setCourseDesc(course.description);
    setCourseCategory(course.category);
    setCourseInstructor(course.instructor);
    setCourseThumbnail(course.thumbnail);
    setCoursePrice(course.price.toString());
    setActiveMenu("courses");
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Verify: Are you absolutely sure you want to delete this course and its curriculum permanently?")) {
      return;
    }
    setErrorText("");
    setSuccessText("");

    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessText("Course module deleted successfully.");
      onRefreshDatabase();
      fetchAnalyticsAndStudents();
    } catch (err: any) {
      setErrorText(err.message || "Failed to drop course.");
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (!selectedCourseId) {
      setErrorText("Kindly choose a course to bind lectures to first.");
      return;
    }

    const courseToModify = courses.find((c) => c._id === selectedCourseId);
    if (!courseToModify) return;

    // Append new lesson definition to current lists
    const updatedLessons = [
      ...courseToModify.lessons,
      {
        title: newLessonTitle,
        videoUrl: newLessonUrl,
        duration: newLessonDuration
      }
    ];

    try {
      const res = await fetch(`/api/courses/${selectedCourseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessons: updatedLessons
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessText("Lecture module appended successfully!");
      setNewLessonTitle("");
      setNewLessonUrl("Ke90Tje7VS0");
      setNewLessonDuration("10 mins");
      onRefreshDatabase();
    } catch (err: any) {
      setErrorText(err.message || "Unable to append lecture.");
    }
  };

  const handleDeleteLesson = async (courseId: string, lessonId: string) => {
    const courseToModify = courses.find((c) => c._id === courseId);
    if (!courseToModify) return;

    const filteredLessons = courseToModify.lessons.filter((l) => l._id !== lessonId);

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessons: filteredLessons })
      });
      if (!res.ok) throw new Error("Could not update syllabus.");

      setSuccessText("Lesson index removed successfully.");
      onRefreshDatabase();
    } catch (err: any) {
      setErrorText(err.message || "Could not drop lesson.");
    }
  };

  // Add Question to Quiz
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (!selectedCourseId) {
      setErrorText("Select a course first.");
      return;
    }

    const courseToModify = courses.find((c) => c._id === selectedCourseId);
    if (!courseToModify) return;

    const quizQuestions = courseToModify.quiz?.questions || [];
    const newQuestion: Question = {
      questionText: newQuestionText,
      options: [newOptionA, newOptionB, newOptionC, newOptionD].filter(Boolean),
      correctAnswerIndex: correctOptionIdx
    };

    if (newQuestion.options.length < 2) {
      setErrorText("A valid quiz question requires at least two descriptive choices.");
      return;
    }

    const updatedQuiz = {
      questions: [...quizQuestions, newQuestion]
    };

    try {
      const res = await fetch(`/api/courses/${selectedCourseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz: updatedQuiz })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessText("Quiz question compiled successfully!");
      setNewQuestionText("");
      setNewOptionA("");
      setNewOptionB("");
      setNewOptionC("");
      setNewOptionD("");
      setCorrectOptionIdx(0);
      onRefreshDatabase();
    } catch (err: any) {
      setErrorText(err.message || "Failed to append quiz item.");
    }
  };

  const handleDeleteQuizQuestion = async (courseId: string, qIdx: number) => {
    const courseToModify = courses.find((c) => c._id === courseId);
    if (!courseToModify) return;

    const questions = courseToModify.quiz?.questions || [];
    const updatedQuestions = questions.filter((_, idx) => idx !== qIdx);

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz: { questions: updatedQuestions } })
      });
      if (!res.ok) throw new Error("Failed to prune question.");

      setSuccessText("Test question pruned successfully.");
      onRefreshDatabase();
    } catch (err: any) {
      setErrorText(err.message || "Could not remove question.");
    }
  };

  const selectedCourseRef = courses.find((c) => c._id === selectedCourseId);

  return (
    <div id="admin-management-vault" className="space-y-8 pb-32 text-white font-sans max-w-6xl mx-auto">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-5 gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#E50914] font-extrabold bg-[#E50914]/5 md:px-2.5 py-1 rounded">
            ADMINISTRATOR CONSOLE PORTAL
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Faculty Manager Suite</h1>
        </div>

        <button
          onClick={onBackToDashboard}
          className="bg-neutral-800 hover:bg-neutral-750 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition border border-neutral-700 hover:border-red-500/30"
        >
          <span>Return Student Mode</span>
        </button>
      </div>

      {/* Notifications Module */}
      {(errorText || successText) && (
        <div className="space-y-2">
          {errorText && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}
          {successText && (
            <div className="p-3.5 bg-green-500/15 border border-green-500/20 text-green-400 rounded-xl text-xs flex gap-2 items-center">
              <Check className="w-5 h-5 shrink-0" />
              <span>{successText}</span>
            </div>
          )}
        </div>
      )}

      {/* Admin Tab Switching Navigation */}
      <div id="admin-tabs" className="flex border-b border-neutral-800/80 gap-2">
        <button
          onClick={() => { setActiveMenu("dashboard"); setErrorText(""); setSuccessText(""); }}
          className={`px-4 py-2.5 text-xs font-bold leading-normal relative transition cursor-pointer select-none ${
            activeMenu === "dashboard" ? "text-[#E50914]" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>Telemetry Dashboard</span>
          {activeMenu === "dashboard" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E50914]" />}
        </button>

        <button
          onClick={() => { setActiveMenu("courses"); setErrorText(""); setSuccessText(""); }}
          className={`px-4 py-2.5 text-xs font-bold leading-normal relative transition cursor-pointer select-none ${
            activeMenu === "courses" ? "text-[#E50914]" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>Course Catalog Creator</span>
          {activeMenu === "courses" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E50914]" />}
        </button>

        <button
          onClick={() => { setActiveMenu("students"); setErrorText(""); setSuccessText(""); }}
          className={`px-4 py-2.5 text-xs font-bold leading-normal relative transition cursor-pointer select-none ${
            activeMenu === "students" ? "text-[#E50914]" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>Student Ledger Tracks</span>
          {activeMenu === "students" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E50914]" />}
        </button>
      </div>

      {/* SUB-PANEL: TELEMETRY DASHBOARD */}
      {activeMenu === "dashboard" && (
        <div className="space-y-10">
          
          {/* KPI Mini grids */}
          <div id="kpi-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#161617] rounded-2xl p-5 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Students</span>
                <Users className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{analytics.totalStudents}</div>
              <span className="text-[9px] text-gray-400 font-mono">Active Student Accounts</span>
            </div>

            <div className="bg-[#161617] rounded-2xl p-5 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Enrollments</span>
                <BookOpen className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{analytics.totalEnrollments}</div>
              <span className="text-[9px] text-gray-400 font-mono">Course Syllabus Enrollment</span>
            </div>

            <div className="bg-[#161617] rounded-2xl p-5 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Course Count</span>
                <Tv className="w-5 h-5 text-pink-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{analytics.totalCourses}</div>
              <span className="text-[9px] text-gray-400 font-mono">Total Courseware Tracks</span>
            </div>

            <div className="bg-[#161617] rounded-2xl p-5 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Quiz Passed</span>
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{analytics.completedQuizzes}</div>
              <span className="text-[9px] text-gray-400 font-mono">Issued Certifications</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Catalog List */}
            <div className="bg-[#161617] rounded-2xl p-6 border border-neutral-800 space-y-4">
              <h3 className="font-bold text-sm tracking-tight text-neutral-100 font-sans uppercase">Active Course Outline ({courses.length})</h3>
              
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {courses.map((c) => (
                  <div key={`short-${c._id}`} className="flex items-center justify-between p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-850">
                    <div className="flex items-center gap-3">
                      <img src={c.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div>
                        <span className="text-[9px] text-[#E50914] font-bold tracking-wider font-mono uppercase block">{c.category}</span>
                        <h4 className="text-xs font-semibold text-white line-clamp-1">{c.title}</h4>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCourseInitiate(c)}
                        className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-amber-400 transition cursor-pointer"
                        title="Edit Course metadata"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c._id)}
                        className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-[#E50914] transition cursor-pointer"
                        title="Remove Course permanently"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Quick Guidance */}
            <div className="bg-[#161617] rounded-2xl p-6 border border-neutral-800 space-y-4 leading-relaxed">
              <h3 className="font-bold text-sm tracking-tight text-neutral-100 uppercase">Administration System</h3>
              <div className="space-y-3.5 text-xs text-gray-400">
                <p>Welcome to your Faculty panel! As an administrator, your updates instantly affect the JSON systems running inside the sandbox.</p>
                
                <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-xl space-y-1 flex gap-2 items-start text-[11px]">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Use categories matching precisely <code className="text-white">Design</code>, <code className="text-white">Development</code>, and <code className="text-white">Marketing</code> for correct row discovery on the homepage.</span>
                </div>
                
                <p>To provide dynamic content updates, add real educational content with standard YouTube IDs (e.g. <code className="bg-black text-gray-300 font-mono px-1 rounded text-[10px]">Ke90Tje7VS0</code>) to let students view interactive, audio-capable video lessons directly inside the client portals.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PANEL: COURSE CATALOG CREATOR */}
      {activeMenu === "courses" && (
        <div className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Left Column Form: Create / Edit course metadata */}
            <div className="bg-[#161617] rounded-2xl p-6 border border-neutral-800 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#E50914] font-mono leading-normal">
                {editingCourseId ? "Edit Course Meta" : "Publish New Course"}
              </h3>

              <form onSubmit={handleCreateOrUpdateCourse} className="space-y-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Figma UI Design Tricks"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full bg-neutral-900/60 rounded-xl px-3.5 py-2 border border-neutral-800 text-xs focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe syllabus parameters..."
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full bg-neutral-900/60 rounded-xl px-3.5 py-2 border border-neutral-800 text-xs focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Category</label>
                    <select
                      value={courseCategory}
                      onChange={(e: any) => setCourseCategory(e.target.value)}
                      className="w-full bg-neutral-900/60 rounded-xl px-3.5 py-2 border border-neutral-800 text-xs focus:outline-none focus:border-[#E50914]"
                    >
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Tuition Cost ($)</label>
                    <input
                      type="number"
                      required
                      placeholder="0 for Free"
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
                      className="w-full bg-neutral-900/60 rounded-xl px-3.5 py-2 border border-neutral-800 text-xs focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Instructor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Zayyanu Sani"
                    value={courseInstructor}
                    onChange={(e) => setCourseInstructor(e.target.value)}
                    className="w-full bg-neutral-900/60 rounded-xl px-3.5 py-2 border border-neutral-800 text-xs focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase font-mono tracking-wider mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={courseThumbnail}
                    onChange={(e) => setCourseThumbnail(e.target.value)}
                    className="w-full bg-neutral-900/60 rounded-xl px-3.5 py-2 border border-neutral-800 text-xs focus:outline-none focus:border-[#E50914]"
                  />
                  <span className="text-[10px] text-gray-550 block mt-1 font-mono">Valid JPG/PNG hosted url</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#E50914] hover:bg-[#b8070f] text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingCourseId ? "Save Changes" : "Create Course"}</span>
                  </button>

                  {editingCourseId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourseId(null);
                        setCourseTitle("");
                        setCourseDesc("");
                        setCourseInstructor("");
                        setCourseThumbnail("");
                        setCoursePrice("0");
                      }}
                      className="px-3 bg-neutral-800 hover:bg-neutral-750 text-gray-300 rounded-xl text-xs cursor-pointer border border-neutral-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column: Manage course syllabus (Lessons / Quizzes) */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Course Selection list tab */}
              <div className="bg-[#161617] rounded-2xl p-6 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-bold text-sm tracking-tight text-white uppercase flex items-center gap-1"> Scurry Compiler Selector</h3>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-xs focus:outline-none focus:border-[#E50914] rounded-lg p-2 max-w-sm"
                  >
                    <option value="">-- Choose Course for Lecture & Quiz Editing --</option>
                    {courses.map((c) => (
                      <option key={`opt-sel-${c._id}`} value={c._id}>
                        {c.category.toUpperCase()} • {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCourseRef ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Add/Manage Lessons Section */}
                    <div className="space-y-4 border-r border-[#1C1C1E] pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-[#E50914] rounded-full inline-block"></span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                          Lectures Syllabus ({selectedCourseRef.lessons.length})
                        </h4>
                      </div>

                      <form onSubmit={handleAddLesson} className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-850 space-y-3">
                        <span className="text-[9px] font-mono text-gray-500 uppercase block">Appent Module Tutorial</span>
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Lecture Title"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            className="w-full bg-neutral-950 rounded-lg px-3 py-2 border border-neutral-850 text-xs text-white placeholder-gray-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="YouTube Video ID"
                            value={newLessonUrl}
                            onChange={(e) => setNewLessonUrl(e.target.value)}
                            className="w-full bg-neutral-950 rounded-lg px-3 py-2 border border-neutral-850 text-xs text-white placeholder-gray-500 focus:outline-none"
                            title="e.g. Ke90Tje7VS0"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Duration (e.g. 10 mins)"
                            value={newLessonDuration}
                            onChange={(e) => setNewLessonDuration(e.target.value)}
                            className="w-full bg-neutral-950 rounded-lg px-3 py-2 border border-neutral-850 text-xs text-white placeholder-gray-500 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-neutral-800 hover:bg-[#E50914] text-white font-bold py-2 px-3 rounded-lg text-xxs transition cursor-pointer flex items-center justify-center gap-1 uppercase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Append Video lecture</span>
                        </button>
                      </form>

                      {/* Lesson indices lists */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {selectedCourseRef.lessons.map((les, idx) => (
                          <div key={`les-idx-${les._id}`} className="flex items-center justify-between p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-850">
                            <div className="truncate max-w-[150px]">
                              <span className="block text-[8px] font-mono text-gray-500">LECTURE {idx + 1}</span>
                              <span className="text-xs text-gray-300 font-semibold truncate block">{les.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-gray-550 shrink-0">{les.duration}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(selectedCourseId, les._id)}
                                className="p-1 hover:bg-neutral-800 text-gray-500 hover:text-red-500 shrink-0 cursor-pointer"
                              >
                                <Trash className="w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Manage Quiz Items */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-amber-400 rounded-full inline-block"></span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                          Quiz Exam Questions ({selectedCourseRef.quiz?.questions?.length || 0})
                        </h4>
                      </div>

                      <form onSubmit={handleAddQuestion} className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-850 space-y-3">
                        <span className="text-[9px] font-mono text-gray-500 uppercase block">Add Question block</span>
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Question text?"
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            className="w-full bg-neutral-950 rounded-lg px-3 py-2 border border-neutral-850 text-xs text-white placeholder-gray-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xxs">
                          <input
                            type="text"
                            required
                            placeholder="Option A (Correct)"
                            value={newOptionA}
                            onChange={(e) => setNewOptionA(e.target.value)}
                            className="w-full bg-neutral-950 rounded-lg p-2 border border-neutral-850 placeholder-gray-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Option B"
                            value={newOptionB}
                            onChange={(e) => setNewOptionB(e.target.value)}
                            className="w-full bg-neutral-950 rounded-lg p-2 border border-neutral-850 placeholder-gray-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Option C"
                            value={newOptionC}
                            onChange={(e) => setNewOptionC(e.target.value)}
                            className="w-full bg-neutral-950 rounded-lg p-2 border border-neutral-850 placeholder-gray-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Option D"
                            value={newOptionD}
                            onChange={(e) => setNewOptionD(e.target.value)}
                            className="w-full bg-neutral-950 rounded-lg p-2 border border-neutral-850 placeholder-gray-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xxs text-gray-400">
                          <span>Correct index:</span>
                          <select
                            value={correctOptionIdx}
                            onChange={(e) => setCorrectOptionIdx(parseInt(e.target.value))}
                            className="bg-neutral-950 border border-neutral-850 p-1 rounded font-mono text-[10px]"
                          >
                            <option value={0}>A (Correct Option)</option>
                            <option value={1}>B</option>
                            <option value={2}>C</option>
                            <option value={3}>D</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-neutral-800 hover:bg-amber-500 hover:text-black font-semibold py-2 px-3 rounded-lg text-xxs transition cursor-pointer flex items-center justify-center gap-1 uppercase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Append Exam Question</span>
                        </button>
                      </form>

                      {/* Question Indexing lists */}
                      <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                        {(selectedCourseRef.quiz?.questions || []).map((q, qIdx) => (
                          <div key={`q-idx-${qIdx}`} className="flex items-start justify-between p-2.5 bg-neutral-950/40 rounded-lg border border-neutral-850 gap-2">
                            <span className="text-[10px] text-gray-400 font-semibold line-clamp-1">{q.questionText}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuizQuestion(selectedCourseId, qIdx)}
                              className="p-1 hover:bg-neutral-800 text-gray-500 hover:text-red-500 cursor-pointer shrink-0"
                            >
                              <Trash className="w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="text-center py-10 bg-neutral-950/30 rounded-xl text-gray-500 text-xs">
                    Please select a valid course item above to launch content compilers.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUB-PANEL: STUDENT LEDGER TRACKS */}
      {activeMenu === "students" && (
        <div className="bg-[#161617] rounded-2xl p-6 border border-neutral-800 space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-sm tracking-tight text-white uppercase">Syllabus Registrations Ledger</h3>
            <p className="text-gray-400 text-xs">Audit specific student progression, current enrolled classes, and completed final tests.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs leading-normal">
              <thead>
                <tr className="border-b border-neutral-800 text-gray-500 uppercase tracking-widest font-mono font-bold text-[10px]">
                  <th className="py-3 px-4">Student Profile</th>
                  <th className="py-3 px-4">Role Status</th>
                  <th className="py-3 px-4">Enrolled Course IDs</th>
                  <th className="py-3 px-4">Completed Exams</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {studentAccounts.map((student) => {
                  const certCount = student.progress?.filter((p: any) => p.completedQuiz).length || 0;
                  return (
                    <tr key={student._id} className="hover:bg-neutral-900/30 text-gray-200">
                      <td className="py-4.5 px-4 flex items-center gap-3">
                        <img src={student.profileImage} alt="" className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-950 font-sans text-xxs font-bold object-cover shrink-0" />
                        <div>
                          <span className="font-extrabold text-[#121212] select-none opacity-0 shrink w-0 inline-block">.</span>
                          <span className="font-bold text-neutral-100 block">{student.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono block">{student.email}</span>
                        </div>
                      </td>

                      <td className="py-4.5 px-4">
                        {student.isAdmin ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-amber-500/10 text-amber-500 border border-amber-950/40 uppercase">
                            FACULTY
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-green-500/10 text-green-500 border border-green-950/40 uppercase">
                            STUDENT
                          </span>
                        )}
                      </td>

                      <td className="py-4.5 px-4 font-mono text-[10px] text-gray-400">
                        {student.coursesEnrolled?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {student.coursesEnrolled.map((cid: string) => (
                              <span key={cid} className="bg-neutral-900 border border-neutral-850 px-1.5 py-0.5 rounded text-[9px]">
                                {cid.replace("course-", "")}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">None</span>
                        )}
                      </td>

                      <td className="py-4.5 px-4">
                        {certCount > 0 ? (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black flex items-center justify-center gap-1.5 max-w-[80px]">
                            <Award className="w-3.5 h-3.5 shrink-0" />
                            <span>{certCount} PASSED</span>
                          </span>
                        ) : (
                          <span className="text-gray-500 italic text-[11px]">Uncertified</span>
                        )}
                      </td>

                      <td className="py-4.5 px-4 text-gray-400 font-mono text-[10px]">
                        {student.createdAt}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
