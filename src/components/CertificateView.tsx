/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Course, User } from "../types";
import { ChevronLeft, Download, Award, ShieldCheck, Mail, Calendar, Sparkles } from "lucide-react";

interface CertificateViewProps {
  user: User;
  course: Course;
  onBack: () => void;
}

export default function CertificateView({ user, course, onBack }: CertificateViewProps) {
  const downloadUrl = `/api/certificate/download/${user._id}/${course._id}`;
  const currentDateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div id="awards-pinnacle" className="max-w-2xl mx-auto space-y-8 text-white font-sans pb-24 select-none">
      
      {/* Upper Navigation Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Syllabus</span>
      </button>

      {/* Decorative Congratulatory Frame Card */}
      <div id="certificate-honor-card" className="relative bg-[#161617]/90 rounded-2xl p-8 md:p-12 border border-amber-500/20 shadow-2xl space-y-6 text-center overflow-hidden">
        
        {/* Ambient Gold Sparkles */}
        <div className="absolute top-4 left-4 text-amber-500/40 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute bottom-4 right-4 text-[#E50914]/40 animate-pulse">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        {/* Big gold emblem icon */}
        <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xxs font-mono uppercase tracking-widest text-amber-500 font-extrabold block">
            FACULTY APPROVED CREDENCE
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Congratulations, {user.name}!
          </h2>
          <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
            You have successfully cleared the necessary milestones and examination evaluations to qualify for completion status.
          </p>
        </div>

        {/* Certificate preview snippet */}
        <div className="p-6 bg-[#0F0F10] rounded-xl border border-neutral-850 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#E50914]">CREDENTIAL VERIFIED</span>
            <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {currentDateStr}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-mono block uppercase">SUBJECT COURSEWARE</span>
            <span className="text-base font-bold text-white block">
              {course.title}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-mono leading-relaxed">
            <div>
              <span className="text-gray-500 block uppercase text-[9px]">Syllabus Faculty</span>
              <span className="text-gray-300 font-semibold">{course.instructor}</span>
            </div>
            <div>
              <span className="text-gray-500 block uppercase text-[9px]">Certification ID</span>
              <span className="text-gray-300 font-semibold uppercase">{course._id.substr(7)}-{user._id.substr(5)}</span>
            </div>
          </div>
        </div>

        {/* Direct Download anchors */}
        <div className="space-y-4 pt-3">
          <a
            href={downloadUrl}
            download={`certificate_${course._id}.pdf`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-xl hover:shadow-amber-500/5 transition transform hover:scale-[1.02] cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download High-Res PDF Certificate</span>
          </a>

          <div className="flex items-center justify-center gap-2 text-xxs font-mono text-gray-500 uppercase">
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
            <span>Digital Signature Verified Security License</span>
          </div>
        </div>

      </div>
    </div>
  );
}
