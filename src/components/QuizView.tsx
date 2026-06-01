/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Course, Quiz, User } from "../types";
import { motion } from "motion/react";
import { ChevronLeft, Award, RefreshCw, XCircle, CheckCircle2, ChevronRight, HelpCircle, Trophy } from "lucide-react";

interface QuizViewProps {
  user: User;
  course: Course;
  onBack: () => void;
  onQuizPassed: (updatedUser: User) => void;
}

export default function QuizView({ user, course, onBack, onQuizPassed }: QuizViewProps) {
  const quiz = course.quiz;

  // Catch non-existent quiz failsafe
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div id="no-quiz-card" className="max-w-md mx-auto text-center p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-white space-y-4">
        <HelpCircle className="w-12 h-12 text-[#E50914] mx-auto" />
        <h3 className="text-lg font-bold">Curriculum Evaluation Locked</h3>
        <p className="text-gray-400 text-xs">The quiz syllabus for this course is being compiled by faculty. Please return momentarily.</p>
        <button onClick={onBack} className="bg-[#E50914] hover:bg-[#b8070f] font-bold py-2 px-4 rounded text-xs transition cursor-pointer">
          Confirm Back
        </button>
      </div>
    );
  }

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    savedScore: number;
    correct: number;
    total: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;

  const handleSelectOption = (optIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIndex
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          courseId: course._id,
          quizId: quiz._id,
          answers: selectedAnswers
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Quiz submission aborted.");
      }

      setResult({
        passed: data.passed,
        savedScore: data.savedScore,
        correct: data.correct,
        total: data.total
      });
      setIsSubmitted(true);
      if (data.passed) {
        onQuizPassed(data.userState);
      }
    } catch (err) {
      console.error("Evaluation submitting caught error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const restartQuizState = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setResult(null);
  };

  const allAnswered = Object.keys(selectedAnswers).length === totalQuestions;

  // View rendered Results Module
  if (isSubmitted && result) {
    return (
      <div id="quiz-results-screen" className="max-w-md mx-auto bg-[#161617] p-8 rounded-2xl border border-neutral-800 text-center space-y-6 text-white font-sans">
        
        {result.passed ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <span className="text-xxs font-mono uppercase tracking-wider text-green-500 font-extrabold bg-[#181C19] border border-green-950 px-2.5 py-1 rounded">
                SCORE RATIO PASSED ✓
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white mt-3">Course Passed!</h2>
              <p className="text-gray-400 text-xs">Congratulations! Your score of {result.savedScore}% satisfies the certifications guidelines.</p>
            </div>

            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-850 flex justify-around text-xs font-mono">
              <div>
                <span className="block text-[10px] text-gray-500">CORRECT</span>
                <span className="text-lg font-bold text-white">{result.correct} / {result.total}</span>
              </div>
              <div className="border-r border-neutral-800 h-8 self-center"></div>
              <div>
                <span className="block text-[10px] text-gray-500">SCORE</span>
                <span className="text-lg font-bold text-amber-400">{result.savedScore}%</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onBack}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-[#121212] font-semibold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition select-none flex items-center justify-center gap-1"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Get Certificate</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xxs font-mono uppercase tracking-wider text-red-500 font-extrabold bg-red-500/5 border border-red-500/10 px-2.5 py-1 rounded">
                RE-TAKE REQUIRED
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white mt-3">Evaluation Incomplete</h2>
              <p className="text-gray-400 text-xs">You scored {result.savedScore}%. A minimum correct ratio of 70% is required to trigger authorization.</p>
            </div>

            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-850 flex justify-around text-xs font-mono">
              <div>
                <span className="block text-[10px] text-gray-500">REQUIRED</span>
                <span className="text-lg font-bold text-white">70%</span>
              </div>
              <div className="border-r border-neutral-800 h-8 self-center"></div>
              <div>
                <span className="block text-[10px] text-gray-500">YOUR SCORE</span>
                <span className="text-lg font-bold text-red-400">{result.savedScore}%</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={restartQuizState}
                className="flex-1 bg-neutral-800 hover:bg-neutral-750 text-white font-semibold py-2.5 px-4 rounded-xl text-xs cursor-pointer border border-neutral-700 transition"
              >
                Retry Questions
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-[#E50914] hover:bg-[#b8070f] text-white font-semibold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition"
              >
                Review Lectures
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="quiz-question-shell" className="max-w-2xl mx-auto space-y-6 text-white font-sans pb-24 select-none">
      
      {/* Quiz Upper Grid */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-xs tracking-wide cursor-pointer transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Evaluation</span>
        </button>

        <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded">
          QUESTION {currentIdx + 1} OF {totalQuestions}
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#E50914] h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Examination Question Box */}
      <div id="evaluation-card" className="bg-[#161617] rounded-xl p-6 md:p-8 border border-neutral-800 space-y-6">
        <span className="text-xxs font-mono text-gray-500 block">EXAM QUESTION</span>
        <h3 className="text-base md:text-lg font-bold text-neutral-100 leading-normal">
          {currentQuestion.questionText}
        </h3>

        {/* Dynamic Multiple Choice Options */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentIdx] === idx;
            return (
              <button
                key={`opt-${idx}`}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-xl border font-sans text-xs md:text-sm cursor-pointer transition leading-relaxed ${
                  isSelected
                    ? "bg-[#1C1613] border-amber-900/40 text-amber-400 font-semibold"
                    : "bg-[#0F0F10] border-neutral-850 hover:border-neutral-750 text-neutral-300 hover:text-neutral-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-5 h-5 rounded-full border text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? "border-amber-400 text-amber-400 bg-amber-400/5"
                      : "border-neutral-750 text-gray-500 bg-neutral-900"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Selector Action Bar */}
      <div className="flex items-center justify-between font-mono">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border flex items-center gap-1 transition ${
            currentIdx === 0
              ? "opacity-30 cursor-not-allowed border-neutral-900"
              : "border-neutral-800 bg-neutral-900 text-gray-300 hover:bg-neutral-850"
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>PREVIOUS</span>
        </button>

        {currentIdx < totalQuestions - 1 ? (
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentIdx] === undefined}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1 transition ${
              selectedAnswers[currentIdx] === undefined
                ? "opacity-30 cursor-not-allowed border-neutral-900 text-gray-500"
                : "border-neutral-800 bg-neutral-900 cursor-pointer text-gray-100 hover:bg-neutral-850"
            }`}
          >
            <span>NEXT QUESTION</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={!allAnswered || isLoading}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition tracking-wider flex items-center gap-1.5 ${
              allAnswered && !isLoading
                ? "bg-[#E50914] hover:bg-[#b8070f] cursor-pointer text-white shadow-lg"
                : "bg-neutral-900 cursor-not-allowed text-gray-600 border border-neutral-850"
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>SUBMIT EXAM</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
