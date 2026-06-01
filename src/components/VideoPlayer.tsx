/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Course, Lesson, User } from "../types";
import { ChevronLeft, Play, Pause, Landmark, ChevronRight, CheckCircle2, RotateCcw, Volume2, Maximize, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  user: User;
  course: Course;
  lessonId: string;
  onBack: () => void;
  onLessonChange: (lessonId: string) => void;
  onProgressUpdate: (lessonId: string, playedSeconds: number, isCompleted: boolean) => void;
}

export default function VideoPlayer({
  user,
  course,
  lessonId,
  onBack,
  onLessonChange,
  onProgressUpdate
}: VideoPlayerProps) {
  const currentLessonIndex = course.lessons.findIndex((l) => l._id === lessonId);
  const lesson = course.lessons[currentLessonIndex] || course.lessons[0];

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playedSecs, setPlayedSecs] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(70);

  // Read current progress from user state
  useEffect(() => {
    const courseProgress = user.progress?.find((p) => p.courseId === course._id);
    const progressDetail = courseProgress?.lessons?.find((l) => l.lessonId === lesson._id);
    if (progressDetail) {
      setPlayedSecs(progressDetail.playedSeconds || 0);
      setIsCompleted(!!progressDetail.isCompleted);
    } else {
      setPlayedSecs(0);
      setIsCompleted(false);
    }
    // Autoplay upon switching lectures
    setIsPlaying(true);
  }, [lesson._id, user.progress, course._id]);

  // Periodic simulated progression ticker to emulate watching progress when clicking or browsing
  useEffect(() => {
    let watchInterval: any = null;
    if (isPlaying) {
      watchInterval = setInterval(() => {
        setPlayedSecs((prev) => {
          const next = prev + playbackSpeed * 2;
          // Trigger automatic completion after 120 simulated seconds of watch session or when clicked
          return next;
        });
      }, 2000);
    }
    return () => {
      if (watchInterval) clearInterval(watchInterval);
    };
  }, [isPlaying, playbackSpeed]);

  // Sync to database
  const syncProgress = (completedFlag = false) => {
    onProgressUpdate(lesson._id, playedSecs, completedFlag || isCompleted);
  };

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    onProgressUpdate(lesson._id, playedSecs, nextState);
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) {
      syncProgress();
      onLessonChange(course.lessons[currentLessonIndex - 1]._id);
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      syncProgress();
      onLessonChange(course.lessons[currentLessonIndex + 1]._id);
    }
  };

  return (
    <div id="video-session-viewer" className="max-w-5xl mx-auto space-y-6 text-white font-sans pb-24">
      {/* Upper Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            syncProgress();
            onBack();
          }}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-xs tracking-wide transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Curriculum</span>
        </button>

        <span className="text-xs font-mono font-bold text-[#E50914] bg-neutral-900 border border-neutral-800 px-3 py-1 rounded">
          MODULE {currentLessonIndex + 1} OF {course.lessons.length}
        </span>
      </div>

      {/* Screen Frame Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Aspect: Player Console */}
        <div className="lg:col-span-3 space-y-4">
          <div id="lecture-screen" className="relative aspect-video bg-[#0c0c0e] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl group">
            
            {/* Direct Embedded player layout (Standard YouTube SPA player frame) */}
            <iframe
              src={`https://www.youtube.com/embed/${lesson.videoUrl}?autoplay=1&enablejsapi=1&rel=0&mute=0`}
              title={lesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="no-referrer"
              allowFullScreen
            />

            {/* Simulated Watermark Accent */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-neutral-800/80 pointer-events-none select-none">
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-amber-500">APPRENTICE MODE</span>
            </div>
          </div>

          {/* Quick interactive player console bars */}
          <div className="bg-[#161617] rounded-xl p-5 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">SUBJECT: {course.category}</span>
                <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">{lesson.title}</h2>
              </div>

              {/* Status checkboxes */}
              <button
                onClick={handleToggleComplete}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-sans cursor-pointer transition select-none tracking-wide ${
                  isCompleted
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-[#E50914] text-white hover:bg-[#b8070f] shadow-lg"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isCompleted ? "Completed Lecture ✅" : "Mark as Completed"}</span>
              </button>
            </div>

            {/* Simulated interactive sliders & speed managers */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-800 text-xs font-medium font-mono text-gray-400">
              
              {/* Previous Next lecture switches */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentLessonIndex === 0}
                  className={`p-2 rounded-lg border flex items-center gap-1 transition ${
                    currentLessonIndex === 0
                      ? "opacity-40 cursor-not-allowed border-neutral-900"
                      : "border-neutral-800 bg-neutral-900 hover:bg-neutral-800 cursor-pointer text-neutral-100"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[10px] uppercase">Prev</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentLessonIndex === course.lessons.length - 1}
                  className={`p-2 rounded-lg border flex items-center gap-1 transition ${
                    currentLessonIndex === course.lessons.length - 1
                      ? "opacity-40 cursor-not-allowed border-neutral-900"
                      : "border-neutral-800 bg-neutral-900 hover:bg-neutral-850 cursor-pointer text-neutral-100"
                  }`}
                >
                  <span className="text-[10px] uppercase">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Multiplier speeds */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500 mr-1 tracking-wider uppercase font-extrabold">SPEED:</span>
                {[0.5, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                  <button
                    key={`speed-${spd}`}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      playbackSpeed === spd
                        ? "bg-amber-400 text-black shadow font-extrabold"
                        : "bg-neutral-900 hover:bg-neutral-800 text-gray-400"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Aspect: Side Syllabus Tracks */}
        <div className="space-y-4">
          <div className="bg-[#161617] rounded-xl p-4 border border-neutral-800 space-y-3 shadow-md max-h-[420px] overflow-y-auto">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-[#E50914] font-mono">Lectures Timeline</h3>
            
            <div className="space-y-2">
              {course.lessons.map((les, idx) => {
                const isActive = les._id === lesson._id;
                const userProgress = user.progress?.find((p) => p.courseId === course._id);
                const isLesCompleted = !!userProgress?.lessons?.find((l) => l.lessonId === les._id)?.isCompleted;

                return (
                  <div
                    key={`side-lec-${les._id}`}
                    onClick={() => {
                      syncProgress();
                      onLessonChange(les._id);
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition flex items-center justify-between gap-2 leading-relaxed ${
                      isActive
                        ? "bg-neutral-800/80 border-[#E50914]"
                        : isLesCompleted
                        ? "bg-neutral-900/30 border-green-950 hover:bg-neutral-900"
                        : "bg-neutral-950/20 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900"
                    }`}
                  >
                    <div>
                      <span className="block text-[9px] font-bold font-mono tracking-wider text-gray-500 uppercase">LECTURE {idx + 1}</span>
                      <span className={`block text-xs font-semibold truncate max-w-[140px] ${isActive ? "text-amber-400" : isLesCompleted ? "text-neutral-300" : "text-gray-400"}`}>
                        {les.title}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-[10px] font-mono text-gray-500">
                      <span>{les.duration}</span>
                      {isLesCompleted && <span className="text-green-500 ml-1">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#1E1916] rounded-xl p-4 border border-amber-950/40 text-xs text-gray-300 leading-normal flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>Finished with this lecture series? Return to curriculum and unlock the final comprehensive test!</span>
          </div>
        </div>

      </div>
    </div>
  );
}
