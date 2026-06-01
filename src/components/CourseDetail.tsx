/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Course, User } from "../types";
import { ChevronLeft, Play, Award, CheckCircle2, Circle, AlertCircle, Sparkles } from "lucide-react";

interface CourseDetailProps {
  user: User;
  course: Course;
  onBack: () => void;
  onEnroll: (courseId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onTriggerQuiz: () => void;
  onTriggerCertificate: () => void;
}

export default function CourseDetail({
  user,
  course,
  onBack,
  onEnroll,
  onSelectLesson,
  onTriggerQuiz,
  onTriggerCertificate
}: CourseDetailProps) {
  const isEnrolled = user.coursesEnrolled?.includes(course._id);
  const courseProgress = user.progress?.find((p) => p.courseId === course._id);
  const completedQuiz = !!courseProgress?.completedQuiz;
  
  // Rating generator
  const ratingStars = "★★★★★";

  // Calculate lesson progress
  const getLessonState = (lessonId: string) => {
    const detail = courseProgress?.lessons?.find((l) => l.lessonId === lessonId);
    return {
      isCompleted: !!detail?.isCompleted,
      playedSeconds: detail?.playedSeconds || 0
    };
  };

  const totalLessonsCount = course.lessons.length || 1;
  const completedLessonsCount = courseProgress?.lessons?.filter((l) => l.isCompleted).length || 0;
  const allLessonsCompleted = completedLessonsCount === course.lessons.length;

  return (
    <div id="course-details-panel" className="pb-24 max-w-4xl mx-auto space-y-8 text-white font-sans">
      {/* Return Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition cursor-pointer mb-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Discovery</span>
      </button>

      {/* Hero Visual Block */}
      <div id="course-hero-card" className="relative group rounded-2xl overflow-hidden aspect-video border border-neutral-800 shadow-xl">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end p-6 md:p-10">
          <div className="space-y-3 max-w-2xl relative z-10 w-full">
            <span className="text-xs font-bold font-mono tracking-widest text-[#E50914] bg-black/60 px-2.5 py-1 rounded">
              {course.category.toUpperCase()} MASTERCLASS
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-none mt-1">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-300">
              <span className="text-amber-400 font-bold">{ratingStars} (4.9 Rating)</span>
              <span className="text-neutral-500">•</span>
              <span>by {course.instructor}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-gray-400 font-mono text-xs">{course.lessons.length} video lectures</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Column Breakdown */}
      <div id="course-content-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Course Description & Curriculum */}
        <div className="md:col-span-2 space-y-6">
          <div id="course-overview-section" className="bg-[#161617] rounded-xl p-6 border border-neutral-800 space-y-3">
            <h2 className="text-lg font-bold tracking-tight text-white">Course Overview</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{course.description}</p>
          </div>

          <div id="lessons-curriculum" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-white">Lectures Index</h2>
              {isEnrolled && (
                <span className="text-xs font-semibold text-gray-400">
                  {completedLessonsCount} of {totalLessonsCount} Completed
                </span>
              )}
            </div>

            <div className="space-y-3">
              {course.lessons.map((lesson, idx) => {
                const lessonState = getLessonState(lesson._id);
                return (
                  <div
                    key={lesson._id}
                    onClick={() => {
                      if (!isEnrolled) {
                        onEnroll(course._id);
                      }
                      onSelectLesson(lesson._id);
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                      lessonState.isCompleted
                        ? "bg-[#181C19] border-green-900/40 hover:border-green-800"
                        : "bg-[#161617] border-neutral-800 hover:border-neutral-750"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isEnrolled ? (
                        lessonState.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-600 shrink-0" />
                        )
                      ) : (
                        <Circle className="w-5 h-5 text-gray-600 shrink-0" />
                      )}
                      
                      <div className="space-y-0.5">
                        <span className="text-xxs font-mono font-bold text-gray-400 uppercase">
                          LECTURE {idx + 1}
                        </span>
                        <h4 className="text-sm font-semibold tracking-tight text-neutral-100 line-clamp-1">
                          {lesson.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono shrink-0">
                      <span>{lesson.duration}</span>
                      <div className="p-2 rounded-full bg-neutral-900 text-gray-400 hover:text-white transition">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Controls (Action Hub) */}
        <div id="course-actions-sidebar" className="space-y-6">
          <div className="bg-[#161617] rounded-xl p-6 border border-neutral-800 space-y-4 shadow-md text-center">
            <h3 className="font-extrabold text-[#E50914] text-xs font-mono uppercase tracking-widest">
              Tuition Status
            </h3>
            
            {course.price > 0 ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold font-mono text-amber-400">${course.price}</div>
                <div className="text-[10px] text-gray-500">Premium Video Curriculum</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold font-mono text-green-500">FREE</div>
                <div className="text-[10px] text-gray-500">Open Educational License</div>
              </div>
            )}

            {!isEnrolled ? (
              <button
                onClick={() => onEnroll(course._id)}
                className="w-full bg-[#E50914] hover:bg-[#b8070f] text-white font-bold py-3 px-4 rounded-xl text-sm tracking-wide cursor-pointer flex items-center justify-center gap-2 transition transform hover:scale-[1.02]"
              >
                <span>Enroll & Start watching</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-850 space-y-1 text-left">
                  <span className="block text-[10px] text-gray-500 font-mono uppercase">Your Progress</span>
                  <div className="flex justify-between font-mono text-xs font-semibold mb-1">
                    <span>LECTURES</span>
                    <span className="text-[#E50914]">{completedLessonsCount} / {totalLessonsCount}</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition"
                      style={{ width: `${(completedLessonsCount / totalLessonsCount) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const nextToWatch = course.lessons.find(l => !getLessonState(l._id).isCompleted) || course.lessons[0];
                    if (nextToWatch) onSelectLesson(nextToWatch._id);
                  }}
                  className="w-full bg-neutral-800 hover:bg-neutral-750 text-white font-semibold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition border border-neutral-700"
                >
                  Continue Lectures
                </button>
              </div>
            )}
          </div>

          {/* Core certifications Gate */}
          {isEnrolled && (
            <div className="bg-[#1C1613] rounded-xl p-6 border border-amber-900/30 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="font-bold text-sm tracking-tight text-white font-sans">
                  Certification Exam
                </h3>
              </div>

              <div className="text-[11px] text-gray-300 leading-relaxed space-y-2">
                <p>Complete all module lectures & pass the final qualification test (score 70% or more) to receive your official certificate.</p>
                {!allLessonsCompleted && (
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Watch remaining videos to prepare</span>
                  </div>
                )}
              </div>

              {completedQuiz ? (
                <button
                  onClick={onTriggerCertificate}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-[#121212] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition transform hover:scale-[1.02]"
                >
                  <Award className="w-4 h-4" />
                  <span>Claim Certificate</span>
                </button>
              ) : (
                <button
                  onClick={onTriggerQuiz}
                  disabled={!allLessonsCompleted}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold leading-normal flex items-center justify-center gap-1.5 transition ${
                    allLessonsCompleted
                      ? "bg-[#E50914] cursor-pointer hover:bg-[#b8070f] text-white"
                      : "bg-neutral-900/80 cursor-not-allowed text-gray-500 border border-neutral-850"
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Take Course Quiz</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
