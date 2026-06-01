/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Course, User } from "../types";
import { Search, Play, BookOpen, Clock, Sparkles, Award } from "lucide-react";

interface DashboardProps {
  user: User;
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onEnroll: (courseId: string) => void;
}

export default function Dashboard({ user, courses, onSelectCourse, onEnroll }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Hero Course selector: Pick React or Graphic Design as default
  const heroCourse = courses.find((c) => c._id === "course-graphic") || courses[0];

  // Filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate student course completion ratios
  const getCourseProgress = (courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    if (!course) return null;

    const userProgress = user.progress?.find((p) => p.courseId === courseId);
    if (!userProgress) return { percent: 0, currentLessonIndex: 0, totalLessons: course.lessons.length, completedQuiz: false };

    const totalLessons = course.lessons.length || 1;
    const completedLessonsCount = userProgress.lessons?.filter((l) => l.isCompleted).length || 0;
    
    // Quiz weight: 10% or just standard lesson weights
    const percent = Math.min(
      Math.round(((completedLessonsCount) / totalLessons) * 100),
      100
    );

    return {
      percent,
      completedCount: completedLessonsCount,
      totalLessons,
      completedQuiz: !!userProgress.completedQuiz
    };
  };

  // Determine Continue watching list
  const continueLearningCourses = courses.filter((c) => {
    const enrolled = user.coursesEnrolled?.includes(c._id);
    const prog = getCourseProgress(c._id);
    return enrolled && prog && (prog.percent < 100 || !prog.completedQuiz);
  });

  const categories = ["All", "Design", "Development", "Marketing"];

  return (
    <div id="student-dashboard" className="space-y-12 pb-24 font-sans text-white">
      {/* Cinematic Hero Spotlight Banner */}
      {heroCourse && !searchQuery && selectedCategory === "All" && (
        <div
          id="hero-banner"
          className="relative min-h-[480px] md:min-h-[540px] rounded-2xl overflow-hidden flex items-end p-6 md:p-12 shadow-3xl select-none"
          style={{
            backgroundImage: `linear-gradient(to top, #0F0F10 10%, rgba(15,15,16,0.5) 50%, transparent 100%), url(${heroCourse.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute top-4 left-4 bg-[#E50914] px-3 py-1 rounded text-xs font-bold font-mono tracking-wider shadow">
            FEATURED MASTERCLASS
          </div>

          <div className="max-w-xl space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-0.5 bg-neutral-900/80 border border-neutral-700/60 rounded-full text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {heroCourse.category}
              </span>
              <span className="text-xs text-gray-300 font-medium">by {heroCourse.instructor}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-none">
              {heroCourse.title}
            </h1>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {heroCourse.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => onSelectCourse(heroCourse)}
                className="bg-[#E50914] hover:bg-[#b8070f] text-white font-bold px-6 py-3 rounded-lg text-sm tracking-wide cursor-pointer flex items-center gap-2 transition transform hover:scale-[1.03]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{user.coursesEnrolled?.includes(heroCourse._id) ? "Resume Watch" : "Enroll & Watch"}</span>
              </button>

              <div className="flex gap-4 text-xs md:text-sm text-gray-400 font-medium font-mono">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#E50914]" /> {heroCourse.lessons.length} Modules</span>
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-500" /> Certificate Track</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Shell (Search + Filter Pills) */}
      <div id="discovery-bar" className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-full tracking-wide cursor-pointer transition ${
                selectedCategory === cat
                  ? "bg-[#E50914] text-white shadow-lg"
                  : "bg-neutral-900 hover:bg-neutral-800 text-gray-300 border border-neutral-800"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search classes or fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl py-2 px-4 pl-10 text-xs focus:outline-none focus:border-[#E50914] text-white placeholder-gray-500"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* CONTINUE LEARNING ROW */}
      {continueLearningCourses.length > 0 && !searchQuery && selectedCategory === "All" && (
        <div id="row-continue" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#E50914] rounded-full inline-block"></span>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Continue Learning
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {continueLearningCourses.map((course) => {
              const progress = getCourseProgress(course._id);
              return (
                <div
                  key={`continue-${course._id}`}
                  onClick={() => onSelectCourse(course)}
                  className="bg-neutral-900/60 rounded-xl border border-neutral-800 overflow-hidden cursor-pointer hover:border-neutral-700 group transition transform hover:-translate-y-1"
                >
                  <div className="relative aspect-video">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                      <div className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 group-hover:bg-[#E50914] group-hover:border-transparent transition">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-[#E50914] transition">
                      {course.title}
                    </h3>
                    
                    {progress && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xxs font-mono text-gray-400">
                          <span>{progress.completedCount} / {progress.totalLessons} LESSONS</span>
                          <span className="text-amber-400 font-semibold">{progress.percent}%</span>
                        </div>
                        <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#E50914] h-full rounded-full"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXPANDABLE CATEGORIES ROWS */}
      {selectedCategory === "All" ? (
        categories.slice(1).map((categoryName) => {
          const rowCourses = filteredCourses.filter((c) => c.category === categoryName);
          if (rowCourses.length === 0) return null;

          return (
            <div key={`category-row-${categoryName}`} id={`row-${categoryName}`} className="space-y-4 select-none">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#E50914] rounded-full inline-block"></span>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                  {categoryName}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {rowCourses.map((course) => {
                  const enrolled = user.coursesEnrolled?.includes(course._id);
                  const progress = getCourseProgress(course._id);

                  return (
                    <div
                      key={course._id}
                      onClick={() => onSelectCourse(course)}
                      className="bg-neutral-900/45 rounded-xl border border-neutral-800/80 hover:border-neutral-700/80 overflow-hidden cursor-pointer group transition transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex items-end p-4">
                          <span className="bg-black/50 backdrop-blur-md border border-neutral-800 text-[10px] uppercase tracking-wider text-gray-300 px-2 py-0.5 rounded">
                            {course.instructor}
                          </span>
                        </div>
                        {course.price > 0 && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider shadow">
                            PREMIUM
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-sm text-neutral-100 group-hover:text-[#E50914] transition line-clamp-1">
                          {course.title}
                        </h3>

                        <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-red-500" />
                            {course.lessons.length} Lessons
                          </span>

                          {enrolled && progress ? (
                            <span className="text-[10px] text-amber-400 font-bold font-mono uppercase bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
                              {progress.completedQuiz ? "Completed ✅" : `${progress.percent}%`}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold font-mono uppercase bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded-full">
                              Not Enrolled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div id="row-filtered" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#E50914] rounded-full inline-block"></span>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Results under "{selectedCategory}"
            </h2>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
              <span className="text-3xl">🧩</span>
              <p className="text-gray-400 font-medium">No matching courses found matching that criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => onSelectCourse(course)}
                  className="bg-neutral-900/40 rounded-xl border border-neutral-800 hover:border-neutral-750 overflow-hidden cursor-pointer group transition transform hover:-translate-y-1"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="aspect-video w-full object-cover group-hover:scale-105 transition"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-sm group-hover:text-[#E50914] transition">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-1">{course.instructor}</p>
                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="text-gray-400 font-mono text-[10px]">{course.lessons.length} Lessons</span>
                      <span className="text-[#E50914] font-bold text-[10px] uppercase font-mono bg-neutral-950 px-2 py-0.5 rounded-full">Explore Course</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
